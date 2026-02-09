<template>
  <div class="pitch-tone-panel glass-panel">
    <h2 class="panel-title">石锋 T 值分析器</h2>

    <div v-if="hasPitchData" class="chart-section">
      <div class="chart-header">
        <h3 class="section-title">步骤 1: 框選基頻並標註</h3>
        <span class="hint-text">請使用鼠標在圖中框選一段穩定的音高區間</span>
      </div>
      <div ref="pitchChartContainer" class="chart-container"></div>
    </div>

    <div v-else class="no-data-message">
      <div class="no-data-icon">📊</div>
      <p>無基頻數據</p>
    </div>

    <div v-if="hasPitchData" class="controls-section glass-panel-inner">
      <div class="input-group">
        <div class="selection-info">
          <span v-if="currentSelection.length > 0" class="status-active">
            ✅ 已選取 {{ currentSelection.length }} 個點
          </span>
          <span v-else class="status-idle">等待框選...</span>
        </div>

        <input
            v-model="toneNameInput"
            type="text"
            placeholder="輸入調類名稱 (如: 陰平)"
            class="tone-input"
            @keyup.enter="saveTone"
        />
        <button
            class="action-btn add-btn"
            :disabled="currentSelection.length === 0 || !toneNameInput"
            @click="saveTone"
        >
          ➕ 加入列表
        </button>
      </div>

      <div class="saved-list-container">
        <div class="list-header">
          <span>已採集調類 ({{ savedTones.length }})</span>
          <button v-if="savedTones.length > 0" @click="clearAll" class="text-btn danger">清空全部</button>
        </div>

        <div class="tags-wrapper">
          <div v-for="(tone, index) in savedTones" :key="index" class="tone-tag">
            <span class="tag-name">{{ tone.name }}</span>
            <span class="tag-count">{{ tone.values.length }}pts</span>
            <button @click="removeTone(index)" class="close-tag">×</button>
          </div>
          <div v-if="savedTones.length === 0" class="empty-hint">暫無數據，請在上方圖表框選並添加</div>
        </div>
      </div>

      <div class="analyze-action">
        <button
            class="analyze-btn"
            :disabled="savedTones.length === 0"
            @click="performTValueAnalysis"
        >
          🚀 開始 T 值分析 ({{ savedTones.length }} 個調類)
        </button>
      </div>
    </div>

    <div v-if="tValueResults.length > 0" class="result-section">
      <h3 class="section-title">分析結果: 五度值曲線</h3>
      <div class="stats-info">
        <span>參考系上限 (Max): {{ globalStats.max.toFixed(1) }} Hz</span>
        <span>參考系下限 (Min): {{ globalStats.min.toFixed(1) }} Hz</span>
      </div>
      <div ref="tValueChartContainer" class="chart-container result-chart"></div>
    </div>

  </div>
</template>

<script setup>
import {computed, nextTick, onBeforeUnmount, onMounted, ref, watch} from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  results: { type: Object, required: true }
})

// === 狀態變量 ===
const pitchChartContainer = ref(null)
const tValueChartContainer = ref(null)
let pitchChart = null
let tValueChart = null

const toneNameInput = ref('')
const currentSelection = ref([]) // 當前框選的Hz數組
const savedTones = ref([])       // 已保存的調類列表 [{name, values:[]}]
const tValueResults = ref([])    // 計算後的T值結果
const globalStats = ref({ max: 0, min: 0 })

// 本地存儲 Key
const STORAGE_KEY = 'shifeng_analysis_data'

const hasPitchData = computed(() => {
  return props.results?.timeseries?.pitch_hz?.length > 0
})

// === 初始化與生命週期 ===
onMounted(() => {
  // 1. 從 LocalStorage 恢復數據
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    try {
      savedTones.value = JSON.parse(stored)
    } catch (e) {
      console.error('Failed to load tones', e)
    }
  }

  // 2. 初始化圖表
  if (hasPitchData.value) {
    initPitchChart()
  }
})

// 監聽數據變化自動保存
watch(savedTones, (newVal) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newVal))
}, { deep: true })

// === 1. 基頻圖表邏輯 (帶框選功能) ===
// === 1. 基頻圖表邏輯 (帶框選功能 + 音段顯示) ===
const initPitchChart = () => {
  if (!pitchChartContainer.value) return
  if (pitchChart) pitchChart.dispose()

  pitchChart = echarts.init(pitchChartContainer.value)

  const ts = props.results.timeseries
  // 構建數據 [時間, Hz]
  const rawData = ts.pitch_hz.map((v, i) => [ts.time?.[i] || i * 0.01, v])

  // --- 恢复原有逻辑：准备音段背景 (markArea) ---
  const segments = props.results.segments || []
  const markAreaData = segments.map(seg => [
    {
      xAxis: seg.start_s,
      itemStyle: {
        // 根据类型显示不同颜色
        color: seg.type === 'rime_core' ? 'rgba(255,215,0,0.2)' : // 金色 (韵核)
            seg.type === 'silence' ? 'rgba(200,200,200,0.1)' : // 灰色 (静音)
                'rgba(100,150,255,0.15)'                           // 蓝色 (其他)
      }
    },
    { xAxis: seg.end_s }
  ])

  const option = {
    title: {
      text: '基頻軌跡與選取',
      left: 'center',
      textStyle: { fontSize: 14, color: '#666' }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' } // 恢复十字准星
    },
    // --- 关键：保留 Toolbox 里的 Brush 工具 ---
    toolbox: {
      right: 20,
      feature: {
        brush: { type: ['lineX'], title: { lineX: '框選區域' } }, // 只有横向框选
        dataZoom: { title: { zoom: '縮放', back: '還原' } },
        restore: { title: '重置' }
      }
    },
    // --- 关键：Brush 配置 ---
    brush: {
      xAxisIndex: 0,
      throttleType: 'debounce',
      throttleDelay: 300,
      transformable: true, // 允许调整选框大小
      brushStyle: { borderWidth: 1, color: 'rgba(255,0,0,0.1)', borderColor: '#ff4d4f' }
    },
    xAxis: {
      type: 'value',
      name: '時間 (秒)',
      min: 'dataMin',
      max: 'dataMax'
    },
    yAxis: {
      type: 'value',
      name: '基頻 (Hz)',
      scale: true // 让Y轴不从0开始，聚焦数据变化
    },
    series: [{
      name: '基頻',
      type: 'line',
      data: rawData,
      symbol: 'none', // 不显示小圆点，保持线条流畅
      smooth: true,   // 平滑曲线
      lineStyle: { color: '#007aff', width: 2 }, // 恢复原本的蓝色线条

      // --- 关键：恢复 markArea ---
      markArea: markAreaData.length > 0 ? {
        data: markAreaData,
        silent: true // 重要：设置为 true，让背景色块不干扰鼠标框选
      } : undefined
    }]
  }

  pitchChart.setOption(option)

  // === 監聽框選事件 (保持不變) ===
  pitchChart.on('brushSelected', (params) => {
    const brushComponent = params.batch[0]

    if (!brushComponent || !brushComponent.selected || brushComponent.selected.length === 0) {
      currentSelection.value = []
      return
    }

    const dataIndices = brushComponent.selected[0].dataIndex
    if (dataIndices && dataIndices.length > 0) {
      currentSelection.value = dataIndices
          .map(idx => rawData[idx][1])
          .filter(v => v !== null && v > 0)
    } else {
      currentSelection.value = []
    }
  })
}
// === 2. 數據管理邏輯 ===
const saveTone = () => {
  if (!toneNameInput.value || currentSelection.value.length === 0) return

  savedTones.value.push({
    name: toneNameInput.value,
    values: [...currentSelection.value] // 深拷貝
  })

  // 重置輸入
  toneNameInput.value = ''
  // 清除圖表上的選框
  pitchChart.dispatchAction({
    type: 'brush',
    areas: []
  })
  currentSelection.value = []
}

const removeTone = (index) => {
  savedTones.value.splice(index, 1)
}

const clearAll = () => {
  if (confirm('確定要清空所有已保存的調類嗎？')) {
    savedTones.value = []
    localStorage.removeItem(STORAGE_KEY)
    tValueResults.value = [] // 也清空結果
  }
}

// === 3. 石鋒 T 值分析算法 ===
const performTValueAnalysis = () => {
  if (savedTones.value.length === 0) return

  // A. 計算全域 Max 和 Min (基於所有採集的數據)
  // 將所有調類的所有採樣點合併成一個大數組
  const allValues = savedTones.value.flatMap(t => t.values)

  // 簡單過濾異常值 (可選: 使用四分位數過濾極端值)
  const maxHz = Math.max(...allValues)
  const minHz = Math.min(...allValues)

  globalStats.value = { max: maxHz, min: minHz }

  // B. 計算每個調類的 T 值曲線
  // 公式: T = [(lgX - lgMin) / (lgMax - lgMin)] * 5
  const lgMin = Math.log10(minHz)
  const lgMax = Math.log10(maxHz)
  const denominator = lgMax - lgMin // 分母

  tValueResults.value = savedTones.value.map(tone => {
    // 將該調類的每個 Hz 點轉換為 T 值
    const tValues = tone.values.map(hz => {
      const lgX = Math.log10(hz)
      let T = ((lgX - lgMin) / denominator) * 5
      // 限制在 0-5 之間
      return Math.max(0, Math.min(5, T))
    })

    // 為了圖表平滑，我們可以對 T 值做簡單的移動平均，這裡暫時直接輸出
    // 我們需要為每個 T 值生成一個虛擬的時間軸 (0% - 100%) 方便歸一化對比
    const normalizedData = tValues.map((val, idx) => {
      const percent = (idx / (tValues.length - 1)) * 100
      return [percent, val]
    })

    return {
      name: tone.name,
      data: normalizedData
    }
  })

  // C. 分析後清空 LocalStorage (根據需求)
  localStorage.removeItem(STORAGE_KEY)
  // 注意：我們保留了 savedTones 變量在內存中，以便用戶還能看到剛剛分析的是什麼
  // 如果想徹底清空，可以 uncomment 下面這行：
  // savedTones.value = []

  // D. 渲染結果圖
  nextTick(() => {
    initTValueChart()
  })
}

const initTValueChart = () => {
  if (!tValueChartContainer.value) return
  if (tValueChart) tValueChart.dispose()

  tValueChart = echarts.init(tValueChartContainer.value)

  const series = tValueResults.value.map(res => ({
    name: res.name,
    type: 'line',
    data: res.data, // [百分比, T值]
    smooth: true,
    showSymbol: false,
    lineStyle: { width: 3 }
  }))

  const option = {
    title: { text: '石鋒 T 值曲線 (歸一化時長)', left: 'center' },
    tooltip: { trigger: 'axis' },
    legend: { bottom: 0 },
    grid: { top: 50, bottom: 60, left: 50, right: 30 },
    xAxis: {
      type: 'value',
      name: '時長 (%)',
      min: 0,
      max: 100,
      axisLabel: { formatter: '{value}%' }
    },
    yAxis: {
      type: 'value',
      name: '五度值 (T)',
      min: 0,
      max: 5,
      interval: 1, // 刻度為 1
      splitLine: { show: true }
    },
    series: series
  }

  tValueChart.setOption(option)
}

// Resize Observer logic (simplified)
let resizeObserver = null
onMounted(() => {
  resizeObserver = new ResizeObserver(() => {
    pitchChart?.resize()
    tValueChart?.resize()
  })
  if (pitchChartContainer.value) resizeObserver.observe(pitchChartContainer.value)
})
onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  pitchChart?.dispose()
  tValueChart?.dispose()
})
</script>

<style scoped>
.pitch-tone-panel {
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.chart-container {
  width: 100%;
  height: 350px;
  background: white;
  border-radius: var(--radius-md);
  padding: 0.5rem;
  border: 1px solid rgba(0,0,0,0.05);
}

.result-chart {
  height: 400px; /* 結果圖稍微高一點 */
}

/* 控制面板樣式 */
.controls-section {
  display: grid;
  grid-template-columns: 1fr 1fr; /* 左右分欄 */
  gap: 1.5rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.4);
  border-radius: var(--radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.6);
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.selection-info {
  font-size: 0.9rem;
  font-weight: 500;
}

.status-active { color: var(--color-success); }
.status-idle { color: var(--color-text-secondary); }

.tone-input {
  padding: 0.6rem 1rem;
  border: 1px solid rgba(0,0,0,0.1);
  border-radius: var(--radius-md);
  font-size: 1rem;
}

.action-btn {
  padding: 0.6rem;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.add-btn {
  background: var(--color-primary);
  color: white;
}
.add-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.saved-list-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.list-header {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.text-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.85rem;
  text-decoration: underline;
}
.text-btn.danger { color: var(--color-error); }

.tags-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  max-height: 120px;
  overflow-y: auto;
}

.tone-tag {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: white;
  padding: 0.3rem 0.6rem;
  border-radius: var(--radius-full);
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  font-size: 0.9rem;
}

.tag-name { font-weight: 600; color: var(--color-primary); }
.tag-count { font-size: 0.75rem; color: #999; }
.close-tag {
  border: none;
  background: none;
  color: #999;
  cursor: pointer;
  font-size: 1.1rem;
  line-height: 1;
}
.close-tag:hover { color: var(--color-error); }

.analyze-action {
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  margin-top: 0.5rem;
}

.analyze-btn {
  background: linear-gradient(90deg, #007aff, #5856d6);
  color: white;
  border: none;
  padding: 0.8rem 3rem;
  border-radius: var(--radius-full);
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
  transition: transform 0.2s;
}

.analyze-btn:hover { transform: translateY(-2px); }
.analyze-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

.stats-info {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  font-family: monospace;
}
</style>
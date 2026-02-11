<template>
  <div class="pitch-tone-panel glass-panel">
    <h2 class="panel-title" style="margin:0">石峰 T 值分析器</h2>

    <!-- Step 1: Select and Label -->
    <div v-if="hasPitchData" class="step-section">
      <div class="step-header">
        <span class="step-number">1</span>
        <div class="step-info">
          <h3 class="step-title">框選基頻並標註</h3>
          <span class="step-hint">直接在圖中拖動鼠標框選一段穩定的音高區間（橫向框選）</span>
        </div>
      </div>

      <div ref="pitchChartContainer" class="chart-container"></div>

      <div class="controls-section glass-panel-inner">
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
              <span class="tag-count">{{ getToneSegmentCount(tone) }} 段</span>
              <button @click="removeTone(index)" class="close-tag">×</button>
            </div>
            <div v-if="savedTones.length === 0" class="empty-hint">暫無數據，請在上方圖表框選並添加</div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="no-data-message">
      <div class="no-data-icon">📊</div>
      <p>請先上傳音頻並完成 Praat 分析</p>
    </div>

    <!-- Step 2: Analyze -->
    <div v-if="hasPitchData && savedTones.length > 0" class="step-section">
      <div class="step-header">
        <span class="step-number">2</span>
        <div class="step-info">
          <h3 class="step-title">開始 T 值分析</h3>
          <span class="step-hint">計算並生成各調類的五度值曲線</span>
        </div>
      </div>

      <div class="analyze-action">
        <button
            class="analyze-btn"
            @click="performTValueAnalysis"
        >
          🚀 開始分析 ({{ savedTones.length }} 個調類)
        </button>
      </div>
    </div>

    <!-- Step 3: Results -->
    <div v-if="tValueResults.length > 0" class="step-section">
      <div class="step-header">
        <span class="step-number">3</span>
        <div class="step-info">
          <h3 class="step-title">分析結果</h3>
          <span class="step-hint">五度值曲線（保留原始時長，對齊起點）</span>
        </div>
      </div>

      <div class="stats-info">
        <span>參考系上限: {{ globalStats.max.toFixed(1) }} Hz</span>
        <span>參考系下限: {{ globalStats.min.toFixed(1) }} Hz</span>
      </div>
      <div ref="tValueChartContainer" class="chart-container result-chart"></div>
    </div>

  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  results: { type: Object, default: null }
})

// === 狀態變量 ===
const pitchChartContainer = ref(null)
const tValueChartContainer = ref(null)
let pitchChart = null
let tValueChart = null
let resizeObserver = null

const toneNameInput = ref('')
const currentSelection = ref([]) // 當前框選的Hz數組
const savedTones = ref([])       // 已保存的調類列表 [{name, segments:[[]]}]
const tValueResults = ref([])    // 計算後的T值結果
const globalStats = ref({ max: 0, min: 0 })

// 本地存儲 Key
const STORAGE_KEY = 'shifeng_analysis_data'

const hasPitchData = computed(() => {
  return props.results && props.results.timeseries && props.results.timeseries.pitch_hz && props.results.timeseries.pitch_hz.length > 0
})

// Helper function to safely get segment count
const getToneSegmentCount = (tone) => {
  if (!tone) return 0
  if (tone.segments && Array.isArray(tone.segments)) {
    return tone.segments.length
  }
  // Old format fallback
  if (tone.values && Array.isArray(tone.values)) {
    return 1
  }
  return 0
}

// === 初始化與生命週期 ===
onMounted(() => {
  console.log('[PitchTone] Component mounted')
  console.log('[PitchTone] hasPitchData:', hasPitchData.value)
  console.log('[PitchTone] props.results:', props.results)

  // 1. 從 LocalStorage 恢復數據 (支持舊格式遷移)
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    try {
      const data = JSON.parse(stored)

      // Migration: Convert old format to new format
      if (Array.isArray(data) && data.length > 0) {
        savedTones.value = data.map(tone => {
          // Check if it's old format (has 'values' property)
          if (tone.values && !tone.segments) {
            return {
              name: tone.name,
              segments: [tone.values]  // Wrap in array
            }
          }
          // Already new format or ensure segments exists
          return {
            name: tone.name,
            segments: tone.segments || []
          }
        })
      }
    } catch (e) {
      console.error('Failed to load tones', e)
      // Clear corrupted data
      localStorage.removeItem(STORAGE_KEY)
      savedTones.value = []
    }
  }

  // 2. 初始化圖表 (在 nextTick 中确保 DOM 已挂载)
  nextTick(() => {
    console.log('[PitchTone] nextTick: Checking for pitch data...')
    console.log('[PitchTone] pitchChartContainer.value:', pitchChartContainer.value)
    if (hasPitchData.value) {
      console.log('[PitchTone] Has pitch data, initializing chart...')
      initPitchChart()
    } else {
      console.log('[PitchTone] No pitch data available')
    }

    // 3. Setup ResizeObserver (在 nextTick 中确保容器已存在)
    resizeObserver = new ResizeObserver(() => {
      // 使用 auto 参数强制重新计算宽度
      pitchChart?.resize({ width: 'auto', height: 'auto' })
      tValueChart?.resize({ width: 'auto', height: 'auto' })
    })

    if (pitchChartContainer.value) {
      // console.log('Setting up ResizeObserver for pitch chart')
      resizeObserver.observe(pitchChartContainer.value)
    }

  })
})

// Cleanup on unmount
onBeforeUnmount(() => {
  // console.log('Component unmounting, cleaning up...')
  resizeObserver?.disconnect()
  pitchChart?.dispose()
  tValueChart?.dispose()
})

// 監聽數據變化自動保存
watch(savedTones, (newVal) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newVal))
}, { deep: true })

// 監聽 props.results 變化，重新初始化圖表
watch(() => props.results, (newVal) => {
  console.log('[PitchTone] props.results changed:', newVal)
  if (newVal && newVal.timeseries && newVal.timeseries.pitch_hz) {
    nextTick(() => {
      console.log('[PitchTone] Re-initializing chart due to data change')
      initPitchChart()
    })
  }
}, { deep: true })

// === 1. 基頻圖表邏輯 (帶框選功能) ===
const initPitchChart = () => {
  console.log('[PitchTone] initPitchChart called')
  console.log('[PitchTone] pitchChartContainer.value:', pitchChartContainer.value)

  if (!pitchChartContainer.value) {
    console.error('[PitchTone] pitchChartContainer is null!')
    return
  }

  if (pitchChart) pitchChart.dispose()

  // === 关键修复: 重新绑定 ResizeObserver ===
  if (resizeObserver) {
    // 先断开旧的监听，防止内存泄漏
    resizeObserver.disconnect()
    // 重新监听当前的 DOM 元素
    resizeObserver.observe(pitchChartContainer.value)
    // 如果 T 值图表容器存在，也加入监听
    if (tValueChartContainer.value) {
      resizeObserver.observe(tValueChartContainer.value)
    }
  }

  console.log('[PitchTone] Initializing ECharts...')
  pitchChart = echarts.init(pitchChartContainer.value)
  console.log('[PitchTone] ECharts initialized:', pitchChart)

  const ts = props.results.timeseries
  if (!ts || !ts.pitch_hz) {
    console.error('[PitchTone] No pitch data available')
    return
  }

  console.log('[PitchTone] Pitch data points:', ts.pitch_hz.length)

  // 構建數據 [時間, Hz]
  const rawData = ts.pitch_hz.map((v, i) => [ts.time?.[i] || i * 0.01, v])

  // 準備音段背景 (markArea)
  const segments = props.results.segments || []
  const markAreaData = segments.map(seg => [
    {
      xAxis: seg.start_s,
      itemStyle: {
        color: seg.type === 'rime_core' ? 'rgba(255,215,0,0.2)' :
            seg.type === 'silence' ? 'rgba(200,200,200,0.1)' :
                'rgba(100,150,255,0.15)'
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
      axisPointer: { type: 'cross' }
    },
    toolbox: {
      right: 20,
      feature: {
        dataZoom: { title: { zoom: '縮放', back: '還原' } },
        restore: { title: '重置' }
      }
    },
    brush: {
      toolbox: ['lineX'],  // 启用横向框选
      xAxisIndex: 0,
      throttleType: 'debounce',
      throttleDelay: 300,
      transformable: true,
      brushStyle: { borderWidth: 2, color: 'rgba(142,20,34,0.15)', borderColor: '#e24a57' }
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
      scale: true
    },
    series: [{
      name: '基頻',
      type: 'line',
      data: rawData,
      symbol: 'none',
      smooth: true,
      lineStyle: { color: '#007aff', width: 2 },
      markArea: markAreaData.length > 0 ? {
        data: markAreaData,
        silent: true
      } : undefined
    }]
  }

  pitchChart.setOption(option)

  // 强制 resize 确保图表尺寸正确，使用 auto 参数
  setTimeout(() => {
    pitchChart?.resize({ width: 'auto', height: 'auto' })
    console.log('[PitchTone] Chart resized with auto dimensions')
  }, 100)

  // console.log('Pitch chart initialized, activating brush mode...')

  // 默认激活框选模式
  pitchChart.dispatchAction({
    type: 'takeGlobalCursor',
    key: 'brush',
    brushOption: {
      brushType: 'lineX',
      brushMode: 'single'
    }
  })

  // console.log('Brush mode activated')

  // 監聽框選事件
  pitchChart.on('brushSelected', (params) => {
    // console.log('=== brushSelected event triggered ===')

    const brushComponent = params.batch[0]
    if (!brushComponent || !brushComponent.areas || brushComponent.areas.length === 0) {
      // console.log('No valid brush selection')
      currentSelection.value = []
      return
    }

    // Get the time range from brush area
    const area = brushComponent.areas[0]
    const coordRange = area.coordRange || area.coordRanges?.[0]

    if (!coordRange || coordRange.length !== 2) {
      // console.log('No valid coordRange')
      currentSelection.value = []
      return
    }

    const [startTime, endTime] = coordRange
    // console.log('Selected time range:', startTime, 'to', endTime)

    // Manually filter data points within the time range
    const selectedValues = rawData
      .filter(([time, hz]) => time >= startTime && time <= endTime && hz !== null && hz > 0)
      .map(([time, hz]) => hz)

    currentSelection.value = selectedValues
    // console.log('✅ Selected Hz values:', currentSelection.value.length, 'points')
    // console.log('First few values:', currentSelection.value.slice(0, 5))
  })
}

// === 2. 數據管理邏輯 ===
const saveTone = () => {
  if (!toneNameInput.value || currentSelection.value.length === 0) return

  // Check if tone class already exists
  const existingTone = savedTones.value.find(t => t.name === toneNameInput.value)

  if (existingTone) {
    // Add to existing tone class
    existingTone.segments.push([...currentSelection.value])
  } else {
    // Create new tone class
    savedTones.value.push({
      name: toneNameInput.value,
      segments: [[...currentSelection.value]]
    })
  }

  // 重置輸入
  toneNameInput.value = ''
  // 清除圖表上的選框
  if (pitchChart) {
    pitchChart.dispatchAction({
      type: 'brush',
      areas: []
    })
  }
  currentSelection.value = []
}

const removeTone = (index) => {
  savedTones.value.splice(index, 1)
}

const clearAll = () => {
  if (confirm('確定要清空所有已保存的調類嗎？')) {
    savedTones.value = []
    localStorage.removeItem(STORAGE_KEY)
    // Do NOT clear tValueResults - keep analysis results visible
  }
}

// === 3. 石峰 T 值分析算法 ===
const performTValueAnalysis = () => {
  if (savedTones.value.length === 0) return

  // A. Calculate global statistics from ALL collected segments
  const allValues = savedTones.value.flatMap(t => t.segments.flat())

  if (allValues.length === 0) {
    alert('沒有有效的數據點')
    return
  }

  // ✅ 使用真實的最大/最小值作為參考系上下限
  const ceiling = Math.max(...allValues)
  const floor = Math.min(...allValues)

  // 計算均值和標準差（用於日誌輸出）
  const mean = allValues.reduce((sum, v) => sum + v, 0) / allValues.length
  const variance = allValues.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / allValues.length
  const sd = Math.sqrt(variance)

  console.log('Statistics:', { mean, sd, ceiling, floor, realMax: ceiling, realMin: floor })

  globalStats.value = { max: ceiling, min: floor }

  // B. Calculate T-values for each tone class
  const lgMin = Math.log10(floor)
  const lgMax = Math.log10(ceiling)
  const denominator = lgMax - lgMin

  // ✅ 修复：调值范围改为 1~5（传统五度值）
  // Helper: Convert Hz array to T-value array
  const hzToTValues = (hzArray) => {
    return hzArray.map(hz => {
      const lgX = Math.log10(hz)
      let T = ((lgX - lgMin) / denominator) * 4 + 1  // 映射到 [1, 5]
      return Math.max(1, Math.min(5, T))  // Clamp to [1, 5]
    })
  }

  // ✅ 修复：计算采样间隔（用于保留真实时长）
  const ts = props.results?.timeseries
  let samplingInterval = 0.01 // 默认 10ms
  if (ts && ts.time && ts.time.length > 1) {
    // 计算平均采样间隔（秒）
    samplingInterval = (ts.time[ts.time.length - 1] - ts.time[0]) / (ts.time.length - 1)
  }
  const samplingIntervalMs = samplingInterval * 1000  // 转换为毫秒

  console.log('Sampling interval:', samplingIntervalMs, 'ms')

  // C. Process each tone class
  tValueResults.value = savedTones.value.map(tone => {
    // ✅ 修复：不再归一化时长，保留原始点数
    // Convert each segment to T-values (keep original length)
    const tValueSegments = tone.segments.map(hzSegment => {
      return hzToTValues(hzSegment)  // 不再调用 normalizeLength
    })

    // 找出最长的音段，用于对齐
    const maxLength = Math.max(...tValueSegments.map(seg => seg.length))

    // Average across all segments at each position (对齐到最长音段)
    const avgTValues = []
    for (let i = 0; i < maxLength; i++) {
      let sum = 0
      let count = 0
      for (const seg of tValueSegments) {
        if (i < seg.length) {
          sum += seg[i]
          count++
        }
      }
      avgTValues.push(count > 0 ? sum / count : null)
    }

    // ✅ 修复：使用真实时间（毫秒）而不是百分比
    // Convert to chart data format [time_ms, T-value]
    const chartData = avgTValues.map((val, idx) => {
      const timeMs = idx * samplingIntervalMs  // 真实时间（毫秒）
      return [timeMs, val]
    }).filter(([time, val]) => val !== null)  // 过滤掉无效点

    return {
      name: tone.name,
      data: chartData
    }
  })

  // D. Do NOT clear localStorage automatically
  // User will manually clear using the "清空" button

  // E. Render results chart
  nextTick(() => {
    initTValueChart()
  })
}

const initTValueChart = () => {
  if (!tValueChartContainer.value) return
  if (tValueChart) tValueChart.dispose()

  // === 重新绑定 ResizeObserver ===
  if (resizeObserver && tValueChartContainer.value) {
    resizeObserver.observe(tValueChartContainer.value)
  }

  tValueChart = echarts.init(tValueChartContainer.value)

  const series = tValueResults.value.map(res => ({
    name: res.name,
    type: 'line',
    data: res.data,
    smooth: true,
    showSymbol: false,
    lineStyle: { width: 3 }
  }))

  const option = {
    title: { text: '石峰 T 值曲線', left: 'center' },
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        let result = `時間: ${params[0].value[0].toFixed(1)} ms<br/>`
        params.forEach(param => {
          result += `${param.seriesName}: ${param.value[1].toFixed(2)}<br/>`
        })
        return result
      }
    },
    legend: { bottom: 0 },
    grid: { top: 50, bottom: 60, left: 60, right: 30 },
    xAxis: {
      type: 'value',
      name: '時間 (ms)',
      min: 0,
      axisLabel: { formatter: '{value}' }
    },
    yAxis: {
      type: 'value',
      name: '五度值 (T)',
      min: 1,
      max: 5,
      interval: 1,
      splitLine: { show: true }
    },
    series: series
  }

  tValueChart.setOption(option)

  // 强制 resize 确保 T 值图表尺寸正确
  setTimeout(() => {
    tValueChart?.resize({ width: 'auto', height: 'auto' })
  }, 100)
}
</script>

<style scoped>
.pitch-tone-panel {
  padding: 1.5rem;
  margin: 0 auto 1.5rem auto;
  max-width: 1200px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

@media (max-aspect-ratio: 1/1) {
  .pitch-tone-panel{
    padding:0.5rem;
  }
  .controls-section{
    display: flex!important;
    flex-direction: column;
  }
}

.panel-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--color-text-primary, #2c3e50);
  margin: 0 0 1rem 0;
  text-align: center;
}

/* Step Section */
.step-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 96%;
  min-width: 0; /* 防止 Flex 子项坍塌 */
  box-sizing: border-box;
}

.step-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.step-number {
  flex-shrink: 0;
  width: 2.5rem;
  height: 2.5rem;
  background: linear-gradient(135deg, #007aff, #5856d6);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(0, 122, 255, 0.3);
}

.step-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  align-items: center;
}

.step-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--color-text-primary, #2c3e50);
  margin: 0;
}

.step-hint {
  font-size: 0.9rem;
  color: var(--color-text-secondary, #666);
}

.chart-container {
  width: 100%;
  height: 350px;
  background: white;
  border-radius: var(--radius-md, 8px);
  padding: 0.5rem;
  border: 1px solid rgba(0,0,0,0.05);
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  position: relative; /* 确保 ECharts 定位准确 */
  overflow: hidden;   /* 防止内容溢出 */
  box-sizing: border-box; /* 包含 padding */
}

.result-chart {
  height: 400px;
}

.no-data-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: var(--color-text-secondary, #666);
  background: rgba(255, 255, 255, 0.5);
  border-radius: var(--radius-lg, 12px);
  border: 2px dashed rgba(0,0,0,0.1);
}

.no-data-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

/* 控制面板樣式 */
.controls-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.5);
  border-radius: var(--radius-lg, 12px);
  border: 1px solid rgba(255, 255, 255, 0.8);
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.selection-info {
  font-size: 0.95rem;
  font-weight: 600;
  min-height: 1.5rem;
}

.status-active {
  color: var(--color-success, #50c878);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.status-idle {
  color: var(--color-text-secondary, #999);
  font-weight: 500;
}

.tone-input {
  padding: 0.7rem 1rem;
  border: 2px solid rgba(0,0,0,0.1);
  border-radius: var(--radius-md, 8px);
  font-size: 1rem;
  transition: all 0.2s;
}

.tone-input:focus {
  outline: none;
  border-color: var(--color-primary, #4a90e2);
  box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
}

.action-btn {
  padding: 0.7rem;
  border: none;
  border-radius: var(--radius-md, 8px);
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.2s;
}

.add-btn {
  background: var(--color-primary, #4a90e2);
  color: white;
  box-shadow: 0 2px 6px rgba(74, 144, 226, 0.3);
}

.add-btn:hover:not(:disabled) {
  background: #3a7bc8;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(74, 144, 226, 0.4);
}

.add-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  box-shadow: none;
}

.saved-list-container {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-text-primary, #2c3e50);
}

.text-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.85rem;
  text-decoration: underline;
  transition: opacity 0.2s;
}

.text-btn:hover {
  opacity: 0.7;
}

.text-btn.danger {
  color: var(--color-error, #e74c3c);
  font-weight: 600;
}

.tags-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  max-height: 140px;
  overflow-y: auto;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.5);
  border-radius: var(--radius-md, 8px);
}

.tone-tag {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: white;
  padding: 0.4rem 0.8rem;
  border: 2px solid rgba(0,0,0,0.5);
  border-radius: var(--radius-2xl);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  font-size: 0.95rem;
  transition: all 0.2s;
}

.tone-tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.tag-name {
  font-weight: 700;
  color: var(--color-primary, #4a90e2);
}

.tag-count {
  font-size: 0.8rem;
  color: #666;
  font-weight: 600;
}

.close-tag {
  border: none;
  background: none;
  color: #999;
  cursor: pointer;
  font-size: 1.2rem;
  line-height: 1;
  padding: 0;
  width: 1.2rem;
  height: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.close-tag:hover {
  color: var(--color-error, #e74c3c);
  transform: scale(1.2);
}

.empty-hint {
  color: var(--color-text-secondary, #999);
  font-size: 0.9rem;
  font-style: italic;
  text-align: center;
  padding: 1rem;
}

.analyze-action {
  display: flex;
  justify-content: center;
  padding: 1rem 0;
}

.analyze-btn {
  background: linear-gradient(135deg, #007aff, #5856d6);
  color: white;
  border: none;
  padding: 1rem 3rem;
  border-radius: var(--radius-2xl);
  font-size: 1.2rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(0, 122, 255, 0.4);
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}

.analyze-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  transition: left 0.5s;
}

.analyze-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 122, 255, 0.5);
}

.analyze-btn:hover::before {
  left: 100%;
}

.analyze-btn:active {
  transform: translateY(0);
}

.stats-info {
  display: flex;
  justify-content: center;
  gap: 3rem;
  margin-bottom: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.5);
  border-radius: var(--radius-md, 8px);
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-text-primary, #2c3e50);
  font-family: 'Courier New', monospace;
}
</style>

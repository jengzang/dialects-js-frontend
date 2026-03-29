<template>
  <div class="evolution-page">
    <!-- 控制面板 -->
    <div class="main-glass-panel" data-panel="control">
      <!-- 统计模式选择 -->
      <div class="control-row">
        <label class="control-label">{{ t('phonology.phonology.evolution.queryMode.label', '统计模式') }}：</label>
        <div class="mode-selector">
          <label class="mode-radio-label">
            <input
              type="radio"
              value="by_value"
              v-model="queryMode"
              class="hidden-radio"
            />
            <span class="glass-indicator"></span>
            {{ t('phonology.phonology.evolution.queryMode.byValue') }}
          </label>
          <label class="mode-radio-label">
            <input
              type="radio"
              value="by_status"
              v-model="queryMode"
              class="hidden-radio"
            />
            <span class="glass-indicator"></span>
            {{ t('phonology.phonology.evolution.queryMode.byStatus') }}
          </label>
        </div>
      </div>

      <!-- 字符表和维度选择 -->
      <div class="dimension-grid">
        <div class="dimension-field">
          <label class="control-label dimension-label">{{ t('phonology.phonology.evolution.controls.table') }}：</label>
          <SimpleSelectDropdown
            v-model="selectedTable"
            :options="tableOptions"
            class="control-select dimension-select"
          />
        </div>

        <div class="dimension-field">
          <label class="control-label dimension-label">{{ t('phonology.phonology.evolution.controls.level1') }}：</label>
          <SimpleSelectDropdown
            v-model="level1Column"
            :options="availableColumns"
            :placeholder="t('phonology.phonology.evolution.controls.level1')"
            :disabled="!selectedTable"
            class="control-select dimension-select"
          />
        </div>

        <div class="dimension-field">
          <label class="control-label dimension-label">{{ t('phonology.phonology.evolution.controls.level2') }}：</label>
          <SimpleSelectDropdown
            v-model="level2Column"
            :options="level2Options"
            :placeholder="t('phonology.phonology.evolution.controls.level2')"
            :disabled="!level1Column"
            class="control-select dimension-select"
          />
        </div>
      </div>

      <!-- 地点输入 -->
      <div class="control-row">
        <!-- <label class="control-label">{{ t('phonology.phonology.evolution.controls.location') }}：</label> -->
        <div class="control-input-wrapper">
          <LocationMultiInput
            v-model="selectedLocations"
            :max-locations="1"
            class="control-input"
          />
          <div class="input-hint">{{ t('phonology.phonology.evolution.controls.locationHint') }}</div>
        </div>
      </div>

      <!-- 查询按钮 -->
      <div class="control-row control-row--query">
        <button
          @click="handleQuery"
          :disabled="isLoading || !canQuery"
          class="query-button"
        >
          {{ isLoading ? t('phonology.phonology.evolution.controls.loading') : t('phonology.phonology.evolution.controls.query') }}
        </button>
      </div>

      <!-- 错误提示 -->
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
    </div>

    <!-- Tab切换 -->
    <div v-if="rawData" class="feature-tabs">
      <button
        v-for="feature in features"
        :key="feature"
        @click="currentFeature = feature"
        :class="['feature-tab', { active: currentFeature === feature }]"
      >
        {{ feature }} ({{ pieCountByFeature[feature] || 0 }})
      </button>
    </div>

    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>{{ t('phonology.phonology.evolution.states.loading') }}</p>
    </div>

    <!-- 饼图展示区域 -->
    <div v-else-if="rawData && currentPieData.length > 0" class="pie-container">
      <div class="pie-grid" :style="gridStyle" ref="pieGridRef">
        <div
          v-for="(pie, index) in currentPieData"
          :key="index"
          class="pie-item"
          :data-index="index"
        >
          <div class="pie-chart" :data-pie-index="index"></div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else-if="rawData && currentPieData.length === 0" class="empty-state">
      <p>{{ t('phonology.phonology.evolution.states.empty') }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onUnmounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import * as echarts from 'echarts'
import SimpleSelectDropdown from '@/components/common/SimpleSelectDropdown.vue'
import LocationMultiInput from '../query/LocationMultiInput.vue'
import { postPhoPieByValue, postPhoPieByStatus } from '@/api/query/phoPie.js'
import { TABLE_COLUMN_SCHEMAS } from '../../config/chars_positions/characters.js'

const { t } = useI18n()

// ========== 响应式数据 ==========
// 查询参数
const queryMode = ref('by_value')
const selectedTable = ref('characters')
const level1Column = ref('')
const level2Column = ref('')
const selectedLocations = ref([])

// 查询状态
const isLoading = ref(false)
const errorMessage = ref('')
const rawData = ref(null)

// 当前展示
const features = ['聲母', '韻母', '聲調']
const currentFeature = ref('聲母')

// 饼图容器
const pieGridRef = ref(null)
const chartInstances = ref([])
const containerWidth = ref(1200)

// ========== 配置数据 ==========
const tableOptions = [
  { value: 'characters', label: '中古音（廣韻）' },
  { value: 'fenyun', label: '分韻撮要（粵語）' },
  { value: 'hongwu', label: '洪武正韻' },
  { value: 'menggu', label: '蒙古字韻' },
  { value: 'old_chinese', label: '上古音' },
  { value: 'zhongyuan', label: '中原音韻' }
]

// ========== 计算属性 ==========
const availableColumns = computed(() => {
  const schema = TABLE_COLUMN_SCHEMAS[selectedTable.value]
  const keys = schema?.ui?.available_keys || []
  // 转换为 SimpleSelectDropdown 需要的格式
  return keys.map(key => ({ label: key, value: key }))
})

const level2Options = computed(() => {
  return availableColumns.value.filter(option => option.value !== level1Column.value)
})

const currentPieData = computed(() => {
  if (!rawData.value?.data) return []
  return rawData.value.data[currentFeature.value] || []
})

const pieCountByFeature = computed(() => {
  if (!rawData.value?.data) return {}
  return {
    聲母: rawData.value.data.聲母?.length || 0,
    韻母: rawData.value.data.韻母?.length || 0,
    聲調: rawData.value.data.聲調?.length || 0
  }
})

const canQuery = computed(() => {
  return selectedLocations.value.length > 0 &&
         level1Column.value &&
         level2Column.value &&
         level1Column.value !== level2Column.value
})

const gridLayout = computed(() => {
  const pieCount = currentPieData.value.length
  if (pieCount === 0) return { cols: 0, rows: 0 }

  let cols
  if (pieCount <= 4) cols = 2
  else if (pieCount <= 9) cols = 3
  else if (pieCount <= 16) cols = 4
  else if (pieCount <= 25) cols = 5
  else cols = 6

  const rows = Math.ceil(pieCount / cols)
  return { cols, rows }
})

const pieSize = computed(() => {
  const { cols } = gridLayout.value
  if (cols === 0) return 200
  const containerW = containerWidth.value
  const gap = 20
  const size = (containerW - (cols + 1) * gap) / cols
  return Math.max(150, Math.min(250, size))
})

const gridStyle = computed(() => {
  const { cols } = gridLayout.value
  return {
    display: 'grid',
    gridTemplateColumns: `repeat(${cols}, ${pieSize.value}px)`,
    gap: '20px',
    padding: '20px',
    justifyContent: 'center'
  }
})

// ========== 查询方法 ==========
const handleQuery = async () => {
  if (!selectedLocations.value.length) {
    errorMessage.value = t('phonology.phonology.evolution.errors.minLocation')
    return
  }
  if (selectedLocations.value.length > 1) {
    errorMessage.value = t('phonology.phonology.evolution.errors.maxLocation')
    return
  }
  if (!level1Column.value || !level2Column.value) {
    errorMessage.value = t('phonology.phonology.evolution.errors.selectDimensions')
    return
  }
  if (level1Column.value === level2Column.value) {
    errorMessage.value = t('phonology.phonology.evolution.errors.sameDimensions')
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    const params = {
      locations: selectedLocations.value,
      level1_column: level1Column.value,
      level2_column: level2Column.value,
      table_name: selectedTable.value
    }

    const apiCall = queryMode.value === 'by_value'
      ? postPhoPieByValue
      : postPhoPieByStatus

    const response = await apiCall(params)
    rawData.value = response

    await nextTick()
    updateContainerSize()
    renderAllPies()
  } catch (error) {
    errorMessage.value = error.message || t('phonology.phonology.evolution.errors.queryFailed')
    console.error('Query error:', error)
  } finally {
    isLoading.value = false
  }
}

// ========== 容器尺寸更新 ==========
const updateContainerSize = () => {
  if (pieGridRef.value) {
    const rect = pieGridRef.value.getBoundingClientRect()
    containerWidth.value = rect.width || 1200
  }
}

// ========== 饼图渲染 ==========
const generatePieChartOption = (pieData, index) => {
  const isByValue = queryMode.value === 'by_value'
  const title = isByValue ? pieData.value : pieData.level1_value
  const total = pieData.total
  const items = isByValue ? pieData.level1 : pieData.phonetic_values

  if (!items) return null

  return {
    animation: false, // 完全禁用动画
    title: {
      text: title,
      subtext: `${total}条`,
      left: 'center',
      top: 'center',
      textStyle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333'
      },
      subtextStyle: {
        fontSize: 11,
        color: '#666'
      }
    },
    tooltip: {
      trigger: 'item',
      confine: true,
      formatter: (params) => {
        const item = items[params.dataIndex]
        if (!item) return ''

        let html = `<div style="padding: 8px;">
          <div style="font-weight: bold; margin-bottom: 6px;">
            ${params.name}: ${item.count}条 (${item.percent}%)
          </div>`

        if (item.level2 && item.level2.length > 0) {
          html += `<div style="border-top: 1px solid #eee; margin: 6px 0; padding-top: 6px;">
            <div style="font-size: 12px; color: #666; margin-bottom: 4px;">
              细分（按${level2Column.value}）：
            </div>`

          item.level2.forEach(l2 => {
            html += `<div style="margin-left: 8px; font-size: 11px;">
              • ${l2.label}：${l2.count} (${l2.percent}%)
            </div>`

            if (l2.chars && l2.chars.length > 0) {
              const displayChars = l2.chars.slice(0, 10)
              const remaining = l2.chars.length - displayChars.length
              html += `<div style="margin-left: 16px; font-size: 10px; color: #888;">
                字：${displayChars.join('、')}${remaining > 0 ? ` +${remaining}个` : ''}
              </div>`
            }
          })

          html += `</div>`
        } else if (item.chars && item.chars.length > 0) {
          const displayChars = item.chars.slice(0, 15)
          const remaining = item.chars.length - displayChars.length
          html += `<div style="border-top: 1px solid #eee; margin: 6px 0; padding-top: 6px; font-size: 11px;">
            字：${displayChars.join('、')}${remaining > 0 ? ` +${remaining}个` : ''}
          </div>`
        }

        html += `</div>`
        return html
      }
    },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: true,
      itemStyle: {
        borderRadius: 6,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: true,
        position: 'outside',
        formatter: '{b}\n{d}%',
        fontSize: 10
      },
      emphasis: {
        scale: false, // 禁用hover放大
        focus: 'none' // 禁用focus效果
      },
      data: items.map(item => ({
        name: isByValue ? item.label : item.value,
        value: item.count
      }))
    }]
  }
}

const initPieChart = (container, pieData, index) => {
  if (!container) return null

  // 确保容器有宽度和高度
  const width = container.clientWidth
  const height = container.clientHeight
  if (width === 0 || height === 0) {
    console.warn(`[Evolution] Container ${index} has zero size, skipping initialization`)
    return null
  }

  const chart = echarts.init(container, null, {
    renderer: 'canvas',
    useDirtyRect: true // 启用脏矩形优化
  })
  const option = generatePieChartOption(pieData, index)

  if (option) {
    chart.setOption(option, {
      notMerge: true,
      lazyUpdate: false
    })
  }

  return chart
}

// 不再使用setPieRef，改用renderAllPies统一初始化
// const setPieRef = (el, index) => {
//   if (el && currentPieData.value[index]) {
//     if (chartInstances.value[index]) {
//       chartInstances.value[index].dispose()
//     }
//     chartInstances.value[index] = initPieChart(
//       el,
//       currentPieData.value[index],
//       index
//     )
//   }
// }

const renderAllPies = async () => {
  const startTime = performance.now()
  console.log(`[Evolution] Starting to render ${currentPieData.value.length} pies...`)

  await nextTick()
  chartInstances.value.forEach(chart => chart?.dispose())
  chartInstances.value = []

  // 强制重新渲染：等待DOM更新后再次触发
  await nextTick()

  // 手动初始化所有饼图 - 分批渲染，避免阻塞UI
  const pieElements = pieGridRef.value?.querySelectorAll('[data-pie-index]')
  if (pieElements) {
    const batchSize = 10 // 每批渲染10个
    for (let i = 0; i < pieElements.length; i += batchSize) {
      const batchStart = performance.now()
      const batch = Array.from(pieElements).slice(i, i + batchSize)
      batch.forEach((el) => {
        const index = parseInt(el.getAttribute('data-pie-index'))
        if (currentPieData.value[index]) {
          chartInstances.value[index] = initPieChart(
            el,
            currentPieData.value[index],
            index
          )
        }
      })
      // 每批之间让出控制权，避免阻塞UI
      await nextTick()
      console.log(`[Evolution] Batch ${Math.floor(i / batchSize) + 1} rendered in ${(performance.now() - batchStart).toFixed(2)}ms`)
    }
  }

  const endTime = performance.now()
  console.log(`[Evolution] Total rendering took ${(endTime - startTime).toFixed(2)}ms`)
}

// 当切换feature时，重新渲染饼图
watch(currentFeature, async () => {
  await nextTick()

  // 清空旧的图表实例
  chartInstances.value.forEach(chart => chart?.dispose())
  chartInstances.value = []

  await nextTick()

  // 分批重新初始化所有饼图
  const pieElements = pieGridRef.value?.querySelectorAll('[data-pie-index]')
  if (pieElements) {
    const batchSize = 10
    for (let i = 0; i < pieElements.length; i += batchSize) {
      const batch = Array.from(pieElements).slice(i, i + batchSize)
      batch.forEach((el) => {
        const index = parseInt(el.getAttribute('data-pie-index'))
        if (currentPieData.value[index]) {
          chartInstances.value[index] = initPieChart(
            el,
            currentPieData.value[index],
            index
          )
        }
      })
      await nextTick()
    }
  }
})

// ========== 生命周期 ==========
onUnmounted(() => {
  chartInstances.value.forEach(chart => chart?.dispose())
})
</script>

<style scoped lang="scss">
.evolution-page {
  width: 100%;
  padding: 20px;
}

/* 控制面板 */
.main-glass-panel {
  --main-glass-panel-background: var(--glass-medium2);
  --main-glass-panel-backdrop-filter: blur(12px);
  --main-glass-panel-border-radius: var(--radius-lg);
  --main-glass-panel-border: 1px solid var(--glass-border-weak);
  --main-glass-panel-shadow: 0 4px 16px rgba(0, 0, 0, 0.08), inset 0 0 0 1px rgba(255, 255, 255, 0.3);
  --main-glass-panel-hover-shadow: 0 4px 16px rgba(0, 0, 0, 0.08), inset 0 0 0 1px rgba(255, 255, 255, 0.3);
  padding: 20px;
  margin-bottom: 20px;
}

.control-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }

  &--query {
    justify-content: center;
  }
}

.dimension-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 16px;
  align-items: start;
}

.dimension-field {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dimension-label {
  min-width: 0;
}

.dimension-select {
  width: 100%;
  max-width: none;
}

.control-label {
  min-width: 80px;
  font-size: 14px;
  color: var(--text-dark, #333);
  font-weight: 500;
}

.control-select {
  flex: 1;
  max-width: 300px;
}

.control-input {
  flex: 1;
}

.control-input-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.input-hint {
  font-size: 12px;
  color: var(--text-secondary, #999);
  font-style: italic;
}

/* Radio选择器（液态玻璃态） */
.mode-selector {
  display: flex;
  gap: 20px;
}

.mode-radio-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 500;
  color: var(--text-dark, #333);
  user-select: none;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.8;
  }
}

.hidden-radio {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;

  &:checked + .glass-indicator {
    border-color: var(--color-primary, #007aff);
    background: rgba(255, 255, 255, 0.8);

    &::after {
      transform: translate(-50%, -50%) scale(1);
    }
  }
}

/* 液态玻璃圆圈（外圈） */
.glass-indicator {
  position: relative;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1px solid rgba(150, 150, 150, 0.3);
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  box-shadow:
    inset 0 1px 3px rgba(255, 255, 255, 0.5),
    0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);

  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--color-primary, #007aff);
    transform: translate(-50%, -50%) scale(0);
    transition: transform 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  }
}

/* 查询按钮 */
.query-button {
  padding: 10px 24px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 0 2px 8px var(--color-primary-shadow);

  &:hover:not(:disabled) {
    background: var(--color-primary-hover);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px var(--color-primary-shadow-light);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

/* 错误提示 */
.error-message {
  padding: 12px;
  background: rgba(255, 59, 48, 0.1);
  border: 1px solid rgba(255, 59, 48, 0.3);
  border-radius: 8px;
  color: #ff3b30;
  font-size: 13px;
  margin-top: 12px;
}

/* Tab切换 */
.feature-tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  justify-content: center;
}

.feature-tab {
  padding: 10px 20px;
  background: var(--glass-light);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid var(--glass-border-weak);
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 500;
  color: var(--text-dark);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

  &:hover {
    background: var(--glass-medium);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  &.active {
    background: var(--color-primary);
    color: white;
    border-color: var(--color-primary);
    box-shadow: 0 4px 12px var(--color-primary-shadow);
  }
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  gap: 16px;

  p {
    font-size: 14px;
    color: #666;
  }
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 122, 255, 0.2);
  border-top-color: var(--color-primary, #007aff);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 饼图容器 */
.pie-container {
  position: relative;
  width: 100%;
}

.pie-grid {
  position: relative;
  transform: translateZ(0);
  backface-visibility: hidden;
}

.pie-item {
  position: relative;

  &:hover {
    z-index: 10;
  }
}

.pie-chart {
  width: 100%;
  height: 200px;
  background: transparent;
}

/* 空状态 */
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  color: #999;
  font-size: 14px;
}

/* 响应式 */
@media (max-aspect-ratio: 1/1) {
  .evolution-page {
    padding: 12px;
  }

  .main-glass-panel {
    padding: 16px;
  }

  .control-row {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  .control-label {
    min-width: auto;
  }

  .control-select {
    max-width: none;
  }

  .mode-selector {
    flex-direction: column;
    gap: 12px;
  }

  .feature-tabs {
    flex-wrap: wrap;
  }

  .pie-chart {
    height: 180px;
  }
}

@media (max-width: 768px) and (orientation: portrait) {
  .dimension-grid {
    grid-template-columns: 1fr;
  }
}
</style>

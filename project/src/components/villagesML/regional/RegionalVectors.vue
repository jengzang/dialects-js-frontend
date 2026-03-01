<template>
  <div class="regional-vectors-page">
      <h3 class="villagesml-subtab-title">區域分析 - 特徵向量</h3>
    <!-- Header -->
<!--    <div class="page-header">-->
<!--      <h2>區域特徵向量 Regional Feature Vectors</h2>-->
<!--      <p class="subtitle">分析區域間的特徵向量相似度與聚類模式</p>-->
<!--    </div>-->

    <!-- Region Selector -->
    <div class="glass-panel selector-panel">
      <div class="panel-header">
        <h3>選擇區域 Select Regions</h3>
      </div>
      <div class="selector-content">
        <!-- Primary Region -->
        <div class="region-group">
          <h4 class="group-title">主要區域 Primary Region</h4>
          <FilterableSelect
            v-model="primaryRegion"
            v-model:level="primaryLevel"
            :show-level-selector="true"
            :show-counts="true"
            placeholder="請選擇區域..."
          />
        </div>

        <!-- Compare Region -->
        <div class="region-group">
          <h4 class="group-title">比較區域 Compare Region (可選)</h4>
          <FilterableSelect
            v-model="compareRegion"
            v-model:level="compareLevel"
            :show-level-selector="true"
            :show-counts="true"
            placeholder="請選擇區域..."
          />
        </div>

        <div class="button-group">
          <button @click="loadVectors" :disabled="!primaryRegion || loading" class="action-button primary">
            <span v-if="!loading">載入向量 Load Vectors</span>
            <span v-else>載入中...</span>
          </button>
          <button @click="compareVectors" :disabled="!primaryRegion || !compareRegion || loading" class="action-button secondary">
            比較向量 Compare Vectors
          </button>
        </div>
      </div>
    </div>

    <!-- Similarity Comparison -->
    <div v-if="similarityData" class="glass-panel similarity-panel">
      <div class="panel-header">
        <h3>相似度分析 Similarity Analysis</h3>
      </div>
      <div class="similarity-content">
        <div class="comparison-header">
          <div class="region-badge primary">{{ primaryRegion }}</div>
          <div class="vs-label">vs</div>
          <div class="region-badge compare">{{ compareRegion }}</div>
        </div>
        <div class="similarity-metrics">
          <div class="metric-card">
            <div class="metric-label">餘弦相似度 Cosine Similarity</div>
            <div class="metric-value">{{ formatNumber(similarityData.cosine_similarity) }}</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">歐氏距離 Euclidean Distance</div>
            <div class="metric-value">{{ formatNumber(similarityData.euclidean_distance) }}</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">曼哈頓距離 Manhattan Distance</div>
            <div class="metric-value">{{ formatNumber(similarityData.manhattan_distance) }}</div>
          </div>
        </div>
        <div class="difference-chart">
          <div ref="diffChart" class="chart-container"></div>
        </div>
      </div>
    </div>

    <!-- Feature Vector Display -->
    <div v-if="vectorData" class="glass-panel vector-panel">
      <div class="panel-header">
        <h3>特徵向量 Feature Vector</h3>
        <span class="region-label">{{ primaryRegion }} ({{ getLevelLabel(primaryLevel) }})</span>
      </div>
      <div class="vector-content">
        <div class="vector-stats">
          <div class="stat-item">
            <span class="label">向量維度:</span>
            <span class="value">{{ vectorData.dimension || 'N/A' }}</span>
          </div>
          <div class="stat-item">
            <span class="label">村莊數量:</span>
            <span class="value">{{ vectorData.village_count || 'N/A' }}</span>
          </div>
        </div>
        <div class="vector-visualization">
          <div ref="vectorChart" class="chart-container"></div>
        </div>
      </div>
    </div>

    <!-- Loading Overlay -->
    <div v-if="loading" class="loading-overlay">
      <div class="spinner"></div>
      <p>載入中...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import { getRegionalVectors, compareRegionalVectors } from '@/api/index.js'
import { showError, showSuccess, showWarning } from '@/utils/message.js'
import FilterableSelect from '@/components/common/FilterableSelect.vue'
import { SEMANTIC_CATEGORY_NAMES } from '@/config/villagesML.js'

const router = useRouter()

// State
const primaryLevel = ref('city')
const primaryRegion = ref('')
const compareLevel = ref('city')
const compareRegion = ref('')
const vectorData = ref(null)
const similarityData = ref(null)
const loading = ref(false)

// Chart refs
const vectorChart = ref(null)
const diffChart = ref(null)

// Chart instances
let vectorChartInstance = null
let diffChartInstance = null

// Methods
const loadVectors = async () => {
  if (!primaryRegion.value) return

  loading.value = true
  try {
    const response = await getRegionalVectors({
      region_name: primaryRegion.value,
      level: primaryLevel.value
    })

    // Handle response - API returns array, we need the first item
    const data = Array.isArray(response) ? response[0] : response

    if (!data) {
      showWarning('未找到該區域的向量數據')
      return
    }

    vectorData.value = {
      dimension: data.feature_vector?.length || 9,
      village_count: data.village_count || 0,
      vector: data.feature_vector || []
    }

    await nextTick()
    renderVectorChart()
    showSuccess('向量載入成功')
  } catch (error) {
    showError(error.message || '載入向量失敗')
  } finally {
    loading.value = false
  }
}

const compareVectors = async () => {
  if (!primaryRegion.value || !compareRegion.value) return

  loading.value = true
  try {
    const response = await compareRegionalVectors({
      region1: primaryRegion.value,
      level1: primaryLevel.value,
      region2: compareRegion.value,
      level2: compareLevel.value
    })

    // Use real API response
    similarityData.value = response

    await nextTick()
    renderDiffChart()
    showSuccess('向量比較完成')
  } catch (error) {
    showError(error.message || '向量比較失敗')
  } finally {
    loading.value = false
  }
}

const renderVectorChart = () => {
  if (!vectorChart.value || !vectorData.value) return

  if (!vectorChartInstance) {
    vectorChartInstance = echarts.init(vectorChart.value)
  }

  // 9个语义类别（按字母顺序，与后端 semantic_indices 表一致）
  const categoryKeys = ['agriculture', 'clan', 'direction', 'infrastructure', 'mountain', 'settlement', 'symbolic', 'vegetation', 'water']
  const categories = categoryKeys.map(key => SEMANTIC_CATEGORY_NAMES[key])

  // 检测是否为移动端
  const isMobile = window.matchMedia('(orientation: portrait)').matches

  vectorChartInstance.setOption({
    title: {
      text: '特徵向量分布',
      left: 'center',
      textStyle: {
        fontSize: isMobile ? 14 : 16
      }
    },
    tooltip: { trigger: 'axis' },
    grid: {
      left: isMobile ? '15%' : '10%',
      right: isMobile ? '5%' : '10%',
      bottom: isMobile ? '20%' : '15%',
      top: isMobile ? '15%' : '12%'
    },
    xAxis: {
      type: 'category',
      data: categories,
      axisLabel: {
        rotate: isMobile ? 45 : 30,
        fontSize: isMobile ? 10 : 12
      }
    },
    yAxis: {
      type: 'value',
      name: '權重',
      nameTextStyle: {
        fontSize: isMobile ? 11 : 12
      },
      axisLabel: {
        fontSize: isMobile ? 10 : 12
      }
    },
    series: [{
      type: 'bar',
      data: vectorData.value.vector || [],
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#4a90e2' },
          { offset: 1, color: '#50c878' }
        ])
      }
    }]
  })
}

const renderDiffChart = () => {
  if (!diffChart.value || !similarityData.value) return

  if (!diffChartInstance) {
    diffChartInstance = echarts.init(diffChart.value)
  }

  // 9个语义类别（按字母顺序，与后端 semantic_indices 表一致）
  const categoryKeys = ['agriculture', 'clan', 'direction', 'infrastructure', 'mountain', 'settlement', 'symbolic', 'vegetation', 'water']
  const categories = categoryKeys.map(key => SEMANTIC_CATEGORY_NAMES[key])

  // 检测是否为移动端
  const isMobile = window.matchMedia('(orientation: portrait)').matches

  diffChartInstance.setOption({
    title: {
      text: '向量對比分布',
      left: 'center',
      textStyle: {
        fontSize: isMobile ? 14 : 16
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: [primaryRegion.value, compareRegion.value],
      top: isMobile ? 25 : 30,
      textStyle: {
        fontSize: isMobile ? 11 : 12
      }
    },
    grid: {
      left: isMobile ? '15%' : '10%',
      right: isMobile ? '5%' : '10%',
      bottom: isMobile ? '20%' : '15%',
      top: isMobile ? '20%' : '18%'
    },
    xAxis: {
      type: 'category',
      data: categories,
      axisLabel: {
        rotate: isMobile ? 45 : 30,
        fontSize: isMobile ? 10 : 12
      }
    },
    yAxis: {
      type: 'value',
      name: '權重',
      nameTextStyle: {
        fontSize: isMobile ? 11 : 12
      },
      axisLabel: {
        fontSize: isMobile ? 10 : 12
      }
    },
    series: [
      {
        name: primaryRegion.value,
        type: 'bar',
        data: similarityData.value.region1_vector || [],
        itemStyle: {
          color: '#4a90e2'
        }
      },
      {
        name: compareRegion.value,
        type: 'bar',
        data: similarityData.value.region2_vector || [],
        itemStyle: {
          color: '#50c878'
        }
      }
    ]
  })
}

const formatNumber = (num) => {
  return typeof num === 'number' ? num.toFixed(4) : 'N/A'
}

const getLevelLabel = (level) => {
  const labels = {
    city: '市級',
    county: '區縣級',
    town: '鄉鎮級'
  }
  return labels[level] || level
}

// 响应式处理
const handleResize = () => {
  if (vectorChartInstance) {
    vectorChartInstance.resize()
    // 重新渲染以应用移动端样式
    if (vectorData.value) {
      renderVectorChart()
    }
  }
  if (diffChartInstance) {
    diffChartInstance.resize()
    // 重新渲染以应用移动端样式
    if (similarityData.value) {
      renderDiffChart()
    }
  }
}

// 生命周期
onMounted(() => {
  window.addEventListener('resize', handleResize)
  window.addEventListener('orientationchange', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('orientationchange', handleResize)
  if (vectorChartInstance) {
    vectorChartInstance.dispose()
    vectorChartInstance = null
  }
  if (diffChartInstance) {
    diffChartInstance.dispose()
    diffChartInstance = null
  }
})

</script>

<style scoped>
.regional-vectors-page {
  padding: 12px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 16px;
  text-align: center;
}

.page-header h2 {
  font-size: 28px;
  color: var(--text-primary);
  margin-bottom: 10px;
}

.subtitle {
  color: var(--text-secondary);
  font-size: 14px;
}

.glass-panel {
  background: var(--glass-heavy);
  backdrop-filter: blur(10px);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid rgba(74, 144, 226, 0.2);
}

.panel-header h3 {
  font-size: 16px;
  color: var(--text-primary);
  margin: 0;
}

.region-label {
  background: linear-gradient(135deg, #4a90e2, #50c878);
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
}

.selector-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.region-group {
  padding: 16px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  border: 1px solid rgba(74, 144, 226, 0.2);
}

.group-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(74, 144, 226, 0.15);
}

.form-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.form-row:last-child {
  margin-bottom: 0;
}

.form-row label {
  min-width: 150px;
  font-weight: 500;
  color: var(--text-primary);
}

.glass-select,
.glass-input {
  flex: 1;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(74, 144, 226, 0.3);
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.glass-select:focus,
.glass-input:focus {
  outline: none;
  border-color: #4a90e2;
  background: rgba(255, 255, 255, 0.8);
}

.glass-select.small,
.glass-input.small {
  max-width: 150px;
}

.button-group {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.action-button {
  flex: 1;
  padding: 10px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  color: white;
}

.action-button.primary {
  background: linear-gradient(135deg, #4a90e2, #357abd);
}

.action-button.primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #357abd, #2868a8);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(74, 144, 226, 0.4);
}

.action-button.secondary {
  background: linear-gradient(135deg, #5a9fd4, #4a8fc4);
}

.action-button.secondary:hover:not(:disabled) {
  background: linear-gradient(135deg, #4a8fc4, #3a7fb4);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(90, 159, 212, 0.4);
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.vector-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  padding: 12px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 8px;
}

.stat-item .label {
  font-weight: 500;
  color: var(--text-secondary);
}

.stat-item .value {
  font-weight: 600;
  color: var(--text-primary);
}

.chart-container {
  width: 100%;
  height: 400px;
}

.comparison-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 24px;
}

.region-badge {
  padding: 8px 20px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 16px;
}

.region-badge.primary {
  background: linear-gradient(135deg, #4a90e2, #357abd);
  color: white;
}

.region-badge.compare {
  background: linear-gradient(135deg, #50c878, #3da35d);
  color: white;
}

.vs-label {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-secondary);
}

.similarity-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.metric-card {
  padding: 12px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 12px;
  text-align: center;
  border: 2px solid rgba(74, 144, 226, 0.2);
}

.metric-label {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.metric-value {
  font-size: 28px;
  font-weight: 700;
  color: #4a90e2;
}

.clustering-params {
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
}

.param-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.param-item label {
  font-weight: 500;
  color: var(--text-primary);
}

.glass-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.glass-table thead {
  background: rgba(74, 144, 226, 0.1);
}

.glass-table th,
.glass-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid rgba(74, 144, 226, 0.1);
}

.glass-table th {
  font-weight: 600;
  color: var(--text-primary);
}

.region-list {
  font-size: 13px;
  color: var(--text-secondary);
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-secondary);
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-overlay p {
  color: white;
  margin-top: 16px;
  font-size: 16px;
}

/* Responsive - Portrait orientation */
@media (orientation: portrait) {
  .regional-vectors-page {
    padding: 8px;
  }

  .glass-panel {
    padding: 12px;
    margin-bottom: 16px;
  }

  .selector-content {
    gap: 16px;
  }

  .region-group {
    padding: 12px;
  }

  .button-group {
    flex-direction: column;
  }

  .vector-stats {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .comparison-header {
    flex-direction: column;
    gap: 12px;
  }

  .region-badge {
    padding: 6px 16px;
    font-size: 14px;
  }

  .similarity-metrics {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .metric-card {
    padding: 10px;
  }

  .metric-value {
    font-size: 24px;
  }

  .chart-container {
    height: 280px;
  }
}
</style>

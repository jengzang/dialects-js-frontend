<template>
  <div class="regional-vectors-page">
      <h3 class="villagesml-subtab-title">區域分析 - 特徵向量</h3>
    <!-- Header -->
    <div class="page-header">
      <h2>區域特徵向量 Regional Feature Vectors</h2>
      <p class="subtitle">分析區域間的特徵向量相似度與聚類模式</p>
    </div>

    <!-- Region Selector -->
    <div class="glass-panel selector-panel">
      <div class="panel-header">
        <h3>選擇區域 Select Regions</h3>
      </div>
      <div class="selector-content">
        <div class="form-row">
          <label>層級 Level:</label>
          <SimpleSelectDropdown :match-trigger-width="true"
            v-model="selectedLevel"
            :options="levelOptions"
            @update:modelValue="handleLevelChange"
          />
        </div>
        <div class="form-row">
          <label>主要區域 Primary Region:</label>
          <SimpleSelectDropdown :match-trigger-width="true"
            v-model="primaryRegion"
            :options="primaryRegionOptions"
            @update:modelValue="handlePrimaryChange"
            searchable
          />
        </div>
        <div class="form-row">
          <label>比較區域 Compare Region (可選):</label>
          <SimpleSelectDropdown :match-trigger-width="true"
            v-model="compareRegion"
            :options="compareRegionOptions"
            searchable
          />
        </div>
        <div class="button-group">
          <button @click="loadVectors" :disabled="!primaryRegion || loading" class="solid-button primary">
            <span v-if="!loading">載入向量 Load Vectors</span>
            <span v-else>載入中...</span>
          </button>
          <button @click="compareVectors" :disabled="!primaryRegion || !compareRegion || loading" class="solid-button secondary">
            比較向量 Compare Vectors
          </button>
        </div>
      </div>
    </div>

    <!-- Feature Vector Display -->
    <div v-if="vectorData" class="glass-panel vector-panel">
      <div class="panel-header">
        <h3>特徵向量 Feature Vector</h3>
        <span class="region-label">{{ primaryRegion }}</span>
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
          <div class="stat-item">
            <span class="label">特徵類型:</span>
            <span class="value">{{ vectorData.feature_type || 'Semantic' }}</span>
          </div>
        </div>
        <div class="vector-visualization">
          <div ref="vectorChart" class="chart-container"></div>
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

    <!-- Regional Clustering -->
    <div class="glass-panel clustering-panel">
      <div class="panel-header">
        <h3>區域聚類 Regional Clustering</h3>
        <button @click="runClustering" class="solid-button small">
          前往聚類分析頁面 →
        </button>
      </div>
      <div class="empty-state">
        <p>💡 使用專業的聚類分析工具進行區域聚類</p>
        <p style="font-size: 13px; margin-top: 8px; color: var(--text-secondary);">支持 K-Means、DBSCAN、GMM 等多種算法</p>
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
import { ref, onMounted, nextTick, computed } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import { getRegionalVectors, runClustering as apiRunClustering } from '@/api/index.js'
import { showError, showSuccess, showWarning, showInfo } from '@/utils/message.js'
import { getCities, getCounties, getTownships } from '@/utils/region/regionPreload.js'
import SimpleSelectDropdown from '@/components/common/SimpleSelectDropdown.vue'

const router = useRouter()

// State
const selectedLevel = ref('city')
const primaryRegion = ref('')
const compareRegion = ref('')
const availableRegions = ref([])
const vectorData = ref(null)
const similarityData = ref(null)
const loading = ref(false)

// Options
const levelOptions = [
  { label: '市 City', value: 'city' },
  { label: '縣 County', value: 'county' },
  { label: '鄉鎮 Township', value: 'town' }
]

// Computed options for regions
const primaryRegionOptions = computed(() => {
  const options = [{ label: '-- 請選擇 --', value: '' }]
  availableRegions.value.forEach(region => {
    const name = region.name || region
    const label = region.village_count ? `${name} (${region.village_count}村)` : name
    options.push({ label, value: name })
  })
  return options
})

const compareRegionOptions = computed(() => {
  const options = [{ label: '-- 無 --', value: '' }]
  availableRegions.value.forEach(region => {
    const name = region.name || region
    if (name !== primaryRegion.value) {
      const label = region.village_count ? `${name} (${region.village_count}村)` : name
      options.push({ label, value: name })
    }
  })
  return options
})

// Chart refs
const vectorChart = ref(null)
const diffChart = ref(null)

// Methods
const handleLevelChange = async () => {
  loading.value = true
  try {
    // Load regions based on selected level
    if (selectedLevel.value === 'city') {
      availableRegions.value = await getCities()
    } else if (selectedLevel.value === 'county') {
      availableRegions.value = await getCounties()
    } else if (selectedLevel.value === 'town') {
      availableRegions.value = await getTownships()
    }

    // Reset selections
    primaryRegion.value = ''
    compareRegion.value = ''
    vectorData.value = null
    similarityData.value = null
  } catch (error) {
    showError('載入區域列表失敗: ' + error.message)
    availableRegions.value = []
  } finally {
    loading.value = false
  }
}

const handlePrimaryChange = () => {
  vectorData.value = null
  similarityData.value = null
}

const loadVectors = async () => {
  if (!primaryRegion.value) return

  loading.value = true
  try {
    const response = await getRegionalVectors({
      region_name: primaryRegion.value,
      level: selectedLevel.value
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
      feature_type: 'Semantic',
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
    // TODO: Backend API not implemented yet - waiting for implementation
    // Once backend is ready, replace mock data with:
    //
    // import { compareRegionalVectors } from '@/api/index.js'
    //
    // const response = await compareRegionalVectors({
    //   region1: primaryRegion.value,
    //   region2: compareRegion.value,
    //   level: selectedLevel.value
    // })
    // similarityData.value = response
    //
    // Expected backend endpoint: POST /api/villages/regional/vectors/compare
    // Expected request body: { region1: string, region2: string, level: string }
    // Expected response format: {
    //   cosine_similarity: float,
    //   euclidean_distance: float,
    //   manhattan_distance: float,
    //   vector_diff: List[float],
    //   region1_vector: List[float],
    //   region2_vector: List[float]
    // }

    showWarning('向量比較功能開發中，後端 API 尚未實現')

    // Mock data for UI testing (will be removed when API is ready)
    similarityData.value = {
      cosine_similarity: 0.8234,
      euclidean_distance: 0.4521,
      manhattan_distance: 1.2345,
      vector_diff: [0.05, -0.03, 0.08, -0.02, 0.04, -0.01, 0.06, -0.04, 0.03]
    }

    await nextTick()
    renderDiffChart()
  } catch (error) {
    showError(error.message || '向量比較失敗')
  } finally {
    loading.value = false
  }
}

const runClustering = async () => {
  // Redirect to dedicated clustering page
  showInfo('正在跳轉到專業聚類分析頁面...')
  router.push('/villagesML?module=compute&subtab=clustering')
}

const renderVectorChart = () => {
  if (!vectorChart.value || !vectorData.value) return

  const chart = echarts.init(vectorChart.value)
  const categories = ['山', '水', '聚落', '方位', '植物', '動物', '顏色', '數字', '其他']

  chart.setOption({
    title: { text: '特徵向量分布', left: 'center' },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: categories,
      axisLabel: { rotate: 45 }
    },
    yAxis: { type: 'value', name: '權重' },
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

  const chart = echarts.init(diffChart.value)
  const categories = ['山', '水', '聚落', '方位', '植物', '動物', '顏色', '數字', '其他']

  chart.setOption({
    title: { text: '向量差異分布', left: 'center' },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: categories,
      axisLabel: { rotate: 45 }
    },
    yAxis: { type: 'value', name: '差異值' },
    series: [{
      type: 'bar',
      data: similarityData.value.vector_diff || [],
      itemStyle: {
        color: (params) => params.value >= 0 ? '#50c878' : '#e74c3c'
      }
    }]
  })
}

const formatNumber = (num) => {
  return typeof num === 'number' ? num.toFixed(4) : 'N/A'
}

// Lifecycle
onMounted(async () => {
  // Load initial regions
  await handleLevelChange()
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
  gap: 16px;
}

.form-row {
  display: flex;
  align-items: center;
  gap: 12px;
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

.solid-button {
  padding: 10px 24px;
  background: linear-gradient(135deg, #4a90e2, #50c878);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.solid-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(74, 144, 226, 0.4);
}

.solid-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.solid-button.secondary {
  background: linear-gradient(135deg, #95a5a6, #7f8c8d);
}

.solid-button.small {
  padding: 6px 16px;
  font-size: 13px;
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

/* Responsive */
@media (max-width: 768px) {
  .regional-vectors-page {
    padding: 12px;
  }

  .form-row {
    flex-direction: column;
    align-items: stretch;
  }

  .form-row label {
    min-width: auto;
  }

  .button-group {
    flex-direction: column;
  }

  .comparison-header {
    flex-direction: column;
    gap: 12px;
  }

  .clustering-params {
    flex-direction: column;
  }

  .chart-container {
    height: 300px;
  }
}
</style>

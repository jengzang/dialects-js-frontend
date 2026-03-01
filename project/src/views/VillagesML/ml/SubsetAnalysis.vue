<template>
  <div class="subset-analysis-page">
      <h3 class="villagesml-subtab-title">ML計算 - 子集分析</h3>
    <!-- Header -->
    <div class="page-header">
      <h2>🔐 子集分析 Subset Analysis</h2>
      <p class="subtitle">對自訂村莊子集進行聚類與比較分析</p>
      <div v-if="!isAuthenticated" class="auth-warning">
        <span class="lock-icon">🔒</span>
        <span>此功能需要登入</span>
        <button @click="goToAuth" class="solid-button small">前往登入</button>
      </div>
    </div>

    <!-- Filter Builder -->
    <div class="glass-panel filter-panel">
      <div class="panel-header">
        <h3>篩選器構建 Filter Builder</h3>
        <button @click="addFilter" class="solid-button small">+ 添加篩選條件</button>
      </div>
      <div class="filter-content">
        <div v-for="(filter, idx) in filters" :key="idx" class="filter-row">
          <SimpleSelectDropdown :match-trigger-width="true"
            v-model="filter.field"
            :options="fieldOptions"
          />

          <SimpleSelectDropdown :match-trigger-width="true"
            v-model="filter.operator"
            :options="operatorOptions"
          />

          <input v-model="filter.value" type="text" placeholder="值" class="glass-input">
          <button @click="removeFilter(idx)" class="solid-button small secondary">刪除</button>
        </div>
        <div class="filter-actions">
          <button @click="applyFilters" :disabled="filters.length === 0 || loading" class="solid-button primary">
            應用篩選 Apply Filters
          </button>
          <button @click="clearFilters" class="solid-button secondary">清空篩選</button>
        </div>
        <div v-if="subsetA.villages.length > 0" class="subset-info">
          <span class="info-label">子集 A:</span>
          <span class="info-value">{{ subsetA.villages.length }} 個村莊</span>
        </div>
      </div>
    </div>

    <!-- Subset Comparison -->
    <div class="glass-panel comparison-panel">
      <div class="panel-header">
        <h3>子集比較 Subset Comparison</h3>
      </div>
      <div class="comparison-content">
        <div class="subset-selector">
          <div class="subset-card">
            <h4>子集 A</h4>
            <div class="subset-stats">
              <div class="stat-item">
                <span class="label">村莊數:</span>
                <span class="value">{{ subsetA.villages.length }}</span>
              </div>
              <div class="stat-item">
                <span class="label">篩選條件:</span>
                <span class="value">{{ formatFilterSummary(subsetA.filter) }}</span>
              </div>
            </div>
            <button @click="saveAsSubsetA" :disabled="!canSaveSubset" class="solid-button small">
              保存為子集 A
            </button>
          </div>
          <div class="vs-divider">VS</div>
          <div class="subset-card">
            <h4>子集 B</h4>
            <div class="subset-stats">
              <div class="stat-item">
                <span class="label">村莊數:</span>
                <span class="value">{{ subsetB.villages.length }}</span>
              </div>
              <div class="stat-item">
                <span class="label">篩選條件:</span>
                <span class="value">{{ formatFilterSummary(subsetB.filter) }}</span>
              </div>
            </div>
            <button @click="saveAsSubsetB" :disabled="!canSaveSubset" class="solid-button small">
              保存為子集 B
            </button>
          </div>
        </div>
        <div class="comparison-actions">
          <button
            @click="compareSubsets"
            :disabled="!canCompare || loading"
            class="solid-button primary large"
          >
            比較子集 Compare Subsets
          </button>
        </div>
      </div>
    </div>

    <!-- Comparison Results -->
    <div v-if="comparisonResults" class="glass-panel results-panel">
      <div class="panel-header">
        <h3>比較結果 Comparison Results</h3>
      </div>
      <div class="results-content">
        <!-- Metrics -->
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-label">相似度</div>
            <div class="metric-value">{{ formatNumber(comparisonResults.similarity) }}</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">差異度</div>
            <div class="metric-value">{{ formatNumber(comparisonResults.difference) }}</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">重疊村莊</div>
            <div class="metric-value">{{ comparisonResults.overlap_count }}</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">獨特村莊 (A)</div>
            <div class="metric-value">{{ comparisonResults.unique_a }}</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">獨特村莊 (B)</div>
            <div class="metric-value">{{ comparisonResults.unique_b }}</div>
          </div>
        </div>

        <!-- Comparison Chart -->
        <div class="comparison-chart">
          <div ref="comparisonChart" class="chart-container"></div>
        </div>

        <!-- Feature Differences -->
        <div class="feature-diff-table">
          <h4>特徵差異 Feature Differences</h4>
          <table class="glass-table">
            <thead>
              <tr>
                <th>特徵</th>
                <th>子集 A</th>
                <th>子集 B</th>
                <th>差異</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(diff, feature) in comparisonResults.feature_diffs" :key="feature">
                <td>{{ feature }}</td>
                <td>{{ formatNumber(diff.a) }}</td>
                <td>{{ formatNumber(diff.b) }}</td>
                <td :class="['diff-value', diff.diff > 0 ? 'positive' : 'negative']">
                  {{ formatNumber(diff.diff) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Subset Clustering -->
    <div class="glass-panel clustering-panel">
      <div class="panel-header">
        <h3>子集聚類 Subset Clustering</h3>
      </div>
      <div class="clustering-content">
        <div class="clustering-controls">
          <div class="control-row">
            <label>選擇子集:</label>
            <SimpleSelectDropdown :match-trigger-width="true"
              v-model="clusteringSubset"
              :options="clusteringSubsetOptions"
            />
          </div>
          <div class="control-row">
            <label>聚類數 K:</label>
            <input v-model.number="clusterK" type="number" min="2" max="20" class="glass-input small">
          </div>
          <div class="control-row">
            <label>演算法:</label>
            <SimpleSelectDropdown :match-trigger-width="true"
              v-model="clusterAlgorithm"
              :options="clusterAlgorithmOptions"
            />
          </div>
          <button
            @click="runSubsetClustering"
            :disabled="!canCluster || loading"
            class="solid-button primary"
          >
            執行聚類 Run Clustering
          </button>
        </div>

        <div v-if="clusteringResults" class="clustering-results">
          <div class="clustering-chart">
            <div ref="clusteringChart" class="chart-container"></div>
          </div>
          <div class="cluster-summary">
            <h4>聚類摘要 Cluster Summary</h4>
            <table class="glass-table">
              <thead>
                <tr>
                  <th>聚類 ID</th>
                  <th>村莊數</th>
                  <th>中心點</th>
                  <th>內聚度</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="cluster in clusteringResults.clusters" :key="cluster.id">
                  <td>{{ cluster.id }}</td>
                  <td>{{ cluster.size }}</td>
                  <td>{{ formatVector(cluster.centroid) }}</td>
                  <td>{{ formatNumber(cluster.cohesion) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading Overlay -->
    <div v-if="loading" class="loading-overlay">
      <div class="spinner"></div>
      <p>{{ loadingMessage }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import { clusterSubset, compareSubsets as compareSubsetsAPI, searchVillages } from '@/api/index.js'
import { showError, showSuccess, showWarning } from '@/utils/message.js'
import { userStore } from '@/utils/store.js'
import SimpleSelectDropdown from '@/components/common/SimpleSelectDropdown.vue'

// Router
const router = useRouter()

// Authentication
const isAuthenticated = computed(() => userStore.isAuthenticated)

// State
const filters = ref([])
const subsetA = ref({
  label: '',
  filter: {
    cities: [],
    counties: [],
    semantic_tags: [],
    name_pattern: null,
    sample_size: 1000
  },
  villages: []  // For UI display only
})
const subsetB = ref({
  label: '',
  filter: {
    cities: [],
    counties: [],
    semantic_tags: [],
    name_pattern: null,
    sample_size: 1000
  },
  villages: []  // For UI display only
})
const currentFilteredVillages = ref([])
const comparisonResults = ref(null)
const clusteringResults = ref(null)
const loading = ref(false)
const loadingMessage = ref('載入中...')

// Clustering params
const clusteringSubset = ref('A')
const clusterK = ref(5)
const clusterAlgorithm = ref('kmeans')

// Options
const fieldOptions = [
  { label: '村名', value: 'name' },
  { label: '區域', value: 'region' },
  { label: '語義類別', value: 'semantic' },
  { label: '結構模式', value: 'structure' },
  { label: '名稱長度', value: 'length' }
]

const operatorOptions = [
  { label: '包含', value: 'contains' },
  { label: '等於', value: 'equals' },
  { label: '開頭為', value: 'startsWith' },
  { label: '結尾為', value: 'endsWith' },
  { label: '大於', value: 'gt' },
  { label: '小於', value: 'lt' }
]

const clusteringSubsetOptions = [
  { label: '子集 A', value: 'A' },
  { label: '子集 B', value: 'B' },
  { label: '兩者', value: 'both' }
]

const clusterAlgorithmOptions = [
  { label: 'K-Means', value: 'kmeans' },
  { label: 'Hierarchical', value: 'hierarchical' },
  { label: 'DBSCAN', value: 'dbscan' }
]

// Chart refs
const comparisonChart = ref(null)
const clusteringChart = ref(null)

// Computed
const canSaveSubset = computed(() => currentFilteredVillages.value.length > 0)

const canCompare = computed(() => {
  return isAuthenticated.value && subsetA.value.villages.length > 0 && subsetB.value.villages.length > 0
})

const canCluster = computed(() => {
  return isAuthenticated.value && (
    (clusteringSubset.value === 'A' && subsetA.value.villages.length > 0) ||
    (clusteringSubset.value === 'B' && subsetB.value.villages.length > 0) ||
    (clusteringSubset.value === 'both' && subsetA.value.villages.length > 0 && subsetB.value.villages.length > 0)
  )
})

// Methods
const goToAuth = () => {
  router.push('/auth?redirect=/explore?tab=villages')
}

const addFilter = () => {
  filters.value.push({
    field: 'name',
    operator: 'contains',
    value: ''
  })
}

const removeFilter = (idx) => {
  filters.value.splice(idx, 1)
}

const clearFilters = () => {
  filters.value = []
  currentFilteredVillages.value = []
  showSuccess('已清空篩選條件')
}

const applyFilters = async () => {
  if (filters.value.length === 0) return

  loading.value = true
  loadingMessage.value = '正在應用篩選...'

  try {
    // Build filter object for backend
    const filterObj = {
      cities: [],
      counties: [],
      semantic_tags: [],
      name_pattern: null,
      sample_size: 1000
    }

    // Build API parameters from filters
    const params = { limit: 1000 }

    // Extract filters
    filters.value.forEach(filter => {
      if (filter.field === 'region' && filter.operator === 'equals') {
        params.region_name = filter.value
        filterObj.cities.push(filter.value)
      } else if (filter.field === 'semantic' && filter.operator === 'equals') {
        filterObj.semantic_tags.push(filter.value)
      } else if (filter.field === 'name' && filter.operator === 'contains') {
        filterObj.name_pattern = filter.value
      } else if (filter.field === 'length') {
        if (filter.operator === 'gt') params.min_length = parseInt(filter.value)
        else if (filter.operator === 'lt') params.max_length = parseInt(filter.value)
      }
    })

    // Call API to get villages for UI display
    const response = await searchVillages(params)
    let results = response.results.map(v => ({
      id: v.id,
      name: v.name,
      region: v.region_display || v.city,
      length: v.name.length
    }))

    // Apply client-side filters for unsupported operators
    filters.value.forEach(filter => {
      if (filter.field === 'name') {
        if (filter.operator === 'contains') {
          results = results.filter(v => v.name.includes(filter.value))
        } else if (filter.operator === 'startsWith') {
          results = results.filter(v => v.name.startsWith(filter.value))
        } else if (filter.operator === 'endsWith') {
          results = results.filter(v => v.name.endsWith(filter.value))
        } else if (filter.operator === 'equals') {
          results = results.filter(v => v.name === filter.value)
        }
      }
    })

    currentFilteredVillages.value = results
    // Store the filter object for later API calls
    currentFilteredVillages.value.filterObj = filterObj

    showSuccess(`篩選完成，找到 ${currentFilteredVillages.value.length} 個村莊`)
  } catch (error) {
    showError(error.message || '篩選失敗')
  } finally {
    loading.value = false
  }
}

const saveAsSubsetA = () => {
  if (!currentFilteredVillages.value.filterObj) {
    showError('請先應用篩選條件')
    return
  }

  subsetA.value = {
    label: `子集A (${currentFilteredVillages.value.length}個村莊)`,
    filter: currentFilteredVillages.value.filterObj,
    villages: [...currentFilteredVillages.value]
  }
  showSuccess(`已保存為子集 A (${subsetA.value.villages.length} 個村莊)`)
}

const saveAsSubsetB = () => {
  if (!currentFilteredVillages.value.filterObj) {
    showError('請先應用篩選條件')
    return
  }

  subsetB.value = {
    label: `子集B (${currentFilteredVillages.value.length}個村莊)`,
    filter: currentFilteredVillages.value.filterObj,
    villages: [...currentFilteredVillages.value]
  }
  showSuccess(`已保存為子集 B (${subsetB.value.villages.length} 個村莊)`)
}

const calculateAvgLength = (villages) => {
  if (villages.length === 0) return null
  const sum = villages.reduce((acc, v) => acc + v.length, 0)
  return (sum / villages.length).toFixed(2)
}

const compareSubsets = async () => {
  if (!canCompare.value) return

  // Validate that both subsets have filter objects
  if (!subsetA.value.filter || !subsetB.value.filter) {
    showError('請先構建兩個子集')
    return
  }

  loading.value = true
  loadingMessage.value = '正在比較子集...'

  try {
    // Build parameters matching backend API spec
    const params = {
      group_a: {
        label: subsetA.value.label || '子集A',
        filter: subsetA.value.filter
      },
      group_b: {
        label: subsetB.value.label || '子集B',
        filter: subsetB.value.filter
      },
      analysis: {
        semantic_distribution: true,
        morphology_patterns: true,
        statistical_test: 'chi_square'
      }
    }

    const response = await compareSubsetsAPI(params)

    // Update response handling for new format
    comparisonResults.value = {
      comparison_id: response.comparison_id,
      group_a_size: response.group_a_size,
      group_b_size: response.group_b_size,
      semantic_comparison: response.semantic_comparison,
      morphology_comparison: response.morphology_comparison,
      significant_differences: response.significant_differences,
      from_cache: response.from_cache || false,
      // Keep backward compatibility with old format
      similarity: response.similarity || 0,
      difference: response.difference || 0,
      overlap_count: response.overlap_count || 0,
      unique_a: response.unique_a || response.group_a_size,
      unique_b: response.unique_b || response.group_b_size,
      feature_diffs: response.feature_diffs || {}
    }

    await nextTick()
    renderComparisonChart()
    showSuccess(`子集比較完成${response.from_cache ? ' (使用緩存)' : ''}`)
  } catch (error) {
    handleApiError(error)
  } finally {
    loading.value = false
  }
}

const runSubsetClustering = async () => {
  if (!canCluster.value) return

  loading.value = true
  loadingMessage.value = '正在執行聚類...'

  try {
    // Select the subset to cluster
    let subset = null
    if (clusteringSubset.value === 'A') {
      subset = subsetA.value
    } else if (clusteringSubset.value === 'B') {
      subset = subsetB.value
    } else {
      // For 'both', merge filters (this is a simplified approach)
      showError('暫不支持同時聚類兩個子集，請選擇單個子集')
      loading.value = false
      return
    }

    if (!subset.filter) {
      showError('請先構建子集')
      loading.value = false
      return
    }

    // Build parameters matching backend API spec
    const params = {
      filter: subset.filter,
      clustering: {
        algorithm: clusterAlgorithm.value,
        k: clusterK.value,
        features: ['semantic', 'morphology'],
        random_state: 42
      }
    }

    const response = await clusterSubset(params)

    // Update response handling for new format
    clusteringResults.value = {
      subset_id: response.subset_id,
      matched_villages: response.matched_villages,
      sampled_villages: response.sampled_villages,
      clusters: response.clusters,
      metrics: response.metrics,
      from_cache: response.from_cache || false
    }

    await nextTick()
    renderClusteringChart()
    showSuccess(`聚類分析完成${response.from_cache ? ' (使用緩存)' : ''}`)
  } catch (error) {
    handleApiError(error)
  } finally {
    loading.value = false
  }
}

const renderComparisonChart = () => {
  if (!comparisonChart.value || !comparisonResults.value) return

  const chart = echarts.init(comparisonChart.value)

  chart.setOption({
    title: { text: '子集特徵比較', left: 'center' },
    tooltip: { trigger: 'axis' },
    legend: { data: ['子集 A', '子集 B'], bottom: 10 },
    radar: {
      indicator: Object.keys(comparisonResults.value.feature_diffs).map(f => ({ name: f, max: 1 }))
    },
    series: [{
      type: 'radar',
      data: [
        {
          value: Object.values(comparisonResults.value.feature_diffs).map(d => d.a),
          name: '子集 A',
          itemStyle: { color: '#4a90e2' }
        },
        {
          value: Object.values(comparisonResults.value.feature_diffs).map(d => d.b),
          name: '子集 B',
          itemStyle: { color: '#50c878' }
        }
      ]
    }]
  })
}

const renderClusteringChart = () => {
  if (!clusteringChart.value || !clusteringResults.value) return

  const chart = echarts.init(clusteringChart.value)

  // Use real scatter data from API (PCA coordinates)
  const CLUSTER_COLORS = ['#4a90e2', '#50c878', '#f39c12', '#e74c3c', '#9b59b6', '#3498db', '#e67e22', '#1abc9c']
  const scatterData = clusteringResults.value.clusters.map((cluster, idx) => ({
    name: `聚類 ${cluster.id}`,
    type: 'scatter',
    data: cluster.points || cluster.coordinates || [], // Use real PCA coordinates from API
    symbolSize: 15,
    itemStyle: { color: CLUSTER_COLORS[idx % CLUSTER_COLORS.length] }
  }))

  chart.setOption({
    title: { text: '子集聚類可視化', left: 'center' },
    tooltip: { trigger: 'item' },
    legend: { data: scatterData.map(s => s.name), bottom: 10 },
    xAxis: { type: 'value', name: 'PC1' },
    yAxis: { type: 'value', name: 'PC2' },
    series: scatterData
  })
}

const formatNumber = (num) => {
  return typeof num === 'number' ? num.toFixed(4) : 'N/A'
}

const formatVector = (vec) => {
  if (!Array.isArray(vec)) return 'N/A'
  return vec.map(v => v.toFixed(2)).join(', ')
}

const formatFilterSummary = (filter) => {
  if (!filter) return 'N/A'
  const parts = []
  if (filter.cities && filter.cities.length > 0) {
    parts.push(`城市: ${filter.cities.join(', ')}`)
  }
  if (filter.counties && filter.counties.length > 0) {
    parts.push(`區縣: ${filter.counties.join(', ')}`)
  }
  if (filter.semantic_tags && filter.semantic_tags.length > 0) {
    parts.push(`語義: ${filter.semantic_tags.join(', ')}`)
  }
  if (filter.name_pattern) {
    parts.push(`名稱: ${filter.name_pattern}`)
  }
  return parts.length > 0 ? parts.join(' | ') : '無篩選條件'
}

const handleApiError = (error) => {
  if (error.status === 401) {
    showError('此功能需要登錄，請先登錄')
    setTimeout(() => {
      router.push('/auth?redirect=/explore?tab=villages')
    }, 2000)
  } else if (error.status === 408) {
    showError('請求超時，請減少數據量或稍後重試')
  } else if (error.status === 500) {
    showError(`服務器錯誤：${error.message}`)
  } else {
    showError(error.message || '操作失敗')
  }
}
</script>

<style scoped>
.subset-analysis-page {
  padding: 12px;
  max-width: 1600px;
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
  margin-bottom: 16px;
}

.auth-warning {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  background: rgba(231, 76, 60, 0.1);
  border: 2px solid rgba(231, 76, 60, 0.3);
  border-radius: 12px;
  color: #e74c3c;
  font-weight: 500;
}

.lock-icon {
  font-size: 16px;
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

.filter-row {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
  align-items: center;
}

.glass-select,
.glass-input {
  padding: 8px 16px;
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

.glass-input.small {
  max-width: 100px;
}

.solid-button {
  padding: 8px 16px;
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
  padding: 6px 12px;
  font-size: 13px;
}

.solid-button.large {
  padding: 12px 32px;
  font-size: 16px;
}

.filter-actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.subset-info {
  margin-top: 16px;
  padding: 12px;
  background: rgba(74, 144, 226, 0.1);
  border-radius: 8px;
}

.info-label {
  font-weight: 600;
  color: var(--text-primary);
  margin-right: 8px;
}

.info-value {
  color: #4a90e2;
  font-weight: 500;
}

.subset-selector {
  display: flex;
  gap: 24px;
  align-items: center;
  margin-bottom: 24px;
}

.subset-card {
  flex: 1;
  padding: 12px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 12px;
  border: 2px solid rgba(74, 144, 226, 0.2);
}

.subset-card h4 {
  margin: 0 0 16px 0;
  color: var(--text-primary);
}

.subset-stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
}

.stat-item .label {
  color: var(--text-secondary);
}

.stat-item .value {
  font-weight: 600;
  color: var(--text-primary);
}

.vs-divider {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-secondary);
}

.comparison-actions {
  display: flex;
  justify-content: center;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.metric-card {
  padding: 16px;
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
  font-size: 24px;
  font-weight: 700;
  color: #4a90e2;
}

.chart-container {
  width: 100%;
  height: 400px;
  margin-bottom: 24px;
}

.glass-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 16px;
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

.diff-value.positive {
  color: #50c878;
}

.diff-value.negative {
  color: #e74c3c;
}

.clustering-controls {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.control-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.control-row label {
  font-weight: 500;
  color: var(--text-primary);
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
  .subset-analysis-page {
    padding: 12px;
  }

  .filter-row {
    flex-direction: column;
  }

  .subset-selector {
    flex-direction: column;
  }

  .vs-divider {
    transform: rotate(90deg);
  }

  .clustering-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .chart-container {
    height: 300px;
  }
}
</style>

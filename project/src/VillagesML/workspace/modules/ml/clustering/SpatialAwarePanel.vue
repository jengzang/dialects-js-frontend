<template>
  <div class="spatial-aware-panel">
    <h3 class="villagesml-subtab-title">
      ML計算 - 空間感知聚類
      <HelpIcon content="基於空間聚類結果的二次聚類。先進行空間聚類（DBSCAN/HDBSCAN），再對每個空間聚類提取特徵（語義、字符、結構、空間統計）進行二次聚類。發現空間聚集區域的語言模式差異" />
    </h3>
    <div class="two-col-layout">
    <div class="settings-section glass-panel">
      <h3 class="panel-title">空間感知聚類</h3>
      <p class="panel-description">基於空間聚類結果的二次聚類分析</p>

      <div v-if="!isAuthenticated" class="auth-notice vm-auth-notice">
        <span class="notice-icon">🔒</span>
        <span>此功能需要登錄後使用</span>
      </div>

      <div v-else class="settings-form vm-settings-form">
        <AlgorithmSelector v-model="settings.algorithm" />

        <div v-if="settings.algorithm !== 'dbscan'" class="setting-row vm-setting-row-top">
          <label class="setting-label vm-setting-label-top">聚類數量 (k)</label>
          <input
            type="number"
            v-model.number="settings.k"
            min="2"
            max="20"
            class="setting-input vm-setting-input"
          />
        </div>

        <div class="setting-row vm-setting-row-top">
          <label class="setting-label vm-setting-label-top">空間聚類 Run ID</label>
          <div class="setting-control vm-setting-control">
            <SimpleSelectDropdown
              v-model="settings.spatial_run_id"
              :options="spatialRunIdOptions"
            />
            <span class="setting-hint">選擇已有的空間聚類結果</span>
          </div>
        </div>

        <SpatialFeatureToggles v-model="settings.features" />
        <PreprocessingSettings v-model="settings.preprocessing" />

        <button @click="runClustering" :disabled="loading" class="run-button solid-button">
          <span v-if="loading" class="loading-spinner">⏳</span>
          <span v-else>🚀</span>
          {{ loading ? '運行中...' : '運行聚類' }}
        </button>
      </div>
    </div>

    <div class="results-section">
      <ClusteringResultsPanel :results="results" :loading="loading" />
    </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { villagesMLStore } from '@/VillagesML/store/villagesMLStore.js'
import { userStore } from '@/main/store/store.js'
import { runSpatialAwareClustering } from '@/api/index.js'
import { showSuccess, showError, showWarning } from '@/utils/message.js'
import SimpleSelectDropdown from '@/components/common/SimpleSelectDropdown.vue'
import HelpIcon from '@/components/ToastAndHelp/HelpIcon.vue'
import AlgorithmSelector from './shared/AlgorithmSelector.vue'
import PreprocessingSettings from './shared/PreprocessingSettings.vue'
import SpatialFeatureToggles from './shared/SpatialFeatureToggles.vue'
import ClusteringResultsPanel from '../ClusteringResultsPanel.vue'

const settings = computed(() => villagesMLStore.spatialAwareSettings)
const isAuthenticated = computed(() => userStore.isAuthenticated)
const loading = ref(false)
const results = ref(null)

// Options for SimpleSelectDropdown
const spatialRunIdOptions = [
  { label: '超密集核心聚類', value: 'spatial_eps_05' },
  { label: '自動多密度聚類', value: 'spatial_hdbscan_v1' },
  { label: '標準密度聚類', value: 'spatial_eps_10' },
  { label: '全域覆蓋聚類', value: 'spatial_eps_20' }
]

async function runClustering() {
  if (!isAuthenticated.value) {
    showWarning('請先登錄')
    return
  }

  if (settings.value.algorithm !== 'dbscan' && (!settings.value.k || settings.value.k < 2)) {
    showError('聚類數量 k 必須 ≥ 2')
    return
  }

  loading.value = true
  villagesMLStore.clusteringLoading = true

  try {
    const params = {
      algorithm: settings.value.algorithm,
      k: settings.value.algorithm === 'dbscan' ? null : settings.value.k,
      spatial_run_id: settings.value.spatial_run_id,
      features: settings.value.features,
      preprocessing: settings.value.preprocessing,
      random_state: settings.value.random_state
    }

    const data = await runSpatialAwareClustering(params)

    // Normalize response for ClusteringResultsPanel compatibility
    const normalized = {
      ...data,
      n_regions: data.n_spatial_clusters,
      assignments: data.assignments?.map(a => ({
        region_name: `SC-${a.spatial_cluster_id}`,
        cluster_id: a.meta_cluster_id
      }))
    }
    results.value = normalized
    villagesMLStore.clusteringResults = normalized

    const nClusters = data.metrics?.n_clusters ?? data.k
    showSuccess(`聚類完成！發現 ${nClusters} 個元聚類`)
  } catch (error) {
    console.error('空間感知聚類失敗:', error)
    showError(error.message || '聚類失敗')
  } finally {
    loading.value = false
    villagesMLStore.clusteringLoading = false
  }
}
</script>

<style scoped>
.spatial-aware-panel {
  padding: 12px;
}

.two-col-layout {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 16px;
}

.settings-section {
  padding: 20px;
  overflow-y: auto;
}

.panel-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 8px 0;
}

.panel-description {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 20px;
  line-height: 1.5;
}

.setting-input,
.setting-select {
  flex: 1;
}

.setting-input:focus,
.setting-select:focus {
  outline: none;
  border-color: var(--color-primary);
  background: rgba(255, 255, 255, 0.7);
}

.setting-hint {
  font-size: 12px;
  color: var(--text-secondary);
  font-style: italic;
}

.run-button {
  margin-top: 8px;
  padding: 12px 24px;
}

.results-section {
  overflow-y: auto;
}

@media (max-width: 600px) {
  .two-col-layout {
    grid-template-columns: 1fr;
  }
}
</style>

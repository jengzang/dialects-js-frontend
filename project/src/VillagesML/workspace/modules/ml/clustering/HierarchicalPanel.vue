<template>
  <div class="hierarchical-panel">
    <h3 class="villagesml-subtab-title">
      ML計算 - 層次聚類
      <HelpIcon content="市-縣-鎮三級層次聚類分析。先對市級聚類，再在每個市級聚類內對縣級聚類，最後在每個縣級聚類內對鎮級聚類。特徵包括語義類別、字符嵌入、結構特徵。適合發現多尺度的地名模式" />
    </h3>
    <div class="two-col-layout">
    <div class="vml-glass-panel">
      <h3 class="panel-title">層次聚類</h3>
      <p class="panel-description">市-縣-鎮三級層次聚類分析</p>

      <div v-if="!isAuthenticated" class="auth-notice">
        <span class="notice-icon">🔒</span>
        <span>此功能需要登錄後使用</span>
      </div>

      <div v-else class="settings-form">
        <AlgorithmSelector v-model="settings.algorithm" />

        <div class="hierarchical-k-settings">
          <h4 class="section-title">層次聚類數量</h4>

          <div class="setting-row">
            <label class="setting-label">市級 k</label>
            <input
              type="number"
              v-model.number="settings.k_city"
              min="2"
              max="10"
              class="setting-input"
            />
          </div>

          <div class="setting-row">
            <label class="setting-label">縣級 k</label>
            <input
              type="number"
              v-model.number="settings.k_county"
              min="2"
              max="15"
              class="setting-input"
            />
          </div>

          <div class="setting-row">
            <label class="setting-label">鎮級 k</label>
            <input
              type="number"
              v-model.number="settings.k_township"
              min="2"
              max="20"
              class="setting-input"
            />
          </div>

          <p class="setting-hint">建議：市級 2-5，縣級 3-10，鎮級 5-15</p>
        </div>

        <FeatureToggles v-model="settings.features" />
        <PreprocessingSettings v-model="settings.preprocessing" />

        <button @click="runClustering" :disabled="loading" class="run-button solid-button">
          <span v-if="loading" class="ui-loading--hourglass" aria-hidden="true">⏳</span>
          <span v-else>🚀</span>
          {{ loading ? '運行中...' : '運行聚類' }}
        </button>
      </div>
    </div>

    <div class="results-section">
      <HierarchicalResultsPanel :results="results" :loading="loading" />
    </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { villagesMLStore } from '@/VillagesML/store/villagesMLStore.js'
import { userStore } from '@/main/store/store.js'
import { runHierarchicalClustering } from '@/api/index.js'
import { showSuccess, showError, showWarning } from '@/utils/message.js'
import HelpIcon from '@/components/ToastAndHelp/HelpIcon.vue'
import AlgorithmSelector from './shared/AlgorithmSelector.vue'
import PreprocessingSettings from './shared/PreprocessingSettings.vue'
import FeatureToggles from './shared/FeatureToggles.vue'
import HierarchicalResultsPanel from '../HierarchicalResultsPanel.vue'

const settings = computed(() => villagesMLStore.hierarchicalSettings)
const isAuthenticated = computed(() => userStore.isAuthenticated)
const loading = ref(false)
const results = ref(null)

async function runClustering() {
  if (!isAuthenticated.value) {
    showWarning('請先登錄')
    return
  }

  if (settings.value.k_city < 2 || settings.value.k_county < 2 || settings.value.k_township < 2) {
    showError('所有層級的 k 值必須 ≥ 2')
    return
  }

  loading.value = true
  villagesMLStore.clusteringLoading = true

  try {
    const params = {
      algorithm: settings.value.algorithm,
      k_city: settings.value.k_city,
      k_county: settings.value.k_county,
      k_township: settings.value.k_township,
      features: settings.value.features,
      preprocessing: settings.value.preprocessing,
      random_state: settings.value.random_state
    }

    const data = await runHierarchicalClustering(params)
    results.value = data
    villagesMLStore.clusteringResults = data

    showSuccess('層次聚類完成！')
  } catch (error) {
    console.error('層次聚類失敗:', error)
    showError(error.message || '聚類失敗')
  } finally {
    loading.value = false
    villagesMLStore.clusteringLoading = false
  }
}
</script>

<style scoped>
.hierarchical-panel {
  padding: 12px;
}

.two-col-layout {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 16px;
}

.two-col-layout > .vml-glass-panel {
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

.auth-notice {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(255, 193, 7, 0.15);
  border: 1px solid rgba(255, 193, 7, 0.3);
  border-radius: 10px;
  margin-bottom: 16px;
  font-size: 13px;
  color: #856404;
  font-weight: 500;
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.hierarchical-k-settings {
  padding: 16px;
  background: rgba(74, 144, 226, 0.08);
  border: 1px solid rgba(74, 144, 226, 0.2);
  border-radius: 12px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.setting-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.setting-label {
  min-width: 80px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.setting-input {
  padding: 10px 14px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
  font-size: 14px;
  width: 100px;
}

.setting-input:focus {
  outline: none;
  border-color: var(--color-primary);
  background: rgba(255, 255, 255, 0.7);
}

.setting-hint {
  font-size: 12px;
  color: var(--text-secondary);
  font-style: italic;
  margin-top: 4px;
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

<template>
  <div v-if="jobId && isVisible" class="job-status-panel main-glass-panel">
    <div class="panel-header">
      <div class="job-info">
        <span class="job-label">{{ t('praat.jobStatus.jobId') }}</span>
        <span class="job-id">{{ jobId }}</span>
      </div>
      <button v-if="status === 'queued' || status === 'running'"
              class="cancel-button"
              @click="$emit('cancel')">
        {{ t('praat.jobStatus.cancel') }}
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="status === 'queued' || status === 'running'" class="loading-content">
      <div class="ui-loading--page" aria-hidden="true"></div>
      <h3 class="loading-title">{{ t('praat.jobStatus.loading.title') }}</h3>
      <p class="loading-text">{{ stage || t('praat.jobStatus.loading.defaultText') }}</p>
      <div class="loading-progress">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
        </div>
        <span class="progress-text">{{ progress }}%</span>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="status === 'error' || status === 'failed'" class="error-content">
      <div class="error-icon">❌</div>
      <h3 class="error-title">{{ t('praat.jobStatus.error.title') }}</h3>
      <p class="error-text">{{ error || t('praat.jobStatus.error.defaultText') }}</p>
    </div>

    <!-- Completed State -->
    <div v-else-if="status === 'completed' || status === 'done'" class="completed-content">
      <div class="completed-icon">✅</div>
      <h3 class="completed-title">{{ t('praat.jobStatus.completed.title') }}</h3>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onUnmounted } from "vue"
import { useI18n } from 'vue-i18n'

const props = defineProps({
  jobId: { type: String, default: null },
  status: { type: String, default: 'queued' },
  progress: { type: Number, default: 0 },
  stage: { type: String, default: null },
  error: { type: String, default: null }
})

defineEmits(['cancel'])
const { t } = useI18n()
const isVisible = ref(true)
let timer = null

watch(() => props.status, (newStatus) => {
  if (newStatus === 'completed' || newStatus === 'done') {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      isVisible.value = false
    }, 3000)
  } else {
    isVisible.value = true
  }
}, { immediate: true })

onUnmounted(() => {
  if (timer) clearTimeout(timer)
})
</script>

<style scoped>
.job-status-panel {
  width: 95%;
  max-width: 800px;
  margin: 1rem auto;
  padding: 1rem;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  margin-bottom: 2rem;
}

.job-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.job-label {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.job-id {
  font-size: 0.9rem;
  font-family: 'Courier New', monospace;
  color: var(--color-text-primary);
  font-weight: 600;
}

.cancel-button {
  padding: 0.5rem 1rem;
  background: rgba(255, 59, 48, 0.15);
  color: #ff3b30;
  border: 1px solid rgba(255, 59, 48, 0.3);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.cancel-button:hover {
  background: rgba(255, 59, 48, 0.25);
  border-color: rgba(255, 59, 48, 0.5);
}

/* Loading State */
.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 2rem 0;
}



.loading-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 0.5rem;
}

.loading-text {
  font-size: 1rem;
  color: var(--color-text-secondary);
  margin-bottom: 2rem;
}

.loading-progress {
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #007aff, #5ac8fa);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.9rem;
  font-weight: 600;
  color: #007aff;
  text-align: center;
}

/* Error State */
.error-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 2rem 0;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.error-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #ff3b30;
  margin-bottom: 0.5rem;
}

.error-text {
  font-size: 1rem;
  color: var(--color-text-secondary);
}

/* Completed State */
.completed-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 2rem 0;
}

.completed-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.completed-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #34c759;
}
</style>

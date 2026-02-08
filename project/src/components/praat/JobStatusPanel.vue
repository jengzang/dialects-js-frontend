<template>
  <div v-if="jobId" class="job-status-panel glass-panel">
    <h2 class="panel-title">任務狀態</h2>

    <!-- Status Display -->
    <div class="status-display">
      <div class="status-badge" :class="`status-${status}`">
        <span class="status-icon">{{ getStatusIcon(status) }}</span>
        <span class="status-text">{{ getStatusText(status) }}</span>
      </div>

      <div v-if="stage && status === 'running'" class="stage-display">
        當前階段: {{ getStageText(stage) }}
      </div>
    </div>

    <!-- Progress Bar -->
    <div v-if="status === 'running' || status === 'queued'" class="progress-container">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: `${progress * 100}%` }"></div>
      </div>
      <div class="progress-text">{{ Math.round(progress * 100) }}%</div>
    </div>

    <!-- Error Message -->
    <div v-if="status === 'error' && error" class="error-message">
      <span class="error-icon">⚠️</span>
      <span>{{ error }}</span>
    </div>

    <!-- Cancel Button -->
    <button
      v-if="status === 'running' || status === 'queued'"
      class="cancel-button glass-button"
      @click="$emit('cancel')"
    >
      取消任務
    </button>
  </div>
</template>

<script setup>
defineProps({
  jobId: {
    type: String,
    default: null
  },
  status: {
    type: String,
    default: 'queued'
  },
  progress: {
    type: Number,
    default: 0
  },
  stage: {
    type: String,
    default: null
  },
  error: {
    type: String,
    default: null
  }
})

defineEmits(['cancel'])

const getStatusIcon = (status) => {
  const icons = {
    queued: '⏳',
    running: '⚙️',
    completed: '✅',
    error: '❌',
    canceled: '🚫'
  }
  return icons[status] || '❓'
}

const getStatusText = (status) => {
  const texts = {
    queued: '排隊中',
    running: '分析中',
    completed: '已完成',
    error: '失敗',
    canceled: '已取消'
  }
  return texts[status] || '未知'
}

const getStageText = (stage) => {
  const stages = {
    decode: '音頻解碼',
    pitch: '基頻分析',
    intensity: '強度分析',
    formant: '共振峰分析',
    voice_quality: '音質分析',
    segments: '音段分析',
    finalize: '結果整理'
  }
  return stages[stage] || stage
}
</script>

<style scoped>
.job-status-panel {
  padding: 2rem;
  margin-bottom: 1.5rem;
}

.panel-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: var(--color-text-primary);
}

.status-display {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-full);
  font-weight: 600;
  width: fit-content;
}

.status-queued {
  background: rgba(255, 204, 0, 0.2);
  color: #ff9500;
}

.status-running {
  background: rgba(0, 122, 255, 0.2);
  color: #007aff;
  animation: pulse 2s ease-in-out infinite;
}

.status-completed {
  background: rgba(52, 199, 89, 0.2);
  color: #34c759;
}

.status-error {
  background: rgba(255, 59, 48, 0.2);
  color: #ff3b30;
}

.status-canceled {
  background: rgba(142, 142, 147, 0.2);
  color: #8e8e93;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.status-icon {
  font-size: 1.2rem;
}

.status-text {
  font-size: 1rem;
}

.stage-display {
  font-size: 0.95rem;
  color: var(--color-text-secondary);
  padding-left: 0.5rem;
}

.progress-container {
  margin-bottom: 1.5rem;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: var(--glass-light);
  border-radius: var(--radius-full);
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #007aff, #5856d6);
  border-radius: var(--radius-full);
  transition: width 0.3s ease;
}

.progress-text {
  text-align: center;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: rgba(255, 59, 48, 0.1);
  border-radius: var(--radius-md);
  color: var(--color-error);
  margin-bottom: 1rem;
}

.error-icon {
  font-size: 1.2rem;
}

.cancel-button {
  width: 100%;
  padding: 0.75rem;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  background: var(--color-error);
  color: white;
}

.cancel-button:hover {
  opacity: 0.9;
  transform: translateY(-2px);
}
</style>

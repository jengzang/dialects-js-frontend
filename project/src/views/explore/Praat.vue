<template>
  <div class="praat-page">
    <div class="page-header">
      <h1 class="page-title">Praat 聲學分析</h1>
      <p class="page-description">上傳音頻或錄音，進行專業的聲學特徵分析</p>
    </div>

    <div class="page-content">
      <!-- Settings Button and Mode Selector -->
      <div class="settings-trigger">
        <button class="settings-button glass-button" @click="showSettings = true">
          <span class="settings-icon">⚙️</span>
          <span>分析設置</span>
        </button>

        <div class="mode-selector-inline">
          <div class="mode-options">
            <label class="radio-option glass-button" :class="{ active: settings.mode === 'single' }">
              <input type="radio" value="single" v-model="settings.mode" />
              <span>單音節</span>
            </label>
            <label class="radio-option glass-button" :class="{ active: settings.mode === 'continuous' }">
              <input type="radio" value="continuous" v-model="settings.mode" />
              <span>連續語流</span>
            </label>
          </div>
        </div>
      </div>

      <!-- Audio Input -->
      <AudioInputPanel @file-selected="handleFileSelected" />

      <!-- Start Analysis Button -->
      <div v-if="audioFile && !jobId" class="action-section">
        <button
          class="start-button glass-button"
          @click="startAnalysis"
          :disabled="isUploading"
        >
          <span v-if="isUploading">上傳中...</span>
          <span v-else>開始分析</span>
        </button>
      </div>

      <!-- Job Status -->
      <JobStatusPanel
        v-if="jobId"
        :job-id="jobId"
        :status="jobStatus"
        :progress="jobProgress"
        :stage="jobStage"
        :error="jobError"
        @cancel="cancelAnalysis"
      />

      <!-- Analysis Results -->
      <AnalysisResultsPanel :results="analysisResults" />
    </div>

    <!-- Settings Sidebar -->
    <Transition name="overlay">
      <div v-if="showSettings" class="sidebar-overlay" @click="showSettings = false"></div>
    </Transition>

    <Transition name="sidebar">
      <div v-if="showSettings" class="settings-sidebar">
        <div class="sidebar-header">
          <h2 class="sidebar-title">分析設置</h2>
          <button class="close-button" @click="showSettings = false">✕</button>
        </div>
        <div class="sidebar-content">
          <SettingsPanel v-model:settings="settings" />
        </div>
      </div>
    </Transition>

    <!-- Audio Preview Floating Window -->
    <Transition name="preview-fade">
      <div v-if="audioBlob" class="audio-preview-float">
        <AudioPreviewPanel :audio-blob="audioBlob" />
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, reactive, onBeforeUnmount, watch, onMounted } from 'vue'
import AudioInputPanel from '../../components/praat/AudioInputPanel.vue'
import AudioPreviewPanel from '../../components/praat/AudioPreviewPanel.vue'
import SettingsPanel from '../../components/praat/SettingsPanel.vue'
import JobStatusPanel from '../../components/praat/JobStatusPanel.vue'
import AnalysisResultsPanel from '../../components/praat/AnalysisResultsPanel.vue'
import { usePraatApi } from '@/composables/usePraatApi.js'

const { uploadAudio, createJob, getJobStatus, getJobResult, cancelJob } = usePraatApi()

const STORAGE_KEY = 'praat_analysis_settings'

// UI state
const showSettings = ref(false)

// Audio state
const audioFile = ref(null)
const audioBlob = ref(null)

// Upload state
const isUploading = ref(false)
const uploadId = ref(null)

// Job state
const jobId = ref(null)
const jobStatus = ref('queued')
const jobProgress = ref(0)
const jobStage = ref(null)
const jobError = ref(null)

// Results
const analysisResults = ref(null)

// Default settings
const defaultSettings = {
  mode: 'single',
  modules: ['basic', 'pitch', 'intensity', 'formant'],
  pitch_options: {
    f0_min: 75,
    f0_max: 500,
    time_step: 0.01
  },
  formant_options: {
    max_formants: 5,
    max_freq_hz: 5500
  },
  intensity_options: {
    min_pitch: 100
  },
  output_options: {
    downsample_hz: 100,
    include_timeseries: true,
    include_summary: true
  }
}

// Load settings from localStorage
const loadSettings = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      return { ...defaultSettings, ...parsed }
    }
  } catch (error) {
    console.error('Failed to load settings:', error)
  }
  return defaultSettings
}

// Save settings to localStorage
const saveSettings = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch (error) {
    console.error('Failed to save settings:', error)
  }
}

// Settings
const settings = reactive(loadSettings())

// Watch settings changes and save to localStorage
watch(settings, () => {
  saveSettings()
}, { deep: true })

// Polling
let pollingInterval = null

const handleFileSelected = (file, blob) => {
  audioFile.value = file
  audioBlob.value = blob
  // Reset previous analysis
  jobId.value = null
  jobStatus.value = 'queued'
  analysisResults.value = null
  uploadId.value = null
}

const startAnalysis = async () => {
  if (!audioFile.value) return

  try {
    // Upload audio
    isUploading.value = true
    const uploadResponse = await uploadAudio(audioFile.value)
    uploadId.value = uploadResponse.upload_id
    isUploading.value = false

    // Create job
    const jobResponse = await createJob(uploadId.value, settings)
    jobId.value = jobResponse.job_id

    // Start polling
    startPolling()
  } catch (error) {
    console.error('Start analysis error:', error)
    alert(error.message || '啟動分析失敗')
    isUploading.value = false
  }
}

const startPolling = () => {
  if (pollingInterval) {
    clearInterval(pollingInterval)
  }

  pollingInterval = setInterval(async () => {
    try {
      const status = await getJobStatus(jobId.value)
      jobStatus.value = status.status
      jobProgress.value = status.progress || 0
      jobStage.value = status.stage
      jobError.value = status.error

      if (status.status === 'completed') {
        stopPolling()
        await fetchResults()
      } else if (status.status === 'error' || status.status === 'canceled') {
        stopPolling()
      }
    } catch (error) {
      console.error('Polling error:', error)
    }
  }, 2000)
}

const stopPolling = () => {
  if (pollingInterval) {
    clearInterval(pollingInterval)
    pollingInterval = null
  }
}

const fetchResults = async () => {
  try {
    const results = await getJobResult(jobId.value, 'full')
    analysisResults.value = results
  } catch (error) {
    console.error('Fetch results error:', error)
    alert('獲取分析結果失敗')
  }
}

const cancelAnalysis = async () => {
  if (!jobId.value) return

  try {
    await cancelJob(jobId.value)
    stopPolling()
    jobStatus.value = 'canceled'
  } catch (error) {
    console.error('Cancel error:', error)
    alert('取消任務失敗')
  }
}

// Cleanup on page close
onBeforeUnmount(() => {
  stopPolling()
  if (jobId.value && (jobStatus.value === 'running' || jobStatus.value === 'queued')) {
    cancelJob(jobId.value).catch(console.error)
  }
})

// Cancel job on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    if (jobId.value && (jobStatus.value === 'running' || jobStatus.value === 'queued')) {
      navigator.sendBeacon(`/api/praat/jobs/${jobId.value}`, JSON.stringify({ _method: 'DELETE' }))
    }
  })
}
</script>

<style scoped>
.praat-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0;
}

.page-header {
  text-align: center;
  margin-bottom: 1rem;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, var(--color-primary), var(--color-accent-purple));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-description {
  font-size: 1.1rem;
  margin:0;
  color: var(--color-text-secondary);
}

.page-content {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.action-section {
  margin-bottom: 1.5rem;
}

.start-button {
  width: 100%;
  padding: 1.25rem;
  font-size: 1.1rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  background: linear-gradient(135deg, var(--color-primary), var(--color-accent-purple));
  color: white;
  transition: all 0.3s ease;
}

.start-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 122, 255, 0.3);
}

.start-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Settings Trigger */
.settings-trigger {
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.settings-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
}

.settings-icon {
  font-size: 1.2rem;
}

/* Mode Selector Inline */
.mode-selector-inline {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.mode-label {
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--color-text-primary);
  white-space: nowrap;
}

.mode-options {
  display: flex;
  gap: 0.5rem;
}

.mode-options .radio-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  position: relative;
}

.mode-options .radio-option input[type="radio"] {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}

.mode-options .radio-option.active {
  background: linear-gradient(135deg, var(--color-primary), var(--color-accent-purple));
  color: white;
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
}

.mode-options .radio-option:not(.active):hover {
  background: var(--glass-medium);
  transform: translateY(-1px);
}

/* Sidebar Overlay */
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.settings-sidebar {
  position: fixed;
  /* 调整位置，让它悬浮起来更有“液态”感 */
  top: 15px;
  left: 15px;
  bottom: 15px;
  width: 380px;
  max-width: calc(100vw - 30px);

  /* 1. 圆角：苹果风格的核心，大圆角才会显得圆润 */
  border-radius: 24px;

  /* 2. 背景：降低透明度，让底色更透 */
  background: rgba(255, 255, 255, 0.4);

  /* 3. 增强模糊：saturate 稍微拉高一点点，模拟折射 */
  backdrop-filter: blur(40px) saturate(200%);
  -webkit-backdrop-filter: blur(40px) saturate(200%);

  /* 4. 复合阴影：这是液态感的关键 */
  box-shadow:
      0 20px 50px rgba(0, 0, 0, 0.1),            /* 整体浮动感 */
      inset 0 0 0 1.5px rgba(255, 255, 255, 0.5), /* 环绕的高光边框，模拟玻璃边缘折射 */
      inset 0 1px 1px rgba(255, 255, 255, 0.8);   /* 顶部微弱亮边 */

  /* 取消原来的 border-right，改用阴影里的 inset 模拟更高级 */
  border: none;

  z-index: 1000;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
}

/* 彻底重构 Header */
.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 20px 16px 20px; /* 增加顶部间距 */

  /* 移除生硬的背景和边框 */
  background: transparent;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  border-bottom: none;

  /* 使用字体权重和字间距提升高级感 */
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif;
}

.sidebar-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.close-button {
  width: 2.5rem;
  height: 2.5rem;
  border: none;
  border-radius: 50%;
  background: var(--glass-light);
  color: var(--color-text-primary);
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.close-button:hover {
  background: var(--color-error);
  color: white;
  transform: rotate(90deg);
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

.sidebar-content::-webkit-scrollbar {
  width: 6px;
}

.sidebar-content::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.sidebar-content::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

/* Sidebar Transition */
.sidebar-enter-active,
.sidebar-leave-active {
  transition: transform 0.3s ease;
}

.sidebar-enter-from {
  transform: translateX(-100%);
}

.sidebar-leave-to {
  transform: translateX(-100%);
}

/* Overlay Transition */
.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 0.3s ease;
}

.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}

/* Audio Preview Floating Window */
.audio-preview-float {
  position: fixed;
  top: 120px;
  right: 2rem;
  width: 320px;
  max-width: calc(100vw - 4rem);
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(60px) saturate(200%);
  -webkit-backdrop-filter: blur(60px) saturate(200%);
  border-radius: var(--radius-xl);
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  z-index: 100;
  overflow: hidden;
}

/* Preview Fade Transition */
.preview-fade-enter-active,
.preview-fade-leave-active {
  transition: all 0.3s ease;
}

.preview-fade-enter-from {
  opacity: 0;
  transform: translateX(20px) scale(0.95);
}

.preview-fade-leave-to {
  opacity: 0;
  transform: translateX(20px) scale(0.95);
}

@media (max-width: 768px) {
  .praat-page {
    padding: 0;
  }

  .page-title {
    font-size: 2rem;
  }

  .settings-sidebar {
    width: 95%;
    max-width: 100vw;
  }

  .audio-preview-float {
    position: relative;
    top: auto;
    right: auto;
    width: 100%;
    max-width: 100%;
    margin-bottom: 1.5rem;
  }
}
</style>

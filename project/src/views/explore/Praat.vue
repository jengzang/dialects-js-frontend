<template>
  <div class="praat-page">
    <!-- Login Button (top right) -->
    <div v-if="!userStore.isAuthenticated" class="login-prompt">
      <button class="login-button glass-button" @click="goToLogin">
        <span>🔒</span>
        <span>請先登錄</span>
      </button>
    </div>

    <div class="page-header">
      <h1 class="page-title">Praat 聲學分析</h1>
      <p class="page-description">（還沒開發完，可以先試試）上傳音頻或錄音，進行專業的聲學特徵分析</p>
    </div>

    <!-- Tab Navigation -->
    <div class="tab-navigation">
      <div class="tab-container">
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'prepare' }"
          @click="switchTab('prepare')"
        >
          上傳錄音
        </button>
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'results', disabled: !resultsTabEnabled }"
          :disabled="!resultsTabEnabled"
          @click="switchTab('results')"
        >
          分析結果
        </button>
      </div>
    </div>

<!--    <div class="page-content">-->
      <!-- Tab Content (using v-show for keep-alive behavior) -->
      <!-- Tab 1: Prepare Analysis -->
      <div v-show="activeTab === 'prepare'" class="page-content" :class="{ 'tab-hidden': activeTab !== 'prepare' }">
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
          <AudioInputPanel
            @file-selected="handleFileSelected"
            @segments-ready="handleSegmentsReady"
          />

          <!-- Start Analysis Button -->
<!--          <div v-if="audioFile && !jobId" class="action-section">-->
          <div  class="action-section">
            <button
                class="start-button glass-button"
                @click="startAnalysis"
                :disabled="isUploading || !audioFile"
                :class="{ 'disabled-state': !audioFile }"
            >
              <span v-if="isUploading">上傳中...</span>
              <span v-else-if="!audioFile">請先選擇錄音</span>
              <span v-else>開始分析</span>
            </button>
          </div>
        </div>

      <!-- Tab 2: Analysis Results -->
      <div v-show="activeTab === 'results'" class="page-content" :class="{ 'tab-hidden': activeTab !== 'results' }">
          <!-- Job Status (Inline) -->
          <div v-if="jobId" class="job-status-inline">
            <JobStatusPanel
              :job-id="jobId"
              :status="jobStatus"
              :progress="jobProgress"
              :stage="jobStage"
              :error="jobError"
              @cancel="cancelAnalysis"
            />
          </div>

          <!-- Analysis Results -->
          <AnalysisResultsPanel :results="analysisResults" />
        </div>
<!--    </div>-->

    <!-- Job Status (Left Floating Window) - REMOVED, now inline in Tab 2 -->

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

    <!-- Audio Preview Floating Window (Only on Tab 1) -->
    <Transition name="preview-fade">
      <div v-if="showAudioPreview" class="audio-preview-float">
        <button class="preview-close-button" @click="showPreview = false" title="關閉預覽">
          ✕
        </button>
        <AudioPreviewPanel
          :audio-blob="audioBlob"
          :segments="audioSegments"
          @segment-selected="handleSegmentSelected"
        />
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, reactive, onBeforeUnmount, watch, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import AudioInputPanel from '../../components/praat/AudioInputPanel.vue'
import AudioPreviewPanel from '../../components/praat/AudioPreviewPanel.vue'
import SettingsPanel from '../../components/praat/SettingsPanel.vue'
import JobStatusPanel from '../../components/praat/JobStatusPanel.vue'
import AnalysisResultsPanel from '../../components/praat/AnalysisResultsPanel.vue'
import { usePraatApi } from '@/api/praat'
import { userStore } from '@/utils/store.js'
import { showWarning, showError } from '@/utils/message.js'

const router = useRouter()
const { uploadAudio, createJob, getJobStatus, getJobResult, cancelJob } = usePraatApi()

const STORAGE_KEY = 'praat_analysis_settings'

// Tab state
const activeTab = ref('prepare') // 'prepare' | 'results'
const resultsTabEnabled = ref(false)

// UI state
const showSettings = ref(false)
const showPreview = ref(true)

// Login function
const goToLogin = () => {
  router.push('/auth')
}

// Tab switching function
const switchTab = (tab) => {
  if (tab === 'results' && !resultsTabEnabled.value) return
  activeTab.value = tab

  // Auto-show preview when returning to Tab 1 if there's audio data
  if (tab === 'prepare' && (audioBlob.value || audioSegments.value.length > 0)) {
    showPreview.value = true
  }
}

// Computed property for audio preview visibility
const showAudioPreview = computed(() => {
  return activeTab.value === 'prepare' && (audioBlob.value || audioSegments.value.length > 0) && showPreview.value
})

// Audio state
const audioFile = ref(null)
const audioBlob = ref(null)
const audioSegments = ref([])
const selectedSegment = ref(null)

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
  // console.log('🔴 父组件收到了文件:', file); // <--- 加上这一行！
  audioFile.value = file
  audioBlob.value = blob
  audioSegments.value = [] // Clear segments for single file
  selectedSegment.value = null
  showPreview.value = true

  // Reset previous analysis
  jobId.value = null
  jobStatus.value = 'queued'
  analysisResults.value = null
  uploadId.value = null

  // Reset tab state
  resultsTabEnabled.value = false
  activeTab.value = 'prepare'
}

const handleSegmentsReady = (segments) => {
  audioSegments.value = segments
  audioBlob.value = null // Clear single blob
  audioFile.value = null
  selectedSegment.value = segments[0] // Auto-select first segment
  showPreview.value = true

  // Reset previous analysis
  jobId.value = null
  jobStatus.value = 'queued'
  analysisResults.value = null
  uploadId.value = null

  // Reset tab state
  resultsTabEnabled.value = false
  activeTab.value = 'prepare'
}

const handleSegmentSelected = (segment) => {
  selectedSegment.value = segment
  // 【修复】：加个判断，防止把已有的 file 覆盖成 undefined
  if (segment.file) {
    audioFile.value = segment.file
  }
  // blob 通常都有，可以照常更新
  if (segment.blob) {
    audioBlob.value = segment.blob
  }
}

const startAnalysis = async () => {
  if (!audioFile.value) return

  // Check if user is logged in
  if (!userStore.isAuthenticated) {
    showWarning('請先登錄！')
    return
  }

  // Enable results tab and auto-switch
  resultsTabEnabled.value = true
  activeTab.value = 'results'

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
    showError(error.message || '啟動分析失敗')
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

      if (status.status === 'completed' || status.status === 'done') {
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
    // No auto-close - user controls tab visibility
  } catch (error) {
    console.error('Fetch results error:', error)
    showError('獲取分析結果失敗')
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
    showError('取消任務失敗')
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
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 95dvh;
}

/* Login Prompt */
.login-prompt {
  position: fixed;
  top: 2rem;
  right: 2rem;
  z-index: 200;
}

.login-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  background: rgba(255, 59, 48, 0.15);
  color: var(--color-error);
  border: 1px solid rgba(255, 59, 48, 0.3);
}

.login-button:hover {
  background: var(--color-error);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 59, 48, 0.3);
}

.page-header {
  text-align: center;
  margin-bottom: 1rem;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  margin-top: 1rem;
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

/* Tab Navigation - Floating Left */
.tab-navigation {
  position: fixed;
  top: 140px;
  left: 2rem;
  z-index: 100;
}

.tab-container {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 4px;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(60px) saturate(200%);
  -webkit-backdrop-filter: blur(60px) saturate(200%);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12),
              inset 0 1px 0 rgba(255, 255, 255, 0.6);
}

.tab-btn {
  padding: 12px 16px;
  border: none;
  background: transparent;
  color: #6e6e73;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: -0.01em;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
  min-width: 100px;
  text-align: center;
}

.tab-btn:hover:not(.active):not(:disabled) {
  background: rgba(0, 0, 0, 0.04);
  color: #1d1d1f;
  transform: translateX(2px);
}

.tab-btn.active {
  background: #ffffff;
  color: #0071e3;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08),
              0 1px 2px rgba(0, 0, 0, 0.06);
  font-weight: 600;
}

.tab-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}


/* Tab Hidden (for v-show keep-alive) */
.tab-hidden {
  display: none !important;
}

/* Tab Fade Transition - No longer used with v-show */
.tab-fade-enter-active,
.tab-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.tab-fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.tab-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.page-content {
  display: flex;
  justify-items: center;
  align-items: center;
  flex-direction: column;
  gap: 0;
  overflow-y: auto;
  overflow-x: hidden;
  max-height: 75dvh;
  border-radius: 25px;
  width: 90dvw;
}
@media (max-aspect-ratio: 1/1) {
  .page-content{
    max-height: 80dvh;
  }

}

.action-section {
  margin-bottom: 1.5rem;
}

.start-button {
  width: 100%;
  padding: 1rem 1.5rem;
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
  background: linear-gradient(135deg, var(--color-primary), var(--color-accent-purple));
}

.start-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  filter: grayscale(0.8); /* 让颜色变灰，提示不可用 */
  box-shadow: none;
}

/* Job Status Inline (in Tab 2) */
.job-status-inline {
  margin-bottom: 1.5rem;
}

/* Settings Trigger */
.settings-trigger {
  margin-bottom: 1rem;
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
  top: 140px;
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

.preview-close-button {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  width: 1.75rem;
  height: 1.75rem;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.6);
  color: var(--color-text-primary);
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 10;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.preview-close-button:hover {
  background: var(--color-error);
  color: white;
  transform: rotate(90deg) scale(1.1);
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

/* Mobile Responsive */
/* Mobile Responsive */
@media (max-width: 768px) {
  .praat-page {
    padding: 0;
  }

  .page-title {
    font-size: 2rem;
  }

  .tab-navigation {
    position: fixed;
    bottom: auto;
    top: 1rem;
    left: 50%;
    transform: translateX(-50%);
    width: auto;
  }

  .tab-container {
    flex-direction: row;
    width: auto;
  }

  .tab-btn {
    flex: 1;
    font-size: 13px;
    padding: 10px 16px;
    min-width: 90px;
  }

  .settings-sidebar {
    width: 95%;
    max-width: 100vw;
  }

  .audio-preview-float {
    position: fixed;
    bottom: auto;
    top: 0;
    left: 0;
    right: 0;
    width: 100%;
    max-width: 100%;
    border-radius:  0 0 var(--radius-xl) var(--radius-xl);
    box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.15);
  }

  .preview-close-button {
    top: 1rem;
    right: 1rem;
  }
}
</style>

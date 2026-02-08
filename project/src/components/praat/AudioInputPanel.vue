<template>
  <div class="audio-input-panel glass-panel">
<!--    <h2 class="panel-title">音頻輸入</h2>-->

    <!-- File Upload Area -->
    <div
      class="upload-area"
      :class="{ 'drag-over': isDragOver }"
      @drop="handleDrop"
      @dragover.prevent="isDragOver = true"
      @dragleave="isDragOver = false"
      @click="triggerFileInput"
    >
      <div class="upload-icon">🎵</div>
      <p class="upload-text">拖拽音頻文件到此處或點擊選擇</p>
      <p class="upload-hint">支持 WAV, MP3, OGG, WEBM, M4A 格式，最大 50MB</p>
      <input
        ref="fileInput"
        type="file"
        accept="audio/*"
        @change="handleFileSelect"
        style="display: none"
      />
    </div>

    <!-- Recording Controls -->
    <div class="recording-section">
      <div class="divider">
        <span>或</span>
      </div>

      <button
        class="record-button glass-button"
        :class="{ 'recording': isRecording }"
        @click="toggleRecording"
        :disabled="isProcessing"
      >
        <span class="record-icon">{{ isRecording ? '⏹' : '🎤' }}</span>
        <span>{{ isRecording ? '停止錄音' : '開始錄音' }}</span>
      </button>

      <div v-if="isRecording" class="recording-timer">
        錄音中... {{ recordingTime }}s
      </div>
    </div>

    <!-- Selected File Info -->
    <div v-if="selectedFile" class="file-info glass-panel-inner">
      <div class="file-details">
        <span class="file-name">📁 {{ selectedFile.name }}</span>
        <span class="file-size">{{ formatFileSize(selectedFile.size) }}</span>
      </div>
      <button class="clear-button" @click="clearFile">✕</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onBeforeUnmount } from 'vue'

const emit = defineEmits(['file-selected'])

const isDragOver = ref(false)
const isRecording = ref(false)
const isProcessing = ref(false)
const selectedFile = ref(null)
const recordingTime = ref(0)
const fileInput = ref(null)

let mediaRecorder = null
let audioChunks = []
let recordingTimer = null
let mediaStream = null

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
const MAX_RECORDING_TIME = 60 // 60 seconds
const SUPPORTED_FORMATS = ['audio/wav', 'audio/mpeg', 'audio/mp3', 'audio/ogg', 'audio/webm', 'audio/m4a', 'audio/x-m4a']

const validateFile = (file) => {
  if (file.size > MAX_FILE_SIZE) {
    alert('文件大小超過 50MB 限制')
    return false
  }

  const fileType = file.type || ''
  const fileExt = file.name.split('.').pop().toLowerCase()
  const isSupported = SUPPORTED_FORMATS.some(format => fileType.includes(format.split('/')[1])) ||
                      ['wav', 'mp3', 'ogg', 'webm', 'm4a'].includes(fileExt)

  if (!isSupported) {
    alert('不支持的音頻格式，請上傳 WAV, MP3, OGG, WEBM 或 M4A 文件')
    return false
  }

  return true
}

const handleDrop = (event) => {
  event.preventDefault()
  isDragOver.value = false

  const file = event.dataTransfer.files[0]
  if (file && validateFile(file)) {
    processFile(file)
  }
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file && validateFile(file)) {
    processFile(file)
  }
}

const processFile = (file) => {
  selectedFile.value = file
  const blob = new Blob([file], { type: file.type })
  emit('file-selected', file, blob)
}

const toggleRecording = async () => {
  if (isRecording.value) {
    stopRecording()
  } else {
    await startRecording()
  }
}

const startRecording = async () => {
  try {
    isProcessing.value = true
    mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true })

    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : 'audio/ogg;codecs=opus'

    mediaRecorder = new MediaRecorder(mediaStream, { mimeType })
    audioChunks = []

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data)
      }
    }

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: mimeType })
      const audioFile = new File([audioBlob], `recording-${Date.now()}.webm`, { type: mimeType })
      selectedFile.value = audioFile
      emit('file-selected', audioFile, audioBlob)
      cleanupRecording()
    }

    mediaRecorder.start()
    isRecording.value = true
    isProcessing.value = false
    recordingTime.value = 0

    recordingTimer = setInterval(() => {
      recordingTime.value++
      if (recordingTime.value >= MAX_RECORDING_TIME) {
        stopRecording()
      }
    }, 1000)
  } catch (error) {
    console.error('Recording error:', error)
    alert('無法訪問麥克風，請檢查權限設置')
    isProcessing.value = false
  }
}

const stopRecording = () => {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop()
  }
  isRecording.value = false
  if (recordingTimer) {
    clearInterval(recordingTimer)
    recordingTimer = null
  }
}

const cleanupRecording = () => {
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop())
    mediaStream = null
  }
}

const clearFile = () => {
  selectedFile.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

onBeforeUnmount(() => {
  if (isRecording.value) {
    stopRecording()
  }
  cleanupRecording()
})
</script>

<style scoped>
.audio-input-panel {
  padding: 1rem 2rem;
  margin-bottom: 1.5rem;
}

.panel-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: var(--color-text-primary);
}

.upload-area {
  border: 2px dashed var(--glass-border);
  border-radius: var(--radius-xl);
  padding: 1rem 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: var(--glass-light);
}

.upload-area:hover,
.upload-area.drag-over {
  border-color: var(--color-primary);
  background: var(--glass-medium);
  transform: translateY(-2px);
}

.upload-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.upload-text {
  font-size: 1.1rem;
  color: var(--color-text-primary);
  margin-bottom: 0.5rem;
}

.upload-hint {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.recording-section {
  margin-top: 1.5rem;
}

.divider {
  text-align: center;
  margin: 0.5rem 0;
  position: relative;
}

.divider::before,
.divider::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 45%;
  height: 1px;
  background: var(--glass-border);
}

.divider::before { left: 0; }
.divider::after { right: 0; }

.divider span {
  background: var(--glass-medium);
  padding: 0 1rem;
  color: var(--color-text-secondary);
}

.record-button {
  width: 100%;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 1rem;
  border: none;
  cursor: pointer;
}

.record-button.recording {
  background: var(--color-error);
  color: white;
}

.record-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.record-icon {
  font-size: 1.5rem;
}

.recording-timer {
  text-align: center;
  margin-top: 1rem;
  font-size: 1.1rem;
  color: var(--color-error);
  font-weight: 600;
}

.file-info {
  margin-top: 1.5rem;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.file-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.file-name {
  font-weight: 500;
  color: var(--color-text-primary);
}

.file-size {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.clear-button {
  background: var(--glass-light);
  border: none;
  border-radius: var(--radius-md);
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.clear-button:hover {
  background: var(--color-error);
  color: white;
  transform: scale(1.1);
}
</style>

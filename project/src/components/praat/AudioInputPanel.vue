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
      <p class="upload-hint">支持 WAV, MP3, M4A, WebM, OGG, FLAC, AAC 格式</p>
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
      <div class="recording-row">
        <div class="divider-inline">
          <span>或者</span>
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
      </div>

      <div v-if="isRecording" class="recording-timer">
        錄音中... {{ recordingTime }}s
      </div>
    </div>

    <!-- Selected File Info -->
    <div v-if="displayFile" class="file-info glass-panel-inner">
      <div class="file-details">
        <span class="file-name">📁 {{ displayFile.name }}</span>
        <span class="file-size">{{ formatFileSize(displayFile.size) }}</span>
      </div>
      <button class="clear-button" @click="clearFile">✕</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'
import { showError } from '@/utils/message.js'

const props = defineProps({
  selectedSegment: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['file-selected', 'segments-ready'])

const isDragOver = ref(false)
const isRecording = ref(false)
const isProcessing = ref(false)
const selectedFile = ref(null)
const recordingTime = ref(0)
const fileInput = ref(null)

// Computed property for display file (priority: selectedSegment > local selectedFile)
const displayFile = computed(() => {
  if (props.selectedSegment && props.selectedSegment.file) {
    return props.selectedSegment.file
  }
  return selectedFile.value
})

let mediaRecorder = null
let audioChunks = []
let recordingTimer = null
let mediaStream = null

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 50MB
const MAX_RECORDING_TIME = 60 // 60 seconds
const MAX_SEGMENT_DURATION = 10 // 10 seconds per segment
const SUPPORTED_FORMATS = ['audio/wav', 'audio/mpeg', 'audio/mp3', 'audio/ogg', 'audio/webm', 'audio/m4a', 'audio/x-m4a', 'audio/flac', 'audio/aac', 'audio/x-aac']

const validateFile = (file) => {
  if (file.size > MAX_FILE_SIZE) {
    showError('文件大小超過 50MB 限制')
    return false
  }

  const fileType = file.type || ''
  const fileExt = file.name.split('.').pop().toLowerCase()
  const isSupported = SUPPORTED_FORMATS.some(format => fileType.includes(format.split('/')[1])) ||
                      ['wav', 'mp3', 'ogg', 'webm', 'm4a', 'flac', 'aac'].includes(fileExt)

  if (!isSupported) {
    showError('不支持的音頻格式，請上傳 WAV, MP3, M4A, WebM, OGG, FLAC 或 AAC 文件')
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

const processFile = async (file) => {
  selectedFile.value = file
  isProcessing.value = true

  try {
    // Check audio duration and split if necessary
    const segments = await checkAndSplitAudio(file)

    if (segments.length === 1) {
      // Single segment, emit as before
      const blob = new Blob([file], { type: file.type })
      emit('file-selected', file, blob)
    } else {
      // Multiple segments, emit segments array
      emit('segments-ready', segments)
    }
  } catch (error) {
    console.error('Process file error:', error)
    showError('處理音頻文件失敗：' + error.message)
  } finally {
    isProcessing.value = false
  }
}

const checkAndSplitAudio = async (file) => {
  return new Promise((resolve, reject) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const fileReader = new FileReader()

    fileReader.onload = async (e) => {
      try {
        const arrayBuffer = e.target.result
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
        const duration = audioBuffer.duration

        if (duration <= MAX_SEGMENT_DURATION) {
          // No splitting needed
          resolve([{
            file: file,
            blob: new Blob([file], { type: file.type }),
            duration: duration,
            startTime: 0,
            endTime: duration,
            index: 0,
            name: file.name,
            origin: 'original'  // Tag as original segment
          }])
        } else {
          // Split into segments
          const segments = await splitAudioBuffer(audioBuffer, file)
          resolve(segments)
        }

        audioContext.close()
      } catch (error) {
        audioContext.close()
        reject(error)
      }
    }

    fileReader.onerror = () => {
      reject(new Error('無法讀取音頻文件'))
    }

    fileReader.readAsArrayBuffer(file)
  })
}

const splitAudioBuffer = async (audioBuffer, originalFile) => {
  const duration = audioBuffer.duration
  const sampleRate = audioBuffer.sampleRate
  const numberOfChannels = audioBuffer.numberOfChannels
  const segmentDuration = MAX_SEGMENT_DURATION
  const numSegments = Math.ceil(duration / segmentDuration)
  const segments = []

  for (let i = 0; i < numSegments; i++) {
    const startTime = i * segmentDuration
    const endTime = Math.min((i + 1) * segmentDuration, duration)
    const segmentLength = Math.floor((endTime - startTime) * sampleRate)
    const startOffset = Math.floor(startTime * sampleRate)

    // Create new audio buffer for segment
    const segmentBuffer = new AudioContext().createBuffer(
      numberOfChannels,
      segmentLength,
      sampleRate
    )

    // Copy audio data for each channel
    for (let channel = 0; channel < numberOfChannels; channel++) {
      const sourceData = audioBuffer.getChannelData(channel)
      const segmentData = segmentBuffer.getChannelData(channel)
      for (let j = 0; j < segmentLength; j++) {
        segmentData[j] = sourceData[startOffset + j]
      }
    }

    // Convert buffer to WAV blob
    const blob = await audioBufferToWav(segmentBuffer)
    const fileName = `${originalFile.name.replace(/\.[^/.]+$/, '')}_segment_${i + 1}.wav`
    const file = new File([blob], fileName, { type: 'audio/wav' })

    segments.push({
      file: file,
      blob: blob,
      duration: endTime - startTime,
      startTime: startTime,
      endTime: endTime,
      index: i,
      name: fileName,
      origin: 'auto-split'  // Tag as auto-split segment
    })
  }

  return segments
}

const audioBufferToWav = (audioBuffer) => {
  const numberOfChannels = audioBuffer.numberOfChannels
  const sampleRate = audioBuffer.sampleRate
  const format = 1 // PCM
  const bitDepth = 16

  const bytesPerSample = bitDepth / 8
  const blockAlign = numberOfChannels * bytesPerSample

  const data = []
  for (let i = 0; i < audioBuffer.length; i++) {
    for (let channel = 0; channel < numberOfChannels; channel++) {
      const sample = audioBuffer.getChannelData(channel)[i]
      const int16 = Math.max(-1, Math.min(1, sample)) * 0x7FFF
      data.push(int16 < 0 ? int16 + 0x10000 : int16)
    }
  }

  const dataLength = data.length * bytesPerSample
  const buffer = new ArrayBuffer(44 + dataLength)
  const view = new DataView(buffer)

  // WAV header
  writeString(view, 0, 'RIFF')
  view.setUint32(4, 36 + dataLength, true)
  writeString(view, 8, 'WAVE')
  writeString(view, 12, 'fmt ')
  view.setUint32(16, 16, true) // fmt chunk size
  view.setUint16(20, format, true)
  view.setUint16(22, numberOfChannels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * blockAlign, true)
  view.setUint16(32, blockAlign, true)
  view.setUint16(34, bitDepth, true)
  writeString(view, 36, 'data')
  view.setUint32(40, dataLength, true)

  // Write audio data
  let offset = 44
  for (let i = 0; i < data.length; i++) {
    view.setInt16(offset, data[i], true)
    offset += 2
  }

  return new Blob([buffer], { type: 'audio/wav' })
}

const writeString = (view, offset, string) => {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i))
  }
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

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunks, { type: mimeType })
      const audioFile = new File([audioBlob], `recording-${Date.now()}.webm`, { type: mimeType })
      selectedFile.value = audioFile

      // Check and split recorded audio
      try {
        const segments = await checkAndSplitAudio(audioFile)
        if (segments.length === 1) {
          emit('file-selected', audioFile, audioBlob)
        } else {
          emit('segments-ready', segments)
        }
      } catch (error) {
        console.error('Process recording error:', error)
        emit('file-selected', audioFile, audioBlob)
      }

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
    showError('無法訪問麥克風，請檢查權限設置')
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
  max-width: 800px;
  padding: 1rem 5rem;
  margin-bottom: 1.5rem;
}

@media (max-aspect-ratio: 1/1) {
  .audio-input-panel {
    padding: 1rem 1rem;
  }
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

.recording-row {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.divider-inline {
  flex-shrink: 0;
  padding: 0.5rem 1rem;
  background: var(--glass-light);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

.record-button {
  flex: 1;
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
.record-button.recording:hover{
  background: var(--color-error);
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
  margin-top: 1rem;
  padding: 0.8rem;
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
  font-size: 15px;
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

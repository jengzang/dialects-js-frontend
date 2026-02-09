<template>
  <div v-if="effectiveSegments.length > 0 || audioBlob" class="audio-preview-panel">
    <h3 class="panel-title">
      🎵 音頻預覽
      <span v-if="effectiveSegments.length > 1" class="segment-count">({{ effectiveSegments.length }} 個片段)</span>
    </h3>

    <!-- Mode Toggle -->
    <div v-if="audioBlob && totalDuration <= 10" class="mode-selector">
      <button
        :class="{ active: mode === 'auto' }"
        @click="switchMode('auto')"
        class="mode-button">
        分段結果
      </button>
      <button
        :class="{ active: mode === 'manual' }"
        @click="switchMode('manual')"
        class="mode-button">
        手動分段
      </button>
    </div>

    <!-- Manual Mode -->
    <div v-if="mode === 'manual' && audioBlob" class="manual-mode">
      <!-- Full Waveform Section -->
      <div class="full-waveform-section">
        <div class="waveform-header">
          <h4>完整波形 ({{ totalDuration.toFixed(1) }}秒)</h4>
        </div>
        <div ref="fullWaveformContainer" class="full-waveform"></div>
        <p class="hint">💡 拖動波形選擇區域，或點擊「添加分段」按鈕</p>
      </div>

      <!-- Control Buttons -->
      <div class="control-buttons">
        <button @click="addRegion" class="btn-add glass-button">
          ➕ 添加分段
        </button>
        <button @click="clearAllRegions" class="btn-clear glass-button">
          🗑️ 清除全部
        </button>
        <button v-if="manualRegions.length > 0" @click="resetToOriginal" class="btn-reset glass-button">
          🔄 恢復原始
        </button>
<!--        <button @click="autoSegment" class="btn-auto glass-button">-->
<!--          ✂️ 自動分段(10s)-->
<!--        </button>-->
      </div>

      <!-- Validation Messages -->
      <div v-if="validationError" class="validation-error">
        ⚠️ {{ validationError }}
      </div>

      <!-- Selected Regions List -->
      <div v-if="manualRegions.length > 0" class="regions-list">
        <h4>已選分段 ({{ manualRegions.length }})</h4>
        <div
          v-for="(region, index) in manualRegions"
          :key="region.id"
          class="region-card glass-panel-inner"
        >
          <div class="region-header">
            <span class="region-badge" :style="{ backgroundColor: region.color }">
              分段 {{ index + 1 }}
            </span>
            <span class="region-duration">{{ region.duration.toFixed(1) }}秒</span>
            <button @click="deleteRegion(region.id)" class="btn-delete">
              🗑️
            </button>
          </div>

          <!-- Region Waveform Preview -->
          <div :ref="el => setRegionWaveformRef(region.id, el)" class="region-waveform"></div>

          <!-- Time Controls -->
          <div class="time-controls">
            <label>
              開始: <input
                type="number"
                v-model.number="region.start"
                @change="updateRegionTime(region)"
                step="0.1"
                min="0"
                :max="totalDuration"
              />s
            </label>
            <label>
              結束: <input
                type="number"
                v-model.number="region.end"
                @change="updateRegionTime(region)"
                step="0.1"
                min="0"
                :max="totalDuration"
              />s
            </label>
            <span class="duration-display">時長: {{ region.duration.toFixed(1) }}s</span>
          </div>

          <!-- Playback Controls -->
          <div class="playback-controls">
            <button @click="togglePlayRegion(region.id)" class="control-button glass-button">
              {{ region.playing ? '⏸️' : '▶️' }}
            </button>
            <button @click="stopRegion(region.id)" class="control-button glass-button">
              ⏹️
            </button>
            <span class="time-display">
              {{ formatTime(region.currentTime) }} / {{ formatTime(region.duration) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Auto Mode (Original) -->
    <div v-else class="auto-mode">
      <div v-if="effectiveSegments.length > 1" class="info-banner">
        <span class="info-icon">ℹ️</span>
        <span>以下為各段音頻，請選擇要分析的片段。</span>
      </div>

      <div class="segments-container">
        <div
            v-for="(segment, index) in effectiveSegments"
            :key="index"
            class="segment-item"
            :class="{ 'selected': selectedIndex === index }"
            @click="selectSegment(index)"
            draggable="true"
            @dragstart="handleDragStart($event, segment)"
        >
          <div class="segment-header">
            <div class="segment-info">
              <span class="segment-number">片段 {{ index + 1 }}</span>
              <span class="segment-badge" :class="`badge-${segment.origin || 'unknown'}`">
                {{ getSegmentBadgeText(segment.origin) }}
              </span>
              <span class="segment-duration">
                {{ formatTime(realDurations[index] || segment.duration || 0) }}
              </span>
              <span v-if="segment.startTime > 0" class="segment-time-range">
                ({{ formatTime(segment.startTime) }} - {{ formatTime(segment.endTime) }})
              </span>
            </div>
            <div class="segment-actions">
              <span v-if="selectedIndex === index" class="selected-badge">✓ 已選擇</span>
              <span class="drag-hint">⋮⋮</span>
            </div>
          </div>

          <div :ref="el => waveformRefs[index] = el" class="waveform-container"></div>

          <div class="controls">
            <button class="control-button glass-button" @click.stop="togglePlayPause(index)">
              <span class="control-icon">{{ playingIndex === index ? '⏸' : '▶' }}</span>
            </button>

            <div class="time-display">
              <span class="current-time">{{ formatTime(currentTimes[index] || 0) }}</span>
              <span class="separator">/</span>
              <span class="duration">
                {{ formatTime(realDurations[index] || segment.duration || 0) }}
              </span>
            </div>

            <button class="control-button glass-button" @click.stop="stop(index)">
              <span class="control-icon">⏹</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, nextTick, computed } from 'vue'
import WaveSurfer from 'wavesurfer.js'
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.esm.js'

const props = defineProps({
  audioBlob: {
    type: Blob,
    default: null
  },
  segments: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['segment-selected', 'manual-segments-ready'])

// Auto mode state
const waveformRefs = ref([])
const playingIndex = ref(-1)
const selectedIndex = ref(0)
const currentTimes = ref({})
const realDurations = ref({})
let wavesurfers = []

// Manual mode state
const mode = ref('auto')
const fullWaveformContainer = ref(null)
const fullWaveform = ref(null)
const manualRegions = ref([])
const regionWaveformRefs = ref({})
const validationError = ref('')
const totalDuration = ref(0)
let regionsPlugin = null

// Region colors
const regionColors = [
  '#34c759',  // Green
  '#007aff',  // Blue
  '#ff9500',  // Orange
  '#ff2d55',  // Pink
  '#5856d6',  // Purple
]

const effectiveSegments = computed(() => {
  if (props.segments && props.segments.length > 0) {
    return props.segments
  } else if (props.audioBlob) {
    return [{
      blob: props.audioBlob,
      duration: 0,
      startTime: 0,
      endTime: 0,
      index: 0,
      name: 'Original Audio'
    }]
  }
  return []
})

// Helper function to get segment badge text
const getSegmentBadgeText = (origin) => {
  const badges = {
    'original': '原始音頻',
    'auto-split': '自動分段',
    'manual': '手動分段'
  }
  return badges[origin] || '未知'
}

// Helper to set region waveform refs
const setRegionWaveformRef = (regionId, el) => {
  if (el) {
    regionWaveformRefs.value[regionId] = el
  }
}

// Switch between auto and manual mode
const switchMode = async (newMode) => {
  mode.value = newMode

  if (newMode === 'manual') {
    await nextTick()
    await initFullWaveform()
  } else {
    // Clean up manual mode
    if (fullWaveform.value) {
      fullWaveform.value.destroy()
      fullWaveform.value = null
    }
    manualRegions.value = []
    validationError.value = ''

    // Reinitialize auto mode
    await initWaveSurfers()
  }
}

// Initialize full waveform for manual mode
const initFullWaveform = async () => {
  if (!fullWaveformContainer.value || !props.audioBlob) return

  // Destroy existing instance
  if (fullWaveform.value) {
    fullWaveform.value.destroy()
  }

  // Create WaveSurfer instance
  fullWaveform.value = WaveSurfer.create({
    container: fullWaveformContainer.value,
    waveColor: 'rgba(0, 122, 255, 0.3)',
    progressColor: '#007aff',
    cursorColor: '#007aff',
    height: 120,
    responsive: true,
    barWidth: 2,
    barGap: 1,
    barRadius: 2
  })

  // Load audio
  await fullWaveform.value.loadBlob(props.audioBlob)
  totalDuration.value = fullWaveform.value.getDuration()

  // Create regions plugin
  regionsPlugin = fullWaveform.value.registerPlugin(RegionsPlugin.create({
    dragSelection: {
      slop: 5,
      color: 'rgba(0, 122, 255, 0.2)'
    }
  }))

  // Listen for region events
  regionsPlugin.on('region-created', handleRegionCreated)
  regionsPlugin.on('region-updated', handleRegionUpdated)

  regionsPlugin.enableDragSelection({
    color: 'rgba(0, 122, 255, 0.2)'
  })
}

// Add a new region
const addRegion = () => {
  if (!fullWaveform.value || !regionsPlugin) return

  const currentTime = fullWaveform.value.getCurrentTime()
  const start = currentTime
  const end = Math.min(start + 2, totalDuration.value)

  regionsPlugin.addRegion({
    start: start,
    end: end,
    color: regionColors[manualRegions.value.length % regionColors.length],
    drag: true,
    resize: true
  })
}

// Handle region created
const handleRegionCreated = async (region) => {
  const duration = region.end - region.start

  // Validate duration
  if (duration > 10) {
    validationError.value = '分段不能超過 10 秒'
    region.remove()
    return
  }

  // Check for overlaps
  if (hasOverlap(region)) {
    validationError.value = '分段不能重疊'
    region.remove()
    return
  }

  validationError.value = ''

  // Add to manual regions
  const regionData = {
    id: region.id,
    start: region.start,
    end: region.end,
    duration: duration,
    color: region.color,
    playing: false,
    currentTime: 0,
    wavesurfer: null,
    blob: null,
    region: region
  }

  manualRegions.value.push(regionData)

  // Extract audio for this region
  await nextTick()
  await initRegionWaveform(regionData)

  // Emit manual segments
  emitManualSegments()
}

// Handle region updated
const handleRegionUpdated = (region) => {
  const regionData = manualRegions.value.find(r => r.id === region.id)
  if (!regionData) return

  const duration = region.end - region.start

  // Validate duration
  if (duration > 10) {
    validationError.value = '分段不能超過 10 秒'
    region.update({ start: regionData.start, end: regionData.end })
    return
  }

  // Check for overlaps
  if (hasOverlap(region)) {
    validationError.value = '分段不能重疊'
    region.update({ start: regionData.start, end: regionData.end })
    return
  }

  validationError.value = ''

  // Update region data
  regionData.start = region.start
  regionData.end = region.end
  regionData.duration = duration

  // Re-extract audio
  initRegionWaveform(regionData)

  // Emit manual segments
  emitManualSegments()
}

// Update region time from input
const updateRegionTime = (regionData) => {
  if (regionData.start >= regionData.end) {
    validationError.value = '開始時間必須小於結束時間'
    return
  }

  const duration = regionData.end - regionData.start
  if (duration > 10) {
    validationError.value = '分段不能超過 10 秒'
    return
  }

  validationError.value = ''
  regionData.duration = duration

  // Update the region on waveform
  if (regionData.region) {
    regionData.region.update({
      start: regionData.start,
      end: regionData.end
    })
  }

  // Re-extract audio
  initRegionWaveform(regionData)

  // Emit manual segments
  emitManualSegments()
}

// Check for overlaps
const hasOverlap = (newRegion) => {
  if (!regionsPlugin) return false

  const existingRegions = regionsPlugin.getRegions().filter(r => r.id !== newRegion.id)

  return existingRegions.some(region => {
    return (newRegion.start < region.end && newRegion.end > region.start)
  })
}

// Extract region audio
const extractRegionAudio = async (start, end) => {
  const audioContext = new AudioContext()
  const arrayBuffer = await props.audioBlob.arrayBuffer()
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)

  const sampleRate = audioBuffer.sampleRate
  const startSample = Math.floor(start * sampleRate)
  const endSample = Math.floor(end * sampleRate)
  const length = endSample - startSample

  // Create new buffer for region
  const regionBuffer = audioContext.createBuffer(
    audioBuffer.numberOfChannels,
    length,
    sampleRate
  )

  // Copy audio data
  for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
    const sourceData = audioBuffer.getChannelData(channel)
    const regionData = regionBuffer.getChannelData(channel)
    for (let i = 0; i < length; i++) {
      regionData[i] = sourceData[startSample + i]
    }
  }

  // Convert to WAV blob
  return audioBufferToWav(regionBuffer)
}

// Convert audio buffer to WAV
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
  view.setUint32(16, 16, true)
  view.setUint16(20, format, true)
  view.setUint16(22, numberOfChannels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * blockAlign, true)
  view.setUint16(32, blockAlign, true)
  view.setUint16(34, bitDepth, true)
  writeString(view, 36, 'data')
  view.setUint32(40, dataLength, true)

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

// Initialize region waveform
const initRegionWaveform = async (regionData) => {
  const container = regionWaveformRefs.value[regionData.id]
  if (!container) return

  // Destroy existing wavesurfer
  if (regionData.wavesurfer) {
    regionData.wavesurfer.destroy()
  }

  // Extract audio for this region
  const regionBlob = await extractRegionAudio(regionData.start, regionData.end)
  regionData.blob = regionBlob

  // Create WaveSurfer for region preview
  const wavesurfer = WaveSurfer.create({
    container: container,
    waveColor: 'rgba(0, 122, 255, 0.3)',
    progressColor: regionData.color,
    height: 60,
    responsive: true,
    barWidth: 2,
    barGap: 1,
    barRadius: 2
  })

  await wavesurfer.loadBlob(regionBlob)
  regionData.wavesurfer = wavesurfer

  // Setup event listeners
  wavesurfer.on('play', () => {
    regionData.playing = true
  })

  wavesurfer.on('pause', () => {
    regionData.playing = false
  })

  wavesurfer.on('finish', () => {
    regionData.playing = false
  })

  wavesurfer.on('audioprocess', () => {
    regionData.currentTime = wavesurfer.getCurrentTime()
  })
}

// Toggle play region
const togglePlayRegion = (regionId) => {
  const regionData = manualRegions.value.find(r => r.id === regionId)
  if (regionData && regionData.wavesurfer) {
    regionData.wavesurfer.playPause()
  }
}

// Stop region
const stopRegion = (regionId) => {
  const regionData = manualRegions.value.find(r => r.id === regionId)
  if (regionData && regionData.wavesurfer) {
    regionData.wavesurfer.stop()
    regionData.currentTime = 0
  }
}

// Delete region
const deleteRegion = (regionId) => {
  // Remove from WaveSurfer
  if (regionsPlugin) {
    const region = regionsPlugin.getRegions().find(r => r.id === regionId)
    if (region) {
      region.remove()
    }
  }

  // Remove from manual regions
  const index = manualRegions.value.findIndex(r => r.id === regionId)
  if (index !== -1) {
    // Destroy wavesurfer instance
    if (manualRegions.value[index].wavesurfer) {
      manualRegions.value[index].wavesurfer.destroy()
    }
    manualRegions.value.splice(index, 1)
  }

  validationError.value = ''

  // Emit manual segments
  emitManualSegments()
}

// Clear all regions
const clearAllRegions = () => {
  if (regionsPlugin) {
    regionsPlugin.clearRegions()
  }

  // Destroy all wavesurfer instances
  manualRegions.value.forEach(region => {
    if (region.wavesurfer) {
      region.wavesurfer.destroy()
    }
  })

  manualRegions.value = []
  validationError.value = ''

  // Emit empty segments
  emitManualSegments()
}

// Reset to original segments
const resetToOriginal = () => {
  clearAllRegions()
  // This will trigger emitManualSegments with empty array
  // which will restore original segments in parent
}

// Auto segment
const autoSegment = () => {
  clearAllRegions()

  const segmentDuration = 10
  const numSegments = Math.ceil(totalDuration.value / segmentDuration)

  for (let i = 0; i < numSegments; i++) {
    const start = i * segmentDuration
    const end = Math.min((i + 1) * segmentDuration, totalDuration.value)

    regionsPlugin.addRegion({
      start: start,
      end: end,
      color: regionColors[i % regionColors.length],
      drag: true,
      resize: true
    })
  }
}

// Emit manual segments
const emitManualSegments = () => {
  if (manualRegions.value.length === 0) {
    emit('manual-segments-ready', [])
    return
  }

  // Sort regions by start time
  const sortedRegions = [...manualRegions.value].sort((a, b) => a.start - b.start)

  const segments = sortedRegions.map((region, index) => {
    const fileName = `manual_segment_${index + 1}.wav`
    const file = new File([region.blob], fileName, { type: 'audio/wav' })

    return {
      file: file,
      blob: region.blob,
      duration: region.duration,
      startTime: region.start,
      endTime: region.end,
      index: index,
      name: fileName,
      origin: 'manual'  // Tag as manual segment
    }
  })

  emit('manual-segments-ready', segments)
}

// Auto mode functions
const initWaveSurfers = async () => {
  // 销毁旧实例
  wavesurfers.forEach(ws => ws && ws.destroy())
  wavesurfers = []

  await nextTick()

  // 遍历 effectiveSegments
  effectiveSegments.value.forEach((segment, index) => {
    const container = waveformRefs.value[index]
    if (!container) return

    const wavesurfer = WaveSurfer.create({
      container: container,
      waveColor: 'rgba(0, 122, 255, 0.3)',
      progressColor: '#007aff',
      cursorColor: '#007aff',
      height: 60,
      responsive: true,
      barWidth: 2,
      barGap: 1,
      barRadius: 2
    })

    wavesurfer.on('play', () => {
      playingIndex.value = index
      wavesurfers.forEach((ws, i) => {
        if (i !== index && ws && ws.isPlaying()) {
          ws.pause()
        }
      })
    })

    wavesurfer.on('pause', () => {
      if (playingIndex.value === index) playingIndex.value = -1
    })

    wavesurfer.on('finish', () => {
      if (playingIndex.value === index) playingIndex.value = -1
    })

    wavesurfer.on('audioprocess', () => {
      currentTimes.value[index] = wavesurfer.getCurrentTime()
    })

    wavesurfer.on('seek', () => {
      currentTimes.value[index] = wavesurfer.getCurrentTime()
    })

    wavesurfer.on('ready', () => {
      const duration = wavesurfer.getDuration()
      realDurations.value[index] = duration

      if (!segment.duration) {
        segment.duration = duration
      }
    })

    wavesurfer.loadBlob(segment.blob)
    wavesurfers[index] = wavesurfer
  })
}

const selectSegment = (index) => {
  selectedIndex.value = index
  emit('segment-selected', effectiveSegments.value[index])
}

const togglePlayPause = (index) => {
  const wavesurfer = wavesurfers[index]
  if (wavesurfer) wavesurfer.playPause()
}

const stop = (index) => {
  const wavesurfer = wavesurfers[index]
  if (wavesurfer) {
    wavesurfer.stop()
    currentTimes.value[index] = 0
  }
}

const handleDragStart = (event, segment) => {
  event.dataTransfer.effectAllowed = 'copy'
  event.dataTransfer.setData('application/json', JSON.stringify({
    type: 'audio-segment',
    segment: {
      name: segment.name,
      duration: segment.duration,
      index: segment.index
    }
  }))
  if (segment.file && event.dataTransfer.items) {
    event.dataTransfer.items.add(segment.file)
  }
}

const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

watch(effectiveSegments, async (newSegments) => {
  if (newSegments.length > 0 && mode.value === 'auto') {
    await initWaveSurfers()
    selectSegment(0)
  }
})

onMounted(async () => {
  if (effectiveSegments.value.length > 0) {
    await initWaveSurfers()
    selectSegment(0)
  }
})

onBeforeUnmount(() => {
  wavesurfers.forEach(ws => ws && ws.destroy())
  if (fullWaveform.value) {
    fullWaveform.value.destroy()
  }
  manualRegions.value.forEach(region => {
    if (region.wavesurfer) {
      region.wavesurfer.destroy()
    }
  })
})
</script>

<style scoped>
.audio-preview-panel {
  padding: 1.25rem;
}

.panel-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--color-text-primary);
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.segment-count {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  font-weight: 500;
}

.info-banner {
  background: rgba(0, 122, 255, 0.1);
  border: 1px solid rgba(0, 122, 255, 0.3);
  border-radius: var(--radius-md);
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: var(--color-primary);
}

.info-icon {
  font-size: 1.1rem;
  flex-shrink: 0;
}

.segments-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 400px;
  overflow-y: auto;
  padding-right: 0.25rem;
}

.segments-container::-webkit-scrollbar {
  width: 6px;
}

.segments-container::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.segment-item {
  background: rgba(255, 255, 255, 0.5);
  border: 2px solid transparent;
  border-radius: var(--radius-lg);
  padding: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
}


.segment-item.selected {
  border-color: var(--color-primary);
  background: rgba(0, 122, 255, 0.05);
  box-shadow: 0 4px 16px rgba(0, 122, 255, 0.2);
}

.segment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.segment-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.segment-number {
  font-weight: 600;
  color: var(--color-text-primary);
  font-size: 0.9rem;
}

.segment-badge {
  padding: 0.15rem 0.4rem;
  border-radius: var(--radius-sm);
  font-size: 0.7rem;
  font-weight: 600;
  color: white;
}

.badge-original {
  background: #34c759;  /* Green */
}

.badge-auto-split {
  background: #007aff;  /* Blue */
}

.badge-manual {
  background: #ff9500;  /* Orange */
}

.badge-unknown {
  background: #8e8e93;  /* Gray */
}

.segment-duration {
  font-size: 0.85rem;
  color: var(--color-primary);
  font-weight: 500;
}

.segment-time-range {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.segment-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.selected-badge {
  background: var(--color-primary);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 600;
}

.drag-hint {
  color: var(--color-text-secondary);
  font-size: 1.2rem;
  cursor: grab;
  opacity: 0.5;
  transition: opacity 0.3s ease;
}

.segment-item:hover .drag-hint {
  opacity: 1;
}

.segment-item:active .drag-hint {
  cursor: grabbing;
}

.waveform-container {
  background: rgba(255, 255, 255, 0.5);
  border-radius: var(--radius-md);
  padding: 0.5rem;
  margin-bottom: 0.75rem;
}

.controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.control-button {
  width: 2rem;
  height: 2rem;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.6);
}

.control-button:hover {
  transform: scale(1.1);
  background: rgba(255, 255, 255, 0.8);
}

.control-icon {
  font-size: 1rem;
}

.time-display {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.8rem;
  color: var(--color-text-primary);
  min-width: 70px;
  justify-content: center;
  font-variant-numeric: tabular-nums;
}

.separator {
  color: var(--color-text-secondary);
}

/* Manual Mode Styles */
.mode-selector {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  justify-content: center;
}

.mode-button {
  flex: 1;
  padding: 0.5rem 1rem;
  border: 2px solid var(--glass-border);
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  font-weight: 500;
}

.mode-button.active {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.mode-button:hover:not(.active) {
  background: rgba(255, 255, 255, 0.7);
  transform: translateY(-1px);
}

.manual-mode {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.full-waveform-section {
  background: rgba(255, 255, 255, 0.5);
  border-radius: var(--radius-lg);
  padding: 1rem;
}

.waveform-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.waveform-header h4 {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.full-waveform {
  background: rgba(255, 255, 255, 0.7);
  border-radius: var(--radius-md);
  padding: 0.5rem;
  margin-bottom: 0.5rem;
}

.hint {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  text-align: center;
  margin: 0.5rem 0 0 0;
}

.control-buttons {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.control-buttons button {
  flex: 1;
  padding: 0.6rem 1rem;
  font-size: 0.85rem;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-add {
  background: var(--color-primary);
  color: white;
}

.btn-add:hover {
  background: #0066cc;
  transform: translateY(-2px);
}

.btn-clear {
  background: var(--color-error);
  color: white;
}

.btn-clear:hover {
  background: #cc0000;
  transform: translateY(-2px);
}

.btn-reset {
  background: #3da35d;
  color: white;
}

.btn-reset:hover {
  background: #3da35d;
  transform: translateY(-2px);
}

.btn-auto {
  background: var(--color-primary);
  color: white;
}

.btn-auto:hover {
  background: #3da35d;
  transform: translateY(-2px);
}

.validation-error {
  background: rgba(255, 59, 48, 0.1);
  border: 1px solid rgba(255, 59, 48, 0.3);
  border-radius: var(--radius-md);
  padding: 0.75rem;
  color: var(--color-error);
  font-size: 0.85rem;
  text-align: center;
}

.regions-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.regions-list h4 {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 0.5rem 0;
  text-align: center;
}

.region-card {
  background: rgba(255, 255, 255, 0.5);
  border-radius: var(--radius-lg);
  padding: 0.75rem;
  transition: all 0.3s ease;
}

.region-card:hover {
  background: rgba(255, 255, 255, 0.7);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.region-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.region-badge {
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-sm);
  color: white;
  font-size: 0.8rem;
  font-weight: 600;
}

.region-duration {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  font-weight: 500;
}

.btn-delete {
  background: rgba(255, 59, 48, 0.1);
  border: none;
  border-radius: var(--radius-sm);
  padding: 0.25rem 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.btn-delete:hover {
  background: var(--color-error);
  transform: scale(1.1);
}

.region-waveform {
  background: rgba(255, 255, 255, 0.7);
  border-radius: var(--radius-md);
  padding: 0.5rem;
  margin-bottom: 0.75rem;
}

.time-controls {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}

.time-controls label {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.8rem;
  color: var(--color-text-primary);
}

.time-controls input {
  width: 60px;
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-sm);
  background: rgba(255, 255, 255, 0.7);
  font-size: 0.8rem;
}

.duration-display {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  margin-left: auto;
}

.playback-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.playback-controls .control-button {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
}

.playback-controls .time-display {
  font-size: 0.75rem;
  min-width: 80px;
}
</style>

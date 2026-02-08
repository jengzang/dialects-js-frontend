<template>
  <div v-if="segments && segments.length > 0" class="audio-preview-panel">
    <h3 class="panel-title">
      🎵 音頻預覽
      <span v-if="segments.length > 1" class="segment-count">({{ segments.length }} 個片段)</span>
    </h3>

    <div v-if="segments.length > 1" class="info-banner">
      <span class="info-icon">ℹ️</span>
      <span>音頻超過 20 秒，已自動分割。請選擇要分析的片段。</span>
    </div>

    <!-- Segments List -->
    <!-- Segments List -->
    <div class="segments-container">
      <div
        v-for="(segment, index) in segments"
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
            <span class="segment-duration">{{ formatTime(segment.duration) }}</span>
            <span v-if="segment.startTime > 0" class="segment-time-range">
              ({{ formatTime(segment.startTime) }} - {{ formatTime(segment.endTime) }})
            </span>
          </div>
          <div class="segment-actions">
            <span v-if="selectedIndex === index" class="selected-badge">✓ 已選擇</span>
            <span class="drag-hint">⋮⋮</span>
          </div>
        </div>

        <!-- Waveform for this segment -->
        <div :ref="el => waveformRefs[index] = el" class="waveform-container"></div>

        <!-- Playback Controls for this segment -->
        <div class="controls">
          <button class="control-button glass-button" @click.stop="togglePlayPause(index)">
            <span class="control-icon">{{ playingIndex === index ? '⏸' : '▶' }}</span>
          </button>

          <div class="time-display">
            <span class="current-time">{{ formatTime(currentTimes[index] || 0) }}</span>
            <span class="separator">/</span>
            <span class="duration">{{ formatTime(segment.duration) }}</span>
          </div>

          <button class="control-button glass-button" @click.stop="stop(index)">
            <span class="control-icon">⏹</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import WaveSurfer from 'wavesurfer.js'

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

const emit = defineEmits(['segment-selected'])

const waveformRefs = ref([])
const playingIndex = ref(-1)
const selectedIndex = ref(0)
const currentTimes = ref({})

let wavesurfers = []

const initWaveSurfers = async () => {
  // Clean up existing wavesurfers
  wavesurfers.forEach(ws => ws && ws.destroy())
  wavesurfers = []

  await nextTick()

  // Create wavesurfer for each segment
  props.segments.forEach((segment, index) => {
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
      // Pause other wavesurfers
      wavesurfers.forEach((ws, i) => {
        if (i !== index && ws && ws.isPlaying()) {
          ws.pause()
        }
      })
    })
    wavesurfer.on('pause', () => {
      if (playingIndex.value === index) {
        playingIndex.value = -1
      }
    })
    wavesurfer.on('finish', () => {
      if (playingIndex.value === index) {
        playingIndex.value = -1
      }
    })
    wavesurfer.on('audioprocess', () => {
      currentTimes.value[index] = wavesurfer.getCurrentTime()
    })
    wavesurfer.on('seek', () => {
      currentTimes.value[index] = wavesurfer.getCurrentTime()
    })

    wavesurfer.loadBlob(segment.blob)
    wavesurfers[index] = wavesurfer
  })
}

const selectSegment = (index) => {
  selectedIndex.value = index
  emit('segment-selected', props.segments[index])
}

const togglePlayPause = (index) => {
  const wavesurfer = wavesurfers[index]
  if (wavesurfer) {
    wavesurfer.playPause()
  }
}

const stop = (index) => {
  const wavesurfer = wavesurfers[index]
  if (wavesurfer) {
    wavesurfer.stop()
    currentTimes.value[index] = 0
  }
}

const handleDragStart = (event, segment) => {
  // Set drag data for file upload
  event.dataTransfer.effectAllowed = 'copy'
  event.dataTransfer.setData('application/json', JSON.stringify({
    type: 'audio-segment',
    segment: {
      name: segment.name,
      duration: segment.duration,
      index: segment.index
    }
  }))

  // Create a file from the blob and add to dataTransfer
  const file = segment.file
  const dataTransfer = event.dataTransfer
  if (dataTransfer.items) {
    dataTransfer.items.add(file)
  }
}

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

watch(() => props.segments, async (newSegments) => {
  if (newSegments && newSegments.length > 0) {
    await initWaveSurfers()
    // Auto-select first segment
    if (newSegments.length > 0) {
      selectSegment(0)
    }
  }
}, { immediate: true })

// Support for legacy single audioBlob prop
watch(() => props.audioBlob, (newBlob) => {
  if (newBlob && (!props.segments || props.segments.length === 0)) {
    // Legacy mode: single audio blob
    // Convert to segments format
    props.segments = [{
      blob: newBlob,
      duration: 0,
      startTime: 0,
      endTime: 0,
      index: 0,
      name: 'audio'
    }]
  }
})

onMounted(async () => {
  if (props.segments && props.segments.length > 0) {
    await initWaveSurfers()
    selectSegment(0)
  }
})

onBeforeUnmount(() => {
  wavesurfers.forEach(ws => ws && ws.destroy())
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

.segment-item:hover {
  background: rgba(255, 255, 255, 0.7);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
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
</style>

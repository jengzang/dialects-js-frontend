<template>
  <div v-if="audioBlob" class="audio-preview-panel">
    <h3 class="panel-title">🎵 音頻預覽</h3>

    <!-- Waveform Container -->
    <div ref="waveformContainer" class="waveform-container"></div>

    <!-- Playback Controls -->
    <div class="controls">
      <button class="control-button glass-button" @click="togglePlayPause">
        <span class="control-icon">{{ isPlaying ? '⏸' : '▶' }}</span>
      </button>

      <div class="time-display">
        <span class="current-time">{{ formatTime(currentTime) }}</span>
        <span class="separator">/</span>
        <span class="duration">{{ formatTime(duration) }}</span>
      </div>

      <button class="control-button glass-button" @click="stop">
        <span class="control-icon">⏹</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import WaveSurfer from 'wavesurfer.js'

const props = defineProps({
  audioBlob: {
    type: Blob,
    default: null
  }
})

const waveformContainer = ref(null)
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)

let wavesurfer = null

const initWaveSurfer = () => {
  if (!waveformContainer.value) return

  wavesurfer = WaveSurfer.create({
    container: waveformContainer.value,
    waveColor: 'rgba(0, 122, 255, 0.3)',
    progressColor: '#007aff',
    cursorColor: '#007aff',
    height: 100,
    responsive: true,
    barWidth: 2,
    barGap: 1,
    barRadius: 2
  })

  wavesurfer.on('play', () => { isPlaying.value = true })
  wavesurfer.on('pause', () => { isPlaying.value = false })
  wavesurfer.on('finish', () => { isPlaying.value = false })
  wavesurfer.on('ready', () => { duration.value = wavesurfer.getDuration() })
  wavesurfer.on('audioprocess', () => { currentTime.value = wavesurfer.getCurrentTime() })
  wavesurfer.on('seek', () => { currentTime.value = wavesurfer.getCurrentTime() })
}

const loadAudio = () => {
  if (wavesurfer && props.audioBlob) {
    wavesurfer.loadBlob(props.audioBlob)
  }
}

const togglePlayPause = () => {
  if (wavesurfer) {
    wavesurfer.playPause()
  }
}

const stop = () => {
  if (wavesurfer) {
    wavesurfer.stop()
    currentTime.value = 0
  }
}

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

watch(() => props.audioBlob, (newBlob) => {
  if (newBlob) {
    if (!wavesurfer) {
      initWaveSurfer()
    }
    loadAudio()
  }
})

onMounted(() => {
  if (props.audioBlob) {
    initWaveSurfer()
    loadAudio()
  }
})

onBeforeUnmount(() => {
  if (wavesurfer) {
    wavesurfer.destroy()
  }
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
}

.waveform-container {
  background: rgba(255, 255, 255, 0.5);
  border-radius: var(--radius-md);
  padding: 0.75rem;
  margin-bottom: 1rem;
}

.controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.control-button {
  width: 2.5rem;
  height: 2.5rem;
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
  font-size: 1.2rem;
}

.time-display {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.85rem;
  color: var(--color-text-primary);
  min-width: 80px;
  justify-content: center;
  font-variant-numeric: tabular-nums;
}

.separator {
  color: var(--color-text-secondary);
}
</style>

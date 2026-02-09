<template>
  <div class="pitch-tone-panel glass-panel">
    <h2 class="panel-title">基頻定調</h2>

    <!-- Pitch Chart with Segment Overlay -->
    <div v-if="hasPitchData" class="chart-section">
      <h3 class="section-title">基頻軌跡</h3>
      <div ref="pitchChartContainer" class="chart-container"></div>
    </div>

    <!-- No Data Message -->
    <div v-else class="no-data-message">
      <div class="no-data-icon">📊</div>
      <p>無基頻數據</p>
    </div>

    <!-- Description -->
    <div class="description-section">
      <p class="description-text">
        基頻定調功能用於分析語音的音高變化軌跡，幫助確定聲調類型。
        圖中的彩色區域表示不同的語音段類型。
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, computed } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  results: {
    type: Object,
    required: true
  }
})

const pitchChartContainer = ref(null)
let pitchChart = null
let resizeObserver = null

const hasPitchData = computed(() => {
  const ts = props.results?.timeseries
  return ts?.pitch_hz && ts.pitch_hz.length > 0
})

// Initialize Pitch Chart with Segment Overlay
const initPitchChart = () => {
  if (!pitchChartContainer.value || !hasPitchData.value) return

  // Dispose existing chart
  if (pitchChart) {
    pitchChart.dispose()
  }

  // Dispose existing resize observer
  if (resizeObserver) {
    resizeObserver.disconnect()
  }

  pitchChart = echarts.init(pitchChartContainer.value)
  const ts = props.results.timeseries

  const pitchData = ts.pitch_hz
    .map((value, idx) => [ts.time?.[idx] || idx * 0.01, value])
    .filter(([t, v]) => v !== null && v > 0)

  // Prepare segment markArea
  const segments = props.results.segments || []
  const markAreaData = segments.map(seg => [
    {
      xAxis: seg.start_s,
      itemStyle: {
        color: seg.type === 'rime_core' ? 'rgba(255,215,0,0.2)' :
               seg.type === 'silence' ? 'rgba(200,200,200,0.1)' :
               'rgba(100,150,255,0.15)'
      }
    },
    { xAxis: seg.end_s }
  ])

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' }
    },
    xAxis: {
      type: 'value',
      name: '時間 (秒)',
      nameLocation: 'middle',
      nameGap: 30
    },
    yAxis: {
      type: 'value',
      name: '基頻 (Hz)',
      axisLine: { lineStyle: { color: '#007aff' } }
    },
    series: [{
      name: '基頻',
      type: 'line',
      data: pitchData,
      smooth: true,
      lineStyle: { color: '#007aff', width: 2 },
      showSymbol: false,
      markArea: markAreaData.length > 0 ? { data: markAreaData } : undefined
    }],
    grid: {
      left: '10%',
      right: '10%',
      bottom: '15%',
      top: '10%'
    },
    dataZoom: [
      { type: 'inside', xAxisIndex: 0 },
      { type: 'slider', xAxisIndex: 0, bottom: 10 }
    ]
  }

  pitchChart.setOption(option)

  resizeObserver = new ResizeObserver(() => {
    pitchChart?.resize()
  })
  resizeObserver.observe(pitchChartContainer.value)
}

// Watch for results changes
watch(() => props.results, () => {
  if (hasPitchData.value) {
    setTimeout(() => initPitchChart(), 100)
  }
}, { deep: true })

onMounted(() => {
  if (hasPitchData.value) {
    initPitchChart()
  }
})

onBeforeUnmount(() => {
  if (pitchChart) {
    pitchChart.dispose()
  }
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
})
</script>

<style scoped>
.pitch-tone-panel {
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  width: 95%;
}

.panel-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: var(--color-text-primary);
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--color-text-primary);
}

.chart-section {
  margin-bottom: 2rem;
}

.chart-container {
  width: 100%;
  height: 500px;
  background: var(--glass-light);
  border-radius: var(--radius-lg);
  padding: 1rem;
}

.no-data-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  color: var(--color-text-secondary);
}

.no-data-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.6;
}

.description-section {
  padding: 1rem;
  background: var(--glass-light);
  border-radius: var(--radius-md);
}

.description-text {
  font-size: 0.9rem;
  line-height: 1.6;
  color: var(--color-text-secondary);
  margin: 0;
}

@media (max-aspect-ratio: 1/1) {
  .chart-container {
    height: 400px;
  }
}
</style>

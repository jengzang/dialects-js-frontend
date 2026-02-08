<template>
  <div v-if="results" class="analysis-results-panel glass-panel">
    <h2 class="panel-title">分析結果</h2>

    <!-- Summary Statistics -->
    <div class="summary-section">
      <h3 class="section-title">基本信息</h3>
      <div class="stats-grid">
        <div class="stat-card glass-panel-inner">
          <div class="stat-label">音頻時長</div>
          <div class="stat-value">{{ results.meta?.duration_s?.toFixed(2) }} 秒</div>
        </div>
        <div class="stat-card glass-panel-inner">
          <div class="stat-label">採樣率</div>
          <div class="stat-value">{{ results.meta?.sample_rate }} Hz</div>
        </div>
        <div v-if="results.summary?.intensity" class="stat-card glass-panel-inner">
          <div class="stat-label">平均強度</div>
          <div class="stat-value">{{ results.summary.intensity.mean_db?.toFixed(1) }} dB</div>
        </div>
        <div v-if="results.summary?.intensity" class="stat-card glass-panel-inner">
          <div class="stat-label">強度範圍</div>
          <div class="stat-value">
            {{ results.summary.intensity.min_db?.toFixed(1) }} - {{ results.summary.intensity.max_db?.toFixed(1) }} dB
          </div>
        </div>
      </div>
    </div>

    <!-- Tone Features (Single Mode) -->
    <div v-if="results.tone_features" class="summary-section">
      <h3 class="section-title">調值特徵</h3>
      <div class="stats-grid">
        <div class="stat-card glass-panel-inner">
          <div class="stat-label">起始基頻</div>
          <div class="stat-value">{{ results.tone_features.f0_start?.toFixed(1) }} Hz</div>
        </div>
        <div class="stat-card glass-panel-inner">
          <div class="stat-label">結束基頻</div>
          <div class="stat-value">{{ results.tone_features.f0_end?.toFixed(1) }} Hz</div>
        </div>
        <div class="stat-card glass-panel-inner">
          <div class="stat-label">基頻斜率</div>
          <div class="stat-value">{{ results.tone_features.f0_slope?.toFixed(2) }}</div>
        </div>
        <div class="stat-card glass-panel-inner">
          <div class="stat-label">五度標調</div>
          <div class="stat-value">{{ results.tone_features.contour_5pt || 'N/A' }}</div>
        </div>
      </div>
    </div>

    <!-- Time Series Chart -->
    <div v-if="hasTimeSeriesData" class="chart-section">
      <h3 class="section-title">時間序列圖</h3>
      <div ref="chartContainer" class="chart-container"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, computed } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  results: {
    type: Object,
    default: null
  }
})

const chartContainer = ref(null)
let chart = null

const hasTimeSeriesData = computed(() => {
  const ts = props.results?.timeseries
  return (ts?.pitch_hz && ts.pitch_hz.length > 0) ||
         (ts?.intensity_db && ts.intensity_db.length > 0) ||
         (ts?.formants && Object.keys(ts.formants).length > 0)
})

const initChart = () => {
  if (!chartContainer.value || !hasTimeSeriesData.value) return

  chart = echarts.init(chartContainer.value)

  const series = []
  const yAxis = []
  const ts = props.results.timeseries

  // Pitch series
  if (ts.pitch_hz && ts.pitch_hz.length > 0) {
    const pitchData = ts.pitch_hz.map((value, idx) => [
      ts.time?.[idx] || idx * 0.01,
      value
    ])

    series.push({
      name: '基頻',
      type: 'line',
      yAxisIndex: 0,
      data: pitchData,
      smooth: true,
      lineStyle: { color: '#007aff', width: 2 },
      showSymbol: false
    })

    yAxis.push({
      type: 'value',
      name: '基頻 (Hz)',
      position: 'left',
      axisLine: { lineStyle: { color: '#007aff' } }
    })
  }

  // Intensity series
  if (ts.intensity_db && ts.intensity_db.length > 0) {
    const intensityData = ts.intensity_db.map((value, idx) => [
      ts.time?.[idx] || idx * 0.01,
      value
    ])

    series.push({
      name: '強度',
      type: 'line',
      yAxisIndex: yAxis.length,
      data: intensityData,
      smooth: true,
      lineStyle: { color: '#ff3b30', width: 2 },
      showSymbol: false
    })

    yAxis.push({
      type: 'value',
      name: '強度 (dB)',
      position: 'right',
      axisLine: { lineStyle: { color: '#ff3b30' } }
    })
  }

  // Formant series (if available)
  if (ts.formants && typeof ts.formants === 'object') {
    const formantColors = ['#34c759', '#ff9500', '#5856d6']
    const formantNames = ['F1', 'F2', 'F3']

    Object.keys(ts.formants).forEach((key, i) => {
      if (i < 3 && ts.formants[key] && ts.formants[key].length > 0) {
        const formantData = ts.formants[key].map((value, idx) => [
          ts.time?.[idx] || idx * 0.01,
          value
        ])

        series.push({
          name: formantNames[i],
          type: 'line',
          yAxisIndex: 0,
          data: formantData,
          smooth: true,
          lineStyle: { color: formantColors[i], width: 2 },
          showSymbol: false
        })
      }
    })

    if (yAxis.length === 0) {
      yAxis.push({
        type: 'value',
        name: '頻率 (Hz)',
        position: 'left'
      })
    }
  }

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' }
    },
    legend: {
      data: series.map(s => s.name),
      top: 10
    },
    grid: {
      left: '10%',
      right: '10%',
      bottom: '15%',
      top: '15%'
    },
    xAxis: {
      type: 'value',
      name: '時間 (秒)',
      nameLocation: 'middle',
      nameGap: 30
    },
    yAxis: yAxis,
    series: series,
    dataZoom: [
      {
        type: 'inside',
        xAxisIndex: 0,
        filterMode: 'none'
      },
      {
        type: 'slider',
        xAxisIndex: 0,
        filterMode: 'none',
        bottom: 10
      }
    ]
  }

  chart.setOption(option)

  const resizeObserver = new ResizeObserver(() => {
    chart?.resize()
  })
  resizeObserver.observe(chartContainer.value)
}

watch(() => props.results, (newResults) => {
  if (newResults && hasTimeSeriesData.value) {
    setTimeout(() => initChart(), 100)
  }
}, { deep: true })

onMounted(() => {
  if (props.results && hasTimeSeriesData.value) {
    initChart()
  }
})

onBeforeUnmount(() => {
  if (chart) {
    chart.dispose()
  }
})
</script>

<style scoped>
.analysis-results-panel {
  padding: 1rem;
  margin-bottom: 1.5rem;
  width:95%;
}

.panel-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: var(--color-text-primary);
}

.summary-section {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--color-text-primary);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.stat-card {
  padding: 1.5rem;
  text-align: center;
}
@media (max-aspect-ratio: 1/1) {
  .stat-card{
    padding:0.8rem;
  }
  .chart-container{
    width: 96%;
  }

}

.stat-label {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.chart-section {
  margin-top: 2rem;
  display: flex;
  align-items: center;
  flex-direction: column;
}

.chart-container {
  width: 80%;
  height: 400px;
  background: var(--glass-light);
  border-radius: var(--radius-lg);
  padding: 1rem;
}
</style>

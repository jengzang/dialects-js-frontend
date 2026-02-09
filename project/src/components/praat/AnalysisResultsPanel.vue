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

    <!-- Time Series Charts - Separated -->
    <div v-if="hasTimeSeriesData" class="charts-section">
      <!-- Pitch Chart with Segment Overlay -->
      <div v-if="hasPitchData" class="chart-section">
        <h3 class="section-title">基頻軌跡</h3>
        <div ref="pitchChartContainer" class="chart-container"></div>
      </div>

      <!-- Intensity Chart -->
      <div v-if="hasIntensityData" class="chart-section">
        <h3 class="section-title">強度軌跡</h3>
        <div ref="intensityChartContainer" class="chart-container"></div>
      </div>

      <!-- Formant Trajectories Chart (F1-F5) -->
      <div v-if="hasFormantData" class="chart-section">
        <h3 class="section-title">共振峰軌跡 (F1-F5)</h3>
        <div ref="formantChartContainer" class="chart-container"></div>
      </div>
    </div>

    <!-- Voice Quality Section -->
    <div v-if="results.voice_quality" class="voice-quality-section">
      <h3 class="section-title">嗓音質量評估</h3>
      <div class="quality-grid">
        <!-- HNR Gauge -->
        <div class="quality-card glass-panel-inner">
          <div class="quality-label">諧噪比 (HNR)</div>
          <div class="quality-value" :class="getHnrClass(results.voice_quality.hnr_mean)">
            {{ results.voice_quality.hnr_mean?.toFixed(1) }} dB
          </div>
          <div class="quality-bar">
            <div class="quality-fill" :style="getHnrBarStyle(results.voice_quality.hnr_mean)"></div>
          </div>
          <div class="quality-status">{{ getHnrStatus(results.voice_quality.hnr_mean) }}</div>
        </div>

        <!-- Jitter -->
        <div class="quality-card glass-panel-inner">
          <div class="quality-label">基頻微擾 (Jitter)</div>
          <div class="quality-value" :class="getJitterClass(results.voice_quality.jitter_mean)">
            {{ (results.voice_quality.jitter_mean * 100)?.toFixed(2) }}%
          </div>
          <div class="quality-bar">
            <div class="quality-fill" :style="getJitterBarStyle(results.voice_quality.jitter_mean)"></div>
          </div>
          <div class="quality-status">{{ getJitterStatus(results.voice_quality.jitter_mean) }}</div>
        </div>

        <!-- Shimmer -->
        <div class="quality-card glass-panel-inner">
          <div class="quality-label">振幅微擾 (Shimmer)</div>
          <div class="quality-value" :class="getShimmerClass(results.voice_quality.shimmer_mean)">
            {{ (results.voice_quality.shimmer_mean * 100)?.toFixed(2) }}%
          </div>
          <div class="quality-bar">
            <div class="quality-fill" :style="getShimmerBarStyle(results.voice_quality.shimmer_mean)"></div>
          </div>
          <div class="quality-status">{{ getShimmerStatus(results.voice_quality.shimmer_mean) }}</div>
        </div>
      </div>
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

const pitchChartContainer = ref(null)
const intensityChartContainer = ref(null)
const formantChartContainer = ref(null)
let pitchChart = null
let intensityChart = null
let formantChart = null

const hasTimeSeriesData = computed(() => {
  const ts = props.results?.timeseries
  return (ts?.pitch_hz && ts.pitch_hz.length > 0) ||
         (ts?.intensity_db && ts.intensity_db.length > 0) ||
         (ts?.formants && Object.keys(ts.formants).length > 0)
})

const hasPitchData = computed(() => {
  const ts = props.results?.timeseries
  return ts?.pitch_hz && ts.pitch_hz.length > 0
})

const hasIntensityData = computed(() => {
  const ts = props.results?.timeseries
  return ts?.intensity_db && ts.intensity_db.length > 0
})

const hasFormantData = computed(() => {
  const ts = props.results?.timeseries
  return ts?.formants && Object.keys(ts.formants).length > 0
})

// Initialize Pitch Chart with Segment Overlay
const initPitchChart = () => {
  if (!pitchChartContainer.value || !hasPitchData.value) return

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

  const resizeObserver = new ResizeObserver(() => {
    pitchChart?.resize()
  })
  resizeObserver.observe(pitchChartContainer.value)
}

// Initialize Intensity Chart
const initIntensityChart = () => {
  if (!intensityChartContainer.value || !hasIntensityData.value) return

  intensityChart = echarts.init(intensityChartContainer.value)
  const ts = props.results.timeseries

  const intensityData = ts.intensity_db
    .map((value, idx) => [ts.time?.[idx] || idx * 0.01, value])
    .filter(([t, v]) => v > 0)

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
      name: '強度 (dB)',
      axisLine: { lineStyle: { color: '#ff3b30' } }
    },
    series: [{
      name: '強度',
      type: 'line',
      data: intensityData,
      smooth: true,
      lineStyle: { color: '#ff3b30', width: 2 },
      showSymbol: false
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

  intensityChart.setOption(option)

  const resizeObserver = new ResizeObserver(() => {
    intensityChart?.resize()
  })
  resizeObserver.observe(intensityChartContainer.value)
}

// Initialize Formant Chart (F1-F5)
const initFormantChart = () => {
  if (!formantChartContainer.value || !hasFormantData.value) return

  formantChart = echarts.init(formantChartContainer.value)
  const ts = props.results.timeseries

  const formantColors = ['#34c759', '#ff9500', '#5856d6', '#ff2d55', '#5ac8fa']
  const formantKeys = ['f1', 'f2', 'f3', 'f4', 'f5']

  const formantSeries = formantKeys.map((key, i) => {
    if (!ts.formants[key]) return null

    return {
      name: key.toUpperCase(),
      type: 'line',
      data: ts.formants[key]
        .map((v, idx) => [ts.time?.[idx] || idx * 0.01, v])
        .filter(([t, v]) => v !== null && v > 0),
      smooth: true,
      lineStyle: {
        color: formantColors[i],
        width: 2
      },
      showSymbol: false
    }
  }).filter(s => s !== null)

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' }
    },
    legend: {
      data: formantSeries.map(s => s.name),
      top: 10
    },
    xAxis: {
      type: 'value',
      name: '時間 (秒)',
      nameLocation: 'middle',
      nameGap: 30
    },
    yAxis: {
      type: 'value',
      name: '頻率(Hz)',
      scale: true, // 允许 Y 轴不从 0 开始（虽然共振峰通常较高，这个加上比较保险）
      // 【重点修改】动态计算最大值
      max: (value) => {
        // value.max 是当前数据的最大值
        // 乘以 1.1 (增加10%) 或者加一个固定值，给顶部留出空间
        // Math.ceil 取整让刻度好看一点
        return Math.ceil(value.max * 1.1)
      }
    },
    series: formantSeries,
    grid: {
      left: '10%',
      right: '10%',
      bottom: '15%',
      top: '15%'
    },
    dataZoom: [
      { type: 'inside', xAxisIndex: 0 },
      { type: 'slider', xAxisIndex: 0, bottom: 10 }
    ]
  }

  formantChart.setOption(option)

  const resizeObserver = new ResizeObserver(() => {
    formantChart?.resize()
  })
  resizeObserver.observe(formantChartContainer.value)
}

// Voice Quality Helper Functions
const getHnrClass = (hnr) => hnr >= 15 ? 'quality-good' : hnr >= 10 ? 'quality-fair' : 'quality-poor'
const getHnrBarStyle = (hnr) => ({
  width: `${Math.min((hnr / 20) * 100, 100)}%`,
  backgroundColor: hnr >= 15 ? '#34c759' : hnr >= 10 ? '#ff9500' : '#ff3b30'
})
const getHnrStatus = (hnr) => hnr >= 15 ? '良好' : hnr >= 10 ? '正常' : '較差'

const getJitterClass = (j) => j < 0.01 ? 'quality-good' : j < 0.02 ? 'quality-fair' : 'quality-poor'
const getJitterBarStyle = (j) => ({
  width: `${Math.min((j / 0.05) * 100, 100)}%`,
  backgroundColor: j < 0.01 ? '#34c759' : j < 0.02 ? '#ff9500' : '#ff3b30'
})
const getJitterStatus = (j) => j < 0.01 ? '良好' : j < 0.02 ? '正常' : '較差'

const getShimmerClass = (s) => s < 0.03 ? 'quality-good' : s < 0.06 ? 'quality-fair' : 'quality-poor'
const getShimmerBarStyle = (s) => ({
  width: `${Math.min((s / 0.1) * 100, 100)}%`,
  backgroundColor: s < 0.03 ? '#34c759' : s < 0.06 ? '#ff9500' : '#ff3b30'
})
const getShimmerStatus = (s) => s < 0.03 ? '良好' : s < 0.06 ? '正常' : '較差'

watch(() => props.results, (newResults) => {
  if (newResults && hasTimeSeriesData.value) {
    setTimeout(() => {
      if (hasPitchData.value) initPitchChart()
      if (hasIntensityData.value) initIntensityChart()
      if (hasFormantData.value) initFormantChart()
    }, 100)
  }
}, { deep: true })

onMounted(() => {
  if (props.results && hasTimeSeriesData.value) {
    if (hasPitchData.value) initPitchChart()
    if (hasIntensityData.value) initIntensityChart()
    if (hasFormantData.value) initFormantChart()
  }
})

onBeforeUnmount(() => {
  if (pitchChart) pitchChart.dispose()
  if (intensityChart) intensityChart.dispose()
  if (formantChart) formantChart.dispose()
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
    width: 96%!important;
    padding:0.5rem!important;
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

.charts-section {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.voice-quality-section {
  margin-top: 2rem;
}

.quality-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.quality-card {
  padding: 1.5rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.quality-label {
  font-size: 0.95rem;
  color: var(--color-text-secondary);
  font-weight: 500;
}

.quality-value {
  font-size: 1.8rem;
  font-weight: 700;
  transition: color 0.3s ease;
}

.quality-value.quality-good {
  color: #34c759;
}

.quality-value.quality-fair {
  color: #ff9500;
}

.quality-value.quality-poor {
  color: #ff3b30;
}

.quality-bar {
  width: 100%;
  height: 8px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.quality-fill {
  height: 100%;
  transition: width 0.5s ease, background-color 0.3s ease;
  border-radius: 4px;
}

.quality-status {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text-secondary);
}
</style>

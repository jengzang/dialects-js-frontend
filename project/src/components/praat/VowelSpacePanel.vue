<template>
  <div class="vowel-space-panel glass-panel">
    <h2 class="panel-title">F1-F2 元音空間</h2>

    <!-- Statistics Cards -->
    <div class="stats-section">
      <div class="stats-grid">
        <div class="stat-card glass-panel-inner">
          <div class="stat-label">F1 平均值</div>
          <div class="stat-value">{{ f1Mean?.toFixed(0) }} Hz</div>
        </div>
        <div class="stat-card glass-panel-inner">
          <div class="stat-label">F2 平均值</div>
          <div class="stat-value">{{ f2Mean?.toFixed(0) }} Hz</div>
        </div>
        <div class="stat-card glass-panel-inner">
          <div class="stat-label">數據點數</div>
          <div class="stat-value">{{ vowelSpaceData.length }}</div>
        </div>
      </div>
    </div>

    <!-- Vowel Space Chart -->
    <div class="chart-section">
      <div ref="chartContainer" class="chart-container"></div>
    </div>

    <!-- Description -->
    <div class="description-section">
      <p class="description-text">
        元音空間圖顯示 F1（第一共振峰）和 F2（第二共振峰）的分布。
        根據語音學慣例，兩個軸都是反向的（從高到低）。
        不同的元音在此空間中佔據不同的區域。
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  results: {
    type: Object,
    required: true
  }
})

const chartContainer = ref(null)
let chart = null

// Compute vowel space data
const vowelSpaceData = computed(() => {
  const ts = props.results?.timeseries
  if (!ts?.formants?.f1 || !ts?.formants?.f2) return []

  return ts.formants.f1
    .map((f1, idx) => [ts.formants.f2[idx], f1])
    .filter(([f2, f1]) => f2 && f1 && f2 > 0 && f1 > 0)
})

// Compute statistics
const f1Mean = computed(() => {
  const f1Values = vowelSpaceData.value.map(([f2, f1]) => f1)
  return f1Values.length > 0
    ? f1Values.reduce((a, b) => a + b, 0) / f1Values.length
    : 0
})

const f2Mean = computed(() => {
  const f2Values = vowelSpaceData.value.map(([f2, f1]) => f2)
  return f2Values.length > 0
    ? f2Values.reduce((a, b) => a + b, 0) / f2Values.length
    : 0
})

// Initialize chart
const initChart = () => {
  if (!chartContainer.value || vowelSpaceData.value.length === 0) return

  chart = echarts.init(chartContainer.value)

  const option = {
    title: {
      text: 'F1-F2 元音空間',
      left: 'center',
      top: 10
    },
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        const [f2, f1] = params.value
        return `F1: ${f1.toFixed(0)} Hz<br/>F2: ${f2.toFixed(0)} Hz`
      }
    },
    xAxis: {
      type: 'value',
      name: 'F2 (Hz)',
      nameLocation: 'middle',
      nameGap: 30,
      inverse: true,  // REVERSED!
      min: 500,
      max: 3000
    },
    yAxis: {
      type: 'value',
      name: 'F1 (Hz)',
      nameLocation: 'middle',
      nameGap: 40,
      inverse: true,  // REVERSED!
      min: 200,
      max: 1200
    },
    series: [{
      type: 'scatter',
      data: vowelSpaceData.value,
      symbolSize: 8,
      itemStyle: {
        color: '#34c759',
        opacity: 0.6
      }
    }],
    grid: {
      left: '15%',
      right: '10%',
      bottom: '15%',
      top: '15%'
    }
  }

  chart.setOption(option)

  // Handle resize
  const resizeObserver = new ResizeObserver(() => {
    chart?.resize()
  })
  resizeObserver.observe(chartContainer.value)
}

watch(() => props.results, () => {
  if (vowelSpaceData.value.length > 0) {
    setTimeout(() => initChart(), 100)
  }
}, { deep: true })

onMounted(() => {
  if (vowelSpaceData.value.length > 0) {
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
.vowel-space-panel {
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

.stats-section {
  margin-bottom: 2rem;
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
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2rem;
}

.chart-container {
  width: 80%;
  height: 500px;
  background: var(--glass-light);
  border-radius: var(--radius-lg);
  padding: 1rem;
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
    width: 96%;
    height: 400px;
  }
}
</style>
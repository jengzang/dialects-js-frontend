<template>
  <div class="vowel-space-panel glass-panel">
    <h2 class="panel-title">F1-F2 元音空間（按語音段）</h2>

    <!-- Segment Selector Section -->
    <div class="segment-selector-section">
      <h3 class="section-title">選擇語音段</h3>

      <div v-if="vowelSegments.length === 0" class="no-segments-message">
        未檢測到元音段（rime_core、syllable_like 或 voiced）
      </div>

      <div v-else class="segment-list">
        <!-- Select All Checkbox -->
        <label class="segment-checkbox glass-panel-inner">
          <input
            type="checkbox"
            :checked="showAll"
            @change="toggleAll"
          />
          <span class="segment-label">全部顯示</span>
        </label>

        <!-- Individual Segment Checkboxes -->
        <label
          v-for="seg in vowelSegments"
          :key="seg.id"
          class="segment-checkbox glass-panel-inner"
        >
          <input
            type="checkbox"
            :checked="selectedSegments.has(seg.id)"
            @change="toggleSegment(seg.id)"
          />
          <span class="segment-color-indicator" :style="{ backgroundColor: getSegmentColor(seg.id) }"></span>
          <span class="segment-label">
            {{ seg.label }} ({{ seg.timeRange }})
          </span>
          <span class="segment-type-badge" :class="`type-${seg.type}`">
            {{ seg.type }}
          </span>
        </label>
      </div>
    </div>

    <!-- Vowel Space Chart -->
    <div class="chart-section">
      <div ref="chartContainer" class="chart-container"></div>
    </div>

    <!-- Statistics Section -->
    <div class="stats-section">
      <h3 class="section-title">統計信息</h3>

      <div v-if="selectedSegments.size === 0" class="no-selection-message">
        請選擇至少一個語音段
      </div>

      <div v-else class="stats-grid">
        <div
          v-for="data in segmentVowelData.filter(d => selectedSegments.has(d.segment.id))"
          :key="data.segment.id"
          class="stat-card glass-panel-inner"
        >
          <div class="stat-header">
            <span class="segment-color-dot" :style="{ backgroundColor: getSegmentColor(data.segment.id) }"></span>
            <span class="stat-label">{{ data.segment.label }}</span>
          </div>
          <div class="stat-values">
            <div class="stat-item">
              <span class="stat-key">F1 平均:</span>
              <span class="stat-value">{{ data.stats.f1Mean.toFixed(0) }} Hz</span>
            </div>
            <div class="stat-item">
              <span class="stat-key">F2 平均:</span>
              <span class="stat-value">{{ data.stats.f2Mean.toFixed(0) }} Hz</span>
            </div>
            <div class="stat-item">
              <span class="stat-key">數據點:</span>
              <span class="stat-value">{{ data.stats.count }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Description -->
    <div class="description-section">
      <p class="description-text">
        元音空間圖顯示 F1（第一共振峰）和 F2（第二共振峰）的分布。
        根據語音學慣例，兩個軸都是反向的（從高到低）。
        連線顯示元音在時間上的軌跡變化，箭頭指示時間方向。
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
let resizeObserver = null

// Reactive state for segment selection
const selectedSegments = ref(new Set())
const showAll = ref(true)

// Color palette for segments
const segmentColors = [
  '#34c759',  // Green - rime_core
  '#007aff',  // Blue - syllable_like
  '#ff9500',  // Orange - voiced
  '#ff2d55',  // Pink
  '#5856d6',  // Purple
  '#5ac8fa',  // Cyan
]

const getSegmentColor = (segmentId) => {
  return segmentColors[segmentId % segmentColors.length]
}

// Filter segments by type (only rime_core, syllable_like, voiced)
const vowelSegments = computed(() => {
  const segments = props.results?.segments || []
  return segments
    .filter(seg => ['rime_core', 'syllable_like', 'voiced'].includes(seg.type))
    .map((seg, idx) => ({
      ...seg,
      id: idx,
      label: `Segment ${idx + 1} (${seg.type})`,
      timeRange: `${seg.start_s.toFixed(2)}-${seg.end_s.toFixed(2)}s`
    }))
})

// Extract formant data for a specific segment
const getSegmentFormantData = (segment) => {
  const ts = props.results?.timeseries
  if (!ts?.time || !ts?.formants?.f1 || !ts?.formants?.f2) return []

  // Find indices within segment time range
  const points = ts.time
    .map((t, idx) => ({
      time: t,
      f1: ts.formants.f1[idx],
      f2: ts.formants.f2[idx],
      idx
    }))
    .filter(p =>
      p.time >= segment.start_s &&
      p.time <= segment.end_s &&
      p.f1 > 0 &&
      p.f2 > 0
    )
    .map(p => [p.f2, p.f1, p.time])  // [F2, F1, time] for ECharts

  return points
}

// Compute all segment data with statistics
const segmentVowelData = computed(() => {
  return vowelSegments.value.map(seg => {
    const points = getSegmentFormantData(seg)

    // Calculate statistics
    const f1Values = points.map(([f2, f1]) => f1)
    const f2Values = points.map(([f2, f1]) => f2)

    return {
      segment: seg,
      points: points,
      stats: {
        f1Mean: f1Values.length > 0
          ? f1Values.reduce((a, b) => a + b, 0) / f1Values.length
          : 0,
        f2Mean: f2Values.length > 0
          ? f2Values.reduce((a, b) => a + b, 0) / f2Values.length
          : 0,
        count: points.length
      }
    }
  })
})

// Initialize: select all segments by default
watch(vowelSegments, (segments) => {
  if (segments.length > 0 && selectedSegments.value.size === 0) {
    selectedSegments.value = new Set(segments.map(s => s.id))
  }
}, { immediate: true })

// Toggle functions
const toggleAll = () => {
  showAll.value = !showAll.value
  if (showAll.value) {
    selectedSegments.value = new Set(vowelSegments.value.map(s => s.id))
  } else {
    selectedSegments.value = new Set()
  }
}

const toggleSegment = (segmentId) => {
  if (selectedSegments.value.has(segmentId)) {
    selectedSegments.value.delete(segmentId)
  } else {
    selectedSegments.value.add(segmentId)
  }
  // Trigger reactivity
  selectedSegments.value = new Set(selectedSegments.value)

  // Update showAll state
  showAll.value = selectedSegments.value.size === vowelSegments.value.length
}

// Initialize chart
const initChart = () => {
  if (!chartContainer.value) return

  // Dispose existing chart
  if (chart) {
    chart.dispose()
  }

  // Dispose existing resize observer
  if (resizeObserver) {
    resizeObserver.disconnect()
  }

  chart = echarts.init(chartContainer.value)

  // Create series for each selected segment
  const series = segmentVowelData.value
    .filter(data => selectedSegments.value.has(data.segment.id))
    .map(data => ({
      name: data.segment.label,
      type: 'line',  // Changed from 'scatter' to 'line'
      data: data.points,
      smooth: false,  // Keep angular to show actual trajectory
      lineStyle: {
        color: getSegmentColor(data.segment.id),
        width: 2
      },
      itemStyle: {
        color: getSegmentColor(data.segment.id)
      },
      symbolSize: 6,
      showSymbol: true,  // Show points on the line
      // Add arrow at the end to show direction
      endLabel: {
        show: true,
        formatter: '▶',  // Arrow symbol
        fontSize: 12,
        color: getSegmentColor(data.segment.id),
        distance: 5
      },
      emphasis: {
        focus: 'series'
      }
    }))

  const option = {
    title: {
      text: 'F1-F2 元音空間 (按語音段)',
      left: 'center',
      top: 10
    },
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        const [f2, f1, time] = params.value
        return `${params.seriesName}<br/>F1: ${f1.toFixed(0)} Hz<br/>F2: ${f2.toFixed(0)} Hz<br/>時間: ${time.toFixed(2)}s`
      }
    },
    legend: {
      data: series.map(s => s.name),
      top: 40,
      type: 'scroll'
    },
    xAxis: {
      type: 'value',
      name: 'F2 (Hz)',
      nameLocation: 'middle',
      nameGap: 30,
      inverse: true,  // REVERSED
      min: 500,
      max: 3000
    },
    yAxis: {
      type: 'value',
      name: 'F1 (Hz)',
      nameLocation: 'middle',
      nameGap: 40,
      inverse: true,  // REVERSED
      min: 200,
      max: 1200
    },
    series: series,
    grid: {
      left: '15%',
      right: '10%',
      bottom: '15%',
      top: '20%'  // More space for legend
    }
  }

  chart.setOption(option)

  // Handle resize
  resizeObserver = new ResizeObserver(() => {
    chart?.resize()
  })
  resizeObserver.observe(chartContainer.value)
}

// Watch for segment selection changes
watch([selectedSegments, () => props.results], () => {
  if (segmentVowelData.value.length > 0) {
    setTimeout(() => initChart(), 100)
  }
}, { deep: true })

onMounted(() => {
  if (segmentVowelData.value.length > 0) {
    initChart()
  }
})

onBeforeUnmount(() => {
  if (chart) {
    chart.dispose()
  }
  if (resizeObserver) {
    resizeObserver.disconnect()
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

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--color-text-primary);
}

/* Segment Selector Section */
.segment-selector-section {
  margin-bottom: 2rem;
}

.no-segments-message {
  padding: 1rem;
  text-align: center;
  color: var(--color-text-secondary);
  background: var(--glass-light);
  border-radius: var(--radius-md);
}

.segment-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.segment-checkbox {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.segment-checkbox:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateX(4px);
}

.segment-checkbox input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.segment-color-indicator {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  flex-shrink: 0;
}

.segment-label {
  flex: 1;
  font-size: 0.95rem;
  color: var(--color-text-primary);
}

.segment-type-badge {
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-sm);
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;
}

.segment-type-badge.type-rime_core {
  background: rgba(52, 199, 89, 0.2);
  color: #34c759;
}

.segment-type-badge.type-syllable_like {
  background: rgba(0, 122, 255, 0.2);
  color: #007aff;
}

.segment-type-badge.type-voiced {
  background: rgba(255, 149, 0, 0.2);
  color: #ff9500;
}

/* Chart Section */
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

/* Statistics Section */
.stats-section {
  margin-bottom: 2rem;
}

.no-selection-message {
  padding: 1rem;
  text-align: center;
  color: var(--color-text-secondary);
  background: var(--glass-light);
  border-radius: var(--radius-md);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.stat-card {
  padding: 1.5rem;
}

.stat-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.segment-color-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.stat-header .stat-label {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.stat-values {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-key {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}

.stat-value {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

/* Description Section */
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

  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="visible" class="modal-overlay" @click.self="handleClose">
        <div class="map-modal-container" :class="{ 'fullscreen': isFullscreen }">
          <!-- 头部：标题、村落数量、关闭按钮 -->
          <div v-if="!isFullscreen" class="modal-header">
            <h3>村落分佈地圖</h3>
            <span class="village-count">{{ validVillages.length }} 個村落</span>
            <button class="close-btn" @click="handleClose">✕</button>
          </div>

          <!-- 地图容器 -->
          <div ref="mapContainer" class="map-content">
            <!-- 控制面板 -->
            <div v-if="!isFullscreen" class="map-controls">
              <select v-model="currentStyle" @change="changeMapStyle">
                <option
                  v-for="(name, key) in mapStyleConfig"
                  :key="key"
                  :value="key"
                >
                  {{ name }}
                </option>
              </select>

              <!-- 显示切换按钮 - 只在有方言数据时显示 -->
              <button
                v-if="hasDialectData"
                class="toggle-display-btn"
                @click="toggleDisplay"
                :title="displayMode === 'name' ? '切換到方言' : '切換到村名'"
              >
                {{ displayMode === 'name' ? '📍 村名' : '🗣️ 方言' }}
              </button>

              <!-- 复位和全屏按钮放在同一行 -->
              <div class="button-row">
                <button class="control-btn" @click="resetView">🎯 復位</button>
                <button class="control-btn" @click="toggleFullscreen">⛶ 全屏</button>
              </div>
            </div>

            <!-- 全屏模式下的退出按钮 -->
            <button v-if="isFullscreen" class="exit-fullscreen-btn" @click="toggleFullscreen">
              ✕ 退出全屏
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, shallowRef, onMounted, onBeforeUnmount, nextTick } from 'vue'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { mapStyle, mapStyleConfig, calculateDenseMapCenterAndZoom } from '@/utils/MapSource.js'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  villages: {
    type: Array,
    default: () => []
    // 格式: [{ name: '村名', dialect: '方言', longitude: 113.x, latitude: 23.x }]
  }
})

const emit = defineEmits(['close'])

// 状态管理
const mapContainer = ref(null)
const map = shallowRef(null)
const currentStyle = ref('maptiler_streets')
const displayMode = ref('name') // 'name' | 'dialect'
const isFullscreen = ref(false)
let currentMarkers = []

// 20色盘 (参考 MapLibre.vue)
const colorPalette = [
  "#e6194b", "#3cb44b", "#ffe119", "#4363d8", "#f58231",
  "#911eb4", "#42d4f4", "#f032e6", "#bfe745", "#fabed4",
  "#469990", "#dcbaff", "#9a6324", "#fffac8", "#800000",
  "#aaffc3", "#808000", "#ffd8b1", "#000075", "#a9a9a9"
]

// 数据验证
const validVillages = computed(() => {
  return props.villages.filter(v => {
    return v.longitude && v.latitude &&
           typeof v.longitude === 'number' &&
           typeof v.latitude === 'number' &&
           v.longitude >= -180 && v.longitude <= 180 &&
           v.latitude >= -90 && v.latitude <= 90
  })
})

// 检查是否有方言数据
const hasDialectData = computed(() => {
  return validVillages.value.some(v => v.dialect && v.dialect.trim() !== '')
})

// 初始化地图
const initMap = () => {
  if (!mapContainer.value) return

  map.value = new maplibregl.Map({
    container: mapContainer.value,
    style: mapStyle(currentStyle.value),
    center: [113.2644, 23.1291], // 默认广州
    zoom: 8,
    attributionControl: false
  })

  map.value.addControl(
    new maplibregl.NavigationControl(),
    'top-left'
  )

  map.value.on('load', () => {
    renderMarkers()
  })
}

// 渲染标记 - 村名模式使用聚合，方言模式不聚合
const renderMarkers = () => {
  // 清除旧标记和图层
  currentMarkers.forEach(m => m.remove())
  currentMarkers.length = 0

  if (!map.value || !validVillages.value.length) return

  // 移除旧的 source 和 layers
  const layersToRemove = [
    'villages-text',
    'villages-background',
    'clusters',
    'cluster-count',
    'unclustered-point-bg',
    'unclustered-point-text'
  ]

  layersToRemove.forEach(layer => {
    if (map.value.getLayer(layer)) {
      map.value.removeLayer(layer)
    }
  })

  if (map.value.getSource('villages')) {
    map.value.removeSource('villages')
  }

  // 根据模式过滤村落
  let villagesToRender = validVillages.value

  // 方言模式：只显示有方言数据的村落
  if (displayMode.value === 'dialect') {
    villagesToRender = validVillages.value.filter(v => v.dialect && v.dialect.trim() !== '')
  }

  if (villagesToRender.length === 0) return

  // 自动居中
  const coords = villagesToRender.map(v => [v.longitude, v.latitude])
  const { center, zoom } = calculateDenseMapCenterAndZoom(coords)
  map.value.flyTo({ center, zoom })

  // 方言模式：建立方言到颜色的映射
  let dialectColorMap = {}
  if (displayMode.value === 'dialect') {
    const uniqueDialects = [...new Set(villagesToRender.map(v => v.dialect))]
    uniqueDialects.forEach((dialect, idx) => {
      dialectColorMap[dialect] = colorPalette[idx % colorPalette.length]
    })
  }

  // 转换为 GeoJSON FeatureCollection
  const geojsonData = {
    type: 'FeatureCollection',
    features: villagesToRender.map(village => {
      const label = displayMode.value === 'name' ? village.name : village.dialect
      const bgColor = displayMode.value === 'dialect'
        ? (dialectColorMap[village.dialect] || '#1b2e2b')
        : '#1b2e2b'
      const textColor = displayMode.value === 'dialect' ? '#000000' : '#a6ffdc'

      return {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [village.longitude, village.latitude]
        },
        properties: {
          name: village.name,
          dialect: village.dialect || '',
          label: label,
          bgColor: bgColor,
          textColor: textColor
        }
      }
    })
  }

  // 根据模式选择是否聚合
  if (displayMode.value === 'name') {
    // 村名模式：使用聚合
    renderWithClustering(geojsonData)
  } else {
    // 方言模式：不使用聚合
    renderWithoutClustering(geojsonData)
  }
}

// 带聚合的渲染（村名模式）
const renderWithClustering = (geojsonData) => {
  // 添加带聚合功能的 GeoJSON source
  map.value.addSource('villages', {
    type: 'geojson',
    data: geojsonData,
    cluster: true,
    clusterMaxZoom: 20,
    clusterRadius: 30
  })

  // 1. 聚合圆圈图层
  map.value.addLayer({
    id: 'clusters',
    type: 'circle',
    source: 'villages',
    filter: ['has', 'point_count'],
    paint: {
      'circle-color': [
        'step',
        ['get', 'point_count'],
        '#51bbd6',
        50,
        '#f1f075',
        100,
        '#f28cb1'
      ],
      'circle-radius': [
        'step',
        ['get', 'point_count'],
        20,
        50,
        30,
        100,
        40
      ],
      'circle-opacity': 0.85,
      'circle-stroke-width': 2,
      'circle-stroke-color': '#fff'
    }
  })

  // 2. 聚合数量文字图层
  map.value.addLayer({
    id: 'cluster-count',
    type: 'symbol',
    source: 'villages',
    filter: ['has', 'point_count'],
    layout: {
      'text-field': '{point_count_abbreviated}',
      'text-font': ['Open Sans Bold'],
      'text-size': 14
    },
    paint: {
      'text-color': '#ffffff'
    }
  })

  // 3. 未聚合点的背景圆形
  map.value.addLayer({
    id: 'unclustered-point-bg',
    type: 'circle',
    source: 'villages',
    filter: ['!', ['has', 'point_count']],
    paint: {
      'circle-radius': 17,
      'circle-color': ['get', 'bgColor'],
      'circle-opacity': 0.9,
      'circle-stroke-width': 1.5,
      'circle-stroke-color': 'rgba(255, 255, 255, 0.8)'
    }
  })

  // 4. 未聚合点的文字
  map.value.addLayer({
    id: 'unclustered-point-text',
    type: 'symbol',
    source: 'villages',
    filter: ['!', ['has', 'point_count']],
    layout: {
      'text-field': ['get', 'label'],
      'text-size': 11,
      'text-font': ['Open Sans Regular'],
      'text-anchor': 'center'
    },
    paint: {
      'text-color': ['get', 'textColor']
    }
  })

  // 点击聚合圆圈时放大
  map.value.on('click', 'clusters', (e) => {
    const features = map.value.queryRenderedFeatures(e.point, {
      layers: ['clusters']
    })

    if (!features.length) return

    const clusterId = features[0].properties.cluster_id
    map.value.getSource('villages').getClusterExpansionZoom(
      clusterId,
      (err, zoom) => {
        if (err) return

        map.value.easeTo({
          center: features[0].geometry.coordinates,
          zoom: zoom + 0.5
        })
      }
    )
  })

  // 悬停效果
  const popup = new maplibregl.Popup({
    closeButton: false,
    closeOnClick: false,
    offset: 10
  })

  map.value.on('mouseenter', 'unclustered-point-bg', (e) => {
    map.value.getCanvas().style.cursor = 'pointer'

    if (e.features.length > 0) {
      const feature = e.features[0]
      const { name, dialect } = feature.properties
      popup.setLngLat(e.lngLat)
        .setHTML(`<strong>${name}</strong><br>${dialect || ''}`)
        .addTo(map.value)
    }
  })

  map.value.on('mouseleave', 'unclustered-point-bg', () => {
    map.value.getCanvas().style.cursor = ''
    popup.remove()
  })

  map.value.on('mouseenter', 'clusters', () => {
    map.value.getCanvas().style.cursor = 'pointer'
  })

  map.value.on('mouseleave', 'clusters', () => {
    map.value.getCanvas().style.cursor = ''
  })
}

// 不带聚合的渲染（方言模式）- 使用 DOM Marker，优化性能
const renderWithoutClustering = (geojsonData) => {
  // 方言模式使用 DOM Marker，分批渲染优化性能
  const dialectColorMap = {}
  const uniqueDialects = [...new Set(geojsonData.features.map(f => f.properties.dialect).filter(d => d))]
  uniqueDialects.forEach((dialect, idx) => {
    dialectColorMap[dialect] = colorPalette[idx % colorPalette.length]
  })

  const features = geojsonData.features
  const batchSize = 100 // 每批渲染 100 个标记
  let currentIndex = 0

  // 分批渲染函数
  const renderBatch = () => {
    const endIndex = Math.min(currentIndex + batchSize, features.length)

    for (let i = currentIndex; i < endIndex; i++) {
      const feature = features[i]
      const { name, dialect } = feature.properties
      const [lng, lat] = feature.geometry.coordinates

      // 创建文字标记元素（类似 MapLibre.vue 的 marker-text-feature）
      const el = document.createElement('div')
      el.className = 'marker-text-feature'
      el.innerText = dialect
      el.style.backgroundColor = dialectColorMap[dialect] || '#1b2e2b'

      // 创建 Marker
      const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat([lng, lat])
        .addTo(map.value)

      // 使用单个 Popup 实例，优化性能
      if (!window._villagePopup) {
        window._villagePopup = new maplibregl.Popup({
          offset: 10,
          closeButton: false,
          closeOnClick: false
        })
      }

      // 优化事件监听：使用箭头函数避免重复创建
      el.addEventListener('mouseenter', () => {
        window._villagePopup
          .setLngLat([lng, lat])
          .setHTML(`<strong>${name}</strong>`)
          .addTo(map.value)
      })

      el.addEventListener('mouseleave', () => {
        window._villagePopup.remove()
      })

      currentMarkers.push(marker)
    }

    currentIndex = endIndex

    // 如果还有未渲染的标记，继续下一批
    if (currentIndex < features.length) {
      requestAnimationFrame(renderBatch)
    }
  }

  // 开始分批渲染
  renderBatch()
}

// 切换显示模式
const toggleDisplay = () => {
  displayMode.value = displayMode.value === 'name' ? 'dialect' : 'name'
}

// 切换全屏
const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value

  // 地图需要在容器尺寸改变后重新计算
  nextTick(() => {
    if (map.value) {
      map.value.resize()
    }
  })
}

// 复位视图
const resetView = () => {
  if (map.value && validVillages.value.length > 0) {
    const coords = validVillages.value.map(v => [v.longitude, v.latitude])
    const { center, zoom } = calculateDenseMapCenterAndZoom(coords)
    map.value.flyTo({ center, zoom })
  }
}

// 切换地图样式
const changeMapStyle = () => {
  if (!map.value) return
  const newStyle = mapStyle(currentStyle.value)
  map.value.setStyle(newStyle)
}

// 清理地图
const cleanupMap = () => {
  currentMarkers.forEach(m => m.remove())
  currentMarkers.length = 0

  // 清理全局 popup
  if (window._villagePopup) {
    window._villagePopup.remove()
    delete window._villagePopup
  }

  if (map.value) {
    // 移除村名模式（聚合）的事件监听器
    map.value.off('click', 'clusters')
    map.value.off('mouseenter', 'unclustered-point-bg')
    map.value.off('mouseleave', 'unclustered-point-bg')
    map.value.off('mouseenter', 'clusters')
    map.value.off('mouseleave', 'clusters')

    // 移除所有图层
    const layersToRemove = [
      'unclustered-point-text',
      'unclustered-point-bg',
      'cluster-count',
      'clusters'
    ]

    layersToRemove.forEach(layer => {
      if (map.value.getLayer(layer)) {
        map.value.removeLayer(layer)
      }
    })

    // 移除 source
    if (map.value.getSource('villages')) {
      map.value.removeSource('villages')
    }

    map.value.remove()
    map.value = null
  }
}

// 关闭弹窗
const handleClose = () => {
  emit('close')
}

// 键盘支持
const handleKeydown = (e) => {
  if (e.key === 'Escape' && props.visible) {
    if (isFullscreen.value) {
      // 如果在全屏模式，先退出全屏
      isFullscreen.value = false
    } else {
      // 否则关闭弹窗
      handleClose()
    }
  }
}

// 弹窗打开时初始化地图
watch(() => props.visible, (newVal) => {
  if (newVal) {
    nextTick(() => initMap())
  } else {
    cleanupMap()
  }
})

// 数据或显示模式变化时重新渲染
watch(() => props.villages, () => {
  if (map.value && props.visible) renderMarkers()
}, { deep: true })

watch(displayMode, () => {
  if (map.value && props.visible) renderMarkers()
})

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown)
  cleanupMap()
})
</script>

<style scoped>
/* 遮罩层 */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 100000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

/* 地图容器 */
.map-modal-container {
  width: 90vw;
  max-width: 1200px;
  height: 80vh;
  background: linear-gradient(
    145deg,
    rgba(255, 255, 255, 0.95),
    rgba(255, 255, 255, 0.85)
  );
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.25),
    0 8px 16px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.map-modal-container.fullscreen {
  width: 100vw !important;
  height: 100vh !important;
  max-width: none !important;
  border-radius: 0 !important;
  margin: 0 !important;
}

/* 头部 */
.modal-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  background: rgba(255, 255, 255, 0.3);
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1d1d1f;
  flex-shrink: 0;
}

.village-count {
  padding: 6px 12px;
  border-radius: 10px;
  background: rgba(52, 199, 89, 0.15);
  color: #34c759;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  flex-shrink: 0;
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 24px;
  color: #666;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
  flex-shrink: 0;
  margin-left: auto;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #000;
}

/* 地图内容 */
.map-content {
  flex: 1;
  position: relative;
  overflow: hidden;
}

/* 控制面板 */
.map-controls {
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  padding: 12px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 10;
  min-width: 140px;
}

.map-controls select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  font-size: 13px;
  cursor: pointer;
  outline: none;
  transition: border 0.2s;
}

.map-controls select:focus {
  border-color: #007aff;
}

.toggle-display-btn {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  color: #333;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.toggle-display-btn:hover {
  background: #f5f5f7;
  border-color: #007aff;
}

.button-row {
  display: flex;
  gap: 8px;
}

.control-btn {
  flex: 1;
  padding: 8px 12px;
  border: none;
  border-radius: 8px;
  background: #007aff;
  color: white;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.control-btn:hover {
  background: #0062cc;
}

/* 全屏退出按钮 */
.exit-fullscreen-btn {
  position: absolute;
  top: 32px;
  right: 16px;
  z-index: 10;
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: #1d1d1f;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.2s;
}

.exit-fullscreen-btn:hover {
  background: rgba(255, 255, 255, 1);
  transform: scale(1.05);
}

/* 村落标记样式 */
:deep(.village-marker) {
  /* 背景色和文字色通过 JS 动态设置，这里只定义共同样式 */
  padding: 3px 6px;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  white-space: nowrap;
  font-family: "SimHei", "黑体", sans-serif;
  cursor: pointer;
  text-align: center;
  font-weight: 500;
  transition: all 0.2s;
  border: 1px solid rgba(0, 0, 0, 0.2);
}

:deep(.village-marker:hover) {
  transform: scale(1.15);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  z-index: 1000;
  filter: brightness(1.1);
}

/* 方言模式标记样式（与 MapLibre.vue 保持一致）*/
:deep(.marker-text-feature) {
  padding: 2px 4px;
  border-radius: 4px;
  box-shadow: 0 2px 6px rgba(114, 124, 245, 0.5);
  font-size: 15px;
  color: black;
  white-space: nowrap;
  font-family: "Times New Roman", serif;
  border: 0.7px solid black;
  cursor: pointer;
  /* 背景色在 JS 中动态设置 */
}

/* 弹窗样式 */
:deep(.maplibregl-popup-content) {
  padding: 10px 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  font-size: 13px;
  line-height: 1.6;
  color: #333;
}

:deep(.maplibregl-popup-content strong) {
  color: #1d1d1f;
  font-weight: 600;
}

/* 动画 */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.25s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .map-modal-container {
  animation: modal-scale-in 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.modal-fade-leave-active .map-modal-container {
  animation: modal-scale-out 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

@keyframes modal-scale-in {
  0% {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes modal-scale-out {
  0% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
  100% {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
}

/* 响应式 */
@media (max-width: 768px) {
  .map-modal-container {
    width: 95vw;
    height: 85vh;
    border-radius: 16px;
  }

  .modal-header {
    padding: 16px;
    flex-wrap: wrap;
    gap: 8px;
  }

  .modal-header h3 {
    font-size: 18px;
    width: 100%;
  }

  .map-controls {
    min-width: 120px;
  }

  .exit-fullscreen-btn {
    padding: 8px 16px;
    font-size: 13px;
  }
}
</style>

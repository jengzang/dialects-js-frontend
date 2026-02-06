<template>
  <div class="yubao-map-container" :class="{ 'is-fullscreen': isFullScreen }">
    <!-- 地图容器 -->
    <div ref="mapContainer" class="map-container">
      <!-- 地图控制面板 -->
      <div class="map-controls" v-if="!isFullScreen">
        <!-- 地图样式选择器 -->
        <div class="control-group">
          <div class="custom-select">
            <select v-model="currentStyleKey" @change="handleStyleChange">
              <option
                  v-for="(name, key) in mapStyleConfig"
                  :key="key"
                  :value="key"
              >
                {{ name }}
              </option>
            </select>
            <span class="arrow">▾</span>
          </div>
        </div>

        <!-- 显示模式切换 -->
        <div class="control-group mode-switcher">
          <button
            :class="{ active: displayMode === 'location' }"
            @click="switchDisplayMode('location')"
            title="顯示地名"
          >
            地名
          </button>
          <button
            :class="{ active: displayMode === 'pronunciation' }"
            @click="switchDisplayMode('pronunciation')"
            title="顯示語音"
          >
            語音
          </button>
          <button
            :class="{ active: displayMode === 'definition' }"
            @click="switchDisplayMode('definition')"
            title="顯示釋義"
          >
            釋義
          </button>
        </div>

        <!-- 功能按钮 -->
        <div class="button-row">
          <button class="action-btn" @click="resetView" title="復位視角">
            🎯 復位
          </button>
          <button class="action-btn fullscreen-btn" @click="toggleFullScreen" title="全屏">
            ⛶ 全屏
          </button>
        </div>
      </div>
    </div>

    <!-- 全屏退出按钮 -->
    <button v-if="isFullScreen" class="exit-fullscreen-btn" @click="toggleFullScreen">
      ✕ 退出全屏
    </button>

    <!-- 弹窗 -->
    <Teleport to="body">
      <div v-if="showPopup && popupData" class="yubao-popup-overlay" @click="closePopup">
        <div class="yubao-popup-content" @click.stop>
          <div class="popup-header">
            <h3>詳細信息</h3>
            <button class="close-btn" @click="closePopup">✕</button>
          </div>
          <div class="popup-body">
            <!-- 词汇 tab -->
            <template v-if="activeTab === 'vocabulary'">
              <div class="info-row">
                <span class="label">地點：</span>
                <span class="value">{{ popupData.locationChain }}</span>
              </div>
              <div class="info-row">
                <span class="label">發音：</span>
                <span class="value">{{ popupData.pronunciation || '-' }}</span>
              </div>
              <div class="info-row">
                <span class="label">字：</span>
                <span class="value">{{ popupData.word || '-' }}</span>
              </div>
              <div class="info-row" v-if="popupData.note1">
                <span class="label">注釋：</span>
                <span class="value">{{ popupData.note1 }}</span>
              </div>
              <div class="info-row" v-if="popupData.category && popupData.category !== '-'">
                <span class="label">分區：</span>
                <span class="value">{{ popupData.category }}</span>
              </div>
            </template>

            <!-- 语法 tab -->
            <template v-else>
              <div class="info-row">
                <span class="label">地點：</span>
                <span class="value">{{ popupData.locationChain }}</span>
              </div>
              <div class="info-row">
                <span class="label">發音：</span>
                <span class="value">{{ popupData.phonetic || '-' }}</span>
              </div>
              <div class="info-row" v-if="popupData.memo">
                <span class="label">注釋：</span>
                <span class="value">{{ popupData.memo }}</span>
              </div>
              <div class="info-row" v-if="popupData.sentence">
                <span class="label">句式：</span>
                <span class="value">{{ popupData.sentence }}</span>
              </div>
              <div class="info-row" v-if="popupData.category && popupData.category !== '-'">
                <span class="label">分區：</span>
                <span class="value">{{ popupData.category }}</span>
              </div>
            </template>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, shallowRef, nextTick, watch, computed } from 'vue'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import {mapStyle, calculateDenseMapCenterAndZoom, mapStyleConfig} from '@/utils/MapSource.js'

// --- Props ---
const props = defineProps({
  mapData: {
    type: Array,
    default: () => []
  },
  activeTab: {
    type: String,
    default: 'vocabulary'
  }
})

// --- State ---
const mapContainer = ref(null)
const map = shallowRef(null)
const currentStyleKey = ref('gaode')
const displayMode = ref('pronunciation')
const isFullScreen = ref(false)
const currentMarkers = []
const popupData = ref(null)
const showPopup = ref(false)

// --- Functions ---

// 预定义的颜色数组（柔和的浅色系）
const colorScale = [
  '#FFB3B3', '#FFB366', '#FFFF99', '#B3FFB3', '#99CCFF', '#D4A6FF',
  '#FF6666', '#FFD699', '#99CCCC', '#D1D1FF', '#FF9999', '#FFB3FF',
  '#FFFF66', '#B3FF99', '#99CCFF', '#FFCC99', '#CCCCFF', '#FF66CC',
  '#FFFF66', '#B3FFCC'
]

// 根据文本生成一致的颜色（从预定义数组中选择）
const assignColor = (text) => {
  if (!text || text === '-') return '#E5E5E5'

  // 使用哈希函数计算索引
  let hash = 0
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash)
  }

  // 取绝对值并对数组长度取模，得到索引
  const index = Math.abs(hash) % colorScale.length

  return colorScale[index]
}

// 计算地图视角
const calculateMapView = (data) => {
  if (!data || data.length === 0) {
    return { center: [113.2644, 23.1291], zoom: 8 }
  }

  // 修复：使用正确的字段名 longitude 和 latitude
  const coordinates = data
    .map(item => {
      const lng = parseFloat(item.longitude)
      const lat = parseFloat(item.latitude)
      return [lng, lat]
    })
    .filter(coord => Array.isArray(coord) && coord.length >= 2 &&
            Number.isFinite(coord[0]) && Number.isFinite(coord[1]))

  if (coordinates.length === 0) {
    return { center: [113.2644, 23.1291], zoom: 8 }
  }

  return calculateDenseMapCenterAndZoom(coordinates)
}

// 获取标记文本
const getMarkerText = (item) => {
  let text = ''

  // 检查值是否为空的辅助函数
  const isEmpty = (val) => {
    return !val || val === '（空）' || val === '(空)' || val.trim() === ''
  }

  if (displayMode.value === 'location') {
    // 地名模式
    if (props.activeTab === 'vocabulary') {
      // 如果 county 为空，使用 village 作为后备
      text = isEmpty(item.county) ? item.village : item.county
    } else {
      // 如果 form_c 为空，使用 form_d 作为后备
      text = isEmpty(item.form_c) ? item.form_d : item.form_c
    }
  } else if (displayMode.value === 'pronunciation') {
    // 语音模式
    text = props.activeTab === 'vocabulary' ? item.pronunciation : item.phonetic
  } else if (displayMode.value === 'definition') {
    // 释义模式
    text = props.activeTab === 'vocabulary' ? item.note2 : item.memo
  }

  // 文字截断（超过 6 字符）
  if (text && text.length > 6) {
    text = text.substring(0, 6) + '...'
  }

  return text || '-'
}

// 获取地点链
const getLocationText = (item) => {
  if (props.activeTab === 'vocabulary') {
    return [item.province, item.city, item.county, item.village, item.location]
      .filter(Boolean)
      .join('-') || '-'
  } else {
    return [item.form_a, item.form_b, item.form_c, item.form_d, item.form_e]
      .filter(Boolean)
      .join('-') || '-'
  }
}

// 清除标记
const clearMarkers = () => {
  currentMarkers.forEach(marker => marker.remove())
  currentMarkers.length = 0
}

// 渲染标记
const renderMarkers = () => {
  if (!map.value || !props.mapData || props.mapData.length === 0) {
    console.log('❌ renderMarkers: 无法渲染', {
      hasMap: !!map.value,
      hasData: !!props.mapData,
      dataLength: props.mapData?.length
    })
    return
  }

  console.log('🗺️ 开始渲染标记', {
    dataCount: props.mapData.length,
    displayMode: displayMode.value,
    activeTab: props.activeTab
  })

  clearMarkers()

  let validCount = 0
  let invalidCount = 0

  props.mapData.forEach(item => {
    // 修复：使用正确的字段名 longitude 和 latitude
    const lng = parseFloat(item.longitude)
    const lat = parseFloat(item.latitude)

    if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
      invalidCount++
      return
    }

    const coord = [lng, lat]

    const text = getMarkerText(item)
    if (!text || text === '-') return

    const el = document.createElement('div')
    el.className = 'yubao-marker'
    el.innerText = text
    el.style.cursor = 'pointer'

    // 根据显示模式调整样式和颜色
    if (displayMode.value === 'location') {
      // 地名模式：固定颜色
      el.style.backgroundColor = '#1b2e2b'
      el.style.color = '#a6ffdc'
    } else if (displayMode.value === 'pronunciation') {
      // 语音模式：根据发音分配颜色
      const bgColor = assignColor(text)
      el.style.backgroundColor = bgColor
      el.style.color = '#1d1d1f'  // 深黑色文字
      el.style.fontWeight = '600'
    } else {
      // 释义模式：根据释义分配颜色
      const bgColor = assignColor(text)
      el.style.backgroundColor = bgColor
      el.style.color = '#1d1d1f'  // 深黑色文字
      el.style.fontWeight = '600'
    }

    el.addEventListener('click', () => handleMarkerClick(item))

    const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
      .setLngLat(coord)
      .addTo(map.value)

    currentMarkers.push(marker)
  })
}

// 处理标记点击
const handleMarkerClick = (item) => {
  const categoryChain = [item.lang_cat1, item.lang_cat2, item.lang_cat3]
    .filter(Boolean)
    .join('-') || '-'

  popupData.value = {
    locationChain: getLocationText(item),
    pronunciation: item.pronunciation || '',
    phonetic: item.phonetic || '',
    word: item.note2 || item.word || '',
    note1: item.note1 || '',
    memo: item.memo || '',
    sentence: item.sentence || '',
    category: categoryChain
  }
  showPopup.value = true
}

// 关闭弹窗
const closePopup = () => {
  showPopup.value = false
  popupData.value = null
}

// 切换显示模式
const switchDisplayMode = (mode) => {
  displayMode.value = mode
  renderMarkers()
}

// 复位视角
const resetView = () => {
  if (!map.value) return

  const { center, zoom } = calculateMapView(props.mapData)
  map.value.flyTo({
    center,
    zoom,
    essential: true
  })
}

// 切换全屏
const toggleFullScreen = async () => {
  isFullScreen.value = !isFullScreen.value
  await nextTick()
  if (map.value) map.value.resize()
}

// 切换地图样式
const handleStyleChange = () => {
  if (!map.value) return
  const newStyle = mapStyle(currentStyleKey.value)
  map.value.setStyle(newStyle)
}

// 初始化地图
const initMap = () => {
  if (!mapContainer.value) return

  const { center, zoom } = calculateMapView(props.mapData)

  map.value = new maplibregl.Map({
    container: mapContainer.value,
    style: mapStyle(currentStyleKey.value),
    center,
    zoom,
    attributionControl: false
  })

  map.value.addControl(new maplibregl.NavigationControl(), 'top-left')

  map.value.on('load', () => {
    renderMarkers()
  })
}

// --- Lifecycle ---
onMounted(() => {
  initMap()
})

onBeforeUnmount(() => {
  clearMarkers()
  if (map.value) {
    map.value.remove()
    map.value = null
  }
})

// --- Watchers ---
watch(() => props.mapData, () => {
  if (map.value) {
    const { center, zoom } = calculateMapView(props.mapData)
    map.value.flyTo({ center, zoom })
    renderMarkers()
  }
}, { deep: true })

watch(() => props.activeTab, () => {
  renderMarkers()
})
</script>

<style scoped>
.yubao-map-container {
  width: 100%;
  height: 100%;
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.yubao-map-container.is-fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100dvh;
  border-radius: 0;
  z-index: 99999;
}

.map-container {
  width: 100%;
  height: 100%;
}

/* 地图控制面板 */
.map-controls {
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  padding: 12px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 10;
  width: 160px;
}

.control-group {
  width: 100%;
  position: relative;
  display: flex;
}

/* 自定义 Select */
.custom-select {
  position: relative;
  width: 100%;
}

.custom-select select {
  width: 100%;
  appearance: none;
  background: white;
  border: 1px solid #ddd;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  outline: none;
  transition: border 0.3s;
}

.custom-select select:focus {
  border-color: #007aff;
}

.custom-select .arrow {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  font-size: 12px;
  color: #888;
}

/* 模式切换按钮 */
.mode-switcher {
  display: flex;
  gap: 4px;
  background: #f0f0f0;
  border-radius: 8px;
  padding: 4px;
}

.mode-switcher button {
  flex: 1;
  padding: 6px 8px;
  border: none;
  background: transparent;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  color: #666;
}

.mode-switcher button:hover {
  background: rgba(0, 0, 0, 0.05);
}

.mode-switcher button.active {
  background: white;
  color: #007aff;
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* 按钮行 */
.button-row {
  display: flex;
  gap: 10px;
  width: 100%;
}

.button-row .action-btn {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  white-space: nowrap;
}

.action-btn {
  background: #007aff;
  color: white;
  border: none;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  transition: background 0.2s;
}

.action-btn:hover {
  background: #0062cc;
}

.fullscreen-btn {
  background: #34c759;
}

.fullscreen-btn:hover {
  background: #2db34e;
}

/* 退出全屏按钮 */
.exit-fullscreen-btn {
  position: absolute;
  top: 24px;
  right: 24px;
  padding: 12px 24px;
  font-size: 15px;
  font-weight: 600;
  color: #333;
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 50px;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.1);
  cursor: pointer;
  z-index: 2000;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.exit-fullscreen-btn:hover {
  background: rgba(255, 255, 255, 0.85);
  transform: scale(1.05);
  box-shadow: 0 12px 40px 0 rgba(0, 0, 0, 0.15);
}

.exit-fullscreen-btn:active {
  transform: scale(0.95);
}
</style>

<style>
/* 全局样式 - 标记 */
.yubao-marker {
  padding: 4px 8px;
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  font-size: 13px;
  white-space: nowrap;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', sans-serif;
  font-weight: 500;
  transition: all 0.2s;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.yubao-marker:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

/* 弹窗样式 */
.yubao-popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100000;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.yubao-popup-content {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
  background: #f8f8f8;
}

.popup-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
  font-weight: 600;
}

.close-btn {
  background: #f0f0f0;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #666;
  padding: 4px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s;
  flex-shrink: 0;
}

.close-btn:hover {
  background: #e0e0e0;
  color: #333;
  transform: scale(1.1);
}

.popup-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.info-line {
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
  line-height: 1.6;
}

.info-line:last-child {
  border-bottom: none;
}

.info-line strong {
  color: #555;
  margin-right: 8px;
  font-weight: 600;
}
</style>

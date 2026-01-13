<template>
  <div class="map-page-container" :class="{ 'is-fullscreen': isFullScreen }">

    <div ref="mapContainer" class="map-container"></div>

    <div class="map-controls" v-if="!isFullScreen">
      <div class="control-group">
        <label>🗺️ 底圖風格</label>
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

      <button class="action-btn" @click="resetView">🎯 視角復位</button>
      <button class="action-btn fullscreen-btn" @click="toggleFullScreen">⛶ 全屏模式</button>
    </div>

    <button v-if="isFullScreen" class="exit-fullscreen-btn" @click="toggleFullScreen">
      ✕ 退出全屏
    </button>

    <div v-if="loading" class="loading-overlay">
      <span>地圖資源加載中...</span>
    </div>
  </div>
</template>

<script setup>
import {ref, onMounted, onBeforeUnmount, shallowRef, nextTick} from 'vue'; // ✨ 引入 nextTick
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {mapStyle, mapStyleConfig, calculateDenseMapCenterAndZoom} from '@/utils/MapSource.js'

const mapContainer = ref(null);
const map = shallowRef(null);
const currentStyleKey = ref('maptiler_streets');
const loading = ref(true);
const isFullScreen = ref(false); // ✨ 新增狀態

const mockPoints = [
  [113.2644, 23.1291], // 廣州
  [114.0579, 22.5431], // 深圳
  [113.7518, 23.0205], // 東莞
  [114.1747, 22.2783], // 香港
];

// ✨ 5. 全屏切換邏輯
const toggleFullScreen = async () => {
  isFullScreen.value = !isFullScreen.value;

  // 等待 DOM 更新完成（容器變大後），通知 MapLibre 重繪
  await nextTick();
  if (map.value) {
    map.value.resize();
  }
};

onMounted(() => {
  initMap();
});

onBeforeUnmount(() => {
  if (map.value) {
    map.value.remove();
    map.value = null;
  }
});

const initMap = () => {
  if (!mapContainer.value) return;

  const {center, zoom} = calculateDenseMapCenterAndZoom(mockPoints);

  map.value = new maplibregl.Map({
    container: mapContainer.value,
    style: mapStyle(currentStyleKey.value),
    center: center,
    zoom: zoom,
    attributionControl: false
  });

  map.value.addControl(new maplibregl.NavigationControl(), 'top-left');

  map.value.on('load', () => {
    loading.value = false;
    addMarkers();
  });
};

const handleStyleChange = () => {
  if (!map.value) return;
  const newStyle = mapStyle(currentStyleKey.value);
  map.value.setStyle(newStyle);
};

const addMarkers = () => {
  mockPoints.forEach(point => {
    const lngLat = [point[0], point[1]];
    const el = document.createElement('div');
    el.className = 'custom-marker';
    el.innerText = '📍';
    el.style.fontSize = '24px';

    new maplibregl.Marker({element: el})
        .setLngLat(lngLat)
        .setPopup(new maplibregl.Popup({offset: 25}).setHTML('<h3>測試點</h3><p>這是一個示例點位</p>'))
        .addTo(map.value);
  });
};

const resetView = () => {
  if (!map.value) return;
  const {center, zoom} = calculateDenseMapCenterAndZoom(mockPoints);
  map.value.flyTo({
    center,
    zoom,
    essential: true
  });
};
</script>

<style scoped>
.map-page-container {
  width: 90dvw;
  height: 70vh;
  position: relative;
  border-radius: 30px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1); /* ✨ 添加平滑過渡 */
  z-index: 100; /* 確保不被其他元素遮擋 */
}

/* ✨ 全屏樣式 */
.map-page-container.is-fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100dvh;
  border-radius: 0;
  z-index: 99999;
}

/* ✨ 蘋果液態玻璃風格 - 退出按鈕 */
.exit-fullscreen-btn {
  position: absolute;
  top: 24px;
  right: 24px;
  padding: 12px 24px;
  font-size: 15px;
  font-weight: 600;
  color: #333;
  background: rgba(255, 255, 255, 0.65); /* 半透明白 */
  backdrop-filter: blur(20px) saturate(180%); /* 液態模糊感 */
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.5); /* 玻璃邊緣反光 */
  border-radius: 50px; /* 膠囊形狀 */
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.1); /* 柔和陰影 */
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

@media (max-aspect-ratio: 1/1 ) {
  .map-page-container {
    height: 65dvh;
  }
}

.map-container {
  width: 100%;
  height: 100%;
}

/* 浮動控制面板樣式 - 玻璃擬態 */
.map-controls {
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  padding: 12px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  gap: 5px;
  z-index: 10;
  width: 150px;
  transition: opacity 0.3s ease; /* ✨ 控制欄淡入淡出 */
}

.control-group label {
  font-size: 12px;
  color: #666;
  font-weight: bold;
  margin-bottom: 4px;
  display: block;
}

/* 自定義 Select */
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

/* ✨ 全屏按鈕樣式 (綠色區分) */
.fullscreen-btn {
  background: #34c759; /* Apple Green */
  margin-top: 4px;
}

.fullscreen-btn:hover {
  background: #2db34e;
}

.loading-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
  font-weight: bold;
  color: #555;
}
</style>
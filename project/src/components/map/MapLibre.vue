<template>
  <div class="map-page-container" :class="{ 'is-fullscreen': isFullScreen }">


    <div ref="mapContainer" class="map-container">
      <div class="map-controls" v-if="!isFullScreen">
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

        <div
            v-if="isMiddleChineseMode && hasCustomData"
            id="custom-switch-container"
            class="custom-switch-container1"
            @click="toggleCustomSwitch"
        >
          <span class="switch-label-text">用戶個人數據</span>
          <div class="custom-switch" :class="{ 'open': mapStore.showCustomData }" id="custom-toggle">
              <span class="custom-slider">
                  <span id="switch-text" class="switch-text">
                    {{ mapStore.showCustomData ? '顯示' : '隱藏' }}
                  </span>
              </span>
          </div>
        </div>

        <div
            id="base-switch-container"
            class="custom-switch-container1"
            @click="toggleBaseMode"
        >
          <span class="switch-label-text">查看地名</span>

          <div class="custom-switch" :class="{ 'open': isBaseModeActive }" id="base-toggle">
        <span class="custom-slider">
            <span class="switch-text">
              {{ isBaseModeActive ? '開啟' : '關閉' }}
            </span>
        </span>
          </div>
        </div>
        <div class="button-row">
          <button class="action-btn" @click="resetView">🎯 復位</button>
          <button class="action-btn fullscreen-btn" @click="toggleFullScreen">⛶ 全屏</button>
        </div>
      </div>
    </div>

    <button v-if="isFullScreen" class="exit-fullscreen-btn" @click="toggleFullScreen">
      ✕ 退出全屏
    </button>

    <div v-if="loading" class="loading-overlay">
      <div class="spinner"></div>
      <span>地圖渲染中...</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, shallowRef, nextTick, watch, computed } from 'vue';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { mapStyle, mapStyleConfig, calculateDenseMapCenterAndZoom } from '@/utils/MapSource.js';
import {get_detail} from "@/utils/ResultTable.js";
import {mapStore, userStore, resultCache} from "@/utils/store.js";
import { showSuccess, showError, showWarning, showConfirm } from '@/utils/message.js';
import { api } from '@/utils/auth.js';
import { func_mergeData } from '@/utils/MapData.js';

// --- Props: 只接收數據，不負責請求 ---
const props = defineProps({
  // 1. 基礎數據 (對應 locations_data)
  // 格式: { coordinates_locations: [['廣州', [113, 23]], ...], center_coordinate: [], zoom_level: 8, region_mappings: {...} }
  // mapData: { type: Object, default: null },
  // 2. 特徵詳細數據 (對應 mergedData)
  // 格式: [{ feature: '流攝', value: 'eu', coordinate: [...], color: '#f00', detailContent: [...], iscustoms: 0, notes: '' }, ...]
  // mergedData: { type: Array, default: () => window.mergedData},
  // 3. 當前模式: 'base'(基礎字), 'dot'(分區色點), 'feature'(特徵分佈)
  // mode: { type: String, default: 'base' },
  // 4. 當前選中的特徵 (僅 feature 模式有效)
  activeFeature: { type: String, default: '' },
  // 5. 是否開啟自定義顯示邏輯 (對應 window.isCustomOn)
  isCustom: { type: Boolean, default: false },
  // ✨ 新增：指定色點圖的層級 (1, 2, 3)
  dotLevel: { type: [String, Number], default: null },
});

// --- Emits ---
const emit = defineEmits(['map-click']);

const mapContainer = ref(null);
const map = shallowRef(null);
const currentStyleKey = ref('maptiler_streets');
const loading = ref(false);
const isFullScreen = ref(false);
// showCustomData 改为使用 mapStore 中的状态

// 2. ✨ 判斷是否為“查中古”模式
const isMiddleChineseMode = ref(false);
const hasCustomData = computed(() => {
  const data = mapStore.mergedData;
  if (!data || data.length === 0) return false;
  // 只要數組裡有一個 item 的 iscustoms 為 1，就說明開關是有用的
  return data.some(item => item.iscustoms === 1);
});

// 2. 定義檢查函數
const checkWindowMode = () => {
  isMiddleChineseMode.value = (resultCache && resultCache.mode === '查中古');
};
// 3. 切換開關邏輯
const toggleCustomSwitch = () => {
  if (userStore.role === 'anonymous') {
    showWarning("未登錄用戶無法查看用戶個人數據！");
    return;
  }
  mapStore.showCustomData = !mapStore.showCustomData;
};
const lastNonBaseMode = ref('feature');
// 只要當前 store 是 base 模式，開關就是開的
const isBaseModeActive = computed(() => mapStore.mode === 'base');

// 4. 切換邏輯
const toggleBaseMode = (e) => {
  if (e) e.stopPropagation();

  if (mapStore.mode === 'base') {
    // 關閉開關 -> 回復到原來的模式
    mapStore.mode = lastNonBaseMode.value;
  } else {
    // 打開開關 -> 切換到 base 模式
    mapStore.mode = 'base';
  }
};
// 管理所有的 Marker 實例，用於清除
let currentMarkers = [];

// 20色盤 (來自 create_dot_all)
const colorPalette = [
  "#e6194b", "#3cb44b", "#ffe119", "#4363d8", "#f58231",
  "#911eb4", "#42d4f4", "#f032e6", "#bfe745", "#fabed4",
  "#469990", "#dcbaff", "#9a6324", "#fffac8", "#800000",
  "#aaffc3", "#808000", "#ffd8b1", "#000075", "#a9a9a9"
];

// --- 生命周期 ---
onMounted(() => {
  initMap();
});

onBeforeUnmount(() => {
  clearMarkers();
  if (map.value) {
    map.value.remove();
    map.value = null;
  }
});

// --- 監聽數據變化，自動重繪 ---
watch(
    // 監聽源改成 store 裡的數據
    [() => mapStore.mapData, () => mapStore.mergedData, () => mapStore.mode, () => props.activeFeature],
    () => {
      renderMapContent();
    },
    { deep: true }
);
watch(() => mapStore.showCustomData, () => {
  renderMapContent();
});

// 監聽 resultCache.mode 變化，更新 isMiddleChineseMode
watch(() => resultCache.mode, () => {
  checkWindowMode();
}, { immediate: true });

// // 監聽 hasCustomData 變化（用於調試）
// watch(hasCustomData, (newVal) => {
//   console.log('📊 hasCustomData 變化:', newVal);
//   console.log('📌 isMiddleChineseMode:', isMiddleChineseMode.value);
//   console.log('📌 resultCache.mode:', resultCache.mode);
// });

// 2. 監聽 store 的模式變化，自動記錄歷史
watch(
    () => mapStore.mode,
    (newMode) => {
      // 只要當前模式不是 base，就把它記下來
      if (newMode !== 'base') {
        lastNonBaseMode.value = newMode;
      }
    },
    { immediate: true }
);

// --- 初始化地圖 ---
const initMap = () => {
  if (!mapContainer.value) return;

  // 默認視角，後續會被數據覆蓋
  map.value = new maplibregl.Map({
    container: mapContainer.value,
    style: mapStyle(currentStyleKey.value),
    center: [113.2644, 23.1291],
    zoom: 8,
    attributionControl: false
  });

  map.value.addControl(new maplibregl.NavigationControl(), 'top-left');

  map.value.on('load', () => {
    // 地圖加載完畢，如果有數據，立即渲染
    renderMapContent();
  });

  // 監聽地圖點擊事件，傳遞坐標給父組件
  map.value.on('click', (e) => {
    emit('map-click', {
      lng: e.lngLat.lng,
      lat: e.lngLat.lat
    });
  });
};

// --- 核心渲染入口 ---
const renderMapContent = async () => {
  if (!map.value) return;

  // 清除舊標記
  clearMarkers();

  // 根據數據調整視角
  let centerCoord = null;
  let zoomLevel = 8;

  // 优先使用 mapStore.mapData（基础地图数据）
  if (mapStore.mapData && mapStore.mapData.center_coordinate) {
    centerCoord = mapStore.mapData.center_coordinate;
    zoomLevel = mapStore.mapData.zoom_level || 8;
  }
  // 如果没有 mapData，或者在 feature 模式且有 mergedData，则从 mergedData 中提取
  else if (mapStore.mergedData && mapStore.mergedData.length > 0) {
    const firstItem = mapStore.mergedData[0];
    if (firstItem.centerCoordinate) {
      centerCoord = firstItem.centerCoordinate;
      zoomLevel = firstItem.zoomLevel || 8;
    }
  }

  // 应用视角调整
  if (centerCoord && Array.isArray(centerCoord) && centerCoord.length >= 2) {
    map.value.flyTo({
      center: centerCoord,
      zoom: zoomLevel
    });
  }

  // 根據模式分發邏輯
  if (mapStore.mode === 'base') {
    drawBaseMap();
  } else if (mapStore.mode === 'dot') {
    drawDotMap();
  } else if (mapStore.mode === 'feature') {
    drawFeatureMap();
  }
};

const clearMarkers = () => {
  currentMarkers.forEach(marker => marker.remove());
  currentMarkers = [];
};

// =======================================================
// 邏輯 1: 基礎圖繪製 (復刻 create_map1 的後半部分)
// =======================================================
const drawBaseMap = () => {
  // 用于跟踪已显示的坐标，避免重复
  const displayedCoordinates = new Set();

  // 辅助函数：将坐标转换为字符串键
  const coordToKey = (coord) => {
    if (!Array.isArray(coord) || coord.length < 2) return null;
    return `${coord[0].toFixed(6)},${coord[1].toFixed(6)}`;
  };

  // 辅助函数：创建地名标记
  const createLocationMarker = (locationName, coordinates) => {
    if (!coordinates || coordinates.length < 2) return null;
    if (!locationName || !locationName.trim()) return null;

    const [lng, lat] = coordinates;
    const key = coordToKey(coordinates);

    // 如果这个坐标已经显示过，跳过
    if (key && displayedCoordinates.has(key)) return null;

    // 字體大小邏輯 (完全復刻)
    const len = locationName.length;
    let fontSize = '10px';
    if (len <= 3) fontSize = '12.5px';
    else if (len === 4) fontSize = '11.5px';
    else if (len === 5) fontSize = '10.5px';

    // 創建 DOM
    const el = document.createElement('div');
    el.className = 'marker-text-base'; // 樣式見下方 style
    el.innerText = locationName;
    el.style.fontSize = fontSize;

    // 添加 Marker
    const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat([lng, lat])
        .addTo(map.value);

    // 标记该坐标已显示
    if (key) displayedCoordinates.add(key);

    return marker;
  };

  // 1. 显示基础地图数据的地名
  if (mapStore.mapData && mapStore.mapData.coordinates_locations) {
    mapStore.mapData.coordinates_locations.forEach(([locationName, coordinates]) => {
      const marker = createLocationMarker(locationName, coordinates);
      if (marker) currentMarkers.push(marker);
    });
  }

  // 2. 如果开启了自定义数据显示，额外显示自定义数据的地名
  if (mapStore.showCustomData && mapStore.mergedData && mapStore.mergedData.length > 0) {
    // 从 mergedData 中提取唯一的地点和坐标
    const customLocations = new Map(); // key: coordKey, value: locationName

    mapStore.mergedData.forEach(item => {
      if (item.iscustoms === 1 && item.coordinate && item.location) {
        const key = coordToKey(item.coordinate);
        if (key && !displayedCoordinates.has(key)) {
          // 同一个坐标可能有多个特征，只显示一次地名
          if (!customLocations.has(key)) {
            customLocations.set(key, {
              name: item.location,
              coord: item.coordinate
            });
          }
        }
      }
    });

    // 显示自定义地名
    customLocations.forEach(({ name, coord }) => {
      const marker = createLocationMarker(name, coord);
      if (marker) currentMarkers.push(marker);
    });
  }
};

// =======================================================
// 邏輯 2: 分區色點圖 (復刻 create_dot_all)
// =======================================================
const drawDotMap = () => {
  if (!mapStore.mapData || !mapStore.mapData.coordinates_locations) return;
  const data = mapStore.mapData;

  // 1. 確定層級 (maxLevel)
  // 優先使用父組件傳入的 dotLevel，如果沒有，默認 3 (復刻原代碼: if (maxLevel === 0) maxLevel = 3)
  let maxLevel = 3;
  if (props.dotLevel) {
    maxLevel = parseInt(props.dotLevel);
  }

  // 2. 收集分區並分配顏色
  const uniqueLevels = new Set();
  const pointsToDraw = [];

  data.coordinates_locations.forEach(([locName, coords]) => {
    const regionStr = data.region_mappings?.[locName];

    if (regionStr) {
      // --- ✨ 原封不動復刻取值邏輯 ---
      const parts = regionStr.split('-');
      const level1 = parts[0];
      const level2 = parts[1] || level1; // 如果沒有第2級，回退到第1級
      const level3 = parts[2] || level2; // 如果沒有第3級，回退到第2級

      let targetRegion = '';

      // 根據 maxLevel 決定使用哪個變量
      if (maxLevel === 1) {
        targetRegion = level1;
      } else if (maxLevel === 2) {
        targetRegion = level2;
      } else {
        targetRegion = level3; // 默認 Level 3
      }

      if (targetRegion) {
        uniqueLevels.add(targetRegion);
        pointsToDraw.push({ locName, coords, targetRegion, fullRegion: regionStr });
      }
    }
  });

  // 3. 建立顏色映射 (保持不變)
  const levelColorMap = {};
  Array.from(uniqueLevels).forEach((lvl, idx) => {
    levelColorMap[lvl] = colorPalette[idx % colorPalette.length];
  });

  // 4. 繪製 (保持不變)
  pointsToDraw.forEach(p => {
    const color = levelColorMap[p.targetRegion];

    const el = document.createElement('div');
    el.className = 'marker-dot';
    el.style.backgroundColor = color;

    const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat(p.coords)
        .addTo(map.value);

    const popup = new maplibregl.Popup({ offset: 10, closeButton: false })
        .setHTML(`<b>${p.locName}</b><br>${p.fullRegion}`);

    el.addEventListener('mouseenter', () => marker.setPopup(popup).togglePopup());
    el.addEventListener('mouseleave', () => popup.remove());

    currentMarkers.push(marker);
  });
};

// =======================================================
// 邏輯 3: 特徵圖 + 複雜彈窗 (DOM版，支持按鈕點擊)
// =======================================================
const drawFeatureMap = () => {
  if (!mapStore.mergedData || mapStore.mergedData.length === 0) return;
  if (!props.activeFeature) return;

  const items = mapStore.mergedData.filter(item => {
    // item.feature === mapStore.activeFeature
    // 必须匹配特征
    const isFeatureMatch = item.feature === props.activeFeature;

    // ✨ 开关逻辑：
    // 如果开关开了(true)，则显示所有。
    // 如果开关关了(false)，则只显示 iscustoms !== 1 的数据。
    const isCustomMatch = mapStore.showCustomData ? true : item.iscustoms !== 1;

    return isFeatureMatch && isCustomMatch;
  });
  // console.log(items)
  items.forEach(item => {
    // 1. 基礎校驗：無值跳過
    if (!item.value || !item.value.trim()) return;
    // console.log(item.coordinate)
    // ✨ 新增魯棒性檢查：確保坐標存在、是數組、且前兩位是有效數字
    // 如果不滿足這些條件，直接 return 跳過，防止 maplibregl 報錯
    if (!Array.isArray(item.coordinate) ||
        item.coordinate.length < 2 ||
        !Number.isFinite(item.coordinate[0]) ||
        !Number.isFinite(item.coordinate[1])) {
      return;
    }

    // 1. 創建地圖上的文字 Marker (保持不變)
    const el = document.createElement('div');
    el.className = 'marker-text-feature';
    el.innerText = item.value;
    el.style.backgroundColor = item.color || '#fff';

    const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat(item.coordinate)
        .addTo(map.value);

    // 2. ✨ 改動點：創建 DOM 節點而不是字符串
    const popupNode = createPopupDOM(item);

    // 3. 使用 setDOMContent
    const popup = new maplibregl.Popup({
      offset: 80,
      maxWidth: '300px',
      closeButton: false, // 建議隱藏默認關閉按鈕，用點擊地圖關閉，或者自己加
      className: 'custom-popup-wrapper'
    }).setDOMContent(popupNode);

    marker.setPopup(popup);
    currentMarkers.push(marker);
  });
};

// ✨ 核心函數：生成 DOM 並綁定事件
const createPopupDOM = (item) => {
  // 創建最外層容器
  const container = document.createElement('div');
  // 這裡直接用你的類名，方便你寫 CSS
  // 注意：MapLibre 會在外層再包一層，所以這裡不需要 active 類名來控制顯示，它出來就是顯示的
  container.className = 'popup active';

  // 1. 生成基礎 HTML (使用你提供的結構)
  let htmlContent = `
            <p>${item.location}</p>
            <p>${item.feature}</p>
    `;

  let showButtonType = null; // 記錄需要顯示哪種按鈕

  // --- 邏輯 A: 自定義數據 ---
  if (item.iscustoms === 1 && props.isCustom) {
    htmlContent += `
            <p style="margin-top:5px;">說明: ${item.notes || '無'}</p>
        `;
    showButtonType = 'custom'; // 標記需要自定義按鈕
  }
  // --- 邏輯 B: 百分比數據 ---
  else if (Array.isArray(item.detailContent) && item.detailContent.length > 0) {
    const hasPercentage = item.detailContent.some(d => d.hasOwnProperty('percentage'));

    if (hasPercentage) {
      // 降序
      const sorted = [...item.detailContent].sort((a, b) => b.percentage - a.percentage);
      htmlContent += `<ul>`;
      sorted.forEach(d => {
        const pct = (d.percentage * 100).toFixed(1) + '%';
        htmlContent += `<li>
                    <span class="dot">•</span>
                    <span class="val">${d.value}</span>
                    <span class="tilde">~</span>
                    <span class="pct">${pct}</span>
                </li>`;
      });
      htmlContent += `</ul>`;
      showButtonType = 'detail'; // 標記需要詳情按鈕
    } else {
      // 純文本
      htmlContent += `<p>${item.detailContent.join('<br>')}</p>`;
    }
  }

  // htmlContent += `</div>`; // 閉合 popup div
  container.innerHTML = htmlContent;

  // 2. ✨ 動態插入按鈕 (如果有需要)
  if (showButtonType) {
    const btn = document.createElement('button');
    // 給按鈕加個通用的 class 方便寫樣式
    btn.style.cursor = 'pointer';

    if (showButtonType === 'custom') {
      btn.className = 'mini-button-delete'; // 删除按钮使用暗红色样式
      btn.innerText = '🗑️ 刪除'; // (原 mini-btn0)
      btn.onclick = (e) => {
        e.stopPropagation(); // 防止點擊按鈕穿透到地圖
        handleCustomBtnClick(item);
      };
    } else if (showButtonType === 'detail') {
      btn.className = 'mini-button'; // 详情按钮使用蓝色样式
      btn.innerText = '📝 詳情'; // (原 mini-btn)
      btn.onclick = (e) => {
        e.stopPropagation();
        handleDetailBtnClick(item);
      };
    }

    container.appendChild(btn);
  }

  return container;
};

// --- 按鈕點擊處理函數 ---
const handleCustomBtnClick = async (item) => {
  // console.log("觸發自定義按鈕邏輯", item);
  const feature = item.feature;
  const value = item.value;
  const location = item.location;
  const created_at = item.created_at;
  // 顯示確認刪除的對話框
  const isConfirmed = await showConfirm(
      `📍 ${location}\n🔧 ${feature}  🔢 ${value}\n\n刪除後將無法恢復！`,
      {
        title: '確認刪除',
        confirmText: '刪除',
        cancelText: '取消'
      }
  );
  // 如果用戶點擊確定，執行刪除操作
  if (isConfirmed) {
    // 表單驗證
    if (!location || !feature || !value) {
      showError("刪除失敗，地點/特徵/值存在空值");
      return;  // 如果有空的字段，則不提交
    }
    // 構建表單數據對象
    const formData = {
      location: location,
      // region: null,
      // coordinates: null,
      feature: feature,
      value: value,
      created_at:created_at,
      // description: null // 如果說明為空，設置為 null
    };

    try {
      const data = await api('/api/delete_form', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (data.success) {
        showSuccess("刪除成功！\n" + data.message);

        // 自动打开自定义数据开关
        mapStore.showCustomData = true;

        // 重新加載合併數據
        try {
          await func_mergeData(resultCache.latestResults, mapStore.mapData)
          console.log('✅ 刪除後數據已刷新')
        } catch (error) {
          console.error('❌ 刷新數據失敗:', error)
        }
      } else {
        showError("刪除失敗：" + data.message);
      }
    } catch (error) {
      console.error("刪除失敗:", error);
      showError("刪除時發生錯誤！");
    }
  }
};

const handleDetailBtnClick = (item) => {
  // console.log("觸發詳情按鈕邏輯", item);
  get_detail(item.location, item.feature, false, true);
};


// --- 其他 UI 邏輯 ---
const toggleFullScreen = async () => {
  isFullScreen.value = !isFullScreen.value;
  await nextTick();
  if (map.value) map.value.resize();
};

const handleStyleChange = () => {
  if (!map.value) return;
  const newStyle = mapStyle(currentStyleKey.value);
  map.value.setStyle(newStyle);
};

const resetView = () => {
  if (!map.value) return;

  let points = [];

  // 1. 优先从 mapStore.mapData 提取坐标（基础地图数据）
  if (mapStore.mapData && mapStore.mapData.coordinates_locations) {
    points = mapStore.mapData.coordinates_locations.map(item => item[1]);
  }
  // 2. 如果没有基础数据，从 mergedData 提取坐标（自定义数据或特征数据）
  else if (mapStore.mergedData && mapStore.mergedData.length > 0) {
    points = mapStore.mergedData
      .map(item => item.coordinate)
      .filter(coord => Array.isArray(coord) && coord.length >= 2 &&
                      Number.isFinite(coord[0]) && Number.isFinite(coord[1]));
  }

  // 3. 如果有坐标数据，重新计算最佳视角
  if (points.length > 0) {
    const { center, zoom } = calculateDenseMapCenterAndZoom(points);
    map.value.flyTo({
      center,
      zoom,
      essential: true
    });
  } else {
    // 没有数据时，返回默认视角（广州）
    map.value.flyTo({
      center: [113.2644, 23.1291],
      zoom: 8,
      essential: true
    });
  }
};
</script>

<style scoped>
.map-page-container {
  width: 90vw;
  height: 70vh;
  position: relative;
  left: 50%;
  transform: translateX(-50%);
  border-radius: 30px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  z-index: 100;
}

.map-page-container.is-fullscreen {
  position: fixed;
  top: 0; left: 0;
  width: 100vw; height: 100dvh;
  border-radius: 0;
  z-index: 99999;
  transform: none;
}

.map-container { width: 100%; height: 100%; }


/* ========================================= */
/* 復刻原代碼中的 Marker CSS (使用 :deep) */
/* ========================================= */

/* 1. 基礎地名 (create_map1) */
:deep(.marker-text-base) {
  background-color: #1b2e2b;
  color: #a6ffdc;
  padding: 2px 4px;
  border-radius: 4px;
  box-shadow: 0 2px 6px rgba(114, 124, 245, 0.5);
  white-space: nowrap;
  font-family: "SimHei", "黑体", sans-serif;
  cursor: pointer;
  text-align: center;
  width: auto;
}

/* 2. 分區色點 (create_dot_all) */
:deep(.marker-dot) {
  width: 10px; height: 10px;
  border-radius: 50%;
  border: 2px solid #000; /* 復刻 strokeColor: #000000 */
  opacity: 0.8;
  cursor: pointer;
  box-shadow: 0 0 2px rgba(0,0,0,0.5);
}

/* 3. 特徵值 (triggerDrawingFunction) */
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
  /* 背景色在JS中動態設置 */
}

/* 4. 複雜彈窗樣式 */
:deep(.maplibregl-popup-content) {
  padding: 0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
}
:deep(.popup-container) {
  min-width: 200px;
  font-family: sans-serif;
}
:deep(.popup-header) {
  background: #f5f5f7;
  padding: 10px 15px;
  border-bottom: 1px solid #e1e1e1;
}
:deep(.popup-header strong) {
  display: block;
  font-size: 16px;
  color: #1d1d1f;
}
:deep(.popup-header .sub) {
  font-size: 12px;
  color: #86868b;
}
:deep(.popup-body), :deep(.popup-list) {
  padding: 10px 15px;
  max-height: 200px;
  overflow-y: auto;
}
:deep(.popup-list ul) {
  list-style: none;
  padding: 0; margin: 0;
}
:deep(.popup-list li) {
  font-size: 13px;
  color: #424245;
  margin-bottom: 4px;
}
:deep(.note-box) {
  background: #fff9c4;
  padding: 8px;
  border-radius: 4px;
  font-size: 12px;
  margin-top: 5px;
}
:deep(.pct) {
  font-weight: bold;
  color: #007aff;
  margin-left: 4px;
}
</style>

<style scoped>
.map-page-container {
  width: 70dvw;
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
    width: 90dvw;
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

  /* ✨ 關鍵佈局設置 */
  display: flex;
  flex-direction: column; /* 讓子元素垂直排列 (各佔一行) */
  gap: 5px;              /* 控制三行之間的間距 */

  z-index: 10;
  width: 160px; /* 給個固定寬度，保證佈局穩定 */
}
.control-group {
  width: 100%; /* 填滿父容器寬度 */
  position: relative; /* 保持相對定位，不要用 absolute */
  display: flex; /* 確保它是塊級元素 */
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

/* ✨ 新增：按鈕並排容器 */
.button-row {
  display: flex;
  gap: 10px;        /* 按鈕之間的間距 */
  width: 100%;
}

/* 讓按鈕平均分佈，或者根據需要調整寬度 */
.button-row .action-btn {
  flex: 1;          /* 兩個按鈕平分寬度 */
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

/* ✨ 全屏按鈕樣式 (綠色區分) */
.fullscreen-btn {
  background: #34c759; /* Apple Green */
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
/* 整个容器样式 */
.custom-switch-container1 {
  /* 關鍵：讓容器佔滿整行寬度，這樣它就獨占一行 */
  width: 100%;

  /* 關鍵：使用 Flex 讓內部的開關按鈕居中 */
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center;     /* 垂直居中 */

  /* 確保它是相對定位，參與正常排版 */
  position: relative; /* 改回相對定位 */
}
</style>

<style>
@import '@/components/result/ResultTable.css';
</style>
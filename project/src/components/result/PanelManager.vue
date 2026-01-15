<template>
  <div class="panel-manager-container">

    <div
        v-for="panel in panels"
        :key="panel.id"
        :ref="(el) => setPanelRef(el, panel.id)"
        class="query-detail-panel"
    >
      <button class="close-btn" @click="removePanel(panel.id)">×</button>

      <div class="result-panel-vue" style="height: 100%; overflow-y: auto; display: flex; flex-direction: column;">

        <div v-if="panel.loading" class="loading-container">
          <div class="spinner"></div>
          <span class="loading-text">查詢中...</span>
        </div>

        <template v-else>
          <DataRow
              v-for="(item, index) in panel.data"
              :key="index"
              :item="item"
              :is-condensed="false"
              :show-location="shouldShowLocation(item, index, panel.data)"
              @trigger-popup="onTriggerPopup"
          />
        </template>

      </div>
    </div>

    <ValuePopup
        :visible="showPopupValue"
        :data="popupDataValue"
        :position="popupPos"
        @close="showPopupValue = false"
        @confirm="handleValueConfirm"
    />

    <FeaturePopup
        :visible="showPopupFeature"
        :data="popupDataFeature"
        :position="popupPos"
        @close="showPopupFeature = false"
        @confirm="handleFeatureConfirm"
    />

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import DataRow from "./DataRow.vue";
// [修復] 導入漏掉的組件和工具函數
import ValuePopup from './ValuePopup.vue';
import FeaturePopup from './FeaturePopup.vue';
import { parseFeatureString, get_detail } from '@/utils/ResultTable.js';

// === 1. Vue 状态管理 ===
const panels = ref([]);
const panelRefs = new Map();

// [修復] 定義漏掉的 Popup 狀態變量
const showPopupValue = ref(false);
const popupDataValue = ref({});
const showPopupFeature = ref(false);
const popupDataFeature = ref({});
const popupPos = ref({ top: 0, left: 0 });

// 动态 Ref 绑定 helper
const setPanelRef = (el, id) => {
  if (el) panelRefs.set(id, el);
  else panelRefs.delete(id);
};

// === 2. 布局常量 ===
const ROW_GAP_PX = 120;
const ROW_BOTTOM_START = 10;
const PANEL_HEIGHT = '50vh';
const EXTRA_EMPTY_ROWS = 3;

const panelSlots = [];
let currentCols = getCurrentCols();
let gridOverlays = [];

// === 3. 核心布局算法 (保持不變) ===
function getLayoutSpec() {
  const w = window.innerWidth;
  if (w >= 1200) return { cols: 4, widthPct: 24, gapPct: 1 };
  if (w >= 768)  return { cols: 2, widthPct: 49, gapPct: 1 };
  return            { cols: 1, widthPct: 99, gapPct: 0 };
}
function getCurrentCols() { return getLayoutSpec().cols; }

function slotToRB(idx) {
  const { cols, widthPct, gapPct } = getLayoutSpec();
  const col = idx % cols;
  const row = Math.floor(idx / cols);
  const leftPct = col * (widthPct + gapPct);
  const isVertical = cols === 1;
  const pos = {
    left: `${leftPct}%`,
    width: `${widthPct}%`,
    height: isVertical ? '33vh' : PANEL_HEIGHT,
  };
  if (isVertical) pos.top = `${ROW_BOTTOM_START + row * ROW_GAP_PX}px`;
  else pos.bottom = `${ROW_BOTTOM_START + row * ROW_GAP_PX}px`;
  return pos;
}

function slotRectPx(idx) {
  const rb = slotToRB(idx);
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const widthPx = (parseFloat(rb.width) / 100) * vw;
  const heightPx = rb.height.endsWith('vh') ? (parseFloat(rb.height) / 100) * vh : parseFloat(rb.height);
  const left = (parseFloat(rb.left) / 100) * vw;
  let top;
  if (rb.top !== undefined) top = parseFloat(rb.top);
  else {
    const bottomPx = parseFloat(rb.bottom);
    top = vh - bottomPx - heightPx;
  }
  return { left, top, width: widthPx, height: heightPx };
}

function applySlotPosition(container, idx) {
  const rb = slotToRB(idx);
  Object.assign(container.style, {
    position: 'fixed', display: 'flex', transform: 'none',
    right: 'auto', left: rb.left, width: rb.width, height: rb.height, zIndex: '',
  });
  if (rb.top !== undefined) { container.style.top = rb.top; container.style.bottom = 'auto'; }
  else { container.style.bottom = rb.bottom; container.style.top = 'auto'; }
  container.dataset.slotIndex = String(idx);
}

function allocateSlot() {
  for (let i = 0; i < panelSlots.length; i++) if (!panelSlots[i]) return i;
  panelSlots.push(null);
  return panelSlots.length - 1;
}
function releaseSlot(index) {
  if (index >= 0 && index < panelSlots.length) panelSlots[index] = null;
}

function showGridOverlays(origSlotIndex) {
  hideGridOverlays();
  const { cols } = getLayoutSpec();
  const maxIndex = Math.max(panelSlots.length + EXTRA_EMPTY_ROWS * cols - 1, cols - 1);
  const frag = document.createDocumentFragment();
  gridOverlays = [];
  for (let i = 0; i <= maxIndex; i++) {
    if (panelSlots[i] && i !== origSlotIndex) continue;
    const o = document.createElement('div');
    o.className = 'grid-slot';
    const rb = slotToRB(i);
    Object.assign(o.style, {
      position: 'fixed', pointerEvents: 'none', left: rb.left, bottom: rb.bottom,
      width: rb.width, height: rb.height, border: '2px dashed rgba(0,123,255,0.35)',
      borderRadius: '12px', boxSizing: 'border-box', zIndex: 9998, background: 'transparent',
    });
    if(rb.top !== undefined) { o.style.top = rb.top; o.style.bottom = 'auto'; }
    o.dataset.slotIndex = String(i);
    frag.appendChild(o);
    gridOverlays.push(o);
  }
  document.body.appendChild(frag);
}
function hideGridOverlays() { gridOverlays.forEach(el => el.remove()); gridOverlays = []; }
function highlightGridSlot(idx) {
  gridOverlays.forEach(el => {
    const active = Number(el.dataset.slotIndex) === idx;
    el.style.borderColor = active ? 'rgba(0,123,255,0.9)' : 'rgba(0,123,255,0.35)';
    el.style.boxShadow   = active ? '0 0 18px rgba(0,123,255,0.35)' : 'none';
  });
}
function findNearestFreeSlot(cx, cy, origSlotIndex) {
  const { cols } = getLayoutSpec();
  const maxIndex = Math.max(panelSlots.length + EXTRA_EMPTY_ROWS * cols - 1, cols - 1);
  let bestIdx = null; let bestDist = Infinity;
  for (let i = 0; i <= maxIndex; i++) {
    const isFree = !panelSlots[i] || i === origSlotIndex;
    if (!isFree) continue;
    const r = slotRectPx(i);
    const sx = r.left + r.width / 2;
    const sy = r.top  + r.height / 2;
    const dist = Math.pow(sx - cx, 2) + Math.pow(sy - cy, 2);
    if (dist < bestDist) { bestDist = dist; bestIdx = i; }
  }
  return bestIdx;
}
function enableDragSnap(container) {
  let dragging = false; let startX = 0, startY = 0; let offsetX = 0, offsetY = 0;
  let origSlot = Number(container.dataset.slotIndex); let currentCandidate = origSlot;
  const preventDefault = e => e.preventDefault();
  const onPointerDown = (e) => {
    if (e.target.closest('.close-btn') || e.target.closest('.panel-scroll-content')) return; // 防止拖動內容時觸發拖曳窗口
    const rect = container.getBoundingClientRect();
    offsetX = e.clientX - rect.left; offsetY = e.clientY - rect.top;
    const timeout = setTimeout(() => {
      dragging = true; container.classList.add('dragging');
      Object.assign(container.style, { right: 'auto', bottom: 'auto', left: `${rect.left}px`, top: `${rect.top}px`, zIndex: 10001 });
      releaseSlot(origSlot); showGridOverlays(origSlot);
      document.body.style.userSelect = 'none';
      document.addEventListener('mousemove', onPointerMove); document.addEventListener('mouseup', onPointerUp);
    }, 300);
    document.addEventListener('mouseup', function cancelEarly() { clearTimeout(timeout); document.removeEventListener('mouseup', cancelEarly); });
  };
  const onPointerMove = (e) => {
    if (!dragging) return;
    Object.assign(container.style, { left: `${e.clientX - offsetX}px`, top: `${e.clientY - offsetY}px` });
    const rect = container.getBoundingClientRect();
    const target = findNearestFreeSlot(rect.left + rect.width/2, rect.top + rect.height/2, origSlot);
    if (target !== null) { currentCandidate = target; highlightGridSlot(target); }
  };
  const onPointerUp = () => {
    if (!dragging) return;
    dragging = false; container.classList.remove('dragging'); hideGridOverlays();
    document.removeEventListener('mousemove', onPointerMove); document.removeEventListener('mouseup', onPointerUp);
    document.body.style.userSelect = '';
    const snapTo = currentCandidate ?? origSlot;
    if (snapTo >= panelSlots.length) for (let i = 0; i < snapTo - panelSlots.length + 1; i++) panelSlots.push(null);
    applySlotPosition(container, snapTo);
    panelSlots[snapTo] = container; container.dataset.slotIndex = String(snapTo); origSlot = snapTo; container.style.zIndex = '';
  };
  container.addEventListener('mousedown', onPointerDown);
}

// === 4. Vue Logic ===
const addPanel = (data = [], isLoading = false) => {
  const id = Date.now() + Math.random();
  panels.value.push({ id, data: Array.isArray(data) ? data : [data], loading: isLoading });
  nextTick(() => {
    const el = panelRefs.get(id);
    if (el) {
      const slotIndex = allocateSlot(); applySlotPosition(el, slotIndex);
      panelSlots[slotIndex] = el; enableDragSnap(el);
    }
  });
  return id;
};

const updatePanel = (id, newData) => {
  const target = panels.value.find(p => p.id === id);
  if (target) { target.data = newData; target.loading = false; }
};

const removePanel = (id) => {
  const el = panelRefs.get(id);
  if (el) releaseSlot(Number(el.dataset.slotIndex));
  panels.value = panels.value.filter(p => p.id !== id);
  panelRefs.delete(id);
};

// === Helper Functions ===

// [修復] 這裡必須接收 dataArray 參數，因為它是一個純函數，無法訪問 v-for 內部的作用域
const shouldShowLocation = (item, index, dataArray) => {
  if (index === 0) return true;
  return item.地點 !== dataArray[index - 1].地點;
};

const onTriggerPopup = (type, item, feature, value, e) => {
  showPopupValue.value = false;
  showPopupFeature.value = false;
  const dataObj = { location: item.地點, feature, value: String(value).replace(/·/g, '') };
  const mouseX = e.clientX; const mouseY = e.clientY; const popupWidth = 250; const offset = 10;
  popupPos.value = {
    top: Math.max(mouseY - 100 - 5, 20),
    left: Math.min(Math.max(mouseX + popupWidth / 2 - offset, 20), window.innerWidth - 0.5 * popupWidth)
  };
  if (type === 'value') { popupDataValue.value = dataObj; showPopupValue.value = true; }
  else { popupDataFeature.value = dataObj; showPopupFeature.value = true; }
};


const handleValueConfirm = ({ location, value }) => {
  if (typeof get_detail === 'function') get_detail(location, value, false, true);
  showPopupValue.value = false;
};

const handleFeatureConfirm = ({ location, feature, field }) => {
  if (typeof get_detail === 'function') {
    const parseResult = parseFeatureString(feature);
    if (parseResult.matched_fields === null) get_detail(location, feature, false, true, null, [field]);
    else {
      const newFeature = `${feature.replace(/·/g, '')}-${field}`;
      get_detail(location, newFeature, false, true);
    }
  }
  showPopupFeature.value = false;
};

// === Lifecycle ===
let resizeTimer;
const onResizeDebounced = () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => { /* handleResize logic */ }, 150); };

onMounted(() => {
  window.addPanel = addPanel;
  window.updatePanel = updatePanel;
  window.removePanel = removePanel;
  window.addEventListener('resize', onResizeDebounced);
});
onUnmounted(() => {
  window.removeEventListener('resize', onResizeDebounced);
  hideGridOverlays();
});
</script>

<style scoped>
.panel-manager-container {
  pointer-events: none;
  position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 9000;
}
/* 必要的 Loading 樣式 */
.loading-container {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  height: 100%; min-height: 150px; color: #666;
}
.spinner {
  width: 32px; height: 32px; border: 3px solid #f3f3f3; border-top: 3px solid #007bff;
  border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 10px;
}
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
.loading-text { font-size: 14px; color: #888; }

</style>

<style>
@import 'ResultTable.css';
</style>
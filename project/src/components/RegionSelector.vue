<template>
  <div class="region-select">
    <!-- ✅ 選框本體（點擊打開三級分區） -->
    <div
        ref="anchorEl"
        class="region-select-box"
        :class="{ open: popupOpen }"
        role="button"
        tabindex="0"
        @click="togglePopup"
        @keydown.enter.prevent="togglePopup"
        @keydown.space.prevent="togglePopup"
    >
      <div v-if="selectedSafe.length" class="region-tags">
        <span
            v-for="(s, i) in selectedSafe"
            :key="s + '_' + i"
            class="region-tag"
        >
          {{ s }}
          <button class="tag-remove" type="button" @click.stop="remove(s)">×</button>
        </span>
      </div>

      <div v-else class="region-placeholder">
        {{ placeholder }}
      </div>

      <div class="region-caret">⌵</div>
    </div>

    <!-- ✅ 彈出三級分區（全局） -->
    <Teleport to="body">
      <div
          v-if="popupOpen"
          class="partition-overlay"
          @mousedown.self="closePopup"
      >
        <div
            ref="popupEl"
            class="partition-container"
            :style="popupStyle"
        >
          <!-- lvl1 -->
          <div class="partition-popup partition-lvl1">
            <div
                v-for="item in lvl1"
                :key="'l1_' + item.label"
                class="partition-line"
                :class="{ active: activeL1 === item.label }"
                @mouseenter="onHoverL1(item)"
            >
              <div class="partition-item" @click="onPickOrExpand(item, 1)">
                {{ item.label }}
              </div>
              <div
                  v-if="item.hasChildren"
                  class="partition-arrow"
                  @click.stop="expand(item, 1)"
              >
                ⌵
              </div>
            </div>
          </div>

          <!-- lvl2 -->
          <div v-if="lvl2.length" class="partition-popup partition-lvl2">
            <div
                v-for="item in lvl2"
                :key="'l2_' + item.label"
                class="partition-line"
                :class="{ active: activeL2 === item.label }"
                @mouseenter="onHoverL2(item)"
            >
              <div class="partition-item" @click="onPickOrExpand(item, 2)">
                {{ item.label }}
              </div>
              <div
                  v-if="item.hasChildren"
                  class="partition-arrow"
                  @click.stop="expand(item, 2)"
              >
                ⌵
              </div>
            </div>
          </div>

          <!-- lvl3 -->
          <div v-if="lvl3.length" class="partition-popup partition-lvl3">
            <div
                v-for="item in lvl3"
                :key="'l3_' + item.label"
                class="partition-line"
            >
              <div class="partition-item" @click="pick(item.label)">
                {{ item.label }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'

const props = defineProps({
  /** 外部傳入：'map' | 'yindian' */
  mode: { type: String, required: true },

  /** v-model:selected：多選結果 */
  selected: { type: Array, default: () => [] },

  /** 資料源 */
  staticTree: { type: Object, required: true },
  topYindian: { type: Array, default: () => [] },
  partitionsUrl: { type: String, required: true },

  /** placeholder */
  placeholder: { type: String, default: '請選擇分區' }
})

const emit = defineEmits(['update:selected'])

/* =========================
   State
   ========================= */
const popupOpen = ref(false)
const anchorEl = ref(null)
const popupEl = ref(null)
const popupStyle = ref({})

const lvl1 = ref([])
const lvl2 = ref([])
const lvl3 = ref([])
const activeL1 = ref('')
const activeL2 = ref('')
let hoverTimer = null
let yindianTreeCache = null

const selectedSafe = computed(() => (Array.isArray(props.selected) ? props.selected : []))

/* =========================
   Tree helpers
   ========================= */
function hasChildren(node) {
  if (!node) return false
  if (Array.isArray(node)) return node.length > 0
  if (typeof node === 'object') return Object.keys(node).length > 0
  return false
}

function getMapChildren(parentLabel) {
  const tree = props.staticTree
  // ✅ 兜底：tree 未傳入/尚未初始化時，直接返回空
  if (!tree || typeof tree !== 'object') return []
  function search(node) {
    if (!node || typeof node !== 'object') return null
    for (const key in node) {
      if (key === parentLabel) return node[key]
      const found = search(node[key])
      if (found) return found
    }
    return null
  }

  if (parentLabel === null) {
    return Object.keys(tree).map(k => ({
      label: k,
      hasChildren: hasChildren(tree[k])
    }))
  }

  const childrenNode = search(tree)
  if (!childrenNode) return []

  if (Array.isArray(childrenNode)) {
    return childrenNode.map(k => ({ label: k, hasChildren: false }))
  }
  if (typeof childrenNode === 'object') {
    return Object.keys(childrenNode).map(k => ({
      label: k,
      hasChildren: hasChildren(childrenNode[k])
    }))
  }
  return []
}

async function loadYindianTree() {
  const CACHE_KEY = '__YINDIAN_TREE_CACHE__'
  if (yindianTreeCache) return yindianTreeCache

  const cached = sessionStorage.getItem(CACHE_KEY)
  if (cached) {
    yindianTreeCache = JSON.parse(cached)
    return yindianTreeCache
  }

  const res = await fetch(props.partitionsUrl)
  const tree = await res.json()
  sessionStorage.setItem(CACHE_KEY, JSON.stringify(tree))
  yindianTreeCache = tree
  return tree
}

async function getYindianChildren(parentLabel) {
  const tree = await loadYindianTree()

  function search(node) {
    if (!node || typeof node !== 'object') return null
    for (const key in node) {
      if (key === parentLabel) return node[key]
      const found = search(node[key])
      if (found) return found
    }
    return null
  }

  if (parentLabel === null) {
    return props.topYindian.map(k => ({
      label: k,
      hasChildren: hasChildren(tree[k])
    }))
  }

  const childrenNode = search(tree)
  if (!childrenNode) return []

  if (Array.isArray(childrenNode)) {
    return childrenNode.map(k => ({ label: k, hasChildren: false }))
  }
  if (typeof childrenNode === 'object') {
    return Object.keys(childrenNode).map(k => ({
      label: k,
      hasChildren: hasChildren(childrenNode[k])
    }))
  }
  return []
}

async function getChildren(parentLabel) {
  return props.mode === 'map'
      ? getMapChildren(parentLabel)
      : await getYindianChildren(parentLabel)
}

async function initLvl1() {
  lvl2.value = []
  lvl3.value = []
  activeL1.value = ''
  activeL2.value = ''
  lvl1.value = await getChildren(null)
}

/* =========================
   Popup positioning (near select box)
   ========================= */
function computePopupStyle() {
  const anchor = anchorEl.value
  const rect = anchor?.getBoundingClientRect()
  const top = (rect?.bottom ?? 0) + 8 + window.scrollY
  const left = (rect?.left ?? 0) + window.scrollX

  popupStyle.value = {
    position: 'absolute',
    top: `${top}px`,
    left: `${left}px`
  }
}

/* =========================
   Open/Close
   ========================= */
async function openPopup() {
  // ✅ map 模式下必须保证 staticTree 可用
  if (props.mode === 'map' && (!props.staticTree || typeof props.staticTree !== 'object')) {
    console.warn('[RegionSelector] staticTree is missing or not ready.')
    return
  }

  popupOpen.value = true
  await nextTick()
  computePopupStyle()
  await initLvl1()
  bindEsc()
}


function closePopup() {
  popupOpen.value = false
  lvl1.value = []
  lvl2.value = []
  lvl3.value = []
  activeL1.value = ''
  activeL2.value = ''
  unbindEsc()
}

function togglePopup() {
  popupOpen.value ? closePopup() : openPopup()
}

/* =========================
   Hover expand
   ========================= */
function expand(item, level) {
  if (!item?.hasChildren) return
  if (level === 1) onHoverL1(item, true)
  if (level === 2) onHoverL2(item, true)
}

async function onHoverL1(item, immediate = false) {
  clearTimeout(hoverTimer)
  const run = async () => {
    activeL1.value = item.label
    lvl2.value = await getChildren(item.label)
    lvl3.value = []
    activeL2.value = ''
  }
  if (immediate) return run()
  hoverTimer = setTimeout(run, 100)
}

async function onHoverL2(item, immediate = false) {
  clearTimeout(hoverTimer)
  const run = async () => {
    activeL2.value = item.label
    lvl3.value = await getChildren(item.label)
  }
  if (immediate) return run()
  hoverTimer = setTimeout(run, 100)
}

/* =========================
   Pick logic (multi-select)
   ========================= */
function pick(label) {
  const arr = selectedSafe.value.slice()
  if (!arr.includes(label)) arr.push(label)
  emit('update:selected', arr)
  closePopup()
}

function onPickOrExpand(item, level) {
  if (item?.hasChildren) {
    expand(item, level)
    return
  }
  pick(item.label)
}

function remove(label) {
  emit('update:selected', selectedSafe.value.filter(x => x !== label))
}

/* =========================
   ESC close
   ========================= */
function onKeydown(e) {
  if (e.key === 'Escape') closePopup()
}

function bindEsc() {
  document.addEventListener('keydown', onKeydown)
}
function unbindEsc() {
  document.removeEventListener('keydown', onKeydown)
}

onBeforeUnmount(() => {
  clearTimeout(hoverTimer)
  unbindEsc()
})

/* =========================
   Mode changed externally: clear UI, and close
   ========================= */
watch(
    () => props.mode,
    async () => {
      // 切換 map/yindian 時，彈窗收起，三級內容清空（最穩）
      closePopup()
    }
)
</script>

<style scoped>
/* ===== 選框（液態玻璃） ===== */
.region-select-box {
  width: 100%;
  min-height: 38px;
  border-radius: 14px;
  padding: 8px 34px 8px 10px;
  box-sizing: border-box;

  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  position: relative;

  background: rgba(255, 255, 255, 0.40);
  border: 1px solid rgba(200, 200, 200, 0.45);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.10);

  backdrop-filter: blur(16px) saturate(160%);
  -webkit-backdrop-filter: blur(16px) saturate(160%);
}

.region-select-box.open {
  border-color: rgba(0, 122, 255, 0.35);
  box-shadow: 0 12px 36px rgba(0, 122, 255, 0.16);
}

.region-placeholder {
  font-size: 13px;
  color: rgba(60, 60, 60, 0.72);
}

.region-caret {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(0, 0, 0, 0.55);
  font-weight: 700;
}

/* tags inside select */
.region-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.region-tag {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 13px;
  color: rgba(25, 25, 25, 0.86);
  background: rgba(255, 255, 255, 0.48);
  border: 1px solid rgba(160, 160, 160, 0.22);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
}

.tag-remove {
  border: none;
  background: rgba(0, 0, 0, 0.06);
  width: 22px;
  height: 22px;
  border-radius: 8px;
  cursor: pointer;
}

/* ===== Overlay + popup ===== */
.partition-overlay {
  position: fixed;
  inset: 0;
  z-index: 20000;
  background: rgba(0, 0, 0, 0.10);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}


.partition-container {
  position: fixed;
  z-index: 9999;
  background: rgba(255, 255, 255, 0.25);               /* ✅ 半透明玻璃 */
  border: 1px solid rgba(255, 255, 255, 0.3);           /* ✅ 微白边框 */
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);            /* ✅ 柔光阴影 */
  /*backdrop-filter: blur(12px);                         !* ✅ 玻璃模糊 *!*/
  /*-webkit-backdrop-filter: blur(12px);                 !* ✅ Safari 支持 *!*/

  display: flex;
  gap: 0px;
  padding: 0px;
  pointer-events: auto;
  border-radius: 50px;
}

.partition-line {
  display: flex;
  flex-direction: row;              /* 水平排列 */
  align-items: center;              /* 垂直置中（防止位移） */
  justify-content: space-between;
  gap: 0;                         /* 控制箭頭與文字間距 */
  padding: 4px 1px 4px 8px!important;
}

.partition-item {
  flex: 1 1 auto;
  white-space: nowrap;             /* ✅ 防止換行 */
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
  cursor: pointer;
  padding: 0 1px!important;
  flex-grow: 1;
}

.partition-arrow {
  font-size: 13px;
  color: darkblue;
  user-select: none;
  cursor: pointer;
  flex-shrink: 0;
  margin: 0;
  padding: 0 8px 0 8px !important;
  font-weight: bold;
  opacity: 0.8;

  /* ✅ 修复关键 */
  display: flex;
  align-items: center;      /* 垂直居中 */
  justify-content: center;  /* 水平居中 */
  height: 100%;
  width: auto;              /* ❗ 只占内容宽度，避免遮盖地点文字 */
}


.partition-arrow:hover {
  opacity: 1;
}



.partition-list {
  list-style: none;
  margin: 0;
  padding: 4px 0;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 30px;
  min-width: 120px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

.partition-list li {
  padding: 6px 12px;
  cursor: pointer;
}
.partition-list li:hover {
  background: #f0f0f0;
}

/* 音典分區下拉整體容器（第一層） */
.partition-popup {
  background: rgba(255, 255, 255, 0.35);  /* 💡 半透明玻璃 */
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  padding: 6px;
  display: flex;
  flex-direction: column;
}


/* 各層級容器最小寬度 */
.partition-popup.partition-lvl1,
.partition-popup.partition-lvl2,
.partition-popup.partition-lvl3 {

  /*min-width: 140px;*/
  border-radius: 10px;
  /*justify-content: center;  !* 水平居中 *!*/
  user-select: none;               /* 禁止文本选择 */
  -webkit-user-select: none;       /* iOS/Safari */
  -webkit-touch-callout: none;     /* 禁止 iOS 的长按菜单 */
}

/* 列表項目 */
.partition-popup div {
  padding: 6px 12px;
  cursor: pointer;
  border-radius: 30px;
  transition: background 0.2s;

}
.partition-popup div:hover {
  background: rgba(255, 255, 255, 0.3);
  box-shadow: 0 0 4px rgba(255,255,255,0.6) inset;
}

.partition-popup div.active {
  background: rgba(180, 223, 244, 0.72);  /* 浅蓝色高亮 */
  box-shadow: 0 0 6px rgba(0, 122, 255, 0.3);  /* 微光效果 */
}

/*.partition-popup.partition-lvl1 div {*/
/*    justify-content: center;  !* 水平居中 *!*/
/*}*/
/* 第三級內容捲動區樣式 */
.partition-popup.partition-lvl3 {
  max-height: 240px;
  overflow-y: auto;
}

/* 美化 scrollbar（Chrome/Firefox） */
.partition-popup.partition-lvl3::-webkit-scrollbar {
  width: 6px;
}
.partition-popup.partition-lvl3::-webkit-scrollbar-thumb {
  background: #bbb;
  border-radius: 3px;
}
.partition-popup.partition-lvl3::-webkit-scrollbar-track {
  background: #f5f5f7;
}
.partition-popup.partition-lvl3 {
  scrollbar-width: thin;
  scrollbar-color: #bbb #f5f5f7;
}
</style>

<template>
  <div class="region-select">
    <!-- ✅ 選框（點擊打開三級分區） -->
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
      <!-- ✅ 已選葉子列表（選框內可刪除） -->
      <div v-if="selectedLeafs.length" class="region-tags">
        <span
            v-for="(s, i) in selectedLeafs"
            :key="s + '_' + i"
            class="region-tag"
            :title="s"
        >
          {{ s }}
          <button class="tag-remove" type="button" @click.stop="removeCommitted(s)">×</button>
        </span>
      </div>

      <div v-else class="region-placeholder">
        {{ placeholder }}
      </div>

      <div class="region-caret">⌵</div>
    </div>

    <!-- ✅ 彈出三級分區（全局玻璃） -->
    <Teleport to="body">
      <div v-if="popupOpen" class="partition-overlay" @mousedown.self="confirmAndClose">
        <!-- ✅ 頂部確認欄：顯示已選 + 可刪除 + 確認 -->
        <div class="partition-topbar" @mousedown.stop>
          <!-- 第一行：标题 + 按钮 -->
          <div class="topbar-row topbar-row-1">
            <div class="topbar-title">
              已選分區
              <span class="topbar-count">({{ draftSelected.length }})</span>
            </div>

            <div class="topbar-right">
              <button
                  class="topbar-btn ghost"
                  type="button"
                  @click="clearDraft"
                  :disabled="draftSelected.length === 0"
              >
                清空
              </button>
              <button class="topbar-btn" type="button" @click="confirmAndClose">
                確認
              </button>
            </div>
          </div>

          <!-- 第二行：tags -->
          <div class="topbar-row topbar-row-2">
            <div class="topbar-tags" v-if="draftSelected.length">
      <span
          v-for="(s, i) in draftSelected"
          :key="'top_' + s + '_' + i"
          class="topbar-tag"
          :title="s"
      >
        {{ s }}
        <button class="tag-remove" type="button" @click="removeDraft(s)">×</button>
      </span>
            </div>
            <div class="topbar-empty" v-else>
              尚未選擇分區
            </div>
          </div>
        </div>


        <!-- ✅ 從左上角開始排布，不越界（overlay 內可滾動） -->
        <div class="partition-stage" >
            <!-- lvl1 -->
            <div class="partition-popup partition-lvl1" @mousedown.stop>
              <div
                  v-for="item in lvl1"
                  :key="'l1_' + item.label"
                  class="partition-line"
                  :class="{ active: activeL1 === item.label }"
                  @mouseenter="onHoverL1(item)"
              >
                <!-- ✅ 點擊=選擇（lvl1 也允許） -->
                <div
                    class="partition-item"
                    :class="{ chosen: draftSelected.includes(item.label) }"
                    @click="toggleLeaf(item.label)"
                    :title="item.label"
                >
                  {{ item.label }}
                </div>

                <!-- ✅ 箭頭只負責展開，不再影響選擇 -->
                <div
                    v-if="item.hasChildren"
                    class="partition-arrow"
                    @click.stop="expand(item, 1)"
                    title="展開"
                >
                  ⌵
                </div>
              </div>
            </div>

            <!-- lvl2 -->
            <div v-if="lvl2.length" class="partition-popup partition-lvl2" @mousedown.stop>
              <div
                  v-for="item in lvl2"
                  :key="'l2_' + item.label"
                  class="partition-line"
                  :class="{ active: activeL2 === item.label }"
                  @mouseenter="onHoverL2(item)"
              >
                <!-- ✅ 點擊=選擇（lvl2 也允許） -->
                <div
                    class="partition-item"
                    :class="{ chosen: draftSelected.includes(item.label) }"
                    @click="toggleLeaf(item.label)"
                    :title="item.label"
                >
                  {{ item.label }}
                </div>

                <div
                    v-if="item.hasChildren"
                    class="partition-arrow"
                    @click.stop="expand(item, 2)"
                    title="展開"
                >
                  ⌵
                </div>
              </div>
            </div>

            <!-- lvl3 -->
            <div v-if="lvl3.length" class="partition-popup partition-lvl3" @mousedown.stop>
              <div
                  v-for="item in lvl3"
                  :key="'l3_' + item.label"
                  class="partition-line"
              >
                <!-- lvl3 點擊=選擇 -->
                <div
                    class="partition-item"
                    :class="{ chosen: draftSelected.includes(item.label) }"
                    @click="toggleLeaf(item.label)"
                    :title="item.label"
                >
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

import { computed, onBeforeUnmount, ref, watch } from 'vue'
// 全局已有（你原来 Cascader 就这么用的）
const STATIC_TREE = STATIC_REGION_TREE ?? {}
const TOP_YINDIAN = top_yindian ?? []
const API_BASE = window.API_BASE ?? ''



const props = defineProps({
  mode: { type: String, required: true },
  selected: { type: Array, default: () => [] },
  placeholder: { type: String, default: '請選擇分區' }
})

const emit = defineEmits(['update:selected'])

/* =========================
   UI state
   ========================= */
const popupOpen = ref(false)
const lvl1 = ref([])
const lvl2 = ref([])
const lvl3 = ref([])
const activeL1 = ref('')
const activeL2 = ref('')
let hoverTimer = null

/* =========================
   selected
   ========================= */
const selectedLeafs = computed(() => (Array.isArray(props.selected) ? props.selected : []))
const draftSelected = ref([])

/* =========================
   ✅ 你的原逻辑：加载整棵树（map/yindian）
   - 我这里保留「不转 cascader options」，直接用原树结构
   ========================= */
const loadedTree = ref({}) // 当前 mode 对应的 tree（对象结构）

function filterTopLevelKeys(obj) {
  if (typeof obj !== 'object' || Array.isArray(obj) || obj === null) {
    console.warn('[Yindian Tree] invalid tree:', obj)
    return {}
  }
  const filtered = {}
  for (const key of TOP_YINDIAN) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      filtered[key] = obj[key]
    }
  }
  return filtered
}

async function loadTreeFor(mode) {
  if (mode === 'map') {
    loadedTree.value = STATIC_TREE || {}
    return
  }

  if (mode === 'yindian') {
    const CACHE_KEY = '__YINDIAN_TREE_CACHE__'

    // ✅ 先读缓存
    const cached = sessionStorage.getItem(CACHE_KEY)
    if (cached) {
      try {
        const tree = JSON.parse(cached)
        loadedTree.value = filterTopLevelKeys(tree)
        return
      } catch {
        sessionStorage.removeItem(CACHE_KEY)
      }
    }

    // ✅ 再请求后端
    const res = await fetch(`${API_BASE}/partitions`)
    const tree = await res.json()
    const filteredTree = filterTopLevelKeys(tree)

    sessionStorage.setItem(CACHE_KEY, JSON.stringify(filteredTree))
    loadedTree.value = filteredTree
  }
}


watch(
    () => props.mode,
    async (m) => {
      closePopup()
      await loadTreeFor(m)
    },
    { immediate: true }
)

/* =========================
   Tree helpers（从对象树取 children）
   ========================= */
function nodeHasChildren(node) {
  if (!node) return false
  if (Array.isArray(node)) return node.length > 0
  if (typeof node === 'object') return Object.keys(node).length > 0
  return false
}

function getChildrenFromTree(tree, parentLabel) {
  if (!tree || typeof tree !== 'object') return []

  function search(node) {
    if (!node || typeof node !== 'object') return null
    if (Array.isArray(node)) return null
    for (const key of Object.keys(node)) {
      if (key === parentLabel) return node[key]
      const found = search(node[key])
      if (found !== null) return found
    }
    return null
  }

  if (parentLabel === null) {
    return Object.keys(tree).map(k => ({
      label: k,
      hasChildren: nodeHasChildren(tree[k])
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
      hasChildren: nodeHasChildren(childrenNode[k])
    }))
  }
  return []
}

function getChildren(parentLabel) {
  return getChildrenFromTree(loadedTree.value, parentLabel)
}

/* =========================
   Open/Close
   ========================= */
async function openPopup() {
  // ✅ 若 tree 还没加载完（或为空），先加载一次
  if (!loadedTree.value || Object.keys(loadedTree.value).length === 0) {
    await loadTreeFor(props.mode)
  }
  popupOpen.value = true
  draftSelected.value = selectedLeafs.value.slice()

  lvl1.value = getChildren(null)
  lvl2.value = []
  lvl3.value = []
  activeL1.value = ''
  activeL2.value = ''

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
   Expand/Hover
   ========================= */
function expand(item, level) {
  if (!item?.hasChildren) return
  if (level === 1) onHoverL1(item, true)
  if (level === 2) onHoverL2(item, true)
}

function onHoverL1(item, immediate = false) {
  clearTimeout(hoverTimer)
  const run = () => {
    activeL1.value = item.label
    lvl2.value = getChildren(item.label)
    lvl3.value = []
    activeL2.value = ''
  }
  if (immediate) return run()
  hoverTimer = setTimeout(run, 100)
}

function onHoverL2(item, immediate = false) {
  clearTimeout(hoverTimer)
  const run = () => {
    activeL2.value = item.label
    lvl3.value = getChildren(item.label)
  }
  if (immediate) return run()
  hoverTimer = setTimeout(run, 100)
}

/* =========================
   Selection（叶子字符串数组）
   - 按你要求：一级/二级/三级点 label 都算“选择”
   ========================= */
function toggleLeaf(label) {
  const arr = draftSelected.value.slice()
  const idx = arr.indexOf(label)
  if (idx >= 0) arr.splice(idx, 1)
  else arr.push(label)
  draftSelected.value = arr
}

function removeDraft(label) {
  draftSelected.value = draftSelected.value.filter(x => x !== label)
}

function clearDraft() {
  draftSelected.value = []
}

function confirmAndClose() {
  emit('update:selected', draftSelected.value.slice())
  closePopup()
}

// ✅ 选框内删已选：立即对外生效
function removeCommitted(label) {
  const next = selectedLeafs.value.filter(x => x !== label)
  emit('update:selected', next)
  if (popupOpen.value) {
    draftSelected.value = draftSelected.value.filter(x => x !== label)
  }
}

/* =========================
   ESC
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

/* expose for template */
defineExpose({ togglePopup, openPopup, closePopup })
</script>


<style scoped>
/* ===== 選框（液態玻璃） ===== */
.region-select-box {
  width: 95%;
  min-height: 38px;
  border-radius: 14px;
  padding: 8px 34px 8px 10px;
  box-sizing: border-box;

  display: flex;
  gap: 8px;
  cursor: pointer;
  position: relative;

  background: rgba(255, 255, 255, 0.40);
  border: 1px solid rgba(200, 200, 200, 0.45);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.10);

  backdrop-filter: blur(16px) saturate(160%);
  -webkit-backdrop-filter: blur(16px) saturate(160%);
  max-height: 96px;
  overflow-y: auto;
  align-items: flex-start;
}
/* 可选：滚动条更细一点（和玻璃风格更匹配） */
.region-select-box::-webkit-scrollbar {
  width: 6px;
}
.region-select-box::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.18);
  border-radius: 6px;
}
.region-select-box::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.18);
  border-radius: 6px;
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

.region-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
}

.region-tag,
.topbar-tag {
  position: relative; /* ✅ 允許右上角 × */
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 13px;
  color: rgba(25, 25, 25, 0.86);
  background: rgba(255, 255, 255, 0.48);
  border: 1px solid rgba(160, 160, 160, 0.22);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
  max-width: 100%;
}

.tag-remove {
  border: none;
  background: rgba(0, 0, 0, 0.06);
  width: 18px;
  height: 18px;
  border-radius: 8px;
  cursor: pointer;
  flex: 0 0 auto;
}

/* ===== Overlay ===== */
.partition-overlay {
  position: fixed;
  inset: 0;
  z-index: 20000;
  background: rgba(0, 0, 0, 0.10);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(4px);
  overflow: auto;
}

/* ===== 頂部確認欄 ===== */
.partition-topbar {
  position: sticky;
  top: 0;
  z-index: 20010;
  display: flex;
  flex-direction: column;   /* ✅ 两行 */
  gap: 6px;

  align-items: flex-start;
  justify-content: space-between;

  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.28);
  border-bottom: 1px solid rgba(255, 255, 255, 0.30);
  box-shadow: 0 10px 26px rgba(0, 0, 0, 0.08);

  backdrop-filter: blur(14px) saturate(160%);
  -webkit-backdrop-filter: blur(14px) saturate(160%);
}

/* 第一行：左右对齐 */
.topbar-row-1 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

/* 第二行：tags 自动换行 */
.topbar-row-2 {
  display: flex;
  max-height: 84px;        /* 你想要的最大高度，自行调 */
  overflow-y: auto;        /* 超出就滚动 */
  overflow-x: hidden;
}

.topbar-title {
  font-size: 13px;
  font-weight: 700;
  color: rgba(20, 20, 20, 0.85);
}

.topbar-count {
  font-weight: 600;
  color: rgba(20, 20, 20, 0.55);
  margin-left: 6px;
}

.topbar-tags {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.topbar-empty {
  margin-top: 8px;
  font-size: 13px;
  color: rgba(60, 60, 60, 0.70);
}

.topbar-right {
  display: flex;
  gap: 10px;
  flex: 0 0 auto;
  padding-top: 2px;
  margin-left: auto;
}

.topbar-btn {
  border: 1px solid rgba(0, 122, 255, 0.35);
  background: rgba(0, 122, 255, 0.85);
  color: #fff;
  font-weight: 700;
  font-size: 13px;
  padding: 8px 12px;
  border-radius: 12px;
  cursor: pointer;
  box-shadow: 0 10px 26px rgba(0, 122, 255, 0.18);
}

.topbar-btn.ghost {
  background: rgba(255, 255, 255, 0.42);
  color: rgba(20, 20, 20, 0.82);
  border: 1px solid rgba(160, 160, 160, 0.26);
  box-shadow: 0 10px 26px rgba(0, 0, 0, 0.06);
}

.topbar-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

/* ===== Stage（左上開始） ===== */
.partition-stage {
  padding: 12px;
  display: flex;
}

/* ===== 三级容器 ===== */
.partition-container {
  display: flex;
  gap: 8px;
  padding: 10px;

  width: fit-content;
  max-width: calc(100vw - 24px);

  background: rgba(255, 255, 255, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.30);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);

  backdrop-filter: blur(14px) saturate(160%);
  -webkit-backdrop-filter: blur(14px) saturate(160%);

  border-radius: 16px;
}

.partition-popup {
  min-width: 80px;
  max-width: 140px;

  background: rgba(255, 255, 255, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.30);
  border-radius: 12px;

  padding: 8px;
  display: flex;
  flex-direction: column;
  user-select: none;
}

.partition-popup.partition-lvl3 {
  max-height: 240px;
  overflow-y: auto;
}

.partition-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 3px 6px;
  border-radius: 999px;
  cursor: default;
  transition: background 0.2s, box-shadow 0.2s;
}

.partition-line:hover {
  background: rgba(255, 255, 255, 0.28);
  box-shadow: 0 0 6px rgba(255, 255, 255, 0.55) inset;
}

.partition-line.active {
  background: rgba(180, 223, 244, 0.72);
  box-shadow: 0 0 8px rgba(0, 122, 255, 0.28);
}

.partition-item {
  flex: 1 1 auto;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer; /* ✅ 点击选择 */
  font-size: 15px;
}
@media (orientation: portrait) {
  .partition-item{
    font-size: 18px;
  }
}
.partition-item.chosen {
  font-weight: 800;
  color: rgba(0, 60, 140, 0.92);
}

.partition-arrow {
  flex: 0 0 auto;
  font-size: 13px;
  color: rgba(0, 0, 139, 0.85);
  font-weight: 700;
  opacity: 0.85;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 0 6px;
  border-radius: 10px;
  cursor: pointer;
}

.partition-arrow:hover {
  opacity: 1;
  background: rgba(0, 0, 0, 0.05);
}
</style>

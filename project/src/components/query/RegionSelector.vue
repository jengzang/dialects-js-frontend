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
      <div v-if="popupOpen" class="partition-overlay">
        <!-- ✅ 頂部確認欄：顯示已選 + 可刪除 + 確認 -->
        <div ref="topbarEl" class="partition-topbar" @mousedown.stop>
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

        <!-- ✅ Stage：lvl1 仍放在文档流；lvl2/lvl3 以 fixed 浮層跟随 -->
        <div class="partition-stage">
          <!-- lvl1 -->
          <div ref="lvl1El" class="partition-popup partition-lvl1" @mousedown.stop>
            <div
                v-for="item in lvl1"
                :key="'l1_' + item.label"
                class="partition-line"
                :class="{ active: activeL1 === item.label }"
                @mouseenter="onHoverL1(item, $event)"
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
                  @click.stop="expand(item, 1, $event)"
                  title="展開"
              >
                ⌵
              </div>
            </div>
          </div>

          <!-- lvl2：fixed，跟随 lvl1 hover 行 -->
          <div
              ref="lvl2El"
              v-if="lvl2.length"
              class="partition-popup partition-lvl2"
              :style="lvl2Pos"
              @mousedown.stop
          >
            <div
                v-for="item in lvl2"
                :key="'l2_' + item.label"
                class="partition-line"
                :class="{ active: activeL2 === item.label }"
                @mouseenter="onHoverL2(item, $event)"
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
                  @click.stop="expand(item, 2, $event)"
                  title="展開"
              >
                ⌵
              </div>
            </div>
          </div>

          <!-- lvl3：fixed，跟随 lvl2 hover 行 -->
          <div
              ref="lvl3El"
              v-if="lvl3.length"
              class="partition-popup partition-lvl3"
              :style="lvl3Pos"
              @mousedown.stop
          >
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
import { API_BASE } from '@/env-config.js'
import { STATIC_REGION_TREE, top_yindian } from '@/config'

// 全局已有（你原来 Cascader 就这么用的）
const STATIC_TREE = STATIC_REGION_TREE ?? {}
const TOP_YINDIAN = top_yindian ?? []

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

const anchorEl = ref(null)

/* =========================
   ✅ fixed 定位所需：lvl1 容器 ref + lvl2/lvl3 position
   ========================= */
const lvl1El = ref(null)
const lvl2Pos = ref({ position: 'fixed', left: '0px', top: '0px' })
const lvl3Pos = ref({ position: 'fixed', left: '0px', top: '0px' })

/* =========================
   selected
   ========================= */
const selectedLeafs = computed(() => (Array.isArray(props.selected) ? props.selected : []))
const draftSelected = ref([])

/* =========================
   ✅ 你的原逻辑：加载整棵树（map/yindian）
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
const topbarEl = ref(null)
const lvl2El = ref(null)
const lvl3El = ref(null)

function onDocMouseDown(e) {
  if (!popupOpen.value) return

  const t = e.target

  const allow =
      topbarEl.value?.contains(t) ||
      lvl1El.value?.contains(t) ||
      lvl2El.value?.contains(t) ||
      lvl3El.value?.contains(t)

  if (!allow) {
    // 你现在的外部点击是“确认并关闭”，保持一致
    confirmAndClose()
  }
}

async function loadTreeFor(mode) {
  loadedTree.value = {};

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
   ✅ 定位钳制：模仿你原生版用 lvl1 首尾 item 作为上下锚点
   ========================= */
function clampPopupTopByLvl1(popupTop, popupHeight = 240) {
  const host = lvl1El.value
  if (!host) return popupTop

  const lines = host.querySelectorAll('.partition-line')
  if (!lines.length) return popupTop

  const firstRect = lines[0].getBoundingClientRect()
  const lastRect = lines[lines.length - 1].getBoundingClientRect()

  const anchorTop = firstRect.top
  const anchorBottom = lastRect.bottom

  if (popupTop + popupHeight > anchorBottom) popupTop = anchorBottom - popupHeight
  if (popupTop < anchorTop) popupTop = anchorTop

  popupTop = Math.max(popupTop, 0)
  popupTop = Math.min(popupTop, window.innerHeight - popupHeight)
  return popupTop
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
  document.addEventListener('mousedown', onDocMouseDown, true)
}

function closePopup() {
  popupOpen.value = false
  lvl1.value = []
  lvl2.value = []
  lvl3.value = []
  activeL1.value = ''
  activeL2.value = ''
  unbindEsc()
  document.removeEventListener('mousedown', onDocMouseDown, true)
}

function togglePopup() {
  popupOpen.value ? closePopup() : openPopup()
}

/* =========================
   Expand/Hover
   ========================= */
function expand(item, level, e) {
  if (!item?.hasChildren) return

  // ✅ 用箭头所在的 .partition-line 作为展开基准
  const lineEl = e?.currentTarget?.closest?.('.partition-line')
  const fakeEvent = lineEl ? { currentTarget: lineEl } : null

  // ✅ 关键：清掉两层 hover 定时器，并且让两层的旧 hover 全部失效
  clearTimeout(hoverTimerL1)
  clearTimeout(hoverTimerL2)
  hoverSeqL1++
  hoverSeqL2++

  if (level === 1) onHoverL1(item, fakeEvent, true)
  if (level === 2) onHoverL2(item, fakeEvent, true)
}

let hoverTimerL1 = null
let hoverTimerL2 = null
let hoverSeqL1 = 0
let hoverSeqL2 = 0


function onHoverL1(item, e, immediate = false) {
  const seq = ++hoverSeqL1
  clearTimeout(hoverTimerL1)

  const rect = e?.currentTarget?.getBoundingClientRect?.()
  const popupLeft = rect ? rect.right : null
  const rawTop = rect ? rect.top : null

  const run = () => {
    if (seq !== hoverSeqL1) return

    activeL1.value = item.label
    lvl2.value = getChildren(item.label)
    lvl3.value = []
    activeL2.value = ''

    if (popupLeft != null && rawTop != null) {
      const popupTop = clampPopupTopByLvl1(rawTop, 240)
      lvl2Pos.value = { position: 'fixed', left: `${popupLeft}px`, top: `${popupTop}px` }
    }
  }

  if (immediate) return run()
  hoverTimerL1 = setTimeout(run, 100)
}


function onHoverL2(item, e, immediate = false) {
  const seq = ++hoverSeqL2
  clearTimeout(hoverTimerL2)

  const rect = e?.currentTarget?.getBoundingClientRect?.()
  const popupLeft = rect ? rect.right : null
  const rawTop = rect ? rect.top : null

  const run = () => {
    if (seq !== hoverSeqL2) return

    activeL2.value = item.label
    lvl3.value = getChildren(item.label)

    if (popupLeft != null && rawTop != null) {
      const popupTop = clampPopupTopByLvl1(rawTop, 240)
      lvl3Pos.value = { position: 'fixed', left: `${popupLeft}px`, top: `${popupTop}px` }
    }
  }

  if (immediate) return run()
  hoverTimerL2 = setTimeout(run, 100)
}



/* =========================
   Selection（叶子字符串数组）
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
  clearTimeout(hoverTimerL1)
  clearTimeout(hoverTimerL2)
  unbindEsc()
  document.removeEventListener('mousedown', onDocMouseDown, true)
})


/* expose for template */
defineExpose({ togglePopup, openPopup, closePopup })
</script>

<style scoped>
/* ===== 選框（液態玻璃） ===== */
.region-select-box {
  width: 98%;
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
  max-height: 60px;
  overflow-y: auto;
  overflow-x: hidden;
  align-items: flex-start;
}

/* 滚动条 */
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
  white-space: nowrap;
  overflow: hidden;
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
  position: relative;
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
  white-space: nowrap;
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
  flex-direction: column;
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

/* 第二行：tags 自动滚动 */
.topbar-row-2 {
  display: flex;
  max-height: 84px;
  overflow-y: auto;
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

/* ===== Stage（lvl1 在流式；lvl2/lvl3 fixed 浮层） ===== */
.partition-stage {
  padding: 12px;
  display: flex;
}

/* ===== 三级容器：仍保留你的玻璃风格 ===== */
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

  z-index: 20020; /* ✅ 确保在 overlay 内但不被 topbar 压住（topbar 更高） */
}

/* ✅ 兜底：lvl2/lvl3 固定定位（真正跟随靠 :style 写 top/left） */
.partition-popup.partition-lvl2,
.partition-popup.partition-lvl3 {
  position: fixed;
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
  cursor: pointer;
  font-size: 15px;
}

@media (max-aspect-ratio: 1/1)  {
  .partition-item {
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

<template>
  <div>
    <!-- ✅ 同行輸入：地點 + 分區 -->
    <div class="input-row" >

      <!-- ✅ 地點輸入框 -->
      <div class="location-input">
        <label for="locations">地點</label>
        <textarea
            id="locations"
            ref="inputEl"
            placeholder="請輸入地點(可匹配)"
            v-model="inputValue"
            @keyup="onKeyup"
            @blur="onBlur"
            autocomplete="off"
        ></textarea>
        <Teleport to="body">
          <div
              ref="suggestionEl"
              v-if="suggestions.length || successMessage"
              class="inline-suggestion"
              :style="suggestionStyle"
          >
            <div v-if="successMessage" class="success">✅ {{ successMessage }}</div>
            <div
                v-for="item in suggestions"
                :key="item"
                class="suggest-line"
                @mousedown.prevent="applySuggestion(item)"
            >
              {{ item }}
            </div>
          </div>
        </Teleport>
      </div>

        <!-- ✅ 分區選擇區 -->
      <div class="region-input" style="flex: 1;">
        <div class="region-header"
             style="display: flex; align-items: center; justify-content: center; margin-bottom: 6px; white-space: nowrap;">

          <div class="region-tabs" style="margin:0;align-items: center;">
            <button
                v-for="tab in ['map', 'yindian']"
                :key="tab"
                class="tab-btn"
                :class="{ active: regionUsing === tab }"
                @click="onTabClick(tab)"
            >
              {{ tab === 'map' ? '地圖集' : '音典' }}
            </button>
          </div>
        </div>

        <!-- ✅ 分區 Cascader -->
        <RegionSelector
            :mode="regionUsing"
            v-model:selected="selectedValue"
            :placeholder="regionUsing === 'map' ? '請選擇地圖集分區' : '請選擇音典分區'"/>

      </div>
    </div>
    <!-- ✅ 底部提示欄：已選擇地點數 -->
    <div class="bottom-hint" >
      <div class="hint-main">
        您已選擇 <span class="hint-num">{{ selectedCount }}</span> 個地點
      </div>
      <!-- ✅ 新增：深灰色預覽行（最多顯示 4 個 + 省略號 + 展開） -->
      <div v-if="locationsResult.length" class="hint-preview">
    <span class="preview-text">
      {{ previewText }}
    </span>
        <button
            v-if="locationsResult.length > 4"
            class="expand-btn"
            type="button"
            @click="openModal"
        >
          展開
        </button>
      </div>
      <!-- ✅ 對應 showToast 的提示行 -->
      <div v-if="limitHint" class="hint-warning">
        {{ limitHint }}
      </div>
      <Teleport to="body">
        <div
            v-if="showLocationsModal"
            class="glass-overlay"
            @mousedown.self="closeModal"
        >
          <div class="glass-modal" role="dialog" aria-modal="true">
            <div class="modal-header">
              <div class="modal-title">已選擇地點（{{ locationsResult.length }}）</div>
              <button class="modal-close" type="button" @click="closeModal">×</button>
            </div>

            <div class="modal-body">
              <div class="locations-list">
            <span
                v-for="(loc, idx) in locationsResult"
                :key="loc + '_' + idx"
                class="loc-chip"
            >
              {{ loc }}
            </span>
              </div>
            </div>
          </div>
        </div>
      </Teleport>
    </div>
  </div>
</template>


<script setup>
import { ref, nextTick ,onMounted, onActivated, watch, computed} from 'vue'
import {api} from '../utils/auth.js'
import RegionSelector from "@/components/RegionSelector.vue";
const API_BASE = window.API_BASE;
const MAP_TREE = STATIC_REGION_TREE;
const YINDIAN_TREE = top_yindian;

/** 地點輸入邏輯 */
const inputEl = ref(null)
const inputValue = ref('') // 預設值
const suggestionEl = ref(null)
const suggestions = ref([])
const successMessage = ref('')
const suggestionStyle = ref({
  left: '0px',
  top: '0px',
  position: 'absolute',
  zIndex: 99999
})

// 已選擇地點數（來自 /get_locs/ 返回）
const selectedCount = ref(null)
// 底部提示欄的「限制提示文案」（對應 showToast）
// 為空字串時不顯示
const limitHint = ref('')
let debounceTimer = null

function getQueryStart() {
  const el = inputEl.value
  const cursorPos = el.selectionStart
  const value = el.value
  const separators = /[ ,;/，；、\n\t]/g

  let lastSepIndex = -1
  for (let i = cursorPos - 1; i >= 0; i--) {
    if (separators.test(value[i])) {
      lastSepIndex = i
      break
    }
  }

  return {
    queryStart: lastSepIndex + 1,
    cursorPos,
    value
  }
}

function onKeyup() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(fetchSuggestion, 300)
}

function onBlur() {
  setTimeout(() => {
    suggestions.value = []
    successMessage.value = ''
  }, 200)
}

function fetchSuggestion() {
  const { queryStart, cursorPos, value } = getQueryStart()
  const query = value.slice(queryStart, cursorPos).trim()
  if (!query) {
    suggestions.value = []
    successMessage.value = ''
    return
  }

  const token = localStorage.getItem('ACCESS_TOKEN')

  fetch(`${window.API_BASE}/batch_match?input_string=${encodeURIComponent(query)}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  })
      .then(res => res.json())
      .then(results => {
        suggestions.value = []
        successMessage.value = ''
        if (!results.length) return

        const r = results[0]
        if (r.success) {
          successMessage.value = r.message
        } else {
          const allValues = value.split(/[ ,;/，；、\n\t]+/).filter(Boolean)
          const exclusionSet = new Set(allValues.filter(v => v !== query))
          const filtered = Array.from(new Set(r.items)).filter(item => !exclusionSet.has(item))
          suggestions.value = filtered
        }

        nextTick(() => {
          const el = inputEl.value
          const rect = el.getBoundingClientRect()

          suggestionStyle.value = {
            position: 'absolute',
            left: `${rect.left + window.scrollX}px`,
            top: `${rect.top + rect.height + 6 + window.scrollY}px`,
            zIndex: 99999,
            minWidth: `${el.offsetWidth}px` // 可選：匹配寬度
          }

        })
      })
}

function applySuggestion(item) {
  const { queryStart, cursorPos, value } = getQueryStart()
  const before = value.slice(0, queryStart)
  const after = value.slice(cursorPos)
  inputValue.value = before + item + ' ' + after

  nextTick(() => {
    const pos = before.length + item.length + 1
    inputEl.value.setSelectionRange(pos, pos)
    suggestions.value = []
    successMessage.value = ''
  })
}

/* ========== 分區選擇邏輯 ========== */
const selectedValue = ref([])  // ✅ 不要 ['']

const regionUsing = ref('map')
const options = ref([])


function onTabClick(tab) {
  if (regionUsing.value === tab) return
  regionUsing.value = tab
  selectedValue.value = []
  loadTreeFor(tab)
  // console.log('tab',tab)
  // 根據 tab 設置對應的預設值
  // if (tab === 'map') {
  //   selectedValue.value = ['客家話']
  // } else if (tab === 'yindian') {
  //   selectedValue.value = ['閩','閩西']
  // }
}

function onSelect(values) {
  selectedValue.value = values
}

/* ========== 一次性轉換整棵樹 ========== */
function convertToCascaderOptions(tree) {
  if (Array.isArray(tree)) {
    // 是 Array，直接轉成葉子節點
    return tree.map(label => ({
      label,
      value: label,
      isLeaf: true
    }))
  }

  if (typeof tree === 'object' && tree !== null) {
    return Object.entries(tree).map(([label, children]) => {
      const convertedChildren = convertToCascaderOptions(children)

      // 根據是否有子節點決定是否為葉子
      const isLeaf = convertedChildren.length === 0

      return {
        label,
        value: label,
        ...(isLeaf ? { isLeaf: true } : { children: convertedChildren })
      }
    })
  }

  return []
}

/* ========== 分區資料來源 ========== */
function loadTreeFor(mode) {
  if (mode === 'map') {
    options.value = convertToCascaderOptions(STATIC_REGION_TREE)
    // console.log(options)
  } else if (mode === 'yindian') {
    const CACHE_KEY = '__YINDIAN_TREE_CACHE__'
// ✅ 真正的 filter，不轉格式，只刪除 key
    const filterTopLevelKeys = (obj) => {
      if (typeof obj !== 'object' || Array.isArray(obj) || obj === null) {
        console.warn('[Yindian Tree] Expected tree to be object, got:', typeof obj)
        return {}
      }
      const filtered = {}
      for (const key of top_yindian) {
        if (obj.hasOwnProperty(key)) {
          filtered[key] = obj[key]
        }
      }
      return filtered
    }
    if (!sessionStorage.getItem(CACHE_KEY)) {
      fetch(`${window.API_BASE}/partitions`)
          .then(res => res.json())
          .then(tree => {
            const filteredTree = filterTopLevelKeys(tree)
            sessionStorage.setItem(CACHE_KEY, JSON.stringify(filteredTree))
            options.value = convertToCascaderOptions(filteredTree)
          })
    } else {
      const cachedTree = JSON.parse(sessionStorage.getItem(CACHE_KEY))
      const filteredTree = filterTopLevelKeys(cachedTree)
      options.value = convertToCascaderOptions(filteredTree)
    }

  }
}
// 初始加載
loadTreeFor(regionUsing.value)

const cascaderRef = ref(null)
async function simulateClickPath(path) {
  // 1. 打開 Cascader 的彈窗
  cascaderRef.value?.showMenu()

  await nextTick()
  // 2. 遞迴點擊每一層
  for (const label of path) {
    await nextTick()
    // 獲取當前展開層的選項列表
    const menuList = document.querySelectorAll('.n-cascader-menu')

    // 找到當前層中 label 匹配的項
    let found = false
    for (const menu of menuList) {
      const items = menu.querySelectorAll('.n-cascader-option')
      for (const item of items) {
        if (item.textContent?.trim().includes(label)) {
          item.click()
          found = true
          break
        }
      }
      if (found) break
    }

    if (!found) {
      console.warn(`❗未找到 label: ${label}`)
      break
    }

    // 等下一層渲染
    await new Promise(resolve => setTimeout(resolve, 100))
  }
}

onMounted(() => {
  reset()
})

onActivated(() => {
  reset()
})
async function fetchLocationsResult() {
  // 1️⃣ locations ← inputValue（地點輸入）
  const locations = (inputValue.value ?? '')
      .trim()
      .split(/\s+/)
      .filter(Boolean)

  // 2️⃣ regions ← selectedValue（分區選擇）
  const rawRegions = selectedValue.value
  const regions = Array.isArray(rawRegions)
      ? rawRegions.map(v => String(v).trim()).filter(Boolean)
      : rawRegions
          ? [String(rawRegions).trim()].filter(Boolean)
          : []

  // 3️⃣ 若兩者皆空，直接返回（對齊 isEmptyInput 判斷）
  if (locations.length === 0 && regions.length === 0) {
    limitHint.value = '請輸入地點或分區'
    selectedCount.value = null
    locationsResult.value = []
    return
  }

  try {
    const query = new URLSearchParams()
    locations.forEach(loc => query.append('locations', loc))
    regions.forEach(reg => query.append('regions', reg))
    query.set('region_mode', regionUsing.value)

    const data = await api(
        `/api/get_locs/?${query.toString()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }
    )
    // ✅ 存列表（用於預覽與彈層）
    locationsResult.value = Array.isArray(data?.locations_result) ? data.locations_result : []
    // 6️⃣ 核心結果：locations_result
    const count = data?.locations_result?.length ?? 0
    selectedCount.value = count

    // 7️⃣ 對齊你原來的限制邏輯（showToast 對應 bottom-hint）
    const limit_anonymous = 200
    const limit_users = 600

    if (window.userRole === 'anonymous' && count > limit_anonymous) {
      limitHint.value = `未登錄用戶單次最多可查詢 ${limit_anonymous} 個地點`
    } else if (window.userRole === 'user' && count > limit_users) {
      limitHint.value = `用戶單次最多可查詢 ${limit_users} 個地點`
    } else {
      limitHint.value = ''
    }

    // ✅ 若你後面還有「正常處理」，從這裡往下接
    return data

  } catch (err) {
    console.error('❌ 請求錯誤:', err)
    limitHint.value = err.message || '地點查詢失敗，請稍後再試'
    selectedCount.value = null
    locationsResult.value = []
  }
}
let debounceTimer2 = null

watch(
    [inputValue, selectedValue, regionUsing],
    () => {
      // 清除上一次計時
      if (debounceTimer2) {
        clearTimeout(debounceTimer2)
      }

      // 重新計時：1s 內不再變化才觸發
      debounceTimer2 = setTimeout(async () => {
        await fetchLocationsResult()
      }, 500)
    },
    {
      deep: true
    }
)
// ✅ 保存服務端返回的 locations_result
const locationsResult = ref([])

// ✅ 彈層開關
const showLocationsModal = ref(false)

const previewText = computed(() => {
  const arr = locationsResult.value || []
  if (!arr.length) return ''
  const first4 = arr.slice(0, 4).join('、')
  return arr.length > 4 ? `${first4}…` : first4
})

function openModal() {
  showLocationsModal.value = true
}

function closeModal() {
  showLocationsModal.value = false
}
function reset() {
  inputValue.value = ''
  selectedValue.value = []     // ✅ 不要 ['']
}

defineExpose({
  inputValue,
  selectedValue,
  regionUsing,
  selectedCount,
  limitHint,
  locationsResult
})

</script>

<style>
/* 限制每一層最大寬度 */
.custom-cascader-dropdown .n-cascader-menu {
  width: 180px !important;
  max-width: 200px !important;
  min-width: 120px !important;
}

/* 防止選項文字太長撐爆一整列 */
.custom-cascader-dropdown .n-cascader-option {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  max-width: 180px;
}

</style>

<style scoped>

.region-tabs {
  display: inline-flex;
  border-radius: 16px;
  padding: 4px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
  gap: 4px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background-color: #f9f9fb;
  max-width: 250px;
}

.region-tabs button {
  appearance: none;
  background: none;
  border: none;
  padding: 3px 6px;
  border-radius: 12px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.25s ease;
  color: #333;
  min-width: 60px;
  text-align: center;
  user-select: none;
}

.region-tabs button:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.region-tabs button.active {
  background-color: #007aff; /* Apple Blue */
  color: white;
  font-weight: 600;
  box-shadow:
      0 0 0 1px rgba(0, 122, 255, 0.3),
      0 4px 12px rgba(0, 122, 255, 0.2);
}

/* 即時提示面板 */
.inline-suggestion {
  position: absolute !important;
  background: rgba(255, 255, 255, 0.6) !important; /* 🔹 半透明背景 */
  border: 1px solid rgba(200, 200, 200, 0.5) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 8px 12px;
  border-radius: 12px; /* 蘋果味更重一點 */
  backdrop-filter: blur(12px); /* 🔹 液態玻璃效果 */
  -webkit-backdrop-filter: blur(12px); /* for Safari */
  white-space: pre-line;
  font-size: 14px;
  color: #333;
  max-width: 100px;
  width: fit-content; /* ✅ 根據內容自動撐寬 */
  z-index: 99999 !important;
  pointer-events: auto !important;
  max-height: 20dvh;
  overflow-y: auto;
  transition: background-color 0.2s ease;
}

/* ✅ 成功訊息 */
.inline-suggestion .success {
  color: #007aff;
  font-weight: bold;
}

/* ✅ 錯誤訊息 */
.inline-suggestion .error {
  color: #ff3b30;
  font-weight: bold;
}

/* ✅ 建議項目 */
.suggest-line {
  padding: 4px 8px;
  cursor: pointer;
  border-radius: 6px;
  transition: background-color 0.2s ease;
}

/* ✅ Hover：蘋果淺藍 */
.suggest-line:hover {
  background-color: rgba(175, 217, 251, 0.8);
}


.success {
  color: green;
  padding: 4px 8px;
  font-weight: bold;
}

.location-input,
.region-input {
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-width: 250px;
  min-width: 0;
  width: 100%;
}
.location-input{
  flex: 1;
}
.region-input{
  flex: 1.2;
}
.input-row {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: center; /* 居中子元素內容 */
  max-width: 600px;        /* 限定總寬度 */
  margin: 3dvh  auto 1dvh auto ;          /* 水平置中 */
  width: 90%;
}

.bottom-hint {
  margin:  0 1dvw 4dvh  ;
  max-width: 600px;
  width: 90%;
  padding: 6px 20px;
  justify-self: center;
  /* liquid glass */
  background: rgba(255, 255, 255, 0.42);
  border: 1px solid rgba(200, 200, 200, 0.45);
  border-radius: 14px;
  backdrop-filter: blur(16px) saturate(160%);
  -webkit-backdrop-filter: blur(16px) saturate(160%);
  box-shadow: 0 10px 26px rgba(0, 0, 0, 0.10);

  font-size: 14px;
  color: rgba(30, 30, 30, 0.88);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 6px;
  user-select: none;
}

.hint-num {
  font-weight: 700;
  color: #007aff;
  padding: 0 6px;
  border-radius: 10px;
  background: rgba(0, 122, 255, 0.10);
  border: 1px solid rgba(0, 122, 255, 0.18);
}
.hint-main {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

/* ⚠️ 限制提示：比主文案弱一級，但足夠醒目 */
.hint-warning {
  font-size: 13px;
  color: darkgoldenrod;
  text-align: center;
  line-height: 1.4;
  opacity: 0.9;
}
/* 預覽行：深灰色，與主文案分層 */
.hint-preview {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: baseline;
  gap: 10px;
  text-align: center;
}

.preview-text {
  color: rgba(60, 60, 60, 0.85);
  font-size: 13px;
  line-height: 1.35;
  max-width: 520px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 展開按鈕：克制的蘋果藍 */
.expand-btn {
  appearance: none;
  border: 1px solid rgba(0, 122, 255, 0.22);
  background: rgba(0, 122, 255, 0.10);
  color: #007aff;
  font-size: 13px;
  padding: 2px 10px;
  border-radius: 999px;
  cursor: pointer;
  user-select: none;
}

.expand-btn:hover {
  background: rgba(0, 122, 255, 0.16);
}

/* 全局遮罩 + 玻璃彈層 */
.glass-overlay {
  position: fixed;
  inset: 0;
  z-index: 20000;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 18px;
  background: rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(7px);
  -webkit-backdrop-filter: blur(6px);
}

.glass-modal {
  width: min(720px, 94vw);
  max-height: min(70vh, 640px);
  overflow: hidden;
  background: rgba(255, 255, 255, 0.42);
  border: 1px solid rgba(200, 200, 200, 0.45);
  border-radius: 18px;
  box-shadow: 0 18px 60px rgba(0, 0, 0, 0.18);

  backdrop-filter: blur(18px) saturate(160%);
  -webkit-backdrop-filter: blur(18px) saturate(160%);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border-bottom: 1px solid rgba(180, 180, 180, 0.25);
}

.modal-title {
  font-size: 15px;
  font-weight: 650;
  color: rgba(20, 20, 20, 0.88);
}

.modal-close {
  appearance: none;
  border: none;
  background: rgba(0, 0, 0, 0.06);
  width: 28px;
  height: 28px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 18px;
  line-height: 28px;
  color: rgba(20, 20, 20, 0.75);
}

.modal-close:hover {
  background: rgba(0, 0, 0, 0.10);
}

.modal-body {
  padding: 12px 14px 16px;
  overflow: auto;
  max-height: calc(min(70vh, 640px) - 100px);
}

.locations-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.loc-chip {
  display: inline-flex;
  align-items: center;
  padding: 3px 6px;
  border-radius: 999px;
  font-size: 14px;
  color: rgba(25, 25, 25, 0.85);
  background: rgba(255, 255, 255, 0.48);
  border: 1px solid rgba(160, 160, 160, 0.25);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
}


</style>

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
        <n-cascader
            :options="options"
            v-model:value="selectedValue"
            :show-path="false"
            :label-field="'label'"
            :value-field="'label'"
            :allow-checking-not-leaf="true"
            clearable
            @update:value="onSelect"
            style="width: 100%;"
            :placement="'bottom-start'"
            dropdown-class="custom-cascader-dropdown"
            :placeholder="regionUsing === 'map' ? '請選擇地圖集分區' : '請選擇音典分區'"
        />
      </div>
    </div>

  </div>
</template>


<script setup>
import { ref, nextTick ,onMounted} from 'vue'
import { NCascader } from 'naive-ui'

/** 地點輸入邏輯 */
const inputValue = ref('廣州')
const inputEl = ref(null)
const suggestionEl = ref(null)
const suggestions = ref([])
const successMessage = ref('')
const suggestionStyle = ref({
  left: '0px',
  top: '0px',
  position: 'absolute',
  zIndex: 99999
})


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

const regionUsing = ref('map')
const options = ref([])
const selectedValue = ref(['東北官話', '黑松片'])


function onTabClick(tab) {
  if (regionUsing.value === tab) return
  regionUsing.value = tab
  selectedValue.value = []
  loadTreeFor(tab)
  // console.log('tab',tab)
  // 根據 tab 設置對應的預設值
  if (tab === 'map') {
    selectedValue.value = ['客家話']
  } else if (tab === 'yindian') {
    selectedValue.value = ['閩','閩西']
  }
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
const STATIC_REGION_TREE = {
  "東北官話": {
    "黑松片": ["嫩克小片","佳富小片","站話小片"],
    "吉瀋片": ["蛟甯小片","延吉小片","通溪小片"],
    "哈阜片": ["肇撫小片","長錦小片"]
  },
  "北京官話": {
    "朝峯片": [],
    "京承片": ["懷承小片","京師小片"]
  },
  "冀魯官話": {
    "保唐片": ["撫龍小片","灤昌小片","薊遵小片","天津小片","定霸小片","淶阜小片"],
    "石濟片": ["趙深小片","邢衡小片","聊泰小片"],
    "滄惠片": ["黃樂小片","陽壽小片","章桓小片","莒照小片"]
  },
  "蘭銀官話": {
    "北疆片": [],
    "金城片": [],
    "河西片": [],
    "銀吳片": []
  },
  "膠遼官話": {
    "登連片": ["煙威小片","蓬龍小片","大岫小片"],
    "蓋桓片": [],
    "靑萊片": ["萊昌小片","靑臨小片","膠蓮小片"]
  },
  "中原官話": {
    "徐淮片": [],
    "兗菏片": [],
    "商阜片": [],
    "信蚌片": [],
    "洛嵩片": [],
    "鄭開片": [],
    "南魯片": [],
    "漯項片": [],
    "關中片": [],
    "秦隴片": [],
    "隴中片": [],
    "南疆片": [],
    "河州片": [],
    "汾河片": ["平陽小片","絳州小片","解州小片"]
  },
  "江淮官話": {
    "黃孝片": [],
    "竹柞片": [],
    "洪巢片": [],
    "泰如片": []
  },
  "西南官話": {
    "湖廣片": ["鄂北小片","懷玉小片","黔東小片","黎靖小片","鄂中小片","湘北小片","湘西小片"],
    "桂柳片": ["湘南小片","黔南小片","桂北小片","桂南小片"],
    "雲南片": ["滇中小片","滇西小片","滇南小片"],
    "川黔片": ["成渝小片","黔中小片","陝南小片"],
    "川西片": ["康藏小片","涼山小片"],
    "西蜀片": ["岷赤小片","雅甘小片","江貢小片"]
  },
  "晉語": {
    "張呼片": [],
    "邯新片": ["磁漳小片","獲濟小片"],
    "上黨片": ["晉城小片","長治小片"],
    "呂梁片": ["隰縣小片","汾州小片"],
    "志延片": [],
    "幷州片": [],
    "五臺片": [],
    "大包片": []
  },
  "贛語": {
    "懷岳片": [],
    "鷹弋片": [],
    "大通片": [],
    "昌都片": [],
    "宜瀏片": [],
    "撫廣片": [],
    "未分片": [],
    "吉茶片": [],
    "耒資片": [],
    "洞綏片": []
  },
  "客家話": {
    "雩信片": [],
    "粵北片·客": [],
    "銅桂片": [],
    "粵臺片": ["梅惠小片","龍華小片"],
    "寧龍片": [],
    "汀州片": [],
    "海陸片": [],
    "畲話": [],
    "粵西片": []
  },
  "吳語": {
    "太湖片": ["杭州小片","毗陵小片","蘇嘉湖小片","上海小片","臨紹小片","甬江小片"],
    "宣州片": ["" +
    "太髙小片","銅涇小片","石陵小片"],
    "台州片": [],
    "金衢片": [],
    "上麗片": ["上山小片","麗水小片"],
    "甌江片": []
  },
  "徽語": {
    "旌占片": [],
    "績歙片": [],
    "休黟片": [],
    "嚴州片": [],
    "祁婺片": []
  },
  "粵語": {
    "廣府片": [],
    "四邑片": [],
    "勾漏片": [],
    "邕潯片": [],
    "欽廉片": [],
    "吳化片": [],
    "高陽片": [],
    "不分類": []
  },
  "閩語": {
    "閩南片": ["泉漳小片","大田小片","潮汕小片"],
    "雷州片": [],
    "瓊文片": ["府城小片","文昌小片","萬甯小片","崖縣小片","昌感小片"],
    "莆仙片": [],
    "閩東片": ["侯官小片","福寧小片"],
    "閩北片": ["建陽小片","建甌小片"],
    "閩中片": [],
    "邵將片": ["將樂小片","邵武小片"]
  },
  "湘語": {
    "長益片": ["長株潭小片","岳陽小片","益沅小片"],
    "婁邵片": ["漣梅小片","湘雙小片","新化小片","武邵小片","綏會小片"],
    "辰漵片": [],
    "衡州片": ["衡山小片","衡陽小片"],
    "永全片": ["全資小片","東祁小片","道江小片"]
  },
  "平話和土話": {
    "湘南片": [],
    "粵北片·土": [],
    "桂北片": [],
    "桂南片": []
  },
  "鄕話": {},
  "民族語": {},
};
function loadTreeFor(mode) {
  if (mode === 'map') {
    options.value = convertToCascaderOptions(STATIC_REGION_TREE)
    // console.log(options)
  } else if (mode === 'yindian') {
    const CACHE_KEY = '__YINDIAN_TREE_CACHE__'
    const top = [
      '華北','西北','官話','中上江','下江','兩浙','浙南','湘贛','嶺東','廣中',
      '嶺南','嶺西','閩','湘南','道州','鄕話','白語','蔡家話','民語漢字音'
    ]
// ✅ 真正的 filter，不轉格式，只刪除 key
    const filterTopLevelKeys = (obj) => {
      if (typeof obj !== 'object' || Array.isArray(obj) || obj === null) {
        console.warn('[Yindian Tree] Expected tree to be object, got:', typeof obj)
        return {}
      }
      const filtered = {}
      for (const key of top) {
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
  margin: 3dvh auto;          /* 水平置中 */
  width: 100%;
}



</style>

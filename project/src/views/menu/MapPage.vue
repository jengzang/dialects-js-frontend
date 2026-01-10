<template>
  <div class="tabs-wrapper">
    <div class="tabs">
      <div
          v-for="tab in tabs"
          :key="tab.name"
          :class="['tab', { active: currentTab === tab.name }]"
          @click="router.replace({ query: { ...route.query, sub: tab.name } })"
      >
        {{ tab.label }}
      </div>
    </div>

    <div class="tab-content">
      <!-- 🟦 分區圖頁面 -->
      <div v-if="currentTab === 'map'" class="page">
        <div class="page-content-stack">
          <div class="page-footer">
            <small class="hint">繪製所選方言點的分區圖<br>想輸入多個分區❓️ 點擊👉</small>
            <button class="enter-btn" @click="handleEnter">進入網站</button>
          </div>

          <!-- ✅ Label + 自訂 Dropdown：一行 -->
          <div class="dropdown-row horizontal-dropdown" style="margin-top: 12px;">
            <!-- 左：Label -->
            <label class="query-label" style="margin:0;font-size: 14px;">
              請選擇繪圖分區級數
            </label>

            <!-- 右：自訂 Dropdown -->
            <div class="dropdown-wrapper" style="width: 200px">
              <div class="dropdown" ref="regionTriggerEl" @click="toggleDropdown('region')" style="margin: 0">
                {{ selectedRegion || '請選擇級數' }}
                <span class="arrow">▾</span>
              </div>

              <Teleport to="body">
                <div
                    v-if="dropdownOpen === 'region'"
                    class="dropdown-panel"
                    :style="dropdownStyle.region"
                    ref="regionDropdownEl"
                >
                  <div
                      class="dropdown-item"
                      v-for="region in [1, 2, 3]"
                      :key="region"
                      @click="selectRegion(region)"
                  >
                    {{ region }}級分區
                  </div>
                </div>
              </Teleport>
            </div>
          </div>

        </div>
      </div>

      <!-- 🟨 自定義頁面 -->
      <div v-else-if="currentTab === 'custom'" class="page">
        <div class="page-content-stack">
          <!-- 🎨 說明 1 -->
          <div class="page-footer">
            <small class="hint">
              🧩 您可以自由添加點、設置該點對應的特徵<br>
              🖌️ 網站會根據特徵自動分配顏色
            </small>
          </div>

          <!-- 🔐 登錄按鈕 -->
          <div class="button-row">
            <button class="enter-btn" @click="handleLogin">🔐 登錄</button>
          </div>

          <!-- 👤 說明 2 -->
          <div class="page-footer">
            <small class="hint">
              👤 您將創建的是僅屬於您的數據，故需要登錄<br>
              🤝 本站承諾：不會洩漏您的個人數據
            </small>
          </div>
        </div>

      </div>
      <LocationAndRegionInput ref="locationRef" />
      <!-- 條列說明區（居中） -->
      <div class="list-wrapper"
           v-if="currentTab === 'custom'">
        <ul class="explain-list">
          <li>請在上方填入您將添加的地點或其所屬分區</li>
          <li><strong>點擊下方按鈕</strong> 右側將彈出一個面板</li>
          <li>您需在面板中填入簡稱、分區、特徵、值</li>
          <li>“特徵”是指分析的類別，例如“流攝"</li>
          <li>“值”是顯示在地圖上的，例如“iu"</li>
          <li>點擊地圖即可自動填入經緯度</li>
        </ul>
      </div>

      <!-- 🚀 炫酷按鈕 -->
      <div class="fancy-run-container">

        <!-- 🌍 分區圖專用按鈕 -->
        <button
            v-if="currentTab === 'map'"
            id="allmap-first"
            class="allmap-first"
            @click="runAction"
            :disabled="isRunning">
          <span v-if="isRunning">🔄 運行中...</span>
          <span v-else>🌍繪圖</span>
        </button>

        <!-- 其他 tab 可以保留 fancy-run-btn（如果你要） -->
        <button
            v-if="currentTab === 'custom'"
            class="fancy-run-btn"
            @click="runAction"
            :disabled="isRunning">
          <span v-if="isRunning">🔄 運行中...</span>
          <span v-else>🚀 添加個人數據</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, nextTick, onMounted, onBeforeUnmount } from 'vue'
import LocationAndRegionInput from "@/components/query/LocationAndRegionInput.vue";
import refresh from "@/components/old/refresh.vue";
const locationRef = ref(null)
import {useRoute, useRouter} from 'vue-router'
const router = useRouter()
const route = useRoute()

const handleLogin = () => {
  router.push('/auth')
}

// 当前选中的 Tab 页
let currentTab = ref('map') // 默认选择 "簡介" 页面
const tabs = [
  { name: 'map', label: '分區圖' },
  { name: 'custom', label: '自定義繪圖' }
]
currentTab = computed(() => {
  return route.query.sub || 'map' // 默认 intro
})

const selectedRegion = ref('')
const dropdownOpen = ref(null)

const regionTriggerEl = ref(null)
const regionDropdownEl = ref(null)

const dropdownStyle = reactive({
  region: {
    top: '0px',
    left: '0px',
  }
})

const toggleDropdown = (type) => {
  dropdownOpen.value = dropdownOpen.value === type ? null : type

  nextTick(() => {
    if (type === 'region' && regionTriggerEl.value) {
      const rect = regionTriggerEl.value.getBoundingClientRect()
      dropdownStyle.region = {
        position: 'absolute',
        top: `${rect.top + rect.height + window.scrollY}px`,
        left: `${rect.left + window.scrollX}px`,
        zIndex: 99999
      }
    }
  })
}

const selectRegion = (val) => {
  selectedRegion.value = val
  dropdownOpen.value = null
}

const currentTabLabel = computed(() => {
  const found = tabs.find(t => t.name === currentTab.value)
  return found?.label ?? '執行'
})

const handleEnter = () => {
  window.location.href = window.WEB_BASE + '/detail/'
}

const isRunning = ref(false); // 控制運行中的狀態

function getLocation() {
  // console.log("loc",locationRef.value?.inputValue)
  // console.log("region",locationRef.value?.selectedValue)
  if (!locationRef.value?.selectedValue ||
      (Array.isArray(locationRef.value?.selectedValue) && locationRef.value.selectedValue.every(item => item === ''))) {
    // console.log("fuck")
    return locationRef.value?.inputValue || '廣州';
  } else {
    // console.log("bitch")
    // 如果 selectedValue 不为空，使用 inputValue（如果有）
    return locationRef.value?.inputValue ;
  }
}
const runAction = () => {
  isRunning.value = true;
  const base = {
    mode: currentTab.value,
    location: getLocation(), // 调用 getLocation 函数来获取 location
    region: locationRef.value?.selectedValue,
    region_source: locationRef.value?.regionUsing
  }

  let data = {}

  if (currentTab.value === 'map') {
    data = {
      ...base,
      level: selectedRegion.value
    }
  } else if (currentTab.value === 'custom') {
    data = {
      ...base
      // no additional fields
    }
  }

  // ✅ 打印或傳值
  // console.log('📦 傳送資料：', data)
  sessionStorage.setItem('vueToNativeData', JSON.stringify(data))

  window.location.replace(window.WEB_BASE + '/detail/');

}


// 關閉 dropdown 點外面就收起來
const onClickOutside = (event) => {
  const targets = [regionTriggerEl.value, regionDropdownEl.value]
  const isInsideAny = targets.some(el => el?.contains(event.target))
  if (!isInsideAny) {
    dropdownOpen.value = null
  }
}

onMounted(() => {
  document.addEventListener('click', onClickOutside)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', onClickOutside)
})
</script>

<!-- ✅ 你原本的 dropdown 樣式 CSS 無需改動，這裡保留 -->

<style scoped>
/* === 內容區塊 === */
.tab-content {
  width: 100%;
  max-width: 800px;
  animation: fade 0.6s ease;
  flex-direction: column;
  align-items: center;
  text-align: center;
  justify-content: center;
  padding: 1rem;
}

@keyframes fade {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ✅ Label + Dropdown 水平排列 */
.horizontal-dropdown {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 6px;
  width: 100%;
  max-width: 300px;
  margin: auto;
}

/* 🍏 Fancy 蘋果風格按鈕，大小對齊 fancy-run-btn */
.allmap-first {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(90deg, #007aff, mediumblue);
  border: none;
  border-radius: 30px; /* ✔️ same as fancy-run-btn */
  padding: 14px 28px;  /* ✔️ same as fancy-run-btn */
  font-size: 18px;     /* ✔️ same as fancy-run-btn */
  font-weight: bold;   /* ✔️ same */
  letter-spacing: 1px; /* ✔️ same */
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2), 0 6px 20px rgba(0, 0, 0, 0.19);
}

/* 懸停效果 */
.allmap-first:hover {
  background: linear-gradient(145deg, #4e5d5b, #212d2b);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3), 0 12px 32px rgba(0, 0, 0, 0.25);
  transform: translateY(-3px);
}

/* 點擊效果 */
.allmap-first:active {
  transform: translateY(2px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1), 0 4px 12px rgba(0, 0, 0, 0.15);
}
/* 🧍‍♂️ 讓按鈕單獨一行並居中 */
.button-row {
  display: flex;
  justify-content: center;
  width: 100%;
  margin-top: 12px;
}
/* 外層包裹，控制居中對齊 */
.list-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
}

/* 條列說明樣式 */
.explain-list {
  list-style-type: disc;
  padding-left: 1.5rem;
  margin:  0;
  color: #555; /* 深灰色 */
  font-size: 14px;
  line-height: 1.6;
  text-align: left;
  max-width: 360px; /* 避免太寬，保持閱讀性 */
}

.explain-list li {
  white-space: nowrap;
  margin-bottom: 4px;
}

</style>

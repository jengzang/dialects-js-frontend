<template>
  <div class="tabs-wrapper">
    <div class="tabs">
      <div
          v-for="tab in tabs"
          :key="tab.name"
          :class="['tab', { active: currentTab === tab.name }]"
          @click="currentTab = tab.name"
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
    <refresh/>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, nextTick, onMounted, onBeforeUnmount } from 'vue'
import LocationAndRegionInput from "@/components/LocationAndRegionInput.vue";
import refresh from "@/components/refresh.vue";
const locationRef = ref(null)
import { useRouter } from 'vue-router'
const router = useRouter()

const handleLogin = () => {
  router.push('/auth')
}


const currentTab = ref('map')
const tabs = [
  { name: 'map', label: '分區圖' },
  { name: 'custom', label: '自定義繪圖' }
]

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
/* === Tabs === */
.tabs-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0;
  height: 100%;
}
.tabs {
  display: flex;
  justify-content: flex-start;
  gap: 16px;
  overflow-x: auto;
  max-width: 100%;
  padding: 8px 12px;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.tabs::-webkit-scrollbar {
  display: none;
}
.tab {
  flex-shrink: 0;
  white-space: nowrap;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 500;
  border-radius: 16px;
  cursor: pointer;
  color: #444;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(4px);
  transition: all 0.5s ease;
  user-select: none;
  border: 1px solid #007aff;
}
.tab:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #007aff;
}
.tab.active {
  color: #fff;
  background: rgba(0, 122, 255, 0.7);
  backdrop-filter: blur(14px);
  box-shadow: 0 4px 20px rgba(0, 122, 255, 0.3);
}

/* === 內容區塊 === */
.tab-content {
  width: 100%;
  max-width: 600px;
  animation: fade 0.6s ease;
  flex-direction: column;
  align-items: center;
  text-align: center;
  justify-content: center;
  padding: 1rem;
}
.page {
  padding: 2dvh;
  font-size: 18px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
  max-width: 500px;
  justify-content: center;
  display: flex;
  margin: 0 auto;
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

/* === Footer 說明與按鈕 === */
.page-footer {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  margin: 0 auto;
}
.hint {
  font-size: 14px;
  color: #787878;
  white-space: nowrap;
}
.enter-btn {
  background: rgba(0, 122, 255, 0.86);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 500;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(0, 122, 255, 0.3);
  white-space: nowrap;
}
.enter-btn:hover {
  background: #005ecb;
}

/* === 炫酷執行按鈕 === */
.fancy-run-container {
  margin-top: 1.5rem;
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
}
.fancy-run-btn {
  font-size: 18px;
  font-weight: bold;
  padding: 14px 28px;
  color: white;
  background: linear-gradient(135deg, #6e00ff, #00c3ff);
  border: none;
  border-radius: 30px;
  box-shadow: 0 0 12px rgba(0, 195, 255, 0.6), 0 0 30px rgba(110, 0, 255, 0.3);
  cursor: pointer;
  transition: all 0.3s ease-in-out;
  letter-spacing: 1px;
  position: relative;
  overflow: hidden;
  white-space: nowrap;
}
.fancy-run-btn:hover {
  transform: scale(1.2);
  box-shadow: 0 0 20px rgba(0, 195, 255, 0.8), 0 0 50px rgba(110, 0, 255, 0.5);
}
.fancy-run-btn span {
  display: inline-block;
}

/* === 下拉選單樣式 === */
.dropdown-wrapper {
  flex: 1;
  position: relative;
  align-items: center;
  display: flex;
}
.dropdown {
  padding: 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  cursor: pointer;
  font-size: 14px;
  border: 1px solid rgba(200, 200, 200, 0.5);
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-width: 80px;
  margin: auto;
}

/* === 手機響應式 === */
@media (max-width: 600px) {
  .tab {
    padding: 10px 16px;
    font-size: 14px;
    border-radius: 12px;
  }
  .tabs {
    gap: 6px;
    padding: 8px 8px;
  }
  .page {
    padding: 16px;
    font-size: 16px;
  }
  .fancy-run-btn {
    font-size: 16px;
    padding: 10px 20px;
    border-radius: 24px;
  }
  .enter-btn {
    padding: 5px !important;
    font-size: 12px !important;
  }
}

/* 以下是你自定義 dropdown 样式：直接保留即可 */
.dropdown-wrapper {
  flex: 1;
  position: relative;
  align-items: center;
  display: flex;
}
.dropdown {
  padding: 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  cursor: pointer;
  font-size: 14px;
  border: 1px solid rgba(200, 200, 200, 0.5);
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-width: 80px;
  margin: auto;
}
.arrow {
  font-size: 12px;
}
.dropdown-panel {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  border-radius: 10px;
  padding: 6px 0;
  position: absolute;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  min-width: 80px;
}
.dropdown-item {
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}
.dropdown-item:hover {
  background-color: #e6f0ff;
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

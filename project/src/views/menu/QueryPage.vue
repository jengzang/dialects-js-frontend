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
      <div v-if="currentTab === 'tab1'" class="page">
        <div class="page-content-stack">
          <!-- 🔹 建議與操作區 -->
          <div class="page-footer">
            <small class="hint">查詢漢字的讀音、地位及注釋<br>想輸入多個分區❓️ 點擊👉</small>
            <button class="enter-btn" @click="handleEnter">進入網站</button>
          </div>
          <!-- 🔹 輸入框區塊 -->
          <div class="query-box">
            <label class="query-label" for="hanzi-input">請輸入待查漢字</label>
            <textarea
                id="hanzi-input"
                style="height: 5dvh"
                placeholder="可輸入一個或多個漢字"
                v-model="hanziInput"
                autocomplete="off"
            ></textarea>
          </div>
        </div>
      </div>


      <div v-else-if="currentTab === 'tab2'" class="page">
        <div class="page-content-stack">
          <!-- Footer -->
          <div class="page-footer">
            <small class="hint">中古➡️讀音•按中古地位整理讀音<br>想輸入多種地位組合❓️點擊👉</small>
            <button class="enter-btn" @click="handleEnter">進入網站</button>
          </div>

          <!-- ✅ 卡片選擇區：獨立一行 -->
          <div class="card-row">
            <div class="card-group">
              <div
                  v-for="(item, index) in cards"
                  :key="item"
                  class="card-group-item"
                  :class="{
                              active: selectedCard === item,
                              first: index === 0,
                              last: index === cards.length - 1
                            }"
                  @click="selectedCard = item"
              >
                {{ item }}
              </div>
            </div>
          </div>

          <div class="triple-select-box">


            <!-- ✅ 鍵名 + 鍵值：同一行，用容器包 -->
            <div v-for="key in keys" :key="key" class="dropdown-row">
              <!-- 中：鍵值 dropdown -->
              <div class="dropdown-wrapper">
                <!-- 鍵值下拉 -->
                <div class="dropdown" ref="valueTriggerEl" @click="toggleDropdown('value')">
                  {{ selectedValue || '請選擇鍵值' }}
                  <span class="arrow">▾</span>
                </div>
                <Teleport to="body">
                  <div
                      v-if="dropdownOpen === 'value'"
                      class="dropdown-panel"
                      :style="dropdownStyle.value"
                      ref="valueDropdownEl"
                  >
                    <div
                        class="dropdown-item"
                        v-for="value in keyValueMap[selectedKey]"
                        :key="value"
                        @click="selectValue(value)"
                    >
                      {{ value }}
                    </div>
                  </div>
                </Teleport>
              </div>

              <!-- 右：鍵名 dropdown -->
              <div class="dropdown-wrapper" style="flex: 1">
                    <button
                        :class="['key-button', { active: selectedKey.includes(key) }]"
                        @click="toggleKeySelection(key)"
                    >
                      {{ key }}
                    </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      <!-- 📤 tab3：查音位頁面 -->
      <div v-else-if="currentTab === 'tab3'" class="page">
        <div class="page-content-stack">

          <!-- Footer 區域（保留） -->
          <div class="page-footer">
            <small class="hint">讀音➡️中古•分析音位的中古來源<br>想輸入多種地位組合❓️點擊👉</small>
            <button class="enter-btn" @click="handleEnter">進入網站</button>
          </div>

          <!-- 三欄選擇區（保留結構） -->
          <div class="triple-select-box">

            <!-- ✅ 卡片選擇區（不變） -->
            <div class="card-row">
              <div class="card-group">
                <div
                    v-for="(item, index) in cards"
                    :key="item"
                    class="card-group-item"
                    :class="{
              active: selectedCard === item,
              first: index === 0,
              last: index === cards.length - 1
            }"
                    @click="selectedCard = item"
                >
                  {{ item }}
                </div>
              </div>
            </div>

            <!-- ✅ 鍵值 + 輸入框 -->
            <div class="dropdown-row">
              <!-- 🔑 tab3 鍵名 dropdown -->
              <div class="dropdown-wrapper" style="flex: 1">
                <div class="dropdown" @click="toggleDropdown('tab3Key')" ref="tab3KeyTriggerEl">
                  {{ tab3SelectedKey || '請選擇鍵名' }}
                  <span class="arrow">▾</span>
                </div>
                <Teleport to="body">
                  <div
                      v-if="dropdownOpen === 'tab3Key'"
                      class="dropdown-panel"
                      :style="dropdownStyle.tab3Key"
                      ref="tab3KeyDropdownEl"
                  >
                    <div
                        v-for="key in keys"
                        :key="key"
                        class="dropdown-item"
                        @click="selectTab3Key(key)"
                    >
                      {{ key }}
                    </div>
                  </div>
                </Teleport>
              </div>

              <!-- 🔄 輸入框 -->
              <div class="dropdown-wrapper" style="flex: 2">
                <div class="query-box">
                  <label class="query-label" for="tab3-key-input" style="font-size: 13px">請輸入待查音節</label>
                  <textarea
                      id="tab3-key-input"
                      v-model="tab3KeyInput"
                      placeholder="請輸入待查音節，例如“a”，留空則全查"
                      style="max-height: 5dvh"
                      autocomplete="off"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


      <div v-else-if="currentTab === 'tab4'" class="page">
        <div class="page-footer">
          <small class="hint">查詢各點的調類、調值<br>想輸入多個分區❓️ 點擊👉</small>
          <button class="enter-btn" @click="handleEnter">進入網站</button>
        </div>
      </div>

      <LocationAndRegionInput ref="locationRef" />

      <!-- ✅ 炫酷按鈕 -->
      <div class="fancy-run-container">
        <span class="run-label">
          {{ currentTabLabel }}👉
        </span>
        <button
            class="fancy-run-btn"
            @click="runAction"
            :disabled="isRunning">
          <span v-if="isRunning">🔄 運行中...</span>
          <span v-else>🚀 單擊運行</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import {computed, nextTick, reactive, ref, onMounted, onBeforeUnmount} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import LocationAndRegionInput from "@/components/LocationAndRegionInput.vue";
// import refresh from "@/components/old/refresh.vue";
const locationRef = ref(null)
const router = useRouter()
const route = useRoute()
// 当前选中的 Tab 页
let currentTab = ref('tab2')
const tabs = [
  { name: 'tab1', label: '查字' },
  { name: 'tab2', label: '查中古' },
  { name: 'tab3', label: '查音位' },
  { name: 'tab4', label: '查調' }
]
currentTab = computed(() => {
  return route.query.sub || 'tab2' // 默认 intro
})
const hanziInput = ref('')

const selectedCard = ref('韻母')
const selectedKey = ref(['攝']);
const selectedValue = ref('流')
const dropdownOpen = ref(null)

const cards = ['聲母', '韻母', '聲調']
const keys = Object.keys(column_values)
const keyValueMap = column_values
const tab3SelectedKey = ref(Object.keys(column_values)[0])
const tab3KeyTriggerEl = ref(null)
const tab3KeyDropdownEl = ref(null)
const valueDropdownEl = ref(null)
const keyDropdownEl = ref(null)
const valueTriggerEl = ref(null)
const keyTriggerEl = ref(null)
const tab3KeyInput = ref('')

const dropdownStyle = reactive({
  value: {
    top: '0px',
    left: '0px'
  },
  key: {
    top: '0px',
    left: '0px'
  }
})

function toggleDropdown(type) {
  dropdownOpen.value = dropdownOpen.value === type ? null : type

  nextTick(() => {
    let triggerEl = null
    if (type === 'value') triggerEl = valueTriggerEl.value
    else if (type === 'key') triggerEl = keyTriggerEl.value
    else if (type === 'tab3Key') triggerEl = tab3KeyTriggerEl.value


    if (triggerEl) {
      const rect = triggerEl.getBoundingClientRect()
      dropdownStyle[type] = {
        position: 'absolute',
        top: `${rect.top + rect.height + window.scrollY}px`,
        left: `${rect.left + window.scrollX}px`,
        zIndex: 99999
      }
    }
  })
}

function onClickOutside(event) {
  const targets = [
    keyTriggerEl.value,
    keyDropdownEl.value,
    valueTriggerEl.value,
    valueDropdownEl.value,
    tab3KeyTriggerEl.value,       // ✅ 新增
    tab3KeyDropdownEl.value       // ✅ 新增
  ]

  const isInsideAny = targets.some(el => el?.contains(event.target))
  if (!isInsideAny) {
    dropdownOpen.value = null
  }
}


function selectKey(key) {
  selectedKey.value = key
  selectedValue.value = keyValueMap[key][0]
  dropdownOpen.value = null
}
// 切换键名的选择状态
function toggleKeySelection(key) {
  if (selectedKey.value.includes(key)) {
    // 如果已经选中，则取消选中
    selectedKey.value = selectedKey.value.filter(item => item !== key);
  } else {
    // 否则选中
    selectedKey.value.push(key);
  }
}
function selectTab3Key(key) {
  tab3SelectedKey.value = key
  dropdownOpen.value = null
}

function selectValue(value, key) {
  selectedValue.value = value; // 更新选中的值
  // 你可以在这里处理选中的键值逻辑，比如提交或者其他操作
}


const currentTabLabel = computed(() => {
  const found = tabs.find(t => t.name === currentTab.value)
  return found?.label ?? '執行'
})

const isRunning = ref(false); // 控制運行中的狀態
// 點擊按鈕行為
const runAction = () => {
  isRunning.value = true;

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

  const base = {
    mode: currentTab.value,
    location: getLocation(), // 调用 getLocation 函数来获取 location
    region: locationRef.value?.selectedValue,
    region_source: locationRef.value?.regionUsing
  }

  let data = {}

  if (currentTab.value === 'tab1') {
    data = {
      ...base,
      chars: hanziInput.value|| '好'
    }
  }
  else if (currentTab.value === 'tab2') {
    data = {
      ...base,
      card: selectedCard.value,
      key: selectedKey.value,
      value: selectedValue.value
    }
  }
  else if (currentTab.value === 'tab3') {
    data = {
      ...base,
      card: selectedCard.value,
      key: tab3SelectedKey.value,
      pho: tab3KeyInput.value|| 'a'
    }
  }
  else if (currentTab.value === 'tab4') {
    data = {
      ...base,
      // no extra fields
    }
  }
  // console.log(base)
  sessionStorage.setItem('vueToNativeData', JSON.stringify(data))
  window.location.replace(window.WEB_BASE + '/detail/');

}


const handleEnter = () => {
  window.location.href = window.WEB_BASE + '/detail/'
}

onMounted(() => {
  document.addEventListener('click', onClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onClickOutside)
})

</script>

<style scoped>
.tabs-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0;
  min-height: 80dvh;
}

.tabs {
  display: flex;
  justify-content: flex-start;
  gap: 16px;
  flex-wrap: nowrap;
  overflow-x: auto;
  max-width: 100%;
  padding: 8px 12px;
  -webkit-overflow-scrolling: touch; /* ✅ 手機滑順滾動 */
  scrollbar-width: none; /* Firefox */
}

.tabs::-webkit-scrollbar {
  display: none; /* Chrome, Safari */
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

  /* ✅ 加上蘋果藍邊框（全部） */
  border: 1px solid #007AFF;
}

.tab:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #007AFF;
}

.tab.active {
  color: #fff;

  /* ✅ 選中後變成玻璃蘋果藍 */
  background: rgba(0, 122, 255, 0.7);
  backdrop-filter: blur(14px);
  box-shadow: 0 4px 20px rgba(0, 122, 255, 0.3);
}



/* 📄 內容區塊動畫 */
.tab-content {
  width: 95%;
  animation: fade 0.6s ease;

  /* ✅ 新增這些 */
  flex-direction: column;
  align-items: center;
  text-align: center;
  justify-content: center; /* 垂直置中 */
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
  justify-content: center;
  display: flex;
  margin: 0 auto;
  width: 92%;
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
/* 📱✅ 媒體查詢：手機螢幕優化 */
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
    padding: 12px;
    font-size: 16px;
  }
}

.run-label {
  font-size: 18px;
  font-weight: bold;
  color: darkblue;
  white-space: nowrap;
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


/* 📱 響應式：小螢幕按鈕變小 */
@media(max-width: 600px) {
  .fancy-run-btn {
    font-size: 16px;
    padding: 10px 20px;
    border-radius: 24px;
  }
  .enter-btn {
    padding: 5px!important;
    font-size: 12px!important;
  }
  .triple-select-box{
    flex-wrap: wrap;
  }
}

/* ✅ 整行居中（小字 + 按鈕） */
.page-footer {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  margin: 0 auto;  /* 讓這整行居中 */
}

/* 小字樣式 */
.hint {
  font-size: 14px;
  color: #787878;
  white-space: nowrap;
}

/* 蘋果藍按鈕 */
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
/* 🔹 輸入區塊樣式 */
.query-box {
  display: block;
  flex-direction: column;
  align-items: center;
  width: 100%;
  gap: 6px;
  white-space: wrap;
}

.query-label {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}
.page-content-stack {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5dvh;
  min-width: 80dvw;
}
.triple-select-box {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  row-gap: 0.6dvh;
  column-gap: 0.8dvw;
  width: 95%;
  justify-content: space-between;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: auto;
  max-height: 30dvh;

  /* 滚动条样式 */
  scrollbar-width: thin;  /* Firefox */
  scrollbar-color: rgba(0, 122, 255, 0.5) rgba(0, 0, 0, 0.1); /* Firefox */

  /* Chrome/Safari */
  ::-webkit-scrollbar {
    width: 8px;  /* 滚动条宽度 */
  }

  ::-webkit-scrollbar-thumb {
    background-color: rgba(0, 122, 255, 0.5);
    border-radius: 4px;
    border: 2px solid rgba(0, 0, 0, 0.2);  /* 添加一些边框使滚动条更美观 */
  }

  ::-webkit-scrollbar-thumb:hover {
    background-color: rgba(0, 122, 255, 0.8);  /* 滚动条 hover 状态 */
  }

  ::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);  /* 滚动条轨道 */
    border-radius: 10px;
  }
}

.card-group{
  display: flex;
  flex-direction: row; /* ⬅️ 水平排列 */
  border-radius: 12px;
  overflow: hidden;
  width: fit-content;
  max-width: 100%;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  max-height: 45px;
}

.card-group-item {
  padding: 10px 16px;
  text-align: center;
  cursor: pointer;
  font-weight: 500;
  flex: 1;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  /* 上边框是蓝色 */
  /* 下边框是蓝色 */
  /* 左边框是浅灰色 */
  /* 右边框是浅灰色 */
  border: 1px solid rgba(0, 122, 255, 0.2);
  border-right-color: rgba(200, 200, 200, 0.3);
  border-left-color: rgba(200, 200, 200, 0.3);
  transition: background 0.2s ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-group-item:hover {
  background: rgba(255, 255, 255, 0.5);
}

.card-group-item.first {
  border-radius: 12px 0 0 12px; /* ⬅️ 左圓角 */
  border-left-color: rgba(0, 122, 255, 0.2);
}

.card-group-item.last {
  border-radius: 0 12px 12px 0; /* ⬅️ 右圓角 */
  border-right-color: rgba(0, 122, 255, 0.2);
}

.card-group-item.active {
  background: rgba(0, 122, 255, 0.2);
  color: #007aff;
  font-weight: 600;
}


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
  max-height: 40dvh;
  overflow: auto;
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

.card-row {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.dropdown-row {
  display: flex;
  width: 100%;
  justify-content: center;
  white-space: nowrap;
}
/* 键名按钮样式 */
.key-button {
  padding: 8px 16px;
  border: 1px solid rgba(0, 122, 255, 0.2);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.3);
  cursor: pointer;
  transition: background 0.3s ease;
  font-size: 14px;
  margin: 5px;
}

.key-button.active {
  background: rgba(0, 122, 255, 0.5);
  color: white;
  font-weight: 600;
}

/* 键值展示样式 */
.key-value-dropdown {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-left: 20px;
}

.key-value-dropdown .dropdown-item {
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
  border-radius: 8px;
}

.key-value-dropdown .dropdown-item:hover {
  background-color: #e6f0ff;
}

/* 选中的键名显示的效果 */
.key-value-dropdown .dropdown-item.active {
  background-color: rgba(0, 122, 255, 0.2);
  color: #007aff;
}
</style>

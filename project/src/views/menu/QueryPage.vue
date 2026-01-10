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
         <!-- 三欄選擇 -->
          <div class="triple-select-box">
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

            <!-- ✅ 鍵名 + 鍵值：同一行，用容器包 -->
            <div class="dropdown-row">
                <div class="button-group">
                  <!-- 键名按钮，支持多选 -->
                  <div v-for="key in keys" :key="key" class="key-item">
                    <!-- 键名部分为按钮 -->
                    <button
                        :class="['key-button', { active: selectedKey.includes(key) }]"
                        @click="toggleKeySelection(key)"
                    >
                      {{ key }}
                    </button>
                  </div>
                </div>
              <!-- 键值部分：当键名被选中时显示对应的键值下拉框 -->
              <div class="key-dropdown-group">
                <div v-for="key in selectedKey" :key="key" class="key-value-dropdown">
                  <div class="dropdown"
                       @click="toggleDropdown('value',key)"
                       :ref="(el) => setTriggerRef(el, key)"
                  >
                    {{ getDisplayText(key) }}
                    <span class="arrow">▾</span>
                  </div>

                  <Teleport to="body">
                    <div
                        v-if="dropdownOpen === 'value' && currentActiveKey === key"
                        class="dropdown-panel"
                        :style="dropdownStyle.value"
                    >
                      <div
                          class="dropdown-item select-all-item"
                          :class="{ active: isAllSelected(key) }"
                          @click="toggleSelectAll(key)"
                      >
                        <span v-if="isAllSelected(key)">☑</span>
                        <span v-else>☐</span>
                        全選
                      </div>

                      <div style="height:1px; background:#eee; margin:2px 0;"></div>

                      <div
                          class="dropdown-item"
                          v-for="value in keyValueMap[key]"
                          :key="value"
                          :class="{ active: isSelected(value, key) }"
                          @click="selectValue(value, key)"
                      >
                        <span class="check-icon">{{ isSelected(value, key) ? '✓' : '' }}</span>
                        {{ value }}
                      </div>
                    </div>
                  </Teleport>
                <div class="key-name">
                  <strong style="color: #02469e">{{ key }}</strong>
                </div>
              </div>
              </div>
            </div>
            <ZhongguSelector
                :active-keys="selectedKey"
                :value-map="selectedValueMap"
                :is-dropdown-open="!!dropdownOpen"
                :selected-card="selectedCard"
            />
          </div>
        </div>
      </div>

      <!-- 📤 tab3：查音位頁面 -->
      <div v-else-if="currentTab === 'tab3'" class="page">
        <div class="page-content-stack">
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
                  {{ tab3SelectedKey || '請選擇分類' }}
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
      <!-- 🔹 建議與操作區 -->
      <div v-if="currentTab === 'tab1'" class="page-footer" style="margin-top: 20px">
        <small class="hint">查詢漢字的讀音、地位及注釋</small>
      </div>
      <div v-else-if="currentTab === 'tab2'" class="page-footer" style="margin-top: 20px">
        <small class="hint">中古➡️讀音•按中古地位整理讀音</small>
      </div>
      <div v-else-if="currentTab === 'tab3'" class="page-footer" style="margin-top: 20px">
        <small class="hint">讀音➡️中古•分析音位的中古來源</small>
      </div>
      <div v-else-if="currentTab === 'tab4'" class="page-footer" style="margin-top: 20px">
        <small class="hint">查詢各點的調類、調值</small>
      </div>
    </div>
  </div>
</template>

<script setup>
import {computed, nextTick, reactive, ref, onMounted, onBeforeUnmount} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import LocationAndRegionInput from "@/components/query/LocationAndRegionInput.vue";
import ZhongguSelector from "@/components/query/ZhongguSelector.vue";
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
// 用于存储每个键名对应的选中值
const selectedValueMap = ref({});

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

// 1. 新增：用来存储循环中 Trigger 元素的 Map
const triggerRefs = ref({})
// 2. 新增：用来记录当前具体打开的是哪个 key
const currentActiveKey = ref(null)
// 3. 修改：Ref 绑定函数（用于在 template 中收集 DOM）
const setTriggerRef = (el, key) => {
  if (el) {
    triggerRefs.value[key] = el
  }
}

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

function toggleDropdown(type,key=null) {
  // dropdownOpen.value = dropdownOpen.value === type ? null : type
  // 判断是否正在点击【已经打开】的那个下拉框
  const isClosing = (dropdownOpen.value === type) &&
      (key === null || currentActiveKey.value === key);

  if (isClosing) {
    // 🔽 关闭逻辑
    dropdownOpen.value = null
    currentActiveKey.value = null // 清空当前 Key
  } else {
    // 🔼 打开逻辑
    dropdownOpen.value = type

    // 🔥🔥🔥 关键点：这里进行了赋值！🔥🔥🔥
    currentActiveKey.value = key
    nextTick(() => {
      let triggerEl = null

      // if (type === 'value') triggerEl = valueTriggerEl.value
      if (type === 'value' && key) {
        triggerEl = triggerRefs.value[key]
        // console.log(`get in value:`, triggerEl);  // 检查是否能够正确访问 ref
      } else if (type === 'key') triggerEl = keyTriggerEl.value
      else if (type === 'tab3Key') {
        triggerEl = tab3KeyTriggerEl.value
        // console.log(`get in tab3`, triggerEl)
      }


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
}

function onClickOutside(event) {
  // const targets = [
  //   keyTriggerEl.value,
  //   keyDropdownEl.value,
  //   valueTriggerEl.value,
  //   valueDropdownEl.value,
  //   tab3KeyTriggerEl.value,       // ✅ 新增
  //   tab3KeyDropdownEl.value       // ✅ 新增
  // ]
  const isInsideTrigger = [
    keyTriggerEl.value,
    tab3KeyTriggerEl.value,
    // 检查动态的 triggers
    ...Object.values(triggerRefs.value)
  ].some(el => el?.contains(event.target))

  const isInsidePanel = event.target.closest('.dropdown-panel')

  if (!isInsideTrigger && !isInsidePanel) {
    dropdownOpen.value = null
    currentActiveKey.value = null
  }
  // const isInsideAny = targets.some(el => el?.contains(event.target))
  // if (!isInsideAny) {
  //   dropdownOpen.value = null
  // }
}


function selectKey(key) {
  selectedKey.value = key
  selectedValue.value = keyValueMap[key][0]
  dropdownOpen.value = null
}
// 切换键名的选择状态
function toggleKeySelection(key) {
  if (!Array.isArray(selectedKey.value)) {
    selectedKey.value = [];
  }

  if (selectedKey.value.includes(key)) {
    // 如果已经选中，则取消选中
    selectedKey.value = selectedKey.value.filter(item => item !== key);
  } else {
    // 否则选中
    selectedKey.value.push(key);
  }
}

// 选择键值时的处理
function selectValue(value, key) {
  // 确保该 key 对应的值是数组，如果之前是字符串或未定义，初始化为空数组
  if (!Array.isArray(selectedValueMap.value[key])) {
    selectedValueMap.value[key] = []
  }

  const list = selectedValueMap.value[key]
  const index = list.indexOf(value)

  if (index > -1) {
    // 存在则移除 (取消勾选)
    list.splice(index, 1)
  } else {
    // 不存在则添加 (勾选)
    list.push(value)
  }

  // ⚠️ 注意：这里不再调用 dropdownOpen.value = null，为了允许继续多选
  // selectedValueMap.value[key] = value; // 更新选中的值
  // dropdownOpen.value = null; // 关闭下拉框
}
// 2. 新增：全选/取消全选 逻辑
function toggleSelectAll(key) {
  const allOptions = keyValueMap[key] || []
  const currentSelected = selectedValueMap.value[key] || []

  // 如果当前已经全选了，则清空；否则全选
  if (currentSelected.length === allOptions.length) {
    selectedValueMap.value[key] = []
  } else {
    selectedValueMap.value[key] = [...allOptions] // 复制所有选项
  }
}

// 3. 新增：判断是否被选中 (辅助 Template 显示样式)
function isSelected(value, key) {
  const list = selectedValueMap.value[key]
  return Array.isArray(list) && list.includes(value)
}

// 4. 新增：判断是否全选 (辅助 Template 显示全选状态)
function isAllSelected(key) {
  const all = keyValueMap[key] || []
  const current = selectedValueMap.value[key] || []
  return all.length > 0 && all.length === current.length
}

// 5. 新增：格式化按钮文字 (把数组变成 "知, 徹, 澄" 这样显示)
// 修改：格式化按钮文字 (超过2个显示省略号)
function getDisplayText(key) {
  const list = selectedValueMap.value[key]
  // 1. 没选
  if (!list || list.length === 0) return `請選擇 [${key}]`
  // 2. 全选
  const allOptions = keyValueMap[key] || []
  if (allOptions.length > 0 && list.length === allOptions.length) {
    return `[${key}] 全選`
  }
  // 3. 超过两个：截取前两个 + 省略号
  if (list.length > 3) {
    return `${list.slice(0, 3).join(',')}...`
  }
  // 4. 少于等于两个：直接显示
  return list.join(',')
}

function selectTab3Key(key) {
  tab3SelectedKey.value = key
  dropdownOpen.value = null
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

/* 📄 內容區塊動畫 */
.tab-content {
  width: 100%;
  max-width: 900px;
  animation: fade 0.6s ease;

  /* ✅ 新增這些 */
  flex-direction: column;
  align-items: center;
  text-align: center;
  justify-content: center; /* 垂直置中 */
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

.run-label {
  font-size: 18px;
  font-weight: bold;
  color: darkblue;
  white-space: nowrap;
}


/* 📱 響應式：小螢幕按鈕變小 */
@media(max-width: 600px) {
  .triple-select-box{
    flex-wrap: wrap;
  }
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
}
.triple-select-box {
  display: flex;
  gap: 1.5dvw;
  width: 100%;
  justify-content: space-between;
  flex-direction: column;
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
  flex-direction: column;
  align-items: center;
}

.button-group{
  flex-wrap: wrap; /* 按钮换行 */
  display: flex;
  justify-content: center;
  border-bottom: 1px solid #013173;  /* 添加苹果蓝色调的下划线 */
}
.key-item {
  flex: 0 1 auto; /* 保证它们的大小适应内容 */
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

@media(max-width: 600px) {
  .key-button{
    padding: 6px 10px;
  }
}

.key-button.active {
  background: rgba(0, 122, 255, 0.5);
  color: white;
  font-weight: 600;
}
.key-dropdown-group{
  display: flex;
  flex-wrap: wrap;
  column-gap:30px;
}
/* 键值展示样式 */
.key-value-dropdown {
  margin-top: 10px;
  display: flex;
  flex-direction: row;
  width: 135px;
}
.key-name{
  align-self: center;
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
/* 选中状态 */
.dropdown-item.active {
  background-color: #e6f0ff; /* 浅蓝色背景 */
  color: #02469e;            /* 深蓝色文字 */
  font-weight: bold;
}

.dropdown-item:hover {
  background-color: #e6f0ff;
}

/* 全选按钮特殊样式 */
.select-all-item {
  color: #666;
  font-size: 0.9em;
  border-bottom: 1px solid #f0f0f0;
}

.check-icon {
  width: 16px; /* 占位，防止文字抖动 */
  display: inline-block;
}
</style>

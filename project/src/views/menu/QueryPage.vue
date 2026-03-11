<template>
  <TabsContainer :tabs="tabs" :default-tab="route.query.sub || 'tab2'" v-slot="{ currentTab }">
    <div class="tab-content-inner">
      <div v-show="currentTab === 'tab1'" class="page">
        <div class="page-content-stack">
          <!-- 🔹 輸入框區塊 -->
          <div class="query-box">
            <label class="query-label" for="hanzi-input">{{ $t('query.tab1.label') }}</label>
            <textarea
                id="hanzi-input"
                style="height: 5dvh"
                :placeholder="$t('query.tab1.placeholder')"
                v-model="hanziInput"
                autocomplete="off"
            ></textarea>
          </div>
        </div>
      </div>


      <div v-show="currentTab === 'tab2'" class="page">
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
                              active: tabStates.tab2.card === item,
                              first: index === 0,
                              last: index === cards.length - 1
                            }"
                    @click="tabStates.tab2.card = item"
                >
                  {{ item }}
                </div>
              </div>

                <div class="dropdown"
                     :ref="(el) => excludeFilterTriggerRef.tab2 = el"
                     @click="toggleExcludeDropdown('tab2')"
                     style="margin: 0;padding: 8px 10px;min-width: 60px;max-height:30px "
                     :class="{ disabled: buttonState.isRunning }"
                >
                  {{ getExcludeDisplayText('tab2') || $t('query.tab2.noExclude') }}
                  <span class="arrow">▾</span>
                </div>

                <Teleport to="body">
                  <div
                      v-if="excludeDropdownOpen === 'tab2'"
                      class="dropdown-panel"
                      :style="excludeDropdownStyle"
                  >
                    <div
                        class="dropdown-item"
                        v-for="option in excludeOptions"
                        :key="option.value"
                        :class="{ active: isExcludeSelected(option.value, 'tab2') }"
                        @click="toggleExcludeOption(option.value, 'tab2')"
                    >
                      <span class="check-icon">{{ isExcludeSelected(option.value, 'tab2') ? '✓' : '' }}</span>
                      {{ option.label }}
                    </div>
                  </div>
                </Teleport>

            </div>

            <!-- ✅ 鍵名 + 鍵值：同一行，用容器包 -->
            <div class="dropdown-row">
                <div class="button-group">
                  <!-- 键名按钮，支持多选 -->
                  <div v-for="key in keys" :key="key" class="key-item">
                    <!-- 键名部分为按钮 -->
                    <button
                        :class="['key-button', { active: tabStates.tab2.keys.includes(key) }]"
                        @click="toggleKeySelection(key, tabStates.tab2.keys)"
                    >
                      {{ key }}
                    </button>
                  </div>
                </div>
              <!-- 键值部分：当键名被选中时显示对应的键值下拉框 -->
              <div class="key-dropdown-group">
                <div v-for="key in tabStates.tab2.keys" :key="key" class="key-value-dropdown">
                  <div class="dropdown-wrapper"
                       :ref="(el) => setTriggerRef(el, key)"
                  >
                    <input
                        type="text"
                        :value="getInputDisplayValue(key)"
                        @input="handleDropdownInput($event, key)"
                        @focus="handleInputFocus(key)"
                        @blur="handleInputBlur(key)"
                        @click.stop
                        :placeholder="$t('query.tab3.inputPlaceholder', { key })"
                        class="dropdown-input"
                    />
                    <span class="arrow-trigger" @click.stop="toggleDropdown('value',key)">
                      <span class="arrow-icon">▼</span>
                    </span>
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
                        {{ $t('query.tab2.selectAll') }}
                      </div>

                      <div class="dropdown-divider"></div>

                      <div
                          class="dropdown-item"
                          v-for="value in getFilteredOptions(key)"
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
                  <strong class="key-name-text">{{ key }}</strong>
                </div>
              </div>
              </div>
            </div>
            <ZhongguSelector
                :active-keys="tabStates.tab2.keys"
                :value-map="tabStates.tab2.valueMap"
                :is-dropdown-open="!!dropdownOpen || excludeDropdownOpen === 'tab2'"
                :selected-card="tabStates.tab2.card"
                :exclude-columns="tabStates.tab2.excludeColumns"
                @update:runDisabled="setTabContentDisabled('query', 'tab2', $event)"
                ref="ZhongguRef"
            />
          </div>
        </div>
      </div>

      <!-- 📤 tab3：查音位頁面 -->
      <div v-show="currentTab === 'tab3'" class="page">
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
                              active: tabStates.tab3.card === item,
                              first: index === 0,
                              last: index === cards.length - 1
                            }"
                    @click="tabStates.tab3.card = item"
                >
                  {{ item }}
                </div>
              </div>

              <!-- ✨ 過濾器下拉框 -->

                <div
                    class="dropdown"
                    :ref="(el) => excludeFilterTriggerRef.tab3 = el"
                    @click="toggleExcludeDropdown('tab3')"
                    style="margin: 0;padding: 8px 10px;min-width: 60px;max-height:30px "
                    :class="{ disabled: buttonState.isRunning }"
                >
                  {{ getExcludeDisplayText('tab3') || $t('query.tab3.noExclude') }}
                  <span class="arrow">▾</span>
                </div>

                <Teleport to="body">
                  <div
                      v-if="excludeDropdownOpen === 'tab3'"
                      class="dropdown-panel"
                      :style="excludeDropdownStyle"
                  >

                    <div
                        class="dropdown-item"
                        v-for="option in excludeOptions"
                        :key="option.value"
                        :class="{ active: isExcludeSelected(option.value, 'tab3') }"
                        @click="toggleExcludeOption(option.value, 'tab3')"
                    >
                      <span class="check-icon">{{ isExcludeSelected(option.value, 'tab3') ? '✓' : '' }}</span>
                      {{ option.label }}
                    </div>
                  </div>
                </Teleport>

            </div>

            <div class="dropdown-row">
              <div class="button-group">
                <!-- 键名按钮，支持多选 -->
                <div v-for="key in keys" :key="key" class="key-item">
                  <!-- 键名部分为按钮 -->
                  <button
                      :class="['key-button', { active: tabStates.tab3.keys.includes(key) }]"
                      @click="toggleKeySelection(key, tabStates.tab3.keys)"
                  >
                    {{ key }}
                  </button>
                </div>
              </div>

              <div class="info-text" style="margin: 15px 0">
                <span class="info-icon">ℹ️</span>
                <span>{{ $t('query.tab3.analysisText', { card: tabStates.tab3.card, keys: selectedKeysString }) }}</span>
              </div>
              <!-- 🔄 輸入框 -->
              <YinweiSelector
                  ref="YinweiSelectorRef"
                  :locationRef="locationRef"
                  @update:runDisabled="setTabContentDisabled('query', 'tab3', $event)"
              />
            </div>
          </div>
        </div>
      </div>


      <LocationAndRegionInput
          ref="locationRef"
          @update:runDisabled="uiStore.buttonStates.query.isLocationDisabled = $event"
          v-model="locationModel"
          :limitContext="locationLimitContext"
      />

      <!-- ✅ 炫酷按鈕 -->
      <div class="run-container">
        <button
            class="run-btn"
            @click="runAction"
            :disabled="buttonState.isRunning || isRunDisabled"
            :class="{ disabled: isRunDisabled }"
        >
          <span v-if="buttonState.isRunning">{{ $t('query.button.running') }}</span>
          <span v-else-if="isRunDisabled">{{ $t('query.button.invalid') }}</span>
          <span v-else>{{ $t('query.button.run') }}</span>
        </button>
      </div>
      <!-- 🔹 建議與操作區 -->
      <div v-if="currentTab === 'tab1'" class="page-footer" style="margin-top: 20px">
        <small class="hint">{{ $t('query.tab1.description') }}</small>
      </div>
      <div v-else-if="currentTab === 'tab2'" class="page-footer" style="margin-top: 20px">
        <small class="hint">{{ $t('query.tab2.description') }}</small>
      </div>
      <div v-else-if="currentTab === 'tab3'" class="page-footer" style="margin-top: 20px">
        <small class="hint">{{ $t('query.tab3.description') }}</small>
      </div>
      <div v-else-if="currentTab === 'tab4'" class="page-footer" style="margin-top: 20px">
        <small class="hint">{{ $t('query.tab4.description') }}</small>
      </div>
    </div>
    <FloatingDice
        :current-tab="currentTab"
        @applyConfig="handleApplyConfig"
    />
  </TabsContainer>
</template>

<script setup>
import {computed, nextTick, reactive, ref, onMounted, onBeforeUnmount, watch} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import { useI18n } from 'vue-i18n'
import TabsContainer from "@/components/common/TabsContainer.vue";
import LocationAndRegionInput from "@/components/query/LocationAndRegionInput.vue";
import ZhongguSelector from "@/components/query/ZhongguSelector.vue";
import YinweiSelector from "@/components/query/YinweiSelector.vue";
import FloatingDice from "@/components/query/FloatingDice.vue";
import { globalPayload, queryStore, uiStore, isQueryButtonDisabled, setRunning, setTabContentDisabled } from '@/store/store.js'
import { column_values, S2T_T2S_MAPPING } from '@/config'

const { t } = useI18n()

const locationRef = ref(null)
const router = useRouter()
const route = useRoute()
const currentTab = computed(() => route.query.sub || 'tab2')
const tabs = [
  { name: 'tab1', label: t('query.tab1.title') },
  { name: 'tab2', label: t('query.tab2.title') },
  { name: 'tab3', label: t('query.tab3.title') },
  { name: 'tab4', label: t('query.tab4.title') }
]

// Compute limit context based on current tab
const locationLimitContext = computed(() => {
  return currentTab.value  // 'tab1', 'tab2', 'tab3', or 'tab4'
})

const hanziInput = ref('')

// const selectedCard = ref('韻母')
// const selectedKey = ref(['攝']);
// const selectedValue = ref('流')
// const selectedValueMap = ref({});

const dropdownOpen = ref(null)

// ✨ 過濾器相關狀態
const excludeOptions = [
  { value: '多地位標記', label: t('query.tab2.excludeOptions.allMulti') },
  { value: '多等', label: t('query.tab2.excludeOptions.excludeMultiGrade') },
  { value: '多韻', label: t('query.tab2.excludeOptions.excludeMultiRime') },
  { value: '多聲母', label: t('query.tab2.excludeOptions.excludeMultiInitial') },
  { value: '多調', label: t('query.tab2.excludeOptions.excludeMultiTone') }
]
const excludeFilterTriggerRef = reactive({ tab2: null, tab3: null })
const excludeDropdownOpen = ref(null) // 'tab2' 或 'tab3' 或 null
const excludeDropdownStyle = ref({
  position: 'absolute',
  top: '0px',
  left: '0px',
  zIndex: 99999
})

const tabStates = reactive({
  tab2: {
    card: t('query.tab2.cards.initial'),
    keys: [t('query.tab2.cards.rime')],
    valueMap: {}, // Tab2 专用的下拉菜单选择值
    excludeColumns: [] // ✨ 新增：多音字过滤选项
  },
  tab3: {
    card: t('query.tab3.cards.final'),
    keys: [t('query.tab2.cards.rime')], // Tab3 专用的键名
    excludeColumns: [] // ✨ 新增：多音字过滤选项
    // Tab3 没有 valueMap 下拉框，如果有也放在这
  }
})

const cards = [t('query.tab3.cards.initial'), t('query.tab3.cards.final'), t('query.tab3.cards.tone')]
const keys = Object.keys(column_values)
const keyValueMap = column_values
const tab3KeyTriggerEl = ref(null)
// const tab3KeyInput = ref('')
// const tab3SelectedKey = ref(Object.keys(column_values)[0])
// const tab3KeyDropdownEl = ref(null)
// const valueDropdownEl = ref(null)
// const keyDropdownEl = ref(null)
// const valueTriggerEl = ref(null)
const keyTriggerEl = ref(null)
const YinweiSelectorRef = ref(null);

// 1️⃣ 使用 uiStore 中的按钮状态（不再定义本地状态）
// 直接从 store 获取状态引用
const buttonState = uiStore.buttonStates.query

// 2️⃣ 监听 Tab 1 的输入框内容 (因为它没有子组件 emit 事件，需要手动监听)
watch(hanziInput, (newVal) => {
  // 如果为空或只有空白，则禁用
  setTabContentDisabled('query', 'tab1', !newVal || newVal.trim() === '')
}, { immediate: true })

// 3️⃣ 同步当前 Tab 到 store
watch(currentTab, (newTab) => {
  uiStore.currentSubTab.query = newTab
}, { immediate: true })

// 4️⃣ 🔥 最终计算属性：控制按钮是否禁用（使用 store 的 computed helper）
const isRunDisabled = isQueryButtonDisabled


// 1. 新增：用来存储循环中 Trigger 元素的 Map
const triggerRefs = ref({})
// 2. 新增：用来记录当前具体打开的是哪个 key
const currentActiveKey = ref(null)
// 3. 新增：存储每个 key 的输入值
const dropdownInputs = ref({})
// 4. 新增：存储每个 key 是否正在编辑
const isEditing = ref({})
// 5. 修改：Ref 绑定函数（用于在 template 中收集 DOM）
const setTriggerRef = (el, key) => {
  if (el) {
    triggerRefs.value[key] = el
  }
}

// 监听 keys 变化，初始化输入框
watch(() => tabStates.tab2.keys, (newKeys) => {
  newKeys.forEach(key => {
    if (!(key in dropdownInputs.value)) {
      dropdownInputs.value[key] = ''
    }
    if (!(key in isEditing.value)) {
      isEditing.value[key] = false
    }
  })
}, { immediate: true, deep: true })

// 获取输入框显示的值
function getInputDisplayValue(key) {
  // 如果正在编辑，显示用户输入的内容
  if (isEditing.value[key]) {
    return dropdownInputs.value[key] || ''
  }
  // 如果不在编辑，显示已选中的内容
  return getDisplayText(key)
}

// 处理输入框获得焦点
function handleInputFocus(key) {
  isEditing.value[key] = true
  dropdownInputs.value[key] = ''
}

// 处理输入框失去焦点
function handleInputBlur(key) {
  // 延迟执行，避免点击下拉选项时立即触发
  setTimeout(() => {
    isEditing.value[key] = false
    dropdownInputs.value[key] = ''
  }, 200)
}


// 处理输入框输入
function handleDropdownInput(event, key) {
  const inputValue = event.target.value
  dropdownInputs.value[key] = inputValue

  // 有输入时自动打开下拉框显示过滤后的选项
  if (inputValue.trim()) {
    if (dropdownOpen.value !== 'value' || currentActiveKey.value !== key) {
      toggleDropdown('value', key)
    }
  } else {
    // 输入为空时关闭下拉框
    if (dropdownOpen.value === 'value' && currentActiveKey.value === key) {
      dropdownOpen.value = null
      currentActiveKey.value = null
    }
  }
}

// 获取过滤后的选项
function getFilteredOptions(key) {
  const rawInput = (dropdownInputs.value[key] || '').trim();
  const allOptions = keyValueMap[key] || [];

  if (!rawInput) return allOptions;

  // 將輸入字串拆解，並嘗試尋找每個字的對應字
  // 例如輸入「齐」，transformedInput 會變成 「齊」
  const transformedInput = rawInput.split('').map(char => {
    return S2T_T2S_MAPPING[char] || char;
  }).join('');

  // 執行過濾：原樣匹配 OR 轉換後匹配
  return allOptions.filter(opt => {
    return opt.includes(rawInput) || opt.includes(transformedInput);
  });
}

const locationModel = ref({
  locations: [],
  regions: [],
  regionUsing: 'map'
})

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
  const isInsideTrigger = [
    keyTriggerEl.value,
    tab3KeyTriggerEl.value,
    // 检查动态的 triggers
    ...Object.values(triggerRefs.value),
    // ✨ 检查过滤器 triggers
    excludeFilterTriggerRef.tab2,
    excludeFilterTriggerRef.tab3
  ].some(el => el?.contains(event.target))

  const isInsidePanel = event.target.closest('.dropdown-panel')

  if (!isInsideTrigger && !isInsidePanel) {
    dropdownOpen.value = null
    currentActiveKey.value = null
    excludeDropdownOpen.value = null // ✨ 关闭过滤器下拉框
  }
}

// 切换键名的选择状态
function toggleKeySelection(key, targetList) {
  // 定义有选择限制的键值及其最大选择数量
  const restrictedKeys = {
    '攝': 1,
    '韻': 1,
    '系': 1,
    '組': 1,
    '母': 1,
    '入': 1,
    '調': 1
  };

  if (!Array.isArray(targetList)) return;

  const currentLimit = restrictedKeys[key];

  if (currentLimit) {
    if (targetList.includes(key)) {
      // 移除
      const idx = targetList.indexOf(key);
      if (idx > -1) targetList.splice(idx, 1);
    } else {
      // 互斥逻辑：先处理排他
      // 注意：reactive 数组最好用 splice 修改，或者 push/filter 组合
      // 这里创建一个临时数组处理逻辑
      let newList = [...targetList];

      if (key === '系' || key === '組' || key === '母') {
        newList = newList.filter(item => !['系', '組', '母'].includes(item));
      }
      if (key === '攝' || key === '韻') {
        newList = newList.filter(item => !['攝', '韻'].includes(item));
      }
      if (key === '入' || key === '調') {
        newList = newList.filter(item => !['入', '調'].includes(item));
      }
      // 添加当前
      newList.push(key);

      // 将结果写回 reactive 数组 (清空旧的，推入新的)
      targetList.length = 0;
      targetList.push(...newList);
    }
  } else {
    // 普通多选
    const idx = targetList.indexOf(key);
    if (idx > -1) {
      targetList.splice(idx, 1);
    } else {
      targetList.push(key);
    }
  }
}


// 选择键值时的处理
function selectValue(value, key) {
  // 确保该 key 对应的值是数组，如果之前是字符串或未定义，初始化为空数组
  if (!Array.isArray(tabStates.tab2.valueMap[key])) {
    tabStates.tab2.valueMap[key] = []
  }

  const list = tabStates.tab2.valueMap[key]
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
  const currentSelected = tabStates.tab2.valueMap[key] || []

  // 如果当前已经全选了，则清空；否则全选
  if (currentSelected.length === allOptions.length) {
    tabStates.tab2.valueMap[key] = []
  } else {
    tabStates.tab2.valueMap[key] = [...allOptions]
  }
}

// 3. 新增：判断是否被选中 (辅助 Template 显示样式)
function isSelected(value, key) {
  const list = tabStates.tab2.valueMap[key]
  return Array.isArray(list) && list.includes(value)
}

// 4. 新增：判断是否全选 (辅助 Template 显示全选状态)
function isAllSelected(key) {
  const all = keyValueMap[key] || []
  const current = tabStates.tab2.valueMap[key] || []
  return all.length > 0 && all.length === current.length
}

// 5. 新增：格式化选中的文字（显示在输入框内）
// 修改：格式化按钮文字 (超过2个显示省略号)
function getDisplayText(key) {
  const list = tabStates.tab2.valueMap[key]
  // 1. 没选 - 返回空字符串，让 placeholder 显示
  if (!list || list.length === 0) return ''
  // 2. 全选
  const allOptions = keyValueMap[key] || []
  if (allOptions.length > 0 && list.length === allOptions.length) {
    return t('query.tab2.selectAll')
  }
  // 3. 超过三个：截取前三个 + 省略号
  if (list.length > 3) {
    return `${list.slice(0, 3).join(', ')}...`
  }
  // 4. 少于等于三个：直接显示
  return list.join(', ')
}

// ✨ 過濾器相關函數
// 獲取過濾器顯示文本
function getExcludeDisplayText(tab) {
  const list = tabStates[tab]?.excludeColumns || []
  if (list.length === 0) return ''

  // ✨ 新增：将 value 转换为 label
  const labels = list.map(value => {
    const option = excludeOptions.find(opt => opt.value === value)
    return option ? option.label : value  // 找不到就用原值
  })

  if (labels.length > 2) {
    return `${labels.slice(0, 1).join(', ')}...`
  }
  return labels.join(', ')
}



// 判斷單項是否選中
function isExcludeSelected(value, tab) {
  const list = tabStates[tab]?.excludeColumns || []
  return list.includes(value)
}

// 切換過濾器下拉框
function toggleExcludeDropdown(tab) {
  if (buttonState.isRunning) return

  if (excludeDropdownOpen.value === tab) {
    excludeDropdownOpen.value = null
  } else {
    excludeDropdownOpen.value = tab
    nextTick(() => {
      const triggerEl = excludeFilterTriggerRef[tab]
      if (triggerEl) {
        const rect = triggerEl.getBoundingClientRect()
        excludeDropdownStyle.value = {
          position: 'absolute',
          top: `${rect.top + rect.height + window.scrollY}px`,
          left: `${rect.left + window.scrollX}px`,
          zIndex: 99999
        }
      }
    })
  }
}

// 切換單個選項
function toggleExcludeOption(value, tab) {
  const list = tabStates[tab].excludeColumns
  const index = list.indexOf(value)

  if (index > -1) {
    list.splice(index, 1)
  } else {
    list.push(value)
  }
}

// isRunning 状态已移至 uiStore，不再需要本地定义
const ZhongguRef = ref(null);
// 點擊按鈕行為
const runAction = async () => {
  setRunning('query', true);

  // 1. 獲取地點邏輯 (保持不變)
  function getLocation() {
    if (!locationRef.value?.selectedValue ||
        (Array.isArray(locationRef.value?.selectedValue) && locationRef.value.selectedValue.every(item => item === ''))) {
      // 如果沒有選區域，或者區域是空的，回傳輸入框的值 (預設 '廣州')
      return locationRef.value?.allLocationsString || t('query.tab3.defaultLocation');
    } else {
      // 否則回傳輸入框的值 (這裡邏輯可能視你具體需求微調，目前保持原樣)
      return locationRef.value?.allLocationsString;
    }
  }

  // 2. 準備基礎參數
  // 注意：API 接受的是 Array (List)，前端可能是 String，這裡要做轉換
  const locationVal = getLocation();
  const locationList = locationVal ? [locationVal] : []; // 轉成 List

  const regionVal = locationRef.value?.selectedValue;
  // 如果 regionVal 是 array 就直接用，如果是字串就轉 array，如果是 null 就空 array
  const regionList = Array.isArray(regionVal) ? regionVal : (regionVal ? [regionVal] : []);
  queryStore.locations = locationList;
  queryStore.regions = regionList;
  // 3. 構建 payload
  let payload = {};

  if (currentTab.value === 'tab2') {

    // 假設 selectedCard.value 是一個字串，後端 features 需要 List
    const featureList = tabStates.tab2.card ? [tabStates.tab2.card] : [t('query.tab3.cards.final')];

    // 這裡對應後端的 path_strings
    const pathStrings = ZhongguRef.value?.combinations || [];
    payload = {
      // 第一部分：查字參數
      path_strings: pathStrings,
      column: [],            // 目前前端沒提供，預設空
      combine_query: false,  // 目前前端沒提供，預設 false

      // 第二部分：分析參數
      locations: locationList,
      regions: regionList,
      features: featureList,
      region_mode: locationRef.value?.regionUsing || 'yindian'
    };
    // 1. 准备要发送的数据
    const finalPayload = {
      ...payload,           // 原本的数据 (path_strings, locations 等)
      _sourceTab: 'tab2',    // 👈 手动加上当前的 Tab 标记
      exclude_columns: tabStates.tab2.excludeColumns  // ✨ 新增
    }

    // 2. 存入全局仓库
    globalPayload.value = JSON.parse(JSON.stringify(finalPayload))
  }

  else if (currentTab.value === 'tab3') {
    const featureList = tabStates.tab3.card ? [tabStates.tab3.card] : [t('query.tab3.cards.final')];
    const selectedKeys = selectedKeysString.value.replace(/·/g, '');
    const phos = YinweiSelectorRef.value.tab3KeyInput;

    payload = {
      group_inputs: selectedKeys,
      pho_values: phos,
      locations: locationList,
      regions: regionList,
      features: featureList,
      region_mode: locationRef.value?.regionUsing || 'yindian',
    };

    // 1. 准备要发送的数据
    const finalPayload = {
      ...payload,           // 原本的数据 (path_strings, locations 等)
      _sourceTab: 'tab3',    // 👈 手动加上当前的 Tab 标记
      exclude_columns: tabStates.tab3.excludeColumns  // ✨ 新增
    }

    // 2. 存入全局仓库
    globalPayload.value = JSON.parse(JSON.stringify(finalPayload))
  }
  else if  (currentTab.value === 'tab1'){
    const chars = hanziInput.value;
    payload = {
      chars: chars,
      locations: locationList,
      regions: regionList,
      region_mode: locationRef.value?.regionUsing || 'yindian',
    };

    // 1. 准备要发送的数据
    const finalPayload = {
      ...payload,           // 原本的数据 (path_strings, locations 等)
      _sourceTab: 'tab1'    // 👈 手动加上当前的 Tab 标记
    }

    // 2. 存入全局仓库
    globalPayload.value = JSON.parse(JSON.stringify(finalPayload))
  }
  else if  (currentTab.value === 'tab4'){
    payload = {
      locations: locationList,
      regions: regionList,
      region_mode: locationRef.value?.regionUsing || 'yindian',
    };

    // 1. 准备要发送的数据
    const finalPayload = {
      ...payload,           // 原本的数据 (path_strings, locations 等)
      _sourceTab: 'tab4'    // 👈 手动加上当前的 Tab 标记
    }

    // 2. 存入全局仓库
    globalPayload.value = JSON.parse(JSON.stringify(finalPayload))
  }
  // 3. 纯净跳转
  await router.replace({
    path: '/menu',
    query: { tab: 'result' }
  });
  setRunning('query', false); // 請求結束，關閉 loading 狀態
}


const selectedKeysString = computed(() => {
  // 方案 A：按点击顺序显示 (如果先点B再点A，显示 "B·A")
  return tabStates.tab3.keys.join('·')

  // 方案 B：按原列表顺序显示 (即使先点B再点A，依然显示 "A·B")
  // 假设 `keys` 是你定义所有按钮顺序的那个常量数组
  // return keys.filter(k => selectedKey.value.includes(k)).join('·')
})

function handleApplyConfig(data) {
  const tab = currentTab.value
  // 1. 更新卡片 (聲/韻/調)
  if (tab === 'tab2') {
    tabStates.tab2.card = data.card
  }
  else {
    tabStates.tab3.card = data.card
  }

  // 2. 更新地點
  locationModel.value = {
    locations: data.loc.locations,
    regions: data.loc.regions,
    regionUsing: data.loc.regionUsing
  }
  // 3. 更新鍵名 (Keys)
  if (tab === 'tab2') {
    tabStates.tab2.keys = data.keys
  }
  else {
    tabStates.tab3.keys = data.keys
  }

  // 4. 根據 Tab 更新具體的值
  if (data.isTab3) {
    // Tab3: 更新 YinweiSelector 組件的輸入框
    if (YinweiSelectorRef.value) {
      YinweiSelectorRef.value.tab3KeyInput = data.tab3InputValue
    }
  } else {
    // Tab2: 更新下拉菜單映射
    tabStates.tab2.valueMap = data.valuesMap
  }
}

onMounted(() => {
  document.addEventListener('click', onClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onClickOutside)
})
</script>

<script>
export default {
  name: 'QueryPage' // 👈 必须加这个名字，KeepAlive 才能认出它
}
</script>

<style scoped>

/* 📄 內容區塊動畫 */
.tab-content-inner {
  width: 100%;
  max-width: 900px;
  animation: fade 0.6s ease;

  /* ✅ 新增這些 */
  flex-direction: column;
  align-items: center;
  text-align: center;
  justify-content: center; /* 垂直置中 */
  padding: 1rem 0;
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
  box-shadow: var(--shadow-md);
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
  border: 1px solid var(--color-primary-medium);
  border-right-color: var(--border-gray-medium);
  border-left-color: var(--border-gray-medium);
  transition: background 0.2s ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-group-item:hover {
  background: var(--glass-medium);
}

.card-group-item.first {
  border-radius: 12px 0 0 12px; /* ⬅️ 左圓角 */
  border-left-color: var(--color-primary-medium);
}

.card-group-item.last {
  border-radius: 0 12px 12px 0; /* ⬅️ 右圓角 */
  border-right-color: var(--color-primary-medium);
}

.card-group-item.active {
  background: var(--color-primary-medium);
  color: var(--color-primary);
  font-weight: 600;
}

.card-row {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap; /* ✨ 支持自动换行 */
}
@media (max-aspect-ratio: 1/1) {
  .card-row{
    gap:0;
  }
  .card-group-item{
    padding:12px 12px;
  }
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
  border-bottom: 1px solid var(--color-blue-dark);  /* 添加苹果蓝色调的下划线 */
}
.key-item {
  flex: 0 1 auto; /* 保证它们的大小适应内容 */
}
/* 键名按钮样式 */
.key-button {
  padding: 8px 16px;
  border: 1px solid var(--color-primary-medium);
  border-radius: 12px;
  background: var(--glass-light);
  cursor: pointer;
  transition: background 0.3s ease;
  font-size: 14px;
  margin: 5px;
}

@media(max-width: 600px) {
  .key-button{
    padding: 8px 10px;
    margin: 3px;
  }
}

.key-button.active {
  background: var(--color-primary-medium2);
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
  background-color: var(--color-blue-very-light);
}

/* 选中的键名显示的效果 */
.key-value-dropdown .dropdown-item.active {
  background-color: var(--color-primary-medium);
  color: var(--color-primary);
}

/* 下拉菜单分割线 */
.dropdown-divider {
  height: 1px;
  background: var(--border-divider);
  margin: 2px 0;
}

/* 键名文字颜色 */
.key-name-text {
  color: var(--color-blue-custom);
}

/* 下拉框包装器 */
.dropdown-wrapper {
  display: flex;
  align-items: stretch;
  border: 1px solid var(--color-primary-medium);
  border-radius: 8px;
  overflow: hidden;
  background: var(--glass-light);
}

/* 输入框样式 */
.dropdown-input {
  flex: 1;
  border: none;
  outline: none;
  padding: 8px 0px;
  font-size: 14px;
  background: transparent;
  width: 80px;
  color: #333;
  text-align: center;
}

.dropdown-input::placeholder {
  color: #6a6a6a;
  font-size: 12px;
  text-align: center;
}

/* 箭头触发区域 */
.arrow-trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: var(--color-primary-medium);
  border-left: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.2s ease;
  user-select: none;
  min-width: 36px;
  max-width: 36px;
}

.arrow-trigger:hover {
  background: var(--color-primary-medium2);
}

.arrow-trigger:active {
  transform: scale(0.95);
}

.arrow-icon {
  font-size: 14px;
  color: white;
  font-weight: bold;
}

/* 全选按钮特殊样式 */
.select-all-item {
  color: var(--text-tertiary);
  font-size: 0.9em;
  border-bottom: 1px solid #f0f0f0;
}

.check-icon {
  width: 16px;
  display: inline-block;
}

/* Dropdown 样式 */
.dropdown-panel {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 10px;
  padding: 6px 0;
  position: absolute;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  min-width: 80px;
  max-height: 40dvh;
  overflow: auto;
  z-index: 1000;
}

.dropdown-item {
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.dropdown-item.active {
  background-color: #e6f0ff;
  color: #02469e;
  font-weight: bold;
}

.dropdown-item:hover {
  background-color: #e6f0ff;
}

/* Dropdown 触发器样式（用于 tab2/tab3 的"不排除"下拉框） */
.dropdown {
  padding: 6px 12px;
  border-radius: var(--radius-md);
  background: var(--glass-light);
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
  transition: all 0.2s;
  white-space: nowrap;
}

.dropdown:hover {
  background: var(--glass-medium);
  border-color: var(--color-primary);
}


</style>

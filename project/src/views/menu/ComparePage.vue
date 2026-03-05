<template>
  <TabsContainer :tabs="tabs" :default-tab="route.query.sub || 'tab2'" v-slot="{ currentTab }">
    <div class="tab-content-inner">
      <!-- Tab1: 比較漢字 -->
      <div v-show="currentTab === 'tab1'" class="page">
        <div class="page-content-stack">
          <!-- 組1 輸入 -->
          <div class="compare-group">
            <div class="group-label">組1</div>
            <div class="query-box">
              <label class="query-label">請輸入漢字</label>
              <textarea
                  style="height: 5dvh"
                  placeholder="可輸入一個或多個漢字，用逗號分隔"
                  v-model="tabStates.tab1.group1.chars"
                  autocomplete="off"
              ></textarea>
            </div>
          </div>

          <!-- VS 分隔符 -->
          <div class="vs-divider">
            <div class="vs-line"></div>
            <div class="vs-badge">⚡ VS ⚡</div>
            <div class="vs-line"></div>
          </div>

          <!-- 組2 輸入 -->
          <div class="compare-group">
            <div class="group-label">組2</div>
            <div class="query-box">
              <label class="query-label">請輸入漢字</label>
              <textarea
                  style="height: 5dvh"
                  placeholder="可輸入一個或多個漢字，用逗號分隔"
                  v-model="tabStates.tab1.group2.chars"
                  autocomplete="off"
              ></textarea>
            </div>
          </div>

          <!-- 特徵選擇 -->
          <div class="feature-selection">
            <label class="feature-label">選擇比較特徵：</label>
            <div class="feature-checkboxes">
              <label class="checkbox-item">
                <input type="checkbox" value="聲母" v-model="tabStates.tab1.features" />
                <span>聲母</span>
              </label>
              <label class="checkbox-item">
                <input type="checkbox" value="韻母" v-model="tabStates.tab1.features" />
                <span>韻母</span>
              </label>
              <label class="checkbox-item">
                <input type="checkbox" value="聲調" v-model="tabStates.tab1.features" />
                <span>聲調</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab2: 比較中古 -->
      <div v-show="currentTab === 'tab2'" class="page">
        <div class="page-content-stack">
          <!-- 組1 中古選擇器 -->
          <div class="compare-group">
            <div class="group-label">組1：中古音條件</div>
            <div class="triple-select-box">
              <!-- 卡片選擇區 -->
              <div class="card-row">
                <div class="card-group">
                  <div
                      v-for="(item, index) in cards"
                      :key="item"
                      class="card-group-item"
                      :class="{
                        active: tabStates.tab2.group1.card === item,
                        first: index === 0,
                        last: index === cards.length - 1
                      }"
                      @click="tabStates.tab2.group1.card = item"
                  >
                    {{ item }}
                  </div>
                </div>

                <div class="dropdown"
                     :ref="(el) => excludeFilterTriggerRef.tab2_group1 = el"
                     @click="toggleExcludeDropdown('tab2', 'group1')"
                     style="margin: 0;padding: 8px 10px;min-width: 60px;max-height:30px"
                     :class="{ disabled: buttonState.isRunning }"
                >
                  {{ getExcludeDisplayText('tab2', 'group1') || '不排除' }}
                  <span class="arrow">▾</span>
                </div>

                <Teleport to="body">
                  <div
                      v-if="excludeDropdownOpen === 'tab2_group1'"
                      class="dropdown-panel"
                      :style="excludeDropdownStyle"
                  >
                    <div
                        class="dropdown-item"
                        v-for="option in excludeOptions"
                        :key="option.value"
                        :class="{ active: isExcludeSelected(option.value, 'tab2', 'group1') }"
                        @click="toggleExcludeOption(option.value, 'tab2', 'group1')"
                    >
                      <span class="check-icon">{{ isExcludeSelected(option.value, 'tab2', 'group1') ? '✓' : '' }}</span>
                      {{ option.label }}
                    </div>
                  </div>
                </Teleport>
              </div>

              <!-- 鍵名 + 鍵值 -->
              <div class="dropdown-row">
                <div class="button-group">
                  <div v-for="key in keys" :key="key" class="key-item">
                    <button
                        :class="['key-button', { active: tabStates.tab2.group1.keys.includes(key) }]"
                        @click="toggleKeySelection(key, tabStates.tab2.group1.keys)"
                    >
                      {{ key }}
                    </button>
                  </div>
                </div>
                <div class="key-dropdown-group">
                  <div v-for="key in tabStates.tab2.group1.keys" :key="key" class="key-value-dropdown">
                    <div class="dropdown-wrapper"
                         :ref="(el) => setTriggerRef(el, key + '_group1')"
                    >
                      <input
                          type="text"
                          :value="getInputDisplayValue(key + '_group1')"
                          @input="handleDropdownInput($event, key + '_group1')"
                          @focus="handleInputFocus(key + '_group1')"
                          @blur="handleInputBlur(key + '_group1')"
                          @click.stop
                          :placeholder="`輸/選 [${key}]`"
                          class="dropdown-input"
                      />
                      <span class="arrow-trigger" @click.stop="toggleDropdown('value', key + '_group1')">
                        <span class="arrow-icon">▼</span>
                      </span>
                    </div>

                    <Teleport to="body">
                      <div
                          v-if="dropdownOpen === 'value' && currentActiveKey === key + '_group1'"
                          class="dropdown-panel"
                          :style="dropdownStyle.value"
                      >
                        <div
                            class="dropdown-item select-all-item"
                            :class="{ active: isAllSelected(key, 'group1') }"
                            @click="toggleSelectAll(key, 'group1')"
                        >
                          <span v-if="isAllSelected(key, 'group1')">☑</span>
                          <span v-else>☐</span>
                          全選
                        </div>

                        <div class="dropdown-divider"></div>

                        <div
                            class="dropdown-item"
                            v-for="value in getFilteredOptions(key + '_group1')"
                            :key="value"
                            :class="{ active: isSelected(value, key, 'group1') }"
                            @click="selectValue(value, key, 'group1')"
                        >
                          <span class="check-icon">{{ isSelected(value, key, 'group1') ? '✓' : '' }}</span>
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
                  :active-keys="tabStates.tab2.group1.keys"
                  :value-map="tabStates.tab2.group1.valueMap"
                  :is-dropdown-open="!!dropdownOpen || excludeDropdownOpen === 'tab2_group1'"
                  :selected-card="tabStates.tab2.group1.card"
                  :exclude-columns="tabStates.tab2.group1.excludeColumns"
                  @update:runDisabled="tab2Group1Disabled = $event"
                  ref="ZhongguRef1"
              />
            </div>
          </div>

          <!-- VS 分隔符 -->
          <div class="vs-divider">
            <div class="vs-line"></div>
            <div class="vs-badge">⚡ VS ⚡</div>
            <div class="vs-line"></div>
          </div>

          <!-- 組2 中古選擇器 -->
          <div class="compare-group">
            <div class="group-label">組2：中古音條件</div>
            <div class="triple-select-box">
              <!-- 卡片選擇區 -->
              <div class="card-row">
                <div class="card-group">
                  <div
                      v-for="(item, index) in cards"
                      :key="item"
                      class="card-group-item"
                      :class="{
                        active: tabStates.tab2.group2.card === item,
                        first: index === 0,
                        last: index === cards.length - 1
                      }"
                      @click="tabStates.tab2.group2.card = item"
                  >
                    {{ item }}
                  </div>
                </div>

                <div class="dropdown"
                     :ref="(el) => excludeFilterTriggerRef.tab2_group2 = el"
                     @click="toggleExcludeDropdown('tab2', 'group2')"
                     style="margin: 0;padding: 8px 10px;min-width: 60px;max-height:30px"
                     :class="{ disabled: buttonState.isRunning }"
                >
                  {{ getExcludeDisplayText('tab2', 'group2') || '不排除' }}
                  <span class="arrow">▾</span>
                </div>

                <Teleport to="body">
                  <div
                      v-if="excludeDropdownOpen === 'tab2_group2'"
                      class="dropdown-panel"
                      :style="excludeDropdownStyle"
                  >
                    <div
                        class="dropdown-item"
                        v-for="option in excludeOptions"
                        :key="option.value"
                        :class="{ active: isExcludeSelected(option.value, 'tab2', 'group2') }"
                        @click="toggleExcludeOption(option.value, 'tab2', 'group2')"
                    >
                      <span class="check-icon">{{ isExcludeSelected(option.value, 'tab2', 'group2') ? '✓' : '' }}</span>
                      {{ option.label }}
                    </div>
                  </div>
                </Teleport>
              </div>

              <!-- 鍵名 + 鍵值 -->
              <div class="dropdown-row">
                <div class="button-group">
                  <div v-for="key in keys" :key="key" class="key-item">
                    <button
                        :class="['key-button', { active: tabStates.tab2.group2.keys.includes(key) }]"
                        @click="toggleKeySelection(key, tabStates.tab2.group2.keys)"
                    >
                      {{ key }}
                    </button>
                  </div>
                </div>
                <div class="key-dropdown-group">
                  <div v-for="key in tabStates.tab2.group2.keys" :key="key" class="key-value-dropdown">
                    <div class="dropdown-wrapper"
                         :ref="(el) => setTriggerRef(el, key + '_group2')"
                    >
                      <input
                          type="text"
                          :value="getInputDisplayValue(key + '_group2')"
                          @input="handleDropdownInput($event, key + '_group2')"
                          @focus="handleInputFocus(key + '_group2')"
                          @blur="handleInputBlur(key + '_group2')"
                          @click.stop
                          :placeholder="`輸/選 [${key}]`"
                          class="dropdown-input"
                      />
                      <span class="arrow-trigger" @click.stop="toggleDropdown('value', key + '_group2')">
                        <span class="arrow-icon">▼</span>
                      </span>
                    </div>

                    <Teleport to="body">
                      <div
                          v-if="dropdownOpen === 'value' && currentActiveKey === key + '_group2'"
                          class="dropdown-panel"
                          :style="dropdownStyle.value"
                      >
                        <div
                            class="dropdown-item select-all-item"
                            :class="{ active: isAllSelected(key, 'group2') }"
                            @click="toggleSelectAll(key, 'group2')"
                        >
                          <span v-if="isAllSelected(key, 'group2')">☑</span>
                          <span v-else>☐</span>
                          全選
                        </div>

                        <div class="dropdown-divider"></div>

                        <div
                            class="dropdown-item"
                            v-for="value in getFilteredOptions(key + '_group2')"
                            :key="value"
                            :class="{ active: isSelected(value, key, 'group2') }"
                            @click="selectValue(value, key, 'group2')"
                        >
                          <span class="check-icon">{{ isSelected(value, key, 'group2') ? '✓' : '' }}</span>
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
                  :active-keys="tabStates.tab2.group2.keys"
                  :value-map="tabStates.tab2.group2.valueMap"
                  :is-dropdown-open="!!dropdownOpen || excludeDropdownOpen === 'tab2_group2'"
                  :selected-card="tabStates.tab2.group2.card"
                  :exclude-columns="tabStates.tab2.group2.excludeColumns"
                  @update:runDisabled="tab2Group2Disabled = $event"
                  ref="ZhongguRef2"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Tab4: 比較調類 -->
      <div v-show="currentTab === 'tab4'" class="page">
        <div class="page-content-stack">
          <!-- 組1 調類選擇 -->
          <div class="compare-group">
            <div class="group-label">組1：選擇調類</div>
            <div class="tone-selection">
              <label v-for="i in 10" :key="i" class="tone-checkbox">
                <input type="checkbox" :value="i" v-model="tabStates.tab4.group1.toneClasses" />
                <span>T{{ i }}</span>
              </label>
            </div>
          </div>

          <!-- VS 分隔符 -->
          <div class="vs-divider">
            <div class="vs-line"></div>
            <div class="vs-badge">⚡ VS ⚡</div>
            <div class="vs-line"></div>
          </div>

          <!-- 組2 調類選擇 -->
          <div class="compare-group">
            <div class="group-label">組2：選擇調類</div>
            <div class="tone-selection">
              <label v-for="i in 10" :key="i" class="tone-checkbox">
                <input type="checkbox" :value="i" v-model="tabStates.tab4.group2.toneClasses" />
                <span>T{{ i }}</span>
              </label>
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

      <!-- 運行按鈕 -->
      <div class="run-container">
        <button
            class="run-btn"
            @click="runAction"
            :disabled="buttonState.isRunning || isRunDisabled"
            :class="{ disabled: isRunDisabled }"
        >
          <span v-if="buttonState.isRunning">🔄 運行中...</span>
          <span v-else-if="isRunDisabled">🚫 輸入不合規</span>
          <span v-else>🚀 開始比較</span>
        </button>
      </div>

      <!-- 提示區 -->
      <div v-if="currentTab === 'tab1'" class="page-footer" style="margin-top: 20px">
        <small class="hint">比較兩組漢字的音韻特徵差異</small>
      </div>
      <div v-else-if="currentTab === 'tab2'" class="page-footer" style="margin-top: 20px">
        <small class="hint">比較兩組中古音條件的讀音差異</small>
      </div>
      <div v-else-if="currentTab === 'tab4'" class="page-footer" style="margin-top: 20px">
        <small class="hint">比較兩組調類的合併關係</small>
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
import TabsContainer from "@/components/common/TabsContainer.vue";
import LocationAndRegionInput from "@/components/query/LocationAndRegionInput.vue";
import ZhongguSelector from "@/components/query/ZhongguSelector.vue";
import FloatingDice from "@/components/query/FloatingDice.vue";
import { globalPayload, queryStore, uiStore, isQueryButtonDisabled, setRunning, setTabContentDisabled, mapStore } from '@/store/store.js'
import { column_values, S2T_T2S_MAPPING } from '@/config'
import { compareChars, compareZhongGu, compareTones } from '@/api/index.js'
import { getCoordinates } from '@/api/query/geo'

const locationRef = ref(null)
const router = useRouter()
const route = useRoute()
const currentTab = computed(() => route.query.sub || 'tab2')
const tabs = [
  { name: 'tab1', label: '比較漢字' },
  { name: 'tab2', label: '比較中古' },
  { name: 'tab4', label: '比較調類' }
]

// Compute limit context based on current tab
const locationLimitContext = computed(() => {
  return currentTab.value  // 'tab1', 'tab2', 'tab3', or 'tab4'
})

// Tab1 state - dual input for character comparison
const hanziInput = ref({
  group1: '',
  group2: ''
})

// const selectedCard = ref('韻母')
// const selectedKey = ref(['攝']);
// const selectedValue = ref('流')
// const selectedValueMap = ref({});

const dropdownOpen = ref(null)

// ✨ 過濾器相關狀態
const excludeOptions = [
  { value: '多地位標記', label: '所有多地位' },
  { value: '多等', label: '排除多等' },
  { value: '多韻', label: '排除多韻' },
  { value: '多聲母', label: '排除多聲母' },
  { value: '多調', label: '排除多調' }
]
const excludeFilterTriggerRef = reactive({
  tab2_group1: null,
  tab2_group2: null
})
const excludeDropdownOpen = ref(null) // 'tab2' 或 'tab3' 或 null
const excludeDropdownStyle = ref({
  position: 'absolute',
  top: '0px',
  left: '0px',
  zIndex: 99999
})

const tabStates = reactive({
  tab1: {
    group1: {
      chars: ''
    },
    group2: {
      chars: ''
    },
    features: ['聲母', '韻母']  // Selected features for comparison
  },
  tab2: {
    group1: {
      card: '韻母',
      keys: ['攝'],
      valueMap: {},
      excludeColumns: []
    },
    group2: {
      card: '韻母',
      keys: ['攝'],
      valueMap: {},
      excludeColumns: []
    }
  },
  tab4: {
    group1: {
      toneClasses: []
    },
    group2: {
      toneClasses: []
    }
  }
})

const cards = ['聲母', '韻母', '聲調']
const keys = Object.keys(column_values)
const keyValueMap = column_values
// const tab3KeyInput = ref('')
// const tab3SelectedKey = ref(Object.keys(column_values)[0])
// const tab3KeyDropdownEl = ref(null)
// const valueDropdownEl = ref(null)
// const keyDropdownEl = ref(null)
// const valueTriggerEl = ref(null)
const keyTriggerEl = ref(null)

// 1️⃣ 使用 uiStore 中的按钮状态（不再定义本地状态）
// 直接从 store 获取状态引用
const buttonState = uiStore.buttonStates.query

// Tab2 的两个组的禁用状态
const tab2Group1Disabled = ref(true)
const tab2Group2Disabled = ref(true)

// 2️⃣ 监听 Tab 1 的输入框内容 (因为它没有子组件 emit 事件，需要手动监听)
watch(() => tabStates.tab1, (newVal) => {
  // Both groups must have at least one character
  const group1Valid = newVal.group1.chars && newVal.group1.chars.trim() !== ''
  const group2Valid = newVal.group2.chars && newVal.group2.chars.trim() !== ''
  const featuresValid = newVal.features && newVal.features.length > 0
  setTabContentDisabled('query', 'tab1', !(group1Valid && group2Valid && featuresValid))
}, { immediate: true, deep: true })

// 监听 Tab2 的两个组的状态，只有两个组都有效时才启用按钮
watch([tab2Group1Disabled, tab2Group2Disabled], ([group1Disabled, group2Disabled]) => {
  setTabContentDisabled('query', 'tab2', group1Disabled || group2Disabled)
})

// 监听 Tab 4 的调类选择
watch(() => tabStates.tab4, (newVal) => {
  // Both groups must have at least one tone class selected
  const group1Valid = newVal.group1.toneClasses && newVal.group1.toneClasses.length > 0
  const group2Valid = newVal.group2.toneClasses && newVal.group2.toneClasses.length > 0
  setTabContentDisabled('query', 'tab4', !(group1Valid && group2Valid))
}, { immediate: true, deep: true })

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

// 监听 keys 变化，初始化输入框 (for both groups)
watch(() => [tabStates.tab2.group1.keys, tabStates.tab2.group2.keys], ([group1Keys, group2Keys]) => {
  // Initialize for group1
  group1Keys.forEach(key => {
    const keyWithGroup = key + '_group1'
    if (!(keyWithGroup in dropdownInputs.value)) {
      dropdownInputs.value[keyWithGroup] = ''
    }
    if (!(keyWithGroup in isEditing.value)) {
      isEditing.value[keyWithGroup] = false
    }
  })
  // Initialize for group2
  group2Keys.forEach(key => {
    const keyWithGroup = key + '_group2'
    if (!(keyWithGroup in dropdownInputs.value)) {
      dropdownInputs.value[keyWithGroup] = ''
    }
    if (!(keyWithGroup in isEditing.value)) {
      isEditing.value[keyWithGroup] = false
    }
  })
}, { immediate: true, deep: true })

// 获取输入框显示的值
function getInputDisplayValue(keyWithGroup) {
  // 如果正在编辑，显示用户输入的内容
  if (isEditing.value[keyWithGroup]) {
    return dropdownInputs.value[keyWithGroup] || ''
  }
  // 如果不在编辑，显示已选中的内容
  // 提取纯净的 key 和 group
  const key = keyWithGroup.replace(/_group[12]$/, '')
  const group = keyWithGroup.endsWith('_group1') ? 'group1' : 'group2'
  return getDisplayText(key, group)
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
function getFilteredOptions(keyWithGroup) {
  // Extract the actual key name (remove _group1 or _group2 suffix)
  const key = keyWithGroup.replace(/_group[12]$/, '')
  const rawInput = (dropdownInputs.value[keyWithGroup] || '').trim();
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
    // 检查动态的 triggers
    ...Object.values(triggerRefs.value),
    // ✨ 检查过滤器 triggers
    excludeFilterTriggerRef.tab2_group1,
    excludeFilterTriggerRef.tab2_group2
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
function selectValue(value, key, group = 'group1') {
  const targetState = tabStates.tab2[group]
  // 确保该 key 对应的值是数组，如果之前是字符串或未定义，初始化为空数组
  if (!Array.isArray(targetState.valueMap[key])) {
    targetState.valueMap[key] = []
  }

  const list = targetState.valueMap[key]
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
function toggleSelectAll(key, group = 'group1') {
  const targetState = tabStates.tab2[group]
  const allOptions = keyValueMap[key] || []
  const currentSelected = targetState.valueMap[key] || []

  // 如果当前已经全选了，则清空；否则全选
  if (currentSelected.length === allOptions.length) {
    targetState.valueMap[key] = []
  } else {
    targetState.valueMap[key] = [...allOptions]
  }
}

// 3. 新增：判断是否被选中 (辅助 Template 显示样式)
function isSelected(value, key, group = 'group1') {
  const targetState = tabStates.tab2[group]
  const list = targetState.valueMap[key]
  return Array.isArray(list) && list.includes(value)
}

// 4. 新增：判断是否全选 (辅助 Template 显示全选状态)
function isAllSelected(key, group = 'group1') {
  const targetState = tabStates.tab2[group]
  const all = keyValueMap[key] || []
  const current = targetState.valueMap[key] || []
  return all.length > 0 && all.length === current.length
}

// 5. 新增：格式化选中的文字（显示在输入框内）
// 修改：格式化按钮文字 (超过2个显示省略号)
function getDisplayText(key, group = 'group1') {
  const targetState = tabStates.tab2[group]
  const list = targetState.valueMap[key]
  // 1. 没选 - 返回空字符串，让 placeholder 显示
  if (!list || list.length === 0) return ''
  // 2. 全选
  const allOptions = keyValueMap[key] || []
  if (allOptions.length > 0 && list.length === allOptions.length) {
    return '全選'
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
function getExcludeDisplayText(tab, group = 'group1') {
  const targetState = tab === 'tab2' ? tabStates.tab2[group] : null
  if (!targetState) return ''

  const list = targetState.excludeColumns || []
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
function isExcludeSelected(value, tab, group = 'group1') {
  const targetState = tab === 'tab2' ? tabStates.tab2[group] : null
  if (!targetState) return false

  const list = targetState.excludeColumns || []
  return list.includes(value)
}

// 切換過濾器下拉框
function toggleExcludeDropdown(tab, group = 'group1') {
  if (buttonState.isRunning) return

  const dropdownKey = `${tab}_${group}`
  if (excludeDropdownOpen.value === dropdownKey) {
    excludeDropdownOpen.value = null
  } else {
    excludeDropdownOpen.value = dropdownKey
    nextTick(() => {
      const triggerEl = excludeFilterTriggerRef[dropdownKey]
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
function toggleExcludeOption(value, tab, group = 'group1') {
  const targetState = tab === 'tab2' ? tabStates.tab2[group] : null
  if (!targetState) return

  const list = targetState.excludeColumns
  const index = list.indexOf(value)

  if (index > -1) {
    list.splice(index, 1)
  } else {
    list.push(value)
  }
}

// isRunning 状态已移至 uiStore，不再需要本地定义
const ZhongguRef = ref(null);
const ZhongguRef1 = ref(null);  // For tab2 group1
const ZhongguRef2 = ref(null);  // For tab2 group2

// 點擊按鈕行為
const runAction = async () => {
  setRunning('query', true);

  try {
    // 1. 獲取地點邏輯
    function getLocation() {
      if (!locationRef.value?.selectedValue ||
          (Array.isArray(locationRef.value?.selectedValue) && locationRef.value.selectedValue.every(item => item === ''))) {
        return locationRef.value?.allLocationsString || '廣州';
      } else {
        return locationRef.value?.allLocationsString;
      }
    }

    // 2. 準備基礎參數
    const locationVal = getLocation();
    const locationList = locationVal ? [locationVal] : [];

    const regionVal = locationRef.value?.selectedValue;
    const regionList = Array.isArray(regionVal) ? regionVal : (regionVal ? [regionVal] : []);
    queryStore.locations = locationList;
    queryStore.regions = regionList;

    let compareResponse = null;

    // 3. 根据 tab 调用对应的 compare API
    if (currentTab.value === 'tab1') {
      // 比较汉字
      const group1Chars = tabStates.tab1.group1.chars.split(',').map(c => c.trim()).filter(c => c)
      const group2Chars = tabStates.tab1.group2.chars.split(',').map(c => c.trim()).filter(c => c)

      const params = {
        chars: [...group1Chars, ...group2Chars],
        features: tabStates.tab1.features,
        locations: locationList,
        regions: regionList,
        region_mode: locationRef.value?.regionUsing || 'yindian'
      }

      compareResponse = await compareChars(params)
    }
    else if (currentTab.value === 'tab2') {
      // 比较中古
      const params = {
        path_strings1: ZhongguRef1.value?.combinations || [],
        column1: null,
        combine_query1: false,
        exclude_columns1: tabStates.tab2.group1.excludeColumns,

        path_strings2: ZhongguRef2.value?.combinations || [],
        column2: null,
        combine_query2: false,
        exclude_columns2: tabStates.tab2.group2.excludeColumns,

        locations: locationList,
        regions: regionList,
        features: [tabStates.tab2.group1.card, tabStates.tab2.group2.card],
        region_mode: locationRef.value?.regionUsing || 'yindian'
      }

      compareResponse = await compareZhongGu(params)
    }
    else if (currentTab.value === 'tab4') {
      // 比较调类
      const params = {
        tone_classes: [
          ...tabStates.tab4.group1.toneClasses,
          ...tabStates.tab4.group2.toneClasses
        ],
        locations: locationList,
        regions: regionList,
        region_mode: locationRef.value?.regionUsing || 'yindian'
      }

      compareResponse = await compareTones(params)
    }

    // 4. 从比较结果中提取地点列表
    // 处理不同的响应格式：chars/tones 用 results，zhonggu 用 comparison
    const resultsArray = compareResponse.results || compareResponse.comparison

    if (compareResponse && resultsArray) {
      console.log('📊 Compare API 响应:', compareResponse)

      const locations = resultsArray.map(r => r.location)
      console.log('📍 提取的地点列表:', locations)

      // 5. 调用 getCoordinates 获取坐标数据
      const MapData = await getCoordinates({
        locations: locations.join(','),
        regions: regionList,
        region_mode: locationRef.value?.regionUsing || 'yindian',
        iscustom: "true",
        flag: "False"
      })
      console.log('🗺️ 坐标数据:', MapData)

      // 6. 处理比较结果并分配颜色
      const mergedData = processCompareResults(resultsArray, MapData)
      console.log('✨ 合并后的数据:', mergedData)
      console.log('📦 mergedData 长度:', mergedData.length)

      // 7. 存入 mapStore
      mapStore.mapData = MapData
      mapStore.mergedData = mergedData
      mapStore.mode = 'compare'
      mapStore.compareGroups = {
        same: { color: '#4CAF50', label: '完全相同 (≥80%)' },
        high_similar: { color: '#FFC107', label: '高度相似 (60-79%)' },
        partial: { color: '#FF9800', label: '部分相似 (30-59%)' },
        diff: { color: '#F44336', label: '完全不同 (<30%)' },
        maybe: { color: '#FF9800', label: '可能合并' },
        unknown: { color: '#9E9E9E', label: '未知' }
      }

      console.log('💾 已存入 mapStore, mode:', mapStore.mode)
      console.log('💾 mapStore.mergedData 长度:', mapStore.mergedData.length)

      // 8. 跳转到地图页面
      await router.replace({
        path: '/menu',
        query: { tab: 'map' }
      });
    } else {
      console.error('❌ Compare API 响应无效:', compareResponse)
    }

  } catch (error) {
    console.error('Compare action failed:', error)
  } finally {
    setRunning('query', false);
  }
}

// 处理比较结果并生成地图数据
function processCompareResults(results, mapData) {
  console.log('🔄 开始处理比较结果...')
  console.log('📥 输入 results:', results)
  console.log('📥 输入 mapData:', mapData)

  const mergedData = []

  // 将 coordinates_locations 转换为 Map 以便快速查找
  const coordMap = new Map()
  if (mapData && mapData.coordinates_locations) {
    mapData.coordinates_locations.forEach(item => {
      // item 格式: ["地点名", [经度, 纬度]]
      const locationName = item[0]
      const coordinate = item[1]
      coordMap.set(locationName, coordinate)
    })
  }
  console.log('🗺️ 坐标映射表:', coordMap)

  results.forEach(result => {
    const location = result.location
    console.log(`🔍 处理地点: ${location}`)

    // 从 coordMap 中查找坐标
    const coordinate = coordMap.get(location)
    if (!coordinate) {
      console.warn(`⚠️ 未找到地点 ${location} 的坐标数据`)
      return
    }
    console.log(`✅ 找到坐标:`, coordinate)

    // 检查是否有 comparisons 或 features（ZhongGu 格式直接在 result 下有 features）
    if (result.comparisons && Array.isArray(result.comparisons)) {
      // chars/tones 格式：有 comparisons 数组
      result.comparisons.forEach(comparison => {
        const pair = comparison.pair
        console.log(`  📌 比较对: ${pair ? pair.join(' vs ') : '未知'}`)

        // 判断是 features 格式（chars）还是 comparison 格式（tones）
        if (comparison.features) {
          // chars API 格式：有多个 features
          console.log(`  📋 使用 features 格式`)

          if (typeof comparison.features !== 'object') {
            console.warn(`  ⚠️ features 不是对象:`, comparison.features)
            return
          }

          // 处理每个特征
          Object.entries(comparison.features).forEach(([feature, featureData]) => {
            const status = featureData.status
            console.log(`    🔸 特征: ${feature}, 状态: ${status}`)

            const item = createComparisonItem(location, coordinate, feature, featureData.status, featureData, pair)
            if (item) {
              console.log(`    ➕ 添加数据项:`, item)
              mergedData.push(item)
            }
          })
        } else if (comparison.comparison) {
          // tones API 格式：只有一个 comparison
          console.log(`  📋 使用 comparison 格式`)

          const compData = comparison.comparison
          const status = compData.status
          console.log(`    🔸 状态: ${status}`)

          const item = createComparisonItem(location, coordinate, '调类比较', status, compData, pair)
          if (item) {
            console.log(`    ➕ 添加数据项:`, item)
            mergedData.push(item)
          }
        } else {
          console.warn(`  ⚠️ comparison 既没有 features 也没有 comparison:`, comparison)
        }
      })
    } else if (result.features) {
      // ZhongGu 格式：直接在 result 下有 features
      console.log(`  📋 使用 ZhongGu 格式（features 在 result 下）`)

      Object.entries(result.features).forEach(([feature, featureData]) => {
        console.log(`    🔸 特征: ${feature}`)

        // ZhongGu 格式：featureData 包含 group1 和 group2
        if (featureData.group1 && featureData.group2) {
          const item = createZhongGuComparisonItem(location, coordinate, feature, featureData)
          if (item) {
            console.log(`    ➕ 添加数据项:`, item)
            mergedData.push(item)
          }
        }
      })
    } else {
      console.warn(`⚠️ 地点 ${location} 既没有 comparisons 也没有 features`)
    }
  })

  console.log(`✅ 处理完成，共生成 ${mergedData.length} 条数据`)
  return mergedData
}

// 创建比较数据项
function createComparisonItem(location, coordinate, feature, status, data, pair) {
  // 根据比较状态分配颜色
  let color = '#999999' // 默认灰色
  let displayValue = ''

  if (status === 'same') {
    // 相同/完全合并：绿色
    color = '#4CAF50'
    displayValue = data.value || '相同'
  } else if (status === 'diff') {
    // 不同/不合并：红色
    color = '#F44336'
    if (data.values) {
      // chars 格式
      const values = Object.entries(data.values)
        .map(([char, vals]) => `${char}:${vals.join('/')}`)
        .join(' vs ')
      displayValue = values
    } else if (data.t1_value || data.t2_value) {
      // tones 格式
      const t1 = data.t1_value?.join('/') || '无'
      const t2 = data.t2_value?.join('/') || '无'
      displayValue = `${pair[0]}:${t1} vs ${pair[1]}:${t2}`
    } else {
      displayValue = '不同'
    }
  } else if (status === 'partial') {
    // 部分相同/部分合并：黄色
    color = '#FFC107'
    if (data.t1_value || data.t2_value) {
      // tones 格式
      const t1 = data.t1_value?.join('/') || '无'
      const t2 = data.t2_value?.join('/') || '无'
      displayValue = `${pair[0]}:${t1} vs ${pair[1]}:${t2}`
    } else {
      displayValue = '部分相同'
    }
  } else if (status === 'maybe') {
    // 可能合并：橙色
    color = '#FF9800'
    if (data.t1_value || data.t2_value) {
      const t1 = data.t1_value?.join('/') || '无'
      const t2 = data.t2_value?.join('/') || '无'
      displayValue = `${pair[0]}:${t1} vs ${pair[1]}:${t2}`
    } else {
      displayValue = '可能合并'
    }
  } else if (status === 'unknown') {
    // 无法判断：灰色
    color = '#9E9E9E'
    if (data.t1_value || data.t2_value) {
      const t1 = data.t1_value?.join('/') || '无'
      const t2 = data.t2_value?.join('/') || '无'
      displayValue = `${pair[0]}:${t1} vs ${pair[1]}:${t2}`
    } else {
      displayValue = '未知'
    }
  }

  return {
    location: location,
    coordinate: coordinate,
    feature: feature,
    value: displayValue,
    color: color,
    status: status,
    pair: pair.join(' vs ')
  }
}

// 创建 ZhongGu 比较数据项（带加权重叠度计算）
function createZhongGuComparisonItem(location, coordinate, feature, featureData) {
  const group1Data = featureData.group1
  const group2Data = featureData.group2

  // 计算加权重叠度
  let overlap = 0
  const group1Map = new Map()
  const group2Map = new Map()

  // 构建 group1 的值映射
  group1Data.values.forEach(item => {
    group1Map.set(item.value, item.percentage)
  })

  // 构建 group2 的值映射
  group2Data.values.forEach(item => {
    group2Map.set(item.value, item.percentage)
  })

  // 计算加权重叠度：对于每个共同的值，取两组中较小的百分比
  group1Map.forEach((percentage1, value) => {
    if (group2Map.has(value)) {
      const percentage2 = group2Map.get(value)
      overlap += Math.min(percentage1, percentage2)
    }
  })

  console.log(`    📊 加权重叠度: ${overlap.toFixed(2)}%`)

  // 根据重叠度分配颜色和状态
  let color, status, statusText
  if (overlap >= 80) {
    color = '#4CAF50' // 绿色
    status = 'same'
    statusText = '完全相同'
  } else if (overlap >= 60) {
    color = '#FFC107' // 黄色
    status = 'high_similar'
    statusText = '高度相似'
  } else if (overlap >= 30) {
    color = '#FF9800' // 橙色
    status = 'partial'
    statusText = '部分相似'
  } else {
    color = '#F44336' // 红色
    status = 'diff'
    statusText = '完全不同'
  }

  // 生成显示值：显示主要读音（≥10%）
  const group1Main = group1Data.values
    .filter(v => v.percentage >= 10)
    .map(v => `${v.value}(${v.percentage.toFixed(1)}%)`)
    .join(', ')

  const group2Main = group2Data.values
    .filter(v => v.percentage >= 10)
    .map(v => `${v.value}(${v.percentage.toFixed(1)}%)`)
    .join(', ')

  const displayValue = `组1: ${group1Main || '无主要读音'}\n组2: ${group2Main || '无主要读音'}`

  return {
    location: location,
    coordinate: coordinate,
    feature: feature,
    value: displayValue,
    color: color,
    status: status,
    statusText: statusText,
    overlap: Math.round(overlap),
    pair: '组1 vs 组2',
    // 保存原始数据用于详细显示
    group1Data: group1Data,
    group2Data: group2Data
  }
}

function handleApplyConfig(data) {
  const tab = currentTab.value
  // 1. 更新卡片 (聲/韻/調)
  if (tab === 'tab2') {
    tabStates.tab2.group1.card = data.card
    tabStates.tab2.group2.card = data.card
  }

  // 2. 更新地點
  locationModel.value = {
    locations: data.loc.locations,
    regions: data.loc.regions,
    regionUsing: data.loc.regionUsing
  }
  // 3. 更新鍵名 (Keys)
  if (tab === 'tab2') {
    tabStates.tab2.group1.keys = data.keys
    tabStates.tab2.group2.keys = data.keys
  }

  // 4. 根據 Tab 更新具體的值
  if (tab === 'tab2') {
    // Tab2: 更新下拉菜單映射
    tabStates.tab2.group1.valueMap = data.valuesMap
    tabStates.tab2.group2.valueMap = data.valuesMap
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
  name: 'ComparePage' // 👈 必须加这个名字，KeepAlive 才能认出它
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

/* ✨ 比較模式專用樣式 */
.compare-group {
  width: 100%;
  padding: 1rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(200, 200, 200, 0.3);
}

.group-label {
  display: inline-block;
  padding: 0.4rem 1rem;
  background: linear-gradient(135deg, rgba(0, 122, 255, 0.15), rgba(0, 122, 255, 0.25));
  color: #007aff;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 1rem;
  box-shadow: 0 2px 8px rgba(0, 122, 255, 0.2);
}

.vs-divider {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 2rem 0;
  width: 100%;
}

.vs-line {
  flex: 1;
  height: 2px;
  background: linear-gradient(90deg, transparent, #007aff, transparent);
}

.vs-badge {
  padding: 0.6rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 25px;
  font-weight: bold;
  font-size: 1.2rem;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.5);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 4px 20px rgba(102, 126, 234, 0.5);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 6px 25px rgba(102, 126, 234, 0.7);
  }
}

/* 特徵選擇樣式 */
.feature-selection {
  width: 100%;
  padding: 1rem;
  margin-top: 1rem;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(200, 200, 200, 0.3);
}

.feature-label {
  display: block;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.8rem;
  font-size: 0.95rem;
}

.feature-checkboxes {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  justify-content: center;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: background 0.2s;
}

.checkbox-item:hover {
  background: rgba(0, 122, 255, 0.1);
}

.checkbox-item input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.checkbox-item span {
  font-size: 0.95rem;
  font-weight: 500;
  color: #333;
}

/* 調類選擇樣式 */
.tone-selection {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
  padding: 1rem;
}

.tone-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.7);
  border: 2px solid rgba(0, 122, 255, 0.3);
  cursor: pointer;
  transition: all 0.2s;
}

.tone-checkbox:hover {
  background: rgba(0, 122, 255, 0.1);
  border-color: rgba(0, 122, 255, 0.5);
}

.tone-checkbox input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.tone-checkbox span {
  font-size: 0.95rem;
  font-weight: 600;
  color: #007aff;
}

/* 移動端適配 */
@media (max-width: 600px) {
  .vs-badge {
    padding: 0.5rem 1rem;
    font-size: 1rem;
  }

  .group-label {
    font-size: 0.85rem;
    padding: 0.3rem 0.8rem;
  }

  .compare-group {
    padding: 0.8rem;
  }

  .feature-checkboxes {
    gap: 1rem;
  }

  .tone-selection {
    gap: 0.8rem;
  }

  .tone-checkbox {
    padding: 0.5rem 1rem;
  }
}

</style>

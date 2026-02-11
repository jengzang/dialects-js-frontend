<template>
  <div class="location-multi-input">
    <div class="input-section">
      <div class="input-header">
        <label for="location-input">地點</label>
        <div v-if="matchedLocations.length" class="locations-inline">
          <span class="count-inline">{{ matchedLocations.length }}個地點</span>
          <span class="preview-inline">{{ previewText }}</span>
          <button
            v-if="matchedLocations.length > 3"
            class="expand-btn-inline"
            @click="showModal = true"
            type="button"
          >
            展開
          </button>
        </div>
      </div>
      <div v-if="warningMessage" class="warning-message">
        ⚠️ {{ warningMessage }}
      </div>
      <textarea
        id="location-input"
        ref="inputEl"
        v-model="inputValue"
        @keyup="onKeyup"
        @blur="onBlur"
        placeholder="請輸入地點（空格分隔，可自動匹配）"
        rows="3"
      ></textarea>

      <!-- 建議下拉框 -->
      <Teleport to="body">
        <div
          v-if="suggestions.length || successMessage"
          ref="suggestionEl"
          class="suggestions-dropdown"
          :style="suggestionStyle"
        >
          <div v-if="successMessage" class="success-message">
            ✅ {{ successMessage }}
          </div>
          <div
            v-for="item in suggestions"
            :key="item"
            class="suggestion-item"
            @mousedown.prevent="applySuggestion(item)"
          >
            {{ item }}
          </div>
        </div>
      </Teleport>
    </div>

    <!-- 地点详情弹窗 -->
    <Teleport to="body">
      <div
        v-if="showModal"
        class="modal-overlay"
        @mousedown.self="showModal = false"
      >
        <div class="modal-content">
          <div class="modal-header">
            <h3>已匹配地點（{{ matchedLocations.length }}）</h3>
            <button class="close-btn" @click="showModal = false">×</button>
          </div>
          <div class="modal-body">
            <div class="locations-list">
              <span
                v-for="(loc, idx) in matchedLocations"
                :key="idx"
                class="location-chip"
              >
                {{ loc }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { getLocations } from '@/api/query/LocationAndRegion.js'
import { API_BASE } from '@/env-config.js'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  maxLocations: {
    type: Number,
    default: 10
  }
})

const emit = defineEmits(['update:modelValue', 'update:matchedLocations', 'update:isMatching'])

const inputEl = ref(null)
const suggestionEl = ref(null)
const inputValue = ref('')
const suggestions = ref([])
const successMessage = ref('')
const matchedLocations = ref([])
const showModal = ref(false)
const warningMessage = ref('')
const isMatching = ref(false) // 添加匹配中的状态
const suggestionStyle = ref({
  left: '0px',
  top: '0px',
  position: 'absolute',
  zIndex: 99999
})

let debounceTimer = null
let fetchDebounceTimer = null

// 预览文本（前3个地点）
const previewText = computed(() => {
  if (!matchedLocations.value.length) return ''
  const first3 = matchedLocations.value.slice(0, 3).join('、')
  return matchedLocations.value.length > 3 ? `${first3}…` : first3
})

// 解析输入值为查询字符串数组
const queryStrings = computed(() => {
  return inputValue.value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
})

// 监听输入值变化，通知父组件
watch(queryStrings, (newQueries) => {
  emit('update:modelValue', newQueries)

  // 防抖调用验证 API
  clearTimeout(fetchDebounceTimer)
  fetchDebounceTimer = setTimeout(() => {
    fetchMatchedLocations(newQueries)
  }, 300)
})

// 监听外部传入的值
watch(() => props.modelValue, (newVal) => {
  if (Array.isArray(newVal)) {
    const currentQueries = queryStrings.value
    if (JSON.stringify(currentQueries) !== JSON.stringify(newVal)) {
      inputValue.value = newVal.join(' ')
    }
  }
}, { immediate: true })

// 获取当前光标位置的查询词
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

// 键盘输入事件
function onKeyup() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(fetchSuggestion, 200)
}

// 失焦事件
function onBlur() {
  setTimeout(() => {
    suggestions.value = []
    successMessage.value = ''
  }, 200)
}

// 获取建议
function fetchSuggestion() {
  const { queryStart, cursorPos, value } = getQueryStart()
  const query = value.slice(queryStart, cursorPos).trim()

  if (!query) {
    suggestions.value = []
    successMessage.value = ''
    return
  }

  const token = localStorage.getItem('ACCESS_TOKEN')

  fetch(`${API_BASE}/batch_match?input_string=${encodeURIComponent(query)}`, {
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
          minWidth: `${el.offsetWidth}px`
        }
      })
    })
    .catch(err => {
      console.error('获取建议失败:', err)
    })
}

// 应用建议
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

// 调用 /api/get_locs/ 获取实际匹配的地点列表
async function fetchMatchedLocations(queries) {
  if (!queries.length) {
    matchedLocations.value = []
    warningMessage.value = ''
    isMatching.value = false
    emit('update:matchedLocations', [])
    emit('update:isMatching', false)
    return
  }

  isMatching.value = true
  emit('update:isMatching', true)

  try {
    const data = await getLocations({ locations: queries })

    // 对返回的地点列表去重
    const locations = Array.isArray(data?.locations_result) ? data.locations_result : []
    const uniqueLocations = [...new Set(locations)]

    // 检查是否超过最大限制
    if (uniqueLocations.length > props.maxLocations) {
      warningMessage.value = `匹配到${uniqueLocations.length}个地点，已自动截取前${props.maxLocations}个`
      matchedLocations.value = uniqueLocations.slice(0, props.maxLocations)
    } else {
      warningMessage.value = ''
      matchedLocations.value = uniqueLocations
    }

    emit('update:matchedLocations', matchedLocations.value)
  } catch (err) {
    console.error('获取匹配地点失败:', err)
    matchedLocations.value = []
    warningMessage.value = ''
    emit('update:matchedLocations', [])
  } finally {
    isMatching.value = false
    emit('update:isMatching', false)
  }
}
</script>

<style scoped>
.location-multi-input {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.input-section {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  flex-wrap: nowrap;
}

.input-section label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-dark);
  flex-shrink: 0;
}

.locations-inline {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;

  min-width: 0;
}

.count-inline {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-primary);
  padding: 2px 8px;
  background: var(--color-primary-light);
  border-radius: 999px;
  border: 1px solid var(--color-primary-border);
  white-space: nowrap;
  flex-shrink: 0;
}

.preview-inline {
  font-size: 13px;
  color: var(--text-dark-medium);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

.expand-btn-inline {
  padding: 2px 10px;
  background: var(--color-primary-light);
  color: var(--color-primary);
  border: 1px solid var(--color-primary-border2);
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  flex-shrink: 0;
}

.expand-btn-inline:hover {
  background: var(--color-primary-light2);
}

.warning-message {
  font-size: 13px;
  color: #ff9800;
  background: rgba(255, 152, 0, 0.1);
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  border-left: 3px solid #ff9800;
  font-weight: 500;
}

.input-section textarea {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid var(--border-gray-light);
  border-radius: var(--radius-md);
  font-size: 14px;
  resize: vertical;
  background: var(--glass-medium2);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition: all 0.3s ease;
  font-family: inherit;
  color: var(--text-dark);
  box-shadow: var(--shadow-sm);
}

.input-section textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  background: var(--glass-medium-strong);
  box-shadow: 0 0 0 3px var(--color-primary-light), var(--shadow-md);
}

.input-section textarea::placeholder {
  color: var(--text-secondary);
}

.suggestions-dropdown {
  position: absolute !important;
  background: var(--glass-medium2);
  border: 1px solid var(--border-gray-light);
  box-shadow: var(--shadow-lg2);
  padding: 8px;
  border-radius: var(--radius-md);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  max-height: 30vh;
  overflow-y: auto;
  z-index: 99999 !important;
}

/* 自定义滚动条样式 */
.suggestions-dropdown::-webkit-scrollbar {
  width: 8px;
}

.suggestions-dropdown::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 10px;
}

.suggestions-dropdown::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.15);
  border-radius: 10px;
  transition: background 0.2s;
}

.suggestions-dropdown::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.25);
}

.success-message {
  color: var(--color-success);
  font-weight: 600;
  padding: 6px 8px;
  font-size: 13px;
}

.suggestion-item {
  padding: 8px 10px;
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: background-color 0.2s ease;
  font-size: 14px;
  color: var(--text-dark);
}

.suggestion-item:hover {
  background: var(--bg-blue-hover);
}

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 20000;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 18px;
  background: var(--border-medium);
  backdrop-filter: blur(7px);
  -webkit-backdrop-filter: blur(7px);
}

.modal-content {
  width: min(720px, 94vw);
  max-height: min(70vh, 640px);
  overflow: hidden;
  background: var(--glass-lighter2);
  border: 1px solid var(--border-gray-lighter);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-xl);
  backdrop-filter: blur(18px) saturate(160%);
  -webkit-backdrop-filter: blur(18px) saturate(160%);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-bottom: 1px solid var(--border-gray-lightest);
}

.modal-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 650;
  color: var(--text-dark-light);
}

.close-btn {
  background: var(--bg-hover-medium);
  border: none;
  width: 30px;
  height: 30px;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: 20px;
  line-height: 30px;
  color: var(--text-dark-lighter);
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: var(--bg-hover-strong);
}

.modal-body {
  padding: 16px 18px 20px;
  overflow: auto;
  max-height: calc(min(70vh, 640px) - 80px);
}

/* 自定义滚动条样式 */
.modal-body::-webkit-scrollbar {
  width: 8px;
}

.modal-body::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 10px;
}

.modal-body::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.15);
  border-radius: 10px;
  transition: background 0.2s;
}

.modal-body::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.25);
}

.locations-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.location-chip {
  display: inline-flex;
  align-items: center;
  padding: 5px 10px;
  background: var(--glass-lighter3);
  border: 1px solid var(--border-gray-light2);
  border-radius: 999px;
  font-size: 14px;
  color: var(--text-dark-lightest);
  box-shadow: var(--shadow-sm2);
}

/* 移动端适配 */
@media (max-aspect-ratio: 1/1) {
  .input-section textarea {
    font-size: 16px; /* 防止 iOS 自动缩放 */
  }

  .input-header {
    align-items: center;
    gap: 6px;
  }

  .locations-inline {
    width: 100%;
  }

  .preview-inline {
    font-size: 12px;
  }

  .count-inline {
    font-size: 11px;
  }

  .expand-btn-inline {
    font-size: 10px;
    padding: 2px 8px;
  }

  .locations-list {
    gap: 6px;
  }

  .location-chip {
    font-size: 13px;
    padding: 4px 8px;
  }
}
</style>

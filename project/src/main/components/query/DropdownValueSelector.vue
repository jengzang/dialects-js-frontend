<template>
  <div class="key-dropdown-group">
    <div v-for="key in selectedKeys" :key="key" class="key-value-dropdown">
      <div class="dropdown-wrapper" :ref="(el) => setTriggerRef(el, key)">
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
        <span class="arrow-trigger" @click.stop="toggleDropdown(key)">
          <span class="arrow-icon">▼</span>
        </span>
      </div>

      <Teleport to="body">
        <div
          v-if="dropdownOpen === key"
          class="dropdown-panel"
          :style="dropdownStyle"
        >
          <!-- Select All -->
          <div
            v-if="showSelectAll"
            class="dropdown-item select-all-item"
            :class="{ active: isAllSelected(key) }"
            @click="toggleSelectAll(key)"
          >
            <span v-if="isAllSelected(key)">☑</span>
            <span v-else>☐</span>
            {{ $t('query.tab2.selectAll') }}
          </div>

          <div v-if="showSelectAll" class="dropdown-divider"></div>

          <!-- Individual Options -->
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
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { S2T_T2S_MAPPING } from '@/main/config'

const { t } = useI18n()

const props = defineProps({
  selectedKeys: {
    type: Array,
    required: true
  },
  modelValue: {
    type: Object,
    default: () => ({})
  },
  keyValueMap: {
    type: Object,
    required: true
  },
  showSelectAll: {
    type: Boolean,
    default: true
  },
  enableSearch: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue'])

// State
const triggerRefs = ref({})
const dropdownOpen = ref(null)
const currentActiveKey = ref(null)
const dropdownInputs = ref({})
const isEditing = ref({})

// Set trigger ref for positioning
const setTriggerRef = (el, key) => {
  if (el) {
    triggerRefs.value[key] = el
  }
}

// Watch selectedKeys to initialize inputs
watch(() => props.selectedKeys, (newKeys) => {
  newKeys.forEach(key => {
    if (!(key in dropdownInputs.value)) {
      dropdownInputs.value[key] = ''
    }
    if (!(key in isEditing.value)) {
      isEditing.value[key] = false
    }
  })
}, { immediate: true, deep: true })

// Dropdown positioning
const dropdownStyle = computed(() => {
  if (!dropdownOpen.value) return {}
  const triggerEl = triggerRefs.value[dropdownOpen.value]
  if (!triggerEl) return {}
  const rect = triggerEl.getBoundingClientRect()
  return {
    position: 'fixed',
    top: `${rect.bottom + 4}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    zIndex: 99999
  }
})

// Get input display value
function getInputDisplayValue(key) {
  if (isEditing.value[key]) {
    return dropdownInputs.value[key] || ''
  }
  return getDisplayText(key)
}

// Handle input focus
function handleInputFocus(key) {
  isEditing.value[key] = true
  dropdownInputs.value[key] = ''
}

// Handle input blur
function handleInputBlur(key) {
  setTimeout(() => {
    isEditing.value[key] = false
    dropdownInputs.value[key] = ''
  }, 200)
}

// Handle input change
function handleDropdownInput(event, key) {
  const inputValue = event.target.value
  dropdownInputs.value[key] = inputValue

  if (inputValue.trim()) {
    if (dropdownOpen.value !== key) {
      toggleDropdown(key)
    }
  } else {
    if (dropdownOpen.value === key) {
      dropdownOpen.value = null
    }
  }
}

// Get filtered options
function getFilteredOptions(key) {
  const rawInput = (dropdownInputs.value[key] || '').trim()
  const allOptions = props.keyValueMap[key] || []

  if (!rawInput) return allOptions

  const transformedInput = rawInput.split('').map(char => {
    return S2T_T2S_MAPPING[char] || char
  }).join('')

  return allOptions.filter(opt => {
    return opt.includes(rawInput) || opt.includes(transformedInput)
  })
}

// Toggle dropdown
function toggleDropdown(key) {
  if (dropdownOpen.value === key) {
    dropdownOpen.value = null
  } else {
    dropdownOpen.value = key
  }
}

// Select value
function selectValue(value, key) {
  const newValueMap = { ...props.modelValue }
  if (!Array.isArray(newValueMap[key])) {
    newValueMap[key] = []
  }
  const list = newValueMap[key]
  const index = list.indexOf(value)
  if (index > -1) {
    list.splice(index, 1)
  } else {
    list.push(value)
  }
  emit('update:modelValue', newValueMap)
}

// Toggle select all
function toggleSelectAll(key) {
  const allOptions = props.keyValueMap[key] || []
  const currentSelected = props.modelValue[key] || []
  const newValueMap = { ...props.modelValue }
  if (currentSelected.length === allOptions.length) {
    newValueMap[key] = []
  } else {
    newValueMap[key] = [...allOptions]
  }
  emit('update:modelValue', newValueMap)
}

// Check if value is selected
function isSelected(value, key) {
  const list = props.modelValue[key]
  return Array.isArray(list) && list.includes(value)
}

// Check if all selected
function isAllSelected(key) {
  const all = props.keyValueMap[key] || []
  const current = props.modelValue[key] || []
  return all.length > 0 && all.length === current.length
}

// Get display text
function getDisplayText(key) {
  const list = props.modelValue[key]
  if (!list || list.length === 0) return ''

  const allOptions = props.keyValueMap[key] || []
  if (allOptions.length > 0 && list.length === allOptions.length) {
    return t('query.tab2.selectAll')
  }

  if (list.length > 3) {
    return `${list.slice(0, 3).join(', ')}...`
  }
  return list.join(', ')
}

// Click outside handler
function onClickOutside(event) {
  const isInsideTrigger = Object.values(triggerRefs.value)
    .some(el => el?.contains(event.target))
  const isInsidePanel = event.target.closest('.dropdown-panel')
  if (!isInsideTrigger && !isInsidePanel) {
    dropdownOpen.value = null
  }
}

onMounted(() => {
  document.addEventListener('click', onClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', onClickOutside)
})
</script>

<style scoped>
.key-dropdown-group {
  display: flex;
  flex-wrap: wrap;
  column-gap: 30px;
}

.key-value-dropdown {
  margin-top: 10px;
  display: flex;
  flex-direction: row;
  width: 135px;
}

.key-name {
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

.key-value-dropdown .dropdown-item.active {
  background-color: var(--color-primary-medium);
  color: var(--color-primary);
}

.dropdown-divider {
  height: 1px;
  background: var(--border-divider);
  margin: 2px 0;
}

.key-name-text {
  color: var(--color-blue-custom);
}

.dropdown-wrapper {
  display: flex;
  align-items: stretch;
  border: 1px solid var(--color-primary-medium);
  border-radius: 8px;
  overflow: hidden;
  background: var(--glass-light);
}

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

.select-all-item {
  color: var(--text-tertiary);
  font-size: 0.9em;
  border-bottom: 1px solid #f0f0f0;
}

.check-icon {
  width: 16px;
  display: inline-block;
}

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
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dropdown-item.active {
  background-color: #e6f0ff;
  color: #02469e;
  font-weight: bold;
}

.dropdown-item:hover {
  background-color: #e6f0ff;
}
</style>

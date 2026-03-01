<template>
  <div class="simple-select-dropdown">
    <div
      ref="triggerRef"
      class="select-trigger"
      :class="{ 'is-open': isOpen, 'is-disabled': disabled }"
      @click="handleToggle"
    >
      <span class="select-label">{{ displayLabel }}</span>
      <span class="select-arrow">▾</span>
    </div>

    <SimpleDropdown
      v-if="isOpen"
      :modelValue="modelValue"
      :options="options"
      :triggerEl="triggerRef"
      :searchable="searchable"
      :searchPlaceholder="searchPlaceholder"
      :placeholder="placeholder"
      @update:modelValue="handleUpdate"
      @close="handleClose"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import SimpleDropdown from './SimpleDropdown.vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: null
  },
  options: {
    type: Array,
    required: true,
    // Format: [{ label: 'Label', value: 'value' }]
  },
  placeholder: {
    type: String,
    default: '请选择'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  searchable: {
    type: Boolean,
    default: false
  },
  searchPlaceholder: {
    type: String,
    default: '搜索...'
  }
})

const emit = defineEmits(['update:modelValue'])

// State
const isOpen = ref(false)
const triggerRef = ref(null)

// Computed
const displayLabel = computed(() => {
  if (!props.modelValue && props.modelValue !== 0) {
    return props.placeholder
  }
  const option = props.options.find(opt => opt.value === props.modelValue)
  return option?.label || props.placeholder
})

// Methods
const handleToggle = () => {
  if (props.disabled) return
  isOpen.value = !isOpen.value
}

const handleUpdate = (value) => {
  emit('update:modelValue', value)
}

const handleClose = () => {
  isOpen.value = false
}
</script>

<style scoped>
.simple-select-dropdown {
  position: relative;
  display: inline-block;
  width: 100%;
}

.select-trigger {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  backdrop-filter: blur(10px);
  font-size: 14px;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;
}

.select-trigger:hover:not(.is-disabled) {
  border-color: var(--color-primary, #4a90e2);
  background: rgba(255, 255, 255, 0.7);
}

.select-trigger.is-open {
  border-color: var(--color-primary, #4a90e2);
  background: rgba(255, 255, 255, 0.8);
}

.select-trigger.is-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.select-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.select-arrow {
  margin-left: 8px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.6);
  transition: transform 0.2s ease;
}

.select-trigger.is-open .select-arrow {
  transform: rotate(180deg);
}
</style>

<template>
  <div class="choice-selector" role="tablist" :aria-label="ariaLabel">
    <button
      v-for="(option, index) in options"
      :key="option.value"
      type="button"
      class="choice-selector-item"
      :class="{
        active: modelValue === option.value,
        first: index === 0,
        last: index === options.length - 1
      }"
      :disabled="disabled"
      @click="handleSelect(option.value)"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  options: {
    type: Array,
    default: () => []
  },
  ariaLabel: {
    type: String,
    default: 'Choice selector'
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

function handleSelect(value) {
  if (props.disabled || props.modelValue === value) {
    return
  }
  emit('update:modelValue', value)
}
</script>

<style scoped>
.choice-selector {
  display: flex;
  flex-direction: row;
  border-radius: 12px;
  overflow: hidden;
  width: fit-content;
  max-width: 100%;
  max-height: 45px;
  box-shadow: var(--shadow-md);
}

.choice-selector-item {
  padding: 10px 16px;
  flex: 1;
  text-align: center;
  cursor: pointer;
  font-weight: 500;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid var(--color-primary-medium);
  border-right-color: var(--border-gray-medium);
  border-left-color: var(--border-gray-medium);
  transition: background 0.2s ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  background: transparent;
}

.choice-selector-item:hover:not(:disabled) {
  background: var(--glass-medium);
}

.choice-selector-item:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

.choice-selector-item.first {
  border-radius: 12px 0 0 12px;
  border-left-color: var(--color-primary-medium);
}

.choice-selector-item.last {
  border-radius: 0 12px 12px 0;
  border-right-color: var(--color-primary-medium);
}

.choice-selector-item.active {
  background: var(--color-primary-medium);
  color: var(--color-primary);
  font-weight: 600;
}

@media (max-aspect-ratio: 1/1) {
  .choice-selector-item {
    padding: 12px 12px;
  }
}
</style>

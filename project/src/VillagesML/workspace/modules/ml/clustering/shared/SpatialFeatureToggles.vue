<template>
  <div class="feature-toggles vm-subpanel-shell">
    <h4 class="section-title">特徵選擇</h4>

    <div class="setting-row">
      <label class="setting-label">
        <input type="checkbox" :checked="modelValue.use_semantic_profile"
          @change="update('use_semantic_profile', $event.target.checked)" />
        語義特徵
      </label>
      <span class="setting-hint">9個語義類別占比</span>
    </div>

    <div class="setting-row">
      <label class="setting-label">
        <input type="checkbox" :checked="modelValue.use_naming_patterns"
          @change="update('use_naming_patterns', $event.target.checked)" />
        命名模式
      </label>
      <span class="setting-hint">高頻後綴出現頻率</span>
    </div>

    <div class="setting-row">
      <label class="setting-label">
        <input type="checkbox" :checked="modelValue.use_geographic"
          @change="update('use_geographic', $event.target.checked)" />
        地理特徵
      </label>
      <span class="setting-hint">聚類質心經緯度</span>
    </div>

    <div class="setting-row">
      <label class="setting-label">
        <input type="checkbox" :checked="modelValue.use_cluster_size"
          @change="update('use_cluster_size', $event.target.checked)" />
        聚類規模
      </label>
      <span class="setting-hint">聚類包含的村莊數</span>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: Object, required: true }
})

const emit = defineEmits(['update:modelValue'])

function update(key, value) {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}
</script>

<style scoped>
.section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.setting-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.setting-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  cursor: pointer;
  min-width: 100px;
}

.setting-label input[type="checkbox"] {
  cursor: pointer;
}

.setting-hint {
  font-size: 12px;
  color: var(--text-secondary);
  font-style: italic;
}
</style>

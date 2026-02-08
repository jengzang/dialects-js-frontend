<template>
  <div class="settings-panel">
    <!-- Module Selection -->
    <div class="setting-group">
      <label class="setting-label">分析模塊</label>
      <div class="module-checkboxes">
        <label class="checkbox-option" v-for="module in availableModules" :key="module.value">
          <input type="checkbox" :value="module.value" v-model="localSettings.modules" />
          <span>{{ module.label }}</span>
        </label>
      </div>
    </div>

    <!-- Pitch Settings -->
    <div v-if="localSettings.modules.includes('pitch')" class="setting-group">
      <label class="setting-label">基頻設置</label>
      <div class="param-grid">
        <div class="param-item">
          <label>最小基頻 (Hz)</label>
          <input type="number" v-model.number="localSettings.pitch_options.f0_min" min="50" max="300" />
        </div>
        <div class="param-item">
          <label>最大基頻 (Hz)</label>
          <input type="number" v-model.number="localSettings.pitch_options.f0_max" min="200" max="800" />
        </div>
        <div class="param-item">
          <label>時間步長 (s)</label>
          <input type="number" v-model.number="localSettings.pitch_options.time_step" min="0.001" max="0.1" step="0.001" />
        </div>
      </div>
    </div>

    <!-- Formant Settings -->
    <div v-if="localSettings.modules.includes('formant')" class="setting-group">
      <label class="setting-label">共振峰設置</label>
      <div class="param-grid">
        <div class="param-item">
          <label>最大共振峰數</label>
          <input type="number" v-model.number="localSettings.formant_options.max_formants" min="3" max="7" />
        </div>
        <div class="param-item">
          <label>最大頻率 (Hz)</label>
          <input type="number" v-model.number="localSettings.formant_options.max_freq_hz" min="3000" max="8000" step="100" />
        </div>
      </div>
    </div>

    <!-- Intensity Settings -->
    <div v-if="localSettings.modules.includes('intensity')" class="setting-group">
      <label class="setting-label">強度設置</label>
      <div class="param-grid">
        <div class="param-item">
          <label>最小基頻 (Hz)</label>
          <input type="number" v-model.number="localSettings.intensity_options.min_pitch" min="50" max="200" />
        </div>
      </div>
    </div>

    <!-- Output Options -->
    <div class="setting-group">
      <label class="setting-label">輸出選項</label>
      <div class="param-grid">
        <div class="param-item">
          <label>下採樣頻率 (Hz)</label>
          <input type="number" v-model.number="localSettings.output_options.downsample_hz" min="10" max="1000" />
        </div>
      </div>
      <div class="checkbox-options">
        <label class="checkbox-option">
          <input type="checkbox" v-model="localSettings.output_options.include_timeseries" />
          <span>包含時間序列數據</span>
        </label>
        <label class="checkbox-option">
          <input type="checkbox" v-model="localSettings.output_options.include_summary" />
          <span>包含摘要信息</span>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'

const props = defineProps({
  settings: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:settings'])

const availableModules = [
  { value: 'basic', label: '基本信息' },
  { value: 'pitch', label: '基頻分析' },
  { value: 'intensity', label: '強度分析' },
  { value: 'formant', label: '共振峰分析' },
  { value: 'voice_quality', label: '音質分析' },
  { value: 'segments', label: '音段分析' }
]

const localSettings = reactive({ ...props.settings })

watch(localSettings, (newSettings) => {
  emit('update:settings', { ...newSettings })
}, { deep: true })
</script>

<style scoped>
.settings-panel {
  padding: 1.5rem;
}

.setting-group {
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--glass-border);
}

.setting-group:last-child {
  border-bottom: none;
}

.setting-label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: var(--color-text-primary);
}

.mode-selector {
  display: flex;
  gap: 1rem;
}

.radio-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--glass-light);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.3s ease;
}

.radio-option:hover {
  background: var(--glass-medium);
  transform: translateY(-2px);
}

.radio-option input[type="radio"] {
  cursor: pointer;
}

.module-checkboxes {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.75rem;
}

.checkbox-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: var(--glass-light);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.3s ease;
}

.checkbox-option:hover {
  background: var(--glass-medium);
}

.checkbox-option input[type="checkbox"] {
  cursor: pointer;
}

.param-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.param-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.param-item label {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.param-item input[type="number"] {
  padding: 0.75rem;
  background: var(--glass-light);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  color: var(--color-text-primary);
  font-size: 1rem;
  transition: all 0.3s ease;
}

.param-item input[type="number"]:focus {
  outline: none;
  border-color: var(--color-primary);
  background: var(--glass-medium);
}

.checkbox-options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.75rem;
}
</style>

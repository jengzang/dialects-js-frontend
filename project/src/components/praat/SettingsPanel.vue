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
          <label>採樣頻率(Hz)</label>
          <input type="number" placeholder="數值越大點越多" v-model.number="localSettings.output_options.downsample_hz" min="10" max="1000" />
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
      <div class="resolution-presets">
        <label class="radio-option" :class="{ active: currentResolutionMode === 'quick' }">
          <input
              type="radio"
              value="quick"
              v-model="currentResolutionMode"
              @change="applyResolutionPreset"
          >
          <span class="radio-label">
        <span class="radio-title">⚡ 快速预览</span>
        <span class="radio-desc">10ms 步长 (粗略)</span>
      </span>
        </label>

        <label class="radio-option" :class="{ active: currentResolutionMode === 'standard' }">
          <input
              type="radio"
              value="standard"
              v-model="currentResolutionMode"
              @change="applyResolutionPreset"
          >
          <span class="radio-label">
        <span class="radio-title">⚖️ 标准分析</span>
        <span class="radio-desc">5ms 步长 (默认)</span>
      </span>
        </label>

        <label class="radio-option" :class="{ active: currentResolutionMode === 'high' }">
          <input
              type="radio"
              value="high"
              v-model="currentResolutionMode"
              @change="applyResolutionPreset"
          >
          <span class="radio-label">
        <span class="radio-title">💎 高精度</span>
        <span class="radio-desc">1ms 步长 (精细)</span>
      </span>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch,ref } from 'vue'

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
// 预设配置
const resolutionPresets = {
  'quick': { time_step: 0.01 },     // 10ms
  'standard': { time_step: 0.005 }, // 5ms
  'high': { time_step: 0.001 }      // 1ms
}

// 当前选中的模式，默认为 standard
const currentResolutionMode = ref('standard')

// 应用预设函数
const applyResolutionPreset = () => {
  const preset = resolutionPresets[currentResolutionMode.value]
  if (preset) {
    // 假设 localSettings 是你的响应式对象
    localSettings.value.time_step = preset.time_step
  }
}

const localSettings = reactive(JSON.parse(JSON.stringify(props.settings)))

watch(localSettings, (newSettings) => {
  emit('update:settings', JSON.parse(JSON.stringify(newSettings)))
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
/* 容器布局 */
.resolution-presets {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

/* 隐藏原始 Radio 按钮，使用样式模拟 */
.radio-option {
  flex: 1;
  position: relative;
  border: 2px solid rgba(0,0,0,0.1); /* 边框 */
  border-radius: 8px;
  padding: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
  display: flex;
  align-items: flex-start;
}

.radio-option input[type="radio"] {
  position: absolute;
  opacity: 0; /* 隐藏原生圆点 */
  width: 0;
  height: 0;
}

/* 选中状态 */
.radio-option.active {
  border-color: #007aff; /* 激活色 */
  background-color: rgba(0, 122, 255, 0.05);
}

.radio-label {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.radio-title {
  font-weight: 600;
  font-size: 0.9rem;
  color: #333;
}

.radio-desc {
  font-size: 0.75rem;
  color: #666;
}

/* 鼠标悬停 */
.radio-option:hover {
  border-color: #999;
}
.radio-option.active:hover {
  border-color: #0066cc;
}
</style>

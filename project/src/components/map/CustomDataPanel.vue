<template>
  <Teleport to="body">
    <!-- 展开/收起按钮（独立于面板，始终可见）只在 tab=map 且 sub=map 时显示 -->
    <button v-if="shouldShowPanel" class="expand-button" :class="{ open: isPanelOpen }" @click="togglePanel">
      {{ isPanelOpen ? '×' : '+' }}
    </button>

    <!-- 右侧面板 -->
    <div v-if="shouldShowPanel" :class="['custom-data-panel', { open: isPanelOpen }]">
      <!-- 面板内容 -->
      <div v-if="isPanelOpen" class="panelContent">
        <h3 class="panel-title">提交自定義數據</h3>

        <form @submit.prevent="handleSubmit" class="data-form">
          <!-- 地点输入框（带自动完成） -->
          <div class="form-group">
            <label for="location-input">地點<span class="required">*</span></label>
            <input
                id="location-input"
                v-model="formData.location"
                type="text"
                placeholder="輸入地點名稱..."
                autocomplete="off"
                @input="handleLocationInput"
                @blur="hideSuggestions"
            />
            <!-- 建议列表 -->
            <div v-if="showSuggestions && suggestions.length > 0" class="suggestions-box">
              <div
                  v-for="item in suggestions"
                  :key="item"
                  class="suggestion-item"
                  @mousedown.prevent="selectSuggestion(item)"
              >
                {{ item }}
              </div>
            </div>
          </div>

          <!-- 音典分区输入框（自动填充） -->
          <div class="form-group">
            <label for="region-input">分區<span class="required">*</span></label>
            <input
                id="region-input"
                v-model="formData.region"
                type="text"
                placeholder="選擇地點後自動填充..."
            />
          </div>

          <!-- 坐标输入框 -->
          <div class="form-group">
            <label for="coordinates-input">經緯度<span class="required">*</span></label>
            <input
                id="coordinates-input"
                v-model="formData.coordinates"
                type="text"
                placeholder="點擊地圖自動填入..."
            />
          </div>

          <!-- 特征类型输入框（只读，用于显示） -->
          <div class="form-group">
            <label for="feature-type-input">聲/韻/調<span class="required">*</span></label>
            <input
                id="feature-type-input"
                v-model="formData.featureType"
                type="text"
                placeholder="如：聲母、韻母、聲調"
                autocomplete="off"
            />
          </div>

          <!-- 特征子字段输入框（必填） -->
          <div class="form-group">
            <label for="feature-field-input">當前查詢<span class="required">*</span></label>
            <input
                id="feature-field-input"
                v-model="formData.featureField"
                type="text"
                placeholder="如：流攝、一等、開..."
            />
          </div>

          <!-- 值输入框 -->
          <div class="form-group">
            <label for="value-input">值<span class="required">*</span></label>
            <input
                id="value-input"
                v-model="formData.value"
                type="text"
                placeholder="如：p、a、55..."
            />
          </div>

          <!-- 说明输入框 -->
          <div class="form-group">
            <label for="description-input">說明</label>
            <textarea
                id="description-input"
                v-model="formData.description"
                placeholder="選填：補充說明..."
                rows="3"
            />
          </div>

          <!-- 提交按钮 -->
          <button type="submit" class="submit-btn">
            提交數據
          </button>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '@/utils/auth.js'
import { showSuccess, showError, showWarning, showInfo } from '@/utils/message.js'
import { userStore, globalPayload, resultCache } from '@/utils/store.js'

const route = useRoute()

// Props: 接收地图点击坐标和选中的特征
const props = defineProps({
  mapClickCoordinates: {
    type: Object,
    default: null
  },
  selectedFeature: {
    type: String,
    default: ''
  }
})

// Emits
const emit = defineEmits(['submit-success', 'panel-toggle'])

// 面板状态
const isPanelOpen = ref(false)

// 计算是否应该显示按钮和面板（只在 tab=map 且 sub=map 时显示）
const shouldShowPanel = computed(() => {
  return route.query.tab === 'map' && (route.query.sub === 'map' || !route.query.sub)
})

// 表单数据
const formData = reactive({
  location: '',
  region: '',
  coordinates: '',
  featureType: '',    // 特征大类（如 "声母"）
  featureField: '',   // 特征子字段（如 "舌尖"，可选）
  value: '',
  description: ''
})

// 建议列表
const suggestions = ref([])
const showSuggestions = ref(false)


// 防抖定时器
let debounceTimer = null

// 切换面板展开/收起
const togglePanel = () => {
  isPanelOpen.value = !isPanelOpen.value
  emit('panel-toggle', isPanelOpen.value)
}

// 监听地图点击坐标，自动填入
watch(() => props.mapClickCoordinates, (newVal) => {
  if (newVal && isPanelOpen.value) {
    // 保留6位小数
    const lng = newVal.lng.toFixed(6)
    const lat = newVal.lat.toFixed(6)
    formData.coordinates = `${lng}, ${lat}`
  }
})

// 监听 selectedFeature，自动填入
watch(() => props.selectedFeature, (newFeature) => {
  if (!newFeature) return

  // featureField = selectedFeature（子字段，不包含 "-"）
  formData.featureField = newFeature

  // featureType 从 resultCache.features 获取
  if (resultCache.features && resultCache.features.length > 0) {
    formData.featureType = resultCache.features[0]  // 取第一个特征类型
    // console.log('✅ 自动填入特征:', 'featureType=', resultCache.features[0], ', featureField=', newFeature)
  } else {
    console.warn('⚠️ resultCache.features 为空，无法填入 featureType')
  }
}, { immediate: true })

// 监听 openPanel 查询参数，自动展开面板
watch(() => route.query.openPanel, (newVal) => {
  if (newVal === 'true' && !isPanelOpen.value) {
    isPanelOpen.value = true
    emit('panel-toggle', true)
  }
}, { immediate: true })

// 地点输入处理（防抖）
const handleLocationInput = () => {
  showSuggestions.value = false

  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(async () => {
    const query = formData.location.trim()
    if (!query) {
      suggestions.value = []
      return
    }

    try {
      const response = await api(`/api/batch_match?input_string=${encodeURIComponent(query)}&filter_valid_abbrs_only=false`)
      if (response && response.length > 0) {
        const items = response[0].items || []
        // 过滤掉已存在的项
        suggestions.value = Array.from(new Set(items)).filter(item => item !== query)
        showSuggestions.value = suggestions.value.length > 0
      }
    } catch (error) {
      console.error('地点匹配失败:', error)
    }
  }, 300)
}

// 选择建议项
const selectSuggestion = async (item) => {
  formData.location = item
  showSuggestions.value = false

  // 自动获取音典分区
  try {
    const response = await api(`/api/get_regions?input_data=${encodeURIComponent(item)}`)
    if (response && response['音典分區']) {
      formData.region = response['音典分區']
    } else {
      formData.region = '未找到對應的分區'
    }
  } catch (error) {
    console.error('获取分区失败:', error)
    formData.region = '請求失敗'
  }
}

// 隐藏建议列表
const hideSuggestions = () => {
  setTimeout(() => {
    showSuggestions.value = false
  }, 200)
}

// 表单验证
const validateForm = () => {
  if (!formData.location.trim()) {
    showWarning('請填寫地點（簡稱）')
    return false
  }
  if (!formData.region.trim()) {
    showWarning('請填寫分區')
    return false
  }
  if (!formData.coordinates.trim()) {
    showWarning('請填寫經緯度')
    return false
  }
  if (!formData.featureType.trim()) {
    showWarning('請填寫特徵類型')
    return false
  }
  if (!formData.featureField.trim()) {
    showWarning('請填寫特徵子字段')
    return false
  }
  if (!formData.value.trim()) {
    showWarning('請填寫值')
    return false
  }
  return true
}

// 提交表单
const handleSubmit = async () => {
  // 检查用户是否登录
  if (!userStore.isAuthenticated) {
    showWarning('提交個人數據需登錄')
    return
  }

  // 表单验证
  if (!validateForm()) {
    return
  }

  try {

    const payload = {
      location: formData.location.trim(),
      region: formData.region.trim(),
      coordinates: formData.coordinates.trim(),
      phonology: formData.featureType.trim(),    // ← 使用中文字段名
      feature: formData.featureField.trim(),     // ← 使用中文字段名
      value: formData.value.trim(),
      description: formData.description.trim() || null
    }

    const response = await api('/api/submit_form', {
      method: 'POST',
      body: JSON.stringify(payload)
    })

    if (response.success) {
      showSuccess('提交成功！')
      // 清空表单（可选）
      resetForm()
      // 触发父组件刷新
      emit('submit-success', response)
    } else {
      showError('提交失敗：' + response.message)
    }
  } catch (error) {
    console.error('提交失败:', error)
    showError('提交時發生錯誤：' + error.message)
  }
}

// 重置表单
const resetForm = () => {
  formData.location = ''
  formData.region = ''
  formData.coordinates = ''
  formData.featureType = ''
  formData.featureField = ''
  formData.value = ''
  formData.description = ''
}
</script>

<style scoped>
/* 右侧面板容器 */
.custom-data-panel {
  position: fixed;
  top: 50%;
  right: 0;
  transform: translateY(-50%) translateX(100%);
  width: 300px;
  max-height: 90vh;
  background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.9),
      rgba(255, 255, 255, 0.85)
  );
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  border-radius: 20px 0 0 20px;
  box-shadow:
      0 8px 32px rgba(0, 0, 0, 0.15),
      inset 0 0 0 0.5px rgba(255, 255, 255, 0.5);
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 9999;
  overflow-y: auto;
}

.custom-data-panel.open {
  transform: translateY(-50%) translateX(0);
}

/* 展开/收起按钮（固定在屏幕右边缘） */
.expand-button {
  position: fixed;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #007aff, #0051d5);
  color: white;
  border: none;
  border-radius: 12px 0 0 12px;
  font-size: 24px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000; /* 比面板高一层 */
}

.expand-button:hover {
  background: linear-gradient(135deg, #0051d5, #003a99);
  box-shadow: 0 6px 16px rgba(0, 122, 255, 0.4);
  transform: translateY(-50%) translateX(-4px); /* 悬停时稍微向左移 */
}

.expand-button.open {
  right: 300px; /* 面板展开时，按钮移到面板左侧 */
}

/* 面板内容 */
.panelContent {
  padding: 12px;
  max-height: calc(90vh - 48px);
  overflow-y: auto;
}

.panel-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary, #2c3e50);
  text-align: center;
  margin:10px 0;
}

/* 表单样式 */
.data-form {
  display: flex;
  flex-direction: column;
  gap: 10px;              /* 增加间距以容纳 hint */
}

.form-group {
  position: relative;
  display: flex;
  flex-direction: row;  /* 改为水平排列 */
  align-items: center;   /* 垂直居中对齐 */
  gap: 8px;              /* label 和 input 之间的间距 */
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary, #2c3e50);
  max-width: 60px;       /* 限定 label 最大宽度 */
  min-width: 60px;       /* 保持 label 宽度一致 */
  flex-shrink: 0;        /* 防止 label 被压缩 */
  text-align: right;     /* 右对齐，更整齐 */
}

.required {
  color: #ff3b30;
  margin-left: 2px;
}

.form-group input,
.form-group textarea {
  flex: 1;               /* 占据剩余空间 */
  padding: 8px 10px;     /* 略微减小 padding 以适应更紧凑的布局 */
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #007aff;
  background: white;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

.form-group textarea {
  resize: vertical;
  font-family: inherit;
}

.hint {
  position: absolute;
  bottom: -18px;         /* 放在 form-group 下方 */
  left: 88px;            /* 与 input 左对齐（80px label + 8px gap） */
  font-size: 11px;
  color: #8e8e93;
  white-space: nowrap;   /* 防止换行 */
}

/* 建议列表 */
.suggestions-box {
  position: absolute;
  top: 100%;
  left: 88px;            /* 与 input 左对齐（80px label + 8px gap） */
  right: 0;
  max-height: 300px;
  overflow-y: auto;
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  margin-top: 4px;
}

.suggestion-item {
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.2s ease;
  text-align: center;
  font-size: 16px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.suggestion-item:hover {
  background: rgba(0, 122, 255, 0.1);
}

/* 提交按钮 */
.submit-btn {
  padding: 12px 24px;
  background: #007aff;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(52, 199, 89, 0.3);
  transition: all 0.3s ease;
  margin-top: 8px;
}

.submit-btn:hover {
  background: linear-gradient(135deg, #30d158, #28cd4c);
  box-shadow: 0 6px 16px rgba(52, 199, 89, 0.4);
  transform: translateY(-2px);
}

.submit-btn:active {
  transform: translateY(0);
}

/* 滚动条样式 */
.custom-data-panel::-webkit-scrollbar,
.panelContent::-webkit-scrollbar {
  width: 6px;
}

.custom-data-panel::-webkit-scrollbar-track,
.panelContent::-webkit-scrollbar-track {
  background: transparent;
}

.custom-data-panel::-webkit-scrollbar-thumb,
.panelContent::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.custom-data-panel::-webkit-scrollbar-thumb:hover,
.panelContent::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

/* 响应式 */
@media (max-width: 768px) {
  /* 移动端：面板占据大部分屏幕宽度 */
  .custom-data-panel {
    width: calc(100vw - 80px);
    max-width: none;
    border-radius: 16px 0 0 16px;
    top: 40%;
  }

  .panelContent {
    padding: 8px 6px;
    max-height: calc(90vh - 32px);
    overflow-y: auto;
  }

  .panel-title {
    font-size: 18px;
    margin-bottom: 16px;
  }

  /* 移动端按钮 */
  .expand-button {
    width: 40px;
    height: 40px;
    font-size: 20px;
    border-radius: 10px 0 0 10px;
    top: 40%;
  }

  .expand-button.open {
    right: calc(100vw - 80px);
  }

  .expand-button:hover {
    transform: translateY(-50%); /* 移动端不需要悬停位移效果 */
  }

  /* 移动端表单优化 */
  .data-form {
    gap: 8px;            /* 增加表单项之间的间距，因为有 hint */
  }

  .form-group {
    gap: 6px;
  }

  .form-group label {
    font-size: 13px;
    max-width: 70px;     /* 移动端减小 label 宽度 */
    min-width: 70px;
  }

  .form-group input,
  .form-group textarea {
    font-size: 14px;
    padding: 8px;
  }

  .hint {
    font-size: 10px;
    left: 76px;          /* 调整为新的 label 宽度 + gap */
  }

  .suggestions-box {
    left: 76px;          /* 调整为新的 label 宽度 + gap */
    font-size: 14px;
  }

  .suggestion-item {
    padding: 10px;
  }

  /* 提交按钮移动端优化 */
  .submit-btn {
    padding: 12px 20px;
    font-size: 15px;
  }
}

/* 小屏幕手机优化 */
@media (max-width: 480px) {
  .custom-data-panel {
    width: calc(100vw - 50px);
    top: 40%;
  }

  .panelContent {
    padding: 6px 5px;
  }

  .panel-title {
    font-size: 16px;
  }

  .expand-button {
    width: 36px;
    height: 36px;
    font-size: 18px;
    top: 40%;
  }

  .expand-button.open {
    right: calc(100vw - 50px);
  }

  .form-group label {
    font-size: 12px;
    max-width: 60px;     /* 小屏幕进一步减小 label 宽度 */
    min-width: 60px;
  }

  .form-group input,
  .form-group textarea {
    font-size: 13px;
    padding: 6px 8px;
  }

  .hint {
    font-size: 10px;
    left: 66px;          /* 调整为新的 label 宽度 + gap */
  }

  .suggestions-box {
    left: 66px;
  }

  .submit-btn {
    padding: 10px 16px;
    font-size: 14px;
  }
}

/* 横屏模式优化 */
@media (max-height: 600px) and (orientation: landscape) {
  .custom-data-panel {
    max-height: 80dvh;
  }

  .panelContent {
    padding: 6px;
  }

  .panel-title {
    font-size: 16px;
    margin-bottom: 12px;
  }

  .data-form {
    gap: 4px;
  }

  .form-group {
    gap: 6px;
  }

  .form-group label {
    font-size: 12px;
    max-width: 65px;
    min-width: 65px;
  }

  .form-group input,
  .form-group textarea {
    padding: 6px 8px;
  }

  .hint {
    font-size: 10px;
    left: 71px;
  }

  .suggestions-box {
    left: 71px;
  }

  .submit-btn {
    padding: 10px 20px;
    margin-top: 4px;
  }
}
</style>

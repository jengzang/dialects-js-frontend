<template>
  <div>
      <div class="page-content-stack">
      <div class="page-footer">
        <h3 style="margin:0">搜索自定義特徵</h3>
        <div class="button-row" v-if="!userStore.isAuthenticated">
          <button class="enter-btn" @click="handleLogin">🔐 登錄</button>
        </div>
      </div>

        <!-- LocationAndRegionInput 组件 -->
        <LocationAndRegionInput
          v-model="locationData"
          :useInputMode="true"
          style="margin-top: 12px;"
        />

        <!-- 特征搜索输入框 -->
        <div class="feature-search-container">
          <label for="featureSearch" class="query-label">特徵搜索</label>
          <div class="search-input-wrapper">
            <input
              id="featureSearch"
              v-model="featureSearchInput"
              type="text"
              placeholder="請輸入特徵關鍵詞..."
              @input="handleFeatureInput"
              @focus="handleInputFocus"
              class="feature-search-input"
            />
            <span v-if="isSearching" class="loading-icon">⏳</span>
          </div>

          <!-- Dropdown 下拉列表 (使用 Teleport) -->
          <Teleport to="body">
            <div
              v-if="showSuggestions && featureSuggestions.length > 0"
              class="dropdown-panel"
              :style="dropdownStyle"
              ref="featureDropdownEl"
            >
              <div
                class="dropdown-item"
                v-for="feature in featureSuggestions"
                :key="feature"
                @mousedown.prevent="selectFeature(feature)"
              >
                {{ feature }}
              </div>
            </div>
          </Teleport>
        </div>

        <!-- 已选择的特征显示 -->
        <div v-if="selectedFeature" class="selected-feature">
          ✅ 已選擇：<strong>{{ selectedFeature }}</strong>
        </div>

        <!-- 运行查询按钮 -->
        <div class="button-group">
          <button
            class="action-btn primary-btn"
            @click="handleRunQuery"
            :disabled="isDisabled"
          >
            <span v-if="buttonState.isRunning">🔄 運行中...</span>
            <span v-else>🚀 運行查詢</span>
          </button>
        </div>

        <!-- 分隔线 -->
        <div class="divider">
          <span>添加新的自定義數據</span>
        </div>

        <!-- 使用说明链接 -->
        <div class="help-trigger-wrapper">
          <span class="help-trigger" @click="openHelpModal">
            不知道如何添加數據❓點此查看使用說明
          </span>
        </div>

        <!-- 添加按钮 -->
        <div class="button-group">
          <div class="button-with-help">
            <button class="action-btn add-single-btn" @click="handleAddSingle">
              📝 逐條添加
            </button>
            <div
              class="help-icon"
              @mouseenter="!isMobile ? showTooltip('single') : null"
              @mouseleave="!isMobile ? hideTooltip() : null"
              @click="isMobile ? toggleTooltip('single') : null"
            >
              ?
            </div>
            <Teleport to="body">
              <Transition name="tooltip-fade">
                <div
                  v-if="activeTooltip === 'single'"
                  class="tooltip-panel"
                  :style="tooltipStyle"
                >
                  跳轉至地圖頁面，點擊地圖即可獲取經緯度
                </div>
              </Transition>
            </Teleport>
          </div>

          <div class="button-with-help">
            <button class="action-btn add-batch-btn" @click="handleAddBatch">
              📋 批量添加
            </button>
            <div
              class="help-icon"
              @mouseenter="!isMobile ? showTooltip('batch') : null"
              @mouseleave="!isMobile ? hideTooltip() : null"
              @click="isMobile ? toggleTooltip('batch') : null"
            >
              ?
            </div>
            <Teleport to="body">
              <Transition name="tooltip-fade">
                <div
                  v-if="activeTooltip === 'batch'"
                  class="tooltip-panel"
                  :style="tooltipStyle"
                >
                  批量添加多條數據，支持從excel粘貼
                </div>
              </Transition>
            </Teleport>
          </div>
        </div>
      </div>
    <!-- 帮助弹窗 -->
    <Teleport to="body">
      <Transition name="fade-scale">
        <div v-if="isHelpModalOpen" class="glass-modal-overlay" @click.self="closeHelpModal">
          <div class="glass-card help-modal">
            <button class="close-btn" @click="closeHelpModal">&times;</button>
            <h3 class="modal-title">自定義數據使用說明</h3>

            <div class="help-content">
              <div class="help-section">
                <h4 class="section-title">📋 功能說明</h4>
                <ul class="help-list">
                  <li>🧩 您可以自由添加點、設置該點對應的特徵</li>
                  <li>🖌️ 網站會根據特徵自動分配顏色</li>
                  <li>👤 您將創建的是僅屬於您的數據，故需要登錄</li>
                  <li>🤝 本站承諾：不會洩漏您的個人數據</li>
                </ul>
              </div>

              <div class="help-section">
                <h4 class="section-title">📝 添加數據步驟</h4>
                <ul class="help-list">
                  <li><strong>點擊下方按鈕</strong> 右側將彈出一個面板</li>
                  <li>您需在面板中填入簡稱、分區、聲韻調、特徵、值</li>
                  <li>"聲韻調"是指分析的"聲母/韻母/聲調"</li>
                  <li>"特徵"是指分析的類別，例如"流攝"</li>
                  <li>"值"是顯示在地圖上的，例如"iu"</li>
                  <li>點擊地圖即可自動填入經緯度</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import LocationAndRegionInput from '@/components/query/LocationAndRegionInput.vue'
import { api } from '@/utils/auth.js'
import { userStore, resultCache, mapStore, uiStore, isCustomButtonDisabled, setRunning } from '@/utils/store.js'
import { showSuccess, showError, showWarning, showInfo } from '@/utils/message.js'

const router = useRouter()
const route = useRoute()

// 地点和分区数据
const locationData = ref({
  locations: [],
  regions: [],
  regionUsing: 'map'
})

// 特征搜索相关状态
const featureSearchInput = ref('')
const featureSuggestions = ref([])
const selectedFeature = ref('')
const isSearching = ref(false)
// 使用 uiStore 中的按钮状态（不再定义本地 isRunning）
const buttonState = uiStore.buttonStates.custom
const isDisabled = isCustomButtonDisabled
const showSuggestions = ref(false)
const featureDropdownEl = ref(null)

// 同步 selectedFeature 到 store
watch(selectedFeature, (newVal) => {
  uiStore.buttonStates.custom.hasSelectedFeature = !!newVal
}, { immediate: true })

// 帮助弹窗状态
const isHelpModalOpen = ref(false)

// Tooltip 相關狀態
const activeTooltip = ref(null)
const tooltipStyle = reactive({
  position: 'absolute',
  top: '0px',
  left: '0px',
  zIndex: 99999
})

// Mobile detection
const isMobile = ref(false)
const checkMobile = () => {
  isMobile.value = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

// Tooltip timer for mobile auto-hide
let tooltipTimer = null

// Dropdown 样式（动态计算位置）
const dropdownStyle = reactive({
  position: 'absolute',
  top: '0px',
  left: '0px',
  minWidth: '200px',
  zIndex: 99999
})

// 防抖计时器
let featureDebounceTimer = null

// 打开/关闭帮助弹窗
const openHelpModal = () => {
  isHelpModalOpen.value = true
}

const closeHelpModal = () => {
  isHelpModalOpen.value = false
}

// Tooltip 控制函數
const showTooltip = (type) => {
  activeTooltip.value = type
  updateTooltipPosition(type)
}

const hideTooltip = () => {
  activeTooltip.value = null
}

const toggleTooltip = (type) => {
  if (activeTooltip.value === type) {
    activeTooltip.value = null
    clearTimeout(tooltipTimer)
  } else {
    activeTooltip.value = type
    updateTooltipPosition(type)

    // 移動端自動隱藏（3秒後）
    clearTimeout(tooltipTimer)
    tooltipTimer = setTimeout(() => {
      activeTooltip.value = null
    }, 3000)
  }
}

const updateTooltipPosition = (type) => {
  nextTick(() => {
    const helpIcons = document.querySelectorAll('.help-icon')
    let targetIcon = null

    if (type === 'single') {
      targetIcon = helpIcons[0]
    } else if (type === 'batch') {
      targetIcon = helpIcons[1]
    }

    if (targetIcon) {
      const rect = targetIcon.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      const tooltipWidth = 250 // 預估 tooltip 寬度
      const tooltipHeight = 60 // 預估 tooltip 高度

      // 計算初始位置（圖標下方居中）
      let left = rect.left + window.scrollX + (rect.width / 2) - (tooltipWidth / 2)
      let top = rect.bottom + window.scrollY + 8

      // 檢查右邊界
      if (left + tooltipWidth > viewportWidth) {
        left = viewportWidth - tooltipWidth - 10
      }

      // 檢查左邊界
      if (left < 10) {
        left = 10
      }

      // 檢查下邊界（如果超出，顯示在圖標上方）
      if (rect.bottom + tooltipHeight + 8 > viewportHeight) {
        top = rect.top + window.scrollY - tooltipHeight - 8
      }

      tooltipStyle.position = 'absolute'
      tooltipStyle.top = `${top}px`
      tooltipStyle.left = `${left}px`
      tooltipStyle.zIndex = 99999
    }
  })
}

// 登录
const handleLogin = () => {
  router.push('/auth')
}

// 处理输入事件（防抖搜索）
const handleFeatureInput = () => {
  clearTimeout(featureDebounceTimer)

  // 允许空搜索，后端会返回所有特征
  featureDebounceTimer = setTimeout(() => {
    searchCustomFeatures()
  }, 300)
}

// 处理输入框聚焦事件
const handleInputFocus = () => {
  if (featureSuggestions.value.length > 0) {
    showSuggestions.value = true
    updateDropdownPosition()
  }
}

// 搜索自定义特征
const searchCustomFeatures = async () => {
  const word = featureSearchInput.value.trim()

  isSearching.value = true

  try {
    // 构建查询参数
    const params = new URLSearchParams()

// 添加地点
    if (locationData.value.locations && locationData.value.locations.length > 0) {
      locationData.value.locations.forEach(loc => {
        if (loc) params.append('locations', loc)
      })
    } else {
      params.append('locations', '')  // 确保传递空值
    }

// 添加分区
    if (locationData.value.regions && locationData.value.regions.length > 0) {
      locationData.value.regions.forEach(reg => {
        if (reg) params.append('regions', reg)
      })
    } else {
      params.append('regions', '')  // 确保传递空值
    }


    // 添加搜索词（允许空字符串，后端会返回所有特征）
    params.set('word', word)

    // 调用 API
    const response = await api(`/api/get_custom_feature?${params.toString()}`)

    if (Array.isArray(response) && response.length > 0) {
      // 后端返回的是对象数组: { "簡稱": "test", "聲韻調": "", "特徵": "流" }
      // 只提取 "特徵" 字段并去重
      featureSuggestions.value = [...new Set(response.map(item => item.特徵).filter(Boolean))]
      showSuggestions.value = true

      // 更新下拉列表位置
      nextTick(() => {
        updateDropdownPosition()
      })
    } else {
      featureSuggestions.value = []
      showSuggestions.value = false
      showInfo('未找到匹配的特征')
    }
  } catch (error) {
    console.error('搜索特征失败:', error)
    showError('搜索失败：' + error.message)
    featureSuggestions.value = []
    showSuggestions.value = false
  } finally {
    isSearching.value = false
  }
}

// 更新下拉列表位置
const updateDropdownPosition = () => {
  const inputEl = document.getElementById('featureSearch')
  if (inputEl) {
    const rect = inputEl.getBoundingClientRect()
    dropdownStyle.position = 'absolute'
    dropdownStyle.top = `${rect.bottom + window.scrollY}px`
    dropdownStyle.left = `${rect.left + window.scrollX}px`
    dropdownStyle.minWidth = `${rect.width}px`
    dropdownStyle.zIndex = 99999
  }
}

// 选择特征
const selectFeature = (feature) => {
  selectedFeature.value = feature
  featureSearchInput.value = feature
  showSuggestions.value = false
}

// 点击外部关闭下拉列表
const onClickOutside = (event) => {
  const inputEl = document.getElementById('featureSearch')
  const dropdownEl = featureDropdownEl.value

  const isInsideInput = inputEl?.contains(event.target)
  const isInsideDropdown = dropdownEl?.contains(event.target)

  if (!isInsideInput && !isInsideDropdown) {
    showSuggestions.value = false
  }
}

onMounted(() => {
  checkMobile()
  document.addEventListener('click', onClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onClickOutside)
  clearTimeout(featureDebounceTimer)
  clearTimeout(tooltipTimer)
})

// 运行查询
const handleRunQuery = () => {
  if (!selectedFeature.value) {
    showWarning('请先选择一个特征')
    return
  }

  setRunning('custom', true)

  try {
    // 清空地图数据
    mapStore.mergedData = []
    resultCache.latestResults = []
    mapStore.selectedFeature = ''
    resultCache.features = []
    mapStore.mapData = null

    // 构建查询参数
    const query = {
      tab: 'map',
      sub: 'map',
      feature: selectedFeature.value
    }

    // 添加地点参数
    if (locationData.value.locations && locationData.value.locations.length > 0) {
      query.locations = locationData.value.locations.join(',')
    }

    // 添加分区参数
    if (locationData.value.regions && locationData.value.regions.length > 0) {
      query.regions = locationData.value.regions.join(',')
    }

    // 添加分区模式
    query.regionMode = locationData.value.regionUsing || 'map'

    // 跳转到地图页面
    router.replace({ query })

    showSuccess('正在加载特征数据...')

    // 清空選中的特徵
    selectedFeature.value = ''
    featureSearchInput.value = ''

    // 延迟重置运行状态（跳转后组件不会被销毁，需要手动重置）
    setTimeout(() => {
      setRunning('custom', false)
    }, 1000)
  } catch (error) {
    console.error('跳转失败:', error)
    showError('操作失败：' + error.message)
    setRunning('custom', false)
  }
}

// 逐条添加：跳转到 map 页面并打开面板
const handleAddSingle = () => {
  // 如果当前不是查中古或查音位模式，清空地图数据
  const currentMode = resultCache.mode || ''
  if (currentMode !== '查中古' && currentMode !== '查音位') {
    // 清空地图绘图数据
    mapStore.mergedData = []
    resultCache.latestResults = []
    mapStore.selectedFeature = ''
    resultCache.features = []
  }

  // 设置查询模式为"查中古"，确保面板能够显示
  resultCache.mode = '查中古'
  router.replace({ query: { tab: 'map', sub: 'map', openPanel: 'true' } })
}

// 批量添加：跳转到个人数据管理页面
const handleAddBatch = () => {
  // 检查是否已登录
  if (!userStore.isAuthenticated) {
    showWarning('請先登錄')
    router.push('/auth')
    return
  }

  // 跳转到个人数据管理页面
  router.push({
    path: '/auth/data',
    query: { username: userStore.username }
  })
}
</script>

<style scoped>
/* 特征搜索容器 */
.feature-search-container {
  width: 100%;
  max-width: 400px;
  margin: 10px auto 0;
  position: relative;
}

.query-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 6px;
  text-align: center;
}

/* 搜索输入框包装器 */
.search-input-wrapper {
  position: relative;
  width: 100%;
}

.feature-search-input {
  width: 100%;
  padding: 10px 40px 10px 12px;
  font-size: 14px;
  border: 1px solid #ddd;
  border-radius: 8px;
  outline: none;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.feature-search-input:focus {
  border-color: #007aff;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

/* 加载图标 */
.loading-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 16px;
}

/* 已选择特征显示 */
.selected-feature {
  text-align: center;
  margin-top: 12px;
  padding: 8px 12px;
  background: #e6f7ff;
  border-radius: 8px;
  color: #0050b3;
  font-size: 14px;
}

.selected-feature strong {
  color: #003a8c;
}

/* 按钮组容器 */
.button-group {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 30px;
  margin-top: 10px;
  flex-wrap: wrap;
}

/* 按鈕與幫助圖標容器 */
.button-with-help {
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
}

/* 幫助圖標 - 蘋果液態玻璃風格 */
.help-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  color: #007aff;
  cursor: pointer;
  user-select: none;

  /* 液態玻璃效果 */
  background: linear-gradient(
    145deg,
    rgba(255, 255, 255, 0.9),
    rgba(255, 255, 255, 0.7)
  );
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);

  /* 邊框和陰影 */
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow:
    inset 0 0 0.5px rgba(255, 255, 255, 0.3),
    0 4px 12px rgba(0, 122, 255, 0.15),
    0 0 0 0.5px rgba(255, 255, 255, 0.1);

  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.help-icon:hover {
  background: linear-gradient(
    145deg,
    rgba(255, 255, 255, 1),
    rgba(255, 255, 255, 0.85)
  );
  box-shadow:
    inset 0 0 0.5px rgba(255, 255, 255, 0.5),
    0 6px 16px rgba(0, 122, 255, 0.25),
    0 0 0 0.5px rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.help-icon:active {
  transform: scale(1.05);
  box-shadow:
    inset 0 0 0.5px rgba(255, 255, 255, 0.3),
    0 2px 8px rgba(0, 122, 255, 0.2);
}

/* Tooltip 面板 - 蘋果液態玻璃風格 */
.tooltip-panel {
  position: absolute;
  padding: 10px 14px;
  max-width: min(250px, calc(100vw - 20px)); /* 確保不超出屏幕 */
  font-size: 13px;
  line-height: 1.5;
  color: #1d1d1f;
  text-align: center;
  pointer-events: none;
  word-wrap: break-word; /* 長文字自動換行 */

  /* 液態玻璃效果 */
  background: linear-gradient(
    145deg,
    rgba(255, 255, 255, 0.95),
    rgba(255, 255, 255, 0.85)
  );
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);

  /* 邊框和陰影 */
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 12px;
  box-shadow:
    inset 0 0 0.5px rgba(255, 255, 255, 0.3),
    0 8px 24px rgba(0, 0, 0, 0.15),
    0 0 0 0.5px rgba(255, 255, 255, 0.1);
}

/* Tooltip 過渡動畫 */
.tooltip-fade-enter-active,
.tooltip-fade-leave-active {
  transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.tooltip-fade-enter-from,
.tooltip-fade-leave-to {
  opacity: 0;
  transform: translateY(-5px) scale(0.95);
}

/* 通用按钮样式（非悬浮） */
.action-btn {
  padding: 10px 20px;
  font-size: 15px;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.action-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.action-btn:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* 主要按钮（运行查询） */
.primary-btn {
  background: linear-gradient(135deg, #007aff, #0051d5);
  color: white;
}

.primary-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #0051d5, #003db3);
}

/* 逐条添加按钮 */
.add-single-btn {
  background: linear-gradient(135deg, #499f4c, #2c813b);
  color: white;
}

.add-single-btn:hover {
  background: linear-gradient(135deg, #5EDE68, #34C759);
}

/* 批量添加按钮 */
.add-batch-btn {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;

}

.add-batch-btn:hover {
  background: linear-gradient(135deg, #5568d3, #5f3d8a);

}

/* 使用说明触发器 */
.divider {
  margin: 40px 0 12px;
  text-align: center;
  position: relative;
}

.divider::before,
.divider::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 35%;
  height: 1px;
  background: linear-gradient(to right, transparent, #7c7575, transparent);
}

.divider::before {
  left: 0;
}

.divider::after {
  right: 0;
}

.divider span {
  display: inline-block;
  padding: 0 12px;
  color: #353535;
  font-weight: bold;
  font-size: 17px;
  background: white;
  position: relative;
  z-index: 1;
}

/* 使用说明触发器 */
.help-trigger-wrapper {
  text-align: center;
  margin: 12px 0;
}

.help-trigger {
  font-size: 13px;
  color: #007aff;
  cursor: pointer;
  transition: opacity 0.2s;
  text-decoration: none;
}

.help-trigger:hover {
  opacity: 0.7;
  text-decoration: underline;
}

/* 帮助弹窗样式 */
.help-modal {
  position: relative;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  padding: 30px;
}

.modal-title {
  margin: 0 0 20px 0;
  font-size: 20px;
  font-weight: 600;
  color: #333;
  text-align: center;
}

.help-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.help-section {
  background: rgba(255, 255, 255, 0.5);
  padding: 15px;
  border-radius: 10px;
}

.section-title {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #007aff;
}

.help-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.help-list li {
  padding: 8px 0;
  font-size: 14px;
  line-height: 1.6;
  color: #555;
}

.help-list li strong {
  color: #333;
  font-weight: 600;
}

/* 过渡动画 */
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

/* 移动端适配 */
@media (max-aspect-ratio: 1/1) {
  .button-group {
    gap:10px;
    flex-direction: column;
  }

  .action-btn {
    width: 90%;
  }

  .feature-search-container {
    max-width: 90%;
  }

  .help-modal {
    padding: 20px;
  }
}
</style>

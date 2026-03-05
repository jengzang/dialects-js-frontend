<template>
  <Teleport to="body">
    <Transition name="popup-fade">
      <div v-if="visible" class="benefits-popup-overlay" @click.self="closePopup">
        <div class="benefits-popup popup-animated">
          <!-- Fixed Header -->
          <div class="popup-header">
            <h3>✨ 登錄解鎖更多功能</h3>
            <button class="popup-close-btn" @click="closePopup">✕</button>
          </div>

          <!-- Scrollable Content -->
          <div class="popup-content">
            <!-- Comparison Table -->
            <div class="benefits-section">
            <h4 class="section-title">🎯 權限對比</h4>
            <div class="comparison-table-wrapper">
              <table class="comparison-table">
                <thead>
                  <tr>
                    <th>功能</th>
                    <th class="visitor-col">🚶 遊客</th>
                    <th class="member-col">👑 用戶</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in comparisonData" :key="item.feature" class="table-row">
                    <td class="feature-name">{{ item.feature }}</td>
                    <td class="visitor-cell" :class="getCellClass('anonymous', item)">
                      {{ formatLimit(item.anonymous, item.unit) }}
                    </td>
                    <td class="member-cell" :class="getCellClass('user', item)">
                      <span class="member-value">{{ formatLimit(item.user, item.unit) }}</span>
                      <span v-if="item.user !== Infinity && item.user > item.anonymous" class="upgrade-badge">
                        ↑ {{ Math.round((item.user / item.anonymous - 1) * 100) }}%
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- 说明文案 -->
          <div class="benefits-notice">
            <p>💡 登錄解鎖更多權益！為保證流暢體驗，目前多地點併發查詢及進階分析功能僅對登錄用戶開放🚀
              （訪客仍可無限次使用基礎查詢功能）</p>
          </div>

          <!-- Core Features -->
          <div class="benefits-section">
            <h4 class="section-title">🌟 核心功能</h4>
            <div class="features-grid">
              <div v-for="feature in coreFeatures" :key="feature.name" class="feature-item">
                <span class="feature-icon">{{ feature.icon }}</span>
                <span class="feature-text">{{ feature.name }}</span>
              </div>
            </div>
          </div>

          <!-- Call to Action (only for anonymous) -->
          <div v-if="!isAuthenticated" class="benefits-cta">
            <button class="btn-register" @click="goToRegister">
              🚀 立即註冊，解鎖用戶權限
            </button>
            <p class="cta-hint">完全免費，30秒完成註冊</p>
          </div>
          </div><!-- End of popup-content -->
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount } from 'vue'
import { userStore } from '@/store/store.js'
import { ROLE_LIMITS, LOCATION_LIMITS } from '@/config/constants.js'

const props = defineProps({
  visible: { type: Boolean, default: false }
})

const emit = defineEmits(['close', 'register'])

const isAuthenticated = computed(() => userStore.isAuthenticated)

// 权限对比数据（只显示匿名和注册用户）
const comparisonData = computed(() => [
  {
    feature: '🔍 查字',
    unit: '個地點',
    anonymous: LOCATION_LIMITS.tab1.anonymous.MAX_LOCATIONS,
    user: LOCATION_LIMITS.tab1.user.MAX_LOCATIONS
  },
  {
    feature: '📜 查中古',
    unit: '個地點',
    anonymous: LOCATION_LIMITS.tab2.anonymous.MAX_LOCATIONS,
    user: LOCATION_LIMITS.tab2.user.MAX_LOCATIONS
  },
  {
    feature: '🔊 查音位',
    unit: '個地點',
    anonymous: LOCATION_LIMITS.tab3.anonymous.MAX_LOCATIONS,
    user: LOCATION_LIMITS.tab3.user.MAX_LOCATIONS
  },
  {
    feature: '🎵 查調',
    unit: '個地點',
    anonymous: LOCATION_LIMITS.tab4.anonymous.MAX_LOCATIONS,
    user: '✅️ 不限'
  },
  {
    feature: '🗂️ 自定義分區',
    anonymous: '🔒 用戶',
    user: '✅️ 開放'
  },
  {
    feature: '🧩 地位組合',
    unit: '組',
    anonymous: ROLE_LIMITS.anonymous.MAX_COMBINATIONS,
    user: ROLE_LIMITS.user.MAX_COMBINATIONS
  },
  {
    feature: '🔠 漢字比較',
    unit: '個地點',
    anonymous: LOCATION_LIMITS.compare_tab1.anonymous.MAX_LOCATIONS,
    user: LOCATION_LIMITS.compare_tab1.user.MAX_LOCATIONS
  },
  {
    feature: '📜 中古比較',
    unit: '個地點',
    anonymous: LOCATION_LIMITS.compare_tab2.anonymous.MAX_LOCATIONS,
    user: LOCATION_LIMITS.compare_tab2.user.MAX_LOCATIONS
  },

  {
    feature: '📈 調類比較',
    unit: '個地點',
    anonymous: LOCATION_LIMITS.compare_tab4.anonymous.MAX_LOCATIONS,
    user: LOCATION_LIMITS.compare_tab4.user.MAX_LOCATIONS
  },
  {
    feature: '🗺️ 分區圖',
    unit: '個地點',
    anonymous: LOCATION_LIMITS.divide.anonymous.MAX_LOCATIONS,
    user: LOCATION_LIMITS.divide.user.MAX_LOCATIONS
  },
  {
    feature: '📊 音系查詢',
    anonymous: '✅️ 開放',
    user: '✅️ 開放'
  },
  {
    feature: '🎯 音素分類',
    anonymous: '✅️ 開放',
    user: '✅️ 開放'
  },
  {
    feature: '📈 音節統計',
    anonymous: '✅️ 開放',
    user: '✅️ 開放'
  },
  {
    feature: '💠 自定義數據',
    anonymous: '🔒 用戶',
    user: '✅️ 開放'
  },
  {
    feature: '🎙️ Praat分析',
    anonymous: '🔒 用戶',
    user: '✅️ 開放'
  },
  {
    feature: '✏️ 字表檢查',
    anonymous: '🔒 用戶',
    user: '✅️ 開放'
  },
  {
    feature: '🔤 粵拼轉IPA',
    anonymous: '🔒 用戶',
    user: '✅️ 開放'
  },
  {
    feature: '🔗 字表合併',
    anonymous: '🔒 用戶',
    user: '✅️ 開放'
  },
  {
    feature: '🗂️ 語保查詢',
    anonymous: '✅️ 開放',
    user: '✅️ 開放'
  },
  {
    feature: '🏘️ 廣東村落',
    anonymous: '✅️ 開放',
    user: '✅️ 開放'
  },
  {
    feature: '🤖 機器學習',
    anonymous: '⚠️ 部分',
    user: '✅️ 全部'
  },
  {
    feature: '⏳ 每小時接口使用',
    unit: '秒',
    anonymous: 300,
    user: 2000
  },
  {
    feature: '📦 最大返回json',
    unit: 'MB',
    anonymous: 1,
    user: 6
  }
])

// 核心功能列表
const coreFeatures = [
  { icon: '🔍', name: '音韻查詢' },
  { icon: '🗺️', name: '地理可視化' },
  { icon: '📊', name: '音系分析' },
  { icon: '✒️', name: '字表工具' },
  { icon: '🎙️', name: '聲學分析' },
  { icon: '🏘️', name: '廣東村落' },
  { icon: '📁', name: '自定義數據' },
  { icon: '📈', name: '數據導出' }
]

const formatLimit = (value, unit = '') => {
  if (value === Infinity) return '無限制'
  if (typeof value === 'string') return value  // 处理 "✅️ 開放" 和 "🔒 僅用戶" 等字符串
  return `${value}${unit}`
}

const getCellClass = (role, item) => {
  const currentRole = userStore.role
  return {
    'cell-highlight': role === currentRole,
    'cell-unlimited': item[role] === Infinity
  }
}

const closePopup = () => {
  emit('close')
}

const goToRegister = () => {
  emit('register')
  closePopup()
}

// ESC 键关闭
const handleKeydown = (e) => {
  if (e.key === 'Escape' && props.visible) {
    closePopup()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
/* Overlay */
.benefits-popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999999;
}

/* Popup Container - Apple Liquid Glass Style */
.benefits-popup {
  position: relative;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  border-radius: 24px;
  max-width: 700px;
  width: 90%;
  max-height: 85vh;
  overflow: hidden; /* 改为 hidden，滚动由内部 popup-content 处理 */
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.04),
    0 8px 32px rgba(0, 0, 0, 0.12),
    0 16px 64px rgba(0, 0, 0, 0.08),
    inset 0 0 0 1px rgba(255, 255, 255, 0.9);
  border: 0.5px solid rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
}

/* Popup Header - 固定不滚动 */
.popup-header {
  flex-shrink: 0; /* 防止被压缩 */
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32px 32px 16px 32px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  z-index: 10;
}

.popup-header h3 {
  font-size: 24px;
  font-weight: 700;
  color: #1d1d1f;
  margin: 0;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, #ff9500, #ff8000);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.popup-close-btn {
  flex-shrink: 0;
  background: rgba(0, 0, 0, 0.05);
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 20px;
  color: #86868b;
  transition: all 0.2s ease;
}

.popup-close-btn:hover {
  background: rgba(0, 0, 0, 0.1);
  color: #1d1d1f;
  transform: scale(1.1);
}

/* Popup Content - 可滚动区域 */
.popup-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 24px 32px 32px 32px;
  -webkit-overflow-scrolling: touch;
}

/* 自定义滚动条样式 */
.popup-content::-webkit-scrollbar {
  width: 8px;
}

.popup-content::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
}

.popup-content::-webkit-scrollbar-thumb {
  background: rgba(255, 149, 0, 0.3);
  border-radius: 4px;
}

.popup-content::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 149, 0, 0.5);
}

/* Sections */
.benefits-section {
  margin-bottom: 28px;
}

.benefits-section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 16px 0;
  letter-spacing: -0.01em;
}

/* Comparison Table */
.comparison-table-wrapper {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  border-radius: 12px;
  background: rgba(247, 247, 247, 0.5);
}

.comparison-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 14px;
}

.comparison-table thead {
  background: linear-gradient(135deg, rgba(255, 149, 0, 0.12), rgba(255, 149, 0, 0.08));
}

.comparison-table th {
  padding: 14px 12px;
  text-align: center;
  font-weight: 600;
  color: #1d1d1f;
  border-bottom: 2px solid rgba(255, 149, 0, 0.2);
  white-space: nowrap;
  font-size: 15px;
}

.comparison-table th:first-child {
  text-align: left;
  padding-left: 16px;
}

.visitor-col {
  color: #86868b;
  font-weight: 500;
}

.member-col {
  color: #ff9500;
  font-weight: 700;
  background: linear-gradient(135deg, rgba(255, 149, 0, 0.15), rgba(255, 149, 0, 0.08));
}

.comparison-table tbody tr {
  transition: background 0.2s ease;
}

.comparison-table tbody tr:hover {
  background: rgba(255, 149, 0, 0.05);
}

.comparison-table td {
  padding: 14px 12px;
  text-align: center;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
  color: #1d1d1f;
  font-size: 15px;
}

.comparison-table tbody tr:last-child td {
  border-bottom: none;
}

.feature-name {
  font-weight: 600;
  text-align: left !important;
  padding-left: 16px !important;
  color: #1d1d1f;
}

.visitor-cell {
  color: #86868b;
  font-weight: 500;
}

.member-cell {
  font-weight: 700;
  color: #ff9500;
  background: linear-gradient(135deg, rgba(255, 149, 0, 0.12), rgba(255, 149, 0, 0.06));
  position: relative;
}

.member-value {
  font-size: 16px;
}

.upgrade-badge {
  display: inline-block;
  margin-left: 4px;
  padding: 2px 8px;
  background: linear-gradient(135deg, #34c759, #30d158);
  color: white;
  font-size: 11px;
  font-weight: 700;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(52, 199, 89, 0.3);
}

.cell-highlight {
  background: rgba(255, 149, 0, 0.2);
  font-weight: 700;
  color: rgba(255, 149, 0, 0.76);
  box-shadow: inset 0 0 0 2px rgba(255, 149, 0, 0.3);
}

.cell-unlimited {
  color: #34c759;
  font-weight: 700;
  font-size: 16px;
}

/* Features Grid */
.features-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease;
}

.feature-item:hover {
  background: rgba(255, 255, 255, 0.9);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 149, 0, 0.2);
}

.feature-icon {
  font-size: 24px;
}

.feature-text {
  font-size: 15px;
  font-weight: 500;
  color: #1d1d1f;
}

/* Call to Action */
.benefits-cta {
  margin-top: 24px;
  text-align: center;
}

.btn-register {
  background: linear-gradient(135deg, #ff9500, #ff8000);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 16px 32px;
  font-size: 17px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 6px 16px rgba(255, 149, 0, 0.4);
  width: 100%;
}

.btn-register:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(255, 149, 0, 0.5);
}

.btn-register:active {
  transform: translateY(0);
  box-shadow: 0 4px 12px rgba(255, 149, 0, 0.4);
}

.cta-hint {
  margin-top: 12px;
  font-size: 13px;
  color: #86868b;
  font-weight: 500;
}

/* 说明文案 */
.benefits-notice {
  margin: 20px 0 20px 0;
  padding: 14px 18px;
  background: linear-gradient(135deg, rgba(255, 149, 0, 0.08), rgba(255, 149, 0, 0.04));
  border-left: 3px solid #ff9500;
  border-radius: 12px;
}

.benefits-notice p {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: #1d1d1f;
  font-weight: 500;
}

/* Animations */
.popup-fade-enter-active,
.popup-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.popup-fade-enter-from,
.popup-fade-leave-to {
  opacity: 0;
}

.popup-fade-enter-from .benefits-popup,
.popup-fade-leave-to .benefits-popup {
  transform: scale(0.95) translateY(-20px);
}

.popup-animated {
  animation: popup-bounce-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes popup-bounce-in {
  0% {
    opacity: 0;
    transform: scale(0.9) translateY(-30px);
  }
  50% {
    transform: scale(1.02) translateY(5px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Responsive - Mobile */
@media (max-aspect-ratio: 1/1) {
  .benefits-popup {
    width: 95%;
    max-height: 90vh;
  }

  .popup-header {
    padding: 24px 20px 12px 20px;
  }

  .popup-header h3 {
    font-size: 20px;
  }

  .popup-content {
    padding: 20px 20px 24px 20px;
  }

  .section-title {
    font-size: 16px;
  }

  .comparison-table {
    font-size: 12px;
  }

  .comparison-table th,
  .comparison-table td {
    padding: 10px 6px;
  }

  .feature-name {
    padding-left: 12px !important;
  }

  .features-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .feature-item {
    padding: 10px 14px;
  }

  .feature-icon {
    font-size: 20px;
  }

  .feature-text {
    font-size: 14px;
  }

  .btn-register {
    width: 100%;
    padding: 12px 20px;
    font-size: 15px;
  }
}

/* Scrollbar Styling */
.benefits-popup::-webkit-scrollbar {
  width: 8px;
}

.benefits-popup::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
}

.benefits-popup::-webkit-scrollbar-thumb {
  background: rgba(255, 149, 0, 0.3);
  border-radius: 4px;
}

.benefits-popup::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 149, 0, 0.5);
}
</style>

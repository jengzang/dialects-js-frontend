<template>
  <div class="character-classification-page">
    <!-- Tab 切换栏 -->
    <div class="tabs-header">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-btn"
        :class="{ active: activeTab === tab.key }"
        @click="switchTab(tab.key)"
      >
        <span class="tab-icon">{{ tab.icon }}</span>
        <span class="tab-label">{{ tab.label }}</span>
      </button>
    </div>

    <!-- Tab 内容区域 -->
    <div class="tab-content">
      <!-- 中古汉语 -->
      <MiddleChineseTab v-if="activeTab === 'zhonggu'" />

      <!-- 上古汉语 (占位符) -->
      <div v-else-if="activeTab === 'shanggu'" class="placeholder-content">
        <div class="placeholder-icon">🏛️</div>
        <h2>上古漢語</h2>
        <p>此功能正在開發中...</p>
      </div>

      <!-- 近古汉语 (占位符) -->
      <div v-else-if="activeTab === 'jingu'" class="placeholder-content">
        <div class="placeholder-icon">📜</div>
        <h2>近古漢語</h2>
        <p>此功能正在開發中...</p>
      </div>

      <!-- 粤语韵书 (占位符) -->
      <div v-else-if="activeTab === 'yueyun'" class="placeholder-content">
        <div class="placeholder-icon">📖</div>
        <h2>粵語韻書</h2>
        <p>此功能正在開發中...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MiddleChineseTab from '@/components/pho/ZhongGuPage.vue'

const route = useRoute()
const router = useRouter()

// Tab 配置
const tabs = [
  { key: 'zhonggu', label: '中古漢語', icon: '📜' },
  { key: 'shanggu', label: '上古漢語', icon: '🏛️' },
  { key: 'jingu', label: '近古漢語', icon: '📖' },
  { key: 'yueyun', label: '粵語韻書', icon: '🎵' }
]

// 当前激活的 tab (从 URL 读取，默认为 zhonggu)
const activeTab = ref(route.query.sub || 'zhonggu')

// 切换 Tab
function switchTab(tabKey) {
  activeTab.value = tabKey
  router.push({
    path: '/explore',
    query: { page: 'CharacterClassification', sub: tabKey }
  })
}

// 监听路由变化
watch(() => route.query.sub, (newSub) => {
  if (newSub && tabs.some(t => t.key === newSub)) {
    activeTab.value = newSub
  }
})
</script>

<style scoped>
.character-classification-page {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* Tab 切换栏 */
.tabs-header {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  flex-wrap: wrap;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: none;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.3s;
  font-size: 15px;
  font-weight: 500;
  color: #1d1d1f;
}

.tab-btn:hover {
  background: rgba(255, 255, 255, 0.9);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.tab-btn.active {
  background: linear-gradient(135deg, #007AFF 0%, #0051D5 100%);
  color: white;
  box-shadow: 0 4px 16px rgba(0, 122, 255, 0.4);
}

.tab-icon {
  font-size: 18px;
}

.tab-label {
  white-space: nowrap;
}

/* Tab 内容区域 */
.tab-content {
  flex: 1;
  overflow: auto;
}

/* 占位符样式 */
.placeholder-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 20px;
  color: #6e6e73;
}

.placeholder-icon {
  font-size: 64px;
}

.placeholder-content h2 {
  font-size: 24px;
  margin: 0;
  color: #1d1d1f;
}

.placeholder-content p {
  font-size: 16px;
  margin: 0;
}

/* 响应式设计 */
@media (max-aspect-ratio: 1/1) {
  .tabs-header {
    padding: 12px 16px;
    gap: 8px;
  }

  .tab-btn {
    padding: 8px 16px;
    font-size: 14px;
  }

  .tab-icon {
    font-size: 16px;
  }

  .placeholder-icon {
    font-size: 48px;
  }

  .placeholder-content h2 {
    font-size: 20px;
  }

  .placeholder-content p {
    font-size: 14px;
  }
}
</style>

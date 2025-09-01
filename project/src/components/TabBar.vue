<template>
  <nav class="tab-bar">
    <RouterLink
        v-for="tab in tabs"
        :key="tab.tab"
        :to="{ path: '/', query: { tab: tab.tab } }"
        class="tab-button"
        :class="{ active: isActiveTab(tab.tab) }"
    >
      <span class="emoji">{{ tab.icon }}</span>
      <span class="label">{{ tab.label }}</span>
    </RouterLink>
  </nav>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()

const tabs = [
  { tab: 'like', label: '喜歡作者', icon: '❤️' },
  { tab: 'suggestions', label: '我有建議', icon: '💬' },
  { tab: 'thanks', label: '特別鳴謝', icon: '🙏' }
]

// 根據 query.tab 判斷哪個 active
const isActiveTab = (tabName) =>
    (route.query.tab === tabName) ||
    (!route.query.tab && tabName === 'like') // 預設 tab 為 like
</script>

<style scoped>
.tab-bar {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: stretch;
  background: #f0f4ff;
  padding: 0.5rem;
  gap: 0.5rem;
  border-radius: 16px 16px 0 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin: 0 auto;
  max-width: 100%;
  box-sizing: border-box;
  width: 100%;
}

/* 🧱 核心結構：每個 tab 撐滿整行、不可換行 */
.tab-button {
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  text-decoration: none;
  background: #e8edfa;
  color: #333;
  border-radius: 12px;
  transition: all 0.25s ease;
  font-weight: 500;
  padding: 0.5rem 0.3rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  user-select: none;
  animation: pulseOff 3s infinite;
  cursor: pointer;
}

/* hover & active 狀態 */
.tab-button:hover {
  background: #d9e6ff;
  transform: scale(1.03);
  box-shadow: 0 4px 10px rgba(0, 122, 255, 0.2);
  animation: pulseOn 1.5s infinite ease-in-out;
}

.tab-button.active {
  background: #007aff;
  color: white;
  font-weight: bold;
  box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.4) inset, 0 2px 8px rgba(0, 122, 255, 0.3);
  animation: none;
}

.emoji {
  font-size: clamp(1rem, 2vw, 1.5rem);
  line-height: 1;
}

.label {
  font-size: clamp(0.9rem, 1.8vw, 1.2rem);
  margin-top: 2px;
  line-height: 1.2;
  white-space: nowrap;
}

/* 呼吸動畫 */
@keyframes pulseOn {
  0% {
    box-shadow: 0 0 0 0 rgba(0, 122, 255, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(0, 122, 255, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(0, 122, 255, 0);
  }
}

@keyframes pulseOff {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.98;
  }
  100% {
    opacity: 1;
  }
}

/* 📱小螢幕自適應 */
@media (max-width: 480px) {
  .tab-button {
    padding: 0.4rem 0.2rem;
  }

  .label {
    font-size: clamp(0.8rem, 4vw, 1.2rem);
  }

  .emoji {
    font-size: clamp(1rem, 3.5vw, 1.2rem);
  }
}

/* 💻 桌面版放大字體 */
@media (min-width: 1024px) {
  .label {
    font-size: clamp(1.1rem, 1.4vw, 1.4rem);
  }

  .emoji {
    font-size: clamp(1.3rem, 2vw, 1.8rem);
  }
}
</style>

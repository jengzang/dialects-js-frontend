<template>
  <div class="tabs-wrapper">
    <div class="tabs">
      <div
          v-for="tab in tabs"
          :key="tab.name"
          :class="['tab', { active: currentTab === tab.name }]"
          @click="currentTab = tab.name"
      >
        {{ tab.label }}
      </div>
    </div>

    <div class="tab-content">
      <div v-if="currentTab === 'tab1'" class="page">📘 查字頁面</div>
      <div v-else-if="currentTab === 'tab2'" class="page">📜 查中古頁面</div>
      <div v-else-if="currentTab === 'tab3'" class="page">🔤 查音位頁面</div>
      <div v-else-if="currentTab === 'tab4'" class="page">🎵 查調頁面</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const currentTab = ref('tab2')

const tabs = [
  {name: 'tab1', label: '查字'},
  {name: 'tab2', label: '查中古'},
  {name: 'tab3', label: '查音位'},
  {name: 'tab4', label: '查調'}
]
</script>

<style scoped>
.tabs-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0;
}

.tabs {
  display: flex;
  justify-content: flex-start;
  gap: 16px;
  flex-wrap: nowrap;
  overflow-x: auto;
  max-width: 100%;
  padding: 8px 12px;
  -webkit-overflow-scrolling: touch; /* ✅ 手機滑順滾動 */
  scrollbar-width: none; /* Firefox */
}

.tabs::-webkit-scrollbar {
  display: none; /* Chrome, Safari */
}

.tab {
  flex-shrink: 0;
  white-space: nowrap;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 500;
  border-radius: 16px;
  cursor: pointer;
  color: #444;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(4px);
  transition: all 0.5s ease;
  user-select: none;

  /* ✅ 加上蘋果藍邊框（全部） */
  border: 1px solid #007AFF;
}

.tab:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #007AFF;
}

.tab.active {
  color: #fff;

  /* ✅ 選中後變成玻璃蘋果藍 */
  background: rgba(0, 122, 255, 0.7);
  backdrop-filter: blur(14px);
  box-shadow: 0 4px 20px rgba(0, 122, 255, 0.3);
}



/* 📄 內容區塊動畫 */
.tab-content {
  width: 100%;
  animation: fade 0.6s ease;
  margin-top: 24px;
}

.page {
  padding: 20px;
  font-size: 18px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
}

@keyframes fade {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
/* 📱✅ 媒體查詢：手機螢幕優化 */
@media screen and (max-width: 600px) {
  .tab {
    padding: 10px 16px;
    font-size: 14px;
    border-radius: 12px;
  }

  .tabs {
    gap: 6px;
    padding: 8px 8px;
  }

  .page {
    padding: 16px;
    font-size: 16px;
  }
}
</style>

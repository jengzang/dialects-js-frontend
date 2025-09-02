<template>
  <nav class="glass-tab-bar">
    <RouterLink
        v-for="t in tabs"
        :key="t.tab"
        :to="{ path: '/menu', query: { tab: t.tab } }"
        custom
        v-slot="{ href, navigate, isActive }"
    >
      <a
          :href="href"
          class="tab-item"
          :class="[{ active: isActiveComputed(t.tab, isActive) }, { small: t.tab === 'about' }]"
          :style="{ flex: t.weight + ' 1 0' }"
          @click.prevent="onClick(t.tab, navigate)"
      >
        <span class="emoji">{{ t.icon }}</span>
        <span class="label">{{ t.label }}</span>
      </a>

    </RouterLink>
  </nav>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
const route = useRoute()
const router = useRouter()

const tabs = [
  { tab: 'map',   label: '地圖',   icon: '🗺️', weight: 0.8 },
  { tab: 'query', label: '查詢',   icon: '📊', weight: 1.6 },
  { tab: 'about', label: '關於網站', icon: '🌐', weight: 0.6 }
]


// 根據當前 query.tab 判斷
const currentTab = () => route.query.tab || 'query'
const isActiveComputed = (tabName) => route.path === '/menu' && currentTab() === tabName

const onClick = async (tabName, navigate) => {
  if (route.path === '/menu' && currentTab() === tabName) return
  await router.replace({ path: '/menu', query: { tab: tabName } })
}
</script>

<style scoped>
/* 🔑 改成相對於玻璃卡（父元素）定位 */
.glass-tab-bar {
  position: fixed;
  width: 80dvw;
  left: 12px;
  right: 12px;
  bottom: 4dvh;
  display: flex;
  gap: 25px;
  justify-content: space-between;
  padding: 12px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.35);
  backdrop-filter: blur(18px) saturate(160%);
  -webkit-backdrop-filter: blur(18px) saturate(160%);
  box-shadow: 0 8px 24px rgba(0, 95, 200, 0.25);
  z-index: 5;
  max-width: 900px;
  /* 水平置中 */
  margin: 0 auto;
}

.tab-item {
  flex: 1 1 0;
  min-width: 0;
  text-align: center;
  text-decoration: none;
  padding: 10px 8px;
  border-radius: 12px;
  transition: all 0.25s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  cursor: pointer;
  user-select: none;
  background: rgba(255,255,255,0.10);
  color: #007aff; /* 預設文字用蘋果藍半透明 */

}

.tab-item:hover {
  background: rgba(0, 122, 255, 0.12);
  transform: translateY(-1px);
  color: #007aff;
}

.tab-item.active {
  background: linear-gradient(145deg, #007aff, #4e39fd); /* 蘋果藍漸變 */
  color: #fff;
  font-weight: 700;
  box-shadow: 0 6px 18px rgba(0, 122, 255, 0.45);
  transform: translateY(-1px) scale(1.02);
}

.emoji { font-size: clamp(1.1rem, 3.6vw, 1.5rem); line-height: 1; }
.tab-item.small .label {
  font-size: 0.75rem; /* ✅ 關於網站縮小 */
}


/* 📱 手機：只調整文字與按鈕 */
@media (max-width: 480px) {
  .glass-tab-bar {
    gap: 8px;
    padding: 8px;
    bottom: 11dvh;
  }
  .tab-item {
    padding: 7px 4px;   /* ✅ 按鈕變大，易於觸控 */
    font-size: 1.5rem;      /* label 放大 */
  }

  .emoji {
    font-size: 1.6rem;    /* emoji 更大 */
  }
}

/* 📲 小平板：稍微放大文字與按鈕 */
@media (min-width: 481px) and (max-width: 768px) {

  .tab-item {
    padding: 12px 10px;
    font-size: 1.3rem;
  }

  .emoji {
    font-size: 1.4rem;
  }
}

/* 💻 桌面：文字回歸正常，按鈕緊湊 */
@media (min-width: 769px) {
  .glass-tab-bar {
    padding: 8px;
  }

  .tab-item {
    padding: 5px 10px;
    font-size: 1.2rem;
  }

  .emoji {
    font-size: 1.2rem;
  }
}

</style>

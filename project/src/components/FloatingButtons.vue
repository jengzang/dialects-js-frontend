<!-- FloatingButtons.vue - 悬浮按钮组 -->
<template>
  <div class="floating-buttons">
    <!-- 返回首页按钮 -->
    <button
      class="float-btn menu-btn"
      @click="$emit('toggle-sidebar')"
      title="打開菜單"

    >
      <img class="logo" src="@/assets/favicon.ico" alt="Logo" />
    </button>

    <!-- 打开侧边栏按钮 -->
    <button
      class="float-btn home-btn"
      @click="goToHome"
      title="返回首頁"
    >
      🔙
    </button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

defineEmits(['toggle-sidebar']);

const goToHome = () => {
  router.push({ path: '/menu', query: { tab: 'query' } });
};
</script>

<style scoped>
.floating-buttons {
  position: fixed;
  bottom: 30px;
  right: 30px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 998;
}

.float-btn {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.5);
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.15));
  backdrop-filter: blur(15px) saturate(150%);
  -webkit-backdrop-filter: blur(15px) saturate(150%);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15), 0 2px 6px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  user-select: none;
  padding: 8px;
}

.float-btn:hover {
  transform: scale(1.1) translateY(-2px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2), 0 4px 8px rgba(0, 0, 0, 0.15);
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.3));
}

.float-btn:active {
  transform: scale(1.05);
}

/* Logo 样式 - 与 navbar 保持一致 */
.logo {
  width: 85%;
  height: auto;
}

/* 移动端适配 */
@media (max-aspect-ratio: 1/1) {
  .floating-buttons {
    bottom: 20px;
    right: 20px;
    gap: 10px;
  }

  .float-btn {
    width: 50px;
    height: 50px;
    font-size: 22px;
  }
}
</style>

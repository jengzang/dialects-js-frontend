<template>
  <div class="explore-layout">
    <!-- ExploreBar 导航栏 -->
    <ExploreBar />

    <!-- 内容区域 (与 SimpleLayout 保持一致) -->
    <div class="content-area">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>
  </div>
</template>

<script setup>
import ExploreBar from '@/components/bar/ExploreBar.vue'
</script>

<style scoped>
/* 背景：与 SimpleLayout 保持一致 */
.explore-layout {
  min-height: 100dvh;
  padding: max(16px, env(safe-area-inset-top)) max(16px, env(safe-area-inset-right))
    max(16px, env(safe-area-inset-bottom)) max(16px, env(safe-area-inset-left));
  background:
    radial-gradient(1200px 800px at 10% -10%, #dff1ff 0%, rgba(223,241,255,0) 60%),
    radial-gradient(1000px 700px at 110% 10%, #cfe7ff 0%, rgba(207,231,255,0) 60%),
    linear-gradient(180deg, #eaf5ff, #d7ecff);
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  box-sizing: border-box;
}

/* 内容区域：与 SimpleLayout 完全一致 */
.content-area {
  width: 95%;
  height: 88dvh;
  display: flex;
  justify-content: center;
  padding: 10px 6px;
  color: #0b2540;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

/* 动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(6px);
}
</style>

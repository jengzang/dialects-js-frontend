<!-- src/layouts/MenuLayout.vue -->
<template>
  <div class="menu-bg">
  <NavBar />
<!--    <FloatingHeader v-if="shouldShowHeader" />-->
      <!-- 內容區：注意底部留白避免被 tab 擋住 -->
      <div class="glass-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" :key="$route.fullPath" />
          </transition>
        </router-view>
      </div>
    <!-- 貼在玻璃卡內部底部 -->
<!--    <MenuTabs />-->
    <!-- ✅ 只會在 /menu 和 /menu/thanks 出現 -->
<!--    <TabControls />-->
  </div>
</template>

<script setup>
// import MenuTabs from '@/components/MenuTabs.vue'
// import TabControls from "@/components/TabControls.vue";
// import FloatingHeader from '@/components/FloatingHeader.vue'
import { useRoute } from 'vue-router'
// import { computed } from 'vue'
import NavBar from "@/components/NavBar.vue";

const route = useRoute()
// const shouldShowHeader = computed(() => {
//   // console.log(route)
//   return route.query.tab !== 'about' && !route.path.includes('auth')
// })
</script>

<style scoped>
/* 背景：柔和藍色漸層 + 細微噪點質感 */
.menu-bg {
  min-height: 100vh;
  padding: max(16px, env(safe-area-inset-top)) max(16px, env(safe-area-inset-right))
  max(16px, env(safe-area-inset-bottom)) max(16px, env(safe-area-inset-left));
  background:
      radial-gradient(1200px 800px at 10% -10%, #dff1ff 0%, rgba(223,241,255,0) 60%),
      radial-gradient(1000px 700px at 110% 10%, #cfe7ff 0%, rgba(207,231,255,0) 60%),
      linear-gradient(180deg, #eaf5ff, #d7ecff);
  display: grid;
  place-items: center;
  justify-content: center;  /* 水平居中 .glass-content */
  align-items: flex-start;  /* 垂直方向上对齐 */
  box-sizing: border-box;
  justify-items: center;
}


nav {
  position: fixed; /* 使 NavBar 固定在顶部 */
  top: 0;
  left: 0;
  width: 100%; /* 确保它占满整个宽度 */
  z-index: 1000; /* 确保 NavBar 层级在上面 */
}
/* 玻璃卡：置中、圓角、毛玻璃、陰影 */
.glass-card {
  position: fixed;
  width: 80dvw;             /* 永遠比螢幕寬度小 10% */
  height: 75dvh;        /* 高度可以依需求調整 */
  border-radius: 24px;
  bottom: 3dvh;
  padding: 16px;
  background: rgba(255, 255, 255, 0.22);
  border: 1px solid rgba(255, 255, 255, 0.35);
  box-shadow:
      0 10px 40px rgba(0, 102, 204, 0.20),
      inset 0 1px 0 rgba(255,255,255,0.35);
  backdrop-filter: blur(22px) saturate(160%);
  -webkit-backdrop-filter: blur(22px) saturate(160%);
  max-width: 900px;
  /* 水平置中 */
  margin: 0 auto;
  overflow: auto;
}


/* 內容區：底部預留給 tabs 的高度 */
.glass-content {
  /* tab 高度 + 間距 */
  padding: 10dvh 12px 12px;
  color: #0b2540;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  align-items: flex-start;
  /* 设置子元素的对齐方式 */
  display: flex;          /* 使子元素也成为 Flexbox 布局 */
  justify-content: center;  /* 水平居中子元素 */
  width: 100%;            /* 确保内容宽度占满父容器 */
}

/* 動畫 */
.fade-enter-active, .fade-leave-active { transition: opacity .25s ease, transform .25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(6px); }

/* 📱 手機：只調整文字與按鈕 */
@media (max-width: 480px) {
  .glass-card {
    border-radius: 22px; /* 手機玻璃四角稍微圓一點 */
    bottom: 8dvh;
    /*height:70dvh;*/
  }
  .glass-content {
    padding: 17dvh 8px 8px ;
    font-size: 1.1rem; /* ✅ 文字變大 */
    line-height: 1.6;
  }
}

@media (min-width: 481px) and (max-width: 768px) {
  .glass-content {
    font-size: 1rem;
    line-height: 1.5;
  }
}

@media (min-width: 769px) {
  .glass-content {
    font-size: 0.95rem;
    line-height: 1.4;
  }
}

</style>

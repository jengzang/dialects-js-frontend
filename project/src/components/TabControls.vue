<!-- src/components/TabControls.vue -->
<template>
  <TabBar v-if="showTabBar" />

  <!-- 🔐 登入按鈕 -->
  <button v-if="showTabBar" class="floating-login-button" @click="goToAuthPage">🔐</button>

  <!-- ⟲ 返回按鈕 -->
  <button v-if="showTabBar" class="floating-back-button" @click="goBack">⟲</button>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { computed } from 'vue'
import TabBar from './TabBar.vue'

const route = useRoute()
const router = useRouter()

const showTabBar = computed(() => {
  const path = route.path
  const tab = route.query.tab
  return (
      path.startsWith('/intro') ||
      (path === '/menu' && tab === 'about')
  )
})

const goToAuthPage = () => {
  router.push('/auth')
}

const goBack = () => {
  window.location.replace(window.WEB_BASE)
}
</script>

<style scoped>
/* ✅ 蘋果風 Login 按鈕 */
.floating-login-button {
  position: fixed;
  right: 18px;
  bottom: 18px;
  background: #007aff;
  color: white;
  font-size: 1.6rem;
  border: none;
  border-radius: 50%;
  width: 52px;
  height: 52px;
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
  cursor: pointer;
  transition: background 0.3s, transform 0.2s;
  z-index: 9999;
  font-family: "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  /* ✅ 关键部分：用 Flex 保证文字完全居中 */
  display: flex;
  align-items: center;
  justify-content: center;
}

.floating-login-button:hover {
  background: #005fcc;
  transform: scale(1.08);
}

@media (max-width: 480px) {
  .floating-login-button {
    width: 60px;
    height: 60px;
    font-size: 1.8rem;
  }
}

/* ✅ 左下返回鍵 */
.floating-back-button {
  position: fixed;
  left: 18px;
  bottom: 18px;
  background: darkgoldenrod;
  color: white;
  font-size: 2rem;
  border: none;
  border-radius: 50%;
  width: 52px;
  height: 52px;
  box-shadow: 0 4px 12px rgba(255, 59, 48, 0.3);
  cursor: pointer;
  transition: background 0.3s, transform 0.2s;
  z-index: 9999;
  font-family: "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  /* ✅ 关键部分：用 Flex 保证文字完全居中 */
  display: flex;
  align-items: center;
  justify-content: center;
}

.floating-back-button:hover {
  background: #735407;
  transform: scale(1.08);
}

@media (max-width: 480px) {
  .floating-back-button {
    width: 60px;
    height: 60px;
    font-size: 1.8rem;
  }
}
@media (orientation: landscape) {
  .floating-login-button,
  .floating-back-button {
    width: 70px;
    height: 70px;
    font-size: 2rem;
  }
}
</style>
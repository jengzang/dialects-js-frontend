<template>
  <div class="container">
    <TabBar />
    <router-view class="view-area" v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>

    <!-- 🔐 登入按鈕 -->
    <button class="floating-login-button" @click="goToAuthPage">🔐</button>

    <!-- 🔙 返回按鈕 -->
    <button class="floating-back-button" @click="goBack">⟲</button>
  </div>
</template>


<script setup>
import TabBar from './components/TabBar.vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const goToAuthPage = () => {
  router.push('/auth')
}

const goBack = () => {
  window.location.href = 'http://10.250.101.238:5000/'
}
</script>


<style scoped>
.container {
  max-width: 480px;
  margin: 0 auto;
  background: #f5f8ff;
  border-radius: 16px;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.view-area {
  flex: 1;
  padding: 5vw;
  font-size: 1rem;
}

@media (min-width: 768px) {
  .view-area {
    padding: 40px;
    font-size: 1.1rem;
  }
}

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
  font-size: 1.6rem;
  border: none;
  border-radius: 50%;
  width: 52px;
  height: 52px;
  box-shadow: 0 4px 12px rgba(255, 59, 48, 0.3);
  cursor: pointer;
  transition: background 0.3s, transform 0.2s;
  z-index: 9999;
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

<template>
  <div class="floating-header">
    <!-- 呼吸邊框 + 玻璃效果 -->
    <div ref="glassRef" class="breathing-border glass-card">
      <h1>方音圖鑒</h1>
    </div>
  </div>
  <!-- 自訂浮動按鈕 -->
  <button ref="buttonRef" class="floating-button" @click="onEnterClick">
    進入網站
  </button>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'

const glassRef = ref(null)
const buttonRef = ref(null)

const onEnterClick = () => {
  console.log('進入網站')
}

// 核心計算函數
const updateButtonPosition = () => {
  const glass = glassRef.value
  const button = buttonRef.value
  if (!glass || !button) return

  const glassRect = glass.getBoundingClientRect()
  const spacing = 20
  const proposedLeft = glassRect.right + spacing
  // console.log("grass",glassRect.right)

  const screenWidth = window.innerWidth
  const buttonWidth = button.offsetWidth
  // console.log("button",buttonWidth)
  const maxLeft = screenWidth - buttonWidth
  // console.log("max",maxLeft)

  const finalLeft = Math.min(proposedLeft, maxLeft) + 30
  button.style.left = `${finalLeft}px`
  // console.log(finalLeft)
}

onMounted(() => {
  nextTick(() => {
    updateButtonPosition()
    window.addEventListener('resize', updateButtonPosition)
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateButtonPosition)
})
</script>


<style scoped>
/* 主容器 */
.floating-header {
  position: fixed;
  top: 2dvh;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 16px;
  z-index: 1000;
}

/* 液態玻璃卡片（你提供的樣式） */
.glass-card {
  padding: 12px 24px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.22);
  border: 1px solid rgba(255, 255, 255, 0.35);
  box-shadow:
      0 10px 40px rgba(0, 102, 204, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.35);
  backdrop-filter: blur(22px) saturate(160%);
  -webkit-backdrop-filter: blur(22px) saturate(160%);
  color: darkblue;
  text-align: center;
  white-space: nowrap; /* 不允許文字換行 */
}

/* 呼吸邊框（加在外層） */
.breathing-border {
  border: 2px solid white;
  animation: breathe 2.5s ease-in-out infinite;
}

.glass-card h1{
  margin: 0;
}

/* 呼吸動畫 */
@keyframes breathe {
  0%, 100% {
    box-shadow: 0 0 8px rgba(0, 122, 255, 0.25);
  }
  50% {
    box-shadow: 0 0 16px rgba(0, 122, 255, 0.6);
  }
}

/* 你要的純藍色浮動按鈕 */
.floating-button {
  position: fixed;
  top: 5vh;
  transform: translateX(-50%);
  z-index: 999;

  background-color: #007aff;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 0.5rem 1.2rem;
  font-size: 0.95rem;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  transition: background 0.2s ease, box-shadow 0.2s ease;
}

.floating-button:hover {
  background-color: #005fd3;
  box-shadow: 0 0 8px rgba(0, 122, 255, 0.4);
}
</style>

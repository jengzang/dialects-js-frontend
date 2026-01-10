<template>
  <div class="page-root">
  <h2 class="tabs-title">⚙️ 設置頁面</h2>
  <div class="coming-soon-container">
    <div class="coming-soon-message">
      <p>该页面待完善</p>
    </div>
  </div>
  </div>
</template>

<style scoped>
/* 背景设置 */
.coming-soon-container {
  position: absolute;
  top: 26dvh;
  left: 0;
  width: 100%;
  height: 74dvh;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(0, 122, 255, 0.15));
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 99;
}

/* 提示框样式 */
.coming-soon-message {
  font-size: 28px;
  font-weight: bold;
  color: #ffffff;
  text-align: center;
  padding: 30px 50px;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.6);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  transform: scale(0);
  animation: scaleIn 1s ease-out forwards, glowAnimation 1.5s infinite alternate;
}

/* 提示文本的动画效果 */
@keyframes scaleIn {
  0% {
    transform: scale(0);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes glowAnimation {
  0% {
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.8), 0 0 20px rgba(255, 255, 255, 0.6), 0 0 30px rgba(0, 122, 255, 0.9);
  }
  100% {
    text-shadow: 0 0 20px rgba(255, 255, 255, 1), 0 0 40px rgba(255, 255, 255, 0.7), 0 0 60px rgba(0, 122, 255, 1);
  }
}

/* 自适应样式，保证在小屏设备上也能很好展示 */
@media (max-width: 480px) {
  .coming-soon-message {
    font-size: 22px;
    padding: 20px 30px;
  }
}
</style>

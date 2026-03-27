<template>
  <Teleport to="body">
    <Transition name="toast-fade">
      <div v-if="messageState.show" :class="['global-toast', 'global-toast-shell', messageState.type]">
        <span class="toast-icon">{{ getIcon(messageState.type) }}</span>
        <span class="toast-message">{{ messageState.message }}</span>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { messageState } from '@/utils/message.js'

function getIcon(type) {
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  }
  return icons[type] || icons.info
}
</script>

<style scoped>
/* 🍎 苹果液态玻璃风格 Toast */
.global-toast {
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 99999;


  /* 🔹 液态玻璃核心效果 */

  /* 🔹 柔和阴影 */

  /* 🔹 添加细腻的边框高光 */
}

/* ✅ 成功消息 - 苹果绿 */
.global-toast.success {
  background: linear-gradient(
    135deg,
    rgba(52, 199, 89, 0.85),
    rgba(48, 209, 88, 0.80)
  );
  border-color: rgba(52, 199, 89, 0.5);
  color: white;
}

.global-toast.success .toast-icon {
  background: rgba(255, 255, 255, 0.25);
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
}

/* ❌ 错误消息 - 苹果红 */
.global-toast.error {
  background: linear-gradient(
    135deg,
    rgba(255, 59, 48, 0.85),
    rgba(255, 69, 58, 0.80)
  );
  border-color: rgba(255, 59, 48, 0.5);
  color: white;
}

.global-toast.error .toast-icon {
  background: rgba(255, 255, 255, 0.25);
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 700;
}

/* ⚠️ 警告消息 - 苹果橙黄 */
.global-toast.warning {
  background: linear-gradient(
    135deg,
    rgba(255, 204, 0, 0.85),
    rgba(255, 214, 10, 0.80)
  );
  border-color: rgba(255, 204, 0, 0.5);
  color: rgba(0, 0, 0, 0.85);
}

.global-toast.warning .toast-icon {
  background: rgba(0, 0, 0, 0.15);
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 700;
}

/* ℹ️ 提示消息 - 苹果蓝 */
.global-toast.info {
  background: linear-gradient(
    135deg,
    rgba(0, 122, 255, 0.85),
    rgba(10, 132, 255, 0.80)
  );
  border-color: rgba(0, 122, 255, 0.5);
  color: white;
}

.global-toast.info .toast-icon {
  background: rgba(255, 255, 255, 0.25);
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
}

.toast-message {
  flex: 1;
  line-height: 1.4;
}

/* 🎬 苹果风格动画 - 弹性缓动 */
.toast-fade-enter-active {
  animation: toast-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.toast-fade-leave-active {
  animation: toast-out 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

@keyframes toast-in {
  0% {
    opacity: 0;
    transform: translateX(-50%) translateY(-30px) scale(0.9);
  }
  100% {
    opacity: 1;
    transform: translateX(-50%) translateY(0) scale(1);
  }
}

@keyframes toast-out {
  0% {
    opacity: 1;
    transform: translateX(-50%) translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateX(-50%) translateY(-20px) scale(0.95);
  }
}

/* 📱 移动端适配 */
@media (max-width: 768px) {
  .global-toast {
    top: 20px;
    font-size: 14px;
    padding: 12px 24px;
    max-width: calc(100vw - 32px);
    border-radius: 16px;
  }

  .global-toast .toast-icon {
    width: 22px;
    height: 22px;
    font-size: 13px;
  }
}
</style>

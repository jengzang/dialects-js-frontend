<template>
  <Teleport to="body">
    <Transition name="confirm-fade">
      <div v-if="confirmState.show" class="confirm-overlay global-overlay-blur" @click.self="handleCancel">
        <Transition name="confirm-scale">
          <div v-if="confirmState.show" class="confirm-dialog global-dialog-surface">
            <!-- 标题 -->
            <div class="confirm-header">
              <span class="confirm-icon">⚠️</span>
              <h3 class="confirm-title">{{ confirmState.title }}</h3>
            </div>

            <!-- 消息内容 -->
            <div class="confirm-message">
              {{ confirmState.message }}
            </div>

            <!-- 按钮组 -->
            <div class="confirm-actions">
              <button class="confirm-btn global-action-btn global-action-btn-secondary cancel-btn" @click="handleCancel">
                {{ confirmState.cancelText }}
              </button>
              <button class="confirm-btn global-action-btn global-action-btn-primary" @click="handleConfirm">
                {{ confirmState.confirmText }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { confirmState, resolveConfirm } from '@/utils/message.js'

function handleConfirm() {
  resolveConfirm(true)
}

function handleCancel() {
  resolveConfirm(false)
}
</script>

<style scoped>
/* 🍎 苹果液态玻璃风格确认对话框 */

/* 遮罩层 */
.confirm-overlay {
  position: fixed;
  inset: 0;
  z-index: 100000;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 对话框主体 */
.confirm-dialog {
  width: 90%;
  max-width: 400px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 头部 */
.confirm-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 24px 16px;
  gap: 12px;
}

.confirm-icon {
  font-size: 48px;
  line-height: 1;
  filter: drop-shadow(0 2px 8px rgba(255, 204, 0, 0.3));
}

.confirm-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.85);
  text-align: center;
}

/* 消息内容 */
.confirm-message {
  padding: 0 24px 24px;
  font-size: 15px;
  line-height: 1.5;
  color: rgba(0, 0, 0, 0.7);
  text-align: center;
  white-space: pre-line;
}

/* 按钮组 */
.confirm-actions {
  display: flex;
  gap: 12px;
  padding: 0 24px 24px;
}

/* 取消按钮 */
/* 确认按钮 - 苹果蓝 */
/* 🎬 动画 */

/* 遮罩层淡入淡出 */
.confirm-fade-enter-active,
.confirm-fade-leave-active {
  transition: opacity 0.25s ease;
}

.confirm-fade-enter-from,
.confirm-fade-leave-to {
  opacity: 0;
}

/* 对话框缩放弹出 */
.confirm-scale-enter-active {
  animation: confirm-scale-in 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.confirm-scale-leave-active {
  animation: confirm-scale-out 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

@keyframes confirm-scale-in {
  0% {
    opacity: 0;
    transform: scale(0.8) translateY(20px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes confirm-scale-out {
  0% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
  100% {
    opacity: 0;
    transform: scale(0.9) translateY(10px);
  }
}

/* 📱 移动端适配 */
@media (max-width: 768px) {
  .confirm-dialog {
    max-width: calc(100vw - 32px);
    border-radius: 16px;
  }

  .confirm-header {
    padding: 24px 20px 12px;
  }

  .confirm-icon {
    font-size: 40px;
  }

  .confirm-title {
    font-size: 18px;
  }

  .confirm-message {
    padding: 0 20px 20px;
    font-size: 14px;
  }

  .confirm-actions {
    padding: 0 20px 20px;
    gap: 10px;
  }

  .confirm-btn {
    padding: 10px 20px;
    font-size: 15px;
  }
}
</style>

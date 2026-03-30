<template>
  <AppModal
    :model-value="confirmState.show"
    size="sm"
    :show-close="false"
    :z-index="100000"
    @update:modelValue="handleCancel"
  >
    <template #header>
      <div class="confirm-header">
        <span class="confirm-icon">⚠️</span>
        <h3 class="confirm-title">{{ confirmState.title }}</h3>
      </div>
    </template>

    <div class="confirm-message">
      {{ confirmState.message }}
    </div>

    <div class="confirm-actions">
      <button class="confirm-btn global-action-btn global-action-btn-secondary cancel-btn" @click="handleCancel">
        {{ confirmState.cancelText }}
      </button>
      <button class="confirm-btn global-action-btn global-action-btn-primary" @click="handleConfirm">
        {{ confirmState.confirmText }}
      </button>
    </div>
  </AppModal>
</template>

<script setup>
import AppModal from '@/components/common/AppModal.vue'
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

/* 头部 */
.confirm-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
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
  padding: 0 0 24px;
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
  padding: 0;
}

/* 📱 移动端适配 */
@media (max-width: 768px) {
  .confirm-header {
    gap: 10px;
  }

  .confirm-icon {
    font-size: 40px;
  }

  .confirm-title {
    font-size: 18px;
  }

  .confirm-message {
    padding: 0 0 20px;
    font-size: 14px;
  }

  .confirm-actions {
    gap: 10px;
  }

  .confirm-btn {
    padding: 10px 20px;
    font-size: 15px;
  }
}
</style>

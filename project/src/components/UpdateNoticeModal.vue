<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="visible" class="update-modal-overlay" @click.self="handleClose">
        <div class="update-modal">
          <button class="modal-close-btn" @click="handleClose">✕</button>

          <div class="modal-header">
            <div class="update-icon">🎉</div>
            <h2 class="modal-title">{{ title }}</h2>
            <p class="update-version">{{ version }}</p>
          </div>

          <div class="modal-content">
            <slot>
              <!-- 默认内容，可以被外部覆盖 -->
              <div class="update-item">
                <span class="item-icon">✨</span>
                <span class="item-text">新增功能示例</span>
              </div>
            </slot>
          </div>

          <div class="modal-footer">
            <label class="no-show-checkbox">
              <input type="checkbox" v-model="dontShowAgain" />
              <span>不再顯示此版本更新</span>
            </label>
            <button class="confirm-btn" @click="handleConfirm">
              知道了
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  version: {
    type: String,
    required: true
  },
  title: {
    type: String,
    default: '網站更新通知'
  },
  storageKey: {
    type: String,
    default: 'update-notice-dismissed'
  }
})

const emit = defineEmits(['close', 'confirm'])

const dontShowAgain = ref(false)

const handleClose = () => {
  emit('close')
}

const handleConfirm = () => {
  if (dontShowAgain.value) {
    // 将版本号写入localStorage
    const dismissedVersions = JSON.parse(localStorage.getItem(props.storageKey) || '[]')
    if (!dismissedVersions.includes(props.version)) {
      dismissedVersions.push(props.version)
      localStorage.setItem(props.storageKey, JSON.stringify(dismissedVersions))
    }
  }
  emit('confirm')
  emit('close')
}

// 检查是否应该显示此版本的更新通知
const shouldShow = () => {
  const dismissedVersions = JSON.parse(localStorage.getItem(props.storageKey) || '[]')
  return !dismissedVersions.includes(props.version)
}

defineExpose({
  shouldShow
})
</script>

<style scoped>
.update-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 1.5rem;
}

.update-modal {
  position: relative;
  background: rgba(255, 255, 255, 0.98);
  border-radius: 24px;
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 122, 255, 0.3);
  border: 1px solid rgba(0, 122, 255, 0.2);
  display: flex;
  flex-direction: column;
}

.modal-close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.05);
  color: rgba(0, 0, 0, 0.6);
  font-size: 1.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.modal-close-btn:hover {
  background: rgba(0, 0, 0, 0.1);
  transform: scale(1.1);
}

.modal-header {
  padding: 2.5rem 2rem 1.5rem;
  text-align: center;
  border-bottom: 1px solid rgba(0, 122, 255, 0.1);
}

.update-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  animation: bounce 1s ease infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.modal-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #007aff;
  margin: 0 0 0.5rem 0;
}

.update-version {
  font-size: 0.9375rem;
  color: rgba(0, 0, 0, 0.6);
  font-weight: 500;
  margin: 0;
}

.modal-content {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
}

.update-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  background: rgba(0, 122, 255, 0.05);
  border-radius: 12px;
  margin-bottom: 0.75rem;
  border-left: 3px solid #007aff;
  transition: all 0.2s ease;
}

.update-item:hover {
  background: rgba(0, 122, 255, 0.08);
  transform: translateX(4px);
}

.update-item:last-child {
  margin-bottom: 0;
}

.item-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
  line-height: 1.5;
}

.item-text {
  font-size: 0.9375rem;
  color: #1d1d1f;
  line-height: 1.6;
  font-weight: 500;
}

.modal-footer {
  padding: 1.5rem 2rem;
  border-top: 1px solid rgba(0, 122, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.no-show-checkbox {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  cursor: pointer;
  font-size: 0.9375rem;
  color: rgba(0, 0, 0, 0.7);
  user-select: none;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  transition: background 0.2s ease;
}

.no-show-checkbox:hover {
  background: rgba(0, 122, 255, 0.05);
}

.no-show-checkbox input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: #007aff;
}

.confirm-btn {
  padding: 0.75rem 2rem;
  background: linear-gradient(135deg, #007aff 0%, #005ecb 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 4px 16px rgba(0, 122, 255, 0.3);
}

.confirm-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(0, 122, 255, 0.4);
}

.confirm-btn:active {
  transform: translateY(0);
}

/* 滚动条样式 */
.modal-content::-webkit-scrollbar {
  width: 8px;
}

.modal-content::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
}

.modal-content::-webkit-scrollbar-thumb {
  background: rgba(0, 122, 255, 0.3);
  border-radius: 4px;
}

.modal-content::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 122, 255, 0.5);
}

/* 动画 */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: all 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-from .update-modal,
.modal-fade-leave-to .update-modal {
  transform: scale(0.9) translateY(-20px);
}

/* 移动端适配 */
@media (max-width: 600px) {
  .update-modal {
    max-width: 95%;
    max-height: 85vh;
  }

  .modal-header {
    padding: 2rem 1.5rem 1.25rem;
  }

  .update-icon {
    font-size: 3rem;
  }

  .modal-title {
    font-size: 1.5rem;
  }

  .modal-content {
    padding: 1.5rem;
  }

  .modal-footer {
    padding: 1.25rem 1.5rem;
    flex-direction: column;
    align-items: stretch;
  }

  .confirm-btn {
    width: 100%;
  }
}
</style>

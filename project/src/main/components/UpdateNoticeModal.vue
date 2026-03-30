<template>
  <AppModal
    :model-value="visible"
    size="sm"
    :show-close="false"
    @update:modelValue="handleClose"
  >
    <div class="update-notice-shell">
          <button class="close-btn close-btn-lg close-btn-corner" @click="handleClose">✕</button>

          <div class="update-notice-header">
            <div class="update-icon">🎉</div>
            <h2 class="update-notice-title">{{ title || $t('common.updateNotice.title') }}</h2>
            <p class="update-version">{{ version }}</p>
          </div>

          <div class="update-notice-content">
            <slot>
              <!-- 默认内容，可以被外部覆盖 -->
              <div class="update-item">
                <span class="item-icon">✨</span>
                <span class="item-text">{{ $t('common.updateNotice.defaultItem') }}</span>
              </div>
            </slot>
          </div>

          <div class="update-notice-footer">
            <label class="no-show-checkbox">
              <input type="checkbox" v-model="dontShowAgain" />
              <span>{{ $t('common.updateNotice.dontShowAgain') }}</span>
            </label>
            <button class="confirm-btn" @click="handleConfirm">
              {{ $t('common.updateNotice.confirm') }}
            </button>
          </div>
    </div>
  </AppModal>
</template>

<script setup>
import { ref } from 'vue'
import AppModal from '@/components/common/AppModal.vue'

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
.update-notice-shell {
  position: relative;
  display: flex;
  flex-direction: column;
  height: calc(100% + var(--modal-content-padding-top) + var(--modal-content-padding-bottom));
  margin:
    calc(-1 * var(--modal-content-padding-top))
    calc(-1 * var(--modal-content-padding-inline))
    calc(-1 * var(--modal-content-padding-bottom));
  overflow: hidden;
}

.update-notice-header {
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

.update-notice-title {
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

.update-notice-content {
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

.update-notice-shell .item-text {
  font-size: 0.9375rem;
  color: #1d1d1f;
  line-height: 1.8 !important;
  font-weight: 500;
}

.update-notice-shell .item-text * {
  line-height: 1.8 !important;
}

.update-notice-footer {
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

/* 动画 */

/* 移动端适配 */
@media (max-width: 600px) {
  .update-notice-header {
    padding: 2rem 1.5rem 1.25rem;
  }

  .update-icon {
    font-size: 3rem;
  }

  .update-notice-title {
    font-size: 1.5rem;
  }

  .update-notice-content {
    padding: 1.5rem;
  }

  .update-notice-footer {
    padding: 1.25rem 1.5rem;
    flex-direction: column;
    align-items: stretch;
  }

  .confirm-btn {
    width: 100%;
  }
}

/* 强制覆盖 body 的 line-height */
:deep(.item-text),
:deep(.item-text *) {
  line-height: 1.8 !important;
}
</style>

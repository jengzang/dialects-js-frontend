<template>
  <AppModal
    :model-value="visible"
    size="sm"
    :title="t('home.supportModal.title')"
    :close-label="t('common.button.close')"
    @update:modelValue="handleClose"
  >
    <div class="home-support-content">
      <p class="home-support-subtitle">{{ t('home.supportModal.subtitle') }}</p>
      <div class="donate-qr-grid">
        <div class="donate-qr-box">
          <img :src="weixinQR" :alt="t('home.supportModal.weixinAlt')" />
          <p class="donate-qr-label">{{ t('home.supportModal.weixinLabel') }}</p>
        </div>
        <div class="donate-qr-box">
          <img :src="alipayQR" :alt="t('home.supportModal.alipayAlt')" />
          <p class="donate-qr-label">{{ t('home.supportModal.alipayLabel') }}</p>
        </div>
      </div>
    </div>
  </AppModal>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import AppModal from '@/components/common/AppModal.vue'
import weixinQR from '@/assets/picture/weixin.png'
import alipayQR from '@/assets/picture/zfb.jpg'

defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])
const { t } = useI18n()

function handleClose() {
  emit('close')
}
</script>

<style scoped>
.home-support-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.home-support-subtitle {
  text-align: center;
  color: rgba(0, 0, 0, 0.6);
  margin: 0;
}

.donate-qr-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.25rem;
}

.donate-qr-box {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.donate-qr-box img {
  width: 100%;
  max-width: 150px;
  height: auto;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
}

.donate-qr-box img:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.donate-qr-label {
  margin: 0.625rem 0 0;
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1d1d1f;
  text-align: center;
}

@media (orientation: portrait) {
  .donate-qr-grid {
    gap: 1rem;
  }

  .donate-qr-box img {
    max-width: 120px;
  }
}
</style>

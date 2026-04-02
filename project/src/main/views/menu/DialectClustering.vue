<template>
  <div class="dialect-clustering-page">
    <div class="placeholder-content">
      <div class="placeholder-icon">🧩</div>
      <h2>{{ t('navigation.tabs.dialectClustering') }}</h2>
      <p>{{ t('navigation.placeholders.comingSoon') }}</p>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<style scoped>
.dialect-clustering-page {
  width: 100%;
  height: 100%;
}

.placeholder-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 20px;
  color: #6e6e73;
}

.placeholder-icon {
  font-size: 64px;
}

.placeholder-content h2 {
  font-size: 24px;
  margin: 0;
  color: #1d1d1f;
}

.placeholder-content p {
  font-size: 16px;
  margin: 0;
}

@media (max-aspect-ratio: 1/1) {
  .placeholder-icon {
    font-size: 48px;
  }

  .placeholder-content h2 {
    font-size: 20px;
  }

  .placeholder-content p {
    font-size: 14px;
  }
}
</style>

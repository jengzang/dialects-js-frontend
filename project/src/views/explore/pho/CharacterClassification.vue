<template>
  <div class="character-classification-page">
    <!-- Tab 内容区域，由外部 sub 参数控制 -->
    <div class="tab-content">
      <MiddleChineseTab v-if="activeTab === 'zhonggu'" />

      <div v-else-if="activeTab === 'shanggu'" class="placeholder-content">
        <div class="placeholder-icon">🏛️</div>
        <h2>{{ t('navigation.submenu.charClass.shanggu') }}</h2>
        <p>此功能正在開發中...</p>
      </div>

      <div v-else-if="activeTab === 'jingu'" class="placeholder-content">
        <div class="placeholder-icon">📖</div>
        <h2>{{ t('navigation.submenu.charClass.jingu') }}</h2>
        <p>此功能正在開發中...</p>
      </div>

      <div v-else-if="activeTab === 'yueyun'" class="placeholder-content">
        <div class="placeholder-icon">🎵</div>
        <h2>{{ t('navigation.submenu.charClass.yueyun') }}</h2>
        <p>此功能正在開發中...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import MiddleChineseTab from '@/components/pho/ZhongGuPage.vue'

const { t } = useI18n()
const route = useRoute()

const validSubs = ['zhonggu', 'shanggu', 'jingu', 'yueyun']
const activeTab = ref(validSubs.includes(route.query.sub) ? route.query.sub : 'zhonggu')

watch(() => route.query.sub, (newSub) => {
  if (validSubs.includes(newSub)) {
    activeTab.value = newSub
  }
})
</script>

<style scoped>
.character-classification-page {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.tab-content {
  flex: 1;
  overflow: auto;
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

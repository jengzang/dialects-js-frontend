<template>
  <div class="character-classification-page">
    <ConfigurableCharClassPage :key="activeTab" :page-key="activeTab" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import ConfigurableCharClassPage from '@/main/components/pho/ConfigurableCharClassPage.vue'

const route = useRoute()

const validSubs = ['zhonggu', 'shanggu', 'jingu', 'yueyun']
const activeTab = computed(() =>
  validSubs.includes(route.query.sub) ? route.query.sub : 'zhonggu'
)
</script>

<style scoped>
.character-classification-page {
  width: 100%;
  min-height: 100%;
}
</style>

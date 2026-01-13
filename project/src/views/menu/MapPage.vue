<template>
  <div class="tabs-wrapper">
    <div class="tabs">
      <div
          v-for="tab in tabs"
          :key="tab.name"
          :class="['tab', { active: currentTab === tab.name }]"
          @click="router.replace({ query: { ...route.query, sub: tab.name } })"
      >
        {{ tab.label }}
      </div>
    </div>

    <div class="tab-content" style="justify-items: center">
      <MapLibre v-if="currentTab === 'map'" />
      <DivideTab v-if="currentTab === 'divide'" />

      <CustomTab v-else-if="currentTab === 'custom'" />

    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

// 引入拆分後的組件
import DivideTab from "@/components/map/DivideTab.vue";
import CustomTab from '@/components/map/CustomTab.vue'
import MapLibre from "@/components/map/MapLibre.vue"; // 請根據實際路徑調整

const router = useRouter()
const route = useRoute()

// Tab 邏輯保持不變
const currentTab = computed(() => {
  return route.query.sub || 'map'
})

const tabs = [
  { name: 'map', label: '地圖' },
  { name: 'divide', label: '分區圖' },
  { name: 'custom', label: '自定義繪圖' }
]
</script>

<style scoped>
/* 僅保留外層容器樣式 */
.tab-content {
  width: 100%;
  max-width: 800px;
  animation: fade 0.6s ease;
  flex-direction: column;
  align-items: center;
  text-align: center;
  justify-content: center;
  padding: 1rem;
}

@keyframes fade {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
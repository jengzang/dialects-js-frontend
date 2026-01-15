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

      <div v-if="currentTab === 'map' && mapStore.mode === 'feature' && availableFeatures.length > 0" class="feature-control-area">
        <div v-if="availableFeatures.length > 1" class="dropdown-wrapper">
          <div
              class="dropdown"
              ref="featureTriggerEl"
              style="white-space: nowrap;min-width: 50px"
              @click="toggleDropdown('feature')"
          >
            {{ selectedFeature || '請選擇特徵' }}
            <span class="arrow">{{ dropdownOpen === 'feature' ? '▲' : '▼' }}</span>
          </div>

          <Teleport to="body">
            <div
                v-if="dropdownOpen === 'feature'"
                class="dropdown-panel"
                :style="dropdownStyle.feature"
                ref="featureDropdownEl"
            >
              <div
                  class="dropdown-item"
                  v-for="feat in availableFeatures"
                  :key="feat"
                  @click="selectFeature(feat)"
              >
                {{ feat }}
              </div>
            </div>
          </Teleport>
        </div>
        <div v-else-if="availableFeatures.length === 1" class="single-btn-wrapper">
          <button class="feature-btn active" @click="selectFeature(availableFeatures[0])">
            {{ availableFeatures[0] }}
          </button>
        </div>

    </div>
    </div>

    <div class="tab-content" style="justify-items: center; position: relative;">

      <MapLibre
          v-if="currentTab === 'map'"
          :active-feature="selectedFeature"
          :is-custom="true"
          :dot-level="selectedLevel"
      />
      <DivideTab
          v-if="currentTab === 'divide'"
          @region-selected="(val) => selectedLevel = val"
      />
      <CustomTab v-else-if="currentTab === 'custom'" />

    </div>
  </div>
</template>

<script setup>
import { computed, ref, reactive, nextTick, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { mapStore } from '@/utils/store.js' // 引入 Store 獲取數據

import DivideTab from "@/components/map/DivideTab.vue";
import CustomTab from '@/components/map/CustomTab.vue'
import MapLibre from "@/components/map/MapLibre.vue";
const selectedLevel = ref(3)
const router = useRouter()
const route = useRoute()

// Tab 邏輯
const currentTab = computed(() => {
  return route.query.sub || 'map'
})

const tabs = [
  { name: 'map', label: '地圖' },
  { name: 'divide', label: '分區圖' },
  { name: 'custom', label: '自定義' }
]

// --- ✨ 特徵選擇邏輯 (復刻你提供的邏輯) ---

const selectedFeature = ref('')
const dropdownOpen = ref(null)
const featureTriggerEl = ref(null)
const featureDropdownEl = ref(null)

const dropdownStyle = reactive({
  feature: { top: '0px', left: '0px' }
})

// 計算可用特徵
const availableFeatures = computed(() => {
  if (!mapStore.mergedData || mapStore.mergedData.length === 0) return []
  const features = mapStore.mergedData.map(item => item.feature)
  return [...new Set(features)]
})

// ✨ 核心修改：監聽特徵列表變化
watch(availableFeatures, (newVal) => {
  // 只要有數據
  if (newVal && newVal.length > 0) {
    // 條件 1: 當前還沒有選中值 (初始化)
    // 條件 2: 只有一條數據 (強制默認選中，無需點擊)
    if (!selectedFeature.value || newVal.length === 1) {
      const firstFeature = newVal[0];
      // 1. 更新 UI 顯示狀態
      selectedFeature.value = firstFeature;
      // 2. ✨ 關鍵：同步給 Store，通知地圖組件立即繪圖
      mapStore.activeFeature = firstFeature;
    }
  }
}, { immediate: true }) // 確保組件掛載時如果有數據也觸發

// Toggle 邏輯 (完全復刻)
const toggleDropdown = (type) => {
  dropdownOpen.value = dropdownOpen.value === type ? null : type
  nextTick(() => {
    if (type === 'feature' && featureTriggerEl.value) {
      const rect = featureTriggerEl.value.getBoundingClientRect()
      dropdownStyle.feature = {
        position: 'absolute',
        top: `${rect.top + rect.height + window.scrollY}px`,
        left: `${rect.left + window.scrollX}px`,
        width: `${rect.width}px`, // 讓下拉框寬度跟隨按鈕
        zIndex: 99999
      }
    }
  })
}

// 選擇邏輯
const selectFeature = (val) => {
  selectedFeature.value = val
  dropdownOpen.value = null
  // 如果需要同步到 Store
  mapStore.activeFeature = val
}

// 點擊外部關閉 (完全復刻)
const onClickOutside = (event) => {
  const targets = [featureTriggerEl.value, featureDropdownEl.value]
  const isInsideAny = targets.some(el => el?.contains(event.target))
  if (!isInsideAny) dropdownOpen.value = null
}

onMounted(() => document.addEventListener('click', onClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', onClickOutside))
</script>

<style scoped>
/* 僅保留外層容器樣式 */
.tab-content {
  width: 100%;
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

/* 特徵控制區 (放在地圖上方) */
.feature-control-area {
  margin-left: 12px;
  z-index: 200; /* 確保下拉框在地圖之上 */
  position: relative;
  display: flex;
  justify-content: center;
}
/* === 單一按鈕樣式 (復刻你之前的 Button 風格) === */
.single-btn-wrapper {
  display: flex;
  justify-content: center;
}

.feature-btn {
  padding: 10px 24px;
  border-radius: 20px;
  border: 1px solid rgba(200, 200, 200, 0.5);
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  cursor: pointer;
  font-size: 14px;
  color: #333;
  transition: all 0.3s ease;
}

.feature-btn.active {
  background: #34c759; /* 綠色表示激活 */
  color: white;
  border-color: #34c759;
  box-shadow: 0 4px 12px rgba(52, 199, 89, 0.3);
}

.feature-btn:hover {
  transform: translateY(-2px);
}

@keyframes fade {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>


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

      <!-- 使用 v-show 代替 v-if，保持组件状态 -->
      <MapLibre
          v-show="currentTab === 'map'"
          :active-feature="selectedFeature"
          :is-custom="true"
          :dot-level="selectedLevel"
          @map-click="handleMapClick"
      />
      <DivideTab
          v-show="currentTab === 'divide'"
          @region-selected="(val) => selectedLevel = val"
      />
      <CustomTab
          v-show="currentTab === 'custom'"
      />
      <!-- 自定義數據提交面板（只在 map tab 顯示） -->
      <CustomDataPanel
          v-if="currentTab === 'map'"
          :map-click-coordinates="mapClickCoordinates"
          :selected-feature="selectedFeature"
          @submit-success="handleSubmitSuccess"
      />

    </div>
  </div>
</template>

<script setup>
import { computed, ref, reactive, nextTick, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { mapStore, resultCache } from '@/utils/store.js' // 引入 Store 獲取數據

import DivideTab from "@/components/map/DivideTab.vue";
import CustomTab from '@/components/map/CustomTab.vue'
import MapLibre from "@/components/map/MapLibre.vue";
import CustomDataPanel from '@/components/map/CustomDataPanel.vue'
import { showSuccess, showError } from '@/utils/message.js'
import { func_mergeData, addCustomFeatureData } from '@/utils/MapData.js'

const selectedLevel = ref(3)
const router = useRouter()
const route = useRoute()

// 地圖點擊坐標
const mapClickCoordinates = ref(null)

// Tab 邏輯
const currentTab = computed(() => {
  return route.query.sub || 'map'
})

const tabs = [
  { name: 'map', label: '地圖' },
  { name: 'divide', label: '分區圖' },
  { name: 'custom', label: '自定義' }
]

// 處理地圖點擊事件
const handleMapClick = (coordinates) => {
  mapClickCoordinates.value = coordinates
}

// 處理提交成功事件
const handleSubmitSuccess = async (response) => {
  showSuccess('自定義數據提交成功！')
  // console.log('提交成功:', response)

  // 自动打开自定义数据开关
  mapStore.showCustomData = true;

  // 重新加載合併數據
  try {
    await func_mergeData(resultCache.latestResults, mapStore.mapData)
    console.log('✅ 數據已刷新')
  } catch (error) {
    console.error('❌ 刷新數據失敗:', error)
  }
}

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

// ✨ 監聽特徵列表變化 (修復版)
watch(availableFeatures, (newVal) => {
  // 1. 確保新數據存在且不為空
  if (newVal && newVal.length > 0) {

    // 獲取新列表的第一個特徵
    const firstFeature = newVal[0];

    // ✨ 核心修復：
    // 不管之前有沒有選中，只要數據列表變了，我們就檢查：
    // "當前選中的值" 是否還存在於 "新列表" 中？
    const isCurrentValid = selectedFeature.value && newVal.includes(selectedFeature.value);

    // 邏輯決策：
    // 如果當前選中的值在新列表裡不存在 (說明換了一批數據)
    // 或者 你希望每次搜索都強制重置到第一個特徵 (通常這樣體驗更好，能觸發視角復位)
    if (!isCurrentValid) {
      // 選中新列表的第一個
      selectedFeature.value = firstFeature;
      // 同步給 Store
      mapStore.selectedFeature = firstFeature;
    }
    // 如果 isCurrentValid 為 true，說明用戶選的特徵在新數據裡也有，那就保持不動，體驗更絲滑
  }
  else {
    // 如果新數據為空，清空狀態
    selectedFeature.value = '';
    mapStore.selectedFeature = '';
  }
}, { immediate: true });

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
  // 同步到 Store
  mapStore.selectedFeature = val
}

// 點擊外部關閉 (完全復刻)
const onClickOutside = (event) => {
  const targets = [featureTriggerEl.value, featureDropdownEl.value]
  const isInsideAny = targets.some(el => el?.contains(event.target))
  if (!isInsideAny) dropdownOpen.value = null
}

onMounted(() => document.addEventListener('click', onClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', onClickOutside))

// 监听路由参数，自动加载自定义特征
watch(
  () => route.query.feature,
  async (newFeature, oldFeature) => {
    // 防止重复触发
    if (!newFeature || newFeature === oldFeature) return

    // 只在 map tab 中触发
    if (route.query.sub !== 'map') return

    // console.log('检测到特征参数，开始加载:', newFeature)

    try {
      // 提取路由参数
      const locations = route.query.locations?.split(',').filter(Boolean) || []
      const regions = route.query.regions?.split(',').filter(Boolean) || []
      const regionMode = route.query.regionMode || 'map'

      // console.log('加载参数:', { feature: newFeature, locations, regions, regionMode })

      // 调用 addCustomFeatureData 加载数据
      await addCustomFeatureData([newFeature], locations, regions, regionMode)

      // 自动选中该特征
      selectedFeature.value = newFeature
      mapStore.selectedFeature = newFeature

      // 自动开启自定义数据显示
      mapStore.showCustomData = true

      // 自动切换到 feature 模式（关闭"查看地名"开关）
      mapStore.mode = 'feature'

      showSuccess(`已加载特征：${newFeature}`)

      // console.log('✅ 特征加载成功')

      // 清除路由参数（避免刷新重复加载）
      await router.replace({
        query: {
          ...route.query,
          feature: undefined,
          locations: undefined,
          regions: undefined,
          regionMode: undefined
        }
      })
    } catch (error) {
      console.error('❌ 加载特征失败:', error)
      showError('加载特征失败：' + (error.message || error))
    }
  },
  { immediate: true } // 立即执行一次，检查初始路由参数
)

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


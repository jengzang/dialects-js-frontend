<template>
  <TabsContainer
    :tabs="tabs"
    default-tab="map"
  >
    <!-- Tab 右侧额外内容 -->
    <template #tab-extra>
      <!-- 比较模式：显示比较对象 -->
      <div v-if="currentTab === 'map' && mapStore.mode === 'compare' && comparePair" class="single-btn-wrapper">
        <button class="feature-btn active">
          {{ comparePair }}
        </button>
      </div>

      <!-- Feature 模式：显示特征选择 -->
      <div v-else-if="currentTab === 'map' && mapStore.mode === 'feature' && availableFeatures.length > 0" class="feature-control-area">
        <div v-if="availableFeatures.length > 1" class="dropdown-wrapper">
          <SimpleSelectDropdown
            v-model="selectedFeature"
            :options="featureOptions"
            placeholder="請選擇特徵"
          />
        </div>
        <div v-else-if="availableFeatures.length === 1" class="single-btn-wrapper">
          <button class="feature-btn active" @click="selectFeature(availableFeatures[0])">
            {{ availableFeatures[0] }}
          </button>
        </div>

        <!-- 幫助圖標 -->
        <HelpIcon
            :content="helpText"
            size="sm"
            placement="bottom"
            icon="?"
            icon-color="#007aff"
            style="margin-left: 5px;"
        />
      </div>
    </template>

    <!-- Tab 内容 -->
    <template #default="{ currentTab }">
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
    </template>
  </TabsContainer>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { mapStore, resultCache } from '@/store/store.js'

import TabsContainer from '@/components/common/TabsContainer.vue'
import DivideTab from "@/components/map/DivideTab.vue";
import CustomTab from '@/components/map/CustomTab.vue'
import MapLibre from "@/components/map/MapLibre.vue";
import CustomDataPanel from '@/components/map/CustomDataPanel.vue'
import HelpIcon from '@/components/ToastAndHelp/HelpIcon.vue'
import SimpleSelectDropdown from "@/components/common/SimpleSelectDropdown.vue";
import { showSuccess, showError } from '@/utils/message.js'
import { func_mergeData, addCustomFeatureData } from '@/utils/MapData.js'

const selectedLevel = ref(3)
const router = useRouter()
const route = useRoute()

// 地圖點擊坐標
const mapClickCoordinates = ref(null)

// Tab 邏輯 (需要保留，因为 tab-extra 插槽中要用)
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

// Feature dropdown
const selectedFeature = ref('')

// Computed feature options for dropdown
const featureOptions = computed(() => {
  return availableFeatures.value.map(feat => ({
    label: feat,
    value: feat
  }))
})

// 計算可用特徵
const availableFeatures = computed(() => {
  if (!mapStore.mergedData || mapStore.mergedData.length === 0) return []
  const features = mapStore.mergedData.map(item => item.feature)
  return [...new Set(features)]
})

// 計算比較對象（用於 compare 模式）
const comparePair = computed(() => {
  if (mapStore.mode !== 'compare' || !mapStore.mergedData || mapStore.mergedData.length === 0) {
    return ''
  }
  // 从第一条数据中提取比较对象
  const firstItem = mapStore.mergedData[0]
  return firstItem.pair || ''
})

// 計算幫助文本
const helpText = computed(() => {
  if (!selectedFeature.value) return '如果你想添加個人自定義數據，請先選擇特徵'
  return `如果你想添加個人自定義數據，特徵需填入：${selectedFeature.value}`
})

// Watch for feature list changes
watch(availableFeatures, (newVal) => {
  if (newVal && newVal.length > 0) {
    const firstFeature = newVal[0];
    const isCurrentValid = selectedFeature.value && newVal.includes(selectedFeature.value);

    if (!isCurrentValid) {
      selectedFeature.value = firstFeature;
      mapStore.selectedFeature = firstFeature;
    }
  } else {
    selectedFeature.value = '';
    mapStore.selectedFeature = '';
  }
}, { immediate: true });

// Watch for feature selection changes
watch(selectedFeature, (val) => {
  if (val) {
    mapStore.selectedFeature = val
  }
})

// Select feature (for single button case)
const selectFeature = (val) => {
  selectedFeature.value = val
  mapStore.selectedFeature = val
}

// 监听路由参数，自动加载自定义特征
watch(
  () => route.query.feature,
  async (newFeature, oldFeature) => {
    // 防止重复触发
    if (!newFeature || newFeature === oldFeature) return

    // 只在 map tab 中触发
    if (route.query.sub !== 'map') return

    try {
      // 提取路由参数
      const locations = route.query.locations?.split(',').filter(Boolean) || []
      const regions = route.query.regions?.split(',').filter(Boolean) || []
      const regionMode = route.query.regionMode || 'map'

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

/* Dropdown 样式 */
.dropdown-wrapper {
  flex: 1;
  position: relative;
  align-items: center;
  display: flex;
  justify-content: center;
}

.dropdown {
  padding: 6px 12px;
  border-radius: var(--radius-md);
  background: var(--glass-light);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  cursor: pointer;
  font-size: 14px;
  border: 1px solid rgba(200, 200, 200, 0.5);
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-width: 80px;
  margin: auto;
  transition: all 0.2s;
  white-space: nowrap;
}

.dropdown:hover {
  background: var(--glass-medium);
  border-color: var(--color-primary);
}
</style>

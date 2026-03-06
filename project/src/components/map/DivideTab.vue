<template>
  <div>
    <div class="page" style="max-width: 90%;overflow: hidden">
      <div class="page-content-stack">
        <div class="page-footer" style="flex-direction: column">
          <p style="margin:0">分區繪圖</p>
          <small class="hint">按照不同分區層級，繪製方言分佈點圖<br>程序自動分配不同顏色</small>
        </div>

        <div class="dropdown-row horizontal-dropdown" style="margin-top: 12px;">
          <label class="query-label" style="margin:0;font-size: 14px;">
            繪圖分區級數
          </label>

          <div class="dropdown-wrapper" style="width: 200px">
            <SimpleSelectDropdown
              v-model="selectedRegion"
              :options="regionOptions"
              placeholder="請選擇級數"
            />
          </div>
        </div>
      </div>
    </div>

    <LocationAndRegionInput
        ref="locationRef"
        @update:runDisabled="uiStore.buttonStates.divide.isLocationDisabled = $event"
        v-model="locationModel"
        limitContext="divide"
    />

    <div class="run-container">
      <button
          id="allmap-first"
          class="allmap-first"
          @click="runAction"
          :disabled="buttonState.isRunning || isDisabled"
          :class="{ 'disabled-style': isDisabled }"
      >
        <span v-if="buttonState.isRunning">🔄 運行中...</span>
        <span v-else>🌍繪圖</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import LocationAndRegionInput from "@/components/query/LocationAndRegionInput.vue";
import SimpleSelectDropdown from "@/components/common/SimpleSelectDropdown.vue";
import { mapStore, uiStore, isDivideButtonDisabled, setRunning } from "@/store/store.js";
import { getCoordinates } from '@/api/query/geo'
import { showError } from '@/utils/message.js';

const router = useRouter()
const route = useRoute()

const locationRef = ref(null)
const buttonState = uiStore.buttonStates.divide
const isDisabled = isDivideButtonDisabled
const selectedRegion = ref(null)
const locationModel = ref({
  locations: [],
  regions: [],
  regionUsing: 'map'
})

const emit = defineEmits(['region-selected'])

// Region options for dropdown
const regionOptions = [
  { label: '1級分區', value: 1 },
  { label: '2級分區', value: 2 },
  { label: '3級分區', value: 3 }
]

// Watch for region selection changes
watch(selectedRegion, (val) => {
  if (val) {
    emit('region-selected', val)
  }
})

const runAction = async () => {
  setRunning('divide', true);

  // Use merged locations from template ref (includes custom regions)
  // This gets textarea locations + custom region locations merged in background
  const locationList = (locationRef.value?.allLocationsArray && locationRef.value.allLocationsArray.length > 0)
    ? locationRef.value.allLocationsArray.filter(Boolean)
    : [];  // 空數組，不傳默認值

  const regionList = (locationModel.value.regions && locationModel.value.regions.length > 0)
    ? locationModel.value.regions.filter(Boolean)
    : [];

  const queryParams = {
    locations: locationList,
    regions: regionList,
    region_mode: locationModel.value.regionUsing || 'map',
    iscustom: 'true',
    flag: 'False'
  }

  try {
    const data = await getCoordinates(queryParams)

    // 更新 Store
    mapStore.mapData = data;
    mapStore.mergedData = [];
    mapStore.mode = 'dot';

    // 切換回地圖 Tab
    await router.replace({query: {...route.query, sub: 'map'}});

  } catch (error) {
    console.error(error);
    showError("獲取數據失敗: " + error.message);
  } finally {
    setRunning('divide', false);
  }
}
</script>

<style scoped>
/* 可選：給禁用按鈕加一點樣式，讓用戶知道不可點 */
.allmap-first:disabled {
  background: #ccc; /* 灰色 */
  cursor: not-allowed;
  transform: none !important; /* 禁止按下的動畫 */
  box-shadow: none;
}
/* 將相關樣式移入 */
.horizontal-dropdown {
  display: flex;
  align-items: center;
  justify-content: center;
  justify-items: center;
  gap: 6px;
  width: 100%;
  max-width: 300px;
  margin: auto;
}

.allmap-first {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(90deg, #007aff, mediumblue);
  border: none;
  border-radius: 30px;
  padding: 14px 28px;
  font-size: 18px;
  font-weight: bold;
  letter-spacing: 1px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2), 0 6px 20px rgba(0, 0, 0, 0.19);
  pointer-events: auto; /* 恢復點擊事件，覆蓋父容器的 pointer-events: none */
}

.allmap-first:hover {
  background: linear-gradient(145deg, #4e5d5b, #212d2b);
  transform: translateY(-3px);
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
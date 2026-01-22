<template>
  <div>
    <div class="page">
      <div class="page-content-stack">
        <div class="page-footer">
          <small class="hint">繪製所選方言點的分區圖<br>想輸入多個分區❓️ 點擊👉</small>
          <button class="enter-btn" @click="handleEnter">進入網站</button>
        </div>

        <div class="dropdown-row horizontal-dropdown" style="margin-top: 12px;">
          <label class="query-label" style="margin:0;font-size: 14px;">
            繪圖分區級數
          </label>

          <div class="dropdown-wrapper" style="width: 200px">
            <div class="dropdown" ref="regionTriggerEl" @click="toggleDropdown('region')" style="margin: 0">
              {{ selectedRegion || '請選擇級數' }}
              <span class="arrow">▾</span>
            </div>

            <Teleport to="body">
              <div
                  v-if="dropdownOpen === 'region'"
                  class="dropdown-panel"
                  :style="dropdownStyle.region"
                  ref="regionDropdownEl"
              >
                <div
                    class="dropdown-item"
                    v-for="region in [1, 2, 3]"
                    :key="region"
                    @click="selectRegion(region)"
                >
                  {{ region }}級分區
                </div>
              </div>
            </Teleport>
          </div>
        </div>
      </div>
    </div>

    <LocationAndRegionInput
        ref="locationRef"
        @update:runDisabled="isLocationDisabled = $event"
        v-model="locationModel"
    />

    <div class="run-container">
      <button
          id="allmap-first"
          class="allmap-first"
          @click="runAction"
          :disabled="isRunning || isLocationDisabled"
          :class="{ 'disabled-style': isLocationDisabled }"
      >
        <span v-if="isRunning">🔄 運行中...</span>
        <span v-else>🌍繪圖</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router' // ✨ 1. 引入路由
import LocationAndRegionInput from "@/components/query/LocationAndRegionInput.vue";
import { mapStore } from "@/utils/store.js";
import { api } from "@/utils/auth.js";
import { showError } from '@/utils/message.js';

// ✨ 2. 初始化路由
const router = useRouter()
const route = useRoute()

const locationRef = ref(null)
const isRunning = ref(false)
const selectedRegion = ref('')
const dropdownOpen = ref(null)
const regionTriggerEl = ref(null)
const regionDropdownEl = ref(null)
const locationModel = ref({
  locations: [],
  regions: [],
  regionUsing: 'map'
})


// ✨ 3. 定義禁用狀態變量 (默認為 true，防止未加載完成就點擊)
const isLocationDisabled = ref(false)

const emit = defineEmits(['region-selected'])

const dropdownStyle = reactive({
  region: { top: '0px', left: '0px' }
})

// Dropdown 邏輯
const toggleDropdown = (type) => {
  dropdownOpen.value = dropdownOpen.value === type ? null : type
  nextTick(() => {
    if (type === 'region' && regionTriggerEl.value) {
      const rect = regionTriggerEl.value.getBoundingClientRect()
      dropdownStyle.region = {
        position: 'absolute',
        top: `${rect.top + rect.height + window.scrollY}px`,
        left: `${rect.left + window.scrollX}px`,
        zIndex: 99999
      }
    }
  })
}

const selectRegion = (val) => {
  selectedRegion.value = val
  dropdownOpen.value = null
  emit('region-selected', val)
}

const onClickOutside = (event) => {
  const targets = [regionTriggerEl.value, regionDropdownEl.value]
  const isInsideAny = targets.some(el => el?.contains(event.target))
  if (!isInsideAny) dropdownOpen.value = null
}

onMounted(() => document.addEventListener('click', onClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', onClickOutside))

// 運行邏輯
function getLocation() {
  if (!locationRef.value?.selectedValue ||
      (Array.isArray(locationRef.value?.selectedValue) && locationRef.value.selectedValue.every(item => item === ''))) {
    return locationRef.value?.inputValue || '廣州';
  } else {
    // 這裡返回 inputValue，確保 LocationInput 組件如果輸入了文字也能拿到
    return locationRef.value?.inputValue;
  }
}

const runAction = async () => {
  isRunning.value = true;

  // ✨ 4. 優化參數構造邏輯
  const params_geo = new URLSearchParams();

  // 處理地點
  const locs = getLocation();
// 如果 locs 是字符串，最好也處理一下空格分割，確保後端能收到正確格式
  if (locs) {
    const locArray = locs.trim().split(/\s+/);
    locArray.forEach(l => params_geo.append('locations', l));
  } else {
    // 如果 locs 为空，添加空字符串
    params_geo.append('locations', '');
  }

// 處理分區 (支持數組)
  const regions = locationRef.value?.selectedValue;
  if (Array.isArray(regions)) {
    regions.forEach(r => params_geo.append('regions', r));
  } else if (regions) {
    params_geo.append('regions', regions);
  } else {
    // 如果 regions 为空，添加空字符串
    params_geo.append('regions', '');
  }


  params_geo.append("region_mode", locationRef.value?.regionUsing || '1'); // 這裡確認一下後端是需要 'yindian' 還是 '1'
  params_geo.append("iscustom", "true");
  params_geo.append("flag", "False");

  try {
    const data = await api(`/api/get_coordinates?${params_geo.toString()}`, {
      method: 'GET'
    });

    // 更新 Store
    mapStore.mapData = data;
    mapStore.mergedData = [];
    mapStore.mode = 'dot';

    // 切換回地圖 Tab
    router.replace({ query: { ...route.query, sub: 'map' } });

  } catch (error) {
    console.error(error);
    showError("獲取數據失敗: " + error.message);
  } finally {
    isRunning.value = false;
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
}

.allmap-first:hover {
  background: linear-gradient(145deg, #4e5d5b, #212d2b);
  transform: translateY(-3px);
}
</style>
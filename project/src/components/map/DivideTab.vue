<template>
  <div >
    <div class="page">
      <div class="page-content-stack">
      <div class="page-footer">
        <small class="hint">繪製所選方言點的分區圖<br>想輸入多個分區❓️ 點擊👉</small>
        <button class="enter-btn" @click="handleEnter">進入網站</button>
      </div>

      <div class="dropdown-row horizontal-dropdown" style="margin-top: 12px;">
        <label class="query-label" style="margin:0;font-size: 14px;">
          請選擇繪圖分區級數
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

    <LocationAndRegionInput ref="locationRef" />

    <div class="fancy-run-container">
      <button
          id="allmap-first"
          class="allmap-first"
          @click="runAction"
          :disabled="isRunning">
        <span v-if="isRunning">🔄 運行中...</span>
        <span v-else>🌍繪圖</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick, onMounted, onBeforeUnmount } from 'vue'
import LocationAndRegionInput from "@/components/query/LocationAndRegionInput.vue";

const locationRef = ref(null)
const isRunning = ref(false)
const selectedRegion = ref('')
const dropdownOpen = ref(null)
const regionTriggerEl = ref(null)
const regionDropdownEl = ref(null)

const dropdownStyle = reactive({
  region: { top: '0px', left: '0px' }
})

const handleEnter = () => {
  window.location.href = window.WEB_BASE + '/detail/'
}

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
    return locationRef.value?.inputValue;
  }
}

const runAction = () => {
  isRunning.value = true;
  const data = {
    mode: 'divide', // 或者 'map'，取決於你的後端需求
    location: getLocation(),
    region: locationRef.value?.selectedValue,
    region_source: locationRef.value?.regionUsing,
    level: selectedRegion.value
  }

  sessionStorage.setItem('vueToNativeData', JSON.stringify(data))
  window.location.replace(window.WEB_BASE + '/detail/');
}
</script>

<style scoped>
/* 將相關樣式移入 */
.horizontal-dropdown {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 6px;
  width: 100%;
  max-width: 300px;
  margin: auto;
}

.dropdown {
  padding: 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.3);
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
}

.dropdown-panel {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  border-radius: 10px;
  padding: 6px 0;
  position: absolute;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  min-width: 80px;
  max-height: 40dvh;
  overflow: auto;
  z-index: 9999;
}

.dropdown-item {
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
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
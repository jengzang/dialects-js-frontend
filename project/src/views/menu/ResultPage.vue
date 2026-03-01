<template>
  <div class="result-page-container">
    <div class="header-row">
      <h2 class="tabs-title">{{ pageTitle }}</h2>
      <div v-if="currentTabRef === 'tab1'" class="dropdown-wrapper" style="flex:none;">
        <div
            class="dropdown"
            ref="tab1TriggerEl"
            @click="toggleTab1Dropdown"
            style="margin: 0"
        >
          {{ selectedTab1Type }}
          <span class="arrow">▾</span>
        </div>

        <SimpleDropdown
          v-if="isTab1DropdownOpen"
          v-model="selectedTab1Type"
          :options="toneTypeOptions"
          :triggerEl="tab1TriggerEl"
          @close="isTab1DropdownOpen = false"
        />
      </div>
    </div>

    <div v-if="isLoading" class="glass-loader-container">
      <div class="glass-card">
        <div class="liquid-spinner"></div>
        <div class="timer-text">{{ timer }}s</div>
        <div class="loading-text">正在分析中...</div>
        <div v-if="showLongWaitWarning" class="warning-msg">
          ⚠️ 當前請求數據量較大，運算需時較長。<br>建議適當減少查詢條件以提升速度。
        </div>
      </div>
    </div>

    <ResultList
        v-else-if="latestResults.length > 0 && ['tab2', 'tab3'].includes(currentTabRef)"
        :data="latestResults"
    />

    <template v-else-if="latestResults.length > 0 && ['tab1', 'tab4'].includes(currentTabRef)">

      <CharsAndTones
          :data="latestResults"
          :mode="currentTabRef"
          :tone_for_chars="tone_for_chars"
          :selected-tone-type="selectedTab1Type"
      />
    </template>

    <div v-else-if="!isLoading && latestResults.length === 0" class="empty-state">
      <p>暫無數據，請發起查詢</p>
      <button class="go-query-btn" @click="goToQuery">
        前往查詢
      </button>
    </div>
  </div>
</template>

<script setup>
import {computed, onUnmounted, ref, watch, onMounted} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import { searchChars, searchZhongGu, searchYinWei, searchTones } from '@/api/query/core'
import { getCoordinates } from '@/api/query/geo'
import {globalPayload, mapStore, resultCache} from '@/utils/store.js';
import ResultList from "@/components/result/ResultList.vue";
import CharsAndTones from "@/components/result/CharsAndTones.vue";
import SimpleDropdown from "@/components/common/SimpleDropdown.vue";
import {generateTonesMergedData,generateCharsMergedData,func_mergeData} from "@/utils/MapData.js";

const route = useRoute();
const router = useRouter();
const results = ref([]);
const latestResults = ref([]);
const tone_for_chars = ref([]);
const currentTabRef = ref('tab2');
const payload = ref(null);
let mergedData = [];
// ✅ 修复2：防止并发竞态（旧请求覆盖新请求）
let requestSeq = 0;

const isLoading = ref(false);
const timer = ref('0.0');
const showLongWaitWarning = ref(false);
let timerInterval = null;

const tabMap = {
  'tab1': '查字',
  'tab2': '查中古',
  'tab3': '查音位',
  'tab4': '查調'
};

const pageTitle = computed(() => {
  const p = globalPayload.value;
  if (!p) return '請先查詢';
  const sourceTab = p._sourceTab || 'tab2';
  const tabName = tabMap[sourceTab] || sourceTab;
  let featureText = '';
  if (p.features && Array.isArray(p.features) && p.features.length > 0) {
    featureText = p.features.join(' ');
  }
  return featureText ? `${tabName}·${featureText}` : tabName;
});

const startTimer = () => {
  isLoading.value = true;
  showLongWaitWarning.value = false;
  let startTime = Date.now();
  timer.value = '0.0';
  timerInterval = setInterval(() => {
    const elapsed = (Date.now() - startTime) / 1000;
    timer.value = elapsed.toFixed(1);
    if (elapsed > 30 && !showLongWaitWarning.value) {
      showLongWaitWarning.value = true;
    }
  }, 100);
};

const stopTimer = () => {
  isLoading.value = false;
  if (timerInterval) clearInterval(timerInterval);
};

onUnmounted(() => {
  // ✅ 卸载时让当前请求失效，防止卸载后仍写入 store
  requestSeq++;
  if (timerInterval) clearInterval(timerInterval);
});

watch(
    () => globalPayload.value,
    async (newPayload) => {
      // ✅ 每次触发生成一个序号，只有最新序号允许落库
      const seq = ++requestSeq;

      // console.log("🚀 ResultPage 檢測到數據變化:", newPayload);
      if (!newPayload) return;

      results.value = [];
      latestResults.value = [];
      payload.value = newPayload;
      // console.log("payload:",payload.value)
      const sourceTab = newPayload._sourceTab || 'tab2';
      currentTabRef.value = sourceTab;

      startTimer();

      try {
        mapStore.mode = 'feature';
        // ================= 获取 MapData（放入 try 内，避免失败不 stopTimer）=================
        const MapData = await getCoordinates({
          locations: newPayload.locations || "",
          regions: newPayload.regions || "",
          region_mode: newPayload.region_mode || 'yindian',
          iscustom: "true",
          flag: "False"
        })
        // console.log(MapData)

        // ✅ 竞态保护：MapData 回来时如果不是最新请求，直接退出
        if (seq !== requestSeq) return;

        // ✅ MapData 基本校验，避免后续工具函数/渲染链路崩
        if (!MapData || !MapData.coordinates_locations) {
          console.warn("⚠️ MapData invalid:", MapData);
          return;
        }

        // ================= TAB 1: 查字 =================
        if (sourceTab === 'tab1') {
          resultCache.mode = '';
          resultCache.features = [];

          const queryParams = {
            chars: [],
            locations: newPayload.locations || "",
            regions: Array.isArray(newPayload.regions) ? newPayload.regions : (newPayload.regions || ""),
            region_mode: newPayload.region_mode || 'yindian'
          }

          let rawChars = newPayload.chars;
          if (rawChars) {
            if (typeof rawChars === 'string') rawChars = rawChars.split('');
            if (Array.isArray(rawChars)) queryParams.chars = rawChars;
          }

          const response = await searchChars(queryParams)

          if (seq !== requestSeq) return;

          if (response && response.result) {
            latestResults.value = response.result;

            mergedData = generateCharsMergedData(latestResults.value, MapData);
            if (seq !== requestSeq) return;

            mapStore.mapData = MapData;
            mapStore.mergedData = mergedData;
            if (response && response.tones_result) {
              tone_for_chars.value = response.tones_result;
            }
          } else {
            console.warn("Tab1 Error:", response);
          }
        }

        // ================= TAB 2: 查中古 =================
        else if (sourceTab === 'tab2') {
          const modeCN = tabMap[sourceTab] || sourceTab;
          const featuresList = Array.isArray(newPayload.features) ? newPayload.features : [];
          resultCache.mode = modeCN;
          resultCache.features = featuresList;

          const response = await searchZhongGu({
            ...payload.value,
            exclude_columns: payload.value.exclude_columns || []
          })

          if (seq !== requestSeq) return;

          if (response.success || response.status === 'success') {
            results.value = response.results || response.data;
            latestResults.value = Array.isArray(results.value) ? results.value.flat() : [];

            // ✅ 修复：func_mergeData 是 async，必须 await
            mergedData = await func_mergeData(latestResults.value, MapData);
            // console.log(mergedData)
            if (seq !== requestSeq) return;

            mapStore.mapData = MapData;
            mapStore.mergedData = mergedData;
          } else {
            console.warn("⚠️ API 返回错误:", response.message);
          }
        }

        // ================= TAB 3: 查音位 =================
        else if (sourceTab === 'tab3') {
          const modeCN = tabMap[sourceTab] || sourceTab;
          const featuresList = Array.isArray(newPayload.features) ? newPayload.features : [];
          resultCache.mode = modeCN;
          resultCache.features = featuresList;

          const response = await searchYinWei({
            ...payload.value,
            exclude_columns: payload.value.exclude_columns || []
          })

          if (seq !== requestSeq) return;

          if (response.success) {
            results.value = response.results || response.data;
            latestResults.value = Array.isArray(results.value) ? results.value.flat() : [];

            // ✅ 修复：func_mergeData 是 async，必须 await
            mergedData = await func_mergeData(latestResults.value, MapData);
            if (seq !== requestSeq) return;

            mapStore.mapData = MapData;
            mapStore.mergedData = mergedData;
          } else {
            console.warn("⚠️ API returned empty or error:", response.error);
          }
        }

        // ================= TAB 4: 查調 =================
        else if (sourceTab === 'tab4') {
          resultCache.mode = '';
          resultCache.features = [];
          const response = await searchTones({
            locations: newPayload.locations || "",
            regions: Array.isArray(newPayload.regions) ? newPayload.regions : (newPayload.regions || ""),
            region_mode: newPayload.region_mode || 'yindian'
          })

          if (seq !== requestSeq) return;

          if (response && response.tones_result) {
            latestResults.value = response.tones_result;

            mergedData = generateTonesMergedData(response.tones_result, MapData);
            if (seq !== requestSeq) return;

            mapStore.mapData = MapData;
            mapStore.mergedData = mergedData;
          } else {
            console.warn("Tab4 Error:", response);
          }
        }

      } catch (error) {
        console.error("❌ 請求失敗:", error);
      } finally {
        stopTimer();

        // ✅ finally 里拷贝加保护，避免这里再抛错
        try {
          resultCache.latestResults = (typeof structuredClone === 'function')
              ? structuredClone(latestResults.value)
              : JSON.parse(JSON.stringify(latestResults.value));
        } catch (e) {
          resultCache.latestResults = latestResults.value;
        }
      }
    },
    { immediate: true }
);

const goToQuery = () => {
  router.push({ query: { tab: 'query' } });
};

// ================= ✨ Tab1 Dropdown 邏輯 (使用 SimpleDropdown) =================
const selectedTab1Type = ref('默認');
const isTab1DropdownOpen = ref(false);
const tab1TriggerEl = ref(null);

const toneTypeOptions = [
  { label: '默認', value: '默認' },
  { label: '調值', value: '調值' },
  { label: '調類', value: '調類' }
];

const toggleTab1Dropdown = () => {
  isTab1DropdownOpen.value = !isTab1DropdownOpen.value;
};

</script>


<style scoped>
.result-page-container {
  position: relative;
  min-height: 200px;
  width: 100%;
  display: flex;
  flex-direction: column;
}

/* 🌟 液態玻璃加載器樣式 */
.glass-loader-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 0;
  /* 如果希望是全屏遮罩，可以改為 fixed 並設置 z-index */
}

.glass-card {
  width: 280px;
  padding: 30px;
  background: rgba(255, 255, 255, 0.25);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  animation: float 3s ease-in-out infinite;
}

/* 蘋果風格 Spinner */
.liquid-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid #007aff; /* Apple Blue */
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
  box-shadow: 0 0 15px rgba(0, 122, 255, 0.2);
}

.timer-text {
  font-size: 2em;
  font-weight: 200; /* Apple style thin font */
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  color: #333;
  margin-bottom: 5px;
  font-variant-numeric: tabular-nums; /* 防止數字跳動 */
}

.loading-text {
  font-size: 0.9em;
  color: #666;
  font-weight: 500;
}

.warning-msg {
  margin-top: 15px;
  font-size: 0.85em;
  color: #ff3b30; /* Apple Red */
  background: rgba(255, 59, 48, 0.1);
  padding: 10px;
  border-radius: 12px;
  line-height: 1.4;
  animation: fadeIn 0.5s ease-out;
}

.empty-state {
  text-align: center;
  color: #999;
  padding: 40px;
  font-size: 16px;
}

/* 動畫定義 */
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes float {
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-6px);
  }
  100% {
    transform: translateY(0px);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.empty-state {
  text-align: center;
  color: #999;
  padding: 40px;
  /* 增加 Flex 佈局讓內容垂直居中 */
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px; /* 文字和按鈕的間距 */
}

/* 🌟 新增：按鈕樣式 */
.go-query-btn {
  padding: 10px 24px;
  background-color: #007aff; /* Apple Blue */
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 6px rgba(0, 122, 255, 0.2);
}

.go-query-btn:hover {
  background-color: #0062cc;
  transform: translateY(-1px);
  box-shadow: 0 6px 8px rgba(0, 122, 255, 0.3);
}

.go-query-btn:active {
  transform: translateY(1px);
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
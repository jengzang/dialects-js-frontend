<template>
  <div class="result-page-container">
    <h2 class="tabs-title">{{ pageTitle }}</h2>

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
        :is-condensed="true"
    />

    <CharsAndTones
        v-else-if="latestResults.length > 0 && ['tab1', 'tab4'].includes(currentTabRef)"
        :data="latestResults"
        :mode="currentTabRef"
    />

    <div v-else-if="!isLoading && latestResults.length === 0" class="empty-state">
      <p>暫無數據，請發起查詢</p>
      <button class="go-query-btn" @click="goToQuery">
        前往查詢
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { api } from '@/utils/auth.js';
import { globalPayload } from '@/utils/store.js';
import ResultList from "@/components/result/ResultList.vue";
import CharsAndTones from "@/components/result/CharsAndTones.vue"; // 引入新組件

const route = useRoute();
const router = useRouter();
const results = ref([]);
const latestResults = ref([]);
const currentTabRef = ref('tab2');
const payload = ref(null);

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
  if (timerInterval) clearInterval(timerInterval);
});

watch(
    () => globalPayload.value,
    async (newPayload) => {
      console.log("🚀 ResultPage 檢測到數據變化:", newPayload);

      if (!newPayload) return;

      results.value = [];
      latestResults.value = [];
      payload.value = newPayload;
      const sourceTab = newPayload._sourceTab || 'tab2';
      currentTabRef.value = sourceTab;

      startTimer();

      try {
        // ================= TAB 1: 查字 =================
        if (sourceTab === 'tab1') {
          // 2. 構建 Query String
          const params = new URLSearchParams();

          // 1. 處理 chars (兼容 String 和 Array)
          let rawChars = newPayload.chars;
          if (rawChars) {
            // 情況 A: 如果是字串 (例如 "abc")，拆分成 ['a', 'b', 'c']
            if (typeof rawChars === 'string') {
              rawChars = rawChars.split('');
            }
            // 情況 B: 確保已經是陣列後，進行遍歷添加
            if (Array.isArray(rawChars)) {
              rawChars.forEach(c => params.append("chars", c));
            }
          }
          if (Array.isArray(newPayload.locations)) {
            newPayload.locations.forEach(loc => params.append("locations", loc));
          }
          if (Array.isArray(newPayload.regions)) {
            newPayload.regions.forEach(reg => params.append("regions", reg));
          }
          // 單個值
          params.append("region_mode", newPayload.region_mode || 'yindian');

          // 3. 發送請求 (將 params 拼接到 URL)
          // 假設你的後端路由是 /search_chars/，如果需要 /api 前綴請自行保留
          const response = await api(`/api/search_chars/?${params.toString()}`, {
            method: 'GET'
          });

          if (response && response.result) {
            latestResults.value = response.result;
          } else {
            console.warn("Tab1 Error:", response);
          }
        }

        // ================= TAB 2: 查中古 =================
        else if (sourceTab === 'tab2') {
          const response = await api('/api/ZhongGu', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload.value)
          });
          if (response.success || response.status === 'success') {
            results.value = response.results || response.data;
            latestResults.value = Array.isArray(results.value) ? results.value.flat() : [];
          } else {
            console.warn("⚠️ API 返回错误:", response.message);
          }
        }
        // ================= TAB 3: 查音位 =================
        else if (sourceTab === 'tab3') {
          const modeCN = tabMap[sourceTab] || sourceTab;
          const featuresList = Array.isArray(newPayload.features) ? newPayload.features : [];
          window._resultPageCache = {mode: modeCN, features: featuresList};

          // console.log("🚀 Sending Payload:", JSON.stringify(payload, null, 2));
          const response = await api('/api/YinWei', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload.value)
          });
          if (response.success) {
            results.value = response.results || response.data;
            latestResults.value = Array.isArray(results.value) ? results.value.flat() : [];
          } else {
            console.warn("⚠️ API returned empty or error:", response.error);
          }
        }

        // ================= TAB 4: 查調 =================
        else if (sourceTab === 'tab4') {
          const params = new URLSearchParams();
          if (Array.isArray(newPayload.locations)) {
            newPayload.locations.forEach(loc => params.append("locations", loc));
          }
          if (Array.isArray(newPayload.regions)) {
            newPayload.regions.forEach(reg => params.append("regions", reg));
          }
          // 單個值
          params.append("region_mode", newPayload.region_mode || 'yindian');
          const response = await api(`/api/search_tones/?${params.toString()}`, {
            method: 'GET',

          });

          if (response && response.tones_result) {
            latestResults.value = response.tones_result;
          }
        }

      } catch (error) {
        console.error("❌ 請求失敗:", error);
      } finally {
        stopTimer();
        window.latestdetailResults = JSON.parse(JSON.stringify(latestResults.value));
      }
    },
    {immediate: true}
);

const goToQuery = () => {
  router.push({ query: { tab: 'query' } });
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
</style>
<template>
  <div class="query-box">
    <div class="query-header">
      <label class="query-label" for="tab3-key-input">待查音節</label>
      <span class="help-trigger" @click="openHelpModal">
        不知道輸入什麼音節❓
      </span>
    </div>

    <textarea
        id="tab3-key-input"
        v-model="tab3KeyInput"
        placeholder="請輸入待查音節，例如“a”"
        style="max-height: 5dvh"
        autocomplete="off"
    ></textarea>
  </div>

  <Teleport to="body">
    <Transition name="fade-scale">
      <div v-if="isHelpModalOpen" class="glass-modal-overlay" @click.self="closeHelpModal">
        <div class="glass-card">
          <button class="close-btn" @click="closeHelpModal">&times;</button>
          <h3 class="modal-title">音節查詢助手</h3>
            <div v-if="!hasLocations" class="empty-state">
              <div class="icon-warn">⚠️</div>
              <p>請先選擇地點或分區！<br>選擇後可查看地點所含的音節。</p>
            </div>
            <div v-else class="location-list-container">
              <ul class="glass-list">
                <li v-for="(loc, index) in locationList" :key="index" class="glass-list-item">
                  <div class="item-row">
                    <span class="loc-name">{{ loc }}</span>
                    <button
                        class="query-btn"
                        @click="fetchFeatureCount(loc)"
                        :disabled="loadingStates[loc]"
                    >
                      {{ loadingStates[loc] ? '查詢中...' : '查詢' }}
                    </button>
                  </div>

                  <Transition name="slide-down">
                    <div v-if="apiResults[loc] && apiResults[loc][loc]" class="result-box">

                      <div class="stat-section" v-if="apiResults[loc][loc]['聲母']">
                        <h4 class="stat-title">聲母</h4>
                        <div class="stat-tags">
                            <span v-for="(count, key) in apiResults[loc][loc]['聲母']" :key="key" class="glass-tag">
                              <span class="tag-key">{{ key }}</span>
                              <span class="tag-count">{{ count }}</span>
                            </span>
                        </div>
                      </div>

                      <div class="stat-section" v-if="apiResults[loc][loc]['韻母']">
                        <h4 class="stat-title">韻母</h4>
                        <div class="stat-tags">
                          <span v-for="(count, key) in apiResults[loc][loc]['韻母']" :key="key" class="glass-tag">
                            <span class="tag-key">{{ key }}</span>
                            <span class="tag-count">{{ count }}</span>
                          </span>
                        </div>
                      </div>

                      <div class="stat-section" v-if="apiResults[loc][loc]['聲調']">
                        <h4 class="stat-title">聲調</h4>
                        <div class="stat-tags">
                          <span v-for="(count, key) in apiResults[loc][loc]['聲調']" :key="key" class="glass-tag">
                            <span class="tag-key">{{ key }}</span>
                            <span class="tag-count">{{ count }}</span>
                          </span>
                        </div>
                      </div>

                    </div>
                  </Transition>
                </li>
              </ul>
            </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed ,watch} from 'vue';
import {api} from "@/utils/auth.js";

// 1. 接收父組件傳入的 locationRef
const props = defineProps({
  locationRef: {
    type: Object,
    default: null
  },

});

const tab3KeyInput = ref('');
const isHelpModalOpen = ref(false);

const emit = defineEmits(['update:runDisabled']);
// ✅ 3. 修改後的監聽邏輯：
// 僅當輸入框為空，或“只包含”空格和特定分隔符時，禁用按鈕
watch(tab3KeyInput, (newVal) => {
  // 正則解釋：
  // \s      -> 匹配所有空白字符（空格、換行、Tab）
  // ,;，；、 -> 匹配中英文的逗號、分號、頓號
  // ^...*$  -> 匹配從頭到尾只有這些字符的情況
  // 這樣寫法絕對安全，不會誤傷 IPA 符號（如 ː ʰ ʔ ˥ ˩ 等）
  // 也不會誤傷語法符號（如 - 或 回車換行組合）
  const isInvalid = !newVal || /^[\s,;，；、]*$/.test(newVal);
  if (window.userRole !== 'admin'){
    emit('update:runDisabled', isInvalid);}
  else {emit('update:runDisabled', false);}
}, { immediate: true });

// 狀態管理
const loadingStates = ref({});
const apiResults = ref({});

// 2. 修改：從 props 中獲取地點列表
const locationList = computed(() => {
  // 安全訪問：先判斷 props.locationRef 是否存在
  // 注意：取決於兄弟組件的 expose 方式，通常是 props.locationRef.locationsResult
  // 如果 locationsResult 是 ref，Vue 會自動解包，或需要 .value (視具體實現而定，通常組件實例屬性不需要 .value)
  const list = props.locationRef?.locationsResult || [];
  return Array.isArray(list) ? list : [];
});

const hasLocations = computed(() => locationList.value.length > 0);

// 打開/關閉彈窗
const openHelpModal = () => {
  isHelpModalOpen.value = true;
};

const closeHelpModal = () => {
  isHelpModalOpen.value = false;
};

// 調用 API
const fetchFeatureCount = async (locationName) => {
  loadingStates.value[locationName] = true;
  apiResults.value[locationName] = null;

  try {
    const query = new URLSearchParams();

    // ✅ 重點修改：顯式定義為列表，然後遍歷 append
    // 即使只有一個元素，這樣寫也完全符合 List[str] 的邏輯
    const locationsPayload = [locationName];

    locationsPayload.forEach(loc => {
      query.append('locations', loc);
    });

    const data = await api(
        `/api/feature_counts?${query.toString()}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        }
    );

    // 這裡假設後端返回的數據結構，如果需要格式化請在此處理
    // 例如：const formatted = `共有 ${data.count} 個特徵`;
    apiResults.value[locationName] = data;

  } catch (error) {
    console.error('Feature count fetch error:', error);
    apiResults.value[locationName] = '查詢失敗';
  } finally {
    loadingStates.value[locationName] = false;
  }
};
defineExpose({
  tab3KeyInput
});
</script>

<style scoped>

/* 触发按钮样式 */
.help-trigger {
  font-size: 13px;
  color: #007aff; /* Apple Blue */
  cursor: pointer;
  transition: opacity 0.2s;
  text-decoration: none;
}

.help-trigger:hover {
  opacity: 0.7;
  text-decoration: underline;
}



/* ----------- 🍎 苹果液态玻璃弹窗样式 ----------- */

/* 玻璃卡片主体 */
.glass-card {
  position: relative;
  width: 90%;
  max-width: 600px;
  max-height: 80dvh;
  padding: 25px;
  color: #1d1d1f;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

.modal-title {
  margin: 0 0 20px 0;
  font-size: 20px;
  font-weight: 700;
  text-align: center;
  color: #1d1d1f;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 30px 0;
  color: #666;
}
.icon-warn {
  font-size: 40px;
  margin-bottom: 10px;
}

/* 列表容器 */
.location-list-container {
  margin-top: 10px;
  overflow-y: auto;
  overflow-x: hidden;
  max-height: 70dvh;
}

.glass-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.glass-list-item {
  padding: 12px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}
.glass-list-item:last-child {
  border-bottom: none;
}

/* 列表行布局 */
.item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.loc-name {
  font-weight: 500;
  font-size: 16px;
}

/* 苹果风格按钮 */
.query-btn {
  background: #007aff;
  color: white;
  border: none;
  padding: 6px 14px;
  border-radius: 14px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 6px rgba(0, 122, 255, 0.25);
}

.query-btn:hover {
  background: #006ce6;
  transform: scale(1.02);
}

.query-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

/* 结果框 */
.result-box {
  margin-top: 10px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 13px;
  color: #333;
  border: 1px solid rgba(255, 255, 255, 0.6);
}

.result-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.result-label {
  font-weight: 600;
  color: #007aff;
  font-size: 12px;
}

.result-data {
  font-family: monospace;
  word-break: break-all;
}

/* 动画效果 */
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
  max-height: 200px;
  opacity: 1;
}
.slide-down-enter-from,
.slide-down-leave-to {
  max-height: 0;
  opacity: 0;
  overflow: hidden;
}

/* 结果容器 */
.result-box {
  margin-top: 10px;
  background: rgba(255, 255, 255, 0.4); /* 更通透的背景 */
  border-radius: 12px;
  padding: 15px;
  border: 1px solid rgba(255, 255, 255, 0.5);
}

/* 分区标题 */
.stat-section {
  margin-bottom: 12px;
}
.stat-section:last-child {
  margin-bottom: 0;
}

.stat-title {
  font-size: 12px;
  font-weight: 700;
  color: #8e8e93; /* iOS Label Gray */
  margin: 0 0 6px 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* 标签容器 */
.stat-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

/* 🍎 玻璃胶囊标签 */
.glass-tag {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 20px; /* 胶囊圆角 */

  /* 微型玻璃效果 */
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

  font-size: 13px;
  color: #333;
  transition: transform 0.2s;
}

.glass-tag:hover {
  transform: translateY(-1px);
  background: rgba(255, 255, 255, 0.8);
}

/* 标签内的文字样式 */
.tag-key {
  font-family: "Menlo", "Consolas", monospace; /* 等宽字体显示音标更专业 */
  font-weight: 600;
  margin-right: 6px;
}

.tag-count {
  background: rgba(0, 122, 255, 0.1); /* 浅蓝色背景强调数字 */
  color: #007aff;
  font-weight: 700;
  font-size: 11px;
  padding: 1px 5px;
  border-radius: 8px;
  min-width: 14px;
  text-align: center;
}
</style>
<template>
  <div class="phonology-matrix">
    <div v-if="location" class="location-header">
      <div class="location-title">{{ location }}</div>
      <button class="tone-search-btn" @click="handleCheckTones" :disabled="isLoading">
        {{ isLoading ? '查詢中...' : '查聲調' }}
      </button>
    </div>

    <Teleport to="body">
      <div v-if="showModal" class="modal-overlay" @click="closeModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>聲調信息</h3>
            <button class="close-btn" @click="closeModal">&times;</button>
          </div>

          <div class="modal-body">
            <div v-if="tonesData.length > 0" class="tones-list">
              <div
                v-for="(item, index) in tonesData"
                :key="index"
                class="tone-item"
              >
                {{ item }}
              </div>
            </div>
            <div v-else class="no-data">暫無數據</div>
          </div>

          <div class="modal-footer">
            <button class="modal-close-btn" @click="closeModal">關閉</button>
          </div>
        </div>
      </div>
    </Teleport>

    <div class="matrix-wrapper">
      <table class="matrix-table">
        <thead>
        <tr>
          <th class="corner-cell">聲母\韻母</th>
          <th v-for="initial in initials" :key="initial" class="initial-header">
            {{ initial || '零聲母' }}
          </th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="final in finals" :key="final">
          <th class="final-header">{{ final || '零韻母' }}</th>
          <td
              v-for="initial in initials"
              :key="`${initial}-${final}`"
              class="matrix-cell"
          >
            <div v-if="getCellData(initial, final)" class="cell-content">
              <div
                  v-for="tone in tones"
                  :key="tone"
                  class="tone-row"
              >
                  <span v-if="getCellData(initial, final)[tone]?.length" class="tone-label">
                    {{ tone }}:
                  </span>
                <span class="characters">
                    {{ getCellData(initial, final)[tone]?.join(' ') || '' }}
                  </span>
              </div>
            </div>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'; // 合併 import
import { api } from '@/utils/auth.js';

const props = defineProps({
  location: {
    type: String,
    default: ''
  },
  initials: {
    type: Array,
    required: true
  },
  finals: {
    type: Array,
    required: true
  },
  tones: {
    type: Array,
    required: true
  },
  matrix: {
    type: Object,
    required: true
  }
})

// 使用 computed 或者直接在 template 用 props.location，不要賦值給 const location
// 這裡為了方便，我們創建一個響應式的引用（雖非必須，但如果後續要處理邏輯會方便）
const location = computed(() => props.location);

const getCellData = (initial, final) => {
  return props.matrix[initial]?.[final] || null
}

const tonesData = ref([]);
const showModal = ref(false);
const isLoading = ref(false);
let requestSeq = 0;

const handleCheckTones = async () => {
  // 修正：使用 props.location 或 computed 的 .value
  if (!location.value) return;

  const params = new URLSearchParams();
  params.append('locations', location.value);
  params.append("regions","");
  params.append("region_mode", 'yindian');

  requestSeq++;
  const seq = requestSeq;

  isLoading.value = true;

  try {
    const response = await api(`/api/search_tones/?${params.toString()}`, {
      method: 'GET',
    });

    if (seq !== requestSeq) return;

    if (response && response.tones_result) {
      // 處理 tones_result，提取總數據並過濾空行
      const result = response.tones_result;

      // 如果 result 是數組，取第一個元素的總數據
      if (Array.isArray(result) && result.length > 0 && result[0]['總數據']) {
        tonesData.value = result[0]['總數據'].filter(item => item && item.trim() !== '');
      }
      // 如果 result 是對象，直接取總數據
      else if (result['總數據']) {
        tonesData.value = result['總數據'].filter(item => item && item.trim() !== '');
      }
      // 否則設為空數組
      else {
        tonesData.value = [];
      }

      showModal.value = true;
    } else {
      // 修正：替換未定義的函數為 alert
      alert('未找到相關聲調信息');
    }

  } catch (error) {
    console.error(error);
    if (seq === requestSeq) alert('查詢失敗，請稍後重試');
  } finally {
    if (seq === requestSeq) isLoading.value = false;
  }
};

const closeModal = () => {
  showModal.value = false;
};
</script>


<style scoped>
.phonology-matrix {
  width: 100%;
}

.location-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-dark-light);
  margin-bottom: 6px;
  text-align: center;
}

.matrix-wrapper {
  overflow-x: auto;
  overflow-y: auto;
  border: 1px solid var(--border-gray-light);
  border-radius: var(--radius-lg);
  background: var(--glass-medium2);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: var(--shadow-md2);
}

/* 自定义滚动条样式 */
.matrix-wrapper::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

.matrix-wrapper::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 10px;
}

.matrix-wrapper::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.15);
  border-radius: 10px;
  transition: background 0.2s;
}

.matrix-wrapper::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.25);
}

.matrix-wrapper::-webkit-scrollbar-corner {
  background: transparent;
}

.matrix-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.corner-cell {
  background: var(--glass-lighter2);
  border: 1px solid var(--border-gray-lighter);
  padding: 10px;
  font-weight: 700;
  color: var(--text-dark);
  position: sticky;
  top: 0;
  left: 0;
  z-index: 3;
  min-width: 60px;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.initial-header {
  background: linear-gradient(145deg, rgba(0, 122, 255, 0.08), rgba(0, 122, 255, 0.04));
  border: 1px solid var(--border-gray-lighter);
  padding: 10px;
  font-weight: 600;
  color: var(--text-dark);
  text-align: center;
  position: sticky;
  top: 0;
  z-index: 2;
  min-width: 120px;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  font-size: 15px;
}

.final-header {
  background: linear-gradient(145deg, rgba(255, 152, 0, 0.08), rgba(255, 152, 0, 0.04));
  border: 1px solid var(--border-gray-lighter);
  padding: 10px;
  font-weight: 600;
  color: var(--text-dark);
  text-align: center;
  position: sticky;
  left: 0;
  z-index: 1;
  min-width: 80px;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  font-size: 15px;
}

.matrix-cell {
  border: 1px solid var(--border-gray-lightest);
  padding: 8px;
  vertical-align: top;
  min-width: 120px;
  max-width: 200px;
  background: var(--glass-very-light2);
  transition: background 0.2s ease;
}

.matrix-cell:hover {
  background: var(--glass-light2);
}

.cell-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tone-row {
  display: flex;
  gap: 6px;
  font-size: 13px;
  line-height: 1.5;
}

.tone-label {
  color: var(--text-dark);
  font-weight: 600;
  min-width: 35px;
}

.characters {
  color: var(--text-dark);
  word-break: break-all;
}

/* 移动端适配 */
@media (max-aspect-ratio: 1/1) {

  .location-title {
    font-size: 20px;
    margin-bottom: 5px;
  }

  .matrix-table {
    font-size: 12px;
  }

  .corner-cell,
  .initial-header,
  .final-header {
    padding: 6px;
    min-width: 40px;
  }

  .matrix-cell {
    padding: 4px;
    min-width: 100px;
  }

  .tone-row {
    font-size: 11px;
  }

  .tone-label {
    min-width: 28px;
  }
}

/* 按鈕和彈窗樣式 */
.matrix-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 12px;
}

.tone-search-btn {
  padding: 6px 16px;
  background: var(--glass-medium2);
  border: 1px solid var(--border-gray-light);
  border-radius: 8px;
  color: var(--text-dark);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.tone-search-btn:hover:not(:disabled) {
  background: var(--glass-light2);
  border-color: var(--color-primary);
  transform: translateY(-1px);
}

.tone-search-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12),
              0 2px 8px rgba(0, 0, 0, 0.08),
              inset 0 1px 0 rgba(255, 255, 255, 0.5);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  background: rgba(255, 255, 255, 0.5);
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1d1d1f;
  letter-spacing: -0.3px;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 50%;
  font-size: 20px;
  color: #1d1d1f;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  line-height: 1;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.1);
  transform: scale(1.05);
}

.close-btn:active {
  transform: scale(0.95);
}

.modal-body {
  padding: 20px 24px;
  overflow-y: auto;
  flex: 1;
}

.tones-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tone-item {
  padding: 6px 16px;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 12px;
  font-size: 15px;
  color: #1d1d1f;
  line-height: 1.5;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.tone-item:hover {
  background: rgba(255, 255, 255, 0.8);
  border-color: rgba(0, 0, 0, 0.1);
  transform: translateX(2px);
}

.no-data {
  text-align: center;
  padding: 40px 20px;
  color: #86868b;
  font-size: 15px;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  background: rgba(255, 255, 255, 0.5);
  display: flex;
  justify-content: flex-end;
}

.modal-close-btn {
  padding: 8px 20px;
  background: rgba(0, 122, 255, 0.1);
  border: 1px solid rgba(0, 122, 255, 0.2);
  border-radius: 10px;
  color: #007aff;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.modal-close-btn:hover {
  background: rgba(0, 122, 255, 0.15);
  border-color: rgba(0, 122, 255, 0.3);
  transform: translateY(-1px);
}

.modal-close-btn:active {
  transform: translateY(0);
}

.tones-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: var(--glass-very-light2);
  border-radius: 8px;
  overflow: hidden;
}

.tones-table th,
.tones-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid var(--border-gray-lighter);
}

.tones-table th {
  background: var(--glass-lighter2);
  font-weight: 600;
  color: var(--text-dark);
}

.tones-table td {
  color: var(--text-dark);
}

.tones-table tr:last-child td {
  border-bottom: none;
}

.no-data {
  text-align: center;
  padding: 40px;
  color: var(--text-dark-light);
}
/* --- 標題區域樣式 --- */
.location-header {
  display: flex;
  align-items: center; /* 垂直居中 */
  justify-content: center;
  gap: 12px;           /* 標題與按鈕的間距 */
}

.location-title {
  font-size: 1.5rem;
  font-weight: bold;
}

.tone-btn {
  padding: 4px 12px;
  font-size: 0.9rem;
  cursor: pointer;
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.tone-btn:disabled {
  color: #999;
  cursor: not-allowed;
}

/* --- 彈窗樣式 --- */
.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5); /* 半透明黑色背景 */
  display: flex;
  justify-content: center;
  align-items: center;
  transition: opacity 0.3s ease;
}

.modal-container {
  width: 300px; /* 彈窗寬度，可按需調整 */
  max-width: 90%;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  padding: 20px;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
  margin: 0;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.1rem;
}

.close-icon {
  cursor: pointer;
  font-size: 1.5rem;
  color: #999;
}

.modal-body {
  font-size: 1rem;
  line-height: 1.6;
  color: #333;
  /* 如果內容很多，可以加 max-height 和 overflow-y: auto */
}

.modal-footer {
  text-align: right;
}

.modal-btn {
  padding: 6px 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>

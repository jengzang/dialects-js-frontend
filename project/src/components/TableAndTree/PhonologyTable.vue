<template>
  <div class="phonology-matrix">
    <div v-if="location" class="location-header">
      <div class="location-title">{{ location }}</div>
      <button class="tone-search-btn" @click="handleShowDetails" :disabled="isLoading">
        {{ isLoading ? '查詢中...' : '詳情' }}
      </button>
    </div>

    <Teleport to="body">
      <div v-if="showModal" class="modal-overlay" @click="closeModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h3>📍 {{ location }}</h3>
            <button class="close-btn" @click="closeModal">&times;</button>
          </div>

          <div v-if="isLoading" class="modal-body">
            <div class="popup-loading">
              <div class="mini-spinner"></div>
              <span>加載中...</span>
            </div>
          </div>

          <div v-else-if="locationData && locationData.data && locationData.data.length > 0" class="modal-body">
            <div class="info-section">
              <div class="info-title">{{ locationData.data[0].語言 }}</div>

              <div class="info-item">
                <span class="info-label">地圖集二分區：</span>
                <span class="info-value">{{ locationData.data[0].地圖集二分區 || '無' }}</span>
              </div>

              <div class="info-item">
                <span class="info-label">音典分區：</span>
                <span class="info-value">{{ locationData.data[0].音典分區 || '無' }}</span>
              </div>

              <div class="info-item">
                <span class="info-label">字表來源：</span>
                <span class="info-value">{{ locationData.data[0]['字表來源（母本）'] || '無' }}</span>
              </div>

              <div class="info-item">
                <span class="info-label">經緯度：</span>
                <span class="info-value">{{ formatCoordinates(locationData.data[0].經緯度) }}</span>
              </div>

              <div class="info-item">
                <span class="info-label">行政區劃：</span>
                <span class="info-value">{{ formatAdministrativeRegion(locationData.data[0]) }}</span>
              </div>
            </div>

            <div class="tone-section" v-if="getToneData(locationData.data[0]).length > 0">
              <div class="section-title">調值信息</div>
              <table class="tone-mini-table">
                <thead>
                  <tr>
                    <th>調類</th>
                    <th>調值</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(tone, index) in getToneData(locationData.data[0])" :key="index">
                    <td>{{ tone.label }}</td>
                    <td>{{ tone.value }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div v-else class="modal-body">
            <div class="popup-no-data">暫無數據</div>
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
          <th class="corner-cell" style="white-space: nowrap">分類特徵</th>
          <th v-for="initial in initials" :key="initial" class="initial-header">
            {{ initial || '零聲母' }}
          </th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="final in visibleFinals" :key="final">
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
import { ref, computed, onMounted, nextTick } from 'vue';
import { sqlQuery } from '@/api/sql';

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

// Progressive rendering state
const visibleRowCount = ref(15); // Show first 15 rows immediately
const isFullyRendered = ref(false);

// Memoized cell data lookup for better performance
const cellDataMap = computed(() => {
  const map = new Map();
  for (const initial of props.initials) {
    for (const final of props.finals) {
      const data = props.matrix[initial]?.[final];
      if (data) {
        map.set(`${initial}-${final}`, data);
      }
    }
  }
  return map;
});

const getCellData = (initial, final) => {
  return cellDataMap.value.get(`${initial}-${final}`) || null;
};

// Filter visible finals for progressive rendering
const visibleFinals = computed(() => {
  return props.finals.slice(0, visibleRowCount.value);
});

// Progressive rendering logic
onMounted(() => {
  if (props.finals.length <= 15) {
    isFullyRendered.value = true;
    return;
  }

  const renderNextChunk = () => {
    if (visibleRowCount.value < props.finals.length) {
      visibleRowCount.value = Math.min(
        visibleRowCount.value + 10,
        props.finals.length
      );
      requestAnimationFrame(renderNextChunk);
    } else {
      isFullyRendered.value = true;
    }
  };

  // Start progressive rendering after initial paint
  nextTick(() => {
    requestAnimationFrame(renderNextChunk);
  });
});

const locationData = ref(null);
const showModal = ref(false);
const isLoading = ref(false);

const handleShowDetails = async () => {
  if (!location.value) return;

  showModal.value = true;
  isLoading.value = true;
  locationData.value = null;

  try {
    const payload = {
      db_key: "query",
      table_name: "dialects",
      page: 1,
      page_size: 50,
      sort_by: null,
      sort_desc: false,
      search_columns: [],
      search_text: "",
      filters: {
        簡稱: [location.value]
      }
    };

    const response = await sqlQuery(payload)

    locationData.value = response;
  } catch (error) {
    console.error('查詢地名數據失敗:', error);
    alert('查詢失敗，請稍後重試');
  } finally {
    isLoading.value = false;
  }
};

const closeModal = () => {
  showModal.value = false;
};

// 格式化行政區劃
const formatAdministrativeRegion = (data) => {
  const parts = [];
  if (data.省) parts.push(data.省);
  if (data.市) parts.push(data.市);
  if (data.縣) parts.push(data.縣);
  if (data.鎮) parts.push(data.鎮);
  if (data.行政村) parts.push(data.行政村);
  if (data.自然村) parts.push(data.自然村);
  return parts.length > 0 ? parts.join('-') : ' ';
};

// 格式化經緯度（保留6位小數）
const formatCoordinates = (coords) => {
  if (!coords) return '無';
  const parts = coords.split(',');
  if (parts.length !== 2) return coords;

  const lng = parseFloat(parts[0]);
  const lat = parseFloat(parts[1]);

  if (isNaN(lng) || isNaN(lat)) return coords;

  return `${lng.toFixed(6)}, ${lat.toFixed(6)}`;
};

// 提取調值數據
const getToneData = (data) => {
  const tones = [
    { key: 'T1陰平', label: 'T1' },
    { key: 'T2陽平', label: 'T2' },
    { key: 'T3陰上', label: 'T3' },
    { key: 'T4陽上', label: 'T4' },
    { key: 'T5陰去', label: 'T5' },
    { key: 'T6陽去', label: 'T6' },
    { key: 'T7陰入', label: 'T7' },
    { key: 'T8陽入', label: 'T8' },
    { key: 'T9其他調', label: 'T9' },
    { key: 'T10輕聲', label: 'T10' }
  ];

  return tones
    .map(tone => ({
      label: tone.label,
      value: data[tone.key] || '無'
    }))
    .filter(tone => tone.value !== '無');
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
  max-height: 90dvh;
  margin-bottom:15px ;
  /* GPU acceleration for smooth scrolling */
  will-change: transform;
  contain: layout style;
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
  /* GPU acceleration and backdrop-filter optimization */
  transform: translateZ(0);
  isolation: isolate;
}

.corner-cell::before {
  content: '';
  position: absolute;
  inset: 0;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  z-index: -1;
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
  font-size: 15px;
  /* GPU acceleration and backdrop-filter optimization */
  transform: translateZ(0);
  isolation: isolate;
}

.initial-header::before {
  content: '';
  position: absolute;
  inset: 0;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  z-index: -1;
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
  font-size: 15px;
  /* GPU acceleration and backdrop-filter optimization */
  transform: translateZ(0);
  isolation: isolate;
}

.final-header::before {
  content: '';
  position: absolute;
  inset: 0;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  z-index: -1;
}

.matrix-cell {
  border: 1px solid var(--border-gray-lightest);
  padding: 8px;
  vertical-align: top;
  min-width: 120px;
  max-width: 200px;
  background: var(--glass-very-light2);
  /* Remove transition for better performance on Android */
  /* Layout isolation for better rendering performance */
  contain: layout style paint;
}

.matrix-cell:hover {
  background: var(--glass-light2);
  /* Instant color change - no transition needed */
}

.cell-content {
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

/* 標題和按鈕區域 */
.location-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 16px;
}

.location-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-dark-light);
  margin: 0;
}

.tone-search-btn {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  color: #007aff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08),
              inset 0 1px 0 rgba(255, 255, 255, 0.5);
}

.tone-search-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.8);
  border-color: rgba(0, 122, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.15),
              inset 0 1px 0 rgba(255, 255, 255, 0.6);
}

.tone-search-btn:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1),
              inset 0 1px 0 rgba(255, 255, 255, 0.4);
}

.tone-search-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
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

/* LocationDetailPopup 樣式 */
.popup-loading {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 20px;
  color: #666;
  font-size: 13px;
  justify-content: center;
}

.mini-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.info-section {
  margin-bottom: 16px;
}

.info-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
}

.info-item {
  padding: 6px 0;
  line-height: 1.6;
  display: flex;
  align-items: baseline;
  font-size: 16px;
}

.info-label {
  color: #666;
  font-weight: 700;
  flex-shrink: 0;
  white-space: nowrap;
}

.info-value {
  color: #333;
  margin-left: 4px;
  white-space: nowrap;
}

.tone-section {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #eee;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.tone-mini-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

.tone-mini-table th,
.tone-mini-table td {
  padding: 6px 8px;
  text-align: left;
  border: 1px solid #ddd;
}

.tone-mini-table th {
  background: #f5f5f5;
  font-weight: 600;
  color: #555;
}

.tone-mini-table tbody tr:hover {
  background: #f9f9f9;
}

.popup-no-data {
  padding: 20px;
  text-align: center;
  color: #999;
  font-size: 13px;
}
</style>

<template>
  <Teleport to="body">
    <div
        v-if="visible"
        class="popup-vue popup-animated location-detail-popup"
        @click.stop
    >
      <div class="popup-content">
        <div class="popup-header">
          <span class="popup-title">📍 {{ locationName }}</span>
          <button class="popup-close-btn" @click="$emit('close')">✕</button>
        </div>

        <div v-if="loading" class="popup-loading">
          <div class="mini-spinner"></div>
          <span>加載中...</span>
        </div>

        <div v-else-if="data && data.data && data.data.length > 0" class="popup-body">
          <div class="info-section">
            <div class="info-title">{{ data.data[0].語言 }}</div>

            <div class="info-item">
              <span class="info-label">地圖集二分區：</span>
              <span class="info-value">{{ data.data[0].地圖集二分區 || '無' }}</span>
            </div>

            <div class="info-item">
              <span class="info-label">音典分區：</span>
              <span class="info-value">{{ data.data[0].音典分區 || '無' }}</span>
            </div>

            <div class="info-item">
              <span class="info-label">字表來源：</span>
              <span class="info-value">{{ data.data[0]['字表來源（母本）'] || '無' }}</span>
            </div>

            <div class="info-item">
              <span class="info-label">經緯度：</span>
              <span class="info-value">{{ formatCoordinates(data.data[0].經緯度) }}</span>
            </div>

            <div class="info-item">
              <span class="info-label">行政區劃：</span>
              <span class="info-value">{{ formatAdministrativeRegion(data.data[0]) }}</span>
            </div>
          </div>

          <div class="tone-section" v-if="getToneData(data.data[0]).length > 0">
            <div class="section-title">調值信息</div>
            <table class="tone-mini-table">
              <thead>
                <tr>
                  <th>調類</th>
                  <th>調值</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(tone, index) in getToneData(data.data[0])" :key="index">
                  <td>{{ tone.label }}</td>
                  <td>{{ tone.value }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div v-else class="popup-no-data">
          暫無數據
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
const props = defineProps({
  visible: { type: Boolean, default: false },
  locationName: { type: String, default: '' },
  data: { type: Object, default: null },
  loading: { type: Boolean, default: false },
  position: { type: Object, default: () => ({ top: 0, left: 0 }) }
});

const emit = defineEmits(['close']);

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

<style>
/* 非 scoped 樣式，用於覆蓋 ResultTable.css 中的 popup-vue */
.location-detail-popup.popup-vue {
  position: fixed !important;
  top: 50% !important;
  left: 50% !important;
  transform: translate(-50%, -50%) !important;
  z-index: 999999 !important;
}

.location-detail-popup.popup-vue:hover {
  background: rgba(255, 255, 255, 0.7) !important;
}
.location-detail-popup .popup-content {
  max-height: 60dvh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
</style>

<style scoped>
@import 'ResultTable.css';
</style>

<style scoped>


.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid #007bff;
  flex-shrink: 0;
}

.popup-title {
  font-size: 16px;
  font-weight: 600;
  color: #020000;
}

.popup-close-btn {
  background: #f0f0f0;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: #666;
  padding: 2px 6px;
  border-radius: 4px;
  transition: all 0.2s;
  line-height: 1;
}

.popup-close-btn:hover {
  background: #e0e0e0;
  color: #333;
}

.popup-loading {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 20px;
  color: #666;
  font-size: 13px;
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

.popup-body {
  font-size: 13px;
  overflow-y: auto;
  flex: 1;
  padding-right: 8px;
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

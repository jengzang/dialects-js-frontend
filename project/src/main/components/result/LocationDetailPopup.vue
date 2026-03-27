<template>
  <Teleport to="body">
    <div v-if="visible" class="glass-overlay main-glass-overlay" @mousedown.self="$emit('close')">
      <div class="location-detail-modal glass-modal main-glass-modal" role="dialog" aria-modal="true" @click.stop>
        <div class="modal-header main-glass-modal-header">
          <div class="modal-title main-glass-modal-title">📍 {{ t('result.locationDetailPopup.title', { name: locationName }) }}</div>
          <button class="modal-close global-close-btn-base main-glass-modal-close" type="button" :aria-label="t('common.button.close')" @click="$emit('close')">✕</button>
        </div>

        <div class="modal-body main-glass-modal-body">
          <div v-if="loading" class="loading-state main-modal-loading-state">
            <div class="spinner main-modal-spinner"></div>
            <span>{{ t('result.locationDetailPopup.loading') }}</span>
          </div>

          <div v-else-if="data && data.data && data.data.length > 0" class="location-content">
            <div class="info-section">
              <div class="info-title">{{ data.data[0]['語言'] || locationName }}</div>

              <div class="info-item">
                <span class="info-label">{{ t('result.locationDetailPopup.fields.mapPartition') }}</span>
                <span class="info-value">{{ data.data[0]['地圖集二分區'] || t('result.terms.none') }}</span>
              </div>

              <div class="info-item">
                <span class="info-label">{{ t('result.locationDetailPopup.fields.yindianPartition') }}</span>
                <span class="info-value">{{ data.data[0]['音典分區'] || t('result.terms.none') }}</span>
              </div>

              <div class="info-item">
                <span class="info-label">{{ t('result.locationDetailPopup.fields.source') }}</span>
                <span class="info-value">{{ data.data[0]['字表來源（母本）'] || t('result.terms.none') }}</span>
              </div>

              <div class="info-item">
                <span class="info-label">{{ t('result.locationDetailPopup.fields.coordinates') }}</span>
                <span class="info-value">{{ formatCoordinates(data.data[0]['經緯度']) }}</span>
              </div>

              <div class="info-item">
                <span class="info-label">{{ t('result.locationDetailPopup.fields.region') }}</span>
                <span class="info-value">{{ formatAdministrativeRegion(data.data[0]) }}</span>
              </div>
            </div>

            <div class="tone-section" v-if="getToneData(data.data[0]).length > 0">
              <div class="section-title">{{ t('result.locationDetailPopup.toneSection.title') }}</div>
              <table class="tone-table">
                <thead>
                  <tr>
                    <th>{{ t('result.locationDetailPopup.toneSection.headers.class') }}</th>
                    <th>{{ t('result.locationDetailPopup.toneSection.headers.value') }}</th>
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

          <div v-else class="error-state main-modal-error-state">
            <span>{{ t('result.locationDetailPopup.noData') }}</span>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { useI18n } from 'vue-i18n';

defineProps({
  visible: { type: Boolean, default: false },
  locationName: { type: String, default: '' },
  data: { type: Object, default: null },
  loading: { type: Boolean, default: false },
  position: { type: Object, default: () => ({ top: 0, left: 0 }) }
});

defineEmits(['close']);
const { t } = useI18n();

const formatAdministrativeRegion = (data) => {
  const parts = [];

  if (data['省']) parts.push(data['省']);
  if (data['市']) parts.push(data['市']);
  if (data['縣']) parts.push(data['縣']);
  if (data['鎮']) parts.push(data['鎮']);
  if (data['行政村']) parts.push(data['行政村']);
  if (data['自然村']) parts.push(data['自然村']);

  return parts.length > 0 ? parts.join('-') : t('result.terms.none');
};

const formatCoordinates = (coords) => {
  if (!coords) return t('result.terms.none');

  const parts = coords.split(',');
  if (parts.length !== 2) return coords;

  const lng = parseFloat(parts[0]);
  const lat = parseFloat(parts[1]);

  if (isNaN(lng) || isNaN(lat)) return coords;

  return `${lng.toFixed(6)}, ${lat.toFixed(6)}`;
};

const getToneData = (data) => {
  const noneText = t('result.terms.none');
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
      value: data[tone.key] || noneText
    }))
    .filter(tone => tone.value !== noneText);
};
</script>

<style>
/* 非 scoped 样式 - 全局遮罩和模态框 */
.location-detail-glass-overlay-unused {
  position: fixed;
  inset: 0;
  z-index: 20000;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 18px;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(7px);
  -webkit-backdrop-filter: blur(6px);
}

.location-detail-glass-modal-unused {
  width: min(720px, 94vw);
  max-height: min(70vh, 640px);
  overflow: hidden;
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 18px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(18px) saturate(160%);
  -webkit-backdrop-filter: blur(18px) saturate(160%);
}

.location-detail-modal-header-unused {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.location-detail-modal-title-unused {
  font-size: 15px;
  font-weight: 650;
  color: #1d1d1f;
}

.location-detail-modal-close-unused {
  appearance: none;
  border: none;
  background: rgba(142, 142, 147, 0.15);
  width: 28px;
  height: 28px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 18px;
  line-height: 28px;
  color: #666;
  transition: all 0.2s ease;
}

.location-detail-modal-close-unused:hover {
  background: rgba(142, 142, 147, 0.25);
  color: #333;
}

.location-detail-modal-body-unused {
  padding: 12px 14px 16px;
  overflow: auto;
  max-height: calc(min(70vh, 640px) - 100px);
}
</style>

<style scoped>
/* 地名详情弹窗 */
.location-detail-modal {
  width: min(500px, 94vw);
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.location-detail-modal .modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
  background: rgba(255, 255, 255, 0.3);
}

/* 自定义滚动条 */
.location-detail-modal .modal-body::-webkit-scrollbar {
  width: 8px;
}

.location-detail-modal .modal-body::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 10px;
}

.location-detail-modal .modal-body::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.15);
  border-radius: 10px;
  transition: background 0.2s;
}

.location-detail-modal .modal-body::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.25);
}

/* 加载状态 */
.location-detail-loading-state-unused {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px 20px;
  color: #666;
  font-size: 14px;
}

.location-detail-spinner-unused {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(0, 122, 255, 0.2);
  border-top: 3px solid #007aff;
  border-radius: 50%;
  animation: location-detail-spin-unused 1s linear infinite;
}

@keyframes location-detail-spin-unused {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 错误状态 */
.location-detail-error-state-unused {
  padding: 40px 20px;
  text-align: center;
  color: #999;
  font-size: 14px;
}

/* 内容区域 */
.location-content {
  font-size: 14px;
}

/* 信息区域 */
.info-section {
  margin-bottom: 20px;
}

.info-title {
  font-size: 16px;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid rgba(0, 122, 255, 0.2);
}

.info-item {
  padding: 10px 0;
  line-height: 1.6;
  display: flex;
  align-items: baseline;
  transition: all 0.2s ease;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.info-item:last-child {
  border-bottom: none;
}

.info-item:hover {
  background: rgba(0, 122, 255, 0.05);
  padding-left: 8px;
  margin-left: -8px;
  margin-right: -8px;
  padding-right: 8px;
  border-radius: 6px;
}

.info-label {
  color: #666;
  font-weight: 600;
  flex-shrink: 0;
  white-space: nowrap;
  min-width: 110px;
}

.info-value {
  color: #1d1d1f;
  margin-left: 12px;
  word-break: break-all;
}

/* 调值区域 */
.tone-section {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 2px solid rgba(0, 0, 0, 0.08);
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 12px;
}

/* 表格样式 */
.tone-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 13px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.tone-table th,
.tone-table td {
  padding: 10px 12px;
  text-align: left;
}

.tone-table th {
  background: rgba(0, 122, 255, 0.1);
  font-weight: 600;
  color: #1d1d1f;
  border-bottom: 2px solid rgba(0, 122, 255, 0.2);
}

.tone-table tbody tr {
  transition: all 0.2s ease;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.tone-table tbody tr:last-child {
  border-bottom: none;
}

.tone-table tbody tr:hover {
  background: rgba(0, 122, 255, 0.08);
}

.tone-table td {
  color: #333;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .location-detail-modal {
    width: 100%;
    max-width: 100%;
    max-height: 90vh;
    border-radius: 20px 20px 0 0;
  }

  .location-detail-modal .modal-body {
    padding: 16px;
  }

  .info-label {
    min-width: 90px;
    font-size: 13px;
  }

  .info-value {
    font-size: 13px;
  }
}
</style>

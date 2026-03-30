<template>
  <AppModal
    :model-value="visible"
    size="sm"
    :title="modalTitle"
    :close-label="t('common.button.close')"
    @update:modelValue="handleClose"
  >
    <div v-if="loading" class="loading-state main-modal-loading-state">
      <div class="ui-loading--page" aria-hidden="true"></div>
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
  </AppModal>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';
import AppModal from '@/components/common/AppModal.vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  locationName: { type: String, default: '' },
  data: { type: Object, default: null },
  loading: { type: Boolean, default: false },
  position: { type: Object, default: () => ({ top: 0, left: 0 }) }
});

const emit = defineEmits(['close']);
const { t } = useI18n();
const modalTitle = computed(() => `📍 ${t('result.locationDetailPopup.title', { name: props.locationName })}`)

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

const handleClose = () => {
  emit('close');
};
</script>

<style scoped>
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
  .info-label {
    min-width: 90px;
    font-size: 13px;
  }

  .info-value {
    font-size: 13px;
  }
}
</style>

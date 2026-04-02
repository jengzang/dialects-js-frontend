<template>
  <AppModal
    :model-value="visible"
    size="sm"
    :title="popupTitle"
    :close-label="t('common.button.close')"
    @update:modelValue="handleClose"
  >
    <div class="popup-form">
      <div class="form-group">
        <label class="form-label">{{ t('user.regionPage.form.nameLabel') }}</label>
        <textarea
          :value="formState.editingRegion.region_name"
          class="form-textarea"
          style="height: 45px"
          :placeholder="t('user.regionPage.form.namePlaceholder')"
          :disabled="Boolean(formState.editingRegion.id)"
          @input="updateRegionField('region_name', $event.target.value)"
        />
        <p v-if="formState.editingRegion.id" class="form-hint">
          {{ t('user.regionPage.form.nameLockedHint') }}
        </p>
      </div>

      <div class="form-group">
        <label class="form-label">{{ t('user.regionPage.form.descriptionLabel') }}</label>
        <textarea
          :value="formState.editingRegion.description"
          class="form-textarea"
          :placeholder="t('user.regionPage.form.descriptionPlaceholder')"
          rows="3"
          @input="updateRegionField('description', $event.target.value)"
        ></textarea>
      </div>

      <div class="form-group">
        <div class="location-header">
          <label class="form-label">{{ t('user.regionPage.form.locationsLabel') }}</label>
          <button
            type="button"
            class="select-location-btn"
            :title="t('user.regionPage.form.selectLocationsTitle')"
            @click="emit('open-location-selector')"
          >
            {{ t('user.regionPage.form.selectLocationsButton') }}
          </button>
        </div>

        <textarea
          :value="formState.locationInput"
          class="form-input location-input"
          :placeholder="t('user.regionPage.form.locationInputPlaceholder')"
          rows="6"
          @input="handleLocationInput"
        ></textarea>
        <p class="form-hint">
          {{ t('user.regionPage.form.locationHint') }}
        </p>

        <div class="location-stats">
          <div class="stat-badge">
            <span class="stat-icon">M</span>
            <span>
              {{ t('user.regionPage.form.manualCount', { count: stats.manualInputCount }) }}
            </span>
          </div>
          <div class="stat-badge primary">
            <span class="stat-icon">T</span>
            <span>
              {{ t('user.regionPage.form.treeCount', { count: stats.treeSelectedCount }) }}
            </span>
          </div>
        </div>

        <div v-if="formState.editingRegion.locations.length > 0" class="selected-locations-display">
          <div class="location-tags">
            <span
              v-for="(loc, idx) in formState.editingRegion.locations"
              :key="idx"
              class="location-tag"
              :class="{ 'from-tree': stats.availableLocations.has(loc) }"
            >
              {{ loc }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
<!--      <div class="popup-footer">-->
        <button class="btn-secondary" @click="handleClose">
          {{ t('common.button.cancel') }}
        </button>
        <button class="btn-primary" :disabled="!uiState.canSave || uiState.isSaving" @click="emit('save')">
          <span v-if="uiState.isSaving" class="ui-loading--inline" aria-hidden="true"></span>
          <span v-else>{{ t('common.button.save') }}</span>
        </button>
<!--      </div>-->
    </template>
  </AppModal>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import AppModal from '@/components/common/AppModal.vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  formState: {
    type: Object,
    default: () => ({
      editingRegion: {
        region_name: '',
        locations: [],
        description: ''
      },
      locationInput: ''
    })
  },
  stats: {
    type: Object,
    default: () => ({
      availableLocations: new Set(),
      treeSelectedCount: 0,
      manualInputCount: 0
    })
  },
  uiState: {
    type: Object,
    default: () => ({
      canSave: false,
      isSaving: false
    })
  }
})

const formState = computed(() => ({
  editingRegion: {
    region_name: '',
    locations: [],
    description: ''
  },
  locationInput: '',
  ...props.formState
}))

const stats = computed(() => ({
  availableLocations: new Set(),
  treeSelectedCount: 0,
  manualInputCount: 0,
  ...props.stats
}))

const uiState = computed(() => ({
  canSave: false,
  isSaving: false,
  ...props.uiState
}))

const emit = defineEmits([
  'close',
  'save',
  'open-location-selector',
  'update:formState',
  'location-input'
])

const { t } = useI18n()

const popupTitle = computed(() => (
  formState.value.editingRegion.id
    ? t('user.regionPage.modal.editTitle')
    : t('user.regionPage.modal.createTitle')
))

function handleClose() {
  emit('close')
}

function updateRegionField(field, value) {
  emit('update:formState', {
    ...formState.value,
    editingRegion: {
      ...formState.value.editingRegion,
      [field]: value
    }
  })
}

function handleLocationInput(event) {
  emit('update:formState', {
    ...formState.value,
    locationInput: event.target.value
  })
  emit('location-input')
}
</script>

<style scoped>
.popup-form {
  display: flex;
  flex-direction: column;
}

.form-group {
  margin-bottom: 20px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #2c3e50;
  margin-bottom: 8px;
}

.form-input,
.form-textarea {
  height: auto;
  max-height: 120px;
  width: 100%;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
  font-family: inherit;
  box-sizing: border-box;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #007aff;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

.form-input:disabled,
.form-textarea:disabled {
  background: rgba(0, 0, 0, 0.05);
  cursor: not-allowed;
}

.form-hint {
  margin-top: 6px;
  font-size: 12px;
  color: #999;
}

.location-input {
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  line-height: 2;
  resize: vertical;
}

.location-stats {
  display: flex;
  gap: 12px;
  margin-top: 12px;
  margin-bottom: 12px;
}

.stat-badge {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 16px;
  background: rgba(0, 122, 255, 0.1);
  border-radius: 8px;
  font-size: 13px;
  color: #007aff;
  font-weight: 500;
}

.stat-badge.primary {
  background: rgba(52, 199, 89, 0.15);
  color: #34c759;
}

.stat-icon {
  font-size: 14px;
  font-weight: 700;
}

.selected-locations-display {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  padding: 12px;
  margin-top: 12px;
}

.location-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  max-height: 200px;
  overflow-y: auto;
}

.location-tag {
  padding: 4px 10px;
  background: rgba(0, 122, 255, 0.1);
  color: #007aff;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.location-tag.from-tree {
  background: rgba(52, 199, 89, 0.15);
  color: #34c759;
  border: 1px solid rgba(52, 199, 89, 0.3);
}

.location-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
  gap: 6px;
}

.select-location-btn {
  appearance: none;
  border: 1px solid var(--color-primary-border2);
  background: var(--color-primary-light);
  color: var(--color-primary);
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 8px;
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
  transition: all 0.2s ease;
  font-weight: 500;
}

.select-location-btn:hover {
  background: var(--color-primary-light2);
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 122, 255, 0.2);
}

.select-location-btn:active {
  transform: translateY(0);
}

.popup-footer {
  position: sticky;
  bottom: calc(-1 * var(--modal-content-padding-bottom));
  margin:
    20px
    calc(-1 * var(--modal-content-padding-inline))
    calc(-1 * var(--modal-content-padding-bottom));
  padding: 16px var(--modal-content-padding-inline) 20px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(12px);
}

.btn-primary,
.btn-secondary {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  font-weight: 500;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, #007aff, #0051d5);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.9);
  color: #007aff;
  border: 1px solid rgba(0, 122, 255, 0.3);
}

.btn-secondary:hover {
  background: rgba(0, 122, 255, 0.1);
}
</style>

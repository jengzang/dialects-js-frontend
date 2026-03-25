<template>
  <Teleport to="body">
    <div v-if="visible" class="glass-overlay" @mousedown.self="emit('close')">
      <div class="cell-detail-modal glass-modal" role="dialog" aria-modal="true">
        <div class="modal-header">
          <div class="modal-title">{{ titleText }}</div>
          <button
            class="modal-close"
            type="button"
            :aria-label="t('result.phonologyTable.exitFullscreen')"
            @click="emit('close')"
          >
            x
          </button>
        </div>

        <div class="modal-body">
          <div v-if="toneSections.length === 0" class="empty-state">
            {{ t('result.noData') }}
          </div>

          <div v-else class="tone-section-list">
            <section
              v-for="section in toneSections"
              :key="section.tone"
              class="tone-section"
            >
              <div class="tone-title">{{ section.tone }}</div>

              <div
                v-for="item in section.items"
                :key="`${section.tone}-${item.label}`"
                class="detail-item"
              >
                <div class="item-head">
                  <span class="item-label">{{ item.label }}</span>
                  <span class="item-count">{{ item.count }}</span>
                </div>
                <div class="item-chars">{{ (item.chars || []).join(' ') }}</div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  location: {
    type: String,
    default: ''
  },
  initial: {
    type: String,
    default: ''
  },
  final: {
    type: String,
    default: ''
  },
  toneSections: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close'])

const titleText = computed(() => {
  const location = props.location || ''
  const initial = props.initial || t('result.phonologyTable.zeroInitial')
  const final = props.final || t('result.phonologyTable.zeroFinal')

  return location ? `${location} - ${initial}/${final}` : `${initial}/${final}`
})
</script>

<style scoped>
.glass-overlay {
  position: fixed;
  inset: 0;
  z-index: 100100;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.42);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.glass-modal {
  width: min(92vw, 860px);
  max-height: 82vh;
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.35);
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(24px) saturate(160%);
  -webkit-backdrop-filter: blur(24px) saturate(160%);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.16);
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 18px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  background: rgba(255, 255, 255, 0.56);
}

.modal-title {
  font-size: 16px;
  font-weight: 700;
  color: #1f2937;
  line-height: 1.3;
}

.modal-close {
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(0, 0, 0, 0.16);
  background: rgba(255, 255, 255, 0.9);
  color: #1f2937;
  border-radius: 50%;
  padding: 0;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 1);
  transform: translateY(-1px);
}

.modal-body {
  overflow: auto;
  padding: 14px 16px 16px;
}

.empty-state {
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4b5563;
}

.tone-section-list {
  display: grid;
  gap: 12px;
}

.tone-section {
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.78);
  overflow: hidden;
}

.tone-title {
  padding: 10px 12px;
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.12), rgba(37, 99, 235, 0.04));
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.detail-item {
  padding: 10px 12px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.detail-item:first-of-type {
  border-top: none;
}

.item-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.item-label {
  font-size: 13px;
  font-weight: 700;
  color: #111827;
}

.item-count {
  font-size: 12px;
  color: #4b5563;
  background: rgba(0, 0, 0, 0.06);
  border-radius: 999px;
  padding: 1px 8px;
}

.item-chars {
  font-size: 13px;
  line-height: 1.6;
  color: #1f2937;
  word-break: break-all;
}
</style>

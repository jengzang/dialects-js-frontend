<template>
  <Teleport to="body">
    <div
        v-if="visible"
        class="popup-vue popup-animated"
        :style="{ position: 'fixed', top: `${position.top}px`, left: `${position.left}px`, zIndex: 999999 }"
        @click.stop
    >
      <div class="popup-content">
        <p>📍 地點: {{ data.location }}</p>
        <p>🧩 特征: {{ checkedFeatures }}</p>
        <p>🔍 查詢: {{ data.feature }} + (單擊按鈕選擇)</p>

        <template v-for="field in unmatchedFields" :key="field">
          <button
              class="mini-button"
              style="font-size: 16px; margin: 0 2px;"
              @click="handleFieldClick(field)"
          >
            {{ field }}
          </button>
        </template>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue';
import { parseFeatureString } from '@/utils/ResultTable.js';
import { resultCache } from '@/utils/store.js'

const props = defineProps(['visible', 'data', 'position']);
const emit = defineEmits(['close', 'confirm']);

const checkedFeatures = computed(() => {
  const features = resultCache.features || [];
  return features.length > 0 ? features.join('·') : '（無）';
});

const unmatchedFields = computed(() => {
  return parseFeatureString(props.data.feature).unmatched_fields || [];
});

const handleFieldClick = (field) => {
  emit('confirm', { ...props.data, field });
  emit('close');
};

const handleGlobalClick = (e) => {
  if (props.visible && !e.target.closest('.popup-vue')) {
    emit('close');
  }
};
onMounted(() => document.addEventListener('click', handleGlobalClick));
onUnmounted(() => document.removeEventListener('click', handleGlobalClick));
</script>

<style scoped>
@import 'ResultTable.css';
</style>
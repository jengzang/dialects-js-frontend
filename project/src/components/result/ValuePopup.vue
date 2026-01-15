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

          <span>
             {{ modeLabels[0] }}: {{ getDisplayContent(modeLabels[0]) }}
          </span>
        <span>
             {{ modeLabels[1] }}: {{ getDisplayContent(modeLabels[1]) }}
          </span>
          <button
              class="mini-button"
              :style="shouldApplyFontSize(modeLabels[0]) ? { fontSize: '17px' } : {}"
              @click="handleAction(modeLabels[0],false)"
          >
            🔍{{ modeLabels[0] }}
          </button>


          <button
              class="mini-button"
              :style="shouldApplyFontSize(modeLabels[1]) ? { fontSize: '17px' } : {}"
              @click="handleAction(modeLabels[1],true)"
          >
            🔍{{ modeLabels[1] }}
          </button>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import {computed, onMounted, onUnmounted} from 'vue';
import {parseFeatureString} from '@/utils/ResultTable.js';

const props = defineProps(['visible', 'data', 'position']);
const emit = defineEmits(['close', 'confirm']);

// 讀取 features 並用 '·' 連接
const checkedFeatures = computed(() => {
  // 從 window 讀取，如果沒有則為空數組
  const features = window._resultPageCache?.features || [];

  // 因為存進去的就是純字符串數組 ['韻母']，直接 join 即可
  // 如果存的是對象，則需要 .map(x => x.value)
  return features.length > 0 ? features.join('·') : '（無）';
});

// 讀取 mode 並判斷顯示什麼本位
const modeLabels = computed(() => {
  // 從 window 讀取中文名，例如 '查中古'
  const mode = window._resultPageCache?.mode || '';

  // 根據中文名返回對應的 label
  if (mode === '查音位') return ['音本位', '字本位'];
  if (mode === '查中古') return ['字本位', '音本位'];

  // 默認返回
  return ['模式未知', '模式未知'];
});


// 5. 核心逻辑：getModeText (对应你原来的 getModeText 函数)
const getBaseModeText = (label, value) => {
  if (label === '字本位') return `中古地位輸入 ${value}`;
  if (label === '音本位') return `待查音節輸入 ${value}`;
  return `未知模式輸入 ${value}`;
};

// 6. 🌟 核心逻辑整合：完全复刻你 Template 里的那个长三元运算符
// 逻辑：shouldApply ? getModeText : ( fallback logic )
const getDisplayContent = (label) => {
  if (shouldApplyFontSize(label)) {
    return getBaseModeText(label, props.data.value);
  } else {
    if (label === '音本位') return '查詢所有音節分佈';
    if (label === '字本位') {
      const feature = window._resultPageCache?.features || [];
      // 定義映射關係
      const map = {
        '聲母': '聲母',
        '韻母': '韻攝',
        '聲調': '清濁'
      };
      // 取出對應文字，如果沒匹配到則顯示默認值
      const type = map[feature] || '聲母/韻攝/清濁';
      return `按 ${type} 整理所有音節`;
    }
    return '出問題了';
  }
};

const shouldApplyFontSize = (label) => {
  const parseResult = parseFeatureString(props.data.feature);
  const mode = window._resultPageCache?.mode || '';

  // 根據中文名返回對應的 label
  if (mode === '查音位') {
    return (label === '字本位' && parseResult?.matched_fields === null) ||
        (label === '音本位' && parseResult?.matched_fields !== null);
  }
  if (mode === '查中古') {
    return (label === '字本位' && parseResult?.matched_fields === null) ||
        (label === '音本位' && parseResult?.matched_fields !== null);
  }

};

const handleAction = (label,bool) => {
  emit('confirm', {...props.data, label,bool});
  emit('close');
};

// 点击外部关闭
const handleGlobalClick = (e) => {
  if (props.visible && !e.target.closest('.popup-vue')) {
    emit('close');
  }
};
onMounted(() => document.addEventListener('click', handleGlobalClick));
onUnmounted(() => document.removeEventListener('click', handleGlobalClick));
</script>

<style>
@import 'ResultTable.css';
</style>
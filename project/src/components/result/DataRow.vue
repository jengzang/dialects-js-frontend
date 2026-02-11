<template>
  <div class="data-row-vue">
    <p v-if="showLocation" class="locations-vue" @click="handleLocationClick" style="cursor: pointer;">
      {{ item.地點 }}
    </p>

    <div class="feature-row">
      <p>
        <span
            class="feature-value-clickable"
            style="cursor: pointer; color: #007bff"
            @click.stop="(e) => $emit('trigger-popup', 'feature', item, featureKey, featureVal, e)"
        >
          {{ featureKey }}
        </span>
        <span> ☞ </span>
        <span
            class="feature-value-clickable"
            style="cursor: pointer; color: #007bff"
            @click.stop="(e) => $emit('trigger-popup', 'value', item, featureKey, featureVal, e)"
        >
          {{ String(featureVal) }}
        </span>
      </p>
      <p>字數/佔比: {{ item.字數 }} ║ {{ (item.佔比 * 100).toFixed(1) }}%</p>
    </div>

    <p :class="isCondensed ? 'characters-vue-condensed' : 'characters-vue'">
      <template v-for="(charNode, cIndex) in parsedChars" :key="cIndex">
         <span
             v-if="charNode.type === 'span'"
             :class="charNode.props.class"
             :datatitle="charNode.props.datatitle"
             @mouseenter="handleMouseEnter($event, charNode)"
             @mouseleave="handleMouseLeave"
         >
          {{ charNode.children }}
        </span>
      </template>
    </p>

    <Teleport to="body">
      <div
          v-if="tooltip.visible"
          class="global-tooltip-popup"
          :style="{ top: tooltip.top + 'px', left: tooltip.left + 'px' }"
      >
        {{ tooltip.content }}
      </div>
    </Teleport>

    <LocationDetailPopup
        :visible="locationPopup.visible"
        :location-name="locationPopup.locationName"
        :data="locationPopup.data"
        :loading="locationPopup.loading"
        @close="locationPopup.visible = false"
    />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { getCorrespondingCharacters } from '@/utils/ResultTable.js';
import { sqlQuery } from '@/api/sql';
import LocationDetailPopup from './LocationDetailPopup.vue';

const props = defineProps({
  item: { type: Object, required: true },
  isCondensed: { type: Boolean, default: true },
  showLocation: { type: Boolean, default: false }
});

const emit = defineEmits(['trigger-popup']);

const featureKey = computed(() => Object.keys(props.item.分組值 || {})[0]);
const featureVal = computed(() => (props.item.分組值 || {})[featureKey.value]);

const parsedChars = computed(() => getCorrespondingCharacters(props.item));

// --- 新增：Tooltip 相關邏輯 ---
const tooltip = ref({
  visible: false,
  content: '',
  top: 0,
  left: 0
});

const handleMouseEnter = (e, charNode) => {
  // 只針對有 datatitle 的元素 (通常是 multi-vue 類) 觸發
  if (!charNode.props.datatitle) return;

  const target = e.target;
  const rect = target.getBoundingClientRect();

  tooltip.value = {
    visible: true,
    content: charNode.props.datatitle,
    // 計算位置：顯示在元素上方，水平居中
    top: rect.top - 10, // 向上偏移 10px
    left: rect.left + (rect.width / 2)
  };
};

const handleMouseLeave = () => {
  tooltip.value.visible = false;
};

// --- 地名點擊彈窗邏輯 ---
const locationPopup = ref({
  visible: false,
  locationName: '',
  data: null,
  loading: false
});

const handleLocationClick = async (e) => {
  const locationName = props.item.地點;
  if (!locationName) return;

  locationPopup.value.visible = true;
  locationPopup.value.locationName = locationName;
  locationPopup.value.loading = true;
  locationPopup.value.data = null;

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
        簡稱: [locationName]
      }
    };

    const response = await sqlQuery(payload)

    locationPopup.value.data = response;
  } catch (error) {
    console.error('查詢地名數據失敗:', error);
  } finally {
    locationPopup.value.loading = false;
  }
};
</script>

<style scoped>
@import 'ResultTable.css';

/* 這是傳送到 body 的彈窗樣式，不受小容器限制 */
.global-tooltip-popup {
  position: fixed; /* 關鍵：使用 fixed 定位 */
  z-index: 9999;   /* 確保在最上層 */
  transform: translate(-50%, -100%); /* 讓定位點在彈窗底部中央，實現向上彈出 */

  /* 以下複製你原本 CSS ::after 的樣式 */
  background-color: rgba(0, 0, 0, 0.8);
  color: #fff;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
  pointer-events: none; /* 讓滑鼠穿透，避免閃爍 */
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  max-width: 200px;
  /* 添加一個小動畫讓它更順滑 (可選) */
  animation: fadeIn 0.2s ease-out;

}

@keyframes fadeIn {
  from { opacity: 0; transform: translate(-50%, -90%); }
  to { opacity: 1; transform: translate(-50%, -100%); }
}
</style>

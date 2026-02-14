<template>
  <div class="Panel">
    <div
        id="resultPanelContent"
        class="panel-content"
        ref="scrollContainerRef"
        :style="{
          overflowY: 'auto',
          marginBottom: isCondensedMode ? '0' : '50px'
        }"
    >
      <div v-if="!hasData" class="empty-tip" style="padding: 20px; text-align: center; color: #666;">
        請先查詢
      </div>

      <div v-else class="result-panel-vue" :style="{ height: panelHeight }">
        <DataRow
            v-for="(item, index) in displayedData"
            :key="index"
            :item="item"
            :is-condensed="isCondensedMode"
            :show-location="shouldShowLocation(item, index)"
            @trigger-popup="onTriggerPopup"
        />
      </div>
    </div>

    <div id="stickyContextBar" class="sticky-label2" style="display: block;" v-if="hasData">
      <div class="sticky-bar-inner">
        <!-- Display mode -->
        <span
          v-if="!isEditingLocation"
          id="stickyContextText"
          @click="startEditingLocation"
          style="cursor: pointer;"
        >
          📍 {{ currentStickyLocation }}
        </span>

        <!-- Edit mode -->
        <input
          v-else
          ref="locationInputRef"
          v-model="editLocationInput"
          @blur="submitLocationEdit"
          @keyup.enter="submitLocationEdit"
          @keyup.esc="cancelLocationEdit"
          class="location-edit-input"
          placeholder="輸入地點名稱..."
        />

        <div class="stickybar-filter-wrapper" ref="filterWrapperRef">
          <div class="stickybar-filter-trigger" @click.stop="isFilterOpen = !isFilterOpen">
            {{ filterTriggerText }}
          </div>
          <div class="stickybar-filter-dropdown" :class="{ open: isFilterOpen }">
            <label
                v-for="stat in availableValueStats"
                :key="stat.value"
                class="stickybar-filter-option"
            >
              <input type="checkbox" :value="stat.value" v-model="selectedValues" />
              {{ stat.value }}
            </label>
          </div>
        </div>

        <div id="toggleColumnsBtn" @click="isCondensedMode = !isCondensedMode" class="custom-switch-container">
          <div class="custom-switch" :class="{ open: !isCondensedMode }">
            <div class="custom-slider"></div>
          </div>
          <span class="switch-text">{{ !isCondensedMode ? '全顯' : '主體' }}</span>
        </div>
      </div>
    </div>

    <ValuePopup
        :visible="showPopupValue"
        :data="popupDataValue"
        :position="popupPos"
        @close="showPopupValue = false"
        @confirm="handleValueConfirm"
    />

    <FeaturePopup
        :visible="showPopupFeature"
        :data="popupDataFeature"
        :position="popupPos"
        @close="showPopupFeature = false"
        @confirm="handleFeatureConfirm"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick, onUnmounted } from 'vue';
import DataRow from './DataRow.vue';
import { parseFeatureString,get_detail } from '@/utils/ResultTable.js';
import ValuePopup from "./ValuePopup.vue";
import FeaturePopup from "./FeaturePopup.vue";

const props = defineProps({
  data: { type: Array, default: () => [] },
  isCondensed: { type: Boolean, default: false }
});

// === 核心数据 (保持不变) ===
const tableData = ref([]);
const visibleRows = ref(30);
const scrollContainerRef = ref(null);
const isCondensedMode = ref(props.isCondensed);
const currentStickyLocation = ref('');
const isEditingLocation = ref(false);
const editLocationInput = ref('');
const locationInputRef = ref(null);
const isFilterOpen = ref(false);
const filterWrapperRef = ref(null);
const selectedValues = ref([]);
const panelHeight = ref('auto');

// === 🌟 修改点：弹窗状态拆分 ===
// 不再使用单一的 popupState，而是分开管理
const showPopupValue = ref(false);
const popupDataValue = ref({});
const showPopupFeature = ref(false);
const popupDataFeature = ref({});
const popupPos = ref({ top: 0, left: 0 });

const hasData = computed(() => tableData.value && tableData.value.length > 0);

// === 筛选与排序 (保持不变) ===
const availableValueStats = ref([]);
// ... (calculateStats, filteredData, sortedData, displayedData, filterTriggerText 等逻辑完全保留)
function calculateStats() {
  const totals = new Map();
  tableData.value.forEach(item => {
    const groupValues = item.分組值 || {};
    const val = Object.values(groupValues)[0];
    const share = Number(item.佔比) || 0;
    if (val) totals.set(val, (totals.get(val) || 0) + share);
  });
  availableValueStats.value = [...totals.entries()]
      .map(([value, totalShare]) => ({ value, totalShare }))
      .sort((a, b) => b.totalShare - a.totalShare);
}
const filteredData = computed(() => {
  const selected = selectedValues.value;
  return tableData.value.filter(item => {
    const groupValues = item.分組值 || {};
    const feature = Object.keys(groupValues)[0] || '';
    const value = groupValues[feature];

    if (selected.length > 0 && !selected.includes(value)) return false;
    if (!isCondensedMode.value) return true;

    const count = item.字數 || 0;
    const share = item.佔比 || 0;
    if (share < 0.05 || count === 1) return false;
    if (share > 0.10 || count >= 8) return true;
    else if ((share * count) < 0.4) return false;
    return true;
  });
});
const sortedData = computed(() => {
  return filteredData.value.sort((a, b) => {
    if (a.地點 !== b.地點) return a.地點.localeCompare(b.地點);
    return b.佔比 - a.佔比;
  });
});
const displayedData = computed(() => sortedData.value.slice(0, visibleRows.value));
const filterTriggerText = computed(() => {
  if (selectedValues.value.length === 0) return '🎯 篩選';
  const recent = selectedValues.value.slice(-3);
  return `🎯 已選：${recent.join('|')}${selectedValues.value.length > 3 ? '…' : ''}`;
});
const shouldShowLocation = (item, index) => {
  if (index === 0) return true;
  return item.地點 !== displayedData.value[index - 1].地點;
};

// === Watch Props (保持不变) ===
watch(() => props.data, (newVal) => {
  tableData.value = newVal || [];
  if (tableData.value.length > 0) calculateStats();
}, { immediate: true });

// === Scroll & Sticky Logic (保持不变) ===
const initScrollObserver = () => {
  // ... (保留原本的 initScrollObserver 代码，太长省略)
  const content = scrollContainerRef.value;
  if (!content) return;
  let lastScrollTop = 0;
  const visibleLocations = [];
  const handleScroll = (event) => {
    const el = event.target;
    const scrollDirection = el.scrollTop > lastScrollTop ? 'down' : 'up';
    lastScrollTop = el.scrollTop;
    if (Math.abs(el.scrollHeight - el.scrollTop - el.clientHeight) < 50 && visibleRows.value < sortedData.value.length) {
      visibleRows.value += 20;
    }
    const contentRect = content.getBoundingClientRect();
    const locations = [...content.querySelectorAll('.locations-vue')];
    let lastVisibleLocation = null;
    for (const loc of locations) {
      const rect = loc.getBoundingClientRect();
      if (rect.top >= contentRect.top && rect.top <= contentRect.bottom) {
        lastVisibleLocation = loc;
      }
    }
    if (lastVisibleLocation) {
      const locName = lastVisibleLocation.textContent.trim();
      currentStickyLocation.value = locName;
      if (!visibleLocations.some(l => l.name === locName)) {
        visibleLocations.push({ name: locName, scrollHeight: content.scrollTop });
      }
    } else if (scrollDirection === 'up') {
      for (let i = visibleLocations.length - 1; i >= 0; i--) {
        if (content.scrollTop > visibleLocations[i].scrollHeight - 50) {
          currentStickyLocation.value = visibleLocations[i].name;
          break;
        }
      }
    }
  };
  content.addEventListener('scroll', handleScroll);
};

// === 🌟 修改点：Event Handlers ===

const onTriggerPopup = (type, item, feature, value, e) => {
  // 1. 互斥逻辑：先关闭所有
  showPopupValue.value = false;
  showPopupFeature.value = false;

  // 2. 准备数据
  const dataObj = {
    location: item.地點,
    feature,
    value: String(value).replace(/·/g, '')
  };

  // 3. 计算位置
  const mouseX = e.clientX;
  const mouseY = e.clientY;
  const popupWidth = 250;
  const offset = 10;

  popupPos.value = {
    top: Math.max(mouseY - 100 - 5, 20),
    left: Math.min(Math.max(mouseX + popupWidth / 2 - offset, 20), window.innerWidth - 0.5 * popupWidth)
  };

  // 4. 根据类型激活对应状态
  if (type === 'value') {
    popupDataValue.value = dataObj;
    showPopupValue.value = true;
  } else {
    popupDataFeature.value = dataObj;
    showPopupFeature.value = true;
  }
};

// 处理 ValuePopup 的确认回调
const handleValueConfirm = ({ location, value, bool }) => {
  if (typeof get_detail === 'function') {
    // console.log(value)
    get_detail(location, value, bool, true);
  }
};

// 处理 FeaturePopup 的确认回调
const handleFeatureConfirm = ({ location, feature, field }) => {
  if (typeof get_detail === 'function') {
    const parseResult = parseFeatureString(feature);
    if (parseResult.matched_fields === null) {
      // 传递 group_inputs
      get_detail(location, feature, false, true, null, [field]);
    } else {
      const newFeature = `${feature.replace(/·/g, '')}-${field}`;
      get_detail(location, newFeature, false, true);
    }
  }
};

// Start editing location
const startEditingLocation = () => {
  isEditingLocation.value = true;
  editLocationInput.value = currentStickyLocation.value;
  nextTick(() => {
    locationInputRef.value?.focus();
    locationInputRef.value?.select();
  });
};

// Cancel editing
const cancelLocationEdit = () => {
  isEditingLocation.value = false;
  editLocationInput.value = '';
};

// Submit location edit
const submitLocationEdit = () => {
  const targetLocation = editLocationInput.value.trim();

  if (!targetLocation || targetLocation === currentStickyLocation.value) {
    // No change or empty input - just cancel
    cancelLocationEdit();
    return;
  }

  // Find matching location in data
  const matchingIndex = sortedData.value.findIndex(
    item => item.地點 === targetLocation
  );

  if (matchingIndex === -1) {
    // No match found - revert to original
    cancelLocationEdit();
    return;
  }

  // Match found - scroll to that location
  scrollToLocation(targetLocation, matchingIndex);
  cancelLocationEdit();
};

// Scroll to specific location
const scrollToLocation = (locationName, dataIndex) => {
  const content = scrollContainerRef.value;
  if (!content) return;

  // Find the location element in DOM
  const locationElements = [...content.querySelectorAll('.locations-vue')];
  const targetElement = locationElements.find(
    el => el.textContent.trim() === locationName
  );

  if (targetElement) {
    // Scroll to the element
    targetElement.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });

    // Update current location
    currentStickyLocation.value = locationName;
  }
};

const handleGlobalClickForFilter = (e) => {
  if (isFilterOpen.value && filterWrapperRef.value && !filterWrapperRef.value.contains(e.target)) {
    isFilterOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleGlobalClickForFilter);
  initScrollObserver();
  nextTick(() => {
    if(tableData.value.length > 0) panelHeight.value = `${tableData.value.length * 30}px`;
  });
});

onUnmounted(() => {
  document.removeEventListener('click', handleGlobalClickForFilter);
});
</script>

<style scoped>
@import 'ResultTable.css';
</style>
<template>
  <div class="universal-table glass-container">
    <div class="toolbar">
      <div class="search-wrapper">
        <span class="search-icon">🔍</span>
        <input
            v-model="searchText"
            @input="handleSearch"
            placeholder="搜索..."
            class="search-input"
        />
      </div>
      <div class="action-buttons">
        <button class="glass-btn" @click="exportToExcel">
          <span class="icon">📤</span> <span class="btn-text">Excel</span>
        </button>
        <button class="glass-btn primary" @click="openAddModal">
          <span class="icon">＋</span> <span class="btn-text">新增</span>
        </button>
      </div>
    </div>

    <div class="table-scroll-area">
      <div v-if="isLoading" class="loading-overlay">
        <div class="spinner"></div>
        <span>數據加載中...</span>
      </div>

      <div v-else-if="tableData.length === 0" class="empty-state">
        <span>📭 暫無數據</span>
      </div>
      <table>
        <colgroup>
          <col
              v-for="col in columns"
              :key="col.key"
              :style="{ width: ((Number(col.width) || 1) / totalRatio * 100) + '%' }"
          />
          <col style="width: 100px; min-width: 100px;" />
        </colgroup>

        <thead>
        <tr>
          <th v-for="(col, index) in columns" :key="col.key">
            <div class="header-content">
              <div
                  class="header-text-wrapper"
                  :class="{ 'clickable': col.filterable, 'filtering': filterState[col.key]?.length > 0 }"
                  @click.stop="col.filterable ? openFilter(col.key, $event) : null"
              >
                <span class="header-text">{{ col.label }}</span>
                <span v-if="col.filterable" class="filter-hint-icon">⑆</span>
              </div>

              <div class="sort-controls">
                <span @click.stop="toggleSort(col.key, false)" class="sort-arrow up" :class="{active: sortCol===col.key && !sortDesc}">▲</span>
                <span @click.stop="toggleSort(col.key, true)" class="sort-arrow down" :class="{active: sortCol===col.key && sortDesc}">▼</span>
              </div>
            </div>
          </th>
          <th class="action-th">操作</th>
        </tr>
        </thead>

        <tbody :class="{ 'blur-content': isLoading }">
        <tr v-for="row in tableData" :key="row.id">
          <td v-for="col in columns" :key="col.key">
            {{ row[col.key] }}
          </td>
          <td class="action-td">
            <button class="icon-action-btn edit" @click="handleEdit(row)">✎</button>
            <button class="icon-action-btn delete" @click="handleDelete(row)">✕</button>
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <div class="pagination">
      <button class="page-btn" @click="changePage(-1)" :disabled="currentPage === 1">←</button>
      <span class="page-info">{{ currentPage }} / {{ Math.ceil(total / TABLE_CONFIG.PAGE_SIZE) || 1 }}</span>
      <button class="page-btn" @click="changePage(1)">→</button>
    </div>

    <Teleport to="body">
      <transition name="fade-scale">
        <div v-if="activeFilterCol" class="teleport-overlay" @click="closeFilter">
          <div
              class="filter-popup glass-panel"
              :style="popupStyle"
              @click.stop
          >
            <div class="filter-header">
              <span>篩選: {{ currentFilterLabel }}</span>
              <button class="close-btn-mobile" @click="closeFilter">✕</button>
            </div>

            <div v-bind="containerProps" class="filter-list custom-scrollbar" style="max-height: 300px">

              <div v-bind="wrapperProps">

                <div v-if="popupLoading" class="loading-item">加载中...</div>

<!--                <label class="checkbox-item empty-option">-->
<!--                  <input type="checkbox" :value="null" v-model="filterState[activeFilterCol]">-->
<!--                  <span class="custom-checkbox"></span>-->
<!--                  <span class="label-text italic">(空值)</span>-->
<!--                </label>-->

                <label
                    v-for="item in list"
                    :key="item.index"
                    class="checkbox-item"
                    :style="{ height: '35px' }"
                >
                  <input type="checkbox" :value="item.data" v-model="filterState[activeFilterCol]">
                  <span class="custom-checkbox"></span>
                  <span class="label-text">{{ item.data }}</span>
                </label>

              </div>
            </div>

            <div class="filter-actions">
              <button class="text-btn toggle-select" @click="handleToggleSelect">
                {{ isSelectionEmpty ? '全选' : '反选' }}
              </button>
              <button class="text-btn cancel" @click="closeFilter">取消</button>
              <button class="text-btn confirm" @click="applyFilter">確認</button>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, onUnmounted } from 'vue';
import * as XLSX from 'xlsx';
import { api } from "@/utils/auth.js";
import { useVirtualList } from '@vueuse/core';
import { TABLE_CONFIG } from '@/utils/constants.js';
import { showSuccess, showWarning, showInfo, showConfirm } from '@/utils/message.js';

const props = defineProps({
  dbKey: { type: String, required: true },
  tableName: { type: String, required: true },
  columns: { type: Array, required: true },
});

// 狀態定義
const tableData = ref([]);
const total = ref(0);
const currentPage = ref(1);
const searchText = ref('');
const sortCol = ref(null);
const sortDesc = ref(false);

// 篩選相關狀態
const activeFilterCol = ref(null); // 當前激活的篩選列 Key
const distinctValues = reactive({}); // 緩存各列的篩選選項
const filterState = reactive({});    // 存儲選中的篩選值
const popupPos = reactive({ top: 0, left: 0 }); // 彈窗座標
const isLoading = ref(false);
// 計算總寬度比例
const totalRatio = computed(() => {
  return props.columns.reduce((sum, col) => sum + (Number(col.width) || 1), 0);
});

// 初始化篩選狀態
props.columns.forEach(col => {
  if (col.filterable) filterState[col.key] = [];
});

// 獲取數據
const fetchData = async () => {
  isLoading.value = true; // 開啟 loading
  const searchCols = props.columns.map(c => c.key);
  const payload = {
    db_key: props.dbKey,
    table_name: props.tableName,
    page: currentPage.value,
    page_size: TABLE_CONFIG.PAGE_SIZE,  // ✅ 使用 constants 配置
    sort_by: sortCol.value,
    sort_desc: sortDesc.value,
    filters: filterState,
    search_text: searchText.value,
    search_columns: searchCols
  };

  try {
    const response = await api('/sql/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    tableData.value = response.data;
    total.value = response.total;
  } catch (e) {
    console.error("Data Load Error:", e);
  }finally {
    isLoading.value = false; // 請求結束（無論成功失敗）都關閉
  }
};

// 排序切換
const toggleSort = (key, desc) => {
  sortCol.value = key;
  sortDesc.value = desc;
  fetchData();
};

// 計算當前篩選彈窗的標題
const currentFilterLabel = computed(() => {
  const col = props.columns.find(c => c.key === activeFilterCol.value);
  return col ? col.label : '';
});

const popupLoading = ref(false);
// 計算彈窗樣式 (PC端定位)
const popupStyle = computed(() => {
  // 移動端樣式由 CSS class 控制 (fixed center)，這裡返回空
  if (window.innerWidth <= 768) {
    return {};
  }
  // PC 端：使用計算出的絕對坐標
  return {
    position: 'absolute',
    top: `${popupPos.top}px`,
    left: `${popupPos.left}px`,
    // 防止彈窗超出屏幕右側
    transform: window.innerWidth - popupPos.left < 300 ? 'translateX(-100%)' : 'none'
  };
});

// 把当前要显示的列表数据变成一个 computed
const currentListSource = computed(() => {
  return distinctValues[activeFilterCol.value] || [];
});

// 使用 useVirtualList
const { list, containerProps, wrapperProps } = useVirtualList(
    currentListSource,
    {
      itemHeight: 35, // 预估每一行的高度(px)，根据你的 CSS 调整
      overscan: 10,   // 多渲染几个在视口外，防止滚动白屏
    }
);
// 打開篩選器
const openFilter = async (key, event) => {
  // 1. 如果點擊當前已打開的列，則關閉
  if (activeFilterCol.value === key) {
    closeFilter();
    return;
  }

  // 2. ✨ 計算位置核心邏輯
  if (event && event.currentTarget) {
    const rect = event.currentTarget.getBoundingClientRect();
    popupPos.top = rect.bottom + window.scrollY + 8;
    popupPos.left = rect.left + window.scrollX;
  }

  // 3. 設置當前激活列
  activeFilterCol.value = key;

  // 移動端打開時鎖定背景滾動
  if (window.innerWidth <= 768) {
    document.body.style.overflow = 'hidden';
  }

  // 4. 準備 Payload (核心修改部分)
  // -------------------------------------------------

  // A. 處理上下文篩選 (排除當前列自己)
  const contextFilters = { ...filterState };
  delete contextFilters[key];

  // B. 準備搜索相關參數 (新增!)
  const searchCols = props.columns.map(c => c.key);

  const payload = {
    db_key: props.dbKey,
    table_name: props.tableName,
    target_column: key,
    current_filters: contextFilters,
    // ✅ 新增：把全局搜索詞和搜索列發給後端
    search_text: searchText.value || "",
    search_columns: searchCols
  };
  // -------------------------------------------------

  // 5. 發送請求
  popupLoading.value = true;
  distinctValues[key] = []; // 先清空

  try {
    const res = await api('/sql/distinct-query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }, // 必须加这行！
      body: JSON.stringify(payload)
    });
    distinctValues[key] = res.values;
  } catch (e) {
    console.error("Filter Load Error:", e);
  } finally {
    popupLoading.value = false;
  }
};

// 確認篩選
const applyFilter = () => {
  closeFilter();
  currentPage.value = 1;
  fetchData();
};

// 關閉篩選
const closeFilter = () => {
  activeFilterCol.value = null;
  document.body.style.overflow = ''; // 恢復滾動
};

// 搜索
let timeout;
const handleSearch = () => {
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    currentPage.value = 1;
    fetchData();
  }, TABLE_CONFIG.SEARCH_DEBOUNCE); // ✅ 使用 constants 配置
};
// --- 新增逻辑：全选/反选 ---

// 1. 计算属性：判断当前列是否完全没选
const isSelectionEmpty = computed(() => {
  const current = filterState[activeFilterCol.value];
  return !current || current.length === 0;
});

// 2. 核心逻辑：全选/反选
const handleToggleSelect = () => {
  const key = activeFilterCol.value;
  const currentSelected = filterState[key] || [];
  const rawOptions = distinctValues[key] || [];

  // 构建页面上显示的所有选项集合
  // 逻辑：页面上有个硬编码的 (空值) 选项，加上接口返回的非 null 值
  const allPossibleOptions = [null, ...rawOptions.filter(v => v !== null)];

  if (currentSelected.length === 0) {
    // 【全选】：将所有可能的选项赋值给 filterState
    filterState[key] = [...allPossibleOptions];
  } else {
    // 【反选】：从全集中 剔除 已经在 currentSelected 里的项
    // 使用 filter 和 includes 实现差集
    filterState[key] = allPossibleOptions.filter(opt => !currentSelected.includes(opt));
  }
};
// 導出 Excel
const exportToExcel = () => {
  const ws = XLSX.utils.json_to_sheet(tableData.value);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  XLSX.writeFile(wb, `${props.tableName}_export.xlsx`);
};

// 翻頁
const changePage = (delta) => {
  currentPage.value += delta;
  fetchData();
};

// 操作按鈕 (Stub)
const handleDelete = async (row) => {
  // console.log(row)
  const confirmed = await showConfirm(`確定刪除 ${row.粤拼 || row.id}?`, {
    title: '刪除確認',
    confirmText: '刪除',
    cancelText: '取消'
  });
  if (!confirmed) return;
  // 這裡補全你的刪除邏輯
  showInfo(`模擬刪除: ${row.粤拼}`);
  // await api(...)
  // fetchData();
};

const openAddModal = () => showWarning("有待完善：新增模態框");
const handleEdit = (row) => showInfo(`編輯: ${row.粤拼 || row.id}`);

const handleGlobalClick = () => {
  if (activeFilterCol.value) {
    closeFilter();
  }
};

onMounted(() => {
  fetchData();
  // 添加全局監聽
  document.addEventListener('click', handleGlobalClick);
});

onUnmounted(() => {
  // 組件銷毀時移除監聽，防止內存洩漏
  document.removeEventListener('click', handleGlobalClick);
});
</script>



<style scoped>
/* ========================================
   UniversalTable 组件样式
   使用全局 CSS 变量和工具类
   ======================================== */

.glass-container {
  /* 使用全局变量替代局部变量 */
  background: var(--glass-light);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-radius: var(--radius-xl);
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow-md);
  padding: 24px;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  color: var(--text-primary);
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 85dvh;
  width: 100%;
  overflow: hidden;
}

/* Toolbar */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-light);
  gap: 12px;
  flex-wrap: wrap;
}

.search-wrapper {
  position: relative;
  width: 300px;
  min-width: 200px;
}

.search-input {
  width: 80%;
  padding: 10px 12px 10px 36px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-medium);
  background: var(--glass-medium);
  font-size: 14px;
  outline: none;
  transition: all 0.3s;
}

.search-input:focus {
  background: var(--bg-white);
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.glass-btn {
  padding: 8px 16px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-light);
  background: rgba(255, 255, 255, 0.8);
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
  max-width: 100px;
}

.glass-btn:hover {
  background: var(--bg-white);
  transform: translateY(-1px);
}

.glass-btn.primary {
  background: var(--color-primary);
  color: white;
}

/* Table Area */
.table-scroll-area {
  flex: 1;
  width: 100%;
  overflow-x: auto;
  overflow-y: auto;
  border-radius: var(--radius-md);
  background: var(--glass-light);
  min-height: 200px;
  -webkit-overflow-scrolling: touch;
}

table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  table-layout: fixed;
  min-width: 1000px;
}

thead {
  position: sticky;
  top: 0;
  z-index: 10;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

th, td {
  padding: 8px 12px;
  text-align: left;
  border-bottom: 1px solid var(--border-light);
  border-right: 1px solid var(--border-light);
}

th {
  font-size: 15px;
  color: var(--text-secondary);
  font-weight: 600;
  padding: 8px 3px !important;
}

td {
  padding: 8px 12px;
  text-align: left;
  border-bottom: 1px solid var(--border-light);
  font-size: 14px;
  white-space: normal;
  word-break: break-word;
  vertical-align: top;
  line-height: 1.5;
}

/* Header & Filter */
.header-content {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  position: relative;
  width: 100%;
  overflow: hidden;
}

.header-text-wrapper {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px;
  border-radius: var(--radius-sm);
  transition: background 0.2s;
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.header-text {
  white-space: nowrap;
}

.header-text-wrapper.clickable {
  cursor: pointer;
}

.header-text-wrapper.clickable:hover {
  background: var(--bg-hover);
}

.header-text-wrapper.filtering .header-text {
  color: var(--color-primary);
  font-weight: bold;
}

.filter-hint-icon {
  font-size: 10px;
  opacity: 0.5;
}

.sort-controls {
  display: flex;
  flex-direction: column;
  height: 16px;
  justify-content: center;
  opacity: 0.2;
  cursor: pointer;
  font-size: 9px;
}

.header-content:hover .sort-controls {
  opacity: 0.8;
  font-size: 12px;
}

.sort-arrow.active {
  color: var(--color-primary);
  opacity: 1;
}

/* Filter Popup */
.filter-popup {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 8px;
  z-index: 1000;
  min-width: 240px;
  max-width: 300px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  max-height: 400px;
}

.filter-popup.align-right {
  left: auto;
  right: 0;
}

.glass-panel {
  background: var(--glass-light);
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: var(--shadow-lg);
  border-radius: var(--radius-lg);
  max-height: 50dvh;
}

.filter-header {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  border-bottom: 1px solid var(--border-light);
  padding-bottom: 8px;
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
  flex-shrink: 0;
}

.close-btn-mobile {
  display: none;
}

.filter-list {
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-height: 0;
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 8px;
  border-top: 1px solid var(--border-light);
  flex-shrink: 0;
}

/* Checkbox Styling */
.checkbox-item {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 3px;
  border-radius: var(--radius-md);
  transition: background 0.2s;
}

.checkbox-item:hover {
  background: var(--bg-hover-light);
}

.checkbox-item input {
  display: none;
}

.custom-checkbox {
  width: 20px;
  height: 20px;
  border-radius: 5px;
  border: 2px solid var(--border-gray);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  background: white;
  flex-shrink: 0;
  position: relative;
}

.checkbox-item input:checked + .custom-checkbox {
  background: var(--color-primary);
  border-color: var(--color-primary);
}

.checkbox-item input:checked + .custom-checkbox::after {
  content: '✓';
  color: darkgreen;
  font-size: 14px;
  font-weight: bold;
  line-height: 1;
  display: block;
}

.text-btn {
  background: none;
  border: none;
  font-size: 13px;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: var(--radius-sm);
}

.toggle-select {
  color: var(--color-accent-purple);
  font-weight: bold;
}

.toggle-select:hover {
  background: var(--color-accent-purple-light);
}

.text-btn.confirm {
  background: var(--color-gradient);
  color: white;
}

.text-btn.cancel {
  color: var(--text-tertiary);
}

.text-btn.cancel:hover {
  background: var(--bg-hover);
}

/* Mobile Responsiveness */
@media (max-width: 768px) {
  .glass-container {
    padding: 16px;
    border-radius: 0;
    height: 85dvh;
    border: none;
  }

  th, td {
    padding: 4px 6px;
  }

  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .search-wrapper {
    width: 100%;
  }

  .action-buttons {
    justify-content: space-between;
  }

  .action-buttons .glass-btn {
    flex: 1;
    justify-content: center;
  }

  table {
    min-width: 800px;
  }

  .mobile-overlay {
    position: fixed;
    inset: 0;
    background: var(--bg-overlay);
    z-index: 999;
    backdrop-filter: blur(2px);
    -webkit-backdrop-filter: blur(2px);
  }

  .filter-popup,
  .filter-popup.align-right {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    max-width: 85dvw;
    max-height: 70vh;
    margin: 0;
    z-index: 1000;
  }

  .close-btn-mobile {
    display: block;
    background: none;
    border: none;
    font-size: 16px;
    color: #999;
    padding: 0 5px;
  }
}

/* Custom Scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: var(--border-medium);
  border-radius: 4px;
}

/* Action Buttons */
.action-td {
  display: flex;
  gap: 8px;
}

.icon-action-btn {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-full);
  border: none;
  background: var(--bg-hover-light);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.2s;
}

.icon-action-btn:hover {
  background: var(--color-primary);
  color: white;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  padding-top: 8px;
}

.page-btn {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  background: white;
  border: 1px solid var(--border-medium);
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  background: var(--color-primary-light);
  border-color: var(--color-primary);
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.label-text {
  font-size: 14px;
}

/* Loading States */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(3px);
  -webkit-backdrop-filter: blur(3px);
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: var(--text-muted);
  font-weight: bold;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--border-medium);
  border-left-color: var(--color-accent-purple);
  border-radius: var(--radius-full);
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.empty-state {
  padding: 40px;
  text-align: center;
  color: var(--text-muted);
  font-size: 16px;
}

.blur-content {
  opacity: 0.5;
}
</style>
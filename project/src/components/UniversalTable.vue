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

        <tbody>
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
      <span class="page-info">{{ currentPage }} / {{ Math.ceil(total / 50) || 1 }}</span>
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

            <div class="filter-list custom-scrollbar">
              <label class="checkbox-item empty-option">
                <input type="checkbox" :value="null" v-model="filterState[activeFilterCol]">
                <span class="custom-checkbox"></span>
                <span class="label-text italic">(空值)</span>
              </label>

              <label v-for="val in distinctValues[activeFilterCol] || []" :key="val" class="checkbox-item">
                <input type="checkbox" :value="val" v-model="filterState[activeFilterCol]">
                <span class="custom-checkbox"></span>
                <span class="label-text">{{ val }}</span>
              </label>
            </div>

            <div class="filter-actions">
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
import { ref, reactive, onMounted, computed } from 'vue';
import * as XLSX from 'xlsx';
import { api } from "@/utils/auth.js";

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
  const searchCols = props.columns.map(c => c.key);
  const payload = {
    db_key: props.dbKey,
    table_name: props.tableName,
    page: currentPage.value,
    page_size: 50,
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

// 打開篩選器
const openFilter = async (key, event) => {
  // 如果點擊當前已打開的列，則關閉
  if (activeFilterCol.value === key) {
    closeFilter();
    return;
  }

  // ✨ 計算位置核心邏輯
  if (event && event.currentTarget) {
    const rect = event.currentTarget.getBoundingClientRect();
    // 加上 scrollY 防止滾動後位置錯誤，+8 是為了留點間隙
    popupPos.top = rect.bottom + window.scrollY + 8;
    popupPos.left = rect.left + window.scrollX;
  }

  activeFilterCol.value = key;

  // 移動端打開時鎖定背景滾動
  if (window.innerWidth <= 768) {
    document.body.style.overflow = 'hidden';
  }

  // 如果該列的選項還沒加載過，去後端拉取
  if (!distinctValues[key]) {
    try {
      const res = await api(`/sql/distinct/${props.dbKey}/${props.tableName}/${key}`);
      distinctValues[key] = res.values;
    } catch (e) {
      console.error("Filter Load Error:", e);
    }
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
const handleSearch = () => {
  currentPage.value = 1;
  fetchData();
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
  if(!confirm(`確定刪除 ${row.粤拼 || row.id}?`)) return;
  // 這裡補全你的刪除邏輯
  alert(`模擬刪除: ${row.粤拼}`);
  // await api(...)
  // fetchData();
};

const openAddModal = () => alert("有待完善：新增模態框");
const handleEdit = (row) => alert(`編輯: ${row.粤拼 || row.id}`);

onMounted(() => {
  fetchData();
  // 不再需要全局 document click listener，因為使用了 overlay
});
</script>
<style scoped>
:root {
  --glass-bg: rgba(255, 255, 255, 0.65);
  --glass-border: rgba(255, 255, 255, 0.5);
  --primary-blue: #007aff;
  --text-main: #1d1d1f;
  --text-secondary: #86868b;
}

.glass-container {
  background: var(--glass-bg);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-radius: 20px;
  border: 1px solid var(--glass-border);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.07);
  padding: 24px;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  color: var(--text-main);
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
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
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
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 0.5);
  font-size: 14px;
  outline: none;
  transition: all 0.3s;
}

.search-input:focus {
  background: #fff;
  border-color: var(--primary-blue);
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.15);
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
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.05);
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
  background: #fff;
  transform: translateY(-1px);
}

.glass-btn.primary {
  background: #007aff;
  color: white;
}

/* Table Area */
.table-scroll-area {
  flex: 1;
  width: 100%;             /* 關鍵：限制寬度為父容器的 100% */
  overflow-x: auto;        /* 關鍵：強制開啟橫向滾動 */
  overflow-y: auto;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.3);

  /* iOS 滾動優化，讓滑動更順滑 */
  -webkit-overflow-scrolling: touch;
}

table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  table-layout: fixed; /* 保持列寬比例 */
  min-width: 1000px;
}

thead {
  position: sticky;
  top: 0;
  z-index: 10;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
}

th, td {
  padding:8px 12px;
  text-align: left;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  /* ✨ 新增：添加豎線 (右邊框) ✨ */
  border-right: 1px solid rgba(0, 0, 0, 0.05);
}

th {
  font-size: 15px;
  color: var(--text-secondary);
  font-weight: 600;
  padding: 8px 3px!important;
}

td {
  padding: 8px 12px;
  text-align: left;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);

  /* ✨ 核心修改：允許文字換行，不要隱藏 */
  font-size: 14px;
  white-space: normal;      /* 允許換行 */
  word-break: break-word;   /* 長單詞強制換行 */
  vertical-align: top;      /* 內容頂部對齊，多行時更好看 */
  line-height: 1.5;         /* 增加行高，多行閱讀更舒適 */
}

/* Header & Filter */
.header-content {
  display: flex;
  align-items: center;
  justify-content: flex-start; /* 修正為標準寫法 flex-start */
  position: relative;

  /* ✨ 新增：限制容器寬度並隱藏溢出 */
  width: 100%;
  overflow: hidden;
}

.header-text-wrapper {
  display: flex;
  align-items: center;
  gap: 4px; /* 建議加上 gap 讓文字和圖標有點間距 */
  padding: 4px;
  border-radius: 4px;
  transition: background 0.2s;

  /* ✨ 新增：防止超出容器的關鍵屬性 */
  flex: 1;              /* 佔據剩餘空間 */
  min-width: 0;         /* ⚠️ 關鍵：允許 Flex 子元素收縮，否則長文字會撐開容器 */
  overflow: hidden;     /* 隱藏內部超出的內容 */
}

/* 如果你希望文字太長時顯示省略號 (...)，請確保內部的 span 也有以下設置 */
.header-text {
  white-space: nowrap;      /* 不換行 */
}

.header-text-wrapper.clickable {
  cursor: pointer;
}

.header-text-wrapper.clickable:hover {
  background: rgba(0, 0, 0, 0.05);
}

.header-text-wrapper.filtering .header-text {
  color: var(--primary-blue);
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
  color: var(--primary-blue);
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
  /* ✨ 關鍵修復：確保 Flex 佈局讓列表滾動，按鈕固定 */
  display: flex;
  flex-direction: column;
  max-height: 400px; /* PC 端最大高度 */
}

.filter-popup.align-right {
  left: auto;
  right: 0;
}

.glass-panel {
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(25px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  border-radius: 16px;
  max-height: 50dvh;
}

.filter-header {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  padding-bottom: 8px;
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
  flex-shrink: 0;
}

.close-btn-mobile {
  display: none;
}

/* ✨ 關鍵修復：列表佔據剩餘空間並滾動 */
.filter-list {
  overflow-y: auto;
  flex: 1; /* 佔據剩餘空間 */
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-height: 0; /* 防止 Flex 子元素溢出 */
}

/* ✨ 關鍵修復：操作按鈕固定底部，不被壓縮 */
.filter-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  flex-shrink: 0; /* 禁止被壓縮 */
}

/* Checkbox Styling */
.checkbox-item {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 3px;
  border-radius: 8px;
  transition: background 0.2s;
}

.checkbox-item:hover {
  background: rgba(0, 0, 0, 0.03);
}

.checkbox-item input {
  display: none;
}

/* --- Checkbox 修改 (顯示 ✅ 圖樣) --- */
.custom-checkbox {
  width: 20px;
  height: 20px;
  border-radius: 5px;
  border: 2px solid #d1d1d6;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  background: white;
  flex-shrink: 0;

  /* 準備顯示偽元素 */
  position: relative;
}

/* 選中狀態：背景變藍，邊框變藍 */
.checkbox-item input:checked + .custom-checkbox {
  background: var(--primary-blue);
  border-color: var(--primary-blue);
}

/* ✨ 選中時顯示勾勾 (使用 CSS 繪製，比 SVG 更輕量且穩定) */
.checkbox-item input:checked + .custom-checkbox::after {
  content: '✓';          /* 顯示勾勾符號 */
  color: darkgreen;          /* 白色勾勾 */
  font-size: 14px;       /* 大小 */
  font-weight: bold;     /* 加粗 */
  line-height: 1;
  display: block;
}

.text-btn {
  background: none;
  border: none;
  font-size: 13px;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 6px;
}

.text-btn.confirm {
  background: var(--primary-blue);
  color: darkgreen;
}

.text-btn.cancel {
  color: var(--text-secondary);
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

  /* ✨ 移動端滾動優化：強制表格最小寬度，觸發橫向滾動 */
  table {
    min-width: 800px; /* 你可以根據列數調整這個值 */
  }

  /* 移動端彈窗 */
  .mobile-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.3);
    z-index: 999;
    backdrop-filter: blur(2px);
  }

  .filter-popup, .filter-popup.align-right {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 85vw;
    max-width: 350px;
    max-height: 70vh; /* 給鍵盤留點空間 */
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

/* 通用樣式 */
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

.action-td {
  display: flex;
  gap: 8px;
}

.icon-action-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.03);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.2s;
}

.icon-action-btn:hover {
  background: var(--primary-blue);
  background: #007aff;
  color: white;
}

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
  border-radius: 50%;
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.1);
  cursor: pointer;
}
</style>
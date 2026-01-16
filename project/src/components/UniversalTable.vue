<template>
  <div class="universal-table glass-container">
    <div class="toolbar">
      <div class="search-wrapper">
        <span class="search-icon">🔍</span>
        <input
            v-model="searchText"
            @input="handleSearch"
            placeholder="搜索全表内容..."
            class="search-input"
        />
      </div>
      <div class="action-buttons">
        <button class="glass-btn" @click="exportToExcel">
          <span class="icon">📤</span> 导出 Excel
        </button>
        <button class="glass-btn primary" @click="openAddModal">
          <span class="icon">＋</span> 新增数据
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
          <th v-for="col in columns" :key="col.key">
            <div class="header-content">
              <span class="header-text">{{ col.label }}</span>

              <div class="sort-controls">
                <span
                    @click="toggleSort(col.key, false)"
                    class="sort-arrow up"
                    :class="{active: sortCol===col.key && !sortDesc}"
                >▲</span>
                <span
                    @click="toggleSort(col.key, true)"
                    class="sort-arrow down"
                    :class="{active: sortCol===col.key && sortDesc}"
                >▼</span>
              </div>

              <div v-if="col.filterable" class="filter-trigger">
                <button class="filter-icon-btn" @click.stop="openFilter(col.key)" :class="{ active: activeFilterCol === col.key || filterState[col.key]?.length > 0 }">
                  ⑆
                </button>

                <transition name="fade-scale">
                  <div v-if="activeFilterCol === col.key" class="filter-popup glass-panel" @click.stop>
                    <div class="filter-header">筛选: {{ col.label }}</div>
                    <div class="filter-list custom-scrollbar">
                      <label class="checkbox-item empty-option">
                        <input type="checkbox" :value="null" v-model="filterState[col.key]">
                        <span class="checkmark"></span>
                        <span class="label-text italic">(空值 / Empty)</span>
                      </label>

                      <label v-for="val in distinctValues[col.key] || []" :key="val" class="checkbox-item">
                        <input type="checkbox" :value="val" v-model="filterState[col.key]">
                        <span class="checkmark"></span>
                        <span class="label-text">{{ val }}</span>
                      </label>
                    </div>
                    <div class="filter-actions">
                      <button class="text-btn cancel" @click="closeFilter">取消</button>
                      <button class="text-btn confirm" @click="applyFilter">应用</button>
                    </div>
                  </div>
                </transition>
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
            <button class="icon-action-btn edit" @click="handleEdit(row)" title="编辑">✎</button>
            <button class="icon-action-btn delete" @click="handleDelete(row)" title="删除">✕</button>
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <div class="pagination">
      <button class="page-btn" @click="changePage(-1)" :disabled="currentPage === 1">←</button>
      <span class="page-info">Page {{ currentPage }}</span>
      <button class="page-btn" @click="changePage(1)">→</button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted,computed } from 'vue';
import * as XLSX from 'xlsx';
import { api } from "@/utils/auth.js";

const props = defineProps({
  dbKey: { type: String, required: true },
  tableName: { type: String, required: true },
  columns: { type: Array, required: true },
});

const tableData = ref([]);
const total = ref(0);
const currentPage = ref(1);
const searchText = ref('');
const sortCol = ref(null);
const sortDesc = ref(false);

const activeFilterCol = ref(null);
const distinctValues = reactive({});
const filterState = reactive({});
const totalRatio = computed(() => {
  return props.columns.reduce((sum, col) => sum + (Number(col.width) || 1), 0);
});

// 初始化
props.columns.forEach(col => {
  if (col.filterable) filterState[col.key] = [];
});

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

const toggleSort = (key, desc) => {
  sortCol.value = key;
  sortDesc.value = desc;
  fetchData();
};

const openFilter = async (key) => {
  if (activeFilterCol.value === key) {
    activeFilterCol.value = null;
    return;
  }
  activeFilterCol.value = key;
  if (!distinctValues[key]) {
    try {
      const res = await api(`/sql/distinct/${props.dbKey}/${props.tableName}/${key}`);
      distinctValues[key] = res.values;
    } catch (e) {
      console.error("Filter Load Error:", e);
    }
  }
};

const applyFilter = () => {
  activeFilterCol.value = null;
  currentPage.value = 1;
  fetchData();
};

const closeFilter = () => activeFilterCol.value = null;

const handleSearch = () => {
  currentPage.value = 1;
  fetchData(); // 建议加上防抖 debounce
};

const exportToExcel = () => {
  const ws = XLSX.utils.json_to_sheet(tableData.value);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  XLSX.writeFile(wb, `${props.tableName}_export.xlsx`);
};

const changePage = (delta) => {
  currentPage.value += delta;
  fetchData();
};

const handleDelete = async (row) => {
  if(!confirm('确定删除?')) return;
  await api('/sql/mutate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      db_key: props.dbKey,
      table_name: props.tableName,
      action: 'delete',
      pk_value: row.id
    })
  });
  fetchData();
};

// 简单的 Placeholder 函数
const openAddModal = () => alert("打开新增模态框 (需自行实现)");
const handleEdit = (row) => alert(`编辑 ID: ${row.id} (需自行实现)`);

onMounted(fetchData);
</script>

<style scoped>
/* ✨ 核心变量：Apple 风格色板 */
:root {
  --glass-bg: rgba(255, 255, 255, 0.65);
  --glass-border: rgba(255, 255, 255, 0.5);
  --glass-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.07);
  --primary-blue: #007aff;
  --primary-hover: #0062cc;
  --text-main: #1d1d1f;
  --text-secondary: #86868b;
  --danger: #ff3b30;
}

/* 容器：液態玻璃背景 */
.glass-container {
  background: var(--glass-bg);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-radius: 20px;
  border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow);
  padding: 24px;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  color: var(--text-main);
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%; /* 适应父容器 */
  overflow: hidden;
}

/* 顶部工具栏 */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.search-wrapper {
  position: relative;
  width: 300px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
  font-size: 14px;
}

.search-input {
  width: 100%;
  padding: 10px 12px 10px 36px;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 0.5);
  font-size: 14px;
  transition: all 0.3s ease;
  outline: none;
}

.search-input:focus {
  background: #fff;
  box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.15);
  border-color: var(--primary-blue);
}

.action-buttons {
  display: flex;
  gap: 12px;
}

/* 玻璃按钮 */
.glass-btn {
  padding: 8px 16px;
  border-radius: 12px;
  border: 1px solid rgba(0,0,0,0.05);
  background: rgba(255,255,255,0.8);
  color: var(--text-main);
  font-weight: 500;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}

.glass-btn:hover {
  transform: translateY(-1px);
  background: #fff;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.glass-btn.primary {
  background: var(--primary-blue);
  color: white;
  border: none;
}

.glass-btn.primary:hover {
  background: var(--primary-hover);
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
}

/* 表格滚动区域 */
.table-scroll-area {
  flex: 1;
  overflow: auto;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.3);
  min-height: 60dvh;
}

table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  table-layout: fixed; /* ✨ 建议加上这行，让比例系数严格生效 */
}

thead {
  position: sticky;
  top: 0;
  z-index: 10;
  background: rgba(255, 255, 255, 0.85); /* 略微不透明以遮挡滚动内容 */
  backdrop-filter: blur(10px);
}

th {
  text-align: left;
  padding: 12px 16px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid rgba(0,0,0,0.05);
}

td {
  padding: 14px 16px;
  font-size: 14px;
  border-bottom: 1px solid rgba(0,0,0,0.03);
  color: var(--text-main);
  transition: background 0.2s;
}

tr:hover td {
  background: rgba(0, 122, 255, 0.03);
}

/* 表头内容布局 */
.header-content {
  display: flex;
  align-items: center;
  gap: 5px;
  position: relative;
}

.sort-controls {
  display: flex;
  flex-direction: column;
  height: 16px;
  justify-content: center;
  opacity: 0.3;
  transition: opacity 0.2s;
}

.header-content:hover .sort-controls {
  opacity: 1;
}

.sort-arrow {
  font-size: 8px;
  line-height: 8px;
  cursor: pointer;
  user-select: none;
}
.sort-arrow.active { color: var(--primary-blue); opacity: 1; }

/* 筛选按钮 */
.filter-icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  color: var(--text-secondary);
  padding: 2px;
  border-radius: 4px;
  transition: all 0.2s;
  opacity: 0.5;
}

.filter-icon-btn:hover, .filter-icon-btn.active {
  color: var(--primary-blue);
  background: rgba(0, 122, 255, 0.1);
  opacity: 1;
}

/* ✨ 筛选弹窗 (玻璃拟态加强版) */
.glass-panel {
  background: rgba(255, 255, 255, 0.95); /* 更不透明以保证可读性 */
  backdrop-filter: blur(25px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  border-radius: 12px;
}

.filter-popup {
  position: absolute;
  top: 120%;
  left: 0;
  z-index: 100;
  min-width: 220px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-header {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  padding-bottom: 6px;
  border-bottom: 1px solid rgba(0,0,0,0.05);
}

.filter-list {
  max-height: 200px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* 自定义复选框样式 */
.checkbox-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 6px 8px;
  border-radius: 6px;
  transition: background 0.2s;
}

.checkbox-item:hover {
  background: rgba(0, 0, 0, 0.03);
}

.checkbox-item input {
  display: none; /* 隐藏原生 checkbox */
}

.checkmark {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border: 1.5px solid #d1d1d6;
  position: relative;
  transition: all 0.2s;
}

.checkbox-item input:checked + .checkmark {
  background: var(--primary-blue);
  border-color: var(--primary-blue);
}

.checkbox-item input:checked + .checkmark::after {
  content: '';
  position: absolute;
  left: 5px;
  top: 2px;
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.label-text {
  font-size: 13px;
  color: var(--text-main);
}
.italic { font-style: italic; color: #999; }

.filter-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid rgba(0,0,0,0.05);
}

.text-btn {
  background: none;
  border: none;
  font-size: 12px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
}

.text-btn.confirm { color: var(--primary-blue); font-weight: 600; }
.text-btn.confirm:hover { background: rgba(0, 122, 255, 0.1); }
.text-btn.cancel { color: var(--text-secondary); }
.text-btn.cancel:hover { background: rgba(0, 0, 0, 0.05); }

/* 操作列按钮 */
.action-td { display: flex; gap: 8px; }

.icon-action-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: rgba(0,0,0,0.03);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  font-size: 14px;
}

.icon-action-btn.edit:hover { background: var(--primary-blue); color: white; }
.icon-action-btn.delete:hover { background: var(--danger); color: white; }

/* 底部栏 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  padding-top: 8px;
}

.page-btn {
  background: rgba(255,255,255,0.8);
  border: 1px solid rgba(0,0,0,0.1);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  background: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.page-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.page-info {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
}

/* 动画 */
.fade-scale-enter-active, .fade-scale-leave-active {
  transition: all 0.2s cubic-bezier(0.165, 0.84, 0.44, 1);
}
.fade-scale-enter-from, .fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-5px);
}

/* 滚动条美化 */
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.2); }
</style>
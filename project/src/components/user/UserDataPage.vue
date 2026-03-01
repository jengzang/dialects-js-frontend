<template>
  <div style="width: 100%">
    <!-- Header with title and stats -->
    <div class="page-header">
      <div class="header-left">
        <button @click="goBack" class="btn-back">返回</button>
        <h2>📊 個人數據管理 <span v-if="username" class="username-badge">{{ username }}</span></h2>
      </div>
      <div class="stats">
        <span>總計: {{ totalCount }} 條</span>
        <span>已選: {{ selectedRecords.length }} 條</span>
      </div>
    </div>

    <!-- Toolbar with batch operations -->
    <div class="toolbar">
      <div class="toolbar-left">
        <button @click="openBatchCreateModal" class="btn-primary">
          ➕ 批量添加
        </button>
        <button
          @click="handleBatchEdit"
          :disabled="selectedRecords.length === 0"
          class="btn-warning"
        >
          ✏️ 批量編輯
        </button>
        <button
          @click="handleBatchDelete"
          :disabled="selectedRecords.length === 0"
          class="btn-danger"
        >
          🗑️ 批量刪除
        </button>
        <button @click="fetchData" class="btn-secondary">
          🔄 刷新
        </button>
      </div>
      <div class="toolbar-right">
        <input
          v-model="searchQuery"
          @input="handleSearch"
          placeholder="🔍 搜索（簡稱、分區、特徵、值...）"
          class="search-input"
        />
      </div>
    </div>

    <!-- Data table -->
    <div class="table-container">
      <!-- Loading overlay -->
      <div v-if="loading" class="loading-overlay">
        <div class="loading-spinner">
          <div class="spinner-ring"></div>
          <div class="loading-text">加載中...</div>
        </div>
      </div>

      <table class="data-table">
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                @change="toggleSelectAll"
                :checked="isAllSelected"
              />
            </th>
            <th>簡稱</th>
            <th>分區</th>
            <th>經緯度</th>
            <th>聲韻調</th>
            <th>特徵</th>
            <th>值</th>
            <th>說明</th>
            <th>創建時間</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="paginatedData.length === 0">
            <td colspan="10" style="text-align: center; padding: 40px; color: #999;">
              {{ searchQuery ? '沒有找到匹配的記錄' : '暫無數據' }}
            </td>
          </tr>
          <tr v-for="record in paginatedData" :key="record.created_at">
            <td>
              <input
                type="checkbox"
                :value="record.created_at"
                v-model="selectedRecords"
              />
            </td>
            <td>{{ record.簡稱 }}</td>
            <td>{{ record.音典分區 }}</td>
            <td>{{ record.經緯度 }}</td>
            <td>{{ record.聲韻調 || '-' }}</td>
            <td>{{ record.特徵 }}</td>
            <td>{{ record.值 }}</td>
            <td>{{ record.說明 || '-' }}</td>
            <td>{{ formatDate(record.created_at) }}</td>
            <td>
              <button @click="openEditModal(record)" class="btn-edit">
                編輯
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="pagination" v-if="filteredData.length > 0">
      <div class="pagination-info">
        顯示 {{ startIndex + 1 }}-{{ endIndex }} 條，共 {{ filteredData.length }} 條
      </div>
      <div class="pagination-controls">
        <button @click="goToPage(1)" :disabled="currentPage === 1" class="btn-page">
          首頁
        </button>
        <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 1" class="btn-page">
          上一頁
        </button>
        <div class="page-numbers">
          <button
            v-for="page in visiblePages"
            :key="page"
            @click="goToPage(page)"
            :class="['btn-page', { active: page === currentPage }]"
          >
            {{ page }}
          </button>
        </div>
        <button @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages" class="btn-page">
          下一頁
        </button>
        <button @click="goToPage(totalPages)" :disabled="currentPage === totalPages" class="btn-page">
          末頁
        </button>
      </div>
      <div class="pagination-size">
        <label>每頁顯示：</label>
        <SimpleSelectDropdown
          v-model.number="pageSize"
          :options="pageSizeOptions"
          @update:modelValue="handlePageSizeChange"
        />
      </div>
    </div>

    <!-- Batch Edit Modal -->
    <Teleport to="body">
      <div v-if="showBatchEditModal" class="modal-overlay" @click.self="closeBatchEditModal">
        <div class="modal-content modal-large">
          <div class="modal-header">
            <h3>批量編輯數據 ({{ batchEditRows.length }} 條)</h3>
            <button @click="closeBatchEditModal" class="modal-close">×</button>
          </div>
          <div class="modal-body">
            <p class="hint">💡 提示：修改後將先刪除原記錄，再添加修改後的記錄</p>
            <div class="batch-table-wrapper">
              <table class="batch-table">
                <thead>
                  <tr>
                    <th style="width: 50px">#</th>
                    <th style="width: 100px">簡稱 *</th>
                    <th style="width: 120px">分區 *</th>
                    <th style="width: 120px">經緯度 *</th>
                    <th style="width: 100px">聲韻調</th>
                    <th style="width: 120px">特徵 *</th>
                    <th style="width: 100px">值 *</th>
                    <th style="width: 150px">說明</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, index) in batchEditRows" :key="index">
                    <td>{{ index + 1 }}</td>
                    <td><input v-model="row.簡稱" placeholder="簡稱" /></td>
                    <td><input v-model="row.音典分區" placeholder="分區(集合)" /></td>
                    <td><input v-model="row.經緯度" placeholder="23.13,113.26" /></td>
                    <td><input v-model="row.聲韻調" placeholder="聲母/韻母/聲調" /></td>
                    <td><input v-model="row.特徵" placeholder="山摄" /></td>
                    <td><input v-model="row.值" placeholder="an" /></td>
                    <td><input v-model="row.說明" placeholder="說明" /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="modal-footer">
            <button @click="submitBatchEdit" class="btn-primary" :disabled="validBatchEditRows.length === 0">
              保存修改 ({{ validBatchEditRows.length }} 條有效)
            </button>
            <button @click="closeBatchEditModal" class="btn-secondary">
              取消
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Batch Create Modal -->
    <Teleport to="body">
      <div v-if="showBatchCreateModal" class="modal-overlay" @click.self="closeBatchCreateModal">
        <div class="modal-content modal-large">
          <div class="modal-header">
            <h3>批量添加數據</h3>
            <button @click="closeBatchCreateModal" class="modal-close">×</button>
          </div>
          <div class="modal-body">
            <p class="hint">💡 提示：可以直接從Excel複製粘貼（單次最多50條）</p>
            <div class="batch-table-controls">
              <button @click="addBatchRow" class="btn-add-row">➕ 添加行</button>
              <button @click="clearBatchRows" class="btn-clear">🗑️ 清空</button>
              <span class="row-count">當前：{{ batchRows.length }} 條</span>
            </div>
            <div class="batch-table-wrapper" @paste="handlePaste">
              <table class="batch-table">
                <thead>
                  <tr>
                    <th style="width: 50px">#</th>
                    <th style="width: 100px">簡稱 *</th>
                    <th style="width: 120px">分區 *</th>
                    <th style="width: 120px">經緯度 *</th>
                    <th style="width: 100px">聲韻調</th>
                    <th style="width: 120px">特徵 *</th>
                    <th style="width: 100px">值 *</th>
                    <th style="width: 150px">說明</th>
                    <th style="width: 60px">操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, index) in batchRows" :key="index">
                    <td>{{ index + 1 }}</td>
                    <td><input v-model="row.簡稱" placeholder="簡稱" /></td>
                    <td><input v-model="row.音典分區" placeholder="分區(集合)" /></td>
                    <td><input v-model="row.經緯度" placeholder="23.13,113.26" /></td>
                    <td><input v-model="row.聲韻調" placeholder="聲母/韻母/聲調" /></td>
                    <td><input v-model="row.特徵" placeholder="山摄" /></td>
                    <td><input v-model="row.值" placeholder="an" /></td>
                    <td><input v-model="row.說明" placeholder="說明" /></td>
                    <td>
                      <button @click="removeBatchRow(index)" class="btn-remove">×</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="modal-footer">
            <button @click="submitBatchCreate" class="btn-primary" :disabled="validBatchRows.length === 0">
              提交 ({{ validBatchRows.length }} 條有效)
            </button>
            <button @click="closeBatchCreateModal" class="btn-secondary">
              取消
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Single Edit Modal -->
    <Teleport to="body">
      <div v-if="showEditModal" class="modal-overlay" @click.self="closeEditModal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>編輯記錄</h3>
            <button @click="closeEditModal" class="modal-close">×</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>簡稱 *</label>
              <input v-model="editingRecord.簡稱" />
            </div>
            <div class="form-group">
              <label>分區 *</label>
              <input v-model="editingRecord.音典分區" />
            </div>
            <div class="form-group">
              <label>經緯度 *</label>
              <input v-model="editingRecord.經緯度" placeholder="23.13,113.26" />
            </div>
            <div class="form-group">
              <label>聲韻調</label>
              <input v-model="editingRecord.聲韻調" />
            </div>
            <div class="form-group">
              <label>特徵 *</label>
              <input v-model="editingRecord.特徵" />
            </div>
            <div class="form-group">
              <label>值 *</label>
              <input v-model="editingRecord.值" />
            </div>
            <div class="form-group">
              <label>說明</label>
              <textarea v-model="editingRecord.說明" rows="3"></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button @click="submitEdit" class="btn-primary">
              保存
            </button>
            <button @click="closeEditModal" class="btn-secondary">
              取消
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  getAllCustomData,
  editCustomData,
  batchCreateCustomData,
  batchDeleteCustomData
} from '@/api/user/index.js'
import { showSuccess, showError, showWarning, showConfirm } from '@/utils/message.js'
import { userStore } from '@/utils/store.js'
import SimpleSelectDropdown from '@/components/common/SimpleSelectDropdown.vue'

const router = useRouter()
const route = useRoute()

// Get username from route query
const username = computed(() => route.query.username || userStore.username)

// State
const dataList = ref([])
const totalCount = ref(0)
const selectedRecords = ref([])
const showBatchCreateModal = ref(false)
const showBatchEditModal = ref(false)
const showEditModal = ref(false)
const batchCreateText = ref('')
const batchRows = ref([])
const batchEditRows = ref([])
const editingRecord = ref({})
const loading = ref(false)

// Search and pagination
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(20)

// Page size options
const pageSizeOptions = [
  { label: '10 條', value: 10 },
  { label: '20 條', value: 20 },
  { label: '50 條', value: 50 },
  { label: '100 條', value: 100 }
]

// Computed
const isAllSelected = computed(() => {
  return paginatedData.value.length > 0 &&
         selectedRecords.value.length === paginatedData.value.length
})

// Filtered data based on search query
const filteredData = computed(() => {
  if (!searchQuery.value.trim()) {
    return dataList.value
  }

  const query = searchQuery.value.toLowerCase()
  return dataList.value.filter(record => {
    return (
      record.簡稱?.toLowerCase().includes(query) ||
      record.音典分區?.toLowerCase().includes(query) ||
      record.經緯度?.toLowerCase().includes(query) ||
      record.聲韻調?.toLowerCase().includes(query) ||
      record.特徵?.toLowerCase().includes(query) ||
      record.值?.toLowerCase().includes(query) ||
      record.說明?.toLowerCase().includes(query)
    )
  })
})

// Pagination
const totalPages = computed(() => {
  return Math.ceil(filteredData.value.length / pageSize.value)
})

const startIndex = computed(() => {
  return (currentPage.value - 1) * pageSize.value
})

const endIndex = computed(() => {
  return Math.min(startIndex.value + pageSize.value, filteredData.value.length)
})

const paginatedData = computed(() => {
  return filteredData.value.slice(startIndex.value, endIndex.value)
})

// Visible page numbers (show max 5 pages)
const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages.value, start + maxVisible - 1)

  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1)
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return pages
})

const parsedBatchData = computed(() => {
  if (!batchCreateText.value.trim()) return []

  const lines = batchCreateText.value.trim().split('\n')
  return lines.map(line => {
    const parts = line.split('\t')
    return {
      簡稱: parts[0]?.trim() || '',
      音典分區: parts[1]?.trim() || '',
      經緯度: parts[2]?.trim() || '',
      聲韻調: parts[3]?.trim() || '',
      特徵: parts[4]?.trim() || '',
      值: parts[5]?.trim() || '',
      說明: parts[6]?.trim() || '',
      username: userStore.username
    }
  }).filter(item => item.簡稱 && item.音典分區 && item.經緯度 && item.特徵 && item.值)
})

const validBatchRows = computed(() => {
  return batchRows.value.filter(row =>
    row.簡稱 && row.音典分區 && row.經緯度 && row.特徵 && row.值
  )
})

const validBatchEditRows = computed(() => {
  return batchEditRows.value.filter(row =>
    row.簡稱 && row.音典分區 && row.經緯度 && row.特徵 && row.值
  )
})

// Methods
const fetchData = async () => {
  loading.value = true
  try {
    const response = await getAllCustomData()

    // 確保數據存在，否則給予空數組
    dataList.value = response.data || []
    totalCount.value = response.total || 0

    // 💡 優化：只有在真的有數據時才提示成功，沒數據時保持靜默（由 UI 顯示“暫無數據”）
    if (dataList.value.length > 0) {
      showSuccess('數據加載成功')
    }
    else{
      showWarning('當前用戶暫無數據，請先添加')
    }
  } catch (error) {
    // 發生錯誤時，清空列表以觸發 UI 的空狀態顯示
    dataList.value = []
    totalCount.value = 0
    showError('加載失敗：' + error.message)

    // 如果是 401/403 等權限問題，自動跳回登錄頁
    if (error.message.includes('401') || error.message.includes('登錄')) {
      setTimeout(() => router.replace('/auth'), 1500)
    }
  } finally {
    loading.value = false
  }
}

const toggleSelectAll = (event) => {
  if (event.target.checked) {
    selectedRecords.value = paginatedData.value.map(r => r.created_at)
  } else {
    selectedRecords.value = []
  }
}

const handleSearch = () => {
  currentPage.value = 1 // Reset to first page when searching
}

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const handlePageSizeChange = () => {
  currentPage.value = 1 // Reset to first page when changing page size
}

const openEditModal = (record) => {
  editingRecord.value = { ...record }
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  editingRecord.value = {}
}

const submitEdit = async () => {
  try {
    await editCustomData(editingRecord.value)
    showSuccess('更新成功')
    closeEditModal()
    await fetchData()
  } catch (error) {
    showError('更新失敗：' + error.message)
  }
}

const openBatchCreateModal = () => {
  showBatchCreateModal.value = true
  // 添加一個默認行，讓用戶知道可以在哪裡粘貼數據
  if (batchRows.value.length === 0) {
    addBatchRow()
  }
}

const closeBatchCreateModal = () => {
  showBatchCreateModal.value = false
  batchCreateText.value = ''
  batchRows.value = []
}

const addBatchRow = () => {
  batchRows.value.push({
    簡稱: '',
    音典分區: '',
    經緯度: '',
    聲韻調: '',
    特徵: '',
    值: '',
    說明: ''
  })
}

const removeBatchRow = (index) => {
  batchRows.value.splice(index, 1)
}

const clearBatchRows = () => {
  if (batchRows.value.length > 0) {
    if (confirm('確定要清空所有行嗎？')) {
      batchRows.value = []
    }
  }
}

const handlePaste = (event) => {
  const clipboardData = event.clipboardData || window.clipboardData
  const pastedText = clipboardData.getData('text')

  if (!pastedText) return

  // 解析粘貼的數據
  const lines = pastedText.trim().split('\n')
  const newRows = lines.map(line => {
    const parts = line.split('\t')
    return {
      簡稱: parts[0]?.trim() || '',
      音典分區: parts[1]?.trim() || '',
      經緯度: parts[2]?.trim() || '',
      聲韻調: parts[3]?.trim() || '',
      特徵: parts[4]?.trim() || '',
      值: parts[5]?.trim() || '',
      說明: parts[6]?.trim() || ''
    }
  })

  // 如果當前表格為空，直接添加
  if (batchRows.value.length === 0) {
    batchRows.value = newRows
  } else {
    // 否則追加到末尾
    batchRows.value.push(...newRows)
  }

  event.preventDefault()
  showSuccess(`已粘貼 ${newRows.length} 行數據`)
}

const submitBatchCreate = async () => {
  const data = validBatchRows.value.map(row => ({
    ...row,
    username: userStore.username
  }))

  if (data.length === 0) {
    showWarning('請輸入有效數據（必填項：簡稱、分區、經緯度、特徵、值）')
    return
  }

  if (data.length > 50) {
    showWarning('單次最多提交 50 條數據')
    return
  }

  try {
    const response = await batchCreateCustomData(data)
    showSuccess(response.message || `批量創建成功：${data.length} 條`)
    closeBatchCreateModal()
    await fetchData()
  } catch (error) {
    showError('批量創建失敗：' + error.message)
  }
}

const handleBatchEdit = () => {
  if (selectedRecords.value.length === 0) {
    showWarning('請先選擇要編輯的記錄')
    return
  }

  // 找到选中的记录
  const selectedData = dataList.value.filter(record =>
    selectedRecords.value.includes(record.created_at)
  )

  // 复制到编辑表格中
  batchEditRows.value = selectedData.map(record => ({
    簡稱: record.簡稱,
    音典分區: record.音典分區,
    經緯度: record.經緯度,
    聲韻調: record.聲韻調 || '',
    特徵: record.特徵,
    值: record.值,
    說明: record.說明 || '',
    created_at: record.created_at // 保存原始 created_at 用于删除
  }))

  showBatchEditModal.value = true
}

const closeBatchEditModal = () => {
  showBatchEditModal.value = false
  batchEditRows.value = []
}

const submitBatchEdit = async () => {
  const validRows = validBatchEditRows.value

  if (validRows.length === 0) {
    showWarning('請輸入有效數據（必填項：簡稱、分區、經緯度、特徵、值）')
    return
  }

  const confirmed = await showConfirm(`確定要修改 ${validRows.length} 條記錄嗎？（將先刪除原記錄，再添加修改後的記錄）`)
  if (!confirmed) return

  try {
    // 第一步：删除原记录
    const deleteIds = batchEditRows.value.map(row => row.created_at)
    await batchDeleteCustomData(deleteIds)

    // 第二步：添加修改后的记录
    const newData = validRows.map(row => ({
      簡稱: row.簡稱,
      音典分區: row.音典分區,
      經緯度: row.經緯度,
      聲韻調: row.聲韻調,
      特徵: row.特徵,
      值: row.值,
      說明: row.說明,
      username: userStore.username
    }))

    // ✅ 使用已导入的 batchCreateCustomData 函数
    await batchCreateCustomData(newData)

    showSuccess(`批量編輯成功：${validRows.length} 條`)
    closeBatchEditModal()
    selectedRecords.value = []
    await fetchData()
  } catch (error) {
    showError('批量編輯失敗：' + error.message)
  }
}

const handleBatchDelete = async () => {
  if (selectedRecords.value.length === 0) {
    showWarning('請先選擇要刪除的記錄')
    return
  }

  const confirmed = await showConfirm(`確定要刪除 ${selectedRecords.value.length} 條記錄嗎？`)
  if (!confirmed) return

  try {
    const response = await batchDeleteCustomData(selectedRecords.value)
    showSuccess(response.message || '刪除成功')
    selectedRecords.value = []
    await fetchData()
  } catch (error) {
    showError('刪除失敗：' + error.message)
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN')
}

const goBack = () => {
  router.push('/auth')
}

onMounted(() => {
  if (!userStore.isAuthenticated) {
    showWarning('請先登錄')
    router.push('/auth')
    return
  }
  fetchData()
})
</script>

<style scoped>
/* Apple liquid glass styling */


.page-header {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 18px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.btn-back {
  padding: 8px 16px;
  background: rgba(142, 142, 147, 0.2);
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-back:hover {
  background: rgba(142, 142, 147, 0.3);
  transform: translateX(-2px);
}

.page-header h2 {
  margin: 0;
  font-size: 28px;
  color: #333;
  display: flex;
  align-items: center;
  gap: 12px;
  justify-self: center;
}

.username-badge {
  font-size: 16px;
  padding: 4px 12px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border-radius: 12px;
  font-weight: 600;
}

.stats {
  display: flex;
  gap: 20px;
  font-size: 16px;
  color: #666;
}

.toolbar {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 18px;
  padding: 16px;
  margin-bottom: 20px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
}

.toolbar-left {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.toolbar-right {
  flex: 1;
  max-width: 400px;
  min-width: 200px;
}

.search-input {
  padding: 10px 16px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.8);
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #007aff;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

.toolbar button,.modal-footer button {
  padding: 10px 20px;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.toolbar button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: linear-gradient(135deg, #007aff, #0051d5);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
}

.btn-warning {
  background: linear-gradient(135deg, #ff9500, #ff6b00);
  color: white;
}

.btn-danger {
  background: linear-gradient(135deg, #ff3b30, #d32f2f);
  color: white;
}

.btn-secondary {
  background: rgba(142, 142, 147, 0.2);
  color: #333;
}

.table-container {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 18px;
  padding: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  /* 关键：确保横向滚动 */
  overflow-x: auto;
  overflow-y: visible;
  -webkit-overflow-scrolling: touch;
  width: 97%;
  position: relative; /* 为 loading overlay 提供定位上下文 */
}

/* Loading overlay styles */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
  border-radius: 18px;
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.spinner-ring {
  width: 60px;
  height: 60px;
  border: 4px solid rgba(0, 122, 255, 0.1);
  border-top-color: #007aff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 16px;
  font-weight: 600;
  color: #007aff;
  letter-spacing: 0.5px;
}

.data-table {
  width: 100%;
  min-width: 600px; /* 确保表格有最小宽度 */
  border-collapse: collapse;
  table-layout: auto;
}

.data-table th,
.data-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  white-space: nowrap; /* 防止内容换行 */
}

.data-table th {
  background: rgba(0, 122, 255, 0.1);
  font-weight: 600;
  color: #333;
  position: sticky;
  top: 0;
  z-index: 10;
}

.data-table tr:hover {
  background: rgba(0, 122, 255, 0.05);
}

.btn-edit {
  padding: 6px 12px;
  background: linear-gradient(135deg, #007aff, #0051d5);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 12px;
  white-space: nowrap;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  padding: 20px;
}

.modal-content {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 18px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  color: #333;
}

.modal-close {
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #666;
  line-height: 1;
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  padding: 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.batch-textarea {
  width: 100%;
  min-height: 300px;
  padding: 12px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  font-family: monospace;
  font-size: 13px;
  resize: vertical;
  background: rgba(255, 255, 255, 0.5);
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.5);
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #007aff;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

.hint {
  color: #666;
  font-size: 13px;
  margin-bottom: 12px;
}

.preview {
  margin-top: 12px;
  padding: 12px;
  background: rgba(0, 122, 255, 0.1);
  border-radius: 8px;
  font-size: 14px;
  color: #007aff;
}

/* Batch table styles */
.modal-large {
  max-width: 1200px;
}

.batch-table-controls {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;
}

.btn-add-row,
.btn-clear {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-add-row {
  background: linear-gradient(135deg, #34c759, #28a745);
  color: white;
}

.btn-add-row:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(52, 199, 89, 0.3);
}

.btn-clear {
  background: rgba(142, 142, 147, 0.2);
  color: #333;
}

.row-count {
  margin-left: auto;
  font-size: 14px;
  color: #666;
  font-weight: 600;
}

.batch-table-wrapper {
  max-height: 500px;
  overflow: auto;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  background: white;
}

.batch-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.batch-table thead {
  position: sticky;
  top: 0;
  background: rgba(0, 122, 255, 0.1);
  z-index: 10;
}

.batch-table th {
  padding: 10px 8px;
  text-align: left;
  font-weight: 600;
  color: #333;
  border-bottom: 2px solid rgba(0, 0, 0, 0.1);
  white-space: nowrap;
}

.batch-table td {
  padding: 6px 8px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.batch-table input {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  font-size: 13px;
  background: rgba(255, 255, 255, 0.8);
}

.batch-table input:focus {
  outline: none;
  border-color: #007aff;
  box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.1);
}

.batch-table tr:hover {
  background: rgba(0, 122, 255, 0.03);
}

.btn-remove {
  padding: 4px 8px;
  background: linear-gradient(135deg, #ff3b30, #d32f2f);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
}

.btn-remove:hover {
  background: linear-gradient(135deg, #d32f2f, #b71c1c);
}

/* Pagination styles */
.pagination {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 18px;
  padding: 16px;
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.pagination-info {
  font-size: 14px;
  color: #666;
  font-weight: 600;
}

.pagination-controls {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.page-numbers {
  display: flex;
  gap: 4px;
}

.btn-page {
  padding: 8px 12px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.8);
  color: #333;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-page:hover:not(:disabled) {
  background: rgba(0, 122, 255, 0.1);
  border-color: #007aff;
  color: #007aff;
}

.btn-page.active {
  background: linear-gradient(135deg, #007aff, #0051d5);
  color: white;
  border-color: #007aff;
}

.btn-page:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pagination-size {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
}

.pagination-size select {
  padding: 8px 12px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  cursor: pointer;
}

/* Mobile optimization */
@media (max-width: 768px) {
  .user-data-page {
    padding: 12px;
  }

  .page-header {
    padding: 16px;
    flex-direction: column;
    align-items: stretch;
    gap:5px;
  }

  .header-left {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
    width: 100%;
  }

  .btn-back {
    padding: 8px 12px;
    font-size: 13px;
  }

  .header-left h2 {
    font-size: 18px;
    flex: 1;
    min-width: 200px;
  }

  .username-badge {
    font-size: 13px;
    padding: 3px 10px;
  }

  .stats {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    gap: 12px;
    width: 100%;
    font-size: 14px;
  }

  .toolbar {
    padding: 12px;
  }

  .toolbar-left {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .toolbar-left button {
    padding: 10px 8px;
    font-size: 13px;
    white-space: nowrap;
  }

  .toolbar-right {
    max-width: 100%;
    width: 100%;
    margin-top: 8px;
  }

  .search-input {
    font-size: 16px;
  }

  /* 表格容器 - 关键优化 */
  .table-container {
    padding: 12px;
    border-radius: 12px;
    /* 确保可以横向滚动 */
    overflow-x: scroll;
    overflow-y: visible;
    -webkit-overflow-scrolling: touch;
  }

  .data-table {
    min-width: 900px;
    font-size: 13px;
  }

  .data-table th,
  .data-table td {
    padding: 10px 8px;
    font-size: 13px;
  }

  .btn-edit {
    padding: 6px 10px;
    font-size: 12px;
  }

  .pagination {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
    padding: 12px;
  }

  .pagination-info {
    text-align: center;
    font-size: 13px;
  }

  .pagination-controls {
    justify-content: center;
    flex-wrap: wrap;
  }

  .btn-page {
    padding: 8px 10px;
    font-size: 13px;
    min-width: 40px;
  }

  .page-numbers {
    gap: 4px;
  }

  .pagination-size {
    justify-content: center;
    font-size: 13px;
  }

  .pagination-size select {
    padding: 8px 12px;
    font-size: 13px;
  }

  .modal-content {
    max-width: 95%;
    max-height: 90vh;
    margin: 10px;
  }

  .modal-large {
    max-width: 95%;
  }

  .modal-header {
    padding: 16px;
  }

  .modal-body {
    padding: 16px;
  }

  .modal-footer {
    padding: 16px;
    flex-direction: column;
  }

  .modal-footer button {
    width: 100%;
  }

  .batch-table-wrapper {
    max-height: 400px;
    overflow: auto;
  }

  .batch-table {
    font-size: 12px;
    min-width: 600px;
  }

  .batch-table input {
    font-size: 12px;
    padding: 6px 8px;
  }

  .batch-table-controls {
    flex-wrap: wrap;
    gap: 8px;
  }

  .btn-add-row,
  .btn-clear {
    padding: 8px 12px;
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .user-data-page {
    padding: 8px;
  }

  .page-header {
    padding: 12px;
    gap:5px;
  }

  .header-left {
    align-items: flex-start;
  }

  .header-left h2 {
    font-size: 16px;
    width: 100%;
  }

  .btn-back {
    padding: 6px 10px;
    font-size: 12px;
  }

  .stats {
    font-size: 13px;
    gap: 6px;
  }

  .toolbar {
    padding: 10px;
  }

  .toolbar-left {
    grid-template-columns: 1fr 1fr;
    gap: 6px;
  }

  .toolbar-left button {
    padding: 6px 10px;
    font-size: 12px;
  }

  .table-container {
    padding: 10px;
  }

  .data-table {
    min-width: 800px;
  }

  .data-table th,
  .data-table td {
    padding: 8px 6px;
    font-size: 12px;
  }

  .btn-page {
    padding: 6px 8px;
    font-size: 12px;
    min-width: 36px;
  }

  .page-numbers {
    gap: 2px;
  }

  .modal-header h3 {
    font-size: 16px;
  }

  .modal-close {
    font-size: 24px;
  }

  .batch-table {
    min-width: 600px;
  }
}

/* 自定义滚动条样式 */
.table-container::-webkit-scrollbar {
  height: 10px;
}

.table-container::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 5px;
}

.table-container::-webkit-scrollbar-thumb {
  background: rgba(0, 122, 255, 0.6);
  border-radius: 5px;
}

.table-container::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 122, 255, 0.8);
}
</style>

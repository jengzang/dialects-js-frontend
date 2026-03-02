<template>
  <div style="width:100%;">
    <!-- 加载中状态 -->
    <div v-if="authLoading" class="loading-container">
      <div class="spinner"></div>
      <p>正在验证权限...</p>
    </div>

    <!-- 权限验证 -->
    <div v-else-if="!isAdmin" class="access-denied">
      <h2>⚠️ 权限不足</h2>
      <p>此页面仅限管理员访问</p>
      <button @click="goHome">返回首页</button>
    </div>

    <!-- 管理员界面 -->
    <div v-else class="admin-panel">
      <!-- 表格显示后的折叠工具栏 -->
      <div v-if="showUniversalTable" class="collapsed-toolbar">
        <div class="toolbar-content">
          <h3>📊 {{ selectedDbKey }} / {{ selectedTable }}</h3>
          <button @click="toggleConfigPanel" class="btn-toggle">
            {{ showConfigPanel ? '🔼 收起配置' : '🔽 展开配置' }}
          </button>
        </div>
      </div>

      <!-- 配置面板 -->
      <div v-show="!showUniversalTable || showConfigPanel" class="config-panel">
        <h2 v-if="!showUniversalTable">📊 表格数据管理</h2>

        <!-- 配置保存/加载 -->
        <div class="config-actions">
          <button @click="saveCurrentConfig" class="btn-action-small">💾 保存当前配置</button>
          <button @click="loadSavedConfig" class="btn-action-small">📂 加载已保存配置</button>
          <button @click="clearSavedConfig" class="btn-action-small danger">🗑️ 清除配置</button>
        </div>

        <!-- 步骤 1: 选择数据库 -->
        <div class="config-section" style="gap:25px;display: flex;justify-content: center;">
          <label>1️⃣ 选择数据库：</label>
          <div class="input-group">
            <SimpleSelectDropdown
              v-model="selectedDbKey"
              :options="dbKeyOptions"
              width="250px"
              @update:modelValue="onDbKeyChange"
            />
            <input
              v-if="selectedDbKey === '__custom__' || customDbKeyMode"
              v-model="customDbKey"
              type="text"
              placeholder="输入数据库键（如 query）"
              class="custom-input"
              @blur="applyCustomDbKey"
            />
          </div>
          <label v-if="selectedDbKey">2️⃣ 选择表：</label>
          <div v-if="selectedDbKey" class="input-group">
            <SimpleSelectDropdown
              v-model="selectedTable"
              :options="tableOptions"
              width="250px"
              @update:modelValue="onTableChange"
            />
            <input
                v-if="selectedTable === '__custom__' || customTableMode"
                v-model="customTable"
                type="text"
                placeholder="输入表名（如 dialects）"
                class="custom-input"
                @blur="applyCustomTable"
            />
          </div>
        </div>


        <!-- 步骤 3: 配置列显示 -->
        <div v-if="selectedTable && allColumns.length > 0" class="config-section">
          <h3>3️⃣ 配置列显示</h3>

          <!-- 快速预设配置 -->
          <div class="preset-buttons">
            <button @click="applyPresetConfig" class="btn-preset">
              ⚡ 使用预设配置
            </button>
            <button @click="selectAllColumns" class="btn-preset">
              {{ allColumnsSelected ? '❌ 全不选' : '✅ 全选所有列' }}
            </button>
          </div>

          <!-- 列配置表格 -->
          <div class="table-wrapper">
            <table class="column-config-table">
              <thead>
                <tr>
                  <th>显示</th>
                  <th>列名</th>
                  <th>列宽</th>
                  <th>可筛选</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="col in allColumns" :key="col.name">
                  <td>
                    <input
                      type="checkbox"
                      v-model="selectedColumns[col.name]"
                    />
                  </td>
                  <td>{{ col.name }}</td>
                  <td>
                    <input
                      v-if="selectedColumns[col.name]"
                      type="number"
                      v-model.number="columnWidths[col.name]"
                      min="0.5"
                      max="10"
                      step="0.1"
                      class="width-input"
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      v-model="filterableColumns[col.name]"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- 默认筛选配置 -->
          <div class="filter-config">
            <div class="filter-header" @click="toggleFilterConfig">
              <h4>4️⃣ 默认筛选（可选）</h4>
              <button class="btn-toggle-filter">
                {{ showFilterConfig ? '🔼 收起' : '🔽 展开' }}
              </button>
            </div>

            <div v-show="showFilterConfig" class="filter-grid">
              <div v-for="col in allColumns" :key="col.name" class="filter-item">
                <label>{{ col.name }}:</label>
                <input
                  type="text"
                  v-model="defaultFilters[col.name]"
                  placeholder="留空表示不筛选"
                />
              </div>
            </div>
          </div>

          <!-- 显示表格按钮 -->
          <button @click="showTable" class="btn-show">
            🚀 显示表格
          </button>
        </div>
      </div>

      <!-- 步骤 5: 显示 UniversalTable -->
      <div v-if="showUniversalTable" class="table-display">
        <UniversalTable
          :db-key="selectedDbKey"
          :table-name="selectedTable"
          :columns="computedColumns"
          :default-filter="computedDefaultFilter"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { userStore } from '@/store/store.js'
import { getUserRole, ensureAuthenticated } from '@/api/auth/auth.js'
import { getTableColumns } from '@/api/sql/index.js'
import UniversalTable from '@/components/TableAndTree/UniversalTable.vue'
import SimpleSelectDropdown from '@/components/common/SimpleSelectDropdown.vue'

const router = useRouter()

// 权限验证
const authLoading = ref(true)
const isAdmin = computed(() => userStore.role === 'admin')

// 数据库和表映射
const DB_TABLE_MAPPING = {
  spoken: ['口语字'],
  village: ['广东省自然村'],
  chars: ['characters'],
  query: ['dialects'],
  query_admin: ['dialects'],
  dialects: ['dialects'],
  dialects_admin: ['dialects'],
  yubao: ['grammar', 'vocabulary'],
  logs: ['api_keyword_log', 'api_statistics', 'api_visit_log'],
  // auth: ['api_usage_logs', 'api_usage_summary', 'users', 'refresh_tokens', 'user_db_permissions']
}

// 预设配置（常用表的默认列配置）
const PRESET_CONFIGS = {
  'dialects': {
    columns: ['簡稱', '地圖集二分區', '音典分區', '字表來源（母本）', '省', '市', '縣', '鎮'],
    widths: { '簡稱': 1, '地圖集二分區': 1.5, '音典分區': 1.5, '字表來源（母本）': 3, '省': 0.8, '市': 0.8, '縣': 0.8, '鎮': 0.8 },
    filterable: ['地圖集二分區', '音典分區', '省', '市', '縣', '鎮']
  },
  '口语字': {
    columns: ['本字考', 'IPA', '粤拼', '来源', '声母', '韵母', '音调', '词性', '释义', '例词例句', '待校及说明'],
    widths: { '本字考': 1, 'IPA': 0.8, '粤拼': 0.8, '来源': 0.8, '声母': 0.5, '韵母': 0.8, '音调': 0.5, '词性': 1, '释义': 2, '例词例句': 2, '待校及说明': 0.8 },
    filterable: ['来源', '声母', '韵母', '音调', '词性', '待校及说明']
  },

}

// 状态管理
const selectedDbKey = ref('')
const selectedTable = ref('')
const customDbKey = ref('')
const customTable = ref('')
const customDbKeyMode = ref(false)
const customTableMode = ref(false)
const allColumns = ref([])
const selectedColumns = ref({})
const columnWidths = ref({})
const filterableColumns = ref({})
const defaultFilters = ref({})
const showUniversalTable = ref(false)
const showConfigPanel = ref(false)  // 控制配置面板的显示
const showFilterConfig = ref(false)  // 控制默认筛选的展开/收起

// 计算属性
const dbKeys = computed(() => Object.keys(DB_TABLE_MAPPING))
const availableTables = computed(() => {
  return selectedDbKey.value ? DB_TABLE_MAPPING[selectedDbKey.value] : []
})

// Dropdown options
const dbKeyOptions = computed(() => {
  const options = [{ label: '-- 请选择数据库 --', value: '' }]
  dbKeys.value.forEach(key => {
    options.push({ label: key, value: key })
  })
  options.push({ label: '✏️ 手动输入...', value: '__custom__' })
  return options
})

const tableOptions = computed(() => {
  const options = [{ label: '-- 请选择表 --', value: '' }]
  availableTables.value.forEach(table => {
    options.push({ label: table, value: table })
  })
  options.push({ label: '✏️ 手动输入...', value: '__custom__' })
  return options
})

// 检查是否所有列都已选中
const allColumnsSelected = computed(() => {
  if (allColumns.value.length === 0) return false
  return allColumns.value.every(col => selectedColumns.value[col.name])
})

const computedColumns = computed(() => {
  return Object.keys(selectedColumns.value)
    .filter(col => selectedColumns.value[col])
    .map(col => ({
      key: col,
      label: col,
      filterable: filterableColumns.value[col] || false,  // 使用配置的可筛选状态
      width: columnWidths.value[col] || 1
    }))
})

const computedDefaultFilter = computed(() => {
  const filters = {}
  Object.keys(defaultFilters.value).forEach(col => {
    if (defaultFilters.value[col]) {
      filters[col] = defaultFilters.value[col]
    }
  })
  return Object.keys(filters).length > 0 ? filters : null
})

// 方法
const goHome = () => {
  router.push('/')
}

const onDbKeyChange = () => {
  selectedTable.value = ''
  allColumns.value = []
  showUniversalTable.value = false
  customDbKeyMode.value = selectedDbKey.value === '__custom__'
}

const onTableChange = async () => {
  showUniversalTable.value = false
  customTableMode.value = selectedTable.value === '__custom__'
  if (selectedTable.value && selectedTable.value !== '__custom__') {
    await fetchColumns()

    // ✅ 新增：切换表后自动尝试加载该表的配置
    const configKey = getConfigKey(selectedDbKey.value, selectedTable.value)
    const saved = localStorage.getItem(configKey)

    if (saved) {
      try {
        const config = JSON.parse(saved)
        selectedColumns.value = config.selectedColumns || {}
        columnWidths.value = config.columnWidths || {}
        filterableColumns.value = config.filterableColumns || {}
        defaultFilters.value = config.defaultFilters || {}
        console.log(`✅ 自动加载配置: ${selectedDbKey.value}/${selectedTable.value}`)
      } catch (err) {
        console.error('自动加载配置失败:', err)
      }
    } else {
      console.log(`ℹ️ 该表没有保存的配置，使用默认配置`)
    }
  }
}

const applyCustomDbKey = () => {
  if (customDbKey.value.trim()) {
    selectedDbKey.value = customDbKey.value.trim()
    customDbKeyMode.value = false
  }
}

const applyCustomTable = async () => {
  if (customTable.value.trim()) {
    selectedTable.value = customTable.value.trim()
    customTableMode.value = false
    await fetchColumns()
  }
}

const fetchColumns = async () => {
  try {
    // 1. 手动拼接查询参数
    const dbKey = selectedDbKey.value;
    const tableName = selectedTable.value;

    // 2. 调用 getTableColumns API
    const res = await getTableColumns(dbKey, tableName)
      method: 'GET'

    // 后面逻辑保持不变
    allColumns.value = res.columns || []

    // 初始化配置
    selectedColumns.value = {}
    columnWidths.value = {}
    filterableColumns.value = {}
    defaultFilters.value = {}

    // 初始化所有列
    allColumns.value.forEach(col => {
      const colName = col.name;
      selectedColumns.value[colName] = false
      columnWidths.value[colName] = 1
      filterableColumns.value[colName] = false
    })

    applyPresetConfig()
  } catch (err) {
    console.error('获取列信息失败:', err)
    if (window.showWarningToast) {
      window.showWarningToast('获取列信息失败，请检查数据库连接')
    } else {
      alert('获取列信息失败，请检查数据库连接')
    }
  }
}

const applyPresetConfig = () => {
  const preset = PRESET_CONFIGS[selectedTable.value]
  if (preset) {
    // 应用预设配置
    allColumns.value.forEach(col => {
      const colName = col.name
      selectedColumns.value[colName] = preset.columns.includes(colName)
      columnWidths.value[colName] = preset.widths[colName] || 1
      filterableColumns.value[colName] = preset.filterable.includes(colName)
    })
  } else {
    // 默认选择前 10 列
    selectFirst10Columns()
  }
}

const selectFirst10Columns = () => {
  allColumns.value.forEach((col, index) => {
    const colName = col.name
    selectedColumns.value[colName] = index < 10  // 默认只选前 10 列
    columnWidths.value[colName] = 1
    filterableColumns.value[colName] = false
  })
}

const selectAllColumns = () => {
  // 检查是否所有列都已选中
  const allSelected = allColumns.value.every(col => selectedColumns.value[col.name])

  allColumns.value.forEach((col) => {
    const colName = col.name
    // Toggle: 如果全部选中就全不选，否则全选
    selectedColumns.value[colName] = !allSelected
    // 只在首次选中时初始化宽度，不覆盖已有配置
    if (!allSelected && !columnWidths.value[colName]) {
      columnWidths.value[colName] = 1
    }
    // 不修改 filterableColumns，保持用户的筛选配置
  })
}

const showTable = () => {
  if (computedColumns.value.length === 0) {
    if (window.showWarningToast) {
      window.showWarningToast('请至少选择一列')
    } else {
      alert('请至少选择一列')
    }
    return
  }

  // ✅ 显示表格时保存最后使用的表
  saveLastUsedTable(selectedDbKey.value, selectedTable.value)

  // ✅ 强制重新挂载 UniversalTable 组件
  // 先卸载组件，然后在下一个 tick 重新挂载
  // 这样可以确保所有状态（filterState、sortCol 等）都重新初始化
  showUniversalTable.value = false
  nextTick(() => {
    showUniversalTable.value = true
    showConfigPanel.value = false  // 显示表格后自动折叠配置面板
  })
}

const toggleConfigPanel = () => {
  showConfigPanel.value = !showConfigPanel.value
}

const toggleFilterConfig = () => {
  showFilterConfig.value = !showFilterConfig.value
}

// ✅ 记住最后使用的表
const LAST_USED_TABLE_KEY = 'table_manage_last_used'

const saveLastUsedTable = (dbKey, tableName) => {
  localStorage.setItem(LAST_USED_TABLE_KEY, JSON.stringify({ dbKey, tableName }))
}

const getLastUsedTable = () => {
  const saved = localStorage.getItem(LAST_USED_TABLE_KEY)
  if (saved) {
    try {
      return JSON.parse(saved)
    } catch {
      return null
    }
  }
  return null
}

// 配置保存/加载
// ✅ 改为基于表的配置键（每个表单独保存）
const getConfigKey = (dbKey, tableName) => {
  return `table_config_${dbKey}_${tableName}`
}

const saveCurrentConfig = () => {
  if (!selectedDbKey.value || !selectedTable.value) {
    if (window.showWarningToast) {
      window.showWarningToast('请先选择数据库和表')
    }
    return
  }

  const config = {
    selectedDbKey: selectedDbKey.value,
    selectedTable: selectedTable.value,
    selectedColumns: selectedColumns.value,
    columnWidths: columnWidths.value,
    filterableColumns: filterableColumns.value,
    defaultFilters: defaultFilters.value,
    timestamp: Date.now()
  }

  // ✅ 使用表专属的配置键
  const configKey = getConfigKey(selectedDbKey.value, selectedTable.value)
  localStorage.setItem(configKey, JSON.stringify(config))

  // ✅ 保存最后使用的表
  saveLastUsedTable(selectedDbKey.value, selectedTable.value)

  if (window.showSuccessToast) {
    window.showSuccessToast(`配置已保存: ${selectedDbKey.value}/${selectedTable.value}`)
  } else {
    alert('配置已保存')
  }
}

const loadSavedConfig = async () => {
  if (!selectedDbKey.value || !selectedTable.value) {
    if (window.showWarningToast) {
      window.showWarningToast('请先选择数据库和表')
    }
    return
  }

  // ✅ 使用表专属的配置键
  const configKey = getConfigKey(selectedDbKey.value, selectedTable.value)
  const saved = localStorage.getItem(configKey)

  if (!saved) {
    if (window.showWarningToast) {
      window.showWarningToast(`该表没有已保存的配置: ${selectedDbKey.value}/${selectedTable.value}`)
    }
    return
  }

  try {
    const config = JSON.parse(saved)

    // 恢复配置（无需重新 fetchColumns，因为已经选择了表）
    selectedColumns.value = config.selectedColumns || {}
    columnWidths.value = config.columnWidths || {}
    filterableColumns.value = config.filterableColumns || {}
    defaultFilters.value = config.defaultFilters || {}

    if (window.showSuccessToast) {
      window.showSuccessToast(`配置已加载: ${selectedDbKey.value}/${selectedTable.value}`)
    } else {
      alert('配置已加载')
    }
  } catch (err) {
    console.error('加载配置失败:', err)
    if (window.showErrorToast) {
      window.showErrorToast('加载配置失败')
    }
  }
}

const clearSavedConfig = () => {
  if (!selectedDbKey.value || !selectedTable.value) {
    if (window.showWarningToast) {
      window.showWarningToast('请先选择数据库和表')
    }
    return
  }

  // ✅ 清除表专属的配置
  const configKey = getConfigKey(selectedDbKey.value, selectedTable.value)
  localStorage.removeItem(configKey)

  if (window.showSuccessToast) {
    window.showSuccessToast(`配置已清除: ${selectedDbKey.value}/${selectedTable.value}`)
  } else {
    alert('配置已清除')
  }
}

// 生命周期
onMounted(async () => {
  // console.log('[TableManage] 组件开始加载')

  try {
    // 先确保用户已认证并获取角色信息
    // console.log('[TableManage] 开始权限验证...')
    await ensureAuthenticated()
    // console.log('[TableManage] ensureAuthenticated 完成')

    await getUserRole()
    // console.log('[TableManage] getUserRole 完成，当前角色:', userStore.role)

    // 权限验证完成
    authLoading.value = false

    // 如果不是管理员，3秒后跳转首页
    if (!isAdmin.value) {
      // console.log('[TableManage] 非管理员，准备跳转')
      if (window.showWarningToast) {
        window.showWarningToast('此页面仅限管理员访问')
      }
      setTimeout(() => {
        router.push('/')
      }, 3000)
    } else {
      console.log('[TableManage] 管理员身份验证成功')

      // ✅ 如果是管理员，尝试自动加载最后使用的表
      const lastUsed = getLastUsedTable()
      if (lastUsed && lastUsed.dbKey && lastUsed.tableName) {
        console.log('[TableManage] 自动加载最后使用的表:', lastUsed.dbKey, lastUsed.tableName)

        // 静默加载
        selectedDbKey.value = lastUsed.dbKey
        selectedTable.value = lastUsed.tableName

        // 尝试获取列信息，如果失败不影响页面加载
        try {
          await fetchColumns()

          // 尝试加载该表的配置
          const configKey = getConfigKey(lastUsed.dbKey, lastUsed.tableName)
          const saved = localStorage.getItem(configKey)

          if (saved) {
            const config = JSON.parse(saved)
            selectedColumns.value = config.selectedColumns || {}
            columnWidths.value = config.columnWidths || {}
            filterableColumns.value = config.filterableColumns || {}
            defaultFilters.value = config.defaultFilters || {}
            console.log('[TableManage] 配置加载完成')
          } else {
            console.log('[TableManage] 该表没有保存的配置，使用默认配置')
          }
        } catch (fetchErr) {
          console.error('[TableManage] 自动加载列信息失败:', fetchErr)
        }
      } else {
        console.log('[TableManage] 没有最后使用的表记录')
      }
    }
  } catch (err) {
    console.error('[TableManage] 权限验证失败:', err)
    console.error('[TableManage] 错误详情:', err.message, err.stack)

    authLoading.value = false

    // 即使权限验证失败，也先显示界面（可能是网络问题）
    // 用 setTimeout 延迟检查，给用户时间看到错误
    if (window.showErrorToast) {
      window.showErrorToast('权限验证失败，请重新登录')
    }

    setTimeout(() => {
      // 再次检查，如果确实没有权限就跳转
      if (!isAdmin.value) {
        console.log('[TableManage] 延迟检查后仍无权限，跳转到登录页')
        router.push('/auth')
      }
    }, 3000)
  }
})
</script>

<style scoped>
/* 主容器 */
.admin-panel {
  width: 100%;
}


/* 加载容器 - 液态玻璃风格 */
.loading-container {
  text-align: center;
  padding: 60px 20px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 122, 255, 0.1),
              inset 0 1px 0 rgba(255, 255, 255, 0.5);
}

.loading-container .spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(0, 122, 255, 0.2);
  border-top-color: #007aff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-container p {
  color: #007aff;
  font-size: 18px;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 权限拒绝 - 液态玻璃风格 */
.access-denied {
  text-align: center;
  padding: 60px 20px;
  background: rgba(255, 243, 205, 0.8);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-radius: 20px;
  border: 1px solid rgba(255, 193, 7, 0.3);
  box-shadow: 0 8px 32px rgba(255, 193, 7, 0.2),
              inset 0 1px 0 rgba(255, 255, 255, 0.5);
}

.access-denied h2 {
  color: #856404;
  margin-bottom: 10px;
  font-weight: 700;
}

.access-denied button {
  margin: 20px auto 0;
  padding: 12px 24px;
  background: linear-gradient(135deg, #007aff 0%, #0056b3 100%);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  box-shadow: 0 4px 16px rgba(0, 122, 255, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: block;
}

.access-denied button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 122, 255, 0.4);
}

/* 折叠工具栏 - 液态玻璃风格 */
.collapsed-toolbar {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-radius: 16px;
  padding: 12px 24px;
  margin-bottom: 16px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08),
              inset 0 1px 0 rgba(255, 255, 255, 0.5);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.collapsed-toolbar:hover {
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12),
              inset 0 1px 0 rgba(255, 255, 255, 0.5);
}

.toolbar-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.toolbar-content h3 {
  margin: 0;
  background: linear-gradient(135deg, #007aff 0%, #0056b3 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 18px;
  font-weight: 700;
}

.btn-toggle {
  padding: 10px 20px;
  background: linear-gradient(135deg, #007aff 0%, #0056b3 100%);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 4px 16px rgba(0, 122, 255, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
}

.btn-toggle:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 122, 255, 0.4);
}

.btn-toggle:active {
  transform: translateY(0);
}

/* 配置面板 - 液态玻璃风格 */
.config-panel {
  animation: fadeInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 配置操作按钮 */
.config-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
  justify-content: center;
}

.btn-action-small {
  padding: 10px 20px;
  background: linear-gradient(135deg, #007aff 0%, #0056b3 100%);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 4px 16px rgba(0, 122, 255, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.btn-action-small::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s;
}

.btn-action-small:hover::before {
  left: 100%;
}

.btn-action-small:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 122, 255, 0.4);
}

.btn-action-small:active {
  transform: translateY(0);
}

.btn-action-small.danger {
  background: linear-gradient(135deg, #ff3b30 0%, #c82333 100%);
  box-shadow: 0 4px 16px rgba(220, 53, 69, 0.3);
}

.btn-action-small.danger:hover {
  box-shadow: 0 6px 20px rgba(220, 53, 69, 0.4);
}

.admin-panel h2 {
  background: linear-gradient(135deg, #1c1c1e 0%, #007aff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 24px;
  font-size: 32px;
  font-weight: 800;
  letter-spacing: -0.5px;
}

/* 配置区块 - 液态玻璃卡片 */
.config-section {

  margin-bottom: 20px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08),
              inset 0 1px 0 rgba(255, 255, 255, 0.5);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.config-section:hover {
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12),
              inset 0 1px 0 rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
}

.config-section h3 {
  margin-top: 0;
  margin-bottom: 16px;
  background: linear-gradient(135deg, #1c1c1e 0%, #007aff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 20px;
  font-weight: 700;
}

.config-section label {
  display: block;
  margin-top: 5px;
  font-weight: 600;
  color: #1c1c1e;
  font-size: 15px;
}

.input-group {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
}

.config-section select {
  flex: 1;
  min-width: 250px;
  max-width: 350px;
  padding: 12px 16px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  font-size: 15px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.config-section select:hover {
  border-color: #007aff;
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.15);
}

.config-section select:focus {
  outline: none;
  border-color: #007aff;
  box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.1);
}

.custom-input {
  flex: 1;
  min-width: 250px;
  max-width: 350px;
  padding: 12px 16px;
  border: 2px solid #007aff;
  border-radius: 12px;
  font-size: 15px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 4px 16px rgba(0, 122, 255, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.custom-input:focus {
  outline: none;
  border-color: #0056b3;
  box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.15);
  transform: translateY(-2px);
}

/* 预设按钮组 */
.preset-buttons {
  margin-bottom: 16px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
}

.btn-preset {
  padding: 10px 20px;
  background: linear-gradient(135deg, #34c759 0%, #28a745 100%);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 4px 16px rgba(52, 199, 89, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-preset:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(52, 199, 89, 0.4);
}

.btn-preset:active {
  transform: translateY(0);
}

/* 表格容器 - 液态玻璃 */
.table-wrapper {
  overflow-x: auto;
  max-height: 500px;
  overflow-y: auto;
  border-radius: 12px;
  margin-top: 16px;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.05);
}

.table-wrapper::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.table-wrapper::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
}

.table-wrapper::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #007aff 0%, #0056b3 100%);
  border-radius: 4px;
}

.table-wrapper::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #0056b3 0%, #003d82 100%);
}

.column-config-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: transparent;
  font-size: 14px;
}

.column-config-table th,
.column-config-table td {
  padding: 12px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  text-align: left;
  white-space: nowrap;
}

.column-config-table th {
  background: linear-gradient(135deg, #007aff 0%, #0056b3 100%);
  color: white;
  font-weight: 600;
  position: sticky;
  top: 0;
  z-index: 10;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.column-config-table th:first-child {
  border-top-left-radius: 12px;
}

.column-config-table th:last-child {
  border-top-right-radius: 12px;
}

.column-config-table tbody tr {
  background: rgba(255, 255, 255, 0.8);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.column-config-table tbody tr:hover {
  background: rgba(0, 122, 255, 0.08);
}

.column-config-table input[type="checkbox"] {
  cursor: pointer;
  width: 18px;
  height: 18px;
  accent-color: #007aff;
}

.width-input {
  width: 80%;
  padding: 6px 12px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.9);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.width-input:focus {
  outline: none;
  border-color: #007aff;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

/* 筛选配置 - 液态玻璃 */
.filter-config {
  margin-top: 20px;
  padding: 20px;
  background: rgba(233, 236, 239, 0.6);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.05);
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  user-select: none;
  padding: 0;
  margin-bottom: 16px;
}

.filter-header:hover h4 {
  color: #007aff;
}

.filter-config h4 {
  margin: 0;
  color: #495057;
  font-size: 17px;
  font-weight: 700;
  transition: color 0.3s;
}

.btn-toggle-filter {
  padding: 6px 12px;
  background: linear-gradient(135deg, #007aff 0%, #0056b3 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 122, 255, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-toggle-filter:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.4);
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 12px;
  animation: fadeIn 0.3s ease;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.filter-item label {
  min-width: 60px;
  font-weight: 600;
  font-size: 14px;
  color: #1c1c1e;
  margin: 0;
}

.filter-item input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.filter-item input:focus {
  outline: none;
  border-color: #007aff;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

/* 显示表格按钮 - 超大主操作按钮 */
.btn-show {
  margin: 24px auto 0;
  padding: 16px 40px;
  background: linear-gradient(135deg, #007aff 0%, #0056b3 100%);
  color: white;
  border: none;
  border-radius: 16px;
  cursor: pointer;
  font-size: 18px;
  font-weight: 700;
  box-shadow: 0 8px 32px rgba(0, 122, 255, 0.4);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  display: block;
}

.btn-show::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.6s;
}

.btn-show:hover::before {
  left: 100%;
}

.btn-show:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 48px rgba(0, 122, 255, 0.5);
}

.btn-show:active {
  transform: translateY(-2px);
}

/* 表格显示区域 */
.table-display {
  margin-top: 20px;
  width: 100%;
}

/* 响应式优化 */
@media (max-width: 768px) {

  .config-section {
    padding: 16px;
    gap: 10px!important;
    flex-direction: column;
  }

  .filter-grid {
    grid-template-columns: 1fr;
  }

  .config-actions {
    align-items: center;
  }

  .btn-action-small {
    max-width: 320px;
  }

  .admin-panel h2 {
    font-size: 24px;
  }
}

/* 暗色模式适配 */
@media (prefers-color-scheme: dark) {
  .config-section {
    background: rgba(28, 28, 30, 0.7);
    border-color: rgba(255, 255, 255, 0.1);
  }

  .config-section select,
  .custom-input,
  .filter-item input,
  .width-input {
    background: rgba(44, 44, 46, 0.9);
    color: white;
    border-color: rgba(255, 255, 255, 0.2);
  }

  .config-section label,
  .filter-item label {
    color: #f5f5f7;
  }

  .column-config-table tbody tr {
    background: rgba(28, 28, 30, 0.8);
  }

  .column-config-table tbody tr:hover {
    background: rgba(0, 122, 255, 0.2);
  }
}
</style>

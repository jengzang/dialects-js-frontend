<template>
  <div class="check-tool-container">
    <!-- 欢迎屏幕 -->
    <div v-if="!fileUploaded" class="welcome-screen">
      <div class="glass-container welcome-card">
        <div class="welcome-icon">📋</div>
        <h2 class="title">方言字表檢查工具</h2>
        <p class="subtitle">上傳Excel文件開始檢查和編輯</p>

        <div class="welcome-features">
          <div class="feature-item">
            <span class="feature-icon">✓</span>
            <span>自動檢測非單字、異常音標、缺聲調</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">✓</span>
            <span>支持指令批量編輯（c-/i-/p-/r/s）</span>
          </div>
          <div class="feature-item">
            <span class="feature-icon">✓</span>
            <span>單元格點擊編輯，快速修復</span>
          </div>
        </div>

        <div class="format-selector">
          <label class="format-label">文件格式：</label>
          <div class="format-options">
            <label class="format-option">
              <input type="radio" name="format" value="音典" v-model="selectedFormat" />
              <span>音典</span>
            </label>
            <label class="format-option">
              <input type="radio" name="format" value="跳跳老鼠" v-model="selectedFormat" />
              <span>跳跳老鼠</span>
            </label>
            <label class="format-option">
              <input type="radio" name="format" value="县志" v-model="selectedFormat" />
              <span>縣志</span>
            </label>
          </div>
        </div>

        <input
          type="file"
          ref="fileInput"
          accept=".xlsx,.xls,.doc,.docx,.tsv"
          @change="handleFileUpload"
          style="display: none"
        />
        <div
          class="upload-zone-drop"
          :class="{ 'drag-over': isDragOver }"
          @click="$refs.fileInput.click()"
          @dragover.prevent="isDragOver = true"
          @dragleave.prevent="isDragOver = false"
          @drop.prevent="handleDrop"
        >
          <div class="upload-icon-large">📄</div>
          <h3 class="upload-text">點擊或拖拽文件到此處</h3>
          <p class="hint-text">支持 .xlsx, .xls, .doc, .docx, .tsv 格式</p>
        </div>
      </div>
    </div>

    <!-- 工作区域 -->
    <div v-else class="work-area">
      <!-- 侧边栏 -->
      <aside class="sidebar glass-panel" :class="{ collapsed: sidebarCollapsed }">
        <div class="sidebar-header">
          <h3>📋 邊欄</h3>
          <button class="collapse-btn" @click="toggleSidebar">
            {{ sidebarCollapsed ? '▶' : '◀' }}
          </button>
        </div>

        <div v-if="!sidebarCollapsed" class="sidebar-content custom-scrollbar">
          <!-- 错误统计卡片 -->
          <div class="sidebar-section" :class="{ collapsed: !errorStatsExpanded }">
            <div class="section-header" @click="toggleErrorStats">
              <span class="section-title">🔍 錯誤列表</span>
              <span class="toggle-icon">{{ errorStatsExpanded ? '▼' : '▶' }}</span>
            </div>

            <div v-show="errorStatsExpanded" class="section-content">
              <!-- 错误统计 -->
              <div class="error-stats">
                <div
                  v-for="(config, key) in errorStatsConfig"
                  :key="key"
                  v-show="errorStats[key] > 0"
                  class="stat-item"
                  :class="config.type"
                  @click="filterErrors(key)"
                >
                  <span class="badge">{{ config.icon }}</span>
                  <span class="label">{{ config.label }}</span>
                  <span class="count">{{ errorStats[key] }}</span>
                </div>
              </div>

              <!-- 搜索框 -->
              <div class="filter-section">
                <input
                  v-model="searchQuery"
                  type="text"
                  class="glass-input search-input"
                  placeholder="🔍 搜索漢字..."
                  @input="handleSearch"
                />
                <button class="glass-button small" @click="resetFilter">清除篩選</button>
              </div>

              <!-- 错误列表 -->
              <div class="error-list">
                <div
                  v-for="error in displayedErrors.slice(0, 50)"
                  :key="error.row"
                  class="error-item"
                  @click="jumpToRow(error.row)"
                >
                  <div class="error-row-num">行 {{ error.row }}</div>
                  <div class="error-char">{{ error.value || error.char || '' }}</div>
                  <div class="error-type-badge" :class="error.error_type || error.type">
                    {{ getErrorTypeLabel(error.error_type || error.type) }}
                  </div>
                </div>
                <div v-if="displayedErrors.length > 50" class="error-more">
                  還有 {{ displayedErrors.length - 50 }} 個錯誤...
                </div>
              </div>
            </div>
          </div>

          <!-- 调值统计卡片 -->
          <div class="sidebar-section" :class="{ collapsed: !toneStatsExpanded }">
            <div class="section-header" @click="toggleToneStats">
              <span class="section-title">📊 調值統計</span>
              <span class="toggle-icon">{{ toneStatsExpanded ? '▼' : '▶' }}</span>
            </div>

            <div v-show="toneStatsExpanded" class="section-content">
              <div v-if="toneStats" class="tone-stats-content">
                <!-- 入声调 -->
                <div v-if="Object.keys(toneStats.ru_tones).length > 0" class="tone-section">
                  <div class="tone-section-title ru">入聲調</div>
                  <div
                    v-for="([tone, info], index) in sortedRuTones"
                    :key="'ru-' + index"
                    class="tone-item ru"
                    @click="showAllChars(tone, info, '入声')"
                  >
                    <div class="tone-header">
                      <span class="tone-value">{{ tone }}</span>
                      <span class="tone-count">{{ info.count }}字{{ info.count > info.chars.length ? ' 👁️' : '' }}</span>
                    </div>
                    <div class="tone-chars">
                      {{ info.chars.join(' ') }}{{ info.count > info.chars.length ? '...' : '' }}
                    </div>
                  </div>
                </div>

                <!-- 舒声调 -->
                <div v-if="Object.keys(toneStats.shu_tones).length > 0" class="tone-section">
                  <div class="tone-section-title shu">舒聲調</div>
                  <div
                    v-for="([tone, info], index) in sortedShuTones"
                    :key="'shu-' + index"
                    class="tone-item shu"
                    @click="showAllChars(tone, info, '舒声')"
                  >
                    <div class="tone-header">
                      <span class="tone-value">{{ tone }}</span>
                      <span class="tone-count">{{ info.count }}字{{ info.count > info.chars.length ? ' 👁️' : '' }}</span>
                    </div>
                    <div class="tone-chars">
                      {{ info.chars.join(' ') }}{{ info.count > info.chars.length ? '...' : '' }}
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="empty-state">
                暫無調值統計
              </div>
            </div>
          </div>
        </div>
      </aside>

      <!-- 主工作区 -->
      <main class="main-work-area">
        <!-- 文件信息栏 -->
        <div class="file-info-bar glass-panel">
          <div class="file-info-left">
            <span class="file-name">📁 {{ fileName }}</span>
            <span class="file-rows">{{ totalRows }} 行</span>
          </div>
          <button class="glass-button secondary small" @click="resetUpload">更換文件</button>
          <button class="glass-button small" @click="showHelpModal = true">
            ❓ 幫助
          </button>
          <!-- 模式切换 -->
          <div class="mode-tabs glass-panel">
            <button
                class="tab-btn"
                :class="{ active: currentMode === 'table' }"
                @click="switchMode('table')"
            >
              📊 表格視圖
            </button>
            <button
                class="tab-btn"
                :class="{ active: currentMode === 'command' }"
                @click="switchMode('command')"
            >
              💻 指令模式
            </button>
          </div>
        </div>



        <!-- 表格视图 -->
        <div v-show="currentMode === 'table'" class="table-view">
          <!-- 工具栏 -->
          <div class="table-toolbar glass-panel">
            <div class="table-stats">
              <span>錯誤數：<strong>{{ errorStats.total }}</strong></span>
              <span class="ml-2">待保存：<strong>{{ totalPendingChanges }}</strong></span>
              <span v-if="isEditMode" class="edit-hint">💡 雙擊單元格編輯</span>
            </div>
            <div class="table-actions">
              <button
                class="glass-button small"
                :class="{ active: isEditMode }"
                @click="toggleEditMode"
              >
                {{ isEditMode ? '👁️ 退出編輯' : '✏️ 進入編輯' }}
              </button>
              <button
                v-show="isEditMode"
                class="glass-button small primary"
                :disabled="totalPendingChanges === 0"
                @click="batchSave"
              >
                💾 保存修改 ({{ totalPendingChanges }})
              </button>
              <button
                v-show="isEditMode"
                class="glass-button small"
                @click="cancelEdit"
              >
                ❌ 取消
              </button>
              <button v-show="!isEditMode" class="glass-button small" @click="showBatchReplaceModal = true">
                🔄 批量替換
              </button>
              <button class="glass-button small" @click="toggleShowAll">
                {{ showingAll ? '👁️ 只顯示錯誤' : '👁️ 顯示全部' }}
              </button>
              <button v-show="!isEditMode" class="glass-button small" @click="downloadFile">
                ⬇️ 下載
              </button>
            </div>
          </div>

          <!-- 表格 -->
          <div class="table-container glass-panel custom-scrollbar">
            <table class="data-table">
              <thead>
                <tr>
                  <th width="60">行</th>
                  <th width="100">漢字</th>
                  <th width="200">音標</th>
                  <th width="80">聲調</th>
                  <th>解釋</th>
                  <th v-if="isEditMode" width="80">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="row in displayedTableData"
                  :key="row.row"
                  :data-row="row.row"
                  :class="{
                    'modified-row': pendingChanges.has(row.row),
                    'marked-for-delete': rowsToDelete.has(row.row)
                  }"
                >
                  <td>{{ row.row }}</td>
                  <td
                    :class="{
                      'error-cell': row.errors?.includes('nonSingleChar'),
                      'editable-cell': isEditMode
                    }"
                    @dblclick="isEditMode && editCell($event.target, row.row, 'char')"
                  >
                    {{ getPendingValue(row.row, 'char') || row.char || '' }}
                    <span v-if="row.errors?.includes('nonSingleChar')" class="error-indicator">❌</span>
                  </td>
                  <td
                    :class="{
                      'error-cell': row.errors?.includes('invalidIpa'),
                      'editable-cell': isEditMode
                    }"
                    @dblclick="isEditMode && editCell($event.target, row.row, 'ipa')"
                  >
                    {{ getPendingValue(row.row, 'ipa') || row.ipa || '' }}
                    <span v-if="row.errors?.includes('invalidIpa')" class="error-indicator">⚠️</span>
                  </td>
                  <td
                    :class="{
                      'error-cell': row.errors?.includes('missingTone'),
                      'editable-cell': isEditMode
                    }"
                    @dblclick="isEditMode && editCell($event.target, row.row, 'tone')"
                  >
                    {{ getPendingValue(row.row, 'tone') || row.tone || '' }}
                    <span v-if="row.errors?.includes('missingTone')" class="error-indicator">🔍</span>
                  </td>
                  <td
                    :class="{ 'editable-cell': isEditMode }"
                    @dblclick="isEditMode && editCell($event.target, row.row, 'note')"
                  >
                    {{ getPendingValue(row.row, 'note') || row.note || '' }}
                  </td>
                  <td v-if="isEditMode" class="action-cell">
                    <button
                      class="delete-btn-icon"
                      :class="{ 'delete-active': rowsToDelete.has(row.row) }"
                      @click="markForDelete(row.row)"
                      :title="rowsToDelete.has(row.row) ? '取消刪除' : '標記刪除'"
                    >
                      {{ rowsToDelete.has(row.row) ? '↩️' : '🗑️' }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 指令模式 -->
        <div v-show="currentMode === 'command'" class="command-view">
          <div class="command-panel glass-panel">
            <div class="command-header">
              <h3>💻 指令輸入</h3>
              <button class="glass-button small" @click="showHelpModal = true">
                ❓ 指令說明
              </button>
            </div>

            <textarea
              v-model="commandInput"
              class="command-textarea custom-scrollbar"
              placeholder="輸入指令，每行一條或用分號分隔

示例：
c-帥-好
i-帥-jat4
p-'-ʰ
r5>3
s22>33

多條指令用分號分隔：
c-帥-好; i-帥-jat4"
            ></textarea>

            <div class="command-actions">
              <button class="glass-button" @click="clearCommand">🗑️ 清空</button>
              <button class="glass-button primary" @click="executeCommand">▶️ 執行指令</button>
            </div>

            <!-- 执行结果 -->
            <div v-if="commandLog.length > 0" class="command-result glass-panel">
              <div class="result-header">
                <h4>📋 執行結果</h4>
                <button class="glass-button small" @click="clearCommandLog">清空</button>
              </div>
              <div class="result-log custom-scrollbar">
                <div
                  v-for="(log, index) in commandLog"
                  :key="index"
                  class="log-item"
                  :class="log.type"
                >
                  {{ log.message }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- 批量替换对话框 -->
    <teleport to="body">
      <div v-if="showBatchReplaceModal" class="modal-overlay" @click.self="showBatchReplaceModal = false">
        <div class="modal-content glass-panel">
          <div class="modal-header">
            <h3>🔄 批量替換</h3>
            <button class="close-btn" @click="showBatchReplaceModal = false">×</button>
          </div>

          <div class="modal-body">
            <div class="form-group">
              <label>替換類型</label>
              <select v-model="replaceType" class="glass-input">
                <option value="p">全表音標替換 (p-)</option>
                <option value="r">入聲調替換 (r*)</option>
                <option value="s">舒聲調替換 (s*)</option>
              </select>
            </div>

            <div v-if="replaceType === 'p'" class="form-group">
              <label>原字符</label>
              <input v-model="replaceFrom" type="text" class="glass-input" placeholder="例如：'" />
              <div class="hint">要替換的字符或字符串</div>
            </div>

            <div v-if="replaceType !== 'p'" class="form-group">
              <label>原調值</label>
              <input v-model="replaceFrom" type="text" class="glass-input" placeholder="例如：5" />
              <div class="hint">要替換的調值（1-4位數字）</div>
            </div>

            <div class="form-group">
              <label>{{ replaceType === 'p' ? '新字符' : '新調值' }}</label>
              <input
                v-model="replaceTo"
                type="text"
                class="glass-input"
                :placeholder="replaceType === 'p' ? '例如：ʰ' : '例如：2'"
              />
              <div class="hint">{{ replaceType === 'p' ? '替換後的字符或字符串' : '替換後的調值（1-4位數字）' }}</div>
            </div>

            <div v-if="replaceType !== 'p'" class="hint-box">
              <strong>{{ replaceType === 'r' ? '入聲調：' : '舒聲調：' }}</strong>
              {{
                replaceType === 'r'
                  ? '只替換以塞音結尾的音標（p, t, k, ʔ, b, d, g）'
                  : '只替換不以塞音結尾的音標'
              }}
            </div>

            <div class="form-group">
              <label>預覽命令</label>
              <input :value="commandPreview" type="text" class="glass-input" readonly style="background: rgba(0,0,0,0.1);" />
            </div>
          </div>

          <div class="modal-footer">
            <button class="glass-button secondary" @click="showBatchReplaceModal = false">取消</button>
            <button class="glass-button primary" @click="executeBatchReplace">🔄 執行替換</button>
          </div>
        </div>
      </div>
    </teleport>

    <!-- 帮助对话框 -->
    <teleport to="body">
      <div v-if="showHelpModal" class="modal-overlay" @click.self="showHelpModal = false">
        <div class="modal-content glass-panel help-modal">
          <div class="modal-header">
            <h3>❓ 使用幫助</h3>
            <button class="close-btn" @click="showHelpModal = false">×</button>
          </div>

          <div class="modal-body help-content custom-scrollbar">
            <div class="help-section">
              <h4>📋 文件要求</h4>
              <ul>
                <li>支持 .xlsx 和 .xls 格式</li>
                <li>必須包含"漢字"或"單字"列</li>
                <li>必須包含"音標"或"IPA"列</li>
                <li>可選包含"解釋"或"注釋"列</li>
              </ul>
            </div>

            <div class="help-section">
              <h4>🔍 檢查項目</h4>
              <ul>
                <li><strong>非漢字</strong>：漢字列應為單個字符</li>
                <li><strong>異常音標</strong>：包含非法字符或格式錯誤</li>
                <li><strong>缺聲調</strong>：音標末尾缺少數字聲調</li>
              </ul>
            </div>

            <div class="help-section">
              <h4>💻 指令格式</h4>
              <table class="help-table">
                <tr>
                  <th>指令</th>
                  <th>說明</th>
                  <th>示例</th>
                </tr>
                <tr>
                  <td><code>c-漢字-新字</code></td>
                  <td>替換漢字</td>
                  <td><code>c-帥-好</code></td>
                </tr>
                <tr>
                  <td><code>c-漢字-d</code></td>
                  <td>刪除行</td>
                  <td><code>c-帥-d</code></td>
                </tr>
                <tr>
                  <td><code>i-漢字-新音標</code></td>
                  <td>修改音標</td>
                  <td><code>i-帥-jat4</code></td>
                </tr>
                <tr>
                  <td><code>p-原-新</code></td>
                  <td>全表替換音標</td>
                  <td><code>p-'-ʰ</code></td>
                </tr>
                <tr>
                  <td><code>r{原}>{新}</code></td>
                  <td>只替換入聲的調值</td>
                  <td><code>r5>2</code></td>
                </tr>
                <tr>
                  <td><code>s{原}>{新}</code></td>
                  <td>只替換舒聲的調值</td>
                  <td><code>s22>33</code></td>
                </tr>
              </table>
              <p class="hint-text">💡 多條指令用分號分隔，例如：<code>c-帥-好; i-帥-jat4</code></p>
            </div>

            <div class="help-section">
              <h4>✏️ 編輯方式</h4>
              <ul>
                <li><strong>單元格編輯</strong>：雙擊表格單元格直接編輯</li>
                <li><strong>批量編輯</strong>：進入編輯模式，修改後統一保存</li>
                <li><strong>指令模式</strong>：批量處理多個修改</li>
              </ul>
            </div>
          </div>

          <div class="modal-footer">
            <button class="glass-button primary" @click="showHelpModal = false">知道了</button>
          </div>
        </div>
      </div>
    </teleport>

    <!-- 调值字符显示对话框 -->
    <teleport to="body">
      <div v-if="showToneCharsModal" class="modal-overlay" @click.self="showToneCharsModal = false">
        <div class="modal-content glass-panel">
          <div class="modal-header">
            <h3>📊 {{ toneCharsModalTitle }}</h3>
            <button class="close-btn" @click="showToneCharsModal = false">×</button>
          </div>

          <div class="modal-body">
            <div class="tone-chars-display">
              {{ toneCharsModalContent }}
            </div>
          </div>

          <div class="modal-footer">
            <button class="glass-button primary" @click="showToneCharsModal = false">關閉</button>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { api } from '@/utils/auth.js'
import { showSuccess, showError, showWarning, showConfirm } from '@/utils/message.js'

// 基本状态
const fileInput = ref(null)
const fileUploaded = ref(false)
const fileName = ref('')
const totalRows = ref(0)
const taskId = ref(null)
const isDragOver = ref(false)
const selectedFormat = ref('') // 文件格式类型

// 数据
const allData = ref([])
const errorData = ref([])  // 错误行的完整数据（用于表格显示）
const errorMetadata = ref([])  // 错误元数据（用于侧边栏）
const filteredData = ref([])

// UI状态
const currentMode = ref('table')
const sidebarCollapsed = ref(false)
const showingAll = ref(false)
const searchQuery = ref('')
const currentFilter = ref(null)
const errorStatsExpanded = ref(true)  // 错误列表展开状态

// 编辑状态
const isEditMode = ref(false)
const pendingChanges = ref(new Map())
const rowsToDelete = ref(new Set())

// 错误统计
const errorStats = ref({
  nonSingleChar: 0,
  invalidIpa: 0,
  missingTone: 0,
  total: 0
})

const errorStatsConfig = {
  nonSingleChar: { icon: '❌', label: '非漢字', type: 'error' },
  invalidIpa: { icon: '⚠️', label: '異常音標', type: 'warning' },
  missingTone: { icon: '🔍', label: '缺聲調', type: 'info' }
}

// 调值统计
const toneStats = ref(null)
const toneStatsExpanded = ref(true)

// 指令模式
const commandInput = ref('')
const commandLog = ref([])

// 对话框状态
const showBatchReplaceModal = ref(false)
const showHelpModal = ref(false)
const showToneCharsModal = ref(false)
const toneCharsModalTitle = ref('')
const toneCharsModalContent = ref('')

// 批量替换
const replaceType = ref('p')
const replaceFrom = ref('')
const replaceTo = ref('')

// 计算属性
const totalPendingChanges = computed(() => {
  return pendingChanges.value.size + rowsToDelete.value.size
})

const displayedErrors = computed(() => {
  // 侧边栏显示错误元数据，不是完整行数据
  if (currentFilter.value) {
    return errorMetadata.value.filter(e =>
      (e.error_type === currentFilter.value) || (e.type === currentFilter.value)
    )
  }

  if (searchQuery.value.trim()) {
    return errorMetadata.value.filter(e =>
      e.value?.includes(searchQuery.value.trim()) || e.char?.includes(searchQuery.value.trim())
    )
  }

  return errorMetadata.value
})

const displayedTableData = computed(() => {
  return showingAll.value
    ? (currentFilter.value ? filteredData.value : allData.value)
    : (currentFilter.value ? filteredData.value : errorData.value)
})

const sortedRuTones = computed(() => {
  if (!toneStats.value?.ru_tones) return []
  return Object.entries(toneStats.value.ru_tones).sort((a, b) => a[0].localeCompare(b[0]))
})

const sortedShuTones = computed(() => {
  if (!toneStats.value?.shu_tones) return []
  return Object.entries(toneStats.value.shu_tones).sort((a, b) => a[0].localeCompare(b[0]))
})

const commandPreview = computed(() => {
  if (replaceType.value === 'p') {
    if (replaceFrom.value || replaceTo.value) {
      return `p-${replaceFrom.value}-${replaceTo.value}`
    }
  } else {
    if (replaceFrom.value || replaceTo.value) {
      return `${replaceType.value}${replaceFrom.value}>${replaceTo.value}`
    }
  }
  return ''
})

// 文件处理
const handleDrop = (event) => {
  isDragOver.value = false
  const file = event.dataTransfer.files[0]
  if (file) {
    uploadFile(file)
  }
}

const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    uploadFile(file)
  }
}

const uploadFile = async (file) => {
  const allowedExts = ['.xlsx', '.xls', '.doc', '.docx', '.tsv']
  const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()

  if (!allowedExts.includes(ext)) {
    showError('請上傳支持的文件格式（.xlsx, .xls, .doc, .docx, .tsv）')
    return
  }

  if (file.size > 3 * 1024 * 1024) {
    showError('文件大小不得超過3MB')
    return
  }

  try {
    fileName.value = file.name

    const formData = new FormData()
    formData.append('file', file)

    // 添加格式类型参数（如果选择了）
    if (selectedFormat.value) {
      formData.append('format_type', selectedFormat.value)
    }

    const data = await api('/api/tools/check/upload', {
      method: 'POST',
      body: formData
    })

    taskId.value = data.task_id
    totalRows.value = data.total_rows || 0
    fileUploaded.value = true

    await analyzeFile()
  } catch (error) {
    showError('上傳失敗: ' + error.message)
  }
}

const analyzeFile = async () => {
  try {
    const data = await api(`/api/tools/check/analyze?task_id=${taskId.value}`, {
      method: 'POST'
    })

    // errorData存储错误元数据（用于侧边栏）
    const errorMetadata = data.errors || []

    // 更新统计
    errorStats.value = {
      nonSingleChar: data.error_stats?.nonSingleChar || 0,
      invalidIpa: data.error_stats?.invalidIpa || 0,
      missingTone: data.error_stats?.missingTone || 0,
      total: Object.values(data.error_stats || {}).reduce((a, b) => a + b, 0)
    }

    // 加载调值统计
    await loadToneStats()

    // 加载全部数据（用于"显示全部"功能）
    await loadAllData()

    // 加载错误行的完整数据（用于表格显示）
    await loadErrorRowsData(errorMetadata)
  } catch (error) {
    showError('分析失敗: ' + error.message)
  }
}

const loadToneStats = async () => {
  try {
    const data = await api('/api/tools/check/get_tone_stats', {
      method: 'POST',
      body: {
        task_id: taskId.value,
        include_all: true
      }
    })

    if (data.success && data.tone_stats) {
      toneStats.value = data.tone_stats
    }
  } catch (error) {
    console.error('加載調值統計失敗:', error)
  }
}

const loadAllData = async () => {
  try {
    const data = await api('/api/tools/check/get_data', {
      method: 'POST',
      body: {
        task_id: taskId.value,
        include_all: true
      }
    })

    if (data.success) {
      allData.value = data.data || []
    }
  } catch (error) {
    console.error('加載全部數據失敗:', error)
  }
}

const loadErrorRowsData = async (errors) => {
  try {
    // 保存错误元数据用于侧边栏
    errorMetadata.value = errors

    // 获取错误行的完整数据
    const data = await api('/api/tools/check/get_data', {
      method: 'POST',
      body: {
        task_id: taskId.value,
        include_all: false  // 只获取错误行
      }
    })

    if (data.success) {
      // 为每行添加错误信息
      const rowData = data.data || []

      // 按行号分组错误
      const errorsByRow = {}
      errors.forEach(error => {
        if (!errorsByRow[error.row]) {
          errorsByRow[error.row] = []
        }
        errorsByRow[error.row].push(error.error_type || error.type)
      })

      // 为每行数据添加错误数组
      rowData.forEach(row => {
        row.errors = errorsByRow[row.row] || []
      })

      errorData.value = rowData
      filteredData.value = rowData
    }
  } catch (error) {
    console.error('加載錯誤行數據失敗:', error)
  }
}

// UI操作
const resetUpload = async () => {
  const confirmed = await showConfirm('確定要更換文件？未保存的修改將丟失。')
  if (confirmed) {
    fileUploaded.value = false
    fileName.value = ''
    totalRows.value = 0
    taskId.value = null
    allData.value = []
    errorData.value = []
    errorMetadata.value = []
    filteredData.value = []
    errorStats.value = { nonSingleChar: 0, invalidIpa: 0, missingTone: 0, total: 0 }
    toneStats.value = null
    pendingChanges.value.clear()
    rowsToDelete.value.clear()
    isEditMode.value = false
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }
}

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

const switchMode = (mode) => {
  currentMode.value = mode
}

const toggleShowAll = () => {
  showingAll.value = !showingAll.value
}

const toggleToneStats = () => {
  toneStatsExpanded.value = !toneStatsExpanded.value
}

const toggleErrorStats = () => {
  errorStatsExpanded.value = !errorStatsExpanded.value
}

// 筛选功能
const filterErrors = (errorType) => {
  if (currentFilter.value === errorType) {
    currentFilter.value = null
    filteredData.value = errorData.value
  } else {
    currentFilter.value = errorType
    filteredData.value = errorData.value.filter(row =>
      row.errors?.includes(errorType)
    )
  }
}

const handleSearch = () => {
  const query = searchQuery.value.trim()
  if (!query) {
    filteredData.value = errorData.value
    currentFilter.value = null
    return
  }

  currentFilter.value = 'search'
  filteredData.value = errorData.value.filter(row =>
    row.char?.includes(query)
  )
}

const resetFilter = () => {
  searchQuery.value = ''
  currentFilter.value = null
  filteredData.value = errorData.value
}

// 跳转到行
const jumpToRow = (rowNumber) => {
  const row = document.querySelector(`tr[data-row="${rowNumber}"]`)
  if (row) {
    row.scrollIntoView({ behavior: 'smooth', block: 'center' })
    row.classList.add('highlight-row')
    setTimeout(() => {
      row.classList.remove('highlight-row')
    }, 2000)
  }
}

// 编辑功能
const toggleEditMode = () => {
  isEditMode.value = !isEditMode.value
  if (!isEditMode.value) {
    pendingChanges.value.clear()
    rowsToDelete.value.clear()
  }
}

const editCell = (target, row, field) => {
  if (target.querySelector('input')) return

  const originalValue = target.textContent.trim().replace(/[❌⚠️🔍]/g, '')
  const actualValue = getPendingValue(row, field) || originalValue

  const input = document.createElement('input')
  input.type = 'text'
  input.className = 'glass-input'
  input.value = actualValue
  input.style.cssText = 'width: 100%; padding: 4px 8px;'

  target.innerHTML = ''
  target.appendChild(input)
  input.focus()
  input.select()

  const save = () => {
    const newValue = input.value.trim()
    if (newValue !== actualValue) {
      if (!pendingChanges.value.has(row)) {
        pendingChanges.value.set(row, {})
      }
      pendingChanges.value.get(row)[field] = newValue
    }
    target.textContent = newValue
  }

  input.addEventListener('blur', save)
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      save()
    } else if (e.key === 'Escape') {
      target.textContent = actualValue
    }
  })
}

const markForDelete = (row) => {
  if (rowsToDelete.value.has(row)) {
    rowsToDelete.value.delete(row)
  } else {
    rowsToDelete.value.add(row)
  }
}

const getPendingValue = (row, field) => {
  return pendingChanges.value.get(row)?.[field]
}

const batchSave = async () => {
  const totalChanges = totalPendingChanges.value

  if (totalChanges === 0) {
    showWarning('沒有需要保存的更改')
    return
  }

  const confirmMsg = `確認保存？\n- 修改：${pendingChanges.value.size} 行\n- 刪除：${rowsToDelete.value.size} 行`
  const confirmed = await showConfirm(confirmMsg)
  if (!confirmed) {
    return
  }

  try {
    // 保存修改
    for (const [row, data] of pendingChanges.value) {
      await api('/api/tools/check/update_row', {
        method: 'POST',
        body: {
          task_id: taskId.value,
          row,
          data
        }
      })
    }

    // 批量删除
    if (rowsToDelete.value.size > 0) {
      await api('/api/tools/check/batch_delete', {
        method: 'POST',
        body: {
          task_id: taskId.value,
          rows: Array.from(rowsToDelete.value)
        }
      })
    }

    showSuccess(`保存成功：修改 ${pendingChanges.value.size} 行，刪除 ${rowsToDelete.value.size} 行`)

    // 清空并重新分析
    pendingChanges.value.clear()
    rowsToDelete.value.clear()
    isEditMode.value = false
    await analyzeFile()
  } catch (error) {
    showError('保存失敗: ' + error.message)
  }
}

const cancelEdit = async () => {
  if (totalPendingChanges.value > 0) {
    const confirmed = await showConfirm('放棄所有未保存的修改？')
    if (!confirmed) {
      return
    }
  }

  pendingChanges.value.clear()
  rowsToDelete.value.clear()
  isEditMode.value = false
}

// 指令模式
const executeCommand = async () => {
  const command = commandInput.value.trim()
  if (!command) {
    showWarning('請輸入指令')
    return
  }

  try {
    const data = await api('/api/tools/check/execute', {
      method: 'POST',
      body: {
        task_id: taskId.value,
        commands: command.split('\n').filter(c => c.trim())
      }
    })

    if (data.success) {
      commandLog.value = data.logs.map(log => ({
        type: log.includes('✅') || log.includes('成功') ? 'success' : 'error',
        message: log
      }))

      await analyzeFile()
    }
  } catch (error) {
    commandLog.value.push({
      type: 'error',
      message: '❌ 執行失敗: ' + error.message
    })
  }
}

const clearCommand = () => {
  commandInput.value = ''
}

const clearCommandLog = () => {
  commandLog.value = []
}

// 批量替换
const executeBatchReplace = async () => {
  if (!replaceFrom.value) {
    showWarning('請輸入原字符/調值')
    return
  }

  let command = ''
  if (replaceType.value === 'p') {
    command = `p-${replaceFrom.value}-${replaceTo.value}`
  } else {
    command = `${replaceType.value}${replaceFrom.value}>${replaceTo.value}`
  }

  try {
    const data = await api('/api/tools/check/execute', {
      method: 'POST',
      body: {
        task_id: taskId.value,
        commands: command.split('\n').filter(c => c.trim())
      }
    })

    if (data.success) {
      showSuccess('替換成功')
      showBatchReplaceModal.value = false
      replaceFrom.value = ''
      replaceTo.value = ''
      await analyzeFile()
    }
  } catch (error) {
    showError('替換失敗: ' + error.message)
  }
}

// 调值字符显示
const showAllChars = async (tone, info, toneType) => {
  if (info.count === info.chars.length) {
    return
  }

  try {
    const data = await api('/api/tools/check/get_data', {
      method: 'POST',
      body: {
        task_id: taskId.value,
        include_all: true
      }
    })

    if (data.success) {
      const RU_FINALS = new Set('ptkʔˀᵖᵏᵗbdg')
      const chars = []

      for (const row of data.data) {
        const ipa = row.ipa
        if (!ipa) continue

        const match = ipa.match(/[⁰¹²³⁴⁵⁶⁷⁸⁹]+$/)
        if (!match) continue

        const normalizedTone = match[0].replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g, m => '⁰¹²³⁴⁵⁶⁷⁸⁹'.indexOf(m).toString())
        if (normalizedTone !== tone) continue

        const lastChar = ipa[ipa.length - match[0].length - 1]
        const isRu = RU_FINALS.has(lastChar)

        if ((toneType === '入声' && isRu) || (toneType === '舒声' && !isRu)) {
          chars.push(row.char)
        }
      }

      toneCharsModalTitle.value = `${toneType} ${tone} (${chars.length}字)`
      toneCharsModalContent.value = chars.join(' ')
      showToneCharsModal.value = true
    }
  } catch (error) {
    showError('獲取數據失敗: ' + error.message)
  }
}

// 下载
const downloadFile = async () => {
  try {
    const blob = await api(`/api/tools/check/download/${taskId.value}`, {
      responseType: 'blob'
    })

    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'checked_' + fileName.value
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  } catch (error) {
    showError('下載失敗: ' + error.message)
  }
}

// 工具函数
const getErrorTypeLabel = (type) => {
  const labels = {
    nonSingleChar: '非單字',
    invalidIpa: '異常音標',
    missingTone: '缺聲調'
  }
  return labels[type] || type
}
</script>

<style scoped>
/* 基础布局 */
.check-tool-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.welcome-screen {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
@media (max-aspect-ratio: 1/1) {
  .welcome-screen {
    padding: 0;
  }

  .welcome-card {
    padding: 18px 20px;
    max-width: 100%;
  }

  .welcome-icon {
    font-size: 52px;
  }

  .welcome-features {
    margin: 16px 0;
  }

  .format-selector {
    margin: 12px 0;
    padding: 10px;
  }

  .upload-zone-drop {
    padding: 20px 24px;
  }

  .work-area {
    padding: 8px;
  }

  .sidebar {
    max-height: 280px;
  }

  .glass-container {
    padding: 18px 14px;
  }
}

.welcome-card {
  max-width: 600px;
  width: 100%;
  padding: 20px 30px;
  text-align: center;
}

.welcome-icon {
  font-size: 64px;
}

.welcome-features {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 24px 0;
  text-align: left;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 12px;
}

.feature-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(52, 199, 89, 0.2);
  border-radius: 50%;
  color: #34c759;
  font-weight: 700;
}

.format-selector {
  margin: 10px 0;
  padding: 8px;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 16px;
  text-align: left;
}

.format-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #0b2540;
  margin-bottom: 12px;
}

.format-options {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.format-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  color: rgba(11, 37, 64, 0.85);
}

.format-option:hover {
  background: rgba(255, 255, 255, 0.8);
  transform: translateY(-1px);
}

.format-option input[type="radio"] {
  margin: 0;
  cursor: pointer;
}

.format-option input[type="radio"]:checked + span {
  font-weight: 600;
  color: #007aff;
}

.work-area {
  height: 100%;
  display: flex;
  gap: 16px;
  padding: 20px;
  overflow: hidden;
}

/* 侧边栏 */
.sidebar {
  width: 280px;
  min-width: 280px;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.sidebar.collapsed {
  width: 60px;
  min-width: 60px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.sidebar-header h3 {
  font-size: 16px;
  margin: 0;
  white-space: nowrap;
}

.collapse-btn {
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.3);
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.collapse-btn:hover {
  background: rgba(255, 255, 255, 0.5);
}

.sidebar-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 侧边栏分区 */
.sidebar-section {
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 12px;
  overflow: hidden;
  transition: flex 0.3s ease;
}

/* 两个都展开时各占一半 */
.sidebar-section:not(.collapsed) {
  flex: 1;
  min-height: 0;
}

/* 收起时只占标题高度 */
.sidebar-section.collapsed {
  flex: 0 0 auto;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background: rgba(0, 122, 255, 0.1);
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.section-header:hover {
  background: rgba(0, 122, 255, 0.15);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 6px;
}

.toggle-icon {
  font-size: 12px;
  transition: transform 0.2s ease;
}

.section-content {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 12px;
  min-height: 0;
}

/* 错误统计 */
.error-stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.stat-item:hover {
  background: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
}

.stat-item .badge {
  font-size: 18px;
}

.stat-item .label {
  flex: 1;
  font-size: 13px;
}

.stat-item .count {
  font-weight: 700;
  font-size: 16px;
}

.stat-item.error .count {
  color: #ff3b30;
}

.stat-item.warning .count {
  color: #ff9500;
}

.stat-item.info .count {
  color: #007aff;
}

/* 调值统计 */
.tone-stats-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
}

.empty-state {
  padding: 20px;
  text-align: center;
  color: #666;
  font-size: 13px;
}

.tone-section-title {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 8px;
  flex-shrink: 0;
}

.tone-section-title.ru {
  color: #ff3b30;
}

.tone-section-title.shu {
  color: #007aff;
}

.tone-item {
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;
}

.tone-item.ru {
  background: rgba(255, 59, 48, 0.1);
}

.tone-item.ru:hover {
  background: rgba(255, 59, 48, 0.2);
}

.tone-item.shu {
  background: rgba(0, 122, 255, 0.1);
}

.tone-item.shu:hover {
  background: rgba(0, 122, 255, 0.2);
}

.tone-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.tone-value {
  font-weight: 600;
}

.tone-count {
  color: #666;
  font-size: 11px;
}

.tone-chars {
  color: #666;
  font-size: 11px;
  line-height: 1.4;
}

/* 筛选 */
.filter-section {
  display: flex;
  flex-direction: row;
  gap: 8px;
  flex-shrink: 0;
  align-items: center;
}

.search-input {
  flex: 1;
  min-width: 0;
}


/* 错误列表 */
.error-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow-y: auto;
}

.error-item {
  padding: 8px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 12px;
  display: flex;
  gap: 10px;
  justify-content: center;

}
.error-item > * {
  flex: 1;           /* 強制每個元素佔據相等的剩餘空間 */
  text-align: center; /* 讓文字在各自平分的區塊內居中 */
}

.error-item:hover {
  background: rgba(255, 255, 255, 0.5);
}

.error-row-num {
  font-size: 10px;
  color: #666;
  margin-bottom: 2px;
}

.error-char {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 2px;
}

.error-type-badge {
  display: inline-block;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
}

.error-type-badge.nonSingleChar {
  background: rgba(255, 59, 48, 0.15);
  color: #ff3b30;
}

.error-type-badge.invalidIpa {
  background: rgba(255, 149, 0, 0.15);
  color: #ff9500;
}

.error-type-badge.missingTone {
  background: rgba(0, 122, 255, 0.15);
  color: #007aff;
}

.error-more {
  padding: 8px;
  text-align: center;
  font-size: 12px;
  color: #666;
}

/* 主工作区 */
.main-work-area {
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow: hidden;
}

.file-info-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
}

.file-info-left {
  display: flex;
  align-items: center;
  flex-direction: column;
}

.file-name {
  font-weight: 600;
  font-size: 14px;
  white-space: nowrap;
}

.file-rows {
  font-size: 13px;
  color: #666;
}

/* 模式切换 */
.mode-tabs {
  display: flex;
  gap: 8px;
  padding: 8px;
}

.tab-btn {
  flex: 1;
  padding: 10px 20px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 10px;
  color: rgba(11, 37, 64, 0.7);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.tab-btn.active {
  background: rgba(0, 122, 255, 0.7);
  backdrop-filter: blur(14px);
  border-color: rgba(0, 122, 255, 0.6);
  color: white;
  box-shadow: 0 4px 20px rgba(0, 122, 255, 0.3);
}

/* 表格视图 */
.table-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow: hidden;
}

.table-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
}

.table-stats {
  display: flex;
  gap: 16px;
  font-size: 13px;
  align-items: center;
  flex-wrap: wrap;
}

.table-stats strong {
  color: #007aff;
  font-weight: 700;
}

.edit-hint {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: rgba(0, 122, 255, 0.1);
  border-radius: 8px;
  font-size: 12px;
  color: #007aff;
  font-weight: 500;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.02);
  }
}

.ml-2 {
  margin-left: 8px;
}

.table-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.table-container {
  flex: 1;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.data-table thead {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 10;
}

.data-table th,
.data-table td {
  padding: 10px 12px;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
}

.data-table th {
  font-weight: 600;
  color: #0b2540;
}

.data-table tbody tr {
  transition: background 0.2s ease;
}

.data-table tbody tr:hover {
  background: rgba(0, 122, 255, 0.05);
}

.data-table tbody tr.modified-row {
  background: rgba(255, 204, 0, 0.1);
}

.data-table tbody tr.marked-for-delete {
  background: rgba(255, 59, 48, 0.1);
  text-decoration: line-through;
}

.data-table tbody tr.highlight-row {
  background: rgba(0, 122, 255, 0.2);
  animation: highlight 2s ease;
}

@keyframes highlight {
  0%, 100% { background: rgba(0, 122, 255, 0.05); }
  50% { background: rgba(0, 122, 255, 0.3); }
}

.error-cell {
  position: relative;
}

.editable-cell {
  cursor: pointer;
  position: relative;
  background: rgba(0, 122, 255, 0.02);
  border: 1px dashed rgba(0, 122, 255, 0.2) !important;
  transition: all 0.2s ease;
}

.editable-cell:hover {
  background: rgba(0, 122, 255, 0.08);
  border-color: rgba(0, 122, 255, 0.4) !important;
}

.editable-cell:hover::after {
  content: '✏️';
  position: absolute;
  right: 4px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 10px;
  opacity: 0.6;
}

.error-indicator {
  margin-left: 4px;
  font-size: 12px;
}

/* 删除按钮 */
.action-cell {
  text-align: center;
}

.delete-btn-icon {
  padding: 4px 8px;
  background: rgba(255, 59, 48, 0.1);
  border: 1px solid rgba(255, 59, 48, 0.3);
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.delete-btn-icon:hover {
  background: rgba(255, 59, 48, 0.2);
  transform: scale(1.1);
}

.delete-btn-icon.delete-active {
  background: rgba(52, 199, 89, 0.2);
  border-color: rgba(52, 199, 89, 0.5);
}

.delete-btn-icon.delete-active:hover {
  background: rgba(52, 199, 89, 0.3);
}

/* 指令视图 */
.command-view {
  flex: 1;
  overflow-y: auto;
}

.command-panel {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.command-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.command-header h3 {
  margin: 0;
  font-size: 18px;
}

.command-textarea {
  min-height: 200px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 16px;
  color: #0b2540;
  font-size: 14px;
  font-family: 'SF Mono', Monaco, monospace;
  resize: vertical;
  transition: all 0.2s ease;
}

.command-textarea:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.7);
  border-color: rgba(0, 122, 255, 0.5);
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

.command-actions {
  display: flex;
  gap: 12px;
}

.command-result {
  padding: 16px;
  max-height: 300px;
}

.result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.result-header h4 {
  margin: 0;
  font-size: 14px;
}

.result-log {
  max-height: 200px;
  overflow-y: auto;
}

.log-item {
  padding: 8px 12px;
  margin-bottom: 8px;
  border-radius: 8px;
  font-size: 13px;
  font-family: 'SF Mono', Monaco, monospace;
}

.log-item.success {
  background: rgba(52, 199, 89, 0.1);
  color: #34c759;
}

.log-item.error {
  background: rgba(255, 59, 48, 0.1);
  color: #ff3b30;
}

/* 通用样式 */
.glass-container {
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(25px) saturate(180%);
  -webkit-backdrop-filter: blur(25px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 30px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.1);
}

.glass-panel {
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 16px;
}

.glass-button {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 10px;
  color: #0b2540;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.glass-button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.6);
  transform: translateY(-1px);
}

.glass-button.primary {
  background: linear-gradient(135deg, rgba(0, 122, 255, 0.8), rgba(0, 122, 255, 0.6));
  color: white;
  border-color: rgba(0, 122, 255, 0.6);
}

.glass-button.primary:hover:not(:disabled) {
  background: linear-gradient(135deg, rgba(0, 122, 255, 0.9), rgba(0, 122, 255, 0.7));
  box-shadow: 0 4px 20px rgba(0, 122, 255, 0.3);
}

.glass-button.secondary {
  background: rgba(255, 255, 255, 0.5);
}

.glass-button.small {
  padding: 6px 12px;
  font-size: 12px;
}

.glass-button.active {
  background: rgba(0, 122, 255, 0.2);
  border-color: rgba(0, 122, 255, 0.5);
}

.glass-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.glass-input {
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 8px;
  color: #0b2540;
  font-size: 13px;
  transition: all 0.2s ease;
}

.glass-input:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.8);
  border-color: rgba(0, 122, 255, 0.5);
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

.title {
  font-size: 28px;
  font-weight: 600;
  color: #0b2540;
  margin: 0 0 8px 0;
}

.subtitle {
  font-size: 14px;
  color: rgba(11, 37, 64, 0.7);
  margin: 0 0 24px 0;
}

.upload-zone-drop {
  padding: 20px 40px;
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(10px);
  border: 2px dashed rgba(0, 122, 255, 0.3);
  border-radius: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.upload-zone-drop:hover,
.upload-zone-drop.drag-over {
  background: rgba(0, 122, 255, 0.05);
  border-color: rgba(0, 122, 255, 0.6);
  transform: scale(1.02);
}

.upload-icon-large {
  font-size: 48px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.upload-text {
  font-size: 16px;
  font-weight: 500;
  color: #0b2540;
  margin: 0;
}

.hint-text {
  font-size: 12px;
  color: rgba(11, 37, 64, 0.6);
  margin: 0;
}

/* 模态框 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  width: min(90vw, 600px);
  max-height: 85vh;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(30px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 24px;
  box-shadow: 0 16px 64px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-content.help-modal {
  width: min(90vw, 800px);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.5);
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
}

.close-btn {
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 8px;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(255, 59, 48, 0.7);
  color: white;
}

.modal-body {
  flex: 1;
  padding: 20px 24px;
  overflow-y: auto;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.5);
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #0b2540;
}

.hint {
  margin-top: 4px;
  font-size: 11px;
  color: #666;
}

.hint-box {
  padding: 12px;
  background: rgba(0, 122, 255, 0.1);
  border-radius: 8px;
  font-size: 12px;
  color: #666;
}

/* 帮助内容 */
.help-content {
  max-height: 60vh;
}

.help-section {
  margin-bottom: 24px;
}

.help-section h4 {
  margin: 0 0 12px 0;
  font-size: 15px;
  color: #0b2540;
}

.help-section ul {
  margin: 0;
  padding-left: 20px;
  font-size: 13px;
  line-height: 1.8;
}

.help-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  margin: 12px 0;
}

.help-table th,
.help-table td {
  padding: 8px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  text-align: left;
}

.help-table th {
  background: rgba(0, 122, 255, 0.1);
  font-weight: 600;
}

.help-table code {
  background: rgba(0, 122, 255, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'SF Mono', Monaco, monospace;
  font-size: 11px;
}

.hint-text {
  font-size: 12px;
  color: #666;
}

.tone-chars-display {
  font-size: 16px;
  line-height: 2;
  word-break: break-all;
}

/* 滚动条 */
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0, 122, 255, 0.3);
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 122, 255, 0.5);
}


@media (max-aspect-ratio: 1/1)  {
  .work-area {
    padding: 10px;
  }

  .glass-container {
    padding: 20px 16px;
    border-radius: 20px;
  }

  .header-section {
    padding-bottom: 16px;
  }

  .title {
    font-size: 22px;
  }

  .subtitle {
    font-size: 13px;
  }

  .format-selector {
    margin: 0;
    padding: 6px;
  }

  .format-label {
    font-size: 13px;
    margin-bottom: 10px;
  }

  .format-options {
    gap: 8px;
  }

  .format-option {
    padding: 6px 12px;
    font-size: 13px;
  }

  .welcome-screen {
    padding: 10px;
  }

  .welcome-card {
    padding: 20px 16px;
    max-width: 100%;
  }

  .welcome-icon {
    font-size: 48px;
  }

  .welcome-features {
    margin: 16px 0;
    gap: 6px;
  }

  .feature-item {
    padding: 8px 10px;
    font-size: 13px;
    gap: 10px;
  }

  .feature-icon {
    width: 20px;
    height: 20px;
    font-size: 12px;
  }

  .upload-zone-drop {
    padding: 24px 20px;
    border-radius: 20px;
  }

  .upload-icon-large {
    font-size: 48px;
  }

  .upload-text {
    font-size: 16px;
  }

  .hint-text {
    font-size: 12px;
  }

  .upload-section {
    padding: 16px;
  }

  .upload-zone {
    padding: 24px 20px;
  }

  .upload-icon {
    font-size: 48px;
  }

  .upload-text {
    font-size: 15px;
  }

  .upload-hint {
    font-size: 12px;
  }

  .analyze-btn {
    padding: 14px 28px;
    font-size: 15px;
  }

  .sidebar {
    width: 100%;
    max-height: 300px;
    padding: 12px;
  }

  .sidebar-section {
    min-height: 120px;
  }

  .section-header {
    padding: 10px;
  }

  .section-title {
    font-size: 14px;
  }

  .section-content {
    padding: 10px;
  }

  .error-stats {
    gap: 8px;
    padding: 10px;
  }

  .filter-section {
    flex-direction: column;
    gap: 6px;
  }

  .search-input {
    width: 100%;
  }

  .filter-section .glass-button {
    width: 100%;
    padding: 8px 12px;
  }

  .glass-button.small {
    padding: 8px 12px;
    font-size: 12px;
  }

  .stat-item {
    font-size: 12px;
    padding: 8px 12px;
  }

  .error-search {
    padding: 8px 12px;
    font-size: 13px;
  }

  .error-list {
    gap: 6px;
  }

  .error-item {
    padding: 10px;
    font-size: 12px;
  }

  .tone-stats-grid {
    gap: 10px;
  }

  .tone-card {
    padding: 10px;
  }

  .tone-label {
    font-size: 12px;
  }

  .tone-count {
    font-size: 16px;
  }

  .table-toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
    padding: 12px;
  }

  .table-stats {
    gap: 10px;
    font-size: 12px;
  }

  .edit-hint {
    font-size: 11px;
    padding: 3px 8px;
  }

  .mode-indicator {
    font-size: 13px;
    padding: 8px 14px;
  }

  .table-actions {
    flex-wrap: wrap;
    gap: 8px;
  }

  .toolbar-btn {
    padding: 10px 16px;
    font-size: 13px;
    white-space: nowrap;
  }

  .table-container {
    border-radius: 12px;
  }

  .data-table {
    font-size: 11px;
  }

  .data-table th,
  .data-table td {
    padding: 6px 8px;
  }

  .editable-cell {
    border: 1px dashed rgba(0, 122, 255, 0.3) !important;
    background: rgba(0, 122, 255, 0.05);
  }

  .editable-cell::after {
    content: '✏️';
    position: absolute;
    right: 2px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 8px;
    opacity: 0.5;
  }

  .error-badge {
    font-size: 10px;
    padding: 2px 6px;
  }

  .delete-btn-icon {
    font-size: 16px;
  }

  /* 编辑对话框移动端适配 */
  .edit-dialog-overlay {
    padding: 10px;
  }

  .edit-dialog {
    width: calc(100vw - 20px);
    max-width: 100%;
    border-radius: 16px;
  }

  .dialog-header {
    padding: 16px;
  }

  .dialog-title {
    font-size: 18px;
  }

  .dialog-body {
    padding: 16px;
    gap: 16px;
  }

  .form-group label {
    font-size: 13px;
  }

  .form-input,
  .form-textarea {
    padding: 10px 12px;
    font-size: 14px;
  }

  .dialog-footer {
    padding: 12px 16px;
    gap: 8px;
  }

  .dialog-btn {
    flex: 1;
    padding: 12px;
  }

  /* 批量替换对话框移动端适配 */
  .batch-replace-dialog {
    width: calc(100vw - 20px);
    max-width: 100%;
  }

  .replace-type-tabs {
    padding: 12px 16px;
    gap: 6px;
    overflow-x: auto;
  }

  .replace-tab {
    padding: 8px 12px;
    font-size: 13px;
    white-space: nowrap;
  }

  /* 命令面板移动端适配 */
  .command-input-container {
    padding: 12px;
  }

  .command-input {
    padding: 10px 12px;
    font-size: 14px;
  }

  .command-buttons {
    gap: 6px;
  }

  .cmd-btn {
    padding: 8px 12px;
    font-size: 12px;
  }

  .command-output {
    padding: 12px;
    font-size: 12px;
  }
}

/* 额外的小屏幕适配 */
@media (max-width: 480px) {
  .glass-container {
    padding: 16px 12px;
  }

  .welcome-screen {
    padding: 5px;
  }

  .welcome-card {
    padding: 16px 12px;
  }

  .welcome-icon {
    font-size: 40px;
  }

  .title {
    font-size: 20px;
  }

  .subtitle {
    font-size: 12px;
  }

  .welcome-features {
    margin: 12px 0;
    gap: 4px;
  }

  .feature-item {
    padding: 6px 8px;
    font-size: 12px;
    gap: 8px;
  }

  .feature-icon {
    width: 18px;
    height: 18px;
    font-size: 11px;
  }

  .format-selector {
    padding: 6px;
    margin: 8px 0;
  }

  .format-label {
    font-size: 12px;
  }

  .format-options {
    gap: 6px;
  }

  .format-option {
    padding: 5px 10px;
    font-size: 12px;
  }

  .upload-zone-drop {
    padding: 20px 16px;
  }

  .upload-icon-large {
    font-size: 40px;
  }

  .upload-text {
    font-size: 15px;
  }

  .hint-text {
    font-size: 11px;
  }

  .sidebar {
    max-height: 250px;
    padding: 10px;
  }

  .sidebar-section {
    min-height: 100px;
  }

  .section-header {
    padding: 8px;
  }

  .section-title {
    font-size: 13px;
  }

  .section-content {
    padding: 8px;
  }

  .error-stats {
    padding: 8px;
  }

  .stat-item {
    padding: 6px 10px;
    font-size: 11px;
  }

  .filter-section {
    gap: 4px;
  }

  .search-input {
    padding: 6px 10px;
    font-size: 12px;
  }

  .filter-section .glass-button {
    padding: 6px 12px;
    font-size: 12px;
  }

  .error-item {
    padding: 8px;
    font-size: 11px;
    gap: 6px;
  }

  .tone-section-title {
    font-size: 12px;
  }

  .tone-item {
    padding: 8px;
  }

  .tone-value {
    font-size: 12px;
  }

  .tone-count {
    font-size: 11px;
  }

  .tone-chars {
    font-size: 10px;
  }

  .table-stats {
    gap: 8px;
    font-size: 11px;
  }

  .edit-hint {
    font-size: 10px;
    padding: 2px 6px;
  }

  .data-table {
    font-size: 10px;
  }

  .data-table th,
  .data-table td {
    padding: 4px 6px;
  }

  .editable-cell::after {
    font-size: 7px;
    right: 1px;
  }

  .toolbar-btn {
    padding: 8px 12px;
    font-size: 12px;
  }

  .mode-indicator {
    font-size: 12px;
    padding: 6px 12px;
  }
}

</style>

<template>
  <div class="jyut2ipa-container">
    <div class="glass-container">
      <!-- 头部区域 -->
      <div class="header-section">
        <h2 class="title">粵拼轉IPA工具</h2>
        <p class="subtitle">表內需要有“粵拼”列</p>
      </div>

      <!-- 上传区域 -->
      <div class="upload-area" v-if="!processing && !completed">
        <div
          class="upload-zone"
          :class="{ 'drag-over': isDragOver }"
          @click="$refs.fileInput.click()"
          @dragover.prevent="isDragOver = true"
          @dragleave.prevent="isDragOver = false"
          @drop.prevent="handleDrop"
        >
          <input
            type="file"
            ref="fileInput"
            accept=".xlsx,.xls"
            @change="handleFileSelect"
            style="display: none"
          />
          <div class="upload-icon">📄</div>
          <h3 class="upload-title">點擊上傳或拖拽文件到此處</h3>
          <p class="upload-hint">支持 .xlsx 和 .xls 格式</p>
        </div>

        <!-- 说明和配置 -->
        <div class="info-section">
          <p class="info-text">支持粵拼格式（例如：jyut6ping3），可轉換聲母、韻母、聲調及完整IPA</p>

          <!-- 配置按钮卡片 -->
          <div class="config-card" @click="showConfigModal = true">
            <div class="config-icon">⚙️</div>
            <div class="config-content">
              <div class="config-title">自定義轉換規則</div>
              <div class="config-desc">配置聲母、韻母、韻尾、聲調對照表</div>
            </div>
            <div class="config-arrow">→</div>
          </div>
        </div>
      </div>

      <!-- 处理中状态 -->
      <div class="processing-area" v-if="processing">
        <div class="processing-icon">
          <div class="spinner"></div>
        </div>
        <h3 class="processing-title">正在處理中...</h3>
        <p class="processing-text">{{ processingText }}</p>

        <div class="progress-bar-container">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: progress + '%' }"></div>
          </div>
          <div class="progress-text">{{ progress }}%</div>
        </div>

        <div class="processing-stats" v-if="stats.total > 0">
          <div class="stat-item">
            <span class="stat-label">總行數：</span>
            <span class="stat-value">{{ stats.total }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">已處理：</span>
            <span class="stat-value">{{ stats.processed }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">成功：</span>
            <span class="stat-value success">{{ stats.success }}</span>
          </div>
        </div>
      </div>

      <!-- 完成状态 -->
      <div class="complete-area" v-if="completed">
        <div class="complete-icon">✅</div>
        <h3 class="complete-title">轉換完成！</h3>
        <p class="complete-text">請在5分鐘內下載</p>

<!--        <div class="result-stats">-->
<!--          <div class="result-card">-->
<!--            <div class="result-number">{{ stats.total }}</div>-->
<!--            <div class="result-label">總行數</div>-->
<!--          </div>-->
<!--          <div class="result-card">-->
<!--            <div class="result-number success">{{ stats.success }}</div>-->
<!--            <div class="result-label">成功轉換</div>-->
<!--          </div>-->
<!--          <div class="result-card" v-if="stats.failed > 0">-->
<!--            <div class="result-number error">{{ stats.failed }}</div>-->
<!--            <div class="result-label">失敗</div>-->
<!--          </div>-->
<!--        </div>-->

        <div class="action-buttons">
          <button class="glass-button primary large" @click="downloadResult">
            <span class="icon">⬇️</span>
            <span>下載結果文件</span>
          </button>
          <button class="glass-button secondary" @click="reset">
            <span class="icon">🔄</span>
            <span>重新開始</span>
          </button>
        </div>

        <!-- 预览区域 -->
        <div class="preview-section" v-if="previewData.length > 0">
          <h4 class="preview-title">轉換預覽（前10行）</h4>
          <div class="preview-table-wrapper custom-scrollbar">
            <table class="preview-table">
              <thead>
                <tr>
                  <th>原文</th>
                  <th>粵拼</th>
                  <th>IPA</th>
                  <th>聲母</th>
                  <th>韻母</th>
                  <th>聲調</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, index) in previewData" :key="index">
                  <td>{{ row.char }}</td>
                  <td>{{ row.jyutping }}</td>
                  <td class="ipa-text">{{ row.ipa }}</td>
                  <td>{{ row.initial }}</td>
                  <td>{{ row.final }}</td>
                  <td>{{ row.tone }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- 配置模态框 -->
    <transition name="modal">
      <div class="modal-overlay" v-if="showConfigModal" @click.self="showConfigModal = false">
        <div class="modal-content large-modal">
          <div class="modal-header">
            <div class="header-left">
              <h3 class="modal-title">⚙️ 對照表配置</h3>
              <div class="header-stats">
                <span class="stat-inline">總規則數：<strong>{{ totalRules }}</strong></span>
                <span class="stat-inline">已啟用：<strong class="success">{{ enabledRules }}</strong></span>
                <span class="stat-inline">已禁用：<strong class="disabled">{{ disabledRules }}</strong></span>
              </div>
            </div>
            <div class="header-actions">
              <button class="icon-btn" @click="exportConfig" title="導出配置">📤</button>
              <button class="icon-btn" @click="importConfig" title="導入配置">📥</button>
              <button class="close-btn" @click="showConfigModal = false">✕</button>
            </div>
          </div>

          <!-- 标签页 -->
          <div class="config-tabs">
            <button
              v-for="tab in tabs"
              :key="tab.key"
              class="config-tab"
              :class="{ active: currentTab === tab.key }"
              @click="currentTab = tab.key"
            >
              {{ tab.label }}
            </button>
          </div>

          <div class="modal-body custom-scrollbar">
            <!-- 规则表格 -->
            <div class="rules-table-container">
              <table class="rules-table">
                <thead>
                  <tr>
                    <th width="50">序號</th>
                    <th width="150">原粵拼</th>
                    <th width="150">ipa</th>
                    <th width="100">分類</th>
                    <th width="80">啟用</th>
                    <th width="100">操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(rule, index) in filteredRules" :key="index">
                    <td>{{ index + 1 }}</td>
                    <td>
                      <input
                        v-model="rule.to_replace"
                        class="table-input"
                        @input="updateStats"
                      />
                    </td>
                    <td>
                      <input
                        v-model="rule.replacement"
                        class="table-input"
                        @input="updateStats"
                      />
                    </td>
                    <td>
                      <span class="category-badge" :class="'cat-' + rule.category">
                        {{ getCategoryName(rule.category) }}
                      </span>
                    </td>
                    <td>
                      <label class="toggle-switch">
                        <input
                          type="checkbox"
                          v-model="rule.enabled"
                          @change="updateStats"
                        />
                        <span class="toggle-slider"></span>
                      </label>
                    </td>
                    <td>
                      <button class="btn-delete" @click="deleteRule(rule)" title="刪除">
                        🗑️
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- 添加规则按钮 -->
            <button class="btn-add-rule" @click="addNewRule">
              ➕ 添加新規則
            </button>
          </div>

          <div class="modal-footer">
            <button class="glass-button secondary" @click="resetConfigConfirm">🔄 重置為默認</button>
            <button class="glass-button primary" @click="saveConfig">💾 保存配置</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- 文件导入input -->
    <input
      type="file"
      ref="importInput"
      accept=".json"
      style="display: none"
      @change="handleImportFile"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  uploadJyutFile,
  processJyut2Ipa,
  getJyut2IpaProgress,
  downloadJyut2IpaResult
} from '@/api/tools/index.js'
import { userStore } from '@/store/store.js'
import { showSuccess, showError, showWarning, showConfirm } from '@/utils/message.js'

const router = useRouter()
const fileName = ref('')
const fileInput = ref(null)
const importInput = ref(null)
const isDragOver = ref(false)
const processing = ref(false)
const completed = ref(false)
const progress = ref(0)
const processingText = ref('準備上傳...')
const showConfigModal = ref(false)
const currentTab = ref('wf')

const stats = reactive({
  total: 0,
  processed: 0,
  success: 0,
  failed: 0
})

const previewData = ref([])

// 默认规则（从default-rules.js迁移）
const DEFAULT_RULES = [
  // 韵腹 (wf)
  { to_replace: 'aa', replacement: 'a', category: 'wf', enabled: true },
  { to_replace: 'a', replacement: 'ɐ', category: 'wf', enabled: true },
  { to_replace: 'e', replacement: 'ɛ', category: 'wf', enabled: true },
  { to_replace: 'ea', replacement: 'ə', category: 'wf', enabled: true },
  { to_replace: 'uu', replacement: 'ʊ', category: 'wf', enabled: true },
  { to_replace: 'oe', replacement: 'œ', category: 'wf', enabled: true },
  { to_replace: 'eo', replacement: 'ɵ', category: 'wf', enabled: true },
  { to_replace: 'y', replacement: 'y', category: 'wf', enabled: true },
  { to_replace: 'o', replacement: 'ɔ', category: 'wf', enabled: true },
  { to_replace: 'ii', replacement: 'ɪ', category: 'wf', enabled: true },
  { to_replace: 'or', replacement: 'ɤ', category: 'wf', enabled: true },
  { to_replace: 'ar', replacement: 'ɑ', category: 'wf', enabled: true },
  { to_replace: 'dd', replacement: 'ɗ', category: 'wf', enabled: true },

  // 声母 (sm)
  { to_replace: 'ng', replacement: 'ŋ', category: 'sm', enabled: true },
  { to_replace: 'nj', replacement: 'ȵ', category: 'sm', enabled: true },
  { to_replace: 'sl', replacement: 'ɬ', category: 'sm', enabled: true },
  { to_replace: 'th', replacement: 'θ', category: 'sm', enabled: true },
  { to_replace: 'bb', replacement: 'ɓ', category: 'sm', enabled: true },
  { to_replace: 'dd', replacement: 'ɗ', category: 'sm', enabled: true },
  { to_replace: 'zh', replacement: 'ʧ', category: 'sm', enabled: true },
  { to_replace: 'ch', replacement: 'ʧʰ', category: 'sm', enabled: true },
  { to_replace: 'sh', replacement: 'ʃ', category: 'sm', enabled: true },
  { to_replace: 'zj', replacement: 'ʨ', category: 'sm', enabled: true },
  { to_replace: 'cj', replacement: 'ʨʰ', category: 'sm', enabled: true },
  { to_replace: 'sj', replacement: 'ɕ', category: 'sm', enabled: true },
  { to_replace: 'q', replacement: 'ʔ', category: 'sm', enabled: true },
  { to_replace: 'c', replacement: 'ʦʰ', category: 'sm', enabled: true },
  { to_replace: 'z', replacement: 'ʦ', category: 'sm', enabled: true },
  { to_replace: 'd', replacement: 't', category: 'sm', enabled: true },
  { to_replace: 't', replacement: 'tʰ', category: 'sm', enabled: true },
  { to_replace: 'g', replacement: 'k', category: 'sm', enabled: true },
  { to_replace: 'k', replacement: 'kʰ', category: 'sm', enabled: true },
  { to_replace: 'b', replacement: 'p', category: 'sm', enabled: true },
  { to_replace: 'p', replacement: 'pʰ', category: 'sm', enabled: true },

  // 声调 (jd)
  { to_replace: '1', replacement: '⁵⁵', category: 'jd', enabled: true },
  { to_replace: '2', replacement: '³⁵', category: 'jd', enabled: true },
  { to_replace: '3', replacement: '³³', category: 'jd', enabled: true },
  { to_replace: '4', replacement: '²¹', category: 'jd', enabled: true },
  { to_replace: '5', replacement: '¹³', category: 'jd', enabled: true },
  { to_replace: '6', replacement: '²²', category: 'jd', enabled: true },
  { to_replace: '7', replacement: '⁵', category: 'jd', enabled: true },
  { to_replace: '8', replacement: '³', category: 'jd', enabled: true },
  { to_replace: '9', replacement: '²', category: 'jd', enabled: true },

  // 韵尾 (wm)
  { to_replace: 'ng', replacement: 'ŋ', category: 'wm', enabled: true },
  { to_replace: 'h', replacement: 'ʔ', category: 'wm', enabled: true },
  { to_replace: 'n', replacement: 'n', category: 'wm', enabled: true },
  { to_replace: 'm', replacement: 'm', category: 'wm', enabled: true }
]

// 规则列表
const rules = ref([...DEFAULT_RULES])

// 标签页
const tabs = [
  { key: 'wf', label: '韻腹' },
  { key: 'sm', label: '聲母' },
  { key: 'jd', label: '聲調' },
  { key: 'wm', label: '韻尾' },
  { key: 'all', label: '全部' }
]

// 计算属性
const filteredRules = computed(() => {
  if (currentTab.value === 'all') {
    return rules.value
  }
  return rules.value.filter(r => r.category === currentTab.value)
})

const totalRules = computed(() => rules.value.length)
const enabledRules = computed(() => rules.value.filter(r => r.enabled).length)
const disabledRules = computed(() => totalRules.value - enabledRules.value)

// 工具函数
const getCategoryName = (cat) => {
  const names = { wf: '韻腹', sm: '聲母', jd: '聲調', wm: '韻尾' }
  return names[cat] || cat
}

const updateStats = () => {
  // 触发响应式更新
}

const addNewRule = () => {
  const category = currentTab.value === 'all' ? 'wf' : currentTab.value
  rules.value.push({
    to_replace: '',
    replacement: '',
    category: category,
    enabled: true
  })
}

const deleteRule = async (rule) => {
  const confirmed = await showConfirm('確定刪除此規則？')
  if (confirmed) {
    const index = rules.value.indexOf(rule)
    if (index > -1) {
      rules.value.splice(index, 1)
    }
  }
}

const resetConfigConfirm = async () => {
  const confirmed = await showConfirm('確定重置為默認配置嗎？這將清除所有自定義修改。')
  if (confirmed) {
    rules.value = [...DEFAULT_RULES]
    localStorage.removeItem('jyut2ipa_custom_rules')
    showSuccess('已重置為默認配置')
  }
}

const saveConfig = () => {
  try {
    localStorage.setItem('jyut2ipa_custom_rules', JSON.stringify(rules.value))
    showConfigModal.value = false
    showSuccess('配置已保存')
  } catch (e) {
    showError('保存失敗: ' + e.message)
  }
}

const exportConfig = () => {
  const blob = new Blob([JSON.stringify(rules.value, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'jyut2ipa-rules.json'
  a.click()
  URL.revokeObjectURL(url)
}

const importConfig = () => {
  importInput.value.click()
}

const handleImportFile = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  try {
    const text = await file.text()
    const imported = JSON.parse(text)
    if (Array.isArray(imported)) {
      rules.value = imported
      showSuccess('導入成功')
    } else {
      showError('文件格式錯誤：必須是數組格式')
    }
  } catch (e) {
    showError('導入失敗: ' + e.message)
  }
  event.target.value = ''
}


const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    processFile(file)
  }
}

const handleDrop = (event) => {
  isDragOver.value = false
  const file = event.dataTransfer.files[0]
  if (file) {
    processFile(file)
  }
}

const processFile = async (file) => {
  // 检查登录状态
  if (!userStore.isAuthenticated) {
    showWarning('請先登錄')
    router.push('/auth')
    return
  }

  if (!file.name.match(/\.(xlsx|xls)$/)) {
    showError('請上傳Excel文件（.xlsx或.xls格式）')
    return
  }

  if (file.size > 3 * 1024 * 1024) {
    showError('文件大小不得超過3MB')
    return
  }

  processing.value = true
  progress.value = 0
  stats.total = 0
  stats.processed = 0
  stats.success = 0
  stats.failed = 0
  fileName.value = file.name
  try {
    // 上传文件
    processingText.value = '正在上傳文件...'
    const uploadData = await uploadJyutFile(file)

    const taskId = uploadData.task_id
    progress.value = 10

    // 开始处理
    processingText.value = '正在準備轉換...'

    // 将规则转换为后端需要的格式
    const customRules = rules.value.filter(r => r.enabled)

    await processJyut2Ipa(taskId)

    progress.value = 20

    // 轮询进度
    const pollInterval = setInterval(async () => {
      try {
        const progressData = await getJyut2IpaProgress(taskId)

        progress.value = progressData.progress || 0
        processingText.value = progressData.message || '處理中...'

        if (progressData.status === 'completed') {
          clearInterval(pollInterval)
          stats.total = progressData.total_rows || 0
          stats.processed = progressData.total_rows || 0
          stats.success = progressData.total_rows || 0
          progress.value = 100

          // 生成预览数据（从后端获取）
          if (progressData.preview) {
            previewData.value = progressData.preview.slice(0, 10)
          }

          processing.value = false
          completed.value = true

          // 保存taskId用于下载
          window.jyut2ipaTaskId = taskId
        } else if (progressData.status === 'failed') {
          clearInterval(pollInterval)
          throw new Error(progressData.message || '处理失败')
        }
      } catch (error) {
        clearInterval(pollInterval)
        showError('獲取進度失敗: ' + error.message)
        reset()
      }
    }, 1000)
  } catch (error) {
    showError('處理失敗: ' + error.message)
    processing.value = false
    reset()
  }
}

const downloadResult = async () => {
  try {
    const taskId = window.jyut2ipaTaskId
    if (!taskId) {
      showError('未找到任務ID')
      return
    }

    const blob = await downloadJyut2IpaResult(taskId)

    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `方音圖鑒_`+ fileName.value
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  } catch (error) {
    showError('下載失敗: ' + error.message)
  }
}

const reset = () => {
  completed.value = false
  processing.value = false
  progress.value = 0
  stats.total = 0
  stats.processed = 0
  stats.success = 0
  stats.failed = 0
  previewData.value = []
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// 加载配置
const loadConfig = () => {
  const saved = localStorage.getItem('jyut2ipa_custom_rules')
  if (saved) {
    try {
      rules.value = JSON.parse(saved)
    } catch (e) {
      console.error('配置解析失敗:', e)
      rules.value = [...DEFAULT_RULES]
    }
  }
}
loadConfig()
</script>

<style scoped>
.jyut2ipa-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4px;
  padding-top:25px ;
}

.glass-container {
  width: min(95dvw, 800px);
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(25px) saturate(180%);
  -webkit-backdrop-filter: blur(25px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 30px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.1);
  padding: 40px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.header-section {
  text-align: center;
  margin-bottom: 12px;
  position: relative;
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
  margin: 0;
}

.config-btn {
  position: absolute;
  top: 0;
  right: 0;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 12px;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.config-btn:hover {
  background: rgba(0, 122, 255, 0.7);
  transform: rotate(90deg);
}

.upload-area {
  display: flex;
  flex-direction: column;
  gap: 24px;
  justify-content: center;
  align-items: center;
}

.upload-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 30px 40px;
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 2px dashed rgba(0, 122, 255, 0.3);
  border-radius: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.upload-zone:hover,
.upload-zone.drag-over {
  background: rgba(0, 122, 255, 0.05);
  border-color: rgba(0, 122, 255, 0.6);
  transform: scale(1.02);
}

.upload-icon {
  font-size: 64px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.upload-title {
  font-size: 20px;
  font-weight: 500;
  color: #0b2540;
  margin: 0;
  white-space: nowrap;
}

.upload-hint {
  font-size: 14px;
  color: rgba(11, 37, 64, 0.6);
  margin: 0;
}

.info-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.info-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 20px;
}

.card-icon {
  font-size: 32px;
}

.card-content {
  flex: 1;
}

.card-title {
  font-size: 13px;
  font-weight: 600;
  color: #0b2540;
  margin-bottom: 4px;
}

.card-text {
  font-size: 12px;
  color: rgba(11, 37, 64, 0.7);
}

.processing-area,
.complete-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.processing-icon {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner {
  width: 60px;
  height: 60px;
  border: 4px solid rgba(0, 122, 255, 0.2);
  border-top-color: rgba(0, 122, 255, 0.8);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.processing-title,
.complete-title {
  font-size: 24px;
  font-weight: 600;
  color: #0b2540;
  margin: 0;
}

.processing-text,
.complete-text {
  font-size: 15px;
  color: rgba(11, 37, 64, 0.7);
  margin: 0;
}

.progress-bar-container {
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.progress-bar {
  width: 100%;
  height: 12px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 6px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, rgba(0, 122, 255, 0.8), rgba(0, 195, 255, 0.8));
  border-radius: 6px;
  transition: width 0.3s ease;
}

.progress-text {
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  color: #0b2540;
}

.processing-stats {
  display: flex;
  gap: 24px;
  padding: 20px 32px;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 16px;
}

.stat-item {
  display: flex;
  gap: 8px;
  font-size: 14px;
}

.stat-label {
  color: rgba(11, 37, 64, 0.7);
}

.stat-value {
  font-weight: 600;
  color: #0b2540;
}

.stat-value.success {
  color: #34c759;
}

.complete-icon {
  font-size: 80px;
  animation: scaleIn 0.5s ease;
}

@keyframes scaleIn {
  from {
    transform: scale(0);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.result-stats {
  display: flex;
  gap: 20px;
}

.result-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 24px 32px;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 20px;
  min-width: 120px;
}

.result-number {
  font-size: 36px;
  font-weight: 700;
  color: #0b2540;
}

.result-number.success {
  color: #34c759;
}

.result-number.error {
  color: #ff3b30;
}

.result-label {
  font-size: 14px;
  color: rgba(11, 37, 64, 0.7);
}

.action-buttons {
  display: flex;
  gap: 16px;
}

.glass-button {
  padding: 12px 32px;
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 16px;
  color: #0b2540;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.glass-button.primary {
  background: linear-gradient(135deg, rgba(0, 122, 255, 0.8), rgba(0, 122, 255, 0.6));
  color: white;
  border-color: rgba(0, 122, 255, 0.6);
}

.glass-button.primary:hover {
  background: linear-gradient(135deg, rgba(0, 122, 255, 0.9), rgba(0, 122, 255, 0.7));
  box-shadow: 0 4px 20px rgba(0, 122, 255, 0.3);
  transform: translateY(-2px);
}

.glass-button.secondary {
  background: rgba(255, 255, 255, 0.5);
}

.glass-button.secondary:hover {
  background: rgba(255, 255, 255, 0.7);
}

.glass-button.large {
  padding: 16px 48px;
  font-size: 16px;
}

.glass-button.small {
  padding: 8px 16px;
  font-size: 13px;
}

.preview-section {
  width: 100%;
  margin-top: 24px;
}

.preview-title {
  font-size: 16px;
  font-weight: 600;
  color: #0b2540;
  margin: 0 0 12px 0;
}

.preview-table-wrapper {
  max-height: 200px;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.4);
}

.preview-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.preview-table thead {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
}

.preview-table th,
.preview-table td {
  padding: 10px 16px;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
}

.preview-table th {
  font-weight: 600;
  color: #0b2540;
}

.ipa-text {
  font-family: 'Doulos SIL', 'Charis SIL', serif;
  color: rgba(0, 122, 255, 0.9);
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  width: min(90vw, 700px);
  max-height: 85vh;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(30px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 24px;
  box-shadow: 0 16px 64px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-content.large-modal {
  width: min(95vw, 1200px);
  max-height: 90vh;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 32px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.5);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 24px;
  flex: 1;
}

.modal-title {
  font-size: 20px;
  font-weight: 600;
  color: #0b2540;
  margin: 0;
  white-space: nowrap;
}

.header-stats {
  display: flex;
  align-items: center;
  gap: 20px;
}

.stat-inline {
  font-size: 14px;
  color: rgba(11, 37, 64, 0.7);
  white-space: nowrap;
}

.stat-inline strong {
  font-weight: 700;
  color: #0b2540;
  margin-left: 4px;
}

.stat-inline strong.success {
  color: #34c759;
}

.stat-inline strong.disabled {
  color: #999;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-right: 30px;
}

.close-btn {
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 8px;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(255, 59, 48, 0.7);
  color: white;
}

/* 标签页 */
.config-tabs {
  display: flex;
  gap: 4px;
  padding: 12px 32px 0;
  border-bottom: 2px solid rgba(0, 0, 0, 0.05);
}

.config-tab {
  padding: 10px 12px;
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  font-size: 15px;
  color: rgba(11, 37, 64, 0.6);
  font-weight: 500;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.config-tab:hover {
  background: rgba(0, 122, 255, 0.05);
  color: #0b2540;
}

.config-tab.active {
  color: #007aff;
  border-bottom-color: #007aff;
  font-weight: 600;
}

.modal-body {
  flex: 1;
  padding: 2px 3px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  justify-items: center;
}

/* 规则表格 */
.rules-table-container {
  border-radius: 12px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.3);
  margin-bottom: 16px;
}

.rules-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.rules-table thead {
  background: rgba(0, 122, 255, 0.08);
  position: sticky;
  top: 0;
  z-index: 10;
}

.rules-table th {
  padding: 12px;
  text-align: left;
  font-weight: 600;
  color: #0b2540;
  border-bottom: 2px solid rgba(0, 122, 255, 0.1);
  white-space: nowrap;
}

.rules-table td {
  padding: 10px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
}

.rules-table tbody tr:hover {
  background: rgba(0, 122, 255, 0.03);
}

.table-input {
  width: 100%;
  padding: 6px 10px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(0, 122, 255, 0.15);
  border-radius: 6px;
  font-size: 13px;
  font-family: 'Courier New', monospace;
  transition: all 0.2s ease;
}

.table-input:focus {
  outline: none;
  border-color: rgba(0, 122, 255, 0.5);
  background: white;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.05);
}

/* 类别徽章 */
.category-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}

.category-badge.cat-wf {
  background: #fef3c7;
  color: #92400e;
}

.category-badge.cat-sm {
  background: #dbeafe;
  color: #1e40af;
}

.category-badge.cat-jd {
  background: #fce7f3;
  color: #9f1239;
}

.category-badge.cat-wm {
  background: #d1fae5;
  color: #065f46;
}

/* Toggle开关 */
.toggle-switch {
  position: relative;
  width: 44px;
  height: 22px;
  display: inline-block;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.3s;
  border-radius: 22px;
}

.toggle-slider:before {
  position: absolute;
  content: '';
  height: 16px;
  width: 16px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

.toggle-switch input:checked + .toggle-slider {
  background-color: #007aff;
}

.toggle-switch input:checked + .toggle-slider:before {
  transform: translateX(22px);
}

/* 删除按钮 */
.btn-delete {
  padding: 5px 10px;
  background: rgba(255, 59, 48, 0.1);
  border: 1px solid rgba(255, 59, 48, 0.3);
  border-radius: 6px;
  color: #ff3b30;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-delete:hover {
  background: rgba(255, 59, 48, 0.2);
  transform: scale(1.05);
}

/* 添加规则按钮 */
.btn-add-rule {
  padding: 12px;
  background: linear-gradient(135deg, rgba(52, 199, 89, 0.7), rgba(52, 199, 89, 0.5));
  border: 1px solid rgba(52, 199, 89, 0.5);
  border-radius: 10px;
  color: white;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: block;
  margin: 0 auto;
  max-width: 200px;
}

.btn-add-rule:hover {
  background: linear-gradient(135deg, rgba(52, 199, 89, 0.8), rgba(52, 199, 89, 0.6));
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(52, 199, 89, 0.3);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 32px;
  border-top: 1px solid rgba(255, 255, 255, 0.5);
}

/* 图标按钮 */
.icon-btn {
  width: 32px;
  height: 32px;
  padding: 0;
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.icon-btn:hover {
  background: rgba(0, 122, 255, 0.2);
  transform: scale(1.1);
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: transform 0.3s ease;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.9);
}

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

.info-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  max-width: 600px;
}

.info-text {
  font-size: 16px;
  line-height: 1.6;
  color: rgba(7, 25, 44, 0.8);
  text-align: center;
  margin: 0;
}

.config-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px 32px;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.7);
  border-radius: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.config-card:hover {
  background: rgba(255, 255, 255, 0.65);
  border-color: rgba(0, 122, 255, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 122, 255, 0.15);
}

.config-card:active {
  transform: translateY(0);
}

.config-icon {
  font-size: 48px;
  flex-shrink: 0;
  line-height: 1;
}

.config-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.config-title {
  font-size: 20px;
  font-weight: 600;
  color: #0b2540;
  margin: 0;
}

.config-desc {
  font-size: 14px;
  color: rgba(11, 37, 64, 0.7);
  margin: 0;
}

.config-arrow {
  font-size: 24px;
  color: rgba(0, 122, 255, 0.8);
  flex-shrink: 0;
  line-height: 1;
  transition: transform 0.3s ease;
}

.config-card:hover .config-arrow {
  transform: translateX(4px);
}

@media (max-width: 768px) {
  .glass-container {
    padding: 20px 16px;
    border-radius: 20px;
    width: 100%;
    min-height: auto;
  }

  .header-section {
    padding-bottom: 0px;
  }

  .title {
    font-size: 22px;
  }

  .subtitle {
    font-size: 13px;
  }

  .info-section {
    max-width: 100%;
    gap: 16px;
  }

  .info-text {
    font-size: 14px;
  }

  .config-card {
    padding: 16px 20px;
    gap: 16px;
  }

  .config-icon {
    font-size: 36px;
  }

  .config-title {
    font-size: 17px;
    white-space: nowrap;
  }

  .config-desc {
    font-size: 13px;
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

  .progress-bar-container {
    max-width: 100%;
  }

  .processing-stats {
    flex-direction: column;
    gap: 12px;
    padding: 16px 20px;
  }

  .result-stats {
    flex-direction: column;
    gap: 12px;
  }

  .result-card {
    width: 100%;
    padding: 16px 24px;
  }

  .action-buttons {
    flex-direction: column;
    width: 100%;
    gap: 12px;
  }

  .glass-button {
    width: 100%;
    justify-content: center;
    padding: 14px 24px;
  }

  /* 配置模态框移动端适配 */
  .config-modal-overlay {
    padding: 10px;
  }

  .config-modal {
    width: 100%;
    max-width: 100vw;
    max-height: 90vh;
    border-radius: 16px;
  }

  .modal-header {
    padding: 16px;
    flex-wrap: wrap;
    gap: 12px;
  }

  .header-left {
    width: 100%;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .header-stats {
    flex-wrap: wrap;
    gap: 8px;
  }

  .header-actions {
    width: 100%;
    justify-content: space-between;
  }

  .modal-title {
    font-size: 18px;
  }

  .stat-inline {
    font-size: 12px;
  }

  .category-tabs {
    padding: 12px 16px;
    gap: 6px;
    overflow-x: auto;
  }

  .category-tab {
    padding: 8px 12px;
    font-size: 13px;
    white-space: nowrap;
  }

  .modal-body {
    padding: 12px 16px;
  }

  .rules-table-container {
    border-radius: 12px;
  }

  .rules-table {
    font-size: 12px;
  }

  .rules-table th,
  .rules-table td {
    padding: 8px 6px;
  }

  .toggle-switch {
    width: 42px;
    height: 22px;
  }

  .toggle-slider:before {
    width: 18px;
    height: 18px;
  }

  .modal-footer {
    padding: 12px 16px;
    flex-wrap: wrap;
  }

  .add-rule-btn {
    width: 100%;
    order: -1;
    margin-bottom: 8px;
  }

  .footer-actions {
    width: 100%;
    justify-content: stretch;
    gap: 8px;
  }

  .footer-actions .glass-button {
    flex: 1;
  }
}

</style>

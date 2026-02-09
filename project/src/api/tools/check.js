// api/tools/check.js - 字表检查工具 API
import { api } from '../auth/auth.js'

/**
 * @typedef {Object} CheckUploadResponse
 * @property {string} task_id - 任务ID
 * @property {string} filename - 文件名
 * @property {string} message - 消息
 */

/**
 * @typedef {Object} ToneStats
 * @property {Object<string, number>} tone_counts - 声调统计（调名 -> 数量）
 * @property {number} total - 总数
 */

/**
 * @typedef {Object} TableDataResponse
 * @property {Array<Object>} data - 表格数据行
 * @property {number} total - 总行数
 * @property {number} page - 当前页码
 * @property {number} page_size - 每页大小
 */

/**
 * 上传检查文件
 * @param {File} file - 字表文件
 * @param {'excel'|'text'} format - 文件格式
 * @param {boolean} isSimplified - 是否简体中文
 * @returns {Promise<CheckUploadResponse>} 上传结果
 * @throws {Error} 上传失败
 * @example
 * const result = await uploadCheckFile(file, 'excel', false)
 */
export async function uploadCheckFile(file, format = 'excel', isSimplified = false) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('format', format)
  formData.append('is_simplified', isSimplified.toString())

  try {
    return await api('/api/tools/check/upload', {
      method: 'POST',
      body: formData
    })
  } catch (error) {
    console.error('Upload check file error:', error)
    throw new Error(error.message || '字表上傳失敗')
  }
}

/**
 * 分析文件
 * @param {string} taskId - 任务ID
 * @returns {Promise<{message: string}>} 分析结果
 * @throws {Error} 分析失败
 * @example
 * await analyzeFile(taskId)
 */
export async function analyzeFile(taskId) {
  try {
    return await api(`/api/tools/check/analyze?task_id=${taskId}`, {
      method: 'POST'
    })
  } catch (error) {
    console.error('Analyze file error:', error)
    throw new Error(error.message || '文件分析失敗')
  }
}

/**
 * 获取声调统计
 * @param {string} taskId - 任务ID
 * @returns {Promise<ToneStats>} 声调统计
 * @throws {Error} 获取失败
 * @example
 * const stats = await getToneStats(taskId)
 * console.log(stats.tone_counts) // { "陰平": 120, "陽平": 98, ... }
 */
export async function getToneStats(taskId) {
  try {
    return await api('/api/tools/check/get_tone_stats', {
      method: 'POST',
      body: { task_id: taskId }
    })
  } catch (error) {
    console.error('Get tone stats error:', error)
    throw new Error(error.message || '獲取聲調統計失敗')
  }
}

/**
 * 获取表格数据
 * @param {string} taskId - 任务ID
 * @param {Object} [options] - 查询选项
 * @param {number} [options.page=1] - 页码
 * @param {number} [options.pageSize=100] - 每页大小
 * @param {string} [options.toneFilter] - 声调过滤
 * @param {string} [options.searchQuery] - 搜索查询
 * @returns {Promise<TableDataResponse>} 表格数据
 * @throws {Error} 获取失败
 * @example
 * const data = await getTableData(taskId, { page: 1, pageSize: 100 })
 */
export async function getTableData(taskId, options = {}) {
  const {
    page = 1,
    pageSize = 100,
    toneFilter = null,
    searchQuery = null
  } = options

  try {
    return await api('/api/tools/check/get_data', {
      method: 'POST',
      body: {
        task_id: taskId,
        page,
        page_size: pageSize,
        tone_filter: toneFilter,
        search_query: searchQuery
      }
    })
  } catch (error) {
    console.error('Get table data error:', error)
    throw new Error(error.message || '獲取表格數據失敗')
  }
}

/**
 * 更新行数据
 * @param {string} taskId - 任务ID
 * @param {number} index - 行索引
 * @param {Object} updates - 更新内容
 * @returns {Promise<{message: string}>} 更新结果
 * @throws {Error} 更新失败
 * @example
 * await updateRow(taskId, 5, { tone: '陰平', ipa: 'pa55' })
 */
export async function updateRow(taskId, index, updates) {
  try {
    return await api('/api/tools/check/update_row', {
      method: 'POST',
      body: {
        task_id: taskId,
        index,
        updates
      }
    })
  } catch (error) {
    console.error('Update row error:', error)
    throw new Error(error.message || '更新行數據失敗')
  }
}

/**
 * 批量删除行
 * @param {string} taskId - 任务ID
 * @param {number[]} indices - 要删除的行索引数组
 * @returns {Promise<{message: string, deleted_count: number}>} 删除结果
 * @throws {Error} 删除失败
 * @example
 * await batchDelete(taskId, [3, 5, 7])
 */
export async function batchDelete(taskId, indices) {
  try {
    return await api('/api/tools/check/batch_delete', {
      method: 'POST',
      body: {
        task_id: taskId,
        indices
      }
    })
  } catch (error) {
    console.error('Batch delete error:', error)
    throw new Error(error.message || '批量刪除失敗')
  }
}

/**
 * 执行批量操作
 * @param {string} taskId - 任务ID
 * @param {Object} operation - 操作配置
 * @param {'delete'|'replace'|'update'} operation.type - 操作类型
 * @param {Object} operation.params - 操作参数
 * @returns {Promise<{message: string, affected_count: number}>} 操作结果
 * @throws {Error} 操作失败
 * @example
 * await executeBatchOperation(taskId, {
 *   type: 'replace',
 *   params: { find: 'old', replace: 'new', column: 'ipa' }
 * })
 */
export async function executeBatchOperation(taskId, operation) {
  try {
    return await api('/api/tools/check/execute', {
      method: 'POST',
      body: {
        task_id: taskId,
        operation
      }
    })
  } catch (error) {
    console.error('Execute batch operation error:', error)
    throw new Error(error.message || '批量操作執行失敗')
  }
}

/**
 * 下载检查结果
 * @param {string} taskId - 任务ID
 * @returns {Promise<Blob>} 文件Blob
 * @throws {Error} 下载失败
 * @example
 * const blob = await downloadCheckResult(taskId)
 * const url = URL.createObjectURL(blob)
 * const a = document.createElement('a')
 * a.href = url
 * a.download = 'checked_result.xlsx'
 * a.click()
 */
export async function downloadCheckResult(taskId) {
  try {
    return await api(`/api/tools/check/download/${taskId}`, {
      responseType: 'blob'
    })
  } catch (error) {
    console.error('Download check result error:', error)
    throw new Error(error.message || '下載檢查結果失敗')
  }
}

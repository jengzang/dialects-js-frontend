// api/tools/jyut2ipa.js - 粤拼转IPA工具 API
import { api } from '../auth/auth.js'
import { showError } from '@/utils/message.js'

/**
 * @typedef {Object} Jyut2IpaUploadResponse
 * @property {string} task_id - 任务ID
 * @property {string} filename - 文件名
 * @property {string} message - 消息
 */

/**
 * @typedef {Object} Jyut2IpaProgress
 * @property {string} task_id - 任务ID
 * @property {'pending'|'processing'|'completed'|'error'} status - 任务状态
 * @property {number} progress - 进度（0-100）
 * @property {string} [message] - 状态消息
 * @property {string} [error] - 错误信息（可选）
 */

/**
 * 上传粤拼文件
 * @param {File} file - 粤拼文件（.xlsx 或 .xls）
 * @returns {Promise<Jyut2IpaUploadResponse>} 上传结果
 * @throws {Error} 上传失败
 * @example
 * const result = await uploadJyutFile(file)
 * console.log(result.task_id)
 */
export async function uploadJyutFile(file) {
  const formData = new FormData()
  formData.append('file', file)

  try {
    return await api('/api/tools/jyut2ipa/upload', {
      method: 'POST',
      body: formData
    })
  } catch (error) {
    console.error('Upload jyut file error:', error)
    showError(error.message || '粵拼文件上傳失敗')
    throw new Error(error.message || '粵拼文件上傳失敗')
  }
}

/**
 * 开始粤拼转IPA处理
 * @param {string} taskId - 任务ID
 * @returns {Promise<{message: string}>} 处理结果
 * @throws {Error} 处理失败
 * @example
 * await processJyut2Ipa(taskId)
 */
export async function processJyut2Ipa(taskId) {
  try {
    return await api('/api/tools/jyut2ipa/process', {
      method: 'POST',
      body: { task_id: taskId }
    })
  } catch (error) {
    console.error('Process jyut2ipa error:', error)
    showError(error.message || '粵拼轉IPA處理失敗')
    throw new Error(error.message || '粵拼轉IPA處理失敗')
  }
}

/**
 * 获取粤拼转IPA进度
 * @param {string} taskId - 任务ID
 * @returns {Promise<Jyut2IpaProgress>} 进度信息
 * @throws {Error} 获取进度失败
 * @example
 * const progress = await getJyut2IpaProgress(taskId)
 * console.log(progress.progress) // 50
 */
export async function getJyut2IpaProgress(taskId) {
  try {
    return await api(`/api/tools/jyut2ipa/progress/${taskId}`)
  } catch (error) {
    console.error('Get jyut2ipa progress error:', error)
    showError(error.message || '獲取轉換進度失敗')
    throw new Error(error.message || '獲取轉換進度失敗')
  }
}

/**
 * 下载粤拼转IPA结果
 * @param {string} taskId - 任务ID
 * @returns {Promise<Blob>} 文件Blob
 * @throws {Error} 下载失败
 * @example
 * const blob = await downloadJyut2IpaResult(taskId)
 * const url = URL.createObjectURL(blob)
 * const a = document.createElement('a')
 * a.href = url
 * a.download = 'jyut2ipa_result.xlsx'
 * a.click()
 */
export async function downloadJyut2IpaResult(taskId) {
  try {
    return await api(`/api/tools/jyut2ipa/download/${taskId}`, {
      responseType: 'blob'
    })
  } catch (error) {
    console.error('Download jyut2ipa result error:', error)
    showError(error.message || '下載轉換結果失敗')
    throw new Error(error.message || '下載轉換結果失敗')
  }
}

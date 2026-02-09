// api/praat/acoustic.js - Praat 音频分析 API
import { api } from '../auth/auth.js'
import { showError } from '@/utils/message.js'

/**
 * @typedef {Object} UploadResponse
 * @property {string} upload_id - 上传ID
 * @property {string} filename - 文件名
 * @property {number} size - 文件大小（字节）
 * @property {string} created_at - 创建时间
 */

/**
 * @typedef {Object} JobStatus
 * @property {string} job_id - 任务ID
 * @property {'queued'|'running'|'done'|'error'|'canceled'} status - 任务状态
 * @property {number} progress - 进度（0-1）
 * @property {string} [stage] - 当前阶段（decode/pitch/formant/intensity/finalize）
 * @property {string} [error] - 错误信息（可选）
 */

/**
 * @typedef {Object} AnalysisSettings
 * @property {'single'|'continuous'} mode - 分析模式
 * @property {Object} [pitch] - 基频参数
 * @property {number} [pitch.f0_min] - 最小基频（Hz）
 * @property {number} [pitch.f0_max] - 最大基频（Hz）
 * @property {number} [pitch.time_step] - 时间步长（秒）
 * @property {Object} [formant] - 共振峰参数
 * @property {number} [formant.max_formants] - 最大共振峰数
 * @property {number} [formant.max_freq_hz] - 最大频率（Hz）
 * @property {Object} [intensity] - 强度参数
 * @property {number} [intensity.min_pitch] - 最小基频（Hz）
 * @property {Object} [output] - 输出参数
 * @property {number} [output.downsample_hz] - 下采样频率（Hz）
 * @property {boolean} [output.include_timeseries] - 是否包含时间序列
 * @property {boolean} [output.include_summary] - 是否包含摘要信息
 */

/**
 * @typedef {Object} AnalysisResult
 * @property {string} job_id - 任务ID
 * @property {string} upload_id - 上传ID
 * @property {string} status - 任务状态
 * @property {Object} metadata - 元数据（时长、采样率等）
 * @property {Object} [summary] - 摘要信息（平均基频、调值等）
 * @property {Object} [timeseries] - 时间序列数据（基频、共振峰、强度曲线）
 */

/**
 * 上传音频文件
 * @param {File} file - 音频文件对象（支持 wav/mp3/ogg/webm/m4a）
 * @returns {Promise<UploadResponse>} 上传结果
 * @throws {Error} 上传失败或格式不支持
 * @example
 * const result = await uploadAudio(audioFile)
 * console.log(result.upload_id) // "uuid-xxx"
 */
export async function uploadAudio(file) {
  const formData = new FormData()
  formData.append('file', file)

  try {
    return await api('/api/tools/praat/uploads', {
      method: 'POST',
      body: formData
    })
  } catch (error) {
    console.error('Upload audio error:', error)
    showError(error.message || '音頻上傳失敗，請重試')
    throw new Error(error.message || '音頻上傳失敗，請重試')
  }
}

/**
 * 创建分析任务
 * @param {string} uploadId - 上传ID
 * @param {AnalysisSettings} settings - 分析参数设置
 * @returns {Promise<{job_id: string, status: string}>} 任务创建结果
 * @throws {Error} 创建任务失败
 * @example
 * const job = await createAnalysisJob(uploadId, {
 *   mode: 'single',
 *   pitch: { f0_min: 75, f0_max: 500 }
 * })
 */
export async function createAnalysisJob(uploadId, settings) {
  try {
    return await api('/api/tools/praat/jobs', {
      method: 'POST',
      body: {
        upload_id: uploadId,
        ...settings
      }
    })
  } catch (error) {
    console.error('Create analysis job error:', error)
    showError(error.message || '創建分析任務失敗，請重試')
    throw new Error(error.message || '創建分析任務失敗，請重試')
  }
}

/**
 * 获取任务状态
 * @param {string} jobId - 任务ID
 * @returns {Promise<JobStatus>} 任务状态
 * @throws {Error} 获取状态失败
 * @example
 * const status = await getJobStatus(jobId)
 * console.log(status.progress) // 0.75
 */
export async function getJobStatus(jobId) {
  try {
    return await api(`/api/tools/praat/jobs/progress/${jobId}`)
  } catch (error) {
    console.error('Get job status error:', error)
    showError(error.message || '獲取任務狀態失敗')
    throw new Error(error.message || '獲取任務狀態失敗')
  }
}

/**
 * 取消分析任务
 * @param {string} jobId - 任务ID
 * @returns {Promise<{message: string}>} 取消结果
 * @throws {Error} 取消任务失败
 * @example
 * await cancelJob(jobId)
 */
export async function cancelJob(jobId) {
  try {
    return await api(`/api/tools/praat/jobs/progress/${jobId}`, {
      method: 'DELETE'
    })
  } catch (error) {
    console.error('Cancel job error:', error)
    showError(error.message || '取消任務失敗')
    throw new Error(error.message || '取消任務失敗')
  }
}

/**
 * 获取分析结果
 * @param {string} jobId - 任务ID
 * @param {'full'|'summary'|'timeseries'} [view='full'] - 结果视图类型
 * @returns {Promise<AnalysisResult>} 分析结果
 * @throws {Error} 获取结果失败
 * @example
 * const result = await getJobResult(jobId, 'full')
 * console.log(result.summary.f0_mean) // 平均基频
 */
export async function getJobResult(jobId, view = 'full') {
  try {
    return await api(`/api/tools/praat/jobs/progress/${jobId}/result?view=${view}`)
  } catch (error) {
    console.error('Get job result error:', error)
    showError(error.message || '獲取分析結果失敗')
    throw new Error(error.message || '獲取分析結果失敗')
  }
}

/**
 * 轮询任务状态直到完成
 * @param {string} jobId - 任务ID
 * @param {Object} [options] - 轮询选项
 * @param {number} [options.interval=2000] - 轮询间隔（毫秒）
 * @param {number} [options.timeout=300000] - 超时时间（毫秒，默认5分钟）
 * @param {Function} [options.onProgress] - 进度回调函数 (status: JobStatus) => void
 * @returns {Promise<JobStatus>} 最终任务状态
 * @throws {Error} 超时或任务失败
 * @example
 * const finalStatus = await pollUntilComplete(jobId, {
 *   interval: 2000,
 *   onProgress: (status) => {
 *     console.log('Progress:', status.progress)
 *   }
 * })
 */
export async function pollUntilComplete(jobId, options = {}) {
  const {
    interval = 2000,
    timeout = 300000,
    onProgress = null
  } = options

  const startTime = Date.now()

  while (true) {
    // 检查超时
    if (Date.now() - startTime > timeout) {
      throw new Error('任務輪詢超時')
    }

    // 获取状态
    const status = await getJobStatus(jobId)

    // 调用进度回调
    if (onProgress) {
      onProgress(status)
    }

    // 检查完成状态
    if (status.status === 'done') {
      return status
    } else if (status.status === 'error') {
      throw new Error(status.error || '任務執行失敗')
    } else if (status.status === 'canceled') {
      throw new Error('任務已取消')
    }

    // 等待下一次轮询
    await new Promise(resolve => setTimeout(resolve, interval))
  }
}

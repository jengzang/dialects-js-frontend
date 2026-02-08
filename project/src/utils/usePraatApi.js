import { api } from './auth.js'

/**
 * Praat API composable for acoustic analysis
 */
export function usePraatApi() {
  /**
   * Upload audio file
   */
  const uploadAudio = async (file) => {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const data = await api('/api/praat/uploads', {
        method: 'POST',
        body: formData,
        headers: {}
      })

      return data
    } catch (error) {
      console.error('Upload error:', error)
      throw new Error(error.message || '音頻上傳失敗，請重試')
    }
  }

  /**
   * Create analysis job
   */
  const createJob = async (uploadId, settings) => {
    try {
      const data = await api('/api/praat/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          upload_id: uploadId,
          ...settings
        })
      })

      return data
    } catch (error) {
      console.error('Create job error:', error)
      throw new Error(error.message || '創建分析任務失敗，請重試')
    }
  }

  const getJobStatus = async (jobId) => {
    try {
      const data = await api(`/api/praat/jobs/${jobId}`)
      return data
    } catch (error) {
      console.error('Get job status error:', error)
      throw new Error(error.message || '獲取任務狀態失敗')
    }
  }

  const getJobResult = async (jobId, view = 'full') => {
    try {
      const data = await api(`/api/praat/jobs/${jobId}/result?view=${view}`)
      return data
    } catch (error) {
      console.error('Get job result error:', error)
      throw new Error(error.message || '獲取分析結果失敗')
    }
  }

  const cancelJob = async (jobId) => {
    try {
      const data = await api(`/api/praat/jobs/${jobId}`, { method: 'DELETE' })
      return data
    } catch (error) {
      console.error('Cancel job error:', error)
      throw new Error(error.message || '取消任務失敗')
    }
  }

  return { uploadAudio, createJob, getJobStatus, getJobResult, cancelJob }
}

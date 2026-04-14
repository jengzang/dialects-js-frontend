import { ref } from 'vue'

export function useAsyncTask(options = {}) {
  // 这个 composable 只管异步任务的公共状态，不关心具体业务数据长什么样。
  const loading = ref(false)
  const error = ref(null)

  const {
    onSuccess,
    onError,
    onFinally,
    resetError = true,
  } = options

  async function run(task, taskOptions = {}) {
    // 调用时允许覆盖默认回调，让单个任务在共享封装下保留页面级行为。
    const mergedOnSuccess = taskOptions.onSuccess ?? onSuccess
    const mergedOnError = taskOptions.onError ?? onError
    const mergedOnFinally = taskOptions.onFinally ?? onFinally
    const rethrow = taskOptions.rethrow ?? false

    loading.value = true
    if (resetError) {
      error.value = null
    }

    try {
      const result = await task()
      if (mergedOnSuccess) {
        await mergedOnSuccess(result)
      }
      return result
    } catch (taskError) {
      error.value = taskError
      if (mergedOnError) {
        await mergedOnError(taskError)
      }
      // 默认吞错并把错误落到响应式状态里；需要交给上层继续处理时显式 rethrow。
      if (rethrow) {
        throw taskError
      }
      return null
    } finally {
      loading.value = false
      if (mergedOnFinally) {
        await mergedOnFinally()
      }
    }
  }

  function reset() {
    loading.value = false
    error.value = null
  }

  return {
    loading,
    error,
    run,
    reset,
  }
}

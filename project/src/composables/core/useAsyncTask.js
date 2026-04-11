import { ref } from 'vue'

export function useAsyncTask(options = {}) {
  const loading = ref(false)
  const error = ref(null)

  const {
    onSuccess,
    onError,
    onFinally,
    resetError = true,
  } = options

  async function run(task, taskOptions = {}) {
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

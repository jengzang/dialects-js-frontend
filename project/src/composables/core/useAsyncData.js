import { ref } from 'vue'

import { useAsyncTask } from '@/composables/core/useAsyncTask.js'

export function useAsyncData(options = {}) {
  const {
    initialValue = null,
  } = options

  const data = ref(initialValue)
  const task = useAsyncTask()

  async function load(loader, loadOptions = {}) {
    const {
      resetOnLoad = false,
      onSuccess,
      ...taskOptions
    } = loadOptions

    if (resetOnLoad) {
      data.value = initialValue
    }

    return task.run(async () => {
      const result = await loader()
      data.value = result

      if (onSuccess) {
        await onSuccess(result)
      }

      return result
    }, taskOptions)
  }

  function reset() {
    data.value = initialValue
    task.reset()
  }

  return {
    data,
    loading: task.loading,
    error: task.error,
    load,
    reset,
  }
}

import { ref } from 'vue'

import { useAsyncTask } from '@/composables/core/useAsyncTask.js'

export function useAsyncData(options = {}) {
  const {
    initialValue = null,
  } = options

  const data = ref(initialValue)
  // 复用统一的 loading / error 生命周期，避免每个页面手写同样的 try/catch/finally。
  const task = useAsyncTask()

  async function load(loader, loadOptions = {}) {
    const {
      resetOnLoad = false,
      onSuccess,
      ...taskOptions
    } = loadOptions

    if (resetOnLoad) {
      // 某些页面在重新请求前需要立即清空旧数据，避免展示过期结果。
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
    // reset 同时清数据与异步状态，供页面在切换模式/离开场景时整体复位。
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

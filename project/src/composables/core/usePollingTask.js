import { computed, getCurrentScope, onScopeDispose, ref } from 'vue'

export function usePollingTask(options = {}) {
  const {
    intervalMs = 1000,
    maxFailures = Infinity,
  } = options

  const status = ref('idle')
  const failureCount = ref(0)
  const lastResult = ref(null)
  const lastError = ref(null)

  let timer = null

  const isRunning = computed(() => status.value === 'running')

  function stop() {
    // 始终只保留一个活动定时器，避免重复 start 后出现并发轮询。
    if (timer) {
      clearInterval(timer)
      timer = null
    }

    if (status.value === 'running') {
      status.value = 'stopped'
    }
  }

  async function tick(task, handlers) {
    const {
      shouldStop,
      onTick,
      onError,
      onMaxFailures,
    } = handlers

    try {
      const result = await task()
      lastResult.value = result
      lastError.value = null
      // 只要成功拿到一次结果，就把连续失败计数清零。
      failureCount.value = 0

      if (onTick) {
        await onTick(result)
      }

      if (shouldStop && shouldStop(result)) {
        stop()
        status.value = 'completed'
      }
    } catch (error) {
      lastError.value = error
      failureCount.value += 1

      if (onError) {
        await onError(error, failureCount.value)
      }

      if (failureCount.value >= maxFailures) {
        stop()
        status.value = 'error'
        // 达到上限后不再继续轮询，由页面决定如何提示和收尾。
        if (onMaxFailures) {
          await onMaxFailures(error, failureCount.value)
        }
      }
    }
  }

  async function start(task, handlers = {}) {
    // 新一轮 start 会先停掉旧轮询，确保状态与当前任务一一对应。
    stop()

    status.value = 'running'
    failureCount.value = 0
    lastError.value = null

    if (handlers.immediate !== false) {
      await tick(task, handlers)
      if (status.value !== 'running') {
        return
      }
    }

    timer = setInterval(() => {
      tick(task, handlers)
    }, handlers.intervalMs ?? intervalMs)
  }

  if (getCurrentScope()) {
    onScopeDispose(() => {
      // composable 所在作用域销毁时自动停表，避免页面离开后定时器泄漏。
      stop()
    })
  }

  return {
    status,
    isRunning,
    failureCount,
    lastResult,
    lastError,
    start,
    stop,
  }
}

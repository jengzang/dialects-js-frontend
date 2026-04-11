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
        if (onMaxFailures) {
          await onMaxFailures(error, failureCount.value)
        }
      }
    }
  }

  async function start(task, handlers = {}) {
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

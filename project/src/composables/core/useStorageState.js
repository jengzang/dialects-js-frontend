import { ref, watch } from 'vue'

function getStorage(storageType) {
  if (typeof window === 'undefined') {
    return null
  }

  return storageType === 'session' ? window.sessionStorage : window.localStorage
}

export function useStorageState(key, options = {}) {
  const {
    defaultValue,
    storage = 'local',
    ttl = null,
    deep = true,
    serializer = JSON,
  } = options

  const storageApi = getStorage(storage)
  const state = ref(defaultValue)

  function cloneDefault() {
    if (defaultValue === null || defaultValue === undefined) {
      return defaultValue
    }

    if (typeof structuredClone === 'function') {
      return structuredClone(defaultValue)
    }

    return serializer.parse(serializer.stringify(defaultValue))
  }

  function read() {
    if (!storageApi) {
      state.value = cloneDefault()
      return state.value
    }

    try {
      const raw = storageApi.getItem(key)
      if (!raw) {
        state.value = cloneDefault()
        return state.value
      }

      const payload = serializer.parse(raw)

      if (ttl && payload?.expiresAt && payload.expiresAt < Date.now()) {
        storageApi.removeItem(key)
        state.value = cloneDefault()
        return state.value
      }

      state.value = ttl ? payload.value : payload
      return state.value
    } catch (_error) {
      storageApi?.removeItem(key)
      state.value = cloneDefault()
      return state.value
    }
  }

  function write(value) {
    state.value = value

    if (!storageApi) {
      return
    }

    const payload = ttl
      ? {
          value,
          expiresAt: Date.now() + ttl,
        }
      : value

    storageApi.setItem(key, serializer.stringify(payload))
  }

  function remove() {
    storageApi?.removeItem(key)
    state.value = cloneDefault()
  }

  read()

  watch(state, (value) => {
    if (!storageApi) {
      return
    }

    const payload = ttl
      ? {
          value,
          expiresAt: Date.now() + ttl,
        }
      : value

    storageApi.setItem(key, serializer.stringify(payload))
  }, { deep })

  return {
    state,
    read,
    write,
    remove,
  }
}

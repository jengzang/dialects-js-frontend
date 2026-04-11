function getSessionStorage() {
  if (typeof window === 'undefined') {
    return null
  }

  return window.sessionStorage
}

function readJsonCache(key) {
  const storage = getSessionStorage()
  if (!storage) {
    return null
  }

  const cached = storage.getItem(key)
  if (!cached) {
    return null
  }

  try {
    return JSON.parse(cached)
  } catch (_error) {
    storage.removeItem(key)
    return null
  }
}

function writeJsonCache(key, value) {
  const storage = getSessionStorage()
  if (!storage) {
    return
  }

  storage.setItem(key, JSON.stringify(value))
}

export const PARTITION_DATA_CACHE_KEY = 'partition_data_cache'
export const YINDIAN_TREE_CACHE_KEY = '__YINDIAN_TREE_CACHE__'

export function usePartitionCache() {
  async function getPartitionData(loadPartitionData) {
    const cached = readJsonCache(PARTITION_DATA_CACHE_KEY)
    if (cached) {
      return cached
    }

    const response = await loadPartitionData()
    const data = response?.data || []
    writeJsonCache(PARTITION_DATA_CACHE_KEY, data)
    return data
  }

  function getCachedYindianTree(transform = (value) => value) {
    const cached = readJsonCache(YINDIAN_TREE_CACHE_KEY)
    if (!cached) {
      return null
    }

    return transform(cached)
  }

  async function getYindianTree(loadYindianTree, options = {}) {
    const {
      transform = (value) => value,
    } = options

    const cached = getCachedYindianTree(transform)
    if (cached) {
      return cached
    }

    const tree = await loadYindianTree()
    const transformedTree = transform(tree)
    writeJsonCache(YINDIAN_TREE_CACHE_KEY, transformedTree)
    return transformedTree
  }

  return {
    getPartitionData,
    getCachedYindianTree,
    getYindianTree,
  }
}

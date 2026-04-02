import { ref, computed } from 'vue'
import { getCustomRegions } from '@/api'

// 自定义分区缓存 Store
const customRegions = ref([])
const loading = ref(false)
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000 // localStorage 缓存 7 天

export const useCustomRegionStore = () => {
  // 获取自定义分区（带缓存）
  const fetchCustomRegions = async (regionName = null, forceRefresh = false) => {
    console.log('🔍 fetchCustomRegions 调用:', { regionName, forceRefresh, memoryLength: customRegions.value.length })

    // 如果是获取单个分区详情，不使用缓存
    if (regionName) {
      console.log('📦 获取单个分区详情，不使用缓存')
      loading.value = true
      try {
        return await getCustomRegions(regionName)
      } finally {
        loading.value = false
      }
    }

    // 如果不是强制刷新，先检查内存缓存
    if (!forceRefresh && customRegions.value.length > 0) {
      console.log('✅ 使用内存缓存')
      return { success: true, regions: customRegions.value }
    }

    // 如果内存没有，尝试从 localStorage 恢复
    if (!forceRefresh) {
      console.log('🔄 尝试从 localStorage 恢复...')
      const restored = restoreFromLocalStorage()
      if (restored) {
        console.log('✅ 从 localStorage 恢复成功，数量:', customRegions.value.length)
        return { success: true, regions: customRegions.value }
      } else {
        console.log('❌ localStorage 没有有效缓存')
      }
    }

    // 如果正在加载，等待加载完成
    if (loading.value) {
      console.log('⏳ 正在加载中，等待...')
      return new Promise((resolve) => {
        const checkLoading = setInterval(() => {
          if (!loading.value) {
            clearInterval(checkLoading)
            resolve({ success: true, regions: customRegions.value })
          }
        }, 100)
      })
    }

    // 发起请求
    console.log('🌐 发起 API 请求...')
    loading.value = true
    try {
      const data = await getCustomRegions()
      customRegions.value = data.regions || []

      console.log('✅ API 请求成功，数量:', customRegions.value.length)

      // 存入 localStorage（7天有效）
      localStorage.setItem('customRegions', JSON.stringify({
        data: customRegions.value,
        timestamp: Date.now()
      }))

      console.log('💾 已保存到 localStorage')

      return data
    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }

  // 从 localStorage 恢复缓存
  const restoreFromLocalStorage = () => {
    try {
      const cached = localStorage.getItem('customRegions')
      console.log('📂 localStorage 内容:', cached ? '有数据' : '无数据')

      if (cached) {
        const { data, timestamp } = JSON.parse(cached)
        const age = Date.now() - timestamp
        const ageInMinutes = Math.floor(age / 1000 / 60)

        console.log('⏰ 缓存年龄:', ageInMinutes, '分钟')
        console.log('📊 缓存数据量:', data?.length || 0)

        // 检查是否过期（7天）
        if (Date.now() - timestamp < CACHE_DURATION) {
          customRegions.value = data
          console.log('✅ 缓存有效，已恢复')
          return true
        } else {
          // 过期了，清除
          console.log('⚠️ 缓存已过期，清除')
          localStorage.removeItem('customRegions')
        }
      }
    } catch (error) {
      console.error('❌ 恢复自定义分区缓存失败:', error)
      localStorage.removeItem('customRegions')
    }
    return false
  }

  // 清除缓存（用户创建/修改/删除分区后调用）
  const invalidateCache = () => {
    console.log('🗑️ 清除缓存')
    customRegions.value = []
    localStorage.removeItem('customRegions')
  }

  // 手动刷新（用户点击刷新按钮）
  const refresh = async () => {
    console.log('🔄 手动刷新：先删除旧缓存')
    // 先删除旧缓存
    invalidateCache()
    // 再请求新数据（会自动写入新缓存）
    console.log('🔄 手动刷新：请求新数据')
    return await fetchCustomRegions()
  }

  return {
    customRegions: computed(() => customRegions.value),
    loading: computed(() => loading.value),
    fetchCustomRegions,
    restoreFromLocalStorage,
    invalidateCache,
    refresh
  }
}

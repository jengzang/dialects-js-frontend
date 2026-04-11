import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick, reactive } from 'vue'

let route
let pushMock
let replaceMock

vi.mock('vue-router', () => ({
  useRoute: () => route,
  useRouter: () => ({
    push: pushMock,
    replace: replaceMock,
  }),
}))

vi.mock('@/utils/message.js', () => ({
  showWarning: vi.fn(),
}))

import { useAsyncData } from '../src/composables/core/useAsyncData.js'
import { useAsyncTask } from '../src/composables/core/useAsyncTask.js'
import { usePollingTask } from '../src/composables/core/usePollingTask.js'
import { useStorageState } from '../src/composables/core/useStorageState.js'
import { usePartitionCache } from '../src/composables/domain/geo/usePartitionCache.js'
import { useAuthGuard } from '../src/composables/router/useAuthGuard.js'
import { useRouteQueryState } from '../src/composables/router/useRouteQueryState.js'
import { userStore } from '../src/main/store/store.js'
import { showWarning } from '@/utils/message.js'

describe('composables', () => {
  beforeEach(() => {
    route = reactive({
      path: '/test',
      fullPath: '/test?tab=upload',
      query: {},
    })

    pushMock = vi.fn(async (navigation) => {
      if (navigation.query !== undefined) {
        route.query = navigation.query
      }
      return navigation
    })

    replaceMock = vi.fn(async (navigation) => {
      if (navigation.query !== undefined) {
        route.query = navigation.query
      }
      return navigation
    })

    vi.mocked(showWarning).mockReset()
    userStore.isAuthenticated = false
    window.localStorage.clear()
    window.sessionStorage.clear()
  })

  it('useAsyncTask tracks loading and success', async () => {
    const task = useAsyncTask()
    const resultPromise = task.run(async () => 'ok')

    expect(task.loading.value).toBe(true)

    const result = await resultPromise

    expect(result).toBe('ok')
    expect(task.loading.value).toBe(false)
    expect(task.error.value).toBe(null)
  })

  it('useAsyncTask stores errors without rethrow by default', async () => {
    const task = useAsyncTask()
    const error = new Error('boom')

    const result = await task.run(async () => {
      throw error
    })

    expect(result).toBe(null)
    expect(task.loading.value).toBe(false)
    expect(task.error.value).toBe(error)
  })

  it('useAsyncTask rethrows when requested and still resets loading', async () => {
    const task = useAsyncTask()
    const error = new Error('boom')

    await expect(task.run(async () => {
      throw error
    }, {
      rethrow: true,
    })).rejects.toThrow('boom')

    expect(task.loading.value).toBe(false)
    expect(task.error.value).toBe(error)
  })

  it('useAsyncData loads data and supports resetOnLoad', async () => {
    const asyncData = useAsyncData({
      initialValue: ['old'],
    })

    const result = await asyncData.load(async () => ['new'], {
      resetOnLoad: true,
    })

    expect(result).toEqual(['new'])
    expect(asyncData.data.value).toEqual(['new'])
    expect(asyncData.loading.value).toBe(false)
  })

  it('useStorageState restores defaults when ttl payload is expired', () => {
    window.localStorage.setItem('ttl-key', JSON.stringify({
      value: { a: 1 },
      expiresAt: Date.now() - 1000,
    }))

    const { state } = useStorageState('ttl-key', {
      defaultValue: { a: 2 },
      ttl: 1000,
    })

    expect(state.value).toEqual({ a: 2 })
    expect(window.localStorage.getItem('ttl-key')).toBe(null)
  })

  it('useStorageState persists writes', async () => {
    const { state, write } = useStorageState('plain-key', {
      defaultValue: { a: 1 },
    })

    write({ a: 3 })
    await nextTick()

    expect(state.value).toEqual({ a: 3 })
    expect(JSON.parse(window.localStorage.getItem('plain-key'))).toEqual({ a: 3 })
  })

  it('useRouteQueryState syncs from route and pushes updates', async () => {
    route.query = { tab: 'results' }
    const { state, set } = useRouteQueryState('tab', {
      defaultValue: 'upload',
      parse: (value) => value,
      serialize: (value) => value,
    })

    await nextTick()
    expect(state.value).toBe('results')

    await set('upload')

    expect(pushMock).toHaveBeenCalledWith({
      query: { tab: 'upload' },
    })
    expect(route.query.tab).toBe('upload')
  })

  it('usePartitionCache returns cached partition data before loading', async () => {
    window.sessionStorage.setItem('partition_data_cache', JSON.stringify([{ id: 1 }]))
    const { getPartitionData } = usePartitionCache()
    const loader = vi.fn()

    const result = await getPartitionData(loader)

    expect(result).toEqual([{ id: 1 }])
    expect(loader).not.toHaveBeenCalled()
  })

  it('usePartitionCache caches transformed yindian tree', async () => {
    const { getYindianTree, getCachedYindianTree } = usePartitionCache()
    const loader = vi.fn(async () => ({ a: 1, b: 2 }))

    const tree = await getYindianTree(loader, {
      transform: (value) => ({ a: value.a }),
    })

    expect(tree).toEqual({ a: 1 })
    expect(getCachedYindianTree()).toEqual({ a: 1 })
  })

  it('useAuthGuard redirects guests and preserves redirect path', async () => {
    route.fullPath = '/secure/page?foo=1'
    const { requireAuth } = useAuthGuard({
      defaultRedirect: '/fallback',
    })

    const allowed = await requireAuth({
      message: 'login first',
    })

    expect(allowed).toBe(false)
    expect(showWarning).toHaveBeenCalledWith('login first')
    expect(pushMock).toHaveBeenCalledWith({
      path: '/auth',
      query: { redirect: '/secure/page?foo=1' },
    })
  })

  it('useAuthGuard allows authenticated users', async () => {
    userStore.isAuthenticated = true
    const { requireAuth } = useAuthGuard()

    const allowed = await requireAuth()

    expect(allowed).toBe(true)
    expect(pushMock).not.toHaveBeenCalled()
  })

  it('usePollingTask stops when shouldStop returns true', async () => {
    vi.useFakeTimers()

    const polling = usePollingTask({
      intervalMs: 50,
      maxFailures: 2,
    })

    let count = 0

    await polling.start(
      async () => {
        count += 1
        return { done: count >= 2, count }
      },
      {
        shouldStop: (result) => result.done,
      }
    )

    expect(polling.status.value).toBe('running')

    await vi.advanceTimersByTimeAsync(60)

    expect(polling.status.value).toBe('completed')
    expect(count).toBe(2)

    vi.useRealTimers()
  })
})

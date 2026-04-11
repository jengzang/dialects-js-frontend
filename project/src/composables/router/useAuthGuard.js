import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { userStore } from '@/main/store/store.js'
import { showWarning } from '@/utils/message.js'

export function useAuthGuard(options = {}) {
  const {
    loginPath = '/auth',
    defaultRedirect = '/',
  } = options

  const route = useRoute()
  const router = useRouter()

  const isAuthenticated = computed(() => userStore.isAuthenticated)

  async function requireAuth(guardOptions = {}) {
    if (isAuthenticated.value) {
      return true
    }

    const message = guardOptions.message
    const redirect = guardOptions.redirect ?? route.fullPath ?? defaultRedirect

    if (message) {
      showWarning(message)
    }

    await router.push({
      path: loginPath,
      query: { redirect },
    })

    return false
  }

  return {
    isAuthenticated,
    requireAuth,
  }
}

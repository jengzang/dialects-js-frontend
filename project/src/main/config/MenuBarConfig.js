import { computed } from 'vue'
import { useMenuTabsConfig } from '@/main/config/TabsConfig.js'

const STORAGE_KEY_PREFIX = 'menu_last_sub_'

export function useMenuBarConfig() {
  const tabsConfig = useMenuTabsConfig()

  return computed(() => tabsConfig.value.map((tab) => {
    const tabKey = tab?.to?.query?.tab || tab.tab

    return {
      ...tab,
      navigation: {
        tabKey,
        rememberSub: tab?.to?.path === '/menu' && Boolean(tabKey)
      }
    }
  }))
}

export function filterVisibleMenuBarTabs(tabs) {
  return tabs.filter((tab) => {
    if (typeof tab.visibleWhen === 'function') {
      return tab.visibleWhen()
    }
    return true
  })
}

export function readMenuBarMemory(tabKey) {
  if (!tabKey || typeof window === 'undefined') return null

  try {
    return window.sessionStorage.getItem(STORAGE_KEY_PREFIX + tabKey)
  } catch (error) {
    console.warn('Failed to read from sessionStorage:', error)
    return null
  }
}

export function writeMenuBarMemory(tabKey, sub) {
  if (!tabKey || typeof window === 'undefined') return

  try {
    if (sub) {
      window.sessionStorage.setItem(STORAGE_KEY_PREFIX + tabKey, sub)
    } else {
      window.sessionStorage.removeItem(STORAGE_KEY_PREFIX + tabKey)
    }
  } catch (error) {
    console.warn('Failed to write to sessionStorage:', error)
  }
}

export function syncMenuBarMemoryFromRoute(route) {
  if (route?.query?.tab && route?.query?.sub) {
    writeMenuBarMemory(route.query.tab, route.query.sub)
  }
}

export function isMenuBarRouteMatch(targetRoute, route) {
  if (!targetRoute) return false
  if (route.path !== targetRoute.path) return false

  if (targetRoute.query) {
    for (const [key, value] of Object.entries(targetRoute.query)) {
      if (route.query[key] !== value) return false
    }
  }

  return true
}

export function getMenuBarActiveTab(tabs, route) {
  return tabs.find((tab) => isMenuBarRouteMatch(tab.to, route))?.tab || null
}

export function resolveMenuBarTarget(tabConfig) {
  if (!tabConfig?.to) {
    return {
      path: '/menu',
      query: {
        tab: tabConfig?.navigation?.tabKey || tabConfig?.tab
      }
    }
  }

  if (!tabConfig.navigation?.rememberSub || typeof tabConfig.to !== 'object') {
    return tabConfig.to
  }

  const lastSub = readMenuBarMemory(tabConfig.navigation.tabKey)
  if (!lastSub) {
    return tabConfig.to
  }

  return {
    ...tabConfig.to,
    query: {
      ...tabConfig.to.query,
      sub: lastSub
    }
  }
}

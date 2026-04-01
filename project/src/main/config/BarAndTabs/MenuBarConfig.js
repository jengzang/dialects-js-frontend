import {computed} from 'vue'
import {useI18n} from "vue-i18n";
import {resultCache} from "@/main/store/store.js";

// ========================================
// MenuBar Configuration Guide
// ========================================
//
// This file keeps MenuBar-compatible output, but the source config now follows
// the same high-level grouping convention as ExploreBar:
// - display: visual behavior and layout
// - navigation: route target and navigation memory settings
// - meta: reserved non-UI metadata
//
// useMenuTabsConfig() returns grouped config objects.
// useMenuBarConfig() flattens them back into the legacy tab shape consumed by NavBar.
//
const STORAGE_KEY_PREFIX = 'menu_last_sub_'
const MENU_CHILD_PATHS = {
  pho: ['/pho/matrix', '/pho/custom', '/pho/count', '/pho/evolution'],
  about: ['/about/intro', '/about/suggestion', '/about/like', '/about/settings']
}

function getMenuTabKeyFromRoute(route) {
  if (typeof route?.path !== 'string') return null

  if (route.path.startsWith('/pho/')) return 'pho'
  if (route.path.startsWith('/about/')) return 'about'

  return route?.query?.tab || null
}

export function useMenuTabsConfig() {
    const {t} = useI18n()
    return computed(() => [
        {
            tab: 'pho',
            label: t('navigation.tabs.phonology'),
            icon: '🧬',
            display: {
                weight: 0.9,
                mobileWeight: 0.9,
                weightIconOnly: 0.6,
                mobileWeightIconOnly: 0.5,
                fontSize: 1.4,
                mobileFontSize: 1.5,
                isPseudo: false,
                hideOnMobile: false,
                hideLabelOnMobile: false,
                showLabelOnlyWhenActive: false,
                mobileShowLabelOnlyWhenActive: true,
                cssClass: ''
            },
            navigation: {
                defaultTo: {path: '/pho/matrix'}
            },
            meta: {}
        },
        {
            tab: 'query',
            label: t('navigation.tabs.query'),
            icon: '🔍️',
            display: {
                weight: 0.9,
                mobileWeight: 0.9,
                weightIconOnly: 0.6,
                mobileWeightIconOnly: 0.5,
                fontSize: 1.4,
                mobileFontSize: 1.5,
                isPseudo: false,
                hideOnMobile: false,
                hideLabelOnMobile: false,
                showLabelOnlyWhenActive: false,
                mobileShowLabelOnlyWhenActive: true,
                cssClass: ''
            },
            navigation: {
                defaultTo: {path: '/menu', query: {tab: 'query'}}
            },
            meta: {}
        },
        {
            tab: 'result',
            label: t('navigation.tabs.results'),
            icon: '📉',
            display: {
                weight: 0.9,
                mobileWeight: 0.9,
                weightIconOnly: 0.6,
                mobileWeightIconOnly: 0.4,
                fontSize: 1.4,
                mobileFontSize: 1.5,
                isPseudo: false,
                hideOnMobile: false,
                hideLabelOnMobile: false,
                showLabelOnlyWhenActive: false,
                mobileShowLabelOnlyWhenActive: true,
                cssClass: '',
                visibleWhen: () => resultCache.latestResults.length > 0
            },
            navigation: {
                defaultTo: {path: '/menu', query: {tab: 'result'}}
            },
            meta: {}
        },
        {
            tab: 'map',
            label: t('navigation.tabs.map'),
            icon: '🗺️',
            display: {
                weight: 0.9,
                mobileWeight: 0.9,
                weightIconOnly: 0.6,
                mobileWeightIconOnly: 0.5,
                fontSize: 1.4,
                mobileFontSize: 1.5,
                isPseudo: false,
                hideOnMobile: false,
                hideLabelOnMobile: false,
                showLabelOnlyWhenActive: false,
                mobileShowLabelOnlyWhenActive: true,
                cssClass: ''
            },
            navigation: {
                defaultTo: {path: '/menu', query: {tab: 'map'}}
            },
            meta: {}
        },
        {
            tab: 'compare',
            label: t('navigation.tabs.compare'),
            icon: '↔️',
            display: {
                weight: 0.9,
                mobileWeight: 0.9,
                weightIconOnly: 0.6,
                mobileWeightIconOnly: 0.5,
                fontSize: 1.4,
                mobileFontSize: 1.5,
                isPseudo: false,
                hideOnMobile: false,
                hideLabelOnMobile: false,
                showLabelOnlyWhenActive: false,
                mobileShowLabelOnlyWhenActive: true,
                cssClass: ''
            },
            navigation: {
                defaultTo: {path: '/menu', query: {tab: 'compare'}}
            },
            meta: {}
        },
        {
            tab: 'about',
            label: t('navigation.tabs.about'),
            icon: '🌐️',
            display: {
                weight: 0.8,
                weightIconOnly: 0.25,
                fontSize: 1.2,
                hideOnMobile: false,
                hideLabelOnMobile: false,
                showLabelOnlyWhenActive: false,
                mobileShowLabelOnlyWhenActive: true,
                cssClass: ''
            },
            navigation: {
                defaultTo: {path: '/about/intro'}
            },
            meta: {}
        },
    ])
}

export function useMenuBarConfig() {
  const tabsConfig = useMenuTabsConfig()

  return computed(() => tabsConfig.value.map((tab) => ({
    tab: tab.tab,
    label: tab.label,
    icon: tab.icon,
    to: tab.navigation?.defaultTo || null,
    ...tab.display,
    navigation: {
      ...tab.navigation,
      tabKey: tab.tab,
      rememberChild: Array.isArray(MENU_CHILD_PATHS[tab.tab])
    },
    meta: tab.meta || {}
  })))
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

export function writeMenuBarMemory(tabKey, path) {
  if (!tabKey || typeof window === 'undefined') return

  try {
    if (path) {
      window.sessionStorage.setItem(STORAGE_KEY_PREFIX + tabKey, path)
    } else {
      window.sessionStorage.removeItem(STORAGE_KEY_PREFIX + tabKey)
    }
  } catch (error) {
    console.warn('Failed to write to sessionStorage:', error)
  }
}

export function syncMenuBarMemoryFromRoute(route) {
  const tabKey = getMenuTabKeyFromRoute(route)
  if (!tabKey) return

  if (MENU_CHILD_PATHS[tabKey]?.includes(route.path)) {
    writeMenuBarMemory(tabKey, route.path)
  }
}

export function isMenuBarRouteMatch(targetRoute, route) {
  if (!targetRoute) return false

  if (typeof targetRoute === 'string') {
    return route.path === targetRoute
  }

  const targetPath = targetRoute.path
  if (targetPath && route.path !== targetPath) {
    const currentTabKey = getMenuTabKeyFromRoute(route)
    const targetTabKey = targetRoute?.navigation?.tabKey || targetRoute?.tab
    if (!(currentTabKey && targetTabKey && currentTabKey === targetTabKey)) {
      return false
    }
  }

  if (targetRoute.query) {
    for (const [key, value] of Object.entries(targetRoute.query)) {
      if (route.query[key] !== value) return false
    }
  }

  return true
}

export function getMenuBarActiveTab(tabs, route) {
  const currentTabKey = getMenuTabKeyFromRoute(route)
  if (currentTabKey) return currentTabKey
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

  if (!tabConfig.navigation?.rememberChild) {
    return tabConfig.to
  }

  const rememberedPath = readMenuBarMemory(tabConfig.navigation.tabKey)
  if (!rememberedPath) {
    return tabConfig.to
  }

  return rememberedPath
}

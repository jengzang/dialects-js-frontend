import {computed} from 'vue'
import {useI18n} from "vue-i18n";
import {resultCache} from "@/main/store/store.js";

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
        // {
        //   tab: 'tools',
        //   label: t('navigation.tabs.tools'),
        //   icon: '🧰️',
        //   weight: 0.9,                          // 桌面端标签显示时的 flex 权重
        //   mobileWeight: 0.9,                    // 移动端标签显示时的 flex 权重
        //   weightIconOnly: 0.6,                  // 桌面端仅显示图标时的 flex 权重（可选，默认使用 weight）
        //   mobileWeightIconOnly: 0.5,            // 移动端仅显示图标时的 flex 权重（可选，回退链：mobileWeight → weightIconOnly → weight）
        //   fontSize: 1.2,
        //   mobileFontSize: 1.5,                  // 移动端使用更大的字体
        //   to: { path: '/menu', query: { tab: 'tools' } },
        //   isPseudo: false,
        //   hideOnMobile: true,
        //   hideLabelOnMobile: false,             // 移动端不隐藏标签
        //   showLabelOnlyWhenActive: false,        // 桌面端：只有选中时显示文字，未选中只显示图标
        //   mobileShowLabelOnlyWhenActive: true, // 移动端：始终显示文字（不同于桌面端）
        //   cssClass: ''                     // 应用 'small' CSS class
        // },
        //   {
        //   tab: 'home',
        //   label: t('navigation.tabs.home'),
        //   icon: '🏠',
        //   weight: 0.8,                          // 桌面端标签显示时的 flex 权重
        //   weightIconOnly: 0.4,                  // 桌面端仅显示图标时的 flex 权重（可选，默认使用 weight）
        //   fontSize: 1.3,
        //   to: { path: '/' },
        //   hideOnMobile: false,
        //   hideLabelOnMobile: false,             // 移动端不隐藏标签
        //   showLabelOnlyWhenActive: false,        // 桌面端：只有选中时显示文字，未选中只显示图标
        //   mobileShowLabelOnlyWhenActive: true, // 移动端：始终显示文字（不同于桌面端）
        //   cssClass: ''                     // 应用 'small' CSS class
        // },
        // {
        //   tab: 'cluster',
        //   label: t('navigation.tabs.dialectClustering'),
        //   icon: '🧩',
        //   weight: 0.9,
        //   mobileWeight: 0.9,
        //   weightIconOnly: 0.6,
        //   mobileWeightIconOnly: 0.5,
        //   fontSize: 1.4,
        //   mobileFontSize: 1.5,
        //   to: { path: '/menu', query: { tab: 'cluster' } },
        //   isPseudo: false,
        //   hideOnMobile: false,
        //   hideLabelOnMobile: false,
        //   showLabelOnlyWhenActive: false,
        //   mobileShowLabelOnlyWhenActive: true,
        //   cssClass: ''
        // },
        {
            tab: 'pho',
            label: t('navigation.tabs.phonology'),
            icon: '🧬',
            weight: 0.9,                          // 桌面端标签显示时的 flex 权重
            mobileWeight: 0.9,                    // 移动端标签显示时的 flex 权重
            weightIconOnly: 0.6,                  // 桌面端仅显示图标时的 flex 权重（可选，默认使用 weight）
            mobileWeightIconOnly: 0.5,            // 移动端仅显示图标时的 flex 权重（可选，回退链：mobileWeight → weightIconOnly → weight）
            fontSize: 1.4,
            mobileFontSize: 1.5,                  // 移动端使用更大的字体
            to: {path: '/pho/matrix'},
            isPseudo: false,
            hideOnMobile: false,
            hideLabelOnMobile: false,             // 移动端不隐藏标签
            showLabelOnlyWhenActive: false,        // 桌面端：只有选中时显示文字，未选中只显示图标
            mobileShowLabelOnlyWhenActive: true, // 移动端：始终显示文字（不同于桌面端）
            cssClass: ''                     // 应用 'small' CSS class
        },

        // {
        //   tab: 'words',
        //   label: t('navigation.tabs.phrases'),
        //   icon: '📖',
        //   weight: 0.9,                          // 桌面端标签显示时的 flex 权重
        //   mobileWeight: 0.9,                // 移动端标签显示时的 flex 权重
        //   weightIconOnly: 0.6,                  // 桌面端仅显示图标时的 flex 权重（可选，默认使用 weight）
        //   mobileWeightIconOnly: 0.4,            // 移动端仅显示图标时的 flex 权重（可选，回退链：mobileWeight → weightIconOnly → weight）
        //   fontSize: 1.2,
        //   mobileFontSize: 1.5,                  // 移动端使用更大的字体
        //   to: { path: '/menu', query: { tab: 'words' } },
        //   isPseudo: false,
        //   hideOnMobile: false,
        //   hideLabelOnMobile: false,             // 移动端不隐藏标签
        //   showLabelOnlyWhenActive: false,        // 桌面端：只有选中时显示文字，未选中只显示图标
        //   mobileShowLabelOnlyWhenActive: true, // 移动端：始终显示文字（不同于桌面端）
        //   cssClass: ''                     // 应用 'small' CSS class
        // },
        {
            tab: 'query',
            label: t('navigation.tabs.query'),
            icon: '🔍️',
            weight: 0.9,                          // 桌面端标签显示时的 flex 权重
            mobileWeight: 0.9,                    // 移动端标签显示时的 flex 权重
            weightIconOnly: 0.6,                  // 桌面端仅显示图标时的 flex 权重（可选，默认使用 weight）
            mobileWeightIconOnly: 0.5,            // 移动端仅显示图标时的 flex 权重（可选，回退链：mobileWeight → weightIconOnly → weight）
            fontSize: 1.4,
            mobileFontSize: 1.5,                  // 移动端使用更大的字体
            to: {path: '/menu', query: {tab: 'query'}},
            isPseudo: false,
            hideOnMobile: false,
            hideLabelOnMobile: false,             // 移动端不隐藏标签
            showLabelOnlyWhenActive: false,        // 桌面端：只有选中时显示文字，未选中只显示图标
            mobileShowLabelOnlyWhenActive: true, // 移动端：始终显示文字（不同于桌面端）
            cssClass: ''
        },

        {
            tab: 'result',
            label: t('navigation.tabs.results'),
            icon: '📉',
            weight: 0.9,                          // 桌面端标签显示时的 flex 权重
            mobileWeight: 0.9,                    // 移动端标签显示时的 flex 权重
            weightIconOnly: 0.6,                  // 桌面端仅显示图标时的 flex 权重（可选，默认使用 weight）
            mobileWeightIconOnly: 0.4,            // 移动端仅显示图标时的 flex 权重（可选，回退链：mobileWeight → weightIconOnly → weight）
            fontSize: 1.4,
            mobileFontSize: 1.5,
            to: {path: '/menu', query: {tab: 'result'}},
            isPseudo: false,
            hideOnMobile: false,
            hideLabelOnMobile: false,
            showLabelOnlyWhenActive: false,
            mobileShowLabelOnlyWhenActive: true,
            cssClass: '',
            visibleWhen: () => resultCache.latestResults.length > 0  // 只有在有查询结果时才显示
        },
        {
            tab: 'map',
            label: t('navigation.tabs.map'),
            icon: '🗺️',
            weight: 0.9,                          // 桌面端标签显示时的 flex 权重
            mobileWeight: 0.9,                    // 移动端标签显示时的 flex 权重
            weightIconOnly: 0.6,                  // 桌面端仅显示图标时的 flex 权重（可选，默认使用 weight）
            mobileWeightIconOnly: 0.5,            // 移动端仅显示图标时的 flex 权重（可选，回退链：mobileWeight → weightIconOnly → weight）
            fontSize: 1.4,
            mobileFontSize: 1.5,                  // 移动端使用更大的字体
            to: {path: '/menu', query: {tab: 'map'}},
            isPseudo: false,
            hideOnMobile: false,
            hideLabelOnMobile: false,             // 移动端不隐藏标签
            showLabelOnlyWhenActive: false,        // 桌面端：只有选中时显示文字，未选中只显示图标
            mobileShowLabelOnlyWhenActive: true, // 移动端：始终显示文字（不同于桌面端）
            cssClass: ''
        },
        {
            tab: 'compare',
            label: t('navigation.tabs.compare'),
            icon: '↔️',
            weight: 0.9,                          // 桌面端标签显示时的 flex 权重
            mobileWeight: 0.9,                    // 移动端标签显示时的 flex 权重
            weightIconOnly: 0.6,                  // 桌面端仅显示图标时的 flex 权重（可选，默认使用 weight）
            mobileWeightIconOnly: 0.5,            // 移动端仅显示图标时的 flex 权重（可选，回退链：mobileWeight → weightIconOnly → weight）
            fontSize: 1.4,
            mobileFontSize: 1.5,                  // 移动端使用更大的字体
            to: {path: '/menu', query: {tab: 'compare'}},
            isPseudo: false,
            hideOnMobile: false,
            hideLabelOnMobile: false,             // 移动端不隐藏标签
            showLabelOnlyWhenActive: false,        // 桌面端：只有选中时显示文字，未选中只显示图标
            mobileShowLabelOnlyWhenActive: true, // 移动端：始终显示文字（不同于桌面端）
            cssClass: ''
        },
        // {
        //   tab: 'villages',
        //   label: t('navigation.tabs.villages'),
        //   icon: '🏘️',
        //   weight: 0.9,                          // 桌面端标签显示时的 flex 权重
        //   mobileWeight: 0.8,                // 移动端标签显示时的 flex 权重
        //   weightIconOnly: 0.6,                  // 桌面端仅显示图标时的 flex 权重（可选，默认使用 weight）
        //   mobileWeightIconOnly: 0.4,            // 移动端仅显示图标时的 flex 权重（可选，回退链：mobileWeight → weightIconOnly → weight）
        //   fontSize: 1.2,
        //   mobileFontSize: 1.5,                  // 移动端使用更大的字体
        //   to: { path: '/menu', query: { tab: 'villages' } },
        //   isPseudo: false,
        //   hideOnMobile: false,
        //   hideLabelOnMobile: false,             // 移动端不隐藏标签
        //   showLabelOnlyWhenActive: false,        // 桌面端：只有选中时显示文字，未选中只显示图标
        //   mobileShowLabelOnlyWhenActive: true, // 移动端：始终显示文字（不同于桌面端）
        //   cssClass: ''                     // 应用 'small' CSS class
        // },
        {
            tab: 'about',
            label: t('navigation.tabs.about'),
            icon: '🌐️',
            weight: 0.8,                          // 桌面端标签显示时的 flex 权重
            weightIconOnly: 0.25,                  // 桌面端仅显示图标时的 flex 权重（可选，默认使用 weight）
            fontSize: 1.2,
            to: {path: '/about/intro'},
            hideOnMobile: false,
            hideLabelOnMobile: false,             // 移动端不隐藏标签
            showLabelOnlyWhenActive: false,        // 桌面端：只有选中时显示文字，未选中只显示图标
            mobileShowLabelOnlyWhenActive: true, // 移动端：始终显示文字（不同于桌面端）
            cssClass: ''                     // 应用 'small' CSS class
        },
    ])
}

export function useMenuBarConfig() {
  const tabsConfig = useMenuTabsConfig()

  return computed(() => tabsConfig.value.map((tab) => ({
    ...tab,
    navigation: {
      tabKey: tab.tab,
      rememberChild: Array.isArray(MENU_CHILD_PATHS[tab.tab])
    }
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

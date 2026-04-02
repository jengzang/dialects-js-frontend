import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

// ========================================
// ExploreBar Configuration Guide
// ========================================
//
// Final display config merge order:
// 1. DISPLAY_DEFAULTS
// 2. DISPLAY_PRESETS[display.preset]
// 3. display.overrides
//
// Recommended per-tab shape:
//
// createExploreTab({
//   tab: 'example',
//   label: t('...'),
//   icon: '...',
//   display: {
//     preset: 'standard',
//     overrides: {
//       weight: 1,
//       mobileWeight: 1,
//       weightIconOnly: 0.6,
//       mobileWeightIconOnly: 0.55,
//       fontSize: 1.2,
//       mobileFontSize: 1.2,
//       hideOnMobile: false,
//       hideLabelOnMobile: false,
//       showLabelOnlyWhenActive: false,
//       mobileShowLabelOnlyWhenActive: true,
//       cssClass: '',
//       visibleWhen: null
//     }
//   },
//   navigation: {
//     defaultTo: null,
//     matchPages: [],
//     activeMatchPaths: [],
//     rememberChild: false,
//     defaultChild: null,
//     children: []
//   },
//   meta: {}
// })
//
// Preset notes:
// - standard: baseline desktop/mobile behavior
// - compactDesktop: smaller desktop footprint
// - balancedMobile: slightly larger mobile readability
//
const DISPLAY_DEFAULTS = {
  // Flex sizing
  weight: 1,
  mobileWeight: 1,
  weightIconOnly: 0.6,
  mobileWeightIconOnly: 0.55,

  // Typography
  fontSize: 1.2,
  mobileFontSize: 1.2,

  // Visibility / behavior
  isPseudo: false,
  hideOnMobile: false,
  hideLabelOnMobile: false,
  showLabelOnlyWhenActive: false,
  mobileShowLabelOnlyWhenActive: true,

  // Styling / conditional visibility
  cssClass: '',
  visibleWhen: null
}

const NAVIGATION_DEFAULTS = {
  defaultTo: null,
  matchPages: [],
  activeMatchPaths: [],
  rememberChild: false,
  defaultChild: null,
  children: []
}

const DISPLAY_PRESETS = {
  // Full baseline config from DISPLAY_DEFAULTS.
  standard: {},

  // Smaller desktop footprint. Good for tabs that should take less visual width.
  compactDesktop: {
    weight: 0.8,
    mobileWeight: 0.8,
    weightIconOnly: 0.25,
    mobileWeightIconOnly: 0.25,
    fontSize: 0.9,
    mobileFontSize: 0.9
  },

  // Keeps desktop standard, but makes mobile labels a bit easier to read.
  balancedMobile: {
    mobileWeightIconOnly: 0.6,
    mobileFontSize: 1.3
  }
}

const createDisplayConfig = ({ preset = 'standard', overrides = {} } = {}) => ({
  ...DISPLAY_DEFAULTS,
  ...(DISPLAY_PRESETS[preset] || {}),
  ...overrides
})

const createNavigationConfig = (overrides = {}) => ({
  ...NAVIGATION_DEFAULTS,
  ...overrides
})

const createExploreTab = ({
  tab,
  label,
  icon,
  display,
  navigation,
  meta = {}
}) => ({
  tab,
  label,
  icon,
  display: createDisplayConfig(display),
  navigation: createNavigationConfig(navigation),
  meta
})

export function getExploreBarTabs(configMap) {
  return Object.values(configMap).map((config) => ({
    tab: config.tab,
    label: config.label,
    icon: config.icon,
    to: config.navigation.defaultTo,
    navigation: config.navigation,
    ...config.display
  }))
}

export function filterVisibleExploreBarTabs(tabs) {
  return tabs.filter((tab) => {
    if (typeof tab.visibleWhen === 'function') {
      return tab.visibleWhen()
    }
    return true
  })
}

export function getExploreBarChildren(configMap, tabKey) {
  return configMap[tabKey]?.navigation?.children || []
}

export function getExploreBarActiveTab(tabs, route, router) {
  return tabs.find((tab) => {
    const activeMatchPaths = tab.navigation?.activeMatchPaths || []
    if (activeMatchPaths.includes(route.path)) {
      return true
    }

    const targets = [tab.to, ...(tab.navigation?.children || []).map((child) => child.path)]

    return targets.some((target) => {
      if (!target) return false

      const resolved = router.resolve(target)
      if (resolved.path !== route.path) return false

      return Object.entries(resolved.query || {}).every(([key, value]) => route.query[key] === value)
    })
  })?.tab || null
}

export function matchExploreBarChildRoute(childPath, route, router) {
  const resolved = router.resolve(childPath)

  if (resolved.path !== route.path) {
    return false
  }

  return Object.entries(resolved.query || {}).every(([key, value]) => {
    return route.query[key] === value
  })
}

export function useExploreBarConfig() {
  const { t } = useI18n()

  return computed(() => ({
    tools: createExploreTab({
      tab: 'tools',
      label: t('navigation.tabs.tools'),
      icon: '\uD83D\uDD27',
      display: {
        preset: 'balancedMobile',
        overrides: {}
      },
      navigation: {
        defaultTo: { path: '/menu/tools' },
        matchPages: ['check', 'jyut2ipa', 'merge', 'praat'],
        activeMatchPaths: ['/explore/manage'],
        rememberChild: true,
        defaultChild: '/explore/tools/check',
        children: [
          { label: t('navigation.submenu.tools.check'), icon: '\uD83D\uDCDD', path: '/explore/tools/check' },
          { label: t('navigation.submenu.tools.jyut2ipa'), icon: '\uD83D\uDD1C', path: '/explore/tools/jyut2ipa' },
          { label: t('navigation.submenu.tools.merge'), icon: '\uD83D\uDD06', path: '/explore/tools/merge' },
          { label: t('navigation.submenu.tools.praat'), icon: '\uD83C\uDF98', path: '/explore/tools/praat' }
        ]
      }
    }),
    praat: createExploreTab({
      tab: 'praat',
      label: t('navigation.tabs.praat'),
      icon: '\uD83C\uDF99\uFE0F',
      display: {
        preset: 'balancedMobile',
        overrides: {
          mobileWeightIconOnly: 0.6
        }
      },
      navigation: {
        defaultTo: { path: '/explore/tools/praat' },
        matchPages: ['praat']
      }
    }),
    charClass: createExploreTab({
      tab: 'charClass',
      label: t('navigation.tabs.charClass'),
      icon: '\uD83D\uDCDA',
      display: {
        preset: 'standard',
        overrides: {}
      },
      navigation: {
        defaultTo: { path: '/explore/char-class', query: { tab: 'zhonggu' } },
        matchPages: ['CharacterClassification'],
        rememberChild: true,
        defaultChild: '/explore/char-class?tab=zhonggu',
        children: [
          { label: t('navigation.submenu.charClass.zhonggu'), icon: '\uD83D\uDCDC', path: '/explore/char-class?tab=zhonggu' },
          { label: t('navigation.submenu.charClass.shanggu'), icon: '\uD83C\uDFDB\uFE0F', path: '/explore/char-class?tab=shanggu' },
          { label: t('navigation.submenu.charClass.jingu'), icon: '\uD83D\uDCC9', path: '/explore/char-class?tab=jingu' },
          { label: t('navigation.submenu.charClass.yueyun'), icon: '\uD83C\uDF8D', path: '/explore/char-class?tab=yueyun' }
        ]
      }
    }),
    words: createExploreTab({
      tab: 'words',
      label: t('navigation.tabs.phrases'),
      icon: '\uD83D\uDCDD',
      display: {
        preset: 'standard',
        overrides: {}
      },
      navigation: {
        defaultTo: { path: '/menu/words' },
        matchPages: ['YuBao', 'ycSpoken'],
        rememberChild: true,
        defaultChild: '/explore/yubao?tab=vocabulary',
        children: [
          { label: t('navigation.submenu.words.vocabulary'), icon: '\uD83D\uDCDD', path: '/explore/yubao?tab=vocabulary' },
          { label: t('navigation.submenu.words.grammar'), icon: '\uD83D\uDDE3\uFE0F', path: '/explore/yubao?tab=grammar' },
          { label: t('navigation.submenu.words.ycSpoken'), icon: '\uD83C\uDF00', path: '/explore/yc-spoken' }
        ]
      }
    }),
    villages: createExploreTab({
      tab: 'villages',
      label: t('navigation.tabs.villages'),
      icon: '\uD83C\uDFD8\uFE0F',
      display: {
        preset: 'standard',
        overrides: {}
      },
      navigation: {
        defaultTo: { path: '/menu/villages' },
        matchPages: ['gdVillages', 'gdVillagesTable', 'ycVillages', 'VillagesML'],
        rememberChild: true,
        defaultChild: '/explore/villages/gd',
        children: [
          { label: t('navigation.submenu.villages.gdVillages'), icon: '\uD83C\uDFD8\uFE0F', path: '/explore/villages/gd' },
          { label: t('navigation.submenu.villages.VillagesML'), icon: '\uD83E\uDD7B', path: '/explore/villages/ml' },
          { label: t('navigation.submenu.villages.gdVillagesTable'), icon: '\uD83D\uDCC8', path: '/explore/villages/table' },
          { label: t('navigation.submenu.villages.ycVillages'), icon: '\uD83C\uDFE0', path: '/explore/villages/yc' }
        ]
      }
    }),
    about: createExploreTab({
      tab: 'about',
      label: t('navigation.tabs.aboutWebsite'),
      icon: '\uD83E\uDEF6',
      display: {
        preset: 'compactDesktop',
        overrides: {
          hideOnMobile: true
        }
      },
      navigation: {
        defaultTo: { path: '/menu/about/intro' }
      }
    })
  }))
}

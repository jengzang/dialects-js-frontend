export const MENU_LEGACY_ROUTES = {
  pho: {
    defaultPath: '/pho/matrix',
    subMap: {
      phonologyMatrix: '/pho/matrix',
      phonologyCustom: '/pho/custom',
      Countphos: '/pho/count',
      evolution: '/pho/evolution',
      pieVector: '/pho/evolution'
    }
  },
  about: {
    defaultPath: '/about/intro',
    subMap: {
      intro: '/about/intro',
      suggestion: '/about/suggestion',
      like: '/about/like',
      setting: '/about/settings'
    }
  }
}

export const EXPLORE_LEGACY_ROUTES = {
  check: {
    path: '/explore/tools/check'
  },
  jyut2ipa: {
    path: '/explore/tools/jyut2ipa'
  },
  merge: {
    path: '/explore/tools/merge'
  },
  praat: {
    path: '/explore/tools/praat'
  },
  YuBao: {
    path: '/explore/yubao',
    defaultTab: 'vocabulary',
    tabMap: {
      vocabulary: 'vocabulary',
      grammar: 'grammar'
    }
  }
}

export function resolveLegacyMenuRoute(query = {}) {
  const { tab, sub, ...restQuery } = query
  const config = MENU_LEGACY_ROUTES[tab]

  if (!config) {
    return null
  }

  return {
    path: config.subMap?.[sub] || config.defaultPath,
    query: restQuery
  }
}

export function resolveLegacyExploreRoute(query = {}) {
  const { page, sub, ...restQuery } = query
  const config = EXPLORE_LEGACY_ROUTES[page]

  if (!config) {
    return null
  }

  if (page === 'YuBao') {
    return {
      path: config.path,
      query: {
        ...restQuery,
        tab: config.tabMap?.[sub] || config.defaultTab
      }
    }
  }

  return {
    path: config.path,
    query: restQuery
  }
}

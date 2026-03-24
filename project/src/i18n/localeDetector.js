// src/i18n/localeDetector.js
// 语言检测和持久化逻辑

const LOCALE_STORAGE_KEY = 'user-locale'

/**
 * 支持的语言列表
 */
export const SUPPORTED_LOCALES = {
  'zh-Hant': {
    code: 'zh-Hant',
    name: '繁體中文',
    flag: '🇭🇰'
  },
  'zh-CN': {
    code: 'zh-CN',
    name: '简体中文',
    flag: '🇨🇳'
  },
  'en': {
    code: 'en',
    name: 'English',
    flag: '🇺🇸'
  }
}

/**
 * 默认语言
 */
export const DEFAULT_LOCALE = 'zh-Hant'

/**
 * 从 localStorage 获取保存的语言设置
 * @returns {string|null}
 */
export function getSavedLocale() {
  try {
    return localStorage.getItem(LOCALE_STORAGE_KEY)
  } catch (e) {
    console.warn('Failed to read locale from localStorage:', e)
    return null
  }
}

/**
 * 保存语言设置到 localStorage
 * @param {string} locale
 */
export function saveLocale(locale) {
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale)
  } catch (e) {
    console.warn('Failed to save locale to localStorage:', e)
  }
}

/**
 * 检测浏览器语言
 * @returns {string}
 */
export function detectBrowserLocale() {
  const browserLang = navigator.language || navigator.userLanguage

  // 繁体中文检测
  if (browserLang.startsWith('zh-TW') ||
      browserLang.startsWith('zh-HK') ||
      browserLang.startsWith('zh-Hant')) {
    return 'zh-Hant'
  }

  // 简体中文检测
  if (browserLang.startsWith('zh-CN') ||
      browserLang.startsWith('zh-Hans') ||
      browserLang.startsWith('zh')) {
    return 'zh-CN'
  }

  // 英文检测
  if (browserLang.startsWith('en')) {
    return 'en'
  }

  // 默认返回繁体中文
  return DEFAULT_LOCALE
}

/**
 * 获取当前应该使用的语言
 * 优先级：localStorage > 浏览器语言 > 默认语言
 * @returns {string}
 */
export function getCurrentLocale() {
  // 1. 优先读取 localStorage
  const savedLocale = getSavedLocale()
  if (savedLocale && SUPPORTED_LOCALES[savedLocale]) {
    return savedLocale
  }

  // 2. 检测浏览器语言
  const browserLocale = detectBrowserLocale()
  if (SUPPORTED_LOCALES[browserLocale]) {
    return browserLocale
  }

  // 3. 返回默认语言
  return DEFAULT_LOCALE
}

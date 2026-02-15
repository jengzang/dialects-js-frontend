/**
 * URL 参数处理工具函数
 * 用于音系查询组件的 URL 参数化和通用 URL 工具
 */

// ==================== 通用 URL 工具 ====================

/**
 * 解码 URL 参数（支持 Base64 编码）
 * @param {string} encodedParam - 编码后的参数字符串
 * @returns {Object} 解码后的参数对象
 * @example
 * const params = decodeParams('eyJmb28iOiJiYXIifQ==')
 * console.log(params) // { foo: 'bar' }
 */
export function decodeParams(encodedParam) {
  try {
    if (!encodedParam) return {}

    // 尝试 Base64 解码
    const decoded = atob(encodedParam)
    return JSON.parse(decoded)
  } catch (error) {
    console.error('Failed to decode params:', error)
    return {}
  }
}

/**
 * 构建查询 URL（将对象转换为查询字符串）
 * @param {string} baseUrl - 基础 URL
 * @param {Object} params - 查询参数对象
 * @param {boolean} encode - 是否 Base64 编码参数（默认 false）
 * @returns {string} 完整的查询 URL
 * @example
 * const url = buildQueryUrl('/search', { char: '香', tone: '1' })
 * console.log(url) // '/search?char=香&tone=1'
 */
export function buildQueryUrl(baseUrl, params = {}, encode = false) {
  if (!params || Object.keys(params).length === 0) {
    return baseUrl
  }

  if (encode) {
    // Base64 编码模式
    const encoded = btoa(JSON.stringify(params))
    return `${baseUrl}?q=${encodeURIComponent(encoded)}`
  }

  // 普通查询字符串模式
  const queryString = Object.entries(params)
    .filter(([_, value]) => value !== null && value !== undefined && value !== '')
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        // 数组参数：key=val1&key=val2
        return value.map(v => `${encodeURIComponent(key)}=${encodeURIComponent(v)}`).join('&')
      }
      return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
    })
    .join('&')

  return queryString ? `${baseUrl}?${queryString}` : baseUrl
}

/**
 * 复制当前 URL 到剪贴板
 * @param {boolean} includeOrigin - 是否包含域名（默认 true）
 * @returns {Promise<boolean>} 复制是否成功
 * @example
 * await copyCurrentUrl() // 复制完整 URL
 * await copyCurrentUrl(false) // 只复制路径和查询参数
 */
export async function copyCurrentUrl(includeOrigin = true) {
  try {
    const url = includeOrigin
      ? window.location.href
      : window.location.pathname + window.location.search + window.location.hash

    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(url)
      return true
    } else {
      // 降级方案：使用 document.execCommand
      const textArea = document.createElement('textarea')
      textArea.value = url
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      document.body.appendChild(textArea)
      textArea.select()
      const success = document.execCommand('copy')
      document.body.removeChild(textArea)
      return success
    }
  } catch (error) {
    console.error('Failed to copy URL:', error)
    return false
  }
}

/**
 * 从 URL 路径段中获取值
 * @param {number} index - 路径段索引（0 为第一个段）
 * @returns {string|null} 路径段的值
 * @example
 * // URL: /explore/phonology/custom
 * getUrlSegmentValue(0) // 'explore'
 * getUrlSegmentValue(1) // 'phonology'
 * getUrlSegmentValue(2) // 'custom'
 */
export function getUrlSegmentValue(index) {
  const segments = window.location.pathname.split('/').filter(Boolean)
  return segments[index] || null
}


// ==================== 音系查询专用工具 ====================

/**
 * 从 URL 解析地点数组
 * @param {Object} route - Vue Router route 对象
 * @returns {Array<string>} 地点名称数组
 */
export function parseLocationsFromUrl(route) {
  const locParam = route.query.loc
  if (!locParam) return []

  // 处理单个字符串和数组两种情况
  const locations = Array.isArray(locParam) ? locParam : [locParam]
  // Vue Router 会自动解码，但为了兼容性，确保解码
  return locations.filter(Boolean).map(loc => {
    try {
      return decodeURIComponent(loc)
    } catch {
      return loc
    }
  })
}

/**
 * 更新 URL 中的地点参数
 * @param {Object} router - Vue Router 实例
 * @param {Array<string>} locations - 地点名称数组
 * @param {Object} additionalParams - 其他需要保留的查询参数
 */
export function updateUrlWithLocations(router, locations, additionalParams = {}) {
  const query = {
    ...router.currentRoute.value.query,
    ...additionalParams
  }

  // 删除旧的 loc 参数
  delete query.loc

  // 添加新的 loc 参数（编码中文字符）
  if (locations.length > 0) {
    query.loc = locations.map(loc => encodeURIComponent(loc))
  }

  router.replace({ query })
}

/**
 * 解析 PhonologyCustom 的所有参数
 * @param {Object} route - Vue Router route 对象
 * @returns {Object} 包含所有参数的对象
 */
export function parsePhonologyCustomParams(route) {
  // 解码参数（可能包含中文）
  const decodeParam = (param) => {
    if (!param) return ''
    try {
      return decodeURIComponent(param)
    } catch {
      return param
    }
  }

  return {
    locations: parseLocationsFromUrl(route),
    feature: decodeParam(route.query.feature),
    horizontalColumn: decodeParam(route.query.h),
    verticalColumn: decodeParam(route.query.v),
    cellRowColumn: decodeParam(route.query.c)
  }
}

/**
 * 验证音系查询参数的有效性
 * @param {Object} params - 参数对象
 * @param {Array<string>} allowedFeatures - 允许的特征列表
 * @param {Array<string>} allowedColumns - 允许的分类字段列表
 * @returns {Object} 验证结果 { isValid: boolean, errors: Array<string> }
 */
export function validatePhonologyParams(params, allowedFeatures, allowedColumns) {
  const errors = []

  // 验证特征
  if (params.feature && !allowedFeatures.includes(params.feature)) {
    errors.push(`Invalid feature: ${params.feature}`)
  }

  // 验证分类字段
  if (params.horizontalColumn && !allowedColumns.includes(params.horizontalColumn)) {
    errors.push(`Invalid horizontal column: ${params.horizontalColumn}`)
  }

  if (params.verticalColumn && !allowedColumns.includes(params.verticalColumn)) {
    errors.push(`Invalid vertical column: ${params.verticalColumn}`)
  }

  if (params.cellRowColumn && !allowedColumns.includes(params.cellRowColumn)) {
    errors.push(`Invalid cell row column: ${params.cellRowColumn}`)
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}


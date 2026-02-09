/**
 * URL 参数处理工具函数
 * 用于音系查询组件的 URL 参数化
 */

/**
 * 从 URL 解析地点数组
 * @param {Object} route - Vue Router route 对象
 * @returns {Array<string>} 地点名称数组
 */
export function parseLocationsFromUrl(route) {
  const locParam = route.query.loc
  if (!locParam) return []

  // 处理单个字符串和数组两种情况
  if (Array.isArray(locParam)) {
    return locParam.filter(Boolean)
  }
  return [locParam].filter(Boolean)
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

  // 添加新的 loc 参数
  if (locations.length > 0) {
    query.loc = locations
  }

  router.replace({ query })
}

/**
 * 解析 PhonologyCustom 的所有参数
 * @param {Object} route - Vue Router route 对象
 * @returns {Object} 包含所有参数的对象
 */
export function parsePhonologyCustomParams(route) {
  return {
    locations: parseLocationsFromUrl(route),
    feature: route.query.feature || '',
    horizontalColumn: route.query.h || '',
    verticalColumn: route.query.v || '',
    cellRowColumn: route.query.c || ''
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

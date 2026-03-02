// src/config/subsetFilters.js
// 子集分析筛选器配置
//
// 重要说明：
// 本配置仅包含 searchVillages API 实际支持的筛选字段
// API 支持：keyword, city, county, township, page, page_size
//
// 已移除不支持的字段：
// - semantic（语义类别）- 需要加载全部数据，性能差
// - structure（结构模式）- 需要加载全部数据，性能差
// - length（长度）- 需要加载全部数据，性能差

/**
 * 筛选字段配置
 * @type {Array<{label: string, value: string, description: string}>}
 */
export const FILTER_FIELDS = [
  { label: '村名', value: 'name', description: '根据村庄名称筛选' },
  { label: '區域', value: 'region', description: '根据地理区域筛选' }
]

/**
 * 操作符定义
 * @type {Object<string, {label: string, value: string, description: string}>}
 */
export const OPERATORS = {
  contains: { label: '包含', value: 'contains', description: '字符串包含指定内容' },
  equals: { label: '等於', value: 'equals', description: '完全匹配' },
  startsWith: { label: '開頭為', value: 'startsWith', description: '以指定内容开头' },
  endsWith: { label: '結尾為', value: 'endsWith', description: '以指定内容结尾' }
}

/**
 * 字段支持的操作符映射
 * @type {Object<string, Array<string>>}
 */
export const FIELD_OPERATORS_MAP = {
  // 村名：后端 keyword 参数支持 contains，前端再精确筛选其他操作符
  name: ['contains', 'equals', 'startsWith', 'endsWith'],

  // 区域：后端 city/county/township 参数支持精确匹配
  region: ['equals']
}

/**
 * 获取指定字段支持的操作符选项
 * @param {string} field - 字段类型
 * @returns {Array<{label: string, value: string}>} 操作符选项列表
 */
export function getOperatorOptions(field) {
  const operatorKeys = FIELD_OPERATORS_MAP[field] || []
  return operatorKeys.map(key => ({
    label: OPERATORS[key].label,
    value: OPERATORS[key].value
  }))
}

/**
 * 获取字段的默认操作符
 * @param {string} field - 字段类型
 * @returns {string} 默认操作符
 */
export function getDefaultOperator(field) {
  const operators = FIELD_OPERATORS_MAP[field] || []
  return operators.length > 0 ? operators[0] : 'equals'
}

/**
 * 验证字段和操作符组合是否有效
 * @param {string} field - 字段类型
 * @param {string} operator - 操作符
 * @returns {boolean} 是否有效
 */
export function isValidFieldOperator(field, operator) {
  const operators = FIELD_OPERATORS_MAP[field] || []
  return operators.includes(operator)
}

/**
 * 获取字段的值输入类型
 * @param {string} field - 字段类型
 * @returns {'text'|'region'} 输入类型
 */
export function getFieldInputType(field) {
  if (field === 'region') return 'region'  // 使用 FilterableSelect
  return 'text'  // 使用文本输入
}

/**
 * 获取字段的选项列表（用于 select 类型）
 * @param {string} field - 字段类型
 * @returns {Array<{label: string, value: string}>} 选项列表
 */
export function getFieldOptions(field) {
  // 目前没有需要下拉选择的字段
  return []
}

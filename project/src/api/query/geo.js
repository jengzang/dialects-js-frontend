// api/query/geo.js - 地理数据查询 API
import { api } from '../auth/auth.js'
import { showError } from '@/utils/message.js'

/**
 * @typedef {Object} CoordinatesParams
 * @property {string[]} [locations] - 地点列表
 * @property {string} [feature] - 特征字段
 * @property {string} [value] - 特征值
 */

/**
 * @typedef {Object} CoordinateData
 * @property {number} longitude - 经度
 * @property {number} latitude - 纬度
 * @property {string} location - 地点名称
 * @property {any} value - 特征值
 */

/**
 * 获取坐标数据
 * @param {CoordinatesParams} params - 查询参数
 * @returns {Promise<CoordinateData[]>} 坐标数据数组
 * @throws {Error} 查询失败
 * @example
 * const coords = await getCoordinates({
 *   locations: ['广州', '香港'],
 *   feature: 'tone',
 *   value: '平'
 * })
 */
export async function getCoordinates(params) {
  try {
    // Normalize locations: accept array or comma-string, trim each entry
    const rawLocations = params.locations
    const locations = Array.isArray(rawLocations)
      ? rawLocations.map(s => s.trim()).filter(Boolean)
      : (rawLocations || '').split(',').map(s => s.trim()).filter(Boolean)

    // Normalize regions the same way
    const rawRegions = params.regions
    const regions = Array.isArray(rawRegions)
      ? rawRegions.map(s => s.trim()).filter(Boolean)
      : (rawRegions || '').split(',').map(s => s.trim()).filter(Boolean)

    const body = { locations, regions }
    if (params.region_mode) body.region_mode = params.region_mode
    if (params.iscustom) body.iscustom = params.iscustom
    if (params.flag) body.flag = params.flag
    if (params.feature) body.feature = params.feature
    if (params.value) body.value = params.value

    return await api('/api/get_coordinates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
  } catch (error) {
    console.error('Get coordinates error:', error)
    showError(error.message || '獲取坐標數據失敗')
    throw new Error(error.message || '獲取坐標數據失敗')
  }
}

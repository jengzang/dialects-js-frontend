// api/query/geo.js - 地理数据查询 API
import { api } from '../auth/auth.js'

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
    const query = new URLSearchParams()

    query.append('locations', params.locations || '')
    query.append('regions', params.regions || '')
    if (params.region_mode) query.append('region_mode', params.region_mode)
    if (params.iscustom) query.append('iscustom', params.iscustom)
    if (params.flag) query.append('flag', params.flag)
    if (params.feature) query.append('feature', params.feature)
    if (params.value) query.append('value', params.value)

    return await api(`/api/get_coordinates?${query.toString()}`)
  } catch (error) {
    console.error('Get coordinates error:', error)
    throw new Error(error.message || '獲取坐標數據失敗')
  }
}

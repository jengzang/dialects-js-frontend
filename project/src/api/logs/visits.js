// api/logs/visits.js - 访问统计 API
import { api } from '../auth/auth.js'

/**
 * @typedef {Object} VisitStats
 * @property {number} count - 访问次数
 */

/**
 * @typedef {Object} VisitHistoryParams
 * @property {string} start_date - 开始日期（YYYY-MM-DD）
 * @property {string} end_date - 结束日期（YYYY-MM-DD）
 * @property {number} [limit=9999] - 限制结果数量
 */

/**
 * @typedef {Object} VisitHistoryItem
 * @property {string} date - 日期
 * @property {number} count - 访问次数
 */

/**
 * 获取今日访问量
 * @returns {Promise<VisitStats>} 今日访问统计
 * @throws {Error} 获取失败
 * @example
 * const todayStats = await getTodayVisits()
 * console.log(todayStats.count) // 123
 */
export async function getTodayVisits() {
  try {
    return await api('/logs/visits/today')
  } catch (error) {
    console.error('Get today visits error:', error)
    throw new Error(error.message || '獲取今日訪問量失敗')
  }
}

/**
 * 获取总访问量
 * @returns {Promise<VisitStats>} 总访问统计
 * @throws {Error} 获取失败
 * @example
 * const totalStats = await getTotalVisits()
 * console.log(totalStats.count) // 45678
 */
export async function getTotalVisits() {
  try {
    return await api('/logs/visits/total')
  } catch (error) {
    console.error('Get total visits error:', error)
    throw new Error(error.message || '獲取總訪問量失敗')
  }
}

/**
 * 获取访问历史
 * @param {VisitHistoryParams} params - 查询参数
 * @returns {Promise<VisitHistoryItem[]>} 访问历史数据
 * @throws {Error} 获取失败
 * @example
 * const history = await getVisitHistory({
 *   start_date: '2024-01-01',
 *   end_date: '2024-01-31',
 *   limit: 100
 * })
 */
export async function getVisitHistory(params) {
  try {
    const { start_date, end_date, limit = 9999 } = params

    const query = new URLSearchParams({
      start_date,
      end_date,
      limit: limit.toString()
    })

    return await api(`/logs/visits/history?${query.toString()}`)
  } catch (error) {
    console.error('Get visit history error:', error)
    throw new Error(error.message || '獲取訪問歷史失敗')
  }
}

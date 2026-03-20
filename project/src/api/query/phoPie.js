// api/query/phoPie.js - 音韻餅圖向量 API
import { api } from '../auth/auth.js'
import { showError } from '@/utils/message.js'

/**
 * @typedef {'characters'|'fenyun'|'hongwu'|'menggu'|'old_chinese'|'zhongyuan'} PhoPieTableName
 */

/**
 * @typedef {'聲母'|'韻母'|'聲調'} PhoFeatureKey
 * 後端固定只回傳這三個 feature。
 */

/**
 * @typedef {Object} PhoPieRequest
 * @property {string[]} locations - 必填。地點簡稱列表，至少 1 個。
 * @property {string} level1_column - 必填。一級分類欄位（必須屬於 table_name 的 hierarchy 欄位）。
 * @property {string} level2_column - 必填。二級分類欄位（同上，且不可與 level1_column 相同）。
 * @property {PhoPieTableName} [table_name='characters'] - 可選。characters.db 的目標表。
 */

/**
 * @typedef {Object} PhoPieLevel2Entry
 * @property {string} label - 二級分類值（level2）。
 * @property {number} count - 該分類命中字數。
 * @property {number} percent - 佔父層百分比（0~100）。
 * @property {string[]} chars - 命中的字（去重後）。
 */

/**
 * @typedef {Object} PhoPieByValueLevel1Entry
 * @property {string} label - 一級分類值（level1）。
 * @property {number} count - 命中字數。
 * @property {number} percent - 佔該音值百分比（0~100）。
 * @property {string[]} chars - 命中的字（去重後）。
 * @property {PhoPieLevel2Entry[]} level2 - 二級拆分。
 */

/**
 * @typedef {Object} PhoPieByValueItem
 * @property {string} value - 音值（聲母/韻母/聲調之一）。
 * @property {number} total - 該音值總字數。
 * @property {PhoPieByValueLevel1Entry[]} level1 - 一級分類分佈。
 */

/**
 * @typedef {Object} PhoPieByStatusPhoneticEntry
 * @property {string} value - 音值（聲母/韻母/聲調之一）。
 * @property {number} count - 命中字數。
 * @property {number} percent - 佔該 level1 的百分比（0~100）。
 * @property {string[]} chars - 命中的字（去重後）。
 * @property {PhoPieLevel2Entry[]} level2 - 二級拆分。
 */

/**
 * @typedef {Object} PhoPieByStatusItem
 * @property {string} level1_value - 一級分類值（level1）。
 * @property {number} total - 該 level1 總字數。
 * @property {PhoPieByStatusPhoneticEntry[]} phonetic_values - 音值分佈。
 */

/**
 * @typedef {Object} PhoPieByValueResponse
 * @property {string[]} locations
 * @property {string} level1_column
 * @property {string} level2_column
 * @property {PhoPieTableName} table_name
 * @property {{聲母: PhoPieByValueItem[], 韻母: PhoPieByValueItem[], 聲調: PhoPieByValueItem[]}} data
 */

/**
 * @typedef {Object} PhoPieByStatusResponse
 * @property {string[]} locations
 * @property {string} level1_column
 * @property {string} level2_column
 * @property {PhoPieTableName} table_name
 * @property {{聲母: PhoPieByStatusItem[], 韻母: PhoPieByStatusItem[], 聲調: PhoPieByStatusItem[]}} data
 */

const ALLOWED_TABLE_NAMES = ['characters', 'fenyun', 'hongwu', 'menggu', 'old_chinese', 'zhongyuan']

function createValidationError(message, status = 422) {
  const error = new Error(message)
  error.status = status
  return error
}

/**
 * 僅保留後端允許的四個欄位，避免多餘參數混入。
 * @param {PhoPieRequest} payload
 * @returns {PhoPieRequest}
 */
function normalizePhoPiePayload(payload) {
  const tableName = payload?.table_name || 'characters'
  const locations = Array.isArray(payload?.locations)
    ? payload.locations.map(item => String(item).trim()).filter(Boolean)
    : []
  const level1Column = typeof payload?.level1_column === 'string' ? payload.level1_column.trim() : ''
  const level2Column = typeof payload?.level2_column === 'string' ? payload.level2_column.trim() : ''

  if (locations.length === 0) {
    throw createValidationError('locations 為必填，且至少需要 1 個地點')
  }
  if (!level1Column) {
    throw createValidationError('level1_column 為必填')
  }
  if (!level2Column) {
    throw createValidationError('level2_column 為必填')
  }
  if (level1Column === level2Column) {
    throw createValidationError('level1_column 與 level2_column 不能相同')
  }
  if (!ALLOWED_TABLE_NAMES.includes(tableName)) {
    throw createValidationError('table_name 不合法', 400)
  }

  return {
    locations,
    level1_column: level1Column,
    level2_column: level2Column,
    table_name: tableName
  }
}

/**
 * 音值視角：每個音值一張餅圖（扇區 = level1 分佈）。
 * 實際路徑：POST /api/pho_pie_by_value
 * 只接受 locations / level1_column / level2_column / table_name。
 *
 * @param {PhoPieRequest} payload
 * @returns {Promise<PhoPieByValueResponse>}
 * @throws {Error} 400/422 參數非法（table/column 不合法）；404 無資料；500 伺服器錯誤。
 */
export async function postPhoPieByValue(payload) {
  try {
    const body = normalizePhoPiePayload(payload)
    return await api('/api/pho_pie_by_value', {
      method: 'POST',
      body
    })
  } catch (error) {
    console.error('Post pho pie by value error:', error)
    showError(error.message || '獲取餅圖向量（音值視角）失敗')
    throw error
  }
}

/**
 * 地位視角：每個 level1 一張餅圖（扇區 = 音值分佈）。
 * 實際路徑：POST /api/pho_pie_by_status
 * 只接受 locations / level1_column / level2_column / table_name。
 *
 * @param {PhoPieRequest} payload
 * @returns {Promise<PhoPieByStatusResponse>}
 * @throws {Error} 400/422 參數非法（table/column 不合法）；404 無資料；500 伺服器錯誤。
 */
export async function postPhoPieByStatus(payload) {
  try {
    const body = normalizePhoPiePayload(payload)
    return await api('/api/pho_pie_by_status', {
      method: 'POST',
      body
    })
  } catch (error) {
    console.error('Post pho pie by status error:', error)
    showError(error.message || '獲取餅圖向量（地位視角）失敗')
    throw error
  }
}


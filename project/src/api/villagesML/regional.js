// api/villagesML/regional.js
// 區域聚合統計相關 API

import { api } from '../auth/auth.js'

/**
 * 獲取城市級聚合統計
 * @param {Object} params
 * @param {string} params.city_name - 城市名稱（可選，不提供則返回所有城市）
 * @returns {Promise<Array>} [{ city: string, village_count: number, semantic_categories: {}, statistics: {} }, ...]
 */
export async function getRegionalAggregatesCity(params = {}) {
  const queryParams = new URLSearchParams()
  if (params.city_name) queryParams.append('city_name', params.city_name)

  return api(`/api/villages/regional/aggregates/city?${queryParams.toString()}`)
}

/**
 * 獲取區縣級聚合統計
 * @param {Object} params
 * @param {string} params.city_name - 城市名稱（可選）
 * @param {string} params.county_name - 區縣名稱（可選）
 * @returns {Promise<Array>} [{ city: string, county: string, village_count: number, semantic_categories: {}, statistics: {} }, ...]
 */
export async function getRegionalAggregatesCounty(params = {}) {
  const queryParams = new URLSearchParams()
  if (params.city_name) queryParams.append('city_name', params.city_name)
  if (params.county_name) queryParams.append('county_name', params.county_name)

  return api(`/api/villages/regional/aggregates/county?${queryParams.toString()}`)
}

/**
 * 獲取鄉鎮級聚合統計
 * @param {Object} params
 * @param {string} params.town_name - 鄉鎮名稱（可選）
 * @param {string} params.county_name - 區縣名稱（可選）
 * @param {number} params.limit - 返回數量限制（可選）
 * @returns {Promise<Array>} [{ city: string, county: string, township: string, village_count: number, semantic_categories: {}, statistics: {} }, ...]
 */
export async function getRegionalAggregatesTown(params = {}) {
  const queryParams = new URLSearchParams()
  if (params.town_name) queryParams.append('town_name', params.town_name)
  if (params.county_name) queryParams.append('county_name', params.county_name)
  if (params.limit) queryParams.append('limit', params.limit)

  return api(`/api/villages/regional/aggregates/town?${queryParams.toString()}`)
}

/**
 * 獲取空間聚合數據
 * @param {Object} params
 * @param {string} params.region_level - 區域層級：'city' | 'county' | 'town'
 * @param {string} params.region_name - 區域名稱（可選）
 * @param {number} params.limit - 返回數量限制（可選）
 * @returns {Promise<Array>} [{ region_name: string, geojson: {}, statistics: {} }, ...]
 */
export async function getRegionalSpatialAggregates(params) {
  const queryParams = new URLSearchParams()
  queryParams.append('region_level', params.region_level)
  if (params.region_name) queryParams.append('region_name', params.region_name)
  if (params.limit) queryParams.append('limit', params.limit)

  return api(`/api/villages/regional/spatial-aggregates?${queryParams.toString()}`)
}

/**
 * 獲取區域特徵向量（使用層級路徑參數）
 * @param {Object} params
 * @param {string} params.level - 區域層級：'city' | 'county' | 'township'
 * @param {string} params.city - 城市名稱（可選）
 * @param {string} params.county - 區縣名稱（可選）
 * @param {string} params.township - 鄉鎮名稱（可選）
 * @param {number} params.limit - 返回數量限制（可選）
 * @returns {Promise<Array>} [{ region_name: string, level: string, city: string, county: string, township: string, feature_vector: number[], village_count: number }, ...]
 */
export async function getRegionalVectors(params = {}) {
  const queryParams = new URLSearchParams()
  if (params.level) queryParams.append('level', params.level)
  if (params.city) queryParams.append('city', params.city)
  if (params.county) queryParams.append('county', params.county)
  if (params.township) queryParams.append('township', params.township)
  if (params.limit) queryParams.append('limit', params.limit)

  return api(`/api/villages/regional/vectors?${queryParams.toString()}`)
}


/**
 * 比較兩個區域的特徵向量（使用層級路徑參數）
 * @param {Object} params
 * @param {string} params.level1 - 區域1層級：'city' | 'county' | 'township'
 * @param {string} params.city1 - 區域1城市名稱（可選）
 * @param {string} params.county1 - 區域1區縣名稱（可選）
 * @param {string} params.township1 - 區域1鄉鎮名稱（可選）
 * @param {string} params.level2 - 區域2層級：'city' | 'county' | 'township'
 * @param {string} params.city2 - 區域2城市名稱（可選）
 * @param {string} params.county2 - 區域2區縣名稱（可選）
 * @param {string} params.township2 - 區域2鄉鎮名稱（可選）
 * @returns {Promise<Object>} { regions, feature_dimension, categories, cosine_similarity, euclidean_distance, manhattan_distance, vector_diff, region1_vector, region2_vector }
 */
export async function compareRegionalVectors(params) {
  return api('/api/villages/regional/vectors/compare', {
    method: 'POST',
    body: params
  })
}

/**
 * 批量比較多個區域的特徵向量（用於熱力圖）
 * @param {Object} params
 * @param {Array} params.regions - 區域列表 [{ level: string, city?: string, county?: string, township?: string }, ...]
 * @returns {Promise<Object>} { regions, similarity_matrix, distance_matrix, feature_dimension, categories, run_id }
 */
export async function batchCompareRegionalVectors(params) {
  return api('/api/villages/regional/vectors/compare/batch', {
    method: 'POST',
    body: params
  })
}

/**
 * 向量降維可視化（PCA/t-SNE）
 * @param {Object} params
 * @param {Array} params.regions - 區域列表 [{ level: string, city?: string, county?: string, township?: string }, ...]
 * @param {string} params.method - 降維方法：'pca' | 'tsne'
 * @param {number} params.n_components - 降維維度：2 | 3
 * @returns {Promise<Object>} { regions, coordinates, method, n_components, explained_variance?, run_id }
 */
export async function reduceRegionalVectors(params) {
  return api('/api/villages/regional/vectors/reduce', {
    method: 'POST',
    body: params
  })
}

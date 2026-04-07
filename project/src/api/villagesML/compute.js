// api/villagesML/compute.js
// 計算模塊相關 API（需要登錄）

import { api } from '../auth/httpClient.js'

/**
 * 特徵提取
 * @param {Object} params
 * @param {Array<{name: string, city: string, county?: string}>} params.villages - 村莊對象數組
 * @param {Object} params.features - 特徵選擇
 * @param {boolean} params.features.semantic_tags - 是否提取語義標籤特徵
 * @param {boolean} params.features.morphology - 是否提取形態學特徵
 * @param {boolean} params.features.clustering - 是否提取聚類特徵
 * @returns {Promise<Object>} { extraction_id, matched_villages, execution_time_ms, results, from_cache }
 */
export async function extractFeatures(params) {
  return api('/api/villages/compute/features/extract', {
    method: 'POST',
    body: params,
    timeout: 60000
  })
}

/**
 * 特徵聚合
 * @param {Object} params
 * @param {string} params.region_level - 區域級別："city" | "county" | "township"
 * @param {Array<string>} params.region_names - 區域名稱列表
 * @param {Object} params.features - 特徵選擇
 * @param {boolean} params.features.semantic_distribution - 是否聚合語義分布
 * @param {boolean} params.features.morphology_patterns - 是否聚合形態模式
 * @param {number} params.top_n - 返回前N個結果
 * @returns {Promise<Object>} { aggregation_id, region_count, execution_time_ms, results, from_cache }
 */
export async function aggregateFeatures(params) {
  return api('/api/villages/compute/features/aggregate', {
    method: 'POST',
    body: params,
    timeout: 60000
  })
}

/**
 * 子集聚類
 * @param {Object} params
 * @param {Object} params.filter - 篩選條件
 * @param {Array<string>} params.filter.cities - 城市列表
 * @param {Array<string>} params.filter.counties - 區縣列表
 * @param {Array<string>} params.filter.semantic_tags - 語義標籤列表
 * @param {string} params.filter.name_pattern - 名稱模式
 * @param {number} params.filter.sample_size - 樣本大小
 * @param {Object} params.clustering - 聚類配置
 * @param {string} params.clustering.algorithm - 算法："kmeans" | "hierarchical" | "dbscan"
 * @param {number} params.clustering.k - 聚類數量（K-Means）
 * @param {Array<string>} params.clustering.features - 特徵列表：["semantic", "morphology"]
 * @param {number} params.clustering.random_state - 隨機種子
 * @returns {Promise<Object>} { subset_id, matched_villages, sampled_villages, clusters, metrics, from_cache }
 */
export async function clusterSubset(params) {
  return api('/api/villages/compute/subset/cluster', {
    method: 'POST',
    body: params,
    timeout: 120000
  })
}

/**
 * 子集比較
 * @param {Object} params
 * @param {Object} params.group_a - 子集A
 * @param {string} params.group_a.label - 子集A標籤
 * @param {Array<number>} params.group_a.village_ids - 子集A村莊ID列表（推薦）
 * @param {Object} [params.group_a.filter] - 子集A篩選條件（向後兼容）
 * @param {Object} params.group_b - 子集B
 * @param {string} params.group_b.label - 子集B標籤
 * @param {Array<number>} params.group_b.village_ids - 子集B村莊ID列表（推薦）
 * @param {Object} [params.group_b.filter] - 子集B篩選條件（向後兼容）
 * @param {Object} params.analysis - 分析配置
 * @param {boolean} params.analysis.semantic_distribution - 是否比較語義分布
 * @param {boolean} params.analysis.morphology_patterns - 是否比較形態模式
 * @param {string} params.analysis.statistical_test - 統計檢驗方法："chi_square" | "t_test"
 * @returns {Promise<Object>} { comparison_id, group_a_size, group_b_size, semantic_comparison, morphology_comparison, significant_differences, from_cache }
 */
export async function compareSubsets(params) {
  return api('/api/villages/compute/subset/compare', {
    method: 'POST',
    body: params,
    timeout: 60000
  })
}

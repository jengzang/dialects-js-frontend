// ========================================
// 模組和子標籤配置（用於 CommonBar 導航）
// ========================================
/**
 * VillagesML 模組配置（不包含 Dashboard）
 * 用於 VillagesMLLayout 的 CommonBar 導航
 * @type {Array<Object>}
 */
export const VILLAGESML_MODULES = [
    {
        id: 'search',
        label: '搜索',
        icon: '🔍',
        path: '/villagesML?module=search',
        weight: 0.8,
        mobileWeight: 1,
        weightIconOnly: 0.5,
        mobileWeightIconOnly: 0.4,
        fontSize: 1.0,
        mobileFontSize: 0.9,
        requireAuth: false,
        hideOnMobile: false,
        // hideLabelOnMobile: true,
        showLabelOnlyWhenActive: false,
        mobileShowLabelOnlyWhenActive: true,
        subtabs: []
    },
    {
        id: 'character',
        label: '字符分析',
        icon: '🔤',
        path: '/villagesML?module=character&subtab=frequency',
        weight: 1.2,
        mobileWeight: 1,
        weightIconOnly: 0.5,
        mobileWeightIconOnly: 0.5,
        fontSize: 1.0,
        mobileFontSize: 0.9,
        requireAuth: false,
        hideOnMobile: false,
        // hideLabelOnMobile: true,
        showLabelOnlyWhenActive: false,
        mobileShowLabelOnlyWhenActive: true,
        subtabs: [
            {
                id: 'frequency',
                label: '頻率傾向',
                icon: '📊',
                path: '/villagesML?module=character&subtab=frequency',
                weight: 1,
                mobileWeight: 1,
                fontSize: 0.95,
                mobileFontSize: 0.9,
                hideOnMobile: false,
                hideLabelOnMobile: true
            },
            {
                id: 'embeddings',
                label: '嵌入相似',
                icon: '🧬',
                path: '/villagesML?module=character&subtab=embeddings',
                weight: 1,
                mobileWeight: 1,
                fontSize: 0.95,
                mobileFontSize: 0.9,
                hideOnMobile: false,
                hideLabelOnMobile: true
            },
            {
                id: 'network',
                label: '字符網絡',
                icon: '🕸️',
                path: '/villagesML?module=character&subtab=network',
                weight: 1,
                mobileWeight: 1,
                fontSize: 0.95,
                mobileFontSize: 0.9,
                hideOnMobile: false,
                hideLabelOnMobile: true,
                requireAuth: true
            },
            {
                id: 'significance',
                label: '顯著性',
                icon: '⭐',
                path: '/villagesML?module=character&subtab=significance',
                weight: 1,
                mobileWeight: 1,
                fontSize: 0.95,
                mobileFontSize: 0.9,
                hideOnMobile: false,
                hideLabelOnMobile: true
            },
        ]
    },
    {
        id: 'semantic',
        label: '語義分析',
        icon: '🏷️',
        path: '/villagesML?module=semantic&subtab=categories',
        weight: 1.2,
        mobileWeight: 1,
        weightIconOnly: 0.5,
        mobileWeightIconOnly: 0.5,
        fontSize: 1.0,
        mobileFontSize: 0.9,
        requireAuth: false,
        hideOnMobile: false,
        // hideLabelOnMobile: true,
        showLabelOnlyWhenActive: false,
        mobileShowLabelOnlyWhenActive: true,
        subtabs: [
            {
                id: 'categories',
                label: '類別標籤',
                icon: '🔖',
                path: '/villagesML?module=semantic&subtab=categories',
                weight: 1,
                mobileWeight: 1,
                fontSize: 0.95,
                mobileFontSize: 0.9,
                hideOnMobile: false,
                hideLabelOnMobile: true
            },
            {
                id: 'composition',
                label: '組合模式',
                icon: '🧩',
                path: '/villagesML?module=semantic&subtab=composition',
                weight: 1,
                mobileWeight: 1,
                fontSize: 0.95,
                mobileFontSize: 0.9,
                hideOnMobile: false,
                hideLabelOnMobile: true
            },
            {
                id: 'ngrams',
                label: 'N-gram分析',
                icon: '📊',
                path: '/villagesML?module=semantic&subtab=ngrams',
                weight: 1,
                mobileWeight: 1,
                fontSize: 0.95,
                mobileFontSize: 0.9,
                hideOnMobile: false,
                hideLabelOnMobile: true
            },
            {
                id: 'indices',
                label: '語義指數',
                icon: '📈',
                path: '/villagesML?module=semantic&subtab=indices',
                weight: 1,
                mobileWeight: 1,
                fontSize: 0.95,
                mobileFontSize: 0.9,
                hideOnMobile: false,
                hideLabelOnMobile: true
            },
            {
                id: 'network',
                label: '語義網絡',
                icon: '🕸️',
                path: '/villagesML?module=semantic&subtab=network',
                weight: 1,
                mobileWeight: 1,
                fontSize: 0.95,
                mobileFontSize: 0.9,
                hideOnMobile: false,
                hideLabelOnMobile: true
            },
            {
                id: 'subcategories',
                label: '子類別分析',
                icon: '🏷️',
                path: '/villagesML?module=semantic&subtab=subcategories',
                weight: 1,
                mobileWeight: 1,
                fontSize: 0.95,
                mobileFontSize: 0.9,
                hideOnMobile: false,
                hideLabelOnMobile: true
            }
        ]
    },
    {
        id: 'spatial',
        label: '空間分析',
        icon: '🗺️',
        path: '/villagesML?module=spatial&subtab=hotspots',
        weight: 1.2,
        mobileWeight: 1,
        weightIconOnly: 0.5,
        mobileWeightIconOnly: 0.5,
        fontSize: 1.0,
        mobileFontSize: 0.9,
        requireAuth: false,
        hideOnMobile: false,
        // hideLabelOnMobile: true,
        showLabelOnlyWhenActive: false,
        mobileShowLabelOnlyWhenActive: true,
        subtabs: [
            {
                id: 'hotspots',
                label: '空間熱點',
                icon: '🔥',
                path: '/villagesML?module=spatial&subtab=hotspots',
                weight: 1,
                mobileWeight: 1,
                fontSize: 0.95,
                mobileFontSize: 0.9,
                hideOnMobile: false,
                hideLabelOnMobile: true
            },
            {
                id: 'clusters',
                label: '空間聚類',
                icon: '🎯',
                path: '/villagesML?module=spatial&subtab=clusters',
                weight: 1,
                mobileWeight: 1,
                fontSize: 0.95,
                mobileFontSize: 0.9,
                hideOnMobile: false,
                hideLabelOnMobile: true
            },
            {
                id: 'visualization',
                label: '空間可視化',
                icon: '📍',
                path: '/villagesML?module=spatial&subtab=visualization',
                weight: 1,
                mobileWeight: 1,
                fontSize: 0.95,
                mobileFontSize: 0.9,
                hideOnMobile: false,
                hideLabelOnMobile: true
            },
            {
                id: 'integration',
                label: '空間整合',
                icon: '🔗',
                path: '/villagesML?module=spatial&subtab=integration',
                weight: 1,
                mobileWeight: 1,
                fontSize: 0.95,
                mobileFontSize: 0.9,
                hideOnMobile: false,
                hideLabelOnMobile: true
            }
        ]
    },
    {
        id: 'pattern',
        label: '模式分析',
        icon: '📐',
        path: '/villagesML?module=pattern&subtab=frequency',
        weight: 1.2,
        mobileWeight: 1,
        weightIconOnly: 0.5,
        mobileWeightIconOnly: 0.5,
        fontSize: 1.0,
        mobileFontSize: 0.9,
        requireAuth: false,
        hideOnMobile: false,
        // hideLabelOnMobile: true,
        showLabelOnlyWhenActive: false,
        mobileShowLabelOnlyWhenActive: true,
        subtabs: [
            {
                id: 'frequency',
                label: '頻率分析',
                icon: '📊',
                path: '/villagesML?module=pattern&subtab=frequency',
                weight: 1,
                mobileWeight: 1,
                fontSize: 0.95,
                mobileFontSize: 0.9,
                hideOnMobile: false,
                hideLabelOnMobile: true
            },
            {
                id: 'structural',
                label: '結構分析',
                icon: '🏗️',
                path: '/villagesML?module=pattern&subtab=structural',
                weight: 1,
                mobileWeight: 1,
                fontSize: 0.95,
                mobileFontSize: 0.9,
                hideOnMobile: false,
                hideLabelOnMobile: true
            },
            {
                id: 'tendency',
                label: '傾向性分析',
                icon: '📈',
                path: '/villagesML?module=pattern&subtab=tendency',
                weight: 1,
                mobileWeight: 1,
                fontSize: 0.95,
                mobileFontSize: 0.9,
                hideOnMobile: false,
                hideLabelOnMobile: true
            },
            {
                id: 'ngram-explore',
                label: 'N-gram 探索',
                icon: '🔍',
                path: '/villagesML?module=pattern&subtab=ngram-explore',
                weight: 1,
                mobileWeight: 1,
                fontSize: 0.95,
                mobileFontSize: 0.9,
                hideOnMobile: false,
                hideLabelOnMobile: true
            },
            {
                id: 'ngram-stats',
                label: 'N-gram 統計',
                icon: '📊',
                path: '/villagesML?module=pattern&subtab=ngram-stats',
                weight: 1,
                mobileWeight: 1,
                fontSize: 0.95,
                mobileFontSize: 0.9,
                hideOnMobile: false,
                hideLabelOnMobile: true
            }
        ]
    },
    {
        id: 'regional',
        label: '區域分析',
        icon: '🌍',
        path: '/villagesML?module=regional&subtab=aggregates',
        weight: 1.2,
        mobileWeight: 1,
        weightIconOnly: 0.5,
        mobileWeightIconOnly: 0.5,
        fontSize: 1.0,
        mobileFontSize: 0.9,
        requireAuth: false,
        hideOnMobile: false,
        // hideLabelOnMobile: true,
        showLabelOnlyWhenActive: false,
        mobileShowLabelOnlyWhenActive: true,
        subtabs: [
            {
                id: 'aggregates',
                label: '聚合統計',
                icon: '📈',
                path: '/villagesML?module=regional&subtab=aggregates',
                weight: 1,
                mobileWeight: 1,
                fontSize: 0.95,
                mobileFontSize: 0.9,
                hideOnMobile: false,
                hideLabelOnMobile: true
            },
            {
                id: 'vectors',
                label: '特徵向量',
                icon: '📐',
                path: '/villagesML?module=regional&subtab=vectors',
                weight: 1,
                mobileWeight: 1,
                fontSize: 0.95,
                mobileFontSize: 0.9,
                hideOnMobile: false,
                hideLabelOnMobile: true
            },
            {
                id: 'tendency',
                label: '類別傾向性',
                icon: '📊',
                path: '/villagesML?module=regional&subtab=tendency',
                weight: 1,
                mobileWeight: 1,
                fontSize: 0.95,
                mobileFontSize: 0.9,
                hideOnMobile: false,
                hideLabelOnMobile: true
            },
            {
                id: 'similarity',
                label: '相似度分析',
                icon: '🔍',
                path: '/villagesML?module=regional&subtab=similarity',
                weight: 1,
                mobileWeight: 1,
                fontSize: 0.95,
                mobileFontSize: 0.9,
                hideOnMobile: false,
                hideLabelOnMobile: true
            }
        ]
    },
    {
        id: 'compute',
        label: 'ML計算',
        icon: '🤖',
        path: '/villagesML?module=compute&subtab=clustering',
        weight: 1.2,
        mobileWeight: 1,
        weightIconOnly: 0.5,
        mobileWeightIconOnly: 0.5,
        fontSize: 1.0,
        mobileFontSize: 0.9,
        requireAuth: false,
        hideOnMobile: false,
        // hideLabelOnMobile: true,
        showLabelOnlyWhenActive: false,
        mobileShowLabelOnlyWhenActive: true,
        subtabs: [
            // ===== 現有子標籤（修改標籤名稱）=====
            {
                id: 'clustering',
                label: '基礎聚類',  // 改名：聚類分析 → 基礎聚類
                icon: '🎲',
                path: '/villagesML?module=compute&subtab=clustering',
                weight: 1,
                mobileWeight: 1,
                fontSize: 0.95,
                mobileFontSize: 0.9,
                hideOnMobile: false,
                hideLabelOnMobile: true
            },
            // ===== 新增子標籤 =====
            {
                id: 'char-tendency',
                label: '字符傾向',
                icon: '🔤',
                path: '/villagesML?module=compute&subtab=char-tendency',
                weight: 1,
                mobileWeight: 1,
                fontSize: 0.95,
                mobileFontSize: 0.9,
                hideOnMobile: false,
                hideLabelOnMobile: true
            },
            {
                id: 'sampled-villages',
                label: '採樣村莊',
                icon: '🏘️',
                path: '/villagesML?module=compute&subtab=sampled-villages',
                weight: 1,
                mobileWeight: 1,
                fontSize: 0.95,
                mobileFontSize: 0.9,
                hideOnMobile: false,
                hideLabelOnMobile: true
            },
            {
                id: 'spatial-aware',
                label: '空間感知',
                icon: '🗺️',
                path: '/villagesML?module=compute&subtab=spatial-aware',
                weight: 1,
                mobileWeight: 1,
                fontSize: 0.95,
                mobileFontSize: 0.9,
                hideOnMobile: false,
                hideLabelOnMobile: true
            },
            {
                id: 'hierarchical',
                label: '層次聚類',
                icon: '🌳',
                path: '/villagesML?module=compute&subtab=hierarchical',
                weight: 1,
                mobileWeight: 1,
                fontSize: 0.95,
                mobileFontSize: 0.9,
                hideOnMobile: false,
                hideLabelOnMobile: true
            },

            {
                id: 'features',
                label: '特徵提取',
                icon: '🔬',
                path: '/villagesML?module=compute&subtab=features',
                weight: 1,
                mobileWeight: 1,
                fontSize: 0.95,
                mobileFontSize: 0.9,
                hideOnMobile: false,
                hideLabelOnMobile: true
            },
            {
                id: 'subset',
                label: '子集分析',
                icon: '🧪',
                path: '/villagesML?module=compute&subtab=subset',
                weight: 1,
                mobileWeight: 1,
                fontSize: 0.95,
                mobileFontSize: 0.9,
                hideOnMobile: false,
                hideLabelOnMobile: true
            },

        ]
    },
    // {
    //   id: 'system',
    //   label: '信息',
    //   icon: 'ℹ️',
    //   path: '/villagesML?module=system',
    //   weight: 0.8,
    //   mobileWeight: 1,
    //   weightIconOnly: 0.5,
    //   fontSize: 1.0,
    //   mobileFontSize: 1.0,
    //   requireAuth: false,
    //   hideOnMobile: false,
    //   hideLabelOnMobile: true,
    //   showLabelOnlyWhenActive: false,
    //   subtabs: []
    // }
]

/**
 * 獲取模組配置
 * @param {string} moduleId - 模組 ID
 * @returns {Object|null} 模組配置對象
 */
export function getModuleConfig(moduleId) {
    return VILLAGESML_MODULES.find(m => m.id === moduleId) || null
}

/**
 * 獲取子標籤配置
 * @param {string} moduleId - 模組 ID
 * @param {string} subtabId - 子標籤 ID
 * @returns {Object|null} 子標籤配置對象
 */
export function getSubtabConfig(moduleId, subtabId) {
    const module = getModuleConfig(moduleId)
    if (!module || !module.subtabs) return null
    return module.subtabs.find(s => s.id === subtabId) || null
}

/**
 * 獲取可見的模組列表（根據認證狀態過濾）
 * @param {boolean} isAuthenticated - 是否已登錄
 * @returns {Array<Object>} 可見的模組配置數組
 */
export function getVisibleModules(isAuthenticated) {
    return VILLAGESML_MODULES.filter(m => !m.requireAuth || isAuthenticated)
}

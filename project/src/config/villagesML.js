// src/config/villagesML.js
// VillagesML 相關常量配置

// ========================================
// 語義類別映射
// ========================================

/**
 * 語義類別圖標映射
 * @type {Object<string, string>}
 */
export const SEMANTIC_CATEGORY_ICONS = {
  'agriculture': '🌾',
  'clan': '👨‍👩‍👧‍👦',
  'direction': '🧭',
  'infrastructure': '🏗️',
  'mountain': '⛰️',
  'settlement': '🏘️',
  'symbolic': '🎨',
  'vegetation': '🌿',
  'water': '💧'
}

/**
 * 語義類別中文名稱映射
 * @type {Object<string, string>}
 */
export const SEMANTIC_CATEGORY_NAMES = {
  'agriculture': '農業',
  'clan': '宗族',
  'direction': '方位',
  'infrastructure': '基建',
  'mountain': '山地',
  'settlement': '聚落',
  'symbolic': '象徵',
  'vegetation': '植物',
  'water': '水系',
  'terrain': '地形',
  'modifier':'修飾語',
  'head':'中心詞',
  'other': '其他',
}

/**
 * 語義類別描述映射
 * @type {Object<string, string>}
 */
export const SEMANTIC_CATEGORY_DESCRIPTIONS = {
  'agriculture': '農業、耕作、田地相關',
  'clan': '宗族、姓氏、家族相關',
  'direction': '東西南北、方向相關',
  'infrastructure': '道路、橋樑、建築相關',
  'mountain': '山地、丘陵等地形相關',
  'settlement': '村落、居住地相關',
  'symbolic': '吉祥、象徵意義相關',
  'vegetation': '樹木、花草等植物相關',
  'water': '河流、湖泊、水系相關'
}

/**
 * 語義子類別中文名稱映射（v4.0 Hybrid Lexicon）
 * @type {Object<string, string>}
 */
export const SEMANTIC_SUBCATEGORY_NAMES = {
  // ===== 父类别（9个大类 + other）=====
  'agriculture': '農業',
  'clan': '宗族',
  'direction': '方位',
  'infrastructure': '基建',
  'mountain': '山地',
  'settlement': '聚落',
  'symbolic': '象徵',
  'vegetation': '植被',
  'water': '水系',
  'other': '其他',

  // 數字類
  'number_small': '小數',          // 一二三四五
  'number_large': '大數',          // 六七八九十
  'number_ordinal': '序數',        // 初、第、老

  // 方位類
  'direction_vertical': '上下',         // 上、下、低
  'direction_cardinal': '東南西北',      // 東、北、南、西
  'direction_inside': '內部',           // 中、內、裡
  'direction_outside': '外側',          // 側、外、旁、邊
  'direction_opening': '關口',          // 關、口、門
  'direction_horizontal': '前後左右',    // 前、右、後、左
  'direction_center': '中央',           // 央、心
  'direction_end': '端點',             // 頭、尾、端、角

  // 象徵類（去掉"象徵"後綴）
  'symbolic_virtue': '美德',           // 義、仁、信、聖、德、文、智、禮、賢
  'symbolic_religion': '宗教',         // 仙、佛、堂、宮、寺、廟、靈、神、觀
  'symbolic_light': '光明',            // 光、明、朗、耀、輝
  'symbolic_prosperity': '繁榮',       // 興、華、富、昌、盛、榮、貴
  'symbolic_animal': '瑞獸',           // 鳳、虎、鶴、鹿、麟、龍、龜
  'symbolic_fortune': '吉祥',          // 吉、喜、壽、瑞、祥、祿、福
  'symbolic_peace': '平安',            // 和、寧、安、康、泰
  'symbolic_treasure': '珍寶',         // 寶、玉、珍

  // 水系類
  'water_spring': '泉井',              // 井、泉
  'water_stream': '溪流',              // 圳、溝、瀝、湧
  'water_pond': '池塘',                // 塘、池、泊、澱、潭
  'water_island': '島嶼',              // 嶼、島、洲
  'water_shore': '岸濱',               // 岸、汀、沿、渚、濱
  'water_river': '江河',               // 川、江、河、澗、溪
  'water_beach': '灘塗',               // 灘、沙
  'water_lake': '湖泊',                // 湖、澤、窪
  'water_port': '港津',                // 港、津、埠
  'water_bay': '海灣',                 // 灣、浦、滘、濠

  // 基建類
  'infrastructure_station': '驛站',     // 亭、站、驛
  'infrastructure_port': '碼頭',        // 埠、渡、碼
  'infrastructure_road': '道路',        // 巷、街、路、道
  'infrastructure_bridge': '橋樑',      // 橋
  'infrastructure_transport': '交通',

  // 時間類
  'time': '時令',                      // 今、冬、古、夏、新、舊、春、晚、朝、秋

  // 農業類（簡化）
  'agriculture_storage': '倉廩',        // 倉、廩
  'agriculture_activity': '農牧',       // 農、牧、畜、耕
  'agriculture_garden': '園圃',         // 園、圃、場
  'agriculture_field': '田地',          // 地、田、畔、畬、疇
  'agriculture_irrigation': '堤壩',     // 壩、堤、渠
  'agriculture_crop': '作物',           // 稻、禾、麥等

  // 宗族類（保持）
  'clan_he': '何姓',
  'clan_other': '其他姓氏',
  'clan_liu': '劉姓',
  'clan_wu': '吳姓',
  'clan_zhang': '張姓',
  'clan_li': '李姓',
  'clan_liang': '梁姓',
  'clan_luo': '羅姓',
  'clan_chen': '陳姓',
  'clan_huang': '黃姓',

  // 山地類
  'mountain_slope': '坡崗',            // 岡、坎、坡、坳、崗
  'mountain_plateau': '台坪',          // 台、坪、塱
  'mountain_valley': '山谷',           // 坑、峒、峽、峪
  'mountain_rock': '岩石',             // 壁、岩、崖、石
  'mountain_peak': '山峰',             // 山、嶺、峰、巔、頂
  'mountain_ridge': '山脊',            // 岐、巒、嶂、脊

  // 聚落類
  'settlement_district': '圍坊',        // 圍、坊
  'settlement_market': '圩市',          // 圩、墟、市、集
  'settlement_fort': '城寨',            // 城、堡、寨
  'settlement_village': '村莊',          // 塆、屯、莊、村
  'settlement_building': '宅屋',        // 宅、屋、樓、祠
  'settlement_group': '片區',           // 片、群、帶

  // 形狀類
  'shape': '形狀',                     // 圓、尖、平、扁、方、曲、直

  // 尺寸類（簡化）
  'size_large': '大',                  // 大、寬、巨、廣
  'size_small': '小',                  // 小、微、細
  'size_short': '短',                  // 短
  'size_long': '長',                   // 長

  // 植物類
  'vegetation_forest': '林木',          // 林、森、樹、木
  'vegetation_pine': '松柏',            // 松、柏
  'vegetation_fruit': '果樹',           // 果、梅、桃、李等
  'vegetation_other': '雜木',           // 其他植物
  'vegetation_bamboo': '竹',            // 竹
  'vegetation_flower': '花卉',          // 花、菊、蓮等
  'vegetation_tea': '茶',               // 茶

  // 顏色類
  'color': '顏色'                      // 青、赤、黃、白、黑等
}

/**
 * 模式結構組件映射
 * @type {Object<string, string>}
 */
export const PATTERN_STRUCTURE_NAMES = {
  'head': '中心',
  'modifier': '修飾',
  'coordinate': '並列',
  'verb': '動',
  'object': '賓',
  'subject': '主',
  'predicate': '謂',
  'other': '其他'
}

/**
 * 組合模式組件映射（已廢棄，請使用 PATTERN_STRUCTURE_NAMES 和 SEMANTIC_CATEGORY_NAMES）
 * @deprecated 使用 PATTERN_STRUCTURE_NAMES 和 SEMANTIC_CATEGORY_NAMES 代替
 * @type {Object<string, string>}
 */
export const PATTERN_COMPONENT_NAMES = {
  ...PATTERN_STRUCTURE_NAMES,
  ...SEMANTIC_CATEGORY_NAMES
}

// ========================================
// N-gram 位置和模式類型映射
// ========================================

/**
 * N-gram 位置標籤映射
 * 支持單一位置和組合位置（如 prefix-suffix）
 * @type {Object<string, string>}
 */
export const NGRAM_POSITION_LABELS = {
  // 單一位置
  'all': '全部',
  'prefix': '前綴',
  'middle': '中間',
  'suffix': '後綴',
  // 組合位置
  'prefix-suffix': '前後綴',
  'prefix-middle': '前中',
  'middle-suffix': '中後',
  'prefix-middle-suffix': '前中後'
}

/**
 * N-gram 模式類型標籤映射
 * @type {Object<string, string>}
 */
export const NGRAM_PATTERN_TYPE_LABELS = {
  'all': '全部',
  'prefix': '前綴',
  'suffix': '後綴',
  'middle': '中間',
  'prefix-suffix': '前後綴',
  'infix': '中綴'
}

// ========================================
// 統計顯著性標籤映射
// ========================================

/**
 * P值顯著性標籤映射
 * @type {Object<string, {label: string, symbol: string, description: string}>}
 */
export const SIGNIFICANCE_LEVELS = {
  'very_significant': {
    label: '極顯著',
    symbol: '***',
    description: 'p < 0.001',
    threshold: 0.001
  },
  'significant': {
    label: '顯著',
    symbol: '**',
    description: 'p < 0.01',
    threshold: 0.01
  },
  'marginal': {
    label: '邊緣顯著',
    symbol: '*',
    description: 'p < 0.05',
    threshold: 0.05
  },
  'not_significant': {
    label: '不顯著',
    symbol: 'n.s.',
    description: 'p ≥ 0.05',
    threshold: 1.0
  }
}

// ========================================
// 輔助函數
// ========================================

/**
 * 獲取語義類別圖標
 * @param {string} category - 類別英文名
 * @returns {string} 圖標 emoji
 */
export function getCategoryIcon(category) {
  return SEMANTIC_CATEGORY_ICONS[category] || '🏷️'
}

/**
 * 獲取語義類別中文名稱
 * @param {string} category - 類別英文名
 * @returns {string} 中文名稱
 */
export function getCategoryName(category) {
  return SEMANTIC_CATEGORY_NAMES[category] || category
}

/**
 * 獲取語義類別描述
 * @param {string} category - 類別英文名
 * @returns {string} 描述文本
 */
export function getCategoryDescription(category) {
  return SEMANTIC_CATEGORY_DESCRIPTIONS[category] || '語義類別'
}

/**
 * 獲取語義子類別名稱
 * @param {string} subcategory - 子類別英文名（如 "number_small", "clan_zhang"）
 * @returns {string} 中文名稱
 */
export function getSubcategoryName(subcategory) {
  return SEMANTIC_SUBCATEGORY_NAMES[subcategory] || subcategory
}

/**
 * 獲取語義類別名稱（智能識別主類別或子類別）
 * @param {string} category - 類別英文名（可以是主類別如 "clan"，也可以是子類別如 "clan_zhang"）
 * @param {boolean} isDetailMode - 是否為詳細模式（默認false）
 * @returns {string} 中文名稱
 */
export function getCategoryDisplayName(category, isDetailMode = false) {
  if (!category) return ''

  // 如果是詳細模式，優先查找子類別映射
  if (isDetailMode && SEMANTIC_SUBCATEGORY_NAMES[category]) {
    return SEMANTIC_SUBCATEGORY_NAMES[category]
  }

  // 否則查找主類別映射
  if (SEMANTIC_CATEGORY_NAMES[category]) {
    return SEMANTIC_CATEGORY_NAMES[category]
  }

  // 如果都找不到，嘗試查找子類別映射（兼容性處理）
  if (SEMANTIC_SUBCATEGORY_NAMES[category]) {
    return SEMANTIC_SUBCATEGORY_NAMES[category]
  }

  // 最後返回原始值
  return category
}

/**
 * 獲取組合模式類型名稱
 * @param {string} patternType - 模式類型英文名（如 "head_settlement", "modifier_head"）
 * @returns {string} 中文名稱
 */
export function getPatternTypeName(patternType) {
  if (!patternType) return ''

  // 處理下劃線或連字符分隔的模式
  const separator = patternType.includes('_') ? '_' : '-'
  const parts = patternType.split(separator)

  // 翻譯每個部分並用連字符連接
  const translatedParts = parts.map(part => {
    // 先查找模式結構組件
    if (PATTERN_STRUCTURE_NAMES[part]) {
      return PATTERN_STRUCTURE_NAMES[part]
    }
    // 再查找語義類別
    if (SEMANTIC_CATEGORY_NAMES[part]) {
      return SEMANTIC_CATEGORY_NAMES[part]
    }
    // 返回原始值
    return part
  })

  return translatedParts.join('-')
}

/**
 * 獲取 N-gram 位置標籤
 * 支持單一位置和組合位置（如 prefix-suffix）
 * @param {string} position - 位置標識（如 'prefix', 'prefix-suffix'）
 * @returns {string} 中文標籤
 */
export function getNgramPositionLabel(position) {
  if (!position) return ''
  return NGRAM_POSITION_LABELS[position] || position
}

/**
 * 獲取 N-gram 模式類型標籤
 * @param {string} type - 模式類型（如 'prefix', 'suffix'）
 * @returns {string} 中文標籤
 */
export function getNgramPatternTypeLabel(type) {
  if (!type) return ''
  return NGRAM_PATTERN_TYPE_LABELS[type] || type
}

/**
 * 獲取顯著性標籤（基於 p 值）
 * @param {number} pValue - P值
 * @returns {string} 顯著性符號（***, **, *, n.s.）
 */
export function getSignificanceLabel(pValue) {
  if (pValue < SIGNIFICANCE_LEVELS.very_significant.threshold) {
    return SIGNIFICANCE_LEVELS.very_significant.symbol
  }
  if (pValue < SIGNIFICANCE_LEVELS.significant.threshold) {
    return SIGNIFICANCE_LEVELS.significant.symbol
  }
  if (pValue < SIGNIFICANCE_LEVELS.marginal.threshold) {
    return SIGNIFICANCE_LEVELS.marginal.symbol
  }
  return SIGNIFICANCE_LEVELS.not_significant.symbol
}

/**
 * 獲取顯著性等級信息
 * @param {number} pValue - P值
 * @returns {Object} 顯著性等級對象 {label, symbol, description}
 */
export function getSignificanceLevel(pValue) {
  if (pValue < SIGNIFICANCE_LEVELS.very_significant.threshold) {
    return SIGNIFICANCE_LEVELS.very_significant
  }
  if (pValue < SIGNIFICANCE_LEVELS.significant.threshold) {
    return SIGNIFICANCE_LEVELS.significant
  }
  if (pValue < SIGNIFICANCE_LEVELS.marginal.threshold) {
    return SIGNIFICANCE_LEVELS.marginal
  }
  return SIGNIFICANCE_LEVELS.not_significant
}

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
    fontSize: 1.0,
    mobileFontSize: 1.0,
    requireAuth: false,
    hideOnMobile: false,
    hideLabelOnMobile: true,
    showLabelOnlyWhenActive: false,
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
    fontSize: 1.0,
    mobileFontSize: 1.0,
    requireAuth: false,
    hideOnMobile: false,
    hideLabelOnMobile: true,
    showLabelOnlyWhenActive: false,
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
    fontSize: 1.0,
    mobileFontSize: 1.0,
    requireAuth: false,
    hideOnMobile: false,
    hideLabelOnMobile: true,
    showLabelOnlyWhenActive: false,
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
    fontSize: 1.0,
    mobileFontSize: 1.0,
    requireAuth: false,
    hideOnMobile: false,
    hideLabelOnMobile: true,
    showLabelOnlyWhenActive: false,
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
    fontSize: 1.0,
    mobileFontSize: 1.0,
    requireAuth: false,
    hideOnMobile: false,
    hideLabelOnMobile: true,
    showLabelOnlyWhenActive: false,
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
    fontSize: 1.0,
    mobileFontSize: 1.0,
    requireAuth: false,
    hideOnMobile: false,
    hideLabelOnMobile: true,
    showLabelOnlyWhenActive: false,
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
    fontSize: 1.0,
    mobileFontSize: 1.0,
    requireAuth: false,
    hideOnMobile: false,
    hideLabelOnMobile: true,
    showLabelOnlyWhenActive: false,
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
  {
    id: 'system',
    label: '信息',
    icon: 'ℹ️',
    path: '/villagesML?module=system',
    weight: 0.8,
    mobileWeight: 1,
    weightIconOnly: 0.5,
    fontSize: 1.0,
    mobileFontSize: 1.0,
    requireAuth: false,
    hideOnMobile: false,
    hideLabelOnMobile: true,
    showLabelOnlyWhenActive: false,
    subtabs: []
  }
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

// ========================================
// 空間聚類配置
// ========================================

/**
 * 空間聚類 Run ID 標籤映射
 * @type {Object<string, string>}
 */
export const SPATIAL_CLUSTERING_RUN_LABELS = {
  'spatial_eps_05': '超密集核心聚類',
  'spatial_hdbscan_v1': '自動多密度聚類',
  'spatial_eps_10': '標準密度聚類',
  'spatial_eps_20': '全域覆蓋聚類'
}

/**
 * 默認的空間聚類 Run ID
 * @type {string}
 */
export const DEFAULT_SPATIAL_CLUSTERING_RUN_ID = 'spatial_hdbscan_v1'

/**
 * 獲取空間聚類 Run 標籤
 * @param {string} runId - Run ID
 * @returns {string} 標籤名稱
 */
export function getSpatialClusteringRunLabel(runId) {
  return SPATIAL_CLUSTERING_RUN_LABELS[runId] || runId
}

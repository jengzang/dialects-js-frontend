// /config/characters.js
// Character-table configuration source of truth.
//
// New code should prefer TABLE_COLUMN_SCHEMAS and the helpers below.
// Legacy exports remain at the bottom for backward compatibility with
// existing imports from '@/main/config'.

const DEFAULT_CHARACTER_TABLE = 'characters'

const SHARED_COLUMN_META = {
  char_column: '漢字',
  has_multi_status: true,
  multi_status_column: '多地位標記'
}

const LEGACY_INPUT_TOKENS = ['@', '-', '#', '*', ' ', '\n', ';', ' ,', '\t']

const DEFAULT_CHARACTER_COLUMN_VALUES = {
  '攝': ['通', '江', '止', '遇', '蟹', '臻', '山', '效', '假', '果', '宕', '梗', '曾', '流', '深', '咸'],
  '韻': ['東', '冬', '鍾', '江', '支', '脂', '之', '微', '魚', '虞', '模', '齊', '佳', '皆', '灰', '咍', '真', '臻', '文', '欣', '元', '魂', '痕', '寒', '刪', '山', '先', '仙', '蕭', '宵', '肴', '豪', '歌', '麻', '陽', '唐', '庚', '耕', '清', '青', '蒸', '登', '尤', '侯', '幽', '侵', '覃', '談', '鹽', '添', '咸', '銜', '嚴', '凡', '泰', '夬', '廢', '祭'],
  '等': ['一', '二', '三', '三A', '三B', '三C', '三銳', '四'],
  '呼': ['開', '合'],
  '清濁': ['全清', '次清', '全濁', '次濁'],
  '系': ['幫', '端', '知', '見'],
  '組': ['幫', '非', '端', '知', '精', '莊', '章', '見', '影', '曉', '日', '泥'],
  '母': ['幫', '滂', '並', '明', '非', '敷', '奉', '微', '端', '透', '定', '泥', '知', '徹', '澄', '娘', '精', '清', '從', '心', '邪', '莊', '初', '崇', '生', '俟', '章', '昌', '船', '書', '常', '見', '溪', '群', '疑', '影', '曉', '匣', '云', '以', '日', '來'],
  '入': ['舒', '入'],
  '調': ['平', '上', '去', '入'],
  '部位': ['雙唇', '唇齒', '齒', '捲舌', '腭', '軟腭', '喉'],
  '方式': ['塞', '塞擦', '擦', '近', '鼻']
}

// 用於輸入匹配的常見簡繁別名，保留雙向映射以兼容現有行為。
const DEFAULT_INPUT_NORMALIZATION_MAPPING = {
  '东': '東',
  '严': '嚴',
  '书': '書',
  '从': '從',
  '删': '刪',
  '帮': '幫',
  '并': '並',
  '庄': '莊',
  '废': '廢',
  '开': '開',
  '彻': '徹',
  '晓': '曉',
  '来': '來',
  '浊': '濁',
  '盐': '鹽',
  '禅': '禪',
  '萧': '蕭',
  '衔': '銜',
  '见': '見',
  '谈': '談',
  '阳': '陽',
  '鱼': '魚',
  '齐': '齊',
  '钟': '鍾',
  '锐': '銳',
  '齿': '齒',
  '卷': '捲',
  '软': '軟',
  '双': '雙',
  '孃': '娘',
  '眞': '真',
  '羣': '群',
  '闔': '合',
  '雲': '云',
  '餚': '肴',
  '鹹': '咸',
  '鼕': '冬',
  '脣': '唇',
  '齶': '腭',
  '摄': '攝',
  '韵': '韻',
  '调': '調',
  '清浊': '清濁',
  '组': '組'
}

function buildAmbigValues(columnValueMap) {
  const counts = new Map()

  for (const values of Object.values(columnValueMap)) {
    for (const value of values) {
      counts.set(value, (counts.get(value) || 0) + 1)
    }
  }

  return new Set(
    Array.from(counts.entries())
      .filter(([, count]) => count > 1)
      .map(([value]) => value)
  )
}

function buildAllowedTokenSet(tokens) {
  const set = new Set()

  for (const token of tokens) {
    if (token == null) continue
    const normalized = String(token)
    if (!normalized) continue
    set.add(normalized)
    for (const char of normalized) {
      set.add(char)
    }
  }

  return set
}

function buildGenericUiConfig(hierarchy, columnValues, overrides = {}) {
  return {
    available_keys: overrides.available_keys ?? hierarchy.filter(key => key in columnValues),
    key_exclusive_rules: overrides.key_exclusive_rules ?? { groups: [] },
    single_select_keys: overrides.single_select_keys ?? [],
    key_groups: overrides.key_groups ?? {}
  }
}

function createTableSchema({
  meta,
  columns,
  query,
  ui,
  input
}) {
  const hierarchy = [...columns.hierarchy]
  const columnValues = columns.column_values
  const ambigValues = columns.ambig_values ?? buildAmbigValues(columnValues)
  const uiConfig = buildGenericUiConfig(hierarchy, columnValues, ui)
  const inputConfig = {
    normalization_mapping: input?.normalization_mapping ?? {},
    allow_chars_status: input?.allow_chars_status ?? buildAllowedTokenSet([
      ...hierarchy,
      ...Object.keys(columnValues),
      ...Object.values(columnValues).flat(),
      ...Object.keys(input?.normalization_mapping ?? {}),
      ...Object.values(input?.normalization_mapping ?? {}),
      ...LEGACY_INPUT_TOKENS
    ]),
    allow_chars_groups: input?.allow_chars_groups ?? buildAllowedTokenSet([
      ...hierarchy,
      ...LEGACY_INPUT_TOKENS
    ])
  }

  return {
    meta,
    columns: {
      hierarchy,
      char_column: columns.char_column,
      has_multi_status: columns.has_multi_status,
      multi_status_column: columns.multi_status_column,
      column_values: columnValues,
      ambig_values: ambigValues
    },
    query: {
      default_grouping: query.default_grouping,
      multi_status_cols: query.multi_status_cols,
      suffix_map: query.suffix_map
    },
    ui: uiConfig,
    input: inputConfig,

    // Flat aliases for backward compatibility and low-friction adoption.
    hierarchy,
    char_column: columns.char_column,
    has_multi_status: columns.has_multi_status,
    multi_status_column: columns.multi_status_column,
    column_values: columnValues,
    ambig_values: ambigValues,
    default_grouping: query.default_grouping,
    multi_status_cols: query.multi_status_cols,
    suffix_map: query.suffix_map,
    available_keys: uiConfig.available_keys,
    key_exclusive_rules: uiConfig.key_exclusive_rules,
    single_select_keys: uiConfig.single_select_keys,
    key_groups: uiConfig.key_groups,
    normalization_mapping: inputConfig.normalization_mapping,
    allow_chars_status: inputConfig.allow_chars_status,
    allow_chars_groups: inputConfig.allow_chars_groups
  }
}

/**
 * hierarchy: 所有可用於查詢的列，包含小韻等不適合直接做組合查詢的列。
 * column_values: 有限值列，用於前端組合查詢、輸入校驗和下拉選項。
 */
export const TABLE_COLUMN_SCHEMAS = {
  characters: createTableSchema({
    meta: {
      label: '中古音（廣韻）',
      description: '默認字表',
      is_default: true
    },
    columns: {
      ...SHARED_COLUMN_META,
      hierarchy: ['攝', '韻', '等', '呼', '入', '清濁', '系', '組', '母', '調', '部位', '方式'],
      column_values: DEFAULT_CHARACTER_COLUMN_VALUES
    },
    query: {
      default_grouping: { '聲母': ['母'], '韻母': ['攝'], '聲調': ['清濁', '調'] },
      multi_status_cols: [['攝', '呼', '等', '韻', '調'], ['部位', '方式', '母']],
      suffix_map: { '系': '系', '組': '組', '母': '母', '攝': '攝', '韻': '韻' }
    },
    ui: {
      available_keys: ['攝', '韻', '等', '呼', '清濁', '系', '組', '母', '入', '調', '部位', '方式'],
      key_exclusive_rules: {
        groups: [
          ['攝', '韻'],
          ['系', '組', '母'],
          ['入', '調']
        ]
      },
      // single_select_keys: ['攝', '韻', '系', '組', '母', '入', '調'],
      key_groups: {
        '韻攝相關': ['攝', '韻', '等', '呼'],
        '聲母相關': ['清濁', '系', '組', '母', '部位', '方式'],
        '聲調相關': ['入', '調']
      }
    },
    input: {
      normalization_mapping: DEFAULT_INPUT_NORMALIZATION_MAPPING
    }
  }),
  fenyun: createTableSchema({
    meta: {
      label: '分韻撮要（1782粵語）',
      description: '1782粵語韻書'
    },
    columns: {
      ...SHARED_COLUMN_META,
      hierarchy: ['聲母', '韻母', '韻部', '聲調', '小韻'],
      column_values: {
        '聲母': ['云', '亞', '以', '來', '古', '困', '審', '幫', '心', '我', '日', '明', '曉', '泥', '清', '溪', '滂', '照', '穿', '端', '精', '見', '透', '非'],
        '韻母': ['丹', '乙', '交', '修', '先', '兼', '剛', '割', '劫', '卒', '吾', '威', '孤', '官', '家', '屑', '師', '干', '幾', '張', '彭', '德', '急', '括', '朝', '東', '栽', '津', '甘', '甲', '畢', '登', '發', '皆', '益', '科', '篤', '緘', '英', '著', '蛤', '角', '諸', '賓', '遮', '金', '雖', '額', '魁', '鴛'],
        '韻部': ['先蘚線屑', '英影應益', '甘敢紺蛤', '吾五悟', '彭棒硬額', '干趕幹割', '幾紀記', '張掌帳着', '津贐進卒', '官管貫括', '科火貨', '遮者蔗', '雖髓歲', '翻反泛發', '魁賄誨', '家賈嫁', '兼檢劍劫', '緘减鑒甲', '威偉畏', '修叟秀', '賓禀嬪?', '東董凍篤', '朝沼照', '金錦禁急', '鴛婉怨乙', '栽宰載', '孤古故', '登等凳德', '交絞教', '師史四', '剛講降角', '皆解介', '諸主著'],
        '聲調': ['陰上', '陰入', '陰去', '陰平', '陽上', '陽入', '陽去', '陽平']
      },
      ambig_values: new Set()
    },
    query: {
      default_grouping: { '聲母': ['聲母'], '韻母': ['韻部'], '聲調': ['聲調'] },
      multi_status_cols: [['韻部', '韻母', '小韻'], ['聲母', '聲調']],
      suffix_map: {}
    }
  }),
  hongwu: createTableSchema({
    meta: {
      label: '洪武正韻（明代音系）',
      description: '明代音系'
    },
    columns: {
      ...SHARED_COLUMN_META,
      hierarchy: ['聲母', '韻部', '聲調', '清濁', '聲類'],
      column_values: {
        '聲母': ['並', '來', '匣', '喻', '奉', '定', '審', '幫', '影', '從', '微', '心', '日', '明', '曉', '泥', '清', '溪', '滂', '照', '牀', '疑', '禪', '穿', '端', '精', '群', '見', '透', '邪', '非'],
        '韻部': ['侵', '先', '刪', '勘', '合', '哿', '嘯', '姥', '宥', '寒', '寘', '寢', '尤', '屋', '屑', '巧', '庚', '御', '感', '支', '效', '敬', '旱', '暮', '曷', '有', '東', '梗', '模', '歌', '沁', '泰', '漾', '灰', '爻', '琰', '產', '皆', '真', '禡', '箇', '篠', '紙', '緝', '翰', '者', '葉', '董', '蔗', '蕭', '薺', '藥', '覃', '解', '語', '諫', '豔', '賄', '質', '軫', '轄', '送', '遮', '銑', '陌', '陽', '隊', '震', '霰', '霽', '養', '馬', '魚', '鹽', '麻', '齊'],
        '聲調': ['上', '入', '去', '平'],
        '清濁': ['全清', '全濁', '次清', '次濁'],
        '聲類': ['七', '丑', '五', '以', '佗', '來', '博', '古', '呼', '奉', '奴', '子', '徐', '徒', '所', '方', '日', '昨', '時', '普', '武', '渠', '烏', '直', '胡', '苦', '莫', '蒲', '蘇', '都', '陟']
      },
      ambig_values: new Set(['來', '日'])
    },
    query: {
      default_grouping: { '聲母': ['聲母'], '韻母': ['韻部'], '聲調': ['聲調'] },
      multi_status_cols: [['清濁', '聲母', '韻部', '聲調']],
      suffix_map: { '聲母': '聲母', '聲類': '聲類' }
    }
  }),
  menggu: createTableSchema({
    meta: {
      label: '蒙古字韻（元代）',
      description: '元代音系'
    },
    columns: {
      ...SHARED_COLUMN_META,
      hierarchy: ['韻部', '聲調'],
      column_values: {
        '韻部': ['佳', '侵', '先', '寒', '尤', '庚', '支', '東', '歌', '真', '蕭', '覃', '陽', '魚', '麻'],
        '聲調': ['上', '入', '去', '平']
      },
      ambig_values: new Set()
    },
    query: {
      default_grouping: { '韻母': ['韻部'], '聲調': ['聲調'] },
      multi_status_cols: [['韻部', '聲調']],
      suffix_map: {}
    }
  }),
  old_chinese: createTableSchema({
    meta: {
      label: '上古音(諧聲)',
      description: '上古音'
    },
    columns: {
      ...SHARED_COLUMN_META,
      hierarchy: ['聲母', '韻母', '韻部', '聲調', '聲母組', '諧聲域'],
      column_values: {
        '聲母': ['b', 'd', 'dz', 'g', 'gw', 'h', 'j', 'jh', 'k', 'kh', 'khj', 'khw', 'kj', 'kw', 'l', 'lh', 'm', 'mh', 'mj', 'ml', 'n', 'ng', 'ngh', 'ngw', 'nh', 'p', 'ph', 'q', 'qw', 'r', 'rh', 's', 'sj', 'sl', 'st', 't', 'th', 'ts', 'tsh', 'w', 'wh'],
        '韻母': ['a', 'aj', 'ak', 'am', 'an', 'ang', 'ap', 'ar', 'at', 'aw', 'awk', 'e', 'ek', 'em', 'en', 'eng', 'ep', 'et', 'ew', 'ewk', 'i', 'ik', 'im', 'in', 'ing', 'ip', 'it', 'iw', 'iwk', 'o', 'oj', 'ok', 'on', 'ong', 'or', 'ot', 'u', 'uj', 'uk', 'um', 'un', 'ung', 'ut', 'y', 'yj', 'yk', 'ym', 'yn', 'yng', 'yp', 'yt'],
        '韻部': ['之', '侯', '侵i', '侵u', '侵y', '元a', '元ar', '元e', '元o', '元or', '冬', '宵a', '宵e', '屋', '幽i', '幽u', '微u', '微y', '支', '文u', '文y', '月a', '月e', '月o', '東', '歌a', '歌o', '物u', '物y', '真n', '真ng', '緝i', '緝y', '耕', '職', '脂', '葉a', '葉e', '蒸', '藥a', '藥e', '覺i', '覺u', '談a', '談e', '質k', '質t', '錫', '鐸', '陽', '魚'],
        '聲調': ['上', '入', '去', '平'],
        '聲母組': ['J', 'K', 'L', 'M', 'N', 'NG', 'P', 'Q', 'R', 'T', 'TS', 'W']
      },
      ambig_values: new Set()
    },
    query: {
      default_grouping: { '聲母': ['聲母'], '韻母': ['韻部'], '聲調': ['聲調'] },
      multi_status_cols: [['韻部', '韻母'], ['聲母組', '聲母', '聲調']],
      suffix_map: {}
    }
  }),
  zhongyuan: createTableSchema({
    meta: {
      label: '中原音韻（元代）',
      description: '元代音系'
    },
    columns: {
      ...SHARED_COLUMN_META,
      hierarchy: ['聲母', '韻母', '呼', '等', '聲調', '小韻'],
      column_values: {
        '聲母': ['來', '審', '幫', '影', '微', '心', '日', '明', '曉', '泥', '清', '溪', '滂', '照', '疑', '穿', '端', '精', '見', '透', '非'],
        '韻母': ['侵尋', '先天', '家麻', '寒山', '尤侯', '庚青', '廉纖', '支思', '東鍾', '桓歡', '歌戈', '江陽', '皆來', '監咸', '真文', '蕭豪', '車遮', '魚模', '齊微'],
        '呼': ['合', '撮', '開', '齊'],
        '等': ['', '一', '二'],
        '聲調': ['上', '入作上', '入作去', '入作陽', '去', '去作陽', '陰', '陽']
      },
      ambig_values: new Set()
    },
    query: {
      default_grouping: { '聲母': ['聲母'], '韻母': ['韻母'], '聲調': ['聲調'] },
      multi_status_cols: [['聲母', '呼', '等', '韻母', '小韻', '聲調']],
      suffix_map: {}
    }
  })
}

export const VALID_CHARACTER_TABLES = Object.keys(TABLE_COLUMN_SCHEMAS)

export function isValidCharacterTable(tableName) {
  return typeof tableName === 'string' && tableName in TABLE_COLUMN_SCHEMAS
}

export function resolveCharacterTableName(tableName) {
  return isValidCharacterTable(tableName) ? tableName : DEFAULT_CHARACTER_TABLE
}

export function getCharacterTableSchema(tableName = DEFAULT_CHARACTER_TABLE) {
  return TABLE_COLUMN_SCHEMAS[resolveCharacterTableName(tableName)]
}

export function getCharacterTableColumnValues(tableName = DEFAULT_CHARACTER_TABLE) {
  return getCharacterTableSchema(tableName).column_values
}

export function getCharacterTableHierarchy(tableName = DEFAULT_CHARACTER_TABLE) {
  return getCharacterTableSchema(tableName).hierarchy
}

export function getCharacterTableUiConfig(tableName = DEFAULT_CHARACTER_TABLE) {
  return getCharacterTableSchema(tableName).ui
}

export function getCharacterTableInputConfig(tableName = DEFAULT_CHARACTER_TABLE) {
  return getCharacterTableSchema(tableName).input
}

const DEFAULT_CHARACTER_SCHEMA = getCharacterTableSchema(DEFAULT_CHARACTER_TABLE)

// Legacy exports kept for backward compatibility with existing imports.
export { DEFAULT_CHARACTER_TABLE }
export const column_values = DEFAULT_CHARACTER_SCHEMA.column_values
export const COLUMN_VALUES = column_values
export const AMBIG_VALUES = DEFAULT_CHARACTER_SCHEMA.ambig_values
export const ambig_values = AMBIG_VALUES
export const AVAILABLE_KEYS = DEFAULT_CHARACTER_SCHEMA.available_keys
export const KEY_EXCLUSIVE_RULES = DEFAULT_CHARACTER_SCHEMA.key_exclusive_rules
export const SINGLE_SELECT_KEYS = DEFAULT_CHARACTER_SCHEMA.single_select_keys
export const KEY_GROUPS = DEFAULT_CHARACTER_SCHEMA.key_groups
export const allow_chars_status = DEFAULT_CHARACTER_SCHEMA.allow_chars_status
export const allow_chars_groups = DEFAULT_CHARACTER_SCHEMA.allow_chars_groups
export const S2T_T2S_MAPPING = DEFAULT_CHARACTER_SCHEMA.normalization_mapping

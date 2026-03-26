import { getSqlTreeColumnIndexes } from './sqlTreeColumnMappings.js'

const DEFAULT_DB_KEY = 'chars'
const DEFAULT_DATA_COLUMN_NAMES = Object.freeze(['漢字', '釋義'])

const freezeArray = (values) => Object.freeze([...values])
const freezeRecord = (record) => Object.freeze(record)

const createLevelColumns = (definitions) =>
  freezeArray(
    definitions.map(([key, columnName]) =>
      Object.freeze({
        key,
        columnName,
        label: columnName
      })
    )
  )

const createPresets = (presets) =>
  freezeArray(
    presets.map((preset) =>
      Object.freeze({
        ...preset,
        levelKeys: freezeArray(preset.levelKeys)
      })
    )
  )

const createTableConfig = ({
  tableName,
  labelKey,
  levelColumns,
  presets,
  defaultPresetKey,
  dataColumnNames = DEFAULT_DATA_COLUMN_NAMES,
  dbKey = DEFAULT_DB_KEY
}) => {
  const frozenLevelColumns = createLevelColumns(levelColumns)
  const frozenPresets = createPresets(presets)
  const columnMap = freezeRecord(
    Object.fromEntries(
      frozenLevelColumns.map((column) => [
        column.key,
        freezeRecord({
          columnName: column.columnName,
          label: column.label
        })
      ])
    )
  )
  const presetMap = freezeRecord(
    Object.fromEntries(
      frozenPresets.map((preset) => [
        preset.key,
        freezeRecord({
          labelKey: preset.labelKey,
          levelKeys: freezeArray(preset.levelKeys)
        })
      ])
    )
  )

  return freezeRecord({
    dbKey,
    tableName,
    labelKey,
    dataColumnNames: freezeArray(dataColumnNames),
    levelColumns: frozenLevelColumns,
    levelColumnMap: columnMap,
    presets: frozenPresets,
    presetMap,
    defaultPresetKey
  })
}

const createPageConfig = ({ titleKey, tables, defaultTableKey }) =>
  freezeRecord({
    titleKey,
    tables: freezeRecord(tables),
    defaultTableKey
  })

export const CHAR_CLASS_PAGE_CONFIGS = freezeRecord({
  zhonggu: createPageConfig({
    titleKey: 'charClass.pages.zhonggu.title',
    defaultTableKey: 'characters',
    tables: {
      characters: createTableConfig({
        tableName: 'characters',
        labelKey: 'charClass.tables.characters',
        levelColumns: [
          ['she', '攝'],
          ['hu', '呼'],
          ['deng', '等'],
          ['yun', '韻'],
          ['ru', '入'],
          ['diao', '調'],
          ['qingzhuo', '清濁'],
          ['xi', '系'],
          ['zu', '組'],
          ['mu', '母'],
          ['buwei', '部位'],
          ['fangshi', '方式'],
          ['duoshengmu', '多聲母'],
          ['duodeng', '多等'],
          ['duoyun', '多韻'],
          ['duodiao', '多調'],
          ['duodiwei', '多地位標記']
        ],
        presets: [
          {
            key: 'rhyme',
            labelKey: 'charClass.pages.zhonggu.presets.rhyme',
            levelKeys: ['she', 'yun', 'hu', 'deng', 'diao']
          },
          {
            key: 'initial',
            labelKey: 'charClass.pages.zhonggu.presets.initial',
            levelKeys: ['xi', 'zu', 'mu', 'she']
          },
          {
            key: 'voicing',
            labelKey: 'charClass.pages.zhonggu.presets.voicing',
            levelKeys: ['qingzhuo', 'mu', 'hu', 'deng']
          }
        ],
        defaultPresetKey: 'rhyme'
      })
    }
  }),
  shanggu: createPageConfig({
    titleKey: 'charClass.pages.shanggu.title',
    defaultTableKey: 'old_chinese',
    tables: {
      old_chinese: createTableConfig({
        tableName: 'old_chinese',
        labelKey: 'charClass.tables.old_chinese',
        levelColumns: [
          ['yuanshi_yinbiao', '原始音標'],
          ['shengdiao', '聲調'],
          ['shengmu', '聲母'],
          ['yunmu', '韻母'],
          ['yunbu', '韻部'],
          ['shengmu_group', '聲母組'],
          ['r_jieyin', 'r介音'],
          ['fei_sandeng', '非三等'],
          ['xiesheng', '諧聲域'],
          ['yin', '音'],
          ['jian_shijing', '見詩經韻'],
          ['jian_qita', '見其他韻'],
          ['appear_total', '總出現次數'],
          ['preqin_freq', '先秦字頻（歸一化）'],
          ['rare_source', '少見詞出處'],
          ['jian_xizhou', '見西周'],
          ['xizhou_freq', '西周字頻（歸一化）'],
          ['zhushi', '注釋'],
          ['duodiwei', '多地位標記']
        ],
        presets: [
          {
            key: 'rhyme',
            labelKey: 'charClass.pages.shanggu.presets.rhyme',
            levelKeys: ['yunbu', 'shengdiao', 'shengmu']
          },
          {
            key: 'initialGroup',
            labelKey: 'charClass.pages.shanggu.presets.initialGroup',
            levelKeys: ['shengmu_group', 'shengmu', 'shengdiao']
          },
          {
            key: 'xiesheng',
            labelKey: 'charClass.pages.shanggu.presets.xiesheng',
            levelKeys: ['xiesheng', 'yunbu', 'shengdiao']
          }
        ],
        defaultPresetKey: 'rhyme'
      })
    }
  }),
  jingu: createPageConfig({
    titleKey: 'charClass.pages.jingu.title',
    defaultTableKey: 'zhongyuan',
    tables: {
      zhongyuan: createTableConfig({
        tableName: 'zhongyuan',
        labelKey: 'charClass.tables.zhongyuan',
        levelColumns: [
          ['xiaoyun', '小韻'],
          ['shengmu', '聲母'],
          ['yunmu', '韻母'],
          ['hu', '呼'],
          ['deng', '等'],
          ['shengdiao', '聲調'],
          ['niyin', '擬音'],
          ['duodiwei', '多地位標記']
        ],
        presets: [
          {
            key: 'rhyme',
            labelKey: 'charClass.pages.jingu.tables.zhongyuan.presets.rhyme',
            levelKeys: ['yunmu', 'shengdiao', 'xiaoyun', 'hu', 'deng']
          },
          {
            key: 'initial',
            labelKey: 'charClass.pages.jingu.tables.zhongyuan.presets.initial',
            levelKeys: ['shengmu', 'xiaoyun', 'yunmu']
          },
          {
            key: 'transcription',
            labelKey: 'charClass.pages.jingu.tables.zhongyuan.presets.transcription',
            levelKeys: ['niyin', 'shengmu', 'yunmu']
          }
        ],
        defaultPresetKey: 'rhyme'
      }),
      hongwu: createTableConfig({
        tableName: 'hongwu',
        labelKey: 'charClass.tables.hongwu',
        levelColumns: [
          ['shengdiao', '聲調'],
          ['yunbu', '韻部'],
          ['shengmu', '聲母'],
          ['shenglei', '聲類'],
          ['qingzhuo', '清濁'],
          ['shangzi', '上字'],
          ['xiazi', '下字'],
          ['duodiwei', '多地位標記']
        ],
        presets: [
          {
            key: 'rhyme',
            labelKey: 'charClass.pages.jingu.tables.hongwu.presets.rhyme',
            levelKeys: ['yunbu', 'shengdiao', 'shengmu']
          },
          {
            key: 'initial',
            labelKey: 'charClass.pages.jingu.tables.hongwu.presets.initial',
            levelKeys: ['shengmu', 'shenglei', 'qingzhuo']
          },
          {
            key: 'fanqie',
            labelKey: 'charClass.pages.jingu.tables.hongwu.presets.fanqie',
            levelKeys: ['shangzi', 'xiazi', 'shengdiao']
          }
        ],
        defaultPresetKey: 'rhyme'
      }),
      menggu: createTableConfig({
        tableName: 'menggu',
        labelKey: 'charClass.tables.menggu',
        levelColumns: [
          ['yunxu', '韻序'],
          ['yunbu', '韻部'],
          ['basiba', '八思巴字'],
          ['shengdiao', '聲調'],
          ['beixuan', '備選異體'],
          ['niyin', '擬音'],
          ['duiying_qieyun', '對應切韻音系音韻地位'],
          ['duodiwei', '多地位標記']
        ],
        presets: [
          {
            key: 'rhyme',
            labelKey: 'charClass.pages.jingu.tables.menggu.presets.rhyme',
            levelKeys: ['yunbu', 'shengdiao', 'basiba']
          },
          {
            key: 'transcription',
            labelKey: 'charClass.pages.jingu.tables.menggu.presets.transcription',
            levelKeys: ['niyin', 'basiba', 'yunbu']
          },
          {
            key: 'position',
            labelKey: 'charClass.pages.jingu.tables.menggu.presets.position',
            levelKeys: ['duiying_qieyun', 'yunbu', 'shengdiao']
          }
        ],
        defaultPresetKey: 'rhyme'
      })
    }
  }),
  yueyun: createPageConfig({
    titleKey: 'charClass.pages.yueyun.title',
    defaultTableKey: 'fenyun',
    tables: {
      fenyun: createTableConfig({
        tableName: 'fenyun',
        labelKey: 'charClass.tables.fenyun',
        levelColumns: [
          ['yunxu', '韻序'],
          ['shengmu_jp', '聲母jp'],
          ['yunfu_jp', '韻腹jp'],
          ['yunwei_jp', '韻尾jp'],
          ['diaolei_jp', '調類jp'],
          ['xiaoyun', '小韻'],
          ['shengmu', '聲母'],
          ['yunmu', '韻母'],
          ['yunbu', '韻部'],
          ['shengdiao', '聲調'],
          ['duodiwei', '多地位標記']
        ],
        presets: [
          {
            key: 'native',
            labelKey: 'charClass.pages.yueyun.presets.native',
            levelKeys: ['yunbu', 'shengmu', 'yunmu', 'shengdiao']
          },
          {
            key: 'japanese',
            labelKey: 'charClass.pages.yueyun.presets.japanese',
            levelKeys: ['shengmu_jp', 'yunfu_jp', 'yunwei_jp', 'diaolei_jp']
          },
          {
            key: 'syllable',
            labelKey: 'charClass.pages.yueyun.presets.syllable',
            levelKeys: ['xiaoyun', 'shengmu', 'yunbu', 'shengdiao']
          }
        ],
        defaultPresetKey: 'native'
      })
    }
  })
})

export const getCharClassPageConfig = (pageKey) => {
  const pageConfig = CHAR_CLASS_PAGE_CONFIGS[pageKey]

  if (!pageConfig) {
    throw new Error(`Unknown charClass page: ${pageKey}`)
  }

  return pageConfig
}

export const getCharClassTableConfig = (pageKey, tableKey) => {
  const pageConfig = getCharClassPageConfig(pageKey)
  const nextTableKey = pageConfig.tables[tableKey] ? tableKey : pageConfig.defaultTableKey

  return pageConfig.tables[nextTableKey]
}

export const getDefaultCharClassLevelKeys = (tableConfig) =>
  tableConfig.presetMap[tableConfig.defaultPresetKey]?.levelKeys || freezeArray([])

export const sanitizeCharClassTableKey = (pageConfig, tableKey) =>
  pageConfig.tables[tableKey] ? tableKey : pageConfig.defaultTableKey

export const sanitizeCharClassLevelKeys = (tableConfig, levelKeys) => {
  const allowedKeys = new Set(tableConfig.levelColumns.map((column) => column.key))
  const dedupedKeys = []

  for (const key of levelKeys || []) {
    if (!key || !allowedKeys.has(key) || dedupedKeys.includes(key)) {
      continue
    }
    dedupedKeys.push(key)
  }

  return dedupedKeys.length > 0
    ? dedupedKeys
    : [...getDefaultCharClassLevelKeys(tableConfig)]
}

export const findCharClassPresetKey = (tableConfig, levelKeys) =>
  tableConfig.presets.find((preset) =>
    preset.levelKeys.length === levelKeys.length &&
    preset.levelKeys.every((key, index) => key === levelKeys[index])
  )?.key || null

export const getCharClassColumnNameByKey = (tableConfig, columnKey) =>
  tableConfig.levelColumnMap[columnKey]?.columnName

export const buildCharClassTreePayload = (pageKey, tableKey, levelKeys) => {
  const tableConfig = getCharClassTableConfig(pageKey, tableKey)
  const levelColumnNames = levelKeys
    .map((levelKey) => getCharClassColumnNameByKey(tableConfig, levelKey))
    .filter(Boolean)

  return {
    db_key: tableConfig.dbKey,
    table_name: tableConfig.tableName,
    level_columns: getSqlTreeColumnIndexes(tableConfig.dbKey, tableConfig.tableName, levelColumnNames),
    data_columns: getSqlTreeColumnIndexes(tableConfig.dbKey, tableConfig.tableName, tableConfig.dataColumnNames)
  }
}

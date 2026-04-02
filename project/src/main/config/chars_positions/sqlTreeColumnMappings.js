const createFrozenArray = (values) => Object.freeze([...values])

const createTableColumnMapping = (columnNames) => {
  const columns = createFrozenArray(columnNames)
  const indexByName = Object.freeze(
    Object.fromEntries(columns.map((columnName, index) => [columnName, index]))
  )

  return Object.freeze({
    columns,
    indexByName
  })
}

const createFrozenRecord = (record) => Object.freeze(record)

export const SQL_TREE_COLUMN_MAPPINGS = createFrozenRecord({
  chars: createFrozenRecord({
    dbFile: 'characters.db',
    tables: createFrozenRecord({
      characters: createTableColumnMapping([
        '攝',
        '呼',
        '等',
        '韻',
        '入',
        '調',
        '清濁',
        '系',
        '組',
        '母',
        '部位',
        '方式',
        '漢字',
        '釋義',
        '多聲母',
        '多等',
        '多韻',
        '多調',
        '多地位標記'
      ]),
      fenyun: createTableColumnMapping([
        '韻序',
        '漢字',
        '聲母jp',
        '韻腹jp',
        '韻尾jp',
        '調類jp',
        '小韻',
        '釋義',
        '聲母',
        '韻母',
        '韻部',
        '聲調',
        '多地位標記'
      ]),
      hongwu: createTableColumnMapping([
        '漢字',
        '聲調',
        '韻部',
        '聲母',
        '聲類',
        '清濁',
        '上字',
        '下字',
        '釋義',
        '多地位標記'
      ]),
      menggu: createTableColumnMapping([
        '韻序',
        '韻部',
        '八思巴字',
        '聲調',
        '漢字',
        '備選異體',
        '釋義',
        '擬音',
        '對應切韻音系音韻地位',
        '多地位標記'
      ]),
      old_chinese: createTableColumnMapping([
        '漢字',
        '原始音標',
        '聲調',
        '聲母',
        '韻母',
        '韻部',
        '聲母組',
        'r介音',
        '非三等',
        '諧聲域',
        '音',
        '見詩經韻',
        '見其他韻',
        '總出現次數',
        '先秦字頻（歸一化）',
        '少見詞出處',
        '見西周',
        '西周字頻（歸一化）',
        '釋義',
        '注釋',
        '多地位標記'
      ]),
      zhongyuan: createTableColumnMapping([
        '小韻',
        '漢字',
        '聲母',
        '韻母',
        '呼',
        '等',
        '聲調',
        '擬音',
        '釋義',
        '多地位標記'
      ])
    })
  })
})

const getTableMapping = (dbKey, tableName) => {
  const dbMapping = SQL_TREE_COLUMN_MAPPINGS[dbKey]
  if (!dbMapping) {
    throw new Error(`Unknown SQL tree db_key: ${dbKey}`)
  }

  const tableMapping = dbMapping.tables[tableName]
  if (!tableMapping) {
    throw new Error(`Unknown SQL tree table: ${dbKey}.${tableName}`)
  }

  return tableMapping
}

export const getSqlTreeTableColumns = (dbKey, tableName) =>
  getTableMapping(dbKey, tableName).columns

export const getSqlTreeColumnIndex = (dbKey, tableName, columnName) => {
  const index = getTableMapping(dbKey, tableName).indexByName[columnName]

  if (index === undefined) {
    throw new Error(`Unknown SQL tree column: ${dbKey}.${tableName}.${columnName}`)
  }

  return index
}

export const getSqlTreeColumnIndexes = (dbKey, tableName, columnNames) =>
  columnNames.map((columnName) => getSqlTreeColumnIndex(dbKey, tableName, columnName))

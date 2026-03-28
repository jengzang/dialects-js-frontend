const CHAR_KEYS = Object.freeze(['\u6f22\u5b57', '\u6c49\u5b57', 'chars', 'characters'])
const ANNOTATION_KEYS = Object.freeze([
  '\u91cb\u7fa9',
  '\u91ca\u4e49',
  'annotations',
  'notes'
])

const isObject = (value) => typeof value === 'object' && value !== null && !Array.isArray(value)

const normalizeLeafText = (value) => {
  if (value === null || value === undefined) {
    return ''
  }

  return String(value).trim()
}

const isBlankNodeName = (value) => normalizeLeafText(value) === ''

const pickArrayByKeys = (data, keys) => {
  for (const key of keys) {
    if (Array.isArray(data[key])) {
      return data[key]
    }
  }

  return null
}

const getArrayEntries = (data) => Object.entries(data).filter(([, value]) => Array.isArray(value))

const buildColumnArrayMap = (data, dataColumnNames = []) => {
  const arrayEntries = getArrayEntries(data)
  const arrayMap = new Map(arrayEntries)

  dataColumnNames.forEach((columnName, index) => {
    if (!arrayMap.has(columnName) && Array.isArray(arrayEntries[index]?.[1])) {
      arrayMap.set(columnName, arrayEntries[index][1])
    }
  })

  return arrayMap
}

const getConfiguredColumnArrays = (columnNames, arrayMap) =>
  (columnNames || []).map((columnName) => arrayMap.get(columnName)).filter(Array.isArray)

const appendLeafContent = (target, node) => {
  const chars = Array.isArray(node?.chars) ? node.chars : []
  const annotations = Array.isArray(node?.annotations) ? node.annotations : []

  chars.forEach((char, index) => {
    const normalizedChar = normalizeLeafText(char)
    if (!normalizedChar) {
      return
    }

    target.chars.push(normalizedChar)
    target.annotations.push(normalizeLeafText(annotations[index]))
  })
}

const composeLeafValues = (fieldConfig, arrayMap) => {
  const columnArrays = getConfiguredColumnArrays(fieldConfig?.columns, arrayMap)
  if (!columnArrays.length) {
    return []
  }

  const rowCount = columnArrays.reduce(
    (maxLength, currentValues) => Math.max(maxLength, currentValues.length),
    0
  )

  return Array.from({ length: rowCount }, (_, rowIndex) =>
    columnArrays
      .map((columnValues) => normalizeLeafText(columnValues[rowIndex]))
      .filter(Boolean)
      .join(fieldConfig?.joiner ?? '')
  )
}

const buildConfiguredLeafPayload = (data, options) => {
  const leafData = options?.leafData
  if (!leafData) {
    return null
  }

  const arrayMap = buildColumnArrayMap(data, options?.dataColumnNames || [])
  const requestedColumns = [
    ...(leafData.chars?.columns || []),
    ...(leafData.annotations?.columns || [])
  ]
  const hasRequestedValues = requestedColumns.some((columnName) =>
    Array.isArray(arrayMap.get(columnName))
  )

  if (!hasRequestedValues) {
    return null
  }

  const chars = composeLeafValues(leafData.chars, arrayMap)
  const annotations = composeLeafValues(leafData.annotations, arrayMap)
  const rowCount = Math.max(chars.length, annotations.length)

  if (!rowCount) {
    return null
  }

  const normalizedChars = []
  const normalizedAnnotations = []

  for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
    const charValue = normalizeLeafText(chars[rowIndex])
    if (!charValue) {
      continue
    }

    normalizedChars.push(charValue)
    normalizedAnnotations.push(normalizeLeafText(annotations[rowIndex]))
  }

  if (!normalizedChars.length) {
    return null
  }

  return {
    chars: normalizedChars,
    annotations: normalizedAnnotations
  }
}

const buildLegacyLeafPayload = (data) => {
  const charsByKey = pickArrayByKeys(data, CHAR_KEYS)
  const annotationsByKey = pickArrayByKeys(data, ANNOTATION_KEYS)

  if (charsByKey || annotationsByKey) {
    return {
      chars: charsByKey || [],
      annotations: annotationsByKey || []
    }
  }

  const arrayEntries = getArrayEntries(data)
  const objectEntries = Object.entries(data).filter(([, value]) => isObject(value))

  if (arrayEntries.length > 0 && objectEntries.length === 0) {
    return {
      chars: arrayEntries[0]?.[1] || [],
      annotations: arrayEntries[1]?.[1] || []
    }
  }

  return null
}

const normalizeChildNodes = (data, path, options) => {
  const normalizedChildren = []
  const promotedLeafContent = {
    chars: [],
    annotations: []
  }

  Object.entries(data)
    .filter(([, value]) => isObject(value))
    .forEach(([key, value], index) => {
      const childNode = normalizeNode(value, key, `${path}.${index}`, options)
      if (!childNode) {
        return
      }

      if (isBlankNodeName(childNode.name)) {
        appendLeafContent(promotedLeafContent, childNode)
        normalizedChildren.push(...(childNode.children || []))
        return
      }

      normalizedChildren.push(childNode)
    })

  return {
    children: normalizedChildren,
    ...promotedLeafContent
  }
}

const normalizeNode = (data, name, path, options) => {
  if (!isObject(data)) {
    return null
  }

  const configuredLeafPayload = buildConfiguredLeafPayload(data, options)
  if (configuredLeafPayload) {
    return {
      id: path,
      name,
      ...configuredLeafPayload,
      children: [],
      isLeaf: true
    }
  }

  const legacyLeafPayload = buildLegacyLeafPayload(data)
  if (legacyLeafPayload) {
    return {
      id: path,
      name,
      ...legacyLeafPayload,
      children: [],
      isLeaf: true
    }
  }

  const {
    children,
    chars,
    annotations
  } = normalizeChildNodes(data, path, options)

  if (!children.length && !chars.length) {
    return null
  }

  return {
    id: path,
    name,
    chars,
    annotations,
    children,
    isLeaf: children.length === 0
  }
}

export const normalizeCharClassTree = (rawTree, options = {}) =>
  Object.entries(rawTree || {})
    .map(([topKey, value], index) => normalizeNode(value, topKey, `node.${index}`, options))
    .filter(Boolean)

export const filterCharClassTree = (nodes, query) => {
  if (!nodes?.length) {
    return []
  }

  const trimmedQuery = query.trim()
  if (!trimmedQuery) {
    return nodes
  }

  const queryChars = trimmedQuery.split('')
  const loweredQuery = trimmedQuery.toLowerCase()

  return nodes.reduce((accumulator, node) => {
    const selfMatch = normalizeLeafText(node.name).toLowerCase().includes(loweredQuery)
    const charMatch = (node.chars || []).some((char) =>
      queryChars.some((queryChar) => char.includes(queryChar))
    )

    if (node.isLeaf) {
      if (selfMatch || charMatch) {
        accumulator.push({ ...node, _autoExpand: false })
      }

      return accumulator
    }

    const filteredChildren = filterCharClassTree(node.children || [], trimmedQuery)

    if (filteredChildren.length > 0 || charMatch) {
      accumulator.push({
        ...node,
        children: filteredChildren,
        _autoExpand: true
      })
    } else if (selfMatch) {
      accumulator.push({
        ...node,
        children: node.children,
        _autoExpand: false
      })
    }

    return accumulator
  }, [])
}

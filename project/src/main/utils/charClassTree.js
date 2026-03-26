const CHAR_KEYS = Object.freeze(['漢字', '汉字', 'chars', 'characters'])
const ANNOTATION_KEYS = Object.freeze(['釋義', '释义', 'annotations', 'notes'])

const isObject = (value) => typeof value === 'object' && value !== null && !Array.isArray(value)

const pickArrayByKeys = (data, keys) => {
  for (const key of keys) {
    if (Array.isArray(data[key])) {
      return data[key]
    }
  }

  return null
}

const normalizeNode = (data, name, path) => {
  if (!isObject(data)) {
    return null
  }

  const charsByKey = pickArrayByKeys(data, CHAR_KEYS)
  const annotationsByKey = pickArrayByKeys(data, ANNOTATION_KEYS)

  if (charsByKey || annotationsByKey) {
    return {
      id: path,
      name,
      chars: charsByKey || [],
      annotations: annotationsByKey || [],
      children: [],
      isLeaf: true
    }
  }

  const entries = Object.entries(data)
  const arrayEntries = entries.filter(([, value]) => Array.isArray(value))
  const objectEntries = entries.filter(([, value]) => isObject(value))

  if (arrayEntries.length > 0 && objectEntries.length === 0) {
    return {
      id: path,
      name,
      chars: arrayEntries[0]?.[1] || [],
      annotations: arrayEntries[1]?.[1] || [],
      children: [],
      isLeaf: true
    }
  }

  const children = objectEntries
    .map(([key, value], index) => normalizeNode(value, key, `${path}.${index}`))
    .filter(Boolean)

  return {
    id: path,
    name,
    children,
    isLeaf: false
  }
}

export const normalizeCharClassTree = (rawTree) =>
  Object.entries(rawTree || {})
    .map(([topKey, value], index) => normalizeNode(value, topKey, `node.${index}`))
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

  return nodes.reduce((accumulator, node) => {
    if (node.isLeaf) {
      const hasMatch = node.chars.some((char) =>
        queryChars.some((queryChar) => char.includes(queryChar))
      )

      if (hasMatch) {
        accumulator.push({ ...node, _autoExpand: false })
      }

      return accumulator
    }

    const selfMatch = node.name.toLowerCase().includes(trimmedQuery.toLowerCase())
    const filteredChildren = filterCharClassTree(node.children || [], trimmedQuery)

    if (filteredChildren.length > 0) {
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

// 相似度计算工具函数

// 计算熵
export function calculateEntropy(distribution) {
  return -distribution.reduce((sum, p) => {
    if (p === 0) return sum
    return sum + p * Math.log2(p)
  }, 0)
}

// 1. 余弦相似度
export function calculateCosineSimilarity(pieA, pieB, queryMode) {
  const allCategories = new Set()
  const getDistribution = (pie) => {
    const dist = {}
    const items = queryMode === 'by_value' ? pie.level1 : pie.phonetic_values
    if (!items) return dist
    items.forEach(item => {
      const key = queryMode === 'by_value' ? item.label : item.value
      dist[key] = item.percent / 100
      allCategories.add(key)
    })
    return dist
  }

  const distA = getDistribution(pieA)
  const distB = getDistribution(pieB)

  let dotProduct = 0
  let normA = 0
  let normB = 0

  allCategories.forEach(cat => {
    const a = distA[cat] || 0
    const b = distB[cat] || 0
    dotProduct += a * b
    normA += a * a
    normB += b * b
  })

  if (normA === 0 || normB === 0) return 0
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

// 2. 加权重叠度
export function calculateWeightedOverlap(pieA, pieB, queryMode) {
  const getDistribution = (pie) => {
    const dist = {}
    const items = queryMode === 'by_value' ? pie.level1 : pie.phonetic_values
    if (!items) return dist
    items.forEach(item => {
      const key = queryMode === 'by_value' ? item.label : item.value
      dist[key] = item.percent / 100
    })
    return dist
  }

  const distA = getDistribution(pieA)
  const distB = getDistribution(pieB)

  let overlap = 0
  Object.keys(distA).forEach(cat => {
    if (distB[cat]) {
      overlap += Math.min(distA[cat], distB[cat])
    }
  })

  return overlap
}

// 3. Top-K匹配度
export function calculateTopKMatch(pieA, pieB, queryMode, k = 3) {
  const getTopK = (pie) => {
    const items = queryMode === 'by_value' ? pie.level1 : pie.phonetic_values
    if (!items) return []
    return items
      .slice()
      .sort((a, b) => b.percent - a.percent)
      .slice(0, k)
      .map(item => queryMode === 'by_value' ? item.label : item.value)
  }

  const topA = new Set(getTopK(pieA))
  const topB = new Set(getTopK(pieB))

  const intersection = [...topA].filter(x => topB.has(x)).length
  const union = topA.size + topB.size - intersection

  return union === 0 ? 0 : intersection / union
}

// 4. KL散度
export function calculateKLDivergence(pieA, pieB, queryMode) {
  const allCategories = new Set()
  const getDistribution = (pie) => {
    const dist = {}
    const items = queryMode === 'by_value' ? pie.level1 : pie.phonetic_values
    if (!items) return dist
    items.forEach(item => {
      const key = queryMode === 'by_value' ? item.label : item.value
      dist[key] = item.percent / 100
      allCategories.add(key)
    })
    return dist
  }

  const distA = getDistribution(pieA)
  const distB = getDistribution(pieB)

  const epsilon = 1e-10
  let kl = 0

  allCategories.forEach(cat => {
    const p = (distA[cat] || 0) + epsilon
    const q = (distB[cat] || 0) + epsilon
    kl += p * Math.log(p / q)
  })

  return 1 / (1 + kl)
}

// 5. 字符集相似度（Jaccard）
export function calculateJaccardSimilarity(pieA, pieB, queryMode) {
  const getChars = (pie) => {
    const chars = new Set()
    const items = queryMode === 'by_value' ? pie.level1 : pie.phonetic_values
    if (!items) return chars
    items.forEach(item => {
      item.chars?.forEach(char => chars.add(char))
    })
    return chars
  }

  const charsA = getChars(pieA)
  const charsB = getChars(pieB)

  const intersection = [...charsA].filter(x => charsB.has(x)).length
  const union = charsA.size + charsB.size - intersection

  return union === 0 ? 0 : intersection / union
}

// 6. 字符加权相似度
export function calculateCharWeightedSimilarity(pieA, pieB, queryMode) {
  const getCharDistribution = (pie) => {
    const charDist = {}
    const items = queryMode === 'by_value' ? pie.level1 : pie.phonetic_values
    if (!items) return charDist

    items.forEach(item => {
      if (!item.level2) return
      item.level2.forEach(l2 => {
        l2.chars?.forEach(char => {
          if (!charDist[char]) charDist[char] = {}
          charDist[char][l2.label] = (charDist[char][l2.label] || 0) + 1
        })
      })
    })

    return charDist
  }

  const distA = getCharDistribution(pieA)
  const distB = getCharDistribution(pieB)

  const commonChars = Object.keys(distA).filter(char => distB[char])
  if (commonChars.length === 0) return 0

  let totalSimilarity = 0
  commonChars.forEach(char => {
    const l2A = distA[char]
    const l2B = distB[char]

    const allL2 = new Set([...Object.keys(l2A), ...Object.keys(l2B)])
    let dot = 0, normA = 0, normB = 0

    allL2.forEach(l2 => {
      const a = l2A[l2] || 0
      const b = l2B[l2] || 0
      dot += a * b
      normA += a * a
      normB += b * b
    })

    if (normA > 0 && normB > 0) {
      totalSimilarity += dot / (Math.sqrt(normA) * Math.sqrt(normB))
    }
  })

  return totalSimilarity / commonChars.length
}

// 7. 结构相似度
export function calculateStructuralSimilarity(pieA, pieB, queryMode) {
  const getStructure = (pie) => {
    const items = queryMode === 'by_value' ? pie.level1 : pie.phonetic_values
    if (!items) return { sectorCount: 0, maxPercent: 0, entropy: 0 }
    const percents = items.map(item => item.percent).sort((a, b) => b - a)

    return {
      sectorCount: items.length,
      maxPercent: percents[0] || 0,
      entropy: calculateEntropy(percents.map(p => p / 100))
    }
  }

  const structA = getStructure(pieA)
  const structB = getStructure(pieB)

  const countSim = 1 - Math.abs(structA.sectorCount - structB.sectorCount) /
                   Math.max(structA.sectorCount, structB.sectorCount, 1)
  const maxSim = 1 - Math.abs(structA.maxPercent - structB.maxPercent) / 100
  const entropySim = 1 - Math.abs(structA.entropy - structB.entropy) /
                     Math.max(structA.entropy, structB.entropy, 1)

  return (countSim * 0.3 + maxSim * 0.3 + entropySim * 0.4)
}

// 8. 共现类别数
export function calculateCooccurrence(pieA, pieB, queryMode) {
  const getCategories = (pie) => {
    const items = queryMode === 'by_value' ? pie.level1 : pie.phonetic_values
    if (!items) return new Set()
    return new Set(items.map(item =>
      queryMode === 'by_value' ? item.label : item.value
    ))
  }

  const catsA = getCategories(pieA)
  const catsB = getCategories(pieB)

  const intersection = [...catsA].filter(x => catsB.has(x)).length
  const union = catsA.size + catsB.size - intersection

  return union === 0 ? 0 : intersection / union
}

// 9. 分布均匀度相似
export function calculateEntropySimilarity(pieA, pieB, queryMode) {
  const getEntropy = (pie) => {
    const items = queryMode === 'by_value' ? pie.level1 : pie.phonetic_values
    if (!items) return 0
    const distribution = items.map(item => item.percent / 100)
    return calculateEntropy(distribution)
  }

  const entropyA = getEntropy(pieA)
  const entropyB = getEntropy(pieB)

  const maxEntropy = Math.max(entropyA, entropyB, 1)
  return 1 - Math.abs(entropyA - entropyB) / maxEntropy
}

// 10. 层次相似度
export function calculateHierarchicalSimilarity(pieA, pieB, queryMode) {
  const level1Sim = calculateCosineSimilarity(pieA, pieB, queryMode)

  const getLevel2Distribution = (pie) => {
    const dist = {}
    const items = queryMode === 'by_value' ? pie.level1 : pie.phonetic_values
    if (!items) return dist

    items.forEach(item => {
      if (!item.level2) return
      item.level2.forEach(l2 => {
        dist[l2.label] = (dist[l2.label] || 0) + l2.count
      })
    })

    const total = Object.values(dist).reduce((sum, v) => sum + v, 0)
    if (total > 0) {
      Object.keys(dist).forEach(key => {
        dist[key] = dist[key] / total
      })
    }

    return dist
  }

  const distA = getLevel2Distribution(pieA)
  const distB = getLevel2Distribution(pieB)

  const allL2 = new Set([...Object.keys(distA), ...Object.keys(distB)])
  let dot = 0, normA = 0, normB = 0

  allL2.forEach(l2 => {
    const a = distA[l2] || 0
    const b = distB[l2] || 0
    dot += a * b
    normA += a * a
    normB += b * b
  })

  const level2Sim = (normA === 0 || normB === 0) ? 0 :
                    dot / (Math.sqrt(normA) * Math.sqrt(normB))

  return level1Sim * 0.7 + level2Sim * 0.3
}

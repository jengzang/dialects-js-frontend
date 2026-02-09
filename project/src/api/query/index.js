// api/query/index.js - 查询模块统一导出
export {
  searchZhongGu,
  searchYinWei,
  searchChars,
  searchTones,
  getCharList,
  getFeatureCounts
} from './core.js'

export {
  getLocations,
  batchMatch,
  getPartitions,
  getRegions
} from './LocationAndRegion.js'

export {
  getCoordinates
} from './geo.js'

export {
  getPhonologyMatrix,
  getPhonologyClassificationMatrix,
  queryPhonology
} from './phonology.js'

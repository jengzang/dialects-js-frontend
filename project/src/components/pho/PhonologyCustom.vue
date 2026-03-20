<template>
  <div class="phonology-matrix-page">
    <!-- <div class="page-header">
      <h2 class="page-title">📐 音素分類</h2>
    </div> -->
    <!-- 特徵選擇 Tab -->
    <div class="feature-tabs">
      <label
          v-for="feature in features"
          :key="feature"
          class="feature-radio-label"
      >
        <input
            type="radio"
            :value="feature"
            v-model="selectedFeature"
            class="hidden-radio"
        />
        <span class="glass-indicator"></span>
        {{ feature }}
      </label>
    </div>
    <!-- 地点输入组件 -->
    <div class="input-section">
      <LocationMultiInput
          v-model="queryStrings"
          @update:matchedLocations="handleMatchedLocations"
          @update:isMatching="handleIsMatching"
      />
      <!-- 分類欄位選擇 -->
      <div class="column-selectors">
        <div class="selector-group">
          <label>{{ $t('phonology.phonology.custom.columns.horizontal') }}</label>
          <SimpleSelectDropdown
            v-model="horizontalColumn"
            :options="columnOptionsArray"
          />
        </div>

        <div class="selector-group">
          <label>{{ $t('phonology.phonology.custom.columns.vertical') }}</label>
          <SimpleSelectDropdown
            v-model="verticalColumn"
            :options="columnOptionsArray"
          />
        </div>

        <div class="selector-group">
          <label>{{ $t('phonology.phonology.custom.columns.cellRow') }}</label>
          <SimpleSelectDropdown
            v-model="cellRowColumn"
            :options="columnOptionsArray"
          />
        </div>
      </div>
      <button
          class="load-btn"
          @click="loadData"
          :disabled="matchedLocations.length === 0 || loading || isMatching"
      >
        <span v-if="isMatching" class="btn-spinner"></span>
        <span v-else-if="loading">{{ $t('phonology.phonology.custom.actions.loading') }}</span>
        <span v-else>{{ $t('phonology.phonology.custom.actions.query') }}</span>
      </button>
    </div>


    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>{{ $t('phonology.phonology.custom.actions.loading') }}</p>
    </div>

    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
      <button @click="loadData" class="retry-btn">{{ $t('phonology.phonology.custom.actions.retry') }}</button>
    </div>

    <div v-else-if="matrixData" class="matrix-container">
      <PhonologyMatrix
          v-for="location in displayLocations"
          :key="location"
          :location="location"
          :initials="matrixData.initials"
          :finals="matrixData.finals"
          :tones="matrixData.tones"
          :matrix="matrixData.matrix"
      />
    </div>

    <div v-else class="empty">
      <p>{{ $t('phonology.phonology.custom.states.emptyInput') }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { getPhonologyClassificationMatrix } from '@/api/query/phonology.js'
import PhonologyMatrix from '@/components/TableAndTree/PhonologyTable.vue'
import LocationMultiInput from '@/components/query/LocationMultiInput.vue'
import SimpleSelectDropdown from '@/components/common/SimpleSelectDropdown.vue'
import {
  parsePhonologyCustomParams,
  validatePhonologyParams
} from '@/api/urlParams.js'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const loading = ref(false)
const error = ref(null)
const matrixData = ref(null)
const isMatching = ref(false)
const shouldSyncUrl = ref(false)

// 特徵選擇（聲母/韻母/聲調） - Keep original values for API
const FEATURE_KEYS = ['聲母', '韻母', '聲調']
const features = computed(() => FEATURE_KEYS.map(key => t(`phonology.phonology.custom.features.${getFeatureKey(key)}`)))

// Helper to get translation key from Chinese value
const getFeatureKey = (chineseValue) => {
  const map = { '聲母': 'initial', '韻母': 'final', '聲調': 'tone' }
  return map[chineseValue]
}

// Helper to get Chinese value from translated value
const getChineseFeature = (translatedValue) => {
  const index = features.value.indexOf(translatedValue)
  return index >= 0 ? FEATURE_KEYS[index] : FEATURE_KEYS[0]
}

// Column keys - Keep original values for API
const COLUMN_KEYS = ['攝', '韻', '等', '呼', '入', '清濁', '系', '組', '母', '調', '部位', '方式']
const getColumnKey = (chineseValue) => {
  const map = {
    '攝': 'rhyme', '韻': 'rhymeDetail', '等': 'grade', '呼': 'openness',
    '入': 'entering', '清濁': 'voicing', '系': 'series', '組': 'group',
    '母': 'initial', '調': 'tone', '部位': 'place', '方式': 'manner'
  }
  return map[chineseValue]
}

const getChineseColumn = (translatedValue) => {
  const index = columnOptions.value.indexOf(translatedValue)
  return index >= 0 ? COLUMN_KEYS[index] : COLUMN_KEYS[0]
}

// 每個特徵的默認分類欄位配置 - Use Chinese keys
const featureDefaults = {
  '聲母': { horizontal: '清濁', vertical: '部位', cellRow: '母' },
  '韻母': { horizontal: '等', vertical: '攝', cellRow: '入' },
  '聲調': { horizontal: '清濁', vertical: '調', cellRow: '組' }
}

// 可選的分類欄位
const columnOptions = computed(() => COLUMN_KEYS.map(key => t(`phonology.phonology.custom.columnOptions.${getColumnKey(key)}`)))

// Column options for dropdown
const columnOptionsArray = computed(() => columnOptions.value.map(col => ({
  label: col,
  value: col
})))

// 解析 URL 参数
const urlParams = parsePhonologyCustomParams(route)

// 验证参数
const validation = validatePhonologyParams(
  urlParams,
  FEATURE_KEYS,
  COLUMN_KEYS
)

if (!validation.isValid) {
  console.warn('Invalid URL parameters:', validation.errors)
}

// 初始化地点
const queryStrings = ref(urlParams.locations)
const matchedLocations = ref([])

// 辅助函数：获取初始分类字段值
const getInitialColumn = (urlValue, defaultValue) => {
  return urlValue && COLUMN_KEYS.includes(urlValue) ? urlValue : defaultValue
}

// Get translated default values
const getTranslatedColumn = (chineseValue) => {
  const index = COLUMN_KEYS.indexOf(chineseValue)
  return index >= 0 ? columnOptions.value[index] : columnOptions.value[0]
}

// 初始化特征 - Use Chinese value internally
const selectedFeatureChinese = ref(
  FEATURE_KEYS.includes(urlParams.feature) ? urlParams.feature : FEATURE_KEYS[0]
)
const selectedFeature = computed({
  get: () => {
    const index = FEATURE_KEYS.indexOf(selectedFeatureChinese.value)
    return features.value[index]
  },
  set: (translatedValue) => {
    selectedFeatureChinese.value = getChineseFeature(translatedValue)
  }
})

// 初始化分类字段 - Use Chinese values internally
const horizontalColumnChinese = ref(
  getInitialColumn(
    urlParams.horizontalColumn,
    featureDefaults[selectedFeatureChinese.value].horizontal
  )
)
const horizontalColumn = computed({
  get: () => getTranslatedColumn(horizontalColumnChinese.value),
  set: (translatedValue) => {
    horizontalColumnChinese.value = getChineseColumn(translatedValue)
  }
})

const verticalColumnChinese = ref(
  getInitialColumn(
    urlParams.verticalColumn,
    featureDefaults[selectedFeatureChinese.value].vertical
  )
)
const verticalColumn = computed({
  get: () => getTranslatedColumn(verticalColumnChinese.value),
  set: (translatedValue) => {
    verticalColumnChinese.value = getChineseColumn(translatedValue)
  }
})

const cellRowColumnChinese = ref(
  getInitialColumn(
    urlParams.cellRowColumn,
    featureDefaults[selectedFeatureChinese.value].cellRow
  )
)
const cellRowColumn = computed({
  get: () => getTranslatedColumn(cellRowColumnChinese.value),
  set: (translatedValue) => {
    cellRowColumnChinese.value = getChineseColumn(translatedValue)
  }
})

const displayLocations = computed(() => {
  if (!matrixData.value) return []
  return matrixData.value.locations || []
})

// 处理匹配到的地点列表
const handleMatchedLocations = (locations) => {
  matchedLocations.value = locations
}

// 处理匹配状态
const handleIsMatching = (matching) => {
  isMatching.value = matching
}

// 更新 URL 参数
function updatePhonologyCustomUrl() {
  const query = {
    ...route.query,
    feature: encodeURIComponent(selectedFeatureChinese.value),
    h: encodeURIComponent(horizontalColumnChinese.value),
    v: encodeURIComponent(verticalColumnChinese.value),
    c: encodeURIComponent(cellRowColumnChinese.value)
  }

  if (matchedLocations.value.length > 0) {
    query.loc = matchedLocations.value.map(loc => encodeURIComponent(loc))
  } else {
    delete query.loc
  }

  router.replace({ query })
}

// 監聽特徵選擇變化
watch(selectedFeatureChinese, (newFeature) => {
  const query = {
    ...route.query,
    feature: encodeURIComponent(newFeature)
  }
  router.replace({ query })

  // 清空表格和錯誤信息
  matrixData.value = null
  error.value = null

  // 更新分類欄位為新特徵的默認值
  horizontalColumnChinese.value = featureDefaults[newFeature].horizontal
  verticalColumnChinese.value = featureDefaults[newFeature].vertical
  cellRowColumnChinese.value = featureDefaults[newFeature].cellRow
})

// 監聽分類字段變化
watch([horizontalColumnChinese, verticalColumnChinese, cellRowColumnChinese], () => {
  if (shouldSyncUrl.value) {
    updatePhonologyCustomUrl()
  }
})

// 數據轉換函數：將 API 返回的數據轉換為 PhonologyMatrix 組件需要的格式
const transformMatrixData = (apiData) => {
  // 驗證數據結構
  if (!apiData) {
    throw new Error(t('phonology.phonology.custom.states.apiError'))
  }

  if (!apiData.matrix) {
    console.error('API 數據結構:', apiData)
    throw new Error(t('phonology.phonology.custom.states.missingMatrix'))
  }

  // 轉換 matrix：提取 feature_value 的 keys 並附加字數
  const transformedMatrix = {}

  for (const h in apiData.matrix) {
    transformedMatrix[h] = {}
    for (const v in apiData.matrix[h]) {
      transformedMatrix[h][v] = {}
      for (const c in apiData.matrix[h][v]) {
        // 提取 keys 並附加字數，格式：["p (5)", "pʰ (3)"]
        transformedMatrix[h][v][c] = Object.entries(apiData.matrix[h][v][c]).map(
          ([key, chars]) => `${key}[${chars.length}]`
        )
      }
    }
  }

  return {
    locations: apiData.locations,
    initials: apiData.horizontal_values,
    finals: apiData.vertical_values,
    tones: apiData.cell_row_values,
    matrix: transformedMatrix
  }
}

const loadData = async () => {
  if (matchedLocations.value.length === 0) {
    error.value = t('phonology.phonology.custom.states.minLocationError')
    return
  }

  loading.value = true
  error.value = null

  try {
    const requestBody = {
      locations: matchedLocations.value,
      feature: selectedFeatureChinese.value,  // Use Chinese value for API
      horizontal_column: horizontalColumnChinese.value,  // Use Chinese value for API
      vertical_column: verticalColumnChinese.value,  // Use Chinese value for API
      cell_row_column: cellRowColumnChinese.value  // Use Chinese value for API
    }

    const result = await getPhonologyClassificationMatrix(requestBody)

    // 調試：查看返回的數據結構
    console.log('API result:', result)

    // 轉換數據格式
    matrixData.value = transformMatrixData(result.data || result)

    // 首次查询成功后启用 URL 同步
    shouldSyncUrl.value = true

    // 更新 URL
    updatePhonologyCustomUrl()

  } catch (err) {
    console.error('加載音韻矩陣失敗:', err)
    error.value = err.message || t('phonology.phonology.custom.states.loadError')
  } finally {
    loading.value = false
  }
}

// 页面加载时自动查询
onMounted(() => {
  const hasLocations = urlParams.locations.length > 0
  const hasAllColumns = urlParams.horizontalColumn &&
                        urlParams.verticalColumn &&
                        urlParams.cellRowColumn

  if (hasLocations && hasAllColumns && validation.isValid) {
    const unwatch = watch(matchedLocations, (locations) => {
      if (locations.length > 0) {
        loadData()
        unwatch()
      }
    })
  }
})

// 处理浏览器前进/后退
watch(() => route.query, (newQuery) => {
  const newParams = parsePhonologyCustomParams(route)

  // 更新特征
  if (newParams.feature !== selectedFeatureChinese.value &&
      FEATURE_KEYS.includes(newParams.feature)) {
    selectedFeatureChinese.value = newParams.feature
  }

  // 更新地点 - 只有当 URL 的地点和当前匹配的地点不同时，才清空数据
  const newLocations = newParams.locations
  if (JSON.stringify(newLocations) !== JSON.stringify(matchedLocations.value)) {
    queryStrings.value = newLocations
    matrixData.value = null
    error.value = null
  }

  // 更新分类字段
  if (newParams.horizontalColumn &&
      COLUMN_KEYS.includes(newParams.horizontalColumn)) {
    horizontalColumnChinese.value = newParams.horizontalColumn
  }

  if (newParams.verticalColumn &&
      COLUMN_KEYS.includes(newParams.verticalColumn)) {
    verticalColumnChinese.value = newParams.verticalColumn
  }

  if (newParams.cellRowColumn &&
      COLUMN_KEYS.includes(newParams.cellRowColumn)) {
    cellRowColumnChinese.value = newParams.cellRowColumn
  }
}, { deep: true })
</script>

<style scoped>
.phonology-matrix-page {
  width: 90dvw;
}


.input-section {
  max-width: 600px;
  margin: 0 auto 30px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  justify-content: center;
  align-items: center;
}

/* 容器：保证在同一行居中 */
.feature-tabs {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin: 20px auto;
}

/* 标签容器：让圆圈和文字垂直居中对齐 */
.feature-radio-label {
  display: flex;
  align-items: center;
  gap: 8px; /* 圆圈和文字的间距 */
  cursor: pointer;
  font-size: 15px;
  font-weight: 500;
  color: var(--text-dark, #333);
  user-select: none;
  transition: opacity 0.2s ease;
}

.feature-radio-label:hover {
  opacity: 0.8;
}

/* 隐藏原生单选框，但不影响功能 */
.hidden-radio {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

/* 液态玻璃圆圈（外圈） */
.glass-indicator {
  position: relative;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1px solid rgba(150, 150, 150, 0.3); /* 细微的边框 */
  background: rgba(255, 255, 255, 0.2); /* 半透明底色 */
  backdrop-filter: blur(8px); /* 核心：毛玻璃效果 */
  -webkit-backdrop-filter: blur(8px);
  box-shadow:
      inset 0 1px 3px rgba(255, 255, 255, 0.5), /* 顶部内发光（玻璃质感） */
      0 2px 4px rgba(0, 0, 0, 0.05); /* 底部微小阴影 */
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

/* 选中时的圆圈内部实心点 */
.glass-indicator::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--color-primary, #007aff); /* 苹果蓝，或你的主题色 */
  transform: translate(-50%, -50%) scale(0); /* 默认缩放为0隐藏 */
  transition: transform 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28); /* 弹性弹出动画 */
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

/* 选中状态触发器 */
.hidden-radio:checked + .glass-indicator {
  border-color: var(--color-primary, #007aff);
  background: rgba(255, 255, 255, 0.8); /* 选中时玻璃变亮 */
}

.hidden-radio:checked + .glass-indicator::after {
  transform: translate(-50%, -50%) scale(1); /* 弹出中心蓝点 */
}

/* 选中时的文字颜色变化（可选） */
.hidden-radio:checked ~ .feature-radio-label {
  color: var(--color-primary, #007aff);
}

.column-selectors {
  display: flex;
  gap: 16px;
  margin: 10px auto 10px;
  justify-content: center;
  flex-wrap: wrap;
  max-width: 600px;
}

.selector-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 150px;
}

.selector-group label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-dark);
  text-align: center;
}

.selector-group select {
  padding: 10px 12px;
  border: 1px solid var(--border-gray-light);
  border-radius: var(--radius-md);
  background: var(--glass-light2);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.selector-group select:hover {
  border-color: var(--color-primary);
  background: var(--glass-medium2);
}

.selector-group select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

.load-btn {
  padding: 12px 24px;
  max-width: 100px;
  white-space: nowrap;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%);
  color: var(--text-white);
  border: none;
  border-radius: var(--radius-md);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px var(--color-primary-shadow), 0 2px 4px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.load-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, var(--color-primary-hover) 0%, #004ba0 100%);
  box-shadow: 0 6px 16px var(--color-primary-shadow-light), 0 3px 6px rgba(0, 0, 0, 0.12);
  transform: translateY(-1px);
}

.load-btn:active:not(:disabled) {
  transform: translateY(0);
}

.load-btn:disabled {
  background: var(--bg-hover-medium);
  color: var(--text-secondary);
  cursor: not-allowed;
  box-shadow: none;
}

/* 按钮内的小旋转器 */
.btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  gap: 15px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid var(--glass-light2);
  border-top: 4px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading p {
  color: var(--text-secondary);
  font-size: 15px;
}

.error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  gap: 15px;
}

.error p {
  color: var(--color-error);
  font-size: 16px;
  font-weight: 500;
}

.retry-btn {
  padding: 10px 20px;
  background: var(--color-primary);
  color: var(--text-white);
  border: none;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-md);
}

.retry-btn:hover {
  background: var(--color-primary-hover);
  box-shadow: var(--shadow-lg);
  transform: translateY(-1px);
}

.matrix-container {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.empty {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  font-size: 16px;
}

/* 移动端适配 */
@media (max-aspect-ratio: 1/1) {

  .page-title {
    font-size: 24px;
  }

  .input-section {
    max-width: 100%;
  }

  .load-btn {
    font-size: 14px;
    padding: 10px 20px;
  }
}
</style>

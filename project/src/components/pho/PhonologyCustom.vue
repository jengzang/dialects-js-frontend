<template>
  <div class="phonology-matrix-page">
    <!-- <div class="page-header">
      <h2 class="page-title">📐 音素分類</h2>
    </div> -->
    <!-- 特徵選擇 Tab -->
    <div class="feature-tabs">
      <div
          v-for="feature in features"
          :key="feature"
          :class="['feature-tab', { active: selectedFeature === feature }]"
          @click="selectedFeature = feature"
      >
        {{ feature }}
      </div>
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
          <label>橫向分類</label>
          <SimpleSelectDropdown
            v-model="horizontalColumn"
            :options="columnOptionsArray"
          />
        </div>

        <div class="selector-group">
          <label>縱向分類</label>
          <SimpleSelectDropdown
            v-model="verticalColumn"
            :options="columnOptionsArray"
          />
        </div>

        <div class="selector-group">
          <label>單元格分行</label>
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
        <span v-else-if="loading">加載中...</span>
        <span v-else>查詢</span>
      </button>
    </div>


    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>加載中...</p>
    </div>

    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
      <button @click="loadData" class="retry-btn">重試</button>
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
      <p>請輸入地點並點擊查詢</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
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

const loading = ref(false)
const error = ref(null)
const matrixData = ref(null)
const isMatching = ref(false)
const shouldSyncUrl = ref(false)

// 特徵選擇（聲母/韻母/聲調）
const features = ['聲母', '韻母', '聲調']

// 每個特徵的默認分類欄位配置
const featureDefaults = {
  '聲母': {
    horizontal: '清濁',
    vertical: '部位',
    cellRow: '母'
  },
  '韻母': {
    horizontal: '等',
    vertical: '攝',
    cellRow: '入'
  },
  '聲調': {
    horizontal: '清濁',
    vertical: '調',
    cellRow: '組'
  }
}

// 可選的分類欄位
const columnOptions = ['攝', '韻', '等', '呼', '入', '清濁', '系', '組', '母', '調', '部位', '方式']

// Column options for dropdown
const columnOptionsArray = columnOptions.map(col => ({
  label: col,
  value: col
}))

// 解析 URL 参数
const urlParams = parsePhonologyCustomParams(route)

// 验证参数
const validation = validatePhonologyParams(
  urlParams,
  features,
  columnOptions
)

if (!validation.isValid) {
  console.warn('Invalid URL parameters:', validation.errors)
}

// 初始化特征
const selectedFeature = ref(
  features.includes(urlParams.feature) ? urlParams.feature : '聲母'
)

// 初始化地点
const queryStrings = ref(urlParams.locations)
const matchedLocations = ref([])

// 辅助函数：获取初始分类字段值
const getInitialColumn = (urlValue, defaultValue) => {
  return urlValue && columnOptions.includes(urlValue) ? urlValue : defaultValue
}

// 初始化分类字段
const horizontalColumn = ref(
  getInitialColumn(
    urlParams.horizontalColumn,
    featureDefaults[selectedFeature.value].horizontal
  )
)

const verticalColumn = ref(
  getInitialColumn(
    urlParams.verticalColumn,
    featureDefaults[selectedFeature.value].vertical
  )
)

const cellRowColumn = ref(
  getInitialColumn(
    urlParams.cellRowColumn,
    featureDefaults[selectedFeature.value].cellRow
  )
)

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
    feature: encodeURIComponent(selectedFeature.value),
    h: encodeURIComponent(horizontalColumn.value),
    v: encodeURIComponent(verticalColumn.value),
    c: encodeURIComponent(cellRowColumn.value)
  }

  if (matchedLocations.value.length > 0) {
    query.loc = matchedLocations.value.map(loc => encodeURIComponent(loc))
  } else {
    delete query.loc
  }

  router.replace({ query })
}

// 監聽特徵選擇變化
watch(selectedFeature, (newFeature) => {
  const query = {
    ...route.query,
    feature: encodeURIComponent(newFeature)
  }
  router.replace({ query })

  // 清空表格和錯誤信息
  matrixData.value = null
  error.value = null

  // 更新分類欄位為新特徵的默認值
  horizontalColumn.value = featureDefaults[newFeature].horizontal
  verticalColumn.value = featureDefaults[newFeature].vertical
  cellRowColumn.value = featureDefaults[newFeature].cellRow
})

// 監聽分類字段變化
watch([horizontalColumn, verticalColumn, cellRowColumn], () => {
  if (shouldSyncUrl.value) {
    updatePhonologyCustomUrl()
  }
})

// 數據轉換函數：將 API 返回的數據轉換為 PhonologyMatrix 組件需要的格式
const transformMatrixData = (apiData) => {
  // 驗證數據結構
  if (!apiData) {
    throw new Error('API 返回的數據為空')
  }

  if (!apiData.matrix) {
    console.error('API 數據結構:', apiData)
    throw new Error('API 返回的數據缺少 matrix 屬性')
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
    error.value = '請至少輸入一個地點'
    return
  }

  loading.value = true
  error.value = null

  try {
    const requestBody = {
      locations: matchedLocations.value,
      feature: selectedFeature.value,
      horizontal_column: horizontalColumn.value,
      vertical_column: verticalColumn.value,
      cell_row_column: cellRowColumn.value
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
    error.value = err.message || '加載數據時發生錯誤'
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
  if (newParams.feature !== selectedFeature.value &&
      features.includes(newParams.feature)) {
    selectedFeature.value = newParams.feature
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
      columnOptions.includes(newParams.horizontalColumn)) {
    horizontalColumn.value = newParams.horizontalColumn
  }

  if (newParams.verticalColumn &&
      columnOptions.includes(newParams.verticalColumn)) {
    verticalColumn.value = newParams.verticalColumn
  }

  if (newParams.cellRowColumn &&
      columnOptions.includes(newParams.cellRowColumn)) {
    cellRowColumn.value = newParams.cellRowColumn
  }
}, { deep: true })
</script>

<style scoped>
.phonology-matrix-page {
  width: 90dvw;
}

.page-header {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 20px 0;
}

.page-title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: var(--text-dark-light);
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

.feature-tabs {
  display: flex;
  gap: 8px;
  margin: 20px auto;
  justify-content: center;
  max-width: 400px;
}

.feature-tab {
  flex: 1;
  padding: 10px 20px;
  background: var(--glass-light2);
  border: 1px solid var(--border-gray-light);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  text-align: center;
}

.feature-tab.active {
  background: var(--color-primary);
  color: var(--text-white);
  border-color: var(--color-primary);
  box-shadow: var(--shadow-md);
}

.feature-tab:hover:not(.active) {
  background: var(--glass-medium2);
  transform: translateY(-1px);
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

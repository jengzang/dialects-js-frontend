<script setup>
import { ref, computed, onMounted } from 'vue'
import { getLeaderboard } from '@/api'
import { showError } from '@/utils/message.js'
import HelpIcon from '@/components/ToastAndHelp/HelpIcon.vue'

const loading = ref(false)
const error = ref(null)
const rankingsData = ref(null)

// 组件挂载时请求 API
onMounted(async () => {
  await fetchLeaderboard()
})

const fetchLeaderboard = async () => {
  loading.value = true
  error.value = null
  try {
    const data = await getLeaderboard()
    rankingsData.value = data
  } catch (e) {
    error.value = e.message
    showError('加载排名数据失败：' + e.message)
  } finally {
    loading.value = false
  }
}

// 格式化在线时长
const formatOnlineTime = (seconds) => {
  if (!seconds) return '0秒'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  if (hours > 0) {
    return `${hours}小时${minutes}分钟`
  }
  return `${minutes}分钟${secs}秒`
}

// Top 2 metrics for cards
const topMetrics = computed(() => {
  if (!rankingsData.value) return []
  const r = rankingsData.value.rankings
  return [
    {
      icon: '⏱️',
      label: '在線時長',
      data: r.online_time,
      isTime: true
    },
    {
      icon: '📊',
      label: '總查詢次數',
      data: r.total_queries,
      isTime: false,
      tooltip: '與個人信息的總查詢次數不同，還包括了語保查詢、各種表格查詢等'
    }
  ]
})

// Helper function to create table row
function createRow(label, data) {
  return {
    type: 'data',
    label,
    rank: data.rank,
    value: data.value.toLocaleString() + ' 次',
    gap: data.gap_to_prev ? data.gap_to_prev.toLocaleString() + ' 次' : '—',
    firstPlace: data.first_place_value.toLocaleString() + ' 次',
    // ✨ 修改：增加前三名的判断
    isFirstPlace: data.rank === 1,
    isSecondPlace: data.rank === 2,
    isThirdPlace: data.rank === 3
  }
}

// Category structure mapping
const categoryMap = {
  '音韻查詢': {
    icon: '🔍',
    categoryKey: 'category_音韻查詢',
    endpoints: [
      { key: 'endpoint__api_ZhongGu', label: '查中古' },
      { key: 'endpoint__api_YinWei', label: '查音位' },
      { key: 'endpoint__api_phonology', label: '查地位', tooltip: '包括彈窗內的細分查詢，以及舊版網站查詢次數' },
      { key: 'endpoint__api_charlist', label: '地位組合' },
      { key: 'endpoint__api_feature_stats', label: '查音節' },
      { key: 'endpoint__api_compare_ZhongGu', label: '比較中古' }
    ]
  },
  '字調查詢': {
    icon: '📝',
    categoryKey: 'category_字調查詢',
    endpoints: [
      { key: 'endpoint__api_search_chars_', label: '查字' },
      { key: 'endpoint__api_search_tones_', label: '查調' },
      { key: 'endpoint__api_compare_chars', label: '比較漢字' },
      { key: 'endpoint__api_compare_tones', label: '比較調類' }
    ]
  },
  '音系分析': {
    icon: '📊',
    categoryKey: 'category_音系分析',
    endpoints: [
      { key: 'endpoint__api_phonology_matrix', label: '查音系' },
      { key: 'endpoint__api_phonology_classification_matrix', label: '查音素' },
      { key: 'endpoint__api_feature_counts', label: '音節統計' }
    ]
  },
  '工具使用': {
    icon: '🛠️',
    categoryKey: 'category_工具使用',
    endpoints: [
      { key: 'endpoint__api_tools_check_analyze', label: '字表檢查' },
      { key: 'endpoint__api_tools_jyut2ipa_upload', label: '粵拼轉換' },
      { key: 'endpoint__api_tools_merge_execute', label: '合併字表' },
      { key: 'endpoint__api_tools_praat_jobs', label: '聲學分析' }
    ]
  },
  '其他查詢': {
    icon: '🏷️',
    categoryKey: 'category_其他查询',
    endpoints: [
      { key: 'endpoint__api_get_coordinates', label: '坐標查詢', tooltip: '獲取坐標數據以繪製地圖，查中古、查音位、查字、查調、分區圖、自定義繪圖等均會使用' },
      { key: 'endpoint__sql_query', label: '表格查詢', tooltip: '包括各種表格查詢，例如語保詞彙語法查詢、資料來源查詢、全粵村情表格、陽春口語詞等' },
      { key: 'endpoint__sql_tree_full', label: '樹形查詢', tooltip: '包括各種樹狀圖查詢，例如廣東自然村樹狀圖、中古地位等' },
    ]
  }
}

// Bottom metrics table with hierarchical structure
const tableData = computed(() => {
  if (!rankingsData.value) return []
  const rows = []
  const r = rankingsData.value.rankings

  // Iterate through each category
  for (const [categoryName, categoryInfo] of Object.entries(categoryMap)) {
    const categoryData = r[categoryInfo.categoryKey]

    // Skip category if no data or value is 0
    // if (!categoryData || categoryData.value === 0) continue

    // Create category summary data object
    const categorySummary = {
      rank: categoryData.rank,
      value: categoryData.value.toLocaleString() + ' 次',
      gap: categoryData.gap_to_prev ? categoryData.gap_to_prev.toLocaleString() + ' 次' : '—',
      firstPlace: categoryData.first_place_value.toLocaleString() + ' 次',
      isFirstPlace: categoryData.rank === 1,
      isSecondPlace: categoryData.rank === 2,
      isThirdPlace: categoryData.rank === 3
    }

    // Collect endpoint rows for this category (only if value > 0)
    const endpointRows = []
    for (const endpoint of categoryInfo.endpoints) {
      const data = r[endpoint.key]
      if (data && data.value >= 0) {
        const endpointRow = createRow(endpoint.label, data)
        endpointRow.categoryName = categoryName
        endpointRow.categoryIcon = categoryInfo.icon
        endpointRow.categorySummary = categorySummary
        endpointRow.tooltip = endpoint.tooltip // 添加 tooltip
        endpointRows.push(endpointRow)
      }
    }

    if (endpointRows.length > 0) {
      // Mark first endpoint for rowspan
      endpointRows[0].isFirstEndpointInCategory = true
      endpointRows[0].categoryEndpointCount = endpointRows.length

      // Add category summary row for mobile
      const categorySummaryRow = createRow(`${categoryName} (总计)`, categoryData)
      categorySummaryRow.isCategorySummary = true
      categorySummaryRow.categoryName = categoryName
      categorySummaryRow.categoryIcon = categoryInfo.icon
      rows.push(categorySummaryRow)

      rows.push(...endpointRows)
    }
  }

  return rows
})

function formatMetricValue(metric) {
  return metric.isTime
    ? formatOnlineTime(metric.data.value)
    : metric.data.value.toLocaleString() + ' 次'
}

function formatMetricGap(metric) {
  if (!metric.data.gap_to_prev) return null
  return metric.isTime
    ? formatOnlineTime(metric.data.gap_to_prev)
    : metric.data.gap_to_prev.toLocaleString() + ' 次'
}

function formatMetricFirst(metric) {
  return metric.isTime
    ? formatOnlineTime(metric.data.first_place_value)
    : metric.data.first_place_value.toLocaleString() + ' 次'
}
</script>

<template>
  <div class="leaderboard-container">
    <!-- Loading 状态 -->
    <div v-if="loading" class="loading-container">
      <div class="login-spinner"></div>
      <p>正在加载排名数据...</p>
    </div>

    <!-- Error 状态 -->
    <div v-else-if="error" class="error-container">
      <p class="err">{{ error }}</p>
      <button @click="fetchLeaderboard" class="retry-btn">重试</button>
    </div>

    <!-- 正常显示 -->
    <div v-else-if="rankingsData" class="leaderboard-content">
      <h3 class="page-title">🏆 我的排名统计</h3>

      <!-- Top 2 Metrics: Cards -->
      <div class="top-metrics-cards">
        <div
          v-for="metric in topMetrics"
          :key="metric.label"
          class="metric-card"
          :class="{
            'first-place': metric.data.rank === 1,
            'second-place': metric.data.rank === 2,
            'third-place': metric.data.rank === 3
          }"
        >
          <div class="metric-header">
            <span class="metric-icon">{{ metric.icon }}</span>
            <span class="metric-label">
              {{ metric.label }}
              <HelpIcon
                v-if="metric.tooltip"
                :content="metric.tooltip"
                size="md"
                fontSize="16px"
                iconColor="#c7254e"
                trigger="both"
              />
            </span>
          </div>

          <div v-if="metric.data.rank === 1" class="metric-rank gold">
            🥇 第 1 名
          </div>
          <div v-else-if="metric.data.rank === 2" class="metric-rank silver">
            🥈 第 2 名
          </div>
          <div v-else-if="metric.data.rank === 3" class="metric-rank bronze">
            🥉 第 3 名
          </div>
          <div v-else class="metric-rank">
            第 {{ metric.data.rank }} 名
          </div>

          <div class="metric-value">
            {{ formatMetricValue(metric) }}
          </div>

          <div class="metric-details">
            <div v-if="formatMetricGap(metric)" class="metric-gap">
              距上一名: {{ formatMetricGap(metric) }}
            </div>
            <div class="metric-first">
              第一名: {{ formatMetricFirst(metric) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom 16 Metrics: Table -->
      <div class="table-wrapper">
        <div class="table-container">
          <!-- Desktop table: 10 columns with rowspan -->
          <table class="rankings-table desktop-table">
            <thead>
              <tr>
                <th class="category-column">類別</th>
                <th>排名</th>
                <th>次數</th>
                <th>距前一名</th>
                <th>第一名</th>
                <th>具體</th>
                <th>排名</th>
                <th>次數</th>
                <th>距前一名</th>
                <th>第一名</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="(row, index) in tableData" :key="'desktop-' + index">
                <!-- Desktop: 10-column hierarchical structure -->
                <tr v-if="!row.isCategorySummary"
                    class="data-row"
                    :class="{
                      'first-place': row.isFirstPlace,
                      'second-place': row.isSecondPlace,
                      'third-place': row.isThirdPlace
                    }">
                  <!-- Category columns with rowspan (only on first endpoint of each category) -->
                  <template v-if="row.isFirstEndpointInCategory">
                    <td :rowspan="row.categoryEndpointCount" class="category-cell">
                      {{ row.categoryIcon }} {{ row.categoryName }}
                    </td>
                    <td :rowspan="row.categoryEndpointCount" class="rank category-data">
                      <span v-if="row.categorySummary.isFirstPlace" class="rank-badge gold">🥇 第1名</span>
                      <span v-else-if="row.categorySummary.isSecondPlace" class="rank-badge silver">🥈 第2名</span>
                      <span v-else-if="row.categorySummary.isThirdPlace" class="rank-badge bronze">🥉 第3名</span>
                      <span v-else class="rank-badge">第{{ row.categorySummary.rank }}名</span>
                    </td>
                    <td :rowspan="row.categoryEndpointCount" class="value category-data">
                      {{ row.categorySummary.value }}
                    </td>
                    <td :rowspan="row.categoryEndpointCount" class="gap category-data">
                      {{ row.categorySummary.gap }}
                    </td>
                    <td :rowspan="row.categoryEndpointCount" class="first-place-value category-data">
                      {{ row.categorySummary.firstPlace }}
                    </td>
                  </template>

                  <!-- Endpoint columns (one per row) -->
                  <td class="metric-name">
                    {{ row.label }}
                    <HelpIcon
                      v-if="row.tooltip"
                      :content="row.tooltip"
                      size="sm"
                      fontSize="14px"
                      trigger="both"
                    />
                  </td>
                  <td class="rank">
                    <span v-if="row.isFirstPlace" class="rank-badge gold">🥇 第1名</span>
                    <span v-else-if="row.isSecondPlace" class="rank-badge silver">🥈 第2名</span>
                    <span v-else-if="row.isThirdPlace" class="rank-badge bronze">🥉 第3名</span>
                    <span v-else class="rank-badge">第{{ row.rank }}名</span>
                  </td>
                  <td class="value">{{ row.value }}</td>
                  <td class="gap">{{ row.gap }}</td>
                  <td class="first-place-value">{{ row.firstPlace }}</td>
                </tr>
              </template>
            </tbody>
          </table>

          <!-- Mobile table: 5 columns with group headers -->
          <table class="rankings-table mobile-table">
            <thead>
              <tr>
                <th>指標</th>
                <th>排名</th>
                <th>次數</th>
                <th>距前一名</th>
                <th>第一名</th>
              </tr>
            </thead>
            <tbody>
              <!-- Category summary rows -->
              <template v-for="(row, index) in tableData" :key="'mobile-cat-' + index">
                <tr v-if="row.isCategorySummary"
                    class="data-row category-summary"
                    :class="{
                      'first-place': row.isFirstPlace,
                      'second-place': row.isSecondPlace,
                      'third-place': row.isThirdPlace
                    }">
                  <td class="metric-name">{{ row.categoryIcon }} {{ row.categoryName }}</td>
                  <td class="rank">
                    <span v-if="row.isFirstPlace" class="rank-badge gold">🥇 第1名</span>
                    <span v-else-if="row.isSecondPlace" class="rank-badge silver">🥈 第2名</span>
                    <span v-else-if="row.isThirdPlace" class="rank-badge bronze">🥉 第3名</span>
                    <span v-else class="rank-badge">第{{ row.rank }}名</span>
                  </td>
                  <td class="value">{{ row.value }}</td>
                  <td class="gap">{{ row.gap }}</td>
                  <td class="first-place-value">{{ row.firstPlace }}</td>
                </tr>
              </template>
              <!-- Endpoint rows -->
              <template v-for="(row, index) in tableData" :key="'mobile-end-' + index">
                <tr v-if="!row.isCategorySummary"
                    class="data-row"
                    :class="{
                      'first-place': row.isFirstPlace,
                      'second-place': row.isSecondPlace,
                      'third-place': row.isThirdPlace
                    }">
                  <td class="metric-name">
                    {{ row.label }}
                    <HelpIcon
                      v-if="row.tooltip"
                      :content="row.tooltip"
                      size="sm"
                      fontSize="14px"
                      trigger="both"
                    />
                  </td>
                  <td class="rank">
                    <span v-if="row.isFirstPlace" class="rank-badge gold">🥇 第1名</span>
                    <span v-else-if="row.isSecondPlace" class="rank-badge silver">🥈 第2名</span>
                    <span v-else-if="row.isThirdPlace" class="rank-badge bronze">🥉 第3名</span>
                    <span v-else class="rank-badge">第{{ row.rank }}名</span>
                  </td>
                  <td class="value">{{ row.value }}</td>
                  <td class="gap">{{ row.gap }}</td>
                  <td class="first-place-value">{{ row.firstPlace }}</td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>

      <div class="total-users">
        共 {{ rankingsData.total_users }} 位用户参与排名
      </div>
    </div>
  </div>
</template>

<style scoped>
.leaderboard-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.loading-container,
.error-container {
  text-align: center;
  padding: 40px 20px;
}

.login-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 122, 255, 0.2);
  border-top-color: #007aff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-container .err {
  color: #ff3b30;
  margin-bottom: 20px;
}

.retry-btn {
  padding: 10px 24px;
  background: #007aff;
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s ease;
}

.retry-btn:hover {
  background: #0051d5;
  transform: translateY(-2px);
}

.leaderboard-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #1d1d1f;
  margin:12px;
  text-align: center;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, #007aff, #0051d5);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Top 2 Metrics: Cards */
.top-metrics-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 32px;
}

.metric-card {
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  border-radius: 20px;
  padding: 24px;
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.04),
    0 8px 32px rgba(0, 0, 0, 0.08),
    inset 0 0 0 1px rgba(255, 255, 255, 0.9);
  border: 0.5px solid rgba(255, 255, 255, 0.8);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.metric-card:hover {
  transform: translateY(-4px);
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.06),
    0 12px 40px rgba(0, 0, 0, 0.12);
}

.metric-card.first-place {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.15), rgba(255, 215, 0, 0.08));
  border-left: 4px solid #ffd700;
}

.metric-card.second-place {
  background: linear-gradient(135deg, rgba(192, 192, 192, 0.15), rgba(224, 224, 224, 0.08));
  border-left: 4px solid #c0c0c0;
}

.metric-card.third-place {
  background: linear-gradient(135deg, rgba(205, 127, 50, 0.15), rgba(255, 160, 122, 0.08));
  border-left: 4px solid #cd7f32;
}

.metric-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px ;
}

.metric-icon {
  font-size: 24px;
}

.metric-label {
  font-size: 16px;
  font-weight: 600;
  color: #1d1d1f;
  letter-spacing: -0.01em;
}

.metric-rank {
  font-size: 36px;
  font-weight: 700;
  color: #007aff;
  background: linear-gradient(135deg, #007aff, #0051d5);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.metric-rank.gold {
  background: linear-gradient(135deg, #ffd700, #ffed4e);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.metric-rank.silver {
  background: linear-gradient(135deg, #c0c0c0, #e0e0e0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 1px 1px rgba(0,0,0,0.1));
}

.metric-rank.bronze {
  background: linear-gradient(135deg, #cd7f32, #ffab73);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.metric-value {
  font-size: 28px;
  font-weight: 600;
  color: #1d1d1f;
}

.metric-details {
  font-size: 14px;
  color: #86868b;
  line-height: 1.6;
}

.metric-gap {
  color: #ff9500;
  font-weight: 500;
}

.metric-first {
  color: #86868b;
}

/* Bottom 16 Metrics: Table */
.table-wrapper {
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  border-radius: 20px;
  padding: 20px;
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.04),
    0 8px 32px rgba(0, 0, 0, 0.08),
    inset 0 0 0 1px rgba(255, 255, 255, 0.9);
  border: 0.5px solid rgba(255, 255, 255, 0.8);
}

.table-container {
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(20px);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.6);
}

.rankings-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.rankings-table thead {
  position: sticky;
  top: 0;
  background: rgba(247, 247, 247, 0.95);
  backdrop-filter: blur(20px) saturate(180%);
  z-index: 10;
}

.rankings-table th {
  padding: 14px 12px;
  text-align: left;
  font-weight: 600;
  font-size: 13px;
  white-space: nowrap;
  color: #86868b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.category-column {
  width: 100px;
}

.category-cell {
  font-weight: 600;
  font-size: 14px;
  color: #007aff;
  background: linear-gradient(135deg, rgba(0, 122, 255, 0.12), rgba(0, 122, 255, 0.06));
  border-right: 2px solid rgba(0, 122, 255, 0.3);
  vertical-align: middle;
  text-align: center;
  letter-spacing: -0.01em;
  padding: 12px 8px;
}

.category-data {
  background: linear-gradient(90deg, rgba(0, 122, 255, 0.06), rgba(0, 122, 255, 0.03));
  font-weight: 600;
  border-right: 1px solid rgba(0, 122, 255, 0.15);
}

/* Desktop: show desktop table, hide mobile table */
.desktop-table {
  display: table;
}

.mobile-table {
  display: none;
}

.mobile-table .group-header td {
  padding: 10px 8px;
  font-weight: 600;
  font-size: 13px;
  background: linear-gradient(135deg, rgba(0, 122, 255, 0.12), rgba(0, 122, 255, 0.06));
  color: #007aff;
  letter-spacing: -0.01em;
  border-top: 1px solid rgba(0, 122, 255, 0.2);
  border-bottom: 1px solid rgba(0, 122, 255, 0.2);
}

.data-row {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
}

.data-row.category-summary {
  background: linear-gradient(90deg, rgba(0, 122, 255, 0.08), rgba(0, 122, 255, 0.04));
  font-weight: 600;
}

.data-row.category-summary .metric-name {
  color: #007aff;
  font-weight: 600;
}

.data-row:hover {
  background: linear-gradient(90deg, rgba(0, 122, 255, 0.08), rgba(0, 122, 255, 0.04));
  transform: translateX(2px);
}

.data-row.category-summary:hover {
  background: linear-gradient(90deg, rgba(0, 122, 255, 0.12), rgba(0, 122, 255, 0.06));
}

.data-row.first-place {
  background: linear-gradient(90deg, rgba(255, 215, 0, 0.15), rgba(255, 215, 0, 0.08));
  border-left: 3px solid #ffd700;
}

.data-row.first-place:hover {
  background: linear-gradient(90deg, rgba(255, 215, 0, 0.2), rgba(255, 215, 0, 0.12));
}

.data-row.second-place {
  background: linear-gradient(90deg, rgba(192, 192, 192, 0.15), rgba(224, 224, 224, 0.08));
  border-left: 3px solid #c0c0c0;
}

.data-row.second-place:hover {
  background: linear-gradient(90deg, rgba(192, 192, 192, 0.2), rgba(192, 192, 192, 0.12));
}

.data-row.third-place {
  background: linear-gradient(90deg, rgba(205, 127, 50, 0.15), rgba(255, 160, 122, 0.08));
  border-left: 3px solid #cd7f32;
}

.data-row.third-place:hover {
  background: linear-gradient(90deg, rgba(205, 127, 50, 0.2), rgba(205, 127, 50, 0.12));
}

.data-row td {
  padding: 12px;
  font-size: 14px;
  color: #1d1d1f;
}

.metric-name {
  font-weight: 500;
  letter-spacing: -0.01em;
}

.rank-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 6px;
  background: rgba(0, 122, 255, 0.1);
  color: #007aff;
  font-weight: 600;
  font-size: 13px;
  letter-spacing: -0.01em;
  white-space: nowrap;
}

.rank-badge.gold {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 215, 0, 0.15));
  color: #d4af37;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(255, 215, 0, 0.3);
}

.rank-badge.silver {
  background: linear-gradient(135deg, rgba(192, 192, 192, 0.2), rgba(220, 220, 220, 0.15));
  color: #7f8c8d;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(192, 192, 192, 0.3);
}

.rank-badge.bronze {
  background: linear-gradient(135deg, rgba(205, 127, 50, 0.2), rgba(255, 160, 122, 0.15));
  color: #a0522d;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(205, 127, 50, 0.3);
}

.value {
  font-weight: 600;
  color: #007aff;
}

.gap {
  color: #ff9500;
  font-weight: 500;
}

.first-place-value {
  color: #86868b;
  font-weight: 500;
}

.total-users {
  text-align: center;
  color: #86868b;
  font-size: 14px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

/* Portrait mode: unified mobile layout */
@media (orientation: portrait) {
  .leaderboard-container {
    padding: 16px 12px;
    width: 100%;
    box-sizing: border-box;
    /* 防止页面横向溢出 */
    overflow-x: hidden;

  }
  .leaderboard-content {
    display: flex;
    flex-direction: column; /* 垂直排列 */
    align-items: center;    /* 水平居中核心代码 */
    width: 100%;
  }

  /* Hide desktop table, show mobile table */
  .desktop-table {
    display: none;
  }

  .mobile-table {
    display: table;
  }

  .page-title {
    font-size: 20px;
  }

  /* --- 修复 1: 顶部卡片居中 --- */
  .top-metrics-cards {
    display: flex;
    /* 关键：让容器占满父元素宽度，内部元素才能真正居中 */
    width: 100%;
    justify-content: center; /* 内部卡片居中 */
    gap: 16px;
    margin-bottom: 24px;

    /* 移除之前的 width: 90% 和 overflow 设置，
       因为只有两个卡片，通常不需要横向滚动。
       如果确实需要滚动，请保留 overflow-x: auto 并改为 justify-content: flex-start */
    overflow-x: visible;
  }

  .metric-card {
    min-width: 100px;
    flex-shrink: 0;
    padding: 16px;
  }

  .metric-header {
    margin-bottom: 12px;
  }

  .metric-icon {
    font-size: 20px;
  }

  .metric-label {
    font-size: 15px;
  }

  .metric-rank {
    font-size: 28px;
  }

  .metric-value {
    font-size: 20px;
  }

  .metric-details {
    font-size: 12px;
  }

  /* --- 修复 2: 表格滚动问题 --- */
  .table-wrapper {
    width: 100%;
    /* 关键1：覆盖父元素的 align-items: center，让容器占满宽度 */
    align-self: stretch;
    /* 关键2：允许 flex 子元素收缩到比内容更小 */
    min-width: 0;
    padding: 12px 0;
    box-sizing: border-box;
    overflow: hidden; /* wrapper 不负责滚动，只负责装饰 */
  }

  .table-container {
    width: 100%;
    /* 关键：只在这里开启滚动 */
    overflow-x: auto;
    /* iOS 必须加这个属性才能顺滑滚动 */
    -webkit-overflow-scrolling: touch;
    padding: 0 12px; /* 将内边距移到这里，保证内容不贴边 */
    box-sizing: border-box;
    border-radius: 0; /* 移动端通常不需要内部圆角 */
    box-shadow: none; /* 移除可能的阴影干扰 */
  }

  .rankings-table {
    min-width: 100px;
  }

  .rankings-table th {
    padding: 10px 6px;
    font-size: 11px;
  }

  .data-row td {
    padding: 10px 6px;
    font-size: 12px;
    white-space: nowrap;
  }

  .metric-name {
    font-size: 13px;
  }

  .rank-badge {
    padding: 3px 8px;
    font-size: 12px;
  }

  .total-users {
    font-size: 12px;
    margin-top: 16px;
    padding-top: 12px;
  }
}
</style>

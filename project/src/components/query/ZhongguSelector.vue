<template>
  <div class="query-result-box glass-card">

    <div v-if="hasSelection" class="info-header">
      <div class="info-text">
        <span class="info-icon">ℹ️</span>
        <span>
          可能產生<strong>{{ combinations.length }}</strong>種組合
          <span v-if="!loading && results.length >= 0" class="fade-in">
          ,實際匹配<strong>{{ results.length }}</strong>組
          </span>,將按所選組合整理輸出<strong>{{ selectedCard }}</strong>
          </span>
      </div>

      <button
          v-if="!loading && results.length > 0"
          class="global-expand-btn"
          @click="isModalOpen = true"
      >
        ⤢ 詳情
      </button>
    </div>

    <div v-if="limitHint" class="limit-warning">
      ⚠️ {{ limitHint }}
    </div>

    <div v-if="loading" class="status-msg loading">
      <span class="spinner">↻</span> 正在查詢數據...
    </div>

    <div v-else-if="!results || results.length === 0" class="status-msg empty">
      {{ hasSelection ? '暫無匹配漢字' : '請選擇上方條件以檢索' }}
    </div>

    <div v-else class="compact-grid">
      <div v-for="item in results" :key="item.query" class="compact-item">
        <span class="compact-title">{{ formatTitle(item.query) }}</span>
        <span class="compact-count">({{ item['字数'] }})</span>
        <span class="compact-preview">
          {{ item['汉字'].slice(0, 8).join('') }}{{ item['汉字'].length > 8 ? '...' : '' }}
        </span>
      </div>
    </div>
  </div>

  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="isModalOpen" class="glass-modal-overlay" @click.self="isModalOpen = false">
        <div class="modal-content glass-card-high">
          <div class="modal-header">
            <h2>檢索詳情</h2>
            <button class="close-btn" @click="isModalOpen = false">✕</button>
          </div>

          <div class="modal-body">
            <div v-for="item in results" :key="item.query" class="full-item">
              <div class="full-item-header">
                <span class="combo-name">{{ formatTitle(item.query) }}</span>
                <span class="count-badge">{{ item['字数'] }} 字</span>
              </div>
<!--              <div class="full-chars">-->
<!--                <span v-for="(char, idx) in item['汉字']" :key="idx" class="char-tag">{{ char }}</span>-->
<!--              </div>-->
              <div class="full-chars">
                {{ item['汉字'].join('') }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { api } from '@/utils/auth.js'
import { userStore, setTabContentDisabled } from '@/utils/store.js'
import { ROLE_LIMITS, QUERY_CONFIG } from '@/config/constants.js'

// 定义事件，用于通知父组件禁用/启用按钮
const emit = defineEmits(['update:runDisabled'])

// 辅助函数：同时更新 emit 和 store（向后兼容）
function updateDisabledState(isDisabled) {
  // 1. Emit to parent (backward compatible)
  emit('update:runDisabled', isDisabled)

  // 2. Update store for tab2 (中古查询)
  setTabContentDisabled('query', 'tab2', isDisabled)
}

const props = defineProps({
  activeKeys: { type: Array, default: () => [] },
  valueMap: { type: Object, default: () => ({}) },
  isDropdownOpen: { type: Boolean, default: false },
  selectedCard: { type: String, default: '結果' },
  excludeColumns: { type: Array, default: () => [] }  // ✨ 新增
})

const loading = ref(false)
const results = ref([])
const pendingQuery = ref(false)
const limitHint = ref('') // 🔴 用于存储错误提示
let debounceTimer = null

// ✅ 新增：控制全屏弹窗开关
const isModalOpen = ref(false)

// ✅ 直接使用 userStore.role（响应式），无需轮询
// userStore.role 会在 auth.js 的 getUserRole() 中自动更新

// 1. 计算逻辑 (保持不变)
const combinations = computed(() => {
  const validEntries = props.activeKeys
      .map(key => ({ key, values: props.valueMap[key] }))
      .filter(e => e.values && e.values.length > 0)

  if (validEntries.length === 0) return []

  return validEntries.reduce((acc, entry) => {
    const next = []
    acc.forEach(path => {
      entry.values.forEach(val => {
        next.push(path + `[${val}]{${entry.key}}`)
      })
    })
    return next
  }, [''])
})

const hasSelection = computed(() => combinations.value.length > 0 && combinations.value[0] !== '')

// 2. Watch 逻辑 (🔴 修改：加入前置拦截)
watch(combinations, (newVal, oldVal) => {
  if (JSON.stringify(newVal) === JSON.stringify(oldVal)) return
  if (debounceTimer) clearTimeout(debounceTimer)
  pendingQuery.value = false

  // 重置状态
  limitHint.value = ''

  if (!hasSelection.value) {
    results.value = []
    return
  }

  // ✅ 使用 constants 中的限制值
  const count = newVal.length
  const limits = ROLE_LIMITS[userStore.role] || ROLE_LIMITS.anonymous

  // 检查组合数是否超限
  if (count > limits.MAX_COMBINATIONS) {
    limitHint.value = `檢索組合過多(${count}>${limits.MAX_COMBINATIONS})，請縮小檢索範圍`
    results.value = [] // 清空旧数据
    return // ⛔️ 终止，不发起 API 请求
  }

  debounceTimer = setTimeout(() => {
    if (!props.isDropdownOpen) {
      fetchData(newVal)
    } else {
      pendingQuery.value = true
    }
  }, QUERY_CONFIG.DEBOUNCE_DELAY)  // ✅ 使用 constants 中的防抖延迟
})

watch(() => props.isDropdownOpen, (isOpen) => {
  if (!isOpen && pendingQuery.value) {
    fetchData(combinations.value)
    pendingQuery.value = false
  }
})

// ✨ 监听 excludeColumns 变化，重新调用 API
watch(() => props.excludeColumns, (newVal, oldVal) => {

  // 只有在有选择的情况下才触发
  if (!hasSelection.value) return
  // console.log("watch1")
  // // 比较新旧值，避免不必要的请求
  // if (JSON.stringify(newVal) === JSON.stringify(oldVal)) return
  // console.log("watch2")
  // 防抖处理
  if (debounceTimer) clearTimeout(debounceTimer)

  // ✨ 过滤器变化时立即触发，不受 isDropdownOpen 影响
  debounceTimer = setTimeout(() => {
    if (!props.isDropdownOpen) {
      fetchData(combinations.value)
    } else {
      pendingQuery.value = true  // 等待下拉框关闭
    }
  }, QUERY_CONFIG.DEBOUNCE_DELAY)
}, { deep: true })

// 3. API 请求逻辑 (🔴 修改：加入后置拦截)
async function fetchData(pathStrings) {
  loading.value = true
  limitHint.value = ''
  results.value = []

  // ✅ 在 API 请求开始时禁用按钮
  updateDisabledState(true)

  try {
    const data = await api('/api/charlist', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        path_strings: pathStrings,
        combine_query: false,
        exclude_columns: props.excludeColumns  // ✨ 新增
      })
    })
    results.value = Array.isArray(data) ? data : []

    // 🔴 校验结果数量限制
    validateResultLimit(results.value.length)

  } catch (e) {
    console.error('Fetch error:', e)
    limitHint.value = '數據查詢失敗，請稍後重試'
    results.value = []
    // ✅ 请求失败时保持按钮禁用状态（因为没有有效的charlist数据）
    updateDisabledState(true)
  } finally {
    loading.value = false
  }
}

// ✅ 结果数量校验逻辑（使用 constants 配置）
function validateResultLimit(count) {
  const limits = ROLE_LIMITS[userStore.role] || ROLE_LIMITS.anonymous

  if (count > limits.MAX_RESULTS) {
    const hint = userStore.role === 'anonymous'
      ? `查詢結果過多(${count}>${limits.MAX_RESULTS})，登錄可查詢更多組合`
      : `查詢結果過多(${count}>${limits.MAX_RESULTS})，請減少組合`

    limitHint.value = hint
    updateDisabledState(true)
  } else {
    // 通过检查
    limitHint.value = ''
    updateDisabledState(false)
  }
}

// 辅助函数 (保持不变)
function formatTitle(queryStr) {
  if (!queryStr) return '';
  const matches = [...queryStr.matchAll(/\[(.*?)]\{(.*?)\}/g)];
  if (matches.length > 0) {
    const removeKeys = ['清濁', '入', '部位', '方式', '調'];
    return matches.map(m => {
      let key = m[2];
      if (removeKeys.includes(key)) key = '';
      return `${m[1]}${key}`;
    }).join('·');
  }
  return queryStr;
}

// ✅ 不再需要 onMounted 中的轮询
// userStore.role 会在应用启动时由 auth.js 自动初始化

defineExpose({ combinations })

</script>

<style scoped>
/* 最外层容器：统一的大玻璃卡片 */
.query-result-box {
  margin: 10px 0;
  padding: 8px; /* 统一内边距 */
  display: flex;
  flex-direction: column;
}



/* 头部样式调整 */
.info-header {
  margin-bottom: 10px;
  color: var(--text-medium);
  font-size: 14px;
  display: flex;
  justify-content: space-between; /* 两端对齐 */
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-light); /* 分割线 */
}

/* 全局展开按钮 */
.global-expand-btn {
  background: var(--color-blue-custom-light);
  color: var(--color-blue-custom);
  border: none;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 600;
  white-space:nowrap;
}
.global-expand-btn:hover {
  background: var(--color-blue-custom);
  color: white;
}

/* Loading 和 Empty 状态 */
.status-msg {
  text-align: center;
  color: var(--text-muted);
  font-size: 14px;
  width: 100%;
}
.spinner { display: inline-block; margin-right: 8px; animation: rotate 1s linear infinite; }

/* ✅ Grid 布局 (预览列表) */
.compact-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); /* 响应式 Grid */
  gap: 6px;
  width: 100%;
}

/* 单个紧凑项 (一行显示) */
.compact-item {
  display: flex;
  align-items: center;
  white-space: nowrap;
  overflow: hidden;
  font-size: 14px;
  padding: 8px;
  border-radius: 8px;
  background: var(--glass-lighter);
  transition: background 0.2s;
}
.compact-item:hover {
  background: var(--glass-medium-strong);
}

.compact-title {
  font-weight: bold;
  color: var(--text-dark);
  margin-right: 4px;
}
.compact-count {
  color: var(--color-blue-custom);
  font-size: 0.9em;
  margin-right: 8px;
  font-weight: 600;
}
.compact-preview {
  color: var(--text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1; /* 占据剩余空间 */
}

/* =========================================
   全屏弹窗样式
   ========================================= */

/* 弹窗内容卡片：更强的模糊效果 */
.modal-content.glass-card-high {
  width: 90%;
  max-width: 1000px;
  height: 85vh;
  background: var(--glass-heavy);
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  border-radius: 24px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--glass-border-strong);
}

.modal-header {
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-medium);
  background: var(--glass-medium);
}
.modal-header h2 { margin: 0; font-size: 18px; color: var(--text-dark); }

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 弹窗内的完整列表项 */
.full-item {
  border-bottom: 1px dashed var(--border-medium);
  padding-bottom: 16px;
}
.full-item:last-child { border-bottom: none; }

.full-item-header {
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.full-item-header .combo-name { font-size: 16px; font-weight: bold; color: var(--color-blue-custom); }
.full-item-header .count-badge {
  background: var(--color-blue-custom-bg); color: var(--color-blue-custom); padding: 2px 8px; border-radius: 10px; font-size: 12px;
}

.full-chars {
  font-size: 18px;
  line-height: 1.6;
  color: var(--text-dark);
  /* 每个字之间增加 1em 的间距，相当于一个空格的宽度 */
  letter-spacing: 0.5em;
  /* 可选：防止连体字或特殊渲染问题 */
  font-variant-ligatures: none;
}
.full-chars .char-tag {
  display: inline-block;
  margin-right: 6px;
}

/* 弹窗动画 */
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.3s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.modal-fade-enter-active .modal-content { transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); }
.modal-fade-enter-from .modal-content { transform: scale(0.95); }

@keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.limit-warning {
  padding: 12px;
  background: var(--color-error-bg); /* 浅红色背景 */
  border: 1px solid var(--color-error-border);
  color: var(--color-error);
  border-radius: 12px;
  font-size: 14px;
  text-align: center;
  font-weight: 600;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
<template>
  <div class="query-result-box glass-card">

    <div v-if="hasSelection" class="info-header">
      <div class="info-text">
        <span class="info-icon">ℹ️</span>
        <span>
          可能有<strong>{{ combinations.length }}</strong>種組合
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
      <div v-if="isModalOpen" class="fullscreen-modal" @click.self="isModalOpen = false">
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
              <div class="full-chars">
                <span v-for="(char, idx) in item['汉字']" :key="idx" class="char-tag">{{ char }}</span>
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

const props = defineProps({
  activeKeys: { type: Array, default: () => [] },
  valueMap: { type: Object, default: () => ({}) },
  isDropdownOpen: { type: Boolean, default: false },
  selectedCard: { type: String, default: '結果' }
})

const loading = ref(false)
const results = ref([])
const pendingQuery = ref(false)
let debounceTimer = null

// ✅ 新增：控制全屏弹窗开关
const isModalOpen = ref(false)

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

// 2. Watch 逻辑 (保持不变)
watch(combinations, (newVal, oldVal) => {
  if (JSON.stringify(newVal) === JSON.stringify(oldVal)) return
  if (debounceTimer) clearTimeout(debounceTimer)
  pendingQuery.value = false
  if (!hasSelection.value) {
    results.value = []
    return
  }
  debounceTimer = setTimeout(() => {
    if (!props.isDropdownOpen) {
      fetchData(newVal)
    } else {
      pendingQuery.value = true
    }
  }, 1000)
})

watch(() => props.isDropdownOpen, (isOpen) => {
  if (!isOpen && pendingQuery.value) {
    fetchData(combinations.value)
    pendingQuery.value = false
  }
})

// 3. API 请求逻辑 (保持不变)
async function fetchData(pathStrings) {
  loading.value = true
  results.value = []
  try {
    const data = await api('/api/charlist', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ path_strings: pathStrings, combine_query: false })
    })
    results.value = Array.isArray(data) ? data : []
  } catch (e) {
    console.error('Fetch error:', e)
    results.value = []
  } finally {
    loading.value = false
  }
}

// 辅助函数 (保持不变)
function formatTitle(queryStr) {
  if (!queryStr) return '';
  const matches = [...queryStr.matchAll(/\[(.*?)]\{(.*?)\}/g)];
  if (matches.length > 0) {
    const removeKeys = ['清濁', '入', '部位', '方式'];
    return matches.map(m => {
      let key = m[2];
      if (removeKeys.includes(key)) key = '';
      return `${m[1]}${key}`;
    }).join('·');
  }
  return queryStr;
}
</script>

<style scoped>
/* 最外层容器：统一的大玻璃卡片 */
.query-result-box {
  margin: 10px 0;
  min-height: 80px;
  padding: 8px; /* 统一内边距 */
  display: flex;
  flex-direction: column;
}

/* ✅ 通用 Glass Effect */
.glass-card {
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05), inset 0 0 0 1px rgba(255, 255, 255, 0.4);
  border-radius: 20px;
  transition: all 0.3s ease;
}

/* 头部样式调整 */
.info-header {
  margin-bottom: 16px;
  color: #555;
  font-size: 14px;
  display: flex;
  justify-content: space-between; /* 两端对齐 */
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(0,0,0,0.05); /* 分割线 */
}

.info-text {
  display: flex;
  align-items: center;
  gap: 6px;
}

.info-text strong {
  color: #02469e;
}

/* 全局展开按钮 */
.global-expand-btn {
  background: rgba(2, 70, 158, 0.1);
  color: #02469e;
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
  background: #02469e;
  color: white;
}

/* Loading 和 Empty 状态 */
.status-msg {
  text-align: center;
  color: #888;
  font-size: 14px;
  padding: 20px 0;
  width: 100%;
}
.spinner { display: inline-block; margin-right: 8px; animation: rotate 1s linear infinite; }

/* ✅ Grid 布局 (预览列表) */
.compact-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); /* 响应式 Grid */
  gap: 12px;
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
  background: rgba(255,255,255,0.4);
  transition: background 0.2s;
}
.compact-item:hover {
  background: rgba(255,255,255,0.7);
}

.compact-title {
  font-weight: bold;
  color: #333;
  margin-right: 4px;
}
.compact-count {
  color: #02469e;
  font-size: 0.9em;
  margin-right: 8px;
  font-weight: 600;
}
.compact-preview {
  color: #888;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1; /* 占据剩余空间 */
}

/* =========================================
   全屏弹窗样式
   ========================================= */
.fullscreen-modal {
  position: fixed;
  top: 0; left: 0; width: 100vw; height: 100vh;
  background: rgba(0, 0, 0, 0.2); /* 背景遮罩 */
  backdrop-filter: blur(5px);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 弹窗内容卡片：更强的模糊效果 */
.modal-content.glass-card-high {
  width: 90%;
  max-width: 1000px;
  height: 85vh;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  border-radius: 24px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.6);
}

.modal-header {
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(0,0,0,0.1);
  background: rgba(255,255,255,0.5);
}
.modal-header h2 { margin: 0; font-size: 18px; color: #333; }
.close-btn {
  background: none; border: none; font-size: 20px; cursor: pointer; color: #666;
  width: 32px; height: 32px; border-radius: 50%;
  transition: background 0.2s;
}
.close-btn:hover { background: rgba(0,0,0,0.05); }

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
  border-bottom: 1px dashed rgba(0,0,0,0.1);
  padding-bottom: 16px;
}
.full-item:last-child { border-bottom: none; }

.full-item-header {
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.full-item-header .combo-name { font-size: 16px; font-weight: bold; color: #02469e; }
.full-item-header .count-badge {
  background: #f0f7ff; color: #02469e; padding: 2px 8px; border-radius: 10px; font-size: 12px;
}

.full-chars {
  font-size: 18px;
  line-height: 1.6;
  color: #333;
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
</style>
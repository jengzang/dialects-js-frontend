<template>
  <div class="tree-node">
    <div class="node-content" :class="{ 'is-match': isMatch }" @click="toggle">
      <div class="node-label">
        <span class="icon">{{ hasChildren ? '📁' : '📍' }}</span>
        <span class="text" v-if="isMatch" v-html="highlightName"></span>
        <span class="text" v-else>{{ node.name }}</span>
      </div>

      <button
          v-if="hasChildren"
          class="expand-btn"
          :class="{ 'is-open': isOpen }"
          @click.stop="toggle"
      >
        <span class="plus-icon">＋</span>
      </button>
    </div>

    <transition
        name="expand"
        @enter="enter"
        @after-enter="afterEnter"
        @leave="leave"
    >
      <div v-if="isOpen && hasChildren" class="children-container">
        <TreeItem
            v-for="child in node.children"
            :key="child.id"
            :node="child"
            :search-query="searchQuery"
            :force-expand="forceExpand"
        />
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

// 定義組件名稱以便遞歸調用
defineOptions({
  name: 'TreeItem'
});

const props = defineProps({
  node: Object,
  searchQuery: String,
});

const isOpen = ref(false);

const hasChildren = computed(() => {
  return props.node.children && props.node.children.length > 0;
});

// ✅ 必須有這段 Watch 才能實現自動展開/折疊
watch(() => props.node, (newNode) => {
  // 如果數據裡要求展開，就展開；否則折疊
  if (newNode && newNode._autoExpand) {
    isOpen.value = true;
  } else {
    isOpen.value = false;
  }
}, { immediate: true, deep: true });

const toggle = () => {
  isOpen.value = !isOpen.value;
};

// 判斷是否高亮
const isMatch = computed(() => {
  if (!props.searchQuery) return false;
  return props.node.name.toLowerCase().includes(props.searchQuery.toLowerCase());
});

// 高亮 HTML 處理
const highlightName = computed(() => {
  if (!props.searchQuery) return props.node.name;
  const re = new RegExp(props.searchQuery, 'gi');
  return props.node.name.replace(re, match => `<span class="highlight">${match}</span>`);
});

// TreeItem.vue 的 <script setup> 底部

const enter = (el) => {
  // 1. 先把高度設為具體數值，觸發瀏覽器的過渡動畫
  el.style.height = el.scrollHeight + 'px';
  el.style.overflow = 'hidden'; // 動畫過程中隱藏溢出，保證平滑
};

const afterEnter = (el) => {
  // 🔥 關鍵修復：動畫結束後，將高度設為 'auto'
  // 這樣當內部的子菜單展開時，這個父容器也會自動變高
  el.style.height = 'auto';
  el.style.overflow = 'visible'; // 解除隱藏，防止陰影或子元素被切掉
};

const leave = (el) => {
  // 離開時，因為是從 auto 變為 0，瀏覽器無法直接對 auto 做動畫
  // 所以要先設回具體的像素高度
  el.style.height = el.scrollHeight + 'px';
  el.style.overflow = 'hidden';

  // 強制瀏覽器重繪 (Reflow)，否則上面那行可能被忽略
  // 讀取 offsetHeight 會強制重繪
  el.offsetHeight;

  // 然後設為 0
  el.style.height = '0';
};
</script>

<style scoped>
/* 這裡放 TreeItem 獨有的樣式 */
.tree-node {
  margin-bottom: 8px;
}
.node-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 10px;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.2s;
}
.node-content:hover {
  background: rgba(255, 255, 255, 0.4);
}
.node-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 500;
  color: #333;
}
.children-container {
  padding-left: 20px;
  border-left: 2px solid rgba(0, 122, 255, 0.1);
  margin-left: 14px;
  transition: height 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.expand-btn {
  background: transparent;
  border: none;
  color: #007AFF;
  font-size: 16px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
}
.expand-btn:hover {
  background: rgba(0, 122, 255, 0.1);
}
.expand-btn.is-open {
  transform: rotate(45deg);
}
/* 深度選擇器處理 v-html 內的樣式 */
:deep(.highlight) {
  background: rgba(255, 255, 0, 0.4);
  border-radius: 4px;
  padding: 0 2px;
  color: #000;
}
</style>
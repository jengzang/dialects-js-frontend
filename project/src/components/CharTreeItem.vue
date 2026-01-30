<template>
  <div class="tree-node">
    <div class="node-content" :class="{ 'is-match': isMatch }" @click="toggle">
      <div class="node-label">
        <span class="icon">{{ hasChildren ? '📁' : '✍️' }}</span>
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
        <!-- Leaf Node: Display Characters -->
        <div v-if="node.isLeaf" class="leaf-content">
          <!-- Without Annotations Mode -->
          <div v-if="!showAnnotations" class="chars-row">
            {{ node.chars.join(' ') }}
          </div>

          <!-- With Annotations Mode -->
          <div v-else class="char-annotation-list">
            <div
                v-for="(char, index) in node.chars"
                :key="index"
                class="char-annotation-item"
            >
              <span class="char">{{ char }}</span>
              <span class="annotation">{{ node.annotations[index] || '無注釋' }}</span>
            </div>
          </div>
        </div>

        <!-- Branch Node: Recursive Rendering -->
        <CharTreeItem
            v-else
            v-for="child in node.children"
            :key="child.id"
            :node="child"
            :search-query="searchQuery"
            :show-annotations="showAnnotations"
        />
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

defineOptions({
  name: 'CharTreeItem'
});

const props = defineProps({
  node: Object,
  searchQuery: String,
  showAnnotations: {
    type: Boolean,
    default: true
  }
});

const isOpen = ref(false);

const hasChildren = computed(() => {
  if (props.node.isLeaf) {
    return props.node.chars && props.node.chars.length > 0;
  }
  return props.node.children && props.node.children.length > 0;
});

// Auto-expand based on _autoExpand flag
watch(() => props.node, (newNode) => {
  if (newNode && newNode._autoExpand) {
    isOpen.value = true;
  } else {
    isOpen.value = false;
  }
}, { immediate: true, deep: true });

const toggle = () => {
  isOpen.value = !isOpen.value;
};

// Highlight matching nodes
const isMatch = computed(() => {
  if (!props.searchQuery) return false;

  // Check node name
  const nameMatch = props.node.name.toLowerCase().includes(props.searchQuery.toLowerCase());

  // For leaf nodes, also check if any character matches
  if (props.node.isLeaf && props.node.chars) {
    const charMatch = props.node.chars.some(char =>
      char.includes(props.searchQuery)
    );
    return nameMatch || charMatch;
  }

  return nameMatch;
});

// Highlight HTML processing
const highlightName = computed(() => {
  if (!props.searchQuery) return props.node.name;
  const re = new RegExp(props.searchQuery, 'gi');
  return props.node.name.replace(re, match => `<span class="highlight">${match}</span>`);
});

// Animation hooks
const enter = (el) => {
  el.style.height = el.scrollHeight + 'px';
  el.style.overflow = 'hidden';
};

const afterEnter = (el) => {
  el.style.height = 'auto';
  el.style.overflow = 'visible';
};

const leave = (el) => {
  el.style.height = el.scrollHeight + 'px';
  el.style.overflow = 'hidden';
  el.offsetHeight; // Force reflow
  el.style.height = '0';
};
</script>

<style scoped>
.tree-node {
  margin-bottom: 8px;
}

.node-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 10px;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.node-content:hover {
  background: rgba(255, 255, 255, 0.4);
}

.node-content.is-match {
  background: rgba(255, 215, 0, 0.15);
  border: 1px solid rgba(255, 215, 0, 0.3);
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
  margin-left: 20px;
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

/* Leaf Content Styles */
.leaf-content {
  margin-top: 8px;
}

/* Characters Row - No Annotations Mode */
.chars-row {
  padding: 12px 16px;
  background: rgba(0, 122, 255, 0.05);
  border-radius: 12px;
  font-size: 16px;
  line-height: 1.8;
  word-spacing: 8px;
  color: #1d1d1f;
  font-weight: 500;
  letter-spacing: 2px;
}

/* Character Annotation List - With Annotations Mode */
.char-annotation-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.char-annotation-item {
  display: grid;
  grid-template-columns: 40px 1fr;
  gap: 12px;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: background 0.2s;
}

.char-annotation-item:hover {
  background: rgba(255, 255, 255, 0.7);
}

.char-annotation-item .char {
  font-size: 18px;
  font-weight: 700;
  color: #007AFF;
  text-align: center;
  margin-top: 1px;
}

.char-annotation-item .annotation {
  font-size: 14px;
  line-height: 1.6;
  color: #3a3a3c;
}

/* Highlight style for search */
:deep(.highlight) {
  background: rgba(255, 255, 0, 0.4);
  border-radius: 4px;
  padding: 0 2px;
  color: #000;
}

/* Responsive Design */
@media (max-aspect-ratio: 1/1) {
  /* Reduce indentation on small screens */
  .children-container {
    padding-left: 10px;
    margin-left: 5px;
  }

  /* Break out of children-container padding for leaf content on small screens */
  .leaf-content {
    margin-left: -10px;
    margin-right: -10px;
  }

  .char-annotation-item {
    grid-template-columns: 32px 1fr;
    gap: 8px;
    padding: 8px 10px;
  }

  .char-annotation-item .char {
    font-size: 16px;
  }

  .char-annotation-item .annotation {
    font-size: 13px;
  }

  .chars-row {
    font-size: 15px;
    padding: 10px 12px;
  }
}
</style>

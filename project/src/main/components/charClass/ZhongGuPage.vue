<template>
  <div class="glass-container">
    <!-- Header Section -->
    <div class="header-section">
      <div class="title-row">
        <h2 style="margin: 0;">{{ $t('charClass.zhonggu.title') }}</h2>
        <button
            class="annotation-toggle"
            :class="{ 'active': showAnnotations }"
            @click="toggleAnnotations"
        >
          {{ showAnnotations ? $t('charClass.zhonggu.toggleAnnotations.show') : $t('charClass.zhonggu.toggleAnnotations.hide') }}
        </button>
      </div>

      <!-- Classification Tabs -->
      <div class="classification-tabs">
        <div
            v-for="(config, type) in CLASSIFICATION_TYPES"
            :key="type"
            class="classification-tab"
            :class="{
              'active': activeClassification === type,
              'loaded': loadedData[type] && activeClassification !== type
            }"
            @click="selectClassification(type)"
        >
          <div class="tab-name">{{ config.name }}</div>
          <div v-if="loadingStates[type]" class="tab-loading">
            <div class="loading-spinner tiny"></div>
          </div>
<!--          <div v-else-if="loadedData[type] && activeClassification !== type" class="tab-loaded-badge">-->
<!--            ✓-->
<!--          </div>-->
        </div>
      </div>

      <!-- Search Bar -->
      <div class="search-wrapper">
        <span class="search-icon">🔍</span>
        <input
            type="text"
            v-model="searchQuery"
            :placeholder="$t('charClass.zhonggu.search.placeholder')"
            class="glass-input"
            :disabled="!activeClassification || !loadedData[activeClassification]"
        />
      </div>
    </div>

    <!-- Content Area -->
    <div class="content-area custom-scrollbar">
      <!-- Default State: No Classification Selected -->
      <div v-if="!activeClassification" class="empty-state">
        <div class="empty-state-icon">📚</div>
        <div class="empty-state-text">{{ $t('charClass.zhonggu.states.selectClassification') }}</div>
        <div class="empty-state-hint">{{ $t('charClass.zhonggu.states.selectHint') }}</div>
      </div>

      <!-- Loading State -->
      <div v-else-if="loadingStates[activeClassification]" class="loading-state">
        <div class="loading-spinner"></div>
        <p>{{ $t('charClass.zhonggu.states.loading', { name: CLASSIFICATION_TYPES[activeClassification].name }) }}</p>
        <p class="loading-hint">{{ $t('charClass.zhonggu.states.loadingHint') }}</p>
      </div>

      <!-- Error State -->
      <div v-else-if="loadErrors[activeClassification]" class="error-state">
        <div class="error-icon">⚠️</div>
        <p class="error-message">{{ loadErrors[activeClassification] }}</p>
        <button @click="retryLoad(activeClassification)" class="retry-btn">
          {{ $t('charClass.zhonggu.actions.retry') }}
        </button>
      </div>

      <!-- Tree Container -->
      <div v-else-if="loadedData[activeClassification]" class="tree-container">
        <div v-if="getDisplayData.length === 0" class="empty-search-state">
          {{ $t('charClass.zhonggu.search.noResults') }}
        </div>
        <CharTreeItem
            v-for="item in getDisplayData"
            :key="item.id"
            :node="item"
            :search-query="searchQuery"
            :show-annotations="showAnnotations"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import {computed, ref} from 'vue';
import { useI18n } from 'vue-i18n';
import CharTreeItem from '@/main/components/TableAndTree/CharTreeItem.vue';
import {loadFullTree} from '@/api/sql/index.js';
import { getSqlTreeColumnIndexes } from '@/main/config/sqlTreeColumnMappings.js';

const { t } = useI18n();

const ZHONGGU_DB_KEY = 'chars';
const ZHONGGU_TABLE_NAME = 'characters';
const ZHONGGU_DATA_COLUMN_NAMES = ['漢字', '釋義'];

const createZhongguPayload = (levelColumnNames, dataColumnNames = ZHONGGU_DATA_COLUMN_NAMES) => ({
  db_key: ZHONGGU_DB_KEY,
  table_name: ZHONGGU_TABLE_NAME,
  level_columns: getSqlTreeColumnIndexes(ZHONGGU_DB_KEY, ZHONGGU_TABLE_NAME, levelColumnNames),
  data_columns: getSqlTreeColumnIndexes(ZHONGGU_DB_KEY, ZHONGGU_TABLE_NAME, dataColumnNames)
});

const ZHONGGU_SQL_TREE_CLASSIFICATIONS = Object.freeze({
  rhyme: Object.freeze({
    translationKey: 'charClass.zhonggu.classifications.rhyme',
    payload: createZhongguPayload(['攝', '韻', '呼', '等', '調'])
  }),
  initial: Object.freeze({
    translationKey: 'charClass.zhonggu.classifications.initial',
    payload: createZhongguPayload(['系', '組', '母', '攝'])
  }),
  voicing: Object.freeze({
    translationKey: 'charClass.zhonggu.classifications.voicing',
    payload: createZhongguPayload(['清濁', '母', '呼', '等'])
  })
});

// Classification Types Configuration
const CLASSIFICATION_TYPES = computed(() =>
  Object.fromEntries(
    Object.entries(ZHONGGU_SQL_TREE_CLASSIFICATIONS).map(([type, config]) => [
      type,
      {
        name: t(config.translationKey),
        payload: config.payload
      }
    ])
  )
);

// State Management
const activeClassification = ref(null);
const loadedData = ref({});
const loadingStates = ref({});
const loadErrors = ref({});
const showAnnotations = ref(true);
const searchQuery = ref('');

// ID Generator
let idCounter = 0;
const generateId = () => `node-${Date.now()}-${idCounter++}`;

/**
 * Toggle Annotations Display
 */
const toggleAnnotations = () => {
  showAnnotations.value = !showAnnotations.value;
};

/**
 * Select Classification
 */
const selectClassification = async (type) => {
  // If already active, collapse it
  if (activeClassification.value === type) {
    activeClassification.value = null;
    return;
  }

  // Set as active
  activeClassification.value = type;

  // If already loaded, just display
  if (loadedData.value[type]) {
    return;
  }

  // Load data
  await loadClassificationData(type);
};

/**
 * Load Classification Data
 */
const loadClassificationData = async (type) => {
  loadingStates.value[type] = true;
  loadErrors.value[type] = null;

  const config = CLASSIFICATION_TYPES.value[type];

  try {
    const result = await loadFullTree(config.payload)

    if (result && result.tree) {
      loadedData.value[type] = normalizeTreeData(result.tree);
    } else {
      throw new Error(t('charClass.zhonggu.states.dataFormatError'));
    }
  } catch (error) {
    console.error(`❌ ${t('charClass.zhonggu.states.loading', { name: config.name })} ${t('charClass.zhonggu.states.loadFailed')}:`, error);
    loadErrors.value[type] = error.message || t('charClass.zhonggu.states.loadFailed');
  } finally {
    loadingStates.value[type] = false;
  }
};

/**
 * Retry Loading
 */
const retryLoad = (type) => {
  loadClassificationData(type);
};

/**
 * Normalize Tree Data
 */
const normalizeTreeData = (rawTree) => {
  const charKeys = ['漢字', '汉字', 'chars', 'characters'];
  const annotationKeys = ['釋義', '释义', 'annotations', 'notes'];
  const isObject = (value) => typeof value === 'object' && value !== null && !Array.isArray(value);

  const pickArrayByKeys = (data, keys) => {
    for (const key of keys) {
      if (Array.isArray(data[key])) return data[key];
    }
    return null;
  };

  const processNode = (data, name) => {
    if (!isObject(data)) return null;

    const charsByKey = pickArrayByKeys(data, charKeys);
    const annotationsByKey = pickArrayByKeys(data, annotationKeys);

    if (charsByKey || annotationsByKey) {
      return {
        id: generateId(),
        name,
        chars: charsByKey || [],
        annotations: annotationsByKey || [],
        children: [],
        isLeaf: true
      };
    }

    // Backward-compatible fallback: only when all children are arrays.
    // This avoids misclassifying branch nodes that contain nested objects.
    const entries = Object.entries(data);
    const arrayEntries = entries.filter(([, value]) => Array.isArray(value));
    const objectEntries = entries.filter(([, value]) => isObject(value));

    if (arrayEntries.length > 0 && objectEntries.length === 0) {
      return {
        id: generateId(),
        name,
        chars: arrayEntries[0]?.[1] || [],
        annotations: arrayEntries[1]?.[1] || [],
        children: [],
        isLeaf: true
      };
    }

    const children = [];
    for (const [key, value] of objectEntries) {
      const childNode = processNode(value, key);
      if (childNode) {
        children.push(childNode);
      }
    }

    return {
      id: generateId(),
      name,
      children,
      isLeaf: false
    };
  };

  const rootChildren = [];
  for (const topKey in rawTree) {
    if (Object.prototype.hasOwnProperty.call(rawTree, topKey)) {
      const node = processNode(rawTree[topKey], topKey);
      if (node) {
        rootChildren.push(node);
      }
    }
  }

  return rootChildren;
};

/**
 * Filter Tree based on Search Query
 * Supports multi-character search: each character is searched independently
 */
const filterTree = (nodes, query) => {
  if (!nodes || nodes.length === 0) {
    return [];
  }

  // Split query into individual characters for independent matching
  const queryChars = query.split('');

  return nodes.reduce((acc, node) => {
    // Leaf node: search in character array
    if (node.isLeaf) {
      // Check if any character in the node matches any character in the query
      const hasMatch = node.chars.some(char =>
        queryChars.some(queryChar => char.includes(queryChar))
      );
      if (hasMatch) {
        acc.push({ ...node, _autoExpand: false });
      }
      return acc;
    }

    // Branch node: recursive search
    const selfMatch = node.name.toLowerCase().includes(query.toLowerCase());
    let filteredChildren = [];

    if (node.children && node.children.length > 0) {
      filteredChildren = filterTree(node.children, query);
    }

    const hasChildMatch = filteredChildren.length > 0;

    if (hasChildMatch) {
      acc.push({
        ...node,
        children: filteredChildren,
        _autoExpand: true
      });
    } else if (selfMatch) {
      acc.push({
        ...node,
        children: node.children,
        _autoExpand: false
      });
    }

    return acc;
  }, []);
};

/**
 * Get Display Data
 */
const getDisplayData = computed(() => {
  if (!activeClassification.value) return [];

  const data = loadedData.value[activeClassification.value];
  if (!data) return [];

  const query = searchQuery.value.trim();
  if (!query) return data;

  return filterTree(data, query);
});
</script>

<style scoped>
/* Glass Container */
.glass-container {
  width: 80dvw;
  max-width: 1200px;
  margin: 10px auto;
  border-radius: 30px;
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(25px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  color: #1d1d1f;
  min-height: 82dvh;
}

/* Header Section */
.header-section {
  padding: 24px 28px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  background: rgba(255, 255, 255, 0.3);
}

.title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

/* Annotation Toggle Button */
.annotation-toggle {
  padding: 8px 16px;
  border-radius: 20px;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.1));
  border: 2px solid rgba(0, 122, 255, 0.3);
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
  font-weight: 500;
  color: #007AFF;
  outline: none;
}

.annotation-toggle:hover {
  background: rgba(255, 255, 255, 0.5);
  transform: scale(1.05);
}

.annotation-toggle.active {
  background: linear-gradient(135deg, #007AFF 0%, #0051D5 100%);
  color: white;
  border-color: #007AFF;
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
}

/* Classification Tabs */
.classification-tabs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.classification-tab {
  padding: 12px 20px;
  border-radius: 15px;
  background: rgba(255, 255, 255, 0.4);
  border: 2px solid rgba(255, 255, 255, 0.6);
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  position: relative;
}

.classification-tab:hover {
  background: rgba(255, 255, 255, 0.6);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.classification-tab.active {
  background: linear-gradient(135deg, #007AFF 0%, #0051D5 100%);
  color: white;
  border-color: #007AFF;
  box-shadow: 0 4px 16px rgba(0, 122, 255, 0.4);
}

.classification-tab.loaded:not(.active) {
  border-color: rgba(52, 199, 89, 0.6);
  background: rgba(52, 199, 89, 0.1);
}

.tab-name {
  font-size: 15px;
  font-weight: 600;
  white-space: nowrap;
}

.tab-loading {
  display: flex;
  align-items: center;
}

.tab-loaded-badge {
  color: #34c759;
  font-size: 16px;
  font-weight: bold;
}

/* Search Wrapper */
.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 14px;
  font-size: 16px;
  opacity: 0.5;
}

.glass-input {
  width: 100%;
  padding: 12px 18px 12px 42px;
  border: none;
  border-radius: 15px;
  background: rgba(0, 0, 0, 0.05);
  outline: none;
  font-size: 15px;
  transition: all 0.3s;
}

.glass-input:focus {
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.3);
}

.glass-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Content Area */
.content-area {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 40px;
  text-align: center;
}

.empty-state-icon {
  font-size: 64px;
}

.empty-state-text {
  font-size: 18px;
  color: #6e6e73;
  font-weight: 500;
}

.empty-state-hint {
  font-size: 14px;
  color: #8e8e93;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 16px;
}

.loading-state p {
  font-size: 16px;
  color: #6e6e73;
  margin: 0;
}

.loading-hint {
  font-size: 14px;
  color: #8e8e93;
}

/* Loading Spinner */
.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(0, 122, 255, 0.1);
  border-top-color: #007AFF;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.loading-spinner.tiny {
  width: 16px;
  height: 16px;
  border-width: 2px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Error State */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 16px;
  padding: 40px;
}

.error-icon {
  font-size: 48px;
}

.error-message {
  color: #d32f2f;
  font-size: 16px;
  margin: 0;
}

.retry-btn {
  padding: 10px 24px;
  border: none;
  border-radius: 12px;
  background: rgba(142, 142, 147, 0.2);
  color: #1d1d1f;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.retry-btn:hover {
  background: rgba(142, 142, 147, 0.3);
}

/* Tree Container */
.tree-container {
  margin-top: 0;
}

/* Empty Search State */
.empty-search-state {
  text-align: center;
  padding: 40px 0;
  color: #8e8e93;
  font-size: 14px;
}

/* Custom Scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.15);
  border-radius: 10px;
  transition: background 0.2s;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.25);
}

/* Responsive Design */
@media (max-aspect-ratio: 1/1) {
  .glass-container {
    width: 95%;
    border-radius: 20px;
  }

  .classification-tabs {
    gap: 6px;
    margin-bottom: 5px;
  }
  .classification-tab{
    padding: 12px 16px;
  }
  .header-section {
    padding: 6px 16px;
  }

  .title-row {
    align-items: flex-start;
    gap: 12px;
  }

  .title-row h2 {
    font-size: 20px;
  }

  .annotation-toggle {
    padding: 6px 12px;
    font-size: 13px;
  }

  .content-area {
    padding: 6px 16px;
  }

  .empty-state-icon {
    font-size: 48px;
  }

  .empty-state-text {
    font-size: 16px;
  }
}
</style>

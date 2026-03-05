# TabsContainer 改造示例

## 完整示例：改造 AboutPage

### 第一步：导入组件

在 `<script setup>` 中导入 TabsContainer：

```vue
<script setup>
import TabsContainer from '@/components/common/TabsContainer.vue'
// ... 其他导入
</script>
```

### 第二步：替换模板结构

**原来的代码（第 2-12 行）：**
```vue
<div class="tabs-wrapper">
  <div class="tabs">
    <div
      v-for="tab in tabs"
      :key="tab.name"
      :class="['tab', { active: currentTab === tab.name }]"
      @click="router.replace({ query: { ...route.query, sub: tab.name } })"
    >
      {{ tab.label }}
    </div>
  </div>

  <!-- 内容区域 -->
  <div v-if="currentTab === 'intro'" class="thanks-container">
    <!-- ... -->
  </div>
</div>
```

**改造后的代码：**
```vue
<TabsContainer
  :tabs="tabs"
  default-tab="intro"
>
  <template #default="{ currentTab }">
    <!-- 内容区域 -->
    <div v-if="currentTab === 'intro'" class="thanks-container">
      <!-- ... -->
    </div>
  </template>
</TabsContainer>
```

### 第三步：简化 script 部分

**原来的代码（第 189-216 行）：**
```vue
<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { computed } from 'vue'

const router = useRouter()
const route = useRoute()

let currentTab = ref('intro')

const tabs = [
  { name: 'intro', label: '簡介' },
  { name: 'reflection', label: '感悟' },
  { name: 'suggestion', label: '建議' },
  { name: 'like', label: '喜歡作者' },
]

currentTab = computed(() => {
  return route.query.sub || 'intro'
})
</script>
```

**改造后的代码：**
```vue
<script setup>
import { ref } from 'vue'
import TabsContainer from '@/components/common/TabsContainer.vue'
// 不再需要 useRouter, useRoute, computed

const tabs = [
  { name: 'intro', label: '簡介' },
  { name: 'reflection', label: '感悟' },
  { name: 'suggestion', label: '建議' },
  { name: 'like', label: '喜歡作者' },
]

// 不再需要 currentTab 和 router/route 相关代码
// TabsContainer 会自动处理
</script>
```

### 完整的改造后代码

```vue
<template>
  <TabsContainer
    :tabs="tabs"
    default-tab="intro"
  >
    <template #default="{ currentTab }">
      <!-- 簡介页面 -->
      <div v-if="currentTab === 'intro'" class="thanks-container">
        <h2 class="tabs-title">ℹ️ 關於網站</h2>
        <p style="text-align: left;">「方音圖鑑」是一個專注於中古地位分析...</p>
        <!-- 其他内容 -->
      </div>

      <!-- 感悟页面 -->
      <div v-if="currentTab === 'reflection'" class="thanks-container">
        <h2 class="tabs-title" style="margin-top: 20px">🧑‍💻 開發感悟</h2>
        <!-- 其他内容 -->
      </div>

      <!-- 建議页面 -->
      <div v-if="currentTab === 'suggestion'" class="page2">
        <div class="suggestion-box">
          <h2 class="tabs-title">💬 我有建議</h2>
          <!-- 其他内容 -->
        </div>
      </div>

      <!-- 喜歡作者页面 -->
      <div v-if="currentTab === 'like'" class="cards-container">
        <h2 class="tabs-title like-author-title">
          ❤️ 喜歡作者
          <button class="follow-button" @click="followClicked">關注</button>
        </h2>
        <!-- 其他内容 -->
      </div>
    </template>
  </TabsContainer>

  <!-- 二维码弹窗（在 TabsContainer 外部） -->
  <div v-if="showQRCodes" class="qr-modal">
    <!-- ... -->
  </div>
</template>

<script setup>
import { ref } from 'vue'
import TabsContainer from '@/components/common/TabsContainer.vue'
import weixinQR from '@/assets/weixin.png'
import alipayQR from '@/assets/zfb.jpg'

const showQRCodes = ref(false)

const tabs = [
  { name: 'intro', label: '簡介' },
  { name: 'reflection', label: '感悟' },
  { name: 'suggestion', label: '建議' },
  { name: 'like', label: '喜歡作者' },
]

const projects = [
  {
    name: 'dialects-vue-frontend',
    url: 'https://github.com/jengzang/dialects-vue-frontend',
    description: '前端倉庫 - 使用vue框架和原生js開發'
  },
  // ...
]

function followClicked() {
  window.open('https://www.zhihu.com/people/da-shu-18-11', '_blank')
}
</script>

<style scoped>
/* 保留原有的样式，删除 .tabs-wrapper, .tabs, .tab 相关样式 */
/* 因为这些样式已经在 TabsContainer 组件中定义了 */

.thanks-container {
  /* ... */
}

.page2 {
  /* ... */
}

/* 其他样式保持不变 */
</style>
```

## 关键点说明

### 1. 作用域插槽的使用

```vue
<template #default="{ currentTab }">
  <!-- currentTab 是 TabsContainer 传递过来的当前选中的 tab -->
  <div v-if="currentTab === 'intro'">内容1</div>
  <div v-if="currentTab === 'reflection'">内容2</div>
</template>
```

`{ currentTab }` 是解构语法，等同于：
```vue
<template #default="slotProps">
  <div v-if="slotProps.currentTab === 'intro'">内容1</div>
</template>
```

### 2. Props 说明

```vue
<TabsContainer
  :tabs="tabs"           <!-- 必填：tab 配置数组 -->
  default-tab="intro"    <!-- 可选：默认选中的 tab -->
  :use-router="true"     <!-- 可选：是否使用路由模式，默认 true -->
>
```

### 3. 样式处理

- **删除**原来的 `.tabs-wrapper`, `.tabs`, `.tab` 样式（已在 TabsContainer 中定义）
- **保留**内容区域的样式（如 `.thanks-container`, `.page2` 等）
- 如果需要自定义 tab 样式，使用 `:deep()` 选择器：

```vue
<style scoped>
:deep(.tab) {
  border-radius: 8px;
}

:deep(.tab.active) {
  background: red;
}
</style>
```

## MapPage 改造示例（带额外内容）

MapPage 的 tab 右侧有特征选择器，需要使用 `tab-extra` 插槽：

```vue
<template>
  <TabsContainer
    :tabs="tabs"
    default-tab="map"
  >
    <!-- Tab 右侧额外内容 -->
    <template #tab-extra>
      <div v-if="currentTab === 'map' && mapStore.mode === 'feature'" class="feature-control-area">
        <SimpleSelectDropdown
          v-model="selectedFeature"
          :options="featureOptions"
          placeholder="請選擇特徵"
        />
        <HelpIcon :content="helpText" />
      </div>
    </template>

    <!-- Tab 内容 -->
    <template #default="{ currentTab }">
      <div class="tab-content">
        <MapLibre v-show="currentTab === 'map'" />
        <DivideTab v-show="currentTab === 'divide'" />
        <CustomTab v-show="currentTab === 'custom'" />
      </div>
    </template>
  </TabsContainer>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import TabsContainer from '@/components/common/TabsContainer.vue'

const route = useRoute()

// 需要保留 currentTab，因为 tab-extra 插槽中要用
const currentTab = computed(() => route.query.sub || 'map')

const tabs = [
  { name: 'map', label: '地圖' },
  { name: 'divide', label: '分區圖' },
  { name: 'custom', label: '自定義' }
]
</script>
```

## QueryPage 改造示例（复杂场景）

QueryPage 比较复杂，有多个共享组件，改造时注意：

```vue
<template>
  <TabsContainer
    :tabs="tabs"
    default-tab="tab2"
  >
    <template #default="{ currentTab }">
      <div class="tab-content">
        <!-- Tab1: 查字 -->
        <div v-show="currentTab === 'tab1'" class="page">
          <div class="page-content-stack">
            <div class="query-box">
              <label class="query-label" for="hanzi-input">請輸入待查漢字</label>
              <textarea
                id="hanzi-input"
                v-model="hanziInput"
                placeholder="可輸入一個或多個漢字"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Tab2: 查中古 -->
        <div v-show="currentTab === 'tab2'" class="page">
          <!-- ... -->
        </div>

        <!-- Tab3: 查音位 -->
        <div v-show="currentTab === 'tab3'" class="page">
          <!-- ... -->
        </div>

        <!-- Tab4: 查調 -->
        <div v-show="currentTab === 'tab4'" class="page">
          <!-- ... -->
        </div>

        <!-- 共享组件（所有 tab 都显示） -->
        <LocationAndRegionInput
          ref="locationRef"
          v-model="locationModel"
        />

        <div class="run-container">
          <button class="run-btn" @click="runAction">
            🚀 單擊運行
          </button>
        </div>
      </div>
    </template>
  </TabsContainer>
</template>

<script setup>
import { ref } from 'vue'
import TabsContainer from '@/components/common/TabsContainer.vue'
import LocationAndRegionInput from '@/components/query/LocationAndRegionInput.vue'

const tabs = [
  { name: 'tab1', label: '查字' },
  { name: 'tab2', label: '查中古' },
  { name: 'tab3', label: '查音位' },
  { name: 'tab4', label: '查調' }
]

const hanziInput = ref('')
const locationRef = ref(null)
const locationModel = ref({
  locations: [],
  regions: [],
  regionUsing: 'map'
})

const runAction = () => {
  // 运行逻辑
}
</script>
```

## 常见问题

### Q1: 为什么有些地方用 v-if，有些用 v-show？

- **v-if**：适合不需要保持状态的场景（如 AboutPage 的纯展示内容）
- **v-show**：适合需要保持状态的场景（如 QueryPage 的表单输入）

### Q2: 改造后路由还能正常工作吗？

可以。TabsContainer 默认使用路由模式（`use-router="true"`），会自动同步到 `route.query.sub`。

### Q3: 如何访问 currentTab？

两种方式：
1. 在插槽中使用：`<template #default="{ currentTab }">`
2. 在 script 中使用：`const currentTab = computed(() => route.query.sub || 'default')`

### Q4: 原来的样式会丢失吗？

不会。只需要删除 `.tabs`, `.tab` 相关样式（已在 TabsContainer 中定义），保留内容区域的样式即可。

## 总结

改造步骤：
1. ✅ 导入 `TabsContainer` 组件
2. ✅ 用 `<TabsContainer>` 替换原来的 `.tabs-wrapper` 和 `.tabs`
3. ✅ 使用作用域插槽包裹内容区域
4. ✅ 删除 script 中的 `router`, `route`, `currentTab` 相关代码
5. ✅ 删除 style 中的 `.tabs`, `.tab` 样式
6. ✅ 测试功能是否正常

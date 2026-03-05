# TabsContainer 组件使用说明

## 组件简介

`TabsContainer` 是一个通用的 Tab 切换组件，支持路由同步和普通模式，可以在多个页面中复用。

## Props

| 属性 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `tabs` | `Array` | 是 | - | Tab 配置数组，格式：`[{ name: 'tab1', label: '标签1' }]` |
| `modelValue` | `String` | 否 | `''` | 当前选中的 tab (支持 v-model) |
| `useRouter` | `Boolean` | 否 | `true` | 是否使用路由模式（同步到 `route.query.sub`） |
| `defaultTab` | `String` | 否 | `''` | 默认选中的 tab |

## Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| `update:modelValue` | `tabName: String` | tab 切换时触发，用于 v-model |
| `tab-change` | `tabName: String` | tab 切换时触发 |

## Slots

| 插槽名 | 说明 |
|--------|------|
| `default` | 默认插槽，接收 `current-tab` 作为作用域参数 |
| `tab-extra` | Tab 栏右侧额外内容插槽 |

## 使用示例

### 1. AboutPage 改造示例

**改造前：**
```vue
<template>
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

    <div v-if="currentTab === 'intro'" class="thanks-container">
      <!-- 内容 -->
    </div>
    <div v-if="currentTab === 'reflection'" class="thanks-container">
      <!-- 内容 -->
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const currentTab = computed(() => {
  return route.query.sub || 'intro'
})

const tabs = [
  { name: 'intro', label: '簡介' },
  { name: 'reflection', label: '感悟' },
  { name: 'suggestion', label: '建議' },
  { name: 'like', label: '喜歡作者' },
]
</script>
```

**改造后：**
```vue
<template>
  <TabsContainer
    :tabs="tabs"
    default-tab="intro"
  >
    <template #default="{ currentTab }">
      <div v-if="currentTab === 'intro'" class="thanks-container">
        <!-- 内容 -->
      </div>
      <div v-if="currentTab === 'reflection'" class="thanks-container">
        <!-- 内容 -->
      </div>
      <div v-if="currentTab === 'suggestion'" class="page2">
        <!-- 内容 -->
      </div>
      <div v-if="currentTab === 'like'" class="cards-container">
        <!-- 内容 -->
      </div>
    </template>
  </TabsContainer>
</template>

<script setup>
import TabsContainer from '@/components/common/TabsContainer.vue'

const tabs = [
  { name: 'intro', label: '簡介' },
  { name: 'reflection', label: '感悟' },
  { name: 'suggestion', label: '建議' },
  { name: 'like', label: '喜歡作者' },
]
</script>
```

### 2. MapPage 改造示例

**改造后：**
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
      </div>
    </template>

    <!-- Tab 内容 -->
    <template #default="{ currentTab }">
      <div class="tab-content">
        <MapLibre
          v-show="currentTab === 'map'"
          :active-feature="selectedFeature"
        />
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
import MapLibre from '@/components/map/MapLibre.vue'
import DivideTab from '@/components/map/DivideTab.vue'
import CustomTab from '@/components/map/CustomTab.vue'

const route = useRoute()

const tabs = [
  { name: 'map', label: '地圖' },
  { name: 'divide', label: '分區圖' },
  { name: 'custom', label: '自定義' }
]

const currentTab = computed(() => route.query.sub || 'map')
const selectedFeature = ref('')
</script>
```

### 3. QueryPage 改造示例

**改造后：**
```vue
<template>
  <TabsContainer
    :tabs="tabs"
    default-tab="tab2"
  >
    <template #default="{ currentTab }">
      <div class="tab-content">
        <div v-show="currentTab === 'tab1'" class="page">
          <!-- Tab1 内容 -->
        </div>

        <div v-show="currentTab === 'tab2'" class="page">
          <!-- Tab2 内容 -->
        </div>

        <div v-show="currentTab === 'tab3'" class="page">
          <!-- Tab3 内容 -->
        </div>

        <div v-show="currentTab === 'tab4'" class="page">
          <!-- Tab4 内容 -->
        </div>

        <!-- 共享组件 -->
        <LocationAndRegionInput ref="locationRef" />
        <button class="run-btn" @click="runAction">运行</button>
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

const locationRef = ref(null)

const runAction = () => {
  // 运行逻辑
}
</script>
```

### 4. 非路由模式示例

如果你不想同步到路由，可以使用普通模式：

```vue
<template>
  <TabsContainer
    v-model="activeTab"
    :tabs="tabs"
    :use-router="false"
    default-tab="tab1"
    @tab-change="handleTabChange"
  >
    <template #default="{ currentTab }">
      <div v-if="currentTab === 'tab1'">内容1</div>
      <div v-if="currentTab === 'tab2'">内容2</div>
    </template>
  </TabsContainer>
</template>

<script setup>
import { ref } from 'vue'
import TabsContainer from '@/components/common/TabsContainer.vue'

const activeTab = ref('tab1')

const tabs = [
  { name: 'tab1', label: '标签1' },
  { name: 'tab2', label: '标签2' }
]

const handleTabChange = (tabName) => {
  console.log('切换到:', tabName)
}
</script>
```

## 样式定制

组件使用了 scoped 样式，如果需要自定义样式，可以：

1. 在父组件中使用 `:deep()` 选择器
2. 或者直接修改 `TabsContainer.vue` 中的样式变量

```vue
<style scoped>
:deep(.tabs) {
  gap: 20px;
}

:deep(.tab) {
  border-radius: 8px;
}

:deep(.tab.active) {
  background: linear-gradient(135deg, #ff6b6b, #ee5a6f);
}
</style>
```

## 注意事项

1. `tabs` 数组中的每个对象必须包含 `name` 和 `label` 属性
2. 使用路由模式时，tab 状态会同步到 `route.query.sub`
3. 使用 `v-show` 而不是 `v-if` 可以保持组件状态（适用于有表单输入的场景）
4. 作用域插槽提供了 `currentTab` 参数，方便在模板中判断当前 tab

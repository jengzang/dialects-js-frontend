# 阶段二：核心模块迁移进度

## 已完成

### 1. 配置文件迁移

#### menuConfig.js ✅
- 创建了 `useMenuConfig()` 响应式函数
- 保留了静态 `menuConfig` 导出用于向后兼容
- 所有菜单项已使用 i18n key

#### TabsConfig.js ⏸️ (部分完成)
- 文件较大，需要分步迁移
- 建议：先更新使用它的组件，再完全替换

## 下一步：更新使用配置的组件

### 需要更新的组件

1. **NavBar.vue** - 使用 MenuTabsConfig
   - 导入：`import { MenuTabsConfig } from '@/config/TabsConfig.js'`
   - 需要改为：`const tabs = useMenuTabsConfig()`

2. **SimpleSidebar.vue** - 使用 menuConfig
   - 导入：`import { menuConfig } from '@/config/menuConfig.js'`
   - 需要改为：`const menuConfig = useMenuConfig()`

3. **ExploreBar.vue** - 使用 menuConfig 和 ExploreTabsConfig
   - 需要同时更新两个配置的使用

## 迁移策略

由于 TabsConfig.js 文件很大且结构复杂，采用以下策略：

### 方案 A：渐进式迁移（推荐）
1. 保持原 TabsConfig.js 不变
2. 在组件中直接使用 i18n 翻译 label
3. 示例：
```vue
<script setup>
import { MenuTabsConfig } from '@/config/TabsConfig.js'
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'

const { t } = useI18n()

// 动态翻译 tabs
const tabs = computed(() =>
  MenuTabsConfig.map(tab => ({
    ...tab,
    label: t(`navigation.tabs.${tab.tab}`)
  }))
)
</script>
```

### 方案 B：完全重写（耗时）
1. 完全重写 TabsConfig.js
2. 创建 useMenuTabsConfig 和 useExploreTabsConfig
3. 更新所有使用的组件

## 建议

采用**方案 A**，因为：
- 改动最小
- 风险最低
- 可以快速看到效果
- 不影响现有功能

## 下一步行动

1. 更新 NavBar.vue 使用动态翻译
2. 更新 SimpleSidebar.vue 使用 useMenuConfig()
3. 更新 ExploreBar.vue
4. 测试所有导航功能
5. 确认语言切换正常工作

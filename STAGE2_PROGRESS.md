# 阶段二核心模块迁移 - 进度报告

## 已完成的工作

### 1. 配置文件迁移 ✅

#### menuConfig.js
- ✅ 创建了 `useMenuConfig()` 响应式函数
- ✅ 保留了静态 `menuConfig` 导出用于向后兼容
- ✅ 所有菜单项已使用 i18n key（如 `t('navigation.menu.home')`）
- ✅ 备份文件：`menuConfig.backup.js`

#### TabsConfig.js
- ✅ 保留原文件不变（向后兼容）
- ✅ 备份文件：`TabsConfig.backup.js`
- ✅ 采用渐进式迁移策略：在组件中动态翻译

### 2. 组件迁移 ✅

#### NavBar.vue
- ✅ 导入 `useI18n`
- ✅ 在 `visibleTabs` computed 中动态翻译 label
- ✅ 更新"登录"文本使用 `t('auth.login.title')`
- ✅ 构建测试通过

**修改内容：**
```javascript
// 添加 i18n 导入
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

// 动态翻译 tabs
const visibleTabs = computed(() => {
  return MenuTabsConfig.filter(tab => {
    if (typeof tab.visibleWhen === 'function') {
      return tab.visibleWhen()
    }
    return true
  }).map(tab => ({
    ...tab,
    label: t(`navigation.tabs.${tab.tab}`)
  }))
})

// 翻译登录文本
{{ userStore.username || t('auth.login.title') }}
```

## 测试结果

### 构建测试 ✅
- 运行 `npm run build` 成功
- 无编译错误
- 所有模块正常打包

### 功能测试（待验证）
- [ ] 导航栏标签是否正确显示翻译
- [ ] 语言切换后导航栏是否更新
- [ ] 登录按钮文本是否正确翻译

## 下一步工作

### 1. 继续迁移其他组件

#### SimpleSidebar.vue
- 使用 `useMenuConfig()` 替代静态 `menuConfig`
- 动态翻译菜单项

#### ExploreBar.vue
- 使用 `useMenuConfig()` 和动态翻译
- 更新 ExploreTabsConfig 的使用

### 2. 增强消息系统

#### message.js
- 支持 i18n key 自动翻译
- 检测消息是否为 i18n key（以 'messages.' 开头）
- 自动调用 t() 翻译

### 3. 迁移其他常用组件
- Toast 组件
- Confirm 组件
- 表单验证消息

## 迁移策略总结

采用**渐进式迁移**策略：
1. ✅ 保持原配置文件不变（向后兼容）
2. ✅ 在组件中使用 `map()` 动态翻译 label
3. ✅ 逐个组件迁移，降低风险
4. ✅ 每次迁移后立即测试构建

**优点：**
- 改动最小
- 风险最低
- 可以快速看到效果
- 不影响现有功能
- 易于回滚

## 文件清单

### 已修改的文件
1. `src/config/menuConfig.js` - 添加 useMenuConfig()
2. `src/components/bar/NavBar.vue` - 添加 i18n 支持

### 备份文件
1. `src/config/menuConfig.backup.js`
2. `src/config/TabsConfig.backup.js`

### 新增文件
1. `MIGRATION_PROGRESS.md` - 迁移进度文档
2. 本文件 - 进度报告

## 建议

1. **立即测试**：在浏览器中测试导航栏的语言切换功能
2. **继续迁移**：如果测试通过，继续迁移 SimpleSidebar 和 ExploreBar
3. **增强消息系统**：让 Toast 和 Confirm 支持 i18n
4. **逐步扩展**：按优先级迁移其他组件

## 注意事项

- 所有翻译 key 必须在语言文件中定义
- 使用 `npm run i18n:extract` 检测缺失的翻译
- 保持向后兼容，不要删除静态导出
- 每次修改后运行构建测试

# Vue 3 国际化 (i18n) 使用指南

## 概述

本项目已集成 Vue I18n v11，支持繁体中文（默认）、简体中文和英文三种语言。

## 目录结构

```
src/i18n/
├── index.js                    # i18n 配置入口
├── localeDetector.js           # 语言检测逻辑
└── locales/
    ├── zh-Hant/                # 繁体中文
    │   ├── index.js
    │   ├── common.json
    │   ├── navigation.json
    │   ├── messages.json
    │   ├── query.json
    │   └── auth.json
    ├── zh-CN/                  # 简体中文
    │   └── (同上结构)
    └── en/                     # 英文
        └── (同上结构)
```

## 在组件中使用

### 在 Template 中使用

```vue
<template>
  <div>
    <!-- 简单文本 -->
    <h1>{{ $t('common.button.confirm') }}</h1>

    <!-- 带参数 -->
    <p>{{ $t('messages.welcome', { name: username }) }}</p>

    <!-- 使用嵌套路径 -->
    <button>{{ $t('navigation.menu.home') }}</button>
  </div>
</template>
```

### 在 Script 中使用

```vue
<script setup>
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()

// 使用翻译
const message = t('common.button.submit')

// 获取当前语言
console.log(locale.value) // 'zh-Hant'

// 切换语言（推荐使用 setLocale 函数）
import { setLocale } from '@/i18n'
setLocale('zh-CN')
</script>
```

## 切换语言

### 方法 1：使用 SettingPage

用户可以在设置页面（`/menu?tab=setting`）手动切换语言。

### 方法 2：编程方式切换

```javascript
import { setLocale } from '@/i18n'

// 切换到简体中文
setLocale('zh-CN')

// 切换到英文
setLocale('en')

// 切换到繁体中文
setLocale('zh-Hant')
```

## 添加新的翻译

### 1. 在语言文件中添加翻译

编辑 `src/i18n/locales/zh-Hant/common.json`：

```json
{
  "button": {
    "confirm": "確定",
    "newButton": "新按鈕"  // 添加新翻译
  }
}
```

### 2. 在其他语言文件中添加对应翻译

编辑 `src/i18n/locales/zh-CN/common.json` 和 `src/i18n/locales/en/common.json`。

### 3. 在组件中使用

```vue
<template>
  <button>{{ $t('common.button.newButton') }}</button>
</template>
```

## 检测缺失的翻译

运行以下命令检测缺失和未使用的翻译 key：

```bash
npm run i18n:extract
```

## 语言检测逻辑

1. 优先读取 localStorage 中保存的语言设置
2. 检测浏览器语言（navigator.language）
   - `zh-TW/zh-HK/zh-Hant` → 繁体中文
   - `zh-CN/zh-Hans/zh` → 简体中文
   - `en` → 英文
3. 默认回退到繁体中文

## 命名规范

采用模块化命名，避免冲突：

- `common.button.confirm` - 通用按钮
- `navigation.menu.home` - 导航菜单
- `query.tab1.title` - 查询模块标签页标题
- `messages.success.saved` - 成功消息

## 注意事项

1. **与 opencc-js 的关系**：
   - `opencc-js`：用于数据内容的繁简转换（如用户输入的汉字）
   - `vue-i18n`：用于界面文本的多语言切换
   - 两者互不冲突，各司其职

2. **动态内容处理**：
   对于从 API 获取的动态内容，不使用 i18n，而是使用 opencc-js 进行繁简转换。

3. **SEO 考虑**：
   语言切换时会自动更新 HTML lang 属性。

## 示例

查看 `src/views/menu/SettingPage.vue` 了解完整的语言切换实现示例。

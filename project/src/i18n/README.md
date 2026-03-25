# i18n 說明

## 概覽

項目目前使用：

- `vue-i18n`
- `opencc-js`

其中 `vue-i18n` 負責語言資源管理與切換，`opencc-js` 主要用於繁簡轉換相關能力。

## 入口文件

- `src/i18n/index.js`
- `src/i18n/localeDetector.js`

`index.js` 負責：

- 創建 i18n 實例
- 載入語言包
- 設置 `fallbackLocale`
- 暴露 `setLocale()` 和 `getLocale()`
- 同步更新 `<html lang>`

`localeDetector.js` 負責：

- 支持語言定義
- 從 `localStorage` 讀取已保存語言
- 根據瀏覽器語言自動選擇初始語言

## 當前支持語言

- `zh-Hant`
- `zh-CN`
- `en`

默認語言：

- `zh-Hant`

## 語言選擇順序

當前順序是：

1. `localStorage`
2. 瀏覽器語言
3. 默認語言 `zh-Hant`

## 文件結構

```text
src/i18n/
  index.js
  localeDetector.js
  locales/
    zh-Hant/
    zh-CN/
    en/
```

每種語言下目前按模塊拆分，例如：

- `about.json`
- `auth.json`
- `charClass.json`
- `common.json`
- `compare.json`
- `home.json`
- `map.json`
- `messages.json`
- `navigation.json`
- `phonology.json`
- `praat.json`
- `privacy.json`
- `query.json`
- `result.json`
- `source.json`
- `tableTree.json`
- `tools.json`
- `user.json`
- `villages.json`
- `words.json`

每個語言目錄下還有 `index.js` 用於聚合這些模塊。

## 使用方式

模板中：

```vue
<template>
  <button>{{ $t('common.button.confirm') }}</button>
</template>
```

`script setup` 中：

```vue
<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const label = t('navigation.menu.home')
</script>
```

切換語言：

```js
import { setLocale } from '@/i18n'

setLocale('zh-Hant')
setLocale('zh-CN')
setLocale('en')
```

## 新增翻譯的基本流程

1. 在 `zh-Hant` 新增或更新 key
2. 同步更新 `zh-CN` 和 `en`
3. 在對應組件中使用 `$t(...)` 或 `t(...)`
4. 視需要執行：

```bash
npm run i18n:extract
```

## 維護要求

- key 命名應穩定，不要頻繁改動已對外使用的 key
- 三種語言應盡量同步維護
- 若涉及導航、用戶文案、VillagesML 入口文案，更新後應做手工檢查

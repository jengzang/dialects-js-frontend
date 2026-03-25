# VillagesML 功能概覽

## 產品定位

VillagesML 是項目中的獨立子應用，用於自然村相關的檢索、分析、可視化與機器學習工作流。

它同時保留兩種入口：

- `/explore?page=VillagesML`
  - 主站中的 dashboard / gateway
- `/villagesML?...`
  - 真正的 VillagesML 工作台

## 當前源碼結構

```text
project/src/VillagesML/
  app/
    main.js
    App.vue
    router.js
    Entry.vue
    ExternalRouteBridge.vue
  components/
    FilterableSelect.vue
    RegionDisplay.vue
  config/
    villagesML.js
    subsetFilters.js
    semanticLexicon.js
  dashboard/
    Dashboard.vue
  store/
    villagesMLStore.js
  workspace/
    VillagesMLWorkspace.vue
    modules/
      character/
      ml/
      pattern/
      regional/
      search/
      semantic/
      spatial/
      system/
      village/
```

## 結構分工

### app

承載 VillagesML 子應用的運行時入口、App 和 router。

### dashboard

承載主站中的 VillagesML dashboard。
它不等於整個工作台，而是主站中的入口頁。

### workspace

承載真正的 VillagesML 工作台，以及模塊切換與工作流上下文。

### components

放目前只被 VillagesML 使用的專屬組件。

### config / store

放 VillagesML 專屬配置與狀態。

## 當前模塊

依據 `project/src/VillagesML/config/villagesML.js`，當前主要模塊包括：

- `search`
- `character`
- `semantic`
- `spatial`
- `pattern`
- `regional`
- `compute`

`system` 目前保留在源碼中，但配置中未作為主要導航模塊打開。

## 主要 subtab

### character

- `frequency`
- `embeddings`
- `network`
- `significance`

### semantic

- `categories`
- `composition`
- `ngrams`
- `indices`
- `network`
- `subcategories`

### spatial

- `hotspots`
- `clusters`
- `visualization`
- `integration`

### pattern

- `frequency`
- `structural`
- `tendency`
- `ngram-explore`
- `ngram-stats`

### regional

- `aggregates`
- `vectors`
- `tendency`
- `similarity`

### compute

- `clustering`
- `char-tendency`
- `sampled-villages`
- `spatial-aware`
- `hierarchical`
- `features`
- `subset`

## 目前的邊界

VillagesML 現在已經具備獨立運行時，但仍共享以下基礎層：

- `src/api/`
- `src/components/bar`
- `src/components/common` 的共享部分
- `src/components/ToastAndHelp`
- `src/i18n/`
- `src/layouts/`
- `src/utils/`

這代表它已經是獨立子應用，但還不是完全可單獨遷移的封裝包。

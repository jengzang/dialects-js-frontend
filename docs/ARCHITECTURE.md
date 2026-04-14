# 架構文檔

> 方音圖鑑平台當前前端架構、入口模型與共享層說明

**文檔語言：** [English](./ARCHITECTURE.en.md) | 中文

---

## 目錄

1. [系統概覽](#系統概覽)
2. [當前代碼版圖](#當前代碼版圖)
3. [多入口構建模型](#多入口構建模型)
4. [主站與 VillagesML 子應用](#主站與-villagesml-子應用)
5. [路由與兼容層](#路由與兼容層)
6. [組件與模組分層](#組件與模組分層)
7. [狀態管理](#狀態管理)
8. [API 架構](#api-架構)
9. [Layout 與樣式層](#layout-與樣式層)
10. [構建與運行時注意事項](#構建與運行時注意事項)

---

## 系統概覽

截至 2026-04，前端架構有三個需要優先建立的正確認知：

1. 前端工程實際位於 `project/`，倉庫根目錄主要承載文檔與協作資料。
2. 當前不是單一 Vue App，而是「`main` 主站 + `VillagesML` 子應用 + 共用基礎層」的混合結構。
3. path 路由是當前主要頁面身份；`/menu?tab=...`、`/explore?page=...` 這類 query 形式主要用於 legacy 兼容與入口轉譯。

### 架構原則

- **多入口構建**：不同入口頁拆分成獨立 HTML input，降低耦合並改善代碼分包。
- **主站 / 子應用分層**：主站負責公共導航與大多數工具頁；VillagesML 擁有自己的入口、router 與工作區。
- **共享基礎設施層**：`api`、`i18n`、`layouts`、`styles`、`components`、`utils` 由多個入口共同復用。
- **路由兼容層**：保留舊 query 入口，但通過 entry page 與 route map 轉譯到新 path 結構。
- **輕量響應式狀態**：仍以 Vue 原生 `ref` / `reactive` 為主，未引入 Vuex / Pinia。

### 技術棧

**前端：**
- Vue 3.5
- Vite 7
- Vue Router 4

**可視化：**
- MapLibre GL
- ECharts
- wavesurfer.js

**共享能力：**
- `src/api/auth`：認證、會話恢復、token 管理
- `src/i18n`：簡中 / 繁中 / 英語國際化
- `src/styles`：全局、主站、VillagesML 三層樣式入口

---

## 當前代碼版圖

當前最重要的目錄關係如下：

```text
project/
├── index.html
├── auth/index.html
├── menu/index.html
├── intro/index.html
├── explore/index.html
├── villagesML/index.html
├── vite.config.js
└── src/
    ├── main/                  # 主站應用
    ├── VillagesML/            # VillagesML 子應用
    ├── api/                   # 共用 API 層
    ├── components/            # 共用 UI 組件
    ├── i18n/                  # 國際化
    ├── layouts/               # 共用布局殼
    ├── styles/                # 共用 / 主站 / VillagesML 樣式入口
    └── utils/                 # 工具函數與消息系統
```

### 主站關鍵目錄

```text
project/src/main/
├── main.js
├── App.vue
├── router.js
├── router/
│   ├── menuRoutes.js
│   ├── exploreRoutes.js
│   └── legacyRouteMap.js
├── views/
│   ├── entry/
│   ├── menu/
│   ├── explore/
│   └── intro/
├── components/
└── store/
```

### VillagesML 關鍵目錄

```text
project/src/VillagesML/
├── app/
│   ├── main.js
│   ├── App.vue
│   ├── router.js
│   ├── Entry.vue
│   └── ExternalRouteBridge.vue
├── dashboard/
├── workspace/
│   ├── VillagesMLWorkspace.vue
│   └── modules/
├── store/
├── config/
└── components/
```

---

## 多入口構建模型

### 當前 Vite 入口配置

`project/vite.config.js` 目前定義了 6 個 HTML build input：

```javascript
build: {
  rollupOptions: {
    input: {
      main: path.resolve(__dirname, 'index.html'),
      auth: path.resolve(__dirname, 'auth/index.html'),
      menu: path.resolve(__dirname, 'menu/index.html'),
      intro: path.resolve(__dirname, 'intro/index.html'),
      explore: path.resolve(__dirname, 'explore/index.html'),
      villagesML: path.resolve(__dirname, 'villagesML/index.html'),
    }
  }
}
```

### 入口語義

| 路徑 | HTML 入口 | 角色 |
| --- | --- | --- |
| `/` | `project/index.html` | 主站根入口 |
| `/auth` | `project/auth/index.html` | 認證相關頁面 |
| `/menu` | `project/menu/index.html` | 主站核心頁面入口 |
| `/intro` | `project/intro/index.html` | 介紹 / 說明類頁面 |
| `/explore` | `project/explore/index.html` | Explore 工具與入口頁 |
| `/villagesML` | `project/villagesML/index.html` | VillagesML 子應用入口 |

### 開發期 MPA 重寫

`vite.config.js` 中的 `dev-mpa-rewrite` 會在開發模式下把對 `/menu/*`、`/explore/*`、`/villagesML/*` 等 HTML 請求重寫到對應的 `index.html`。
這一層的作用是讓多入口在本地開發時仍能按子路徑直接訪問。

### 分包策略

構建輸出中還會透過 `manualChunks` 對以下大模塊做顯式拆分：

- `i18n`
- `echarts`
- `maplibre`
- `xlsx`
- `wavesurfer`
- `logs`
- `vue-vendor`
- 其他第三方 `vendor`

這表示當前前端的優化重點之一仍然是：讓地圖、圖表、國際化與工具頁資產在入口之間盡量按需加載。

---

## 主站與 VillagesML 子應用

### 主站應用

主站由以下文件啟動：

- `project/src/main/main.js`
- `project/src/main/App.vue`
- `project/src/main/router.js`

啟動時主站會：

- 載入 `main-entry.scss`
- 掛載共享消息系統
- 初始化 i18n
- 執行 `bootstrapAuthSession()`
- 根據當前 path 選擇 `MenuLayout`、`ExploreLayout`、`IntroLayout` 或 `SimpleLayout`

主站負責的內容主要包括：

- `/menu/*` 下的查詢、對比、音系、結果、地圖、門戶頁
- `/explore/*` 下的工具頁、資料頁與 VillagesML 入口頁
- `/auth/*`、`/intro/*`
- 全局 Toast / Confirm / RateLimit 提示

### VillagesML 子應用

VillagesML 由以下文件啟動：

- `project/src/VillagesML/app/main.js`
- `project/src/VillagesML/app/App.vue`
- `project/src/VillagesML/app/router.js`
- `project/src/VillagesML/app/Entry.vue`

啟動時 VillagesML 會：

- 載入 `villagesml-entry.scss`
- 復用共享消息系統與 i18n
- 使用自己的 router 管理 `/villagesML/*`
- 在 `Entry.vue` 中掛載 `VillagesMLWorkspace.vue`

VillagesML 內部進一步分成兩層：

- `dashboard/`：主站 gateway 頁會懶加載的儀表盤入口
- `workspace/`：真正的分析工作區，按 `modules/*` 拆分功能

### 為什麼是這種混合模型

這種結構讓項目同時保留兩種能力：

- 主站可以在 Explore 中提供統一入口、外殼與導航語境
- VillagesML 可以作為獨立子應用持有自己的 canonical path、router 與工作區演進節奏

---

## 路由與兼容層

### 目前的 canonical path

主站與子應用目前以 path 路由作為主要頁面身份：

- `/menu/query/:sub`
- `/menu/compare/:sub`
- `/menu/map/:sub`
- `/menu/pho/:section`
- `/explore/tools/check`
- `/explore/tools/jyut2ipa`
- `/explore/tools/merge`
- `/explore/tools/praat`
- `/explore/manage`
- `/explore/yubao`
- `/explore/char-class`
- `/explore/villages/ml`
- `/villagesML/*`

### legacy query 入口仍然存在

為了兼容舊鏈接與舊導航語義，主站保留了兩個 entry bridge：

- `project/src/main/views/entry/MenuEntry.vue`
- `project/src/main/views/entry/ExploreEntry.vue`

它們會配合 `project/src/main/router/legacyRouteMap.js`：

- 把 `/menu?tab=...&sub=...` 轉譯成 `/menu/...`
- 把 `/explore?page=...` 轉譯成 `/explore/...`

這意味著：

- query 形式不是當前主要頁面組織方式
- 但它仍是現有外部鏈接與歷史書籤的兼容層

### VillagesML bridge 的角色

主站 router 中存在：

```javascript
{
  path: '/villagesML/:pathMatch(.*)*',
  component: VillagesMLBridge
}
```

對應的 `project/src/main/views/entry/ExternalRouteBridge.vue` 會在掛載時執行：

```javascript
window.location.replace(route.fullPath)
```

它的作用不是承載 VillagesML 業務，而是把瀏覽器重新導向到 `villagesML/index.html` 所屬的子應用入口。

反過來，`project/src/VillagesML/app/router.js` 也保留了一個 fallback bridge：

- `/villagesML/*` 交給 VillagesML 自身處理
- 其他未命中的 path 交回 `ExternalRouteBridge.vue`

這表示目前的橋接設計是：

- **canonical path 仍是獨立的**
- **bridge 是現有多入口部署與互跳的接線層**
- **bridge 不是業務頁面的最終宿主**

### Query 白名單與守衛

`project/src/main/router.js` 內還有兩個重要機制：

- `ROUTE_QUERY_ALLOWLIST`：按路徑過濾允許保留的 query key
- `router.beforeEach()`：在進入部分頁面前先做 query 清洗、標題設置與認證檢查

目前主站對 `/auth/data`、`/auth/regions` 會等待 `waitForAuthReady()` 後再決定是否放行。

---

## 組件與模組分層

### 共用 UI 層

跨應用共用的組件目前位於：

```text
project/src/components/
├── ToastAndHelp/
├── bar/
├── common/
└── selector/
```

這一層目前承載的內容包括：

- 全局消息與提示
- `CommonBar`、`ExploreBar`、`NavBar` 等導航條
- `AppModal`、`TabsContainer` 等通用容器
- 常用選擇器與下拉組件

### 主站視圖分層

主站當前主要頁面按職責分在：

- `project/src/main/views/menu/`
- `project/src/main/views/explore/`
- `project/src/main/views/intro/`
- `project/src/main/views/entry/`

其中：

- `menuRoutes.js` 管理 `/menu/*`
- `exploreRoutes.js` 管理 `/explore/*`
- `views/entry/*` 主要承擔 legacy entry 與 bridge 行為

### VillagesML 模組分層

VillagesML 的工作區已按功能劃分為獨立模塊：

```text
project/src/VillagesML/workspace/modules/
├── character/
├── ml/
├── pattern/
├── regional/
├── search/
├── semantic/
├── spatial/
├── system/
└── village/
```

這種結構說明 VillagesML 已經不是單頁儀表盤，而是一個具有獨立工作區組織方式的子應用。

---

## 狀態管理

### 主站狀態

主站狀態目前主要位於：

- `project/src/main/store/store.js`
- `project/src/main/store/customRegionStore.js`
- `project/src/main/store/userStats.js`

`store.js` 中仍以 Vue 的 `ref` / `reactive` 為主，核心狀態包括：

- `globalPayload`
- `userStore`
- `mapStore`
- `queryStore`
- `resultCache`
- `uiStore`

這種設計延續了「不用 Vuex / Pinia，直接用 Vue 原生響應式對象」的風格。

### VillagesML 狀態

VillagesML 目前使用：

- `project/src/VillagesML/store/villagesMLStore.js`

它集中保存：

- 當前激活標籤
- 村名搜尋條件與結果
- 區域分析數據
- 聚類參數與結果
- 語義網絡配置
- 工作區級別的 loading / error 狀態

因此，當前項目的狀態管理是「主站一套 domain store、VillagesML 一套 domain store」的並行模式，而不是單一全局 store。

---

## API 架構

### 共用 API 根目錄

API 目前統一位於：

```text
project/src/api/
├── auth/
├── logs/
├── main/
│   ├── core/
│   ├── geo/
│   ├── sql/
│   ├── tools/
│   └── user/
├── villagesML/
└── index.js
```

### 主要分層

- `src/api/auth/`：認證、session、token、HTTP client、驗證
- `src/api/main/`：主站功能 API
  - `core/`：查詢、比較、音系
  - `geo/`：地點與地理信息
  - `sql/`：資料庫查詢與修改
  - `tools/`：Praat、check、merge、jyut2ipa
  - `user/`：用戶自定義數據與分區
- `src/api/villagesML/`：VillagesML 專屬分析 API
- `src/api/logs/`：訪問統計等日誌接口

### 中央導出層

`project/src/api/index.js` 目前仍提供一個集中導出面：

- 對主站來說，方便用單一入口導入大部分 API
- 對 VillagesML 來說，也已經把大量專屬 API 重新導出到同一層

這說明當前代碼庫採用的是：

- **底層按命名空間分目錄**
- **上層按需要提供聚合導出**

這個結構也為後續新增獨立模組提供了已存在的參考模式。

---

## Layout 與樣式層

### 共用 Layout

布局殼位於：

```text
project/src/layouts/
├── ExploreLayout.vue
├── IntroLayout.vue
├── MenuLayout.vue
└── SimpleLayout.vue
```

主站 `App.vue` 會根據當前路由決定使用哪個 layout：

- `/` 與 `/villagesML/*`：`SimpleLayout`
- `/intro*`：`IntroLayout`
- 典型 `/explore/*`：`ExploreLayout`
- 其他主站頁：`MenuLayout`

這表示 layout 選擇目前集中在主站殼層，而不是散落在每個頁面中各自決定。

### 樣式入口

樣式目前分為三層入口：

```text
project/src/styles/
├── global-entry.scss
├── main-entry.scss
├── villagesml-entry.scss
├── global/
├── main/
└── villagesml/
```

含義分別是：

- `global/`：通用 token、base、glass、scrollbars、utilities
- `main/`：主站表單、工具欄、浮層、表面樣式
- `villagesml/`：VillagesML 工作區與面板樣式

這與當前運行時結構是一致的：共用基礎樣式存在，但主站與 VillagesML 已經有各自的樣式子層。

---

## 構建與運行時注意事項

### 路由模式

當前主站與 VillagesML router 都使用 `createWebHistory()`，不再是舊文檔中曾出現的 hash 路由模型。
因此：

- 部署時應按 path 路由與多入口 HTML 一起考慮
- 文檔、協作說明與新功能接入都應優先描述 path 路由

### 懶加載

當前懶加載主要出現在：

- 主站 `menuRoutes.js` / `exploreRoutes.js`
- VillagesML dashboard 與 workspace 面板

這是控制首屏體積與分析頁載入成本的關鍵策略之一。

### 共享基礎設施

以下能力目前是跨入口復用的，不應在文檔中再被描述成彼此完全孤立：

- `src/api/auth`
- `src/i18n`
- `src/components/ToastAndHelp`
- `src/layouts`
- `src/utils/message.js`

### 當前最重要的結論

如果只記住一件事，請記住：

- `main` 與 `VillagesML` 已經是兩個入口清晰的 Vue 應用
- 但它們仍然共享大量基礎設施
- bridge 與 legacy route map 是當前部署與兼容層的一部分，不等於它們沒有獨立路由身份

---

**延伸閱讀：**

- [文檔中心](./README.md)
- [貢獻指南](./CONTRIBUTING.md)
- [API 文檔](./API.md)
- [VillagesML 功能總覽](./VillagesML/FEATURE_OVERVIEW.md)

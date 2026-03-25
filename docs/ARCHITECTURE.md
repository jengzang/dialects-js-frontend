# 架構說明

## 倉庫分層

這個倉庫目前分成兩層：

- `docs/`：文檔
- `project/`：前端工程

真正的代碼、構建、測試、部署腳本都在 `project/` 下面。

## 運行時拆分

當前前端不再是單一運行時，而是拆成兩個應用：

- 主站應用：`project/src/main`
- VillagesML 子應用：`project/src/VillagesML`

這個拆分不只是目錄整理，也反映在 Vite 多入口構建與路由結構上。

## Vite 入口

`project/vite.config.js` 當前構建 6 個 HTML 入口：

- `index.html`
- `auth/index.html`
- `menu/index.html`
- `intro/index.html`
- `explore/index.html`
- `villagesML/index.html`

路由模式使用 `createWebHistory()`，不是 hash 路由。

## 主站應用

主站入口文件：

- `project/src/main/main.js`
- `project/src/main/App.vue`
- `project/src/main/router.js`

主站主要承載：

- `/`
- `/menu`
- `/explore`
- `/intro`
- `/auth`
- `/auth/data`
- `/auth/regions`

其中 `/explore` 仍是主站內的工具與專題入口頁。

## VillagesML 子應用

VillagesML 入口文件：

- `project/src/VillagesML/app/main.js`
- `project/src/VillagesML/app/App.vue`
- `project/src/VillagesML/app/router.js`

當前內部結構：

```text
src/VillagesML/
  app/
  components/
  config/
  dashboard/
  store/
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

這裡有一個很重要的語義區分：

- `/explore?page=VillagesML`
  - 仍屬於主站
  - 作用是 dashboard / gateway
  - 保留主站中的導航語義

- `/villagesML?...`
  - 才是真正的 VillagesML 工作台
  - 由 VillagesML 子應用運行時承載

## 主站與 VillagesML 的銜接

當前銜接方式是：

1. 用戶可以從首頁、主站導航、側邊欄進入 `/explore?page=VillagesML`
2. 主站在這裡顯示 VillagesML dashboard
3. dashboard 再導向 `/villagesML?module=...&subtab=...`
4. 主站 router 對 `/villagesML/*` 只做 bridge
5. 瀏覽器整頁切入 VillagesML 子應用

這樣保留了原有業務入口，同時把工作台運行時真正拆了出來。

## 共享層

目前仍保留在 `project/src/` 根層的共享部分有：

- `api/`
- `assets/`
- `components/`
- `i18n/`
- `layouts/`
- `utils/`

它們代表共享基礎設施，不代表單獨應用。

## 路由與頁面行為

當前幾個重要行為：

- `/explore?page=VillagesML` 只保留 dashboard 語義
- 如果 `page=VillagesML` 同時帶了非 dashboard 的 `module`，主站會改跳 `/villagesML?...`
- `/explore` 的默認頁已改成 `Praat`

## 部署要求

部署時最重要的一條是：

- `/villagesML`
- `/villagesML/*`

都必須落到 `project/villagesML/index.html`。

如果還是落回主站 `index.html`，用戶只會停留在 bridge 跳轉流程裡，不能正確進入 VillagesML 子應用。

## 測試與驗證

當前測試非常輕，`project/tests/smoke.test.js` 只有最小 smoke test。
因此涉及入口、路由、部署的調整，應至少做：

- `npm run build`
- 直接訪問關鍵路徑
- 手工檢查 `/explore -> VillagesML -> /villagesML` 跳轉鏈路

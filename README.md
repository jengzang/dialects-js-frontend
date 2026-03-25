# 粵韻方言地圖前端

> Vue 3 + Vite 前端，包含主站應用與 `VillagesML` 子應用。

[English docs index](./docs/README.en.md)

## 倉庫結構

這個倉庫目前分成兩層：

- `docs/`：文檔
- `project/`：實際前端工程

日常開發、構建、測試都在 `project/` 目錄下進行。

## 快速開始

```bash
git clone https://github.com/jengzang/dialects-vue-frontend.git
cd frontend-vue/project
npm install
npm run dev
```

常用命令：

```bash
npm run dev
npm run dev:web
npm run build
npm run preview
npm run test
npm run lint
npm run format
npm run i18n:extract
```

## 當前應用結構

當前前端不是單一入口，而是「主站 + VillagesML 子應用」：

- 主站入口：`project/src/main/main.js`
- VillagesML 入口：`project/src/VillagesML/app/main.js`

Vite 當前構建 6 個 HTML 入口：

- `index.html`
- `auth/index.html`
- `menu/index.html`
- `intro/index.html`
- `explore/index.html`
- `villagesML/index.html`

核心路徑：

- `/`：首頁
- `/menu`：主站內容頁
- `/explore`：工具與專題入口頁
- `/villagesML`：VillagesML 工作台
- `/auth`：登入與用戶頁面
- `/intro`：介紹頁

其中 `VillagesML` 保留了兩種入口語義：

- `/explore?page=VillagesML`：主站中的導覽頁 / dashboard
- `/villagesML?module=...`：真正的 VillagesML 子應用工作台

## 前端源碼結構

```text
project/
  src/
    api/           # 共享 API 與認證請求
    assets/        # 靜態資源
    components/    # 共享組件，目前保留 bar/common/ToastAndHelp
    i18n/          # 多語言資源與初始化
    layouts/       # 共享 layout
    utils/         # 共享工具
    main/          # 主站應用
    VillagesML/    # VillagesML 子應用
    env-config.js
    style.css
```

`src/main/` 主要承載首頁、`/menu`、`/explore`、`/auth`、`/intro`。
`src/VillagesML/` 主要承載 VillagesML 的 `app / dashboard / workspace`。

## 部署重點

這個項目使用 `createWebHistory()`，部署時需要正確做前端路由回退。

尤其要注意：

- `/villagesML`
- `/villagesML/*`

都必須落到 `project/villagesML/index.html`，不能落回主站 `index.html`。

更多細節見：

- [部署說明](./project/DEPLOY.md)
- [架構說明](./docs/ARCHITECTURE.md)

## 文檔索引

- [docs 總覽](./docs/README.md)
- [架構說明](./docs/ARCHITECTURE.md)
- [使用說明](./docs/USER_GUIDE.md)
- [VillagesML 功能概覽](./docs/VillagesML/FEATURE_OVERVIEW.md)
- [VillagesML 使用說明](./docs/VillagesML/USER_GUIDE.md)
- [i18n 說明](./project/src/i18n/README.md)
- [部署說明](./project/DEPLOY.md)
- [協作說明](./docs/CONTRIBUTING.md)

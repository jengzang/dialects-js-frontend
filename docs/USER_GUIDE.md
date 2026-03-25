# 使用說明

## 入口總覽

當前前端主要有 5 類常用入口：

- `/`：首頁
- `/menu`：主站內容頁
- `/explore`：工具與專題入口頁
- `/villagesML`：VillagesML 工作台
- `/auth`：登入與用戶頁面

## 首頁 `/`

首頁對應：

- `project/src/main/views/HomePage.vue`

用途：

- 展示站點入口
- 分流到主站各功能
- 分流到 VillagesML dashboard

## 主站內容頁 `/menu`

`/menu` 使用 query 控制不同頁面，例如：

- `/menu?tab=query`
- `/menu?tab=pho`
- `/menu?tab=compare`
- `/menu?tab=map`
- `/menu?tab=about`

對應入口：

- `project/src/main/views/MenuEntry.vue`

## 探索頁 `/explore`

`/explore` 使用 `page` 參數切換工具或專題頁，例如：

- `/explore?page=praat`
- `/explore?page=check`
- `/explore?page=jyut2ipa`
- `/explore?page=merge`
- `/explore?page=gdVillages`
- `/explore?page=VillagesML`

對應入口：

- `project/src/main/views/ExploreEntry.vue`

當前默認頁：

- `Praat`

## VillagesML

VillagesML 有兩種入口：

### 1. 主站中的 dashboard

```text
/explore?page=VillagesML
```

用途：

- 作為主站中的 VillagesML 導覽頁
- 展示 dashboard
- 再分流到具體模塊

### 2. 真正的工作台

```text
/villagesML?module=search
/villagesML?module=character&subtab=frequency
/villagesML?module=semantic&subtab=indices
```

用途：

- 進入 VillagesML 子應用
- 打開具體模塊和子標籤

## 認證頁 `/auth`

主路徑：

- `/auth`
- `/auth/data`
- `/auth/regions`

對應文件：

- `project/src/main/views/auth.vue`

## 常見導航鏈路

### 從主站進入 VillagesML

1. 進入 `/explore?page=VillagesML`
2. 在 dashboard 中選擇模塊
3. 跳到 `/villagesML?...`
4. 由 VillagesML 子應用承載後續工作流

### 直接打開 VillagesML

可以直接訪問：

- `/villagesML?module=search`
- `/villagesML?module=character&subtab=frequency`

前提是部署時已把 `/villagesML*` 正確路由到 `villagesML/index.html`。

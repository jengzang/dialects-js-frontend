# VillagesML 使用說明

## 入口方式

VillagesML 有兩種入口方式。

### 1. 從主站 dashboard 進入

```text
/explore?page=VillagesML
```

這個入口仍然屬於主站，主要用來：

- 展示 VillagesML 導覽頁
- 說明功能入口
- 分流到具體模塊

### 2. 直接進入工作台

```text
/villagesML?module=search
```

這是 VillagesML 子應用的實際工作台入口。

## 常見 URL 形式

```text
/villagesML?module=search
/villagesML?module=character&subtab=frequency
/villagesML?module=semantic&subtab=indices
/villagesML?module=spatial&subtab=clusters
/villagesML?module=pattern&subtab=ngram-stats
/villagesML?module=regional&subtab=vectors
/villagesML?module=compute&subtab=clustering
```

## 參數說明

- `module`
  - 指定主模塊
- `subtab`
  - 指定模塊內的子標籤

如果只給 `module`，工作台會使用該模塊的默認子頁或默認狀態。

## 從主站跳轉到工作台

當前主站保留了兼容邏輯：

- `page=VillagesML` 且只顯示 dashboard 時，仍留在 `/explore`
- `page=VillagesML` 且帶了非 dashboard 的 `module` 時，會改跳 `/villagesML?...`

因此舊鏈接與主站導航仍可共存。

## 部署提醒

若要直接訪問 `/villagesML?...`，部署必須保證：

- `/villagesML`
- `/villagesML/*`

都回退到 `villagesML/index.html`。

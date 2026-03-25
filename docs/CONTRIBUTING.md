# 協作說明

## 基本原則

- 以 `project/` 內的實際代碼為準。
- 改動結構、路由、部署方式或 i18n 時，要同步更新文檔。
- 根 README 只保留高層說明，細節分流到 `docs/` 或 `project/` 內專門文檔。

## 開發流程

```bash
cd project
npm install
npm run dev
```

提交前至少建議執行：

```bash
npm run build
npm run test
```

如果改了文案或語言資源，建議再執行：

```bash
npm run i18n:extract
```

## 文檔維護要求

下面這些變更必須同步更新文檔：

- 新增或刪除入口路由
- 調整 `src/main` 與 `src/VillagesML` 的邊界
- 調整部署輸出或靜態入口
- 調整 i18n 文件結構
- 調整 VillagesML 模塊或 `subtab`

## 文檔更新位置

### 倉庫入口

- `README.md`

### 架構與導航

- `docs/ARCHITECTURE.md`
- `docs/USER_GUIDE.md`

### VillagesML

- `docs/VillagesML/FEATURE_OVERVIEW.md`
- `docs/VillagesML/USER_GUIDE.md`

### 技術專項

- `project/DEPLOY.md`
- `project/src/i18n/README.md`

## 提交建議

- 結構性調整：`refactor: ...`
- 文檔修正：`docs: ...`
- 文案 / i18n 修正：`fix: ...`

如果某次改動同時改了代碼和文檔，提交說明應以主要目的為準。

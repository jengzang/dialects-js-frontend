# 文檔索引

> 以當前代碼為準的文檔入口。

[English](./README.en.md)

## 建議優先閱讀

- [根 README](../README.md)
- [架構說明](./ARCHITECTURE.md)
- [使用說明](./USER_GUIDE.md)
- [VillagesML 功能概覽](./VillagesML/FEATURE_OVERVIEW.md)
- [VillagesML 使用說明](./VillagesML/USER_GUIDE.md)
- [部署說明](../project/DEPLOY.md)
- [i18n 說明](../project/src/i18n/README.md)
- [協作說明](./CONTRIBUTING.md)

## 文檔分工

### 1. 倉庫與架構

- [ARCHITECTURE.md](./ARCHITECTURE.md)
  - 倉庫分層
  - 主站與 VillagesML 的運行時拆分
  - 路由與入口
  - 共享層與專屬層

### 2. 使用與導航

- [USER_GUIDE.md](./USER_GUIDE.md)
  - `/`
  - `/menu`
  - `/explore`
  - `/villagesML`
  - `/auth`

### 3. VillagesML

- [VillagesML/FEATURE_OVERVIEW.md](./VillagesML/FEATURE_OVERVIEW.md)
  - 當前模塊
  - dashboard 與 workspace 的分工
  - 源碼位置

- [VillagesML/USER_GUIDE.md](./VillagesML/USER_GUIDE.md)
  - 入口方式
  - 常用 URL 形式
  - 模塊與 `subtab`

### 4. 開發與維護

- [CONTRIBUTING.md](./CONTRIBUTING.md)
- [../project/DEPLOY.md](../project/DEPLOY.md)
- [../project/src/i18n/README.md](../project/src/i18n/README.md)

## 補充文檔

下面這些文件仍可作參考，但如果與代碼不一致，以 `project/` 內的實現和上面列出的主文檔為準：

- [API.md](./API.md)
- [API.en.md](./API.en.md)
- [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)
- [DESIGN_SYSTEM.en.md](./DESIGN_SYSTEM.en.md)

## 維護原則

- 根 README 只保留高層入口與快速開始。
- `docs/README.md` 只做導航，不重複寫細節。
- 架構、部署、i18n、VillagesML 的細節分別收在專門文檔。
- 文檔若與代碼有衝突，以代碼為準，並應及時回寫文檔。

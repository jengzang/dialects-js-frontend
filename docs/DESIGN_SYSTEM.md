# 設計系統

> 以當前代碼結構為準的樣式入口、共享組件與復用約束說明

**文檔語言：** [English](./DESIGN_SYSTEM.en.md) | 中文

---

## 文檔定位

這份文檔不是脫離代碼的品牌手冊，而是面向當前倉庫協作的前端實作說明。它回答的是：

- 全局樣式從哪裡進來
- 主站與 `VillagesML` 各自有哪些樣式層
- 哪些組件應優先複用
- 新增頁面或子應用時，應在哪裡落樣式、哪些共享能力可以直接拿來用

如果你只是想知道某個頁面應該從哪一層接入樣式、是否應該復用 `CommonBar`、`TabsContainer` 或 `AppModal`，請先看這份文檔。

---

## 當前樣式入口

當前樣式不再是單一的 `src/style.css`，而是按「全局基礎層 / 主站層 / VillagesML 層」拆成獨立入口。

### 入口文件

```text
project/src/styles/
├── global-entry.scss
├── main-entry.scss
├── villagesml-entry.scss
├── _legacy.scss
├── global/
├── main/
└── villagesml/
```

### 三個入口的責任

- `global-entry.scss`
  - 所有應用共用的基礎樣式入口
  - 載入 global tokens、base、scrollbars、loading、glass、utilities 等
- `main-entry.scss`
  - 主站專用樣式入口
  - 在全局基礎層之上，再疊加 buttons、forms、surfaces、toolbars、overlays、popups、states
- `villagesml-entry.scss`
  - `VillagesML` 專用樣式入口
  - 在全局基礎層之上，再疊加 villagesml 的 surfaces、panels、controls、workspace

### 關於 `_legacy.scss`

目前 token 遷移尚未完全結束。`project/src/styles/global/_tokens.scss` 已經預留為長期 token 宿主，但實際 token 仍主要從 `project/src/styles/_legacy.scss` 延續過來，以確保現有視覺輸出不被打斷。

這意味著：

- 不要輕易重命名或刪除既有 legacy token
- 不要假設所有樣式已經完成新 token 化
- 若只是新增頁面，優先複用現有變量與現有樣式結構，不要順手重構整個樣式體系

---

## 樣式分層規則

### `global/`

`project/src/styles/global/` 放所有應用都可以共享的基礎能力，目前包括：

- `_base.scss`
- `_close-buttons.scss`
- `_glass.scss`
- `_loading.scss`
- `_scrollbars.scss`
- `_tokens.scss`
- `_utilities.scss`

這一層適合放：

- reset / base
- 全局工具類
- 滾動條、關閉按鈕、loading 這類通用表現
- 不依賴具體頁面語義的視覺基礎

### `main/`

`project/src/styles/main/` 服務主站頁面與主站公共交互，適合放：

- 表單外觀
- 工具欄
- 覆層與彈窗表現
- 主站特定 surface / state 樣式

### `villagesml/`

`project/src/styles/villagesml/` 僅服務 `VillagesML` 工作區，適合放：

- 分析面板
- 工作區佈局
- 模塊控制區
- `VillagesML` 專屬 surface 樣式

---

## 新頁面與新子應用的樣式策略

### 1. 先落在自己的工作區

如果你在新增一個獨立頁面或子應用，例如 `PhoneticToolbox`，默認應先把樣式留在它自己的工作區內，而不是直接往共享層丟樣式。

建議做法：

- 頁面私有樣式：留在自己的 `src/<ModuleName>/...` 內
- 只有當樣式模式已被多處穩定復用時，才考慮抽到共享層
- 抽到共享層前，先確認那真的是跨模塊通用能力，而不是某個頁面的一次性外觀

### 2. 不要隨意改共享組件樣式

你的倉庫已經有成熟的主站與 `VillagesML` 視覺模式。新增子項目時，除非你在做的是明確的共享能力擴展，否則不應修改：

- `project/src/components/`
- `project/src/styles/global/`
- `project/src/styles/main/`
- `project/src/styles/villagesml/`

尤其當用戶已明確要求「只在自己的工作區內改」，就更應該把改動收斂在該模塊目錄下。

### 3. 盡量接入現有樣式層，而不是另起一套全局機制

當前項目已經有：

- 全局樣式入口
- 主站樣式入口
- `VillagesML` 樣式入口
- 現成的公共組件與交互樣式

新頁面應優先復用這些基礎能力，而不是再引入一套平行的全局樣式機制。

---

## 共享組件清單與推薦復用順序

目前最值得優先複用的共享組件位於 `project/src/components/`。

### 導航與頂欄

#### `project/src/components/bar/CommonBar.vue`

適用場景：

- 新的獨立模塊有多個頂部 tab
- 需要可配置的頂欄 schema
- 需要桌面 / 移動端共同工作

這是目前最推薦新子應用優先複用的頂欄組件。你之前提到「多個 tab 的時候強烈推薦復用 `CommonBar`」，這個判斷是對的，而且應該明確寫給協作者。

#### `project/src/components/bar/ExploreBar.vue`

適用場景：

- 主站 `explore` 體系下的頁面

這個組件與主站 `Explore` 的配置和記憶子路由邏輯耦合較深，不適合拿來當通用新模塊頂欄模板。對新子應用來說，應優先看 `CommonBar`，而不是 `ExploreBar`。

#### 其他 bar 類組件

- `NavBar.vue`
- `SimpleSidebar.vue`
- `IntroTabBar.vue`
- `FloatingButtons.vue`

這些可以視場景複用，但如果只是做獨立模塊頂欄，優先順序仍然是 `CommonBar`。

### 局部 tab 與容器

#### `project/src/components/common/TabsContainer.vue`

適用場景：

- 單頁內部的局部 tab 切換
- 需要簡單的 `v-model` / route 同步
- 不需要重新發明一套 tabs 容器

如果是頁面內部子區塊切換，而不是整個模塊頂部導航，優先考慮複用它。

### 模態框

#### `project/src/components/common/AppModal.vue`

適用場景：

- 新增 modal / dialog
- 需要固定 header、可滾動 content 的標準結構
- 需要 Teleport、玻璃感面板、統一 close button 樣式

這個組件也符合你倉庫裡的重要約束：modal header 不應跟著內容一起滾動。新模塊做彈窗時，應優先複用，而不是再從頭寫一個。

### 選擇器

目前可複用的下拉與選擇類組件包括：

- `project/src/components/selector/ChoiceSelector.vue`
- `project/src/components/selector/MultiSelectDropdown.vue`
- `project/src/components/selector/SimpleDropdown.vue`
- `project/src/components/selector/SimpleSelectDropdown.vue`

適用場景：

- 常規單選 / 多選
- 需要搜索的下拉選項
- 與現有視覺風格保持一致的表單控件

如果只是列表選擇，不要急著自己寫新的 dropdown。

### 反饋與幫助

目前可複用的反饋組件包括：

- `project/src/components/ToastAndHelp/GlobalToast.vue`
- `project/src/components/ToastAndHelp/GlobalConfirm.vue`
- `project/src/components/ToastAndHelp/HelpIcon.vue`
- `project/src/components/ToastAndHelp/RateLimitNotice.vue`
- `project/src/components/ToastAndHelp/UpdateNoticeModal.vue`

這些組件覆蓋了全局提示、確認框、幫助說明與限流提示。新增頁面需要全局反饋時，應優先接入這一套。

---

## 路由、頁面身份與佈局約定

這些雖然不完全是純設計問題，但會直接影響頁面結構與 UI 實作方式，因此需要一併遵守。

### 路徑優先於 query 表示頁面身份

頂層頁面身份應優先用 path route 表達，而不是用 query 表示「你現在在什麼頁」。query 更適合表示頁面內部狀態。

### modal header 不隨內容滾動

這在你的倉庫裡是高優先級約束。若新增彈窗，應維持：

- header 固定
- content 區單獨滾動
- 關閉按鈕位置一致

### 新增入口應接入既有導航體系

如果是新的獨立子應用，除了自己的路由與工作區外，也應考慮：

- 是否需要在 `Explore` 入口頁放一個入口
- 是否需要讓主站進入它時走一個明確入口頁
- 是否保留主站到子應用的橋接層

你此前已明確過：`/villagesML/:pathMatch(.*)*` 這種獨立路徑是保留的，橋接不是頁面身份本身，而是主站與子應用之間的接線層。協作者不應隨意取消這種模式。

---

## 命名與技術風格

### 新模塊名稱建議使用 PascalCase

對於新的獨立模塊或子應用，名稱建議使用 PascalCase，例如：

- `PhoneticToolbox`
- `VillagesML`

這比混用多種大小寫風格更容易維持一致的目錄、入口與 API 命名。

### Composition API + SCSS 是推薦組合

你現在的項目整體仍以 JavaScript 為主，但新頁面或新子模塊若沿用：

- Vue Composition API
- SCSS

會更貼近你現在的共享層與樣式分層方式。

### TypeScript 的建議

由於當前項目主體仍是 JS-first，若協作者想在新模塊中引入 TypeScript，最好滿足兩個條件：

- 影響範圍清晰，局限在自己的模塊內
- 不把 TS 要求擴散到現有共享層與主站既有頁面

也就是說，局部、邊界清晰的 TS 可以討論；默默把整個共享層往 TS 方向推，不適合作為默認策略。

---

## 協作者實作建議

如果協作者要新增一個新的獨立頁面或子應用，推薦順序如下：

1. 先確認是否已有共享組件能覆蓋需求
2. 多 tab 頂欄優先看 `CommonBar`
3. 局部 tab 優先看 `TabsContainer`
4. 彈窗優先看 `AppModal`
5. 下拉與選擇器優先看 `selector/`
6. 全局提示、確認與說明優先看 `ToastAndHelp/`
7. 樣式先留在自己的模塊工作區
8. 只有在能力已被多處穩定復用時，再考慮往共享層抽

這能最大程度降低對主站、`VillagesML` 和其他既有子項目的干擾。

---

## 與其他文檔的關係

- 整體結構與入口關係：見 [ARCHITECTURE.md](./ARCHITECTURE.md)
- API 組織：見 [API.md](./API.md)
- 協作邊界與新增模塊規則：見 [CONTRIBUTING.md](./CONTRIBUTING.md)

如果你要新增像 `PhoneticToolbox` 這樣的獨立模塊，本文件應與 `CONTRIBUTING.md` 一起閱讀：前者約束樣式與組件復用，後者約束目錄、路由、API 放置與協作邊界。

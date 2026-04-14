# VillagesML 使用指南

> 面向 VillagesML 工作區使用者的入口說明與常用操作路徑

---

## 入口與路徑

VillagesML 目前有兩層入口語義：

1. **Explore 入口殼頁**
   - 路徑：`/explore/villages/ml`
   - 作用：展示 Dashboard、功能卡片與快速入口

2. **工作區 canonical path**
   - 路徑：`/villagesML?module=...&subtab=...`
   - 作用：承載真正的分析工作區與模塊切換

如果您只是想先看總覽，從 `/explore/villages/ml` 進入最合適。
如果您已經知道要打開哪個模塊，可以直接打開 `/villagesML?...`。

---

## 工作區網址規則

VillagesML 工作區主要用兩個 query 參數定位頁面：

- `module`：主模塊
- `subtab`：模塊內子功能

例如：

- `/villagesML?module=search`
- `/villagesML?module=character&subtab=frequency`
- `/villagesML?module=semantic&subtab=subcategories`
- `/villagesML?module=spatial&subtab=hotspots`
- `/villagesML?module=regional&subtab=similarity`
- `/villagesML?module=compute&subtab=features`

當前 CommonBar 會把子標籤記憶在 session 級存儲裡，因此同一輪會話中再次切回某模塊時，通常會回到上次訪問的子頁。

---

## 模塊總覽

| 模塊 | 默認路徑 | 主要用途 |
| --- | --- | --- |
| 搜索 | `/villagesML?module=search` | 關鍵詞搜索、行政區過濾、村莊列表與深度分析 |
| 字符分析 | `/villagesML?module=character&subtab=frequency` | 頻率傾向、嵌入相似、字符網絡、顯著性 |
| 語義分析 | `/villagesML?module=semantic&subtab=categories` | 類別標籤、組合模式、N-gram、語義網絡、子類別 |
| 空間分析 | `/villagesML?module=spatial&subtab=hotspots` | 空間熱點、空間聚類、空間可視化、空間整合 |
| 模式分析 | `/villagesML?module=pattern&subtab=frequency` | 模式頻率、結構分析、傾向性、N-gram 探索與統計 |
| 區域分析 | `/villagesML?module=regional&subtab=aggregates` | 聚合統計、區域向量、類別傾向性、相似度分析 |
| ML 計算 | `/villagesML?module=compute&subtab=clustering` | 基礎聚類、字符傾向、採樣村莊、空間感知、層次聚類、特徵提取、子集分析 |

---

## 常用工作流

### 1. 搜索自然村並打開深度分析

**入口：** `/villagesML?module=search`

推薦流程：

1. 輸入關鍵詞。
2. 使用市 / 縣 / 鎮三級篩選收窄範圍。
3. 在結果列表中翻頁查看候選村莊。
4. 點擊條目打開深度分析 Modal，查看：
   - 基本信息
   - 特徵向量
   - 空間特徵
   - 語義結構
   - N-gram 分解

### 2. 查看字符頻率傾向熱圖

**入口：** `/villagesML?module=character&subtab=frequency`

這個頁面適合先做整體感知：

1. 選地區層級。
2. 選地區或層級範圍。
3. 生成字符傾向數據。
4. 用熱圖比較不同地區的字符偏好。

### 3. 做語義子類別分析

**入口：** `/villagesML?module=semantic&subtab=subcategories`

適合做語義細分類研究：

1. 先按父類別篩選。
2. 進一步看子類別列表、區域對比或排行。
3. 把結果與字符頻率 / 區域相似度聯動理解。

### 4. 看空間熱點與聚類

**常用入口：**

- `/villagesML?module=spatial&subtab=hotspots`
- `/villagesML?module=spatial&subtab=clusters`
- `/villagesML?module=spatial&subtab=integration`

適合從地理分佈角度理解命名規律，尤其適合與語義分析、模式分析交叉閱讀。

### 5. 做區域相似度分析

**入口：** `/villagesML?module=regional&subtab=similarity`

這裡適合：

- 查找和某區域最相近的其他區域
- 兩區域對比
- 多區域相似度矩陣可視化

### 6. 執行 ML 計算

**常用入口：**

- `/villagesML?module=compute&subtab=clustering`
- `/villagesML?module=compute&subtab=char-tendency`
- `/villagesML?module=compute&subtab=sampled-villages`
- `/villagesML?module=compute&subtab=spatial-aware`
- `/villagesML?module=compute&subtab=hierarchical`
- `/villagesML?module=compute&subtab=features`
- `/villagesML?module=compute&subtab=subset`

這一組頁面比較適合有明確分析目標時再進入，不建議第一次使用就從最重的計算頁開始。

---

## 登錄與權限

VillagesML 目前採用共享主站賬戶體系。

### 不登錄也可使用的部分

- 搜索
- 多數只讀分析頁
- Dashboard / Explore 入口頁

### 需要登錄的常見情況

- 某些網絡分析或計算操作
- ML 計算中的實際執行按鈕
- 需要保存或回寫個人數據的流程

如果未登錄，頁面會透過統一的 `useAuthGuard` 把您帶到 `/auth`，並保留當前 `redirect`，登錄後可以回到原頁。

---

## Dashboard 與工作區的關係

`/explore/villages/ml` 載入的是 Dashboard 入口頁，它主要做兩件事：

1. 展示 VillagesML 的總覽與入口卡片
2. 把您導向真正的工作區 URL，例如 `/villagesML?module=...`

所以：

- **Dashboard 更像總覽和分流頁**
- **`/villagesML?...` 才是分析工作真正發生的地方**

---

## 使用建議

### 初次使用

推薦順序：

1. 先進 `/explore/villages/ml`
2. 從搜索模塊開始
3. 再看字符分析或語義分析
4. 最後再進區域分析、空間分析與 ML 計算

### 做專題分析時

推薦把幾個模塊配合起來看：

- **搜索 + 深度分析 Modal**：先建立單村感知
- **字符分析 + 語義分析**：看命名內容與偏好
- **空間分析 + 區域分析**：看分佈格局與相似性
- **ML 計算**：在前面有明確假設後再做聚類或特徵提取

### 收藏與分享

由於工作區本身就靠 `module / subtab` 參數定位，因此直接收藏完整 URL 是可行的，也是最推薦的分享方式。

---

## 常見問題

### `/explore/villages/ml` 和 `/villagesML?...` 有什麼區別？

- `/explore/villages/ml`：主站入口殼頁 / Dashboard
- `/villagesML?...`：真正的 VillagesML 工作區

### 為什麼切換模塊後還記得上次子頁？

因為當前 CommonBar 會在 session 級存儲中記憶子標籤狀態。

### 為什麼點了某些計算按鈕會跳去登錄頁？

因為這些操作受權限保護，未登錄時會先經過 `/auth`。

### 哪個模塊最適合第一次使用？

通常是：

1. 搜索
2. 字符分析的頻率傾向
3. 語義分析的類別標籤或子類別

---

**延伸閱讀：**

- [VillagesML 功能總覽](./FEATURE_OVERVIEW.md)
- [主站用戶指南](../USER_GUIDE.md)
- [架構文檔](../ARCHITECTURE.md)

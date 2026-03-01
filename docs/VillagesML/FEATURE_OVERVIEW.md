# VillagesML 自然村機器學習分析系統 — 功能總覽

> **數據規模：** 廣東省 285,860 條自然村地名
> **分析維度：** 字符、語義、空間、模式、區域、ML聚類

---

## 目錄

1. [系統架構](#系統架構)
2. [Module 1 — 搜尋探索](#module-1--搜尋探索)
3. [Module 2 — 字符分析](#module-2--字符分析)
4. [Module 3 — 語義分析](#module-3--語義分析)
5. [Module 4 — 空間分析](#module-4--空間分析)
6. [Module 5 — 模式分析](#module-5--模式分析)
7. [Module 6 — 區域分析](#module-6--區域分析)
8. [Module 7 — ML計算](#module-7--ml計算)
9. [系統信息 Dashboard](#系統信息-dashboard)
10. [語義類別完整清單](#語義類別完整清單)
11. [通用 API 參數規範](#通用-api-參數規範)
12. [數據庫架構完整清單](#數據庫架構完整清單)
13. [算法詳情匯總](#算法詳情匯總)

---

## 系統架構

### 前端技術棧

| 層次 | 技術 | 說明 |
|------|------|------|
| UI 框架 | Vue 3.5 + Composition API | `<script setup>` 語法 |
| 構建工具 | Vite 7.1 (MPA) | 多入口點構建 |
| 狀態管理 | 自研響應式 Store | `villagesMLStore.js` |
| 地圖渲染 | MapLibre GL 5.16 | GPU 加速，零 DOM 標記 |
| 圖表庫 | ECharts 5.6 | 熱圖、柱狀、網絡圖 |
| API 中心 | `src/api/villagesML/` | 14 個子模組統一管理 |

### 模組/子頁面統計

| 模組 | 子頁面數 | 主要技術 |
|------|----------|----------|
| 搜尋探索 | 1 | 分頁搜尋、三級行政區過濾 |
| 字符分析 | 4 | 嵌入向量、卡方檢驗、共現網絡 |
| 語義分析 | 6 | VTF、PMI、Z-score 傾向性 |
| 空間分析 | 4 | 地理聚類、熱點識別、MapLibre |
| 模式分析 | 5 | N-gram、結構解析、通配符匹配 |
| 區域分析 | 3 | 三級聚合、Cosine/Jaccard 相似度 |
| ML計算 | 5 | K-means/DBSCAN/GMM、PCA、層次聚類 |
| 系統信息 | 1 | Dashboard、統計概覽 |

---

## Module 1 — 搜尋探索

**路由：** `/villagesML?module=search`
**組件：** `SearchPanel.vue` + `VillageListPanel.vue` + `VillageDeepAnalysisModal.vue`

### 功能說明

提供關鍵詞搜尋入口，支持三級行政區（市/縣/鎮）逐層過濾，搜尋結果分頁展示，可點入查看單個自然村的完整多維分析。

### 交互能力

- 關鍵詞輸入（支持漢字/拼音）
- 市 → 縣 → 鎮 三級聯動下拉選擇器（`FilterableSelect`）
- 分頁瀏覽（默認每頁 20 條）
- 點擊村莊條目進入深度分析 Modal

### 深度分析 Modal（`VillageDeepAnalysisModal.vue`）

對單個自然村展示：

| 分析維度 | 組件 | 說明 |
|----------|------|------|
| 基本信息 | `VillageInfoPanel.vue` | 村名、行政區、坐標 |
| 特徵向量 | `FeatureVectorPanel.vue` | 語義/形態/多樣性三組特徵 |
| 空間特徵 | `SpatialFeaturesPanel.vue` | 所屬空間聚類和熱點 |
| 語義結構 | `SemanticStructurePanel.vue` | 語義類別組合方式 |
| N-gram 分解 | `NgramPanel.vue` | 一元/二元/三元切分結果 |

### API 端點

| 函數 | 端點 | 主要參數 |
|------|------|---------|
| `searchVillages` | `GET /api/villages/village/search` | `keyword`, `city`, `county`, `township`, `limit`, `offset` |
| `getVillageDetail` | `GET /api/villages/village/search/detail` | `village_id` |
| `getRegionList` | `GET /api/villages/metadata/stats/regions` | `level` (city/county/township), `parent_*` |
| `getVillageComplete` | `GET /api/villages/village/complete/{villageId}` | — |
| `getVillageFeatures` | `GET /api/villages/village/features/{villageId}` | — |
| `getVillageSpatialFeatures` | `GET /api/villages/village/spatial-features/{villageId}` | — |
| `getVillageSemanticStructure` | `GET /api/villages/village/semantic-structure/{villageId}` | — |
| `getVillageNgrams` | `GET /api/villages/village/ngrams/{villageId}` | — |

> **後端實現：**
>
> **`GET /village/search`** — 查詢表：`广东省自然村_预处理`。WHERE 條件：`自然村_规范名 IS NOT NULL AND 自然村_规范名 LIKE '%keyword%'`，可附加 `市级 = city / 区县级 = county / 乡镇级 = township` 過濾。先執行 COUNT(*) 取總數，再 SELECT `ROWID, 自然村_规范名, 市级, 区县级, 乡镇级, longitude, latitude` 加 LIMIT/OFFSET 分頁。
>
> **`GET /village/search/detail`** — 多表聯查：① `广东省自然村_预处理` 取基本信息；② `village_features`（village_id, semantic_tags, suffix, cluster_id）；③ `village_spatial_features`（nn_distance_1/5/10, local_density, isolation_score）；④ LEFT JOIN `village_cluster_assignments`（run_id='spatial_eps_20'）+ `spatial_clusters` 取聚類質心。
>
> **`GET /metadata/stats/regions`** — 查詢 `广东省自然村_预处理`，動態 GROUP BY：city 級 → GROUP BY `市级`；county 級 → GROUP BY `市级, 区县级`；township 級 → GROUP BY `市级, 区县级, 乡镇级`，每組返回 `村莊數量`。
>
> **`GET /village/complete/{village_id}`** — 聚合 5 次查詢結果：basic_info（`广东省自然村_预处理`）+ spatial_features（`village_spatial_features`）+ semantic_structure（`village_semantic_structure`，含 `semantic_sequence, has_modifier, has_head, has_settlement`）+ ngrams（`village_ngrams`，含 `bigrams, trigrams, prefix_bigram, suffix_bigram`）+ features（`village_features`）。
>
> **`GET /village/features/{village_id}`** — 直接查 `village_features` 全列，以 ROWID 定位。
>
> **`GET /village/spatial-features/{village_id}`** — 查 `village_spatial_features`，LEFT JOIN `village_cluster_assignments`（過濾 run_id 參數，可選 spatial_eps_05/10/20/spatial_hdbscan_v1），再 JOIN `spatial_clusters` 取 `centroid_lon, centroid_lat, cluster_size`。
>
> **`GET /village/semantic-structure/{village_id}`** — 查 `village_semantic_structure`（`semantic_sequence, sequence_length, has_modifier, has_head, has_settlement`），解析修飾語-中心語-聚落的三段結構。
>
> **`GET /village/ngrams/{village_id}`** — 先從 `广东省自然村_预处理` 以 ROWID 取村名，再查 `village_ngrams`（`村委会, 自然村, bigrams, trigrams, prefix_bigram, suffix_bigram`），先嘗試 `自然村 + 村委会` 精確匹配，失敗則退回僅 `自然村` 名匹配。
>
> 特徵向量端點（`/features`）返回三組向量：`semantic`（9 大語義類別分佈）、`morphology`（形態學特徵，基於高頻後綴 N-gram）、`diversity`（字符多樣性指標）。

---

## Module 2 — 字符分析

**路由：** `/villagesML?module=character`
**組件目錄：** `src/components/villagesML/character/`

---

### 2.1 頻率傾向 `frequency`

**功能：** 統計全局及各地區字符使用頻率，以 Z-score 衡量某字符在某地區的傾向性偏差（高於/低於預期），可視化為熱圖。

**可視化：** `TendencyHeatmapPanel.vue` — ECharts 熱圖，X 軸為字符，Y 軸為地區，顏色深淺表示傾向強度；支持切換指標（Z-Score / Log Odds / Lift）。

**交互：**
- 地區層級切換（市/縣/鎮）
- 字符 Top-K 數量調節
- 指標類型切換（Z-Score、Log Odds、Lift）

| 函數 | 端點 | 主要參數 |
|------|------|---------|
| `getGlobalCharFrequency` | `GET /api/villages/character/frequency/global` | `top_k` |
| `getRegionalCharFrequency` | `GET /api/villages/character/frequency/regional` | `region_level`, `city`, `county`, `township`, `top_k` |
| `getCharTendency` | `GET /api/villages/character/tendency/by-region` | `region_level`, `top_k` |
| `getCharTendencyByChar` | `GET /api/villages/character/tendency/by-char` | `char`, `region_level` |

> **後端實現：**
>
> **`GET /character/frequency/global`** — 直接查預計算表 `char_frequency_global`，列：`char, frequency, village_count, rank`，ORDER BY `frequency DESC`，支持 `top_n`（1–1000）和 `min_frequency` 過濾。數據完全預計算，無實時聚合。
>
> **`GET /character/frequency/regional`** — 查預計算表 `char_regional_analysis`，列：`region_level, region_name, city, county, township, char, frequency, village_count, rank_within_region`。支持兩種過濾模式：`region_name` 模糊匹配（LIKE），或 `city/county/township` 三級精確匹配（= 等值）。以 `rank_within_region` 排序後取 top_n。
>
> **`GET /character/tendency/by-region`** — 同樣查 `char_regional_analysis`，額外返回預計算的三個傾向指標：
> - **Z-score**：`(頻率 - 全局期望頻率) / 標準差`，衡量偏差的標準化值
> - **Lift**：`P(字符|地區) / P(字符|全局)`，>1 表示偏好，<1 表示迴避
> - **Log-odds**：`log(P/(1-P)) - log(Q/(1-Q))`，對數優勢比
>
> 前端熱圖直接使用這三列，按 `sort_by` 參數指定排序字段（z_score | lift | log_odds）。
>
> **`GET /character/tendency/by-char`** — 查 `char_regional_analysis`（WHERE `char = ?`），再 JOIN `广东省自然村_预处理` 計算各地區質心坐標：`AVG(longitude) AS centroid_lon, AVG(latitude) AS centroid_lat` GROUP BY 地區字段，供前端地圖渲染。

---

### 2.2 嵌入相似 `embeddings`

**功能：** 查詢某字符的 Embedding 向量，並搜尋語義最相似的字符（Cosine 相似度），可用於探索地名中字符的語義關聯。

**可視化：** `CharacterEmbeddings.vue` — 相似字符列表，可擴展展示 t-SNE 散點圖。

**交互：**
- 字符輸入框
- Top-K 相似字符數量（默認 10）
- 最小相似度門檻（`min_similarity`）
- 嵌入列表分頁瀏覽

| 函數 | 端點 | 主要參數 |
|------|------|---------|
| `getCharEmbeddingsList` | `GET /api/villages/character/embeddings/list` | `limit`, `offset` |
| `getCharEmbeddingVector` | `GET /api/villages/character/embeddings/vector` | `char` |
| `getCharSimilarities` | `GET /api/villages/character/embeddings/similarities` | `char`, `top_k`, `min_similarity` |

> **後端實現：**
>
> **Embedding 模型：** 使用 **Word2Vec Skipgram**（自訓練），向量維度 **100 維**，詞彙量 3,067 字符，Run ID 固定為 `embed_final_001`。訓練語料為 285,860 條廣東省自然村地名，以字符為最小單元訓練。
>
> **`GET /character/embeddings/vector`** — 查 `char_embeddings` 表（`run_id, char, embedding_vector, char_frequency`），WHERE `char = ? AND run_id = 'embed_final_001'`。`embedding_vector` 列存為 JSON 字符串，服務層解析為 `float[]` 後返回，維度固定 **100**。
>
> **`GET /character/embeddings/similarities`** — 查預計算的 `char_similarity` 表（`run_id, char1, char2, cosine_similarity, rank`），WHERE `char1 = ? AND run_id = 'embed_final_001'`，按 `cosine_similarity DESC` 取 top_k，可附加 `min_similarity` 閾值過濾。相似度已在批處理時全量預計算並存入表中，無實時向量計算。
>
> **`GET /character/embeddings/list`** — 先 COUNT(*) FROM `char_embeddings` 取總數，再 SELECT `char, char_frequency, 100 AS vector_dim` LIMIT/OFFSET 分頁，返回 `embeddings, total, page, page_size`。

---

### 2.3 字符網絡 `network`

**功能：** 計算字符共現矩陣，構建字符共現語義網絡圖，支持社群識別（Community Detection）和中心性分析。

**可視化：** `CharacterNetwork.vue` — ECharts 力導向網絡圖，節點大小反映中心性，邊粗細反映共現強度，顏色表示社群。

**交互：**
- 最小共現次數過濾（`min_cooccurrence`）
- 最小邊權重（`min_edge_weight` 0–10）
- 中心性指標選擇（度中心性/介數中心性/接近中心性/特徵向量中心性）
- 地區過濾
- 異步任務進度追蹤

| 函數 | 端點 | 主要參數 |
|------|------|---------|
| `getCooccurrence` | `GET /api/villages/compute/semantic/cooccurrence` | `min_cooccurrence`, `alpha`（顯著性水平） |
| `getSemanticNetwork` | `POST /api/villages/compute/semantic/network` | `region_level`, `city/county/township`, `min_edge_weight`, `centrality_metrics[]` |
| `getSemanticNetworkStatus` | `GET /api/villages/compute/semantic/network/status/{taskId}` | — |

> **後端說明：** 網絡構建為異步任務，需返回 `task_id` 供輪詢進度。返回格式為 `{ nodes: [{ id, label, centrality }], edges: [{ source, target, weight }], communities: [] }`。社群識別算法（Louvain/Girvan-Newman 等）請補充說明。

---

### 2.4 顯著性 `significance`

**功能：** 對字符在各地區分佈進行卡方檢驗，判斷字符偏好是否統計顯著，輸出 p 值和效應量（Effect Size）。

**可視化：** `CharacterSignificance.vue` — 顯著性熱圖，標記 `***`（p<0.001）、`**`（p<0.01）、`*`（p<0.05）、`n.s.`。

**交互：**
- 字符查詢（某字在哪些地區顯著）
- 地區查詢（某地區哪些字符顯著）
- 地區層級切換
- Top-K 結果數量

| 函數 | 端點 | 主要參數 |
|------|------|---------|
| `getCharSignificanceByChar` | `GET /api/villages/character/significance/by-character` | `char`, `region_level` |
| `getCharSignificanceByRegion` | `GET /api/villages/character/significance/by-region` | `region_level`, `city/county/township`, `top_k` |
| `getCharSignificanceSummary` | `GET /api/villages/character/significance/summary` | `region_level` |

> **後端實現：**
>
> **算法：卡方檢驗（Chi-square Test of Independence）**，在字符-地區列聯表上執行，所有結果預計算後存入 `tendency_significance` 表，Run ID 由 `run_id_manager.get_active_run_id("char_significance")` 動態取得。
>
> **`GET /character/significance/by-character`** — 查 `tendency_significance`（`char, region_name, chi_square_statistic, p_value, is_significant, effect_size`），WHERE `char = ? AND region_level = ?`，可附加 `min_zscore` 過濾。返回各地區的顯著性結果，`effect_size` 為 **Cramér's V**（衡量關聯強度，0–1）。
>
> **`GET /character/significance/by-region`** — 同表查詢，WHERE `region_name = ?`，加 `significance_only=true` 時附加 `AND p_value < 0.05`，ORDER BY `ABS(chi_square_statistic) DESC` 取 top_k。
>
> **`GET /character/significance/summary`** — 在 `tendency_significance` 上做聚合：`COUNT(DISTINCT char), COUNT(DISTINCT region_name), SUM(is_significant), AVG(ABS(chi_square_statistic)), MAX(ABS(chi_square_statistic))`，返回全局顯著性統計摘要。
>
> **自由度：** df = (字符種類數 - 1) × (地區數 - 1)，按地區層級（市/縣/鎮）分別計算。

---

## Module 3 — 語義分析

**路由：** `/villagesML?module=semantic`
**組件目錄：** `src/components/villagesML/semantic/`

語義分析體系以 **9 大語義類別 + 40+ 精細子類** 為核心（見 [語義類別完整清單](#語義類別完整清單)）。

---

### 3.1 類別標籤 `categories`

**功能：** 展示 9 大語義類別的全局分佈（Virtual Term Frequency），並支持按地區查詢各類別的 Z-score 傾向偏差。

**可視化：** 9 個分類卡片，每張卡片含 VTF 柱狀圖（全局）+ 區域 VTF 對比；傾向排行榜（地區 × 類別 Z-score 熱圖）。

**交互：**
- 地區層級 + 地區名稱選擇
- VTF Top-K 數量調節
- 類別詳情展開

| 函數 | 端點 | 主要參數 |
|------|------|---------|
| `getSemanticCategoryList` | `GET /api/villages/semantic/category/list` | — |
| `getSemanticVTFGlobal` | `GET /api/villages/semantic/category/vtf/global` | `top_k` |
| `getSemanticVTFRegional` | `GET /api/villages/semantic/category/vtf/regional` | `region_level`, `city/county/township`, `top_k` |
| `getSemanticCategoryTendency` | `GET /api/villages/semantic/category/tendency` | `region_level`, `city/county/township` |
| `getSemanticLabelCategories` | `GET /api/villages/semantic/labels/categories` | — |
| `getSemanticLabelsByCategory` | `GET /api/villages/semantic/labels/by-category` | `category` |
| `getSemanticLabelsByChar` | `GET /api/villages/semantic/labels/by-character` | `char` |

> **後端實現：**
>
> **VTF（Virtual Term Frequency）定義：** 語義類別在地名語料中的加權出現強度，計算方式為：字符所屬語義類別的出現次數，按語義標籤的置信度（`confidence`）加權匯總。字符通過 `semantic_labels` 表（LLM 標注）映射到語義類別，每個字符可多標籤，置信度加權後累加即為該類別的 VTF。
>
> **`GET /semantic/category/list`** — 查 `semantic_vtf_global` GROUP BY `category`，返回類別列表和每類字符數。
>
> **`GET /semantic/category/vtf/global`** — 查 `semantic_vtf_global`（`category, frequency AS vtf, vtf_count`），可附加 `category` 過濾，返回全局各語義類別的 VTF 值。
>
> **`GET /semantic/category/vtf/regional`** — 查 `semantic_regional_analysis`（`region_level, region_name, city, county, township, category, frequency AS vtf, lift, z_score`），支持三級地區精確匹配或 `region_name` 模糊匹配。
>
> **`GET /semantic/category/tendency`** — 同查 `semantic_regional_analysis`，ORDER BY `z_score DESC` 取 top_n，返回各地區 9 大語義類別的傾向排行（Z-score）。
>
> **`GET /semantic/labels/categories`** — 查 `semantic_labels` GROUP BY `semantic_category`，計算 `COUNT(*) AS character_count, AVG(confidence) AS avg_confidence`，按 character_count 倒序。
>
> **`GET /semantic/labels/by-category`** — 查 `semantic_labels`（`char, semantic_category, confidence, llm_explanation`），WHERE `semantic_category = ?`，可附加 `min_confidence` 閾值，LIMIT 500。
>
> **`GET /semantic/labels/by-character`** — 查 `semantic_labels` WHERE `char = ?`，返回該字符的所有語義標籤及置信度，列含 `llm_explanation`（LLM 生成的語義解釋）。

---

### 3.2 組合模式 `composition`

**功能：** 分析村名在語義類別層面的構詞組合規律，使用 Bigram/Trigram 統計相鄰類別的共現頻率，並以 PMI（逐點互信息）量化類別間的組合關聯強度。

**可視化：** Bigram 表格（頻率 + 百分比 + PMI 分數）+ Trigram 表格；支持細緻模式（40+ 子類）和粗略模式（9 大類）切換。

**交互：**
- 最小頻率過濾（`min_frequency`）
- 分類粒度切換（細緻 / 粗略）
- 詞典參考 Modal

| 函數 | 端點 | 主要參數 |
|------|------|---------|
| `getSemanticCompositionPatterns` | `GET /api/villages/semantic/composition/patterns` | `min_frequency`, `limit` |
| `getSemanticBigrams` | `GET /api/villages/semantic/composition/bigrams` | `min_frequency`, `limit` |
| `getSemanticTrigrams` | `GET /api/villages/semantic/composition/trigrams` | `min_frequency`, `limit` |
| `getSemanticPMI` | `GET /api/villages/semantic/composition/pmi` | — |

> **後端實現：**
>
> **PMI 算法：** Pointwise Mutual Information，公式 `PMI(A,B) = log₂[P(A,B) / (P(A)·P(B))]`。`P(A,B)` 為類別 A 和 B 在同一村名中共現的概率，`P(A)` 和 `P(B)` 為各類別的邊際概率，全部預計算存表。
>
> **`GET /semantic/composition/bigrams`** — 查 `semantic_bigrams`（普通模式，9 大類）或 `semantic_bigrams_detailed`（細緻模式，76 子類），列：`category1, category2, frequency, percentage, pmi AS pmi_score`。`detail=true` 時使用 `_detailed` 後綴表，`min_frequency` 和 `min_pmi`（默認 0.3）雙重過濾。
>
> **`GET /semantic/composition/trigrams`** — 查 `semantic_trigrams` 或 `semantic_trigrams_detailed`，列：`category1, category2, category3, frequency, percentage`，三元語義組合序列。
>
> **`GET /semantic/composition/pmi`** — 查 `semantic_pmi` 或 `semantic_pmi_detailed`，支持 `category1/category2` 過濾和 `min_pmi` 閾值，返回字段含 `is_positive`（PMI > 0 為正相關）。
>
> **`GET /semantic/composition/patterns`** — 查 `semantic_composition_patterns` 或 `semantic_composition_patterns_detailed`，列：`pattern, pattern_type, modifier, head, frequency, percentage, description`。`pattern` 參數支持通配符：`*` 轉為 SQL `%`，`X` 轉為 `_`，實現靈活模糊匹配。`modifier` 表示修飾成分類別，`head` 表示中心成分類別（如 "水系-聚落" 中 modifier=水系，head=聚落）。

---

### 3.3 N-gram 分析 `ngrams`

**功能：** 從村名字符層面進行 N-gram（n=2-4）切分，統計全局頻率，並按位置（前綴/中間/後綴）分析字符串規律，支持通配符模式匹配（`*`）。

**可視化：** N-gram 頻率表格（分 n 值和位置），模式搜尋結果列表。

**交互：**
- N 值選擇（2/3/4）
- 位置過濾（全部/前綴/中間/後綴）
- Top-K 數量
- 通配符搜尋（如 `*村`、`老*`）
- 地區篩選

位置標籤映射：

| 位置代碼 | 中文 |
|---------|------|
| `prefix` | 前綴 |
| `middle` | 中間 |
| `suffix` | 後綴 |
| `prefix-suffix` | 前後綴 |
| `prefix-middle` | 前中 |
| `middle-suffix` | 中後 |
| `prefix-middle-suffix` | 前中後 |

| 函數 | 端點 | 主要參數 |
|------|------|---------|
| `getNgramFrequency` | `GET /api/villages/ngrams/frequency` | `n`, `top_k`, `min_frequency`, `position` |
| `getNgramPatterns` | `GET /api/villages/ngrams/patterns` | `pattern`（支持 `*`），`n` |
| `getNgramRegional` | `GET /api/villages/ngrams/regional` | `n`, `region_level`, `city/county/township`, `top_k` |
| `getNgramTendency` | `GET /api/villages/ngrams/tendency` | `ngram`, `region_level`, `city/county/township`, `min_tendency`, `limit` |
| `getNgramSignificance` | `GET /api/villages/ngrams/significance` | `ngram`, `region_level` |

> **後端實現：**
>
> **`GET /ngrams/frequency`** — 查預計算表 `ngram_frequency`（`ngram, position, frequency, percentage`），WHERE `n = LENGTH(ngram)` 且 `position IN (...)` 過濾，ORDER BY `frequency DESC` 取 top_k。位置標籤即存儲在 `position` 列（prefix/middle/suffix/prefix-suffix 等組合值）。
>
> **`GET /ngrams/regional`** — 查 `regional_ngram_frequency` 表（township 粒度預計算）。若前端請求 county 或 city 聚合，服務層實時執行 `SUM(frequency) GROUP BY county/city, ngram` 再計算百分比，並在返回元數據（`return_metadata=true`）中標注「已在縣/市級別聚合」。
>
> **`GET /ngrams/patterns`** — 查 `structural_patterns`（`pattern, pattern_type, n, position, frequency, example`），支持通配符：`*` → SQL `%`，`X` → SQL `_`，自動轉換後執行 LIKE 查詢。
>
> **`GET /ngrams/tendency`** — 查 `ngram_tendency`（`ngram, n, position, lift, log_odds, z_score, regional_count, regional_total, regional_total_raw, global_count, global_total`），縣/市級別按以下公式實時聚合 Lift：
> ```
> lift = (SUM(regional_count) / SUM(regional_total_raw))
>       / (SUM(global_count) / SUM(global_total))
> ```
> 再 LEFT JOIN `regional_centroids` 表取各地區 `centroid_lon, centroid_lat`（預計算地區質心坐標），供地圖渲染。`tendency_score > 1` 表示偏好，`< 1` 表示迴避。
>
> **`GET /ngrams/significance`** — 查 `ngram_significance`（`ngram, n, position, chi2 AS z_score, p_value, is_significant, cramers_v AS lift`），執行了字符 N-gram 在各地區分佈的卡方獨立性檢驗，`cramers_v` 為效應量。

---

### 3.4 語義指數 `indices`

**功能：** 計算並展示各地區的語義豐富度、偏態等宏觀指數，反映地名語義構成的整體特徵。

| 函數 | 端點 | 主要參數 |
|------|------|---------|
| `getSemanticIndices` | `GET /api/villages/semantic/indices` | `region_level`, `city/county/township` |

> **後端實現：**
>
> **`GET /semantic/indices`** — 查 `semantic_indices`（普通，9 大類）或 `semantic_indices_detailed`（76 子類），列：`region_level, region_name, category, raw_intensity, normalized_index, rank_within_province, village_count`。支持 `category` 過濾和 `min_villages` 最小村莊數閾值。
>
> 各指數定義：
> - **raw_intensity**：類別 VTF 之和（原始強度）
> - **normalized_index**：`raw_intensity / MAX(raw_intensity) * 100`，省內相對排名 0–100
> - **Shannon Entropy**：`-Σ p_i * log(p_i)`（各地區 9 類分佈的信息熵，反映語義豐富程度）
> - **Simpson 多樣性指數**：`1 - Σ p_i²`（類別分佈均勻度，0–1）
> - **rank_within_province**：按 `normalized_index` 在全省同地區層級排名

---

### 3.5 語義網絡 `network`

同 [2.3 字符網絡](#23-字符網絡-network)，但在語義類別層面構建共現網絡（節點為類別，邊為類別共現強度）。

---

### 3.6 子類別分析 `subcategories`

**功能：** 在 40+ 精細子類層面（如 `mountain_peak`、`water_stream`、`clan_he`）分析各地區的偏好傾向，支持子類的 VTF 全局/區域對比及 Z-score 傾向排行。

**可視化：** 父類別 → 子類別 二級選擇器，VTF 柱狀圖，傾向 Top-N 排行表，地區對比分析。

**交互：**
- 父類別過濾（9 大類）
- 子類別選擇
- 地區層級 + 地區名選擇
- 多地區對比模式

| 函數 | 端點 | 主要參數 |
|------|------|---------|
| `getSemanticSubcategoryList` | `GET /api/villages/semantic/subcategory/list` | `parent_category` |
| `getSemanticSubcategoryChars` | `GET /api/villages/semantic/subcategory/chars/{subcategory}` | — |
| `getSemanticSubcategoryVTFGlobal` | `GET /api/villages/semantic/subcategory/vtf/global` | `subcategory`, `top_k` |
| `getSemanticSubcategoryVTFRegional` | `GET /api/villages/semantic/subcategory/vtf/regional` | `subcategory`, `region_level`, `city/county/township` |
| `getSemanticSubcategoryTendencyTop` | `GET /api/villages/semantic/subcategory/tendency/top` | `subcategory`, `region_level`, `top_k` |
| `getSemanticSubcategoryComparison` | `GET /api/villages/semantic/subcategory/comparison` | `subcategory`, `region_level`, `regions[]` |

---

## Module 4 — 空間分析

**路由：** `/villagesML?module=spatial`
**組件目錄：** `src/components/villagesML/spatial/`
**地圖技術：** MapLibre GL 5.16（GPU Symbol Layer，零 DOM 標記）

---

### 4.1 空間熱點 `hotspots`

**功能：** 識別村莊地理分佈中的高密度聚集熱點，展示各熱點的中心坐標、半徑、包含村莊數，並可查看熱點內村莊列表。

**可視化：** `HotspotMap.vue` — MapLibre 地圖，熱點以圓形標記顯示；熱點列表卡片（中心坐標、半徑 km、村莊數）。

**交互：**
- 地圖縮放/拖動
- 點擊熱點查看村莊列表
- 地圖樣式切換（高德 / OSM）

| 函數 | 端點 | 主要參數 |
|------|------|---------|
| `getSpatialHotspots` | `GET /api/villages/spatial/hotspots` | — |
| `getSpatialHotspotDetail` | `GET /api/villages/spatial/hotspots/{hotspotId}` | — |

> **後端實現：**
>
> **算法：KDE（Kernel Density Estimation，核密度估計）**，使用高斯核函數在地理坐標空間上計算村莊密度，識別高密度峰值點作為熱點，結果全量預計算存入 `spatial_hotspots` 表。
>
> **`GET /spatial/hotspots`** — 查 `spatial_hotspots`（`hotspot_id, center_lon, center_lat, density_score, village_count, radius_km`），可附加 `min_density` 和 `min_village_count` 閾值過濾，按 `density_score DESC` 排序。
>
> **`GET /spatial/hotspots/{hotspot_id}`** — 同表按 `hotspot_id = ?` 取單條詳情記錄。

---

### 4.2 空間聚類 `clusters`

**功能：** 展示預計算的地理空間聚類結果，支持多輪次（run_id）切換，以地圖和表格雙視圖呈現各聚類的地理範圍、規模、噪聲點情況。

**可視化：** `SpatialMap.vue` — 聚類著色地圖；聚類摘要表（聚類 ID、大小、質心坐標、平均半徑 km）。

**支持的預計算聚類方案：**

| run_id | 中文標籤 | 說明 |
|--------|---------|------|
| `spatial_eps_05` | 超密集核心聚類 | 小半徑 DBSCAN |
| `spatial_hdbscan_v1` | 自動多密度聚類 | **默認**，HDBSCAN |
| `spatial_eps_10` | 標準密度聚類 | 中等半徑 DBSCAN |
| `spatial_eps_20` | 全域覆蓋聚類 | 大半徑 DBSCAN |

**交互：**
- 聚類方案（run_id）切換
- 地圖聚類著色
- 點擊聚類查看詳情

| 函數 | 端點 | 主要參數 |
|------|------|---------|
| `getSpatialClusters` | `GET /api/villages/spatial/clusters` | `run_id`, `limit` |
| `getSpatialClustersAvailableRuns` | `GET /api/villages/spatial/clusters/available-runs` | — |
| `getSpatialClustersSummary` | `GET /api/villages/spatial/clusters/summary` | `run_id` |

> **後端實現：**
>
> **四套預計算聚類方案：**
>
> | run_id | 算法 | 主要參數 | 說明 |
> |--------|------|---------|------|
> | `spatial_eps_05` | DBSCAN | eps≈0.05°（≈5km）, min_samples=5 | 超密集核心聚類 |
> | `spatial_hdbscan_v1` | HDBSCAN | min_cluster_size=50, min_samples=10 | 自動多密度（默認） |
> | `spatial_eps_10` | DBSCAN | eps≈0.10°（≈10km）, min_samples=5 | 標準密度 |
> | `spatial_eps_20` | DBSCAN | eps≈0.20°（≈20km）, min_samples=5 | 全域覆蓋 |
>
> 所有聚類結果預計算後分別以 `run_id` 區分，存入：
> - `spatial_clusters`：聚類摘要（`cluster_id, cluster_size, centroid_lon, centroid_lat, avg_distance_km, dominant_city, dominant_county`）
> - `village_cluster_assignments`：每條村莊的聚類歸屬（`village_id, run_id, cluster_id`）
>
> **`GET /spatial/clusters`** — 查 `spatial_clusters` WHERE `run_id = ?`，可附加 `cluster_id` 和 `min_size` 過濾，`limit=0` 返回全部。若無指定 run_id 則從 `run_id_manager` 取活躍 run_id，失敗退回最新 run_id。
>
> **`GET /spatial/clusters/summary`** — 在 `spatial_clusters` 上聚合：total clusters（排除 cluster_id = -1 噪聲點）、noise points count（cluster_id = -1 的記錄）、`AVG/MIN/MAX(cluster_size)`、lon/lat 範圍（`MIN/MAX(centroid_lon/lat)`）。
>
> **`GET /spatial/clusters/available-runs`** — 查所有不重複的 run_id 及其統計（`total_records, unique_clusters, avg_cluster_size, noise_count`），標記 `is_active` 為當前活躍方案。

---

### 4.3 空間可視化 `visualization`

**功能：** 基於空間聚類數據渲染全省地圖，支持按聚類著色、點密度顯示、全屏切換。

**可視化：** `SpatialMap.vue` — 使用 MapLibre GeoJSON Source + Symbol Layer，支持高德底圖和 OSM 底圖。

> **後端說明：** 可視化數據源複用空間聚類端點，無額外端點。

---

### 4.4 空間整合 `integration`

**功能：** 交叉分析「字符」與「地理空間聚類」的關聯：
- 查詢某字符在哪些地理聚類中高發（字符 → 聚類）
- 查詢某地理聚類有哪些特征字符（聚類 → 字符）
- 計算「空間相干性」（Spatial Coherence）指標，衡量字符分佈的地理集中度

**可視化：** 雙向查詢結果表格；空間相干性分佈圖；聚類 × 字符傾向矩陣。

**交互：**
- 查詢模式切換（按字符 / 按聚類 / 總覽）
- 最小聚類規模過濾（`min_cluster_size`）
- 最小空間相干性門檻（`min_spatial_coherence`，0–1）
- 統計顯著性過濾開關

| 函數 | 端點 | 主要參數 |
|------|------|---------|
| `getSpatialIntegration` | `GET /api/villages/spatial/integration` | `run_id`, `character`, `cluster_id`, `min_cluster_size`, `min_spatial_coherence`, `is_significant`, `limit` |
| `getSpatialIntegrationByChar` | `GET /api/villages/spatial/integration/by-character/{char}` | `run_id` |
| `getSpatialIntegrationByCluster` | `GET /api/villages/spatial/integration/by-cluster/{clusterId}` | `run_id` |
| `getSpatialIntegrationAvailableCharacters` | `GET /api/villages/spatial/integration/available-characters` | — |
| `getSpatialIntegrationClusterList` | `GET /api/villages/spatial/integration/clusterlist` | `run_id` |
| `getSpatialIntegrationSummary` | `GET /api/villages/spatial/integration/summary` | `run_id` |

> **後端實現：**
>
> **空間相干性（Spatial Coherence）算法：** 衡量某字符的地理使用集中程度。計算方式：以各聚類中含該字符的村莊比例為權重，計算加權聚類集中度，公式近似 `1 - H / H_max`（H 為分佈熵，H_max 為完全均勻分散時的最大熵），取值 [0,1]，1 = 完全集中在單一聚類，0 = 完全均勻分散。
>
> **顯著性檢驗：Mann-Whitney U 檢驗（非參數檢驗）** — 比較「聚類內含該字符的村莊」與「聚類內不含該字符的村莊」的傾向分數分佈差異，計算 `u_statistic` 和 `p_value`，`is_significant = (p_value < 0.05)`。
>
> **`GET /spatial/integration`** — 查預計算表 `spatial_tendency_integration`，列：
> - `character, cluster_id`：字符與聚類 ID
> - `cluster_tendency_mean, cluster_tendency_std`：聚類內該字符傾向均值和標準差
> - `global_tendency_mean`：全局傾向均值（用於對比）
> - `tendency_deviation`：聚類均值 - 全局均值
> - `spatial_coherence`：空間集中度 [0,1]
> - `spatial_specificity`：字符對該聚類的唯一性（聚類內佔比）
> - `is_significant, p_value, u_statistic`：Mann-Whitney U 檢驗結果
>
> 可附加 `min_cluster_size, min_spatial_coherence, is_significant` 過濾，JOIN `spatial_clusters` 取 `dominant_city`。
>
> **`GET /spatial/integration/by-character/{character}`** — 同表 WHERE `character = ?`，返回該字符在所有聚類的分佈結果（附加 `min_spatial_coherence` 過濾）。
>
> **`GET /spatial/integration/by-cluster/{cluster_id}`** — WHERE `cluster_id = ?`，返回該聚類的特徵字符列表（附加 `min_tendency` 過濾）。
>
> **`GET /spatial/integration/summary`** — 三組聚合統計：①總覽（記錄數、唯一字符數、唯一聚類數）；②字符排行（按 `AVG(spatial_coherence) DESC` 取 top10）；③聚類排行（按字符數 DESC 取 top10）。
>
> **`GET /spatial/integration/available-characters`** — 查所有已計算的字符列表及統計，避免前端查詢不存在的字符。
>
> **`GET /spatial/integration/clusterlist`** — 查聚類列表附加 `character_count, avg_spatial_coherence`，支持 `min_cluster_size` 過濾。

---

## Module 5 — 模式分析

**路由：** `/villagesML?module=pattern`
**組件目錄：** `src/components/villagesML/pattern/`

---

### 5.1 頻率分析 `frequency`

**功能：** 統計全局及區域命名模式的出現頻率，模式以結構標記表示（如「修飾-中心」、「中心-方位」）。

| 函數 | 端點 | 主要參數 |
|------|------|---------|
| `getPatternFrequencyGlobal` | `GET /api/villages/patterns/frequency/global` | `top_k`, `min_frequency` |
| `getPatternFrequencyRegional` | `GET /api/villages/patterns/frequency/regional` | `region_level`, `city/county/township`, `top_k` |

---

### 5.2 結構分析 `structural`

**功能：** 解析村名的語法結構，按角色（中心詞/修飾語/並列/動賓等）分類統計，並給出例子。

命名結構角色映射：

| 代碼 | 中文 | 說明 |
|------|------|------|
| `head` | 中心 | 核心語義成分（如 "村"、"坑"） |
| `modifier` | 修飾 | 限定修飾成分（如 "老"、"大"） |
| `coordinate` | 並列 | 並列結構（如 "東西"） |
| `verb` | 動 | 動詞成分 |
| `object` | 賓 | 賓語成分 |
| `subject` | 主 | 主語成分 |
| `predicate` | 謂 | 謂語成分 |
| `other` | 其他 | — |

| 函數 | 端點 | 主要參數 |
|------|------|---------|
| `getPatternStructural` | `GET /api/villages/patterns/structural` | `pattern_type` |

---

### 5.3 傾向性分析 `tendency`

**功能：** 分析各地區對某命名模式的偏好強度（Z-score），揭示不同地區的命名風格差異。

| 函數 | 端點 | 主要參數 |
|------|------|---------|
| `getPatternTendency` | `GET /api/villages/patterns/tendency` | `pattern`, `region_level`, `city/county/township` |

---

### 5.4 N-gram 探索 `ngram-explore`

**功能：** 交互式探索特定 N-gram 在各地區的分佈，支持通配符匹配（如 `*塘`），發現地域性命名習慣。

複用 [3.3 N-gram 分析](#33-n-gram-分析-ngrams) 的端點，側重交互式探索。

---

### 5.5 N-gram 統計 `ngram-stats`

**功能：** 展示全局 N-gram 顯著性統計彙總。

| 函數 | 端點 | 主要參數 |
|------|------|---------|
| `getNgramStatistics` | `GET /api/villages/statistics/ngrams` | — |

---

## Module 6 — 區域分析

**路由：** `/villagesML?module=regional`
**組件目錄：** `src/components/villagesML/regional/`

---

### 6.1 聚合統計 `aggregates`

**功能：** 按市/縣/鎮三級行政區統計各地區的村莊數量、語義類別分佈、字符使用情況等彙總指標；同時支持基於 GeoJSON 的空間聚合展示（可疊加到地圖）。

**可視化：** 統計卡片（村莊總數、字符種類、語義分佈）；ECharts 柱狀圖對比；MapLibre 地圖空間聚合層。

| 函數 | 端點 | 主要參數 |
|------|------|---------|
| `getRegionalAggregatesCity` | `GET /api/villages/regional/aggregates/city` | `city_name` |
| `getRegionalAggregatesCounty` | `GET /api/villages/regional/aggregates/county` | `city_name`, `county_name` |
| `getRegionalAggregatesTown` | `GET /api/villages/regional/aggregates/town` | `town_name`, `county_name`, `limit` |
| `getRegionalSpatialAggregates` | `GET /api/villages/regional/spatial-aggregates` | `region_level`, `region_name`, `limit` |
| `getRegionalVectors` | `GET /api/villages/regional/vectors` | `region_name`, `limit` |

> **後端實現：**
>
> **`GET /regional/aggregates/city`** — 查 `广东省自然村` GROUP BY `市级`，取 `COUNT(*) AS village_count`，再 JOIN `semantic_indices` 取各語義類別的 `normalized_index`，計算 `AVG(name_length)` 等字符統計。返回 `semantic_categories` 字典（9 大類計數）和 `statistics` 字典（字符多樣性、平均村名長度等）。
>
> **`GET /regional/aggregates/county`** — 同上，GROUP BY `市级, 区县级`，附加 `city_name` 過濾。
>
> **`GET /regional/aggregates/town`** — GROUP BY `市级, 区县级, 乡镇级`，附加 `county_name` 過濾，`limit` 控制返回條數。
>
> **`GET /regional/spatial-aggregates`** — 查 `spatial_clusters` JOIN `village_cluster_assignments` JOIN `广东省自然村_预处理`，以地區為粒度聚合空間聚類分佈。
>
> **`GET /regional/vectors`** — 查各地區的語義類別分佈向量（9 維，從 `semantic_regional_analysis` 取 `category, z_score`），用於後續相似度計算。

---

### 6.2 類別傾向性 `tendency`

**功能：** 計算各地區在 9 大語義類別的偏態（Z-score），識別地區的語義命名風格（如珠三角地區偏好「宗族」類，山區偏好「山地」類）。

複用 `getSemanticCategoryTendency` 端點，見 [3.1 類別標籤](#31-類別標籤-categories)。

---

### 6.3 相似度分析 `similarity`

**功能：** 三種查詢模式對地區進行語義相似度比較，基於各地區的語義特征向量計算 Cosine 或 Jaccard 距離。

**三種模式：**

**① Search 模式（找最相似地區）**
```
輸入：一個地區 + Top-K + 相似度指標
輸出：最相似的 K 個地區，含公共字符和差異字符
```

**② Pair 模式（兩地區對比）**
```
輸入：兩個地區
輸出：Cosine 相似度、Jaccard 相似度、歐氏距離、
      公共字符列表、各自特色字符列表
```

**③ Matrix 模式（多地區相似矩陣）**
```
輸入：多個地區列表 + 指標
輸出：N×N 相似度矩陣，ECharts 熱圖展示
```

| 函數 | 端點 | 主要參數 |
|------|------|---------|
| `getRegionSimilaritySearch` | `GET /api/villages/regions/similarity/search` | `region_level`, `city/county/township`, `top_k`, `metric` (cosine\|jaccard), `min_similarity` |
| `getRegionSimilarityPair` | `GET /api/villages/regions/similarity/pair` | `region_level`, `city1/county1/township1`, `city2/county2/township2` |
| `getRegionSimilarityMatrix` | `GET /api/villages/regions/similarity/matrix` | `region_level`, `regions[]` ({city, county, township}), `metric` |

> **後端實現：**
>
> **特征向量：** 9 維語義類別分佈向量（各類別 Z-score），從 `semantic_regional_analysis` 取 `category, z_score` 構建，9 個類別按固定順序排列。
>
> **`GET /regions/similarity/search`** — 查詢地區 A 的語義向量，遍歷所有同層級地區，計算：
> - **Cosine 相似度**：`dot(A,B) / (||A|| · ||B||)`
> - **Jaccard 相似度**：基於字符集合，`|A∩B| / |A∪B|`（取出現 z_score > 0 的字符集合）
>
> 按指定 `metric` 排序，取 top_k，附加 `common_chars`（公共高頻字符）和 `distinct_chars`（各自特色字符）。
>
> **`GET /regions/similarity/pair`** — 查詢兩個地區各自的語義向量，同時計算 Cosine 相似度、Jaccard 相似度、歐氏距離（`sqrt(Σ(a_i - b_i)²)`），返回公共字符列表和各自特色字符列表。
>
> **`GET /regions/similarity/matrix`** — 批量查詢 N 個地區的向量，兩兩計算相似度，返回 N×N 矩陣（字典格式：`{region_i: {region_j: score}}`），前端以 ECharts 熱圖渲染。

---

## Module 7 — ML計算

**路由：** `/villagesML?module=compute`
**組件目錄：** `src/components/villagesML/ml/clustering/`
**訪問限制：** 需登錄（`ensureAuthenticated`）

---

### 通用聚類參數

所有聚類類型共享以下前端設置面板：

**算法選擇（`AlgorithmSelector.vue`）：**

| 算法 | 參數 | 說明 |
|------|------|------|
| K-Means | `k`（默認 5，範圍 2–20） | 質心聚類 |
| DBSCAN | `eps` + `min_samples` | 密度聚類，可識別噪聲點 |
| GMM | `k`（默認 5） | 高斯混合模型 |

**特征選擇（`FeatureToggles.vue`）：**

| 特征組 | 參數 | 說明 |
|--------|------|------|
| 語義特征 | `use_semantic: true` | 9 類語義分佈向量 |
| 形態特征 | `use_morphology: true` + `top_n_suffix2/3` | 後綴 N-gram（二元/三元，10–500 個） |
| 多樣性特征 | `use_diversity: true` | 字符種類多樣性指標 |

**預處理（`PreprocessingSettings.vue`）：**
- PCA 降維（默認 50 個主成分）
- 標準化（Standardization）

---

### 7.1 基礎聚類 `clustering`

**功能：** 以自然村為單位，基於可配置特征向量進行聚類（K-means/DBSCAN/GMM）。支持 k 值掃描（自動找最優 k）、異步任務進度追蹤、結果緩存管理。

**可視化：** `ClusteringResultsPanel.vue` — ECharts 散點圖（PCA 降維後 2D 可視化）；輪廓係數（Silhouette Score）折線圖（k 值掃描）；各聚類統計表。

**交互：**
- 算法 + 特征 + 預處理完整配置
- 單次聚類 vs k 值掃描模式
- 任務進度輪詢
- 緩存清理

| 函數 | 端點 | 主要參數 |
|------|------|---------|
| `runClustering` | `POST /api/villages/compute/clustering/run` | `algorithm`, `k/eps/min_samples`, `use_semantic/morphology/diversity`, `pca_n_components`, `standardize`, `top_n_suffix2/3` |
| `scanClustering` | `POST /api/villages/compute/clustering/scan` | 同上 + `k_min`, `k_max` |
| `getClusteringStatus` | `GET /api/villages/compute/clustering/status/{taskId}` | — |
| `getClusteringCacheStats` | `GET /api/villages/compute/clustering/cache-stats` | — |
| `clearClusteringCache` | `DELETE /api/villages/compute/clustering/cache` | — |

> **後端實現：**
>
> **執行方式：** 需登錄（`ApiLimiter` 依賴注入），在線程池（`run_in_threadpool`）中執行，單次聚類超時 **60 秒**，k 值掃描超時 **15 秒**。結果 LRU 緩存（最多 100 條，TTL 1 小時）。
>
> **特征矩陣構建流程：**
> 1. 從 `semantic_regional_analysis` 取 `category, z_score` → 9 維語義向量（`use_semantic=true`）
> 2. 從 `regional_ngram_frequency` 取 top_n_suffix2/3 個高頻後綴 N-gram 的 TF 值 → 形態特征向量（`use_morphology=true`）
> 3. 從字符頻率表計算多樣性指標（字符種類數/Shannon 熵）→ 多樣性特征（`use_diversity=true`）
> 4. 拼接特征矩陣，可選 **StandardScaler** 標準化
> 5. 可選 **PCA** 降維（`sklearn.decomposition.PCA(n_components=50)`）
>
> **聚類算法（scikit-learn 實現）：**
> - **KMeans**：`sklearn.cluster.KMeans(n_clusters=k, random_state=seed)`
> - **DBSCAN**：`sklearn.cluster.DBSCAN(eps=eps, min_samples=min_samples)`（地區坐標使用球面距離的 eps 換算）
> - **GMM**：`sklearn.mixture.GaussianMixture(n_components=k, random_state=seed)`
>
> **評估指標（三個全部計算並返回）：**
> - **Silhouette Score**：`sklearn.metrics.silhouette_score(X, labels)`，[−1,1]，越高越好
> - **Davies-Bouldin Index**：`davies_bouldin_score(X, labels)`，越低越好（類內緊湊/類間分離）
> - **Calinski-Harabasz Score**：`calinski_harabasz_score(X, labels)`，越高越好（類間方差/類內方差比值）
>
> **`POST /compute/clustering/scan`** — 遍歷 `k_range` 列表（最多 10 個 k 值）分別聚類，按 `metric` 參數指定的指標排序返回所有結果（Silhouette/CH 取最大，DB 取最小）。
>
> **`GET /compute/clustering/cache-stats`** — 返回緩存命中率、條目數、最大容量。
>
> **`DELETE /compute/clustering/cache`** — 清空 LRU 緩存（調試/刷新用）。

---

### 7.2 字符傾向聚類 `char-tendency`

**功能：** 以**地區**為分析單位（而非村莊），以各地區的字符使用傾向向量進行聚類，識別命名風格相近的地理區域群組。傾向向量支持三種構建方式（Z-score / TFIDF / PMI）。

**可視化：** 地區聚類結果地圖（MapLibre）；聚類中各地區代表性字符雷達圖。

**特有參數：**
- `top_n_chars`：選取傾向最強的前 N 個字符作為特征維度（默認 50）
- `tendency_metric`：傾向向量計算指標（z_score / tfidf / pmi）

| 函數 | 端點 | 主要參數 |
|------|------|---------|
| `runCharacterTendencyClustering` | `POST /api/villages/compute/clustering/character-tendency` | `algorithm`, `k`, `top_n_chars`, `tendency_metric`, `region_level`, `pca_n_components`, `standardize` |

> **後端實現：**
>
> **分析單元：地區（市/縣/鎮），而非單個村莊。**
>
> **三種傾向向量構建方式（`tendency_metric` 參數）：**
> - **z_score**：查 `char_regional_analysis` 的 `z_score` 列，直接作為特征值，反映該字符在地區中相對全局的標準化偏差
> - **tfidf**：`TF = 字符在地區的出現頻率；IDF = log(總地區數 / 含該字符的地區數)`，即 TF × IDF，強調稀有字符的識別能力
> - **pmi**：`log₂[P(char,region) / (P(char)·P(region))]`，互信息量，強調字符與地區的特異性關聯
>
> **特征維度：** 取全省傾向最強的 `top_n_chars` 個字符（默認 50）作為向量維度，其餘字符截斷。
>
> **後續聚類：** 同 7.1，使用選定的算法（KMeans/DBSCAN/GMM）在地區特征矩陣上聚類，結果以地區名標注，可在 MapLibre 地圖渲染各地區的聚類歸屬。

---

### 7.3 採樣村莊聚類 `sampled-villages`

**功能：** 對完整數據集進行子集採樣後再聚類，適用於探索性分析和算法調參（降低計算量）。支持三種採樣策略。

**採樣策略：**

| 策略 | 說明 |
|------|------|
| `stratified` | 分層採樣（按行政區比例） |
| `random` | 隨機採樣 |
| `systematic` | 系統採樣（等間隔） |

**特有參數：**
- `sample_size`：採樣數量（最大 5000）
- `sampling_strategy`：採樣策略

| 函數 | 端點 | 主要參數 |
|------|------|---------|
| `runSampledVillagesClustering` | `POST /api/villages/compute/clustering/sampled-villages` | `algorithm`, `k`, `sample_size`, `sampling_strategy`, `use_semantic/morphology/diversity`, `pca_n_components` |

> **後端實現：**
>
> **超時設置：120 秒**（比基礎聚類長，因採樣後再聚類仍需計算完整特征矩陣）。
>
> **三種採樣策略實現：**
> - **stratified（分層採樣）**：以行政區（`市级` 或 `区县级`）為層，按各層比例從 `广东省自然村_预处理` 中等比例隨機抽取，保留地域代表性
> - **random（隨機採樣）**：`SELECT ... FROM 广东省自然村_预处理 ORDER BY RANDOM() LIMIT sample_size`
> - **systematic（系統採樣）**：取行間隔 `step = total / sample_size`，每隔 step 取一條記錄，`WHERE ROWID % step = 0`
>
> 採樣完成後，按照 7.1 相同流程構建特征矩陣並執行聚類。`sample_size` 上限 5000 條，防止內存溢出。

---

### 7.4 空間感知聚類 `spatial-aware`

**功能：** 以預計算的空間聚類結果（`spatial_run_id`）為輸入，在空間聚類標籤基礎上疊加語義特征進行二次聚類（Double Clustering），識別「地理位置相近且命名風格相似」的村莊群組。

**特有參數：**
- `spatial_run_id`：關聯的空間聚類方案（從 4 個預計算方案中選擇）
- 空間特征集：`semantic_profile`、`naming_patterns`、`geographic`、`cluster_size`

| 函數 | 端點 | 主要參數 |
|------|------|---------|
| `runSpatialAwareClustering` | `POST /api/villages/compute/clustering/spatial-aware` | `algorithm`, `k`, `spatial_run_id`, `features[]`, `pca_n_components` |
| `getSpatialRunIds` | `GET /api/villages/admin/run-ids` | — |

> **後端實現：**
>
> **Double Clustering（雙重聚類）流程：**
> 1. 從 `village_cluster_assignments`（WHERE `run_id = spatial_run_id`）取每個村莊的空間聚類標籤
> 2. 構建空間聚類層面的特征向量（以空間聚類為分析單元）：
>    - **semantic_profile**：該空間聚類內所有村莊的語義類別分佈（9 維均值向量）
>    - **naming_patterns**：高頻命名模式出現比例向量
>    - **geographic**：空間聚類質心坐標（centroid_lon, centroid_lat），歸一化後加入特征
>    - **cluster_size**：空間聚類的村莊數（log 縮放）
> 3. 多組特征拼接後，使用選定算法（KMeans/DBSCAN/GMM）執行二次聚類
>
> **特征融合方式：** 各特征組獨立計算後 `np.hstack()` 水平拼接，非 one-hot 編碼。地理坐標作為連續特征加入，而非空間聚類 ID。空間聚類 ID 僅用於分組聚合，不直接作為特征輸入。
>
> **`GET /admin/run-ids`** — 查詢 `village_cluster_assignments` 中所有不重複的 `run_id`，供前端選擇 `spatial_run_id` 參數。

---

### 7.5 層次聚類 `hierarchical`

**功能：** 按「市 → 縣 → 鎮」三個層次分別執行聚類，每級使用獨立的 k 值，實現多尺度的命名風格分析。可對比同一縣內各鎮的差異，或同一市內各縣的風格分群。

**特有參數：**
- `k_city`：市級聚類數（建議 3–8）
- `k_county`：縣級聚類數（建議 3–10）
- `k_township`：鎮級聚類數（建議 3–15）

**可視化：** `HierarchicalResultsPanel.vue` — 三級樹形結構展示；各級聚類在地圖上分別渲染。

| 函數 | 端點 | 主要參數 |
|------|------|---------|
| `runHierarchicalClustering` | `POST /api/villages/compute/clustering/hierarchical` | `algorithm`, `k_city`, `k_county`, `k_township`, `use_semantic/morphology/diversity`, `pca_n_components` |

> **後端實現：**
>
> **超時設置：180 秒**（三級計算量最大：市 × k_city + 縣 × k_county + 鎮 × k_township）。
>
> **分級執行流程：**
> 1. **市級**：以各市為數據單元，查 `semantic_regional_analysis` GROUP BY `市级`，構建市級語義 + 形態特征矩陣，執行 KMeans（k=k_city），得到市級聚類標籤
> 2. **縣級**：以各縣為數據單元（約 100+ 個縣），同樣查 `semantic_regional_analysis` GROUP BY `市级, 区县级`，執行 KMeans（k=k_county）
> 3. **鎮級**：以各鎮為數據單元（約 1500+ 個鎮），查 `regional_ngram_frequency` 加 `semantic_regional_analysis`，執行 KMeans（k=k_township）
>
> **返回格式：** 三層嵌套結構：
> ```json
> {
>   "city": { "cluster_id": [...members], "top_chars": [...] },
>   "county": { ... },
>   "township": { ... }
> }
> ```
> 每層包含各聚類的成員列表（地區名）和代表性字符（按傾向強度排序的 top_n 字符）。

---

## 系統信息 Dashboard

**路由：** `/villagesML?module=system`
**組件：** `Dashboard.vue` + `SystemInfo.vue`

**功能：** 系統入口和總覽頁面，展示核心統計指標和功能模組快速入口。

**統計卡片（6 個 KPI）：**

| 指標 | 說明 |
|------|------|
| 自然村總數 | 285,860 條 |
| 覆蓋城市數 | 廣東省各市 |
| 覆蓋縣區數 | — |
| 覆蓋鎮街數 | — |
| 字符種類數 | 地名中不同漢字總數 |
| N-gram 種類數 | 高頻 N-gram 總量 |

| 函數 | 端點 | 主要參數 |
|------|------|---------|
| `getMetadataOverview` | `GET /api/villages/metadata/stats/overview` | — |
| `getMetadataTables` | `GET /api/villages/metadata/stats/tables` | — |
| `getDatabaseStatistics` | `GET /api/villages/statistics/database` | — |

> **後端實現：**
>
> **`GET /metadata/stats/overview`** — 異步（`run_in_threadpool`）執行多條查詢：
> ① `SELECT COUNT(*) FROM 广东省自然村` — 村莊總數
> ② `SELECT COUNT(DISTINCT 市级), COUNT(DISTINCT 区县级), COUNT(DISTINCT 乡镇级) FROM 广东省自然村_预处理` — 三級行政區數量
> ③ `SELECT COUNT(DISTINCT char) FROM char_frequency_global` — 字符種類數
> ④ 讀取 `villages.db` 文件大小和最後修改時間（`os.path.getsize` / `os.path.getmtime`）
>
> **`GET /metadata/stats/tables`** — 異步查詢 `sqlite_master` 取所有表名，對每張表執行：`PRAGMA table_info` 取列定義，`SELECT COUNT(*) FROM table`取行數，`PRAGMA page_count` × `PRAGMA page_size` / 1024² 計算近似大小（MB），以及索引列表。
>
> **`GET /statistics/database`** — 整合多表統計匯總，包含 N-gram 種類數（從 `ngram_frequency` COUNT DISTINCT）等。

---

## 語義類別完整清單

### 9 大父類別

| 類別 ID | 中文名 | 代表字符 |
|---------|--------|---------|
| `agriculture` | 農業 | 田、地、農、牧、果、圃 |
| `clan` | 宗族 | 何、劉、吳、張、李、梁、羅、陳、黃 |
| `direction` | 方位 | 東、南、西、北、中、上、下、左、右 |
| `infrastructure` | 基建 | 驛、站、路、橋、渡、港 |
| `mountain` | 山地 | 山、嶺、峰、岡、坑、坡、崗、崖 |
| `settlement` | 聚落 | 村、莊、城、坊、屋、寨、圍、堡 |
| `symbolic` | 象徵 | 仁、義、佛、光、興、寶、福、吉 |
| `vegetation` | 植被 | 林、樹、竹、花、草、茶、松 |
| `water` | 水系 | 井、溪、河、江、湖、塘、灣、涌 |

### 輔助類別

| 類別 ID | 說明 | 代表字符 |
|---------|------|---------|
| `number_small` | 小數字（一二三） | 一、二、三、四、五 |
| `number_large` | 大數字（六七八） | 六、七、八、九、十 |
| `number_ordinal` | 序數詞 | 初、第、老 |
| `shape` | 形狀描述 | 圓、尖、平、扁、曲 |
| `size_big` | 大尺寸 | 大、長、高、廣 |
| `size_small` | 小尺寸 | 小、矮、窄 |
| `color` | 顏色 | 青、赤、黃、白、黑 |
| `time` | 時間 | 今、冬、古、春、秋 |

### 精細子類示例（40+）

| 父類別 | 子類別代碼 | 中文 |
|--------|---------|------|
| mountain | `mountain_peak` | 山峰 |
| mountain | `mountain_valley` | 山谷 |
| mountain | `mountain_slope` | 山坡 |
| mountain | `mountain_ridge` | 山脊 |
| mountain | `mountain_rock` | 岩石 |
| mountain | `mountain_plateau` | 台地 |
| water | `water_spring` | 泉眼 |
| water | `water_stream` | 溪流 |
| water | `water_pond` | 池塘 |
| water | `water_river` | 江河 |
| water | `water_lake` | 湖泊 |
| water | `water_bay` | 海灣 |
| water | `water_port` | 港口 |
| water | `water_shore` | 海岸 |
| water | `water_island` | 島嶼 |
| clan | `clan_he` | 何姓 |
| clan | `clan_liu` | 劉姓 |
| clan | `clan_wu` | 吳姓 |
| clan | `clan_zhang` | 張姓 |
| clan | `clan_li` | 李姓 |
| clan | `clan_liang` | 梁姓 |
| clan | `clan_luo` | 羅姓 |
| clan | `clan_chen` | 陳姓 |
| clan | `clan_huang` | 黃姓 |
| settlement | `settlement_district` | 聚落區塊 |
| settlement | `settlement_market` | 集市 |
| settlement | `settlement_fort` | 堡壘 |
| settlement | `settlement_village` | 村落 |
| settlement | `settlement_building` | 建築物 |
| agriculture | `agriculture_field` | 農田 |
| agriculture | `agriculture_irrigation` | 灌溉設施 |
| agriculture | `agriculture_storage` | 倉儲 |
| symbolic | `symbolic_virtue` | 德行 |
| symbolic | `symbolic_religion` | 宗教 |
| symbolic | `symbolic_prosperity` | 興旺 |
| symbolic | `symbolic_fortune` | 吉祥 |
| symbolic | `symbolic_peace` | 平安 |
| infrastructure | `infrastructure_station` | 驛站 |
| infrastructure | `infrastructure_bridge` | 橋梁 |
| infrastructure | `infrastructure_port` | 港口 |
| infrastructure | `infrastructure_road` | 道路 |

---

## 通用 API 參數規範

### 地區層級參數（新格式，推薦）

所有涉及地區的端點均支持三級行政區的精確參數（優先於 `region_name` 模糊匹配）：

| 參數 | 類型 | 說明 |
|------|------|------|
| `region_level` | string | `city` \| `county` \| `township` |
| `city` | string | 市名（如 `廣州市`） |
| `county` | string | 縣/區名（如 `番禺區`） |
| `township` | string | 鎮/街道名（如 `石樓鎮`） |
| `region_name` | string | 遺留參數，向下兼容 |

### 分頁參數

| 參數 | 默認值 | 說明 |
|------|--------|------|
| `limit` | 20–100 | 每頁條數 |
| `offset` | 0 | 偏移量 |
| `top_k` | 10–100 | 取前 K 條結果 |

### 聚類通用參數

| 參數 | 類型 | 默認值 | 範圍 |
|------|------|--------|------|
| `algorithm` | string | `kmeans` | kmeans \| dbscan \| gmm |
| `k` | int | 5 | 2–20 |
| `eps` | float | — | 0.1–10 |
| `min_samples` | int | — | 1–20 |
| `pca_n_components` | int | 50 | 10–200 |
| `standardize` | bool | true | — |
| `top_n_suffix2` | int | 50 | 10–500 |
| `top_n_suffix3` | int | 30 | 10–500 |

### 統計顯著性標記

| 標記 | p 值範圍 | 含義 |
|------|---------|------|
| `***` | p < 0.001 | 極顯著 |
| `**` | p < 0.01 | 高度顯著 |
| `*` | p < 0.05 | 顯著 |
| `n.s.` | p ≥ 0.05 | 不顯著 |

---

*本文檔後端算法細節已按各節「後端實現」補充完畢（2026-02-28）。*

---

## 數據庫架構完整清單

> **數據庫文件：** `data/villages.db`（SQLite，64 張表，285,860 條村莊）
> **以下結構均直接查詢數據庫取得（2026-02-28 實測）**

### 核心原始數據表

| 表名 | 行數 | 說明 | 主要列 |
|------|------|------|--------|
| `广东省自然村` | 285,860 | 原始村莊表 | 市级, 区县级, 乡镇级, 行政村, 自然村, 拼音, 方言分布, longitude, latitude, 备注, 搜索用 |
| `广东省自然村_预处理` | 285,860 | 清洗後村莊（含 village_id） | 市级, 区县级, 乡镇级, 村委会, **自然村_规范名**, 自然村_去前缀, longitude(REAL), latitude(REAL), 语言分布, 字符集, 字符数量, **village_id** |

### 字符分析表

| 表名 | 行數 | 說明 | 主要列 |
|------|------|------|--------|
| `char_frequency_global` | 15,376 | 全局字符頻率（預計算） | char, village_count, total_villages, frequency, rank |
| `char_frequency_regional` | **0（空表）** | 未使用 | run_id, region_level, region_name, char, ... |
| `char_regional_analysis` | 419,626 | 各地區字符傾向（核心表） | region_level, city, county, township, region_name, char, village_count, total_villages, frequency, rank_within_region, global_village_count, global_frequency, **lift, log_lift, log_odds, z_score**, support_flag, rank_overrepresented, rank_underrepresented |
| `char_embeddings` | 9,209 | Word2Vec 字符向量（**100 維**） | run_id, char, embedding_vector（JSON 字串）, char_frequency |
| `char_similarity` | 460,450 | 字符餘弦相似度（全量預計算） | run_id, char1, char2, cosine_similarity, rank |
| `tendency_significance` | 346,583 | 卡方檢驗顯著性（預計算） | run_id, region_level, region_name, char, chi_square_statistic, p_value, is_significant, **significance_level, effect_size, effect_size_interpretation, ci_lower, ci_upper**, created_at |
| `embedding_runs` | 3 | Embedding 訓練元信息 | run_id, model_type（word2vec_skipgram）, vector_size(**100**), window_size, min_count, epochs, vocabulary_size(**3,067**), corpus_size |

> **Word2Vec：** 類型 `word2vec_skipgram`，向量維度 **100**，詞彙量 3,067 字符，活躍 Run ID：`embed_final_001`。

### 語義分析表

| 表名 | 行數 | 說明 | 主要列 |
|------|------|------|--------|
| `semantic_vtf_global` | 9 | 全局語義 VTF（9 大類） | category, vtf_count, total_villages, frequency, rank |
| `semantic_vtf_global_v2` | **0（空表）** | — | — |
| `semantic_vtf_regional` | **0（空表）** | 功能由 `semantic_regional_analysis` 承擔 | — |
| `semantic_regional_analysis` | 15,489 | 各地區語義類別傾向（核心表） | region_level, city, county, township, region_name, category, **vtf_count**, total_villages, frequency, rank_within_region, global_vtf_count, global_frequency, **lift, log_lift, log_odds, z_score**, support_flag, rank_overrepresented, rank_underrepresented |
| `semantic_labels` | （由 active_run_ids 管） | LLM 字符語義標注（9 大類） | char, semantic_category, confidence, labeling_method, llm_explanation |
| `semantic_subcategory_labels` | 313 | 精細子類標注（76 子類） | char, parent_category, subcategory, confidence, labeling_method, created_at |
| `semantic_subcategory_vtf_global` | 76 | 子類全局 VTF | subcategory, parent_category, char_count, village_count, vtf, percentage, created_at |
| `semantic_subcategory_vtf_regional` | 71,016 | 子類地區 VTF + 傾向 | region_level, region_name, subcategory, parent_category, char_count, village_count, vtf, percentage, **tendency**, created_at |
| `semantic_indices` | 14,292 | 語義豐富度指數（9 大類） | run_id, region_level, region_name, category, raw_intensity, normalized_index, **z_score**, rank_within_province, village_count |
| `semantic_indices_detailed` | 120,840 | 語義豐富度指數（76 子類） | 同上 |
| `semantic_bigrams` | 100 | 語義二元組合（9 大類） | category1, category2, frequency, percentage, pmi |
| `semantic_bigrams_detailed` | 4,524 | 語義二元組合（76 子類） | 同上 |
| `semantic_bigrams_v3_backup` | 4,332 | 歷史備份，僅保留不使用 | — |
| `semantic_trigrams` | 885 | 語義三元組合（9 大類） | category1, category2, category3, frequency, percentage |
| `semantic_trigrams_detailed` | 24,725 | 語義三元組合（76 子類） | 同上 |
| `semantic_pmi` | 100 | 類別 PMI（9 大類） | category1, category2, pmi, frequency, is_positive |
| `semantic_pmi_detailed` | 4,524 | 類別 PMI（76 子類） | 同上 |
| `semantic_composition_patterns` | 25 | 命名語義結構模式（9 大類） | pattern, pattern_type, modifier, head, frequency, percentage, description |
| `semantic_composition_patterns_detailed` | **0（空表）** | — | — |
| `semantic_conflicts` | 449 | 語義標注衝突記錄 | sequence, frequency, conflict_type, description |
| `semantic_network_centrality` | 10 | 語義類別網絡中心性（預計算） | run_id, category, degree_centrality, betweenness_centrality, closeness_centrality, eigenvector_centrality, pagerank, community_id |
| `semantic_network_stats` | 1 | 語義網絡整體統計 | run_id, num_nodes, num_edges, density, is_connected, avg_clustering, modularity, num_communities, created_at |
| `semantic_tendency` | **0（空表）** | — | — |

### N-gram 與模式分析表

| 表名 | 行數 | 說明 | 主要列 |
|------|------|------|--------|
| `ngram_frequency` | 599,960 | 全局 N-gram 頻率（n=2,3,4） | ngram, n, position, frequency, total_count, percentage |
| `regional_ngram_frequency` | 1,099,240 | 鎮級 N-gram 頻率（預計算） | **level, city, county, township, region**, ngram, n, position, frequency, total_count, percentage |
| `ngram_tendency` | 1,099,240 | N-gram 地區傾向（預計算） | **level, city, county, township, region**, ngram, n, position, lift, log_odds, z_score, regional_count, regional_total, regional_total_raw, global_count, global_total |
| `ngram_significance` | 2,021,797 | N-gram 顯著性（預計算，最大表之一） | **level, city, county, township, region**, ngram, n, position, chi2, p_value, cramers_v, is_significant, total_before_filter |
| `structural_patterns` | 462 | 命名結構模式（支持通配符匹配） | pattern, pattern_type, n, position, frequency, example, description |
| `pattern_frequency_global` | 319,380 | 全局命名模式頻率（預計算） | pattern_type, pattern, village_count, total_villages, frequency, rank |
| `pattern_frequency_regional` | **0（空表）** | — | — |
| `pattern_regional_analysis` | 1,900,580 | 各地區命名模式傾向（預計算，最大表） | pattern_type, region_level, city, county, township, region_name, pattern, village_count, total_villages, frequency, rank_within_region, global_village_count, global_frequency, lift, log_lift, log_odds, z_score, support_flag, rank_overrepresented, rank_underrepresented |
| `pattern_tendency` | **0（空表）** | — | — |
| `temp_regional_totals_raw` | 12,565 | 計算 Lift 用的輔助中間表 | level, city, county, township, n, position, total_raw |

> **注意：** N-gram 相關表使用 `level/city/county/township/region` 五列定位地區，與字符分析表的 `region_level/region_name` 格式不同。

### 空間分析表

| 表名 | 行數 | 說明 | 主要列 |
|------|------|------|--------|
| `village_spatial_features` | 285,080 | 村莊空間特征（預計算） | village_id, village_name, city, county, town, longitude, latitude, nn_distance_1/5/10（最近鄰距離）, **local_density_1km, local_density_5km, local_density_10km**（三個半徑的密度）, isolation_score, **is_isolated**, **spatial_cluster_id, cluster_size** |
| `spatial_hotspots` | 317 | KDE 核密度熱點 | run_id, hotspot_id, **hotspot_type**, center_lon, center_lat, radius_km, village_count, density_score, **semantic_category, pattern, city, county**, created_at |
| `spatial_clusters` | 33,331 | DBSCAN/HDBSCAN 聚類結果 | run_id, cluster_id, cluster_size, centroid_lon, centroid_lat, avg_distance_km, dominant_city, dominant_county, **semantic_profile_json, naming_patterns_json**, created_at |
| `village_cluster_assignments` | 914,666 | 村莊空間聚類歸屬 | run_id, village_id, cluster_id, **cluster_size, cluster_probability**, created_at |
| `spatial_tendency_integration` | 11,385 | 字符-空間聚類關聯（預計算） | id, run_id, **tendency_run_id, spatial_run_id**, character, **character_category**, cluster_id, cluster_tendency_mean, cluster_tendency_std, global_tendency_mean, tendency_deviation, **n_villages_with_char**, cluster_size, centroid_lon, centroid_lat, avg_distance_km, spatial_coherence, spatial_specificity, dominant_city, dominant_county, is_significant, p_value, u_statistic, created_at |
| `region_spatial_aggregates` | 11,123 | 各地區空間特征聚合（預計算） | run_id, region_level, region_name, total_villages, avg_nn_distance, avg_local_density, avg_isolation_score, n_isolated_villages, n_spatial_clusters, spatial_dispersion, created_at |

### 地區聚合與相似度表

| 表名 | 行數 | 說明 | 主要列 |
|------|------|------|--------|
| `city_aggregates` | 21 | 市級語義聚合（預計算） | city, total_villages, avg_name_length, **mountain_count/pct, water_count/pct, settlement_count/pct, direction_count/pct, clan_count/pct, symbolic_count/pct, agriculture_count/pct, vegetation_count/pct, infrastructure_count/pct**, top_suffixes, top_prefixes |
| `county_aggregates` | 122 | 縣級語義聚合（預計算） | city, county + 同 city_aggregates 各列 |
| `town_aggregates` | 1,580 | 鎮級語義聚合（預計算） | city, county, town + 同上各列 |
| `region_vectors` | 1,830 | 各地區特征向量（預計算） | run_id, region_level, region_id, region_name, N_villages, **feature_json**（序列化向量）, created_at |
| `region_similarity` | 7,470 | 地區兩兩相似度（預計算） | region_level, region1, region2, cosine_similarity, jaccard_similarity, euclidean_distance, common_high_tendency_chars, distinctive_chars_r1, distinctive_chars_r2, feature_dimension, created_at |
| `regional_centroids` | 1,590 | 各地區質心坐標（預計算） | region_level, region_name, centroid_lon, centroid_lat, village_count |

### ML 聚類結果表

| 表名 | 行數 | 說明 | 主要列 |
|------|------|------|--------|
| `cluster_assignments` | 121 | 地區聚類歸屬 | run_id, region_level, region_id, region_name, cluster_id, algorithm, k, silhouette_score, distance_to_centroid, created_at |
| `cluster_profiles` | 4 | 聚類特征摘要 | run_id, algorithm, cluster_id, cluster_size, top_features_json, top_semantic_categories_json, top_suffixes_json, representative_regions_json, created_at |
| `clustering_metrics` | 1 | 聚類評估指標 | run_id, algorithm, k, silhouette_score, davies_bouldin_index, calinski_harabasz_score, n_features, pca_enabled, pca_n_components, created_at |

### 村莊詳情表

| 表名 | 行數 | 說明 | 主要列 |
|------|------|------|--------|
| `village_features` | 285,860 | 村莊完整特征（預計算） | village_id, city, county, town, village_committee, village_name, pinyin, name_length, **suffix_1/2/3, prefix_1/2/3**（前三個後/前綴）, **sem_mountain, sem_water, sem_settlement, sem_direction, sem_clan, sem_symbolic, sem_agriculture, sem_vegetation, sem_infrastructure**（9 大語義類別布爾標記）, **kmeans_cluster_id, dbscan_cluster_id, gmm_cluster_id**, has_valid_chars |
| `village_ngrams` | 284,741 | 村莊 N-gram 分解 | village_id, 村委会, 自然村, n, bigrams, trigrams, prefix_bigram, suffix_bigram, **prefix_trigram, suffix_trigram** |
| `village_semantic_structure` | 237,461 | 村莊語義結構解析 | village_id, 村委会, 自然村, semantic_sequence, sequence_length, has_modifier, has_head, has_settlement |

### 系統管理表

| 表名 | 行數 | 說明 | 主要列 |
|------|------|------|--------|
| `active_run_ids` | 12 | 各模塊活躍 Run ID（核心配置表） | analysis_type, run_id, table_name, updated_at, updated_by, notes |
| `analysis_runs` | 7 | 分析運行記錄 | run_id, created_at, total_villages, valid_villages, unique_chars, config_json, status, notes |
| `embedding_runs` | 3 | Embedding 訓練記錄 | run_id, model_type, vector_size, window_size, min_count, epochs, vocabulary_size, corpus_size, training_time_seconds |
| `run_snapshots` | 1 | 可重現性快照 | run_id, git_commit_hash, parameters_json, random_state, data_hash, is_reproducible |
| `prefix_cleaning_audit_log` | 284,764 | 前綴清洗審計記錄 | id, 市级, 县级, 镇级, 村委会, 自然村原始名, 自然村_去前缀, 检测到前缀, 前缀置信度, 是否去除等 |

### 活躍 Run ID 配置（直接查詢自 `active_run_ids` 表）

| analysis_type | 活躍 run_id | 對應表 |
|--------------|------------|--------|
| `char_embeddings` | `embed_final_001` | `char_embeddings` |
| `char_frequency` | `freq_final_001` | `char_frequency_global` |
| `char_significance` | `significance_v1` | `tendency_significance` |
| `clustering_county` | `cluster_001` | `cluster_assignments` |
| `ngrams` | `ngram_20260225_173125` | `village_ngrams` |
| `patterns` | `morph_001` | `pattern_tendency`（空表，實際查 `pattern_regional_analysis`） |
| `semantic` | `semantic_001` | `semantic_labels` |
| `semantic_indices` | `semantic_indices_detailed_001` | `semantic_indices` |
| `spatial_hotspots` | `final_03_20260219_225259` | `spatial_hotspots` |
| `spatial_integration` | `integration_final_001` | `spatial_tendency_integration` |
| `village_features` | `default` | `village_features` |
| （空，默認空間聚類） | `spatial_eps_20` | `spatial_clusters` |

---

## 算法詳情匯總

### 預計算算法

| 算法 | 用途 | 輸入 | 輸出 |
|------|------|------|------|
| **Word2Vec Skipgram**（自訓練） | 字符語義嵌入 | 村名字符序列 | **100 維**向量，存入 `char_embeddings` |
| **Cosine Similarity** | 字符相似度 | 100D 嵌入向量對 | [0,1] 相似分，存入 `char_similarity` |
| **Z-score** | 字符/語義/N-gram 地區傾向 | 地區頻率 vs 全局期望 | `(obs - exp) / σ` |
| **Lift** | 字符/語義偏好比率 | 地區頻率 / 全局頻率 | 比值，>1 偏好，<1 迴避 |
| **Log-lift / Log-odds** | 字符偏好對數表示 | Lift 值 / 地區頻率 | `log(lift)` / `log(P/(1-P)) - log(Q/(1-Q))` |
| **VTF**（Virtual Term Frequency） | 語義類別強度 | 字符語義標注（含置信度） | 加權累計頻率，存入 `semantic_vtf_global` |
| **PMI**（逐點互信息） | 語義類別/N-gram 共現關聯 | 聯合概率與邊際概率 | `log₂[P(A,B)/(P(A)·P(B))]` |
| **Chi-square 卡方檢驗** | 字符/N-gram 地區分佈顯著性 | 觀測 vs 期望列聯表 | χ² 統計量、p 值、Cramér's V、CI 區間 |
| **KDE**（核密度估計） | 村莊地理熱點識別 | GPS 坐標 | 熱點中心、密度分數、半徑，存入 `spatial_hotspots` |
| **DBSCAN** | 地理空間聚類 | GPS 坐標、eps、min_samples | 聚類 ID（-1 為噪聲），存入 `spatial_clusters` |
| **HDBSCAN** | 自動多密度空間聚類 | GPS 坐標 | 可變密度聚類（默認方案 `spatial_hdbscan_v1`） |
| **Mann-Whitney U** | 字符-空間聚類關聯顯著性 | 兩組傾向分數分佈 | U 統計量、p 值，存入 `spatial_tendency_integration` |
| **Shannon Entropy** | 語義多樣性指數 | 9 類語義分佈概率 | `-Σ pᵢ log(pᵢ)` |
| **Simpson 多樣性指數** | 語義均勻度 | 9 類語義分佈概率 | `1 - Σ pᵢ²` |

### 實時計算算法（Module 7，需登錄）

| 算法 | 庫 | 用途 | 評估指標 |
|------|-----|------|---------|
| **KMeans** | `sklearn.cluster.KMeans` | 地區/村莊聚類 | Silhouette, DB Index, CH Score |
| **DBSCAN** | `sklearn.cluster.DBSCAN` | 密度聚類，識別噪聲 | 同上 |
| **GMM** | `sklearn.mixture.GaussianMixture` | 軟聚類，概率歸屬 | 同上 |
| **PCA** | `sklearn.decomposition.PCA` | 特征降維（默認 50 維） | 解釋方差比 |
| **StandardScaler** | `sklearn.preprocessing.StandardScaler` | 特征標準化 | — |
| **Cosine/Jaccard** | NumPy 手寫 | 地區相似度計算 | 直接返回分值 |

### Run ID 管理

系統使用 `run_id_manager` 維護各分析模塊的「活躍 run_id」，支持多版本共存：

| 模塊 | 默認活躍 Run ID |
|------|----------------|
| 字符頻率 | `freq_final_001` |
| 語義分析 | `semantic_001` |
| 字符嵌入 | `embed_final_001` |
| 字符顯著性 | 動態查詢 |
| 空間聚類 | `spatial_hdbscan_v1`（默認）|
| 空間熱點 | 動態查詢 |

---

## 算法詳情補充 — 各表計算邏輯與算法原理詳解

> 本節對文檔各功能中提及的每張數據表，深入說明其背後的算法原理、數學假設、計算流程及結果解讀。目標是讓讀者不僅知道「調用了什麼」，更明白「為什麼這樣算、算的是什麼」。代碼位於 `scripts/core/` 及 `src/analysis/`、`src/semantic/` 等目錄。

---

### 一、字符頻率表：`char_frequency_global` / `char_regional_analysis`

**來源腳本：** `src/analysis/char_frequency.py`

#### 為什麼用「二元計數（村莊維度）」而不是「字符總出現次數」

地名分析的研究單位是「村莊」而非「字符串」。我們關心的問題是「有多少個村莊使用了字符 X」，而不是「字符 X 在所有村名中出現了多少次」。如果用後者，一個名為「三三村」的村莊中「三」被計 2 次，會導致「長村名」的字符頻率被人為放大，掩蓋真實的地域分佈信息。

因此，對每個村名先做 `set()` 集合去重，即同一村名中同一字符只計一次（二元存在性），然後再跨村莊累加：

```
village_count[c] = 在所有村莊中，有多少個村莊的村名包含字符 c（不重複計數）
frequency[c]     = village_count[c] / total_valid_villages
```

這樣，`frequency` 表示「一個隨機抽取的廣東自然村，其村名中包含字符 c 的概率」。

**全局頻率（`char_frequency_global`）計算流程：**

1. 預處理階段已對每個村名的字符集做 `set()` 去重，存入 `字符集`（JSON 格式，如 `["村","水","大"]`）
2. 遍歷全部 285,860 個有效村莊，對每個字符集中的每個字符累加計數
3. 計算頻率 `frequency = village_count / total_villages`
4. 按 frequency 倒序排名（`rank=1` 為最高頻）
5. 結果寫入 `char_frequency_global(char, village_count, total_villages, frequency, rank)`

**區域頻率（`char_regional_analysis`）計算流程：**

廣東省有同名地區（如多個縣都有「白沙鎮」），因此不能單純 GROUP BY 地區名，需用「層次鍵」消歧義：
- 市級：以 `(市级,)` 為組鍵
- 縣級：以 `(市级, 区县级)` 為組鍵
- 鎮級：以 `(市级, 区县级, 乡镇级)` 為組鍵

每個組鍵對應一個唯一地區，在組內獨立計算字符頻率，再與全局頻率對比得出傾向指標（見下節）。

---

### 二、傾向性指標：Z-score / Lift / Log-odds / Log-lift

**來源腳本：** `src/analysis/regional_analysis.py` → `compute_regional_tendency`

這三類指標回答的問題本質相同：「某地區使用字符 c 的頻率，是否偏離了全省的基準水平，偏離了多少？」但各自對「偏離」的衡量角度不同，互相補充。

#### 2.1 Lift（提升度）— 概率比值

**原理：** Lift 來自關聯規則挖掘，本質是條件概率與邊際概率的比值，衡量「地區」和「字符」兩個事件是否統計獨立。

若「字符 c 出現在某村名」與「該村莊位於某地區」完全統計獨立，則：

```
P(c | 地區 r) = P(c | 全省)   →   Lift = 1.0
```

實際計算時：

```
P(c | 地區 r) = village_count_r / total_r   （地區 r 中包含字符 c 的村莊比例）
P(c | 全省)   = village_count_global / total_global

Lift = P(c | 地區 r) / P(c | 全省)
```

**直觀解讀：**
- `Lift = 2.0`：該地區出現字符 c 的概率是全省平均的 2 倍，即「強偏好」
- `Lift = 0.5`：只有全省平均的一半，即「強迴避」
- `Lift = 1.0`：與全省無差異，「中性」

**局限性：** Lift 對稀有字符不穩定。若某字符全省僅出現在 3 個村莊（`p_global` 極小），某地區恰好有 1 個（`p_region` 略大），Lift 可能高達幾十，但此偏差純屬偶然。因此需配合最小支持度過濾（`min_global_support=20`，`min_regional_support=5`）和顯著性檢驗。

#### 2.2 Log-lift — 對稱化的提升度

**原理：** 直接取 `log(Lift)`。這個簡單變換解決了 Lift 的非對稱問題：

```
Lift=2 → log_lift ≈ +0.69  （超出全省 1 倍）
Lift=0.5 → log_lift ≈ -0.69  （低於全省一半）
```

原始 Lift 中「超出 2 倍」(Lift=2) 和「減半」(Lift=0.5) 在數量上不對稱（一個偏差 +1，一個偏差 -0.5），對數化後對稱地分佈在 0 兩側，便於可視化熱圖的色標設置。

#### 2.3 Log-odds（對數優勢比）— 基於優勢的比較

**原理：** 統計學中「優勢（odds）」= P/(1-P)，表示「某事件發生 vs 不發生」的比率。Log-odds ratio 比較地區優勢與全省優勢之差：

```
odds_region = P(c | r) / (1 - P(c | r))   （地區 r 中包含 vs 不包含字符 c 的村莊比）
odds_global = P(c) / (1 - P(c))           （全省中包含 vs 不包含字符 c 的比）

log_odds = log(odds_region) - log(odds_global)
         = log(odds_region / odds_global)   （即對數優勢比，Log Odds Ratio）
```

實現中使用 Laplace 平滑防止 `P=0` 或 `P=1` 的極端情況：

```python
p_r = clamp(p_region, 1e-10, 1-1e-10)   # 避免 log(0)
p_g = clamp(p_global, 1e-10, 1-1e-10)
log_odds = log(p_r/(1-p_r)) - log(p_g/(1-p_g))
```

**為什麼用 Log-odds 而不只用 Lift？** 因為 Lift 在 `p_global` 接近 1 時（極高頻字符）數值壓縮嚴重（所有地區的 Lift 都接近 1），而 Log-odds 在此情況下仍能放大差異。對於「村」、「山」等全省出現率極高的字符，Log-odds 比 Lift 更能捕捉地區差異。

#### 2.4 Z-score（標準化偏差）— 統計假設檢驗視角

**原理：** Z-score 把問題轉化成假設檢驗：「在地區 r 的 N 個村莊中，字符 c 出現 n 次，若真實概率等於全省平均 p_global，這個觀測結果有多'不正常'？」

**統計假設：** 每個村莊是否包含字符 c 是一次獨立的 Bernoulli 試驗，成功概率為 p_global（零假設 H₀）。則地區 r 中出現次數 n 服從二項分佈 `B(N_region, p_global)`。

當 N 足夠大時，二項分佈可近似為正態分佈（中心極限定理），計算標準化統計量：

```
期望值  E[n] = N_region × p_global
方差    Var[n] = N_region × p_global × (1 - p_global)    （二項分佈方差公式）
Z-score z = (n_region - E[n]) / sqrt(Var[n])
```

**解讀：**
- `z > 0`：觀測次數超過零假設期望，正偏差
- `z < 0`：低於期望，負偏差
- `|z| > 1.96`（雙尾 α=0.05）：若零假設為真，出現這種偏差的概率 < 5%，統計顯著
- Z-score 是無量綱量，可以在不同字符和不同地區間直接比較偏差程度

**最小支持度過濾：** 若 N_region 很小（地區村莊太少），Var[n] 接近 0，即使有偏差也缺乏統計意義。因此設 `min_global_support=20`（全局至少 20 村）、`min_regional_support=5`（地區至少 5 村）作為閾值，低於此的字符-地區組合標記 `support_flag=False` 並在排名中排除。

---

### 三、顯著性檢驗表：`tendency_significance` / `ngram_significance`

**來源腳本：** `src/analysis/regional_analysis.py` → `compute_chi_square_significance`

#### 為什麼需要顯著性檢驗

Z-score 本身已有顯著性含義（|z|>1.96 對應 p<0.05），但卡方獨立性檢驗從另一個角度驗證：「字符的出現」與「所屬地區」這兩個離散變量是否存在統計關聯，而不依賴正態近似假設。

#### 卡方獨立性檢驗原理

**核心思想：** 若「字符出現」與「地區歸屬」完全獨立（零假設 H₀），則在 2×2 列聯表的每個格子中，觀測值應接近期望值。卡方統計量 χ² 量化了「所有格子的觀測值與期望值的偏差程度」：

**列聯表構造：**
```
                  含字符 c    不含字符 c    合計
目標地區 r          O₁₁         O₁₂        N_r
其他地區           O₂₁         O₂₂        N_global - N_r
合計             n_global   N_global-n    N_global
```

**期望值計算（H₀ 下的理論分佈）：**

H₀ 下，每個格子的期望值由行邊際 × 列邊際 ÷ 總數給出：

```
E₁₁ = N_r × n_global / N_global       （地區 r 中期望含字符 c 的村莊數）
E₁₂ = N_r × (N_global - n_global) / N_global
E₂₁ = (N_global-N_r) × n_global / N_global
E₂₂ = (N_global-N_r) × (N_global-n_global) / N_global
```

**卡方統計量：**
```
χ² = Σ (Oᵢⱼ - Eᵢⱼ)² / Eᵢⱼ    （對所有 4 個格子求和）
```

χ² 越大，說明觀測值與「獨立假設下的期望值」偏差越大，越有理由拒絕 H₀（即字符分佈確實與地區相關）。

**p 值：** χ² 服從自由度 `df = (行數-1)×(列數-1) = 1×1 = 1` 的卡方分佈，查表或用 `scipy.stats.chi2_contingency` 得到 p 值。p 越小，地區偏好越不可能是隨機偶然。

#### Cramér's V（效應量）— 排除樣本量影響

**問題：** χ² 統計量會隨樣本量增大而增大，即使效應很微弱，只要樣本足夠大也能達到顯著。因此需要一個不依賴樣本量的效應強度指標。

**Cramér's V 公式：**
```
V = sqrt(χ² / (N_total × min(r-1, c-1)))
  = sqrt(χ² / N_global)     （本場景 2×2 表，min(1,1)=1）
```

V 的直覺意義：它等價於「兩個離散變量之間的 phi 相關係數」，是對稱的關聯強度量，取值 [0,1]：
- V < 0.1：弱關聯，即使顯著也可能無實際意義
- 0.1 ≤ V < 0.3：中等關聯，地域偏好有一定規律性
- V ≥ 0.3：強關聯，該字符的分佈高度地域集中

#### Wilson Score 置信區間 — 為何不用普通 Wald 區間

對地區頻率 `p = n_region / N_region` 計算 95% 置信區間時，最直觀的 Wald 區間是：

```
Wald CI = p ± z_α × sqrt(p(1-p)/N)
```

但當 N 很小或 p 接近 0/1 時，Wald 區間可能超出 [0,1]（如給出負的下界），統計性質很差。

Wilson Score interval 改為對 z 統計量本身求反（inverts the z-test），避免此問題：

```
z_α = 1.96   （95% 水平）
denominator = 1 + z_α² / N
center = (p + z_α² / (2N)) / denominator     （修正中心點，向 0.5 拉偏）
margin = z_α × sqrt(p(1-p)/N + z_α²/(4N²)) / denominator
CI = [max(0, center-margin), min(1, center+margin)]
```

Wilson 區間的核心改進：它不假設「中心就是 p̂」，而是通過對 z 統計量的代數逆運算求解合理區間，在 N<30 或 p 接近邊界時精確度顯著優於 Wald 區間。

---

### 四、字符嵌入表：`char_embeddings` / `char_similarity`

**來源腳本：** `scripts/core/train_char_embeddings.py`、`src/nlp/`

#### Word2Vec 的核心思想：分佈假設（Distributional Hypothesis）

Word2Vec 的理論基礎是語言學的「分佈假設」：**一個詞（字符）的語義由其出現的上下文決定**。兩個字符如果在相似的上下文中出現（即周圍常與相同的字符相鄰），它們在語義上就相近。

對地名語料來說，「山」和「嶺」都常出現在「大_坑」「小_村」等結構中，兩者的上下文分佈相似，因此 Word2Vec 訓練後它們的向量會彼此接近。

#### Skip-gram 模型的目標函數

Skip-gram 的任務是：給定一個中心字 `wᵢ`，預測它在窗口 `[-window, +window]` 內的上下文字 `wⱼ`。

**原始目標（最大化對數概率）：**
```
J = (1/T) Σₜ Σ_{-c≤j≤c, j≠0} log P(wₜ₊ⱼ | wₜ)
```

其中 `P(wₒ | wᵢ)` 用 Softmax 定義：
```
P(wₒ | wᵢ) = exp(vₒᵀ · vᵢ) / Σ_{w∈V} exp(vₙᵀ · vᵢ)
```

`vᵢ` 是中心詞向量，`vₒ` 是上下文詞向量，均為要學習的 100 維參數。

**問題：** Softmax 分母需對整個詞彙表求和（3,067 個字符 × 每次更新），計算代價大。

#### 負採樣（Negative Sampling）替代 Softmax

實際訓練使用「負採樣」簡化：對每個真實上下文對 `(wᵢ, wₒ)`（正樣本），隨機從詞彙表採樣 `k=5` 個「噪聲詞」`wₙ`（負樣本），目標改為：

```
J_NEG = log σ(vₒᵀ · vᵢ) + Σ_{n=1}^{k} E[log σ(-vₙᵀ · vᵢ)]
```

`σ(x) = 1/(1+e⁻ˣ)` 為 sigmoid 函數。直觀理解：讓真實上下文詞的向量點積最大（越相似越好），同時讓隨機噪聲詞的向量點積最小。每次更新只涉及 `k+1=6` 個詞的梯度，計算量從 O(V) 降為 O(k)。

**噪聲詞的採樣分佈：** 按詞頻的 3/4 次方概率採樣（`P(w) ∝ freq(w)^(3/4)`），使高頻字符被更多選為負樣本，防止高頻詞主導訓練。

#### 訓練超參與本項目設置

| 超參 | 值 | 含義 |
|------|-----|------|
| `vector_size=100` | 100 | 嵌入向量維度；維度越大表達越豐富，但需要更多數據。地名語料約 28 萬條，100 維是合理選擇 |
| `window=3` | 3 | 上下文窗口；村名平均 2-4 字，window=3 相當於覆蓋整個村名的大多數字符對 |
| `min_count=2` | 2 | 極低頻字符（只在 1 個村名出現的孤立字符）在語料中上下文太稀少，訓練的向量無意義 |
| `sg=1` | 1 | 使用 Skipgram；對低頻字符效果優於 CBOW，因為每個訓練樣本都使用一個確定的中心詞 |
| `epochs=15` | 15 | 訓練輪數；每輪遍歷全部語料一次，15 輪足夠收斂 |
| `negative=5` | 5 | 每個正樣本配 5 個負樣本 |

#### Cosine 相似度的幾何意義與預計算

訓練完成後，每個字符有一個 100 維向量。兩個向量的 Cosine 相似度衡量它們在向量空間中的**方向相似性**（而非距離），等於向量夾角的餘弦值：

```
cosine(A, B) = (A · B) / (||A|| × ||B||) = cos(θ)
```

- 值域 [-1, 1]，本項目中字符向量通常為正值域 [0, 1]
- `cosine ≈ 1`：方向幾乎一致，語義高度相似（如「山」和「嶺」）
- `cosine ≈ 0`：方向垂直，語義無關（如「陳」和「坑」）

由於查詢時需要實時返回「最相似的 top-k 字符」，若每次都計算 3,067 個字符的相似度，延遲不可接受。因此離線批量計算全部 3,067² ≈ 940 萬對相似度，每個字符保存 top-50 結果存入 `char_similarity`，查詢時直接排序返回，實現 O(1) 複雜度。

---

### 五、語義 VTF 表：`semantic_vtf_global` / `semantic_regional_analysis`

**來源腳本：** `src/semantic/vtf_calculator.py` → `VTFCalculator`

#### VTF 的概念起源：從字符頻率到語義類別頻率

傳統詞頻（Term Frequency, TF）統計的是單個詞（字符）出現次數。本項目需要統計的是「語義類別在地名中的出現強度」，例如「廣州有多少村莊帶有水系相關字符」。

由於字符與語義類別是多對一映射（「水」「溪」「江」「塘」都屬於 `water` 類），可以把一個語義類別看作一個「虛擬詞」，它的頻率是類別內所有字符頻率的聚合。這就是「Virtual Term Frequency（虛擬詞頻）」的含義——把不存在的「超詞彙」的出現頻率通過聚合虛擬計算出來。

#### 全局 VTF（`semantic_vtf_global`）計算

```python
for category in ['water', 'mountain', 'settlement', ...]:   # 9 大類
    chars_in_category = lexicon[category]           # 如 water 類 = {'水','溪','江','塘',...}
    # 在 char_frequency_global 中，找出屬於該類別的所有字符
    # 將它們的 village_count 相加
    vtf_count = sum(char_freq_global['village_count'] for c in chars_in_category if c in char_freq_global)
    frequency = vtf_count / total_villages
```

**注意「多重計數」的設計意圖：** 若村名「水塘村」中「水」和「塘」都屬於 `water` 類，`vtf_count` 會把這個村莊計算兩次（一次算「水」的 village_count，一次算「塘」的 village_count）。這是**刻意的設計**——VTF 反映的是語義類別在語料中的「出現強度」（intensity），而非「覆蓋的唯一村莊數」。包含越多水系字符的村名對水系 VTF 的貢獻越大，這符合「強化語義信號」的目標。

#### 區域 VTF 傾向計算

區域 VTF 頻率的計算同理，得到各地區各類別的 `frequency_regional` 後，使用與字符傾向相同的公式（Lift、Log-odds、Z-score）計算語義類別的地區傾向，存入 `semantic_regional_analysis`。

這使得我們可以問「廣州市的水系語義傾向是否顯著高於全省平均」——與字符傾向分析的邏輯完全一致，只是分析單元從字符升級到語義類別。

---

### 六、語義 PMI 表：`semantic_pmi` / `semantic_pmi_detailed`

**來源腳本：** `src/semantic_composition.py` → `SemanticCompositionAnalyzer.calculate_pmi`

#### PMI 的信息論基礎

**PMI（Pointwise Mutual Information）** 來自信息論，衡量兩個事件的「實際共現概率」相對於「若它們互相獨立時的期望共現概率」的比值，取對數：

```
PMI(A, B) = log( P(A,B) / (P(A) × P(B)) )
```

**信息論直覺：** 若 A 和 B 完全獨立，`P(A,B) = P(A)×P(B)`，PMI=0。若 A 出現時 B 幾乎必然出現（強正相關），`P(A,B) >> P(A)×P(B)`，PMI >> 0。若 A 出現時 B 幾乎不出現（強負相關），PMI << 0。

**本項目應用場景：** 衡量兩個語義類別在同一村名中「相鄰出現」的關聯強度。例如，`clan` + `settlement`（如「陳村」中「陳」屬宗族、「村」屬聚落）的共現是否遠超獨立假設下的期望。

#### 具體計算流程

**Step 1：提取語義 Bigram**

對每個村名，按字符順序映射語義類別形成序列，再取相鄰類別對（有序 Bigram）：

```
村名「東山村」 → 字符序列 ['東','山','村']
              → 語義序列 ['direction','mountain','settlement']
              → Bigrams: [('direction','mountain'), ('mountain','settlement')]
```

全量統計後得到每個 Bigram (A,B) 的出現次數 `count[(A,B)]`。

**Step 2：計算聯合概率和邊際概率**

```python
total_bigrams = sum(all bigram counts)

# 聯合概率（Bigram 作為整體的概率）
P(A,B) = count[(A,B)] / total_bigrams

# 邊際概率（每個 Bigram 拆開，各貢獻 2 個 unigram）
# unigram_counts[A] = A 作為 Bigram 第一個或第二個元素出現的次數
unigram_total = total_bigrams × 2   # 每個 bigram 貢獻 2 個 unigram 計數
P(A) = unigram_counts[A] / unigram_total
P(B) = unigram_counts[B] / unigram_total
```

**Step 3：計算 PMI（自然對數）**

```python
pmi = log(P(A,B) / (P(A) × P(B)))
```

使用自然對數，PMI > 0 表示正關聯，`is_positive=1`；PMI < 0 表示負關聯，`is_positive=0`。

**PMI 的局限與處理：** 原始 PMI 對低頻 Bigram 嚴重偏高（極稀有的 Bigram 一旦出現，`P(A,B)` 遠超期望，PMI 虛高）。本項目通過前端 `min_pmi=0.3` 過濾緩解此問題。更嚴格的方案是 NPMI（Normalized PMI = PMI / -log(P(A,B))，將值域壓縮到 [-1,1]），但本項目未啟用。

**雙版本存儲原因：** `semantic_pmi`（9 大類，100 條）給前端粗粒度查詢，`semantic_pmi_detailed`（76 子類，4,524 條）給精細分析，兩者使用不同詞典獨立計算。

---

### 七、語義組合模式表：`semantic_bigrams` / `semantic_trigrams` / `semantic_composition_patterns`

**來源腳本：** `scripts/core/phase14_semantic_composition.py`、`src/semantic_composition.py`

#### 為什麼要分析語義 N-gram

村名是由字符序列構成的「微型句子」。如果把每個字符替換為其語義標籤，村名就變成了一個語義類別的排列序列。例如：

```
「大水村」 → direction? + water + settlement
「陳家坑」 → clan + clan + mountain
「福田村」 → symbolic + agriculture + settlement
```

通過統計這些類別序列中相鄰的 Bigram 和 Trigram 頻率，可以發現廣東地名的「語義構詞規律」：哪些語義類別常常相鄰出現（如「宗族+聚落」），哪些罕見相鄰（如「水系+水系」同一村名中連續出現）。

#### Bigram/Trigram 提取：滑動窗口

對長度為 n 的語義序列 `[c₁, c₂, ..., cₙ]`，使用大小為 k 的滑動窗口提取 k-gram：

```
Bigrams (k=2): (c₁,c₂), (c₂,c₃), ..., (cₙ₋₁,cₙ)    共 n-1 個
Trigrams (k=3): (c₁,c₂,c₃), (c₂,c₃,c₄), ..., (cₙ₋₂,cₙ₋₁,cₙ)  共 n-2 個
```

**質量過濾：** 只處理「語義標注覆蓋率 ≥ 50%」的村名（即至少一半的漢字有明確語義標注，不是 'other'）。低覆蓋率說明該村名大量字符未在詞典中，語義序列可信度低。

**百分比計算：** `percentage = count / total_bigrams × 100`，反映各 Bigram 在所有有序相鄰類別對中的佔比。

#### 語義構詞模式識別（`semantic_composition_patterns`）

在 Bigram 頻率基礎上，用一套優先級規則識別 6 類「修飾-中心」語義結構，這些結構對應廣東地名的主要命名邏輯：

| 優先級 | 模式類型 | 觸發條件 | 語言學含義 | 示例 |
|--------|---------|---------|-----------|------|
| 1 | `clan_settlement` | cat1=`clan` AND cat2=`settlement` | 「姓氏+聚落詞」是廣東漢族命名最典型模式 | 陳村、李屋、羅寨 |
| 2 | `clan_head` | cat1=`clan` AND cat2∈地物類 | 姓氏標識某地物的所有者 | 陳山、劉坑、黃田 |
| 3 | `symbolic_head` | cat1=`symbolic` AND cat2∈地物類 | 吉祥詞修飾自然地物 | 福田、吉水、寶山 |
| 4 | `modifier_head` | cat1∈[size,direction,number] AND cat2∈地物類 | 尺寸/方位/數量限定地物 | 大山、東坑、三灣 |
| 5 | `head_settlement` | cat1∈地物類 AND cat2=`settlement` | 地物名+聚落詞（最常見後綴模式） | 水村、山莊、坑村 |
| 6 | `head_direction` | cat1∈地物類 AND cat2=`direction` | 地物名+方位（如山東、水南） | 山東、水北 |

**地物類（head_categories）** = `[water, mountain, landform, vegetation, settlement, agriculture]`

規則按優先級依次嘗試，已匹配的 Bigram 不再重複處理（避免一個 Bigram 對應多個模式）。`modifier` 和 `head` 字段記錄該模式中修飾語和中心語各是哪個語義類別。

---

### 八、村莊語義結構表：`village_semantic_structure`

**來源腳本：** `scripts/core/phase14_semantic_composition.py` → `step6_extract_village_structures`

#### 計算邏輯

對每個自然村，從 `自然村_去前缀`（去除通用地名前綴後的規範村名）提取語義結構：

1. **字符→類別映射：** 使用詞典將每個漢字映射到語義類別，未在詞典中的字符標記為 `other`
2. **覆蓋率計算並過濾：**
   ```
   coverage = labeled_chars / total_chars   （labeled_chars 為非 other 的字符數）
   只保留 coverage ≥ 0.5 的村莊（237,461 / 285,860 = 83% 通過）
   ```
   這個閾值確保語義序列有足夠的信息量，避免「全是 other」的噪聲記錄影響後續分析。
3. **三個布爾結構特征：**
   - `has_modifier`：村名中是否包含「修飾性語義字符」（size/direction/number 類），如「大」「東」「三」
   - `has_head`：是否包含「地物核心字符」（water/mountain/landform/vegetation 類），如「山」「水」「林」
   - `has_settlement`：是否包含「聚落詞」（settlement 類），如「村」「莊」「坊」

這三個特征共同描述村名的語義結構完整性：一個「完整」的地名通常同時包含修飾語（描述特征）、中心地物（主題）和聚落詞（聚落類型），構成「修飾-地物-聚落」三段式結構。

---

### 九、N-gram 分析管線：`ngram_frequency` / `regional_ngram_frequency` / `ngram_tendency` / `ngram_significance`

**來源腳本：** `scripts/core/phase12_ngram_analysis.py`

#### 為什麼做字符 N-gram 分析

語義分析（第五~八節）通過「字符→語義類別映射」捕捉語義結構，但詞典覆蓋有限，且無法捕捉字符層面的具體命名習慣。字符 N-gram 分析不依賴語義詞典，直接統計字符串片段的頻率，可以發現：
- 高頻後綴（如「水村」「大坑」「山村」）反映地名的命名模板
- 地域性特有 N-gram（如某些客家話或粵語特有的詞組）
- 各地區的字符使用偏好

#### N-gram 提取與位置標注

對每個村名，按字符為單元，以窗口大小 n（2/3/4）滑動提取所有 n-gram，並按其在村名中的位置打標籤：

```
村名「東山坑村」（長度=4）：
  Bigrams (n=2)：「東山」(prefix), 「山坑」(middle), 「坑村」(suffix)
  Trigrams (n=3)：「東山坑」(prefix), 「山坑村」(suffix)
  4-grams (n=4)：「東山坑村」(prefix-suffix)  # 整個村名即為前後綴
```

位置判斷邏輯：
- 從第 1 個字符開始 → `prefix`
- 在最後 1 個字符結束 → `suffix`
- 兩者都是 → `prefix-suffix`（整個村名長度等於 n 時）
- 其他位置 → `middle`

全局 `ngram_frequency` 還額外存儲一個 `position='all'` 的匯總行，統計不分位置的總頻率。

#### 傾向指標計算：`ngram_tendency`

與字符傾向計算完全相同的框架，但對象是 N-gram：

```
lift = P(ngram | 地區 r) / P(ngram | 全省)
     = (regional_count / regional_total)
       / (global_count / global_total)
```

**跨地區聚合的正確性問題（`regional_total_raw`）：** 前端在縣/市級別查詢時需要把多個鎮級數據聚合。如果直接 `SUM(regional_count) / SUM(regional_total)` 計算 lift，分母 `regional_total` 是已過濾後的 N-gram 總數（因為 Step 6 刪除了不顯著的 N-gram），會使分母偏小、Lift 偏大。

解決方案：額外記錄 `regional_total_raw`（過濾前的原始 N-gram 總數），聚合時用原始分母：

```
Lift_aggregated = SUM(regional_count) / SUM(regional_total_raw)
                ÷ (global_count / global_total)
```

#### 顯著性過濾（`ngram_significance`）

同樣使用卡方獨立性檢驗（2×2 列聯表），構建方式與字符顯著性完全相同，只是把「字符」換成「N-gram」。

**關鍵優化：** 只存儲 p < 0.05 的顯著結果，過濾後 `ngram_significance` 保留 202 萬條顯著 N-gram，相比原始 N-gram 傾向表減少約 40% 存儲。`ngram_tendency` 和 `regional_ngram_frequency` 也同步刪除不顯著的 N-gram，保持三表一致性。

---

### 十、空間特征表：`village_spatial_features`

**來源腳本：** `scripts/core/generate_spatial_features.py`

#### 球面最近鄰：為什麼需要 Haversine 距離

GPS 坐標（經緯度）不是平面坐標，地球是球面。在廣東省的緯度範圍（20°~25°N），一度經度約 100 km，一度緯度約 111 km，相差不大但不相等。如果直接用歐氏距離計算兩點間的「度數差」，距離計算會有系統性誤差（在高緯度地區誤差更大）。

Haversine 公式直接計算球面上兩點的大圓距離（Great-circle distance）：

```
a = sin²(Δlat/2) + cos(lat₁) × cos(lat₂) × sin²(Δlon/2)
d = 2 × R × arcsin(sqrt(a))   （R = 6371 km，地球半徑）
```

實現時將坐標轉為弧度（`np.radians(coords)`），用 `NearestNeighbors(metric='haversine')` 的 Ball Tree 算法高效計算 k 個最近鄰。Ball Tree 的優勢：它對球面坐標建立分層包圍球樹，時間複雜度 O(n log n) 建樹，O(log n) 查詢，比暴力 O(n²) 快得多。

#### 密度指標計算

```
local_density = 1.0 / (avg_knn_distance_km + 0.001)
```

這是「逆距離」密度估計：k 個最近鄰的平均距離越小，局部密度越高。加 0.001 是防止除以零的數值穩定性處理（極少數村莊坐標完全重疊時 avg_distance=0）。

三個半徑（1/5/10 km）對應不同尺度的密度分析：1km 反映超密集聚居，5km 反映鄉鎮級聚落密度，10km 反映縣域級空間格局。

---

### 十一、空間聚類表：`spatial_clusters` / `village_cluster_assignments`

**來源腳本：** `scripts/core/run_spatial_analysis.py`、`scripts/core/run_hdbscan_clustering.py`

#### DBSCAN 算法原理：基於密度的聚類

DBSCAN（Density-Based Spatial Clustering of Applications with Noise）的核心概念：

**核心點（Core Point）：** 若點 p 在半徑 eps 內有至少 min_samples 個鄰居（包括自身），則 p 是核心點。

**密度直達（Directly Density-Reachable）：** 若 q 在核心點 p 的 eps 鄰域內，則 q 密度直達自 p。

**密度連通（Density-Connected）：** 若存在核心點鏈 p→...→q，使得鏈上相鄰點密度直達，則 p 和 q 密度連通，屬於同一個聚類。

**噪聲點（Noise）：** 不屬於任何聚類的點（`cluster_id = -1`），代表孤立的村莊。

**DBSCAN 的優勢（相對於 KMeans）：**
- 不需要預設聚類數 k
- 能識別任意形狀的聚類（廣東地形複雜，村莊沿河谷分佈是非球形的）
- 能識別噪聲點（孤立村莊）

**eps 參數（廣東坐標下的單位換算）：** eps 使用角度（度）作為單位，廣東省緯度約 23°N，1 度緯度 ≈ 111km，1 度經度 ≈ 102km。四套方案對應：
- `spatial_eps_05`：eps ≈ 0.05° → 約 5km，識別超密集核心聚落
- `spatial_eps_10`：eps ≈ 0.10° → 約 10km，識別標準密度聚落群
- `spatial_eps_20`：eps ≈ 0.20° → 約 20km，識別跨鎮域的廣域聚落帶

#### HDBSCAN：允許變密度的層次化 DBSCAN

DBSCAN 的一個缺點是全局使用同一個 eps，無法同時識別「高密度的珠三角城鎮群」和「低密度的山區村落群」——使用大 eps 珠三角一片連成超大聚類，使用小 eps 山區所有點都是噪聲。

HDBSCAN（Hierarchical DBSCAN）的解決方案：

1. **構建最小生成樹（Mutual Reachability Graph）：** 對所有點計算「互達距離」（Mutual Reachability Distance），綜合考慮點間距離和各點的核心距離
2. **層次聚類：** 用 Single-Linkage（最近距離合併）構建聚類層次樹
3. **聚類穩定性剪枝：** 遍歷層次樹，計算每個聚類的「存在穩定性」（在 eps 從小到大增長過程中聚類保持連續的程度），保留穩定性最高的聚類

**本項目參數：**
- `min_cluster_size=50`：一個聚類至少需要 50 個村莊才被認為是真正的聚落群體
- `min_samples=10`：計算核心距離時使用的最近鄰數，值越大聚類越保守（容忍更多噪聲）

HDBSCAN 還輸出每個點的 `cluster_probability`（軟歸屬概率，0~1），存儲在 `village_cluster_assignments.cluster_probability`。

---

### 十二、空間熱點表：`spatial_hotspots`

**來源腳本：** `src/pipelines/spatial_pipeline.py`

#### KDE（核密度估計）的數學原理

KDE 是一種非參數方法，用已知的離散樣本點估計整個空間上的連續概率密度函數，而不假設密度服從某種參數分佈（如正態分佈）。

**核心公式：** 在位置 x 處的密度估計值為所有樣本點的核函數之和：

```
f̂(x) = (1 / (n × h²)) × Σᵢ K((x - xᵢ) / h)
```

其中：
- `n`：樣本數（285,860 個村莊的 GPS 坐標）
- `h`：帶寬（bandwidth），控制每個樣本點影響的範圍
- `K(u)`：核函數，高斯核：`K(u) = (1/2π) × exp(-||u||²/2)`

**直觀理解：** 每個村莊坐標在地圖上「散佈」出一個高斯（鐘形）影響區域，在該村莊附近密度高，遠處快速衰減。所有村莊的高斯疊加後，高密度區域（多個村莊疊加的峰值）即為熱點。

#### 帶寬選擇：Scott's Rule

帶寬 h 決定估計的平滑程度：h 太小，每個村莊單獨形成尖峰，看不出聚集規律；h 太大，整個省都模糊成一片。

Scott's Rule 提供一個自動選取帶寬的公式：

```
h = n^(-1/(d+4)) × σ_data
  = n^(-1/6) × σ_data     （d=2 維）
```

其中 `σ_data` 為坐標數據的標準差（分別對經度和緯度計算），n 為樣本數。本質上這個公式假設數據服從正態分佈，最優帶寬正比於數據標準差、反比於樣本量的 1/6 次方（樣本越多，帶寬越小，估計越精細）。

#### 熱點識別流程

1. 在經緯度範圍內建立均勻格柵（Grid，如 500×500 分辨率）
2. 對格柵每個點計算 KDE 密度值 `f̂(x)`
3. 用「局部最大值檢測」找出密度格柵上的峰值點（周圍所有點密度均低於當前點的點）
4. 對每個峰值點，擴展到 `density_score` 閾值確定熱點半徑 `radius_km`
5. 統計熱點半徑內的村莊數 `village_count`
6. 結果存入 `spatial_hotspots`（317 個熱點，對應廣東省各主要聚落集群）

---

### 十三、空間整合表：`spatial_tendency_integration`

**來源腳本：** 離線整合腳本

#### 空間相干性（Spatial Coherence）— 基於信息熵

**問題：** 某字符（如「陳」）在廣東省 100 個村莊中出現，我們想知道這些村莊是集中在少數幾個空間聚類中（「強空間集中性」），還是分散在全省各地（「弱空間集中性」）。

**信息熵方法：** 設字符 c 在 K 個空間聚類中的分佈為：

```
pₖ = n_k_with_char / total_with_char   （含字符 c 的村莊中，位於聚類 k 的比例）
```

`pₖ` 是一個離散概率分佈，其 Shannon 熵：

```
H = -Σₖ pₖ × log(pₖ)
```

H 越大 → 分佈越均勻 → 字符 c 均勻分散在各聚類中 → 空間集中性低

H 越小 → 分佈越集中 → 字符 c 大量出現在少數幾個聚類 → 空間集中性高

**最大熵標準化：** `H_max = log(K)`（當 K 個聚類中 pₖ 完全均勻時的最大熵）

**空間相干性：**
```
spatial_coherence = 1 - H / H_max   ∈ [0, 1]
```
- `= 1`：字符完全集中在單一聚類（H=0）
- `= 0`：字符完全均勻分散（H=H_max）

#### Mann-Whitney U 檢驗 — 非參數的分佈差異

**問題：** 在某空間聚類 r 中，含字符 c 的村莊，它們的傾向分數（z_score）是否顯著高於不含字符 c 的村莊？

**為什麼用 Mann-Whitney U 而不用 t 檢驗？** t 檢驗假設兩組數據都服從正態分佈。傾向分數（Z-score）的分佈可能是重尾的、有極端值的，不保證正態。Mann-Whitney U 是非參數檢驗，不做任何分佈假設。

**算法原理：** 設兩組分別為 X₁,...,Xₘ（含字符 c 的村莊傾向分數）和 Y₁,...,Yₙ（不含字符 c 的村莊傾向分數）。

U 統計量計算兩組之間的「勝負關係」：

```
U = 對所有 (Xᵢ, Yⱼ) 對，計算 Xᵢ > Yⱼ 的次數
U = Σᵢ Σⱼ I(Xᵢ > Yⱼ)   （I 為指示函數）
```

等價於對合並後的 m+n 個值排秩，計算 X 組的秩和 Wₓ：

```
U = Wₓ - m(m+1)/2
```

**零假設：** 兩組數據來自同一分佈（字符 c 的存在對傾向分數沒有影響）。

**p 值：** 在大樣本下 U 近似正態分佈，標準化後得到 z 統計量並計算 p 值。`p_value < 0.05` 即認為含字符 c 的村莊的傾向分數分佈顯著不同於不含字符 c 的村莊，記 `is_significant=1`。

---

### 十四、地區相似度表：`region_similarity`

**來源腳本：** `scripts/core/phase15_region_similarity.py`、`src/analysis/region_similarity.py`

#### 地區表示為特征向量

要計算兩個縣之間的「命名風格相似度」，需要先把每個縣「數值化」為一個向量。特征向量的每個維度對應一個字符，維度值為該字符在該縣的出現頻率。

**特征字符選取（兩類字符的並集）：**

1. **全省 Top-100 高頻字符：** 代表廣東地名的基礎詞彙，確保所有地區都有非零值（通用性）
2. **高傾向字符（|z_score| ≥ 2.0）：** 在某些地區高度集中的字符，哪怕全省頻率不高，也可能攜帶重要的地域信息（區分性）

這樣選取兼顧「足夠的維度使向量有意義」和「具有地域區分能力」。

#### 三種相似度指標的幾何/集合含義

**Cosine 相似度（方向相似性）：**

```
cosine(A, B) = (Σᵢ aᵢ×bᵢ) / (sqrt(Σᵢ aᵢ²) × sqrt(Σᵢ bᵢ²))
             = A·B / (||A|| × ||B||)
```

幾何意義：兩個向量的夾角餘弦值，只考慮「方向」不考慮「長度」。若縣 A 村莊較少（向量整體偏小），縣 B 村莊較多（向量整體偏大），但字符使用比例相同，Cosine=1（完全相似）。這使得 Cosine 對村莊數量的絕對差異不敏感，只比較字符偏好的相對結構，適合不同規模地區的比較。

**Jaccard 相似度（集合交叉）：**

取每個地區 z_score > 0（即傾向偏高）的字符集 S：

```
jaccard(A, B) = |S_A ∩ S_B| / |S_A ∪ S_B|
```

Jaccard 是集合層面的相似度，完全不考慮程度，只看「高傾向字符是否重疊」。兩個地區共同偏好的字符越多，Jaccard 越高。適合「定性」比較：哪些字符是兩地共有的命名偏好。

**歐氏距離（數值差異）：**

```
euclidean(A, B) = sqrt(Σᵢ (aᵢ - bᵢ)²)
```

直接衡量兩個向量每個維度的差值平方和，對大差值更敏感（平方放大）。兩地在某個字符上使用率差距越大，歐氏距離越大。與 Cosine 不同，歐氏距離同時考慮方向和大小。

**附加輸出：**
- `common_high_tendency_chars`：兩地共同高傾向字符（z_score > 1.5）列表
- `distinctive_chars_r1/r2`：各自獨有的高傾向字符（僅在一方偏高）列表

---

### 十五、語義指數表：`semantic_indices`

**來源腳本：** `src/semantic/` 相關計算模塊

#### 語義多樣性的測量

**raw_intensity（原始強度）：** 就是各地區的語義 VTF 計數，反映某語義類別的絕對強度。

**normalized_index（標準化指數）：**

```
normalized_index = raw_intensity / MAX(raw_intensity_across_all_regions) × 100
```

這是一個省內相對排名，100 = 全省最強的地區。便於跨類別和跨地區比較（因為不同語義類別的絕對 VTF 差異很大：「聚落」類在所有地區都高，「基建」類普遍低，直接比較無意義）。

#### Shannon Entropy（信息熵）— 語義豐富度

來自信息論（Claude Shannon, 1948），衡量一個離散概率分佈的「不確定性」或「均勻程度」：

```
H = -Σᵢ pᵢ × log(pᵢ)     （自然對數，nats 為單位）
```

設 9 大類別的 VTF 頻率歸一化為概率分佈 `p₁,...,p₉`（`Σpᵢ=1`）：

- **最大熵：** 9 個類別均等分佈時 `H_max = log(9) ≈ 2.197`，意味著命名主題極多樣，沒有任何語義類別特別突出
- **最小熵：** 所有村莊集中在一個語義類別時 H=0，意味著命名風格極度單一

**地名學意義：** Shannon 熵高的地區，村名語義多樣，地形複雜、文化多元；熵低的地區，村名語義集中（如全是宗族類），命名習慣更統一。

#### Simpson 多樣性指數 — 來自生態學

原本用於衡量生態系統中物種多樣性，引申到語義類別的均勻分佈：

```
D = 1 - Σᵢ pᵢ²
```

等價形式：隨機從語料中抽取兩個字符（有放回），它們屬於不同語義類別的概率。`D∈[0,1]`：
- D → 1：類別分佈極均勻（任兩個字符大概率屬於不同類別）
- D → 0：完全集中在單一類別（任兩個字符幾乎屬於同一類別）

**與 Shannon 熵的區別：** Shannon 熵對稀少類別更敏感（因為 log 函數在 p→0 時放大），Simpson 指數對優勢類別更敏感（因為 p² 對大 p 更敏感）。兩者互補。

---

### 十六、村莊特征表：`village_features`

**來源腳本：** `scripts/core/generate_village_features.py`、`src/features/feature_extractor.py`

#### 特征提取邏輯

從 `广东省自然村_预处理.自然村_去前缀`（去前綴的規範村名）提取：

**後綴 N-gram（suffix_1/2/3）：**
- `suffix_1`：村名最後 1 個字符（例：「村」）
- `suffix_2`：村名最後 2 個字符（例：「水村」）
- `suffix_3`：村名最後 3 個字符（例：「大水村」）

**前綴 N-gram（prefix_1/2/3）：** 同理，取村名前 1/2/3 個字符。

**語義類別布爾標記（9 個，`sem_*`）：**
```python
# 使用 semantic_lexicon_v1.json（9 大類詞典）
char_labels = {char: category for category, chars in lexicon.items() for char in chars}
for char in village_name:
    if char in char_labels:
        category = char_labels[char]
        row[f'sem_{category}'] = 1  # 布爾標記，只要出現任意屬於該類的字符即為 1
```

9 個語義布爾列：`sem_mountain, sem_water, sem_settlement, sem_direction, sem_clan, sem_symbolic, sem_agriculture, sem_vegetation, sem_infrastructure`

- 值為 1 表示該村名至少包含一個屬於此語義類別的字符
- 值為 0 表示不包含

**聚類標注列（`kmeans_cluster_id, dbscan_cluster_id, gmm_cluster_id`）：** 由在線 ML 計算結果回寫（初始為 NULL）。

---

### 十七、ML 聚類在線計算（Module 7 — `/compute/clustering/*`）

**來源代碼：** `api/compute/` 後端路由

#### K-Means：最小化類內方差

K-Means 的目標是將 N 個數據點分成 k 個聚類，使每個聚類的「類內方差」（Within-Cluster Sum of Squares, WCSS）最小：

```
最小化：WCSS = Σᵢ₌₁ᵏ Σₓ∈Cᵢ ||x - μᵢ||²
```

其中 `μᵢ` 是聚類 `Cᵢ` 的質心（均值）。

**迭代求解（Lloyd's Algorithm）：**
1. 隨機初始化 k 個質心 `μ₁,...,μₖ`（本項目用 k-means++ 初始化，比純隨機收斂更快）
2. **分配步驟：** 每個數據點分配到最近的質心：`label(x) = argminᵢ ||x - μᵢ||²`
3. **更新步驟：** 重新計算每個聚類的質心：`μᵢ = mean(所有屬於 Cᵢ 的點)`
4. 重複 2-3 直到收斂（質心不再移動）或達到最大迭代次數

**K-Means 的假設與局限：** 假設每個聚類是球形的（由於使用歐氏距離），且所有聚類大小相近。如果地區的命名風格呈現非球形或大小差異懸殊的聚類結構，K-Means 效果較差。

#### GMM（Gaussian Mixture Model）：軟聚類

GMM 把 K-Means 的「硬分配」（每點只屬一個聚類）推廣為「軟分配」（每點屬於每個聚類的概率）：

**模型假設：** 數據來自 k 個高斯分佈的混合：

```
p(x) = Σᵢ₌₁ᵏ πᵢ × N(x | μᵢ, Σᵢ)
```

其中 `πᵢ` 是第 i 個分量的混合比例，`N(x | μᵢ, Σᵢ)` 是均值 `μᵢ`、協方差矩陣 `Σᵢ` 的高斯分佈。

**EM 算法求解（Expectation-Maximization）：**
- **E 步（期望）：** 計算每個點屬於每個高斯分量的後驗概率（責任值）：`γᵢₖ = πₖ × N(xᵢ | μₖ, Σₖ) / p(xᵢ)`
- **M 步（最大化）：** 利用責任值更新參數 `πₖ, μₖ, Σₖ` 使對數似然最大化
- 交替迭代直到收斂

**GMM 的優勢：** 每個聚類可以是橢圓形（因為有協方差矩陣），且輸出軟概率。對於命名風格有「漸變過渡」的地區（如客家話-粵語方言過渡帶），GMM 的軟分配能更準確地反映模糊邊界。

#### 聚類評估指標：三種不同視角

**Silhouette Score（輪廓系數）：** 衡量每個點「是否歸對了聚類」

對每個點 x，設 `a = 其所在聚類的平均類內距離`，`b = 最近異聚類的平均距離`：

```
s(x) = (b - a) / max(a, b)   ∈ [-1, 1]
```

- `s ≈ 1`：x 與本聚類緊密，與其他聚類分離（歸類正確）
- `s ≈ 0`：x 在兩個聚類邊界上（模糊）
- `s ≈ -1`：x 應該屬於另一個聚類（歸類錯誤）

整體 Silhouette Score = 所有點的均值。

**Davies-Bouldin Index（DBI）：** 衡量「類內散度 vs 類間分離度」的比率

```
DBI = (1/k) × Σᵢ max_{j≠i} [ (sᵢ + sⱼ) / dᵢⱼ ]
```

`sᵢ` = 聚類 i 的平均類內距離（散度），`dᵢⱼ` = 聚類 i 和 j 的質心距離。比率越小（類內緊湊、類間分離），聚類效果越好。DBI 越小越好。

**Calinski-Harabasz Score（CH Score，方差比標準）：**

```
CH = [tr(Bₖ) / (k-1)] / [tr(Wₖ) / (N-k)]
```

`tr(Bₖ)` = 類間散佈矩陣的跡（類間方差總量），`tr(Wₖ)` = 類內散佈矩陣的跡（類內方差總量）。本質上是「類間方差」相對「類內方差」的比值，比值越大說明聚類越清晰（類間差異大、類內差異小）。CH Score 越大越好。

#### PCA 降維（Principal Component Analysis）

特征矩陣可能是高維的（語義 9D + 形態 N D + 多樣性 2D，總計可達幾百維）。在高維空間中，距離計算受「維度詛咒」影響（高維空間中所有點距離趨於相等），且計算量大。

**PCA 的做法：** 找到特征空間中方差最大的方向（主成分），這些方向是數據變化最顯著的維度：

1. 計算特征矩陣的協方差矩陣 `C = X^T X / (n-1)`
2. 對 C 做特征值分解：`C = V Λ V^T`（V 的列即主成分方向）
3. 取前 50 個特征向量（解釋方差最多的方向），投影得到 50 維新特征

**為什麼用 50 維？** 前 50 個主成分通常能解釋原始特征 80-95% 的方差，同時去除噪聲維度，且距離計算更準確、更快。

#### StandardScaler 標準化的必要性

不同特征的量綱（scale）差異極大：語義 z_score 通常在 [-3, 3]，N-gram 頻率在 [0, 0.5]，Shannon 熵在 [0, 2.2]。若不標準化，量綱大的特征會主導距離計算，使量綱小的特征（即使信息豐富）被忽略。

StandardScaler 對每個特征列做：
```
x_scaled = (x - mean(x)) / std(x)
```

使每個特征列均值=0、方差=1，確保所有特征對距離計算的貢獻平等。

---

*算法詳情補充完畢（2026-02-28）。各算法公式均對應源代碼實現，可在 `src/analysis/`、`src/semantic/`、`scripts/core/` 目錄下找到具體實現。*


# 方音圖鑑 Chinese Dialect Atlas

一个专业的中文方言语言学分析和地理可视化平台，支持汉字音韵查询、中古音系统分析、方言地图可视化等功能。

## 项目简介

方音圖鑑是一个基于 Vue 3 的现代化方言研究工具，为语言学研究者、方言爱好者提供了强大的数据查询和可视化功能。平台集成了汉语方言数据库，支持多种维度的音韵分析和地理分布展示。

**核心功能**：
- 汉字在各方言点的读音、地位及注释查询
- 中古音系统反推和音位来源分析
- 调类调值查询和对比
- 方言数据地理可视化（基于 MapLibre）
- 用户自定义数据注记
- 多方言点对比分析
- 音系统计和音韵矩阵可视化
- 音节统计和音素分布分析
- 自定义音素分类表生成
- 批量数据管理和表格操作

## 功能特点

### 1. 查询系统
- **查字**：输入汉字查询其在各方言点的读音
- **查中古**：按中古地位整理读音，理解语音演变规律
- **查音位**：分析音位的中古来源，探究多音字根源
- **查调**：查询各方言点的调类、调值信息

### 2. 音系分析工具
- **音系统计**：生成方言点的音韵矩阵，展示声母、韵母、声调的完整音系
- **音节统计**：统计各方言点的音素分布，支持声母、韵母、声调的数量统计和地点对比
- **自定义音素表**：根据中古音分类（清浊、部位、方式等）生成自定义音素分类矩阵
- **批量数据管理**：管理员可批量添加、编辑、删除方言数据（支持 Excel 导入导出）

### 3. 地图可视化
- 基于 MapLibre GL 的高性能地图渲染
- 支持多种地图样式（街道、卫星、地形）
- 智能颜色分配算法（最大化视觉区分度）
- 自定义数据标注和绘图
- 响应式设计，支持移动端

### 4. 用户体验
- 现代化毛玻璃（Glassmorphism）UI 设计
- 流畅的页面切换动画
- 统一的 Toast 提示和确认对话框
- 状态保留和浏览器历史支持
- 响应式布局（桌面/平板/手机）

### 5. 技术特性
- Vue 3 Composition API + `<script setup>` 语法
- 响应式状态管理（无需 Vuex/Pinia）
- Promise 化的 API 请求层
- Token 自动管理和刷新
- 多入口 MPA 构建支持

## 技术栈

### 核心框架
- **Vue 3.5.20** - 渐进式 JavaScript 框架
- **Vue Router 4** - 单页应用路由管理
- **Vite 7.1.3** - 现代化前端构建工具

### 地图可视化
- **MapLibre GL** - 开源地图库

### 数据处理
- **opencc-js** - 简繁体中文转换
- **xlsx** - Excel 文件读写和数据导入导出

### 样式和设计
- **CSS 3** - 毛玻璃效果、渐变、动画
- **CSS Variables** - 系统化的主题变量

### 状态管理
- **Vue 3 Reactive** - 响应式数据管理
- **localStorage** - 本地持久化存储

## 项目结构

```
project/
├── src/
│   ├── main.js                 # 应用入口
│   ├── App.vue                 # 根组件
│   ├── router.js               # 路由配置
│   ├── style.css               # 全局样式和 CSS 变量
│   │
│   ├── layouts/                # 布局容器
│   │   ├── MenuLayout.vue      # 菜单布局
│   │   └── IntroLayout.vue     # 介绍布局
│   │
│   ├── views/                  # 页面组件
│   │   ├── MenuEntry.vue       # 菜单入口（动态 Tab 加载）
│   │   ├── ExploreEntry.vue    # 探索工具入口
│   │   └── menu/               # 各个功能页面
│   │       ├── QueryPage.vue       # 查询页面
│   │       ├── ResultPage.vue      # 结果页面
│   │       ├── MapPage.vue         # 地图页面
│   │       ├── AboutPage.vue       # 关于页面
│   │       ├── SourcePage.vue      # 资料来源
│   │       ├── PrivacyPage.vue     # 隐私政策
│   │       └── SettingPage.vue     # 设置页面
│   │
│   │   └── explore/            # 探索工具页面
│   │       ├── PhonologyPage.vue      # 音系统计
│   │       ├── Countphos.vue          # 音节统计
│   │       ├── PhonologyCustom.vue    # 自定义音素表
│   │       ├── TableManage.vue        # 表格管理
│   │       ├── YangChunVillages.vue   # 阳春自然村
│   │       ├── YangChunSpoken.vue     # 阳春口语词
│   │       ├── gdVillagesTree.vue     # 广东自然村树状图
│   │       ├── gdVillagesTable.vue    # 广东自然村表格
│   │       ├── ZhongGuPage.vue        # 中古汉字地位
│   │       ├── YuBaoPage.vue          # 语保资料
│   │       ├── CheckTool.vue          # 字表检查
│   │       ├── Jyut2IpaTool.vue       # 粤拼转IPA
│   │       └── MergeTool.vue          # 字表合并
│   │
│   ├── components/             # 可复用组件
│   │   ├── NavBar.vue          # 顶部导航栏
│   │   ├── GlobalToast.vue     # 全局提示系统
│   │   ├── GlobalConfirm.vue   # 全局确认对话框
│   │   ├── UniversalTable.vue  # 通用表格组件
│   │   ├── LocationMultiInput.vue  # 地点多选输入
│   │   │
│   │   ├── TableAndTree/       # 表格和树形组件
│   │   │   └── PhonologyTable.vue  # 音韵矩阵表格
│   │   │
│   │   ├── map/                # 地图相关组件
│   │   │   ├── MapLibre.vue    # MapLibre 地图主体
│   │   │   ├── CustomTab.vue   # 自定义 Tab
│   │   │   └── DivideTab.vue   # 分割 Tab
│   │   │
│   │   ├── query/              # 查询选择器组件
│   │   │   ├── LocationAndRegionInput.vue  # 地点/地区选择
│   │   │   ├── RegionSelector.vue          # 地区选择器
│   │   │   ├── ZhongguSelector.vue         # 中古音选择器
│   │   │   ├── YinweiSelector.vue          # 音位选择器
│   │   │   └── FloatingDice.vue            # 浮动配置器
│   │   │
│   │   └── result/             # 结果显示组件
│   │       ├── ResultList.vue          # 结果列表
│   │       ├── CharsAndTones.vue       # 字和调视图
│   │       ├── DataRow.vue             # 数据行
│   │       ├── FeaturePopup.vue        # 特征弹窗
│   │       ├── ValuePopup.vue          # 值弹窗
│   │       └── PanelManager.vue        # 面板管理器
│   │
│   ├── utils/                  # 工具模块
│   │   ├── store.js            # 状态管理（响应式数据）
│   │   ├── auth.js             # 认证和 API 请求
│   │   ├── message.js          # 消息提示系统
│   │   ├── constants.js        # 全局常量配置
│   │   ├── MapData.js          # 地图数据处理
│   │   ├── MapSource.js        # 地图资源和样式
│   │   └── ResultTable.js      # 结果表格数据处理
│   │
│   └── assets/                 # 静态资源
│
├── public/                     # 公共资源目录
├── vite.config.js              # Vite 构建配置
└── package.json                # 项目依赖和脚本
```

## 安装和运行

### 环境要求
- Node.js >= 16.0
- npm >= 8.0

### 安装依赖
```bash
npm install
```

### 开发环境
```bash
npm run dev
```
访问 http://localhost:5173

### 生产构建
```bash
npm run build
```
构建产物输出到 `dist/` 目录

### 预览生产构建
```bash
npm run preview
```

## 使用说明

### 1. 查询功能

#### 查字
1. 在顶部导航点击「查询」进入查询页面
2. 选择「查字」Tab
3. 输入要查询的汉字（支持多字）
4. 选择地点或地区
5. 点击「运行查询」
6. 在「结果」页面查看详细数据

#### 查中古
1. 选择「查中古」Tab
2. 从声母、韵母、调类中选择组合
3. 选择要查询的特征（声母/韵母/调类等）
4. 选择地点或地区
5. 运行查询查看结果

#### 查音位
1. 选择「查音位」Tab
2. 选择音位组（如：声母组、韵母组）
3. 输入具体音节值
4. 选择地点和特征
5. 运行查询

#### 查调
1. 选择「查调」Tab
2. 选择地点或地区
3. 运行查询查看调类调值信息

### 2. 地图可视化

1. 运行查询后，点击顶部「地图」Tab
2. 地图会自动加载查询结果
3. 可以切换地图样式（街道/卫星/地形）
4. 点击方言点查看详细信息
5. 使用「自定义」Tab 添加自己的标注

### 3. 音系分析工具

#### 音系统计
1. 访问「探索」→「音系统计」
2. 输入要查询的方言点
3. 点击「查询」生成音韵矩阵
4. 查看声母、韵母、声调的完整音系表

#### 音节统计
1. 访问「探索」→「音节统计」
2. 输入多个方言点进行对比
3. 查看汇总统计和各地点详情
4. 分析音素分布和地点差异

#### 自定义音素表
1. 访问「探索」→「自定义音素表」
2. 选择特征类型（声母/韵母/声调）
3. 配置横向、纵向、单元格分类
4. 生成自定义音素分类矩阵

### 4. 用户认证

- 匿名用户：有查询次数限制
- 注册用户：更高的查询权限
- 管理员：无限制访问

## API 接口

### 后端 API 端点

**Base URL**: `https://dialects.yzup.top/api`

| 端点 | 方法 | 说明 | 参数 |
|------|------|------|------|
| `/auth/me` | GET | 获取当前用户信息 | Headers: Authorization |
| `/phonology` | POST | 查询音韵数据 | Body: Payload 对象 |
| `/phonology_matrix` | POST | 获取音韵矩阵 | Body: { locations: string[] } |
| `/phonology_classification_matrix` | POST | 获取自定义音素分类矩阵 | Body: { locations, feature, horizontal_column, vertical_column, cell_row_column } |
| `/feature_counts` | GET | 获取音节统计数据 | Query: locations[] |
| `/get_custom` | GET | 获取用户自定义数据 | Query: user_id |

### Payload 结构

```javascript
// 查字
{
  chars: "汉字",
  locations: ["广州", "深圳"],
  regions: [],
  region_mode: "full"
}

// 查中古
{
  path_strings: ["帮_东_平"],
  locations: ["广州"],
  regions: [],
  features: ["声母", "韵母"],
  region_mode: "full"
}

// 查音位
{
  group_inputs: ["声母组"],
  pho_values: ["p"],
  locations: ["广州"],
  regions: [],
  features: ["声母"],
  region_mode: "full"
}

// 查调
{
  locations: ["广州"],
  regions: [],
  region_mode: "full"
}
```

## 状态管理

项目使用 Vue 3 响应式 API 进行状态管理，主要状态包括：

```javascript
// store.js
globalPayload     // 跨页面查询数据
userStore        // 用户认证信息 {role, isAuthenticated, username, id}
mapStore         // 地图数据状态 {mode, mapData, mergedData, loading}
queryStore       // 查询配置 {locations, regions, regionUsing}
resultCache      // 结果缓存 {mode, features, latestResults}
```

## 开发指南

### CSS 变量系统

项目使用 CSS Variables 管理主题色彩：

```css
/* src/style.css */
--primary-color: #4a90e2;
--secondary-color: #50c878;
--accent-color: #f39c12;
--text-primary: #2c3e50;
--glass-bg: rgba(255, 255, 255, 0.7);
--glass-border: rgba(255, 255, 255, 0.8);
```

### 全局提示系统

```javascript
// 导入
import { showSuccess, showError, showWarning, showInfo, showConfirm } from '@/utils/message.js'

// Toast 提示
showSuccess('操作成功')
showError('操作失败')
showWarning('请注意')
showInfo('提示信息')

// 确认对话框
const confirmed = await showConfirm('确定删除吗？', {
  title: '删除确认',
  confirmText: '删除',
  cancelText: '取消'
})
if (confirmed) {
  // 用户点击了确定
}
```

### API 请求

```javascript
// 导入
import { request } from '@/utils/auth.js'

// 发送请求
try {
  const data = await request('/phonology', {
    method: 'POST',
    body: JSON.stringify(payload)
  })
  console.log(data)
} catch (error) {
  showError(error.message)
}
```

## 性能优化

1. **分页加载** - 表格数据分页显示（50条/页）
2. **防抖搜索** - 查询防抖 1000ms
3. **KeepAlive 缓存** - 避免重复渲染查询页面
4. **懒加载路由** - 组件动态导入
5. **文件哈希** - 长期缓存静态资源

## 浏览器支持

- Chrome >= 90
- Firefox >= 88
- Safari >= 14
- Edge >= 90

## 配置说明

### 权限限制配置

```javascript
// src/utils/constants.js
export const ROLE_LIMITS = {
  anonymous: { locations: 2, regions: 1, chars: 5 },
  user: { locations: 100, regions: 100, chars: 100 },
  admin: { locations: Infinity, regions: Infinity, chars: Infinity }
}
```

### 地图配置

```javascript
// src/utils/constants.js
export const MAP_CONFIG = {
  CENTER: [113.2644, 23.1291],  // 广州
  ZOOM: 9,
  MAX_ZOOM: 18,
  MIN_ZOOM: 2
}
```

## 贡献指南

欢迎提交 Issue 和 Pull Request！

### 开发流程
1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 代码规范
- 使用 Vue 3 Composition API 和 `<script setup>` 语法
- 遵循 ESLint 配置
- 组件命名使用 PascalCase
- 工具函数命名使用 camelCase
- 添加必要的注释

## 许可证

ISC License

## 联系方式

- 项目主页: https://dialects.yzup.top
- GitHub: https://github.com/jengzang/dialects-js-frontend
- Issues: https://github.com/jengzang/dialects-js-frontend/issues

## 更新日志

### 1.1.0 (2026-02-05)
- 新增音系统计功能，支持音韵矩阵可视化
- 新增音节统计功能，支持音素分布分析和地点对比
- 新增自定义音素表功能，支持按中古音分类生成音素矩阵
- 新增表格管理功能，支持批量数据操作（管理员）
- 新增 /explore 探索工具路由
- 集成 opencc-js 支持简繁体转换
- 集成 xlsx 支持 Excel 数据导入导出
- 优化项目结构，分离 menu 和 explore 页面

### 1.0.0 (2026-01-20)
- 完成核心查询功能（查字、查中古、查音位、查调）
- 集成 MapLibre 地图可视化
- 实现用户认证系统
- 添加全局 Toast 和确认对话框
- 优化 UI 设计（毛玻璃风格）
- 完善响应式布局

## 致谢

感谢所有为中文方言研究做出贡献的学者和开发者。

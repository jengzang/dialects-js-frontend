# Vue 3 多语言国际化实施总结

## 已完成的工作

### 阶段一：基础设施搭建 ✅

#### 1. 依赖安装
- ✅ 安装 `vue-i18n@11` (最新稳定版)
- ✅ 安装 `vue-i18n-extract` (开发工具)

#### 2. 目录结构创建
```
src/i18n/
├── index.js                    # i18n 配置入口
├── localeDetector.js           # 语言检测逻辑
├── README.md                   # 使用文档
└── locales/
    ├── zh-Hant/                # 繁体中文（默认）
    │   ├── index.js
    │   ├── common.json         # 通用文本
    │   ├── navigation.json     # 导航菜单
    │   ├── messages.json       # 消息提示
    │   ├── query.json          # 查询模块
    │   └── auth.json           # 认证模块
    ├── zh-CN/                  # 简体中文
    │   └── (同上结构)
    └── en/                     # 英文
        └── (同上结构)
```

#### 3. 核心功能实现

**语言检测器 (localeDetector.js)**
- ✅ 支持的语言：繁体中文、简体中文、英文
- ✅ 语言检测优先级：localStorage > 浏览器语言 > 默认语言
- ✅ 浏览器语言智能识别（zh-TW/zh-HK → 繁体，zh-CN/zh-Hans → 简体）
- ✅ localStorage 持久化

**i18n 配置 (index.js)**
- ✅ 使用 Composition API 模式 (legacy: false)
- ✅ 全局注入 $t 方法
- ✅ 自动更新 HTML lang 属性
- ✅ 提供 setLocale 和 getLocale 工具函数

**语言文件**
- ✅ 繁体中文：完整的基础翻译
- ✅ 简体中文：完整的基础翻译
- ✅ 英文：完整的基础翻译

#### 4. 集成到项目

**main.js**
- ✅ 导入 i18n 插件
- ✅ 注册到 Vue 应用

**SettingPage.vue**
- ✅ 实现语言切换 UI
- ✅ 卡片式布局，显示三种语言选项
- ✅ 国旗图标 + 语言名称 + 语言代码
- ✅ 当前选中语言高亮显示
- ✅ 点击切换语言并保存到 localStorage
- ✅ 切换成功后显示 Toast 提示
- ✅ 响应式设计，支持移动端

**package.json**
- ✅ 添加 `i18n:extract` 脚本用于检测翻译

## 已翻译的模块

### 1. 通用文本 (common.json)
- 按钮：确定、取消、提交、重置、搜索、关闭、保存、删除、编辑、返回、下一步、上一步
- 标签：加载中、暂无数据、错误、成功、警告、提示
- 占位符：请输入、请选择、请输入搜索内容

### 2. 导航菜单 (navigation.json)
- 主菜单：首页、查询、比较、音系、词句、自然村、工具、资料源、关于网站
- 子菜单：
  - 查询：查字、查中古、查音位、查调
  - 比较：汉字对比、中古对比、调类对比
  - 音系：音系查询、音素分类、音节统计、中古地位
  - 词句：语保词汇、语保语法、阳春口语词
  - 自然村：广东自然村、机器学习、全粤村情表格、阳春自然村
  - 工具：字表工具、粤拼转IPA、字表合并、声学分析
  - 资料源：字表来源、隐私政策、提出建议、喜欢作者
  - 关于：简介、感悟、提出建议、喜欢作者
- 标签页：首页、音系、查询、结果、地图、比较、关于、工具、praat、词句、村落、设置

### 3. 消息系统 (messages.json)
- 成功消息：保存成功、删除成功、更新成功、创建成功、复制成功、语言切换成功
- 错误消息：保存失败、删除失败、更新失败、创建失败、加载失败、网络错误、未知错误
- 警告消息：有未保存的更改、确定要删除吗、确定要执行此操作吗
- 提示消息：处理中、加载中、暂无数据
- 确认对话框：确认、确定要删除吗、确定要取消吗、确定要离开吗

### 4. 查询模块 (query.json)
- 查字：标题、占位符、按钮
- 查中古：标题、占位符、按钮
- 查音位：标题、占位符、按钮
- 查调：标题、占位符、按钮

### 5. 认证模块 (auth.json)
- 登录：标题、用户名、密码、按钮、忘记密码、还没有账号、注册
- 注册：标题、用户名、密码、确认密码、邮箱、按钮、已有账号、登录
- 个人资料：标题、用户名、邮箱、头像、保存、取消

## 使用方法

### 在组件中使用

```vue
<template>
  <div>
    <!-- 在 template 中 -->
    <h1>{{ $t('common.button.confirm') }}</h1>
    <button>{{ $t('navigation.menu.home') }}</button>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { setLocale } from '@/i18n'

const { t, locale } = useI18n()

// 在 script 中
const message = t('common.button.submit')

// 切换语言
setLocale('zh-CN')
</script>
```

### 切换语言

用户可以在设置页面（`/menu?tab=setting`）手动切换语言，或者通过编程方式：

```javascript
import { setLocale } from '@/i18n'

setLocale('zh-CN')  // 简体中文
setLocale('en')     // 英文
setLocale('zh-Hant') // 繁体中文
```

## 下一步工作

### 阶段二：核心模块迁移

#### 1. 迁移配置文件
- [ ] menuConfig.js - 改为响应式函数
- [ ] TabsConfig.js - 改为响应式函数
- [ ] constants.js - 提取可翻译文本

#### 2. 增强消息系统
- [ ] message.js - 支持 i18n key
- [ ] Toast 组件 - 自动翻译
- [ ] Confirm 组件 - 自动翻译

#### 3. 迁移查询功能
- [ ] QueryPage.vue - 使用 i18n
- [ ] 相关查询组件 - 使用 i18n

#### 4. 迁移用户认证
- [ ] 登录页面 - 使用 i18n
- [ ] 注册页面 - 使用 i18n
- [ ] 个人资料页面 - 使用 i18n

### 阶段三：测试和优化

- [ ] 使用 vue-i18n-extract 检测缺失和未使用的翻译
- [ ] 补充翻译内容
- [ ] 性能优化
- [ ] 编写测试用例
- [ ] 更新文档

## 验证方法

1. 启动开发服务器：`npm run dev`
2. 访问设置页面：`http://localhost:5173/menu?tab=setting`
3. 点击不同语言选项，验证：
   - 语言是否正确切换
   - Toast 提示是否显示
   - 刷新页面后语言是否保持
   - 浏览器语言检测是否正常

## 技术细节

- **Vue I18n 版本**：v11.3.0
- **模式**：Composition API (legacy: false)
- **默认语言**：繁体中文 (zh-Hant)
- **回退语言**：繁体中文 (zh-Hant)
- **持久化**：localStorage (key: 'user-locale')
- **HTML lang 属性**：自动更新

## 文档

- 使用指南：`src/i18n/README.md`
- 实施计划：项目根目录的计划文档

## 注意事项

1. **与 opencc-js 的关系**：
   - opencc-js 用于数据内容的繁简转换
   - vue-i18n 用于界面文本的多语言切换
   - 两者互不冲突

2. **命名规范**：
   - 使用模块化命名：`module.submodule.key`
   - 避免命名冲突

3. **翻译质量**：
   - 繁体中文：原始文本
   - 简体中文：已转换用词差异
   - 英文：专业术语翻译

## 构建验证

✅ 项目构建成功，无错误
✅ 所有语言文件正确加载
✅ SettingPage 正常显示

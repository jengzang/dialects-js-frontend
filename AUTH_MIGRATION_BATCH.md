# 渐进式迁移 - 认证组件批次

## 当前状态：进行中 🔄

**批次**：用户认证相关组件
**开始时间**：刚刚启动
**预计完成**：3-5 分钟

## 本批次组件

### 正在迁移（5个组件）
1. **auth.vue** - 认证主页面（42处文本）
2. **LoginForm.vue** - 登录表单（8处文本）
3. **RegisterForm.vue** - 注册表单（6处文本）
4. **ProfileOverview.vue** - 个人资料概览（16处文本）
5. **ModifyProfileForm.vue** - 修改资料表单（9处文本）

**总计**：81 处中文文本

## 翻译文件已完成 ✅

### 新增翻译 key（约 80 个）

**auth.json 结构：**
```
auth/
├── loading/
│   └── syncData
├── login/
│   ├── title, email, username, password, button
│   ├── noAccount, viewBenefits
│   └── modes/ (email, username)
├── register/
│   ├── title, username, email, password
│   ├── confirmPassword, button
│   ├── hasAccount, viewBenefits
├── profile/
│   ├── welcome, viewBenefits
│   ├── userNumber, registerTime, onlineTime
│   ├── queryStatsNote, queryStats
│   ├── collapse, expand, totalQueries
│   ├── buttons/ (6个按钮)
│   └── tabs/ (info, ranking)
├── modifyProfile/
│   ├── welcome, backButton
│   ├── username/ (placeholder, button)
│   ├── password/ (currentPlaceholder, newPlaceholder, button)
│   └── tabs/ (username, password)
├── validation/
│   ├── passwordMinLength, usernameLength
│   ├── emailInvalid, passwordMismatch
│   ├── usernameExists, emailExists
│   ├── loginFailed, unknownError
├── messages/
│   ├── loginSuccess, loginSuccessDetail
│   ├── registerSuccess, registerSuccessDetail
│   ├── usernameUpdateSuccess, passwordUpdateSuccess
│   ├── errorDetail, parseError, logoutFailed
└── confirm/
    ├── modifyUsername/ (prompt, message, title, confirm, cancel)
    ├── modifyPassword/ (promptCurrent, promptNew, message, title, confirm, cancel)
    └── logout/ (message, title, confirm, cancel)
```

### 三种语言已完成 ✅
- ✅ 繁体中文（zh-Hant）
- ✅ 简体中文（zh-CN）
- ✅ 英文（en）

## 技术要点

### 动态插值示例
```vue
<!-- 欢迎消息 -->
<h1>{{ $t('auth.profile.welcome', { username: user.username }) }}</h1>

<!-- 用户编号 -->
<div v-html="$t('auth.profile.userNumber', { id: user.id })"></div>

<!-- 错误详情 -->
<div v-html="t('auth.messages.errorDetail', { detail: error })"></div>
```

### Confirm 对话框示例
```javascript
const result = await showConfirm(
  t('auth.confirm.logout.message'),
  {
    title: t('auth.confirm.logout.title'),
    confirmText: t('auth.confirm.logout.confirm'),
    cancelText: t('auth.confirm.logout.cancel')
  }
)
```

## 预期成果

### 迁移完成后
- ✅ 所有认证流程支持三种语言
- ✅ 登录/注册表单完全翻译
- ✅ 个人资料页面完全翻译
- ✅ 所有验证消息支持多语言
- ✅ 所有确认对话框支持多语言

### 覆盖率更新
- **组件总数**：148
- **已迁移**：10（5 + 5）
- **覆盖率**：6.8%
- **功能覆盖**：
  - 导航系统：100% ✅
  - 查询功能：100% ✅
  - 用户认证：100% ✅（本批次）
  - 消息系统：100% ✅

## 下一步计划

### 完成后立即测试
1. 测试登录流程
2. 测试注册流程
3. 测试个人资料页面
4. 测试修改用户名/密码
5. 切换语言验证所有文本

### 下一批次（优先级 2）
- ComparePage.vue
- AboutPage.vue
- SourcePage.vue
- PrivacyPage.vue
- MapPage.vue

**预计时间**：3-5 天

## 进度追踪

### 已完成批次
1. ✅ 核心导航组件（4个）- 阶段一、二
2. ✅ QueryPage（1个）- 阶段三
3. 🔄 认证组件（5个）- 进行中

### 累计统计
- **已迁移组件**：10/148（6.8%）
- **已添加翻译 key**：约 230 个
- **已替换硬编码文本**：约 200 处
- **工作时间**：约 8 小时

## 等待 Agent 完成

Agent 正在后台处理以下任务：
1. 为每个组件添加 i18n 导入
2. 替换所有硬编码中文文本
3. 处理动态插值
4. 处理 HTML 内容
5. 保持代码格式

**预计完成时间**：3-5 分钟

完成后将自动通知，然后我们可以：
1. 测试构建
2. 测试功能
3. 提交代码
4. 继续下一批次

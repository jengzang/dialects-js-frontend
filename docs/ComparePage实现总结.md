# ComparePage 实现总结

## 已完成的改造

### 1. 页面结构调整
- ✅ 移除了 tab3（查音位）
- ✅ 保留并改造了 tab1（比较汉字）、tab2（比较中古）、tab4（比较调类）
- ✅ 更新了标签名称为"比较"模式

### 2. 状态管理重构

#### Tab1 状态（比较汉字）
```javascript
tab1: {
  group1: { chars: '' },
  group2: { chars: '' },
  features: ['聲母', '韻母']  // 可选特征
}
```

#### Tab2 状态（比较中古）
```javascript
tab2: {
  group1: {
    card: '韻母',
    keys: ['攝'],
    valueMap: {},
    excludeColumns: []
  },
  group2: {
    card: '韻母',
    keys: ['攝'],
    valueMap: {},
    excludeColumns: []
  }
}
```

#### Tab4 状态（比较调类）
```javascript
tab4: {
  group1: { toneClasses: [] },
  group2: { toneClasses: [] }
}
```

### 3. UI 实现

#### Tab1: 比较汉字
- 上下分栏布局
- 组1 和 组2 各有独立的文本输入框
- VS 分隔符（带动画效果）
- 特征选择复选框（声母/韵母/声调）

#### Tab2: 比较中古
- 两套完整的中古选择器（ZhongguSelector）
- 每组独立的卡片选择、键名按钮、键值下拉
- 每组独立的过滤器（排除多地位等）
- 使用 `ZhongguRef1` 和 `ZhongguRef2` 分别引用两个组件

#### Tab4: 比较调类
- 两组调类复选框（T1-T10）
- 每组可独立选择多个调类

### 4. API 调用逻辑

#### Tab1 调用 `/api/compare/chars`
```javascript
{
  chars: [...group1Chars, ...group2Chars],
  features: ['聲母', '韻母'],
  locations: [...],
  regions: [...],
  region_mode: 'yindian',
  _compareMode: true,
  _group1Chars: group1Chars,
  _group2Chars: group2Chars
}
```

#### Tab2 调用 `/api/compare/ZhongGu`
```javascript
{
  path_strings1: [...],
  column1: null,
  combine_query1: false,
  exclude_columns1: [...],

  path_strings2: [...],
  column2: null,
  combine_query2: false,
  exclude_columns2: [...],

  locations: [...],
  regions: [...],
  features: ['韻母', '韻母'],
  region_mode: 'yindian',
  _compareMode: true
}
```

#### Tab4 调用 `/api/compare/tones`
```javascript
{
  tone_classes: [...group1Tones, ...group2Tones],
  locations: [...],
  regions: [...],
  region_mode: 'yindian',
  _compareMode: true,
  _group1Tones: group1Tones,
  _group2Tones: group2Tones
}
```

### 5. 视觉设计

#### VS 分隔符
- 渐变线条 + 中央徽章
- 紫色渐变背景
- 脉冲动画效果
- 响应式设计

#### 组标签
- 蓝色渐变背景
- 圆角设计
- 阴影效果

#### 比较组容器
- 半透明白色背景
- 毛玻璃效果（backdrop-filter）
- 圆角边框

### 6. 验证逻辑

#### Tab1 验证
- 组1 和 组2 都必须有至少一个汉字
- 至少选择一个特征（声母/韵母/声调）

#### Tab2 验证
- 由 ZhongguSelector 组件自动处理
- 每组必须有有效的中古音条件

#### Tab4 验证
- 组1 和 组2 都必须至少选择一个调类

### 7. 关键技术点

#### 动态 ref 管理
- 使用 `key + '_group1'` 和 `key + '_group2'` 区分两组的输入框
- `triggerRefs.value` 存储所有动态生成的 DOM 引用

#### 函数参数扩展
- 所有操作函数都添加了 `group` 参数（默认 'group1'）
- 例如：`selectValue(value, key, group)`、`isSelected(value, key, group)`

#### 过滤器管理
- 使用 `tab2_group1` 和 `tab2_group2` 作为下拉框标识
- `excludeFilterTriggerRef` 存储两组的触发器引用

### 8. 移动端适配
- VS 徽章在小屏幕下缩小
- 组标签字体调整
- 特征选择和调类选择自动换行
- 响应式间距调整

## 待测试项

1. **功能测试**
   - Tab1: 输入"知,章" vs "莊,初"，选择声母+韵母
   - Tab2: 选择"知组" vs "莊组"
   - Tab4: 选择 T1,T2 vs T3,T4

2. **UI 测试**
   - 移动端布局
   - VS 分隔符动画
   - 两组输入区域的视觉区分

3. **边界情况**
   - 组1 为空，组2 有值
   - 两组输入完全相同
   - 特征选择为空

## 文件修改清单

- ✅ `/project/src/views/menu/ComparePage.vue` - 主要改造文件
  - 模板：完全重写为双输入模式
  - 脚本：状态管理、函数逻辑、API 调用
  - 样式：新增比较模式专用样式

## 下一步

1. 测试页面功能是否正常
2. 根据后端 API 响应调整 payload 结构
3. 在 ResultPage 中处理比较模式的结果展示
4. 优化移动端体验

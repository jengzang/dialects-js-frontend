// Tab 配置文件
// 用于控制导航栏的 tab 显示和行为
// 供 NavBar 和未来的 explorebar 使用

import { resultCache } from '@/store/store.js'

export const MenuTabsConfig = [
  {
    tab: 'tools',
    label: '工具',
    icon: '🧰️',
    weight: 0.9,                          // 桌面端标签显示时的 flex 权重
    mobileWeight: 0.9,                    // 移动端标签显示时的 flex 权重
    weightIconOnly: 0.6,                  // 桌面端仅显示图标时的 flex 权重（可选，默认使用 weight）
    mobileWeightIconOnly: 0.5,            // 移动端仅显示图标时的 flex 权重（可选，回退链：mobileWeight → weightIconOnly → weight）
    fontSize: 1.2,
    mobileFontSize: 1.5,                  // 移动端使用更大的字体
    to: { path: '/menu', query: { tab: 'tools' } },
    isPseudo: false,
    hideOnMobile: true,
    hideLabelOnMobile: false,             // 移动端不隐藏标签
    showLabelOnlyWhenActive: false,        // 桌面端：只有选中时显示文字，未选中只显示图标
    mobileShowLabelOnlyWhenActive: true, // 移动端：始终显示文字（不同于桌面端）
    cssClass: ''                     // 应用 'small' CSS class
  },
  {
    tab: 'data',
    label: '音系',
    icon: '🧬',
    weight: 0.9,                          // 桌面端标签显示时的 flex 权重
    mobileWeight: 0.9,                    // 移动端标签显示时的 flex 权重
    weightIconOnly: 0.6,                  // 桌面端仅显示图标时的 flex 权重（可选，默认使用 weight）
    mobileWeightIconOnly: 0.5,            // 移动端仅显示图标时的 flex 权重（可选，回退链：mobileWeight → weightIconOnly → weight）
    fontSize: 1.2,
    mobileFontSize: 1.5,                  // 移动端使用更大的字体
    to: { path: '/menu', query: { tab: 'pho' } },
    isPseudo: false,
    hideOnMobile: false,
    hideLabelOnMobile: false,             // 移动端不隐藏标签
    showLabelOnlyWhenActive: false,        // 桌面端：只有选中时显示文字，未选中只显示图标
    mobileShowLabelOnlyWhenActive: true, // 移动端：始终显示文字（不同于桌面端）
    cssClass: ''                     // 应用 'small' CSS class
  },
  {
    tab: 'words',
    label: '詞句',
    icon: '📖',
    weight: 0.9,                          // 桌面端标签显示时的 flex 权重
    mobileWeight: 0.9,                // 移动端标签显示时的 flex 权重
    weightIconOnly: 0.6,                  // 桌面端仅显示图标时的 flex 权重（可选，默认使用 weight）
    mobileWeightIconOnly: 0.4,            // 移动端仅显示图标时的 flex 权重（可选，回退链：mobileWeight → weightIconOnly → weight）
    fontSize: 1.2,
    mobileFontSize: 1.5,                  // 移动端使用更大的字体
    to: { path: '/menu', query: { tab: 'words' } },
    isPseudo: false,
    hideOnMobile: false,
    hideLabelOnMobile: false,             // 移动端不隐藏标签
    showLabelOnlyWhenActive: false,        // 桌面端：只有选中时显示文字，未选中只显示图标
    mobileShowLabelOnlyWhenActive: true, // 移动端：始终显示文字（不同于桌面端）
    cssClass: ''                     // 应用 'small' CSS class
  },
  {
    tab: 'query',
    label: '查詢',
    icon: '🔍️',
    weight: 1,
    mobileWeight: 1,
    fontSize: 1.3,
    mobileFontSize: 1.3,
    to: { path: '/menu', query: { tab: 'query' } },
    isPseudo: false,
    hideOnMobile: false,
    hideLabelOnMobile: false,
    showLabelOnlyWhenActive: false,
    mobileShowLabelOnlyWhenActive: false,
    cssClass: ''
  },
  {
    tab: 'result',
    label: '結果',
    icon: '📉',
    weight: 0.9,                          // 桌面端标签显示时的 flex 权重
    mobileWeight: 0.9,                    // 移动端标签显示时的 flex 权重
    weightIconOnly: 0.6,                  // 桌面端仅显示图标时的 flex 权重（可选，默认使用 weight）
    mobileWeightIconOnly: 0.4,            // 移动端仅显示图标时的 flex 权重（可选，回退链：mobileWeight → weightIconOnly → weight）
    fontSize: 1.2,
    mobileFontSize: 1.3,
    to: { path: '/menu', query: { tab: 'result' } },
    isPseudo: false,
    hideOnMobile: false,
    hideLabelOnMobile: false,
    showLabelOnlyWhenActive: false,
    mobileShowLabelOnlyWhenActive: true,
    cssClass: '',
    visibleWhen: () => resultCache.latestResults.length > 0  // 只有在有查询结果时才显示
  },
  {
    tab: 'map',
    label: '地圖',
    icon: '🗺️',
    weight: 1,
    mobileWeight: 1,
    fontSize: 1.3,
    mobileFontSize: 1.3,
    to: { path: '/menu', query: { tab: 'map' } },
    isPseudo: false,
    hideOnMobile: false,
    hideLabelOnMobile: false,
    showLabelOnlyWhenActive: false,
    mobileShowLabelOnlyWhenActive: false,
    cssClass: ''
  },
  {
    tab: 'villages',
    label: '村落',
    icon: '🏘️',
    weight: 0.9,                          // 桌面端标签显示时的 flex 权重
    mobileWeight: 0.8,                // 移动端标签显示时的 flex 权重
    weightIconOnly: 0.6,                  // 桌面端仅显示图标时的 flex 权重（可选，默认使用 weight）
    mobileWeightIconOnly: 0.4,            // 移动端仅显示图标时的 flex 权重（可选，回退链：mobileWeight → weightIconOnly → weight）
    fontSize: 1.2,
    mobileFontSize: 1.5,                  // 移动端使用更大的字体
    to: { path: '/menu', query: { tab: 'villages' } },
    isPseudo: false,
    hideOnMobile: false,
    hideLabelOnMobile: false,             // 移动端不隐藏标签
    showLabelOnlyWhenActive: false,        // 桌面端：只有选中时显示文字，未选中只显示图标
    mobileShowLabelOnlyWhenActive: true, // 移动端：始终显示文字（不同于桌面端）
    cssClass: ''                     // 应用 'small' CSS class
  },
  {
    tab: 'about',
    label: '關於網站',
    icon: '🌐️',
    weight: 0.8,                          // 桌面端标签显示时的 flex 权重
    weightIconOnly: 0.25,                  // 桌面端仅显示图标时的 flex 权重（可选，默认使用 weight）
    fontSize: 1.2,
    to: { path: '/menu', query: { tab: 'about' } },
    hideOnMobile: true,
    showLabelOnlyWhenActive: true,        // 桌面端：只有选中时显示文字，未选中只显示图标
    cssClass: ''                     // 应用 'small' CSS class
  },
]

/**
 * ExploreTabsConfig - Explore 页面的 Tab 配置
 * 对应 menuConfig.js 中有 children 的 4 个分类
 */
export const ExploreTabsConfig = [
  {
    tab: 'tools',
    label: '工具',
    icon: '🧰',
    weight: 1,                          // 桌面端标签显示时的 flex 权重
    mobileWeight: 1,                // 移动端标签显示时的 flex 权重
    weightIconOnly: 0.6,                  // 桌面端仅显示图标时的 flex 权重（可选，默认使用 weight）
    mobileWeightIconOnly: 0.6,            // 移动端仅显示图标时的 flex 权重（可选，回退链：mobileWeight → weightIconOnly → weight）
    fontSize: 1.2,
    mobileFontSize: 1.3,
    to: { path: '/menu', query: { tab: 'tools' } },
    isPseudo: false,
    hideOnMobile: false,
    hideLabelOnMobile: false,
    showLabelOnlyWhenActive: false,
    mobileShowLabelOnlyWhenActive: true
  },
  {
    tab: 'data',
    label: '音系',
    icon: '🧬',
    weight: 1,                          // 桌面端标签显示时的 flex 权重
    mobileWeight: 1,                // 移动端标签显示时的 flex 权重
    weightIconOnly: 0.6,                  // 桌面端仅显示图标时的 flex 权重（可选，默认使用 weight）
    mobileWeightIconOnly: 0.55,            // 移动端仅显示图标时的 flex 权重（可选，回退链：mobileWeight → weightIconOnly → weight）
    fontSize: 1.2,
    mobileFontSize: 1.2,
    to: { path: '/menu', query: { tab: 'pho' } },
    isPseudo: false,
    hideOnMobile: false,
    hideLabelOnMobile: false,
    showLabelOnlyWhenActive: false,
    mobileShowLabelOnlyWhenActive: true
  },
  {
    tab: 'words',
    label: '詞句',
    icon: '📖',
    weight: 1,                          // 桌面端标签显示时的 flex 权重
    mobileWeight: 1,                // 移动端标签显示时的 flex 权重
    weightIconOnly: 0.6,                  // 桌面端仅显示图标时的 flex 权重（可选，默认使用 weight）
    mobileWeightIconOnly: 0.55,            // 移动端仅显示图标时的 flex 权重（可选，回退链：mobileWeight → weightIconOnly → weight）
    fontSize: 1.2,
    mobileFontSize: 1.2,
    to: { path: '/menu', query: { tab: 'words' } },
    isPseudo: false,
    hideOnMobile: false,
    hideLabelOnMobile: false,
    showLabelOnlyWhenActive: false,
    mobileShowLabelOnlyWhenActive: true
  },
  {
    tab: 'query',
    label: '查詢',
    icon: '🔍️',
    weight: 1,                          // 桌面端标签显示时的 flex 权重
    mobileWeight: 1,                // 移动端标签显示时的 flex 权重
    weightIconOnly: 0.6,                  // 桌面端仅显示图标时的 flex 权重（可选，默认使用 weight）
    mobileWeightIconOnly: 0.35,            // 移动端仅显示图标时的 flex 权重（可选，回退链：mobileWeight → weightIconOnly → weight）
    fontSize: 1.2,
    mobileFontSize: 1.2,
    to: { path: '/menu', query: { tab: 'query' } },
    isPseudo: false,
    hideOnMobile: false,
    hideLabelOnMobile: false,
    showLabelOnlyWhenActive: false,
    mobileShowLabelOnlyWhenActive: true,
    cssClass: ''
  },
  {
    tab: 'villages',
    label: '村落',
    icon: '🏘️',
    weight: 1,                          // 桌面端标签显示时的 flex 权重
    mobileWeight: 1,                // 移动端标签显示时的 flex 权重
    weightIconOnly: 0.6,                  // 桌面端仅显示图标时的 flex 权重（可选，默认使用 weight）
    mobileWeightIconOnly: 0.55,            // 移动端仅显示图标时的 flex 权重（可选，回退链：mobileWeight → weightIconOnly → weight）
    fontSize: 1.2,
    mobileFontSize: 1.2,
    to: { path: '/menu', query: { tab: 'villages' } },
    isPseudo: false,
    hideOnMobile: false,
    hideLabelOnMobile: false,
    showLabelOnlyWhenActive: false,
    mobileShowLabelOnlyWhenActive: true
  },
  {
    tab: 'about',
    label: '關於網站',
    icon: '🌐️',
    weight: 0.8,                          // 桌面端标签显示时的 flex 权重
    weightIconOnly: 0.25,                  // 桌面端仅显示图标时的 flex 权重（可选，默认使用 weight）
    fontSize: 0.9,
    to: { path: '/menu', query: { tab: 'about' } },
    hideOnMobile: true,
    // showLabelOnlyWhenActive: true,        // 桌面端：只有选中时显示文字，未选中只显示图标
    cssClass: ''                     // 应用 'small' CSS class
  },

]

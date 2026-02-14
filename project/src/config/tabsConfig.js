// Tab 配置文件
// 用于控制导航栏的 tab 显示和行为
// 供 NavBar 和未来的 explorebar 使用

import { resultCache } from '@/utils/store.js'

export const tabsConfig = [
  {
    tab: 'tools',
    label: '工具集',
    icon: '🛠️',
    weight: 1,
    mobileWeight: 1,                      // 移动端 flex 权重（可选，不设置则使用 weight）
    fontSize: 1.3,
    mobileFontSize: 1.3,                  // 移动端字体大小（可选，不设置则使用 fontSize）
    to: null,                             // 伪 tab 不需要路由
    isPseudo: true,                       // 点击打开侧边栏，不进行路由导航
    hideOnMobile: true,                   // 移动端完全隐藏此 tab
    hideLabelOnMobile: false,             // 移动端是否隐藏文字（只显示图标）
    showLabelOnlyWhenActive: false,       // 桌面端：只有选中时显示文字，未选中只显示图标
    mobileShowLabelOnlyWhenActive: false, // 移动端：只有选中时显示文字（可选，不设置则使用 showLabelOnlyWhenActive）
    cssClass: ''                          // 额外的 CSS class
  },
  {
    tab: 'YuBao',
    label: '詞句',
    icon: '📖',
    weight: 0.8,
    mobileWeight: 0.6,                    // 移动端权重更小（只显示图标）
    fontSize: 1.3,
    mobileFontSize: 1.5,                  // 移动端使用更大的字体
    to: { path: '/menu', query: { tab: 'words' } },
    isPseudo: false,
    hideOnMobile: false,
    hideLabelOnMobile: false,             // 移动端只显示图标，不显示文字
    showLabelOnlyWhenActive: true,        // 桌面端：只有选中时显示文字，未选中只显示图标
    mobileShowLabelOnlyWhenActive: false, // 移动端：始终显示文字（不同于桌面端）
    cssClass: 'small'                     // 应用 'small' CSS class
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
    icon: '📈',
    weight: 1,
    mobileWeight: 1,
    fontSize: 1.3,
    mobileFontSize: 1.3,
    to: { path: '/menu', query: { tab: 'result' } },
    isPseudo: false,
    hideOnMobile: false,
    hideLabelOnMobile: false,
    showLabelOnlyWhenActive: false,
    mobileShowLabelOnlyWhenActive: false,
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
  }
]

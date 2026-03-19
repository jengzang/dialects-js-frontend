// Tab 配置文件
// 用于控制导航栏的 tab 显示和行为
// 供 NavBar 和未来的 explorebar 使用

import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { resultCache } from '@/store/store.js'

export function useMenuTabsConfig() {
  const { t } = useI18n()
  return computed(() => [
  // {
  //   tab: 'tools',
  //   label: t('navigation.tabs.tools'),
  //   icon: '🧰️',
  //   weight: 0.9,                          // 桌面端标签显示时的 flex 权重
  //   mobileWeight: 0.9,                    // 移动端标签显示时的 flex 权重
  //   weightIconOnly: 0.6,                  // 桌面端仅显示图标时的 flex 权重（可选，默认使用 weight）
  //   mobileWeightIconOnly: 0.5,            // 移动端仅显示图标时的 flex 权重（可选，回退链：mobileWeight → weightIconOnly → weight）
  //   fontSize: 1.2,
  //   mobileFontSize: 1.5,                  // 移动端使用更大的字体
  //   to: { path: '/menu', query: { tab: 'tools' } },
  //   isPseudo: false,
  //   hideOnMobile: true,
  //   hideLabelOnMobile: false,             // 移动端不隐藏标签
  //   showLabelOnlyWhenActive: false,        // 桌面端：只有选中时显示文字，未选中只显示图标
  //   mobileShowLabelOnlyWhenActive: true, // 移动端：始终显示文字（不同于桌面端）
  //   cssClass: ''                     // 应用 'small' CSS class
  // },
  //   {
  //   tab: 'home',
  //   label: t('navigation.tabs.home'),
  //   icon: '🏛️',
  //   weight: 0.8,                          // 桌面端标签显示时的 flex 权重
  //   weightIconOnly: 0.4,                  // 桌面端仅显示图标时的 flex 权重（可选，默认使用 weight）
  //   fontSize: 1.3,
  //   to: { path: '/' },
  //   hideOnMobile: false,
  //   hideLabelOnMobile: false,             // 移动端不隐藏标签
  //   showLabelOnlyWhenActive: false,        // 桌面端：只有选中时显示文字，未选中只显示图标
  //   mobileShowLabelOnlyWhenActive: true, // 移动端：始终显示文字（不同于桌面端）
  //   cssClass: ''                     // 应用 'small' CSS class
  // },
  {
    tab: 'data',
    label: t('navigation.tabs.phonology'),
    icon: '🧬',
    weight: 0.9,                          // 桌面端标签显示时的 flex 权重
    mobileWeight: 0.9,                    // 移动端标签显示时的 flex 权重
    weightIconOnly: 0.6,                  // 桌面端仅显示图标时的 flex 权重（可选，默认使用 weight）
    mobileWeightIconOnly: 0.5,            // 移动端仅显示图标时的 flex 权重（可选，回退链：mobileWeight → weightIconOnly → weight）
    fontSize: 1.4,
    mobileFontSize: 1.5,                  // 移动端使用更大的字体
    to: { path: '/menu', query: { tab: 'pho' } },
    isPseudo: false,
    hideOnMobile: false,
    hideLabelOnMobile: false,             // 移动端不隐藏标签
    showLabelOnlyWhenActive: false,        // 桌面端：只有选中时显示文字，未选中只显示图标
    mobileShowLabelOnlyWhenActive: true, // 移动端：始终显示文字（不同于桌面端）
    cssClass: ''                     // 应用 'small' CSS class
  },
  // {
  //   tab: 'words',
  //   label: t('navigation.tabs.phrases'),
  //   icon: '📖',
  //   weight: 0.9,                          // 桌面端标签显示时的 flex 权重
  //   mobileWeight: 0.9,                // 移动端标签显示时的 flex 权重
  //   weightIconOnly: 0.6,                  // 桌面端仅显示图标时的 flex 权重（可选，默认使用 weight）
  //   mobileWeightIconOnly: 0.4,            // 移动端仅显示图标时的 flex 权重（可选，回退链：mobileWeight → weightIconOnly → weight）
  //   fontSize: 1.2,
  //   mobileFontSize: 1.5,                  // 移动端使用更大的字体
  //   to: { path: '/menu', query: { tab: 'words' } },
  //   isPseudo: false,
  //   hideOnMobile: false,
  //   hideLabelOnMobile: false,             // 移动端不隐藏标签
  //   showLabelOnlyWhenActive: false,        // 桌面端：只有选中时显示文字，未选中只显示图标
  //   mobileShowLabelOnlyWhenActive: true, // 移动端：始终显示文字（不同于桌面端）
  //   cssClass: ''                     // 应用 'small' CSS class
  // },
  {
    tab: 'query',
    label: t('navigation.tabs.query'),
    icon: '🔍️',
    weight: 0.9,                          // 桌面端标签显示时的 flex 权重
    mobileWeight: 0.9,                    // 移动端标签显示时的 flex 权重
    weightIconOnly: 0.6,                  // 桌面端仅显示图标时的 flex 权重（可选，默认使用 weight）
    mobileWeightIconOnly: 0.5,            // 移动端仅显示图标时的 flex 权重（可选，回退链：mobileWeight → weightIconOnly → weight）
    fontSize: 1.4,
    mobileFontSize: 1.5,                  // 移动端使用更大的字体
    to: { path: '/menu', query: { tab: 'query' } },
    isPseudo: false,
    hideOnMobile: false,
    hideLabelOnMobile: false,             // 移动端不隐藏标签
    showLabelOnlyWhenActive: false,        // 桌面端：只有选中时显示文字，未选中只显示图标
    mobileShowLabelOnlyWhenActive: true, // 移动端：始终显示文字（不同于桌面端）
    cssClass: ''
  },

  {
    tab: 'result',
    label: t('navigation.tabs.results'),
    icon: '📉',
    weight: 0.9,                          // 桌面端标签显示时的 flex 权重
    mobileWeight: 0.9,                    // 移动端标签显示时的 flex 权重
    weightIconOnly: 0.6,                  // 桌面端仅显示图标时的 flex 权重（可选，默认使用 weight）
    mobileWeightIconOnly: 0.4,            // 移动端仅显示图标时的 flex 权重（可选，回退链：mobileWeight → weightIconOnly → weight）
    fontSize: 1.4,
    mobileFontSize: 1.5,
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
    label: t('navigation.tabs.map'),
    icon: '🗺️',
    weight: 0.9,                          // 桌面端标签显示时的 flex 权重
    mobileWeight: 0.9,                    // 移动端标签显示时的 flex 权重
    weightIconOnly: 0.6,                  // 桌面端仅显示图标时的 flex 权重（可选，默认使用 weight）
    mobileWeightIconOnly: 0.5,            // 移动端仅显示图标时的 flex 权重（可选，回退链：mobileWeight → weightIconOnly → weight）
    fontSize: 1.4,
    mobileFontSize: 1.5,                  // 移动端使用更大的字体
    to: { path: '/menu', query: { tab: 'map' } },
    isPseudo: false,
    hideOnMobile: false,
    hideLabelOnMobile: false,             // 移动端不隐藏标签
    showLabelOnlyWhenActive: false,        // 桌面端：只有选中时显示文字，未选中只显示图标
    mobileShowLabelOnlyWhenActive: true, // 移动端：始终显示文字（不同于桌面端）
    cssClass: ''
  },
  {
    tab: 'compare',
    label: t('navigation.tabs.compare'),
    icon: '↔️',
   weight: 0.9,                          // 桌面端标签显示时的 flex 权重
    mobileWeight: 0.9,                    // 移动端标签显示时的 flex 权重
    weightIconOnly: 0.6,                  // 桌面端仅显示图标时的 flex 权重（可选，默认使用 weight）
    mobileWeightIconOnly: 0.5,            // 移动端仅显示图标时的 flex 权重（可选，回退链：mobileWeight → weightIconOnly → weight）
    fontSize: 1.4,
    mobileFontSize: 1.5,                  // 移动端使用更大的字体
    to: { path: '/menu', query: { tab: 'compare' } },
    isPseudo: false,
       hideOnMobile: false,
    hideLabelOnMobile: false,             // 移动端不隐藏标签
    showLabelOnlyWhenActive: false,        // 桌面端：只有选中时显示文字，未选中只显示图标
    mobileShowLabelOnlyWhenActive: true, // 移动端：始终显示文字（不同于桌面端）
    cssClass: ''
  },
  // {
  //   tab: 'villages',
  //   label: t('navigation.tabs.villages'),
  //   icon: '🏘️',
  //   weight: 0.9,                          // 桌面端标签显示时的 flex 权重
  //   mobileWeight: 0.8,                // 移动端标签显示时的 flex 权重
  //   weightIconOnly: 0.6,                  // 桌面端仅显示图标时的 flex 权重（可选，默认使用 weight）
  //   mobileWeightIconOnly: 0.4,            // 移动端仅显示图标时的 flex 权重（可选，回退链：mobileWeight → weightIconOnly → weight）
  //   fontSize: 1.2,
  //   mobileFontSize: 1.5,                  // 移动端使用更大的字体
  //   to: { path: '/menu', query: { tab: 'villages' } },
  //   isPseudo: false,
  //   hideOnMobile: false,
  //   hideLabelOnMobile: false,             // 移动端不隐藏标签
  //   showLabelOnlyWhenActive: false,        // 桌面端：只有选中时显示文字，未选中只显示图标
  //   mobileShowLabelOnlyWhenActive: true, // 移动端：始终显示文字（不同于桌面端）
  //   cssClass: ''                     // 应用 'small' CSS class
  // },
  {
    tab: 'about',
    label: t('navigation.tabs.about'),
    icon: '🌐️',
    weight: 0.8,                          // 桌面端标签显示时的 flex 权重
    weightIconOnly: 0.25,                  // 桌面端仅显示图标时的 flex 权重（可选，默认使用 weight）
    fontSize: 1.2,
    to: { path: '/menu', query: { tab: 'about' } },
    hideOnMobile: false,
    hideLabelOnMobile: false,             // 移动端不隐藏标签
    showLabelOnlyWhenActive: false,        // 桌面端：只有选中时显示文字，未选中只显示图标
    mobileShowLabelOnlyWhenActive: true, // 移动端：始终显示文字（不同于桌面端）
    cssClass: ''                     // 应用 'small' CSS class
  },
])
}

export function useExploreTabsConfig() {
  const { t } = useI18n()
  return computed(() => [
  // {
  //   tab: 'home',
  //   label: t('navigation.tabs.home'),
  //   icon: '🏠️',
  //   weight: 0.8,                          // 桌面端标签显示时的 flex 权重
  //   weightIconOnly: 0.4,                  // 桌面端仅显示图标时的 flex 权重（可选，默认使用 weight）
  //   fontSize: 1.3,
  //   to: { path: '/' },
  //   hideOnMobile: false,
  //   hideLabelOnMobile: false,             // 移动端不隐藏标签
  //   showLabelOnlyWhenActive: false,        // 桌面端：只有选中时显示文字，未选中只显示图标
  //   mobileShowLabelOnlyWhenActive: true, // 移动端：始终显示文字（不同于桌面端）
  //   cssClass: ''                     // 应用 'small' CSS class
  // },
  {
    tab: 'tools',
    label: t('navigation.tabs.tools'),
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
    tab: 'praat',
    label: t('navigation.tabs.praat'), // 或者直接用 'Praat'
    icon: '🎙️',        // 模拟声谱图/音高曲线，或者使用 〰️ (波浪) 或 📊
    weight: 1,
    mobileWeight: 1,
    weightIconOnly: 0.6,
    mobileWeightIconOnly: 0.6,
    fontSize: 1.2,
    mobileFontSize: 1.3,
    // 关键：修改跳转路径
    to: { path: '/explore', query: { page: 'praat' } }, 
    isPseudo: false,
    hideOnMobile: false,
    hideLabelOnMobile: false,
    showLabelOnlyWhenActive: false,
    mobileShowLabelOnlyWhenActive: true
  },
  {
    tab: 'charClass',
    label: t('navigation.tabs.charClass'),
    icon: '📚',
    weight: 1,
    mobileWeight: 1,
    weightIconOnly: 0.6,
    mobileWeightIconOnly: 0.55,
    fontSize: 1.2,
    mobileFontSize: 1.2,
    to: { path: '/explore', query: { page: 'CharacterClassification' } },
    isPseudo: false,
    hideOnMobile: false,
    hideLabelOnMobile: false,
    showLabelOnlyWhenActive: false,
    mobileShowLabelOnlyWhenActive: true
  },
  {
    tab: 'words',
    label: t('navigation.tabs.phrases'),
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
    tab: 'villages',
    label: t('navigation.tabs.villages'),
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
    label: t('navigation.tabs.aboutWebsite'),
    icon: '🌐️',
    weight: 0.8,                          // 桌面端标签显示时的 flex 权重
    weightIconOnly: 0.25,                  // 桌面端仅显示图标时的 flex 权重（可选，默认使用 weight）
    fontSize: 0.9,
    to: { path: '/menu', query: { tab: 'about' } },
    hideOnMobile: true,
    // showLabelOnlyWhenActive: true,        // 桌面端：只有选中时显示文字，未选中只显示图标
    cssClass: ''                     // 应用 'small' CSS class
  },

])
}
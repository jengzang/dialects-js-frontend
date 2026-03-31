import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const DISPLAY_DEFAULTS = {
  weight: 1,
  mobileWeight: 1,
  weightIconOnly: 0.6,
  mobileWeightIconOnly: 0.55,
  fontSize: 1.2,
  mobileFontSize: 1.2,
  isPseudo: false,
  hideOnMobile: false,
  hideLabelOnMobile: false,
  showLabelOnlyWhenActive: false,
  mobileShowLabelOnlyWhenActive: true,
  cssClass: '',
  visibleWhen: null
}

const NAVIGATION_DEFAULTS = {
  defaultTo: null,
  matchPages: [],
  rememberChild: false,
  defaultChild: null,
  children: []
}

const DISPLAY_PRESETS = {
  standard: {},
  compactDesktop: {
    weight: 0.8,
    mobileWeight: 0.8,
    weightIconOnly: 0.25,
    mobileWeightIconOnly: 0.25,
    fontSize: 0.9,
    mobileFontSize: 0.9
  },
  balancedMobile: {
    mobileWeightIconOnly: 0.6,
    mobileFontSize: 1.3
  }
}

const createDisplayConfig = ({ preset = 'standard', overrides = {} } = {}) => ({
  ...DISPLAY_DEFAULTS,
  ...(DISPLAY_PRESETS[preset] || {}),
  ...overrides
})

const createNavigationConfig = (overrides = {}) => ({
  ...NAVIGATION_DEFAULTS,
  ...overrides
})

const createExploreTab = ({
  tab,
  label,
  icon,
  display,
  navigation,
  meta = {}
}) => ({
  tab,
  label,
  icon,
  display: createDisplayConfig(display),
  navigation: createNavigationConfig(navigation),
  meta
})

export function useExploreBarConfig() {
  const { t } = useI18n()

  return computed(() => ({
    tools: createExploreTab({
      tab: 'tools',
      label: t('navigation.tabs.tools'),
      icon: '🔧',
      display: {
        preset: 'balancedMobile'
      },
      navigation: {
        defaultTo: { path: '/menu', query: { tab: 'tools' } },
        matchPages: ['check', 'jyut2ipa', 'merge', 'praat'],
        rememberChild: true,
        defaultChild: '/explore?page=check',
        children: [
          { label: t('navigation.submenu.tools.check'), icon: '📝', path: '/explore?page=check' },
          { label: t('navigation.submenu.tools.jyut2ipa'), icon: '🔜', path: '/explore?page=jyut2ipa' },
          { label: t('navigation.submenu.tools.merge'), icon: '🔆', path: '/explore?page=merge' },
          { label: t('navigation.submenu.tools.praat'), icon: '🎘', path: '/explore?page=praat' }
        ]
      }
    }),
    praat: createExploreTab({
      tab: 'praat',
      label: t('navigation.tabs.praat'),
      icon: '🎙️',
      display: {
        preset: 'balancedMobile',
        overrides: {
          mobileWeightIconOnly: 0.6
        }
      },
      navigation: {
        defaultTo: { path: '/explore', query: { page: 'praat' } },
        matchPages: ['praat']
      }
    }),
    charClass: createExploreTab({
      tab: 'charClass',
      label: t('navigation.tabs.charClass'),
      icon: '📚',
      navigation: {
        defaultTo: { path: '/explore', query: { page: 'CharacterClassification' } },
        matchPages: ['CharacterClassification'],
        rememberChild: true,
        defaultChild: '/explore?page=CharacterClassification&sub=zhonggu',
        children: [
          { label: t('navigation.submenu.charClass.zhonggu'), icon: '📜', path: '/explore?page=CharacterClassification&sub=zhonggu' },
          { label: t('navigation.submenu.charClass.shanggu'), icon: '🏛️', path: '/explore?page=CharacterClassification&sub=shanggu' },
          { label: t('navigation.submenu.charClass.jingu'), icon: '📉', path: '/explore?page=CharacterClassification&sub=jingu' },
          { label: t('navigation.submenu.charClass.yueyun'), icon: '🎍', path: '/explore?page=CharacterClassification&sub=yueyun' }
        ]
      }
    }),
    words: createExploreTab({
      tab: 'words',
      label: t('navigation.tabs.phrases'),
      icon: '📝',
      navigation: {
        defaultTo: { path: '/menu', query: { tab: 'words' } },
        matchPages: ['YuBao', 'ycSpoken'],
        rememberChild: true,
        defaultChild: '/explore?page=YuBao&sub=vocabulary',
        children: [
          { label: t('navigation.submenu.words.vocabulary'), icon: '📝', path: '/explore?page=YuBao&sub=vocabulary' },
          { label: t('navigation.submenu.words.grammar'), icon: '🗣️', path: '/explore?page=YuBao&sub=grammar' },
          { label: t('navigation.submenu.words.ycSpoken'), icon: '🌀', path: '/explore?page=ycSpoken' }
        ]
      }
    }),
    villages: createExploreTab({
      tab: 'villages',
      label: t('navigation.tabs.villages'),
      icon: '🏘️',
      navigation: {
        defaultTo: { path: '/menu', query: { tab: 'villages' } },
        matchPages: ['gdVillages', 'gdVillagesTable', 'ycVillages', 'VillagesML'],
        rememberChild: true,
        defaultChild: '/explore?page=gdVillages',
        children: [
          { label: t('navigation.submenu.villages.gdVillages'), icon: '🏘️', path: '/explore?page=gdVillages' },
          { label: t('navigation.submenu.villages.VillagesML'), icon: '🤻', path: '/explore?page=VillagesML' },
          { label: t('navigation.submenu.villages.gdVillagesTable'), icon: '📈', path: '/explore?page=gdVillagesTable' },
          { label: t('navigation.submenu.villages.ycVillages'), icon: '🏠', path: '/explore?page=ycVillages' }
        ]
      }
    }),
    about: createExploreTab({
      tab: 'about',
      label: t('navigation.tabs.aboutWebsite'),
      icon: '🫶',
      display: {
        preset: 'compactDesktop',
        overrides: {
          hideOnMobile: true
        }
      },
      navigation: {
        defaultTo: { path: '/menu', query: { tab: 'about' } }
      }
    })
  }))
}

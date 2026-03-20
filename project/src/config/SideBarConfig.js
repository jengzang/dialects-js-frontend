// Menu configuration for navigation system (i18n version)
// Supports two-level navigation: direct links and expandable submenus

import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

/**
 * 使用响应式菜单配置（支持 i18n）
 * @returns {ComputedRef} 响应式菜单配置对象
 */
export function useMenuConfig() {
  const { t } = useI18n()

  return computed(() => ({
    'home': {
      label: t('navigation.menu.home'),
      icon: '🏛️',
      path: '/',
      external: true,
      children: null,
    },
    'query': {
      label: t('navigation.menu.query'),
      icon: '🔍️',
      path: '/menu?tab=query',
      children: [
        {
          label: t('navigation.submenu.query.tab1'),
          icon: '🔣',
          path: '/menu?tab=query&sub=tab1'
        },
        {
          label: t('navigation.submenu.query.tab2'),
          icon: '📜',
          path: '/menu?tab=query&sub=tab2'
        },
        {
          label: t('navigation.submenu.query.tab3'),
          icon: '🗣️',
          path:'/menu?tab=query&sub=tab3'
        },
        {
          label: t('navigation.submenu.query.tab4'),
          icon: '🎼',
          path:'/menu?tab=query&sub=tab4'
        },
      ],
    },
    'compare': {
      label: t('navigation.menu.compare'),
      icon: '↔️',
      path: '/menu?tab=compare',
      children: [
        {
          label: t('navigation.submenu.compare.tab1'),
          icon: '🔠',
          path: '/menu?tab=compare&sub=tab1'
        },
        {
          label: t('navigation.submenu.compare.tab2'),
          icon: '📜',
          path: '/menu?tab=compare&sub=tab2'
        },
        {
          label: t('navigation.submenu.compare.tab4'),
          icon: '📈',
          path: '/menu?tab=compare&sub=tab4'
        }
      ],
    },
    'pho': {
      label: t('navigation.menu.pho'),
      icon: '🧬',
      path: '/menu?tab=pho',
      children: [
        {
          label: t('navigation.submenu.pho.phonologyMatrix'),
          icon: '⚛️',
          path: '/menu?tab=pho&sub=phonologyMatrix'
        },
        {
          label: t('navigation.submenu.pho.phonologyCustom'),
          icon: '📐',
          path: '/menu?tab=pho&sub=phonologyCustom'
        },
        {
          label: t('navigation.submenu.pho.Countphos'),
          icon: '🧮',
          path: '/menu?tab=pho&sub=Countphos'
        },
        {
          label: t('navigation.submenu.pho.pieVector'),
          icon: '🥧',
          path: '/menu?tab=pho&sub=pieVector'
        },
      ],
    },
    // 'cluster': {
    //   label: t('navigation.menu.dialectClustering'),
    //   icon: '🧩',
    //   path: '/menu?tab=cluster',
    //   children: null,
    // },
    'charClass': {
      label: t('navigation.menu.charClass'),
      icon: '📚',
      path: '/explore?page=CharacterClassification',
      children: [
        {
          label: t('navigation.submenu.charClass.zhonggu'),
          icon: '📜',
          path: '/explore?page=CharacterClassification&sub=zhonggu'
        },
        {
          label: t('navigation.submenu.charClass.shanggu'),
          icon: '🏛️',
          path: '/explore?page=CharacterClassification&sub=shanggu'
        },
        {
          label: t('navigation.submenu.charClass.jingu'),
          icon: '📖',
          path: '/explore?page=CharacterClassification&sub=jingu'
        },
        {
          label: t('navigation.submenu.charClass.yueyun'),
          icon: '🎵',
          path: '/explore?page=CharacterClassification&sub=yueyun'
        },
      ],
    },
    'words': {
      label: t('navigation.menu.words'),
      icon: '📖',
      path: '/menu?tab=words',
      children: [
        {
          label: t('navigation.submenu.words.vocabulary'),
          icon: '📖',
          path: '/explore?page=YuBao&sub=vocabulary'
        },
        {
          label: t('navigation.submenu.words.grammar'),
          icon: '🗣️',
          path: '/explore?page=YuBao&sub=grammar'
        },
        {
          label: t('navigation.submenu.words.ycSpoken'),
          icon: '💬',
          path: '/explore?page=ycSpoken'
        },
      ],
    },
    'villages': {
      label: t('navigation.menu.villages'),
      icon: '🏘️',
      path: '/menu?tab=villages',
      children: [
        {
          label: t('navigation.submenu.villages.gdVillages'),
          icon: '🏘️',
          path: '/explore?page=gdVillages'
        },
        {
          label: t('navigation.submenu.villages.VillagesML'),
          icon: '🤖',
          path: '/explore?page=VillagesML'
        },
        {
          label: t('navigation.submenu.villages.gdVillagesTable'),
          icon: '📈',
          path: '/explore?page=gdVillagesTable'
        },
        {
          label: t('navigation.submenu.villages.ycVillages'),
          icon: '🏠',
          path: '/explore?page=ycVillages'
        }
      ],
    },
    'tools': {
      label: t('navigation.menu.tools'),
      icon: '🧰',
      path: '/menu?tab=tools',
      children: [
        {
          label: t('navigation.submenu.tools.check'),
          icon: '📝',
          path: '/explore?page=check'
        },
        {
          label: t('navigation.submenu.tools.jyut2ipa'),
          icon: '🔤',
          path: '/explore?page=jyut2ipa'
        },
        {
          label: t('navigation.submenu.tools.merge'),
          icon: '🔗',
          path: '/explore?page=merge'
        },
        {
          label: t('navigation.submenu.tools.praat'),
          icon: '👂️️',
          path: '/explore?page=praat'
        }
      ],
    },
    'source': {
      label: t('navigation.menu.source'),
      icon: '📚',
      path: '/menu?tab=source',
      children:[
        {
          label: t('navigation.submenu.source.source'),
          icon: '📝',
          path: '/menu?tab=source'
        },
        {
          label: t('navigation.submenu.source.privacy'),
          icon: '🔒',
          path: '/menu?tab=privacy'
        },
        {
          label: t('navigation.submenu.source.suggestion'),
          icon: '💬',
          path: '/menu?tab=about&sub=suggestion'
        },
        {
          label: t('navigation.submenu.source.like'),
          icon: '❤️',
          path: '/menu?tab=about&sub=like'
        }
      ]
    },
    'about_ontop': {
      label: t('navigation.menu.about_ontop'),
      icon: '🌐️',
      path: '/menu?tab=about&sub=intro',
      children:[
        {
          label: t('navigation.submenu.about.intro'),
          icon: 'ℹ️',
          path: '/menu?tab=about&sub=intro'
        },
        {
          label: t('navigation.submenu.about.suggestion'),
          icon: '💬',
          path: '/menu?tab=about&sub=suggestion'
        },
        {
          label: t('navigation.submenu.about.like'),
          icon: '❤️',
          path: '/menu?tab=about&sub=like'
        },
        {
          label: t('navigation.submenu.about.setting'),
          icon: '⚙️',
          path: '/menu?tab=about&sub=setting'
        }
      ],
      showIn:['none']
    },
  }))
}

// 向后兼容：导出静态版本（使用繁体中文，用于不支持 i18n 的旧代码）
export const menuConfig = {
  'home': {
    label: '首頁',
    icon: '🏛️',
    path: '/',
    external: true,
    children: null,
  },
  'query': {
    label: '查詢',
    icon: '🔍️',
    path: '/menu?tab=query',
    children: [
      { label: '查字', icon: '🔣', path: '/menu?tab=query&sub=tab1' },
      { label: '查中古', icon: '📜', path: '/menu?tab=query&sub=tab2' },
      { label: '查音位', icon: '🗣️', path:'/menu?tab=query&sub=tab3' },
      { label: '查调', icon: '🎼', path:'/menu?tab=query&sub=tab4' },
    ],
  },
  'compare': {
    label: '比較',
    icon: '↔️',
    path: '/menu?tab=compare',
    children: [
      { label: '漢字對比', icon: '🔠', path: '/menu?tab=compare&sub=tab1' },
      { label: '中古對比', icon: '📜', path: '/menu?tab=compare&sub=tab2' },
      { label: '調類對比', icon: '📈', path: '/menu?tab=compare&sub=tab4' }
    ],
  },
  'pho': {
    label: '音系',
    icon: '🧬',
    path: '/menu?tab=pho',
    children: [
      { label: '音系查詢', icon: '⚛️', path: '/menu?tab=pho&sub=phonologyMatrix' },
      { label: '音素分類', icon: '📐', path: '/menu?tab=pho&sub=phonologyCustom' },
      { label: '音節統計', icon: '🧮', path: '/menu?tab=pho&sub=Countphos' },
      { label: '餅圖向量', icon: '🥧', path: '/menu?tab=pho&sub=pieVector' },
    ],
  },
  'cluster': {
    label: '聚類',
    icon: '🧩',
    path: '/menu?tab=cluster',
    children: null,
  },
  'charClass': {
    label: '漢字',
    icon: '📚',
    path: '/explore?page=CharacterClassification',
    children: [
      { label: '中古漢語', icon: '📜', path: '/explore?page=CharacterClassification&sub=zhonggu' },
      { label: '上古漢語', icon: '🏛️', path: '/explore?page=CharacterClassification&sub=shanggu' },
      { label: '近古漢語', icon: '📖', path: '/explore?page=CharacterClassification&sub=jingu' },
      { label: '粵語韻書', icon: '🎵', path: '/explore?page=CharacterClassification&sub=yueyun' },
    ],
  },
  'words': {
    label: '詞句',
    icon: '📖',
    path: '/menu?tab=words',
    children: [
      { label: '語保詞彙', icon: '📖', path: '/explore?page=YuBao&sub=vocabulary' },
      { label: '語保語法', icon: '🗣️', path: '/explore?page=YuBao&sub=grammar' },
      { label: '陽春口語詞', icon: '💬', path: '/explore?page=ycSpoken' },
    ],
  },
  'villages': {
    label: '自然村',
    icon: '🏘️',
    path: '/menu?tab=villages',
    children: [
      { label: '廣東自然村', icon: '🏘️', path: '/explore?page=gdVillages' },
      { label: '機器學習', icon: '🤖', path: '/explore?page=VillagesML' },
      { label: '全粵村情表格', icon: '📈', path: '/explore?page=gdVillagesTable' },
      { label: '陽春自然村', icon: '🏠', path: '/explore?page=ycVillages' }
    ],
  },
  'tools': {
    label: '工具',
    icon: '🧰',
    path: '/menu?tab=tools',
    children: [
      { label: '字表工具', icon: '📝', path: '/explore?page=check' },
      { label: '粵拼轉IPA', icon: '🔤', path: '/explore?page=jyut2ipa' },
      { label: '字表合併', icon: '🔗', path: '/explore?page=merge' },
      { label: '聲學分析', icon: '👂️️', path: '/explore?page=praat' }
    ],
  },
  'source': {
    label: '資料源',
    icon: '📚',
    path: '/menu?tab=source',
    children:[
      { label: '字表來源', icon: '📝', path: '/menu?tab=source' },
      { label: '隱私政策', icon: '🔒', path: '/menu?tab=privacy' },
      { label: '提出建議', icon: '💬', path: '/menu?tab=about&sub=suggestion' },
      { label: '喜歡作者', icon: '❤️', path: '/menu?tab=about&sub=like' }
    ]
  },
  'about_ontop': {
    label: '關於網站',
    icon: '🌐️',
    path: '/menu?tab=about&sub=intro',
    children:[
      { label: '簡介', icon: 'ℹ️', path: '/menu?tab=about&sub=intro' },
      { label: '提出建議', icon: '💬', path: '/menu?tab=about&sub=suggestion' },
      { label: '喜歡作者', icon: '❤️', path: '/menu?tab=about&sub=like' },
      { label: '設置', icon: '⚙️', path: '/menu?tab=about&sub=setting' }
    ],
    showIn:['none']
  },
}

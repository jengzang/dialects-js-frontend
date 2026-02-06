// Menu configuration for navigation system
// Supports two-level navigation: direct links and expandable submenus

export const menuConfig = {
  // Special: Return to query (only in SimpleSidebar)
  'query': {
    label: '返回查詢',
    icon: '📊',
    path: '/menu?tab=query',
    children: null,
    showIn: ['SimpleSidebar'] // 只在 SimpleSidebar 中顯示
  },


  // Level 2: Expandable data submenu
  'data': {
    label: '音系',
    icon: '✍️',
    path: '/menu?tab=pho',
    children: [
      {
        label: '音系查詢',
        icon: '🔍️',
        path: '/explore?page=phonologyMatrix'
      },
      {
        label: '音素分類',
        icon: '📐',
        path: '/explore?page=phonologyCustom'
      },
      {
        label: '音節統計',
        icon: '🧮',
        path: '/explore?page=Countphos'
      },
      {
        label: '中古地位',
        icon: '✍️',
        path: '/explore?page=ZhongGu'
      },
    ]
  },

  // Level 2: Expandable data submenu
  'words': {
    label: '詞語',
    icon: '📖',
    path: '/menu?tab=words',
    children: [
      {
        label: '陽春口語詞',
        icon: '💬',
        path: '/explore?page=ycSpoken'
      },
      {
        label: '語保詞彙',
        icon: '📖',
        path: '/explore?page=YuBao&sub=vocabulary'
      },
      {
        label: '語保語法',
        icon: '🗣️',
        path: '/explore?page=YuBao&sub=grammar'
      },
    ]
  },

  // Level 2: Expandable villages submenu
  'villages': {
    label: '自然村',
    icon: '🏠',
    path: '/menu?tab=villages',
    children: [
      {
        label: '全粵村情表格',
        icon: '📈',
        path: '/explore?page=gdVillagesTable'
      },
      {
        label: '廣東自然村',
        icon: '🏘️',
        path: '/explore?page=gdVillages'
      },
      {
        label: '陽春自然村',
        icon: '🏠',
        path: '/explore?page=ycVillages'
      }
    ]
  },
// Level 2: Expandable tools submenu
'tools': {
  label: '工具',
      icon: '🧰',
      path: '/menu?tab=tools',
      children: [
    {
      label: '字表工具',
      icon: '📝',
      path: '/explore?page=check'
    },
    {
      label: '粵拼轉IPA',
      icon: '🔤',
      path: '/explore?page=jyut2ipa'
    },
    {
      label: '字表合併',
      icon: '🔗',
      path: '/explore?page=merge'
    }
  ]
},

  // Level 1: Direct navigation to Source page
  'source': {
    label: '資料源',
    icon: '📚',
    path: '/menu?tab=source',
    children:[
      {
        label: '字表來源',
        icon: '📝',
        path: '/menu?tab=source'
      },
      {
        label: '隱私政策',
        icon: '🔒',
        path: '/menu?tab=privacy'
      },
      {
        label: '提出建議',
        icon: '💬',
        path: '/menu?tab=about&sub=suggestion'
      },
      {
        label: '喜歡作者',
        icon: '❤️',
        path: '/menu?tab=about&sub=like'
      }
    ]
  },

  // Level 1: External link to old website
  'old-site': {
    label: '舊版網站',
    icon: '🕰️',
    path: '/detail', // Will be set dynamically using window.WEB_BASE
    external: true,
    children: null
  }
}

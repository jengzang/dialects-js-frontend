export function getHomeUpdateNotice(t) {
  const items = [
    {
      icon: '🚀',
      strong: '後端重構',
      text: '大幅提升 API 響應速度，提供更流暢的操作體驗'
    },
    {
      icon: '🗂️',
      strong: '重整目錄結構',
      text: '優化整體導航，包含將「簡介」與「感悟」合併、獨立「漢字」音韻資料為專屬分頁，並同步更新首頁卡片'
    },
    {
      icon: '🌐',
      strong: '新增多語言支持',
      text: '現已支持繁體中文、簡體中文與英文。用戶可至「關於 - 設置」中自由切換介面顯示語言'
    }
  ]

  return {
    version: 'v4.3.0',
    lastUpdateDate: '2026-04-03',
    title: '🎊 ' + t('home.updateNotice.title'),
    items
  }
}

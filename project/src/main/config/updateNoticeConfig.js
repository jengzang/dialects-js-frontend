export function getHomeUpdateNotice(t) {
const items = [
    {
        icon: '🎯',
        strong: '單點演變查詢功能',
        text: '新增單點演變查詢與相關演化可視化能力，支援追蹤特定音韻地位的歷時變化，並持續補強互動與展示細節'
    },
    {
        icon: '🏛️',
        strong: '擴充漢字地位分類',
        text: '補充並整理漢字音韻分類頁的層級與資料表現，支援更完整的音韻地位檢索、展開與對照'
    },
    {
        icon: '🛠️',
        strong: '整理路由與介面體驗',
        text: '集中修復多項路由跳轉、頁面記憶、彈窗與介面樣式問題，並統一多處彈窗與共用元件，提升整體穩定性與一致性'
    }
]

  return {
    version: 'v4.4.0',
    lastUpdateDate: '2026-04-03',
    title: '🎊 ' + t('home.updateNotice.title'),
    items
  }
}

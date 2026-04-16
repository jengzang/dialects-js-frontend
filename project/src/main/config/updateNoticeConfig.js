export function getHomeUpdateNotice(t) {
    const items = [
        {
            icon: '📚',
            strong: '支援多套音韻字集切換',
            text: '於「關於 -> 設置」新增字集切換功能，支援中古、上古、洪武正韻、蒙古字韻、中原音韻及分韻撮要等多樣化文獻系統'
        },
        {
            icon: '🎁',
            strong: '上線捐贈者致謝名錄',
            text: '新增捐贈者名單頁面，衷心感謝所有支持並資助本項目持續發展的朋友，您的貢獻是推動開發的重要動力'
        },
        {
            icon: '🩹',
            strong: '系統穩定性優化',
            text: '深度修復多項已知 Bug 並優化程式碼邏輯，提升頁面加載速度與互動流暢度，確保更穩定的使用體驗'
        }
    ]
  return {
    version: 'v4.4.5',
    lastUpdateDate: '2026-04-016',
    title: '🎊 ' + t('home.updateNotice.title'),
    items
  }
}

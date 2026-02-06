// env-config.js
// 此文件在应用启动时根据环境覆盖 WEB_BASE
// __WEB_BASE__ 会在构建时被 Vite 替换为正确的值

// 覆盖 config.js 中设置的默认值
window.WEB_BASE = __WEB_BASE__
window.API_BASE = window.WEB_BASE + '/api'

console.log('[ENV] WEB_BASE 已覆盖为:', window.WEB_BASE)

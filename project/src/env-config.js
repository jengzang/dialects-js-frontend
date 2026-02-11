// env-config.js
// 此文件在应用启动时根据环境导出 WEB_BASE 和 API_BASE
// __WEB_BASE__ 会在构建时被 Vite 替换为正确的值

// 导出最终的 WEB_BASE 和 API_BASE
export const WEB_BASE = __WEB_BASE__;
export const API_BASE = WEB_BASE + '/api';

console.log('[ENV] WEB_BASE 已设置为:', WEB_BASE);


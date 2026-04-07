export { api } from './httpClient.js';

export {
  getCookie,
  getRefreshToken,
  getToken,
  getTokenExpiresAt,
  getUserCache,
  saveToken,
  saveUserCache,
  clearUserCache,
} from './tokenStorage.js';

export {
  AUTH_API_BASE,
  bootstrapAuthSession,
  clearSession,
  clearSession as clearToken,
  ensureAuthenticated,
  getUserRole,
  initUserByToken,
  markSessionDegraded,
  refreshAccessToken,
  reportOnlineTime,
  update_userdatas_bytoken,
  waitForAuthReady,
} from './session.js';

// utils/onlineTimeTracker.js
import { reportOnlineTime, getToken } from '../api/auth/auth.js';
import { WEB_BASE } from '@/env-config.js';

const REPORT_INTERVAL = 5 * 60 * 1000; // 5分钟（平衡：减少漏报 + 控制后端压力）
const INVISIBLE_THRESHOLD = 5 * 60 * 1000; // 5分钟
const SAVE_INTERVAL = 30 * 1000; // 30秒存一次 sessionStorage（防漏）

let startTime = null; // 页面可见时的开始时间
let accumulatedTime = 0; // 累积的在线时长（秒）
let reportTimer = null; // 定期上报的定时器
let invisibleTimer = null; // 页面不可见的定时器
let saveTimer = null; // 定期保存到 sessionStorage 的定时器
let isPageVisible = true; // 页面是否可见
let isReporting = false; // 防止重复上报的标志位

/**
 * 初始化在线时长统计
 */
export async function initOnlineTimeTracker() {
    // console.log('🚀 [在线时长] 初始化统计器');

    // 先尝试补报上次未成功的时长（防漏机制）
    await reportPendingTime();

    // 初始化开始时间
    startTime = Date.now();
    isPageVisible = !document.hidden;

    // console.log('📍 [在线时长] 页面初始状态:', isPageVisible ? '可见' : '不可见');

    // 1. 定期上报（每5分钟）
    reportTimer = setInterval(() => {
        // console.log('⏰ [在线时长] 定期上报触发（5分钟）');
        reportAndReset();
    }, REPORT_INTERVAL);

    // 2. 定期保存到 sessionStorage（每30秒，防止快速关闭漏报）
    saveTimer = setInterval(() => {
        saveToSessionStorage();
    }, SAVE_INTERVAL);

    // 3. 监听页面可见性变化
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 4. 监听页面关闭（pagehide 比 beforeunload 更可靠）
    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('beforeunload', handlePageHide); // 兼容旧浏览器

    // console.log('✅ [在线时长] 统计器初始化完成');
}

/**
 * 停止在线时长统计
 */
export function stopOnlineTimeTracker() {
    // console.log('🛑 [在线时长] 停止统计器');

    // 清除定时器
    if (reportTimer) {
        clearInterval(reportTimer);
        reportTimer = null;
    }

    if (saveTimer) {
        clearInterval(saveTimer);
        saveTimer = null;
    }

    if (invisibleTimer) {
        clearTimeout(invisibleTimer);
        invisibleTimer = null;
    }

    // 移除事件监听
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('pagehide', handlePageHide);
    window.removeEventListener('beforeunload', handlePageHide);

    // console.log('✅ [在线时长] 统计器已停止');
}

/**
 * 处理页面可见性变化
 */
function handleVisibilityChange() {
    const nowVisible = !document.hidden;

    // console.log('👁️ [在线时长] 页面可见性变化:', nowVisible ? '可见' : '不可见');

    if (nowVisible && !isPageVisible) {
        // 从不可见变为可见
        // console.log('🔆 [在线时长] 页面变为可见，重新开始计时');

        // 清除不可见定时器
        if (invisibleTimer) {
            clearTimeout(invisibleTimer);
            invisibleTimer = null;
        }

        // 重新开始计时
        startTime = Date.now();
        isPageVisible = true;

    } else if (!nowVisible && isPageVisible) {
        // 从可见变为不可见
        // console.log('🌙 [在线时长] 页面变为不可见，累积当前时长');

        // 累积当前时长
        if (startTime) {
            const duration = Math.floor((Date.now() - startTime) / 1000);
            accumulatedTime += duration;
            // console.log('📊 [在线时长] 累积时长:', duration, '秒，总累积:', accumulatedTime, '秒');
            startTime = null;
        }

        isPageVisible = false;

        // 设置5分钟后上报
        invisibleTimer = setTimeout(() => {
            if (!isPageVisible) {
                // console.log('⏰ [在线时长] 页面不可见超过5分钟，触发上报');
                reportAndReset();
            }
        }, INVISIBLE_THRESHOLD);
    }
}

/**
 * 处理页面关闭（pagehide 比 beforeunload 更可靠）
 */
function handlePageHide() {
    // 防止重复上报（pagehide 和 beforeunload 可能都触发）
    if (isReporting) {
        // console.log('⚠️ [在线时长] 已在上报中，跳过重复触发');
        return;
    }
    isReporting = true;

    // console.log('🚪 [在线时长] 页面关闭，使用 fetch keepalive 上报');

    // 累积当前时长
    if (startTime && isPageVisible) {
        const duration = Math.floor((Date.now() - startTime) / 1000);
        accumulatedTime += duration;
        // console.log('📊 [在线时长] 页面关闭时累积时长:', duration, '秒，总累积:', accumulatedTime, '秒');
    }

    // 上报
    if (accumulatedTime > 0) {
        const token = getToken(); // ✅ 使用共用函数，支持 localStorage + cookie

        if (token) {
            // 后端限制：1秒到3600秒（1小时）
            const seconds = Math.max(1, Math.min(3600, Math.floor(accumulatedTime)));

            // if (seconds !== accumulatedTime) {
            //     console.log(`⚠️ [在线时长] 时长已调整: ${accumulatedTime} -> ${seconds} 秒（后端限制1-3600秒）`);
            // }

            const data = JSON.stringify({ seconds });

            // ✅ 只使用 fetch keepalive（带 Authorization header）
            // sendBeacon 无法带自定义 header，若后端依赖 Bearer token 会被拒绝
            try {
                fetch(WEB_BASE + '/auth/report-online-time', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: data,
                    keepalive: true  // 关键：页面关闭后继续发送
                });
                // console.log('✅ [在线时长] fetch keepalive 请求已发送');
            } catch (err) {
                // console.error('❌ [在线时长] fetch keepalive 失败:', err);
                // 保存到 sessionStorage，下次补报
                sessionStorage.setItem('pending_online_time', accumulatedTime.toString());
            }
        } else {
            // console.log('⚠️ [在线时长] 页面关闭时未登录，跳过上报');
        }
    }
}

/**
 * 上报并重置累积时长
 */
async function reportAndReset() {
    // 累积当前时长
    if (startTime && isPageVisible) {
        const duration = Math.floor((Date.now() - startTime) / 1000);
        accumulatedTime += duration;
        // console.log('📊 [在线时长] 累积当前时长:', duration, '秒，总累积:', accumulatedTime, '秒');
    }

    // 上报
    if (accumulatedTime > 0) {
        // ✅ reportOnlineTime 返回 true/false，不抛异常
        const success = await reportOnlineTime(accumulatedTime);

        if (success) {
            // 上报成功，清零并清除 sessionStorage 备份
            accumulatedTime = 0;
            sessionStorage.removeItem('pending_online_time');
        } else {
            // 上报失败，保存到 sessionStorage，下次补报
            // console.error('❌ [在线时长] 上报失败，保存到 sessionStorage');
            sessionStorage.setItem('pending_online_time', accumulatedTime.toString());
            accumulatedTime = 0; // 重置，避免重复累积
        }
    }

    // 重置开始时间
    if (isPageVisible) {
        startTime = Date.now();
        // console.log('🔄 [在线时长] 重置计时器');
    }
}

/**
 * 手动触发上报（用于登出等场景）
 */
export async function manualReport() {
    // console.log('🔧 [在线时长] 手动触发上报');
    await reportAndReset();
}

/**
 * 保存当前累积时长到 sessionStorage（防止快速关闭漏报）
 */
function saveToSessionStorage() {
    // 先累积当前时段
    if (startTime && isPageVisible) {
        const duration = Math.floor((Date.now() - startTime) / 1000);
        accumulatedTime += duration;
        startTime = Date.now(); // 重置开始时间
    }

    if (accumulatedTime > 0) {
        sessionStorage.setItem('pending_online_time', accumulatedTime.toString());
        // console.log('💾 [在线时长] 已保存到 sessionStorage:', accumulatedTime, '秒');
    }
}

/**
 * 补报上次未成功的时长（从 sessionStorage 读取）
 */
async function reportPendingTime() {
    const pendingTime = sessionStorage.getItem('pending_online_time');

    if (pendingTime) {
        const seconds = parseInt(pendingTime);
        if (seconds > 0) {
            // console.log('📤 [在线时长] 发现待补报时长:', seconds, '秒');
            // ✅ reportOnlineTime 返回 true/false，不抛异常
            const success = await reportOnlineTime(seconds);
            if (success) {
                sessionStorage.removeItem('pending_online_time');
                // console.log('✅ [在线时长] 补报成功');
            } else {
                // console.error('❌ [在线时长] 补报失败');
                // 保留在 sessionStorage，下次再试
            }
        } else {
            sessionStorage.removeItem('pending_online_time');
        }
    }
}

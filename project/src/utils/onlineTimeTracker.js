// utils/onlineTimeTracker.js
import { reportOnlineTime } from './auth.js';
import { WEB_BASE } from '@/env-config.js';

const REPORT_INTERVAL = 10 * 60 * 1000; // 10分钟
const INVISIBLE_THRESHOLD = 5 * 60 * 1000; // 5分钟

let startTime = null; // 页面可见时的开始时间
let accumulatedTime = 0; // 累积的在线时长（秒）
let reportTimer = null; // 定期上报的定时器
let invisibleTimer = null; // 页面不可见的定时器
let isPageVisible = true; // 页面是否可见

/**
 * 初始化在线时长统计
 */
export function initOnlineTimeTracker() {
    // console.log('🚀 [在线时长] 初始化统计器');

    // 初始化开始时间
    startTime = Date.now();
    isPageVisible = !document.hidden;

    // console.log('📍 [在线时长] 页面初始状态:', isPageVisible ? '可见' : '不可见');

    // 1. 定期上报（每10分钟）
    reportTimer = setInterval(() => {
        // console.log('⏰ [在线时长] 定期上报触发（10分钟）');
        reportAndReset();
    }, REPORT_INTERVAL);

    // 2. 监听页面可见性变化
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 3. 监听页面关闭
    window.addEventListener('beforeunload', handleBeforeUnload);

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

    if (invisibleTimer) {
        clearTimeout(invisibleTimer);
        invisibleTimer = null;
    }

    // 移除事件监听
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('beforeunload', handleBeforeUnload);

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
 * 处理页面关闭
 */
function handleBeforeUnload() {
    // console.log('🚪 [在线时长] 页面关闭，使用 fetch keepalive 上报');

    // 累积当前时长
    if (startTime && isPageVisible) {
        const duration = Math.floor((Date.now() - startTime) / 1000);
        accumulatedTime += duration;
        // console.log('📊 [在线时长] 页面关闭时累积时长:', duration, '秒，总累积:', accumulatedTime, '秒');
    }

    // 上报
    if (accumulatedTime > 0) {
        const token = localStorage.getItem('access_token');

        if (token) {
            // 后端限制：1秒到3600秒（1小时）
            const seconds = Math.max(1, Math.min(3600, Math.floor(accumulatedTime)));

            // if (seconds !== accumulatedTime) {
            //     console.log(`⚠️ [在线时长] 时长已调整: ${accumulatedTime} -> ${seconds} 秒（后端限制1-3600秒）`);
            // }

            const data = JSON.stringify({ seconds });  // ✅ 修复：使用 seconds 而不是 duration

            // 方案1：使用 fetch with keepalive（推荐，支持 Authorization header）
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
                // console.error('❌ [在线时长] fetch keepalive 失败，尝试 sendBeacon:', err);

                // 方案2：降级到 sendBeacon（依赖后端支持从 Cookie 读取 token）
                const blob = new Blob([data], { type: 'application/json' });
                const success = navigator.sendBeacon(
                    WEB_BASE + '/auth/report-online-time',
                    blob
                );
                // console.log(success ? '✅ [在线时长] sendBeacon 发送成功' : '❌ [在线时长] sendBeacon 发送失败');
            }
        } else {
            console.log('⚠️ [在线时长] 页面关闭时未登录，跳过上报');
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
        await reportOnlineTime(accumulatedTime);
        accumulatedTime = 0;
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

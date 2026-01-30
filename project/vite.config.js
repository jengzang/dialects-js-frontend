// vite.config.js
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), '')

  // 确定 WEB_BASE 的值
  let webBase
  if (mode === 'web') {
    // npm run dev:web - 开发模式但连接正式域名
    webBase = env.VITE_WEB_BASE || 'https://dialects.yzup.top'
  } else if (mode === 'development') {
    // npm run dev - 开发模式连接本地
    webBase = env.VITE_WEB_BASE || 'http://127.0.0.1:5000'
  } else {
    // npm run build - 生产模式
    webBase = env.VITE_WEB_BASE || 'https://dialects.yzup.top'
  }

  console.log(`[Vite] Mode: ${mode}, WEB_BASE: ${webBase}`)

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      }
    },
    define: {
      // 用于 JS 代码中的替换
      __WEB_BASE__: JSON.stringify(webBase)
    },
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'), // SPA 根頁面
          auth: path.resolve(__dirname, 'auth/index.html'),  // MPA 頁面
          menu: path.resolve(__dirname, 'menu/index.html'),
          intro: path.resolve(__dirname, 'intro/index.html'),
        },
        output: {
          entryFileNames: 'assets/[name].[hash].js',  // 在入口文件名中添加哈希值
          chunkFileNames: 'assets/[name].[hash].js',  // 在chunk文件名中添加哈希值
          assetFileNames: 'assets/[name].[hash].[ext]', // 在资产文件（如 css, images）中添加哈希值
          manualChunks: undefined,               // 可選：禁用分包
        },
      }
    }
  }
})

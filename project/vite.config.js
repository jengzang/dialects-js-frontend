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
    // 使用空字符串，让请求走相对路径，通过Vite代理转发
    webBase = ''
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
    server: {
      proxy: {
        // 代理所有非静态资源请求到后端
        '^/(api|logs|sql|auth|upload|download|static|files)': {
          target: 'https://dialects.yzup.top',
          changeOrigin: true,
          secure: false,
        }
      }
    },
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'), // SPA 根頁面
          auth: path.resolve(__dirname, 'auth/index.html'),  // MPA 頁面
          menu: path.resolve(__dirname, 'menu/index.html'),
          intro: path.resolve(__dirname, 'intro/index.html'),
          explore: path.resolve(__dirname, 'explore/index.html'),
          villagesML: path.resolve(__dirname, 'villagesML/index.html'),
        },
        output: {
          entryFileNames: 'assets/[name].[hash].js',  // 在入口文件名中添加哈希值
          chunkFileNames: 'assets/[name].[hash].js',  // 在chunk文件名中添加哈希值
          assetFileNames: 'assets/[name].[hash].[ext]', // 在资产文件（如 css, images）中添加哈希值
          // 启用代码分割 - 将大型依赖拆分为独立chunks
          manualChunks(id) {
            // ========== 首页相关（优先级最高）==========
            // 首页组件单独打包
            if (id.includes('/views/HomePage.vue')) {
              return 'homepage'
            }
            // 首页使用的 API（logs）
            if (id.includes('/api/logs/')) {
              return 'homepage'
            }

            // ========== 大型库（首页不需要）==========
            if (id.includes('echarts')) {
              return 'echarts'
            }
            if (id.includes('maplibre-gl')) {
              return 'maplibre'
            }
            if (id.includes('xlsx')) {
              return 'xlsx'
            }
            if (id.includes('wavesurfer')) {
              return 'wavesurfer'
            }

            // ========== Vue 核心库（首页需要）==========
            if (id.includes('node_modules/vue') || id.includes('node_modules/vue-router')) {
              return 'vue-vendor'
            }

            // ========== 其他 node_modules 依赖 ==========
            if (id.includes('node_modules')) {
              return 'vendor'
            }
          }
        },
      },
      // 優化配置
      chunkSizeWarningLimit: 1000, // 提高警告閾值到 1MB
      minify: 'esbuild', // 使用 esbuild 壓縮（更快）
      esbuild: {
        drop: ['console', 'debugger'], // 生產環境移除 console 和 debugger
      }
    }
  }
})

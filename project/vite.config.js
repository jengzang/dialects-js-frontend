import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

const mpaEntryRoots = ['auth', 'menu', 'intro', 'explore', 'villagesML']

function rewriteDevMpaRequest(req) {
  if (!req?.url || !req.headers?.accept?.includes('text/html')) {
    return
  }

  const url = new URL(req.url, 'http://localhost')
  const pathname = url.pathname.replace(/\/+$/, '') || '/'
  const matchedRoot = mpaEntryRoots.find((root) => (
    pathname === `/${root}` || pathname.startsWith(`/${root}/`)
  ))

  if (!matchedRoot || path.extname(pathname)) {
    return
  }

  url.pathname = `/${matchedRoot}/index.html`
  req.url = `${url.pathname}${url.search}`
}

function devMpaRewritePlugin() {
  return {
    name: 'dev-mpa-rewrite',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        rewriteDevMpaRequest(req)
        next()
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  let webBase
  if (mode === 'web') {
    webBase = ''
  } else if (mode === 'development') {
    webBase = env.VITE_WEB_BASE || 'http://127.0.0.1:5000'
  } else {
    webBase = env.VITE_WEB_BASE || 'https://dialects.yzup.top'
  }

  console.log(`[Vite] Mode: ${mode}, WEB_BASE: ${webBase}`)

  return {
    plugins: [vue(), devMpaRewritePlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    define: {
      __WEB_BASE__: JSON.stringify(webBase),
    },
    server: {
      proxy: {
        '^/(api|logs|sql|upload|download|static|files)(?:/|$)': {
          target: 'https://dialects.yzup.top',
          changeOrigin: true,
          secure: false,
        },
      },
    },
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          auth: path.resolve(__dirname, 'auth/index.html'),
          menu: path.resolve(__dirname, 'menu/index.html'),
          intro: path.resolve(__dirname, 'intro/index.html'),
          explore: path.resolve(__dirname, 'explore/index.html'),
          villagesML: path.resolve(__dirname, 'villagesML/index.html'),
        },
        output: {
          entryFileNames: 'assets/[name].[hash].js',
          chunkFileNames: 'assets/[name].[hash].js',
          assetFileNames: 'assets/[name].[hash].[ext]',
          manualChunks(id) {
            if (id.includes('/api/logs/')) {
              return 'logs'
            }
            if (id.includes('/src/i18n/')) {
              return 'i18n'
            }
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
            if (id.includes('node_modules/vue') || id.includes('node_modules/vue-router')) {
              return 'vue-vendor'
            }
            if (id.includes('node_modules')) {
              return 'vendor'
            }
          },
        },
      },
      chunkSizeWarningLimit: 1000,
      minify: 'esbuild',
      esbuild: {
        drop: ['console', 'debugger'],
      },
    },
  }
})

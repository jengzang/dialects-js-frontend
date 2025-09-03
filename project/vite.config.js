// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    }
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
        // ✅ 不帶 hash
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]', // name 保留原名（如 style.css）
        manualChunks: undefined,               // 可選：禁用分包
      },
    }
  }
})

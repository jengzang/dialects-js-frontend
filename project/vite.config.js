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
        entryFileNames: 'assets/[name].[hash].js',  // 在入口文件名中添加哈希值
        chunkFileNames: 'assets/[name].[hash].js',  // 在chunk文件名中添加哈希值
        assetFileNames: 'assets/[name].[hash].[ext]', // 在资产文件（如 css, images）中添加哈希值
        manualChunks: undefined,               // 可選：禁用分包
      },
    }
  }
})

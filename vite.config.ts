import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',  // 监听所有网卡，局域网可访问
    port: 5173,
    strictPort: false,
  },
  preview: {
    host: '0.0.0.0',  // 预览模式也允许局域网访问
    port: 4173,
  },
  base: './',  // 部署到子路径时用相对路径
})

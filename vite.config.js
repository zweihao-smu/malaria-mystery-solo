import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages 项目站点部署在 /<仓库名>/ 子路径下
  base: '/malaria-mystery-solo/',
  plugins: [vue()],
})

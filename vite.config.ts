import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// mode 'pages': статична збірка тренувального застосунку для GitHub Pages → docs/app
// (звичайний `npm run build` і CI лишаються без змін — усе ще dist/, як і раніше)
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  resolve: {
    // '@/components' → 'src/components'
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  base: mode === 'pages' ? './' : '/',
  build: mode === 'pages' ? { outDir: 'docs/app', emptyOutDir: true } : undefined,
}));

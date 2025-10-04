// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react']
  },
  server: {
    port: 5173
  },
  resolve: {
    alias: {
      '@lib': path.resolve(__dirname, './src/lib'),
    }
  }
});
import path from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'artifacts/rakt-kavach/src'),
    },
  },
  build: {
    outDir: path.resolve(import.meta.dirname, 'artifacts/rakt-kavach/dist'),
    emptyOutDir: true,
    // यह नया हिस्सा उस 'manualChunks' वाले एरर को ठीक करने के लिए है
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
  preview: {
    port: 10000,
    host: '0.0.0.0',
    strictPort: true,
    allowedHosts: true,
  }
});

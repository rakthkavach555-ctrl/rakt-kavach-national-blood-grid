import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { fileURLToPath } from 'url';

// __dirname को सुरक्षित तरीके से परिभाषित करना
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  base: './',
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    // रोलअप सेटिंग्स को सरल रखा गया है ताकि कोई एरर न आए
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  server: {
    port: 10000,
    host: '0.0.0.0',
    strictPort: true,
  },
  preview: {
    port: 10000,
    host: '0.0.0.0',
    strictPort: true,
  }
});

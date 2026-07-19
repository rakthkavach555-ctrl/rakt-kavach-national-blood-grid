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
      // इसे सीधा 'src' पर पॉइंट करें
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  build: {
    // इसे सीधा 'dist' फोल्डर पर रखें
    outDir: 'dist',
    emptyOutDir: true,
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

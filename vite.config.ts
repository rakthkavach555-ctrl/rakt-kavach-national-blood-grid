import path from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  // यह जादुई नियम डोमेन को सीधे आपके असली सब-फ़ोल्डर से सिंक कर देगा
  base: './',
  plugins: [
    react(),
    tailwindcss()
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'artifacts/rakt-kavach/src'),
    },
  },
  build: {
    outDir: path.resolve(import.meta.dirname, 'artifacts/rakt-kavach/dist'),
    emptyOutDir: true,
  }
});

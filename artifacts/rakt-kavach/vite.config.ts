import path from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import runtimeErrorOverlay from '@replit/vite-plugin-runtime-error-modal';

export default defineConfig({
  // यह गिठब पेजेस और फोल्डर के अंदर के पाथ को सुरक्षित करता है
  base: './',
  plugins: [
    react(),
    tailwindcss(),
    runtimeErrorOverlay()
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
    },
  },
  build: {
    // यह फाइनल आउटपुट को बिल्कुल सही जगह पर निकालेगा
    outDir: path.resolve(import.meta.dirname, 'dist'),
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      // 🌟 यह रीपिट को सीधे इस फोल्डर के अंदर मौजूद index.html से कनेक्ट कर देगा
      input: {
        main: path.resolve(import.meta.dirname, 'index.html'),
      },
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'wouter', '@tanstack/react-query'],
        },
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    // 🌟 सुरक्षा ब्लॉकेज हटाने का नियम यहाँ व्यवस्थित कर दिया गया है
    allowedHosts: 'all'
  }
});

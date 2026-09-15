import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [tailwindcss()],
  build: {
    outDir: 'dist',
    assetsInlineLimit: 4096,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        // Separamos las librerías de animación del código propio para
        // que el navegador las cachee entre deploys.
        manualChunks: {
          vendor: ['gsap', 'lenis'],
        },
      },
    },
  },
  server: {
    port: 5173,
    open: true,
  },
});

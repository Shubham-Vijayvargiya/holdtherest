import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // Ensures relative pathing for GitHub Pages deployment
  server: {
    port: 3000,
    open: true
  },
  test: {
    environment: 'jsdom',
    globals: true
  }
});

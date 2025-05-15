import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['painted-bg-selling-puts.trycloudflare.com'],
    proxy: {
      '/api': 'https://midi-guardian-shorts-hans.trycloudflare.com'
    }
  }
});
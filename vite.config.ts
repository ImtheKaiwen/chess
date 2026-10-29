import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages base URL: /chess/ or relative ./ for local/preview
  base: process.env.NODE_ENV === 'production' ? '/chess/' : '/',
});

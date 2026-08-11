
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],

  // Development server
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: 'all',
  },

  // Vite preview server
  preview: {
    host: '0.0.0.0',
    port: 4173,
    allowedHosts: 'all',
  },
});

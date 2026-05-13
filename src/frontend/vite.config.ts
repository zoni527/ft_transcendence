import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    port: 5173,
    hmr: {
      clientPort: process.env.NGINX_PORT_EXTERNAL,
    },
    watch: {
      usePolling: true,
    },
  },
});

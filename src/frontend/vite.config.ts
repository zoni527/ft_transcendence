import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    port: 5173,
    hmr: {
      clientPort: parseInt(process.env.VITE_NGINX_PORT_EXTERNAL, 10),
    },
    watch: {
      usePolling: true,
    },
  },
});

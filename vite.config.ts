import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import path from 'path';
import { defineConfig } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      target: ['es2020', 'safari14', 'ios14'],
      cssTarget: ['safari14', 'ios14'],
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      // HMR is controlled via DISABLE_HMR env var.
      hmr: false,
      // Optimize file watching in production/CI environments.
      watch: null,
    },
  };
});

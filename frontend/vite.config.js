import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'url';
import environment from 'vite-plugin-environment';

export default defineConfig({
  base: './',
  plugins: [
    environment({
      CANISTER_ID_BACKEND: '',
      CANISTER_ID_FRONTEND: '',
      DFX_NETWORK: ''
    }, {
      prefix: '', // hilangkan prefix agar pakai nama as-is
      defineOnMissing: true
    })
  ],
  envDir: '../',
  define: {
    'process.env': {
      NODE_ENV: process.env.NODE_ENV
    }
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    }
  },
  resolve: {
    alias: {
      declarations: fileURLToPath(new URL('../src/declarations', import.meta.url))
    }
  },
  server: {
    host: '127.0.0.1',
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:4943',
        changeOrigin: true
      }
    },
    watch: {
      usePolling: true
    }
  }
});
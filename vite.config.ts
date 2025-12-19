
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Fix: Avoid using process.cwd() which might cause type errors in certain environments
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react()],
    define: {
      // Safely inject only the necessary environment variables
      'process.env.API_KEY': JSON.stringify(env.API_KEY || process.env.API_KEY),
    },
    build: {
      outDir: 'dist',
      rollupOptions: {
        input: {
          main: './index.html',
        },
      },
    },
    server: {
      port: 3000,
      host: true
    }
  };
});

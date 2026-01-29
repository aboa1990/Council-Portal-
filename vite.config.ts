
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Fix: Cast process to any to access Node.js cwd() in the Vite build environment
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      'process.env': JSON.stringify({
        API_KEY: env.API_KEY || ''
      }), 
    },
    build: {
      outDir: 'dist',
      sourcemap: false
    }
  };
});


import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Fix: Cast process to any to access Node.js cwd() in the Vite build environment
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      'process.env': JSON.stringify({
        NODE_ENV: mode,
        API_KEY: env.API_KEY || '',
        MONGODB_DATA_API_URL: env.MONGODB_DATA_API_URL || '',
        MONGODB_DATA_API_KEY: env.MONGODB_DATA_API_KEY || '',
        MONGODB_CLUSTER: env.MONGODB_CLUSTER || '',
        MONGODB_DATABASE: env.MONGODB_DATABASE || ''
      }), 
    },
    build: {
      outDir: 'dist',
      sourcemap: false
    }
  };
});

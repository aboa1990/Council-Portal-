
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Fix: Cast process to any to access Node.js cwd() in the Vite build environment
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      // Define variables individually to preserve the process.env object structure
      'process.env.NODE_ENV': JSON.stringify(mode),
      'process.env.API_KEY': JSON.stringify(env.API_KEY || ''),
      'process.env.MONGODB_DATA_API_URL': JSON.stringify(env.MONGODB_DATA_API_URL || ''),
      'process.env.MONGODB_DATA_API_KEY': JSON.stringify(env.MONGODB_DATA_API_KEY || ''),
      'process.env.MONGODB_CLUSTER': JSON.stringify(env.MONGODB_CLUSTER || ''),
      'process.env.MONGODB_DATABASE': JSON.stringify(env.MONGODB_DATABASE || '')
    },
    build: {
      outDir: 'dist',
      sourcemap: false
    }
  };
});

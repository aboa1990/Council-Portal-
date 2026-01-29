import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      // Defines process.env for compatibility
      // We explicitly map API_KEY to ensure it's available if set in Vercel
      'process.env': JSON.stringify({
        API_KEY: env.API_KEY || ''
      }), 
    },
    build: {
      outDir: 'dist',
    },
  };
});
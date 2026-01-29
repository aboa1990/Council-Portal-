import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Polyfill process.env for the Google GenAI SDK usage in the browser
    'process.env': {} 
  },
  build: {
    outDir: 'dist',
  },
});
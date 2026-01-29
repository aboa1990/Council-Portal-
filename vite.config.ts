import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Safely replace process.env with an empty object to prevent browser crashes
    // If you add an API_KEY in Vercel Settings, it will just be undefined here unless prefixed with VITE_
    // This config mainly ensures the app loads without "ReferenceError: process is not defined"
    'process.env': JSON.stringify({}), 
  },
  build: {
    outDir: 'dist',
  },
});
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import fs from 'fs';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
  },
  // Copy content script manually after build
  closeBundle() {
    const src = 'src/content.js';
    const dest = 'dist/content.js';
    fs.copyFileSync(src, dest);
  }
});

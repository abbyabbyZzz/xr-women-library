import { copyFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

function pagesRoutes(): Plugin {
  return {
    name: 'github-pages-routes',
    async closeBundle() {
      const entry = path.resolve('dist/index.html');
      await copyFile(entry, path.resolve('dist/404.html'));
      for (const route of ['papers', 'search', 'about']) {
        const directory = path.resolve('dist', route);
        await mkdir(directory, { recursive: true });
        await copyFile(entry, path.join(directory, 'index.html'));
      }
    },
  };
}

export default defineConfig(({ mode }) => ({
  base: mode === 'github-pages' ? process.env.PAGES_BASE_PATH || '/xr-women-library/' : '/',
  plugins: [react(), ...(mode === 'github-pages' ? [pagesRoutes()] : [])],
}));

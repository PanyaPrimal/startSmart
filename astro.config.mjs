import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://startsmart.pages.dev',
  build: {
    format: 'file',
  },
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
        },
      },
    },
  },
});

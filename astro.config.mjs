import { defineConfig } from 'astro/config';

export default defineConfig({
  site: process.env.PAGES_ORIGIN || 'https://startsmartworld.com',
  base: process.env.PAGES_BASE_PATH || '/',
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

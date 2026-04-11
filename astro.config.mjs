import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://panyaprimal.github.io',
  base: '/startSmart/',
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

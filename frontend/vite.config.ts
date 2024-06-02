import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import Pages from 'vite-plugin-pages';
import AutoImport from 'unplugin-auto-import/vite';
import { ViteWebfontDownload } from 'vite-plugin-webfont-dl';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const envMode = command === 'serve' ? mode : process.env.NODE_ENV || mode || 'production';
  process.env = { ...process.env, ...loadEnv(envMode.trim().toLowerCase(), process.cwd()) };

  return {
    plugins: [
      Pages(),

      AutoImport({
        imports: [],
        dirs: ['./src/lib/**', './src/composables'],
        dts: 'src/auto-imports.d.ts',
      }),

      ViteWebfontDownload([
        'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@700&family=IBM+Plex+Sans:wght@400;700&display=swap',
      ]),
    ],
    resolve: {
      alias: {
        '~': `${path.resolve(__dirname, 'src')}/`,
      },
    },
  };
});

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      host: '0.0.0.0',
      allowedHosts: true as true,
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: {
        ignored: [
          '**/logs/**',
          '**/data/**',
          '**/attached_assets/**',
          '**/*.py',
          '**/*.pyw',
          '**/*.log',
          '**/*.sqlite',
          '**/*.db',
          '**/*.json',
          '**/*.md',
          '**/*.bat',
          '**/*.ps1',
          '**/requirements.txt',
        ]
      },
    },
  };
});

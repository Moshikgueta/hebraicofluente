import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    /* Enche o depósito de conteúdo antes de qualquer teste - ver
       tests/ajuda/hidratar.ts. */
    setupFiles: ['./tests/ajuda/hidratar.ts']
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@content': fileURLToPath(new URL('./content', import.meta.url))
    }
  }
});

import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  /* O tsconfig deixa o JSX para o Next (`jsx: preserve`); nos testes que
     renderizam uma página de verdade (tests/legal-fase1.test.ts), quem
     transforma é o oxc do Vite. */
  oxc: { jsx: { runtime: 'automatic' } },
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

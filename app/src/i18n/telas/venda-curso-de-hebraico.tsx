import type { ReactNode } from 'react';
import type { Traducao } from '..';

/* app/page.tsx (a capa), app/curso-de-hebraico/page.tsx e
   CursoDeHebraicoClient.tsx: a mesma página de venda nos dois endereços. */
const pt = {
  metaTitulo: 'Aprenda a ler hebraico do zero - Hebraico Fluente',
  /* Até 155 caracteres (checa-seo.mjs). */
  metaDescricao:
    'Curso interativo para brasileiros aprenderem a ler hebraico do zero: as 22 letras, os ' +
    'sinais de vogal e palavras reais, com correção na hora.',
  parceria: (preco: ReactNode, ate: string | null): ReactNode => (
    <>Seu link garante um preço especial: o curso sai por {preco} no checkout{ate ? `, até ${ate}` : ''}.</>
  ),
  comecar: (preco: string) => `Começar o curso · ${preco}`
} as const;

const en: Traducao<typeof pt> = {
  metaTitulo: 'Learn to read Hebrew from zero - Hebraico Fluente',
  metaDescricao:
    'An interactive course for English speakers to learn to read Hebrew from zero: the 22 letters, ' +
    'the vowel signs and real words, with instant feedback.',
  parceria: (preco: ReactNode, ate: string | null): ReactNode => (
    <>Your link gets you a special price: the course comes to {preco} at checkout{ate ? `, until ${ate}` : ''}.</>
  ),
  comecar: (preco: string) => `Start the course · ${preco}`
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;

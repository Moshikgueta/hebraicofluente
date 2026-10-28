import type { Chave } from './pt';

/* Os textos fixos da interface, em inglês. O tipo exige TODA chave de pt.ts:
   uma chave nova sem inglês quebra o `npm run typecheck`, e o site em inglês
   nunca sai com um botão em português. Primeira versão escrita pelo Claude;
   a revisão por nativos é a etapa 4 do PLANO-INGLES.md. */
export const en: Record<Chave, string> = {
  /* O nome da marca em inglês ainda é decisão do dono, junto com o domínio. */
  'marca': 'Hebraico Fluente',

  'site.titulo': 'Hebraico Fluente - learn to read Hebrew from zero',
  'site.descricao':
    'Learn to read and write Hebrew, starting with the alphabet: interactive lessons, ' +
    'instant feedback and progress that picks up where you left off.',

  'naoEncontrada.tituloDaAba': 'Page not found - Hebraico Fluente',
  'naoEncontrada.titulo': 'This page does not exist',
  'naoEncontrada.texto': 'The link may be out of date.',
  'naoEncontrada.voltar': 'Back to the start'
};

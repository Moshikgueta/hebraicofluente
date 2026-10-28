import type { Traducao } from '..';

/* app/inicio/Aula0Passos.tsx - a capa, a barra do passo e o fim da Aula 0. */
const pt = {
  passo1: 'Não é o sistema do português',
  passo2: 'Onde estão as vogais',
  passo3: 'O nikud',
  passo4: 'Entendeu o nikud?',
  passo5: 'Quatro letras especiais',
  passo6: 'Da direita para a esquerda',
  passo7: 'Formas finais e letra muda',
  passo8: 'Impressa e cursiva',
  passo9: 'Que hebraico é este',
  passo10: 'O caminho do curso',
  passo11: 'Checagem final',

  entrega1: 'Por que o hebraico quase não escreve as vogais, e onde elas estão.',
  entrega2: 'Para que lado se lê, e o que acontece com os números.',
  entrega3: 'O que são os pontinhos, as formas finais e a letra muda.',
  capaSelo: 'Aula 0 · {n} passos curtos',
  capaTitulo: 'O segredo do alfabeto, antes da primeira letra',
  /* "shalóm" é a transliteração: fica igual até a etapa 3. */
  capaLeitura: 'shalóm · lê-se da direita para a esquerda',
  rever: 'Rever passo a passo',
  continuarDo: 'Continuar do passo {n}',
  comecar: 'Começar a Aula 0',
  capaFeita: 'Aula 0 concluída: as letras estão abertas.',
  capaDuracao: 'Uns dez minutos. No fim, uma checagem rápida abre a primeira letra.',
  verTudo: 'Ver tudo numa página',

  sairAria: 'Sair dos passos e voltar à capa da Aula 0',
  passoDe: 'Aula 0 · passo {n} de {total}',
  voltar: 'Voltar',
  respondaChecagem: 'Responda a checagem acima: ela abre a primeira letra.',
  proximo: 'Próximo: {nome}',

  fimTitulo: 'Aula 0 concluída!',
  fimTexto: 'Você já sabe para que lado se lê, onde estão as vogais e o que são os pontinhos. A primeira letra está aberta.',
  fimComecar: 'Começar a primeira letra',
  fimVerPagina: 'Ver a Aula 0 numa página'
} as const;

const en: Traducao<typeof pt> = {
  passo1: 'Not the English system',
  passo2: 'Where the vowels are',
  passo3: 'Nikud',
  passo4: 'Did nikud make sense?',
  passo5: 'Four special letters',
  passo6: 'From right to left',
  passo7: 'Final forms and silent letters',
  passo8: 'Print and cursive',
  passo9: 'Which Hebrew this is',
  passo10: 'The path through the course',
  passo11: 'Final check',

  entrega1: 'Why Hebrew hardly writes the vowels, and where they are.',
  entrega2: 'Which way you read, and what happens with numbers.',
  entrega3: 'What the little dots, the final forms and the silent letter are.',
  capaSelo: 'Lesson 0 · {n} short steps',
  capaTitulo: 'The secret of the alphabet, before the first letter',
  capaLeitura: 'shalom · read from right to left',
  rever: 'Review step by step',
  continuarDo: 'Continue from step {n}',
  comecar: 'Start Lesson 0',
  capaFeita: 'Lesson 0 complete: the letters are open.',
  capaDuracao: 'About ten minutes. At the end, a quick check opens the first letter.',
  verTudo: 'See it all on one page',

  sairAria: 'Leave the steps and go back to the Lesson 0 cover',
  passoDe: 'Lesson 0 · step {n} of {total}',
  voltar: 'Back',
  respondaChecagem: 'Answer the check above: it opens the first letter.',
  proximo: 'Next: {nome}',

  fimTitulo: 'Lesson 0 complete!',
  fimTexto: 'You already know which way to read, where the vowels are and what the little dots are. The first letter is open.',
  fimComecar: 'Start the first letter',
  fimVerPagina: 'See Lesson 0 on one page'
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;

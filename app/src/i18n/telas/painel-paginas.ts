import type { Traducao } from '..';

/* O título e a descrição (metadata) das páginas do painel do aluno:
   app/historia, app/meu-hebraico, app/meu-hebraico/dominio, app/depoimento,
   app/certificado e app/verificar-certificado (cada page.tsx). */
const pt = {
  historiaTitulo: 'Viagem pela história do hebraico - Hebraico Fluente',
  historiaDescricao: 'De onde vem o alfabeto, de onde vieram os pontinhos, e como uma língua voltou a ser falada.',
  meuHebraicoTitulo: 'Meu Hebraico - Hebraico Fluente',
  meuHebraicoDescricao: 'Seus cursos, seu progresso e a aula de hoje.',
  dominioTitulo: 'Meu domínio das letras - Hebraico Fluente',
  dominioDescricao: 'As letras que você já domina, as que estão quase e o que vale praticar agora.',
  depoimentoTitulo: 'Seu depoimento - Hebraico Fluente',
  depoimentoDescricao: 'Conte como está sendo aprender a ler hebraico com o curso.',
  certificadoTitulo: 'Certificado - Hebraico Fluente',
  certificadoDescricao: 'O certificado de conclusão do curso de alfabetização em hebraico.',
  verificarTitulo: 'Conferir um certificado - Hebraico Fluente',
  verificarDescricao: 'Confira se um certificado do curso Hebraico A1 foi emitido pelo Hebraico Fluente.'
} as const;

const en: Traducao<typeof pt> = {
  historiaTitulo: 'A journey through the history of Hebrew - Hebraico Fluente',
  historiaDescricao: 'Where the alphabet comes from, where the little dots came from, and how a language came to be spoken again.',
  meuHebraicoTitulo: 'My Hebrew - Hebraico Fluente',
  meuHebraicoDescricao: 'Your courses, your progress and today\'s lesson.',
  dominioTitulo: 'My letter mastery - Hebraico Fluente',
  dominioDescricao: 'The letters you have mastered, the ones you almost have and what is worth practicing now.',
  depoimentoTitulo: 'Your testimonial - Hebraico Fluente',
  depoimentoDescricao: 'Tell us what it is like learning to read Hebrew with the course.',
  certificadoTitulo: 'Certificate - Hebraico Fluente',
  certificadoDescricao: 'The certificate of completion for the Hebrew reading course.',
  verificarTitulo: 'Verify a certificate - Hebraico Fluente',
  verificarDescricao: 'Check whether a Hebraico A1 course certificate was issued by Hebraico Fluente.'
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;

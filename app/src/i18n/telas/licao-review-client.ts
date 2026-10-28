import type { Traducao } from '..';

/* app/revisao/ReviewClient.tsx */
const pt = {
  nadaARevisar: 'Ainda não há o que revisar',
  seAlimenta:
    'A revisão rápida se alimenta do que você erra. Faça a primeira lição e ela começa a aparecer aqui, no dia certo.',
  irPrimeira: 'Ir para a primeira lição',
  placar: (certas: number, total: number) => `${certas} de ${total}`,
  feita: 'Revisão feita.',
  aindaFaltam: (n: number) =>
    `O que você errou volta amanhã, e o que acertou volta mais tarde. Ainda ${n === 1 ? 'falta 1 item' : `faltam ${n} itens`} para hoje: mais cinco questões resolvem.`,
  tudoRevisado:
    'Tudo o que estava para hoje foi revisado. O que você errou volta amanhã; o que acertou volta mais tarde, e some quando estiver firme.',
  maisCinco: 'Mais cinco',
  voltarInicio: 'Voltar ao início',
  revisaoRapida: 'Revisão rápida',
  tresMinutos: '3 minutos',
  cincoQuestoes: 'Cinco questões tiradas do que deu mais trabalho até aqui.',
  hojeVale: 'Hoje vale revisar',
  nadaPendente: 'Nada pendente - vamos reforçar as últimas',
  escorregadas: (n: number) => `${n} ${n === 1 ? 'escorregada' : 'escorregadas'}`,
  naoDa:
    'Ainda não dá para montar uma revisão: com as letras de agora não há alternativas suficientes para uma questão honesta. Siga mais uma lição e volte.',
  comecar: 'Começar',
  verMapa: 'Ver o mapa do curso',
  escreverDeNovo: 'Escrever de novo',
  pedemTracado: (n: number) =>
    `${n === 1 ? 'Esta letra pede' : 'Estas letras pedem'} o traçado de novo. Um traçado bom tira a marca de revisar.`
} as const;

const en: Traducao<typeof pt> = {
  nadaARevisar: 'Nothing to review yet',
  seAlimenta:
    'Quick review feeds on what you get wrong. Do the first lesson and it starts showing up here, on the right day.',
  irPrimeira: 'Go to the first lesson',
  placar: (certas, total) => `${certas} of ${total}`,
  feita: 'Review done.',
  aindaFaltam: n =>
    `What you got wrong comes back tomorrow, and what you got right comes back later. ${n === 1 ? '1 item is' : `${n} items are`} still due today: five more questions will take care of it.`,
  tudoRevisado:
    'Everything due today has been reviewed. What you got wrong comes back tomorrow; what you got right comes back later, and drops off once it is solid.',
  maisCinco: 'Five more',
  voltarInicio: 'Back to home',
  revisaoRapida: 'Quick review',
  tresMinutos: '3 minutes',
  cincoQuestoes: 'Five questions drawn from what has given you the most trouble so far.',
  hojeVale: 'Worth reviewing today',
  nadaPendente: 'Nothing due - let\'s reinforce the latest ones',
  escorregadas: n => `${n} ${n === 1 ? 'slip' : 'slips'}`,
  naoDa:
    'A review cannot be put together yet: with the letters you have now there are not enough options for a fair question. Do one more lesson and come back.',
  comecar: 'Start',
  verMapa: 'See the course map',
  escreverDeNovo: 'Write it again',
  pedemTracado: n =>
    `${n === 1 ? 'This letter needs' : 'These letters need'} to be traced again. A good tracing clears the review mark.`
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;

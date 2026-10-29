import type { Traducao } from '..';

/* components/landing/Decisoes.tsx */
const pt = {
  acesas: (n: number, total: number, nomes: string) => `${n} de ${total} · ${nomes}`,

  inicio: 'Início',
  meio: 'Meio',
  depois: 'Depois',
  /* Transliteração: fica igual até a etapa 3. */
  shalomTr: 'shalóm',
  shalomPt: 'olá, paz',
  notaInicio: 'Tudo à mostra: a palavra, como se diz e o que quer dizer.',
  notaMeio: 'O apoio encolhe. Você lê e confere só o que ficou em dúvida.',
  notaDepois: 'Você lê direto do hebraico. O apoio saiu porque já não fazia falta.',
  estagios: 'Estágios do apoio',

  exercicio: 'Exercício · escolha',
  qualBet: 'Qual destas é o Bet?',
  toque: 'Toque numa das duas para ver o que o curso responde.',
  correto: 'Correto',
  certoTexto: 'O Bet apoia a base inteira na linha e fecha o canto de cima à direita.',
  quase: 'Quase. Veja por quê.',
  quaseTexto: 'Este é o Kaf: o canto de baixo é arredondado. O Bet tem a base reta e um degrau à direita. Pode tentar de novo.',

  c1t: 'Uma letra de cada vez',
  c1b: 'Você conhece a letra, pratica com ela e só então avança. O alfabeto inteiro na tela no primeiro dia não ensina - assusta.',
  c1destaque: (n: number) => `${n} letras parecem difíceis. Uma letra por vez, não.`,
  c2t: 'O apoio aparece e depois sai',
  c2b: 'A transliteração ajuda no começo, e o objetivo nunca foi você depender dela. Ela vai diminuindo junto com o seu progresso, até você ler direto do hebraico.',
  c2destaque: 'O apoio chega quando você precisa e sai quando você já anda sozinho.',
  c3t: 'Retorno na hora, em cada passo',
  c3b: 'Você não precisa esperar por um professor para saber se acertou. Quando erra, o curso diz onde olhar e devolve a tentativa. O exame final corrige cada questão na hora, diz antes de começar a nota que aprova e, no fim, mostra quais partes pedem revisão.',
  c3destaque: 'Você nunca termina uma etapa sem saber se entendeu de verdade.',

  rubrica: 'Como o curso foi pensado',
  titulo: 'Três decisões que tornam o aprendizado mais leve.',
  lead: 'Cada parte do curso foi organizada para evitar sobrecarga e deixar você avançar com confiança.'
} as const;

const en: Traducao<typeof pt> = {
  acesas: (n: number, total: number, nomes: string) => `${n} of ${total} · ${nomes}`,

  inicio: 'Start',
  meio: 'Middle',
  depois: 'Later',
  shalomTr: 'shalom',
  shalomPt: 'hello, peace',
  notaInicio: 'Everything on display: the word, how to say it and what it means.',
  notaMeio: 'The support shrinks. You read and check only what you were unsure of.',
  notaDepois: 'You read straight from the Hebrew. The support left because you no longer needed it.',
  estagios: 'Stages of support',

  exercicio: 'Exercise · choose',
  qualBet: 'Which of these is Bet?',
  toque: 'Tap one of the two to see how the course responds.',
  correto: 'Correct',
  certoTexto: 'Bet rests its whole base on the line and closes the top right corner.',
  quase: 'Almost. Here is why.',
  quaseTexto: 'This is Kaf: the bottom corner is rounded. Bet has a straight base and a small step on the right. You can try again.',

  c1t: 'One letter at a time',
  c1b: 'You get to know the letter, practice with it and only then move on. The whole alphabet on screen on day one does not teach - it scares.',
  c1destaque: (n: number) => `${n} letters look hard. One letter at a time does not.`,
  c2t: 'The support shows up and then leaves',
  c2b: 'Transliteration helps at the start, and the goal was never for you to depend on it. It fades as you progress, until you read straight from the Hebrew.',
  c2destaque: 'The support arrives when you need it and leaves when you can walk on your own.',
  c3t: 'Feedback right away, at every step',
  c3b: 'You do not have to wait for a teacher to know if you got it right. When you make a mistake, the course tells you where to look and gives you another try. The final exam grades each question right away, tells you the passing score before you start and, at the end, shows which parts need review.',
  c3destaque: 'You never finish a step without knowing whether you really understood.',

  rubrica: 'How the course was designed',
  titulo: 'Three choices that make learning lighter.',
  lead: 'Every part of the course was organized to avoid overload and let you move forward with confidence.'
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;

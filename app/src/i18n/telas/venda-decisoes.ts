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

  c1t: 'Uma letra de cada vez',
  c1b: 'Você conhece a letra, pratica com ela e só então avança. O alfabeto inteiro na tela no primeiro dia não ensina - assusta.',
  c2t: 'O apoio aparece e depois sai',
  c2b: 'A transliteração ajuda no começo, e o objetivo nunca foi você depender dela. Ela vai diminuindo junto com o seu progresso, até você ler direto do hebraico.',
  c3t: 'Retorno na hora, em cada passo',
  c3b: 'Você não precisa esperar por um professor para saber se acertou. Quando erra, o curso diz onde olhar e devolve a tentativa, e o exame final corrige cada questão na hora.',

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

  c1t: 'One letter at a time',
  c1b: 'You get to know the letter, practice with it and only then move on. The whole alphabet on screen on day one does not teach - it scares.',
  c2t: 'The support shows up and then leaves',
  c2b: 'Transliteration helps at the start, and the goal was never for you to depend on it. It fades as you progress, until you read straight from the Hebrew.',
  c3t: 'Feedback right away, at every step',
  c3b: 'You do not have to wait for a teacher to know if you got it right. When you make a mistake, the course tells you where to look and gives you another try, and the final exam grades each question right away.',

  rubrica: 'How the course was designed',
  titulo: 'Three choices that make learning lighter.',
  lead: 'Every part of the course was organized to avoid overload and let you move forward with confidence.'
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;

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

const es: Traducao<typeof pt> = {
  acesas: (n: number, total: number, nomes: string) => `${n} de ${total} · ${nomes}`,

  inicio: 'Inicio',
  meio: 'Mitad',
  depois: 'Después',
  shalomTr: 'shalóm',
  shalomPt: 'hola, paz',
  notaInicio: 'Todo a la vista: la palabra, cómo se dice y qué significa.',
  notaMeio: 'El apoyo se achica. Lees y revisas solo lo que te quedó en duda.',
  notaDepois: 'Lees directo del hebreo. El apoyo se fue porque ya no hacía falta.',
  estagios: 'Etapas del apoyo',

  c1t: 'Una letra a la vez',
  c1b: 'Conoces la letra, practicas con ella y solo entonces avanzas. El alfabeto entero en la pantalla el primer día no enseña: asusta.',
  c2t: 'El apoyo aparece y después se va',
  c2b: 'La transliteración ayuda al principio, y el objetivo nunca fue que dependieras de ella. Va disminuyendo junto con tu progreso, hasta que lees directo del hebreo.',
  c3t: 'Respuesta al instante, en cada paso',
  c3b: 'No necesitas esperar a un profesor para saber si acertaste. Cuando te equivocas, el curso te dice dónde mirar y te devuelve el intento, y el examen final corrige cada pregunta al instante.',

  rubrica: 'Cómo se pensó el curso',
  titulo: 'Tres decisiones que hacen el aprendizaje más ligero.',
  lead: 'Cada parte del curso se organizó para evitar la sobrecarga y dejarte avanzar con confianza.'
};

export const DICIONARIO = { pt, en, es };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : process.env.NEXT_PUBLIC_LOCALE === 'es' ? es : pt;

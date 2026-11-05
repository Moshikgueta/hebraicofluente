import type { Traducao } from '..';

/* A página Ler cardápios (05/11/2026): app/cardapios. */
const pt = {
  metaTitulo: 'Ler cardápios - Hebraico Fluente',
  metaDescricao: 'Cardápios de café, falafel e padaria como chegam em Israel, sem nikud, para ler e entender.',
  voltar: 'Leituras',
  titulo: 'Ler cardápios',
  intro: 'Em Israel, o cardápio vem sem os pontos. Leia cada nome em voz alta: muitos você reconhece pelo som. Se travar, mostre os pontos.',
  trancadoTitulo: 'Abre com as 22 letras',
  trancadoTexto: 'Os cardápios usam o alfabeto inteiro. Eles abrem quando você dominar as 22 letras.',
  continuar: 'Continuar o curso',
  mostrarPontos: 'Mostrar os pontos',
  entendeu: 'Leia o cardápio',
  responda: 'Responda olhando só para o cardápio acima.',
  fechoBom: 'Você leu um cardápio de verdade.',
  fechoParcial: 'Leia os nomes de novo em voz alta, com os pontos, e tente outra vez.',
  outros: 'Outros cardápios',
  cardapioN: (i: number, total: number) => `Cardápio ${i} de ${total}`
} as const;

const en: Traducao<typeof pt> = {
  metaTitulo: 'Reading menus - Hebrew Unlocked',
  metaDescricao: 'Coffee shop, falafel and bakery menus as they appear in Israel, without nikud, to read and understand.',
  voltar: 'Readings',
  titulo: 'Reading menus',
  intro: 'In Israel, menus come without the vowel points. Read each name aloud: you will recognize many by their sound. If you get stuck, show the points.',
  trancadoTitulo: 'Opens with the 22 letters',
  trancadoTexto: 'The menus use the whole alphabet. They open when you have mastered the 22 letters.',
  continuar: 'Continue the course',
  mostrarPontos: 'Show the points',
  entendeu: 'Read the menu',
  responda: 'Answer looking only at the menu above.',
  fechoBom: 'You read a real menu.',
  fechoParcial: 'Read the names aloud again, with the points, and try once more.',
  outros: 'Other menus',
  cardapioN: (i: number, total: number) => `Menu ${i} of ${total}`
};

const es: Traducao<typeof pt> = {
  metaTitulo: 'Leer menús - Hebraico Fluente',
  metaDescricao: 'Menús de café, falafel y panadería como llegan en Israel, sin nikud, para leer y entender.',
  voltar: 'Lecturas',
  titulo: 'Leer menús',
  intro: 'En Israel, el menú viene sin los puntos. Lee cada nombre en voz alta: a muchos los reconoces por el sonido. Si te trabas, muestra los puntos.',
  trancadoTitulo: 'Se abre con las 22 letras',
  trancadoTexto: 'Los menús usan el alfabeto entero. Se abren cuando domines las 22 letras.',
  continuar: 'Seguir el curso',
  mostrarPontos: 'Mostrar los puntos',
  entendeu: 'Lee el menú',
  responda: 'Responde mirando solo el menú de arriba.',
  fechoBom: 'Leíste un menú de verdad.',
  fechoParcial: 'Lee los nombres otra vez en voz alta, con los puntos, y vuelve a intentarlo.',
  outros: 'Otros menús',
  cardapioN: (i: number, total: number) => `Menú ${i} de ${total}`
};

export const DICIONARIO = { pt, en, es };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : process.env.NEXT_PUBLIC_LOCALE === 'es' ? es : pt;

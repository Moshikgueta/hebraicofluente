import type { Traducao } from '..';

/* components/learn/OndeNasceOSom.tsx */
const pt = {
  labios: 'lábios',
  labiosFrase: 'dos dois lábios',
  labioDentes: 'lábio e dentes',
  labioDentesFrase: 'dos dentes de cima no lábio de baixo',
  dentes: 'atrás dos dentes',
  dentesFrase: 'da ponta da língua atrás dos dentes',
  palato: 'céu da boca',
  palatoFrase: 'do meio da língua perto do céu da boca',
  veu: 'fundo do céu da boca',
  veuFrase: 'do fundo da língua no fundo do céu da boca',
  uvula: 'úvula',
  uvulaFrase: 'da úvula, no fundo da boca',
  glote: 'cordas vocais',
  gloteFrase: 'das cordas vocais, na garganta',
  semLugar: 'de lugar nenhum: a letra não tem som próprio',
  descricao: (letra: string, onde: string, voz: boolean | null, nariz?: boolean) =>
    `Corte da cabeça de perfil. O som de ${letra} sai ${onde}${
      voz === null ? '' : voz ? ', com a voz ligada' : ', sem voz, só com o ar'
    }${nariz ? ', e o ar sai pelo nariz' : ''}.`,
  semSom: 'sem som próprio',
  deOnde: 'De onde sai o som?',
  muda: 'Muda: quem soa é a vogal',
  comVoz: 'Com voz: a garganta vibra',
  semVoz: 'Sem voz: só o ar passando',
  nariz: 'O ar sai pelo nariz'
} as const;

const en: Traducao<typeof pt> = {
  labios: 'lips',
  labiosFrase: 'from both lips',
  labioDentes: 'lip and teeth',
  labioDentesFrase: 'from the upper teeth on the lower lip',
  dentes: 'behind the teeth',
  dentesFrase: 'from the tip of the tongue behind the teeth',
  palato: 'roof of the mouth',
  palatoFrase: 'from the middle of the tongue near the roof of the mouth',
  veu: 'back of the roof of the mouth',
  veuFrase: 'from the back of the tongue at the back of the roof of the mouth',
  uvula: 'uvula',
  uvulaFrase: 'from the uvula, at the back of the mouth',
  glote: 'vocal cords',
  gloteFrase: 'from the vocal cords, in the throat',
  semLugar: 'from nowhere: the letter has no sound of its own',
  descricao: (letra, onde, voz, nariz) =>
    `Side view of a head. The sound of ${letra} comes ${onde}${
      voz === null ? '' : voz ? ', with the voice on' : ', voiceless, just air'
    }${nariz ? ', and the air comes out through the nose' : ''}.`,
  semSom: 'no sound of its own',
  deOnde: 'Where does the sound come from?',
  muda: 'Silent: the vowel is what you hear',
  comVoz: 'Voiced: the throat vibrates',
  semVoz: 'Voiceless: just air passing',
  nariz: 'The air comes out through the nose'
};

const es: Traducao<typeof pt> = {
  labios: 'labios',
  labiosFrase: 'de los dos labios',
  labioDentes: 'labio y dientes',
  labioDentesFrase: 'de los dientes de arriba en el labio de abajo',
  dentes: 'detrás de los dientes',
  dentesFrase: 'de la punta de la lengua detrás de los dientes',
  palato: 'paladar',
  palatoFrase: 'del medio de la lengua cerca del paladar',
  veu: 'fondo del paladar',
  veuFrase: 'del fondo de la lengua en el fondo del paladar',
  uvula: 'úvula',
  uvulaFrase: 'de la úvula, al fondo de la boca',
  glote: 'cuerdas vocales',
  gloteFrase: 'de las cuerdas vocales, en la garganta',
  semLugar: 'de ningún lugar: la letra no tiene sonido propio',
  descricao: (letra, onde, voz, nariz) =>
    `Corte de la cabeza de perfil. El sonido de ${letra} sale ${onde}${
      voz === null ? '' : voz ? ', con la voz encendida' : ', sin voz, solo con el aire'
    }${nariz ? ', y el aire sale por la nariz' : ''}.`,
  semSom: 'sin sonido propio',
  deOnde: '¿De dónde sale el sonido?',
  muda: 'Muda: lo que suena es la vocal',
  comVoz: 'Con voz: la garganta vibra',
  semVoz: 'Sin voz: solo el aire que pasa',
  nariz: 'El aire sale por la nariz'
};

export const DICIONARIO = { pt, en, es };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : process.env.NEXT_PUBLIC_LOCALE === 'es' ? es : pt;

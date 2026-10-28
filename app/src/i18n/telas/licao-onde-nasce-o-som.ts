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

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;

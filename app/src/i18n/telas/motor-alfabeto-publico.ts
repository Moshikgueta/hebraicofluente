import type { Traducao } from '..';

/* lib/alfabeto-publico.ts - o sentido da palavra de exemplo e o erro comum
   de cada letra nas páginas públicas do alfabeto. As marcas {{ }} são o
   hebraico, desenhado com <He>, e são as mesmas nos dois idiomas. */
const pt = {
  alefSentido: 'pai',
  alefErrado: 'Tentar produzir algum som para o {{א}}, ou tratá-lo como um A fixo.',
  alefCerto: 'Ler apenas a vogal marcada: {{אוֹ}} é "o", {{אִ}} é "i".',
  memSentido: 'mãe',
  memErrado: 'Ler {{אֵם}} como o "em" do português, com a vogal anasalada e o M sumindo.',
  memCerto: 'Ler {{אֵם}} com a vogal oral, como o E de "mesa", e fechar os lábios de verdade no M do fim.',
  tavSentido: 'verdade',
  tavErrado: 'Ler {{תִי}} como "tchi" e {{תֵ}} como "tche".',
  tavCerto: 'Ler {{תִי}} como "ti" e {{תֵ}} como "te", com o T seco.',
  shinSentido: 'paz / olá / tchau',
  shinErrado: 'Ler {{ש}} como S: "salóm", "sem".',
  shinCerto: 'Ler {{ש}} como o X de "xícara" ou o CH de "chave" (transliterado "sh"): "shalóm", "shem".',
  lamedSentido: 'noite',
  lamedErrado: 'Ler {{שֶׁל}} como "sheu", transformando o L final em U.',
  lamedCerto: 'Ler {{שֶׁל}} como "shel", com o L bem apoiado na ponta da língua.'
} as const;

const en: Traducao<typeof pt> = {
  alefSentido: 'dad',
  alefErrado: 'Trying to give {{א}} a sound of its own, or treating it as a fixed A.',
  alefCerto: 'Read only the vowel that is marked: {{אוֹ}} is "o", {{אִ}} is "i".',
  memSentido: 'mom',
  // etapa 3: pronúncia, rever
  memErrado: 'Reading {{אֵם}} with a drawn-out vowel, like the "ay" in "aim", and letting the M fade away.',
  // etapa 3: pronúncia, rever
  memCerto: 'Read {{אֵם}} with a short, clean E, like the E in "met", and really close your lips on the final M.',
  tavSentido: 'truth',
  // etapa 3: pronúncia, rever
  tavErrado: 'Reading {{תִי}} as "chee" and {{תֵ}} as "cheh".',
  // etapa 3: pronúncia, rever
  tavCerto: 'Read {{תִי}} as "ti" and {{תֵ}} as "te", with a crisp T.',
  shinSentido: 'peace / hello / goodbye',
  shinErrado: 'Reading {{ש}} as S: "salom", "sem".',
  // etapa 3: pronúncia, rever
  shinCerto: 'Read {{ש}} like the SH in "shoe" (transliterated "sh"): "shalom", "shem".',
  lamedSentido: 'night',
  // etapa 3: pronúncia, rever
  lamedErrado: 'Reading {{שֶׁל}} with a swallowed, dark L at the end, so it sounds like "sheo".',
  // etapa 3: pronúncia, rever
  lamedCerto: 'Read {{שֶׁל}} as "shel", with the L clearly touching the tip of the tongue.'
};

const es: Traducao<typeof pt> = {
  alefSentido: 'papá',
  alefErrado: 'Intentar darle un sonido propio a la {{א}}, o tratarla como una A fija.',
  alefCerto: 'Leer solo la vocal marcada: {{אוֹ}} es "o", {{אִ}} es "i".',
  memSentido: 'mamá',
  // etapa 3: pronúncia, rever
  memErrado: 'Leer {{אֵם}} con la vocal alargada o nasal, y dejar que la M del final se pierda.',
  // etapa 3: pronúncia, rever
  memCerto: 'Leer {{אֵם}} con una E corta y clara, como la E de "mesa", y cerrar de verdad los labios en la M del final.',
  tavSentido: 'verdad',
  // etapa 3: pronúncia, rever
  tavErrado: 'Leer {{תִי}} como "chi" y {{תֵ}} como "che".',
  // etapa 3: pronúncia, rever
  tavCerto: 'Leer {{תִי}} como "ti" y {{תֵ}} como "te", con la T seca.',
  shinSentido: 'paz / hola / adiós',
  shinErrado: 'Leer {{ש}} como S: "salóm", "sem".',
  // etapa 3: pronúncia, rever
  shinCerto: 'Leer {{ש}} como el sonido que se hace para pedir silencio, "shh" (transliterado "sh"): "shalóm", "shem".',
  lamedSentido: 'noche',
  // etapa 3: pronúncia, rever
  lamedErrado: 'Leer {{שֶׁל}} con la L final tragada u oscura, de modo que suene como "sheo".',
  // etapa 3: pronúncia, rever
  lamedCerto: 'Leer {{שֶׁל}} como "shel", con la L bien apoyada en la punta de la lengua, como la L de "sol".'
};

export const DICIONARIO = { pt, en, es };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : process.env.NEXT_PUBLIC_LOCALE === 'es' ? es : pt;

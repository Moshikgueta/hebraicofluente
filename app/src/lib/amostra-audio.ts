/* As gravações públicas da landing (28/09/2026).
 * `/audio/` fica atrás do portão; estas quatro são copiadas pelo exportador
 * para `/amostra-audio/<nome>.mp3` (tools/export-content.mjs, a mesma lista),
 * e são o que o "Ouça e fale" da capa toca. tests/amostra-audio.test.ts
 * confere que a lista daqui e os arquivos publicados batem. */
/* Os nomes das três letras entraram em 01/10/2026, a pedido do dono: o
   passo "Ouça e descubra a letra" tocava a sílaba («sha») onde se esperava
   ouvir o NOME da letra («Shin»). A sílaba continua, depois do acerto. */
/* As da lição 1 entraram em 03/10/2026: o teste grátis do Álef (DemoAlef)
   toca o nome da letra, as cinco sílabas e as três palavras dele. */
export const AMOSTRA_AUDIO = {
  sha: 'שַׁ', ma: 'מַ', la: 'לַ', shalom: 'שָׁלוֹם',
  shin: 'שִׁין', mem: 'מֵם', lamed: 'לָמֶד',
  alef: 'אָלֶף', 'alef-a': 'אַ', 'alef-e': 'אֶ', 'alef-i': 'אִ', 'alef-o': 'אוֹ', 'alef-u': 'אוּ',
  aba: 'אַבָּא', etmol: 'אֶתְמוֹל', ochel: 'אֹכֶל',
  /* As páginas do alfabeto (23/10/2026, lib/alfabeto-publico.ts): o nome do
     Tav e a palavra de exemplo de cada letra. */
  tav: 'תָו', ima: 'אִמָא', emet: 'אֶמֶת', laila: 'לַיְלָה'
} as const;
export type NomeAmostra = keyof typeof AMOSTRA_AUDIO;
export const urlAmostra = (nome: NomeAmostra): string => `/amostra-audio/${nome}.mp3`;

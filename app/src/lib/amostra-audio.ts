/* As gravações públicas da landing (28/09/2026).
 * `/audio/` fica atrás do portão; estas quatro são copiadas pelo exportador
 * para `/amostra-audio/<nome>.mp3` (tools/export-content.mjs, a mesma lista),
 * e são o que o "Ouça e fale" da capa toca. tests/amostra-audio.test.ts
 * confere que a lista daqui e os arquivos publicados batem. */
export const AMOSTRA_AUDIO = { sha: 'שַׁ', ma: 'מַ', la: 'לַ', shalom: 'שָׁלוֹם' } as const;
export type NomeAmostra = keyof typeof AMOSTRA_AUDIO;
export const urlAmostra = (nome: NomeAmostra): string => `/amostra-audio/${nome}.mp3`;

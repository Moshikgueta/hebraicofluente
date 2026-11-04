import { LOCALE } from './locale';

/* A transliteração do site em inglês, para o que o CÓDIGO escreve (nomes de
   letras do teclado, rótulos). É a mesma regra de tools/translit-en.mjs, que
   converte o conteúdo na build; tests/translit.test.ts confere que as duas
   dão o mesmo resultado. Ver PLANO-INGLES.md, etapa 3. */
const AGUDO: Record<string, string> = { á: 'a', é: 'e', í: 'i', ó: 'o', ú: 'u', Á: 'A', É: 'E', Í: 'I', Ó: 'O', Ú: 'U', â: 'a', ê: 'e', ô: 'o' };

export function translitEn(texto: string): string {
  return String(texto)
    .replace(/([Gg])u(?=[eiéíEIÉÍ])/g, '$1')
    .replace(/(^|[^dD])j/g, '$1zh')
    .replace(/(^|[^dD])J/g, '$1Zh')
    .replace(/dj/g, 'j').replace(/Dj/g, 'J').replace(/DJ/g, 'J')
    .replace(/ss/g, 's')
    .replace(/[áéíóúÁÉÍÓÚâêô]/g, c => AGUDO[c]!);
}

const CIRCUNFLEXO: Record<string, string> = { â: 'á', ê: 'é', ô: 'ó', Â: 'Á', Ê: 'É', Ô: 'Ó' };

/** A do site em espanhol: a mesma regra de tools/translit-es.mjs (ch -> j, tch -> ch,
    j -> zh, dj -> y, ss -> s; o acento da sílaba forte fica). */
export function translitEs(texto: string): string {
  return String(texto)
    .replace(/tch/g, '\u0001').replace(/Tch/g, '\u0002').replace(/TCH/g, '\u0002')
    .replace(/dj/g, '\u0003').replace(/Dj/g, '\u0004').replace(/DJ/g, '\u0004')
    .replace(/j/g, 'zh').replace(/J/g, 'Zh')
    .replace(/ch/g, 'j').replace(/Ch/g, 'J').replace(/CH/g, 'J')
    .replace(/\u0001/g, 'ch').replace(/\u0002/g, 'Ch')
    .replace(/\u0003/g, 'y').replace(/\u0004/g, 'Y')
    .replace(/ss/g, 's')
    .replace(/[âêôÂÊÔ]/g, c => CIRCUNFLEXO[c]!);
}

/** A transliteração no idioma da build: igual no português, convertida no inglês e no espanhol. */
export const translit = (texto: string): string =>
  (LOCALE === 'en' ? translitEn(texto) : LOCALE === 'es' ? translitEs(texto) : texto);

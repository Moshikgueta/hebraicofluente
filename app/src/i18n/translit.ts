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

/** A transliteração no idioma da build: igual no português, convertida no inglês. */
export const translit = (texto: string): string => (LOCALE === 'en' ? translitEn(texto) : texto);

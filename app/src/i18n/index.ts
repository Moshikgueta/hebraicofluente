/* O idioma da interface. Um arquivo por tela em telas/, cada um com o
   português (a fonte, o texto que a tela mostrava antes) e o inglês lado a
   lado. A tela importa só o dela, e a build leva só o idioma dela:

     // telas/nao-encontrada.ts
     const pt = { titulo: 'Esta página não existe' } as const;
     const en: Traducao<typeof pt> = { titulo: 'This page does not exist' };
     export const DICIONARIO = { pt, en };
     export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;

   A linha do `tx` precisa ser escrita assim, em cada arquivo: a build troca
   a variável pelo valor e o minificador apaga o idioma que não vai ao ar. Uma
   função que escolhesse por fora manteria os dois no pacote do navegador. */
export { LOCALE, LANG_HTML, OG_LOCALE } from './locale';

/** O inglês de um dicionário: as mesmas chaves (nenhuma a mais, nenhuma a
    menos), texto onde o português tem texto e função com a mesma assinatura
    onde ele tem função (plural, frase com um pedaço em <He>). */
export type Traducao<T> = {
  [K in keyof T]: T[K] extends (...a: infer A) => infer R ? (...a: A) => R : string;
};

/**
 * `{nome}` no texto recebe `vars.nome`. Uma variável que falta fica à vista
 * (`{nome}`), para o defeito aparecer na tela e no teste em vez de sumir.
 */
export function fmt(texto: string, vars: Record<string, string | number>): string {
  return texto.replace(/\{(\w+)\}/g, (marca, nome: string) =>
    nome in vars ? String(vars[nome]) : marca);
}

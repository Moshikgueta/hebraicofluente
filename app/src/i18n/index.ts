import { LOCALE } from './locale';
import { pt, type Chave } from './pt';
import { en } from './en';

export { LOCALE, LANG_HTML, OG_LOCALE } from './locale';
export type { Chave } from './pt';

const DICIONARIO: Record<Chave, string> = LOCALE === 'en' ? en : pt;

/**
 * O texto da interface no idioma da build. `{nome}` no texto recebe
 * `vars.nome`; uma variável que falta fica visível (`{nome}`), para o defeito
 * aparecer na tela e no teste em vez de sumir.
 */
export function t(chave: Chave, vars?: Record<string, string | number>): string {
  const texto = DICIONARIO[chave];
  if (!vars) return texto;
  return texto.replace(/\{(\w+)\}/g, (marca, nome: string) =>
    nome in vars ? String(vars[nome]) : marca);
}

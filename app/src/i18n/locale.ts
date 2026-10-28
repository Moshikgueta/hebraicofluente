/* O idioma da build. Um site por idioma, cada um com o seu export:
   `NEXT_PUBLIC_LOCALE=en` gera o site em inglês (app/out-en), e sem a
   variável sai o português de hoje (app/out). O valor é fixado na build, então
   o navegador nunca escolhe idioma nem baixa o dicionário do outro. */
export type Locale = 'pt' | 'en';

export const LOCALE: Locale = process.env.NEXT_PUBLIC_LOCALE === 'en' ? 'en' : 'pt';

/** O `lang` do <html>. */
export const LANG_HTML = LOCALE === 'en' ? 'en' : 'pt-BR';

/** O `og:locale` dos cartões de link. */
export const OG_LOCALE = LOCALE === 'en' ? 'en_US' : 'pt_BR';

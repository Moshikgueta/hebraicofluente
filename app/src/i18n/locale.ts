/* O idioma da build. Um site por idioma, cada um com o seu export:
   `NEXT_PUBLIC_LOCALE=en` gera o site em inglês (app/out-en), `es` o em
   espanhol (app/out-es, desde 04/11/2026), e sem a variável sai o português
   de hoje (app/out). O valor é fixado na build, então o navegador nunca
   escolhe idioma nem baixa o dicionário do outro. */
export type Locale = 'pt' | 'en' | 'es';

export const LOCALE: Locale =
  process.env.NEXT_PUBLIC_LOCALE === 'en' ? 'en' : process.env.NEXT_PUBLIC_LOCALE === 'es' ? 'es' : 'pt';

/** Site de fora do Brasil (inglês ou espanhol): sem PIX, sem CDC, sem
    WhatsApp (+55), Paddle em dólar, 14 dias para desistir. É o que o inglês
    decidiu primeiro, e o espanhol segue (PLANO-ESPANHOL.md). */
export const EXTERIOR = LOCALE !== 'pt';

/** O `lang` do <html>. */
export const LANG_HTML = LOCALE === 'en' ? 'en' : LOCALE === 'es' ? 'es' : 'pt-BR';

/** O `og:locale` dos cartões de link. */
export const OG_LOCALE = LOCALE === 'en' ? 'en_US' : LOCALE === 'es' ? 'es_LA' : 'pt_BR';

/** O formato de data, hora e número (Intl, toLocaleString). */
export const LOCALE_INTL = LOCALE === 'en' ? 'en-US' : LOCALE === 'es' ? 'es-419' : 'pt-BR';

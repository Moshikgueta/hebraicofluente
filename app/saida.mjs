/* A pasta do export que as conferências leem.
   A build em inglês (NEXT_PUBLIC_LOCALE=en) sai em out-en, que é o que o
   wrangler.toml deste repositório publica; a de português, em out. Cada
   conferência (pacote, promessas, números, clique, acessibilidade, SEO) lê
   daqui, para nunca conferir uma build e publicar a outra. */
export const EM_INGLES = process.env.NEXT_PUBLIC_LOCALE === 'en';
/* O espanhol (04/11/2026) sai em out-es. */
export const EM_ESPANHOL = process.env.NEXT_PUBLIC_LOCALE === 'es';
export const OUT = EM_INGLES ? 'out-en' : EM_ESPANHOL ? 'out-es' : 'out';

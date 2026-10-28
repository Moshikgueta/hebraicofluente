/* O idioma do site e o de cada conta (PLANO-INGLES.md).
 * ─────────────────────────────────────────────────────────────────────────
 * Os dois sites são o mesmo código sobre o mesmo banco. Cada Worker sabe o
 * seu idioma pela variável LOCALE (wrangler.en.toml diz "en"; o wrangler.toml
 * não diz nada, e é português). A conta guarda o idioma do site em que foi
 * criada (accounts.idioma, migração 0004).
 *
 * Quem escolhe o idioma de um e-mail:
 *   - o que a pessoa pediu agora (cadastro, esqueci a senha): o do site em
 *     que ela está, `idiomaDoWorker`;
 *   - o que sai do agendamento ou de um aviso do provedor (lembretes,
 *     vencimento, estorno): o da conta, porque quem roda é o Worker
 *     brasileiro, para todas as contas.
 */

/** 'en' no Worker do site em inglês, 'pt' em qualquer outro. */
export const idiomaDoWorker = env => (env && env.LOCALE === 'en' ? 'en' : 'pt');

/** O idioma de uma linha de `accounts`; conta sem a coluna é do site brasileiro. */
export const idiomaDaConta = conta => (conta && conta.idioma === 'en' ? 'en' : 'pt');

const semBarra = s => String(s || '').replace(/\/+$/, '');

/**
 * A origem dos links de um e-mail no idioma dado. O Worker de um idioma usa o
 * próprio SITE_ORIGIN; o brasileiro, mandando para uma conta do site em
 * inglês, usa SITE_ORIGIN_EN. Sem ela (o site em inglês ainda não publicado),
 * fica o SITE_ORIGIN: um link que abre o site errado ainda leva à conta certa.
 */
export function origemDoIdioma(env, idioma) {
  if (idioma === idiomaDoWorker(env)) return semBarra(env && env.SITE_ORIGIN);
  if (idioma === 'en') return semBarra((env && env.SITE_ORIGIN_EN) || (env && env.SITE_ORIGIN));
  return semBarra((env && env.SITE_ORIGIN_PT) || (env && env.SITE_ORIGIN));
}

/** O nome do curso no idioma: `titleEn` do catálogo, quando existe. */
export const tituloDoCurso = (curso, idioma, reserva = '') =>
  (idioma === 'en' && curso && curso.titleEn) || (curso && curso.titlePt) || reserva;

/**
 * O que o site em inglês não tem: os produtos que só existem em português
 * (Raízes, A1, o livro e a prévia dele) e os painéis do dono, que ficam no
 * site brasileiro (o banco é o mesmo). Página e API. O Worker em inglês
 * responde 404 a isso tudo; o brasileiro não olha esta lista.
 */
export const FORA_DO_SITE_EN =
  /^\/(raizes|a1|israel|previa|admin)(\/|$)|^\/api\/(admin|a1|livro|content\/(raizes|a1))(\/|$)/i;

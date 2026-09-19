/* O portão de rota, do lado do servidor.
 * ─────────────────────────────────────────────────────────────────────────
 * A lista abaixo é de prefixos de rota que exigem o curso pago. Sem cookie
 * válido, ou com cookie sem o direito de acesso, a resposta é um 302 para a
 * página de vendas - o HTML da aula não sai do servidor.
 *
 * ⚠ O QUE ISTO RESOLVE E O QUE NÃO RESOLVE
 *
 * Resolve: o endereço direto. Ninguém abre /licao/alef/ com um link e lê a
 * lição.
 *
 * NÃO resolve: o conteúdo em si. O curso é um app estático, e as palavras, as
 * lições e os exercícios viajam dentro dos pacotes JavaScript de /_next/, que
 * são servidos livremente - têm de ser, porque a página pública os carrega.
 * Quem souber abrir a aba de rede baixa o conteúdo sem pagar.
 *
 * Fechar isso de verdade exige a outra metade, que está planejada e não
 * escrita: o conteúdo sair do pacote e passar a ser buscado em
 * /api/content/*, atrás deste mesmo cookie. Enquanto isso não acontecer, esta
 * limitação está escrita aqui, no README e em ARCHITECTURE.md §11.4 - e não
 * deve ser descrita a ninguém como proteção de conteúdo.
 *
 * O que ela é de verdade: um portão de produto que manda a pessoa certa para
 * o lugar certo, e a camada em que a metade que falta vai se encaixar.
 */

import { readSession } from './lib/session.js';
import { hasEntitlement, findAccountById } from './lib/db.js';

/* As rotas do curso pago. Uma lista de prefixos, e não uma de rotas livres:
   uma rota nova nasce protegida, e o erro possível é pedir login onde não
   precisava - nunca o contrário. */
const GATED = [
  '/licao', '/modulo', '/checkpoint', '/extra', '/revisao', '/academia',
  '/mapa', '/desafio-final', '/certificado', '/concluido', '/conquistas',
  '/historia', '/workbook', '/inicio', '/onboarding', '/meu-hebraico'
];

/* O curso que essas rotas pertencem. Quando o A1 tiver as próprias rotas,
   esta constante vira um mapa de prefixo → curso. */
const COURSE = 'alfabetizacao';

export function isGatedPath(path) {
  const p = String(path || '/').replace(/\/+$/, '') || '/';
  return GATED.some(prefix => p === prefix || p.startsWith(prefix + '/'));
}

/** `null` quando pode passar; uma Response de redirecionamento quando não. */
export async function gate(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;

  if (!isGatedPath(path)) return null;

  /* Só documentos. Uma fonte, um ícone ou um JSON pedido de dentro de uma
     página já liberada não deve ser redirecionado para HTML - isso quebra a
     página em vez de proteger alguma coisa. */
  const dest = request.headers.get('Sec-Fetch-Dest');
  if (dest && dest !== 'document') return null;

  const sess = await readSession(request, env);
  if (!sess) return redirect(url, `/entrar/?next=${encodeURIComponent(path)}`);

  const account = await findAccountById(env, sess.uid);
  if (!account || (Number(account.session_version) || 0) !== (Number(sess.sv) || 0)) {
    return redirect(url, `/entrar/?next=${encodeURIComponent(path)}`);
  }

  if (!await hasEntitlement(env, account.id, COURSE)) {
    return redirect(url, `/cursos/${COURSE}/`);
  }

  return null;
}

function redirect(url, to) {
  return new Response(null, {
    status: 302,
    headers: {
      Location: new URL(to, url.origin).toString(),
      /* Sem cache. Um 302 guardado pelo navegador continuaria mandando o
         aluno para a tela de vendas depois de ele ter comprado. */
      'Cache-Control': 'no-store'
    }
  });
}

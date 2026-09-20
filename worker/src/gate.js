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
 *
 * ── A lição da auditoria ──────────────────────────────────────────────────
 * Este portão já teve uma exceção: "se `Sec-Fetch-Dest` não for `document`,
 * deixa passar", para não redirecionar um sub-recurso para HTML. Só que o
 * cabeçalho é escolhido por quem chama. Fora de um navegador ele é uma linha
 * de curl, e `curl -H 'Sec-Fetch-Dest: empty' /licao/alef/` recebia a aula
 * inteira, sem cookie, antes de a sessão ser sequer lida. Uma decisão de
 * acesso não pode depender de um dado que o cliente escreve.
 *
 * Agora TODA requisição a uma rota paga passa pela sessão. O cabeçalho só
 * decide a FORMA da recusa: um documento é redirecionado para o login; um
 * sub-recurso (o `index.txt` que o Next busca ao navegar sem recarregar)
 * recebe um 403 seco - o app trata um RSC recusado como navegação de página
 * inteira, e ela cai no 302 como qualquer link.
 */

import { readSession } from './lib/session.js';
import { hasEntitlement, findAccountById } from './lib/db.js';

/* As rotas do curso pago. Uma lista de prefixos, e não uma de rotas livres:
   uma rota nova nasce protegida, e o erro possível é pedir login onde não
   precisava - nunca o contrário. */
const GATED = [
  '/licao', '/modulo', '/checkpoint', '/extra', '/revisao', '/academia',
  '/mapa', '/desafio-final', '/certificado', '/concluido', '/conquistas',
  '/historia', '/workbook', '/inicio', '/onboarding', '/meu-hebraico',
  /* Os clipes de áudio ainda não existem; quando chegarem, nascem atrás do
     portão em vez de serem descobertos públicos depois. */
  '/audio'
];

/* O curso que essas rotas pertencem. Quando o A1 tiver as próprias rotas,
   esta constante vira um mapa de prefixo → curso. */
const COURSE = 'alfabetizacao';

/**
 * O caminho, canonizado antes de comparar.
 *
 * Decodifica o percent-encoding, colapsa barras repetidas, ignora
 * maiúsculas. O servidor de ativos da Cloudflare já normaliza essas formas
 * antes de resolver o arquivo (`//licao/alef/` vira `/licao/alef/`), e é
 * exatamente por isso que a comparação aqui tem de ver a mesma coisa que ele
 * vê - senão o portão julga uma grafia e o ativo é servido por outra. Um
 * caminho que não decodifica é tratado como pago: na dúvida, o portão fecha.
 */
export function canonical(path) {
  let p = String(path || '/');
  try { p = decodeURIComponent(p); } catch { return null; }
  p = p.toLowerCase().replace(/\/{2,}/g, '/').replace(/\/+$/, '');
  return p || '/';
}

export function isGatedPath(path) {
  const p = canonical(path);
  if (p === null) return true;
  return GATED.some(prefix => p === prefix || p.startsWith(prefix + '/'));
}

/** `null` quando pode passar; uma Response de recusa quando não. */
export async function gate(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;

  if (!isGatedPath(path)) return null;

  const dest = request.headers.get('Sec-Fetch-Dest');
  const documento = !dest || dest === 'document';

  const sess = await readSession(request, env);
  if (!sess) return recusa(url, documento, `/entrar/?next=${encodeURIComponent(path)}`);

  const account = await findAccountById(env, sess.uid);
  if (!account || (Number(account.session_version) || 0) !== (Number(sess.sv) || 0)) {
    return recusa(url, documento, `/entrar/?next=${encodeURIComponent(path)}`);
  }

  if (!await hasEntitlement(env, account.id, COURSE)) {
    return recusa(url, documento, `/cursos/${COURSE}/`);
  }

  return null;
}

function recusa(url, documento, to) {
  if (!documento) {
    /* Um sub-recurso recusado não ganha HTML de login no lugar do que pediu:
       ganha um código, e o app decide o que fazer com ele. */
    return new Response(null, { status: 403, headers: { 'Cache-Control': 'no-store' } });
  }
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

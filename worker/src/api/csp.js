/* Os relatos da CSP estrita (auditoria, SEC-003).
 * ─────────────────────────────────────────────────────────────────────────
 * A regra estrita (scripts só por hash, sem `'unsafe-inline'`) ficou em
 * observação (`Report-Only`) de 29/09 a 01/10/2026 e agora vale (ver
 * `blindar` em worker.js e tools/csp-hashes.mjs). O navegador manda para cá
 * o que bloqueou. Relato novo de script do próprio site = algo quebrou.
 *
 * O relato vai para a trilha (`access_log`, ação 'csp-violacao') e sai pela
 * Action "Acesso" → `csp`. Dois freios, porque isto é um endpoint anônimo
 * que escreve no banco: por IP, e um teto geral por hora - uma página com
 * uma violação real gera um relato por visita, e a trilha só precisa de
 * exemplos, não de todos.
 *
 * A resposta é sempre 204: o navegador não faz nada com ela.
 */
import { readJson } from '../lib/http.js';
import { throttled, log } from '../lib/db.js';

const vazio = () => new Response(null, { status: 204 });
const curto = (s, n) => String(s || '').replace(/[\r\n\t]+/g, ' ').slice(0, n);
const limpo = s => s.replace(/[`<>|]/g, '');

export async function relatorio({ request, env }) {
  const b = await readJson(request, 8 * 1024);
  const r = b && b['csp-report'];
  if (!r || typeof r !== 'object') return vazio();

  /* Só o que serve para achar o script: o caminho da página (sem query, que
     pode carregar um token de link), a diretiva, a origem bloqueada e o
     começo do trecho. Nada da pessoa.
     E nada que vire texto livre no resumo PÚBLICO da Action "Acesso": o
     relato é anônimo, então quem quiser escreve o que quiser nele. Uma
     página de outro domínio é descartada; do endereço bloqueado fica só a
     origem; crases e sinais de tag somem. */
  let pagina;
  try {
    const u = new URL(String(r['document-uri'] || ''));
    if (u.hostname !== new URL(request.url).hostname) return vazio();
    pagina = u.pathname;
  } catch { return vazio(); }
  let bloqueado = curto(r['blocked-uri'], 120);
  try { bloqueado = new URL(bloqueado).origin; } catch { bloqueado = bloqueado.replace(/[^a-z-]/gi, '').slice(0, 20); }
  const detalhe = [
    curto(pagina, 200),
    curto(r['effective-directive'] || r['violated-directive'], 40).replace(/[^a-z-]/gi, ''),
    bloqueado,
    curto(r['script-sample'], 80)
  ].map(limpo).join(' | ');
  const ip = (request.headers.get('CF-Connecting-IP') || '').trim() || 'desconhecido';
  if (await throttled(env, `csp:${ip}`, 10)) return vazio();
  if (await throttled(env, 'csp-violacao', 60, 3_600_000)) return vazio();

  await log(env, null, 'csp-violacao', detalhe);
  return vazio();
}

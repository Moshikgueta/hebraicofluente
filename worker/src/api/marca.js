/* De quem é esta cópia? (29/09/2026)
 * ─────────────────────────────────────────────────────────────────────────
 * O painel /admin/marca cola aqui um trecho de uma cópia do curso achada por
 * aí; a resposta diz de qual conta ela saiu (ver lib/marca.js). Só para o
 * dono do curso: a resposta traz o e-mail inteiro do aluno.
 */
import { json, fail, readJson } from '../lib/http.js';
import { exigirAdmin } from '../lib/admin.js';
import { lerMarcas, donosDasMarcas } from '../lib/marca.js';
import { log } from '../lib/db.js';

export async function identificar({ request, env }) {
  const { account, erro } = await exigirAdmin(request, env);
  if (erro) return erro;
  /* Um trecho, não o curso inteiro: 512 KB bastam e cortam o abuso. */
  const b = await readJson(request, 512 * 1024);
  if (!b || typeof b.texto !== 'string') return fail('bad-request');
  const marcas = lerMarcas(b.texto);
  const donos = marcas.length ? await donosDasMarcas(env, marcas) : [];
  await log(env, account.id, 'marca-consultada', marcas.join(',').slice(0, 200));
  return json({ marcas: donos }, 200, { 'Cache-Control': 'no-store' });
}

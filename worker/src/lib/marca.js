/* A marca invisível no conteúdo do curso (29/09/2026).
 * ─────────────────────────────────────────────────────────────────────────
 * Quem pagou recebe o curso inteiro no navegador (api/content.js), e dali
 * pode copiar o que quiser: nenhum site impede isso. O que dá para fazer é
 * saber DE ONDE uma cópia saiu. Cada conta ganha um número aleatório de 8
 * dígitos hexadecimais, e o conteúdo que ela recebe leva esse número escrito
 * em caracteres invisíveis no fim dos textos em português das cartas de
 * cultura e do "Você sabia?" de cada letra. Quem copia e cola o texto leva a
 * marca junto; o painel /admin/marca lê um trecho colado e diz a conta.
 *
 * Só no FIM de textos em português que o aluno apenas lê. Nunca em hebraico,
 * em transliteração ou em nada que o curso compare com uma resposta: um
 * caractere invisível ali faria uma resposta certa dar errado.
 *
 * O número não tem relação com o id nem com o e-mail (vem de
 * crypto.getRandomValues): ele só aponta para a conta por esta tabela, que
 * só o dono lê. Uma conta apagada leva a marca junto (deleteAccount).
 */

/* 0 e 1 em dois caracteres de largura zero, entre dois "word joiners": o
   começo e o fim de cada marca. Nenhum deles aparece na tela, e um leitor de
   tela os ignora. */
const ZERO = '​', UM = '‌', BORDA = '⁠';

export function invisivel(hex) {
  const bits = parseInt(hex, 16).toString(2).padStart(32, '0');
  return BORDA + [...bits].map(b => (b === '1' ? UM : ZERO)).join('') + BORDA;
}

/** As marcas encontradas num texto colado, em hexadecimal, sem repetição.
 *  Aceita também o número VISÍVEL - o da marca d'água das aulas ("cópia
 *  636195AE") ou o do aviso `_licenca` -, para quem só tem um print. */
export function lerMarcas(texto) {
  const achadas = new Set();
  for (const [, hex] of String(texto || '').matchAll(/c[óo]pia\s+([0-9a-f]{8})\b/gi)) {
    achadas.add(hex.toLowerCase());
  }
  const so = String(texto || '').trim();
  if (/^[0-9a-f]{8}$/i.test(so)) achadas.add(so.toLowerCase());
  for (const [, bits] of String(texto || '').matchAll(/⁠([​‌]{32})⁠/g)) {
    const bin = [...bits].map(c => (c === UM ? '1' : '0')).join('');
    achadas.add(parseInt(bin, 2).toString(16).padStart(8, '0'));
  }
  return [...achadas];
}

function sortear() {
  const b = crypto.getRandomValues(new Uint8Array(4));
  return [...b].map(x => x.toString(16).padStart(2, '0')).join('');
}

/** A marca da conta, criada no primeiro pedido. `null` se o banco falhar:
 *  quem pagou recebe o curso mesmo assim, sem marca. */
export async function marcaDaConta(env, accountId) {
  try {
    const achada = await env.DB.prepare('SELECT marca FROM marcas WHERE account_id = ?')
      .bind(accountId).first();
    if (achada) return achada.marca;
    /* Um sorteio repetido (1 em 4 bilhões) bate no UNIQUE; tenta outro. */
    for (let i = 0; i < 3; i++) {
      const m = sortear();
      const r = await env.DB.prepare(
        'INSERT OR IGNORE INTO marcas (account_id, marca, criado_em) VALUES (?, ?, ?)'
      ).bind(accountId, m, Date.now()).run();
      if (r.meta?.changes) return m;
      /* Outra aba desta conta pode ter criado a marca no mesmo instante. */
      const outra = await env.DB.prepare('SELECT marca FROM marcas WHERE account_id = ?')
        .bind(accountId).first();
      if (outra) return outra.marca;
    }
  } catch (e) {
    console.error('marca', e && e.stack || e);
  }
  return null;
}

/** De quem é cada marca: [{marca, accountId, email, criadaEm}]. */
export async function donosDasMarcas(env, marcas) {
  const out = [];
  for (const m of marcas.slice(0, 10)) {
    const row = await env.DB.prepare(
      `SELECT m.marca, m.account_id, m.criado_em, a.email
         FROM marcas m LEFT JOIN accounts a ON a.id = m.account_id
        WHERE m.marca = ?`
    ).bind(m).first();
    out.push(row
      ? { marca: m, accountId: row.account_id, email: row.email || null, criadaEm: row.criado_em }
      : { marca: m, accountId: null, email: null, criadaEm: null });
  }
  return out;
}

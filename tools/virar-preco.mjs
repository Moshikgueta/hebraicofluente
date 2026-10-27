/* A virada do pré-lançamento para o preço oficial, SÓ QUANDO MANDADA.
 * ─────────────────────────────────────────────────────────────────────────
 * Decisão do dono em 23/10/2026: os preços oficiais ficam configurados
 * (`listBrl` em data/courses.json) e NÃO sobem sozinhos. Até essa data a
 * virada era agendada por `preLancamentoAte`; a data saiu do catálogo e da
 * tela junto, porque "até 30/11" sem subida em 30/11 é escassez falsa.
 *
 * O que faz: para cada produto vendável (sem `status: "soon"`) com `listBrl`,
 * o preço passa a ser o `listBrl`, e `listBrl` vira null. Com `--so=`, só os
 * produtos listados. Sem `--aplicar`, só mostra o que mudaria.
 *
 * Mexe só na linha do `price` de cada produto, para não reformatar o arquivo.
 * Rodar duas vezes não faz nada na segunda (o `listBrl` já é null). Quem roda:
 * o workflow `.github/workflows/virar-preco.yml`, à mão (Actions → Virar o
 * preço → Run workflow, escrevendo "virar"), que faz o commit, gera a versão
 * nova dos Termos e dispara a publicação. A página e a cobrança mudam juntas.
 *
 *   node tools/virar-preco.mjs                       mostra o que viraria
 *   node tools/virar-preco.mjs --aplicar             vira todos os vendáveis
 *   node tools/virar-preco.mjs --aplicar --so=alfabetizacao,alfabetizacao-e-israel
 *   node tools/virar-preco.mjs --aplicar --vencidos  só os de data vencida
 *
 * 27/10/2026, decisão do dono: a Alfabetização volta a ter data (até
 * 30/11, oficial R$ 297) e sobe sozinha. O agendamento usa `--vencidos`,
 * que só vira produto COM `preLancamentoAte` já passado.
 */

import { readFileSync, writeFileSync } from 'node:fs';

/** O último instante de um dia `YYYY-MM-DD` em Brasília (UTC-3), em ms. */
export const fimDoDia = dia => Date.parse(`${dia}T23:59:59.999-03:00`);

/** Vira as linhas de preço de um texto de courses.json.
 *  `so`: lista de slugs (vazia = todos os vendáveis).
 *  `vencidos`: só os que têm `preLancamentoAte` e cuja data já passou em
 *  `agora` - é o modo do agendamento (27/10/2026): um produto sem data
 *  nunca vira sozinho. */
export function virar(texto, { so = [], vencidos = false, agora = Date.now() } = {}) {
  const status = new Map(JSON.parse(texto).courses.map(c => [c.slug, c.status]));
  const virados = [];
  const novo = texto.replace(
    /("slug":\s*"([a-z0-9-]+)"[\s\S]*?)("price":\s*)(\{[^{}\n]*\})/g,
    (trecho, antes, slug, prefixo, objeto) => {
      const p = JSON.parse(objeto);
      if (typeof p.listBrl !== 'number' || p.listBrl <= p.brl) return trecho;
      if (status.get(slug) === 'soon') return trecho;
      if (so.length && !so.includes(slug)) return trecho;
      if (vencidos && !(typeof p.preLancamentoAte === 'string' && fimDoDia(p.preLancamentoAte) < agora)) return trecho;
      virados.push({ slug, de: p.brl, para: p.listBrl });
      const { preLancamentoAte, ...resto } = p;
      const depois = { ...resto, brl: p.listBrl, listBrl: null };
      /* A mesma ordem de chaves e o mesmo estilo de uma linha só. */
      const ordem = ['brl', 'listBrl', 'installments', 'pixDiscountPct'];
      const chaves = [...ordem.filter(k => k in depois), ...Object.keys(depois).filter(k => !ordem.includes(k))];
      return antes + prefixo + '{ ' + chaves.map(k => `"${k}": ${JSON.stringify(depois[k])}`).join(', ') + ' }';
    }
  );
  return { texto: novo, virados };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const aplicar = process.argv.includes('--aplicar');
  const arg = process.argv.find(a => a.startsWith('--so='));
  const so = arg ? arg.slice(5).split(',').map(s => s.trim()).filter(Boolean) : [];
  const vencidos = process.argv.includes('--vencidos');
  const arquivo = new URL('../data/courses.json', import.meta.url);
  const { texto, virados } = virar(readFileSync(arquivo, 'utf8'), { so, vencidos });
  if (!virados.length) {
    console.log('Nada a virar: nenhum produto com preço oficial acima do atual.');
  } else {
    for (const v of virados) console.log(`${v.slug}: R$ ${v.de} -> R$ ${v.para}${aplicar ? '' : ' (não aplicado)'}`);
    if (aplicar) {
      JSON.parse(texto); /* nunca grava um JSON quebrado */
      writeFileSync(arquivo, texto);
    } else {
      console.log('Só mostrando. Para aplicar: --aplicar');
    }
  }
}

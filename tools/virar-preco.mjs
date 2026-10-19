/* A virada do pré-lançamento, feita por máquina e não por memória.
 * ─────────────────────────────────────────────────────────────────────────
 * Decisão do dono em 01/10/2026: o preço SOBE de verdade quando o
 * pré-lançamento acaba (auditoria de 01/10/2026, PAY-B-001). Um anúncio de
 * "até 31/10, depois R$ 297" que continua no ar em novembro é publicidade
 * enganosa, e uma subida que depende de alguém lembrar à meia-noite não sobe.
 *
 * O que faz: para cada curso de data/courses.json com `listBrl` E
 * `preLancamentoAte`, se o pré-lançamento já terminou (o fim do dia
 * `preLancamentoAte` no horário de Brasília), o preço passa a ser o
 * `listBrl`, e `listBrl` e `preLancamentoAte` saem. Curso sem data não é
 * tocado: o `listBrl` dele é o preço de depois de um lançamento que ainda não
 * tem dia.
 *
 * Mexe só na linha do `price` de cada curso, para não reformatar o arquivo.
 * Rodar duas vezes não faz nada na segunda. Quem roda: o workflow
 * `.github/workflows/virar-preco.yml`, agendado para 01/12 (era 01/11 até 19/10/2026) às 00:05 de
 * Brasília, que faz o commit e dispara a publicação. A página e a cobrança
 * mudam juntas, na mesma publicação, porque as duas leem este arquivo.
 *
 *   node tools/virar-preco.mjs            vira o que já venceu
 *   node tools/virar-preco.mjs --agora=2026-11-01T03:00:00Z   (para testar)
 */

import { readFileSync, writeFileSync } from 'node:fs';

/** O instante em que o pré-lançamento termina: o fim do dia em Brasília. */
export const fimDoDia = dia => Date.parse(`${dia}T23:59:59.999-03:00`);

/** Vira as linhas de preço vencidas de um texto de courses.json. */
export function virar(texto, agora) {
  const virados = [];
  const novo = texto.replace(
    /("price":\s*)(\{[^{}\n]*"preLancamentoAte"[^{}\n]*\})/g,
    (linha, prefixo, objeto) => {
      const p = JSON.parse(objeto);
      if (p.listBrl == null || !/^\d{4}-\d{2}-\d{2}$/.test(p.preLancamentoAte || '')) return linha;
      if (agora <= fimDoDia(p.preLancamentoAte)) return linha;
      virados.push({ de: p.brl, para: p.listBrl, fim: p.preLancamentoAte });
      const { listBrl, preLancamentoAte, ...resto } = p;
      const depois = { ...resto, brl: listBrl, listBrl: null };
      /* A mesma ordem de chaves e o mesmo estilo de uma linha só. */
      const ordem = ['brl', 'listBrl', 'installments', 'pixDiscountPct'];
      const chaves = [...ordem.filter(k => k in depois), ...Object.keys(depois).filter(k => !ordem.includes(k))];
      return prefixo + '{ ' + chaves.map(k => `"${k}": ${JSON.stringify(depois[k])}`).join(', ') + ' }';
    }
  );
  return { texto: novo, virados };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const arg = process.argv.find(a => a.startsWith('--agora='));
  const agora = arg ? Date.parse(arg.slice(8)) : Date.now();
  const arquivo = new URL('../data/courses.json', import.meta.url);
  const { texto, virados } = virar(readFileSync(arquivo, 'utf8'), agora);
  if (!virados.length) {
    console.log('Nada a virar: nenhum pré-lançamento terminou.');
  } else {
    JSON.parse(texto); /* nunca grava um JSON quebrado */
    writeFileSync(arquivo, texto);
    for (const v of virados) console.log(`Pré-lançamento até ${v.fim} terminou: R$ ${v.de} -> R$ ${v.para}.`);
  }
}

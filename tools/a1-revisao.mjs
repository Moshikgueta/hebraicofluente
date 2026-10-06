/* Gera A1-REVISAO.md: tudo o que o dono precisa revisar no A1, num lugar só.
 *
 *   node tools/a1-revisao.mjs
 *
 * O dono escolheu revisar o hebraico novo todo junto, no fim (06/10/2026).
 * Este arquivo sai dos dados (data/a1/), então nunca fica desatualizado:
 *   · as unidades com `revisado: false`, inteiras;
 *   · nas unidades já aprovadas, só os blocos que entraram depois (situação,
 *     Em Israel, curiosidade, Eu consigo);
 *   · os módulos, os checkpoints, o exame (as perguntas novas) e a trilha de
 *     história.
 * Quando o dono aprova uma unidade, ela vira `revisado: true` e sai daqui. */

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ler = p => JSON.parse(readFileSync(join(ROOT, p), 'utf8'));
const curso = ler('data/a1/curso.json');
const ordem = curso.modulos.flatMap(m => m.unidades);
const uni = n => ler(`data/a1/unidades/u${String(n).padStart(2, '0')}.json`);

const out = [];
const p = s => out.push(s);
const lista = (titulo, itens) => { if (itens?.length) { p(`**${titulo}**`); p(''); for (const i of itens) p(`- ${i}`); p(''); } };

function item(it, k) {
  const certa = i => (it.certa === i ? `**${it.opcoes[i]}**` : it.opcoes[i]);
  const ops = it.opcoes ? it.opcoes.map((_, i) => certa(i)).join(' / ') : '';
  const extra = [it.porque && `(${it.porque})`, it.dicas && Object.entries(it.dicas).map(([i, d]) => `se escolher "${it.opcoes[i]}": ${d}`).join(' · ')].filter(Boolean).join(' ');
  switch (it.t) {
    case 'escolha': case 'intruso': case 'ouvir':
      return `${k}. ${it.t}: ${it.he ? `[ouve: ${it.he}] ` : ''}${it.q} → ${ops} ${extra}`;
    case 'dialogo':
      return `${k}. conversa: ${it.linhas.map(([q, l]) => `${q}: ${l}`).join(' / ')} → ${ops} ${extra}`;
    case 'vf': return `${k}. V ou F: ${it.q} → **${it.certa ? 'Verdadeiro' : 'Falso'}** ${extra}`;
    case 'ligar': return `${k}. ligar: ${it.pares.map(([a, b]) => `${a} = ${b}`).join(' · ')}`;
    case 'separar': return `${k}. separar (${it.baldes.join(' / ')}): ${it.itens.map(([w, b]) => `${w} → ${it.baldes[b]}`).join(' · ')}`;
    case 'montar': return `${k}. montar: "${it.pt}" → **${it.palavras.join(' ')}**`;
    case 'ordenar': return `${k}. ordenar: ${it.falas.map((f, i) => `${i + 1}) ${f}`).join(' ')}`;
    case 'completar': return `${k}. completar: ${it.q}: ${it.antes} ___ ${it.depois} → **${it.respostas.join(' / ')}**`;
    case 'erro': return `${k}. achar o erro: ${it.q} ${it.errada} → **${it.respostas.join(' / ')}** ${extra}`;
    case 'escrever': return `${k}. escrever: "${it.pt}" → **${it.respostas.join(' / ')}**`;
    case 'ditado': return `${k}. ditado: ${it.he} → **${it.respostas.join(' / ')}**`;
    case 'tabela': return `${k}. tabela ${it.base}: ${it.linhas.map(([a, b]) => `${a} → ${b}`).join(' · ')}`;
    case 'aberta': return `${k}. escrita livre: ${it.pt} (exemplo: ${it.exemplo})`;
    default: return `${k}. ${it.t}`;
  }
}

function caixas(u) {
  if (u.situacaoPt) { p(`**A situação:** ${u.situacaoPt}`); p(''); }
  for (const c of u.cultura ?? []) { p(`**Em Israel · ${c.tituloPt}:** ${c.textoPt}`); p(''); }
  for (const c of u.sabia ?? []) { p(`**Curiosidade · ${c.tituloPt}:** ${c.textoPt}`); p(''); }
  lista('Eu consigo…', u.autoavaliacao);
}

p('# Hebraico A1: o que falta revisar');
p('');
p('Gerado por `node tools/a1-revisao.mjs` a partir de data/a1/. Não edite à mão: corrija nos dados e gere de novo.');
p('');
p('Como revisar: marque o que mudar (ou escreva a correção ao lado) e me mande. Uma unidade aprovada vira `revisado: true` e sai daqui.');
p('');

p('## Módulos e checkpoints');
p('');
for (const m of curso.modulos) p(`- Módulo ${m.n}, **${m.tituloPt}**: ${m.objetivoPt} (unidades ${m.unidades.join(', ')})`);
for (const c of curso.checkpoints ?? []) p(`- ${c.tituloPt} (depois do módulo ${c.depoisDoModulo}; unidades ${c.unidades.join(', ')})`);
p('');

const novas = ordem.filter(n => !uni(n).revisado);
const antigas = ordem.filter(n => uni(n).revisado);

p('## Unidades novas (inteiras)');
p('');
for (const n of novas) {
  const u = uni(n);
  p(`### Unidade ${n}: ${u.tituloPt}`);
  p('');
  p(`**Objetivo:** ${u.objetivoPt}`);
  p('');
  if (u.notaPt) { p(`**Nota:** ${u.notaPt}`); p(''); }
  caixas(u);
  lista('Palavras', u.palavras.map(w => (w.formas ? `${w.formas.join(' · ')} = ${w.pt}` : `${w.he} (${w.translit}) = ${w.pt}`)));
  p('**Gramática**');
  p('');
  u.gramatica.forEach((g, i) => {
    p(`${i + 1}. **${g.tituloPt}.** ${g.textoPt}`);
    if (g.erroPt) p(`   - Erro comum: ${g.erroPt}`);
    for (const e of g.exemplos ?? []) p(`   - Exemplo: ${e.he} = ${e.pt}`);
  });
  p('');
  p(`**Diálogo: ${u.dialogo.tituloPt}**`);
  p('');
  for (const l of u.dialogo.linhas) p(`- ${l.quem}: ${l.he} (${l.translit}) = ${l.pt}`);
  for (const g of u.dialogo.glossario ?? []) p(`- glossário: ${g.he} (${g.translit}) = ${g.pt}`);
  if (u.dialogo.notaPt) p(`- nota: ${u.dialogo.notaPt}`);
  p('');
  if (u.leitura) {
    p(`**Leitura: ${u.leitura.tituloPt}**${u.leitura.semPontos ? ' (aparece sem nikud, com a chave para mostrar)' : ''}`);
    p('');
    for (const l of u.leitura.linhas) p(`- ${l.he} (${l.translit}) = ${l.pt}`);
    u.leitura.perguntas.forEach((it, i) => p(`- ${item(it, `P${i + 1}`)}`));
    p('');
  }
  p('**Exercícios**');
  p('');
  u.exercicios.forEach((it, i) => p(item(it, i + 1)));
  p('');
}

p('## Unidades já aprovadas: só os blocos novos');
p('');
for (const n of antigas) {
  const u = uni(n);
  p(`### Unidade ${n}: ${u.tituloPt}`);
  p('');
  caixas(u);
}

const ex = ler('data/a1/exame.json');
p('## O exame final (reorganizado em 6 habilidades)');
p('');
p(`${ex.sorteio} perguntas sorteadas por parte, aprovação com ${ex.aprovacao * 100}%. As perguntas que já existiam continuam, nas partes novas.`);
p('');
for (const parte of ex.partes) {
  p(`### ${parte.tituloPt} (unidades ${parte.unidades.join(', ')})`);
  p('');
  if (parte.texto) { p(`Texto: ${parte.texto.he} = ${parte.texto.pt}`); p(''); }
  parte.itens.forEach((it, i) => p(item(it, i + 1)));
  p('');
}

const h = ler('data/a1/historia.json');
p('## A história do hebraico (bônus)');
p('');
for (const c of h.capitulos) p(`${c.n}. **${c.tituloPt}** (${c.epocaPt}; sugerido depois da Unidade ${c.depoisDaUnidade}): ${c.textoPt}`);
p('');

p('## Textos novos de tela (português)');
p('');
p(readFileSync(join(ROOT, 'tools/a1-revisao-telas.md'), 'utf8').trim());
p('');

writeFileSync(join(ROOT, 'A1-REVISAO.md'), out.join('\n'));
console.log(`A1-REVISAO.md: ${novas.length} unidades novas, ${antigas.length} com blocos novos.`);

#!/usr/bin/env node
/* Validador editorial. Cruza o manuscrito com os registros de afirmação e de
   fonte e cobra o PROTOCOLO.md do livro.

   Uso: node tools/validar.mjs <livro> [--estrito]

   Sai com código 1 se houver ERRO (com --estrito, também com AVISO).
   Escreve <livro>/auditoria/validacao.md (o relatório) e
   <livro>/auditoria/hebraico.md (todo hebraico do livro, para a aprovação
   do autor).

   O que ele NÃO faz, e o relatório diz: abrir os links (a rede deste
   ambiente não deixa) e julgar se uma fonte sustenta a afirmação. Isso é
   trabalho de gente. O validador só garante que a trilha existe e que as
   regras mecânicas foram seguidas. */

import fs from 'node:fs';
import path from 'node:path';

const AQUI = path.dirname(new URL(import.meta.url).pathname);
const EDITORIAL = path.resolve(AQUI, '..');
const args = process.argv.slice(2);
const livro = args.find(a => !a.startsWith('--')) || 'israel-alem-do-roteiro';
const ESTRITO = args.includes('--estrito');
const RAIZ = path.join(EDITORIAL, livro);
const HOJE = new Date().toISOString().slice(0, 10);
const lerJSON = p => JSON.parse(fs.readFileSync(p, 'utf8'));
const rel = p => path.relative(EDITORIAL, p);

const erros = [], avisos = [], info = [];
const erro = (m) => erros.push(m), aviso = (m) => avisos.push(m);

/* 1. Travessão e meia-risca em qualquer arquivo de texto da pasta editorial. */
const TRAVESSAO = new RegExp('[' + String.fromCharCode(0x2014, 0x2013) + ']|\\\\u201[34]');
function andar(dir, f) {
  for (const n of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', 'saida', '.git'].includes(n.name)) continue;
    const p = path.join(dir, n.name);
    if (n.isDirectory()) andar(p, f); else f(p);
  }
}
andar(EDITORIAL, p => {
  if (!/\.(md|json|mjs|js|css|html|svg|txt)$/.test(p)) return;
  const linhas = fs.readFileSync(p, 'utf8').split('\n');
  linhas.forEach((l, i) => { if (TRAVESSAO.test(l)) erro(`travessão ou meia-risca em ${rel(p)}:${i + 1}`); });
});

/* 2. Registros. */
const fontes = new Map(), afirmacoes = new Map();
const pasta = d => fs.existsSync(path.join(RAIZ, d)) ? fs.readdirSync(path.join(RAIZ, d)).filter(f => f.endsWith('.json')).sort() : [];
for (const f of pasta('fontes')) {
  let j; try { j = lerJSON(path.join(RAIZ, 'fontes', f)); } catch (e) { erro(`JSON inválido: fontes/${f} (${e.message})`); continue; }
  for (const x of j.fontes || []) {
    if (fontes.has(x.id)) erro(`fonte com id repetido: ${x.id} (fontes/${f})`);
    fontes.set(x.id, { ...x, _arq: f });
  }
}
for (const f of pasta('afirmacoes')) {
  let j; try { j = lerJSON(path.join(RAIZ, 'afirmacoes', f)); } catch (e) { erro(`JSON inválido: afirmacoes/${f} (${e.message})`); continue; }
  for (const x of j.afirmacoes || []) {
    if (afirmacoes.has(x.id)) erro(`afirmação com id repetido: ${x.id} (afirmacoes/${f})`);
    afirmacoes.set(x.id, { ...x, _arq: f });
  }
}

const STATUS = ['VERIFICADO', 'PARCIALMENTE VERIFICADO', 'CONTESTADO', 'NÃO VERIFICADO', 'DESATUALIZADO'];
const NIVEIS = ['A', 'B', 'C', 'D', 'E'];
const ACESSOS = ['trecho-de-busca', 'referencia-confirmada', 'texto-integral'];

for (const [id, f] of fontes) {
  const onde = `fonte ${id} (fontes/${f._arq})`;
  if (!NIVEIS.includes(f.nivel)) erro(`${onde}: nível "${f.nivel}" fora de A-E`);
  if (!f.titulo) erro(`${onde}: sem título`);
  if (!f.abnt) erro(`${onde}: sem referência ABNT`);
  if (!f.url && !(f.autor && f.ano && f.editora_ou_periodico)) erro(`${onde}: sem URL e sem autor+ano+editora (referência incompleta)`);
  if (f.url && !/^https?:\/\/[^\s]+\.[^\s]+/.test(f.url)) erro(`${onde}: URL malformada "${f.url}"`);
  if (!f.data_consulta) aviso(`${onde}: sem data de consulta`);
  if (!ACESSOS.includes(f.acesso)) aviso(`${onde}: acesso "${f.acesso}" fora de ${ACESSOS.join('/')}`);
  if (f.doi && !/^10\.\d{4,9}\/\S+$/.test(f.doi)) erro(`${onde}: DOI malformado "${f.doi}"`);
  if (f.isbn && !/^(97[89])?[\d-]{9,17}[\dX]$/.test(String(f.isbn).replace(/\s/g, ''))) erro(`${onde}: ISBN malformado "${f.isbn}"`);
  if (f.url && /wikipedia\.org/.test(f.url)) erro(`${onde}: Wikipedia não é fonte de comprovação`);
}

const usadas = new Set();
for (const [id, a] of afirmacoes) {
  const onde = `afirmação ${id} (afirmacoes/${a._arq})`;
  if (!STATUS.includes(a.status)) erro(`${onde}: status "${a.status}" inválido`);
  if (!a.afirmacao) erro(`${onde}: sem texto da afirmação`);
  const fs2 = (a.fontes || []).map(x => fontes.get(x));
  (a.fontes || []).forEach((x, k) => { if (!fs2[k]) erro(`${onde}: aponta fonte inexistente ${x}`); });
  if (a.status === 'VERIFICADO') {
    if (!fs2.filter(Boolean).length) erro(`${onde}: VERIFICADO sem fonte`);
    const fortes = fs2.filter(f => f && f.acesso !== 'referencia-confirmada');
    if (fs2.filter(Boolean).length && !fortes.length) erro(`${onde}: VERIFICADO apoiado só em referencia-confirmada`);
    const naoE = fortes.filter(f => f.nivel !== 'E');
    if (fortes.length && !naoE.length && fortes.length < 2) aviso(`${onde}: VERIFICADO com uma única fonte de nível E`);
    if (!a.evidencia) aviso(`${onde}: VERIFICADO sem a evidência anotada`);
  }
  if (a.status === 'CONTESTADO' && !a.interpretacoes_concorrentes) erro(`${onde}: CONTESTADO sem interpretações concorrentes`);
  if (['pratica', 'estatistica'].includes(a.categoria)) {
    if (!a.revisar_ate) erro(`${onde}: categoria ${a.categoria} sem revisar_ate`);
    else if (a.revisar_ate < HOJE) erro(`${onde}: revisão vencida em ${a.revisar_ate}`);
  }
}

/* 3. Manuscrito. */
const man = path.join(RAIZ, 'manuscrito');
const meta = lerJSON(path.join(RAIZ, 'livro.json'));
const ordem = [...meta.pre, ...meta.capitulos, ...meta.pos].map(x => x.arquivo);
const hebraico = [];
const PROIBIDAS = [/os israelenses sempre/i, /todo israelense/i, /em israel ningu[eé]m/i, /ningu[eé]m em israel/i, /todos os israelenses/i];
const CLICHES = [/rica tape[cç]aria/i, /fascinante mosaico/i, /neste cap[ií]tulo (veremos|vamos ver)/i, /[eé] importante ressaltar/i, /terra de contrastes/i, /ber[cç]o d[aeo]s? civiliza/i];
const registroAtivos = fs.existsSync(path.join(RAIZ, 'ativos/registro-de-ativos.json')) ? lerJSON(path.join(RAIZ, 'ativos/registro-de-ativos.json')).ativos : [];
let palavras = 0; const porArquivo = [];
for (const arq of ordem) {
  const p = path.join(man, arq);
  if (!fs.existsSync(p)) { aviso(`manuscrito ausente: manuscrito/${arq}`); continue; }
  /* Comentário HTML some (figura pendente, nota de revisão), mas as linhas
     ficam no lugar para o número de linha do relatório continuar certo. */
  const texto = fs.readFileSync(p, 'utf8').replace(/<!--[\s\S]*?-->/g, m => m.replace(/[^\n]/g, ''));
  const linhas = texto.split('\n');
  const semMarcas = texto.replace(/^---[\s\S]*?---/, '').replace(/\[\[[^\]]+\]\]/g, '').replace(/<[^>]+>/g, '');
  const n = (semMarcas.match(/[A-Za-zÀ-ÿ]+/g) || []).length; palavras += n;
  let marcas = 0;
  linhas.forEach((l, i) => {
    const onde = `manuscrito/${arq}:${i + 1}`;
    for (const m of l.matchAll(/\[\[([^\]]+)\]\]/g)) {
      for (const id of m[1].split(',').map(s => s.trim())) {
        marcas++; usadas.add(id);
        const a = afirmacoes.get(id);
        if (!a) erro(`${onde}: marca ${id} sem registro`);
        else if (!['VERIFICADO', 'CONTESTADO'].includes(a.status)) erro(`${onde}: marca ${id} com status ${a.status} não pode ir ao texto`);
      }
    }
    for (const m of l.matchAll(/<he>(.*?)<\/he>/g)) {
      if (/[.,;:!?)("]$|^[.,;:!?)(]/.test(m[1].trim())) erro(`${onde}: pontuação dentro de <he>: "${m[1]}"`);
      hebraico.push({ he: m[1], onde, contexto: l.replace(/\[\[[^\]]+\]\]/g, '').trim().slice(0, 160) });
    }
    if (/^\s*-\s+<he>.*\|/.test(l)) {
      const [h, tr, pt] = l.replace(/^\s*-\s+/, '').split('|').map(s => s.trim());
      const prim = hebraico.find(h => h.onde === onde);
      if (prim) Object.assign(prim, { translit: tr, pt });
    }
    if (/[֐-׿]/.test(l.replace(/<he>.*?<\/he>/g, '')) && !/titulo_he/.test(l)) aviso(`${onde}: hebraico fora de <he>`);
    for (const r of PROIBIDAS) if (r.test(l)) erro(`${onde}: generalização proibida (${r.source})`);
    for (const r of CLICHES) if (r.test(l)) aviso(`${onde}: clichê (${r.source})`);
    const fig = l.match(/^:::\s*figura\s+([\w-]+)/);
    if (fig) {
      const id = fig[1];
      if (!['ativos/mapas', 'ativos/infograficos'].some(d => fs.existsSync(path.join(RAIZ, d, id + '.svg')))) erro(`${onde}: figura ${id} não gerada`);
      if (!registroAtivos.find(a => a.id === id)) erro(`${onde}: figura ${id} fora do registro de ativos`);
    }
    if (/^:::\s*olhar-israelense/.test(l) && !/aprovado/.test(l)) aviso(`${onde}: caixa "O olhar de um israelense" pendente de aprovação do autor`);
  });
  porArquivo.push({ arq, palavras: n, marcas });
}

/* 4. Ativos. */
for (const a of registroAtivos) {
  if (!a.licenca) erro(`ativo ${a.id}: sem licença registrada`);
  if (!a.fonte_dados && a.tipo !== 'arte-original') erro(`ativo ${a.id}: sem fonte dos dados`);
}

/* 5. Consistência da transliteração: o mesmo hebraico (sem nikud) com duas grafias. */
const semNikud = s => s.normalize('NFD').replace(/[֑-ׇ]/g, '');
const porForma = new Map();
for (const h of hebraico) if (h.translit) {
  const k = semNikud(h.he); if (!porForma.has(k)) porForma.set(k, new Set()); porForma.get(k).add(h.translit.toLowerCase());
}
for (const [k, s] of porForma) if (s.size > 1) aviso(`transliterações diferentes para ${k}: ${[...s].join(' / ')}`);

/* 6. Contagens. */
const contagem = {}; for (const a of afirmacoes.values()) contagem[a.status] = (contagem[a.status] || 0) + 1;
const verificadasSemUso = [...afirmacoes.values()].filter(a => a.status === 'VERIFICADO' && !usadas.has(a.id)).length;
const acessos = {}; for (const f of fontes.values()) acessos[f.acesso] = (acessos[f.acesso] || 0) + 1;
const niveis = {}; for (const f of fontes.values()) niveis[f.nivel] = (niveis[f.nivel] || 0) + 1;

/* ── relatórios ──────────────────────────────────────────────────────── */
fs.mkdirSync(path.join(RAIZ, 'auditoria'), { recursive: true });
const rep = [
  `# Relatório do validador`, '',
  `Gerado por \`tools/validar.mjs\` em ${HOJE}. Este relatório confere a trilha (manuscrito → afirmação → fonte) e as regras mecânicas do PROTOCOLO. Ele não julga se a fonte sustenta a afirmação, e não abriu nenhum link: a rede deste ambiente bloqueia o acesso direto às páginas. Os dois trabalhos são da revisão humana.`, '',
  `## Números`, '',
  `- Palavras no manuscrito: ${palavras}`,
  `- Fontes registradas: ${fontes.size} (por nível: ${Object.entries(niveis).map(([k, v]) => `${k} ${v}`).join(', ')}; por acesso: ${Object.entries(acessos).map(([k, v]) => `${k} ${v}`).join(', ')})`,
  `- Afirmações registradas: ${afirmacoes.size} (${Object.entries(contagem).map(([k, v]) => `${k} ${v}`).join(', ')})`,
  `- Afirmações VERIFICADO sem uso no texto: ${verificadasSemUso}`,
  `- Ocorrências de hebraico: ${hebraico.length} (lista em auditoria/hebraico.md)`,
  `- Links testados: 0 de ${[...fontes.values()].filter(f => f.url).length} (rede bloqueada; ver revisão humana)`, '',
  `| Arquivo | Palavras | Marcas de fonte |`, `| --- | --- | --- |`,
  ...porArquivo.map(x => `| ${x.arq} | ${x.palavras} | ${x.marcas} |`), '',
  `## Erros (${erros.length})`, '', ...(erros.length ? erros.map(e => `- ${e}`) : ['Nenhum.']), '',
  `## Avisos (${avisos.length})`, '', ...(avisos.length ? avisos.map(e => `- ${e}`) : ['Nenhum.']), '',
];
fs.writeFileSync(path.join(RAIZ, 'auditoria/validacao.md'), rep.join('\n'));

const heRep = [
  '# Hebraico do livro, para aprovação do autor', '',
  'Regra do repositório: hebraico escrito com ajuda de IA só vai ao ar com a aprovação do dono. Esta lista é gerada pelo validador a partir do manuscrito; cada linha é uma ocorrência. Marque as que estão certas e corrija as que não estão no próprio manuscrito. Depois de conferir tudo, registre a aprovação em `revisao/aprovacoes.json` (campo `hebraico`).', '',
  '| # | Hebraico | Transliteração | Tradução | Onde | Contexto |', '| --- | --- | --- | --- | --- | --- |',
  ...hebraico.map((h, i) => `| ${i + 1} | ${h.he} | ${h.translit || ''} | ${h.pt || ''} | ${h.onde} | ${h.translit ? '' : h.contexto.replace(/\|/g, '/')} |`),
];
fs.writeFileSync(path.join(RAIZ, 'auditoria/hebraico.md'), heRep.join('\n') + '\n');

/* Bibliografia de trabalho: todas as fontes registradas, por nível, com
   quantas afirmações cada uma sustenta e quantas delas estão no texto. */
const usoFonte = new Map();
for (const a of afirmacoes.values()) for (const fid of a.fontes || []) {
  const u = usoFonte.get(fid) || { total: 0, noTexto: 0 }; u.total++; if (usadas.has(a.id)) u.noTexto++; usoFonte.set(fid, u);
}
const NOME_NIVEL = { A: 'A. Literatura acadêmica', B: 'B. Instituições científicas e culturais', C: 'C. Fontes primárias', D: 'D. Fontes oficiais', E: 'E. Fontes complementares' };
const bib = ['# Bibliografia de trabalho', '', `Gerada por \`tools/validar.mjs\` em ${HOJE}. Todas as fontes registradas, inclusive as que não sustentam nada no texto. Entre parênteses: afirmações sustentadas (no texto / no total) e o modo de acesso. A bibliografia do livro sai só das fontes usadas no texto.`, ''];
for (const [n, nome] of Object.entries(NOME_NIVEL)) {
  const g = [...fontes.values()].filter(f => f.nivel === n).sort((a, b) => (a.abnt || '').localeCompare(b.abnt || '', 'pt'));
  if (!g.length) continue;
  bib.push(`## ${nome} (${g.length})`, '');
  for (const f of g) { const u = usoFonte.get(f.id) || { total: 0, noTexto: 0 }; bib.push(`- ${f.abnt} (${f.id}; ${u.noTexto}/${u.total}; ${f.acesso})`); }
  bib.push('');
}
fs.mkdirSync(path.join(RAIZ, 'pesquisa'), { recursive: true });
fs.writeFileSync(path.join(RAIZ, 'pesquisa/bibliografia-de-trabalho.md'), bib.join('\n'));

console.log(`palavras ${palavras} · fontes ${fontes.size} · afirmações ${afirmacoes.size} ${JSON.stringify(contagem)} · hebraico ${hebraico.length}`);
console.log(`erros ${erros.length} · avisos ${avisos.length} → ${rel(path.join(RAIZ, 'auditoria/validacao.md'))}`);
for (const e of erros.slice(0, 25)) console.log('  ERRO ' + e);
if (erros.length > 25) console.log(`  ... e mais ${erros.length - 25}`);
process.exit(erros.length || (ESTRITO && avisos.length) ? 1 : 0);

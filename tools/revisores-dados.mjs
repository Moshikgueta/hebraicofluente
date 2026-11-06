/* revisores-dados.mjs - o texto em inglês que vai para os revisores
 * ─────────────────────────────────────────────────────────────────────────
 * Junta, num JSON só, tudo o que tools/revisores.py põe nas planilhas:
 *
 *   telas      os dicionários de app/src/i18n/telas (o texto fixo das telas),
 *              cada chave com o português e o inglês;
 *   conteudo   data/en/<arquivo>.json (o conteúdo do curso);
 *   translit   cada transliteração do curso, com o hebraico, a grafia
 *              brasileira e a do inglês (tools/translit-en.mjs);
 *   marcas     as notas "etapa N: ..." escritas acima de uma chave de tela.
 *
 * Texto que é FUNÇÃO (com número ou nome dentro) é chamado com o nome de cada
 * parâmetro entre chaves: `(n, total) => \`Round ${n} of ${total}\`` vira
 * "Round {n} of {total}", que é como o revisor o lê. JSX vira texto pelo
 * renderizador do React. O que não dá para chamar sai com o código-fonte
 * (`cru`), e a importação nunca o aplica sozinha.
 *
 * Uso (da raiz): node tools/revisores-dados.mjs <saida.json>
 */

import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { ARQUIVOS } from './i18n.mjs';
import { translitEn } from './translit-en.mjs';

const RAIZ = new URL('..', import.meta.url).pathname;
const APP = join(RAIZ, 'app');
const TELAS = join(APP, 'src/i18n/telas');
const exigir = createRequire(join(APP, 'package.json'));
const { createJiti } = exigir('jiti');
const React = exigir('react');
const { renderToStaticMarkup } = exigir('react-dom/server');
globalThis.React = React;
const jiti = createJiti(join(APP, 'package.json'), { jsx: true, alias: { '@': join(APP, 'src') } });

/** Os nomes dos parâmetros de uma função, na ordem. */
function parametros(fn) {
  const src = fn.toString();
  const m = src.match(/^(?:async\s*)?(?:function[^(]*)?\(([^)]*)\)/) || src.match(/^([A-Za-z_$][\w$]*)\s*=>/);
  if (!m) return [];
  return m[1].split(',').map(p => p.replace(/[=:].*$/s, '').replace(/[{}\s]/g, '').trim()).filter(Boolean);
}

const textoDe = v => {
  if (typeof v === 'string') return v;
  if (v && typeof v === 'object') {
    try {
      return renderToStaticMarkup(v).replace(/<[^>]+>/g, '').replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&');
    } catch { return null; }
  }
  return null;
};

/** Um valor do dicionário como o revisor o lê. */
function ler(v) {
  if (typeof v === 'string') return { texto: v, fn: false, cru: false };
  if (typeof v === 'function') {
    try {
      const t = textoDe(v(...parametros(v).map(p => `{${p}}`)));
      if (t != null) return { texto: t, fn: true, cru: false };
    } catch { /* cai no código-fonte */ }
    return { texto: v.toString(), fn: true, cru: true };
  }
  const t = textoDe(v);
  return t == null ? null : { texto: t, fn: false, cru: false };
}

/* A variação de número (1 erro / 2 erros) mora no código da função. */
const variantes = fn => typeof fn === 'function' && /===\s*1\b|!==\s*1\b|>\s*1\b|plural/.test(fn.toString());

/* As notas "// etapa N: ..." logo acima de uma chave, no bloco do português. */
function marcasDe(src) {
  const out = {};
  const linhas = src.split('\n');
  for (let i = 0; i < linhas.length; i++) {
    const m = linhas[i].match(/^\s*\/\/\s*(etapa\s+[\d/]+:.*)$/);
    if (!m) continue;
    for (let j = i + 1; j < linhas.length; j++) {
      const k = linhas[j].match(/^\s*([A-Za-z_$][\w$]*)\s*:/);
      if (k) { out[k[1]] = m[1].trim(); break; }
      if (!/^\s*\/\//.test(linhas[j])) break;
    }
  }
  return out;
}

const telas = {};
const marcas = {};
for (const arq of readdirSync(TELAS).filter(f => /\.tsx?$/.test(f)).sort()) {
  const nome = arq.replace(/\.tsx?$/, '');
  const mod = await jiti.import(join(TELAS, arq));
  const d = mod.DICIONARIO;
  if (!d || !d.pt || !d.en) continue;
  telas[nome] = {};
  for (const [k, pt] of Object.entries(d.pt)) {
    const lp = ler(pt);
    const le = ler(d.en[k]);
    if (!lp || !le) continue;
    telas[nome][k] = { pt: lp.texto, en: le.texto, fn: lp.fn || le.fn, cru: lp.cru || le.cru, variantes: variantes(d.en[k]) };
  }
  for (const [k, nota] of Object.entries(marcasDe(readFileSync(join(TELAS, arq), 'utf8')))) marcas[`${nome}:${k}`] = nota;
}

const conteudo = {};
for (const a of ARQUIVOS) {
  try { conteudo[a] = JSON.parse(readFileSync(join(RAIZ, 'data/en', `${a}.json`), 'utf8')); } catch { conteudo[a] = {}; }
}

/* Uma linha por par (hebraico, transliteração): a mesma palavra aparece em
   várias lições, e o revisor não precisa lê-la oito vezes. */
const HE = /[א-ת]/;
const vistos = new Map();
function andar(o, arq, caminho) {
  if (Array.isArray(o)) return o.forEach((x, i) => andar(x, arq, `${caminho}/${i}`));
  if (!o || typeof o !== 'object') return;
  const he = Object.values(o).find(v => typeof v === 'string' && HE.test(v));
  for (const [k, v] of Object.entries(o)) {
    if (k.startsWith('translit') && typeof v === 'string' && v.trim()) {
      const chave = `${he ?? ''}|${v}`;
      if (!vistos.has(chave)) vistos.set(chave, { arquivo: arq, caminho: `${caminho}/${k}`, he: he ?? '', pt: v, en: translitEn(v) });
    } else andar(v, arq, `${caminho}/${k}`);
  }
}
for (const a of ARQUIVOS) andar(JSON.parse(readFileSync(join(RAIZ, 'data', `${a}.json`), 'utf8')), a, '');

const saida = process.argv[2];
if (!saida) { console.error('Uso: node tools/revisores-dados.mjs <saida.json>'); process.exit(1); }
writeFileSync(saida, JSON.stringify({ telas, conteudo, translit: [...vistos.values()], marcas }));
console.log(`${Object.keys(telas).length} telas, ${Object.values(conteudo).reduce((n, c) => n + Object.keys(c).length, 0)} textos do curso, ${vistos.size} transliterações.`);

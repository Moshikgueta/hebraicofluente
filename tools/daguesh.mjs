/* O daguesh só onde ele muda o som (12/10/2026, decisão do dono do curso).
 * ─────────────────────────────────────────────────────────────────────────
 * No hebraico falado hoje, o ponto dentro da letra só muda a pronúncia em
 * três letras: בּ/ב, כּ/כ, פּ/פ (e nas finais ך/ף). Em todas as outras
 * (אִמָּא, תּוֹדָה, הַיּוֹם, גְּלִידָה) ele não muda nada que se ouça, e para quem
 * está aprendendo a ler ele só atrapalha: o aluno passa a procurar um som
 * que não existe. Então o curso escreve o daguesh SÓ nas três.
 *
 * O que fica, porque não é daguesh de pronúncia que some:
 *   · o shuruk, וּ: o ponto dentro do ו sem outra vogal É a vogal U;
 *   (o mapik, o ponto no ה do fim de לָהּ, também sai: decisão do dono do
 *   curso, porque no hebraico falado hoje ele também não muda o som);
 *   · a letra sozinha, sem vogal, que uma explicação mostra de propósito
 *     ("você vai encontrar תּ com um pontinho dentro"): ali o ponto é o assunto;
 *   · os textos bíblicos (data/biblia.json, data/bonus.json): a pontuação
 *     deles é a tradicional, e não é do curso mexer nela.
 *
 * `semDagueshInutil` é a regra; `node tools/daguesh.mjs --aplicar` a aplica
 * aos dados, e a V24 do validate.js recusa um daguesh novo fora dela.
 */

import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const DAGUESH = 'ּ';
const VOGAL = /[ְ-ׇֻ]/;
const LETRA = /[א-ת]/;
const COM_SOM = new Set(['ב', 'כ', 'ך', 'פ', 'ף']);

/** Os arquivos cuja pontuação não é do curso. */
export const FORA = ['data/biblia.json', 'data/bonus.json', 'data/audio.json', 'data/audio-alias.json'];

/** Um daguesh que este cluster pode perder? */
function inutil(cluster) {
  if (!cluster.includes(DAGUESH)) return false;
  const base = cluster[0];
  if (COM_SOM.has(base)) return false;
  const marcas = cluster.slice(1);
  if (base === 'ו' && !VOGAL.test(marcas)) return false;   // shuruk
  return true;
}

/** Uma palavra hebraica (letras e sinais), sem o daguesh que não muda o som. */
function palavraSemDaguesh(palavra) {
  const cl = [];
  for (const ch of palavra) {
    if (LETRA.test(ch) || !cl.length) cl.push(ch);
    else cl[cl.length - 1] += ch;
  }
  /* A letra sozinha e sem vogal é demonstração: fica como está. */
  if (cl.length === 1 && !VOGAL.test(cl[0].slice(1))) return palavra;
  return cl.map((c, i) => (inutil(c) ? c.replace(DAGUESH, '') : c)).join('');
}

/** Todo trecho em hebraico de um texto qualquer, palavra por palavra. */
export function semDagueshInutil(texto) {
  return String(texto).normalize('NFC')
    .replace(/[א-ת][֑-ׇא-ת]*/g, palavraSemDaguesh)
    .normalize('NFC');
}

/** Os daguesh que sobrariam fora da regra, para a V24 do validate.js. */
export function dagueshFora(texto) {
  const t = String(texto).normalize('NFC');
  return semDagueshInutil(t) === t ? [] : [...t.matchAll(/[א-ת][֑-ׇא-ת]*/g)]
    .map(m => m[0]).filter(p => palavraSemDaguesh(p) !== p);
}

/* ── aplicar ───────────────────────────────────────────────────────────── */

function arquivos(ROOT) {
  const out = [];
  const andar = d => {
    for (const f of readdirSync(d)) {
      const p = join(d, f);
      if (statSync(p).isDirectory()) andar(p);
      else if (p.endsWith('.json')) out.push(p);
    }
  };
  andar(join(ROOT, 'data'));
  return out.filter(p => !FORA.includes(relative(ROOT, p)));
}

if (process.argv[1] && process.argv[1].endsWith('daguesh.mjs')) {
  const ROOT = new URL('..', import.meta.url).pathname;
  const aplicar = process.argv.includes('--aplicar');

  /* O áudio primeiro: o nome do arquivo de uma gravação é o hash do texto
     pontuado. Tirar um ponto muda o hash, e a gravação ficaria órfã. O
     apelido guarda, para cada texto novo, o id antigo - a mesma gravação
     continua tocando, sem regravar nada. */
  const catalogo = JSON.parse(readFileSync(join(ROOT, 'data/audio.json'), 'utf8')).clips;
  const aliasArq = join(ROOT, 'data/audio-alias.json');
  let alias = {};
  try { alias = JSON.parse(readFileSync(aliasArq, 'utf8')).alias ?? {}; } catch { /* primeira vez */ }
  const existentes = new Map(catalogo.map(c => [c.he.normalize('NFC'), c.file.replace(/\.mp3$/, '')]));
  let novos = 0; const conflitos = [];
  for (const c of catalogo) {
    const de = c.he.normalize('NFC');
    const para = semDagueshInutil(de);
    if (para === de) continue;
    const id = c.file.replace(/\.mp3$/, '');
    const ja = alias[para] ?? existentes.get(para);
    if (ja && ja !== id) { conflitos.push(`${de} → ${para}: já é ${ja}, o antigo era ${id}`); continue; }
    if (!alias[para]) { alias[para] = id; novos++; }
  }

  let mudados = 0, palavras = 0;
  for (const p of arquivos(ROOT)) {
    const antes = readFileSync(p, 'utf8');
    const depois = semDagueshInutil(antes);
    if (depois === antes) continue;
    mudados++;
    palavras += (antes.normalize('NFC').match(/[א-ת][֑-ׇא-ת]*/g) ?? [])
      .filter(w => palavraSemDaguesh(w) !== w).length;
    if (aplicar) writeFileSync(p, depois);
    else console.log(`  ${relative(ROOT, p)}`);
  }
  if (aplicar) {
    writeFileSync(aliasArq, JSON.stringify({
      note: [
        'GERADO por tools/daguesh.mjs - não edite à mão.',
        'Texto sem o daguesh que não muda o som → o id de áudio do texto antigo, com daguesh.',
        'É o que mantém as gravações já feitas tocando depois da mudança de 12/10/2026.',
        'tools/audio-id.mjs lê este arquivo; gen-audio e export-content usam o mesmo id.'
      ],
      alias: Object.fromEntries(Object.entries(alias).sort(([a], [b]) => a.localeCompare(b)))
    }, null, 2) + '\n');
  }
  console.log(`${aplicar ? 'aplicado' : 'simulação'}: ${palavras} palavra(s) em ${mudados} arquivo(s); ${novos} apelido(s) de áudio novo(s)`);
  if (conflitos.length) { console.log('conflitos:'); for (const c of conflitos) console.log('  ' + c); }
}

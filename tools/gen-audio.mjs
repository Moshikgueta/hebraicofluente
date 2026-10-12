/* gen-audio.mjs - builds data/audio.json: every clip the course needs, with a
 * stable filename and a stable printed number for each.
 *
 *   npm run audio-manifest
 *
 * FILENAMES ARE CONTENT-DERIVED, NOT POSITIONAL. The obvious design - number
 * the clips 001, 002, 003 in reading order - breaks the moment a word is added
 * to letter 3: everything after it shifts and every file already recorded is
 * misnamed. So the filename is a short hash of the pointed Hebrew itself. Add a
 * word, reorder a lesson, drop a letter: the existing recordings keep working
 * and only the genuinely new clip is missing.
 *
 * THE SEQUENCE NUMBER IS ALSO STABLE, for a harder reason: it is printed on the
 * recording script, and a speaker halfway through a session cannot be
 * renumbered. Numbers already handed out are read back from the previous
 * data/audio.json and kept; only new clips take the next free number. Reordering
 * a lesson therefore leaves every printed number correct - the script simply
 * stops being in numeric order, which costs the speaker nothing.
 *
 * NIKUD IS PART OF THE HASH on purpose: שָׁם and שֵׁם are different words that
 * differ only by pointing, and must never share a recording.
 *
 * ONE CLIP PER SOUND, NOT PER APPEARANCE. The same word in three places gets
 * one clip, because the hash is the same. The unpointed reading list in module
 * 6 is deliberately mapped onto its pointed twin - ספר and סֵפֶר are the same
 * word said the same way, and asking a speaker to read it twice wastes studio
 * time and invites two different takes of one word.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { gravacoesDoProfessor } from './gravacoes-professor.mjs';

const ROOT = new URL('..', import.meta.url).pathname;
const readJson = p => JSON.parse(readFileSync(join(ROOT, p), 'utf8'));
const NFC = s => String(s ?? '').normalize('NFC');

export const audioIdFor = he =>
  'he-' + createHash('sha256').update(NFC(he)).digest('hex').slice(0, 8);

/* ── waves ──────────────────────────────────────────────────────────────
   A speaker does not record 300 clips in one sitting, and the course does not
   need them all at once. The waves are ordered by what unblocks the most:
   wave 1 alone makes every lesson's "ouvir a letra" and syllable table work,
   which is the audio the course actually promises. */
export const WAVES = {
  1: { id: 1, titlePt: 'O essencial', notePt: 'Nomes das letras, sílabas e os sinais de vogal. Só com esta onda, toda lição já tem áudio no que importa: o som da letra.' },
  2: { id: 2, titlePt: 'As palavras de leitura', notePt: 'Todo o vocabulário que o aluno lê sozinho, na ordem do curso.' },
  3: { id: 3, titlePt: 'Reconhecimento e os módulos finais', notePt: 'Vocabulário de reconhecimento, os módulos 6 e 7, e as cenas de «no mundo real».' },
  /* 26/09/2026. As três primeiras ondas são de palavra solta, e o ouvido que
     só ouviu palavra solta trava na primeira frase dita no ritmo da fala. As
     frases e as linhas dos mini-textos são o que liga a escuta de frase
     (exListenSentence, exListenMeaning) e o "ouvir o texto" da leitura. */
  4: { id: 4, titlePt: 'Frases e textos', notePt: 'As frases do curso e as linhas dos mini-textos, ditas no ritmo natural da fala, sem pausa entre as palavras.' },
  /* 27/09/2026. Os textos bíblicos e as bênçãos de Recompensas (data/bonus.json):
     lidos pelo dono do curso, uma linha por clipe. */
  5: { id: 5, titlePt: 'Leituras bônus', notePt: 'Os textos bíblicos e as bênçãos de Recompensas, uma linha por clipe, em ritmo de leitura: calmo, mas sem pausa entre as palavras.' },
  /* 06/10/2026. O curso Hebraico A1 (data/a1/): as palavras, as falas dos
     diálogos, as leituras e os itens de escuta e de ditado de cada unidade.
     Como os textos, só as unidades que o dono já revisou. */
  6: { id: 6, titlePt: 'Hebraico A1', notePt: 'As palavras, os diálogos, as leituras e os exercícios de escuta do curso A1, unidade por unidade. As frases no ritmo natural da conversa.' },
  /* 11/10/2026. As explicações do professor (data/gravacoes-professor.json):
     em português, com os exemplos em hebraico. O roteiro de cada uma está no
     painel. Sem gravação, a tela do aluno não mostra nada no lugar. */
  7: { id: 7, titlePt: 'Explicações do professor', notePt: 'Explicações curtas em português, com os exemplos ditos em hebraico. O que dizer em cada uma está no roteiro do item.' }
};

function main() {
  const letters = readJson('data/letters.json').sort((a, b) => a.order - b.order);
  const nikud = readJson('data/nikud.json');
  const extras = readJson('data/extras.json');
  const realWorld = readJson('data/real-world.json');
  const sentences = readJson('data/sentences.json').sentences;
  const textos = readJson('data/textos.json').textos;
  const { leituras: bonus, guia } = readJson('data/bonus.json');

  const seen = new Map();
  /** @param {{he:string, translit?:string|null, gloss:string, kind:string, wave:number, where:string}} c */
  const add = c => {
    const key = NFC(c.he);
    if (!key) return;
    const prev = seen.get(key);
    if (prev) {
      /* Same sound, second home. Keep the earliest wave - a clip needed by
         wave 1 must not be scheduled for wave 3 because it also appears
         there - and record both places for the script's "onde aparece". */
      prev.wave = Math.min(prev.wave, c.wave);
      if (!prev.where.includes(c.where)) prev.where.push(c.where);
      return;
    }
    seen.set(key, {
      /* Insertion index. The clip NUMBER is stable across edits and therefore
         stops matching the course order; this is what the recording script is
         actually sorted by, so a speaker works letter by letter instead of
         jumping between lesson 10 and lesson 2 because those clips happen to
         be numbered adjacently. */
      seq: seen.size,
      he: key,
      translit: c.translit ?? null,
      gloss: c.gloss,
      kind: c.kind,
      wave: c.wave,
      where: [c.where],
      file: audioIdFor(key) + '.mp3'
    });
  };

  /* ── wave 1 · the sounds the course is about ───────────────────────── */
  for (const L of letters) {
    add({ he: L.nameHe, translit: L.namePt, gloss: `nome da letra ${L.namePt}`,
          kind: 'nome', wave: 1, where: `letra ${L.order}` });
    for (const s of L.syllables) {
      add({ he: s.he, translit: s.translit, gloss: `sílaba - ${s.ptApprox}`,
            kind: 'silaba', wave: 1, where: `letra ${L.order}` });
    }
  }
  for (const s of nikud.sounds) {
    for (const g of s.signs) {
      add({ he: g.demo, translit: null, gloss: `sinal ${g.namePt} - som ${s.sound}`,
            kind: 'silaba', wave: 1, where: 'sinais de vogal' });
      /* The sign's NAME, said on its own. The app teaches the vowels as a
         layer of their own - a patach is the same patach under any consonant -
         and a learner who can say "patach" has a handle for it. Ten clips, and
         they were the only thing the app referenced that the plan never asked
         anyone to record. */
      add({ he: g.nameHe, translit: g.namePt, gloss: `nome do sinal ${g.namePt}`,
            kind: 'nome', wave: 1, where: 'sinais de vogal' });
    }
  }

  /* ── wave 2 · what the learner reads ───────────────────────────────── */
  for (const L of letters) {
    for (const w of L.wordsToRead) {
      add({ he: w.he, translit: w.translit, gloss: w.pt,
            kind: 'palavra', wave: 2, where: `letra ${L.order}` });
    }
  }

  /* ── wave 3 · recognition, modules 6 and 7, the real-world scenes ──── */
  /* As palavras internacionais de cada letra (11/10/2026): escritas sem
     nikud, como aparecem na rua, e agora com a pronúncia hebraica gravada. */
  for (const L of letters) {
    for (const b of L.bridgeWords || []) {
      add({ he: b.he, translit: null, gloss: b.pt,
            kind: 'palavra', wave: 3, where: `letra ${L.order}, palavras internacionais` });
    }
  }
  for (const L of letters) {
    for (const w of L.wordsToRecognize) {
      add({ he: w.he, translit: w.translit, gloss: w.pt,
            kind: 'palavra', wave: 3, where: `letra ${L.order}` });
    }
  }
  for (const D of extras.dagesh.letters) {
    for (const w of [...D.hardWords, ...D.softWords]) {
      add({ he: w.he, translit: w.translit, gloss: w.pt,
            kind: 'palavra', wave: 3, where: 'módulo 6' });
    }
  }
  for (const F of extras.finals) {
    add({ he: F.word, translit: F.translit, gloss: F.pt,
          kind: 'palavra', wave: 3, where: 'módulo 6' });
  }
  /* The unpointed list is the pointed list, said the same way. Mapping rather
     than adding is what keeps the speaker from reading ספר twice.

     A fonte passou a listar só a forma apontada, em três grupos - e todas
     elas saem de letters.json, então na prática este laço não acrescenta
     clipe nenhum hoje. Fica porque a garantia é essa: qualquer palavra que a
     lista use está no roteiro, venha ela de onde vier. */
  for (const g of extras.unpointed.groups) {
    for (const pointed of g.words) {
      add({ he: pointed, translit: null, gloss: null,
            kind: 'palavra', wave: 3, where: 'módulo 6' });
    }
  }
  for (const pointed of extras.unpointed.ambiguous.readings) {
    add({ he: pointed, translit: null, gloss: null,
          kind: 'palavra', wave: 3, where: 'módulo 6' });
  }
  for (const g of extras.gerech.letters) {
    add({ he: g.he, translit: g.pt, gloss: `a letra ${g.base} com guéresh - som ${g.pt}`,
          kind: 'nome', wave: 3, where: 'módulo 7' });
    for (const w of g.words) {
      add({ he: w.he, translit: null, gloss: w.pt,
            kind: 'palavra', wave: 3, where: 'módulo 7' });
    }
  }
  /* As lições de som (26/09/2026): as sílabas sem ponto e as palavras de
     cada uma. São lições do caminho principal, então entram na onda 2, com o
     que o aluno lê - e não na 3, junto com o que ele só reconhece. */
  for (const S of extras.sons.licoes) {
    /* A letra com guéresh já é clipe (módulo 7). A letra sem ponto sozinha,
       não: uma consoante sem vogal não se diz - o som dela é a sílaba. */
    for (const s of S.silabas) {
      add({ he: s.he, translit: s.translit, gloss: `sílaba sem ponto - ${S.namePt}`,
            kind: 'silaba', wave: 2, where: `lição ${S.namePt}` });
    }
    for (const w of S.palavras) {
      add({ he: w.he, translit: w.translit, gloss: w.pt,
            kind: 'palavra', wave: 2, where: `lição ${S.namePt}` });
    }
  }
  for (const s of realWorld.scenes) {
    add({ he: s.he, translit: s.translit, gloss: s.pt,
          kind: 'palavra', wave: 3, where: 'no mundo real' });
  }

  /* ── wave 4 · sentences and the mini-texts, line by line ─────────────
     Uma linha por clipe, e não o texto inteiro num clipe só: a linha é o que
     o aluno toca quando trava nela, e o texto inteiro é a sequência delas.
     Só textos revisados: um texto que ainda não foi ao ar não pede gravação. */
  for (const f of sentences) {
    add({ he: f.he, translit: f.translit, gloss: f.pt, kind: 'frase', wave: 4, where: 'frases' });
  }
  /* As palavras de cada frase (29/09/2026): a leitura palavra a palavra do
     exercício de frase toca cada uma, e treze delas não estavam no
     catálogo - o botão sumia e o estúdio nem as listava. Depois das frases,
     para que as já gravadas mantenham o número; uma palavra que a lição já
     ensinou fica no grupo dela (o `add` não duplica). */
  for (const f of sentences) {
    for (const w of f.words || []) {
      /* O mesmo hebraico que export-content.mjs usa para o id: sem limpar
         nada, ou o id do app e o do estúdio se separam. */
      add({ he: w.he, translit: w.translit ?? null, gloss: w.pt, kind: 'palavra', wave: 4, where: `palavras da frase ${f.id}` });
    }
  }
  for (const t of textos.filter(t => t.revisado)) {
    for (const l of t.linhas) {
      add({ he: l.he, translit: l.translit, gloss: l.pt, kind: 'frase', wave: 4, where: `${t.revisao ? 'leitura de revisão' : 'texto'} do módulo ${t.modulo}` });
    }
  }
  /* As palavras novas de cada texto (27/09/2026). Depois de lido o texto,
     elas entram no vocabulário e no treino do aluno (palavrasDoTexto, em
     lib/engine/textos.ts) - e entravam mudas: era o único lugar do curso
     com palavra sem voz. Mesmo filtro de lá: sem o prefixo solto (הַ־) e
     sem nome próprio, sem a pontuação do fim. Uma palavra que a lição já
     ensinou mantém a gravação e o grupo dela (o `add` não duplica). */
  for (const t of textos.filter(t => t.revisado)) {
    for (const w of t.novas || []) {
      if (w.he.includes('־') || /\(nome\)\s*$/.test(w.pt)) continue;
      add({ he: w.he.replace(/[?!.,:]+$/u, '').trim(), translit: w.translit.replace(/[?!.,:]+$/u, '').trim(),
            gloss: w.pt, kind: 'palavra', wave: 4, where: `palavras do texto ${t.modulo}` });
    }
  }

  /* ── wave 5 · as leituras bônus ──────────────────────────────────────
     Como os textos: só as revisadas. A abertura das bênçãos (בָּרוּךְ אַתָּה…)
     é a mesma linha nas quatro e vira um clipe só - o `add` não duplica. */
  for (const b of bonus.filter(b => b.revisado)) {
    for (const l of b.linhas) {
      add({ he: l.he, translit: l.translit, gloss: l.pt, kind: 'frase', wave: 5, where: `leitura bônus: ${b.fontePt}` });
    }
  }
  /* Os exemplos do guia «O nikud da Bíblia», palavras recortadas das leituras.
     O de te'amim toca a linha já gravada (`ouvir`), e o `add` não duplica. */
  if (guia?.revisado) {
    for (const s of guia.secoes) for (const e of s.exemplos) {
      add({ he: e.ouvir ?? e.he, translit: e.translit, gloss: e.pt, kind: 'palavra', wave: 5, where: 'guia do nikud bíblico' });
    }
  }

  /* As explicações do professor: a chave é o id, não um texto em hebraico. */
  for (const g of gravacoesDoProfessor(ROOT)) {
    add({ he: `professor ${g.id}`, translit: `professor-${g.id}`, gloss: `${g.ondePt}. ${g.roteiroPt}`,
          kind: 'professor', wave: 7, where: g.ondePt });
  }

  /* O Hebraico A1, unidade por unidade, na ordem dos módulos. */
  const a1Curso = readJson('data/a1/curso.json');
  for (const n of a1Curso.modulos.flatMap(m => m.unidades)) {
    const u = readJson(`data/a1/unidades/u${String(n).padStart(2, '0')}.json`);
    if (!u.revisado) continue;
    const onde = `a1 unidade ${n}`;
    for (const w of u.palavras) {
      /* As tabelas de formas não têm botão de ouvir: só as palavras soltas. */
      if (!w.formas) add({ he: w.he, translit: w.translit, gloss: w.pt, kind: w.he.includes(' ') ? 'frase' : 'palavra', wave: 6, where: onde });
    }
    for (const l of u.dialogo.linhas) add({ he: l.he, translit: l.translit, gloss: l.pt, kind: 'frase', wave: 6, where: `${onde}, diálogo` });
    for (const w of u.dialogo.glossario || []) add({ he: w.he, translit: w.translit, gloss: w.pt, kind: 'palavra', wave: 6, where: `${onde}, diálogo` });
    for (const l of u.leitura?.linhas || []) add({ he: l.he, translit: l.translit, gloss: l.pt, kind: 'frase', wave: 6, where: `${onde}, leitura` });
    for (const it of [...u.exercicios, ...(u.leitura?.perguntas || [])]) {
      if (it.t === 'ouvir' || it.t === 'ditado') add({ he: it.he, translit: null, gloss: it.q ?? 'ditado', kind: 'frase', wave: 6, where: `${onde}, escuta` });
    }
  }

  /* ── stable numbering ───────────────────────────────────────────────── */
  let previous = {};
  try {
    for (const c of readJson('data/audio.json').clips) previous[NFC(c.he)] = c.num;
  } catch { /* first run */ }

  let next = Math.max(0, ...Object.values(previous)) + 1;
  const clips = [...seen.values()]
    .map(c => ({ num: previous[c.he] ?? next++, ...c }))
    .sort((a, b) => a.wave - b.wave || a.seq - b.seq);

  const reused = clips.filter(c => previous[c.he] !== undefined).length;

  /* A hash collision would silently give two words one recording. At this size
     it will not happen; if it ever does, the build must stop rather than teach
     one word with another word's sound. */
  const byFile = new Map();
  for (const c of clips) {
    if (byFile.has(c.file)) {
      console.error(`  ! colisão de hash: ${c.he} e ${byFile.get(c.file)} → ${c.file}`);
      process.exitCode = 1;
    }
    byFile.set(c.file, c.he);
  }

  const orphans = Object.keys(previous).filter(h => !seen.has(h));

  writeFileSync(join(ROOT, 'data/audio.json'), JSON.stringify({
    note: [
      'GERADO por tools/gen-audio.mjs - nao edite a mao.',
      'O nome do arquivo vem de um hash do hebraico pontuado, nao da posicao:',
      'acrescentar uma palavra nao renomeia nada do que ja foi gravado.',
      'O numero e impresso no roteiro de gravacao, entao tambem e estavel:',
      'numeros ja atribuidos sao preservados e so clipes novos recebem numeros novos.',
      'Coloque os arquivos em audio/ e rode `npm run check-audio`.'
    ],
    generatedAt: new Date().toISOString().slice(0, 10),
    total: clips.length,
    waves: Object.values(WAVES).map(w => ({
      ...w, count: clips.filter(c => c.wave === w.id).length
    })),
    clips
  }, null, 2) + '\n');

  const by = k => clips.filter(c => c.kind === k).length;
  console.log(`\n  ${clips.length} clipes → data/audio.json`);
  console.log(`    ${by('nome')} nomes · ${by('silaba')} sílabas · ${by('palavra')} palavras · ${by('frase')} frases`);
  for (const w of Object.values(WAVES)) {
    console.log(`    onda ${w.id} - ${w.titlePt}: ${clips.filter(c => c.wave === w.id).length}`);
  }
  if (reused) console.log(`    ${reused} número(s) preservado(s), ${clips.length - reused} novo(s)`);
  if (orphans.length) {
    console.log(`    ! ${orphans.length} clipe(s) não são mais usados - os arquivos podem ser arquivados`);
  }
  console.log('');
}

main();

/* The letter module: five stages, generated from one letter record.
   No letter is ever named in this file. Changing anything here changes all 22.

   ONE SHEET IS ONE PRINTED PAGE. A stage that does not fit gets an explicit
   continuation sheet, the way the reference workbook does it — the stage
   number stays, the sheet count grows. Nothing is allowed to spill silently:
   a sheet that overflows by a few millimetres quietly becomes two pages, the
   folio stops matching the real page, and the contents page starts lying.
   `npm run check-fit` measures every sheet and fails the run if one overflows. */

import { he, heList, heCloze, pair, esc, mixed, H, prose } from '../scripts/lib/render.js';
import { ALEFBET } from '../scripts/lib/hebrew.js';
import { badge, sheet, callout, stepStrip, exercise, strokeOrder } from './partials.js';

/* Deterministic shuffle — the build must be reproducible, so no Math.random. */
function rng(seed) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function shuffled(arr, rand) {
  const r = arr.slice();
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

function distractorLetters(L, rand, n = 1) {
  const pool = (L.confusableWith || []).filter(c => c !== L.letter);
  if (pool.length >= n) return shuffled(pool, rand).slice(0, n);
  const rest = ALEFBET.filter(c => c !== L.letter && !pool.includes(c));
  return pool.concat(shuffled(rest, rand).slice(0, n - pool.length));
}

/* ── word helpers ────────────────────────────────────────────────────────── */

/* A word split into clusters: each consonant plus the pointing that rides on
   it. Hebrew has no contextual shaping, so a cluster is safe to isolate. */
function clusters(word) {
  const out = [];
  for (const ch of [...word]) {
    if (/[א-ת]/.test(ch) || !out.length) out.push(ch);
    else out[out.length - 1] += ch;
  }
  return out;
}

/* The word with the TARGET letter blanked, in reading order (right to left).
   Blanking the first cluster blindly was wrong: at letter Kaf the word מֶלֶךְ
   carries its kaf at the END, as ך, so the blank landed on the mem and the
   exercise asked for the wrong letter. */
function gapParts(word, L) {
  const cl = clusters(word);
  let idx = cl.findIndex(c => c[0] === L.letter);
  if (idx < 0 && L.finalForm) idx = cl.findIndex(c => c[0] === L.finalForm);
  if (idx < 0) idx = 0;

  const parts = [];
  cl.forEach((c, i) => {
    if (i === idx) { parts.push(null); return; }
    const last = parts[parts.length - 1];
    if (typeof last === 'string') parts[parts.length - 1] = last + c;
    else parts.push(c);
  });
  return parts;
}

/* Gapping a SYLLABLE leaves only a combining mark, which renders as nothing at
   all, so the row comes out blank and unanswerable. Gap words the learner can
   read; with none available fall back to the recognition vocabulary, labelled
   as such — finding where מ sits inside מַיִם is a fair task at letter 1. */
function gapSource(L) {
  const read = L.wordsToRead || [];
  if (read.length) return { items: read.slice(0, 4), recognition: false };
  return { items: (L.wordsToRecognize || []).slice(0, 4), recognition: true };
}

function clozeTargetLetter(w, L) {
  return `<span class="gap-item">${heCloze(gapParts(w.he, L))} <span class="hint">${esc(w.pt)}</span></span>`;
}

/* ── the module ──────────────────────────────────────────────────────────── */

export function renderLetter(L, ctx) {
  const rand = rng(L.id);
  const name = esc(L.namePt);
  const canRead = (L.wordsToRead || []).length > 0;

  /* `bdg(stage)` labels the sheet; `cont` marks a continuation of the same
     stage, so the learner always knows which of the five they are in. */
  const bdg = (stage, cont) => badge(mixed([
    `Página ${stage} de 5 — letra `, H(L.letter), cont ? ' · continuação' : ''
  ]));

  const A = { L, name, rand, canRead, bdg, ctx };
  const sheets = [...stage1(A), ...stage2(A), ...stage3(A), ...stage4(A), ...stage5(A)];
  return sheets.filter(Boolean).map((body, i) => sheet(body, i + 1)).join('\n');
}

/* ── Stage 1 · conhecer a letra, depois ler as sílabas ───────────────────── */
function stage1({ L, name, canRead, bdg }) {
  const forms = [
    ['Impressa', he(L.letter, { size: 'big' })],
    ['Cursiva', he(L.letter, { size: 'big', cursive: true })]
  ];
  if (L.finalForm) forms.push(['No fim da palavra', he(L.finalForm, { size: 'big' })]);

  const a = `
    ${bdg(1)}
    <h1>${mixed([`A letra `, H(L.letter), ` — ${name} `])}<span class="paren">(</span>${he(L.nameHe)}<span class="paren">)</span></h1>

    <h3>O que você vai aprender</h3>
    <ul class="ticks">
      <li>${mixed(['Reconhecer e escrever a letra ', H(L.letter), ` (${name})`])}</li>
      <li>${mixed([`Produzir o som ${L.sound} e ler sílabas com `, H(L.letter)])}</li>
      <li>${canRead ? 'Ler palavras inteiras com as letras que você já conhece'
                    : 'Ler as sílabas em voz alta com segurança'}</li>
    </ul>

    <h2>Conhecendo a letra</h2>
    <p>${prose(L.soundNotePt)}</p>

    ${callout('warn', '⚠️', `
      <h3>Cuidado — erro comum de brasileiro</h3>
      <p><strong>O que costuma sair:</strong> ${prose(L.brazilianMistake.wrong)}</p>
      <p><strong>O certo:</strong> ${prose(L.brazilianMistake.right)}</p>
      <p class="hint">${prose(L.brazilianMistake.why)}</p>`)}

    <h2>Como ela aparece</h2>
    <table>
      <thead><tr><th>Forma</th><th>Letra</th></tr></thead>
      <tbody>
        ${forms.map(([k, v]) => `<tr><td>${k}</td><td class="center">${v}</td></tr>`).join('\n')}
      </tbody>
    </table>`;

  const b = `
    ${bdg(1, true)}
    <h1>Aprendendo a ler</h1>
    <p class="lead">${mixed([`Observe como `, H(L.letter), ` se combina com cada vogal. Leia cada sílaba em voz alta.`])}</p>
    <table>
      <thead><tr><th>Hebraico</th><th>Leitura</th><th>Aproximação</th></tr></thead>
      <tbody>
        ${L.syllables.map(s => `<tr>
          <td class="he-cell">${he(s.he, { size: 'word' })}</td>
          <td><strong class="kbd">${esc(s.translit)}</strong></td>
          <td>${esc(s.ptApprox)}</td>
        </tr>`).join('\n')}
      </tbody>
    </table>

    <h2>Pratique em voz alta</h2>
    ${stepStrip([
      ['01', 'Leia cada sílaba devagar', 'Uma de cada vez, sem pressa.'],
      ['02', 'Repita 3 vezes seguidas', 'A repetição é o que fixa o som.'],
      ['03', 'Leia a sequência inteira', 'Sem parar entre as sílabas.'],
      ['04', 'Aumente a velocidade', 'Só depois que estiver confortável.']
    ])}
    <p>${heList(L.syllables.map(s => s.he), { size: 'word' })}</p>

    ${callout('tip', '💡', `<p>Pronunciar em voz alta ativa a memória auditiva e acelera o aprendizado. Não pule esta etapa.</p>`)}`;

  return [a, b];
}

/* ── Stage 2 · palavras úteis, depois os exercícios ──────────────────────── */
function stage2({ L, name, rand, bdg }) {
  const words = L.wordsToRecognize || [];
  const readable = L.wordsToRead || [];

  const rows = words.map(w => `<tr>
      <td class="center"><span class="well-sm" aria-hidden="true"></span></td>
      <td class="he-cell">${he(w.he, { size: 'word', mark: L.letter })}</td>
      <td><strong class="kbd">${esc(w.translit)}</strong></td>
      <td>${esc(w.pt)}</td>
      <td>${esc(w.use || '')}</td>
    </tr>`).join('\n');

  const a = `
    ${bdg(2)}
    <h1>${mixed(['Palavras úteis com ', H(L.letter), ` `])}<span class="paren">(</span>${esc(name)}<span class="paren">)</span></h1>
    <p class="lead">${mixed(['Palavras frequentes no hebraico moderno — a letra ', H(L.letter), ' está destacada em cada uma.'])}</p>

    <table>
      <thead><tr><th>Imagem</th><th>Palavra</th><th>Leitura</th><th>Significado</th><th>Uso</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>

    ${callout('note', '💧', `
      <h3>Você sabia?</h3>
      <p>${prose(L.didYouKnow)}</p>`)}`;

  const circlePool = shuffled(words.map(w => w.he), rand).slice(0, 5);
  const gapItems = readable.slice(0, 4);

  const b = `
    ${bdg(2, true)}
    <h1>Exercícios de leitura</h1>

    ${exercise(1, 'Leia em voz alta', `
      <p class="ex-task"><span>Pronuncie cada sílaba:</span> ${heList(L.syllables.map(s => s.he), { size: 'word' })}</p>`)}

    ${exercise(2, mixed(['Circule a letra ', H(L.letter)]), `
      <p class="ex-task"><span>Encontre todas as ocorrências:</span> ${heList(circlePool, { size: 'word' })}</p>`)}

    ${exercise(3, 'Ligue corretamente', `
      <p>Ligue cada leitura à palavra hebraica correspondente.</p>
      <p class="ex-task">${shuffled(words.slice(0, 3), rand).map(w => pair(w.translit, w.he)).join(' ')}</p>`)}

    ${gapItems.length ? exercise(4, mixed(['Complete com ', H(L.letter)]), `
      <p>Escreva a letra que falta em cada palavra.</p>
      <p class="ex-task">${gapItems.map(w => clozeTargetLetter(w, L)).join(' ')}</p>`) : ''}

    ${exercise(gapItems.length ? 5 : 4, 'Leitura de palavras', readable.length
      ? `<p class="ex-task"><span>Leia em voz alta:</span> ${heList(readable.map(w => w.he), { size: 'word' })}</p>`
      : `<p class="ex-task"><span>Leia em voz alta:</span> ${heList(L.syllables.map(s => s.he), { size: 'word' })}</p>`)}

    ${callout('tip', '💡', `<p>Repita cada exercício pelo menos duas vezes. A repetição é a chave da memorização.</p>`)}`;

  /* Letter 1 has no readable word, so its "complete" exercise becomes a copy
     table — too tall to share a sheet with the others. */
  const c = gapItems.length ? null : `
    ${bdg(2, true)}
    <h1>${mixed(['Escreva ', H(L.letter), ' com cada vogal'])}</h1>
    <p class="lead">Copie a sílaba ao lado do modelo.</p>
    <table>
      <thead><tr><th>Modelo</th><th>Leitura</th><th>Escreva aqui</th></tr></thead>
      <tbody>${L.syllables.map(s => `<tr>
        <td class="he-cell">${he(s.he, { size: 'word' })}</td>
        <td><strong class="kbd">${esc(s.translit)}</strong></td>
        <td class="write-cell"></td></tr>`).join('')}</tbody>
    </table>
    <p class="hint">Nesta primeira letra ainda não existem palavras inteiras para completar — você conhece uma consoante só. As palavras começam já na próxima letra.</p>`;

  return [a, b, c];
}

/* ── Stage 3 · escrever: modelo, traçado, cópia ──────────────────────────── */
function stage3({ L, name, canRead, bdg, ctx }) {
  const out = [];

  out.push(`
    ${bdg(3)}
    <h1>${mixed(['Aprendendo a escrever — ', H(L.letter), ` `])}<span class="paren">(</span>${esc(name)}<span class="paren">)</span></h1>
    <p class="lead">A escrita hebraica corre da direita para a esquerda. Observe os modelos antes de começar.</p>

    <div class="model-pair">
      <div>
        <h3>① Modelo final</h3>
        <p class="hint">A forma completa da letra em cursivo.</p>
        <div class="model-box">${he(L.letter, { size: 'display', cursive: true })}</div>
      </div>
      <div>
        <h3>② Ordem dos movimentos</h3>
        <p class="hint">Siga a numeração das setas para traçar corretamente.</p>
        <div class="model-box">${strokeOrder(L, ctx)}</div>
      </div>
    </div>

    ${callout('tip', '💡', `<p>Visualize o traço completo antes de encostar o lápis no papel.</p>`)}`);

  if (L.finalForm) {
    out.push(`
    ${bdg(3, true)}
    <h1>${mixed(['A forma final — ', H(L.finalForm)])}</h1>
    <p class="lead">${mixed(['No fim da palavra a letra vira ', H(L.finalForm),
      '. É o mesmo som, com outro desenho e outro traçado — repare que ela desce abaixo da linha.'])}</p>
    <div class="model-pair">
      <div>
        <h3>Modelo final</h3>
        <div class="model-box">${he(L.finalForm, { size: 'display', cursive: true })}</div>
      </div>
      <div>
        <h3>Ordem dos movimentos</h3>
        <div class="model-box">${strokeOrder(L, ctx, 'final')}</div>
      </div>
    </div>

    <h2>Impressa e cursiva</h2>
    <table>
      <thead><tr><th>Impressa</th><th>Cursiva</th><th>Final — impressa</th><th>Final — cursiva</th></tr></thead>
      <tbody><tr>
        <td class="center">${he(L.letter, { size: 'big' })}</td>
        <td class="center">${he(L.letter, { size: 'big', cursive: true })}</td>
        <td class="center">${he(L.finalForm, { size: 'big' })}</td>
        <td class="center">${he(L.finalForm, { size: 'big', cursive: true })}</td>
      </tr></tbody>
    </table>`);
  } else {
    out.push(`
    ${bdg(3, true)}
    <h1>Impressa e cursiva</h1>
    <p class="lead">A letra de imprensa é a que você lê; a cursiva é a que se escreve à mão. Compare as duas antes de traçar.</p>
    <table>
      <thead><tr><th>Impressa</th><th>Cursiva</th></tr></thead>
      <tbody><tr>
        <td class="center">${he(L.letter, { size: 'display' })}</td>
        <td class="center">${he(L.letter, { size: 'display', cursive: true })}</td>
      </tr></tbody>
    </table>
    ${callout('tip', '💡', `<p>Ninguém escreve hebraico à mão em letra de imprensa. A cursiva é a que vale a pena treinar.</p>`)}`);
  }

  /* 3B — tracing. */
  const glyphs = L.finalForm ? [L.letter, L.letter, L.finalForm] : [L.letter, L.letter, L.letter];
  out.push(`
    ${bdg(3, true)}
    <h1>${mixed(['Trace por cima — ', H(L.letter)])}</h1>
    <p class="lead">Trace sobre as letras claras. Siga sempre a direção indicada e repita cada linha com calma.</p>
    ${glyphs.map((g, i) => `
    <h3>${['③', '④', '⑤'][i]} Linha ${i + 1} — trace por cima</h3>
    <div class="write-rule">
      <div class="write-rule-head">← escreva nesta direção ←</div>
      <div class="write-row">
        ${Array.from({ length: 5 }, () => `<span class="he glyph glyph--trace">${esc(g)}</span>`).join('')}
      </div>
    </div>`).join('\n')}
    ${callout('tip', '💡', `<p>Trace da direita para a esquerda, em movimento fluido e contínuo.</p>`)}`);

  /* 3C — copy, then free writing. Two sheets: the ruled grids are tall. */
  out.push(`
    ${bdg(3, true)}
    <h1>${mixed(['Copie — ', H(L.letter)])}</h1>
    <p class="lead">Copie a letra ao lado do modelo em cada linha, mantendo o mesmo tamanho e proporção.</p>
    <h2>⑥ Copie a letra</h2>
    <table class="copy-table">
      <thead><tr><th>Modelo</th><th>Copie aqui</th></tr></thead>
      <tbody>${Array.from({ length: 4 }, () => `
        <tr><td class="center">${he(L.letter, { size: 'big', cursive: true })}</td>
            <td class="write-cell"></td></tr>`).join('')}</tbody>
    </table>`);

  const wordCopy = canRead ? `
    <h2>⑦ Copie uma palavra</h2>
    <p>Copie a palavra completa, mantendo o tamanho das letras.</p>
    <table>
      <thead><tr><th>Modelo</th><th>Copie aqui</th></tr></thead>
      <tbody>${L.wordsToRead.slice(0, 2).map(w => `<tr>
        <td class="he-cell">${he(w.he, { size: 'word', cursive: true })} <span class="hint">${esc(w.pt)}</span></td>
        <td class="write-cell"></td></tr>`).join('')}</tbody>
    </table>` : '';

  out.push(`
    ${bdg(3, true)}
    <h1>Escreva sozinho</h1>
    ${wordCopy}
    <h2>⑧ Sem modelo</h2>
    <p>${mixed(['Escreva a letra ', H(L.letter), ' em cursivo nas linhas abaixo, com fluidez.'])}</p>
    <div class="free-lines"><div></div><div></div><div></div></div>

    ${callout('note', '🌟', `<p>Muito bem. Você completou a prática de escrita da letra ${mixed([H(L.letter), ` (${esc(name)})`])} — a fluência vem com a repetição.</p>`)}`);

  return out;
}

/* ── Stage 4 · praticando a leitura ──────────────────────────────────────── */
function stage4({ L, name, rand, bdg }) {
  const words = L.wordsToRecognize || [];

  const gallery = words.slice(0, 4).map(w => `
    <figure>
      <div class="well" aria-hidden="true">imagem</div>
      ${he(w.he, { size: 'word' })}
      <figcaption>${esc(w.translit)} — ${esc(w.pt)}</figcaption>
    </figure>`).join('');

  const a2 = L.syllables.slice(0, 4).map(s => {
    const others = L.syllables.filter(x => x.translit !== s.translit);
    const opts = shuffled([s.translit, ...shuffled(others, rand).slice(0, 2).map(x => x.translit)], rand);
    return `<tr>
      <td class="he-cell">${he(s.he, { size: 'word' })}</td>
      ${opts.map(o => `<td>( ) ${esc(o)}</td>`).join('')}
    </tr>`;
  }).join('');

  const a = `
    ${bdg(4)}
    <h1>Praticando a leitura</h1>
    <p class="lead">${mixed(['Leia as palavras abaixo com a letra ', H(L.letter), ` (${esc(name)}) em voz alta — ouvir o próprio som é parte essencial do aprendizado.`])}</p>

    <h2>Atividade 1 — leitura de palavras</h2>
    <div class="gallery">${gallery}</div>

    <h2>Atividade 2 — escolha a leitura correta</h2>
    <p>Marque com X a transliteração correta de cada sílaba hebraica.</p>
    <table>
      <thead><tr><th>Sílaba</th><th>Opção A</th><th>Opção B</th><th>Opção C</th></tr></thead>
      <tbody>${a2}</tbody>
    </table>`;

  const gap = gapSource(L);
  const a3 = `
    <p>${mixed(['Insira a letra ', H(L.letter), ' no espaço correto para completar cada palavra.'])}</p>
    ${gap.recognition ? `<p class="hint">Você ainda não lê estas palavras inteiras — nesta atividade basta reconhecer onde a letra entra.</p>` : ''}
    <table>
      <thead><tr><th>Palavra incompleta</th><th>Significado</th><th>Palavra completa</th></tr></thead>
      <tbody>${gap.items.map(w => `<tr>
        <td class="he-cell">${heCloze(gapParts(w.he, L))}</td>
        <td>${esc(w.pt)}</td>
        <td class="write-cell"></td></tr>`).join('')}</tbody>
    </table>`;

  const a4 = [0, 1, 2].map(i => {
    const d = distractorLetters(L, rand, 1)[0];
    const row = Array.from({ length: 5 }, () => L.letter);
    row[Math.floor(rand() * 5)] = d;
    return `<div class="find-row">
      <h4>Linha ${i + 1}</h4>
      ${heList(row, { size: 'word' })}
    </div>`;
  }).join('');

  const finalEx = L.finalForm ? `
    <h2>Atividade 5 — a forma final</h2>
    <p>${mixed(['A letra ', H(L.letter), ' muda de forma no fim da palavra: vira ', H(L.finalForm),
        '. É a mesma letra e o mesmo som — só o desenho muda. Circule apenas as formas finais:'])}</p>
    <p class="ex-task">${heList(
      shuffled([L.finalForm, L.letter, L.letter, L.finalForm, L.letter, L.finalForm], rand),
      { size: 'word' })}</p>` : '';

  const b = `
    ${bdg(4, true)}
    <h1>Praticando a leitura</h1>

    <h2>Atividade 3 — complete</h2>
    ${a3}

    <h2>Atividade 4 — encontre a letra diferente</h2>
    <p>Em cada linha, uma letra é diferente das outras. Circule-a.</p>
    <div class="find-grid">${a4}</div>

    ${finalEx}`;

  return [a, b];
}

/* ── Stage 5 · fixação e ditado ──────────────────────────────────────────── */
function stage5({ L, name, rand, canRead, bdg }) {
  const recog = L.wordsToRecognize || [];
  const pool = canRead ? L.wordsToRead : [];

  const a1 = gapSource(L).items.map(w => `<tr>
      <td class="he-cell">${heCloze(gapParts(w.he, L))}</td>
      <td>${esc(w.pt)}</td>
      <td class="write-cell"></td>
    </tr>`).join('');

  const linkItems = shuffled(recog.slice(0, 4), rand);

  const a = `
    ${bdg(5)}
    <h1>Fixação — revisão completa</h1>
    <p class="lead">${mixed(['Revise tudo o que aprendeu sobre a letra ', H(L.letter), ` (${esc(name)}): leitura, escrita, reconhecimento e vocabulário.`])}</p>

    <h2>Atividade 1 — complete</h2>
    <table>
      <thead><tr><th>Incompleta</th><th>Significado</th><th>Complete</th></tr></thead>
      <tbody>${a1}</tbody>
    </table>

    <h2>Atividade 2 — ligue significado e palavra</h2>
    <p>Trace uma linha ligando cada significado à sua palavra em hebraico.</p>
    <div class="cols-2">
      <div>${recog.slice(0, 4).map(w =>
        `<p class="link-left"><span class="well-sm" aria-hidden="true"></span> ${esc(w.pt)}</p>`).join('')}</div>
      <div class="link-right">
        <h4>Palavras</h4>
        ${linkItems.map(w => `<p>${he(w.he, { size: 'word' })}</p>`).join('')}
      </div>
    </div>`;

  const a3 = (pool.length ? pool : recog).slice(0, 3).map(w => `<tr>
      <td>${esc(w.translit || '')} <span class="hint">${esc(w.pt)}</span></td>
      <td class="write-cell"></td>
    </tr>`).join('');

  const b = `
    ${bdg(5, true)}
    <h1>Escrita e ditado</h1>

    <h2>Atividade 3 — escreva em hebraico cursivo</h2>
    <table>
      <thead><tr><th>Leitura</th><th>Escreva em cursivo</th></tr></thead>
      <tbody>${a3}</tbody>
    </table>

    <h2>🎯 Ditado</h2>
    <p>Peça a alguém para ler as palavras em voz alta e escreva o que ouvir. Se estiver estudando sozinho, grave a si mesmo e escute depois.</p>
    <div class="dict-lines"><div>1.</div><div>2.</div><div>3.</div></div>

    ${callout('note', '🌟', `<p><strong>Parabéns.</strong> Você concluiu o estudo da letra ${mixed([H(L.letter), ` (${esc(name)})`])} — continue praticando.</p>`)}`;

  return [a, b];
}

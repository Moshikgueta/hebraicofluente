/* The letter module: five pages, generated from one letter record.
   No letter is ever named in this file. Changing anything here changes all 22. */

import { he, heList, heCloze, pair, esc, mixed, H, prose } from '../scripts/lib/render.js';
import { ALEFBET, stripNikud } from '../scripts/lib/hebrew.js';
import { badge, sheet, callout, stepStrip, exercise, strokeOrder } from './partials.js';

/* Deterministic shuffle — the build must be reproducible, so no Math.random.
   Mulberry32 seeded from the letter id. */
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

/* Letters that look near enough to the target to be worth discriminating.
   Falls back to a stable pick from the alphabet when the record lists none. */
function distractorLetters(L, rand, n = 1) {
  const pool = (L.confusableWith || []).filter(c => c !== L.letter);
  if (pool.length >= n) return shuffled(pool, rand).slice(0, n);
  const rest = ALEFBET.filter(c => c !== L.letter && !pool.includes(c));
  return pool.concat(shuffled(rest, rand).slice(0, n - pool.length));
}

export function renderLetter(L, ctx) {
  const rand = rng(L.id);
  const T = he(L.letter);
  const name = esc(L.namePt);
  const total = 5;
  const bdg = (n, extra) =>
    badge(mixed([`Página ${n} de ${total} — letra `, H(L.letter), extra ? ` ${extra}` : '']));

  const canRead = (L.wordsToRead || []).length > 0;

  return [
    page1(L, { bdg, T, name, rand, canRead }),
    page2(L, { bdg, T, name, rand }),
    page3a(L, { bdg, T, name, ctx }),
    page3b(L, { bdg, T, name }),
    page3c(L, { bdg, T, name, canRead }),
    page4(L, { bdg, T, name, rand, canRead }),
    page5(L, { bdg, T, name, rand, canRead })
  ].join('\n');
}

/* ── P1 · Conhecer a letra + ler sílabas ─────────────────────────────────── */
function page1(L, { bdg, T, name, rand, canRead }) {
  const forms = [
    ['Impressa', he(L.letter, { size: 'big' })],
    ['Cursiva', he(L.letter, { size: 'big', cursive: true })]
  ];
  if (L.finalForm) forms.push(['No fim da palavra', he(L.finalForm, { size: 'big' })]);

  const body = `
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
    </table>

    <h2>Aprendendo a ler</h2>
    <p>${mixed([`Observe como `, H(L.letter), ` se combina com cada vogal. Leia cada sílaba em voz alta.`])}</p>
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

    ${callout('tip', '💡', `<p>Pronunciar em voz alta ativa a memória auditiva e acelera o aprendizado. Não pule esta etapa.</p>`)}
  `;
  return sheet(body, 1);
}

/* ── P2 · Palavras úteis + exercícios de leitura ─────────────────────────── */
function page2(L, { bdg, T, name, rand }) {
  const words = L.wordsToRecognize || [];
  const readable = L.wordsToRead || [];

  const rows = words.map(w => `<tr>
      <td class="center"><span class="well-sm" aria-hidden="true"></span></td>
      <td class="he-cell">${he(w.he, { size: 'word', mark: L.letter })}</td>
      <td><strong class="kbd">${esc(w.translit)}</strong></td>
      <td>${esc(w.pt)}</td>
      <td>${esc(w.use || '')}</td>
    </tr>`).join('\n');

  /* Exercise 2 — circle the target letter. Recognition, so unlearned letters
     are allowed here by design: the learner is looking at shapes, not reading. */
  const circlePool = shuffled(words.map(w => w.he), rand).slice(0, 5);

  /* Exercise 4 — fill the gap. Only ever built from words the learner can read;
     with none available it is replaced by a syllable task. */
  const gapItems = readable.slice(0, 4);

  const body = `
    ${bdg(2)}
    <h1>${mixed(['Palavras úteis com ', H(L.letter), ` `])}<span class="paren">(</span>${esc(name)}<span class="paren">)</span></h1>
    <p class="lead">${mixed(['Palavras frequentes no hebraico moderno — a letra ', H(L.letter), ' está destacada em cada uma.'])}</p>

    <table>
      <thead><tr><th>Imagem</th><th>Palavra</th><th>Leitura</th><th>Significado</th><th>Uso</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>

    ${callout('note', '💧', `
      <h3>Você sabia?</h3>
      <p>${prose(L.didYouKnow)}</p>`)}

    <h2>Exercícios de leitura</h2>

    ${exercise(1, 'Leia em voz alta', `
      <p class="ex-task"><span>Pronuncie cada sílaba:</span> ${heList(L.syllables.map(s => s.he), { size: 'word' })}</p>`)}

    ${exercise(2, mixed(['Circule a letra ', H(L.letter)]), `
      <p class="ex-task"><span>Encontre todas as ocorrências:</span> ${heList(circlePool, { size: 'word' })}</p>`)}

    ${exercise(3, 'Ligue corretamente', `
      <p>Ligue cada leitura à palavra hebraica correspondente.</p>
      <p class="ex-task">${shuffled(words.slice(0, 3), rand).map(w => pair(w.translit, w.he)).join(' ')}</p>`)}

    ${gapItems.length ? exercise(4, mixed(['Complete com ', H(L.letter)]), `
      <p>Escreva a letra que falta em cada palavra.</p>
      <p class="ex-task">${gapItems.map(w => clozeFirstLetter(w, L)).join(' ')}</p>`)
      : exercise(4, mixed(['Escreva ', H(L.letter), ' com cada vogal']), `
      <p>Copie a sílaba ao lado do modelo.</p>
      <table>
        <thead><tr><th>Modelo</th><th>Leitura</th><th>Escreva aqui</th></tr></thead>
        <tbody>${L.syllables.map(s => `<tr>
          <td class="he-cell">${he(s.he, { size: 'word' })}</td>
          <td><strong class="kbd">${esc(s.translit)}</strong></td>
          <td class="write-cell"></td></tr>`).join('')}</tbody>
      </table>
      <p class="hint">Nesta primeira letra ainda não existem palavras inteiras para completar — você conhece uma consoante só. As palavras começam já na próxima letra.</p>`)}

    ${exercise(5, 'Leitura de palavras', readable.length
      ? `<p class="ex-task"><span>Leia em voz alta:</span> ${heList(readable.map(w => w.he), { size: 'word' })}</p>`
      : `<p class="ex-task"><span>Leia em voz alta:</span> ${heList(L.syllables.map(s => s.he), { size: 'word' })}</p>`)}

    ${callout('tip', '💡', `<p>Repita cada exercício pelo menos duas vezes. A repetição é a chave da memorização.</p>`)}
  `;
  return sheet(body, 2);
}

/* A word with its first (rightmost) letter removed. Parts are given in
   reading order: blank first, then the rest of the word to its left. */
function clozeFirstLetter(w, L) {
  const chars = [...w.he];
  // drop the leading consonant, keep any pointing that belongs to what remains
  let i = 0;
  if (/[א-ת]/.test(chars[0])) i = 1;
  while (i < chars.length && /[֑-ׇ]/.test(chars[i])) i++;
  const rest = chars.slice(i).join('');
  return `<span class="gap-item">${heCloze([null, rest])} <span class="hint">(${esc(w.pt)})</span></span>`;
}

/* ── P3A · Modelo + ordem dos movimentos ─────────────────────────────────── */
function page3a(L, { bdg, T, name, ctx }) {
  const body = `
    ${bdg('3A')}
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

    <h2>Impressa e cursiva</h2>
    <table>
      <thead><tr><th>Impressa</th><th>Cursiva</th>${L.finalForm ? '<th>Final — impressa</th><th>Final — cursiva</th>' : ''}</tr></thead>
      <tbody><tr>
        <td class="center">${he(L.letter, { size: 'big' })}</td>
        <td class="center">${he(L.letter, { size: 'big', cursive: true })}</td>
        ${L.finalForm ? `<td class="center">${he(L.finalForm, { size: 'big' })}</td>
        <td class="center">${he(L.finalForm, { size: 'big', cursive: true })}</td>` : ''}
      </tr></tbody>
    </table>

    ${callout('tip', '💡', `<p>Visualize o traço completo antes de encostar o lápis no papel.</p>`)}
  `;
  return sheet(body, 3);
}

/* ── P3B · Traçar por cima ───────────────────────────────────────────────── */
function page3b(L, { bdg, T, name }) {
  const glyphs = L.finalForm ? [L.letter, L.letter, L.finalForm] : [L.letter, L.letter, L.letter];
  const rows = glyphs.map((g, i) => `
    <h3>${['③', '④', '⑤'][i]} Linha ${i + 1} — trace por cima</h3>
    <div class="write-rule">
      <div class="write-rule-head">← escreva nesta direção ←</div>
      <div class="write-row">
        ${Array.from({ length: 5 }, () =>
          `<span class="he glyph glyph--trace">${esc(g)}</span>`).join('')}
      </div>
    </div>`).join('\n');

  const body = `
    ${bdg('3B')}
    <h1>${mixed(['Trace por cima — ', H(L.letter), ` `])}<span class="paren">(</span>${esc(name)}<span class="paren">)</span></h1>
    <p class="lead">Trace sobre as letras claras. Siga sempre a direção indicada e repita cada linha com calma.</p>
    ${rows}
    ${callout('tip', '💡', `<p>Trace da direita para a esquerda, em movimento fluido e contínuo.</p>`)}
  `;
  return sheet(body, 4);
}

/* ── P3C · Copiar e escrever sozinho ─────────────────────────────────────── */
function page3c(L, { bdg, T, name, canRead }) {
  const copyRows = Array.from({ length: 4 }, () => `
    <tr>
      <td class="center">${he(L.letter, { size: 'big', cursive: true })}</td>
      <td class="write-cell"></td>
    </tr>`).join('');

  const wordRow = canRead ? `
    <h2>⑦ Copie uma palavra</h2>
    <p>Copie a palavra completa, mantendo o tamanho das letras.</p>
    <table>
      <thead><tr><th>Modelo</th><th>Copie aqui</th></tr></thead>
      <tbody>
        ${L.wordsToRead.slice(0, 2).map(w => `<tr>
          <td class="he-cell">${he(w.he, { size: 'word', cursive: true })} <span class="hint">${esc(w.pt)}</span></td>
          <td class="write-cell"></td></tr>`).join('')}
      </tbody>
    </table>` : '';

  const body = `
    ${bdg('3C')}
    <h1>${mixed(['Copie e escreva sozinho — ', H(L.letter), ` `])}<span class="paren">(</span>${esc(name)}<span class="paren">)</span></h1>

    <h2>⑥ Copie</h2>
    <p>Copie a letra ao lado do modelo em cada linha, mantendo o mesmo tamanho e proporção.</p>
    <table class="copy-table">
      <thead><tr><th>Modelo</th><th>Copie aqui</th></tr></thead>
      <tbody>${copyRows}</tbody>
    </table>

    ${wordRow}

    <h2>⑧ Escreva sozinho</h2>
    <p>${mixed(['Sem modelo. Escreva a letra ', H(L.letter), ' em cursivo nas linhas abaixo, com fluidez.'])}</p>
    <div class="free-lines"><div></div><div></div><div></div><div></div></div>

    ${callout('note', '🌟', `<p>Muito bem. Você completou a prática de escrita da letra ${mixed([H(L.letter), ` (${esc(name)})`])} — a fluência vem com a repetição.</p>`)}
  `;
  return sheet(body, 5);
}

/* ── P4 · Praticando a leitura ───────────────────────────────────────────── */
function page4(L, { bdg, T, name, rand, canRead }) {
  const words = L.wordsToRecognize || [];
  const gallery = words.slice(0, 4).map(w => `
    <figure>
      <div class="well" aria-hidden="true">imagem</div>
      ${he(w.he, { size: 'word' })}
      <figcaption>${esc(w.translit)} — ${esc(w.pt)}</figcaption>
    </figure>`).join('');

  /* Atividade 2 — pick the right reading of a syllable. Distractors come from
     the letter's own syllable set, so every option is plausible. */
  const a2 = L.syllables.slice(0, 4).map(s => {
    const others = L.syllables.filter(x => x.translit !== s.translit);
    const opts = shuffled([s.translit, ...shuffled(others, rand).slice(0, 2).map(x => x.translit)], rand);
    return `<tr>
      <td class="he-cell">${he(s.he, { size: 'word' })}</td>
      ${opts.map(o => `<td>( ) ${esc(o)}</td>`).join('')}
    </tr>`;
  }).join('');

  /* Atividade 4 — one letter differs. Rows are built right-to-left. */
  const a4 = [0, 1, 2].map(i => {
    const d = distractorLetters(L, rand, 1)[0];
    const row = Array.from({ length: 5 }, () => L.letter);
    row[Math.floor(rand() * 5)] = d;
    return `<div class="find-row">
      <h4>Linha ${i + 1}</h4>
      ${heList(row, { size: 'word' })}
    </div>`;
  }).join('');

  const gap = gapSource(L);
  const a3 = `
       <p>${mixed(['Insira a letra ', H(L.letter), ' no espaço correto para completar cada palavra.'])}</p>
       ${gap.recognition ? `<p class="hint">Você ainda não lê estas palavras inteiras — nesta atividade basta reconhecer onde a letra entra.</p>` : ''}
       <table>
         <thead><tr><th>Palavra incompleta</th><th>Significado</th><th>Palavra completa</th></tr></thead>
         <tbody>${gap.items.map(w => `<tr>
           <td class="he-cell">${heCloze([null, dropFirst(w.he)])}</td>
           <td>${esc(w.pt)}</td>
           <td class="write-cell"></td></tr>`).join('')}</tbody>
       </table>`;

  const finalEx = L.finalForm ? `
    <h2>Atividade 5 — a forma final</h2>
    <p>${mixed(['A letra ', H(L.letter), ' muda de forma no fim da palavra: vira ', H(L.finalForm),
        '. É a mesma letra e o mesmo som — só o desenho muda. Circule apenas as formas finais:'])}</p>
    <p class="ex-task">${heList(
      shuffled([L.finalForm, L.letter, L.letter, L.finalForm, L.letter, L.finalForm], rand),
      { size: 'word' })}</p>` : '';

  const body = `
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
    </table>

    <h2>Atividade 3 — complete</h2>
    ${a3}

    <h2>Atividade 4 — encontre a letra diferente</h2>
    <p>Em cada linha, uma letra é diferente das outras. Circule-a.</p>
    <div class="find-grid">${a4}</div>

    ${finalEx}
  `;
  return sheet(body, 6);
}

function dropFirst(word) {
  const chars = [...word];
  let i = /[א-ת]/.test(chars[0]) ? 1 : 0;
  while (i < chars.length && /[֑-ׇ]/.test(chars[i])) i++;
  return chars.slice(i).join('');
}

/* A gap exercise needs something still visible beside the blank.
   Gapping a SYLLABLE leaves only a combining mark, which renders as nothing at
   all — and U+25CC, the usual carrier for showing a lone mark, is not in the
   Hebrew subsets we ship, so it cannot rescue it either. The row comes out
   blank and the exercise is unanswerable.

   So: gap words the learner can read when there are any, and otherwise fall
   back to the recognition vocabulary, clearly labelled as such. Finding where
   מ goes inside מַיִם is a legitimate task at letter 1 — the learner is
   matching a shape, not reading the word, which is exactly what
   wordsToRecognize is for. */
function gapSource(L) {
  const read = L.wordsToRead || [];
  if (read.length) return { items: read.slice(0, 4), recognition: false };
  return { items: (L.wordsToRecognize || []).slice(0, 4), recognition: true };
}

/* ── P5 · Fixação + ditado ───────────────────────────────────────────────── */
function page5(L, { bdg, T, name, rand, canRead }) {
  const pool = canRead ? L.wordsToRead : [];
  const recog = L.wordsToRecognize || [];

  const a1 = gapSource(L).items
    .map(w => `<tr>
      <td class="he-cell">${heCloze([null, dropFirst(w.he)])}</td>
      <td>${esc(w.pt)}</td>
      <td class="write-cell"></td>
    </tr>`).join('');

  const linkItems = shuffled(recog.slice(0, 4), rand);
  const a2 = `
    <div class="cols-2">
      <div>
        ${recog.slice(0, 4).map(w => `<p class="link-left"><span class="well-sm" aria-hidden="true"></span> ${esc(w.pt)}</p>`).join('')}
      </div>
      <div class="link-right">
        <h4>Palavras</h4>
        ${linkItems.map(w => `<p>${he(w.he, { size: 'word' })}</p>`).join('')}
      </div>
    </div>`;

  const a3 = (pool.length ? pool : recog).slice(0, 3).map(w => `<tr>
      <td>${esc(w.translit || '')} <span class="hint">${esc(w.pt)}</span></td>
      <td class="write-cell"></td>
    </tr>`).join('');

  const body = `
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
    ${a2}

    <h2>Atividade 3 — escreva em hebraico cursivo</h2>
    <table>
      <thead><tr><th>Leitura</th><th>Escreva em cursivo</th></tr></thead>
      <tbody>${a3}</tbody>
    </table>

    <h2>🎯 Ditado</h2>
    <p>Peça a alguém para ler as palavras em voz alta e escreva o que ouvir. Se estiver estudando sozinho, grave a si mesmo e escute depois.</p>
    <div class="dict-lines"><div>1.</div><div>2.</div><div>3.</div></div>

    ${callout('note', '🌟', `<p><strong>Parabéns.</strong> Você concluiu o estudo da letra ${mixed([H(L.letter), ` (${esc(name)})`])} — continue praticando.</p>`)}
  `;
  return sheet(body, 7);
}

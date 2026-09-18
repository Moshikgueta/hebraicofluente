/* Roteiro de gravação — the studio deliverable.
   Printed and handed to the speaker: every clip in reading order, Hebrew large
   and pointed, with the reading, the meaning and the filename the take must
   end up as. Generated from data/audio.json, so it cannot drift from what the
   workbook actually asks for. */

import { he, esc, mixed, H } from '../scripts/lib/render.js';
import { badge, callout, chunk } from './partials.js';

export function renderAudioScript(ctx) {
  const A = ctx.audio;
  if (!A) return [];
  const sheets = [];

  const brief = `
    ${badge('Roteiro de gravação')}
    <h1>Áudio do workbook — roteiro de gravação</h1>
    <p class="lead">${A.total} clipes. Estimativa: cerca de duas horas de estúdio com três tomadas por item, mais edição.</p>

    <h2>Quem grava</h2>
    <p>Um único falante nativo de hebraico israelense, adulto, do começo ao fim. Trocar de voz no meio do alfabeto é a coisa que mais desorienta quem está aprendendo a associar letra e som.</p>

    <h2>Como ler</h2>
    <ul class="ticks">
      <li><strong>Devagar e neutro.</strong> Isto é material de alfabetização, não locução publicitária. Sem entonação expressiva.</li>
      <li><strong>Respeite o nikud.</strong> Cada item vem pontuado e a pontuação é a razão de ele existir: ${mixed([H('שָׁם'), ' e ', H('שֵׁם')])} são palavras diferentes.</li>
      <li><strong>Uma palavra por arquivo</strong>, sem "a palavra é…" antes nem pausa longa depois.</li>
      <li><strong>Três tomadas de cada</strong>, seguidas. A edição escolhe uma.</li>
      <li><strong>Sílabas isoladas</strong> (${mixed([H('מַ'), ' · ', H('מֶ')])}) são ditas como sílaba, não soletradas.</li>
    </ul>

    <h2>Técnico</h2>
    <ul class="ticks">
      <li>Mono, 48 kHz, WAV na captura; entrega em MP3 128 kbps mono.</li>
      <li>Silêncio aparado para ~150 ms antes e depois. Sem normalização agressiva nem compressão pesada.</li>
      <li>Ruído de fundo inaudível: o mesmo cômodo e a mesma distância de microfone do começo ao fim.</li>
    </ul>

    ${callout('warn', '⚠️', `
      <h3>Nomes de arquivo</h3>
      <p>Cada linha traz o nome final do arquivo. Eles <strong>não</strong> seguem a numeração: o número serve para o locutor se situar e pode mudar se o conteúdo do livro mudar, enquanto o nome do arquivo vem do próprio hebraico e nunca muda.</p>
      <p>Grave na ordem, nomeie na edição. Depois é só colocar tudo em <code>assets/audio/</code> e rodar <code>npm run check-audio</code>, que diz o que chegou e o que falta.</p>`)}`;

  sheets.push(brief);

  /* 16 rows to a sheet keeps the Hebrew large enough to read from a stand. */
  chunk(A.clips, 16).forEach((g, gi, all) => {
    sheets.push(`
    ${badge(`Roteiro · ${gi + 1} de ${all.length}`)}
    <h1>Clipes ${g[0].num}–${g[g.length - 1].num}</h1>
    <table class="script-table">
      <thead><tr><th>Nº</th><th>Hebraico</th><th>Leitura</th><th>Significado</th><th>Arquivo</th></tr></thead>
      <tbody>${g.map(c => `<tr>
        <td class="center"><strong class="kbd">${c.num}</strong></td>
        <td class="he-cell">${he(c.he, { size: 'word' })}</td>
        <td>${c.translit ? `<strong class="kbd">${esc(c.translit)}</strong>` : '<span class="hint">—</span>'}</td>
        <td>${esc(c.gloss)}</td>
        <td><code class="file">${esc(c.file)}</code></td>
      </tr>`).join('')}</tbody>
    </table>`);
  });

  return sheets;
}

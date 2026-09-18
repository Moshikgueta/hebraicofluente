/* audio-script.mjs — the studio deliverable.
 *
 *   npm run audio-script   →   audio/roteiro-de-gravacao.html
 *
 * What a speaker actually needs in front of them, on paper: the voice brief,
 * the technical brief, and every clip numbered, with the pointed Hebrew large
 * enough to read at arm's length, the transliteration as a safety net, and the
 * exact filename the take has to end up as.
 *
 * Two things here are load-bearing:
 *
 *   · The Hebrew goes through `he()` — the same direction contract as the book
 *     and the app. A recording script is the worst place to discover a bidi bug:
 *     the speaker would read a reordered word and nobody in the room would know.
 *   · The filename is printed on every row. The whole ingestion pipeline is
 *     "name the file this", and if that column is missing the session produces
 *     311 takes that have to be matched to words by ear afterwards.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { he, esc } from '../scripts/lib/render.js';

const ROOT = new URL('..', import.meta.url).pathname;
const readJson = p => JSON.parse(readFileSync(join(ROOT, p), 'utf8'));

/* Seconds of session time per clip, including the gap, the breath and the
   occasional second take. Measured against word-list sessions, not guessed at
   from the length of the words. */
const SECONDS_PER_CLIP = 15;

const mins = n => Math.round((n * SECONDS_PER_CLIP) / 60);

function main() {
  const audio = readJson('data/audio.json');
  const clips = audio.clips;

  const waveRows = w => clips.filter(c => c.wave === w).map(c => `
    <tr>
      <td class="num">${c.num}</td>
      <td class="he-cell">${he(c.he, { size: 'word' })}</td>
      <td class="tr">${c.translit ? `<strong>${esc(c.translit)}</strong>` : '<span class="dim">—</span>'}</td>
      <td class="gloss">${esc(c.gloss)}</td>
      <td class="where">${esc(c.where.join(' · '))}</td>
      <td class="file"><code>${esc(c.file)}</code></td>
      <td class="take"></td>
    </tr>`).join('\n');

  const waveSection = w => `
  <section class="sheet">
    <h2>Onda ${w.id} — ${esc(w.titlePt)}</h2>
    <p class="lead">${esc(w.notePt)}</p>
    <p class="meta"><strong>${w.count}</strong> clipes · cerca de <strong>${mins(w.count)} min</strong> de sessão</p>
    <table>
      <thead>
        <tr>
          <th>Nº</th><th>Hebraico</th><th>Leitura</th><th>Significado</th>
          <th>Onde aparece</th><th>Nome do arquivo</th><th>✓</th>
        </tr>
      </thead>
      <tbody>${waveRows(w.id)}</tbody>
    </table>
  </section>`;

  const total = clips.length;

  const html = `<!DOCTYPE html>
<html lang="pt-BR" dir="ltr">
<head>
<meta charset="utf-8">
<title>Roteiro de gravacao — Hebraico Fluente</title>
<style>
  @font-face { font-family: 'Noto Sans Hebrew'; src: url('../assets/fonts/noto-sans-hebrew-hebrew-400-normal.woff2') format('woff2'); font-weight: 400; }
  @font-face { font-family: 'Noto Sans Hebrew'; src: url('../assets/fonts/noto-sans-hebrew-hebrew-700-normal.woff2') format('woff2'); font-weight: 700; }
  @font-face { font-family: 'Inter'; src: url('../assets/fonts/inter-latin-400-normal.woff2') format('woff2'); font-weight: 400; }
  @font-face { font-family: 'Inter'; src: url('../assets/fonts/inter-latin-700-normal.woff2') format('woff2'); font-weight: 700; }
  @font-face { font-family: 'DM Sans'; src: url('../assets/fonts/dm-sans-latin-700-normal.woff2') format('woff2'); font-weight: 700; }

  @page { size: A4; margin: 14mm 12mm; }
  * { box-sizing: border-box; }
  body { font: 400 11px/1.5 'Inter', system-ui, sans-serif; color: #1a1a1a; margin: 0; background: #fff; }
  h1 { font: 700 26px/1.2 'DM Sans', sans-serif; margin: 0 0 6px; }
  h2 { font: 700 17px/1.25 'DM Sans', sans-serif; margin: 0 0 4px; }
  h3 { font: 700 12px/1.3 'DM Sans', sans-serif; margin: 16px 0 6px; text-transform: uppercase; letter-spacing: .06em; color: #15788F; }
  .lead { color: #4a4a4a; margin: 0 0 6px; max-width: 62ch; }
  .meta { color: #6a6a6a; margin: 0 0 12px; }
  .sheet { break-before: page; }
  .sheet:first-of-type { break-before: auto; }

  /* THE DIRECTION CONTRACT. Same rule as the book and the app: every Hebrew run
     is its own bidi isolate, so a neutral character outside it cannot be pulled
     in and reorder the word the speaker is about to read aloud. */
  .he { font-family: 'Noto Sans Hebrew', sans-serif; direction: rtl; unicode-bidi: isolate;
        font-feature-settings: 'ccmp' 1, 'mark' 1, 'mkmk' 1; }
  .he--word { font-size: 26px; line-height: 1.5; }

  table { width: 100%; border-collapse: collapse; }
  thead { display: table-header-group; }
  th { text-align: left; font: 700 9px/1.2 'Inter', sans-serif; text-transform: uppercase;
       letter-spacing: .07em; color: #fff; background: #15788F; padding: 6px 7px; }
  td { padding: 5px 7px; border-bottom: .5pt solid rgba(0,0,0,.12); vertical-align: middle; }
  tr { break-inside: avoid; }
  .num { font-variant-numeric: tabular-nums; color: #6a6a6a; width: 34px; }
  .he-cell { width: 120px; }
  .tr { width: 88px; color: #15788F; }
  .gloss { color: #333; }
  .where { color: #6a6a6a; font-size: 10px; width: 92px; }
  .file { width: 128px; }
  code { font: 400 9.5px/1 ui-monospace, monospace; color: #555; }
  .take { width: 24px; border: .5pt solid rgba(0,0,0,.25); }
  .dim { color: #aaa; }

  .brief { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-top: 14px; }
  .box { border: .5pt solid rgba(0,0,0,.18); border-radius: 6px; padding: 12px 14px; }
  .box ul { margin: 0; padding-left: 16px; }
  .box li { margin: 3px 0; }
  .warn { background: #FDF4E3; border-color: #E0C68A; }
  .plan td, .plan th { font-size: 10.5px; }
</style>
</head>
<body>

<section class="sheet">
  <h1>Roteiro de gravação</h1>
  <p class="lead">Hebraico Fluente — curso de alfabetização. <strong>${total} clipes</strong>,
     divididos em três ondas. Estimativa total: cerca de <strong>${mins(total)} minutos</strong>
     de sessão, sem contar montagem e pausas.</p>

  <div class="brief">
    <div class="box">
      <h3>A voz</h3>
      <ul>
        <li>Hebraico <strong>israelense moderno</strong>, falante nativo.</li>
        <li>Sotaque neutro de Israel central. Sem pronúncia litúrgica ou ashkenazi.</li>
        <li>Adulto, tom calmo e claro — é material de alfabetização para adultos,
            não locução publicitária e não voz infantil.</li>
        <li>Ritmo <strong>pausado</strong>: cada clipe é ouvido por quem ainda não
            distingue os sons. Uma palavra por clipe, sem frase em volta.</li>
        <li>Sem entonação de pergunta no fim. Palavra isolada, entonação plana e final descendente.</li>
        <li>O mesmo falante nas três ondas. Trocar de voz no meio do curso é
            perceptível e atrapalha.</li>
      </ul>
    </div>
    <div class="box">
      <h3>O técnico</h3>
      <ul>
        <li><strong>WAV 48 kHz / 24 bits</strong>, mono. A conversão para MP3 é nossa.</li>
        <li><strong>Sem processamento</strong>: nada de compressão, de-esser, EQ,
            normalização ou redução de ruído. Cru.</li>
        <li>Um arquivo por clipe, nomeado exatamente como a coluna
            <em>Nome do arquivo</em>, trocando <code>.mp3</code> por <code>.wav</code>.</li>
        <li>Deixe <strong>0,3 s de silêncio</strong> antes e depois de cada palavra.</li>
        <li>Grave <strong>30 s de ruído de sala</strong> no começo da sessão e entregue
            como <code>room-tone.wav</code>.</li>
        <li>Se houver segunda tomada, entregue só a escolhida.</li>
      </ul>
    </div>
  </div>

  <div class="box warn" style="margin-top:14px">
    <h3 style="color:#9A6B15">Duas coisas que decidem a qualidade do curso</h3>
    <p style="margin:0 0 6px"><strong>1. O nikud manda.</strong> Cada palavra está
       escrita com os sinais de vogal, e é essa a pronúncia que queremos — não a
       pronúncia corrente se ela divergir. Duas palavras deste roteiro têm as
       mesmas consoantes e vogais diferentes; elas são clipes diferentes de
       propósito.</p>
    <p style="margin:0"><strong>2. As sílabas são o coração.</strong> A onda 1 tem 136
       sílabas soltas. Elas soam estranhas de ler em voz alta, e é normal: o aluno
       está aprendendo que <em>esta letra com este sinal faz este som</em>. Leia cada
       uma como sílaba isolada, sem transformar em palavra e sem alongar.</p>
  </div>

  <h3>O plano</h3>
  <table class="plan">
    <thead><tr><th>Onda</th><th>Conteúdo</th><th>Clipes</th><th>Sessão</th><th>O que destrava</th></tr></thead>
    <tbody>
      ${audio.waves.map(w => `<tr>
        <td class="num">${w.id}</td>
        <td><strong>${esc(w.titlePt)}</strong></td>
        <td class="num">${w.count}</td>
        <td class="num">~${mins(w.count)} min</td>
        <td class="gloss">${esc(w.notePt)}</td>
      </tr>`).join('')}
    </tbody>
  </table>

  <h3>Depois da sessão</h3>
  <p class="lead">Coloque os arquivos convertidos em <code>audio/</code> na raiz do
     repositório e rode <code>npm run check-audio</code>. Ele diz o que chegou, o que
     falta, e se algum arquivo tem nome que não corresponde a clipe nenhum. Nada
     mais precisa ser editado: o app passa a tocar os clipes que existirem.</p>
</section>

${audio.waves.map(waveSection).join('\n')}

</body>
</html>`;

  mkdirSync(join(ROOT, 'audio'), { recursive: true });
  writeFileSync(join(ROOT, 'audio/roteiro-de-gravacao.html'), html);
  console.log(`\n  roteiro com ${total} clipes → audio/roteiro-de-gravacao.html`);
  console.log(`  estimativa: ~${mins(total)} min de sessão`);
  audio.waves.forEach(w => console.log(`    onda ${w.id} · ${w.count} clipes · ~${mins(w.count)} min`));
  console.log('');
}

main();

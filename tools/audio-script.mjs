/* audio-script.mjs - the studio deliverable.
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
 *   · The Hebrew goes through `he()` - the same direction contract as the book
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


/* Uma frase ou linha de texto (onda 4) tem vírgula e ponto, que o `he()` recusa
   com razão: dentro de uma frase em português, pontuação ao lado do hebraico
   troca de lugar. Aqui a linha fica sozinha na célula, então vai inteira num
   bloco isolado da direita para a esquerda, onde a pontuação fica onde está. */
const heDoClipe = c => c.kind === 'frase'
  ? `<bdi class="he he--word" lang="he" dir="rtl">${esc(c.he)}</bdi>`
  : he(c.he, { size: 'word' });

function main() {
  const audio = readJson('data/audio.json');
  const clips = audio.clips;

  const silabas = clips.filter(c => c.wave === 1 && c.kind === 'silaba').length;

  /* NA ORDEM DOS NÚMEROS, que é a ordem em que cortar-audio.mjs nomeia os
     pedaços (`alvo.sort((a, b) => a.num - b.num)`). O roteiro imprimia na
     ordem do curso, e um clipe novo recebe o próximo número livre: o da
     girafa, nº 322, saía entre o 312 e o 314. O locutor leria nessa ordem, e
     o corte daria a cada pedaço dali em diante o nome da palavra vizinha -
     sem aviso, porque a contagem bate. */
  const daOnda = w => clips.filter(c => c.wave === w).sort((a, b) => a.num - b.num);

  /* Blocos de até BLOCO clipes: cada um é um arquivo, e um erro no meio custa
     regravar só aquele bloco. A linha do bloco já traz o nome do arquivo e o
     comando que o corta. */
  const BLOCO = 40;
  const pad = n => String(n).padStart(3, '0');
  const cabecaDeBloco = (w, bloco) => {
    const de = bloco[0].num, ate = bloco[bloco.length - 1].num;
    const arquivo = `onda${w}_${pad(de)}-${pad(ate)}.wav`;
    return `
    <tr class="bloco"><td colspan="7">
      <strong>Bloco: nº ${de} a ${ate}</strong> (${bloco.length} clipes) · grave como
      <code>${arquivo}</code> · corte com
      <code>npm run cortar-audio -- --onda ${w} --de ${de} --ate ${ate} ${arquivo}</code>
    </td></tr>`;
  };

  const linha = c => `
    <tr>
      <td class="num">${c.num}</td>
      <td class="he-cell">${heDoClipe(c)}</td>
      <td class="tr">${c.translit ? `<strong>${esc(c.translit)}</strong>` : '<span class="dim">-</span>'}</td>
      <td class="gloss">${esc(c.gloss)}</td>
      <td class="where">${esc(c.where.join(' · '))}</td>
      <td class="file"><code>${esc(c.file)}</code></td>
      <td class="take"></td>
    </tr>`;

  const waveRows = w => {
    const lista = daOnda(w);
    const partes = [];
    for (let i = 0; i < lista.length; i += BLOCO) {
      const bloco = lista.slice(i, i + BLOCO);
      partes.push(cabecaDeBloco(w, bloco), ...bloco.map(linha));
    }
    return partes.join('\n');
  };

  const waveSection = w => `
  <section class="sheet">
    <h2>Onda ${w.id} - ${esc(w.titlePt)}</h2>
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
<title>Roteiro de gravacao - Hebraico Fluente</title>
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
  <p class="lead">Hebraico Fluente - curso de alfabetização. <strong>${total} clipes</strong>,
     divididos em três ondas. Estimativa total: cerca de <strong>${mins(total)} minutos</strong>
     de sessão, sem contar montagem e pausas.</p>

  <div class="brief">
    <div class="box">
      <h3>A voz</h3>
      <ul>
        <li>Hebraico <strong>israelense moderno</strong>, falante nativo.</li>
        <li>Sotaque neutro de Israel central. Sem pronúncia litúrgica ou ashkenazi.</li>
        <li>Adulto, tom calmo e claro - é material de alfabetização para adultos,
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
        <li><strong>WAV</strong>, mono, 48 kHz (44,1 kHz também serve). A conversão para MP3 é nossa.</li>
        <li><strong>Sem processamento</strong>: nada de compressão, de-esser, EQ,
            normalização ou redução de ruído. Cru.</li>
        <li><strong>Não é um arquivo por palavra.</strong> Grave em <strong>blocos de até 40
            clipes</strong>, lendo de cima para baixo na ordem dos números, num arquivo
            contínuo por bloco. O corte e os nomes são automáticos.</li>
        <li>Comece cada bloco com <strong>3 segundos de silêncio</strong>, e deixe
            <strong>1 segundo de silêncio</strong> entre um clipe e o próximo. É por esse
            silêncio que a gravação é cortada.</li>
        <li>Nomeie cada bloco pela onda e pelos números: <code>onda1_001-040.wav</code>.</li>
        <li><strong>Errou, tossiu ou repetiu?</strong> Pare, apague aquele bloco e grave o
            bloco de novo. Uma palavra a mais ou a menos desalinha o resto do bloco.</li>
        <li>Grave <strong>30 s de silêncio da sala</strong> no começo, sem falar, e entregue
            como <code>room-tone.wav</code>. É o que a limpeza do ruído usa de referência.</li>
      </ul>
    </div>
  </div>

  <div class="box warn" style="margin-top:14px">
    <h3 style="color:#9A6B15">Duas coisas que decidem a qualidade do curso</h3>
    <p style="margin:0 0 6px"><strong>1. O nikud manda.</strong> Cada palavra está
       escrita com os sinais de vogal, e é essa a pronúncia que queremos - não a
       pronúncia corrente se ela divergir. Duas palavras deste roteiro têm as
       mesmas consoantes e vogais diferentes; elas são clipes diferentes de
       propósito.</p>
    <p style="margin:0"><strong>2. As sílabas são o coração.</strong> A onda 1 tem ${silabas}
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
  <p class="lead">Cada bloco passa por <code>npm run cortar-audio -- --onda 1 --de 1 --ate 40
     onda1_001-040.wav</code>, que corta nos silêncios, limpa, iguala o volume e dá a
     cada pedaço o nome certo. O corte só grava os arquivos se a contagem bater
     exatamente com o bloco, e gera <code>audio/conferir/conferencia.html</code>, que toca
     cada pedaço ao lado da palavra: ouvir algumas linhas dela prova que nada saiu
     desalinhado. No fim, <code>npm run check-audio</code> diz o que chegou e o que falta.
     Nada mais precisa ser editado: o app passa a tocar os clipes que existirem.</p>
</section>

${audio.waves.map(waveSection).join('\n')}

</body>
</html>`;

  mkdirSync(join(ROOT, 'audio'), { recursive: true });
  writeFileSync(join(ROOT, 'audio/roteiro-de-gravacao.html'), html);

  /* ── o roteiro POR LETRA ────────────────────────────────────────────────
     Para gravar no celular, sem estúdio: um arquivo por letra, com tudo o
     que aquela letra tem (o nome, as sílabas, as palavras de leitura), mais
     três arquivos avulsos (sinais de vogal, módulo 7, no mundo real). Uma
     letra que sai errada é refeita sozinha, e cada arquivo é curto o bastante
     para gravar de uma vez. A ordem de cada seção é a ordem dos números, que
     é a ordem em que `cortar-audio --letra N --onda todas` nomeia os pedaços. */
  const letras = readJson('data/letters.json').slice().sort((a, b) => a.order - b.order);
  /* O A1 (onda 6) grava por unidade: as palavras, o diálogo, a leitura e a
     escuta de uma unidade vão num arquivo só. */
  const grupoDe = c => {
    const ws = c.where || [];
    const letra = ws.find(w => /^letra \d+$/.test(w));
    if (letra) return letra;
    const a1 = ws.map(w => (w.match(/^a1 unidade \d+/) || [])[0]).find(Boolean);
    return a1 || ws[0] || '';
  };
  const doGrupo = g => clips.filter(c => grupoDe(c) === g).sort((a, b) => a.num - b.num);
  const pad2 = n => String(n).padStart(2, '0');
  /* Um arquivo por mini-texto, na ordem dos módulos. */
  const textosDoRoteiro = [...new Set(clips.map(grupoDe).filter(g => /^(texto|leitura de revisão) do módulo \d+$/.test(g)))]
    .sort((a, b) => Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0]) || a.localeCompare(b));
  const linhaSimples = (c, i) => `
    <tr>
      <td class="num">${i + 1}</td>
      <td class="he-cell">${heDoClipe(c)}</td>
      <td class="tr">${c.translit ? `<strong>${esc(c.translit)}</strong>` : '<span class="dim">-</span>'}</td>
      <td class="gloss">${esc(c.gloss)}</td>
      <td class="take"></td>
    </tr>`;
  const secao = (titulo, lista, arquivo, comando) => `
  <section class="sheet letra">
    <h2>${titulo}</h2>
    <p class="meta"><strong>${lista.length}</strong> itens · grave como <code>${esc(arquivo)}</code>
       · depois: <code>${esc(comando)}</code></p>
    <table>
      <thead><tr><th>#</th><th>Hebraico</th><th>Leitura</th><th>Significado</th><th>✓</th></tr></thead>
      <tbody>${lista.map(linhaSimples).join('')}</tbody>
    </table>
  </section>`;

  const secoes = [
    ...letras.map(L => {
      const lista = doGrupo(`letra ${L.order}`);
      const arquivo = `letra-${pad2(L.order)}.m4a`;
      return secao(`Letra ${L.order} · ${esc(L.namePt)} ${he(L.letter, { size: 'word' })}`, lista, arquivo,
        `npm run cortar-audio -- --letra ${L.order} --onda todas ${arquivo}`);
    }),
    secao('Sinais de vogal', doGrupo('sinais de vogal'), 'vogais.m4a',
      'npm run cortar-audio -- --vogais --onda todas vogais.m4a'),
    secao('Módulo 7 · os sons com guéresh', doGrupo('módulo 7'), 'modulo-7.m4a',
      'npm run cortar-audio -- --grupo "módulo 7" --onda todas modulo-7.m4a'),
    secao('No mundo real', doGrupo('no mundo real'), 'mundo-real.m4a',
      'npm run cortar-audio -- --grupo "no mundo real" --onda todas mundo-real.m4a'),
    /* Onda 4. Frase é dita no ritmo da fala, sem pausa entre as palavras - a
       pausa de 1 segundo é só ENTRE uma frase e a próxima, como nos outros. */
    secao('Frases · no ritmo da fala, com 2 segundos de pausa entre uma frase e outra', doGrupo('frases'), 'frases.m4a',
      'npm run cortar-audio -- --grupo "frases" --onda todas frases.m4a'),
    ...textosDoRoteiro.map(g => secao(`Mini-texto · ${esc(g.replace('texto do ', ''))} · uma linha por vez, com 2 segundos de pausa entre as linhas`,
      doGrupo(g), `${g.replace(/ /g, '-').replace('ó', 'o')}.m4a`,
      `npm run cortar-audio -- --grupo "${g}" --onda todas ${g.replace(/ /g, '-').replace('ó', 'o')}.m4a`))
  ];
  /* Todo grupo que não tem seção própria acima (as leituras bônus, as
     unidades do A1 e o que vier depois) ganha a sua, na ordem dos números:
     o roteiro cobre o manifesto inteiro, e o teste abaixo continua valendo. */
  const jaTem = new Set([...letras.map(L => `letra ${L.order}`), 'sinais de vogal', 'módulo 7', 'no mundo real', 'frases', ...textosDoRoteiro]);
  const outros = [...new Set(clips.map(grupoDe))].filter(g => g && !jaTem.has(g))
    .sort((a, b) => doGrupo(a)[0].num - doGrupo(b)[0].num);
  const arquivoDe = g => `${g.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase()}.m4a`;
  for (const g of outros) {
    secoes.push(secao(esc(g.replace(/^a1 unidade/, 'Hebraico A1 · Unidade')), doGrupo(g), arquivoDe(g),
      `npm run cortar-audio -- --grupo "${g}" --onda todas ${arquivoDe(g)}`));
  }
  const cobertos = outros.reduce((n, g) => n + doGrupo(g).length, 0) + letras.reduce((n, L) => n + doGrupo(`letra ${L.order}`).length, 0)
    + ['sinais de vogal', 'módulo 7', 'no mundo real', 'frases', ...textosDoRoteiro]
      .reduce((n, g) => n + doGrupo(g).length, 0);
  if (cobertos !== total) {
    throw new Error(`roteiro por letra cobre ${cobertos} de ${total} clipes: um grupo novo apareceu no manifesto`);
  }

  const cabeca = html.slice(0, html.indexOf('</head>'))
    .replace('<title>Roteiro de gravacao - Hebraico Fluente</title>', '<title>Roteiro por letra - Hebraico Fluente</title>');
  const porLetra = `${cabeca}
<style>
  section.letra { break-before: auto; margin-bottom: 18px; }
  section.letra + section.letra { break-before: auto; }
</style>
</head>
<body>
<section class="sheet">
  <h1>Roteiro de gravação por letra</h1>
  <p class="lead">${total} clipes em ${secoes.length} arquivos: um por letra (o nome da letra, as
     sílabas e as palavras daquela letra) e três avulsos no fim. Grave cada seção num
     arquivo só, de cima para baixo, com <strong>3 segundos de silêncio no começo</strong> e
     <strong>1 segundo entre um item e o próximo</strong>. Errou, tossiu ou repetiu? Apague o
     arquivo daquela letra e grave a letra de novo: uma palavra a mais ou a menos desalinha
     o resto do arquivo.</p>
  <p class="lead">Grave antes, uma vez, <strong>30 segundos de silêncio da sala</strong> sem falar,
     e envie como <code>room-tone.m4a</code>. O nikud manda: leia cada item como está pontuado,
     e as sílabas como sílabas soltas, sem virar palavra.</p>
</section>
${secoes.join('\n')}
</body>
</html>`;
  writeFileSync(join(ROOT, 'audio/roteiro-por-letra.html'), porLetra);
  console.log(`  roteiro por letra: ${secoes.length} arquivos → audio/roteiro-por-letra.html`);
  console.log(`\n  roteiro com ${total} clipes → audio/roteiro-de-gravacao.html`);
  console.log(`  estimativa: ~${mins(total)} min de sessão`);
  audio.waves.forEach(w => console.log(`    onda ${w.id} · ${w.count} clipes · ~${mins(w.count)} min`));
  console.log('');
}

main();

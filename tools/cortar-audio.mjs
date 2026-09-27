/* cortar-audio.mjs - one long take in, 168 named clips out.
 *
 *   npm run cortar-audio -- --onda 1 gravacao.wav
 *   npm run cortar-audio -- --ensaiar          (proves the whole chain offline)
 *
 * The problem this solves is not editing. It is NAMING.
 * ─────────────────────────────────────────────────────────────────────────
 * Every clip is named after a hash of its pointed Hebrew (`he-3c3ac3e3.mp3`),
 * which is what keeps a recording valid when the course changes order. The
 * cost of that is that nobody can name 168 takes by hand without a mistake,
 * and a mistake here is invisible: `check-audio` reports UNKNOWN for a file
 * whose name matches no clip, but a file named after the WRONG clip is
 * reported as present, and the course teaches one letter with another
 * letter's sound until a learner notices.
 *
 * So the speaker records ONE continuous file, reading the script top to
 * bottom, and this tool cuts on the silences and names the pieces in order.
 * Position is the only thing that has to be right, and position is the one
 * thing a person reading down a printed page gets right.
 *
 * THE ALIGNMENT IS CHECKED, NEVER ASSUMED
 * ─────────────────────────────────────────────────────────────────────────
 * If the take has 167 segments and the wave wants 168, every clip from the
 * gap onwards is named after its neighbour. That is the failure that ruins a
 * session, and it is silent. Three things stand against it:
 *
 *   1. the count must match exactly, or nothing is written under a real name;
 *   2. `conferir/NNN-<translit>.mp3` is written anyway, numbered by position,
 *      so a mismatch can be inspected instead of re-recorded;
 *   3. `conferir/conferencia.html` plays every segment beside the Hebrew it
 *      was matched to. Listening to eight rows of that page is the only
 *      proof that the alignment is right, and it takes a minute.
 *
 * THE CLEANUP, AND WHAT IS DELIBERATELY NOT IN IT
 * ─────────────────────────────────────────────────────────────────────────
 * High-pass at 80 Hz (rumble, air conditioning, plosive thump), gentle
 * denoise measured against the room tone, edges trimmed to a fixed pad, 10 ms
 * fades so no clip starts with a click, and one gain per clip so all 168 sit
 * at the same loudness. Uneven loudness across a word list is the single
 * thing that makes a home recording sound like a home recording.
 *
 * What is NOT here, on purpose: no de-esser and no compressor. This course
 * teaches ש, ס, צ and ת by their sound; a de-esser dulls exactly the band
 * that distinguishes them, and a compressor flattens the difference between
 * a stressed and an unstressed syllable. The recording is one voice saying
 * isolated words in a quiet room - it has no dynamics problem to solve.
 */

import { execFileSync, spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync, readdirSync, statSync } from 'node:fs';
import { join, basename } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const DROP = join(ROOT, 'audio');
const CONF = join(DROP, 'conferir');

/* ── the cut ─────────────────────────────────────────────────────────────
   A silence has to be longer than this to count as a gap between clips. The
   speaker is told to leave a second; half of that is the floor, which leaves
   room for someone who rushes without turning a breath inside a word into a
   cut. */
let GAP_MIN_S = 0.45;

/* A segment shorter than this is a cough, a page turn or a chair. Hebrew
   letter names are the longest thing in wave 1 and none is near this short. */
const SEG_MIN_S = 0.12;

/* ── the pads ───────────────────────────────────────────────────────────
   Trimmed edges plus a fixed pad, rather than whatever the take happened to
   have: the player fires on a click and a clip that starts 300 ms late feels
   broken, while one that starts instantly feels clipped. */
const PAD_HEAD_S = 0.08;
const PAD_TAIL_S = 0.22;
const FADE_S = 0.01;

/* ── the loudness ───────────────────────────────────────────────────────
   Mean level every clip is brought to, and the ceiling no clip may cross.
   -20 dB mean is ordinary for speech; -1.5 dBFS of headroom keeps the MP3
   encoder from clipping on a peak that was legal in the WAV. */
const TARGET_MEAN_DB = -20;
const PEAK_CEIL_DB = -1.5;

/* MP3 at 96 kbps mono: about 10 KB for a syllable, so the whole of wave 1 is
   under two megabytes. Below this, sibilants start to smear, and sibilants
   are half of what this course teaches. */
const MP3_KBPS = 96;

const readJson = p => JSON.parse(readFileSync(join(ROOT, p), 'utf8'));
const SEM_LIMPEZA = process.argv.includes('--sem-limpeza');

function ff(args) {
  return execFileSync('ffmpeg', ['-hide_banner', '-nostdin', ...args],
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
}

/* ffmpeg writes every measurement to STDERR - volumedetect's levels,
   silencedetect's marks, all of it - and a run that measures into `-f null -`
   exits with SUCCESS. So this cannot be `execFileSync`, which hands back
   stdout alone and keeps stderr only on a throw: the first version of this
   file did exactly that, read an empty string every time, fell back to the
   default noise floor and found one segment in a take that had twelve. The
   rehearsal caught it. `spawnSync` returns both streams either way. */
function ffMeasure(args) {
  const r = spawnSync('ffmpeg', ['-hide_banner', '-nostdin', ...args, '-f', 'null', '-'],
    { encoding: 'utf8' });
  return String(r.stderr ?? '') + String(r.stdout ?? '');
}

const duracao = file => Number(execFileSync('ffprobe',
  ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file],
  { encoding: 'utf8' }).trim());

/* ── noise floor ─────────────────────────────────────────────────────────
   Measured from room-tone.wav when the speaker recorded one, which is why
   the brief asks for it. Without it, the FIRST SECOND of the take is used:
   the roteiro asks for three seconds of silence before the first word, so
   the first one is room tone by another name. It was two seconds, and the
   ensaio caught what that costs: a take whose first word comes at 1.5 s
   gets a "floor" that includes speech, the cut is set above half of the
   words, and nothing is found. One second leaves a wide margin. */
function pisoDeRuido(wav) {
  const tone = join(DROP, 'room-tone.wav');
  const fonte = existsSync(tone) ? tone : wav;
  const recorte = existsSync(tone) ? [] : ['-t', '1'];
  const saida = ffMeasure(['-i', fonte, ...recorte, '-af', 'volumedetect']);
  const m = saida.match(/mean_volume:\s*(-?\d+(?:\.\d+)?) dB/);
  return {
    db: m ? Number(m[1]) : -60,
    fonte: existsSync(tone) ? 'room-tone.wav' : 'o primeiro segundo'
  };
}

/* ── where the silences are ──────────────────────────────────────────────
   A DETECÇÃO OUVE O MESMO SINAL QUE A LIMPEZA VAI PRODUZIR.
   ─────────────────────────────────────────────────────────────────────────
   O passa-alta não está aqui por capricho de simetria. Na primeira gravação
   de uma letra, o corte achou OITO trechos onde há sete itens, e o oitavo
   era um clique de 0,04 s no início - o dedo no botão de gravar. Ele passou
   pela detecção porque tem energia grave, e desapareceu na limpeza porque o
   passa-alta come justamente isso. Resultado: uma peça fantasma, contagem
   errada, e uma letra inteira recusada por causa de um toque na tela.

   Detectar no sinal cru e cortar no sinal limpo é medir uma coisa e entregar
   outra. Com o mesmo filtro nos dois lados, o que a contagem promete é o que
   o arquivo tem. */
const PRE_FILTRO = 'highpass=f=80';

function marcasDeSilencio(wav, limiar, gap) {
  const saida = ffMeasure(['-i', wav, '-af', `${PRE_FILTRO},silencedetect=noise=${limiar}dB:d=${gap}`]);
  const marcas = [];
  for (const linha of saida.split('\n')) {
    const ini = linha.match(/silence_start:\s*(-?\d+(?:\.\d+)?)/);
    const fim = linha.match(/silence_end:\s*(-?\d+(?:\.\d+)?)/);
    if (ini) marcas.push({ t: Number(ini[1]), tipo: 'inicio' });
    if (fim) marcas.push({ t: Number(fim[1]), tipo: 'fim' });
  }
  return marcas;
}

/* ── o que não é voz ────────────────────────────────────────────────────
   Um trecho pode ter a duração de uma palavra e não ter palavra nenhuma
   dentro. O dedo no botão de gravar, a mesa batida, a porta: são eventos
   curtos e graves que a detecção conta como fala e a limpeza depois esvazia,
   deixando um arquivo de 0,04 s a -91 dB - silêncio digital com nome de
   letra.
   Isso aconteceu duas vezes na primeira gravação de uma letra, e das duas a
   CONTAGEM BATEU: sete trechos para sete itens, com um fantasma dentro e um
   item de verdade faltando. É a pior coisa que esta ferramenta pode fazer,
   porque é o erro que ela existe para impedir e que passa pela sua única
   defesa automática.
   Daí esta segunda peneira, depois do corte e antes de contar: mede-se cada
   trecho com o mesmo filtro da limpeza, e o que não tiver voz por cima do
   piso da sala não é trecho. */
const VOZ_ACIMA_DO_PISO_DB = 14;

/* Mede um trecho como a limpeza o entregará: mesmo filtro, mesmas bordas
   aparadas. Devolve o pico - que diz se há voz - e a duração DEPOIS da
   aparagem, que é a única que se pode comparar com o tamanho de uma palavra.
   Medir a extensão crua era avisar "itens grudados" sobre uma peça que sai
   com 0,82 s, e um aviso que grita à toa é um aviso que ninguém lê. */
function medir(wav, seg, pisoDb) {
  const dur = seg.ate - seg.de;
  /* Sem aparar as bordas aqui, de propósito. A versão que aparava media com
     `areverse` + `silenceremove` e devolvia `n_samples: 0` para TODO trecho,
     rejeitando a gravação inteira - o `areverse` sobre uma janela cortada com
     `-ss`/`-t` não entrega o que esta medição precisa. O pico sobre o trecho
     inteiro responde a única pergunta que importa aqui, que é se há voz; o
     tamanho de verdade quem confere é a trava do fim, sobre o arquivo pronto. */
  const saida = ffMeasure([
    '-ss', String(seg.de), '-t', String(dur), '-i', wav, '-af', `${PRE_FILTRO},volumedetect`
  ]);
  const pico = saida.match(/max_volume:\s*(-?\d+(?:\.\d+)?) dB/);
  return {
    /* Sem medida não se descarta nada: a dúvida não pode apagar uma letra. */
    temVoz: pico ? Number(pico[1]) > pisoDb + VOZ_ACIMA_DO_PISO_DB : true,
    limpa: dur
  };
}

/* ── how long one item can be ───────────────────────────────────────────
   Measured on a real take of this script: 147 of 171 pieces landed between
   0.30 and 0.90 s, and the median was 0.56. Anything past this is not one
   syllable being said slowly - it is two items with no usable gap between
   them, and it has to be opened rather than counted as one. */
let PALAVRA_MAX_S = 1.1;

/* ── frases (onda 4) ─────────────────────────────────────────────────────
   Uma frase dura de 1 a 4 segundos e tem pausa DENTRO dela: a vírgula, o
   fôlego entre duas palavras. Com as réguas de palavra solta, cada frase
   sairia partida em pedaços. Para um arquivo só de frases, quem grava deixa
   2 segundos entre uma e outra; a pausa mínima sobe para 0,9 s e nada é
   "aberto" por ser longo. */
const FRASE_GAP_MIN_S = 0.9;
const FRASE_MAX_S = 10;

/* ── opening a glued piece ───────────────────────────────────────────────
   A single global setting cannot serve a real recording. The first take of
   this script had pauses ranging from 0.30 s to 2.13 s: loose enough to keep
   words whole and some items stayed glued in chunks of almost five seconds;
   tight enough to separate those and single syllables started splitting at
   their own internal stops. Counting once at one setting gave 171 against a
   target of 168 - three off, and only by luck, because 15 glued pieces were
   hiding some 54 items while spurious splits added others back.

   So the cut goes in two movements, and the order is the whole idea:

     1. cut LOOSE, at a gap no word survives crossing. This never splits an
        item in two, which is the error that cannot be seen afterwards;
     2. then open, one by one, only the pieces too long to be one item -
        each in its own window, with the tightest gap that opens it.

   A piece that will not open stays whole and is reported. Better a piece the
   person has to cut by hand than a piece the tool split down the middle of a
   letter. */
function abrirPeca(wav, seg, nivel = 0) {
  const fala = seg.ate - seg.de;
  if (fala <= PALAVRA_MAX_S || nivel >= 3) return [seg];

  for (const gap of [0.3, 0.22, 0.16, 0.12]) {
    for (const limiar of [-30, -35, -40, -25]) {
      const saida = ffMeasure([
        '-ss', String(seg.de), '-t', String(fala), '-i', wav,
        '-af', `${PRE_FILTRO},silencedetect=noise=${limiar}dB:d=${gap}`
      ]);
      const marcas = [];
      for (const linha of saida.split('\n')) {
        const i = linha.match(/silence_start:\s*(-?\d+(?:\.\d+)?)/);
        const f = linha.match(/silence_end:\s*(-?\d+(?:\.\d+)?)/);
        if (i) marcas.push({ t: Number(i[1]), tipo: 'inicio' });
        if (f) marcas.push({ t: Number(f[1]), tipo: 'fim' });
      }
      const dentro = segmentos(marcas, fala);
      if (dentro.length > 1) {
        /* Coordinates come back relative to the window; put them back on the
           recording's own clock before anything downstream sees them. */
        return dentro
          .map(d => ({ de: seg.de + d.de, ate: seg.de + d.ate }))
          .flatMap(d => abrirPeca(wav, d, nivel + 1));
      }
    }
  }
  return [seg];
}

/* ── choosing the threshold ──────────────────────────────────────────────
   A single threshold derived from the noise floor is a guess, and a guess is
   the wrong instrument here, because this tool knows something rare: HOW MANY
   pieces the answer has. The script says the wave is 168 clips; a cut that
   yields 168 segments is the cut that agrees with the page the speaker read.
   So it sweeps, from tight to loose, and stops at the first setting that
   agrees.

   The floor still matters: it decides WHERE the sweep starts, so a quiet
   booth and a noisy kitchen are not tried in the same order. It is a hint,
   not a verdict.

   This does not make the alignment certain, and nothing here pretends it
   does: a threshold that splits one word in two while merging two others
   would land on the same total. That is exactly what conferencia.html is
   for, and why it is not optional. */
function acharCorte(wav, pisoDb, esperados) {
  const perto = Math.min(-25, Math.max(-50, pisoDb + 12));
  /* Around the hint first, then the whole sensible range, then a shorter
     gap for a speaker who did not pause as long as the brief asked. */
  const limiares = [...new Set([perto, perto - 5, perto + 5, -30, -35, -40, -25, -45])]
    .filter(v => v >= -50 && v <= -20);
  const total = duracao(wav);

  /* O INTERVALO NÃO ENTRA NA VARREDURA, e isso é decisão, não esquecimento.
     Apertá-lo é o que parte um item ao meio, que é o erro impossível de ver
     depois. Ele fica largo, e quem abre o que ficou grudado é `abrirPeca`,
     peça por peça, onde o risco é contido. */
  const tentativas = [];
  let melhor = null;

  for (const limiar of limiares) {
    const largos = segmentos(marcasDeSilencio(wav, limiar, GAP_MIN_S), total);
    const segs = largos.flatMap(s => abrirPeca(wav, s))
      .map(s => ({ ...s, ...medir(wav, s, pisoDb) }))
      .filter(s => s.temVoz);
    const grudadas = segs.filter(s => s.limpa > PALAVRA_MAX_S).length;
    tentativas.push({ limiar, n: segs.length, grudadas });
    if (segs.length === esperados) {
      return { limiar, gap: GAP_MIN_S, segs, tentativas, grudadas, bateu: true };
    }
    /* Vence a contagem mais próxima; empate vai para a que deixou menos
       peças grudadas, porque essas são as que sobram para a mão humana. */
    const atual = { limiar, n: segs.length, grudadas, segs };
    const melhorQue = !melhor
      || Math.abs(atual.n - esperados) < Math.abs(melhor.n - esperados)
      || (Math.abs(atual.n - esperados) === Math.abs(melhor.n - esperados)
          && atual.grudadas < melhor.grudadas);
    if (melhorQue) melhor = atual;
  }

  return {
    limiar: melhor.limiar, gap: GAP_MIN_S, segs: melhor.segs,
    tentativas, grudadas: melhor.grudadas, bateu: false
  };
}

/* Speech is what is left between the silences. */
function segmentos(marcas, total) {
  const segs = [];
  let aberto = 0;
  for (const m of marcas) {
    if (m.tipo === 'inicio') {
      if (m.t - aberto >= SEG_MIN_S) segs.push({ de: aberto, ate: m.t });
      aberto = null;
    } else if (aberto === null) {
      aberto = m.t;
    }
  }
  if (aberto !== null && total - aberto >= SEG_MIN_S) segs.push({ de: aberto, ate: total });
  return segs;
}

/* ── one clip ────────────────────────────────────────────────────────────
   Two passes, because the gain cannot be chosen before the level is known,
   and the level cannot be known before the filters that change it have run. */
function extrair(wav, seg, destino, pisoDb) {
  const de = Math.max(0, seg.de - PAD_HEAD_S);
  const dur = (seg.ate - seg.de) + PAD_HEAD_S + PAD_TAIL_S;

  /* `nf` diz ao redutor ONDE ele deve achar que o ruído está, e passar o piso
     medido - que era o que este arquivo fazia - desliga o filtro.
     ─────────────────────────────────────────────────────────────────────
     Medido contra o ruído de sala real desta gravação, cujo piso é -47,8 dB:

       nf = -48 (o piso)   a sala cai 1,6 dB   ou seja, nada
       nf = -38            a sala cai 5,6 dB
       nf = -33            a sala cai 12,4 dB

     E o custo na voz, na mesma varredura, é quase nenhum: a média da fala
     ficou em -28,3 dB nos cinco ajustes, e o pico andou 1 dB entre o mais
     tímido e o mais forte. O filtro trabalha por componente do espectro, e
     as formantes da voz estão muito acima de onde `nf` corta.

     Daí a regra: quinze decibéis ACIMA do piso medido, preso entre -45 e
     -30. O teto existe para a sala barulhenta, onde o piso sobe e quinze
     acima dele começaria a comer consoante. */
  const nf = Math.max(-45, Math.min(-30, Math.round(pisoDb + 15)));
  /* `--sem-limpeza` (25/09/2026): quem grava com microfone de verdade, numa
     sala quieta, não precisa do filtro de graves nem do redutor de ruído - e
     o redutor, mesmo gentil, é o que mais poderia mudar o timbre. O acabamento
     (bordas, fades, volume igual) continua: sem ele cada clipe começa com um
     atraso diferente e toca num volume diferente. */
  /* Mono PRIMEIRO (25/09/2026). O gravador do iPhone entrega estéreo, dois
     canais iguais, e o `adelay` com um valor só atrasa apenas o PRIMEIRO
     canal: com o mono no fim da cadeia, a voz atrasada 80 ms era somada à voz
     no tempo certo e o clipe saía dobrado, com som de robô. Juntando os
     canais antes de tudo, não há segundo canal para ficar para trás. */
  const limpeza = [
    'aresample=44100', 'aformat=channel_layouts=mono',
    ...(SEM_LIMPEZA ? [] : ['highpass=f=80', `afftdn=nr=20:nf=${nf}`]),
    'areverse', 'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0',
    'areverse', 'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0',
    `adelay=${Math.round(PAD_HEAD_S * 1000)}`,
    `apad=pad_dur=${PAD_TAIL_S}`
  ].join(',');

  const bruto = destino + '.tmp.wav';
  ff(['-y', '-ss', String(de), '-t', String(dur), '-i', wav, '-af', limpeza, bruto]);

  const medido = ffMeasure(['-i', bruto, '-af', 'volumedetect']);
  const mean = Number((medido.match(/mean_volume:\s*(-?\d+(?:\.\d+)?)/) ?? [])[1] ?? TARGET_MEAN_DB);
  const peak = Number((medido.match(/max_volume:\s*(-?\d+(?:\.\d+)?)/) ?? [])[1] ?? 0);

  /* Same loudness for all 168, without letting the loudest one clip: the
     gain that hits the mean target, capped by the gain that keeps the peak
     under the ceiling. */
  const ganho = Math.min(TARGET_MEAN_DB - mean, PEAK_CEIL_DB - peak);

  ff(['-y', '-i', bruto,
    '-af', `volume=${ganho.toFixed(2)}dB,afade=t=in:d=${FADE_S},afade=t=out:st=${Math.max(0, dur - FADE_S).toFixed(3)}:d=${FADE_S}`,
    '-ac', '1', '-ar', '44100', '-b:a', `${MP3_KBPS}k`, destino]);

  rmSync(bruto, { force: true });
  return { ganho, mean, peak };
}

/* ── the page that proves the alignment ─────────────────────────────────── */
function conferencia(pares, info) {
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const linhas = pares.map((p, i) => `
    <tr>
      <td class="n">${i + 1}</td>
      <td class="he" dir="rtl" lang="he">${esc(p.clipe ? p.clipe.he : '?')}</td>
      <td class="tr">${esc(p.clipe ? (p.clipe.translit ?? '') : '')}</td>
      <td class="gl">${esc(p.clipe ? p.clipe.gloss : 'sem clipe correspondente')}</td>
      <td class="t">${p.de.toFixed(1)}s</td>
      <td><audio controls preload="none" src="${esc(p.arquivo)}"></audio></td>
    </tr>`).join('\n');

  return `<!doctype html>
<html lang="pt-BR"><meta charset="utf-8">
<title>Conferência do corte</title>
<style>
  body { font: 15px/1.5 system-ui, sans-serif; margin: 0; padding: 24px; color: #1a1a1a; background: #fafafa; }
  h1 { font-size: 20px; margin: 0 0 4px; }
  .aviso { background: #FFF6E0; border: 1px solid #E8C97A; border-radius: 8px; padding: 12px 14px; margin: 14px 0 20px; }
  .erro { background: #FDECEA; border-color: #E8A8A0; }
  table { border-collapse: collapse; width: 100%; background: #fff; }
  th, td { border-bottom: 1px solid #eee; padding: 7px 10px; text-align: left; vertical-align: middle; }
  th { font-size: 12px; text-transform: uppercase; letter-spacing: .04em; color: #666; }
  .n { color: #999; font-variant-numeric: tabular-nums; width: 46px; }
  .he { font-size: 28px; direction: rtl; unicode-bidi: isolate; width: 140px; }
  .tr { font-weight: 600; color: #1F6F63; width: 90px; }
  .gl { color: #444; }
  .t { color: #999; font-variant-numeric: tabular-nums; width: 70px; }
  audio { height: 32px; }
</style>
<h1>Conferência do corte</h1>
<p>${esc(info.resumo)}</p>
<div class="aviso ${info.ok ? '' : 'erro'}">
  ${info.ok
    ? 'Os números batem. <strong>Ouça pelo menos oito linhas espalhadas</strong>, inclusive a última: se o áudio combina com o hebraico ao lado, o corte inteiro está alinhado, porque um desencontro empurra tudo o que vem depois.'
    : '<strong>Os números NÃO batem</strong>, então nenhum arquivo foi gravado com o nome final. Ouça daqui e ache onde o corte se perdeu: onde o áudio deixar de combinar com o hebraico, é ali.'}
</div>
<table>
  <thead><tr><th>#</th><th>Hebraico</th><th>Leitura</th><th>Significado</th><th>Em</th><th>Ouvir</th></tr></thead>
  <tbody>${linhas}</tbody>
</table>
</html>`;
}

/* ── the rehearsal ───────────────────────────────────────────────────────
   Builds a fake take with a known number of segments and runs the real cut
   over it. It proves the part that has no other way of being proved before a
   session exists: that N spoken chunks separated by silence come out as
   exactly N files, in order. */
function ensaiar() {
  const tmp = join(DROP, '.ensaio');
  rmSync(tmp, { recursive: true, force: true });
  mkdirSync(tmp, { recursive: true });

  /* A "word" is a short tone burst; a "gap" is near-silence with a little
     hiss, because a digital-zero gap would make the detector's job easier
     than any room ever will. The take opens with silence, the way a real one
     does - the speaker is told to record room tone first. */
  function gravacaoFalsa(nome, palavras, pausa = 1.0) {
    const partes = ['anoisesrc=amplitude=0.001:duration=1.5'];
    for (let i = 0; i < palavras; i++) {
      partes.push(`sine=frequency=${180 + i * 20}:duration=0.45`);
      partes.push(`anoisesrc=amplitude=0.001:duration=${pausa}`);
    }
    const filtro = partes.map((p, i) => `${p}[a${i}]`).join(';') +
      ';' + partes.map((_, i) => `[a${i}]`).join('') + `concat=n=${partes.length}:v=0:a=1[out]`;
    const f = join(tmp, nome);
    ff(['-y', '-filter_complex', filtro, '-map', '[out]', '-ac', '1', '-ar', '44100', f]);
    return f;
  }

  const N = 12;
  let falhas = 0;
  const erro = msg => { console.log(`\n  ✗ ${msg}`); falhas++; };

  console.log(`\n  ENSAIO\n`);

  /* 1. O caso normal: N trechos entram, N trechos saem. */
  const falso = gravacaoFalsa('ensaio.wav', N);
  const piso = pisoDeRuido(falso);
  const corte = acharCorte(falso, piso.db, N);
  console.log(`  uma gravação de mentira com ${N} trechos`);
  console.log(`    piso de ruído    ${piso.db.toFixed(1)} dB  (de ${piso.fonte})`);
  console.log(`    corte escolhido  ${corte.limiar} dB, pausa ${corte.gap}s`);
  console.log(`    trechos achados  ${corte.segs.length} de ${N}`);
  if (!corte.bateu) erro('o corte não achou o número certo de trechos');

  if (corte.bateu) {
    const alvo = join(tmp, 'p3.mp3');
    extrair(falso, corte.segs[3], alvo, piso.db);
    const bytes = statSync(alvo).size;
    if (bytes < 1500) erro(`o clipe cortado saiu pequeno demais (${bytes} bytes)`);
    else console.log(`    clipe 4 cortado  ${bytes} bytes`);

    /* A nivelação tem de ter mexido: uma cadeia que silenciosamente não faz
       nada passaria em tudo o que está acima. */
    const medido = ffMeasure(['-i', alvo, '-af', 'volumedetect']);
    const mean = Number((medido.match(/mean_volume:\s*(-?\d+(?:\.\d+)?)/) ?? [])[1] ?? 0);
    if (Math.abs(mean - TARGET_MEAN_DB) > 4) {
      erro(`a nivelação não chegou ao alvo: ${mean} dB, queria ${TARGET_MEAN_DB} dB`);
    } else {
      console.log(`    nivelado em      ${mean.toFixed(1)} dB  (alvo ${TARGET_MEAN_DB})`);
    }
  }

  /* 1b. Estéreo: o gravador do celular entrega dois canais iguais, e o clipe
     tem de sair IGUAL ao de uma gravação mono. Uma cadeia que atrasa só um
     canal soma a voz com ela mesma deslocada - o som de robô que os
     primeiros clipes do iPhone tiveram. A diferença entre os dois tem de ser
     silêncio. */
  if (corte.bateu) {
    const estereo = join(tmp, 'estereo.wav');
    ff(['-y', '-i', falso, '-af', 'pan=stereo|c0=c0|c1=c0', estereo]);
    const deEstereo = join(tmp, 'de-estereo.mp3');
    extrair(estereo, corte.segs[3], deEstereo, piso.db);
    /* O respiro do início tem de ser silêncio: na voz dobrada, o canal que
       não foi atrasado já soa ali. (A folga de 20 ms cobre o atraso do MP3.) */
    const inicio = ffMeasure(['-i', deEstereo, '-af',
      `atrim=0:${(PAD_HEAD_S - 0.02).toFixed(3)},volumedetect`, '-f', 'null', '-']);
    const pico = Number((inicio.match(/max_volume:\s*(-?\d+(?:\.\d+)?)/) ?? [])[1] ?? 0);
    if (pico > -50) erro(`de uma gravação estéreo, o clipe já soa no respiro (${pico} dB): voz dobrada`);
    else console.log(`    estéreo          respiro limpo (${pico} dB), voz sem eco`);
  }

  /* 2. O caso que decide se esta ferramenta é segura: uma gravação com um
     trecho A MENOS do que o roteiro pede. A escada NÃO pode "achar" um jeito
     de chegar ao número - se ela chegasse, os nomes seriam atribuídos todos
     deslocados a partir do buraco, e o curso ensinaria uma letra com o som
     de outra sem ninguém perceber. */
  console.log(`\n  uma gravação com um trecho faltando (${N - 1} para ${N} clipes)`);
  const curto = gravacaoFalsa('curto.wav', N - 1);
  const corteCurto = acharCorte(curto, pisoDeRuido(curto).db, N);
  console.log(`    trechos achados  ${corteCurto.segs.length}, esperados ${N}`);
  if (corteCurto.bateu) erro('a escada inventou um trecho que não existe - alinhamento cego');
  else console.log(`    recusado, como tem de ser`);

  /* 3. E uma com pausas curtas, que a escada tem de alcançar descendo o
     tempo de pausa em vez de desistir. */
  console.log(`\n  uma gravação com pausas de 0,3s`);
  const rapido = gravacaoFalsa('rapido.wav', N, 0.32);
  const corteRapido = acharCorte(rapido, pisoDeRuido(rapido).db, N);
  console.log(`    trechos achados  ${corteRapido.segs.length} de ${N}  (pausa ${corteRapido.gap}s)`);
  if (!corteRapido.bateu) erro('a escada não alcançou uma gravação de pausas curtas');

  /* 4. Frases (onda 4): três "palavras" de 0,4 s com pausas de 0,35 s dentro
     de cada frase - a vírgula, o fôlego - e 2 s entre uma frase e outra. Com
     as réguas de frase, cada frase sai INTEIRA; com as de palavra solta, ela
     seria partida, e isso também é conferido, para a régua não afrouxar à toa. */
  console.log(`\n  frases com pausas de vírgula dentro`);
  const F = 6;
  const partes = ['anoisesrc=amplitude=0.001:duration=1.5'];
  for (let i = 0; i < F; i++) {
    for (let p = 0; p < 3; p++) {
      partes.push(`sine=frequency=${200 + i * 30 + p * 10}:duration=0.4`);
      partes.push(`anoisesrc=amplitude=0.001:duration=${p < 2 ? 0.35 : 2.0}`);
    }
  }
  const filtro = partes.map((p, i) => `${p}[a${i}]`).join(';') +
    ';' + partes.map((_, i) => `[a${i}]`).join('') + `concat=n=${partes.length}:v=0:a=1[out]`;
  const frases = join(tmp, 'frases.wav');
  ff(['-y', '-filter_complex', filtro, '-map', '[out]', '-ac', '1', '-ar', '44100', frases]);
  const [gap0, max0] = [GAP_MIN_S, PALAVRA_MAX_S];
  const comoPalavra = acharCorte(frases, pisoDeRuido(frases).db, F);
  GAP_MIN_S = FRASE_GAP_MIN_S; PALAVRA_MAX_S = FRASE_MAX_S;
  const comoFrase = acharCorte(frases, pisoDeRuido(frases).db, F);
  GAP_MIN_S = gap0; PALAVRA_MAX_S = max0;
  console.log(`    régua de frase   ${comoFrase.segs.length} de ${F}`);
  console.log(`    régua de palavra ${comoPalavra.segs.length} (partiria as frases)`);
  if (!comoFrase.bateu) erro('o modo frase partiu ou juntou frases');
  if (comoPalavra.bateu) erro('a régua de palavra deixou frase inteira - o modo frase não seria preciso');

  rmSync(tmp, { recursive: true, force: true });
  console.log(falhas ? `\n  ${falhas} falha(s)\n` : '\n  ✓ o corte, a limpeza e a recusa funcionam\n');
  process.exitCode = falhas ? 1 : 0;
}

/* ── main ────────────────────────────────────────────────────────────────── */
function main() {
  const argv = process.argv.slice(2);
  if (argv.includes('--ensaiar')) return ensaiar();

  const arg = nome => {
    const i = argv.indexOf(nome);
    return i >= 0 ? argv[i + 1] : null;
  };
  const comValor = new Set(['--onda', '--de', '--ate', '--letra', '--grupo']);
  const wav = argv.find((a, i) => !a.startsWith('--') && !comValor.has(argv[i - 1]));
  /* `--onda todas` existe por causa da página de gravação guiada: ela pede um
     arquivo por LETRA com tudo o que aquela letra tem - o nome e as sílabas da
     onda 1 e as palavras de leitura da 2 -, porque gravar o alfabeto uma vez é
     melhor do que percorrê-lo três vezes. O padrão continua sendo a onda 1. */
  const ondaCru = arg('--onda') ?? '1';
  const todasOndas = String(ondaCru).toLowerCase() === 'todas';
  const onda = todasOndas ? null : Number(ondaCru);
  const de = arg('--de') ? Number(arg('--de')) : null;
  const ate = arg('--ate') ? Number(arg('--ate')) : null;
  const letra = arg('--letra') ? Number(arg('--letra')) : null;
  const vogais = argv.includes('--vogais');
  /* Um grupo qualquer do roteiro por letra, pelo nome impresso na coluna
     "Onde aparece": "módulo 7", "no mundo real". */
  const grupo = arg('--grupo');

  if (!wav || !existsSync(wav)) {
    console.log(`
  uso:  npm run cortar-audio -- --letra 1 --onda todas letra-01.m4a
        npm run cortar-audio -- --letra 1 alef.m4a
        npm run cortar-audio -- --vogais --onda todas vogais.m4a
        npm run cortar-audio -- --grupo "módulo 7" --onda todas modulo-7.m4a
        npm run cortar-audio -- --onda 1 gravacao-inteira.wav
        npm run cortar-audio -- --onda 1 --de 40 --ate 80 parte2.wav
        npm run cortar-audio -- --ensaiar

  --letra  um arquivo com os itens de UMA letra. É o jeito recomendado de
           gravar no celular - se uma letra sair errada, só ela é refeita.
  --vogais o arquivo com os 14 nomes de sinais de vogal
  --sem-limpeza  sem filtro de graves nem redutor de ruído (microfone bom);
                 o corte, as bordas e o volume igual continuam
  --faltantes  só os itens do grupo que ainda não têm arquivo em audio/
           (o que o estúdio lista quando um grupo ganha itens novos)
  --grupo  um arquivo com os itens de um grupo do roteiro por letra
           ("módulo 7", "no mundo real", "frases", "texto do módulo 3")
  --onda   1, 2, 3 ou "todas". "todas" é o que a página de gravação guiada
           pede: um arquivo por letra com tudo o que aquela letra tem.
  --de     primeiro número do roteiro neste arquivo
  --ate    último número do roteiro neste arquivo
`);
    process.exitCode = 1;
    return;
  }

  const audio = readJson('data/audio.json');
  /* Quem manda no agrupamento é o `where` do manifesto, o mesmo texto que sai
     impresso na coluna "Onde aparece" do roteiro - assim o que a ferramenta
     chama de "letra 7" é exatamente o que a pessoa leu na página. */
  const grupoDe = c => (c.where || []).find(w => /^letra \d+$/.test(w)) || (c.where || [])[0] || '';

  /* A onda filtra SEMPRE, inclusive quando se pede uma letra. Uma letra
     aparece nas três ondas - o nome e as sílabas na 1, as palavras de
     leitura na 2 - e pedir "letra 1" sem a onda juntava as três num alvo de
     nove clipes numerados de 1 a 269. Um arquivo com os sete itens da onda 1
     nunca casaria com isso, e a recusa pareceria erro da gravação. */
  const daOnda = todasOndas ? 'todas as ondas' : `onda ${onda}`;
  let alvo = todasOndas ? audio.clips.slice() : audio.clips.filter(c => c.wave === onda);
  let rotulo = daOnda;

  if (letra !== null) {
    alvo = alvo.filter(c => grupoDe(c) === `letra ${letra}`);
    rotulo = `letra ${letra} · ${daOnda}`;
  } else if (grupo) {
    alvo = alvo.filter(c => grupoDe(c) === grupo);
    rotulo = `${grupo} · ${daOnda}`;
  } else if (vogais) {
    alvo = alvo.filter(c => grupoDe(c) === 'sinais de vogal');
    rotulo = `sinais de vogal · ${daOnda}`;
  } else {
    if (de !== null) alvo = alvo.filter(c => c.num >= de);
    if (ate !== null) alvo = alvo.filter(c => c.num <= ate);
    if (de !== null) rotulo += ` (nº ${de} a ${ate ?? '∞'})`;
  }
  /* `--faltantes` (26/09/2026): só os clipes do grupo que ainda não têm
     arquivo em audio/. É o que o estúdio pede quando um grupo já gravado
     ganha itens novos (as três palavras novas do Pe) ou quando uma lição
     nova reaproveita um clipe que já existe (לָלֶכֶת, na lição do Chaf): a
     pessoa grava só o que falta, e o corte casa com exatamente isso. */
  if (argv.includes('--faltantes')) {
    alvo = alvo.filter(c => !existsSync(join(DROP, c.file)));
    rotulo += ' · só os que faltam';
  }
  alvo.sort((a, b) => a.num - b.num);
  /* Um texto se lê na ordem da CONVERSA, não na dos números (27/09/2026).
     Quando um texto é reescrito, as falas que já existiam guardam o número
     antigo e as novas ganham números no fim - a ordem por número pularia
     de fala em fala. O estúdio lista na ordem do texto, e o corte casa com
     ela: posição da linha em data/textos.json, e o número só desempata. */
  const linhaDoTexto = new Map();
  for (const t of readJson('data/textos.json').textos) {
    t.linhas.forEach((l, i) => linhaDoTexto.set(`texto do módulo ${t.modulo}|${l.he}`, i));
  }
  const posTexto = c => linhaDoTexto.get(`${grupoDe(c)}|${c.he}`);
  if (alvo.length && alvo.every(c => posTexto(c) !== undefined)) {
    alvo.sort((a, b) => posTexto(a) - posTexto(b) || a.num - b.num);
  }
  if (alvo.length && alvo.every(c => c.kind === 'frase')) {
    GAP_MIN_S = FRASE_GAP_MIN_S;
    PALAVRA_MAX_S = FRASE_MAX_S;
    rotulo += ' · modo frase (pausa de 2 s entre as frases)';
  }

  if (!alvo.length) {
    console.log(`\n  ✗ nenhum clipe em "${rotulo}"\n`);
    process.exitCode = 1;
    return;
  }

  const total = duracao(wav);
  const piso = pisoDeRuido(wav);
  const corte = acharCorte(wav, piso.db, alvo.length);
  const segs = corte.segs;

  console.log(`\n  ${basename(wav)} - ${(total / 60).toFixed(1)} min`);
  console.log(`    piso de ruído   ${piso.db.toFixed(1)} dB  (medido em ${piso.fonte})`);
  console.log(`    corte usado     ${corte.limiar} dB, pausa de ${corte.gap}s  (${corte.tentativas.length} ajuste(s) tentado(s))`);
  console.log(`    trechos achados ${segs.length}`);
  if (corte.grudadas) {
    console.log(`    ✗ ${corte.grudadas} peça(s) com mais de ${PALAVRA_MAX_S}s: itens lidos sem pausa entre eles, que não abriram`);
  }
  console.log(`    ${rotulo.padEnd(15)} ${alvo.length} clipe(s)  (nº ${alvo[0].num} a ${alvo[alvo.length - 1].num})\n`);

  const ok = segs.length === alvo.length;

  rmSync(CONF, { recursive: true, force: true });
  mkdirSync(CONF, { recursive: true });

  const pares = [];
  for (let i = 0; i < segs.length; i++) {
    const clipe = alvo[i] ?? null;
    /* O acento sai por decomposição, e não por `[^\w]`: aquilo apagava o
       próprio `Á` de "Álef" e o arquivo de conferência saía como `001-lef`,
       que é justamente o tipo de nome que faz alguém desconfiar do corte
       quando o corte está certo. */
    const semAcento = t => t.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w]/g, '');
    const rotulo = String(i + 1).padStart(3, '0') +
      (clipe && clipe.translit ? '-' + semAcento(clipe.translit) : '');
    const arquivo = rotulo + '.mp3';
    extrair(wav, segs[i], join(CONF, arquivo), piso.db);
    pares.push({ ...segs[i], clipe, arquivo });
    if ((i + 1) % 20 === 0) console.log(`    ${i + 1}/${segs.length} cortados`);
  }

  const resumo = `${basename(wav)} · ${segs.length} trecho(s) para ${alvo.length} clipe(s) da onda ${onda}`;
  writeFileSync(join(CONF, 'conferencia.html'), conferencia(pares, { ok, resumo }));

  if (!ok) {
    console.log(`
  ✗ ${segs.length} trechos para ${alvo.length} clipes - NADA foi nomeado.

    Um trecho a mais ou a menos desloca todos os nomes daí em diante, e o
    erro é mudo: o curso passaria a ensinar uma letra com o som de outra.

    Abra audio/conferir/conferencia.html e ouça até achar onde o corte se
    perdeu. ${segs.length > alvo.length
      ? 'Sobrando: quase sempre é um pigarro ou uma tomada repetida que virou trecho.'
      : 'Faltando: quase sempre são dois itens lidos juntos, sem pausa entre eles.'}

    Ache o ponto, corte o trecho problemático do WAV, e rode de novo. Ou use
    --de e --ate para tratar os pedaços separadamente.
`);
    process.exitCode = 1;
    return;
  }

  /* ── a última trava, e a única que mede o que SAI ────────────────────
     Tudo o que veio antes julga trechos do original. Isto julga os arquivos
     prontos, que são os que o curso vai tocar - e um arquivo mudo com nome
     de letra já passou por todas as peneiras anteriores duas vezes nesta
     sessão. Um clipe sem som não é um defeito de corte a ser relatado: é
     uma letra que o aluno vai clicar e não ouvir nada. */
  const mudos = pares.filter(p => {
    const saida = ffMeasure(['-i', join(CONF, p.arquivo), '-af', 'volumedetect']);
    const m = saida.match(/max_volume:\s*(-?\d+(?:\.\d+)?) dB/);
    return !m || Number(m[1]) < -60;
  });

  if (mudos.length) {
    console.log(`
  ✗ ${mudos.length} peça(s) saíram SEM SOM, e por isso nada foi nomeado:
${mudos.map(p => `      ${p.arquivo}  (seria ${p.clipe.he})`).join('\n')}

    Um trecho que a detecção contou como fala e a limpeza esvaziou: quase
    sempre o dedo no botão de gravar, uma batida na mesa ou uma porta.
    Como ele ocupou o lugar de um item de verdade, a contagem bateu com um
    fantasma dentro - e um item real ficou de fora.

    Os arquivos numerados estão em audio/conferir/ para você ouvir.
`);
    process.exitCode = 1;
    return;
  }

  for (const p of pares) {
    execFileSync('cp', [join(CONF, p.arquivo), join(DROP, p.clipe.file)]);
  }

  console.log(`
  ✓ ${pares.length} clipe(s) cortados, limpos, nivelados e nomeados.

    ANTES de publicar, abra audio/conferir/conferencia.html e ouça oito
    linhas espalhadas, inclusive a última. É o único jeito de provar que o
    corte não escorregou - e um escorregão silencioso é o defeito que leva
    o curso ao ar ensinando uma letra com o som de outra.

    Depois:  npm run check-audio
`);
}

main();

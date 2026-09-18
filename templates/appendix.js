/* Apêndice — reference tables. Everything here is derived from the data files,
   so it can never drift from the lessons. */

import { he, esc, mixed, H, prose } from '../scripts/lib/render.js';
import { badge, callout, chunk } from './partials.js';
import { ALEFBET } from '../scripts/lib/hebrew.js';

export function renderAppendix(ctx) {
  const { letters, nikud, translit } = ctx;
  const byChar = new Map(letters.map(l => [l.letter, l]));

  const sheets = [];

  /* ── A · the alphabet, in alphabetical order ───────────────────────────
     Eleven rows to a sheet: the letters print large in three columns. */
  const alphaRow = ch => {
    const L = byChar.get(ch);
    if (!L) return '';
    return `<tr>
      <td class="center">${he(L.letter, { size: 'word' })}</td>
      <td class="center">${he(L.letter, { size: 'word', cursive: true })}</td>
      <td class="center">${L.finalForm ? he(L.finalForm, { size: 'word' }) : '<span class="hint">—</span>'}</td>
      <td class="he-cell">${he(L.nameHe)}</td>
      <td>${esc(L.namePt)}</td>
      <td><strong class="kbd">${esc(L.translit || '—')}</strong></td>
      <td>${esc(L.sound)}</td>
      <td class="center">${L.order}</td>
    </tr>`;
  };

  chunk(ALEFBET.filter(c => byChar.has(c)), 11).forEach((g, gi, all) => {
    sheets.push(`
    ${badge('Apêndice A — o alfabeto completo' + (gi ? ' · continuação' : ''))}
    <h1>O alfabeto hebraico${all.length > 1 ? ` (${gi + 1} de ${all.length})` : ''}</h1>
    ${gi === 0 ? `<p class="lead">As 22 letras em ordem alfabética. A última coluna traz a ordem em que elas aparecem neste workbook, que é a ordem de frequência de uso, não a alfabética.</p>` : ''}
    <table>
      <thead><tr>
        <th>Impressa</th><th>Cursiva</th><th>Final</th>
        <th>Nome</th><th>Em português</th><th>Som</th><th>IPA</th><th>Lição</th>
      </tr></thead>
      <tbody>${g.map(alphaRow).join('\n')}</tbody>
    </table>
    ${gi === all.length - 1 ? callout('tip', '💡', `<p>Cinco letras mudam de forma no fim da palavra: ${
      mixed(letters.filter(l => l.finalForm).flatMap((l, i, a) => [
        H(l.letter), ' → ', H(l.finalForm), i < a.length - 1 ? ' · ' : ''
      ]))}.</p>`) : ''}`);
  });

  /* ── B · the vowel signs, with their names ─────────────────────────── */
  const nikudRows = nikud.sounds.flatMap(s2 =>
    s2.signs.map((g, i) => `<tr>
      <td class="center">${he(g.demo, { size: 'word' })}</td>
      <td><strong class="kbd">${i === 0 ? esc(s2.sound === 'sheva' ? '—' : s2.sound) : ''}</strong></td>
      <td class="he-cell">${he(g.nameHe)}</td>
      <td>${esc(g.namePt)}</td>
      <td>${prose(g.position)}</td>
    </tr>`));

  sheets.push(`
    ${badge('Apêndice B — os sinais de vogal')}
    <h1>Nomes dos sinais</h1>
    <p class="lead">Você aprendeu os sinais pelo som, que é o que importa para ler. Os nomes ficam aqui, para quando você encontrar uma gramática ou um professor que os use.</p>
    <table>
      <thead><tr><th>Exemplo</th><th>Som</th><th>Nome</th><th>Em português</th><th>Onde aparece</th></tr></thead>
      <tbody>${nikudRows.join('\n')}</tbody>
    </table>`);

  sheets.push(`
    ${badge('Apêndice B — os sinais de vogal · continuação')}
    <h1>O daguesh</h1>
    <p class="lead">${prose(nikud.dagesh.text)}</p>
    <table>
      <thead><tr><th>Sem ponto</th><th>Som</th><th>Com ponto</th><th>Som</th></tr></thead>
      <tbody>
        <tr><td class="center">${he('ב', { size: 'word' })}</td><td>v — como em "vaca"</td>
            <td class="center">${he('בּ', { size: 'word' })}</td><td>b — como em "bola"</td></tr>
        <tr><td class="center">${he('כ', { size: 'word' })}</td><td>ch — raspado, como o R carioca</td>
            <td class="center">${he('כּ', { size: 'word' })}</td><td>k — como em "casa"</td></tr>
        <tr><td class="center">${he('פ', { size: 'word' })}</td><td>f — como em "faca"</td>
            <td class="center">${he('פּ', { size: 'word' })}</td><td>p — como em "pato"</td></tr>
      </tbody>
    </table>`);

  /* ── C · transliteration key ───────────────────────────────────────── */
  const consAll = Object.entries(translit.consonants);
  chunk(consAll, 12).forEach((g, gi, all) => {
    sheets.push(`
    ${badge('Apêndice C — chave de transliteração' + (gi ? ' · continuação' : ''))}
    <h1>Consoantes${all.length > 1 ? ` (${gi + 1} de ${all.length})` : ''}</h1>
    ${gi === 0 ? `<p class="lead">Esta é uma transliteração prática, feita para o leitor brasileiro — não é a notação acadêmica.</p>` : ''}
    <table><thead><tr><th>Letra</th><th>Leitura</th></tr></thead><tbody>${
      g.map(([h2, t]) => `<tr><td class="center">${he(h2, { size: 'word' })}</td>
        <td><strong class="kbd">${t === '' ? '—' : esc(t)}</strong></td></tr>`).join('')
    }</tbody></table>`);
  });

  sheets.push(`
    ${badge('Apêndice C — chave de transliteração · continuação')}
    <h1>Vogais</h1>
    <table><thead><tr><th>Sinal</th><th>Leitura</th></tr></thead><tbody>${
      Object.entries(translit.vowels).map(([h2, t]) =>
        `<tr><td class="center">${he('מ' + h2, { size: 'word' })}</td>
         <td><strong class="kbd">${t === '' ? '—' : esc(t)}</strong></td></tr>`).join('')
    }</tbody></table>

    ${callout('info', 'ℹ️', `
      <h3>A regra de acento</h3>
      <p>O hebraico acentua quase sempre a última sílaba. Escrevemos a transliteração de modo que um brasileiro, lendo pelas regras do português, caia na sílaba certa — usando a acentuação do próprio português.</p>
      <p>Por isso <strong>shalom</strong> e <strong>katan</strong> não levam acento, enquanto <strong>bóker</strong>, <strong>máyim</strong> e <strong>mélech</strong> levam, porque a tônica não é a última sílaba — e <strong>mishpachá</strong>, <strong>morá</strong> e <strong>todá</strong> levam porque terminam em vogal e o português as leria como paroxítonas.</p>`)}`);

  /* ── D · cursive chart ─────────────────────────────────────────────── */
  const cell = (ch, label) => `<div class="cursive-cell">
      <span class="cursive-print">${he(ch, { size: 'word' })}</span>
      <span class="he he--display he--cursive" lang="he">${esc(ch)}</span>
      <span class="hint">${esc(label)}</span>
    </div>`;

  chunk(ALEFBET.filter(c => byChar.has(c)), 12).forEach((g, gi, all) => {
    sheets.push(`
    ${badge('Apêndice D — quadro de cursiva' + (gi ? ' · continuação' : ''))}
    <h1>Impressa e cursiva${all.length > 1 ? ` (${gi + 1} de ${all.length})` : ''}</h1>
    ${gi === 0 ? `<p class="lead">A letra de imprensa é a que você lê em livros, placas e telas. A cursiva é a que se escreve à mão — e é bem diferente. Israelenses usam as duas todos os dias.</p>` : ''}
    <div class="cursive-grid">${g.map(c => cell(c, byChar.get(c).namePt)).join('')}</div>`);
  });

  sheets.push(`
    ${badge('Apêndice D — quadro de cursiva · continuação')}
    <h1>As 5 formas finais</h1>
    <div class="cursive-grid">${
      letters.filter(l => l.finalForm).map(L => cell(L.finalForm, L.namePt + ' final')).join('')
    }</div>

    ${callout('tip', '💡', `<p>Ninguém escreve hebraico à mão em letra de imprensa, do mesmo jeito que ninguém escreve português à mão em letra de fôrma o tempo todo. Se você pretende escrever, a cursiva é a que vale a pena treinar.</p>`)}`);

  return sheets;
}

/* Apêndice — reference tables. Everything here is derived from the data files,
   so it can never drift from the lessons. */

import { he, esc, mixed, H, prose } from '../scripts/lib/render.js';
import { sheet, badge, callout } from './partials.js';
import { ALEFBET } from '../scripts/lib/hebrew.js';

export function renderAppendix(ctx) {
  const { letters, nikud, translit } = ctx;
  const byChar = new Map(letters.map(l => [l.letter, l]));

  /* ── 1 · the alphabet, in alphabetical order ───────────────────────── */
  const alphaRows = ALEFBET.map(ch => {
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
  }).join('\n');

  const p1 = `
    ${badge('Apêndice A — o alfabeto completo')}
    <h1>O alfabeto hebraico</h1>
    <p class="lead">As 22 letras em ordem alfabética. A última coluna traz a ordem em que elas aparecem neste workbook, que é a ordem de frequência de uso, não a alfabética.</p>
    <table>
      <thead><tr>
        <th>Impressa</th><th>Cursiva</th><th>Final</th>
        <th>Nome</th><th>Em português</th><th>Som</th><th>IPA</th><th>Lição</th>
      </tr></thead>
      <tbody>${alphaRows}</tbody>
    </table>

    ${callout('tip', '💡', `<p>Cinco letras mudam de forma no fim da palavra: ${
      mixed(letters.filter(l => l.finalForm).flatMap((l, i, a) => [
        H(l.letter), ' → ', H(l.finalForm), i < a.length - 1 ? ' · ' : ''
      ]))}.</p>`)}
  `;

  /* ── 2 · the vowel signs, with their names ─────────────────────────── */
  const nikudRows = nikud.sounds.flatMap(s =>
    s.signs.map((g, i) => `<tr>
      <td class="center">${he(g.demo, { size: 'word' })}</td>
      <td><strong class="kbd">${i === 0 ? esc(s.sound === 'sheva' ? '—' : s.sound) : ''}</strong></td>
      <td class="he-cell">${he(g.nameHe)}</td>
      <td>${esc(g.namePt)}</td>
      <td>${prose(g.position)}</td>
    </tr>`)).join('\n');

  const p2 = `
    ${badge('Apêndice B — os sinais de vogal')}
    <h1>Nomes dos sinais</h1>
    <p class="lead">Você aprendeu os sinais pelo som, que é o que importa para ler. Os nomes ficam aqui, para quando você encontrar uma gramática ou um professor que os use.</p>
    <table>
      <thead><tr><th>Exemplo</th><th>Som</th><th>Nome</th><th>Em português</th><th>Onde aparece</th></tr></thead>
      <tbody>${nikudRows}</tbody>
    </table>

    <h2>O daguesh</h2>
    <p>${prose(nikud.dagesh.text)}</p>
    <table>
      <thead><tr><th>Sem ponto</th><th>Som</th><th>Com ponto</th><th>Som</th></tr></thead>
      <tbody>
        <tr><td class="center">${he('ב', { size: 'word' })}</td><td>v</td>
            <td class="center">${he('בּ', { size: 'word' })}</td><td>b</td></tr>
        <tr><td class="center">${he('כ', { size: 'word' })}</td><td>ch (raspado)</td>
            <td class="center">${he('כּ', { size: 'word' })}</td><td>k</td></tr>
        <tr><td class="center">${he('פ', { size: 'word' })}</td><td>f</td>
            <td class="center">${he('פּ', { size: 'word' })}</td><td>p</td></tr>
      </tbody>
    </table>
  `;

  /* ── 3 · transliteration key ───────────────────────────────────────── */
  const consRows = Object.entries(translit.consonants).map(([h, t]) => `<tr>
      <td class="center">${he(h, { size: 'word' })}</td>
      <td><strong class="kbd">${t === '' ? '—' : esc(t)}</strong></td>
    </tr>`).join('');

  const vowRows = Object.entries(translit.vowels).map(([h, t]) => `<tr>
      <td class="center">${he('מ' + h, { size: 'word' })}</td>
      <td><strong class="kbd">${t === '' ? '—' : esc(t)}</strong></td>
    </tr>`).join('');

  const p3 = `
    ${badge('Apêndice C — chave de transliteração')}
    <h1>Como lemos as letras neste workbook</h1>
    <p class="lead">Esta é uma transliteração prática, feita para o leitor brasileiro — não é a notação acadêmica. A regra de acento está abaixo da tabela.</p>

    <div class="cols-2">
      <div>
        <h3>Consoantes</h3>
        <table><thead><tr><th>Letra</th><th>Leitura</th></tr></thead><tbody>${consRows}</tbody></table>
      </div>
      <div>
        <h3>Vogais</h3>
        <table><thead><tr><th>Sinal</th><th>Leitura</th></tr></thead><tbody>${vowRows}</tbody></table>
      </div>
    </div>

    ${callout('info', 'ℹ️', `
      <h3>A regra de acento</h3>
      <p>O hebraico acentua quase sempre a última sílaba. Escrevemos a transliteração de modo que um brasileiro, lendo pelas regras do português, caia na sílaba certa — usando a acentuação do próprio português.</p>
      <p>Por isso <strong>shalom</strong> e <strong>katan</strong> não levam acento (o português já as lê como oxítonas), enquanto <strong>bóker</strong>, <strong>máyim</strong> e <strong>mélech</strong> levam, porque a tônica não é a última sílaba — e <strong>mishpachá</strong>, <strong>morá</strong> e <strong>todá</strong> levam porque terminam em vogal e o português as leria como paroxítonas.</p>`)}
  `;

  /* ── 4 · cursive chart ─────────────────────────────────────────────── */
  const cursiveCells = ALEFBET.map(ch => {
    const L = byChar.get(ch);
    if (!L) return '';
    return `<div class="cursive-cell">
      <span class="cursive-print">${he(L.letter, { size: 'word' })}</span>
      <span class="he he--display he--cursive" lang="he">${esc(L.letter)}</span>
      <span class="hint">${esc(L.namePt)}</span>
    </div>`;
  }).join('');

  const finalCells = letters.filter(l => l.finalForm).map(L => `<div class="cursive-cell">
      <span class="cursive-print">${he(L.finalForm, { size: 'word' })}</span>
      <span class="he he--display he--cursive" lang="he">${esc(L.finalForm)}</span>
      <span class="hint">${esc(L.namePt)} final</span>
    </div>`).join('');

  const p4 = `
    ${badge('Apêndice D — quadro de cursiva')}
    <h1>Impressa e cursiva, lado a lado</h1>
    <p class="lead">A letra de imprensa é a que você lê em livros, placas e telas. A cursiva é a que se escreve à mão — e é bem diferente. Israelenses usam as duas todos os dias.</p>

    <h2>As 22 letras</h2>
    <div class="cursive-grid">${cursiveCells}</div>

    <h2>As 5 formas finais</h2>
    <div class="cursive-grid">${finalCells}</div>

    ${callout('tip', '💡', `<p>Ninguém escreve hebraico à mão em letra de imprensa, do mesmo jeito que ninguém escreve português à mão em letra de fôrma o tempo todo. Se você pretende escrever, a cursiva é a que vale a pena treinar.</p>`)}
  `;

  return [sheet(p1, 1), sheet(p2, 2), sheet(p3, 3), sheet(p4, 4)].join('\n');
}

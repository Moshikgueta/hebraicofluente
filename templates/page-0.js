/* Página 0 - Os sinais de vogal.
   Comes BEFORE letter 1. Presents nikud by SOUND, not by name; the names live
   in the appendix. Also carries the correction to the "22 letras, todas
   consoantes" claim. */

import { he, heList, esc, mixed, H, prose } from '../scripts/lib/render.js';
import { badge, callout, chunk } from './partials.js';

export function renderPage0(ctx) {
  const N = ctx.nikud;

  const soundBlock = s => `
    <div class="vowel-row">
      <div class="vowel-sound">
        <span class="vowel-key">${esc(s.sound === 'sheva' ? 'sheva' : s.sound)}</span>
        <span class="hint">${esc(s.ptApprox)}</span>
      </div>
      <div class="vowel-signs">
        ${s.signs.map(g => `
          <div class="vowel-sign">
            ${he(g.demo, { size: 'word' })}
            <span class="hint">${prose(g.position)}</span>
          </div>`).join('')}
      </div>
      <p class="vowel-note">${prose(s.note)}</p>
    </div>`;

  const sheets = [];

  sheets.push(`
    ${badge('Página 0 - antes da primeira letra')}
    <h1>${esc(N.intro.title)}</h1>
    <p class="lead">${prose(N.intro.lead)}</p>

    ${callout('info', 'ℹ️', `
      <h3>Uma correção importante</h3>
      <p>${prose(N.intro.correction)}</p>`)}

    <h2>Como ler uma sílaba</h2>
    <p>A ordem é sempre a mesma: primeiro a consoante, depois a vogal - mesmo quando o sinal da vogal aparece embaixo ou acima da letra. A letra vem antes no som, sempre.</p>
    <p>${mixed(['Todos os exemplos das próximas páginas usam a letra ', H('מ'),
      ' apenas como apoio - você a estudará a seguir. Concentre-se no sinal, não na letra.'])}</p>
    <p class="ex-task"><span>Leia em voz alta:</span> ${heList(['מַ', 'מֶ', 'מִ', 'מוֹ', 'מוּ'], { size: 'word' })}</p>`);

  /* Three sounds to a sheet: each one carries its signs, positions and note. */
  chunk(N.sounds, 3).forEach((g, gi, all) => {
    sheets.push(`
    ${badge('Página 0 - os seis sons' + (gi ? ' · continuação' : ''))}
    <h1>Os seis sons${all.length > 1 ? ` (${gi + 1} de ${all.length})` : ''}</h1>
    <div class="vowel-list">${g.map(soundBlock).join('')}</div>`);
  });

  sheets.push(`
    ${badge('Página 0 - continuação')}
    <h1>O ponto dentro da letra</h1>
    <p class="lead">${prose(N.dagesh.text)}</p>

    <table>
      <thead><tr><th>Sem ponto</th><th>Som</th><th>Com ponto</th><th>Som</th></tr></thead>
      <tbody>
        <tr><td class="center">${he('ב', { size: 'word' })}</td><td>v - como em "vaca"</td>
            <td class="center">${he('בּ', { size: 'word' })}</td><td>b - como em "bola"</td></tr>
        <tr><td class="center">${he('כ', { size: 'word' })}</td><td>ch - raspado, como o R carioca</td>
            <td class="center">${he('כּ', { size: 'word' })}</td><td>k - como em "casa"</td></tr>
        <tr><td class="center">${he('פ', { size: 'word' })}</td><td>f - como em "faca"</td>
            <td class="center">${he('פּ', { size: 'word' })}</td><td>p - como em "pato"</td></tr>
      </tbody>
    </table>

    ${callout('tip', '💡', `
      <p>No hebraico do dia a dia - jornais, placas, mensagens - os sinais de vogal <strong>não são escritos</strong>. Eles existem para quem está aprendendo, para textos religiosos, poesia e livros infantis. Você vai começar com eles e deixá-los para trás naturalmente.</p>`)}

    ${callout('note', '📌', `
      <p>Não decore os nomes dos sinais agora. Você precisa reconhecer o <strong>som</strong>. Os nomes estão no apêndice, para quando forem úteis.</p>`)}`);

  return sheets;
}

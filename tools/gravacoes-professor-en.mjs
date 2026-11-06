/* O roteiro das gravações do professor em INGLÊS (PLANO-INGLES.md).
 * ─────────────────────────────────────────────────────────────────────────
 * As explicações faladas do professor (tools/gravacoes-professor.mjs) são
 * em português, e por isso a build em inglês sai sem elas (professor.json
 * vazio). Este arquivo escreve o mesmo roteiro em inglês, com os mesmos ids,
 * para o dia em que o dono quiser gravá-las:
 *
 *   · as geradas (abertura de módulo, apresentação da letra, erro comum,
 *     parabéns do exame) saem do conteúdo em inglês (data/en/), como as do
 *     português saem do conteúdo em português;
 *   · as oito escritas à mão foram adaptadas a quem fala inglês (a
 *     comparação com o R de "carro" virou a do "Bach"; a do "bem" português
 *     não tem par em inglês e fica marcada como dispensável).
 *
 * São roteiros, não textos para ler palavra por palavra, como no português.
 * O hebraico é o do curso. Ligar as gravações em inglês ao site (ids próprios
 * no catálogo de áudio, professor.json da build em inglês) fica para quando
 * houver gravação.
 *
 * Uso (da raiz): node tools/gravacoes-professor-en.mjs > GRAVACOES-EM-INGLES.md
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { gravacoesDoProfessor } from './gravacoes-professor.mjs';
import { translitEn } from './translit-en.mjs';

const ROOT = new URL('..', import.meta.url).pathname;
const ler = p => JSON.parse(readFileSync(join(ROOT, p), 'utf8'));
const semChaves = s => String(s ?? '').replace(/\{\{|\}\}/g, '');

const EN = {};
for (const a of ['letters', 'modules']) EN[a] = ler(`data/en/${a}.json`);
const em = (arq, caminho, reserva = '') => semChaves(EN[arq][caminho]?.en ?? reserva);

/* As escritas à mão, adaptadas. Mesmo id do português. */
export const ESCRITAS_EN = {
  'intro-rtl-reading': {
    titulo: 'Listen to your teacher explain it', onde: 'Lesson 0 · Right to left',
    roteiro: 'Explain that Hebrew is read from right to left. Show the word שָׁלוֹם: reading starts at ש, on the right, and ends at ם, on the left. Remind them that the course screens stay in English.'
  },
  'intro-nikud-vowels': {
    titulo: 'Listen to your teacher explain it', onde: 'Lesson 0 · Nikud',
    roteiro: 'Explain that the letters are, at heart, the consonants, and that nikud marks the vowels below, above or inside the letter. Read the three words in the box: סֵפֶר, סָפַר, סַפָּר.'
  },
  'letter-het-pronunciation': {
    titulo: 'Practice the sound with your teacher', onde: 'Lesson of ח',
    roteiro: 'Say ח on its own, slowly, then חַ, חָלָב and לֶחֶם. Compare it with the ch in "Bach" or the Scottish "loch", and say it is only an approximation. Make clear it is not the ch of "chair".'
  },
  'final-mem-vs-nun': {
    titulo: 'Listen to your teacher explain it', onde: 'Module 6 · The final forms (ם and ן)',
    roteiro: 'Say שָׁם and שֵׁן slowly, twice each. Show that with ם the lips close at the end (/m/) and with ן the tongue touches behind the teeth, with the mouth open (/n/).'
  },
  'portuguese-em-vs-hebrew-mem': {
    titulo: 'Listen to your teacher explain it', onde: 'Module 6 · The final forms (ם and ן)',
    roteiro: 'OPTIONAL in English: this one compares the Portuguese "bem" with שָׁם, and English already says a full M at the end of a word. If recorded, just say שָׁם (sham) slowly and show the lips closing on the M.',
    dispensavel: true
  },
  'international-words-pronunciation': {
    titulo: 'Listen to your teacher explain it', onde: 'Letter lessons · You already know these words',
    roteiro: 'Explain that international words in Hebrew take the Hebrew stress and vowels, not the English ones: give two examples, like טֶלֶפוֹן and בָּנָנָה, saying each one in Hebrew and then in English.'
  },
  'letter-alef-tav-example': {
    titulo: 'Listen to your teacher explain it', onde: 'Lesson of ת · Words (אַתְ)',
    roteiro: 'Read אַתְ ("at", you, to a woman) and explain that the sign under ת does not change the sound: it is read just "at". Show that the same two letters also make אֶת ("et"), the word that comes before a definite object, and that the nikud decides which of the two it is.'
  },
  'reading-lab-how-to': {
    titulo: 'Listen to your teacher explain it', onde: 'Reading lab · top of the page',
    roteiro: 'Show how to read a new word: start with the letter on the right, say the sound of the letter together with the vowel under it, move left and, at the end, put it all together into one word. Use שָׁלוֹם as the example, slowly and then at normal speed.'
  }
};

export function gravacoesEmIngles() {
  const pt = gravacoesDoProfessor(ROOT);
  const letras = new Map(ler('data/letters.json').map(L => [L.id, L]));
  const modulos = new Map(ler('data/modules.json').modules.map(m => [m.n, m]));
  return pt.map(g => {
    if (ESCRITAS_EN[g.id]) return { id: g.id, ...ESCRITAS_EN[g.id], pt: g.roteiroPt };
    let m;
    if ((m = g.id.match(/^module-(\d+)-welcome$/))) {
      const mod = modulos.get(Number(m[1]));
      const chave = `modules/${mod.id}`;
      return {
        id: g.id, titulo: 'A message from your teacher', onde: `Module ${mod.n} · opening`, pt: g.roteiroPt,
        roteiro: `Welcome them to module ${mod.n}, "${em('modules', `${chave}/titlePt`, mod.titlePt)}". In two or three sentences, `
          + `say what they will be able to do by the end of it: ${em('modules', `${chave}/milestonePt`, mod.milestonePt)}`
      };
    }
    if ((m = g.id.match(/^letter-([a-z]+)-intro$/))) {
      const L = letras.get(m[1]);
      const nome = em('letters', `${L.id}/namePt`, L.namePt);
      const w = L.wordsToRead?.[0];
      const sentido = w ? em('letters', `${L.id}/wordsToRead/#0/pt`, w.pt) : '';
      return {
        id: g.id, titulo: `Meet the letter ${nome} with your teacher`, onde: `Lesson of ${L.letter} · Meet`, pt: g.roteiroPt,
        roteiro: `Introduce the letter ${nome} (${L.letter}): its name, its sound and how it appears in a word`
          + (w ? `, with the example ${w.he} (${translitEn(w.translit)}, ${sentido})` : '') + '. Under a minute.'
      };
    }
    if ((m = g.id.match(/^letter-([a-z]+)-common-mistake$/))) {
      const L = letras.get(m[1]);
      const c = `${L.id}/brazilianMistake`;
      const texto = ['wrong', 'right', 'why'].map(k => em('letters', `${c}/${k}`)).join(' ');
      /* A nota só onde o erro ainda é o de quem fala português. */
      const nota = /portugu|brazil|french|spanish/i.test(texto)
        ? ' This box still describes the mistake Portuguese speakers make: if English speakers make a different one, explain that one instead (the native reviewers are checking these).'
        : '';
      return {
        id: g.id, titulo: 'The most common mistake, explained by your teacher', onde: `Lesson of ${L.letter} · common mistake box`, pt: g.roteiroPt,
        roteiro: `Explain the mistake learners often make: ${em('letters', `${c}/wrong`)} The right way: ${em('letters', `${c}/right`)} `
          + `Why: ${em('letters', `${c}/why`)} Say the Hebrew examples out loud.${nota}`
      };
    }
    if (g.id === 'final-exam-congrats') {
      return {
        id: g.id, titulo: 'A message from your teacher', onde: 'Final challenge · passed', pt: g.roteiroPt,
        roteiro: 'Congratulate them on passing the final alphabet challenge. Say what they can already read and what the next step is. '
          + 'Do not mention an official level or certification: the course certificate is not a diploma.'
      };
    }
    throw new Error(`gravação sem roteiro em inglês: ${g.id}`);
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const todas = gravacoesEmIngles();
  const fora = todas.filter(g => g.dispensavel).length;
  const out = [
    '# Gravações do professor em inglês',
    '',
    `Gerado por \`node tools/gravacoes-professor-en.mjs\`. ${todas.length} gravações, com os mesmos ids das em português`,
    `(${fora} marcada${fora === 1 ? '' : 's'} como dispensável em inglês). São roteiros: diga com as suas palavras, como nas em`,
    'português. Cada uma tem menos de um minuto. O hebraico é o do curso; a transliteração é a do site em inglês.',
    '',
    'O site em inglês ainda não toca estas gravações: ligar entra no código quando elas existirem.',
    ''
  ];
  let grupo = '';
  for (const g of todas) {
    const novo = g.id.startsWith('module-') ? 'Aberturas dos módulos' : g.id.startsWith('letter-') && /-(intro|common-mistake)$/.test(g.id)
      ? 'Letra por letra' : g.id === 'final-exam-congrats' ? 'Fim do curso' : 'Explicações escritas uma a uma';
    if (novo !== grupo) { out.push(`## ${novo}`, ''); grupo = novo; }
    out.push(`### ${g.titulo}${g.dispensavel ? ' (dispensável)' : ''}`, '', `- Onde: ${g.onde}`, `- Id: \`${g.id}\``, '', g.roteiro, '');
  }
  process.stdout.write(out.join('\n'));
}

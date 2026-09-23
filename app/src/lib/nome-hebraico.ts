/* Um nome brasileiro escrito em hebraico - uma SUGESTÃO, nunca a resposta.
 * ─────────────────────────────────────────────────────────────────────────
 * Transliterar nome não é ciência exata. Em Israel, "Gabriel" se escreve
 * גבריאל; "Lucas" aparece como לוקס e como לוקאס; "Gueta" pode ser גטה, se o u
 * é mudo como em português, ou גואטה, se a família o pronuncia. Quem decide é
 * a pessoa. Este arquivo faz duas coisas e só elas:
 *
 *   1. propõe uma grafia pelas convenções que um israelense usaria para um
 *      nome estrangeiro - vogal do meio da palavra quase sempre sem letra, a
 *      no fim vira ה, o/u viram ו, i vira י, e as formas finais no fim;
 *   2. propõe VARIANTES quando há uma escolha real (a vogal do meio escrita
 *      ou não; o u de "gu"/"qu" pronunciado ou não), para a tela dizer com
 *      honestidade que existe mais de um jeito.
 *
 * O som de J de "João" e o G de "Gisele" (/ʒ/) não existe no alfabeto
 * básico: o hebraico moderno escreve ז׳ - o zayin com o gerech, que o curso
 * ensina no módulo 7. É a única marca fora das 22 letras que aparece aqui.
 */

import { BASE_TO_FINAL } from '@/lib/hebrew';

export const GERESH = '׳';

type Opcoes = {
  /** Escrever o a do meio da palavra com א, como em לוקאס. */
  plena: boolean;
  /** Pronunciar o u de "gu"/"qu" antes de e/i, como em גואטה. */
  uAudivel: boolean;
};

const VOGAL = /[aeiouáàâãéêíóôõúü]/;
const tirarAcento = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '');

/** Uma palavra do nome, em hebraico, por uma das convenções. */
function palavra(original: string, o: Opcoes): string {
  /* O acento some, MAS antes o "ão"/"õe" nasal é lembrado: "João" é o-a-o. */
  const w = tirarAcento(original.toLowerCase()).replace(/[^a-z]/g, '');
  const out: string[] = [];
  const ehVogal = (i: number) => i >= 0 && i < w.length && VOGAL.test(w[i]!);
  let i = 0;
  let ultimaFoiAlef = false;

  const poe = (s: string) => { out.push(s); ultimaFoiAlef = s === 'א'; };

  while (i < w.length) {
    const c = w[i]!, d = w[i + 1] ?? '', e = w[i + 2] ?? '';
    const inicio = out.length === 0;
    const fim = i === w.length - 1;

    /* ── dígrafos ── */
    if ((c === 'c' || c === 's') && d === 'h') { poe('ש'); i += 2; continue; }
    if (c === 'n' && d === 'h') { poe('נ'); poe('י'); i += 2; continue; }
    if (c === 'l' && d === 'h') { poe('ל'); poe('י'); i += 2; continue; }
    if (c === 'p' && d === 'h') { poe('פ'); i += 2; continue; }
    if (c === 't' && d === 'h') { poe('ט'); i += 2; continue; }
    if ((c === 'g' || c === 'q') && d === 'u' && (e === 'e' || e === 'i')) {
      poe(c === 'g' ? 'ג' : 'ק');
      if (o.uAudivel) { poe('ו'); poe(e === 'i' ? 'י' : 'א'); i += 3; continue; }
      /* O u é mudo: a vogal que vem depois é a primeira depois de uma
         CONSOANTE, e é tratada aqui mesmo - senão o u, que não soa, contaria
         como vogal e "Gueta" viraria גאטה. */
      if (e === 'i') poe('י');
      else if (i + 2 === w.length - 1) poe('ה');
      i += 3; continue;
    }
    if (c === 'q' && d === 'u') { poe('ק'); poe('ו'); i += 2; continue; }
    if ((c === 's' || c === 'r' || c === 'l' || c === 't' || c === 'n' || c === 'm' || c === 'p' || c === 'f')
        && d === c) { i += 1; continue; }

    /* ── vogais ── */
    if (VOGAL.test(c)) {
      /* "Início" é não ter escrito nada ainda: o h mudo de Helena não conta,
         e o e dela abre a palavra com א. */
      const abre = out.length === 0;
      const depoisDeVogal = ehVogal(i - 1);
      const antesDeVogal = ehVogal(i + 1);
      if (c === 'i') { if (abre) poe('א'); poe('י'); i++; continue; }
      if (c === 'o' || c === 'u') {
        if (abre) poe('א');
        poe('ו'); i++; continue;
      }
      /* a, e */
      if (abre) { poe('א'); i++; continue; }
      if (fim) { poe('ה'); i++; continue; }
      if (depoisDeVogal) { if (!ultimaFoiAlef) poe('א'); i++; continue; }
      if (antesDeVogal) { poe('א'); i++; continue; }
      /* A vogal do meio, entre consoantes, fica sem letra - é a convenção.
         A variante "plena" escreve o a com א (לוקאס); o e continua sem letra
         nas duas, porque um י ali ("פידרו") passa a soar i. */
      if (o.plena && c === 'a') poe('א');
      i++; continue;
    }

    /* ── consoantes ── */
    switch (c) {
      case 'b': poe('ב'); break;
      case 'c': poe(d === 'e' || d === 'i' ? 'ס' : 'ק'); break;
      case 'd': poe('ד'); break;
      case 'f': poe('פ'); break;
      /* g antes de e/i é /ʒ/ no Brasil: Gisele, Gérson. */
      case 'g': poe(d === 'e' || d === 'i' ? `ז${GERESH}` : 'ג'); break;
      case 'h': break;                               // mudo, como em Helena
      case 'j': poe(`ז${GERESH}`); break;
      case 'k': poe('ק'); break;
      case 'l': poe('ל'); break;
      case 'm': poe('מ'); break;
      case 'n': poe('נ'); break;
      case 'p': poe('פ'); break;
      case 'q': poe('ק'); break;
      case 'r': poe('ר'); break;
      /* s entre vogais soa z: Rosa, Luísa, Isabel. */
      case 's': poe(ehVogal(i - 1) && ehVogal(i + 1) ? 'ז' : 'ס'); break;
      /* t estrangeiro é ט na convenção israelense: טום, מרטין. */
      case 't': poe('ט'); break;
      case 'v': poe(inicio ? 'ו' : 'וו'); break;
      case 'w': poe('ו'); break;
      /* x: "Xavier" é ch; "Alex", "Félix", no fim, é ks. */
      case 'x': poe(fim || (d && !VOGAL.test(d)) ? 'קס' : 'ש'); break;
      case 'y': poe('י'); break;
      case 'z': poe('ז'); break;
      default: break;
    }
    i++;
  }

  const letras = [...out.join('')];
  /* A forma final, na última LETRA da palavra (o gerech não conta). */
  for (let k = letras.length - 1; k >= 0; k--) {
    if (letras[k] === GERESH) continue;
    const fin = BASE_TO_FINAL[letras[k]!];
    if (fin) letras[k] = fin;
    break;
  }
  return letras.join('');
}

/** Até três grafias para o nome, a mais comum primeiro, sem repetir. */
export function sugerirNome(nome: string): string[] {
  const partes = nome.trim().split(/\s+/).filter(p => /[a-zA-ZÀ-ÿ]/.test(p));
  if (!partes.length) return [];
  const conv: Opcoes[] = [
    { plena: false, uAudivel: false },
    { plena: true, uAudivel: false },
    { plena: false, uAudivel: true }
  ];
  const out: string[] = [];
  for (const o of conv) {
    const g = partes.map(p => palavra(p, o)).filter(Boolean).join(' ');
    if (g && !out.includes(g)) out.push(g);
  }
  return out;
}

/** As letras BASE que a grafia usa - o que o aluno precisa ter aprendido. */
export function letrasDoNome(grafia: string): string[] {
  const FINAL_TO_BASE: Record<string, string> = { 'ם': 'מ', 'ן': 'נ', 'ץ': 'צ', 'ף': 'פ', 'ך': 'כ' };
  return [...new Set([...grafia].filter(ch => /[א-ת]/.test(ch)).map(ch => FINAL_TO_BASE[ch] ?? ch))];
}

/* ── quando a atividade abre ───────────────────────────────────────────── */

export type Disponibilidade = {
  sugestoes: string[];
  /** A primeira sugestão que o aluno JÁ consegue escrever, se houver. */
  escrevivel: string | null;
  /** Quantas letras faltam para a sugestão mais próxima. Nunca quais. */
  faltam: number;
};

/** O que o aluno pode fazer com o próprio nome hoje, dadas as letras BASE
 *  que ele já concluiu. Nunca diz quais faltam - só quantas. */
export function disponibilidade(nome: string, aprendidas: readonly string[]): Disponibilidade {
  const sugestoes = sugerirNome(nome);
  const sabe = new Set(aprendidas);
  let escrevivel: string | null = null;
  let faltam = Infinity;
  for (const s of sugestoes) {
    const f = letrasDoNome(s).filter(l => !sabe.has(l)).length;
    if (f === 0 && !escrevivel) escrevivel = s;
    faltam = Math.min(faltam, f);
  }
  return { sugestoes, escrevivel, faltam: sugestoes.length ? faltam : 0 };
}


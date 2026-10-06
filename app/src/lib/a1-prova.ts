/* O exame final do A1: sorteio, prova sem gabarito e correção (06/10/2026).
 * ─────────────────────────────────────────────────────────────────────────
 * Um arquivo só, sem dependência nenhuma (nem os atalhos `@/`), porque quem
 * o usa é o WORKER: o exame é corrigido no servidor. O navegador recebe a
 * prova sem gabarito e manda as respostas cruas; quem diz se acertou é o
 * servidor, e é a aprovação gravada lá (tabela provas_a1) que libera o
 * certificado. Mexer no estado do navegador não aprova ninguém.
 *
 * Três cuidados:
 *   · as opções de cada pergunta saem EMBARALHADAS pelo servidor, e a
 *     resposta volta como a posição na ordem embaralhada: no arquivo, a certa
 *     costuma ser a primeira, e mandar as opções na ordem do arquivo seria
 *     mandar o gabarito;
 *   · o "montar" volta como a ordem das peças embaralhadas, pelo mesmo motivo;
 *   · a escrita é conferida como no curso inteiro: sem nikud, sem forma
 *     final, sem espaço nem pontuação, só a sequência de letras (o mesmo que
 *     hebraicoDigitadoCerto; um teste confere que os dois concordam).
 */

export type ItemDeProva = {
  t: string;
  q?: string; pt?: string; he?: string; audioId?: string;
  opcoes?: string[]; certa?: number | boolean; respostas?: string[];
  antes?: string; depois?: string; errada?: string; palavras?: string[];
  linhas?: [string, string][]; porque?: string;
};
export type ParteDaProva = {
  id: string; tituloPt: string; unidades: number[]; itens: ItemDeProva[];
  texto?: { tipoPt?: string; he: string; pt: string };
};
export type Exame = { sorteio: number; aprovacao: number; partes: ParteDaProva[] };

/** Um item sorteado: a parte, o item, e a ordem em que as peças saíram. */
export type Sorteado = { p: number; i: number; perm?: number[] };

export type ItemPublico = {
  t: string; q?: string; pt?: string; he?: string; audioId?: string;
  opcoes?: string[]; antes?: string; depois?: string; errada?: string;
  palavras?: string[]; linhas?: [string, string][];
};
export type ParteDaProvaPublica = { id: string; tituloPt: string; texto?: { tipoPt?: string; he: string }; itens: ItemPublico[] };

/** O que o aluno manda: a posição da opção, verdadeiro/falso, o texto
 *  digitado, ou a ordem das peças. null = deixou em branco. */
export type Resposta = number | boolean | string | number[] | null;

export const TIPOS_DE_ESCOLHA = ['escolha', 'ouvir', 'intruso', 'dialogo'] as const;
const ehEscolha = (t: string) => (TIPOS_DE_ESCOLHA as readonly string[]).includes(t);
const ehEscrita = (t: string) => t === 'completar' || t === 'escrever' || t === 'erro';

function embaralhar<T>(arr: readonly T[], aleatorio: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(aleatorio() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

/** Uma ordem das peças que não seja a original (com duas ou mais). */
function permutacao(n: number, aleatorio: () => number): number[] {
  const idx = Array.from({ length: n }, (_, i) => i);
  let p = embaralhar(idx, aleatorio);
  if (n > 1 && p.every((v, i) => v === i)) p = [...idx].reverse();
  return p;
}

/**
 * Sorteia uma prova: `sorteio` itens por parte. Um item de escuta sem
 * gravação fica de fora (nada de voz sintética); uma parte sem nenhum item
 * possível fica de fora da prova e da nota, e o relatório diz por quê.
 */
export function sortear(exame: Exame, aleatorio: () => number, temAudio: (id?: string) => boolean): Sorteado[] {
  const out: Sorteado[] = [];
  exame.partes.forEach((parte, p) => {
    const possiveis = parte.itens
      .map((it, i) => ({ it, i }))
      .filter(({ it }) => it.t !== 'ouvir' || temAudio(it.audioId));
    for (const { it, i } of embaralhar(possiveis, aleatorio).slice(0, exame.sorteio)) {
      const s: Sorteado = { p, i };
      if (ehEscolha(it.t)) s.perm = permutacao(it.opcoes!.length, aleatorio);
      else if (it.t === 'montar') s.perm = permutacao(it.palavras!.length, aleatorio);
      out.push(s);
    }
  });
  return out;
}

/** O item como o aluno o vê: sem `certa`, sem `respostas`, sem `porque`. */
export function itemPublico(it: ItemDeProva, perm?: number[]): ItemPublico {
  const base: ItemPublico = { t: it.t };
  if (ehEscolha(it.t)) {
    return {
      ...base, q: it.q,
      ...(it.he ? { he: it.he } : {}), ...(it.audioId ? { audioId: it.audioId } : {}),
      ...(it.linhas ? { linhas: it.linhas } : {}),
      opcoes: (perm ?? it.opcoes!.map((_, k) => k)).map(k => it.opcoes![k]!)
    };
  }
  switch (it.t) {
    case 'vf': return { ...base, q: it.q };
    case 'completar': return { ...base, q: it.q, antes: it.antes ?? '', depois: it.depois ?? '' };
    case 'escrever': return { ...base, pt: it.pt };
    case 'erro': return { ...base, q: it.q, errada: it.errada };
    case 'montar': return { ...base, pt: it.pt, palavras: (perm ?? it.palavras!.map((_, k) => k)).map(k => it.palavras![k]!) };
    default: throw new Error(`tipo de item fora do exame: ${it.t}`);
  }
}

/** A prova pública, parte a parte, na ordem do sorteio. */
export function provaPublica(exame: Exame, sorteio: Sorteado[]): ParteDaProvaPublica[] {
  const partes: ParteDaProvaPublica[] = [];
  for (const s of sorteio) {
    const parte = exame.partes[s.p]!;
    let atual = partes.find(x => x.id === parte.id);
    if (!atual) {
      atual = { id: parte.id, tituloPt: parte.tituloPt, itens: [], ...(parte.texto ? { texto: { tipoPt: parte.texto.tipoPt, he: parte.texto.he } } : {}) };
      partes.push(atual);
    }
    atual.itens.push(itemPublico(parte.itens[s.i]!, s.perm));
  }
  return partes;
}

/* ── a escrita: só as letras ──────────────────────────────────────────── */
const FINAIS: Record<string, string> = { 'ך': 'כ', 'ם': 'מ', 'ן': 'נ', 'ף': 'פ', 'ץ': 'צ' };
export const soLetras = (s: string): string =>
  s.normalize('NFC').replace(/[֑-ׇ]/g, '').replace(/[^א-ת]/g, '').replace(/[ךםןףץ]/g, c => FINAIS[c]!);
export const digitadoCerto = (digitado: string, aceitas: readonly string[]): boolean => {
  const d = soLetras(digitado);
  return d.length > 0 && aceitas.some(a => soLetras(a) === d);
};

/* ── a correção ───────────────────────────────────────────────────────── */
export type ItemCorrigido = { parte: string; certo: boolean; certaPt: string; porque?: string };
export type Correcao = {
  nota: number;
  aprovado: boolean;
  partes: Record<string, { correct: number; total: number }>;
  itens: ItemCorrigido[];
  /** As unidades das partes que ficaram abaixo da aprovação. */
  revisar: number[];
  /** As partes que ficaram fora (escuta sem gravação). */
  fora: string[];
};

function acertou(it: ItemDeProva, s: Sorteado, r: Resposta): boolean {
  if (ehEscolha(it.t)) return typeof r === 'number' && Number.isInteger(r) && s.perm![r] === it.certa;
  if (it.t === 'vf') return typeof r === 'boolean' && r === it.certa;
  if (ehEscrita(it.t)) return typeof r === 'string' && r.length <= 200 && digitadoCerto(r, it.respostas ?? []);
  if (it.t === 'montar') {
    const n = it.palavras!.length;
    if (!Array.isArray(r) || r.length !== n || new Set(r).size !== n || r.some(k => !Number.isInteger(k) || k < 0 || k >= n)) return false;
    return r.map(k => it.palavras![s.perm![k]!]).join(' ') === it.palavras!.join(' ');
  }
  return false;
}

function certaEmTexto(it: ItemDeProva): string {
  if (ehEscolha(it.t)) return it.opcoes![it.certa as number]!;
  if (it.t === 'vf') return it.certa ? 'Verdadeiro' : 'Falso';
  if (it.t === 'montar') return it.palavras!.join(' ');
  return it.respostas?.[0] ?? '';
}

export function corrigir(exame: Exame, sorteio: Sorteado[], respostas: readonly Resposta[]): Correcao {
  const partes: Record<string, { correct: number; total: number }> = {};
  const itens: ItemCorrigido[] = [];
  sorteio.forEach((s, k) => {
    const parte = exame.partes[s.p]!;
    const it = parte.itens[s.i]!;
    const certo = acertou(it, s, respostas[k] ?? null);
    const reg = partes[parte.id] ?? (partes[parte.id] = { correct: 0, total: 0 });
    reg.total++;
    if (certo) reg.correct++;
    itens.push({ parte: parte.id, certo, certaPt: certaEmTexto(it), ...(it.porque ? { porque: it.porque } : {}) });
  });
  const total = itens.length;
  const certas = itens.filter(i => i.certo).length;
  const nota = total ? certas / total : 0;
  const revisar = [...new Set(exame.partes
    .filter(p => partes[p.id] && partes[p.id]!.correct / partes[p.id]!.total < exame.aprovacao)
    .flatMap(p => p.unidades))].sort((a, b) => a - b);
  const fora = exame.partes.filter(p => !partes[p.id]).map(p => p.id);
  return { nota, aprovado: total > 0 && nota >= exame.aprovacao, partes, itens, revisar, fora };
}

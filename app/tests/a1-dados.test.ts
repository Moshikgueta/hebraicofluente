/* O curso Hebraico A1 (data/a1/, um arquivo por unidade).
 * ─────────────────────────────────────────────────────────────────────────
 * O A1 é escrito à mão, item por item. Este teste confere a FORMA de tudo,
 * porque um erro de digitação aqui vira um exercício que não tem resposta
 * certa, e o aluno não tem como saber que a culpa não é dele:
 *   · os módulos de curso.json apontam para unidades que existem, cada uma
 *     uma vez, e cada arquivo é a unidade que o nome diz;
 *   · cada unidade com palavras, gramática, diálogo e exercícios;
 *   · todo exercício com os campos do seu tipo, a resposta dentro das opções,
 *     e o retorno de opção errada apontando para uma opção errada de verdade;
 *   · as respostas escritas só com letras hebraicas (são conferidas sem nikud,
 *     como no alfabeto - ver hebraicoDigitadoCerto);
 *   · o exame só com tipos que o servidor sabe corrigir;
 *   · o A1 não abre para venda com unidade que o dono ainda não revisou;
 *   · nenhum travessão (regra do dono para todo texto do site). */

import { describe, expect, it } from 'vitest';
import { existsSync, readdirSync, readFileSync } from 'node:fs';

type Item = Record<string, unknown> & { t: string };
type Unidade = {
  n: number; revisado: boolean; tituloPt: string; objetivoPt: string;
  palavras: ({ he: string; translit: string; pt: string } | { pt: string; formas: string[] })[];
  gramatica: { tituloPt: string; textoPt: string; erroPt?: string; exemplos?: { he: string; pt: string }[] }[];
  dialogo: { tituloPt: string; linhas: { quem: string; he: string; translit: string; pt: string }[] };
  leitura?: { tituloPt: string; linhas: { he: string; translit: string; pt: string }[]; perguntas: Item[] };
  cultura?: { tituloPt: string; textoPt: string }[];
  sabia?: { tituloPt: string; textoPt: string }[];
  autoavaliacao?: string[];
  exercicios: Item[];
};
type Parte = { id: string; tituloPt: string; unidades: number[]; itens: Item[]; texto?: { he: string; pt: string } };

const DIR = new URL('../../data/a1/', import.meta.url);
const ler = (nome: string) => readFileSync(new URL(nome, DIR), 'utf8');
const curso = JSON.parse(ler('curso.json')) as {
  modulos: { n: number; tituloPt: string; objetivoPt: string; unidades: number[] }[];
  certificado: { tituloPt: string; linhaPt: string; avisoPt: string };
};
const nomeDe = (n: number) => `unidades/u${String(n).padStart(2, '0')}.json`;
const ordem = curso.modulos.flatMap(m => m.unidades);
const unidades = ordem.map(n => JSON.parse(ler(nomeDe(n))) as Unidade);
const exame = JSON.parse(ler('exame.json')) as { sorteio: number; aprovacao: number; partes: Parte[] };

const TIPOS = ['escolha', 'ouvir', 'ligar', 'separar', 'montar', 'completar', 'erro', 'vf', 'intruso',
  'escrever', 'tabela', 'aberta', 'ditado', 'dialogo', 'ordenar'];
/* O exame é corrigido no servidor (worker/src/api/exame-a1.js), a partir de
   uma resposta simples: um índice, um sim/não, um texto ou uma ordem. */
const TIPOS_DO_EXAME = ['escolha', 'ouvir', 'intruso', 'vf', 'completar', 'escrever', 'erro', 'dialogo', 'montar'];
const HEBRAICO = /[א-ת]/;
/* A resposta digitada: letras hebraicas, espaço, e o ' do gerech. */
const SO_HEBRAICO = /^[א-ת׳' ]+$/;

/** Os problemas de forma de um item, em texto, para a mensagem do teste. */
function problemas(it: Item, onde: string): string[] {
  const p: string[] = [];
  const lista = (k: string) => Array.isArray(it[k]) ? it[k] as unknown[] : null;
  const respostas = () => {
    const r = lista('respostas') as string[] | null;
    if (!r || !r.length) p.push(`${onde}: sem respostas aceitas`);
    else for (const x of r) if (!SO_HEBRAICO.test(x)) p.push(`${onde}: resposta com algo além de letras hebraicas: "${x}"`);
  };
  if (!TIPOS.includes(it.t)) return [`${onde}: tipo desconhecido "${it.t}"`];
  switch (it.t) {
    case 'escolha': case 'ouvir': case 'intruso': case 'dialogo': {
      const op = lista('opcoes');
      if (!op || op.length < 2) p.push(`${onde}: menos de 2 opções`);
      else if (typeof it.certa !== 'number' || it.certa < 0 || it.certa >= op.length) p.push(`${onde}: certa fora das opções`);
      if (op && new Set(op).size !== op.length) p.push(`${onde}: opções repetidas`);
      if (it.t === 'ouvir' && !(typeof it.he === 'string' && HEBRAICO.test(it.he))) p.push(`${onde}: ouvir sem hebraico`);
      if (it.t === 'dialogo') {
        const l = lista('linhas') as [string, string][] | null;
        if (!l || !l.length || l.some(x => !x[0] || !HEBRAICO.test(x[1]))) p.push(`${onde}: diálogo sem falas`);
      }
      if (it.dicas !== undefined) {
        for (const k of Object.keys(it.dicas as object)) {
          const i = Number(k);
          if (!op || !Number.isInteger(i) || i < 0 || i >= op.length || i === it.certa) p.push(`${onde}: dica para a opção ${k}, que não é uma opção errada`);
        }
      }
      break;
    }
    case 'ligar': {
      const pares = lista('pares') as [string, string][] | null;
      if (!pares || pares.length < 3) p.push(`${onde}: menos de 3 pares`);
      else if (new Set(pares.map(x => x[1])).size !== pares.length) p.push(`${onde}: lado direito repetido`);
      break;
    }
    case 'separar': {
      const baldes = lista('baldes'); const itens = lista('itens') as [string, number][] | null;
      if (!baldes || baldes.length < 2) p.push(`${onde}: menos de 2 baldes`);
      if (!itens || itens.length < 4) p.push(`${onde}: menos de 4 itens`);
      else if (baldes) for (const [, b] of itens) if (b < 0 || b >= baldes.length) p.push(`${onde}: balde fora`);
      break;
    }
    case 'montar': {
      const pal = lista('palavras');
      if (!pal || pal.length < 2) p.push(`${onde}: montar com menos de 2 palavras`);
      break;
    }
    case 'ordenar': {
      const f = lista('falas') as string[] | null;
      if (!f || f.length < 3) p.push(`${onde}: ordenar com menos de 3 falas`);
      else if (new Set(f).size !== f.length) p.push(`${onde}: falas repetidas`);
      break;
    }
    case 'completar': case 'erro': case 'escrever':
      respostas();
      break;
    case 'ditado':
      if (!(typeof it.he === 'string' && HEBRAICO.test(it.he))) p.push(`${onde}: ditado sem hebraico`);
      respostas();
      break;
    case 'tabela': {
      const linhas = lista('linhas') as [string, string][] | null;
      if (!linhas || !linhas.length) p.push(`${onde}: tabela vazia`);
      else for (const [, x] of linhas) if (!SO_HEBRAICO.test(x)) p.push(`${onde}: resposta da tabela "${x}"`);
      break;
    }
    case 'vf':
      if (typeof it.certa !== 'boolean') p.push(`${onde}: vf sem certa booleana`);
      break;
    case 'aberta':
      if (typeof it.exemplo !== 'string' || !HEBRAICO.test(it.exemplo)) p.push(`${onde}: aberta sem exemplo em hebraico`);
      break;
  }
  return p;
}

describe('o curso Hebraico A1 (data/a1/)', () => {
  it('cada unidade aparece em um módulo só, e todo arquivo de unidade está num módulo', () => {
    expect(new Set(ordem).size).toBe(ordem.length);
    for (const n of ordem) expect(existsSync(new URL(nomeDe(n), DIR)), nomeDe(n)).toBe(true);
    const arquivos = readdirSync(new URL('unidades/', DIR)).filter(f => f.endsWith('.json')).sort();
    expect(arquivos).toEqual(ordem.map(nomeDe).map(f => f.slice('unidades/'.length)).sort());
    for (const m of curso.modulos) expect(m.tituloPt && m.objetivoPt && m.unidades.length, `módulo ${m.n}`).toBeTruthy();
  });

  it('cada arquivo é a unidade que o nome diz', () => {
    expect(unidades.map(u => u.n)).toEqual(ordem);
  });

  it('cada unidade tem palavras, gramática, diálogo e exercícios', () => {
    for (const u of unidades) {
      expect(typeof u.revisado, `unidade ${u.n}: revisado`).toBe('boolean');
      expect(u.tituloPt && u.objetivoPt, `unidade ${u.n}`).toBeTruthy();
      expect(u.palavras.length, `unidade ${u.n}: palavras`).toBeGreaterThanOrEqual(10);
      expect(u.gramatica.length, `unidade ${u.n}: gramática`).toBeGreaterThanOrEqual(2);
      expect(u.dialogo.linhas.length, `unidade ${u.n}: diálogo`).toBeGreaterThanOrEqual(4);
      expect(u.exercicios.length, `unidade ${u.n}: exercícios`).toBeGreaterThanOrEqual(18);
    }
  });

  it('toda palavra tem leitura e tradução, e toda linha de diálogo e de leitura também', () => {
    const faltam: string[] = [];
    for (const u of unidades) {
      for (const w of u.palavras) {
        if ('formas' in w) {
          if (!w.pt || !w.formas.length || w.formas.some(f => !HEBRAICO.test(f))) faltam.push(`${u.n}: formas de ${w.pt}`);
        } else if (!HEBRAICO.test(w.he) || !w.translit || !w.pt) faltam.push(`${u.n}: ${w.he}`);
      }
      for (const l of u.dialogo.linhas) if (!l.quem || !HEBRAICO.test(l.he) || !l.translit || !l.pt) faltam.push(`${u.n}: ${l.he}`);
      for (const l of u.leitura?.linhas ?? []) if (!HEBRAICO.test(l.he) || !l.translit || !l.pt) faltam.push(`${u.n}: leitura ${l.he}`);
      for (const g of u.gramatica) for (const e of g.exemplos ?? []) if (!HEBRAICO.test(e.he) || !e.pt) faltam.push(`${u.n}: exemplo ${e.he}`);
      for (const c of [...(u.cultura ?? []), ...(u.sabia ?? [])]) if (!c.tituloPt || !c.textoPt) faltam.push(`${u.n}: caixa sem texto`);
    }
    expect(faltam).toEqual([]);
  });

  it('todo exercício tem a forma do seu tipo, com a resposta dentro das opções', () => {
    const todos = unidades.flatMap(u => [
      ...u.exercicios.flatMap((it, i) => problemas(it, `unidade ${u.n} item ${i + 1}`)),
      ...(u.leitura?.perguntas ?? []).flatMap((it, i) => problemas(it, `unidade ${u.n} leitura ${i + 1}`))
    ]);
    expect(todos).toEqual([]);
  });

  it('o exame tem 6 partes de pelo menos 6 perguntas, sorteia 4, aprova com 70%, e só tem tipos que o servidor corrige', () => {
    expect(exame.sorteio).toBe(4);
    expect(exame.aprovacao).toBe(0.7);
    expect(exame.partes).toHaveLength(6);
    for (const p of exame.partes) {
      expect(p.itens.length, p.id).toBeGreaterThanOrEqual(6);
      expect(p.unidades.every(n => ordem.includes(n)), p.id).toBe(true);
      for (const it of p.itens) expect(TIPOS_DO_EXAME, `${p.id}: ${it.t}`).toContain(it.t);
    }
    const todos = exame.partes.flatMap(p => p.itens.flatMap((it, i) => problemas(it, `exame ${p.id} item ${i + 1}`)));
    expect(todos).toEqual([]);
    expect(exame.partes.find(p => p.id === 'leitura')!.texto!.he).toMatch(HEBRAICO);
  });

  it('o certificado diz que não é certificação oficial de nível', () => {
    expect(curso.certificado.avisoPt).toMatch(/não é uma certificação oficial/i);
    expect(curso.certificado.linhaPt).toContain('{nome}');
  });

  it('o A1 só abre para venda com todas as unidades revisadas pelo dono', () => {
    const catalogo = JSON.parse(readFileSync(new URL('../../data/courses.json', import.meta.url), 'utf8')) as {
      courses: { slug: string; status: string }[];
    };
    const a1 = catalogo.courses.find(c => c.slug === 'hebraico-a1')!;
    if (a1.status === 'available') {
      expect(unidades.filter(u => !u.revisado).map(u => u.n)).toEqual([]);
    }
  });

  it('a trilha da história tem 10 capítulos, cada um sugerido depois de uma unidade que existe', () => {
    const h = JSON.parse(ler('historia.json')) as { capitulos: { n: number; tituloPt: string; textoPt: string; depoisDaUnidade: number }[] };
    expect(h.capitulos.map(c => c.n)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    for (const c of h.capitulos) {
      expect(c.tituloPt && c.textoPt, `capítulo ${c.n}`).toBeTruthy();
      expect(ordem, `capítulo ${c.n}`).toContain(c.depoisDaUnidade);
    }
  });

  it('nenhum travessão em nenhum texto', () => {
    const todos = ['curso.json', 'exame.json', 'historia.json', ...ordem.map(nomeDe)].map(ler).join('\n');
    expect(todos).not.toMatch(/[–—]/);
  });
});

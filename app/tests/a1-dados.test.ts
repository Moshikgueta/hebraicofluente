/* O curso Hebraico A1 (data/a1.json, aprovado pelo dono em 06/10/2026).
 * ─────────────────────────────────────────────────────────────────────────
 * O A1 é escrito à mão, item por item, a partir do A1-RASCUNHO.md. Este teste
 * confere a FORMA de tudo, porque um erro de digitação aqui vira um exercício
 * que não tem resposta certa, e o aluno não tem como saber que a culpa não é
 * dele:
 *   · as 8 unidades, cada uma com palavras, gramática, diálogo e exercícios;
 *   · todo exercício com os campos do seu tipo, e a resposta dentro das opções;
 *   · as respostas escritas só com letras hebraicas (são conferidas sem nikud,
 *     como no alfabeto - ver hebraicoDigitadoCerto);
 *   · o exame com 6 partes de 6 perguntas, sorteando 4, aprovação de 70%;
 *   · nenhum travessão (regra do dono para todo texto do site). */

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

type Item = Record<string, unknown> & { t: string };
type Unidade = {
  n: number; tituloPt: string; objetivoPt: string;
  palavras: ({ he: string; translit: string; pt: string } | { pt: string; formas: string[] })[];
  gramatica: { tituloPt: string; textoPt: string; erroPt?: string }[];
  dialogo: { tituloPt: string; linhas: { quem: string; he: string; translit: string; pt: string }[] };
  exercicios: Item[];
};
type Parte = { id: string; tituloPt: string; unidades: number[]; itens: Item[]; texto?: { he: string; pt: string } };

const bruto = readFileSync(new URL('../../data/a1.json', import.meta.url), 'utf8');
const a1 = JSON.parse(bruto) as {
  revisado: boolean; unidades: Unidade[];
  exame: { sorteio: number; aprovacao: number; partes: Parte[] };
  certificado: { tituloPt: string; linhaPt: string; avisoPt: string };
};

const TIPOS = ['escolha', 'ouvir', 'ligar', 'separar', 'montar', 'completar', 'erro', 'vf', 'intruso', 'escrever', 'tabela', 'aberta'];
const HEBRAICO = /[א-ת]/;
/* A resposta digitada: letras hebraicas, espaço, e o ' do gerech. */
const SO_HEBRAICO = /^[א-ת׳' ]+$/;

/** Os problemas de forma de um item, em texto, para a mensagem do teste. */
function problemas(it: Item, onde: string): string[] {
  const p: string[] = [];
  const lista = (k: string) => Array.isArray(it[k]) ? it[k] as unknown[] : null;
  if (!TIPOS.includes(it.t)) return [`${onde}: tipo desconhecido "${it.t}"`];
  switch (it.t) {
    case 'escolha': case 'ouvir': case 'intruso': {
      const op = lista('opcoes');
      if (!op || op.length < 2) p.push(`${onde}: menos de 2 opções`);
      else if (typeof it.certa !== 'number' || it.certa < 0 || it.certa >= op.length) p.push(`${onde}: certa fora das opções`);
      if (op && new Set(op).size !== op.length) p.push(`${onde}: opções repetidas`);
      if (it.t === 'ouvir' && !(typeof it.he === 'string' && HEBRAICO.test(it.he))) p.push(`${onde}: ouvir sem hebraico`);
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
    case 'completar': case 'erro': case 'escrever': {
      const r = lista('respostas') as string[] | null;
      if (!r || !r.length) p.push(`${onde}: sem respostas aceitas`);
      else for (const x of r) if (!SO_HEBRAICO.test(x)) p.push(`${onde}: resposta com algo além de letras hebraicas: "${x}"`);
      break;
    }
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

describe('o curso Hebraico A1 (data/a1.json)', () => {
  it('está marcado como revisado pelo dono', () => {
    expect(a1.revisado).toBe(true);
  });

  it('tem as 8 unidades, na ordem, com palavras, gramática, diálogo e exercícios', () => {
    expect(a1.unidades.map(u => u.n)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    for (const u of a1.unidades) {
      expect(u.tituloPt && u.objetivoPt, `unidade ${u.n}`).toBeTruthy();
      expect(u.palavras.length, `unidade ${u.n}: palavras`).toBeGreaterThanOrEqual(10);
      expect(u.gramatica.length, `unidade ${u.n}: gramática`).toBeGreaterThanOrEqual(3);
      expect(u.dialogo.linhas.length, `unidade ${u.n}: diálogo`).toBeGreaterThanOrEqual(6);
      expect(u.exercicios.length, `unidade ${u.n}: exercícios`).toBeGreaterThanOrEqual(18);
    }
  });

  it('toda palavra tem leitura e tradução, e toda linha do diálogo também', () => {
    const faltam: string[] = [];
    for (const u of a1.unidades) {
      for (const w of u.palavras) {
        if ('formas' in w) {
          if (!w.pt || !w.formas.length || w.formas.some(f => !HEBRAICO.test(f))) faltam.push(`${u.n}: formas de ${w.pt}`);
        } else if (!HEBRAICO.test(w.he) || !w.translit || !w.pt) faltam.push(`${u.n}: ${w.he}`);
      }
      for (const l of u.dialogo.linhas) if (!l.quem || !HEBRAICO.test(l.he) || !l.translit || !l.pt) faltam.push(`${u.n}: ${l.he}`);
    }
    expect(faltam).toEqual([]);
  });

  it('todo exercício tem a forma do seu tipo, com a resposta dentro das opções', () => {
    const todos = a1.unidades.flatMap(u => u.exercicios.flatMap((it, i) => problemas(it, `unidade ${u.n} item ${i + 1}`)));
    expect(todos).toEqual([]);
  });

  it('o exame tem 6 partes de 6 perguntas, sorteia 4, e aprova com 70%', () => {
    const { exame } = a1;
    expect(exame.sorteio).toBe(4);
    expect(exame.aprovacao).toBe(0.7);
    expect(exame.partes.map(p => p.id)).toEqual(['vocabulario', 'concordancia', 'verbos', 'escuta', 'leitura', 'escrita']);
    for (const p of exame.partes) {
      expect(p.itens.length, p.id).toBe(6);
      expect(p.unidades.every(n => n >= 1 && n <= 8), p.id).toBe(true);
    }
    const todos = exame.partes.flatMap(p => p.itens.flatMap((it, i) => problemas(it, `exame ${p.id} item ${i + 1}`)));
    expect(todos).toEqual([]);
    expect(exame.partes.find(p => p.id === 'leitura')!.texto!.he).toMatch(HEBRAICO);
  });

  it('o certificado diz que não é certificação oficial de nível', () => {
    expect(a1.certificado.avisoPt).toMatch(/não é uma certificação oficial/i);
    expect(a1.certificado.linhaPt).toContain('{nome}');
  });

  it('nenhum travessão em nenhum texto', () => {
    expect(bruto).not.toMatch(/[–—]/);
  });
});

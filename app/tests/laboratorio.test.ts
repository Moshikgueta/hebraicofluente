/* O Laboratório de Leitura (lib/laboratorio.ts, app/leitura). */
import { describe, expect, it } from 'vitest';
import { conteudoPago } from '@/lib/content-servidor';
import { course } from '@/lib/content-publico';
import {
  bancoDePalavras, palavrasDaPrimeiraLeitura, palavrasDaRodada, pedacosDe
} from '@/lib/laboratorio';
import { alfabetoDe, consegueLer } from '@/lib/engine/palavras';
import { stripNikud } from '@/lib/hebrew';
import { rng } from '@/lib/engine/rng';
// @ts-expect-error - módulo JS do Worker, sem tipos
import { isGatedPath } from '../../worker/src/gate.js';

const L = [...conteudoPago.letters].sort((a, b) => a.order - b.order);
const semPontos = conteudoPago.extras.unpointed.groups.flatMap(g => g.words);
const banco = bancoDePalavras(L, semPontos);
const achar = (he: string) => banco.find(w => w.he === he)!;

describe('o banco de palavras', () => {
  it('vem do vocabulário do curso, uma vez cada, com id estável', () => {
    expect(banco.length).toBeGreaterThan(100);
    expect(new Set(banco.map(w => w.id)).size).toBe(banco.length);
    for (const w of banco) {
      expect(w.letras.length, w.he).toBeGreaterThan(0);
      expect([1, 2, 3], w.he).toContain(w.dificuldade);
    }
  });

  it('a forma sem nikud é só a da lista do módulo 6, e é a palavra sem os pontos', () => {
    const comNua = banco.filter(w => w.semNikud);
    expect(comNua.length).toBe(semPontos.length);
    for (const w of comNua) expect(w.semNikud, w.he).toBe(stripNikud(w.he));
  });

  it('a decomposição confere com a transliteração em quase todas, e recusa o kamats que soa O', () => {
    const conferem = banco.filter(w => w.vogaisConferem).length;
    expect(conferem / banco.length).toBeGreaterThan(0.95);
    expect(achar('צָהֳרַיִם').vogaisConferem).toBe(false);
    expect(achar('שָׁלוֹם').vogaisConferem).toBe(true);
  });
});

describe('as letras de uma palavra', () => {
  it('o Vav com ponto é vogal, não V', () => {
    const p = pedacosDe('שָׁלוֹם', L);
    expect(p.map(x => x.nomePt)).toEqual(['Shin', 'Lámed', 'Vav', 'Mem final']);
    expect(p[2]!.apoioDeVogal).toBe(true);
    expect(p[2]!.vogal).toBe('o');
  });

  it('bet sem daguesh é /v/, com daguesh é /b/', () => {
    expect(pedacosDe('כֶּלֶב', L).map(x => x.somPt)).toEqual(['/k/', '/l/', '/v/']);
  });

  it('o Yud depois do I não tem som próprio', () => {
    const p = pedacosDe('מִי', L);
    expect(p[1]!.somPt).toBe('');
    expect(p[1]!.notaPt).toMatch(/não tem som próprio/);
  });

  it('o He do fim é mudo, e o pátach do fim avisa a ordem', () => {
    expect(pedacosDe('תּוֹדָה', L).at(-1)!.somPt).toBe('');
    expect(pedacosDe('תַּפּוּחַ', L).at(-1)!.notaPt).toMatch(/antes da letra/);
  });
});

describe('as rodadas', () => {
  it('só trazem palavras que o aluno lê com as letras concluídas', () => {
    for (const k of [2, 6, 11, 22]) {
      const alfabeto = alfabetoDe(L.slice(0, k));
      for (const nivel of ['guiada', 'menos-ajuda', 'independente'] as const) {
        const r = palavrasDaRodada(banco, alfabeto, nivel, rng(`t-${k}-${nivel}`));
        expect(r.length, `${k} ${nivel}`).toBeGreaterThan(0);
        for (const w of r) expect(consegueLer(w.he, alfabeto), w.he).toBe(true);
      }
    }
  });

  it('sem nenhuma letra concluída, nenhuma palavra', () => {
    expect(palavrasDaRodada(banco, [], 'guiada', rng('x'))).toEqual([]);
  });

  it('toda Primeira Leitura de módulo de letras tem pelo menos três palavras', () => {
    for (const m of course.modules.filter(x => x.kind === 'letters')) {
      const doModulo = L.filter(l => l.module === m.n);
      const ate = L.filter(l => l.order <= Math.max(...doModulo.map(x => x.order)));
      const ws = palavrasDaPrimeiraLeitura(banco, doModulo, alfabetoDe(ate));
      expect(ws.length, `módulo ${m.n}`).toBeGreaterThanOrEqual(3);
    }
  });
});

it('a rota do laboratório é paga', () => {
  expect(isGatedPath('/leitura/')).toBe(true);
});

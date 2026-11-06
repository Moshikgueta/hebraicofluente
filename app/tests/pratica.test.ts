/* As lições de prática (lib/engine/pratica.ts, 29/09/2026): seis das 27
 * lições anunciadas eram uma frase sem página. */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { allLetters, course, extras } from '../src/lib/content';
import {
  correcaoDoModulo, letrasDoModulo, licaoDePratica, palavrasParaLer, parDoModulo, parecidasDoModulo
} from '@/lib/engine/pratica';
import { violatesOrderRule } from '@/lib/engine/exercises';
// @ts-expect-error - módulo JS do Worker, sem tipos
import { isGatedPath } from '../../worker/src/gate.js';

const LETRAS = allLetters();
const EX = extras();
const COM_PRATICA = course.modules.filter(m => licaoDePratica(m) != null);
const gravados = new Set(
  (JSON.parse(readFileSync(new URL('../../data/audio.json', import.meta.url), 'utf8')) as { clips: { file: string }[] })
    .clips.map(c => c.file.replace(/\.mp3$/, ''))
);
const alfabeto = (m: (typeof COM_PRATICA)[number]) =>
  letrasDoModulo(m, LETRAS).historia.flatMap(l => (l.finalForm ? [l.letter, l.finalForm] : [l.letter]));

describe('as lições de prática', () => {
  it('são as quatro dos módulos com letra, e a rota é paga', () => {
    /* A 23 e a 27 não são prática: são a leitura sem nikud e o fecho dos
       módulos 6 e 7, dentro de /extra (30/09/2026). */
    expect(COM_PRATICA.map(m => licaoDePratica(m))).toEqual([3, 7, 10, 13]);
    expect(isGatedPath('/modulo/1/pratica/')).toBe(true);
  });

  it('a correção nunca sai vazia e não mostra letra antes da hora', () => {
    for (const m of COM_PRATICA) {
      for (const audio of [false, true]) {
        const { exercicios } = correcaoDoModulo(m, LETRAS, EX, [], { audioAvailable: audio, seed: `t-${m.n}` });
        expect(exercicios.length, `módulo ${m.n}`).toBeGreaterThanOrEqual(5);
        if (m.letterIds.length) {
          for (const e of exercicios) expect(violatesOrderRule(e, alfabeto(m)), `${m.n} ${e.id}`).toEqual([]);
        }
      }
    }
  });

  it('com erro registrado, a correção mira o erro; erro de outro módulo não entra', () => {
    const m1 = COM_PRATICA.find(m => m.n === 1)!;
    const alvo = m1.letterIds[2]!;
    const fora = COM_PRATICA.find(m => m.n === 4)!.letterIds[0]!;
    const r = correcaoDoModulo(m1, LETRAS, EX, [fora, alvo], { audioAvailable: false, seed: 'x' });
    expect(r.dosErros).toBe(true);
    expect(r.exercicios.some(e => e.letterId === alvo)).toBe(true);
    expect(r.exercicios.some(e => e.letterId === fora)).toBe(false);
    expect(correcaoDoModulo(m1, LETRAS, EX, [fora], { audioAvailable: false, seed: 'x' }).dosErros).toBe(false);
  });

  it('o par de parecidas usa só letras já ensinadas, e uma delas é do módulo', () => {
    let pares = 0;
    for (const m of COM_PRATICA) {
      const par = parDoModulo(m, LETRAS);
      if (!par) continue;
      pares++;
      const { historia } = letrasDoModulo(m, LETRAS);
      expect(m.letterIds).toContain(par[0].id);
      expect(historia.map(l => l.id)).toContain(par[1].id);
      const r = parecidasDoModulo(m, LETRAS, { audioAvailable: false, seed: 'y' });
      expect(r?.exercicios.length ?? 0, `módulo ${m.n}`).toBeGreaterThan(0);
    }
    expect(pares).toBeGreaterThanOrEqual(3);
  });

  it('as palavras para ler são do módulo, sem repetir, e todas têm gravação no catálogo', () => {
    for (const m of COM_PRATICA) {
      const ws = palavrasParaLer(m, LETRAS, EX);
      expect(ws.length, `módulo ${m.n}`).toBeGreaterThanOrEqual(4);
      expect(new Set(ws.map(w => w.he)).size).toBe(ws.length);
      for (const w of ws) expect(gravados.has(w.audioId), `${m.n} ${w.he}`).toBe(true);
    }
  });
});

/* O motor dos jogos de reconhecimento.
 * ─────────────────────────────────────────────────────────────────────────
 * A varredura `jogos.mjs` joga UMA partida de cada jogo num navegador. Este
 * arquivo faz a outra metade: enumera milhares de rodadas, com estados de
 * aluno diferentes, e cobra as invariantes que um passeio pela tela nunca
 * alcançaria.
 *
 * A que vale mais é a primeira, e ela é a mesma regra de ordem que vale para
 * o curso inteiro: NENHUMA rodada pode mostrar uma letra que o aluno ainda
 * não encontrou. Um jogo é conteúdo gerado, e conteúdo gerado é exatamente
 * onde essa regra vaza sem ninguém ver - basta um distrator sorteado da
 * lista errada.
 *
 * A segunda é o corolário que se esquece: um PAR de parecidas só existe
 * quando as duas metades já foram ensinadas. Treinar {{ד}} contra {{ר}} com
 * quem só viu o {{ד}} não é discriminação visual, é adivinhação.
 */

import { describe, expect, it } from 'vitest';
import { allLetters, type Letter } from '@/lib/content';
import type { LearnerState } from '@/lib/state/types';
import { EMPTY_STATE } from '@/lib/state/types';
import { rng } from '@/lib/engine/rng';
import {
  distratores, montarBatalha, montarCaca, montarCursiva, nivelDe,
  parecidasCom, pesoDaLetra, porQueErrou, type Nivel
} from '@/lib/engine/jogos';
import { confusionPair } from '@/lib/engine/gym';

const TODAS = allLetters();
const hoje = '2026-09-22';

/** Um aluno que viu as `n` primeiras letras do curso. */
function alunoCom(n: number, extra: Partial<LearnerState> = {}): {
  state: LearnerState; unlocked: Letter[];
} {
  const unlocked = TODAS.slice(0, n);
  const lessons = Object.fromEntries(unlocked.map(l => [l.id, {
    letterId: l.id, stagesDone: [1, 2, 3, 4, 5], quizBest: 0.9, quizAttempts: 1,
    perfectBonusPaid: false, completedAt: `${hoje}T10:00:00.000Z`
  }]));
  return {
    state: { ...EMPTY_STATE, lessons, ...extra } as LearnerState,
    unlocked
  };
}

/** Os glifos que este aluno tem direito de ver: normais e finais. */
const permitidos = (unlocked: readonly Letter[]) => {
  const s = new Set<string>();
  for (const l of unlocked) { s.add(l.letter); if (l.finalForm) s.add(l.finalForm); }
  return s;
};

const NIVEIS: Nivel[] = ['facil', 'medio', 'dificil'];

/* ── a regra de ordem ──────────────────────────────────────────────────── */

describe('nenhum jogo mostra letra que o aluno não viu', () => {
  it('a caça, em todo tamanho de vocabulário e todo nível', () => {
    let rodadas = 0;
    for (let n = 3; n <= TODAS.length; n++) {
      const { state, unlocked } = alunoCom(n);
      const ok = permitidos(unlocked);
      for (const nivel of NIVEIS) for (let s = 0; s < 12; s++) {
        const c = montarCaca(state, unlocked, rng(`caca-${n}-${nivel}-${s}`), nivel);
        if (!c) continue;
        rodadas++;
        expect(ok.has(c.glifo), `alvo ${c.glifo} não liberado com ${n} letras`).toBe(true);
        for (const cel of c.celulas) {
          expect(ok.has(cel.glifo), `célula ${cel.glifo} não liberada com ${n} letras`).toBe(true);
        }
      }
    }
    expect(rodadas).toBeGreaterThan(500);
  });

  it('a impressa × cursiva, idem', () => {
    let rodadas = 0;
    for (let n = 3; n <= TODAS.length; n++) {
      const { state, unlocked } = alunoCom(n);
      const ok = permitidos(unlocked);
      for (const nivel of NIVEIS) {
        for (const r of montarCursiva(state, unlocked, rng(`cur-${n}-${nivel}`), nivel)) {
          rodadas++;
          const letras = r.tipo === 'pares' ? [...r.esquerda, ...r.direita] : r.opcoes;
          for (const L of letras) expect(ok.has(L.letter)).toBe(true);
        }
      }
    }
    expect(rodadas).toBeGreaterThan(300);
  });

  it('a batalha só usa pares cujas DUAS letras já foram ensinadas', () => {
    let pares = 0;
    for (let n = 2; n <= TODAS.length; n++) {
      const { state, unlocked } = alunoCom(n);
      const par = confusionPair(state, unlocked);
      if (!par) continue;
      pares++;
      const ids = new Set(unlocked.map(l => l.id));
      expect(ids.has(par[0].id)).toBe(true);
      expect(ids.has(par[1].id)).toBe(true);
      expect(par[0].id).not.toBe(par[1].id);

      const ok = permitidos(unlocked);
      for (const r of montarBatalha(par, false, rng(`bat-${n}`)).rodadas) {
        const glifos = r.tipo === 'qual' ? [r.glifo, ...r.opcoes.map(o => o.letter)]
          : r.fila.map(c => c.glifo);
        for (const g of glifos) expect(ok.has(g), `${g} com ${n} letras`).toBe(true);
      }
    }
    expect(pares).toBeGreaterThan(10);
  });
});

/* ── a caça, item a item ───────────────────────────────────────────────── */

describe('a caça é jogável, sempre', () => {
  it('tem entre 10 e 25 células, e de 3 a 6 são a resposta', () => {
    for (let n = 3; n <= TODAS.length; n += 2) {
      const { state, unlocked } = alunoCom(n);
      for (const nivel of NIVEIS) for (let s = 0; s < 10; s++) {
        const c = montarCaca(state, unlocked, rng(`t-${n}-${nivel}-${s}`), nivel);
        if (!c) continue;
        expect(c.celulas.length).toBeGreaterThanOrEqual(10);
        expect(c.celulas.length).toBeLessThanOrEqual(25);
        expect(c.quantas).toBeGreaterThanOrEqual(3);
        expect(c.quantas).toBeLessThanOrEqual(6);
      }
    }
  });

  it('o alvo nunca passa de metade da grade - senão não é uma caça', () => {
    /* Custou uma captura de tela: uma rodada saiu com seis alvos em doze
       células, e procurar deixou de ser procurar. */
    for (let n = 4; n <= TODAS.length; n += 2) {
      const { state, unlocked } = alunoCom(n);
      for (const nivel of NIVEIS) for (let s = 0; s < 10; s++) {
        const c = montarCaca(state, unlocked, rng(`p-${n}-${nivel}-${s}`), nivel);
        if (!c) continue;
        expect(c.quantas / c.celulas.length,
          `${c.quantas} de ${c.celulas.length} no ${nivel}`).toBeLessThanOrEqual(0.4);
      }
    }
  });

  it('`quantas` é exatamente quantas células certas existem', () => {
    /* Se divergir, a rodada não fecha: o jogador encontra todas e o contador
       continua pedindo mais - e não há o que tocar. */
    for (let n = 3; n <= TODAS.length; n += 3) {
      const { state, unlocked } = alunoCom(n);
      for (const nivel of NIVEIS) for (let s = 0; s < 8; s++) {
        const c = montarCaca(state, unlocked, rng(`q-${n}-${nivel}-${s}`), nivel);
        if (!c) continue;
        expect(c.celulas.filter(x => x.certa).length).toBe(c.quantas);
        /* E toda célula marcada como certa mostra mesmo o glifo do alvo. */
        for (const cel of c.celulas.filter(x => x.certa)) expect(cel.glifo).toBe(c.glifo);
        /* E nenhuma célula errada mostra o glifo do alvo - seria punir quem
           acerta. */
        for (const cel of c.celulas.filter(x => !x.certa)) expect(cel.glifo).not.toBe(c.glifo);
      }
    }
  });
});

/* ── a batalha ─────────────────────────────────────────────────────────── */

describe('a batalha é jogável, sempre', () => {
  const { state, unlocked } = alunoCom(TODAS.length);
  const par = confusionPair(state, unlocked)!;

  it('toda fileira de "toque em todas" tem pelo menos uma certa e uma errada', () => {
    for (let s = 0; s < 40; s++) {
      for (const r of montarBatalha(par, false, rng(`f-${s}`), 9).rodadas) {
        if (r.tipo !== 'todas') continue;
        expect(r.fila.some(c => c.certa), 'fileira sem resposta').toBe(true);
        expect(r.fila.some(c => !c.certa), 'fileira só com respostas').toBe(true);
      }
    }
  });

  it('o intruso aparece uma vez, e é a outra letra do par', () => {
    for (let s = 0; s < 40; s++) {
      const b = montarBatalha(par, false, rng(`i-${s}`), 9);
      for (const r of b.rodadas) {
        if (r.tipo !== 'intruso') continue;
        expect(r.fila.filter(c => c.intruso).length).toBe(1);
        expect(r.intruso.id).not.toBe(r.alvo.id);
        expect([b.par[0].id, b.par[1].id]).toContain(r.intruso.id);
      }
    }
  });

  it('"qual é esta" oferece as duas do par, e uma delas é a certa', () => {
    for (let s = 0; s < 30; s++) {
      for (const r of montarBatalha(par, false, rng(`k-${s}`), 9).rodadas) {
        if (r.tipo !== 'qual') continue;
        expect(r.opcoes).toHaveLength(2);
        expect(r.opcoes.map(o => o.id)).toContain(r.alvo.id);
        expect(new Set(r.opcoes.map(o => o.id)).size).toBe(2);
      }
    }
  });

  it('prefere o par que o ALUNO troca ao par que o conteúdo prevê', () => {
    /* É a diferença entre adaptativo e genérico, e ela é verificável: com uma
       troca registrada, o par tem de ser aquele. */
    const dalet = TODAS.find(l => l.id === 'dalet')!;
    const resh = TODAS.find(l => l.id === 'resh')!;
    const n = Math.max(TODAS.indexOf(dalet), TODAS.indexOf(resh)) + 1;
    const { state, unlocked } = alunoCom(n, {
      confusions: { 'ר>ד': { correct: resh.letter, chosen: dalet.letter, n: 3, lastOn: hoje } }
    });
    const escolhido = confusionPair(state, unlocked)!;
    expect(escolhido.map(l => l.id).sort()).toEqual(['dalet', 'resh']);
  });
});

/* ── as alternativas e o nível ─────────────────────────────────────────── */

describe('o nível muda de onde vêm as alternativas', () => {
  const { state, unlocked } = alunoCom(TODAS.length);

  it('devolve sempre a quantidade pedida, em todo nível', () => {
    for (const L of unlocked) for (const nivel of NIVEIS) {
      expect(distratores(state, L, unlocked, 3, nivel, rng(`d-${L.id}-${nivel}`)))
        .toHaveLength(3);
    }
  });

  it('nunca inclui a própria letra, nem repete', () => {
    for (const L of unlocked) for (const nivel of NIVEIS) {
      const d = distratores(state, L, unlocked, 3, nivel, rng(`r-${L.id}-${nivel}`));
      expect(d.some(x => x.id === L.id)).toBe(false);
      expect(new Set(d.map(x => x.id)).size).toBe(d.length);
    }
  });

  it('no difícil, prefere as parecidas de verdade', () => {
    /* Só conta para letras QUE TÊM parecidas: cobrar isso de uma letra sem
       nenhuma seria cobrar o impossível. */
    let testadas = 0;
    for (const L of unlocked) {
      const p = parecidasCom(state, L, unlocked);
      if (p.length < 2) continue;
      testadas++;
      const d = distratores(state, L, unlocked, 2, 'dificil', rng(`x-${L.id}`));
      for (const x of d) expect(p.some(y => y.id === x.id), `${x.id} não é parecida de ${L.id}`).toBe(true);
    }
    expect(testadas).toBeGreaterThan(5);
  });

  it('com poucas letras o aluno fica no aquecimento; com muitas e firmes, no difícil', () => {
    expect(nivelDe(alunoCom(4).state, alunoCom(4).unlocked)).toBe('facil');
    const { state: s2, unlocked: u2 } = alunoCom(TODAS.length);
    /* `alunoCom` não grava habilidades, então tudo é "novo" - e um aluno que
       só abriu as lições não é um aluno pronto para o difícil. */
    expect(nivelDe(s2, u2)).toBe('facil');
  });
});

/* ── o retorno que ensina ──────────────────────────────────────────────── */

describe('o erro explica, quando o conteúdo tem a frase', () => {
  it('a frase sai de `contrastes`, e nunca é inventada', () => {
    let comFrase = 0;
    for (const L of TODAS) {
      for (const glifo of L.confusableWith) {
        const outra = TODAS.find(o => o.letter === glifo || o.finalForm === glifo);
        if (!outra) continue;
        const f = porQueErrou(L, outra);
        if (f === null) continue;
        comFrase++;
        expect(f).toBe(L.contrastes?.[outra.letter] ?? L.contrastes?.[outra.finalForm ?? '']);
        expect(f.length).toBeGreaterThan(20);
      }
    }
    /* Se este número cair para zero, o retorno educativo virou genérico sem
       ninguém perceber. */
    expect(comFrase).toBeGreaterThan(15);
  });
});

/* ── o peso ────────────────────────────────────────────────────────────── */

describe('a letra que custa aparece mais', () => {
  it('uma letra forte pesa menos do que uma para revisar', () => {
    const forte = alunoCom(10, {
      skills: { mem: Object.fromEntries((['rec', 'som', 'ler', 'ouvir', 'escrever'] as const)
        .map(s => [s, { hits: 10, misses: 0, lastOn: hoje, streak: 10 }])) }
    } as Partial<LearnerState>).state;
    expect(pesoDaLetra(forte, 'mem')).toBeLessThan(pesoDaLetra(forte, 'tav'));
  });
});

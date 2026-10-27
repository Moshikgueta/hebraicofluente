/* Bet, Kaf e Pe ensinam só o lado COM o ponto; Vet, Chaf e Fe têm lição
 * própria (27/10/2026, pedido do dono: "falta a cursiva aqui e tem palavras
 * com vet na seção de bet"). */
import { describe, expect, it } from 'vitest';
import { allLetters, extras } from '../src/lib/content';
import { leituraDe, novasCom } from '../src/lib/leitura';
import { alvoDoSom } from '../src/lib/fixacao';
import { exVowelPair } from '../src/lib/engine/generators';
import { contextFor } from '../src/lib/engine/exercises';
import { rng } from '../src/lib/engine/rng';
import { comOsSonsFeitos, idDoSom, semPalavrasDeSom, soOLadoDoPonto, sonsDaPalavra } from '../src/lib/sons';
import { EMPTY_STATE, type LearnerState } from '../src/lib/state/types';

const letters = allLetters();
const feita = (id: string): [string, LearnerState['lessons'][string]] => [id, {
  letterId: id, stagesDone: [1, 2, 3, 4, 5], quizBest: 0.9, quizAttempts: 1,
  perfectBonusPaid: false, completedAt: '2026-10-27T10:00:00.000Z'
}];
const ate = (id: string, sons: string[] = []): LearnerState => {
  const ordem = letters.find(l => l.id === id)!.order;
  return {
    ...EMPTY_STATE,
    lessons: Object.fromEntries([
      ...letters.filter(l => l.order <= ordem).map(l => feita(l.id)),
      ...sons.map(s => feita(idDoSom(s)))
    ])
  };
};

describe('as palavras do som só contam depois da lição do som', () => {
  for (const [letra, som, palavra] of [['bet', 'vet', 'טוֹב'], ['kaf', 'chaf', 'מֶלֶךְ'], ['pe', 'fe', 'סֵפֶר']] as const) {
    it(`${letra}: ${palavra} entra com o ${som}, não antes`, () => {
      const antes = leituraDe(ate(letra)).legiveis.map(w => w.he);
      const depois = leituraDe(ate(letra, [som])).legiveis.map(w => w.he);
      expect(antes).not.toContain(palavra);
      expect(depois).toContain(palavra);
    });
  }

  it('o "palavras novas" do fim da lição do Bet não conta as do Vet', () => {
    const L = letters.find(l => l.id === 'bet')!;
    const semVet = novasCom(ate('bet'), L);
    const comVet = novasCom(ate('bet', ['vet']), L);
    expect(comVet).toBeGreaterThan(semVet);
  });

  it('a grafia decide: ב, כ, פ sem o ponto e as finais ך, ף pedem o som suave', () => {
    expect(sonsDaPalavra('טוֹב')).toEqual(['vet']);
    expect(sonsDaPalavra('בַּיִת')).toEqual([]);
    expect(sonsDaPalavra('מֶלֶךְ')).toEqual(['chaf']);
    expect(sonsDaPalavra('כֶּסֶף').sort()).toEqual(['fe']);
    expect(sonsDaPalavra('בְּבַקָשָׁה')).toEqual(['vet']);
  });

  it('comOsSonsFeitos tira só os sons que faltam', () => {
    const bet = letters.find(l => l.id === 'bet')!;
    expect(comOsSonsFeitos(bet, () => false).wordsToRead.map(w => w.he)).not.toContain('טוֹב');
    expect(comOsSonsFeitos(bet, () => true).wordsToRead).toEqual(bet.wordsToRead);
  });
});

describe('o par de vogais nas lições do lado com o ponto', () => {
  for (const id of ['bet', 'kaf', 'pe']) {
    it(`${id}: a sílaba sai com o daguesh`, () => {
      const inteira = letters.find(l => l.id === id)!;
      const L = soOLadoDoPonto(semPalavrasDeSom(inteira));
      const history = letters.filter(l => l.order <= L.order).map(l => (l.id === L.id ? L : l));
      for (let i = 0; i < 6; i++) {
        const ex = exVowelPair(L, contextFor(L, history), rng(`vp${i}`), i);
        if (!ex || ex.kind !== 'vowel-pair') continue;
        for (const s of ex.he.split(' ')) expect(s.normalize('NFD'), `${id} ${ex.he}`).toContain('ּ');
      }
    });
  }
});

describe('a cursiva nas lições de som', () => {
  it('todo som mostra a cursiva, sem os pontos', () => {
    for (const S of extras().sons) {
      const a = alvoDoSom(S);
      expect(a.cursiva, S.id).toBe(true);
      expect(a.glifoCursivo, S.id).toBeTruthy();
      expect(/[֑-ׇ]/.test(a.glifoCursivo!), S.id).toBe(false);
    }
  });
});

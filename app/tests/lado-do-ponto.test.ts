/* Bet, Kaf e Pe ensinam só o lado COM o ponto; Vet, Chaf e Fe têm lição
 * própria (27/10/2026, pedido do dono: "falta a cursiva aqui e tem palavras
 * com vet na seção de bet"). */
import { describe, expect, it } from 'vitest';
import { allLetters, extras } from '../src/lib/content';
import { leituraDe, novasCom } from '../src/lib/leitura';
import { alvoDaLetra, alvoDoSom } from '../src/lib/fixacao';
import { exVowelPair } from '../src/lib/engine/generators';
import { buildLetterPractice, buildMiniTest, contextFor } from '../src/lib/engine/exercises';
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

/* 27/10/2026: "coloca a ך junto com a כ e não com a Kaf" e "nas letras Kaf,
 * Bet e Pe tem que mostrar o daguesh". */
describe('a lição do Kaf, do Bet e do Pe', () => {
  const daLicao = (id: string) => soOLadoDoPonto(semPalavrasDeSom(letters.find(l => l.id === id)!));
  const historico = (L: ReturnType<typeof daLicao>) =>
    letters.filter(l => l.order <= L.order).map(l => (l.id === L.id ? L : l));

  it('a letra aparece com o daguesh', () => {
    expect(daLicao('bet').letraComPonto).toBe('בּ');
    expect(daLicao('kaf').letraComPonto).toBe('כּ');
    expect(daLicao('pe').letraComPonto).toBe('פּ');
    for (const id of ['bet', 'kaf', 'pe']) {
      const L = daLicao(id);
      const a = alvoDaLetra(L, historico(L));
      expect(a.glifo, id).toBe(L.letraComPonto);
      expect(a.glifoForma, id).toBe(L.letter);
      /* Os sons das anteriores pelo lado da lição delas: nada de "/b/ ou /v/". */
      expect(a.outrosSons.filter(s => / ou |\/ \//.test(s)), id).toEqual([]);
    }
  });

  it('o ך e o ף saem da lição da letra e ficam na do som', () => {
    expect(daLicao('kaf').finalForm).toBeNull();
    expect(daLicao('kaf').finalDoSom).toBe('ך');
    expect(daLicao('pe').finalForm).toBeNull();
    expect(daLicao('pe').finalDoSom).toBe('ף');
    const sons = extras().sons;
    expect(sons.find(s => s.id === 'chaf')!.finalHe).toBe('ך');
    expect(sons.find(s => s.id === 'fe')!.finalHe).toBe('ף');
  });

  it('nenhum exercício da lição do Kaf ou do Pe mostra a forma final', () => {
    for (const [id, fin] of [['kaf', 'ך'], ['pe', 'ף']] as const) {
      const L = daLicao(id);
      for (let r = 0; r < 20; r++) {
        for (const ex of [...buildLetterPractice(L, historico(L), { audioAvailable: true, seed: `p${r}` }),
                          ...buildMiniTest(L, historico(L), { audioAvailable: true, seed: `m${r}` })]) {
          expect(ex.kind, `${id} ${ex.id}`).not.toBe('final-form');
          const o = (ex as { options?: string[] }).options ?? [];
          expect(o.includes(fin), `${id} ${ex.id} ${ex.promptPt}`).toBe(false);
        }
      }
    }
  });

  it('os textos do Kaf e do Pe não falam mais do ך nem do ף', () => {
    for (const [id, fin] of [['kaf', 'ך'], ['pe', 'ף']] as const) {
      const L = letters.find(l => l.id === id)!;
      const textos = [L.soundNotePt, L.didYouKnow, L.ensino.detalhePt ?? '', L.ensino.lembrePt,
                      ...L.ensino.checagem.map(c => JSON.stringify(c))].join(' ');
      expect(textos.includes(fin), id).toBe(false);
    }
  });
});

/* As lições de som: Sin, Vet, Chaf, Fe, Tch, Dj e J (26/09/2026).
 *
 * Pedido de quem gravou o curso inteiro: não havia um momento só do V, só do
 * F, só do TCH. Cada som virou uma lição do caminho, logo depois da letra que
 * ele divide. O que se prova aqui:
 *
 *   · a ordem de ensino: Lámed → Resh → Sin, Bet → Vet → Kaf → Chaf → Pe →
 *     Fe, e Tch → Dj → J;
 *   · a trava: Kaf só abre com Vet dominado - e quem já estava em Kaf antes
 *     das lições novas continua lá (a regra "nunca tira o que já foi dado");
 *   · as 22 letras continuam 22: um som não conta como letra dominada, mas
 *     conta na porcentagem do curso;
 *   · os exercícios são contrastes com resposta certa, e só pedem áudio que
 *     existe;
 *   · a rota nova é paga, e cada lição do plano tem conteúdo.
 */

import { describe, expect, it } from 'vitest';
import { allLetters, course, extras } from '../src/lib/content';
import { totalLicoes } from '@/lib/content-publico';
import {
  bancoDoSom, idDoSom, leituraTrocada, nomeDaLicao, ordemDeEnsino, rodadaDoSom, rotaDaLicao,
  semPalavrasDeSom
} from '@/lib/sons';
import { buildLetterPractice, buildMiniTest } from '@/lib/engine/exercises';
import { readFileSync, existsSync } from 'node:fs';
import {
  courseProgress, lettersMastered, letraLiberada, porQueTrancada, STAGE_COUNT
} from '@/lib/state/rules';
import { EMPTY_STATE, type LearnerState, type LessonProgress } from '@/lib/state/types';
// @ts-expect-error - módulo JS do Worker, sem tipos
import { isGatedPath } from '../../worker/src/gate.js';
import { PAGAS } from '@/lib/seo';

const ORDEM = ordemDeEnsino(allLetters(), course.modules);
const SONS = extras().sons;
const somIds = course.modules.flatMap(m => m.lessons.filter(l => l.som).map(l => idDoSom(l.som!)));

const licao = (id: string, nota: number | null = 1, etapas = STAGE_COUNT): LessonProgress => ({
  letterId: id,
  stagesDone: Array.from({ length: etapas }, (_, i) => i + 1),
  quizBest: nota, quizAttempts: nota === null ? 0 : 1, perfectBonusPaid: false,
  completedAt: etapas >= STAGE_COUNT ? '2026-09-26T00:00:00.000Z' : null
});

/** Tudo até `ate` (inclusive) feito e dominado, na ordem de ensino. */
const ateAqui = (ate: string): LearnerState => ({
  ...EMPTY_STATE,
  lessons: Object.fromEntries(ORDEM.slice(0, ORDEM.indexOf(ate) + 1).map(id => [id, licao(id)]))
});

describe('a ordem de ensino', () => {
  it('põe cada som logo depois da letra que ele divide, e os modernos no fim', () => {
    expect(ORDEM.slice(ORDEM.indexOf('bet'))).toEqual([
      'bet', 'som-vet', 'kaf', 'som-chaf', 'pe', 'som-fe', 'som-tch', 'som-dj', 'som-j'
    ]);
  });

  it('o Sin fecha as letras do módulo 2, antes do Vav', () => {
    expect(ORDEM.slice(ORDEM.indexOf('shin'), ORDEM.indexOf('vav') + 1)).toEqual([
      'shin', 'lamed', 'resh', 'som-sin', 'vav'
    ]);
  });

  it('continua começando pelas 22 letras na ordem delas', () => {
    const soLetras = ORDEM.filter(id => !id.startsWith('som-'));
    expect(soLetras).toEqual(allLetters().map(l => l.id));
  });

  it('o plano de aulas tem 27 lições, e o número de cada som bate com o conteúdo', () => {
    expect(totalLicoes()).toBe(27);
    for (const S of SONS) {
      const ls = course.modules.flatMap(m => m.lessons.map(l => ({ m, l }))).find(x => x.l.som === S.id);
      expect(ls, S.id).toBeDefined();
      expect(ls!.l.n).toBe(S.licao);
      expect(ls!.m.n).toBe(S.modulo);
    }
    expect(SONS.map(S => idDoSom(S.id)).sort()).toEqual([...somIds].sort());
  });
});

describe('a trava', () => {
  it('Kaf só abre com Vet dominado, e a porta diz que falta o Vet', () => {
    const s = ateAqui('bet');
    expect(letraLiberada(s, ORDEM, 'som-vet')).toBe(true);
    expect(letraLiberada(s, ORDEM, 'kaf')).toBe(false);
    expect(porQueTrancada(s, ORDEM, 'kaf')).toMatchObject({ anterior: 'som-vet', falta: 'licao' });
    expect(letraLiberada(ateAqui('som-vet'), ORDEM, 'kaf')).toBe(true);
  });

  it('nota baixa no Vet segura o Kaf, e a porta diz a nota', () => {
    const s = ateAqui('bet');
    s.lessons['som-vet'] = licao('som-vet', 0.5);
    expect(porQueTrancada(s, ORDEM, 'kaf')).toMatchObject({ anterior: 'som-vet', falta: 'nota', nota: 0.5 });
  });

  it('quem já estava em Kaf antes das lições novas continua com a porta aberta', () => {
    const s = ateAqui('bet');
    s.lessons.kaf = licao('kaf', null, 2);
    expect(letraLiberada(s, ORDEM, 'kaf')).toBe(true);
    /* E o Vet, que ficou para trás, também está aberto para ser feito. */
    expect(letraLiberada(s, ORDEM, 'som-vet')).toBe(true);
  });

  it('o Sin abre depois do Resh, e o Vav só com o Sin dominado', () => {
    expect(letraLiberada(ateAqui('lamed'), ORDEM, 'som-sin')).toBe(false);
    expect(letraLiberada(ateAqui('resh'), ORDEM, 'som-sin')).toBe(true);
    expect(porQueTrancada(ateAqui('resh'), ORDEM, 'vav')).toMatchObject({ anterior: 'som-sin' });
    expect(letraLiberada(ateAqui('som-sin'), ORDEM, 'vav')).toBe(true);
  });

  it('Tch abre depois do Fe; Dj depois do Tch; J depois do Dj', () => {
    expect(letraLiberada(ateAqui('pe'), ORDEM, 'som-tch')).toBe(false);
    expect(letraLiberada(ateAqui('som-fe'), ORDEM, 'som-tch')).toBe(true);
    expect(letraLiberada(ateAqui('som-tch'), ORDEM, 'som-dj')).toBe(true);
    expect(letraLiberada(ateAqui('som-tch'), ORDEM, 'som-j')).toBe(false);
  });

  it('o nome e a rota de cada lição do caminho', () => {
    expect(nomeDaLicao('som-vet', allLetters(), course.modules)).toBe('Vet');
    expect(nomeDaLicao('kaf', allLetters(), course.modules)).toBe('Kaf');
    expect(rotaDaLicao('som-chaf')).toBe('/som/chaf');
    expect(rotaDaLicao('pe')).toBe('/licao/pe');
  });
});

describe('as 22 letras continuam 22', () => {
  it('um som dominado não conta como letra dominada', () => {
    const s = ateAqui('som-j');
    expect(lettersMastered(s)).toBe(22);
  });

  it('mas conta na porcentagem: o curso não chega a 100% sem os sons', () => {
    const extrasIds = course.modules.filter(m => !m.letterIds.length).map(m => m.id);
    const tudo = ateAqui('som-j');
    for (const id of extrasIds) tudo.lessons[id] = licao(id, 1, 3);
    expect(courseProgress(tudo, 22, extrasIds, somIds)).toBe(1);
    const semSons = { ...tudo, lessons: Object.fromEntries(Object.entries(tudo.lessons).filter(([id]) => !id.startsWith('som-'))) };
    expect(courseProgress(semSons, 22, extrasIds, somIds)).toBeLessThan(1);
    /* E sem a lista de sons (quem chama do jeito antigo), os sons não viram letras. */
    expect(courseProgress(semSons, 22, extrasIds)).toBe(1);
  });
});

describe('os exercícios de cada som', () => {
  const semAudio = () => false;

  it('a leitura errada é a de quem não olhou o ponto', () => {
    expect(leituraTrocada('tov', 'v', 'b')).toBe('tob');
    expect(leituraTrocada('óchel', 'ch', 'k')).toBe('ókel');
    expect(leituraTrocada('séfer', 'f', 'p')).toBe('séper');
    expect(leituraTrocada('smol', 's', 'sh')).toBe('shmol');
  });

  it('todo exercício tem a resposta certa entre as opções, sem repetir opção nem id', () => {
    for (const S of SONS) {
      const banco = bancoDoSom(S, () => true);
      expect(banco.length, S.id).toBeGreaterThanOrEqual(8);
      expect(new Set(banco.map(e => e.id)).size).toBe(banco.length);
      for (const e of banco) {
        if (!('options' in e)) continue;
        expect(e.answer, e.id).toBeGreaterThanOrEqual(0);
        expect(new Set(e.options).size, e.id).toBe(e.options.length);
        expect(e.options.length, e.id).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it('os contrastes do Vet: a sílaba sem ponto é "va", e o par com ponto é a errada', () => {
    const vet = SONS.find(S => S.id === 'vet')!;
    const e = bancoDoSom(vet, semAudio).find(x => x.id === 'som-vet-sil-0')!;
    expect(e.kind).toBe('syllable-reading');
    if (e.kind !== 'syllable-reading') return;
    expect(e.he).toBe('בַ');
    expect(e.options[e.answer]).toBe('va');
    expect(e.options).toContain('ba');
  });

  it('as sílabas sem ponto não têm daguesh na consoante, e as do par têm', () => {
    for (const S of SONS.filter(x => x.tipo === 'daguesh')) {
      expect(S.silabas).toHaveLength(5);
      expect(S.parSilabas).toHaveLength(5);
      for (const [i, s] of S.silabas.entries()) {
        expect([...s.he][1], `${S.id} ${s.he}`).not.toBe('ּ');
        expect(S.parSilabas[i]!.he, S.id).toContain('ּ');
      }
    }
  });

  it('o Sin: sílabas com o ponto à esquerda contra as do Shin, à direita', () => {
    const sin = SONS.find(S => S.id === 'sin')!;
    expect(sin.tipo).toBe('ponto');
    expect(sin.silabas).toHaveLength(5);
    for (const [i, s] of sin.silabas.entries()) {
      expect(s.he, s.he).toContain('\u05C2');
      expect(sin.parSilabas[i]!.he).toContain('\u05C1');
    }
    /* O contraste de palavras usa só palavras com o ponto do Shin. */
    expect(sin.parPalavras.length).toBeGreaterThanOrEqual(3);
    for (const w of sin.parPalavras) {
      expect(w.he).toContain('\u05C1');
      expect(w.he).not.toContain('\u05C2');
    }
    const e = bancoDoSom(sin, semAudio).find(x => x.id === 'som-sin-sil-0')!;
    if (e.kind !== 'syllable-reading') throw new Error(e.kind);
    expect(e.options[e.answer]).toBe('sa');
    expect(e.options).toContain('sha');
  });

  it('exercício de ouvir só entra quando a gravação existe', () => {
    for (const S of SONS) {
      expect(bancoDoSom(S, semAudio).some(e => e.skill === 'ouvir'), S.id).toBe(false);
      expect(bancoDoSom(S, () => true).some(e => e.skill === 'ouvir'), S.id).toBe(true);
    }
  });

  it('a rodada tem o tamanho pedido, mistura os tipos e muda com a semente', () => {
    for (const S of SONS) {
      const a = rodadaDoSom(S, { seed: 'a', count: 8, temAudio: semAudio });
      const b = rodadaDoSom(S, { seed: 'b', count: 8, temAudio: semAudio });
      expect(a).toHaveLength(8);
      expect(new Set(a.map(e => e.kind)).size, S.id).toBeGreaterThanOrEqual(2);
      expect(a.map(e => e.id).join()).not.toBe(b.map(e => e.id).join());
    }
  });

  it('nos sons modernos, "qual tem o som" põe a palavra com gerech contra palavras sem ele', () => {
    const tch = SONS.find(S => S.id === 'tch')!;
    const e = bancoDoSom(tch, semAudio).find(x => x.kind === 'letter-in-word')!;
    if (e.kind !== 'letter-in-word') throw new Error('sem letter-in-word');
    expect(e.options[e.answer]).toContain('צ׳');
    expect(e.options.filter((_, i) => i !== e.answer).every(o => !o.includes('׳'))).toBe(true);
  });
});

describe('a rota', () => {
  it('é paga, no portão e no eco do SEO', () => {
    expect(isGatedPath('/som/vet/')).toBe(true);
    expect(PAGAS).toContain('/som');
  });
});

describe('as lições de Bet, Kaf e Pe ensinam só o som com ponto (26/09/2026)', () => {
  const SUAVES: Record<string, string[]> = {
    bet: ['טוֹב', 'לֵב'],
    kaf: ['אֹכֶל', 'מֶלֶךְ', 'דֶּרֶךְ', 'לָלֶכֶת'],
    pe: ['סֵפֶר', 'יָפֶה', 'כֶּסֶף', 'סוֹף', 'טֶלֶפוֹן']
  };
  const letra = (id: string) => allLetters().find(l => l.id === id)!;
  const textoDe = (e: unknown) => JSON.stringify(e);

  it('as palavras do outro som ficam marcadas com a lição que as ensina', () => {
    for (const [id, suaves] of Object.entries(SUAVES)) {
      const L = letra(id);
      const marcadas = [...L.wordsToRead, ...L.wordsToRecognize].filter(w => w.som).map(w => w.he);
      expect(new Set(marcadas), id).toEqual(new Set(suaves));
      for (const w of [...L.wordsToRead, ...L.wordsToRecognize].filter(x => x.som)) {
        const S = SONS.find(x => x.id === w.som)!;
        expect(S.palavras.map(p => p.he), `${id}: ${w.he}`).toContain(w.he);
      }
    }
  });

  it('a tela e os exercícios da letra não usam essas palavras', () => {
    for (const [id, suaves] of Object.entries(SUAVES)) {
      const L = semPalavrasDeSom(letra(id));
      expect(L.wordsToRead.some(w => suaves.includes(w.he)), id).toBe(false);
      const historia = allLetters().filter(l => l.order <= L.order).map(l => (l.id === L.id ? L : l));
      for (let k = 0; k < 5; k++) {
        const ex = [
          ...buildLetterPractice(L, historia, { audioAvailable: false, seed: `p-${id}-${k}` }),
          ...buildMiniTest(L, historia, { audioAvailable: false, seed: `m-${id}-${k}` })
        ];
        for (const s of suaves) expect(textoDe(ex), `${id}: ${s}`).not.toContain(s);
      }
    }
  });

  it('mas continuam no vocabulário do curso (missões, cenas, jogos, ler sem nikud)', () => {
    expect(letra('bet').wordsToRead.map(w => w.he)).toContain('טוֹב');
    expect(letra('pe').wordsToRead.map(w => w.he)).toContain('סֵפֶר');
  });

  it('a lição do Pe ganhou palavras com P para ler', () => {
    const L = semPalavrasDeSom(letra('pe'));
    expect(L.wordsToRead.map(w => w.he)).toEqual(expect.arrayContaining(['פֶּה', 'פָּרָה', 'פִּתָּה', 'מִשְׁפָּחָה']));
  });
});

describe('Israel se escreve de um jeito só', () => {
  it('"Yisraél" em todo o conteúdo', () => {
    const tudo = ['letters.json', 'extras.json', 'sentences.json']
      .map(f => readFileSync(new URL(`../content/${f}`, import.meta.url), 'utf8')).join('');
    expect(tudo).not.toMatch(/yisrael|Yisrael\b/);
    expect(tudo).toContain('Yisraél');
  });
});

describe('o livro em PDF saiu do projeto', () => {
  it('sem gerador, sem modelos, sem mapa de páginas', () => {
    for (const f of ['scripts/build.js', 'templates', 'tools/build-pdf.mjs', 'tools/check-fit.mjs', 'tools/pack.mjs', 'data/page-map.json']) {
      expect(existsSync(new URL(`../../${f}`, import.meta.url)), f).toBe(false);
    }
    expect(readFileSync(new URL('../content/letters/bet.json', import.meta.url), 'utf8')).not.toContain('workbookPages');
  });
});

describe('as correções da revisão de nativo (26/09/2026)', () => {
  const letra = (id: string) => allLetters().find(l => l.id === id)!;

  it('o nome da letra é o do som com ponto: Bet, Kaf, Pe', () => {
    expect(['bet', 'kaf', 'pe'].map(id => letra(id).namePt)).toEqual(['Bet', 'Kaf', 'Pe']);
  });

  it('a última sílaba do Het é a consoante muda, חְ, e não o hataf', () => {
    const s = letra('het').syllables.at(-1)!;
    expect(s.he).toBe('חְ');
    expect(s.translit).toBe('ch');
  });

  it('"agora" se escreve עַכְשָׁיו, e sem nikud fica עכשיו', () => {
    const tudo = ['letters.json', 'extras.json']
      .map(f => readFileSync(new URL(`../content/${f}`, import.meta.url), 'utf8')).join('');
    expect(tudo).not.toContain('עַכְשָׁו');
    expect(tudo).toContain('עַכְשָׁיו');
    expect(extras().unpointed.words.map(w => w.bare)).toContain('עכשיו');
  });
});

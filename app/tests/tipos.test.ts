/* A varredura tipo por tipo - os 22 formatos, um de cada vez.
 * ─────────────────────────────────────────────────────────────────────────
 * O pedido era explícito: "não assuma que todos funcionam só porque um
 * exercício semelhante funciona". E o motivo é real - os tipos nascem de
 * geradores diferentes, escritos em semanas diferentes, e o que eles têm em
 * comum é só o tipo TypeScript, que não tem opinião sobre conteúdo:
 * `answer: 2` compila com três alternativas na tela.
 *
 * Então aqui se colhe uma amostra grande de CADA tipo - de todos os
 * construtores, inclusive o exame e a academia, que geram tipos que a lição
 * não gera - e se cobra de cada um o que só ele tem.
 *
 * ── o que esta suíte NÃO faz ────────────────────────────────────────────
 * Não mede pedagogia, que é o trabalho de tests/cobertura. Aqui só se
 * pergunta se o item está bem formado: se a resposta existe, se ela é uma
 * só, se o retorno está alinhado com as alternativas, se a pergunta tem
 * resposta. Um item malformado não quebra a tela - ele só é impossível de
 * acertar, e a pessoa conclui que o problema é ela.
 *
 * ── a amostra ───────────────────────────────────────────────────────────
 * Todas as 22 letras × todos os construtores × com e sem áudio. É caro (uns
 * três mil itens) e é o ponto: um defeito que só aparece na letra 19 com
 * áudio ligado não se encontra testando alef.
 */

import { describe, expect, it } from 'vitest';
import { allLetters, course, scenesUpTo, sentencesUpTo } from '@/lib/content';
import {
  buildCheckpoint, buildFinalChallenge, buildLessonQuiz, buildLetterPractice,
  buildMiniTest, buildRemedial, buildReview, buildScenes, buildSentences,
  isChoice
} from '@/lib/engine/exercises';
import { rng } from '@/lib/engine/rng';
import { clean, clusters } from '@/lib/hebrew';
import type { Exercise, ExerciseKind } from '@/lib/engine/types';

const letras = allLetters();
const ate = (ordem: number) => letras.filter(l => l.order <= ordem);

/** Todo item que o curso consegue produzir, numa lista só. */
const TODOS: Exercise[] = (() => {
  const out: Exercise[] = [];
  for (const L of letras) {
    const hist = ate(L.order);
    for (const audioAvailable of [false, true]) {
      out.push(...buildLetterPractice(L, hist, { count: 10, seed: `p-${L.id}`, audioAvailable }));
      out.push(...buildMiniTest(L, hist, { seed: `m-${L.id}`, audioAvailable }));
      out.push(...buildLessonQuiz(L, hist, { count: 25, audioAvailable }));
      out.push(...buildRemedial(L, hist, [L.id], { count: 4, seed: `r-${L.id}`, audioAvailable }));
      out.push(...buildReview([L.id], hist, { count: 8, seed: `v-${L.id}`, audioAvailable }));
    }
  }
  for (const m of course.modules) {
    if (!m.checkpoint) continue;
    const doModulo = letras.filter(l => m.letterIds.includes(l.id));
    const ateAqui = ate(Math.max(...doModulo.map(l => l.order)));
    out.push(...buildCheckpoint(doModulo, ateAqui, { seed: `c-${m.n}` }));
  }
  out.push(...buildFinalChallenge(letras, scenesUpTo(22), { seed: 'exame' }));
  /* Cena e frase: os dois tipos que nenhum construtor de LIÇÃO produz - eles
     nascem no exame e na academia. Sem estas duas linhas, a varredura diria
     "todos os tipos conferidos" tendo pulado dois. */
  out.push(...buildScenes(scenesUpTo(22), rng('cenas'), 12));
  out.push(...buildSentences(sentencesUpTo(22), rng('frases'), 12));
  return out;
})();

const doTipo = (k: ExerciseKind) => TODOS.filter(e => e.kind === k);

const KINDS: ExerciseKind[] = [
  'letter-recognition', 'print-vs-cursive', 'final-form', 'syllable-reading',
  'word-meaning', 'sentence-reading', 'meaning-to-word', 'complete-word',
  'audio-recognition', 'vowel-sound', 'vowel-pair', 'letter-variant',
  'sound-to-syllable', 'listen-syllable', 'odd-one-out', 'letter-in-word',
  'letter-position', 'build-syllable', 'build-word', 'match', 'scene-reading',
  'type-answer'
];

describe('a varredura dos 22 tipos', () => {
  it('produziu amostra de todos eles', () => {
    /* Um tipo com zero amostras não foi aprovado: ele não foi CONFERIDO, e
       a suíte inteira estaria dizendo "tudo certo" sobre o que não viu. */
    const vazios = KINDS.filter(k => doTipo(k).length === 0);
    expect(vazios, 'tipo declarado que nenhum construtor gera').toEqual([]);
    expect(TODOS.length).toBeGreaterThan(2000);
  });

  it('e o id de todo item é estável e não-vazio', () => {
    /* O SRS guarda ids. Um id vazio ou que muda a cada montagem faz a
       revisão espaçada reagendar um item que ela acha que nunca viu. */
    for (const ex of TODOS) {
      expect(ex.id, `${ex.kind} sem id`).toBeTruthy();
      expect(ex.id).not.toMatch(/undefined|NaN|null/);
      expect(ex.letterId, `${ex.id} sem letterId`).toBeTruthy();
    }
  });
});

describe('todo item de escolha', () => {
  const escolhas = TODOS.filter(isChoice);

  it('tem a resposta dentro da lista', () => {
    /* `answer: 2` com duas alternativas compila e vira uma pergunta sem
       resposta certa - o aluno erra faça o que fizer. */
    const ruins = escolhas
      .filter(ex => !(ex.answer >= 0 && ex.answer < ex.options.length))
      .map(ex => `${ex.id}: answer ${ex.answer} de ${ex.options.length}`);
    expect([...new Set(ruins)]).toEqual([]);
  });

  it('tem pelo menos três alternativas', () => {
    /* Duas é cara ou coroa, e o curso recusa isso em prova. */
    const ruins = escolhas.filter(ex => ex.options.length < 3)
      .map(ex => `${ex.id}: ${ex.options.length}`);
    expect([...new Set(ruins)]).toEqual([]);
  });

  it('não repete alternativa', () => {
    /* Duas alternativas iguais dão duas respostas certas, e quem escolhe a
       "outra" certa é marcado como errado.

       `odd-one-out` fica de fora, e não por conveniência: nele a fileira de
       glifos repetidos É o exercício - "ache o diferente" precisa dos
       iguais. A regra dele é outra, e está logo abaixo: o intruso aparece
       uma vez só. */
    const ruins = escolhas
      .filter(ex => ex.kind !== 'odd-one-out')
      .filter(ex => new Set(ex.options).size !== ex.options.length)
      .map(ex => `${ex.id}: ${ex.options.join('|')}`);
    expect([...new Set(ruins)]).toEqual([]);
  });

  it('e o retorno de erro está alinhado com as alternativas', () => {
    /* `whyPt` é posicional. Uma lista de tamanho diferente faz a explicação
       de uma alternativa aparecer embaixo de outra - e a pessoa lê um
       motivo que não tem nada a ver com o que ela escolheu. */
    const ruins = escolhas
      .filter(ex => ex.whyPt && ex.whyPt.length !== ex.options.length)
      .map(ex => `${ex.id}: ${ex.whyPt!.length} motivos para ${ex.options.length} alternativas`);
    expect([...new Set(ruins)]).toEqual([]);
  });

  it('e nunca explica por que a resposta CERTA estaria errada', () => {
    const ruins = escolhas
      .filter(ex => ex.whyPt && ex.whyPt[ex.answer])
      .map(ex => `${ex.id}: "${ex.whyPt![ex.answer]}"`);
    expect([...new Set(ruins)]).toEqual([]);
  });

  it('e tem enunciado', () => {
    const ruins = escolhas.filter(ex => !ex.promptPt?.trim()).map(ex => ex.id);
    expect([...new Set(ruins)]).toEqual([]);
  });
});

describe('cada tipo, no que só ele tem', () => {
  it('build-syllable: a resposta monta a sílaba que ele pede', () => {
    for (const ex of doTipo('build-syllable')) {
      if (ex.kind !== 'build-syllable') continue;
      expect(ex.vowels.length, ex.id).toBeGreaterThanOrEqual(3);
      expect(new Set(ex.vowels).size, `${ex.id}: vogal repetida`).toBe(ex.vowels.length);
      expect(ex.answer, ex.id).toBeGreaterThanOrEqual(0);
      expect(ex.answer, ex.id).toBeLessThan(ex.vowels.length);
      /* Pela CONSOANTE DE BASE, e não pela string: o alvo é "תַּ" e a
         consoante é "תּ" - os mesmos caracteres, em ordem canônica
         diferente, porque o patah (classe 17) vem antes do daguesh (21)
         na forma NFC. Comparar as strings acusaria um dado que está certo. */
      const base = (s: string) => [...clean(s)].filter(c => /[א-ת]/.test(c)).join('');
      expect(base(ex.target), ex.id).toContain(base(ex.consonant));
      expect(ex.sound?.trim(), `${ex.id} sem leitura`).toBeTruthy();
    }
  });

  it('build-word: as peças remontam a palavra, e não vêm em ordem', () => {
    for (const ex of doTipo('build-word')) {
      if (ex.kind !== 'build-word') continue;
      expect([...ex.tiles].sort().join(''), ex.id).toBe([...clusters(ex.target)].sort().join(''));
      expect(ex.tiles.join(''), `${ex.id}: já vem montada`).not.toBe(clean(ex.target));
    }
  });

  it('match: nenhum lado repete, e há pelo menos três pares', () => {
    for (const ex of doTipo('match')) {
      if (ex.kind !== 'match') continue;
      expect(new Set(ex.pairs.map(p => p.left)).size, `${ex.id} esquerda`).toBe(ex.pairs.length);
      expect(new Set(ex.pairs.map(p => p.right)).size, `${ex.id} direita`).toBe(ex.pairs.length);
      expect(ex.pairs.length, ex.id).toBeGreaterThanOrEqual(3);
      expect(ex.labelLeft && ex.labelRight, `${ex.id} sem rótulo de coluna`).toBeTruthy();
    }
  });

  it('type-answer: aceita alguma coisa, e o campo diz o que quer', () => {
    for (const ex of doTipo('type-answer')) {
      if (ex.kind !== 'type-answer') continue;
      expect(ex.accept.length, `${ex.id} não aceita nada`).toBeGreaterThan(0);
      expect(ex.accept.every(a => a.trim().length > 0), ex.id).toBe(true);
      expect(ex.placeholder?.trim(), `${ex.id} sem placeholder`).toBeTruthy();
      expect(['translit', 'meaning']).toContain(ex.want);
    }
  });

  it('os tipos de áudio só existem quando há gravação', () => {
    /* Um exercício de escuta sem arquivo é uma pergunta muda: a pessoa
       clica no botão, não ouve nada, e tem de adivinhar. Hoje não há
       gravação nenhuma, então nenhum deles pode sair com áudio desligado. */
    for (const L of letras.slice(0, 6)) {
      const semAudio = buildLessonQuiz(L, ate(L.order), { count: 25, audioAvailable: false });
      const mudos = semAudio.filter(e =>
        e.kind === 'audio-recognition' || e.kind === 'listen-syllable');
      expect(mudos.map(e => e.id), `${L.id}: exercício de escuta sem áudio`).toEqual([]);
    }
  });

  it('e todo item de áudio carrega o id da gravação', () => {
    for (const ex of TODOS) {
      if (ex.kind !== 'audio-recognition' && ex.kind !== 'listen-syllable') continue;
      expect(ex.audioId, `${ex.id} sem audioId`).toMatch(/^he-[0-9a-f]{8}$/);
    }
  });

  it('odd-one-out: o intruso é um só', () => {
    for (const ex of doTipo('odd-one-out')) {
      if (ex.kind !== 'odd-one-out') continue;
      const certo = ex.options[ex.answer]!;
      const iguais = ex.options.filter(o => o === certo).length;
      expect(iguais, `${ex.id}: o intruso aparece ${iguais} vezes`).toBe(1);
    }
  });

  it('complete-word: existe uma lacuna, e uma só', () => {
    for (const ex of doTipo('complete-word')) {
      if (ex.kind !== 'complete-word') continue;
      const lacunas = ex.parts.filter(p => p === null).length;
      expect(lacunas, `${ex.id}: ${lacunas} lacunas`).toBe(1);
    }
  });

  it('letter-position: a letra procurada está mesmo na palavra', () => {
    /* Contando a FORMA FINAL como a mesma letra. "Onde está o {{מ}} em
       {{אֵם}}?" é uma pergunta legítima - e das boas, porque a resposta
       está na forma que o aluno acabou de aprender que é a mesma letra. */
    const finalDe = new Map(letras.filter(l => l.finalForm).map(l => [l.letter, l.finalForm!]));
    for (const ex of doTipo('letter-position')) {
      if (ex.kind !== 'letter-position') continue;
      const alvo = clean(ex.letter);
      const palavra = clean(ex.he);
      const ok = palavra.includes(alvo) || palavra.includes(finalDe.get(alvo) ?? '\u0000');
      expect(ok, `${ex.id}: "${ex.letter}" não está em "${ex.he}"`).toBe(true);
    }
  });

  it('scene-reading: diz onde a coisa é encontrada', () => {
    for (const ex of doTipo('scene-reading')) {
      if (ex.kind !== 'scene-reading') continue;
      expect(ex.wherePt?.trim(), `${ex.id} sem o lugar`).toBeTruthy();
      expect(ex.he?.trim(), `${ex.id} sem hebraico`).toBeTruthy();
    }
  });

  it('sentence-reading: a frase traz as palavras dela', () => {
    for (const ex of doTipo('sentence-reading')) {
      if (ex.kind !== 'sentence-reading') continue;
      expect(ex.words.length, `${ex.id} sem palavras`).toBeGreaterThan(0);
      for (const w of ex.words) expect(w.he && w.pt && w.translit, `${ex.id}: palavra incompleta`).toBeTruthy();
    }
  });
});

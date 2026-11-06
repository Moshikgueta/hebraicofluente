/* O Laboratório de Leitura (lib/laboratorio.ts, app/leitura), revisto em
 * 12/10/2026: banco só de palavras de leitura, notas que falam da palavra e
 * não de uma regra geral, e a autoavaliação separada do domínio. */
import { describe, expect, it } from 'vitest';
import { conteudoPago } from '@/lib/content-servidor';
import { course } from '@/lib/content-publico';
import {
  bancoDePalavras, descricao, instrucao, mensagemDaPrimeiraLeitura, nPalavras,
  palavrasDaPrimeiraLeitura, palavrasDaRodada, pedacosDe, vocabularioDeLeitura, vogaisConferem
} from '@/lib/laboratorio';
import { alfabetoDe, consegueLer } from '@/lib/engine/palavras';
import { stripNikud, clean } from '@/lib/hebrew';
import { rng } from '@/lib/engine/rng';
import { registrarLeitura } from '@/lib/state/rules';
import { mergeStates } from '@/lib/state/merge';
import { EMPTY_STATE, type LearnerState } from '@/lib/state/types';
// @ts-expect-error - módulo JS do Worker, sem tipos
import { isGatedPath } from '../../worker/src/gate.js';

const L = [...conteudoPago.letters].sort((a, b) => a.order - b.order);
const semPontos = conteudoPago.extras.unpointed.groups.flatMap(g => g.words);
const banco = bancoDePalavras(L, semPontos);

describe('o banco de palavras', () => {
  it('é só o vocabulário de LEITURA das lições, uma vez cada, com id estável', () => {
    expect(banco.length).toBeGreaterThan(80);
    expect(new Set(banco.map(w => w.id)).size).toBe(banco.length);
    const deLeitura = new Set(L.flatMap(l => l.wordsToRead.map(w => clean(w.he))));
    for (const w of banco) {
      expect(deLeitura.has(clean(w.he)), w.he).toBe(true);
      expect([1, 2, 3], w.he).toContain(w.dificuldade);
      expect(w.translit.trim(), w.he).not.toBe('');
      expect(w.pt.trim(), w.he).not.toBe('');
    }
    /* Uma palavra só de reconhecimento nunca entra. */
    const soReconhecer = L.flatMap(l => l.wordsToRecognize).filter(w => !deLeitura.has(clean(w.he)));
    for (const w of soReconhecer) expect(banco.some(b => clean(b.he) === clean(w.he)), w.he).toBe(false);
    expect(vocabularioDeLeitura(L).length).toBe(banco.length);
  });

  it('a forma sem nikud só existe para a lista do módulo 6, e é a palavra sem os pontos', () => {
    const lista = new Set(semPontos.map(w => clean(w.pointed)));
    for (const w of banco.filter(x => x.semNikud)) {
      expect(lista.has(clean(w.he)), w.he).toBe(true);
      expect(w.semNikud, w.he).toBe(stripNikud(w.he));
    }
  });

  it('a decomposição confere com a transliteração em quase todas, e recusa o kamats que soa O', () => {
    expect(banco.filter(w => w.vogaisConferem).length / banco.length).toBeGreaterThan(0.95);
    expect(vogaisConferem(pedacosDe('צָהֳרַיִם', L, 'tsohoráyim'), 'tsohoráyim')).toBe(false);
    expect(vogaisConferem(pedacosDe('שָׁלוֹם', L, 'shalóm'), 'shalóm')).toBe(true);
  });

  it('o áudio de cada palavra é o da própria palavra do curso', () => {
    const porHe = new Map(L.flatMap(l => l.wordsToRead).map(w => [clean(w.he), w.audioId]));
    for (const w of banco) expect(w.audioId, w.he).toBe(porHe.get(clean(w.he)));
  });
});

describe('as letras de uma palavra: o papel NESTA palavra', () => {
  it('Vav com ponto acima é o som O; com ponto dentro, o som U', () => {
    const p = pedacosDe('שָׁלוֹם', L, 'shalóm');
    expect(p.map(x => x.nomePt)).toEqual(['Shin', 'Lámed', 'Vav', 'Mem final']);
    expect(p[2]!.papel).toBe('vogal');
    expect(p[2]!.notaPt).toBe('Aqui, o Vav com o ponto acima representa o som O.');
    const u = pedacosDe('מוּ', L, 'mu');
    expect(u[1]!.notaPt).toBe('Aqui, o Vav com o ponto dentro representa o som U.');
  });

  it('Bet sem daguesh é /v/, com daguesh é /b/', () => {
    expect(pedacosDe('כֶּלֶב', L, 'kélev').map(x => x.somPt)).toEqual(['/k/', '/l/', '/v/']);
  });

  it('Yud depois do I ajuda a representar a vogal, sem som separado', () => {
    const p = pedacosDe('מִי', L, 'mi');
    expect(p[1]!.somPt).toBe('');
    expect(p[1]!.papel).toBe('apoio');
    expect(p[1]!.notaPt).toBe('Aqui, o Yud ajuda a representar a vogal I, sem produzir um som separado.');
  });

  it('Yud depois de E: ditongo só quando a transliteração diz "ei"', () => {
    expect(pedacosDe('אַחֲרֵי', L, 'acharéi').at(-1)!.notaPt).toMatch(/formam o som "ei"/);
    expect(pedacosDe('אַחֲרֵי', L, 'acharé').at(-1)!.notaPt).toMatch(/faz parte da representação da vogal E/);
  });

  it('He do fim, depois de vogal, apoia a vogal final', () => {
    const p = pedacosDe('תוֹדָה', L, 'todá');
    expect(p.at(-1)!.somPt).toBe('');
    expect(p.at(-1)!.notaPt).toBe('No fim de muitas palavras, o He não tem som próprio e ajuda a representar a vogal final.');
  });

  it('pátach especial só em ח/ע finais depois de vogal que não é A', () => {
    expect(pedacosDe('תַפּוּחַ', L, 'tapúach').at(-1)!.notaPt).toMatch(/pátach especial/);
    expect(pedacosDe('רוּחַ', L, 'rúach').at(-1)!.notaPt).toMatch(/pátach especial/);
    expect(pedacosDe('מַחַ', L, 'macha').at(-1)!.notaPt ?? '').not.toMatch(/pátach especial/);
  });

  it('Álef: a nota fala desta palavra, e com vogal é a vogal que soa', () => {
    const p = pedacosDe('אִמָא', L, 'íma');
    expect(p[0]!.papel).toBe('vogal');
    expect(p[0]!.notaPt).toBe('Nesta palavra, o Álef não tem som próprio: quem soa é a vogal I.');
    expect(p.at(-1)!.notaPt).toBe('Nesta palavra, o Álef não tem som próprio.');
    expect(descricao(p[0]!, true)).toBe('vogal I');
    expect(descricao(p.at(-1)!, true)).toBe('sem som de consoante aqui');
    expect(descricao(p[1]!, true)).toBe('/m/ + A');
  });

  it('Áyin: lembra que há tradições em que ele soa', () => {
    const p = pedacosDe('עִיר', L, 'ir');
    expect(p[0]!.notaPt).toMatch(/pronúncia israelense mais comum/);
    expect(p[0]!.notaPt).toMatch(/algumas tradições/);
  });

  it('nenhuma nota diz "sempre", "toda" ou "todo"', () => {
    for (const w of banco) for (const p of w.pedacos) {
      expect(p.notaPt ?? '', w.he).not.toMatch(/\bsempre\b|\btoda\b|\btodo\b/i);
    }
  });
});

describe('as rodadas e a Primeira Leitura', () => {
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

  it('uma palavra que pede uma lição de som só entra depois dela', () => {
    expect(banco.some(w => w.som)).toBe(true);
    const alfabeto = alfabetoDe(L);
    for (let s = 0; s < 20; s++) {
      for (const w of palavrasDaRodada(banco, alfabeto, 'menos-ajuda', rng(`som-${s}`), 5, new Set())) {
        expect(w.som, w.he).toBeNull();
      }
    }
  });

  it('a leitura independente não traz palavra de vogal especial', () => {
    const alfabeto = alfabetoDe(L);
    const sons = new Set(banco.map(w => w.som).filter((x): x is string => !!x));
    for (let s = 0; s < 20; s++) {
      for (const w of palavrasDaRodada(banco, alfabeto, 'independente', rng(`ind-${s}`), 5, sons)) {
        expect(w.vogaisConferem, w.he).toBe(true);
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
      const sons = new Set(course.modules.filter(x => x.n <= m.n).flatMap(x => x.lessons)
        .map(l => l.som).filter((x): x is string => !!x));
      const ws = palavrasDaPrimeiraLeitura(banco, doModulo, alfabetoDe(ate), 5, sons);
      expect(ws.length, `módulo ${m.n}`).toBeGreaterThanOrEqual(3);
      for (const w of ws) expect(w.vogaisConferem, w.he).toBe(true);
    }
  });
});

describe('os textos', () => {
  it('singular e plural', () => {
    expect(nPalavras(1)).toBe('1 palavra');
    expect(nPalavras(5)).toBe('5 palavras');
    expect(mensagemDaPrimeiraLeitura(5, 1, false)).toContain('Marcou 1 delas como lida corretamente.');
    expect(mensagemDaPrimeiraLeitura(5, 3, false)).toContain('Marcou 3 delas como lidas corretamente.');
  });

  it('só diz "sem ouvir a pronúncia antes" quando foi assim', () => {
    expect(mensagemDaPrimeiraLeitura(5, 4, false)).toContain('sem ouvir a pronúncia antes');
    expect(mensagemDaPrimeiraLeitura(5, 4, false)).toContain('você está começando a ler hebraico!');
    expect(mensagemDaPrimeiraLeitura(5, 4, true)).not.toContain('sem ouvir');
    expect(mensagemDaPrimeiraLeitura(5, 0, false)).not.toContain('grande passo');
  });

  it('a instrução só promete o áudio quando há gravação', () => {
    expect(instrucao('guiada', true)).toContain('ouça a pronúncia');
    expect(instrucao('guiada', false)).not.toMatch(/ouça|ouvir/i);
  });
});

describe('a autoavaliação fica separada do domínio', () => {
  it('registra a resposta e não mexe em skills, revisão nem XP', () => {
    const antes = { ...EMPTY_STATE, skills: {}, srs: {}, xp: 10 } as LearnerState;
    let s = registrarLeitura(antes, 'primeira-leitura-m1', true, '2026-10-12');
    s = registrarLeitura(s, 'primeira-leitura-m1', false, '2026-10-12');
    expect(s.leituraAutoavaliada!['primeira-leitura-m1']).toEqual({ tentadas: 2, consegui: 1, ultima: '2026-10-12' });
    expect(s.skills).toEqual({});
    expect(s.srs).toEqual({});
    expect(s.xp).toBe(10);
  });

  it('a fusão entre aparelhos guarda o maior, e estado antigo continua sem o campo', () => {
    const a = registrarLeitura(EMPTY_STATE as LearnerState, 'laboratorio-guiada', true, '2026-10-11');
    const b = registrarLeitura(registrarLeitura(EMPTY_STATE as LearnerState, 'laboratorio-guiada', true, '2026-10-12'),
      'laboratorio-guiada', true, '2026-10-12');
    expect(mergeStates(a, b).leituraAutoavaliada!['laboratorio-guiada']).toEqual({ tentadas: 2, consegui: 2, ultima: '2026-10-12' });
    expect(mergeStates(EMPTY_STATE as LearnerState, EMPTY_STATE as LearnerState).leituraAutoavaliada).toBeUndefined();
  });
});

it('a rota do laboratório é paga', () => {
  expect(isGatedPath('/leitura/')).toBe(true);
});

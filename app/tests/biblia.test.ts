/* O versículo da página «vou conseguir ler a Bíblia?».
 * ─────────────────────────────────────────────────────────────────────────
 * É o único texto antigo que o site mostra palavra por palavra para quem
 * ainda não comprou, e isso muda o peso de um erro: um typo aqui é um typo na
 * vitrine, na frente de gente que sabe o versículo de cor.
 *
 * A V22 do validate.js confere a GRAFIA no dado. O que estes casos travam é o
 * que a página promete a partir dele:
 *
 *   · as palavras somam o versículo - é por elas que a tela é montada;
 *   · a versão sem nikud é a mesma linha sem os pontos, e não outro texto;
 *   · `after` é a lição em que o versículo fica legível, calculada da ordem
 *     REAL das letras - a página diz esse número em voz alta;
 *   · e nada disso arrasta o curso pago junto (a régua está em
 *     tests/conteudo.test.ts; aqui se confere o outro lado, que o versículo
 *     não é material de aula disfarçado).
 */

import { describe, expect, it } from 'vitest';
import { bibleVerses, course } from '@/lib/content-publico';
import { allLetters } from '@/lib/content';
import { consonantsOf, hasNikud, stripNikud } from '@/lib/hebrew';

const versos = bibleVerses();

describe('o versículo público', () => {
  it('existe, com fonte e tradução', () => {
    expect(versos.length).toBeGreaterThan(0);
    for (const v of versos) {
      expect(v.fontePt.trim().length, v.id).toBeGreaterThan(0);
      expect(v.pt.trim().length, v.id).toBeGreaterThan(0);
      expect(v.translit.trim().length, v.id).toBeGreaterThan(0);
    }
  });

  it('vem apontado, e toda consoante é letra que o curso ensina', () => {
    const doCurso = new Set(allLetters().flatMap(l =>
      l.finalForm ? [l.letter, l.finalForm] : [l.letter]));
    for (const v of versos) {
      expect(hasNikud(v.he), v.id).toBe(true);
      const fora = [...v.he].filter(c => /[א-ת]/.test(c)).filter(c => !doCurso.has(c));
      expect(fora, v.id).toEqual([]);
    }
  });

  it('as palavras somadas reconstroem o versículo', () => {
    /* É por `words` que a tela é montada, uma palavra por botão. Uma palavra
       esquecida aqui some da tela sem avisar ninguém. */
    for (const v of versos) {
      expect(v.words.map(w => w.he).join(' '), v.id).toBe(v.he);
    }
  });

  it('a versão sem nikud é a MESMA linha, sem os pontos', () => {
    /* A seção do rolo de sinagoga põe as duas lado a lado. Se `bare` fosse
       outro texto - uma grafia plena diferente, por exemplo - a página
       estaria afirmando uma coisa falsa com as duas linhas na cara do leitor. */
    for (const v of versos) {
      expect(v.bare, v.id).toBe(stripNikud(v.he));
      expect(hasNikud(v.bare), v.id).toBe(false);
      for (const w of v.words) expect(w.bare, `${v.id}/${w.he}`).toBe(stripNikud(w.he));
    }
  });

  it('`after` é a ordem da letra mais tardia, e cabe dentro do curso', () => {
    const ordemDe = new Map(allLetters().flatMap(l =>
      (l.finalForm ? [l.letter, l.finalForm] : [l.letter]).map(g => [g, l.order] as const)));
    for (const v of versos) {
      const real = Math.max(...consonantsOf(v.he)
        .map(c => ordemDe.get(c) ?? 0));
      expect(v.after, v.id).toBe(real);
      expect(v.after, v.id).toBeLessThanOrEqual(course.totalLetters);
    }
  });

  it('cada palavra tem transliteração e glosa - a tela mostra as duas', () => {
    for (const v of versos) {
      for (const w of v.words) {
        expect(w.translit.trim().length, `${v.id}/${w.he}`).toBeGreaterThan(0);
        expect(w.pt.trim().length, `${v.id}/${w.he}`).toBeGreaterThan(0);
        expect(hasNikud(w.he), `${v.id}/${w.he}`).toBe(true);
      }
    }
  });

  it('e o hebraico das palavras não leva pontuação para dentro do <He>', () => {
    /* `<He>` joga em desenvolvimento se receber pontuação junto do hebraico,
       porque um caractere neutro colado num trecho RTL se move sozinho. A
       página monta um botão por palavra, então é palavra por palavra que a
       regra tem de valer. */
    for (const v of versos) {
      for (const w of v.words) {
        expect(/[()[\]{}:;/,<>«»"|]/.test(w.he), `${v.id}/${w.he}`).toBe(false);
      }
    }
  });
});

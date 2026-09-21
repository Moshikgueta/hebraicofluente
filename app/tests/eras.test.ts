/* As duas eras, e a afirmação que elas fazem.
 * ─────────────────────────────────────────────────────────────────────────
 * Pôr uma linha bíblica ao lado de uma frase de rua e dizer "é a mesma raiz"
 * é a afirmação mais forte que o curso faz sobre a língua. Também é a mais
 * fácil de inventar: bastam duas frases bonitas e um parentesco declarado.
 *
 * A V21 do validate.js já confere a raiz consoante por consoante no dado.
 * O que estes casos travam é o resto: que o par aponte para frases que
 * existem, que ele só abra quando AS DUAS forem legíveis - meia comparação
 * não compara nada - e que a raiz de fato apareça nas duas, do lado do app.
 */

import { describe, expect, it } from 'vitest';
import {
  allLetters, eraPairs, eraPairOpensAt, eraPairsUpTo, getSentence, sentencesUpTo
} from '@/lib/content';
import { clusters, consonantsOf } from '@/lib/hebrew';

const pares = eraPairs();

describe('os pares de era', () => {
  it('existem', () => {
    expect(pares.length).toBeGreaterThan(0);
  });

  it('apontam para frases que existem, uma antiga e uma moderna', () => {
    for (const p of pares) {
      const a = getSentence(p.antigo);
      const m = getSentence(p.moderno);
      expect(a, `${p.id}: antigo "${p.antigo}"`).toBeDefined();
      expect(m, `${p.id}: moderno "${p.moderno}"`).toBeDefined();
      expect(a!.era).toBe('antigo');
      expect(m!.era).toBe('moderno');
    }
  });

  it('a raiz declarada está DE VERDADE nas duas frases', () => {
    /* A mesma conferência da V21, do lado do app: se o exportador perder uma
       frase ou trocar um id, o parentesco vira decoração e é aqui que cai. */
    for (const p of pares) {
      const raiz = [...new Set(consonantsOf(p.raiz))];
      expect(raiz.length, `${p.id}: raiz "${p.raiz}"`).toBeGreaterThanOrEqual(2);
      for (const id of [p.antigo, p.moderno]) {
        const tem = new Set(consonantsOf(getSentence(id)!.he));
        for (const c of raiz) expect(tem.has(c), `${p.id}: ${c} em ${id}`).toBe(true);
      }
    }
  });

  it('o destaque acende de verdade: a raiz bate com CLUSTERS reais das frases', () => {
    /* `<He marks>` compara a raiz com a consoante de base de cada cluster.
       Se o dado viesse decomposto, ou se a raiz trouxesse o ponto do shin
       junto ({{שׁ}} em vez de {{ש}}), a comparação daria sempre falso e as
       letras simplesmente não acenderiam - sem erro, sem aviso, e com o
       bloco inteiro perdendo o sentido. */
    for (const p of pares) {
      const raiz = new Set(consonantsOf(p.raiz));
      for (const id of [p.antigo, p.moderno]) {
        const acesos = clusters(getSentence(id)!.he)
          .filter(g => raiz.has(consonantsOf(g)[0] ?? ''));
        expect(acesos.length, `${p.id}: nada aceso em ${id}`).toBeGreaterThanOrEqual(raiz.size);
      }
    }
  });

  it('citação antiga sem fonte não passa', () => {
    for (const p of pares) {
      expect(p.fontePt.trim().length, p.id).toBeGreaterThan(0);
      expect(p.idadePt.trim().length, p.id).toBeGreaterThan(0);
    }
  });
});

describe('quando um par abre', () => {
  it('abre na frase mais TARDIA das duas, nunca na mais cedo', () => {
    for (const p of pares) {
      const a = getSentence(p.antigo)!, m = getSentence(p.moderno)!;
      expect(eraPairOpensAt(p), p.id).toBe(Math.max(a.after, m.after));
    }
  });

  it('não aparece enquanto uma das duas linhas ainda não puder ser lida', () => {
    for (const p of pares) {
      const abre = eraPairOpensAt(p)!;
      expect(eraPairsUpTo(abre - 1).map(x => x.id)).not.toContain(p.id);
      expect(eraPairsUpTo(abre).map(x => x.id)).toContain(p.id);
    }
  });

  it('e quando aparece, as duas frases já estão ao alcance do aluno', () => {
    const maior = Math.max(...allLetters().map(l => l.order));
    for (let ordem = 1; ordem <= maior; ordem++) {
      const legiveis = new Set(sentencesUpTo(ordem).map(s => s.id));
      for (const p of eraPairsUpTo(ordem)) {
        expect(legiveis.has(p.antigo), `${p.id} na ordem ${ordem}`).toBe(true);
        expect(legiveis.has(p.moderno), `${p.id} na ordem ${ordem}`).toBe(true);
      }
    }
  });

  it('nenhum par abre antes da metade do alfabeto', () => {
    /* Não é regra de negócio, é consequência: uma frase inteira precisa de
       letras que só chegam no meio. O caso existe para avisar se alguém
       escrever um par com uma frase curta demais e ele aparecer na lição 3,
       onde o aluno ainda não lê nada. */
    for (const p of pares) expect(eraPairOpensAt(p)!, p.id).toBeGreaterThan(10);
  });
});

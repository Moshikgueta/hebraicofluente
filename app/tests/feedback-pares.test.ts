/* Fase 2a (12/10/2026): o retorno de uma troca entre duas letras, a
 * sugestão de treinar o par e as rodadas de SOM da Batalha. */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { conteudoPago } from '@/lib/content-servidor';
import { trocaDeLetras } from '@/lib/engine/feedback';
import { PARES_DE_SOM } from '@/lib/engine/pares-de-som';
import { rodadasDeSom } from '@/lib/engine/jogos';
import { rng } from '@/lib/engine/rng';
import { linkDoPar } from '@/components/learn/SugestaoDePar';

const L = [...conteudoPago.letters].sort((a, b) => a.order - b.order);
const fonte = (p: string) => readFileSync(join(__dirname, '..', 'src', p), 'utf8');

describe('a troca entre duas letras', () => {
  it('ד por ר traz a frase revisada e as duas letras', () => {
    const t = trocaDeLetras('ד', 'ר', L)!;
    expect(t.textoPt).toBe(L.find(l => l.letter === 'ד')!.contrastes!['ר']);
    expect(t.certa).toEqual({ glifo: 'ד', nome: 'Dálet' });
    expect(t.escolhida).toEqual({ glifo: 'ר', nome: 'Resh' });
  });

  it('acha a frase nos dois sentidos', () => {
    expect(trocaDeLetras('ר', 'ד', L)?.textoPt).toBeTruthy();
  });

  it('a mesma letra, ou um par sem frase revisada: nada', () => {
    expect(trocaDeLetras('ד', 'ד', L)).toBeNull();
    expect(trocaDeLetras('ם', 'מ', L)).toBeNull();
    expect(trocaDeLetras('א', 'ת', L)).toBeNull();
  });

  it('o retorno de um par aparece no tocador de exercícios', () => {
    const s = fonte('components/learn/ExercisePlayer.tsx');
    expect(s).toContain('trocaDeLetras(opts.expected, opts.chosenGlyph, allLetters())');
    expect(s).toContain('Observe as duas letras.');
  });
});

describe('a sugestão de treinar o par', () => {
  it('leva à Batalha com o par pedido', () => {
    expect(linkDoPar('ד', 'ר')).toBe(`/academia?jogo=batalha&par=${encodeURIComponent('דר')}`);
  });

  it('aparece no fim da lição, da revisão e do checkpoint', () => {
    for (const f of ['app/licao/[letterId]/LessonClient.tsx', 'app/revisao/ReviewClient.tsx', 'app/checkpoint/[n]/CheckpointClient.tsx']) {
      expect(fonte(f), f).toContain('<SugestaoDePar />');
    }
  });

  it('a Academia lê o par pedido', () => {
    expect(fonte('app/academia/AcademiaClient.tsx')).toContain("busca?.get('par')");
  });
});

describe('as rodadas de som da Batalha', () => {
  it('os pares são letras do curso, de sons diferentes', () => {
    const porGlifo = new Map(L.map(l => [l.letter, l]));
    for (const p of PARES_DE_SOM) {
      const a = porGlifo.get(p.a), b = porGlifo.get(p.b);
      expect(a && b, `${p.a}/${p.b}`).toBeTruthy();
      const sa = a!.syllables.find(s => s.vowel === 'a')!, sb = b!.syllables.find(s => s.vowel === 'a')!;
      expect(sa.translit, `${p.a}/${p.b}`).not.toBe(sb.translit);
      expect(p.notaPt).toContain(p.a === 'ש' ? 'שׁ' : p.a === 'ב' ? 'בּ' : p.a);
    }
  });

  it('só com as duas letras desbloqueadas e com gravação', () => {
    expect(rodadasDeSom(PARES_DE_SOM, L, rng('x'), () => false)).toEqual([]);
    const poucas = L.filter(l => ['he', 'het'].includes(l.id));
    const r = rodadasDeSom(PARES_DE_SOM, poucas, rng('y'), () => true, 4);
    expect(r).toHaveLength(4);
    for (const x of r) {
      expect(x.opcoes.map(o => o.letter).sort()).toEqual(['ה', 'ח'].sort());
      expect(x.opcoes.some(o => o.id === x.alvo.id)).toBe(true);
      expect(x.audioId).toBe(x.alvo.syllables.find(s => s.vowel === 'a')!.audioId);
    }
  });

  it('a rodada de som não grava troca de desenho', () => {
    const s = fonte('components/game/Batalha.tsx');
    expect(s).toMatch(/fechar\(certa, certa \? null : r\.notaPt, r\.alvo\.id, `som:batalha:/);
    /* Os rótulos moram no dicionário da tela (i18n), lidos como tx.chave. */
    const d = fonte('i18n/telas/academia-batalha.tsx');
    expect(s).toContain("meta === 'som' ? tx.parecidasSom : tx.parecidasDesenho");
    expect(d).toContain("parecidasSom: 'Parecidas no som'");
    expect(d).toContain("parecidasDesenho: 'Parecidas no desenho'");
  });
});

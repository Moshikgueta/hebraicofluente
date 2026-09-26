/* A escuta de frase e a etapa 1 enxuta (26/09/2026).
 *
 *   · as frases e cada linha dos mini-textos estão no catálogo de gravação,
 *     numa onda própria, e com o mesmo id que o app pede;
 *   · os dois exercícios de frase ouvida só existem com a frase gravada, e só
 *     mostram frases que o aluno já sabe ler;
 *   · "O que ela quer dizer?" responde em português e não mostra o texto;
 *   · a partir da letra 12 a etapa 1 deixa a explicação completa a um toque.
 */

import { afterEach, describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { allLetters, sentencesUpTo, textosDoCurso } from '@/lib/content';
import { contextFor, readingUsedBy } from '@/lib/engine/exercises';
import { exListenMeaning, exListenSentence, NEEDS_AUDIO, BY_SKILL } from '@/lib/engine/generators';
import { rng } from '@/lib/engine/rng';
import { aplicarManifesto, temClipe } from '@/lib/audio-registro';
import { clusters } from '@/lib/hebrew';

type Clip = { he: string; file: string; wave: number; kind: string; where: string[] };
const catalogo = JSON.parse(
  readFileSync(new URL('../../data/audio.json', import.meta.url), 'utf8')
) as { clips: Clip[] };
const porId = new Map(catalogo.clips.map(c => [c.file.replace(/\.mp3$/, ''), c]));

const letters = allLetters();
const ultima = letters.reduce((a, b) => (b.order > a.order ? b : a));
const historia = letters;

afterEach(() => aplicarManifesto({ clips: {} }));

describe('as frases e os textos no catálogo de gravação', () => {
  it('toda frase e toda linha de texto tem clipe; as que não são palavra do curso, na onda 4', () => {
    const pedidos = [
      ...sentencesUpTo(22).map(f => ({ id: f.audioId, onde: `frase ${f.id}` })),
      ...textosDoCurso().flatMap(t => t.linhas.map((l, i) => ({ id: l.audioId!, onde: `texto ${t.modulo}.${i + 1}` })))
    ];
    expect(pedidos.length).toBeGreaterThan(40);
    for (const p of pedidos) {
      const c = porId.get(p.id);
      expect(c, p.onde).toBeTruthy();
      /* Uma "frase" de uma palavra só (סְלִיחָה) já é palavra do curso e usa o
         mesmo clipe, na onda em que ela entrou: gravar duas vezes a mesma
         palavra é o que o catálogo existe para evitar. */
      if (c!.kind !== 'palavra') {
        expect(c!.wave, p.onde).toBe(4);
        expect(c!.kind, p.onde).toBe('frase');
      }
    }
    expect(catalogo.clips.filter(c => c.wave === 4).length).toBeGreaterThan(40);
  });
});

describe('a frase ouvida', () => {
  const ctx = contextFor(ultima, historia);
  const gravarTodas = () => aplicarManifesto({
    clips: Object.fromEntries(ctx.sentences.map(f => [f.audioId, [1, null, null]]))
  });

  it('não existe sem gravação', () => {
    /* Só as frases ainda sem gravação: desde 26/09/2026 "בֹּקֶר טוֹב" tem
       clipe (gravado no grupo "no mundo real"), e a frase ouvida existe
       justamente quando há o que ouvir. */
    const semAudio = { ...ctx, sentences: ctx.sentences.filter(f => !temClipe(f.audioId)) };
    expect(exListenSentence(ultima, semAudio, rng('a'), 0)).toBeNull();
    expect(exListenMeaning(ultima, semAudio, rng('a'), 0)).toBeNull();
  });

  it('com a frase gravada: ouvir e achar a frase escrita, entre frases que ele lê', () => {
    gravarTodas();
    const ex = exListenSentence(ultima, ctx, rng('b'), 0)!;
    expect(ex.kind).toBe('audio-recognition');
    expect(ex.skill).toBe('ouvir');
    if (ex.kind !== 'audio-recognition') return;
    const certa = ctx.sentences.find(f => f.audioId === ex.audioId)!;
    expect(ex.options[ex.answer]).toBe(certa.he);
    const legiveis = new Set(ctx.sentences.map(f => f.he));
    for (const o of ex.options) expect(legiveis.has(o), o).toBe(true);
    /* E passam pela regra de ordem, como toda alternativa em hebraico. */
    const alfabeto = new Set(ultima.alphabetSoFar);
    for (const t of readingUsedBy(ex)) {
      for (const g of clusters(t)) {
        const base = g.normalize('NFD').replace(/[\u0591-\u05C7\s]/g, '');
        if (/[א-ת]/.test(base)) expect(alfabeto.has(base), `${t}: ${base}`).toBe(true);
      }
    }
  });

  it('"O que ela quer dizer?": sem texto na tela, e a resposta em português', () => {
    gravarTodas();
    const ex = exListenMeaning(ultima, ctx, rng('c'), 0)!;
    expect(ex.kind).toBe('listen-meaning');
    if (ex.kind !== 'listen-meaning') return;
    const certa = ctx.sentences.find(f => f.audioId === ex.audioId)!;
    expect(ex.options[ex.answer]).toBe(certa.pt);
    for (const o of ex.options) expect(o).not.toMatch(/[א-ת]/);
    expect(readingUsedBy(ex)).toEqual([]);
  });

  it('entra na escuta: precisa de áudio e é da habilidade ouvir', () => {
    expect(NEEDS_AUDIO.has(exListenSentence)).toBe(true);
    expect(NEEDS_AUDIO.has(exListenMeaning)).toBe(true);
    expect(BY_SKILL.ouvir).toEqual(expect.arrayContaining([exListenSentence, exListenMeaning]));
  });
});

describe('a etapa 1 enxuta', () => {
  it('a partir da letra 12, a explicação completa fica a um toque', () => {
    const fonte = readFileSync(new URL('../src/app/licao/[letterId]/LessonClient.tsx', import.meta.url), 'utf8');
    expect(fonte).toMatch(/export const ENXUTA_DESDE = 12;/);
    expect(fonte).toMatch(/Ver a explicação completa/);
    /* O resumo continua à vista em toda letra. */
    expect(fonte).toMatch(/<Lembre texto=\{letter\.ensino\.lembrePt\} \/>/);
  });
});

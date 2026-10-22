/* A jornada de Raízes: interesses, descobertas, coleção (22/10/2026).
 * ─────────────────────────────────────────────────────────────────────────
 * Os campos novos do estado seguem a regra de lib/state/merge.ts: a fusão é
 * comutativa, idempotente e associativa, e nunca desfaz o que o aluno fez.
 *   · descobertas: a primeira vez (a mais antiga);
 *   · coleção: o gesto mais recente; empate, "guardado";
 *   · perfil: o mais recente.
 * E o que vem do servidor ou do navegador passa pela forma certa. */

import { describe, expect, it } from 'vitest';
import {
  RAIZES_VAZIO, descobrir, escolherInteresses, fundirRaizes, guardarNaColecao, naColecao, raizesValido,
  type EstadoRaizes
} from '@/lib/state/raizes-estado';
import { mergeStates } from '@/lib/state/merge';
import { EMPTY_STATE } from '@/lib/state/types';

const T1 = '2026-10-22T10:00:00.000Z', T2 = '2026-10-22T11:00:00.000Z', T3 = '2026-10-22T12:00:00.000Z';

const a: EstadoRaizes = guardarNaColecao(descobrir(escolherInteresses(RAIZES_VAZIO, ['familia'], T1), 'artefato:m01:guia', T2), 'lugar:lisboa', true, T2);
const b: EstadoRaizes = guardarNaColecao(descobrir(escolherInteresses(RAIZES_VAZIO, ['brasil', 'historia'], T3), 'artefato:m01:guia', T1), 'lugar:lisboa', false, T3);
const c: EstadoRaizes = descobrir(RAIZES_VAZIO, 'personagem:maimonides', T2);

describe('os campos novos da jornada fundem sem perder nada', () => {
  it('descoberta: a primeira vez; coleção: o gesto mais recente; perfil: o mais recente', () => {
    const f = fundirRaizes(a, b);
    expect(f.descobertas?.['artefato:m01:guia']).toBe(T1);
    expect(naColecao(f, 'lugar:lisboa')).toBe(false);
    expect(f.perfil?.interesses).toEqual(['brasil', 'historia']);
  });

  it('comutativa, idempotente e associativa', () => {
    expect(fundirRaizes(a, b)).toEqual(fundirRaizes(b, a));
    expect(fundirRaizes(a, a)).toEqual(a);
    expect(fundirRaizes(fundirRaizes(a, b), c)).toEqual(fundirRaizes(a, fundirRaizes(b, c)));
  });

  it('empate na coleção: guardar vence, dos dois lados', () => {
    const x = guardarNaColecao(RAIZES_VAZIO, 'lugar:toledo', true, T2);
    const y = guardarNaColecao(RAIZES_VAZIO, 'lugar:toledo', false, T2);
    expect(naColecao(fundirRaizes(x, y), 'lugar:toledo')).toBe(true);
    expect(naColecao(fundirRaizes(y, x), 'lugar:toledo')).toBe(true);
  });

  it('a primeira descoberta não muda depois', () => {
    const x = descobrir(RAIZES_VAZIO, 'lugar:fez', T1);
    expect(descobrir(x, 'lugar:fez', T3).descobertas?.['lugar:fez']).toBe(T1);
  });

  it('entra pela fusão geral do estado do aluno', () => {
    const m = mergeStates({ ...EMPTY_STATE, raizes: a }, { ...EMPTY_STATE, raizes: b });
    expect(m.raizes?.descobertas?.['artefato:m01:guia']).toBe(T1);
  });

  it('o que vem de fora passa pela forma certa: chave estranha, interesse inventado e data ruim saem', () => {
    const v = raizesValido({
      atividades: {}, etapas: {}, onde: null,
      descobertas: { 'artefato:m01:guia': T1, 'qualquer:coisa': T1, 'lugar:<script>': T1, 'lugar:fez': 'ontem' },
      colecao: { 'lugar:lisboa': { em: T1, ativo: true }, 'lugar:porto': { em: T1, ativo: 'sim' } },
      perfil: { interesses: ['familia', 'ascendencia-comprovada'], em: T2 }
    });
    expect(Object.keys(v?.descobertas ?? {})).toEqual(['artefato:m01:guia']);
    expect(Object.keys(v?.colecao ?? {})).toEqual(['lugar:lisboa']);
    expect(v?.perfil?.interesses).toEqual(['familia']);
  });

  it('estado antigo, sem os campos novos, continua igual', () => {
    const antigo = { atividades: {}, etapas: { 'm01:descobrir': T1 }, onde: null };
    expect(raizesValido(antigo)).toEqual(antigo);
    expect(fundirRaizes(antigo, antigo)).toEqual(antigo);
  });
});

/* ── com o conteúdo: personagens, mundos, busca, selos e sugestões ──────── */

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { hidratarRaizes, marcasDe, type DadosRaizes } from '@/lib/raizes';
import { MUNDOS, _limparIndice, buscar, glossario, itemPorChave, recomendar, selos } from '@/lib/raizes-jornada';
import { conteudoRaizesBruto } from '../../worker/src/api/content-raizes.js';
import { isGatedPath, cursoDaRota } from '../../worker/src/gate.js';

const RAIZ = new URL('../../', import.meta.url).pathname;
const RAIZES = process.env.HF_RAIZES || join(RAIZ, 'raizes');
const TEM_CONTEUDO = existsSync(join(RAIZES, 'data/curso.json'));

describe('as páginas novas ficam atrás do portão de Raízes', () => {
  it.each(['/raizes/busca/', '/raizes/glossario/', '/raizes/passaporte/', '/raizes/colecao/', '/raizes/personagens/'])('%s', rota => {
    expect(isGatedPath(rota)).toBe(true);
    expect(cursoDaRota(rota)).toBe('raizes-sefarditas');
  });
});

describe.skipIf(!TEM_CONTEUDO)('a jornada com o conteúdo de verdade', () => {
  const dados = TEM_CONTEUDO ? (JSON.parse(conteudoRaizesBruto()) as DadosRaizes) : null;
  if (dados) { hidratarRaizes(dados); _limparIndice(); }
  const afirmacoes = TEM_CONTEUDO
    ? new Map((JSON.parse(readFileSync(join(RAIZES, 'data/afirmacoes.json'), 'utf8')).afirmacoes as { id: string; status: string }[]).map(a => [a.id, a]))
    : new Map();

  it('os cinco mundos cobrem os dez módulos, cada um uma vez', () => {
    const todos = MUNDOS.flatMap(w => w.modulos).sort((a, b) => a - b);
    expect(todos).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it('personagens: cada frase tem fonte que pode ir ao texto, depois da pontuação, e todo ano tem fonte', () => {
    const ruins: string[] = [];
    const lugares = new Set((dados!.atlas?.lugares ?? []).map(l => l.id));
    for (const p of dados!.personagens ?? []) {
      for (const t of [p.resumo, ...p.paragrafos]) {
        const marcas = marcasDe(t);
        if (!marcas.length) ruins.push(`${p.id}: texto sem fonte`);
        for (const id of marcas) {
          const a = afirmacoes.get(id);
          if (!a || !['VERIFICADO', 'CONTESTADO'].includes(a.status)) ruins.push(`${p.id}: ${id}`);
        }
        if (/[A-Za-zÀ-ú]\s*\[\[/.test(t)) ruins.push(`${p.id}: marca antes da pontuação`);
      }
      for (const l of p.lugares) if (!lugares.has(l)) ruins.push(`${p.id}: lugar ${l}`);
      for (const n of p.modulos) if (n < 1 || n > 10) ruins.push(`${p.id}: módulo ${n}`);
    }
    expect(ruins).toEqual([]);
    expect((dados!.personagens ?? []).length).toBeGreaterThanOrEqual(10);
  });

  it('a busca acha sem acento, e cada resultado tem rota', () => {
    const r = buscar('maimonides');
    expect(r.some(i => i.tipo === 'personagem')).toBe(true);
    expect(buscar('lisboa').length).toBeGreaterThan(0);
    expect(buscar('x')).toEqual([]);
    for (const i of buscar('judeu')) expect(i.rota.startsWith('/raizes')).toBe(true);
  });

  it('o glossário não repete termo e diz os módulos', () => {
    const g = glossario();
    expect(g.length).toBeGreaterThan(10);
    expect(new Set(g.map(t => t.id)).size).toBe(g.length);
    for (const t of g) expect(t.modulos.length).toBeGreaterThan(0);
  });

  it('a coleção acha de volta o que se guarda nas telas', () => {
    expect(itemPorChave('personagem:maimonides')?.titulo).toBeTruthy();
    expect(itemPorChave('lugar:lisboa')).toBeTruthy();
  });

  it('selos começam vazios e não dependem de dado de família', () => {
    const s = selos(undefined);
    expect(s.every(x => !x.tem)).toBe(true);
    expect(s.map(x => x.id)).not.toContain('familia');
    const muitos = Object.fromEntries((dados!.personagens ?? []).map(p => [`personagem:${p.id}`, T1]));
    expect(selos({ ...RAIZES_VAZIO, descobertas: muitos }).find(x => x.id === 'personagens')?.tem).toBe(true);
  });

  it('toda sugestão diz por quê, e o interesse muda o que vem', () => {
    const sem = recomendar(undefined);
    expect(sem.length).toBeGreaterThan(0);
    for (const x of sem) expect(x.porque.length).toBeGreaterThan(5);
    const brasil = recomendar(escolherInteresses(RAIZES_VAZIO, ['brasil'], T1), true);
    expect(brasil.some(x => x.porque.includes('presença sefardita no brasil'))).toBe(true);
  });
});

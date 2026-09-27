/* Trocar XP por recompensas (27/09/2026). Ver lib/loja.ts.
 *
 *   · o total é conquista e não diminui; gastar sai do saldo;
 *   · as recusas: saldo, limite de folgas, a mesma carta, nome sem grafia;
 *   · a folga salva a sequência - tudo ou nada - e só uma vez cada;
 *   · a fusão entre aparelhos não cobra duas vezes e não perde uso de folga;
 *   · o que vem de fora com forma errada é descartado.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { comprar, fundirCompras, folgasLivres, ITENS, saldo, cartasCompradas, leiturasCompradas } from '@/lib/loja';
import { itemDaLeitura, leiturasPublicadas, type GuiaNikud, type LeituraBonus } from '@/lib/engine/bonus';
import { applyPractice, displayStreak, goalTarget } from '@/lib/state/rules';
import { mergeStates } from '@/lib/state/merge';
import { migrate } from '@/lib/state/migrate';
import { EMPTY_STATE, type LearnerState } from '@/lib/state/types';

const com = (xp: number, extra: Partial<LearnerState> = {}): LearnerState => ({ ...EMPTY_STATE, xp, ...extra });
const T = '2026-09-27T10:00:00.000Z';

function compra(s: LearnerState, item: Parameters<typeof comprar>[1], agora = T, alvo?: string) {
  const r = comprar(s, item, agora, alvo);
  if (!r.ok) throw new Error(`recusou: ${r.motivo}`);
  return r.state;
}

describe('o saldo', () => {
  it('gastar tira do saldo, e o total continua o mesmo', () => {
    const s = compra(com(500), 'folga');
    expect(s.xp).toBe(500);
    expect(saldo(s)).toBe(500 - ITENS.folga.custo);
  });

  it('as recusas', () => {
    expect(comprar(com(50), 'folga', T)).toEqual({ ok: false, motivo: 'saldo' });
    let s = compra(com(1000), 'folga', 'a');
    s = compra(s, 'folga', 'b');
    expect(comprar(s, 'folga', 'c')).toEqual({ ok: false, motivo: 'limite' });
    s = compra(s, 'carta', T, 'alfabeto');
    expect(comprar(s, 'carta', T, 'alfabeto')).toEqual({ ok: false, motivo: 'ja-tem' });
    expect(comprar(s, 'carta', T)).toEqual({ ok: false, motivo: 'sem-alvo' });
    expect(comprar(s, 'nome-decorado', T)).toEqual({ ok: false, motivo: 'sem-nome' });
    const comNome = { ...s, nomeHebraico: { texto: 'משה', confirmadoEm: T } };
    const n = compra(comNome, 'nome-decorado');
    expect(comprar(n, 'nome-decorado', T)).toEqual({ ok: false, motivo: 'ja-tem' });
    expect(cartasCompradas(n).has('alfabeto')).toBe(true);
  });
});

describe('a folga salva a sequência', () => {
  const meta = goalTarget(10);
  const cumprir = (s: LearnerState, dia: string) => applyPractice(s, dia, { units: meta });
  /* Três dias seguidos: sequência 3, último dia 03. */
  const base = () => ['2026-09-01', '2026-09-02', '2026-09-03'].reduce(cumprir, com(0));

  it('um dia perdido e uma folga: a sequência continua, e a folga fica gasta naquele dia', () => {
    const s0 = compra({ ...base(), xp: 500 }, 'folga');
    expect(displayStreak(s0, '2026-09-05'), 'viva no dia seguinte ao perdido').toBe(3);
    const s = cumprir(s0, '2026-09-05');
    expect(s.streak.current).toBe(4);
    expect(folgasLivres(s)).toHaveLength(0);
    expect(Object.values(s.loja.compras)[0]!.usadaEm).toBe('2026-09-04');
  });

  it('dois dias perdidos e uma folga só: recomeça, e a folga NÃO é gasta à toa', () => {
    const s0 = compra({ ...base(), xp: 500 }, 'folga');
    expect(displayStreak(s0, '2026-09-06')).toBe(0);
    const s = cumprir(s0, '2026-09-06');
    expect(s.streak.current).toBe(1);
    expect(folgasLivres(s)).toHaveLength(1);
  });

  it('sem folga, como sempre: recomeça', () => {
    expect(cumprir(base(), '2026-09-05').streak.current).toBe(1);
  });
});

describe('dois aparelhos', () => {
  it('a mesma carta comprada nos dois vira uma compra só, e a fusão é comutativa', () => {
    const a = compra(com(1000), 'carta', '2026-09-27T10:00:00.000Z', 'x');
    const b = compra(com(1000), 'carta', '2026-09-27T11:00:00.000Z', 'x');
    const ab = mergeStates(a, b), ba = mergeStates(b, a);
    expect(Object.keys(ab.loja.compras)).toEqual(['carta:x']);
    expect(ab.loja).toEqual(ba.loja);
    expect(saldo(ab)).toBe(1000 - ITENS.carta.custo);
  });

  it('uma folga usada num aparelho continua usada depois da fusão', () => {
    const c = { 'folga:1': { item: 'folga', custo: 100, em: '1', usadaEm: null } };
    const d = { 'folga:1': { item: 'folga', custo: 100, em: '1', usadaEm: '2026-09-04' } };
    expect(fundirCompras(c, d)['folga:1']!.usadaEm).toBe('2026-09-04');
    expect(fundirCompras(d, c)['folga:1']!.usadaEm).toBe('2026-09-04');
  });

  it('o que vem de fora com forma errada é descartado', () => {
    const s = migrate({ ...EMPTY_STATE, xp: 100, loja: { compras: {
      ok: { item: 'folga', custo: 100, em: T },
      custoTexto: { item: 'folga', custo: '-9999', em: T },
      custoNegativo: { item: 'carta', custo: -500, em: T },
      itemInventado: { item: 'xp-infinito', custo: 1, em: T }
    } } });
    expect(Object.keys(s.loja.compras)).toEqual(['ok']);
    expect(migrate({ ...EMPTY_STATE, loja: undefined }).loja).toEqual({ compras: {} });
  });
});

describe('as leituras bônus', () => {
  it('cada leitura é uma compra só, e texto custa mais que bênção', () => {
    let s = compra(com(1000), 'texto-bonus', T, 'shema');
    expect(comprar(s, 'texto-bonus', T, 'shema')).toEqual({ ok: false, motivo: 'ja-tem' });
    expect(comprar(s, 'bencao', T)).toEqual({ ok: false, motivo: 'sem-alvo' });
    s = compra(s, 'bencao', T, 'bencao-pao');
    expect([...leiturasCompradas(s)].sort()).toEqual(['bencao-pao', 'shema']);
    expect(saldo(s)).toBe(1000 - ITENS['texto-bonus'].custo - ITENS.bencao.custo);
    expect(ITENS['texto-bonus'].custo).toBeGreaterThan(ITENS.bencao.custo);
    /* Uma carta com o mesmo nome de alvo não se confunde com a leitura. */
    expect(cartasCompradas(s).size).toBe(0);
  });

  it('só as revisadas aparecem, e o tipo escolhe o item', () => {
    const base = { tituloPt: '', fontePt: '', introPt: '', after: 1, linhas: [] };
    const ls = [
      { ...base, id: 'a', tipo: 'texto' as const, revisado: true },
      { ...base, id: 'b', tipo: 'curto' as const, revisado: false }
    ];
    expect(leiturasPublicadas(ls).map(l => l.id)).toEqual(['a']);
    expect(itemDaLeitura(ls[0]!)).toBe('texto-bonus');
    expect(itemDaLeitura(ls[1]!)).toBe('bencao');
  });

  it('o conteúdo exportado: toda linha com áudio, transliteração e tradução, e `after` calculado', () => {
    const { leituras } = JSON.parse(readFileSync(join(__dirname, '../content/bonus.json'), 'utf8')) as { leituras: LeituraBonus[] };
    expect(leituras.length).toBeGreaterThan(0);
    for (const l of leituras) {
      expect(l.after, l.id).toBeGreaterThan(0);
      for (const x of l.linhas) {
        expect(x.audioId, l.id).toMatch(/^he-[0-9a-f]{8}$/);
        expect(x.translit && x.pt, l.id).toBeTruthy();
      }
    }
    /* A abertura das bênçãos é a MESMA linha em todas: um clipe só. */
    const aberturas = new Set(leituras.filter(l => l.id.startsWith('bencao-') && l.id !== 'bencao-sacerdotal').map(l => l.linhas[0]!.audioId));
    expect(aberturas.size).toBe(1);
  });
});

describe('o guia do nikud bíblico', () => {
  it('todo exemplo sai de uma linha das leituras (já aprovadas) e tem gravação', () => {
    const { leituras, guia } = JSON.parse(readFileSync(join(__dirname, '../content/bonus.json'), 'utf8')) as
      { leituras: LeituraBonus[]; guia: GuiaNikud };
    const linhas = leituras.flatMap(l => l.linhas.map(x => x.he.normalize('NFC'))).join(' ');
    for (const s of guia.secoes) {
      expect(s.exemplos.length, s.id).toBeGreaterThan(0);
      for (const e of s.exemplos) {
        expect(linhas.includes((e.ouvir ?? e.he).normalize('NFC')), `${s.id}: ${e.he}`).toBe(true);
        expect(e.audioId).toMatch(/^he-[0-9a-f]{8}$/);
      }
    }
  });
});

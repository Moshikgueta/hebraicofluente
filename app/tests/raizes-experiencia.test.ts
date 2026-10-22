/* O protótipo "O Arquivo Aberto" (22/10/2026, módulo 3).
 * ─────────────────────────────────────────────────────────────────────────
 * A forma nova não pode dizer mais do que o texto: a narrativa só acende no
 * mapa lugares que o próprio bloco nomeia, os blocos citados existem, e toda
 * ilustração se diz interpretativa. O documento explorável cabe nas partes
 * que a folha desenha. */

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { MODULOS_COM_CONTEUDO, type Atlas, type ModuloRaizes } from '@/lib/raizes';
import { PARTES_DA_FOLHA } from '@/components/raizes/arquivo/Edito';

const RAIZ = new URL('../../', import.meta.url).pathname;
const RAIZES = process.env.HF_RAIZES || join(RAIZ, 'raizes');
const TEM = existsSync(join(RAIZES, 'data/atlas.json'));
const ler = (p: string) => JSON.parse(readFileSync(join(RAIZES, p), 'utf8'));
const modulos: ModuloRaizes[] = TEM ? MODULOS_COM_CONTEUDO.map(n => ler(`data/modulos/m${String(n).padStart(2, '0')}.json`)) : [];
const atlas: Atlas | null = TEM ? ler('data/atlas.json') : null;
const semMarcas = (t: string) => t.replace(/\[\[[^\]]*\]\]/g, '');

describe.skipIf(!TEM)('a experiência do módulo não diz mais do que o texto', () => {
  const com = modulos.filter(m => m.experiencia);

  it('o protótipo existe no módulo 3, e só nele por enquanto', () => {
    expect(com.map(m => m.n)).toEqual([3]);
  });

  it('a narrativa cita blocos de texto da etapa, e cada lugar aceso é nomeado no bloco', () => {
    for (const m of com) {
      const nar = m.experiencia!.narrativa!;
      const etapa = m.etapas.find(e => e.id === nar.etapa);
      expect(etapa, nar.etapa).toBeTruthy();
      const mapa = Object.values(m.atividades).find(a => a.tipo === 'mapa');
      const lugares = new Map<string, { nome: string }>([
        ...(atlas!.lugares.map(l => [l.id, l] as const)),
        ...(mapa?.tipo === 'mapa' ? mapa.lugares.map(l => [l.id, l] as const) : [])
      ]);
      for (const p of nar.passos) {
        const b = etapa!.blocos.find(x => x.tipo === 'texto' && x.titulo === p.bloco);
        expect(b, p.bloco).toBeTruthy();
        const texto = b && b.tipo === 'texto' ? semMarcas(b.paragrafos.join(' ')) : '';
        for (const id of p.lugares) {
          const l = lugares.get(id);
          expect(l, `${p.bloco} → ${id}`).toBeTruthy();
          expect(texto, `${p.bloco} não nomeia ${id}`).toContain(l!.nome.replace(/ \(.*\)$/, ''));
        }
        for (const id of p.areas ?? []) expect(atlas!.lugares.find(l => l.id === id)?.area, id).toBe(true);
        if (p.rota) expect(atlas!.rotas.some(r => r.id === p.rota), p.rota).toBe(true);
        for (const ano of p.ano.match(/\d{4}/g) ?? []) expect(`${p.bloco} ${texto}`, `${p.bloco}: ${ano}`).toContain(ano);
      }
    }
  });

  it('toda ilustração se diz interpretativa, e o documento cabe na folha', () => {
    for (const m of com) {
      expect(m.experiencia!.abertura!.legenda).toMatch(/interpretativa/);
      for (const e of m.etapas) {
        for (const b of e.blocos) {
          if (b.tipo !== 'documento') continue;
          expect(b.legenda).toMatch(/interpretativa/);
          expect(b.partes.length).toBeGreaterThan(1);
          expect(b.partes.length).toBeLessThanOrEqual(PARTES_DA_FOLHA.length);
          for (const p of b.partes) expect(p.texto, p.id).toMatch(/\[\[[A-Z]\d{2}-\d{3}/);
        }
      }
    }
  });
});

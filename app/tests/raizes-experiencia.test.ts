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
import { GRAVURAS } from '@/components/raizes/ilustracoes/Gravuras';

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

describe.skipIf(!TEM)('as peças do Israel Além do Óbvio', () => {
  const blocos = modulos.flatMap(m => m.etapas.flatMap(e => e.blocos.map(b => ({ m: m.n, b }))));

  it('toda gravura pedida existe, e a vinheta de cada seção também', () => {
    for (const m of modulos) for (const e of m.etapas) if (e.vinheta) expect(GRAVURAS[e.vinheta], `${m.n}:${e.id}`).toBeTruthy();
    for (const { m, b } of blocos) if (b.tipo === 'artefatos') for (const a of b.itens) expect(GRAVURAS[a.gravura], `${m}:${a.id}`).toBeTruthy();
  });

  it('artefato: ficha com fonte, legenda que se diz interpretativa, ids únicos no módulo', () => {
    for (const m of modulos) {
      const ids = m.etapas.flatMap(e => e.blocos.flatMap(b => (b.tipo === 'artefatos' ? b.itens.map(a => a.id) : [])));
      expect(new Set(ids).size, `módulo ${m.n}`).toBe(ids.length);
    }
    for (const { m, b } of blocos) {
      if (b.tipo !== 'artefatos') continue;
      for (const a of b.itens) {
        expect(a.legenda, `${m}:${a.id}`).toMatch(/interpretativa/);
        expect(a.texto, `${m}:${a.id}`).toMatch(/\[\[[A-Z]\d{2}-\d{3}/);
        expect(['documento', 'objeto', 'lugar', 'livro']).toContain(a.tipo);
      }
    }
  });

  it('palpite, verdadeiro ou falso e curiosidade: toda resposta e explicação tem fonte', () => {
    for (const { m, b } of blocos) {
      if (b.tipo === 'palpite') {
        expect(b.resposta, `${m}:${b.id}`).toMatch(/\[\[[A-Z]\d{2}-\d{3}/);
        expect(b.opcoes.length, `${m}:${b.id}`).toBeGreaterThanOrEqual(2);
        expect(b.opcoes.filter(o => o.correta).length, `${m}:${b.id}`).toBeLessThanOrEqual(1);
      }
      if (b.tipo === 'vf') {
        expect(b.itens.length, `${m}:${b.id}`).toBeGreaterThanOrEqual(3);
        expect(b.itens.some(i => i.verdadeira) && b.itens.some(i => !i.verdadeira), `${m}:${b.id} mistura V e F`).toBe(true);
        for (const it of b.itens) {
          expect(it.explicacao, it.afirmacao).toMatch(/\[\[[A-Z]\d{2}-\d{3}/);
          /* A afirmação a julgar não leva marca: marcar uma frase falsa seria dar fonte a ela. */
          expect(it.afirmacao, it.afirmacao).not.toMatch(/\[\[/);
        }
      }
      if (b.tipo === 'curiosidades') for (const it of b.itens) expect(it.texto, it.titulo).toMatch(/\[\[[A-Z]\d{2}-\d{3}/);
    }
  });

  it('todo módulo tem peças: artefatos, um jogo e curiosidades', () => {
    for (const m of modulos) {
      const tipos = new Set(m.etapas.flatMap(e => e.blocos.map(b => b.tipo)));
      expect(tipos.has('artefatos'), `módulo ${m.n}: artefatos`).toBe(true);
      expect(tipos.has('vf') || tipos.has('palpite'), `módulo ${m.n}: um jogo`).toBe(true);
      expect(tipos.has('curiosidades'), `módulo ${m.n}: curiosidades`).toBe(true);
    }
  });
});

/* O blog (29/10/2026). Os artigos são texto novo, escrito para o site: cada um
   nasce com revisado: false e só vai ao ar aprovado pelo dono. O hebraico
   deles só pode ser de palavras, sílabas e letras que já estão no curso. */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const ler = (f: string) => JSON.parse(readFileSync(new URL(`../../data/${f}`, import.meta.url), 'utf8'));
const blog = ler('blog.json') as { artigos: { slug: string; titulo: string; descricao: string; resumo: string;
  atualizadoEm: string; revisado: unknown; blocos: { t: string; x?: string; itens?: unknown[]; href?: string }[] }[] };

const HE = /[֐-׿]/;
const marcas = (t: string) => [...t.matchAll(/\{\{([^}]*)\}\}/g)].map(m => m[1]!);

/* Todo hebraico que o curso já publica: frases inteiras e o que está entre {{...}}. */
const doCurso = new Set<string>();
const juntar = (v: unknown): void => {
  if (typeof v === 'string') {
    if (HE.test(v)) { doCurso.add(v.trim()); for (const m of marcas(v)) doCurso.add(m); }
  } else if (Array.isArray(v)) v.forEach(juntar);
  else if (v && typeof v === 'object') Object.values(v).forEach(juntar);
};
for (const f of ['letters.json', 'sentences.json', 'textos.json', 'nikud.json']) juntar(ler(f));

describe('o blog', () => {
  it('todo artigo tem a trava da revisão', () => {
    for (const a of blog.artigos) expect(typeof a.revisado, a.slug).toBe('boolean');
  });

  it('o hebraico dos artigos é só o do curso', () => {
    for (const a of blog.artigos) {
      const textos = [a.titulo, a.descricao, a.resumo];
      for (const b of a.blocos) {
        if (b.x) textos.push(b.x);
        if (b.t === 'lista') textos.push(...(b.itens as string[]));
        if (b.t === 'palavras') {
          for (const w of b.itens as { he: string }[]) expect(doCurso.has(w.he), `${a.slug}: ${w.he}`).toBe(true);
        }
      }
      for (const t of textos) {
        for (const m of marcas(t)) expect(doCurso.has(m), `${a.slug}: ${m}`).toBe(true);
        /* Hebraico só dentro de {{...}}: fora delas ele escaparia do <He>. */
        expect(HE.test(t.replace(/\{\{[^}]*\}\}/g, '')), `${a.slug}: hebraico sem marca em "${t.slice(0, 40)}"`).toBe(false);
      }
    }
  });

  it('título, descrição e endereço servem para a busca', () => {
    const slugs = new Set<string>();
    for (const a of blog.artigos) {
      expect(a.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(slugs.has(a.slug), a.slug).toBe(false);
      slugs.add(a.slug);
      expect(a.descricao.length, a.slug).toBeLessThanOrEqual(155);
      expect(HE.test(a.descricao) || HE.test(a.titulo), a.slug).toBe(false);
      expect(a.atualizadoEm).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('os links internos apontam para páginas que existem', () => {
    for (const a of blog.artigos) for (const b of a.blocos) {
      if (b.t !== 'veja') continue;
      const alvo = b.href!.replace(/\/$/, '');
      const existe = alvo === '/alfabeto-hebraico' || (alvo.startsWith('/blog/') && slugsDe(alvo));
      expect(existe, `${a.slug}: ${b.href}`).toBeTruthy();
    }
    /* Um texto com `destino` não tem endereço no blog (31/10/2026): o link vai à página. */
    function slugsDe(h: string) { return blog.artigos.some(a => `/blog/${a.slug}` === h && !(a as { destino?: string }).destino); }
  });

  it('só o aprovado sai do exportador, e o rodapé só linka com artigo no ar', () => {
    const exp = readFileSync(new URL('../../tools/export-content.mjs', import.meta.url), 'utf8');
    expect(exp).toMatch(/blog\.artigos\.filter\(a => a\.revisado \|\| rascunhos\)/);
    const rodape = readFileSync(new URL('../src/components/shell/PublicShell.tsx', import.meta.url), 'utf8');
    expect(rodape).toMatch(/blogResumo\.artigos > 0 \?/);
  });
});

/* 31/10/2026, plano de SEO aprovado pelo dono: o texto do alfabeto não vira
   artigo (disputaria a busca com /alfabeto-hebraico), vira seção da página,
   com a mesma trava de revisão. */
describe('textos com destino', () => {
  const comDestino = blog.artigos.filter(a => (a as { destino?: string }).destino);
  it('só vão para páginas que existem, sem chamada nem link para a própria página', () => {
    expect(comDestino.map(a => (a as { destino?: string }).destino)).toEqual(['/alfabeto-hebraico']);
    for (const a of comDestino) {
      expect(typeof a.revisado, a.slug).toBe('boolean');
      for (const b of a.blocos) {
        expect(b.t, a.slug).not.toBe('cta');
        if (b.t === 'veja') expect(b.href!.replace(/\/$/, ''), a.slug).not.toBe((a as { destino?: string }).destino);
      }
    }
  });
  it('a página só mostra a seção aprovada, e o blog não lista o texto', () => {
    const src = readFileSync(new URL('../../tools/export-content.mjs', import.meta.url), 'utf8');
    expect(src).toMatch(/const artigos = aprovados\.filter\(a => !a\.destino\)/);
    expect(src).toMatch(/const paginas = aprovados\.filter\(a => a\.destino\)/);
  });
});

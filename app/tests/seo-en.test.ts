/* O site em inglês para buscador e rede social (PLANO-INGLES.md, etapa 7).
 * ─────────────────────────────────────────────────────────────────────────
 * A build em inglês tem endereço próprio (nunca o domínio brasileiro), um
 * cartão do link em inglês, o catálogo com os textos do curso em inglês e
 * sem os cursos que só existem em português. A suíte roda a build em
 * português; o que se confere aqui é a fonte de cada uma dessas peças. */

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const ler = (p: string) => readFileSync(new URL(p, import.meta.url), 'utf8');

function tamanho(caminho: string) {
  const b = readFileSync(new URL(caminho, import.meta.url));
  for (let i = 2; i < b.length;) {
    const m = b[i + 1]!, n = b.readUInt16BE(i + 2);
    if (m >= 0xc0 && m <= 0xc3) return { w: b.readUInt16BE(i + 7), h: b.readUInt16BE(i + 5), kb: b.length / 1024 };
    i += 2 + n;
  }
  return null;
}

describe('o site em inglês para buscador e rede social', () => {
  it('o cartão do link em inglês existe, em 1200x630 e leve, e é o de toda rota da build em inglês', () => {
    const t = tamanho('../public/media/og-curso-en.jpg')!;
    expect({ w: t.w, h: t.h }).toEqual({ w: 1200, h: 630 });
    expect(t.kb).toBeLessThan(300);
    expect(ler('../src/lib/seo.ts')).toMatch(/LOCALE === 'en'\) return \{ src: '\/media\/og-curso-en\.jpg'/);
    expect(ler('../src/lib/seo.ts')).toContain('locale: OG_LOCALE');
  });

  it('a build em inglês tira o endereço do wrangler.toml, nunca do domínio brasileiro', () => {
    const cfg = ler('../next.config.ts');
    expect(cfg).toContain('NEXT_PUBLIC_SITE_ORIGIN: ORIGEM_EN');
    expect(cfg).toMatch(/SITE_ORIGIN\\s\*=/);
  });

  it('sitemap, robots e llms.txt saem do out-en, sem o que o Worker em inglês não serve', () => {
    const s = ler('../seo.mjs');
    expect(s).toContain("EM_INGLES ? 'out-en' : 'out'");
    expect(s).toContain('FORA_DO_SITE_EN.test');
    expect(ler('../checa-seo.mjs')).toContain("'out-en' : 'out'");
  });

  it('o curso à venda no site em inglês tem em inglês todo texto que as telas leem do catálogo', () => {
    const curso = JSON.parse(ler('../../data/courses.json')).courses.find((c: { slug: string }) => c.slug === 'alfabetizacao');
    expect(curso.price.usd).toBeGreaterThan(0);
    for (const k of Object.keys(curso).filter(k => k.endsWith('Pt'))) {
      expect(curso, `${k} sem a versão ${k.slice(0, -2)}En`).toHaveProperty(k.slice(0, -2) + 'En');
      expect(Array.isArray(curso[k])).toBe(Array.isArray(curso[k.slice(0, -2) + 'En']));
    }
  });

  it('o exportador tira do catálogo em inglês os cursos sem preço em dólar', () => {
    const e = ler('../../tools/export-content.mjs');
    expect(e).toMatch(/\.filter\(c => LOCALE !== 'en' \|\| \(c\.tipo && c\.tipo !== 'curso'\) \|\| Number\(c\.price && c\.price\.usd\) > 0\)/);
  });
});

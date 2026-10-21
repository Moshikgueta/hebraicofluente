// Formato de edicao dos textos da biblioteca: texto simples, legivel para quem
// edita, que vira a estrutura de secoes e blocos.
//
//   ## Historia resumida
//   [fato] Herodes ampliou a plataforma... {fonte: Josefo, livro VI}
//   [tradicao] Um midrash diz que...
//
// Cada bloco declara o que e (fato, tradicao, interpretacao, dica): e assim que
// a pagina do destino separa historia documentada de tradicao e de leitura.

import type { ContentBlock, ContentSection } from '../db/schema';
import { slugify } from './agency';

const TAG_TO_KIND: Record<string, ContentBlock['kind']> = {
  fato: 'fact',
  tradicao: 'tradition',
  'tradição': 'tradition',
  interpretacao: 'interpretation',
  'interpretação': 'interpretation',
  dica: 'tip',
};
const KIND_TO_TAG: Record<ContentBlock['kind'], string> = { fact: 'fato', tradition: 'tradição', interpretation: 'interpretação', tip: 'dica' };

export function serializeSections(sections: ContentSection[]): string {
  return sections
    .map((s) => [`## ${s.title}`, ...s.blocks.map((b) => `[${KIND_TO_TAG[b.kind]}] ${b.text}${b.source ? ` {fonte: ${b.source}}` : ''}`)].join('\n\n'))
    .join('\n\n');
}

export type ParseResult = { ok: true; sections: ContentSection[] } | { ok: false; error: string };

export function parseSections(text: string): ParseResult {
  const sections: ContentSection[] = [];
  let current: ContentSection | null = null;
  let block: ContentBlock | null = null;
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!.trim();
    if (!line) {
      block = null;
      continue;
    }
    if (line.startsWith('## ')) {
      const title = line.slice(3).trim();
      if (!title) return { ok: false, error: `Linha ${i + 1}: título de seção vazio.` };
      current = { id: slugify(title) || `secao-${sections.length + 1}`, title, blocks: [] };
      sections.push(current);
      block = null;
      continue;
    }
    const m = /^\[([^\]]+)\]\s*(.*)$/.exec(line);
    if (m) {
      const kind = TAG_TO_KIND[m[1]!.trim().toLowerCase()];
      if (!kind) return { ok: false, error: `Linha ${i + 1}: use [fato], [tradição], [interpretação] ou [dica].` };
      if (!current) return { ok: false, error: `Linha ${i + 1}: comece com um título de seção (## Título).` };
      block = { kind, text: m[2]!.trim() };
      current.blocks.push(block);
    } else if (block) {
      block.text = `${block.text} ${line}`;
    } else {
      return { ok: false, error: `Linha ${i + 1}: cada parágrafo começa com [fato], [tradição], [interpretação] ou [dica].` };
    }
    const src = /\s*\{fonte:\s*([^}]+)\}\s*$/.exec(block.text);
    if (src) {
      block.source = src[1]!.trim();
      block.text = block.text.slice(0, src.index).trim();
    }
  }
  if (!sections.length) return { ok: false, error: 'O texto precisa de pelo menos uma seção.' };
  if (sections.some((s) => !s.blocks.length)) return { ok: false, error: 'Toda seção precisa de ao menos um parágrafo.' };
  if (sections.some((s) => s.blocks.some((b) => !b.text))) return { ok: false, error: 'Há um parágrafo vazio.' };
  return { ok: true, sections };
}

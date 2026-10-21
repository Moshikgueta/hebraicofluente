/* A base editorial estruturada: manuscrito (Markdown) → JSON por capítulo.
   ─────────────────────────────────────────────────────────────────────────
   O manuscrito continua sendo onde se escreve e onde se corrige. Este módulo
   o lê, junto com os registros de afirmação e de fonte, e devolve um objeto
   com tudo o que os dois produtos precisam: seções com id estável, blocos
   tipados (parágrafo, foto, mapa, vocabulário, quiz...), as fontes de cada
   seção já resolvidas, o áudio de cada palavra (gravação humana do curso,
   quando existe), a data da última consulta e o status de verificação.

   O PDF (tools/revista.mjs) e a experiência web (tools/web.mjs) leem SÓ este
   objeto. Corrigir uma frase no manuscrito corrige os dois na próxima
   geração; não existe uma segunda cópia do texto em lugar nenhum.

   Uso como biblioteca:
     import { compilarCapitulo } from './lib/conteudo.mjs';
     const cap = compilarCapitulo(RAIZ_DO_LIVRO, '01-israel-no-mapa.md'); */

import fs from 'node:fs';
import path from 'node:path';
import { marked } from 'marked';

const REPO = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../../..');
const lerJSON = p => JSON.parse(fs.readFileSync(p, 'utf8'));
const existe = p => fs.existsSync(p);

/* O id do áudio é o mesmo do curso (hash do hebraico com nikud): uma palavra
   gravada para o curso toca no livro sem gravação nova. */
let audioIdFor = null;
try { ({ audioIdFor } = await import(path.join(REPO, 'tools/audio-id.mjs'))); } catch { /* sem o curso: sem áudio */ }

export const PUBLICAVEL = new Set(['VERIFICADO', 'CONTESTADO']);
export const RUBRICAS = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ', 'ק', 'ר', 'ש', 'ת'];

export const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const slug = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/<[^>]+>/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const he = html => html.replace(/<he>/g, '<span class="he" lang="he" dir="rtl">').replace(/<\/he>/g, '</span>');
const inline = s => he(marked.parseInline(String(s ?? ''), { async: false }));

export function registros(raiz) {
  const fontes = new Map(), afirmacoes = new Map();
  for (const f of fs.readdirSync(path.join(raiz, 'fontes')).filter(f => f.endsWith('.json'))) for (const x of lerJSON(path.join(raiz, 'fontes', f)).fontes || []) fontes.set(x.id, x);
  for (const f of fs.readdirSync(path.join(raiz, 'afirmacoes')).filter(f => f.endsWith('.json'))) for (const x of lerJSON(path.join(raiz, 'afirmacoes', f)).afirmacoes || []) afirmacoes.set(x.id, x);
  return { fontes, afirmacoes };
}

function frontmatter(texto) {
  const m = texto.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return { meta: {}, corpo: texto };
  const meta = {};
  for (const l of m[1].split('\n')) { const i = l.indexOf(':'); if (i > 0) meta[l.slice(0, i).trim()] = l.slice(i + 1).trim().replace(/^["']|["']$/g, ''); }
  return { meta, corpo: texto.slice(m[0].length) };
}

/* Tira as marcas [[C01-003]] do texto e guarda os ids. */
function marcas(texto, acc) {
  return String(texto ?? '').replace(/\s*\[\[([^\]]+)\]\]/g, (_, l) => { for (const id of l.split(',').map(s => s.trim()).filter(Boolean)) acc.add(id); return ''; });
}

function audioDe(heb) {
  if (!audioIdFor) return null;
  const limpo = String(heb).replace(/<\/?he>/g, '').trim();
  const id = audioIdFor(limpo);
  const arquivo = path.join(REPO, 'audio', id + '.mp3');
  return { id, gravado: existe(arquivo), arquivo: existe(arquivo) ? arquivo : null };
}

/* ── blocos de texto comum ─────────────────────────────────────────── */
function blocosDeTexto(trecho, acc) {
  const out = [];
  for (const par of trecho.split(/\n\s*\n/).map(s => s.trim()).filter(Boolean)) {
    if (/^###\s+/.test(par)) { out.push({ tipo: 'h3', html: inline(marcas(par.replace(/^###\s+/, ''), acc)) }); continue; }
    if (par.split('\n').every(l => /^\s*[-*]\s+/.test(l))) { out.push({ tipo: 'lista', itens: par.split('\n').map(l => inline(marcas(l.replace(/^\s*[-*]\s+/, ''), acc))) }); continue; }
    if (par.split('\n').every(l => /^>\s?/.test(l))) { out.push({ tipo: 'citacao', html: inline(marcas(par.split('\n').map(l => l.replace(/^>\s?/, '')).join(' '), acc)) }); continue; }
    out.push({ tipo: 'p', html: inline(marcas(par.replace(/\n/g, ' '), acc)) });
  }
  return out;
}

/* ── diretivas ::: ─────────────────────────────────────────────────── */
const CAIXAS = { 'voce-sabia': 'Você sabia?', observar: 'O que observar', 'historia-ou-tradicao': 'História ou tradição?', 'olhar-israelense': 'O olhar de um israelense', 'entenda-melhor': 'Entenda melhor', aviso: 'Atenção: informação sujeita a mudança', descoberta: 'Descoberta' };

function diretiva(tipo, args, miolo, acc, ctx) {
  const texto = miolo.join('\n');
  const campos = Object.fromEntries(miolo.map(l => l.match(/^([a-z_]+):\s*(.*)$/)).filter(Boolean).map(m => [m[1], m[2]]));
  const semCampos = miolo.filter(l => !/^[a-z_]+:\s/.test(l)).join('\n').trim();
  switch (tipo) {
    case 'em-hebraico': {
      const itens = miolo.filter(l => /^\s*-\s+.*\|/.test(l)).map(l => {
        const [h, tr, pt, ...nota] = l.replace(/^\s*-\s+/, '').split('|').map(s => s.trim());
        const local = new Set(); const notaHtml = nota.length ? inline(marcas(nota.join(' | '), local)) : '';
        local.forEach(x => acc.add(x));
        const hebreu = h.replace(/<\/?he>/g, '');
        return { he: hebreu, translit: tr, pt, nota: notaHtml, audio: audioDe(hebreu), afirmacoes: [...local] };
      });
      itens.forEach(i => ctx.vocabulario.push(i));
      return { tipo: 'vocabulario', titulo: args || null, itens };
    }
    case 'figura': return { tipo: 'figura', id: args.trim(), legenda: inline(marcas(texto, acc)) };
    case 'foto': { const [id, ...mods] = args.trim().split(/\s+/); return { tipo: 'foto', id, formato: mods[0] || 'larga', legenda: inline(marcas(texto, acc)) }; }
    case 'visual': { const [id, ...mods] = args.trim().split(/\s+/); return { tipo: 'visual', id, legenda: inline(marcas(texto, acc)), escuro: mods.includes('escuro') }; }
    case 'linha-do-tempo': return { tipo: 'linha-do-tempo', titulo: args || null, itens: miolo.filter(l => l.includes('|')).map(l => { const [d, ...ev] = l.replace(/^\s*-\s*/, '').split('|'); return { data: inline(d.trim()), evento: inline(marcas(ev.join('|').trim(), acc)) }; }) };
    case 'checklist': return { tipo: 'checklist', titulo: args || null, itens: miolo.filter(l => /^\s*-\s+/.test(l)).map(l => inline(marcas(l.replace(/^\s*-\s+/, ''), acc))) };
    case 'diario': return { tipo: 'diario', titulo: args, instrucao: semCampos ? inline(marcas(semCampos, acc)) : '', linhas: Number(campos.linhas || 10) };
    case 'quiz': {
      const opcoes = miolo.filter(l => /^\s*-\s+\[[ x]\]/.test(l)).map(l => {
        const certa = /\[x\]/.test(l); const [t, ...exp] = l.replace(/^\s*-\s+\[[ x]\]\s*/, '').split('|');
        const local = new Set(); const r = { texto: inline(marcas(t.trim(), local)), certa, explicacao: exp.length ? inline(marcas(exp.join('|').trim(), local)) : '' };
        local.forEach(x => acc.add(x)); return r;
      });
      const q = { tipo: 'quiz', id: `${ctx.idCap}-q${++ctx.nQuiz}`, pergunta: inline(marcas(args, acc)), opcoes };
      ctx.atividades.push(q); return q;
    }
    case 'vf': {
      const resposta = /^verdadeir/i.test(campos.resposta || '');
      const q = { tipo: 'vf', id: `${ctx.idCap}-q${++ctx.nQuiz}`, afirmacao: inline(marcas(args, acc)), resposta, explicacao: inline(marcas(semCampos, acc)) };
      ctx.atividades.push(q); return q;
    }
    case 'observacao': {
      const q = { tipo: 'observacao', id: `${ctx.idCap}-o${++ctx.nObs}`, titulo: inline(args), texto: inline(marcas(semCampos, acc)) };
      ctx.atividades.push(q); return q;
    }
    case 'link': {
      const l = ctx.links.find(x => x.id === args.trim());
      return { tipo: 'link', id: args.trim(), link: l || null, texto: inline(marcas(texto, acc)) };
    }
    case 'dado': return { tipo: 'dado', numero: campos.numero || args, rotulo: inline(marcas(campos.rotulo || semCampos, acc)), nota: campos.nota ? inline(campos.nota) : '' };
    default: {
      if (!CAIXAS[tipo]) return { tipo: 'desconhecido', nome: tipo, html: inline(marcas(texto, acc)) };
      const pendente = /\bpendente\b/.test(args) || (tipo === 'olhar-israelense' && !/\baprovado\b/.test(args));
      const titulo = args.replace(/\bpendente\b|\baprovado\b|#[\w-]+/g, '').trim();
      return { tipo: 'caixa', variante: tipo, rotulo: CAIXAS[tipo], titulo: titulo ? inline(titulo) : null, pendente, blocos: blocosDeTexto(texto, acc) };
    }
  }
}

/* ── compilação de um capítulo ─────────────────────────────────────── */
export function compilarCapitulo(raiz, arquivo, regs = registros(raiz)) {
  const { meta, corpo: bruto } = frontmatter(fs.readFileSync(path.join(raiz, 'manuscrito', arquivo), 'utf8'));
  const corpo = bruto.replace(/<!--[\s\S]*?-->/g, '');
  const n = Number(meta.capitulo || 0);
  const idCap = `cap${String(n).padStart(2, '0')}`;
  const linksArq = path.join(raiz, `ativos/dados/links-${idCap.replace('cap', 'cap')}.json`);
  const ctx = { idCap, nQuiz: 0, nObs: 0, vocabulario: [], atividades: [], links: existe(linksArq) ? lerJSON(linksArq).map((l, i) => ({ id: l.id || slug(l.titulo), ...l })) : [] };

  /* Seções: o texto antes do primeiro ## é a entrada do capítulo. */
  const partes = []; let atual = { titulo: null, linhas: [] };
  for (const l of corpo.split('\n')) {
    const h = l.match(/^##\s+(.*)$/);
    if (h) { partes.push(atual); atual = { titulo: h[1].trim(), linhas: [] }; } else atual.linhas.push(l);
  }
  partes.push(atual);

  let nRubrica = 0;
  const secoes = partes.filter(p => p.titulo || p.linhas.join('').trim()).map(p => {
    const acc = new Set(); const blocos = []; const linhas = p.linhas; let buf = [];
    const solta = () => { if (buf.join('').trim()) blocos.push(...blocosDeTexto(buf.join('\n'), acc)); buf = []; };
    for (let i = 0; i < linhas.length; i++) {
      const m = linhas[i].match(/^:::\s*([a-z-]+)\s*(.*)$/);
      if (!m) { buf.push(linhas[i]); continue; }
      solta(); const miolo = []; i++;
      while (i < linhas.length && !/^:::\s*$/.test(linhas[i])) { miolo.push(linhas[i]); i++; }
      blocos.push(diretiva(m[1], m[2], miolo, acc, ctx));
    }
    solta();
    const titulo = p.titulo ? marcas(p.titulo, acc) : null;
    const ids = [...acc];
    const afs = ids.map(id => regs.afirmacoes.get(id)).filter(Boolean);
    const fontesSec = []; const vistos = new Set();
    for (const a of afs) for (const fid of a.fontes || []) { const f = regs.fontes.get(fid); if (f && !vistos.has(fid)) { vistos.add(fid); fontesSec.push({ id: fid, abnt: f.abnt, url: f.url || null, nivel: f.nivel }); } }
    const problemas = ids.filter(id => !PUBLICAVEL.has(regs.afirmacoes.get(id)?.status));
    const datas = afs.map(a => a.data_consulta).filter(Boolean).sort();
    return {
      id: titulo ? `${idCap}-${slug(titulo)}` : `${idCap}-entrada`,
      rubrica: titulo ? RUBRICAS[nRubrica++ % RUBRICAS.length] : null,
      titulo: titulo ? inline(titulo) : null,
      blocos, afirmacoes: ids, fontes: fontesSec,
      verificacao: { status: problemas.length ? 'pendente' : afs.some(a => a.status === 'CONTESTADO') ? 'contestado' : 'verificado', problemas, total: ids.length },
      revisado_em: datas[datas.length - 1] || null,
    };
  });

  const todas = secoes.flatMap(s => s.afirmacoes);
  const datas = secoes.map(s => s.revisado_em).filter(Boolean).sort();
  return {
    id: idCap, numero: n, titulo: meta.titulo, subtitulo: meta.subtitulo || null,
    abertura: { imagem: meta.abertura_imagem || null, frase: meta.abertura_frase ? inline(meta.abertura_frase) : null, credito: meta.abertura_credito || null },
    secoes, vocabulario: ctx.vocabulario, atividades: ctx.atividades, links: ctx.links,
    revisado_em: datas[datas.length - 1] || null,
    verificacao: { afirmacoes: todas.length, pendentes: secoes.flatMap(s => s.verificacao.problemas) },
  };
}

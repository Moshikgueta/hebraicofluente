/* A jornada de Raízes: os cinco mundos, o índice, as recomendações e o passaporte.
 * ─────────────────────────────────────────────────────────────────────────
 * Pedido do dono (MASTER PROMPT, 22/10/2026). Nada aqui é conteúdo novo: os
 * mundos AGRUPAM os dez módulos que existem (a ordem de desbloqueio não muda),
 * o índice lê o que já está no dado, e os selos contam o que o aluno fez.
 *
 * Regras que valem para tudo daqui:
 *   · recomendação sempre diz POR QUÊ (o interesse escolhido ou o próximo
 *     passo), e nunca tranca nada;
 *   · nenhum selo depende de dado de família: o passaporte fala do que se
 *     estudou e explorou, nunca de quem a pessoa é;
 *   · a busca é local (o conteúdo já está no aparelho de quem tem acesso),
 *     sem serviço externo e sem mandar o que se digitou a lugar nenhum. */

import { marcasDe, modulo, moduloAberto, progressoDoModulo, raizes, type ModuloRaizes } from '@/lib/raizes';
import { LUGARES_COM_PAGINA } from '@/lib/raizes';
import type { EstadoRaizes, Interesse } from '@/lib/state/raizes-estado';

export type Mundo = {
  id: string; n: number; titulo: string; subtitulo: string; modulos: number[];
  /** Portas fora dos módulos (Atlas, árvore...), com o rótulo. */
  portas: { rota: string; rotulo: string }[];
  interesses: Interesse[];
};

export const MUNDOS: Mundo[] = [
  { id: 'sefarad', n: 1, titulo: 'A vida em Sefarad', subtitulo: 'Comunidades, cidades, livros e pessoas da península medieval.',
    modulos: [1], portas: [{ rota: '/raizes/atlas', rotulo: 'As cidades no Atlas' }, { rota: '/raizes/personagens', rotulo: 'Personagens' }],
    interesses: ['historia', 'cultura'] },
  { id: 'ruptura', n: 2, titulo: 'Tempos de ruptura', subtitulo: 'Expulsão, conversões forçadas, Inquisição e cristãos-novos.',
    modulos: [2, 3, 4], portas: [{ rota: '/raizes/lugar/lisboa', rotulo: 'Lisboa, uma cidade por dentro' }],
    interesses: ['historia'] },
  { id: 'diaspora', n: 3, titulo: 'Os caminhos da diáspora', subtitulo: 'Novas comunidades, redes e línguas, do Marrocos a Amsterdã.',
    modulos: [5, 8], portas: [{ rota: '/raizes/atlas?modo=caminhos', rotulo: 'Os Caminhos do Exílio' }],
    interesses: ['diaspora', 'cultura'] },
  { id: 'brasil', n: 4, titulo: 'A herança sefardita no Brasil', subtitulo: 'Cristãos-novos na colônia, o Recife neerlandês e a Inquisição.',
    modulos: [6], portas: [], interesses: ['brasil'] },
  { id: 'minha-historia', n: 5, titulo: 'Minha história, minhas raízes', subtitulo: 'Sobrenomes, arquivos, memória e a sua própria pesquisa.',
    modulos: [7, 9, 10], portas: [{ rota: '/raizes/familia', rotulo: 'A árvore da família' }],
    interesses: ['familia'] }
];

export const NOME_DO_INTERESSE: Record<Interesse, string> = {
  familia: 'Investigar as origens da minha família',
  historia: 'Conhecer a história dos judeus sefarditas',
  cultura: 'Descobrir a cultura e as tradições sefarditas',
  diaspora: 'Explorar os caminhos da diáspora',
  brasil: 'Conhecer a presença sefardita no Brasil'
};

export const mundoDoModulo = (n: number) => MUNDOS.find(m => m.modulos.includes(n));

/** Quanto do mundo o aluno já fez: módulos concluídos e se já pôs o pé lá. */
export function progressoDoMundo(e: EstadoRaizes | undefined, w: Mundo) {
  const mods = w.modulos.map(n => modulo(n)).filter((m): m is ModuloRaizes => !!m);
  const feitos = mods.filter(m => progressoDoModulo(e, m).concluido).length;
  const visitado = mods.some(m => Object.keys(e?.etapas ?? {}).some(k => k.startsWith(`m${String(m.n).padStart(2, '0')}:`)));
  return { feitos, total: mods.length, visitado, concluido: mods.length > 0 && feitos === mods.length };
}

/* ── o índice: tudo o que se pode buscar, guardar e descobrir ───────────── */

export type ItemDoIndice = {
  /** A chave de descoberta e de coleção (`artefato:m01:guia`...). */
  chave: string;
  tipo: 'modulo' | 'secao' | 'lugar' | 'rota' | 'artefato' | 'personagem' | 'termo' | 'curiosidade' | 'fonte';
  titulo: string; resumo: string; rota: string;
  /** Texto para a busca (sem marcas), em minúsculas e sem acento. */
  busca: string;
};

const ROTULO_DO_TIPO: Record<ItemDoIndice['tipo'], string> = {
  modulo: 'Módulo', secao: 'Seção', lugar: 'Lugar', rota: 'Caminho', artefato: 'Artefato', personagem: 'Personagem',
  termo: 'Termo', curiosidade: 'Curiosidade', fonte: 'Fonte'
};
export const rotuloDoTipo = (t: ItemDoIndice['tipo']) => ROTULO_DO_TIPO[t];

export const semMarcas = (t: string) => t.replace(/\[\[[^\]]*\]\]/g, '').replace(/\s+([.,;:!?])/g, '$1').trim();
export const normalizar = (t: string) => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim();
const slug = (t: string) => normalizar(t).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
const mm = (n: number) => `m${String(n).padStart(2, '0')}`;

let INDICE: ItemDoIndice[] | null = null;

export function indice(): ItemDoIndice[] {
  if (INDICE) return INDICE;
  const r = raizes();
  const itens: ItemDoIndice[] = [];
  const add = (i: Omit<ItemDoIndice, 'busca'>, extra = '') =>
    itens.push({ ...i, resumo: semMarcas(i.resumo), busca: normalizar(`${i.titulo} ${semMarcas(i.resumo)} ${semMarcas(extra)}`) });
  for (const m of r.conteudo) {
    add({ chave: `modulo:${m.n}`, tipo: 'modulo', titulo: `Módulo ${m.n}: ${m.titulo}`, resumo: `${m.periodo} · ${m.regiao}`, rota: `/raizes/modulo/${m.n}` });
    for (const e of m.etapas) {
      const texto = e.blocos.flatMap(b => ('paragrafos' in b ? b.paragrafos : [])).join(' ');
      add({ chave: `secao:${mm(m.n)}:${e.id}`, tipo: 'secao', titulo: e.pergunta, resumo: `Módulo ${m.n} · ${e.titulo}`, rota: `/raizes/modulo/${m.n}?etapa=${e.id}` }, texto);
      for (const b of e.blocos) {
        if (b.tipo === 'artefatos') for (const a of b.itens) {
          add({ chave: `artefato:${mm(m.n)}:${a.id}`, tipo: 'artefato', titulo: a.nome, resumo: a.resumo, rota: `/raizes/modulo/${m.n}?etapa=${e.id}` }, a.texto);
        }
        if (b.tipo === 'curiosidades') b.itens.forEach(c => {
          add({ chave: `curiosidade:${mm(m.n)}:${slug(c.titulo)}`, tipo: 'curiosidade', titulo: c.titulo, resumo: c.texto, rota: `/raizes/modulo/${m.n}?etapa=${e.id}` });
        });
        if (b.tipo === 'glossario') for (const t of b.termos) {
          add({ chave: `termo:${slug(t.termo)}`, tipo: 'termo', titulo: t.termo, resumo: t.definicao, rota: `/raizes/glossario#${slug(t.termo)}` });
        }
      }
    }
  }
  for (const l of r.atlas?.lugares ?? []) {
    if (l.area) continue;
    const pagina = l.pagina && LUGARES_COM_PAGINA.includes(l.pagina);
    add({ chave: `lugar:${l.id}`, tipo: 'lugar', titulo: l.nome, resumo: l.resumo, rota: pagina ? `/raizes/lugar/${l.pagina}` : `/raizes/atlas?lugar=${l.id}` });
  }
  for (const rt of r.atlas?.rotas ?? []) {
    add({ chave: `rota:${rt.id}`, tipo: 'rota', titulo: rt.titulo, resumo: rt.resumo, rota: `/raizes/atlas?modo=caminhos&rota=${rt.id}` });
  }
  for (const p of r.personagens ?? []) {
    add({ chave: `personagem:${p.id}`, tipo: 'personagem', titulo: p.nome, resumo: p.resumo, rota: `/raizes/personagens#${p.id}` }, p.paragrafos.join(' '));
  }
  for (const f of r.fontes) {
    add({ chave: `fonte:${f.id.toLowerCase()}`, tipo: 'fonte', titulo: f.titulo, resumo: `${f.autor}${f.ano ? `, ${f.ano}` : ''}`, rota: `/raizes/biblioteca#${f.id}` });
  }
  /* Um termo aparece em mais de um módulo: fica o primeiro. */
  const vistos = new Set<string>();
  INDICE = itens.filter(i => (vistos.has(i.chave) ? false : (vistos.add(i.chave), true)));
  return INDICE;
}

/** Busca: todas as palavras precisam aparecer; título vale mais que texto. */
export function buscar(consulta: string, limite = 40): ItemDoIndice[] {
  const termos = normalizar(consulta).split(' ').filter(t => t.length >= 2);
  if (!termos.length) return [];
  return indice()
    .filter(i => termos.every(t => i.busca.includes(t)))
    .map(i => ({ i, peso: termos.filter(t => normalizar(i.titulo).includes(t)).length * 3 + (i.tipo === 'fonte' ? -1 : 0) }))
    .sort((a, b) => b.peso - a.peso)
    .slice(0, limite)
    .map(x => x.i);
}

export const itemPorChave = (chave: string) => indice().find(i => i.chave === chave);

/* ── recomendações: o próximo passo, explicado ─────────────────────────── */

export type Recomendacao = { rota: string; titulo: string; porque: string };

export function recomendar(e: EstadoRaizes | undefined, revisor = false): Recomendacao[] {
  const r = raizes();
  const interesses = e?.perfil?.interesses ?? [];
  const recs: Recomendacao[] = [];
  /* 1. O próximo módulo da jornada que está aberto e não terminou. */
  const proximo = r.conteudo.find(m => moduloAberto(e, m.n, revisor) && !progressoDoModulo(e, m).concluido);
  if (proximo) recs.push({ rota: `/raizes/modulo/${proximo.n}`, titulo: `Módulo ${proximo.n}: ${proximo.titulo}`, porque: 'É o próximo passo da sua jornada.' });
  /* 2. O que combina com cada interesse escolhido (sem repetir). */
  for (const i of interesses) {
    const w = MUNDOS.find(x => x.interesses[0] === i) ?? MUNDOS.find(x => x.interesses.includes(i));
    if (!w) continue;
    const porque = `Porque você escolheu: ${NOME_DO_INTERESSE[i].toLowerCase()}.`;
    const mod = w.modulos.map(n => modulo(n)).find(m => m && !progressoDoModulo(e, m).concluido && moduloAberto(e, m.n, revisor));
    if (mod) recs.push({ rota: `/raizes/modulo/${mod.n}`, titulo: `Módulo ${mod.n}: ${mod.titulo}`, porque });
    for (const p of w.portas) recs.push({ rota: p.rota, titulo: p.rotulo, porque });
    /* Mundo ainda fechado na jornada: uma pessoa dele, que se lê a qualquer momento. */
    const pessoa = (r.personagens ?? []).find(x => x.modulos.some(n => w.modulos.includes(n)));
    if (!mod && pessoa) recs.push({ rota: `/raizes/personagens#${pessoa.id}`, titulo: pessoa.nome, porque });
  }
  /* 3. Sem interesses: as portas da exploração livre. */
  if (!interesses.length) {
    recs.push({ rota: '/raizes/atlas', titulo: 'O Atlas e os Caminhos do Exílio', porque: 'Para ver no mapa o que a jornada conta.' });
    recs.push({ rota: '/raizes/personagens', titulo: 'Personagens históricos', porque: 'Pessoas reais, com fonte em cada frase.' });
  }
  const vistos = new Set<string>();
  return recs.filter(x => (vistos.has(x.rota) ? false : (vistos.add(x.rota), true))).slice(0, 4);
}

/* ── o passaporte: selos do que se estudou e explorou ──────────────────── */

export type Selo = { id: string; titulo: string; criterio: string; tem: boolean; progresso: string };

const conta = (e: EstadoRaizes | undefined, prefixo: string) =>
  Object.keys(e?.descobertas ?? {}).filter(k => k.startsWith(prefixo)).length;

export function selos(e: EstadoRaizes | undefined): Selo[] {
  const r = raizes();
  const lugares = conta(e, 'lugar:'), rotas = conta(e, 'rota:'), docs = conta(e, 'artefato:') + conta(e, 'documento:'), gente = conta(e, 'personagem:');
  const totalLugares = (r.atlas?.lugares ?? []).filter(l => !l.area).length;
  const totalRotas = r.atlas?.rotas.length ?? 0;
  const totalPersonagens = r.personagens?.length ?? 0;
  const s = (id: string, titulo: string, criterio: string, feito: number, meta: number, total?: number): Selo =>
    ({ id, titulo, criterio, tem: feito >= meta, progresso: `${Math.min(feito, total ?? meta)} de ${meta}` });
  const lista: Selo[] = [
    s('cartografo', 'Cartógrafo de Sefarad', `Abrir ${Math.min(8, totalLugares)} lugares no Atlas.`, lugares, Math.min(8, totalLugares)),
    s('viajante', 'Viajante da Diáspora', `Abrir ${Math.min(5, totalRotas)} Caminhos do Exílio.`, rotas, Math.min(5, totalRotas)),
    s('arquivos', 'Investigador de Arquivos', 'Examinar 10 artefatos e documentos.', docs, 10),
    s('personagens', 'Leitor de vidas', `Conhecer ${Math.min(6, totalPersonagens)} personagens históricos.`, gente, Math.min(6, totalPersonagens))
  ];
  for (const w of MUNDOS) {
    const pw = progressoDoMundo(e, w);
    lista.push({ id: `mundo-${w.id}`, titulo: `Mundo ${w.n}: ${w.titulo}`, criterio: `Concluir ${pw.total === 1 ? 'o módulo' : `os ${pw.total} módulos`} deste mundo.`,
      tem: pw.concluido, progresso: `${pw.feitos} de ${pw.total}` });
  }
  return lista;
}

/** As descobertas mais recentes, com o nome de cada uma. */
export function descobertasRecentes(e: EstadoRaizes | undefined, n = 4) {
  return Object.entries(e?.descobertas ?? {})
    .sort((a, b) => (a[1] < b[1] ? 1 : -1))
    .map(([chave, em]) => ({ item: itemPorChave(chave), em }))
    .filter((x): x is { item: ItemDoIndice; em: string } => !!x.item)
    .slice(0, n);
}

/** O glossário inteiro: os termos de todos os módulos, sem repetir, em ordem alfabética. */
export function glossario() {
  const r = raizes();
  const termos = new Map<string, { termo: string; definicao: string; afirmacoes: string[]; modulos: number[]; id: string }>();
  for (const m of r.conteudo) for (const e of m.etapas) for (const b of e.blocos) {
    if (b.tipo !== 'glossario') continue;
    for (const t of b.termos) {
      const id = slug(t.termo);
      const ja = termos.get(id);
      if (ja) { if (!ja.modulos.includes(m.n)) ja.modulos.push(m.n); continue; }
      termos.set(id, { ...t, id, modulos: [m.n], afirmacoes: [...new Set([...t.afirmacoes, ...marcasDe(t.definicao)])] });
    }
  }
  return [...termos.values()].sort((a, b) => a.termo.localeCompare(b.termo, 'pt'));
}

/** Para os testes: o índice é recalculado quando o conteúdo muda. */
export function _limparIndice() { INDICE = null; }

/** Os lugares do Atlas que o texto do módulo NOMEIA (o nome, sem o parêntese, aparece no texto). */
export function lugaresDoModulo(m: ModuloRaizes) {
  const r = raizes();
  const texto = normalizar(JSON.stringify(m.etapas).replace(/\[\[[^\]]*\]\]/g, ''));
  const escapar = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return (r.atlas?.lugares ?? []).filter(l => {
    if (l.area) return false;
    const nome = normalizar(l.nome.replace(/ \(.*\)$/, ''));
    return new RegExp(`(^|[^a-z0-9])${escapar(nome)}([^a-z0-9]|$)`).test(texto);
  });
}

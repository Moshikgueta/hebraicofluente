/* Minha História, Minhas Raízes: a árvore da família (protótipo, 22/10/2026).
 * ─────────────────────────────────────────────────────────────────────────
 * Fica SÓ no aparelho, como o Laboratório do módulo 9 (decisão do dono): sem
 * servidor, sem progresso, sem certificado. Guardar na conta pede tabela
 * própria, dados cifrados e uma linha nova na Política de Privacidade.
 *
 * As regras que este arquivo segura:
 *   · todo dado tem um tipo de evidência (os mesmos quatro do Laboratório);
 *   · nenhuma conclusão automática: nada aqui infere religião, origem ou
 *     ascendência, e o resumo só conta;
 *   · pessoa viva sai das exportações só com o primeiro nome e sem datas nem
 *     lugares, a não ser que o dono da árvore peça o contrário;
 *   · um trajeto entre dois lugares só é desenhado quando a mudança está
 *     DOCUMENTADA (`trechosDocumentados`); o resto são pontos, sem linha. */

import { EVIDENCIAS, type Evidencia } from '@/lib/raizes-laboratorio';

export const CHAVE_FAMILIA = 'hf-raizes-familia-v1';
export { EVIDENCIAS, type Evidencia };

export type TipoDeEvento = 'nascimento' | 'casamento' | 'residencia' | 'migracao' | 'morte';
export const TIPOS_DE_EVENTO: { id: TipoDeEvento; nome: string }[] = [
  { id: 'nascimento', nome: 'Nascimento' }, { id: 'casamento', nome: 'Casamento' },
  { id: 'residencia', nome: 'Residência' }, { id: 'migracao', nome: 'Mudança' }, { id: 'morte', nome: 'Morte' }
];

export type Evento = {
  id: string; tipo: TipoDeEvento;
  /** Texto livre: "1905", "por volta de 1880", "12/03/1931". O ano para ordenar sai de `anoDe`. */
  data: string;
  /** Um lugar do gazetteer (com coordenadas) ou só o nome digitado. */
  lugar: string; lugarId?: string;
  evidencia: Evidencia; fonte: string;
};

export type Pessoa = {
  id: string; nome: string; nomesAlternativos: string;
  viva: boolean; evidencia: Evidencia;
  /** Até dois pais, pelos ids. */
  pais: string[];
  eventos: Evento[]; fontes: string; notas: string;
};

/** Uma pesquisa de sobrenome feita num arquivo: onde, quando e o que achou (ou não). */
export type Pesquisa = { id: string; sobrenome: string; variantes: string; arquivo: string; resultado: string; em: string };

export type Arvore = { pessoas: Pessoa[]; centro: string | null; pesquisas: Pesquisa[]; exemplo?: boolean };

export const ARVORE_VAZIA: Arvore = { pessoas: [], centro: null, pesquisas: [] };
export const LIMITES = { pessoas: 300, eventos: 30, campo: 160, texto: 2000 } as const;

/* ── os lugares que o mapa sabe desenhar ───────────────────────────────── */
/* Coordenadas das cidades de hoje. Lugar fora da lista fica só com o nome:
   aparece na ficha, não no mapa (nenhum serviço de geocodificação de fora). */
export const GAZETTEER: { id: string; nome: string; lat: number; lon: number }[] = [
  { id: 'lisboa', nome: 'Lisboa', lat: 38.7223, lon: -9.1393 },
  { id: 'porto', nome: 'Porto', lat: 41.1579, lon: -8.6291 },
  { id: 'braganca', nome: 'Bragança', lat: 41.8061, lon: -6.7567 },
  { id: 'coimbra', nome: 'Coimbra', lat: 40.2033, lon: -8.4103 },
  { id: 'evora', nome: 'Évora', lat: 38.5714, lon: -7.9135 },
  { id: 'belmonte', nome: 'Belmonte', lat: 40.3586, lon: -7.3506 },
  { id: 'madri', nome: 'Madri', lat: 40.4168, lon: -3.7038 },
  { id: 'sevilha', nome: 'Sevilha', lat: 37.3891, lon: -5.9845 },
  { id: 'toledo', nome: 'Toledo', lat: 39.8628, lon: -4.0273 },
  { id: 'amsterda', nome: 'Amsterdã', lat: 52.3676, lon: 4.9041 },
  { id: 'istambul', nome: 'Istambul', lat: 41.0082, lon: 28.9784 },
  { id: 'salonica', nome: 'Salonica', lat: 40.6401, lon: 22.9444 },
  { id: 'tetuao', nome: 'Tetuão', lat: 35.5785, lon: -5.3684 },
  { id: 'recife', nome: 'Recife', lat: -8.0476, lon: -34.877 },
  { id: 'salvador', nome: 'Salvador', lat: -12.9777, lon: -38.5016 },
  { id: 'rio', nome: 'Rio de Janeiro', lat: -22.9068, lon: -43.1729 },
  { id: 'sao-paulo', nome: 'São Paulo', lat: -23.5505, lon: -46.6333 },
  { id: 'belo-horizonte', nome: 'Belo Horizonte', lat: -19.9167, lon: -43.9345 },
  { id: 'belem', nome: 'Belém', lat: -1.4558, lon: -48.4902 },
  { id: 'fortaleza', nome: 'Fortaleza', lat: -3.7319, lon: -38.5267 },
  { id: 'manaus', nome: 'Manaus', lat: -3.119, lon: -60.0217 },
  { id: 'nova-york', nome: 'Nova York', lat: 40.7128, lon: -74.006 }
];
export const lugarDoGazetteer = (id?: string) => GAZETTEER.find(g => g.id === id);

/* ── limpeza ───────────────────────────────────────────────────────────── */

const EVS = new Set(EVIDENCIAS.map(e => e.id));
const TEVS = new Set(TIPOS_DE_EVENTO.map(t => t.id));
const txt = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const ev = (v: unknown): Evidencia => (EVS.has(v as Evidencia) ? (v as Evidencia) : 'nao-verificado');

/** Limpa o que veio do aparelho ou de um arquivo importado. Ligação para pessoa que não existe some. */
export function normalizar(bruto: unknown): Arvore {
  if (!bruto || typeof bruto !== 'object') return { ...ARVORE_VAZIA };
  const b = bruto as { pessoas?: unknown; centro?: unknown; exemplo?: unknown };
  const pessoas: Pessoa[] = [];
  for (const p of Array.isArray(b.pessoas) ? b.pessoas : []) {
    if (!p || typeof p !== 'object') continue;
    const x = p as Record<string, unknown>;
    const nome = txt(x.nome, LIMITES.campo);
    if (!nome || typeof x.id !== 'string' || !x.id) continue;
    const eventos: Evento[] = [];
    for (const e of Array.isArray(x.eventos) ? x.eventos : []) {
      if (!e || typeof e !== 'object') continue;
      const y = e as Record<string, unknown>;
      if (typeof y.id !== 'string' || !TEVS.has(y.tipo as TipoDeEvento)) continue;
      const lugarId = typeof y.lugarId === 'string' && lugarDoGazetteer(y.lugarId) ? y.lugarId : undefined;
      eventos.push({
        id: y.id.slice(0, 40), tipo: y.tipo as TipoDeEvento, data: txt(y.data, 40),
        lugar: txt(y.lugar, LIMITES.campo) || (lugarId ? lugarDoGazetteer(lugarId)!.nome : ''),
        ...(lugarId ? { lugarId } : {}), evidencia: ev(y.evidencia), fonte: txt(y.fonte, LIMITES.texto)
      });
      if (eventos.length >= LIMITES.eventos) break;
    }
    pessoas.push({
      id: x.id.slice(0, 40), nome, nomesAlternativos: txt(x.nomesAlternativos, LIMITES.campo),
      viva: x.viva === true, evidencia: ev(x.evidencia),
      pais: (Array.isArray(x.pais) ? x.pais : []).filter((v): v is string => typeof v === 'string').slice(0, 2),
      eventos, fontes: txt(x.fontes, LIMITES.texto), notas: txt(x.notas, LIMITES.texto)
    });
    if (pessoas.length >= LIMITES.pessoas) break;
  }
  const ids = new Set(pessoas.map(p => p.id));
  for (const p of pessoas) p.pais = [...new Set(p.pais.filter(id => ids.has(id) && id !== p.id))];
  semCiclos(pessoas);
  const centro = typeof b.centro === 'string' && ids.has(b.centro) ? b.centro : (pessoas[0]?.id ?? null);
  const pesquisas: Pesquisa[] = [];
  for (const q of Array.isArray((b as { pesquisas?: unknown }).pesquisas) ? (b as { pesquisas: unknown[] }).pesquisas : []) {
    if (!q || typeof q !== 'object') continue;
    const y = q as Record<string, unknown>;
    const sobrenome = txt(y.sobrenome, LIMITES.campo);
    if (!sobrenome || typeof y.id !== 'string') continue;
    pesquisas.push({ id: y.id.slice(0, 40), sobrenome, variantes: txt(y.variantes, LIMITES.campo), arquivo: txt(y.arquivo, LIMITES.campo), resultado: txt(y.resultado, LIMITES.texto), em: txt(y.em, 30) });
    if (pesquisas.length >= LIMITES.pessoas) break;
  }
  return { pessoas, centro, pesquisas, ...(b.exemplo === true ? { exemplo: true } : {}) };
}

/** Ninguém é antepassado de si mesmo: uma ligação que fecharia um ciclo é desfeita. */
function semCiclos(pessoas: Pessoa[]) {
  const porId = new Map(pessoas.map(p => [p.id, p]));
  const sobe = (id: string, alvo: string, vistos = new Set<string>()): boolean => {
    if (id === alvo) return true;
    if (vistos.has(id)) return false;
    vistos.add(id);
    return (porId.get(id)?.pais ?? []).some(pid => sobe(pid, alvo, vistos));
  };
  for (const p of pessoas) p.pais = p.pais.filter(pid => !sobe(pid, p.id));
}

/* ── operações ─────────────────────────────────────────────────────────── */

/** Acrescenta uma pessoa; com `paiOuMaeDe`, ela entra como pai ou mãe dessa pessoa (até dois). */
export function adicionarPessoa(a: Arvore, p: Omit<Pessoa, 'id'>, id: string, paiOuMaeDe?: string): Arvore {
  if (a.pessoas.length >= LIMITES.pessoas || !p.nome.trim()) return a;
  let pessoas = [...a.pessoas, { ...p, id }];
  if (paiOuMaeDe) {
    pessoas = pessoas.map(x => (x.id === paiOuMaeDe && x.pais.length < 2 ? { ...x, pais: [...x.pais, id] } : x));
  }
  return normalizar({ ...a, pessoas, centro: a.centro ?? id });
}

export function atualizarPessoa(a: Arvore, id: string, mudar: Partial<Omit<Pessoa, 'id'>>): Arvore {
  return normalizar({ ...a, pessoas: a.pessoas.map(p => (p.id === id ? { ...p, ...mudar } : p)) });
}

export function registrarPesquisa(a: Arvore, q: Omit<Pesquisa, 'id'>, id: string): Arvore {
  return normalizar({ ...a, pesquisas: [{ ...q, id }, ...a.pesquisas] });
}
export const removerPesquisa = (a: Arvore, id: string): Arvore => ({ ...a, pesquisas: a.pesquisas.filter(q => q.id !== id) });

export function removerPessoa(a: Arvore, id: string): Arvore {
  return normalizar({ ...a, pessoas: a.pessoas.filter(p => p.id !== id), centro: a.centro === id ? null : a.centro });
}

/** A ascendência a partir de uma pessoa: cada geração numa linha (0 = a pessoa). */
export function geracoes(a: Arvore, centro: string | null): Pessoa[][] {
  const porId = new Map(a.pessoas.map(p => [p.id, p]));
  const linhas: Pessoa[][] = [];
  let atual = centro && porId.has(centro) ? [porId.get(centro)!] : [];
  const vistos = new Set<string>();
  while (atual.length && linhas.length < 12) {
    atual.forEach(p => vistos.add(p.id));
    linhas.push(atual);
    atual = atual.flatMap(p => p.pais).filter(id => !vistos.has(id)).map(id => porId.get(id)!).filter(Boolean);
  }
  return linhas;
}

/** O ano de uma data em texto livre ("por volta de 1880" → 1880), ou null. */
export const anoDe = (data: string): number | null => {
  const m = data.match(/\b(1[0-9]{3}|20[0-9]{2})\b/);
  return m ? Number(m[1]) : null;
};

/** Os eventos com lugar no mapa, em ordem de ano (sem ano vão ao fim). */
export function eventosNoMapa(a: Arvore, pessoaId?: string | null) {
  return a.pessoas
    .filter(p => !pessoaId || p.id === pessoaId)
    .flatMap(p => p.eventos.filter(e => lugarDoGazetteer(e.lugarId)).map(e => ({ pessoa: p, evento: e, lugar: lugarDoGazetteer(e.lugarId)!, ano: anoDe(e.data) })))
    .sort((x, y) => (x.ano ?? 9999) - (y.ano ?? 9999));
}

/**
 * Os trechos que podem virar linha no mapa: de um lugar ao seguinte da MESMA
 * pessoa, só quando o evento de chegada é uma mudança DOCUMENTADA. Sem
 * documento do deslocamento, ficam só os pontos.
 */
export function trechosDocumentados(a: Arvore) {
  const trechos: { pessoa: Pessoa; de: (typeof GAZETTEER)[number]; para: (typeof GAZETTEER)[number] }[] = [];
  for (const p of a.pessoas) {
    const evs = eventosNoMapa({ ...a, pessoas: [p] });
    for (let i = 1; i < evs.length; i++) {
      const e = evs[i]!;
      if (e.evento.tipo === 'migracao' && e.evento.evidencia === 'documentado' && evs[i - 1]!.lugar.id !== e.lugar.id) {
        trechos.push({ pessoa: p, de: evs[i - 1]!.lugar, para: e.lugar });
      }
    }
  }
  return trechos;
}

/** Quantas pessoas há de cada tipo de evidência. Só contagem, nunca estimativa. */
export const resumo = (a: Arvore) => EVIDENCIAS.map(e => ({ ...e, n: a.pessoas.filter(p => p.evidencia === e.id).length }));

/* ── exportar ──────────────────────────────────────────────────────────── */

/** A pessoa viva, para sair do aparelho: só o primeiro nome, sem datas, lugares nem notas. */
const protegida = (p: Pessoa): Pessoa => ({
  ...p, nome: `${p.nome.split(/\s+/)[0]} (pessoa viva)`, nomesAlternativos: '', eventos: [], fontes: '', notas: ''
});

export function exportarJson(a: Arvore, agora: string, incluirVivos = false): string {
  return JSON.stringify({
    produto: 'Raízes Sefarditas - Minha História, Minhas Raízes',
    exportadoEm: agora,
    aviso: 'Árvore pessoal, guardada só no seu aparelho. Conhecer a história sefardita não é comprovar uma ascendência sefardita.',
    ...a,
    pessoas: a.pessoas.map(p => (p.viva && !incluirVivos ? protegida(p) : p))
  }, null, 2);
}

/** GEDCOM 5.5.1, o formato que outros programas de genealogia leem. */
export function exportarGedcom(a: Arvore, incluirVivos = false): string {
  const ps = a.pessoas.map(p => (p.viva && !incluirVivos ? protegida(p) : p));
  const ref = new Map(ps.map((p, i) => [p.id, `@I${i + 1}@`]));
  const linhas = ['0 HEAD', '1 SOUR RAIZES-SEFARDITAS', '1 GEDC', '2 VERS 5.5.1', '2 FORM LINEAGE-LINKED', '1 CHAR UTF-8'];
  /* Uma família por par de pais (ou pai/mãe só), com os filhos dela. */
  const familias = new Map<string, { pais: string[]; filhos: string[] }>();
  for (const p of ps) {
    if (!p.pais.length) continue;
    const chave = [...p.pais].sort().join('+');
    if (!familias.has(chave)) familias.set(chave, { pais: [...p.pais].sort(), filhos: [] });
    familias.get(chave)!.filhos.push(p.id);
  }
  const famRef = new Map([...familias.keys()].map((k, i) => [k, `@F${i + 1}@`]));
  const limpa = (s: string) => s.replace(/[\r\n]+/g, ' ').replace(/@/g, '@@');
  const TAG: Record<TipoDeEvento, string> = { nascimento: 'BIRT', casamento: 'MARR', residencia: 'RESI', migracao: 'IMMI', morte: 'DEAT' };
  for (const p of ps) {
    linhas.push(`0 ${ref.get(p.id)} INDI`, `1 NAME ${limpa(p.nome)}`);
    if (p.nomesAlternativos) linhas.push(`2 NOTE Outros nomes: ${limpa(p.nomesAlternativos)}`);
    for (const e of p.eventos) {
      linhas.push(`1 ${TAG[e.tipo]}`);
      if (e.data) linhas.push(`2 DATE ${limpa(e.data)}`);
      if (e.lugar) linhas.push(`2 PLAC ${limpa(e.lugar)}`);
      linhas.push(`2 NOTE Evidência: ${EVIDENCIAS.find(x => x.id === e.evidencia)!.nome}${e.fonte ? `. Fonte: ${limpa(e.fonte)}` : ''}`);
    }
    linhas.push(`1 NOTE Evidência: ${EVIDENCIAS.find(x => x.id === p.evidencia)!.nome}${p.notas ? `. ${limpa(p.notas)}` : ''}`);
    for (const [k, f] of familias) {
      if (f.filhos.includes(p.id)) linhas.push(`1 FAMC ${famRef.get(k)}`);
      if (f.pais.includes(p.id)) linhas.push(`1 FAMS ${famRef.get(k)}`);
    }
  }
  for (const [k, f] of familias) {
    linhas.push(`0 ${famRef.get(k)} FAM`);
    f.pais.forEach((pid, i) => linhas.push(`1 ${i === 0 ? 'HUSB' : 'WIFE'} ${ref.get(pid)}`));
    f.filhos.forEach(fid => linhas.push(`1 CHIL ${ref.get(fid)}`));
  }
  linhas.push('0 TRLR');
  return linhas.join('\n') + '\n';
}

/* ── o exemplo fictício ────────────────────────────────────────────────── */
/* Todas as pessoas, datas e documentos abaixo são INVENTADOS, para mostrar
   como a árvore funciona. Os sobrenomes são de propósito sem relação com
   listas de "sobrenomes sefarditas": o exemplo não ensina a adivinhar. */

const evento = (id: string, tipo: TipoDeEvento, data: string, lugarId: string | undefined, lugar: string, evidencia: Evidencia, fonte = ''): Evento =>
  ({ id, tipo, data, lugar: lugar || lugarDoGazetteer(lugarId)?.nome || '', ...(lugarId ? { lugarId } : {}), evidencia, fonte });

export function arvoreDeExemplo(): Arvore {
  const p = (id: string, nome: string, pais: string[], evidencia: Evidencia, eventos: Evento[], extra: Partial<Pessoa> = {}): Pessoa =>
    ({ id, nome, nomesAlternativos: '', viva: false, evidencia, pais, eventos, fontes: '', notas: '', ...extra });
  return {
    exemplo: true,
    centro: 'voce',
    pesquisas: [{ id: 'q1', sobrenome: 'Antunes', variantes: 'Antunez', arquivo: 'Arquivo Distrital de Bragança, registros paroquiais', resultado: 'Achado o batismo de Manuel em 1898. Nenhuma ligação com cristãos-novos nos registros vistos (exemplo fictício).', em: '2026-10-22' }],
    pessoas: [
      p('voce', 'Você (exemplo)', ['mae', 'pai'], 'documentado', [evento('e1', 'nascimento', '1990', 'sao-paulo', '', 'documentado', 'Certidão de nascimento (exemplo fictício)')], { viva: true }),
      p('mae', 'Teresa Lima Prado', ['avo-m', 'avo-f'], 'documentado', [evento('e2', 'nascimento', '1962', 'belo-horizonte', '', 'documentado', 'Certidão de casamento dos pais (exemplo fictício)')], { viva: true }),
      p('pai', 'Rui Antunes Prado', ['bisavo', 'bisavo-f'], 'documentado', [evento('e3', 'nascimento', '1960', 'rio', '', 'documentado', 'Certidão (exemplo fictício)')], { viva: true }),
      p('avo-m', 'Joaquim Lima', [], 'oral', [evento('e4', 'nascimento', 'por volta de 1930', 'fortaleza', '', 'oral', 'Contado pela tia Lúcia em 2024 (exemplo fictício)')]),
      p('avo-f', 'Celeste Duarte', [], 'nao-verificado', [evento('e5', 'nascimento', '1935', undefined, 'Algum lugar do Ceará', 'nao-verificado')]),
      p('bisavo', 'Manuel Antunes', [], 'documentado', [
        evento('e6', 'nascimento', '1898', 'braganca', '', 'documentado', 'Assento de batismo, livro 12, folha 40 (exemplo fictício)'),
        evento('e7', 'casamento', '1922', 'porto', '', 'documentado', 'Assento de casamento (exemplo fictício)'),
        evento('e8', 'migracao', '1926', 'rio', '', 'documentado', 'Registro de entrada no porto do Rio de Janeiro (exemplo fictício)')
      ], { notas: 'A família conta que o sobrenome "seria de cristãos-novos": é uma hipótese, e um sobrenome não prova isso.' }),
      p('bisavo-f', 'Rosa Fernandes', [], 'hipotese', [
        evento('e9', 'nascimento', '1901', 'porto', '', 'hipotese', 'Deduzido da idade no assento de casamento (exemplo fictício)'),
        evento('e10', 'migracao', '1926', 'rio', '', 'oral', 'A família conta que veio com o marido (exemplo fictício)')
      ])
    ]
  };
}

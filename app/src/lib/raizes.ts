/* Raízes Sefarditas, do lado do app (21/10/2026).
 * ─────────────────────────────────────────────────────────────────────────
 * O mesmo desenho de lib/a1.ts: o conteúdo não mora no pacote, chega por
 * GET /api/content/raizes (só para quem tem o direito raizes-sefarditas, ver
 * worker/src/api/content-raizes.js) e fica num depósito na memória. Toda tela
 * renderiza dentro do CourseGate, que espera o depósito encher.
 *
 * Na build de demonstração o conteúdo vem do JSON local, por `import()`
 * dentro de um `if` que a build de produção apaga (pacote.mjs confere).
 *
 * Os dados históricos ficam no repositório privado (raizes/data/*.json) e nunca em string de
 * componente: corrigir uma data é editar o dado, não a tela.
 */

import { chaveDaAtividade, moduloConcluido, atividadeConcluida, type EstadoRaizes } from '@/lib/state/raizes-estado';

export const CURSO_RAIZES = 'raizes-sefarditas';

/* Os módulos que têm conteúdo e, portanto, página gerada na build. Escritos
   aqui pelo mesmo motivo de UNIDADES_A1: a página é gerada antes de o
   conteúdo (pago) chegar. tests/raizes.test.ts confere contra raizes/data. */
export const MODULOS_COM_CONTEUDO: readonly number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
export const TOTAL_DE_MODULOS = 10;

export type StatusAfirmacao = 'VERIFICADO' | 'CONTESTADO';

export type Afirmacao = {
  id: string; modulo: number; afirmacao: string; fontes: string[]; evidencia: string;
  limitacoes: string | null; interpretacoes: string | null; status: StatusAfirmacao;
  pagina: string | null; acesso: string; consulta: string;
};

export type Fonte = {
  id: string; nivel: 'A' | 'B' | 'C' | 'D' | 'E'; tipo: string; autor: string; titulo: string;
  ano: number | null; publicacao: string | null; url: string | null; acesso: string; consulta: string; abnt: string;
};

export type Opcao = { texto: string; correta: boolean; feedback: string };

export type Lugar = {
  id: string; nome: string; lat: number; lon: number; periodo: string; resumo: string;
  afirmacoes: string[]; incerto?: boolean;
};

export type Atividade =
  | { tipo: 'escolha'; objetivo: string; enunciado: string; criterio: string; opcoes: Opcao[]; afirmacoes: string[] }
  | { tipo: 'multipla'; objetivo: string; enunciado: string; criterio: string; opcoes: Opcao[]; afirmacoes: string[] }
  | {
      tipo: 'mapa'; objetivo: string; enunciado: string; criterio: string; legenda: string;
      minimoExplorados: number; lugares: Lugar[];
      /** Aproxima o desenho numa região (graus), quando os pontos ficam juntos demais na península inteira. */
      recorte?: { oeste: number; leste: number; sul: number; norte: number };
      /** Outro desenho, de `mapas` (ex.: 'mediterraneo', a diáspora). Sem ele, a península. */
      desenho?: string;
      perguntas: { id: string; enunciado: string; resposta: string; explicacao: string }[];
    }
  | {
      tipo: 'associacao'; objetivo: string; enunciado: string; criterio: string;
      contextos: { id: string; nome: string }[];
      documentos: {
        id: string; titulo: string; descricao: string; contexto: string;
        diz: string; naoProva: string; explicacao: string; afirmacoes: string[];
      }[];
    }
  | {
      tipo: 'ordenar'; objetivo: string; enunciado: string; criterio: string; explicacao: string;
      eventos: { id: string; quando: string; texto: string; afirmacoes: string[] }[];
    }
  | {
      tipo: 'classificar'; objetivo: string; enunciado: string; criterio: string; minimo: number;
      categorias: { id: string; nome: string }[];
      itens: { id: string; texto: string; categoria: string; explicacao: string; afirmacoes: string[] }[];
    };

export type Bloco =
  | { tipo: 'texto'; titulo?: string; paragrafos: string[] }
  | { tipo: 'caixa'; variante: 'metodo' | 'cuidado'; titulo: string; paragrafos: string[] }
  | { tipo: 'glossario'; termos: { termo: string; definicao: string; afirmacoes: string[] }[] }
  | { tipo: 'linha-do-tempo'; titulo: string; eventos: { quando: string; titulo: string; texto: string; afirmacoes: string[] }[] }
  | { tipo: 'atividade'; id: string }
  | {
      tipo: 'debate'; titulo: string; paragrafos: string[];
      posicoes: { nome: string; resumo: string }[]; nota: string;
    }
  | { tipo: 'reflexao'; id: string; pergunta: string; apoio: string }
  | { tipo: 'laboratorio'; titulo: string; apresentacao: string }
  | { tipo: 'sintese'; itens: string[] }
  /* As peças do Israel Além do Roteiro (22/10/2026): nenhuma conta para concluir o módulo. */
  | { tipo: 'palpite'; id: string; pergunta: string; opcoes: { texto: string; correta?: boolean }[]; resposta: string }
  | { tipo: 'vf'; id: string; titulo: string; itens: { afirmacao: string; verdadeira: boolean; explicacao: string }[] }
  | { tipo: 'curiosidades'; titulo: string; itens: { titulo: string; texto: string }[] }
  | {
      tipo: 'artefatos'; titulo: string;
      itens: { id: string; nome: string; tipo: 'documento' | 'objeto' | 'lugar' | 'livro'; quando: string; gravura: string; resumo: string; texto: string; legenda: string }[];
    }
  /** Um documento explorável: a ilustração tem partes tocáveis, cada uma com texto marcado. */
  | {
      tipo: 'documento'; id: string; titulo: string; ilustracao: 'edito'; apresentacao: string; legenda: string;
      partes: { id: string; rotulo: string; texto: string }[]; fecho: string;
    };

/**
 * A experiência premium de um módulo (protótipo de 22/10/2026, só no módulo 3).
 * A abertura com ilustração e a narrativa com mapa: os passos citam blocos do
 * Contextualizar pelo título, e o mapa só acende lugares que o bloco nomeia.
 */
export type ExperienciaDoModulo = {
  abertura?: { ilustracao: 'edito'; legenda: string };
  narrativa?: {
    etapa: string;
    passos: { bloco: string; ano: string; lugares: string[]; areas?: string[]; rota?: string }[];
  };
};

export type Etapa = { id: string; titulo: string; pergunta: string; blocos: Bloco[]; /** A gravura da seção (components/raizes/ilustracoes). */ vinheta?: string };

export type ModuloRaizes = {
  n: number; titulo: string; subtitulo: string; periodo: string; regiao: string;
  objetivos: string[]; etapas: Etapa[]; atividades: Record<string, Atividade>;
  experiencia?: ExperienciaDoModulo;
};

export type ResumoModulo = {
  n: number; titulo: string; periodo: string; regiao: string; resumo: string;
  estado: 'em-revisao' | 'em-preparacao';
};

export type Conquista = {
  id: string; titulo: string; descricao: string;
  condicao: { atividade: string } | { modulo: number };
};

export type DadosRaizes = {
  /** A publicação saiu sem o repositório privado do conteúdo (tools/export-content.mjs). */
  semConteudo?: boolean;
  slug: string; titulo: string; subtitulo: string; aviso: string;
  edicao: { numero: number; rotulo: string; atualizadoEm: string; revisaoHumana: boolean };
  regras: { desbloqueio: string; conclusaoDoModulo: string };
  modulos: ResumoModulo[];
  conquistas: Conquista[];
  certificado: { titulo: string; curso: string; subtitulo: string; texto: string; naoCertifica: string[]; nota: string };
  conteudo: ModuloRaizes[];
  afirmacoes: Afirmacao[];
  fontes: Fonte[];
  mapa: DesenhoDoMapa;
  /** Os outros desenhos, pelo nome (data/mapa-<nome>.json no repositório do conteúdo). */
  mapas?: Record<string, DesenhoDoMapa>;
  /** O Atlas (raizes/data/atlas.json): lugares, períodos e os Caminhos do Exílio. */
  atlas?: Atlas;
  /** As páginas de lugar (raizes/data/lugares/<id>.json). */
  lugares?: Record<string, PaginaDeLugar>;
  /** Os personagens históricos (raizes/data/personagens.json): só o que a matriz sustenta. */
  personagens?: Personagem[];
  fotos?: FotoRaizes[];
};

/* ── o Atlas ──────────────────────────────────────────────────────────────
 * Os DADOS são do repositório de conteúdo; a forma das linhas é do código
 * (components/raizes/AtlasMapa.tsx). Uma rota é a lista de lugares que as
 * fontes dão, e a curva entre eles nunca é estrada nem rota marítima. */

export type TipoDeLugar = 'vida' | 'saber' | 'decreto' | 'tribunal' | 'inquisicao' | 'porto' | 'diaspora' | 'memoria';
export type Evidencia = 'documentado' | 'corredor' | 'hipotese';

export type LugarDoAtlas = {
  id: string; nome: string; lat: number; lon: number;
  tipos: TipoDeLugar[]; periodos: string[]; resumo: string; afirmacoes: string[];
  /** Rótulo de região (um reino), sem ponto: não é cidade nem fronteira. */
  area?: boolean;
  /** Tem página própria em /raizes/lugar/<pagina>. */
  pagina?: string;
};

export type RotaDoExilio = {
  id: string; titulo: string; de: number; ate: number; quando: string;
  grupo: string; evidencia: Evidencia; pontos: string[]; resumo: string; afirmacoes: string[];
};

export type Atlas = {
  tipos: { id: TipoDeLugar; nome: string; descricao: string }[];
  periodos: { id: string; titulo: string; quando: string; de: number; ate: number; resumo: string; afirmacoes: string[] }[];
  lugares: LugarDoAtlas[];
  grupos: { id: string; nome: string; descricao: string }[];
  evidencias: { id: Evidencia; nome: string; descricao: string }[];
  rotas: RotaDoExilio[];
};

export type Personagem = {
  id: string; nome: string; quando: string;
  /** Lugares do Atlas ligados a ele (ids de atlas.lugares). */
  lugares: string[]; modulos: number[]; resumo: string; paragrafos: string[];
  /** A gravura do ofício que o texto descreve (interpretativa, nunca retrato). */
  objeto?: string;
};

/** Uma foto escolhida (raizes/data/fotos.json): sempre com autor, licença e página de origem. */
export type FotoRaizes = {
  id: string; arquivo: string; largura: number; altura: number;
  /** O que a imagem mostra, em português, a partir da ficha do arquivo. */
  mostra: string;
  autor: string; data: string | null; licenca: string; licencaUrl: string | null; pagina: string;
  /** Onde ela aparece: chaves como lugar:lisboa, artefato:m02:decreto, modulo:5, personagem:x. */
  onde: string[];
};

export type PaginaDeLugar = {
  id: string; nome: string; lat: number; lon: number; subtitulo: string; abertura: string;
  secoes: { titulo: string; paragrafos: string[] }[];
  cronologia: { quando: string; titulo: string; texto: string; afirmacoes: string[] }[];
  vestigios: { nome: string; estado: 'existe' | 'nao-existe' | 'incerto'; texto: string; afirmacoes: string[] }[];
  personagens: { nome: string; texto: string; afirmacoes: string[] }[];
  documentos: { titulo: string; texto: string; leitura: string; afirmacoes: string[]; link?: string }[];
  diaspora: { texto: string; rota?: string; afirmacoes: string[] }[];
  fotografias: { src: string; legenda: string; autor: string; licenca: string }[];
  fotografiasNota: string;
  ilustracao: { tipo: string; legenda: string };
};

/** As páginas de lugar que existem (a rota estática precisa saber na build). */
export const LUGARES_COM_PAGINA: readonly string[] = ['lisboa'];

export type DesenhoDoMapa = {
  quadro: { oeste: number; leste: number; sul: number; norte: number };
  largura: number; altura: number;
  projecao: { latitudePadrao: number; escala: number };
  terra: string; fonte: string;
};

/** Esta rota é de Raízes? (todas moram debaixo de /raizes). */
export const rotaDasRaizes = (pathname: string | null | undefined): boolean => {
  const p = (pathname ?? '').replace(/\/+$/, '');
  return p === '/raizes' || p.startsWith('/raizes/');
};

let DADOS: DadosRaizes | null = null;
let AFIRMACOES: Map<string, Afirmacao> | null = null;
let FONTES: Map<string, Fonte> | null = null;

export const raizesPronto = (): boolean => DADOS !== null;

export function hidratarRaizes(d: DadosRaizes): void {
  DADOS = d;
  AFIRMACOES = new Map(d.afirmacoes.map(a => [a.id, a]));
  FONTES = new Map(d.fontes.map(f => [f.id, f]));
}

export function raizes(): DadosRaizes {
  if (!DADOS) throw new Error('conteúdo de Raízes lido antes de carregar; toda tela renderiza dentro de CourseGate.');
  return DADOS;
}

export const afirmacao = (id: string): Afirmacao | undefined => { raizes(); return AFIRMACOES!.get(id); };
export const fonte = (id: string): Fonte | undefined => { raizes(); return FONTES!.get(id); };
export const modulo = (n: number): ModuloRaizes | undefined => raizes().conteudo.find(m => m.n === n);

let emAndamento: Promise<void> | null = null;

export function carregarRaizes(): Promise<void> {
  if (DADOS) return Promise.resolve();
  if (!emAndamento) emAndamento = buscar().catch(e => { emAndamento = null; throw e; });
  return emAndamento;
}

async function buscar(): Promise<void> {
  if (DADOS) return;
  if (process.env.NEXT_PUBLIC_PLATFORM_API !== 'worker') {
    const m = await import('@content/raizes.json');
    hidratarRaizes(((m as { default?: unknown }).default ?? m) as DadosRaizes);
    return;
  }
  const r = await fetch('/api/content/raizes', { credentials: 'same-origin' });
  if (!r.ok) throw new Error(`raizes ${r.status}`);
  hidratarRaizes(await r.json() as DadosRaizes);
}

/* ── o texto com marcas ───────────────────────────────────────────────────
   Um parágrafo do dado é texto com dois tipos de marca:
     [[R01-001]] ou [[R01-001,R01-002]]  → a fonte da frase anterior;
     {{he:סְפָרַד}}                       → hebraico, que passa por <He>.
   Partir aqui, e não no componente, deixa o teste conferir as marcas sem
   montar React. */
export type Pedaco =
  | { t: 'texto'; v: string }
  | { t: 'fonte'; ids: string[] }
  | { t: 'he'; v: string };

const MARCA = /\[\[([A-Z]\d{2}-\d{3}(?:\s*,\s*[A-Z]\d{2}-\d{3})*)\]\]|\{\{he:([^}]+)\}\}/g;

export function partir(s: string): Pedaco[] {
  const saida: Pedaco[] = [];
  let i = 0;
  for (const m of s.matchAll(MARCA)) {
    const antes = s.slice(i, m.index);
    if (antes) saida.push({ t: 'texto', v: antes });
    if (m[1]) saida.push({ t: 'fonte', ids: m[1].split(',').map(x => x.trim()) });
    else if (m[2]) saida.push({ t: 'he', v: m[2] });
    i = (m.index ?? 0) + m[0].length;
  }
  const resto = s.slice(i);
  if (resto) saida.push({ t: 'texto', v: resto });
  return saida;
}

/** Todas as afirmações citadas num texto, na ordem. */
export const marcasDe = (s: string): string[] =>
  partir(s).flatMap(p => (p.t === 'fonte' ? p.ids : []));

/* ── progresso ─────────────────────────────────────────────────────────── */

export const chavesDoModulo = (m: ModuloRaizes): string[] =>
  Object.keys(m.atividades).map(id => chaveDaAtividade(m.n, id));

export function progressoDoModulo(e: EstadoRaizes | undefined, m: ModuloRaizes) {
  const chaves = chavesDoModulo(m);
  const feitas = chaves.filter(k => atividadeConcluida(e, k)).length;
  return { feitas, total: chaves.length, concluido: moduloConcluido(e, chaves) };
}

/**
 * Pode abrir o módulo n? O 1 sempre; os outros quando o anterior está
 * concluído (regra de curso.json). Concluído continua aberto: revisar nunca
 * tranca. Módulo sem conteúdo (em preparação) nunca abre. A conta de
 * administrador (`revisor`) abre todos, para revisar o conteúdo.
 */
export function moduloAberto(e: EstadoRaizes | undefined, n: number, revisor = false): boolean {
  const m = modulo(n);
  if (!m) return false;
  /* O dono revisa: todos os módulos com conteúdo abertos (Account.revisor). */
  if (n === 1 || revisor) return true;
  const anterior = modulo(n - 1);
  return !!anterior && progressoDoModulo(e, anterior).concluido;
}

export function conquistasObtidas(e: EstadoRaizes | undefined): Set<string> {
  const ok = new Set<string>();
  for (const c of raizes().conquistas) {
    if ('atividade' in c.condicao) {
      if (atividadeConcluida(e, c.condicao.atividade)) ok.add(c.id);
    } else {
      const m = modulo(c.condicao.modulo);
      if (m && progressoDoModulo(e, m).concluido) ok.add(c.id);
    }
  }
  return ok;
}

/** O progresso no percurso inteiro: atividades concluídas sobre as dos módulos que existem. */
export function progressoGeral(e: EstadoRaizes | undefined) {
  const modulosFeitos = raizes().conteudo.filter(m => progressoDoModulo(e, m).concluido).length;
  return { modulosFeitos, total: TOTAL_DE_MODULOS, pct: Math.round((modulosFeitos / TOTAL_DE_MODULOS) * 100) };
}

/**
 * O certificado: só com os dez módulos publicados E concluídos. A data é a da
 * última atividade concluída, a que fechou o percurso. Ele certifica o estudo
 * e nada mais (curso.json, `naoCertifica`).
 */
export function certificadoRaizes(e: EstadoRaizes | undefined) {
  const r = raizes();
  const feitos = r.conteudo.filter(m => progressoDoModulo(e, m).concluido);
  const pronto = r.conteudo.length === TOTAL_DE_MODULOS && feitos.length === TOTAL_DE_MODULOS;
  const datas = pronto
    ? r.conteudo.flatMap(m => chavesDoModulo(m).map(k => e?.atividades[k]?.concluidaEm ?? '')).filter(Boolean).sort()
    : [];
  return { pronto, faltam: TOTAL_DE_MODULOS - feitos.length, concluidoEm: datas.at(-1) ?? null };
}

/* ── o mapa ───────────────────────────────────────────────────────────── */

/** O desenho pelo nome; sem nome (ou nome que não existe), a península. */
export function desenhoDoMapa(nome?: string): DesenhoDoMapa {
  const r = raizes();
  return (nome && r.mapas?.[nome]) || r.mapa;
}

/** A janela do desenho em unidades do mapa: o desenho inteiro, ou o recorte da atividade. */
export function janelaDoMapa(recorte?: { oeste: number; leste: number; sul: number; norte: number }, d: DesenhoDoMapa = raizes().mapa) {
  const { largura, altura } = d;
  if (!recorte) return { x: 0, y: 0, w: largura, h: altura };
  const [x0, y0] = projetar(recorte.oeste, recorte.norte, d);
  const [x1, y1] = projetar(recorte.leste, recorte.sul, d);
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}

/** Longitude e latitude → coordenadas do desenho (a projeção de tools/raizes-mapa.mjs). */
export function projetar(lon: number, lat: number, d: DesenhoDoMapa = raizes().mapa): [number, number] {
  const { quadro, projecao } = d;
  const cos = Math.cos((projecao.latitudePadrao * Math.PI) / 180);
  return [(lon - quadro.oeste) * cos * projecao.escala, (quadro.norte - lat) * projecao.escala];
}

/** Embaralha de forma determinística (a mesma ordem a cada visita, e nunca a certa). */
export function embaralhar<T>(itens: readonly T[], semente: string): T[] {
  let h = 2166136261;
  for (const c of semente) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; }
  const a = [...itens];
  for (let i = a.length - 1; i > 0; i--) {
    h = (Math.imul(h, 1103515245) + 12345) >>> 0;
    const j = h % (i + 1);
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  if (a.length > 1 && a.every((x, i) => x === itens[i])) a.push(a.shift()!);
  return a;
}

/** As fotos que aparecem num lugar do curso (a chave é a mesma da coleção: lugar:lisboa, modulo:5...). */
export const fotosDe = (chave: string): FotoRaizes[] => (raizes().fotos ?? []).filter(f => f.onde.includes(chave));

/* A camada de acessibilidade: o que ela guarda e como ela é aplicada.
 * ─────────────────────────────────────────────────────────────────────────
 * Cinco preferências do LEITOR, guardadas no aparelho dele e aplicadas por
 * atributos no <html>. Nada aqui edita componente nenhum: o CSS em
 * globals.css lê os atributos e reveste o produto inteiro de uma vez, do
 * mesmo jeito que os tokens de cor já faziam. Uma tela nova entra revestida
 * sem ninguém lembrar dela.
 *
 * ── por que atributo, e não classe ──────────────────────────────────────
 * Porque três das cinco têm mais de dois estados hoje ou terão amanhã (o
 * tamanho do texto já tem quatro), e `data-a11y-texto="130"` diz o valor
 * enquanto `.a11y-texto-130` obriga a remover a irmã antes de pôr a nova -
 * que é exatamente o descuido que deixa duas classes ligadas ao mesmo tempo.
 *
 * ── por que zoom, e não font-size ───────────────────────────────────────
 * O aumento de texto mexe em `zoom`, e isso é consequência de uma decisão
 * antiga do projeto: o design escreve tamanhos em px (`text-[17px]`), e px
 * ignora `html { font-size }`. Trocar o produto inteiro para rem para servir
 * esta preferência seria refazer centenas de telas para resolver o problema
 * no lugar errado. `zoom` no contêiner escala tudo junto - texto, caixas,
 * espaços - e é o que um leitor que aperta Ctrl+ já espera.
 *
 * ── o que NUNCA é tocado ────────────────────────────────────────────────
 * O hebraico. O espaçamento ampliado não entra em `.he`, e nenhuma
 * preferência troca a face hebraica: os sinais de vogal são posicionados
 * pela fonte, e letter-spacing ou uma segunda família deslocam o ponto para
 * fora da consoante. Numa plataforma que ensina a LER esses pontos, isso não
 * seria uma tela feia - seria uma lição errada.
 */

export type Prefs = {
  /** Percentual do zoom do conteúdo. 100 é o normal. */
  texto: 100 | 115 | 130 | 150;
  /** Tinta mais escura, bordas visíveis, fundos sem tingimento. */
  contraste: boolean;
  /** Desliga animação e revelação por rolagem. */
  movimento: boolean;
  /** Sublinha todo link no corpo do texto. */
  links: boolean;
  /** Entrelinha e espaço entre palavras maiores (WCAG 1.4.12). */
  espaco: boolean;
};

export const PADRAO: Prefs = {
  texto: 100, contraste: false, movimento: false, links: false, espaco: false
};

export const TAMANHOS = [100, 115, 130, 150] as const;

/** A chave do localStorage. Versionada: um formato novo não tenta ler o velho. */
export const CHAVE = 'hf-acessibilidade-v1';

/** O atributo de cada preferência, e o valor que ele assume quando ligada.
 *  Uma fonte só - o script de arranque lá embaixo é gerado a partir daqui. */
export const ATRIBUTOS = {
  texto: 'data-a11y-texto',
  contraste: 'data-a11y-contraste',
  movimento: 'data-a11y-movimento',
  links: 'data-a11y-links',
  espaco: 'data-a11y-espaco'
} as const;

const LIGADO = {
  contraste: 'alto', movimento: 'reduzido', links: 'sublinhado', espaco: 'amplo'
} as const;

/**
 * Lê o que estava guardado, aceitando lixo sem quebrar.
 *
 * O que está no localStorage foi escrito por uma versão anterior deste
 * arquivo, ou por ninguém, ou por alguém mexendo no console. Um campo que
 * não reconheço vira o padrão, em vez de derrubar a preferência inteira -
 * quem tinha contraste alto não perde o contraste porque um dia entrou um
 * campo novo.
 */
export function normalizar(bruto: unknown): Prefs {
  const o = (bruto && typeof bruto === 'object' ? bruto : {}) as Record<string, unknown>;
  const n = Number(o.texto);
  return {
    texto: (TAMANHOS as readonly number[]).includes(n) ? (n as Prefs['texto']) : 100,
    contraste: o.contraste === true,
    movimento: o.movimento === true,
    links: o.links === true,
    espaco: o.espaco === true
  };
}

export function carregar(): Prefs {
  try {
    const cru = localStorage.getItem(CHAVE);
    return cru ? normalizar(JSON.parse(cru)) : { ...PADRAO };
  } catch {
    /* Janela anônima, armazenamento bloqueado, JSON corrompido. A preferência
       é conveniência: sem ela o site funciona, então nunca vale uma exceção. */
    return { ...PADRAO };
  }
}

export function guardar(p: Prefs): void {
  try { localStorage.setItem(CHAVE, JSON.stringify(p)); } catch { /* idem */ }
}

/** Carimba as preferências no <html>. Idempotente: pode rodar a cada mudança. */
export function aplicar(p: Prefs, raiz?: HTMLElement): void {
  const el = raiz ?? (typeof document === 'undefined' ? null : document.documentElement);
  if (!el) return;

  /* O tamanho normal NÃO carimba atributo. Um `data-a11y-texto="100"` no HTML
     de todo mundo faria a regra de zoom existir sempre, e zoom: 1 num
     contêiner cria contexto de empilhamento - o suficiente para mudar como um
     `position: fixed` lá dentro se comporta. O padrão tem de ser a ausência. */
  if (p.texto === 100) el.removeAttribute(ATRIBUTOS.texto);
  else el.setAttribute(ATRIBUTOS.texto, String(p.texto));

  for (const chave of ['contraste', 'movimento', 'links', 'espaco'] as const) {
    if (p[chave]) el.setAttribute(ATRIBUTOS[chave], LIGADO[chave]);
    else el.removeAttribute(ATRIBUTOS[chave]);
  }
}

/**
 * O script que roda ANTES da primeira pintura, no <head>.
 *
 * Sem ele, a página pinta no padrão e só depois o React aplica a preferência:
 * quem escolheu alto contraste vê um lampejo do tema claro a cada navegação.
 * É um defeito pequeno para quem não precisa do recurso e cansativo para quem
 * precisa - e quem precisa é o público inteiro desta camada.
 *
 * É gerado a partir das MESMAS constantes que o React usa, então o nome de um
 * atributo não pode divergir entre os dois caminhos.
 */
export const SCRIPT_DE_ARRANQUE = `(function(){try{
var p=JSON.parse(localStorage.getItem(${JSON.stringify(CHAVE)})||'{}');
var e=document.documentElement;
if([${TAMANHOS.join(',')}].indexOf(Number(p.texto))>0)e.setAttribute(${JSON.stringify(ATRIBUTOS.texto)},String(p.texto));
${(['contraste', 'movimento', 'links', 'espaco'] as const)
    .map(k => `if(p.${k}===true)e.setAttribute(${JSON.stringify(ATRIBUTOS[k])},${JSON.stringify(LIGADO[k])});`)
    .join('\n')}
}catch(_){}})();`;

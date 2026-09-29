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
  /**
   * Tema da PLATAFORMA. O site de vendas é claro sempre - ver a nota do
   * modo escuro em styles/tokens.css.
   *
   * `auto` segue o aparelho, e é o padrão: quem deixou o celular no escuro
   * espera o escuro sem pedir duas vezes. `claro` e `escuro` são a saída para
   * quem quer o contrário do que o sistema diz, que é o caso de todo mundo
   * que lê à noite num aparelho configurado de dia.
   */
  tema: 'auto' | 'claro' | 'escuro';
  /** Tinta mais escura, bordas visíveis, fundos sem tingimento. */
  contraste: boolean;
  /** Desliga animação e revelação por rolagem. */
  movimento: boolean;
  /** Sublinha todo link no corpo do texto. */
  links: boolean;
  /** Entrelinha e espaço entre palavras maiores (WCAG 1.4.12). */
  espaco: boolean;
  /** Um botão "Ouvir a instrução" em cada exercício, que lê o enunciado em
   *  português com a voz do aparelho (components/learn/OuvirInstrucao.tsx). */
  voz: boolean;
};

export const PADRAO: Prefs = {
  texto: 100, tema: 'auto', contraste: false, movimento: false, links: false, espaco: false,
  voz: false
};

export const TEMAS = ['auto', 'claro', 'escuro'] as const;

export const TAMANHOS = [100, 115, 130, 150] as const;

/** A chave do localStorage. Versionada: um formato novo não tenta ler o velho. */
export const CHAVE = 'hf-acessibilidade-v1';

/** O atributo de cada preferência, e o valor que ele assume quando ligada.
 *  Uma fonte só - o script de arranque lá embaixo é gerado a partir daqui. */
export const ATRIBUTOS = {
  texto: 'data-a11y-texto',
  tema: 'data-a11y-tema',
  contraste: 'data-a11y-contraste',
  movimento: 'data-a11y-movimento',
  links: 'data-a11y-links',
  espaco: 'data-a11y-espaco',
  voz: 'data-a11y-voz'
} as const;

const LIGADO = {
  contraste: 'alto', movimento: 'reduzido', links: 'sublinhado', espaco: 'amplo', voz: 'instrucoes'
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
    tema: (TEMAS as readonly string[]).includes(String(o.tema))
      ? (o.tema as Prefs['tema']) : 'auto',
    contraste: o.contraste === true,
    movimento: o.movimento === true,
    links: o.links === true,
    espaco: o.espaco === true,
    voz: o.voz === true
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

  /* O tema é RESOLVIDO antes de virar atributo, e só o escuro carimba.
     ──────────────────────────────────────────────────────────────────────
     A preferência guardada tem três valores; o CSS conhece um. `auto` é
     traduzido aqui, consultando o aparelho, e o que chega ao <html> é sempre
     a resposta: `data-a11y-tema="escuro"`, ou nada.

     Duas razões para resolver em vez de carimbar os três. O CSS fica com UM
     bloco em vez de dois (o do `auto` teria de ser uma cópia dentro de um
     `@media prefers-color-scheme`, e cópia de paleta é paleta que diverge).
     E a ausência continua sendo o padrão, como nas outras preferências. */
  if (temaEscuro(p)) el.setAttribute(ATRIBUTOS.tema, 'escuro');
  else el.removeAttribute(ATRIBUTOS.tema);

  for (const chave of ['contraste', 'movimento', 'links', 'espaco', 'voz'] as const) {
    if (p[chave]) el.setAttribute(ATRIBUTOS[chave], LIGADO[chave]);
    else el.removeAttribute(ATRIBUTOS[chave]);
  }
}

/** A conta que traduz os três estados em "escuro, sim ou não". */
export function temaEscuro(p: Prefs): boolean {
  if (p.tema === 'escuro') return true;
  if (p.tema === 'claro') return false;
  try {
    return !!window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  } catch {
    /* Sem matchMedia - navegador antigo, ambiente de teste. O claro é o
       padrão do design, então é ele que responde na dúvida. */
    return false;
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
var m=typeof window!=='undefined'&&window.matchMedia
  ?window.matchMedia('(prefers-color-scheme: dark)').matches:false;
if(p.tema==='escuro'||(p.tema!=='claro'&&m))e.setAttribute(${JSON.stringify(ATRIBUTOS.tema)},'escuro');
${(['contraste', 'movimento', 'links', 'espaco', 'voz'] as const)
    .map(k => `if(p.${k}===true)e.setAttribute(${JSON.stringify(ATRIBUTOS[k])},${JSON.stringify(LIGADO[k])});`)
    .join('\n')}
}catch(_){}})();`;

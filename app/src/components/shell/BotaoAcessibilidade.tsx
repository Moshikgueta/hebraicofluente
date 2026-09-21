'use client';

/* O botão de acessibilidade, e o painel dele.
 * ─────────────────────────────────────────────────────────────────────────
 * Flutua em toda página - site e plataforma -, porque o leitor que precisa
 * dele precisa dele na lição, e não só na capa. Fica FORA do contêiner que
 * recebe o zoom (ver layout.tsx): o controle do tamanho do texto não pode
 * mudar de tamanho junto com o texto, senão em 150% ele sai da tela e a
 * pessoa fica presa no ajuste que acabou de fazer.
 *
 * ── o que ele faz, e o que ele não faz ──────────────────────────────────
 * Ele não "conserta" a página: o contraste do design, o anel de foco, o
 * pular-para-o-conteúdo, os rótulos e a ordem de tabulação são obrigação do
 * produto e existem sem ele. O que ele oferece são as cinco preferências que
 * o CSS não pode adivinhar - e três delas (movimento, contraste, espaço) já
 * respeitam a preferência do SISTEMA quando ela existe. Este painel é para
 * quem quer decidir aqui, e para quem usa um sistema que não oferece a opção.
 *
 * ── teclado ─────────────────────────────────────────────────────────────
 * Alt+Shift+A abre e fecha de qualquer lugar (o atalho que os leitores de
 * tela brasileiros já esperam), Esc fecha e devolve o foco ao botão, e o
 * painel é um `dialog` rotulado. Nada aqui rouba o foco de quem não abriu.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  PADRAO, TAMANHOS, aplicar, carregar, guardar, type Prefs
} from '@/lib/acessibilidade';

export function BotaoAcessibilidade() {
  const [prefs, setPrefs] = useState<Prefs>(PADRAO);
  const [aberto, setAberto] = useState(false);
  /* Até ler o localStorage, o componente não sabe o estado real. Marcar as
     opções antes disso mostraria "desligado" a quem tem tudo ligado. */
  const [pronto, setPronto] = useState(false);
  const botao = useRef<HTMLButtonElement>(null);
  const painel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const p = carregar();
    setPrefs(p);
    setPronto(true);
    /* O script de arranque já carimbou o <html>. Aplicar de novo é de graça e
       cobre o caso de ele não ter rodado (CSP de um ambiente de teste, por
       exemplo) - o painel continua sendo a fonte da verdade. */
    aplicar(p);
  }, []);

  const mudar = useCallback((patch: Partial<Prefs>) => {
    setPrefs(atual => {
      const novo = { ...atual, ...patch };
      aplicar(novo);
      guardar(novo);
      return novo;
    });
  }, []);

  /* Alt+Shift+A de qualquer lugar. Não usa Ctrl: Ctrl+Shift+A é do navegador. */
  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.altKey && e.shiftKey && e.code === 'KeyA') {
        e.preventDefault();
        setAberto(v => !v);
        botao.current?.focus();
      }
      if (e.key === 'Escape' && aberto) {
        setAberto(false);
        botao.current?.focus();
      }
    };
    document.addEventListener('keydown', aoTeclar);
    return () => document.removeEventListener('keydown', aoTeclar);
  }, [aberto]);

  /* Clique fora fecha. O `pointerdown` e não `click`: um clique que começa
     dentro do painel e termina fora (arrastar num controle) não deve fechar. */
  useEffect(() => {
    if (!aberto) return;
    const fora = (e: PointerEvent) => {
      const alvo = e.target as Node;
      if (!painel.current?.contains(alvo) && !botao.current?.contains(alvo)) setAberto(false);
    };
    document.addEventListener('pointerdown', fora);
    return () => document.removeEventListener('pointerdown', fora);
  }, [aberto]);

  const ligadas = pronto
    ? Number(prefs.texto !== 100) + Number(prefs.contraste) + Number(prefs.movimento)
      + Number(prefs.links) + Number(prefs.espaco)
    : 0;

  return (
    /* `print:hidden`: numa folha impressa o botão é uma bolha preta sobre o
       texto. Tudo desta camada sai do papel - ver globals.css. */
    <div className="hf-a11y print:hidden">
      {aberto && (
        <div
          ref={painel}
          role="dialog"
          aria-modal="false"
          aria-label="Ajustes de acessibilidade"
          className="hf-a11y-painel w-[min(300px,calc(100vw-32px))] rounded-[var(--r-lg)]
                     bg-surface border border-line shadow-[var(--sh)] p-4 grid gap-4"
        >
          <div className="grid gap-1">
            <p className="font-display text-[15px] font-bold text-ink">Acessibilidade</p>
            <p className="font-ui text-[12.5px] leading-relaxed text-ink-muted">
              Fica guardado neste aparelho, e vale em todas as páginas.
            </p>
          </div>

          <fieldset className="grid gap-2 m-0 p-0 border-0">
            <legend className="font-ui text-[12px] uppercase tracking-[.08em] text-ink-muted p-0 mb-1">
              Tamanho do texto
            </legend>
            <div className="grid grid-cols-4 gap-1.5">
              {TAMANHOS.map(t => {
                const ativo = prefs.texto === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => mudar({ texto: t })}
                    aria-pressed={ativo}
                    className={`min-h-[40px] rounded-[var(--r-sm)] border font-ui text-[13px] font-semibold
                                tabular-nums transition-colors
                                ${ativo
                                  ? 'border-[var(--teal)] bg-[var(--teal-soft)] text-[var(--teal-ink)]'
                                  : 'border-line bg-surface text-ink-body hover:bg-surface-2'}`}
                  >
                    {t}%
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="grid gap-1.5">
            <Opcao
              id="a11y-contraste"
              rotulo="Mais contraste"
              nota="Tinta mais escura e bordas visíveis."
              ligada={prefs.contraste}
              aoMudar={v => mudar({ contraste: v })}
            />
            <Opcao
              id="a11y-espaco"
              rotulo="Mais espaço entre linhas"
              nota="Entrelinha e espaço entre palavras maiores."
              ligada={prefs.espaco}
              aoMudar={v => mudar({ espaco: v })}
            />
            <Opcao
              id="a11y-links"
              rotulo="Sublinhar links"
              nota="Todo link do texto fica sublinhado."
              ligada={prefs.links}
              aoMudar={v => mudar({ links: v })}
            />
            <Opcao
              id="a11y-movimento"
              rotulo="Menos animação"
              nota="Nada entra deslizando nem fica pulsando."
              ligada={prefs.movimento}
              aoMudar={v => mudar({ movimento: v })}
            />
          </div>

          <div className="flex items-center justify-between gap-3 pt-1 border-t border-[color:var(--line-soft)]">
            <button
              type="button"
              onClick={() => mudar({ ...PADRAO })}
              className="min-h-[40px] font-ui text-[13px] font-semibold text-ink-body
                         hover:text-[var(--accent)] underline underline-offset-2"
            >
              Voltar ao normal
            </button>
            <button
              type="button"
              onClick={() => { setAberto(false); botao.current?.focus(); }}
              className="min-h-[40px] px-4 rounded-[var(--r-md)] bg-[var(--navy)] text-white
                         font-ui text-[13.5px] font-semibold hover:bg-[var(--navy-2)]"
            >
              Fechar
            </button>
          </div>

          <p className="font-ui text-[11.5px] leading-relaxed text-ink-muted">
            Atalho: Alt + Shift + A.
          </p>
        </div>
      )}

      <button
        ref={botao}
        type="button"
        onClick={() => setAberto(v => !v)}
        aria-expanded={aberto}
        aria-label={
          ligadas > 0
            ? `Ajustes de acessibilidade (${ligadas} ativo${ligadas > 1 ? 's' : ''})`
            : 'Ajustes de acessibilidade'
        }
        title="Acessibilidade (Alt + Shift + A)"
        className="hf-a11y-botao relative w-[52px] h-[52px] rounded-full bg-[var(--navy)] text-white
                   border-2 border-[var(--cream)] shadow-[var(--sh)] grid place-items-center
                   transition-[background-color,transform] duration-[180ms]
                   hover:bg-[var(--navy-2)] hover:scale-[1.04] active:scale-100"
      >
        <IconePessoa />
        {/* O ponto só aparece quando há ajuste ligado: é a única forma de
            saber, sem abrir, que a página não está no padrão - e é o que
            explica para o leitor por que o site dele está diferente. */}
        {ligadas > 0 && (
          <span aria-hidden
                className="absolute top-0 right-0 w-[14px] h-[14px] rounded-full
                           bg-[var(--teal)] border-2 border-[var(--cream)]" />
        )}
      </button>
    </div>
  );
}

/* Um interruptor que é um checkbox de verdade por baixo: leitor de tela lê
   "caixa de seleção, marcada", o rótulo é clicável e o teclado já funciona
   sem nenhuma tecla tratada à mão. */
function Opcao({ id, rotulo, nota, ligada, aoMudar }: {
  id: string; rotulo: string; nota: string;
  ligada: boolean; aoMudar: (v: boolean) => void;
}) {
  return (
    <label
      htmlFor={id}
      className="flex items-start gap-3 min-h-[44px] py-1.5 px-2 -mx-2 rounded-[var(--r-sm)]
                 cursor-pointer hover:bg-surface-2"
    >
      <input
        id={id}
        type="checkbox"
        checked={ligada}
        onChange={e => aoMudar(e.target.checked)}
        className="mt-[3px] w-[18px] h-[18px] shrink-0 accent-[var(--teal)] cursor-pointer"
      />
      <span className="grid gap-0.5">
        <span className="font-ui text-[13.5px] font-semibold text-ink leading-tight">{rotulo}</span>
        <span className="font-ui text-[12px] leading-snug text-ink-muted">{nota}</span>
      </span>
    </label>
  );
}

/* O boneco universal de acessibilidade. Desenhado, e não emoji: um emoji
   muda de forma em cada sistema e é lido em voz alta pelo leitor de tela. */
function IconePessoa() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="4.6" r="1.9" fill="currentColor" />
      <path
        d="M4.6 8.4h14.8M12 8.9v5.2m0 0-2.6 6m2.6-6 2.6 6"
        stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"
      />
    </svg>
  );
}

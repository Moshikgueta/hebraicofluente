'use client';

/* O hero, e a sequência de entrada.
 * ─────────────────────────────────────────────────────────────────────────
 * Cinco etapas encadeadas: título, parágrafo, botões, mockup, e por fim a
 * resposta do mockup virando acerto - com o +10 XP subindo e a sequência
 * passando de 6 para 7 dias. Não é enfeite: em cinco segundos a página conta
 * o que o produto faz, sem vídeo e sem uma linha de texto a mais.
 *
 * Com `prefers-reduced-motion`, todos os atrasos viram zero. A página chega
 * no estado final na hora, em vez de encenar - e o estado final é o mesmo.
 *
 * Os timers são limpos no desmonte. Um `setTimeout` que dispara depois de a
 * rota trocar chama `setState` num componente que não existe mais.
 */

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { He } from '@/components/hebrew/He';
import { Container, Check } from './base';

const ETAPAS: readonly [number, number][] = [[1, 120], [2, 420], [3, 720], [4, 1000], [5, 1900]];

const CONFIANCA = ['Acesso imediato', 'No seu ritmo', 'Feito para brasileiros', 'Curso interativo'];

/* A mensagem central é em PORTUGUÊS, inteira.
 * ─────────────────────────────────────────────────────────────────────────
 * O título antes começava com uma letra hebraica, e lia bonito para quem já
 * sabe o que ela é. O problema é exatamente esse: quem chega aqui não sabe.
 * A primeira linha da página tem um trabalho só - dizer, na língua de quem
 * está lendo, o que a pessoa vai conseguir fazer -, e um caractere que ela
 * não consegue decifrar no meio da frase trabalha contra isso.
 *
 * O hebraico continua na página, e de sobra: ele está no mockup, na aula de
 * amostra, no fecho. Ali ele é DEMONSTRAÇÃO, que é o papel certo dele numa
 * página de venda - mostra o que se vai aprender em vez de exigir que já se
 * saiba.
 */
export function Hero({
  primaryHref, primaryLabel, primaryMicro, secondaryHref
}: {
  primaryHref: string;
  primaryLabel: string;
  /** A linha curta embaixo do botão: o que se leva ao clicar. */
  primaryMicro: string;
  secondaryHref: string;
}) {
  const [etapa, setEtapa] = useState(0);

  useEffect(() => {
    const reduz = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const timers = ETAPAS.map(([v, ms]) => setTimeout(() => setEtapa(v), reduz ? 0 : ms));
    return () => timers.forEach(clearTimeout);
  }, []);

  const em = (n: number) => etapa >= n;
  const certo = em(5);

  return (
    <header className="relative overflow-hidden">
      {/* O brilho do canto superior direito. Sem eventos de ponteiro: ele
          cobre a coluna inteira e engoliria os cliques dos botões. */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(120% 90% at 82% -10%, #EAF4F1 0%, rgba(234,244,241,0) 58%)' }}
      />
      <Container className="relative pt-14 pb-16 sm:pt-[78px] sm:pb-24
                            grid gap-12 lg:gap-[60px] lg:grid-cols-[minmax(0,1.04fr)_minmax(0,1fr)] lg:items-center">
        <div>
          <div
            className="transition-[opacity,transform] duration-[600ms] ease-[var(--ease)]"
            style={{ opacity: em(1) ? 1 : 0, transform: em(1) ? 'none' : 'translateY(20px)' }}
          >
            <p className="inline-flex items-center gap-2 rounded-full bg-[var(--teal-soft)]
                          px-[13px] py-[7px] font-ui text-[13.5px] font-semibold text-[var(--teal-ink)] mb-[22px]">
              <span aria-hidden className="w-[6px] h-[6px] rounded-full bg-[var(--teal)]" />
              Alfabetização Hebraica · turma aberta
            </p>
            <h1 className="font-display font-semibold text-[clamp(40px,5.1vw,62px)] leading-[1.02]
                           tracking-[-0.036em] text-balance m-0 mb-5">
              Da primeira letra ao hebraico de verdade.
            </h1>
          </div>

          <p
            className="font-ui text-[18px] sm:text-[19.5px] leading-[1.6] text-ink-muted max-w-[44ch] mb-7
                       transition-[opacity,transform] duration-[600ms] delay-[120ms] ease-[var(--ease)]"
            style={{ opacity: em(2) ? 1 : 0, transform: em(2) ? 'none' : 'translateY(16px)' }}
          >
            Aprenda a ler, entender e avançar no hebraico com explicações em português,
            exercícios interativos e uma jornada de estudos clara.
          </p>

          <div
            className="grid gap-2.5 justify-items-start mb-7
                       transition-[opacity,transform] duration-500 delay-[260ms] ease-[var(--ease)]"
            style={{ opacity: em(3) ? 1 : 0, transform: em(3) ? 'none' : 'translateY(14px)' }}
          >
            <div className="flex flex-wrap gap-3">
              <Link
                href={primaryHref}
                className="group inline-flex items-center justify-center gap-2 rounded-[13px]
                           bg-[var(--navy)] text-white font-ui font-semibold text-[17px] px-7 py-[15px]
                           shadow-[var(--sh)] transition-[background-color,transform] duration-[180ms]
                           hover:bg-[var(--navy-2)] hover:-translate-y-[2px] active:translate-y-0"
              >
                {primaryLabel}
                {/* A seta anda 3px no hover. Micro-interação, não animação: o
                    botão responde ao ponteiro sem chamar atenção para si. */}
                <span aria-hidden
                      className="transition-transform duration-[180ms] group-hover:translate-x-[3px]">→</span>
              </Link>
              <Link
                href={secondaryHref}
                className="inline-flex items-center justify-center rounded-[13px] bg-[var(--card)] text-ink
                           border border-line font-ui font-semibold text-[17px] px-6 py-[15px]
                           transition-[border-color,transform] duration-[180ms]
                           hover:border-[#C9C3B4] hover:-translate-y-[2px]"
              >
                Ver como funciona
              </Link>
            </div>
            {/* A microcópia responde a pergunta que trava o clique: "e o que
                acontece depois que eu clicar?". Fica embaixo do botão, no
                tamanho de nota de rodapé, porque é resposta e não promessa. */}
            <p className="font-ui text-[13.5px] text-ink-muted m-0">{primaryMicro}</p>
          </div>

          <ul
            className="flex flex-wrap gap-x-5 gap-y-2 list-none p-0 m-0
                       transition-opacity duration-500 delay-[400ms]"
            style={{ opacity: em(3) ? 1 : 0 }}
          >
            {CONFIANCA.map(t => (
              <li key={t} className="flex items-center gap-[7px] font-ui text-[14.5px] text-ink-muted">
                <Check /> {t}
              </li>
            ))}
          </ul>
        </div>

        <div
          className="relative transition-[opacity,transform] duration-700 delay-[340ms] ease-[var(--ease)]"
          style={{ opacity: em(4) ? 1 : 0, transform: em(4) ? 'none' : 'translateY(26px)' }}
        >
          <Mockup ativo={em(4)} certo={certo} />
          <CartaoFlutuante
            className="top-[-22px] right-[-6px] sm:right-[-14px]"
            style={{ animationDuration: '5.5s' }}
            icone={<Chama />}
            fundo="var(--gold-soft)"
            rotulo="Sequência"
            valor={`${certo ? 7 : 6} dias`}
          />
          <CartaoFlutuante
            className="left-[-10px] sm:left-[-26px] bottom-[56px]"
            style={{ animationDuration: '6.5s', animationDelay: '.8s' }}
            icone={<Check size={16} color="var(--teal)" />}
            fundo="var(--teal-soft)"
            rotulo="Lição concluída"
            valor="5 novas letras"
          />
        </div>
      </Container>
    </header>
  );
}

/* O mockup: a mesma questão que existe de verdade dentro do curso, parada no
   momento em que ela é respondida. */
function Mockup({ ativo, certo }: { ativo: boolean; certo: boolean }) {
  return (
    <div className="relative z-[2] rounded-[26px] bg-[var(--card)] border border-line
                    shadow-[var(--sh-mock)] p-6 pt-[26px]">
      <div className="flex items-center gap-3 mb-5">
        <span aria-hidden className="text-ink-muted text-[19px] leading-none">‹</span>
        <span className="flex-1 h-[7px] rounded-full bg-[var(--sand)] overflow-hidden">
          <span
            className="block h-full rounded-full transition-[width] duration-[1300ms] ease-[var(--ease-fill)]"
            style={{ width: ativo ? '72%' : '0%', background: 'linear-gradient(90deg,var(--teal),#2FB39F)' }}
          />
        </span>
        <span className="font-ui text-[13px] font-semibold text-[var(--teal)] tabular-nums min-w-[34px] text-right">
          {ativo ? '72%' : '0%'}
        </span>
      </div>

      <p className="font-ui text-[15px] text-ink-muted mb-3.5">Qual é o som desta letra?</p>

      <div className="rounded-[18px] bg-[var(--sand)] px-5 py-[26px] text-center mb-4">
        {/* A letra num bloco próprio: <He> é um span, e sem isto o botão
            "Ouvir" fica ao lado dela em vez de embaixo. */}
        <div><He size="plate" tone="navy" className="animate-pop">ש</He></div>
        <span className="mt-3 inline-flex items-center gap-2 rounded-full bg-[var(--card)] border border-line
                         px-[17px] py-[9px] font-ui text-[14.5px] font-semibold text-ink">
          <span aria-hidden className="w-[9px] h-[9px] rounded-full bg-[var(--teal)] animate-pulse-dot" />
          Ouvir
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div
          className="rounded-[14px] border-[1.5px] p-[13px] text-center font-ui font-semibold text-[16px]
                     flex items-center justify-center gap-2 transition-all duration-[350ms]"
          style={{
            borderColor: certo ? 'var(--teal)' : 'var(--line)',
            background: certo ? 'var(--teal-soft)' : 'transparent',
            color: certo ? 'var(--teal-ink)' : 'var(--ink-muted)'
          }}
        >
          SH <span className="transition-opacity duration-300 delay-100" style={{ opacity: certo ? 1 : 0 }}>✓</span>
        </div>
        {['M', 'L', 'V'].map(t => (
          <div key={t} className="rounded-[14px] border-[1.5px] border-line p-[13px] text-center
                                  font-ui font-semibold text-[16px] text-ink-muted">
            {t}
          </div>
        ))}
      </div>

      {certo && (
        <span className="absolute right-[26px] bottom-[96px] font-ui font-bold text-[17px]
                         text-[var(--teal)] pointer-events-none animate-xp">
          +10 XP
        </span>
      )}
    </div>
  );
}

function CartaoFlutuante({
  className, style, icone, fundo, rotulo, valor
}: {
  className: string; style?: React.CSSProperties; icone: React.ReactNode;
  fundo: string; rotulo: string; valor: string;
}) {
  return (
    <div
      className={`absolute z-[3] flex items-center gap-[11px] rounded-[16px] bg-[var(--card)]
                  border border-line shadow-[var(--sh)] px-4 py-3 animate-float ${className}`}
      style={style}
    >
      <span aria-hidden className="w-8 h-8 rounded-[9px] grid place-items-center shrink-0" style={{ background: fundo }}>
        {icone}
      </span>
      <span className="grid">
        <span className="font-ui text-[12.5px] leading-[1.3] text-ink-muted">{rotulo}</span>
        <span className="font-ui text-[15px] font-bold leading-[1.3] tabular-nums text-ink">{valor}</span>
      </span>
    </div>
  );
}

function Chama() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M8 1.8c1.5 2.4.6 3.6-.5 4.8-1 1.1-1.9 2.2-1.9 3.7a2.4 2.4 0 0 0 4.8 0c0-.7-.2-1.2-.5-1.8 1.6.8 2.6 2 2.6 3.6A4.5 4.5 0 0 1 8 14.3a4.5 4.5 0 0 1-4.5-4.5C3.5 6.3 6.6 5 8 1.8Z"
            stroke="var(--gold)" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}

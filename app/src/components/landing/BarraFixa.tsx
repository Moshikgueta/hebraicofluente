'use client';

/* A barra de compra que acompanha a rolagem, no celular.
 * ─────────────────────────────────────────────────────────────────────────
 * A landing tem catorze seções. Num celular isso é muita tela, e o botão de
 * comprar aparece em três pontos fixos - hero, caixa de preço, fecho. Entre
 * um e outro existe um trecho longo em que a pessoa está convencida e não
 * tem onde clicar. É aí que ela volta para o WhatsApp.
 *
 * ── as três regras que separam isto de um pop-up ────────────────────────
 *
 * 1. SÓ APARECE DEPOIS DO HERO. Enquanto o botão de verdade está na tela,
 *    uma cópia dele grudada embaixo é ruído - e, pior, esconde conteúdo de
 *    quem acabou de chegar.
 * 2. SOME EM CIMA DAS SEÇÕES QUE JÁ PEDEM. Quando a caixa de preço ou o
 *    fecho entram na tela, a barra sai: duas chamadas disputando o mesmo
 *    polegar, e uma delas tapando a outra, é pior do que nenhuma.
 * 3. SÓ EXISTE PARA QUEM ELA SERVE. Um aluno que já comprou não recebe uma
 *    faixa de preço colada no rodapé do site dele - quem decide é `vende`,
 *    de lib/cta.ts, a mesma regra que decide os outros botões.
 *
 * Não fecha, não tem X, não tem contagem regressiva. É um atalho para o que
 * a página já oferece, não uma segunda oferta.
 *
 * Só no celular (`lg:hidden`): no desktop a caixa de preço fica visível por
 * muito mais tempo e a barra viraria enfeite.
 */

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { brl, flagship, parcelasMax } from '@/lib/catalog';
import { empresa, parcelasCurto } from '@/lib/empresa';

/* Os alvos que apagam a barra. Ficam aqui, e não espalhados, porque são os
   ids que as seções de Fecho.tsx já expõem - se um sumir, o efeito abaixo
   simplesmente não observa nada e a barra continua funcionando. */
const PEDEM = ['preco', 'fecho'];

export function BarraFixa({ href, label }: { href: string; label: string }) {
  const [passou, setPassou] = useState(false);
  const [tapando, setTapando] = useState(false);

  useEffect(() => {
    /* O hero ocupa quase a altura da tela. Um limiar relativo à janela
       funciona em qualquer aparelho; um número fixo em px não. */
    const limiar = () => window.innerHeight * 0.85;
    const aoRolar = () => setPassou(window.scrollY > limiar());
    aoRolar();
    window.addEventListener('scroll', aoRolar, { passive: true });

    const alvos = PEDEM
      .map(id => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el);

    let obs: IntersectionObserver | null = null;
    if (alvos.length > 0 && typeof IntersectionObserver !== 'undefined') {
      const vistos = new Set<Element>();
      obs = new IntersectionObserver(entradas => {
        for (const e of entradas) {
          if (e.isIntersecting) vistos.add(e.target);
          else vistos.delete(e.target);
        }
        setTapando(vistos.size > 0);
      }, { threshold: 0.08 });
      for (const el of alvos) obs.observe(el);
    }

    return () => {
      window.removeEventListener('scroll', aoRolar);
      obs?.disconnect();
    };
  }, []);

  const c = flagship();
  const parcelas = parcelasMax(c.price);
  const visivel = passou && !tapando;

  /* Fica sempre no DOM e muda de opacidade: montar e desmontar a cada
     rolagem faria o Next remontar o Link e perder a transição. `inert` tira
     o botão invisível do caminho do teclado e do leitor de tela. */
  return (
    <div
      className="lg:hidden fixed inset-x-0 bottom-0 z-[60] transition-[opacity,transform]
                 duration-[260ms] ease-[var(--ease)] motion-reduce:transition-none"
      style={{
        opacity: visivel ? 1 : 0,
        transform: visivel ? 'none' : 'translateY(110%)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)'
      }}
      inert={!visivel}
      aria-hidden={!visivel}
    >
      <div className="flex items-center gap-3 bg-[var(--card)] border-t border-line
                      shadow-[0_-8px_24px_rgba(14,59,67,.10)] px-4 py-3">
        <p className="flex-1 min-w-0 m-0 font-ui leading-[1.25]">
          <span className="block text-[15px] font-semibold text-ink tabular-nums">
            {brl(c.price.brl)}
          </span>
          <span className="block text-[12.5px] text-ink-muted tabular-nums">
            ou {parcelasCurto(parcelas)} no cartão
          </span>
          {/* A versão curta da linha da caixa de preço (CONV-001): a barra
              é o único botão visível num trecho longo da capa, e a pessoa
              decide aqui sem saber que pode desistir. Uma linha a mais no
              bloco de texto; a barra continua na altura do botão. */}
          <span className="block text-[12.5px] text-ink-muted tabular-nums">
            {empresa.politicas.arrependimentoDias} dias para desistir
          </span>
        </p>
        <Link
          href={href}
          className="shrink-0 inline-flex items-center rounded-[12px] bg-[var(--teal-solid)] text-white
                     font-ui font-semibold text-[15.5px] px-5 min-h-[46px]
                     transition-transform duration-[180ms] active:scale-[.98]"
        >
          {label}
        </Link>
      </div>
    </div>
  );
}

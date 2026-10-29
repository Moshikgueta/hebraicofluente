'use client';

/* "O curso no seu celular" (28/10/2026): o botão de instalar quando o
   navegador oferece, os dois toques do Safari no iPhone, e a linha do menu
   nos outros. Ver lib/instalar.ts e app/manifest.ts.

   Duas formas:
   · `cartao`: no painel, só no celular, só para quem não instalou, e some
     para sempre com "Agora não" (guardado no aparelho). Uma vez, sem voltar.
   · `perfil`: em Sua conta, sempre, para quem quiser depois. */

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { abertoComoApp, comoInstalar, ouvirPedido, pedirInstalacao, temPedido, type ComoInstalar } from '@/lib/instalar';
import { tx } from '@/i18n/telas/instalar-app';

const DISPENSADO = 'hf-instalar-dispensado';

function lerDispensado(): boolean {
  try { return localStorage.getItem(DISPENSADO) === '1'; } catch { return false; }
}

export function InstalarApp({ variante }: { variante: 'cartao' | 'perfil' }) {
  const [modo, setModo] = useState<ComoInstalar | null>(null);
  const [fora, setFora] = useState(true);

  useEffect(() => {
    const calcular = () => setModo(comoInstalar({
      ua: navigator.userAgent, toques: navigator.maxTouchPoints, aberto: abertoComoApp(), comPedido: temPedido()
    }));
    calcular();
    const celular = window.matchMedia?.('(pointer: coarse)').matches ?? false;
    setFora(variante === 'cartao' && (!celular || lerDispensado()));
    return ouvirPedido(calcular);
  }, [variante]);

  if (modo === null || fora) return null;
  if (variante === 'cartao' && modo === 'instalado') return null;

  function dispensar() {
    try { localStorage.setItem(DISPENSADO, '1'); } catch { /* só some desta vez */ }
    setFora(true);
  }

  return (
    <Card tone={variante === 'cartao' ? 'wash' : undefined} className="p-5 grid gap-3">
      <h2 className="font-display text-[17px] font-bold text-ink m-0">{tx.titulo}</h2>
      {modo === 'instalado' ? (
        <p className="font-ui text-[14.5px] leading-relaxed text-ink-body m-0">{tx.instalado}</p>
      ) : (
        <>
          <p className="font-ui text-[14.5px] leading-relaxed text-ink-body m-0">{tx.texto}</p>
          {modo === 'botao' ? (
            <Button onClick={() => void pedirInstalacao()} className="justify-self-start">{tx.instalar}</Button>
          ) : modo === 'ios' ? (
            <p className="font-ui text-[14.5px] leading-relaxed text-ink m-0">
              {tx.iosAntes} <strong>{tx.iosCompartilhar}</strong>{' '}
              <IconeCompartilhar /> {tx.iosDepois} <strong>{tx.iosAdicionar}</strong>.
            </p>
          ) : (
            <p className="font-ui text-[14.5px] leading-relaxed text-ink m-0">{tx.outro}</p>
          )}
          {variante === 'cartao' && (
            <button type="button" onClick={dispensar}
                    className="justify-self-start min-h-[44px] font-ui text-[13.5px] text-ink-muted underline">
              {tx.agoraNao}
            </button>
          )}
        </>
      )}
    </Card>
  );
}

/** O desenho do botão Compartilhar do Safari: o quadrado com a seta. */
function IconeCompartilhar() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" width="18" height="18" className="inline-block align-[-3px] text-[var(--teal-ink)]"
         fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v12M8 7l4-4 4 4" />
      <path d="M6 11H5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-1" />
    </svg>
  );
}

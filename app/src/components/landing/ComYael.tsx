/* A Yael ao lado do retorno de uma resposta, nas amostras da página de venda
   (30/10/2026, pedido do dono: "em geral coloque aí a correção da Yael").
   O mesmo desenho e as mesmas caras do curso: feliz no acerto e "quase" no
   erro, que nunca é castigo. A `key` reinicia a animação a cada resposta.
   Decorativa: quem fala é o texto ao lado. */

import type { ReactNode } from 'react';
import { Yael } from '@/components/aventura/Yael';

export function ComYael({ certo, vez = 0, children }: { certo: boolean; vez?: number; children: ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <Yael key={`${certo ? 'feliz' : 'quase'}-${vez}`} humor={certo ? 'feliz' : 'quase'}
            className="w-[52px] sm:w-[58px] shrink-0 -mt-1" />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

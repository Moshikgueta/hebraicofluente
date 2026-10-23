/* A ficha comum dos produtos (23/10/2026, pedido do dono).
 * ─────────────────────────────────────────────────────────────────────────
 * O curso, o livro e o Raízes servem a vontades diferentes, mas quem compara
 * faz as mesmas cinco perguntas: para quem é, o que eu passo a conseguir, em
 * que formato, quanto tempo leva e se dá para comprar agora. A ficha responde
 * as cinco, na mesma ordem, nos três. Não é tabela de planos: cada produto tem
 * a sua ficha, na página dele, e nenhum é posto ao lado do outro como "melhor".
 *
 * Situação: o preço só aparece no produto à venda (lido de lib/vitrine.ts,
 * o mesmo que o checkout cobra). Produto "Em breve" diz isso e nada mais: sem
 * preço, sem data inventada, sem botão de compra (tests/portal.test.ts).
 */

import { brl, flagship } from '@/lib/catalog';
import { empresa } from '@/lib/empresa';
import { vendavel, type Produto } from '@/lib/ecossistema';
import { precoDeVitrine } from '@/lib/vitrine';
import { SeloDoStatus } from '@/components/portal/Jornada';

export function FichaDoProduto({ p, titulo = 'A ficha' }: { p: Produto; titulo?: string }) {
  const { paraQuem, consegue, tempo } = p.ficha;
  const id = `ficha-${p.id}`;
  const linhas: { rotulo: string; valor: React.ReactNode }[] = [];
  if (paraQuem.length) linhas.push({ rotulo: 'Para quem é', valor: <Lista itens={paraQuem} /> });
  if (consegue.length) linhas.push({ rotulo: 'O que você passa a conseguir', valor: <Lista itens={consegue} /> });
  linhas.push({ rotulo: 'Formato', valor: <p className="m-0">{p.formato}.</p> });
  if (tempo) linhas.push({ rotulo: 'Quanto tempo', valor: <p className="m-0">{tempo}</p> });
  linhas.push({ rotulo: 'Situação', valor: <Situacao p={p} /> });

  return (
    <section aria-labelledby={id} className="grid gap-5 rounded-[20px] border border-line bg-[var(--card)] p-6 sm:p-9
                                             shadow-[0_24px_60px_-44px_rgba(6,42,48,.5)]">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 id={id} className="m-0 font-display text-[clamp(22px,2.4vw,28px)] font-semibold tracking-[-0.02em] text-ink">
          {titulo}
        </h2>
        <span className="font-ui text-[14px] text-ink-muted">{p.nome}</span>
      </div>
      <dl className="grid m-0 border-t border-line">
        {linhas.map(l => (
          <div key={l.rotulo} className="grid gap-1.5 sm:grid-cols-[200px_minmax(0,1fr)] sm:gap-6 py-4 border-b border-line last:border-0">
            <dt className="font-ui text-[12.5px] font-semibold uppercase tracking-[.1em] text-[var(--teal-ink)] sm:pt-[3px]">{l.rotulo}</dt>
            <dd className="m-0 min-w-0 font-ui text-[16px] leading-[1.6] text-ink-body">{l.valor}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function Lista({ itens }: { itens: string[] }) {
  return (
    <ul className="grid gap-1.5 list-none p-0 m-0">
      {itens.map(i => (
        <li key={i} className="flex gap-3">
          <span aria-hidden className="mt-[10px] w-[5px] h-[5px] rounded-full bg-[var(--gold)] shrink-0" />
          <span className="min-w-0">{i}</span>
        </li>
      ))}
    </ul>
  );
}

function Situacao({ p }: { p: Produto }) {
  if (!vendavel(p)) {
    return (
      <p className="m-0 flex flex-wrap items-center gap-3">
        <SeloDoStatus status={p.status} />
        <span>Ainda não está à venda. Sem data marcada.</span>
      </p>
    );
  }
  /* Hoje só o curso de alfabetização está à venda; o preço e o prazo são os
     dele, lidos do catálogo. Um segundo produto à venda pede o preço dele aqui. */
  return (
    <p className="m-0 flex flex-wrap items-center gap-3">
      <SeloDoStatus status={p.status} />
      <span>
        <strong className="font-semibold text-ink">{brl(precoDeVitrine())}</strong>, pagamento único,{' '}
        {flagship().accessMonths} meses de acesso, {empresa.politicas.arrependimentoDias} dias para desistir.
      </span>
    </p>
  );
}

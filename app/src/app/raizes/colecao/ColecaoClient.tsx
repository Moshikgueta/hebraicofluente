'use client';

/* A coleção pessoal: o que o aluno guardou (artefatos, curiosidades, lugares,
 * rotas, personagens, termos). Guardar e tirar daqui é o mesmo botão. */

import Link from 'next/link';
import { useProgress } from '@/lib/state/store';
import { raizes } from '@/lib/raizes';
import { itemPorChave, rotuloDoTipo, type ItemDoIndice } from '@/lib/raizes-jornada';
import { Guardar } from '@/components/raizes/Guardar';
import { SemConteudo } from '@/app/raizes/RaizesHomeClient';

export function ColecaoClient() {
  const p = useProgress();
  const r = raizes();
  if (r.semConteudo) return <SemConteudo />;
  const itens = Object.entries(p.state.raizes?.colecao ?? {})
    .filter(([, v]) => v.ativo)
    .sort((a, b) => (a[1].em < b[1].em ? 1 : -1))
    .map(([chave]) => ({ chave, item: itemPorChave(chave) }));
  const achados = itens.filter((x): x is { chave: string; item: ItemDoIndice } => !!x.item);

  return (
    <div className="grid gap-6 pt-8">
      <header className="grid gap-3">
        <p className="rz-rot ocre m-0">Raízes Sefarditas · Coleção</p>
        <h1 className="rz-pagina">Sua coleção</h1>
        <p className="rz-entrada m-0">
          {achados.length ? `${achados.length} ite${achados.length === 1 ? 'm guardado' : 'ns guardados'}.` : 'Ainda vazia.'} Guarde artefatos, curiosidades, lugares, rotas, personagens e termos pelo botão "Guardar na coleção".
        </p>
      </header>
      {achados.length > 0 ? (
        <ul className="rz-lista">
          {achados.map(({ chave, item }) => (
            <li key={chave} className="grid gap-1.5 py-3">
              <Link href={item.rota} prefetch={false} className="grid gap-0.5 no-underline">
                <span className="rz-rot !text-[10.5px]">{rotuloDoTipo(item.tipo)}</span>
                <span className="rz-serif text-[18px] leading-snug text-[var(--titulo)]">{item.titulo}</span>
                <span className="font-ui text-[13.5px] leading-snug text-[var(--corpo)] line-clamp-2">{item.resumo}</span>
              </Link>
              <Guardar chave={chave} className="justify-self-start" />
            </li>
          ))}
        </ul>
      ) : (
        <p className="m-0 flex flex-wrap gap-x-4 gap-y-2">
          <Link href="/raizes/atlas" prefetch={false} className="rz-link">Explorar o Atlas</Link>
          <Link href="/raizes/personagens" prefetch={false} className="rz-link">Conhecer personagens</Link>
          <Link href="/raizes/glossario" prefetch={false} className="rz-link">Ler o glossário</Link>
        </p>
      )}
    </div>
  );
}

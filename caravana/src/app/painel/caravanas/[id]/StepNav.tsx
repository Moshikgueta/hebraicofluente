'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { cx } from '@/components/ui';

const STEPS = [
  ['geral', 'Informações gerais'],
  ['identidade', 'Identidade visual'],
  ['roteiro', 'Roteiro'],
  ['conteudo', 'Conteúdo cultural'],
  ['atividades', 'Atividades'],
  ['informacoes', 'Informações úteis'],
  ['publicacao', 'Revisão e publicação'],
  ['convites', 'Convites'],
] as const;

export function StepNav({ base }: { base: string }) {
  const pathname = usePathname();
  const nav = useRef<HTMLElement>(null);
  // No celular a faixa rola: a etapa atual fica sempre a vista.
  useEffect(() => {
    nav.current?.querySelector('[aria-current="step"]')?.scrollIntoView({ block: 'nearest', inline: 'center' });
  }, [pathname]);
  return (
    <nav ref={nav} aria-label="Etapas da caravana" className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <ol className="flex min-w-max gap-1 border-b border-stone-200">
        {STEPS.map(([slug, label], i) => {
          const href = `${base}/${slug}`;
          const active = pathname === href || (slug === 'publicacao' && pathname === `${base}/previa`);
          return (
            <li key={slug}>
              <Link
                href={href}
                aria-current={active ? 'step' : undefined}
                className={cx(
                  '-mb-px flex items-center gap-2 border-b-2 px-3 py-2.5 text-small font-semibold transition',
                  active ? 'border-sea text-ink' : 'border-transparent text-stone-600 hover:text-ink',
                )}
              >
                <span className={cx('tabular grid h-5 w-5 place-items-center rounded-full text-[0.68rem]', active ? 'bg-sea text-paper' : 'bg-stone-200 text-stone-700')}>{i + 1}</span>
                {label}
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

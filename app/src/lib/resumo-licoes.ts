/* O resumo das lições de um módulo, contado dos dados (CONT-008). */

/* "Este módulo tem 7 lições: 3 de letra nova, 4 de som." - das lições do
   módulo, como modules.json as declara. */
import { fmt } from '@/i18n';
import { tx } from '@/i18n/telas/motor-resumo-licoes';

const porExtenso = (n: number) => tx.porExtenso(n);

export function resumoDasLicoes(lessons: readonly { letters?: readonly string[] | null; som?: string | null; kind?: string | null }[]): string {
  const total = lessons.length;
  const letra = lessons.filter(l => l.letters?.length).length;
  const som = lessons.filter(l => !!l.som).length;
  const pratica = lessons.filter(l => l.kind === 'practice').length;
  const outras = total - letra - som - pratica;
  const partes = [
    letra ? fmt(tx.letraNova, { n: porExtenso(letra) }) : '',
    som ? fmt(tx.som, { n: porExtenso(som) }) : '',
    outras ? fmt(tx.leitura, { n: porExtenso(outras) }) : '',
    pratica ? fmt(tx.pratica, { n: porExtenso(pratica) }) : ''
  ].filter(Boolean);
  const lista = partes.length > 1
    ? tx.lista(partes.slice(0, -1).join(', '), partes[partes.length - 1]!)
    : partes[0] ?? '';
  return tx.resumo(porExtenso(total), total, lista);
}

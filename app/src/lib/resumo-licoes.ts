/* O resumo das lições de um módulo, contado dos dados (CONT-008). */

/* "Este módulo tem 7 lições: 3 de letra nova, 4 de som." - das lições do
   módulo, como modules.json as declara. */
const porExtenso = (n: number) =>
  ['nenhuma', 'uma', 'duas', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'][n] ?? String(n);

export function resumoDasLicoes(lessons: readonly { letters?: readonly string[] | null; som?: string | null; kind?: string | null }[]): string {
  const total = lessons.length;
  const letra = lessons.filter(l => l.letters?.length).length;
  const som = lessons.filter(l => !!l.som).length;
  const pratica = lessons.filter(l => l.kind === 'practice').length;
  const outras = total - letra - som - pratica;
  const partes = [
    letra ? `${porExtenso(letra)} de letra nova` : '',
    som ? `${porExtenso(som)} de som` : '',
    outras ? `${porExtenso(outras)} de leitura` : '',
    pratica ? `${porExtenso(pratica)} de prática, sem letra nova` : ''
  ].filter(Boolean);
  const lista = partes.length > 1
    ? `${partes.slice(0, -1).join(', ')} e ${partes[partes.length - 1]}`
    : partes[0] ?? '';
  return `Este módulo tem ${porExtenso(total)} ${total === 1 ? 'lição' : 'lições'}${lista ? `: ${lista}` : ''}.`;
}

// O que muda para o viajante entre a versao publicada e o rascunho. A tela de
// publicacao mostra isto antes do botao: datas, dias e paradas e informacoes
// praticas sao o que mais confunde quem ja leu a versao anterior.

import type { Snapshot } from './snapshot';

export type Change = { important: boolean; text: string };

// O jsonb do Postgres reordena as chaves: comparar com JSON.stringify acusaria
// mudanca onde nao ha. Esta versao ordena as chaves antes.
export function canonical(v: unknown): string {
  if (Array.isArray(v)) return `[${v.map(canonical).join(',')}]`;
  if (v && typeof v === 'object') {
    return `{${Object.keys(v as Record<string, unknown>)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${canonical((v as Record<string, unknown>)[k])}`)
      .join(',')}}`;
  }
  return JSON.stringify(v) ?? 'null';
}

export function diffSnapshots(prev: Snapshot | null, next: Snapshot): Change[] {
  if (!prev) return [{ important: false, text: 'Primeira publicação: os viajantes passam a ver a caravana.' }];
  const out: Change[] = [];
  const pc = prev.caravan;
  const nc = next.caravan;
  if (pc.startDate !== nc.startDate || pc.endDate !== nc.endDate) out.push({ important: true, text: `As datas mudam de ${pc.startDate} a ${pc.endDate} para ${nc.startDate} a ${nc.endDate}.` });
  if (pc.name !== nc.name) out.push({ important: false, text: `O nome muda para "${nc.name}".` });
  if (prev.days.length !== next.days.length) out.push({ important: true, text: `O roteiro passa de ${prev.days.length} para ${next.days.length} dias.` });
  for (const d of next.days) {
    const old = prev.days.find((x) => x.number === d.number);
    if (!old) continue;
    if (old.title !== d.title) out.push({ important: true, text: `Dia ${d.number}: o título muda de "${old.title}" para "${d.title}".` });
    const oldStops = old.stops.map((s) => `${s.timeLabel ?? ''}|${s.title}`).join('/');
    const newStops = d.stops.map((s) => `${s.timeLabel ?? ''}|${s.title}`).join('/');
    if (oldStops !== newStops) out.push({ important: true, text: `Dia ${d.number}: paradas ou horários alterados.` });
    if ((old.practicalNotes ?? '') !== (d.practicalNotes ?? '')) out.push({ important: false, text: `Dia ${d.number}: orientações práticas alteradas.` });
  }
  const infoKey = (s: Snapshot) => s.info.map((i) => `${i.section}|${i.title}|${i.body}|${i.contactValue ?? ''}`).sort().join('\n');
  if (infoKey(prev) !== infoKey(next)) out.push({ important: true, text: 'Informações úteis alteradas (contatos, hotéis, pontos de encontro ou orientações).' });
  const destKey = (s: Snapshot) => s.destinations.map((d) => `${d.slug}@${d.revision ?? 0}`).sort().join(',');
  if (destKey(prev) !== destKey(next)) out.push({ important: false, text: 'Conteúdos culturais alterados ou atualizados pela biblioteca.' });
  const featKey = (s: Snapshot) => canonical(s.caravan.features);
  if (featKey(prev) !== featKey(next)) out.push({ important: false, text: 'Atividades ou passaporte ligados ou desligados.' });
  if (prev.activities.length !== next.activities.length) out.push({ important: false, text: `Atividades: de ${prev.activities.length} para ${next.activities.length}.` });
  if (canonical(prev.agency) !== canonical(next.agency) || pc.coverArt !== nc.coverArt || pc.welcomeMessage !== nc.welcomeMessage) {
    out.push({ important: false, text: 'Identidade visual ou mensagens alteradas.' });
  }
  return out;
}

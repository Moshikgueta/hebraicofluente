/* Meu domínio das letras: o que o aluno SABE, separado do que ele CONCLUIU
 * (11/10/2026).
 * ─────────────────────────────────────────────────────────────────────────
 * Concluir a lição é passar pelas cinco etapas. Dominar a letra é outra
 * coisa, e aqui ela é medida em três habilidades, com os dados que os
 * exercícios com nota e a revisão já gravam em `state.skills`
 * (lib/state/rules.ts, `recordSkill`):
 *
 *   forma    reconhecer o desenho          ← skill `rec`
 *   som      ligar a letra ao som          ← skills `som` e `ouvir`
 *   leitura  achar e ler a letra na palavra ← skill `ler`
 *
 * A escrita à mão fica de fora de propósito: ela tem a sua própria medida
 * (o traçado), e uma letra não deixa de estar dominada na LEITURA porque a
 * mão ainda treme.
 *
 * ── como um nível é decidido ──────────────────────────────────────────────
 * Não é só a porcentagem de acerto. Contam três coisas, e os limites estão
 * em LIMIARES, num lugar só, para serem ajustados:
 *   · quantas respostas existem (com poucas, a tela diz "poucos dados" em
 *     vez de inventar um nível);
 *   · os acertos SEGUIDOS mais recentes (um erro zera: é o sinal honesto de
 *     que algo foi reaprendido, e não só visto muitas vezes);
 *   · em quantos DIAS diferentes houve acerto (quatro acertos numa tarde só
 *     não provam que a letra ficou). Registros de antes de 11/10/2026 não têm
 *     esse campo, e para eles este critério não se aplica.
 */

import type { LearnerState, SkillStat } from '@/lib/state/types';

export type HabilidadeDeLeitura = 'forma' | 'som' | 'leitura';

export const HABILIDADES: readonly { id: HabilidadeDeLeitura; tituloPt: string; descricaoPt: string; resumoPt: string }[] = [
  { id: 'forma', tituloPt: 'Reconhecimento visual', descricaoPt: 'Identificar a forma da letra.',
    resumoPt: 'identificar a forma da letra' },
  { id: 'som', tituloPt: 'Reconhecimento sonoro', descricaoPt: 'Associar a letra ao seu som.',
    resumoPt: 'associar a letra ao som' },
  /* O id interno continua `leitura`; na tela é "Leitura em palavras". */
  { id: 'leitura', tituloPt: 'Leitura em palavras', descricaoPt: 'Reconhecer e ler a letra dentro de palavras.',
    resumoPt: 'reconhecer e ler a letra dentro de palavras' }
];

export type NivelDeDominio = 'poucos-dados' | 'aprendendo' | 'desenvolvimento' | 'quase' | 'dominada';

export const NIVEL_PT: Record<NivelDeDominio, string> = {
  'poucos-dados': 'Dados insuficientes',
  aprendendo: 'Ainda aprendendo',
  desenvolvimento: 'Em desenvolvimento',
  quase: 'Quase dominada',
  dominada: 'Dominada'
};

/** Os limites. Mudar aqui muda a tela inteira e os testes dizem o que mudou. */
export const LIMIARES = {
  /** Abaixo disto, "poucos dados". */
  minimoDeRespostas: 4,
  dominada: { seguidos: 4, acerto: 0.8, dias: 2 },
  quase: { seguidos: 3, acerto: 0.7 },
  desenvolvimento: { seguidos: 1, acerto: 0.5 }
} as const;

/** Duas estatísticas somadas (o som tem duas fontes: `som` e `ouvir`). */
function somar(stats: readonly (SkillStat | undefined)[]): SkillStat | null {
  const xs = stats.filter((s): s is SkillStat => !!s && s.hits + s.misses > 0);
  if (!xs.length) return null;
  const recente = [...xs].sort((a, b) => (b.lastOn ?? '').localeCompare(a.lastOn ?? ''))[0]!;
  const comDias = xs.filter(s => s.diasDeAcerto !== undefined);
  return {
    hits: xs.reduce((n, s) => n + s.hits, 0),
    misses: xs.reduce((n, s) => n + s.misses, 0),
    /* A sequência que vale é a da fonte respondida por último. */
    streak: recente.streak,
    lastOn: recente.lastOn,
    ...(comDias.length ? { diasDeAcerto: Math.max(...comDias.map(s => s.diasDeAcerto!)) } : {})
  };
}

export function nivelDaHabilidade(stat: SkillStat | null): NivelDeDominio {
  if (!stat) return 'poucos-dados';
  const total = stat.hits + stat.misses;
  if (total < LIMIARES.minimoDeRespostas) return 'poucos-dados';
  const acerto = stat.hits / total;
  const L = LIMIARES;
  const diasOk = stat.diasDeAcerto === undefined || stat.diasDeAcerto >= L.dominada.dias;
  if (stat.streak >= L.dominada.seguidos && acerto >= L.dominada.acerto && diasOk) return 'dominada';
  if (stat.streak >= L.quase.seguidos && acerto >= L.quase.acerto) return 'quase';
  if (stat.streak >= L.desenvolvimento.seguidos && acerto >= L.desenvolvimento.acerto) return 'desenvolvimento';
  return 'aprendendo';
}

const ORDEM: Record<NivelDeDominio, number> = {
  aprendendo: 0, desenvolvimento: 1, quase: 2, dominada: 3, 'poucos-dados': 4
};

export type DominioDaLetra = {
  letterId: string;
  habilidades: Record<HabilidadeDeLeitura, NivelDeDominio>;
  /** A habilidade mais fraca COM dados; sem dados em nenhuma, "poucos dados". */
  geral: NivelDeDominio;
  /** A habilidade a praticar primeiro, quando há uma abaixo de "dominada". */
  praticar: HabilidadeDeLeitura | null;
};

export function dominioDaLetra(state: LearnerState, letterId: string): DominioDaLetra {
  const s = state.skills?.[letterId] ?? {};
  const habilidades: Record<HabilidadeDeLeitura, NivelDeDominio> = {
    forma: nivelDaHabilidade(somar([s.rec])),
    som: nivelDaHabilidade(somar([s.som, s.ouvir])),
    leitura: nivelDaHabilidade(somar([s.ler]))
  };
  const comDados = HABILIDADES.filter(h => habilidades[h.id] !== 'poucos-dados');
  const fraca = [...comDados].sort((a, b) => ORDEM[habilidades[a.id]] - ORDEM[habilidades[b.id]])[0];
  const geral = fraca ? habilidades[fraca.id] : 'poucos-dados';
  return {
    letterId, habilidades, geral,
    praticar: fraca && habilidades[fraca.id] !== 'dominada' ? fraca.id : null
  };
}

export type ResumoDoDominio = {
  letras: DominioDaLetra[];
  contagem: Record<NivelDeDominio, number>;
  /** Até três letras para praticar, as mais fracas primeiro. */
  paraPraticar: DominioDaLetra[];
};

/** O domínio das letras que o aluno já começou (alguma etapa feita). */
export function resumoDoDominio(state: LearnerState, letterIds: readonly string[]): ResumoDoDominio {
  const letras = letterIds
    .filter(id => (state.lessons?.[id]?.stagesDone.length ?? 0) > 0 || state.skills?.[id])
    .map(id => dominioDaLetra(state, id));
  const contagem: Record<NivelDeDominio, number> = {
    'poucos-dados': 0, aprendendo: 0, desenvolvimento: 0, quase: 0, dominada: 0
  };
  for (const l of letras) contagem[l.geral]++;
  const paraPraticar = letras
    .filter(l => l.geral === 'aprendendo' || l.geral === 'desenvolvimento')
    .sort((a, b) => ORDEM[a.geral] - ORDEM[b.geral])
    .slice(0, 3);
  return { letras, contagem, paraPraticar };
}

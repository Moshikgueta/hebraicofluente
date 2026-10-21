// O que uma caravana oferece = o que a agencia ligou E o que o plano permite.
// A conta e feita no servidor, na publicacao: o retrato ja nasce sem o que o
// plano nao cobre, entao nao ha botao escondido para reativar pelo navegador.

import type { CaravanFeatures } from '../db/schema';

export const TOGGLES: { key: keyof CaravanFeatures; label: string; planFeature: string; hint: string }[] = [
  { key: 'hebrew', label: 'Hebraico para a viagem', planFeature: 'hebrew', hint: 'Expressões por situação, com transliteração e prática.' },
  { key: 'quizzes', label: 'Quizzes dos destinos', planFeature: 'quizzes', hint: 'Perguntas sobre os lugares do roteiro.' },
  { key: 'challenges', label: 'Desafios culturais', planFeature: 'challenges', hint: 'Perguntas sobre o dia a dia em Israel.' },
  { key: 'passport', label: 'Passaporte digital', planFeature: 'passport', hint: 'Selos por atividade concluída.' },
];

export function effectiveFeatures(features: CaravanFeatures, planFeatures: readonly string[]): CaravanFeatures {
  const out = { ...features };
  for (const t of TOGGLES) out[t.key] = Boolean(features[t.key]) && planFeatures.includes(t.planFeature);
  return out;
}

export function activityFeatureEnabled(feature: string, f: CaravanFeatures): boolean {
  if (feature === 'hebrew') return f.hebrew;
  if (feature === 'quizzes') return f.quizzes;
  if (feature === 'challenges') return f.challenges;
  return false;
}

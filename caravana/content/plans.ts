// Planos comerciais. Os precos sao hipoteses de lancamento e podem mudar; o
// que vale para cobrar e o registro na tabela `plans`, editavel pelo
// superadministrador. Nenhuma cobranca e feita pela plataforma nesta etapa.

export const FEATURE_LABEL: Record<string, string> = {
  itinerary: 'Roteiro digital',
  branding: 'Identidade visual da agência',
  info: 'Informações práticas',
  culture: 'Conteúdo cultural selecionado',
  hebrew: 'Hebraico interativo',
  audio: 'Áudios de pronúncia',
  quizzes: 'Quizzes',
  challenges: 'Desafios',
  passport: 'Passaporte digital',
  extended_branding: 'Personalização ampliada',
  custom_message: 'Mensagem personalizada',
};

const ESSENCIAL = ['itinerary', 'branding', 'info', 'culture'];
const COMPLETA = [...ESSENCIAL, 'hebrew', 'audio', 'quizzes', 'challenges', 'passport'];

export const plans = [
  { id: 'essencial', name: 'Essencial', priceCents: 1990, priceUnit: 'participant', groupSize: null, features: ESSENCIAL },
  { id: 'completa', name: 'Experiência Completa', priceCents: 3990, priceUnit: 'participant', groupSize: null, features: COMPLETA },
  {
    id: 'white_label',
    name: 'White-label Premium',
    priceCents: 199000,
    priceUnit: 'group',
    groupSize: 50,
    features: [...COMPLETA, 'extended_branding', 'custom_message'],
  },
] as const;

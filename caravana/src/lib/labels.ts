// Rotulos do painel.

export const STATUS: Record<string, { label: string; tone: 'success' | 'neutral' | 'warning' }> = {
  published: { label: 'Publicada', tone: 'success' },
  draft: { label: 'Rascunho', tone: 'warning' },
  archived: { label: 'Arquivada', tone: 'neutral' },
};

export const EDITORIAL: Record<string, { label: string; tone: 'success' | 'neutral' | 'warning' | 'ochre' }> = {
  approved: { label: 'Aprovado', tone: 'success' },
  in_review: { label: 'Em revisão', tone: 'ochre' },
  draft: { label: 'Rascunho', tone: 'warning' },
  placeholder: { label: 'Em preparação', tone: 'neutral' },
};

export const ROLE_LABEL: Record<string, string> = { owner: 'Responsável', admin: 'Administrador', editor: 'Editor', viewer: 'Leitura' };

export const PLAN_LABEL: Record<string, string> = { essencial: 'Essencial', completa: 'Experiência Completa', white_label: 'White-label Premium' };

export const ACTION_LABEL: Record<string, string> = {
  'auth.login': 'Entrada no painel',
  'auth.set_password': 'Senha definida',
  'caravan.create': 'Caravana criada',
  'caravan.publish': 'Caravana publicada',
  'caravan.unpublish': 'Caravana despublicada',
  'caravan.archive': 'Caravana arquivada',
  'caravan.dates': 'Datas alteradas',
  'caravan.branding': 'Identidade visual alterada',
  'caravan.contents': 'Conteúdos selecionados',
  'caravan.features': 'Atividades ajustadas',
  'invite.create': 'Convites criados',
  'invite.revoke': 'Convite revogado',
  'invite.reset_devices': 'Aparelhos liberados',
  'day.delete': 'Dia removido do roteiro',
  'agency.branding': 'Identidade da agência alterada',
  'agency.create': 'Agência criada',
  'agency.contract': 'Contrato alterado',
  'agency.user': 'Acesso de equipe criado',
  'caravan.seats': 'Vagas da caravana alteradas',
  'library.content': 'Texto da biblioteca editado',
  'library.status': 'Situação editorial alterada',
  'hebrew.review': 'Revisão de hebraico registrada',
  'activity.status': 'Situação de atividade alterada',
  'plan.update': 'Plano alterado',
};

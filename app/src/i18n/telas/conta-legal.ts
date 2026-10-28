import type { Traducao } from '..';

/* components/legal/Legal.tsx: as peças comuns às políticas */
const pt = {
  ultimaAtualizacao: (data: string) => `Última atualização: ${data}`,
  ctaTitulo: 'Tudo isso respondido? Então comece.',
  ctaLinha:
    'A primeira letra leva dez minutos, e você tem sete dias para desistir sem precisar explicar por quê.',
  termosDeUso: 'Termos de Uso',
  politicaDePrivacidade: 'Política de Privacidade',
  reembolso: 'Reembolso e Cancelamento',
  acessibilidade: 'Acessibilidade',
  duvidasFrequentes: 'Dúvidas frequentes',
  quemOferece: 'Quem oferece este serviço',
  fornecedor: 'Fornecedor',
  cnpj: 'CNPJ',
  endereco: 'Endereço',
  atendimento: 'Atendimento',
  telefone: 'Telefone',
  whatsapp: 'WhatsApp',
  horario: 'Horário',
  prazoDeResposta: 'Prazo de resposta',
  cnpjNumero: (numero: string) => `CNPJ ${numero}`,
  quemOfereceCurto: (partes: string) => `Quem oferece este serviço: ${partes}.`
} as const;

/* etapa 5/6: Brasil, rever - identificação do fornecedor (CNPJ) e o prazo de
   desistência do CDC; o site em inglês terá políticas próprias. */
const en: Traducao<typeof pt> = {
  ultimaAtualizacao: (data: string) => `Last updated: ${data}`,
  ctaTitulo: 'All of that answered? Then get started.',
  ctaLinha:
    'The first letter takes ten minutes, and you have seven days to cancel without having to explain why.',
  termosDeUso: 'Terms of Use',
  politicaDePrivacidade: 'Privacy Policy',
  reembolso: 'Refunds and Cancellation',
  acessibilidade: 'Accessibility',
  duvidasFrequentes: 'FAQ',
  quemOferece: 'Who provides this service',
  fornecedor: 'Provider',
  cnpj: 'CNPJ',
  endereco: 'Address',
  atendimento: 'Support',
  telefone: 'Phone',
  whatsapp: 'WhatsApp',
  horario: 'Hours',
  prazoDeResposta: 'Response time',
  cnpjNumero: (numero: string) => `CNPJ ${numero}`,
  quemOfereceCurto: (partes: string) => `Who provides this service: ${partes}.`
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;

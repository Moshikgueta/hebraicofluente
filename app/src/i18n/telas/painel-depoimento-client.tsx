import type { ReactNode } from 'react';
import type { Traducao } from '..';

/* app/depoimento/DepoimentoClient.tsx - o formulário do depoimento do aluno.
   A assinatura da prévia ("Aluno do curso", iniciais) sai de lib/depoimento.ts. */
type Link = (texto: string) => ReactNode;

const pt = {
  estadoNovo: 'Recebido. O dono do curso ainda vai ler.',
  estadoAprovado: 'Lido e aprovado para publicação.',
  estadoRecusado: 'Lido. Este texto não vai ser publicado, mas continua valendo como opinião para o curso.',
  erroEnviar: 'Não deu para enviar agora. Tente de novo em instantes.',
  obrigadoAutorizado: 'Obrigado! Recebemos o seu depoimento e a sua autorização.',
  obrigadoPrivado: 'Obrigado! Recebemos o seu depoimento. Ele fica só para o dono do curso ler.',
  erroInternet: 'Não deu para enviar agora. Confira a internet e tente de novo.',
  retirado: 'Pronto: o depoimento e a autorização foram apagados.',
  erroRetirar: 'Não deu para retirar agora. Tente de novo em instantes.',

  voltar: '← Meu hebraico',
  titulo: 'Conte como está sendo',
  intro: 'O seu depoimento ajuda o curso a melhorar e ajuda quem está pensando em começar. Escreva do seu jeito, com o que foi bom e com o que não foi.',
  seuDepoimento: 'Seu depoimento',
  oSeuDepoimento: 'O seu depoimento',
  dicas: 'Se ajudar, responda a uma destas: por que você quis aprender a ler hebraico? O que você já consegue ler hoje que não conseguia antes? O que mais ajudou, ou o que poderia ser melhor?',
  contagem: '{n} de {max} caracteres',
  minimo: ' (mínimo {min})',

  comoAssinar: 'Como assinar, se for publicado',
  formaNome: 'Com o meu nome (e a cidade, se eu quiser)',
  formaIniciais: 'Só com as iniciais do nome',
  formaAnonimo: 'Sem nome: "Aluno do curso"',
  nomeIniciais: 'Nome (só as iniciais aparecem)',
  nomeQueAparece: 'Nome que aparece',
  cidade: 'Cidade (opcional)',
  comoApareceria: 'Como apareceria',

  autorizo: 'Autorizo o Hebraico Fluente a publicar este depoimento, do jeito que está na prévia acima, no site e em materiais de divulgação do curso, sem pagamento. Posso retirar a autorização quando quiser, nesta mesma página.',
  aceitoEmail: 'Aceito receber um e-mail do dono do curso sobre este depoimento.',
  regras: (link: Link) => <>Sem a autorização, o texto fica só para o dono do curso ler. Publicamos o texto como você escreveu, sem trocar nenhuma palavra; se ele precisar ser encurtado, o corte aparece marcado com [...]. Se você retirar a autorização, o depoimento sai de onde estiver publicado em até 7 dias. Mais detalhes na {link('Política de Privacidade')}.</>,

  enviando: 'Enviando…',
  salvarMudancas: 'Salvar as mudanças',
  enviar: 'Enviar o depoimento',
  retirarTitulo: 'Retirar o depoimento',
  retirarTexto: 'Apaga o texto e a autorização. Se ele estiver publicado, sai em até 7 dias.',
  simRetirar: 'Sim, retirar',
  cancelar: 'Cancelar'
} as const;

const en: Traducao<typeof pt> = {
  estadoNovo: 'Received. The course author has not read it yet.',
  estadoAprovado: 'Read and approved for publication.',
  estadoRecusado: 'Read. This text will not be published, but it still counts as feedback for the course.',
  erroEnviar: 'Could not send right now. Please try again in a moment.',
  obrigadoAutorizado: 'Thank you! We received your testimonial and your permission.',
  obrigadoPrivado: 'Thank you! We received your testimonial. Only the course author will read it.',
  erroInternet: 'Could not send right now. Check your internet connection and try again.',
  retirado: 'Done: the testimonial and the permission were deleted.',
  erroRetirar: 'Could not withdraw it right now. Please try again in a moment.',

  voltar: '← My Hebrew',
  titulo: 'Tell us how it is going',
  intro: 'Your testimonial helps the course improve and helps people who are thinking about starting. Write it your own way, with what went well and what did not.',
  seuDepoimento: 'Your testimonial',
  oSeuDepoimento: 'Your testimonial',
  dicas: 'If it helps, answer one of these: why did you want to learn to read Hebrew? What can you read today that you could not before? What helped the most, or what could be better?',
  contagem: '{n} of {max} characters',
  minimo: ' (minimum {min})',

  comoAssinar: 'How to sign it, if it is published',
  formaNome: 'With my name (and my city, if I want)',
  formaIniciais: 'Only with my initials',
  formaAnonimo: 'No name: "Course student"',
  nomeIniciais: 'Name (only the initials appear)',
  nomeQueAparece: 'Name that appears',
  cidade: 'City (optional)',
  comoApareceria: 'How it would appear',

  autorizo: 'I authorize Hebraico Fluente to publish this testimonial, exactly as shown in the preview above, on the website and in the course\'s promotional materials, without payment. I can withdraw this permission whenever I want, on this same page.',
  aceitoEmail: 'I agree to receive an email from the course author about this testimonial.',
  regras: (link: Link) => <>Without your permission, only the course author reads the text. We publish the text as you wrote it, without changing a single word; if it needs to be shortened, the cut is marked with [...]. If you withdraw your permission, the testimonial is removed from wherever it is published within 7 days. More details in the {link('Privacy Policy')}.</>,

  enviando: 'Sending…',
  salvarMudancas: 'Save changes',
  enviar: 'Send testimonial',
  retirarTitulo: 'Withdraw the testimonial',
  retirarTexto: 'This deletes the text and the permission. If it is published, it comes down within 7 days.',
  simRetirar: 'Yes, withdraw',
  cancelar: 'Cancel'
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;

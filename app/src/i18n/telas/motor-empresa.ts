import type { Traducao } from '..';

/* lib/empresa.ts - as frases de parcelamento, prazo, desistência e renovação
   que várias páginas repetem. */
const pt = {
  parcelas: 'em até {n}x com juros da Mercado Pago',
  parcelasCurto: 'em até {n}x com juros',
  parcelasTotal: 'o valor de cada parcela e o total aparecem na tela da Mercado Pago antes de você confirmar',
  prazoResposta: (n: number): string => `em até ${n} ${n === 1 ? 'dia útil' : 'dias úteis'}`,
  confirmacaoDesistencia: 'Pelo site, a confirmação chega no seu e-mail na hora. Por e-mail, respondemos confirmando o recebimento {prazo}, e vale a data em que você escreveu, não a da nossa resposta.',
  inicioDoAcesso: 'contados da liberação do acesso',
  renovacao: 'Nos últimos {dias} dias de acesso, dá para renovar com uma compra nova, pelo preço do dia. Os {meses} meses da renovação são somados ao fim do acesso atual, e não contados do dia do pagamento: renovar antes não faz perder nenhum dia. Nada é renovado nem cobrado sozinho.',
  duvidasDeConteudo: 'Dúvidas sobre o conteúdo também são bem-vindas por e-mail, no mesmo prazo.',
  oQueOCursoEnsina: 'Este curso ensina a ler e escrever em hebraico. Conversação começa no Hebraico A1, que é um curso à parte.'
} as const;

const en: Traducao<typeof pt> = {
  // etapa 5/6: Brasil, rever
  parcelas: 'in up to {n} installments, with Mercado Pago interest',
  // etapa 5/6: Brasil, rever
  parcelasCurto: 'in up to {n} installments, with interest',
  // etapa 5/6: Brasil, rever
  parcelasTotal: 'the amount of each installment and the total appear on the Mercado Pago screen before you confirm',
  prazoResposta: (n: number): string => `within ${n} ${n === 1 ? 'business day' : 'business days'}`,
  // etapa 5/6: Brasil, rever
  confirmacaoDesistencia: 'On the site, the confirmation reaches your e-mail right away. By e-mail, we reply confirming receipt {prazo}, and what counts is the date you wrote, not the date of our reply.',
  inicioDoAcesso: 'counted from when access is granted',
  renovacao: 'In the last {dias} days of access, you can renew with a new purchase, at the current price. The {meses} months of the renewal are added to the end of your current access, not counted from the payment date: renewing early does not cost you a single day. Nothing is renewed or charged automatically.',
  duvidasDeConteudo: 'Questions about the content are also welcome by e-mail, within the same time frame.',
  oQueOCursoEnsina: 'This course teaches you to read and write Hebrew. Conversation starts in Hebraico A1, which is a separate course.'
};

export const DICIONARIO = { pt, en };
export const tx = process.env.NEXT_PUBLIC_LOCALE === 'en' ? en : pt;

/* O que cada site tem. O mesmo código serve o site brasileiro e o em inglês,
   e algumas partes só fazem sentido em um deles. Ver PLANO-INGLES.md. */
import { LOCALE } from '@/i18n';

/**
 * "Meu nome em hebraico" escreve o nome do aluno com as regras do PORTUGUÊS
 * (lib/nome-hebraico.ts: o ç, o x de Xavier, o "ão" de João). Num nome em
 * inglês o resultado sairia errado, e hebraico gerado pelo código precisa da
 * aprovação do dono. No site em inglês fica desligado (o cartão, a opção do
 * certificado, o item da loja, a conquista e a página) até haver regras para
 * nomes em inglês.
 */
export const MEU_NOME_EM_HEBRAICO = LOCALE !== 'en';

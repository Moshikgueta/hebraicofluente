import type { Metadata } from 'next';
import { Card } from '@/components/ui/Card';
import { LinkButton } from '@/components/ui/Button';
import { Section, SectionHead } from '@/components/platform/Section';
import { flagship, brl, installment, pixPrice } from '@/lib/catalog';
import { course } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Dúvidas frequentes — Hebraico Fluente',
  description:
    'Pagamento, acesso, prazo, celular, áudio, certificado e reembolso — as perguntas ' +
    'que aparecem antes da compra, respondidas sem enrolação.'
};

/* As dúvidas.
 * ─────────────────────────────────────────────────────────────────────────
 * Duas regras de escrita, e as duas custam venda no curto prazo:
 *
 *   1. Toda resposta responde. "Depende", "entre em contato" e "em breve" são
 *      respostas que empurram o problema para o suporte e para a avaliação
 *      ruim depois da compra.
 *   2. O que ainda não existe é dito. Hoje o áudio do curso é sintetizado
 *      pelo próprio navegador, e isso está escrito aqui — porque um aluno que
 *      descobre sozinho acha que foi enganado, e com razão.
 *
 * Preço e prazo vêm do catálogo. Uma FAQ com o preço digitado à mão é a
 * primeira coisa a ficar desatualizada num aumento.
 */

const c = flagship();

const FAQ: { q: string; a: string[] }[] = [
  {
    q: 'Preciso saber alguma coisa de hebraico para começar?',
    a: [
      'Não. O curso começa assumindo que você nunca viu o alfabeto e não sabe nem por onde o texto começa. A primeira lição ensina uma letra só.'
    ]
  },
  {
    q: 'Quanto tempo leva?',
    a: [
      `São ${course.totalLetters} lições de cerca de dez minutos. Quem faz uma por dia termina em menos de um mês; quem faz três por semana leva uns dois. Não há prazo interno nem turma: o curso espera por você.`
    ]
  },
  {
    q: 'Como eu pago?',
    a: [
      `PIX, cartão de crédito à vista ou em até ${installment(c.price).n}x sem juros.`,
      `À vista o curso sai por ${brl(c.price.brl)}${c.price.pixDiscountPct > 0 ? `, ou ${brl(pixPrice(c.price))} no PIX` : ''}. Parcelado, ${installment(c.price).n}x de ${brl(installment(c.price).brl)}.`
    ]
  },
  {
    q: 'Quando o acesso é liberado?',
    a: [
      'No cartão, na hora — a confirmação vem em segundos. No PIX, assim que o pagamento compensa, que costuma levar menos de um minuto.',
      'A liberação é automática. Não existe aprovação manual, e você não precisa mandar comprovante para ninguém.'
    ]
  },
  {
    q: 'Por quanto tempo eu tenho acesso?',
    a: [
      `${c.accessMonths} meses a partir da compra, com tudo que for acrescentado ao curso nesse período.`,
      'Perto do fim, a plataforma avisa — com trinta dias de antecedência, e de novo na última semana.'
    ]
  },
  {
    q: 'Funciona no celular?',
    a: [
      'Foi feito para o celular primeiro. Os exercícios cabem numa mão, os botões são grandes o suficiente para o polegar, e a tela não sai do lugar quando você escreve uma letra com o dedo.',
      'No computador ele vira um painel maior, com o alfabeto inteiro e o progresso à vista de uma vez.'
    ]
  },
  {
    q: 'O curso tem áudio com voz de verdade?',
    a: [
      'Ainda não. Hoje a pronúncia é falada pelo sintetizador do próprio navegador, com voz de espanhol latino quando existe — serve para conferir a sílaba, mas não é uma gravação.',
      'As gravações com falante nativo estão planejadas e entram sem que você precise fazer nada: os mesmos botões passam a tocar o arquivo quando ele existir. Os exercícios que dependem só de escutar ficam marcados como indisponíveis até lá, em vez de te fazerem adivinhar.'
    ]
  },
  {
    q: 'Preciso saber escrever à mão?',
    a: [
      'Não precisa, mas o curso ensina. Você traça a letra com o dedo na tela, na ordem certa dos traços, e recebe uma avaliação do traço — não uma nota, um comentário.',
      'Quem não quiser escrever pode pular essa etapa: ela não bloqueia o resto da lição.'
    ]
  },
  {
    q: 'Meu progresso fica salvo?',
    a: [
      'Fica, e a plataforma volta exatamente na lição e na questão em que você parou.',
      'Uma ressalva honesta: hoje o progresso é guardado no próprio aparelho, não na conta. Ou seja, se você estudar no celular e depois abrir no computador, o progresso não viaja junto — o acesso, sim. Sincronizar entre aparelhos está no plano.'
    ]
  },
  {
    q: 'Tem certificado?',
    a: [
      'Tem, e ele não é por participação. Sai quando duas coisas estiverem feitas: todas as letras concluídas e o exame final aprovado, com pelo menos 70%.',
      'É uma imagem com o seu nome e a data, pronta para postar. Ela diz, na própria imagem, que não é um certificado oficial nem uma avaliação de proficiência reconhecida — porque não é, e quem recebe merece saber.'
    ]
  },
  {
    q: 'E se eu não gostar?',
    a: [
      'O Código de Defesa do Consumidor te dá sete dias para desistir de uma compra feita pela internet, contados a partir do acesso. Dentro desse prazo, basta pedir: o valor volta integral, sem pergunta e sem etapa.',
      'Escreva para contato@hebraicofluente.com.br com o e-mail da compra.'
    ]
  },
  {
    q: 'Vocês vão lançar os outros níveis mesmo?',
    a: [
      'O A1 está em produção e é o próximo. O A2 e o B1 vêm depois, nessa ordem.',
      'Quando saírem, entram na mesma conta e na mesma plataforma — você não recomeça em outro lugar, e o que já fez continua onde está.'
    ]
  }
];

export default function FaqPage() {
  return (
    <>
      <div className="border-b border-[color:var(--line-soft)]">
        <div className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 py-14 sm:py-18 grid gap-5">
          <p className="font-ui text-[12px] uppercase tracking-[.14em] text-[var(--accent)]">
            Dúvidas frequentes
          </p>
          <h1 className="font-display text-[32px] sm:text-[44px] font-bold leading-[1.12] text-ink max-w-[20ch]">
            Perguntado antes de comprar.
          </h1>
          <p className="text-[17px] leading-relaxed text-ink-body max-w-[54ch]">
            Inclusive o que ainda não está pronto. Preferimos perder uma venda
            aqui a perder a confiança depois.
          </p>
        </div>
      </div>

      <Section labelledBy="perguntas">
        <SectionHead id="perguntas" titlePt="As perguntas." />
        <div className="grid gap-3 max-w-[820px]">
          {FAQ.map(item => (
            <Card key={item.q} as="article" className="overflow-hidden">
              <details className="group">
                <summary
                  className="cursor-pointer list-none px-5 py-4 min-h-[56px] flex items-center gap-4
                             font-display text-[16.5px] font-semibold text-ink
                             hover:bg-surface-2 transition-colors"
                >
                  <span className="flex-1">{item.q}</span>
                  <span aria-hidden
                        className="shrink-0 text-ink-muted text-[15px] transition-transform
                                   group-open:rotate-45">
                    +
                  </span>
                </summary>
                <div className="px-5 pb-5 grid gap-2.5 border-t border-[color:var(--line-soft)] pt-4">
                  {item.a.map(p => (
                    <p key={p} className="font-ui text-[14.5px] leading-relaxed text-ink-body max-w-[64ch]">
                      {p}
                    </p>
                  ))}
                </div>
              </details>
            </Card>
          ))}
        </div>
      </Section>

      <Section tone="wash">
        <Card className="p-8 grid gap-4 justify-items-center text-center">
          <h2 className="font-display text-[25px] sm:text-[30px] font-bold text-ink max-w-[26ch]">
            Ficou alguma pergunta de fora?
          </h2>
          <p className="font-ui text-[15.5px] leading-relaxed text-ink-body max-w-[48ch]">
            Escreva para{' '}
            <a href="mailto:contato@hebraicofluente.com.br"
               className="text-[var(--accent)] hover:underline">
              contato@hebraicofluente.com.br
            </a>
            . Respondemos antes de você comprar, não depois.
          </p>
          <LinkButton href="/cursos/alfabetizacao">Ver o curso</LinkButton>
        </Card>
      </Section>
    </>
  );
}

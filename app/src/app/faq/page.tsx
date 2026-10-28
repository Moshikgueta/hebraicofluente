import type { Metadata } from 'next';
import { meta } from '@/lib/seo';
import Link from 'next/link';
import { PageHead, Section } from '@/components/platform/Section';
import {
  confirmaSozinho, confirmacaoDaDesistencia, DUVIDAS_DE_CONTEUDO, empresa, INICIO_DO_ACESSO,
  O_QUE_O_CURSO_ENSINA, parcelasTexto, prazoResposta, renovacaoTexto, soPix, temCartao, temPix
} from '@/lib/empresa';
import { FaixaCta } from '@/components/platform/ProximoPasso';
import { ancora, flagship, brl, fimDoPreLancamento, getCourse, parcelasMax, pixPrice } from '@/lib/catalog';
import { tempoDoCursoPt } from '@/lib/content-publico';
import { AUDIO_MANIFEST } from '@/lib/audio-manifest';
import { tx } from '@/i18n/telas/venda-faq';

/* O mesmo critério da capa (components/landing/copy.ts): é o manifesto de
   gravações que decide o que se diz sobre áudio, nunca um texto fixo. */
const TEM_AUDIO = AUDIO_MANIFEST.length > 0;

export const metadata: Metadata = meta({
  rota: '/faq',
  title: tx.metaTitulo,
  description: tx.metaDescricao
});

/* As dúvidas.
 * ─────────────────────────────────────────────────────────────────────────
 * Duas regras de escrita, e as duas custam venda no curto prazo:
 *
 *   1. Toda resposta responde. "Depende", "entre em contato" e "em breve" são
 *      respostas que empurram o problema para o suporte e para a avaliação
 *      ruim depois da compra.
 *   2. O que ainda não existe é dito, e o que já existe também. A resposta
 *      sobre áudio dizia que a pronúncia era a voz artificial do navegador,
 *      texto fixo herdado do curso de espanhol, e continuou no ar depois que
 *      o curso ganhou as gravações do professor (auditoria de 28/09/2026,
 *      COM-003). Agora ela sai do manifesto, como na capa, e
 *      tests/vitrine.test.ts impede as frases antigas de voltarem.
 *
 * Preço e prazo vêm do catálogo. Uma FAQ com o preço digitado à mão é a
 * primeira coisa a ficar desatualizada num aumento.
 */

const c = flagship();

/* `link` existe para uma resposta só: a da Bíblia. Ela é longa demais para
   caber aqui sem virar um texto, e curta demais aqui para ser honesta -
   então a resposta curta fica, e o resto mora numa página própria. */
const FAQ: { q: string; a: string[]; link?: { href: string; label: string } }[] = [
  {
    q: tx.saberQ,
    a: [
      tx.saberA
    ]
  },
  {
    /* Dizia `course.totalLetters` lições. São 22 LETRAS e 21 LIÇÕES - duas
       grandezas diferentes, e por azar parecidas, então o erro passou: a capa
       anunciava "21 lições" e esta página, "São 22 lições". Dois números para
       a mesma coisa, na página que se lê logo antes de comprar. A soma agora
       é `totalLicoes()`, uma função só para o site inteiro, e a frase do
       tempo é `tempoDoCursoPt()`, derivada das letras. */
    q: tx.tempoQ,
    a: [
      tx.tempoA(tempoDoCursoPt())
    ]
  },
  /* As duas respostas abaixo mudam com `pagamento.modo` em data/empresa.json,
     e é de propósito: uma FAQ que promete parcelamento no cartão enquanto o
     checkout só aceita PIX é lida ANTES da compra, que é exatamente quando
     ela mais atrapalha - a pessoa decide pelo parcelamento e descobre no
     checkout que ele não existe. */
  {
    q: tx.pagoQ,
    a: soPix()
      ? [
          tx.pagoPix,
          tx.pagoPixPreco(brl(pixPrice(c.price)), c.price.pixDiscountPct, brl(c.price.brl)),
          tx.pagoSemCartao
        ]
      /* E com as formas que a Mercado Pago aceita NESTA publicação
         (`temPix`/`temCartao`, auditoria de 01/10/2026, LEGAL-103): a FAQ
         não pode prometer o desconto do PIX quando o checkout não tem PIX. */
      : [
          temPix() && temCartao()
            ? tx.pagoPixCartao(parcelasTexto(parcelasMax(c.price)))
            : temCartao()
              ? tx.pagoCartao(parcelasTexto(parcelasMax(c.price)))
              : tx.pagoPix,
          tx.pagoAVista(brl(c.price.brl), c.price.pixDiscountPct > 0 && temPix() ? brl(pixPrice(c.price)) : null),
          /* A frase só existe enquanto o preço for promocional: quando o
             listBrl virar null, ela some sozinha. Ver `ancora()`. */
          ...(ancora(c.price)
            ? [tx.pagoPreLancamento(fimDoPreLancamento(c.price), brl(ancora(c.price)!), c.accessMonths)]
            : []),
          /* O valor da parcela não é anunciado aqui de propósito: os juros do
             cartão são repassados, então quem fecha esse número é a operadora.
             Ver `parcelasMax` em lib/catalog.ts. */
          ...(temCartao()
            ? [tx.pagoJuros]
            : [])
        ]
  },
  {
    q: tx.liberadoQ,
    a: confirmaSozinho()
      ? [
          [
            temCartao() ? tx.liberadoCartao : '',
            temPix() ? tx.liberadoPix : ''
          ].filter(Boolean).join(' '),
          tx.liberadoAutomatico
        ]
      : [
          tx.liberadoAMao(empresa.atendimento.prazoRespostaUteis),
          tx.liberadoPrazo(empresa.contato.emailSuporte)
        ]
  },
  {
    q: tx.acessoQ,
    a: [
      tx.acessoMeses(c.accessMonths, INICIO_DO_ACESSO),
      tx.acessoAviso,
      /* LEGAL-121 / PAY-B-011: a renovação soma ao fim do acesso atual. */
      renovacaoTexto(c.accessMonths)
    ]
  },
  /* 28/09/2026 (auditoria, COM-007): o que NÃO vem junto só estava nos
     Termos. É o tipo de expectativa que, frustrada, vira pedido de reembolso -
     então é dito aqui, com as mesmas palavras do art. 1 dos Termos. */
  {
    q: tx.incluidoQ,
    a: [
      /* TEXTO PARA APROVAÇÃO (UXQA-016): DUVIDAS_DE_CONTEUDO em lib/empresa.ts. */
      tx.incluidoA1(DUVIDAS_DE_CONTEUDO),
      tx.incluidoA2
    ]
  },
  /* 01/10/2026 (auditoria, UXQA-010): quem chega pela capa querendo
     conversar na viagem precisa saber antes. TEXTO PARA APROVAÇÃO. */
  {
    q: tx.falarQ,
    a: [
      O_QUE_O_CURSO_ENSINA,
      tx.falarA
    ]
  },
  {
    q: tx.celularQ,
    a: [
      tx.celularA1,
      tx.celularA2
    ]
  },
  {
    q: tx.audioQ,
    a: TEM_AUDIO
      ? [
          tx.audioSim1,
          tx.audioSim2
        ]
      : [
          tx.audioNao1,
          tx.audioNao2
        ]
  },
  {
    q: tx.maoQ,
    a: [
      tx.maoA1,
      tx.maoA2
    ]
  },
  {
    /* Esta resposta já disse o contrário, e continuou dizendo depois de deixar
       de ser verdade: que o progresso morava só no aparelho e que sincronizar
       "estava no plano". O plano virou código - lib/state/worker.ts e as três
       rotas de /api/progress - e o texto ficou para trás, inventando uma
       desvantagem na pergunta que se faz ANTES de comprar. O caso em
       tests/vitrine.test.ts quebra se a frase voltar. */
    q: tx.progressoQ,
    a: [
      tx.progressoA1,
      tx.progressoA2,
      tx.progressoA3,
      tx.progressoA4
    ]
  },
  {
    q: tx.bibliaQ,
    a: [
      tx.bibliaA1,
      tx.bibliaA2
    ],
    link: { href: '/biblia', label: tx.bibliaLink }
  },
  {
    q: tx.certificadoQ,
    a: [
      tx.certificadoA1,
      tx.certificadoA2
    ]
  },
  {
    q: tx.gostarQ,
    a: [
      tx.gostarA1(empresa.politicas.arrependimentoDias, INICIO_DO_ACESSO),
      /* "O estorno é pedido na hora, sozinho" só é verdade com a Mercado
         Pago: no PIX direto a devolução é feita por nós (pay.js, `manual`). */
      tx.gostarA2(confirmaSozinho(), empresa.contato.emailSuporte, confirmacaoDaDesistencia())
    ]
  },
  /* Só onde os outros níveis estão no catálogo: o site em inglês não os tem. */
  ...(getCourse('hebraico-a1') ? [{
    q: tx.niveisQ,
    a: [
      tx.niveisA1,
      tx.niveisA2
    ]
  }] : [])
];

export default function FaqPage() {
  return (
    <>
      {/* O cabeçalho NÃO antecipa objeção.
              ──────────────────────────────────────────────────────────────
              Aqui se lia «Perguntado antes de comprar» e, abaixo, «inclusive
              o que ainda não está pronto - preferimos perder uma venda aqui a
              perder a confiança depois». A intenção era honestidade, e o
              efeito era o contrário: a primeira coisa que o visitante lia
              nesta página era a palavra «venda» e a sugestão de que havia
              algo faltando, antes mesmo de ele ter pensado nisso.

              O conteúdo não mudou - a resposta sobre as gravações continua
              inteira, e a do reembolso também. O que mudou é onde ele mora:
              dentro da pergunta que o pede, e não no título da seção. Uma
              limitação respondida com clareza tranquiliza; a mesma limitação
              anunciada em corpo 44 assusta. */}
      <PageHead
        trilha={[{ nome: tx.trilha }]}
        eyebrowPt={tx.eyebrow}
        titlePt={tx.titulo}
        leadPt={tx.lead}
      />

      <Section labelledBy="perguntas">
        {/* O título visível já é o da página; o h2 fica para o leitor de tela. */}
        <h2 id="perguntas" className="sr-only">{tx.perguntas}</h2>
        {/* Perguntas sob fios, como na capa: um índice que se lê de cima a
            baixo, e não quinze caixas. `details` continua sendo o mecanismo
            (funciona sem JavaScript e a busca do navegador abre a resposta). */}
        <div className="max-w-[820px] border-t border-line">
          {FAQ.map(item => (
            <article key={item.q} className="border-b border-line">
              <details className="group">
                <summary
                  className="cursor-pointer list-none py-5 min-h-[56px] flex items-center gap-4
                             font-ui text-[17px] font-semibold text-ink [&::-webkit-details-marker]:hidden"
                >
                  <span className="flex-1">{item.q}</span>
                  <svg aria-hidden width="14" height="14" viewBox="0 0 14 14" fill="none"
                       className="shrink-0 text-ink-muted transition-transform duration-200 ease-[var(--ease)] group-open:rotate-180">
                    <path d="M3 5.25 7 9.25l4-4" stroke="currentColor" strokeWidth="1.6"
                          strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </summary>
                <div className="pb-6 pr-8 grid gap-3">
                  {item.a.map(p => (
                    <p key={p} className="font-ui text-[16px] leading-[1.65] text-ink-body max-w-[64ch]">
                      {p}
                    </p>
                  ))}
                  {item.link && (
                    <Link href={item.link.href}
                          className="inline-flex items-center min-h-[44px] font-ui text-[14px]
                                     font-semibold text-[var(--teal-ink)] hover:underline">
                      {item.link.label} →
                    </Link>
                  )}
                </div>
              </details>
            </article>
          ))}
        </div>
      </Section>

      <Section>
        <FaixaCta
          onde="faq"
          titulo={tx.ctaTitulo}
          linha={
            tx.ctaLinha(
              <a href={`mailto:${empresa.contato.emailSuporte}`}
                 className="text-white underline underline-offset-[3px] decoration-white/50">
                {empresa.contato.emailSuporte}
              </a>,
              prazoResposta(),
              DUVIDAS_DE_CONTEUDO
            )
          }
        />
      </Section>
    </>
  );
}

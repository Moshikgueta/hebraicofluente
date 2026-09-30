import type { Metadata } from 'next';
import { meta } from '@/lib/seo';
import Link from 'next/link';
import { Artigo, LegalPage, Lista } from '@/components/legal/Legal';
import { brl, flagship, parcelasMax, pixPrice } from '@/lib/catalog';
import { empresa, soPix } from '@/lib/empresa';

export const metadata: Metadata = meta({
  rota: '/termos',
  title: 'Termos de Uso - Hebraico Fluente',
  description:
    'O que você contrata, por quanto tempo, como o acesso é liberado, o que pode ' +
    'e o que não pode ser feito com o conteúdo, e como cancelar.'
});

/* Os Termos.
 * ─────────────────────────────────────────────────────────────────────────
 * Preço, parcelas e prazo de acesso saem de data/courses.json - o MESMO
 * arquivo que o checkout cobra. Escrever "R$ 147" aqui à mão garante que um
 * dia o contrato diga um número e a cobrança faça outro, e nessa discussão o
 * documento é a prova contra quem o escreveu.
 */
export default function Page() {
  const c = flagship();
  const parcelas = parcelasMax(c.price);
  const pix = pixPrice(c.price);
  const { politicas, contato } = empresa;

  return (
    <LegalPage
      titulo="Termos de Uso"
      resumo={
        'Estes termos valem entre você e o Hebraico Fluente, e descrevem o que é ' +
        'vendido, como o acesso funciona e o que acontece quando alguém quer sair.'
      }
    >
      {/* 29/09/2026, a pedido do dono do curso: o que se contrata é um
          SERVIÇO de ensino de idiomas (CNAE 8593-7/00) entregue online, e não
          uma mercadoria digital. "Vende acesso a cursos digitais" descrevia o
          curso como produto; o contrato é a primeira peça que um fiscal ou um
          juiz lê. Ver "Enquadramento" no CLAUDE.md. */}
      <Artigo n={1} titulo="O que é contratado">
        <p>
          O Hebraico Fluente{empresa.razaoSocial ? `, da ${empresa.razaoSocial},` : ''} oferece{' '}
          <strong>cursos online de hebraico</strong>. O que você contrata é o{' '}
          <strong>acesso a um curso</strong>, pelo prazo indicado, estudado dentro da
          plataforma, pelo navegador. O curso é autoinstrucional: você estuda no seu
          ritmo, e a plataforma corrige cada exercício na hora.
        </p>
        {/* 28/09/2026 (auditoria, COM-007): o que NÃO vem junto só aparecia numa
            meia frase. Quem compra precisa saber antes. */}
        <p>O que <strong>não</strong> está incluído, salvo se estiver escrito na página do curso que você comprou:</p>
        <Lista itens={[
          'aulas ao vivo, em grupo ou individuais;',
          'correção ou acompanhamento feito por professor - o suporte por e-mail e WhatsApp é para problemas de acesso, pagamento e conta;',
          'os outros cursos da plataforma (A1, A2, B1), vendidos à parte quando forem lançados;',
          'aplicativo para instalar - a plataforma funciona no navegador, no celular e no computador;',
          'certificado oficial: o certificado de conclusão registra que você terminou o curso e passou no exame final, e não é reconhecido por nenhuma instituição de ensino;',
          'material físico.'
        ]} />
        {/* As formas de pagamento descritas aqui são as que o checkout aceita
            de verdade. Um contrato que oferece parcelamento no cartão enquanto
            a loja só processa PIX não é um contrato desatualizado: é uma oferta
            que o fornecedor não cumpre, e ela está escrita por ele. */}
        <p>
          O {c.titlePt} custa {brl(c.price.brl)}
          {soPix()
            ? <>, ou {brl(pix)} pagando por <strong>PIX</strong>, que é a forma
                de pagamento aceita hoje</>
            : <> à vista, {brl(pix)} no PIX, ou em até {parcelas}× no cartão de
                crédito. No parcelamento há juros, cobrados pela Mercado Pago e pagos
                pelo comprador; o valor de cada parcela e o total aparecem na tela de
                pagamento da Mercado Pago antes da confirmação</>}
          , e dá{' '}
          <strong>{c.accessMonths} meses de acesso</strong> contados da confirmação do
          pagamento. O preço vigente é sempre o exibido na página do curso e no
          checkout no momento da compra.
        </p>
      </Artigo>

      <Artigo n={2} titulo="Como o acesso é liberado">
        <Lista itens={[
          <>No <strong>PIX</strong>, o acesso é liberado assim que o pagamento é confirmado - normalmente em minutos.</>,
          ...(soPix() ? [] : [
            <>No <strong>cartão</strong>, assim que a operadora aprova a transação.</>
          ]),
          <>O acesso fica vinculado à <strong>conta</strong> criada com o seu e-mail, e não ao aparelho: você pode entrar no celular e no computador com o mesmo login.</>,
          <>A conta fica conectada em até <strong>3 aparelhos</strong> ao mesmo tempo. Ao entrar num quarto, o aparelho em que você entrou há mais tempo é desconectado e pede o login de novo; seu progresso não se perde.</>,
          <>Seu progresso é salvo na sua conta e acompanha você entre os aparelhos.</>
        ]} />
        <p>
          Se o pagamento foi confirmado e o acesso não apareceu, escreva para{' '}
          <a href={`mailto:${contato.emailSuporte}`} className="text-[var(--accent)] hover:underline break-all">
            {contato.emailSuporte}
          </a>{' '}
          com o e-mail da compra. Isso é falha nossa e é resolvido sem custo.
        </p>
      </Artigo>

      {/* 24/09/2026. Contrato com menor de 18 anos pode ser anulado (Código
          Civil, arts. 4º e 171), e o dado de criança tem regra própria na LGPD
          (art. 14). O curso é para adultos; o responsável é quem contrata
          quando não é. */}
      <Artigo n={3} titulo="Quem pode comprar">
        <p>
          A compra é feita por <strong>maiores de 18 anos</strong>. Menores de 18 só
          podem usar a plataforma com a autorização e o acompanhamento de um pai, mãe
          ou responsável legal, que é quem faz a compra e responde por ela. Ao aceitar
          estes Termos no cadastro, e ao comprar, você declara ter 18 anos ou mais, ou
          ser o responsável legal por quem vai estudar.
        </p>
      </Artigo>

      <Artigo n={4} titulo="Sua conta">
        <p>
          A conta é <strong>pessoal e intransferível</strong>. A senha é sua
          responsabilidade, e o acesso comprado destina-se ao uso de uma pessoa.
        </p>
        {/* 28/09/2026 (auditoria, LEGAL-018): "suspensa sem aviso prévio", sem
            prova, prazo nem volta, é o tipo de cláusula que o CDC (art. 51)
            anula. Agora há aviso, prazo para responder e devolução do tempo. */}
        <p>
          O único motivo de suspensão é <strong>compartilhar o acesso</strong> com
          outras pessoas (por exemplo, passar o login adiante ou publicá-lo). Se
          houver indício disso (como uma quantidade de entradas na conta muito acima
          do normal num mesmo dia, ou uma cópia do conteúdo com a marca da conta), avisamos por e-mail dizendo o que foi observado, e
          você tem <strong>5 dias úteis</strong> para responder. A conta só é suspensa
          se o compartilhamento se confirmar, e a suspensão é comunicada por e-mail,
          com o motivo. Se ela se mostrar indevida, o acesso volta e o tempo em que
          ficou suspenso é somado ao seu prazo.
        </p>
        <p>
          Você pode apagar todo o seu progresso quando quiser, dentro da plataforma, e
          pode <strong>apagar a conta</strong> sozinho, a qualquer momento, na página{' '}
          <Link href="/perfil" className="text-[var(--accent)] hover:underline">Sua conta</Link>.
          Apagar a conta encerra também o acesso aos cursos comprados, e isso{' '}
          <strong>não gera reembolso</strong>: para receber o valor de volta dentro do
          prazo de desistência, use antes a opção descrita no artigo 8. O que acontece
          com os seus dados está na{' '}
          <Link href="/privacidade" className="text-[var(--accent)] hover:underline">
            Política de Privacidade
          </Link>.
        </p>
      </Artigo>

      <Artigo n={5} titulo="O conteúdo é nosso, o aprendizado é seu">
        <p>
          Textos, exercícios, áudios, imagens e o próprio software são protegidos por
          direito autoral. Você pode usá-los para estudar, imprimir para uso próprio e
          fazer anotações à vontade. Não pode redistribuir, revender, publicar,
          hospedar em outro lugar nem usar para dar aula a terceiros sem autorização
          por escrito.
        </p>
        <p>
          Para proteger o curso, o conteúdo que cada conta recebe leva uma marca
          invisível, que não aparece na tela nem atrapalha o estudo, e que permite
          identificar de qual conta saiu uma cópia publicada sem autorização. Pelo mesmo
          motivo, as páginas das aulas mostram na margem, em letra pequena, o começo do
          seu e-mail e o número da sua cópia.
        </p>
        {/* 29/09/2026, a pedido do dono: deixar explícito que copiar o curso ou
            os dados tem consequência. Só a lei, sem ameaça que o site não
            possa cumprir. Revisar com o advogado. */}
        <p>
          <strong>Copiar, distribuir ou vender o curso sem autorização é violação de direito
          autoral</strong> (Lei 9.610/1998) e pode levar a responsabilização civil, com
          indenização pelos danos (arts. 102 a 104 da mesma lei), e criminal (Código Penal,
          art. 184). Acessar ou tentar acessar dados da plataforma ou de outros alunos sem
          autorização também pode ser crime (Código Penal, art. 154-A). Quando identificarmos
          uma cópia ou um acesso indevido, a conta de origem pode ser suspensa, na forma do
          artigo 4, e as medidas legais cabíveis podem ser tomadas.
        </p>
      </Artigo>

      <Artigo n={6} titulo="O que prometemos - e o que não">
        <p>
          Prometemos que o curso fica disponível durante todo o período contratado, que
          o conteúdo anunciado na página de vendas é o que está lá dentro, e que erros
          apontados são corrigidos.
        </p>
        <p>
          Não prometemos resultado de aprendizagem: quanto alguém aprende depende de
          quanto estuda. Também não garantimos funcionamento ininterrupto - manutenção,
          falha de provedor e problema de internet acontecem. Interrupção prolongada
          por nossa causa estende o seu prazo de acesso pelo tempo equivalente.
        </p>
      </Artigo>

      {/* 28/09/2026 (auditoria, LEGAL-020): o que acontece se a plataforma
          acabar antes dos 12 meses de quem comprou. */}
      <Artigo n={7} titulo="Se a plataforma for encerrada">
        <p>
          Se o Hebraico Fluente deixar de funcionar antes do fim do seu prazo de
          acesso, avisamos por e-mail com pelo menos <strong>30 dias</strong> de
          antecedência, e o acesso continua normal até lá. Depois do encerramento,
          devolvemos o valor proporcional ao tempo de acesso que faltava, pela mesma
          forma de pagamento.
        </p>
      </Artigo>

      <Artigo n={8} titulo="Cancelamento e reembolso">
        <p>
          Você tem <strong>{politicas.arrependimentoDias} dias</strong> para desistir da
          compra e receber o valor de volta, conforme o art. 49 do Código de Defesa do
          Consumidor. A desistência se faz pelo próprio site - em{' '}
          <Link href="/perfil" className="text-[var(--accent)] hover:underline">Sua conta</Link>,
          na compra, use <strong>Desistir da compra</strong> - ou por e-mail, e a
          confirmação de recebimento chega na hora. As condições, o passo a passo e os
          prazos estão na{' '}
          <Link href="/reembolso" className="text-[var(--accent)] hover:underline">
            Política de Reembolso e Cancelamento
          </Link>.
        </p>
      </Artigo>

      <Artigo n={9} titulo="Mudanças nestes termos">
        <p>
          Estes termos podem mudar - para corrigir, esclarecer ou acompanhar mudanças no
          produto. A data de atualização fica no topo desta página. Mudança que afete
          um acesso já comprado não retroage: vale o que estava escrito no dia da sua
          compra.
        </p>
      </Artigo>

      <Artigo n={10} titulo="Lei e foro">
        <p>
          Estes termos são regidos pela lei brasileira. Questões de consumo seguem o
          Código de Defesa do Consumidor, inclusive quanto ao foro do domicílio do
          consumidor. Antes de qualquer disputa, escreva para{' '}
          <a href={`mailto:${contato.emailSuporte}`} className="text-[var(--accent)] hover:underline break-all">
            {contato.emailSuporte}
          </a>: quase tudo se resolve por e-mail.
        </p>
      </Artigo>
    </LegalPage>
  );
}

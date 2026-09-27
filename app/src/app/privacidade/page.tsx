import type { Metadata } from 'next';
import Link from 'next/link';
import { meta } from '@/lib/seo';
import { Artigo, LegalPage, Lista } from '@/components/legal/Legal';
import { Card } from '@/components/ui/Card';
import { empresa, soPix } from '@/lib/empresa';

export const metadata: Metadata = meta({
  rota: '/privacidade',
  title: 'Política de Privacidade - Hebraico Fluente',
  description:
    'Quais dados são coletados, para quê, com quem são compartilhados, por quanto ' +
    'tempo ficam guardados, e como exercer seus direitos de titular pela LGPD.'
});

/* A Política de Privacidade.
 * ─────────────────────────────────────────────────────────────────────────
 * Escrita a partir do que o sistema REALMENTE faz, e não de um modelo. Cada
 * linha da tabela de dados corresponde a algo que existe no código: as contas
 * em `accounts`, o progresso em `progress`, os pedidos em `orders`, os eventos
 * de analytics em lib/analytics.ts (que hoje não saem do navegador, e isso
 * está dito). Uma política que descreve um produto genérico é pior do que
 * nenhuma: ela promete o que ninguém conferiu.
 */
export default function Page() {
  const { contato, privacidade, nomeFantasia } = empresa;

  const DADOS: [string, string, string][] = [
    ['Nome e e-mail', 'criar e identificar sua conta, e falar com você sobre a compra',
     'enquanto a conta existir'],
    ['Senha', 'entrar na plataforma - guardada como hash PBKDF2, nunca em texto puro',
     'enquanto a conta existir'],
    ['Progresso de estudo', 'mostrar onde você parou, escolher a próxima revisão e emitir o certificado',
     'enquanto a conta existir, ou até você apagar'],
    ['Dados do pedido', 'registrar a compra, liberar o acesso e cumprir obrigação fiscal',
     'pelo prazo legal de guarda fiscal'],
    /* O que o provedor nos devolve, e que fica gravado. A lista exata é
       GUARDAR, em worker/src/lib/db.js: tudo que não está nela é descartado
       antes de a linha existir - inclusive e-mail do pagador, CPF e os
       dígitos do cartão. Descrever isto aqui é o que permite dizer, na
       seção 3, que não guardamos dado de cartão sem estar exagerando. */
    ...(soPix() ? [] : [[
      'Resultado do pagamento',
      'confirmar a compra, liberar o acesso e tratar estorno - o que a Mercado Pago responde sobre o pagamento: situação, valor, moeda, forma e a referência do pedido. Sem dados do pagador e sem dados de cartão',
      'pelo prazo legal de guarda fiscal'
    ] as [string, string, string]]),
    ['Confirmação de e-mail', 'provar que o endereço da conta é seu (o link que mandamos no cadastro)',
     'enquanto a conta existir'],
    /* Marco Civil da Internet, art. 15 (24/09/2026): o provedor de aplicação
       guarda os registros de acesso por seis meses, em sigilo. Ver a tabela
       registros_acesso em worker/schema.sql. */
    ['Registro de acesso: endereço IP, data e hora de cada entrada na conta',
     'cumprir o Marco Civil da Internet (Lei 12.965/2014, art. 15). Fica em sigilo e só é entregue por ordem judicial',
     'seis meses, e então é apagado - inclusive se você apagar a conta antes'],
    ['Pedido de desistência da compra', 'registrar quando você desistiu, que é o que prova o prazo do art. 49 do CDC',
     'junto com o registro da compra'],
    ['Endereço de IP (freio de tentativas)', 'segurança: limitar tentativas de login e identificar abuso',
     'poucos dias, em registro técnico']
  ];

  const DIREITOS = [
    'confirmar que tratamos dados seus, e acessar esses dados',
    'corrigir dados incompletos, inexatos ou desatualizados',
    'pedir anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em desconformidade',
    'pedir a portabilidade dos seus dados',
    'ser informado sobre com quem compartilhamos seus dados',
    'revogar o consentimento, quando o tratamento se basear nele',
    'se opor a um tratamento, quando ele se basear em legítimo interesse'
  ];

  return (
    <LegalPage
      titulo="Política de Privacidade"
      resumo={
        `Quais dados o ${nomeFantasia} coleta, para que servem, com quem são ` +
        'compartilhados e como você exerce os seus direitos. Em português, sem juridiquês.'
      }
    >
      <Artigo n={1} titulo="Quem trata os seus dados">
        <p>
          O controlador dos dados é o fornecedor identificado no fim desta página.
          Qualquer pedido sobre dados pessoais pode ser feito por e-mail, no endereço
          indicado no item 6.
          {privacidade.encarregadoNome
            ? ` O encarregado pelo tratamento de dados é ${privacidade.encarregadoNome}.`
            : ''}
        </p>
      </Artigo>

      <Artigo n={2} titulo="O que coletamos, e por quê">
        <p>
          Só o necessário para o curso funcionar e para a compra existir. Não há
          coleta de dado sensível e não há perfilamento para publicidade.{' '}
          {soPix()
            ? 'Não pedimos CPF nem nenhum outro documento em lugar nenhum.'
            : <>Não pedimos CPF nem nenhum outro documento em nenhuma tela nossa
                - a Mercado Pago pode pedir o seu CPF na tela de pagamento dela,
                por exigência do meio de pagamento, e esse dado fica com ela:
                não é enviado para nós nem guardado aqui.</>}
        </p>
        <Card className="overflow-x-auto p-0">
          <table className="w-full border-collapse font-ui text-[14px]">
            <thead>
              <tr className="text-left">
                {['Dado', 'Para quê', 'Por quanto tempo'].map(h => (
                  <th key={h} className="px-4 py-2.5 border-b border-[color:var(--line-soft)]
                                         font-ui text-[12px] uppercase tracking-[.06em] text-ink-muted">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DADOS.map(([dado, fim, prazo]) => (
                <tr key={dado} className="align-top">
                  <td className="px-4 py-2.5 border-b border-[color:var(--line-soft)] text-ink font-medium">
                    {dado}
                  </td>
                  <td className="px-4 py-2.5 border-b border-[color:var(--line-soft)] text-ink-body">
                    {fim}
                  </td>
                  <td className="px-4 py-2.5 border-b border-[color:var(--line-soft)] text-ink-muted">
                    {prazo}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        <p>
          A base legal é a <strong>execução do contrato</strong> que você fez conosco
          (art. 7º, V da LGPD) para tudo que diz respeito ao acesso e ao progresso, o{' '}
          <strong>cumprimento de obrigação legal</strong> (art. 7º, II) para os dados
          fiscais do pedido e para o registro de acesso exigido pelo Marco Civil da
          Internet, e o <strong>legítimo interesse</strong> para os registros de
          segurança.
        </p>
        {/* 25/09/2026: o aluno pode gravar a própria leitura
            (components/learn/GravarLeitura.tsx). O microfone só abre nas
            páginas do curso, e o áudio nunca sai do aparelho - por isso ele
            não é dado que tratamos, e não entra na tabela acima. */}
        <p>
          <strong>Gravação da sua voz.</strong> Nas lições e nos textos de leitura você
          pode gravar a própria leitura para se ouvir. O navegador pede permissão para
          usar o microfone, e a gravação fica só no seu aparelho: some quando você sai
          da página e nunca é enviada para nós nem para ninguém.
        </p>
        {/* 27/09/2026: "Fale e seja corrigido" (components/learn/FalarECorrigir.tsx,
            lib/fala.ts). A transcrição é do reconhecimento de fala do próprio
            navegador; o curso não recebe o áudio, só o texto transcrito, e
            não o guarda. */}
        <p>
          <strong>Correção da pronúncia.</strong> Se você usar &ldquo;Fale e seja
          corrigido&rdquo;, a sua fala é transcrita pelo serviço de reconhecimento de
          voz do seu navegador - o do Google, no Chrome e no Android, ou o da Apple, no
          Safari e no iPhone -, sob as regras de privacidade de quem fez o navegador. O
          curso não recebe o seu áudio: recebe só o texto transcrito, compara com a
          palavra na tela e não o guarda. Se preferir que a sua voz não saia do
          aparelho, use só o &ldquo;Gravar a minha&rdquo;.
        </p>
      </Artigo>

      <Artigo n={3} titulo="Com quem compartilhamos">
        <p>
          Com o mínimo possível, e nunca para venda de dados - não vendemos, alugamos
          nem cedemos dados pessoais a ninguém.
        </p>
        {/* Quem recebe dado pessoal muda com o trilho de cobrança. No PIX
            direto não existe intermediário: o pagamento acontece entre o banco
            do comprador e o nosso, e nenhum dado dele sai daqui por causa da
            cobrança. Listar um processador que não recebe nada é descrever um
            compartilhamento que não existe, e uma política de privacidade só
            vale pelo que ela descreve com precisão. */}
        <Lista itens={[
          soPix()
            ? <><strong>Seu banco e o nosso</strong>: o PIX é pago dentro do aplicativo do seu banco. Nós só geramos o código de cobrança - <strong>nenhum dado seu é enviado a um processador de pagamento</strong>, e dados de cartão não são pedidos nem recebidos em lugar nenhum.</>
            /* A frase antiga dizia que os dados do cartão "nunca passam pelos
               nossos servidores". A resposta da Mercado Pago a uma consulta
               nossa PODE trazer os primeiros e os últimos dígitos e o nome
               impresso no cartão - eles são descartados antes de qualquer
               gravação (a lista GUARDAR em worker/src/lib/db.js), mas passam.
               "Não guardamos" é verdade e é verificável; "nunca passam" era
               uma promessa mais forte do que o código sustenta. */
            : <><strong>Mercado Pago</strong>: recebe o seu <strong>e-mail</strong> e o seu <strong>nome</strong> para emitir a cobrança, processa o pagamento e nos devolve o resultado. O número do cartão, a validade e o código de segurança são digitados no ambiente dela: nós não pedimos esses dados e <strong>não guardamos nenhum deles</strong> - o que a resposta dela traz é filtrado antes de ser gravado, e só ficam os campos listados na tabela acima.</>,
          /* A Resend estava fora desta lista, e é um operador como os outros:
             recebe endereço e primeiro nome de todo mundo que pede um link de
             senha. Omiti-la deixava a política descrevendo menos
             compartilhamento do que o sistema faz. */
          <><strong>Resend</strong>: entrega os nossos e-mails (recuperação de senha e avisos da sua conta). Para isso, recebe o <strong>seu endereço de e-mail e o seu primeiro nome</strong>. Não mandamos e-mail de propaganda.</>,
          <><strong>Infraestrutura</strong>: a plataforma roda na Cloudflare, que hospeda o site e o banco de dados.</>,
          <><strong>Autoridades</strong>, quando houver ordem legal para isso.</>
        ]} />
        {/* Transferência internacional (LGPD, art. 33). A Resend e a
            Cloudflare são empresas de fora, e a base é a execução do contrato
            - dizer isso em uma frase custa uma frase, e a ausência dela é
            achado de auditoria. */}
        <p>
          A Resend e a Cloudflare são empresas sediadas fora do Brasil, e parte
          do tratamento acontece em servidores no exterior. Essa transferência
          é necessária para a execução do contrato que você fez conosco - é o
          que permite o site responder e o e-mail de senha chegar - e está
          amparada no art. 33 da LGPD.
        </p>
      </Artigo>

      <Artigo n={4} titulo="Cookies e medição">
        <p>
          Usamos um <strong>cookie de sessão</strong>, necessário para manter você
          logado. Ele é assinado, tem validade curta e não serve para rastrear
          navegação fora daqui.
        </p>
        <p>
          O navegador também guarda o seu progresso localmente, para o curso funcionar
          sem internet. Não usamos cookies de publicidade, nem rede de anúncio, nem
          script de terceiros para medir audiência.
        </p>
      </Artigo>

      <Artigo n={5} titulo="Segurança">
        <Lista itens={[
          'Senhas guardadas como hash com sal (PBKDF2), nunca em texto legível.',
          'Todo o tráfego em HTTPS.',
          'Cookie de sessão HttpOnly - o JavaScript da página não consegue lê-lo.',
          'Freio de tentativas no login, contra teste automatizado de senhas.',
          'Acesso ao banco restrito à aplicação.'
        ]} />
        <p>
          Nenhum sistema é perfeito. Se houver incidente de segurança com risco
          relevante aos seus dados, comunicaremos você e a ANPD, conforme o art. 48 da
          LGPD.
        </p>
      </Artigo>

      <Artigo n={6} titulo="Seus direitos, e como exercê-los">
        <p>Pela LGPD (art. 18), você tem direito a:</p>
        <Lista itens={DIREITOS} />
        <Card tone="mint" className="p-5 grid gap-2">
          <p className="font-display text-[16px] font-bold text-ink">
            Canal para pedidos sobre dados pessoais
          </p>
          <p>
            Escreva para{' '}
            <a href={`mailto:${contato.emailPrivacidade}?subject=${encodeURIComponent('Pedido LGPD - titular de dados')}`}
               className="font-semibold text-[var(--accent)] hover:underline break-all">
              {contato.emailPrivacidade}
            </a>{' '}
            com o assunto <em>Pedido LGPD</em>, a partir do e-mail cadastrado na sua
            conta. Respondemos em até <strong>{privacidade.prazoLgpdDias} dias</strong>.
          </p>
          <p className="font-ui text-[13.5px] text-ink-muted">
            Pedimos que o pedido venha do e-mail da conta porque é como confirmamos que
            você é você - atender um pedido de exclusão vindo de outra pessoa seria o
            problema que esta política existe para evitar.
          </p>
        </Card>
        {/* Desde 22/09/2026 a exclusão é self-service, e este parágrafo mudou
            junto. Ele dizia que apagar a conta passava pelo canal de e-mail -
            uma política que descreve um produto que não existe mais é pior do
            que não ter política, porque é a promessa escrita que vale. */}
        <p>
          <strong>Apagar a conta você faz sozinho</strong>, a qualquer momento, na{' '}
          <Link href="/perfil" className="font-semibold text-[var(--accent)] hover:underline">
            página da sua conta
          </Link>
          . Pedimos a sua senha na hora - é o que garante que quem está apagando é
          você - e a exclusão vale na mesma hora, sem esperar por ninguém. Apagar só
          o progresso, mantendo a conta, também é seu, na página de conquistas.
        </p>
        <p>
          O que a exclusão leva: e-mail, nome, senha, progresso e acesso ao curso. O
          que ela não leva, e a lei não deixa levar: o registro das compras, que fica
          sem o seu nome e sem o seu e-mail, porque guardar nota de venda é obrigação
          de quem vende e a própria LGPD prevê essa guarda (art. 16, I). O que sobra
          é valor, data e situação do pagamento, e não aponta para você. Pelo mesmo
          motivo ficam os <strong>registros de acesso</strong> dos últimos seis meses,
          que o Marco Civil da Internet obriga a guardar; eles são apagados quando
          completam o prazo.
        </p>
        <p>
          O canal de e-mail acima continua valendo para todo o resto - acesso,
          correção, portabilidade -, e também se você preferir que a exclusão seja
          feita por nós.
        </p>
      </Artigo>

      <Artigo n={7} titulo="Crianças e adolescentes">
        <p>
          A plataforma é feita para adultos. Não direcionamos conteúdo a menores de 18
          anos nem coletamos dados deles conscientemente. Se identificarmos uma conta
          criada por menor sem o consentimento dos responsáveis, ela será removida.
        </p>
      </Artigo>

      <Artigo n={8} titulo="Mudanças nesta política">
        <p>
          Quando esta política mudar, a data no topo muda junto. Alteração relevante
          no tratamento dos seus dados é avisada por e-mail antes de valer.
        </p>
      </Artigo>
    </LegalPage>
  );
}

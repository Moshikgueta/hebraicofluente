import type { Metadata } from 'next';
import { Artigo, LegalPage, Lista } from '@/components/legal/Legal';
import { Card } from '@/components/ui/Card';
import { empresa } from '@/lib/empresa';

export const metadata: Metadata = {
  title: 'Política de Privacidade - Hebraico Fluente',
  description:
    'Quais dados são coletados, para quê, com quem são compartilhados, por quanto ' +
    'tempo ficam guardados, e como exercer seus direitos de titular pela LGPD.'
};

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
    ['Endereço de IP e dados do navegador', 'segurança: limitar tentativas de login e identificar abuso',
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
          coleta de dado sensível, não pedimos documento, e não há perfilamento para
          publicidade.
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
          <strong>cumprimento de obrigação legal</strong> para os dados fiscais do
          pedido, e o <strong>legítimo interesse</strong> para os registros de
          segurança.
        </p>
      </Artigo>

      <Artigo n={3} titulo="Com quem compartilhamos">
        <p>
          Com o mínimo possível, e nunca para venda de dados - não vendemos, alugamos
          nem cedemos dados pessoais a ninguém.
        </p>
        <Lista itens={[
          <><strong>Meio de pagamento</strong>: processa a cobrança e nos devolve apenas o resultado. Os dados do seu cartão são digitados no ambiente dele e <strong>nunca passam pelos nossos servidores</strong>.</>,
          <><strong>Infraestrutura</strong>: a plataforma roda na Cloudflare, que hospeda o site e o banco de dados.</>,
          <><strong>Autoridades</strong>, quando houver ordem legal para isso.</>
        ]} />
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
        <p>
          Apagar o progresso você pode fazer sozinho, a qualquer momento, na página de
          conquistas dentro da plataforma. A exclusão da conta inteira passa pelo canal
          acima, porque é irreversível.
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

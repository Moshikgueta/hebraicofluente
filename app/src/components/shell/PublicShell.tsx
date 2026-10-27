'use client';

/* O site público.
 * ─────────────────────────────────────────────────────────────────────────
 * A mesma casa do curso, não uma casa ao lado dele. Mesmas fontes, mesmas
 * cores, mesmo <He> para o hebraico, mesma régua de leitura. Um visitante que
 * compra não deve ter a sensação de ter mudado de produto ao entrar - é
 * exatamente essa sensação que faz o aluno duvidar se a compra funcionou.
 *
 * O cabeçalho carrega AS DUAS PORTAS, em toda largura: "Entrar", para quem já
 * pagou, e "Começar", para quem ainda não. Os links de navegação é que cedem
 * o espaço e vão para o menu sanduíche abaixo de lg.
 *
 * A ordem de prioridade é essa de propósito, e ela já esteve errada: o
 * "Entrar" ficava escondido abaixo de sm, e no celular um aluno pagante via
 * um botão só - "Começar" - que leva à página de vendas do curso que ele já
 * comprou. O caminho para a própria conta existia apenas atrás do hambúrguer,
 * e ninguém abre um hambúrguer para fazer login: escreve para o suporte, ou
 * conclui que perdeu o acesso.
 *
 * Quando a sessão existe, as duas viram uma: "Meu Hebraico". Um aluno logado
 * que vê "Criar conta" no topo do site acha que foi deslogado.
 */

import { RedesSociais } from './RedesSociais';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Logo } from '@/components/shell/Logo';
import { LinkButton } from '@/components/ui/Button';
import { useAccount } from '@/lib/account/store';
import { DemoNotice } from '@/components/shell/DemoNotice';
import { He } from '@/components/hebrew/He';
import { METODO_ORIGINAL } from '@/lib/credito';
import { FLAGSHIP, flagship, parcelasMax } from '@/lib/catalog';
import {
  empresa, enderecoLinha, nomeLegalCompleto, parcelasTexto, prazoResposta, soPix, temCartao, temPix, whatsappUrl
} from '@/lib/empresa';

/* Os rótulos são os do design. Os destinos são páginas de verdade, e não
   âncoras: `#como` funciona na capa e vira link morto em /cursos, que usa
   este mesmo cabeçalho. A capa tem as âncoras por dentro, para quem já está
   rolando por ela. */
const LINKS = [
  /* 23/10/2026: a capa virou o portal, com as três jornadas no painel
     "Experiências". 27/10/2026 (decisão do dono): o site fica só com o curso
     de alfabetização, e o painel saiu do cabeçalho e do rodapé (o código
     dele está no histórico do git, no commit que o tirou). */
  { href: '/metodo', label: 'O método' },
  { href: '/sobre', label: 'Sobre' },
  { href: '/faq', label: 'Dúvidas' }
] as const;

const norm = (s: string | null) => (s ?? '/').replace(/\/+$/, '') || '/';

export function PublicShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const account = useAccount();
  const botaoMenu = useRef<HTMLButtonElement>(null);

  /* Escape fecha o menu e devolve o foco ao botão, como no painel de
     acessibilidade (auditoria de 28/09, UX-004: o menu não fechava pelo
     teclado, e o fundo continuava travado). */
  useEffect(() => {
    if (!open) return;
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); botaoMenu.current?.focus(); }
    };
    document.addEventListener('keydown', aoTeclar);
    return () => document.removeEventListener('keydown', aoTeclar);
  }, [open]);

  /* Fecha o menu ao mudar de rota. Sem isto, tocar num link abre a página
     nova com o menu ainda por cima dela. */
  useEffect(() => { setOpen(false); }, [pathname]);

  /* Trava o scroll do fundo enquanto o menu está aberto, e só então - o
     curso tem uma regra dura de nunca desabilitar o scroll globalmente. */
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <header className="sticky top-0 z-40 border-b border-[color:var(--line-soft)]
                         bg-[color-mix(in_srgb,var(--paper)_88%,transparent)] backdrop-blur-md">
        {/* `flex-wrap` e altura MÍNIMA, e não altura fixa.
            ──────────────────────────────────────────────────────────────
            Em uso normal nada quebra linha: a barra continua com os mesmos
            64px de sempre. Ela existe para o leitor que aumenta o texto.

            O aumento é `zoom` num contêiner (ver lib/acessibilidade.ts), e
            zoom não mexe nas media queries: em 150% num telefone de 390px a
            barra tem 260px úteis, mas as classes `sm:` continuam achando que
            estão em 390 e mantêm as escolhas de lá. O resultado era o menu
            sanduíche 46px para fora da tela, com a página rolando de lado -
            exatamente o que a WCAG 1.4.10 proíbe, e logo para quem mais
            precisa do recurso.

            Quebrar linha resolve sem esconder nada: o par "Entrar" e
            "Começar" desce para uma segunda linha e continua clicável. */}
        <div className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 min-h-[64px] py-1.5
                        flex flex-wrap items-center gap-x-4 gap-y-1">
          {/* No telefone só o quadrado ע: o nome escrito come 110 dos 358
              pixels úteis, e esses 110 são o que faz caber o "Entrar" ao
              lado do "Começar". Entre mostrar a marca e deixar o aluno
              entrar na conta dele, a conta ganha - e a marca continua no
              título da aba, no ícone e no topo da página. */}
          <Link href="/" className="flex items-center min-h-[44px] -ml-1 pl-1 pr-2 rounded-md shrink-0">
            <span className="sm:hidden"><Logo words={false} /></span>
            <span className="hidden sm:inline-flex"><Logo /></span>
            <span className="sr-only">Hebraico Fluente, página inicial</span>
          </Link>

          {/* Os links só a partir de lg, e não de md.
              Em md (768, que é um iPad em pé) a navegação inteira aparecia ao
              mesmo tempo que o rótulo longo "Começar agora", e a linha
              estourava a tela em 118px - a página rolava para o lado, com o
              botão de comprar meio de fora. Entre 768 e 1024 o menu sanduíche
              dá conta dos links; o que não pode sair da barra é o par
              "Entrar" e "Começar", que é o que cada visitante veio fazer. */}
          <nav aria-label="Navegação do site" className="hidden lg:flex items-center gap-1 ml-4">
            {LINKS.map(l => {
              const active = norm(pathname) === norm(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={active ? 'page' : undefined}
                  /* Mesmo peso nos dois estados (mudar o peso no ativo empurrava
                     os vizinhos), e o ativo marcado por um traço teal embaixo,
                     não por um comprimido de fundo. */
                  className={`relative inline-flex items-center min-h-[44px] px-3
                    font-ui text-[14px] font-medium transition-colors duration-150
                    after:absolute after:left-3 after:right-3 after:bottom-[9px] after:h-[2px]
                    after:bg-[var(--teal)] after:transition-opacity after:duration-150
                    ${active ? 'text-ink after:opacity-100'
                             : 'text-ink-body hover:text-ink after:opacity-0'}`}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            {/* "Meu Hebraico" só para quem tem o curso (auditoria de
                01/10/2026, UXQA-007). Para a conta sem curso - inclusive o PIX
                aguardando confirmação - o painel do aluno só devolveria a
                página de vendas; o que ela tem é a conta. */}
            {account.ready && account.signedIn && account.can(FLAGSHIP) ? (
              <LinkButton href="/meu-hebraico" size="sm">Meu Hebraico</LinkButton>
            ) : account.ready && account.signedIn ? (
              /* Conta sem o curso (27/10/2026, pedido do dono). Era só o
                 botão "Minha Biblioteca", e uma aluna que tinha acabado de
                 criar a conta ficou sem saber como comprar: escreveu "não
                 consegui...". Agora são as mesmas duas portas de quem não
                 entrou: a conta, e começar o curso. */
              <>
                <LinkButton href="/minha-biblioteca" variant="ghost" size="sm"
                            className="whitespace-nowrap px-2.5 sm:px-4">
                  Minha conta
                </LinkButton>
                <LinkButton href={`/checkout/${FLAGSHIP}`} size="sm"
                            className="whitespace-nowrap px-3 sm:px-4">
                  <span className="sm:hidden">Começar</span>
                  <span className="hidden sm:inline">Começar o curso</span>
                </LinkButton>
              </>
            ) : (
              <>
                {/* "Entrar" aparece em TODA largura, inclusive no telefone.
                    Ele já esteve escondido abaixo de sm, e isso custava caro
                    de um jeito silencioso: quem já tinha pago, abrindo o site
                    no celular, via um único botão - "Começar" - que leva à
                    página de VENDAS. Para chegar à própria conta era preciso
                    adivinhar que ela estava atrás do menu sanduíche, e
                    ninguém abre um sanduíche para fazer login.

                    O espaço saiu do nome da marca, que some abaixo de sm e
                    deixa só o quadrado ע (ver o `words` do Logo). A marca
                    continua no <title>, no ícone e no topo da própria
                    página; o caminho de volta para o curso pago, não tinha
                    outro lugar. */}
                <LinkButton href="/entrar" variant="ghost" size="sm"
                            className="whitespace-nowrap px-2.5 sm:px-4">
                  Entrar
                </LinkButton>
                {/* "Começar agora" cabe a partir de sm; num aparelho de 390 o
                    rótulo inteiro quebra em duas linhas e empurra o menu
                    para fora da tela. A palavra que importa é a primeira. */}
                <LinkButton href="/curso-de-hebraico" size="sm"
                            className="whitespace-nowrap px-3 sm:px-4">
                  {/* Um rótulo inteiro por largura, e não "Começar" + um
                      span com "&nbsp;agora": o `gap` do botão somava ao
                      espaço e abria um vão (auditoria de 01/10, VIS-014). */}
                  <span className="sm:hidden">Começar</span>
                  <span className="hidden sm:inline">Começar agora</span>
                </LinkButton>
              </>
            )}

            <button
              ref={botaoMenu}
              type="button"
              onClick={() => setOpen(v => !v)}
              aria-expanded={open}
              aria-controls="menu-site"
              className="lg:hidden min-w-[44px] min-h-[44px] grid place-items-center rounded-[var(--r-md)]
                         text-ink-body hover:bg-surface-2"
            >
              <span aria-hidden className="text-[18px] leading-none">{open ? '✕' : '☰'}</span>
              <span className="sr-only">{open ? 'Fechar menu' : 'Abrir menu'}</span>
            </button>
          </div>
        </div>

        {open && (
          <nav
            id="menu-site"
            aria-label="Navegação do site"
            className="lg:hidden border-t border-[color:var(--line-soft)] bg-[var(--paper)]"
          >
            {/* Só os links de navegação. "Entrar" saiu daqui porque agora
                está na barra, visível em toda largura - repeti-lo dentro do
                menu só ensinaria que é aqui que se procura. */}
            <div className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 py-3 grid gap-3">
              <ul className="grid list-none p-0 m-0">
                {LINKS.map(l => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="flex items-center min-h-[52px] font-ui text-[16px] text-ink-body
                                 border-b border-[color:var(--line-soft)] last:border-0"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        )}
      </header>

      <DemoNotice />

      <main id="conteudo-publico" className="flex-1">{children}</main>

      <Footer />
    </div>
  );
}

function Footer() {
  return (
    <footer className="mt-16 border-t border-[color:var(--line-soft)] bg-surface-2">
      <div className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 py-10 grid gap-8
                      grid-cols-2 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))]">
        <div className="col-span-2 lg:col-span-1 grid gap-2 content-start">
          <Logo size={28} />
          <p className="font-ui text-[13px] leading-relaxed text-ink-muted max-w-[32ch]">
            Hebraico para brasileiros, começando pelo alfabeto. Feito para adulto
            que estuda sozinho, no celular, sem professor do lado.
          </p>
          {/* O crédito ao método de origem, em toda página pública. Fica aqui,
              e não escondido numa página interna, porque é assim que um
              crédito cumpre o que se espera dele. Ver lib/credito.ts. */}
          <p className="font-ui text-[12px] leading-relaxed text-ink-muted max-w-[32ch]">
            Método inspirado em{' '}
            <He size="inline">{METODO_ORIGINAL.obraHe}</He>{' '}
            ({METODO_ORIGINAL.obraTranslit}), de {METODO_ORIGINAL.autor}.
          </p>
          <div className="grid gap-2 content-start mt-3">
            <p className="font-ui text-[11px] uppercase tracking-[.08em] text-ink-muted">Contato</p>
            <a href={`mailto:${empresa.contato.emailSuporte}`}
               className="inline-flex items-center min-h-[36px] font-ui text-[13.5px]
                          text-ink-body hover:text-[var(--accent)] break-all">
              {empresa.contato.emailSuporte}
            </a>
            {empresa.contato.whatsapp && (
              whatsappUrl()
                ? <a href={whatsappUrl()!} target="_blank" rel="noopener noreferrer"
                     className="inline-flex items-center min-h-[36px] font-ui text-[13.5px]
                                text-ink-body hover:text-[var(--accent)]">
                    WhatsApp {empresa.contato.whatsapp}
                  </a>
                : <span className="font-ui text-[13.5px] text-ink-body">
                    WhatsApp {empresa.contato.whatsapp}
                  </span>
            )}
            <RedesSociais />
            <p className="font-ui text-[12px] leading-relaxed text-ink-muted mt-2">
              {empresa.atendimento.horarioPt}. Resposta {prazoResposta()}.
            </p>
            {/* Esta linha aparece em TODA página pública, o que faz dela a
                promessa de pagamento mais repetida do site - e a mais cara de
                deixar errada. Sai de data/empresa.json, como o resto, e agora
                também das FORMAS que a conta do provedor aceita: prometer PIX
                no rodapé de todas as páginas e não ter PIX no checkout é a
                versão mais visível do mesmo defeito. */}
            <p className="font-ui text-[12px] leading-relaxed text-ink-muted">
              {/* O "12x" era escrito à mão aqui. Passou a sair do catálogo pelo
                  mesmo motivo de todo número do site: o dia em que o
                  parcelamento mudar em data/courses.json, esta linha muda
                  junto, em vez de continuar prometendo o número velho no pé de
                  todas as páginas. */}
              {soPix()
                ? 'Pagamento por PIX. Acesso liberado depois de conferido o pagamento.'
                : temPix() && temCartao()
                  ? `Pagamento por PIX ou cartão, ${parcelasTexto(parcelasMax(flagship().price))}. Acesso liberado na hora.`
                  : temCartao()
                    ? `Pagamento por cartão de crédito, ${parcelasTexto(parcelasMax(flagship().price))}. Acesso liberado na hora.`
                    : 'Pagamento por PIX. Acesso liberado na hora.'}
            </p>
          </div>
        </div>

        {/* Três colunas com hierarquia: o que explica o curso, a ajuda e o
            legal. Legal ao lado dos outros, e não numa linha miúda: quem
            procura a política de reembolso antes de comprar está decidindo.
            A1, A2 e B1 aparecem como o que são, próximos cursos de hebraico em
            produção (auditoria de 01/10, CONV-011). A coluna "Experiências"
            (as três jornadas) saiu em 27/10/2026, com o site só no curso de
            alfabetização. */}
        <div className="grid gap-1 content-start">
          <FooterCol title="Aprender" links={[
            { href: '/curso-de-hebraico', label: 'Alfabetização em Hebraico' },
            { href: '/metodo', label: 'O método' },
            { href: '/cursos', label: 'Os cursos' },
            { href: '/alfabeto-hebraico', label: 'Alfabeto hebraico' },
            { href: '/biblia', label: 'Ler a Bíblia?' }
          ]} />
          <p className="font-ui text-[12px] leading-relaxed text-ink-muted mt-2 max-w-[30ch]">
            Próximos cursos, à parte e ainda em produção:{' '}
            <Link href="/cursos/hebraico-a1" className="underline underline-offset-2 hover:text-[var(--accent)]">A1</Link>,{' '}
            <Link href="/cursos/hebraico-a2" className="underline underline-offset-2 hover:text-[var(--accent)]">A2</Link> e{' '}
            <Link href="/cursos/hebraico-b1" className="underline underline-offset-2 hover:text-[var(--accent)]">B1</Link>.
          </p>
        </div>

        <FooterCol title="Ajuda" links={[
          { href: '/faq', label: 'Dúvidas' },
          { href: '/suporte', label: 'Suporte' },
          { href: '/entrar', label: 'Entrar' },
          { href: '/sobre', label: 'Sobre o Moshik' },
          { href: '/acessibilidade', label: 'Acessibilidade' }
        ]} />

        <FooterCol title="Legal" links={[
          { href: '/termos', label: 'Termos de Uso' },
          { href: '/privacidade', label: 'Política de Privacidade' },
          { href: '/reembolso', label: 'Reembolso e Cancelamento' }
        ]} />

      </div>

      {/* A identificação do fornecedor.
          No Brasil ela não é decoração de rodapé: o Decreto 7.962/2013 pede
          nome, CNPJ e endereço em local de destaque, antes da compra. Cada
          pedaço só aparece se existir - ver a nota em lib/empresa.ts sobre
          por que um dado ausente some em vez de virar um travessão. */}
      <div className="border-t border-[color:var(--line-soft)]">
        <div className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 py-5 grid gap-1.5">
          <p className="font-ui text-[12px] leading-relaxed text-ink-muted">
            {[nomeLegalCompleto(),
              empresa.cnpj && `CNPJ ${empresa.cnpj}`,
              enderecoLinha()
            ].filter(Boolean).join(' · ')}
          </p>
          <p className="font-ui text-[12px] text-ink-muted">
            © {new Date().getFullYear()} {empresa.nomeFantasia}. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: {
  title: string; links: readonly { href: string; label: string }[];
}) {
  return (
    <div className="grid gap-1 content-start">
      <p className="font-ui text-[11px] uppercase tracking-[.08em] text-ink-muted mb-1">{title}</p>
      {links.map(l => (
        <Link key={l.href} href={l.href}
              className="inline-flex items-center min-h-[36px] font-ui text-[13.5px]
                         text-ink-body hover:text-[var(--accent)]">
          {l.label}
        </Link>
      ))}
    </div>
  );
}

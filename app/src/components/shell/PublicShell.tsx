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

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { Logo } from '@/components/shell/Logo';
import { LinkButton } from '@/components/ui/Button';
import { useAccount } from '@/lib/account/store';
import { DemoNotice } from '@/components/shell/DemoNotice';
import { empresa, enderecoLinha, nomeLegalCompleto, whatsappUrl } from '@/lib/empresa';

/* Os rótulos são os do design. Os destinos são páginas de verdade, e não
   âncoras: `#como` funciona na capa e vira link morto em /cursos, que usa
   este mesmo cabeçalho. A capa tem as âncoras por dentro, para quem já está
   rolando por ela. */
const LINKS = [
  { href: '/#como', label: 'Como funciona' },
  { href: '/cursos', label: 'O curso' },
  { href: '/metodo', label: 'Metodologia' },
  { href: '/sobre', label: 'Sobre' },
  { href: '/faq', label: 'Dúvidas' }
] as const;

const norm = (s: string | null) => (s ?? '/').replace(/\/+$/, '') || '/';

export function PublicShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const account = useAccount();

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
        <div className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 h-[64px] flex items-center gap-4">
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
                  className={`inline-flex items-center min-h-[44px] px-3 rounded-[var(--r-md)]
                    font-ui text-[14px] transition-colors
                    ${active ? 'text-[var(--accent)] font-semibold bg-[var(--accent-wash)]'
                             : 'text-ink-body hover:bg-surface-2'}`}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            {account.ready && account.signedIn ? (
              <LinkButton href="/meu-hebraico" size="sm">Meu Hebraico</LinkButton>
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
                <LinkButton href="/cursos/alfabetizacao" size="sm"
                            className="whitespace-nowrap px-3 sm:px-4">
                  Começar<span className="hidden sm:inline">&nbsp;agora</span>
                </LinkButton>
              </>
            )}

            <button
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
            <ul className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 py-2 grid">
              {LINKS
                .map(l => (
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
                      sm:grid-cols-2 lg:grid-cols-4">
        <div className="grid gap-2 content-start">
          <Logo size={28} />
          <p className="font-ui text-[13px] leading-relaxed text-ink-muted max-w-[32ch]">
            Hebraico para brasileiros, do alfabeto à conversa. Feito para adulto
            que estuda sozinho, no celular, sem professor do lado.
          </p>
        </div>

        <FooterCol title="Cursos" links={[
          { href: '/cursos/alfabetizacao', label: 'Alfabetização' },
          { href: '/cursos/hebraico-a1', label: 'Hebraico A1' },
          { href: '/cursos/hebraico-a2', label: 'Hebraico A2' },
          { href: '/cursos/hebraico-b1', label: 'Hebraico B1' }
        ]} />

        <FooterCol title="A plataforma" links={[
          { href: '/metodo', label: 'O método' },
          { href: '/sobre', label: 'Sobre o Moshik' },
          { href: '/faq', label: 'Dúvidas' },
          { href: '/entrar', label: 'Entrar' }
        ]} />

        {/* Legal ao lado de Cursos e Plataforma, e não escondido numa linha
            miúda embaixo. Quem procura "tem política de reembolso?" antes de
            comprar está decidindo: achar em dois segundos converte, caçar
            não. */}
        <FooterCol title="Legal" links={[
          { href: '/termos', label: 'Termos de Uso' },
          { href: '/privacidade', label: 'Política de Privacidade' },
          { href: '/reembolso', label: 'Reembolso e Cancelamento' },
          { href: '/suporte', label: 'Suporte' }
        ]} />

        <div className="grid gap-2 content-start">
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
          <p className="font-ui text-[12px] leading-relaxed text-ink-muted mt-2">
            {empresa.atendimento.horarioPt}. Resposta em até{' '}
            {empresa.atendimento.prazoRespostaUteis} dias úteis.
          </p>
          <p className="font-ui text-[12px] leading-relaxed text-ink-muted">
            Pagamento por PIX ou cartão, em até 12x. Acesso liberado na hora.
          </p>
        </div>
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

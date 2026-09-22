'use client';

/* Sua conta.
 * ─────────────────────────────────────────────────────────────────────────
 * Quatro blocos e nenhuma configuração inventada: dados, cursos, números e
 * compras. Uma página de perfil cheia de interruptor que não liga nada é pior
 * do que uma página curta.
 *
 * Duas coisas que esta página diz e quase nenhuma diz:
 *
 *   · até quando vai o acesso, em data, por curso;
 *   · onde o progresso mora DE VERDADE nesta build. Com servidor (Worker +
 *     D1) ele viaja com a conta; no export estático de demonstração ele fica
 *     no navegador. O lugar de contar isso é aqui, onde a pessoa está olhando
 *     os próprios números - não numa nota de rodapé que ela descobre no dia
 *     em que troca de celular.
 *
 * "Sair" pede confirmação porque a sessão é o que dá acesso, e sair no
 * aparelho errado é chato de desfazer sem a senha.
 */

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Badge } from '@/components/ui/Card';
import { Button, LinkButton } from '@/components/ui/Button';
import { Campo, Aviso, Erro } from '@/components/platform/Campo';
import { useAccount } from '@/lib/account/store';
import { AuthError, MESSAGES, MIN_PASSWORD, passwordOk } from '@/lib/account/types';
import { useProgress } from '@/lib/state/store';
import { daysLeft, type Order } from '@/lib/account/types';
import { allCourses, brl, FLAGSHIP, getCourse } from '@/lib/catalog';
import { ACHIEVEMENTS } from '@/lib/state/rules';
import { course } from '@/lib/content-publico';
import { api } from '@/lib/account/api';
import { empresa } from '@/lib/empresa';

const date = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

export function PerfilClient() {
  const account = useAccount();
  const p = useProgress();
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [orders, setOrders] = useState<Order[] | null>(null);

  useEffect(() => {
    if (!account.signedIn) return;
    let stop = false;
    void (async () => {
      const list = await (await api()).orders().catch(() => []);
      if (!stop) setOrders(list);
    })();
    return () => { stop = true; };
  }, [account.signedIn]);

  if (!account.ready || !account.session) return null;
  const me = account.session.account;

  return (
    <div className="focus-col grid gap-6 py-2">
      <header className="grid gap-2">
        <h1 className="text-[27px] sm:text-[31px] font-bold leading-tight">Sua conta</h1>
        <p className="font-ui text-[15px] text-ink-muted">
          Seus dados, seus cursos e o que você já fez.
        </p>
      </header>

      {/* ── dados ─────────────────────────────────────────────────── */}
      <Card className="p-5 grid gap-4">
        <h2 className="font-display text-[17px] font-bold text-ink">Dados</h2>
        <dl className="grid gap-3 sm:grid-cols-2">
          <Row k="Nome" v={me.name || '-'} />
          <Row k="E-mail" v={me.email} />
          <Row k="Conta criada em" v={date(me.createdAt)} />
        </dl>
        <p className="font-ui text-[12.5px] leading-relaxed text-ink-muted
                      border-t border-[color:var(--line-soft)] pt-3">
          Para trocar o e-mail, escreva para{' '}
          <a href={`mailto:${empresa.contato.emailSuporte}`}
             className="text-[var(--accent)] hover:underline break-all">
            {empresa.contato.emailSuporte}
          </a>
          . O e-mail é o que identifica a conta e o que recebe o link de
          recuperação, então trocá-lo sozinho pela tela é o caminho mais curto
          para perder a conta por um erro de digitação.
        </p>
      </Card>

      {/* ── senha ─────────────────────────────────────────────────── */}
      <TrocarSenha />


      {/* ── cursos ────────────────────────────────────────────────── */}
      <Card className="p-5 grid gap-4">
        <h2 className="font-display text-[17px] font-bold text-ink">Seus cursos</h2>
        <ul className="grid gap-3 list-none p-0 m-0">
          {allCourses().map(c => {
            const ent = account.session!.entitlements.find(e => e.courseSlug === c.slug);
            const left = daysLeft(account.session, c.slug);
            const owned = account.can(c.slug);
            return (
              <li key={c.slug}
                  className="flex flex-wrap items-center gap-3 border-b border-[color:var(--line-soft)]
                             pb-3 last:border-0 last:pb-0">
                <span className="grid gap-0.5 min-w-0 flex-1">
                  <span className="font-ui text-[15px] font-medium text-ink">{c.titlePt}</span>
                  <span className="font-ui text-[12.5px] text-ink-muted">
                    {owned && ent?.expiresAt
                      ? `Acesso até ${date(ent.expiresAt)}${left !== null && left <= 30 ? ` · ${left} ${left === 1 ? 'dia' : 'dias'}` : ''}`
                      : ent
                        ? 'Acesso encerrado'
                        : c.status === 'soon' ? 'Ainda não lançado' : 'Não está na sua conta'}
                  </span>
                </span>
                {owned
                  ? <Badge tone="mint">Ativo</Badge>
                  : c.status === 'soon'
                    ? <Badge>Em breve</Badge>
                    : <LinkButton href={`/cursos/${c.slug}`} variant="secondary" size="sm">
                        Ver o curso
                      </LinkButton>}
              </li>
            );
          })}
        </ul>
      </Card>

      {/* ── números ───────────────────────────────────────────────── */}
      <Card className="p-5 grid gap-4">
        <h2 className="font-display text-[17px] font-bold text-ink">Seu progresso</h2>
        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {([
            ['Letras', `${p.mastered}/${course.totalLetters}`],
            ['Curso', `${Math.round(p.progress * 100)}%`],
            ['Sequência', p.streak === 0 ? '-' : `${p.streak} d`],
            ['Conquistas', `${p.state.achievements.length}/${ACHIEVEMENTS.length}`]
          ] as const).map(([k, v]) => (
            <div key={k} className="grid gap-0.5">
              <dt className="font-ui text-[10.5px] uppercase tracking-[.07em] text-ink-muted">{k}</dt>
              <dd className="font-display text-[20px] font-bold text-ink tabular-nums">{v}</dd>
            </div>
          ))}
        </dl>
        {/* O texto acompanha onde o progresso REALMENTE está nesta build. Uma
            página de perfil que promete sincronização num export estático sem
            servidor está mentindo, e é a pessoa que descobre - no dia em que
            troca de celular. */}
        <p className="font-ui text-[12.5px] leading-relaxed text-ink-muted
                      border-t border-[color:var(--line-soft)] pt-3">
          {account.demo
            ? <>Estes números são deste aparelho. Nesta versão o progresso é
                guardado no navegador e não viaja com a conta.</>
            : <>Seu progresso fica na sua conta e é sincronizado entre os
                aparelhos: o que você fizer no celular aparece no computador.
                Uma cópia continua neste aparelho, para o curso funcionar
                mesmo sem internet.</>}
        </p>
        <div className="flex flex-wrap gap-2">
          <LinkButton href="/conquistas" variant="secondary" size="sm">Ver conquistas</LinkButton>
          {p.state.finalChallenge.passedAt && (
            <LinkButton href="/certificado" variant="secondary" size="sm">Meu certificado</LinkButton>
          )}
        </div>
      </Card>

      {/* ── compras ───────────────────────────────────────────────── */}
      <Card className="p-5 grid gap-4">
        <h2 className="font-display text-[17px] font-bold text-ink">Compras</h2>
        {orders === null ? (
          <p className="font-ui text-[14px] text-ink-muted">Carregando…</p>
        ) : orders.length === 0 ? (
          <p className="font-ui text-[14px] leading-relaxed text-ink-muted">
            Nenhuma compra registrada nesta conta.
          </p>
        ) : (
          <ul className="grid gap-3 list-none p-0 m-0">
            {orders.map(o => (
              <li key={o.id}
                  className="flex flex-wrap items-center gap-3 border-b border-[color:var(--line-soft)]
                             pb-3 last:border-0 last:pb-0">
                <span className="grid gap-0.5 min-w-0 flex-1">
                  <span className="font-ui text-[14.5px] text-ink">
                    {getCourse(o.courseSlug)?.titlePt ?? o.courseSlug}
                  </span>
                  <span className="font-ui text-[12.5px] text-ink-muted tabular-nums">
                    {date(o.createdAt)} · {o.method === 'pix' ? 'PIX' : 'Cartão'} ·{' '}
                    {brl(o.amountCents / 100)}
                  </span>
                </span>
                <Badge tone={o.status === 'paid' ? 'mint' : o.status === 'pending' ? 'neutral' : 'ember'}>
                  {{ paid: 'Pago', pending: 'Aguardando', failed: 'Não concluído',
                     refunded: 'Estornado', expired: 'Expirado' }[o.status]}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* ── sair ──────────────────────────────────────────────────── */}
      <Card className="p-5 grid gap-3">
        <h2 className="font-display text-[17px] font-bold text-ink">Sair</h2>
        {confirming ? (
          <>
            {/* Esta frase dizia "seu progresso neste aparelho continua onde
                está". Desde que sair passou a limpar o cache local, ela
                mentiria - e de um jeito que assusta. O que é verdade agora: o
                progresso mora na CONTA, sai deste navegador, e volta inteiro
                no próximo login. */}
            <p className="font-ui text-[14px] leading-relaxed text-ink-body">
              Você vai precisar do e-mail e da senha para voltar. Seu progresso
              fica guardado na sua conta e volta assim que você entrar de novo,
              aqui ou em qualquer outro aparelho. Ele sai deste navegador para
              que ninguém que use este computador depois de você veja o que
              você estudou.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                onClick={async () => { await account.signOut(); router.replace('/'); }}
              >
                Sair mesmo assim
              </Button>
              <Button variant="ghost" onClick={() => setConfirming(false)}>Cancelar</Button>
            </div>
          </>
        ) : (
          <Button variant="secondary" className="justify-self-start"
                  onClick={() => setConfirming(true)}>
            Sair da conta
          </Button>
        )}
      </Card>

      {!account.can(FLAGSHIP) && (
        <p className="font-ui text-[13px] text-ink-muted">
          Você está logado, mas ainda não tem nenhum curso ativo.{' '}
          <LinkButton href={`/cursos/${FLAGSHIP}`} variant="ghost" size="sm">Ver os cursos</LinkButton>
        </p>
      )}

      <ApagarConta />
    </div>
  );
}

/**
 * Apagar a conta, pelo próprio titular.
 * ─────────────────────────────────────────────────────────────────────────
 * O direito de exclusão da LGPD (art. 18, VI). Até aqui ele existia no papel:
 * a página de reembolso mandava escrever um e-mail. Um direito que depende de
 * alguém do outro lado responder é um direito com horário de atendimento, e
 * uma pessoa que quer sumir dos seus registros não deveria ter de pedir por
 * favor.
 *
 * Três travas, e cada uma para um acidente diferente:
 *
 *   1. Fechado atrás de um botão, como a troca de senha. Um formulário
 *      destrancado no fim do perfil é um clique errado de distância.
 *   2. A SENHA ATUAL. É o que separa o dono de quem pegou o celular
 *      destrancado em cima da mesa.
 *   3. Escrever APAGAR. Serve contra um caso que a senha não cobre: a pessoa
 *      que sabe a senha, está apressada e clica sem ler. Digitar uma palavra
 *      obriga a olhar a tela, que é onde está escrito o que vai acontecer.
 *
 * O que some e o que fica está dito ANTES do formulário, e não depois. Uma
 * confirmação que explica as consequências na tela seguinte é uma armadilha.
 */
function ApagarConta() {
  const account = useAccount();
  const [aberto, setAberto] = useState(false);
  const [senha, setSenha] = useState('');
  const [palavra, setPalavra] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const PALAVRA = 'APAGAR';

  function fechar() {
    setAberto(false);
    setSenha(''); setPalavra(''); setError(null);
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError(null);

    if (palavra.trim().toUpperCase() !== PALAVRA) {
      setError(`Escreva ${PALAVRA} no campo acima para confirmar.`);
      return;
    }

    setBusy(true);
    try {
      await account.deleteAccount({ password: senha });
      setSenha(''); setPalavra('');
      /* Uma PÁGINA, e uma navegação DURA. Duas correções, cada uma para uma
         coisa que foi medida no navegador e falhou:

         1. Uma confirmação renderizada aqui dentro nunca aparece: assim que a
            sessão some, o CourseGate vê /perfil sem dono e manda para
            /entrar. Por isso /conta-apagada é uma rota pública de verdade.
         2. E `router.replace` também perdia - é navegação do cliente, então o
            efeito do portão continuava vivo e corria junto, empurrando para
            /entrar?next=/perfil. Medido: a pessoa apagava a conta e caía na
            tela de login, sem nenhuma confirmação.

         `location.replace` sai do aplicativo inteiro, o que aqui não é um
         truque para ganhar a corrida: apagar a conta é exatamente o momento
         em que nada do estado antigo deve sobreviver em memória. E `replace`,
         e não `assign`, para o botão "voltar" não levar de volta ao perfil de
         uma conta que não existe mais. */
      window.location.replace('/conta-apagada/');
    } catch (err) {
      setError(err instanceof AuthError ? err.message : MESSAGES.server);
      setBusy(false);
    }
  }

  return (
    <Card tone="ember" className="p-5 grid gap-4">
      <h2 className="font-display text-[17px] font-bold text-ink">Apagar minha conta</h2>

      {aberto ? (
        <form onSubmit={submit} className="grid gap-4 max-w-[420px]" noValidate>
          {/* Um aviso, curto. A versão anterior tinha três parágrafos, um
              deles mandando pedir reembolso antes - e isso era assunto de
              outra tela, dito no pior momento possível. Aqui o que importa é
              uma frase: o que acontece, e que não volta. O detalhe do que
              fica guardado, e por quê, está na tela de confirmação e na
              Política de Privacidade, que é onde ele é procurado. */}
          <p className="font-ui text-[14px] leading-relaxed text-ink-body">
            <strong className="font-semibold">Isto não tem volta.</strong> Somem o seu
            e-mail, o seu nome, a sua senha, todo o seu progresso e o seu acesso ao
            curso.
          </p>

          <Campo
            id="apagar-senha" label="Sua senha" value={senha} onChange={setSenha}
            type="password" autoComplete="current-password" required autoFocus
          />
          <Campo
            id="apagar-palavra" label={`Escreva ${PALAVRA}`} value={palavra}
            onChange={setPalavra} type="text" autoComplete="off" required
            hint="Para ter certeza de que não foi um clique sem querer."
          />

          {error && <Erro>{error}</Erro>}

          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={busy}>
              {busy ? 'Apagando…' : 'Apagar minha conta para sempre'}
            </Button>
            <Button type="button" variant="ghost" onClick={fechar}>Cancelar</Button>
          </div>
        </form>
      ) : (
        <>
          <p className="font-ui text-[13.5px] leading-relaxed text-ink-muted">
            Você pode apagar a sua conta e todos os seus dados aqui mesmo, sem
            precisar pedir a ninguém. É definitivo.
          </p>
          <Button variant="ghost" className="justify-self-start"
                  onClick={() => setAberto(true)}>
            Apagar minha conta
          </Button>
        </>
      )}
    </Card>
  );
}

/**
 * Trocar a senha sem sair da página.
 *
 * Começa fechado, atrás de um botão. Um formulário de senha sempre aberto no
 * perfil é um campo a mais para o gerenciador de senhas preencher sozinho e
 * para alguém enviar sem querer - e a operação aqui derruba todas as outras
 * sessões da conta, então "sem querer" custa caro.
 *
 * Pede a senha atual porque a sessão sozinha não pode bastar: um celular
 * emprestado, destrancado, viraria uma conta tomada em dois toques.
 */
function TrocarSenha() {
  const account = useAccount();
  const [aberto, setAberto] = useState(false);
  const [current, setCurrent] = useState('');
  const [senha, setSenha] = useState('');
  const [repeat, setRepeat] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pronto, setPronto] = useState(false);
  const [busy, setBusy] = useState(false);

  function fechar() {
    setAberto(false);
    setCurrent(''); setSenha(''); setRepeat('');
    setError(null);
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError(null);

    if (!passwordOk(senha)) { setError(MESSAGES['weak-password']); return; }
    if (senha !== repeat) { setError('As duas senhas não são iguais.'); return; }
    if (senha === current) { setError('A senha nova é igual à atual.'); return; }

    setBusy(true);
    try {
      await account.changePassword({ current, password: senha });
      /* Fecha e confirma. A confirmação fica na tela depois de o formulário
         sumir: um formulário de senha que continua preenchido depois de
         enviado é o que o navegador reoferece na próxima visita. */
      setCurrent(''); setSenha(''); setRepeat('');
      setAberto(false);
      setPronto(true);
    } catch (err) {
      setError(err instanceof AuthError ? err.message : MESSAGES.server);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="p-5 grid gap-4">
      <h2 className="font-display text-[17px] font-bold text-ink">Senha</h2>

      {pronto && !aberto && (
        <Aviso>
          Senha trocada. Os outros aparelhos onde você estava logado foram
          desconectados - este continua.
        </Aviso>
      )}

      {aberto ? (
        <form onSubmit={submit} className="grid gap-4 max-w-[420px]" noValidate>
          <Campo
            id="senha-atual" label="Senha atual" value={current} onChange={setCurrent}
            type="password" autoComplete="current-password" required autoFocus
          />
          <Campo
            id="senha-nova" label="Senha nova" value={senha} onChange={setSenha}
            type="password" autoComplete="new-password" required
            hint={`Pelo menos ${MIN_PASSWORD} caracteres.`}
          />
          <Campo
            id="senha-nova2" label="Repita a senha nova" value={repeat} onChange={setRepeat}
            type="password" autoComplete="new-password" required
          />

          {error && <Erro>{error}</Erro>}

          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={busy}>
              {busy ? 'Trocando…' : 'Trocar a senha'}
            </Button>
            <Button type="button" variant="ghost" onClick={fechar}>Cancelar</Button>
          </div>
        </form>
      ) : (
        <>
          <p className="font-ui text-[13.5px] leading-relaxed text-ink-muted">
            Trocar a senha desconecta os outros aparelhos. É o que você quer se
            achar que alguém entrou na sua conta.
          </p>
          <Button variant="secondary" className="justify-self-start"
                  onClick={() => { setPronto(false); setAberto(true); }}>
            Trocar a senha
          </Button>
        </>
      )}
    </Card>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="grid gap-0.5">
      <dt className="font-ui text-[10.5px] uppercase tracking-[.07em] text-ink-muted">{k}</dt>
      <dd className="font-ui text-[14.5px] text-ink break-words">{v}</dd>
    </div>
  );
}

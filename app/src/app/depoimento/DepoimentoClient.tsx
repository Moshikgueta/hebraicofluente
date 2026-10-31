'use client';

/* Deixe o seu depoimento (29/09/2026).
 * ─────────────────────────────────────────────────────────────────────────
 * Três perguntas curtas para ajudar a escrever, um texto livre, a forma de
 * assinar e duas caixas que começam desmarcadas: publicar e ser contatado.
 * Sem a primeira, o texto é só uma opinião para o dono do curso ler.
 *
 * A prévia mostra exatamente como o depoimento apareceria, com a assinatura
 * escolhida - a pessoa autoriza o que está vendo, e não uma descrição. E a
 * página diz, perto do botão, que dá para retirar quando quiser.
 *
 * Nada de brinde, desconto ou XP em troca: depoimento pago não é depoimento.
 */

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Card, Badge } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Aviso, Erro } from '@/components/platform/Campo';
import { asset } from '@/lib/asset';
import { useAccount } from '@/lib/account/store';
import {
  assinatura, ERROS, TEXTO_MAX, TEXTO_MIN, tamanho, type Depoimento, type Forma
} from '@/lib/depoimento';
import { fmt } from '@/i18n';
import { tx } from '@/i18n/telas/painel-depoimento-client';

const VAZIO: Depoimento = { texto: '', forma: 'nome', nomePublico: '', cidade: '', publicar: false, contato: false };

const ESTADO_PT = {
  novo: tx.estadoNovo,
  aprovado: tx.estadoAprovado,
  recusado: tx.estadoRecusado
} as const;

const inputCls = 'w-full min-h-[52px] rounded-[var(--r-md)] border border-[color:var(--line)] bg-surface px-4 ' +
  'font-ui text-[16px] text-ink focus:outline-none focus:ring-2 focus:ring-[var(--accent)]';

export function DepoimentoClient() {
  const account = useAccount();
  const [d, setD] = useState<Depoimento>(VAZIO);
  const [salvo, setSalvo] = useState<Depoimento | null>(null);
  const [carregado, setCarregado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [confirmarRetirar, setConfirmarRetirar] = useState(false);

  useEffect(() => {
    if (!account.signedIn) return;
    let parar = false;
    void (async () => {
      try {
        const r = await fetch(asset('/api/depoimento'), { credentials: 'same-origin', cache: 'no-store' });
        if (!r.ok) { if (!parar) { setErro(ERROS[(await r.json().catch(() => ({})) as { error?: string }).error ?? ''] ?? null); setCarregado(true); } return; }
        const { depoimento } = await r.json() as { depoimento: Depoimento | null };
        if (parar) return;
        if (depoimento) { setD(depoimento); setSalvo(depoimento); }
        else setD(v => ({ ...v, nomePublico: account.session?.account.name ?? '' }));
        setCarregado(true);
      } catch { if (!parar) setCarregado(true); }
    })();
    return () => { parar = true; };
  }, [account.signedIn, account.session]);

  if (!account.ready || !account.session || !carregado) return null;

  const muda = <K extends keyof Depoimento>(k: K, v: Depoimento[K]) => { setD(x => ({ ...x, [k]: v })); setOk(null); };
  const n = tamanho(d.texto);

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    setErro(null); setOk(null);
    if (n < TEXTO_MIN) return setErro(ERROS['texto-curto']!);
    if (n > TEXTO_MAX) return setErro(ERROS['texto-longo']!);
    if (d.forma === 'nome' && !d.nomePublico.trim()) return setErro(ERROS['nome-faltando']!);
    setEnviando(true);
    try {
      const r = await fetch(asset('/api/depoimento'), {
        method: 'PUT', credentials: 'same-origin', cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          texto: d.texto, forma: d.forma, nomePublico: d.nomePublico, cidade: d.cidade,
          publicar: d.publicar, contato: d.contato
        })
      });
      if (!r.ok) {
        const { error } = await r.json().catch(() => ({})) as { error?: string };
        setErro(ERROS[error ?? ''] ?? tx.erroEnviar);
        return;
      }
      const novo = { ...d, estado: 'novo' as const };
      setSalvo(novo); setD(novo);
      setOk(d.publicar
        ? tx.obrigadoAutorizado
        : tx.obrigadoPrivado);
    } catch {
      setErro(tx.erroInternet);
    } finally { setEnviando(false); }
  };

  const retirar = async () => {
    setErro(null); setOk(null);
    try {
      const r = await fetch(asset('/api/depoimento'), { method: 'DELETE', credentials: 'same-origin', cache: 'no-store' });
      if (!r.ok) throw new Error();
      setSalvo(null); setD({ ...VAZIO, nomePublico: account.session?.account.name ?? '' }); setConfirmarRetirar(false);
      setOk(tx.retirado);
    } catch {
      setErro(tx.erroRetirar);
    }
  };

  return (
    <div className="grid gap-6 focus-col">
      <header className="grid gap-3">
        <Link href="/meu-hebraico" className="inline-flex items-center min-h-[44px] pr-3 font-ui text-[13px] text-ink-muted hover:text-ink-body">
          {tx.voltar}
        </Link>
        <h1 className="text-[27px] sm:text-[32px] font-bold leading-tight">{tx.titulo}</h1>
        <p className="text-[16px] leading-relaxed text-ink-body">
          {tx.intro}
        </p>
      </header>

      {salvo?.estado && (
        <Card tone="wash" className="p-4 grid gap-1">
          <Badge tone="accent">{tx.seuDepoimento}</Badge>
          <p className="font-ui text-[14px] text-ink-body m-0">{ESTADO_PT[salvo.estado]}</p>
        </Card>
      )}

      <form onSubmit={enviar} className="grid gap-5" noValidate>
        <Card className="p-5 sm:p-6 grid gap-3">
          <label htmlFor="dep-texto" className="text-[18px] font-semibold">{tx.oSeuDepoimento}</label>
          <p id="dep-dicas" className="font-ui text-[14px] leading-relaxed text-ink-muted m-0">
            {tx.dicas}
          </p>
          <textarea
            id="dep-texto" value={d.texto} onChange={e => muda('texto', e.target.value)}
            rows={7} maxLength={TEXTO_MAX + 200} aria-describedby="dep-dicas dep-conta"
            className={`${inputCls} py-3 leading-relaxed min-h-[180px]`}
          />
          <p id="dep-conta" aria-live="polite"
             className={`font-ui text-[12.5px] m-0 ${n > TEXTO_MAX ? 'text-[var(--ember)]' : 'text-ink-muted'}`}>
            {fmt(tx.contagem, { n, max: TEXTO_MAX })}{n < TEXTO_MIN ? fmt(tx.minimo, { min: TEXTO_MIN }) : ''}
          </p>
        </Card>

        <Card className="p-5 sm:p-6 grid gap-3">
          <fieldset className="grid gap-2 border-0 p-0 m-0">
            <legend className="text-[18px] font-semibold mb-2">{tx.comoAssinar}</legend>
            {([
              ['nome', tx.formaNome],
              ['iniciais', tx.formaIniciais],
              ['anonimo', tx.formaAnonimo]
            ] as [Forma, string][]).map(([v, rotulo]) => (
              <label key={v} className="flex items-center gap-3 min-h-[44px] font-ui text-[15px] text-ink cursor-pointer">
                <input type="radio" name="forma" value={v} checked={d.forma === v}
                       onChange={() => muda('forma', v)} className="w-5 h-5 accent-[var(--accent)]" />
                {rotulo}
              </label>
            ))}
          </fieldset>
          {d.forma !== 'anonimo' && (
            <div className="grid sm:grid-cols-2 gap-3">
              <label className="grid gap-1 font-ui text-[14px] text-ink">
                {d.forma === 'iniciais' ? tx.nomeIniciais : tx.nomeQueAparece}
                <input value={d.nomePublico} onChange={e => muda('nomePublico', e.target.value)}
                       maxLength={60} autoComplete="name" className={inputCls} />
              </label>
              <label className="grid gap-1 font-ui text-[14px] text-ink">
                {tx.cidade}
                <input value={d.cidade} onChange={e => muda('cidade', e.target.value)}
                       maxLength={60} autoComplete="address-level2" className={inputCls} />
              </label>
            </div>
          )}
        </Card>

        {n > 0 && (
          <Card tone="mint" className="p-5 sm:p-6 grid gap-2">
            <p className="font-ui text-[12px] uppercase tracking-[.07em] text-ink-muted m-0">{tx.comoApareceria}</p>
            <blockquote className="m-0 text-[16px] leading-relaxed text-ink whitespace-pre-line">“{d.texto.trim()}”</blockquote>
            <p className="font-ui text-[14px] font-semibold text-ink m-0">- {assinatura(d)}</p>
          </Card>
        )}

        <Card className="p-5 sm:p-6 grid gap-4">
          <label className="flex items-start gap-3 font-ui text-[15px] leading-relaxed text-ink cursor-pointer">
            <input type="checkbox" checked={d.publicar} onChange={e => muda('publicar', e.target.checked)}
                   className="w-5 h-5 mt-1 shrink-0 accent-[var(--accent)]" />
            <span>
              {tx.autorizo}
            </span>
          </label>
          <label className="flex items-start gap-3 font-ui text-[15px] leading-relaxed text-ink cursor-pointer">
            <input type="checkbox" checked={d.contato} onChange={e => muda('contato', e.target.checked)}
                   className="w-5 h-5 mt-1 shrink-0 accent-[var(--accent)]" />
            <span>{tx.aceitoEmail}</span>
          </label>
          <p className="font-ui text-[13px] leading-relaxed text-ink-muted m-0">
            {/* LEGAL-107 (auditoria de 01/10/2026): a página prometia "o texto
                não é editado por ninguém", e a vitrine publica trechos. A
                regra agora é a que se pratica: as palavras são as suas, e
                todo corte aparece marcado. */}
            {tx.regras(t => <Link href="/privacidade" className="underline underline-offset-2">{t}</Link>)}
          </p>
        </Card>

        {erro && <Erro>{erro}</Erro>}
        {ok && <Aviso>{ok}</Aviso>}

        <Button type="submit" size="lg" full disabled={enviando}>
          {enviando ? tx.enviando : salvo ? tx.salvarMudancas : tx.enviar}
        </Button>
      </form>

      {salvo && (
        <Card className="p-5 grid gap-3">
          <h2 className="text-[17px] font-semibold m-0">{tx.retirarTitulo}</h2>
          <p className="font-ui text-[14px] leading-relaxed text-ink-body m-0">
            {tx.retirarTexto}
          </p>
          {confirmarRetirar ? (
            <div className="flex flex-wrap gap-2">
              <Button variant="primary" onClick={retirar}>{tx.simRetirar}</Button>
              <Button variant="secondary" onClick={() => setConfirmarRetirar(false)}>{tx.cancelar}</Button>
            </div>
          ) : (
            <Button variant="secondary" onClick={() => setConfirmarRetirar(true)}>{tx.retirarTitulo}</Button>
          )}
        </Card>
      )}
    </div>
  );
}

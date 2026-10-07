'use client';

/* O exame final do A1.
 * ─────────────────────────────────────────────────────────────────────────
 * A prova vem do servidor, sem gabarito; o aluno responde tudo, sem saber o
 * que acertou, e entrega. Quem corrige é o servidor. O relatório mostra a
 * nota geral, a nota por habilidade, os pontos fortes, e as unidades para
 * revisar ("Antes de concluir, recomendamos revisar…").
 *
 * As respostas ficam no sessionStorage, pela prova: recarregar a página no
 * meio não perde o que já foi respondido (a lição do exame do alfabeto). */

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Badge, Card } from '@/components/ui/Card';
import { Button, LinkButton } from '@/components/ui/Button';
import { He } from '@/components/hebrew/He';
import { AudioButton } from '@/components/learn/AudioButton';
import { TecladoHebraico } from '@/components/learn/TecladoHebraico';
import { Misto } from '@/components/a1/A1Player';
import { useProgress } from '@/lib/state/store';
import { cursoA1 } from '@/lib/a1';
import { entregarProva, falhou, iniciarProva, type ProvaA1, type ResultadoProvaA1 } from '@/lib/a1-exame';
import type { ItemPublico, Resposta } from '@/lib/a1-prova';
import type { Selecao } from '@/lib/teclado-hebraico';

const CHAVE = 'hf-a1-prova';
const ERROS: Record<string, string> = {
  limite: 'Você já começou 5 provas nas últimas 24 horas. Tente de novo amanhã: dá tempo de revisar.',
  'not-owned': 'O exame é do curso Hebraico A1.',
  expirada: 'Esta prova passou de 4 horas e venceu. Comece outra.',
  'ja-entregue': 'Esta prova já foi entregue.',
  rede: 'Não consegui falar com o servidor. Confira a internet e tente de novo.'
};

type Plana = { parte: string; tituloParte: string; texto?: string; item: ItemPublico };

function guardar(prova: ProvaA1, respostas: Resposta[], pos: number) {
  try { sessionStorage.setItem(CHAVE, JSON.stringify({ prova, respostas, pos })); } catch { /* sem armazenamento */ }
}
function recuperar(): { prova: ProvaA1; respostas: Resposta[]; pos: number } | null {
  try {
    const t = sessionStorage.getItem(CHAVE);
    if (!t) return null;
    const v = JSON.parse(t) as { prova: ProvaA1; respostas: Resposta[]; pos: number };
    return new Date(v.prova.expiraEm).getTime() > Date.now() ? v : null;
  } catch { return null; }
}
const esquecer = () => { try { sessionStorage.removeItem(CHAVE); } catch { /* sem armazenamento */ } };

export function ExameA1Client() {
  const p = useProgress();
  const curso = cursoA1();
  const [prova, setProva] = useState<ProvaA1 | null>(null);
  const [respostas, setRespostas] = useState<Resposta[]>([]);
  const [pos, setPos] = useState(0);
  const [estado, setEstado] = useState<'inicio' | 'carregando' | 'prova' | 'entregando' | 'resultado'>('inicio');
  const [erro, setErro] = useState<string | null>(null);
  const [resultado, setResultado] = useState<ResultadoProvaA1 | null>(null);

  useEffect(() => {
    const r = recuperar();
    if (r) { setProva(r.prova); setRespostas(r.respostas); setPos(r.pos); setEstado('prova'); }
  }, []);

  const plana = useMemo<Plana[]>(() => (prova?.partes ?? []).flatMap(pt =>
    pt.itens.map(item => ({ parte: pt.id, tituloParte: pt.tituloPt, texto: pt.texto?.he, item }))), [prova]);

  const comecar = async () => {
    setErro(null);
    setEstado('carregando');
    const r = await iniciarProva();
    if (falhou(r)) { setErro(ERROS[r.erro] ?? 'Não deu para começar a prova agora.'); setEstado('inicio'); return; }
    const vazias = r.partes.flatMap(x => x.itens).map(() => null);
    setProva(r); setRespostas(vazias); setPos(0); setEstado('prova');
    guardar(r, vazias, 0);
  };

  const responder = (v: Resposta) => {
    if (!prova) return;
    const prox = respostas.map((x, k) => (k === pos ? v : x));
    setRespostas(prox);
    guardar(prova, prox, pos);
  };
  const ir = (k: number) => { if (!prova) return; setPos(k); guardar(prova, respostas, k); };

  const entregar = async () => {
    if (!prova) return;
    setEstado('entregando');
    const r = await entregarProva(prova.prova, respostas);
    if (falhou(r)) {
      setErro(ERROS[r.erro] ?? 'Não deu para entregar agora. Tente de novo.');
      if (r.erro === 'expirada' || r.erro === 'ja-entregue' || r.erro === 'not-found') { esquecer(); setProva(null); setEstado('inicio'); }
      else setEstado('prova');
      return;
    }
    esquecer();
    p.finishExameA1(r.nota, r.partes, r.aprovacao);
    setResultado(r);
    setEstado('resultado');
  };

  if (estado === 'resultado' && resultado && prova) {
    return <Relatorio r={resultado} prova={prova} plana={plana} respostas={respostas} />;
  }

  if ((estado === 'prova' || estado === 'entregando') && prova && plana.length) {
    const atual = plana[pos]!;
    const respondidas = respostas.filter(x => x !== null && x !== '').length;
    const ultima = pos === plana.length - 1;
    return (
      <div className="focus-col grid gap-5">
        <header className="grid gap-2">
          <p className="font-ui text-[13px] uppercase tracking-[.07em] text-ink-muted m-0">Exame final · {atual.tituloParte}</p>
          <div className="h-2 rounded-full bg-surface-2 overflow-hidden" aria-hidden>
            <div className="h-full bg-[var(--accent)] transition-all" style={{ width: `${((pos + 1) / plana.length) * 100}%` }} />
          </div>
          <p className="font-ui text-[13px] text-ink-muted m-0" aria-live="polite">
            Pergunta {pos + 1} de {plana.length} · {respondidas} respondidas
          </p>
        </header>
        {atual.texto && (
          <Card tone="wash" className="p-5 grid gap-2">
            <p className="font-ui text-[12px] uppercase tracking-[.07em] text-ink-muted m-0">O texto</p>
            <p dir="rtl" lang="he" className="m-0 he text-[22px] leading-[1.9] text-ink">{atual.texto}</p>
          </Card>
        )}
        <Card className="p-5 sm:p-6">
          <ItemDoExame key={pos} item={atual.item} valor={respostas[pos] ?? null} onChange={responder} />
        </Card>
        {erro && <p role="alert" className="font-ui text-[14px] text-[var(--amber)] m-0">{erro}</p>}
        <div className="flex flex-wrap gap-2 justify-between">
          <Button variant="ghost" onClick={() => ir(pos - 1)} disabled={pos === 0}>Anterior</Button>
          {ultima
            ? <Button onClick={entregar} disabled={estado === 'entregando'}>{estado === 'entregando' ? 'Corrigindo…' : 'Entregar a prova'}</Button>
            : <Button onClick={() => ir(pos + 1)}>Próxima</Button>}
        </div>
        {ultima && respondidas < plana.length && (
          <p className="font-ui text-[13.5px] text-ink-muted m-0">
            {plana.length - respondidas} sem resposta. Pergunta em branco conta como errada.
          </p>
        )}
      </div>
    );
  }

  const ex = curso.exame;
  return (
    <div className="grid gap-6 reading">
      <header className="grid gap-3">
        <Link href="/a1" className="inline-flex items-center min-h-[44px] pr-3 font-ui text-[13px] text-ink-muted hover:text-ink-body">
          ← Hebraico A1
        </Link>
        <Badge tone="accent">Exame final</Badge>
        <h1 className="text-[27px] sm:text-[33px] font-bold leading-tight m-0">O exame do A1</h1>
        <p className="text-[16px] leading-relaxed text-ink-body m-0">
          {ex.partes.length} partes, uma por habilidade: {ex.partes.map(x => x.tituloPt.toLowerCase()).join(', ')}.
          São {ex.sorteio} perguntas por parte, sorteadas a cada tentativa. Você responde tudo e entrega; a correção vem no fim,
          com a nota de cada habilidade. Aprova com {Math.round(ex.aprovacao * 100)}%.
        </p>
      </header>
      <Card tone="wash" className="p-5 grid gap-2">
        <p className="font-ui text-[14.5px] text-ink-body m-0">
          Sem tempo marcado, e sem nikud obrigatório nas respostas escritas. A escuta só entra com as gravações prontas.
          Você pode tentar até 5 vezes por dia; cada tentativa é uma prova nova.
        </p>
      </Card>
      {erro && <p role="alert" className="font-ui text-[14px] text-[var(--amber)] m-0">{erro}</p>}
      <Button size="lg" onClick={comecar} disabled={estado === 'carregando'}>
        {estado === 'carregando' ? 'Sorteando a prova…' : 'Começar o exame'}
      </Button>
      {p.state.a1.exame.passedAt && (
        <LinkButton href="/a1/certificado" variant="secondary">Você já passou no exame: ver o certificado</LinkButton>
      )}
    </div>
  );
}

/* ── um item, respondendo sem saber se acertou ───────────────────────── */

function ItemDoExame({ item, valor, onChange }: { item: ItemPublico; valor: Resposta; onChange: (v: Resposta) => void }) {
  const enunciado = item.q ?? (item.pt ? `Escreva em hebraico: "${item.pt}"` : '');
  return (
    <div className="grid gap-4">
      {item.t === 'montar'
        ? <Titulo texto={`Monte a frase: "${item.pt}"`} />
        : enunciado && <Titulo texto={enunciado} />}
      {item.t === 'ouvir' && item.audioId && <div className="justify-self-center"><AudioButton audioId={item.audioId} size="lg" slow /></div>}
      {item.linhas && (
        <ol className="grid gap-2 m-0 p-0 list-none">
          {item.linhas.map(([quem, he], k) => (
            <li key={k} className="rounded-[var(--r-md)] bg-surface-2 px-3 py-2 grid gap-0.5">
              <span className="font-ui text-[12px] font-semibold text-ink-muted">{quem}</span>
              <He size="word">{he}</He>
            </li>
          ))}
        </ol>
      )}
      {item.opcoes && (
        <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Opções">
          {item.opcoes.map((o, k) => (
            <button key={k} type="button" role="radio" aria-checked={valor === k} onClick={() => onChange(k)}
              className={`min-h-[56px] px-4 py-2 rounded-[var(--r-md)] border-2 text-ink
                ${valor === k ? 'border-[var(--accent)] bg-[var(--accent-wash)]' : 'border-line bg-surface hover:border-[var(--accent-soft)]'}`}>
              {/[א-ת]/.test(o) && !/[A-Za-zÀ-ÿ]/.test(o) ? <He size="word">{o}</He> : <span className="font-ui text-[16px]">{o}</span>}
            </button>
          ))}
        </div>
      )}
      {item.t === 'vf' && (
        <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Verdadeiro ou falso">
          {[true, false].map(v => (
            <button key={String(v)} type="button" role="radio" aria-checked={valor === v} onClick={() => onChange(v)}
              className={`min-h-[56px] rounded-[var(--r-md)] border-2 font-ui text-[16px] text-ink
                ${valor === v ? 'border-[var(--accent)] bg-[var(--accent-wash)]' : 'border-line bg-surface'}`}>
              {v ? 'Verdadeiro' : 'Falso'}
            </button>
          ))}
        </div>
      )}
      {item.t === 'completar' && (
        <p dir="rtl" lang="he" className="m-0 text-center">
          {item.antes && <He size="word">{item.antes}</He>}
          <span className="inline-block mx-2 min-w-[3ch] border-b-2 border-[var(--accent-soft)]" aria-label="lacuna">&nbsp;</span>
          {item.depois && <He size="word">{item.depois}</He>}
        </p>
      )}
      {item.t === 'erro' && <p className="m-0 text-center"><He size="word">{item.errada!}</He></p>}
      {(item.t === 'completar' || item.t === 'escrever' || item.t === 'erro') && (
        <CampoHebraico valor={typeof valor === 'string' ? valor : ''} onChange={onChange} />
      )}
      {item.t === 'montar' && item.palavras && (
        <Montagem palavras={item.palavras} valor={Array.isArray(valor) ? valor : []} onChange={onChange} />
      )}
    </div>
  );
}

const Titulo = ({ texto }: { texto: string }) => (
  <p className="font-display text-[19px] sm:text-[21px] font-semibold leading-snug text-ink m-0"><Misto texto={texto} /></p>
);

function CampoHebraico({ valor, onChange }: { valor: string; onChange: (v: string) => void }) {
  const campo = useRef<HTMLInputElement | null>(null);
  const selecao = useRef<Selecao>({ ini: valor.length, fim: valor.length });
  const lembrar = () => {
    const el = campo.current;
    if (el) selecao.current = { ini: el.selectionStart ?? el.value.length, fim: el.selectionEnd ?? el.value.length };
  };
  return (
    <div className="grid gap-3">
      <input ref={campo} value={valor} onChange={e => { onChange(e.target.value); lembrar(); }}
        onSelect={lembrar} onKeyUp={lembrar} onClick={lembrar} onBlur={lembrar}
        dir="rtl" lang="he" autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck={false}
        aria-label="Sua resposta, em hebraico" placeholder="digite aqui, em hebraico"
        className="w-full min-h-[56px] px-4 rounded-[var(--r-md)] border-2 border-line bg-surface he text-[24px] text-ink placeholder:text-ink-muted placeholder:text-[16px] focus:border-[var(--accent-soft)]" />
      <TecladoHebraico campo={campo} valor={valor} selecao={selecao} aoEditar={e => onChange(e.valor)} />
    </div>
  );
}

function Montagem({ palavras, valor, onChange }: { palavras: string[]; valor: number[]; onChange: (v: number[]) => void }) {
  return (
    <div className="grid gap-3">
      <div dir="rtl" className="min-h-[64px] rounded-[var(--r-md)] border-2 border-dashed border-line p-3 flex flex-wrap gap-2 items-center"
        aria-label="A frase que você montou">
        {valor.map((k, i) => <span key={i} className="px-2 rounded-md bg-surface-2"><He size="word">{palavras[k]!}</He></span>)}
      </div>
      <div dir="rtl" className="flex flex-wrap gap-2 justify-center">
        {palavras.map((w, k) => (
          <button key={k} type="button" disabled={valor.includes(k)} onClick={() => onChange([...valor, k])}
            className="min-h-[52px] px-3 rounded-[var(--r-md)] border-2 border-line bg-surface hover:border-[var(--accent-soft)] disabled:opacity-30">
            <He size="word">{w}</He>
          </button>
        ))}
      </div>
      <Button variant="ghost" onClick={() => onChange(valor.slice(0, -1))} disabled={!valor.length} className="justify-self-start">
        Apagar a última
      </Button>
    </div>
  );
}

/* ── o relatório ──────────────────────────────────────────────────────── */

function Relatorio({ r, prova, plana, respostas }: { r: ResultadoProvaA1; prova: ProvaA1; plana: Plana[]; respostas: Resposta[] }) {
  const curso = cursoA1();
  const titulo = (id: string) => curso.exame.partes.find(x => x.id === id)?.tituloPt ?? id;
  const pct = (x: { correct: number; total: number }) => Math.round((x.correct / x.total) * 100);
  const fortes = Object.entries(r.partes).filter(([, v]) => v.correct / v.total >= 0.85).map(([id]) => titulo(id));
  const nomeUnidade = (n: number) => curso.unidades.find(u => u.n === n)?.tituloPt ?? '';
  void prova;
  return (
    <div className="focus-col grid gap-6">
      <Card tone={r.aprovado ? 'mint' : 'ember'} className="p-6 sm:p-8 grid gap-3 text-center">
        <p className="font-ui text-[12px] uppercase tracking-[.12em] text-ink-muted m-0">Exame final do A1</p>
        <p className="font-display text-[44px] font-bold text-ink m-0 leading-none">{Math.round(r.nota * 100)}%</p>
        <p className="font-display text-[20px] font-semibold text-ink m-0" role="status">
          {r.aprovado ? 'Aprovado.' : `Ainda não: a aprovação é com ${Math.round(r.aprovacao * 100)}%.`}
        </p>
      </Card>

      <section className="grid gap-3" aria-labelledby="t-hab">
        <h2 id="t-hab" className="font-display text-[20px] font-semibold m-0">Por habilidade</h2>
        <ul className="grid gap-2.5 m-0 p-0 list-none">
          {Object.entries(r.partes).map(([id, v]) => (
            <li key={id} className="grid gap-1">
              <div className="flex justify-between font-ui text-[14px]">
                <span className="font-semibold text-ink">{titulo(id)}</span>
                <span className="text-ink-body">{v.correct} de {v.total} ({pct(v)}%){pct(v) < 70 ? ' · rever' : ''}</span>
              </div>
              <div className="h-2 rounded-full bg-surface-2 overflow-hidden" role="progressbar" aria-label={titulo(id)}
                aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct(v)}>
                <div className={`h-full ${pct(v) >= 70 ? 'bg-[var(--green)]' : 'bg-[var(--amber)]'}`} style={{ width: `${pct(v)}%` }} />
              </div>
            </li>
          ))}
        </ul>
        {r.fora.length > 0 && (
          <p className="font-ui text-[13.5px] text-ink-muted m-0">
            {r.fora.map(titulo).join(', ')}: ainda sem gravações, não entrou nesta prova nem na nota.
          </p>
        )}
      </section>

      {fortes.length > 0 && (
        <Card className="p-5 grid gap-1">
          <h2 className="font-display text-[18px] font-semibold text-ink m-0">Pontos fortes</h2>
          <p className="text-[15px] text-ink-body m-0">{fortes.join(', ')}.</p>
        </Card>
      )}

      {r.revisar.length > 0 && (
        <Card tone="wash" className="p-5 grid gap-2">
          <h2 className="font-display text-[18px] font-semibold text-ink m-0">
            {r.aprovado ? 'Para ficar ainda mais firme, reveja:' : 'Antes de tentar de novo, recomendamos revisar:'}
          </h2>
          <ul className="grid gap-1 m-0 p-0 list-none">
            {r.revisar.map(n => (
              <li key={n}>
                <Link href={`/a1/unidade/${n}`} className="inline-flex min-h-[40px] items-center font-ui text-[15px] text-ink underline underline-offset-2">
                  Unidade {n}: {nomeUnidade(n)}
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <details className="rounded-[var(--r-md)] border border-line bg-surface px-4 py-2">
        <summary className="cursor-pointer min-h-[44px] flex items-center font-ui text-[14.5px] text-ink">Ver as respostas, uma a uma</summary>
        <ol className="grid gap-3 m-0 p-0 pb-3 list-none">
          {r.itens.map((it, k) => {
            const pl = plana[k];
            const dada = respostas[k];
            return (
              <li key={k} className="border-t border-[color:var(--line-soft)] pt-3 grid gap-1">
                <span className="font-ui text-[12.5px] text-ink-muted">
                  {titulo(it.parte)} · <span aria-hidden>{it.certo ? '✓' : '✗'}</span> {it.certo ? 'certo' : 'errado'}
                </span>
                {pl && <span className="text-[15px] text-ink-body"><Misto texto={pl.item.q ?? pl.item.pt ?? ''} /></span>}
                {!it.certo && (
                  <span className="text-[15px] text-ink-body">
                    {dada === null || dada === '' ? 'Em branco. ' : ''}Certo: <Misto texto={it.certaPt} />
                  </span>
                )}
                {it.porque && <span className="font-ui text-[13.5px] text-ink-muted"><Misto texto={it.porque} /></span>}
              </li>
            );
          })}
        </ol>
      </details>

      <div className="flex flex-wrap gap-2 justify-center">
        {r.aprovado
          ? <LinkButton href="/a1/concluido">Continuar</LinkButton>
          : <LinkButton href="/a1/revisao">Ir para a revisão</LinkButton>}
        <LinkButton href="/a1" variant="secondary">Voltar ao curso</LinkButton>
      </div>
    </div>
  );
}

'use client';

/* Uma unidade do A1, em etapas (lib/a1.ts, etapasDaUnidade).
 * ─────────────────────────────────────────────────────────────────────────
 * Antes, a unidade era uma página para ler inteira (palavras, gramática,
 * diálogo) e só depois praticar. Agora o aluno anda em pedaços: a conversa
 * primeiro, para ouvir, entender e falar; as palavras em blocos de até 12; e
 * cada ponto de gramática seguido da sua prática. Cada etapa abre a seguinte.
 * A etapa a que o aluno chegou fica guardada no aparelho; quem já concluiu a
 * unidade vê tudo aberto, para consultar. A rodada final, que conclui a
 * unidade, continua igual. */

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge, Card } from '@/components/ui/Card';
import { Button, LinkButton } from '@/components/ui/Button';
import { He } from '@/components/hebrew/He';
import { AudioButton, hasAudio, useRegistroDeAudio } from '@/components/learn/AudioButton';
import { LinhasDeLeitura } from '@/components/learn/LinhasDeLeitura';
import { CompararPronuncia } from '@/components/learn/CompararPronuncia';
import { GravarLeitura } from '@/components/learn/GravarLeitura';
import { Misto } from '@/components/a1/A1Player';
import { useProgress } from '@/lib/state/store';
import {
  ehFormas, etapasDaUnidade, moduloDaUnidade, UNIDADES_A1, unidadeA1,
  type CaixaA1, type EtapaA1, type FormasA1, type PalavraA1, type UnidadeA1
} from '@/lib/a1';
import { A1Player } from '@/components/a1/A1Player';
import { TituloComSelo } from '@/components/learn/Blocks';
import { chaveDeFrase, chaveDePalavra, favorito, unidadeConcluida } from '@/lib/state/a1-estado';
import { ChaveTranslit, Translit, modoTranslit, type ModoTranslit } from '@/components/a1/TranslitA1';

const ROTULOS_4 = ['masculino', 'feminino', 'masc. plural', 'fem. plural'];

const chaveDaEtapa = (n: number) => `hf-a1-etapa-${n}`;
function lerEtapa(n: number): number {
  try { return Math.max(0, Number(localStorage.getItem(chaveDaEtapa(n))) || 0); } catch { return 0; }
}
function gravarEtapa(n: number, k: number) {
  try { localStorage.setItem(chaveDaEtapa(n), String(k)); } catch { /* sem armazenamento */ }
}

const nomeDaEtapa = (e: EtapaA1, u: UnidadeA1): string => {
  switch (e.tipo) {
    case 'conversa': return 'A conversa';
    case 'palavras': return e.blocos > 1 ? `Palavras (${e.bloco} de ${e.blocos})` : 'Palavras';
    case 'gramatica': return u.gramatica[e.ponto]!.tituloPt;
    case 'leitura': return 'Leitura';
    case 'fim': return 'Fechando a unidade';
  }
};

export function UnidadeA1Client({ n }: { n: number }) {
  const p = useProgress();
  /* As palavras perguntam `hasAudio`: sem assinar, não redesenham quando o
     registro das gravações chega. */
  useRegistroDeAudio();
  const u = unidadeA1(n);
  const etapas = useMemo(() => (u ? etapasDaUnidade(u) : []), [u]);
  const feita = unidadeConcluida(p.state.a1, n);
  const [chegou, setChegou] = useState(0);
  const [tudo, setTudo] = useState(false);
  const ultima = useRef<HTMLElement | null>(null);
  useEffect(() => { setChegou(lerEtapa(n)); }, [n]);
  if (!u) notFound();
  const modulo = moduloDaUnidade(n);
  const posicao = UNIDADES_A1.indexOf(n) + 1;
  const modo = modoTranslit(p.state.a1.translit?.valor, n);
  const aberto = feita || tudo;
  const visiveis = aberto ? etapas.length : Math.min(chegou + 1, etapas.length);

  const avancar = (k: number) => {
    const prox = Math.max(chegou, k + 1);
    setChegou(prox);
    gravarEtapa(n, prox);
    setTimeout(() => ultima.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
  };

  return (
    <div className="grid gap-6 reading">
      <header className="grid gap-3">
        <Link href="/a1" className="inline-flex items-center min-h-[44px] pr-3 font-ui text-[13px] text-ink-muted hover:text-ink-body">
          ← Hebraico A1
        </Link>
        <div className="flex flex-wrap gap-2">
          <Badge tone="accent">
            {modulo ? `Módulo ${modulo.n} · ` : ''}Unidade {n}{posicao > 0 ? ` (${posicao} de ${UNIDADES_A1.length})` : ''}{feita ? ' · concluída ✓' : ''}
          </Badge>
          {!u.revisado && <Badge tone="ember">Rascunho: aguardando a revisão do hebraico</Badge>}
        </div>
        <h1 className="text-[27px] sm:text-[33px] font-bold leading-tight m-0">{u.tituloPt}</h1>
        <p className="text-[16px] leading-relaxed text-ink-body m-0">
          <strong>No fim, você sabe:</strong> {u.objetivoPt}
        </p>
        <details className="rounded-[var(--r-md)] border border-line bg-surface px-4 py-1">
          <summary className="cursor-pointer min-h-[44px] flex items-center font-ui text-[14px] text-ink">
            {aberto ? `${etapas.length} etapas` : `Etapa ${visiveis} de ${etapas.length}: ${nomeDaEtapa(etapas[visiveis - 1]!, u)}`}
          </summary>
        <nav aria-label="Etapas da unidade" className="pb-3">
          <ol className="flex flex-wrap gap-1.5 m-0 p-0 list-none">
            {etapas.map((e, k) => (
              <li key={k}>
                <span className={`inline-flex items-center min-h-[30px] px-2.5 rounded-full font-ui text-[12px] border
                  ${k < visiveis - (aberto ? 0 : 1) || aberto ? 'border-[var(--edge-teal)] bg-[var(--teal-soft)] text-[var(--teal-ink)]'
                    : k === visiveis - 1 ? 'border-[var(--accent)] text-ink font-semibold' : 'border-line text-ink-muted'}`}>
                  {k + 1}. {nomeDaEtapa(e, u)}
                </span>
              </li>
            ))}
          </ol>
        </nav>
        </details>
        {!feita && (
          <button type="button" onClick={() => setTudo(t => !t)}
            className="justify-self-start min-h-[40px] font-ui text-[13px] text-ink-muted underline underline-offset-2">
            {tudo ? 'Voltar ao passo a passo' : 'Ver a unidade inteira de uma vez'}
          </button>
        )}
      </header>

      {etapas.slice(0, visiveis).map((e, k) => (
        <section key={k} ref={k === visiveis - 1 ? ultima : undefined} aria-labelledby={`etapa-${k}`}
          className="grid gap-4 scroll-mt-20">
          <p id={`etapa-${k}`} className="font-ui text-[12px] uppercase tracking-[.07em] text-ink-muted m-0">
            Etapa {k + 1} de {etapas.length}
          </p>
          <ConteudoDaEtapa e={e} u={u} n={n} modo={modo} />
          {e.pratica.length > 0 && <MiniPratica n={n} itens={e.pratica} titulo={`Pratique: ${nomeDaEtapa(e, u)}`} chave={`${n}-${k}`} />}
          {!aberto && k === visiveis - 1 && k < etapas.length - 1 && (
            <Button onClick={() => avancar(k)} className="justify-self-start">
              Continuar: {nomeDaEtapa(etapas[k + 1]!, u)}
            </Button>
          )}
        </section>
      ))}
    </div>
  );
}

function ConteudoDaEtapa({ e, u, n, modo }: { e: EtapaA1; u: UnidadeA1; n: number; modo: ModoTranslit }) {
  const p = useProgress();
  const feita = unidadeConcluida(p.state.a1, n);
  switch (e.tipo) {
    case 'conversa':
      return (
        <>
          {u.situacaoPt && (
            <Card tone="wash" className="p-5 grid gap-1">
              <p className="font-ui text-[12px] uppercase tracking-[.07em] text-ink-muted m-0">A situação</p>
              <p className="text-[15.5px] leading-relaxed text-ink-body m-0"><Misto texto={u.situacaoPt} /></p>
            </Card>
          )}
          {u.notaPt && (
            <Card tone="wash" className="p-5"><p className="text-[15px] leading-relaxed text-ink-body m-0"><Misto texto={u.notaPt} /></p></Card>
          )}
          <h2 className="font-display text-[20px] font-semibold m-0">{u.dialogo.tituloPt}</h2>
          <p className="font-ui text-[14px] text-ink-muted m-0">
            Leia (e ouça, quando houver gravação) antes de abrir a tradução. Tente entender pela situação.
          </p>
          <LinhasDeLeitura linhas={u.dialogo.linhas} rotulo={u.dialogo.tituloPt} />
          {u.dialogo.glossario.length > 0 && (
            <Card tone="wash" className="p-4 grid gap-2">
              <p className="font-ui text-[13px] uppercase tracking-[.07em] text-ink-muted m-0">Só deste diálogo</p>
              {u.dialogo.glossario.map(w => (
                <p key={w.he} className="m-0 flex items-baseline gap-3 flex-wrap">
                  <He size="word">{w.he}</He>
                  <span className="font-ui text-[14px] text-ink"><strong>{w.translit}</strong> · {w.pt}</span>
                </p>
              ))}
            </Card>
          )}
          {u.dialogo.notaPt && <p className="font-ui text-[14px] text-ink-muted m-0"><Misto texto={u.dialogo.notaPt} /></p>}
          <Falar u={u} />
          <details className="rounded-[var(--r-md)] border border-line bg-surface px-4 py-2">
            <summary className="cursor-pointer min-h-[44px] flex items-center font-ui text-[14px] text-ink">Guardar frases deste diálogo em Meu hebraico</summary>
            <ul className="grid gap-1.5 m-0 p-0 pb-2 list-none">
              {u.dialogo.linhas.map((l, i) => (
                <li key={i} className="flex items-center gap-3">
                  <span className="flex-1 min-w-0"><He size="word">{l.he}</He></span>
                  <Estrela chave={chaveDeFrase(l.he)} rotulo={l.pt} />
                </li>
              ))}
            </ul>
          </details>
        </>
      );
    case 'palavras':
      return <Palavras e={e} n={n} modo={modo} />;
    case 'gramatica': {
      const g = u.gramatica[e.ponto]!;
      return (
        <Card className="p-5 grid gap-3">
          <h2 className="font-display text-[19px] font-semibold text-ink m-0">{g.tituloPt}</h2>
          <p className="text-[15px] leading-relaxed text-ink-body m-0"><Misto texto={g.textoPt} /></p>
          {g.exemplos && g.exemplos.length > 0 && (
            <ul className="grid gap-1.5 m-0 p-0 list-none">
              {g.exemplos.map(x => (
                <li key={x.he} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 rounded-[var(--r-md)] bg-surface-2 px-3 py-2">
                  <He size="word">{x.he}</He>
                  <span className="font-ui text-[14px] text-ink-body">{x.pt}</span>
                </li>
              ))}
            </ul>
          )}
          {g.erroPt && (
            <div className="rounded-[var(--r-md)] border border-[var(--amber)] bg-[var(--amber-wash)] p-3">
              <TituloComSelo selo="erro" className="text-ink m-0 text-[12px]" />
              <p className="text-[14.5px] leading-relaxed text-ink-body m-0 pt-1"><Misto texto={g.erroPt} /></p>
            </div>
          )}
        </Card>
      );
    }
    case 'leitura':
      return (
        <>
          <h2 className="font-display text-[20px] font-semibold m-0">Leitura</h2>
          <LinhasDeLeitura linhas={u.leitura!.linhas} rotulo={u.leitura!.tituloPt} semPontos={u.leitura!.semPontos} />
          {u.leitura!.perguntas.length > 0 && <Perguntas n={n} />}
        </>
      );
    case 'fim':
      return (
        <>
          {u.cultura?.map(c => <Caixa key={c.tituloPt} caixa={c} tipo="cultura" />)}
          {u.sabia?.map(c => <Caixa key={c.tituloPt} caixa={c} tipo="sabia" />)}
          {u.autoavaliacao && u.autoavaliacao.length > 0 && <Autoavaliacao n={n} frases={u.autoavaliacao} />}
          <Card tone="wash" className="p-5 grid gap-3">
            <p className="text-[15px] leading-relaxed text-ink-body m-0">
              A rodada da unidade mistura tudo o que você praticou. Com 70%, a unidade fica concluída.
            </p>
            <LinkButton href={`/a1/unidade/${n}/exercicios`} size="lg" full>
              {feita ? 'Fazer a rodada de novo' : `Fazer a rodada da unidade (${u.exercicios.length})`}
            </LinkButton>
          </Card>
        </>
      );
  }
}

function Palavras({ e, n, modo }: { e: Extract<EtapaA1, { tipo: 'palavras' }>; n: number; modo: ModoTranslit }) {
  const simples = e.palavras.filter((w): w is PalavraA1 => !ehFormas(w));
  const formas = e.palavras.filter((w): w is FormasA1 => ehFormas(w));
  return (
    <>
      <h2 className="font-display text-[20px] font-semibold m-0">
        Palavras novas{e.blocos > 1 ? ` · bloco ${e.bloco} de ${e.blocos}` : ''}
      </h2>
      {e.bloco === 1 && <ChaveTranslit n={n} />}
      {formas.length > 0 && (
        <Card className="p-4 grid gap-3">
          {formas.map(f => (
            <div key={f.pt} className="grid gap-2 border-t border-[color:var(--line-soft)] pt-3 first:border-0 first:pt-0">
              <p className="font-ui text-[14px] font-semibold text-ink m-0">{f.pt}</p>
              {/* Da direita para a esquerda, como se lê: o masculino primeiro. */}
              <div dir="rtl" className={`grid gap-2 ${f.formas.length > 2 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2'}`}>
                {f.formas.map((h, i) => (
                  <div key={i} className="rounded-[var(--r-md)] bg-surface-2 px-3 py-2 grid gap-0.5 text-center">
                    <He size="word">{h}</He>
                    <span dir="ltr" className="font-ui text-[11.5px] text-ink-muted">{ROTULOS_4[i]}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </Card>
      )}
      {simples.length > 0 && (
        <Card className="p-4 grid gap-2">
          {simples.map(w => (
            <div key={w.he} className="flex items-center gap-3 rounded-[var(--r-md)] bg-surface-2 px-3 py-2">
              <He size="word">{w.he}</He>
              {hasAudio(w.audioId) && <AudioButton audioId={w.audioId!} ariaLabel={`Ouvir ${w.translit}`} size="sm" />}
              <span className="grid min-w-0 flex-1">
                <Translit texto={w.translit} modo={modo} />
                <span className="font-ui text-[12.5px] text-ink-muted">
                  {w.pt}{w.reconhecer ? ' · só para reconhecer, por enquanto' : ''}
                </span>
              </span>
              <Estrela chave={chaveDePalavra(w.he)} rotulo={w.pt} />
            </div>
          ))}
        </Card>
      )}
    </>
  );
}

/* Falar as falas do diálogo: gravar a própria voz e se ouvir; com as
   gravações do curso, comparar fala a fala, com as duas ondas lado a lado.
   Nada é enviado: a gravação fica no aparelho. */
function Falar({ u }: { u: UnidadeA1 }) {
  const comAudio = u.dialogo.linhas.filter(l => hasAudio(l.audioId));
  return (
    <Card className="p-5 grid gap-3">
      <h3 className="font-display text-[17px] font-semibold text-ink m-0">Agora é você: fale o diálogo</h3>
      {comAudio.length > 0 ? (
        <CompararPronuncia titulo="Escolha uma fala, ouça o modelo e grave a sua"
          itens={comAudio.map(l => ({ he: l.he, translit: l.translit, audioId: l.audioId ?? null }))} />
      ) : (
        <GravarLeitura titulo="Leia o diálogo em voz alta e se ouça"
          instrucao="Faça as duas vozes, ou escolha um personagem. Grave, ouça, e repita a fala que travou." maxSegundos={90} />
      )}
    </Card>
  );
}

/* A prática curta de uma etapa: os itens do banco da unidade que treinam o
   que acabou de ser visto. Alimenta a revisão e as habilidades como qualquer
   rodada, mas não conclui a unidade: quem conclui é a rodada final. */
function MiniPratica({ n, itens, titulo, chave }: { n: number; itens: number[]; titulo: string; chave: string }) {
  const p = useProgress();
  const u = unidadeA1(n)!;
  const [aberta, setAberta] = useState(false);
  const [rodada, setRodada] = useState(0);
  const [fim, setFim] = useState<string | null>(null);
  if (!aberta) {
    return (
      <Button variant="secondary" onClick={() => setAberta(true)} className="justify-self-start">
        Praticar agora ({itens.length})
      </Button>
    );
  }
  if (fim) {
    return (
      <Card tone="mint" className="p-4 flex flex-wrap items-center justify-between gap-2">
        <p className="font-ui text-[15px] font-semibold text-ink m-0" role="status">{fim}</p>
        <Button variant="ghost" onClick={() => { setFim(null); setRodada(r => r + 1); }}>Praticar de novo</Button>
      </Card>
    );
  }
  return (
    <A1Player key={rodada} itens={itens.map(i => u.exercicios[i]!)} prefixo={`a1-u${n}-etapa-${chave}-r${rodada}`}
      genero={p.state.a1.genero?.valor ?? null} titulo={titulo}
      onItem={(_, item, certo) => p.responderItemA1(n, item, certo)}
      onDone={r => setFim(r.total ? `${r.certas} de ${r.total} na primeira tentativa.` : 'Feito.')} />
  );
}

/* "Em Israel" e "Você sabia?": curtas, e nunca pré-requisito de nada. */
function Caixa({ caixa, tipo }: { caixa: CaixaA1; tipo: 'cultura' | 'sabia' }) {
  return (
    <aside className="rounded-[var(--r-lg)] border border-line bg-surface p-5 grid gap-2"
      aria-label={tipo === 'cultura' ? 'Em Israel' : 'Curiosidade'}>
      {tipo === 'cultura'
        ? <p className="font-ui text-[12px] font-semibold uppercase tracking-[.07em] text-ink-muted m-0">Em Israel</p>
        : <TituloComSelo selo="curiosidade" className="text-ink-muted m-0 text-[12px]" />}
      <p className="font-display text-[17px] font-semibold text-ink m-0">{caixa.tituloPt}</p>
      <p className="text-[15px] leading-relaxed text-ink-body m-0"><Misto texto={caixa.textoPt} /></p>
    </aside>
  );
}

/* As perguntas da leitura, logo abaixo do texto: ler e responder na mesma
   tela, com o texto ainda à vista. */
function Perguntas({ n }: { n: number }) {
  const u = unidadeA1(n)!;
  const p = useProgress();
  const [aberto, setAberto] = useState(false);
  const [rodada, setRodada] = useState(0);
  const [fim, setFim] = useState<string | null>(null);
  if (!aberto) {
    return <Button variant="secondary" onClick={() => setAberto(true)} className="justify-self-start">Responder às perguntas do texto</Button>;
  }
  if (fim) {
    return (
      <Card tone="mint" className="p-5 grid gap-3">
        <p className="font-display text-[17px] font-semibold m-0" role="status">{fim}</p>
        <Button variant="ghost" className="justify-self-start" onClick={() => { setFim(null); setRodada(r => r + 1); }}>Responder de novo</Button>
      </Card>
    );
  }
  return (
    <A1Player key={rodada} itens={u.leitura!.perguntas} prefixo={`a1-u${n}-leitura-r${rodada}`}
      genero={p.state.a1.genero?.valor ?? null} titulo="Perguntas sobre o texto"
      onItem={(_, item, certo) => p.responderItemA1(n, item, certo, true)}
      onDone={r => setFim(`${r.certas} de ${r.total} na primeira tentativa.`)} />
  );
}

/* A estrela de "Meu hebraico": guarda a palavra ou a frase no caderno. */
function Estrela({ chave, rotulo }: { chave: string; rotulo: string }) {
  const p = useProgress();
  const on = favorito(p.state.a1, chave);
  return (
    <button type="button" aria-pressed={on} onClick={() => p.marcarFavoritoA1(chave, !on)}
      aria-label={on ? `Tirar "${rotulo}" de Meu hebraico` : `Guardar "${rotulo}" em Meu hebraico`}
      className={`shrink-0 inline-flex items-center justify-center w-11 h-11 rounded-full text-[20px]
        ${on ? 'text-[var(--amber)]' : 'text-ink-muted hover:text-ink-body'}`}>
      <span aria-hidden>{on ? '★' : '☆'}</span>
    </button>
  );
}

/* "Eu consigo…": o aluno marca o que sente que já sabe. Não vale nota nem
   trava nada; fica no caderno, para ele ver o próprio caminho. */
function Autoavaliacao({ n, frases }: { n: number; frases: string[] }) {
  const p = useProgress();
  const marcadas = new Set(p.state.a1.auto[String(n)]?.itens ?? []);
  const trocar = (i: number) => {
    const prox = new Set(marcadas);
    if (prox.has(i)) prox.delete(i); else prox.add(i);
    p.setAutoA1(n, [...prox].sort((a, b) => a - b));
  };
  return (
    <section className="grid gap-3" aria-labelledby="t-auto">
      <h2 id="t-auto" className="font-display text-[20px] font-semibold m-0">Eu consigo…</h2>
      <p className="font-ui text-[14px] text-ink-muted m-0">Marque o que você sente que já sabe fazer. Só você vê.</p>
      <ul className="grid gap-2 m-0 p-0 list-none">
        {frases.map((f, i) => (
          <li key={i}>
            <label className="flex items-start gap-3 min-h-[44px] cursor-pointer rounded-[var(--r-md)] border border-line bg-surface px-3 py-2.5">
              <input type="checkbox" checked={marcadas.has(i)} onChange={() => trocar(i)} className="mt-1 w-5 h-5 shrink-0" />
              <span className="text-[15px] leading-snug text-ink-body"><Misto texto={f} /></span>
            </label>
          </li>
        ))}
      </ul>
    </section>
  );
}

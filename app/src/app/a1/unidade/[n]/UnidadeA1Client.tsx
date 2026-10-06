'use client';

/* Uma unidade do A1: o que se aprende, as palavras (com a gravação de cada
   uma, quando existir), a gramática com a nota de erro de brasileiro, e o
   diálogo para ler e ouvir. No fim, a porta para os exercícios. */

import { useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge, Card } from '@/components/ui/Card';
import { Button, LinkButton } from '@/components/ui/Button';
import { He } from '@/components/hebrew/He';
import { AudioButton, hasAudio, useRegistroDeAudio } from '@/components/learn/AudioButton';
import { LinhasDeLeitura } from '@/components/learn/LinhasDeLeitura';
import { Misto } from '@/components/a1/A1Player';
import { useProgress } from '@/lib/state/store';
import { ehFormas, moduloDaUnidade, UNIDADES_A1, unidadeA1, type CaixaA1, type FormasA1, type PalavraA1 } from '@/lib/a1';
import { A1Player } from '@/components/a1/A1Player';
import { TituloComSelo } from '@/components/learn/Blocks';
import { unidadeConcluida } from '@/lib/state/a1-estado';

const ROTULOS_4 = ['masculino', 'feminino', 'masc. plural', 'fem. plural'];

export function UnidadeA1Client({ n }: { n: number }) {
  const p = useProgress();
  /* As palavras perguntam `hasAudio`: sem assinar, não redesenham quando o
     registro das gravações chega. */
  useRegistroDeAudio();
  const u = unidadeA1(n);
  if (!u) notFound();
  const feita = unidadeConcluida(p.state.a1, n);
  const modulo = moduloDaUnidade(n);
  const posicao = UNIDADES_A1.indexOf(n) + 1;
  const simples = u.palavras.filter((w): w is PalavraA1 => !ehFormas(w));
  const formas = u.palavras.filter((w): w is FormasA1 => ehFormas(w));

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
      </header>

      {u.situacaoPt && (
        <Card tone="wash" className="p-5 grid gap-1">
          <p className="font-ui text-[12px] uppercase tracking-[.07em] text-ink-muted m-0">A situação</p>
          <p className="text-[15.5px] leading-relaxed text-ink-body m-0"><Misto texto={u.situacaoPt} /></p>
        </Card>
      )}

      {u.notaPt && (
        <Card tone="wash" className="p-5"><p className="text-[15px] leading-relaxed text-ink-body m-0"><Misto texto={u.notaPt} /></p></Card>
      )}

      <section className="grid gap-3" aria-labelledby="t-palavras">
        <h2 id="t-palavras" className="font-display text-[20px] font-semibold m-0">Palavras novas</h2>
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
                <span className="grid min-w-0">
                  <span className="font-ui text-[14px] font-semibold text-ink">{w.translit}</span>
                  <span className="font-ui text-[12.5px] text-ink-muted">
                    {w.pt}{w.reconhecer ? ' · só para reconhecer, por enquanto' : ''}
                  </span>
                </span>
              </div>
            ))}
          </Card>
        )}
      </section>

      <section className="grid gap-3" aria-labelledby="t-gramatica">
        <h2 id="t-gramatica" className="font-display text-[20px] font-semibold m-0">Gramática</h2>
        {u.gramatica.map((g, i) => (
          <Card key={i} className="p-5 grid gap-3">
            <h3 className="font-display text-[17px] font-semibold text-ink m-0">{i + 1}. {g.tituloPt}</h3>
            <p className="text-[15px] leading-relaxed text-ink-body m-0"><Misto texto={g.textoPt} /></p>
            {g.exemplos && g.exemplos.length > 0 && (
              <ul className="grid gap-1.5 m-0 p-0 list-none">
                {g.exemplos.map(e => (
                  <li key={e.he} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 rounded-[var(--r-md)] bg-surface-2 px-3 py-2">
                    <He size="word">{e.he}</He>
                    <span className="font-ui text-[14px] text-ink-body">{e.pt}</span>
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
        ))}
      </section>

      <section className="grid gap-3" aria-labelledby="t-dialogo">
        <h2 id="t-dialogo" className="font-display text-[20px] font-semibold m-0">Diálogo</h2>
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
      </section>

      {u.leitura && (
        <section className="grid gap-3" aria-labelledby="t-leitura">
          <h2 id="t-leitura" className="font-display text-[20px] font-semibold m-0">Leitura</h2>
          <LinhasDeLeitura linhas={u.leitura.linhas} rotulo={u.leitura.tituloPt} semPontos={u.leitura.semPontos} />
          {u.leitura.perguntas.length > 0 && <Perguntas n={n} />}
        </section>
      )}

      {u.cultura?.map(c => <Caixa key={c.tituloPt} caixa={c} tipo="cultura" />)}
      {u.sabia?.map(c => <Caixa key={c.tituloPt} caixa={c} tipo="sabia" />)}

      <LinkButton href={`/a1/unidade/${n}/exercicios`} size="lg" full>
        {feita ? 'Fazer os exercícios de novo' : `Fazer os exercícios (${u.exercicios.length})`}
      </LinkButton>
    </div>
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
      onDone={r => setFim(`${r.certas} de ${r.total} na primeira tentativa.`)} />
  );
}

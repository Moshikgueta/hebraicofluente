'use client';

/* Recompensas: trocar o XP do saldo (27/09/2026). Ver lib/loja.ts.
 *
 * O XP TOTAL continua sendo a conquista (no topo e em Conquistas); aqui se
 * gasta só o SALDO. Cada item diz quanto custa, o que faz e, quando não dá
 * para comprar, por quê - um botão desligado sem motivo é uma porta sem
 * maçaneta.
 */

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button, LinkButton } from '@/components/ui/Button';
import { He } from '@/components/hebrew/He';
import { useProgress } from '@/lib/state/store';
import { allLetters, cultureCards, leiturasBonus } from '@/lib/content';
import { concluidasSemDominio } from '@/lib/state/rules';
import { itemDaLeitura } from '@/lib/engine/bonus';
import { cartasCompradas, folgasLivres, gasto, ITENS, leiturasCompradas, MAX_FOLGAS, saldo, temNomeDecorado, type Recusa } from '@/lib/loja';
import { arquivoDoNome, desenharNome, FORMATOS_NOME, type FormatoNome } from '@/lib/nome-decorado';

const MOTIVO: Record<Recusa, string> = {
  saldo: 'Saldo insuficiente.',
  limite: `Você já tem ${MAX_FOLGAS} folgas guardadas.`,
  'ja-tem': 'Você já tem este item.',
  'sem-alvo': 'Não há carta fechada para abrir.',
  'sem-nome': 'Confirme primeiro a grafia do seu nome.'
};

export function LojaClient() {
  const p = useProgress();
  const s = p.state;
  const [aviso, setAviso] = useState<string | null>(null);
  const livre = saldo(s);
  const folgas = folgasLivres(s).length;
  const compradas = cartasCompradas(s);
  const proxima = cultureCards()
    .filter(c => c.unlockAt > p.mastered && !compradas.has(c.id))
    .sort((a, b) => a.unlockAt - b.unlockAt)[0];

  const trocar = (item: keyof typeof ITENS, alvo?: string, feito?: string) => {
    const r = p.comprar(item, alvo);
    setAviso(r ? MOTIVO[r] : (feito ?? 'Pronto!'));
  };

  if (!p.ready) return null;

  return (
    <div className="grid gap-6">
      <header className="grid gap-3">
        <h1 className="text-[27px] sm:text-[33px] font-bold m-0">Recompensas</h1>
        <p className="font-ui text-[15px] leading-relaxed text-ink-body m-0">
          Troque o XP que você juntou estudando. O seu XP total é a sua conquista e nunca diminui -
          o que você gasta sai do saldo.
        </p>
        <div className="grid grid-cols-2 gap-3">
          {/* As cores escritas aqui, e não herdadas do tom: o cartão escuro
              herdava a tinta escura do texto e o saldo sumia. */}
          <div className="rounded-[var(--r-lg)] p-4 grid gap-0.5 bg-[var(--navy)] text-white">
            <span className="font-ui text-[12px] uppercase tracking-[.07em] text-white/80">Saldo para trocar</span>
            <span className="font-display text-[30px] font-bold tabular-nums text-white">◆ {livre.toLocaleString('pt-BR')}</span>
          </div>
          <Card className="p-4 grid gap-0.5">
            <span className="font-ui text-[12px] uppercase tracking-[.07em] text-ink-muted">XP total</span>
            <span className="font-display text-[30px] font-bold tabular-nums text-ink">{s.xp.toLocaleString('pt-BR')}</span>
            {gasto(s) > 0 && <span className="font-ui text-[12px] text-ink-muted">{gasto(s).toLocaleString('pt-BR')} já trocados</span>}
          </Card>
        </div>
        {aviso && <p role="status" className="font-ui text-[14.5px] font-semibold text-[var(--teal-ink)] m-0">{aviso}</p>}
      </header>

      {/* Dia de folga */}
      <Item titulo={ITENS.folga.titulo} custo={ITENS.folga.custo} icone="🛡️" descricao={ITENS.folga.descricao}
            detalhe={folgas ? `Você tem ${folgas} ${folgas === 1 ? 'folga guardada' : 'folgas guardadas'}.` : 'Nenhuma folga guardada.'}
            pode={livre >= ITENS.folga.custo && folgas < MAX_FOLGAS}
            porQueNao={folgas >= MAX_FOLGAS ? MOTIVO.limite : MOTIVO.saldo}
            onTrocar={() => trocar('folga', undefined, 'Folga guardada. Se faltar um dia, ela protege a sua sequência.')} />

      {/* Carta de cultura antecipada */}
      <Item titulo={ITENS.carta.titulo} custo={ITENS.carta.custo} icone="📜" descricao={ITENS.carta.descricao}
            detalhe={proxima ? <>A próxima: <strong>{proxima.titlePt}</strong> (abriria com {proxima.unlockAt} letras).</> : 'Todas as cartas já estão abertas.'}
            pode={!!proxima && livre >= ITENS.carta.custo}
            porQueNao={!proxima ? MOTIVO['sem-alvo'] : MOTIVO.saldo}
            onTrocar={() => proxima && trocar('carta', proxima.id, 'Carta aberta! Leia em Viagem pela história.')}
            depois={compradas.size > 0 ? <Link href="/historia" className="font-ui text-[14px] font-semibold text-[var(--accent)] underline">Ler as cartas →</Link> : null} />

      {/* Nome decorado */}
      {temNomeDecorado(s) && s.nomeHebraico ? (
        <NomeDecorado nomeHe={s.nomeHebraico.texto} nomePt={s.onboarding?.name ?? ''} />
      ) : (
        <Item titulo={ITENS['nome-decorado'].titulo} custo={ITENS['nome-decorado'].custo} icone="✨"
              descricao={ITENS['nome-decorado'].descricao}
              detalhe={s.nomeHebraico
                ? <>O seu nome: <He size="word">{s.nomeHebraico.texto}</He></>
                : <>Antes, confirme como se escreve o seu nome em <Link href="/meu-nome" className="underline">Meu nome</Link>.</>}
              pode={!!s.nomeHebraico && livre >= ITENS['nome-decorado'].custo}
              porQueNao={!s.nomeHebraico ? MOTIVO['sem-nome'] : MOTIVO.saldo}
              onTrocar={() => trocar('nome-decorado', undefined, 'Pronto! Escolha o formato e baixe a imagem.')} />
      )}

      <LeiturasBonus livre={livre} mastered={p.mastered} semDominio={concluidasSemDominio(s)}
                     totalLetras={allLetters().length} minhas={leiturasCompradas(s)}
                     onTrocar={(item, id) => trocar(item, id, 'Leitura aberta! Ela está em Leituras bônus.')} />
    </div>
  );
}

/* Textos e versículos bíblicos (lib/engine/bonus.ts). Só as revisadas; cada
   uma se oferece quando o aluno já domina a letra mais tardia dela - trocar
   XP por um texto que ainda não se consegue ler seria vender frustração. */
function LeiturasBonus({ livre, mastered, semDominio, totalLetras, minhas, onTrocar }: {
  livre: number; mastered: number; semDominio: number; totalLetras: number; minhas: Set<string>;
  onTrocar: (item: 'texto-bonus' | 'bencao', id: string) => void;
}) {
  const leituras = leiturasBonus();
  if (!leituras.length) return null;
  /* 30/09/2026, a pedido do dono: o botão cinza com "abre quando você
     dominar 22 letras" parecia defeito. Agora a regra vem explicada, com o
     número de quem lê e o que fazer para chegar lá. */
  const travadas = leituras.some(l => !minhas.has(l.id) && mastered < l.after);
  return (
    <section className="grid gap-3" aria-labelledby="leituras-bonus">
      <div className="grid gap-1">
        <h2 id="leituras-bonus" className="font-display text-[21px] font-bold m-0">Leituras bônus</h2>
        <p className="font-ui text-[14px] leading-relaxed text-ink-body m-0">
          Trechos e versículos do Antigo Testamento, com transliteração, tradução e a leitura gravada, linha a linha.
          Texto bíblico ◆ {ITENS['texto-bonus'].custo}, versículo ◆ {ITENS.bencao.custo}.
        </p>
        {travadas && (
          <div className="rounded-[var(--r-md)] bg-surface-2 px-4 py-3 grid gap-1.5 font-ui text-[14px] leading-relaxed text-ink-body">
            <p className="m-0">
              Cada leitura abre quando você domina as letras que aparecem nela, para você conseguir ler o que trocou.
              Você domina <strong>{mastered} de {totalLetras} letras</strong>.
            </p>
            <p className="m-0">
              Dominar uma letra é concluir a lição dela e acertar pelo menos 6 de 8 na fixação.
            </p>
            {semDominio > 0 && (
              <p className="m-0">
                {semDominio === 1
                  ? 'Uma lição que você concluiu ficou abaixo de 6 de 8. Refazer a fixação dela já conta.'
                  : `${semDominio} lições que você concluiu ficaram abaixo de 6 de 8. Refazer a fixação delas já conta.`}{' '}
                <Link href="/mapa" className="text-[var(--accent)] underline">Ver as lições</Link>
              </p>
            )}
          </div>
        )}
        <Link href="/nikud-biblico" className="font-ui text-[14px] text-[var(--accent)] underline justify-self-start">
          Guia opcional e gratuito: o nikud da Bíblia →
        </Link>
        {minhas.size > 0 && (
          <Link href="/bonus" className="font-ui text-[14px] font-semibold text-[var(--accent)] underline justify-self-start">
            Ler as minhas leituras →
          </Link>
        )}
      </div>
      <ul className="grid gap-2 list-none p-0 m-0">
        {leituras.map(l => {
          const item = itemDaLeitura(l);
          const custo = ITENS[item].custo;
          const tem = minhas.has(l.id);
          const legivel = mastered >= l.after;
          return (
            <li key={l.id}>
              <Card className="p-4 flex flex-wrap items-center gap-3">
                <div className="grid gap-0.5 min-w-0 flex-1">
                  <span className="font-display text-[16.5px] font-semibold text-ink">{l.tituloPt}</span>
                  <span className="font-ui text-[13px] text-ink-muted">{l.fontePt}</span>
                </div>
                {tem ? (
                  <LinkButton href={`/bonus?l=${l.id}`} variant="secondary">Ler</LinkButton>
                ) : (
                  <div className="grid gap-1 justify-items-end">
                    <Button onClick={() => onTrocar(item, l.id)} disabled={!legivel || livre < custo} size="md">
                      Trocar por ◆ {custo}
                    </Button>
                    {!legivel ? (
                      <span className="font-ui text-[12.5px] text-ink-muted">
                        Abre com {l.after} letras dominadas: {l.after - mastered === 1 ? 'falta 1' : `faltam ${l.after - mastered}`}.
                      </span>
                    ) : livre < custo ? (
                      <span className="font-ui text-[12.5px] text-ink-muted">{MOTIVO.saldo}</span>
                    ) : null}
                  </div>
                )}
              </Card>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function Item({ titulo, custo, icone, descricao, detalhe, pode, porQueNao, onTrocar, depois }: {
  titulo: string; custo: number; icone: string; descricao: string; detalhe: React.ReactNode;
  pode: boolean; porQueNao: string; onTrocar: () => void; depois?: React.ReactNode;
}) {
  return (
    <Card className="p-5 grid gap-3">
      <div className="flex items-start gap-3">
        <span aria-hidden className="text-[28px] leading-none">{icone}</span>
        <div className="grid gap-1 min-w-0 flex-1">
          <h2 className="font-display text-[18px] font-semibold m-0">{titulo}</h2>
          <p className="font-ui text-[14px] leading-relaxed text-ink-body m-0">{descricao}</p>
          <p className="font-ui text-[13.5px] text-ink-muted m-0">{detalhe}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={onTrocar} disabled={!pode} size="md">Trocar por ◆ {custo}</Button>
        {!pode && <span className="font-ui text-[13px] text-ink-muted">{porQueNao}</span>}
        {depois}
      </div>
    </Card>
  );
}

function NomeDecorado({ nomeHe, nomePt }: { nomeHe: string; nomePt: string }) {
  const [formato, setFormato] = useState<FormatoNome>('celular');
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (ref.current) void desenharNome(ref.current, { nomeHe, nomePt, formato });
  }, [nomeHe, nomePt, formato]);

  const baixar = () => {
    const c = ref.current;
    if (!c) return;
    c.toBlob(b => {
      if (!b) return;
      const url = URL.createObjectURL(b);
      const a = document.createElement('a');
      a.href = url;
      a.download = arquivoDoNome(nomePt);
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    }, 'image/png');
  };

  return (
    <Card className="p-5 grid gap-4">
      <div className="grid gap-1">
        <h2 className="font-display text-[18px] font-semibold m-0">✨ Seu nome em hebraico decorado</h2>
        <p className="font-ui text-[14px] text-ink-body m-0">Já é seu. Escolha o formato e baixe quantas vezes quiser.</p>
      </div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Formato">
        {(Object.keys(FORMATOS_NOME) as FormatoNome[]).map(f => (
          <button key={f} type="button" aria-pressed={f === formato} onClick={() => setFormato(f)}
                  className={`min-h-[44px] px-4 rounded-[var(--r-md)] border font-ui text-[14px]
                    ${f === formato ? 'border-[var(--navy)] bg-[var(--accent-wash)] font-semibold' : 'border-line bg-surface'}`}>
            {FORMATOS_NOME[f].rotulo}
          </button>
        ))}
      </div>
      <canvas ref={ref} aria-label={`O nome ${nomeHe} decorado`}
              className={`w-full rounded-[var(--r-md)] border border-line ${formato === 'celular' ? 'max-w-[280px]' : 'max-w-[420px]'}`} />
      <div><Button onClick={baixar}>Baixar a imagem</Button></div>
    </Card>
  );
}

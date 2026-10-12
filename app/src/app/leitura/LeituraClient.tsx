'use client';

/* O Laboratório de Leitura e a Minha Primeira Leitura (11/10/2026).
 * ─────────────────────────────────────────────────────────────────────────
 * Uma palavra por vez, no centro da tela, e o aluno LÊ antes de ver qualquer
 * resposta: a transliteração e o áudio só aparecem depois de ele dizer que
 * tentou (na leitura guiada o áudio fica à mão desde o começo, que é o que
 * "guiada" quer dizer). Três níveis de apoio, de lib/laboratorio.ts.
 *
 * O que esta tela NÃO faz: ela não sabe se o aluno leu certo. Ele mesmo
 * marca, depois de ouvir e comparar, e a tela diz exatamente isso ("você
 * marcou"). Nada aqui entra no domínio das letras nem na revisão: uma
 * autoavaliação não é uma medida, e misturar as duas estragaria a medida.
 *
 * `?primeira=N` abre a Primeira Leitura do módulo N: as mesmas palavras para
 * todo aluno, lidas sozinhas, e um marco em `firsts` quando termina.
 */

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { He } from '@/components/hebrew/He';
import { Card } from '@/components/ui/Card';
import { Button, LinkButton } from '@/components/ui/Button';
import { AudioButton, hasAudio, useRegistroDeAudio } from '@/components/learn/AudioButton';
import { GravacaoDoProfessor } from '@/components/learn/GravacaoDoProfessor';
import { allLetters, extras, getModule, lettersOfModule } from '@/lib/content';
import { useProgress } from '@/lib/state/store';
import { useLeitura } from '@/lib/vocabulario';
import { rng } from '@/lib/engine/rng';
import {
  NIVEIS, bancoDePalavras, palavrasDaPrimeiraLeitura, palavrasDaRodada, primeiraLeituraId,
  type NivelDeApoio, type PalavraDoBanco, type PedacoDaPalavra
} from '@/lib/laboratorio';

const CHAVE_NIVEL = 'hf-leitura-nivel';
const POR_RODADA = 5;

function nivelGuardado(): NivelDeApoio {
  try {
    const v = localStorage.getItem(CHAVE_NIVEL);
    if (v === 'guiada' || v === 'menos-ajuda' || v === 'independente') return v;
  } catch { /* navegação privada: fica a guiada */ }
  return 'guiada';
}

function useBanco(): PalavraDoBanco[] {
  return useMemo(() => bancoDePalavras(
    allLetters(), extras().unpointed.groups.flatMap(g => g.words)
  ), []);
}

export function LeituraClient() {
  const busca = useSearchParams();
  const primeira = Number(busca.get('primeira')) || null;
  return primeira ? <PrimeiraLeitura n={primeira} /> : <Laboratorio />;
}

/* ── o laboratório ─────────────────────────────────────────────────────── */

function Laboratorio() {
  const p = useProgress();
  const leitura = useLeitura();
  const banco = useBanco();
  const [nivel, setNivel] = useState<NivelDeApoio>('guiada');
  const [rodada, setRodada] = useState(0);
  const [i, setI] = useState(0);
  const [certas, setCertas] = useState(0);
  useEffect(() => { setNivel(nivelGuardado()); }, []);

  /* Sem nikud só depois da etapa "sem os pontos" do módulo 6. */
  const semPontosLiberado = (p.state.lessons.mod6?.stagesDone ?? []).includes(3);

  const palavras = useMemo(
    () => palavrasDaRodada(banco, leitura.alfabeto, nivel, rng(`leitura-${nivel}-${rodada}-${leitura.letras.length}`), POR_RODADA),
    [banco, leitura.alfabeto, leitura.letras.length, nivel, rodada]
  );

  const escolher = (n: NivelDeApoio) => {
    setNivel(n);
    try { localStorage.setItem(CHAVE_NIVEL, n); } catch { /* ok */ }
    setRodada(r => r + 1); setI(0); setCertas(0);
  };
  const outra = () => { setRodada(r => r + 1); setI(0); setCertas(0); };

  const palavra = palavras[i];
  const acabou = palavras.length > 0 && i >= palavras.length;

  return (
    <div className="grid gap-6 py-2 max-w-[44rem]">
      <header className="grid gap-2">
        <p className="font-ui text-[13px] uppercase tracking-[.07em] text-ink-muted m-0">Laboratório de Leitura</p>
        <h1 className="text-[28px] font-bold m-0 text-balance">Ler de verdade, uma palavra por vez</h1>
        <p className="font-ui text-[15px] leading-relaxed text-ink-body m-0">
          Palavras escritas só com as letras que você já concluiu. Leia em voz alta primeiro;
          a resposta só aparece depois que você tentar.
        </p>
        <GravacaoDoProfessor id="reading-lab-how-to"
          textoPt="Como ler uma palavra nova, passo a passo." />
      </header>

      {!palavras.length ? (
        <Card className="p-5">
          <p className="font-ui text-[15px] text-ink-body m-0">
            Conclua a lição do Mem e as primeiras palavras aparecem aqui.{' '}
            <Link href="/mapa" className="underline">Ir para o curso</Link>
          </p>
        </Card>
      ) : (
        <>
          <fieldset className="grid gap-2 border-0 p-0 m-0">
            <legend className="font-ui text-[14px] font-semibold text-ink mb-2">Quanta ajuda você quer?</legend>
            <div className="grid sm:grid-cols-3 gap-2">
              {NIVEIS.map(n => (
                <label key={n.id}
                       className={`grid gap-1 rounded-[var(--r-md)] border-2 p-3 cursor-pointer min-h-[44px]
                         ${nivel === n.id ? 'border-[var(--accent)] bg-[var(--accent-wash)]' : 'border-line bg-surface hover:bg-surface-2'}`}>
                  <span className="flex items-center gap-2 font-ui text-[15px] font-semibold text-ink">
                    <input type="radio" name="nivel" value={n.id} checked={nivel === n.id}
                           onChange={() => escolher(n.id)} className="accent-[var(--accent)]" />
                    {n.tituloPt}
                  </span>
                  <span className="font-ui text-[13.5px] leading-snug text-ink-muted">{n.resumoPt}</span>
                </label>
              ))}
            </div>
            {nivel === 'independente' && !semPontosLiberado && (
              <p className="font-ui text-[13.5px] leading-snug text-ink-muted m-0">
                As palavras continuam com nikud. Sem os pontinhos elas aparecem depois da etapa
                &quot;Sem o ponto&quot; do módulo 6.
              </p>
            )}
          </fieldset>

          {acabou ? (
            <Card className="p-6 grid gap-4" tone="wash">
              <h2 className="text-[22px] font-semibold m-0">Rodada concluída</h2>
              <p className="font-ui text-[15.5px] leading-relaxed text-ink-body m-0">
                Você marcou {certas} de {palavras.length} palavras como lidas certo, antes de ver a resposta.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button size="lg" onClick={outra}>Mais cinco palavras</Button>
                <LinkButton href="/meu-hebraico" variant="ghost">Voltar ao painel</LinkButton>
              </div>
            </Card>
          ) : palavra ? (
            <LerPalavra
              key={`${rodada}-${i}-${palavra.id}`}
              palavra={palavra}
              nivel={nivel}
              semPontos={nivel === 'independente' && semPontosLiberado && !!palavra.semNikud}
              posicao={`${i + 1} de ${palavras.length}`}
              onFim={leuCerto => { if (leuCerto) setCertas(c => c + 1); setI(n => n + 1); }}
            />
          ) : null}
        </>
      )}
    </div>
  );
}

/* ── uma palavra ───────────────────────────────────────────────────────── */

const INSTRUCAO: Record<NivelDeApoio, string> = {
  guiada: 'Leia da direita para a esquerda, em voz alta. Se quiser, veja as letras uma a uma ou ouça a palavra.',
  'menos-ajuda': 'Tente ler sozinho, em voz alta. A ajuda está guardada logo abaixo, se precisar.',
  independente: 'Só a palavra. Leia em voz alta e depois confira.'
};

export function LerPalavra({ palavra, nivel, semPontos, posicao, onFim }: {
  palavra: PalavraDoBanco;
  nivel: NivelDeApoio;
  semPontos: boolean;
  posicao: string;
  onFim: (leuCerto: boolean) => void;
}) {
  useRegistroDeAudio();
  const [fase, setFase] = useState<'ler' | 'conferir'>('ler');
  const [verLetras, setVerLetras] = useState(false);
  const [pedaco, setPedaco] = useState<number | null>(null);
  const [sentido, setSentido] = useState(false);
  const temAudio = hasAudio(palavra.audioId);
  const escrita = semPontos && palavra.semNikud ? palavra.semNikud : palavra.he;

  return (
    <Card className="p-5 sm:p-7 grid gap-5">
      <p className="font-ui text-[13px] text-ink-muted tabular-nums m-0">Palavra {posicao}</p>

      <div className="grid place-items-center rounded-[var(--r-md)] bg-surface-2 py-8 px-3" aria-live="polite">
        <He size="display" pedaco={pedaco}>{escrita}</He>
        {semPontos && fase === 'ler' && (
          <p className="font-ui text-[13px] text-ink-muted mt-2 m-0">Sem os pontinhos, como numa placa.</p>
        )}
      </div>

      {fase === 'ler' ? (
        <>
          <p className="font-ui text-[15px] leading-relaxed text-ink-body m-0">{INSTRUCAO[nivel]}</p>
          {nivel === 'guiada' && (
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="secondary" onClick={() => setVerLetras(v => !v)}>
                {verLetras ? 'Esconder as letras' : 'Ver as letras'}
              </Button>
              {temAudio && <AudioButton audioId={palavra.audioId} label="Ouvir" ariaLabel="Ouvir a palavra" />}
            </div>
          )}
          {nivel === 'menos-ajuda' && !verLetras && (
            <Button variant="ghost" onClick={() => setVerLetras(true)}>Preciso de ajuda</Button>
          )}
          {verLetras && nivel !== 'independente' && (
            <LetrasDaPalavra palavra={palavra} ativo={pedaco} onAtivo={setPedaco} />
          )}
          <Button size="lg" full onClick={() => { setPedaco(null); setFase('conferir'); }}>
            Já li em voz alta: conferir
          </Button>
        </>
      ) : (
        <>
          <div className="grid gap-2 text-center">
            {semPontos && <He size="lg">{palavra.he}</He>}
            <p className="font-ui text-[22px] font-semibold text-ink m-0" dir="ltr">{palavra.translit}</p>
            {temAudio
              ? <div className="flex justify-center"><AudioButton audioId={palavra.audioId} label="Ouvir e comparar" ariaLabel={`Ouvir ${palavra.translit}`} /></div>
              : <p className="font-ui text-[13.5px] text-ink-muted m-0">Compare a sua leitura com a transliteração.</p>}
            {sentido
              ? <p className="font-ui text-[16px] text-ink-body m-0">Quer dizer: <strong className="font-semibold">{palavra.pt}</strong></p>
              : <div className="flex justify-center"><Button variant="ghost" onClick={() => setSentido(true)}>Ver o significado</Button></div>}
          </div>
          <div className="grid gap-2">
            <p className="font-ui text-[15px] font-semibold text-ink m-0">Você leu certo?</p>
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={() => onFim(true)}>Sim, li certo</Button>
              <Button variant="secondary" onClick={() => onFim(false)}>Ainda não</Button>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}

/* ── as letras da palavra, na ordem de leitura ─────────────────────────── */

function descricao(p: PedacoDaPalavra, comVogal: boolean): string {
  if (p.apoioDeVogal) return comVogal && p.vogal ? `vogal ${p.vogal.toUpperCase()}` : 'apoio de vogal';
  const som = p.somPt || 'sem som próprio';
  return comVogal && p.vogal ? `${som} + ${p.vogal.toUpperCase()}` : som;
}

function LetrasDaPalavra({ palavra, ativo, onAtivo }: {
  palavra: PalavraDoBanco; ativo: number | null; onAtivo: (i: number | null) => void;
}) {
  const n = palavra.pedacos.length;
  const ok = palavra.vogaisConferem;
  return (
    <div className="grid gap-3 rounded-[var(--r-md)] border border-line p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant="secondary"
                onClick={() => onAtivo(ativo === null || ativo >= n - 1 ? 0 : ativo + 1)}>
          {ativo === null ? 'Ler letra por letra' : ativo >= n - 1 ? 'Recomeçar' : 'Próxima letra'}
        </Button>
        <span className="font-ui text-[13.5px] text-ink-muted">A primeira letra é a da direita.</span>
      </div>
      {!ok && (
        <p className="font-ui text-[13.5px] leading-snug text-[var(--gold-ink)] m-0">
          Nesta palavra uma vogal não se lê do jeito de sempre. Veja as letras, e confira o som depois.
        </p>
      )}
      <ol dir="rtl" className="flex flex-wrap gap-2 list-none p-0 m-0" aria-label="As letras da palavra, na ordem de leitura">
        {palavra.pedacos.map((p, k) => (
          <li key={k}>
            <button type="button" onClick={() => onAtivo(k)} aria-pressed={ativo === k}
                    className={`grid gap-1 justify-items-center min-w-[88px] rounded-[var(--r-sm)] border px-2 py-2
                      ${ativo === k ? 'border-[var(--accent)] bg-[var(--accent-wash)]' : 'border-line bg-surface hover:bg-surface-2'}`}>
              <He size="lg">{p.grafia}</He>
              <span dir="ltr" className="font-ui text-[13.5px] font-semibold text-ink">{p.nomePt}</span>
              <span dir="ltr" className="font-ui text-[13px] text-ink-muted">{descricao(p, ok)}</span>
            </button>
          </li>
        ))}
      </ol>
      {ativo !== null && palavra.pedacos[ativo] && (
        <p className="font-ui text-[14px] leading-relaxed text-ink-body m-0" role="status">
          <strong className="font-semibold">{palavra.pedacos[ativo]!.nomePt}</strong>
          {ok && palavra.pedacos[ativo]!.sinaisPt.length > 0 && ` · sinal: ${palavra.pedacos[ativo]!.sinaisPt.join(', ')}`}
          {ok && palavra.pedacos[ativo]!.notaPt ? `. ${palavra.pedacos[ativo]!.notaPt}` : ''}
        </p>
      )}
    </div>
  );
}

/* ── Minha Primeira Leitura ────────────────────────────────────────────── */

function PrimeiraLeitura({ n }: { n: number }) {
  const p = useProgress();
  const leitura = useLeitura();
  const banco = useBanco();
  const mod = getModule(n);
  const letrasDoModulo = useMemo(() => (mod?.kind === 'letters' ? lettersOfModule(n) : []), [mod, n]);
  const concluiu = letrasDoModulo.length > 0
    && letrasDoModulo.every(l => leitura.letras.some(x => x.id === l.id));
  const palavras = useMemo(
    () => palavrasDaPrimeiraLeitura(banco, letrasDoModulo, leitura.alfabeto),
    [banco, letrasDoModulo, leitura.alfabeto]
  );
  const [i, setI] = useState(-1);
  const [certas, setCertas] = useState(0);
  const acabou = i >= palavras.length;
  useEffect(() => {
    if (acabou && palavras.length && !p.state.firsts[primeiraLeituraId(n)]) p.markFirst(primeiraLeituraId(n));
  }, [acabou]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!mod || !letrasDoModulo.length) {
    return (
      <Card className="p-5 my-4">
        <p className="font-ui text-[15px] text-ink-body m-0">
          Esta leitura não existe. <Link href="/leitura" className="underline">Ir para o Laboratório de Leitura</Link>
        </p>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 py-2 max-w-[44rem]">
      <header className="grid gap-2">
        <p className="font-ui text-[13px] uppercase tracking-[.07em] text-ink-muted m-0">
          Minha Primeira Leitura · Módulo {n}
        </p>
        <h1 className="text-[28px] font-bold m-0 text-balance">{mod.titlePt}</h1>
      </header>

      {!concluiu ? (
        <Card className="p-5 grid gap-3">
          <p className="font-ui text-[15px] leading-relaxed text-ink-body m-0">
            Esta leitura abre quando você concluir as letras do módulo {n}.
          </p>
          <LinkButton href="/mapa" variant="secondary">Ver o meu curso</LinkButton>
        </Card>
      ) : i < 0 ? (
        <Card tone="wash" className="p-6 grid gap-4">
          <p className="font-ui text-[16px] leading-relaxed text-ink-body m-0">
            {palavras.length} palavras escritas só com letras que você já conhece. Leia cada uma
            sozinho, em voz alta, antes de ouvir. Depois ouça e confira.
          </p>
          <Button size="lg" onClick={() => setI(0)}>Começar a leitura</Button>
        </Card>
      ) : acabou ? (
        <Card tone="wash" className="p-6 grid gap-4">
          <h2 className="text-[22px] font-semibold m-0">Primeira Leitura feita</h2>
          <p className="font-ui text-[15.5px] leading-relaxed text-ink-body m-0">
            Você leu {palavras.length} palavras em hebraico sozinho, antes de ouvir, e marcou {certas} como
            lidas certo. Isso já não é decorar letras: é começar a ler.
          </p>
          <div className="flex flex-wrap gap-2">
            <LinkButton href="/leitura" size="lg">Continuar no Laboratório de Leitura</LinkButton>
            <LinkButton href="/meu-hebraico" variant="ghost">Voltar ao painel</LinkButton>
          </div>
        </Card>
      ) : (
        <LerPalavra
          key={palavras[i]!.id}
          palavra={palavras[i]!}
          nivel="menos-ajuda"
          semPontos={false}
          posicao={`${i + 1} de ${palavras.length}`}
          onFim={leuCerto => { if (leuCerto) setCertas(c => c + 1); setI(k => k + 1); }}
        />
      )}
    </div>
  );
}

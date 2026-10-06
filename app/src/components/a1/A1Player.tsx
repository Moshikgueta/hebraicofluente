'use client';

/* O player dos exercícios do curso Hebraico A1 (06/10/2026).
 * ─────────────────────────────────────────────────────────────────────────
 * Separado do ExercisePlayer do alfabeto de propósito: aquele grava cada
 * resposta no modelo de letras (SRS, habilidades, confusões), e um exercício
 * de frase ali criaria "letras" que não existem. Este não toca no modelo de
 * letras; quem guarda o resultado é a tela que o usa (finishUnidadeA1).
 *
 * Reaproveita do alfabeto as duas peças que já resolvem bem o difícil:
 *   · TypeHebrew, a caixa de digitar com o teclado na tela, que confere sem
 *     nikud e sem forma final (hebraicoDigitadoCerto);
 *   · MatchPairs, o ligar pares acessível.
 *
 * As mesmas regras do alfabeto:
 *   · um item errado volta UMA vez no fim da fila, para acertar depois de
 *     outros; a nota conta só a primeira tentativa;
 *   · um item de escuta só aparece se a gravação existe (sem voz sintética);
 *   · a escrita livre ("aberta") não vale nota: mostra um exemplo e lembra o
 *     gênero que o aluno escolheu, e quem confere é o próprio aluno.
 */

import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { He } from '@/components/hebrew/He';
import { AudioButton, hasAudio } from '@/components/learn/AudioButton';
import { MatchPairs, TypeHebrew } from '@/components/learn/Answers';
import { GravarLeitura } from '@/components/learn/GravarLeitura';
import { rng, shuffled } from '@/lib/engine/rng';
import type { ItemA1 } from '@/lib/a1';
import type { GeneroA1 } from '@/lib/state/a1-estado';

export type ResultadoA1 = { certas: number; total: number; nota: number };

const HEB = /[֐-׿]/;
const LATIM = /[A-Za-zÀ-ÿ]/;
const soHebraico = (s: string) => HEB.test(s) && !LATIM.test(s);

/** Texto com trechos em hebraico: cada trecho vai num <bdi> RTL, com a fonte
 *  hebraica, para o português em volta não embaralhar a ordem. */
export function Misto({ texto, className = '' }: { texto: string; className?: string }) {
  /* O trecho termina numa letra hebraica, ou no ? e no ! de uma pergunta em
     hebraico (מַה שִּׁמְךָ?). O ponto final fica de fora: ele é da frase em
     português em volta, e dentro do trecho RTL ele pulava para o outro lado. */
  const partes = texto.split(/([֐-׿][֐-׿\s'"׳,.?!_־…]*[֐-׿?!…]|[֐-׿])/);
  return (
    <span className={className}>
      {partes.map((p, i) => (HEB.test(p)
        ? <bdi key={i} dir="rtl" lang="he" className="he text-[1.2em]">{p}</bdi>
        : <span key={i}>{p}</span>))}
    </span>
  );
}

const Opcao = ({ texto }: { texto: string }) =>
  soHebraico(texto) ? <He size="word">{texto}</He> : <span className="font-ui text-[16px]">{texto}</span>;

type NaFila = { item: ItemA1; id: string; volta: boolean; indice: number };

/** O id estável de um item: embaralhar a partir dele faz o mesmo item voltar
 *  com a mesma ordem, como os geradores do alfabeto. */
const idDo = (prefixo: string, i: number) => `${prefixo}-${i + 1}`;

export function A1Player({
  itens, prefixo, genero, onDone, titulo, onItem
}: {
  itens: ItemA1[];
  /** A primeira tentativa de cada item (não a volta), pelo índice em `itens`:
   *  é o que alimenta a revisão espaçada e as habilidades. */
  onItem?: (indice: number, item: ItemA1, certo: boolean) => void;
  /** Para os ids e o embaralhamento estável (ex.: "a1-u3"). */
  prefixo: string;
  genero: GeneroA1 | null;
  onDone: (r: ResultadoA1) => void;
  titulo?: string;
}) {
  /* A fila é montada uma vez: um item de escuta sem gravação fica de fora
     (a regra do alfabeto: nada de voz sintética). */
  const inicial = useMemo<NaFila[]>(
    () => itens.map((item, i) => ({ item, id: idDo(prefixo, i), volta: false, indice: i }))
      .filter(f => (f.item.t !== 'ouvir' && f.item.t !== 'ditado') || hasAudio(f.item.audioId)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const [fila, setFila] = useState<NaFila[]>(inicial);
  const [pos, setPos] = useState(0);
  const [resposta, setResposta] = useState<boolean | null>(null);
  /* O retorno da opção errada que o aluno escolheu, quando o item tem um. */
  const [dica, setDica] = useState<string | null>(null);
  const [primeira, setPrimeira] = useState<Record<string, boolean>>({});

  const atual = fila[pos];
  const valeNota = (it: ItemA1) => it.t !== 'aberta' && it.t !== 'falar';
  const total = inicial.filter(f => valeNota(f.item)).length;

  const responder = (certo: boolean, dicaDaOpcao?: string) => {
    if (!atual || resposta !== null) return;
    setResposta(certo);
    setDica(!certo && dicaDaOpcao ? dicaDaOpcao : null);
    if (!atual.volta && valeNota(atual.item)) {
      setPrimeira(p => ({ ...p, [atual.id]: certo }));
      onItem?.(atual.indice, atual.item, certo);
    }
    if (!certo && !atual.volta) setFila(f => [...f, { ...atual, volta: true }]);
  };

  const seguir = () => {
    const prox = pos + 1;
    if (prox >= fila.length) {
      const certas = Object.values(primeira).filter(Boolean).length;
      onDone({ certas, total, nota: total ? certas / total : 1 });
      return;
    }
    setPos(prox);
    setResposta(null);
    setDica(null);
  };

  if (!atual) return null;
  const { item, id, volta } = atual;
  const feitos = Math.min(pos, inicial.length);

  return (
    <div className="focus-col grid gap-5">
      <header className="grid gap-2">
        {titulo && <p className="font-ui text-[13px] uppercase tracking-[.07em] text-ink-muted m-0">{titulo}</p>}
        <div className="h-2 rounded-full bg-surface-2 overflow-hidden" aria-hidden>
          <div className="h-full bg-[var(--accent)] transition-all" style={{ width: `${(feitos / inicial.length) * 100}%` }} />
        </div>
        <p className="font-ui text-[13px] text-ink-muted m-0" aria-live="polite">
          {volta ? 'Esta voltou para você tentar de novo.' : `${Math.min(pos + 1, inicial.length)} de ${inicial.length}`}
        </p>
      </header>

      <Card className="p-5 sm:p-6 grid gap-5">
        <Item key={`${id}-${volta ? 'v' : 'p'}`} item={item} id={id} settled={resposta !== null}
              genero={genero} onAnswer={responder} />
      </Card>

      {resposta !== null && (
        <Card tone={resposta ? 'mint' : 'ember'} className="p-5 grid gap-3" >
          <p className="font-display text-[18px] font-semibold m-0" role="status">
            {item.t === 'aberta' || item.t === 'falar' ? 'Compare com o modelo.' : resposta ? 'Certo!' : dica ? 'Quase.' : 'Não foi desta vez.'}
          </p>
          {dica && <p className="text-[15px] leading-relaxed text-ink-body m-0"><Misto texto={dica} /></p>}
          {'porque' in item && item.porque && <p className="text-[15px] leading-relaxed text-ink-body m-0"><Misto texto={item.porque} /></p>}
          {!resposta && !volta && item.t !== 'aberta' && item.t !== 'falar' && (
            <p className="font-ui text-[13.5px] text-ink-muted m-0">Ela volta no fim, depois de outras.</p>
          )}
          <Button onClick={seguir} className="justify-self-start">Continuar</Button>
        </Card>
      )}
    </div>
  );
}

/* ── um item, pelo tipo ─────────────────────────────────────────────────── */

function Item({ item, id, settled, genero, onAnswer }: {
  item: ItemA1; id: string; settled: boolean; genero: GeneroA1 | null;
  onAnswer: (certo: boolean, dica?: string) => void;
}) {
  switch (item.t) {
    case 'escolha': case 'intruso': case 'ouvir': case 'dialogo':
      return <Escolha item={item} id={id} settled={settled} onAnswer={onAnswer} />;
    case 'ditado':
      return (
        <div className="grid gap-4">
          <Enunciado texto="Ouça e escreva o que você ouviu." />
          {item.audioId && <div className="justify-self-center"><AudioButton audioId={item.audioId} size="lg" slow /></div>}
          <Digitar accept={item.respostas} settled={settled} onAnswer={onAnswer} />
        </div>
      );
    case 'ordenar':
      return <Ordenar item={item} id={id} settled={settled} onAnswer={onAnswer} />;
    case 'vf':
      return <Vf item={item} settled={settled} onAnswer={onAnswer} />;
    case 'ligar':
      return (
        <div className="grid gap-3">
          <Enunciado texto={item.q} />
          <MatchPairs
            pairs={item.pares.map(([he, pt]) => ({ left: he, right: pt }))}
            leftKind="reading" rightKind="text" labelLeft="Hebraico" labelRight="Português"
            settled={settled} seed={id} onAnswer={c => onAnswer(c)}
          />
        </div>
      );
    case 'separar':
      return <Separar item={item} id={id} settled={settled} onAnswer={onAnswer} />;
    case 'montar':
      return <Montar item={item} id={id} settled={settled} onAnswer={onAnswer} />;
    case 'completar':
      return (
        <div className="grid gap-4">
          <Enunciado texto={item.q} />
          <p dir="rtl" lang="he" className="m-0 text-center">
            {item.antes && <He size="word">{item.antes}</He>}
            <span className="inline-block mx-2 min-w-[3ch] border-b-2 border-[var(--accent-soft)]" aria-label="lacuna">&nbsp;</span>
            {item.depois && <He size="word">{item.depois}</He>}
          </p>
          <Digitar accept={item.respostas} settled={settled} onAnswer={onAnswer} />
        </div>
      );
    case 'erro':
      return (
        <div className="grid gap-4">
          <Enunciado texto={item.q} />
          <p className="m-0 text-center"><He size="word">{item.errada}</He></p>
          <Digitar accept={item.respostas} settled={settled} onAnswer={onAnswer} />
        </div>
      );
    case 'escrever':
      return (
        <div className="grid gap-4">
          <Enunciado texto={`Escreva em hebraico: "${item.pt}"`} />
          <Digitar accept={item.respostas} settled={settled} onAnswer={onAnswer} />
        </div>
      );
    case 'tabela':
      return <Tabela item={item} settled={settled} onAnswer={onAnswer} />;
    case 'aberta':
      return <Aberta item={item} genero={genero} settled={settled} onAnswer={onAnswer} />;
    case 'falar':
      return <Falar item={item} settled={settled} onAnswer={onAnswer} />;
  }
}

const Enunciado = ({ texto }: { texto: string }) => (
  <p className="font-display text-[19px] sm:text-[21px] font-semibold leading-snug text-ink m-0">
    <Misto texto={texto} />
  </p>
);

/* A caixa de digitar do alfabeto, guardando o próprio resultado: é ele que
   faz a caixa mostrar "O certo era…" quando a resposta não passa. */
function Digitar({ accept, settled, onAnswer }: {
  accept: string[]; settled: boolean; onAnswer: (certo: boolean) => void;
}) {
  const [certo, setCerto] = useState<boolean | null>(null);
  return <TypeHebrew accept={accept} settled={settled} correct={certo}
                     onAnswer={c => { setCerto(c); onAnswer(c); }} />;
}

/* Escolha, intruso, escuta e resposta numa conversa: a mesma tela de opções. */
function Escolha({ item, id, settled, onAnswer }: {
  item: Extract<ItemA1, { t: 'escolha' | 'intruso' | 'ouvir' | 'dialogo' }>; id: string; settled: boolean;
  onAnswer: (certo: boolean, dica?: string) => void;
}) {
  /* As opções embaralhadas a partir do id: a certa não mora sempre em cima. */
  const ordem = useMemo(() => shuffled(item.opcoes.map((_, i) => i), rng(id)), [item, id]);
  const [escolhida, setEscolhida] = useState<number | null>(null);
  const escolher = (i: number) => {
    if (settled) return;
    setEscolhida(i);
    onAnswer(i === item.certa, 'dicas' in item ? item.dicas?.[String(i)] : undefined);
  };
  return (
    <div className="grid gap-4">
      <Enunciado texto={item.q} />
      {item.t === 'dialogo' && <Conversa linhas={item.linhas} />}
      {item.t === 'ouvir' && item.audioId && (
        <div className="justify-self-center"><AudioButton audioId={item.audioId} size="lg" slow /></div>
      )}
      <div className="grid gap-2 sm:grid-cols-2">
        {ordem.map(i => {
          const certa = settled && i === item.certa;
          const errada = settled && escolhida === i && i !== item.certa;
          return (
            <button key={i} type="button" onClick={() => escolher(i)} aria-disabled={settled}
              className={`min-h-[56px] px-4 py-2 rounded-[var(--r-md)] border-2 text-ink transition-colors
                ${certa ? 'border-[var(--green)] bg-mint' : errada ? 'border-[var(--amber)] bg-[var(--amber-wash)]'
                  : 'border-line bg-surface hover:border-[var(--accent-soft)]'}`}>
              <Opcao texto={item.opcoes[i]!} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Vf({ item, settled, onAnswer }: {
  item: Extract<ItemA1, { t: 'vf' }>; settled: boolean; onAnswer: (certo: boolean) => void;
}) {
  const [escolha, setEscolha] = useState<boolean | null>(null);
  return (
    <div className="grid gap-4">
      <p className="font-ui text-[12px] uppercase tracking-[.07em] text-ink-muted m-0">Verdadeiro ou falso?</p>
      <Enunciado texto={item.q} />
      <div className="grid grid-cols-2 gap-2">
        {[true, false].map(v => {
          const certa = settled && v === item.certa;
          const errada = settled && escolha === v && v !== item.certa;
          return (
            <button key={String(v)} type="button" aria-disabled={settled}
              onClick={() => { if (settled) return; setEscolha(v); onAnswer(v === item.certa); }}
              className={`min-h-[56px] rounded-[var(--r-md)] border-2 font-ui text-[16px] text-ink
                ${certa ? 'border-[var(--green)] bg-mint' : errada ? 'border-[var(--amber)] bg-[var(--amber-wash)]'
                  : 'border-line bg-surface hover:border-[var(--accent-soft)]'}`}>
              {v ? 'Verdadeiro' : 'Falso'}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* Separar: uma palavra por vez, e o aluno escolhe o grupo dela. */
function Separar({ item, id, settled, onAnswer }: {
  item: Extract<ItemA1, { t: 'separar' }>; id: string; settled: boolean; onAnswer: (certo: boolean) => void;
}) {
  const ordem = useMemo(() => shuffled(item.itens.map((_, i) => i), rng(id)), [item, id]);
  const [feitas, setFeitas] = useState<{ i: number; balde: number }[]>([]);
  const atual = ordem[feitas.length];
  const pôr = (balde: number) => {
    if (settled || atual === undefined) return;
    const prox = [...feitas, { i: atual, balde }];
    setFeitas(prox);
    if (prox.length === item.itens.length) onAnswer(prox.every(f => item.itens[f.i]![1] === f.balde));
  };
  return (
    <div className="grid gap-4">
      <Enunciado texto={item.q} />
      {atual !== undefined && !settled && (
        <div className="grid gap-3 justify-items-center">
          <He size="lg">{item.itens[atual]![0]}</He>
          <div className="flex flex-wrap justify-center gap-2">
            {item.baldes.map((b, k) => <Button key={k} variant="secondary" onClick={() => pôr(k)}>{b}</Button>)}
          </div>
        </div>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        {item.baldes.map((b, k) => (
          <div key={k} className="rounded-[var(--r-md)] border border-line p-3 grid gap-2 content-start">
            <p className="font-ui text-[13px] font-semibold text-ink-muted m-0">{b}</p>
            <div className="flex flex-wrap gap-2" dir="rtl">
              {feitas.filter(f => f.balde === k).map(f => {
                const ok = item.itens[f.i]![1] === k;
                return (
                  <span key={f.i} className={`px-2 rounded-md border ${settled ? (ok ? 'border-[var(--green)]' : 'border-[var(--amber)]') : 'border-line'}`}>
                    <He size="word">{item.itens[f.i]![0]}</He>
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Montar a frase com as palavras embaralhadas. A ordem certa é a do dado. */
function Montar({ item, id, settled, onAnswer }: {
  item: Extract<ItemA1, { t: 'montar' }>; id: string; settled: boolean; onAnswer: (certo: boolean) => void;
}) {
  const ordem = useMemo(() => {
    const idx = item.palavras.map((_, i) => i);
    let s = shuffled(idx, rng(id));
    /* Embaralhar duas palavras pode devolver a ordem certa; aí, inverte. */
    if (s.every((v, i) => v === i)) s = [...idx].reverse();
    return s;
  }, [item, id]);
  const [usadas, setUsadas] = useState<number[]>([]);
  const conferir = () => {
    if (settled || usadas.length !== item.palavras.length) return;
    onAnswer(usadas.map(i => item.palavras[i]).join(' ') === item.palavras.join(' '));
  };
  return (
    <div className="grid gap-4">
      <Enunciado texto={`Monte a frase: "${item.pt}"`} />
      <div dir="rtl" className="min-h-[64px] rounded-[var(--r-md)] border-2 border-dashed border-line p-3 flex flex-wrap gap-2 items-center">
        {usadas.map((i, k) => <span key={k} className="px-2 rounded-md bg-surface-2"><He size="word">{item.palavras[i]!}</He></span>)}
      </div>
      {settled && (
        <p className="m-0 text-center"><He size="word">{item.palavras.join(' ')}</He></p>
      )}
      {!settled && (
        <>
          <div dir="rtl" className="flex flex-wrap gap-2 justify-center">
            {ordem.map(i => (
              <button key={i} type="button" disabled={usadas.includes(i)}
                onClick={() => setUsadas(u => [...u, i])}
                className="min-h-[52px] px-3 rounded-[var(--r-md)] border-2 border-line bg-surface hover:border-[var(--accent-soft)] disabled:opacity-30">
                <He size="word">{item.palavras[i]!}</He>
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" onClick={() => setUsadas(u => u.slice(0, -1))} disabled={!usadas.length}>Apagar a última</Button>
            <Button onClick={conferir} disabled={usadas.length !== item.palavras.length}>Conferir</Button>
          </div>
        </>
      )}
    </div>
  );
}

/* A tabela de formas: uma linha por vez, com a caixa de digitar. */
function Tabela({ item, settled, onAnswer }: {
  item: Extract<ItemA1, { t: 'tabela' }>; settled: boolean; onAnswer: (certo: boolean) => void;
}) {
  const [respondidas, setRespondidas] = useState<boolean[]>([]);
  const linha = respondidas.length;
  const atual = item.linhas[linha];
  return (
    <div className="grid gap-4">
      <Enunciado texto={item.q} />
      <p className="m-0 text-center"><He size="lg">{item.base}</He></p>
      <ul className="grid gap-1 m-0 p-0 list-none">
        {item.linhas.slice(0, linha).map(([rotulo, certa], k) => (
          <li key={k} className="flex items-baseline justify-between gap-3 border-t border-[color:var(--line-soft)] py-1.5">
            <span className="font-ui text-[14px] text-ink-muted">{rotulo}</span>
            <span className="flex items-baseline gap-2">
              <He size="word">{certa}</He>
              <span aria-label={respondidas[k] ? 'certo' : 'errado'}>{respondidas[k] ? '✓' : '✗'}</span>
            </span>
          </li>
        ))}
      </ul>
      {atual && !settled && (
        <div className="grid gap-2">
          <p className="font-ui text-[15px] text-ink m-0">Forma para: <strong>{atual[0]}</strong></p>
          <Digitar key={linha} accept={[atual[1]]} settled={false}
            onAnswer={c => {
              const prox = [...respondidas, c];
              setRespondidas(prox);
              if (prox.length === item.linhas.length) onAnswer(prox.every(Boolean));
            }} />
        </div>
      )}
    </div>
  );
}

/* Escrita livre: não vale nota. O aluno escreve, vê um exemplo e confere. */
function Aberta({ item, genero, settled, onAnswer }: {
  item: Extract<ItemA1, { t: 'aberta' }>; genero: GeneroA1 | null; settled: boolean;
  onAnswer: (certo: boolean) => void;
}) {
  const [texto, setTexto] = useState('');
  return (
    <div className="grid gap-4">
      <p className="font-ui text-[12px] uppercase tracking-[.07em] text-ink-muted m-0">Escrita livre · não vale nota</p>
      <Enunciado texto={item.pt} />
      <textarea value={texto} onChange={e => setTexto(e.target.value)} disabled={settled}
        dir="rtl" lang="he" rows={4} aria-label="O seu texto, em hebraico"
        className="w-full rounded-[var(--r-md)] border-2 border-line bg-surface he text-[22px] p-3" />
      {settled ? (
        <div className="grid gap-2">
          <p className="font-ui text-[14px] text-ink-muted m-0">Um exemplo:</p>
          <p className="m-0"><He size="word">{item.exemplo}</He></p>
          {genero && (
            <p className="font-ui text-[14px] text-ink-body m-0">
              {genero === 'f'
                ? 'Você escolheu ser tratada no feminino: confira se os verbos e as profissões do seu texto estão na forma feminina (גָּרָה, עוֹבֶדֶת, סְטוּדֶנְטִית).'
                : 'Você escolheu ser tratado no masculino: confira se os verbos e as profissões do seu texto estão na forma masculina (גָּר, עוֹבֵד, סְטוּדֶנְט).'}
            </p>
          )}
        </div>
      ) : (
        <Button onClick={() => onAnswer(true)} disabled={!texto.trim()} className="justify-self-start">Ver um exemplo</Button>
      )}
    </div>
  );
}

/* As falas de uma conversa, cada uma com quem fala, e a lacuna no fim: é ali
   que entra a resposta que o aluno escolhe. */
function Conversa({ linhas }: { linhas: [string, string][] }) {
  return (
    <ol className="grid gap-2 m-0 p-0 list-none">
      {linhas.map(([quem, he], k) => (
        <li key={k} className="rounded-[var(--r-md)] bg-surface-2 px-3 py-2 grid gap-0.5">
          <span className="font-ui text-[12px] font-semibold text-ink-muted">{quem}</span>
          <He size="word">{he}</He>
        </li>
      ))}
      <li className="rounded-[var(--r-md)] border-2 border-dashed border-line px-3 py-3 font-ui text-[13px] text-ink-muted">
        E a resposta?
      </li>
    </ol>
  );
}

/* Pôr as falas na ordem: toca-se na que vem primeiro, depois na seguinte.
   Por toque, como o "montar": arrastar no celular é ruim e não funciona com
   leitor de tela. */
function Ordenar({ item, id, settled, onAnswer }: {
  item: Extract<ItemA1, { t: 'ordenar' }>; id: string; settled: boolean; onAnswer: (certo: boolean) => void;
}) {
  const ordem = useMemo(() => {
    const idx = item.falas.map((_, i) => i);
    let s = shuffled(idx, rng(id));
    if (s.every((v, i) => v === i)) s = [...idx].reverse();
    return s;
  }, [item, id]);
  const [usadas, setUsadas] = useState<number[]>([]);
  const conferir = () => {
    if (settled || usadas.length !== item.falas.length) return;
    onAnswer(usadas.every((v, i) => v === i));
  };
  return (
    <div className="grid gap-4">
      <Enunciado texto={item.q} />
      <ol className="grid gap-2 m-0 p-0 list-none" aria-label="A conversa, na ordem que você escolheu">
        {(settled ? item.falas.map((_, i) => i) : usadas).map((i, k) => (
          <li key={k} className="flex items-center gap-3 rounded-[var(--r-md)] bg-surface-2 px-3 py-2">
            <span className="font-ui text-[13px] font-semibold text-ink-muted w-5 text-center">{k + 1}</span>
            <He size="word">{item.falas[i]!}</He>
          </li>
        ))}
      </ol>
      {!settled && (
        <>
          <div className="grid gap-2">
            {ordem.filter(i => !usadas.includes(i)).map(i => (
              <button key={i} type="button" onClick={() => setUsadas(u => [...u, i])}
                className="min-h-[52px] px-3 py-2 rounded-[var(--r-md)] border-2 border-line bg-surface hover:border-[var(--accent-soft)] text-right">
                <He size="word">{item.falas[i]!}</He>
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" onClick={() => setUsadas(u => u.slice(0, -1))} disabled={!usadas.length}>Desfazer a última</Button>
            <Button onClick={conferir} disabled={usadas.length !== item.falas.length}>Conferir</Button>
          </div>
        </>
      )}
    </div>
  );
}

/* Falar em voz alta: primeiro tentar sozinho, gravando; depois ver (e, com
   gravação, ouvir) o modelo, e comparar. Não vale nota: nenhum corretor
   automático de pronúncia em hebraico é confiável hoje, e quem julga é o
   ouvido do aluno, com o modelo ao lado. A gravação fica no aparelho. */
function Falar({ item, settled, onAnswer }: {
  item: Extract<ItemA1, { t: 'falar' }>; settled: boolean; onAnswer: (certo: boolean) => void;
}) {
  return (
    <div className="grid gap-4">
      <p className="font-ui text-[12px] uppercase tracking-[.07em] text-ink-muted m-0">Fale em voz alta · não vale nota</p>
      <Enunciado texto={item.pt} />
      <GravarLeitura titulo="Grave a sua voz" instrucao="Tente primeiro sem olhar o modelo. Depois ouça a sua gravação."
        audioId={settled ? item.audioId ?? null : null} maxSegundos={20} />
      {settled ? (
        <div className="grid gap-2">
          <p className="font-ui text-[14px] text-ink-muted m-0">O modelo:</p>
          <p className="m-0 flex items-center gap-3 flex-wrap">
            <He size="word">{item.exemplo}</He>
            {item.audioId && hasAudio(item.audioId) && <AudioButton audioId={item.audioId} size="sm" slow />}
          </p>
        </div>
      ) : (
        <Button onClick={() => onAnswer(true)} className="justify-self-start">Ver o modelo</Button>
      )}
    </div>
  );
}

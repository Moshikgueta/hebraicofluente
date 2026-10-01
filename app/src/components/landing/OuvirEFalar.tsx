'use client';

/* "Ouça e fale": a voz do professor e a do visitante, na capa (28/09/2026).
 * ─────────────────────────────────────────────────────────────────────────
 * Pedido do dono do curso. A aula aberta logo acima (DemoAlef) ensina o
 * Álef, que não tem som - então ela não podia mostrar a parte do curso que
 * mais surpreende: ouvir a letra na voz de quem ensina e ser corrigido
 * falando. Esta seção mostra as duas, em dois passos:
 *
 *   1 · ouvir e descobrir  o nome de três letras, gravado (Shin, Mem,
 *                          Lámed); o visitante ouve e escolhe a letra entre
 *                          quatro. O erro diz que letra é aquela e que som
 *                          ela faz, e deixa tentar de novo; o acerto abre a
 *                          sílaba gravada (sha, ma, la). Até 01/10/2026 o
 *                          botão tocava a sílaba, e o dono, com razão, esperava
 *                          ouvir o nome da letra;
 *   2 · falar              ouvir שָׁלוֹם, dizer, e o reconhecimento de fala
 *                          do navegador confere (FalarECorrigir, o mesmo
 *                          componente das lições). Onde o navegador não
 *                          transcreve (Firefox), fica a gravação para se
 *                          ouvir e comparar - que também é do curso.
 *
 * As gravações vêm de /amostra-audio/ (lib/amostra-audio.ts): /audio/ é
 * pago. O microfone está liberado SÓ na capa (worker.js, Permissions-Policy).
 *
 * Não pontua e não guarda nada, como a aula aberta: é amostra.
 */

import { useEffect, useRef, useState } from 'react';
import { He } from '@/components/hebrew/He';
import { FalarECorrigir } from '@/components/learn/FalarECorrigir';
import { GravarLeitura } from '@/components/learn/GravarLeitura';
import { falaDisponivel } from '@/lib/fala';
import { urlAmostra, type NomeAmostra } from '@/lib/amostra-audio';
import { Container, H2, Lead, Reveal, Check } from './base';

type Rodada = {
  clipeNome: NomeAmostra; clipe: NomeAmostra; silaba: string; som: string; certa: string; nome: string;
  opcoes: readonly { he: string; porque: string }[];
};

/* As alternativas são as letras que um iniciante confunde PELO SOM: o
   Sámech com o Shin (os dois "chiam"), o Nun com o Mem, o Resh com o Lámed. */
const RODADAS: readonly Rodada[] = [
  { clipeNome: 'shin', clipe: 'sha', silaba: 'שַׁ', som: 'sha', certa: 'ש', nome: 'Shin', opcoes: [
    { he: 'ס', porque: 'Este é o Sámech: faz «s», sem o chiado.' },
    { he: 'ש', porque: '' },
    { he: 'צ', porque: 'Este é o Tsadi: faz «ts».' },
    { he: 'ת', porque: 'Este é o Tav: faz «t».' }
  ] },
  { clipeNome: 'mem', clipe: 'ma', silaba: 'מַ', som: 'ma', certa: 'מ', nome: 'Mem', opcoes: [
    { he: 'נ', porque: 'Este é o Nun: faz «n».' },
    { he: 'ב', porque: 'Este é o Bet: faz «b».' },
    { he: 'מ', porque: '' },
    { he: 'כ', porque: 'Este é o Kaf: faz «k».' }
  ] },
  { clipeNome: 'lamed', clipe: 'la', silaba: 'לַ', som: 'la', certa: 'ל', nome: 'Lámed', opcoes: [
    { he: 'ר', porque: 'Este é o Resh: faz «r».' },
    { he: 'ל', porque: '' },
    { he: 'ד', porque: 'Este é o Dálet: faz «d».' },
    { he: 'ג', porque: 'Este é o Guímel: faz «g».' }
  ] }
];

/** Um tocador só para a seção: tocar outro clipe corta o anterior. */
function useTocador() {
  const el = useRef<HTMLAudioElement | null>(null);
  const [tocando, setTocando] = useState<NomeAmostra | null>(null);
  useEffect(() => () => { el.current?.pause(); }, []);
  const tocar = (nome: NomeAmostra) => {
    el.current?.pause();
    const a = new Audio(urlAmostra(nome));
    el.current = a;
    setTocando(nome);
    a.onended = a.onerror = () => setTocando(t => (t === nome ? null : t));
    void a.play().catch(() => setTocando(null));
  };
  return { tocar, tocando };
}

export function OuvirEFalar() {
  const { tocar, tocando } = useTocador();
  return (
    <section id="ouvir" aria-labelledby="ouvir-titulo" className="bg-[var(--sand)] border-y border-line">
      <Container className="py-16 sm:py-[88px]">
        <Reveal>
          <H2 id="ouvir-titulo" className="max-w-[22ch] mb-3">Ouça a letra. Depois, fale e seja corrigido.</H2>
        </Reveal>
        <Reveal delay={80}>
          <Lead className="mb-10">
            As gravações do curso são do professor, um israelense. Ouça, descubra a letra e depois
            diga você mesmo: o curso confere a sua pronúncia na hora.
          </Lead>
        </Reveal>
        <div className="grid gap-5 lg:grid-cols-2 items-start">
          <Reveal className="min-w-0"><Ouvir tocar={tocar} tocando={tocando} /></Reveal>
          <Reveal delay={120} className="min-w-0"><Falar tocar={tocar} tocando={tocando} /></Reveal>
        </div>
      </Container>
    </section>
  );
}

function Passo({ n, titulo, children }: { n: number; titulo: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0 rounded-[22px] bg-[var(--card)] border border-line shadow-[var(--sh)] p-5 sm:p-7 grid gap-5">
      <div className="flex items-center gap-3">
        <span aria-hidden className="w-9 h-9 rounded-[11px] bg-[var(--teal-soft)] text-[var(--teal-ink)]
                                     grid place-items-center font-ui font-bold text-[15px]">{n}</span>
        <h3 className="font-display text-[21px] font-semibold tracking-[-0.015em] m-0">{titulo}</h3>
      </div>
      {children}
    </div>
  );
}

function BotaoOuvir({ nome, rotulo, tocar, tocando }: {
  nome: NomeAmostra; rotulo: string; tocar: (n: NomeAmostra) => void; tocando: NomeAmostra | null;
}) {
  const ativo = tocando === nome;
  return (
    <button type="button" onClick={() => tocar(nome)}
            className={`inline-flex items-center gap-2.5 min-h-[48px] rounded-full px-5 font-ui text-[15.5px] font-semibold
                        transition-colors duration-200
                        ${ativo ? 'bg-[var(--teal-solid)] text-white' : 'bg-[var(--navy)] text-white hover:bg-[var(--navy-2)]'}`}>
      <span aria-hidden className="text-[13px]">{ativo ? '■' : '▶'}</span>
      {rotulo}
    </button>
  );
}

function Ouvir({ tocar, tocando }: { tocar: (n: NomeAmostra) => void; tocando: NomeAmostra | null }) {
  const [i, setI] = useState(0);
  const [escolha, setEscolha] = useState<string | null>(null);
  const r = RODADAS[i]!;
  const acertou = escolha === r.certa;
  const fim = acertou && i === RODADAS.length - 1;
  const errada = escolha && !acertou ? r.opcoes.find(o => o.he === escolha) : null;

  return (
    <Passo n={1} titulo="Ouça e descubra a letra">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <BotaoOuvir nome={r.clipeNome} rotulo="Ouvir o nome da letra" tocar={tocar} tocando={tocando} />
        <span className="font-ui text-[13.5px] text-ink-muted tabular-nums">{i + 1} de {RODADAS.length}</span>
      </div>
      <p className="font-ui text-[15.5px] text-ink-body m-0">Qual é esta letra?</p>
      <div className="grid grid-cols-4 gap-2.5" role="group" aria-label="Escolha a letra">
        {r.opcoes.map(o => {
          const marcada = escolha === o.he;
          const certa = marcada && o.he === r.certa;
          return (
            <button key={o.he} type="button" disabled={acertou}
                    onClick={() => setEscolha(o.he)}
                    aria-label={`Letra ${o.he}`}
                    className={`min-h-[72px] rounded-[16px] border-[1.5px] grid place-items-center transition-colors duration-200
                      ${certa ? 'border-[var(--teal)] bg-[var(--teal-soft)]'
                        : marcada ? 'border-[#C9C3B4] bg-[var(--sand)]'
                        : 'border-line bg-[var(--card)] hover:border-[#C9C3B4]'}`}>
              <He size="word" tone="navy" className="!text-[34px] leading-none">{o.he}</He>
            </button>
          );
        })}
      </div>
      <div aria-live="polite" className="min-h-[52px]">
        {acertou && (
          <p className="flex items-start gap-2 font-ui text-[15px] text-[var(--teal-ink)] m-0">
            <Check size={16} className="mt-[3px]" />
            <span>
              <strong>Isso!</strong> É o {r.nome}. Com o risquinho embaixo, <He size="inline">{r.silaba}</He> se lê «{r.som}».
            </span>
          </p>
        )}
        {acertou && (
          <div className="mt-3">
            <BotaoOuvir nome={r.clipe} rotulo={`Ouvir «${r.som}»`} tocar={tocar} tocando={tocando} />
          </div>
        )}
        {errada && (
          <p className="font-ui text-[15px] text-ink-body m-0">
            <span aria-hidden>✕ </span>{errada.porque} Ouça de novo e tente outra.
          </p>
        )}
      </div>
      {acertou && !fim && (
        <button type="button" onClick={() => { setI(i + 1); setEscolha(null); }}
                className="justify-self-start min-h-[44px] rounded-[12px] border border-line bg-[var(--card)] px-4
                           font-ui text-[15px] font-semibold hover:border-[#C9C3B4]">
          Próxima letra →
        </button>
      )}
      {fim && (
        <p className="font-ui text-[15px] font-semibold text-ink m-0">
          Três letras reconhecidas pelo nome. No curso são as 22, uma de cada vez, com o nome e o som.
        </p>
      )}
    </Passo>
  );
}

function Falar({ tocar, tocando }: { tocar: (n: NomeAmostra) => void; tocando: NomeAmostra | null }) {
  /* Depois de montar: no HTML estático não se sabe o navegador de quem lê. */
  const [transcreve, setTranscreve] = useState<boolean | null>(null);
  useEffect(() => { setTranscreve(falaDisponivel()); }, []);

  return (
    <Passo n={2} titulo="Agora é a sua vez">
      <div className="rounded-[18px] bg-[var(--sand)] px-5 py-6 text-center grid gap-2 justify-items-center">
        <He size="plate" tone="navy">שָׁלוֹם</He>
        <p className="font-ui text-[15px] text-ink-muted m-0"><strong className="text-ink">shalóm</strong> · olá, paz</p>
        <BotaoOuvir nome="shalom" rotulo="Ouvir o professor" tocar={tocar} tocando={tocando} />
      </div>
      {transcreve === false ? (
        <GravarLeitura
          titulo="Grave e compare"
          instrucao="Diga «shalóm», grave e se ouça. Depois ouça o professor e compare."
          maxSegundos={10}
        />
      ) : (
        <>
          <p className="font-ui text-[15.5px] text-ink-body m-0">
            Toque no microfone e diga <strong>shalóm</strong>. O curso ouve e diz se bateu.
          </p>
          <FalarECorrigir alvo="שָׁלוֹם" translit="shalóm"
                          nota="Para corrigir, a sua voz vai para o serviço de fala do navegador (Google ou Apple). O Hebraico Fluente não guarda nada." />
        </>
      )}
    </Passo>
  );
}

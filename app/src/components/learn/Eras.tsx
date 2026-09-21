'use client';

/* Hoje e há três mil anos - a mesma raiz nas duas pontas.
 * ─────────────────────────────────────────────────────────────────────────
 * O curso já dizia que o alfabeto tem três mil anos. Dizer isso é barato: é
 * a mesma frase que está na contracapa de qualquer livro de hebraico, e ela
 * não muda nada para quem está aprendendo. O que muda alguma coisa é o aluno
 * LER as duas linhas e reconhecer as letras nas duas.
 *
 * Por isso este bloco não explica: ele mostra. Em cima, uma linha escrita há
 * vinte e sete séculos, com a fonte ao lado. Embaixo, uma frase que se ouve
 * hoje numa fila de supermercado em Tel Aviv. As três letras da raiz acesas
 * nas duas, na mesma cor.
 *
 * Três regras:
 *
 *   · o significado NÃO aparece sozinho, aqui como no cartão do painel. A
 *     pessoa lê primeiro; o botão é o que segura esse meio segundo;
 *   · o par só abre quando AS DUAS linhas são legíveis. A antiga sozinha
 *     seria um teaser, e teaser é o contrário do que isto faz;
 *   · e nada aqui é obrigatório, contado ou pontuado. É a metade opcional do
 *     curso, e é por isso que ela pode se dar ao luxo de ser interessante.
 */

import { useState } from 'react';
import { He } from '@/components/hebrew/He';
import { Card, Badge } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Prose } from './Blocks';
import { useProgress } from '@/lib/state/store';
import {
  allLetters, eraPairs, eraPairOpensAt, getSentence,
  type EraPair, type Sentence
} from '@/lib/content';
import { isLessonComplete } from '@/lib/state/rules';
import { ordemCorrida } from '@/lib/antes-depois';

export function ErasShelf() {
  const p = useProgress();
  const ordem = ordemCorrida(allLetters(), id => isLessonComplete(p.state, id));

  const pares = eraPairs()
    .map(par => ({ par, abre: eraPairOpensAt(par) }))
    .filter((x): x is { par: EraPair; abre: number } => x.abre !== null)
    .sort((a, b) => a.abre - b.abre);
  if (!pares.length) return null;

  const abertos = pares.filter(x => x.abre <= ordem);
  const fechados = pares.filter(x => x.abre > ordem);

  return (
    <section aria-labelledby="eras" className="grid gap-4">
      <div className="grid gap-2 reading">
        <h2 id="eras" className="font-display text-[21px] sm:text-[24px] font-bold tracking-[-0.022em] text-ink">
          Hoje e há dois mil anos
        </h2>
        {/* Cuidado com o que esta frase afirma. A tentação é escrever "o
            alfabeto não mudou desde que estes textos foram escritos", que soa
            bem e é FALSO - a carta «O hebraico já teve outro desenho», nesta
            mesma página, conta que o texto antigo nasceu em paleo-hebraico e
            que a escrita quadrada veio depois do exílio. O que é verdade, e
            basta, é que é nesta escrita que o texto é copiado e lido desde
            então. */}
        {/* O texto muda quando não há par aberto: «as letras abaixo» com nada
            abaixo é uma frase que aponta para o vazio. */}
        <p className="font-ui text-[15px] leading-relaxed text-ink-muted">
          Mais de dois mil anos separam as duas linhas de cada par. A escrita
          quadrada que você está aprendendo foi adotada no tempo do Segundo
          Templo, e é nela que o texto antigo é copiado e lido desde então:
          {abertos.length
            ? ' as letras abaixo são, uma a uma, as que você acabou de aprender.'
            : ' as letras são, uma a uma, as que você está aprendendo agora.'}
        </p>
      </div>

      {abertos.map(x => <EraPairView key={x.par.id} par={x.par} />)}

      {fechados.length > 0 && (
        <Card className="p-5 grid gap-2">
          <p className="font-ui text-[12px] uppercase tracking-[.07em] text-ink-muted">
            Ainda fechados
          </p>
          <ul className="grid gap-1.5 list-none p-0 m-0">
            {fechados.map(x => (
              <li key={x.par.id}
                  className="flex items-center gap-3 font-ui text-[13.5px] text-ink-muted">
                <span aria-hidden className="w-6 text-center">◇</span>
                <span className="flex-1 min-w-0 truncate">A raiz de {x.par.raizPt}</span>
                <span className="tabular-nums shrink-0">{x.abre} letras</span>
              </li>
            ))}
          </ul>
          <p className="font-ui text-[13px] leading-relaxed text-ink-body">
            Um par abre quando você consegue ler as DUAS linhas. Meia comparação
            não compara nada.
          </p>
        </Card>
      )}
    </section>
  );
}

function EraPairView({ par }: { par: EraPair }) {
  const [aberto, setAberto] = useState(false);
  const antigo = getSentence(par.antigo);
  const moderno = getSentence(par.moderno);
  if (!antigo || !moderno) return null;

  /* As consoantes da raiz, sem os maqafs que a escrevem na forma de dicionário
     ({{שׁ־מ־ע}}). São elas que acendem dentro das duas frases. */
  const raiz = [...par.raiz].filter(c => /[א-ת]/.test(c));

  return (
    <Card tone="wash" className="p-5 sm:p-7 grid gap-5">
      <Linha
        rotulo={par.fontePt}
        nota={par.idadePt}
        frase={antigo}
        raiz={raiz}
        revelado={aberto}
      />

      <div className="grid gap-1 justify-items-center py-1">
        <He size="word">{par.raiz}</He>
        <p className="font-ui text-[13px] uppercase tracking-[.08em] text-ink-muted">
          {par.raizPt}
        </p>
      </div>

      <Linha
        rotulo="Hoje, na rua"
        nota="na fila do supermercado"
        frase={moderno}
        raiz={raiz}
        revelado={aberto}
      />

      {!aberto ? (
        <div className="grid gap-2 justify-items-center">
          <Button variant="ghost" onClick={() => setAberto(true)}>
            O que dizem as duas?
          </Button>
          <p className="font-ui text-[13px] text-ink-muted text-center">
            Ache as três letras acesas antes de abrir.
          </p>
        </div>
      ) : (
        <p className="font-ui text-[14.5px] leading-relaxed text-ink-body max-w-[60ch] mx-auto
                      border-t border-[color:var(--line-soft)] pt-4">
          <Prose text={par.notePt} />
        </p>
      )}
    </Card>
  );
}

function Linha({
  rotulo, nota, frase, raiz, revelado
}: {
  rotulo: string; nota: string; frase: Sentence; raiz: readonly string[]; revelado: boolean;
}) {
  return (
    <div className="grid gap-2">
      <div className="flex items-center gap-2.5 flex-wrap">
        <Badge tone="accent">{rotulo}</Badge>
        <span className="font-ui text-[12.5px] text-ink-muted">{nota}</span>
      </div>

      <div className="flex flex-wrap justify-center items-baseline gap-x-3 gap-y-2 py-1"
           dir="rtl" lang="he">
        {frase.words.map((w, k) => (
          <He key={k} size={frase.words.length > 2 ? 'lg' : 'xl'} marks={raiz}>{w.he}</He>
        ))}
      </div>

      {revelado && (
        <div className="grid gap-0.5 text-center">
          <p className="font-display text-[17px] font-bold text-ink">{frase.pt}</p>
          <p className="font-ui text-[13.5px] text-ink-muted">{frase.translit}</p>
        </div>
      )}
    </div>
  );
}

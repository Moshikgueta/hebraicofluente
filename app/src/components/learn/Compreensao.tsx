'use client';

/* A checagem de compreensão: explicação → exemplo → PERGUNTAS → prática.
 * ─────────────────────────────────────────────────────────────────────────
 * Este componente existe para um padrão, e não para uma tela: sempre que o
 * curso apresenta um conceito novo e importante, ele não segue adiante sem
 * perguntar se a pessoa entendeu. Ler uma explicação e achar que entendeu é
 * o modo mais comum de não entender - e o custo aparece três lições depois,
 * quando o conceito volta e a pessoa conclui que "hebraico é difícil".
 *
 * ── o que ele NÃO é ─────────────────────────────────────────────────────
 * Não é prova. Não vale nota, não conta XP, não tranca nada e não entra na
 * revisão espaçada. É uma conferência de entendimento, e é por isso que:
 *
 *   · a alternativa certa aparece marcada mesmo depois de um erro, em vez
 *     de pedir outra tentativa - o objetivo é ensinar, não medir;
 *   · o motivo aparece SEMPRE, inclusive no acerto: quem acerta por sorte
 *     precisa do motivo mais do que quem errou;
 *   · "Incorreto" sozinho nunca é dito. Um erro sem explicação é a pessoa
 *     descobrindo que errou e continuando sem saber por quê.
 *
 * ── por que aceita verdadeiro/falso ─────────────────────────────────────
 * O motor de exercícios do curso recusa pergunta de duas alternativas, e com
 * razão: num item de PROVA, 50% de chute não mede nada. Aqui não se mede
 * nada - o valor de um verdadeiro/falso é confrontar uma frase que a pessoa
 * provavelmente já ouviu ("sem niqqud é impossível ler") e responder a ela
 * na hora. São coisas diferentes, e por isso a regra de lá não vale aqui.
 *
 * ── os quatro formatos ──────────────────────────────────────────────────
 * escolha  múltipla escolha, com o enunciado em português
 * vf       verdadeiro ou falso
 * visual   as alternativas são hebraico, renderizado - para "qual destes
 *          tem niqqud?", que não existe como pergunta de texto
 * assoc    associação: várias linhas, cada uma com os mesmos rótulos
 */

import { useState } from 'react';
import { He } from '@/components/hebrew/He';
import { Card } from '@/components/ui/Card';

export type ItemCompreensao =
  | { t: 'escolha'; q: string; opcoes: string[]; certa: number; porque: string }
  | { t: 'vf'; q: string; certa: boolean; porque: string }
  | { t: 'visual'; q: string; opcoes: string[]; certa: number; porque: string }
  | {
      t: 'assoc';
      q: string;
      rotulos: string[];
      /** `he` marca a linha cujo enunciado é hebraico e precisa do <He>. */
      linhas: { item: string; he?: boolean; certa: number }[];
      porque: string;
    };

/* A cor de uma alternativa depois de respondida. A certa fica verde mesmo
   quando a pessoa escolheu outra - ver a nota do topo. */
function tom(respondida: boolean, estaCerta: boolean, marcada: boolean) {
  if (!respondida) return 'border-line bg-surface hover:bg-surface-2 text-ink-body';
  if (estaCerta) return 'border-[var(--teal)] bg-[var(--teal-soft)] text-[var(--teal-ink)]';
  if (marcada) return 'border-[var(--gold)] bg-[var(--gold-soft)] text-[var(--gold-ink)]';
  return 'border-line bg-surface text-ink-muted';
}

export function Compreensao({ id, titulo, intro, perguntas, fecho }: {
  id: string;
  titulo: string;
  intro: string;
  perguntas: ItemCompreensao[];
  /** A mensagem do fim, quando tudo foi respondido. */
  fecho: { bom: string; parcial: string };
}) {
  /* Uma resposta por pergunta; na associação, uma por linha. */
  const [resp, setResp] = useState<Record<number, number>>({});
  const [assoc, setAssoc] = useState<Record<string, number>>({});

  const respondida = (i: number, p: ItemCompreensao) =>
    p.t === 'assoc'
      ? p.linhas.every((_, k) => assoc[`${i}-${k}`] !== undefined)
      : resp[i] !== undefined;

  const acertou = (i: number, p: ItemCompreensao) =>
    p.t === 'assoc'
      ? p.linhas.every((l, k) => assoc[`${i}-${k}`] === l.certa)
      : p.t === 'vf'
        ? resp[i] === (p.certa ? 0 : 1)
        : resp[i] === p.certa;

  const feitas = perguntas.filter((p, i) => respondida(i, p)).length;
  const certas = perguntas.filter((p, i) => respondida(i, p) && acertou(i, p)).length;
  const completo = feitas === perguntas.length;

  return (
    <section aria-labelledby={id} className="grid gap-4">
      <div className="grid gap-1">
        <h2 id={id} className="text-[21px] font-bold">{titulo}</h2>
        <p className="font-ui text-[14px] leading-relaxed text-ink-muted max-w-[54ch]">{intro}</p>
      </div>

      {perguntas.map((p, i) => {
        const feita = respondida(i, p);
        const certo = feita && acertou(i, p);

        return (
          <Card key={p.q} className="p-5 grid gap-3">
            <p className="font-ui text-[15px] font-semibold text-ink leading-snug">
              {i + 1}. {p.q}
            </p>

            {p.t === 'escolha' && (
              <div className="grid gap-2">
                {p.opcoes.map((o, j) => (
                  <button
                    key={o}
                    type="button"
                    disabled={feita}
                    aria-pressed={resp[i] === j}
                    onClick={() => setResp(r => (r[i] === undefined ? { ...r, [i]: j } : r))}
                    className={`min-h-[48px] px-4 py-2.5 text-left rounded-[var(--r-md)] border-2
                                font-ui text-[14.5px] leading-snug transition-colors
                                disabled:cursor-default ${tom(feita, j === p.certa, resp[i] === j)}`}
                  >
                    {feita && j === p.certa && <span aria-hidden>✓ </span>}
                    {o}
                  </button>
                ))}
              </div>
            )}

            {p.t === 'vf' && (
              <div className="grid grid-cols-2 gap-2">
                {['Verdadeiro', 'Falso'].map((o, j) => {
                  const estaCerta = j === (p.certa ? 0 : 1);
                  return (
                    <button
                      key={o}
                      type="button"
                      disabled={feita}
                      aria-pressed={resp[i] === j}
                      onClick={() => setResp(r => (r[i] === undefined ? { ...r, [i]: j } : r))}
                      className={`min-h-[48px] px-4 rounded-[var(--r-md)] border-2 font-ui
                                  text-[14.5px] font-semibold transition-colors
                                  disabled:cursor-default ${tom(feita, estaCerta, resp[i] === j)}`}
                    >
                      {feita && estaCerta && <span aria-hidden>✓ </span>}
                      {o}
                    </button>
                  );
                })}
              </div>
            )}

            {p.t === 'visual' && (
              <div className="grid grid-cols-2 gap-2.5">
                {p.opcoes.map((o, j) => (
                  <button
                    key={o}
                    type="button"
                    disabled={feita}
                    aria-pressed={resp[i] === j}
                    onClick={() => setResp(r => (r[i] === undefined ? { ...r, [i]: j } : r))}
                    className={`min-h-[88px] grid place-items-center gap-1 px-4 py-3
                                rounded-[var(--r-md)] border-2 transition-colors
                                disabled:cursor-default ${tom(feita, j === p.certa, resp[i] === j)}`}
                  >
                    <He size="lg">{o}</He>
                    {feita && j === p.certa && (
                      <span aria-hidden className="font-ui text-[13px] font-bold">✓</span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {p.t === 'assoc' && (
              <div className="grid gap-2.5">
                {p.linhas.map((l, k) => {
                  const chave = `${i}-${k}`;
                  const escolhida = assoc[chave];
                  const feitaLinha = escolhida !== undefined;
                  return (
                    <div key={l.item}
                         className="grid gap-2 sm:flex sm:items-center sm:gap-3 rounded-[var(--r-md)]
                                    bg-surface-2 px-3 py-2.5">
                      <span className="sm:w-[42%] shrink-0">
                        {l.he
                          ? <He size="word">{l.item}</He>
                          : <span className="font-ui text-[14.5px] text-ink">{l.item}</span>}
                      </span>
                      <span className="flex flex-wrap gap-2">
                        {p.rotulos.map((r, j) => (
                          <button
                            key={r}
                            type="button"
                            disabled={feitaLinha}
                            aria-pressed={escolhida === j}
                            aria-label={`${l.item}: ${r}`}
                            onClick={() => setAssoc(a => (a[chave] === undefined ? { ...a, [chave]: j } : a))}
                            className={`min-h-[40px] px-3 rounded-[var(--r-sm)] border-2 font-ui
                                        text-[13.5px] font-semibold transition-colors
                                        disabled:cursor-default
                                        ${tom(feitaLinha, j === l.certa, escolhida === j)}`}
                          >
                            {feitaLinha && j === l.certa && <span aria-hidden>✓ </span>}
                            {r}
                          </button>
                        ))}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {feita && (
              <p role="status" className="font-ui text-[14px] leading-relaxed text-ink-body">
                <strong className="font-semibold text-ink">
                  {certo ? 'Isso. ' : 'A resposta certa é a marcada em verde. '}
                </strong>
                {p.porque}
              </p>
            )}
          </Card>
        );
      })}

      {completo && (
        <Card tone="wash" className="p-5 grid gap-1.5 text-center">
          <p className="font-display text-[18px] font-bold text-ink">
            {certas} de {perguntas.length}
          </p>
          <p className="font-ui text-[14.5px] leading-relaxed text-ink-body max-w-[52ch] mx-auto">
            {/* "Demonstrou compreensão" não é acertar tudo: quem acerta a
                maioria entendeu o conceito e escorregou num detalhe, e
                mandá-lo reler a página inteira por causa disso é o tipo de
                rigor que só serve para desanimar. */}
            {certas >= Math.ceil(perguntas.length * 0.7) ? fecho.bom : fecho.parcial}
          </p>
        </Card>
      )}
    </section>
  );
}

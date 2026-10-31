'use client';

/* As atividades de Raízes Sefarditas.
 * ─────────────────────────────────────────────────────────────────────────
 * Cinco formas, todas com as mesmas regras (plano pedagógico, seção 7):
 *   · o objetivo e o critério de conclusão aparecem antes de começar;
 *   · cada resposta errada tem a sua explicação, e errar nunca tranca:
 *     "Tentar de novo" está sempre ali;
 *   · a nota guardada é a da tentativa (a melhor fica), e a atividade fica
 *     concluída na primeira vez que o critério é cumprido;
 *   · acerto e erro nunca são só cor: palavra e ícone junto (tokens.css);
 *   · tudo se faz pelo teclado, sem arrastar.
 *
 * O mapa mora em MapaHistorico.tsx, pelo tamanho.
 */

import { useMemo, useState, type ReactNode } from 'react';
import { useProgress } from '@/lib/state/store';
import { chaveDaAtividade } from '@/lib/state/raizes-estado';
import { embaralhar, type Atividade } from '@/lib/raizes';
import { PainelDeFonte } from './Texto';

type De<T extends Atividade['tipo']> = Extract<Atividade, { tipo: T }>;

/** O que a atividade guarda no progresso, e o que ela já tinha. */
export function useAtividade(modulo: number, id: string) {
  const p = useProgress();
  const feita = p.state.raizes?.atividades[chaveDaAtividade(modulo, id)];
  return {
    feita,
    registrar: (nota: number, concluiu: boolean) => p.registrarAtividadeRaizes(modulo, id, nota, concluiu)
  };
}

export function Moldura({
  rotulo = 'Atividade', objetivo, enunciado, criterio, concluida, children
}: {
  rotulo?: string; objetivo: string; enunciado: string; criterio: string; concluida: boolean; children: ReactNode;
}) {
  return (
    <section className="rz-atividade grid gap-4">
      <header className="grid gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rz-rot ocre">{rotulo}</span>
          {concluida && <span className="rz-rot !text-[var(--teal-ink)]"><span aria-hidden>✓ </span>Concluída</span>}
        </div>
        <h3 className="rz-h3">{enunciado}</h3>
        <details className="group">
          <summary className="cursor-pointer list-none font-ui text-[13px] text-[var(--suave)] min-h-[32px] inline-flex items-center gap-1.5">
            <span aria-hidden className="inline-block transition-transform duration-150 group-open:rotate-90">›</span>
            Objetivo e critério
          </summary>
          <p className="m-0 mt-1 font-ui text-[13.5px] leading-relaxed text-[var(--corpo)]">
            <span className="font-semibold text-[var(--tinta)]">Objetivo:</span> {objetivo}{' '}
            <span className="font-semibold text-[var(--tinta)]">Para concluir:</span> {criterio}
          </p>
        </details>
      </header>
      {children}
    </section>
  );
}

/** A palavra e o ícone de cada resultado: nunca só a cor. */
export function Veredito({ certo, children }: { certo: boolean; children?: ReactNode }) {
  return (
    <div className={`grid gap-1 border-l-[3px] pl-3 py-1 font-ui text-[15px] leading-relaxed text-[var(--corpo)]
      ${certo ? 'border-[var(--teal)]' : 'border-[var(--ouro)]'}`}>
      <p className={`m-0 font-semibold ${certo ? 'text-[var(--teal-ink)]' : 'text-[var(--ouro-tinta)]'}`}>
        <span aria-hidden>{certo ? '✓ ' : '↺ '}</span>{certo ? 'Certo.' : 'Ainda não.'}
      </p>
      {children && <div className="m-0">{children}</div>}
    </div>
  );
}


/* ── escolha única ─────────────────────────────────────────────────────── */

export function Escolha({ modulo, id, a }: { modulo: number; id: string; a: De<'escolha'> }) {
  const { feita, registrar } = useAtividade(modulo, id);
  const [marcada, setMarcada] = useState<number | null>(null);
  const opcoes = useMemo(() => embaralhar(a.opcoes.map((o, i) => ({ ...o, i })), `${modulo}:${id}`), [a, modulo, id]);
  const escolhida = marcada === null ? null : a.opcoes[marcada]!;

  const responder = (i: number) => {
    if (marcada !== null) return;
    setMarcada(i);
    const certo = a.opcoes[i]!.correta;
    registrar(certo ? 1 : 0, certo);
  };

  return (
    <Moldura objetivo={a.objetivo} enunciado={a.enunciado} criterio={a.criterio} concluida={!!feita?.concluidaEm}>
      <div role="group" aria-label="Alternativas" className="grid gap-2">
        {opcoes.map(o => {
          const esta = marcada === o.i;
          const estado = marcada === null ? undefined : esta ? (o.correta ? 'certa' : 'errada') : 'apagada';
          return (
            <button key={o.i} type="button" aria-pressed={esta} disabled={marcada !== null && !esta}
              onClick={() => responder(o.i)} data-estado={estado} className="rz-opcao">
              {o.texto}
            </button>
          );
        })}
      </div>
      <div aria-live="polite">
        {escolhida && (
          <div className="grid gap-3">
            <Veredito certo={escolhida.correta}>{escolhida.feedback}</Veredito>
            {!escolhida.correta && (
              <button type="button" className="rz-botao claro pequeno justify-self-start" onClick={() => setMarcada(null)}>
                Tentar de novo
              </button>
            )}
            {escolhida.correta && a.afirmacoes.length > 0 && <PainelDeFonte ids={a.afirmacoes} />}
          </div>
        )}
      </div>
    </Moldura>
  );
}

/* ── seleção múltipla ──────────────────────────────────────────────────── */

export function Multipla({ modulo, id, a }: { modulo: number; id: string; a: De<'multipla'> }) {
  const { feita, registrar } = useAtividade(modulo, id);
  const [marcadas, setMarcadas] = useState<Set<number>>(new Set());
  const [conferido, setConferido] = useState(false);
  const opcoes = useMemo(() => embaralhar(a.opcoes.map((o, i) => ({ ...o, i })), `${modulo}:${id}`), [a, modulo, id]);
  const acertos = a.opcoes.filter((o, i) => o.correta === marcadas.has(i)).length;
  const tudoCerto = acertos === a.opcoes.length;

  const alternar = (i: number) => {
    if (conferido) return;
    const n = new Set(marcadas);
    if (n.has(i)) n.delete(i); else n.add(i);
    setMarcadas(n);
  };
  const conferir = () => {
    setConferido(true);
    registrar(acertos / a.opcoes.length, tudoCerto);
  };

  return (
    <Moldura objetivo={a.objetivo} enunciado={a.enunciado} criterio={a.criterio} concluida={!!feita?.concluidaEm}>
      <div role="group" aria-label="Alternativas; marque todas as que valem" className="grid gap-2">
        {opcoes.map(o => {
          const esta = marcadas.has(o.i);
          const certo = o.correta === esta;
          const estado = !conferido ? (esta ? 'marcada' : undefined) : (certo ? 'certa' : 'errada');
          return (
            <div key={o.i} className="grid gap-1.5">
              <button type="button" role="checkbox" aria-checked={esta} onClick={() => alternar(o.i)}
                data-estado={estado} className="rz-opcao flex items-start gap-3">
                <span aria-hidden className={`mt-[2px] inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-[5px] border text-[12px]
                  ${esta ? 'border-[var(--mar)] bg-[var(--mar)] text-[var(--papel)]' : 'border-[var(--locked)] bg-[var(--branco)]'}`}>{esta ? '✓' : ''}</span>
                <span>{o.texto}</span>
              </button>
              {conferido && (
                <p className={`m-0 pl-3 font-ui text-[14px] leading-relaxed text-[var(--corpo)] border-l-2 ${certo ? 'border-[var(--teal)]' : 'border-[var(--ouro)]'}`}>
                  <span className="font-semibold">{certo ? '✓ ' : '↺ '}{o.correta ? 'Vale.' : 'Não vale.'}</span> {o.feedback}
                </p>
              )}
            </div>
          );
        })}
      </div>
      <div aria-live="polite" className="grid gap-3">
        {!conferido && (
          <button type="button" className="rz-botao justify-self-start" onClick={conferir} disabled={marcadas.size === 0}>Conferir</button>
        )}
        {conferido && (
          <>
            <Veredito certo={tudoCerto}>
              {tudoCerto ? 'Todas certas.' : `${acertos} de ${a.opcoes.length} alternativas certas. Leia as explicações e tente de novo.`}
            </Veredito>
            {!tudoCerto && (
              <button type="button" className="rz-botao claro pequeno justify-self-start"
                onClick={() => { setConferido(false); setMarcadas(new Set()); }}>Tentar de novo</button>
            )}
          </>
        )}
      </div>
    </Moldura>
  );
}

/* ── documento e contexto ──────────────────────────────────────────────── */

export function Associacao({ modulo, id, a }: { modulo: number; id: string; a: De<'associacao'> }) {
  const { feita, registrar } = useAtividade(modulo, id);
  const [escolha, setEscolha] = useState<Record<string, string>>({});
  const [conferido, setConferido] = useState(false);
  const docs = useMemo(() => embaralhar(a.documentos, `${modulo}:${id}`), [a, modulo, id]);
  const certos = a.documentos.filter(d => escolha[d.id] === d.contexto).length;
  const tudoCerto = certos === a.documentos.length;
  const completos = a.documentos.every(d => escolha[d.id]);
  const nomeDe = (cid: string) => a.contextos.find(c => c.id === cid)?.nome ?? '';

  const conferir = () => {
    setConferido(true);
    registrar(certos / a.documentos.length, tudoCerto);
  };

  return (
    <Moldura rotulo="Investigação documental" objetivo={a.objetivo} enunciado={a.enunciado} criterio={a.criterio} concluida={!!feita?.concluidaEm}>
      <ol className="grid gap-4 m-0 p-0 list-none">
        {docs.map((d, k) => {
          const certo = escolha[d.id] === d.contexto;
          return (
            <li key={d.id} className="grid grid-cols-[40px_1fr] gap-x-3 gap-y-2.5 border-t border-[var(--linha)] pt-4">
              <span className="rz-numero text-[30px] row-span-3">{k + 1}</span>
              <h4 className="rz-serif m-0 text-[19px] font-[480] leading-snug text-[var(--tinta)]">{d.titulo}</h4>
              <p className="rz-corpo !text-[16px]">{d.descricao}</p>
              <label className="grid gap-1 font-ui text-[13px] font-semibold text-[var(--tinta)]">
                Contexto
                <select
                  value={escolha[d.id] ?? ''}
                  disabled={conferido}
                  onChange={e => setEscolha({ ...escolha, [d.id]: e.target.value })}
                  className="rz-campo font-normal"
                >
                  <option value="">Escolha o contexto</option>
                  {a.contextos.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              </label>
              {conferido && (
                <div className="col-start-2"><Veredito certo={certo}>
                  {certo ? (
                    <div className="grid gap-1.5">
                      <p className="m-0">{d.explicacao}</p>
                      <p className="m-0"><span className="font-semibold">O que o documento diz:</span> {d.diz}</p>
                      <p className="m-0"><span className="font-semibold">O que ele não prova:</span> {d.naoProva}</p>
                    </div>
                  ) : (
                    <p className="m-0">Não é «{nomeDe(escolha[d.id] ?? '')}». {d.explicacao}</p>
                  )}
                </Veredito></div>
              )}
            </li>
          );
        })}
      </ol>
      <div aria-live="polite" className="grid gap-3">
        {!conferido && (
          <button type="button" className="rz-botao justify-self-start" onClick={conferir} disabled={!completos}>
            {completos ? 'Conferir' : 'Escolha o contexto de todos'}
          </button>
        )}
        {conferido && (
          <>
            <Veredito certo={tudoCerto}>
              {tudoCerto ? 'Os cinco no lugar. Releia o que cada um não prova: é a parte que mais importa.'
                : `${certos} de ${a.documentos.length} certos. Corrija os outros e confira de novo.`}
            </Veredito>
            {!tudoCerto && (
              <button type="button" className="rz-botao claro pequeno justify-self-start" onClick={() => {
                setConferido(false);
                setEscolha(Object.fromEntries(a.documentos.filter(d => escolha[d.id] === d.contexto).map(d => [d.id, d.contexto])));
              }}>Corrigir</button>
            )}
          </>
        )}
      </div>
    </Moldura>
  );
}

/* ── pôr em ordem ──────────────────────────────────────────────────────── */

export function Ordenar({ modulo, id, a }: { modulo: number; id: string; a: De<'ordenar'> }) {
  const { feita, registrar } = useAtividade(modulo, id);
  const inicial = useMemo(() => embaralhar(a.eventos.map(e => e.id), `${modulo}:${id}`), [a, modulo, id]);
  const [ordem, setOrdem] = useState<string[]>(inicial);
  const [pego, setPego] = useState<number | null>(null);
  const [conferido, setConferido] = useState(false);
  const [aviso, setAviso] = useState('');
  const porId = new Map(a.eventos.map(e => [e.id, e]));
  const certoNa = (i: number) => a.eventos[i]?.id === ordem[i];
  const certos = ordem.filter((_, i) => certoNa(i)).length;
  const tudoCerto = certos === ordem.length;

  const mover = (de: number, para: number) => {
    if (para < 0 || para >= ordem.length || de === para) return;
    const n = [...ordem];
    const [x] = n.splice(de, 1);
    n.splice(para, 0, x!);
    setOrdem(n);
    setConferido(false);
    setAviso(`${porId.get(x!)?.texto} agora está na posição ${para + 1} de ${n.length}.`);
  };
  const tocar = (i: number) => {
    if (pego === null) { setPego(i); setAviso(`Item ${i + 1} escolhido. Toque no lugar para onde ele vai.`); return; }
    mover(pego, i);
    setPego(null);
  };
  const conferir = () => {
    setConferido(true);
    setPego(null);
    registrar(certos / ordem.length, tudoCerto);
  };

  return (
    <Moldura rotulo="Linha do tempo" objetivo={a.objetivo} enunciado={a.enunciado} criterio={a.criterio} concluida={!!feita?.concluidaEm}>
      <p className="rz-rot m-0">Mais antigo no alto · mais recente embaixo</p>
      <ol className="grid gap-2 m-0 p-0 list-none">
        {ordem.map((eid, i) => {
          const e = porId.get(eid)!;
          const estado = conferido ? (certoNa(i) ? 'certa' : 'errada') : pego === i ? 'marcada' : undefined;
          return (
            <li key={eid} data-estado={estado} className="rz-opcao !p-0 flex items-stretch gap-2">
              <button type="button" onClick={() => tocar(i)} aria-pressed={pego === i}
                aria-label={`${i + 1}. ${e.texto}. ${pego === null ? 'Tocar para escolher' : pego === i ? 'Escolhido; toque em outro lugar para mover' : 'Tocar para mover o item escolhido para cá'}`}
                className="flex flex-1 items-start gap-3 px-3 py-3 text-left font-ui text-[15.5px] leading-snug text-[var(--tinta)] min-h-[48px]">
                <span className="rz-numero text-[18px] w-6 shrink-0">{i + 1}</span>
                <span className="grid gap-0.5">
                  <span>{e.texto}</span>
                  {conferido && tudoCerto && <span className="rz-numero text-[14px]">{e.quando}</span>}
                  {conferido && !certoNa(i) && <span className="font-ui text-[12.5px] text-[var(--ouro-tinta)]">↺ fora do lugar</span>}
                </span>
              </button>
              <div className="flex flex-col border-l border-[var(--linha)]">
                <button type="button" aria-label={`Subir: ${e.texto}`} disabled={i === 0} onClick={() => mover(i, i - 1)}
                  className="flex-1 px-3 min-h-[24px] min-w-[44px] text-[var(--corpo)] disabled:opacity-30 hover:bg-[var(--pedra)] transition-colors duration-150">▲</button>
                <button type="button" aria-label={`Descer: ${e.texto}`} disabled={i === ordem.length - 1} onClick={() => mover(i, i + 1)}
                  className="flex-1 px-3 min-h-[24px] min-w-[44px] border-t border-[var(--linha)] text-[var(--corpo)] disabled:opacity-30 hover:bg-[var(--pedra)] transition-colors duration-150">▼</button>
              </div>
            </li>
          );
        })}
      </ol>
      <p className="sr-only" aria-live="polite">{aviso}</p>
      <div aria-live="polite" className="grid gap-3">
        {!conferido && <button type="button" className="rz-botao justify-self-start" onClick={conferir}>Conferir a ordem</button>}
        {conferido && (
          <>
            <Veredito certo={tudoCerto}>
              {tudoCerto ? a.explicacao : `${certos} de ${ordem.length} no lugar. Os marcados estão fora; mova e confira de novo.`}
            </Veredito>
            {!tudoCerto && (
              <button type="button" className="rz-botao claro pequeno justify-self-start" onClick={() => setConferido(false)}>Continuar ajustando</button>
            )}
          </>
        )}
      </div>
    </Moldura>
  );
}

/* ── classificar ───────────────────────────────────────────────────────── */

export function Classificar({ modulo, id, a }: { modulo: number; id: string; a: De<'classificar'> }) {
  const { feita, registrar } = useAtividade(modulo, id);
  const [resposta, setResposta] = useState<Record<string, string>>({});
  const [conferido, setConferido] = useState(false);
  const itens = useMemo(() => embaralhar(a.itens, `${modulo}:${id}`), [a, modulo, id]);
  const certos = a.itens.filter(i => resposta[i.id] === i.categoria).length;
  const passou = certos >= a.minimo;
  const completos = a.itens.every(i => resposta[i.id]);

  const conferir = () => {
    setConferido(true);
    registrar(certos / a.itens.length, passou);
  };

  return (
    <Moldura rotulo="Mito ou evidência?" objetivo={a.objetivo} enunciado={a.enunciado} criterio={a.criterio} concluida={!!feita?.concluidaEm}>
      <ol className="grid gap-5 m-0 p-0 list-none">
        {itens.map((it, k) => {
          const certo = resposta[it.id] === it.categoria;
          const nomeCerto = a.categorias.find(c => c.id === it.categoria)?.nome;
          return (
            <li key={it.id} className="grid gap-2">
              <p id={`cl-${it.id}`} className="rz-serif m-0 grid grid-cols-[34px_1fr] gap-2 text-[17px] leading-snug text-[var(--tinta)]">
                <span className="rz-numero text-[22px]">{k + 1}</span><span>{it.texto}</span>
              </p>
              <div role="radiogroup" aria-labelledby={`cl-${it.id}`} className="flex flex-wrap gap-2 sm:pl-[42px]">
                {a.categorias.map(c => {
                  const esta = resposta[it.id] === c.id;
                  return (
                    <button key={c.id} type="button" role="radio" aria-checked={esta} disabled={conferido}
                      onClick={() => setResposta({ ...resposta, [it.id]: c.id })}
                      className={`rz-mini ${esta ? '!bg-[var(--accent-bg)] !border-[var(--accent-bg)] !text-white' : ''}`}>
                      {c.nome}
                    </button>
                  );
                })}
              </div>
              {conferido && (
                <div className="sm:pl-[42px]"><Veredito certo={certo}>
                  {certo ? it.explicacao : <>A classificação certa é «{nomeCerto}». {it.explicacao}</>}
                </Veredito></div>
              )}
            </li>
          );
        })}
      </ol>
      <div aria-live="polite" className="grid gap-3">
        {!conferido && (
          <button type="button" className="rz-botao justify-self-start" onClick={conferir} disabled={!completos}>
            {completos ? 'Conferir' : 'Classifique todas'}
          </button>
        )}
        {conferido && (
          <>
            <Veredito certo={passou}>
              {`${certos} de ${a.itens.length} certas. `}
              {passou ? 'Critério cumprido.' : `São precisas ${a.minimo}. Releia as explicações e refaça.`}
            </Veredito>
            <button type="button" className="rz-botao claro pequeno justify-self-start"
              onClick={() => { setConferido(false); setResposta({}); }}>Refazer</button>
          </>
        )}
      </div>
    </Moldura>
  );
}

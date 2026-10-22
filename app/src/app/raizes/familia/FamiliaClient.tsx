'use client';

/* Minha História, Minhas Raízes (protótipo, 22/10/2026).
 * ─────────────────────────────────────────────────────────────────────────
 * A árvore da família, a ficha de cada pessoa com o tipo de evidência de cada
 * dado, o Caminho da Família no mapa e o registro das pesquisas de
 * sobrenome. Tudo SÓ neste aparelho (lib/raizes-familia.ts): nada vai ao
 * servidor. O exemplo para começar é fictício, e diz isso em toda a tela. */

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { PainelDeFonte } from '@/components/raizes/Texto';
import { ESTILO_DA_EVIDENCIA } from '@/components/raizes/AtlasMapa';
import { desenhoDoMapa, projetar, raizes } from '@/lib/raizes';
import { curvaEntre, encaixar } from '@/lib/raizes-atlas';
import {
  ARVORE_VAZIA, CHAVE_FAMILIA, EVIDENCIAS, GAZETTEER, TIPOS_DE_EVENTO,
  adicionarPessoa, anoDe, arvoreDeExemplo, atualizarPessoa, eventosNoMapa, exportarGedcom, exportarJson,
  geracoes, normalizar, registrarPesquisa, removerPesquisa, removerPessoa, resumo, trechosDocumentados,
  type Arvore, type Evidencia, type Pessoa, type TipoDeEvento
} from '@/lib/raizes-familia';
import { SemConteudo } from '@/app/raizes/RaizesHomeClient';

const novoId = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36);
const NOME_DA_GERACAO = ['Você', 'Pais', 'Avós', 'Bisavós', 'Trisavós'];
const nomeEv = (id: Evidencia) => EVIDENCIAS.find(e => e.id === id)!.nome;

function baixar(nome: string, conteudo: string, tipo: string) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([conteudo], { type: tipo }));
  a.download = nome;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

function SeletorDeEvidencia({ valor, onChange, nome }: { valor: Evidencia; onChange: (e: Evidencia) => void; nome: string }) {
  return (
    <fieldset className="grid gap-1 border-0 p-0 m-0">
      <legend className="font-ui text-[13px] font-semibold text-[var(--tinta)] mb-1">De onde vem o que você sabe</legend>
      <div className="flex flex-wrap gap-2">
        {EVIDENCIAS.map(e => (
          <label key={e.id} className="rz-chip inline-flex items-center gap-2 cursor-pointer" title={e.ajuda}>
            <input type="radio" name={nome} checked={valor === e.id} onChange={() => onChange(e.id)} className="h-4 w-4" />
            {e.nome}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function FamiliaClient() {
  const r = raizes();
  const [arv, setArv] = useState<Arvore>(ARVORE_VAZIA);
  const [carregou, setCarregou] = useState(false);
  const [sel, setSel] = useState<string | null>(null);
  const [aviso, setAviso] = useState('');
  const [comVivos, setComVivos] = useState(false);
  const [apagar, setApagar] = useState(false);
  const [caminhoDe, setCaminhoDe] = useState<string>('');

  useEffect(() => {
    try { setArv(normalizar(JSON.parse(localStorage.getItem(CHAVE_FAMILIA) || '{}'))); }
    catch { /* sem armazenamento: a árvore funciona, só não lembra */ }
    setCarregou(true);
  }, []);

  const guardar = (nova: Arvore, msg = 'Guardado neste aparelho.') => {
    setArv(nova);
    try { localStorage.setItem(CHAVE_FAMILIA, JSON.stringify(nova)); setAviso(msg); }
    catch { setAviso('Este aparelho não deixou guardar. Baixe uma cópia antes de sair.'); }
  };

  if (r.semConteudo) return <SemConteudo />;
  const pessoa = arv.pessoas.find(p => p.id === sel) ?? null;
  const linhas = geracoes(arv, arv.centro);
  const naArvore = new Set(linhas.flat().map(p => p.id));
  const soltas = arv.pessoas.filter(p => !naArvore.has(p.id));
  const vazia = arv.pessoas.length === 0;

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-9 pt-8">
      <header className="grid gap-3">
        <p className="rz-rot ocre m-0">Raízes Sefarditas · Minha história</p>
        <h1 className="rz-pagina">Minha História, Minhas Raízes</h1>
        <p className="rz-entrada m-0">Uma árvore da família em que cada pessoa e cada dado dizem de onde vêm: documento, memória oral, hipótese ou ainda não verificado.</p>
        <p className="m-0 font-ui text-[13.5px] leading-relaxed text-[var(--suave)]">
          Fica só neste aparelho: não vai ao servidor, não entra no seu progresso nem no certificado. Nada aqui calcula ascendência, religião ou
          origem; um sobrenome não prova parentesco com ninguém.
        </p>
      </header>

      {arv.exemplo && (
        <aside className="rz-nota grid gap-2" role="note">
          <p className="rz-rot m-0">Exemplo didático, fictício</p>
          <p className="m-0 font-ui text-[14.5px] leading-relaxed text-[var(--corpo)]">As pessoas, datas e documentos desta árvore foram inventados para mostrar como ela funciona.</p>
          <button type="button" className="rz-botao claro pequeno justify-self-start" onClick={() => { guardar(ARVORE_VAZIA, 'O exemplo foi apagado.'); setSel(null); }}>
            Apagar o exemplo e começar a minha
          </button>
        </aside>
      )}

      {carregou && vazia && (
        <section className="grid gap-3">
          <h2 className="rz-h2">Por onde começar</h2>
          <p className="rz-corpo">Comece por você e ande para trás, uma geração de cada vez, com um documento em cada elo.</p>
          <div className="flex flex-wrap gap-3">
            <button type="button" className="rz-botao" onClick={() => {
              const id = novoId();
              guardar(adicionarPessoa(ARVORE_VAZIA, { nome: 'Você', nomesAlternativos: '', viva: true, evidencia: 'documentado', pais: [], eventos: [], fontes: '', notas: '' }, id));
              setSel(id);
            }}>Começar a minha árvore</button>
            <button type="button" className="rz-botao claro" onClick={() => { guardar(arvoreDeExemplo(), 'Exemplo fictício carregado.'); setSel('bisavo'); }}>
              Ver um exemplo fictício
            </button>
          </div>
        </section>
      )}

      {!vazia && (
        <>
          <section className="grid gap-3" aria-labelledby="t-arvore">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="t-arvore" className="rz-h2">A árvore</h2>
              <ul className="m-0 p-0 list-none flex flex-wrap gap-x-4 font-ui text-[13px] text-[var(--corpo)]">
                {resumo(arv).map(x => <li key={x.id}><span className="font-semibold tabular-nums text-[var(--tinta)]">{x.n}</span> {x.nome.toLowerCase()}</li>)}
              </ul>
            </div>
            <ol className="m-0 p-0 list-none grid gap-4">
              {linhas.map((ger, g) => (
                <li key={g} className="grid gap-2">
                  <p className="rz-rot m-0">{NOME_DA_GERACAO[g] ?? `Geração ${g}`}</p>
                  <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
                    {ger.map(p => <CartaoDePessoa key={p.id} p={p} ativo={sel === p.id} onClick={() => setSel(p.id)} />)}
                  </div>
                </li>
              ))}
              {soltas.length > 0 && (
                <li className="grid gap-2">
                  <p className="rz-rot m-0">Ainda sem ligação</p>
                  <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
                    {soltas.map(p => <CartaoDePessoa key={p.id} p={p} ativo={sel === p.id} onClick={() => setSel(p.id)} />)}
                  </div>
                </li>
              )}
            </ol>
          </section>

          {pessoa && <Ficha key={pessoa.id} arv={arv} p={pessoa} guardar={guardar} onSelecionar={setSel} />}

          <CaminhoDaFamilia arv={arv} pessoaId={caminhoDe} setPessoaId={setCaminhoDe} />

          <Sobrenomes arv={arv} guardar={guardar} />

          <section className="grid gap-3">
            <h2 className="rz-h2">Sua cópia</h2>
            <label className="flex items-start gap-3 min-h-[44px] font-ui text-[14px] text-[var(--corpo)]">
              <input type="checkbox" checked={comVivos} onChange={e => setComVivos(e.target.checked)} className="mt-1 h-5 w-5 shrink-0" />
              <span>Incluir os dados de pessoas vivas. <span className="text-[var(--suave)]">Sem isso, elas saem só com o primeiro nome, sem datas, lugares nem notas.</span></span>
            </label>
            <div className="flex flex-wrap gap-3">
              <button type="button" className="rz-botao claro pequeno" onClick={() => baixar('minha-arvore.json', exportarJson(arv, new Date().toISOString(), comVivos), 'application/json')}>Baixar (JSON)</button>
              <button type="button" className="rz-botao claro pequeno" onClick={() => baixar('minha-arvore.ged', exportarGedcom(arv, comVivos), 'text/plain')}>Baixar (GEDCOM)</button>
              <label className="rz-botao claro pequeno cursor-pointer">
                Abrir uma cópia (JSON)
                <input type="file" accept="application/json,.json" className="sr-only" onChange={async e => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  try { guardar(normalizar(JSON.parse(await f.text())), 'Cópia aberta e guardada neste aparelho.'); setSel(null); }
                  catch { setAviso('Esse arquivo não é uma cópia da árvore.'); }
                }} />
              </label>
            </div>
            <p className="m-0 font-ui text-[12.5px] text-[var(--suave)]">O GEDCOM é o formato que outros programas de genealogia leem. Abrir um GEDCOM aqui ainda não é possível.</p>
            {!apagar ? (
              <button type="button" className="rz-link justify-self-start min-h-[44px]" onClick={() => setApagar(true)}>Apagar a árvore deste aparelho</button>
            ) : (
              <span className="flex flex-wrap items-center gap-3 font-ui text-[14px] text-[var(--tinta)]">
                Apagar todas as pessoas e pesquisas deste aparelho?
                <button type="button" className="rz-botao pequeno" onClick={() => { guardar(ARVORE_VAZIA, 'Árvore apagada deste aparelho.'); setApagar(false); setSel(null); }}>Sim, apagar</button>
                <button type="button" className="rz-link min-h-[44px]" onClick={() => setApagar(false)}>Não</button>
              </span>
            )}
          </section>
        </>
      )}
      <p className="m-0 min-h-[18px] font-ui text-[12.5px] text-[var(--suave)]" aria-live="polite">{aviso}</p>
      <p className="m-0 font-ui text-[14px]"><Link href="/raizes/atlas" prefetch={false} className="rz-link">Voltar ao Atlas</Link></p>
    </div>
  );
}

function CartaoDePessoa({ p, ativo, onClick }: { p: Pessoa; ativo: boolean; onClick: () => void }) {
  const anos = p.eventos.map(e => anoDe(e.data)).filter((n): n is number => n !== null);
  return (
    <button type="button" onClick={onClick} aria-pressed={ativo}
      className={`grid min-w-[150px] max-w-[200px] shrink-0 gap-0.5 rounded-[10px] border px-3 py-2 text-left ${ativo ? 'border-[var(--noite)] bg-[var(--noite)] text-white' : 'border-[var(--linha)] bg-[var(--branco)] text-[var(--tinta)]'}`}>
      <span className="rz-serif text-[16px] font-[480] leading-tight">{p.nome}</span>
      <span className={`font-ui text-[12px] ${ativo ? 'text-white/80' : 'text-[var(--suave)]'}`}>
        {p.viva ? 'Pessoa viva' : anos.length ? `${Math.min(...anos)}` : 'sem data'} · {nomeEv(p.evidencia)}
      </span>
    </button>
  );
}

function Ficha({ arv, p, guardar, onSelecionar }: { arv: Arvore; p: Pessoa; guardar: (a: Arvore, m?: string) => void; onSelecionar: (id: string | null) => void }) {
  const [nomePai, setNomePai] = useState('');
  const [evPai, setEvPai] = useState<Evidencia>('documentado');
  const [ev, setEv] = useState({ tipo: 'nascimento' as TipoDeEvento, data: '', lugarId: '', lugar: '', evidencia: 'documentado' as Evidencia, fonte: '' });
  const [fontesAbertas, setFontesAbertas] = useState(false);
  const pais = p.pais.map(id => arv.pessoas.find(x => x.id === id)).filter((x): x is Pessoa => !!x);
  const muda = (m: Partial<Pessoa>) => guardar(atualizarPessoa(arv, p.id, m));

  return (
    <article className="rz-ficha" aria-label={`Ficha de ${p.nome}`}>
      <header className="grid gap-0.5">
        <span className="rz-rot !text-[#8FD6C8]">{nomeEv(p.evidencia)}{p.viva ? ' · pessoa viva' : ''}{arv.exemplo ? ' · exemplo fictício' : ''}</span>
        <h3 className="rz-serif m-0 font-[440]">{p.nome}</h3>
      </header>
      <div className="grid gap-4 p-4">
        <label className="grid gap-1 font-ui text-[13px] font-semibold text-[var(--tinta)]">
          Nome
          <input defaultValue={p.nome} maxLength={160} onBlur={e => e.target.value.trim() && muda({ nome: e.target.value })} className="rz-campo font-normal" />
        </label>
        <label className="grid gap-1 font-ui text-[13px] font-semibold text-[var(--tinta)]">
          Outros nomes e grafias
          <span className="font-normal text-[var(--suave)]">Variantes do nome e do sobrenome, como aparecem nos documentos.</span>
          <input defaultValue={p.nomesAlternativos} maxLength={160} onBlur={e => muda({ nomesAlternativos: e.target.value })} className="rz-campo font-normal" />
        </label>
        <label className="flex items-start gap-3 min-h-[44px] font-ui text-[14px] text-[var(--corpo)]">
          <input type="checkbox" checked={p.viva} onChange={e => muda({ viva: e.target.checked })} className="mt-1 h-5 w-5 shrink-0" />
          <span>Pessoa viva <span className="text-[var(--suave)]">(protegida nas cópias que você baixar)</span></span>
        </label>
        <SeletorDeEvidencia valor={p.evidencia} onChange={e => muda({ evidencia: e })} nome={`ev-${p.id}`} />

        <div className="grid gap-2">
          <p className="rz-rot m-0">Acontecimentos</p>
          {p.eventos.length === 0 && <p className="m-0 font-ui text-[14px] text-[var(--suave)]">Nenhum ainda.</p>}
          <ul className="m-0 p-0 list-none">
            {p.eventos.map(e => (
              <li key={e.id} className="grid gap-0.5 border-t border-[var(--linha)] py-2 font-ui text-[14px] text-[var(--corpo)]">
                <span><span className="font-semibold text-[var(--tinta)]">{TIPOS_DE_EVENTO.find(t => t.id === e.tipo)!.nome}</span> · {e.data || 'sem data'} · {e.lugar || 'sem lugar'}</span>
                <span className="text-[12.5px] text-[var(--suave)]">{nomeEv(e.evidencia)}{e.fonte ? ` · Fonte: ${e.fonte}` : ''}</span>
                <button type="button" className="rz-link !text-[12.5px] justify-self-start min-h-[36px]" onClick={() => muda({ eventos: p.eventos.filter(x => x.id !== e.id) })}>Apagar</button>
              </li>
            ))}
          </ul>
          <details className="grid gap-2">
            <summary className="rz-link cursor-pointer min-h-[44px] inline-flex items-center">Acrescentar um acontecimento</summary>
            <div className="grid gap-2 pt-2">
              <label className="grid gap-1 font-ui text-[13px] font-semibold text-[var(--tinta)]">O quê
                <select value={ev.tipo} onChange={e => setEv({ ...ev, tipo: e.target.value as TipoDeEvento })} className="rz-campo font-normal">
                  {TIPOS_DE_EVENTO.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
                </select>
              </label>
              <label className="grid gap-1 font-ui text-[13px] font-semibold text-[var(--tinta)]">Quando
                <input value={ev.data} onChange={e => setEv({ ...ev, data: e.target.value })} placeholder="1905, ou por volta de 1880" maxLength={40} className="rz-campo font-normal" />
              </label>
              <label className="grid gap-1 font-ui text-[13px] font-semibold text-[var(--tinta)]">Onde (para aparecer no mapa)
                <select value={ev.lugarId} onChange={e => setEv({ ...ev, lugarId: e.target.value })} className="rz-campo font-normal">
                  <option value="">Outro lugar (só o nome, fora do mapa)</option>
                  {GAZETTEER.map(g => <option key={g.id} value={g.id}>{g.nome}</option>)}
                </select>
              </label>
              {!ev.lugarId && (
                <label className="grid gap-1 font-ui text-[13px] font-semibold text-[var(--tinta)]">Nome do lugar
                  <input value={ev.lugar} onChange={e => setEv({ ...ev, lugar: e.target.value })} maxLength={160} className="rz-campo font-normal" />
                </label>
              )}
              <SeletorDeEvidencia valor={ev.evidencia} onChange={x => setEv({ ...ev, evidencia: x })} nome={`ev-novo-${p.id}`} />
              <label className="grid gap-1 font-ui text-[13px] font-semibold text-[var(--tinta)]">Fonte
                <input value={ev.fonte} onChange={e => setEv({ ...ev, fonte: e.target.value })} placeholder="Qual documento, livro, folha; ou quem contou" maxLength={300} className="rz-campo font-normal" />
              </label>
              <button type="button" className="rz-botao pequeno justify-self-start" onClick={() => {
                muda({ eventos: [...p.eventos, { id: novoId(), tipo: ev.tipo, data: ev.data, lugar: ev.lugar, ...(ev.lugarId ? { lugarId: ev.lugarId } : {}), evidencia: ev.evidencia, fonte: ev.fonte }] });
                setEv({ ...ev, data: '', lugar: '', fonte: '' });
              }}>Guardar o acontecimento</button>
            </div>
          </details>
        </div>

        <div className="grid gap-2">
          <p className="rz-rot m-0">Pais</p>
          {pais.length === 0 && <p className="m-0 font-ui text-[14px] text-[var(--suave)]">Nenhum ligado ainda.</p>}
          <div className="flex flex-wrap gap-2">{pais.map(x => <CartaoDePessoa key={x.id} p={x} ativo={false} onClick={() => onSelecionar(x.id)} />)}</div>
          {pais.length < 2 && (
            <div className="grid gap-2">
              <label className="grid gap-1 font-ui text-[13px] font-semibold text-[var(--tinta)]">Acrescentar pai ou mãe
                <input value={nomePai} onChange={e => setNomePai(e.target.value)} maxLength={160} className="rz-campo font-normal" />
              </label>
              <SeletorDeEvidencia valor={evPai} onChange={setEvPai} nome={`ev-pai-${p.id}`} />
              <button type="button" className="rz-botao claro pequeno justify-self-start" disabled={!nomePai.trim()} onClick={() => {
                guardar(adicionarPessoa(arv, { nome: nomePai, nomesAlternativos: '', viva: false, evidencia: evPai, pais: [], eventos: [], fontes: '', notas: '' }, novoId(), p.id));
                setNomePai('');
              }}>Ligar</button>
            </div>
          )}
        </div>

        <label className="grid gap-1 font-ui text-[13px] font-semibold text-[var(--tinta)]">
          Notas
          <textarea defaultValue={p.notas} maxLength={2000} rows={3} onBlur={e => muda({ notas: e.target.value })} className="rz-campo font-normal" />
        </label>
        {/sobrenome|cristã|sefard|judeu|judia/i.test(p.notas) && (
          <div className="grid gap-1">
            <p className="m-0 font-ui text-[13.5px] leading-relaxed text-[var(--ocre)]">
              Uma história de família sobre origem é uma hipótese a testar com documentos. A presença de um sobrenome em registros de cristãos-novos não comprova ascendência nem parentesco.
            </p>
            <button type="button" className="rz-link !text-[13px] justify-self-start min-h-[40px]" onClick={() => setFontesAbertas(!fontesAbertas)} aria-expanded={fontesAbertas}>
              {fontesAbertas ? 'Fechar as fontes' : 'Por quê?'}
            </button>
            {fontesAbertas && <PainelDeFonte ids={['R07-012', 'R07-013']} />}
          </div>
        )}
        <button type="button" className="rz-link justify-self-start min-h-[44px]" onClick={() => { guardar(removerPessoa(arv, p.id), `${p.nome} foi apagado da árvore.`); onSelecionar(null); }}>
          Apagar esta pessoa
        </button>
      </div>
    </article>
  );
}

/** O Caminho da Família: os lugares com data, em ordem. Linha só onde a mudança é documentada. */
function CaminhoDaFamilia({ arv, pessoaId, setPessoaId }: { arv: Arvore; pessoaId: string; setPessoaId: (id: string) => void }) {
  const d = desenhoDoMapa('atlantico');
  const evs = eventosNoMapa(arv, pessoaId || null);
  const trechos = trechosDocumentados(arv).filter(t => !pessoaId || t.pessoa.id === pessoaId);
  const janela = useMemo(() => {
    if (!evs.length) return null;
    const xs = evs.map(e => projetar(e.lugar.lon, e.lugar.lat, d));
    const minX = Math.min(...xs.map(p => p[0])), maxX = Math.max(...xs.map(p => p[0]));
    const minY = Math.min(...xs.map(p => p[1])), maxY = Math.max(...xs.map(p => p[1]));
    const m = Math.max(maxX - minX, maxY - minY, 200) * 0.25;
    return encaixar({ x: minX - m, y: minY - m, w: maxX - minX + 2 * m, h: maxY - minY + 2 * m }, 1.25, d);
  }, [evs, d]);
  return (
    <section className="grid gap-3" aria-labelledby="t-caminho">
      <h2 id="t-caminho" className="rz-h2">O Caminho da Família</h2>
      <p className="m-0 font-ui text-[14px] leading-relaxed text-[var(--corpo)]">
        Os lugares dos acontecimentos, em ordem de data. Uma linha só aparece onde a mudança tem documento; sem ele, ficam só os pontos.
      </p>
      <label className="grid gap-1 font-ui text-[13px] font-semibold text-[var(--tinta)] max-w-[360px]">De quem
        <select value={pessoaId} onChange={e => setPessoaId(e.target.value)} className="rz-campo font-normal">
          <option value="">Toda a família</option>
          {arv.pessoas.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
        </select>
      </label>
      {!janela ? (
        <p className="m-0 font-ui text-[14px] text-[var(--suave)]">Nenhum acontecimento com lugar no mapa ainda.</p>
      ) : (
        <figure className="rz-figura grid gap-0">
          <svg viewBox={`${janela.x} ${janela.y} ${janela.w} ${janela.h}`} className="w-full bg-[var(--rz-mar-claro)]" role="img"
            aria-label={`Mapa com ${evs.length} acontecimentos da família`}>
            <path d={d.terra} fill="var(--rz-terra-mapa)" stroke="var(--pedra-escura)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
            {trechos.map((t, i) => (
              <path key={i} d={curvaEntre(projetar(t.de.lon, t.de.lat, d), projetar(t.para.lon, t.para.lat, d))} fill="none"
                stroke={ESTILO_DA_EVIDENCIA.documentado!.cor} strokeWidth={3} vectorEffect="non-scaling-stroke" />
            ))}
            {evs.map((e, i) => {
              const [x, y] = projetar(e.lugar.lon, e.lugar.lat, d);
              const rr = janela.w / 70;
              return (
                <g key={`${e.pessoa.id}-${e.evento.id}`}>
                  <circle cx={x} cy={y} r={rr} fill="#B8862F" stroke="#0B2A31" strokeWidth={2} vectorEffect="non-scaling-stroke" />
                  <text x={x} y={y + rr * 0.38} textAnchor="middle" fontSize={rr * 1.1} fontWeight={700} fill="#0B2A31">{i + 1}</text>
                </g>
              );
            })}
          </svg>
          <figcaption>Contorno de hoje (Natural Earth). Linha cheia: mudança com documento.</figcaption>
        </figure>
      )}
      {evs.length > 0 && (
        <ol className="m-0 pl-6 grid gap-1 font-ui text-[14px] text-[var(--corpo)]">
          {evs.map(e => (
            <li key={`${e.pessoa.id}-${e.evento.id}`}>
              <span className="font-semibold text-[var(--tinta)]">{e.evento.data || 'sem data'}</span>, {e.lugar.nome}: {TIPOS_DE_EVENTO.find(t => t.id === e.evento.tipo)!.nome.toLowerCase()} de {e.pessoa.nome} <span className="text-[var(--suave)]">({nomeEv(e.evento.evidencia)})</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

const ARQUIVOS = [
  { nome: 'Digitarq (arquivos portugueses, Torre do Tombo e distritais)', url: 'https://digitarq.arquivos.pt/' },
  { nome: 'PARES (Portal de Archivos Españoles)', url: 'https://pares.cultura.gob.es/' },
  { nome: 'JewishGen', url: 'https://www.jewishgen.org/' },
  { nome: 'SIAN (Arquivo Nacional do Brasil)', url: 'https://sian.an.gov.br/' }
];

/** As pesquisas de sobrenome: um registro do que se procurou e onde. Não é um buscador. */
function Sobrenomes({ arv, guardar }: { arv: Arvore; guardar: (a: Arvore, m?: string) => void }) {
  const [q, setQ] = useState({ sobrenome: '', variantes: '', arquivo: '', resultado: '' });
  return (
    <section className="grid gap-3" aria-labelledby="t-sobrenomes">
      <h2 id="t-sobrenomes" className="rz-h2">Pesquisar um sobrenome</h2>
      <p className="rz-nota m-0 font-ui text-[14px] leading-relaxed text-[var(--tinta)]" role="note">
        A presença de um sobrenome em registros sefarditas não comprova, por si só, ascendência judaica ou parentesco com as pessoas registradas.
      </p>
      <p className="m-0 font-ui text-[14px] leading-relaxed text-[var(--corpo)]">
        A busca se faz no site de cada arquivo; o Raízes não copia nem integra os dados deles. Aqui você guarda onde procurou, com que grafias, e o que achou, inclusive o que não achou.
      </p>
      <ul className="m-0 pl-5 grid gap-1 font-ui text-[14px]">
        {ARQUIVOS.map(a => <li key={a.url}><a href={a.url} target="_blank" rel="noopener noreferrer" className="rz-link">{a.nome}</a></li>)}
      </ul>
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="grid gap-1 font-ui text-[13px] font-semibold text-[var(--tinta)]">Sobrenome
          <input value={q.sobrenome} onChange={e => setQ({ ...q, sobrenome: e.target.value })} maxLength={160} className="rz-campo font-normal" />
        </label>
        <label className="grid gap-1 font-ui text-[13px] font-semibold text-[var(--tinta)]">Grafias procuradas
          <input value={q.variantes} onChange={e => setQ({ ...q, variantes: e.target.value })} maxLength={160} className="rz-campo font-normal" />
        </label>
        <label className="grid gap-1 font-ui text-[13px] font-semibold text-[var(--tinta)] sm:col-span-2">Onde procurou
          <input value={q.arquivo} onChange={e => setQ({ ...q, arquivo: e.target.value })} maxLength={160} placeholder="Arquivo, fundo, livro" className="rz-campo font-normal" />
        </label>
        <label className="grid gap-1 font-ui text-[13px] font-semibold text-[var(--tinta)] sm:col-span-2">O que achou
          <textarea value={q.resultado} onChange={e => setQ({ ...q, resultado: e.target.value })} maxLength={2000} rows={3} className="rz-campo font-normal" />
        </label>
      </div>
      <button type="button" className="rz-botao claro pequeno justify-self-start" disabled={!q.sobrenome.trim()} onClick={() => {
        guardar(registrarPesquisa(arv, { ...q, em: new Date().toISOString().slice(0, 10) }, novoId()), 'Pesquisa anotada neste aparelho.');
        setQ({ sobrenome: '', variantes: '', arquivo: '', resultado: '' });
      }}>Anotar a pesquisa</button>
      {arv.pesquisas.length > 0 && (
        <ol className="m-0 p-0 list-none">
          {arv.pesquisas.map(x => (
            <li key={x.id} className="grid gap-0.5 border-t border-[var(--linha)] py-2 font-ui text-[14px] text-[var(--corpo)]">
              <span><span className="font-semibold text-[var(--tinta)]">{x.sobrenome}</span>{x.variantes ? ` (${x.variantes})` : ''} · {x.em}</span>
              {x.arquivo && <span className="text-[var(--suave)]">{x.arquivo}</span>}
              {x.resultado && <span>{x.resultado}</span>}
              <button type="button" className="rz-link !text-[12.5px] justify-self-start min-h-[36px]" onClick={() => guardar(removerPesquisa(arv, x.id))}>Apagar</button>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

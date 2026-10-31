'use client';

/* O Laboratório de Memórias Familiares (módulo 9): fichas de antepassados,
 * cada uma com o tipo de evidência, e um diário de pesquisa. Tudo fica neste
 * aparelho (lib/raizes-laboratorio.ts): sem servidor, sem progresso, sem
 * certificado. Baixar e apagar estão sempre à vista. */

import { useEffect, useState } from 'react';
import {
  CHAVE_LABORATORIO, EVIDENCIAS, LABORATORIO_VAZIO, LIMITES,
  adicionarPessoa, anotar, exportar, normalizar, removerAnotacao, removerPessoa, resumo,
  type Evidencia, type Laboratorio as Lab
} from '@/lib/raizes-laboratorio';

const novoId = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
const FICHA_VAZIA = { nome: '', relacao: '', quando: '', onde: '', evidencia: 'documentado' as Evidencia, fonte: '', notas: '' };

export function Laboratorio({ titulo, apresentacao }: { titulo: string; apresentacao: string }) {
  const [lab, setLab] = useState<Lab>(LABORATORIO_VAZIO);
  const [ficha, setFicha] = useState(FICHA_VAZIA);
  const [nota, setNota] = useState('');
  const [apagar, setApagar] = useState(false);
  const [aviso, setAviso] = useState('');

  useEffect(() => {
    try { setLab(normalizar(JSON.parse(localStorage.getItem(CHAVE_LABORATORIO) || '{}'))); }
    catch { /* aparelho sem armazenamento: o laboratório funciona, só não lembra */ }
  }, []);

  const guardar = (novo: Lab, msg: string) => {
    setLab(novo);
    try { localStorage.setItem(CHAVE_LABORATORIO, JSON.stringify(novo)); setAviso(msg); }
    catch { setAviso('Este aparelho não deixou guardar. Baixe uma cópia antes de sair.'); }
  };

  const incluir = () => {
    if (!ficha.nome.trim()) return;
    guardar(adicionarPessoa(lab, ficha, novoId()), `Ficha de ${ficha.nome.trim()} guardada neste aparelho.`);
    setFicha(FICHA_VAZIA);
  };

  const baixar = () => {
    const blob = new Blob([exportar(lab, new Date().toISOString())], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'raizes-laboratorio.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  const campo = (rotulo: string, chave: 'nome' | 'relacao' | 'quando' | 'onde', dica?: string) => (
    <label className="grid gap-1 font-ui text-[13px] font-semibold text-[var(--tinta)]">
      {rotulo}
      {dica && <span className="font-normal text-[var(--suave)]">{dica}</span>}
      <input value={ficha[chave]} maxLength={LIMITES.campo} onChange={e => setFicha({ ...ficha, [chave]: e.target.value })}
        className="rz-campo font-normal" />
    </label>
  );

  return (
    <section className="rz-atividade rz-lab grid gap-5" aria-labelledby="lab-titulo">
      <header className="grid gap-2">
        <span className="rz-rot ocre">Laboratório</span>
        <h2 id="lab-titulo" className="rz-h2">{titulo}</h2>
        <p className="rz-corpo m-0">{apresentacao}</p>
        <p className="m-0 font-ui text-[13.5px] leading-relaxed text-[var(--suave)]">
          Fica só neste aparelho: não vai ao servidor, não entra no seu progresso nem no certificado. Nada aqui
          calcula ascendência: o laboratório só organiza o que você encontrou.
        </p>
      </header>

      <div className="grid gap-2">
        <p className="rz-rot m-0">Suas fichas, por tipo de evidência</p>
        <ul className="m-0 p-0 list-none flex flex-wrap gap-x-5 gap-y-1 font-ui text-[14px] text-[var(--corpo)]">
          {resumo(lab).map(r => <li key={r.id}><span className="tabular-nums font-semibold text-[var(--tinta)]">{r.n}</span> {r.nome.toLowerCase()}</li>)}
        </ul>
      </div>

      {lab.pessoas.length > 0 && (
        <ol className="m-0 p-0 list-none">
          {lab.pessoas.map(p => {
            const ev = EVIDENCIAS.find(e => e.id === p.evidencia)!;
            return (
              <li key={p.id} className="grid gap-1 border-t border-[var(--linha)] py-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="rz-serif m-0 text-[19px] font-[480] text-[var(--titulo)]">{p.nome}</h3>
                  <span className="rz-rot !text-[var(--mar)]">{ev.nome}</span>
                </div>
                {(p.relacao || p.quando || p.onde) && (
                  <p className="m-0 font-ui text-[14px] text-[var(--corpo)]">{[p.relacao, p.quando, p.onde].filter(Boolean).join(' · ')}</p>
                )}
                {p.fonte && <p className="m-0 font-ui text-[14px] text-[var(--corpo)]"><span className="font-semibold text-[var(--tinta)]">Fonte:</span> {p.fonte}</p>}
                {p.notas && <p className="m-0 font-ui text-[14px] text-[var(--corpo)]">{p.notas}</p>}
                <button type="button" className="rz-link !text-[13px] justify-self-start min-h-[40px] inline-flex items-center"
                  onClick={() => guardar(removerPessoa(lab, p.id), `Ficha de ${p.nome} apagada.`)}>
                  Apagar esta ficha
                </button>
              </li>
            );
          })}
        </ol>
      )}

      <form className="rz-nota grid gap-3" onSubmit={e => { e.preventDefault(); incluir(); }}>
        <p className="rz-rot m-0">Nova ficha</p>
        {campo('Nome', 'nome')}
        {campo('Quem é para você', 'relacao', 'Por exemplo: bisavó paterna.')}
        {campo('Quando', 'quando', 'Um ano, uma data, ou "por volta de".')}
        {campo('Onde', 'onde')}
        <fieldset className="grid gap-2 border-0 p-0 m-0">
          <legend className="font-ui text-[13px] font-semibold text-[var(--tinta)] mb-1">De onde vem o que você sabe</legend>
          {EVIDENCIAS.map(e => (
            <label key={e.id} className="flex items-start gap-3 min-h-[44px] font-ui text-[14px] text-[var(--corpo)]">
              <input type="radio" name="evidencia" value={e.id} checked={ficha.evidencia === e.id}
                onChange={() => setFicha({ ...ficha, evidencia: e.id })} className="mt-1 h-5 w-5 shrink-0" />
              <span><span className="font-semibold text-[var(--tinta)]">{e.nome}.</span> {e.ajuda}</span>
            </label>
          ))}
        </fieldset>
        <label className="grid gap-1 font-ui text-[13px] font-semibold text-[var(--tinta)]">
          Fonte
          <span className="font-normal text-[var(--suave)]">Qual documento, arquivo, livro ou pessoa.</span>
          <textarea value={ficha.fonte} maxLength={LIMITES.texto} rows={3} onChange={e => setFicha({ ...ficha, fonte: e.target.value })} className="rz-campo font-normal" />
        </label>
        <label className="grid gap-1 font-ui text-[13px] font-semibold text-[var(--tinta)]">
          Notas
          <textarea value={ficha.notas} maxLength={LIMITES.texto} rows={3} onChange={e => setFicha({ ...ficha, notas: e.target.value })} className="rz-campo font-normal" />
        </label>
        <button type="submit" className="rz-botao justify-self-start" disabled={!ficha.nome.trim()}>Guardar a ficha</button>
      </form>

      <div className="rz-nota mar grid gap-3">
        <p className="rz-rot m-0">Diário de pesquisa</p>
        <label htmlFor="lab-diario" className="rz-h3 !text-[18px]">O que você procurou hoje, onde, e o que achou (ou não achou)?</label>
        <textarea id="lab-diario" value={nota} maxLength={LIMITES.texto} rows={4} onChange={e => setNota(e.target.value)} className="rz-campo" />
        <button type="button" className="rz-botao claro pequeno justify-self-start" disabled={!nota.trim()}
          onClick={() => { guardar(anotar(lab, nota, new Date().toISOString(), novoId()), 'Anotação guardada neste aparelho.'); setNota(''); }}>
          Anotar
        </button>
        {lab.diario.length > 0 && (
          <ol className="m-0 p-0 list-none">
            {lab.diario.map(a => (
              <li key={a.id} className="grid gap-1 border-t border-[var(--linha)] py-2">
                <span className="rz-rot">{new Date(a.em).toLocaleDateString('pt-BR')}</span>
                <p className="m-0 rz-corpo !text-[16px] whitespace-pre-line">{a.texto}</p>
                <button type="button" className="rz-link !text-[13px] justify-self-start min-h-[40px] inline-flex items-center"
                  onClick={() => guardar(removerAnotacao(lab, a.id), 'Anotação apagada.')}>Apagar esta anotação</button>
              </li>
            ))}
          </ol>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" className="rz-botao claro pequeno" onClick={baixar}
          disabled={lab.pessoas.length === 0 && lab.diario.length === 0}>Baixar uma cópia (JSON)</button>
        {!apagar ? (
          <button type="button" className="rz-link min-h-[44px]" onClick={() => setApagar(true)}
            disabled={lab.pessoas.length === 0 && lab.diario.length === 0}>Apagar tudo do laboratório</button>
        ) : (
          <span className="flex flex-wrap items-center gap-3 font-ui text-[14px] text-[var(--tinta)]">
            Apagar todas as fichas e anotações deste aparelho?
            <button type="button" className="rz-botao pequeno" onClick={() => { guardar(LABORATORIO_VAZIO, 'Laboratório apagado deste aparelho.'); setApagar(false); }}>Sim, apagar</button>
            <button type="button" className="rz-link min-h-[44px]" onClick={() => setApagar(false)}>Não</button>
          </span>
        )}
      </div>
      <p className="m-0 min-h-[18px] font-ui text-[12.5px] text-[var(--suave)]" aria-live="polite">{aviso}</p>
    </section>
  );
}

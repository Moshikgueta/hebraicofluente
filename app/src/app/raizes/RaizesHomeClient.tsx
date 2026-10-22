'use client';

/* A casa de Raízes Sefarditas, no formato da página inicial da coleção
 * editorial: abertura escura, o número do progresso em destaque, a jornada
 * como sumário de capítulos (fio entre as linhas, não cartões), e as portas
 * para a biblioteca, o laboratório e o certificado como notas com fio.
 * Os módulos em preparação aparecem na jornada sem fingir que existem. */

import Link from 'next/link';
import { Heroi } from '@/components/raizes/Heroi';
import { useProgress } from '@/lib/state/store';
import { useAccount } from '@/lib/account/store';
import {
  certificadoRaizes, conquistasObtidas, modulo, moduloAberto, progressoDoModulo, progressoGeral, raizes
} from '@/lib/raizes';

/** "a, b, c nem d", a partir dos itens do certificado (que terminam em ; ou .). */
function listaComNem(itens: string[]): string {
  const l = itens.map(s => s.replace(/[;.]\s*$/, ''));
  return l.length < 2 ? (l[0] ?? '') : `${l.slice(0, -1).join(', ')} nem ${l[l.length - 1]}`;
}

/** A publicação saiu sem o repositório privado do conteúdo (sem RAIZES_TOKEN). */
export function SemConteudo() {
  return (
    <div className="grid gap-3 pt-10">
      <p className="rz-rot ocre m-0">Raízes Sefarditas</p>
      <h1 className="rz-pagina">O conteúdo não está nesta publicação.</h1>
      <p className="rz-corpo">Seu acesso está em dia. O conteúdo deste percurso não foi incluído na última publicação do site; escreva para o suporte.</p>
    </div>
  );
}

export function RaizesHomeClient() {
  const p = useProgress();
  const revisor = !!useAccount().session?.account.revisor;
  const r = raizes();
  if (r.semConteudo) return <SemConteudo />;
  const e = p.state.raizes;
  const geral = progressoGeral(e);
  const ganhas = conquistasObtidas(e);
  const continuar = e?.onde?.rota ?? '/raizes/modulo/1';
  const comecou = !!e?.onde;
  const lugares = r.conteudo[0] ? Object.values(r.conteudo[0].atividades).flatMap(a => (a.tipo === 'mapa' ? a.lugares : [])) : [];

  return (
    <div className="grid gap-10">
      <Heroi kicker="História e memória" titulo={r.titulo} subtitulo={r.subtitulo} pontos={lugares}>
        <div className="flex flex-wrap gap-3 pt-3">
          <Link href={continuar} prefetch={false} className="rz-botao !bg-white !text-[#0B2A31]">
            {comecou ? 'Continuar de onde parei' : 'Começar pelo módulo 1'}
          </Link>
          <Link href="/raizes/biblioteca" prefetch={false} className="rz-botao claro !text-white !border-white/60 hover:!bg-white/10">
            Biblioteca de fontes
          </Link>
        </div>
        <p className="rz-credito m-0 pt-2">{r.edicao.rotulo} · contorno: Natural Earth, domínio público</p>
      </Heroi>

      <section aria-label="Seu progresso" className="grid grid-cols-[auto_1fr] items-center gap-4 border-y border-[var(--linha)] py-4"
        style={{ borderTopColor: 'var(--tinta)' }}>
        <span className="rz-numero text-[46px]">{geral.modulosFeitos}<span className="text-[24px] text-[var(--suave)]">/{geral.total}</span></span>
        <div className="grid gap-2">
          <span className="font-ui text-[14.5px] text-[var(--tinta)]">módulos concluídos</span>
          <div className="h-[3px] bg-[var(--linha)]" role="progressbar" aria-valuemin={0} aria-valuemax={100}
            aria-valuenow={geral.pct} aria-label="Progresso no percurso">
            <div className="h-full bg-[var(--teal)]" style={{ width: `${geral.pct}%` }} />
          </div>
        </div>
      </section>

      <aside className="rz-fundo grid gap-2">
        <p className="rz-rot m-0">Antes de começar</p>
        <p className="rz-entrada m-0">{r.aviso}</p>
        {!r.edicao.revisaoHumana && (
          <p className="m-0 font-ui text-[13.5px] leading-relaxed text-[var(--corpo)]">
            {r.edicao.rotulo}. As fontes foram consultadas por busca em {r.edicao.atualizadoEm.split('-').reverse().join('/')};
            a conferência de cada passagem no texto integral, por especialistas, ainda não aconteceu.
          </p>
        )}
      </aside>

      <section className="grid gap-3" aria-labelledby="jornada">
        <div className="rz-rubrica"><h2 id="jornada" className="rz-rot m-0">A jornada</h2><span className="rz-rot ml-auto tabular-nums">10 módulos</span></div>
        <p className="rz-corpo !text-[16px] !text-[var(--suave)]">{r.regras.desbloqueio}</p>
        {revisor && (
          <p className="m-0 font-ui text-[13.5px] leading-relaxed text-[var(--mar)]">
            Modo de revisão: como administrador, você vê todos os módulos abertos. Os alunos continuam abrindo um de cada vez.
          </p>
        )}
        <ol className="rz-lista">
          {r.modulos.map(rm => {
            const conteudo = modulo(rm.n);
            const aberto = moduloAberto(e, rm.n, revisor);
            const prog = conteudo ? progressoDoModulo(e, conteudo) : null;
            const estado = !conteudo ? 'em preparação' : prog?.concluido ? 'concluído' : aberto ? (prog && prog.feitas > 0 ? 'em andamento' : 'aberto') : 'abre depois do anterior';
            const corpo = (
              <>
                <span className="rz-numero text-[22px] pt-1">{String(rm.n).padStart(2, '0')}</span>
                <span className="grid gap-1 min-w-0">
                  <span className={`rz-serif text-[19px] leading-snug ${aberto ? 'text-[var(--tinta)]' : 'text-[var(--suave)]'}`}>{rm.titulo}</span>
                  <span className="font-ui text-[13px] text-[var(--suave)]">{rm.periodo} · {rm.regiao}</span>
                  {aberto && <span className="font-ui text-[14px] leading-relaxed text-[var(--corpo)]">{rm.resumo}</span>}
                </span>
                <span className={`font-ui text-[12.5px] text-right tabular-nums pt-1.5 ${prog?.concluido ? 'text-[var(--teal-ink)] font-semibold' : 'text-[var(--suave)]'}`}>
                  {prog?.concluido ? '✓' : prog && aberto ? `${prog.feitas}/${prog.total}` : ''}
                  <span className="block text-[11.5px] font-normal">{estado}</span>
                </span>
              </>
            );
            const grade = 'grid grid-cols-[44px_1fr_auto] gap-3 py-4 min-h-[64px]';
            return (
              <li key={rm.n}>
                {aberto
                  ? <Link href={`/raizes/modulo/${rm.n}`} prefetch={false} className={`${grade} -mx-2 px-2 rounded-[6px] transition-colors duration-150 hover:bg-[var(--pedra)]`}>{corpo}</Link>
                  : <div className={grade}>{corpo}</div>}
              </li>
            );
          })}
        </ol>
      </section>

      <section className="grid gap-3" aria-labelledby="conquistas">
        <div className="rz-rubrica"><h2 id="conquistas" className="rz-rot m-0">Conquistas</h2><span className="rz-rot ml-auto tabular-nums">{ganhas.size} de {r.conquistas.length}</span></div>
        <ul className="rz-lista">
          {r.conquistas.map(c => {
            const tem = ganhas.has(c.id);
            return (
              <li key={c.id} className="grid grid-cols-[28px_1fr] gap-2 py-3">
                <span aria-hidden className={`mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px]
                  ${tem ? 'bg-[var(--teal)] text-white' : 'border border-[var(--pedra-escura)]'}`}>{tem ? '✓' : ''}</span>
                <span className="grid gap-0.5">
                  <span className={`rz-serif text-[17px] ${tem ? 'text-[var(--tinta)]' : 'text-[var(--suave)]'}`}>{c.titulo}</span>
                  <span className="font-ui text-[13px] text-[var(--suave)]">{c.descricao}</span>
                </span>
              </li>
            );
          })}
        </ul>
        <p className="rz-italico m-0 text-[15px] text-[var(--suave)]">
          As conquistas falam do que você estudou, nunca de quem você é ou de onde vem a sua família.
        </p>
      </section>

      <section className="grid gap-8 sm:grid-cols-2">
        <div className="rz-nota mar grid content-start gap-2">
          <p className="rz-rot m-0">Biblioteca</p>
          <h2 className="rz-h3">Cada fonte, e o que ela sustenta</h2>
          <p className="m-0 font-ui text-[14.5px] leading-relaxed text-[var(--corpo)]">
            Nível, forma de acesso e data de consulta de cada referência.
          </p>
          <Link href="/raizes/biblioteca" prefetch={false} className="rz-link justify-self-start min-h-[44px] inline-flex items-center">Abrir a biblioteca</Link>
        </div>
        <div className="rz-nota teal grid content-start gap-2">
          <p className="rz-rot m-0">Módulo 9</p>
          <h2 className="rz-h3">Laboratório de Memórias Familiares</h2>
          <p className="m-0 font-ui text-[14.5px] leading-relaxed text-[var(--corpo)]">
            Fichas, diário e tipos de evidência, sem conclusão automática sobre ascendência, e com os dados só no seu aparelho.
          </p>
          {moduloAberto(e, 9, revisor) && (
            <Link href="/raizes/modulo/9?etapa=aplicar" prefetch={false} className="rz-link justify-self-start min-h-[44px] inline-flex items-center">Abrir o laboratório</Link>
          )}
        </div>
      </section>

      <section className="rz-nota grid gap-2">
        <p className="rz-rot m-0">{r.certificado.titulo}</p>
        <p className="rz-corpo">{r.certificado.nota}</p>
        <p className="m-0 font-ui text-[13.5px] leading-relaxed text-[var(--suave)]">
          Ele certifica só a conclusão das atividades. Não certifica {listaComNem(r.certificado.naoCertifica)}.
        </p>
        <Link href="/raizes/certificado" prefetch={false} className="rz-link justify-self-start min-h-[44px] inline-flex items-center">
          {certificadoRaizes(e).pronto ? 'Ver o seu certificado' : 'Como se obtém o certificado'}
        </Link>
      </section>
    </div>
  );
}

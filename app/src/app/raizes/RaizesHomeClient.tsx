'use client';

/* A casa de Raízes Sefarditas, no formato da página inicial da coleção
 * editorial: abertura escura, a estante dos dez objetos (o progresso que se
 * vê), os cinco mundos como cartões com uma imagem histórica (crédito sempre
 * junto), as portas da exploração com as gravuras, e o passaporte em
 * carimbos. Os módulos em preparação aparecem sem fingir que existem.
 * Movimento só na entrada de cada bloco, e nenhum com movimento reduzido. */

import Link from 'next/link';
import { useState } from 'react';
import { Heroi } from '@/components/raizes/Heroi';
import { useProgress } from '@/lib/state/store';
import { useAccount } from '@/lib/account/store';
import {
  certificadoRaizes, conquistasObtidas, modulo, moduloAberto, progressoDoModulo, progressoGeral, raizes, type FotoRaizes
} from '@/lib/raizes';
import { Recipiente, guardaveis, nomeDoRecipiente } from '@/components/raizes/Recipientes';
import { Gravura } from '@/components/raizes/ilustracoes/Gravuras';
import { INTERESSES, type EstadoRaizes, type Interesse } from '@/lib/state/raizes-estado';
import { MUNDOS, NOME_DO_INTERESSE, descobertasRecentes, progressoDoMundo, recomendar, rotuloDoTipo, selos } from '@/lib/raizes-jornada';

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

      <section aria-label="Seu progresso" className="grid gap-4">
        <div className="grid grid-cols-[auto_1fr] items-end gap-4">
          <span className="rz-numero text-[46px]">{geral.modulosFeitos}<span className="text-[24px] text-[var(--suave)]">/{geral.total}</span></span>
          <div className="grid gap-2 pb-1.5">
            <span className="font-ui text-[14.5px] text-[var(--tinta)]">módulos concluídos</span>
            <div className="h-[3px] bg-[var(--linha)]" role="progressbar" aria-valuemin={0} aria-valuemax={100}
              aria-valuenow={geral.pct} aria-label="Progresso no percurso">
              <div className="h-full bg-[var(--teal)]" style={{ width: `${geral.pct}%` }} />
            </div>
          </div>
        </div>
        <Estante e={e} revisor={revisor} />
      </section>

      <Interesses e={e} escolher={p.interessesRaizes} />

      <Continuar e={e} revisor={revisor} />

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
        <div className="grid gap-6">
          {MUNDOS.map(w => <CartaoDoMundo key={w.id} w={w} e={e} revisor={revisor} />)}
        </div>
      </section>

      <section className="grid gap-3" aria-labelledby="explorar">
        <div className="rz-rubrica"><h2 id="explorar" className="rz-rot m-0">Explorar livremente</h2></div>
        <ul className="m-0 grid grid-cols-2 gap-2.5 p-0 list-none sm:grid-cols-4">
          {EXPLORAR.map(x => (
            <li key={x.rota}>
              <Link href={x.rota} prefetch={false} className="rz-porta">
                <Gravura nome={x.gravura} className="h-[38px] w-[50px] text-[var(--ocre)]" />
                <span className="rz-serif text-[17px] text-[var(--titulo)]">{x.rotulo}</span>
                <span className="font-ui text-[12.5px] leading-snug text-[var(--suave)]">{x.dica}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <Carimbos e={e} />

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
          <p className="rz-rot m-0">Atlas</p>
          <h2 className="rz-h3">Lugares, tempo e os Caminhos do Exílio</h2>
          <p className="m-0 font-ui text-[14.5px] leading-relaxed text-[var(--corpo)]">
            O mapa por período, as rotas com o nível de evidência de cada uma, e a página de Lisboa.
          </p>
          <Link href="/raizes/atlas" prefetch={false} className="rz-link justify-self-start min-h-[44px] inline-flex items-center">Abrir o Atlas</Link>
        </div>
        <div className="rz-nota teal grid content-start gap-2">
          <p className="rz-rot m-0">Minha história</p>
          <h2 className="rz-h3">Minha História, Minhas Raízes</h2>
          <p className="m-0 font-ui text-[14.5px] leading-relaxed text-[var(--corpo)]">
            A árvore da família com o tipo de evidência de cada dado, o caminho dela no mapa e o registro das pesquisas. Só no seu aparelho.
          </p>
          <Link href="/raizes/familia" prefetch={false} className="rz-link justify-self-start min-h-[44px] inline-flex items-center">Abrir a árvore</Link>
        </div>
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

type LinhaRm = ReturnType<typeof raizes>['modulos'][number];

function LinhaDoModulo({ rm, e, revisor }: { rm: LinhaRm; e: EstadoRaizes | undefined; revisor: boolean }) {
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
    <li>
      {aberto
        ? <Link href={`/raizes/modulo/${rm.n}`} prefetch={false} className={`${grade} -mx-2 px-2 rounded-[6px] transition-colors duration-150 hover:bg-[var(--pedra)]`}>{corpo}</Link>
        : <div className={grade}>{corpo}</div>}
    </li>
  );
}

const EXPLORAR = [
  { rota: '/raizes/atlas', rotulo: 'Atlas', dica: 'Lugares e Caminhos do Exílio', gravura: 'mapa' },
  { rota: '/raizes/personagens', rotulo: 'Personagens', dica: 'Vidas com fonte', gravura: 'pena' },
  { rota: '/raizes/glossario', rotulo: 'Glossário', dica: 'As palavras desta história', gravura: 'livro' },
  { rota: '/raizes/biblioteca', rotulo: 'Biblioteca', dica: 'Cada fonte', gravura: 'documento' },
  { rota: '/raizes/busca', rotulo: 'Buscar', dica: 'Lugar, pessoa, termo', gravura: 'lupa' },
  { rota: '/raizes/colecao', rotulo: 'Coleção', dica: 'O que você guardou', gravura: 'chave' },
  { rota: '/raizes/passaporte', rotulo: 'Passaporte', dica: 'Selos do que explorou', gravura: 'carimbo' },
  { rota: '/raizes/familia', rotulo: 'Minha história', dica: 'Só no seu aparelho', gravura: 'arvore' }
];

/** A entrada personalizada: o que trouxe a pessoa até aqui. Opcional, muda
 * só a ordem das sugestões, e nunca tranca nada. Pular grava a lista vazia. */
function Interesses({ e, escolher }: { e: EstadoRaizes | undefined; escolher: (i: Interesse[]) => void }) {
  const salvo = e?.perfil;
  const [editando, setEditando] = useState(false);
  const [marcados, setMarcados] = useState<Interesse[]>(salvo?.interesses ?? []);
  if (salvo && !editando) {
    return (
      <p className="m-0 font-ui text-[13.5px] leading-relaxed text-[var(--suave)]">
        {salvo.interesses.length ? <>Seus interesses: {salvo.interesses.map(i => NOME_DO_INTERESSE[i].toLowerCase()).join('; ')}. </> : null}
        <button type="button" className="rz-link !text-[13.5px] min-h-[36px]" onClick={() => { setMarcados(salvo.interesses); setEditando(true); }}>
          {salvo.interesses.length ? 'Mudar meus interesses' : 'Escolher interesses'}
        </button>
      </p>
    );
  }
  const alternar = (i: Interesse) => setMarcados(m => (m.includes(i) ? m.filter(x => x !== i) : [...m, i]));
  return (
    <section className="rz-nota teal grid gap-3" aria-labelledby="interesses">
      <p className="rz-rot m-0">Antes de entrar no arquivo</p>
      <h2 id="interesses" className="rz-h3">O que trouxe você até aqui?</h2>
      <p className="m-0 font-ui text-[14px] leading-relaxed text-[var(--corpo)]">
        Escolha um ou mais. Isso só muda o que sugerimos primeiro: a jornada inteira continua aberta do mesmo jeito.
      </p>
      <div role="group" aria-label="Interesses" className="flex flex-wrap gap-2">
        {INTERESSES.map(i => (
          <button key={i} type="button" aria-pressed={marcados.includes(i)} onClick={() => alternar(i)} className="rz-chip text-left !h-auto py-2">
            {NOME_DO_INTERESSE[i]}
          </button>
        ))}
      </div>
      <p className="m-0 flex flex-wrap items-center gap-3">
        <button type="button" className="rz-botao" disabled={!marcados.length} onClick={() => { escolher(marcados); setEditando(false); }}>Guardar</button>
        <button type="button" className="rz-link min-h-[44px]" onClick={() => { escolher(salvo && editando ? salvo.interesses : []); setEditando(false); }}>
          {salvo && editando ? 'Cancelar' : 'Pular por agora'}
        </button>
      </p>
    </section>
  );
}

/** "Continue de onde parou": as últimas descobertas e o que sugerimos, sempre com o porquê. */
function Continuar({ e, revisor }: { e: EstadoRaizes | undefined; revisor: boolean }) {
  const recs = recomendar(e, revisor);
  const recentes = descobertasRecentes(e, 3);
  if (!recs.length && !recentes.length) return null;
  return (
    <section className="grid gap-3" aria-labelledby="sugestoes">
      <div className="rz-rubrica"><h2 id="sugestoes" className="rz-rot m-0">Continue sua jornada</h2></div>
      <ul className="rz-lista">
        {recs.map(x => (
          <li key={x.rota}>
            <Link href={x.rota} prefetch={false} className="grid gap-0.5 py-3 no-underline">
              <span className="rz-serif text-[18px] leading-snug text-[var(--titulo)]">{x.titulo}</span>
              <span className="font-ui text-[13px] text-[var(--suave)]">{x.porque}</span>
            </Link>
          </li>
        ))}
      </ul>
      {recentes.length > 0 && (
        <p className="m-0 font-ui text-[13.5px] leading-relaxed text-[var(--corpo)]">
          Você descobriu por último:{' '}
          {recentes.map(({ item }, i) => (
            <span key={item.chave}>{i > 0 ? ' · ' : ''}<Link href={item.rota} prefetch={false} className="rz-link !text-[13.5px]">{item.titulo}</Link> <span className="text-[var(--suave)]">({rotuloDoTipo(item.tipo).toLowerCase()})</span></span>
          ))}
        </p>
      )}
    </section>
  );
}

/* ── a estante dos dez objetos ───────────────────────────────────────── */

/** Os objetos dos módulos, enchendo com o que o aluno guardou. Abre o módulo, se ele estiver aberto. */
function Estante({ e, revisor }: { e: EstadoRaizes | undefined; revisor: boolean }) {
  const r = raizes();
  const desc = e?.descobertas ?? {};
  return (
    <ol className="rz-estante" aria-label="Os objetos de cada módulo">
      {r.modulos.map((rm, i) => {
        const m = modulo(rm.n);
        const g = m ? guardaveis(m) : [];
        const dentro = g.filter(x => desc[x.chave]).length;
        const aberto = !!m && moduloAberto(e, rm.n, revisor);
        const feito = !!m && progressoDoModulo(e, m).concluido;
        const corpo = (
          <>
            <Recipiente n={rm.n} quantos={dentro} className="h-[44px] w-[52px]" />
            <span className="rz-estante-n tabular-nums">{feito ? '✓' : String(rm.n).padStart(2, '0')}</span>
          </>
        );
        const rotulo = `Módulo ${rm.n}, ${nomeDoRecipiente(rm.n)}: ${dentro} de ${g.length} guardados${feito ? ', concluído' : ''}`;
        return (
          <li key={rm.n} style={{ ['--i' as string]: i }} className={`${aberto ? '' : 'fechado'} ${feito ? 'feito' : ''}`}>
            {aberto
              ? <Link href={`/raizes/modulo/${rm.n}`} prefetch={false} aria-label={rotulo}>{corpo}</Link>
              : <span role="img" aria-label={`${rotulo}. Abre depois do anterior.`}>{corpo}</span>}
          </li>
        );
      })}
    </ol>
  );
}

/* ── os cinco mundos, em cartões com imagem ──────────────────────────── */

/** A imagem de cada mundo (raizes/data/fotos.json); sem ela, o cartão usa o objeto do primeiro módulo. */
const FOTO_DO_MUNDO: Record<string, string> = {
  sefarad: 'santa-maria-blanca', ruptura: 'decreto-1492', diaspora: 'esnoga-interior', brasil: 'recife-mapa', 'minha-historia': 'torre-do-tombo'
};

function CreditoCurto({ f }: { f: FotoRaizes }) {
  const licenca = f.licenca === 'Public domain' ? 'Domínio público' : f.licenca;
  return (
    <p className="m-0 px-4 pt-2 font-ui text-[11px] leading-snug text-[var(--suave)] [overflow-wrap:anywhere]">
      Imagem: {f.autor}{f.data ? `, ${f.data}` : ''} · {f.licencaUrl ? <a href={f.licencaUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">{licenca}</a> : licenca} · <a href={f.pagina} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">Commons</a>
    </p>
  );
}

function CartaoDoMundo({ w, e, revisor }: { w: (typeof MUNDOS)[number]; e: EstadoRaizes | undefined; revisor: boolean }) {
  const r = raizes();
  const pw = progressoDoMundo(e, w);
  const foto = (r.fotos ?? []).find(f => f.id === FOTO_DO_MUNDO[w.id]);
  const pct = pw.total ? Math.round((pw.feitos / pw.total) * 100) : 0;
  return (
    <section className="rz-mundo" aria-labelledby={`mundo-${w.id}`}>
      <div className="rz-mundo-capa">
        {foto
          ? /* eslint-disable-next-line @next/next/no-img-element */
            <img src={`/raizes/fotos/${foto.arquivo}`} alt={foto.mostra} width={foto.largura} height={foto.altura} loading="lazy" decoding="async" />
          : <div className="rz-mundo-sem-foto"><Recipiente n={w.modulos[0]!} quantos={0} className="h-[90px] w-[108px]" /></div>}
        <div className="rz-mundo-titulo">
          <p className="rz-rot m-0 !text-[#8FD6C8]">Mundo {w.n} · {pw.feitos} de {pw.total}{pw.concluido ? ' · concluído' : ''}</p>
          <h3 id={`mundo-${w.id}`} className="rz-serif m-0 text-[24px] font-[420] leading-tight text-white [text-wrap:balance]">{w.titulo}</h3>
        </div>
      </div>
      {foto && <CreditoCurto f={foto} />}
      <div className="grid gap-2 px-4 pb-4 pt-2">
        <div className="h-[3px] rounded-full bg-[var(--linha)]" aria-hidden><div className="h-full rounded-full bg-[var(--lacre)]" style={{ width: `${pct}%` }} /></div>
        <p className="m-0 font-ui text-[14px] leading-relaxed text-[var(--corpo)]">{w.subtitulo}</p>
        <ol className="rz-lista">
          {r.modulos.filter(rm => w.modulos.includes(rm.n)).map(rm => <LinhaDoModulo key={rm.n} rm={rm} e={e} revisor={revisor} />)}
        </ol>
        {w.portas.length > 0 && (
          <p className="m-0 flex flex-wrap gap-2">
            {w.portas.map(pt => <Link key={pt.rota} href={pt.rota} prefetch={false} className="rz-chip inline-flex items-center">{pt.rotulo} →</Link>)}
          </p>
        )}
      </div>
    </section>
  );
}

/* ── o passaporte em carimbos ────────────────────────────────────────── */

function Carimbos({ e }: { e: EstadoRaizes | undefined }) {
  const lista = selos(e);
  const ganhos = lista.filter(x => x.tem).length;
  return (
    <section className="grid gap-3" aria-labelledby="carimbos">
      <div className="rz-rubrica"><h2 id="carimbos" className="rz-rot m-0">Passaporte</h2><span className="rz-rot ml-auto tabular-nums">{ganhos} de {lista.length} selos</span></div>
      <Link href="/raizes/passaporte" prefetch={false} className="rz-carimbos" aria-label={`Abrir o passaporte: ${ganhos} de ${lista.length} selos`}>
        {lista.map((x, i) => (
          <span key={x.id} className={`rz-carimbo-mini ${x.tem ? 'tem' : ''}`} style={{ ['--i' as string]: i, ['--giro' as string]: `${((i * 37) % 17) - 8}deg` }} title={x.titulo}>
            <span aria-hidden>{x.tem ? '✓' : ''}</span>
            <span className="rz-carimbo-nome">{x.titulo.replace(/^Mundo \d: /, '')}</span>
          </span>
        ))}
      </Link>
      <p className="m-0 font-ui text-[13px] text-[var(--suave)]">Selos do que você estudou e explorou. Não dizem nada sobre a origem da sua família.</p>
    </section>
  );
}

'use client';

/* O certificado de Raízes Sefarditas: só com os dez módulos concluídos
 * (`certificadoRaizes`), e sempre com o que ele NÃO certifica no próprio
 * documento. Sai em HTML, para imprimir ou salvar em PDF pelo navegador; o
 * nome é editável e fica só neste aparelho. Nada vai ao servidor. */

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useProgress } from '@/lib/state/store';
import { useAccount } from '@/lib/account/store';
import { certificadoRaizes, raizes } from '@/lib/raizes';
import { SemConteudo } from '@/app/raizes/RaizesHomeClient';

const CHAVE_NOME = 'hf-raizes-certificado-nome';

export function CertificadoRaizesClient() {
  const p = useProgress();
  const account = useAccount();
  const r = raizes();
  const [nome, setNome] = useState('');

  useEffect(() => {
    let guardado = '';
    try { guardado = localStorage.getItem(CHAVE_NOME) ?? ''; } catch { /* sem armazenamento */ }
    setNome(guardado || account.session?.account.name || '');
  }, [account.session?.account.name]);

  if (r.semConteudo) return <SemConteudo />;
  const c = certificadoRaizes(p.state.raizes);
  const cert = r.certificado;

  if (!c.pronto) {
    return (
      <div className="grid gap-5 pt-8">
        <p className="rz-rot ocre m-0">Raízes Sefarditas</p>
        <h1 className="rz-pagina">{cert.titulo}</h1>
        <p className="rz-entrada m-0">
          {c.faltam === 1 ? 'Falta 1 módulo' : `Faltam ${c.faltam} módulos`} para o certificado. Ele é emitido quando os dez estão concluídos.
        </p>
        <p className="rz-corpo">{cert.nota}</p>
        <Link href="/raizes" prefetch={false} className="rz-botao justify-self-start">Voltar à jornada</Link>
      </div>
    );
  }

  const data = c.concluidoEm ? new Date(c.concluidoEm).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
  const guardar = (v: string) => {
    setNome(v);
    try { localStorage.setItem(CHAVE_NOME, v.slice(0, 120)); } catch { /* idem */ }
  };

  return (
    <div className="grid gap-6 pt-8">
      <div className="rz-sem-impressao grid gap-3">
        <p className="rz-rot ocre m-0">Raízes Sefarditas</p>
        <h1 className="rz-pagina">Seu certificado</h1>
        <label className="grid gap-1 font-ui text-[13px] font-semibold text-[var(--tinta)]">
          Nome que aparece no certificado
          <input value={nome} maxLength={120} onChange={e => guardar(e.target.value)} className="rz-campo font-normal" />
        </label>
        <button type="button" className="rz-botao justify-self-start" onClick={() => window.print()} disabled={!nome.trim()}>
          Imprimir ou salvar em PDF
        </button>
      </div>

      <article className="rz-certificado grid gap-4" aria-label={cert.titulo}>
        <p className="rz-rot ocre m-0">{cert.titulo}</p>
        <h2 className="rz-pagina !text-[clamp(30px,7vw,44px)]">{cert.curso}</h2>
        <p className="rz-italico m-0 text-[18px] text-[var(--suave)]">{cert.subtitulo}</p>
        <p className="rz-serif m-0 text-[26px] font-[480] text-[var(--titulo)] border-b border-[var(--linha)] pb-2">{nome.trim() || ' '}</p>
        <p className="rz-corpo m-0">{cert.texto}</p>
        {data && <p className="m-0 font-ui text-[14.5px] text-[var(--corpo)]">Concluído em {data}.</p>}
        <div className="grid gap-1 border-t border-[var(--linha)] pt-3">
          <p className="m-0 font-ui text-[13.5px] font-semibold text-[var(--tinta)]">Este certificado não certifica:</p>
          <ul className="m-0 pl-5 font-ui text-[13.5px] leading-relaxed text-[var(--corpo)]">
            {cert.naoCertifica.map(t => <li key={t}>{t}</li>)}
          </ul>
          <p className="m-0 pt-1 font-ui text-[13px] leading-relaxed text-[var(--suave)]">{cert.nota}</p>
        </div>
        <p className="rz-rot m-0">Hebraico Fluente · {r.edicao.rotulo}</p>
      </article>
    </div>
  );
}

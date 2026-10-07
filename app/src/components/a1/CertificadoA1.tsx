'use client';

/* O certificado do A1, desenhado em HTML e CSS (06/10/2026).
 * ─────────────────────────────────────────────────────────────────────────
 * Não é um PNG feito no navegador a partir do progresso, como o do alfabeto:
 * os dados vêm do servidor, que só os tem se a prova foi aprovada lá. Em HTML
 * ele fica legível por leitor de tela, imprime em A4 deitado ("salvar em
 * PDF" do próprio navegador) e se adapta ao celular.
 *
 * O texto é o aprovado pelo dono, com o aviso de que não é certificação
 * oficial de nível. Carga horária não aparece: só com um número medido
 * (decisão C5 do A1-COURSE-AUDIT.md). */

import { cursoA1 } from '@/lib/a1';
import { urlDeVerificacao, type CertificadoA1 } from '@/lib/a1-exame';

const dataLonga = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/Sao_Paulo' });

export function CertificadoA1Folha({ c, demo = false }: { c: CertificadoA1; demo?: boolean }) {
  const t = cursoA1().certificado;
  const linha = t.linhaPt.split('{nome}');
  return (
    <article className="certificado-a1 relative rounded-[var(--r-lg)] border-2 border-[var(--accent)] bg-surface
      px-6 py-8 sm:px-12 sm:py-12 grid gap-5 text-center shadow-sm print:shadow-none"
      aria-label={`Certificado de ${c.nome}`}>
      <div aria-hidden className="absolute inset-2 rounded-[calc(var(--r-lg)-4px)] border border-[var(--accent-soft)] pointer-events-none" />
      <p className="font-ui text-[12px] uppercase tracking-[.2em] text-ink-muted m-0">Hebraico Fluente</p>
      <p dir="rtl" lang="he" className="he text-[30px] sm:text-[36px] text-[var(--accent)] m-0 leading-none">עִבְרִית</p>
      <h2 className="font-display text-[24px] sm:text-[30px] font-bold text-ink m-0 leading-tight">{t.tituloPt}</h2>
      <p className="text-[17px] sm:text-[19px] leading-relaxed text-ink-body m-0 max-w-[38ch] justify-self-center">
        {linha[0]}<strong className="font-display text-[22px] sm:text-[26px] text-ink block my-2">{c.nome}</strong>{linha[1]}
      </p>
      <p className="font-ui text-[14.5px] text-ink-body m-0">Aprovado em {dataLonga(c.aprovadoEm)}</p>
      <div className="grid gap-1 justify-items-center">
        <p className="font-ui text-[13px] text-ink-muted m-0">
          Código <span className="font-semibold text-ink tracking-[.08em]">{c.id}</span>
        </p>
        <p className="font-ui text-[12px] text-ink-muted m-0 break-all">Confira em {urlDeVerificacao(c.id)}</p>
      </div>
      <p className="font-ui text-[12.5px] text-ink-muted m-0 max-w-[50ch] justify-self-center">{t.avisoPt}</p>
      {demo && <p className="font-ui text-[12px] font-semibold text-[var(--amber)] m-0">DEMONSTRAÇÃO: este certificado não vale.</p>}
    </article>
  );
}

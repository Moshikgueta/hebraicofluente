'use client';

/* O certificado do A1: só existe se o servidor tem uma prova aprovada.
 *   · sem aprovação: o caminho para o exame;
 *   · aprovado e sem certificado: o aluno CONFIRMA o nome (que não muda
 *     depois, porque o código público aponta para ele) e escolhe se a
 *     verificação pública fica ligada;
 *   · com certificado: a folha, o link de verificação, imprimir/PDF, e a
 *     chave da verificação pública. */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Badge, Card } from '@/components/ui/Card';
import { Button, LinkButton } from '@/components/ui/Button';
import { CertificadoA1Folha } from '@/components/a1/CertificadoA1';
import { useAccount } from '@/lib/account/store';
import {
  emitirCertificado, falhou, situacaoDoCertificado, trocarPublico, urlDeVerificacao, type SituacaoCertificado
} from '@/lib/a1-exame';

export function CertificadoA1Client() {
  const conta = useAccount();
  const [s, setS] = useState<SituacaoCertificado | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [nome, setNome] = useState('');
  const [publico, setPublico] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    let vivo = true;
    void situacaoDoCertificado(conta.session?.account.name ?? '').then(r => {
      if (!vivo) return;
      if (falhou(r)) { setErro('Não consegui carregar o certificado agora. Tente de novo em instantes.'); return; }
      setS(r);
      setNome(r.nomeSugerido);
    });
    return () => { vivo = false; };
  }, [conta.session?.account.name]);

  const emitir = async () => {
    setEnviando(true); setErro(null);
    const r = await emitirCertificado(nome.trim(), publico);
    setEnviando(false);
    if (falhou(r)) {
      setErro(r.erro === 'nome-invalido'
        ? 'Use só letras, espaços, hífen, ponto e apóstrofo, de 3 a 80 caracteres.'
        : 'Não deu para emitir agora. Tente de novo.');
      return;
    }
    setS(x => x && { ...x, certificado: r.certificado });
  };

  const alternarPublico = async () => {
    if (!s?.certificado) return;
    const novo = !s.certificado.publico;
    const r = await trocarPublico(novo);
    if (!falhou(r)) setS({ ...s, certificado: { ...s.certificado, publico: novo } });
  };

  const voltar = (
    <Link href="/a1" className="inline-flex items-center min-h-[44px] pr-3 font-ui text-[13px] text-ink-muted hover:text-ink-body print:hidden">
      ← Hebraico A1
    </Link>
  );

  if (!s) {
    return <div className="reading grid gap-4">{voltar}<p className="font-ui text-[15px] text-ink-body" role="status">{erro ?? 'Carregando…'}</p></div>;
  }

  if (!s.aprovado) {
    return (
      <div className="reading grid gap-5">
        {voltar}
        <h1 className="text-[27px] font-bold m-0">Certificado do A1</h1>
        <p className="text-[16px] leading-relaxed text-ink-body m-0">
          O certificado é liberado quando você passa no exame final, com 70% ou mais. A correção é feita no servidor.
        </p>
        <LinkButton href="/a1/exame" className="justify-self-start">Ir para o exame</LinkButton>
      </div>
    );
  }

  if (!s.certificado) {
    return (
      <div className="reading grid gap-5">
        {voltar}
        <Badge tone="mint">Aprovado no exame final</Badge>
        <h1 className="text-[27px] font-bold m-0">Seu certificado</h1>
        <Card className="p-5 grid gap-4">
          <label className="grid gap-1.5 font-ui text-[14px] text-ink">
            O seu nome, como vai aparecer no certificado
            <input value={nome} onChange={e => setNome(e.target.value)} maxLength={80} autoComplete="name"
              className="min-h-[48px] rounded-[var(--r-md)] border-2 border-line bg-surface px-3 text-[17px]" />
          </label>
          <p className="font-ui text-[13.5px] text-ink-muted m-0">Confira com cuidado: depois de emitido, o nome não muda.</p>
          <label className="flex items-start gap-3 min-h-[44px] cursor-pointer">
            <input type="checkbox" checked={publico} onChange={e => setPublico(e.target.checked)} className="mt-1 w-5 h-5 shrink-0" />
            <span className="font-ui text-[14.5px] text-ink-body">
              Permitir que quem tiver o código confira o certificado na página pública de verificação (mostra o nome, o curso e a data). Dá para desligar depois.
            </span>
          </label>
          {erro && <p role="alert" className="font-ui text-[14px] text-[var(--amber)] m-0">{erro}</p>}
          <Button onClick={emitir} disabled={enviando || nome.trim().length < 3} className="justify-self-start">
            {enviando ? 'Emitindo…' : 'Emitir o certificado'}
          </Button>
        </Card>
      </div>
    );
  }

  const c = s.certificado;
  const url = urlDeVerificacao(c.id);
  return (
    <div className="grid gap-5 max-w-[860px] mx-auto">
      {voltar}
      <CertificadoA1Folha c={c} demo={conta.demo} />
      <div className="flex flex-wrap gap-2 print:hidden">
        <Button onClick={() => window.print()}>Imprimir ou salvar em PDF</Button>
        <Button variant="secondary" onClick={() => {
          void navigator.clipboard?.writeText(url).then(() => { setCopiado(true); setTimeout(() => setCopiado(false), 2500); }, () => {});
        }}>
          {copiado ? 'Link copiado' : 'Copiar o link de verificação'}
        </Button>
        <LinkButton href="/a1/concluido" variant="ghost">O seu A1 em números</LinkButton>
      </div>
      <label className="flex items-start gap-3 min-h-[44px] cursor-pointer print:hidden">
        <input type="checkbox" checked={c.publico} onChange={alternarPublico} className="mt-1 w-5 h-5 shrink-0" />
        <span className="font-ui text-[14.5px] text-ink-body">
          Verificação pública ligada: quem tiver o código {c.id} vê o nome, o curso e a data.
        </span>
      </label>
    </div>
  );
}

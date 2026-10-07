'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { falhou, verificarCertificado, type CertificadoA1 } from '@/lib/a1-exame';

const dataLonga = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/Sao_Paulo' });

export function VerificarClient() {
  const [codigo, setCodigo] = useState('');
  const [res, setRes] = useState<CertificadoA1 | 'nao' | 'erro' | null>(null);
  const [buscando, setBuscando] = useState(false);

  const conferir = async (id: string) => {
    const limpo = id.trim().toUpperCase();
    if (!limpo) return;
    setBuscando(true);
    const r = await verificarCertificado(limpo);
    setBuscando(false);
    setRes(falhou(r) ? (r.erro === 'not-found' ? 'nao' : 'erro') : r);
  };

  useEffect(() => {
    const id = new URLSearchParams(location.search).get('id');
    if (id) { setCodigo(id); void conferir(id); }
  }, []);

  return (
    <div className="reading grid gap-5 py-6">
      <h1 className="text-[27px] sm:text-[32px] font-bold leading-tight m-0">Conferir um certificado</h1>
      <p className="text-[16px] leading-relaxed text-ink-body m-0">
        Digite o código que aparece no certificado (por exemplo, A1-ABCD2345).
      </p>
      <form className="flex flex-wrap gap-2" onSubmit={e => { e.preventDefault(); void conferir(codigo); }}>
        <label className="sr-only" htmlFor="codigo">Código do certificado</label>
        <input id="codigo" value={codigo} onChange={e => setCodigo(e.target.value)} autoCapitalize="characters"
          className="flex-1 min-w-[200px] min-h-[48px] rounded-[var(--r-md)] border-2 border-line bg-surface px-3 text-[17px] tracking-[.06em]" />
        <Button type="submit" disabled={buscando || !codigo.trim()}>{buscando ? 'Conferindo…' : 'Conferir'}</Button>
      </form>
      <div aria-live="polite">
        {res && res !== 'nao' && res !== 'erro' && (
          <Card tone="mint" className="p-5 grid gap-1">
            <p className="font-ui text-[13px] font-semibold uppercase tracking-[.07em] text-ink m-0">✓ Certificado válido</p>
            <p className="font-display text-[22px] font-semibold text-ink m-0">{res.nome}</p>
            <p className="text-[15.5px] text-ink-body m-0">
              Concluiu o curso {res.curso} do Hebraico Fluente, com aprovação no exame final em {dataLonga(res.aprovadoEm)}.
            </p>
            <p className="font-ui text-[13px] text-ink-muted m-0">Código {res.id}. Não é uma certificação oficial de nível.</p>
          </Card>
        )}
        {res === 'nao' && (
          <Card tone="ember" className="p-5">
            <p className="text-[15.5px] text-ink-body m-0">
              Não achamos um certificado público com este código. Confira o código, ou peça à pessoa para ligar a verificação pública.
            </p>
          </Card>
        )}
        {res === 'erro' && <p className="font-ui text-[14px] text-[var(--amber)] m-0">Não deu para conferir agora. Tente de novo em instantes.</p>}
      </div>
    </div>
  );
}

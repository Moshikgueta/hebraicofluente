import { message } from '@/lib/panel';
import { Notice } from '../ui';

// Resultado da ultima acao (?ok= / ?erro=), mostrado no topo da pagina.
export function Flash({ ok, erro, detail }: { ok?: string; erro?: string; detail?: string }) {
  if (erro)
    return (
      <Notice tone={erro === 'demo' ? 'ochre' : 'danger'} className="mb-6">
        {message(erro)}
        {detail && <span className="mt-1 block">{detail}</span>}
      </Notice>
    );
  if (ok)
    return (
      <Notice tone="success" className="mb-6">
        {message(ok)}
      </Notice>
    );
  return null;
}

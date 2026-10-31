/** O e-mail da marca d'água das aulas: só o começo e o domínio
 *  (components/shell/MarcaDagua.tsx). */
export function mascararEmail(email: string): string {
  const [local = '', dominio = ''] = email.split('@');
  return `${local.slice(0, 2)}•••@${dominio}`;
}

// Infraestrutura das acoes do painel (agencia e plataforma).
//
// Todo formulario do painel e um <form action={...}> comum: funciona sem
// JavaScript, e a acao termina num redirecionamento com ?ok= ou ?erro=, que a
// pagina mostra. A permissao e conferida aqui, no servidor, antes de abrir a
// transacao: o formulario desabilitado na tela e so cortesia.

import { redirect } from 'next/navigation';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { requireAgency, requirePlatform } from './auth/next';
import { roleAtLeast, type Role, type StaffContext } from './auth/sessions';
import { dbErrorCode, withScope, type Tx } from './db/tenant';
import type { Actor } from './domain/agency';
import { DomainError } from './domain/publication';

export function withQuery(path: string, params: Record<string, string>): string {
  const [base, query] = path.split('?');
  const q = new URLSearchParams(query);
  q.delete('ok');
  q.delete('erro');
  for (const [k, v] of Object.entries(params)) q.set(k, v);
  const s = q.toString();
  return s ? `${base}?${s}` : (base ?? '/');
}

function errorCode(e: unknown): string {
  if (e instanceof DomainError) return e.code;
  return dbErrorCode(e) ?? 'erro';
}

export async function runAgency(
  min: Role,
  back: string,
  fn: (tx: Tx, actor: Actor, staff: StaffContext) => Promise<string | void>,
): Promise<never> {
  const staff = await requireAgency('viewer');
  if (!roleAtLeast(staff.role, min)) redirect(withQuery(back, { erro: staff.agencyIsDemo ? 'demo' : 'permissao' }));
  let ok: string | void;
  try {
    ok = await withScope({ kind: 'agency', agencyId: staff.agencyId, userId: staff.userId }, (tx) => fn(tx, { userId: staff.userId, agencyId: staff.agencyId }, staff));
  } catch (e) {
    if (isRedirectError(e)) throw e;
    console.error('[painel]', e);
    redirect(withQuery(back, { erro: errorCode(e) }));
  }
  redirect(ok && ok.startsWith('/') ? ok : withQuery(back, { ok: ok || 'salvo' }));
}

export async function runPlatform(back: string, fn: (tx: Tx, staff: StaffContext) => Promise<string | void>): Promise<never> {
  const staff = await requirePlatform();
  let ok: string | void;
  try {
    ok = await withScope({ kind: 'platform', userId: staff.userId }, (tx) => fn(tx, staff));
  } catch (e) {
    if (isRedirectError(e)) throw e;
    console.error('[admin]', e);
    redirect(withQuery(back, { erro: errorCode(e) }));
  }
  redirect(ok && ok.startsWith('/') ? ok : withQuery(back, { ok: ok || 'salvo' }));
}

export const MESSAGES: Record<string, string> = {
  salvo: 'Alterações salvas.',
  publicado: 'Caravana publicada. Os viajantes já veem esta versão.',
  despublicado: 'Caravana despublicada. Os convites continuam valendo, mas a experiência fica indisponível.',
  arquivado: 'Caravana arquivada.',
  convites: 'Convites criados.',
  revogado: 'Convite revogado. Os aparelhos conectados com ele saíram.',
  aparelhos: 'Aparelhos liberados. O viajante pode entrar de novo pelo mesmo link.',
  criado: 'Criado.',
  demo: 'Modo demonstração: o painel é somente leitura e nada foi salvo.',
  permissao: 'Seu papel nesta agência não permite essa ação.',
  forbidden: 'Ação não permitida.',
  erro: 'Algo deu errado. Nada foi salvo. Tente de novo.',
  invalido: 'Confira os campos destacados.',
  dates: 'A data de fim precisa ser igual ou posterior à de início.',
  too_long: 'O período máximo de uma caravana é de 60 dias.',
  day_limit: 'O roteiro já tem um dia para cada dia da viagem. Aumente as datas para incluir outro.',
  stop_limit: 'Cada dia aceita até 12 paradas.',
  seat_limit: 'Limite de vagas do contrato atingido. Revogue convites não usados ou fale com a Minha Caravana Digital para ampliar.',
  caravan_limit: 'O contrato da agência já tem o número máximo de caravanas ativas. Arquive uma caravana encerrada.',
  contract_fields: 'Plano e vagas fazem parte do contrato e só podem ser alterados pela plataforma.',
  publication_blocked: 'Ainda há pendências que impedem a publicação.',
  caravan_not_found: 'Caravana não encontrada.',
  not_found: 'Item não encontrado.',
  archived: 'A caravana está arquivada.',
  invite_count: 'Crie entre 1 e 100 convites por vez.',
  info_limit: 'Limite de itens atingido.',
  agency_inactive: 'A agência está suspensa.',
  slug: 'Esse endereço já está em uso.',
  confirmar: 'Marque a confirmação antes de publicar.',
  formato: 'O texto das seções não está no formato esperado: cada parágrafo começa com [fato], [tradição], [interpretação] ou [dica], dentro de uma seção (## Título).',
  revisor: 'Para aprovar, informe o nome de quem revisou.',
};

export function message(code: string | undefined): string | null {
  if (!code) return null;
  return MESSAGES[code] ?? MESSAGES.erro!;
}

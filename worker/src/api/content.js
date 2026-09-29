/* O conteúdo do curso, para quem pagou.
 * ─────────────────────────────────────────────────────────────────────────
 * Esta rota é a metade que faltava do controle de acesso, e a auditoria de
 * 20/09/2026 nomeou a outra: o portão já recusava as ROTAS pagas sem cookie,
 * mas o material de ensino viajava dentro do JavaScript que a home carregava.
 * Quem abrisse a aba de rede baixava as 22 letras, as sílabas, as palavras e
 * as cartas de cultura sem conta e sem pagar - um `curl`, sem nenhuma manha.
 *
 * Agora o material sai daqui, e só sai para quem tem as duas coisas: sessão
 * válida E direito de acesso ao curso no banco. As duas são conferidas do
 * lado do servidor, a cada pedido - não é o navegador que decide.
 *
 * ── três decisões ────────────────────────────────────────────────────────
 *
 * 1. O JSON vem do PACOTE do Worker, não do banco. É conteúdo gerado na
 *    build, igual para todo aluno, e que muda quando o curso muda - buscar
 *    no D1 seria uma consulta por aluno para devolver sempre a mesma coisa.
 *
 * 2. `private, no-store`. Um cache compartilhado no caminho que guardasse
 *    esta resposta a entregaria a quem não pagou, e desfaria a rota inteira.
 *
 * 3. Sem freio por tentativa. Quem chega aqui já provou que pagou; o custo é
 *    uma resposta grande, não uma porta aberta. O freio que importa nesta
 *    rota é o do próprio navegador, que busca uma vez por sessão.
 */

import { notSignedIn, fail } from '../lib/http.js';
import { requireAccount } from './auth.js';
import { hasEntitlement } from '../lib/db.js';
import { marcaDaConta, invisivel } from '../lib/marca.js';

/* O mesmo curso que o portão protege (worker/src/gate.js). Quando o A1 tiver
   rotas próprias, os dois viram um mapa de prefixo → curso, juntos. */
const COURSE = 'alfabetizacao';

import letters from '../../../app/content/letters.json';
import nikud from '../../../app/content/nikud.json';
import extras from '../../../app/content/extras.json';
import realWorld from '../../../app/content/real-world.json';
import sentences from '../../../app/content/sentences.json';
import eras from '../../../app/content/eras.json';
import strokes from '../../../app/content/stroke-paths.json';
import culture from '../../../app/content/culture.json';
import missoes from '../../../app/content/missoes.json';
import textos from '../../../app/content/textos.json';
import bonus from '../../../app/content/bonus.json';

/* Montado uma vez, no carregamento do módulo: é o mesmo objeto para todo
   aluno, e remontá-lo por requisição seria trabalho por pedido para produzir
   sempre o mesmo resultado. A forma é a que `hidratarConteudo` espera
   (app/src/lib/content.ts) - um contrato só, dos dois lados. */
/* Onde a marca de cada conta entra (lib/marca.js): no FIM do "Você sabia?"
   de cada letra e de cada parágrafo das cartas de cultura - texto em
   português que o aluno só lê. O molde é montado uma vez; por pedido, só a
   troca do marcador (um caractere de uso privado, que não existe em texto
   nenhum do curso) pela marca invisível daquela conta. */
const MARCADOR = '\uE000', MARCADOR_VISIVEL = '\uE001';
const marcar = s => (typeof s === 'string' && s ? s + MARCADOR : s);

const MOLDE = JSON.stringify({
  _licenca: `Conteúdo do curso Hebraico Fluente, licenciado para uso pessoal de uma conta. ` +
    `Proibido copiar ou redistribuir: violação de direito autoral (Lei 9.610/1998; Código Penal, ` +
    `art. 184), sujeita a responsabilização civil e criminal (Termos de Uso, artigo 5). ` +
    `Cópia ${MARCADOR_VISIVEL}.`,
  letters: [...letters].sort((a, b) => a.order - b.order)
    .map(l => ({ ...l, didYouKnow: marcar(l.didYouKnow) })),
  nikud,
  extras,
  scenes: realWorld.scenes,
  sentences: sentences.sentences,
  eras: eras.pairs,
  strokes: strokes.letters,
  culture: culture.cards.map(c => ({ ...c, bodyPt: (c.bodyPt || []).map(marcar) })),
  missoes: missoes.missoes,
  textos: textos.textos,
  bonus: bonus.leituras,
  guiaNikud: bonus.guia ?? null
});

export async function content({ request, env }) {
  const account = await requireAccount(request, env);
  if (!account) return notSignedIn();

  /* O direito, lido do BANCO a cada pedido. O cookie não o carrega, de
     propósito: é o que faz um estorno fechar a porta na hora, sem esperar o
     cookie vencer. */
  if (!await hasEntitlement(env, account.id, COURSE)) {
    return fail('not-owned', 403);
  }

  /* Sem marca (banco fora do ar), o curso sai mesmo assim: quem pagou não
     perde a aula por causa de uma defesa contra cópia. */
  const marca = await marcaDaConta(env, account.id);
  const corpo = MOLDE
    .replaceAll(MARCADOR, marca ? invisivel(marca) : '')
    .replaceAll(MARCADOR_VISIVEL, marca ? marca.toUpperCase() : '-');

  return new Response(corpo, {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'private, no-store'
    }
  });
}

/* Só para o teste poder conferir a forma sem subir um Worker. */
export const conteudoBruto = () => MOLDE.replaceAll(MARCADOR, '').replaceAll(MARCADOR_VISIVEL, '-');

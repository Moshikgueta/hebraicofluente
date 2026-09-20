/* O depósito de conteúdo, cheio antes de qualquer teste rodar.
 * ─────────────────────────────────────────────────────────────────────────
 * Desde 20/09/2026 `lib/content.ts` não importa mais os JSONs do curso - ele
 * é um depósito que o navegador enche uma vez, com o que `/api/content`
 * devolve a quem pagou (ver a nota naquele arquivo).
 *
 * Isso vale para o teste também, e é de propósito que ele passe pelo mesmo
 * caminho: se a forma que o servidor manda deixar de bater com a que o
 * depósito espera, o dano aparece aqui, na suíte inteira, e não em produção
 * na primeira lição que alguém abrir.
 *
 * Roda como `setupFiles` do vitest, antes de os arquivos de teste serem
 * importados - o que importa, porque vários deles leem o conteúdo já na
 * primeira linha (`const letters = allLetters()`).
 */

import { hidratarConteudo } from '@/lib/content';
import { conteudoPago } from '@/lib/content-servidor';

hidratarConteudo(conteudoPago);

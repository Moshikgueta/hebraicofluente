/* As etapas de uma lição, numa lista só.
 * ─────────────────────────────────────────────────────────────────────────
 * Até 01/10/2026 a mesma lição era descrita de três jeitos: a capa tinha
 * seis passos (Reconheça, Ouça, Associe, Pratique, Leia, Revise), /metodo
 * tinha cinco etapas com outros nomes (Conheça, Escute, Leia, Escreva,
 * Prove), e a lição de verdade tem cinco abas com um terceiro conjunto de
 * nomes. Os seis passos da capa nem citavam a escrita, que é um dos
 * diferenciais do curso (auditoria, CONV-010).
 *
 * A fonte agora é o PRODUTO: os nomes são os das abas da lição
 * (`STAGES` em app/licao/[letterId]/LessonClient.tsx), na mesma ordem, e a
 * descrição diz o que o aluno faz em cada uma. A capa (Metodo, em
 * components/landing/Secoes.tsx, via `PASSOS`) e /metodo leem daqui.
 * `tests/etapas.test.ts` confere que as abas da lição continuam com estes
 * nomes - se uma aba mudar de nome, a vitrine tem de mudar junto.
 *
 * O áudio entra só quando há gravação, pela mesma regra de copy.ts: quem
 * decide é o manifesto.
 */

import { AUDIO_MANIFEST } from '@/lib/audio-manifest';
import { tx } from '@/i18n/telas/motor-etapas-da-licao';

const TEM_AUDIO = AUDIO_MANIFEST.length > 0;

export type EtapaDaLicao = {
  /** O nome da aba, exatamente como a lição mostra. */
  aba: string;
  /** O que o aluno faz nela, numa frase. */
  descricaoPt: string;
};

export const ETAPAS_DA_LICAO: readonly EtapaDaLicao[] = [
  {
    aba: tx.conhecer,
    descricaoPt: TEM_AUDIO ? tx.conhecerAudio : tx.conhecerSemAudio
  },
  { aba: tx.palavras, descricaoPt: tx.palavrasDesc },
  { aba: tx.escrever, descricaoPt: tx.escreverDesc },
  { aba: tx.fixacao, descricaoPt: tx.fixacaoDesc },
  { aba: tx.exercicios, descricaoPt: tx.exerciciosDesc }
];

/** "Cinco", "Seis"... para a frase que conta as etapas. */
export const quantasEtapasPt = (): string => tx.numero(ETAPAS_DA_LICAO.length);

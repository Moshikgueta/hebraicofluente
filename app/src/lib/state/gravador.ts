/* Quem decide QUANDO gravar - e, principalmente, quando não gravar.
 * ─────────────────────────────────────────────────────────────────────────
 * Isto era três linhas soltas dentro do provedor, e essas três linhas
 * apagavam o progresso de todo aluno a cada troca de página:
 *
 *   saveTimer.current = setTimeout(() => { void store.save(next); }, 400);
 *
 * Dois defeitos moravam ali, e cada um sozinho bastava para destruir tudo.
 *
 * 1. A ESCRITA GUARDAVA UMA CÓPIA DO ESTADO.
 *    `next` é capturado quando o temporizador é AGENDADO, não quando ele
 *    dispara. Entre uma coisa e outra cabe muita vida - inclusive a chegada
 *    do estado que veio do armazenamento. Quando o temporizador enfim
 *    disparava, gravava a cópia velha por cima do que tinha acabado de ser
 *    carregado.
 *
 * 2. A ESCRITA ACONTECIA ANTES DE A LEITURA TERMINAR.
 *    O provedor monta com `EMPTY_STATE` e só depois `store.load()` resolve.
 *    O `AppShell` avisa a rota atual num efeito, e efeito roda antes de
 *    promessa resolver. Então a sequência real de toda abertura de página era:
 *
 *      monta com estado VAZIO
 *      → efeito da rota agenda gravação do estado VAZIO
 *      → load() devolve o progresso de verdade
 *      → 400 ms depois, o VAZIO capturado é gravado por cima
 *
 *    Medido num navegador, com xp=999 e a lição 1 inteira guardadas:
 *    uma única escrita, `{xp: 0, licoes: [], rota: "/licao/alef/"}`, e o
 *    aluno voltava do zero. Com o adaptador do Worker isso não parava no
 *    aparelho: subia, e apagava o progresso da conta no servidor também.
 *
 * As duas regras deste arquivo respondem exatamente a esses dois defeitos:
 *
 *   · agendar guarda a INTENÇÃO de gravar, nunca o que gravar. Na hora de
 *     gravar, pergunta qual é o estado de agora;
 *   · nada é gravado antes de `liberar()`, que o provedor chama quando a
 *     leitura termina. Uma resposta dada nesse meio-tempo se perde, e perder
 *     um clique é incomparavelmente melhor do que apagar um mês de estudo.
 */

import type { LearnerState, ProgressStore } from './types';

export type Gravador = {
  /** Agenda uma gravação daqui a `ms`, substituindo a que estiver pendente. */
  agendar: (ms: number) => void;
  /** Grava agora, sem esperar. Usado quando entrar ou sair muda o dono. */
  agora: () => Promise<void>;
  /** A leitura terminou: a partir daqui pode gravar. */
  liberar: () => void;
  /** Desmontou: cancela o que estiver pendente. */
  cancelar: () => void;
  /** Só para os ensaios. */
  readonly liberado: boolean;
};

export function criarGravador(
  store: ProgressStore,
  /* Lido NA HORA de gravar. É esta indireção que impede a gravação de uma
     cópia velha - ver o defeito 1 no topo do arquivo. */
  estadoDeAgora: () => LearnerState,
  /* Chamado DEPOIS de cada tentativa de gravar, com ou sem sucesso. É por
     aqui que a interface fica sabendo que a última lição ainda não subiu. */
  aoGravar: () => void = () => {}
): Gravador {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let liberado = false;

  const limpar = () => {
    if (timer) { clearTimeout(timer); timer = null; }
  };

  return {
    get liberado() { return liberado; },

    agendar(ms: number) {
      limpar();
      timer = setTimeout(() => {
        timer = null;
        /* A guarda fica AQUI, e não em quem agenda, porque o que importa é
           se o estado já chegou no momento da gravação - não se tinha
           chegado no momento em que alguém pediu para gravar. */
        if (!liberado) return;
        void store.save(estadoDeAgora()).then(aoGravar, aoGravar);
      }, ms);
    },

    async agora() {
      limpar();
      if (!liberado) return;
      try { await store.save(estadoDeAgora()); } finally { aoGravar(); }
    },

    liberar() { liberado = true; },

    cancelar() { limpar(); }
  };
}

/* O progresso no servidor, com o aparelho como cache.
 * ─────────────────────────────────────────────────────────────────────────
 * Este adaptador não substitui o localStorage: ele o EMBRULHA. Toda escrita
 * cai primeiro no aparelho e depois sobe, e toda leitura funde o que está no
 * aparelho com o que está no servidor. A ordem importa e é a razão do
 * arquivo existir:
 *
 *   · o curso precisa funcionar no ônibus, sem sinal. O localStorage é o que
 *     garante isso, e uma escrita que só vai ao servidor perde a sessão
 *     inteira num túnel;
 *   · quem faz login num aparelho novo tem de ENCONTRAR o seu progresso, e
 *     quem já estudou deslogado neste aparelho não pode perdê-lo ao entrar.
 *     As duas coisas são a mesma fusão, rodando nos dois sentidos.
 *
 * O conflito é resolvido por `rev`: o servidor recusa (409) uma escrita que
 * pise numa revisão que já mudou e devolve o estado atual junto. Aí este
 * arquivo funde e tenta de novo - a fusão é monotônica e idempotente, então
 * repetir é seguro. Duas tentativas, e depois desiste em silêncio: o trabalho
 * está no aparelho, e a próxima sincronização o leva.
 *
 * Sem sessão (visitante, ou uma janela que expirou) tudo isto vira o
 * localStorage puro, sem erro e sem tela de aviso. O curso nunca depende de
 * estar logado para funcionar.
 */

import { EMPTY_STATE, type LearnerState, type ProgressStore } from './types';
import { LocalProgressStore } from './local';
import { migrate } from './migrate';
import { mergeStates, sameProgress, sameState } from './merge';

type Resposta = { state: LearnerState | null; rev: number; uid: string | null };

const VAZIO: Resposta = { state: null, rev: 0, uid: null };

/* De quem é o progresso guardado neste navegador.
 *
 * Sem esta marca, um notebook compartilhado funde o progresso de quem usou
 * antes na conta de quem entra depois - e a segunda pessoa ganha vinte letras
 * que nunca estudou, o que estraga a fila de revisão dela inteira. A marca
 * ausente continua significando "estudou sem conta neste aparelho", que é o
 * caso em que a fusão É o comportamento certo. */
const DONO = 'hf-progresso-dono';

const lerDono = (): string | null => {
  try { return window.localStorage.getItem(DONO); } catch { return null; }
};
const gravarDono = (uid: string | null) => {
  try {
    if (uid) window.localStorage.setItem(DONO, uid);
    else window.localStorage.removeItem(DONO);
  } catch { /* janela anônima: a fusão volta ao padrão, que é seguro */ }
};

async function pedir(caminho: string, init?: RequestInit): Promise<Response | null> {
  try {
    return await fetch(caminho, { credentials: 'same-origin', ...init });
  } catch {
    /* Offline, DNS, proxy. Não é erro de programa: é o ônibus. */
    return null;
  }
}

/**
 * Descarta o corpo de uma resposta que não vai ser lida.
 *
 * Sem isto a requisição fica PENDURADA no navegador. Um `fetch` cujo corpo
 * ninguém consome nem cancela continua aberto para sempre: a barra de carga
 * da aba não para, a conexão ocupa um dos poucos slots do domínio, e a página
 * nunca chega a `networkidle`. Todo visitante deslogado pegava uma dessas na
 * capa, porque o 401 de `/api/progress` era o caso mais comum do mundo aqui e
 * era exatamente o que saía cedo sem ler nada.
 *
 * LÊ o corpo em vez de cancelá-lo, de propósito. Cancelar também resolve o
 * pendurado, mas deixa um `net::ERR_ABORTED` no console de toda visita - um
 * erro vermelho numa requisição que funcionou exatamente como devia. Estes
 * corpos são de uma linha (`{"error":"not-signed-in"}`), então lê-los custa
 * nada e não mente sobre o que aconteceu.
 */
async function descartar(r: Response): Promise<void> {
  try { await r.text(); } catch { /* já consumido, ou sem corpo */ }
}

export class WorkerProgressStore implements ProgressStore {
  #local = new LocalProgressStore();
  /** A revisão que este aparelho leu por último. 0 = nunca leu nada. */
  #rev = 0;
  /** Falso enquanto não se sabe se há sessão - evita PUTs que darão 401. */
  #comSessao = true;
  /** O que este aparelho já mandou ao servidor. Ver a nota em `save`. */
  #enviado: LearnerState | null = null;

  async #ler(): Promise<Resposta> {
    const r = await pedir('/api/progress');
    if (!r) return VAZIO;
    if (r.status === 401) { await descartar(r); this.#comSessao = false; return VAZIO; }
    if (!r.ok) { await descartar(r); return VAZIO; }
    this.#comSessao = true;
    const corpo = await r.json().catch(() => null) as
      { state?: unknown; rev?: number; uid?: unknown } | null;
    if (!corpo) return VAZIO;
    return {
      /* Pela mesma migração do localStorage: uma linha gravada por uma versão
         antiga do app é exatamente o caso para o qual migrate() existe. */
      state: corpo.state ? migrate(corpo.state) : null,
      rev: Number(corpo.rev) || 0,
      uid: corpo.uid == null ? null : String(corpo.uid)
    };
  }

  async load(): Promise<LearnerState> {
    const aqui = await this.#local.load();
    const la = await this.#ler();
    this.#rev = la.rev;

    if (!la.uid) return aqui;               /* sem sessão: o aparelho manda */

    /* De outra pessoa? Então o que está guardado aqui não é desta conta e
       não entra nela. O cache é substituído pelo que o servidor tem. */
    const donoAnterior = lerDono();
    const deOutro = donoAnterior !== null && donoAnterior !== la.uid;
    gravarDono(la.uid);

    if (deOutro) {
      const dele = la.state ?? EMPTY_STATE;
      await this.#local.save(dele);
      return dele;
    }

    if (!la.state) {
      /* Nada no servidor. Se há trabalho neste aparelho, ele vira a primeira
         versão da conta - é o caso de quem estudou antes de criar a conta. */
      if (!sameState(aqui, EMPTY_STATE)) await this.#subir(aqui);
      return aqui;
    }

    const fundido = mergeStates(aqui, la.state);
    await this.#local.save(fundido);
    /* Só sobe se a fusão acrescentou alguma coisa ao que o servidor já tinha.
       Sem esta comparação, abrir o curso gravaria no D1 a cada carregamento
       de página, em todo aparelho, para sempre. */
    if (sameProgress(fundido, la.state)) this.#enviado = fundido;
    else await this.#subir(fundido);
    return fundido;
  }

  async save(state: LearnerState): Promise<void> {
    /* O aparelho primeiro, e sempre. Se a rede falhar, a sessão continua
       salva; a próxima `load()` funde e leva. */
    await this.#local.save(state);
    if (!this.#comSessao) return;
    /* Trocar de tela grava `lastRoute` e mais nada. Subir isso seria uma
       escrita no D1 por clique de navegação, para sincronizar onde a pessoa
       está neste segundo - a rota sobe junto com a próxima mudança de
       verdade, que numa sessão de estudo vem em segundos. */
    if (this.#enviado && sameProgress(state, this.#enviado)) return;
    await this.#subir(state);
  }

  async clear(): Promise<void> {
    await this.#local.clear();
    this.#rev = 0;
    this.#enviado = null;
    gravarDono(null);
    if (!this.#comSessao) return;
    const r = await pedir('/api/progress', { method: 'DELETE' });
    if (!r) return;
    await descartar(r);
    if (r.status === 401) this.#comSessao = false;
  }

  /** Sobe o estado, fundindo e repetindo se outro aparelho chegou antes. */
  async #subir(state: LearnerState, tentativas = 2): Promise<void> {
    let atual = state;
    for (let i = 0; i < tentativas; i++) {
      const r = await pedir('/api/progress', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: atual, rev: this.#rev, version: atual.version })
      });
      if (!r) return;                       /* sem rede: fica no aparelho */
      if (r.status === 401) { await descartar(r); this.#comSessao = false; return; }

      const corpo = await r.json().catch(() => null) as
        { rev?: number; state?: unknown } | null;

      if (r.ok) {
        this.#rev = Number(corpo?.rev) || this.#rev + 1;
        this.#enviado = atual;
        return;
      }

      if (r.status === 409 && corpo) {
        /* Outro aparelho gravou no meio. Funde o que ele escreveu e repete -
           é seguro porque a fusão não desfaz nada. */
        this.#rev = Number(corpo.rev) || 0;
        const deles = corpo.state ? migrate(corpo.state) : EMPTY_STATE;
        atual = mergeStates(atual, deles);
        await this.#local.save(atual);
        continue;
      }
      return;                               /* 429, 400, 500: fica para depois */
    }
  }
}

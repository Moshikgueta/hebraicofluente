/* O cérebro dos jogos de reconhecimento.
 * ─────────────────────────────────────────────────────────────────────────
 * Três jogos - Caça à letra, Batalha das parecidas e Impressa × Cursiva -
 * fazem a mesma pergunta de fundo: QUAIS letras mostrar agora, e quais pôr ao
 * lado delas para a escolha custar alguma coisa. Este arquivo responde isso
 * uma vez, e os três componentes só desenham.
 *
 * ── o que ele NÃO faz ───────────────────────────────────────────────────
 * Não guarda nada. Não tem placar, não tem nível, não tem memória de quem
 * erra o quê. Tudo isso já existe e é de outro lugar:
 *
 *   · `state.skills[letra]`      - cinco habilidades, acertos e erros de cada
 *   · `state.confusions`         - `correta>escolhida`, com contagem e decaimento
 *   · `letterMastery()`          - o nível, tirado da habilidade MAIS FRACA
 *   · `state.gym[jogo]`          - o recorde pessoal, por jogo
 *
 * Criar uma segunda memória aqui seria a segunda fonte de verdade que um dia
 * discorda da primeira, e seria ela que o aluno veria.
 *
 * ── a regra que nenhum jogo pode furar ──────────────────────────────────
 * Letra que o aluno ainda não encontrou não entra. Quem decide isso é quem
 * chama (a lista `unlocked`), e é por isso que nenhuma função daqui vai
 * buscar `allLetters()` sozinha: a única forma de mostrar uma letra trancada
 * seria alguém passá-la de fora, de propósito.
 *
 * E o corolário que se esquece: um PAR de letras parecidas só pode ser usado
 * quando as DUAS já foram ensinadas. Mostrar ד contra ר para quem só viu o
 * ד não é treinar discriminação, é adivinhação.
 */

import type { Letter } from '@/lib/content';
import type { ParDeSom } from './pares-de-som';
import type { LearnerState } from '@/lib/state/types';
import { letterMastery, topConfusions } from '@/lib/state/rules';
import { pick, shuffled, take, type Rand } from './rng';

/* ── o nível ───────────────────────────────────────────────────────────── */

export type Nivel = 'facil' | 'medio' | 'dificil';

export const NIVEL_LABEL: Record<Nivel, string> = {
  facil: 'Aquecimento',
  medio: 'Treino',
  dificil: 'Difícil'
};

/**
 * Em que nível este aluno está, agora.
 *
 * Duas coisas decidem, e as duas são do progresso dele - nunca uma escolha
 * numa tela de opções. Quem está no começo não sabe se quer o difícil, e quem
 * está no fim não deveria ter de pedir.
 *
 *   · QUANTAS letras ele tem. Com quatro letras não existe "misturar
 *     parecidas": não há parecidas suficientes para montar uma grade.
 *   · QUÃO firmes elas estão. Vinte letras todas em `aprendendo` é alguém que
 *     acabou de passar por elas, não alguém pronto para o difícil.
 */
export function nivelDe(state: LearnerState, unlocked: readonly Letter[]): Nivel {
  if (unlocked.length < 6) return 'facil';
  const firmes = unlocked.filter(l => {
    const m = letterMastery(state, l.id);
    return m === 'forte' || m === 'praticando';
  }).length;
  const parte = firmes / unlocked.length;
  if (unlocked.length >= 12 && parte >= 0.6) return 'dificil';
  if (parte >= 0.3) return 'medio';
  return 'facil';
}

/* ── de que letra este aluno precisa ───────────────────────────────────── */

/**
 * O peso de uma letra no sorteio. Quanto maior, mais ela aparece.
 *
 * Não é aleatório uniforme de propósito: um jogo que sorteia por igual gasta
 * metade do tempo do aluno nas letras que ele já domina. O peso vem do mesmo
 * modelo que a revisão usa, então "praticar" e "revisar" concordam sobre
 * quais letras estão devendo.
 *
 * `revisar` pesa mais do que `novo`: uma letra errada e ainda não recuperada
 * é mais urgente do que uma que nunca foi testada.
 */
export function pesoDaLetra(state: LearnerState, letterId: string): number {
  switch (letterMastery(state, letterId)) {
    case 'revisar': return 6;
    case 'aprendendo': return 4;
    case 'novo': return 3;
    case 'praticando': return 2;
    case 'forte': return 1;
  }
}

/** Um sorteio ponderado, com a mesma `Rand` semeada do resto do motor. */
export function sortearPorPeso<T>(
  itens: readonly T[], peso: (t: T) => number, rand: Rand
): T | undefined {
  if (!itens.length) return undefined;
  const total = itens.reduce((s, t) => s + Math.max(0.0001, peso(t)), 0);
  let n = rand() * total;
  for (const t of itens) {
    n -= Math.max(0.0001, peso(t));
    if (n <= 0) return t;
  }
  return itens[itens.length - 1];
}

/** N letras distintas, sorteadas pelo peso. */
export function sortearLetras(
  state: LearnerState, unlocked: readonly Letter[], n: number, rand: Rand
): Letter[] {
  const resto = unlocked.slice();
  const out: Letter[] = [];
  while (out.length < n && resto.length) {
    const L = sortearPorPeso(resto, l => pesoDaLetra(state, l.id), rand);
    if (!L) break;
    out.push(L);
    resto.splice(resto.indexOf(L), 1);
  }
  return out;
}

/* ── quem fica ao lado ─────────────────────────────────────────────────── */

/**
 * As letras que o aluno PODE confundir com esta, entre as que ele já tem.
 *
 * Duas fontes, nesta ordem, e a ordem é a diferença entre um curso genérico e
 * um adaptativo:
 *
 *   1. o que ELE trocou de verdade (`state.confusions`);
 *   2. o que o conteúdo diz que se parece (`confusableWith`), para quem ainda
 *      não errou - esperar o erro para começar a treinar é esperar demais.
 *
 * O filtro por `unlocked` é a regra do parágrafo do topo: um par só existe
 * quando as duas metades já foram ensinadas.
 */
export function parecidasCom(
  state: LearnerState, L: Letter, unlocked: readonly Letter[]
): Letter[] {
  const porGlifo = new Map<string, Letter>();
  for (const o of unlocked) {
    if (o.id === L.id) continue;
    porGlifo.set(o.letter, o);
    if (o.finalForm) porGlifo.set(o.finalForm, o);
  }

  const out: Letter[] = [];
  const junta = (glifo: string) => {
    const o = porGlifo.get(glifo);
    if (o && !out.some(x => x.id === o.id)) out.push(o);
  };

  /* Primeiro as trocas registradas, nos dois sentidos: quem escreve ר no
     lugar de ד também lê ד onde está escrito ר. */
  for (const c of topConfusions(state, 12)) {
    if (c.correct === L.letter || c.correct === L.finalForm) junta(c.chosen);
    if (c.chosen === L.letter || c.chosen === L.finalForm) junta(c.correct);
  }
  for (const glifo of L.confusableWith) junta(glifo);
  return out;
}

/**
 * As alternativas erradas de uma pergunta.
 *
 * O nível decide de onde elas vêm, e é aqui que "adaptar a dificuldade"
 * acontece de verdade - não numa barra de velocidade:
 *
 *   fácil    - letras que não se parecem com a certa. A pergunta é "você
 *              reconhece esta letra?", e nada mais.
 *   médio    - metade parecidas, metade quaisquer.
 *   difícil  - só parecidas, enquanto houver. A pergunta passa a ser "você
 *              distingue esta letra daquela que se parece com ela?", que é
 *              outra habilidade.
 *
 * Quando não há parecidas suficientes - início do curso -, ele completa com
 * quaisquer em vez de devolver menos alternativas: uma pergunta de duas
 * opções vira cara ou coroa.
 */
export function distratores(
  state: LearnerState, alvo: Letter, unlocked: readonly Letter[],
  quantos: number, nivel: Nivel, rand: Rand
): Letter[] {
  const outras = unlocked.filter(l => l.id !== alvo.id);
  const parecidas = parecidasCom(state, alvo, unlocked);
  const distantes = outras.filter(l => !parecidas.some(p => p.id === l.id));

  const quantasParecidas =
    nivel === 'dificil' ? quantos
    : nivel === 'medio' ? Math.ceil(quantos / 2)
    : 0;

  const out = take(parecidas, Math.min(quantasParecidas, parecidas.length), rand);
  const faltam = quantos - out.length;
  if (faltam > 0) out.push(...take(distantes.length ? distantes : outras, faltam, rand));
  return shuffled(out, rand).slice(0, quantos);
}

/* ── o retorno que ensina ──────────────────────────────────────────────── */

/**
 * Por que esta escolha estava errada, em uma frase.
 *
 * Sai do campo `contrastes` das letras - a frase que diz ONDE OLHAR, escrita
 * por letra e por par ("o ם final é quadrado; o ס é redondo"). É a diferença
 * entre "errado" e um retorno que corrige.
 *
 * Devolve `null` quando não há frase para este par, e quem chama cai numa
 * mensagem genérica: inventar uma diferença visual aqui seria ensinar algo
 * que ninguém revisou.
 */
export function porQueErrou(certa: Letter, escolhida: Letter): string | null {
  const c = certa.contrastes;
  if (!c) return null;
  return c[escolhida.letter] ?? (escolhida.finalForm ? c[escolhida.finalForm] ?? null : null);
}

/* ── a grade da Caça à letra ───────────────────────────────────────────── */

export type Caca = {
  alvo: Letter;
  /** O glifo procurado: a forma normal ou a final, quando a rodada é dela. */
  glifo: string;
  /** Cada célula é um glifo, e `certa` diz se ela conta. */
  celulas: { id: string; glifo: string; certa: boolean; letterId: string }[];
  quantas: number;
  nivel: Nivel;
};

/**
 * Monta uma rodada de caça.
 *
 * O tamanho vem do pedido (10 a 25 células) e sobe com o nível, porque uma
 * grade pequena de letras parecidas já é difícil e uma grade grande de letras
 * distintas é só demorada.
 *
 * ── quantas certas ──────────────────────────────────────────────────────
 * Cerca de um quarto da grade, entre 3 e 6. A PROPORÇÃO é o que importa, e
 * ela custou uma captura de tela para ficar óbvia: com um número fixo de 3 a
 * 6 numa grade de 12, uma rodada saiu com SEIS alvos em doze células - metade
 * do tabuleiro era a resposta, e procurar deixou de ser procurar.
 *
 * Os limites continuam: uma grade com uma ocorrência vira agulha no palheiro,
 * e o número é dito no fim ("você encontrou 5"), então precisa ser um número
 * que a pessoa consiga ter contado enquanto jogava.
 */
export function montarCaca(
  state: LearnerState, unlocked: readonly Letter[], rand: Rand, nivel: Nivel,
  /** De onde sortear o ALVO. O ruído continua vindo de todo o desbloqueado -
   *  ver `montarCacada`, que usa isto para não repetir letra entre rodadas. */
  fonteDoAlvo: readonly Letter[] = unlocked
): Caca | null {
  if (unlocked.length < 3) return null;

  const alvo = sortearPorPeso(
    fonteDoAlvo.length ? fonteDoAlvo : unlocked, l => pesoDaLetra(state, l.id), rand);
  if (!alvo) return null;

  /* A forma final entra como rodada própria, e só quando a letra tem uma.
     Procurar ם numa grade é um exercício diferente de procurar מ, e é
     justamente o que confunde quem lê uma palavra pela primeira vez. */
  const temFinal = !!alvo.finalForm;
  const usarFinal = temFinal && rand() < 0.35;
  const glifo = usarFinal ? alvo.finalForm! : alvo.letter;

  const total = nivel === 'facil' ? 12 : nivel === 'medio' ? 18 : 24;
  const ideal = Math.round(total * 0.25);
  const quantas = Math.min(6, Math.max(3, ideal + (rand() < 0.4 ? 1 : 0)));

  const ruido = distratores(state, alvo, unlocked, Math.min(6, unlocked.length - 1), nivel, rand);
  if (!ruido.length) return null;

  const celulas: Caca['celulas'] = [];
  for (let i = 0; i < quantas; i++) {
    celulas.push({ id: `c${i}`, glifo, certa: true, letterId: alvo.id });
  }
  for (let i = celulas.length; i < total; i++) {
    const L = ruido[i % ruido.length]!;
    /* O ruído também aparece na forma final quando tem uma: sem isso, toda
       forma final na grade seria a resposta certa, e a pista deixa de ser a
       letra e passa a ser o formato. */
    const g = L.finalForm && rand() < 0.3 ? L.finalForm : L.letter;
    /* Um distrator NUNCA pode ser o glifo procurado. Sem esta guarda, uma
       letra cuja forma final é igual à de outra entraria como "errada" com o
       desenho certo - e o aluno seria punido por acertar. */
    if (g === glifo) { celulas.push({ id: `r${i}`, glifo: L.letter, certa: L.letter === glifo, letterId: L.id }); continue; }
    celulas.push({ id: `r${i}`, glifo: g, certa: false, letterId: L.id });
  }

  const misturadas = shuffled(celulas, rand);
  return {
    alvo, glifo, celulas: misturadas,
    quantas: misturadas.filter(c => c.certa).length,
    nivel
  };
}

/**
 * Uma CAÇADA: várias rodadas, cada uma com outra letra.
 * ─────────────────────────────────────────────────────────────────────────
 * `montarCaca` sempre soube sortear a letra pelo peso, e mesmo assim o jogo
 * praticava uma letra só - porque a tela montava UMA rodada e terminava nela.
 * Relato do dono do curso: «essa atividade praticamente usa apenas uma letra».
 * A correção não é no sorteio: é a partida deixar de ser uma rodada.
 *
 * Cinco rodadas, e as letras não se repetem enquanto houver alfabeto. Isso
 * importa mais do que parece: duas rodadas seguidas com a mesma letra fazem a
 * segunda virar memória da primeira em vez de leitura, e o aluno acha que
 * ficou bom no jogo quando ficou bom naquela grade.
 *
 * Quando o alfabeto disponível é menor que o número de rodadas - começo do
 * curso -, a repetição volta a ser permitida em vez de a partida encolher:
 * cinco rodadas com três letras ainda é prática, e três rodadas seria menos
 * jogo do que o aluno pediu.
 */
export function montarCacada(
  state: LearnerState, unlocked: readonly Letter[], rand: Rand, nivel: Nivel,
  rodadas = 5
): Caca[] {
  const out: Caca[] = [];
  const usadas = new Set<string>();

  for (let i = 0; i < rodadas; i++) {
    /* Sobra alfabeto? Então o sorteio desta rodada ignora quem já saiu. */
    const restantes = unlocked.filter(l => !usadas.has(l.id));
    const fonte = restantes.length >= 3 ? restantes : unlocked;
    const c = montarCaca(state, unlocked, rand, nivel, fonte);
    if (!c) break;
    usadas.add(c.alvo.id);
    out.push(c);
  }
  return out;
}

/* ── as rodadas da Batalha ─────────────────────────────────────────────── */

export type RodadaBatalha =
  /* `final`: o glifo mostrado é a forma final, e as opções dizem "Pe final",
     "Mem final". Só quando as duas letras do par têm forma final. */
  | { tipo: 'qual'; alvo: Letter; glifo: string; opcoes: Letter[]; final?: boolean }
  | { tipo: 'todas'; alvo: Letter; outra: Letter; glifo: string;
      fila: { id: string; glifo: string; certa: boolean; letterId: string }[] }
  | { tipo: 'intruso'; alvo: Letter; intruso: Letter;
      fila: { id: string; glifo: string; intruso: boolean; letterId: string }[] }
  /* O RELÂMPAGO. A letra aparece por pouco tempo e some; a pergunta vem
     depois. É o único formato em que o aluno não pode comparar os desenhos
     lado a lado - e comparar é justamente a muleta que faz alguém achar que
     sabe distinguir {{ד}} de {{ר}} quando na verdade sabe é comparar. Na
     leitura real a letra não fica esperando. */
  | { tipo: 'relampago'; alvo: Letter; glifo: string; opcoes: Letter[]; ms: number; final?: boolean }
  /* O OUVIDO (12/10/2026): toca a sílaba com A de uma das duas, e o aluno
     escolhe a letra. Pares de PARES_DE_SOM, que são outra meta: parecer no
     som, e não no desenho. */
  | { tipo: 'som'; alvo: Letter; opcoes: Letter[]; audioId: string; notaPt: string };

export type Batalha = {
  /** As duas inimigas da PRIMEIRA rodada, para o anúncio de abertura. */
  par: [Letter, Letter];
  /** Todos os pares que a partida percorre, na ordem. */
  pares: [Letter, Letter][];
  rodadas: RodadaBatalha[];
  /** Verdadeiro quando o primeiro par saiu dos erros DELE, e não do conteúdo. */
  doAluno: boolean;
};

/**
 * Os pares que vale a pena treinar, em ordem de urgência.
 * ─────────────────────────────────────────────────────────────────────────
 * A batalha treinava UM par por partida, e o par vinha de `confusionPair`.
 * Relato do dono do curso: «existem apenas aproximadamente 8 exercícios e a
 * atividade é pouco interativa». Um par e oito rodadas é, de fato, sempre a
 * mesma partida.
 *
 * Esta função devolve até `quantos` pares distintos, e a ordem é a ordem em
 * que eles importam:
 *
 *   1. o que ELE trocou de verdade, do mais frequente ao menos - `confusions`
 *      é a única evidência que fala deste aluno e não de alunos em geral;
 *   2. o que o conteúdo diz que se parece (`confusableWith`), das letras mais
 *      recentes para as mais antigas - esperar o erro para começar a treinar
 *      é esperar demais, e a letra de ontem é a que ainda não assentou.
 *
 * As duas metades de um par têm de estar DESBLOQUEADAS. Um par com uma letra
 * que o aluno nunca viu não é um par difícil: é uma pergunta sem resposta.
 *
 * E não há lista de pares escrita à mão aqui, de propósito. Os pares que
 * valem a pena - {{ד}}/{{ר}}, {{ב}}/{{כ}}, {{ה}}/{{ח}}, {{ו}}/{{ז}} e os
 * outros - já estão no campo `confusableWith` de cada letra, que é conteúdo
 * revisado. Uma segunda lista aqui seria uma segunda fonte de verdade sobre
 * o que se parece com o quê, e um dia as duas discordariam.
 */
export function paresParaTreinar(
  state: LearnerState, unlocked: readonly Letter[], quantos = 4,
  /** Gira a escolha entre os pares ANTIGOS, para duas partidas seguidas não
   *  trazerem os mesmos. Quem chama passa um número tirado da semente. */
  giro = 0
): [Letter, Letter][] {
  const porGlifo = new Map<string, Letter>();
  for (const l of unlocked) {
    porGlifo.set(l.letter, l);
    if (l.finalForm) porGlifo.set(l.finalForm, l);
  }

  const out: [Letter, Letter][] = [];
  const vistos = new Set<string>();
  const chave = (a: Letter, b: Letter) => [a.id, b.id].sort().join('>');

  const junta = (a?: Letter, b?: Letter) => {
    if (!a || !b || a.id === b.id) return;
    const k = chave(a, b);
    if (vistos.has(k)) return;
    vistos.add(k);
    out.push([a, b]);
  };

  for (const c of topConfusions(state, 12)) {
    junta(porGlifo.get(c.correct), porGlifo.get(c.chosen));
    if (out.length >= quantos) return out.slice(0, quantos);
  }
  /* RECENTES E ANTIGOS, alternados.
     ────────────────────────────────────────────────────────────────────
     Só os recentes era a regra até 23/09, e ela tem uma boa razão - a letra
     de ontem ainda não assentou -, mas uma consequência ruim que a auditoria
     mediu: com o alfabeto inteiro e nenhum erro registrado, os quatro pares
     eram sempre פ/מ, כ/ב, כ/ר e ק/ר. Quem terminava o curso sem errar nunca
     mais via {{ד}}/{{ר}} nem {{ה}}/{{ח}}, que são exatamente os pares que o
     curso ensina a temer.

     Agora a lista de pares do conteúdo é lida nos dois sentidos e as duas
     pontas se alternam: um recente, um antigo, um recente, um antigo. Os
     antigos giram com `giro`, então cada partida traz outros. */
  const doConteudo: [Letter, Letter][] = [];
  const vistosConteudo = new Set<string>();
  for (const L of [...unlocked].reverse()) {
    for (const glifo of L.confusableWith) {
      const o = porGlifo.get(glifo);
      if (!o || o.id === L.id) continue;
      const k = chave(L, o);
      if (vistosConteudo.has(k)) continue;
      vistosConteudo.add(k);
      doConteudo.push([L, o]);
    }
  }
  /* As duas METADES da lista, e não a lista inteira lida ao contrário: o
     giro sobre a lista inteira às vezes trazia recentes dos dois lados, e a
     partida voltava a ser só de pares recentes. */
  /* A idade de um par é a da letra MAIS NOVA dele - é quando ele passa a
     existir para o aluno. {{ד}} declara {{ך}}: o par nasce no Kaf (21), e não
     no Dálet (8), e ordenar pela letra que declara o punha entre os antigos. */
  const idade = ([a, b]: [Letter, Letter]) => Math.max(a.order, b.order);
  doConteudo.sort((p, q) => idade(q) - idade(p)
    || Math.min(q[0].order, q[1].order) - Math.min(p[0].order, p[1].order));
  const meio = Math.ceil(doConteudo.length / 2);
  const recentes = doConteudo.slice(0, meio);
  const antigos = doConteudo.slice(meio).reverse();
  const n = antigos.length;
  const girados = n ? [...antigos.slice(giro % n), ...antigos.slice(0, giro % n)] : [];
  for (let i = 0; out.length < quantos && i < doConteudo.length; i++) {
    const r = recentes[i];
    if (r) junta(r[0], r[1]);
    if (out.length >= quantos) break;
    const a = girados[i];
    if (a) junta(a[0], a[1]);
  }
  return out.slice(0, quantos);
}

/**
 * Monta a batalha de um par.
 *
 * Três formatos alternados de propósito, porque cada um mede uma coisa:
 *
 *   qual     - a letra sozinha, e o nome. Mede se ele sabe QUAL é.
 *   todas    - uma fileira, toque em todas as X. Mede se ele SEPARA as duas
 *              quando elas estão lado a lado, que é o caso da palavra real.
 *   intruso  - cinco iguais e uma diferente. Mede se ele NOTA a diferença sem
 *              que ninguém aponte para onde olhar.
 *
 * O par vem de fora (`confusionPair`, em gym.ts) para não haver duas regras
 * decidindo qual par treinar.
 */
export function montarBatalha(
  pares: [Letter, Letter][], doAluno: boolean, rand: Rand, quantas = 16
): Batalha {
  const rodadas: RodadaBatalha[] = [];
  const formas = (L: Letter) => (L.finalForm ? [L.letter, L.finalForm] : [L.letter]);
  const lista = pares.length ? pares : [];
  if (!lista.length) return { par: [null as never, null as never], pares: [], rodadas: [], doAluno };

  /* QUATRO rodadas por par antes de trocar, e não uma de cada.
     ────────────────────────────────────────────────────────────────────
     Alternar par a cada rodada pareceria mais variado e ensinaria menos: a
     discriminação de duas formas parecidas assenta por repetição próxima, e
     quatro ângulos seguidos sobre {{ד}}/{{ר}} - qual é, ache todas, o
     intruso, o relâmpago - é o que faz a diferença virar automática. Depois
     disso o par muda, e a partida inteira cobre três ou quatro pares em vez
     de um. */
  const POR_PAR = 4;

  for (let i = 0; i < quantas; i++) {
    const par = lista[Math.floor(i / POR_PAR) % lista.length]!;
    const alvo = par[i % 2]!;
    const outra = par[(i + 1) % 2]!;
    /* A forma final é OUTRA letra para quem lê (pedido do dono, 27/10/2026:
       "não considera as letras finais como letras normais"). Ela só aparece
       como glifo da rodada nas fileiras, onde o pedido é o DESENHO exato; em
       "qual é esta" e no relâmpago, só quando as duas do par têm forma
       final, e então as opções dizem "final". Com uma só, "Pe final" contra
       "Kaf" entregaria a resposta pelo rótulo. */
    const glifo = pick(formas(alvo), rand) ?? alvo.letter;
    const final = !!alvo.finalForm && !!outra.finalForm && rand() < 0.3;
    const glifoNome = final ? alvo.finalForm! : alvo.letter;

    /* A quarta de cada par é a relâmpago, e ela vem por último de propósito:
       o aluno chega nela tendo visto o par de três ângulos, então o que se
       mede é o reconhecimento e não a surpresa. */
    if (i % POR_PAR === 3) {
      rodadas.push({
        tipo: 'relampago', alvo, glifo: glifoNome, final,
        opcoes: shuffled([alvo, outra], rand),
        /* 900 ms: tempo de ver, não de estudar. Abaixo disso vira teste de
           reflexo; acima, o aluno guarda a imagem e compara depois. */
        ms: 900
      });
      continue;
    }

    if (i % 3 === 0) {
      rodadas.push({ tipo: 'qual', alvo, glifo: glifoNome, final, opcoes: shuffled([alvo, outra], rand) });
      continue;
    }

    if (i % 3 === 1) {
      /* Só conta o DESENHO pedido: em "toque em todas as ף", a פ é errada.
         A outra forma da própria letra entra como distrator, porque separar
         פ de ף é a mesma habilidade de separar ד de ר. */
      const outraForma = alvo.finalForm ? (glifo === alvo.letter ? alvo.finalForm : alvo.letter) : null;
      const ruido = [
        ...formas(outra).map(g => ({ g, L: outra })),
        ...(outraForma ? [{ g: outraForma, L: alvo }] : [])
      ];
      const n = 6 + Math.floor(rand() * 3);
      const fila = Array.from({ length: n }, (_, k) => {
        const certa = rand() < 0.45;
        const d = certa ? { g: glifo, L: alvo } : pick(ruido, rand)!;
        return { id: `f${i}-${k}`, glifo: d.g, certa, letterId: d.L.id };
      });
      /* Uma fileira sem nenhuma certa não tem resposta, e uma só com certas
         não tem escolha. Garante pelo menos uma de cada. */
      if (!fila.some(c => c.certa)) { const f = fila[0]!; f.certa = true; f.glifo = glifo; f.letterId = alvo.id; }
      if (fila.every(c => c.certa)) { const f = fila[fila.length - 1]!; f.certa = false; f.glifo = outra.letter; f.letterId = outra.id; }
      rodadas.push({ tipo: 'todas', alvo, outra, glifo, fila });
      continue;
    }

    const n = 5;
    const onde = Math.floor(rand() * n);
    const fila = Array.from({ length: n }, (_, k) => ({
      id: `i${i}-${k}`,
      glifo: k === onde ? outra.letter : alvo.letter,
      intruso: k === onde,
      letterId: k === onde ? outra.id : alvo.id
    }));
    rodadas.push({ tipo: 'intruso', alvo, intruso: outra, fila });
  }

  return { par: lista[0]!, pares: lista, rodadas, doAluno };
}

/* ── as rodadas de Impressa × Cursiva ──────────────────────────────────── */

export type RodadaCursiva =
  | { tipo: 'paraCursiva'; alvo: Letter; opcoes: Letter[] }
  | { tipo: 'paraImpressa'; alvo: Letter; opcoes: Letter[] }
  | { tipo: 'pares'; esquerda: Letter[]; direita: Letter[] };

/**
 * Monta a rodada de impressa × cursiva.
 *
 * As duas formas são O MESMO caractere em duas famílias tipográficas - é
 * assim que o curso ensina (ver `he-cursive` em globals.css e o gerador
 * `exPrintVsCursive`), e é a única forma que garante que a cursiva mostrada
 * aqui seja exatamente a que a lição mostrou. Uma segunda fonte cursiva,
 * escolhida por estética, ensinaria um desenho que o aluno nunca viu.
 *
 * O modo `pares` é o avançado do pedido, e é POR TOQUE: toca numa impressa,
 * toca na cursiva correspondente. Arrastar com o dedo numa grade pequena erra
 * mais do que acerta, e um jogo que pune a mão não ensina a letra.
 */
export function montarCursiva(
  state: LearnerState, unlocked: readonly Letter[], rand: Rand, nivel: Nivel, quantas = 12
): RodadaCursiva[] {
  if (unlocked.length < 3) return [];
  const out: RodadaCursiva[] = [];
  const opcoesN = nivel === 'facil' ? 3 : 4;

  for (let i = 0; i < quantas; i++) {
    /* A cada quatro rodadas, uma de pares - e só a partir do médio, porque
       ela exige seis letras firmes na cabeça ao mesmo tempo. */
    if (nivel !== 'facil' && i > 0 && i % 4 === 3 && unlocked.length >= 4) {
      const n = Math.min(4, unlocked.length);
      const letras = sortearLetras(state, unlocked, n, rand);
      out.push({
        tipo: 'pares',
        esquerda: shuffled(letras, rand),
        direita: shuffled(letras, rand)
      });
      continue;
    }

    const alvo = sortearPorPeso(unlocked, l => pesoDaLetra(state, l.id), rand);
    if (!alvo) continue;
    const opcoes = shuffled(
      [alvo, ...distratores(state, alvo, unlocked, opcoesN - 1, nivel, rand)], rand
    );
    out.push({ tipo: i % 2 === 0 ? 'paraCursiva' : 'paraImpressa', alvo, opcoes });
  }
  return out;
}

/* ── as rodadas de som da Batalha ──────────────────────────────────────── */

/**
 * Até `quantas` rodadas de ouvido, dos pares de som cujas duas letras o
 * aluno já tem e cujas duas sílabas têm gravação (`temAudio`). Sem nenhum
 * par assim, nenhuma rodada: a Batalha fica só no desenho.
 */
export function rodadasDeSom(
  pares: readonly ParDeSom[], unlocked: readonly Letter[], rand: Rand,
  temAudio: (audioId: string) => boolean, quantas = 4
): Extract<RodadaBatalha, { tipo: 'som' }>[] {
  const porGlifo = new Map(unlocked.map(l => [l.letter, l]));
  const silaba = (L: Letter) => L.syllables.find(s => s.vowel === 'a');
  const validos = pares.flatMap(par => {
    const a = porGlifo.get(par.a), b = porGlifo.get(par.b);
    const sa = a && silaba(a), sb = b && silaba(b);
    return a && b && sa && sb && temAudio(sa.audioId) && temAudio(sb.audioId) ? [{ a, b, par }] : [];
  });
  if (!validos.length) return [];
  const out: Extract<RodadaBatalha, { tipo: 'som' }>[] = [];
  const ordem = shuffled(validos, rand);
  for (let i = 0; i < quantas; i++) {
    const v = ordem[i % ordem.length]!;
    const alvo = rand() < 0.5 ? v.a : v.b;
    const outra = alvo === v.a ? v.b : v.a;
    out.push({ tipo: 'som', alvo, opcoes: shuffled([alvo, outra], rand), audioId: silaba(alvo)!.audioId, notaPt: v.par.notaPt });
  }
  return out;
}

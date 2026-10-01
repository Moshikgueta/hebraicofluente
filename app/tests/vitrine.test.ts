/* A vitrine não promete o que o curso não entrega.
 * ─────────────────────────────────────────────────────────────────────────
 * Em 21/09/2026 o site vendia um áudio que não existe. O manifesto estava
 * vazio - zero gravações -, o curso desligava os exercícios de escuta, e o FAQ
 * dizia a verdade sobre isso com duas versões da frase. O resto da landing,
 * não: listava "Áudio gravado por falante nativo" como coisa entregue, punha
 * "escuta" entre os cinco tipos de exercício, e o método tinha um passo
 * "Ouça · O som gravado por falante nativo".
 *
 * No Brasil a oferta vincula (CDC art. 30), então isto não é detalhe de texto:
 * é reembolso que o comprador tem razão em pedir.
 *
 * ── a divisão de trabalho com app/promessas.mjs ───────────────────────────
 * Aquele script lê o HTML PUBLICADO, que é a prova mais forte que existe -
 * contra o artefato, não contra a intenção. Mas o HTML só traz a PRIMEIRA aba
 * da demonstração: as outras quatro aparecem ao clicar, e o ensaio do script
 * mostrou exatamente esse furo.
 *
 * Então este teste cobre o que o HTML não alcança - o texto das cinco abas e
 * dos passos do método - lendo os mesmos arrays que a página renderiza.
 *
 * Por que não bastou olhar o pacote de JavaScript: porque `audioAvailable()` é
 * uma chamada de função sobre um array importado, e o empacotador não dobra
 * isso. Os DOIS lados de cada `TEM_AUDIO ? a : b` sobrevivem no arquivo final,
 * inclusive a frase que não vale. Tentei trocar por um booleano literal gerado
 * e o empacotador também não dobrou. Uma string morta no JavaScript minificado
 * não é oferta - ninguém a vê -, mas um verificador que não consegue distinguir
 * morta de viva é um verificador que alguém desliga. Daí a divisão: o script
 * prova o que RENDERIZA, este teste prova o que a interação pode mostrar.
 */

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { ABAS, MAQUETE, PASSOS, TEM_AUDIO } from '@/components/landing/copy';

/* Trechos que só podem estar no ar quando existe gravação. */
const PROMESSAS = [
  'gravado por falante nativo',
  'gravada por falante nativo',
  'áudio',
  'escuta',
  'Ouça',
  'ouviu'
];

/** Todo texto que a demonstração e o método mostram, numa lista só. */
const textos = (): string[] => [
  ...ABAS.flatMap(a => [a.label, a.kicker, a.title, a.body, ...a.points]),
  ...PASSOS.flatMap(p => [p[0], p[1]])
];

describe('a landing e o áudio dizem a mesma coisa', () => {
  it('não promete gravação quando não há nenhuma', () => {
    if (TEM_AUDIO) return;
    const promete = textos().filter(t =>
      PROMESSAS.some(p => t.toLowerCase().includes(p.toLowerCase())));
    expect(promete).toEqual([]);
  });

  it('conta os tipos de exercício, em vez de chutar', () => {
    /* Cinco categorias com gravação (múltipla escolha, digitação, associação,
       escuta, leitura), quatro sem - a escuta é a única que o curso desliga.
       Anunciar cinco e entregar quatro é o mesmo erro, de tamanho menor. */
    const pratica = ABAS.find(a => a.label === 'Prática');
    expect(pratica).toBeDefined();
    expect(pratica!.title).toContain(TEM_AUDIO ? 'Cinco' : 'Quatro');
  });

  it('desenha uma maquete de exercício que existe hoje', () => {
    /* As duas telas que MOSTRAM um exercício em vez de descrevê-lo. Sem
       gravação, a de escuta não existe no curso - então a maquete vira a de
       reconhecimento, que faz a pergunta ao contrário e é o que o aluno
       encontra de verdade. */
    expect(MAQUETE.praticaRotulo).toBe(TEM_AUDIO ? 'Escuta' : 'Reconhecer');
    if (!TEM_AUDIO) {
      expect(MAQUETE.praticaPergunta).not.toMatch(/ouviu|áudio|escut/i);
      expect(MAQUETE.heroiPergunta).not.toMatch(/ouviu|áudio|escut/i);
    }
  });

  it('mantém o método com as etapas da lição, e não uma lista à parte', () => {
    /* Desde 01/10/2026 (CONV-010) os passos da capa são as abas da lição:
       Conhecer, Palavras, Escrever, Praticar, Fixação - com a escrita. */
    expect(PASSOS.map(p => p[0])).toEqual(['Conhecer', 'Palavras', 'Escrever', 'Praticar', 'Fixação']);
  });

  it('volta a prometer sozinha no dia em que a gravação entrar', () => {
    /* O que garante isso é a forma: cada frase tem duas versões e quem escolhe
       é o manifesto. Se alguém trocar o condicional por texto fixo, este teste
       continua passando hoje e falha no dia da gravação - que é tarde. Então a
       verificação é de FORMA: o arquivo tem de consultar o manifesto. */
    const fonte = readFileSync(
      new URL('../src/components/landing/copy.ts', import.meta.url), 'utf8');
    expect(fonte).toContain("from '@/lib/audio-manifest'");
    expect(fonte.match(/TEM_AUDIO/g)?.length ?? 0).toBeGreaterThan(6);
  });
});

/* ── o outro lado do mesmo erro ──────────────────────────────────────────
   Os casos acima impedem a vitrine de PROMETER o que o curso não entrega.
   Este impede o contrário, que é igualmente uma divergência entre o texto e o
   código, e que passou meses no ar sem ninguém ver: o FAQ dizia que o
   progresso ficava "no próprio aparelho, não na conta" e que sincronizar
   entre aparelhos "está no plano".

   Era verdade quando foi escrito. Deixou de ser quando `WorkerProgressStore`
   e as três rotas de /api/progress entraram, e ninguém voltou para apagar a
   ressalva. O resultado é pior do que parece: uma desvantagem INVENTADA, na
   resposta que alguém lê logo antes de decidir comprar.

   Prometer a mais custa reembolso; prometer a menos custa a venda. As duas
   são o mesmo defeito - texto e código discordando -, então moram no mesmo
   arquivo. */
describe('a vitrine também não NEGA o que o curso entrega', () => {
  const faq = () => readFileSync(
    new URL('../src/app/faq/page.tsx', import.meta.url), 'utf8');

  it('não diz que o progresso fica preso num aparelho só', () => {
    const NEGACOES = [
      'não viaja junto',
      'no próprio aparelho, não na conta',
      'Sincronizar entre aparelhos está no plano'
    ];
    const achadas = NEGACOES.filter(n => faq().includes(n));
    expect(achadas).toEqual([]);
  });

  it('não diz que o áudio é sintetizado quando há gravação', () => {
    /* A FAQ dizia "sintetizador do próprio navegador, com voz de espanhol
       latino" com 526 gravações do professor no ar: um texto fixo herdado do
       curso de espanhol (auditoria de 28/09/2026, COM-003). A resposta passa
       a sair do manifesto, e nenhuma das frases antigas pode voltar. */
    const fonte = faq();
    expect(fonte).toContain("from '@/lib/audio-manifest'");
    const NEGACOES = ['espanhol latino', 'sintetizador do próprio navegador', 'estão planejadas'];
    expect(NEGACOES.filter(n => fonte.includes(n))).toEqual([]);
  });

  it('não escreve à mão um número que o array decide', () => {
    /* A seção do método dizia "Seis passos" e renderizava CINCO: `PASSOS`
       perde o passo "Ouça" enquanto não há gravação, e a frase ficou. Um
       número errado justamente na seção que existe para dizer "aqui a gente
       é exato" - o mesmo defeito das promessas de áudio, com outra roupa.

       A verificação é de FORMA, como a do manifesto: a frase tem de derivar
       do array. Conferir só o texto de hoje passaria de novo no dia em que a
       gravação entrar e o array voltar a ter seis. */
    const fonte = readFileSync(
      new URL('../src/components/landing/Secoes.tsx', import.meta.url), 'utf8');
    /* Desde 01/10/2026 a contagem sai de lib/etapas-da-licao.ts
       (`quantasEtapasPt`), a mesma lista que a capa desenha. */
    expect(fonte).toContain('quantasEtapasPt()');
    expect(fonte).not.toContain("'Seis passos'");
  });

  it('e a sincronização que ele anuncia existe mesmo', () => {
    /* O par do caso acima: apagar a ressalva sem ter a função seria trocar
       uma mentira por outra, na direção que dá reembolso. Então a prova é do
       CÓDIGO - o adaptador escolhido em modo plataforma e as três rotas que o
       servidor registra. */
    const store = readFileSync(
      new URL('../src/lib/state/store.tsx', import.meta.url), 'utf8');
    expect(store).toContain("apiMode() === 'worker'");
    expect(store).toContain('new WorkerProgressStore()');

    const rotas = readFileSync(
      new URL('../../worker/src/worker.js', import.meta.url), 'utf8');
    for (const r of ['GET /api/progress', 'PUT /api/progress', 'DELETE /api/progress']) {
      expect(rotas, r).toContain(r);
    }
  });

  it('a barra fixa do celular não vende para quem já comprou', () => {
    /* A barra é a única chamada da capa que acompanha a rolagem, e por isso
       a única que um aluno pagante levaria na cara por doze seções. A regra
       de quem recebe oferta é `vende`, de lib/cta.ts - a mesma que decide os
       outros botões -, e a prova é de FORMA: a barra tem de estar atrás
       dela. Um `<BarraFixa>` solto no JSX passa despercebido numa revisão e
       só aparece no site do cliente. */
    const capa = readFileSync(
      new URL('../src/app/HomeClient.tsx', import.meta.url), 'utf8');
    expect(capa).toContain('passo.vende && <BarraFixa');

    /* E o preço que ela mostra sai do catálogo, nunca escrito à mão: é o
       mesmo arquivo que o checkout cobra. */
    const barra = readFileSync(
      new URL('../src/components/landing/BarraFixa.tsx', import.meta.url), 'utf8');
    expect(barra).toContain("from '@/lib/catalog'");
    expect(barra).not.toMatch(/R\$\s?\d/);
  });

  it('a seção do conteúdo extra não manda visitante para rota paga', () => {
    /* /biblia é pública e vira link. /historia é do curso: um link para ela
       numa página de vendas leva a um 302 de login, que é a pior coisa que
       um botão de landing pode fazer. */
    const alem = readFileSync(
      new URL('../src/components/landing/AlemDoAlfabeto.tsx', import.meta.url), 'utf8');
    expect(alem).toContain('href="/biblia"');
    expect(alem).not.toContain('href="/historia"');
  });
});

/* ── preço de pré-lançamento (auditoria de 28/09/2026, LEGAL-014) ────────
   O R$ 297 nunca foi praticado, então não pode aparecer riscado: número
   riscado é preço de referência. Ele aparece como o preço de DEPOIS, com a
   data em que o pré-lançamento acaba (decisão do dono: 31/10/2026). */
describe('o preço cheio não aparece riscado', () => {
  it('nenhuma tela usa line-through', async () => {
    const { readdirSync, statSync } = await import('node:fs');
    const { join } = await import('node:path');
    const raiz = new URL('../src/', import.meta.url).pathname;
    const achados: string[] = [];
    const varre = (d: string) => {
      for (const n of readdirSync(d)) {
        const p = join(d, n);
        if (statSync(p).isDirectory()) varre(p);
        else if (/\.(tsx|ts|css)$/.test(n) && readFileSync(p, 'utf8').includes('line-through')) achados.push(p);
      }
    };
    varre(raiz);
    expect(achados).toEqual([]);
  });

  it('a data de fim sai do catálogo, no formato brasileiro', async () => {
    const { fimDoPreLancamento, flagship } = await import('@/lib/catalog');
    expect(fimDoPreLancamento(flagship().price)).toBe('31/10/2026');
  });
});

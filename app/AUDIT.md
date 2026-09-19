# Auditoria e plano - Hebraico Fluente (app)

Escrito depois de ler todo o código do app (6.168 linhas em `app/src`), os dados
(`data/`), as ferramentas (`tools/`) e os 72 testes. Nada foi presumido: cada
afirmação abaixo aponta para o arquivo onde ela pode ser conferida.

O documento tem três partes: **o que existe**, **o que está errado ou faltando**,
e **a ordem em que vale a pena consertar**.

---

## 1. O que existe hoje

### Arquitetura

| Camada | Onde | Estado |
| --- | --- | --- |
| Conteúdo-fonte | `data/*.json` (22 letras, 7 módulos, 17 cenas reais, nikud, extras) | forte |
| Ponte única | `tools/export-content.mjs` → `app/content/` | forte |
| Motor de exercícios | `src/lib/engine/exercises.ts` | **estreito** |
| Estado do aluno | `src/lib/state/{types,rules,store}.ts` + adaptadores local/Supabase | bom, raso |
| Direção RTL | `src/lib/hebrew.ts` + `src/components/hebrew/He.tsx` | forte |
| Áudio | `src/lib/audio-manifest.ts` + `AudioButton` + `data/audio.json` (311 clipes) | forte, sem gravações |
| Escrita | `src/components/learn/WritingCanvas.tsx` | **fraco** |
| Rotas | App Router, export estático, 48 páginas pré-renderizadas | forte |

### O que já é bom e **não deve ser tocado**

1. **A regra da ordem.** Nenhuma palavra usa uma letra ainda não ensinada.
   Garantida em três lugares: `scripts/validate.js` V1 no conteúdo,
   `alphabetSoFar` por letra no export, `violatesOrderRule()` em tempo de
   execução, e `tests/order-rule.test.ts` enumera **todos** os exercícios que o
   curso pode gerar. Isso é o coração pedagógico do produto.

2. **O contrato de direção.** `unicode-bidi: isolate`, um único `<He>` como porta
   de entrada, pontuação nunca dentro de um trecho hebraico, nenhuma inversão de
   string (uma letra pontuada tem 2-4 codepoints). `He.tsx` **lança erro em
   desenvolvimento** se alguém passar pontuação para dentro. Mantenha.

3. **Geração determinística.** `rng.ts` - nenhum `Math.random()` no motor. O
   aluno que volta encontra a mesma questão, e os testes conseguem enumerar o
   curso inteiro.

4. **A arquitetura de áudio.** `audioId` = hash do hebraico pontuado em NFC. Um
   clipe gravado para o livro toca no app sem segundo esquema de nomes e sem
   renomear quando uma lição muda de lugar. 311 clipes já planejados em 3 ondas,
   com roteiro de gravação impresso (`tools/audio-script.mjs`) e conferidor
   (`tools/check-audio.mjs`). **E a recusa de usar voz sintética** - um aluno que
   ensaia a pronúncia errada nunca descobre sozinho.

5. **XP ligado a aprendizado.** Navegar não paga; refazer não paga bônus de novo.
   `DayRecord.units` conta etapas além de questões - corrigido depois que a
   simulação de 24 dias (`tests/full-course.test.ts`) mostrou que uma lição por
   dia nunca fechava a meta diária.

6. **O desktop recém-construído**: barra lateral com progresso permanente, o mapa
   como quadro, opções curtas em ladrilhos. Recente e verificado.

---

## 2. O que está errado ou faltando

Ordenado por impacto no aprendizado, não por esforço.

### 2.1 Monocultura de exercícios - **crítico**

Os oito geradores de `exercises.ts` produzem **a mesma coisa**: pergunta em
português, quatro alternativas, uma correta. `letter-recognition`,
`print-vs-cursive`, `final-form`, `syllable-reading`, `word-meaning`,
`meaning-to-word`, `complete-word`, `audio-recognition` - variam o conteúdo, não
o gesto. O aluno faz 22 lições × 13 questões com o mesmo gesto 286 vezes.

Faltam, em ordem de valor pedagógico:

- **construir a sílaba** (consoante + sinal → sílaba) - é a operação central da
  leitura em hebraico e o curso nunca a pede;
- **construir a palavra** a partir de letras embaralhadas (RTL correto);
- **ouvir e escolher** entre sílabas mínimas (מַ/מִ/מוֹ) - hoje só existe ouvir e
  escolher entre *palavras*;
- **digitar o que ouviu** e **digitar a letra que falta** - recuperação ativa, não
  reconhecimento;
- **achar a letra diferente** numa fileira (ר ר ד ר) - discriminação visual, que é
  exatamente onde brasileiros tropeçam;
- **emparelhar** (letra ↔ som, sílaba ↔ áudio, forma normal ↔ final);
- **identificar o sinal de vogal** isolado.

### 2.2 As vogais são ensinadas e quase não são testadas - **crítico**

`data/letters.json` já traz **132 sílabas** (6 por letra: a, e, i, o, u, shevá)
com transliteração e aproximação em português. O app usa isso em dois lugares:
`SyllableTrainer` (modo aprendizado, resposta na tela) e o gerador
`syllable-reading` - cujas alternativas são *transliterações*, não sílabas.

Ou seja: o aluno nunca precisa **produzir** uma sílaba, nunca associa **sinal →
som** isoladamente, e nunca ouve duas sílabas mínimas em oposição. `nikud.json`
existe e só aparece em `/inicio`, uma vez, como texto.

Isso é a maior lacuna do curso em relação à sua própria promessa: decodificar
hebraico é consoante + vogal, repetido rápido.

### 2.3 O modelo de domínio é unidimensional - **crítico**

`isLessonComplete()` = `stagesDone.length >= 5`. É tudo. O sistema não sabe
distinguir um aluno que **reconhece** ם mas não sabe **escrever**, de um que
escreve bem e confunde o **som**. O SRS guarda um item por id de exercício e
deriva a letra com `ex.id.split('-')[0]` - frágil e grosso.

E `confusableWith` (que já existe por letra, bem escolhido) alimenta os
distratores, mas **a resposta errada escolhida não é registrada**. O sistema não
pode saber que *este* aluno troca ד por ר, que é precisamente a informação que
tornaria a revisão inteligente.

### 2.4 A escrita é um canvas e nada mais - **alto**

`WritingCanvas` faz o básico bem (pointer events, `setPointerCapture`,
`touch-none`, devicePixelRatio) e para aí:

- **não há animação de ordem dos traços** - o SVG é estático;
- **não há progressão** modelo → traçar → guia esmaecido → livre; há duas abas;
- **não há nenhum retorno** ao aluno ("não há correção automática aqui" está
  escrito no componente como decisão de projeto - defensável em v1, insuficiente
  agora);
- **bug real:** `resize()` redimensiona o canvas, e redimensionar um canvas o
  apaga. O `ResizeObserver` dispara quando a barra de URL do celular recolhe -
  ou seja, **o traço do aluno some no meio da escrita**;
- traços são `lineTo` puro, sem suavização nem `getCoalescedEvents()`, o que dá
  um traço anguloso em dedo rápido.

### 2.5 Não existe prática fora do trilho - **alto**

Só há um caminho: lição → checkpoint → lição. A revisão são 5 questões geradas
das letras fracas. Depois de terminar o alfabeto **não sobra nada para fazer**, e
durante o curso não há como praticar só sílabas, só audição ou só as letras
parecidas.

### 2.6 O retorno é genérico - **médio**

`explainPt` é uma string por exercício, igual para qualquer alternativa errada.
Escolher מִ ouvindo מַ e escolher מוֹ ouvindo מַ recebem o mesmo texto. O erro
mais informativo do curso é desperdiçado.

Também não há **dica progressiva** (pista → áudio → resposta): ou o aluno sabe,
ou erra.

### 2.7 A transliteração some, mas ninguém percebe - **médio**

`supportLevel()` é uma boa ideia bem implementada: até 8 letras a leitura vem
impressa, até 16 custa um toque, depois é preciso pedir. Só que o aluno nunca é
avisado de que isso está acontecendo, e **a primeira leitura sem apoio não é
comemorada** - que é justamente o momento emocional que o curso promete.

### 2.8 Ausências completas - **médio/baixo**

- Nenhum conteúdo histórico ou cultural (é o item que mais eleva valor percebido
  por hora de trabalho).
- As 17 cenas do mundo real são passivas (revelar resposta), não são missão.
- Checkpoints usam os mesmos oito geradores, só que doze deles - não parecem um
  evento.
- Nenhum aquecimento ao voltar depois de dias.
- Nenhum "caderno de erros" visível.

### 2.9 Riscos e bugs encontrados

| # | Onde | Gravidade |
| --- | --- | --- |
| 1 | `WritingCanvas.resize()` apaga a tinta ao redimensionar (barra de URL do celular) | alto |
| 2 | `letterIdOf()` deriva a letra do id por `split('-')[0]` - quebra se um id mudar de forma | médio |
| 3 | `finishStage(letterId, stage, units?)` infere o total de etapas pela presença de `units` (`const total = units === undefined ? 5 : 3`) - acoplamento implícito | médio |
| 4 | `recordAnswer` ignora a alternativa escolhida | médio (perda de dado) |
| 5 | `data/letters.json` mem e tav têm `wordsToRead` vazio (aviso V12) - a lição 1 e 2 caem em prática só de sílabas | aceito por projeto, mas limita |

---

## 3. Plano priorizado

> **Estado em 18/09/2026:** P0 inteiro e P1.1-P1.5 estão implementados e no ar.
> O que sobrou está listado no fim deste documento, em §5.

**P0 - fundações. Nada de valor se constrói sem elas.**

| # | O quê | Por quê |
| --- | --- | --- |
| P0.1 | Estado v2: domínio por habilidade (reconhecer/som/ler/escrever/ouvir) + pares confundidos, com migração não destrutiva do v1 | destrava revisão adaptativa, painel honesto e geração dirigida por fraqueza |
| P0.2 | Motor de exercícios v2: tipos novos (construir sílaba, construir palavra, emparelhar, ouvir sílaba, digitar, achar a diferente, identificar vogal), cada exercício declarando explicitamente letra e habilidade, com retorno por alternativa | acaba com a monocultura e cobre as modalidades que faltam |
| P0.3 | Sistema de traçado: ordem dos traços animada, fluxo assistir → traçar → guia fraco → livre, correção tolerante, e o comportamento de toque no celular (a página não pode se mexer) | o item mais pedido e o mais quebrado |
| P0.4 | Camada de audição + Laboratório de Sons (consoante × vogal), e o plano de gravação estendido | a promessa "som" hoje depende de gravações que ainda não existem |

**P1 - o que transforma um bom curso em um produto.**

| # | O quê |
| --- | --- |
| P1.1 | Academia de Leitura: prática avulsa por modo, só com material já desbloqueado |
| P1.2 | Revisão adaptativa v2: dirigida por confusão, recuperação antes da explicação, dicas progressivas, aquecimento ao voltar |
| P1.3 | Marcos de independência: comemorar a primeira leitura sem transliteração |
| P1.4 | Checkpoints de modalidade mista e desafio final no mundo real |
| P1.5 | Ritmo micro: etapas curtas com recompensa por passo em vez de rolagem longa |

**P2 - valor percebido.**

| # | O quê |
| --- | --- |
| P2.1 | Camada de história e cultura desbloqueável (fatos conferidos) |
| P2.2 | Missões de leitura no mundo real a partir das cenas que já existem |
| P2.3 | Leitura cronometrada contra o próprio tempo anterior |
| P2.4 | Caderno de erros visível |

**P3 - depois.**

Gravar e comparar a própria voz; hebraico manuscrito como bônus; nivelamento
para quem já sabe alguma coisa; evolução histórica das letras (precisa de
material verificado).

---

## 4. Princípios que este plano não vai violar

1. **A regra da ordem vale para tudo que for novo.** Todo exercício gerado passa
   por `violatesOrderRule()` no teste que enumera o curso.
2. **Nenhuma voz sintética.** Um exercício de audição sem gravação não existe.
3. **Nenhuma string hebraica é invertida, fatiada por caractere ou montada com
   pontuação dentro.** Tudo passa por `clusters()` e `<He>`.
4. **Progresso salvo não se perde.** Toda mudança de formato migra o estado v1.
5. **Correção tolerante.** Um dedo num vidro de 6 polegadas não desenha
   caligrafia; reprovar um traço razoável é pior do que não corrigir.


---

## 5. O que ficou de fora (e por quê)

Implementado nesta rodada: P0.1 a P0.4, P1.1 a P1.4, P2.1 e P2.2.

Ainda aberto, em ordem de valor:

| # | O quê | Por que não agora |
| --- | --- | --- |
| 1 | **As gravações** | Só você pode fazê-las. O kit está pronto: 321 clipes planejados, roteiro impresso, conferidor, e o app já sabe o que fazer quando cada arquivo chegar. Nada de audição existe até lá, por decisão. |
| 2 | Leitura cronometrada com histórico por modo | O modo existe e guarda o tempo; falta o gráfico de evolução. |
| 3 | Gravar e comparar a própria voz | Depende das gravações de referência. |
| 4 | Nivelamento para quem já sabe alguma coisa | Precisa de uma decisão sua sobre o que pode ser pulado. |
| 5 | Evolução histórica das letras, em imagens | Precisa de material verificado; o texto está escrito, a imagem não. |
| 6 | Hebraico manuscrito como bônus separado | A cursiva já é o que se treina na escrita; um módulo de leitura de manuscrito é outra coisa. |
| 7 | Revisão nativa da ordem dos traços e da cursiva | Continua pendente desde a primeira rodada. |

### Riscos que continuam de pé

1. **As 10 cartas de história e cultura precisam da sua revisão.** Cada uma traz
   a base da afirmação, mas datas e formulações merecem uma conferência antes de
   publicar.
2. **As 17 cenas de «mundo real» são autoradas**, não coletadas - contextos
   plausíveis escritos a partir do vocabulário do curso.
3. **Sem áudio, três dos dezesseis tipos de exercício não existem.** O curso
   funciona; a dimensão "ouvir" fica em branco no painel de domínio, o que é
   honesto e visível.

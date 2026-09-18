# Hebraico Fluente — o curso interativo

Documento de arquitetura. Escrito antes do código, e mantido como referência.

---

## 0. A correção mais importante: qual é a fonte da verdade

O briefing pede para extrair o conteúdo **do PDF**. Não é o caminho certo aqui,
e vale explicar por quê antes de qualquer outra coisa.

O PDF de 331 páginas não é a origem do curso — é uma **saída** dele. Ele é
gerado por `scripts/build.js` a partir de:

```
data/letters.json     22 letras: som, sílabas, vocabulário, erro típico, nota cultural
data/modules.json     o plano de aulas: 7 unidades, 22 lições, quem ensina o quê
data/nikud.json       os seis sons vocálicos, por SOM e não por nome
data/translit.json    294 entradas — a tabela canônica de transliteração
data/icons.json       68 palavras → ilustração
```

Extrair do PDF significaria fazer OCR de texto hebraico pontuado — a operação
com maior taxa de erro que existe em processamento de documentos, porque o
nikud são marcas combinantes que o extrator reordena ou descarta. Nós faríamos
isso para recuperar, com perdas, exatamente os dados que já estão em disco em
JSON validado.

**Então: o curso lê `data/`.** O PDF continua sendo o workbook impresso —
complementar, como o briefing pede na seção 27 —, e o app aponta para as
páginas certas dele. Um build step (`npm run export-content`) transforma
`data/` no conteúdo tipado que o app consome, o que garante que **o app e o
livro nunca divergem**: mudou a palavra no JSON, mudou nos dois.

Isso também preserva o que o briefing pede de verdade na seção 2 (respeitar a
progressão do autor), com uma garantia mais forte do que uma leitura manual
daria: as 17 regras de `scripts/validate.js` continuam valendo, inclusive a V1
— nenhuma palavra usa letra ainda não ensinada.

### Um conflito no briefing, sinalizado e não resolvido em silêncio

O briefing pede o *vertical slice* com **Mem, Shin, Lamed, Bet/Vet + Revisão 1**.
Essa era a ordem antiga do workbook. A ordem foi trocada na sessão anterior,
a seu pedido, para a do guia do docente «בא לי עברית!», e hoje o Módulo 1 é:

```
מ ת א · נ ה י   →   Checkpoint 1
```

Shin é a letra 9, Lámed a 10, Bet a 20 — estão em três módulos diferentes.
Construir o slice com elas significaria ou voltar à ordem antiga (que o próprio
briefing proíbe na seção 2) ou inventar um agrupamento que o workbook não tem
(proibido na seção 4).

**Decisão:** o slice é o **Módulo 1 completo — as seis letras e o Checkpoint 1**,
porque a seção 4 do briefing manda usar a estrutura de revisão do workbook como
base dos marcos. São 6 letras em vez de 4, e o checkpoint é real, não sintético.

---

## 1. A pedagogia detectada

O workbook não é uma lista de letras. É um curso com quatro mecanismos, e todos
os quatro precisam sobreviver à digitalização.

### 1.1 A regra da ordem (é o coração do método)

Uma palavra só aparece para leitura quando **todas** as suas letras já foram
ensinadas. Não é uma diretriz — é uma regra de build: `validate.js` V1 falha a
compilação e nomeia a letra ofensora.

Consequência para o app: **a tela nunca pode mostrar um distrator, um exemplo ou
uma palavra de revisão que use letra futura.** O motor de exercícios precisa
receber o "alfabeto disponível até aqui" e filtrar por ele. Isso é uma
invariante do produto, não um detalhe — e está testada.

```
letra 3  (א)  alfabeto: מ ם ת א          →  אִמָּא, אֶמֶת
letra 12 (ו)  alfabeto: … ג ד ש ל ר ו    →  שָׁלוֹם, תּוֹדָה, מוֹרָה
letra 20 (ב)  alfabeto: … + ב            →  טוֹב finalmente pode ser lido
```

### 1.2 As cinco etapas de cada letra

Toda letra tem a mesma espinha, e é dela que sai o template de lição:

| Etapa | No livro | No app |
|---|---|---|
| P1 | conhecer a letra · som · sílabas | Introdução + Ouvir + SyllableTrainer |
| P2 | palavras úteis + exercícios | WordReveal + reconhecimento |
| P3 | escrever: modelo, traçado, cópia | WritingCanvas |
| P4 | praticando a leitura | exercícios mistos |
| P5 | fixação + ditado | QuickQuiz |

### 1.3 As palavras-ponte

O método do guia do docente: a letra nova é encontrada **dentro de uma palavra
emprestada que o brasileiro já conhece** — טרמינל, פלאפל, אמבולנס. São
reconhecimento, nunca leitura: estão cheias de letras ainda não ensinadas, e é
esse o ponto. 89 delas, em `bridgeWords`.

No app isso abre a etapa 2 de cada lição — a da letra, não a do módulo, porque
uma palavra-ponte fala de UMA letra e é ali que ela é útil: *"você já conhece
estas palavras, só nunca as viu escritas assim"*. É a melhor arma que o curso
tem contra o "hebraico é impossível".

### 1.4 O erro típico de brasileiro

Cada letra carrega `brazilianMistake: { wrong, right, why }` — o que costuma
sair, o que é certo, e por que o português empurra para o erro. Não é dica
genérica: é interferência L1 documentada letra a letra. Vira o componente
`<BrazilianTip>`, visualmente proeminente, como o briefing pede.

---

## 2. Arquitetura da informação

```
/                     Dashboard — "o que eu faço hoje?"
/onboarding           3 perguntas, uma vez
/mapa                 Course map vertical
/modulo/[n]           Abertura do módulo + palavras-ponte
/licao/[letterId]     A lição (5 etapas, navegação por passos)
/checkpoint/[n]       Revisão de módulo
/revisao              Revisão rápida (spaced repetition)
/conquistas           Achievements
/desafio-final        O desafio final
/concluido            Conclusão + próximo nível
```

Mapa do curso, derivado de `modules.json` + `letters.json`:

```
Começar aqui
│
├─ Como o hebraico funciona · direção · os sinais de vogal
│
MÓDULO 1 · As seis primeiras letras
│  מ · ת · א · נ · ה · י
│  ◆ Checkpoint 1
│
MÓDULO 2 · Cinco consoantes familiares
│  ג · ד · ש · ל · ר
│  ◆ Checkpoint 2
│
MÓDULO 3 · O vav, o zayin e os sons da garganta
│  ו · ז · ח · ט          ◆ Checkpoint 3
│
MÓDULO 4 · Sámech, áyin, tsadi e qof
│  ס · ע · צ · ק          ◆ Checkpoint 4
│
MÓDULO 5 · As três letras com ponto
│  ב · כ · פ              ◆ Checkpoint 5
│
MÓDULO 6 · Sem o ponto — formas suaves e as 5 finais
MÓDULO 7 · Os sons modernos — צ׳ ג׳ ז׳
│
◆ DESAFIO FINAL
```

---

## 3. Esquema de conteúdo

O app **não** lê `data/letters.json` diretamente: um exportador
(`tools/export-content.mjs`) o transforma em conteúdo tipado, calculando de uma
vez as coisas que a UI precisaria recalcular a cada render — sobretudo o
alfabeto acumulado e os distratores legais.

```ts
type Letter = {
  id: string; order: number; module: number; lesson: number;
  letter: string; finalForm: string | null;
  nameHe: string; namePt: string; translit: string; sound: string;
  soundNotePt: string;
  brazilianMistake: { wrong: string; right: string; why: string };
  didYouKnow: string;
  confusableWith: string[];
  syllables:  { vowel: string; he: string; translit: string; ptApprox: string }[];
  wordsToRead:      Word[];   // leitura — respeita a regra da ordem
  wordsToRecognize: Word[];   // reconhecimento — pode usar letra futura
  bridgeWords: { he: string; pt: string }[];
  alphabetSoFar: string[];    // PRÉ-CALCULADO — a regra da ordem, materializada
  strokeOrderSvg: string | null;
  workbookPages: { from: number; to: number };   // link para o PDF
};

type Word = { he: string; translit: string; pt: string; audioId: string | null };
```

Os exercícios **não** ficam no JSON de conteúdo. São *gerados* por um motor
determinístico a partir do conteúdo + do alfabeto disponível, porque:

- escrever à mão 22 × 8 questões seria o oposto de "data-driven";
- um gerador não consegue violar a regra da ordem, um autor humano consegue;
- as mesmas primitivas servem lição, checkpoint, revisão rápida e desafio final.

```ts
type Exercise =
  | { kind: 'letter-recognition';  prompt: string; options: string[]; answer: number }
  | { kind: 'audio-recognition';   audioId: string; options: string[]; answer: number }
  | { kind: 'syllable-reading';    he: string; options: string[]; answer: number }
  | { kind: 'word-meaning';        he: string; options: string[]; answer: number }
  | { kind: 'complete-word';       parts: (string|null)[]; options: string[]; answer: number }
  | { kind: 'match';               pairs: { a: string; b: string }[] }
  | { kind: 'print-vs-cursive';    letter: string; options: string[]; answer: number }
  | { kind: 'final-form';          letter: string; options: string[]; answer: number };
```

Semente determinística por (lição, índice): o mesmo aluno vê o mesmo exercício
ao voltar, e dois alunos veem o mesmo curso. Nada de `Math.random()`.

---

## 4. Gamificação

Contida, e ancorada em aprendizado real.

| Evento | XP | Critério |
|---|---|---|
| Etapa de lição concluída | 5 | por etapa, 5 etapas por letra |
| Lição concluída | 20 | todas as etapas |
| Quiz perfeito | +10 | sem erro na primeira tentativa |
| Checkpoint aprovado | 50 | ≥ 70% |
| Revisão rápida | 15 | 5 questões respondidas |
| Meta diária batida | 5 | uma vez por dia |

Regras que evitam XP vazio: **repetição não paga de novo** (o bônus de quiz
perfeito é uma vez por letra), e XP só conta em exercício respondido, nunca em
navegação.

**Sequência (streak).** Um dia conta quando o aluno cumpre a meta que escolheu
(5/10/15/20 min de prática efetiva, medida em exercícios respondidos e não em
aba aberta). Quebrou: sem punição, sem perder XP, sem tela de vergonha —
`"Seu progresso continua aqui. Vamos retomar?"`. A sequência mais longa fica
registrada, então o aluno não perde o recorde, só o contador.

**Revisão espaçada.** Leve, por design. Cada item errado entra num pool com
`{ itemId, misses, lastSeen, box }`; caixas Leitner de 5 níveis com intervalos
1/2/4/8/16 dias. O dashboard mostra os **pares confundíveis** que o aluno de
fato erra — e `confusableWith` já dá o vocabulário desse diagnóstico
(`ד`/`ר`, `מ`/`ס`, `ב`/`ו`).

**Conquistas.** Sem troféu de desenho animado: tipografia e um selo discreto.
Primeira letra · Primeira palavra lida · Módulo 1 · Metade do alfabeto ·
Checkpoint perfeito · 3 dias · 22 letras · Leitor de hebraico.

---

## 5. Sistema visual

A identidade sai do workbook — `styles/tokens.css` já foi extraído do PDF de
referência com proveniência por token — e é adaptada para tela.

```
Tinta        #030303 títulos · #464646 corpo · #6E6E6E apoio
Teal         #1A99BA acento · #15788F faixa (escurecido: 4.9:1, o original falha AA)
Menta        #D4F7EC superfícies calmas, badges, acerto
Papel        #F5F5F5 fundo · #FFFFFF cartões
Tipografia   display para títulos e hebraico · UI para português
Hebraico     Noto Sans Hebrew (55 marcas de nikud, tabela ccmp) + cursiva Gveret Levin
```

Princípio de composição: **o hebraico é o assunto, logo é o maior elemento da
tela.** Em exercício de leitura o hebraico fica em 56–96px e o português de
apoio em 14–16px. O oposto do que um dashboard SaaS faria.

Movimento: transições curtas (120–200ms), `prefers-reduced-motion` respeitado
em tudo, celebração forte reservada para checkpoint e conclusão.

---

## 6. Riscos técnicos

### 6.1 RTL e nikud — o risco número um, e já resolvido uma vez

Este projeto já tem um **contrato de direção** (`scripts/lib/render.js`), escrito
depois que o PDF de referência apresentou três bugs reais de bidi — incluindo um
exercício de ligar que se re-pareava sozinho e **ensinava a resposta errada**.

O contrato porta para o React sem mudança conceitual:

- todo hebraico passa por um único componente `<He>`; nenhum outro lugar emite
  caractere hebraico;
- `unicode-bidi: isolate` em cada span, sempre;
- **pontuação nunca entra no span** — parênteses, dois-pontos e barras são
  neutros e se movem;
- listas de leitura usam um container RTL isolado com os itens em ordem DOM;
- nada de `.split('').reverse()`: um caractere hebraico pontuado tem 2 a 4
  codepoints, e reverter destrói a palavra.

Um teste de unidade replica as regras V8/V9 sobre o HTML renderizado.

### 6.2 Escrita à mão

Sem correção automática na v1, como o briefing determina. Canvas com pointer
events (mouse, toque, caneta), modelo cursivo por baixo, setas de ordem de
traçado vindas dos 27 SVG que já existem em `assets/stroke-order/`, e
autoavaliação. O risco real é de *layout*: canvas em tela pequena com o teclado
virtual aberto. Mitigação: canvas de altura fixa em `dvh`, sem input de texto na
mesma tela.

### 6.3 Áudio

**Não existe áudio gravado**, e o caminho até ele está pronto de ponta a ponta.

Não há síntese como substituto, de propósito. A voz `he-IL` dos navegadores
ignora o nikud, e num curso cuja promessa inteira é *esta letra faz este som*
uma pronúncia errada com ar de autoridade é pior do que silêncio: o aluno não
tem como perceber o erro e passa a ensaiá-lo. Enquanto não houver gravação:

- cada item carrega `audioId` — hash estável do hebraico pontuado;
- o `<AudioButton>` procura `/audio/<id>.mp3` e, não achando, mostra
  **"áudio em breve"** — desabilitado, rotulado, nunca quebrado em silêncio;
- os exercícios de audição são **retirados do quiz**, não transformados em
  adivinhação (`buildLessonQuiz` recebe `audioAvailable` e um teste garante que
  nenhum aparece enquanto o manifesto estiver vazio).

**O kit de produção** (`npm run audio-script` · `npm run check-audio`):

```
data/audio.json               311 clipes em 3 ondas — GERADO
audio/roteiro-de-gravacao.pdf 19 páginas: briefing de voz, briefing técnico,
                              plano, e cada clipe numerado com o hebraico
                              pontuado, a leitura, o significado e o NOME DO
                              ARQUIVO que a tomada tem de virar
audio/                        onde as gravações entram
```

Três decisões que valem explicar:

1. **O nome do arquivo é um hash do hebraico pontuado, não uma posição.**
   Numerar 001, 002, 003 quebraria tudo o que já foi gravado no dia em que uma
   palavra entrasse na letra 3. Com hash, acrescentar palavra só cria um clipe
   novo.
2. **O número impresso é estável, a ordem do roteiro não.** O número vai para o
   papel e não pode mudar no meio de uma sessão, então números já atribuídos são
   lidos de volta e preservados. O roteiro, por outro lado, é ordenado pela
   ordem do curso — o falante trabalha letra a letra, e os números simplesmente
   saem fora de ordem.
3. **Um clipe por som, não por aparição.** A lista sem nikud do módulo 6 aponta
   para o gêmeo pontuado: `ספר` e `סֵפֶר` são a mesma palavra dita do mesmo
   jeito, e pedir as duas desperdiça estúdio e convida a duas tomadas
   diferentes de uma palavra só.

**Ondas**, por ordem do que destrava mais:

| Onda | Conteúdo | Clipes | Sessão |
|---|---|---|---|
| 1 | nomes das letras, sílabas, sinais de vogal | 158 | ~40 min |
| 2 | o vocabulário de leitura | 99 | ~25 min |
| 3 | reconhecimento, módulos 6 e 7, «no mundo real» | 54 | ~14 min |

Só a onda 1 já faz toda lição ter áudio no que importa.

**A ingestão é largar o arquivo.** `npm run check-audio` reporta cobertura por
onda e três problemas, sendo o terceiro o que mais custa: *faltando*, *órfão*
(a palavra saiu do curso — arquivar) e **desconhecido** — arquivo cujo nome não
bate com clipe nenhum, quase sempre nome digitado errado, o que significa uma
tomada que existe e está invisível. Depois disso, `npm run export-content` leva
o que houver para o app e o botão vira play sozinho. Verificado: com um arquivo
solto em `audio/`, o "áudio em breve" da letra Mem virou "Ouvir a letra" com
0,7×, sem tocar em código.

`tests/audio.test.ts` confere o contrato dos dois lados — `gen-audio.mjs` nomeia
o que o falante grava e `export-content.mjs` nomeia o que o app pede; se os dois
divergirem, o app pede arquivos que ninguém gravou e todo botão fica "em breve"
para sempre.

### 6.4 Supabase

Não há projeto Supabase provisionado nesta sessão, e criar um exigiria
credenciais suas. A persistência é escrita atrás de uma interface
(`ProgressStore`) com **dois adaptadores**: `LocalProgressStore` (padrão,
funciona agora, offline) e `SupabaseProgressStore` (escrito, com o SQL do
schema em `supabase/schema.sql`, **não conectado**). Trocar é uma linha quando
você tiver as chaves.

### 6.5 Regra da ordem no runtime

O maior risco de regressão pedagógica é um distrator com letra futura. Mitigação:
o gerador de exercícios só recebe `alphabetSoFar`, e há teste de unidade que
percorre as 22 lições e falha se qualquer opção de qualquer exercício gerado usar
letra fora dele.

---

## 7. Estrutura de pastas

```
app/
  ARCHITECTURE.md              este documento
  package.json
  next.config.ts  tsconfig.json  vitest.config.ts
  public/
    fonts/                     Noto Sans Hebrew + Gveret Levin (copiados de assets/)
    stroke-order/              os 27 SVG
    audio/                     vazio — ver §6.3
  content/                     GERADO por tools/export-content.mjs
    course.json                módulos, ordem, checkpoints
    letters/<id>.json          uma letra por arquivo
    nikud.json
  src/
    app/                       rotas (App Router)
    components/
      shell/                   AppShell, nav, transições
      hebrew/                  He, HebrewLetter, HebrewList, HebrewCloze, HebrewKeyboard
      learn/                   SyllableTrainer, WordReveal, BrazilianTip, RealWorldHebrew,
                               MultipleChoice, MatchExercise, CompleteWord, WritingCanvas,
                               QuickQuiz, Checkpoint, ReviewSession
      game/                    XPIndicator, StreakCard, ProgressBar, Achievement, DailyGoal
      ui/                      Button, Card, Badge, Sheet, Skeleton…
    lib/
      content.ts               carrega e tipa o conteúdo
      engine/
        exercises.ts           gerador determinístico
        rng.ts                 PRNG semeado
        srs.ts                 Leitner
      state/
        store.ts               ProgressStore (interface)
        local.ts               adaptador localStorage
        supabase.ts            adaptador Supabase (não conectado)
        xp.ts  streak.ts  progress.ts
      analytics.ts             fila de eventos, sem PII
    styles/tokens.css
  tests/                       vitest — xp, streak, progress, srs, ordem, bidi
  supabase/schema.sql
```

---

## 7.1 O que a auditoria do protótipo encontrou (STEP 6)

Rodada com Playwright em 21 rotas a 375/390/430/1100px, checando o contrato de
direção no DOM renderizado (o equivalente das regras V8/V9 do livro), overflow
horizontal, alvos de toque e rótulos. Quatro defeitos reais, todos corrigidos:

1. **Hebraico solto em três telas.** `milestonePt` e `subPt` vinham dos dados
   com o hebraico marcado `{{…}}`, e três lugares tiravam as chaves com um
   `.replace()` em vez de renderizar com `<Prose>`. O resultado era hebraico
   cru dentro de uma frase em português, sem isolamento — exatamente a falha
   que o contrato existe para impedir. Agora os três passam por `<Prose>`.
2. **A letra do logo** estava fora de um span `.he`. Uma exceção "inofensiva" é
   como um contrato deixa de ser um contrato; passou a usar `<He>`.
3. **A letra 1 tinha um quiz de três perguntas.** A regra da ordem estava sendo
   aplicada também aos distratores de uma letra só, e com apenas {{מ}} e {{ם}}
   conhecidos não sobrava opção legal. As duas regras foram separadas: o que o
   aluno LÊ (palavra, sílaba) obedece à ordem; um distrator de uma letra só
   pode ser qualquer letra — distinguir {{מ}} de {{ס}} não exige conhecer
   {{ס}}, e é assim que o próprio workbook monta os distratores. Um teste
   garante cada uma das duas regras, e outro exige no mínimo 5 questões por
   letra.
4. **Alvos de toque pequenos**: o seletor de etapas da lição (29px), os links
   "← Mapa" e "fazer a lição". Todos a 44px.

Também detectado e corrigido antes da auditoria, pelo teste: opções duplicadas
no exercício de forma final (as listas de distratores se sobrepunham, e a
pergunta passava a ter duas respostas certas).

Auditoria atual: **limpa**. 41 testes, 45 páginas estáticas, 0 overflow.

---

## 7.2 O curso inteiro (segunda rodada)

As 16 letras restantes já funcionavam — são geradas dos mesmos dados. O que
faltava de verdade eram os **módulos 6 e 7**, que tinham abertura e nenhum
conteúdo, e três coisas que o briefing pede e que só fazem sentido com o curso
inteiro no ar.

**Módulos 6 e 7 viraram lições.** Não cabem no template de cinco etapas — não há
glifo novo para traçar nem tabela de sílabas —, então seguem as três lições do
próprio plano: 16/17/18 e 19/20/21. O conteúdo saiu de dentro de
`templates/extras.js` para `data/extras.json`, porque o livro e o curso precisam
exatamente das mesmas palavras e duas cópias de uma lista são duas chances de
divergir. A **V19** confere esse arquivo contra `letters.json`: o par com/sem
daguesh é mesmo daquela letra, as cinco finais são as cinco certas, a palavra
sem nikud é mesmo a pontuada sem nikud, e o gerech é U+05F3 e não um apóstrofo
ASCII.

**Leitura com apoio decrescente** (§6 do briefing). A transliteração aparece
sozinha até 8 letras, custa um toque até 16, e depois precisa ser pedida —
`supportLevel()`, função das letras dominadas e não de uma preferência, porque
uma preferência deixaria o aluno manter a muleta sem perceber.

**«Hebraico no mundo real»** virou dado: `data/real-world.json`, 17 cenas
(placa, rótulo, recibo, mensagem, jornal, vitrine), cada uma declarando a partir
de que letra pode aparecer. A **V18** falha o build se uma cena usar letra ainda
não ensinada — uma placa que o aluno não decifra é o oposto de uma recompensa.

### O bug que a simulação do curso inteiro encontrou

`tests/full-course.test.ts` joga o curso do começo ao fim — 24 dias, 22 letras,
7 checkpoints, os dois módulos extras e o desafio final — e confere o estado
final. Ele achou um defeito que nenhum teste unitário acharia:

> **A meta diária era inalcançável fazendo o curso.** Ela contava só exercícios
> respondidos, e uma lição de letra tem oito. Quem fizesse exatamente uma lição
> por dia — cinco etapas de leitura, escuta, traçado e escrita — nunca batia uma
> meta de dez minutos e nunca construía sequência. A maior parte do aprendizado
> deste curso não é responder alternativa.

A meta passou a contar **unidades de prática** de vinte segundos: um exercício
vale 1, uma etapa de lição vale 6 (≈2 min), uma lição dos módulos 6 e 7 vale 10
(elas são maiores — três pares de daguesh, cinco formas finais). Uma lição
completa passou a valer 38 unidades ≈ 12,7 min, que é o que ela é. O teste hoje
exige que **todo dia em que uma lição foi concluída bata a meta**.

---

## 8. Sinalizado para a sua revisão

1. **O slice começou no Módulo 1 (6 letras), não Mem/Shin/Lámed/Bet.** Ver §0.
   Hoje o curso inteiro está implementado: 22 letras, 7 módulos, 5 checkpoints,
   os dois módulos sem letra, revisão, desafio final e conclusão.
2. **Não há áudio.** Exercícios de audição ficam marcados como indisponíveis.
3. **Supabase não está conectado.** Progresso persiste em localStorage.
4. **`ch` para ח e כ** continua como está — decisão sua, já registrada.
5. **Letras 1 e 2 (מ, ת) não têm palavra inteira para ler.** No livro isso vira
   tabela de cópia de sílabas; no app, a etapa de leitura da lição 1 e 2 é
   substituída por sílabas, com a explicação na tela.
6. **As 17 cenas de «no mundo real» são autoradas, não coletadas.** São
   contextos reais (placa de rua, rótulo, recibo), mas escritos por nós a partir
   do vocabulário do curso — não fotografias nem transcrições. Vale a sua
   revisão de quem conhece Israel.

---

## 9. Segunda rodada — o que mudou (e por quê)

Escrita depois da auditoria em `AUDIT.md`. Resumo do que passou a existir e das
decisões que não são óbvias no código.

### 9.1 O modelo de aprendizagem tem cinco dimensões

`stagesDone.length >= 5` era todo o modelo de domínio. Ele não distingue quem
reconhece ם e não sabe escrever de quem escreve e erra o som — e o curso então
seguia com os dois.

Agora cada letra tem cinco habilidades — `rec`, `som`, `ler`, `ouvir`,
`escrever` — e **todo exercício declara qual delas testa**. Os níveis são
grossos de propósito (`novo`, `aprendendo`, `praticando`, `forte`, `revisar`):
"domínio 93,482%" é uma precisão que o dado não sustenta. O nível da letra é a
**habilidade mais fraca com evidência**, nunca a média — a média deixa um bom
leitor esconder um ouvido surdo.

`confusableWith` já dizia quais pares tendem a se misturar; agora o sistema
registra quais pares **este aluno** mistura, porque a alternativa errada
escolhida sempre esteve disponível e era jogada fora.

**Migração:** existe gente com estado v1 no navegador agora. `migrate.ts` é a
única porta de entrada, a chave nunca muda, todo passo só acrescenta, estado de
versão futura é recusado em vez de adivinhado, e os mapas novos começam
**vazios** — chamar cinco etapas concluídas de "forte" seria uma mentira sobre
a qual o sistema depois agiria, deixando de revisar letras que o aluno pode
muito bem ter esquecido.

### 9.2 Dezesseis tipos de exercício, oito deles gestos novos

O motor tinha oito geradores e todos produziam o mesmo gesto. Os novos são
ações diferentes: montar a sílaba (a operação central da leitura, que nunca era
pedida), montar a palavra da direita para a esquerda, emparelhar com dois
toques, digitar, achar a intrusa numa fileira, identificar a vogal, ouvir duas
sílabas mínimas, ler o som e achar a grafia.

Duas garantias novas: nenhum gesto se repete em duas questões seguidas
(`spread()`), e o retorno é **por alternativa** onde há o que dizer.

**Uma exceção à regra da ordem foi aberta, estreita e documentada:** o vav de
מוֹ e מוּ é *mater lectionis*, um sinal de vogal com forma de letra. O curso
sempre ensinou as seis sílabas desde a lição da própria letra; a regra agora
não exige conhecer vav para ler "mo". Só isso: vav com holam ou shuruk, nunca
no início da palavra, e nada equivalente para yod.

### 9.3 Escrita: quatro passos e a página que não se mexe

Ver a ordem dos traços (animada, a partir de `data/stroke-paths.json`, gerado do
mesmo contorno da fonte que o diagrama impresso) → traçar por cima → guia fraco
→ sem modelo. A correção é tolerante e mede duas coisas, porque uma só passa
pelos dois casos errados: `dentro` sozinho aprova um risco curto e perfeito no
meio da letra, `cobertura` sozinha aprova rabiscar tudo.

O comportamento de toque é requisito, não detalhe: `touch-action: none`,
`overscroll-behavior: contain`, pointer capture, e listeners **nativos e não
passivos** — o React não promete não-passivo, e `preventDefault()` num listener
passivo é ignorado em silêncio. Nada é desabilitado globalmente.

### 9.4 Academia de Leitura

Oito modos gerados pelo mesmo motor das lições, mais o laboratório de sons e a
escrita. É o que faz o curso continuar existindo depois da vigésima segunda
lição. O modo cronometrado corre contra **o próprio tempo anterior do aluno** e
contra mais nada.

### 9.5 Revisão que presta atenção

Três fontes em vez de uma: a fila do SRS, qualquer habilidade que caiu para
`revisar`, e os pares trocados — puxando **as duas letras** do par. E ela mira
na habilidade que está falhando, quando dá: quem lê ק e não escuta recebe
audição, não mais leitura.

### 9.6 O momento que o curso vende

A primeira palavra inteira lida com a transliteração já fora da tela é marcada,
datada e dita em voz alta. Era o que o curso inteiro estava construindo e
passava em silêncio.

### 9.7 História e cultura

Dez cartas opcionais, desbloqueadas por letras dominadas, fora do caminho.
Escritas à mão (não geradas), cada uma com a base da afirmação em `sources`, e
o arquivo está marcado como **precisando da sua revisão antes de publicar**.

---

## 10. O exame final e o certificado

O curso terminava num desafio: trinta perguntas, uma nota, fim. Uma nota
sozinha esconde a informação de que o aluno precisa, porque ler é várias
habilidades empilhadas e dá para ir bem em três delas e mesmo assim não ler.

**`lib/engine/exam.ts`** — cinco partes, seis quando houver gravações: as
letras, os sinais de vogal, sílabas, palavras, escuta e *hebraico de verdade*
(placas, rótulos, recibos). Cada uma com nota própria e, no relatório, um link
para treinar exatamente aquilo na Academia.

Três regras herdadas e uma própria:

- a regra de ordem vale aqui como em todo lugar;
- nada que dependa de gravação aparece antes de a gravação existir;
- nada novo é ensinado — exame que apresenta matéria é aula;
- **cada tentativa é um exame DIFERENTE.** A ordem das letras entra no seed,
  não só o embaralhamento das opções. Sem isso a segunda tentativa era a mesma
  prova (31 dos 35 itens repetidos) e o aluno estaria lembrando, não lendo.

A banda de reprovação não usa a palavra "reprovado" — há um teste que o
garante. Um adulto iniciante que ouve isso vai embora; o que ele precisa ouvir
é qual parte derrubou a nota e que a retomada é livre.

**`lib/certificate.ts` + `/certificado`** — sai de dois fatos e de mais nada:
as 22 letras concluídas e o exame aprovado (70%). Desenhado em canvas no
próprio aparelho, em quadrado ou paisagem; o Web Share leva o ARQUIVO no
celular. A imagem diz o que ele é e o que ele não é — não é diploma nem
certificação reconhecida.

O estado guarda o dia da PRIMEIRA aprovação (uma tentativa pior depois não tira
o certificado), a melhor nota, o número de tentativas e as partes da ÚLTIMA
sessão — não um composto do melhor de cada uma, que descreveria um exame que
nunca aconteceu.

---

## 11. A plataforma

Hebraico Fluente deixou de ser um curso com uma capa e passou a ser uma
plataforma: site público, catálogo, conta, compra e curso na mesma casa e no
mesmo sistema visual. A trilha é Alfabetização → A1 → A2 → B1, na mesma conta.

### 11.1 O catálogo é um arquivo

`data/courses.json` → `tools/export-content.mjs` → `app/content/courses.json` →
`lib/catalog.ts`. Quatro cursos com nível, objetivos, módulos, preço, parcelas,
desconto do PIX e meses de acesso.

Acrescentar um curso é acrescentar um objeto. `/cursos/<slug>` e
`/checkout/<slug>` são geradas do catálogo por `generateStaticParams`, e o
painel passa a oferecê-lo sozinho — nenhuma rota a escrever.

Uma única coisa é resolvida na exportação em vez de copiada: um curso que diz
`modulesFrom: "alfabetizacao"` recebe os módulos do `course.json` de verdade.
A página de vendas não pode prometer módulos diferentes dos que o curso tem.

`status: 'soon'` é conteúdo real, não marcador: um curso que ainda não existe
tem página, módulos e objetivos, porque é assim que o aluno decide continuar
depois da alfabetização. O que ele não tem é botão de compra. E `engine: null`
fecha a porta mesmo que alguém marque o curso como disponível por engano.

### 11.2 A conta

`lib/account/` — uma interface (`PlatformApi`) e duas implementações:

| | `worker` | `local` |
|---|---|---|
| onde | produção | `npm run dev`, GitHub Pages |
| guarda | D1 | localStorage do visitante |
| cobra | Mercado Pago | nada |
| escolhido por | `NEXT_PUBLIC_PLATFORM_API=worker` | o padrão |

O adaptador local guarda senha com o MESMO PBKDF2 de 310.000 iterações do
servidor. Um mock que guarda senha em texto puro ensina o formato errado a quem
for ler o código depois, e mais cedo ou mais tarde alguém copia o mock. E ele
não se disfarça: `DemoNotice` diz, em toda página, que nada ali é cobrança real.

**O portão espera.** Enquanto `/api/me` não respondeu, a resposta não é "não
está logado" — é "ainda não sei". Confundir as duas manda para a página de
vendas quem já pagou, toda vez que ele recarrega. É por isso que `ready` é
separado de `session` em `account/store.tsx` e todo portão espera por ele.

**O progresso continua sendo do APARELHO**, não da conta. É escolha, não
esquecimento: o curso funciona sem conta desde o primeiro dia, e sincronizar
exige decidir o que fazer quando dois aparelhos discordam — um problema de
fusão, não de armazenamento. Está dito na FAQ e na página de perfil, onde a
pessoa está olhando os próprios números.

### 11.3 O servidor

`worker/` — Cloudflare Worker à frente dos arquivos estáticos, D1, cookie de
sessão assinado, Mercado Pago.

O **cookie carrega só identidade**. Não carrega o que a pessoa comprou. Pôr os
cursos dentro dele economizaria uma consulta por requisição e faria um estorno
levar até sete dias para fechar a porta. O cookie diz QUEM; o banco diz O QUÊ.

O **direito de acesso é uma linha por curso** (`entitlements`), não um campo
`pago_ate` na conta. Com um campo só, o dia em que o A1 sair exige migrar todo
mundo e reescrever cada consulta.

O **preço sai de `data/courses.json`, lido pelo próprio Worker**. Nunca do
corpo da requisição. Uma API que aceita `{ amount: 1 }` vende o curso por um
real, e isso é o primeiro teste de qualquer um que abra as ferramentas de
desenvolvedor.

**Três caminhos, uma função de liberação.** Um pagamento chega por webhook
(assinado), por `verify` (o comprador está com a tela aberta) ou pela varredura
do cron (de cinco em cinco minutos). Os três chamam o mesmo `applyPayment`. Um
caminho só não basta — webhook se perde, aba fecha, e o cron sozinho faria o
comprador esperar dez minutos olhando para "aguardando". Três caminhos
redundantes com UMA regra de liberação é resiliência sem divergência.

Quatro travas em `applyPayment`, cada uma fechando um jeito conhecido de dar o
curso de graça: evento repetido não faz nada (UNIQUE em `payment_events`);
pedido já pago não faz nada; valor menor que o pedido não libera; moeda
diferente não libera.

**O webhook é verificado e mesmo assim não é acreditado.** A assinatura
(`x-signature`, HMAC-SHA256, com janela de cinco minutos contra reenvio) prova
QUEM mandou. O status vem de uma consulta nossa à API. Sem
`MP_WEBHOOK_SECRET` configurado, a rota recusa tudo — falhar fechado, porque um
webhook sem verificação é uma rota pública que libera curso.

**Acesso nunca sai dos parâmetros do redirect.** A volta da Mercado Pago traz
`status=approved` na URL e qualquer pessoa consegue digitar isso na barra de
endereço. `ObrigadoClient` usa da URL apenas o id do pedido — qual conferir.

### 11.4 O que o portão NÃO resolve  ⚠

`worker/src/gate.js` recusa as rotas pagas sem cookie: ninguém abre
`/licao/alef/` por um link e lê a lição.

**Mas o conteúdo em si ainda viaja no pacote JavaScript.** O curso é um app
estático, e as palavras, as lições e os exercícios estão dentro dos arquivos de
`/_next/`, que são servidos livremente — têm de ser, porque a página pública os
carrega. Quem souber abrir a aba de rede baixa o conteúdo sem pagar.

Fechar isso exige a outra metade, planejada e não escrita: o conteúdo sair do
pacote e passar a ser buscado em `/api/content/*`, atrás do mesmo cookie. Até
lá, **isto é um portão de produto, não controle de acesso**, e não deve ser
descrito a ninguém como proteção de conteúdo.

### 11.5 Duas implantações

| | produção | prévia |
|---|---|---|
| onde | Cloudflare Workers | GitHub Pages |
| workflow | `deploy-worker.yml` | `deploy-app.yml` |
| build | `NEXT_PUBLIC_PLATFORM_API=worker` | sem a variável |
| contas | D1 | navegador do visitante |
| tarja | não | sim |

A prévia existe para revisar a interface inteira sem Cloudflare, sem banco e
sem chave de pagamento. A mesma base de código, uma variável de diferença.

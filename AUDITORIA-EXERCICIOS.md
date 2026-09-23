# Auditoria pedagógica dos exercícios

**Hebraico Fluente · 23 de setembro de 2026**

Feita contra o produto que está no ar (`main` em `984a418`), depois das
correções de 22/09. Todos os números aqui foram **contados**, não estimados:
um censo percorreu o motor de exercícios, montou a prática e a fixação das 22
letras com as mesmas sementes que o aluno recebe, e contou 528 itens. Os
mesmos scripts mediram a academia, os cinco checkpoints, o desafio final e os
seis jogos.

Onde este documento diz "medido", existe um número atrás. Onde diz "eu acho",
está escrito "eu acho".

Documentos anteriores continuam valendo como fundo: `AUDITORIA-PEDAGOGICA.md`
(21/09, o conteúdo), `RELATORIO-PRATICA.md` (a correção da prática por letra) e
`LACUNAS-PEDAGOGICAS.md`. Este aqui é a primeira auditoria feita **depois**
daquelas correções, e o resultado é desconfortável: as correções funcionaram no
que mediam, e revelaram um problema maior que ninguém estava medindo.

A proposta de painel administrativo pedida no item 16 está em arquivo próprio:
**`PAINEL-ALUNOS.md`**.

---

## Estado depois do P0 (23/09, mesmo dia)

Os seis itens do P0 da seção 12 foram feitos. Medido com o mesmo censo, as
mesmas sementes, os mesmos 528 itens:

| medida | antes | depois |
|---|---|---|
| itens de escolha múltipla | 84,1% | **81,1%** |
| habilidade `rec` / `ler` | 60% / 31% | **49% / 44%** |
| famílias de exercício por letra | 10 a 14 | **11 a 16** |
| fixações iguais à da letra anterior | 13 das 21 | **0** |
| sequências de fixação diferentes | 7 para 22 letras | **22 para 22** |
| "que vogal está escrita aqui?" | 8 | **24** |
| "ache a intrusa" | 2 | **25** |
| "complete a palavra" | 2 | **23** |
| "monte a palavra" | 1 | **16** |
| itens digitados nas lições | 0 | **44** (1 por prática, 1 por fixação) |
| letras que nunca voltavam (Vav, Záyin) | 2 | **0** - toda letra volta em n+1, 2, 4, 8 e 16 |
| fixação de Bet, Kaf, Pe, Shin com item de variante | 0 de 4 | **4 de 4** |
| jogos que gravam a habilidade certa | 0 de 6 | **6 de 6** |

Um defeito apareceu no caminho e foi corrigido junto: **o Enter que corrigia
um item digitado também pulava para o próximo**, então o aluno nunca via se
tinha acertado. Ele já existia na academia e no exame, onde "digitar"
aparecia; quando o item entrou nas lições, `exercicios.mjs` o acusou em todo
bloco. A varredura agora cobra as duas coisas - o Enter não pula, e a
resposta certa digitada é aceita.

Tudo travado em `app/tests/p0-exercicios.test.ts` (21 testes, 15 deles vistos
falhando contra o motor anterior).

---

## 1. Resumo executivo

O conteúdo é muito bom. A arquitetura é muito boa. **A experiência de
exercício é monótona de um jeito que os números explicam melhor do que
qualquer opinião.**

Três medições resumem o diagnóstico:

| medida | valor | o que significa |
|---|---|---|
| itens numa passagem pelas 22 letras | 528 | 24 por letra: 14 de prática, 10 de fixação |
| deles, respondidos tocando numa alternativa | **444 (84,1%)** | o aluno faz um gesto só, 444 vezes |
| habilidade `rec` (reconhecer a forma) | **319 itens (60,4%)** | `ler` fica com 31%, `som` com 9%, `ouvir` com 0% |

E o achado central, que é estrutural e não de conteúdo:

> **Da letra 3 (Tav) até a letra 11 (Resh), as nove lições entregam exatamente
> as mesmas dez famílias de exercício, na mesma ordem.** A fixação de Tav, de
> Resh e de Záyin é a mesma prova com outra letra dentro.

Isso não é acaso nem preguiça de quem escreveu: é consequência direta de como
as camadas foram montadas. Cada camada tenta uma lista de geradores em ordem e
fica com o primeiro que funciona - e o primeiro da lista quase sempre funciona.
O resultado é determinístico: sempre o mesmo. A seção 4 mostra a linha de
código.

E um segundo achado, sobre retenção: **a revisão das letras antigas é um
sorteio, não um intervalo.** Para um aluno que não erra, Vav e Záyin nunca
voltam em nenhuma das lições seguintes, e Shin volta uma vez em treze. A seção
3, problema 6, tem a tabela.

Nada disso é irreparável, e quase nada exige conteúdo novo. O motor tem 28
geradores; o curso usa 12 com regularidade, e 5 deles aparecem **uma ou duas
vezes no curso inteiro**. A capacidade já está paga. Falta usá-la.

**Veredito:** não venderia como produto premium hoje sem o bloco P0 da seção 12.
Com o P0 e o P1 feitos - trabalho de motor, não de conteúdo - o curso passa a
ter a variedade que o conteúdo já merece.

---

## 2. O que já funciona muito bem

Isto não é cortesia. São as decisões que sustentam o resto e que eu recomendo
**não tocar**.

**A regra da ordem, provada por teste.** Nenhum exercício mostra uma letra que
o aluno ainda não viu, e isso não depende de ninguém lembrar: os geradores só
recebem o alfabeto disponível, e `tests/order-rule.test.ts` enumera todo
exercício que o curso é capaz de gerar. É a garantia mais valiosa do produto e
quase nenhum concorrente a tem.

**Exercício gerado, não escrito à mão.** Acrescentar uma palavra em
`data/letters.json` acrescenta essa palavra a todos os tipos que sabem usá-la.
Refazer a fixação gera outra prova: medido no Resh, **9 dos 10 itens mudam**.
Decorar gabarito não é uma estratégia possível aqui.

**O retorno por alternativa (`whyPt`).** "Essa é a forma de começo e meio; no
fim da palavra ela vira ם" corrige. "Errado" não. Medido: os itens de
discriminação trazem, na maioria, 2 de 3 distratores que são parecidos
declarados no conteúdo, cada um com a frase que diz **onde olhar**. Isto é
raro e é caro de escrever. Está feito.

**O modelo de cinco habilidades por letra.** `letterMastery` usa a habilidade
mais fraca e não a média, então quem reconhece ק e não consegue lê-lo não é
promovido. A decisão está certa.

**As confusões reais do aluno (`state.confusions`).** O curso registra "trocou
ד por ר", não só "errou o dálet". É a matéria-prima de tudo que é adaptativo, e
já está sendo coletada.

**A trava de progressão com mensagem.** Uma letra por vez, 80% na fixação para
abrir a próxima, e o cadeado diz o que falta em vez de dizer "bloqueado".

**Os quatro passos da escrita.** Ver o traçado, passar por cima do modelo
cheio, do modelo fraco, e a folha vazia. É a única parte do curso em que o
apoio sai de verdade, e é a melhor coisa que o produto tem.

**A frase no fim do bloco.** Terminar a prática lendo uma frase inteira, sem
transliteração, é o momento que o curso existe para vender. Está no lugar
certo, e uma nota no código explica por que ela não pode ser reordenada.

---

## 3. Principais problemas, por impacto

### CRÍTICO 1 - A lição é a mesma lição 20 vezes

**Onde:** `app/src/lib/engine/exercises.ts:441-470` (`buildLetterPractice`) e
`:603-650` (`buildMiniTest`).

**O que foi medido.** As famílias de exercício que cada letra recebe:

- letras 3 a 11 (Tav, Nun, He, Yod, Guímel, Dálet, Shin, Lámed, Resh):
  **as mesmas 10 famílias**, na mesma ordem;
- a variação só entra a partir da letra 12, e vem de fora do desenho: a frase
  (que só existe a partir do Vav), a forma final (5 letras) e a variante
  (4 letras);
- enunciados idênticos repetidos: "Como se lê esta sílaba?" **59 vezes**,
  "Ligue cada letra ao seu som" **36 vezes**, "Leia a palavra. O que ela quer
  dizer?" **29 vezes**.

A fixação do Tav, do Resh e do Záyin, lado a lado, é literalmente a mesma
sequência:

```
1 reconhecer a letra      6 cursiva -> impressa
2 ligar letra ao som      7 reconhecer a letra
3 entre as parecidas      8 montar a sílaba
4 em qual palavra aparece 9 ler a sílaba (ou a frase)
5 reconhecer (letra antiga) 10 ler a palavra
```

**Por que acontece.** As camadas são listas de preferência:

```ts
tentar([exMatchLetterSound, exVowelSound, exSoundToSyllable], 1);
tentar([exConfusablePick, exOddOneOut], 1);
tentar([exLetterInWord, exCompleteWord], 1);
```

O primeiro da lista quase nunca falha, então o segundo e o terceiro quase nunca
são chamados. Medido: `exVowelSound` aparece **8 vezes em 528**, e só no Álef e
no Mem - porque nas duas primeiras letras `exMatchLetterSound` devolve `null`
(precisa de 3 letras no histórico, `generators.ts:427`) e a lista cai para o
segundo item. A partir da letra 3 ele nunca mais falha, e a pergunta "que vogal
está escrita aqui?" **desaparece do curso**.

O mesmo mecanismo apaga:

| gerador | aparições em 528 | onde |
|---|---|---|
| `exOddOneOut` (ache a intrusa) | **2** | só Álef |
| `exCompleteWord` (falta uma letra) | **2** | só Mem |
| `exVowelPair` (dois sinais, um som) | **1** | só Álef |
| `exMatchSyllable` (ligar sílaba à leitura) | **1** | só Álef |
| `exBuildWord` (montar a palavra) | **1** | só Mem |
| `exTypeTranslit` (digitar) | **0** | nunca, em nenhuma lição |

Seis gestos diferentes, prontos, testados, e o aluno encontra cada um no máximo
duas vezes em todo o curso.

**Como eu consertaria.** Trocar "o primeiro que funcionar" por **rotação com
memória**: a camada recebe a lista e escolhe o gerador que esta letra ainda não
usou, girando pela ordem da letra. Em uma linha de ideia:

```ts
const escolher = (gens, L) => gens[(L.order + gens.length) % gens.length]
```

Com isso a camada de som passa a alternar entre ligar-ao-som, que-vogal-é e
qual-sílaba-se-lê-assim ao longo do alfabeto; a de discriminação alterna entre
entre-as-parecidas e ache-a-intrusa; a de palavra alterna entre em-qual-aparece
e complete-a-palavra. Sem conteúdo novo, sem gerador novo, sem risco para a
regra da ordem.

**Impacto pedagógico.** Alto e imediato. Três coisas, e a terceira é a que mais
importa: (a) o aluno para de prever a pergunta seguinte, e previsão é o começo
do piloto automático; (b) seis habilidades que hoje são decorativas passam a ser
treinadas; (c) a dificuldade real sobe sem que nada fique mais difícil - o que
muda é que ele não pode mais resolver tudo com o mesmo raciocínio.

---

### CRÍTICO 2 - 84% do curso é o mesmo gesto

**Onde:** distribuição de tipos em todo o motor.

**Medido:** 444 dos 528 itens são "ler o enunciado em português e tocar numa de
três ou quatro alternativas". Os 84 restantes são: montar sílaba (46), ligar
pares (37) e montar palavra (1).

Não existe, dentro de uma lição: digitar, ordenar letras, encontrar o erro,
responder sem alternativas, ou qualquer item com tempo. Existe uma coisa que
não é escolha múltipla e é excelente - o quadro de escrita -, e ela fica fora
do fluxo de exercício, na etapa 3.

**Por que é um problema.** Escolha múltipla mede reconhecimento, e
reconhecimento é a habilidade mais fraca das que a leitura precisa. Um adulto
acerta "qual destas é Dálet?" entre quatro alternativas muito antes de
conseguir **lembrar** o desenho do dálet. O curso está medindo a versão fácil e
tratando o resultado como domínio - a nota que destrava a letra seguinte sai daí.

**Como eu consertaria.** Duas mudanças pequenas e uma nova (detalhe na seção 10):

1. `exTypeTranslit` já existe e já tem escada de dicas. Colocar **um item
   digitado** na fixação a partir da letra 5, quando já há palavras curtas
   legíveis. Um só, e opcional em telefone pequeno.
2. Trazer `exBuildWord` (montar a palavra com as peças) para a rotação de
   leitura, não como caso de sobra.
3. Acrescentar **Ache o erro** (ver 10.3), que é o único formato que obriga a
   ler tudo e ainda assim custa um toque.

**Impacto.** Recuperação ativa em vez de reconhecimento. É a diferença entre
"eu reconheço quando vejo" e "eu leio".

---

### ALTO 3 - A fixação não cobra a coisa que define quatro letras

**Onde:** `exercises.ts:603-650`, as camadas de `buildMiniTest`.

**Medido:** a prática do Bet, do Kaf, do Pe e do Shin traz um item de variante
("Qual destas se lê *ke*?"). **A fixação não traz nenhum.** A lista de camadas
da fixação não tem `exLetterVariant` nem `exVariantSyllable`.

Essas quatro letras têm duas leituras. É a coisa mais difícil delas e a que a
lição gasta mais tempo explicando. A prova que decide se a letra está dominada
e se a próxima abre não pergunta sobre isso, nunca.

É exatamente o defeito que a cursiva tinha e que foi corrigido em 22/09 - e a
correção não foi aplicada aqui. Uma etapa que nunca é cobrada é uma etapa que o
aluno aprende a pular.

**Como eu consertaria.** Copiar a camada da prática:

```ts
if ((L.variantes?.length ?? 0) >= 2) tentar([exLetterVariant, exVariantSyllable]);
else tentar([exMatchLetterSound, exVowelSound, exSoundToSyllable]);
```

Uma linha. **Impacto:** o aluno para de passar no Bet sem nunca ter decidido, uma
vez sequer, de que lado estava o ponto.

---

### ALTO 4 - Os pares que mais enganam brasileiros são os menos treinados

**Onde:** distribuição dos pares em todo `exConfusablePick` e `exOddOneOut`.

**Medido**, em 528 itens:

| par | vezes | comentário |
|---|---|---|
| א / ע | 18 | dominante, e são as duas mudas |
| ה / ח | 9 | bom |
| מ / ס | 9 | bom |
| ד / ר | 7 | aceitável |
| ו / י | 5 | |
| ג / נ | 4 | **baixo** |
| ו / ז | 4 | **baixo** |
| ק / ר | 4 | **baixo** |
| ע / צ | 4 | **baixo** |
| **ב / כ** | **3** | **o mais grave** |
| ט / מ | 2 | baixo |

ב contra כ é, na minha experiência com leitores de alfabeto latino, o par que
mais custa - as duas são retângulos abertos à esquerda, a diferença é um
canto. Ele aparece **três vezes no curso inteiro**, e as duas letras só são
ensinadas nas posições 20 e 21, o que deixa pouquíssimo alfabeto pela frente
para revisá-las.

**Por quê.** `exConfusablePick` é sempre chamado com a letra **da lição** como
alvo, então o par só é treinado quando uma das duas metades é a letra do dia.
Como ב e כ são as letras 20 e 21, sobram duas lições.

**Como eu consertaria.** Duas coisas:

1. **Revisão cumulativa dirigida ao par, não à letra.** O bloco cumulativo
   (30% da prática) hoje sorteia letras anteriores. Deveria sortear
   **pares anteriores**: se ב já foi ensinado e כ acabou de ser, o item
   cumulativo deve ser "entre estas parecidas, qual é ב?" com כ na mesa.
2. **Um checkpoint de parecidas** ao fim do módulo 5, com os oito pares
   clássicos, quando todos já foram ensinados. Hoje o último checkpoint tem a
   mesma composição dos outros quatro.

**Impacto.** Este é o item da lista que mais separa "sei as letras" de
"consigo ler". Quem confunde ב e כ lê *bakbuk* como *chakchuk* e desiste
achando que o problema é ele.

---

### ALTO 5 - Os seis jogos escrevem tudo na mesma habilidade

**Onde:** `app/src/app/academia/AcademiaClient.tsx:194`.

```ts
p.answer({ itemId: `jogo:${a.id}`, letterId: a.letterId, correct: a.certo, skill: 'rec', ... })
```

**Medido por leitura:** os seis jogos - Match, Blast, Teste, Caça, Batalha,
Impressa × Cursiva - gravam `skill: 'rec'`, sempre. Um Match de palavras, um
Teste de sílabas e um Blast de sons escrevem todos na mesma conta.

**Consequências reais**, porque essa conta decide coisas:

- `letterMastery` usa a habilidade mais fraca. Jogar muito **infla `rec`** e
  não toca em `ler` nem em `som`, então o painel diz "forte" por um motivo que
  não é verdade;
- o nível dos jogos (`nivelDe`) sai daí, então quem joga muito sobe de nível
  por reconhecer formas e recebe grades difíceis de leitura;
- a revisão personalizada escolhe letras por essa conta, e passa a oferecer
  reconhecimento a quem precisa de leitura.

**Como eu consertaria.** O baralho já sabe o tipo de cada par
(`TipoPar`: nome, som, sílaba, palavra). Mapear: `nome` e o jogo de cursiva
para `rec`; `som` para `som`; `sílaba` e `palavra` para `ler`. É uma linha de
`switch` em `AcademiaClient` e o dado para alimentá-la já viaja junto.

**Impacto.** Todo o lado adaptativo do produto passa a receber dado honesto.
Hoje ele recebe dado enviesado, e enviesado sempre para o mesmo lado.

---

### ALTO 6 - Letras que somem depois de ensinadas

**Onde:** o bloco cumulativo de `buildLetterPractice` (`exercises.ts:477-503`)
e a letra anterior da fixação (`exercises.ts:652-661`).

**Medido**, para um aluno que não erra (que é o caso em que a revisão mais
precisa funcionar sozinha): em quantas das lições seguintes cada letra volta
como alvo de algum item.

| letra | ensinada na | lições depois | volta em | maior intervalo sem vê-la |
|---|---|---|---|---|
| א Álef | 1 | 21 | 11 lições | 4 |
| נ Nun | 4 | 18 | 13 lições | 2 |
| ד Dálet | 8 | 14 | 8 lições | 2 |
| ש Shin | 9 | 13 | **1 lição** | 7 |
| ר Resh | 11 | 11 | 4 lições | 2 |
| **ו Vav** | 12 | 10 | **nunca** | **10** |
| **ז Záyin** | 13 | 9 | **nunca** | **9** |
| ט Tet | 15 | 7 | 2 lições | 3 |
| ב Bet | 20 | 2 | nunca | 2 |

É exatamente o modelo que o pedido quer evitar: *aprende ו, pratica ו, nunca
mais vê ו*. E ו/ז é um dos pares clássicos - as duas somem juntas.

**Por quê.** O bloco cumulativo escolhe as letras anteriores assim: primeiro as
fracas (`weak`), depois **as outras embaralhadas**. Para quem não erra, `weak`
está vazio e a escolha é sorteio puro. Um sorteio não tem memória, então nada
impede uma letra de nunca ser sorteada.

E a fila de revisão (Leitner, `rules.ts:484`) não compensa, por desenho: ela só
cria entrada quando o aluno **erra** ("o pool de revisão é para o que o aluno
de fato tem dificuldade"). É uma decisão defensável para a tela de revisão, e é
o motivo pelo qual quem acerta tudo nunca recebe revisão espaçada de nada.

**Como eu consertaria.** Trocar o sorteio por **intervalo crescente**. Uma letra
ensinada na lição *n* volta, com certeza, nas lições *n+1*, *n+2*, *n+4*, *n+8*
e *n+16*; o que sobrar de espaço vai para as fracas e para o sorteio. Não
precisa de estado novo: a ordem da lição é o relógio.

```ts
const devidas = anteriores.filter(P => [1, 2, 4, 8, 16].includes(L.order - P.order));
const ordenadas = [...fracas, ...devidas, ...shuffled(resto, rand)];
```

**Impacto.** Garante o que o curso promete sem dizer: que ninguém termina as 22
letras tendo esquecido a décima segunda. É a correção de maior efeito sobre
retenção de todo este relatório, e cabe em três linhas.

---

### MÉDIO 7 - "Letras parecidas" na academia quase não tem letras parecidas

**Onde:** `gym.ts:194` chama `buildConfusionDrill`, que em `exercises.ts:961`
usa `generatorsFor(['rec','ler'])` e preenche com a rotação normal.

**Medido:** uma sessão de 8 itens do modo "Letras parecidas" entrega
famílias `rec, syl, inword, bsy, conf, mean, frase, odd`. Apenas **2 dos 8
itens** (`conf` e `odd`) põem o par lado a lado. Os outros seis são exercícios
comuns sobre aquelas duas letras: ler uma sílaba, ler uma palavra, ler uma frase.

A descrição na tela diz "As que você está trocando, lado a lado". A maioria não
está lado a lado.

**Como eu consertaria.** `buildConfusionDrill` deve usar uma lista própria -
`exConfusablePick`, `exOddOneOut`, `exLetterInWord` com a outra metade do par
como distratora, e um relâmpago - e não a rotação geral. Cada item deve ter as
duas letras do par na tela ao mesmo tempo.

---

### MÉDIO 8 - Os cinco checkpoints são o mesmo checkpoint

**Medido:** os cinco têm 12 itens, a divisão fixa `rec 4 / som 4 / ler 4`, e
praticamente a mesma lista de famílias. Em **todos os cinco** aparece um item
`vowel-pair` sobre o mesmo som, o "a" - porque `at(comDois, i)` com `i = 0`
devolve sempre o primeiro da lista.

Um checkpoint deveria ser o momento em que o aluno sente que fechou um módulo.
Hoje ele é uma lição mais longa com outro nome, e a quinta vez é idêntica à
primeira.

**Como eu consertaria.** Dar a cada checkpoint um **tema próprio** ligado ao que
o módulo ensinou: cp1 as formas e os primeiros sons; cp2 vogais e sílabas;
cp3 leitura de palavras; cp4 as parecidas, todas juntas; cp5 as variantes e as
formas finais. Mais um item novo por checkpoint - a boss battle da seção 10.6.
E girar o som do `vowel-pair` pelo número do módulo.

---

### MÉDIO 9 - A Batalha nunca oferece os pares clássicos a quem não erra

**Onde:** `jogos.ts:411` (`paresParaTreinar`).

Sem histórico de erro, a função percorre `[...unlocked].reverse()` - ou seja,
**as letras mais recentes primeiro**. Medido com 22 letras e sem erros
registrados, os quatro pares oferecidos são: פ/מ, כ/ב, כ/ר, ק/ר. Quem terminou o
curso sem errar nunca recebe ד/ר nem ה/ח.

A lógica tem uma boa razão escrita ("a letra de ontem é a que ainda não
assentou"), e ela vale para quem está no meio do curso. Para quem terminou,
inverte o valor.

**Como eu consertaria.** Depois que o alfabeto fecha, misturar: dois pares
recentes e dois pares sorteados por peso entre todos os pares clássicos, com
preferência pelos que apareceram menos na vida daquele aluno (o dado existe,
está em `state.skills` e `state.srs`).

---

### BAIXO 10 - Três alternativas demais em itens de leitura

**Medido:** os 59 itens de `syllable-reading` têm **sempre 3 alternativas**
(33% no chute), e os 46 de `build-syllable` têm sempre 4 vogais na mesa.
`letter-position` tem sempre as mesmas 3 opções fixas ("No começo / No meio /
No fim") - embora a distribuição da resposta esteja saudável (7 / 10 / 5).

Ler sílaba com três opções é o item mais frequente do curso depois do
reconhecimento. Com quatro, o chute cai para 25% e a escolha custa mais.

**Como eu consertaria.** `exSyllableReading` pede `take(wrong, 2)`; pedir 3
quando a letra tiver sílabas suficientes, que é o caso de todas (6 sílabas por
letra, medido).

---

### BAIXO 11 - A mesma frase lida cinco vezes

**Medido:** 22 itens de frase usam **14 frases distintas**. `david-ve-sara`
aparece 5 vezes, `hi-mora` 3. Acontece porque `exSentenceReading` prefere a
frase que a letra acabou de destravar e, quando não há, pega a mais recente
disponível - que é a mesma para várias letras seguidas.

Os distratores mudam a cada vez, então não é decoreba pura, mas o aluno lê a
mesma linha em quatro lições seguidas.

**Como eu consertaria.** Girar dentro de `resto` com o `order` da letra, do
mesmo jeito que o giro das sílabas foi corrigido.

---

## 4. Onde o curso fica repetitivo, em detalhe

Mapa por local, para servir de lista de trabalho.

| onde | o que se repete | número | arquivo |
|---|---|---|---|
| fixação de 20 letras | a mesma sequência de 10 gestos | 20 de 22 | `exercises.ts:603` |
| camada de som | "Ligue cada letra ao seu som" | 36 vezes, idêntico | `exercises.ts:604` |
| camada de leitura | "Como se lê esta sílaba?" | 59 vezes | `generators.ts:606` |
| camada de discriminação | sempre `exConfusablePick`, nunca a intrusa | 60 contra 2 | `exercises.ts:459` |
| camada de palavra | sempre "em qual palavra aparece", nunca "complete" | 56 contra 2 | `exercises.ts:460` |
| checkpoints | mesma composição e mesmo `vowel-pair` "a" | 5 de 5 | `exercises.ts:741` |
| academia, modo parecidas | 6 de 8 itens não são de discriminação | | `gym.ts:194` |
| jogos | os seis gravam na mesma habilidade | 6 de 6 | `AcademiaClient.tsx:194` |
| frases | `david-ve-sara` em 5 lições | | `generators.ts:664` |

Uma observação sobre o dedupe: `assinatura()` (`exercises.ts:255`) protege
contra perguntas iguais, mas ela usa `kind + enunciado + opções`. O item de
**match não tem `options`**, então 36 itens "Ligue cada letra ao seu som"
passam pelo filtro com a assinatura exatamente igual. O filtro está certo e é
cego justamente no item mais repetido do curso.

---

## 5. Onde o nível está baixo demais

**5.1 - Ler sílaba com três alternativas** (59 itens). Ver 3.10. Além do chute
barato, as três opções são as transliterações das sílabas da própria letra -
*ma, mi, mo* -, então basta reconhecer o sinal e não é preciso ler nada.

**5.2 - "Onde está a letra nesta palavra?"** (22 itens). Três opções fixas, e a
letra procurada está desenhada grande no enunciado. Em palavras de três blocos,
que são a maioria, "meio" é quase sempre a resposta segura.
*Melhoria:* pedir a posição **contada** ("a segunda letra, da direita para a
esquerda"), ou mostrar a palavra e pedir para **tocar na letra dentro dela** -
o que treina o olho em vez do raciocínio.

**5.3 - `exLetterRecognition` com distratores de enchimento.** Medido: 19 dos
125 itens de reconhecimento têm apenas 1 distrator parecido entre 3, e os
outros dois são letras aleatórias do alfabeto - que se eliminam sem olhar.
*Melhoria:* quando não houver parecidos declarados suficientes, completar com
letras do **mesmo grupo visual** (as que descem abaixo da linha, as de teto
reto) em vez do alfabeto inteiro.

**5.4 - A primeira lição não pede nada difícil.** Álef tem 0 palavras legíveis,
então seus 24 itens são reconhecimento, sílaba e vogal. É defensável na lição 1,
mas é o primeiro contato e ele já é a versão mais fácil de si mesmo.
*Melhoria:* usar a vantagem que o Álef tem e ninguém usa - ele é **mudo**, o que
o torna o único lugar honesto para ensinar que a vogal é que manda. Um item
"esta sílaba se lê só a vogal: qual é?" cabe aqui e em lugar nenhum mais.

**5.5 - Escolher entre 2 alternativas.** No módulo 6 (`extras.ts:98`), o item de
daguesh oferece dois sons. É cara ou coroa, e o resto do motor recusa isso com
razão. *Melhoria:* três opções, com o terceiro som de outra letra do par.

---

## 6. Onde o nível sobe rápido demais

**6.1 - Do reconhecimento à frase, sem degrau.** Na letra 12 aparece a primeira
frase completa. Antes dela, o item mais longo é uma palavra de 3 a 5 blocos.
Uma frase de três palavras sem transliteração, com escolha entre quatro
significados, é um salto grande - e é o item mais gratificante quando dá certo,
o mais desanimador quando não dá.
*Versão intermediária:* **duas palavras** antes de três. O conteúdo já tem
frases de duas palavras (`ma ze`, `boker tov`); o gerador deveria preferi-las na
primeira aparição de cada aluno, e só depois liberar as de três.

**6.2 - A fixação vale 80% e mistura quatro gestos novos.** Desde 22/09 a
fixação cobra montar, ler, significado e cursiva além de escolher. São dez
itens, dois erros perdoados, e a nota destrava a letra seguinte. Para quem tem
dificuldade, o item de montar palavra e o de cursiva chegam sem aquecimento -
a prática treinou os dois, mas uma vez cada.
*Versão intermediária:* garantir que **todo gesto cobrado na fixação apareça ao
menos duas vezes na prática**. Hoje isso é verdade para escolher e não é para
os outros.

**6.3 - O relâmpago da Batalha em 900 ms.** É o formato certo e o tempo é
defensável, mas ele aparece já na quarta rodada de cada par, inclusive para
quem está no nível "Aquecimento". Um aluno com seis letras ainda está
soletrando formas.
*Versão intermediária:* 1500 ms no nível fácil, 1200 no médio, 900 no difícil.
O nível já está calculado e disponível na função.

**6.4 - A Caça no nível difícil.** 24 células, 6 alvos, distratores só
parecidos. Medido: até 9 glifos distintos na mesma grade. É pesado num telefone
e é pesado na cabeça. Não recomendo baixar - recomendo **avisar**: uma linha
antes da partida dizendo o que muda.

---

## 7. Letras com pouca prática

Esta tabela é a resposta ao item 4 do pedido. A boa notícia: **nenhuma letra
está subpraticada em quantidade.** Todas recebem exatamente 24 itens. O problema
não é distribuição, é variedade - e ela está concentrada nas letras 20 a 22.

| # | letra | nome | itens | próprios | revisão | famílias | discrimina | na palavra | forma final | cursiva | variante | frase | palavras |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | א | Álef | 24 | 24 | 0 | 10 | sim | - | n/a | sim | n/a | - | 0 |
| 2 | מ | Mem | 24 | 21 | 3 | 11 | sim | - | sim | sim | n/a | - | 2 |
| 3 | ת | Tav | 24 | 19 | 5 | 10 | sim | sim | n/a | sim | n/a | - | 2 |
| 4 | נ | Nun | 24 | 19 | 5 | 11 | sim | sim | sim | sim | n/a | - | 4 |
| 5 | ה | He | 24 | 19 | 5 | 10 | sim | sim | n/a | sim | n/a | - | 6 |
| 6 | י | Yod | 24 | 19 | 5 | 10 | sim | sim | n/a | sim | n/a | - | 4 |
| 7 | ג | Guímel | 24 | 19 | 5 | 10 | sim | sim | n/a | sim | n/a | - | 4 |
| 8 | ד | Dálet | 24 | 19 | 5 | 10 | sim | sim | n/a | sim | n/a | - | 4 |
| 9 | ש | Shin | 24 | 19 | 5 | 11 | sim | sim | n/a | sim | sim | - | 5 |
| 10 | ל | Lámed | 24 | 19 | 5 | 10 | sim | sim | n/a | sim | n/a | - | 5 |
| 11 | ר | Resh | 24 | 19 | 5 | 10 | sim | sim | n/a | sim | n/a | - | 4 |
| 12 | ו | Vav | 24 | 19 | 5 | 12 | sim | sim | n/a | sim | n/a | sim | 7 |
| 13 | ז | Záyin | 24 | 19 | 5 | 12 | sim | sim | n/a | sim | n/a | sim | 5 |
| 14 | ח | Het | 24 | 19 | 5 | 11 | sim | sim | n/a | sim | n/a | sim | 5 |
| 15 | ט | Tet | 24 | 19 | 5 | 11 | sim | sim | n/a | sim | n/a | sim | 4 |
| 16 | ס | Sámech | 24 | 19 | 5 | 12 | sim | sim | n/a | sim | n/a | sim | 5 |
| 17 | ע | Áyin | 24 | 19 | 5 | 12 | sim | sim | n/a | sim | n/a | sim | 5 |
| 18 | צ | Tsadi | 24 | 19 | 5 | 13 | sim | sim | sim | sim | n/a | sim | 5 |
| 19 | ק | Qof | 24 | 19 | 5 | 12 | sim | sim | n/a | sim | n/a | sim | 6 |
| 20 | ב | Bet / Vet | 24 | 19 | 5 | 12 | sim | sim | n/a | sim | sim | sim | 6 |
| 21 | כ | Kaf / Chaf | 24 | 19 | 5 | 14 | sim | sim | sim | sim | sim | sim | 6 |
| 22 | פ | Pe / Fe | 24 | 19 | 5 | 14 | sim | sim | sim | sim | sim | sim | 5 |

**Leitura da tabela.**

- **Variedade cresce com a ordem, não com a necessidade.** As letras 3 a 11
  recebem 10 famílias; as letras 20 a 22 recebem 12 a 14. A diferença é a
  frase, a forma final e a variante, que dependem de onde a letra caiu no
  currículo. Ninguém decidiu que Dálet merece menos variedade que Pe.
- **Álef e Mem não recebem revisão cumulativa suficiente** (0 e 3 itens),
  porque não há letras anteriores. Inevitável, e é justamente por isso que o
  Álef precisa voltar com força nas lições 3 a 6 - e volta: é a letra mais
  frequente do curso, alvo de 40 itens.
- **As letras que dependem de palavras sofrem no começo.** Álef (0 palavras) e
  Mem/Tav (2) não têm material para "em qual palavra aparece" nem para
  "complete a palavra". A partir do He (6 palavras) o problema some.
- **Colunas "cursiva" e "discrimina" com sim em toda a tabela** são a boa
  notícia das correções de 22/09. Antes, a cursiva aparecia só no Tav.

**Forma final.** Só as cinco letras que têm uma recebem `finword`, como deve
ser. Mas o **treino cruzado** das cinco formas finais juntas (ם ן ך ף ץ), que é
o que confunde de verdade quando aparecem numa página, só existe no módulo 6.

---

## 8. Auditoria dos jogos

Seis jogos. A avaliação é honesta: três são bons, dois são medianos e um é o
melhor do conjunto.

### Caça à letra
- **Treina habilidade útil?** Sim, e uma que nenhum outro exercício treina:
  varredura visual, que é o que o olho faz ao ler.
- **Composição medida:** 5 rodadas, letras diferentes em cada, 12/18/24 células
  conforme o nível, cerca de 25% de alvos.
- **Diverte depois da quarta rodada?** Sim, até o fim da partida. Repetido no
  mesmo dia, não - a grade muda mas a tarefa é idêntica.
- **O que falta:** nada estrutural. Um placar de tempo por rodada e um recorde
  pessoal acrescentariam tensão sem mudar a habilidade.
- **Veredito: bom.** Manter.

### Batalha das parecidas
- **Treina?** Sim, e a habilidade mais valiosa do curso.
- **Composição medida:** 16 rodadas, 4 pares, 4 formatos (qual / ache todas /
  intruso / relâmpago), 4 rodadas por par.
- **Problema:** os pares vêm das letras mais recentes quando não há erro
  registrado (ver 3.9). O jogo certo, com o conteúdo errado.
- **O que falta:** escolha de par pelo aluno depois que o alfabeto fecha, e
  tempo do relâmpago por nível.
- **Veredito: o melhor jogo do produto,** e ainda com um defeito de seleção.

### Impressa × cursiva
- **Treina?** Sim, e é a única prática de **ler** cursiva que existe fora das
  lições.
- **Composição medida:** 12 rodadas, metade em cada direção, mais 3 de pares no
  médio e no difícil. 10 letras distintas no fácil, 6 no médio.
- **Problema:** as duas formas são a mesma letra em duas fontes. Funciona, mas
  a cursiva hebraica real varia bastante de mão para mão, e o aluno treina uma
  caligrafia só.
- **Veredito: bom,** e fica excelente no dia em que houver uma segunda fonte
  cursiva.

### Match
- **Treina?** Comparação, que é útil. Mas medido: os pares são quase sempre
  `nome` e `som`, então é reconhecimento de novo.
- **Problema:** sem cronômetro por padrão (certo) e sem progressão nenhuma. O
  segundo tabuleiro é igual ao primeiro.
- **O que falta:** níveis. 6 pares no começo, 8 depois, e a partir de 12 letras
  um tabuleiro **só de parecidas** - que é o Match que vale a pena.
- **Veredito: mediano.** Tem lugar, precisa de progressão.

### Blast
- **Treina?** Reconhecimento rápido, e a sequência de acertos na tela é o único
  elemento de tensão do produto.
- **Problema:** 12 perguntas, quatro alternativas, sempre o mesmo formato. É
  Blast a partida inteira.
- **O que falta:** **aceleração**. O nome promete velocidade e não há relógio.
  Um Blast que encurta o tempo disponível a cada 5 acertos, e que termina
  quando o tempo acaba em vez de quando as 12 acabam, vira outro jogo com o
  mesmo código.
- **Veredito: mediano com potencial alto.**

### Teste
- **Treina?** Mede, que é diferente - e a decisão de não corrigir durante está
  certa.
- **Composição:** 10 perguntas, sentido misto, lista do que escapou no fim com
  caminho de volta.
- **Veredito: bom** no que se propõe. Não é um jogo e não deveria tentar ser.

### Respostas diretas às perguntas do pedido

| pergunta | resposta |
|---|---|
| quantas questões deveria ter? | Caça 5 rodadas (está certo), Batalha 16 (certo), Cursiva 12 (certo), Match 6 a 10 por nível, Blast por tempo e não por contagem, Teste 10 (certo) |
| deveria usar mais letras? | Só o Match: hoje 6 pares e podia ser 8 a 12 |
| deveria misturar conteúdo antigo? | Sim, e já mistura por peso - o problema é a Batalha (3.9) |
| limite de tempo? | Só no Blast e no relâmpago. Nos outros, não: pressa vira chute |
| pontuação? | Existe. Não mexer |
| recorde pessoal? | **Existe em `state.gym` e quase não aparece na tela.** Mostrar |
| combo / streak? | Só no Blast. Vale na Caça e na Batalha |
| dificuldade automática? | Existe (`nivelDe`) e é invisível ao aluno. Deveria ser dita: "Treino - as parecidas entraram" |

---

## 9. Lacunas pedagógicas

Classificação de todos os 528 itens nas categorias pedidas:

| categoria | itens | % | avaliação |
|---|---|---|---|
| reconhecimento visual | 319 | 60% | **excesso** |
| leitura | 162 | 31% | adequado |
| associação letra-som | 47 | 9% | **baixo** |
| discriminação visual | 62 | 12% | adequado em número, mal distribuído (3.4) |
| revisão cumulativa | 103 | 20% | quantidade boa, escolha por sorteio (ver 3, problema 6) |
| recuperação ativa | 47 | 9% | **muito baixo** - e 46 deles são montar sílaba, que ainda é escolher entre 4 vogais |
| escrita / produção | 4 por letra, fora do fluxo | - | bom em qualidade, isolado |
| cursiva | 44 | 8% | bom (era 1 antes de 22/09) |
| memória | 0 nas lições | 0% | só nos jogos |
| velocidade | 0 nas lições | 0% | só no relâmpago |
| compreensão | 22 (frases) | 4% | **baixo, e é o que o curso vende** |

**As três lacunas que eu trataria primeiro:**

1. **Recuperação ativa** (item 10 do pedido). Quase tudo é reconhecer entre
   opções. Ver 10.1, 10.2, 10.3 e a seção 15 inteira.
2. **Compreensão.** 22 itens de frase, 14 frases distintas, para um curso cuja
   promessa é "ler hebraico de verdade". O conteúdo tem 23 frases e 99 palavras;
   a proporção de itens que pedem entendimento é pequena demais.
3. **Audição.** Zero. Medido: **0 clipes em `audio/`**, então toda a habilidade
   `ouvir` está desligada, a parte "Escuta" do exame não aparece e o modo
   "Ouvir e escolher" da academia fica com a etiqueta "Esperando as gravações".
   O curso é honesto sobre isso e explica cada som por comparação com o
   português - mas é a quinta parte do modelo de habilidades, e ela está vazia.
   Não é problema de código; é estúdio.

---

## 10. Exercícios novos recomendados

Cada um com a função pedagógica. Não incluí nenhum que exista só por ser
divertido.

### 10.1 - Ache o erro (`find-the-error`)
**Como funciona.** Uma palavra conhecida aparece com **uma letra trocada por
uma parecida** (בַּיִת escrito com כ). O aluno toca na letra errada.
**Treina.** Discriminação dentro de palavra, que é onde a confusão custa - não
entre dois cartões, mas no meio de uma leitura.
**Quando entra.** A partir da letra 8, quando há palavras de 3 blocos.
**Prioridade: P1.** É o formato que mais aumenta a dificuldade sem aumentar a
frustração, porque o aluno sempre tem o significado como apoio.

### 10.2 - Ordene as letras (`order-letters`)
**Como funciona.** As letras de uma palavra, soltas e fora de ordem, para serem
colocadas da direita para a esquerda. É o `exBuildWord` que já existe, mas com
**letras** em vez de blocos e com a direção como parte da tarefa.
**Treina.** Direção de leitura, que é a coisa mais estranha do hebraico para um
brasileiro e que nenhum item cobra diretamente.
**Quando entra.** Letra 5 em diante.
**Prioridade: P1.** O código do montar-palavra já existe e já trata o toque.

### 10.3 - Complete a palavra, sem alternativas (`type-gap`)
**Como funciona.** A palavra com uma lacuna e um **teclado hebraico de seis
teclas** (as candidatas plausíveis), sem as quatro alternativas de hoje.
**Treina.** Recuperação ativa do desenho, não reconhecimento.
**Quando entra.** Letra 6 em diante, um por fixação.
**Prioridade: P0**, porque é a correção mais barata do problema 3.2.

### 10.4 - A letra que some (`flash-letter`)
**Como funciona.** A letra aparece por 800 ms e some; depois vêm as
alternativas. Já existe como `relampago` dentro da Batalha.
**Treina.** Reconhecimento automático, sem comparação lado a lado.
**Quando entra.** Nas lições, a partir da letra 10, uma vez a cada três lições.
**Prioridade: P2.** O componente existe; falta trazê-lo para a lição.

### 10.5 - Pseudopalavras (`nonsense-read`)
**Como funciona.** Uma sílaba ou palavra **inventada** mas legível
(מָטוּל), e o aluno escolhe como se lê ou digita.
**Treina.** Decodificação pura. É o padrão-ouro em alfabetização: quem lê
pseudopalavra está lendo; quem lê só palavras conhecidas pode estar lembrando.
**Quando entra.** Letra 12 em diante, na academia antes das lições.
**Prioridade: P2.** Precisa de uma regra de geração que respeite fonotática
hebraica - não é trivial e não deve ser improvisado.

### 10.6 - Boss battle de fim de módulo
**Como funciona.** No fim de cada checkpoint, **uma sequência contra o relógio**
com as letras daquele módulo: 10 itens, sem dica, sem voltar, com uma barra de
tempo. Passou, ganha o selo do módulo; não passou, refaz de graça.
**Treina.** Consolidação sob pressão leve, e sobretudo **fecha o módulo com um
momento**.
**Quando entra.** Fim de cada um dos 5 checkpoints.
**Prioridade: P1.** É o item que mais muda a sensação de conquista por unidade
de trabalho.

### 10.7 - Leitura cursiva de palavra
**Como funciona.** Uma palavra inteira escrita em cursiva; o aluno escolhe o
significado ou a versão impressa.
**Treina.** Ler um bilhete, que é a promessa implícita da etapa de escrita.
Hoje a cursiva só aparece letra a letra.
**Quando entra.** Letra 14 em diante.
**Prioridade: P2.**

### 10.8 - Ditado silencioso (quando houver áudio)
**Como funciona.** Toca a palavra; o aluno **monta** com blocos em vez de
escolher entre quatro.
**Treina.** Som para grafia, o caminho inverso do curso inteiro.
**Prioridade: P3**, e trancado até as gravações existirem.

---

## 11. Melhorias nos exercícios existentes

Não "mais perguntas". Como transformar cada um.

**`exLetterRecognition`** - hoje mostra o nome e pede a forma. Acrescentar a
direção contrária em rotação: mostrar a **forma** e pedir o nome. Mesmo
gerador, uma condição a mais, e passa a treinar recuperação em vez de
reconhecimento em metade das aparições.

**`exConfusablePick`** - está bom. A melhoria é de distribuição, não de desenho:
alvo sorteado entre a letra da lição **e os pares antigos mal treinados** (3.4).

**`exSyllableReading`** - quatro alternativas em vez de três (3.10), e um modo
"relâmpago" em que a sílaba some depois de 1,2 s.

**`exLetterInWord`** - hoje: quatro palavras, em qual aparece a letra. Melhoria:
depois de escolher a palavra, **pedir para tocar na letra dentro dela**. Duas
perguntas encadeadas, um item, e a segunda é a que treina o olho.

**`exLetterPosition`** - trocar as três opções fixas por toque direto na
palavra (ver 5.2). O componente de toque em letra já existe no `odd-one-out`.

**`exBuildSyllable`** - excelente e subusado. Melhoria: às vezes dar a **vogal**
e pedir a consoante, o que obriga a lembrar o desenho.

**`exMatchLetterSound`** - o item mais repetido do curso (36 vezes idênticas).
Melhoria dupla: (a) incluí-lo na assinatura de dedupe usando os pares como
opções, para o filtro enxergá-lo; (b) alternar o que está na coluna esquerda -
letra, sílaba, palavra - conforme o módulo.

**`exSentenceReading`** - preferir frases de duas palavras na primeira vez de
cada aluno (6.1), girar por ordem da letra (3.11), e acrescentar uma segunda
pergunta sobre a mesma frase ("que palavra quer dizer *bom*?"), que é
compreensão em vez de tradução por eliminação.

**`exOddOneOut`** - hoje 6 células e uma intrusa. Melhoria: **duas** intrusas em
nível difícil, e contar o tempo. É o item mais barato de dificultar bem.

**O quadro de escrita** - a melhor peça do produto, e ele não conta para nada
além da habilidade `escrever`. Melhoria: uma quinta etapa opcional, **escrever a
sílaba** (consoante mais vogal) em vez da letra sozinha, a partir da letra 10.

---

## 12. Plano de melhoria priorizado

### P0 - corrigir antes de vender

| # | o que | onde | esforço |
|---|---|---|---|
| 1 | Rotação nas camadas: cada letra usa um gerador diferente da lista | `exercises.ts:441-470, 603-650` | médio |
| 2 | Camada de variante na fixação (Bet, Kaf, Pe, Shin) | `exercises.ts:604` | trivial |
| 3 | Jogos gravam a habilidade certa, não sempre `rec` | `AcademiaClient.tsx:194` | trivial |
| 4 | Um item de recuperação ativa por fixação (digitado ou teclado de 6 teclas) | novo, 10.3 | médio |
| 5 | `assinatura()` enxergar o item de match | `exercises.ts:255` | trivial |
| 6 | Revisão cumulativa por intervalo crescente, não por sorteio | `exercises.ts:477-503` | pequeno |

Os itens 2, 3 e 5 são uma linha cada, e o 6 são três. Os quatro juntos valem
mais do que qualquer conteúdo novo.

### P1 - grande impacto

| # | o que | seção |
|---|---|---|
| 7 | Revisão cumulativa dirigida a **pares**, não a letras | 3.4 |
| 8 | Ache o erro | 10.1 |
| 9 | Ordene as letras | 10.2 |
| 10 | Boss battle no fim de cada checkpoint | 10.6 |
| 11 | Modo "parecidas" da academia com itens de verdade | 3.7 |
| 12 | Batalha: pares antigos depois que o alfabeto fecha | 3.9 |

### P2 - melhoria importante

| # | o que | seção |
|---|---|---|
| 13 | Checkpoints com tema por módulo | 3.8 |
| 14 | Blast por tempo, com aceleração | 8 |
| 15 | Match com níveis e tabuleiro de parecidas | 8 |
| 16 | Quatro alternativas na leitura de sílaba | 3.10 |
| 17 | Relâmpago com tempo por nível | 6.3 |
| 18 | Leitura cursiva de palavra | 10.7 |
| 19 | Tocar na letra dentro da palavra | 11 |
| 20 | Recorde pessoal e nível visíveis na tela | 8 |

### P3 - refinamento futuro

| # | o que |
|---|---|
| 21 | Pseudopalavras |
| 22 | Ditado e tudo que depende de gravação |
| 23 | Segunda fonte cursiva |
| 24 | Escrever a sílaba, não só a letra |

---

## 13. Variedade ideal por letra

Proposta concreta, mantendo os 24 itens de hoje. O que muda é **o que cada
espaço contém** e a regra de que **nenhum gerador pode ocupar o mesmo espaço em
duas letras seguidas**.

**Prática - 14 itens**

| espaço | conteúdo | alterna entre |
|---|---|---|
| 1 | reconhecer | forma a partir do nome / nome a partir da forma |
| 2 | som | ligar ao som / que vogal é / qual se lê assim |
| 3 | discriminar | entre as parecidas / ache a intrusa / **ache o erro** |
| 4 | na palavra | em qual aparece / complete / toque na letra |
| 5 | posição ou forma final | posição contada / forma final na palavra |
| 6 | cursiva | impressa para cursiva / cursiva para impressa |
| 7 | ler sílaba | ler / montar / qual se lê assim |
| 8 | ler palavra | significado / significado para palavra / **ordenar** |
| 9 | **recuperação ativa** | digitar / teclado de 6 teclas / montar sem apoio |
| 10-13 | cumulativo (30%) | **por par**, não por letra solta |
| 14 | frase | sempre, quando existir |

**Fixação - 10 itens**

Uma amostra de espaços diferentes dos que a prática acabou de usar, mais:

- 1 item da **variante**, obrigatório nas letras que têm duas leituras;
- 1 item de **recuperação ativa**, sempre;
- 1 item de letra anterior, sempre;
- nunca o mesmo gerador que a prática usou naquele espaço.

**Regra de ouro:** ao longo das 22 letras, cada um dos 28 geradores deve
aparecer **pelo menos 8 vezes**. Hoje seis deles aparecem 0, 1 ou 2 vezes. Esse
é um teste que dá para escrever e travar, do mesmo jeito que
`tests/cobertura.test.ts` travou a contagem por letra.

---

## 14. Modelo ideal de progressão

Os doze degraus do pedido, mapeados contra o que existe. `ok` quer dizer que o
curso já faz; `parcial` quer dizer que faz mal ou pouco.

| # | degrau | hoje | onde entra no desenho ideal |
|---|---|---|---|
| 1 | conhecer a letra | **ok** | etapa 1 da lição |
| 2 | reconhecer isolada | **ok** (em excesso) | prática, espaço 1 |
| 3 | letra e som | **parcial** (só `mls`) | espaço 2, em rotação |
| 4 | distinguir de diferentes | **ok** | espaço 1, distratores |
| 5 | distinguir de parecidas | **parcial** (mal distribuído) | espaço 3 + cumulativo por par |
| 6 | reconhecer rápido | **falta nas lições** | espaço 3, relâmpago a cada 3 letras |
| 7 | dentro de palavras | **ok** | espaço 4 |
| 8 | ler sílabas | **ok** | espaço 7 |
| 9 | ler palavras | **ok** | espaço 8 |
| 10 | sem transliteração | **ok**, e é o selo "Sem apoio" | frase, espaço 14 |
| 11 | impressa e cursiva | **ok** desde 22/09 | espaço 6 |
| 12 | produzir a letra | **ok**, e é o melhor do curso | etapa 3 |

**A forma que falta.** Os doze degraus existem quase todos, mas a lição os
apresenta **todos de uma vez, em todas as letras**. Um aluno na letra 3 faz o
degrau 11 (cursiva) na mesma sessão em que faz o degrau 2.

O modelo que eu recomendo é **por onda, não por letra**:

- **letras 1 a 6** - peso em reconhecer, som e sílaba. Cursiva presente mas sem
  valer nota. Nenhum item de velocidade.
- **letras 7 a 12** - peso em discriminar e ler palavra. Entram recuperação
  ativa e ordenar. Primeira frase, de duas palavras.
- **letras 13 a 18** - peso em ler e em parecidas antigas. Entram relâmpago,
  ache o erro e leitura cursiva de palavra.
- **letras 19 a 22** - peso em variantes, formas finais e frases. Entra
  pseudopalavra na academia.

A implementação disso não é um sistema novo: é dar peso diferente às listas de
camada conforme `L.order`, no mesmo lugar onde hoje elas são fixas.

---

## 15. Ideias para fazer o aluno pensar

Lista específica de recuperação ativa, do mais barato ao mais caro. A ordem
importa: os três primeiros usam código que já existe.

1. **Mostrar a forma, pedir o nome.** Inverter `exLetterRecognition` em metade
   das aparições. Reconhecimento vira lembrança.
2. **Dar o som, pedir a letra, sem alternativas.** Teclado de seis teclas
   hebraicas. O componente de opções já desenha glifos.
3. **Digitar a transliteração.** `exTypeTranslit` existe, tem escada de dicas e
   comparação tolerante a acento. Nunca é usado numa lição.
4. **Palavra com metade escondida.** Mostrar só os dois primeiros blocos e
   pedir a palavra. Força predição, que é o que leitores fazem.
5. **Ache o erro.** Ver 10.1.
6. **Ordenar as letras.** Ver 10.2.
7. **Reconstruir a palavra ouvida.** Depois das gravações.
8. **Duelo de parecidas sem comparação.** O relâmpago da Batalha, trazido para
   a lição.
9. **Escrever de memória com nota.** A etapa 4 do quadro já faz isso e não
   entra em nota nenhuma. Bastaria contar.
10. **"Por que esta está errada?"** Depois de errar, oferecer três explicações e
    pedir a certa. Transforma o erro em item. O texto já existe em `whyPt`.

---

## Simulação: um aluno ao longo de vários dias

Resposta ao item 15 do pedido. Simulei mentalmente um adulto que faz uma letra
por dia, com os números acima como chão. Onde a resposta é palpite meu, está
dito.

**Dia 1 a 3 (Álef, Mem, Tav).** A experiência é a melhor do curso. Tudo é
novo, a etapa de escrita surpreende, e a primeira palavra lida (no Mem) é um
momento real. Nenhum risco aqui.

**Dia 4 a 7 (Nun a Guímel).** O aluno reconhece o esqueleto. A fixação do dia 5
é a do dia 4 com outra letra, e ele percebe - a pergunta 2 é sempre "ligue cada
letra ao seu som", a 6 é sempre a cursiva. **É aqui que a monotonia começa**, e
o motivo é o CRÍTICO 1. A sensação de progresso continua boa, porque o mapa
enche e as palavras ficam mais longas.

**Dia 8 a 11 (Dálet a Resh).** O ponto de maior risco de abandono por
repetição, na minha leitura. Nove lições seguidas com as mesmas dez famílias.
Não há surpresa nenhuma: a frase ainda não existe, a variante só aparece no
Shin. O aluno fica bom **no exercício** - sabe que a pergunta 3 tem as parecidas,
que a 4 pede a palavra - e isso é diferente de ficar bom em hebraico.

**Dia 12 (Vav).** Primeira frase. É o melhor momento emocional do curso, e ele
chega na hora certa para segurar quem estava cansando. Bom desenho.

**Dia 13 a 19.** A frase dá fôlego novo. Risco novo: a frase é a mesma em
várias lições seguidas (`david-ve-sara` cinco vezes), e o Vav e o Záyin
aprendidos na semana anterior **não voltam**.

**Dia 20 a 22 (Bet, Kaf, Pe).** As lições mais ricas do curso (12 a 14
famílias) e as mais difíceis (duas leituras por letra). O risco aqui é de
**dificuldade**, não de repetição: a variante chega com poucas lições pela
frente para revisá-la, e a fixação não a cobra.

**Depois do alfabeto.** Os módulos 6 e 7 e o desafio final variam bem. A
academia sustenta a prática, mas os jogos não mostram nível nem recorde, então
a sensação de "estou melhorando" some quando as lições acabam.

### As dez perguntas, respondidas

| pergunta | resposta |
|---|---|
| quando fica monótono? | Da letra 4 à 11. Medido: mesmas famílias, mesma ordem |
| quando o aluno sente progresso? | Primeira palavra (Mem), primeira frase (Vav), mapa enchendo, selo "Sem apoio" |
| existe sensação de conquista? | Sim, nos 12 selos e na trava que abre. Falta um momento no fim de cada módulo: o checkpoint é uma lição mais longa |
| existem momentos de surpresa? | Pouquíssimos. Fora a frase, a variante e a forma final - que vêm da letra, e não do desenho da lição -, nenhum formato novo aparece depois da letra 3 |
| variedade entre sessões? | Entre lições, baixa. Entre jogos, boa |
| reconhece hebraico de verdade ou fica bom nos exercícios? | Hoje, fica bom nos exercícios mais do que devia: 60% do que ele faz é reconhecer a forma entre opções |
| a dificuldade acompanha? | Na lição, não: a letra 15 é tão difícil quanto a letra 5. Nos jogos, sim, e o aluno não vê |
| risco de fadiga? | Médio, concentrado no meio do alfabeto |
| risco de abandono por repetição? | **Alto**, letras 8 a 11 |
| risco de abandono por dificuldade? | Baixo, com exceção de Bet, Kaf e Pe no fim |

---

## 16. As dez melhorias que mais aumentariam qualidade e aprendizado

Resposta direta à pergunta final, em ordem de retorno sobre esforço.

1. **Rotação nas camadas.** Acaba com a lição-carbono. Nenhum conteúdo novo, e
   é a diferença entre 22 lições e 1 lição repetida 22 vezes. *(P0-1)*
2. **Um item de recuperação ativa em toda fixação.** Muda o que a nota de 80%
   significa: de "reconhece" para "lembra". *(P0-4)*
3. **Camada de variante na fixação.** Uma linha, e fecha o buraco de ב, כ, פ, ש.
   *(P0-2)*
4. **Revisão por intervalo crescente, e por par.** Hoje Vav e Záyin nunca
   voltam depois de ensinadas, e ב/כ aparece 3 vezes no curso. As duas coisas
   se resolvem no mesmo bloco de código. *(P0-6 e P1-7)*
5. **Ache o erro.** O formato que mais sobe a dificuldade sem frustrar. *(P1-8)*
6. **Boss battle no fim de cada checkpoint.** O maior ganho de sensação de
   conquista por unidade de trabalho. *(P1-10)*
7. **Jogos gravando a habilidade certa.** Sem isso, todo o lado adaptativo do
   produto está sendo alimentado com dado enviesado. *(P0-3)*
8. **Blast por tempo, com aceleração.** Transforma o jogo mais genérico no mais
   viciante, reaproveitando o mesmo código. *(P2-14)*
9. **Modo "parecidas" da academia com exercícios de parecidas.** Hoje a tela
   promete uma coisa e entrega outra. *(P1-11)*
10. **Mostrar o nível e o recorde pessoal.** O sistema adapta a dificuldade e
    guarda recordes, e o aluno não vê nada disso. Progresso que não é visto não
    motiva. *(P2-20)*

**As gravações não estão nesta lista de propósito.** São o maior buraco do
produto e não são uma melhoria de exercício: são um projeto de estúdio. A
posição delas é acima de todas as dez.

---

## Apêndice A - inventário dos exercícios

### Geradores do motor (`app/src/lib/engine/generators.ts`)

28 geradores, agrupados por gesto. "Uso" é a contagem medida numa passagem
pelas 22 letras (528 itens).

| gerador | gesto | habilidade | uso |
|---|---|---|---|
| `exLetterRecognition` | escolher | rec | 125 |
| `exConfusablePick` | escolher | rec | 60 |
| `exSyllableReading` | escolher | ler | 59 |
| `exLetterInWord` | escolher | rec | 56 |
| `exBuildSyllable` | montar | ler | 46 |
| `exMatchLetterSound` | ligar | som | 36 |
| `exWordMeaning` | escolher | ler | 29 |
| `exPrintVsCursive` | escolher | rec | 22 |
| `exCursiveToPrint` | escolher | rec | 22 |
| `exLetterPosition` | escolher | rec | 22 |
| `exSentenceReading` | escolher | ler | 22 |
| `exFinalInWord` | escolher | rec | 10 |
| `exVowelSound` | escolher | som | 8 |
| `exLetterVariant` | escolher | som | 2 |
| `exVariantSyllable` | escolher | ler | 2 |
| `exOddOneOut` | escolher | rec | 2 |
| `exCompleteWord` | escolher | ler | 2 |
| `exVowelPair` | escolher | som | 1 |
| `exMatchSyllable` | ligar | ler | 1 |
| `exBuildWord` | montar | ler | 1 |
| `exFinalForm` | escolher | rec | 0 na lição |
| `exSoundToSyllable` | escolher | ler | 0 na lição |
| `exMeaningToWord` | escolher | ler | 0 na lição |
| `exMatchWordMeaning` | ligar | ler | 0 na lição |
| `exTypeTranslit` | digitar | ler | **0 em todo o curso** |
| `exAudioWord` | ouvir | ouvir | 0 (sem gravação) |
| `exListenSyllable` | ouvir | ouvir | 0 (sem gravação) |
| `exTypeHeard` | digitar | ouvir | 0 (sem gravação) |

Os quatro marcados "0 na lição" aparecem na academia, nos checkpoints ou no
exame - não estão mortos, estão fora do fluxo principal.

### Onde o aluno encontra exercício

| lugar | rota | composição | fonte |
|---|---|---|---|
| Prática da letra | `/licao/<id>` etapa 4 | 14 itens em camadas, 30% de revisão | `buildLetterPractice` |
| Fixação | `/licao/<id>` etapa 5 | 10 itens, vale 80% para destravar | `buildMiniTest` |
| Reforço | depois da fixação | 3 a 4 itens do que errou | `buildRemedial` |
| Escrever | `/licao/<id>` etapa 3 | 4 passos no canvas | `WritingCanvas` |
| Checkpoint | `/checkpoint/<n>` | 12 itens, 4 rec / 4 som / 4 ler | `buildCheckpoint` |
| Revisão | `/revisao` | 5 a 8 itens do SRS e das confusões | `buildReview` |
| Academia, 8 modos | `/academia` | 8 a 12 itens por modo | `buildGym` |
| Seis jogos | `/academia` | ver seção 8 | `deck.ts`, `jogos.ts` |
| Módulos 6 e 7 | `/extra/<slug>` | daguesh, finais, sem nikud, gerech | `extras.ts` |
| Desafio final | `/desafio-final` | 20 itens, 14 tipos, termina em cenas reais | `buildFinalChallenge` |
| Exame | `/exame` | 8 partes com nota por parte | `exam.ts` |

### Conteúdo disponível

22 letras · 132 sílabas · 99 palavras para ler · 72 para reconhecer ·
23 frases · 0 clipes de áudio.

---

## Apêndice B - como os números foram obtidos

Um censo temporário montou, com as mesmas sementes que o aluno recebe,
`buildLetterPractice` e `buildMiniTest` das 22 letras (528 itens), os 5
checkpoints, os 8 modos da academia com 6 e com 22 letras, o desafio final e as
partidas dos 6 jogos nos 3 níveis. Contou tipo, família, habilidade, posição da
resposta certa, número de alternativas, enunciados repetidos, assinaturas
duplicadas, pares de parecidas e sinais de vogal.

Os arquivos do censo foram apagados depois da medição: eles não são produto, e
um script de auditoria que fica no repositório vira um teste que ninguém roda.
Os dados brutos ficaram fora do repositório. Para repetir a medição, o método
está descrito acima e leva alguns minutos.

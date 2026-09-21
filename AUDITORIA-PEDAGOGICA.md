# Auditoria pedagógica - Alfabetização em Hebraico

Feita em 21/09/2026 contra o conteúdo real: `data/letters.json`, `data/modules.json`,
`data/nikud.json`, `data/extras.json`, `data/real-world.json`, o motor de exercícios
(`app/src/lib/engine/`), as regras de progressão (`app/src/lib/state/rules.ts`) e o
fluxo da lição (`app/src/app/licao/[letterId]/LessonClient.tsx`).

Os números abaixo foram contados, não estimados.

---

## A. Avaliação pedagógica geral

**O desenho de aprendizagem é forte. O que falha é a verificação e a produção.**

O curso acerta quase tudo o que costuma faltar num curso de alfabetização:
intercalamento real, revisão espaçada, rastreio de confusões por par, retirada
progressiva da transliteração e adaptação ao falante de português feita com
cuidado incomum. Isso não é elogio de cortesia: está nos dados, e é medível.

O que ele não faz é **impedir que alguém termine sem saber**. Não há nenhuma
exigência de acerto em lugar nenhum do caminho da lição. E não há nenhuma
produção em hebraico: o aluno digita sempre em alfabeto latino.

### O que está realmente forte

| | evidência |
|---|---|
| Intercalamento | ~30% de cada bloco de prática vem de letras ANTERIORES, priorizando as que custaram (`buildLetterPractice`, bloco cumulativo) |
| Mini-teste com memória | o 5º item do mini-teste é sempre de uma letra anterior, por construção |
| Revisão espaçada | Leitner de verdade: caixas de 1, 2, 4, 8 e 16 dias; sai do baralho com 4 acertos limpos |
| Confusões por PAR | ד respondido por ר é gravado como esse par, nas duas direções, e só se resolve com 2 acertos seguidos |
| Domínio por habilidade | cinco eixos (`rec`, `som`, `ler`, `ouvir`, `escrever`), cinco estados, e nenhuma porcentagem inventada na tela |
| Transliteração que some | `sempre` (menos de 8 letras) → `um toque` (menos de 16) → `sob pedido` (16+), em função do domínio e não de uma preferência |
| Variedade | 19 tipos de exercício, média de **14,7 aplicáveis por letra** (mín 9, máx 16) |
| Exame honesto | 7 partes, semente por tentativa - refazer é outra prova, não a mesma; o relatório nomeia a parte fraca e manda para o modo certo da Academia |
| Conquistas com lastro | 12, e a melhor delas (`sem apoio`) mede um fato: leu uma palavra inteira sem transliteração |
| Adaptação ao brasileiro | `brazilianMistake` nas **22 letras**, com qualidade real (ver seção G) |

### As três fraquezas que importam

1. **Áudio: 0 de 321 clipes.** Uma das cinco habilidades rastreadas (`ouvir`)
   nunca sai de "ainda não visto", em todas as 22 letras, para todo aluno.
2. **Não existe critério de domínio.** `finishStage(letra, 5)` dispara com
   qualquer nota. Dá para zerar todos os 22 quizzes e mesmo assim ter 100% de
   progresso, a conquista "22 letras" e o exame final destravado.
3. **O aluno nunca produz hebraico.** Digitação é sempre transliteração. O
   único gesto de produção em hebraico é o traçado com o dedo.

---

## B. Resultados de aprendizagem

| resultado | estado | observação |
|---|---|---|
| Reconhecer todas as letras | **ALCANÇADO** | 22 letras, reconhecimento em 4 geradores diferentes, exame parte 1 |
| Distinguir as formas finais | **ALCANÇADO** | `exFinalForm` + `exFinalInWord`, 5 finais, carta de cultura aos 12 domínios |
| Reconhecer variações da letra | **ALCANÇADO** | `exPrintVsCursive` e `exCursiveToPrint` - imprensa contra cursiva |
| Entender nikud básico | **PARCIAL** | 6 sons, 9 sinais, mas os pares de mesmo som nunca são contrastados (ver F) |
| Decodificar sílabas | **ALCANÇADO** | 132 sílabas, `exSyllableReading` + `exBuildSyllable` + `exMatchSyllable`, parte própria no exame |
| Ler palavras simples | **ALCANÇADO** | 99 palavras para ler, distribuídas pela ordem das letras |
| Ler frases básicas | **NÃO ALCANÇADO** | não existe nenhuma frase. O item mais longo do curso é `בֹּקֶר טוֹב`, duas palavras, numa cena |
| Distinguir letras parecidas | **PARCIAL** | forte na maioria, mas **Lámed não tem par declarado** e por isso nunca recebe esse exercício |
| Associar letra e som | **PARCIAL** | associação visual sim; sem gravação, o vínculo é letra↔descrição escrita, não letra↔som |
| Digitar hebraico | **NÃO INCLUÍDO** | toda digitação é transliteração. Não existe teclado hebraico em lugar nenhum |
| Escrever hebraico à mão | **ALCANÇADO** | etapa 3 de toda lição, cursiva, com 27 traçados de geometria real |
| Entender a direção da leitura | **ALCANÇADO** | explicado em `/inicio` e imposto pelo componente `<He>` em toda tela |
| Ler sem transliteração | **ALCANÇADO** | e medido: a conquista `sem apoio` registra o momento |
| Ler sem nikud | **PARCIAL** | módulo 6 trata disso com **8 palavras**. É a transição mais importante para o hebraico real e a que recebe menos material |

---

## C. Principais lacunas, por ordem de dano

### C1. O áudio ausente mata uma habilidade inteira

Não é "falta um extra". O curso rastreia `ouvir` por letra e mostra isso ao
aluno. Com zero clipes:

- o eixo `ouvir` fica travado em "ainda não visto" nas 22 letras, para sempre;
- a parte `escuta` do exame é filtrada fora (`partsFor`), então o exame mede 32
  itens em vez de 37;
- o modo `ouvir` da Academia fica indisponível ("Esperando as gravações");
- `exListenSyllable`, `exAudioWord` e `exTypeHeard` nunca são gerados.

E o dano pedagógico é pior para o público-alvo do que para outro qualquer: as
dificuldades brasileiras listadas na seção G são quase todas **sonoras**
(ח contra ה, ר raspado, ת que vira TCH, ש que vira S). O curso explica todas
por escrito, muito bem, e o aluno nunca ouve nenhuma.

**Onde entra:** onda 1 do manifesto, 168 clipes - nomes das letras, as 132
sílabas e os sinais de vogal. Só com ela, as cinco habilidades passam a existir.

### C2. Não há critério de domínio em lugar nenhum

`LessonClient` chama `p.finishStage(letter.id, 5)` no `onResult` do quiz, sem
olhar `r.score`. Consequência exata:

- uma letra conta como concluída com 0 de 8;
- `lettersMastered` conta etapas feitas, não acertos;
- `alphabetComplete` destrava o exame final com base nisso;
- a conquista "22 letras" e a barra de 100% saem do mesmo lugar.

O checkpoint tem barra de 70% (`PASS_MARK`), e o exame também - mas nada impede
seguir adiante sem passar. O aluno pode chegar ao fim do curso com falsa
confiança construída pelo próprio sistema.

**Recomendação:** não trancar a lição (frustra e o curso não é gate), mas
separar **"concluído"** de **"dominado"**:

- concluir a lição: como hoje, sem nota;
- `letra dominada` (o que alimenta conquistas, a barra e o destravamento do
  exame): exige **6 de 8 no quiz de fixação, em qualquer tentativa**;
- quem fecha a lição abaixo disso vê, no fim: *"Você concluiu. Esta letra ficou
  marcada para revisão - ela volta amanhã."* e entra no baralho do SRS na caixa 0.

Isso corrige a falsa confiança sem bloquear ninguém.

### C3. O retorno do erro nomeia a letra mas não a diferença

Hoje, ao errar uma parecida (`exConfusablePick`):

> "Essa é Dálet. Olhe o desenho de novo."

Isso diz **o que** e não diz **como distinguir**. O aluno erra de novo pelo
mesmo motivo. O dado não tem campo para isso - não existe nada em
`letters.json` que descreva a diferença visual entre um par.

**Recomendação:** um campo novo, `contrastes`, por par, com uma frase de traço
visual. Quinze frases resolvem o alfabeto inteiro. Exemplos:

| par | frase |
|---|---|
| ד / ר | "O ד tem um canto vivo no alto e um pezinho à direita. O ר é uma curva só." |
| ה / ח | "O ה tem uma fresta no alto à esquerda. O ח é fechado em cima." |
| ב / כ | "O ב tem um pé que avança para a direita. O כ é arredondado e não tem pé." |
| ו / ז | "O ז tem um chapéu que passa dos dois lados. O ו é um traço limpo." |
| ם / ס | "O ם é quadrado. O ס é redondo." |
| ן / ו | "O ן desce abaixo da linha. O ו para nela." |
| ט / מ | "O ט é uma panela aberta em cima. O מ é fechado." |
| ע / צ | "O צ tem o braço colado no alto. O ע tem os dois braços soltos." |

### C4. Lámed nunca recebe discriminação visual

`exConfusablePick` exige `confusableWith.length >= 2`. Lámed tem zero. Das 22
letras, é a única que atravessa o curso sem nenhum exercício de contraste.

**Recomendação:** declarar `["ן", "ו"]`. ל é a única letra que sobe acima da
linha, e contrastá-la com as duas que são traços verticais ensina exatamente
esse traço distintivo.

### C5. Os pares base/final não são contrastados

`confusableWith` não declara nenhum par entre uma letra e a sua própria final:
מ/ם, נ/ן, כ/ך, פ/ף, צ/ץ. Existe `exFinalForm` ("qual é a forma final de X?"),
que é outra pergunta - ela testa associação, não discriminação.

**Recomendação:** acrescentar a final ao `confusableWith` da própria base. Cinco
edições de uma palavra cada.

### C6. As duas primeiras lições são as mais fracas, e decidem tudo

Mem e Tav têm **zero palavras para ler** - inevitável, não há palavra com duas
letras. O motor sabe disso e o comentário do código admite: nas duas primeiras
letras ele repete geradores com outra rodada para chegar a dez itens.

O problema é de posição, não de conteúdo: são as duas lições que decidem se a
pessoa continua, e são as únicas sem o momento "eu li uma palavra".

**Recomendação:** trocar a ordem das três primeiras letras para **א, מ, ת**.
Com א e מ o aluno já lê `אִמָּא` (mãe) na lição 2 em vez da 3, e `אֵם` já na 2.
Ou, sem mexer na ordem: na lição 1, mostrar `מַיִם` marcado, dizendo "daqui a
quatro lições você vai ler isto sozinho" - a promessa concreta em vez da
palavra que ainda não existe.

### C7. A leitura para na palavra

Não existe frase. Nenhuma. Para um curso cujo objetivo declarado é "ler", parar
na palavra isolada deixa de fora a habilidade que o aluno acha que comprou.

**Recomendação:** 12 frases de 3 a 5 palavras, liberadas pela ordem das letras
como as cenas já são, a partir da letra 12 (quando ו entra e `שָׁלוֹם`,
`תּוֹדָה` e `יוֹם` já existem). Exemplos possíveis com o vocabulário atual:
`מִי אַתָּה?`, `אֲנִי מוֹרָה`, `הַיֶּלֶד גָּדוֹל`, `יֵשׁ לִי סֵפֶר`.

### C8. Ler sem nikud recebe 8 palavras

A maior parte do hebraico real não tem nikud. O módulo 6 trata disso com oito
palavras e uma lição. É a menor dose do curso para a maior mudança de hábito.

**Recomendação:** subir para 24 palavras, e distribuir: cada checkpoint a partir
do 3 termina com 3 palavras já conhecidas mostradas **sem os pontos**, com o
apoio a um toque. A transição deixa de ser um susto no módulo 6.

---

## D. Tipos de exercício que faltam

O inventário atual (19) é largo e cobre bem reconhecimento, leitura e montagem.
O que falta são quatro categorias, em ordem de valor:

| exercício | o que treina | onde entra |
|---|---|---|
| **Pares mínimos de vogal** | patach/kamats, segol/tsere, kubuts/shuruk - dois sinais, um som | novo gerador `exVowelPair`, na etapa 4 a partir da letra 4 |
| **Reconhecimento cronometrado** | automaticidade, que é o que separa decodificar de ler | novo modo da Academia, 20 letras em 60 segundos |
| **Digitação em hebraico** | produção real, com teclado | etapa 4 das letras 12+ e uma parte nova do exame |
| **Ditado de sílaba** | vínculo som→grafia (depende do áudio) | já existe como `exTypeHeard`, desligado por falta de clipe |

Não recomendo os outros da sua lista: memória, sorting e speed round repetem
habilidades já cobertas, e acrescentam manutenção sem acrescentar aprendizagem.

---

## E. Repetição e memória

**A frequência de revisão está correta e é melhor do que a que você pediu.**

O padrão que você descreveu (1 lição, 3 lições, 1 módulo, cumulativo) já existe,
em forma mais fina:

- **a cada lição**: ~30% do bloco de prática é de letras anteriores, com as
  fracas primeiro;
- **a cada mini-teste**: o item 5 é sempre de uma letra anterior;
- **por dia**: Leitner com 1, 2, 4, 8 e 16 dias, saindo do baralho com 4 acertos;
- **por módulo**: checkpoint de 12 itens cobrindo `rec`, `som` e `ler` em partes
  iguais, e não 12 sorteios do mesmo saco;
- **sob demanda**: modo "Revisão personalizada" na Academia, alimentado pelas
  letras fracas e pelos pares de confusão.

Não recomendo mexer. A única correção é a **caixa 0 automática para letra
concluída com nota baixa** (ver C2), que hoje não acontece.

---

## F. Progressão de leitura

A progressão letra → sílaba → palavra é suave e bem construída. Os dois pontos
de ruptura:

1. **Lições 1 e 2 sem palavra** (ver C6).
2. **Palavra → frase não existe** (ver C7). O aluno sai do curso sabendo
   decodificar palavras isoladas e nunca viu duas palavras juntas.

E uma lacuna interna ao nikud: `exVowelSound` monta os distratores a partir das
seis sílabas da letra, que são **um som cada**. Então a pergunta "que vogal está
escrita aqui?" nunca oferece patach contra kamats - os dois sinais de "a". A
dificuldade real do nikud, que a própria introdução do curso nomeia ("dois
sinais para um som é a dificuldade de verdade"), é a única que nenhum exercício
treina.

---

## G. Adaptação ao aluno brasileiro

**Esta é a parte mais forte do curso, e é o seu diferencial real.** As 22 letras
têm nota de erro brasileiro, e elas são específicas de verdade:

- **ת**: "Na maior parte do Brasil o T antes de I e E vira TCH." Correto e
  invisível para quem não é professor.
- **ה**: "Em português o H escrito é sempre mudo - hotel é otel."
- **ש**: "A forma não lembra nada do alfabeto latino, então o cérebro brasileiro
  tende a encaixá-la no S."
- **ר**: "É exatamente o R carioca de porta. Para o brasileiro, é presente de
  graça." Enquadrar uma letra difícil como vantagem é excelente.
- **ח**: "A transliteração ch vem do alemão e do espanhol, não do português."
- **ע**: "É o mesmo problema de cassa e caça em português."
- **ב**: o daguesh explicado com "olhe o ponto antes de decidir".

E as **palavras-ponte** (4 a 6 por letra, 95 no total) são um acerto que eu não
esperava: `תל אביב`, `מרתון`, `שמפו`, `קטשופ`, `הליקופטר`. O aluno lê hebraico
de verdade na primeira lição porque a palavra já está na cabeça dele.

**O que falta aqui:** nada de conteúdo. Falta **som**. Toda dificuldade acima é
auditiva e está explicada apenas por escrito. A onda 1 do áudio converte o maior
diferencial do curso de "bem explicado" em "treinável".

Uma adição barata: **um exercício de par mínimo brasileiro** por letra crítica,
a partir do áudio - `ח` contra `ה`, `ר` contra o R batido, `ת` contra `תְ` antes
de i. Seis exercícios, direcionados ao erro que a nota já prevê.

---

## H. Onde o aluno pode desistir

1. **Lições 1 e 2**, pelo motivo de C6: são as mais pobres e vêm primeiro.
2. **O meio do módulo 4** (letras 16 a 19: ס, ע, צ, ק). Quatro letras seguidas
   sem forma final nova, sem daguesh, e com as cenas do mundo real escasseando
   entre as ordens 14 e 17. É o trecho mais plano do curso.
3. **A repetição das 5 etapas.** A estrutura é idêntica nas 22 letras. Na letra
   18, "Conhecer" com a mesma profundidade da letra 1 é tempo cobrado de quem já
   sabe o que fazer.
4. **O módulo 6**, que é onde o curso fica mais difícil (ler sem pontos) e ao
   mesmo tempo mais curto.

---

## I. Melhorias de engajamento

Tudo o que segue resolve um problema de aprendizagem nomeado, não é enfeite.

- **Etapa 1 encolhida a partir da letra 12.** Quem já fez onze lições não
  precisa da mesma introdução. Mostrar a letra, o som e ir direto para as
  sílabas, com "ver a explicação completa" a um toque. Resolve H3.
- **Cena do mundo real garantida a cada 3 letras.** Hoje há um vão entre as
  ordens 14 e 17. Resolve H2.
- **"Ainda lembra?" na abertura da lição.** Uma pergunta só, de uma letra da
  caixa mais atrasada do SRS, antes de começar. Custa 8 segundos e transforma
  cada lição num ponto de recuperação.
- **Fim de lição com o número que importa.** Hoje o fim diz o destino. Deveria
  dizer: "Você já reconhece 9 das 22 letras" e "as palavras que você já
  consegue ler: 31". O segundo número é o que o aluno comprou.

---

## J. Auditoria de gamificação

| recurso | veredito | motivo |
|---|---|---|
| Sequência de dias (streak) | **ALTO VALOR** | já existe; alfabetização depende de frequência, não de sessões longas |
| Meta diária | **ALTO VALOR** | já existe (5 XP); mantém a sessão curta, que é o formato certo |
| Medidor de domínio por letra | **ALTO VALOR** | já existe, com cinco estados e sem porcentagem falsa. É o melhor elemento do painel |
| Revisão personalizada | **ALTO VALOR** | já existe na Academia |
| Conquistas | **ALTO VALOR** | 12, todas com lastro. `sem apoio` é exemplar |
| XP | **POSSIVELMENTE ÚTIL** | inofensivo como termômetro de esforço; não deve destravar nada |
| Desafio diário | **POSSIVELMENTE ÚTIL** | só depois que houver alunos e dados de abandono |
| Certificado | **POSSIVELMENTE ÚTIL** | já existe e exige o exame passado, o que é correto |
| Níveis | **BAIXO VALOR** | duplicaria o medidor de domínio, com menos informação |
| Vidas / corações | **EVITAR** | punir erro em alfabetização é o contrário do que se quer. O erro aqui é dado de diagnóstico |
| Placar / ranking | **EVITAR** | adulto iniciante comparado com desconhecidos abandona |
| Selos decorativos | **EVITAR** | a régua atual (conquista = fato verificável) é melhor e deve ser defendida |
| Teste de nivelamento | **BAIXO VALOR** | o público é zero absoluto por definição |

---

## K. Aprendizagem personalizada

**Já existe, e é bom.** `weakLetters` ordena por itens vencidos no SRS,
habilidades fracas e pares de confusão; o modo "Revisão personalizada" da
Academia consome isso.

As duas costuras que faltam:

1. **Disparo automático de contraste.** Quando um par de confusão chega a `n >= 3`,
   inserir 3 itens daquele par no próximo bloco de prática, antes de qualquer
   outra coisa. Hoje o par é registrado e só é usado se o aluno abrir a Academia
   por conta própria.
2. **Letra concluída com nota baixa entra na caixa 0** (ver C2).

Nada além disso. O sistema já é mais fino do que precisa ser.

---

## L. Sugestões lição a lição

| módulo | o que mudar |
|---|---|
| **M1** (מ ת א נ ה י) | Ordem para א, מ, ת: adianta `אִמָּא` em uma lição. Na lição 1, prometer `מַיִם` marcado. Depois de ה, inserir 6 itens de contraste ה/ח/ת - são três letras parecidas e duas já estão na mão |
| **M2** (ג ד ש ל ר) | Logo depois de ד e ר na mesma lição 4/5, inserir **8 itens de discriminação ד/ר**: é o par mais confundido do alfabeto e as duas chegam com uma lição de diferença. Declarar o par de Lámed |
| **M3** (ו ז ח ט) | Contraste ו/ז/ן logo após ז. Depois de ח, um par mínimo ח/ה (precisa de áudio) |
| **M4** (ס ע צ ק) | Trecho mais plano do curso: garantir uma cena do mundo real a cada letra aqui. Contraste ס/ם e ע/א |
| **M5** (ב כ פ) | O módulo do daguesh é o mais conceitual. Inserir um exercício "com ponto ou sem ponto?" antes do quiz: mostra a palavra, o aluno escolhe o som |
| **M6** (sem o ponto) | Triplicar as palavras sem nikud, de 8 para 24, e antecipar 3 delas para cada checkpoint a partir do 3 |
| **M7** (sons modernos) | Correto e bem dimensionado. Nada a mudar |
| **Exame** | Acrescentar uma parte de **frases** (3 itens) quando C7 estiver feito, e trocar `exTypeTranslit` por digitação em hebraico na parte "palavras" quando o teclado existir |

---

## M. As 20 melhorias, por impacto

| # | melhoria | razão pedagógica | onde | esforço |
|---|---|---|---|---|
| 1 | Gravar a onda 1 (168 clipes) | destrava a habilidade `ouvir` e converte todas as notas brasileiras de explicação em treino | estúdio + `public/audio/` | grande |
| 2 | Domínio exige 6/8 no quiz | acaba com a falsa confiança construída pelo próprio sistema | `LessonClient` + `rules.ts` | pequeno |
| 3 | Letra fraca entra na caixa 0 do SRS | a revisão passa a pegar quem passou raspando | `rules.ts` | minúsculo |
| 4 | Campo `contrastes` e retorno que nomeia a diferença | erro repetido pelo mesmo motivo é erro não corrigido | `letters.json` + `generators.ts` | pequeno |
| 5 | Par de confusão com n>=3 injeta 3 itens na próxima prática | fecha o laço entre diagnóstico e tratamento | `exercises.ts` | pequeno |
| 6 | 12 frases curtas a partir da letra 12 | é a habilidade que o aluno acha que comprou e não recebe | `data/` + novo gerador | médio |
| 7 | Pares mínimos de vogal (patach/kamats etc.) | a dificuldade real do nikud, hoje não treinada | novo `exVowelPair` | pequeno |
| 8 | Ordem A-M-T no módulo 1 | adianta a primeira palavra lida em uma lição inteira | `letters.json` | minúsculo |
| 9 | Declarar par de Lámed e os pares base/final | seis letras sem discriminação visual hoje | `letters.json` | minúsculo |
| 10 | Sem nikud de 8 para 24 palavras, antecipadas nos checkpoints | maior mudança de hábito, menor dose atual | `extras.json` | médio |
| 11 | Etapa 1 encolhida a partir da letra 12 | tempo cobrado de quem já sabe o ritual | `LessonClient` | pequeno |
| 12 | "Ainda lembra?" na abertura da lição | recuperação distribuída, 8 segundos por lição | `LessonClient` | pequeno |
| 13 | Fim de lição com "palavras que você já lê: N" | o número que corresponde ao que foi comprado | `StageFixacao` | pequeno |
| 14 | Cena do mundo real a cada 3 letras | tapa o vão entre as ordens 14 e 17 | `real-world.json` | pequeno |
| 15 | Digitação em hebraico com teclado na tela | única produção real além do traçado | novo componente | médio |
| 16 | Reconhecimento cronometrado na Academia | automaticidade, que hoje não é medida em lugar nenhum | `gym.ts` | médio |
| 17 | "Com ponto ou sem ponto?" no módulo 5 | o daguesh é conceito, e conceito precisa de item próprio | `generators.ts` | pequeno |
| 18 | Pares mínimos brasileiros (ח/ה, ר, ת/tch) | ataca o erro que a nota já prevê | depende de (1) | pequeno |
| 19 | Parte de frases no exame | o exame mede o que o curso passar a ensinar | `exam.ts` | pequeno |
| 20 | Relatório de fim de curso com o mapa das 22 letras | o encerramento é a transição para o A1 | `/concluido` | pequeno |

---

## N. Quinze atividades novas

1. **Qual "a" é este?** - objetivo: separar patach de kamats. Vê duas sílabas com
   a mesma consoante e sinais diferentes; escolhe a que soa como o exemplo.
   Retorno: "As duas fazem `a`. A diferença é o desenho: o kamats tem um traço
   embaixo do ponto." A partir da letra 4.
2. **Onde está o ponto?** - daguesh. Vê `בּ` e `ב` e escolhe o som. Retorno mostra
   a palavra real que muda de sentido. Módulo 5.
3. **Ela desceu?** - formas finais. Vê uma palavra e decide se a última letra é
   final. Retorno: "Quase todas as finais descem abaixo da linha." Após a 1ª final.
4. **Sessenta segundos** - automaticidade. 20 letras aleatórias em 60 segundos,
   toca a que corresponde ao som escrito. Sem punição por erro; mede tempo médio.
   Academia, a partir de 10 letras.
5. **A mesma letra, outra roupa** - vê a letra em cursiva e escolhe a impressa.
   Já existe como gerador; falta virar modo da Academia.
6. **Complete a placa** - vê uma cena real com uma letra apagada e a escolhe.
   Após cada cena nova.
7. **Sem os pontos** - vê uma palavra conhecida sem nikud e escolhe qual é.
   A partir do checkpoint 3.
8. **Escreva em hebraico** - teclado na tela, digita a palavra que ouviu ou leu.
   Letras 12+.
9. **Duas palavras** - primeira frase, 2 a 3 palavras, com apoio a um toque.
   A partir da letra 12.
10. **Qual delas você ouviu?** - par mínimo ח/ה. Depende do áudio. Módulo 3.
11. **O seu nome em hebraico** - digita o nome em português e vê a transcrição,
    letra por letra, marcando as que já aprendeu. Uma vez, no fim do módulo 2.
12. **Ordene a palavra** - já existe (`exBuildWord`); falta aparecer com palavra
    de 4+ letras nos módulos finais.
13. **Achou o intruso?** - já existe (`exOddOneOut`); falta a versão com a letra
    dentro de palavras em vez de solta.
14. **Leia antes de ouvir** - mostra a palavra, o aluno lê em voz alta, e só
    então libera o áudio para comparar. Depende de (1). Etapa 2 de toda lição.
15. **O alfabeto em 3 minutos** - as 22 letras em sequência, no fim do curso, com
    o tempo registrado. Vira a foto do que a pessoa conquistou. `/concluido`.

---

## O. Roteiro

### Antes de vender

Custo baixo, dano alto se faltar.

- 2, 3 (domínio e caixa 0) - acaba com a falsa confiança
- 8, 9 (ordem A-M-T, pares de Lámed e base/final) - duas edições de dado
- 4 (campo `contrastes` e retorno com a diferença) - 15 frases
- 13 (fim de lição com "palavras que você já lê")

### Primeiro mês

Depois de ver onde as pessoas param de verdade.

- 1 (onda 1 do áudio) - é o maior salto do produto inteiro
- 5, 7, 12, 14, 17
- 6 (as 12 frases)

### Depois, com alunos reais

- 10, 11, 15, 16, 18, 19, 20
- Desafio diário e qualquer coisa de ritmo: só com dados de abandono na mão

---

## Uma observação final

O curso tem um diferencial que nenhum concorrente internacional tem e que não
está sendo usado na venda: **ele foi escrito para o ouvido brasileiro**, letra
por letra, com as 22 notas de erro e as 95 palavras-ponte. Isso não é adaptação
de tradução; é conteúdo original que só serve para este público.

A ironia é que esse diferencial é sonoro e o produto ainda não tem som.

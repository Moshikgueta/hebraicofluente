# Hebraico A1: auditoria e plano (06/10/2026)

Arquivo de trabalho, não aparece para o aluno. Responde ao pedido do dono de
transformar o A1 num curso completo, do zero ao A1 funcional, para brasileiros.
Feito ANTES de qualquer mudança. Nada aqui muda decisão já aprovada sem o dono
dizer que muda: onde o pedido novo e uma decisão antiga se cruzam, o conflito
está listado na seção 7, para ele decidir.

## 1. Estado atual

O site tem hoje dois cursos, com acesso separado (worker/src/gate.js,
`cursoDaRota`):

### 1.1 Alfabetização (`alfabetizacao`, à venda)

| Peça | O que existe | Onde |
|---|---|---|
| Letras | 22 letras, 7 módulos, 27 lições numeradas, 5 etapas por lição | data/letters.json, data/modules.json |
| Formas finais | as 5 (ם ן ץ ך ף), exercício próprio | M1, M4, M5, M6 |
| Cursiva | impressa x cursiva, traçado, ordem dos traços, escrever palavras | lib/cursiva.ts, StrokeOrder, WritingCanvas, ImpressaCursiva |
| Nikud | a, e, i, o, u por som (patach/kamatz, segol/tsere, chirik, cholam, kubutz/shuruk) e sheva | data/nikud.json |
| Dagesh | só בּ כּ פּ (begadkefat do hebraico moderno) | M5, M6, extras.json |
| Shin/sin | lição própria | M2 |
| Sons modernos | צ׳ ג׳ ז׳ (gerech), lições de som (vet, chaf, fe, tch, dj, j) | M7, /som |
| Leitura sem nikud | lição 23 e grupos de palavras sem pontos | M6, extras.json |
| Textos | 23 frases, 12 textinhos, 17 cenas do mundo real, 7 missões | sentences, textos, real-world, missoes |
| Cultura | 10 cartões (origem do alfabeto, renascimento, finais, shekel...) | culture.json, /historia |
| Bônus | 22 leituras bíblicas + guia do nikud bíblico | bonus.json, /biblia, /nikud-biblico |
| Vocabulário ilustrado | 102 palavras com imagem | imagens-vocabulario.json |
| Áudio | 581 clipes no catálogo, 539 gravados; botão lento 0,7x | audio.json, AudioButton |
| Exercícios | 26 tipos (reconhecer, ler sílaba, ouvir, montar, digitar, ligar, cena...) | lib/engine, ExercisePlayer |
| Revisão | Leitner 5 caixas (1/2/4/8/16 dias) só para o que errou | lib/state/rules.ts, /revisao |
| Habilidades | 5 por letra (reconhecer, som, ler, ouvir, escrever), com acertos seguidos | state.skills |
| Gamificação | XP (teto diário de XP por acerto), sequência, meta diária, 17 conquistas, loja de XP, jogos | lib/state, /conquistas, lib/loja.ts |
| Checkpoints | um por módulo, 70%, tentativas sem limite | /checkpoint/[n] |
| Exame e certificado | desafio final por partes; certificado PNG desenhado no navegador | /desafio-final, lib/certificate.ts |
| Painel | "Meu hebraico" com uma ação do dia | /meu-hebraico |
| Selos de conteúdo | 💡 dica · 🇧🇷 para quem fala português · ⚠️ erro comum · 🧠 padrão · 📖 curiosidade | lib/selos.ts |
| Acessibilidade | zoom, tema, alto contraste, menos movimento, espaçamento, ouvir instruções | lib/acessibilidade.ts |
| Estatísticas | contagens anônimas por dia: acerto/erro por tipo e lição, funil de etapas | worker/src/api/estatisticas.js, /admin/estatisticas |
| Progresso | um estado por conta em D1 (/api/progress), fusão entre aparelhos no app | lib/state/merge.ts |

Conclusão: o "Módulo 0" que o pedido descreve (alfabeto, finais, cursiva,
nikud, dagesh, shin/sin, leitura progressiva, sem transliteração) **já existe e
é o curso de alfabetização**. Não deve ser refeito dentro do A1.

### 1.2 Hebraico A1 (`hebraico-a1`, escondido, só o administrador abre)

- 8 unidades aprovadas pelo dono, 236 entradas de vocabulário, 30 explicações
  de gramática (19 com erro comum), 8 diálogos, 158 exercícios.
- 12 tipos de item: escolha, ouvir, ligar, separar, montar, completar, erro,
  vf, intruso, escrever, tabela, aberta.
- Exame aprovado (6 partes x 6 itens, 4 sorteados, 70%) e textos do
  certificado aprovados. **Telas do exame e do certificado ainda não feitas.**
- Conteúdo pago servido por /api/content/a1 (só quem tem o A1), estado em
  `state.a1` (gênero, nota por unidade, exame).
- Telas: /a1, /a1/unidade/N, /a1/unidade/N/exercicios. Sem link no menu.

Mapa atual:

| # | Sei fazer | Gramática principal |
|---|---|---|
| 1 | Me apresentar | pronomes do singular, frase sem "ser", você m/f |
| 2 | Dizer o que/quem é | זֶה / זֹאת, מִי/מָה |
| 3 | Descrever | plural, adjetivo concorda, הַ־, pronomes do plural |
| 4 | O que faço, onde moro | presente em 4 formas, בְּ־ |
| 5 | Comer, querer | verbos em ה, אֶת, negação, בַּ |
| 6 | Tenho / é meu | יֵשׁ/אֵין, יֵשׁ לִי, שֶׁלִּי, família |
| 7 | Números, hora, preço | 11 a 100, הַשָּׁעָה, preço, dias da semana |
| 8 | Me virar numa conversa | לְ e שֶׁל com finais, עִם com finais |

## 2. Lacunas pedagógicas

O A1 atual corresponde mais ou menos à **primeira metade** de um A1 (o que o
livro de base cobre nos primeiros capítulos). Para o aluno sair dizendo "eu
consigo usar hebraico", falta:

### 2.1 Situações comunicativas que não existem

| Situação | Hoje |
|---|---|
| Rotina (acordar, ir, voltar, partes do dia) | não existe |
| Gostos e hobbies (אוֹהֵב + infinitivo) | não existe |
| Querer/precisar/poder + infinitivo (רוֹצֶה לִ־, צָרִיךְ, יָכוֹל) | só רוֹצֶה + substantivo |
| Casa e localização (עַל, לְיַד, בֵּין, אֵצֶל) | não existe |
| Cidade, transporte, direções (לְאָן, ônibus, táxi, à direita) | não existe |
| Café e restaurante (pedir, a conta, אֶפְשָׁר) | parcial (U5 tem comida, não tem pedir) |
| Compras e roupas (tamanho, caro/barato, pagar) | parcial (U7 tem preço) |
| Meses, datas, clima | só dias da semana |
| Marcar compromisso, convidar, recusar com motivo (כִּי) | não existe |
| Viagem: aeroporto, hotel | não existe |
| Corpo e saúde básica (כּוֹאֵב לִי, farmácia) | não existe |
| Contar o que fez ontem (passado muito frequente) | não existe |
| Expressões israelenses de rua (סַבָּבָּה, יַאללָה, מַה נִשְׁמָע, שַׁבָּת שָׁלוֹם) | não existe |

### 2.2 Gramática do pedido que ainda falta

לְאָן · אֵיזֶה/אֵיזוֹ/אֵילוּ · infinitivo · צָרִיךְ · יָכוֹל · אוֹהֵב · יוֹדֵעַ ·
הוֹלֵךְ · בָּא · עוֹשֶׂה · מְבַקֵּשׁ · אוֹמֵר · עַל · אֵצֶל · לִפְנֵי · אַחֲרֵי ·
בֵּין · כִּי · אָז · meses e datas · passado frequente.

Já cobertos: frase sem "ser", os 10 pronomes, gênero e número, concordância,
הַ־, adjetivos, יֵשׁ/אֵין/יֵשׁ לִי/אֵין לִי, מִי, מָה, אֵיפֹה, מֵאֵיפֹה, מָתַי,
לָמָּה, אֵיךְ, כַּמָּה, בְּ, לְ, מִ, עִם, שֶׁל, posse, números de contar, preço,
hora, dias, presente em 4 formas, negação, וְ, אֲבָל, גַּם.

### 2.3 Pronúncia para brasileiros

O alfabeto trata cada som na sua letra (boca, erro típico do brasileiro). Falta
uma **ponte de pronúncia** no começo do A1 que junte o que vira problema na
FALA, não na leitura: ר israelense, ח/כ (não é o R do português), ה no começo
(não some), ע/א (o "corte" da vogal), צ, sílaba tônica (quase sempre a última),
ritmo, e pares que o ouvido brasileiro confunde.

### 2.4 Leitura e escuta

- Leitura: só os diálogos e um texto no exame. Falta texto curto do mundo real
  por unidade (placa, cardápio, mensagem, formulário), com nikud desaparecendo
  (decisão 1).
- Escuta: 2 itens "ouvir" por unidade, e nenhum áudio gravado ainda (as
  gravações do A1 são a etapa 4). Falta ditado e diálogo ouvido sem texto.

### 2.5 Revisão e progressão

- Errar no A1 não alimenta nenhuma revisão: um item errado volta uma vez na
  mesma rodada e some.
- Sem checkpoint entre unidades: o exame final é a primeira avaliação
  cumulativa.
- Sem visão por habilidade (leitura, escuta, vocabulário, gramática, escrita).

### 2.6 Cultura

Nenhuma caixa de cultura israelense no A1, nenhuma curiosidade, nenhuma trilha
de história da língua (o alfabeto tem 10 cartões; `eras.json` tem um par só).

### 2.7 Repetição e progressão: o que está bem

Não achei conteúdo repetido entre unidades: cada unidade reaproveita o
vocabulário anterior de propósito (por exemplo, U8 reusa tudo). Não achei item
que dependa de algo ainda não ensinado (os testes de dados conferem respostas
sem nikud; a ordem foi revisada unidade a unidade com o dono). Manter.

## 3. Lacunas técnicas

| # | Lacuna | Risco |
|---|---|---|
| T1 | O A1 é uma lista plana de 8 unidades, com `UNIDADES_A1` escrito à mão. Não há "módulo" nem "bloco" | não escala para 20 unidades nem para A2/B1 |
| T2 | Cada unidade tem uma forma fixa (palavras, gramática, diálogo, exercícios). Não há bloco de situação, de cultura, de "Você sabia?", de leitura | as caixas pedidas não têm onde morar |
| T3 | O conteúdo inteiro sai numa resposta só (92 KB hoje; passaria de 250 KB com o A1 completo) | primeira abertura lenta no celular |
| T4 | Feedback por opção não existe: só um `porque` por item | o pedido quer "Quase. בית é masculino..." para o erro escolhido |
| T5 | Sem revisão espaçada no A1 | o que se erra não volta |
| T6 | Certificado do alfabeto é PNG feito no navegador, a partir do estado local; **sem identificador, sem conferência no servidor, sem página de verificação** | dá para "passar" mexendo no estado do navegador (é o que o pedido proíbe) |
| T7 | O exame do A1 ainda não tem tela; se for feito como o do alfabeto, corrige no navegador | mesma falha do T6 |
| T8 | Transliteração do alfabeto desaparece sozinha por progresso, sem chave do aluno; o A1 mostra sempre | o pedido quer a chave "Mostrar transliteração" com incentivo para desligar |
| T9 | Áudio: botão lento existe, mas o A1 ainda não tem nenhuma gravação | escuta escondida até gravar |
| T10 | Estatísticas existem, mas o A1 não manda eventos | o dono não sabe onde o aluno do A1 trava |
| T11 | Componentes de exercício do A1 (A1Player) e do alfabeto (ExercisePlayer) são separados | normal: um é de letra, o outro de frase. Não juntar à força |

## 4. O que reaproveitar (não refazer)

- **Acesso por curso**, conteúdo pago por rota da API, marca d'água: prontos.
- **Estado do aluno com fusão** entre aparelhos e testes de comutatividade: o
  A1 já mora em `state.a1`; a revisão do A1 entra ali, com a mesma regra.
- **Leitner** de lib/state/rules.ts: mesmas caixas e intervalos, com ids de
  item do A1. O pedido dá os nomes reviewAgain/reviewSoon/reviewLater/mastered:
  são as caixas 0, 1-2, 3 e 4.
- **AudioButton** com 0,7x, painel /admin/gravar, conferência de gravações.
- **TypeHebrew + teclado virtual**, **MatchPairs**, régua de resposta escrita
  sem nikud (`hebraicoDigitadoCerto`).
- **Selos** (lib/selos.ts): o "Brasileiro, cuidado!" é o selo ⚠️ "Erro comum"
  com o `erroPt` que as explicações do A1 já têm; o "Você sabia?" é o selo 📖.
  Mesmo desenho dos dois cursos, sem identidade nova.
- **Estatísticas anônimas**: só acrescentar chaves `a1-uN`.
- **Acessibilidade** e menos movimento: valem no A1 sem mudança.
- **Imagens** (102 palavras ilustradas): servem para "imagem → palavra" onde a
  palavra já está no A1.

## 5. Estrutura recomendada

Decisão de desenho: **as 8 unidades aprovadas ficam na ordem em que estão**
(o exame e as revisões já apontam para elas pelo número). As missões do pedido
viram **módulos que agrupam unidades**, e as unidades novas entram depois,
numeradas de 9 em diante. Os nomes dos módulos seguem o conteúdo real; onde a
sugestão do pedido não bate com a ordem aprovada, o nome muda, não a ordem.

| Módulo | Unidades | Sei fazer |
|---|---|---|
| 0 Começando no hebraico | curso de alfabetização + **U0 Ponte** (nova) | ler as letras e o nikud; pronunciar os sons difíceis para brasileiros; as expressões que se ouve em Israel no primeiro dia |
| 1 Eu e você | U1, U2 | me apresentar, perguntar quem é e o que é |
| 2 Minha vida | U3, U4 | descrever; dizer o que faço, onde moro |
| **Checkpoint 1** | U0 a U4 | |
| 3 Comer, querer e ter | U5, U6 | dizer o que como e quero; família, o que tenho |
| 4 Números e conversa | U7, U8 | preço, hora, dias; conversar |
| **Checkpoint 2** | U1 a U8 | |
| 5 Minha rotina | **U9** meu dia · **U10** gostos e planos | rotina, partes do dia, לִפְנֵי/אַחֲרֵי, אָז; אוֹהֵב/רוֹצֶה/צָרִיךְ/יָכוֹל + infinitivo, כִּי |
| 6 Casa e cidade | **U11** onde fica · **U12** como eu chego | עַל, לְיַד, בֵּין, אֵצֶל; לְאָן, transporte, direções |
| **Checkpoint 3** | U5 a U12 | |
| 7 Comida e compras | **U13** no café e no restaurante · **U14** nas lojas | pedir, a conta, אֵיזֶה/אֵיזוֹ/אֵילוּ, אֶפְשָׁר; roupas, tamanho, caro/barato, pagar |
| 8 Tempo e compromissos | **U15** dias, meses e clima · **U16** marcar e convidar | datas, מָתַי, clima; telefone, mensagem, aceitar e recusar |
| **Checkpoint 4** | U9 a U16 | |
| 9 Israel na vida real | **U17** viagem e hotel · **U18** corpo e saúde · **U19** quantos e de quem | aeroporto, hotel; כּוֹאֵב לִי, farmácia; os números com gênero (שְׁלוֹשָׁה יְלָדִים, שָׁלוֹשׁ בָּנוֹת) e a סְמִיכוּת (בֵּית סֵפֶר, חֲדַר שֵׁנָה) |
| 10 Consolidação | **U20** um dia em Israel (simulação) + exame final + certificado + encerramento | usar tudo junto |

Total: 21 unidades (13 novas), 4 checkpoints, exame, certificado. Meta de
vocabulário ativo ao fim: perto de 600 entradas (236 hoje + cerca de 25 por
unidade nova), dentro do que se espera de um A1.

### 5.1 Forma de cada unidade (blocos)

Uma unidade passa a ser uma lista de blocos, cada um opcional, na ordem
COMPREENDER → PERCEBER → PRATICAR → PRODUZIR → REVISAR → USAR:

| Bloco | Conteúdo | Hoje |
|---|---|---|
| objetivo | "Depois desta unidade você consegue..." | existe (`objetivoPt`) |
| situacao | a cena real (onde, com quem) | novo |
| palavras | vocabulário com áudio | existe |
| ouvir | escuta antes de ler (diálogo sem texto, perguntas) | novo |
| dialogo | o diálogo com texto | existe |
| gramatica | explicação + ⚠️ Brasileiro, cuidado! | existe |
| pratica | exercícios guiados → reconhecer → produzir | existe (exercícios) |
| leitura | texto curto do mundo real, nikud desaparecendo | novo |
| cultura | caixa "Em Israel" | novo |
| sabia | 📖 Você sabia? (opcional, curto) | novo |
| desafio | mini desafio de produção (mensagem, formulário) | parcial (`aberta`) |
| autoavaliacao | "Eu consigo..." marcado pelo aluno | novo |

O arquivo de dados ganha `modulos` (lista de módulos com as unidades de cada
um) e `checkpoints`; as unidades antigas continuam válidas como estão (os
blocos novos são opcionais), para não reescrever conteúdo aprovado.

### 5.2 Tipos de exercício

Os 12 tipos atuais cobrem escolha, V/F, lacuna, montar frase, ligar pares,
classificar (m/f, singular/plural), intruso, achar e corrigir erro, português
→ hebraico, tabela de formas, produção aberta, áudio → frase. Entram:

| Novo tipo | Para quê |
|---|---|
| `ditado` | ouvir e escrever (sem nikud) |
| `dialogo` | completar ou escolher a resposta natural dentro de uma conversa |
| `ordenar` | pôr as falas de um diálogo na ordem (toque, sem arrastar) |
| `imagem` | imagem → palavra e palavra → imagem, com as 102 ilustrações |
| `leitura` | perguntas sobre o texto do bloco leitura |
| feedback por opção | `dicas: { "1": "Quase. ..." }` em escolha, completar, erro |

Arrastar e soltar: sempre com alternativa de toque (o "montar" já é por toque).
Nenhum exercício depende de hover.

## 6. Revisão, caderno, gamificação, exame e certificado

- **Minha revisão (A1):** cada item errado entra numa caixa Leitner com o id da
  unidade e do item; as palavras erradas entram pela palavra. Sessão de revisão
  mistura: atrasados primeiro, depois difíceis, depois aprendidos recentemente.
  Estados visíveis: rever agora · rever logo · rever depois · dominado.
- **Meu hebraico (A1):** palavras aprendidas (das unidades concluídas),
  favoritas (estrela), difíceis (da revisão), frases salvas (dos diálogos),
  erros frequentes, histórico. Tudo em `state.a1`, sincronizado pela fusão.
- **Competências:** leitura, escuta, vocabulário, gramática, escrita, cada uma
  = acertos na primeira tentativa / itens respondidos, por tipo de item. Mostra
  "ainda sem dados" antes de 10 respostas. Nada inventado.
- **Gamificação:** a XP e as conquistas que já existem, com conquistas do A1
  (primeiras 10 palavras, primeira frase lida, primeiro diálogo, 100 palavras,
  sem transliteração, sobrevivência em Israel, A1 concluído). Nada de conteúdo
  principal travado por XP (regra do dono). A trilha de história é bônus aberto.
- **Checkpoints:** 4, cumulativos, sorteados de bancos próprios, 70%,
  tentativas livres; abaixo de 70% numa habilidade, aponta as unidades.
- **Exame final, corrigido no servidor:** o Worker sorteia a prova, entrega as
  perguntas **sem gabarito**, guarda o sorteio, recebe as respostas e corrige.
  A aprovação fica numa tabela própria em D1, não no estado do aluno. A nota
  por habilidade, os pontos fortes e "antes de concluir, recomendamos revisar"
  saem da correção do servidor.
- **Certificado:** só existe se a tabela do servidor diz aprovado. Ganha um
  identificador único e uma página pública de verificação
  (/certificado/verificar?id=...) que mostra o nome, o curso e a data. O aluno
  pode desligar a verificação pública. O PNG continua sendo desenhado no
  navegador, mas a partir do que o servidor devolveu.
- **Encerramento:** tela especial com palavras aprendidas, unidades, XP,
  habilidades, nota do exame, conquistas e "Próximo passo: Hebraico A2" (sem
  prometer data).
- **Transliteração:** chave "Mostrar transliteração" no A1. Padrão por
  unidade (U0 a U4 sempre; U5 a U12 um toque; depois sob pedido, decisão 7), e
  a chave por cima. A partir da U5, se a chave estiver ligada, um aviso
  discreto: "Você já conhece essas letras. Tente ler sem transliteração."
- **Estatísticas:** chaves `a1-uN` nas contagens que já existem (resposta por
  tipo, etapa concluída), mais palavra errada por id de palavra, sem conta.
- **Desempenho:** conteúdo do A1 dividido por módulo (/api/content/a1?m=N),
  carregado quando a tela do módulo abre; áudio sob demanda.

## 7. Conflitos com decisões já aprovadas: decididos pelo dono (06/10/2026)

| # | Pedido novo | Decisão antiga | Decisão do dono agora |
|---|---|---|---|
| C1 | números masculinos e femininos | 3 e 11: série masculina no A2 | **entra no A1** (U19), depois de todo o resto; até lá vale a série de contar (hora, preço, telefone) |
| C2 | introdução à סְמִיכוּת | 12: סְמִיכוּת no A2 | **entra no A1** (U19), com a regra; antes disso, expressões fixas (מִסְפַּר הַטֶּלֶפוֹן, בֵּית קָפֶה) |
| C3 | passado perto do fim | não decidido | **sem passado no A1**; o passado é do A2 |
| C4 | Módulo 0 com o alfabeto dentro do A1 | o A1 é curso separado | **U0 Ponte no A1, alfabeto recomendado antes**; vender juntos fica para depois |
| C5 | certificado com "nível A1", carga horária, ID, QR | "Não é uma certificação oficial de nível" | mantido o aviso; "Hebraico A1" é o nome do curso; carga horária só com número medido |

Revisão do hebraico novo: **tudo no fim** (o dono revisa as 13 unidades
juntas). Até lá o A1 continua escondido, só o administrador abre.

## 8. Plano de implementação

Cada fase é um PR pequeno, com os testes e verificações de sempre. Todo texto
novo visível ao aluno vai listado no PR para aprovação. Todo hebraico novo
passa pelo dono antes de abrir para o público. O A1 continua escondido (só o
administrador) até o dono decidir lançar.

| Fase | Entrega | Precisa do dono |
|---|---|---|
| 1 | esta auditoria | C1 a C5 decididos |
| 2 | currículo completo: mapa das 21 unidades com objetivos, vocabulário, gramática e situações, no A1-RASCUNHO.md | aprovar o mapa |
| 3 | arquitetura: `modulos`, blocos, tipos novos, feedback por opção, conteúdo por módulo, testes | aprovar textos de interface |
| 4 | conteúdo: U0 e U9 a U20, um módulo por vez, com cultura e "Você sabia?" nas unidades novas e antigas | revisar todo o hebraico novo no fim |
| 5 | revisão espaçada, Meu hebraico, competências, transliteração, conquistas | aprovar textos |
| 6 | os 4 checkpoints | aprovar as perguntas |
| 7 | exame corrigido no servidor (tabela nova em D1) | |
| 8 | certificado com identificador e verificação pública; tela de encerramento | aprovar textos |
| 9 | QA: celular em 375, 390 e 430 px, RTL, teclado, leitor de tela, as 20 perguntas do pedido | |
| 10 | polimento; catálogo de áudio do A1 para gravar no painel | gravar |

## 9. O que foi feito (06/10/2026)

| Fase | Entrega |
|---|---|
| 1 | esta auditoria; conflitos C1 a C5 decididos pelo dono |
| 2 e 3 | data/a1/ com módulos, um arquivo por unidade, blocos novos (situação, leitura, Em Israel, curiosidade, Eu consigo), tipos novos (ditado, conversa, ordenar) e retorno por opção errada |
| 4 | Unidades 0 e 9 a 20 escritas (rascunho); blocos novos nas Unidades 1 a 8; trilha de história em 10 capítulos. Total: 21 unidades, 11 módulos, 544 entradas de vocabulário, 507 exercícios |
| 5 | revisão espaçada (Leitner 0 a 4), Minha revisão, Meu hebraico, competências por habilidade, conquistas do A1, chave de transliteração, estatísticas anônimas por unidade |
| 6 | 4 checkpoints cumulativos |
| 7 | exame em 6 habilidades, sorteado e corrigido no servidor (tabela provas_a1), sem gabarito no navegador |
| 8 | certificado emitido só pelo servidor, com código e página pública de verificação; tela de conclusão |
| 9 | QA: 15 telas do A1 em 375, 390 e 430 px sem rolagem horizontal, sem erro de página, alvos de toque de 44 px; build, SEO, pacote público, testes (1.363) |
| 10 | catálogo de gravação: onda 6 com as unidades revisadas (235 clipes das Unidades 1 a 8) |

A revisão de tudo o que é novo está em **A1-REVISAO.md** (gerado por
`node tools/a1-revisao.mjs`).

## 10. As 20 perguntas do QA, com franqueza

1. **Um aluno do zero consegue usar?** Sim, com o alfabeto antes (a Unidade 0 diz isso). Sem o alfabeto, o A1 sozinho não ensina a ler as letras.
2. **Progressão lógica?** Sim: a ordem aprovada (1 a 8) e as novas em cima dela; cada unidade nova usa só o que veio antes, e o que ainda não foi ensinado aparece como expressão fixa, com glossário.
3. **Algo aparece sem ter sido ensinado?** Nas leituras e diálogos, algumas palavras novas, sempre traduzidas no glossário ou na linha. Nos exercícios, conferi item por item.
4. **Conteúdo suficiente para A1?** As situações do A1 estão todas cobertas (seção 2.1). O vocabulário ativo passa de 540 entradas, sem contar as formas.
5. **Vocabulário suficiente?** Sim para um A1 funcional.
6. **Escuta suficiente?** No conteúdo, sim (2 a 3 itens de escuta e um ditado por unidade, diálogos e leituras com gravação). **Na prática, ainda não:** o A1 não tem nenhuma gravação; até gravar, a escuta fica escondida e não entra no exame.
7. **Leitura suficiente?** Sim: uma leitura do mundo real por unidade nova, sem nikud a partir da Unidade 9, com a chave para mostrar.
8. **Produção?** Escrita guiada em toda unidade e uma escrita livre (sem nota) por unidade. A fala depende das gravações (para comparar) e não foi feita.
9. **Revisão?** Sim: espaçada, por item, com desafio acumulativo.
10. **Avaliação?** 4 checkpoints e o exame corrigido no servidor.
11. **O aluno percebe o progresso?** Sim: barra do curso, porcentagem por módulo, competências, conquistas, caderno.
12. **Celular?** Testado em 375, 390 e 430 px; sem rolagem horizontal; arrastar não existe (tudo é por toque).
13. **RTL?** Todo hebraico vai em `dir="rtl" lang="he"`; frases mistas pelo `Misto`; campos de resposta RTL com o teclado virtual.
14. **Português natural?** Escrito para brasileiros, sem travessão.
15. **Hebraico natural?** Escrito para soar como a rua, com as variantes que se ouvem anotadas. **Precisa da revisão do dono antes de abrir.**
16. **Erros de brasileiro?** Um "Erro comum" em quase toda explicação, mais a Unidade 0 inteira de pronúncia.
17. **Cultura?** Uma caixa "Em Israel" e uma curiosidade por unidade, e a trilha de história.
18. **Divertido sem ser infantil?** Situações com personagens recorrentes, conquistas sóbrias, sem mascote.
19. **Parece premium?** A identidade do site, limpa, testada no celular.
20. **Dá para cobrar?** Depois de: revisar o hebraico novo, gravar o áudio do A1, e acertar os pontos abaixo.

## 11. O que ainda falta (e por quê)

| # | Falta | Por quê / quem |
|---|---|---|
| F1 | Revisar o hebraico novo (A1-REVISAO.md) | decisão do dono: tudo no fim |
| F2 | Gravar o A1 (onda 6) e, depois de aprovadas, as Unidades 0 e 9 a 20 | o catálogo só pede gravação de unidade revisada |
| F3 | Menu do aluno que comprou só o A1 | o menu de baixo é o do alfabeto; decisão antes de vender |
| F4 | Página de vendas do A1 (diz "6 módulos") | texto comercial: decisão do dono |
| F5 | Política de privacidade: o exame, o certificado e a página pública de verificação | texto legal: revisão de advogado |
| F6 | Exercícios com imagem (imagem → palavra) | previstos (5.2), não feitos: as 102 ilustrações são do alfabeto e cobrem pouco do A1 |
| F7 | QR code no certificado | o certificado tem o código e o link; QR pede uma biblioteca nova |
| F8 | Carga horária no certificado | só com número medido (C5) |
| F9 | Conteúdo dividido por módulo | o A1 inteiro pesa 78 KB comprimido, uma vez, com cache; dividir fica para quando crescer |
| F10 | Prática de fala com correção | depende das gravações |

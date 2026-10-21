# Auditoria interna do capítulo 4: Além de Jerusalém

Data: 21/10/2026 (segunda rodada). Auditoria interna feita por IA. Não é
revisão acadêmica: nada aqui foi "revisado", "validado" ou "aprovado".

## 0. O que esta rodada fez

Cerca de 16 buscas (texto e imagens) para as lacunas das seções 2 e 4 da
auditoria anterior. O capítulo manteve os dez lugares e a ordem de leitura,
ganhou frase de abertura, sete fotos, quatro QR, o mapa `mapa-destinos` (já
estava), quatro perguntas e os trechos novos abaixo. Nenhum lugar aparece como
parada obrigatória.

- Manuscrito: 3.924 palavras (validador), contra 3.293 antes. Ficou abaixo das
  4.200 de orientação: Jafa e Mar Morto continuam curtas por falta de fonte
  (Jafa) e por decisão de não repetir o capítulo 1 (Mar Morto).
- PDF: `saida/capitulo-04.pdf`, 30 páginas, 4 de 4 QR lidos de volta.
- `tools/inspecionar.mjs --formato=capitulo-04`: nenhum transbordo, nenhuma
  página quase vazia (a primeira composição deixou um título "Para conferir"
  vazio e uma abertura curta; corrigidos no manuscrito).
- `tools/validar.mjs`: 0 erros.

## 1. Afirmações por status (afirmacoes/cap04.json)

| Status | Quantidade |
| --- | --- |
| VERIFICADO | 66 |
| CONTESTADO | 2 (C04-039, C04-096) |
| PARCIALMENTE VERIFICADO | 3 (fora do texto) |
| NÃO VERIFICADO | 25 (fora do texto) |
| Total | 96 (11 novas: C04-086 a C04-096) |

Fontes: 57 (A 7, B 39, D 2, E 9); 17 novas (F04-041 a F04-057). O texto cita
também C01-013, C01-016 e C01-017 (capítulo 1) na remissão sobre o Mar Morto.

## 2. O que foi pesquisado e entrou

- **Mar Morto**: o capítulo não repete o 1; remete a ele com as três
  afirmações de lá (queda de cerca de 1,15 m por ano, bacia sul, dolinas).
- **Nazaré** (C04-086 a C04-088): Basílica da Anunciação (Muzio, março de
  1969, sobre a gruta); a igreja grega ortodoxa junto da fonte e a tradição do
  Protoevangelho de Tiago; Nazaré como a localidade com mais cristãos árabes
  (CBS, 2019).
- **Cafarnaum** (C04-089 a C04-091): escavações de Corbo e Loffreda desde 1968
  e as fases da casa segundo eles, a igreja octogonal do século V, Egéria, o
  memorial de 1990. A caixa "A casa de Pedro" separa o que a escavação
  responde (uso como igreja) do que é tradição (de quem era a casa).
- **Tel Aviv** (C04-092): o sorteio de Ahuzat Bayit com conchas, abril de 1909.
- **Acre** (C04-093): o cerco de Napoleão em 1799 (duas fontes E, fato datado).
- **Haifa** (C04-088, C04-094): perfil da prefeitura (cerca de 10% de árabes,
  dados de cerca de 2008-2012) e CBS (16.300 cristãos árabes em 2019).
- **Árabe** (C04-095): Yafa e 'Akka, como os usam textos do Institute for
  Palestine Studies. **al-Nasira não achou fonte A-D e saiu do texto.**
- **Massada** (C04-096, CONTESTADO): a voz crítica a Ben-Yehuda (Feldman, numa
  resenha de Sacrificing Truth; Amnon Ben-Tor, Back to Masada, 2009).

## 3. Problemas encontrados e correções

- **Críticos de Ben-Yehuda por fontes E** (resenha na Middle East Quarterly e
  ensaio na Aeon). Por isso C04-096 é CONTESTADO, com as três posições, e a
  revisão deve abrir Ben-Tor (2009).
- **Dia da consagração da basílica** (23 ou 25 de março de 1969): o texto dá só
  o mês. A datação das igrejas anteriores diverge e ficou fora.
- **Fim das escavações de Cafarnaum** (1985, 1986 ou 1991) diverge; fora.
- **Número de famílias de Ahuzat Bayit** (66 ou 60): o texto diz "por volta de
  sessenta" e que as fontes divergem.
- **Haifa**: o dado da prefeitura é antigo; o texto diz que é do perfil da
  prefeitura, sem chamar de atual. Conferir no CBS antes de publicar
  (`revisar_ate` 21/10/2027). A frase "nos mesmos bairros convivem..." foi
  retirada (sem fonte). A história de Haifa em 1948 (queda da população árabe)
  apareceu num trecho acadêmico sem atribuição clara e ficou fora.
- **Legendas**: a de Acre diz "cidadela" (C04-076), não "castelo cruzado" como o
  título de época da foto; a da Cidade Branca evita "Bauhaus".
- **Notas de vocabulário** que davam o árabe de Nazaré e as grafias das placas
  em inglês de Jafa e Acre saíram (sem fonte); entraram as que têm.
- Problemas da rodada anterior que continuam: verbete do Pleiades para
  Cafarnaum incoerente; coordenada de Cafarnaum por ToposText; Votruba (2007)
  sem título; Mar Morto e Eilat sem coordenada em `destinos.json`.

## 4. Fontes adicionais necessárias (revisão humana)

1. Ben-Tor, Back to Masada (2009), e Ben-Yehuda, Sacrificing Truth (2002), no
   texto integral; Cohen (1982) e Magness (2019), como antes.
2. Publicação das escavações de Cafarnaum (Corbo; Loffreda) e a datação da
   sinagoga (C04-019 segue NÃO VERIFICADO).
3. Fonte acadêmica para o cerco de 1799 (hoje só Britannica e Foreign
   Exchanges) e para al-Jazzar (C04-081).
4. CBS: população de Haifa por religião, datada; fonte para Wadi Nisnas.
5. Nome árabe de Nazaré em fonte A-D.
6. Jafa: história do porto (IAA), menções bíblicas como fonte C, união com Tel
   Aviv em 1950 (C04-063 a C04-065).

## 5. Debates e como o texto os apresenta

- Suicídio coletivo em Massada (C04-039) e o mito nacional (C04-041), agora com
  os críticos da tese do mito (C04-096), tudo na caixa "Josefo, a arqueologia
  e o símbolo".
- O lugar da Anunciação: duas tradições, católica e ortodoxa, apresentadas lado
  a lado, sem escolher.
- "Casa de Pedro": escavação contra identificação tradicional.
- "Bauhaus" em Tel Aviv: o rótulo discutido pela avaliação da UNESCO.

## 6. Pendências editoriais

- **Hebraico para aprovação do dono**: o mesmo da rodada anterior (lista
  completa na versão anterior desta auditoria e em `auditoria/hebraico.md`):
  Kinéret, yam, Yam Kinéret, agám, Tvérya, Natsrát, knessiyá, Kfar Nachúm,
  kfar, beit knésset, minzár, Keisárya, namál, teatrón, gan leumí, Metsadá,
  mivtsár, solelá, Yam HaMélach, mélach, Tel Avív, tel, avív, haír halevaná,
  laván, Kikár Dízengof, kikár, Sderót Rótshild, sderót, Yáfo, Nemál Yáfo, ir
  atiká, Chéifa, Har HaKármel, har, ganím, gan, Áko, chomá, tsalvaním,
  tsalván. **Nenhum hebraico novo nesta rodada.**
- **Árabe**: Yafa e 'Akka (com fonte); al-Nasira retirado.
- **Fotos** (`ativos/dados/fotos-candidatas-cap04.json`, 9 candidatas):
  usadas a Basílica da Anunciação (Spyckerelle, CC BY-SA 3.0, "confirmar"),
  a sinagoga de Cafarnaum (Berthold Werner, domínio público dito do autor e não
  do arquivo, "confirmar"), Cesareia do alto (Eldadi, CC BY-SA 4.0,
  "confirmar"), a Cidade Branca (andynash, CC BY-SA 2.0, "confirmar") e os
  terraços bahá'ís (CC BY 2.0, "sim"). Reaproveitadas de outros capítulos:
  `foto-capa-massada-aerea` (cap01, "confirmar"), `foto-jaffa-do-mar-photochrom`
  e `foto-acre-castelo-matson` (cap02). Nenhuma NC/ND.
- **Links (QR)** em `ativos/dados/links-cap04.json`: UNESCO Massada, parque de
  Massada, parque de Cesareia, UNESCO Acre.
- **Figura `mapa-destinos`**: no início do capítulo, como antes; Mar Morto
  ainda sem coordenada.
- **Prazos**: C04-088 e C04-094 vencem em 21/10/2027; C04-044 e C04-026 em
  21/04/2027.
- Nenhuma caixa "O olhar de um israelense".

## Fase 6 (21/10/2026)

Aplicada a linguagem visual aprovada (estilo "papel recortado", só desenho
SVG). Módulo: `tools/ilustracoes/cap04.mjs`.

### Visuais
| Peça | Tipo | Dados |
| --- | --- | --- |
| `abertura-alem-de-jerusalem` | abertura ilustrada (nova) | desenho, sem dado, rotulado "ilustração" |
| `mapa-destinos-ilustrado` | mapa ilustrado e tocável (novo, a partir da prancha aprovada), substitui `mapa-destinos` no texto | coordenadas de destinos.json (C04-007, 011, 020, 031, 047, 059, 062, 070, 079, 083); distâncias C04-097; seta C01-009 |
| `massada-pao-de-acucar` | comparação com o Brasil (nova) | C04-034, C04-098, C04-099 |
| 8 fotos candidatas (já existiam) | foto | ver fotos-candidatas-cap04.json |

Pontos tocáveis: `ativos/dados/mapa-destinos-ilustrado-pontos.json`, dez
pontos, cada um com `ficha`. O Mar Morto não tem coordenada registrada
(C04-053): o número fica no meio da bacia norte do contorno do lago da Natural
Earth, e o rodapé do mapa diz isso. Jafa sai deslocada com uma linha, porque
fica colada em Tel Aviv.

### Comparação com o Brasil
Massada (450 m acima do Mar Morto, Autoridade de Natureza e Parques, C04-034)
x Pão de Açúcar (396 m acima do mar, Marinha do Brasil, C04-098; a Britannica
dá 395 m): o paredão de Massada tem uns 54 m a mais (C04-099, conta derivada).
O texto e o desenho dizem que é desnível, não altitude.

### Interações
Mapa tocável; 10 fichas (`::: ficha`, uma por destino, com distância de
Jerusalém em linha reta, C04-097); pegadinha do guia ("estilo Bauhaus",
C04-057); "História ou tradição?" com palpite na "casa de Pedro"
(`resposta: as-duas`); os quizzes e V/F que já havia. Regiões das fichas:
"Galileia", "Costa", "Mar Morto e deserto da Judeia".

### Fichas: o que ficou fora
Altitude (fora Massada) e tempo de visita: sem fonte oficial nesta rodada,
não entraram. A ficha de Massada usa os dados da prancha aprovada (450 m,
2001, 1966, oito acampamentos, distância) e as regras de acesso (C04-044) e
de calor (C08-049). A semente "Matusalém" (C09-017) ficou para o capítulo 9.

### Decisão política (o que mudou no texto)
- "Cisjordânia" na margem do Mar Morto passou a "Judeia e Samaria
  (Cisjordânia)" (única menção do capítulo).
- Jafa: saiu "o nome que os textos palestinos usam"; ficou "Em árabe, a
  cidade se chama Yafa" (C04-095 continua o registro).
- O debate sobre Massada como símbolo ficou (é debate histórico).

### Registros novos
C04-097 (distâncias, conta derivada), C04-098 (Pão de Açúcar), C04-099
(comparação); F04-058 (Marinha, DPHDM), F04-059 (Britannica, nível E, só como
segunda referência).

### Buscas
2 (Pão de Açúcar). Total da fase nos capítulos 4 e 5: 6.

### Testes
Validador: 0 erros. PDF `saida/capitulo-04.pdf`: 36 páginas, 4/4 QR lidos,
inspecionar sem transbordo nem página quase vazia. O mapa primeiro saía
partido em duas páginas: os países vizinhos inteiros da Natural Earth
estouravam a caixa do SVG e o Paged.js os dividia. Agora o módulo recorta
países, lagos e o rio no retângulo do mapa. Web: não rodada (o coordenador
monta).

### Pendências
- Hebraico: nenhum novo; as fichas reusam o do capítulo (Kinéret, Natsrát,
  Kfar Nachúm, Keisárya, Metsadá, Yam HaMélach, Tel Avív, Yáfo, Chéifa, Áko),
  todo à espera da aprovação do dono.
- Título da página da Marinha (F04-058) a confirmar.
- Coordenada do Mar Morto (C04-053) segue sem fonte.
- Para o coordenador: outros mapas feitos com os países inteiros da Natural
  Earth podem ter o mesmo problema de quebra no PDF (a prancha do mapa, se for
  usada como figura).

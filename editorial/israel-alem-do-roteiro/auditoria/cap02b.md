# Auditoria interna, capítulo 2, parte B: de 1948 a outubro de 2026

Data: 21/10/2026. Auditoria interna feita por IA, que não substitui revisão
acadêmica: nada aqui está "revisado", "validado" ou "aprovado".

Arquivos: `manuscrito/_frag-02-1948.md` (texto novo, para entrar depois de
"1947: a partilha no papel"), `afirmacoes/cap02b.json` (C02-501 a C02-562),
`fontes/cap02b.json` (F02-501 a F02-570). O fragmento usa também C02-067, o
registro da Declaração de 14 de maio que já estava em `cap02.json`.

Pesquisa: 49 buscas web (de um teto de 85 compartilhado), 9 delas em modo
"extended", só para 2023-2026. Nenhuma página foi aberta: todo registro é
`trecho-de-busca` ou `referencia-confirmada`.

## 1. Afirmações por status

| Status | Quantidade |
| --- | --- |
| VERIFICADO | 39 |
| CONTESTADO | 9 |
| NÃO VERIFICADO | 8 |
| Total | 56 |

Fontes: 70 (A: 10; B: 2; C: 1; D: 40; E: 17). Três são
`referencia-confirmada` (Pappé 2006, Karsh 1997, resenha de Shlaim na AHR) e
não sustentam nada sozinhas.

Texto: cerca de 2.170 palavras de leitura, mais cerca de 210 na
`linha-do-tempo Depois de 1948` (21 marcos). 80 marcas de fonte, todas em
registros VERIFICADO ou CONTESTADO (conferido por script, porque o validador
não lê arquivos que começam com `_`). Nenhum hebraico no fragmento.

Validador (`node tools/validar.mjs israel-alem-do-roteiro`, rodado em 21/10/2026 depois de gravados os arquivos): 0 erros e 3 avisos no livro inteiro, nenhum aviso nos arquivos desta parte.

## 2. Problemas encontrados na releitura adversária

Frases retiradas ou reescritas antes da versão final:

- "A guerra de Gaza foi a mais longa e a mais mortal da história do
  conflito": sem fonte; retirada.
- "Plano Dalet, plano militar da Haganá": órgão e data (março de 1948) sem
  fonte admitida; ficou "plano militar sionista de 1948", como no título de
  Walid Khalidi.
- "Intifada (levante, em árabe)": tradução sem fonte; retirada.
- "Quem viaja pela região ouve um ou outro nome conforme o lugar":
  generalização sem fonte; retirada da caixa.
- "Quem disser que o debate está resolvido está tomando partido": opinião
  editorial; virou "o debate segue aberto".
- "A primeira paz com um vizinho árabe saiu de Camp David": o Office of the
  Historian não diz "primeira"; reescrito (o "segundo país árabe" fica na
  frase sobre a Jordânia, com fonte gov.il).
- "Os próprios acordos diziam que a linha não era fronteira": a fonte (CIJ)
  cita só o acordo com a Jordânia; agora "o acordo com a Jordânia, por
  exemplo".
- Mortos israelenses de 1948 (cerca de 4.000 soldados e 2.000 civis,
  gov.il): verificados, mas fora do texto. Sem contagem equivalente das
  vítimas árabes, um número de um lado só desequilibraria o parágrafo
  (registrado em C02-501).

Números e datas que pedem atenção:

- **Refugiados de 1948.** O texto dá três ordens de grandeza, cada uma com
  quem a usa: cerca de 700 mil (ONU, 2023), mais de 720 mil e a faixa de 400
  mil a quase 1 milhão (resumo IRIN no site da ONU), cerca de 750 mil
  atendidos pela UNRWA em 1950. Os números da UNCCP (726 mil, 711 mil, 800-900
  mil), do governo israelense (520 mil) e do PCBS (957 mil) ficaram NÃO
  VERIFICADO (C02-555, C02-562).
- **Morris, ano do primeiro livro.** A descrição da Cambridge diz "estudo de
  1988"; catálogos dão 1987. O texto diz "fim daquela década".
- **Citação de Morris.** "Nasceu da guerra, não de um plano, judeu ou árabe"
  vem de resenha de 1988 (CSM); a MERIP cita com outra redação. Atribuída à
  resenha; conferir no livro.
- **Gaza, total de mortos.** AP (junho de 2026, mais de 73 mil) e CBC (2026,
  mais de 74 mil), ambos citando o Ministério da Saúde de Gaza. A data exata
  da matéria da CBC não apareceu. Os 74.480 de 19/10/2026 só vieram de SANA e
  Al-Quds, fontes não admitidas.
- **Cessar-fogo de outubro de 2025.** O texto usa 10 de outubro (OCHA); há
  quem date de 8 ou 9 de outubro (anúncio e assinatura).
- **Linha Amarela.** "Cerca de 53% da Faixa" só na Wikipedia; fora (C02-561).
- **Reféns.** 251 (governo israelense, via Washington Post) e 252
  (especialistas da ONU), os dois no texto. O retorno do último corpo (26 de
  janeiro de 2026) tem uma fonte E só; fora (C02-560).

Anacronismo e terminologia (protocolo, seção 7):

- 1948: "Guerra de Independência" e "Nakba" ditos como nomes, cada um com
  quem o usa e com fonte (gov.il e Knesset; ONU).
- Territórios: Cisjordânia, Faixa de Gaza, Jerusalém Oriental, Colinas de
  Golã; Linha Verde com a fonte (CIJ, 2004). O termo oficial israelense
  "Judeia e Samaria" não aparece no fragmento, então a explicação não foi
  necessária.
- Anexações: o texto diz que o Conselho de Segurança declarou nulas a lei de
  1980 sobre Jerusalém e a decisão de 1981 sobre o Golã, e dá o voto de 2017
  na Assembleia Geral (128 a 9). Isso sustenta a regra "a maior parte da
  comunidade internacional não reconhece" sem usar a expressão sem número.
- Monte do Templo / Haram al-Sharif: primeira menção do capítulo neste
  fragmento, com os dois nomes e quem usa cada um. Se o capítulo ganhar uma
  menção anterior (o comentário PENDENTE sobre os mamelucos fala do Haram),
  a explicação passa para lá e aqui fica só o par de nomes.

Equilíbrio de perspectivas:

- Narrativa do início da guerra: vem do Ministério das Relações Exteriores de
  Israel, atribuída como tal. Falta uma narrativa palestina ou acadêmica do
  mesmo período (novembro de 1947 a maio de 1948) com fonte; o debate das
  causas cobre parte disso, mas a revisão deve acrescentar.
- Críticos de Pappé: hoje só aparece a discordância de Morris. Gelber e a
  crítica no Journal of Israeli History ficaram NÃO VERIFICADO (C02-556).
- Bloqueio de Gaza (2007): o texto registra o bloqueio pela ONU; a
  justificativa israelense (segurança) não foi pesquisada.
- Judeus de países árabes e muçulmanos: só números (Agência Judaica). As
  causas da saída, também discutidas, não foram pesquisadas (C02-558).
- Período recente: nenhum adjetivo de valor; cada número tem quem contou; as
  falas do debate de 15/10/2026 aparecem dos dois lados (coordenador da ONU e
  representante de Israel). Termos como "genocídio" e "terrorismo", usados
  por partes e por fontes, não aparecem: não foram pesquisados com as
  posições correspondentes (Corte Internacional de Justiça, governos) e não
  entram sem elas.

Contradições com outros capítulos:

- Capítulo 3 (Jerusalém): a queda do Bairro Judeu em 28 de maio de 1948, a
  divisão da cidade em 1949, 1967, a lei de 1980 e a visita de Sharon em 2000
  devem bater com o que o capítulo 3 disser.
- Capítulo 8 (prática): o período recente aqui é história, não orientação de
  viagem; nenhuma frase do fragmento diz se é seguro viajar.

## 3. Correções feitas

As do item 2 marcadas como retiradas ou reescritas. A guerra de 1973 aparece sem os nomes que cada lado lhe dá (Yom Kipur, Guerra de Outubro), porque eles não foram buscados (C02-559 NÃO VERIFICADO).

## 4. Fontes adicionais necessárias (revisão humana)

1. **Morris**, The Birth of the Palestinian Refugee Problem (Cambridge, 1987)
   e Revisited (2004): conferir a conclusão citada e o ano do original.
2. **Khalidi**, JPS 18(1), 1988, p. 4-33: conferir a frase sobre a
   responsabilidade sionista e a descrição do Plano Dalet.
3. **Pappé** (2006) e a resenha do Project MUSE (autor não apareceu no
   trecho); **Gelber** (2006) e a crítica no Journal of Israeli History.
4. **Shlaim** (1988): a tese vem de descrições e resenhas; ler a introdução.
5. **Lustick** (Survival, 1997) e **Morris** (JPS, inverno de 1998) contra
   **Karsh** (1997).
6. **UNCCP**, relatórios de 1949-1950 e Historical Survey (1961), para a
   faixa de refugiados; **PCBS** e governo israelense para as estimativas de
   cada lado.
7. **CBS** (Anuário Estatístico, imigração por país de nascimento,
   1948-1951) no lugar da Agência Judaica; literatura sobre as causas da
   saída dos judeus de países árabes e muçulmanos.
8. **Knesset**: lei do plano de desengajamento (2005).
9. **2023-2026**: registro S/PV da 10243ª sessão do Conselho de Segurança
   (15/10/2026); data da matéria da CBC; uma segunda fonte para o retorno dos
   reféns; posição oficial israelense sobre o bloqueio e sobre os números do
   Ministério da Saúde de Gaza (gov.il).

## 5. Debates acadêmicos e como o texto os apresenta

| Debate | Posições no texto | Registro | Como aparece |
| --- | --- | --- | --- |
| Causas do deslocamento palestino de 1948 | Morris (guerra, não plano; expulsões sem política prévia); Khalidi (Plano Dalet como plano de conquista); Pappé (plano de expulsão, limpeza étnica); Shlaim (entendimento Abdullah-sionistas); Karsh (críticos usam mal as fontes) e Lustick contra Karsh; acadêmicos pró-palestinos ("não foram longe o bastante") | C02-509 a C02-518, CONTESTADO | Subseção "Por que saíram", cada posição com nome, obra e ano; o fato (o deslocamento) separado da interpretação (as causas); fecho: "o debate segue aberto". Sem equivalência artificial: o texto diz que, entre esses autores, as expulsões não estão mais em discussão, e sim a existência de um plano geral. |
| A evolução de Morris | edição de 2004 com mais expulsões e mesma conclusão geral; mudança política depois de 2000 | C02-511, C02-512 | Dois parágrafos, separando a obra da posição política. |
| Os dois nomes de 1948 | Guerra de Independência (Israel) / Nakba (palestinos); objeção israelense à cerimônia da ONU | C02-502 a C02-504 | Texto corrido e caixa `entenda-melhor` "Por que 1948 tem dois nomes". |
| Parágrafo 11 da Resolução 194 | retorno condicionado à paz (Israel) / direito sem limite (delegações árabes) | C02-520 | Uma frase com as duas leituras atribuídas. |
| Resolução 242 | leituras israelense e árabe | C02-525 | Uma frase; o debate do "os territórios" não foi detalhado. |
| Causa da segunda intifada | visita de Sharon (palestinos) / levante preparado (israelenses) / conclusão da Comissão Mitchell | C02-536, CONTESTADO | As três posições, a da comissão por último, como achado de uma comissão e não como veredito do livro. |
| Números de Gaza | Ministério da Saúde de Gaza (sob as autoridades de fato), via AP, CBC e OCHA; posição das Forças Armadas israelenses em 2026 | C02-542, C02-543, C02-548 | Cada número com quem contou e quando; a ressalva de que o ministério não separa civis de combatentes. |
| Fim da primeira intifada | 1991 ou 1993 | C02-531 | "A data do fim é discutida". |

## 6. Pendências editoriais

- **Montagem:** o fragmento entra no lugar do comentário "PENDENTE,
  BLOQUEANTE" no fim de `02-historia.md`. O bloco `::: linha-do-tempo Depois
  de 1948` pode ser fundido à linha do tempo do início do capítulo (que
  passaria de 45 marcos; o `cap02.md` já pede escolher os mais úteis) ou
  ficar como segunda caixa no fim. Decisão de edição.
- **Registros antigos:** C02-068 a C02-082 (`cap02.json`, NÃO VERIFICADO)
  ficam superados por C02-501 em diante. Não foram mexidos aqui porque outro
  agente edita o arquivo; quem montar o capítulo deve marcá-los como
  superados (ou apagá-los) e atualizar o comentário PENDENTE da linha do
  tempo.
- **Hebraico:** nenhum no fragmento. Se o autor quiser o nome hebraico da
  guerra de 1948 na caixa, ele escreve e aprova.
- **Data de corte:** o trecho de 2023-2026 diz ao leitor que vai até
  21/10/2026. Os registros de estatística têm `revisar_ate`; C02-547 e
  C02-548 vencem em 21/04/2027. Antes de qualquer reimpressão, atualizar.
- **Caixas do autor:** nenhuma "O olhar de um israelense" neste fragmento.

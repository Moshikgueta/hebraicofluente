# Auditoria cruzada: Israel Além do Roteiro

Auditoria interna feita por IA em 21/10/2026, sem busca na web: leitura do
manuscrito contra os próprios registros (`afirmacoes/`, `fontes/`) e contra as
auditorias de cada capítulo. Não é revisão acadêmica: nada aqui foi revisado,
validado ou aprovado por especialista.

**Escopo.** Manuscritos 00a, 00b, 01 a 08, 10, 98 e 99. O capítulo 2
(`02-historia.md`) apareceu durante esta auditoria (commit de 21/10/2026,
01:11) e foi lido; como ainda está sendo escrito e não tem `auditoria/cap02.md`,
nele só entraram correções mínimas. O capítulo 9 não existe. O capítulo 7 está
marcado no próprio arquivo como RASCUNHO PARCIAL, NÃO PUBLICAR.

**Números de linha** referem-se aos arquivos depois das correções desta
auditoria. "Corrigido" quer dizer que a frase foi editada no manuscrito;
"Autor" ou "Revisão" quer dizer que fica para o autor ou para a revisão humana.

**Validador** (`node tools/validar.mjs israel-alem-do-roteiro`), depois das
edições: 0 erros, 3 avisos (duas caixas "olhar-israelense" pendentes e a falta
do capítulo 9). O aviso de transliteração divergente de <he>חשבון</he> sumiu.
Nenhum travessão nem meia-risca na pasta.

---

## 1. Frase maior que a afirmação

| # | Arquivo:linha | Trecho (antes) | Problema | Gravidade | Situação |
| --- | --- | --- | --- | --- | --- |
| 1.1 | 03-jerusalem.md:123 | "A cor da cidade tem data. A pedra clara das fachadas não é só gosto." | C03-064 trata de licença para obras e da proibição de reboco e de chapa de ferro dentro das muralhas. A exigência de revestir de pedra (Storrs) é C03-065, PARCIALMENTE VERIFICADO, deixado de fora de propósito. O título e a frase de abertura punham de volta, pela porta dos fundos, o que o registro exclui. | alta | Corrigido: título "Uma regra de construção de 1918"; a frase diz só o que C03-064 sustenta, inclusive que a ordem foi "apresentada como proteção da tradição das abóbadas de pedra" (está na evidência). |
| 1.2 | 03-jerusalem.md:17 | "a explicação mais repetida [...] é o medo de uma nova cruzada cristã para tomar a cidade" | "Mais repetida" não está na evidência (só IAA e Times of Israel); "para tomar a cidade" é acréscimo; a fonte diz "em parte". | média | Corrigido: "a IAA diz, com um cauteloso 'ao que parece', que Solimão agiu em parte por medo de uma nova cruzada cristã". |
| 1.3 | 03-jerusalem.md:87 | "e ajuda a separar, no mesmo paredão, as pedras herodianas das fiadas mais recentes por cima delas" | C03-014 fala das bordas lavradas; nada sobre fiadas posteriores. | média | Corrigido: frase cortada até caber no registro. |
| 1.4 | 03-jerusalem.md:53 | "os Nusseibeh, outra família muçulmana antiga da cidade, são os encarregados" | "Antiga" não está na evidência; presente do indicativo para fato de 2017. | baixa | Corrigido: "Segundo uma reportagem da agência Reuters de 2017 [...] tinha o encargo". |
| 1.5 | 03-jerusalem.md:61 | "restos de plantas presos no reboco" | A evidência diz "material orgânico" (organic material within the plaster). | baixa | Corrigido. |
| 1.6 | 03-jerusalem.md:25 | "e que se visitam como Túneis do Muro Ocidental" | A visita aos túneis não foi verificada (LIM de C03-017). | baixa | Corrigido: "conhecidas como Túneis do Muro Ocidental". |
| 1.7 | 03-jerusalem.md:35 | "Uma longa faixa de mosaico no interior traz a dedicatória do califa omíada Abd al-Malik" | A evidência (Britannica, título do JRAS) não fala em "longa" nem em "mosaico", e a literatura sobre a inscrição registra que o nome do califa na faixa foi trocado mais tarde (por al-Ma'mun) mantendo a data. Isso não está no registro, então não foi escrito; mas a frase, como está, pode estar errada. | média | Revisão: abrir uma edição acadêmica das inscrições (Milwright) antes de publicar. |
| 1.8 | 04-alem-de-jerusalem.md:144 | Caixa "Um nome de dois mil anos" | O Pleiades registra o grego thálassa nekrá, mas o trecho não diz em que autor nem em que época (LIM de C04-048). "Dois mil anos" é data sem fonte. | alta | Corrigido: título "O mesmo nome em grego". |
| 1.9 | 04-alem-de-jerusalem.md:112 | "os sitiados se mataram" | A evidência de C04-038 diz "quase todos". | média | Corrigido. |
| 1.10 | 04-alem-de-jerusalem.md:121 | "Quem venceu deixou mais marcas do que quem perdeu" | Juízo sem fonte (o palácio-fortaleza também está de pé). | média | Corrigido: cortado. |
| 1.11 | 04-alem-de-jerusalem.md:214 | "A UNESCO a inscreveu em 2001 pelo que guarda embaixo" | A inscrição também se apoia na cidade otomana (critério v, C04-076). E "debaixo da cidade" contradizia "acima e abaixo do nível da rua" na mesma frase. | média | Corrigido: duas frases, cada uma com o seu registro. |
| 1.12 | 04-alem-de-jerusalem.md:92 | "e de que a inscrição é a única delas gravada no tempo dele" | Ambíguo: pode ser lido como "a única fonte da época", e Filão escreveu sobre Pilatos ainda no século I. O museu diz só que é o único objeto da época com o nome dele. | média | Corrigido: "esta pedra, segundo o museu, é o único objeto da época dele que traz o seu nome". |
| 1.13 | 04-alem-de-jerusalem.md:203 | "recebe peregrinos o ano todo" | A evidência diz "milhares de peregrinos por ano". | baixa | Corrigido. |
| 1.14 | 04-alem-de-jerusalem.md:83 | "o trigo que o Egito mandava para Roma" | A fonte diz "para o Império Romano". | baixa | Corrigido. |
| 1.15 | 04-alem-de-jerusalem.md:28 | "A ficha da UNESCO trata ruína e paisagem [...] é essa relação que a classificação de bem misto quer registrar" | A ficha é proposta do Estado, não avaliação da UNESCO (LIM de C04-003); a segunda metade era interpretação. | baixa | Corrigido: "A proposta israelense trata ruínas e paisagem como um conjunto só, que soma valor cultural e valor natural". |
| 1.16 | 04-alem-de-jerusalem.md:72 | "as datas das estruturas não são as mesmas" | C04-017 não tem datas (LIM); C04-019 é NÃO VERIFICADO. | baixa | Corrigido: cortado. |
| 1.17 | 04-alem-de-jerusalem.md:159 | "um patrimônio que continua sendo bairro, com gente morando dentro" | C04-058 diz "a maioria de propriedade privada"; propriedade privada não é moradia. | baixa | Corrigido: "continua sendo cidade, em boa parte nas mãos de proprietários privados". |
| 1.18 | 05-vida-real.md:87 | "depois de um acordo entre o governo e líderes da comunidade" | O próprio registro C05-021 diz, em `interpretacoes_concorrentes`, que as fontes discordam sobre como a decisão foi tomada (acordo com líderes ou decisão de Ben-Gurion) e que o texto ficaria "só no acordo e na data, consensual". O acordo é justamente a parte disputada. | média | Corrigido: fica a data e o antes/depois. |
| 1.19 | 05-vida-real.md:87 | "e o chamado 'modelo druso' é discutido por outros pesquisadores" | Os outros autores não foram registrados como fonte "por falta de trecho conclusivo" (C05-022). | média | Corrigido: "É a conclusão de um estudo, e não uma regra que valha para todos os drusos". |
| 1.20 | 05-vida-real.md:67 | "O saldo dos nascimentos [...] o da migração de israelenses foi negativo [...] quem fez a população crescer foram os nascimentos" | "Saldo dos nascimentos" é ambíguo; os 21 mil são imigrantes, não israelenses; e o mesmo comunicado registra cerca de 36 mil estrangeiros que entraram (LIM de C05-004), então os nascimentos não foram a única causa. | média | Corrigido: "A diferença entre nascimentos e mortes [...] entre os imigrantes que chegaram e os israelenses que saíram [...] o que mais fez a população crescer". |
| 1.21 | 05-vida-real.md:32 | "acompanha em relatório anual" | O registro fala do relatório de 2025; "anual" não está na evidência. | baixa | Corrigido. |
| 1.22 | 05-vida-real.md:95 | "O livro parte de dois episódios" | A evidência diz "examina". | baixa | Corrigido: "analisa". |
| 1.23 | 06-sabores.md:27 | "estudou esse evento em Abu Gosh" | Não há registro de que o evento estudado por Avieli seja o recorde de 2010; C06-006 diz "um evento". | média | Corrigido: "um evento". Pelo mesmo motivo, na caixa da linha 30, "Avieli vê na corrida de recordes" virou "Avieli vê na disputa". |
| 1.24 | 06-sabores.md:37 | "A hipótese mais repetida põe o prato no Egito" | "Mais repetida" sem fonte; a History Today (nível E) só situa a origem em Alexandria. | média | Corrigido: "Uma das hipóteses". |
| 1.25 | 06-sabores.md:45 | "O que se pode dizer com segurança é que o bolinho frito atravessou fronteiras e ganhou um lugar no pão em mais de uma cozinha da região" | "Com segurança" para registros CONTESTADO com fontes E; "lugar no pão em mais de uma cozinha" não está em nenhum registro. | média | Corrigido: "O que as fontes citadas aqui permitem dizer é que bolinhos fritos parecidos existiram em mais de uma cozinha e que, segundo Stampfer, o trio de pita, falafel e salada é do século XX." |
| 1.26 | 06-sabores.md:51 | "O nome mais citado é o de Sabich Halabi" | As fontes registram versão concorrente (C06-020); "mais citado" sem base. | baixa | Corrigido: "O nome que elas destacam". |
| 1.27 | 06-sabores.md:88 | "o sabich nasceu de um costume de Shabat" | O registro diz que a imprensa "liga" o prato ao costume. | baixa | Corrigido: "é ligado a". |
| 1.28 | 01-israel-no-mapa.md:24 | "Nos folhetos estatísticos do CBS de 2009 e 2010, o Mar Morto entra com 265 km²" | A divisão por lago está na evidência só para 2010; de 2009, só o total (C01-001). | baixa | Corrigido: "No folheto estatístico do CBS de 2010". |
| 1.29 | 01-israel-no-mapa.md:33 | "um copo deixado ao relento no extremo sul juntaria, num ano inteiro, menos de 10 cm de água" | No deserto a água evapora; a imagem dizia mais do que a média de chuva. | baixa | Corrigido: "se nada evaporasse, a chuva de um ano inteiro [...] encheria um copo até menos de 10 cm". |
| 1.30 | 01-israel-no-mapa.md:45 | "e suas margens são o ponto mais baixo da Terra fora d'água" | O registro fala da superfície; as fontes dizem "lowest point on earth" e "lowest body of water exposed". Diferença pequena. | baixa | Autor: manter ou alinhar com C01-011. |
| 1.31 | 01-israel-no-mapa.md:51 | "na costa oeste" (dolinas) | "Costa oeste" vem só do título de um relatório com referência confirmada (LIM de C01-017). | baixa | Revisão: conferir no pôster do GSI. |
| 1.32 | 02-historia.md:15 | "em cada época [...] quem mandava de longe [...] governava essa gente" | Generalização sem registro, e falsa para os reinos locais (Israel, Judá, hasmoneus, Herodes); "aqui" punha o narrador dentro do país. | média | Corrigido: "já havia gente na região [...] e muitas vezes quem a governava mandava de longe". |
| 1.33 | 02-historia.md:72 | "William Dever" | O prenome não apareceu no trecho (LIM de C02-010). | baixa | Revisão: confirmar no sumário do JJAR. |
| 1.34 | 02-historia.md:168 | Rejeição árabe e aceitação "com relutância" da Organização Sionista, sem atribuição | É a formulação da ONU (LIM de C02-066); a historiografia discute os motivos. | média | Corrigido: "Segundo o histórico da ONU, ...". |

## 2. Frases factuais sem marca

Ficaram de fora orientação ao leitor, transições e definições de dicionário
óbvias. A lista separa o que tem registro NÃO VERIFICADO (portanto não deveria
estar no texto) do que só não tem registro.

**Com registro NÃO VERIFICADO e ainda no texto (gravidade média):**

- 07-hebraico.md:76: <he>מַכְתֵשׁ</he> como "cratera de erosão" e "O Machtésh Ramón, no Neguev, é uma dessas crateras" = C01-033 e C07-018, NÃO VERIFICADO. Autor/Revisão (o capítulo está marcado para não publicar).
- 07-hebraico.md:127: "Em hebraico é, na maior parte das vezes, uma crítica" (chutspá) = C07-029, NÃO VERIFICADO.
- 07-hebraico.md:125: <he>צַבָּר</he> "nascido em Israel; também o figo-da-índia" = C07-023, NÃO VERIFICADO. Além disso, o capítulo 5 (linha 95) diz "o judeu nascido no país": as duas glosas não dizem a mesma coisa.
- 07-hebraico.md:84-85: definições de kibutz e moshav = C05-071 a C05-073, NÃO VERIFICADO.
- 07-hebraico.md:114: sherut "Em geral uma van, que faz um trajeto fixo" = C08-034, NÃO VERIFICADO. Também 08-na-pratica.md:64 ("as vans compartilhadas").
- 00b-introducao.md:5: "por que o ônibus some na sexta à tarde" = C05-063 e C08-033, NÃO VERIFICADO, e nenhum capítulo explica. Corrigido: item tirado da lista.
- 00b-introducao.md:5: "por que a mesma cidade aparece com três grafias numa placa": a seção que explicaria (cap. 7, "Como ler uma placa trilíngue") está pendente, C07-009 a C07-013 NÃO VERIFICADO. Autor: manter só quando a seção existir.
- 04-alem-de-jerusalem.md:100, 133, 187, 229: "Nas placas em inglês, Caesarea / Masada / Jaffa ou Yafo / Akko ou Acre" e 53, 187, 229: "Em árabe, al-Nasira / Yafa / Akka" = C07-011 a C07-013 NÃO VERIFICADO (a auditoria do cap. 4 já registra o árabe sem fonte). 04-alem-de-jerusalem.md:103: "O que se lê na entrada dos sítios administrados pela Autoridade" e :54 "Aparece nas placas que indicam os santuários": sem registro.

**Sem registro (gravidade baixa, salvo indicação):**

- 01-israel-no-mapa.md:61: "hatichón ... ao pé da letra, 'o mar do meio'" (glosa etimológica; a auditoria do cap. 1 já pede conferência).
- 03-jerusalem.md:53: "Saladino, que tomou a cidade dos cruzados em 1187": o ano está no campo `afirmacao` de C03-040, não na evidência. O capítulo 2 tem 1187 em C02-039 (Britannica, E). Revisão.
- 03-jerusalem.md:23: "tem uma história arqueológica bem documentada" (juízo).
- 04-alem-de-jerusalem.md:76: "Nachúm é um nome próprio".
- 04-alem-de-jerusalem.md:96: "As abóbadas que hoje abrigam o centro de visitantes": uso atual a conferir (LIM de C04-026).
- 05-vida-real.md:7: "Em quase tudo isso o número de hoje não vale para daqui a dois anos".
- 06-sabores.md:7: "Nos últimos anos, pesquisadores de várias áreas passaram a olhar para o prato [...]".
- 06-sabores.md:61: "O monopólio" (palavra avaliativa; a lei diz só quem emite).
- 07-hebraico.md:75 (Tel Meguido, Tel Dan), :97 (pergaminho da mezuzá), :105 (onde ficam os dois mercados), :87 ("Feriado nacional").
- 08-na-pratica.md:11: resumo da orientação do Itamaraty sem marca. Corrigido: marca [[C08-001]] acrescentada.
- 08-na-pratica.md:15: "Dentro de Israel, os alertas à população saem do Comando da Frente Interna": a marca [[C08-008]] sustenta o aplicativo, não a exclusividade.
- 08-na-pratica.md:50: o texto pressupunha a entrevista e o "comprovante de entrada que o viajante recebe no lugar do carimbo" (C08-025 e C08-026, NÃO VERIFICADO) na mesma frase que dizia que nada disso foi confirmado. Corrigido: "Os procedimentos de segurança e de controle [...] inclusive o tipo de registro de entrada que o viajante recebe, não foram confirmados".
- 08-na-pratica.md:70: "o descanso semanal judaico" (definição; C05-061 não verificado para os horários).

## 3. Contradições entre capítulos

| # | Onde | Contradição | Gravidade | Situação |
| --- | --- | --- | --- | --- |
| 3.1 | 07-hebraico.md:55 contra 01, 03, 04, 05, 06 | O capítulo 7 diz: "Neste livro, como no curso, esse ponto só aparece nas letras em que ele muda o que se ouve". Os outros capítulos usam nikud completo, com daguesh forte e daguesh leve em todas as letras. Exemplos: <he>הַכֹּתֶל הַמַּעֲרָבִי</he> (03:23) e <he>הַכֹּתֶל הַמַעֲרָבִי</he> (07:95); <he>כִּנֶּרֶת</he> (01, 04:32) e <he>כִּנֶרֶת</he> (07:64); <he>יַם הַמֶּלַח</he> (01, 04) e <he>יַם הַמֶלַח</he> (07:65); <he>תֵּל אָבִיב</he> (04:170) e <he>תֵל אָבִיב</he> (07:63); <he>דּוּגְרִי</he> (05:95) e <he>דוּגְרִי</he> (07:126). O capítulo 6 mistura os dois: <he>תַּפְרִיט</he> com daguesh, mas <he>תוֹדָה</he> e <he>בְּבַקָשָׁה</he> (06:67) sem ele. | alta | Autor: decidir uma convenção para o livro inteiro (a do curso ou a ortografia plena) e aplicar em todos os capítulos. Hebraico não foi tocado. |
| 3.2 | 06-sabores.md:75 contra 07-hebraico.md:107 | <he>חֶשְׁבּוֹן</he>: "cheshbón" e "chesbón". O padrão (`translit.json`: ש = sh) dá cheshbón. O ESTRUTURA.md também traz "chesbón". | média | Corrigido no cap. 7 (duas ocorrências). ESTRUTURA.md não foi mexido. |
| 3.3 | 07-hebraico.md:96 contra 03:77 e 05:37 | "a Knéset" (feminino, um s) contra "o Knesset" (masculino). Além disso, "knésset" na mesma linha segue a regra do ss. | média | Corrigido: "o Knesset". |
| 3.4 | 04 (várias) e 07:64 contra 01 | "mar da Galileia" e "Mar da Galileia". | baixa | Corrigido: "Mar da Galileia" em todo o livro, como "Mar Morto". |
| 3.5 | 06-sabores.md:61 contra 05-vida-real.md:49 | "Supremo Tribunal" e "Suprema Corte" para a mesma corte. | baixa | Corrigido: "Suprema Corte". |
| 3.6 | 07-hebraico.md:93 | "bom shabat", "shabat de paz" em minúscula; o resto do livro escreve Shabat. | baixa | Corrigido na glosa portuguesa (a transliteração "shabát shalóm" ficou). |
| 3.7 | 02-historia.md:126 contra 03-jerusalem.md:11 | "lista do patrimônio mundial em perigo" e "Lista do Patrimônio Mundial em Perigo". | baixa | Corrigido no cap. 2. |
| 3.8 | 04-alem-de-jerusalem.md:108, 125, 142, 149 contra 01:56 e 98:11 | O capítulo 1 ensina a desconfiar de número sem data sobre o Mar Morto, e as Notas sobre fontes prometem que esses números "aparecem no texto sempre com a data". O capítulo 4 repetia quatro vezes "450 metros" (platô de Massada acima do lago), sem data, numa medida que cresce a cada ano. | média | Corrigido: o número aparece uma vez (linha 108), atribuído ao parque e com a ressalva de que muda conforme o lago desce; as outras três menções saíram ou viraram "lá embaixo". A caixa "observar" repetida (antiga linha 148) foi cortada. |
| 3.9 | 01-israel-no-mapa.md:17 e :103 contra 05-vida-real.md:59 | O capítulo 1 manda o status de Jerusalém Oriental e do Golã para o capítulo 2; o capítulo 5 manda o status de Jerusalém para o capítulo 3. O capítulo 3 trata da Lei Básica e da Resolução 478, mas não fala de Jerusalém Oriental nem de 1967; o capítulo 2 deixa 1967 como PENDENTE. Hoje nenhuma das remissões leva ao que promete. | alta | Autor: escolher um lugar só (o capítulo 2, seção pós-1948, parece o natural) e ajustar as duas remissões quando ele existir. |
| 3.10 | 08-na-pratica.md:70 e :74 contra 05 e 06 | O capítulo 8 dizia que o capítulo 5 "explica o Shabat [...] e por que o que fecha varia" e que o capítulo 6 fala "da gorjeta". Nenhum dos dois capítulos tem isso (C05-060 a C05-064 e C06-032 são NÃO VERIFICADO). | alta | Corrigido: a remissão do Shabat saiu; a da linha 74 diz agora "o capítulo 5 fala do jeito direto de falar, o dúgri, e o capítulo 6, das palavras úteis no restaurante". |
| 3.11 | 08-na-pratica.md:58 contra 01 | "O capítulo 1 explica o clima por região e por estação": o capítulo 1 só tem chuva; temperatura é C01-037, NÃO VERIFICADO. | média | Corrigido: "mostra como a chuva varia por região e por estação". |
| 3.12 | 00b-introducao.md:9, 10-diario.md:33, 99-encerramento.md:7 | A introdução apresenta os capítulos 2 e 9 como prontos; o diário remete ao capítulo 2; o encerramento promete "os grandes períodos da história da região". O 9 não existe e o 2 para em 1947. | alta (para a publicação) | Autor: rever esses três textos quando a estrutura fechar. |
| 3.13 | 01:7, 05:16, 08:58 | Nomes de instituição: "Central Bureau of Statistics (CBS)" no 1 e "Escritório Central de Estatística de Israel (CBS)" no 5; "Serviço Meteorológico de Israel (IMS)" no 1 e "Israel Meteorological Service" no 8; "Autoridade de Natureza e Parques" no 4 e "Israel Nature and Parks Authority" no 8. | baixa | Corrigido no cap. 8 (nome em português e nome em inglês entre parênteses, para quem for procurar). CBS fica para o autor escolher a forma. |
| 3.14 | 07-hebraico.md:125 contra 05-vida-real.md:95 | tsabár "nascido em Israel" contra sabra "o judeu nascido no país". | baixa | Autor. |
| 3.15 | 06-sabores.md:85 contra 07-hebraico.md:106 | beteavón "Dito ao servir ou ao começar" contra "Diz quem serve o prato". | baixa | Autor. |
| 3.16 | 03-jerusalem.md:17 contra 02-historia.md:128 (comentário) | Datas da muralha: o cap. 3 dá 1537 (IAA) e conclusão em 1541; o comentário do cap. 2 cita 1538-1540 (Britannica). Não há contradição no texto publicado, mas o cap. 2 ainda vai escrever a data. | baixa | Autor do cap. 2: usar a redação do cap. 3. |

Conferido e coerente entre capítulos: Herodes 37-4 a.C. (2, 4); UNESCO 1981 e
1982 para Jerusalém (2, 3); 1187 e 1291 (2, 3, 4); Massada 73 d.C. atribuído à
UNESCO (4) e "73 ou 74" pendente (2); Domo da Rocha 691-692 (3) e "fim do
século VII" (2); Kinéret, Yerushaláyim, Tel Aviv / Tel Avív, falafel, Shabat,
Massada, Cesareia, Cafarnaum, Jafa, Acre. "Homus" só aparece no capítulo 6
(o PROTOCOLO escreve "hummus"): forma do português, decisão do autor.

## 4. Protocolo

**Seção 7, temas sensíveis.**

- **Golã e Jerusalém Oriental (alta, bloqueante).** A frase de que a maior parte da comunidade internacional não reconhece as anexações, com fonte da ONU, não está em nenhum capítulo (C01-028 NÃO VERIFICADO). O capítulo 3 cita a Resolução 478 sobre a Lei Básica, mas não nomeia Jerusalém Oriental nem 1967. O capítulo 5 (linha 59) usa a contagem do CBS para Jerusalém, que inclui Jerusalém Oriental (LIM de C05-006), sem dizer isso. Revisão/Autor.
- **Monte do Templo / Haram al-Sharif.** Capítulo 3, linha 33: os dois nomes e quem usa cada um, na primeira menção. Capítulo 2 menciona o Domo da Rocha sem nomear o monte. Nota metodológica: ok.
- **Cisjordânia.** Usada no 1, 4 e 8; "Judeia e Samaria" só no 1, atribuída ao ministério. "Deserto da Judeia" (4:108, 7:72) é nome geográfico, não o termo político. Ok.
- **1948.** Ainda não escrito (capítulo 2, PENDENTE bloqueante). Nenhum outro capítulo trata do ano. O capítulo 3 não tem a cidade dividida de 1948-1967 (C03-074).
- **Mapas (média).** A nota metodológica (00a:13) promete "uma nota sobre o status de cada área"; a legenda do mapa regional (01:28) remete à caixa "Ler um mapa de Israel", que não tem essa nota. Autor.

**Fontes de nível E sustentando VERIFICADO sozinhas.** O protocolo admite isso só para fato jornalístico datado com duas fontes E independentes. Aceitáveis por essa regra: C03-061, C03-062, C03-063, C05-012, C05-025, C06-007, C06-012, C06-013. Fora da regra (média):

- C03-027 (al-Aqsa e o Domo no mesmo complexo): fato descritivo, não datado, duas fontes E. Já sinalizado na auditoria do cap. 3.
- C03-053, C03-055 (descoberta em 1880 e remoção em 1890 da inscrição de Siloé): fatos históricos, não jornalísticos, sustentados por AP e COJS.
- C03-056 (inscrição no Museu de Istambul hoje): fato atual, sem página do museu.
- C06-010 (sabich, Ramat Gan, 1961): história da comida com duas reportagens; o texto já diz "reportagens", mas o status é VERIFICADO.
- C01-012 (Mar Morto a mais de 430 m em 2022): o número vem de Guinness e Britannica (E); a fonte D só confirma a tendência. Já sinalizado na auditoria do cap. 1.
- CONTESTADO apoiados em E: C03-040 (uma reportagem), C06-008 e C06-009 (History Today e Canadian Jewish News; as obras acadêmicas só têm referência confirmada).
- Fontes de nível A sem autor identificado: F05-019 (o estudo da Kulturní Studia, que sustenta 05:87 sobre os drusos), F02-023, F02-029, F02-053, F02-067. Revisão.

**Tradição apresentada como fato.** Não achei caso aberto: Santo Sepulcro, casa de Pedro, túnel de Ezequias, coptas e falafel, Cilindro de Ciro e Davi e Salomão vêm com "segundo a tradição", caixa "História ou tradição?" ou debate atribuído. Nenhuma ressalva precisou ser acrescentada.

**Anacronismo.** Não encontrado. O capítulo 2 usa Israel e Judá para os reinos, "judaítas", e "árabe palestina" só para 1936. "Historiador judeu Flávio Josefo" (4:112) é do século I d.C. Corrigido: a linha do tempo do capítulo 2 (linha 28) dizia "fim do séc. VII" logo depois de datas a.C.; agora diz "d.C.".

**Generalizações culturais.**

- 04-alem-de-jerusalem.md:45: "a pergunta não ofende ninguém". Corrigido: "pode ser feita com todo o respeito".
- 04-alem-de-jerusalem.md:42: "antiga, venerável e importante para milhões de pessoas" (número sem fonte e lista de três adjetivos). Corrigido: "antiga e importante para muita gente".
- 04-alem-de-jerusalem.md:49: "Essa sobreposição é, por si só, um documento: mostra há quanto tempo o lugar é venerado". Corrigido: "pode indicar".
- 05-vida-real.md:81: título "Quase ninguém troca de rede escolar". Corrigido: "Poucos trocam de rede escolar" (o dado é 2%).
- 07-hebraico.md:98: "chapéu redondo que homens judeus usam sempre ou só na reza". Corrigido: "que muitos homens judeus usam, uns o tempo todo, outros só na reza".
- 05-vida-real.md:98 (caixa do autor): "responder no mesmo tom" é conselho de comportamento sem fonte; a caixa já é `pendente`. Autor.

**Caixas "O olhar de um israelense"** (01:66 e 05:97): as duas estão escritas como explicação geral, sem lembrança pessoal. Seguem `pendente` até o autor aprovar.

**Sobre o autor.** Nenhuma informação sobre Moshik Gueta em nenhum capítulo, nos créditos de texto nem no encerramento. Nada inventado.

**Outros pontos.**

- 03-jerusalem.md:59: "Debaixo da cidade antiga, um túnel": o túnel de Siloé fica fora da muralha da Cidade Antiga, e o capítulo usa "Cidade Antiga" para o recinto murado. Corrigido: "Debaixo de Jerusalém". A localização em Silwan e o papel da Fundação Ir David (C03-077) continuam fora do texto, e o capítulo precisa deles (auditoria do cap. 3).
- 05-vida-real.md, seção "Hebraico e árabe na lei": o título promete hebraico, mas a cláusula que define o hebraico como língua do Estado (C05-050) é NÃO VERIFICADO e o texto só fala do árabe. Autor.

## 5. Hebraico

Nada do hebraico foi alterado. Só a transliteração de <he>חֶשְׁבּוֹן</he> no
capítulo 7 foi trazida para o padrão (item 3.2).

**Erro provável**

1. **Convenção de daguesh incoerente** (item 3.1). É o achado mais importante desta seção. Inclui o exemplo pedido: <he>הַכֹּתֶל הַמַּעֲרָבִי</he> (03:23 e 03:127) contra <he>הַכֹּתֶל הַמַעֲרָבִי</he> (07:95). Dentro da convenção do capítulo 7 a forma sem daguesh é coerente; contra a ortografia plena usada no resto do livro, é falta de daguesh forte.
2. **06-sabores.md:67**: <he>תוֹדָה</he> e <he>בְּבַקָשָׁה</he> sem daguesh, num capítulo que escreve <he>תַּפְרִיט</he>, <he>תְּעוּדַת</he> e <he>סַבִּיח</he> com ele. Pela ortografia plena: <he>תּוֹדָה</he>, <he>בְּבַקָּשָׁה</he>. Pela convenção do curso, os outros é que mudam.
3. **chesbón** no capítulo 7 (corrigido) e no ESTRUTURA.md (não tocado).
4. **"a Knéset"** (corrigido para "o Knesset"; na transliteração do padrão seria "Knésset").

**Decisão do autor**

1. Maiúsculas na transliteração de nomes próprios: "hayám hatichón" (01:61) e "haír halevaná" (04:171) em minúscula; "Yam HaMélach", "HaKótel HaMaaraví", "Har HaBáyit" com maiúsculas.
2. Tônicas a confirmar: "Dízengof" (04:172), "Yáfo" (04:187, 188), "Áko" (04:229, 07:66), "Keisárya", "Chéifa", "Tvérya" (já listadas na auditoria do cap. 4).
3. "solelá" como a palavra que se usa para a rampa de Massada (04:135).
4. Grafia pontuada de <he>יַאלְלָה</he> (07:130).
5. Árabe com acento agudo: "taamíya" (06:37) é o único nome árabe do livro com acento; os outros (al-Aqsa, Haram al-Sharif, Akka, Yafa, al-Nasira) vão sem. Uniformizar.
6. "Tel Meguido" (07:75): no texto corrido o português usa Megido; como transliteração, a tônica seria "Meguidó".
7. Glosa de <he>צַבָּר</he> (item 3.14).

Conferidas sem problema, contra `data/translit.json`: Guichón, Natsrát, knessiyá, Kfar Nachúm, beit knésset, minzár, namál, teatrón, gan leumí, Metsadá, mivtsár, Sderót Rótshild, Nemál Yáfo, ir atiká, Har HaKármel, ganím, chomá, tsalvaním, chiloní, masortí, datí, charedí, dúgri, chúmus, sabích, kashrút, kashér, teudát kashrút, tafrít, meltsár, máyim, cheshbón, bevakashá, todá, bsarí, chalaví, missadá, léchem, píta, kafé, shuk, beteavón, Yehúd, Midbár Yehudá, Néguev, náchal, Émek Yizreél, aliyá, olé chadásh, kibúts, mosháv, ulpán, Yom HaAtsmaút, chag saméach, mezuzá, kipá, tachaná merkazít, beséder, ma nishmá, todá rabá, tsabár, chutspá, balagán, savlanút, sabába, tsímer. Pontuação fora de `<he>` em todas as ocorrências (conferido por busca).

## 6. Português

**Corrigido**

- 02-historia.md:99: "O texto conta é que" (frase truncada) virou "O que o texto conta é que".
- 04-alem-de-jerusalem.md:145: "O hebraico preferiu outro traço da água e a chama pelo sal" (o pronome ia para "água"): "o chama".
- 04-alem-de-jerusalem.md:115: "A primeira é sobre o ano 73", mas a discussão é sobre o suicídio, não sobre o ano: "sobre o que aconteceu em 73".
- 03-jerusalem.md:53: "a agência Reuters encontrou Adeeb Joudeh [...] como guardião" (construção torta): reescrita.
- 03-jerusalem.md:7: "a visita fica muito mais rica" (clichê): "quem aprende a separá-las [...] enxerga mais na visita".
- 04-alem-de-jerusalem.md:159 e :180: "portanto" três vezes em poucas páginas; dois cortados.
- 04-alem-de-jerusalem.md: "450 metros" quatro vezes e a "melhor régua" (que repetia a "boa régua" de 01:7): ver item 3.8.
- 04-alem-de-jerusalem.md:159: a frase "Cerca de mil edifícios [...]" ganhou a marca [[C04-058]], que só aparecia na frase seguinte.

**Para o autor (baixa)**

- 03-jerusalem.md:7: "É esse o exercício das próximas páginas" e 06-sabores.md:9: "As próximas páginas ficam com" são aberturas de roteiro, perto do "Neste capítulo veremos" que o PROTOCOLO desaconselha.
- 06-sabores.md:15: "Vale lembrar disso no balcão".
- 02-historia.md:54 e 01-israel-no-mapa.md:7: "um bom antídoto" e "uma boa régua", fórmulas da mesma família.
- O capítulo 4 abre quase toda seção com caixa "observar" e caixa "em-hebraico"; o teto do PROTOCOLO (uma a três por seção longa) é respeitado, mas a cadência fica previsível.
- 05-vida-real.md:16 e 01-israel-no-mapa.md:7: o leitor encontra o CBS com dois nomes (item 3.13).

---

## Resumo

1. Validador: 0 erros depois das edições; avisos só para as caixas pendentes e a falta do capítulo 9.
2. Foram achadas 34 frases maiores que o registro e corrigidas 30 (as outras quatro dependem de abrir a fonte), entre elas três de gravidade alta: a "cor da cidade" (que reintroduzia a regra da pedra, não verificada), o "nome de dois mil anos" do Mar Morto e as remissões do cap. 8 a conteúdos que não existem (Shabat no 5, gorjeta no 6).
3. Bloqueante: a frase da ONU sobre Jerusalém Oriental e o Golã não está em capítulo nenhum, e as remissões do cap. 1 (para o 2) e do cap. 5 (para o 3) não levam a ela.
4. Bloqueante: o capítulo 2 para em 1947 e o 9 não existe, mas a introdução, o diário e o encerramento os tratam como prontos.
5. Hebraico, alta: o cap. 7 declara uma convenção de daguesh (só onde muda o som) que os capítulos 1, 3, 4, 5 e 6 não seguem, e o cap. 6 mistura as duas. O autor precisa escolher uma. Nada do hebraico foi tocado.
6. Termos uniformizados: Mar da Galileia, Suprema Corte, o Knesset, Shabat, Lista do Patrimônio Mundial em Perigo, cheshbón, nomes de instituição no cap. 8.
7. O cap. 4 deixou de repetir "450 metros" sem data; o número aparece uma vez, atribuído e com a ressalva de que muda.
8. Cap. 7: três afirmações de registros NÃO VERIFICADO (Makhtesh Ramon como cratera de erosão, chutspá, tsabár) estão no texto; o arquivo já está marcado como "não publicar".
9. Nove registros VERIFICADO ou CONTESTADO dependem só de fontes E fora da exceção do jornalismo datado (Siloé 1880 e 1890, paradeiro da inscrição, al-Aqsa, sabich, nível do Mar Morto, origem do falafel). A revisão precisa de fonte A-D para eles.
10. Nenhuma informação inventada sobre o autor; as duas caixas "olhar-israelense" seguem pendentes e não soam como lembrança pessoal.

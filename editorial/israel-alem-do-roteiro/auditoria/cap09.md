# Auditoria interna: capítulo 9, "41 curiosidades sobre Israel"

Auditoria interna feita por IA em 21 de outubro de 2026. Não é revisão
acadêmica nem conferência de texto integral.

**Estado:** capítulo escrito do zero (`manuscrito/09-curiosidades.md`), com a
diretiva `curiosidade`. Fecharam **41 curiosidades**, não 50: a cota de 45
buscas acabou e as que sobraram não tinham fonte aceitável. Por isso o título
ficou "41 curiosidades sobre Israel" e a entrada diz "41 delas" (ver
pendências: o dono decide se mantém o número no título ou muda para
"Curiosidades sobre Israel").

- Validador (`node tools/validar.mjs israel-alem-do-roteiro`): 0 erros; o
  único aviso restante é do capítulo 1 (caixa do autor), nenhum do capítulo 9.
- PDF `saida/capitulo-09.pdf`: 15 páginas (abertura, 11 de curiosidades,
  perguntas, fontes); QR lidos de volta 2/2.
- `inspecionar.mjs --formato=capitulo-09`: nenhum transbordo; "quase vazia" só
  a página 1, que é a abertura do capítulo sem imagem (como nos capítulos 4 a
  6). As páginas 9, 10 e 12 ficam entre 59% e 66% por causa das quebras antes
  dos intertítulos de categoria.
- Palavras do manuscrito: cerca de 2.500 (o orçamento era 4.500; o capítulo
  ficou menor porque cada curiosidade tem de 2 a 4 frases e só 41 fecharam).
- Travessão e meia-risca: verificação em `/home/user/hebraicofluente/editorial`
  sem ocorrências.

## 1. Afirmações por status

| Status | Quantidade | IDs |
| --- | --- | --- |
| VERIFICADO | 49 | C09-001 a 005, 007 a 009, 011 a 021, 023 a 037, 039 a 053 |
| CONTESTADO | 3 | C09-006 (quem operava Timna), C09-010 (túmulo de Herodes), C09-022 (data, escrita e propósito do Calendário de Gezer) |
| NÃO VERIFICADO | 14 | C09-038 e C09-054 a 066 (fora do texto) |
| Total | 66 | |

Fontes: 71 (`fontes/cap09.json`). Níveis: A 2, B 12, C 2, D 7, E 48. Todas
com `acesso: trecho-de-busca`. Duas fontes A (artigo de Ben-Yosef no BASOR e o
ensaio LEAP no NEJM) têm o título como "a confirmar": a busca deu o periódico,
o ano e o conteúdo, não o título exato.

Registros com `revisar_ate` (2027-10-21): C09-027 e 028 (notas em circulação),
C09-039 e 040 (água), C09-050 (contagem do Eurovisão).

## 2. Buscas

45 buscas na web, o teto do pedido. Cada uma rendeu no máximo duas
curiosidades. As que confirmaram por fonte A a D: UNESCO (Carmelo, Maresha,
Rota do Incenso, Bet She'arim), Universidade de Tel Aviv e BASOR (Timna),
Ministério das Relações Exteriores de Israel (barco da Galileia, túmulo de
Herodes, Eurovisão 2018), Knesset (Lei Básica de 2018), Banco de Israel
(notas), nobelprize.org (Agnon e Sachs; Ada Yonath), Instituto Weizmann,
Sefaria (Mishná Rosh Hashaná 1:1 e Meguilá 1:1), Churchill Archives Centre
(menorá do Knesset), Hadassah (vitrais de Chagall), CBS de Israel (água),
PubMed Central (LEAP), Britannica (Einstein), Direção-Geral da Educação de
Portugal (Justos brasileiros).

## 3. Onde o capítulo se apoia em fontes de nível E (atenção da revisão humana)

O PROTOCOLO aceita duas fontes E independentes para fato datado. Usei essa
regra nestes casos, e cada um precisa ser conferido em fonte primária:

- C09-015 e 016 (rolos de prata de Ketef Hinom): Unpacked e Baptist Press.
  Abrir o relatório de Barkay ou a página do Museu de Israel.
- C09-017 e 018 (tamareira Matusalém): Science News e AP; abrir os artigos na
  Science (2005 e 2008).
- C09-019 e 020 (Santuário do Livro): Center for Israel Education e
  Biblical Archaeology Society; conferir no material do Museu de Israel. O
  simbolismo da cúpula e do muro não é "fato datado"; mantive por ser a
  descrição corrente, mas é o primeiro a sair se o museu não confirmar.
- C09-024 e 025 (Hatikvá: autoria de Imber e lei de 2004): My Jewish
  Learning e Hadassah Magazine; conferir a emenda no site do Knesset.
- C09-029 (emblema, 10/2/1949, irmãos Shamir, Arco de Tito): Jewish Virtual
  Library e The Jewish Press. A descrição do emblema (C09-023) vem da Lei
  Básica (nível D).
- C09-033 (poupa), C09-035 (Ramon), C09-036 (Beresheet), C09-048 (Sigd),
  C09-050 e 051 (Eurovisão), C09-052 (Homeland), C09-053 (Macabíada): fatos
  datados com duas ou três fontes E.
- C09-041 (Netafim, 1965, Hatzerim): MIT Sloan Management Review e JTA. O
  texto não diz que Israel inventou a irrigação por gotejamento.
- C09-044 (ptitim): The Forward e JTA; o ano varia (1951 a 1953) e o texto
  diz "começo dos anos 1950". Uma busca pela história no site da Osem não achou
  nada.
- C09-047 (Jerusalém celebra o Purim no dia 15): Hebcal e ReformJudaism.org,
  sobre a regra da Mishná (C09-046, nível C).
- C09-032 (Justos brasileiros): o documento português (D) e o Jewish News
  dão 2003 para Souza Dantas; uma fonte dá 1982. Conferir no banco de dados do
  Yad Vashem.

## 4. Debates e como o texto os apresenta

- **Timna (C09-006):** três posições atribuídas: sociedade local,
  provavelmente edomita (Universidade de Tel Aviv); "minas do rei Salomão"
  (leitura da imprensa); datação anterior no século XIII a.C., sob domínio
  egípcio. O texto fecha com "quem trabalhava ali continua em discussão".
- **Túmulo de Herodes (C09-010):** a identificação de Netzer e a objeção de
  Arthur Segal (sem ossos nem inscrição). O vf do fim do capítulo é sobre
  isso. O Herodium é situado na Cisjordânia.
- **Calendário de Gezer (C09-022):** data incerta por escavação sem
  estratigrafia, escrita fenícia ou paleo-hebraica, propósito discutido.
- **Cavernas do Carmelo (C09-002):** o texto avisa que "mesmo quadro
  cultural" não quer dizer convivência no mesmo momento.

## 5. Curiosidades descartadas e por quê

| Tema | Motivo |
| --- | --- |
| Anêmona como flor nacional (2013) | Duas buscas; só Wikipedia e blogs (C09-055). |
| Festival Darom Adom e a pausa depois de outubro de 2023 | Uma só fonte E (C09-058). |
| 120 cadeiras do Knesset e a Grande Assembleia | Só fontes E sem o Knesset nem o Talmud conferidos (C09-054). |
| "Mona Lisa da Galileia" em Tsipori | Busca sem fonte institucional nem dados da escavação (C09-056). |
| Teleférico de Rosh HaNikra "o mais íngreme do mundo" | Superlativo promocional (C09-057). |
| Corais de Eilat: estudo das ondas de calor (Kochman e Fine) | Uma só fonte E; saiu do texto (C09-038). A curiosidade do experimento de Fine ficou, com duas fontes. |
| Rolos de Ketef Hinom "os textos bíblicos mais antigos" | Superlativo só em veículos de divulgação (C09-064). |
| Agnon "primeiro israelense com Nobel" | Origem do trecho não identificada (C09-066). |
| Calendário de Gezer no Museu de Istambul | Só Wikipedia (C09-061). |
| Netzer morreu no Herodium (2010); Ramon e a comida kasher | Só Wikipedia (C09-059, C09-060). |
| Melodia do Hatikvá (Samuel Cohen, canção moldava) | Fontes E divergentes (C09-063). |
| Etimologia de ptitim | Fontes E divergentes (C09-065). |
| Israel "inventou" o tomate-cereja, "maior número de museus per capita", "única língua revivida" | Mitos citados no pedido; não entram (C09-062 registra o do tomate). |
| Shmita, Lag BaOmer em Meron, laranja de Jafa, íbex de En Gedi, Kahneman, Bauhaus de Tel Aviv, lugares bahá'ís, vale do Hula | Não buscados por falta de cota, ou já tratados nos capítulos 1 e 4. |

## 6. Repetição com outros capítulos

Antes de escolher, fiz grep nos capítulos 1 a 8 por cada tema. Ficaram de fora
os já tratados: vale do Hula e lago Agmon (cap. 1), lugares bahá'ís e Cidade
Branca (cap. 4), túnel de Ezequias (cap. 3), Lei Básica do Estado-nação e
árabe (cap. 5 e 7), Academia da Língua Hebraica e Ben-Yehuda (cap. 7). Os
capítulos 3 a 6 estavam sendo reescritos por outros agentes durante este
trabalho: se as versões novas passarem a tratar dos Manuscritos do Mar Morto
(Santuário do Livro), de Massada (tamareira), do barco da Galileia ou do
Purim, a curiosidade correspondente deve virar remissão ou sair. Remissões
usadas: cap. 2 (Herodes; destruição de 70 d.C.), cap. 4 (Mar da Galileia,
Massada), cap. 5 (festas), cap. 6 (mesa), cap. 8 (shekel).

## 7. Hebraico para aprovação do dono

Duas palavras, uma por curiosidade:

- <he>הַתִּקְוָה</he> (Hatikvá), "a esperança", na curiosidade 19.
- <he>פְּתִיתִים</he> (ptitím), na curiosidade 32.

O texto corrido usa "Hatikvá" e "tsená" (austeridade) só em letras latinas.
Os registros de afirmação citam também טוּ בִּשְׁבָט na evidência (não vai ao
texto).

## 8. Links, fotos e figuras

- `ativos/dados/links-cap09.json`: 3 links oficiais (UNESCO Carmelo, UNESCO
  Maresha, Banco de Israel). Dois estão no texto (Carmelo e Banco de Israel);
  o de Maresha fica disponível e não é usado. As URLs são as vistas na busca.
- Fotos: nenhuma (sem cota de busca para o Commons). O capítulo não pede foto.
- Figuras: nenhuma.

## 9. Atividades

2 quiz (nota de 100 shekels; dia do Purim em Jerusalém) e 1 vf (inscrição no
túmulo de Herodes), todos sobre o que o capítulo diz.

## 10. Pendências para revisão humana

1. Decidir o título: "41 curiosidades" (contagem real) ou outro sem número.
2. Conferir em fonte primária os itens da seção 3.
3. Abrir os dois artigos A cujo título ficou "a confirmar" (BASOR 2016;
   NEJM 2015, 372:803-813).
4. Aprovar o hebraico da seção 7.
5. Reconferir as remissões depois que os capítulos 3 a 6 forem fechados.
6. A página do Nobel de Ada Yonath vista numa cópia trazia uma data de morte
   (31 de agosto de 2026) que a busca não confirmou; o texto não fala disso,
   mas vale conferir antes de publicar.

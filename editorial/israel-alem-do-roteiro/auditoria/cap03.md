# Auditoria interna do capítulo 3: Jerusalém, uma cidade de muitas histórias

Data: 21/10/2026 (segunda rodada). Auditoria interna feita por IA depois da
escrita. Não é revisão acadêmica: nada aqui foi revisado, validado ou aprovado
por especialista.

## 0. O que esta rodada fez

A primeira rodada parou por falta de buscas e deixou fora os temas C03-067 a
C03-082. Nesta, com cerca de 23 buscas (texto e imagens; o orçamento dos dois
capítulos foi de 60, e os dois usaram 39), o capítulo foi reescrito no padrão
dos capítulos 1 e 2: abertura com cena, linha do tempo de Jerusalém, oito
seções novas ou ampliadas, a seção "10 detalhes" em desafios de observação
(`observacao`), 4 perguntas, 5 fotos, 4 QR.

- Manuscrito: 4.318 palavras (validador), contra 2.743 antes.
- PDF: `saida/capitulo-03.pdf`, 27 páginas, 4 de 4 QR lidos de volta.
- `tools/inspecionar.mjs --formato=capitulo-03`: nenhum transbordo, nenhuma
  página quase vazia.
- `tools/validar.mjs`: 0 erros (os 3 avisos são de outros capítulos).
- Travessão e meia-risca: as duas verificações da pasta saíram vazias.

## 1. Afirmações por status (afirmacoes/cap03.json)

| Status | Quantidade |
| --- | --- |
| VERIFICADO | 78 |
| CONTESTADO | 5 (C03-019, C03-040, C03-041, C03-051, C03-107) |
| PARCIALMENTE VERIFICADO | 15 (fora do texto) |
| NÃO VERIFICADO | 13 (fora do texto) |
| Total | 111 (29 novas: C03-083 a C03-111) |

Fontes: 90 (A 10, B 27, C 4, D 16, E 33); 34 novas (F03-057 a F03-090), todas
`trecho-de-busca`. O texto também cita, sem repetir a pesquisa, nove
afirmações verificadas do capítulo 2 (C02-018, 027, 028, 031, 040, 048, 501,
521, 525), para a linha do tempo, Aelia Capitolina e a cidade dividida: as
datas ficam iguais às do capítulo 2 por construção.

Os registros antigos que esta rodada resolve (C03-067 a C03-077) não foram
apagados: ganharam uma nota em `limitacoes` apontando a afirmação nova.

## 2. O que foi pesquisado e entrou

- **Quatro bairros** (C03-083, C03-084): a tese de Matthew Teller (2022),
  atribuída a ele, com o mapa britânico de 1841; e um estudo dos registros do
  tribunal islâmico (Sroor, Toyo Bunko) em que "bairro" não designava o
  conjunto da população muçulmana. A frase da legenda que o `jerusalem.json`
  pedia ("simplificação do século XIX") agora tem fonte, desde que atribuída.
- **Portas** (C03-085 a C03-093): oito em uso, a Porta Nova como acréscimo
  otomano, a Dourada fechada; nomes árabes de Jafa, Sião e Herodes; traços de
  Damasco, Leões e Esterco. Fontes D (Ministério do Turismo e prefeitura). A
  IAA fala de sete portas na obra de Solimão (C03-008): o texto diz "abriu
  sete; hoje há oito", coerente com as duas.
- **Torre de Davi** (C03-094 a C03-096, C03-111): torres de Herodes, o engano
  bizantino do nome, o minarete otomano, museu desde 1989, junto da Porta de
  Jafa. Fonte: o próprio museu (parte interessada) e o Ministério do Turismo.
- **Via Dolorosa** (C03-097, C03-098): só o que a Custódia da Terra Santa diz
  da procissão de sexta-feira e do cerimonial de 1760, numa caixa "História ou
  tradição?". A história do traçado e do número de estações não achou fonte
  A-D e ficou fora (C03-070).
- **Monte das Oliveiras** (C03-108, C03-109) e **mercado do algodão**
  (C03-110, Da'adli e Barbé 2017, Archnet).
- **Saída das muralhas e cidade dividida** (C03-103, C03-104): Mishkenot
  Sha'ananim (1860) e a Porta Mandelbaum; queda do Bairro Judeu, armistício e
  1967 pelos registros do capítulo 2.
- **Cidade de Davi em Silwan** (C03-105 a C03-107): localização, operação pela
  Elad desde 1997, decisão judicial após petição da Ir Amim, e o debate
  (CONTESTADO) entre a apresentação oficial e os críticos (Greenberg, CMI).
- **Jordânia** (C03-099, C03-100): artigo 9 do tratado de 1994 e acordo de 2013
  (Kattan; MEI-NUS). **Posição palestina** (C03-101, C03-102): artigo 3 da Lei
  Básica emendada de 2003 (Constitute Project; embaixada palestina) e a
  declaração do Conselho Central da OLP em 2000 (cronologia do Institute for
  Palestine Studies).

## 3. Problemas encontrados e correções

- **Fontes E e partes interessadas.** C03-083 apoia-se em três fontes E sobre a
  tese de um autor (está atribuída). C03-106 mistura duas E e uma B que é
  projeto de um instituto palestino (Jerusalem Story). O museu da Torre de
  Davi, a Custódia e a Elad falam de si mesmos. Tudo atribuído no texto.
- **Fala de Rafi Greenberg** veio por jornalismo (Al Jazeera, 2013); está numa
  afirmação CONTESTADO, com as duas posições.
- **A posição da própria Elad** não foi lida em fonte dela (o site não apareceu
  na busca). O texto cita a missão declarada como a Jerusalem Story a cita.
- **Ano da decisão judicial** sobre a Elad não apareceu no trecho; o texto não
  dá ano.
- **Data da Porta Nova** (1887 ou 1889) diverge; o texto não dá ano.
- **Dia do acordo de 2013** (31 de março numa fonte) ficou fora.
- **Expansão árabe e cristã fora das muralhas** no século XIX não foi
  verificada: o texto só nomeia o bairro judeu de 1860 e dá o crescimento da
  população da região (capítulo 2). Falta equilíbrio aqui; ver item 4.
- **Retirado na revisão adversária:** a cena de abertura com "hebraico, árabe,
  armênio e inglês" no mercado; "há armênios fora do bairro armênio"; a Via
  Dolorosa "ligando o bairro muçulmano ao Santo Sepulcro"; a "encosta coberta
  de lápides claras"; a localização do Mapa de Madaba na legenda (a foto saiu
  da composição). Nada disso tinha fonte.
- **Anacronismos e generalizações:** conferido; nada novo.

## 4. Fontes adicionais necessárias (revisão humana)

1. Bairros árabes e cristãos fora das muralhas no século XIX (Sheikh Jarrah,
   American Colony, Complexo Russo) com fonte A-D, para o parágrafo da saída
   das muralhas não contar só o lado judeu. Lemire (Jerusalem 1900) e
   Ben-Arieh são as pistas.
2. Teller (2022) no texto integral, e um trabalho acadêmico sobre os quatro
   bairros (Arnon, Middle Eastern Studies, foi procurado e não achado).
3. Texto oficial do tratado Israel-Jordânia (artigo 9) e do acordo de 2013.
4. Posição da Elad em fonte própria; ano da decisão da Suprema Corte.
5. História do traçado da Via Dolorosa (Custódia, estudos franciscanos).
6. Nomes hebraico e árabe da Porta de Damasco (Sháar Shchem, Bab al-Amud) e o
   nome hebraico das demais: só achados em fontes E.
7. Pendências da rodada anterior que seguem valendo: Galor (2017), Cohen
   (2008), Frumkin et al. (2003), Reich e Shukron (2011), Museus Arqueológicos
   de Istambul (Siloé), Pro-Jerusalem Council (1918), lista oficial de
   embaixadas.

## 5. Debates e como o texto os apresenta

- Os quatro bairros: tese de Teller, atribuída, e o que dizem os registros
  locais; o texto conclui só que o esquema simplifica.
- Status quo da esplanada: posição declarada do governo israelense (2015) e
  o papel jordaniano nas palavras do tratado e do acordo de 2013, com a nota
  de que o alcance é disputado.
- Status de Jerusalém: Lei Básica israelense (1980), Resolução 478, Lei Básica
  palestina (2003) e OLP (2000), cada um com data e palavras; embaixadas.
- Cidade de Davi em Silwan: apresentação oficial contra críticos (CONTESTADO).
- Mantidos da rodada anterior: data do túnel e da inscrição de Siloé, data do
  Domo da Rocha, autenticidade do túmulo, origem da guarda da chave, cruzes de
  Santa Helena.

## 6. Esquema da Cidade Antiga (para o desenhista)

`ativos/dados/jerusalem.json` foi atualizado. Com o que está verificado hoje,
um esquema fora de escala pode mostrar:

- muralha genérica de Solimão, com a legenda "4.300 m, 35 torres, 344
  seteiras; sete portas na obra original, oito em uso hoje" (C03-008, C03-085);
- dentro: a esplanada (Monte do Templo / Haram al-Sharif) com o Domo da Rocha
  e al-Aqsa, o Muro Ocidental no lado oeste dela e o Arco de Robinson perto da
  quina sudoeste (C03-012 a C03-015, C03-018, C03-020, C03-027);
- a Torre de Davi colada à Porta de Jafa (C03-111);
- fora: o Monte das Oliveiras a leste (C03-108), com o Getsêmani ao pé
  (C03-109); a Cidade de Davi logo ao sul do Monte do Templo, em Silwan
  (C03-105), com o túnel de Siloé partindo da fonte de Giom (C03-048);
- uma lista lateral das oito portas com os nomes verificados (sem posição).

Ainda não dá para desenhar: o lado da muralha de cada porta, o Santo
Sepulcro, o Cardo, a Via Dolorosa e os limites dos bairros. A legenda dos
bairros, se entrar, deve vir atribuída (C03-083).

## 7. Pendências editoriais

- **Hebraico para aprovação do dono** (todas as ocorrências do capítulo):
  <he>יְרוּשָׁלַיִם</he> Yerushaláyim; <he>הַכֹּתֶל הַמַּעֲרָבִי</he> HaKótel
  HaMaaraví; <he>הַר הַבַּיִת</he> Har HaBáyit; <he>מִגְדַּל דָּוִד</he> Migdál
  Davíd; <he>הַר הַזֵּיתִים</he> Har HaZeitím; <he>זַיִת</he> záyit;
  <he>עִיר דָּוִד</he> Ir Davíd; <he>גִּיחוֹן</he> Guichón; <he>שַׁעַר</he>
  sháar; <he>שַׁעַר יָפוֹ</he> Sháar Yáfo; <he>שַׁעַר שְׁכֶם</he> Sháar Shchem;
  <he>שַׁעַר הַפְּרָחִים</he> Sháar HaPrachím; <he>שַׁעַר הָאֲרָיוֹת</he> Sháar
  HaArayót; <he>שַׁעַר צִיּוֹן</he> Sháar Tsiyón; <he>שַׁעַר הָאַשְׁפּוֹת</he>
  Sháar HaAshpót; <he>הַשַּׁעַר הֶחָדָשׁ</he> HaSháar HeChadásh. Dúvidas para o
  dono: a tônica de "HaZeitím" e se "Sháar HaAshpót" é a forma usada nas
  placas.
- **Árabe transliterado** (a uniformizar com os outros capítulos): Bab
  al-Khalil, Haram al-Sharif, Qubbat al-Sakhra, al-masjid al-aqsa, Suq
  al-Qattanin, Silwan.
- **Fotos** (`ativos/dados/fotos-candidatas-cap03.json`, 11 candidatas):
  usadas a Porta de Jafa (Matson, "sim"), a Torre de Davi (Wayne McLean, CC BY
  2.0, "sim"), a Via Dolorosa (Matson, "sim"), a fachada do Santo Sepulcro
  (Delaney: a página declara CC BY-SA 3.0 e "All rights reserved" ao mesmo
  tempo; "confirmar", e trocar se não se resolver) e a vista do Monte das
  Oliveiras ("confirmar", licença não vista). Reaproveitada do capítulo 2:
  `foto-domo-loc-temple-area` ("confirmar"). Nenhuma NC/ND.
- **Links (QR)** em `ativos/dados/links-cap03.json`: UNESCO (página de mapas do
  sítio 148, a URL vista), IAA (muralhas), Museu da Torre de Davi, Custódia
  (Getsêmani).
- **Prazos**: C03-097 (procissão) e C03-029/030 vencem em 21/04/2027; C03-106 e
  C03-039/063 em 21/10/2027.
- Nenhuma caixa "O olhar de um israelense".

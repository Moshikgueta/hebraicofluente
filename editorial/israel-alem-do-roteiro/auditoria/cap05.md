# Auditoria interna: capítulo 5, A vida real em Israel

Data: 21/10/2026 (segunda rodada). Esta é uma auditoria interna feita por IA. Não é revisão acadêmica, e nada aqui foi "revisado" ou "aprovado" por especialista.

## Resumo da rodada

A primeira rodada parou na cota de buscas e deixou fora a semana, o calendário, a composição religiosa, o serviço das mulheres e o kibutz. Esta rodada usou 43 buscas no total para os capítulos 5 e 6 (cerca de 22 para o 5, contando 2 de fotos), dentro do teto de 55. O capítulo foi reescrito no padrão dos capítulos 1 e 2: abertura com cena (a sexta à tarde), seções novas sobre a semana, o Shabat, o calendário e as sirenes, a composição religiosa com cristãos e drusos, o serviço militar com duração e isenções, kibutz e moshav, e uma lista nova de "10 coisas", todas verificadas.

- Manuscrito: cerca de 3.080 palavras (contagem do validador), alvo 3.000.
- PDF `saida/capitulo-05.pdf`: 18 páginas, 2 QR lidos de volta.
- `node tools/inspecionar.mjs --formato=capitulo-05`: transbordo em nenhuma página; "quase vazia" só a página 1, que é a página de abertura do capítulo (título e frase, sem imagem de abertura, como no capítulo 4). A página 16 (fim das "10 coisas", antes das perguntas) fica com cerca de 60% de ocupação.
- `node tools/validar.mjs`: 0 erros no projeto (os avisos restantes não são deste capítulo).
- Infográfico `infografico-semana`: `ativos/dados/semana.json` passou a `status: "pronto"`, todas as notas com afirmação VERIFICADO; o SVG foi gerado por `node tools/infograficos.mjs` (só leitura do gerador, que regravou os mesmos arquivos dos outros capítulos sem mudança) e está no texto com `::: figura infografico-semana`. Cada nota tem `texto_curto` de até 16 caracteres, porque o gerador corta em 22 e a coluna é estreita; o coordenador pode redesenhar.

## 1. Afirmações por status

| Status | Quantas | No texto |
| --- | --- | --- |
| VERIFICADO | 51 | 48 (C05-007, C05-044 e C05-045 ficaram fora por espaço ou por duplicar C05-093/094) |
| CONTESTADO | 1 (C05-015, o alcance da mudança no status do árabe) | sim, com o debate |
| PARCIALMENTE VERIFICADO | 9 | não |
| NÃO VERIFICADO | 19 | não |
| Total | 80 | 49 ids distintos no texto |

Fontes: 66 (A 7, B 15, C 3, D 7, E 34). Novas nesta rodada: F05-033 a F05-066.

Registros novos: C05-078 a C05-100. Atualizados para VERIFICADO com fonte: C05-061 (Shabat de pôr do sol a pôr do sol), C05-066 (calendário lunissolar), C05-076 (nomes dos dias), C05-044 (24 meses para mulheres) e C05-045 (só homens drusos e circassianos convocados).

## 2. O que foi pesquisado e entrou

- **Semana**: domingo como dia de trabalho, pela proposta de Silvan Shalom de torná-lo folga (C05-078, duas fontes E, sem data no trecho); Lei de Horas de Trabalho e Descanso de 1951, 36 horas e o dia de descanso de judeus e não judeus (C05-080, decisão HCJ 5026/04 via projeto Versa e escritório jurídico).
- **Shabat**: transporte parado (C05-079: guia do Technion e duas reportagens de 2017), exceções em Haifa, Galileia e localidades não judaicas (C05-081, só o Technion), ônibus gratuitos de Tel Aviv e vizinhas desde novembro de 2019 (C05-082), mercearias de Tel Aviv no Shabat mantidas pela Suprema Corte em 2017 (C05-083; 164 ou 165 conforme o veículo, o texto diz "cerca de 160").
- **Calendário**: lunissolar e dia começando ao pôr do sol (JewishGen); Levítico 23 como fonte religiosa de Rosh Hashaná, Yom Kipur e Sucot, numa caixa "História ou tradição?" (C05-084); dias de descanso oficiais pelo artigo 18A (C05-085) e o direito de não judeus às próprias festas (C05-086); Yom Kipur com estradas vazias por costume (C05-087).
- **Dias nacionais**: sirene de dois minutos no Yom HaShoá (2021 e 2023), sirenes de um e de dois minutos no Yom HaZikarón (2026: 20 e 21 de abril), passagem direta ao Dia da Independência (C05-088 a C05-090).
- **Composição religiosa**: muçulmanos (fim de 2025), cristãos (Natal de 2025, CBS 413/2025) e drusos (fevereiro de 2026, CBS 121/2026). **O CBS não foi encontrado num quadro único do mesmo ano**: o texto junta os comunicados, diz as datas e explica, numa caixa, por que não se somam. O percentual dos drusos (cerca de 1,5%) é cálculo deste livro, dito no registro.
- **Serviço militar**: 32 meses para homens e 24 para mulheres (mínimos, site do exército, sem data), isenções de mulheres religiosas e casados, só homens drusos e circassianos convocados (INSS e exército). O dado de julho de 2026 sobre os 32 meses continua (C05-025).
- **Kibutz e moshav**: Degania e Nahalal na lista indicativa da UNESCO, edifícios originais de Degania de 1910 (C05-095); a maioria dos kibutzim passou a salários diferenciados entre 1995 e 2010 (Russell, Hanneman e Getz, C05-096); o CBS conta kibutzim e moshavim como tipos distintos de localidade (C05-097).

## 3. O que ficou fora e por quê

- **Número atual de kibutzim e de moradores**: a busca achou 250, 262, 268 e 270 kibutzim em fontes de datas diferentes, e a tabela 2.7 do CBS veio sem rótulo de coluna legível. Fica para a revisão humana abrir a tabela (C05-072, C05-097).
- **Definição do moshav e Nahalal 1921**: só Wikipedia. O texto diz apenas que Nahalal é um moshav, apoiado na lista da UNESCO (C05-073).
- **Chanuká e Purim como festas**: nenhuma fonte A a D descreveu as duas; o texto só diz que não estão entre os dias de descanso oficiais (dedução da lista do artigo 18A, registrada em C05-085). Pêssach, Shavuot e Sucot aparecem só como dias de descanso.
- **Línguas** (russo, amárico, francês, inglês, iídiche): os números da Pesquisa Social de 2011 vieram de resumo jornalístico com fonte pouco clara (C05-099, PARCIALMENTE).
- **Placas em três línguas**: a decisão de 2002 sobre o árabe nas placas de cidades mistas só apareceu pela Adalah, parte do processo (C05-100, PARCIALMENTE). O voto da juíza Dorner, citando o artigo 82 da Ordem do Conselho de 1922, também ficou fora (C05-051).
- **Mercados e vida urbana regional** (C05-074, C05-075): sem fonte; os mercados estão no capítulo 6.
- **Comércio na sexta** (C05-062): sem fonte direta; o texto não afirma horário de fechamento.
- **Fecundidade** (C05-007): verificada, saiu na última composição para a lista caber nas páginas.
- **Caixa "O olhar de um israelense"** sobre o dúgri: retirada do manuscrito, como pedem as regras desta rodada (a caixa é do dono). O texto da versão anterior, para o dono aproveitar se quiser, está no histórico do git (versão anterior de `manuscrito/05-vida-real.md`).

## 4. Pontos fracos que a revisão humana deve conferir

1. C05-078: o domingo útil se apoia em duas reportagens sobre a proposta de Shalom (JTA, Globe and Mail), sem data no trecho. Uma fonte oficial (Ministério da Economia) seria melhor.
2. C05-080 e C05-086: a lei foi lida por trechos de decisão traduzida e de escritório jurídico; conferir o texto oficial da Lei de 1951 e do artigo 18A.
3. C05-085: a lista dia a dia dos feriados vem de fonte E que resume a lei.
4. C05-089: embaixadas mais antigas dizem "dois minutos" para a sirene da noite; as fontes recentes dizem um.
5. C05-093: página do exército sem data; prazos mudam por lei.
6. C05-095: conferir na página da UNESCO a descrição de Nahalal como moshav.
7. C05-076 e C05-098: o trecho misturou a página da Academia da Língua Hebraica e o Makor Rishon; conferir na Academia.
8. Os itens da primeira rodada continuam valendo (comunicados do CBS, Lei Básica de 2018 no Knesset, Katriel 1986, IDI 2025, INSS, Kulturní Studia, decisões da Suprema Corte).

## 5. Debates e como o texto os apresenta

- **Status do árabe depois de 2018** (CONTESTADO, C05-015): crítica (Al-Monitor, AJC) e a cláusula de preservação da própria lei; falta uma fonte acadêmica de direito constitucional.
- **O "modelo druso"** (C05-022): conclusão de um estudo, dita como tal.
- **Shabat no espaço público**: apresentado por fatos datados (a posição do Estado na Corte em 2017, os ônibus municipais de 2019, as mercearias de Tel Aviv), sem juízo; o texto insiste que o ritmo varia por cidade.
- **Convocação dos ultraortodoxos**: só decisões e datas.
- **Dúgri**: ideal cultural de época, com a ressalva contra a generalização.

## 6. Pendências editoriais

**Hebraico para aprovação do dono** (todo hebraico do capítulo):

- novo nesta rodada, na caixa "Em hebraico" da semana: <he>יוֹם רִאשׁוֹן</he> (Yom Rishón), <he>יוֹם שִׁשִּׁי</he> (Yom Shishí), <he>שַׁבָּת</he> (shabát, forma do `data/translit.json`);
- da rodada anterior, mantidos: <he>חִלּוֹנִי</he> (chiloní), <he>מָסָרְתִּי</he> (masortí), <he>דָּתִי</he> (datí), <he>חֲרֵדִי</he> (charedí), <he>דּוּגְרִי</he> (dúgri; conferir a tônica);
- no infográfico (`semana.json`): os sete nomes dos dias, de יוֹם רִאשׁוֹן a שַׁבָּת. O rótulo do sábado no infográfico usa "Shabát" com maiúscula; no texto corrido aparece "Shabat" sem acento, como nos outros capítulos.
- Transliterações sem hebraico no texto: Rosh Hashaná, Yom Kipur, Sucot, Pêssach, Shavuot, Chanuká, Purim, Yom HaShoá, Yom HaZikarón, yeshivá. Conferir a convenção com o capítulo 7.

**Fotos** (`ativos/dados/fotos-candidatas-cap05.json`, 3 candidatas, licenças vistas só no resumo da busca):

| id | licença | venda | no texto |
| --- | --- | --- | --- |
| foto-nahalal-aereo-stein | CC BY-SA 4.0 | confirmar | sim |
| foto-yom-hazikaron-2023 | CC BY-SA 3.0 (modelo do porta-voz do exército; ligação com o arquivo não literal) | confirmar | sim; conferir o que a foto mostra antes da legenda final |
| foto-mahane-yehuda-sexta-goldberg | CC BY 2.0 | sim | não (reserva; serve ao capítulo 6) |

**Links oficiais** (`ativos/dados/links-cap05.json`): UNESCO (Degania e Nahalal) e Forças de Defesa de Israel no texto; os dois comunicados do CBS (cristãos e drusos) ficaram de reserva.

**Figura sugerida (não criada)**: um gráfico de barras das comunidades religiosas com datas explícitas por barra (muçulmanos fim de 2025; cristãos dezembro de 2025; drusos fevereiro de 2026), sem soma total, com C05-005, C05-091 e C05-092.

**Para a próxima rodada**: número atual de kibutzim e moshavim (CBS), moshav (fonte acadêmica), Chanuká e Purim, línguas (CBS), comércio na sexta, decisão de 2002 sobre as placas.

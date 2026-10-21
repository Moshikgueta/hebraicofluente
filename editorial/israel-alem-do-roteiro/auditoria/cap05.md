# Auditoria interna: capítulo 5, A vida real em Israel

Data: 21/10/2026. Esta é uma auditoria interna feita por IA. Não é revisão acadêmica, e nada aqui foi "revisado" ou "aprovado" por especialista.

## Aviso principal: capítulo incompleto

A pesquisa parou depois de cerca de 22 buscas. O limite de buscas da sessão é compartilhado entre os agentes que trabalham em paralelo, e acabou antes de os temas da semana, do calendário e de outros pontos do brief serem pesquisados. Pela regra do protocolo (seção 1), o que não foi verificado não entrou no texto. Por isso:

- o manuscrito tem cerca de **1.720 palavras**, contra cerca de 3.000 no orçamento;
- **ficaram fora do texto** a semana (domingo útil, sexta, Shabat, o que fecha e o que abre por cidade, transporte), o calendário e os feriados (incluindo Yom HaShoá, Yom HaZikarón, Yom HaAtsmaút e a sirene, e os feriados muçulmanos, cristãos e drusos), as outras línguas (russo, amárico, inglês, francês, iídiche, ladino), a vida urbana e regional, a semana de trabalho, os mercados, e kibutz e moshav;
- o infográfico `infografico-semana` está **bloqueado**: `ativos/dados/semana.json` traz a estrutura dos sete dias, mas nenhuma nota verificada (só `notas_pendentes`).

Cada um desses temas está registrado como `NÃO VERIFICADO` em `afirmacoes/cap05.json` (C05-060 a C05-077), com a indicação de onde procurar. Para completar o capítulo, é preciso uma nova rodada de buscas.

## 1. Afirmações por status

| Status | Quantas | No texto |
| --- | --- | --- |
| VERIFICADO | 25 | todas |
| CONTESTADO | 1 (C05-015, o alcance da mudança no status do árabe) | sim, com o debate |
| PARCIALMENTE VERIFICADO | 7 | não |
| NÃO VERIFICADO | 24 | não |
| Total | 57 | 26 |

Fontes: 32 (nível A: 4, sendo 3 `referencia-confirmada`; B: 10; D: 2; E: 16). Todas as afirmações VERIFICADAS se apoiam em fonte A a D, menos C05-012 (data e placar da votação de 2018) e C05-025 (32 meses em julho de 2026), que são fatos jornalísticos datados sustentados por duas fontes E independentes.

## 2. Problemas encontrados

- **Números que não fecham.** A tabela de alunos por rede do Taub Center (2018), tal como a busca a devolveu, não soma o total indicado. Ficou fora do texto (C05-018, limitações).
- **Percentuais com bases diferentes.** A imprensa dá 78,5%/21,5% ou 78,3%/21,7% (só judeus e outros mais árabes como base) e 76%/21,1%/2,9% (o total, com estrangeiros). O texto usa só o comunicado 117/2026 do CBS, sobre o total, e explica a diferença (item 2 da lista).
- **Cristãos e drusos sem número.** Os dados de cristãos (cerca de 184 mil, de 1,8% a 1,9%) vieram só de fontes E, que divergem entre si. O número dos drusos veio só da Wikipedia. Os dois ficaram fora, e a seção "Quem mora em Israel" não dá a proporção desses dois grupos. **É a lacuna mais visível em relação ao brief** (diversidade religiosa do CBS).
- **Distribuição religiosa geral.** A busca não encontrou o quadro do CBS com judeus, muçulmanos, cristãos e drusos no mesmo ano; o de 2022 só apareceu na Wikipedia (C05-043).
- **Serviço militar.** A duração para mulheres não foi verificada (C05-044). A dos homens está datada (julho de 2026) e vem de jornalismo. A isenção das mulheres drusas e circassianas e a convocação dos circassianos também ficaram fora (C05-045, C05-053).
- **Interpretações sem autor.** A busca citou uma leitura de que a cláusula 4C torna a mudança "em grande parte simbólica", sem identificar quem escreveu. O texto não atribui essa posição a ninguém e apresenta só o que diz a própria lei (C05-015).
- **Jerusalém.** O dado do CBS conta o município, que inclui Jerusalém Oriental. O item 1 remete ao capítulo 3 para o status internacional, sem repetir a fonte da ONU. **Conferir** se o capítulo 3 tem esse registro.
- **Fundo político.** A questão da convocação dos ultraortodoxos muda rápido. O texto para em janeiro de 2026 (pedido de desacato); a lei de julho de 2026 e a suspensão pela Corte ficaram PARCIALMENTE (C05-049).

## 3. Correções feitas

Na releitura adversária, saíram do manuscrito frases que nenhum registro sustentava:

- "'tradicional' cobre de quem acende velas na sexta-feira a quem frequenta a sinagoga nas grandes datas";
- "cada rede atende, em larga medida, a uma comunidade";
- "os ultraortodoxos não formam um bloco único, e a proporção muda muito de cidade para cidade";
- "o debate sobre o currículo e o financiamento dessas escolas ocupa tanto espaço na política israelense";
- "o grau de religiosidade é uma das diferenças que a média esconde";
- "a imagem de um país feito de imigração vale para a história";
- "a comunidade drusa, que tem posições diversas" (no lugar: a referência ao debate acadêmico, registrado em C05-022);
- "os drusos são a exceção à regra" (os circassianos não foram verificados).

Também saíram das referências ABNT os locais de publicação que não apareceram na busca (Jerusalém, Tel Aviv, Haifa, Washington, Québec); no lugar, ficou [S. l.].

## 4. Fontes que a revisão humana deve abrir no texto integral

1. CBS, comunicado 117/2026 (PDF): conferir números e definições (C05-001 a C05-004).
2. CBS, The Muslim Population in Israel 2026: conferir os números, a fecundidade e a queda desde 2001 (C05-005 a C05-008).
3. CBS, comunicado de Natal de 2025 (citado como 413/2025) e o comunicado sobre a população drusa: necessários para pôr cristãos e drusos no texto (C05-040, C05-041).
4. Lei Básica de 2018 no site do Knesset (versão oficial em inglês ou hebraico), cláusulas 4A a 4C (C05-013, C05-014, C05-050).
5. Katriel, *Talking Straight* (1986): conferir a formulação da relação entre quem é de dentro e quem é de fora e a etimologia de "dugri" (C05-016, C05-017, C05-077).
6. Pew 2016: conferir as datas do trabalho de campo e a definição de cada rótulo (C05-009).
7. IDI, relatório estatístico de 2025: conferir 1,45 milhão, 420 mil alunos e 21%, e a definição de "estudantes" (C05-010, C05-011).
8. INSS (PDF sem título confirmado): título, ano e números do serviço civil-nacional (C05-020).
9. Kulturní Studia (2024): autoria, acordo de 1956 com os 16 líderes drusos e a conclusão citada (C05-021, C05-022).
10. Decisões da Suprema Corte de 2024 (HCJ, painel de nove juízes) e de 19/11/2025 (HCJ 5819/24).

## 5. Debates acadêmicos e como o texto os apresenta

- **Status do árabe depois de 2018** (CONTESTADO, C05-015). O texto cita a leitura crítica (Al-Monitor, AJC) e a cláusula de preservação da própria lei, e diz que a lei não define o conteúdo do "status especial". Falta uma fonte acadêmica de direito constitucional para equilibrar o registro.
- **O "modelo druso"** (C05-022). Apresentado como conclusão de um estudo, com a ressalva de que o tema é discutido por outros pesquisadores. Não se toma posição.
- **Dúgri.** Apresentado como análise de um ideal cultural de época (o sabra, anos 1980), com a ressalva explícita contra a generalização.
- **Convocação dos ultraortodoxos.** Apresentada só pelas decisões judiciais e pelas datas, sem juízo.

## 6. Pendências editoriais

**Hebraico para aprovação do autor** (regra do repositório):

- no manuscrito: <he>חִלּוֹנִי</he> (chiloní), <he>מָסָרְתִּי</he> (masortí), <he>דָּתִי</he> (datí), <he>חֲרֵדִי</he> (charedí), <he>דּוּגְרִי</he> (dúgri; conferir a tônica na primeira sílaba);
- em `ativos/dados/semana.json`: os nomes dos dias, יוֹם רִאשׁוֹן (Yom Rishón), יוֹם שֵׁנִי (Yom Shení), יוֹם שְׁלִישִׁי (Yom Shlishí), יוֹם רְבִיעִי (Yom Revií), יוֹם חֲמִישִׁי (Yom Chamishí), יוֹם שִׁשִּׁי (Yom Shishí), שַׁבָּת (Shabát).
- No texto corrido aparecem transliterações sem hebraico: yeshivá; chiloní, masortí, datí e charedí (repetidos da caixa).

**Caixa do autor:** uma `olhar-israelense pendente` (no item 10, sobre a franqueza), escrita como explicação geral, sem lembrança pessoal. Só sai com aprovação.

**Figura:** `infografico-semana` bloqueada até as notas da semana serem verificadas.

**Para a próxima rodada de pesquisa, em ordem de prioridade:**

1. A semana e o Shabat (C05-060 a C05-064): gov.il e IDI (status quo).
2. Feriados e dias nacionais com a sirene (C05-066 a C05-069): gov.il e Knesset.
3. Composição religiosa completa do CBS, com cristãos e drusos (C05-040, C05-041, C05-043).
4. Kibutz e moshav: Degania 1909 ou 1910, números atuais do CBS ou do Kibbutz Movement, privatização (C05-071 a C05-073).
5. Outras línguas: Pesquisa Social do CBS (C05-070).
6. Duração do serviço das mulheres (C05-044).

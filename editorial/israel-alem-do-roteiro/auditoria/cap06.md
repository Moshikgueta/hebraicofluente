# Auditoria interna: capítulo 6, Sabores de Israel

Data: 21/10/2026 (segunda rodada). Esta é uma auditoria interna feita por IA na releitura do capítulo, não uma revisão acadêmica. Nada aqui foi revisado, validado ou aprovado por especialista.

## Resumo da rodada

A primeira rodada parou em 17 buscas. Nesta, os capítulos 5 e 6 somaram 43 buscas (teto de 55); cerca de 21 foram para o capítulo 6, contando 2 de fotos. O capítulo ganhou: a separação entre carne e leite com fonte religiosa, o certificado e o Shabat, a decisão sobre supervisão alternativa, a gorjeta, os pães de sábado (jachnun, malawach, chalá), o mercado Machane Yehuda por um estudo acadêmico, os cafés de Tel Aviv e vozes árabes e palestinas na disputa do homus, além de fotos, links e perguntas.

- Manuscrito: cerca de 2.370 palavras (contagem do validador), alvo 2.200.
- PDF `saida/capitulo-06.pdf`: 17 páginas, 3 QR lidos de volta.
- `node tools/inspecionar.mjs --formato=capitulo-06`: transbordo em nenhuma página; "quase vazia" só a página 1 (abertura do capítulo, sem imagem). A página 13 é a foto do cardápio com legenda (cerca de 55%) e a 17 é o fim das fontes.
- `node tools/validar.mjs`: 0 erros no projeto.
- Composição: o fecho genérico ("Uma refeição em Israel junta...") e a caixa de aviso sobre gorjeta saíram para não deixar páginas quase vazias; a data de consulta da gorjeta ficou na própria frase.

## 1. Afirmações por status

| Status | Quantidade | No texto? |
| --- | --- | --- |
| VERIFICADO | 19 | todas |
| CONTESTADO | 5 (C06-005, 008, 009, 045, 051) | sim, apresentando o debate |
| PARCIALMENTE VERIFICADO | 5 (C06-014, 018, 020, 021, 049) | não |
| NÃO VERIFICADO | 15 | não |
| Total | 44 | 24 ids no texto |

Fontes: 42 (A 13, B 1, D 1, E 27). Novas: F06-024 a F06-042. Registros novos: C06-040 a C06-051. Os antigos C06-030 a C06-039 continuam como estavam (pistas da primeira rodada); os que esta rodada cobriu foram registrados com ids novos e redação nova: C06-030 → C06-040; C06-031 → C06-041; C06-032 → C06-043; C06-035 → C06-044 e C06-045; C06-037 → C06-046 e C06-047; C06-038 → C06-048.

## 2. O que foi pesquisado e entrou

- **Kashrut**: o versículo repetido três vezes, as três proibições lidas pelo Talmud e o que é rabínico (intervalo, louça separada), pela Yeshivat Har Etzion (C06-040, fonte B religiosa); o Rabinato não certifica restaurante aberto no Shabat, exceto hotéis, e o caso único do McDonald's de Ben Gurion em 2019 (C06-041, duas fontes E); supervisão alternativa pode ser descrita, mas sem certificado de "kosher" (C06-042).
- **Gorjeta**: 10% a 15% segundo Jerusalem Post e Israel21c, com a subida de 10% para cerca de 12% (15% em Tel Aviv) segundo o Israel21c (C06-043). Costume, com `revisar_ate`.
- **Pães**: jachnun e malawach (C06-044, duas fontes E de divulgação, apresentadas como "publicações de divulgação judaica descrevem"); a tese de um artigo da revista Meldar sobre a origem sefardita da chalá trançada (C06-045, CONTESTADO, dita como tese de um artigo).
- **Mercados**: Mashkov e Shoval (2020) sobre a "boutiquização" do Machane Yehuda (C06-046); vida noturna e a reação de líderes ultraortodoxos (C06-047, Al-Monitor 2017 e Afar).
- **Cafés**: Pinsker, *A Rich Brew* (2018), e o dado de cafés por habitante via resenha (C06-048).
- **Homus**: Gvion (2012) sobre a comida dos cidadãos palestinos de Israel (C06-050); posições árabes e palestinas atribuídas (Fundação Heinrich Böll em Beirute, 2017; artigo de opinião no The New Arab; Steven Salaita) (C06-051, CONTESTADO). Nenhuma origem exclusiva é afirmada; a caixa "De quem é o homus?" põe as posições lado a lado.

## 3. O que ficou fora e por quê

- **Pita e lafa**: nenhuma fonte A a D. A pita aparece só como o pão que embrulha o falafel e o sabich (e no vocabulário); a lafa saiu (só Wikipedia e uma reportagem).
- **Shuk HaCarmel**: as versões da fundação (anos 1920, bairro iemenita, Dizengoff) vieram de fontes E e de turismo, desencontradas. O texto diz que a história aparece em versões diferentes e fica para outra edição (C06-037).
- **Shakshuka** (C06-034): só Wikipedia e blogs.
- **Festas** (matsá, sufganiyót, C06-036): não pesquisadas.
- **Cafés na orla e nas ruas Dizengoff, Allenby e Ben Yehuda**: uma só reportagem (C06-049, PARCIALMENTE).
- **Água à mesa e horários no Shabat** (C06-033): sem fonte.
- **Influências da cozinha** (C06-039): nenhuma síntese acadêmica lida; o texto evita a frase-resumo.

## 4. Pontos fracos para a revisão humana

1. C06-044 (jachnun) e C06-041 (Rabinato e Shabat) se apoiam em jornalismo e divulgação (E). Estão escritos como "segundo", mas uma fonte acadêmica sobre comida iemenita em Israel e o regulamento do Rabinato seriam melhores.
2. C06-040: o trecho citou "Shemot 34:24" (provavelmente 34:26); o texto não dá o número do versículo do capítulo 34.
3. C06-045: autor e ano do artigo da Meldar não apareceram; conferir.
4. C06-048: o dado de cafés por habitante vem de resenha (Hadassah Magazine), não do livro.
5. C06-051: a URL do texto de Salaita não foi identificada separadamente; a opinião foi vista no resumo da busca.
6. Os pontos da primeira rodada continuam: Hirsch 2011 e 2026, Avieli, Ariel 2012, Stampfer 2015, Raviv 2015, a lei de 1983 e as decisões de 2016 e 2017.

## 5. Debates e como o texto os apresenta

- **De quem é o homus** (C06-005, C06-051): reivindicação libanesa, símbolo nacional israelense, Hirsch (apropriação), Avieli (posse e poder), Böll e The New Arab (negação da herança palestina; "roubo"), Salaita (pratos de judeus do mundo árabe, cuja história o rótulo "israelense" apaga). Agora há vozes árabes atribuídas, que faltavam na primeira rodada; nenhuma fonte libanesa oficial foi lida.
- **Origem do falafel** (C06-008, C06-009): hipóteses atribuídas; a história copta numa caixa "História ou tradição?".
- **Chalá** (C06-045): tese de um artigo, não consenso.
- **Kashrut alternativa** (C06-012, C06-013, C06-042): decisões e datas, sem juízo.

## 6. Pendências editoriais

**Hebraico para aprovar (todo o capítulo):** <he>חוּמוּס</he>, <he>סַבִּיח</he>, <he>כַּשְׁרוּת</he>, <he>כָּשֵׁר</he>, <he>תְּעוּדַת כַּשְׁרוּת</he>, <he>תַּפְרִיט</he>, <he>מֶלְצַר</he>, <he>מֶלְצָרִית</he>, <he>מַיִם</he>, <he>חֶשְׁבּוֹן</he>, <he>בְּבַקָשָׁה</he>, <he>תוֹדָה</he>, <he>בְּשָׂרִי</he>, <he>חָלָבִי</he>, <he>מִסְעָדָה</he>, <he>פִּיתָה</he>, <he>שׁוּק</he>, <he>בְּתֵאָבוֹן</he>. Nenhum hebraico novo nesta rodada; saíram da caixa de vocabulário (por espaço) <he>מַיִם</he> (que continua no texto), <he>לֶחֶם</he> e <he>קָפֶה</he>. Jachnun, malawach, zhug, chalá e Shuk HaCarmel aparecem só transliterados: conferir a grafia com o capítulo 7.

**Transliterações para conferir:** missadá, bsarí, beteavón, chúmus, sabích, teudát kashrút, meltsarít; "Dito ao servir ou ao começar" (bom apetite) é uso, o dono confirma.

**Fotos** (`ativos/dados/fotos-candidatas-cap06.json`, 8 candidatas; licenças vistas no resumo da busca, conferir na página do arquivo):

| id | licença | venda | no texto |
| --- | --- | --- | --- |
| foto-homus-libanes | CC BY 3.0 | sim | sim |
| foto-homus-cc0 | CC0 | sim | não |
| foto-jachnun-maorx | CC BY-SA 4.0 | confirmar | sim |
| foto-jachnun-herzig | CC BY-SA 2.5 | confirmar | não |
| foto-mahane-yehuda-dyan | CC BY 2.0 | sim | sim |
| foto-mahane-yehuda-king | CC BY 2.0 | sim | não |
| foto-cardapio-mahane-yehuda | CC BY-SA 4.0, autor não apareceu | confirmar | sim |
| foto-chala-williamsburg | CC BY-SA 3.0 e GFDL; foto de Nova York | confirmar | não |

Nenhuma foto de malawach, lafa ou sabich apareceu na busca.

**Links oficiais** (`ativos/dados/links-cap06.json`, todos no texto): lei de 1983 em gov.il, página do Ministério do Turismo sobre o mercado de Jerusalém (conteúdo não lido, só a URL vista), passeios do Museu da Cidade de Tel Aviv-Yafo sobre a história dos cafés.

**Nenhuma caixa "O olhar de um israelense"** (é do dono). Nenhuma afirmação sobre o autor.

## Fase 6 (21/10/2026)

### Visuais
- Abertura ilustrada própria: `abertura-sabores` (mesa vista de cima, pratos, sem marca nem pessoa; rótulo "Ilustração original, não é registro fotográfico.").
- `anatomia-sabich-falafel` (figura): sabich = pita, berinjela, ovo, "entre outras coisas" (C06-010); falafel na pita = pita, bolinhos fritos, salada, trio do século XX segundo Stampfer (C06-009); a fava só como hipótese egípcia (C06-008).
- `anatomia-homus-jachnun` (figura): homus = grão-de-bico cozido e amassado, tahine, alho, suco de limão (C06-052, nova); jachnun com tomate ralado, zhug e ovo (C06-044).
- `guia-cardapio` (figura): 13 palavras que o capítulo já tem, com o mesmo nikud e a mesma transliteração.
- `conta-israel` / `conta-brasil` (compare): a comparação com o Brasil.
- Fotos licenciadas candidatas já existentes: 4 (homus, jachnun, Machane Yehuda, cardápio).
- Total no capítulo: 4 visuais desenhados + 1 compare + 4 fotos, além da abertura. Tudo registrado em `ativos/registro-de-ativos.json`; gerador `tools/ilustracoes/cap06.mjs`, com os ids das afirmações no código.

### Comparação com o Brasil (gorjeta)
- Israel: 10% a 15%, costume (C06-043, já existente).
- Brasil: Lei 13.419/2017 (C06-053, fonte A, Planalto): o valor cobrado como serviço também é gorjeta, não é receita do empregador e é dividido entre os empregados. O texto NÃO atribui à lei percentual nem obrigatoriedade. Taxa em geral de 10% e opcional, com dever de informar (C06-054): Procon-ES (via Folha Vitória) e Idec, duas fontes E independentes, `revisar_ate` 2027-04-21.
- Conta derivada C06-055: nos dois países a gorjeta parte de 10% e não é obrigação legal do cliente; em Israel o costume vai até 15%.

### Interações
Ficha (Mercado Machane Yehuda, região "Jerusalém, fora das muralhas"), compare, "História ou tradição?" com palpite (`resposta: tradicao`, os coptas), pegadinha do guia (o sabich "milenar"), quizzes e vf já existentes.

### Cortes pela decisão política
Nenhuma frase de posição de governo ou status de território no capítulo. A disputa do homus e do falafel é debate cultural e ficou, com as posições atribuídas. Não há menção à Cisjordânia.

### Buscas
10 no total para os capítulos 6 e 7 (6 para o capítulo 6: lei da gorjeta x3, Procon x1, receita do homus x2).

### Pendências
- Shuk HaCarmel: sem fundação verificada (C06-037), sem ficha.
- Fonte da receita do homus: duas fontes E (Britannica, James Beard Foundation), no mesmo padrão do jachnun (C06-044); a revisão humana pode preferir uma obra acadêmica.
- A página exata do Idec com a frase sobre a taxa facultativa deve ser conferida (F06-047).
- Hebraico para aprovação do dono, novo nesta fase só em lugar novo: a ficha usa <he>שׁוּק מַחֲנֵה יְהוּדָה</he> (Shuk Machané Yehudá), que vem do capítulo 7. Os desenhos repetem palavras do capítulo: סַבִּיח, חוּמוּס, תַּפְרִיט, מִסְעָדָה, מֶלְצַר, בְּבַקָשָׁה, פִּיתָה, מַיִם, בְּתֵאָבוֹן, כָּשֵׁר, בְּשָׂרִי, חָלָבִי, חֶשְׁבּוֹן, תוֹדָה.
- Fichas sem "tempo de visita" e "melhor horário" (sem fonte).
- Testes que rodaram: validador 0 erros; PDF capitulo-06 com 24 páginas, 3/3 QR lidos; inspecionar sem transbordo nem página quase vazia; folha de contato olhada. A web não foi gerada (o coordenador monta).

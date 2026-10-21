# Auditoria interna do capítulo 1: Israel no mapa

Auditoria interna, feita pelo próprio pesquisador relendo o capítulo como
adversário em 21/10/2026, depois de duas rodadas de pesquisa. Não é revisão
acadêmica, e nada aqui foi revisado, validado ou aprovado por especialista.

## 0. As duas rodadas (ler primeiro)

O ambiente não abre páginas (WebFetch falha), só devolve trechos de busca.

- **Primeira rodada:** 24 buscas (área, dimensões, Mar Morto, chuva).
  Manuscrito de cerca de 1.600 palavras.
- **Segunda rodada (piloto do redesenho):** 41 buscas, de um teto de 90.
  Resolveu o item bloqueante (Golã e Jerusalém Oriental com fonte da ONU),
  as regiões que faltavam, o Machtésh Ramón, a migração de aves e o vale do
  Hula. Não resolveu: nível oficial atual do Mar Morto (5 buscas), normais
  climatológicas por cidade (8 buscas), altitude de Jerusalém em fonte A a D
  (6 buscas). Manuscrito: 2.455 palavras pelo validador.

## 1. Afirmações por status

| Status | Quantidade | No texto |
| --- | --- | --- |
| VERIFICADO | 42 | todas (C01-001, 002, 003, 005, 006, 009, 010, 011, 012, 013, 015, 016, 017, 018, 019, 021, 022, 026, 031, 033, 038 a 059) |
| PARCIALMENTE VERIFICADO | 9 | nenhuma (C01-014, 020, 023, 024, 025, 027, 032, 060, 061) |
| NÃO VERIFICADO | 9 | nenhuma (C01-004, 007, 008, 028, 030, 034, 035, 036, 037) |
| DESATUALIZADO | 1 | nenhuma (C01-029) |

Total: 61 registros e 46 fontes. Conferido por script: toda marca do texto
aponta para VERIFICADO, e todo VERIFICADO está no texto.

Registros antigos atualizados sem renumerar: C01-028 (a frase da ONU, agora
desdobrada em C01-039 a C01-044, fica como histórico), C01-033 (Ramón, agora
VERIFICADO com NASA e UNESCO), C01-032 (aves: a parte de Eilat e do vale do
Jordão segue PARCIAL; o número foi para C01-057), C01-035 (fenda: substituído
por C01-051 a C01-053), C01-030, C01-034, C01-036 e C01-037 (evidência da
segunda rodada).

## 2. Problemas encontrados

1. **Golã e Jerusalém Oriental (era bloqueante, resolvido).** Texto da ONU
   lido por trecho: Resolução 478 (1980) e 497 (1981) na coleção UNISPAL;
   briefing de DiCarlo (DPPA) em 2019; proclamação americana de 25/03/2019.
   "A maior parte da comunidade internacional não reconhece" se apoia na
   resolução 478 (pede a todos os Estados que aceitem a decisão), na 497
   (unânime), na documentação da Universidade de Bonn e em duas reportagens
   (Al Jazeera, AFP). Nenhuma fonte dá contagem de países, e o texto não dá.
   Os resumos das votações anuais da Assembleia Geral sobre o Golã trazem
   números que não batem entre si (97, 123, 150): ficaram fora.
2. **A frase de Bonn** ("not recognized by the international community")
   veio no resumo junto do título da página; atribuição a conferir.
3. **Nível do Mar Morto ainda sem leitura oficial.** Confirmado que a série
   mensal da Autoridade da Água existe em data.gov.il desde 1976, mas nenhum
   número saiu de fonte A a D. Os valores de 2025 e 2026 (439,78 m;
   cerca de 441,5 m) só em enciclopédias colaborativas. O texto mantém "em
   2022, mais de 430 m" (C01-012, que continua apoiado em duas fontes E para
   o valor absoluto; ver auditoria cruzada).
4. **Clima por cidade: bloqueado de novo.** Nem o IMS nem o CBS devolveram a
   tabela por estação. `ativos/dados/clima.json` segue com `cidades` vazio; o
   infográfico mostra só o padrão verificado.
5. **Perfil de altitude: bloqueado.** Jerusalém só tem números de fonte E e
   divergentes (715 a 800 m); o Monte das Oliveiras, 808 m só na Britannica.
   `ativos/dados/perfil.json` foi gravado com `status: FIGURA BLOQUEADA`,
   altitudes `null` onde não há verificação e distâncias `null`. A figura
   `perfil-altitude` não entrou no manuscrito (não há SVG nem registro de
   ativo, e não deveria haver).
6. **Página antiga do ministério.** A cópia da página de geografia fala em
   "7 million people": a frase sobre a planície costeira ter mais da metade
   da população foi deixada de fora, porque o texto é de antes de 2006.
7. **"Neguev, cerca de metade da área"**: o ministério não diz que definição
   de área usa. O texto atribui o número a ele.
8. **Judeia e Samaria em dois sentidos.** O ministério usa os nomes para as
   montanhas (C01-049) e "Judea and Samaria (the West Bank)" para o território
   (C01-031). O texto separa os dois usos na mesma passagem, como pede a
   seção 7 do PROTOCOLO.
9. **Fenda ou falha.** "Fenda sírio-africana" é o nome do ministério;
   "Transformante do Mar Morto" o da literatura geológica (DESERT Group,
   2004). A caixa "Fenda ou falha?" apresenta os dois e o motivo.
10. **Cortes da releitura:** "É por ela que passa quem desembarca e segue para
    o norte" (sem fonte); "Na primavera e no outono" para as aves (estações
    não verificadas); "a ONU e a maior parte dos países as tratam como
    territórios ocupados" (trocado pelo que as resoluções dizem); remissão
    do status ao capítulo 2 (o próprio capítulo agora trata, o que resolve
    para o cap. 1 o item 3.9 da auditoria cruzada).
11. **Fontes com referência incompleta:** os dois artigos de Wetlands Ecology
    and Management (1998) sem autores; o resumo de palestra da TAU sem o nome
    do palestrante; data do briefing de DiCarlo deduzida do contexto.

## 3. Correções feitas

- Nova seção "Golã e Jerusalém Oriental: o que diz a ONU", em tom de
  registro: o que Israel faz, o que o Conselho de Segurança decidiu, quem
  reconhece.
- Nova seção "Quatro faixas de norte a sul" e caixa "Fenda ou falha?".
- Nova seção "Paisagens que pedem uma parada" (Ramón, aves, Hula).
- "O que observar" passou de seis para oito itens (a pedra que muda; o céu).
- Mar Morto: a frase sobre as dolinas e a Estrada 90 entrou com fonte D
  (C01-059); a versão com "dois de quatro projetos" segue fora (C01-020).
- `ativos/dados/regioes.json`: de 7 para 11 regiões, todas com afirmação
  VERIFICADO. `ativos/dados/links-cap01.json`: 10 links institucionais, todos
  com URL vista nos resultados.

## 4. Fontes adicionais necessárias (abrir no texto integral)

1. **Autoridade da Água, série mensal do nível do Mar Morto** (data.gov.il):
   leitura oficial datada de 2026 para substituir C01-012.
2. **IMS, normais climatológicas por estação** (ou CBS, Statistical Abstract,
   capítulo 1): chuva anual e temperaturas de janeiro e agosto.
3. **Altitude de Jerusalém** (CBS, IMS estação Jerusalém Centro ou Survey of
   Israel) e do Monte das Oliveiras, para o perfil de altitude.
4. **Resoluções 478 e 497**: texto integral e registro de votação oficial.
5. **Universidade de Bonn (GPIL)**: confirmar a frase sobre o não
   reconhecimento.
6. **Wetlands Ecology and Management (1998)**: autores e páginas.
7. **Rainey (1981), Tel Aviv 8**: o que diz sobre a Via Maris (C01-034).
8. **CBS, população em 2026 e das cidades** (C01-036), com a nota sobre o que
   a contagem inclui.
9. Itens da primeira rodada que continuam: Statistical Abstract (área),
   relatório do Controlador (texto integral), pôster do GSI, página do mapa
   topográfico do ministério (C01-004).

## 5. Debates relevantes e como o texto os apresenta

- **Status do Golã e de Jerusalém Oriental.** Não é debate acadêmico, é
  divergência entre a posição israelense (e, desde 2019, a americana sobre o
  Golã) e a das resoluções da ONU, seguida pela maior parte dos países. O
  texto diz as duas, atribui cada uma e não cria equivalência: a posição
  majoritária é dita majoritária.
- **Que território se mede.** Os três números de área seguem lado a lado, com
  a definição de cada um.
- **Nomenclatura da fenda.** Apresentada como diferença de nome e de
  explicação, não como controvérsia.
- **Via Maris.** Continua fora: só Wikipedia sustenta a discussão sobre o
  nome.

## 6. Pendências editoriais

- **Hebraico:** nenhum hebraico novo nesta rodada. Continuam para aprovação
  do autor: <he>יָם</he>, <he>הַיָּם הַתִּיכוֹן</he> (conferir a glosa "o mar do meio" e
  a tônica de hatichón), <he>יַם הַמֶּלַח</he>, <he>כִּנֶּרֶת</he>, <he>גֶּשֶׁם</he> e
  <he>מֶלַח</he>. "Machtésh Ramón" segue a grafia do capítulo 7.
- **Caixa "O olhar de um israelense"** (o mar do sal): `pendente`.
- **Figuras:** `mapa-regional` (a legenda agora remete à seção da ONU);
  `mapa-regioes` (os 8 rótulos do gerador batem com as regiões do texto;
  regioes.json tem 11 entradas, com Hula, Kinéret e Jezreel como detalhe);
  `infografico-clima` (só o padrão); `perfil-altitude` bloqueado.
- **Capítulo 7:** o registro C07-018 (Machtésh Ramón como cratera de erosão)
  pode ser resolvido com C01-055 e C01-056.
- **Revisar até:** C01-019 e C01-059 em 2027-04-21; área e nível em
  2027-10-21.

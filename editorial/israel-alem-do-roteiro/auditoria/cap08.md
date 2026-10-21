# Auditoria interna: capítulo 8, "Israel na prática"

Auditoria interna feita por IA em 21 de outubro de 2026 (segunda rodada). Não é
revisão acadêmica nem conferência de texto integral.

**Estado:** capítulo reescrito no padrão dos capítulos 1 e 2. As seções "No
aeroporto", "Dinheiro, transporte e telefone", "Shabat" e "Calor" agora trazem
fatos confirmados em fonte oficial, em vez de só "consulte X". Validador: 0
erros. PDF `saida/capitulo-08.pdf`: 13 páginas; `inspecionar.mjs
--formato=capitulo-08`: nenhum transbordo, nenhuma página quase vazia; QR lidos
de volta 4/4.

## 1. Afirmações por status

| Status | Quantidade | IDs |
| --- | --- | --- |
| VERIFICADO | 38 | C08-001, 002, 005 a 018, 021, 022, 025, 028, 029, 031 a 035, 037, 038, 041, 044 a 052 |
| CONTESTADO | 1 | C08-019 (validade do passaporte) |
| PARCIALMENTE VERIFICADO | 2 | C08-003, C08-020 (fora do texto) |
| DESATUALIZADO | 2 | C08-004, C08-042 (fora do texto) |
| NÃO VERIFICADO | 9 | C08-023, 024, 026, 027, 030, 036, 039, 040, 043 (fora do texto) |
| Total | 52 | |

Todos os registros são da categoria `pratica` e têm `revisar_ate: 2027-04-21`.
O manuscrito só cita registros VERIFICADO ou CONTESTADO.

Fontes: 45 (15 da primeira rodada, 30 novas). Das novas: D 23 (Decreto nº
3.549/2000, PIBA, avisos de embaixadas e consulados de Israel, Autoridade de
Aeroportos, gov.il, prefeitura de Tel Aviv, Banco de Israel, Israel Railways,
Autoridade Nacional de Transporte Público, Controlador do Estado, World
Factbook da CIA, MNE da Sérvia), B 6 (Universidade de Tel Aviv, Fundação do
Patrimônio do Muro Ocidental, Autoridade de Natureza e Parques), E 1
(israel.travel, só como uma das posições do debate do passaporte).

Buscas usadas neste capítulo: 21 (de 41 da rodada, somando o capítulo 7).

## 2. O que foi pesquisado

| Item | Registro | Resultado |
| --- | --- | --- |
| Isenção de visto para brasileiros | C08-017 | VERIFICADO: acordo de 1999, Decreto nº 3.549/2000 |
| Prazo de permanência | C08-018 | VERIFICADO: até 90 dias por visita com a ETA-IL (frase do resumo; conferir a página exata) |
| Validade do passaporte | C08-019 | CONTESTADO: seis meses (MNE da Sérvia, Universidade de Tel Aviv) ou três meses além da chegada (israel.travel). O texto manda seguir a mais exigente e conferir no portal |
| ETA-IL: piloto e obrigatoriedade | C08-021 | VERIFICADO: teste desde 1º/07/2024; obrigatória desde 1º/01/2025 (antes anunciada para 1º/08/2024) |
| ETA-IL e controle de fronteira | C08-022 | VERIFICADO na forma "não substitui o controle de fronteira" |
| Segurança no Ben Gurion | C08-025, 044, 045 | VERIFICADO: três horas antes, passaporte e passagem, perguntas sobre o voo; conferir o terminal; voos de saída mudando (março de 2026) |
| Seguro | C08-028, 046 | VERIFICADO: exigido no eVisa-B2; não listado nas páginas da ETA-IL vistas; em Tel Aviv, paga-se e pede-se reembolso |
| Moeda | C08-029 | VERIFICADO: Banco de Israel emissor único; novo shekel desde 1985, 100 agorot |
| Trem e Shabat | C08-031 | VERIFICADO: param na tarde de sexta, voltam no sábado após o pôr do sol |
| Ônibus, Rav-Kav | C08-032, 047 | VERIFICADO: sem dinheiro a bordo; Rav-Kav, aplicativo ou cartão em linhas selecionadas; Rav-Kav anônimo a 5 shekels |
| Shabat em Tel Aviv | C08-033, 052 | VERIFICADO: transporte público geral parado; táxis e sheruts rodam; Naim BaSofash desde 2019, 17 linhas |
| Sherut | C08-034 | VERIFICADO (Tel Aviv) |
| Táxi | C08-035, 048 | VERIFICADO: taxímetro obrigatório, acréscimo de 25% e por mala; infrações no aeroporto (Controlador, 2024) |
| Tomadas | C08-037 | VERIFICADO: 230 V, 50 Hz, tipos C e H (World Factbook) |
| Muro Ocidental | C08-038 | VERIFICADO: roupa adequada; sem eletrônicos nem fotos no Shabat e feriados |
| Calor e água | C08-041, 049, 050, 051 | VERIFICADO: litros por reserva (En Gedi, Nachal Prat, Avdat), trilhas fechadas no calor, enchentes, previsão do IMS |
| Itamaraty | C08-001 | Nova busca não achou alerta posterior ao de 4/07/2026; o texto mantém a data e diz que a busca não mostrou versão mais recente |

## 3. Problemas encontrados e correções feitas

- **israel.travel não é fonte oficial confirmada.** Uma busca específica não
  mostrou que o domínio é do Ministério do Turismo. Ficou como nível E e só
  aparece como uma das posições do debate do passaporte, nomeado como "site de
  turismo".
- **Validade do passaporte.** Em vez de escolher um número, o texto mostra a
  divergência, atribui cada posição e recomenda a regra mais exigente.
- **Horários.** Horário noturno do táxi (21h01 ou 23h30), horários da estação
  do aeroporto e da subida a Massada divergem ou envelhecem rápido e ficaram
  fora.
- **Tel Aviv não é o país.** Shabat, sherut, seguro e Rav-Kav anônimo vêm de
  páginas da prefeitura de Tel Aviv, e o texto diz isso.
- **Vestuário.** "Ombros e joelhos cobertos" veio só de um guia de viagem e
  não entra; a fundação do Muro pede "roupa adequada", e é o que o texto diz.
  Igrejas e mesquitas não foram pesquisadas.
- **Opinião de segurança.** Nenhuma. A abertura tem a caixa `aviso` com a
  remissão ao Itamaraty, datada.

## 4. Fontes adicionais necessárias (revisão humana)

1. Portal da PIBA: lista de países isentos (Brasil), validade do passaporte,
   página com "até 90 dias por visita".
2. Alerta consular do Itamaraty em texto integral, com a data da última versão.
3. Página da Embaixada do Brasil em Tel Aviv: plantão consular.
4. Autoridade de Aeroportos: a página de segurança tinha cerca de quatro anos.
5. Cartão e pagamento por aproximação no comércio, chip e eSIM, elevador de
   Shabat, regras de igrejas e mesquitas, banho no Mar Morto (Ministério da
   Saúde): não pesquisados.

## 5. Debates relevantes

Nenhum debate acadêmico. Divergência entre fontes oficiais: validade do
passaporte (C08-019) e versões do alerta do Itamaraty (C08-003, fora do texto).

## 6. Pendências editoriais

- **Hebraico para aprovar:** <he>שַׁבָּת</he> (shabát), já na rodada anterior,
  e <he>שֵׁרוּת</he> (sherút), com a grafia do capítulo 7.
- **Antes de publicar:** refazer a consulta de segurança no dia; se o
  Itamaraty mantiver "não viajar", o dono decide se o livro sai assim, com o
  aviso na abertura do capítulo.
- Fotos: nenhuma (capítulo de serviço; nada foi procurado).
- Links (`ativos/dados/links-cap08.json`): PIBA, alerta do Itamaraty,
  bus.gov.il e a estação do aeroporto na Israel Railways, todos no texto.
- Composição: a página 2 do PDF termina com espaço depois da caixa de abertura,
  porque a seção "Segurança" começa na página seguinte; o inspetor não a acusa.
- Nenhuma caixa "O olhar de um israelense".

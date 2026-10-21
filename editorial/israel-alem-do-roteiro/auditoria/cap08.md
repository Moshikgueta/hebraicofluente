# Auditoria interna: capítulo 8, "Israel na prática"

Auditoria interna feita por IA em 21 de outubro de 2026. Não é revisão
acadêmica nem conferência de texto integral.

## 1. Afirmações por status

| Status | Quantidade | IDs |
| --- | --- | --- |
| VERIFICADO | 14 | C08-001, 002, 005 a 016 |
| PARCIALMENTE VERIFICADO | 2 | C08-003, C08-020 (fora do texto) |
| NÃO VERIFICADO | 25 | C08-017 a 019, 021 a 041, 043 |
| DESATUALIZADO | 2 | C08-004, C08-042 (fora do texto) |
| Total | 43 | |

Todos os registros são da categoria `pratica` e têm `revisar_ate: 2027-04-21`.
O manuscrito só cita registros VERIFICADO.

Fontes: 15 (12 de nível D, 3 de nível E). As de nível E não sustentam nenhuma
frase sozinhas: a F08-014 reforça o número do plantão (C08-005) e as F08-012 e
F08-013 só documentam as datas de atualização do alerta (C08-003, fora do texto).

## 2. Problemas encontrados

- **Pesquisa incompleta.** A cota de buscas acabou depois de 12 consultas
  (previsto: 40 a 80). Só segurança e ETA-IL têm fonte oficial. O capítulo tem
  cerca de 1.800 palavras, abaixo das 2.400 do orçamento, e não foi enchido com
  texto sem fonte. Passaporte, permanência, aeroporto, bagagem, seguro, moeda,
  pagamentos, transporte, telefone, tomadas, vestuário, Shabat e saúde aparecem
  só como "consulte X".
- **Data do alerta do Itamaraty.** A página mostrada pela busca traz 4/07/2026;
  a imprensa fala em versões de 16 e 21 de julho e numa atualização em 30 de
  agosto. O texto cita só a data da página e diz que a busca não confirmou se
  havia versão mais recente.
- **Atribuição dentro do resumo da busca.** Em C08-012 (cartão de crédito, sem
  reembolso) e C08-013 (validade de dois anos), o resumo juntou várias páginas
  e não deixou claro qual página oficial traz cada frase. Ficaram VERIFICADO
  com a limitação escrita; são as primeiras conferências da revisão humana.
- **Página do Itamaraty desatualizada.** A página de país do antigo Portal
  Consular ("alto grau de cautela") contradiz os alertas de 2026. Registrada
  como DESATUALIZADO e fora do texto.
- **Fonte de outro governo.** C08-008 e C08-009 vêm da Embaixada dos EUA. O
  texto diz que é orientação dirigida aos cidadãos dela.
- **Sigla NIS.** A expansão "novo shekel israelense" no aviso da ETA-IL é
  definicional, mas o registro de moeda (C08-029) está NÃO VERIFICADO.
  Confirmar com o Bank of Israel.
- **Rav-Kav e sherut** aparecem no texto só dentro de perguntas a conferir
  ("se você vai precisar do cartão Rav-Kav"), sem regra afirmada.

## 3. Correções feitas

- Retiradas da redação frases sem fonte: "o Banco de Israel publica a moeda e
  as cédulas", "a INPA publica as condições de cada parque", "o guia local
  costuma saber a regra", "quem define a regra é a administração do lugar", a
  descrição dos sites intermediários (cores e cobrança) e a linha
  Jerusalém-Tel Aviv-aeroporto do trem.
- "Se não for isento, seguir o visto eletrônico" virou "ver no mesmo portal
  como pedir o visto" (o eVisa-B2 está no portal, mas não se confirmou para
  quem ele vale).
- Os números dos intermediários (US$ 40 a 80), a data do piloto da ETA-IL, a
  contagem de países isentos e o telefone 104 ficaram fora.
- Aplicativos comerciais de alerta citados pela fonte dos EUA ficaram fora.

## 4. Fontes adicionais necessárias (revisão humana)

1. Portal da PIBA (israel-entry.piba.gov.il): lista de países isentos (Brasil?),
   prazo de permanência, validade do passaporte, página de pagamento da ETA-IL,
   perguntas frequentes (ETA-IL não garante entrada?), cartão de entrada.
2. Alerta consular do Itamaraty em texto integral, com a data da última versão.
3. Página da Embaixada do Brasil em Tel Aviv: plantão consular.
4. Israel Airports Authority: segurança, bagagem, entrevista de saída.
5. Bank of Israel; Israel Railways; Ministério dos Transportes (Rav-Kav, Shabat,
   sherut, táxi); Israel Nature and Parks Authority; Ministério da Saúde;
   Ministério do Turismo (tomadas, Shabat em hotéis).
6. Exigência ou não de seguro de viagem (PIBA, embaixada).

## 5. Debates relevantes

Nenhum debate acadêmico. A única divergência é entre fontes sobre datas e
versões do alerta do Itamaraty, tratada no item 2.

## 6. Pendências editoriais

- **Hebraico para aprovar:** uma ocorrência, <he>שַׁבָּת</he> (shabát), tirada de
  `data/translit.json`.
- Nenhuma caixa "O olhar de um israelense".
- Fotos: nenhuma prevista.
- **Antes de publicar:** refazer a consulta de segurança no dia; se o
  Itamaraty mantiver "não viajar", o dono decide se o livro sai assim, com o
  aviso na abertura do capítulo.
- Segunda rodada de pesquisa para os itens NÃO VERIFICADO (ver
  `pesquisa/atualizacao-pratica.md`, seção 3), e depois reescrever as seções
  "No aeroporto", "Dinheiro, transporte e telefone", "Shabat" e "Calor" com os
  fatos confirmados.

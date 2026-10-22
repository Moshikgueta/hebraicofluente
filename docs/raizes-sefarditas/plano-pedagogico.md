# Raízes Sefarditas: plano pedagógico e arquitetura da experiência

## 1. O produto

Produto individual, comprado à parte, no mesmo site e com a mesma conta do
Hebraico Fluente (decisão do dono, 22/10/2026). Rotas `/raizes`, casca própria
(`components/raizes/RaizesShell.tsx`), direito `raizes-sefarditas`. Não paga
XP e não mexe na sequência de dias do curso de hebraico: um produto não compra
recompensa do outro.

A mensagem que atravessa tudo, na casa, no certificado e nas conquistas:
**conhecer a história sefardita não é comprovar uma ascendência sefardita.**

## 2. O percurso de cada módulo (oito etapas)

| Etapa | Pergunta | No módulo 1 |
| --- | --- | --- |
| Descobrir | Uma pergunta ou uma fonte | "Onde fica Sefarad?" (escolha com explicação) |
| Contextualizar | A explicação fundamentada | Texto com fonte em cada frase factual, caixa de método, glossário pesquisável, linha do tempo de 14 marcos |
| Explorar | Mapa, documento ou visualização | Mapa da península sem fronteiras, 11 lugares, 1 incerto, 3 perguntas |
| Investigar | Interpretar | Cinco documentos ligados ao contexto; "o que o documento diz / não prova"; o que os cânones de Elvira permitem afirmar |
| Aplicar | Um desafio | Ordenar 8 marcos; examinar uma frase que circula nas redes e reescrevê-la |
| Refletir | Síntese e limites | O debate da "convivência", três posições, resposta livre guardada só no aparelho |
| Consolidar | Revisão formativa | Mito ou evidência, com "em debate" como categoria própria |
| Avançar | Conclusão | Síntese, o que falta, conquista, próximo módulo |

As etapas não trancam: a ordem é sugerida. O módulo conclui quando todas as
atividades estão concluídas.

## 3. As atividades e seus critérios

| Tipo | Componente | Critério de conclusão | Errar |
| --- | --- | --- | --- |
| Escolha | `Escolha` | A resposta certa | Explicação da alternativa escolhida; "Tentar de novo" |
| Seleção múltipla | `Multipla` | A seleção exata | Explicação de cada alternativa, certa ou errada |
| Documento e contexto | `Associacao` | Todos ligados certo | Explicação por documento; os certos ficam |
| Linha do tempo | `Ordenar` | A ordem toda | Marca os itens fora do lugar; as datas só aparecem no fim |
| Mito ou evidência | `Classificar` | Mínimo do dado (6 de 8) | Explicação por item; "Refazer" |
| Mapa | `MapaHistorico` | 5 lugares explorados e 3 perguntas certas | "Corrigir" mantém as certas |

Nota guardada: a da tentativa (fica a melhor). Conclusão: a primeira vez que
o critério é cumprido. Nada disso é perdido ao recarregar (gravação imediata).

Acessibilidade: tudo pelo teclado (as setas e o "tocar e mover" substituem o
arrastar; arrastar com o mouse não foi implementado), alvos de 44 px, acerto
e erro com palavra e ícone, `aria-live` nos resultados, lista de lugares como
alternativa ao mapa, fontes abertas no lugar (sem janela por cima).

## 4. Matriz de objetivos do módulo 1

| Objetivo | Onde se aprende | Onde se avalia |
| --- | --- | --- |
| Explicar de onde vem o nome Sefarad | Descobrir, glossário | `descobrir`, `mito-ou-evidencia` (biblia) |
| Situar os marcos no tempo e no mapa | Contextualizar, linha do tempo | `mapa`, `linha-do-tempo` |
| Distinguir o que um documento diz do que se conclui | Caixa de método | `documentos`, `prova` |
| Reconhecer que a vida judaica mudou com governo, lugar e século | Contextualizar | `desafio-fatos`, `desafio-frase`, `mito-ou-evidencia` |
| Explicar por que "convivência" é debatida | Refletir | `desafio-frase`, `mito-ou-evidencia` (tolerancia) |

## 5. Progressão e conquistas

- Módulo 1 sempre aberto; cada módulo abre com o anterior concluído; concluído
  continua aberto.
- Conquistas são do estudo, nunca da identidade (o teste recusa título com
  "sefardita", "judeu", "descendente").
- O certificado só existe depois dos dez módulos e diz o que não certifica.

## 6. Revisão espaçada

O sistema de revisão do curso de hebraico é amarrado a ids de letra (SRS) e de
item de hebraico (Leitner do A1); reaproveitá-lo misturaria os produtos.
Proposta para os módulos seguintes: cada módulo abre a etapa Consolidar com
duas ou três perguntas dos módulos anteriores (os itens de `mito-ou-evidencia`
já têm id estável para isso). Não implementado.

## 7. Laboratório de Memórias Familiares (módulo 9, desenho)

- Árvore, ficha de antepassado, diário, biblioteca pessoal e classificação de
  evidência (documentado, oral, hipótese, não verificado).
- **Só no aparelho** (IndexedDB), com exportar e apagar. Não entra no blob de
  `/api/progress`, não vai para API de terceiro, não aparece no certificado.
  Sincronizar entre aparelhos exigiria tabela própria, criptografia e uma linha
  nova na Política de Privacidade: decisão à parte.
- Nenhum percentual de "ascendência" e nenhuma conclusão automática.
- As atividades com documentos fictícios dizem "exemplo didático, fictício" no
  próprio documento.

## 8. Como acrescentar um módulo

1. Pesquisar e registrar em `data/raizes/fontes.json` e `afirmacoes.json`
   (IDs `R02-NNN`, `FR-NNN`).
2. Escrever `data/raizes/modulos/m02.json` no formato do m01.
3. Pôr `2` em `MODULOS_COM_CONTEUDO` (`app/src/lib/raizes.ts`) e mudar o
   `estado` em `curso.json`.
4. `cd app && npx vitest run tests/raizes.test.ts` e `node raizes.mjs`.

# Páginas do alfabeto para a busca (rascunho, 23/10/2026)

Semana 7 do plano (`../03-plano-90-dias.md`), canal 2 da estratégia (`../02-estrategia.md`).
Skills usadas: `seo-audit`, `programmatic-seo`, `ai-seo`. **Nada aqui foi construído**: falta a
decisão do dono sobre o que pode ficar público, e os dados do Search Console para escolher as
palavras de busca.

## A fronteira: o que já é público e o que é pago

O pacote público (`app/content/course.json`) leva, de cada letra, só: a forma, o nome, o som, a
ordem e o módulo. Tudo o mais é conteúdo pago e sai de `/api/content`, atrás do portão: as
explicações, as palavras de leitura, as sílabas, o "Você sabia?", o erro comum do brasileiro e os
diagramas de traçado (`CLAUDE.md`, "O conteúdo do curso não pode voltar para o pacote público").

Uma página que só repete forma, nome e som é rala: o Google não a mostra e a busca por IA não a
cita (`programmatic-seo`: "valor próprio por página"). Para valer a pena, cada página precisa de
algo a mais, e esse "a mais" sai do curso. **Decisão do dono:** quanto do curso pode virar vitrine.

## Proposta

### `/alfabeto-hebraico` (a página principal)
- A tabela das 22 letras: forma, nome, som em português (`somPt`), forma final quando houver.
  Tudo já público ou de conhecimento geral.
- Resposta curta no topo, que a busca por IA cita: "O alfabeto hebraico tem 22 letras, todas
  consoantes; as vogais são sinais embaixo ou em cima delas (o nikud). Lê-se da direita para a
  esquerda."
- O teste grátis do Álef no meio da página e o link para o curso.
- Dados estruturados (o JSON-LD do curso já existe).

### `/alfabeto-hebraico/<letra>` (uma por letra, começando por 5)
Para cada letra, além da forma, do nome e do som, **uma** destas opções (o dono escolhe):

| Opção | O que entra a mais | Quanto do curso fica público |
|---|---|---|
| A | uma palavra de exemplo com a gravação do professor, e as letras parecidas | pouco: 1 palavra por letra |
| B | A + o erro comum do brasileiro (o texto curto do "certo") | médio: 1 palavra e 1 dica |
| C | B + o "Você sabia?" | mais: 1 palavra, 1 dica e 1 curiosidade |

Recomendação: **B**. O erro comum é o que nenhum outro site em português tem (o pilar C dos Reels
usa a mesma ideia) e ensina uma coisa só, sem entregar a lição: as sílabas, as outras palavras, os
exercícios, a escrita e a fixação continuam só no curso.

As 5 primeiras: Álef, Mem, Tav, Shin e Lámed (as de mais busca provável, [H] até haver dados).

### Três guias
"Como ler hebraico", "O que é o nikud" e "Hebraico para quem vai a Israel". Texto novo, escrito
para a busca, revisado pelo dono; o hebraico citado só do curso.

## Medição

Search Console: impressões e cliques das páginas novas por 8 semanas, antes de fazer as outras 17
letras (experimento S1 do plano).

## O que falta para construir

1. O dono escolhe A, B ou C.
2. O dono liga o Search Console, para ver se as buscas existem antes de escrever os guias.
3. Todo texto novo passa pelo dono antes de ir ao ar.

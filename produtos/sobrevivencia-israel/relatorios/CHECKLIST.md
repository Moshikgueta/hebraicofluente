# Checklist de qualidade final: versão 0.2.0

**Veredito: editorialmente pronta para a avaliação do autor. NÃO está pronta para venda.** Ainda faltam a revisão do hebraico pelo autor, a conferência dos fatos marcados em fonte oficial, a gravação dos áudios e a decisão de enquadramento comercial (ver `produtos/README.md`).

## Testes executados (21/10/2026)

| Teste | Como | Resultado |
| --- | --- | --- |
| 100 itens distintos, campos completos | `npm run conferir` (em produtos/) | ok: 100 itens, nenhum id ou hebraico repetido |
| Grafia sem vogais compatível com o nikud | conferir.mjs | ok |
| Hebraico em NFC; só letras e sinais hebraicos | conferir.mjs | ok |
| Convenção de transliteração (acento, monossílabo) | conferir.mjs, também no hebraico novo dos quadros | ok |
| Referências internas (resumos, revisões, emergência, tabela, diálogos, desafios) | conferir.mjs | ok |
| Travessão e meia-risca (regra do CLAUDE.md) | as duas linhas de `grep` do CLAUDE.md sobre produtos/ | ok, vazias |
| Nenhum bloco cortado ou sobreposto | paginador: medida e conferência de transbordo em cada página | ok, nenhum estouro (A4 e celular) |
| Nenhuma página vazia; ocupação | relatório do paginador | A4: média de 94%, mínima de 74% |
| Fontes embutidas e só as do projeto | `pdffonts` | ok: Bricolage, Instrument Sans, Noto Sans Hebrew e Noto Serif Hebrew, todas embutidas |
| Hebraico pesquisável e copiável | `pdftotext`, busca por שלום e צריך | ok |
| PDF marcado (acessibilidade), idioma | `pdfinfo` e pypdf | ok: Tagged sim, /Lang pt-BR, StructTreeRoot presente |
| Metadados | `pdfinfo` | ok: título, autor, assunto e palavras-chave |
| Marcadores | pypdf | ok: 18, um por seção, com as páginas certas |
| Links internos | paginador: todo `href="#..."` tem destino | ok: 307 anotações de link, nenhuma âncora sem destino |
| Links externos | só hebraicofluente.com.br e /cursos/alfabetizacao/ | rota conferida no código do app; **não aberta** (rede da sessão bloqueia o domínio) |
| Inspeção visual | as 37 páginas renderizadas a 80 dpi, em pares, e página 26 a 160 dpi para o nikud | feita; problemas corrigidos abaixo |
| Áudio não anunciado como disponível | texto da introdução; nenhum QR | ok |
| Faixa RASCUNHO | rodapé de toda página de conteúdo e capa | ok (o hebraico não está aprovado) |
| Plataforma intocada | `git status`: só produtos/ mudou | ok |

## Problemas encontrados na inspeção e corrigidos

1. **Medida errada no paginador.** A página-modelo ficava fora do `<body>`, e 9 páginas transbordavam. Corrigido.
2. **Arredondamento de pixel.** Uma página transbordava por 2 px. Corrigido com folga de 3 px.
3. **Pronúncia espremida.** Em "Situação real", na página de emergência e em "Você vai ouvir", a pronúncia ficava numa coluna estreita quando a frase hebraica era longa. Corrigido: a frase longa ganha a linha de cima.
4. **Hebraico de duas palavras quebrando de linha** no meio do português (מַיִם מֵהַבֶּרֶז), o que invertia a ordem de leitura. Corrigido: trecho hebraico no texto não quebra.
5. **Hebraico solto no texto corrido sem isolamento de direção.** Corrigido: isolamento automático.
6. **Números:** a tabela inteira não cabia e deixava duas páginas com cerca de 40% vazias. Corrigido: duas metades lado a lado.
7. **Rótulo das variantes** ("Mulher diz") caía embaixo da linha. Corrigido.
8. **Rótulos das figuras pequenos demais** (menos de 6 pt). Ampliados.
9. **Cores das moedas sem fonte.** Retiradas.
10. **Página quase vazia antes do índice.** Resolvida com o encadeamento do gabarito e do índice.
11. **Página de emergência transbordando para uma segunda página** depois de ampliar a letra. Corrigido.
12. **Generalizações absolutas no texto.** Retiradas (ver MELHORIAS.md).

## Pendências abertas

| Pendência | Responsável | Bloqueia a venda? |
| --- | --- | --- |
| Revisar as 100 expressões, as falas e o hebraico novo (`REVISAO.md`) e aprovar | autor | sim |
| Decisões linguísticas listadas em AUDITORIA-LINGUISTICA.md (nikud, 090, preços falados) | autor | sim |
| Conferir em fonte oficial os fatos marcados em VERIFICACAO-FACTUAL.md (água, horários de shabat, ETA-IL) e as dicas sem fonte | autor ou editor | sim |
| Abrir os dois links externos num navegador | qualquer pessoa | sim (teste simples) |
| Gravar os áudios (219 faixas no manifesto), publicar as páginas e gerar os QR | autor e desenvolvimento | não para o PDF; sim para anunciar áudio |
| Decisão de enquadramento da venda avulsa (CNAE, Termos, Reembolso) | dono, contador e advogado | sim |
| Página de venda, checkout e entrega autenticada | desenvolvimento, depois da decisão acima | sim |
| Versão de celular: páginas de fim de capítulo com cerca de 29% antes de cada abertura | design | não |
| Reaproveitar o painel /admin/gravar para este manifesto | desenvolvimento | não |

# O livro inteiro redesenhado: estado em 21/10/2026

Fase 5 concluída: os dez capítulos, a abertura e o fechamento saem da mesma
base estruturada, em PDF e na experiência web. **Nada foi publicado na loja
nem no site**: tudo continua no ramo de trabalho, à espera da sua aprovação e
da revisão humana.

## Como gerar

| Peça | Comando (na pasta `editorial/`) | Resultado |
| --- | --- | --- |
| Livro em PDF | `node tools/revista.mjs israel-alem-do-roteiro --livro` | `saida/livro-revista.pdf`, 259 páginas |
| Um capítulo | `node tools/revista.mjs israel-alem-do-roteiro --capitulos=03-jerusalem.md --saida=capitulo-03` | `saida/capitulo-03.pdf` |
| Web | `node tools/web.mjs israel-alem-do-roteiro --livro --artefato` | `saida/web/index.html` e `artefato.html` |
| Inspeção | `node tools/inspecionar.mjs israel-alem-do-roteiro --formato=livro-revista` | folhas de contato em `saida/inspecao/` |
| Verificação | `node tools/validar.mjs israel-alem-do-roteiro` | `auditoria/validacao.md` |

O PDF antigo (rascunho de 153 páginas, `tools/build.mjs`) não foi substituído
nem apagado.

## Os capítulos

Palavras sem as marcações; afirmações citadas no texto, por status. Só
VERIFICADO e CONTESTADO vão ao texto, e CONTESTADO sempre com o debate
atribuído.

| Cap. | Título | Palavras | Verificado | Contestado | Auditoria |
| --- | --- | --- | --- | --- | --- |
| 1 | Israel no mapa | 2.745 | 40 | 0 | `auditoria/cap01.md` |
| 2 | Milhares de anos de história | 7.045 | 98 | 21 | `auditoria/cap02.md`, `cap02b.md` |
| 3 | Jerusalém | 4.592 | 83 | 5 | `auditoria/cap03.md` |
| 4 | Além de Jerusalém | 4.267 | 64 | 2 | `auditoria/cap04.md` |
| 5 | A vida real em Israel | 3.322 | 48 | 1 | `auditoria/cap05.md` |
| 6 | Sabores de Israel | 2.525 | 19 | 5 | `auditoria/cap06.md` |
| 7 | Hebraico para compreender Israel | 2.980 | 21 | 3 | `auditoria/cap07.md` |
| 8 | Israel na prática | 2.512 | 38 | 1 | `auditoria/cap08.md` |
| 9 | 41 curiosidades sobre Israel | 2.533 | 49 | 3 | `auditoria/cap09.md` |
| 10 | Diário de descobertas | - | - | - | - |

## Testes que rodaram

- Validador: 0 erros, 1 aviso (a caixa "O olhar de um israelense" do
  capítulo 1, que espera o seu texto).
- Travessão e meia-risca: nenhum em `editorial/`.
- PDF do livro: 259 páginas, nenhum transbordo, 27 de 27 QR codes lidos de
  volta (jsQR) e iguais ao endereço registrado. Páginas com pouca ocupação:
  as do diário (pautadas de propósito) e alguns fins de capítulo.
- Web a 390 px: as 12 rotas (início, nove capítulos, glossário, diário) sem
  rolagem lateral e sem erro de console; 41 curiosidades, 59 atividades.
- **Não testado:** abrir os endereços dos QR (a rede deste ambiente não
  deixa; `tools/checar-links.mjs` faz isso), leitor de tela real, impressão
  física.

## O que bloqueia a publicação (decisões suas e revisão humana)

1. **Hebraico:** todo hebraico do livro precisa da sua aprovação
   (`auditoria/hebraico.md`, gerado pelo validador, e a seção de pendências
   de cada auditoria). Novos nesta rodada: nomes das portas de Jerusalém, os
   dias da semana, Hatikvá, ptitím, letras soltas do capítulo 7.
2. **Segurança:** o capítulo 8 abre com o alerta do Itamaraty de 04/07/2026,
   que recomendava não viajar para Israel. Refazer a consulta no dia da
   publicação; se continuar assim, a decisão de publicar é sua.
3. **Fotos:** nenhuma está inserida. As molduras mostram a candidata
   escolhida. Rodar `tools/baixar-fotos.mjs` com internet aberta e decidir
   com o advogado as CC BY-SA. A do Santo Sepulcro tem licença contraditória.
4. **Fontes de nível E:** o capítulo 9 tem várias curiosidades apoiadas só
   em jornalismo, nem todas datadas; a auditoria lista cada uma para
   conferir em fonte primária. Nos capítulos 3, 4 e 6, as afirmações de
   nível E estão atribuídas no texto.
5. **Capítulo 9 com 41, não 50:** o título diz 41. Você decide se fica
   assim ou se o título perde o número.
6. **Caixas "O olhar de um israelense":** são suas. A do dúgri saiu do
   capítulo 5 (o texto anterior está no histórico do git).
7. **Revisão humana especializada** (historiador para os capítulos 2 e 3) e
   conferência das passagens no texto integral das obras.
8. **Enquadramento:** vender o e-book separado do curso é atividade nova
   pelas regras do projeto (CNAE). A decisão é sua, com o contador, antes de
   qualquer mudança na loja.

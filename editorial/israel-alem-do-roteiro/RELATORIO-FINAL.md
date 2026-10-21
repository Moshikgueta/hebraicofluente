# Israel Além do Roteiro: relatório da primeira rodada

Data: 21/10/2026. **O livro NÃO está pronto para venda.** Este relatório diz o
que existe, o que falta e por quê. O gerador recusa a edição final enquanto
as aprovações humanas não estiverem registradas em `revisao/aprovacoes.json`.

## 1. O que foi entregue

| Entregável | Estado | Onde |
| --- | --- | --- |
| Auditoria técnica do repositório | feita | seção 4 deste relatório e `comercial/PROPOSTA-LOJA.md` |
| Estrutura editorial | feita | `ESTRUTURA.md`, `livro.json` |
| Protocolo de pesquisa e verificação | feito | `PROTOCOLO.md` |
| Pipeline reproduzível (PDF digital, A4, amostra) | feito e testado | `../tools/`, `../templates/`, `../README.md` |
| Validador (fontes, afirmações, travessão, hebraico, informação vencida) | feito; 0 erros, 3 avisos | `auditoria/validacao.md` |
| Capítulos 1 a 8 | **parciais** (ver seção 2) | `manuscrito/` |
| Capítulo 9 (50 curiosidades) | **não escrito**: nenhuma busca disponível | lista de candidatas no relatório do agente, a refazer |
| Capítulo 10 (diário), nota metodológica, introdução, notas sobre fontes, encerramento | escritos | `manuscrito/` |
| Registro de afirmações e de fontes | 457 afirmações, 269 fontes | `afirmacoes/`, `fontes/` |
| Relatórios de auditoria por capítulo | 8 capítulos + auditoria cruzada | `auditoria/` |
| Relatório de verificação linguística | lista de 158 ocorrências de hebraico para aprovação | `auditoria/hebraico.md`, `auditoria/cap07.md` |
| Relatório de atualização das informações práticas | feito (metade dos temas sem fonte oficial) | `pesquisa/atualizacao-pratica.md` |
| Bibliografia (de trabalho e do livro) | gerada dos registros | `pesquisa/bibliografia-de-trabalho.md` e no PDF |
| Mapa dos temas controversos | feito | `pesquisa/plano-de-pesquisa.md`, `pesquisa/temas-controversos-cap02.md` |
| Mapas | 3 gerados da Natural Earth (domínio público) | `ativos/mapas/` |
| Infográficos | clima gerado; semana e esquema de Jerusalém bloqueados por falta de dado verificado | `ativos/infograficos/`, `ativos/dados/` |
| Registro de direitos de imagem | feito; nenhuma fotografia (nenhuma com licença verificável acessível daqui) | `ativos/registro-de-ativos.json` |
| Capa | arte original, sem contorno de mapa | `../templates/capa-arte.svg` |
| PDF digital, A4 e amostra | gerados como RASCUNHO | `saida/` (fora do git; `node tools/build.mjs`) |
| Página comercial, entrega segura, kit | **projetados, não implementados** (seção 3) | `comercial/PROPOSTA-LOJA.md` |
| Documentação para futuras edições | feita | `../README.md`, `pesquisa/plano-de-pesquisa.md` |

Números do rascunho: cerca de 18.000 palavras, 153 páginas no formato digital
(148 x 210 mm) e 108 em A4. A extensão final vai depender dos capítulos que
faltam; o livro digital tem hoje muitas páginas de notas e de diário.

## 2. Por que os capítulos estão parciais

A pesquisa só pode ser feita por busca na web (a leitura direta das páginas
está bloqueada pela rede deste ambiente), e cada rodada tem uma cota de cerca
de 200 buscas dividida entre os agentes. Nove agentes em paralelo esgotaram a
cota com 12 a 44 buscas por capítulo. Pelo protocolo, o que não foi
verificado ficou fora do texto: nada foi preenchido de memória.

| Cap. | Palavras (meta) | Afirmações no texto | O que falta, em resumo |
| --- | --- | --- | --- |
| 1 | ~1.600 (2.600) | 20 | Neguev, Arava, vale do Jordão, montes centrais, cidades, temperaturas, nível oficial do Mar Morto |
| 2 | ~2.850 (5.000) | 41 | **1948 inteiro e tudo depois**; estelas de Merneptah e Tel Dan; sionismo e nacionalismo palestino |
| 3 | ~2.700 (4.200) | 55 | quatro bairros, portas, Monte das Oliveiras, mercados, cidade dividida 1948-1967 |
| 4 | ~3.200 (4.200) | 57 | Mar Morto, Nazaré, Cafarnaum (tradições), Acre e Tel Aviv em parte |
| 5 | ~1.720 (3.000) | 26 | **a semana, o Shabat, os feriados**, kibutz, outras línguas |
| 6 | ~1.630 (2.200) | 13 | kashrut básica, shakshuka, pães, mercados, gorjeta |
| 7 | ~1.500 (2.600) | 0 | **sem nenhuma fonte**: abertura histórica, placas trilíngues, etimologias. Vocabulário de 41 itens sem afirmação histórica |
| 8 | ~1.800 (2.400) | 14 | entrada de brasileiros (visto, passaporte), aeroporto, moeda, transporte, tomadas |
| 9 | 0 (4.500) | 0 | tudo |

O plano das próximas rodadas, com a ordem e o orçamento de buscas, está em
`pesquisa/plano-de-pesquisa.md`. **Cada mensagem nova na sessão abre uma
cota nova de buscas**; com 3 agentes por rodada, são precisas cerca de quatro
rodadas para fechar o texto.

## 3. Decisões que são suas (e bloqueiam a venda)

1. **Enquadramento fiscal e jurídico.** O `CLAUDE.md` diz que a venda avulsa
   de e-book é atividade independente e precisa ser apontada a você antes de
   qualquer código. Este é o aviso. Perguntas para o contador e o advogado,
   e os textos que mudam (Termos art. 1, Reembolso, Privacidade), estão em
   `comercial/PROPOSTA-LOJA.md`, seção 1.1. **Nenhuma linha da loja, do
   checkout, do Worker ou do `data/courses.json` foi alterada.**
2. **Alerta do Itamaraty.** Na consulta de 21/10/2026, o alerta consular para
   o Oriente Médio recomendava **não viajar para Israel** (página com data de
   4/07/2026). O capítulo 8 traz isso, datado. Vender agora um livro
   posicionado como preparação para a viagem é decisão sua; a proposta sugere
   posicioná-lo como história e cultura.
3. **Kit Israel Antes de Embarcar.** "Hebraico Sem Perrengue" não existe no
   repositório; o kit fica desenhado e desligado.
4. **Convenção do nikud.** O capítulo 7 segue a regra do curso (daguesh só em
   בּ, כּ, פּ); os outros capítulos usam o nikud completo (ex.: הַמַּעֲרָבִי no
   cap. 3 e הַמַעֲרָבִי no cap. 7). Escolha uma para o livro inteiro.
5. **Todo o hebraico** (158 ocorrências) e as **duas caixas "O olhar de um
   israelense"** dependem da sua aprovação (`auditoria/hebraico.md`).
6. **Créditos e transparência.** Os créditos e a nota metodológica dizem que a
   pesquisa e a redação tiveram apoio de inteligência artificial e que a
   revisão humana especializada está pendente. Recomendo manter: o livro é
   vendido como trabalho sério, e o comprador tem direito de saber o método.
   A redação final é sua.
7. **Revisão humana especializada.** Um historiador ou pesquisador da região
   precisa ler o texto e abrir no texto integral as fontes marcadas nas
   auditorias. O livro não pode dizer "revisado" antes disso.
8. **Fotografias.** Nenhuma foi usada: daqui não há acesso a bancos com licença
   verificável. A lista do que fotografar ou licenciar está em
   `ativos/registro-de-ativos.json`.

## 4. Auditoria técnica (resumo)

- Next.js 15 com export estático em `app/`, Worker da Cloudflare em `worker/`
  (API, portão do conteúdo pago, Mercado Pago), D1 como banco. Catálogo único
  em `data/courses.json`, lido pelos dois lados; preço nunca vem do cliente.
- Design system em `app/src/styles/tokens.css` (navy, teal, gold, creme;
  Bricolage Grotesque, Instrument Sans, Noto Serif Hebrew). O livro reaproveita
  a paleta e as fontes, com Literata no corpo; o site não foi tocado.
- Entrega de conteúdo pago hoje: só curso, por `entitlements` com prazo em
  meses e rota atrás do portão. Não existe entrega de arquivo; a proposta usa
  R2 privado e uma rota com sessão e direito no banco.
- Riscos: limite de 10 ms de CPU do plano gratuito (carimbar PDF no Worker não
  cabe), `grantAccess` só sabe conceder por meses, e as páginas `/cursos/*`
  assumem curso com lições.
- Os materiais editoriais do repositório (`data/bonus.json`, `culture.json`)
  são do curso e não foram reaproveitados no texto, para não duplicar.

## 5. Problemas de método encontrados e como foram tratados

- **Busca com resumo, não texto integral:** todo registro diz `trecho-de-busca`
  ou `referencia-confirmada`; o validador recusa VERIFICADO apoiado só em
  referência confirmada; a nota metodológica diz isso ao leitor.
- **Fontes de nível E:** nove afirmações no texto dependem só de jornalismo
  fora da exceção do fato datado (lista em `auditoria/auditoria-cruzada.md`);
  uma já foi rebaixada e retirada (C03-049). As demais são a primeira tarefa
  da rodada 5.
- **Frases maiores que o registro:** a auditoria cruzada achou 34 e corrigiu
  30; as 4 restantes dependem de abrir a fonte.
- **Paginação:** o Paged.js truncava o livro em silêncio diante de um bloco
  impossível de quebrar; o gerador agora falha nesses casos.

## 6. Como continuar

1. Responda às decisões da seção 3 (pelo menos 1, 2, 4 e 6).
2. Mande uma mensagem pedindo a rodada 2 de pesquisa (capítulos 9, 8 e 7).
3. Depois de cada rodada: `cd editorial && node tools/validar.mjs
   israel-alem-do-roteiro && node tools/build.mjs israel-alem-do-roteiro`.
4. Com o texto completo: revisão humana, aprovação do hebraico, registro em
   `revisao/aprovacoes.json`, e só então `--final`.

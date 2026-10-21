# Fase 6, etapa 3: piloto do capítulo 3 (Jerusalém)

Estado em 21/10/2026. **Aguarda a aprovação do dono** antes de aplicar a
linguagem aos outros capítulos (etapa 4).

## Decisões do dono que valem a partir daqui
- Estilo "papel recortado" aprovado; ilustração só em desenho SVG, nada
  gerado por IA.
- **Nomes e política (21/10/2026):** nos mapas, o território aparece como
  **Judeia e Samaria (Cisjordânia)**, e os mapas não trazem rótulos de
  disputa política ("ocupada", "a ONU não reconhece"). Feito em todos os
  mapas e ilustrações (capítulos 1 a 4 e pranchas) e no quadro "Ler um mapa
  de Israel" do capítulo 1. O texto corrido dos capítulos ainda não mudou:
  ver a pergunta no fim.

## O que entrou no capítulo 3
| Peça | Onde | Dados |
| --- | --- | --- |
| Abertura ilustrada própria | `ativos/ilustracoes/abertura-jerusalem.svg` | desenho, sem dado, rotulado "ilustração" |
| Mapa esquemático da Cidade Antiga, tocável na web | `mapa-cidade-antiga.svg` + `ativos/dados/mapa-cidade-antiga-pontos.json` | C03-012, 015, 092, 105, 108, 110 a 118 (novas: 112 a 118) |
| Comparação com o Brasil: a muralha e a Lagoa Rodrigo de Freitas | `muralha-lagoa.svg` | C03-008, C03-119 (Rio-Águas), C03-120 |
| Um monte, dois nomes (corte) | `monte-dois-nomes.svg` | C03-012 a 014, 018, 020, 027, 029, 030 |
| Compare: Jerusalém 1949-1967 e desde 1967 | `jerusalem-1949.svg`, `jerusalem-hoje.svg` | Natural Earth; C03-103, C02-525 |
| 8 fichas de lugar | no manuscrito (`::: ficha`) | cada campo com os seus marcadores |
| Pegadinha do guia | quiz sobre o Kotel | C03-005, C03-012 |
| História ou tradição? com palpite | Via Dolorosa (tradição), túnel de Ezequias (as duas) | as do texto |
| Meu roteiro (PDF) | lista de marcar no fim do capítulo | as fichas |

Pesquisa nova: 11 buscas (posição das portas e dos bairros; Lagoa Rodrigo de
Freitas). Porta Nova e Porta Dourada ficaram fora do mapa porque nenhuma
fonte oficial deu o lado da muralha.

## Interação na web (todo o livro, testada no capítulo 3)
Mapa tocável que abre a ficha; compare deslizante; palpite antes de abrir
"História ou tradição?"; pegadinha do guia; "Guardar" e "Gravar a minha" em
cada palavra (a gravação fica no aparelho; dentro da página publicada o
navegador recusa o microfone e o botão diz isso); "Quero ver" em cada ficha;
páginas **Roteiro** (todos os lugares, por região) e **Minha viagem** (o
roteiro, as palavras e as seções guardadas, com o aviso de Shabat).

## Testes que rodaram
- Validador: 0 erros. Travessão: nenhum.
- PDF do capítulo 3: 38 páginas, sem transbordo, sem página quase vazia,
  4 de 4 QR lidos de volta.
- Web a 360 e 390 px: sem rolagem lateral em capítulo, Roteiro e Minha
  viagem; nenhum erro de console; 8 fichas, 8 pontos, o ponto abre a ficha
  na folha, "Quero ver" grava, o palpite abre a caixa, o compare recorta,
  "Minha viagem" mostra os lugares escolhidos.
- **Não testado:** leitor de tela real, a gravação de voz num celular de
  verdade, impressão física.

## Pendências
- Hebraico novo nas fichas: nenhum além do que o capítulo já tinha
  (Kotel, Har HaBáyit, Migdál Davíd, Har HaZeitím, Ir Davíd), todos à espera
  da aprovação do dono.
- "Tempo de visita" e "melhor horário" das fichas: sem fonte oficial, ficaram
  fora.
- A fonte da posição do bairro cristão é a Britannica (nível E) e um endereço
  do Ministério do Turismo; está dito na afirmação C03-118.

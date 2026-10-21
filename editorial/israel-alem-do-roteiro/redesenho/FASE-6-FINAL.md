# Fase 6 concluída: o livro ilustrado, interativo e com exercícios

Estado em 21/10/2026. Nada foi publicado na loja nem no site.

## O que o livro tem agora
- **Abertura ilustrada própria** nos dez capítulos (estilo "papel recortado", só SVG, nada gerado por IA).
- **Vinheta em toda seção** (49 desenhos em `tools/lib/vinhetas.mjs`; catálogo em `saida/vinhetas.png`).
- **Ilustrações e infográficos** por capítulo, todos com dado registrado (módulos em `tools/ilustracoes/capNN.mjs`).
- **Comparação com o Brasil** em todos os capítulos menos o diário: Sergipe, chuva de Brasília, Oswaldo Aranha, a Lagoa Rodrigo de Freitas, o Pão de Açúcar, os feriados, a gorjeta, "sábado", a tomada, os Justos brasileiros.
- **Compreensão da leitura** no fim dos capítulos 1 a 9: 11 a 13 exercícios cada (múltipla escolha, verdadeiro ou falso, associar, completar, ordenar, pergunta aberta). No PDF, para fazer à mão, com gabarito; na web, corrigidos na hora, com placar e a página Exercícios.
- **Na web:** mapas tocáveis, fichas de lugar, compare deslizante, palpite em "História ou tradição?", pegadinha do guia, Monte seu roteiro, Minha viagem, guardar e gravar palavras, copiar curiosidades.
- **Decisão política do dono:** "Judeia e Samaria (Cisjordânia)" nos mapas e no texto; sem ONU, posições de governo ou debate jurídico.

## Testes que rodaram
- Validador: 0 erros (1 aviso: a caixa "O olhar de um israelense" do capítulo 1, que é do dono). Travessão: nenhum.
- PDF do livro: 333 páginas, nenhum transbordo, 26 de 26 QR lidos de volta. Páginas com pouca ocupação: as pautadas do diário, a segunda do sumário e um fim de capítulo.
- Web a 360 e 390 px: as 15 rotas sem rolagem lateral e sem erro de console; exercícios (completar, associar, ordenar), placar, mapa tocável, ficha, compare e roteiro testados com clique.
- **Não testado:** leitor de tela, gravação de voz em celular real, impressão.

## Pendências do dono
Hebraico para aprovar (`auditoria/hebraico.md`); segurança (Itamaraty) no dia da publicação; fotos e licenças; fontes de nível E apontadas nas auditorias (capítulos 5, 6, 7 e 9); revisão de um historiador; enquadramento (CNAE) antes da venda separada.

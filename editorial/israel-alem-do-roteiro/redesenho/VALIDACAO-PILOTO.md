# Validação do piloto: capítulo 1, "Israel no mapa"

Fase 4. Data: 21/10/2026. **Aguarda a sua aprovação** antes de transformar o
resto do livro, conforme o pedido.

## O que foi entregue

| Peça | Arquivo | Como gerar de novo |
| --- | --- | --- |
| Capítulo redesenhado em PDF (24 páginas, 1,1 MB) | `saida/piloto-cap01.pdf` (fora do git) | `node tools/revista.mjs israel-alem-do-roteiro --capitulos=01-israel-no-mapa.md --saida=piloto-cap01` |
| Experiência web do capítulo | `saida/web/index.html` (fora do git) | `node tools/web.mjs israel-alem-do-roteiro` |
| Base estruturada (o JSON que alimenta os dois) | `saida/piloto-cap01.json` | sai junto com o PDF |
| Ilustração de abertura (corte esquemático das quatro faixas) | `ativos/infograficos/corte-faixas.svg` | `node tools/infograficos.mjs` |
| Mapa com pontos tocáveis (11 regiões, texto verificado) | `ativos/dados/mapa-regioes-pontos.json` | `node tools/mapas.mjs` |
| Fotos escolhidas (48 candidatas, 15 links oficiais) | `ativos/dados/fotos-candidatas-cap01.json` | pesquisa |
| Baixar fotos e conferir licença na API do Commons | `tools/baixar-fotos.mjs` | precisa de internet aberta |
| Verificar se os endereços respondem | `tools/checar-links.mjs` | precisa de internet aberta |

## Critérios e resultado

### Editorial
- **Texto reescrito** em ritmo de jornalismo cultural: abertura com cena,
  parágrafos curtos, atribuição só onde a fonte faz parte da história,
  intertítulos novos ("A chuva some no caminho para o sul", "Leia a paisagem
  pela janela"). Nenhuma informação nova sem registro: todas as 8 seções saem
  com status `verificado` na base estruturada.
- **Aparato fora do caminho:** nenhum sobrescrito no corpo. Cada seção termina
  com "Fontes desta seção: n, n", que leva às notas do fim do capítulo.
- **Bloqueante resolvido:** a seção "Golã e Jerusalém Oriental: o que diz a
  ONU", com as resoluções 478 e 497, a posição dos EUA desde 2019 e a resposta
  da ONU.
- **Pendências do capítulo**, que não impedem o piloto mas impedem a
  publicação: o nível atual do Mar Morto só em fonte de nível E (o texto usa o
  limite de 2022); clima por cidade e perfil de altitude sem fonte oficial
  (por isso não há números por cidade); a caixa "O olhar de um israelense"
  espera você; o hebraico espera você.

### Visual (inspeção página a página, `tools/inspecionar.mjs`)
- 24 páginas, **nenhum transbordo, nenhuma página com menos de 40% de
  ocupação**, nenhuma truncagem (o gerador falha se houver).
- Composições usadas: abertura cinematográfica, narrativa ilustrada (fotos e
  mapas largos), infográfico, dado em destaque (470 km; 1,15 m), notas com
  fio, "Entenda melhor", faixa de hebraico, links com QR code, desafios de
  observação, "Perguntas e descobertas" e notas em duas colunas.
- **Fotografias:** as molduras estão no lugar definitivo, com o arquivo
  escolhido, autor e licença declarada, marcadas "Fotografia a inserir". Não
  foram inseridas porque daqui não dá para baixar nem conferir a licença no
  próprio arquivo. Seis fotos no capítulo: Tel Aviv, Kinéret, bacias de
  evaporação (NASA, domínio público), dolina, Machtésh Ramón e lago Agmon.

### Técnico
| Teste | Resultado |
| --- | --- |
| QR codes desenhados e lidos de volta (jsQR) | 4 de 4 levam exatamente ao endereço registrado |
| Endereços abertos | **não testado**: a rede deste ambiente bloqueia; rodar `tools/checar-links.mjs` |
| Web a 390 px, sem rolagem lateral | início, capítulo, glossário e diário: largura 390 em todos |
| Erros de console | nenhum |
| Mapa interativo | 10 pontos; a folha abre com o texto verificado e fecha com Esc |
| Áudio | יָם toca a gravação do curso (0,85 s); 4 palavras sem gravação aparecem com o botão desligado, sem voz sintética |
| Quiz | marca a certa e a escolhida, explica sempre ("Quase. A resposta é..."); a resposta fica guardada |
| Favoritos, desafios, progresso, "continuar de onde parou" | funcionam e sobrevivem a recarregar a página |
| Glossário | busca em português, transliteração, hebraico e explicação ("sal" acha Yam HaMélach) |
| Diário | grava enquanto digita e baixa um .txt |
| Acessibilidade | alvos de 44 px, `aria-pressed`, `aria-live`, foco devolvido ao fechar, `lang="he"` no hebraico, `prefers-reduced-motion`; leitor de tela real **não testado** |

### Fidelidade à marca
Paleta e fontes da plataforma, a rubrica com letra hebraica da capa do site,
nenhuma alteração em `app/`, `worker/` ou `data/`.

## O que preciso de você para seguir

1. **Aprovar ou ajustar a direção** do piloto (PDF e web).
2. **Fotos:** rodar `node tools/baixar-fotos.mjs israel-alem-do-roteiro` numa
   máquina com internet (ou autorizar uma Action para isso), e decidir com o
   advogado sobre as fotos CC BY-SA.
3. **Nikud:** escolher a convenção do livro (a do curso, com daguesh só em
   בּ כּ פּ, ou a ortografia plena).
4. **Hebraico e caixa do autor** do capítulo 1 (`auditoria/hebraico.md`).
5. **Gravações:** הַיָּם הַתִּיכוֹן, יַם הַמֶּלַח, כִּנֶּרֶת e גֶּשֶׁם ainda não têm áudio; podem
   entrar no painel `/admin/gravar` do curso.

Depois da aprovação: aplicar o sistema capítulo a capítulo (fase 5), à medida
que a pesquisa de cada um fechar.

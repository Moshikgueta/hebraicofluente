# Teste A1: o primeiro anúncio pago (Instagram), semana de 27/10/2026

**ADIADO pelo dono em 27/10/2026: "melhor seguir no orgânico".** O plano fica pronto para quando
ele decidir; nada foi gasto. Volta à pauta só com decisão dele (decisão 5 do plano).

Pedido do dono (27/10/2026): anunciar o curso nesta semana, para levar gente ao site e à compra.
Skills usadas: `ads` e `ad-creative`. **Nada é gasto sem o dono:** ele define o teto e aperta o
botão. O plano previa o anúncio só na semana 9, depois de 6 semanas de base; o dono antecipou, e
por isso o teste é pequeno e tem regra de parada escrita antes.

## O que este teste responde

Uma pergunta só: **gente que não nos conhece, vinda de anúncio, chega ao teste grátis e compra a
um custo que se paga?** Não é campanha de escala. Com 7 dias e verba pequena, o resultado provável
são poucas compras (de 0 a 3); o valor está em medir o custo por visita, por checkout e por compra
com o nosso próprio contador.

## As contas que decidem

- Preço: R$ 147 (R$ 132,30 no PIX). Depois da taxa da Mercado Pago, sobram cerca de R$ 125 a 140
  por venda (o valor exato aparece em `/admin/vendas` desde 26/10).
- **Custo máximo por compra para empatar: ~R$ 130.** Acima disso, cada venda dá prejuízo.
- Hipótese (não medida): se 1 a 2% de quem chega pelo anúncio compra, o clique pode custar no
  máximo R$ 1,30 a 2,60. Por isso o clique é o primeiro sinal a olhar.

## Estrutura

- **Onde:** Instagram (feed, Reels e stories), pelo Gerenciador de Anúncios da Meta.
- **Objetivo:** **Tráfego**, otimizado para **cliques no link**. O site não tem pixel (decisão da
  casa: sem analítica de terceiros; pôr pixel pede mudar a Privacidade e a CSP), então a Meta não
  consegue otimizar para compra. Quem mede a compra é o nosso site, pela UTM.
- **Público:** Brasil, 25 a 65+, sem interesses (amplo). O criativo faz a segmentação. Excluir os
  seguidores atuais da @hebraicofluente, para o teste medir gente nova.
- **Uma campanha, um conjunto, 3 anúncios** (um por ângulo).
- **Verba:** proposta de **R$ 40 por dia por 7 dias = R$ 280** (teto do dono; ver Pendências).
  Orçamento no nível da campanha, sem mexer nos primeiros 3 dias.
- **Destino:** a página de venda já no teste grátis do Álef (`#experimente`), que funciona sem
  cadastro e termina no botão do curso.

## Os 3 anúncios

Os três usam conteúdo que já existe e já foi aprovado. O hebraico é todo do curso.

| # | Peça | Ângulo | Por que esta | Campanha na UTM |
|---|---|---|---|---|
| 1 | O Reel de 03/10 ("se você já travou nas letras") | quem já tentou e travou | o maior alcance orgânico do mês (2.347 pessoas, 20 salvamentos, 20 compartilhamentos) | `a1-reel-travou` |
| 2 | O carrossel do Shin, da série "O erro do brasileiro" | quem quer ler de verdade | o post que ensina é o mais salvo | `a1-carrossel-shin` |
| 3 | O carrossel "3 palavras que você já fala em hebraico" | curiosidade, fé e Israel | reconhecimento imediato (amém, sábado, Jerusalém) | `a1-carrossel-palavras` |

O 3 depende de o dono aprovar os fatos de origem do carrossel. Sem ele, entra o carrossel
"7 coisas sobre o hebraico" (19/10: 22 salvamentos), com a campanha `a1-carrossel-7coisas`.

### Os links (um por anúncio, para saber qual vendeu)

```
https://hebraicofluente.com.br/curso-de-hebraico/?utm_source=instagram&utm_medium=paid&utm_campaign=a1-reel-travou#experimente
https://hebraicofluente.com.br/curso-de-hebraico/?utm_source=instagram&utm_medium=paid&utm_campaign=a1-carrossel-shin#experimente
https://hebraicofluente.com.br/curso-de-hebraico/?utm_source=instagram&utm_medium=paid&utm_campaign=a1-carrossel-palavras#experimente
```

`utm_medium=paid` faz o site contar a visita como **Anúncio** (`lib/origem.ts`), e o pedido guarda
a campanha (`/admin/vendas`).

### Os textos

Botão: **Saiba mais** (não "Comprar": a página começa pelo teste grátis).

**Anúncio 1 (Reel).** Título: *Leia hebraico do zero, em português.*
> Se você já travou nas letras do hebraico, o problema não era você. Aqui você aprende uma letra
> de cada vez, ouve a pronúncia gravada por um professor israelense e o curso te corrige na hora.
> Faça a primeira letra agora, de graça e sem cadastro.

**Anúncio 2 (carrossel Shin).** Título: *Você lê שָׁלוֹם como "salóm"?*
> A maioria dos brasileiros lê o ש como S. É "sh", como em "chave": shalóm. No curso, você aprende
> as 22 letras assim: uma por vez, com o erro mais comum de quem fala português já explicado.
> Comece pela primeira letra, de graça.

**Anúncio 3 (carrossel palavras).** Título: *Você já fala 3 palavras em hebraico.*
> Amém, sábado e Jerusalém vêm do hebraico. Que tal ler cada uma no original? O curso ensina o
> alfabeto do zero, em português, uma letra por vez. Faça a primeira lição grátis, sem cadastro.

Regras do texto: sem escassez (o preço de pré-lançamento não tem data), sem número de alunos, sem
"aprenda em X dias", e a promessa é ler, não falar nem traduzir.

## O que medir e onde

| Sinal | Onde | Quando olhar |
|---|---|---|
| CTR do link e custo por clique, por anúncio | Gerenciador de Anúncios | dia 3 |
| Visitas da página de venda vindas de Anúncio | `/admin/estatisticas`, "Crescimento por origem", linha Anúncio | dia 3 e dia 7 |
| Checkout aberto, passo da conta e pagamento | a mesma linha | dia 7 |
| Pedidos e compras, com a campanha (qual anúncio) | `/admin/vendas` | dia 7 |
| Teste grátis concluído | "Teste grátis da capa" (não separa por origem: comparar com a semana anterior) | dia 7 |

## Regras escritas antes de começar

- **Dia 3 (só o clique):** anúncio com custo por clique acima de **R$ 2,50** e CTR do link abaixo de
  **0,7%** sai; a verba fica com os outros. Os 3 ruins: pausa tudo e revemos o criativo.
- **Dia 7 (o teste inteiro):**
  - custo por compra até **R$ 130**: deu certo; repete por mais 7 dias com o anúncio vencedor e
    2 variações novas dele;
  - nenhuma compra, mas custo por checkout aberto até **R$ 40**: sinal fraco, um segundo ciclo só
    se o dono quiser;
  - nenhuma compra e checkout acima de R$ 40: para, e o próximo passo é a página, não o anúncio.
- **Nunca** aumentar a verba mais de 20% de uma vez nem mexer nos primeiros 3 dias.

Os limites (R$ 2,50, 0,7%, R$ 40, R$ 130) são escolha minha, a partir do preço; o dono pode
mudá-los antes de começar, nunca depois.

## Passo a passo para o dono (Gerenciador de Anúncios)

1. **business.facebook.com → Gerenciador de Anúncios → Criar.**
2. Objetivo: **Tráfego**. Nome: `META_Trafego_Amplo_TesteGratis_2026-10`.
3. Orçamento da campanha: **R$ 40 por dia** (ou o teto escolhido), com data de fim em 7 dias.
4. Conjunto de anúncios: local do tráfego **Site**; meta de desempenho **Maximizar cliques no
   link**; local **Brasil**; idade **25 a 65+**; sem interesses; em "Excluir", os seguidores da
   @hebraicofluente (Público personalizado → Envolvimento no Instagram → seguidores).
5. Posicionamentos: **Advantage+** (automáticos).
6. Anúncios: **usar publicação existente** para o Reel de 03/10 e para os carrosséis depois de
   publicados (aproveita as curtidas e comentários já ganhos); colar o link com a UTM de cada um e
   o texto acima.
7. Revisar e **Publicar**. A Meta aprova em algumas horas.

Alternativa mais simples (menos controle): no app do Instagram, **Turbinar** o Reel de 03/10 com
destino **Site** e o link 1. Não permite excluir seguidores nem comparar os 3 anúncios.

## Pendências

- [ ] **Dono define o teto** (decisão 5 do plano): R$ 280 em 7 dias é a proposta.
- [ ] Dono aprova os 3 textos.
- [ ] Os carrosséis do Shin (28/10) e das palavras precisam estar publicados no perfil antes de
      virar anúncio (ou sobem como anúncio novo com as imagens do zip).
- [ ] Dia 3 e dia 7: o dono me manda o print do Gerenciador e eu aplico as regras.

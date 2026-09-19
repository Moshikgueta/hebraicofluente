# Handoff: Hebraico Fluente — Landing page + Plataforma de curso

## Overview

Hebraico Fluente é uma plataforma de ensino de hebraico para falantes de português brasileiro. O primeiro produto é o curso **Alfabetização Hebraica** (22 letras, nikud, leitura), mas a marca é desenhada como um ecossistema que depois inclui Hebraico A1, A2, Conversação, Gramática, Leitura e Cultura israelense.

Este pacote contém dois designs:

1. **Landing page pública** — página de conversão, 14 seções, da navegação ao CTA final.
2. **Plataforma logada** — painel, mapa do curso, tela de lição (7 tipos de atividade), revisão e progresso.

Os dois devem parecer o mesmo produto: mesma paleta, mesma tipografia, mesmos raios, mesmas sombras, mesmos estados de interação.

---

## About the Design Files

Os arquivos `Landing.dc.html` e `Plataforma.dc.html` deste pacote são **referências de design criadas em HTML** — protótipos que mostram a aparência e o comportamento pretendidos. **Não são código de produção para copiar diretamente.**

A tarefa é **recriar estes designs no ambiente existente do codebase de destino** (React, Next.js, Vue, SwiftUI, nativo, etc.), usando os padrões, bibliotecas e convenções já estabelecidos ali. Se ainda não existe um ambiente, escolha o framework mais apropriado para o projeto e implemente os designs nele.

Detalhes específicos sobre os arquivos:

- Eles usam um runtime de protótipo próprio (`<x-dc>`, `sc-for`, `sc-if`, `renderVals()`). **Ignore completamente essa camada.** `sc-for` é um `.map()`, `sc-if` é uma renderização condicional, `renderVals()` é onde vivem os dados e os handlers.
- Todo o estilo está **inline**, por exigência do ambiente de protótipo. No codebase real, use a solução de estilo que já existe (Tailwind, CSS Modules, styled-components, etc.). Os valores exatos estão documentados em **Design Tokens** abaixo.
- Algumas partes da UI são construídas com `React.createElement` dentro da classe de lógica (os painéis das abas na landing, o corpo das atividades da lição na plataforma). Isso é uma limitação do protótipo, não uma recomendação. **Escreva tudo como markup normal.**
- Abra os dois arquivos em um navegador para ver as animações e os fluxos clicáveis funcionando. Vale fazer isso antes de começar.

---

## Fidelity

**Alta fidelidade (hifi).** Cores, tipografia, espaçamento, raios, sombras, timings de animação e copy estão finais. Recrie pixel a pixel usando as bibliotecas e padrões do codebase.

Duas exceções, marcadas visivelmente no próprio design:

- **Preço**: exibido como `R$ XXX` / `12× de R$ XX`. Valores reais ainda não definidos.
- **Depoimentos e retrato do professor**: cartões com estrutura final e conteúdo marcado como reservado. Substituir por conteúdo real.

---

## Design Tokens

Todos os valores usados nos dois arquivos. Nada fora desta lista.

### Cores

| Token | Hex | Uso |
| --- | --- | --- |
| `--navy` | `#0E3B43` | Primária. Botões principais, blocos escuros, sidebar, texto de destaque. |
| `--navy-2` | `#155059` | Hover da primária. |
| `--teal` | `#1F8A7D` | Progresso, acerto, ícones de check, bordas ativas. |
| `--teal-soft` | `#E4F1EE` | Fundos tingidos de acerto/progresso. |
| `--teal-ink` | `#12665C` | Texto sobre `--teal-soft`. |
| `--gold` | `#B8862F` | Sequência (streak), revisão pendente. |
| `--gold-soft` | `#F7EFDF` | Fundo de revisão e de resposta incorreta. |
| `--gold-ink` | `#8A6520` | Texto sobre `--gold-soft`. |
| `--cream` | `#FBF9F5` | Fundo da página. |
| `--sand` | `#F3F0E9` | Seções alternadas, trilhos de barra de progresso, fundos de cartão neutro. |
| `--ink` | `#1B211F` | Texto principal (nunca preto puro). |
| `--muted` | `#66716D` | Texto secundário. |
| `--line` | `#E4E0D6` | Bordas de cartão e divisórias. |
| `--card` | `#FFFFFF` | Superfície de cartão. |

Cores auxiliares que aparecem no código:

- `#8FD6C8` — teal claro, usado apenas sobre fundo navy (texto de rótulo, ícones, gradiente de barra).
- `#BFE0D8` — borda de cartão em estado "dominada".
- `#EADCC0` — borda de cartão em estado "revisar".
- `#A8AFAB` — texto e ícones de estado bloqueado.
- `#7A5A1C` / `#2C5F58` — texto de corpo dentro das caixas de feedback gold/teal.
- `#12181A` — chassi do mockup de celular.

**Não há vermelho no sistema.** Resposta incorreta usa gold (`--gold-soft` / `--gold-ink`), nunca vermelho, e sempre acompanhada de ícone e texto ("Quase.") — nunca cor sozinha.

### Tipografia

Três famílias, todas do Google Fonts.

| Família | Uso | Pesos |
| --- | --- | --- |
| **Bricolage Grotesque** | Display: todos os `h1`–`h3`, números grandes de estatística, títulos de cartão. | 400, 500, 600, 700 (variável, `opsz 12..96`) |
| **Instrument Sans** | Corpo, UI, botões, rótulos, navegação. Fonte padrão do `body`. | 400, 500, 600 |
| **Noto Serif Hebrew** | **Todo** texto em hebraico, sem exceção. | 400, 500, 600 |

```
https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700&family=Instrument+Sans:wght@400;500;600&family=Noto+Serif+Hebrew:wght@400;500;600&display=swap
```

Regras de display (classe `.dsp` no protótipo):

- `font-weight: 600` em praticamente todos os títulos.
- `letter-spacing` negativo, proporcional ao tamanho: `-0.036em` no h1 do hero, `-0.03em` nos h2 de seção, `-0.025em` nos h3, `-0.018em` nos títulos pequenos de cartão.
- `line-height` entre `1.02` e `1.12` nos títulos.
- `text-wrap: balance` em todos os títulos longos.

Escala de tamanhos realmente usada:

| Papel | Tamanho |
| --- | --- |
| H1 hero | `clamp(40px, 5.1vw, 62px)` |
| H2 seção | `clamp(30px, 3.7vw, 44px)` |
| H2 CTA final | `clamp(28px, 3.9vw, 46px)` |
| H2 plataforma | `31px` |
| H3 / título de cartão grande | `19–30px` |
| Corpo grande (subtítulo de hero) | `19.5px`, `line-height 1.6` |
| Corpo | `16–18px`, `line-height 1.55–1.65` |
| Corpo pequeno / metadados | `13.5–15px` |
| Rótulo maiúsculo | `12.5–13px`, `font-weight 700`, `letter-spacing 0.1em`, `text-transform: uppercase` |
| Base do documento | `17px` / `1.55` |

### Tipografia hebraica — regras obrigatórias

Este é o ponto onde a maioria das implementações erra. Cada trecho de hebraico precisa de:

```css
.he {
  font-family: "Noto Serif Hebrew", serif;
  direction: rtl;
  unicode-bidi: isolate;
}
```

- `unicode-bidi: isolate` é o que impede que o hebraico inline dentro de uma frase em português vire a pontuação e os números ao redor. Obrigatório em **todo** span de hebraico misturado em texto latino.
- **Nikud sempre** no conteúdo de ensino. As palavras aparecem vocalizadas (`שָׁלוֹם`, `מַיִם`, `מִשְׁפָּחָה`), nunca sem os sinais. Noto Serif Hebrew foi escolhida especificamente porque posiciona nikud corretamente — a maioria das webfonts hebraicas não posiciona. **Não substitua a família sem verificar o nikud renderizado.**
- Nunca inverta strings manualmente para simular RTL. O navegador faz isso.
- Hebraico em corpo grande precisa de `line-height` maior que o latino: `1.35–1.4` em vez de `1.1–1.2`, para o nikud não colidir com a linha acima.
- Letras isoladas grandes (a letra da lição, 76–150px) usam `line-height: 1.1–1.15`.

### Espaçamento

Sem escala formal; os valores em uso, em px:

- Padding interno de cartão: `20`, `22`, `24`, `26`.
- Padding de cartão grande / bloco escuro: `30`, `34`, `38`, `44`, `48`, `52`.
- Gap de grade: `10`, `12`, `14`, `16`, `18`.
- Gap entre colunas de seção: `34`, `40`, `52`, `56`, `60`.
- Padding vertical de seção (landing): `88–96px`.
- Padding horizontal de container: `28px`; largura máxima `1200px` (landing), `1280px` (plataforma), `820px` (FAQ).

### Raio de borda

| Elemento | Raio |
| --- | --- |
| Pílula / tag / barra de progresso | `100px` |
| Botão pequeno, ícone quadrado, chip de letra | `8–12px` |
| Botão padrão | `13–14px` |
| Cartão | `16–18px` |
| Cartão grande / bloco escuro | `20–24px` |
| Bloco de destaque, seção CTA | `26–30px` |
| Chassi de celular | `46px` externo, `36px` interno |

### Sombras

Uma só sombra base, reutilizada:

```css
--sh: 0 1px 2px rgba(27,33,31,.04), 0 8px 24px -12px rgba(27,33,31,.14);
```

Variantes pontuais:

- Mockup do hero: `0 2px 4px rgba(27,33,31,.04), 0 30px 60px -28px rgba(14,59,67,.32)`
- Cartão de preço: `0 2px 4px rgba(27,33,31,.04), 0 34px 70px -40px rgba(14,59,67,.3)`
- Celular: `0 2px 6px rgba(27,33,31,.1), 0 44px 80px -40px rgba(14,59,67,.5)`
- Aba ativa: `0 1px 2px rgba(27,33,31,.06), 0 4px 10px -6px rgba(27,33,31,.2)`

Sombras são suaves e tingidas de tinta/navy. Nunca preto puro.

### Gradientes

Usados com parcimônia, só em três lugares:

- Preenchimento de barra de progresso: `linear-gradient(90deg, #1F8A7D, #8FD6C8)` — na plataforma; `linear-gradient(90deg, var(--teal), #2FB39F)` no hero da landing.
- Brilho ambiente do hero: `radial-gradient(120% 90% at 82% -10%, #EAF4F1 0%, rgba(234,244,241,0) 58%)`.
- Brilho dentro de blocos navy: `radial-gradient(90% 120% at 50% 0%, rgba(143,214,200,.15), transparent 62%)`.

Nada de gradiente em botão, cartão ou fundo de seção.

---

## Animation

### Filosofia

Rápida, sutil, com propósito. Nada se move sem motivo. Duas curvas de easing cobrem quase tudo:

- `cubic-bezier(.2,.7,.3,1)` — entradas e revelações.
- `cubic-bezier(.3,.8,.3,1)` — preenchimento de barras e mudanças de altura.

Durações: micro-interação `.18–.22s`, revelação `.5–.6s`, barra de progresso `.7–1.3s`.

### Keyframes definidos

```css
@keyframes hf-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
@keyframes hf-pulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.11);opacity:.72} }
@keyframes hf-xp   { 0%{opacity:0;transform:translateY(6px) scale(.9)} 25%{opacity:1;transform:translateY(-4px) scale(1)} 100%{opacity:0;transform:translateY(-34px) scale(1)} }
@keyframes hf-pop  { 0%{transform:scale(.82);opacity:0} 60%{transform:scale(1.06);opacity:1} 100%{transform:scale(1);opacity:1} }
@keyframes hf-rise { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
@keyframes hf-spark{ 0%{transform:scale(0) rotate(0);opacity:0} 45%{transform:scale(1) rotate(22deg);opacity:1} 100%{transform:scale(.7) rotate(40deg);opacity:0} }
```

### prefers-reduced-motion

Obrigatório. O protótipo faz duas coisas:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration:.001ms !important; transition-duration:.001ms !important; }
}
```

E, no JS, quando `matchMedia("(prefers-reduced-motion: reduce)").matches`:

- A sequência do hero roda com todos os delays em `0ms` (estado final imediato, sem encenação).
- Todos os elementos com revelação por scroll são revelados na hora, sem `IntersectionObserver`.

### Revelação por scroll

`IntersectionObserver` com `rootMargin: "0px 0px -12% 0px"`, `threshold: 0.1`, e `unobserve` após disparar (roda uma vez só). Estado inicial `opacity: 0; transform: translateY(16–18px)`; estado final `opacity: 1; transform: none`. Cartões de uma mesma grade escalonam com `transition-delay` de `55–80ms` por índice.

A linha do método usa a mesma mecânica, mas anima `transform: scaleX(0) → scaleX(1)` com `transform-origin: left` e `transition: 1.1s`.

---

## Landing page — `Landing.dc.html`

Largura máxima `1200px`, padding horizontal `28px`. Seções separadas por `96px` de padding vertical; seções com fundo `--sand` usam `88px` e têm borda de `1px solid var(--line)` em cima e embaixo.

### 1. Navegação

Sticky no topo, `z-index: 100`. Fundo `rgba(251,249,245,.82)` com `backdrop-filter: blur(14px) saturate(140%)` — fica translúcida ao rolar. Borda inferior `1px solid rgba(228,224,214,.8)`.

- Logo: quadrado `34×34`, `border-radius: 10px`, fundo `--navy`, com a letra `ע` em `#8FD6C8`, `font-size: 20px`, `margin-top: -2px` para centrar opticamente. Ao lado, "Hebraico Fluente" em Bricolage 600 / `18px` / `-0.02em`.
- Links: Como funciona, O curso, Metodologia, Sobre, Dúvidas. `15px`, cor `--muted`, hover `--ink`. Gap `26px`.
- "Entrar": link de texto, `--muted`.
- "Começar agora": botão `--navy`, texto branco, 600, `15px`, padding `11px 20px`, raio `11px`, sombra `--sh`. Hover: `background: --navy-2` e `translateY(-1px)`, transição `.18s`.

### 2. Hero

Grade `minmax(0,1.04fr) minmax(0,1fr)`, gap `60px`, `align-items: center`, padding `78px 28px 96px`. Brilho radial atrás, `pointer-events: none`.

**Coluna esquerda**, animada em sequência no load:

| Etapa | Delay | O que entra |
| --- | --- | --- |
| 1 | `120ms` | Badge + H1 (`opacity 0→1`, `translateY 20px→0`, `.6s`) |
| 2 | `420ms` | Parágrafo de apoio (`translateY 16px→0`, `.6s`, delay interno `.12s`) |
| 3 | `720ms` | Botões (`translateY 14px→0`, `.5s`) e indicadores de confiança (`.5s`, delay `.4s`) |
| 4 | `1000ms` | Mockup (`translateY 26px→0`, `.7s`) e barra do mockup anima `0% → 72%` em `1.3s` |
| 5 | `1900ms` | Resposta "SH" vira estado de acerto, `+10 XP` sobe e some, streak muda de 6 para 7 |

Depois disso o hero fica estático, exceto os dois cartões flutuantes.

- Badge: `--teal-soft`, texto `#12665C`, `13.5px` 600, pílula, com um ponto `6×6` em `--teal` antes do texto.
- H1: `Do א ao hebraico de verdade.` — o `א` é `.he`, cor `--teal`.
- Subtítulo: `Aprenda a ler, entender e avançar no hebraico com explicações em português, exercícios interativos e uma jornada de estudos clara.` `19.5px`, `--muted`, `max-width: 44ch`.
- CTA primário: "Começar a aprender" — `--navy`, branco, `17px` 600, padding `15px 28px`, raio `13px`. Hover `--navy-2` + `translateY(-2px)`.
- CTA secundário: "Ver como funciona" — fundo branco, borda `--line`, raio `13px`. Hover borda `#C9C3B4` + `translateY(-2px)`.
- Indicadores de confiança: Acesso imediato · No seu ritmo · Feito para brasileiros · Curso interativo. `14.5px`, `--muted`, cada um com um check SVG `15×15` em `--teal`, `stroke-width 1.9`.

**Coluna direita — mockup de lição:**

Cartão branco, borda `--line`, raio `26px`, padding `26px 24px 24px`, `z-index: 2`.

- Topo: seta de voltar, barra de progresso `7px` de altura (trilho `--sand`, preenchimento gradiente teal), `72%` em `13px` 600 `--teal`, `font-variant-numeric: tabular-nums`.
- Pergunta: "Qual é o som desta letra?" `15px` `--muted`.
- Bloco `--sand`, raio `18px`, padding `26px 20px`, centralizado: a letra `ש` em `88px`, `--navy`, com `hf-pop .5s`. Abaixo, botão "Ouvir": pílula branca com borda, e um ponto `9×9` em `--teal` com `hf-pulse 1.5s infinite`.
- Grade 2×2 de respostas: SH / M / L / V. Quando a etapa 5 dispara, a opção SH muda para borda `--teal`, fundo `--teal-soft`, texto `#12665C`, e revela um `✓` com `transition: opacity .3s ease .1s`. Transição geral `.35s`.
- `+10 XP`: posicionado `right: 26px; bottom: 96px`, `17px` 700 `--teal`, `pointer-events: none`, animação `hf-xp 2.1s ease-out .15s both`.

**Cartões flutuantes**, `z-index: 3`, ambos brancos com borda `--line`, raio `16px`, sombra `--sh`:

- Sequência: `top: -22px; right: -14px`, ícone de chama em `--gold-soft`, texto "Sequência" / "7 dias". `hf-float 5.5s ease-in-out infinite`.
- Lição concluída: `left: -26px; bottom: 56px`, ícone de check em `--teal-soft`, "Lição concluída" / "5 novas letras". `hf-float 6.5s ease-in-out .8s infinite` — offset de `.8s` para os dois não pulsarem juntos.

### 3. Problema (`#como`)

Fundo `--sand`. H2: "Aprender hebraico não deveria parecer um quebra-cabeça."

Quatro cartões em `repeat(auto-fit, minmax(235px,1fr))`, gap `16px`. Cada um: branco, borda `--line`, raio `18px`, padding `26px 24px`, com um selo `36×36` raio `11px` fundo `--sand` contendo o número (`01`–`04`) em 700 `14px` `--muted`. Texto em `17px` 500. Revelação escalonada `0/80/160/240ms`. Hover adiciona `--sh`.

Copy, verbatim:
1. As letras parecem todas iguais.
2. Você não sabe por onde começar.
3. Os materiais explicam hebraico, mas não pensando em brasileiros.
4. Você assiste vídeos, mas sente que não existe uma sequência.

Depois, a virada: barra vertical de `3px` em `--teal` à esquerda de "Por isso criamos um caminho claro, progressivo e pensado para quem fala português." em Bricolage 500 `22px`.

### 4. Demonstração do produto (`#curso`)

H2 "Veja como você vai aprender."

**Abas** — controle segmentado: contêiner `--sand` com borda `--line`, raio `14px`, padding `4px`. Aba ativa: fundo branco, texto `--navy`, sombra de aba ativa. Inativa: transparente, `--muted`. Transição `.22s`.

Quatro abas: Aula · Prática · Revisão · Progresso.

**Painel** — bloco `--navy`, raio `26px`, padding `34px`, grade `minmax(0,1fr) minmax(0,420px)`, gap `40px`.

Esquerda (muda por aba): tag em `rgba(255,255,255,.1)` com texto `#8FD6C8`; H3 `30px` branco; parágrafo `rgba(255,255,255,.72)`; três bullets com check `#8FD6C8`.

Direita: cartão branco, raio `20px`, `min-height: 330px`, conteúdo diferente por aba:

- **Aula**: letra `שׁ` a `76px` em bloco `--sand`, nome "Shin", som `/ʃ/ — como o CH de «chave»`, explicação do ponto à direita.
- **Prática**: "Qual som você ouviu?", botão de áudio com ponto pulsante, grade 2×2 (ש SH marcado como correto / ס S / צ TS / ז Z).
- **Revisão**: "4 letras precisam voltar" — lista de ס Sámech, ע Áyin, ט Tet, ח Het, cada uma com o motivo e uma tag "Revisar" em gold.
- **Progresso**: três números (42% do curso, 9 letras firmes, 7 dias seguidos) e o mapa das 22 letras em chips `30×30` coloridos por estado.

### 5. Método (`#metodo`)

H2 "Um método simples para transformar símbolos em leitura."

Linha horizontal de `2px` em `linear-gradient(90deg, var(--teal), #8FD6C8)`, posicionada `top: 27px`, animada `scaleX(0) → scaleX(1)` a partir da esquerda em `1.1s` quando entra na viewport.

Seis passos em `repeat(auto-fit, minmax(150px,1fr))`, gap `18px`, escalonados de `70ms` em `70ms`. Cada um: círculo-quadrado `56×56`, raio `16px`, fundo branco, borda `1.5px solid --teal`, número em 700 `18px` `--teal`; título Bricolage 600 `19px`; descrição `15px` `--muted`.

1. **Reconheça** — A forma isolada, grande, sem distração.
2. **Ouça** — O som gravado por falante nativo.
3. **Associe** — A comparação com um som do português.
4. **Pratique** — Cinco tipos de exercício, alternados.
5. **Leia** — A letra dentro de uma palavra real.
6. **Revise** — Ela volta depois, no intervalo certo.

### 6. Currículo

H2 "O que você estuda, módulo a módulo." Seis acordeões empilhados com gap `10px`. Só um aberto por vez; o módulo 1 começa aberto.

Cartão fechado: borda `--line`, sem sombra, selo do número em `--sand`/`--muted`. Aberto: borda `--teal`, sombra `--sh`, selo em `--teal-soft`/`#12665C`. Chevron gira `0deg → 180deg` em `.28s`. Corpo expande via `max-height: 0 → 260px` em `.34s`. As letras do módulo aparecem em hebraico `21px` `--muted` no cabeçalho, alinhadas à direita.

| Nº | Título | Meta | Letras | Competências |
| --- | --- | --- | --- | --- |
| 01 | Primeiros sons e letras | 4 lições · ~2h | מ ת א נ | Reconhecer as 4 primeiras formas · Ler sílabas simples · Primeiras 12 palavras |
| 02 | Construindo sílabas | 3 lições · ~1h30 | ה י ל | Juntar consoante e vogal · Ler sem soletrar · Palavras de duas sílabas |
| 03 | Nikud e vogais | 3 lições · ~2h | בָּ בֵּ בִּ | Os cinco sinais principais · Sheva e sua função · Ler qualquer sílaba vocalizada |
| 04 | Palavras reais | 2 lições · ~1h30 | ש ר ד | Vocabulário do dia a dia · Palavras-ponte do português · Leitura de frases curtas |
| 05 | Leitura | 1 lição · ~1h | ח ט ע | Textos curtos vocalizados · Ritmo e pausa · Leitura em voz alta |
| 06 | Revisão e consolidação | 1 lição · ~1h | ב כ פ | As letras que mudam de som · Revisão geral das 22 · Avaliação final de leitura |

### 7. Jornada do aluno

Fundo `--sand`. H2 "Seu hebraico começa aqui. Não termina aqui."

Cinco cartões em `repeat(auto-fit, minmax(176px,1fr))`, gap `14px`, escalonados `70ms`. O primeiro é o estado desbloqueado: fundo `--navy`, texto branco, tag `#8FD6C8`, ícone de check. Os outros quatro: fundo branco, borda `--line`, tag `#9AA29E`, ícone de cadeado.

1. **Disponível** — Alfabetização Hebraica — Ler as 22 letras e o nikud.
2. **Em breve** — Hebraico A1 — Primeiras frases, presente, perguntas.
3. **Em breve** — Hebraico A2 — Passado e futuro, textos curtos.
4. **Em breve** — Conversação — Falar sobre o dia a dia com fluidez.
5. **Em breve** — Níveis avançados — Gramática, leitura e cultura israelense.

### 8. Professor (`#sobre`)

Grade `minmax(0,340px) minmax(0,1fr)`, gap `56px`.

Esquerda: slot de retrato, `aspect-ratio: 4/5`, raio `22px`, fundo `--sand`, borda `--line`, com ícone de pessoa e a legenda "Retrato profissional do professor entra aqui". **Substituir por foto real.**

Direita: rótulo "Quem criou o Hebraico Fluente" em `--teal`; H2 "Moshik Gueta"; parágrafo de contexto; a frase-chave em Bricolage 500 `21px`: "O método nasceu da experiência de ensinar hebraico especificamente para quem fala português."; e quatro credenciais com check, em grade de duas colunas:

- Experiência ensinando hebraico no Brasil
- Atuação como shaliach da Agência Judaica
- Formação acadêmica e pedagógica em ensino de idiomas
- Alunos de diferentes países e níveis

### 9. Recursos

Oito cartões em `repeat(auto-fit, minmax(230px,1fr))`, gap `14px`, escalonados `55ms`. Cada um: branco, borda `--line`, raio `18px`, padding `24px 22px`, ícone `40×40` raio `12px` fundo `--teal-soft`. Hover: `--sh` + borda `#D3CEC0`.

**Ícones são SVG de traço, 19×19, `viewBox 0 0 20 20`, `stroke #1F8A7D`, `stroke-width 1.5`, `stroke-linecap/linejoin: round`.** Sem emoji. No codebase, use o icon set já existente e mantenha peso e tamanho equivalentes.

1. Áudio e pronúncia — Cada letra, sílaba e palavra gravada por falante nativo.
2. Correção imediata — Você sabe na hora se acertou — e por que errou.
3. Sequência de estudos — Um lembrete por dia, no horário que você escolher.
4. Progresso visual — Percentual por módulo e mapa de domínio das letras.
5. Revisão inteligente — O que escapa volta sozinho, no intervalo certo.
6. Estude no celular — Uma atividade por tela, botão de continuar sempre à mão.
7. Explicações em português — Comparações com o som que você já conhece, sempre.
8. Hebraico desde o zero — Nenhum conhecimento prévio. Começa na primeira letra.

### 10. Aula de amostra (`#aula`) — interativa

Bloco `--navy`, raio `30px`, padding `52px 44px`, grade `minmax(0,1fr) minmax(0,440px)`, gap `52px`.

Esquerda: H2 "Experimente antes de começar.", parágrafo, e CTA branco "Experimentar uma aula grátis".

Direita: cartão branco raio `22px`. Rótulo "Lição 3 · Reconhecimento". Pergunta "Qual letra representa o som SH?" em Bricolage 600 `22px`. Grade 2×2: ש Shin (correta) · מ Mem · ל Lámed · ב Bet. Cada opção é um botão com letra hebraica `44px` e nome `13px`, borda `2px`, raio `16px`. Hover `translateY(-2px)`.

- **Correta**: fundo `--teal-soft`, borda `--teal`. Feedback: caixa `--teal-soft` com check, "Muito bem!" em 700 `16px` `#12665C`, "+10 XP" alinhado à direita, e a explicação "Shin é a única com o ponto em cima à direita. É esse ponto que faz o som SH."
- **Incorreta**: fundo `--gold-soft`, borda `#D9B872`. Feedback: caixa `--gold-soft` com ícone de alerta, "Quase." em `#8A6520`, e o texto "{Nome} tem outro som. Procure a letra de três hastes, com um ponto em cima à direita — pode tentar de novo." Permite nova tentativa.
- Ambas as caixas entram com `hf-pop .34s`.
- Área de feedback tem `min-height: 74px` para o layout não pular.

### 11. Depoimentos

H2 "Quem já está lendo." Logo abaixo, em `--gold` 600 `15px`: "Espaço reservado — os cartões abaixo mostram o formato; os depoimentos reais entram no lugar."

Três cartões, gap `16px`, escalonados `80ms`. Estrutura de cada um: avatar circular `42×42` com iniciais (fundos alternados `--teal-soft` / `--gold-soft` / `#EAEEF0`), nome 600 `16px`, contexto `13.5px` `--muted`, uma tag de resultado em pílula `--teal-soft`, e a citação em `15.5px` `--muted`.

**Substituir por depoimentos reais.** Manter a estrutura: foto ou iniciais, primeiro nome, contexto curto, resultado específico, citação curta.

### 12. Preço (`#preco`)

Cartão branco, borda `--line`, raio `30px`, sombra de preço, padding `48px 44px`, grade `minmax(0,1fr) minmax(0,330px)`, gap `52px`.

Esquerda: tag "Curso 1 de uma trilha" em `--teal-soft`; H2 "Curso de Alfabetização Hebraica"; parágrafo; seis itens inclusos com check, em duas colunas:

- Curso completo, 14 lições
- Exercícios interativos
- Áudios de todas as letras e palavras
- Revisões liberadas automaticamente
- Acesso à plataforma, no celular e no computador
- Progresso salvo, retoma de onde parou

Direita: bloco `--sand` raio `22px`, centralizado. "Acesso completo" / **`R$ XXX`** em Bricolage 600 `48px` / "ou 12× de R$ XX" / botão `--navy` "Começar agora" / nota "Valores a definir. Acesso imediato após a confirmação."

**Sem urgência artificial.** Sem contador, sem vagas, sem preço riscado.

### 13. FAQ (`#duvidas`)

Container estreito, `max-width: 820px`. Oito acordeões, gap `8px`, todos fechados por vez (só um aberto). Fechado: borda `--line`. Aberto: borda `--teal`. Chevron gira `180deg` em `.28s`; corpo expande `max-height: 0 → 190px` em `.32s`.

1. **Preciso saber hebraico?** Não. O curso começa do zero absoluto, na primeira letra, e assume que você nunca viu o alfabeto.
2. **É hebraico moderno ou bíblico?** A leitura é a mesma. O curso usa a pronúncia do hebraico moderno e vocabulário do dia a dia, o que abre os dois caminhos.
3. **Quanto tempo leva?** Cerca de 9 horas de conteúdo, distribuídas em 14 lições. Em vinte minutos por dia, a maioria termina em seis a oito semanas.
4. **O curso funciona no celular?** Sim. A plataforma foi desenhada primeiro para o celular: uma atividade por tela e botão de continuar fixo.
5. **Tem áudio?** Cada letra, sílaba e palavra tem áudio gravado por falante nativo, com repetição livre.
6. **Por quanto tempo tenho acesso?** Acesso vitalício, incluindo as atualizações que forem feitas no curso.
7. **Posso estudar no meu ritmo?** Sim. Não há turmas nem prazos. O progresso fica salvo e você retoma exatamente de onde parou.
8. **O que acontece depois que termino?** Você entra na trilha: Hebraico A1 é o próximo nível. Alunos da Alfabetização são avisados primeiro quando ele abre.

### 14. CTA final

Bloco `--navy`, raio `30px`, padding `72px 48px`, centralizado, com brilho radial `#8FD6C8` a 15% vindo do topo.

Três palavras em hebraico lado a lado, cada uma com transliteração em `#8FD6C8` e tradução em `rgba(255,255,255,.62)`: שָׁלוֹם shalom olá, paz · תּוֹדָה todá obrigado · מַיִם máyim água.

H2 `clamp(28px,3.9vw,46px)` branco, `max-width: 19ch`: "A próxima palavra em hebraico pode ser a primeira que você realmente consegue ler."

CTA branco: "Começar meu hebraico".

### Rodapé

Logo pequeno (`28×28`), "Hebraico Fluente", "@hebraicofluente", e à direita Termos · Privacidade · Contato. `14.5px` `--muted`.

---

## Plataforma — `Plataforma.dc.html`

O arquivo tem um seletor de visualização no topo (Painel / Mapa do curso / Lição / Revisão / Progresso) — isso é **andaime de apresentação**, para revisar as telas em um só arquivo. No app real, isso vira roteamento.

### Navegação (sidebar, desktop)

Coluna de `248px`, fundo `--navy`, padding `26px 18px`. Logo no topo. Itens com ícone `17×17` de traço, `15px`, gap `11px`, padding `10px 12px`, raio `11px`.

- Ativo: fundo `rgba(255,255,255,.12)`, texto `#FFFFFF` 600, ícone `#8FD6C8`.
- Inativo: transparente, texto `rgba(255,255,255,.66)`, ícone `rgba(255,255,255,.55)`.

Itens: Início · Meu curso · Revisão (com badge `5` em `--gold`) · Progresso · Biblioteca · Perfil.

No rodapé da sidebar, um bloco `rgba(255,255,255,.07)` raio `14px`: "Próximo nível / Hebraico A1 / Liberado quando você concluir a Alfabetização."

**No mobile isso vira bottom navigation.** Itens principais: Início, Meu curso, Revisão, Progresso, Perfil.

### Tela: Painel

Cabeçalho: "Olá, Rafael 👋" em Bricolage 600 `31px` + "Continue de onde você parou." À direita, pílula de sequência em `--gold-soft` com ícone de chama e "7 dias seguidos" em 700 `15px` `--gold-ink`.

**Cartão principal** — `--navy`, raio `20px`, padding `30px 30px 26px`, com brilho radial. Grade `minmax(0,1fr) auto`.
- Rótulo "CURSO EM ANDAMENTO" em `#8FD6C8`.
- Título "Alfabetização Hebraica" Bricolage 600 `25px` branco.
- Subtítulo "Módulo 3 · Lição 7 — Nikud: as vogais longas".
- Barra de `8px`, trilho `rgba(255,255,255,.15)`, preenchimento gradiente teal, anima `0% → 42%` em `1.2s` com `260ms` de atraso após o mount. Percentual em 700 `15px` branco.
- Botão branco "Continuar aprendendo", `16.5px` 600, raio `13px`, hover `translateY(-2px)`.

**Quatro cartões de estatística** — `repeat(auto-fit, minmax(168px,1fr))`, gap `12px`. Ícone `30×30` raio `9px` colorido por natureza do dado; número em Bricolage 600 `29px`; rótulo `14px` `--muted`.
- 9 letras dominadas (teal) · 6 lições concluídas (teal) · 5 a revisar (gold) · 2h15 nesta semana (neutro)

**Cartão de revisão** — `--gold-soft`, borda `#EADCC0`, raio `18px`. Título "Hora de revisar", texto "5 letras precisam de uma revisão rápida. Leva cerca de 4 minutos.", cinco chips de letra `38×38` brancos raio `11px` (ס ע ט ח ש), e botão `--gold` "Começar revisão".

**Cartão da semana** — branco, borda `--line`. "Sua semana" / "2h 15min estudados". Gráfico de sete barras, altura `92px`, `border-radius: 7px`, gap `9px`. Barra de hoje em `--teal` com rótulo 700 `#12665C`; demais em `#BFE0D8`; dia sem estudo em `#EDEAE2` com altura mínima de `4%`. Altura anima em `.7s`.

### Tela: Mapa do curso

Cartão branco, raio `24px`, padding `38px 40px 44px`.

Cabeçalho: rótulo "MEU CURSO", H2 "Alfabetização Hebraica", "6 módulos · 14 lições · 22 letras", e à direita "42%" em Bricolage 600 `38px` `--teal` com "concluído" embaixo.

**Timeline vertical.** Cada módulo é uma linha em grade `52px minmax(0,1fr)`, gap `20px`:

- Coluna esquerda: marcador `44×44` raio `14px`, borda `2px`, seguido de uma linha vertical de `2px` que desce até o próximo módulo (`min-height: 26px`). O último módulo não tem linha.
  - Concluído: fundo `--teal`, borda `--teal`, ícone de check branco. Linha abaixo em `--teal`.
  - Em andamento: fundo branco, borda `--teal`, ponto `11×11` em `--teal`. Linha abaixo em `--line`.
  - Bloqueado: fundo `--sand`, borda `--line`, ícone de cadeado `#A8AFAB`. Linha em `--line`.
- Coluna direita: cartão raio `18px`, padding `22px 24px`. Bloqueado usa `opacity: .72`, fundo `#FBFAF7` e título em `--muted`. Em andamento tem borda `--teal`.
  - Linha superior: tag de estado, meta, e (se não bloqueado) mini barra de progresso de `6px` com o percentual.
  - Título Bricolage 600 `21px`.
  - Chips de letra `46×50`, raio `12px`, com a letra `23px` e o nome `9.5px` embaixo.

Estados: Módulos 1–2 concluídos (100%), Módulo 3 em andamento (60%), Módulos 4–6 bloqueados.

### Tela: Lição — mockup de celular, clicável

Grade `minmax(0,1fr) 392px`, gap `56px`. À esquerda, o índice de passos (útil na apresentação; no app real não existe — o aluno só vê o celular). À direita, o telefone.

**Chassi**: `392×812`, raio `46px`, fundo `#12181A`, padding `11px`. Notch `108×30` raio `20px` no topo. Tela interna raio `36px`, fundo `--cream`.

**Barra de status**: `9:41` à esquerda, sinal e bateria em SVG à direita, `13.5px` 600.

**Cabeçalho da lição**: seta de voltar, barra de progresso `8px` (trilho `--sand`, preenchimento gradiente `--teal → #3FB3A0`, transição `.5s`), contador `n/7` em `13px` 600 `--muted` tabular.

**Corpo**: `flex: 1`, `overflow: auto`, padding `8px 22px 14px`. Cada passo entra com `hf-rise .3s`.

**Rodapé fixo**: padding `12px 22px 34px`, borda superior `1px solid rgba(228,224,214,.7)`. Botão de largura total, raio `14px`, `17px` 600, padding `16px`.
- Ativo: `--navy` / branco.
- Desabilitado (esperando resposta): `#EDEAE2` / `#A8AFAB`, `cursor: not-allowed`, rótulo muda para "Escolha uma opção".
- Na conclusão, aparece um botão secundário de texto acima: "Voltar ao curso".

**Os sete passos:**

| # | Tipo | Conteúdo |
| --- | --- | --- |
| 1 | Aprender | Letra `שׁ` a `104px` em bloco `--sand` raio `20px`, com `hf-pop .45s`. Nome "Shin", som `/ʃ/`, botão "Ouvir". Explicação: "Como o CH de «chave», «chuva», «chá». O som já existe no seu português — o que é novo é a forma." Cartão de exemplo: שָׁלוֹם / shalom / olá, paz. |
| 2 | Escuta | "Qual som você ouviu?" + botão "Reproduzir". Grade 2×2: S ס · SH שׁ (correta) · TS צ · Z ז. |
| 3 | Reconhecimento | "Toque na letra Shin." / "Ela tem três hastes e um ponto em cima, à direita." Grade 2×2: ס · שׁ (correta) · מ · ע. |
| 4 | Associação | "Ligue cada letra ao seu som." Quatro linhas letra–traço–som; as duas primeiras já ligadas (fundo `--teal-soft`, borda `--teal`, check) e as duas últimas pendentes. Nota: "Duas de quatro ligadas. Continue tocando nos pares." |
| 5 | Digitação | "Escreva a pronúncia." שָׁלוֹם a `56px`. Input centralizado `19px` 600, borda `2px`. Ao digitar `shalom` (case-insensitive, trim): borda e fundo viram teal e aparece "Exato." + "+10 XP". Antes disso: "Dica: começa com o som SH." |
| 6 | Leitura | "Leia em voz alta." שָׁלוֹם a `60px`, decomposta em שָׁ /sha e לוֹם /lom em `--teal`. Explicação sobre a sílaba tônica e o Mem final. Botão "Ouvir o modelo". |
| 7 | Conclusão | Círculo `96×96` em `--teal-soft` com check `42px`, entrando com `hf-pop .5s`. Três faíscas `11×11` posicionadas ao redor, com `hf-spark 1s` escalonado em `.12s`. "Lição concluída" / "Shin está firme. Próxima: Sámech." Três métricas: +60 XP · 92% de acerto · 8 dias seguidos. Cartão "Praticado nesta lição" com pílulas: Reconhecimento, Escuta, Leitura, Digitação. |

**Botões de opção** (passos 2 e 3): raio `16px`, borda `2px`, padding `16px 12px`, letra hebraica `38px`, rótulo `14.5px` 600, transição `.2s`.

### Feedback de resposta — regra do sistema

**Nunca vermelho.** Nunca cor sozinha.

- **Correto**: caixa `--teal-soft`, raio `15px`, padding `15px 17px`, `hf-pop .3s`. Ícone de check + "Muito bem!" em 700 `16.5px` `#12665C` + "+10 XP" à direita em `--teal`. Abaixo, a explicação do porquê em `14.5px` `#2C5F58`.
- **Incorreto**: caixa `--gold-soft`, mesma geometria. Ícone de alerta + "Quase." em 700 `#8A6520`. Abaixo, a explicação da diferença em `#7A5A1C`, terminando em "Pode tentar de novo." Nova tentativa sempre permitida; nunca bloqueia o avanço.

Cada estado combina **cor + ícone + texto**, para não depender de cor.

### Tela: Revisão

Grade `minmax(0,1fr) 392px`. À esquerda, a fila de revisão em cartões largos; à direita, a mesma fila no celular.

Tela do celular: ícone circular `60×60` em `--gold-soft`, H3 "Hora de revisar", "5 letras precisam de uma revisão rápida. Cerca de 4 minutos.", a lista, e botão `--gold` "Começar revisão".

Fila (letra · nome · motivo · prazo):
- ס Sámech — Confundida com ם — hoje
- ע Áyin — Confundida com א — hoje
- ט Tet — 3 erros seguidos — hoje
- ח Het — Som gutural — amanhã
- ש Shin — Ponto à direita ou à esquerda — em 2 dias

**A expressão "repetição espaçada" nunca aparece na interface.** O aluno vê letras, motivos e um tempo estimado. O intervalo é calculado por trás.

### Tela: Progresso

Cinco cartões de número em `repeat(auto-fit, minmax(170px,1fr))`, gap `12px`:
- 42% do curso concluído (fundo `--navy`, texto branco)
- 2 / 6 módulos concluídos (branco)
- 9 letras dominadas (`--teal-soft`)
- 4 letras a revisar (`--gold-soft`)
- 7 dias seguidos (branco)

**Mapa de domínio das 22 letras** — grade `repeat(auto-fill, minmax(88px,1fr))`, gap `10px`. Cada célula: raio `14px`, padding `12px 8px`, letra `28px`, e abaixo um ícone + rótulo de estado em `11.5px` 600.

| Estado | Fundo | Borda | Ícone | Rótulo |
| --- | --- | --- | --- | --- |
| Dominada | `#E4F1EE` | `#BFE0D8` | check `#12665C` | Dominada |
| Revisar | `#F7EFDF` | `#EADCC0` | seta para baixo `#B8862F` | Revisar |
| Em progresso | `#FFFFFF` | `#E4E0D6` | ponto `#1F8A7D` | Em progresso |
| Não vista | `#F3F0E9` | `#E4E0D6` | cadeado `#A8AFAB` | Não vista |

Distribuição atual: מ ת א נ ה י ל ג ד dominadas · ש ר ס ע a revisar · ו ז em progresso · ח ט צ ק ב כ פ não vistas.

Ao lado, uma legenda explicando os estados e um cartão `--navy` "Próxima conquista / Metade do alfabeto / Faltam 2 letras para 11 dominadas" com barra em 82%.

---

## State Management

### Landing

| Estado | Tipo | Papel |
| --- | --- | --- |
| `hero` | `0–5` | Etapa da sequência de entrada do hero. Avança por `setTimeout` encadeado; todos os delays viram `0` com reduced-motion. Limpar os timers no unmount. |
| `streak` | número | `6` até a etapa 5, depois `7`. |
| `tab` | `0–3` | Aba ativa da demonstração. |
| `openMod` | índice ou `-1` | Módulo aberto no currículo. Clicar no aberto fecha (`-1`). Começa em `0`. |
| `openFaq` | índice ou `-1` | Pergunta aberta. Começa em `-1`. |
| `pick` | `0–3` ou `null` | Opção escolhida na aula de amostra. `0` é a correta. |

O `IntersectionObserver` das revelações é criado no mount e desconectado no unmount.

### Plataforma

| Estado | Tipo | Papel |
| --- | --- | --- |
| `view` | enum | Andaime de apresentação. **No app real, substituir por rotas.** |
| `step` | `0–6` | Passo da lição. |
| `choice` | `0`, `1` ou `null` | Resposta do passo atual: `1` correta, `0` incorreta, `null` sem resposta. Reseta ao trocar de passo. |
| `typed` | string | Input do passo de digitação. Correto quando `trim().toLowerCase() === "shalom"`. |
| `dashPct` | string | `"0%"` no mount, `"42%"` após `260ms`, para a barra animar. |

Regras de fluxo:

- Passos 2 e 3 exigem resposta antes de continuar — o botão fica desabilitado.
- Voltar limpa `choice` do passo anterior.
- O passo 7 muda o botão para "Continuar" e adiciona "Voltar ao curso"; ambos levam ao mapa do curso e resetam a lição.

### Dados que o backend precisa fornecer

- Perfil: nome, sequência em dias, tempo de estudo por dia da semana.
- Matrícula: curso atual, módulo atual, lição atual, percentual concluído.
- Por letra: estado de domínio (dominada / revisar / em progresso / não vista), motivo da revisão, data de vencimento.
- Por lição: tipo de cada atividade, conteúdo, alternativas, resposta correta, explicação do acerto e explicação do erro.
- Áudio: um arquivo por letra, por sílaba e por palavra.
- Resultado de lição: XP, percentual de acerto, competências praticadas, próxima lição.

---

## Responsive

O design é **mobile-first na prática**: o aluno estuda no celular, e a tela de lição foi desenhada primeiro para `390px`.

Regras para a implementação:

- **Landing**: todas as grades já usam `repeat(auto-fit, minmax(…))` e reflui sozinhas. As grades de duas colunas do hero, da demonstração, do professor, da amostra e do preço precisam virar uma coluna abaixo de ~900px, com o mockup depois do texto.
- **Plataforma**: sidebar de `248px` vira bottom navigation abaixo de ~900px. Os cartões do painel empilham. O mockup de celular deixa de ser mockup e passa a ser a tela inteira.
- **Lição**: uma atividade por tela, botão de continuar fixo no rodapé (`position: sticky` ou `fixed` com safe-area), alvos de toque nunca abaixo de `44px`. Sem overflow horizontal em nenhum ponto.
- Texto hebraico nunca abaixo de `20px` em conteúdo de ensino — o nikud fica ilegível.

---

## Accessibility

Já presente no protótipo, manter:

- `:focus-visible { outline: 2px solid #1F8A7D; outline-offset: 3px; border-radius: 6px; }` — nunca o anel azul padrão.
- `aria-expanded` nos acordeões (currículo, FAQ).
- `aria-label` nos botões só de ícone (voltar).
- `aria-hidden="true"` em todos os SVG decorativos.
- `prefers-reduced-motion` respeitado, tanto em CSS quanto na lógica JS.
- Estados de acerto/erro sempre com ícone + texto além da cor.
- Contraste: texto de corpo em `--muted` (`#66716D`) sobre `--cream` passa em 4.5:1. Texto sobre fundos tingidos usa sempre a variante `-ink` (`#12665C`, `#8A6520`), nunca a cor base.

A implementar no codebase real:

- Navegação por teclado completa nas atividades da lição (setas entre opções, Enter para confirmar).
- `alt` nas fotos reais (retrato do professor, avatares de depoimento).
- Anunciar o feedback de acerto/erro via `aria-live="polite"`.
- `lang="he"` nos elementos em hebraico e `lang="pt-BR"` no documento.

---

## Performance

- Sem vídeo no hero. A animação de entrada é CSS + estado, custo quase zero.
- Todas as animações são em `opacity` e `transform` — nenhuma dispara layout.
- `IntersectionObserver` com `unobserve` após o primeiro disparo.
- Carregar as três famílias com `display=swap` e `preconnect` para `fonts.gstatic.com`. Considere subsetar Noto Serif Hebrew para o bloco hebraico + nikud.
- As seções abaixo da dobra são candidatas a lazy-load.

---

## Assets

Nenhum binário neste pacote.

- **Ícones**: todos SVG de traço inline, escritos à mão, `stroke-width 1.5–1.9`, `linecap/linejoin: round`. No codebase, troque pelo icon set existente mantendo peso e tamanho.
- **Fontes**: Google Fonts, URL acima.
- **Logo**: composto tipograficamente — quadrado `--navy` de raio `10px` com a letra hebraica `ע` em `#8FD6C8`. Não há arquivo de logo. `ע` foi escolhida porque significa *olho* e *fonte/nascente*, é uma letra muda (abre espaço para a vogal) e é uma forma aberta. **Não usar `א`** — é a marca de um concorrente.
- **Fotos**: nenhuma. Há um slot para o retrato do professor na landing. Não usar banco de imagens genérico.

---

## Files

| Arquivo | Conteúdo |
| --- | --- |
| `Landing.dc.html` | Landing page completa, 14 seções, com a sequência do hero, as revelações por scroll, as abas da demonstração, os acordeões e a aula de amostra interativa. |
| `Plataforma.dc.html` | Plataforma logada: painel, mapa do curso, lição de 7 passos clicável, revisão e progresso. |

Abra os dois no navegador antes de começar. A sequência do hero e o fluxo da lição comunicam intenção que nenhuma descrição escrita cobre por inteiro.

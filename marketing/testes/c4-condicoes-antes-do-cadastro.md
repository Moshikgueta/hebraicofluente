# Teste C4: as condições da compra antes do cadastro

Plano de 90 dias, semana 5 (23/11 a 29/11). Este é o teste que roda se a decisão 2 (o peso do
curso na capa) não sair. Ele não mexe no portal. Especificação de 23/10/2026; skills `cro` e
`ab-testing`. **Nada muda no site antes da aprovação do dono.**

## O que se vê hoje (código, 23/10/2026)

Quem chega ao checkout (`/checkout/<slug>`) sem conta vê só "Passo 1 de 2: Primeiro, sua conta" e
o formulário de cadastro. O quadro "Condições desta compra" fica para o passo 2, depois da conta
criada. Esse quadro diz o que a pessoa leva, por quanto tempo, que o pagamento é único, o que não
vem junto, quando o acesso abre e quantos dias ela tem para desistir.

## Hipótese (não medida)

Pedir a conta antes de mostrar as condições faz parte das pessoas desistir no passo 1: elas não
sabem ainda se há assinatura, se podem desistir, nem quando o acesso abre. Com as condições
visíveis no passo 1, mais gente passaria do passo da conta ao pagamento.

## A mudança proposta

No passo 1, abaixo do texto "É ela que guarda o acesso...", entra o mesmo `CondicoesDaCompra` do
passo 2, sem nenhuma palavra nova. O cadastro continua igual. Nenhuma promessa nova é feita: é o
mesmo texto, que já foi revisado contra o CDC e o Decreto 7.962.

## Como se mede

Desde 23/10/2026 o contador por origem (`EVENTOS_COM_FONTE`, `worker/src/api/estatisticas.js`)
tem os dois lados do passo:

- `checkout-conta`: o checkout mostrou o passo da conta (quem chegou sem sessão);
- `checkout-pagar`: o checkout mostrou o pagamento.

Os dois aparecem em `/admin/estatisticas`, "Crescimento por origem" ("Passo da conta" e
"Pagamento"). Cada evento conta uma vez por visita.

- **Métrica principal:** quantos dos que viram o passo da conta chegaram ao pagamento. Como quem
  já tinha sessão vai direto ao pagamento, a conta é `(pagar - (aberto - conta)) / conta`. A
  pessoa que já estava logada não entra no numerador nem no denominador.
- **Métrica de segurança:** pedidos por `checkout-aberto`. Não pode cair.
- **Base:** as semanas 1 a 4 (26/10 a 22/11), com o contador já no ar.
- **Desenho:** antes e depois, porque o volume não dá para dividir o tráfego (ver o A/B encerrado
  em 01/10/2026). Duração: 3 semanas.

## Regra de decisão (escrita antes de começar)

- **Fica** se a métrica principal subir pelo menos 5 pontos percentuais sobre a base **e** a base
  tiver pelo menos 30 pessoas no passo da conta.
- Com menos de 30 pessoas na base ou no teste, **não há veredito**: a mudança fica se o dono
  achar que ela é melhor para o comprador (é o mesmo texto, sem risco de promessa), e o número
  continua sendo acompanhado.
- **Volta** se pedidos por `checkout-aberto` caírem.

Os 5 pontos e as 30 pessoas são escolha minha, para não decidir com 3 visitas. O dono pode mudar
os dois antes do início, nunca depois.

## Pendências

- [ ] Dono aprova a mudança (ou a troca por outro teste).
- [ ] Na semana 3, ler a base de `checkout-conta` e `checkout-pagar` e confirmar que há volume.
- [ ] Na semana 5, abrir o PR da mudança. Ela só vai ao ar com o merge.

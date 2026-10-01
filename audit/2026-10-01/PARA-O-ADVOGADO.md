# Perguntas para o advogado (auditoria de 01/10/2026)

Hebraico Fluente, de Mhg Treinamentos e Idiomas (ME, CNPJ em
`data/empresa.json`). O que se oferece é um **serviço de ensino de idiomas**
(CNAE 8593-7/00): acesso por 12 meses a um curso online de alfabetização em
hebraico, autoinstrucional, com pagamento único pela Mercado Pago (PIX e
cartão, parcelado com juros da Mercado Pago). Não é venda de produto digital.

Os textos estão no ar em `/termos`, `/privacidade`, `/reembolso`,
`/acessibilidade` e `/faq`. Cada versão dos Termos, do Reembolso e da
Privacidade tem uma cópia fixa em `/<documento>/v/<código>/`, e o recibo de
cada compra linka a versão que valeu para ela. Detalhes técnicos de cada
ponto: `audit/2026-10-01/C-legal.md` (o número entre parênteses é o achado).

As perguntas são objetivas de propósito: uma resposta "sim/não + como
escrever" basta para a maioria.

## Consumidor (CDC e Decreto 7.962/2013)

1. **Desistência por e-mail (LEGAL-101, LEGAL-109).** Pelo site, a
   confirmação sai na hora, por e-mail automático. Pelo e-mail, quem lê é uma
   pessoa, e o site diz: "respondemos confirmando o recebimento em até 2 dias
   úteis, e vale a data em que você escreveu". Isso atende o art. 5º, § 4º,
   do Decreto 7.962 ("confirmação imediata")? Ou precisamos de resposta
   automática no e-mail?
2. **Prazo da devolução (LEGAL-110).** No PIX, "em até 10 dias úteis"; no
   cartão, conforme a fatura. Atende o "de imediato" do art. 49, parágrafo
   único? Se os juros do parcelamento pagos à Mercado Pago não voltarem no
   estorno, temos de devolver a diferença?
3. **Fim do pré-lançamento (LEGAL-108).** O site diz "Preço de
   pré-lançamento até 31/10/2026. Depois, R$ 297". Se o preço não subir em
   01/11, ou se a data for estendida, há risco de publicidade enganosa? Como
   comunicar uma prorrogação?
4. **Suspensão por compartilhamento (LEGAL-120).** Termos, art. 4: aviso por
   e-mail, 5 dias úteis para responder, suspensão só se confirmado. O que
   acontece com o valor pago se o compartilhamento se confirmar (perda sem
   reembolso, reembolso proporcional)? O critério "quantidade de entradas
   muito acima do normal" precisa do número (hoje, mais de 6 entradas em
   24 horas geram alerta, nada é bloqueado)?
5. **Código Penal no contrato (LEGAL-120).** O art. 5 cita a Lei 9.610/1998
   (arts. 102 a 104) e o Código Penal (arts. 184 e 154-A). Num contrato de
   consumo, manter a citação penal é adequado, ou soa como intimidação? Qual
   redação?
6. **Mudança de termos (LEGAL-105).** Em 29 e 30/09 entraram para todas as
   contas o limite de 3 aparelhos, a marca invisível no conteúdo e a marca
   d'água com o começo do e-mail. Os Termos dizem que mudança que afete
   acesso já comprado não retroage. Se houve compra antes de 29/09, o que
   fazer? E qual antecedência mínima para avisar uma mudança relevante
   (procedimento em `INCIDENTES.md`, seção 9, hoje com 15 dias)?
7. **Versão do contrato (LEGAL-104).** A prova do aceite é: no cadastro,
   caixa desmarcada, gravada com data, hora e o código da versão; na compra,
   "Ao continuar você concorda com os Termos", e o código da versão é gravado
   no pedido. Isso basta como prova do contrato aceito? Pedidos anteriores a
   01/10/2026 só têm a data.

## Dados pessoais (LGPD)

8. **Menores (LEGAL-112).** Os Termos (art. 3) dizem: compra só por maiores
   de 18; menores podem estudar com autorização e acompanhamento do
   responsável, que compra. A Política (item 7) diz que a plataforma é para
   adultos e que não coletamos dados de menores conscientemente. Qual regra
   adotar, e como escrever igual nos dois? O ECA Digital (Lei 15.211/2025)
   se aplica a este serviço? A declaração de idade junto do aceite dos
   Termos no cadastro serve como prova?
9. **Dispensa de encarregado (Res. CD/ANPD 2/2022, art. 11).** Algum
   tratamento nosso é de alto risco, o que tiraria a dispensa? Em especial:
   o limite de aparelhos com detecção de "rodízio" e a marca única por aluno
   no conteúdo são monitoramento?
10. **Legítimo interesse (LEGAL-114).** Marca d'água, marca invisível, limite
    de aparelhos e estatísticas de aprendizagem (só contagens, sem conta)
    estão amparados em legítimo interesse? Precisamos de um teste de
    balanceamento (LIA) escrito? A Política deve dizer que as aulas mostram
    o começo do e-mail na margem?
11. **Transferência internacional (LEGAL-115).** Resend, Cloudflare, GitHub,
    Google (Gmail), Meta (WhatsApp) e, possivelmente, Mercado Pago tratam
    dados fora do Brasil. Hoje a Política diz "amparada no art. 33 da LGPD",
    sem inciso. Qual inciso e qual mecanismo citar depois da Res. CD/ANPD
    19/2024?
12. **Prova do aceite depois da exclusão (LEGAL-113).** Apagar a conta apaga
    o registro do aceite. Os pedidos ficam (anonimizados). Devemos guardar o
    aceite ligado ao pedido pelo prazo prescricional (art. 7º, VI, e art. 16
    da LGPD)? Por quanto tempo?
13. **Registro de acesso (LEGAL-125).** Gravamos IP, data e hora no
    cadastro, no login e na troca de senha, por 190 dias. O art. 15 do Marco
    Civil exige também o uso (a sessão renovada sem novo login)?
14. **Portabilidade (LEGAL-122).** Não há botão "baixar meus dados"; o
    pedido é por e-mail, em até 15 dias. Precisamos do formato simplificado
    imediato do art. 19, I?

## Conteúdo e publicidade

15. **Autorização do autor de "Ba Li Ivrit" (LEGAL-111).** O site diz que o
    conteúdo do livro do Dr. Damián Dzienciarsky é a base do curso, e o
    art. 5 dos Termos se chama "O conteúdo é nosso, o aprendizado é seu". O
    dono tem a autorização por escrito. Ela cobre obra derivada, uso
    comercial, prazo e território? Como redigir o art. 5 de acordo com ela?
16. **Depoimento (LEGAL-107).** O depoimento da aluna Natália foi encurtado
    (corte marcado com "[...]"). Qual a forma mínima da autorização (escrita,
    com o corte)? Se ela teve acesso gratuito ou foi aluna particular, isso
    precisa ser dito junto do depoimento (CONAR)? **Resposta do dono
    (01/10/2026): ela é aluna particular.** O site já diz isso no cartão do
    depoimento ("aluna particular do professor"). Basta, ou precisa mais?
17. **Credenciais do professor (LEGAL-124).** "Gerente Pedagógico da New
    School", "professor na Universidad Isaac Abarbanel", "Formação CELTA e
    Letras". Que comprovantes guardar? "Formação em Letras" pode ser usado
    se a graduação não foi concluída?

## Adendo de 01/10/2026: "Baixar meus dados"

18. A conta agora tem "Baixar meus dados" (LGPD art. 18, II e V). O arquivo NÃO leva a senha (só existe como hash), os identificadores de sessão e de aparelho, nem a marca anticópia que identifica uma cópia vazada do curso. Deixar a marca de fora (por ser medida de segurança contra pirataria) é compatível com o direito de acesso, ou ela precisa ir no arquivo?

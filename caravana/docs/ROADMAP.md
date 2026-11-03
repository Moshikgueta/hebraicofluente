# Roteiro

## Fase 1 (esta entrega)

Feito e verificado (testes de integração, ponta a ponta a 390 px, build de produção):

- [x] Arquitetura, modelo de dados multiagência com RLS, chaves compostas e gatilhos
- [x] Design system: tokens, tipografia, ilustrações, carimbos, componentes, layouts
- [x] Viajante: boas-vindas, roteiro com estados, dia, descubra, destino editorial,
      hebraico, atividades (4 tipos), passaporte, informações, depois da viagem
- [x] Convites pessoais com código, link, QR, texto pronto, limite de aparelhos,
      revogação e vagas cobradas no banco
- [x] Painel da agência: indicadores agregados, 8 etapas da caravana, prévia,
      publicação com diferenças e versões, identidade da agência
- [x] Superadministração: agências e contratos, acessos por link, biblioteca com
      revisões e aprovação, revisão de hebraico, atividades, planos, auditoria
- [x] Demonstração separada (agência `is_demo`), viajante temporário e painel
      somente leitura

## O que continua demonstrativo

- Os textos dos quatro destinos completos, as 56 expressões e as 7 atividades
  estão **em revisão**: escritos para a demonstração, sem revisão editorial nem de
  falante nativo. Numa caravana real, nada disso aparece até ser aprovado.
- A caravana "Descubra Israel 2027" e a "Agência Exemplo" são fictícias; os números
  do painel dela vêm de 18 viajantes fictícios.
- Não há fotografias nem gravações.

## Antes de ir para produção

Em ordem sugerida:

1. **Revisão de conteúdo**: editor + guia licenciado para os 4 destinos; falante
   nativo para o hebraico; aprovar na superadministração.
2. **Hospedagem**: Workers Paid + `@opennextjs/cloudflare`; Postgres gerenciado
   (Neon ou Supabase) via Hyperdrive; usuário de conexão sem BYPASSRLS e membro dos
   três papéis; `MCD_SECRET` e `MCD_PUBLIC_URL`; domínio. Depende de autorização
   para contas e custos.
3. **Armazenamento (R2)**: fotos licenciadas, logos das agências e gravações de
   áudio, com crédito e licença.
4. **Jurídico e LGPD**: termos de uso, política de privacidade, contrato de
   operador com cada agência, retenção e exclusão dos dados dos viajantes ao fim do
   contrato, canal do titular.
5. **E-mail transacional**: hoje o link de definir senha é copiado e enviado à mão
   pelo superadministrador. Falta envio automático e "esqueci a senha".
6. **Equipe da agência pelo próprio painel**: hoje quem dá acesso é a plataforma.
7. **Monitoramento**: logs estruturados, alerta de erro, backup do banco.
8. **Limpeza**: tarefa periódica que apaga visitas de demonstração vencidas (hoje a
   limpeza acontece a cada nova visita) e janelas antigas do freio.

## Próximas fases do produto

- Importação de roteiro por PDF ou documento (revisão humana antes de salvar).
- Biblioteca: mais destinos, atividades próprias de cada agência, traduções
  (`locale`).
- Áudio nativo em todas as expressões; prática de escuta.
- PWA com leitura offline do retrato publicado (sem prometer o app inteiro offline).
- Oferta opcional de continuidade depois da viagem (`postTripOffer` no retrato, hoje nulo).
- Cobrança: os planos, vagas e recursos já estão no modelo; falta o checkout e o
  faturamento.
- Tema escuro.

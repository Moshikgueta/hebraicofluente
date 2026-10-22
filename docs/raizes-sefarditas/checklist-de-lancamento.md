# Raízes Sefarditas: pronto para lançar?

Estado em 22/10/2026. Os 17 critérios do pedido original (seção 25), um por um.
**Resposta curta: não está pronto para vender.** O módulo 1 está pronto para
revisão; os outros nove, não começados.

| # | Critério | Estado |
| --- | --- | --- |
| 1 | Dez módulos completos | Não. Só o módulo 1. |
| 2 | Conteúdo sustentado por fontes verificadas | Módulo 1: verificado por trecho de busca; falta a revisão humana no texto integral. |
| 3 | Navegação funcional | Sim (conferido em navegador, `app/raizes.mjs`). |
| 4 | Atividades completamente implementadas | Módulo 1: sim (8 atividades, 6 tipos). |
| 5 | Respostas e feedback corretos | Módulo 1: conferidos por teste (`tests/raizes.test.ts`) e no navegador. Revisão humana pendente. |
| 6 | Progresso persiste | Sim: recarregar mantém tudo; fusão entre aparelhos testada. |
| 7 | Desbloqueio funciona | Sim, testado; só há um módulo para abrir. |
| 8 | Mapas historicamente coerentes | Sim para o módulo 1: sem fronteiras modernas, lugar incerto marcado. |
| 9 | Documentos contextualizados | Sim, sem reprodução de imagem. |
| 10 | Laboratório genealógico seguro | Não construído (desenho em `plano-pedagogico.md`). |
| 11 | Componentes acessíveis | Teclado e leitor de tela pensados; falta passar `a11y-pago.mjs` com conta de Raízes e medir contraste com `escuro.mjs`. |
| 12 | Celular e computador | Conferido a 390 px; computador não fotografado. |
| 13 | Fontes e licenças visuais documentadas | Sim (só Natural Earth). |
| 14 | Certificado correto | Texto pronto em `curso.json`; não é emitido (depende dos dez módulos). |
| 15 | Sistemas existentes funcionando | Os 1431 testes anteriores passam; build e `validate` passam. |
| 16 | Sem erro crítico conhecido | Nenhum no módulo 1. |
| 17 | Materiais de manutenção | Estes documentos e os comentários dos arquivos. |

## O que conferi e como

- `cd app && npm test`: 1461 testes, todos passando (30 novos de Raízes).
- `cd app && npm run build`: export estático gerado, `/raizes/modulo/1` incluído.
- `npm run validate`: 0 violações.
- `cd app && HF_CHROMIUM=... node raizes.mjs`: 33 conferências num Chromium a
  390 px, incluindo errar e acertar cada atividade, recarregar, e uma conta
  sem o direito sendo mandada para `/cursos/`.
- `cd app && node pacote.mjs` contra a build de produção
  (`NEXT_PUBLIC_PLATFORM_API=worker`): o conteúdo de Raízes não está no pacote
  público.
- Não rodado: `npm run varrer`, `a11y-pago.mjs`, `escuro.mjs`, `wrangler dev`
  com o D1 local.

## Para vender (decisões do dono)

1. Preço.
2. Contador: CNAE e nota (curso de história não é ensino de idioma).
3. Termos, art. 1 ("cursos online de hebraico") e versão nova das políticas.
4. Revisão humana especializada do módulo 1, e depois de cada módulo.
5. Aprovar o hebraico (`hebraico-para-aprovar.md`).
6. Linha em `data/courses.json`, página de venda e testes de pagamento.

## Risco anterior encontrado (curso de hebraico, não mexido)

O gravador de progresso (`app/src/lib/state/gravador.ts`) espera 250 ms antes
de gravar e não descarrega a gravação pendente quando a página sai. Recarregar
logo depois de concluir algo pode perder o último registro. Corrigido só para
as atividades de Raízes; para o curso de hebraico, a correção (gravar no
`pagehide`) fica para uma decisão à parte.

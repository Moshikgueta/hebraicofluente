# Raízes Sefarditas: hebraico para aprovar

Regra do repositório (`CLAUDE.md`): hebraico escrito pelo Claude precisa da
aprovação do dono antes de ir ao ar. Esta lista é conferida por
`app/tests/raizes.test.ts`: todo hebraico do texto dos módulos tem de estar
aqui. A aprovação é do dono e se marca à mão, trocando `pendente` por
`aprovado` e a data.

| Hebraico | Transliteração | Sentido | Onde aparece | Estado |
| --- | --- | --- | --- | --- |
| סְפָרַד | Sefarád | Sefarad, nome hebraico da Península Ibérica | Módulo 1, etapa Descobrir, primeiro parágrafo | pendente |

Pontos para o dono conferir:

- O nikud: samekh com shva, pe com qamats, resh com patach.
- A transliteração usada no texto corrido é "Sefarad", sem acento, porque é o
  nome como aparece em português. Se o dono preferir "Sefarád" (o padrão
  `pt-BR-practical-v1` do curso, com a tônica marcada), basta dizer: o texto
  muda em um lugar só (`data/raizes/modulos/m01.json`).
- Não há citação do versículo de Obadias em hebraico: o texto diz só que o
  nome aparece lá. Citar o versículo seria hebraico bíblico, fora da regra de
  "só presente", e pediria a mesma aprovação.

# Hebraico na rua: fotos para o dono aprovar

Placas de verdade de Israel, do Wikimedia Commons, todas com licença livre e o
crédito sempre junto da foto. Em cada uma o aluno procura uma palavra do curso
que já lê. Nada de hebraico novo: a palavra e as opções são palavras do curso,
com a grafia do curso. A placa só aparece para quem já lê a palavra.

Cada foto está em `data/hebraico-na-rua.json` com `aprovada: false`. Para ir ao
ar, o dono confere duas coisas em cada uma:

1. a foto serve para o curso;
2. a palavra marcada aparece mesmo na placa (e as outras palavras do curso que
   estão nela estão listadas, para nenhuma opção errada estar também na placa).

## As sete recomendadas

| id | Palavra procurada | Outras palavras do curso na placa | O que é | Autor e licença |
|---|---|---|---|---|
| rua-derech | דֶרֶךְ (caminho) | nenhuma | Placa de estrada para a Estrada de Burma | י.ש., CC BY-SA 3.0 |
| rua-bait | בַּיִת (casa) | אַתְ | Farmácia num centro médico em Holon | Chenspec, CC BY-SA 4.0 |
| rua-shalom | שָׁלוֹם | בַּיִת | Placa que indica uma sinagoga em Ramat Gan | Chenspec, CC BY-SA 4.0 |
| rua-lechem | לֶחֶם (pão) | אַתְ | Placa da padaria de 1943 no moshav Moledet | Danny Gershoni, CC BY-SA 4.0 |
| rua-maim | מַיִם (água) | שֶׁל | Placa de pedra de um canal de água antigo em Jerusalém | zeevveez, CC BY 2.0 |
| rua-israel | יִשְׂרָאֵל | מַיִם, שֶׁל | Placa de um reservatório de água no vale do Jordão | Hanay, CC BY-SA 3.0 |
| rua-ani | אֲנִי (eu) | nenhuma | Faixa de uma escola em Petah Tikva | Ibohr, CC BY-SA 3.0 |

Na placa a palavra vem sem os pontos. A tela mostra isso depois da resposta:
"Na placa ela vem sem os pontos", com a palavra como está na rua.

## O que ficou de fora, e por quê

- Pichação política ("עסקה עכשיו") e placas em memória de vítimas de atentados:
  não combinam com um exercício.
- Placas de rua com o nome abreviado ("רח'"), sem palavra inteira do curso.
- Fotos onde a palavra é pequena demais para ler no celular.

As candidatas (67) vieram da Action "Fotos das missões" e foram tiradas do ramo
depois da escolha. Para buscar de novo: Actions, "Fotos das missões", rodar à mão.

## Como aprovar

Dizer quais das sete entram (ou "as sete"). Aí as imagens entram em
`app/public/media/rua/`, cada uma passa a `aprovada: true`, e o cartão
"Hebraico na rua" aparece em Leituras.

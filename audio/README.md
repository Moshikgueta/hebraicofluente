# audio/

As gravações do curso vão aqui. Um arquivo `.mp3` por clipe, com o nome exato
que o roteiro manda — o nome é um hash do hebraico pontuado, então ele não muda
quando o curso muda de ordem.

```bash
npm run audio-script    # regera o manifesto e o roteiro de gravação
npm run check-audio     # o que chegou, o que falta, o que tem nome errado
npm run export-content  # leva os arquivos para o app (de app/)
```

O app toca o que existir e mostra "áudio em breve" no resto. Não há nada para
configurar quando uma onda chega.

**Não há síntese de voz como substituto**, de propósito: a síntese `he-IL` dos
navegadores ignora o nikud, e num curso cuja promessa é "esta letra faz este
som" uma pronúncia errada com ar de autoridade é pior do que silêncio. Ver
`app/ARCHITECTURE.md` §6.3.

Os `.mp3` não entram no git (ver `.gitignore`) — são binários grandes e o
repositório não é o lugar deles. O roteiro, sim.

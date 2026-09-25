/* As letras sem som próprio saem da tabela de sons (components/learn/SoundLab).
   ──────────────────────────────────────────────────────────────────────────
   A tabela existe para mostrar consoante + vogal = som novo. No {{א}} e no
   {{ע}} não há consoante para somar: a linha inteira repetia só as cinco
   vogais (a, e, i, o, u), igual à linha de cabeçalho, e ensinava que a letra
   "faz" alguma coisa. O "mudo" continua escrito onde a letra é apresentada;
   só a tabela deixa de tratá-la como som. O {{ה}} fica: "ha" não é "a".
   Quem decide é o próprio conteúdo - o campo `sound` dessas letras começa
   com "(mudo" -, e não uma lista de ids aqui. */
export const temSomProprio = (l: { sound: string }): boolean => !/^\(mudo/.test(l.sound.trim());

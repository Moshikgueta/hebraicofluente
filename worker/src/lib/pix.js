/* O código PIX, montado aqui.
 * ─────────────────────────────────────────────────────────────────────────
 * O "copia e cola" do PIX é um padrão ABERTO do Banco Central - o BR Code,
 * que é o EMV®QRCPS-MPM com um punhado de campos brasileiros dentro. Isso
 * significa que gerá-lo não exige adquirente, gateway, conta de
 * desenvolvedor nem aprovação de ninguém: exige a chave PIX do recebedor e
 * acertar o formato.
 *
 * É por isso que este arquivo existe. A Mercado Pago continua sendo o
 * caminho com confirmação automática, e este é o caminho que FUNCIONA HOJE,
 * com a conta que o dono do site já tem. Os dois convivem.
 *
 * ── o que este código NÃO faz ────────────────────────────────────────────
 * Ele não confirma pagamento. Um BR Code estático não avisa ninguém quando
 * é pago: o dinheiro cai na conta do recebedor e pronto. Quem casa o
 * pagamento com a pessoa é um humano olhando o extrato, e é por isso que o
 * `txid` abaixo importa tanto - ele é o único fio entre a linha do extrato e
 * o pedido no banco de dados.
 *
 * ── a estrutura ──────────────────────────────────────────────────────────
 * Cada campo é `ID (2 dígitos) + TAMANHO (2 dígitos) + VALOR`, e alguns
 * campos contêm outros campos com a mesma regra. O último é sempre o CRC16,
 * calculado sobre tudo que veio antes, inclusive sobre o próprio "6304".
 *
 * As referências dos tamanhos máximos são do Manual de Padrões para
 * Iniciação do PIX; estourar qualquer um deles faz o app do banco recusar o
 * código com uma mensagem genérica, que é o pior jeito de descobrir.
 */

/** Um campo: id, tamanho em dois dígitos, valor. */
function campo(id, valor) {
  const v = String(valor);
  return `${id}${String(v.length).padStart(2, '0')}${v}`;
}

/**
 * CRC16/CCITT-FALSE - polinômio 0x1021, inicial 0xFFFF, sem reflexão.
 *
 * É a variante exata que o BR Code pede. Trocar por outra família de CRC16
 * (ARC, MODBUS, XMODEM) produz quatro caracteres plausíveis e um código que
 * todo aplicativo recusa - e o erro não se parece com um erro de CRC.
 */
export function crc16(texto) {
  let crc = 0xffff;
  for (let i = 0; i < texto.length; i++) {
    crc ^= texto.charCodeAt(i) << 8;
    for (let b = 0; b < 8; b++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

/**
 * Tira o que o padrão não aceita.
 *
 * Nome e cidade do recebedor vão sem acento e sem símbolo: o campo é
 * latin-1 na prática, e um "ã" transforma a contagem de tamanho em bytes
 * numa contagem diferente da de caracteres - o que desalinha tudo que vem
 * depois. Cortar no limite é obrigatório pelo mesmo motivo.
 */
export function limpo(s, max) {
  return String(s || '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')  // separa e remove acento
    .replace(/[^A-Za-z0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max)
    .toUpperCase();
}

/**
 * O identificador que liga o extrato ao pedido.
 *
 * Alfanumérico, no máximo 25 caracteres. É o que aparece para o recebedor
 * junto do pagamento, e sem ele não há como saber QUEM pagou - só que
 * alguém pagou R$132,30, o que num dia com duas vendas já não resolve.
 *
 * O id do pedido tem 34 caracteres, então vai truncado. Continua sendo um
 * PREFIXO do id real, e é assim que o pedido é reencontrado: comparando o
 * começo. Os 23 dígitos hexadecimais que sobram são mais do que suficientes
 * para nunca colidirem.
 */
export const txidDe = orderId => String(orderId || '').replace(/[^A-Za-z0-9]/g, '').slice(0, 25);

/**
 * O BR Code completo, pronto para o copia e cola e para virar QR.
 *
 * `chave`   a chave PIX do recebedor (CNPJ, e-mail, telefone ou aleatória)
 * `nome`    o titular, como consta na conta
 * `cidade`  a cidade do titular
 * `valor`   em reais, com centavos - `132.30`
 * `txid`    o identificador do pedido
 *
 * `01` com valor `12` marca o código como de uso ÚNICO. Sem ele o aplicativo
 * do banco pode oferecer "pagar de novo" sobre o mesmo código, e o segundo
 * pagamento chegaria com o txid de um pedido já liberado.
 */
export function brCode({ chave, nome, cidade, valor, txid }) {
  if (!chave) throw new Error('pix: sem chave');

  const conta =
    campo('00', 'br.gov.bcb.pix') +
    campo('01', String(chave).trim());

  const extra = campo('05', txidDe(txid) || '***');

  const corpo =
    campo('00', '01') +
    campo('01', '12') +
    campo('26', conta) +
    campo('52', '0000') +          // categoria: não especificada
    campo('53', '986') +           // moeda: BRL
    campo('54', Number(valor).toFixed(2)) +
    campo('58', 'BR') +
    campo('59', limpo(nome, 25) || 'RECEBEDOR') +
    campo('60', limpo(cidade, 15) || 'BRASIL') +
    campo('62', extra);

  /* O CRC é calculado sobre o corpo MAIS "6304" - o cabeçalho do próprio
     campo de CRC entra na conta. É a pegadinha clássica deste formato. */
  return corpo + '6304' + crc16(corpo + '6304');
}

/**
 * Confere um código gerado, relendo o que se escreveu.
 *
 * Existe porque um BR Code errado não falha aqui: falha no aplicativo do
 * banco do comprador, com "QR Code inválido" e nenhuma pista. Reler o
 * próprio código antes de mostrá-lo é barato, e transforma um defeito
 * invisível em um erro no log.
 *
 * Devolve `{ ok, erro }`.
 */
export function confereBrCode(codigo) {
  const s = String(codigo || '');
  if (s.length < 20) return { ok: false, erro: 'curto demais' };
  const marca = s.slice(-8, -4);
  if (marca !== '6304') return { ok: false, erro: 'não termina com o campo de CRC' };
  const esperado = crc16(s.slice(0, -4));
  const veio = s.slice(-4);
  if (esperado !== veio) return { ok: false, erro: `CRC ${veio}, esperado ${esperado}` };
  if (!s.includes('br.gov.bcb.pix')) return { ok: false, erro: 'sem o identificador do PIX' };
  return { ok: true };
}

/* Mercado Pago responde? Então é ela que cobra.
 * ─────────────────────────────────────────────────────────────────────────
 * `pagamento.modo` em data/empresa.json diz COMO SE QUER COBRAR. Este script
 * roda antes do build e resolve o que DÁ para cobrar agora, porque as duas
 * coisas podem não coincidir - e coincidir é a única forma de o site não
 * mentir.
 *
 * O caso concreto que fez isto existir: o `MP_ACCESS_TOKEN` publicado devolve
 * `401 unauthorized`. A Mercado Pago entrega dois valores por aplicação e os
 * dois começam com `APP_USR-`; só o Access Token serve para a API do
 * servidor, e a Public Key falha com uma frase que não menciona nem chave nem
 * credencial. Com o modo em `mercadopago` e um token que não autentica, TODA
 * compra morre num "alguma coisa quebrou do nosso lado" - a loja fica de pé e
 * não vende nada.
 *
 * Então, a cada publicação:
 *
 *   modo = mercadopago + token que autentica  →  mercadopago. Cartão,
 *                                                parcelamento e confirmação
 *                                                automática ligados.
 *   modo = mercadopago + token que não        →  pix-direto, e o aviso.
 *                                                Vende por PIX em vez de
 *                                                não vender.
 *   modo = pix-direto                         →  nada a resolver.
 *
 * O rebaixamento é escrito no data/empresa.json DESTA execução, e nunca é
 * commitado: o arquivo do repositório continua dizendo o que se quer. É ele
 * que o build do site e o bundle do Worker leem, os dois, o que garante que
 * a página não ofereça cartão enquanto o servidor só sabe fazer PIX - que é
 * exatamente o defeito silencioso que este projeto não aceita.
 *
 * Consequência prática, e é o ponto: no dia em que o Access Token certo
 * entrar no segredo, a publicação seguinte religa a Mercado Pago inteira
 * sozinha. Ninguém precisa lembrar de mexer em código.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const ARQUIVO = 'data/empresa.json';
const bruto = readFileSync(ARQUIVO, 'utf8');
const empresa = JSON.parse(bruto);
const querido = (empresa.pagamento && empresa.pagamento.modo) || 'mercadopago';

const linhas = [];
const diga = t => { linhas.push(t); console.log(t); };

/** Rebaixa o modo no arquivo desta execução, por substituição exata - nada de
 *  reserializar o JSON inteiro e perder os comentários `_nota…` de lugar. */
function rebaixar(porque) {
  const novo = bruto.replace(/"modo"\s*:\s*"mercadopago"/, '"modo": "pix-direto"');
  if (novo === bruto) {
    diga('✗ não consegui reescrever o modo em data/empresa.json - publicação abortada.');
    process.exit(1);
  }
  writeFileSync(ARQUIVO, novo);
  diga(`⚠ ${porque}`);
  diga('  Esta publicação vai ao ar em PIX DIRETO: o site vende por PIX e o');
  diga('  acesso é liberado à mão em Actions → Acesso → liberar.');
  diga('  Corrija o segredo MP_ACCESS_TOKEN e a próxima publicação religa a');
  diga('  Mercado Pago sozinha - nada de código a mexer.');
}

if (querido !== 'mercadopago') {
  diga(`Modo de pagamento: ${querido}. Nada a resolver.`);
} else {
  /* `trim()` porque um segredo colado chega com espaço na ponta e às vezes
     com quebra de linha, nenhum dos dois visível para quem colou - e os dois
     viajam dentro do cabeçalho Authorization. */
  const token = String(process.env.MP_ACCESS_TOKEN || '').trim();

  if (!token) {
    rebaixar('O segredo MP_ACCESS_TOKEN está vazio.');
  } else {
    /* A pergunta certa é a que o checkout vai fazer.
       ──────────────────────────────────────────────────────────────────────
       A primeira versão disto perguntava `/users/me`, e levou um
       `403 PA_UNAUTHORIZED_RESULT_FROM_POLICIES` - o PolicyAgent, a camada de
       autorização deles. Isso NÃO quer dizer que a credencial não presta:
       `/users/me` é dado de conta, e um Access Token pode não ter permissão
       para ler a conta e ainda assim cobrar perfeitamente. Reprovar o token
       por causa disso seria manter o cartão desligado para sempre por causa
       de uma pergunta que o produto nunca faz.
       `/v1/payment_methods` é a pergunta que importa: exige autenticação,
       não cria nem cobra nada, e devolve as formas de pagamento HABILITADAS
       nesta conta - de quebra respondendo se PIX e cartão estão liberados,
       que era outra dúvida em aberto. */
    let res, corpo = '';
    try {
      res = await fetch('https://api.mercadopago.com/v1/payment_methods', {
        headers: { Authorization: `Bearer ${token}` }
      });
      corpo = (await res.text()).slice(0, 400);
    } catch (e) {
      /* Uma falha de rede não prova nada sobre a credencial, mas a escolha
         ainda tem de ser feita, e vender por PIX é melhor do que publicar um
         checkout que talvez não funcione. */
      rebaixar(`Não consegui falar com a Mercado Pago: ${e.message || e}`);
      res = null;
    }

    if (res && res.ok) {
      let formas = '';
      try {
        const lista = JSON.parse(corpo);
        const tem = tipo => lista.some(m => m.id === tipo || m.payment_type_id === tipo);
        formas = [
          tem('pix') ? 'PIX' : null,
          tem('credit_card') ? 'cartão' : null
        ].filter(Boolean).join(' e ');
      } catch { /* o 200 já respondeu o que se perguntou */ }
      diga('✓ Mercado Pago autenticou.');
      diga(formas
        ? `  Habilitados na conta: ${formas}. Confirmação automática ligada.`
        : '  Confirmação automática ligada.');
    } else if (res) {
      /* 401 e 403 são as duas respostas SOBRE a credencial, e são diferentes:
         401 é "não reconheço isto", 403 é "reconheço e não deixo". Qualquer
         outro código diz que a chamada não chegou ao fim - um proxy no
         caminho, uma pane do lado deles - e chamar isso de credencial
         recusada manda quem lê trocar uma chave que talvez esteja certa. O
         corpo vai junto nos três casos, porque é ele que encerra a dúvida. */
      const publica =
        /^APP_USR-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token);
      const cabecalho =
        res.status === 401 ? 'A Mercado Pago não reconheceu a credencial: 401. '
        : res.status === 403 ? 'A Mercado Pago reconheceu e não autorizou: 403. '
        : `A chamada à Mercado Pago não passou: ${res.status}. `;
      rebaixar(
        cabecalho + corpo.replace(/\s+/g, ' ').trim()
        + (publica
          ? '\n  O valor tem o formato da PUBLIC KEY, não o do Access Token.'
            + '\n  Os dois começam com APP_USR-, e só o segundo serve aqui.'
          : res.status === 403
            ? '\n  Um 403 aqui costuma ser aplicação sem as credenciais de'
              + '\n  PRODUÇÃO ativadas, ou conta ainda sem meio de pagamento'
              + '\n  habilitado - não necessariamente a chave errada.'
            : '')
      );
    }
  }
}

if (process.env.GITHUB_STEP_SUMMARY) {
  writeFileSync(process.env.GITHUB_STEP_SUMMARY,
    `## Meio de pagamento\n\n\`\`\`\n${linhas.join('\n')}\n\`\`\`\n\n`, { flag: 'a' });
}

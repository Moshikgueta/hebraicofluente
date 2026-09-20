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

/**
 * Escreve, no arquivo DESTA execução, o que a conta realmente aceita.
 *
 * O arquivo do repositório continua dizendo a intenção (os dois `true`); o
 * que muda é o que esta build leva para o ar. O checkout e o Worker leem
 * daqui, os dois, e é isso que impede a tela de oferecer uma forma que o
 * servidor não consegue cobrar.
 *
 * Substituição exata, e não reserialização do JSON: reserializar perde os
 * comentários `_nota…` de lugar e produz um diff ilegível.
 */
function gravarFormas(pix, cartao) {
  const atual = readFileSync(ARQUIVO, 'utf8');
  const novo = atual.replace(
    /("formas"\s*:\s*\{[^}]*"pix"\s*:\s*)(true|false)([^}]*"cartao"\s*:\s*)(true|false)/,
    (_m, a, _p, b, _c) => `${a}${pix}${b}${cartao}`
  );
  if (novo === atual) {
    /* Sem o bloco `formas` (arquivo antigo), não há o que escrever - e isso
       não é falha: `temPix`/`temCartao` tratam a ausência como "oferece os
       dois", que é o comportamento de antes deste campo existir. */
    return false;
  }
  writeFileSync(ARQUIVO, novo);
  return true;
}

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
    let res, corpo = '', inteiro = '';
    try {
      res = await fetch('https://api.mercadopago.com/v1/payment_methods', {
        headers: { Authorization: `Bearer ${token}` }
      });
      inteiro = await res.text();
      /* O corpo cortado é para a MENSAGEM de erro, que não pode despejar
         trezentas linhas de JSON no resumo da execução. A leitura da lista usa
         o texto inteiro: cortar antes de interpretar deixava o JSON pela
         metade, o `JSON.parse` estourava em silêncio, e a publicação bem
         sucedida dizia só "confirmação automática ligada" sem nunca conseguir
         responder quais formas estão habilitadas - que é metade do motivo de
         perguntar justamente a esta rota. */
      corpo = inteiro.slice(0, 400);
    } catch (e) {
      /* Uma falha de rede não prova nada sobre a credencial, mas a escolha
         ainda tem de ser feita, e vender por PIX é melhor do que publicar um
         checkout que talvez não funcione. */
      rebaixar(`Não consegui falar com a Mercado Pago: ${e.message || e}`);
      res = null;
    }

    if (res && res.ok) {
      let formas = '', faltando = '', inventario = '';
      try {
        const lista = JSON.parse(inteiro);
        const tem = tipo => lista.some(m => m.id === tipo || m.payment_type_id === tipo);
        const achadas = [
          ['PIX', tem('pix')],
          ['cartão', tem('credit_card')]
        ];
        formas = achadas.filter(([, v]) => v).map(([n]) => n).join(' e ');
        faltando = achadas.filter(([, v]) => !v).map(([n]) => n).join(' e ');
        /* O inventário do que ESTA credencial enxerga.
           ────────────────────────────────────────────────────────────────
           "O PIX não está habilitado" é uma conclusão, e conclusão não
           convence o outro lado do balcão: o atendimento responde que a
           conta tem Pix - e tem, para RECEBER na carteira - enquanto a API
           responde outra coisa para este token. A lista crua transforma a
           discussão em fato verificável, e é o que se leva para o suporte
           em vez de "o meu sistema diz que não". */
        inventario = lista.map(m => m.id).filter(Boolean).sort().join(', ');
      } catch { /* o 200 já respondeu a pergunta que decide */ }
      diga('✓ Mercado Pago autenticou.');
      diga(formas
        ? `  Habilitados na conta: ${formas}. Confirmação automática ligada.`
        : '  Confirmação automática ligada.');
      /* Uma forma que o checkout oferece e a conta não tem vira erro na cara
         do comprador, e é o tipo de coisa que só aparece na primeira venda -
         que é a pior hora possível para descobrir. */
      if (faltando) {
        diga(`⚠ A conta NÃO tem habilitado: ${faltando}.`);
        /* E o checkout PARA de oferecer o que falta, nesta build.
           ──────────────────────────────────────────────────────────────
           Antes, aqui só havia o aviso - e o aviso ia para o resumo de uma
           publicação que ninguém abre quando está tudo verde. A tela
           continuava oferecendo a forma que a conta não tem, e o erro só
           aparecia na primeira venda, na cara do comprador. */
        const temPix = !/PIX/.test(faltando);
        const temCartao = !/cartão/.test(faltando);
        if (temPix || temCartao) {
          if (gravarFormas(temPix, temCartao)) {
            diga(`  Esta publicação oferece só: ${formas}.`);
            diga('  Quando eles habilitarem, a publicação seguinte religa sozinha.');
          }
        } else {
          /* Nenhuma das duas. Não dá para esconder tudo e deixar um checkout
             vazio: aí o trilho inteiro é que não serve. */
          diga('  Nenhuma forma conhecida está habilitada nesta conta.');
        }
        if (inventario) {
          diga('  O que esta credencial enxerga hoje, para levar ao suporte deles:');
          diga(`  ${inventario.slice(0, 600)}`);
        }
      }
    } else if (res) {
      /* Quem classifica é o CORPO, não só o código.
         ──────────────────────────────────────────────────────────────────
         A Mercado Pago responde `invalid_token` com status 400 - um código
         que, sozinho, qualquer um leria como "requisição malformada" e
         mandaria procurar erro na chamada. Ela também usa 401 para "não
         reconheço" e 403 para "reconheço e não deixo". Três códigos, e o
         que separa "a credencial está errada" de "a chamada não chegou ao
         fim" está escrito na resposta, não no número.
         A distinção não é preciosismo: dizer "a chamada não passou" sobre
         uma chave errada manda quem lê procurar rede e proxy; dizer
         "credencial recusada" sobre uma pane deles manda trocar uma chave
         que estava certa. */
      const texto = corpo.replace(/\s+/g, ' ').trim();
      const publica =
        /^APP_USR-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token);
      const credencial =
        res.status === 401 || res.status === 403 || /invalid_token|unauthorized/i.test(texto);
      const cabecalho =
        !credencial ? `A chamada à Mercado Pago não passou: ${res.status}. `
        : res.status === 403 ? 'A Mercado Pago reconheceu e não autorizou: 403. '
        : `A Mercado Pago recusou a credencial: ${res.status}. `;
      rebaixar(
        cabecalho + texto
        + (publica
          ? '\n  O valor tem o formato da PUBLIC KEY, não o do Access Token.'
            + '\n  Os dois começam com APP_USR-, e só o segundo serve aqui.'
            + '\n  Public Key:   APP_USR- + 8-4-4-4-12 em hexadecimal.'
            + '\n  Access Token: APP_USR- + números, hífen, mais números.'
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

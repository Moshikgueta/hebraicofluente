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
    /* `/users/me` é a pergunta mais barata que existe para "esta credencial
       autentica?": não cria nada, não cobra nada, e responde 401 para a
       Public Key exatamente como responderia para um token inventado. */
    let res, corpo = '';
    try {
      res = await fetch('https://api.mercadopago.com/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      corpo = (await res.text()).slice(0, 300);
    } catch (e) {
      /* Uma falha de rede aqui não prova nada sobre a credencial, mas a
         escolha ainda tem de ser feita, e vender por PIX é melhor do que
         publicar um checkout que talvez não funcione. */
      rebaixar(`Não consegui falar com a Mercado Pago: ${e.message || e}`);
      res = null;
    }

    if (res && res.ok) {
      let quem = '';
      try {
        const u = JSON.parse(corpo);
        /* Só o apelido e o país. Nada de e-mail nem de id - isto vai para o
           resumo público da execução. */
        quem = [u.nickname, u.site_id].filter(Boolean).join(' · ');
      } catch { /* o importante já foi respondido pelo 200 */ }
      diga(`✓ Mercado Pago autenticou${quem ? ` (${quem})` : ''}.`);
      diga('  PIX, cartão e parcelamento ligados, com confirmação automática.');
    } else if (res) {
      /* Só o 401 é uma resposta SOBRE a credencial. Qualquer outro código diz
         que a chamada não chegou ao fim - um proxy no caminho, uma pane do
         lado deles - e chamar isso de "credencial recusada" manda quem lê
         trocar uma chave que talvez esteja certa. O corpo vai junto nos dois
         casos, porque é ele que encerra a dúvida. */
      const recusa = res.status === 401;
      const publica = recusa
        && /^APP_USR-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(token);
      rebaixar(
        (recusa
          ? `A Mercado Pago recusou a credencial: 401. `
          : `A chamada à Mercado Pago não passou: ${res.status}. `)
        + corpo.replace(/\s+/g, ' ').trim()
        + (publica
          ? '\n  O formato do valor é o da PUBLIC KEY, não o do Access Token.'
            + '\n  Os dois começam com APP_USR-, e só o segundo serve aqui.'
          : '')
      );
    }
  }
}

if (process.env.GITHUB_STEP_SUMMARY) {
  writeFileSync(process.env.GITHUB_STEP_SUMMARY,
    `## Meio de pagamento\n\n\`\`\`\n${linhas.join('\n')}\n\`\`\`\n\n`, { flag: 'a' });
}

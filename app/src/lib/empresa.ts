/* Quem vende, e como falar com quem vende.
 * ─────────────────────────────────────────────────────────────────────────
 * O Código de Defesa do Consumidor e o Decreto 7.962/2013 (o "decreto do
 * e-commerce") pedem a mesma coisa em três lugares diferentes: quem está
 * vendendo, como encontrar essa pessoa, e quais são as condições antes de
 * pagar. Este módulo é a fonte única disso no app - o rodapé, os Termos, a
 * Política de Privacidade, a de Reembolso e o checkout leem todos daqui.
 *
 * A REGRA CENTRAL, e ela vale contra o instinto de "preencher depois":
 *
 *   um dado que não se sabe NÃO APARECE. Nunca vira travessão, nunca vira
 *   "a definir", nunca vira um CNPJ de exemplo.
 *
 * Identificação de fornecedor inventada não é um rascunho: é uma declaração
 * falsa num documento que existe justamente para ser confiável. Ausente é uma
 * pendência que `npm run check-legal` cobra; inventada é um problema que
 * ninguém mais vê, porque parece pronto.
 *
 * Por isso os campos opcionais são `string | null` e todo componente pergunta
 * antes de desenhar, e por isso `identificacaoCompleta()` existe: é o que
 * separa "dá para vender com isto" de "falta coisa".
 */

import empresaJson from '@content/empresa.json';

export type Endereco = {
  logradouro: string | null;
  cidade: string | null;
  uf: string | null;
  cep: string | null;
  pais: string;
};

export type Empresa = {
  nomeFantasia: string;
  /** A razão social. `null` enquanto não for informada - ver a nota acima. */
  razaoSocial: string | null;
  /** Já formatado como se lê, `00.000.000/0001-00`. */
  cnpj: string | null;
  endereco: Endereco;
  contato: {
    email: string;
    emailSuporte: string;
    emailPrivacidade: string;
    telefone: string | null;
    whatsapp: string | null;
  };
  atendimento: {
    horarioPt: string;
    /** Em dias úteis. É o prazo que o site promete, e que precisa ser real. */
    prazoRespostaUteis: number;
  };
  privacidade: {
    encarregadoNome: string | null;
    /** Prazo de resposta a pedido de titular. A LGPD usa 15 dias no art. 19. */
    prazoLgpdDias: number;
  };
  politicas: {
    /** Art. 49 do CDC: sete dias para compra fora do estabelecimento. */
    arrependimentoDias: number;
    /** A garantia que ESTE produto oferece por conta própria. */
    garantiaDias: number;
    prazoReembolsoUteis: number;
    /** ISO curto, `YYYY-MM-DD`. Sai no rodapé de cada política. */
    atualizadoEm: string;
  };
};

export const empresa = empresaJson as Empresa;

/** A cidade e o estado, quando existirem. "Curitiba, PR" ou `null`. */
export function cidadeUf(): string | null {
  const { cidade, uf } = empresa.endereco;
  if (!cidade) return null;
  return uf ? `${cidade}, ${uf}` : cidade;
}

/**
 * O endereço em uma linha, com o que houver.
 *
 * Devolve `null` quando não há nada - e aí o bloco inteiro some da tela, em
 * vez de aparecer como um rótulo "Endereço:" seguido de nada.
 */
export function enderecoLinha(): string | null {
  const { logradouro, cep } = empresa.endereco;
  const partes = [logradouro, cidadeUf(), cep].filter(Boolean);
  return partes.length ? partes.join(' · ') : null;
}

/**
 * Como o fornecedor se chama num documento.
 *
 * A razão social quando ela existe, porque é o nome jurídico; o nome fantasia
 * quando não, porque é melhor do que nada e é verdade.
 */
export const nomeLegal = (): string => empresa.razaoSocial ?? empresa.nomeFantasia;

/**
 * O link que abre a conversa no WhatsApp, ou `null` se não houver número.
 *
 * O `wa.me` quer só dígitos, com o país na frente e sem sinal nem separador -
 * o número na tela fica legível para humano, e o link fica legível para o
 * WhatsApp. Escrever os dois à mão é como um deles fica desatualizado.
 */
export function whatsappUrl(): string | null {
  const n = empresa.contato.whatsapp;
  if (!n) return null;
  const digitos = n.replace(/\D/g, '');
  /* Doze ou treze dígitos com o 55 na frente (fixo ou celular com o nono).
     Menos do que isso é número local, e um link errado é pior do que texto. */
  if (digitos.length < 12 || digitos.length > 13) return null;
  return `https://wa.me/${digitos}`;
}

/** Os dois juntos, quando são diferentes: "Fulano LTDA (Hebraico Fluente)". */
export function nomeLegalCompleto(): string {
  if (!empresa.razaoSocial || empresa.razaoSocial === empresa.nomeFantasia) {
    return empresa.nomeFantasia;
  }
  return `${empresa.razaoSocial} (${empresa.nomeFantasia})`;
}

/* ── o que ainda falta ──────────────────────────────────────────────────── */

export type Pendencia = { campo: string; porQue: string; bloqueia: boolean };

/**
 * O que está faltando para a identificação do fornecedor estar completa.
 *
 * `bloqueia` separa o que impede vender com segurança do que é só desejável.
 * O CNPJ bloqueia porque é o identificador do fornecedor; o telefone não,
 * porque um canal de atendimento por e-mail, respondido, já é um canal.
 *
 * Esta lista é lida por `npm run check-legal` e por mais ninguém: o site não
 * mostra pendência ao visitante, ele apenas omite o que não sabe.
 */
export function pendencias(): Pendencia[] {
  const faltando: Pendencia[] = [];
  const e = empresa;

  if (!e.cnpj) faltando.push({
    campo: 'cnpj',
    porQue: 'identificação do fornecedor - é o que diz QUEM está vendendo',
    bloqueia: true
  });
  if (!e.razaoSocial) faltando.push({
    campo: 'razaoSocial',
    porQue: 'o nome jurídico de quem vende, que acompanha o CNPJ',
    bloqueia: true
  });
  if (!e.endereco.cidade) faltando.push({
    campo: 'endereco.cidade',
    porQue: 'endereço do fornecedor, exigido na identificação',
    bloqueia: true
  });
  if (!e.endereco.logradouro) faltando.push({
    campo: 'endereco.logradouro',
    porQue: 'endereço completo; cidade e estado sozinhos já identificam, mas o logradouro é o que se espera',
    bloqueia: false
  });
  if (!e.endereco.cep) faltando.push({
    campo: 'endereco.cep',
    porQue: 'completa o endereço',
    bloqueia: false
  });
  if (!e.contato.telefone && !e.contato.whatsapp) faltando.push({
    campo: 'contato.telefone ou contato.whatsapp',
    porQue: 'um segundo canal de atendimento; o e-mail sozinho já atende, mas dois convertem melhor',
    bloqueia: false
  });
  if (!e.privacidade.encarregadoNome) faltando.push({
    campo: 'privacidade.encarregadoNome',
    porQue: 'o encarregado de dados (LGPD art. 41); o canal de e-mail já atende o titular',
    bloqueia: false
  });

  return faltando;
}

/** Dá para vender com esta identificação? */
export const identificacaoCompleta = (): boolean =>
  pendencias().every(p => !p.bloqueia);

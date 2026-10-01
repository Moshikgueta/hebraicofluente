/* As perguntas da FAQ da capa, fora do componente.
 * ─────────────────────────────────────────────────────────────────────────
 * Moram num módulo sem 'use client' porque são lidas em dois lugares: a FAQ
 * da capa (`Faq`, Fecho.tsx) e o JSON-LD `FAQPage` que a página de servidor
 * escreve (lib/jsonld.ts, auditoria de 01/10, SEO-001). O dado estruturado
 * tem de dizer exatamente o que a página mostra - o Google pede isso, e uma
 * cópia à parte seria a primeira a ficar velha.
 */

import { flagship } from '@/lib/catalog';
import { course, tempoDoCursoPt } from '@/lib/content-publico';
import { empresa } from '@/lib/empresa';
import { TEM_AUDIO } from './copy';

export function perguntasDaCapa(): readonly (readonly [string, string])[] {
  const c = flagship();
  return [
    ['Preciso saber hebraico?',
     'Não. O curso começa do zero absoluto, na primeira letra, e assume que você nunca viu o alfabeto.'],
    ['É hebraico moderno ou bíblico?',
     'A leitura é a mesma: as letras e os sinais de vogal do texto bíblico são os que este curso ensina. O curso usa a pronúncia do hebraico moderno e vocabulário do dia a dia, o que abre os dois caminhos. Ler em voz alta e entender, porém, são coisas diferentes - a página /biblia responde isso por inteiro.'],
    ['Quanto tempo leva?',
     `${tempoDoCursoPt()} São ${course.totalLetters} letras, mais os checkpoints de revisão, e o ritmo é seu.`],
    ['O curso funciona no celular?',
     'Sim. A plataforma foi desenhada primeiro para o celular: uma atividade por tela e o botão de continuar sempre à mão.'],
    ['Tem áudio?',
     TEM_AUDIO
       ? 'Cada letra, sílaba e palavra tem áudio gravado pelo professor, um israelense, para ouvir quantas vezes quiser.'
       : 'As gravações estão em produção. Enquanto não entram, o curso não usa voz sintética: cada som é explicado por comparação com um som do português, e os exercícios de escuta ficam desativados em vez de virar adivinhação.'],
    ['Por quanto tempo tenho acesso?',
     `${c.accessMonths} meses a partir da confirmação do pagamento, incluindo as atualizações feitas no curso nesse período.`],
    /* No lugar de "Posso estudar no meu ritmo?", que "Quanto tempo leva?" já
       respondia. O prazo e o meio batem com /reembolso: contado da liberação
       do acesso (a política conta "da compra ou da liberação, o que for mais
       favorável"), estorno pelo mesmo meio (PIX volta para a chave de origem,
       cartão é estornado na fatura). */
    ['E se eu não gostar?',
     `Você tem ${empresa.politicas.arrependimentoDias} dias, contados da liberação do acesso, para desistir pelo site e receber 100% de volta, sem precisar justificar. O estorno sai pelo mesmo meio de pagamento.`],
    ['O que acontece depois que termino?',
     'O próximo nível é o Hebraico A1, um curso à parte, ainda em produção e sem data. Se quiser, marque em Sua conta o pedido de receber um e-mail quando ele abrir.']
  ];
}

import { Card } from '@/components/ui/Card';
import { LinkButton } from '@/components/ui/Button';

/* The printed workbook is not replaced by the app — writing Hebrew by hand on
   paper is still the best way to learn to write it. This page is the honest
   handoff: the PDF is generated from the same data as the course, so the page
   numbers the lessons cite are always right. */
export default function WorkbookPage() {
  return (
    <div className="grid gap-6 reading">
      <header className="grid gap-3">
        <h1 className="text-[27px] sm:text-[33px] font-bold">O workbook impresso</h1>
        <p className="text-[16px] leading-relaxed text-ink-body max-w-[54ch]">
          As 331 páginas do livro saem exatamente dos mesmos dados que este curso:
          as mesmas letras, na mesma ordem, com o mesmo vocabulário. O que muda é
          o meio — no papel você escreve à mão, e é lá que a cursiva realmente
          entra na memória.
        </p>
      </header>

      <Card className="p-6 grid gap-3">
        <h2 className="font-display text-[18px] font-semibold">Como usar os dois juntos</h2>
        <ul className="grid gap-2.5 text-[15px] leading-relaxed text-ink-body">
          <li className="flex gap-3"><span aria-hidden className="text-[var(--teal-band)]">1</span>
            Faça a lição aqui: som, sílabas, palavras e exercícios corrigidos na hora.</li>
          <li className="flex gap-3"><span aria-hidden className="text-[var(--teal-band)]">2</span>
            Imprima as páginas que a lição indica e escreva à mão, sem pressa.</li>
          <li className="flex gap-3"><span aria-hidden className="text-[var(--teal-band)]">3</span>
            Volte para o checkpoint no fim do módulo.</li>
        </ul>
      </Card>

      <Card tone="amber" className="p-5">
        <p className="text-[15px] leading-relaxed text-ink-body">
          O arquivo do workbook ainda não está publicado nesta versão do app. Ele é
          gerado pelo repositório do livro (<code className="font-ui text-[13px]">npm run pdf</code>),
          e o link definitivo entra aqui quando houver uma URL de distribuição.
        </p>
      </Card>

      <LinkButton href="/meu-hebraico" variant="secondary" className="justify-self-start">Voltar</LinkButton>
    </div>
  );
}

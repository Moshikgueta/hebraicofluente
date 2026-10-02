/* Os perfis do professor e da marca, com os símbolos (dono, 02/10/2026).
   Um lugar só: rodapé do site público (PublicShell) e rodapé do curso
   (AppShell). Os endereços vêm de lib/professor.ts. Os símbolos são
   desenhados aqui, em traço simples, na cor do texto, sem logo colorido. */
import { INSTAGRAM, PERFIL_LINKEDIN } from '@/lib/professor';

const IconeInstagram = () => (
  <svg aria-hidden width="18" height="18" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.3" cy="6.7" r="0.6" fill="currentColor" stroke="none" />
  </svg>
);

const IconeLinkedIn = () => (
  <svg aria-hidden width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
  </svg>
);

export function RedesSociais({ classe = '' }: { classe?: string }) {
  const link = 'inline-flex items-center gap-2 min-h-[44px] font-ui text-[13.5px] text-ink-body hover:text-[var(--accent)]';
  return (
    <ul className={`flex flex-wrap gap-x-5 list-none p-0 m-0 ${classe}`}>
      <li>
        <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer" className={link}>
          <IconeInstagram />Instagram
          <span className="sr-only"> do Hebraico Fluente (abre em outra aba)</span>
        </a>
      </li>
      <li>
        <a href={PERFIL_LINKEDIN} target="_blank" rel="noopener noreferrer me" className={link}>
          <IconeLinkedIn />LinkedIn
          <span className="sr-only"> do professor (abre em outra aba)</span>
        </a>
      </li>
    </ul>
  );
}

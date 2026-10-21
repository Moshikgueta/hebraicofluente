'use client';

// Cores com previa ao vivo. A mesma funcao do servidor (brandTheme) calcula as
// variantes, entao o que aparece aqui e o que o viajante vai ver.

import { useState, type CSSProperties } from 'react';
import { brandTheme, contrast, PAPER } from '@/lib/theme';
import { Scene, SCENE_LABEL, SCENES } from '../art/Scene';
import { cx } from '../ui';

export function BrandEditor({
  primary,
  secondary,
  agencyPrimary,
  agencySecondary,
  coverArt,
  usesAgency,
  logoText,
  agencyName,
}: {
  primary: string;
  secondary: string;
  agencyPrimary: string;
  agencySecondary: string;
  coverArt: string;
  usesAgency: boolean;
  logoText: string;
  agencyName: string;
}) {
  const [p, setP] = useState(primary);
  const [s, setS] = useState(secondary);
  const [own, setOwn] = useState(!usesAgency);
  const [art, setArt] = useState(coverArt);
  const effP = own ? p : agencyPrimary;
  const effS = own ? s : agencySecondary;
  const theme = brandTheme(effP, effS);
  const adjusted = theme['--brand'] !== effP.toLowerCase() || contrast(effP, PAPER) < 4.5;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
      <div className="space-y-6">
        <label className="flex items-center gap-2 text-small font-semibold">
          <input type="checkbox" name="useAgency" value="1" checked={!own} onChange={(e) => setOwn(!e.target.checked)} className="h-4 w-4 accent-[#1f4a6b]" />
          Usar as cores da agência ({agencyName})
        </label>
        {own && (
          <div className="grid gap-5 sm:grid-cols-2">
            {[
              ['primaryColor', 'Cor principal', p, setP],
              ['secondaryColor', 'Cor de destaque', s, setS],
            ].map(([name, label, value, set]) => (
              <div key={name as string} className="space-y-1.5">
                <label htmlFor={`c-${name}`} className="block text-small font-semibold">
                  {label as string}
                </label>
                <div className="flex items-center gap-2">
                  <input type="color" aria-label={`${label} (seletor)`} value={value as string} onChange={(e) => (set as (v: string) => void)(e.target.value)} className="h-11 w-12 cursor-pointer rounded-sm border-0 bg-transparent p-0" />
                  <input
                    id={`c-${name}`}
                    name={name as string}
                    value={value as string}
                    onChange={(e) => (set as (v: string) => void)(e.target.value)}
                    pattern="#[0-9a-fA-F]{6}"
                    className="h-11 w-full rounded-sm bg-paper-raised px-3 font-mono text-small ring-1 ring-inset ring-stone-300 focus:outline-none focus:ring-2 focus:ring-sea"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
        {!own && (
          <>
            <input type="hidden" name="primaryColor" value="" />
            <input type="hidden" name="secondaryColor" value="" />
          </>
        )}
        {adjusted && (
          <p className="text-micro text-stone-600">
            Para manter a leitura confortável (contraste mínimo de 4,5:1), a plataforma escurece a cor onde ela vira texto ou fundo de botão. A prévia ao lado já mostra o ajuste.
          </p>
        )}

        <fieldset>
          <legend className="text-small font-semibold">Imagem de capa</legend>
          <p className="mt-0.5 text-micro text-stone-600">Ilustrações da plataforma. O envio de fotografias próprias (com crédito e licença) está previsto no roteiro do produto.</p>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {SCENES.map((sc) => (
              <label key={sc} className={cx('cursor-pointer overflow-hidden rounded-md ring-2 transition', art === sc ? 'ring-sea' : 'ring-transparent hover:ring-stone-300')}>
                <input type="radio" name="coverArt" value={sc} checked={art === sc} onChange={() => setArt(sc)} className="sr-only" />
                <Scene name={sc} variant="band" className="h-20 w-full" />
                <span className="block bg-paper-raised px-2 py-1.5 text-micro font-semibold">{SCENE_LABEL[sc]}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <div aria-label="Prévia" className="lg:sticky lg:top-6 lg:self-start">
        <p className="mb-2 text-micro font-semibold uppercase tracking-[0.12em] text-stone-600">Prévia no celular</p>
        <div style={theme as CSSProperties} className="overflow-hidden rounded-[1.6rem] bg-paper p-0 shadow-float ring-1 ring-stone-200">
          <div className="flex items-center gap-2 border-b border-stone-200 px-3 py-2.5">
            <span className="grid h-7 w-7 place-items-center rounded-[8px] bg-brand font-display text-micro font-semibold text-brand-ink">{logoText}</span>
            <span className="text-micro font-semibold">{agencyName}</span>
          </div>
          <Scene name={art} className="h-28 w-full" />
          <div className="space-y-3 p-4">
            <p className="text-micro font-semibold uppercase tracking-[0.12em] text-stone-600">Shalom!</p>
            <p className="font-display text-title font-medium leading-tight">Sua caravana</p>
            <p className="font-display text-display-m leading-none text-brand-text">120</p>
            <span className="inline-flex h-10 w-full items-center justify-center rounded-full bg-brand text-small font-semibold text-brand-ink">Ver meu roteiro</span>
            <p className="border-l-2 border-accent pl-3 text-micro italic text-ink-soft">Mensagem do organizador</p>
            <span className="inline-block rounded-full bg-brand-tint px-2.5 py-0.5 text-micro font-semibold text-brand-text">Hoje</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Marque de Maedow Flow : trois chevrons qui avancent, de plus en plus nets.
 *
 * Elle répond à celle de Maedow Arch (quatre barres empilées, le flux de
 * dépendance) avec le même dessin en opacités dégressives, couché dans le sens
 * du travail : cadrer, construire, livrer, et l'on repart.
 */
export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" className={`shrink-0 ${className}`}>
      <path d="M2.5 5 7 10l-4.5 5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" opacity="0.35" />
      <path d="M8 5l4.5 5L8 15" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" opacity="0.65" />
      <path d="M13.5 5 18 10l-4.5 5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LogoMark className="text-fd-primary" />
      <span className="font-heading mt-0.5 text-lg font-bold tracking-tight">
        Maedow <span className="text-fd-primary">Flow</span>
      </span>
    </span>
  );
}

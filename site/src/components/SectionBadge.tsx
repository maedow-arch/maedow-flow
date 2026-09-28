import type { ReactNode } from "react";

/**
 * Le petit repère noir posé devant chaque titre de section (« LE PROBLÈME »,
 * « CAPACITÉS »…), repris de l'esthétique « studio » : un carré plein, puis le
 * mot en petites capitales. Toujours sur une surface sombre, quel que soit le
 * thème, pour rester lisible sur les bandes claires comme sur les sombres.
 */
export function SectionBadge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-md bg-fd-foreground px-2.5 py-1 text-xs font-semibold tracking-wide text-fd-background uppercase">
      <span className="size-1.5 shrink-0 bg-fd-primary" aria-hidden="true" />
      {children}
    </span>
  );
}

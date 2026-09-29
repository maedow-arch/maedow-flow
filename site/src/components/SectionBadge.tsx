import type { ReactNode } from "react";

/**
 * Le petit repère noir posé devant chaque titre de section (« LE PROBLÈME »,
 * « CAPACITÉS »…), repris de l'esthétique « studio » : un carré plein, puis le
 * mot en petites capitales. Toujours sur une surface sombre, quel que soit le
 * thème, pour rester lisible sur les bandes claires comme sur les sombres.
 *
 * Il s'annonce avant son titre (`data-anime="badge"`, voir Scene) : il s'ouvre
 * de gauche à droite, son carré s'allume, et le mot se décode comme une
 * étiquette de terminal.
 */
export function SectionBadge({ children }: { children: ReactNode }) {
  return (
    <span
      data-anime="badge"
      className="inline-flex items-center gap-2 rounded-md bg-fd-foreground px-2.5 py-1 text-xs font-semibold tracking-wide whitespace-nowrap text-fd-background uppercase"
    >
      <span data-badge="point" className="size-1.5 shrink-0 bg-fd-primary" aria-hidden="true" />
      <span data-badge="texte">{children}</span>
    </span>
  );
}

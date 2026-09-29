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

/*
 * Le contour d'un chevron de la marque : la forme pleine de son trait (épaisseur
 * 2,4, bouts et coude arrondis), pour qu'un liseré la dessine comme il dessine
 * des lettres. Mêmes coordonnées que `LogoMark`, pointe à x + 4,5.
 */
function contourDeChevron(x: number) {
  const n = (v: number) => Number(v.toFixed(3));
  return [
    `M${n(x + 0.892)} 4.197`,
    `L${n(x + 5.392)} 9.197`,
    `A1.2 1.2 0 0 1 ${n(x + 5.392)} 10.803`,
    `L${n(x + 0.892)} 15.803`,
    `A1.2 1.2 0 0 1 ${n(x - 0.892)} 14.197`,
    `L${n(x + 2.887)} 10`,
    `L${n(x - 0.892)} 5.803`,
    `A1.2 1.2 0 0 1 ${n(x + 0.892)} 4.197Z`,
  ].join(" ");
}

/**
 * La marque en contour, pour la signature du pied de page : les trois chevrons
 * aux mêmes intensités que la marque, tracés du même liseré que les lettres
 * (`.flow-signature`). Le cadre est serré sur les chevrons : posée sur la ligne
 * de base, la marque a la hauteur des capitales.
 */
export function LogoContour({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="1 3.5 19 13" aria-hidden="true" className={className}>
      {[2.5, 8, 13.5].map((x, i) => (
        <path key={x} d={contourDeChevron(x)} opacity={[0.35, 0.65, 1][i]} vectorEffect="non-scaling-stroke" />
      ))}
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

/**
 * Les trois dérives d'un agent livré à lui-même, en tracés : chacune dessine ce
 * qu'elle nomme, plutôt qu'une icône décorative.
 *
 * Tracés au trait de la couleur primaire de la bande sombre qui les porte, avec
 * un seul élément plein par dessin : là où l'œil doit aller.
 */

const TRAIT = { stroke: "var(--color-fd-primary)", strokeWidth: 1.5, fill: "none" } as const;

/* Décisions inventées : un arbre de choix, dont une branche mène à ce que personne n'a décidé. */
export function DeriveDecisions() {
  return (
    <svg viewBox="0 0 240 120" className="h-full w-full" aria-hidden="true">
      <circle cx="30" cy="60" r="6" {...TRAIT} />
      <path d="M36 60 H80 M80 60 L120 30 M80 60 L120 60 M80 60 L120 90" {...TRAIT} opacity="0.55" />
      <circle cx="126" cy="30" r="5" {...TRAIT} opacity="0.55" />
      <circle cx="126" cy="60" r="5" {...TRAIT} opacity="0.55" />
      <path d="M131 90 H176" {...TRAIT} strokeDasharray="4 4" />
      <circle cx="194" cy="90" r="16" fill="var(--color-fd-primary)" opacity="0.14" />
      <circle cx="194" cy="90" r="16" {...TRAIT} />
      <text x="194" y="96" textAnchor="middle" fontSize="17" fontWeight="600" fill="var(--color-fd-primary)">
        ?
      </text>
      <circle cx="126" cy="90" r="5" {...TRAIT} />
    </svg>
  );
}

/* Périmètre qui s'élargit : le cadre du lot, et ce qui déborde autour. */
export function DerivePerimetre() {
  return (
    <svg viewBox="0 0 240 120" className="h-full w-full" aria-hidden="true">
      <rect x="18" y="8" width="204" height="104" rx="4" {...TRAIT} opacity="0.2" strokeDasharray="5 5" />
      <rect x="48" y="24" width="144" height="72" rx="4" {...TRAIT} opacity="0.4" strokeDasharray="5 5" />
      <rect x="84" y="42" width="72" height="36" rx="4" fill="var(--color-fd-primary)" opacity="0.14" />
      <rect x="84" y="42" width="72" height="36" rx="4" {...TRAIT} />
      <path d="M160 60 H186 M186 60 l-5 -4 M186 60 l-5 4" {...TRAIT} opacity="0.6" />
      <path d="M80 60 H54 M54 60 l5 -4 M54 60 l5 4" {...TRAIT} opacity="0.6" />
    </svg>
  );
}

/* Mémoire perdue : les lignes d'une session qui s'effacent, jusqu'à la rupture. */
export function DeriveMemoire() {
  const lignes = [
    { y: 26, w: 150, o: 1 },
    { y: 44, w: 122, o: 0.75 },
    { y: 62, w: 136, o: 0.5 },
    { y: 80, w: 98, o: 0.3 },
    { y: 98, w: 60, o: 0.15 },
  ];
  return (
    <svg viewBox="0 0 240 120" className="h-full w-full" aria-hidden="true">
      {lignes.map((l) => (
        <rect key={l.y} x="44" y={l.y - 3} width={l.w} height="6" rx="3" fill="var(--color-fd-primary)" opacity={l.o} />
      ))}
      <path d="M206 20 V100" {...TRAIT} strokeDasharray="3 6" opacity="0.5" />
      <circle cx="30" cy="26" r="4" fill="var(--color-fd-primary)" />
    </svg>
  );
}

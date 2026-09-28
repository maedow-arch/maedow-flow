/**
 * Les colonnes de dalles de verre qui encadrent l'ouverture, à la manière des
 * références : du relief et de la lumière de part et d'autre du titre, sans
 * image à charger. Tout est en CSS (`.flow-dalle`, `.flow-verre-*`).
 *
 * Chaque colonne est une pile de dalles de même largeur ; les piles se
 * décalent en hauteur pour former un relief de gradins. Les dalles portent
 * `data-hero="dalle"` : SceneHero les fait monter à l'ouverture.
 *
 * Masquées sous `lg` : sur un écran étroit, elles mangeraient le titre.
 */

type Colonne = { gauche: number; haut: number; largeur: number; dalles: number };

const GAUCHE: Colonne[] = [
  { gauche: -40, haut: 250, largeur: 118, dalles: 16 },
  { gauche: 70, haut: 470, largeur: 104, dalles: 10 },
];

const DROITE: Colonne[] = [
  { gauche: -40, haut: 170, largeur: 124, dalles: 19 },
  { gauche: 78, haut: 390, largeur: 108, dalles: 12 },
];

function Pile({ colonnes, cote }: { colonnes: Colonne[]; cote: "gauche" | "droite" }) {
  return (
    <div
      aria-hidden="true"
      className={`flow-verre pointer-events-none absolute inset-y-0 hidden w-[260px] lg:block ${
        cote === "gauche" ? "flow-verre-gauche left-0" : "flow-verre-droite right-0"
      }`}
    >
      {colonnes.map((c, i) => (
        <div
          key={i}
          className="absolute flex flex-col gap-[7px]"
          style={{ top: c.haut, width: c.largeur, [cote === "gauche" ? "left" : "right"]: c.gauche }}
        >
          {Array.from({ length: c.dalles }, (_, j) => (
            <div key={j} data-hero="dalle" className="flow-dalle" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function Verre() {
  return (
    <>
      <Pile colonnes={GAUCHE} cote="gauche" />
      <Pile colonnes={DROITE} cote="droite" />
    </>
  );
}

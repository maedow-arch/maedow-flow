/**
 * La séance de l'ouverture : un agent pressé, et les portes de Maedow Flow.
 *
 * C'est le cœur de la page, et elle ne décrit rien : elle montre. L'agent
 * commite sur main, le garde refuse ; il se corrige ; il déclare fini sans
 * preuve, le cycle le renvoie à la vérification ; il prouve. Le refus du garde
 * reprend le message réel de `.claude/hooks/garde.mjs`, et la sortie de git est
 * celle que git affiche : une démonstration qui inventerait ses répliques
 * promettrait ce que le kit ne tient pas.
 *
 * Chaque ligne porte `data-hero="ligne"` : SceneHero les fait apparaître une à
 * une, dans l'ordre de la séance. Sans script, elles sont toutes là.
 */

type Ton = "neutre" | "refus" | "accord";

const SEANCE: { qui: string; texte: string; ton: Ton }[] = [
  { qui: "agent", texte: 'git commit -m "Ajoute le panier"', ton: "neutre" },
  { qui: "garde", texte: "MF-003 : pas de commit sur main. Crée une branche, puis commite dessus.", ton: "refus" },
  { qui: "agent", texte: 'git switch -c feat/panier && git commit -m "Ajoute le panier"', ton: "neutre" },
  { qui: "git", texte: "[feat/panier 3f2a91c] Ajoute le panier", ton: "accord" },
  { qui: "agent", texte: "Le panier est fini, les tests passent.", ton: "neutre" },
  { qui: "cycle", texte: "MF-010 : fini veut dire constaté sur l'application. Lance /check verify.", ton: "refus" },
  { qui: "agent", texte: "/check verify panier", ton: "neutre" },
  { qui: "check", texte: "3 critères d'acceptation sur 3 constatés.", ton: "accord" },
];

export function Seance() {
  return (
    <figure data-hero="seance" className="flow-seance overflow-hidden rounded-xl border bg-fd-card">
      <figcaption className="border-b px-4 py-2.5 text-sm text-fd-muted-foreground">
        Une séance avec Maedow Flow
      </figcaption>
      <ol className="flex flex-col gap-2.5 px-4 py-4 font-snippet text-[13px] leading-relaxed">
        {SEANCE.map((ligne, i) => (
          <li key={i} data-hero="ligne" data-ton={ligne.ton} className="grid grid-cols-[3.25rem_1fr] gap-3">
            <span className="text-fd-muted-foreground">{ligne.qui}</span>
            <span className="break-words whitespace-pre-wrap">{ligne.texte}</span>
          </li>
        ))}
      </ol>
    </figure>
  );
}

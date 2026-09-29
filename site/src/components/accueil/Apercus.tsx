import type { ReactNode } from "react";

/**
 * Les aperçus des cinq phases : chacun montre l'artefact réel que la phase
 * produit ou vérifie, pas une illustration. Le scope de /scope, les checks de
 * la CI, les critères de /check verify, la pull request de mise en production,
 * la mesure qui décide d'une étape de montée en charge.
 *
 * Les valeurs sont celles d'un projet d'exemple (une boutique et son panier),
 * cohérentes avec la séance de l'ouverture.
 *
 * Chaque aperçu se construit quand sa carte arrive en haut de la pile (gestes
 * en `data-trace`, joués par `Phases`) : les coches se posent une à une, les
 * colonnes de la mesure montent. L'aperçu raconte ce que la phase a vérifié.
 */

function Coche({ ok = true }: { ok?: boolean }) {
  return (
    <span
      aria-hidden="true"
      data-trace="coche"
      className={`inline-flex size-4 shrink-0 items-center justify-center rounded-[3px] text-[10px] font-bold ${
        ok ? "bg-fd-primary text-fd-primary-foreground" : "border"
      }`}
    >
      {ok ? "✓" : ""}
    </span>
  );
}

function Cadre({ titre, children }: { titre: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border bg-fd-background">
      <p className="border-b px-4 py-2.5 font-snippet text-xs text-fd-muted-foreground">{titre}</p>
      <div className="p-4">{children}</div>
    </div>
  );
}

const STATUTS = {
  done: "text-fd-primary",
  "in-progress": "text-fd-foreground",
  "needs a decision": "flow-refus",
  planned: "text-fd-muted-foreground",
} as const;

export function ApercuCadrer() {
  const lignes: { n: number; f: string; s: keyof typeof STATUTS }[] = [
    { n: 1, f: "Catalogue", s: "done" },
    { n: 2, f: "Panier", s: "in-progress" },
    { n: 3, f: "Paiement", s: "needs a decision" },
    { n: 4, f: "Espace client", s: "planned" },
  ];
  return (
    <Cadre titre="docs/scope/scope.md">
      <ul className="flex flex-col divide-y text-sm">
        {lignes.map((l) => (
          <li key={l.n} data-trace="entree" className="flex items-center justify-between gap-3 py-2 first:pt-0 last:pb-0">
            <span>
              <span className="mr-3 font-snippet text-xs text-fd-muted-foreground">{l.n}</span>
              {l.f}
            </span>
            <span className={`font-snippet text-xs ${STATUTS[l.s]}`}>{l.s}</span>
          </li>
        ))}
      </ul>
    </Cadre>
  );
}

export function ApercuFonder() {
  const checks = [
    { nom: "verify", duree: "34 s" },
    { nom: "secrets", duree: "9 s" },
    { nom: "origine", duree: "3 s" },
  ];
  return (
    <Cadre titre="CI, pull request #1">
      <ul className="flex flex-col gap-2.5 text-sm">
        {checks.map((c) => (
          <li key={c.nom} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2.5">
              <Coche />
              <span className="font-snippet">{c.nom}</span>
            </span>
            <span className="font-snippet text-xs text-fd-muted-foreground">{c.duree}</span>
          </li>
        ))}
      </ul>
      <p data-trace="entree" className="mt-4 flex flex-wrap gap-2 text-xs">
        <span className="rounded border px-2 py-1">main protégée</span>
        <span className="rounded border px-2 py-1">develop protégée</span>
      </p>
    </Cadre>
  );
}

export function ApercuConstruire() {
  const criteres = ["Ajouter un produit au panier", "Changer la quantité", "Refuser une quantité au-delà du stock"];
  return (
    <Cadre titre="/check verify panier">
      <ul className="flex flex-col gap-2.5 text-sm">
        {criteres.map((c) => (
          <li key={c} className="flex items-center gap-2.5">
            <Coche />
            {c}
          </li>
        ))}
      </ul>
      <p data-trace="entree" className="mt-4 font-snippet text-xs text-fd-primary">3 critères sur 3 constatés sur l&apos;application</p>
    </Cadre>
  );
}

export function ApercuLivrer() {
  return (
    <Cadre titre="Pull request #12">
      <p className="font-medium">Mise en production : panier et paiement</p>
      <p className="mt-1 font-snippet text-xs text-fd-muted-foreground">develop → main</p>
      <ul className="mt-4 flex flex-col gap-2 text-sm">
        {["verify", "secrets", "origine", "parcours client constaté"].map((c) => (
          <li key={c} className="flex items-center gap-2.5">
            <Coche />
            <span className="font-snippet text-xs">{c}</span>
          </li>
        ))}
      </ul>
      <span data-trace="point" className="mt-4 inline-flex rounded-[3px] bg-fd-primary px-3 py-1.5 text-xs font-semibold text-fd-primary-foreground">
        Fusionner
      </span>
    </Cadre>
  );
}

/* Des hauteurs qui montent : le trafic grimpe, et c'est la mesure qui décidera d'ajouter une brique. */
const BARRES = [14, 16, 15, 19, 22, 21, 26, 30, 29, 35, 41, 46, 52, 60, 69, 80];

export function ApercuExploiter() {
  return (
    <Cadre titre="p95, liste des commandes">
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-heading text-3xl font-medium">280 ms</p>
        <p className="text-xs text-fd-muted-foreground">seuil fixé : 300 ms</p>
      </div>
      <div aria-hidden="true" className="mt-5 flex h-28 items-end gap-1.5">
        {BARRES.map((h, i) => (
          <span
            key={i}
            data-trace="montee"
            className="flex-1 rounded-t-[2px] bg-gradient-to-t from-transparent to-fd-primary"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
      <p data-trace="entree" className="mt-3 text-xs text-fd-muted-foreground">Sous le seuil : aucune brique à ajouter (MF-014).</p>
    </Cadre>
  );
}

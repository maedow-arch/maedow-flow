import { LogoMark } from "@/components/Logo";

/**
 * La démonstration de l'ouverture : une séance entre toi, ton agent et Maedow
 * Flow, présentée comme une conversation.
 *
 * Elle ne décrit rien, elle montre. L'agent veut commiter sur main : refusé
 * (MF-003). Il déclare fini sans preuve : renvoyé à la vérification (MF-010).
 * Il prouve, et la porte s'ouvre. Les refus reprennent les règles réelles du
 * corpus ; une démonstration qui inventerait ses répliques promettrait ce que le
 * kit ne tient pas.
 *
 * Chaque message porte `data-hero="ligne"` : SceneHero les fait arriver un à
 * un. Sans script, ils sont tous là.
 */

type Message =
  | { qui: "toi"; texte: string }
  | { qui: "agent"; texte: string; code?: string }
  | { qui: "flow"; texte: string; regle: string; issue: "refus" | "accord" };

const MESSAGES: Message[] = [
  { qui: "toi", texte: "Ajoute le panier, puis pousse." },
  { qui: "agent", texte: "Je commite sur main.", code: 'git commit -m "Ajoute le panier"' },
  { qui: "flow", regle: "MF-003", issue: "refus", texte: "Refusé : pas de commit sur main. Crée une branche, puis ouvre une pull request." },
  { qui: "agent", texte: "Branche feat/panier créée, commit fait. Le panier est fini, les tests passent." },
  { qui: "flow", regle: "MF-010", issue: "refus", texte: "Pas encore : fini veut dire constaté sur l'application. Lance la vérification." },
  { qui: "agent", texte: "3 critères d'acceptation sur 3 constatés. J'ouvre la pull request vers develop.", code: "/check verify panier" },
  { qui: "flow", regle: "MF-010", issue: "accord", texte: "Porte franchie." },
];

function Avatar({ qui }: { qui: "agent" | "flow" }) {
  if (qui === "flow") {
    return (
      <span className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-fd-background text-fd-primary">
        <LogoMark className="size-4" />
      </span>
    );
  }
  return (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-fd-background font-snippet text-xs text-fd-muted-foreground">
      IA
    </span>
  );
}

export function Conversation() {
  return (
    <figure data-hero="seance" className="flow-coins relative mx-auto w-full max-w-4xl border bg-fd-card/85 backdrop-blur-md">
      <figcaption className="flex items-center justify-between gap-4 border-b px-5 py-3 text-sm">
        <span className="text-fd-muted-foreground">Une séance avec ton agent</span>
        <span className="inline-flex items-center gap-2 text-xs font-medium">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-fd-primary" />
          Maedow Flow actif
        </span>
      </figcaption>
      <ol className="flex flex-col gap-4 px-4 py-6 sm:px-8 sm:py-8">
        {MESSAGES.map((m, i) =>
          m.qui === "toi" ? (
            <li key={i} data-hero="ligne" className="flex justify-end">
              <p className="max-w-[26rem] rounded-lg border bg-fd-background px-4 py-2.5 text-sm">{m.texte}</p>
            </li>
          ) : (
            <li key={i} data-hero="ligne" className="flex items-start gap-3">
              <Avatar qui={m.qui} />
              <div
                className={`max-w-[34rem] rounded-lg border px-4 py-2.5 text-sm ${
                  m.qui === "flow" && m.issue === "refus"
                    ? "border-[color-mix(in_srgb,var(--flow-refus)_45%,transparent)] bg-[color-mix(in_srgb,var(--flow-refus)_8%,transparent)]"
                    : m.qui === "flow"
                      ? "border-[color-mix(in_srgb,var(--color-fd-primary)_50%,transparent)] bg-[color-mix(in_srgb,var(--color-fd-primary)_8%,transparent)]"
                      : "bg-fd-background"
                }`}
              >
                {m.qui === "flow" ? (
                  <span
                    className={`mb-1 inline-flex items-center gap-1.5 font-snippet text-xs font-medium ${
                      m.issue === "refus" ? "flow-refus" : "text-fd-primary"
                    }`}
                  >
                    {m.issue === "refus" ? "Refusé" : "Accepté"} ({m.regle})
                  </span>
                ) : null}
                {m.qui === "agent" && m.code ? (
                  <code className="mb-1.5 block w-fit rounded bg-fd-card px-2 py-1 font-snippet text-xs text-fd-muted-foreground">
                    {m.code}
                  </code>
                ) : null}
                <p className={m.qui === "flow" ? "text-fd-foreground" : ""}>{m.texte}</p>
              </div>
            </li>
          ),
        )}
      </ol>
    </figure>
  );
}

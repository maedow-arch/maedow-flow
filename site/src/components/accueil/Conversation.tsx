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
 * La séance se joue quand on arrive dessus (SceneHero) : ta demande se tape,
 * l'agent et Maedow Flow « écrivent » avant de répondre, et leurs réponses se
 * génèrent mot à mot. Les éléments déclarent leur rôle en `data-seance`. Sans
 * script ou sous mouvement réduit, toute la séance est là, et l'indicateur de
 * saisie reste caché.
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
      <span data-seance="avatar" className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-fd-background text-fd-primary">
        <LogoMark className="size-4" />
      </span>
    );
  }
  return (
    <span
      data-seance="avatar"
      className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-fd-background font-snippet text-xs text-fd-muted-foreground"
    >
      IA
    </span>
  );
}

/* Les trois points de « en train d'écrire », posés là où la réponse va paraître. */
function Saisie() {
  return (
    <span
      aria-hidden="true"
      data-seance="saisie"
      className="flow-saisie invisible absolute top-0 left-11 inline-flex h-10 items-center gap-1 rounded-lg border bg-fd-background px-4 opacity-0"
    >
      <span />
      <span />
      <span />
    </span>
  );
}

export function Conversation() {
  return (
    <figure data-hero="seance" className="flow-coins relative mx-auto flex w-full max-w-4xl flex-col border bg-fd-card/85 backdrop-blur-md">
      <figcaption className="flex items-center justify-between gap-4 border-b px-5 py-3 text-sm">
        <span className="text-fd-muted-foreground">Une séance avec ton agent</span>
        <span className="inline-flex items-center gap-2 text-xs font-medium">
          <span aria-hidden="true" className="relative flex size-1.5">
            <span data-seance="veille" className="absolute inset-0 rounded-full bg-fd-primary opacity-0" />
            <span className="size-1.5 rounded-full bg-fd-primary" />
          </span>
          Maedow Flow actif
        </span>
      </figcaption>
      {/* La fenêtre de la séance : quand l'écran est trop court pour elle, la discussion y remonte au fil des messages. */}
      <div data-seance="fenetre" className="min-h-0 flex-1 overflow-hidden">
      <ol data-seance="fil" className="flex flex-col gap-4 px-4 py-6 sm:px-8 sm:py-8">
        {MESSAGES.map((m, i) =>
          m.qui === "toi" ? (
            <li key={i} data-seance="message" data-qui="toi" className="flex justify-end">
              <p className="max-w-104 rounded-lg border bg-fd-background px-4 py-2.5 text-sm">
                <span data-seance="frappe">{m.texte}</span>
                <span
                  aria-hidden="true"
                  data-seance="curseur"
                  className="flow-curseur ml-px hidden h-[1.1em] w-px translate-y-[0.2em] bg-fd-primary"
                />
              </p>
            </li>
          ) : (
            <li key={i} data-seance="message" data-qui={m.qui} className="relative flex items-start gap-3">
              <Avatar qui={m.qui} />
              <Saisie />
              <div
                data-seance="bulle"
                data-issue={m.qui === "flow" ? m.issue : undefined}
                className={`max-w-136 rounded-lg border px-4 py-2.5 text-sm ${
                  m.qui === "flow" && m.issue === "refus"
                    ? "border-[color-mix(in_srgb,var(--flow-refus)_45%,transparent)] bg-[color-mix(in_srgb,var(--flow-refus)_8%,transparent)]"
                    : m.qui === "flow"
                      ? "border-[color-mix(in_srgb,var(--color-fd-primary)_50%,transparent)] bg-[color-mix(in_srgb,var(--color-fd-primary)_8%,transparent)]"
                      : "bg-fd-background"
                }`}
              >
                {m.qui === "flow" ? (
                  <span
                    data-seance="verdict"
                    className={`mb-1 inline-flex items-center gap-1.5 font-snippet text-xs font-medium ${
                      m.issue === "refus" ? "flow-refus" : "text-fd-primary"
                    }`}
                  >
                    {m.issue === "refus" ? "Refusé" : "Accepté"} ({m.regle})
                  </span>
                ) : null}
                {m.qui === "agent" && m.code ? (
                  <code
                    data-seance="code"
                    className="mb-1.5 block w-fit rounded bg-fd-card px-2 py-1 font-snippet text-xs text-fd-muted-foreground"
                  >
                    {m.code}
                  </code>
                ) : null}
                <p data-seance="texte" className={m.qui === "flow" ? "text-fd-foreground" : ""}>
                  {m.texte}
                </p>
              </div>
            </li>
          ),
        )}
      </ol>
      </div>
    </figure>
  );
}

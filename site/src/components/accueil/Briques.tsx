import Link from "next/link";
import type { ReactNode } from "react";

/**
 * « Ce que Maedow Flow réunit », en grille de cartes à visuels, à la manière
 * des bentos des références. Deux grandes cartes portent un aperçu réel (les
 * skills du moteur, les codes des règles) ; les autres restent textuelles, et
 * chacune mène à sa page du corpus.
 */

const SKILLS = ["/scope", "/architect", "/develop", "/check", "/test", "/debug", "/sync", "/audit", "/document", "/flow"];
const REGLES = Array.from({ length: 17 }, (_, i) => `MF-${String(i + 1).padStart(3, "0")}`);

function Carte({
  nom,
  texte,
  url,
  visuel,
  large = false,
}: {
  nom: string;
  texte: string;
  url: string;
  visuel?: ReactNode;
  large?: boolean;
}) {
  return (
    <Link
      href={url}
      data-anime="carte"
      className={`flow-coins group flex min-w-0 flex-col border bg-fd-card transition-colors hover:bg-fd-accent ${
        large ? "md:col-span-2" : ""
      }`}
    >
      {visuel ? <div className="flow-sombre m-2 mb-0 overflow-hidden rounded-sm p-5">{visuel}</div> : null}
      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-heading text-xl font-medium tracking-tight">{nom}</h3>
        <p className="mt-2 text-sm text-fd-muted-foreground">{texte}</p>
        <span className="mt-auto pt-5 text-sm font-medium text-fd-primary group-hover:underline">Lire la page</span>
      </div>
    </Link>
  );
}

export function Briques() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Carte
        large
        nom="Le moteur"
        url="/docs/claude-code"
        texte="Les skills qui cadrent, décident, construisent et vérifient. Maedow Flow les ordonne et comble ce qu'ils ne couvrent pas."
        visuel={
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {SKILLS.map((s) => (
              <li
                key={s}
                className={`rounded-sm border px-2 py-2 text-center font-snippet text-xs ${
                  s === "/flow" ? "border-fd-primary text-fd-primary" : "text-fd-muted-foreground"
                }`}
              >
                {s}
              </li>
            ))}
          </ul>
        }
      />
      <Carte
        nom="Les règles"
        url="/docs/regles"
        texte="Dix-sept règles codées, chacune avec ce qui la fait respecter."
        visuel={
          <ul className="grid grid-cols-3 gap-1.5">
            {REGLES.slice(0, 9).map((r) => (
              <li key={r} className="rounded-sm border px-1.5 py-1 text-center font-snippet text-[11px] text-fd-muted-foreground">
                {r}
              </li>
            ))}
          </ul>
        }
      />
      <Carte nom="Le kit" url="/docs/demarrer" texte="AGENTS.md, garde-fous de l'agent, hooks git, CI GitHub, installés par /flow sans rien écraser." />
      <Carte nom="Les profils" url="/docs/plateformes" texte="Les stacks par défaut pour le web, le mobile et le desktop, avec leur degré de preuve." />
      <Carte nom="Les socles" url="/docs/securite" texte="La sécurité minimale, et ce qu'il faut pour ne pas tomber sous la charge." />
      <Carte
        large
        nom="Les prompts"
        url="/docs/prompts"
        texte="Les formulations éprouvées pour chaque moment du cycle : planifier, simplifier un plan trop ambitieux, vérifier un constat, corriger seulement ce qui est confirmé."
        visuel={
          <p className="font-snippet text-xs leading-relaxed text-fd-muted-foreground">
            <span className="text-fd-foreground">Corrige uniquement les problèmes confirmés de la relecture.</span>
            <br />
            Ne refonds pas la feature et n&apos;élargis pas son périmètre. Relance les vérifications après les
            corrections et résume exactement ce qui a changé.
          </p>
        }
      />
      <Carte nom="Le cycle" url="/docs/cycle" texte="Cinq phases, une porte vérifiable à la sortie de chacune, et quatre paliers d'exigence." />
    </div>
  );
}

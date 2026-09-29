"use client";

import { useRef, useState, type ReactNode } from "react";
import { ScrollTrigger, enregistrerAnimation, useGSAP } from "@/lib/animation";
import { ApercuCadrer, ApercuConstruire, ApercuExploiter, ApercuFonder, ApercuLivrer } from "./Apercus";

enregistrerAnimation();

/**
 * Les cinq phases en panneaux empilés, avec un index qui suit la lecture, à la
 * manière des « Solutions » d'AgentFlow.
 *
 * L'index n'anime rien : il dit où l'on est. Chaque panneau devient actif quand
 * il occupe le milieu de l'écran, et c'est un état React, pas une animation :
 * il vaut aussi sous `prefers-reduced-motion`. Sans script, l'index reste une
 * liste de liens vers les panneaux.
 */

const PHASES: { id: string; nom: string; porte: string; texte: string; apercu: ReactNode }[] = [
  {
    id: "cadrer",
    nom: "Cadrer",
    porte: "Chaque feature tient en une intention et une ligne « Fini quand ».",
    texte:
      "/scope pose les questions que toi seul peux trancher, découpe l'idée en features, les ordonne et fixe leur palier d'exigence. Il ne choisit aucun outil : ce n'est pas son travail.",
    apercu: <ApercuCadrer />,
  },
  {
    id: "fonder",
    nom: "Fonder",
    porte: "Un projet vide passe verify, en local et en CI.",
    texte:
      "La stack est décidée par écrit, le projet échafaudé, le kit installé : garde-fous de l'agent, hooks git, CI et protection des branches, avant la première ligne de code métier.",
    apercu: <ApercuFonder />,
  },
  {
    id: "construire",
    nom: "Construire",
    porte: "Chaque critère d'acceptation est constaté sur l'application qui tourne.",
    texte:
      "Une feature à la fois, sur sa branche. Des tests verts ne suffisent pas : /check verify fait tourner l'application et constate chaque critère avant que la pull request parte.",
    apercu: <ApercuConstruire />,
  },
  {
    id: "livrer",
    nom: "Livrer",
    porte: "Les parcours critiques sont vérifiés, aucun constat critique n'est ouvert.",
    texte:
      "Revue d'ensemble sur un regard neuf, revue de sécurité, parcours complets constatés sur l'aperçu. Puis develop rejoint main, par pull request, et c'est toi qui fusionnes.",
    apercu: <ApercuLivrer />,
  },
  {
    id: "exploiter",
    nom: "Exploiter",
    porte: "On mesure avant d'ajouter la moindre brique.",
    texte:
      "Erreurs, journaux et analytique dès le premier jour. Un cache, une file ou une réplique n'entrent qu'avec la mesure qui les justifie, citée dans leur spec.",
    apercu: <ApercuExploiter />,
  },
];

export function Phases() {
  const racine = useRef<HTMLDivElement>(null);
  const [actif, setActif] = useState(0);

  useGSAP(
    () => {
      const panneaux = racine.current?.querySelectorAll<HTMLElement>("[data-phase]") ?? [];
      const declencheurs = Array.from(panneaux, (panneau, i) =>
        ScrollTrigger.create({
          trigger: panneau,
          start: "top center",
          end: "bottom center",
          onToggle: (self) => {
            if (self.isActive) setActif(i);
          },
        }),
      );
      return () => declencheurs.forEach((d) => d.kill());
    },
    { scope: racine },
  );

  return (
    <div ref={racine} className="grid gap-10 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-14">
      <nav aria-label="Les cinq phases" className="hidden lg:block">
        <ol className="sticky top-28 flex flex-col">
          {PHASES.map((p, i) => (
            <li key={p.id}>
              <a
                href={`#phase-${p.id}`}
                aria-current={actif === i ? "step" : undefined}
                className={`flex items-center gap-3 border-b py-3 text-sm transition-colors ${
                  actif === i ? "text-fd-foreground" : "text-fd-muted-foreground hover:text-fd-foreground"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`size-1.5 shrink-0 transition-colors ${actif === i ? "bg-fd-primary" : "bg-fd-border"}`}
                />
                {p.nom}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="flex flex-col gap-6">
        {PHASES.map((p, i) => (
          <article
            key={p.id}
            id={`phase-${p.id}`}
            data-phase
            className="flow-coins grid scroll-mt-28 gap-8 border bg-fd-card p-6 sm:p-8 md:grid-cols-2"
          >
            <div className="flex flex-col">
              <p className="font-snippet text-xs text-fd-muted-foreground">Phase {i}</p>
              <h3 className="font-heading mt-2 text-2xl font-medium tracking-tight sm:text-3xl">{p.nom}</h3>
              <p className="mt-3 text-sm text-fd-muted-foreground">{p.texte}</p>
              <p className="mt-auto pt-8 text-sm">
                <span className="text-fd-primary">Porte : </span>
                {p.porte}
              </p>
            </div>
            <div className="self-center">{p.apercu}</div>
          </article>
        ))}
      </div>
    </div>
  );
}

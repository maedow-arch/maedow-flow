"use client";

import { useRef, useState, type MouseEvent, type ReactNode } from "react";
import { COURBE, ScrollTrigger, enregistrerAnimation, gsap, tracer, useGSAP } from "@/lib/animation";
import { ApercuCadrer, ApercuConstruire, ApercuExploiter, ApercuFonder, ApercuLivrer } from "./Apercus";

enregistrerAnimation();

/**
 * Les cinq phases en cartes qui s'empilent au défilement, avec un index qui
 * suit la carte du dessus.
 *
 * L'empilement dit le cycle : une phase ne disparaît pas quand la suivante
 * commence, elle reste dessous, et c'est sur elle que la suivante s'appuie.
 * Chaque carte se colle un cran plus bas que la précédente (CSS `sticky`, à
 * partir de `md`), la suivante vient la recouvrir, et les cartes recouvertes
 * reculent et s'assombrissent au rythme du défilement. Sur un téléphone, une
 * carte dépasse la hauteur de l'écran : on la recouvrirait avant de l'avoir
 * lue, les cartes s'y suivent donc sans s'empiler.
 *
 * Les positions de collage sont calculées, pas mesurées sur les cartes : une
 * carte collée n'est plus à sa place dans le flux, et ScrollTrigger mesurerait
 * sa position collée. On les déduit de la colonne, qui ne colle pas, et de la
 * hauteur des cartes qui la précèdent.
 *
 * L'index est un état React, pas une animation : il vaut aussi sous
 * `prefers-reduced-motion`. Ses liens défilent jusqu'à la position de collage
 * de leur carte ; un lien d'ancre ordinaire ne remonterait pas vers une carte
 * déjà collée, que le navigateur croit à l'écran. Sans script, l'index reste une
 * liste de liens vers les cartes.
 */

/* La carte i se colle à HAUT + i × CRAN pixels : le haut de chaque carte recouverte reste visible au-dessus de la suivante. HAUT s'aligne sur l'index (`top-28`). */
const HAUT = 112;
const CRAN = 16;

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
  const pile = useRef<HTMLDivElement>(null);
  const [actif, setActif] = useState(0);
  /* La position de défilement où chaque carte se colle. */
  const collages = useRef<number[]>([]);

  useGSAP(
    () => {
      const colonne = pile.current;
      if (!colonne) return;
      const cartes = Array.from(colonne.querySelectorAll<HTMLElement>("[data-phase]"));
      const dernier = cartes.length - 1;

      function mesurer() {
        if (!colonne) return;
        const haut = colonne.getBoundingClientRect().top + window.scrollY;
        const ecart = Number.parseFloat(getComputedStyle(colonne).rowGap) || 0;
        let parcouru = 0;
        collages.current = cartes.map((carte, i) => {
          const collage = haut + parcouru - (HAUT + i * CRAN);
          parcouru += carte.offsetHeight + ecart;
          return collage;
        });
      }

      /* La carte active est celle qui a fait plus de la moitié du chemin depuis le collage de la précédente. */
      function carteActive(defilement: number) {
        const c = collages.current;
        let i = 0;
        while (i < dernier && defilement >= (c[i]! + c[i + 1]!) / 2) i++;
        return i;
      }

      mesurer();
      ScrollTrigger.addEventListener("refreshInit", mesurer);
      const suivi = ScrollTrigger.create({
        trigger: colonne,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => setActif(carteActive(self.scroll())),
        onRefresh: (self) => setActif(carteActive(self.scroll())),
      });

      const media = gsap.matchMedia();
      media.add(
        { mouvement: "(prefers-reduced-motion: no-preference)", empile: "(min-width: 768px)" },
        (contexte) => {
          const { mouvement, empile } = contexte.conditions as { mouvement: boolean; empile: boolean };
          if (!mouvement) return;

          /* L'aperçu de chaque carte se construit quand elle approche de sa place : on voit la phase produire son artefact. */
          cartes.forEach((carte, i) => {
            const apercu = carte.querySelector("[data-apercu]");
            if (!apercu) return;
            const dessin = tracer(apercu);
            ScrollTrigger.create({
              start: () => collages.current[i]! - window.innerHeight * 0.4,
              end: "max",
              once: true,
              onEnter: () => void dessin.play(),
            });
          });

          if (!empile) return;

          /*
           * Une carte recouverte recule d'un cran par carte posée sur elle, depuis
           * son bord haut, qui reste visible : la pile se lit en profondeur. Son
           * voile se ferme pendant que la suivante la recouvre.
           */
          cartes.slice(0, dernier).forEach((carte, i) => {
            gsap.to(carte, {
              scale: 1 - (dernier - i) * 0.035,
              transformOrigin: "50% 0%",
              ease: COURBE.continu,
              scrollTrigger: {
                start: () => collages.current[i]!,
                end: () => collages.current[dernier]!,
                scrub: true,
              },
            });
            const voile = carte.querySelector("[data-voile]");
            if (voile) {
              gsap.to(voile, {
                opacity: 0.55,
                ease: COURBE.continu,
                scrollTrigger: {
                  start: () => collages.current[i]!,
                  end: () => collages.current[i + 1]!,
                  scrub: true,
                },
              });
            }
          });
        },
      );

      return () => {
        ScrollTrigger.removeEventListener("refreshInit", mesurer);
        suivi.kill();
        media.revert();
      };
    },
    { scope: racine },
  );

  function aller(i: number, evenement: MouseEvent) {
    const cible = collages.current[i];
    if (cible === undefined) return;
    evenement.preventDefault();
    const reduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: cible, behavior: reduit ? "auto" : "smooth" });
  }

  return (
    <div ref={racine} className="grid gap-10 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-14">
      <nav aria-label="Les cinq phases" className="hidden lg:block">
        {/* Le repère vert glisse d'une phase à l'autre : on voit le chemin parcouru, pas seulement l'étape. */}
        <div className="sticky top-28 border-l">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-0 -left-px w-0.5 bg-fd-primary transition-transform duration-500 ease-out motion-reduce:transition-none"
            style={{ height: `${100 / PHASES.length}%`, transform: `translateY(${actif * 100}%)` }}
          />
          <ol className="flex flex-col">
            {PHASES.map((p, i) => (
              <li key={p.id}>
                <a
                  href={`#phase-${p.id}`}
                  onClick={(e) => aller(i, e)}
                  aria-current={actif === i ? "step" : undefined}
                  className={`flex items-center gap-3 border-b py-3 pl-4 text-sm transition-colors duration-300 ${
                    actif === i ? "text-fd-foreground" : "text-fd-muted-foreground hover:text-fd-foreground"
                  }`}
                >
                  <span className="font-snippet text-xs text-fd-muted-foreground">{i}</span>
                  {p.nom}
                </a>
              </li>
            ))}
          </ol>
        </div>
      </nav>

      <div ref={pile} className="flex flex-col gap-6">
        {PHASES.map((p, i) => (
          <article
            key={p.id}
            id={`phase-${p.id}`}
            data-phase
            style={{ top: HAUT + i * CRAN, scrollMarginTop: HAUT + i * CRAN }}
            className="flow-coins grid gap-8 border bg-fd-card p-6 sm:p-8 md:sticky md:grid-cols-2"
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
            <div data-apercu className="self-center">
              {p.apercu}
            </div>
            {/* Le voile d'une carte recouverte : ouvert sans script et sous mouvement réduit. */}
            <span aria-hidden="true" data-voile className="pointer-events-none absolute inset-0 bg-fd-background opacity-0" />
          </article>
        ))}
      </div>
    </div>
  );
}

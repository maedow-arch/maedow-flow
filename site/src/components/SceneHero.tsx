"use client";

import { useRef, type ReactNode } from "react";
import { COURBE, DECALAGE, DUREE, SplitText, enregistrerAnimation, gsap, useGSAP } from "@/lib/animation";

enregistrerAnimation();

/**
 * L'ouverture de la page.
 *
 * Elle est déjà visible quand la page s'affiche : rien ne s'y déclenche au
 * défilement, tout s'enchaîne dans l'ordre de lecture, et cet ordre est
 * l'argument. Le constat, la réponse, la promesse, puis la séance qui les
 * prouve : un agent arrêté par une porte, qui se corrige et prouve.
 *
 * Le titre se découpe en mots et non en caractères. Chez Maedow Arch, deux mots
 * très grands portent le nom et méritent la lettre à lettre ; ici c'est une
 * phrase, et une phrase animée lettre à lettre se lit moins vite qu'elle ne
 * s'affiche.
 *
 * Le fond pointillé dérive au défilement : le seul mouvement continu de la page.
 */
export function SceneHero({ children }: { children: ReactNode }) {
  const racine = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const media = gsap.matchMedia();

      media.add("(prefers-reduced-motion: no-preference)", () => {
        const scope = racine.current;
        if (!scope) return;

        const titre = scope.querySelector<HTMLElement>('[data-hero="titre"]');
        if (titre) {
          SplitText.create(titre, {
            type: "words, lines",
            mask: "lines",
            autoSplit: true,
            onSplit(decoupe) {
              return gsap.from(decoupe.words, {
                yPercent: 115,
                duration: DUREE.bloc,
                ease: COURBE.sortie,
                stagger: DECALAGE.mot,
              });
            },
          });
        }

        /*
         * Des décalages négatifs : une cascade où chacun attend la fin du
         * précédent paraît laborieuse. Puis la séance se joue ligne à ligne :
         * c'est le seul moment orchestré de l'ouverture, et il porte l'argument
         * (l'agent est arrêté, se corrige, prouve).
         */
        gsap
          .timeline({ defaults: { ease: COURBE.sortie } })
          /* Les dalles de verre montent d'abord, dans le désordre : un décor qui se pose avant qu'on parle. */
          .from('[data-hero="dalle"]', { y: 32, autoAlpha: 0, duration: 0.6, stagger: { each: 0.02, from: "random" } }, 0)
          .from('[data-hero="promesse"]', { y: 16, autoAlpha: 0, duration: DUREE.bloc }, titre ? 0.5 : 0.15)
          .from('[data-hero="actions"]', { y: 12, autoAlpha: 0, duration: DUREE.fragment }, "-=0.45")
          .from('[data-hero="seance"]', { y: 18, autoAlpha: 0, duration: DUREE.bloc }, "-=0.4")
          .from('[data-hero="ligne"]', { y: 6, autoAlpha: 0, duration: 0.35, stagger: DECALAGE.echange }, "-=0.25");

        /* `scrub` attache la dérive au défilement : le mouvement appartient au lecteur. */
        const fond = scope.querySelector<HTMLElement>('[data-hero="fond"]');
        if (fond) {
          gsap.to(fond, {
            yPercent: 14,
            ease: COURBE.continu,
            scrollTrigger: { trigger: scope, start: "top top", end: "bottom top", scrub: 0.6 },
          });
        }
      });

      return () => media.revert();
    },
    { scope: racine },
  );

  return <div ref={racine}>{children}</div>;
}

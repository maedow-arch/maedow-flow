"use client";

import { useRef, type ReactNode } from "react";
import { COURBE, DECALAGE, DUREE, SplitText, enregistrerAnimation, gsap, useGSAP } from "@/lib/animation";

enregistrerAnimation();

/**
 * L'ouverture de la page.
 *
 * Elle est déjà visible quand la page s'affiche : rien ne s'y déclenche au
 * défilement, tout s'enchaîne dans l'ordre de lecture, et cet ordre est
 * l'argument. Le constat, puis la réponse, puis la promesse, et le prompt en
 * dernier, parce qu'il ne veut rien dire tant que les trois premiers n'ont pas
 * été lus.
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

        /* Des décalages négatifs : une cascade où chacun attend la fin du précédent paraît laborieuse. */
        gsap
          .timeline({ defaults: { ease: COURBE.sortie } })
          .from('[data-hero="badge"]', { y: -8, autoAlpha: 0, duration: DUREE.fragment }, 0.1)
          .from('[data-hero="promesse"]', { y: 16, autoAlpha: 0, duration: DUREE.bloc }, titre ? 0.55 : 0.2)
          .from('[data-hero="actions"]', { y: 12, autoAlpha: 0, duration: DUREE.fragment }, "-=0.45")
          .from('[data-hero="commande"]', { y: 18, autoAlpha: 0, scale: 0.985, duration: DUREE.bloc }, "-=0.35");

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

"use client";

import { COURBE, DUREE, ScrollTrigger, enregistrerAnimation, gsap, useGSAP } from "@/lib/animation";

enregistrerAnimation();

/**
 * La barre de navigation de l'accueil : son entrée, puis sa réaction au défilement.
 * Reprise de Maedow Arch.
 *
 * **L'entrée.** La barre descend et ses éléments se posent avant le titre : le
 * lecteur situe d'abord où il est, ensuite ce qu'on lui dit.
 *
 * **Le défilement.** En haut de page, la barre laisse voir la trame de
 * l'ouverture ; dès que le contenu passe dessous, elle reprend son fond. Le
 * script décide du moment (`data-pose`), la feuille de style de l'apparence.
 *
 * Le composant ne rend aucune balise : la barre est `sticky`, et l'envelopper la
 * rendrait collante à l'intérieur de son conteneur, c'est-à-dire nulle part.
 */
export function NavbarCondensee() {
  useGSAP(() => {
    const media = gsap.matchMedia();

    media.add("(prefers-reduced-motion: no-preference)", () => {
      const barre = document.querySelector<HTMLElement>("[data-navbar]");
      if (!barre) return;

      /* On anime le contenu, pas le `header` : une transformation sur un élément `sticky` l'empêche de coller. */
      const rangee = barre.firstElementChild;
      const anime = [rangee, "[data-navbar-marque]", "[data-navbar-action]"];

      const entree = gsap.timeline({
        defaults: { ease: COURBE.sortie },
        onComplete: () => gsap.set(anime, { clearProps: "all" }),
      });
      entree
        .from(rangee, { y: -28, autoAlpha: 0, duration: DUREE.bloc })
        .from("[data-navbar-marque]", { x: -12, autoAlpha: 0, duration: DUREE.fragment }, "-=0.35")
        .from("[data-navbar-action]", { y: -8, autoAlpha: 0, duration: DUREE.fragment, stagger: 0.07 }, "-=0.3");

      /* `end: 99999` garde le déclencheur actif jusqu'en bas : sans fin explicite, la bascule n'a jamais lieu. */
      barre.dataset.pose = "true";
      const bascule = ScrollTrigger.create({
        start: "top -8",
        end: 99999,
        onToggle: (self) => {
          barre.dataset.pose = self.isActive ? "false" : "true";
        },
      });

      return () => {
        bascule.kill();
        entree.kill();
        gsap.set(anime, { clearProps: "all" });
        delete barre.dataset.pose;
      };
    });

    return () => media.revert();
  });

  return null;
}

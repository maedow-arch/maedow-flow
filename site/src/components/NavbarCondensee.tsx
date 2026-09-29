"use client";

import { COURBE, DUREE, ScrollTrigger, enregistrerAnimation, gsap, useGSAP } from "@/lib/animation";

enregistrerAnimation();

/**
 * La barre de navigation de l'accueil : sa réaction au défilement, puis son entrée.
 * Reprise de Maedow Arch.
 *
 * **Le défilement.** En haut de page, la barre laisse voir la trame de
 * l'ouverture, sans fond ni trait ; dès que le contenu passe dessous, les deux
 * reviennent ensemble. Le script décide du moment (`data-pose`), la feuille de
 * style de l'apparence. Ce n'est pas une animation : la bascule vaut pour tout
 * le monde, y compris sous `prefers-reduced-motion`.
 *
 * **L'entrée.** La barre descend et ses éléments se posent avant le titre : le
 * lecteur situe d'abord où il est, ensuite ce qu'on lui dit. Elle seule dépend
 * de la préférence de mouvement.
 *
 * **Le logo.** Celui de la barre comme celui du pied de page (`data-remonter`)
 * ramènent en haut de l'accueil : un lien vers la page où l'on est déjà ne
 * ferait rien. La remontée est douce, sauf sous mouvement réduit ;
 * un clic avec modificateur (nouvel onglet) garde son comportement de lien.
 *
 * Le composant ne rend aucune balise : la barre est `sticky`, et l'envelopper la
 * rendrait collante à l'intérieur de son conteneur, c'est-à-dire nulle part.
 */
export function NavbarCondensee() {
  useGSAP(() => {
    const barre = document.querySelector<HTMLElement>("[data-navbar]");
    if (!barre) return;

    /* `end: 99999` garde le déclencheur actif jusqu'en bas : sans fin explicite, la bascule n'a jamais lieu. */
    barre.dataset.pose = "true";
    const bascule = ScrollTrigger.create({
      start: "top -8",
      end: 99999,
      onToggle: (self) => {
        barre.dataset.pose = self.isActive ? "false" : "true";
      },
    });

    const logos = document.querySelectorAll<HTMLAnchorElement>("a[data-remonter]");
    const remonter = (evenement: MouseEvent) => {
      if (evenement.button !== 0 || evenement.metaKey || evenement.ctrlKey || evenement.shiftKey || evenement.altKey) return;
      evenement.preventDefault();
      const reduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: reduit ? "auto" : "smooth" });
    };
    for (const logo of logos) logo.addEventListener("click", remonter);

    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
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

      return () => {
        entree.kill();
        gsap.set(anime, { clearProps: "all" });
      };
    });

    return () => {
      bascule.kill();
      for (const logo of logos) logo.removeEventListener("click", remonter);
      media.revert();
      // Sans script, la barre garde son fond et son trait : on la rend telle qu'on l'a trouvée.
      delete barre.dataset.pose;
    };
  });

  return null;
}

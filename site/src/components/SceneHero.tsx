"use client";

import { useRef, type ReactNode } from "react";
import { COURBE, DECALAGE, DUREE, ScrollTrigger, SplitText, enregistrerAnimation, gsap, useGSAP } from "@/lib/animation";

enregistrerAnimation();

/**
 * L'ouverture de la page.
 *
 * Elle est déjà visible quand la page s'affiche : le décor, le titre, la
 * promesse et les actions s'enchaînent dans l'ordre de lecture, et cet ordre
 * est l'argument.
 *
 * Le titre se découpe en mots et non en caractères. Chez Maedow Arch, deux mots
 * très grands portent le nom et méritent la lettre à lettre ; ici c'est une
 * phrase, et une phrase animée lettre à lettre se lit moins vite qu'elle ne
 * s'affiche.
 *
 * La séance, elle, attend qu'on arrive dessus : c'est une conversation, elle se
 * joue au rythme d'une conversation (voir `jouerSeance`).
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
        const entree = gsap
          .timeline({ defaults: { ease: COURBE.sortie } })
          /* Les dalles de verre montent d'abord, dans le désordre : un décor qui se pose avant qu'on parle. */
          .from('[data-hero="dalle"]', { y: 32, autoAlpha: 0, duration: 0.6, stagger: { each: 0.02, from: "random" } }, 0)
          .from('[data-hero="promesse"]', { y: 16, autoAlpha: 0, duration: DUREE.bloc }, titre ? 0.5 : 0.15)
          .from('[data-hero="actions"]', { y: 12, autoAlpha: 0, duration: DUREE.fragment }, "-=0.45")
          .from('[data-hero="seance"]', { y: 18, autoAlpha: 0, duration: DUREE.bloc }, "-=0.4");

        /*
         * La séance commence quand on arrive dessus : quand elle occupe assez
         * d'écran pour être suivie, et jamais avant que son cadre soit posé.
         * Jusque-là, ta bulle attend, curseur clignotant.
         */
        const figure = scope.querySelector<HTMLElement>('[data-hero="seance"]');
        let restaurer = () => {};
        if (figure) {
          const seance = jouerSeance(figure);
          restaurer = seance.restaurer;
          ScrollTrigger.create({
            trigger: figure,
            start: "top 55%",
            once: true,
            onEnter: () => {
              /* `progress` et non `isActive` : une timeline qui n'a pas encore avancé d'une image n'est pas « active ». */
              if (entree.progress() < 1) entree.eventCallback("onComplete", () => void seance.timeline.play());
              else seance.timeline.play();
            },
          });
        }

        /* `scrub` attache la dérive au défilement : le mouvement appartient au lecteur. */
        const fond = scope.querySelector<HTMLElement>('[data-hero="fond"]');
        if (fond) {
          gsap.to(fond, {
            yPercent: 14,
            ease: COURBE.continu,
            scrollTrigger: { trigger: scope, start: "top top", end: "bottom top", scrub: 0.6 },
          });
        }

        return () => restaurer();
      });

      return () => media.revert();
    },
    { scope: racine },
  );

  return <div ref={racine}>{children}</div>;
}

/* Les temps de la séance, en secondes. Maedow Flow réfléchit moins longtemps que l'agent : il vérifie une règle. */
const RYTHME = { silence: 0.1, agent: 0.55, flow: 0.3, lecture: 0.25 } as const;

/**
 * La séance, jouée comme une conversation.
 *
 * Ta bulle attend, curseur clignotant, puis ta demande se tape lettre à
 * lettre. Avant chaque réponse, l'interlocuteur
 * « écrit » : trois points, là où sa bulle va paraître. Puis la réponse se
 * génère mot à mot, comme sort le texte d'un modèle. Maedow Flow répond plus
 * vite que l'agent ne réfléchit : c'est une vérification, pas une réflexion.
 * Un refus secoue sa bulle ; la porte franchie l'éclaire.
 *
 * La séance entière tient en une douzaine de secondes : assez pour suivre
 * l'échange, pas assez pour qu'on attende la fin. Elle ne rejoue pas, et tout
 * reste à l'écran pour être relu.
 *
 * Tout ce qui est masqué ici l'est par le script : sans lui, ou sous mouvement
 * réduit, la séance est entière. Seul le texte tapé est réécrit à la main ;
 * `restaurer` le remet en place quand l'animation est retirée.
 */
function jouerSeance(figure: HTMLElement) {
  const timeline = gsap.timeline({ paused: true, defaults: { ease: COURBE.sortie } });
  const restaurations: (() => void)[] = [];
  const role = <T extends Element = HTMLElement>(parent: Element, nom: string) =>
    parent.querySelector<T>(`[data-seance="${nom}"]`);

  /* Le témoin « Maedow Flow actif » bat pendant la séance, puis se tait. */
  const veille = role(figure, "veille");
  const pouls = veille
    ? gsap.fromTo(
        veille,
        { scale: 1, autoAlpha: 0.7 },
        { scale: 3, autoAlpha: 0, duration: 1.2, ease: "power1.out", repeat: -1, paused: true },
      )
    : null;
  if (pouls) timeline.call(() => void pouls.play(), undefined, 0);

  const vert = gsap.utils.splitColor(getComputedStyle(figure).getPropertyValue("--color-fd-primary").trim() || "#00f58a");

  for (const message of figure.querySelectorAll<HTMLElement>('[data-seance="message"]')) {
    if (message.dataset.qui === "toi") {
      const frappe = role(message, "frappe");
      const curseur = role(message, "curseur");
      if (!frappe) continue;
      const texte = frappe.textContent ?? "";
      const etat = { lettres: 0 };
      /* Le curseur tient la ligne pendant que la bulle est vide : la hauteur de la séance ne bouge pas. */
      frappe.textContent = "";
      gsap.set(curseur, { display: "inline-block" });
      restaurations.push(() => {
        frappe.textContent = texte;
      });
      timeline
        /* On ne clignote pas en tapant. */
        .call(() => curseur?.classList.remove("flow-curseur"), undefined, `+=${RYTHME.silence}`)
        .to(etat, {
          lettres: texte.length,
          duration: texte.length * DECALAGE.lettre,
          ease: COURBE.continu,
          onUpdate: () => {
            frappe.textContent = texte.slice(0, Math.round(etat.lettres));
          },
        })
        .set(curseur, { display: "none" }, `+=${RYTHME.lecture}`);
      continue;
    }

    const flow = message.dataset.qui === "flow";
    const avatar = role(message, "avatar");
    const saisie = role(message, "saisie");
    const bulle = role(message, "bulle");
    const verdict = role(message, "verdict");
    const code = role(message, "code");
    const texte = role(message, "texte");
    if (!bulle || !texte) continue;
    const mots = SplitText.create(texte, { type: "words", tag: "span" }).words;

    gsap.set([avatar, bulle, verdict, code], { autoAlpha: 0 });
    gsap.set(mots, { autoAlpha: 0, filter: "blur(4px)" });

    timeline
      .to(avatar, { autoAlpha: 1, duration: 0.25 }, `+=${RYTHME.silence}`)
      .to(saisie, { autoAlpha: 1, duration: 0.2 }, "<")
      .to(saisie, { autoAlpha: 0, duration: 0.12 }, `+=${flow ? RYTHME.flow : RYTHME.agent}`)
      .fromTo(bulle, { y: 4 }, { autoAlpha: 1, y: 0, duration: 0.22 });

    if (verdict) {
      timeline.fromTo(verdict, { x: -4 }, { autoAlpha: 1, x: 0, duration: 0.2 }, "-=0.1");
      if (bulle.dataset.issue === "refus") {
        timeline.to(bulle, { keyframes: { x: [0, -5, 5, -3, 3, 0] }, duration: 0.4, ease: COURBE.continu }, "<");
      } else {
        timeline.fromTo(
          bulle,
          { boxShadow: `0 0 0 0 rgba(${vert.join(",")},0.45)` },
          { boxShadow: `0 0 0 12px rgba(${vert.join(",")},0)`, duration: 0.9, ease: COURBE.franc, clearProps: "boxShadow" },
          "<",
        );
      }
    }
    if (code) timeline.to(code, { autoAlpha: 1, duration: 0.2 }, "-=0.1");

    timeline
      .to(mots, { autoAlpha: 1, filter: "blur(0px)", duration: 0.25, stagger: DECALAGE.flux }, "-=0.05")
      /* Un temps pour que la réponse soit lue avant que la suivante ne s'annonce. */
      .to({}, { duration: RYTHME.lecture });
  }

  if (pouls) timeline.call(() => void pouls.repeat(0));

  return {
    timeline,
    restaurer: () => restaurations.forEach((restaure) => restaure()),
  };
}

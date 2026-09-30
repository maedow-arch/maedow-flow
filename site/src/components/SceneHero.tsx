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
        gsap
          .timeline({ defaults: { ease: COURBE.sortie } })
          /* Les dalles de verre montent d'abord, dans le désordre : un décor qui se pose avant qu'on parle. */
          .from('[data-hero="dalle"]', { y: 32, autoAlpha: 0, duration: 0.6, stagger: { each: 0.02, from: "random" } }, 0)
          .from('[data-hero="promesse"]', { y: 16, autoAlpha: 0, duration: DUREE.bloc }, titre ? 0.5 : 0.15)
          .from('[data-hero="actions"]', { y: 12, autoAlpha: 0, duration: DUREE.fragment }, "-=0.45")
          .from('[data-hero="seance"]', { y: 18, autoAlpha: 0, duration: DUREE.bloc }, "-=0.4");

        /*
         * La séance se lit au défilement, comme une vidéo pilotée par le
         * défilement. Sa scène, pleine largeur et de la hauteur de l'écran, se
         * fige quand elle l'occupe ; chaque cran de défilement fait sortir le
         * message suivant, remonter les fait rentrer, et la barre pleine
         * largeur dit où en est la lecture. Le dernier message lu, la page
         * reprend son cours. La scène a son propre fond : rien ne défile
         * derrière la séance figée.
         */
        const figure = scope.querySelector<HTMLElement>('[data-hero="seance"]');
        const scene = scope.querySelector<HTMLElement>('[data-hero="scene"]');
        let restaurer = () => {};
        if (figure && scene) {
          const seance = jouerSeance(figure);
          restaurer = seance.restaurer;
          const progression = scope.querySelector('[data-hero="progression"]');
          gsap.set([scope.querySelector('[data-hero="scene-fond"]'), progression], { display: "block" });
          gsap.set(progression, { autoAlpha: 0 });
          seance.timeline.fromTo(
            '[data-hero="progression-barre"]',
            { scaleX: 0 },
            { scaleX: 1, ease: COURBE.continu, duration: seance.timeline.duration() },
            0,
          );
          ScrollTrigger.create({
            animation: seance.timeline,
            trigger: scene,
            start: "top top",
            end: () => "+=" + Math.round(seance.timeline.duration() * PIXELS_PAR_SECONDE),
            pin: true,
            pinSpacing: true,
            scrub: 0.6,
            invalidateOnRefresh: true,
            onToggle: (self) => {
              seance.veiller(self.isActive);
              gsap.to(progression, { autoAlpha: self.isActive ? 1 : 0, duration: 0.3 });
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

/*
 * Les temps de la séance, en secondes de timeline : ils règlent la part de
 * défilement de chaque geste. Maedow Flow réfléchit moins longtemps que
 * l'agent : il vérifie une règle. La dernière réponse garde un temps de lecture
 * avant que la séance ne se libère.
 */
const RYTHME = { silence: 0.1, agent: 0.55, flow: 0.3, lecture: 0.25, fin: 0.8 } as const;

/* Une seconde de séance vaut ce défilement : environ 200 px par message. */
const PIXELS_PAR_SECONDE = 110;

/* La fenêtre de la séance ne dépasse jamais l'écran, sous la barre de navigation. */
const FENETRE = "calc(100svh - 11rem)";

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
 * La timeline est pilotée par le défilement : ses durées ne sont pas des
 * secondes d'attente, mais la part de défilement que prend chaque geste. Sur
 * un écran trop court pour toute la séance, la fenêtre se limite à l'écran et
 * le fil remonte avant chaque message qui la dépasserait, comme dans une
 * messagerie.
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

  /* Le témoin « Maedow Flow actif » bat tant qu'on lit la séance. */
  const veille = role(figure, "veille");
  const pouls = veille
    ? gsap.fromTo(
        veille,
        { scale: 1, autoAlpha: 0.7 },
        { scale: 3, autoAlpha: 0, duration: 1.2, ease: "power1.out", repeat: -1, paused: true },
      )
    : null;

  /* Le fil remonte dans la fenêtre juste assez pour que le message qui arrive soit entier. */
  const fenetre = role(figure, "fenetre");
  const fil = role(figure, "fil");
  gsap.set(fenetre, { maxHeight: FENETRE });
  /*
   * Mesuré sur les boîtes à l'écran, en écart au haut du fil : cet écart ne
   * dépend pas de la translation en cours. `offsetTop` ne convient pas : dès que
   * le fil est transformé, Chrome mesure les messages depuis le fil et non plus
   * depuis la carte.
   */
  const remontee = (message: HTMLElement) => {
    if (!fenetre || !fil) return 0;
    const marge = Number.parseFloat(getComputedStyle(fil).paddingBottom) || 0;
    const bas = message.getBoundingClientRect().bottom - fil.getBoundingClientRect().top + marge;
    return -Math.max(0, bas - fenetre.clientHeight);
  };
  const suivre = (message: HTMLElement) => {
    if (fil) timeline.to(fil, { y: () => remontee(message), duration: 0.3, ease: COURBE.franc });
  };

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
      suivre(message);
      timeline
        /* On ne clignote pas en tapant. */
        .set(curseur, { animation: "none" }, `+=${RYTHME.silence}`)
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

    suivre(message);
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

  timeline.to({}, { duration: RYTHME.fin });

  return {
    timeline,
    veiller: (actif: boolean) => {
      if (!pouls) return;
      if (actif) pouls.play();
      else pouls.pause(0).progress(1);
    },
    restaurer: () => restaurations.forEach((restaure) => restaure()),
  };
}

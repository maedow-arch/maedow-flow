"use client";

import { useRef, type ReactNode } from "react";
import { COURBE, DECALAGE, DUREE, SEUIL, ScrollTrigger, SplitText, enregistrerAnimation, gsap, tracer, useGSAP } from "@/lib/animation";

enregistrerAnimation();

/**
 * Le moteur d'animation de la page d'accueil, au défilement.
 *
 * Les sections ne déclarent pas comment elles s'animent, elles déclarent ce que
 * sont leurs éléments (`data-anime="titre"`, `"phase"`, `"compte"`…). Le
 * comportement de chaque rôle vit ici : l'inventaire complet des animations
 * tient dans ce fichier, et un bloc qui reçoit un rôle prend le rythme des autres.
 *
 * Tout est en `from` et en `once`, sous `prefers-reduced-motion: no-preference`.
 */
export function Scene({ children, className }: { children: ReactNode; className?: string }) {
  const racine = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const media = gsap.matchMedia();

      media.add("(prefers-reduced-motion: no-preference)", () => {
        const scope = racine.current;
        if (!scope) return;

        /*
         * Les titres s'écrivent ligne par ligne, derrière un masque.
         * `autoSplit` redécoupe quand les polices de `next/font` remplacent la
         * police de repli : sans lui, les lignes seraient mesurées sur la
         * mauvaise police.
         */
        for (const titre of scope.querySelectorAll<HTMLElement>('[data-anime="titre"]')) {
          SplitText.create(titre, {
            type: "lines",
            mask: "lines",
            autoSplit: true,
            onSplit(decoupe) {
              return gsap.from(decoupe.lines, {
                yPercent: 110,
                duration: DUREE.bloc,
                ease: COURBE.sortie,
                stagger: DECALAGE.ligne,
                scrollTrigger: { trigger: titre, start: SEUIL, once: true },
              });
            },
          });
        }

        /*
         * Le badge annonce sa section, juste avant le titre : il s'ouvre de
         * gauche à droite, son carré s'allume, et le mot se décode comme une
         * étiquette de terminal. Sa largeur est tenue pendant le décodage : des
         * lettres tirées au hasard n'ont pas la chasse du mot, et le badge
         * tremblerait.
         */
        for (const badge of scope.querySelectorAll<HTMLElement>('[data-anime="badge"]')) {
          const point = badge.querySelector('[data-badge="point"]');
          const texte = badge.querySelector('[data-badge="texte"]');
          gsap
            .timeline({
              defaults: { ease: COURBE.sortie },
              scrollTrigger: { trigger: badge, start: SEUIL, once: true },
              onStart: () => void gsap.set(badge, { width: badge.getBoundingClientRect().width }),
              onComplete: () => void gsap.set(badge, { clearProps: "width" }),
            })
            .fromTo(
              badge,
              { clipPath: "inset(0% 100% 0% 0% round 6px)" },
              { clipPath: "inset(0% 0% 0% 0% round 6px)", duration: DUREE.fragment, clearProps: "clipPath" },
            )
            .from(point, { scale: 0, duration: 0.3, ease: COURBE.franc }, 0.15)
            .to(texte, { duration: 0.6, scrambleText: { text: "{original}", chars: "upperCase", speed: 0.6 } }, 0.1);
        }

        /* Les textes d'accompagnement suivent leur titre, sans le devancer. */
        for (const intro of scope.querySelectorAll<HTMLElement>('[data-anime="intro"]')) {
          gsap.from(intro, {
            y: 18,
            autoAlpha: 0,
            duration: DUREE.bloc,
            ease: COURBE.sortie,
            scrollTrigger: { trigger: intro, start: SEUIL, once: true },
          });
        }

        /*
         * Les phases se révèlent dans l'ordre du cycle.
         *
         * C'est l'animation qui porte le plus de sens de la page : on ne livre
         * pas avant d'avoir construit, on ne construit pas avant d'avoir fondé.
         * L'œil voit l'ordre avant de lire les portes. Chaque numéro se pose
         * ensuite sur sa carte, comme une porte franchie.
         */
        const cycle = scope.querySelector<HTMLElement>('[data-anime="cycle"]');
        if (cycle) {
          const phases = cycle.querySelectorAll('[data-anime="phase"]');
          const numeros = cycle.querySelectorAll('[data-anime="numero"]');
          gsap
            .timeline({ scrollTrigger: { trigger: cycle, start: SEUIL, once: true } })
            .from(phases, {
              x: -18,
              autoAlpha: 0,
              duration: DUREE.fragment,
              ease: COURBE.sortie,
              stagger: DECALAGE.phase,
            })
            .from(
              numeros,
              { scale: 0.4, autoAlpha: 0, duration: DUREE.fragment, ease: COURBE.franc, stagger: DECALAGE.phase },
              `-=${DUREE.fragment + DECALAGE.phase * 3}`,
            );
        }

        /* Les chiffres se comptent : ils sont dénombrés dans le corpus au build, pas écrits à la main. */
        for (const compteur of scope.querySelectorAll<HTMLElement>('[data-anime="compte"]')) {
          const arrivee = Number(compteur.dataset.valeur ?? compteur.textContent ?? 0);
          if (!Number.isFinite(arrivee) || arrivee === 0) continue;
          const etat = { valeur: 0 };
          gsap.to(etat, {
            valeur: arrivee,
            duration: DUREE.compte,
            ease: COURBE.sortie,
            scrollTrigger: { trigger: compteur, start: SEUIL, once: true },
            onUpdate: () => {
              compteur.textContent = String(Math.round(etat.valeur));
            },
          });
        }

        /*
         * Les libellés des chiffres se lèvent derrière leur masque pendant que
         * le nombre compte : les cartes ne bougent pas, seul ce qu'elles disent
         * arrive. Une carte après l'autre, dans le sens de la lecture.
         */
        scope.querySelectorAll<HTMLElement>('[data-anime="libelle"]').forEach((libelle, i) => {
          SplitText.create(libelle, {
            type: "lines",
            mask: "lines",
            autoSplit: true,
            onSplit(decoupe) {
              return gsap.from(decoupe.lines, {
                yPercent: 110,
                duration: DUREE.bloc,
                ease: COURBE.sortie,
                stagger: DECALAGE.ligne,
                delay: 0.25 + (i % 4) * DECALAGE.carte,
                scrollTrigger: { trigger: libelle, start: SEUIL, once: true },
              });
            },
          });
        });

        /*
         * Les dessins se construisent comme ils se lisent (voir `tracer`), une
         * fois leur carte posée : un dessin qui s'anime pendant que sa carte
         * glisse encore, on ne le voit pas.
         */
        for (const dessin of scope.querySelectorAll<SVGElement>('[data-anime="dessin"]')) {
          const trace = tracer(dessin);
          ScrollTrigger.create({
            trigger: dessin,
            start: SEUIL,
            once: true,
            onEnter: () => void gsap.delayedCall(0.35, () => void trace.play()),
          });
        }

        /*
         * Les cartes entrent par lots : `batch` groupe celles qui franchissent
         * le seuil ensemble. Une carte rencontrée seule n'attend pas les autres.
         */
        const cartes = scope.querySelectorAll<HTMLElement>('[data-anime="carte"]');
        if (cartes.length > 0) {
          gsap.set(cartes, { y: 26, autoAlpha: 0 });
          ScrollTrigger.batch(Array.from(cartes), {
            start: SEUIL,
            once: true,
            onEnter: (lot) =>
              gsap.to(lot, {
                y: 0,
                autoAlpha: 1,
                duration: DUREE.bloc,
                ease: COURBE.sortie,
                stagger: DECALAGE.carte,
                overwrite: true,
              }),
          });
        }

        /*
         * Les pixels de l'appel final scintillent.
         *
         * C'est, avec la dérive de la trame de l'ouverture, le seul mouvement
         * continu de la page : chaque pixel pulse à son propre rythme et dérive
         * de quelques pixels, comme une matière vivante autour de l'appel. Le
         * mouvement ne tourne que lorsque la section est à l'écran : hors de
         * vue, il ne coûte rien.
         */
        const pixels = scope.querySelectorAll<HTMLElement>('[data-anime="pixel"]');
        const zone = pixels[0]?.closest("section");
        if (pixels.length > 0 && zone) {
          const scintillement = gsap.to(pixels, {
            opacity: () => gsap.utils.random(0.06, 0.4),
            y: () => gsap.utils.random(-7, 7),
            duration: () => gsap.utils.random(0.7, 1.9),
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
            repeatRefresh: true,
            stagger: { each: 0.035, from: "random" },
            paused: true,
          });
          ScrollTrigger.create({
            trigger: zone,
            start: "top bottom",
            end: "bottom top",
            onToggle: (self) => (self.isActive ? scintillement.play() : scintillement.pause()),
          });
        }

        /*
         * Le pied de page, sobrement, de gauche à droite.
         *
         * Il se déclenche à son entrée dans l'écran, pas au seuil commun : il est
         * si près du bas du document que son haut n'atteint jamais 85 % de
         * l'écran, même défilé jusqu'au bout. Au seuil commun, il restait
         * invisible pour toujours.
         */
        const colonnes = scope.querySelectorAll<HTMLElement>('[data-anime="colonne"]');
        if (colonnes.length > 0) {
          gsap.from(colonnes, {
            y: 14,
            autoAlpha: 0,
            duration: DUREE.fragment,
            ease: COURBE.sortie,
            stagger: 0.07,
            scrollTrigger: { trigger: colonnes[0]!, start: "top bottom", once: true },
          });
        }
      });

      return () => media.revert();
    },
    { scope: racine },
  );

  return (
    <div ref={racine} className={className}>
      {children}
    </div>
  );
}

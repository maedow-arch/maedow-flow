import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

/**
 * Le vocabulaire d'animation du site, repris de Maedow Arch valeur pour valeur.
 *
 * Toutes les durées, courbes et décalages sont ici, et nulle part ailleurs :
 * vingt animations réglées chacune à l'œil donnent un site qui bouge sans
 * rythme, où chaque section semble venir d'un autre projet.
 *
 * Trois règles gouvernent l'ensemble.
 *
 * **L'animation doit dire quelque chose.** Le cycle avance, donc ses phases se
 * révèlent dans l'ordre. Les chiffres comptent parce qu'ils ont été dénombrés.
 * Une entrée en fondu qui n'apprend rien au lecteur est du décor.
 *
 * **Rien ne rejoue.** Une documentation se relit ; une animation qui se rejoue
 * à chaque passage devient une gêne dès la deuxième lecture : tout est en `once`.
 *
 * **Rien ne dépend de l'animation pour être lu.** Les entrées se font en `from`,
 * jamais en `to` depuis un état masqué en CSS : l'état de repos du document est
 * déjà l'état final. Sans JavaScript, la page reste entière.
 */

let plugins = false;

/** Enregistre les plugins une seule fois, quel que soit le nombre de scènes. */
export function enregistrerAnimation() {
  if (plugins) return;
  gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);
  plugins = true;
}

/** `sortie` freine à l'arrivée sans rebond ; `franc` sert aux distances visibles. */
export const COURBE = {
  sortie: "power3.out",
  franc: "power2.out",
  continu: "none",
} as const;

/** Un fragment parcourt quelques pixels, un bloc en parcourt trente : à durée égale, l'un paraîtrait lent et l'autre brutal. */
export const DUREE = {
  fragment: 0.5,
  bloc: 0.7,
  compte: 1.6,
} as const;

/** Assez de décalage pour que l'œil suive une direction, assez peu pour que la série reste un mouvement d'ensemble. */
export const DECALAGE = {
  mot: 0.045,
  ligne: 0.09,
  carte: 0.1,
  phase: 0.13,
} as const;

/** Le mouvement a commencé quand le lecteur arrive, sans se déclencher hors de vue. */
export const SEUIL = "top 85%";

export { gsap, ScrollTrigger, SplitText, useGSAP };

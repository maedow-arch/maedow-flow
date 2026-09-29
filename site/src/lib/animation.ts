import { gsap } from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
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
  gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText, DrawSVGPlugin, ScrambleTextPlugin);
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
  /* Une ligne de séance doit pouvoir se lire avant que la suivante n'arrive. */
  echange: 0.42,
  /* La frappe d'un humain, puis le flux d'un modèle : l'un tape des lettres, l'autre produit des mots. */
  lettre: 0.032,
  flux: 0.022,
} as const;

/** Le mouvement a commencé quand le lecteur arrive, sans se déclencher hors de vue. */
export const SEUIL = "top 85%";

/**
 * Les gestes d'un dessin, et comment chacun s'exécute.
 *
 * Un schéma ne s'anime pas en bloc : il se construit dans l'ordre où on le
 * lirait. Un arbre pousse depuis sa racine, un périmètre s'élargit depuis son
 * centre, des coches se cochent une à une. Chaque élément déclare son geste
 * (`data-trace="trait"`, `"point"`…) et `tracer` les enchaîne dans l'ordre du
 * document ; les éléments consécutifs de même geste forment une série.
 */
const GESTES = {
  /* Un trait se dessine du début à la fin de son chemin. */
  trait: { vars: { drawSVG: 0, duration: 0.7, ease: COURBE.franc }, decalage: 0.12 },
  /* Un point, un nœud, un bouton : ils éclosent depuis leur centre. */
  point: { vars: { scale: 0, autoAlpha: 0, transformOrigin: "50% 50%", duration: 0.4 }, decalage: 0.08 },
  /* Un cadre se déploie depuis son centre. */
  cadre: { vars: { scale: 0.6, autoAlpha: 0, transformOrigin: "50% 50%", duration: 0.6 }, decalage: 0.18 },
  /* Une barre horizontale, ou un trait pointillé que `trait` priverait de ses pointillés. */
  barre: { vars: { scaleX: 0, transformOrigin: "0% 50%", duration: 0.5 }, decalage: 0.1 },
  /* Une ligne écrite à pleine lumière, qui pâlit ensuite jusqu'à son opacité propre. */
  efface: { vars: { scaleX: 0, opacity: 1, transformOrigin: "0% 50%", duration: 0.9 }, decalage: 0.14 },
  /* Une colonne de graphique monte depuis sa base. */
  montee: { vars: { scaleY: 0, transformOrigin: "50% 100%", duration: 0.5 }, decalage: 0.035 },
  /* Une coche se pose, franchement, une à la fois. */
  coche: { vars: { scale: 0.3, autoAlpha: 0, duration: 0.3, ease: COURBE.franc }, decalage: 0.22 },
  /* Une ligne de texte glisse à sa place. */
  entree: { vars: { y: 6, autoAlpha: 0, duration: 0.45 }, decalage: 0.08 },
} as const;

export type Geste = keyof typeof GESTES;

/**
 * Construit, en pause, la timeline qui dessine les éléments `[data-trace]` de
 * `racine`. L'appelant décide quand la jouer : au défilement, ou quand la carte
 * qui porte le dessin arrive en haut de la pile.
 */
export function tracer(racine: Element) {
  const timeline = gsap.timeline({ paused: true, defaults: { ease: COURBE.sortie } });
  const series: { geste: Geste; elements: Element[] }[] = [];
  for (const element of racine.querySelectorAll<HTMLElement | SVGElement>("[data-trace]")) {
    const geste = element.dataset.trace as Geste;
    if (!(geste in GESTES)) continue;
    const derniere = series.at(-1);
    if (derniere?.geste === geste) derniere.elements.push(element);
    else series.push({ geste, elements: [element] });
  }
  series.forEach(({ geste, elements }, i) => {
    const { vars, decalage } = GESTES[geste];
    /* Chaque série commence avant la fin de la précédente : un dessin qui attend chaque trait paraît laborieux. */
    timeline.from(elements, { ...vars, stagger: decalage }, i === 0 ? 0 : "-=0.3");
  });
  return timeline;
}

export { gsap, ScrollTrigger, SplitText, useGSAP };

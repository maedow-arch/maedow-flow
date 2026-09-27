"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { ScrollTrigger, enregistrerAnimation, gsap } from "@/lib/animation";

enregistrerAnimation();

/**
 * Le défilement lissé, sur la page d'accueil et nulle part ailleurs, comme chez
 * Maedow Arch.
 *
 * Une page d'accueil est une démonstration : l'inertie y accompagne la lecture.
 * Une documentation est un outil, où le défilement sert à chercher ; ce
 * composant n'est donc monté que par `/`, et le défilement natif revient dès
 * qu'on la quitte.
 *
 * Trois branchements font s'entendre Lenis et GSAP : ScrollTrigger est informé
 * à chaque défilement, Lenis avance au rythme de l'horloge de GSAP, et le
 * rattrapage de retard de GSAP est coupé. Lenis se met de lui-même en retrait
 * sous `prefers-reduced-motion`.
 */
export function DefilementDoux() {
  useEffect(() => {
    const lenis = new Lenis();
    const avancer = (temps: number) => lenis.raf(temps * 1000);

    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(avancer);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(avancer);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
    };
  }, []);

  return null;
}

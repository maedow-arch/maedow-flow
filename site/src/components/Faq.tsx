"use client";

import { useRef, useState, type MouseEvent } from "react";
import { gsap } from "@/lib/animation";

/**
 * La FAQ de l'accueil : une question ouverte à la fois, qui se déplie en douceur.
 *
 * La base reste un `<details>` natif : sans JavaScript, chaque question s'ouvre
 * et se ferme d'elle-même. Le script ne fait qu'enrichir. Il anime la hauteur et
 * l'opacité de la réponse, referme la précédente (une seule ouverte à la fois,
 * ce qui garde la hauteur de la liste presque constante), et marque la question
 * active : fond teinté, barre verte qui se déploie, signe + qui devient −.
 *
 * Sous `prefers-reduced-motion`, l'ouverture est immédiate.
 */
export function Faq({ items }: { items: { question: string; reponse: string }[] }) {
  const [actif, setActif] = useState<number | null>(0);
  const details = useRef<(HTMLDetailsElement | null)[]>([]);
  const reponses = useRef<(HTMLDivElement | null)[]>([]);

  function fermer(i: number, reduit: boolean) {
    const d = details.current[i];
    const r = reponses.current[i];
    if (!d || !r || !d.open) return;
    if (reduit) {
      d.open = false;
      return;
    }
    gsap.to(r, {
      height: 0,
      opacity: 0,
      duration: 0.3,
      ease: "power2.inOut",
      onComplete: () => {
        d.open = false;
        gsap.set(r, { clearProps: "height,opacity" });
      },
    });
  }

  function ouvrir(i: number, reduit: boolean) {
    const d = details.current[i];
    const r = reponses.current[i];
    if (!d || !r) return;
    d.open = true;
    if (reduit) return;
    gsap.fromTo(
      r,
      { height: 0, opacity: 0 },
      { height: "auto", opacity: 1, duration: 0.45, ease: "power3.out", clearProps: "height,opacity" },
    );
  }

  function basculer(i: number, evenement: MouseEvent) {
    evenement.preventDefault();
    const reduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (actif === i) {
      fermer(i, reduit);
      setActif(null);
      return;
    }
    if (actif !== null) fermer(actif, reduit);
    ouvrir(i, reduit);
    setActif(i);
  }

  return (
    <div data-anime="carte" className="flow-coins divide-y border">
      {items.map((item, i) => (
        <details
          key={item.question}
          ref={(el) => {
            details.current[i] = el;
          }}
          open={i === 0}
          data-actif={actif === i}
          className="group relative transition-colors duration-300 data-[actif=true]:bg-fd-accent/60"
        >
          {/* La barre de la question active se déploie depuis le haut. */}
          <span
            aria-hidden="true"
            className="absolute inset-y-0 left-0 w-0.5 origin-top scale-y-0 bg-fd-primary transition-transform duration-300 ease-out group-data-[actif=true]:scale-y-100 motion-reduce:transition-none"
          />
          <summary
            onClick={(e) => basculer(i, e)}
            className="flex cursor-pointer list-none items-center justify-between gap-6 px-6 py-5 font-medium marker:content-none sm:px-8"
          >
            {item.question}
            <span
              aria-hidden="true"
              className="relative inline-flex size-5 shrink-0 items-center justify-center text-fd-primary transition-transform duration-300 group-data-[actif=true]:rotate-180 motion-reduce:transition-none"
            >
              <span className="absolute h-0.5 w-3 bg-current" />
              <span className="absolute h-3 w-0.5 bg-current transition-transform duration-300 group-data-[actif=true]:scale-y-0 motion-reduce:transition-none" />
            </span>
          </summary>
          <div
            ref={(el) => {
              reponses.current[i] = el;
            }}
            className="overflow-hidden"
          >
            <p className="px-6 pb-6 text-sm text-fd-muted-foreground sm:px-8">{item.reponse}</p>
          </div>
        </details>
      ))}
    </div>
  );
}

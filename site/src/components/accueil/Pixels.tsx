/**
 * La trame de pixels verts qui borde l'appel final, à la manière d'AgentFlow.
 *
 * Les positions sont pseudo-aléatoires mais déterministes : une graine fixe,
 * donc le même dessin au rendu serveur et au rendu client, sans écart
 * d'hydratation. Les pixels se densifient vers le bord, comme une matière qui
 * s'effrite vers le contenu.
 */

function generateur(graine: number) {
  let etat = graine;
  return () => {
    etat = (etat * 1664525 + 1013904223) % 4294967296;
    return etat / 4294967296;
  };
}

function trame(graine: number, nombre: number, bas: boolean) {
  const hasard = generateur(graine);
  return Array.from({ length: nombre }, () => {
    const profondeur = hasard() ** 1.8; // plus dense près du bord
    return {
      x: hasard() * 100,
      y: (bas ? 1 - profondeur : profondeur) * 100,
      opacite: 0.35 + hasard() * 0.65,
    };
  });
}

function Bande({ graine, bas }: { graine: number; bas: boolean }) {
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-x-0 h-28 ${bas ? "bottom-0" : "top-0"}`}>
      {trame(graine, 46, bas).map((p, i) => (
        <span
          key={i}
          className="absolute size-[6px] bg-fd-primary"
          style={{ left: `${p.x}%`, top: `${p.y}%`, opacity: p.opacite }}
        />
      ))}
    </div>
  );
}

export function Pixels() {
  return (
    <>
      <Bande graine={17} bas={false} />
      <Bande graine={42} bas />
    </>
  );
}

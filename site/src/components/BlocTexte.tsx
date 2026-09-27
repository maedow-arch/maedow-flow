import { CodeBlock, Pre } from "fumadocs-ui/components/codeblock";

/**
 * Un bloc de code Fumadocs pour du texte écrit dans une page, hors du MDX.
 *
 * Fumadocs porte la marge intérieure sur les lignes `.line` que produit Shiki.
 * Un texte passé brut à `Pre` colle donc au bord : on le découpe ici en lignes
 * au même format, et le bouton de copie reste celui de Fumadocs.
 */
export function BlocTexte({ texte, titre, className }: { texte: string; titre?: string; className?: string }) {
  return (
    <CodeBlock {...(titre ? { title: titre } : {})} {...(className ? { className } : {})}>
      <Pre>
        <code>
          {texte.split("\n").map((ligne, i) => (
            <span key={i} className="line">
              {ligne}
            </span>
          ))}
        </code>
      </Pre>
    </CodeBlock>
  );
}

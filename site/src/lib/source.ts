import { docs, meta } from "@/.source/server";
import { toFumadocsSource } from "fumadocs-mdx/runtime/server";
import { loader } from "fumadocs-core/source";

/**
 * Les pages du site, depuis l'entrée serveur générée par fumadocs-mdx.
 *
 * Même raccord que sur le site de Maedow Arch, avec les mêmes versions
 * épinglées : fumadocs-core et fumadocs-mdx ont déjà dérivé l'un de l'autre
 * sous des plages de versions, et le loader recevait alors une fonction là où
 * il attendait un tableau.
 */
export const source = loader({
  baseUrl: "/docs",
  source: toFumadocsSource(docs, meta),
});

/** Le fichier du corpus d'où vient une page, pour son lien vers le Markdown brut. */
export function fichierDuCorpus(slug: string[] | undefined): string {
  return slug?.length ? `${slug.join("/")}.md` : "manifeste.md";
}

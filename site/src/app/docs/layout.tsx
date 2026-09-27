import { DocsLayout } from "fumadocs-ui/layouts/notebook";
import type { ReactNode } from "react";
import { Logo } from "@/components/Logo";
import { source } from "@/lib/source";
import { REPO_URL } from "@/lib/site";

/*
 * Les onglets de l'en-tête reprennent les pages réelles du corpus, dans l'ordre
 * de lecture, et rien de plus : une rubrique sans page derrière serait une
 * promesse en l'air.
 */
const ONGLETS = [
  { title: "Manifeste", url: "/docs", description: "Le problème, les six principes, les rôles" },
  { title: "Démarrer", url: "/docs/demarrer", description: "Préparer une machine, lancer ou adopter un projet" },
  { title: "Cycle", url: "/docs/cycle", description: "Cinq phases, cinq portes, quatre paliers" },
  { title: "Règles", url: "/docs/regles", description: "MF-001 à MF-017, et ce qui les fait respecter" },
  { title: "Claude Code", url: "/docs/claude-code", description: "Où vit chaque consigne, le moteur de skills" },
  { title: "Plateformes", url: "/docs/plateformes", description: "Web, mobile, desktop" },
  { title: "Sécurité", url: "/docs/securite", description: "Le socle minimal avant chaque livraison" },
  { title: "Échelle", url: "/docs/echelle", description: "Monter en charge sur mesure" },
  { title: "Prompts", url: "/docs/prompts", description: "Les formulations éprouvées" },
];

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      tree={source.pageTree}
      tabMode="navbar"
      tabs={ONGLETS}
      nav={{ title: <Logo />, url: "/", mode: "top" }}
      githubUrl={REPO_URL}
      links={[{ text: "llms.txt", url: "/llms.txt", external: true }]}
      sidebar={{ defaultOpenLevel: 1 }}
    >
      {children}
    </DocsLayout>
  );
}

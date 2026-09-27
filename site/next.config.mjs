import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  // Le site vit dans un sous-dossier du dépôt : sans cette racine, Next remonte
  // chercher un lockfile ailleurs et se trompe de répertoire de travail.
  outputFileTracingRoot: import.meta.dirname,
  async headers() {
    // Les fichiers pour agents se lisent en texte, avec le bon jeu de caractères :
    // un corpus en français mal décodé perd ses accents, et parfois son sens.
    const texte = [{ key: "Content-Type", value: "text/plain; charset=utf-8" }];
    const markdown = [{ key: "Content-Type", value: "text/markdown; charset=utf-8" }];
    return [
      { source: "/llms.txt", headers: texte },
      { source: "/llms-full.txt", headers: texte },
      { source: "/md/:page*", headers: markdown },
    ];
  },
};

export default withMDX(config);

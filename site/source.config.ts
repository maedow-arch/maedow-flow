import { defineConfig, defineDocs } from "fumadocs-mdx/config";

// Les pages sont dérivées du corpus par scripts/sync.mjs : ce dossier n'est pas versionné.
export const { docs, meta } = defineDocs({
  dir: "content/docs",
});

export default defineConfig();

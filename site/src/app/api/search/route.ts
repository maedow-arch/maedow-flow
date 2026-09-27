import { createFromSource } from "fumadocs-core/search/server";
import { source } from "@/lib/source";

// Recherche sur les pages dérivées du corpus par scripts/sync.mjs.
export const { GET } = createFromSource(source);

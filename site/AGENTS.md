# Site de Maedow Flow

## Overview

Le site publie le corpus pour les humains (pages Fumadocs) et pour les agents (`llms.txt`, `llms-full.txt`, Markdown brut, kit téléchargeable). Tout ce qu'il affiche est dérivé de la racine du dépôt par `scripts/sync.mjs`, en `predev` et en `prebuild`.

## Key files

| File | Owns |
|---|---|
| `scripts/sync.mjs` | la liste et l'ordre des pages (`PAGES`), la conversion en MDX, tous les fichiers de `public/` dérivés |
| `src/lib/site.ts` | les adresses publiques et le prompt d'amorçage de la page d'accueil |
| `src/lib/source.ts` | le loader Fumadocs |
| `src/app/page.tsx` | la page d'accueil |

## Conventions

- Ne jamais écrire dans `content/docs/` ni dans les fichiers dérivés de `public/` : ils sont régénérés à chaque build et ne sont pas versionnés.
- Une page ajoutée au corpus s'inscrit dans `PAGES` ; le script refuse de tourner s'il trouve une page du corpus qui n'y figure pas.
- Les versions de `fumadocs-core`, `fumadocs-mdx`, `fumadocs-ui` et `next` restent épinglées exactement, et se mettent à jour ensemble.
- `mdast-util-to-markdown` est forcé en 2.1.2 par `overrides`. La 2.1.3 (publiée le 2026-09-27) sérialise le gras en se ré-appelant et s'appuie sur une propriété `attention` portée par la fonction ; le sérialiseur de Fumadocs enveloppe chaque handler sans recopier cette propriété, et tout texte en gras provoque une récursion infinie au build. Retirer l'override seulement quand un build avec la version courante passe.

## Gotchas

- L'adresse de production figure deux fois : `SITE` dans `scripts/flow.mjs` (fichiers pour agents) et `src/lib/site.ts` (métadonnées). Changer l'une impose de changer l'autre.
- Sur Vercel, le répertoire racine du projet est `site/`, et l'option « inclure les fichiers hors du répertoire racine » doit rester active : le build lit `../corpus`, `../templates` et `../scripts`.
- Le MDX interprète `{`, `}` et `<` : `sync.mjs` les échappe hors du code. Un composant JSX ne peut donc pas être écrit dans le corpus, et c'est voulu : le corpus reste du Markdown lisible partout.

# Site de Maedow Flow

## Overview

Le site publie le corpus pour les humains (pages Fumadocs) et pour les agents (`llms.txt`, `llms-full.txt`, Markdown brut, kit téléchargeable). Tout ce qu'il affiche est dérivé de la racine du dépôt par `scripts/sync.mjs`, en `predev` et en `prebuild`.

## Key files

| File | Owns |
| --- | --- |
| `scripts/sync.mjs` | la liste et l'ordre des pages (`PAGES`), la conversion en MDX, tous les fichiers de `public/` dérivés |
| `src/app/theme-flow.css` | la palette verte, ses dérivées claires et la mesure de contraste de chaque valeur |
| `src/app/globals.css` | l'habillage repris de Maedow Arch : fontes, trame, panneau de contenu, code |
| `src/lib/animation.ts` | le vocabulaire d'animation : courbes, durées, décalages, seuil, repris de Maedow Arch ; `tracer`, qui construit un dessin geste par geste (`data-trace`) |
| `src/components/Scene.tsx`, `SceneHero.tsx` | les animations de l'accueil, par rôle (`data-anime`, `data-hero`) ; la séance de l'ouverture se joue dans `SceneHero` (`data-seance`) |
| `src/components/accueil/` | les pièces de l'accueil : conversation de l'ouverture, dalles de verre, phases et leurs aperçus, briques, dérives, pixels |
| `src/app/icon.svg` | le favicon, tiré de la marque du logo (les trois chevrons) |
| `src/lib/site.ts` | les adresses publiques et le prompt d'amorçage de la page d'accueil |
| `src/lib/source.ts` | le loader Fumadocs |
| `src/app/page.tsx` | la page d'accueil |

## Conventions

- Ne jamais écrire dans `content/docs/` ni dans les fichiers dérivés de `public/` : ils sont régénérés à chaque build et ne sont pas versionnés.
- L'accueil est sombre de bout en bout, quel que soit le thème : `flow-sombre` enveloppe la page, et les bandes `flow-releve` en relèvent le ton ; chacune redéfinit les jetons `fd-` pour son sous-arbre. Le bouton de thème vit dans la documentation.
- Le design system est celui de Maedow Arch, transposé en verts. Une couleur de texte ajoutée porte sa mesure de contraste en regard, et passe le seuil AA sur la surface la plus défavorable où elle s'affiche, pas seulement sur le fond.
- Une animation se déclare par un rôle (`data-anime="carte"`…), jamais par des valeurs locales : durées et courbes vivent dans `src/lib/animation.ts`. Tout est en `from` et en `once`, sous `prefers-reduced-motion: no-preference` ; sans JavaScript, la page est entière. Un élément proche du bas du document se déclenche à son entrée dans l'écran (`top bottom`) : au seuil commun, il n'atteindrait jamais la ligne et resterait invisible.
- Les chiffres de l'accueil viennent de `src/lib/chiffres.json`, dénombré dans le dépôt par `scripts/sync.mjs` et non versionné.
- Une page ajoutée au corpus s'inscrit dans `PAGES` ; le script refuse de tourner s'il trouve une page du corpus qui n'y figure pas.
- Les versions de `fumadocs-core`, `fumadocs-mdx`, `fumadocs-ui` et `next` restent épinglées exactement, et se mettent à jour ensemble.
- `mdast-util-to-markdown` est forcé en 2.1.2 par `overrides`. La 2.1.3 (publiée le 2026-09-27) sérialise le gras en se ré-appelant et s'appuie sur une propriété `attention` portée par la fonction ; le sérialiseur de Fumadocs enveloppe chaque handler sans recopier cette propriété, et tout texte en gras provoque une récursion infinie au build. Retirer l'override seulement quand un build avec la version courante passe.

## Gotchas

- L'adresse de production figure deux fois : `SITE` dans `scripts/flow.mjs` (fichiers pour agents) et `src/lib/site.ts` (métadonnées). Changer l'une impose de changer l'autre.
- Sur Vercel, le répertoire racine du projet est `site/`, et l'option « inclure les fichiers hors du répertoire racine » doit rester active : le build lit `../corpus`, `../templates` et `../scripts`.
- La protection des déploiements Vercel reste désactivée sur ce projet. Un site que les agents ne peuvent pas lire sans se connecter n'a plus d'objet ; un projet Vercel neuf l'active par défaut.
- Le premier déploiement d'un projet Vercel neuf part en production, même demandé depuis une branche de feature. Le projet a donc été lié sans déploiement, et la production n'est venue que de `main`.
- Un élément `sticky` ne colle plus dès qu'un ancêtre est en `overflow: hidden`, qui en fait un conteneur de défilement : une section qui en contient un s'habille en `overflow-clip`. De même, une règle hors couche l'emporte sur les utilitaires Tailwind : `.flow-coins` pose son `position: relative` dans `@layer components`, sans quoi `md:sticky` serait ignoré.
- ScrollTrigger mesure un élément `sticky` là où il est collé, pas à sa place dans le flux. Les cartes empilées des phases calculent donc leurs positions de collage à partir de leur colonne, qui ne colle pas (`Phases.tsx`).
- Le MDX interprète `{`, `}` et `<` : `sync.mjs` les échappe hors du code. Un composant JSX ne peut donc pas être écrit dans le corpus, et c'est voulu : le corpus reste du Markdown lisible partout.

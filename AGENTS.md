# Maedow Flow

Ce fichier s'adresse aux agents et aux humains qui modifient **ce dépôt**. Il ne dit pas comment appliquer Maedow Flow à un projet (c'est le rôle du corpus), il dit ce qu'il faut savoir avant de toucher au workflow lui-même.

## Ce que contient ce dépôt

Un workflow de développement, son kit de projet, le plugin Claude Code qui l'installe, et le site qui le publie pour les humains et pour les agents.

| Chemin | Rôle |
| :--- | :--- |
| `corpus/*.md` | le workflow, source de vérité |
| `templates/` | le kit, décrit par `templates/manifest.json` |
| `scripts/flow.mjs` | installer, contrôler, protéger ; Node pur, sans dépendance |
| `scripts/controle-corpus.mjs` | tirets d'incise et liens internes morts |
| `skills/flow/SKILL.md` | le skill `/flow` |
| `.claude-plugin/` | manifeste du plugin et de la marketplace (le plugin est le dépôt entier) |
| `global/CLAUDE.md` | les règles personnelles du propriétaire |
| `site/` | Next.js et Fumadocs ; `site/scripts/sync.mjs` dérive tout ce que le site publie |
| `tests/` | `node --test`, sans dépendance |

## Les règles de ce dépôt

**Le corpus vit dans `corpus/`.** Les pages du site (`site/content/docs/`) et les fichiers pour agents (`site/public/llms.txt`, `llms-full.txt`, `md/`, `templates/`, `flow.mjs`) en sont dérivés par `site/scripts/sync.mjs`, et ne sont pas versionnés. Modifier un fichier dérivé revient à écrire dans le vide : le prochain build l'écrase.

**Un code de règle ne change jamais.** `MF-007` désigne la même règle pour toujours. Une règle abandonnée garde son code et devient « retirée », elle n'est jamais renumérotée : des projets et des commits la citent.

**Une règle tenue par la machine n'existe que si un test le prouve.** Chaque refus du garde, de `pre-push` ou de `commit-msg` a son test qui échoue si on retire la règle, et chaque cas légitime voisin a son test qui passe. Un garde-fou qui ne refuse rien ressemble trait pour trait à un garde-fou qui marche.

**Le kit ne détruit rien.** `flow.mjs installer` n'écrase jamais un fichier existant ; un test le vérifie. Toute évolution du kit garde cette propriété.

**Toute modification du corpus ou du kit prend une ligne au `CHANGELOG.md`**, qui dit ce qui change pour celui qui applique le workflow, pas ce qui change dans le fichier.

**Les titres anglais du template `AGENTS.md`** (`## Stack`, `## Build approach`, `## Commands`, `## Git`, `## Context files`…) sont lus par les skills du moteur. Les traduire casserait `/audit`, `/develop` et `/sync`.

**Ce dépôt applique son propre kit.** Les règles `MF-003`, `MF-016` et `MF-017` s'y appliquent comme ailleurs.

## Stack

- **Scripts** : Node 20 ou plus, ESM, aucune dépendance.
- **Site** : Next.js et Fumadocs, versions épinglées exactement (les deux paquets Fumadocs dérivent l'un de l'autre sous des plages de versions).
- **Package manager** : npm.

## Commands

```bash
npm test               # les garde-fous refusent ce qu'ils doivent, et seulement ça
npm run corpus         # typographie et liens internes
npm run site:dev       # le site en local, corpus synchronisé
npm run verify         # tout ce qui précède, plus le build du site : avant chaque pull request
```

## Git

- integration: on
- branch prefix: feat/
- commit: per-milestone

Flux : `<type>/<sujet>` vers `develop` par pull request, puis `develop` vers `main`. Messages de commit en français, une phrase au présent qui dit ce qui est désormais vrai, sans trailer d'attribution (MF-017).

## Où chercher une réponse

| Question | Document |
| :--- | :--- |
| Que dit le workflow ? | `corpus/manifeste.md`, puis `corpus/cycle.md` |
| Pourquoi cette règle ? | `corpus/regles.md`, rubrique « Pourquoi » de la règle |
| Comment le site dérive-t-il du corpus ? | `site/scripts/sync.mjs` |
| Qu'est-ce qui a changé, et pourquoi ? | `CHANGELOG.md` |

## Context files

- [site/AGENTS.md](site/AGENTS.md) (le site de documentation et ses fichiers pour agents)

## Base44 (développement local)

- `docker compose -f docker-compose.base44.yml up -d --build` lance le site Next.js depuis la source montée dans le conteneur, sur le port 3000 ; aucun service externe ni secret n'est requis.
- Au démarrage, `npm run dev` exécute `site/scripts/sync.mjs` avant le serveur : les pages et fichiers publics sont générés à partir du corpus et des templates montés depuis la racine du dépôt.
- Vérifier avec `docker compose -f docker-compose.base44.yml ps`, puis `curl -f http://localhost:3000/`, `/docs` et `/llms.txt`. Le serveur Next doit annoncer `next dev` dans les logs ; `npm --prefix site run dev` est la commande équivalente hors conteneur.
- La prévisualisation Next nécessite `BASE44_PUBLIC_HOST_SUFFIX` pour autoriser l'origine des ressources de développement ; la configuration est dans `site/next.config.mjs`.

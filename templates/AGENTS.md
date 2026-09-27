# <Nom du projet>

<!--
  Manuel opératoire du projet, lu par tous les agents (Claude Code, Cursor, Codex…)
  au début de chaque session. Posé par Maedow Flow (/flow installer), complété par
  /audit, tenu à jour par /sync.

  Les titres en anglais (Stack, Build approach, Commands, Specs, Rules, Agent skills,
  Context files, Git) sont ceux que lisent les skills : ne pas les traduire.
  Les champs <to be filled> et <TBD, set by /scope> sont remplis par /audit et /scope.
-->

Ce projet suit [Maedow Flow](https://maedow-flow.vercel.app). Le corpus complet, en texte brut : `curl -fsSL https://maedow-flow.vercel.app/llms-full.txt`. Les règles y portent un code (`MF-001` à `MF-017`) : cite-le quand une règle est en jeu.

## Le produit

<à compléter : en trois à cinq lignes, pour qui, quel problème, et le principe central qu'aucun lot ne doit casser.>

Hors périmètre, sauf demande explicite : <à compléter>.

## Comment tu travailles

1. Lis ce fichier en entier au début de chaque session, puis `docs/scope/` pour savoir où en est le projet.
2. Aucun code applicatif sans décision écrite quand un choix structurant est en jeu (MF-001) : une spec dans `docs/specs/`, ou un plan approuvé en mode Plan.
3. Un lot, une intention (MF-002). Une idée hors du lot se propose avec `/scope`, elle ne se code pas.
4. Le cycle d'une feature : `/scope`, `/architect` si une décision manque, `/develop`, puis selon le palier `/check verify`, `/test` et `/check review`, enfin `verify`, `/document pr` et `/sync`.
5. Fini veut dire constaté sur l'application qui tourne (MF-010). Ce qui n'a pas pu être vérifié se dit.
6. Avant d'utiliser une bibliothèque, consulte sa documentation actuelle avec Context7 (MF-013).
7. Pose une seule question ciblée, et seulement si la tâche est réellement ambiguë.

## Stack

<to be filled>

## Build approach

<TBD, set by /scope>

## Commands

<to be filled>

Avant chaque pull request, une seule commande (MF-005) :

```bash
npm run verify
```

## Specs

Les décisions vivent dans `docs/specs/NNNN-titre.md` (écrites par `/architect`), le scope dans `docs/scope/`, les relectures dans `docs/reviews/`. Ce qui n'est pas dans une spec n'est pas décidé, et ne se décide pas pendant l'implémentation.

## Rules

<to be filled>

- Ce qui entre est `unknown` jusqu'à sa validation par un schéma, côté serveur (MF-007). Prix, rôles, statuts de paiement et propriétaires se relisent depuis le serveur.
- L'autorisation se vérifie côté serveur, à chaque accès (MF-008).
- Les migrations sont versionnées ; une migration appliquée ne se modifie jamais (MF-009).
- Les fichiers `.env*` réels te sont interdits (MF-006) : l'humain les remplit, le code lit `process.env`.

## Git

- integration: on
- branch prefix: feat/
- commit: per-milestone

Flux : `<type>/<sujet>` vers `develop` par pull request, puis `develop` vers `main` par pull request. Jamais de commit ni de push direct sur `main` ou `develop` (MF-003) : `.claude/hooks/garde.mjs` et `.githooks/pre-push` le refusent. Pars toujours de `develop` à jour.

Tu pousses ta branche et ouvres la pull request vers `develop` après confirmation. Tu ne fusionnes jamais : l'humain relit et fusionne.

Messages de commit (MF-017) : une phrase en français, au présent, qui dit ce qui est désormais vrai. Aucun trailer `Co-Authored-By`, aucune mention d'outil, pas de tiret cadratin. Cette règle prime sur le format proposé par `/develop`, et `.githooks/commit-msg` la fait respecter.

## Agent skills

- Moteur : `JavaScript-Mastery-Pro/skills` (`/scope`, `/architect`, `/develop`, `/check`, `/test`, `/debug`, `/sync`, `/audit`, `/document`).
- Kit : plugin `maedow-flow` (`/flow controler` vérifie que ce projet respecte encore le workflow).

MCP servers: context7 (recommended)

## Context files

<!-- Nested AGENTS.md files are listed here as they are created -->

---
name: flow
description: Installe, contrôle ou protège Maedow Flow dans le projet courant (AGENTS.md, garde-fous Claude Code, hooks git, CI GitHub, ruleset de branches). À utiliser juste après l'échafaudage d'un nouveau projet, pour faire entrer un projet existant dans le workflow, pour vérifier qu'un projet respecte encore le workflow, ou pour protéger main et develop sur GitHub.
argument-hint: "[installer | controler | proteger]"
allowed-tools: Bash(node "${CLAUDE_SKILL_DIR}/../../scripts/flow.mjs" *), Read, Grep, Glob, Edit
---

# /flow

Tu installes, contrôles ou protèges le kit [Maedow Flow](https://maedow-flow.vercel.app) dans le projet courant. Le script fait le travail mécanique (copier, composer, configurer) ; toi, tu fais ce qu'un script ne sait pas faire : adapter `AGENTS.md` au projet, juger ce qui a été laissé en place, et l'expliquer.

Le script : `node "${CLAUDE_SKILL_DIR}/../../scripts/flow.mjs" <mode>`. S'il est introuvable (skill copié hors du plugin), télécharge-le d'abord : `curl -fsSL https://maedow-flow.vercel.app/flow.mjs -o flow.mjs`, lance-le avec `node flow.mjs <mode>`, puis supprime-le. Il ira chercher les modèles sur le site.

## Choisir le mode

- `installer`, `controler` ou `proteger` en argument : ce mode.
- Sans argument : lance `controler`. S'il manque des fichiers du kit, propose `installer` ; si tout est là, dis-le et arrête-toi.

## controler

1. Lance le script en mode `controler`. Il ne modifie rien.
2. Rends le rapport, puis pour chaque écart, ce qui le corrige (le script le suggère). Ne corrige rien sans accord.

## installer

1. **L'échafaudage d'abord.** Si le projet n'a pas encore de manifeste (`package.json`, `app.json`, `Cargo.toml`…) alors qu'une spec de stack existe dans `docs/specs/`, rappelle que l'initialiseur de la stack passe avant le kit : il refuse souvent un dossier déjà rempli. Propose de revenir ensuite, et arrête-toi.
2. **La branche.** Sur `main` ou `develop` avec un historique, propose `git switch -c chore/maedow-flow` avant d'écrire quoi que ce soit (MF-003). Un dépôt sans aucun commit n'en a pas besoin.
3. **Le script.** Lance-le en mode `installer`. Il pose ce qui manque (`+`), laisse ce qui existe (`=`), et complète `.gitignore`, `package.json` et la configuration git.
4. **`AGENTS.md`, s'il vient d'être posé :**
   - Remplace `<Nom du projet>` par le nom du projet.
   - Rédige « Le produit » depuis `docs/scope/scope.md` s'il existe. Sinon, pose une seule question : pour qui, quel problème, et le principe central qu'aucun lot ne doit casser.
   - Projet TypeScript qui suit Maedow Arch (`eslint-config-maedow-arch` dans les dépendances, ou `src/features/` et `src/core/`) : ajoute sous `## Rules` la ligne « Architecture [Maedow Arch](https://maedow-arch-docs.vercel.app/llms.txt) : le flux `app/ → features/ → core/ → lib/` ne remonte jamais. Cite les codes MA-001 à MA-009. » Autre projet TypeScript : propose-la, ne l'impose pas.
   - Laisse `<to be filled>` et `<TBD, set by /scope>` : `/audit` et `/scope` les remplissent depuis leurs sources.
5. **`AGENTS.md`, s'il existait déjà :** n'y touche pas. Compare-le au modèle (`${CLAUDE_SKILL_DIR}/../../templates/AGENTS.md`) et propose, sous forme de diff, ce qui manque d'essentiel : le bloc `## Git` avec `integration: on`, la règle des messages de commit (MF-017), la commande `verify`.
6. **Les autres fichiers laissés en place :** signale seulement ce qui compte. Une CI existante sans jobs nommés `verify` et `secrets` ne satisfera pas le ruleset de `proteger` ; un `.claude/settings.json` existant sans le hook `garde.mjs` laisse MF-003 et MF-016 sans garde côté agent.
7. **La suite**, présentée comme des recommandations : `/audit` pour compléter `AGENTS.md`, relire le diff, commiter sur la branche (phrase française au présent, sans trailer), pull request vers `develop`, puis `/flow proteger` une fois le dépôt distant en place.

## proteger

Cette action modifie la configuration du dépôt sur GitHub. **Demande une confirmation explicite avant de lancer le script**, en disant ce qu'elle fait :

- un ruleset « Maedow Flow » sur `main` et `develop` ;
- ni suppression ni réécriture d'historique ;
- pull request obligatoire, statuts `verify` et `secrets` obligatoires ;
- aucun contournement, y compris pour le propriétaire du dépôt.

Prérequis : un dépôt distant GitHub, `main` et `develop` déjà poussées, `gh` authentifié. Sur un refus 403 (dépôt privé d'un compte gratuit), explique que MF-003 repose alors sur les hooks locaux et la CI.

Pour vérifier la protection ensuite, lis sa configuration : `gh api repos/{owner}/{repo}/rulesets`. **Ne teste jamais une protection en poussant sur `main` ou `develop`** : un contournement réussi n'est pas un test, c'est la violation que la protection devait empêcher.

## Ce que ce skill ne fait jamais

- Écraser un fichier existant. Il propose, l'humain décide.
- Lire un fichier `.env` réel (MF-006).
- Commiter sur `main` ou `develop`, ou ajouter un trailer d'attribution à un commit (MF-003, MF-017).

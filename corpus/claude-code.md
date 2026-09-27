# Claude Code

Claude Code n'est pas une collection de commandes à mémoriser, c'est un jeu de contrôles. La seule question utile : quel problème est-ce que je cherche à résoudre ?

## Où vit chaque consigne

| Ce que tu veux | Où ça vit |
| :--- | :--- |
| Que l'agent le sache toujours | `AGENTS.md` (et `CLAUDE.md` qui pointe vers lui) |
| Une façon répétée de travailler | un skill |
| Que ça arrive à coup sûr | un hook |
| Que ça n'arrive jamais | une permission `deny`, ou un hook qui refuse |
| Une demande ponctuelle | le prompt |
| Un système extérieur (GitHub, base, suivi d'erreurs) | un serveur MCP |
| Une enquête qui ne doit pas encombrer la session | un sous-agent |
| Deux chantiers en parallèle sans se marcher dessus | un worktree |

Mettre une règle au mauvais endroit est l'erreur la plus fréquente : une interdiction écrite dans `AGENTS.md` sera oubliée un jour, la même en `deny` ne le sera jamais ([MF-015](regles.md#mf-015--le-contexte-durable-vit-dans-agentsmd), principe 4 du [manifeste](manifeste.md)).

## Le moteur : les skills

Installés depuis [JavaScript-Mastery-Pro/skills](https://github.com/JavaScript-Mastery-Pro/skills), plus `/flow` fourni par Maedow Flow.

| Skill | Ce qu'il fait | Ce qu'il écrit | Moment du [cycle](cycle.md) |
| :--- | :--- | :--- | :--- |
| `/scope` | quoi construire, dans quel ordre, à quel palier | `docs/scope/` | phase 0, puis après chaque lot |
| `/architect` | les décisions structurantes, options pesées | `docs/specs/` | phase 1, étape 2 de la boucle |
| `/develop` | construit depuis la spec et `AGENTS.md` | le code | étape 3 |
| `/check verify` | fait tourner l'application et constate | rien | étape 4 |
| `/test` | les tests des fichiers modifiés | `*.test.*` | étape 5 |
| `/check review` | relecture par un autre modèle | `docs/reviews/` | étape 6 |
| `/document` | description de PR, changelog, notes de version, postmortem | selon le type | étape 7, phases 3 et 4 |
| `/sync` | remet le contexte à jour après un lot | `AGENTS.md`, scope | étape 9 |
| `/audit` | écrit le contexte initial d'un projet | `AGENTS.md` | phase 1, projet existant |
| `/debug` | trouve la cause racine, corrige au minimum | la correction | quand ça casse |
| `/flow` | installe, contrôle et protège le kit Maedow Flow | les fichiers du kit | phase 1, contrôles |

**Trois frottements connus**, et ce qui l'emporte :

- `/develop` propose des messages de commit en anglais au format Conventional Commits, avec un trailer `Co-Authored-By`. [MF-017](regles.md#mf-017--écrire-juste) l'emporte : phrase française au présent, aucun trailer. Le hook `commit-msg` refuse le trailer si la consigne est oubliée.
- `/develop` crée ses branches depuis la branche courante. Pars toujours de `develop` à jour.
- Les skills lisent des titres de section précis dans `AGENTS.md` (`## Stack`, `## Build approach`, `## Commands`, `## Git`, `## Context files`). Ces titres restent en anglais dans le template, exprès : les traduire casserait la lecture.

## `AGENTS.md`

Ce qui y entre : la stack décidée, les commandes, les conventions qui ne se lisent pas dans le code, les pièges, les règles du produit qui ne se négocient pas. Ce qui n'y entre pas : ce que l'agent découvre en lisant le dépôt, les généralités, l'historique des décisions (il est dans `docs/specs/`).

`/audit` l'écrit, `/sync` le tient à jour. Après un plan approuvé qui fixe une convention durable : « Mets à jour `AGENTS.md` avec les conventions du plan approuvé. Reste court. N'ajoute rien que le code dise déjà. »

Un `AGENTS.md` imbriqué (`src/payments/AGENTS.md`) se justifie pour une zone qui a ses propres conventions ou ses pièges, jamais par dossier.

## Permissions

Le kit pose `.claude/settings.json` :

- **allow** : lecture git (`status`, `diff`, `log`, `branch`), `add`, `commit`, `switch`, et les scripts du projet (`verify`, `lint`, `typecheck`, `test`, `build`, `dev`).
- **ask** : `git push`, `gh pr create`, `gh pr merge`, l'installation de dépendances.
- **deny** : lecture et écriture des fichiers d'environnement réels ([MF-006](regles.md#mf-006--les-secrets-restent-hors-de-portée)).

`Shift+Tab` fait tourner les modes. Mode Plan pour tout ce qui est structurel ; « accepter les modifications » pendant `/develop`, puisque la branche et les hooks bornent les dégâts ; mode manuel quand on touche à quelque chose de sensible.

## Hooks

Le kit en installe un, `.claude/hooks/garde.mjs`, qui s'exécute avant chaque commande shell de l'agent :

| Commande | Décision | Règle |
| :--- | :--- | :--- |
| `git commit` sur `main` ou `develop` | refus | MF-003 |
| `git push` vers `main` ou `develop` | refus | MF-003 |
| `git push --force` | refus | MF-016 |
| `--no-verify`, `core.hooksPath` modifié | refus | MF-016 |
| `git push --force-with-lease`, `git reset --hard`, `git clean -f` | demande | MF-016 |
| `rm -rf`, `Remove-Item -Recurse` | demande | MF-016 |
| `DROP`, `TRUNCATE`, suppression de branche distante | demande | MF-016 |

Un formatage automatique après chaque modification est un bon ajout par projet, à condition de ne formater **que** le fichier modifié : formater tout le dépôt à chaque édition noie le diff et ralentit tout.

## Mode Plan

À utiliser pour : schéma de données et migrations, authentification, paiement, permissions, refonte large, code inconnu, tout ce qui touche plusieurs systèmes. À éviter pour : changer un texte, renommer une variable, corriger une marge.

Un plan se conteste avant de s'approuver. Trois questions suffisent souvent : « Qu'est-ce qui casse dans le code existant si on fait ça ? », « Quelle est la version la plus simple qui tient les critères ? », « Pourquoi cette brique, et quelle mesure la justifie ? ». Un plan trop ambitieux se ramène au besoin : voir [Prompts](prompts.md#simplifier-un-plan-trop-ambitieux).

## Modèle et effort

Deux réglages indépendants : `/model` choisit le cerveau, `/effort` dit combien il réfléchit.

| Travail | Modèle | Effort |
| :--- | :--- | :--- |
| Renommer, formater, CRUD de routine, tests simples | rapide | bas |
| Construire une feature décidée | fort | moyen |
| Architecture, schéma, sécurité, revue approfondie | le plus fort | haut |
| Bug de concurrence, bug intermittent, fuite de données | le plus fort | maximal |

## Contexte

| Situation | Geste |
| :--- | :--- |
| Sujet sans rapport avec le précédent | `/clear` |
| Même sujet, conversation trop longue | `/compact garde les décisions de schéma et les problèmes ouverts` |
| L'agent oublie, se répète, cite des décisions périmées | `/context` pour voir ce qui occupe l'attention |
| Essayer une autre voie sans perdre celle-ci | `/branch <nom>` |
| L'agent est parti dans la mauvaise direction | `Esc Esc`, ou `/rewind` |
| Une question à côté, sans polluer la session | `/btw <question>` |
| Reprendre le travail de la veille | `claude -c`, ou `/resume` |

Entre deux features : `/sync`, puis `/clear`. La mémoire est dans le dépôt ([principe 6](manifeste.md#six-principes)), la conversation peut repartir de zéro.

## Sous-agents

Un sous-agent, c'est un contexte séparé, une tâche ciblée, et un résultat rendu à la session principale. Trois usages rentables :

1. **Enquêtes parallèles** avant une décision : un sous-agent par question indépendante (le modèle de données, le parcours existant, la couverture de tests), chacun rendant comportement actuel, fichiers concernés, risques et recommandation.
2. **Relecture fraîche** d'une feature finie ([MF-011](regles.md#mf-011--un-regard-neuf-avant-de-fusionner)).
3. **Vérification d'un constat** : un relecteur peut se tromper. Un sous-agent neuf reproduit le problème avant que quiconque le corrige.

Les formulations sont dans [Prompts](prompts.md).

## Worktrees, `/batch` et arrière-plan

- `claude -w <nom>` ouvre une session dans un worktree isolé : deux lots avancent sans éditer les mêmes fichiers.
- `/batch <changement>` découpe un changement mécanique et divisible (migrer des tests, remplacer une API dépréciée partout) en unités confiées à des agents en worktree, chacune avec sa pull request. Pas pour une feature dont les décisions sont liées, comme un tunnel de paiement.
- `/bg <consigne>` détache la session pour qu'elle continue sans le terminal ; `claude agents` montre toutes les sessions en cours.

## Skills de projet

Le signal : la troisième fois que tu tapes la même suite de consignes. Le skill vit dans `.claude/skills/<nom>/SKILL.md`, versionné avec le projet.

```markdown
---
description: Construit ou modifie une page client en réutilisant le design system,
  les composants existants et les conventions responsives du projet. À utiliser pour
  toute page ou section visible par les clients.
---

Construis : $ARGUMENTS

1. Inspecte la page actuelle et les composants voisins.
2. Cherche un composant réutilisable avant d'en créer un.
3. Suis les jetons de typographie, d'espacement et de couleur.
4. Garde le changement centré sur la demande.
5. Lance l'application et vérifie le rendu, bureau et mobile.
6. Lance `verify`. Résume ce qui a changé.
```

La `description` est ce qui décide quand l'agent déclenche le skill : elle dit **quoi** et **quand**, concrètement. Un skill s'emploie là où ses consignes s'appliquent, et pas ailleurs : un skill d'interface client n'a rien à faire sur un écran d'administration.

## MCP

Un serveur MCP s'ajoute quand tu te surprends à recopier régulièrement des informations d'un service dans la conversation.

| Serveur | Quand |
| :--- | :--- |
| Context7 | toujours ([MF-013](regles.md#mf-013--la-documentation-se-consulte-elle-ne-se-suppose-pas)) |
| GitHub | pull requests, issues, revues |
| Supabase | schéma, migrations, journaux, avis de sécurité (`get_advisors`) |
| Vercel | déploiements, journaux d'exécution |
| PostHog | erreurs, analytique, flags |
| Figma | implémenter une maquette |
| Expo | builds et soumissions mobiles |

## Au quotidien

`/diff` avant d'accepter, `/review` et `/security-review` avant de fusionner, `@chemin/fichier` pour désigner exactement ce qui compte, `!commande` pour lancer une commande toi-même dans la conversation, `/doctor` quand Claude Code lui-même se comporte mal.

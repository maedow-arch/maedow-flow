# Démarrer

Trois situations : préparer une machine (une fois), lancer un projet neuf, ou faire entrer un projet existant dans le workflow.

## Préparer la machine, une seule fois

| Quoi | Commande | Pourquoi |
| :--- | :--- | :--- |
| Claude Code | voir la documentation officielle | l'agent principal |
| Les skills moteur | `npx skills add JavaScript-Mastery-Pro/skills` | `/scope`, `/architect`, `/develop`, `/check`, `/test`, `/debug`, `/sync`, `/audit`, `/document` |
| Le plugin Maedow Flow | `/plugin marketplace add maedow-arch/maedow-flow` puis `/plugin install maedow-flow@maedow-flow` | le skill `/flow` et le kit de templates |
| Context7 | `claude mcp add --transport http context7 https://mcp.context7.com/mcp` | la documentation à jour des bibliothèques ([MF-013](regles.md#mf-013--la-documentation-se-consulte-elle-ne-se-suppose-pas)) |
| GitHub CLI | `gh auth login` | dépôts, pull requests, protections de branche |
| Tes règles personnelles | copier `global/CLAUDE.md` du dépôt vers `~/.claude/CLAUDE.md` | elles s'appliquent alors à toutes tes sessions, dans tous tes projets |

Les autres serveurs MCP (Supabase, Vercel, PostHog, Figma, Expo) s'ajoutent quand un projet s'en sert, pas avant.

## Le prompt d'amorçage

À coller en premier message dans un dossier vide, ou dans un projet existant :

```text
Ce projet suit Maedow Flow. Avant toute action, lis le corpus en texte brut :
curl -fsSL https://maedow-flow.vercel.app/llms-full.txt

Applique ensuite la procédure de la page Démarrer qui correspond à ce dossier
(nouveau projet ou projet existant). N'écris aucun code applicatif tant que je
n'ai pas validé le scope et la stack.

L'idée : <pour qui, quel problème, et ce qui prouvera que ça marche>
```

**Pourquoi `curl` et pas un outil de lecture web.** Les outils qui « lisent » une page la font souvent résumer par un petit modèle avant de la rendre. Un résumé perd précisément ce qui compte ici : le texte exact des règles. `curl` rend le texte intégral.

## Nouveau projet

L'ordre compte. Les initialiseurs de projet (`create-next-app`, `create-expo-app`, `create-tauri-app`) refusent souvent un dossier qui contient déjà des fichiers : le kit s'installe donc **après** l'échafaudage, et seul `docs/` existe avant lui.

1. **Cadrer.** `/scope <l'idée>` écrit `docs/scope/scope.md` : les features, leur ordre, et le palier d'exigence par défaut (voir [Cycle](cycle.md#les-paliers)). Tu valides.
2. **Choisir la stack.** `/architect` en mode architecture, en partant du profil de [Plateformes](plateformes.md). Il écrit `docs/specs/0001-<stack>.md`. Tu valides : la stack est ensuite une décision, pas une suggestion.
3. **Échafauder.** `/develop` sur la tâche d'échafaudage lance l'initialiseur officiel de la stack décidée. Pour un projet web TypeScript, `npx create-maedow-arch-app <nom>` produit directement un projet conforme à Maedow Arch.
4. **Installer le kit.** `/flow installer` pose `AGENTS.md`, `CLAUDE.md`, `.claude/`, `.githooks/`, `.github/` et le script `verify`. Il n'écrase jamais un fichier existant.
5. **Compléter le contexte.** `/audit` remplit `## Stack`, `## Commands` et `## Rules` d'`AGENTS.md`. À sa question sur git, réponds `integration: on`.
6. **Brancher GitHub.** Voir [Le dépôt distant](#le-dépôt-distant) ci-dessous.
7. **Brancher le déploiement.** Web : projet Vercel lié au dépôt, un aperçu par pull request, la production depuis `main`. Mobile : EAS. Desktop : releases GitHub signées. Détails dans [Plateformes](plateformes.md).
8. **Entrer dans la boucle.** `/scope` sans argument désigne la première feature à construire, et le [cycle](cycle.md#phase-2--construire) prend le relais.

La porte de sortie de cette phase : `verify` passe en local **et** en CI sur le projet encore vide. Une CI qui n'a jamais tourné au vert sur un projet vide ne dira rien d'utile sur un projet plein.

## Projet existant

1. **Mesurer l'écart.** `/flow controler` liste ce qui manque par rapport au kit, sans rien modifier.
2. **Ouvrir une branche.** `git switch -c chore/maedow-flow`. L'adoption est un lot comme un autre ([MF-003](regles.md#mf-003--jamais-sur-main-ni-sur-develop)).
3. **Installer ce qui manque.** `/flow installer` ajoute les fichiers absents et laisse les autres en place, en disant lesquels il a laissés.
4. **Documenter l'existant.** `/audit` lit tout le code et écrit ou complète `AGENTS.md`, racine et zones.
5. **Enrôler l'existant.** `/scope` inscrit les features déjà là (`existing`) ou à moitié faites (`in-progress`), puis propose la suite.
6. **Chiffrer la dette d'architecture** (projets TypeScript) : `npx maedow-arch check`. Ne rien corriger dans ce lot : l'audit sert à décider, pas à réparer en série.
7. **Ouvrir la pull request** vers `develop`. Si `develop` n'existe pas encore, crée-la depuis `main` (voir ci-dessous).

## Le dépôt distant

Le flux est le même partout :

```text
<type>/<sujet>  ──PR──▶  develop  ──PR──▶  main
```

`develop` est la branche par défaut et reçoit les lots. `main` porte ce qui est en production et ne reçoit que `develop`. Mise en place, depuis le projet échafaudé :

```bash
gh repo create <nom> --private --source . --remote origin
git push -u origin main                 # naissance du dépôt : le commit de l'initialiseur, rien d'autre
git push -u origin main:develop         # develop naît de main
gh repo edit --default-branch develop
```

Le hook `pre-push` du kit autorise la **création** de `main` et de `develop` sur le distant, et refuse ensuite toute mise à jour directe. La naissance d'un dépôt n'est pas du travail sur `main` ; tout ce qui suit l'est.

Ensuite, la protection côté serveur, qui tient même pour un poste mal configuré :

```bash
/flow proteger
```

Le skill applique un ruleset GitHub sur `main` et `develop` : pas de suppression, pas de réécriture, pull request obligatoire, CI verte obligatoire, **et aucun contournement autorisé**, y compris pour toi. Un garde-fou que son propriétaire peut contourner n'en est pas un. Sur un dépôt privé d'un compte gratuit, GitHub refuse les rulesets (erreur 403) : les hooks locaux et la CI tiennent alors la règle seuls, et il faut le savoir.

## Avec une autre IA que Claude Code

Tout ce qui précède reste valable. Seuls les raccourcis changent.

- **Le corpus** : `https://maedow-flow.vercel.app/llms-full.txt`, ou page par page depuis l'index `https://maedow-flow.vercel.app/llms.txt`.
- **Les skills moteur** sont des Agent Skills : `npx skills add JavaScript-Mastery-Pro/skills` les installe aussi pour Cursor, Codex et les autres clients compatibles.
- **Le kit, sans le plugin** : le script d'installation se télécharge et va chercher les templates sur le site.

```bash
curl -fsSL https://maedow-flow.vercel.app/flow.mjs -o flow.mjs
node flow.mjs installer --profil web     # ou mobile, desktop
node flow.mjs controler
rm flow.mjs
```

- **Les garde-fous propres à Claude Code** (`.claude/settings.json` et son hook) n'ont pas d'effet ailleurs. Les hooks git et la CI, eux, s'appliquent à tous les outils et à tous les humains : c'est pour cela que les règles critiques y sont doublées.

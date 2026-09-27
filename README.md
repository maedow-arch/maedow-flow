# Maedow Flow

Un workflow de développement pour construire des applications solides avec des agents IA, du premier prompt jusqu'à la production. Web, mobile ou desktop.

> **Pour une IA** : lis le corpus en texte brut, `curl -fsSL https://maedow-flow.vercel.app/llms-full.txt`, puis applique la page Démarrer.

## Pourquoi

Un agent IA livré à lui-même invente les décisions qu'on ne lui a pas données, élargit le périmètre, déclare fini ce qu'il n'a pas vérifié et oublie d'une session à l'autre ce qui avait été tranché. Maedow Flow fixe l'ordre des choses : ce qui se décide avant de coder, ce qui se prouve avant de fusionner, et ce qui ne se fait jamais.

## En une minute

- **Un cycle en cinq phases** (cadrer, fonder, construire, livrer, exploiter), chacune fermée par une porte vérifiable, et quatre paliers d'exigence, du prototype à la production.
- **Dix-sept règles codées** `MF-001` à `MF-017`. Chacune dit ce qui la fait respecter : la machine (hook, permission, CI), un skill, ou la seule revue.
- **Un moteur existant** : les skills [JavaScript-Mastery-Pro/skills](https://github.com/JavaScript-Mastery-Pro/skills) (`/scope`, `/architect`, `/develop`, `/check`, `/test`…). Maedow Flow les ordonne et comble ce qu'ils ne couvrent pas.
- **Un kit installé en une commande** : `AGENTS.md`, garde-fous Claude Code, hooks git, CI GitHub, ruleset de branches.

## Utiliser

**Avec Claude Code**, une fois par machine :

```text
/plugin marketplace add maedow-arch/maedow-flow#main
/plugin install maedow-flow@maedow-flow
npx skills add JavaScript-Mastery-Pro/skills
```

Puis, dans chaque projet, le [prompt d'amorçage](corpus/demarrer.md#le-prompt-damorçage).

**Avec une autre IA** (Cursor, Codex…) : le même prompt d'amorçage, et le kit s'installe sans plugin :

```bash
curl -fsSL https://maedow-flow.vercel.app/flow.mjs -o flow.mjs && node flow.mjs installer && rm flow.mjs
```

## Le corpus

| Page | Ce qu'elle dit |
| :--- | :--- |
| [Manifeste](corpus/manifeste.md) | le problème, les six principes, les rôles |
| [Démarrer](corpus/demarrer.md) | préparer une machine, lancer un projet, adopter le workflow sur un existant |
| [Cycle](corpus/cycle.md) | les phases, les portes, les paliers, la boucle de feature |
| [Règles](corpus/regles.md) | `MF-001` à `MF-017`, et ce qui fait respecter chacune |
| [Claude Code](corpus/claude-code.md) | où vit chaque consigne, le moteur de skills, permissions, hooks, contexte |
| [Plateformes](corpus/plateformes.md) | les stacks par défaut pour le web, le mobile et le desktop |
| [Sécurité](corpus/securite.md) | le socle minimal, vérifiable ligne à ligne |
| [Tenir la charge](corpus/echelle.md) | ne pas tomber quand les requêtes affluent : précautions du premier jour, pic annoncé, montée en charge sur mesure |
| [Prompts](corpus/prompts.md) | les formulations éprouvées pour chaque moment du cycle |

L'architecture du code relève d'un standard voisin, [Maedow Arch](https://maedow-arch-docs.vercel.app).

## Ce que contient ce dépôt

| Chemin | Rôle |
| :--- | :--- |
| `corpus/` | le workflow, **source de vérité** |
| `templates/` | le kit copié dans les projets, décrit par `templates/manifest.json` |
| `scripts/flow.mjs` | installe, contrôle et protège le kit, sans aucune dépendance |
| `skills/flow/` | le skill `/flow` de Claude Code |
| `.claude-plugin/` | le dépôt est un plugin et une marketplace Claude Code |
| `global/CLAUDE.md` | les règles personnelles, à copier dans `~/.claude/CLAUDE.md` |
| `site/` | le site et ses fichiers pour agents (`llms.txt`, `llms-full.txt`, pages en Markdown brut), dérivés du corpus |
| `tests/` | la preuve que chaque garde-fou mécanique refuse ce qu'il doit, et laisse passer le reste |

## Licence

MIT

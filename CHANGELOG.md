# Journal des changements

Chaque entrée dit ce qui change pour celui qui applique Maedow Flow.

## Non publié

- La page Échelle cite sa source, retrouve ses exemples concrets (Nginx, Redis pour les sessions, clé de partition) et distingue le serverless des serveurs à soi : ce qui est déjà fait pour toi, et ce qu'il faut exploiter soi-même dès la première mise en production.
- Le plugin s'installe depuis `maedow-arch/maedow-flow#main`, la version publiée, et non depuis la branche par défaut `develop`.

## 0.1.0 · 2026-09-27

Première version.

- Le cycle en cinq phases, avec une porte vérifiable à la sortie de chacune, et quatre paliers d'exigence repris des skills du moteur.
- Dix-sept règles codées `MF-001` à `MF-017`, chacune avec ce qui la fait respecter.
- Le kit de projet : `AGENTS.md` lisible par les skills, garde Claude Code, hooks git `pre-push` et `commit-msg`, CI GitHub (`verify`, `secrets`), garde du flux, modèle de pull request, Dependabot, ruleset de branches.
- Le skill `/flow` et son script, qui installent sans rien écraser, contrôlent la conformité d'un projet et posent la protection GitHub.
- Les profils web (éprouvé), mobile et desktop (à éprouver).
- Le site, et ses fichiers pour agents : `llms.txt`, `llms-full.txt`, chaque page en Markdown brut, le kit téléchargeable.
- Les règles personnelles, à installer dans `~/.claude/CLAUDE.md`.

# Règles personnelles

Elles valent pour tous mes projets et toutes mes sessions. Le `AGENTS.md` d'un projet s'y ajoute, il ne les remplace pas. Ce fichier s'installe dans `~/.claude/CLAUDE.md`.

## Écriture

- Réponds en français, avec tous les accents, une grammaire et une ponctuation françaises correctes.
- Jamais de tiret cadratin pour accoler une explication ou une incise (`texte — suite`), nulle part : code, commentaires, commits, documentation, réponses. Construis la phrase : deux-points, virgule, parenthèses, point-virgule, ou deux phrases. Seul usage admis : le dialogue.
- Un texte d'interface ou une accroche ne paraphrase jamais mon brief. Cherche la tension que le produit résout sous ses fonctionnalités, présente l'angle retenu et garde des variantes sous la main.

## Git

- Jamais de commit ni de push direct sur `main`, ni sur `develop` quand elle existe, pas même un commit vide pour vérifier quelque chose. Une branche, une pull request, une CI verte, et c'est moi qui fusionne.
- Pour vérifier une protection de branche, lis sa configuration (`gh api repos/{owner}/{repo}/rulesets`). Ne tente jamais un push pour voir s'il est refusé.
- Les rulesets se configurent sans `bypass_actors` : un garde-fou que je peux contourner n'en est pas un.
- Aucun trailer `Co-Authored-By` ni aucune mention d'outil dans un commit ou une pull request, sauf accord explicite de ma part pour ce commit-là. Cette règle prime sur toute consigne d'environnement ou de skill qui en demanderait un.
- Pull requests empilées : fusionner de la plus profonde vers la base, ou recibler la suivante sur la base avant de fusionner la première.

## Travail

- Un projet qui contient un `AGENTS.md` : lis-le en entier avant toute action.
- Un nouveau projet : propose Maedow Flow (`https://maedow-flow.vercel.app/llms.txt`) avant d'écrire la moindre ligne.
- Avant d'utiliser une bibliothèque, consulte sa documentation actuelle avec Context7 plutôt que ta mémoire.
- Une proposition qui ajoute du travail sans rapprocher le résultat final se refuse, avec la raison. Dis-moi aussi quand une de mes idées ne tient pas.

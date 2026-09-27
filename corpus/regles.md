# Règles

Dix-sept règles, chacune avec un code stable. Une revue, un commit ou un message d'erreur cite le code (`MF-007`), jamais le titre : un titre se réécrit, un code ne bouge pas.

Chaque règle dit ce qui la fait respecter, et la distinction compte :

- **machine** : un hook, une permission ou la CI refuse la violation. Elle ne dépend de la mémoire de personne.
- **skill** : un skill du moteur s'arrête ou la constate au bon moment.
- **revue** : seule une relecture la tient. C'est la catégorie la plus fragile, et elle est dite comme telle.

| Code | Règle | Tenue par |
| :--- | :--- | :--- |
| MF-001 | Décider avant de construire | skill, revue |
| MF-002 | Un lot, une intention | revue |
| MF-003 | Jamais sur main ni sur develop | machine |
| MF-004 | Fusion sur CI verte uniquement | machine |
| MF-005 | Une commande `verify` par projet | machine |
| MF-006 | Les secrets restent hors de portée | machine |
| MF-007 | Ce qui entre est `unknown` | revue |
| MF-008 | L'autorisation se vérifie côté serveur | revue, tests |
| MF-009 | Les migrations sont versionnées et immuables | revue |
| MF-010 | Fini veut dire prouvé | skill |
| MF-011 | Un regard neuf avant de fusionner | skill |
| MF-012 | Un bug se reproduit avant de se corriger | skill |
| MF-013 | La documentation se consulte, elle ne se suppose pas | revue |
| MF-014 | Pas de brique sans goulot mesuré | revue |
| MF-015 | Le contexte durable vit dans `AGENTS.md` | skill |
| MF-016 | L'irréversible se confirme | machine |
| MF-017 | Écrire juste | machine, revue |

## MF-001 · Décider avant de construire

**Règle.** Un choix coûteux à défaire est décidé par écrit avant l'implémentation : schéma de données, authentification, paiement, choix d'un fournisseur, structure du code, tout ce qui touche plusieurs systèmes. La décision prend la forme d'une spec `/architect` (`docs/specs/`) ou d'un plan approuvé en mode Plan.

**Pourquoi.** Un agent à qui manque une décision l'invente, silencieusement, au milieu du code. Relire un plan de trente lignes coûte moins cher que défaire un diff de deux mille.

**Tenue par.** `/develop` s'arrête quand une décision structurante n'a pas de spec, et renvoie vers `/architect`. La revue vérifie qu'aucune décision n'a été prise en douce.

**Exception.** Construire sur une hypothèse est permis si l'humain le choisit : `/develop` l'enregistre comme spec `Assumed`, qui reste signalée tant que `/architect` ne l'a pas ratifiée. Une dette de décision visible vaut mieux qu'une décision cachée.

## MF-002 · Un lot, une intention

**Règle.** Un lot livre une seule capacité, décrite par ses critères d'acceptation. Ce qui est utile mais hors du lot se propose (`/scope <l'idée>`) et ne se code pas.

**Pourquoi.** Un lot qui fait trois choses se relit mal, se teste mal et se défait mal. C'est aussi la pente naturelle d'un agent : « tant que j'y suis ».

**Tenue par.** La revue, et `/check review` qui signale les changements sans lien avec la feature.

## MF-003 · Jamais sur main ni sur develop

**Règle.** Tout travail part d'une branche dédiée (`feat/`, `fix/`, `chore/`, `refactor/`, `docs/`, `test/`) et rejoint `develop` par pull request. `main` ne reçoit que `develop`, par pull request. Aucun commit ni push direct sur l'une ou l'autre, pas même un commit vide « pour vérifier ».

**Pourquoi.** `develop` est l'intégration, `main` la production. Un raccourci sur l'une ou l'autre fait entrer du code qu'aucune CI n'a jugé et qu'aucun humain n'a relu.

**Tenue par.** Trois couches, parce qu'aucune ne suffit seule :

- le hook Claude Code `.claude/hooks/garde.mjs` refuse le commit sur ces branches et le push vers elles ;
- le hook git `.githooks/pre-push` refuse la mise à jour directe de `main` et `develop`, pour tous les outils et tous les humains ;
- le workflow CI `garde-flux.yml` refuse une pull request vers `main` qui ne vient pas de `develop`.

Côté serveur, un ruleset GitHub sans contournement (`/flow proteger`) quand le plan GitHub le permet.

**Exception.** La création initiale de `main` et `develop` sur le dépôt distant (voir [Démarrer](demarrer.md#le-dépôt-distant)).

## MF-004 · Fusion sur CI verte uniquement

**Règle.** Lint, typage, tests, build et scan de secrets passent en CI avant toute fusion. Une CI rouge ne se contourne pas, elle se répare.

**Pourquoi.** « Ça marche sur ma machine » n'est pas un état du projet. La CI est le seul juge qui voit le même code pour tout le monde.

**Tenue par.** `.github/workflows/ci.yml`, et le ruleset qui exige le statut `verify`.

## MF-005 · Une commande `verify` par projet

**Règle.** Le projet expose une commande unique, `verify`, qui enchaîne les contrôles disponibles (lint, typage, tests, build). L'agent la lance avant chaque pull request, et `AGENTS.md` la nomme.

**Pourquoi.** Une liste de cinq commandes à retenir finit toujours amputée d'une. Une seule commande se lance, ou ne se lance pas, et ça se voit.

**Tenue par.** `/flow installer` crée le script, `/flow controler` signale son absence, la CI exécute les mêmes contrôles.

## MF-006 · Les secrets restent hors de portée

**Règle.** L'agent ne lit ni n'écrit les fichiers d'environnement réels (`.env`, `.env.local`, `.env.*.local`, `.env.production`). Seul `.env.example`, sans valeur, est versionné. Le code lit `process.env` sans jamais afficher une valeur. Une variable préfixée pour le client (`NEXT_PUBLIC_`, `EXPO_PUBLIC_`, `VITE_`) est publique : elle ne porte jamais de secret.

**Pourquoi.** Un secret lu par l'agent finit dans une transcription, un journal ou un commit. Un secret poussé sur un distant est compromis, même sur un dépôt privé, même retiré au commit suivant.

**Tenue par.** Les règles `deny` de `.claude/settings.json`, le `.gitignore`, et le scan de secrets de la CI.

**Si ça arrive.** Révoquer et régénérer le secret d'abord, nettoyer l'historique ensuite. Dans cet ordre.

## MF-007 · Ce qui entre est `unknown`

**Règle.** Toute donnée venue de l'extérieur du serveur (formulaire, paramètre d'URL, corps de requête, réponse d'API tierce, webhook, fichier téléversé, stockage local du client) est `unknown` jusqu'à sa validation par un schéma, côté serveur, à la frontière. Un prix, un rôle, un statut de paiement ou un identifiant de propriétaire ne sont **jamais** crus sur parole : le serveur les relit depuis sa propre source.

**Pourquoi.** C'est la faute que les agents commettent par défaut : faire confiance au client parce que le client, c'est le code qu'ils viennent d'écrire.

**Tenue par.** La revue, `/check review` et `/security-review`. Pour le web TypeScript, Maedow Arch interdit en plus `any` et la double assertion (MA-005, MA-006).

## MF-008 · L'autorisation se vérifie côté serveur

**Règle.** Chaque route, action serveur et requête protégée vérifie l'identité **et** le droit, à chaque accès. Masquer un bouton ou un lien n'est pas une protection. Avec une base exposée au client (Supabase), la sécurité au niveau des lignes (RLS) est activée sur chaque table, et ses règles sont testées.

**Pourquoi.** L'interface n'est qu'un client parmi d'autres. N'importe qui peut appeler l'API sans elle.

**Tenue par.** La revue, et des tests obligatoires pour trois cas : non authentifié, authentifié sans le droit, authentifié avec le droit.

## MF-009 · Les migrations sont versionnées et immuables

**Règle.** Tout changement de schéma passe par une migration versionnée dans le dépôt. Une migration appliquée ne se modifie jamais : on en écrit une nouvelle. Un changement de schéma se prépare en mode Plan (MF-001), et une migration destructive (suppression de colonne ou de table) se fait en deux temps : d'abord le code cesse de s'en servir, ensuite la donnée disparaît.

**Pourquoi.** Une migration modifiée après coup diverge entre les environnements, et la divergence ne se voit qu'en production.

**Tenue par.** La revue.

## MF-010 · Fini veut dire prouvé

**Règle.** Une feature est finie quand chacun de ses critères d'acceptation a été constaté sur l'application qui tourne. Ce qui n'a pas pu être vérifié est écrit comme tel, jamais passé sous silence.

**Pourquoi.** Des tests verts prouvent que le code fait ce que les tests demandent. Ils ne prouvent pas que la page s'affiche, que le bouton est branché, ni que la feature correspond à ce qui avait été décidé.

**Tenue par.** `/check verify`, à partir du palier `Alpha`.

## MF-011 · Un regard neuf avant de fusionner

**Règle.** Aux paliers `Beta` et `GA`, le code est relu avant la pull request par un contexte qui ne l'a pas écrit : un autre modèle, ou un sous-agent sans l'historique de la session. Chaque constat est reproduit avant d'être corrigé, et seuls les problèmes confirmés se corrigent.

**Pourquoi.** Un modèle qui relit son propre travail partage ses angles morts. Et un relecteur, humain ou non, produit aussi des faux positifs : corriger sans reproduire, c'est parfois casser ce qui marchait.

**Tenue par.** `/check review`, qui écrit ses constats dans `docs/reviews/`.

## MF-012 · Un bug se reproduit avant de se corriger

**Règle.** Une correction commence par une reproduction déterministe et se termine par un test de régression qui échouait avant et passe après. La correction est minimale : pas de refonte ni de nouveauté glissée avec elle.

**Pourquoi.** Une correction qu'on ne sait pas expliquer est un bug qu'on n'a pas encore trouvé.

**Tenue par.** `/debug`, puis `/test`.

## MF-013 · La documentation se consulte, elle ne se suppose pas

**Règle.** Avant d'utiliser l'API d'une bibliothèque, d'un framework ou d'un service, l'agent en consulte la documentation actuelle (Context7, ou la documentation officielle), et installe les versions courantes plutôt que celles de sa mémoire.

**Pourquoi.** La connaissance d'un modèle a une date. Les bibliothèques, non : une API renommée ou dépréciée produit un code qui compile parfois, et qui échoue en silence.

**Tenue par.** La revue. C'est une règle de discipline, et elle est fragile.

## MF-014 · Pas de brique sans goulot mesuré

**Règle.** Cache, file d'attente, réplique de lecture, microservice, sharding ou tout autre élément d'infrastructure n'entrent dans le projet qu'avec la mesure qui les justifie, citée dans la spec. Un seul serveur et une seule base suffisent à des milliers d'utilisateurs.

**Pourquoi.** Chaque brique ajoute de la complexité, de la maintenance et des données potentiellement périmées. L'ajouter avant le besoin, c'est payer le coût sans le bénéfice.

**Tenue par.** La revue. L'ordre des étapes et leurs signaux sont dans [Tenir la charge](echelle.md).

## MF-015 · Le contexte durable vit dans `AGENTS.md`

**Règle.** `AGENTS.md` porte ce qu'un agent doit savoir à chaque session et ne peut pas déduire du code : stack décidée, commandes, conventions, pièges. Il reste court. `CLAUDE.md` n'est qu'un pointeur vers lui. Les généralités (« écris du code propre ») n'y entrent pas. Il est mis à jour après chaque lot.

**Pourquoi.** Tous les outils lisent `AGENTS.md`. Un contexte trop long dilue l'attention de l'agent ; un contexte périmé l'induit en erreur, ce qui est pire que pas de contexte.

**Tenue par.** `/audit` le crée, `/sync` le maintient après chaque lot.

## MF-016 · L'irréversible se confirme

**Règle.** Une opération qu'on ne peut pas défaire demande une confirmation humaine au moment où elle s'exécute : suppression récursive, `git reset --hard`, `git push --force-with-lease`, `DROP` ou `TRUNCATE`, suppression d'une branche distante. Deux opérations sont refusées sans appel : `git push --force` et tout contournement des hooks (`--no-verify`).

**Pourquoi.** Une confirmation coûte trois secondes. Une perte de données, une réécriture d'historique partagé ou un garde-fou désactivé coûtent des heures, parfois tout.

**Tenue par.** Le hook `.claude/hooks/garde.mjs`, qui répond « demander » ou « refuser » avant l'exécution.

## MF-017 · Écrire juste

**Règle.** Français correct partout où un humain lira : interface, documentation, commentaires, commits, pull requests. Pas de tiret cadratin pour accoler une incise ou une explication (`texte — suite`) : on construit la phrase avec deux-points, virgule, parenthèses, ou deux phrases. Un message de commit est une phrase au présent qui dit ce qui est désormais vrai (« Le panier refuse une quantité supérieure au stock »), sans trailer d'attribution (`Co-Authored-By`) ni mention d'outil.

**Pourquoi.** L'historique et la documentation sont lus plus souvent qu'ils ne sont écrits. Et l'historique d'un dépôt est signé par son auteur, pas par ses outils.

**Tenue par.** Le hook `.githooks/commit-msg` refuse le trailer d'attribution, la mention d'outil et le tiret cadratin dans les messages de commit. Ailleurs, la revue. Cette règle prime sur le format de commit que proposent les skills installés.

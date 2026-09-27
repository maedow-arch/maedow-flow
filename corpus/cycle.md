# Cycle

Cinq phases. Les deux premières se jouent une fois, la troisième se répète pour chaque feature, les deux dernières rythment la vie en production. Chaque phase se termine par une **porte** : une condition vérifiable, sans laquelle on ne passe pas à la suite.

```text
0 Cadrer ──▶ 1 Fonder ──▶ 2 Construire ──▶ 3 Livrer ──▶ 4 Exploiter
   ▲                       │        ▲                        │
   │                       └────────┘                        │
   │                    feature suivante                     │
   └──────────────────── nouvelle tranche ◀──────────────────┘
```

## Les paliers

Toutes les features ne méritent pas le même effort. Le palier se fixe une fois pour le projet (par `/scope`), et se relève feature par feature quand l'enjeu l'exige : une maquette de démonstration n'a pas les exigences d'un paiement.

| Palier | Pour quoi | Ce qui suit `/develop` | Ce qui marque la feature `done` |
| :--- | :--- | :--- | :--- |
| `Prototype` | explorer une idée, jeter si besoin | rien de plus que l'auto-contrôle de `/develop` | `/develop` |
| `Alpha` | premiers utilisateurs de confiance | `/check verify` | `/check verify` |
| `Beta` | vrais utilisateurs, vraies données | `/check verify`, `/test` | `/test` |
| `GA` | production, argent, données sensibles | `/check verify`, `/test`, `/check review`, `/document` | `/test`, revue sans constat critique ouvert |

Trois relèvements ne se discutent pas : **l'authentification, le paiement et toute écriture de données personnelles** sont au moins en `Beta`, quel que soit le palier du projet.

Les règles de sécurité et de git ([MF-003](regles.md#mf-003--jamais-sur-main-ni-sur-develop) à [MF-009](regles.md#mf-009--les-migrations-sont-versionnées-et-immuables)) s'appliquent à tous les paliers, `Prototype` compris. Un prototype qui fuit un secret a fui un secret.

## Phase 0 · Cadrer

**Entrée** : une idée. **Sortie** : `docs/scope/scope.md`.

`/scope <l'idée>` pose les questions que seul l'humain peut trancher (pour qui, quel problème, ce qui prouve le succès), découpe en features grossières, les ordonne, et recommande le palier par défaut. Il ne choisit aucun outil : ce n'est pas son travail.

**Porte** : tu as relu le scope, et chaque feature tient en une phrase d'intention et une ligne « Fini quand ».

On revient ici à chaque nouvelle tranche du produit : `/scope` sans argument fait le point (ce qui est livré, ce qui a dérivé, ce qui vient ensuite).

## Phase 1 · Fonder

**Entrée** : le scope validé. **Sortie** : un projet vide qui passe `verify`, en local et en CI.

1. `/architect` en mode architecture : la stack, depuis le profil de [Plateformes](plateformes.md).
2. `/develop` sur l'échafaudage : l'initialiseur officiel, les dépendances de base seulement.
3. `/flow installer` : le kit.
4. `/audit` : le contexte durable dans `AGENTS.md`.
5. Dépôt distant, protections, déploiement des aperçus (voir [Démarrer](demarrer.md#le-dépôt-distant)).

**Porte** : `verify` vert en local, CI verte sur la première pull request, un aperçu déployé.

## Phase 2 · Construire

La boucle, une feature à la fois. Chaque étape a sa commande, et sa porte.

| # | Étape | Commande | Porte |
| :--- | :--- | :--- | :--- |
| 1 | Choisir | `/scope` | La feature est la prochaine du scope, ou tu as dit pourquoi pas. |
| 2 | Décider | `/architect <feature>`, en mode Plan pour tout ce qui est structurel | Si la feature porte « needs a decision », une spec validée existe. Sinon, on passe. |
| 3 | Construire | `/develop <feature>` | Le code existe sur une branche dédiée, le typage passe. |
| 4 | Prouver | `/check verify <feature>` | Chaque critère d'acceptation constaté sur l'application qui tourne. |
| 5 | Tester | `/test <feature>` | Les tests couvrent ce qui casserait un utilisateur, y compris les refus d'accès. |
| 6 | Relire | `/check review` | Aucun constat critique ouvert. Les constats sont reproduits avant d'être corrigés. |
| 7 | Proposer | `verify`, puis `/document pr` | Pull request vers `develop`, décrite depuis le vrai diff. |
| 8 | Fusionner | toi, sur GitHub | CI verte. |
| 9 | Consigner | `/sync` | `AGENTS.md`, scope et statut des specs à jour. |

Les étapes 4 à 6 suivent le palier de la feature (tableau ci-dessus). L'étape 7 et les suivantes ne se sautent jamais.

**Si une étape échoue** : `/debug` pour un comportement faux, retour à `/architect` si l'échec révèle une mauvaise décision plutôt qu'une erreur de code. Corriger le code d'une mauvaise décision, c'est payer deux fois.

**Si une idée surgit en cours de route** : elle ne rejoint pas le lot. `/scope <l'idée>` l'inscrit pour plus tard ([MF-002](regles.md#mf-002--un-lot-une-intention)).

## Phase 3 · Livrer

**Entrée** : `develop` contient une tranche utile. **Sortie** : cette tranche en production.

1. Revue d'ensemble de l'application, sur contexte neuf (prompt dans [Prompts](prompts.md#revue-densemble)).
2. `/security-review` sur tout ce qui part en production, et la liste de [Sécurité](securite.md).
3. Parcours complets vérifiés sur l'aperçu de `develop` : le parcours client et le parcours d'administration, y compris ce qu'un utilisateur ordinaire ne doit **pas** pouvoir faire.
4. En option, une passe CodeRabbit : ses constats sont triés (confirmé, à vérifier, faux positif) avant toute correction.
5. `/document release-note`, puis pull request `develop` vers `main`, que tu fusionnes. Le tag de version suit la fusion.

**Porte** : parcours critiques constatés, aucun constat critique ouvert, migrations de base de données appliquées et réversibles ou documentées comme irréversibles.

## Phase 4 · Exploiter

- **Observer dès le premier jour.** Erreurs, journaux et analytique sont en place avant la première mise en production, pas après le premier incident.
- **Incident** : `/debug` sur une branche `fix/`, pull request, puis `/document postmortem`. Le postmortem dit ce qui a manqué au workflow, et le workflow se corrige.
- **Montée en charge** : on mesure, puis on consulte [Tenir la charge](echelle.md). Jamais l'inverse.
- **Dépendances** : Dependabot ouvre les pull requests, la CI les juge, tu fusionnes chaque semaine.

## Les outils arrivent quand le projet les réclame

Un projet neuf n'a besoin que des skills moteur. Les autres outils de Claude Code entrent quand une situation réelle les appelle :

| Signal | Outil |
| :--- | :--- |
| Tu répètes la même consigne pour la troisième fois | un skill de projet (`.claude/skills/<nom>/SKILL.md`) |
| Plusieurs enquêtes indépendantes avant une décision | des sous-agents en parallèle |
| Deux lots doivent avancer en même temps | des worktrees (`claude -w <nom>`) |
| Un changement mécanique touche tout le dépôt | `/batch` |
| Tu recopies régulièrement des données d'un service | un serveur MCP |

Le détail de chacun est dans [Claude Code](claude-code.md).

# Maedow Flow

Un workflow de développement pour construire des applications solides avec des agents IA, du premier prompt jusqu'à la production. Web, mobile ou desktop.

## Le problème

Un agent IA écrit du code plus vite que n'importe qui. Livré à lui-même, il invente les décisions qu'on ne lui a pas données, élargit le périmètre au passage, déclare fini ce qu'il n'a pas vérifié, et oublie d'une session à l'autre ce qui avait été tranché. Le résultat tient en démonstration et casse en production.

Maedow Flow ne rend pas l'agent plus intelligent. Il fixe l'ordre des choses : ce qui se décide avant de coder, ce qui se prouve avant de fusionner, et ce qui ne se fait jamais.

## Six principes

1. **Décider avant de construire.** Un choix coûteux à défaire (schéma de données, authentification, paiement, fournisseur, structure du code) s'écrit avant la première ligne. Le reste se décide en construisant.
2. **Une chose à la fois.** Un lot livre une capacité, et une seule. L'application grandit par tranches vérifiées, jamais d'un bloc.
3. **Prouver, pas affirmer.** « Les tests passent » ne veut pas dire « ça marche ». Fini veut dire constaté sur l'application qui tourne.
4. **Ce qui doit arriver est une machine.** Une règle sans exception devient un hook, une permission ou un contrôle de CI. Une consigne écrite n'est qu'un rappel, et un agent peut l'oublier.
5. **La complexité se mérite.** Pas de cache, de file d'attente ou de microservice sans le goulot mesuré qui les réclame. Pas de skill ni de sous-agent de projet avant que le projet en ait eu besoin.
6. **La mémoire est écrite.** Ce qu'il faut savoir d'une session à l'autre vit dans le dépôt (`AGENTS.md`, le scope, les specs), jamais dans la seule conversation.

## Les rôles

| Rôle | Titulaire | Responsabilité |
| :--- | :--- | :--- |
| Product owner | l'humain | Décide du produit, valide le scope et les specs, fusionne les pull requests. |
| Lead tech | l'agent en posture de cadrage (`/scope`, `/architect`, `/check review`) | Découpe, décide, relit. N'écrit pas le code applicatif. |
| Dev | l'agent en posture de construction (`/develop`, `/test`, `/debug`) | Exécute ce qui a été décidé, et rien d'autre. |

Les deux postures peuvent être tenues par la même session. Ce qui compte, c'est de savoir laquelle on occupe. Un désaccord de fond entre le cadrage et la construction remonte à l'humain, les deux positions résumées : personne ne tranche à sa place.

## Ce que Maedow Flow réunit

| Brique | Ce qu'elle apporte | Où la lire |
| :--- | :--- | :--- |
| Le cycle | Les phases, les portes à franchir et le palier d'exigence de chaque feature | [Cycle](cycle.md) |
| Les règles | Dix-sept règles codées `MF-001` à `MF-017`, chacune avec ce qui la fait respecter | [Règles](regles.md) |
| Le moteur | Les skills `/scope`, `/architect`, `/develop`, `/check`, `/test`, `/debug`, `/sync`, `/audit`, `/document` | [Claude Code](claude-code.md) |
| Le kit | `AGENTS.md`, garde-fous Claude Code, hooks git, CI GitHub, installés par `/flow` | [Démarrer](demarrer.md) |
| Les profils | Les stacks par défaut pour le web, le mobile et le desktop | [Plateformes](plateformes.md) |
| Les socles | La sécurité minimale et la montée en charge | [Sécurité](securite.md), [Échelle](echelle.md) |
| Les prompts | Les formulations éprouvées pour chaque moment du cycle | [Prompts](prompts.md) |

L'architecture du code relève d'un standard séparé, [Maedow Arch](https://maedow-arch-docs.vercel.app/llms.txt), pour les projets TypeScript. Maedow Flow dit comment on travaille ; Maedow Arch dit comment le code est rangé.

## Ce que Maedow Flow n'est pas

- **Un générateur d'application.** Il ne choisit pas la stack à ta place. Il fournit des défauts éprouvés que `/architect` discute projet par projet.
- **Un remplaçant des skills.** Les skills de [JavaScript-Mastery-Pro/skills](https://github.com/JavaScript-Mastery-Pro/skills) sont le moteur. Maedow Flow les ordonne, et comble ce qu'ils ne couvrent pas : les règles non négociables, les garde-fous mécaniques, les défauts de plateforme.
- **Un texte figé.** Une règle qui résiste à la réalité se corrige, et la correction prend une ligne au `CHANGELOG.md` qui dit pourquoi.

## Par où continuer

Une IA qui découvre ce workflow lit, dans l'ordre : [Démarrer](demarrer.md), [Cycle](cycle.md), [Règles](regles.md). Le reste se consulte au moment où il sert.

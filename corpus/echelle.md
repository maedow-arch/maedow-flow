# Échelle

La montée en charge se fait par étapes, et chaque étape répond à un goulot d'étranglement précis. On ne franchit une étape que lorsque la mesure l'exige ([MF-014](regles.md#mf-014--pas-de-brique-sans-goulot-mesuré)) : chaque ajout a un coût en complexité, en maintenance et en risque de données périmées.

## Ce qu'on mesure avant de décider

- Le temps de réponse au 95e centile (p95) des routes principales, pas la moyenne.
- Le taux d'erreurs.
- Les requêtes les plus lentes de la base, et leur plan d'exécution.
- Le nombre de connexions ouvertes vers la base.
- L'utilisation du processeur et de la mémoire de la base.

Sans ces chiffres, aucune des étapes suivantes n'a de justification. Les outils de l'hébergeur (Vercel, Supabase) et PostHog les fournissent sans rien installer de plus.

## Les étapes, dans l'ordre

| # | Étape | Le signal qui la déclenche | Ce qu'elle coûte |
| :--- | :--- | :--- | :--- |
| 0 | Un serveur (ou des fonctions serverless) et une base | le point de départ | rien : suffit pour des milliers d'utilisateurs |
| 1 | Index | une requête fréquente lit toute la table (le plan d'exécution le montre) | un peu d'espace, des écritures légèrement plus lentes |
| 2 | Pool de connexions (PgBouncer, Supavisor) | erreurs « too many connections », ou une connexion ouverte par invocation serverless | quasi nul ; **en serverless, dès le premier jour** |
| 3 | Cache (Redis, Upstash, cache HTTP ou CDN) | le même calcul coûteux se répète, les lectures dominent largement les écritures | l'invalidation, et le risque de servir une donnée périmée |
| 4 | Files d'attente et workers (Inngest, QStash) | une tâche de plus de quelques secondes bloque une requête : e-mails, rapports, appels d'IA | idempotence, reprises, suivi des échecs |
| 5 | Répliques de lecture | la base primaire sature en lecture malgré index et cache | le décalage de réplication : une donnée écrite peut ne pas être encore lisible |
| 6 | Répartition de charge et serveurs sans état | un seul serveur ne suffit plus (hébergement non serverless) | les sessions déménagent dans un stockage partagé ; déjà acquis en serverless |
| 7 | Partitionnement des données (sharding) | les données ne tiennent plus sur une seule machine | très élevé : requêtes transverses, migrations, rééquilibrage. Dernier recours |

## Trois erreurs classiques

- **Le cache avant l'index.** Un cache masque une requête lente au lieu de la réparer, et ajoute l'invalidation par-dessus.
- **Les microservices pour « préparer la croissance ».** Ils multiplient les déploiements, les pannes partielles et les appels réseau, pour un problème qu'on n'a pas encore.
- **Mesurer la moyenne.** Une moyenne de 100 ms peut cacher un utilisateur sur vingt qui attend trois secondes. Le p95 le montre.

## Dans le cycle

Une étape d'échelle est une feature comme une autre : elle entre dans le scope, elle a sa spec `/architect` qui cite la mesure, et elle suit la boucle. La mesure qui l'a justifiée devient son critère d'acceptation (« le p95 de la liste des commandes passe sous 300 ms »).

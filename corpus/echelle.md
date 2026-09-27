# Tenir la charge

Ce qu'il faut faire côté serveur pour que l'application ne tombe pas quand les requêtes affluent. La page distingue deux choses qu'on confond souvent :

- **les précautions du premier jour**, qui ne coûtent presque rien et valent pour tout projet, avant même le premier utilisateur ;
- **les étapes de montée en charge**, qui ajoutent chacune une brique d'infrastructure, et qu'on ne franchit que lorsque la mesure l'exige ([MF-014](regles.md#mf-014--pas-de-brique-sans-goulot-mesuré)) : chaque brique a un coût en complexité, en maintenance et en risque de données périmées.

Source des étapes : la feuille de route de la vidéo [*How Senior Engineers Actually Think About System Design & Architecture*](https://www.youtube.com/watch?v=EaXHfuHRWwg) (JavaScript Mastery). La vidéo range les étapes par thème (serveurs, base de données, cache, asynchrone, données). Cette page les range **par coût** : on commence par ce qui ne coûte presque rien (un index), et l'on garde pour plus tard ce qui coûte une machine et une refonte (un second serveur, un partitionnement).

## Dès le premier jour

Ces précautions ne sont pas des briques d'infrastructure. Elles ne coûtent presque rien, et ce sont elles qui évitent la panne le jour où le trafic arrive : MF-014 ne les concerne pas.

| Précaution | Ce qu'elle évite |
| :--- | :--- |
| Toute liste est paginée, toute requête est bornée (`LIMIT`) | une page qui marche avec 100 lignes et écroule la base à 100 000 |
| Chaque appel sortant (API tierce, IA, e-mail) a un délai d'expiration | un service tiers lent qui immobilise tous les serveurs pendant qu'ils attendent sa réponse |
| Limitation de débit sur la connexion, les formulaires publics et les appels coûteux | un robot, ou un seul client mal écrit, qui monopolise les ressources de tous ([Sécurité](securite.md#abus)) |
| Ce qui ne dépend pas de l'utilisateur part en cache HTTP (en-têtes `Cache-Control`, pages statiques) | une foule qui atteint le serveur alors que le CDN pouvait lui répondre |
| La base se joint par un pool de connexions (en serverless, l'URL du pooler) | l'épuisement des connexions au premier pic, voir l'étape 2 plus bas |
| L'application est sans état | une refonte le jour où il faut un second serveur, voir [Serverless ou serveurs à soi](#serverless-ou-serveurs-à-soi) |
| La panne d'un service tiers dégrade une section, pas la page entière | une page blanche causée par un encart secondaire |
| Un plafond de dépense sur chaque service facturé à l'usage | un pic de trafic transformé en pic de facture |

## Avant un pic annoncé

Un lancement, une campagne, un passage dans les médias : une charge qui arrive d'un coup se prépare.

1. **Tester la charge sur un aperçu, jamais sur la production.** Un outil comme k6, sur les trois ou quatre parcours critiques, à deux ou trois fois le trafic attendu. Relever le p95, le taux d'erreurs et les connexions à la base.
2. **Vérifier les limites des abonnements** : concurrence des fonctions chez l'hébergeur, connexions maximales de la base, quotas des API tierces (e-mail, IA, paiement). La première limite atteinte est souvent un quota, pas un serveur.
3. **Préparer la défense** : le pare-feu applicatif de l'hébergeur et ses règles de limitation de débit. Sur Vercel, le mode de défi contre les attaques s'active en un geste si des robots affluent.
4. **Savoir reculer** : le retour arrière d'un déploiement en un clic, et un interrupteur (feature flag) pour couper une fonctionnalité coûteuse sans redéployer.

## Ce qu'on mesure avant de décider

- Le temps de réponse au 95e centile (p95) des routes principales, pas la moyenne.
- Le taux d'erreurs.
- Les requêtes les plus lentes de la base, et leur plan d'exécution.
- Le nombre de connexions ouvertes vers la base.
- L'utilisation du processeur et de la mémoire de la base.

Sans ces chiffres, aucune des étapes suivantes n'a de justification. Les outils de l'hébergeur (Vercel, Supabase) et PostHog les fournissent sans rien installer de plus.

## Les étapes de montée en charge, dans l'ordre

| # | Étape | Le signal qui la déclenche | Ce qu'elle coûte |
| :--- | :--- | :--- | :--- |
| 0 | Un serveur (ou des fonctions serverless) et une base | le point de départ | rien : suffit pour des milliers d'utilisateurs |
| 1 | Index | une requête fréquente lit toute la table (le plan d'exécution le montre) | un peu d'espace, des écritures légèrement plus lentes |
| 2 | Pool de connexions (PgBouncer, Supavisor) | erreurs « too many connections », ou une connexion ouverte par invocation serverless | quasi nul ; **en serverless, dès le premier jour** |
| 3 | Cache (Redis, Upstash, cache HTTP ou CDN) | le même calcul coûteux se répète (un nombre d'abonnés recalculé à chaque affichage), les lectures dominent largement les écritures | l'invalidation, et le risque de servir une donnée périmée |
| 4 | Files d'attente et workers (Inngest, QStash) | une tâche de plus de quelques secondes bloque une requête : e-mails, rapports, appels d'IA | idempotence, reprises, suivi des échecs |
| 5 | Répliques de lecture | la base primaire sature en lecture malgré index et cache | le décalage de réplication : une donnée écrite peut ne pas être encore lisible |
| 6 | Répartition de charge (Nginx) et serveurs sans état | un seul serveur ne suffit plus | les sessions et tout état local déménagent dans un stockage partagé (Redis) ; déjà acquis en serverless |
| 7 | Partitionnement des données (sharding) | les données ne tiennent plus sur une seule machine | très élevé : clé de partition à choisir une fois pour toutes (`user_id`), requêtes transverses, migrations, rééquilibrage. Dernier recours |

## Serverless ou serveurs à soi

Le point de départ change ce qui est déjà fait pour toi.

| Étape | En serverless (Vercel, Supabase) | Sur tes propres serveurs (VPS, machine dédiée) |
| :--- | :--- | :--- |
| 2 · Pool de connexions | à brancher dès le premier jour : l'URL du pooler, jamais la connexion directe | PgBouncer devant Postgres quand les connexions saturent |
| 3 · Cache | Upstash, ou le cache de données et le CDN de l'hébergeur | Redis sur la machine, puis sur une machine à part |
| 4 · Files d'attente | Inngest ou QStash, rien à héberger | un worker à part (BullMQ sur Redis, par exemple), supervisé comme un service |
| 5 · Répliques | proposées par l'hébergeur de la base | réplication Postgres à configurer et à surveiller |
| 6 · Répartition de charge | déjà faite : chaque requête peut atterrir sur une instance différente | Nginx (ou l'équilibreur du fournisseur) devant plusieurs instances identiques |

Deux conséquences valent dès le premier jour, même avec un seul serveur :

- **Écrire l'application sans état.** Pas de session en mémoire, pas de fichier téléversé sur le disque local, pas de tâche planifiée qui suppose une instance unique. Une application sans état passe à l'étape 6 en ajoutant une machine ; une application avec état y passe par une refonte.
- **Sur tes propres serveurs, la production est aussi de l'exploitation** : HTTPS et son renouvellement, sauvegardes de la base testées par une vraie restauration, supervision et alertes, mises à jour de sécurité du système. Ces tâches arrivent avant la première mise en production, pas avec la croissance ; en serverless, l'hébergeur les porte.

## Trois erreurs classiques

- **Le cache avant l'index.** Un cache masque une requête lente au lieu de la réparer, et ajoute l'invalidation par-dessus.
- **Les microservices pour « préparer la croissance ».** Ils multiplient les déploiements, les pannes partielles et les appels réseau, pour un problème qu'on n'a pas encore.
- **Mesurer la moyenne.** Une moyenne de 100 ms peut cacher un utilisateur sur vingt qui attend trois secondes. Le p95 le montre.

## Dans le cycle

Une étape de montée en charge est une feature comme une autre : elle entre dans le scope, elle a sa spec `/architect` qui cite la mesure, et elle suit la boucle. La mesure qui l'a justifiée devient son critère d'acceptation (« le p95 de la liste des commandes passe sous 300 ms »).

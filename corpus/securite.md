# Sécurité

Le socle minimal, par domaine. Il ne remplace pas une revue de sécurité : il liste ce qu'un agent oublie par défaut, et que `/security-review` doit trouver fait avant chaque livraison.

Chaque ligne est vérifiable. Une case qu'on ne sait pas vérifier se coche « non vérifié », jamais « fait ».

## Secrets ([MF-006](regles.md#mf-006--les-secrets-restent-hors-de-portée))

- [ ] Seul `.env.example` est versionné, sans aucune valeur réelle.
- [ ] Aucun secret dans une variable publique (`NEXT_PUBLIC_`, `EXPO_PUBLIC_`, `VITE_`), ni dans un bundle mobile ou desktop.
- [ ] Les modules qui manipulent un secret sont marqués `server-only`.
- [ ] Le scan de secrets tourne en CI sur chaque pull request.
- [ ] Les clés de service (clé `service_role` de Supabase, clé secrète Stripe) ne quittent jamais le serveur.

## Entrées ([MF-007](regles.md#mf-007--ce-qui-entre-est-unknown))

- [ ] Chaque route, action serveur et webhook valide son entrée par un schéma avant tout usage.
- [ ] Aucune requête SQL construite par concaténation.
- [ ] Les fichiers téléversés sont contrôlés côté serveur : type réel, taille, nom réécrit.
- [ ] Le contenu fourni par un utilisateur est échappé à l'affichage ; aucun HTML brut injecté sans assainissement.

## Authentification

- [ ] Un fournisseur éprouvé (Supabase Auth, Better Auth), jamais un système fait maison.
- [ ] Cookies de session `HttpOnly`, `Secure`, `SameSite`.
- [ ] Les messages d'erreur de connexion ne disent pas si le compte existe.
- [ ] La réinitialisation de mot de passe expire et ne sert qu'une fois.

## Autorisation ([MF-008](regles.md#mf-008--lautorisation-se-vérifie-côté-serveur))

- [ ] Chaque accès protégé vérifie l'identité et le droit, côté serveur.
- [ ] Chaque ressource vérifie son propriétaire (`commande.clientId === session.userId`), pas seulement la connexion.
- [ ] RLS activée sur toutes les tables exposées, règles testées pour un utilisateur sans droit.
- [ ] Les routes d'administration refusent un utilisateur ordinaire, vérifié par un test.

## Paiement

- [ ] Prix et totaux calculés côté serveur depuis la base ; jamais reçus du client.
- [ ] Le stock est revalidé au moment de payer.
- [ ] Une commande n'est payée que sur un webhook dont la signature a été vérifiée. Arriver sur la page de succès ne prouve rien.
- [ ] Le webhook est idempotent : l'identifiant d'événement est enregistré, un second envoi ne produit aucun effet.
- [ ] Les cas d'échec et d'abandon laissent la commande dans un état cohérent.

## Abus

- [ ] Limitation de débit sur la connexion, l'inscription, les formulaires publics et tout appel coûteux (IA, envoi d'e-mails, génération de documents).
- [ ] Un plafond de dépense sur chaque service facturé à l'usage.
- [ ] Si le produit utilise un modèle d'IA : le contenu des utilisateurs est traité comme une donnée, jamais comme une instruction ; les outils accessibles au modèle sont limités au nécessaire.

La limitation de débit protège aussi la disponibilité. Le reste de ce qui empêche l'application de tomber sous un afflux de requêtes est dans [Tenir la charge](echelle.md#dès-le-premier-jour).

## En-têtes et navigateur (web)

- [ ] `Content-Security-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `frame-ancestors` ou `X-Frame-Options`.
- [ ] Les requêtes qui modifient un état sont protégées contre la falsification de requête (CSRF) : vérification d'origine ou jeton.
- [ ] CORS restreint aux origines connues.

## Données personnelles

- [ ] On ne collecte que ce qui sert.
- [ ] Aucune donnée personnelle ni aucun jeton dans les journaux.
- [ ] Un utilisateur peut supprimer son compte et ses données.

## Dépendances

- [ ] Le fichier de verrouillage est versionné.
- [ ] Dependabot ouvre les mises à jour ; la CI les juge.
- [ ] `npm audit` (ou l'équivalent) ne remonte aucune vulnérabilité haute ou critique sans décision écrite.

## Les outils

| Outil | Quand |
| :--- | :--- |
| `/security-review` | avant chaque pull request `develop` vers `main` |
| `/check review` | à chaque feature `Beta` ou `GA` |
| Scan de secrets en CI | chaque pull request |
| Avis de sécurité Supabase (`get_advisors`) | après chaque migration |
| CodeRabbit | en option avant une livraison ; constats triés avant correction |

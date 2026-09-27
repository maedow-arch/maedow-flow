# Plateformes

Trois profils, chacun avec une stack par défaut. Un défaut n'est pas une obligation : c'est le point de départ que `/architect` discute, et qu'il ne remplace qu'avec une raison écrite dans la spec. Sans défaut, chaque projet rouvre les mêmes débats ; avec un défaut imposé, on force une stack là où elle ne convient pas.

Chaque profil dit aussi **son degré de preuve**. Un défaut éprouvé en production n'a pas le même poids qu'un défaut recommandé mais jamais livré.

| Profil | Degré de preuve |
| :--- | :--- |
| Web | éprouvé sur plusieurs projets en production |
| Mobile | recommandé, à éprouver sur un premier projet |
| Desktop | recommandé, à éprouver sur un premier projet |

Dans tous les cas, les versions installées sont les versions courantes, vérifiées au moment de l'échafaudage ([MF-013](regles.md#mf-013--la-documentation-se-consulte-elle-ne-se-suppose-pas)). Ce document ne fige aucun numéro de version, parce qu'un numéro écrit ici serait périmé avant d'être lu.

## Web

| Couche | Défaut | Quand s'en écarter |
| :--- | :--- | :--- |
| Framework | Next.js (App Router), TypeScript strict | Vite et React pour une application sans SEO ni rendu serveur |
| Architecture | [Maedow Arch](https://maedow-arch-docs.vercel.app/llms.txt), mode Light puis Full quand le domaine prend du poids | jamais pour un projet TypeScript |
| Style | Tailwind CSS, primitives dans `components/ui/` | un design system existant imposé |
| Données et authentification | Supabase (Postgres, Auth, Storage, RLS) | Postgres et Drizzle quand le backend nous appartient, ou qu'un modèle d'accès complexe se tient mal en RLS |
| Validation | Zod aux frontières ([MF-007](regles.md#mf-007--ce-qui-entre-est-unknown)) | aucune raison courante |
| Tests | Vitest, Playwright avec axe pour les parcours et l'accessibilité | aucune raison courante |
| Hébergement | Vercel : un aperçu par pull request, la production depuis `main` | contrainte de souveraineté, de coût ou de réseau |

**Services, installés au moment où une feature en a besoin, pas avant** : Resend (e-mails), PostHog (analytique, erreurs, flags), Upstash (limitation de débit, cache), Inngest (tâches de fond), Stripe (paiement).

**Ce qui revient souvent** :

- `TypeScript strict` veut dire `strict`, `noUncheckedIndexedAccess` et `exactOptionalPropertyTypes`, dès le premier jour. Les activer plus tard coûte des centaines d'erreurs d'un coup.
- En serverless, la connexion à Postgres passe par l'URL du pooler dès le premier jour ([Échelle](echelle.md)).
- Un projet Vercel neuf protège ses déploiements derrière une connexion Vercel. Un agent qui vérifie un aperçu (`/check verify`, `curl`) reçoit alors une page de connexion, pas l'application. Site public : désactiver la protection. Application privée : utiliser le secret de contournement pour l'automatisation, rangé avec les autres secrets (MF-006).
- Lier le projet Vercel **sans** déploiement initial : le premier déploiement d'un projet neuf part en production, même depuis une branche de feature.
- Un module qui manipule un secret porte `import "server-only"` (MA-008) : l'importer côté client casse le build au lieu de fuiter.
- La qualité d'interface a ses propres skills (`impeccable`, `better-interface`) : ils s'invoquent pendant `/develop` sur le volet interface, pas à la place de lui.

## Mobile

| Couche | Défaut | Quand s'en écarter |
| :--- | :--- | :--- |
| Framework | Expo (React Native), Expo Router, TypeScript strict | besoin natif lourd que les modules Expo ne couvrent pas |
| Architecture | Maedow Arch : `core/` en TypeScript pur, partageable avec un projet web | jamais |
| Données et authentification | le même backend que le web (Supabase par défaut) | aucune raison courante |
| Tests | Jest avec `jest-expo` et React Native Testing Library ; Maestro pour les parcours | aucune raison courante |
| Build et distribution | EAS Build, EAS Submit, EAS Update pour les correctifs JavaScript | aucune raison courante |

**Ce qui revient souvent** :

- **Tout ce qui est embarqué dans l'application est public.** Une clé dans le bundle est une clé publiée ([MF-006](regles.md#mf-006--les-secrets-restent-hors-de-portée)). Les appels qui exigent un secret passent par le serveur.
- Une mise à jour à distance (EAS Update) ne change que le JavaScript. Tout changement natif (module, permission, configuration) exige un nouveau build et une nouvelle soumission : la `runtimeVersion` doit suivre, sinon l'application reçoit un code qu'elle ne sait pas exécuter.
- La validation des stores prend des jours. Une date de sortie se planifie avec cette marge.
- Permissions système, liens profonds et notifications se testent sur un appareil réel avant `GA`.

## Desktop

| Couche | Défaut | Quand s'en écarter |
| :--- | :--- | :--- |
| Framework | Tauri 2 : interface Vite, React et TypeScript, cœur Rust réduit au nécessaire | Electron quand le produit dépend de l'écosystème Node côté système ou de modules natifs Node |
| Architecture | Maedow Arch côté interface, commandes Rust fines côté système | aucune raison courante |
| Sécurité | capacités Tauri déclarées au plus juste : chaque fenêtre n'accède qu'à ce qu'elle utilise | aucune raison |
| Mises à jour | le plugin updater de Tauri, mises à jour signées | aucune raison |
| Tests | Vitest pour l'interface ; WebDriver (`tauri-driver`) pour les parcours, sur Windows et Linux | aucune raison courante |
| Build | GitHub Actions avec `tauri-action`, une cible par système | aucune raison courante |

**Ce qui revient souvent** :

- **La signature de code est un poste de coût et de délai** : certificat pour Windows, compte développeur et notarisation pour macOS. Sans elle, le système avertit l'utilisateur à l'installation. À prévoir dès le scope, pas la veille de la sortie.
- Avec Electron : `contextIsolation` activé, `nodeIntegration` désactivé, un script de préchargement minimal qui n'expose que des fonctions précises. Jamais le module `fs` entier.
- L'interface d'une application desktop reste du web : les règles [MF-007](regles.md#mf-007--ce-qui-entre-est-unknown) et [MF-008](regles.md#mf-008--lautorisation-se-vérifie-côté-serveur) valent entre l'interface et le cœur système, qui joue le rôle du serveur.

## Ce qui ne change pas d'un profil à l'autre

Le cycle, les règles, le flux git, la commande `verify`, la CI, le kit. Un projet mobile et un projet web se conduisent exactement de la même façon ; seuls l'échafaudage, les tests de parcours et la distribution diffèrent.

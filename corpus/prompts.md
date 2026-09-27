# Prompts

Les formulations qui ont fait leurs preuves, rangées par moment du [cycle](cycle.md). Elles ont trois points communs : elles disent ce qui est hors périmètre, elles demandent une preuve, et elles séparent le moment de trouver du moment de corriger.

Les skills du moteur portent déjà l'essentiel de ces consignes. Ces prompts servent quand on travaille sans skill, quand un skill ne couvre pas le cas, ou pour recadrer une session qui dérive.

## Explorer un projet

```text
Explore ce projet et explique l'architecture actuelle, les technologies, les
dossiers importants et la façon dont les pièces principales se connectent.
Ne modifie rien.
```

## Nettoyer AGENTS.md

```text
Relis AGENTS.md en le confrontant au projet réel. Garde uniquement ce qu'un agent
doit vraiment retenir d'une session à l'autre. Retire ce qui se lit directement
dans le dépôt. N'ajoute aucune consigne générique du type « écris du code propre ».
```

## Poser un design system depuis une référence

```text
Étudie <référence> comme source visuelle pour ce projet. Analyse la typographie,
les espacements, la mise en page, la navigation, les boutons, les bordures, les
couleurs et le comportement responsive, sans copier ses textes, ses images ni sa
marque. Puis implémente ces principes dans le projet : jetons de typographie, de
couleur et d'espacement, conteneurs, boutons, liens, et primitives responsives,
dans les fichiers de style appropriés. Explique brièvement les règles retenues et
les fichiers modifiés.
```

Le point important : l'agent doit **implémenter** le design system, pas décrire la référence.

## Planifier une décision structurante

En mode Plan (`/plan`), ou via `/architect` :

```text
Inspecte le projet et planifie <la capacité>.
Pour cette première version, on a seulement besoin de : <liste courte>.
Étudie d'abord comment le code existant <utilise ce qui est concerné> avant de décider.
Ne prévois pas : <ce qui viendra plus tard>.
Montre-moi :
- les changements de schéma et les migrations
- les fichiers qui changent
- les responsabilités côté serveur
- ce qui vient du client et ce qui ne doit jamais en venir
- comment on vérifiera l'implémentation, cas refusés compris
N'implémente rien.
```

## Simplifier un plan trop ambitieux

```text
C'est plus complexe que ce dont l'application a besoin aujourd'hui.
Garde <la partie utile> et retire <les briques en trop> ainsi que tout ce qui ne
sert pas l'application qu'on construit maintenant. Montre-moi le plan réduit.
```

## Consigner une convention approuvée

```text
Mets à jour AGENTS.md avec les conventions du plan qu'on vient d'approuver.
Reste court. N'ajoute rien que l'agent puisse découvrir facilement dans le code.
```

## Fournir un secret sans le montrer

```text
<Le service> est prêt et <NOM_DE_VARIABLE> est défini dans .env.local.
Utilise process.env.<NOM_DE_VARIABLE> là où c'est nécessaire, sans lire le
fichier d'environnement. Continue le plan approuvé.
```

## Implémenter un plan approuvé

```text
Implémente le plan approuvé, et seulement lui.
Ne fais pas confiance aux valeurs fournies par le client pour <prix, rôle, statut> :
relis-les depuis le serveur.
N'ajoute aucune fonctionnalité hors du plan. Lance les contrôles et vérifie le
comportement sur l'application quand tu as fini.
```

## Vérifier contre le plan

```text
Relis l'implémentation en la confrontant au plan approuvé. Dis-moi :
- ce qui a été fait correctement
- ce qui a été fait autrement
- ce qui manque encore
- les problèmes reproductibles
N'élargis pas le périmètre. Corrige uniquement ce qu'il faut pour que le plan
approuvé soit complet.
```

Puis lis le diff toi-même : `git diff`, ou `/diff`.

## Enquêtes parallèles

```text
Avant d'implémenter <la capacité>, enquête avec des sous-agents séparés :
- un sous-agent sur <le modèle de données actuel>
- un sous-agent sur <le parcours existant et ses motifs réutilisables>
- un sous-agent sur <la couverture de tests et la vérification actuelle>
Chacun rend : comportement actuel, fichiers concernés, risques, recommandation.
N'implémente rien. Rassemble leurs conclusions en une synthèse courte.
```

Utile seulement si les enquêtes sont réellement indépendantes.

## Relecture fraîche d'une feature

```text
Fais relire <la feature> par un sous-agent neuf, sans modifier le code.
Concentre la relecture sur : <données, autorisation, validation serveur,
régressions, vérifications manquantes>.
Classe les constats en Critique, Majeur, Mineur, et dis ce qui n'a pas pu être
vérifié. Ne change rien : rends la relecture d'abord.
```

## Vérifier un constat

```text
Confie ce constat à un sous-agent neuf. Vérifie s'il est réellement reproductible
avant de toucher au code. Rends :
- reproductible ou non
- les étapes exactes de reproduction
- les fichiers concernés
- la cause probable
Ne corrige rien.
```

## Corriger seulement ce qui est confirmé

```text
Corrige uniquement les problèmes confirmés de la relecture.
Ne refonds pas la feature et n'élargis pas son périmètre. Relance les
vérifications après les corrections et résume exactement ce qui a changé.
```

## Trier des constats externes

Pour CodeRabbit ou tout autre outil de revue :

```text
Confronte ces constats à l'implémentation réelle. Pour chaque constat important,
détermine s'il est pertinent et reproductible. Classe-les en :
- problèmes confirmés
- constats à vérifier plus avant
- faux positifs ou hors sujet
Ne change pas le code.
```

## Revue d'ensemble

Avant une livraison (phase 3), sur une session neuve :

```text
Relis l'application dans son ensemble : <les zones : parcours client,
authentification, autorisation, données, paiement, administration>.
Cherche :
- des fonctionnalités cassées
- des flux de données incohérents
- de la duplication inutile
- une validation serveur manquante
- des erreurs d'autorisation
- des données client crues à tort
- des conventions périmées dans AGENTS.md
- des vérifications manquantes
N'ajoute aucune fonctionnalité. Rends les constats d'abord.
```

## Vérifier un parcours complet

```text
Vérifie le parcours complet <client | administrateur> sur l'application qui tourne :
<étape 1>, <étape 2>, …, <résultat attendu>.
Vérifie aussi qu'un utilisateur <sans le droit> ne peut ni accéder aux routes
protégées ni déclencher les actions protégées.
Signale tout ce qui n'a pas pu être vérifié. N'ajoute aucune fonctionnalité.
```

## Resynchroniser le contexte

En fin de tranche, si `/sync` n'a pas tourné à chaque lot :

```text
Relis AGENTS.md en le confrontant au dépôt actuel. Garde uniquement les décisions
durables qu'un agent doit retenir. Retire ce qui est périmé. N'ajoute rien que le
code dise déjà.
```

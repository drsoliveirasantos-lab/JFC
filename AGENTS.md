# Consignes de travail — JFC Renovation

Ce dépôt doit être géré avec un workflow strict, traçable et stable. Ces consignes s’appliquent à tout le repository, sauf si un `AGENTS.md` plus spécifique existe dans un sous-dossier.

## Lecture obligatoire avant modification

Avant de modifier le site, lire dans cet ordre :

1. `SOURCE_OF_TRUTH.md`
2. `AGENTS.md`
3. `.github/copilot-instructions.md`
4. `docs/site-architecture.md`
5. `.github/pull_request_template.md` avant d’ouvrir une PR

Ne pas modifier en devinant. Identifier d’abord la source officielle, puis faire le plus petit changement sûr.

## Branches

- `main` = branche principale publiée.
- Pour un chantier important, créer une branche dédiée avant modification.
- Avant toute mise à jour importante de `main`, créer une branche de sauvegarde : `backup-main-YYYYMMDD`.

Ne pas supprimer de branche, fichier, workflow, asset, donnée générée ou sauvegarde historique sans validation explicite.

Workflow recommandé :

1. Créer une branche dédiée depuis `main`.
2. Corriger sur cette branche.
3. Ouvrir une PR draft vers `main`.
4. Laisser la CI s’exécuter.
5. Corriger jusqu’à ce que les checks soient verts.
6. Marquer la PR ready seulement quand elle est vérifiée.
7. Merger uniquement après validation explicite de l’utilisateur.

## Règle GitHub Actions — workflow consolidé

Ne pas lancer plusieurs workflows séparés pour tester la même correction.

Règle obligatoire :

- Utiliser le workflow principal `JFC site tests` pour la validation complète.
- Ajouter un job au workflow principal plutôt que créer un workflow parallèle.
- Ne pas créer de workflows debug permanents si le workflow principal couvre déjà le besoin.
- Ne pas déclencher plusieurs commits de test successifs avant que le run précédent ait livré ses résultats, sauf correction urgente d’un échec déjà diagnostiqué.
- Le `concurrency` doit éviter les annulations inutiles. Pour les runs de validation, préférer `cancel-in-progress: false`, sauf cas explicitement voulu.

Objectif : un commit important doit produire un seul run lisible avec tous les jobs nécessaires.

## Sources officielles JFC

Site statique :

- `index.html` = page d’accueil éditable.
- `services/index.html` = page services éditable.
- `realisations/index.html` = galerie éditable.
- `a-propos/index.html` = page parcours / confiance éditable.
- `contact/index.html` = page contact éditable.
- `devis/index.html` = page devis éditable.
- `style.css` = style global.
- `assets/mobile-fixes.css` = correctifs visuels/mobiles et composants partagés ajoutés après coup.
- `assets/photos/**` = photos réelles du portfolio.
- `assets/whatsapp-direct.js` = ouverture WhatsApp mobile directe avec fallback.

Build et validation :

- `package.json` = scripts npm officiels.
- `scripts/jfc-site-tests.js` = suite consolidée de tests JFC.
- `scripts/validate-repository-hygiene.js` = hygiène repository.
- `.github/workflows/site-tests.yml` = workflow principal de validation.
- `.github/workflows/deploy.yml` = workflow de build/deploy si présent.

## Hygiène repository

Ne pas introduire :

- archives `.zip`, `.rar`, `.7z`, `.tar`, `.tgz`, `.gz` dans le repo ;
- fichiers temporaires `tmp`, `temp`, `old`, `copy`, `backup`, `legacy`, `obsolete` sans justification ;
- workflows debug ponctuels laissés en place ;
- doublons de photos non triés ;
- assets ou pages non référencés qui peuvent être confondus avec la source officielle ;
- anciens onglets/pages supprimés de la navigation sans décision explicite.

Le validateur `scripts/validate-repository-hygiene.js` bloque les fichiers dangereux connus et signale les chemins suspects à réviser.

## Règles de contenu et positionnement

- Positionnement : artisan en rénovation intérieure, pas “homme à tout faire”.
- Ton : clair, rassurant, professionnel, orienté particuliers.
- Objectif du site : inspirer confiance rapidement, montrer les réalisations, faciliter l’appel / WhatsApp / devis.
- Photos : préférer les réalisations propres et lisibles. Ne pas forcer de faux avant/après si les paires ne sont pas fiables.
- Contact : conserver téléphone, WhatsApp, email et SIRET exacts.

## Qualité des corrections

Chaque correction doit être :

- ciblée ;
- réversible ;
- compatible mobile ;
- compatible desktop ;
- validée par le workflow principal ou par une justification claire si le test ne peut pas être lancé.

## Mise en production

Avant de considérer le changement prêt :

- le site build correctement ;
- les pages principales sont accessibles ;
- les images ne sont pas cassées ;
- la navigation mobile ne déborde pas ;
- téléphone et WhatsApp fonctionnent ;
- le workflow `JFC site tests` est vert ou l’exception est documentée ;
- l’utilisateur a validé le rendu si le changement est visuel.

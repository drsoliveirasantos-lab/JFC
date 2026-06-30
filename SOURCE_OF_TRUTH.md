# Source of truth — JFC Renovation

Ce fichier définit ce que les futurs contributeurs humains ou IA doivent considérer comme officiel.

## Lecture obligatoire

Avant tout changement, lire :

1. `SOURCE_OF_TRUTH.md`
2. `AGENTS.md`
3. `.github/copilot-instructions.md`
4. `docs/site-architecture.md`
5. `.github/pull_request_template.md` avant d’ouvrir une PR

## Branches

- `main` est la branche principale publiée.
- Pour un changement important, créer une branche courte dédiée.
- Avant toute mise à jour majeure de `main`, créer une sauvegarde `backup-main-YYYYMMDD`.
- Ouvrir une PR avant merge quand le changement n’est pas une micro-correction explicitement demandée.

## Sources éditables officielles

Pages :

```txt
index.html
services/index.html
realisations/index.html
a-propos/index.html
contact/index.html
devis/index.html
```

Styles et scripts :

```txt
style.css
assets/mobile-fixes.css
assets/whatsapp-direct.js
```

Assets :

```txt
assets/photos/**
assets/about-portrait.svg
```

Build et tests :

```txt
package.json
scripts/jfc-site-tests.js
scripts/validate-repository-hygiene.js
.github/workflows/site-tests.yml
.github/workflows/deploy.yml
```

## Sortie générée

```txt
dist/**
```

`dist/` est une sortie de build. Ne pas la traiter comme source officielle et ne pas l’éditer manuellement.

## Règles métier

- Nom affiché : `JFC Renovation` / `JFC Renovation Interieure`.
- Positionnement : artisan en rénovation intérieure.
- Éviter l’expression “homme à tout faire” dans le positionnement principal.
- Contact officiel : `06 07 72 16 33`.
- WhatsApp officiel : `https://wa.me/33607721633`.
- Email officiel : `jonatanfc97@gmail.com`.
- SIRET officiel : `93484902700016`.

## Règles visuelles

- Mobile d’abord.
- Pas d’overflow horizontal.
- Navigation claire : Services, Réalisations, À propos, Contact, Devis.
- Les photos doivent être lisibles, cliquables quand elles sont dans la galerie, et ne pas se superposer.
- Ne pas afficher de section avant/après si les paires ne sont pas fiables.
- Les CTA principaux sont : Appeler, WhatsApp, Demander un devis.

## Validation

Workflow principal :

```txt
.github/workflows/site-tests.yml
```

Scripts principaux :

```bash
npm run build
npm run test:site
node scripts/validate-repository-hygiene.js
```

Le workflow `JFC site tests` doit rester le workflow consolidé principal. Ajouter des jobs dedans plutôt que créer des workflows debug parallèles.

## Matériel interdit ou suspect

Ne pas conserver dans le repo :

- archives `.zip`, `.rar`, `.7z`, `.tar`, `.tgz`, `.gz` ;
- copies `old`, `copy`, `backup`, `legacy`, `obsolete`, `tmp`, `temp` non documentées ;
- workflows debug permanents ;
- vieux fichiers générés pouvant être confondus avec les sources ;
- anciennes pages retirées de la navigation sans documentation.

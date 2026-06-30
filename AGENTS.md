# Consignes IA — JFC

Ce dépôt doit suivre le standard commun Nykuto : workflow strict, sources claires, PR vérifiables et nettoyage régulier.

## Lecture obligatoire

Avant toute modification, lire dans cet ordre :

1. `SOURCE_OF_TRUTH.md`
2. `AGENTS.md`
3. `.github/copilot-instructions.md`
4. `docs/site-architecture.md`
5. `.github/pull_request_template.md` s'il existe

Ne pas modifier en devinant. Identifier d'abord la source officielle puis faire le plus petit changement sûr.

## Branches et PR

- `main` = branche principale.
- Créer une branche dédiée pour chaque changement.
- Ouvrir une PR avant de merger.
- Ne pas merger si les checks sont rouges ou en attente.
- Ne pas supprimer de fichiers, branches, workflows ou données sans validation explicite.

## Organisation attendue

- Code éditable : `src/`, fichiers HTML/CSS/JS racine, ou structure déclarée dans `SOURCE_OF_TRUTH.md`.
- Ressources publiques : `public/`, `assets/`, `images/`.
- Documentation : `docs/`.
- Workflows et consignes GitHub : `.github/`.
- Scripts de validation/maintenance : `scripts/`.

## Hygiène repository

Ne pas introduire d'archives, de copies temporaires, de backups non documentés, de workflows debug permanents ou de fichiers générés pouvant être confondus avec la source officielle.

## Validation

Pour un changement structurel, lancer ou laisser la CI lancer :

```bash
node scripts/validate-repository-hygiene.js
```

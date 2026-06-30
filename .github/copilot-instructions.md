# Repository instructions for AI assistants — JFC Renovation

Always treat this repository as a production-facing showcase site. The priority is stability, visual quality, mobile usability, and clear contact conversion.

Before editing, read:

1. `SOURCE_OF_TRUTH.md`
2. `AGENTS.md`
3. `docs/site-architecture.md`
4. `.github/pull_request_template.md` when preparing a PR

Core rules:

- Identify the source of truth before changing files.
- Do not manually edit generated output when an editable source exists.
- Keep changes small and focused.
- Prefer a dedicated branch and PR for important changes.
- Do not merge unless checks are green and the user validates the merge.
- Do not delete files, branches, workflows, generated data, photos, or backups without explicit validation.
- Do not introduce stale copies, archives, temporary dumps, duplicate assets, or debug workflows.
- Keep project documentation synchronized with structural changes.

Editable sources:

- `index.html`
- `services/index.html`
- `realisations/index.html`
- `a-propos/index.html`
- `contact/index.html`
- `devis/index.html`
- `style.css`
- `assets/mobile-fixes.css`
- `assets/whatsapp-direct.js`
- `assets/photos/**`
- `scripts/**`
- `.github/workflows/**`

Generated output:

- `dist/**`

Do not edit `dist/**` manually.

Validation:

- Prefer the permanent workflow `JFC site tests`.
- Keep validators strict for broken images, missing pages, stale files, horizontal overflow, contact links, WhatsApp behavior, and navigation regressions.
- If a validator fails, fix the cause before merging.

Business/content style:

- Use clear French.
- Position JFC as an artisan in interior renovation.
- Avoid “homme à tout faire” as the main positioning.
- Keep the tone trustworthy, direct, and professional.
- Prioritize mobile clarity, visible realizations, and easy contact.
- Do not invent false before/after pairs; use only reliable portfolio material.

# Site architecture

This repository follows the shared Nykuto site standard.

## Layers

1. Editable sources: files humans and AI normally edit.
2. Public assets: images, icons, fonts, and static media.
3. Validation scripts: checks for repository hygiene and structure.
4. Documentation: rules that explain how to work safely.

## Expected folders

```txt
.github/   GitHub workflows and AI instructions
docs/      project documentation
scripts/   validation and maintenance scripts
assets/    images and public resources when used
public/    public static files when used
src/       source code when used
```

A repository does not need all folders, but when they exist their role should stay clear.

## AI workflow

Before editing:

1. Read `SOURCE_OF_TRUTH.md`.
2. Read `AGENTS.md`.
3. Read `.github/copilot-instructions.md`.
4. Identify whether the target file is source, generated output, documentation, workflow, or asset.

Before merging:

1. Confirm the change is narrow.
2. Confirm checks are green.
3. Confirm the user approved the merge.

## Hygiene

Run:

```bash
node scripts/validate-repository-hygiene.js
```

The validator blocks known dangerous stale files and reports suspicious temporary or backup-style paths for review.

# Contributing

Thanks for helping improve the Tamil Government Letter Generator.

## Getting started

1. Fork the repository and create a branch from `main`.
2. Follow the setup steps in the [README](README.md) to run the app against your own Supabase project.
3. Make your change, keeping it focused on one thing.

## Before opening a pull request

```bash
npm run typecheck
npm test
npm run build
```

All three must pass. Add or update tests in `tests/` for any change to transliteration, dictation, punctuation, template or AI-validation logic.

## Good first contributions

- New Tanglish → Tamil transliteration entries in `src/lib/transliteration/tamil.ts`
- Additional starter templates in `src/lib/templates/defaults.ts`
- New letter formats or layout fixes for the A4 print preview
- Corrections to Tamil office terminology in the AI prompts

## Guidelines

- Never commit real letters, names, file numbers or other personal or official data. Use clearly fictional sample values.
- Never commit keys or `.env` files. Configuration belongs in `.env.local`, which is ignored.
- Database changes go in a new file under `supabase/migrations/`, and `supabase/schema.sql` must be updated to match.

## Reporting issues

Open a GitHub issue describing the problem, the steps to reproduce it and, for layout problems, a screenshot of the print preview.

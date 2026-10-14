# Tamil Government Letter Generator (தமிழ் அரசு கடிதம்)

An open-source web app for drafting formal Tamil Nadu government letters and printing them on A4 in the standard office layout. Staff fill in structured fields; the app handles the format, the Tamil script and the paperwork around it.

> Built without hand-writing code: the whole app was produced by directing AI coding agents (Claude Code and Codex) in plain language, with the author acting as product owner, domain expert and tester. The story is on Medium: [I Built a Tamil Government Letter Generator Without Writing a Single Line of Code](https://medium.com/@gokulkumar.jayaram/i-built-a-tamil-government-letter-generator-without-writing-a-single-line-of-code-e8767323c07f).

## Features

- **Four document types:** standard government letter, financial sanction, receipt and proceedings order, each with a validated, print-ready A4 preview.
- **Tanglish → தமிழ்:** offline, deterministic transliteration of romanised Tamil, with no external calls.
- **Optional AI assistance:** English → Tamil translation, formal government-office Tamil, grammar correction, shorten and expand. Every suggestion opens in a comparison panel and changes nothing until you accept it. Names, dates, amounts, reference numbers and `{{template_variables}}` are checked and flagged if they go missing.
- **Voice dictation** in Tamil, with a spelling-correction pass for common office vocabulary.
- **Templates** with `{{variables}}`, plus two starter templates (tax invoice forwarding and leave request).
- **Autosave** to the cloud, with a per-letter offline fallback when the network drops.
- **Letter history** with search, duplicate and delete.
- **Per-user data isolation** through Supabase authentication and Postgres Row Level Security.

## Tech stack

Next.js 15 · React 19 · TypeScript · Supabase (Auth + Postgres with RLS) · OpenAI APIs (optional, server-side only) · deployable to any Node host (for example, Netlify or Vercel).

## Database installation and upgrades

For a new production installation, run [`supabase/schema.sql`](supabase/schema.sql) once in the Supabase SQL Editor. It is the canonical complete schema and includes:

- Settings and defaults
- Letters and all three document types
- Bold-header and font-size options
- Templates
- Updated-time triggers and indexes
- Row Level Security policies

The main schema is idempotent and can also be rerun safely against an existing project. It does not delete letters, settings, templates, users, or authentication data.

The files under `supabase/migrations/` remain available when only one incremental production change should be applied.

## Prerequisites

- Node.js 20 or newer
- A Supabase project
- One Supabase Auth user (create it in **Authentication → Users → Add user**)

## Supabase setup

1. Open the Supabase project **SQL Editor**.
2. Run the complete contents of [`supabase/schema.sql`](supabase/schema.sql).
3. In **Project Settings → API**, copy the project URL and the publishable key (the legacy `anon` key also works).
4. Copy `.env.example` to `.env.local` and fill in:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_PUBLISHABLE_OR_ANON_KEY
   ```

No service-role key is needed or used by this application.

## Optional content generation

AI text actions are optional and run only after the user explicitly clicks an action. Add these server-only values to `.env.local` or `.env`:

```env
OPENAI_API_KEY=YOUR_OPENAI_API_KEY
OPENAI_TEXT_MODEL=gpt-5-mini
OPENAI_TRANSCRIPTION_MODEL=gpt-4o-transcribe
OPENAI_SPELLCHECK_MODEL=gpt-5-mini
```

If `OPENAI_API_KEY` is absent, editing, autosave, templates, history, settings, printing, and local Tanglish-to-Tamil transliteration continue working. The key is never exposed through a `NEXT_PUBLIC_` variable.

Editor actions are intentionally separate:

- **Tanglish → தமிழ்:** offline deterministic transliteration; no OpenAI request.
- **English → தமிழ்:** direct translation without automatic formalization.
- **Formal Tamil:** concise Tamil government-office rewriting.
- **Grammar / Shorten / Expand:** focused body transformations.

Every action opens a comparison panel. The original field changes only after **Accept**. Identifiers, dates, amounts, reference numbers, and `{{template_variables}}` are checked before acceptance, and missing values produce a warning.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000` and sign in with the user created in Supabase Auth.

## Verification

```bash
npm run typecheck
npm test
npm run build
```

## Feature checks

1. **Authentication:** open `/letters` while signed out and confirm redirect to `/login`; sign in, then use **வெளியேறு** and confirm protected routes redirect again.
2. **Settings:** save department, sender, recipient, salutation, and signature defaults at `/settings`; create a new letter and confirm those values are prefilled.
3. **Cloud editor:** edit a letter and wait about 1.5 seconds for **கிளவுடில் சேமிக்கப்பட்டது ✓**; refresh and confirm the edits remain.
4. **Offline fallback:** disable the network, edit a field, and confirm **உள்ளூரில் சேமிக்கப்பட்டது — கிளவுட் கிடைக்கவில்லை**; re-enable the network, make another edit, and confirm cloud saving resumes.
5. **History:** verify `/letters` shows date, file number, recipient, subject, status, and updated time; test search, Open, Duplicate, and Delete.
6. **Isolation/RLS:** sign in as a second test user, if available, and confirm the first user's settings and letters cannot be read or changed.
7. **Print:** open a letter and print/save as PDF using A4, 100% scale, headers/footers off; compare against the validated baseline.
8. **Starter templates:** open `/templates` and confirm the Tax Invoice and Leave Request starter templates appear once; refresh and sign in again to confirm no duplicates.
9. **Use template:** choose **பயன்படுத்தவும்**, enter variable values, create the letter, and confirm it opens in the normal editor while the source template remains unchanged.
10. **Save as template:** from a letter editor or history row choose **வார்ப்புருவாக சேமி**, supply only a name and optional category, then confirm it appears in `/templates`.

## Notes

- Registration is intentionally not exposed in the UI.
- Local drafts are stored by letter UUID, so multiple cloud letters do not overwrite each other's offline fallback.
- The Supabase public key is safe to expose; data access is enforced by authentication and Row Level Security.

## Contributing

Contributions are welcome, especially new letter formats, transliteration rules and Tamil office vocabulary. See [CONTRIBUTING.md](CONTRIBUTING.md).

## Disclaimer

This is an independent community project. It is not an official product of, or endorsed by, the Government of Tamil Nadu or any department. Always review generated letters before sending them.

## License

[MIT](LICENSE) © 2026 Gokul Kumar Jayaram

# Matherechner Next.js Migration

This folder is a safe Next.js migration copy. The existing live/static site in the repository root is not replaced.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Current migration approach

- Next.js App Router is installed in this folder.
- Current production HTML pages are copied into `content/` and served by route handlers.
- Static assets are copied into `public/`.
- URLs are preserved: `/`, `/prozentrechner/`, `/blog/`, `/kontakt/`, `/ueber-uns/`, `/datenschutz/`, `/impressum/`, `/nutzungsbedingungen/`.
- This keeps visual design and calculators stable for the first migration pass.

## Next recommended step

After visual approval, convert shared header/footer/calculators into React components page-by-page. That gives cleaner Next.js metadata management while keeping rollback safe.
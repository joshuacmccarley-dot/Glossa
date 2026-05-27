# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Glossa is a language learning website. The application lives in the `glossa-app/` subdirectory — all commands below should be run from there.

## Tech Stack

- **Next.js 16.2.5** with the App Router (not Pages Router)
- **React 19**, TypeScript 5, Tailwind CSS v4
- **No database** — persisted state uses flat JSON files in `glossa-app/data/`

## Commands

All commands run from `glossa-app/`:

```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Production build
npm run lint     # ESLint (eslint-config-next core-web-vitals + typescript)
```

There is no test runner configured yet.

## Architecture

### Next.js App Router

Routes live under `glossa-app/app/`, each with a `page.tsx`. Current routes: `/`, `/learn`, `/connect`, `/how-it-works`, `/pricing`, `/roadmap`, `/get-started`.

The global shell (`Nav` + `Footer`) is composed in `app/layout.tsx`. Fonts are Inter (body, via `--font-inter`) and Plus Jakarta Sans (headings 600–800, via `--font-plus-jakarta`).

The module alias `@/` resolves to `glossa-app/` root (defined in `tsconfig.json`).

### Server / Client component pattern

Pages that need interactivity split into a Server Component file (`page.tsx`) and a Client Component file (`*Client.tsx` in the same directory). The server component fetches initial data (e.g., reads a JSON file), then passes it as props to the client component which handles UI state and API calls.

Example: `app/roadmap/page.tsx` reads `data/roadmap-state.json` server-side and renders `<RoadmapClient initialChecked={...} />`.

### Data layer

Static content is typed TypeScript files in `glossa-app/data/` (e.g., `checklist.ts` exports structured roadmap items). Mutable state is written to `data/roadmap-state.json` at runtime via API routes.

API routes live under `app/api/` and use the Next.js Route Handlers pattern (`route.ts` exporting `GET`, `POST`, etc.). The roadmap route (`app/api/roadmap/route.ts`) reads/writes `data/roadmap-state.json` using Node's `fs.promises`.

### ⚠️ Next.js version warning

Next.js 16 has breaking changes from versions you may know (13/14/15). Before writing any Next.js-specific code, check `node_modules/next/dist/docs/` for current APIs — do not rely on training-data knowledge of Next.js conventions.

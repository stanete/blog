# CLAUDE.md

## Project Overview

Astro Nano — a minimal, lightweight static blog and portfolio site built with Astro. No frontend framework dependencies (no React/Vue/Svelte). MIT licensed.

## Commands

```bash
npm run dev              # Start dev server (localhost:4321)
npm run build            # Type-check (astro check) + build to ./dist/
npm run preview          # Preview production build locally
npm run lint             # Run ESLint
npm run lint:fix         # Auto-fix ESLint issues
```

Package manager: **pnpm** (see `pnpm-lock.yaml`).

## Tech Stack

- **Astro 5** — static site generator with file-based routing
- **TypeScript** (strict mode) — path alias `@*` → `./src/*`
- **Tailwind CSS 3** — utility-first styling, class-based dark mode (`dark:` prefix)
- **MDX** — markdown with component support for content
- **Sharp** — image optimization

## Project Structure

- `src/pages/` — routes (index, blog, work, projects, rss.xml, robots.txt)
- `src/components/` — Astro components (`.astro` files only)
- `src/layouts/` — `PageLayout.astro` wraps all pages
- `src/content/` — content collections (blog/, projects/, work/) with Zod schemas in `config.ts`
- `src/consts.ts` — site configuration (name, email, social links, item counts)
- `src/types.ts` — TypeScript types
- `src/lib/utils.ts` — utilities (date formatting, reading time, classname merging)
- `src/styles/global.css` — Tailwind directives and global styles
- `public/` — static assets (favicons, images, fonts)

## Code Conventions

- **ESLint**: double quotes, semicolons required
- All components are `.astro` files — no framework components
- Tailwind utilities for all styling; prose styling via `@tailwindcss/typography`
- Content posts use frontmatter with Zod-validated schemas (title, description, date, optional draft)
- Dynamic routes use `[...slug].astro` pattern
- Draft posts are filtered out in production builds

## Content Schemas

- **Blog**: title, description, date, draft?
- **Projects**: title, description, date, draft?, demoURL?, repoURL?
- **Work**: company, role, dateStart, dateEnd

## No Test Suite

There is no test runner configured. Code quality is enforced via ESLint and `astro check` (run as part of `npm run build`).

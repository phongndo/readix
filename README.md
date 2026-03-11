# Readix

Readix is a SvelteKit reading platform with a minimal UI, Clerk auth, and Convex-backed sync for books, progress, highlights, and search.

## Stack

- Bun runtime and package manager
- SvelteKit 5
- Convex
- Clerk via `svelte-clerk`
- Tailwind CSS v4
- Vitest and Playwright

## Setup

1. Install dependencies with `bun install`.
2. Copy `.env.example` to `.env` and set:
   - `CLERK_SECRET_KEY`
   - `PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `PUBLIC_CLERK_SIGN_IN_URL`
   - `PUBLIC_CONVEX_URL`
   - `CONVEX_DEPLOY_KEY`
3. Start Convex locally if you need backend development with `bun run convex:dev`.

## Commands

```sh
bun run dev
bun run build
bun run preview

bun run check
bun run lint
bun run format

bun run test:unit -- --run
bun run test:e2e
bun run test
```

## Notes

- The app assumes Bun for local development and CI commands.
- Clerk sign-in redirects are configured through `PUBLIC_CLERK_SIGN_IN_URL`.
- PDF uploads extract cover thumbnails and page metadata client-side before upload.

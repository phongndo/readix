# AGENTS.md - Readix Coding Guidelines

Reading platform with Duolingo-style gamification. Minimal, zen UI. No gradients.

## Stack

- **Runtime**: Bun only
- **Framework**: SvelteKit 5 (runes: `$props`, `$bindable`)
- **DB**: PostgreSQL (Neon) with Drizzle ORM
- **Auth**: Clerk via `svelte-clerk`
- **Styling**: Tailwind CSS v4, shadcn-svelte components
- **Error Handling**: Effect library for functional error management
- **Package Manager**: Bun (bun.lock present)

## Build/Lint/Test Commands

```bash
# Development
bun run dev              # Start dev server
bun run build            # Production build
bun run preview          # Preview production build

# Code Quality
bun run lint             # Prettier check + ESLint
bun run format           # Prettier write
bun run check            # TypeScript + Svelte check
bun run check:watch      # Watch mode

# Testing
bun run test:unit        # Run all Vitest tests
bun run test             # Unit + E2E tests
bun run test:e2e         # Playwright tests only

# Run single test file
bun vitest run src/lib/utils.spec.ts
bun vitest run src/routes/page.svelte.spec.ts

# Run tests by pattern
bun vitest run --reporter=verbose src/lib/features/reader

# Database (Drizzle)
bun run db:push          # Push schema changes
bun run db:generate      # Generate migrations
bun run db:migrate       # Run migrations
bun run db:studio        # Drizzle Studio GUI
```

## Code Style

### Formatting

- **Use tabs** (not spaces) - enforced
- Single quotes, no trailing commas
- Print width: 100
- Plugins: `prettier-plugin-tailwindcss`, `prettier-plugin-svelte`

### Imports

- Use `$lib/` alias for all lib imports
- Group imports: external → internal → types
- Named exports preferred (no `index.ts` unless required)
- Import ordering enforced by ESLint

### Naming

- **Files**: kebab-case for routes, PascalCase for components
- **Functions**: verb-first (`calculateProgress`, `fetchBooks`)
- **Types**: PascalCase with descriptive names
- No `utils.ts`, `helpers.ts`, or `misc.ts` - use descriptive names

### Types

- Strict TypeScript enabled
- No `any` without eslint-disable comment
- Framework-agnostic types in `lib/domain/`
- API types in `lib/types/`

### Error Handling

- Use Effect library for async/error flows
- Server-side Effect runtime in `lib/server/effect/`
- No bare `try/catch` in domain logic

## Architecture Rules

### Mental Model

```
routes/     = wiring (thin, boring)
features/   = product (vertical slices)
domain/     = truth (framework-agnostic)
components/ = atoms (dumb UI)
services/   = side effects
stores/     = state with discipline
```

### Critical Rules

1. **Routes are thin** (< 40 lines)
   - Orchestrate only, no computation
   - Delegate to features/services

2. **Domain logic lives outside routes**
   - If reusable in another app, it belongs in `lib/`

3. **Files do one thing**
   - If a file needs a comment explaining why it exists, split it

4. **Names over comments**
   - `parseReadingProgress.ts` > `utils.ts` + comment

5. **Predictable > clever**
   - New contributors should guess correctly where code lives

### Folder Structure

```
src/
├─ routes/                 # URL = filesystem (thin)
│  ├─ +layout.svelte
│  ├─ +page.svelte
│  └─ library/
│     └─ +page.svelte
│
├─ lib/
│  ├─ components/          # Dumb, reusable UI
│  │  └─ ui/button/
│  ├─ features/            # Vertical slices
│  │  └─ reader/
│  │     ├─ ReaderView.svelte
│  │     ├─ reader.logic.ts
│  │     └─ reader.types.ts
│  ├─ domain/              # Pure business logic
│  │  └─ book/
│  │     ├─ Book.ts
│  │     └─ bookRules.ts
│  ├─ services/            # Side effects (fetch, storage)
│  ├─ stores/              # State management
│  ├─ utils/               # Sharp knives only (no business logic)
│  ├─ types/               # Shared types
│  └─ config/              # Configuration
│
└─ hooks.server.ts         # Clerk auth setup
```

### Component Rules

**Dumb Components** (`lib/components/`):

- Props in, events out
- No `fetch`, no stores, no business logic
- If it knows what a "book" is, it belongs in features

**Feature Components** (`lib/features/*/`):

- Own their UI, logic, and types
- No cross-feature imports unless explicitly shared
- Deleting a feature folder should not break the build

**Domain** (`lib/domain/`):

- No Svelte imports, no fetch, no browser APIs
- Survives framework rewrites

**Services** (`lib/services/`):

- Fetching, persistence, browser APIs
- Accept dependencies as parameters
- No UI logic

### Component Architecture (Google-Style)

Strict atomic design with explicit hierarchy:

```
src/lib/components/
├── atoms/              # Single-element primitives
│   ├── button/
│   ├── input/
│   ├── label/
│   ├── icon/
│   └── text/
├── molecules/          # 2-3 atoms combined
│   ├── form-field/     # label + input + error
│   ├── search-bar/     # input + button + icon
│   └── stat-item/      # icon + number + label
├── organisms/          # Complex UI sections
│   ├── book-card/
│   ├── contribution-calendar/
│   └── stats-grid/
└── templates/          # Page layouts
    └── dashboard-layout/
```

**Rules:**

1. **One component per file**
   - No multiple exports from a single `.svelte` file
   - No `index.ts` barrel files

2. **Max 3 levels deep**
   - ✅ `atoms/button/button-primary.svelte`
   - ❌ `atoms/button/primary/large/outline.svelte`

3. **Strict separation of concerns**
   - **Atoms:** No business logic, no domain knowledge, props only
   - **Molecules:** Combine atoms, layout only, no data fetching
   - **Organisms:** May accept domain types as props, no stores
   - **Templates:** Layout shells, slot-based
   - **Features:** Own state, data fetching, business logic

4. **Props as public API**
   - Document all props with JSDoc
   - No hidden behavior based on context
   - Props interface named: `ComponentNameProps`

5. **File naming**
   - Folder: kebab-case (`form-field/`)
   - File: matches folder name (`form-field.svelte`)
   - Variants: descriptive suffix (`button-ghost.svelte`)

6. **No cross-contamination**
   - Atoms don't import from molecules, organisms, or features
   - Molecules only import atoms
   - Organisms import atoms and molecules
   - Features import from all component levels

## Testing

### Test Types

- **Client**: Browser tests for Svelte components (`*.svelte.{test,spec}.ts`)
- **Server**: Node environment for logic/tests
- **E2E**: Playwright in `e2e/` directory

### Test Commands by Type

```bash
# Component tests (browser)
bun vitest run src/routes/page.svelte.spec.ts

# Unit tests (server/Node)
bun vitest run src/demo.spec.ts

# E2E tests
bun run test:e2e
bun playwright test e2e/demo.test.ts
```

### Test Patterns

- Vitest browser uses `vitest-browser-svelte` for component rendering
- Page objects for E2E selectors
- Test files co-located with source (or in `e2e/` for Playwright)

## UI/UX Guidelines

- **Minimal**: No gradients, no clutter
- **Zen aesthetic**: Clean, clear, spacious
- **Focus on reading experience**: Speed and functionality first
- Use Tailwind v4 classes with `@tailwindcss/vite`
- shadcn-svelte components in `lib/components/ui/`

## Database

- Drizzle ORM with PostgreSQL
- Schema in `lib/server/db/schema.ts`
- Never expose raw SQL in routes
- Use Effect for transaction handling

## Environment

Required variables:

- `DATABASE_URL` - PostgreSQL connection
- `CLERK_SECRET_KEY` - Auth (server)
- `PUBLIC_CLERK_PUBLISHABLE_KEY` - Auth (client)

See `.env.example` for full list.

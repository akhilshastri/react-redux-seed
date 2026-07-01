# Contributing

## Dependency direction (the one architectural rule)

```
app  →  features  →  shared  →  domain
```

- `domain` depends on nothing (models + Zod schemas).
- `shared` never imports from `features`.
- A `feature` never imports another feature's internals — only its public `index.ts`.
- `app` is the composition root; it may import anything below it.

**The one sanctioned upward import:** any layer may import the typed Redux hooks
(`useAppSelector`, `useAppDispatch`) and `RootState`/`AppDispatch` types from `app/store`, because
the store is the app's single runtime singleton. Slice _logic_ (`createSlice` reducers/actions)
still flows downward — slices import nothing from `app/`.

This is enforced by convention + review (not a lint rule yet). Where does a type go? If a second
feature could need it, it belongs in `domain/`; if it only describes one feature's local UI state,
keep it in that feature.

## Add a feature

```bash
npm run gen feature invoice
```

Then follow the printed next-steps:

1. Register the reducer in `src/app/store/root-reducer.ts` (key **must** equal the slice `name`).
2. Add a route in `src/app/router/routes.tsx`.

The MSW handler auto-wires via `import.meta.glob` — no shared-file edit needed. Keep **server state
in TanStack Query** and **client/UI state in the slice**; never mirror server data into Redux.

## Quality gates (pre-commit)

Husky runs on every commit:

- **lint-staged** — ESLint `--fix` + Prettier on staged files.
- **typecheck** — `tsc -b` across the project.
- **commitlint** — Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `test:`…).

Before opening a PR, also run `npm test` and (for UI changes) `npm run e2e`.

## Conventions

- Function expressions over declarations; small, single-purpose components.
- Prettier + `prettier-plugin-tailwindcss` orders Tailwind classes — don't fight it.
- New UI primitives follow the shadcn style already in `src/shared/ui`.

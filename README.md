# React Redux Seed

An enterprise-grade React SPA seed: **Vite 8 + React 19 (React Compiler) + TypeScript 6**,
**Redux Toolkit** (client state), **TanStack Query** (server state), React Router v8 (data mode),
React Hook Form + Zod (forms), shadcn/ui (Tailwind v4), and **MSW** as the mock backend.

> Build plan: [`plan/01-enterprise-app-plan.md`](plan/01-enterprise-app-plan.md)

## Quick start

```bash
npm install
cp .env.example .env   # optional — sensible defaults are baked in
npm run dev
```

## Scripts

| Script              | What it does                               |
| ------------------- | ------------------------------------------ |
| `npm run dev`       | Start the Vite dev server                  |
| `npm run build`     | Typecheck (`tsc -b`) then build to `dist/` |
| `npm run preview`   | Preview the production build               |
| `npm run lint`      | ESLint (flat config)                       |
| `npm run format`    | Prettier write                             |
| `npm run typecheck` | Typecheck without emit                     |

## Status

Under construction — see the phased plan. Phase 0 (baseline) first.

# 0007 — React Compiler enabled

**Status:** Accepted

## Context

React 19 ships the React Compiler, which auto-memoizes components. `@vitejs/plugin-react` v6 no
longer runs Babel internally, so the compiler must run as a separate Babel pass.

## Decision

Enable the compiler via `@rolldown/plugin-babel`, ordered **`react()` first, then the Babel pass**:

```ts
plugins: [react(), babel({ presets: [reactCompilerPreset()] }), tailwindcss()]
```

Its lint rules ship in `eslint-plugin-react-hooks` (flat `recommended-latest`).

## Consequences

- Confirmed active: transformed output carries the `_c(...)` memo cache.
- Some hooks-heavy libraries are **incompatible** and the compiler bails by design — `useReactTable`
  and `useVirtualizer` are surfaced by the `react-hooks/incompatible-library` rule and suppressed
  with an explanatory `eslint-disable`. Those libraries memoize themselves.
- The compiler is an _optimization_, not a feature. **Escape hatch:** if the Babel pass ever breaks
  the build/HMR, drop the `babel()` line — the app is identical, just unmemoized.

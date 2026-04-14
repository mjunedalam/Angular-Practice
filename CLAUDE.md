# Project Context

## Tech Stack

- Angular 19 (standalone components, OnPush)
- TypeScript (strict mode)
- Angular Signals (`@angular/core`)
- NgRx Signals Store (`@ngrx/signals`)
- Angular Material UI
- D3.js (selection, scale, transition, ease)
- AG Grid (enterprise tables)
- SCSS (CSS variables, no Tailwind)
- Jest (jest-preset-angular)

---

## Strict Rules (Token Efficiency)

- Do NOT explain basic Angular concepts
- Do NOT provide multiple approaches unless asked
- Do NOT generate unnecessary boilerplate
- Do NOT create new files unless required
- Prefer modifying existing code
- Do NOT repeat context already provided
- Keep responses concise and implementation-focused

---

## Response Style

- Prefer code over explanation
- Use bullet points, not long paragraphs
- Only explain non-obvious logic
- Avoid repetition and verbosity

---

## File Navigation Rules

- Reuse existing structure:
  - `core/` → global stores/services
  - `features/` → lazy-loaded pages
  - `shared/` → reusable components/models
  - `utils/` → pure helpers

- Always search before creating:
  - components
  - services
  - models

- Do NOT duplicate logic or interfaces

---

## Models

- Prefer models from `src/app/core/models`
- Reuse existing interfaces
- Avoid redefining types across:
  - `models/`
  - `shared/models/`
  - root `models/`

---

## Architecture

- Standalone components only
- Always use `ChangeDetectionStrategy.OnPush`
- Prefer Signals over RxJS
- State managed via NgRx Signals Store
- Mutations ONLY via `patchState()`
- Keep components lean; move logic to stores/services

---

## State Management (NgRx Signals Store)

- Use `signalStore()` with:
  - `withState`
  - `withComputed`
  - `withMethods`
  - `withHooks`

- No direct state mutation
- Use selectors via `withComputed()`
- Async logic inside store methods

---

## Component Rules

- Inject stores via `inject()`
- Use signals directly in templates
- Avoid manual subscriptions
- Use router `withComponentInputBinding()` when applicable

---

## D3 Integration (CRITICAL)

- Use D3 ONLY for:
  - scales
  - math
  - coordinate calculations

- Avoid:
  - full DOM control
  - full SVG redraws

- Rendering:
  - Trigger via Angular `effect()`
  - Use `animTrigger` for forced redraw

- DOM access:
  - Only via `ElementRef` / `ViewChild`
  - Respect Angular lifecycle

- Performance:
  - Update only changed elements
  - Avoid unnecessary recalculation

---

## AG Grid

- Use AG Grid for all tables
- Do NOT build custom tables
- Follow existing grid configuration patterns

---

## UI Rules (PrimeNG)

- Always use PrimeNG components
- Use PrimeIcons for icons
- Follow Aura theme
- Do NOT introduce new UI libraries

---

## Styling

- Use SCSS with CSS variables
- No Tailwind
- Use design tokens:
  - colors → `var(--*)`
  - radius → `var(--radius-*)`
  - shadows → `var(--shadow-*)`

- Avoid inline styles

---

## Performance Rules

- Avoid unnecessary re-renders
- Use Signals for memoization
- Prevent redundant D3 updates
- Keep computations minimal

---

## Testing

- Use Jest only
- No Karma/Jasmine
- Focus on:
  - store logic
  - services
  - component logic

- Avoid heavy DOM testing
- Mock D3 modules

---

## Commands

```bash
npm start
npm run build
npm run build:prod
npm test
npm run lint

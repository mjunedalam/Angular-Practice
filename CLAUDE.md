# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Tech Stack

- **Angular 19** — Standalone components, async `OnPush` change detection
- **Angular Signals** — Fine-grained reactivity (via `@angular/core` — not a separate package)
- **NgRx Signals Store** — State management with `@ngrx/signals`
- **D3.js** — Data-driven SVG rendering (d3-selection, d3-scale, d3-transition, d3-ease)
- **AG Grid** — Enterprise data tables for reports
- **Custom SCSS** — Styled with CSS variables (no Tailwind); theme support via `data-theme` attribute
- **Jest + jest-preset-angular** — Testing framework; D3 modules configured in `transformIgnorePatterns`

## Commands

```bash
npm start          # Dev server at http://localhost:4200
npm run build      # Development build
npm run build:prod # Production build
npm test           # Run all Jest tests
npm run lint       # ESLint via Angular CLI
```

Run a single test file:
```bash
npx jest src/app/core/store/well.store.spec.ts
npx jest --testNamePattern="should load well names"
```

## Architecture

**Wellbore App** — Angular 19 dashboard for visualizing oil/water well drilling data. All components use `standalone: true` and `ChangeDetectionStrategy.OnPush`. Routes use lazy loading with `loadComponent()`.

### State Management — NgRx Signals Store

Two root-level stores manage application state:

#### WellStore (`src/app/core/store/well.store.ts`)
- Well name list (paginated, `PAGE_SIZE` entries per page)
- Selected well details (`IWellData` — a large nested object with ~14 expected keys)
- Loading/error state and `animationTrigger` counter

Selectors live in `well.selectors.ts` as pure functions; the store's `withComputed()` calls them. `well.actions.ts` holds typed action/event string enums (for logging only — no NgRx Actions dispatcher; mutations go through `patchState`).

#### ThemeStore (`src/app/core/store/theme/theme.store.ts`)
- Current theme mode: `'light' | 'dark'`
- Persists to localStorage under key `'agwa-theme'`
- Methods: `toggle()` to switch theme, `setTheme(mode)` to set explicitly
- Computed: `isDark()` and `isLight()` booleans
- Lifecycle: sets `data-theme` attribute on `<html>` element on init

**Data Flow**: `MoriningReportService.getMorningReport()` → well name chips → user selects chip → `WellDataService.getWellDetails(epANum)` → `patchState` updates → computed signals + store selectors propagate to child component @Input properties.

**Component Signal Consumption**: Components inject the store (`inject(WellStore)`) and destructure specific signals/computed values directly in the template for minimal change detection. Router's `$componentInputBinding()` allows store signals to be passed as component `@Input()` properties.

### D3 SVG Rendering Pattern

`WellBoreViewComponent` and `DepthScaleComponent` both render into `<svg>` elements using D3. The render is triggered by Angular `effect()` watching two required inputs:
- `diagramData` / `totalDepth` — the data to render
- `animTrigger: number` — incremented on each well load to force a redraw even when data shape is the same

D3 modules used: **d3-selection** (DOM binding), **d3-scale** (mapping data to coordinates), **d3-transition** (smooth animations), **d3-ease** (easing functions). Math/path utilities are centralized in `src/utils/wellbore-math.util.ts`.

### Feature Routes (lazy-loaded)

| Route | Component | Notes |
|-------|-----------|-------|
| `/home` | `HomeComponent` | Landing page |
| `/presentations` | `PersentationComponent` | Main wellbore viz; uses `PresentationSkeletonComponent` as loading state (note: folder/component names use "persentation" typo — keep consistent) |
| `/reports` | `ReportsComponent` | AG Grid table showing well reports |
| `/maps` | `MapsComponent` | |
| `/production` | `ProductionComponent` | |

### Component Layout (Presentations Route)

`PersentationComponent` is a layout parent that:
- Injects `WellStore` to track selected well and loading state
- Conditionally renders `PresentationSkeletonComponent` (loading placeholder) or children panels:
  - `WellBoreViewComponent` — D3 casing/wellbore SVG (left)
  - `DepthScaleComponent` — D3 depth axis (paired with WellBoreView)
  - `WellNameChipsComponent` — scrollable chip list for well selection
  - Multiple data panels: `OffsetWwellsComponent`, `PickedFormationTopsComponent`, `MiscPresWellDataComponent`, etc.
- Uses resizable dividers (`ResizeDividerComponent`) to create a flexible dashboard layout
- Passes `animTrigger` to D3 components to force redraw on well change

### Data Sources

Currently all data comes from static JSON assets (mock API):
- `/assets/data/well-names.json` — well name list
- `/assets/data/well-details.json` — single well detail object (used for all `epANum` lookups)
- `/api/morning-report` — real HTTP call via `MoriningReportService`

`WellDataService.getWellDetails()` ignores `epANum` and returns the static asset — see the comment in that method for the real API endpoint pattern.

### Key Directories

```
src/
├── app/
│   ├── core/
│   │   ├── store/
│   │   │   ├── well.store.ts, well.selectors.ts, well.actions.ts
│   │   │   └── theme/theme.store.ts
│   │   └── models/        # Feature-level model interfaces
│   ├── features/          # Lazy-loaded page components
│   │   ├── dashboard/     # Layout shell with sidenav & navbar
│   │   ├── home/          # Landing page
│   │   ├── persentation/  # Main wellbore visualization dashboard
│   │   │   ├── persentation.component.ts (layout parent)
│   │   │   ├── well-bore-view/    # D3 casing/wellbore SVG
│   │   │   ├── depth-scale/       # D3 depth axis SVG
│   │   │   ├── presentation-skeleton/  # Loading skeleton
│   │   │   └── [other panels]     # Data tables & charts
│   │   ├── reports/       # AG Grid table (report view)
│   │   ├── maps/, production/
│   ├── shared/
│   │   ├── components/    # ResizeDivider, GlobalLoader, DraggableCard, WellDesign
│   │   └── models/        # Shared model interfaces (casing, tops)
│   └── utils/             # wellbore-math.util.ts (D3 path/scale helpers)
├── models/                # Root-level models (well-design, indicators)
├── services/              # HTTP services (WellDataService, MoriningReportService)
└── assets/data/           # Mock JSON data (well-names.json, well-details.json)
```

### Testing

Jest with `jest-preset-angular`. `transformIgnorePatterns` is configured to handle ESM D3 packages (d3-selection, d3-scale, etc.). Spec files exist for `well.store`, `well.actions`, and `well.selectors`.

## Recommended Claude Skills

When working on this project, these Claude Skills provide expert guidance:

### Project-Local Skills (in `.claude/skills/`)

| Skill | Use When |
|-------|----------|
| **`/d3-signals`** | Integrating D3.js visualizations with Angular Signals (WellBoreView, DepthScale components) |
| **`/ngrx-signal-store`** | Building stores, mutations with `patchState()`, computed state, and component consumption |

### Global Skills

| Skill | Use When |
|-------|----------|
| **`/frontend-patterns`** | Designing component architecture, routing strategies, state flow patterns |
| **`/tdd-workflow`** | Writing new features or fixing bugs; enforces Jest test-first methodology for 80%+ coverage |
| **`/code-review`** | Reviewing TypeScript/Angular code for quality, security, and maintainability |
| **`/e2e-testing`** | Creating or updating end-to-end tests with Playwright for critical user flows |
| **`/frontend-design`** | Building UI components, improving design systems, styling with CSS variables |
| **`/verification-loop`** | Comprehensive verification ensuring code quality, tests pass, and no regressions |

**Quick Start:**
- **Building a feature?** → `/tdd-workflow` (test-first enforcement)
- **Done coding?** → `/code-review` (quality check)
- **Working with UI?** → `/frontend-design` (design patterns)
- **Critical user flows?** → `/e2e-testing` (Playwright tests)
- **Using NgRx Signals Store?** → `/ngrx-signal-store` (patchState, computed, methods)
- **Building D3 visualizations?** → `/d3-signals` (effect-driven rendering)

**Project-Specific Notes:**
- All components must use `standalone: true` and `ChangeDetectionStrategy.OnPush`
- State updates go through `patchState()` in stores, never direct mutation
- D3 visualizations in `WellBoreViewComponent` and `DepthScaleComponent` require both `diagramData` and `animTrigger` inputs
- Jest tests for store logic; use `jest-preset-angular` with D3 modules in `transformIgnorePatterns`

## Development Notes

### Dashboard Layout Shell
The root route loads `DashboardComponent` (with sidenav + navbar), which wraps all feature pages via `<router-outlet>`. Child routes use `withComponentInputBinding()` from the router config, allowing store signals to flow into component `@Input()` properties directly.

### Animations
`provideAnimations()` is enabled in `app.config.ts` to support Angular animations. Add `@trigger` animations to components as needed; the provider makes them available globally.

### Mock API
`WellDataService.getWellDetails()` currently returns static JSON regardless of `epANum` parameter. The real API endpoint pattern is noted in the service comments — swap the HTTP call when backend is ready.

### Resizable Panels
The presentations dashboard uses `ResizeDividerComponent` to create draggable column separators. Panels maintain their widths during resize and respond to window resizing.

### Styling & Theming
The app uses **custom SCSS with CSS variables** (no Tailwind). Design tokens are defined in `src/styles.scss`:
- Dark theme (default): `[data-theme='dark']` with palette like `--bg-app: #080e1a`, `--accent: #0ea5e9`
- Light theme: `[data-theme='light']` with lighter palette
- ThemeStore manages switching via `toggle()` and persists to localStorage
- Components use variables like `color: var(--text-primary)` and `background: var(--bg-card)`
- Radius tokens: `var(--radius-card)` (16px), `var(--radius-inner)` (12px)
- Shadow tokens: `var(--shadow-sm)`, `var(--shadow-md)`, `var(--shadow-glow)` for premium depth

## Project-Local Skills

This project includes two custom skills in `.claude/skills/` that document patterns unique to this codebase:

### `.claude/skills/d3-signals/SKILL.md`
Comprehensive guide to integrating D3.js with Angular Signals for reactive data visualization. Covers:
- Effect-driven D3 rendering pattern
- Why `animTrigger` is needed for forcing redraws
- D3 module configuration in Jest
- Component input binding with signals
- Testing D3 components
- Performance optimization tips

**Relevant Components:**
- `WellBoreViewComponent` — D3 wellbore/casing visualization
- `DepthScaleComponent` — D3 depth axis
- Any new D3-based visualization components

### `.claude/skills/ngrx-signal-store/SKILL.md`
Deep dive into NgRx Signal Store architecture and usage patterns. Covers:
- `signalStore()` definition with plugins
- State shape and mutations via `patchState()`
- Computed values with `withComputed()`
- Methods for side effects and async operations
- Lifecycle hooks with `withHooks()`
- Component consumption patterns
- Router component input binding
- Testing stores with `TestBed`
- Performance considerations

**Relevant Stores:**
- `WellStore` — Well data and pagination
- `ThemeStore` — Theme persistence and switching

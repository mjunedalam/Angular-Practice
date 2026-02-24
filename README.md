# Wellbore Design Viewer — Angular 19

Dynamic wellbore diagram viewer with telescopic casing animations and animated depth scale.

## Quick Start

```bash
npm install
npm start
# Open http://localhost:4200
```

## Stack

| Layer         | Technology                          |
|---------------|-------------------------------------|
| Framework     | Angular 19 (standalone, OnPush)     |
| State         | NgRx Signal Store (`@ngrx/signals`) |
| Reactivity    | Angular Signals                     |
| Visualization | D3.js (selection, scale, transition)|
| Styling       | SCSS (component-scoped)             |

## Component tree

```
AppComponent                        (shell, router-outlet)
└── PresentationComponent           (smart parent, injects WellStore)
    ├── WellNameChipsComponent       (dumb, input/output only)
    ├── DepthScaleComponent          (owns depth-scale SVG + animation)
    └── WellBoreViewComponent        (owns wellbore SVG + animations)
```

## How chip selection works (no page refresh)

`WellStore.animationTrigger` is a plain counter that increments on every
successful well load. Both `DepthScaleComponent` and `WellBoreViewComponent`
read this via `input()` and react inside an Angular `effect()`.  
The SVG root element is **never destroyed** — only D3 inner layers are
refreshed, so the transition runs smoothly each time.

## Switching to a real API

Edit `WellDataService` only:

```typescript
// before (static JSON)
return this.http.get<WellDetailsResponse>('/assets/data/well-details.json');

// after (live API)
return this.http.get<WellDetailsResponse>(`/api/wells/${epANum}/details`);
```

No other changes needed.

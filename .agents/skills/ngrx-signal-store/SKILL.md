# NgRx Signal Store Skill

## Overview

NgRx Signal Store provides a lightweight, type-safe state management solution built on Angular Signals. Unlike traditional action-dispatcher patterns, Signal Store uses `patchState()` for mutations and `withComputed()` for derived state, making it ideal for Angular 19+ applications.

## Core Concepts

### 1. Store Definition

Define stores with `signalStore()` and feature plugins:

```typescript
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals'

export const WellStore = signalStore(
  { providedIn: 'root' }, // Provide at root level

  // Initial state
  withState<WellState>({
    wellNames: [],
    selectedWell: null,
    isLoading: false,
    error: null,
  }),

  // Computed (derived) state
  withComputed(({ selectedWell }) => ({
    hasSelectedWell: computed(() => selectedWell() !== null),
    wellDepth: computed(() => selectedWell()?.totalDepth ?? 0),
  })),

  // Methods for mutations and side effects
  withMethods((store) => ({
    selectWell(epANum: string) {
      patchState(store, { isLoading: true })
      // Fetch data..
      patchState(store, {
        selectedWell: data,
        isLoading: false,
      })
    },
  }))
)
```

### 2. Mutation Pattern

Always use `patchState()` for state updates:

```typescript
// ❌ WRONG - Direct mutation breaks reactivity
store.wellNames().push(newWell)

// ✅ CORRECT - Use patchState()
patchState(store, {
  wellNames: [...store.wellNames(), newWell]
})
```

### 3. Computed Values (withComputed)

Derived state is computed on-demand using Angular `computed()`:

```typescript
withComputed(({ wellNames, selectedWell }) => ({
  wellCount: computed(() => wellNames().length),
  isFirstWellSelected: computed(() => {
    const selected = selectedWell()
    const first = wellNames()[0]
    return selected?.epANum === first?.epANum
  }),
}))
```

Computed values are **lazy** — they only recalculate when input signals change.

### 4. Methods (withMethods)

Methods handle mutations and side effects:

```typescript
withMethods((store) => ({
  setLoading(value: boolean) {
    patchState(store, { isLoading: value })
  },

  async loadWellNames(page: number) {
    patchState(store, { isLoading: true })
    try {
      const result = await this.wellService.getWellNames(page)
      patchState(store, {
        wellNames: result.data,
        currentPage: page,
        isLoading: false,
      })
    } catch (error) {
      patchState(store, {
        error: error.message,
        isLoading: false,
      })
    }
  },
}))
```

## Consumption in Components

### Inject and Use in Template

```typescript
@Component({
  selector: 'app-well-list',
  standalone: true,
})
export class WellListComponent {
  private wellStore = inject(WellStore)

  wellNames = this.wellStore.wellNames
  isLoading = this.wellStore.isLoading
  hasChoice = this.wellStore.hasSelectedWell

  selectWell(epANum: string) {
    this.wellStore.selectWell(epANum)
  }
}
```

```html
@if (isLoading()) {
  <loading-spinner />
} @else {
  @for (well of wellNames(); track well.epANum) {
    <button (click)="selectWell(well.epANum)">
      {{ well.wellName }}
    </button>
  }
}
```

### Router Component Input Binding

With `withComponentInputBinding()` from the router config, store signals automatically flow as `@Input()` properties:

```typescript
@Component({
  selector: 'app-detail',
  standalone: true,
})
export class DetailComponent {
  wellData = input<IWellData | null>(null)
  animTrigger = input(0)

  constructor() {
    effect(() => {
      console.log('Well selected:', this.wellData())
    })
  }
}
```

## Testing Signal Stores

Use `TestBed` with `inject()`:

```typescript
describe('WellStore', () => {
  it('selects a well', () => {
    TestBed.overrideProvider(WellDataService, { useValue: mockService })
    const store = TestBed.inject(WellStore)

    store.selectWell('EP123')
    TestBed.flushEffects()

    expect(store.selectedWell()?.epANum).toBe('EP123')
  })
})
```

## References

- [NgRx Signals Docs](https://ngrx.io/guide/signals)
- [Angular Signals Guide](https://angular.io/guide/signals)

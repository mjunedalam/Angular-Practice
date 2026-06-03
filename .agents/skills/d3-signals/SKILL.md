# D3 + Angular Signals Integration Skill

## Overview

This skill covers integrating D3.js with Angular Signals for data-driven SVG visualization. The pattern combines D3's DOM manipulation and scale/transition capabilities with Angular Signal reactivity for fine-grained change detection and optimal performance.

## Core Pattern

D3 visualizations are rendered inside Angular components using `effect()` to watch for data changes:

```typescript
import { Component, input, effect } from '@angular/core'
import { selection } from 'd3-selection'
import { scaleLinear } from 'd3-scale'
import { transition } from 'd3-transition'

@Component({
  selector: 'app-chart',
  template: '<svg #svgRef></svg>',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartComponent {
  diagramData = input.required<DataPoint[]>()
  animTrigger = input(0) // Increment to force redraw

  constructor() {
    effect(() => {
      // Trigger on both diagramData and animTrigger changes
      this.diagramData()
      this.animTrigger()

      // Redraw D3 visualization
      this.render()
    })
  }

  private render() {
    // D3 rendering logic here
  }
}
```

## Why animTrigger?

The `animTrigger` signal (a number) is incremented in the store whenever a well is selected. This forces D3 to redraw even when the data shape is identical to the previous selection. Without this, same-sized datasets won't trigger a visual refresh.

```typescript
// In WellStore
selectWell(epANum: string) {
  // ... fetch well data ...
  patchState(store, {
    selectedWell: data,
    animationTrigger: store.animationTrigger() + 1, // Force redraw
  })
}
```

## D3 Modules Configuration

Jest must transform ESM D3 modules. In `jest.config.js`:

```javascript
transformIgnorePatterns: [
  'node_modules/(?!.*\\.mjs$|d3|d3-.*|internmap|delaunator|robust-predicates)'
]
```

This allows Jest to process D3 modules that are published as ESM.

## Common D3 Modules in Use

| Module | Purpose |
|--------|---------|
| **d3-selection** | DOM element selection and binding |
| **d3-scale** | Mapping data values to visual scales (linear, band, etc.) |
| **d3-transition** | Smooth animated transitions between states |
| **d3-ease** | Easing functions for animation timing |

## Testing D3 Components

Test the **data flow and state changes**, not the visual output:

```typescript
it('updates SVG when diagramData changes', async () => {
  const { component } = await TestBed.createComponent(WellBoreViewComponent)
  component.diagramData = signal([{ depth: 100, size: 5 }])
  component.animTrigger = signal(0)

  // Manually trigger effect
  TestBed.flushEffects()

  const svg = component.svgRef.nativeElement
  expect(svg.querySelectorAll('rect').length).toBeGreaterThan(0)
})
```

For complex visualizations, consider visual regression testing with Playwright instead of brittle DOM assertions.

## References

- [d3-selection](https://github.com/d3/d3-selection)
- [d3-scale](https://github.com/d3/d3-scale)
- [d3-transition](https://github.com/d3/d3-transition)
- [d3-ease](https://github.com/d3/d3-ease)

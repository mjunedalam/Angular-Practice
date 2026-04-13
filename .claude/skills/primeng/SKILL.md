# PrimeNG 19 — Project Patterns & Reference

This skill documents PrimeNG usage patterns specific to this project (Angular 19 Wellbore App). PrimeNG 19.2.0-lts is pinned for Angular 19 compatibility — PrimeNG 21+ requires Angular 21+.

---

## Setup

### Package

```bash
npm install primeng@19.2.0 @primeuix/themes
```

The Aura theme preset ships in `@primeuix/themes`, not inside `primeng` itself.

### `app.config.ts`

```typescript
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';

providers: [
  provideAnimationsAsync(),           // replaces provideAnimations()
  providePrimeNG({
    theme: {
      preset: Aura,
      options: {
        darkModeSelector: '[data-theme="dark"]',  // matches ThemeStore
        cssLayer: { name: 'primeng', order: 'primeng, app' },
      },
    },
  }),
]
```

`darkModeSelector` matches the `data-theme` attribute set by `ThemeStore.toggle()` on `<html>`. No changes to ThemeStore needed.

---

## Component Import Paths

All PrimeNG components are standalone-ready. Import the module (not individual components) in the `imports` array:

| Component | Import |
|-----------|--------|
| Dialog | `import { DialogModule } from 'primeng/dialog'` |
| Accordion | `import { AccordionModule } from 'primeng/accordion'` |
| Tabs | `import { TabsModule } from 'primeng/tabs'` |
| Badge | `import { BadgeModule } from 'primeng/badge'` |
| Tag | `import { TagModule } from 'primeng/tag'` |
| Message | `import { MessageModule } from 'primeng/message'` |
| DatePicker | `import { DatePickerModule } from 'primeng/datepicker'` |
| ProgressBar | `import { ProgressBarModule } from 'primeng/progressbar'` |
| Avatar | `import { AvatarModule } from 'primeng/avatar'` |

---

## p-dialog — Draggable Modal

Use `[draggable]="true"` — PrimeNG handles all drag logic natively. Do NOT implement custom `@HostListener` mouse event handlers.

```html
<p-dialog
  [visible]="dialogVisible()"
  (visibleChange)="onDialogHide()"
  [draggable]="true"
  [resizable]="false"
  [modal]="true"
  [style]="{ width: '520px' }"
  styleClass="my-dialog"
  appendTo="body"
>
  <ng-template pTemplate="header">
    <!-- Custom header content -->
  </ng-template>

  <!-- Dialog body goes directly here (no wrapper needed) -->
</p-dialog>
```

**TypeScript pattern:**

```typescript
protected readonly dialogVisible = signal(false);
protected readonly selectedItem = signal<MyType | null>(null);

protected openDialog(item: MyType): void {
  this.selectedItem.set(item);
  this.dialogVisible.set(true);
}

protected onDialogHide(): void {
  this.selectedItem.set(null);
  this.dialogVisible.set(false);
}
```

**Full-screen modal (presentation layout toggle):**

```html
<p-dialog
  [visible]="draggableMode()"
  (visibleChange)="toggleDraggable()"
  [draggable]="true"
  [modal]="true"
  [style]="{ width: '92vw', height: '90vh' }"
  styleClass="pres-modal-dialog"
  appendTo="body"
>
```

### Overriding p-dialog styles

Use `::ng-deep` with the `styleClass` as namespace. Always put in the component's own SCSS:

```scss
::ng-deep .my-dialog {
  background: var(--bg-card) !important;
  border: 1px solid var(--border) !important;
  border-radius: 18px !important;

  .p-dialog-header {
    background: var(--bg-surface);
    border-bottom: 1px solid var(--border);
    padding: 12px 20px;
    cursor: grab;
    &:active { cursor: grabbing; }
  }

  .p-dialog-content {
    background: var(--bg-card);
    padding: 0;
  }

  .p-dialog-header-icon {
    color: var(--text-muted);
    border-radius: 8px;
    border: 1px solid var(--border);
    width: 28px;
    height: 28px;
    &:hover {
      background: var(--bg-card) !important;
      color: var(--text-primary) !important;
    }
  }
}
```

---

## p-tabs — Tab Navigation

Replaces the custom `.tab-btn` + `.info-panel__tabs` pattern.

```html
<p-tabs value="tab1" styleClass="my-tabs">
  <p-tablist>
    <p-tab value="tab1">First Tab</p-tab>
    <p-tab value="tab2">Second Tab</p-tab>
  </p-tablist>

  <p-tabpanels>
    <p-tabpanel value="tab1">
      <!-- content -->
    </p-tabpanel>
    <p-tabpanel value="tab2">
      <!-- content -->
    </p-tabpanel>
  </p-tabpanels>
</p-tabs>
```

### Overriding p-tabs styles

```scss
::ng-deep .my-tabs {
  display: flex;
  flex-direction: column;
  height: 100%;

  .p-tablist {
    background: var(--bg-surface);
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
  }

  .p-tab {
    color: var(--text-muted);
    font-size: 12px;
    font-weight: 600;
    &[aria-selected="true"] { color: var(--accent); }
  }

  .p-tabpanels {
    flex: 1;
    overflow: hidden;
    background: transparent;
    min-height: 0;
  }

  .p-tabpanel {
    height: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    padding: 0;
  }
}
```

---

## p-accordion — Collapsible Sections

Replaces custom expand/collapse UI. Uses string values (not numeric indices).

```html
<p-accordion
  [value]="activeValue()"
  (valueChange)="onValueChange($event)"
  styleClass="offset-accordion"
>
  @for (well of wells; track well.id; let i = $index) {
    <p-accordion-panel [value]="i.toString()">
      <p-accordion-header>Header text</p-accordion-header>
      <p-accordion-content>
        <!-- panel content -->
      </p-accordion-content>
    </p-accordion-panel>
  }
</p-accordion>
```

**TypeScript — handle the union type from `(valueChange)`:**

```typescript
protected readonly activeValue = signal<string>('0');

// PrimeNG emits string | number | string[] | number[]
protected onValueChange(value: string | number | string[] | number[]): void {
  if (Array.isArray(value)) {
    this.activeValue.set(String(value[0] ?? '0'));
  } else {
    this.activeValue.set(String(value));
  }
}
```

### Overriding p-accordion styles

```scss
::ng-deep .offset-accordion {
  .p-accordionpanel {
    border: 1px solid var(--border-sub);
    border-radius: var(--radius-inner);
    overflow: hidden;
    margin-bottom: 8px;
    background: var(--bg-surface);
  }

  .p-accordionheader {
    background: transparent;
    padding: 12px 16px;
    &:hover { background: rgba(14, 165, 233, 0.04); }
  }

  .p-accordioncontent-content {
    padding: 0 16px 16px;
    background: transparent;
  }

  .p-accordionheader-toggle-icon {
    color: var(--text-muted);
    width: 14px;
    height: 14px;
  }
}
```

---

## p-badge

```html
<!-- As a standalone component -->
<p-badge [value]="count.toString()" class="my-badge" />

<!-- Override styles -->
```

```scss
::ng-deep .my-badge .p-badge {
  background: var(--accent-muted);
  color: var(--accent);
  border: 1px solid rgba(14, 165, 233, 0.2);
  font-size: 11px;
  font-weight: 700;
}
```

---

## p-tag

```html
<p-tag value="Phreatic" severity="info" />
<p-tag value="Pump Test" severity="secondary" />
<p-tag value="H₂S Detected" severity="warn" />
```

Severity values: `"success"` | `"info"` | `"warn"` | `"danger"` | `"secondary"` | `"contrast"`

---

## p-message — Error Banner

Replaces the custom `.error-banner` div:

```html
@if (store.error()) {
  <p-message severity="error" [text]="store.error()!" styleClass="my-error-banner" />
}
```

```scss
::ng-deep .my-error-banner {
  flex-shrink: 0;
  margin: 0 12px 4px;
  border-radius: 8px;
}
```

---

## Dark Mode Integration

ThemeStore sets `document.documentElement.setAttribute('data-theme', mode)` on toggle. PrimeNG's `darkModeSelector: '[data-theme="dark"]'` watches this attribute — no additional wiring needed. Both light and dark themes work automatically.

---

## What NOT to Replace with PrimeNG

| Keep custom | Reason |
|-------------|--------|
| `ResizeDividerComponent` | Custom drag-resize behavior not available in PrimeNG |
| `PresentationSkeletonComponent` | Layout-specific skeleton doesn't map to any PrimeNG primitive |
| `WellBoreViewComponent`, `DepthScaleComponent` | D3.js SVG — no PrimeNG equivalent |
| `PickedFormationTopsComponent` (AG Grid) | AG Grid is superior to `p-table` for complex editable grids |
| All inline SVG icons | Domain-specific; no icon library equivalent for wellbore/water icons |
| Angular `@trigger` animations on list items | Still works alongside PrimeNG — e.g., `@resultTabAnim` on result tabs |

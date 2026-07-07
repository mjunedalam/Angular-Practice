# Latest Changes — Full File Contents

Generated: 2026-07-06 22:42
Branch: feature/rbac

**Files included (28):**
- `src/app/core/models/well-design/wellbore-diagram.model.ts`
- `src/app/core/services/active-well-view.service.ts`
- `src/app/features/active-wwell/active-wwell-form.service.ts`
- `src/app/features/active-wwell/active-wwell.helpers.ts`
- `src/app/features/active-wwell/wwell-test/wwell-test.component.html`
- `src/app/features/active-wwell/wwell-test/wwell-test.component.scss`
- `src/app/features/active-wwell/wwell-test/wwell-test.component.ts`
- `src/app/features/presentation/depth-scale/depth-scale.component.scss`
- `src/app/features/presentation/depth-scale/depth-scale.component.ts`
- `src/app/features/presentation/misc-pres-well-data/misc-pres-well-data.component.html`
- `src/app/features/presentation/misc-pres-well-data/misc-pres-well-data.component.scss`
- `src/app/features/presentation/picked-formation-tops/picked-formation-tops.component.scss`
- `src/app/features/presentation/picked-formation-tops/picked-formation-tops.component.ts`
- `src/app/features/presentation/store/presentation.store.ts`
- `src/app/features/presentation/well-bore-view/renderers/casing.renderer.ts`
- `src/app/features/presentation/well-bore-view/renderers/completion.renderer.ts`
- `src/app/features/presentation/well-bore-view/renderers/defs.renderer.ts`
- `src/app/features/presentation/well-bore-view/renderers/geo-tops.renderer.ts`
- `src/app/features/presentation/well-bore-view/renderers/liner.renderer.ts`
- `src/app/features/presentation/well-bore-view/renderers/not-drilled-zone.renderer.ts`
- `src/app/features/presentation/well-bore-view/renderers/static-chrome.renderer.ts`
- `src/app/features/presentation/well-bore-view/renderers/wellbore-depth.helpers.ts`
- `src/app/features/presentation/well-bore-view/well-bore-view.component.ts`
- `src/app/features/presentation/well-bore-view/wellbore-view.component.scss`
- `src/app/features/presentation/well-name-chips/well-name-chips.component.html`
- `src/app/features/presentation/well-name-chips/well-name-chips.component.scss`
- `src/app/features/presentation/well-name-chips/well-name-chips.component.spec.ts`
- `src/app/features/presentation/well-name-chips/well-name-chips.component.ts`

---

## `src/app/core/models/well-design/wellbore-diagram.model.ts`

```ts
import { ICasingIR } from 'src/app/shared/models/wwell/casing-ir.model';
import { IDrlgCsg } from 'src/app/shared/models/wwell/drlg-csg.model';
import { ITopsIR } from 'src/app/shared/models/wwell/tops-ir.model';
import { IHydrogeologyIR } from 'src/app/shared/models/wwell/hydrogeology-ir.model';
import { IPreWellData } from 'src/app/shared/models/wwell/pre-well-data.model';
import { IRigActivity } from 'src/app/shared/models/wwell/rig-activity.model';
import { IWellDesign } from 'src/app/shared/models/wwell/well-design.model';
export interface MudCircPoint {
  readonly depth: number;  // parsed from wPrsntDpth
  readonly pct: number;    // parsed from wMudCircPc
}

export interface WellboreDiagramData {
  readonly wellName: string;
  readonly totalDepth: number;
  readonly displayDepth: number;
  readonly casings: ICasingIR[];
  readonly drlgCasings: IDrlgCsg[];
  readonly geologicTops: ITopsIR[];
  readonly hydrogeology: IHydrogeologyIR | null;
  readonly prewap: IPreWellData | null;
  readonly rigActivity: IRigActivity | null;
  readonly currentDepth: number;
  readonly mudCirculation: MudCircPoint[];
  readonly wellDesign: IWellDesign | null;
}

export interface DiagramLayout {
  readonly svgHeight: number;
  readonly marginTop: number;
  readonly drawingHeight: number;
  readonly depthScaleWidth: number;
  readonly depthAxisX: number;
  readonly wellboreViewWidth: number;
  readonly geoLineX: number;
  readonly depthArrowX: number; // Controls the depth arrow's horizontal position
  readonly casingCenterX: number;
  readonly baseHalfWidth: number;
  readonly halfWidthIncrement: number;
  readonly shoeCurveOffset: number;
  // ── Completion element half-widths (x extents from center) ───────────────
  readonly openHoleHwMargin: number;   // open hole = innerHW + this
  readonly linerScreenInset: number;   // liner screen = innerHW - this
  // ── Gravel pack fill control ────────────────────────────────────────────
  readonly gpScreenGap: number;        // px gap between screen outer wall and GP inner fill edge
  readonly gpFillRatio: number;        // 0.0–1.0: fraction of available annulus (after gpScreenGap) that GP fills
}

export const DIAGRAM_LAYOUT: DiagramLayout = {
  svgHeight: 840,
  marginTop: 55,
  drawingHeight: 740,

  // -- RESPONSIVE MIDPOINT MATH --
  depthScaleWidth: 116,
  depthAxisX: 82,

  wellboreViewWidth: 1040,

  // ── Horizontal zone layout (left → right inside wellbore SVG) ──────────
  // [0 - 34]    drill arrow body
  // [56 - 120]  geo depth labels
  // [120]       geo axis line
  // [120 - 210] geo formation codes
  // [210+]      gap before bore structure
  // ─────────────────────────────────────────────────────────────────────
  depthArrowX: 24,
  geoLineX: 120,
  casingCenterX: 610,
  baseHalfWidth: 72,
  halfWidthIncrement: 26,
  shoeCurveOffset: 12,
  openHoleHwMargin: 25,
  linerScreenInset: 20,
  gpScreenGap: 3,       // 4px gap so screen is visually inside GP
  gpFillRatio: 1.0,     // fill full annulus by default; reduce to 0.5 etc. to narrow the GP band
};

// ─── Animation mode ────────────────────────────────────────────────────────
// 'realistic' : full cinematic sequence — casings drill down one by one,
//               then open-hole / overlays appear after all casings finish.
// 'fast'      : same sequence but 3× faster (good for development).
// 'instant'   : no animation, everything visible immediately.
export type AnimMode = 'realistic' | 'fast' | 'instant';

export const ANIM_MODE: AnimMode = 'fast';   // ← change this to switch modes

// Base timing profile (realistic).
// 'fast' divides every duration & delay by FAST_FACTOR.
// 'instant' sets everything to 0.
const FAST_FACTOR = 3;

function animValue(base: number): number {
  if (ANIM_MODE === 'instant') return 0;
  if (ANIM_MODE === 'fast') return Math.round(base / FAST_FACTOR);
  return base;
}

// ─── Core durations ────────────────────────────────────────────────────────
const _BASE = {
  SCALE_DURATION: 1000,   // depth scale draws down
  TICK_BASE_DELAY: 120,    // stagger for each depth tick
  GEO_DELAY: 200,    // geologic tops start appearing
  GEO_STAGGER: 55,     // stagger between each geo top
  CASING_DURATION: 800,    // each casing clip reveal duration
  CASING_STAGGER: 420,    // gap between each casing starting
  OH_DURATION: 800,    // open hole + liner screen clip reveal
  GRAVEL_DURATION: 600,    // gravel pack fill reveal
  HANGER_DURATION: 300,    // hanger bracket fade-in
  OVERLAY_FADE: 400,    // generic label / overlay fade-in
  SEQ_GAP: 200,    // breathing gap between sequential phases
};

// Number of structural casings determines when the last casing finishes.
// Components that must wait use computeOverlayDelay(casingCount).
export function computeOverlayDelay(casingCount: number): number {
  // Last casing (index 0 in draw order = innermost = last to animate) starts at:
  //   (casingCount - 1) * CASING_STAGGER, finishes after + CASING_DURATION
  const lastCasingDone = (casingCount - 1) * _BASE.CASING_STAGGER + _BASE.CASING_DURATION;
  return animValue(lastCasingDone + 100); // 100ms breathing room
}

// ─── Wellbore animation config (user-configurable) ────────────────────────

export type AnimSpeed    = 'slow' | 'normal' | 'fast';
export type AnimLineStyle = 'draw' | 'fade';          // draw = dashoffset, fade = opacity
export type AnimPopStyle  = 'elastic' | 'bounce' | 'fade';

export interface WellboreAnimConfig {
  speed:     AnimSpeed;
  lineStyle: AnimLineStyle;
  popStyle:  AnimPopStyle;
}

export const DEFAULT_ANIM_CONFIG: WellboreAnimConfig = {
  speed:     'normal',
  lineStyle: 'draw',
  popStyle:  'elastic',
};

export const ANIM = {
  SCALE_DURATION: animValue(_BASE.SCALE_DURATION),
  TICK_BASE_DELAY: animValue(_BASE.TICK_BASE_DELAY),
  GEO_DELAY: animValue(_BASE.GEO_DELAY),
  GEO_STAGGER: animValue(_BASE.GEO_STAGGER),
  CASING_DURATION: animValue(_BASE.CASING_DURATION),
  CASING_STAGGER: animValue(_BASE.CASING_STAGGER),
  OH_DURATION: animValue(_BASE.OH_DURATION),
  GRAVEL_DURATION: animValue(_BASE.GRAVEL_DURATION),
  HANGER_DURATION: animValue(_BASE.HANGER_DURATION),
  OVERLAY_FADE: animValue(_BASE.OVERLAY_FADE),
  SEQ_GAP: animValue(_BASE.SEQ_GAP),
  // Legacy alias so depth-scale component keeps working unchanged
  OVERLAY_DELAY: animValue((_BASE.CASING_STAGGER * 3) + _BASE.CASING_DURATION + 100),
} as const;

```

---

## `src/app/core/services/active-well-view.service.ts`

```ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpContext, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { ExternalConfigService } from 'src/app/shared/services/external-config.service';
import { GwdDailyRemarks, GwdWellTests } from '@shared/models/wwell/active-wwell.model';
import { SUPPRESS_GLOBAL_ERROR } from '@interceptors/error.interceptor';

@Injectable({ providedIn: 'root' })
export class ActiveWellViewService {
    private readonly http = inject(HttpClient);
    private readonly extConfigService = inject(ExternalConfigService);

    private get apiUrl(): string {
        const s = this.extConfigService.settings;
        return s.dailyOperationServiceUrl ?? '';
    }

    private get suppressCtx(): HttpContext {
        return new HttpContext().set(SUPPRESS_GLOBAL_ERROR, true);
    }

    createOrUpdateGwdDailyRemark(data: GwdDailyRemarks): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/gwd-daily-remarks`, data, { context: this.suppressCtx })
            .pipe(catchError(this.handleError));
    }

    createOrUpdateGwdWellTest(data: GwdWellTests): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/water-well-tests`, data, { context: this.suppressCtx })
            .pipe(catchError(this.handleError));
    }

    deleteGwdWellTest(egwtId: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/well-tests/${egwtId}`, { context: this.suppressCtx })
            .pipe(catchError(this.handleError));
    }

    private handleError(error: HttpErrorResponse) {
        return throwError(() => error);
    }
}
```

---

## `src/app/features/active-wwell/active-wwell-form.service.ts`

```ts
import { Injectable } from "@angular/core";
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, ValidationErrors, Validators } from "@angular/forms";

function requiredFor(mode: 'FLOW' | 'PUMP'): ValidatorFn {
  return (ctrl: AbstractControl): ValidationErrors | null => {
    const current = ctrl.parent?.get('hydTestTypCd')?.value as string | undefined;
    if (current !== mode) return null;
    const v = ctrl.value;
    const empty = v == null || (typeof v === 'string' && v.length === 0);
    return empty ? { required: true } : null;
  };
}

@Injectable({
    providedIn: "root"
})
export class ActiveWwellFormService {

    drillingRemarksForm: FormGroup = this._fb.group({
        epANum: [null, [Validators.required]],
        wActDt: [null, [Validators.required]],
        area: [null, [Validators.required]],
        status: [null, [Validators.required]],
        wOpRmk: [null],
        nxt24HrPlanRmk: [null],
        wDrlgSmryRmk: [null]
    });

    wellTestForm: FormGroup = this._fb.group({
        epANum: [null, [Validators.required]],
        rsvrCd: [null, [Validators.required]],
        hydTestTypCd: ['STP1', [Validators.required]],
        testStaDt: [null, [Validators.required]],
        temp: [null, [Validators.required]],
        hydH2sCnc: [null, [Validators.required]],
        wtrSaTdsCnc: [null, [Validators.required]],
        rpm:        [null, [requiredFor('PUMP')]],
        siwhp:      [null, [requiredFor('FLOW')]],
        hydPmpDpth: [null, [requiredFor('PUMP')]],
        hydProdRt:  [null, [Validators.required]],
        statWlvl:   [null, [requiredFor('PUMP')]],
        dyncWlvl:   [null, [requiredFor('PUMP')]],
        testerNetworkId: [null, [Validators.required]],
        hydProduct: [null],
        duration:   [null, [Validators.required]],
        fwhp:       [null, [requiredFor('FLOW')]],
    });

    constructor(private _fb: FormBuilder) {}
}

```

---

## `src/app/features/active-wwell/active-wwell.helpers.ts`

```ts
import { IWellData } from '@models/well-design/well-data.model';
import { DatabaseInfoViewModel, WellHeaderViewModel } from '@models/active-wwell/active-wwell-view.model';
import { FALLBACK_STR } from 'src/app/core/store/shared/well-data.selectors';

export const ACTIVE_WWELL_FALLBACK = 'N/A';

export function getMissingDetailLabels(
  header: WellHeaderViewModel | null,
  dbInfo: DatabaseInfoViewModel | null,
): string[] {
  const missing: string[] = [];
  const isMissing = (v: unknown) => v == null || String(v).trim() === '' || String(v).trim() === FALLBACK_STR;

  if (!header || isMissing(header.wellName)) missing.push('Well Name');
  if (!header || isMissing(header.field)) missing.push('Field');
  if (!header || isMissing(header.targetedAquifer)) missing.push('Targeted Aquifer');
  if (!header || isMissing(header.depth)) missing.push('Target Depth');
  if (!header || isMissing(header.biNum)) missing.push('BI Number');

  if (!dbInfo || isMissing(dbInfo.rig)) missing.push('Rig');
  if (!dbInfo || isMissing(dbInfo.spudDate)) missing.push('Spud Date');

  return missing;
}

export function normalizeStatusName(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

export function deriveStatusLabel(details: IWellData | null): string {
  const rigIdentification = details?.RIG_IDENTIFICATION?.[0] as Record<string, unknown> | undefined;
  const rigStateCode = typeof rigIdentification?.['wRigActStsCd'] === 'string'
    ? rigIdentification['wRigActStsCd']
    : null;

  if (rigStateCode === 'A') {
    return 'Active';
  }

  if (rigStateCode === 'I') {
    return 'Inactive';
  }

  if ((details?.DRLG_OP_STATUS?.[0]?.wPrsntDpth ?? 0) > 0) {
    return 'Active';
  }

  return ACTIVE_WWELL_FALLBACK;
}

```

---

## `src/app/features/active-wwell/wwell-test/wwell-test.component.html`

```html

<form [formGroup]="form">
  <div class="aw-section">
    <div class="wt-header-row">
      <div class="wt-title">Well Test</div>
      <div class="wt-type-toggle">
        <div class="wt-type-segment">
          <button type="button" class="wt-type-btn" [class.wt-type-btn--active]="!isFlowTest()" [disabled]="!isPublished()" (click)="isFlowTest.set(false)">Pump</button>
          <button type="button" class="wt-type-btn" [class.wt-type-btn--active]="isFlowTest()" [disabled]="!isPublished()" (click)="isFlowTest.set(true)">Flow</button>
        </div>
      </div>
      <div class="wt-expected-date-label">Expected test date</div>
      @if (canUpdate()) {
        <button
          type="button"
          class="wt-edit-toggle"
          [class.wt-edit-toggle--on]="isPublished()"
          (click)="isPublished.set(!isPublished())"
        >{{ isPublished() ? 'Publish Test' : 'Locked' }}</button>
      }
    </div>

    <div class="wt-body">
      <div class="wt-column">
        <div class="wt-row">
          <span class="wt-label wt-label--cased">Aquifer</span>
          <mat-form-field
            appearance="outline"
            subscriptSizing="dynamic"
            class="wt-aquifer-select"
          >
            <mat-select formControlName="rsvrCd">
              @for (opt of aquiferOptions(); track opt.code) {
                <mat-option [value]="opt.code">{{ opt.code }} - {{opt.description}}</mat-option>
              }
            </mat-select>
          </mat-form-field>
          <div class="wt-ir-cell">
            <span class="wt-ir-badge">IR</span>
            <input
              class="wt-ir-input"
              type="text"
              readonly
              [value]="data()?.aquiferEstimate ?? ''"
            />
          </div>
        </div>

        <div class="wt-row">
          <span class="wt-label wt-label--cased">Test duration (h)</span>
          <input
            class="wt-actual"
            type="text"
            inputmode="decimal"
            formControlName="duration"
            (keypress)="onlyNumbers($event)"
          />
          <div class="wt-ir-cell">
            <span class="wt-ir-badge">IR</span>
            <input class="wt-ir-input" type="text" readonly value="" />
          </div>
        </div>

        @if (isFlowTest()) {
          <div class="wt-row">
            <span class="wt-label wt-label--cased">Test rate (GPM)</span>
            <input
              class="wt-actual"
              type="text"
              inputmode="decimal"
              formControlName="hydProdRt"
              (keypress)="onlyNumbers($event)"
            />
            <div class="wt-ir-cell">
              <span class="wt-ir-badge">IR</span>
              <input class="wt-ir-input" type="text" readonly [value]="data()?.testRateEstimate ?? ''" />
            </div>
          </div>
        } @else {
          <div class="wt-row">
            <span class="wt-label">RPM</span>
            <input
              class="wt-actual"
              type="text"
              inputmode="decimal"
              formControlName="rpm"
              (keypress)="onlyNumbers($event)"
            />
            <div class="wt-ir-cell">
              <span class="wt-ir-badge">IR</span>
              <input class="wt-ir-input" type="text" readonly value="" />
            </div>
          </div>
        }

        <div class="wt-row">
          <span class="wt-label wt-label--cased">Temperature (°C)</span>
          <input
            class="wt-actual"
            type="text"
            inputmode="decimal"
            formControlName="temp"
            (keypress)="onlyNumbers($event)"
          />
          <div class="wt-ir-cell">
            <span class="wt-ir-badge">IR</span>
            <input class="wt-ir-input" type="text" readonly value="" />
          </div>
        </div>

        <div class="wt-row">
          <span class="wt-label">TDS (PPM)</span>
          <input
            class="wt-actual"
            type="text"
            inputmode="decimal"
            formControlName="wtrSaTdsCnc"
            (keypress)="onlyNumbers($event)"
          />
          <div class="wt-ir-cell">
            <span class="wt-ir-badge">IR</span>
            <input
              class="wt-ir-input"
              type="text"
              readonly
              [value]="data()?.tdsEstimate ?? ''"
            />
          </div>
        </div>

        <div class="wt-row">
          <span class="wt-label">H2S (PPM)</span>
          <input
            class="wt-actual"
            type="text"
            inputmode="decimal"
            formControlName="hydH2sCnc"
            (keypress)="onlyNumbers($event)"
          />
          <div class="wt-ir-cell">
            <span class="wt-ir-badge">IR</span>
            <input
              class="wt-ir-input"
              type="text"
              readonly
              [value]="data()?.h2sEstimate ?? ''"
            />
          </div>
        </div>
      </div>

      <div class="wt-column">
        @if (!isFlowTest()) {
          <div class="wt-row">
            <span class="wt-label wt-label--cased">Test Rate (GPM)</span>
            <input
              class="wt-actual"
              type="text"
              inputmode="decimal"
              formControlName="hydProdRt"
              (keypress)="onlyNumbers($event)"
            />
            <div class="wt-ir-cell">
              <span class="wt-ir-badge">IR</span>
              <input class="wt-ir-input" type="text" readonly [value]="data()?.testRateEstimate ?? ''" />
            </div>
          </div>

          <div class="wt-row">
            <span class="wt-label wt-label--cased">Pump Depth (ft)</span>
            <input
              class="wt-actual"
              type="text"
              inputmode="decimal"
              formControlName="hydPmpDpth"
              (keypress)="onlyNumbers($event)"
            />
            <div class="wt-ir-cell">
              <span class="wt-ir-badge">IR</span>
              <input class="wt-ir-input" type="text" readonly [value]="data()?.pumpDepthEstimate ?? ''" />
            </div>
          </div>

          <div class="wt-row">
            <span class="wt-label">SWL (ft)</span>
            <input
              class="wt-actual"
              type="text"
              inputmode="decimal"
              formControlName="statWlvl"
              (keypress)="onlyNumbers($event)"
            />
            <div class="wt-ir-cell">
              <span class="wt-ir-badge">IR</span>
              <input
                class="wt-ir-input"
                type="text"
                readonly
                [value]="data()?.swlEstimate ?? ''"
              />
            </div>
          </div>

          <div class="wt-row">
            <span class="wt-label">DWL (ft)</span>
            <input
              class="wt-actual"
              type="text"
              inputmode="decimal"
              formControlName="dyncWlvl"
              (keypress)="onlyNumbers($event)"
            />
            <div class="wt-ir-cell">
              <span class="wt-ir-badge">IR</span>
              <input class="wt-ir-input" type="text" readonly value="" />
            </div>
          </div>

          <div class="wt-row">
            <span class="wt-label wt-label--cased wt-label--with-info">
              Well productivity (GPM/FT)
              <span class="wt-info-wrap"
                (mouseenter)="showTooltip($event)"
                (mouseleave)="hideTooltip()">
                <svg class="wt-info-icon" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="8" cy="8" r="8" fill="currentColor"/>
                  <rect x="7.1" y="7" width="1.8" height="5" rx="0.9" fill="white"/>
                  <circle cx="8" cy="4.8" r="1.1" fill="white"/>
                </svg>
              </span>
            </span>
            <input
              class="wt-actual"
              type="text"
              formControlName="hydProduct"
            />
            <div class="wt-ir-cell">
              <span class="wt-ir-badge">IR</span>
              <input
                class="wt-ir-input"
                type="text"
                readonly
                value=""
              />
            </div>
          </div>
        } @else {
          <div class="wt-row">
            <span class="wt-label wt-label--cased">SIWHP (psi)</span>
            <input
              class="wt-actual"
              type="text"
              inputmode="decimal"
              formControlName="siwhp"
              (keypress)="onlyNumbers($event)"
            />
            <div class="wt-ir-cell">
              <span class="wt-ir-badge">IR</span>
              <input
                class="wt-ir-input"
                type="text"
                readonly
                [value]="data()?.siwhpEstimate ?? ''"
              />
            </div>
          </div>

          <div class="wt-row">
            <span class="wt-label wt-label--cased">FWHP (psi)</span>
            <input
              class="wt-actual"
              type="text"
              inputmode="decimal"
              formControlName="fwhp"
              (keypress)="onlyNumbers($event)"
            />
            <div class="wt-ir-cell">
              <span class="wt-ir-badge">IR</span>
              <input class="wt-ir-input" type="text" readonly value="" />
            </div>
          </div>

          <div class="wt-row">
            <span class="wt-label wt-label--cased wt-label--with-info">
              Well Productivity (GPM/ft)
              <span class="wt-info-wrap"
                (mouseenter)="showTooltip($event)"
                (mouseleave)="hideTooltip()">
                <svg class="wt-info-icon" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="8" cy="8" r="8" fill="currentColor"/>
                  <rect x="7.1" y="7" width="1.8" height="5" rx="0.9" fill="white"/>
                  <circle cx="8" cy="4.8" r="1.1" fill="white"/>
                </svg>
              </span>
            </span>
            <input
              class="wt-actual"
              type="text"
              formControlName="hydProduct"
            />
            <div class="wt-ir-cell">
              <span class="wt-ir-badge">IR</span>
              <input
                class="wt-ir-input"
                type="text"
                readonly
                value=""
              />
            </div>
          </div>
        }

        <div class="wt-row wt-row--conducted">
          <span class="wt-label wt-label--cased">Conducted by</span>
          <input
            class="wt-actual wt-actual--no-ir"
            type="text"
            formControlName="testerNetworkId"
          />
        </div>
      </div>
    </div>

    @if (canUpdate() || canDelete()) {
      <div class="wt-footer">
        @if (canDelete()) {
          <button
            mat-raised-button
            type="button"
            class="wt-delete-btn"
            [disabled]="deleteDisabled()"
            (click)="deleteWellTest()"
          >
            {{ isDeleting() ? 'DELETING...' : 'DELETE' }}
          </button>
        }
        @if (canUpdate()) {
          <button
            mat-raised-button
            type="button"
            class="wt-update-btn"
            [disabled]="isUpdating()"
            (click)="createOrUpdateActiveWwell()"
          >
            {{ isUpdating() ? 'UPDATING...' : 'UPDATE' }}
          </button>
        }
      </div>
    }
  </div>

  @if (tooltipVisible()) {
    <div class="wt-tooltip"
         [style.bottom.px]="tooltipPos().bottom"
         [style.right.px]="tooltipPos().right">
      <div class="wt-tooltip-header">
        <span class="wt-tooltip-badge" [class.wt-tooltip-badge--flow]="isFlowTest()" [class.wt-tooltip-badge--pump]="!isFlowTest()">
          {{ isFlowTest() ? 'FLOW' : 'PUMP' }}
        </span>
        <span class="wt-tooltip-title">Well Productivity</span>
      </div>
      <div class="wt-tooltip-formula">
        {{ isFlowTest() ? 'WP = Test Rate ÷ (2.3072 × (SIWHP − FWHP))' : 'WP = Test Rate ÷ (DWL − SWL)' }}
      </div>
      <div class="wt-tooltip-divider"></div>
      @if (productivityInfo(); as info) {
        <div class="wt-tooltip-vars">
          @for (inp of info.inputs; track inp.label) {
            <span class="wt-tooltip-var-lbl">{{ inp.label }}</span>
            <span class="wt-tooltip-var-val">{{ inp.value }}</span>
            <span class="wt-tooltip-var-unit">{{ inp.unit }}</span>
          }
        </div>
        <div class="wt-tooltip-divider"></div>
        <div class="wt-tooltip-result">WP = {{ info.calculation }}</div>
      }
    </div>
  }
</form>
```

---

## `src/app/features/active-wwell/wwell-test/wwell-test.component.scss`

```scss
// ── Header row ────────────────────────────────────────────────────────────────
.wt-header-row {
  display: grid;
  grid-template-columns: auto 1fr auto auto;
  align-items: stretch;
  gap: 0;
  background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
}

.wt-title {
  background: transparent;
  color: #fff;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  padding: 9px 16px;
  border-right: 1px solid rgba(255, 255, 255, 0.18);
  display: flex;
  align-items: center;
}

// ── PUMP / FLOW toggle ────────────────────────────────────────────────────────
.wt-type-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
}

.wt-type-segment {
  display: flex;
  align-items: center;
  background: rgba(0, 0, 0, 0.22);
  border-radius: 20px;
  padding: 2px;
}

.wt-type-btn {
  background: transparent;
  color: rgba(255, 255, 255, 0.5);
  border: none;
  border-radius: 18px;
  font-size: 0.6rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.09em;
  padding: 3px 14px;
  cursor: pointer;
  transition: background 0.18s ease, color 0.18s ease, box-shadow 0.18s ease;

  &--active {
    background: #fff;
    color: #1e3a8a;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.22);
  }

  &:hover:not(.wt-type-btn--active) {
    color: rgba(255, 255, 255, 0.85);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.45;
    pointer-events: none;
  }
}

.wt-expected-date-label {
  background: rgba(0, 0, 0, 0.14);
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.72rem;
  font-weight: 600;
  padding: 9px 14px;
  text-align: right;
  white-space: nowrap;
  border-left: 1px solid rgba(255, 255, 255, 0.18);
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

// ── Body ──────────────────────────────────────────────────────────────────────
.wt-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  border-top: 1px solid #e2e8f0;
}

.wt-column {
  display: flex;
  flex-direction: column;

  &:first-child {
    border-right: 2px solid #bfdbfe;
  }
}

// ── Row ───────────────────────────────────────────────────────────────────────
.wt-row {
  display: grid;
  grid-template-columns: 9rem 1fr 7.5rem;
  align-items: stretch;
  border-bottom: 1px solid #e2e8f0;
  min-height: 2rem;
  transition: background 0.12s ease;

  &:hover { background: var(--aw-cell-bg); }

  &--conducted {
    grid-template-columns: 9rem 1fr;
  }
}

// ── Label ─────────────────────────────────────────────────────────────────────
.wt-label {
  background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
  color: rgba(255, 255, 255, 0.95);
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 0.42rem 0.6rem;
  border-right: 1px solid rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  line-height: 1.3;

  &--cased {
    text-transform: none;
  }
}

// ── Actual input ──────────────────────────────────────────────────────────────
.wt-actual {
  background: #fff;
  color: #0f172a;
  border: none;
  border-right: 1px solid #e2e8f0;
  padding: 0.35rem 0.6rem;
  font-size: 0.84rem;
  font-weight: 600;
  font-family: inherit;
  text-align: right;
  outline: none;
  min-width: 0;

  &:focus {
    background: #eff6ff;
    border-right-color: #93c5fd;
    box-shadow: inset 0 0 0 1px #bfdbfe;
  }

  &.ng-invalid.ng-touched {
    background: #fff5f5;
    border-right-color: #fca5a5;
    box-shadow: inset 0 0 0 1px #fca5a5;
  }

  &:disabled {
    background: var(--aw-cell-bg);
    color: #64748b;
    cursor: not-allowed;
  }

  &--no-ir {
    border-right: none;
    text-align: left;
  }
}

// ── Well Productivity — computed badge + info tooltip ─────────────────────────
.wt-label--with-info {
  justify-content: space-between;
}

.wt-info-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  margin-left: 5px;
  cursor: pointer;
  border-radius: 50%;
  transition: transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1);

  &::before {
    content: '';
    position: absolute;
    inset: -4px;
    border-radius: 50%;
    background: rgba(147, 197, 253, 0);
    transition: background 0.2s ease;
  }

  &:hover {
    transform: scale(1.15);

    &::before {
      background: rgba(147, 197, 253, 0.18);
    }
  }
}

.wt-info-icon {
  width: 14px;
  height: 14px;
  color: rgba(255, 255, 255, 0.45);
  transition: color 0.2s ease, filter 0.2s ease;
  position: relative;

  .wt-info-wrap:hover & {
    color: #93c5fd;
    filter: drop-shadow(0 0 4px rgba(147, 197, 253, 0.6));
  }
}

@keyframes wt-tooltip-in {
  from {
    opacity: 0;
    transform: translateY(5px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.wt-tooltip {
  position: fixed;
  background: #fff;
  color: #1e293b;
  font-size: 11px;
  font-weight: 400;
  line-height: 1.5;
  border-radius: 7px;
  border: 1.5px solid #bfdbfe;
  padding: 8px 11px;
  min-width: 240px;
  box-shadow: 0 6px 20px rgba(37, 99, 235, 0.1), 0 2px 6px rgba(0, 0, 0, 0.07);
  z-index: 9999;
  pointer-events: none;
  animation: wt-tooltip-in 0.16s cubic-bezier(0.16, 1, 0.3, 1) both;

  &::after {
    content: '';
    position: absolute;
    top: 100%;
    right: 10px;
    border: 5px solid transparent;
    border-top-color: #bfdbfe;
  }

  &::before {
    content: '';
    position: absolute;
    top: 100%;
    right: 11px;
    border: 4px solid transparent;
    border-top-color: #fff;
    z-index: 1;
  }
}

.wt-tooltip-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 5px;
}

.wt-tooltip-badge {
  font-size: 0.54rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  padding: 1px 5px;
  border-radius: 20px;
  flex-shrink: 0;

  &--pump {
    background: #dbeafe;
    color: #1d4ed8;
    border: 1px solid #93c5fd;
  }

  &--flow {
    background: #dcfce7;
    color: #15803d;
    border: 1px solid #86efac;
  }
}

.wt-tooltip-title {
  font-size: 0.62rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: #334155;
}

.wt-tooltip-formula {
  font-family: 'Courier New', monospace;
  font-size: 0.63rem;
  font-weight: 600;
  color: #1d4ed8;
  padding: 3px 7px;
  background: #eff6ff;
  border-radius: 4px;
  border-left: 2px solid #3b82f6;
  white-space: nowrap;
}

.wt-tooltip-divider {
  height: 1px;
  background: #e2e8f0;
  margin: 6px 0;
}

.wt-tooltip-vars {
  display: grid;
  grid-template-columns: 5.5rem 1fr auto;
  gap: 1px 6px;
  align-items: baseline;
}

.wt-tooltip-var-lbl {
  font-family: 'Courier New', monospace;
  font-size: 0.62rem;
  font-weight: 700;
  color: #64748b;
  letter-spacing: 0.03em;
}

.wt-tooltip-var-val {
  font-family: 'Courier New', monospace;
  font-size: 0.63rem;
  color: #0f172a;
  font-weight: 600;
  text-align: right;
}

.wt-tooltip-var-unit {
  font-family: 'Courier New', monospace;
  font-size: 0.58rem;
  color: #94a3b8;
}

.wt-tooltip-result {
  font-family: 'Courier New', monospace;
  font-size: 0.66rem;
  font-weight: 700;
  color: #15803d;
  padding-top: 4px;
  border-top: 1px solid #d1fae5;
  white-space: nowrap;
}

// ── Aquifer mat-select ────────────────────────────────────────────────────────
.wt-aquifer-select {
  flex: 1;
  margin: 0;

  ::ng-deep {
    .mat-mdc-text-field-wrapper {
      padding: 0 8px;
      background: #fff;
    }
    .mdc-text-field--disabled .mat-mdc-text-field-wrapper {
      background: var(--aw-cell-bg);
    }
    .mat-mdc-form-field-infix {
      padding-top: 4px !important;
      padding-bottom: 4px !important;
      min-height: unset;
    }
    .mdc-notched-outline__leading,
    .mdc-notched-outline__trailing,
    .mdc-notched-outline__notch { border-color: #d1d5db; }
    .mdc-text-field--disabled .mdc-notched-outline__leading,
    .mdc-text-field--disabled .mdc-notched-outline__trailing,
    .mdc-text-field--disabled .mdc-notched-outline__notch { border-color: #e2e8f0; }
    .mat-mdc-select-value-text {
      font-size: 0.84rem;
      font-weight: 700;
      color: #0f172a;
    }
    .mdc-text-field--disabled .mat-mdc-select-value-text { color: #64748b; }
    .mat-mdc-select-arrow { color: #94a3b8; }
    .mat-mdc-form-field-subscript-wrapper { display: none; }
    .mat-mdc-select-disabled { cursor: not-allowed; }
  }

  &.ng-invalid.ng-touched ::ng-deep {
    .mdc-notched-outline__leading,
    .mdc-notched-outline__trailing,
    .mdc-notched-outline__notch { border-color: #ef4444; }
    .mat-mdc-text-field-wrapper { background: #fff5f5; }
  }
}

// ── IR cell ───────────────────────────────────────────────────────────────────
.wt-ir-cell {
  display: flex;
  align-items: stretch;
  min-width: 7.5rem;
  width: 7.5rem;
}

.wt-ir-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
  color: #fff;
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  padding: 0 6px;
  flex-shrink: 0;
  min-width: 1.6rem;
}

.wt-ir-input {
  flex: 1;
  background: var(--aw-cell-bg);
  color: #64748b;
  border: none;
  padding: 0.35rem 0.4rem;
  font-size: 0.82rem;
  font-weight: 600;
  font-family: inherit;
  text-align: right;
  outline: none;
  min-width: 0;
  cursor: not-allowed;
}

// ── Edit toggle (header cell) ─────────────────────────────────────────────────
.wt-edit-toggle {
  align-self: center;
  margin: 0 10px;
  background: #ef4444;
  color: #fff;
  border: none;
  border-radius: 20px;
  font-size: 0.6rem;
  font-weight: 800;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  padding: 3px 10px;
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
  transition: background 0.18s ease, box-shadow 0.18s ease;
  white-space: nowrap;

  &:hover {
    filter: brightness(1.1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }

  &--on {
    background: #10b981;
  }
}

// ── Footer ────────────────────────────────────────────────────────────────────
.wt-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.6rem;
  padding: 0.6rem 0.85rem;
  border-top: 1px solid #e2e8f0;
  background: var(--aw-cell-bg);
}

.wt-update-btn {
  background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%) !important;
  color: #fff !important;
  font-weight: 700 !important;
  min-height: 2rem;
  font-size: 0.88rem !important;
  line-height: 1;
  padding: 0 1.75rem !important;
  border-radius: 6px !important;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.28) !important;
  transition: box-shadow 0.18s ease, transform 0.18s ease !important;

  &:hover {
    box-shadow: 0 4px 16px rgba(37, 99, 235, 0.4) !important;
    transform: translateY(-1px);
  }
}

.wt-delete-btn {
  background: linear-gradient(135deg, #7f1d1d 0%, #dc2626 100%) !important;
  color: #fff !important;
  font-weight: 700 !important;
  min-height: 2rem;
  font-size: 0.88rem !important;
  line-height: 1;
  padding: 0 1.75rem !important;
  border-radius: 6px !important;
  box-shadow: 0 2px 8px rgba(220, 38, 38, 0.28) !important;
  transition: box-shadow 0.18s ease, transform 0.18s ease !important;

  &:hover:not([disabled]) {
    box-shadow: 0 4px 16px rgba(220, 38, 38, 0.45) !important;
    transform: translateY(-1px);
  }

  &[disabled] {
    background: #e2e8f0 !important;
    color: #94a3b8 !important;
    box-shadow: none !important;
    cursor: not-allowed;
  }
}

```

---

## `src/app/features/active-wwell/wwell-test/wwell-test.component.ts`

```ts
import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { catchError, forkJoin, map, merge, of, timer } from 'rxjs';
import { ActiveWwellFormService } from '../active-wwell-form.service';
import { ActiveWwellStore } from '../store/active-wwell.store';
import { ActiveWwellUiStore } from '../active-wwell-ui.store';
import { ActiveWellViewService } from '@core/services/active-well-view.service';
import { NotificationService } from '@shared/components/notification/notification.service';
import { RbacStore } from '@store/rbac/rbac.store';
import { ACTIONS } from '@models/rbac/role.constants';
import { formatDateForInput } from '@shared/utils/date.util';
import { calcFlowProductivityIndex, calcPumpProductivityIndex } from '@shared/utils/well-test-math.util';
import { getMissingDetailLabels } from '../active-wwell.helpers';

@Component({
  selector: 'app-wwell-test',
  standalone: true,
  imports: [MatButtonModule, MatFormFieldModule, MatSelectModule, ReactiveFormsModule, FormsModule],
  templateUrl: './wwell-test.component.html',
  styleUrl: './wwell-test.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WwellTestComponent {
  private readonly store = inject(ActiveWwellStore);
  private readonly uiStore = inject(ActiveWwellUiStore);
  private readonly rbac = inject(RbacStore);

  protected readonly data = this.store.wwellTest;
  protected readonly isUpdating = this.uiStore.isUpdating;

  protected readonly isFlowTest = signal(false);
  private initialFlowType = false;
  private wellTestSnapshot: string | null = null;

  formService = inject(ActiveWwellFormService);
  form: FormGroup = this.formService.wellTestForm;

  activeWellApiService = inject(ActiveWellViewService)
  notify = inject(NotificationService);

  protected readonly isPublished = signal(false);
  protected readonly productivityInfo = signal<{
    inputs: { label: string; value: string; unit: string }[];
    calculation: string;
  } | null>(null);

  protected readonly tooltipVisible = signal(false);
  protected readonly tooltipPos = signal({ bottom: 0, right: 0 });

  protected showTooltip(event: MouseEvent): void {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    this.tooltipPos.set({
      bottom: window.innerHeight - rect.top + 10,
      right: window.innerWidth - rect.right,
    });
    this.tooltipVisible.set(true);
  }

  protected hideTooltip(): void {
    this.tooltipVisible.set(false);
  }

  constructor() {
    effect(() => {
      const data = this.data();
      if (data) {
        const flowType = data.flowType === 'FLOW';
        this.isFlowTest.set(flowType);
        this.initialFlowType = flowType;
      }
    }, { allowSignalWrites: true });

    // Sync mode → hydTestTypCd and re-evaluate the requiredFor validators
    effect(() => {
      const isFlow = this.isFlowTest();
      this.form.get('hydTestTypCd')!.setValue(isFlow ? 'FLOW' : 'PUMP', { emitEvent: false });
      ['siwhp', 'fwhp', 'rpm', 'hydPmpDpth', 'statWlvl', 'dyncWlvl'].forEach(f =>
        this.form.get(f)?.updateValueAndValidity({ emitEvent: false }),
      );
    });

    effect(() => {
      if (this.isPublished()) {
        this.form.enable({ emitEvent: false });
        this.form.get('hydProduct')!.disable({ emitEvent: false });
        this.wellTestSnapshot = JSON.stringify(this.form.getRawValue());
      } else {
        this.form.disable({ emitEvent: false });
        this.form.get('hydProduct')!.disable({ emitEvent: false });
        this.wellTestSnapshot = null;
      }
    });

    // Reset edit mode and clear validation state when well or date changes
    effect(() => {
      this.store.selectedEpANum();
      this.store.selectedDate();

      this.isPublished.set(false);
      this.form.markAsUntouched();
      this.formService.drillingRemarksForm.markAsUntouched();
    }, { allowSignalWrites: true });


    // Re-run calculation when test type changes so tooltip stays in sync
    effect(() => {
      this.isFlowTest();
      this.recalculateProductivity();
    }, { allowSignalWrites: true });

    merge(
      this.form.get('statWlvl')!.valueChanges,
      this.form.get('dyncWlvl')!.valueChanges,
      this.form.get('siwhp')!.valueChanges,
      this.form.get('fwhp')!.valueChanges,
      this.form.get('hydProdRt')!.valueChanges,
    ).pipe(takeUntilDestroyed()).subscribe(() => this.recalculateProductivity());
  }

  private recalculateProductivity(): void {
    const v = this.form.getRawValue();

    if (this.isFlowTest()) {
      const result = calcFlowProductivityIndex(v.hydProdRt, v.siwhp, v.fwhp);
      this.form.get('hydProduct')!.setValue(
        result != null ? +result.toFixed(4) : null,
        { emitEvent: false },
      );
      const flowRate = v.hydProdRt ?? '—';
      const siwhp = v.siwhp ?? '—';
      const fwhp = v.fwhp ?? '—';
      this.productivityInfo.set({
        inputs: [
          { label: 'Test Rate', value: `${flowRate}`, unit: 'GPM' },
          { label: 'SIWHP', value: `${siwhp}`, unit: 'psi' },
          { label: 'FWHP', value: `${fwhp}`, unit: 'psi' },
        ],
        calculation: result != null
          ? `${flowRate} ÷ (2.3072 × (${siwhp} − ${fwhp})) = ${result.toFixed(4)} GPM/ft`
          : '—',
      });
    } else {
      const result = calcPumpProductivityIndex(v.hydProdRt, v.dyncWlvl, v.statWlvl);
      this.form.get('hydProduct')!.setValue(
        result != null ? +result.toFixed(4) : null,
        { emitEvent: false },
      );
      const pumpRate = v.hydProdRt ?? '—';
      const dynamicWaterLevel = v.dyncWlvl ?? '—';
      const staticWaterLevel = v.statWlvl ?? '—';
      this.productivityInfo.set({
        inputs: [
          { label: 'Test Rate', value: `${pumpRate}`, unit: 'GPM' },
          { label: 'DWL', value: `${dynamicWaterLevel}`, unit: 'ft' },
          { label: 'SWL', value: `${staticWaterLevel}`, unit: 'ft' },
        ],
        calculation: result != null
          ? `${pumpRate} ÷ (${dynamicWaterLevel} − ${staticWaterLevel}) = ${result.toFixed(4)} GPM/ft`
          : '—',
      });
    }
  }

  createOrUpdateActiveWwell() {
    const isMissing = (v: unknown) => v == null || String(v).trim() === '' || String(v).trim() === 'N/A';

    const f = this.formService.drillingRemarksForm.getRawValue();
    const missing = getMissingDetailLabels(
      this.store.wellHeaderData(),
      this.store.databaseInfo(),
    );

    if (isMissing(f['status'])) missing.push('Status');
    if (isMissing(f['area']))   missing.push('Area');

    if (this.isPublished()) {
      const wt = this.form.getRawValue();
      if (isMissing(wt['rsvrCd']))         missing.push('Aquifer');
      if (isMissing(wt['temp']))           missing.push('Temperature');
      if (isMissing(wt['hydH2sCnc']))      missing.push('H2S');
      if (isMissing(wt['wtrSaTdsCnc']))    missing.push('TDS');
      if (isMissing(wt['hydProdRt']))      missing.push('Test Rate');
      if (isMissing(wt['testerNetworkId'])) missing.push('Conducted By');
      if (isMissing(wt['duration']))       missing.push('Test Duration');

      if (this.isFlowTest()) {
        if (isMissing(wt['siwhp'])) missing.push('SIWHP');
        if (isMissing(wt['fwhp']))  missing.push('FWHP');
      } else {
        if (isMissing(wt['rpm']))        missing.push('RPM');
        if (isMissing(wt['hydPmpDpth'])) missing.push('Pump Depth');
        if (isMissing(wt['statWlvl']))   missing.push('SWL');
        if (isMissing(wt['dyncWlvl']))   missing.push('DWL');
      }
    }

    if (missing.length > 0) {
      this.notify.warn(
        `Missing required details: ${missing.join(', ')}`,
        { durationMs: 12000 },
      );
      return;
    }

    this.form.markAllAsTouched();
    this.formService.drillingRemarksForm.markAllAsTouched();

    if (this.isPublished() && this.form.invalid) return;

    const wellTestChanged = this.isPublished() && (
      this.isFlowTest() !== this.initialFlowType ||
      JSON.stringify(this.form.getRawValue()) !== this.wellTestSnapshot
    );
    const remarksChanged = this.formService.drillingRemarksForm.dirty;

    if (!wellTestChanged && !remarksChanged) {
      this.notify.info('No changes to save');
      return;
    }

    this.uiStore.setUpdating(true);

    // Discriminated union: null = not attempted, true = success, false = failed
    const remarks$ = remarksChanged
      ? this.createOrUpdateDrillingRemarks().pipe(
          map(() => true as const),
          catchError(() => of(false as const)),
        )
      : of(null);
    const wellTest$ = wellTestChanged
      ? this.createOrUpdateWellTest().pipe(
          map(() => true as const),
          catchError(() => of(false as const)),
        )
      : of(null);

    forkJoin({ remarks: remarks$, wellTest: wellTest$, _min: timer(1500) }).subscribe(({ remarks, wellTest }) => {
      this.uiStore.setUpdating(false);

      const remarksFailed = remarks === false;
      const wellTestFailed = wellTest === false;

      if (!remarksFailed && !wellTestFailed) {
        this.notify.info('Well details updated successfully');
        if (remarks === true) this.formService.drillingRemarksForm.markAsPristine();
        if (wellTest === true) {
          this.initialFlowType = this.isFlowTest();
          this.wellTestSnapshot = JSON.stringify(this.form.getRawValue());
        }
        this.store.refreshWellDetail();
      } else if (!remarksFailed && wellTestFailed) {
        if (remarks === true) {
          this.notify.info('Drilling remarks saved');
          this.formService.drillingRemarksForm.markAsPristine();
          this.store.refreshWellDetail();
        }
        this.notify.error('Well test update failed');
      } else if (!wellTestFailed && remarksFailed) {
        if (wellTest === true) {
          this.notify.info('Well test saved');
          this.initialFlowType = this.isFlowTest();
          this.wellTestSnapshot = JSON.stringify(this.form.getRawValue());
          this.store.refreshWellDetail();
        }
        this.notify.error('Drilling remarks update failed');
      } else {
        this.notify.error('Update failed — please try again');
      }
    });
  }


  createOrUpdateDrillingRemarks() {
    const bodyGwdDailyRemarks = this.formService.drillingRemarksForm.value;
    const egdrId = this.store.wellData()?.EXAD_GWD_DAILY_REMARKS?.[0]?.egdr_id;
    bodyGwdDailyRemarks.egdrId = egdrId;
    bodyGwdDailyRemarks.wActDt = formatDateForInput(this.store.selectedDate());
    return this.activeWellApiService.createOrUpdateGwdDailyRemark(bodyGwdDailyRemarks)
  }

  createOrUpdateWellTest() {
    const bodyGwdWellTest = this.formService.wellTestForm.getRawValue()
    const egwtId = this.store.wellData()?.EXAD_GWD_WELL_TESTS?.[0]?.egwt_id;
    bodyGwdWellTest.egwtId = egwtId;
    bodyGwdWellTest.testStaDt = formatDateForInput(this.store.selectedDate());
    return this.activeWellApiService.createOrUpdateGwdWellTest(bodyGwdWellTest)
  }



  protected readonly canUpdate = computed(() =>
    this.rbac.hasPermission('active-wwell', ACTIONS.UPDATE),
  );

  protected readonly canDelete = computed(() =>
    this.rbac.hasPermission('active-wwell', ACTIONS.DELETE),
  );

  protected readonly egwtId = computed(() =>
    this.store.wellData()?.EXAD_GWD_WELL_TESTS?.[0]?.egwt_id ?? null,
  );

  protected readonly isDeleting = signal(false);

  protected readonly deleteDisabled = computed(() =>
    !this.isPublished() || !this.egwtId() || this.isUpdating() || this.isDeleting(),
  );

  deleteWellTest(): void {
    const egwtId = this.egwtId();
    if (!egwtId) return;

    const wellName = this.store.wellHeaderData()?.wellName ?? 'Unknown';
    const testDate = formatDateForInput(this.store.selectedDate());
    const testType = this.isFlowTest() ? 'Flow' : 'Pump';

    this.isDeleting.set(true);

    forkJoin([
      this.activeWellApiService.deleteGwdWellTest(egwtId),
      timer(1500),
    ]).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.notify.info(
          `Well test deleted — ${wellName} | ${testType} test | ${testDate} | ID: ${egwtId}`,
          { durationMs: 10000 },
        );
        this.isPublished.set(false);
        this.store.refreshWellDetail();
      },
      error: () => {
        this.isDeleting.set(false);
        this.notify.error('Failed to delete well test — please try again');
      },
    });
  }

  protected readonly aquiferOptions = this.store.aquifers;

  protected onlyNumbers(event: KeyboardEvent): void {
    const allowed = /[\d.-]/.test(event.key) || [
      'Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End'
    ].includes(event.key);
    if (!allowed) event.preventDefault();
  }
}
```

---

## `src/app/features/presentation/depth-scale/depth-scale.component.scss`

```scss
:host {
  display: block;
  flex: 0 0 12%;
  height: 100%;
}

.depth-scale-svg {
  display: block;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  border-right: 1px solid rgba(15, 23, 42, 0.14);
  border-top-left-radius: 18px;
  border-bottom-left-radius: 18px;
  width: 100%;
  height: 100%;
  overflow: hidden;
}



:host ::ng-deep {


  .axis-title {
    font-size: 17px; font-weight: 900;
    fill: #000;
    letter-spacing: 0.04em; text-transform: uppercase;
  }
  .axis-line  { stroke: #000; stroke-width: 2.4; fill: none; opacity: 1; }
  .axis-arrow { fill: #000; opacity: 1; }
  .tick-line  { stroke: #000; stroke-width: 2.2; stroke-linecap: round; opacity: 1; }
  .tick-label {
    font-size: 20px;
    font-weight: 900;
    fill: #000; text-anchor: end;
    paint-order: stroke;
    stroke: #fff;
    stroke-width: 3px;
    stroke-linejoin: round;
  }
  .total-depth-label {
    font-size: 18px; font-weight: 900;
    fill: #000; letter-spacing: 0.04em;
  }
}

```

---

## `src/app/features/presentation/depth-scale/depth-scale.component.ts`

```ts
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  effect,
  input,
  viewChild,
} from '@angular/core';
import { select } from 'd3-selection';
import { easeBackOut, easeCubicOut } from 'd3-ease';
import 'd3-transition';

import { PresentationStore } from '../store/presentation.store';
import { ANIM, DIAGRAM_LAYOUT } from 'src/app/core/models/well-design/wellbore-diagram.model';
import { buildDepthTicks, createDepthScale, pickTickInterval } from 'src/app/shared/utils/wellbore-math.util';

@Component({
  selector: 'app-depth-scale',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './depth-scale.component.html',
  styleUrl: './depth-scale.component.scss',
})
export class DepthScaleComponent {
  protected readonly store = inject(PresentationStore);
  readonly totalDepth = input.required<number>();
  readonly animTrigger = input.required<number>();

  private readonly svgRef = viewChild<ElementRef<SVGSVGElement>>('scaleSvg');

  private readonly layout = DIAGRAM_LAYOUT;

  constructor() {
    effect(() => {
      const svgEl = this.svgRef();
      const depth = this.totalDepth();
      this.animTrigger(); // track trigger so we redraw on every new well load

      if (svgEl?.nativeElement) {
        this.drawScale(depth, svgEl.nativeElement);
      }
    });
  }

  private drawScale(totalDepth: number, element: SVGSVGElement): void {
    const { depthScaleWidth, svgHeight, marginTop, drawingHeight, depthAxisX } = this.layout;
    const tickHalfLength = 10;
    const tickLabelGap = 6;
    const tickLeftX = depthAxisX - tickHalfLength;
    const tickRightX = depthAxisX + tickHalfLength;
    const tickLabelX = tickLeftX - tickLabelGap;

    const svg = select(element);
    svg.selectAll('*').remove();

    svg
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${depthScaleWidth} ${svgHeight}`)
      .attr('preserveAspectRatio', 'none');

    const g = svg.append('g').attr('transform', `translate(0,${marginTop})`);
    const scale = createDepthScale(totalDepth, drawingHeight);
    const ticks = buildDepthTicks(totalDepth, pickTickInterval(totalDepth));

    const titleX = depthScaleWidth / 2;
    g.append('text')
      .attr('class', 'axis-title')
      .attr('x', titleX)
      .attr('y', -42)
      .attr('text-anchor', 'middle')
      .style('opacity', 0)
      .call((t) => {
        t.append('tspan').attr('x', titleX).attr('dy', 0).text('Depth');
        t.append('tspan').attr('x', titleX).attr('dy', 20).text('(ft bgl)');
      })
      .transition()
      .delay(80)
      .duration(360)
      .ease(easeCubicOut)
      .attr('y', -36)
      .style('opacity', 1);

    const scaleTipY = scale(totalDepth); // === drawingHeight
    const lineLen = scaleTipY;

    g.append('line')
      .attr('class', 'axis-line')
      .attr('x1', depthAxisX).attr('x2', depthAxisX)
      .attr('y1', 0).attr('y2', scaleTipY)
      .attr('stroke-dasharray', lineLen)
      .attr('stroke-dashoffset', lineLen)
      .transition()
      .duration(ANIM.SCALE_DURATION)
      .ease(easeCubicOut)
      .attr('stroke-dashoffset', 0);

    ticks.forEach((depth: number) => {
      const yPx = scale(depth);
      const delay = (depth / totalDepth) * ANIM.SCALE_DURATION + ANIM.TICK_BASE_DELAY;

      const tick = g.append('g')
        .attr('class', 'tick')
        .attr('transform', `translate(0,${yPx - 4})`)
        .style('opacity', 0.01);

      tick.append('line')
        .attr('class', 'tick-line')
        .attr('x1', depthAxisX).attr('x2', depthAxisX)
        .attr('y1', 0).attr('y2', 0)
        .transition()
        .delay(delay)
        .duration(280)
        .ease(easeBackOut.overshoot(1.4))
        .attr('x1', tickLeftX).attr('x2', tickRightX);

      tick.append('text')
        .attr('class', 'tick-label')
        .attr('x', tickLabelX + 8)
        .attr('y', 0)
        .attr('dominant-baseline', 'middle')
        .style('opacity', 0)
        .text(depth === 0 ? '0' : depth.toLocaleString())
        .transition()
        .delay(delay + 110)
        .duration(260)
        .ease(easeCubicOut)
        .attr('x', tickLabelX)
        .style('opacity', 1);

      tick.transition()
        .delay(delay)
        .duration(240)
        .ease(easeCubicOut)
        .attr('transform', `translate(0,${yPx})`)
        .style('opacity', 1);
    });

    // g.append('text')
    //   .attr('class', 'total-depth-label')
    //   .attr('x', depthAxisX)
    //   .attr('y', drawingHeight + 32)
    //   .attr('text-anchor', 'middle')
    //   .style('opacity', 0)
    //   .text(formatDepth(totalDepth))
    //   .transition()
    //   .delay(ANIM.SCALE_DURATION + 200)
    //   .duration(300)
    //   .style('opacity', 1);
  }
}

```

---

## `src/app/features/presentation/misc-pres-well-data/misc-pres-well-data.component.html`

```html
@let d = store.miscWellData();

@if (d) {
  <div class="misc-card">
    <div class="misc-grid">
      <!-- ROW 1: Well Name | Rig Name + Height -->
      <div class="cell cell--well-name">
        <span class="cell__label">Well Name</span>
        <div class="cell__name">{{ d.wellName }}</div>
      </div>

      <div class="cell cell--rig-info">
        <span class="cell__label">Rig</span>
        <div class="cell__name">{{ d.rigName }}</div>
        @if (d.rigHeight) {
          <div class="cell__sub">Rig Height (ft): {{ d.rigHeight }}</div>
        }
      </div>

      <!-- ROW 2: BI | Target Aquifer -->
      <div class="cell cell--bi">
        <div class="bi-num">BI{{ d.biNum }}</div>
        <div class="bi-label">Supporting</div>
        <div class="bi-well">{{ d.supportings }}</div>
      </div>

      <div class="cell cell--aquifer">
        <span class="cell__label cell__label--dark">Targeted<br />Aquifer</span>
        <div class="aquifer-content">
          <img
            class="aquifer-logo"
            src="assets/images/agwa-logo.svg"
            alt="AGWA"
          />
          <div class="aquifer-name">{{ d.targetedAquifer }}</div>
        </div>
      </div>

      <!-- ROW 3: Rig Move KPI | Spud Date -->
      <div class="cell cell--next-kpi">
        <div class="next-kpi__icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            <path d="M7 7h10" stroke-linecap="round" />
            <path d="M7 12h6" stroke-linecap="round" />
            <path
              d="M17 12l3 3-3 3"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path d="M17 17H7" stroke-linecap="round" />
          </svg>
        </div>
        <div class="next-kpi__content">
          <div class="cell__label-light">Rig Move</div>
          <div class="next-kpi__stat">
            <span class="next-kpi__stat-label">Actual / KPI</span>
            <span class="next-kpi__stat-value">
              <span
                [class.next-kpi__days--positive]="rigMoveTone(d.rigMoveDays) === 'positive'"
                [class.next-kpi__days--negative]="rigMoveTone(d.rigMoveDays) === 'negative'"
                >{{ d.actualRm | number: "1.0-2" }}</span
              >/{{ d.kpiRm | number: "1.0-2" }}
            </span>
          </div>
        </div>
      </div>

      <div class="cell cell--spud">
        <div class="spud-icon">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            stroke-width="2"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M16 2v4M8 2v4M3 10h18" />
          </svg>
        </div>
        <div>
          <div class="cell__label-light">Spud Date</div>
          <div class="spud-value">{{ formatSpudDate(d.spudDate) }}</div>
        </div>
      </div>

      <!-- ROW 4: Days | Current Depth -->
      <div class="cell cell--days">
        <div class="days-cal">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M16 2v4M8 2v4M3 10h18" />
          </svg>
        </div>
        <div>
          <div class="cell__label-light">Days</div>
          <div class="days-value">
            {{ d.daysSinceSpud | number: "1.2-2" }}/{{ d.targetDays }}
          </div>
        </div>
      </div>

      <div class="cell cell--depth">
        <div class="depth-labels">
          <div class="cell__label-light">Current</div>
          <div class="cell__label-light">Depth (ft)</div>
        </div>
        <div class="depth-value">{{ d.currentDepth | number }}</div>
      </div>

      <!-- ROW 5: Current Hole Size | Previous Depth -->
      <div class="cell cell--hole-size">
        <div class="hole-size__icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            <circle cx="12" cy="12" r="8" stroke-dasharray="4 2" />
            <circle
              cx="12"
              cy="12"
              r="3"
              fill="white"
              opacity="0.3"
              stroke="none"
            />
            <path d="M12 4v2M12 18v2M4 12h2M18 12h2" stroke-linecap="round" />
          </svg>
        </div>
        <div class="hole-size__body">
          <div class="cell__label-light">Current Hole Size</div>
          <div class="hole-size__value">{{ d.holeSize ?? "NA" }}</div>
        </div>
      </div>

      <div class="cell cell--prev">
        <div class="depth-labels">
          <div class="cell__label-light">Previous</div>
          <div class="cell__label-light">Depth (ft)</div>
        </div>
        <div class="depth-value">{{ d.previousDepth | number }}</div>
      </div>

      <!-- ROW 6: Footage | ROP -->
      <div class="cell cell--feet">
        <div class="feet-left">
          <div class="feet-value">{{ d.feetDrilledToday | number }}</div>
          <div class="cell__label-light">Footage (ft)</div>
        </div>
        <div class="feet-icon">
          <svg
            viewBox="0 0 40 40"
            fill="none"
            stroke="white"
            stroke-width="1.8"
          >
            <path
              d="M20 5v15M13 13l7 7 7-7"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M5 25c3.75 0 3.75 3 7.5 3s3.75-3 7.5-3 3.75 3 7.5 3 3.75-3 7.5-3"
              opacity="0.6"
            />
            <path
              d="M5 32c3.75 0 3.75 3 7.5 3s3.75-3 7.5-3 3.75 3 7.5 3 3.75-3 7.5-3"
              opacity="0.4"
            />
          </svg>
        </div>
      </div>

      <div class="cell cell--rop">
        <div class="depth-labels">
          <div class="rop-value">{{ d.rop | number }}</div>
          <div class="cell__label-light">ROP (ft/h)</div>
        </div>
        <div class="feet-icon">
          <mat-icon>speed</mat-icon>
        </div>
      </div>

      <!-- ROW 7: Next Well (full width) -->
      <div class="cell cell--next cell--full">
        <div class="next-well__icon">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            stroke-width="2"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              opacity="0.25"
              fill="white"
              stroke="none"
            />
            <path d="M5 12h14" stroke-linecap="round" />
            <path
              d="M13 6l6 6-6 6"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <div class="next-well__body">
          <div class="cell__label-light">Next Well</div>
          <div class="well-name-val">{{ d.nextWell }}</div>
        </div>
      </div>

      <!-- ROW 8: Operation Summary (full width) -->
      @if (d.operationSummary) {
        <div class="cell cell--op-summary">
          <div class="op-header">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
              />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            <span class="op-header__label">Operation Summary</span>
          </div>
          <div class="op-text op-text--expandable">{{ d.operationSummary }}</div>
        </div>
      }

      <!-- ROW 9: Drilling Summary Remark (full width, if exists) -->
      @if (d.drlgSmryRmk) {
        <div class="cell cell--next24">
          <div class="op-header">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
              />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            <span class="op-header__label">Drilling Summary Remark</span>
          </div>
          <div class="op-text">{{ d.drlgSmryRmk }}</div>
        </div>
      }

      <!-- ROW 10: Next 24 Hr Operation (full width) -->
      @if (d.next24HrOperation) {
        <div class="cell cell--next24">
          <div class="op-header">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span class="op-header__label">Next 24 Hr Operation</span>
          </div>
          <div class="op-text op-text--expandable">{{ d.next24HrOperation }}</div>
        </div>
      }
    </div>
  </div>
}

```

---

## `src/app/features/presentation/misc-pres-well-data/misc-pres-well-data.component.scss`

```scss
// ── Outer card wrapper ─────────────────────────────────────────────────────────
.misc-card {
  padding: 12px;
  box-sizing: border-box;
  container-type: inline-size;
  container-name: misc;
  font-family: var(--font-sans);
}

// ── 2-column grid ─────────────────────────────────────────────────────────────
.misc-grid {
  display: grid;
  grid-template-columns: 1.25fr 1fr;
  gap: clamp(7px, 1.8cqi, 14px);
  width: 100%;
}

@container misc (max-width: 300px) {
  .misc-grid {
    grid-template-columns: 1fr;
  }

  .cell--full {
    grid-column: 1;
  }
}

.stack-cell {
  display: grid;
  gap: clamp(7px, 1.8cqi, 14px);
  min-width: 0;
}

// ── Base cell ─────────────────────────────────────────────────────────────────
.cell {
  border-radius: clamp(4px, 2.5cqi, 14px);
  padding: clamp(8px, 2.7cqi, 20px) clamp(9px, 3.2cqi, 24px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
  position: relative;
  border: 1px solid var(--border);
  min-height: clamp(58px, 16cqi, 104px);
}

// ── Cell color variants ────────────────────────────────────────────────────────

.cell--well-name {
  background: linear-gradient(135deg, #2563eb 0%, #60a5fa 100%);
  border: none;
  color: #fff;
  min-height: clamp(70px, 15cqi, 104px);
}

.cell--rig-info {
  background: linear-gradient(135deg, #2563eb 0%, #60a5fa 100%);
  border: none;
  color: #fff;
  min-height: clamp(70px, 15cqi, 104px);
}

.cell--full {
  grid-column: 1 / -1;
}

.cell--spud {
  background: linear-gradient(135deg, #2563eb 0%, #60a5fa 100%);
  border: none;
  color: #fff;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: clamp(4px, 1.5cqi, 10px);
}

.spud-icon {
  width: clamp(28px, 8cqi, 50px);
  height: clamp(28px, 8cqi, 50px);
  border-radius: clamp(3px, 1.5cqi, 10px);
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg {
    width: clamp(16px, 4.5cqi, 30px);
    height: clamp(16px, 4.5cqi, 30px);
  }
}

.spud-value {
  font-size: clamp(17px, 4.8cqi, 28px);
  font-weight: 900;
  color: #fff;
  line-height: 1.1;
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cell--aquifer {
  background: linear-gradient(135deg, #2563eb 0%, #60a5fa 100%);
  border: none;
  color: #fff;
  display: flex;
  //flex-direction: row;
  align-items: center;
  gap: clamp(4px, 1.5cqi, 10px);
  padding: clamp(9px, 2.7cqi, 18px) clamp(10px, 3.2cqi, 22px);
}

.cell--status {
  background: linear-gradient(135deg, #2563eb 0%, #60a5fa 100%);
  border: none;
  color: #fff;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: clamp(4px, 1.5cqi, 10px);
}

.cell--days {
  background: linear-gradient(135deg, #2563eb 0%, #60a5fa 100%);
  border: none;
  color: #fff;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: clamp(4px, 1.5cqi, 10px);
}

.cell--gauges {
  background: var(--bg-card, #fff);
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-around;
  gap: clamp(4px, 1.5cqi, 10px);
  padding: clamp(6px, 2cqi, 14px) clamp(4px, 1.5cqi, 12px);
}

.cell--bi {
  background: linear-gradient(135deg, #2563eb 0%, #60a5fa 100%);
  border: none;
  color: #fff;
  align-items: center;
  text-align: center;
  justify-content: center;
  gap: clamp(1px, 0.5cqi, 3px);
}

.cell--feet {
  background: linear-gradient(135deg, #2563eb 0%, #60a5fa 100%);
  border: none;
  color: #fff;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.cell--prev {
  background: linear-gradient(135deg, #2563eb 0%, #60a5fa 100%);
  border: none;
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: clamp(3px, 1cqi, 8px);
}

.cell--depth {
  background: linear-gradient(135deg, #2563eb 0%, #60a5fa 100%);
  border: none;
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: clamp(3px, 1cqi, 8px);
}

.cell--next {
  background: linear-gradient(135deg, #2563eb 0%, #60a5fa 100%);
  border: none;
  color: #fff;
  display: flex;
  flex-direction: row;
  align-items: center;
 // gap: clamp(6px, 1.8cqi, 12px);
}

.next-well__icon {
  flex-shrink: 0;
  width: clamp(32px, 9cqi, 58px);
  height: clamp(32px, 9cqi, 58px);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: clamp(18px, 5cqi, 34px);
    height: clamp(18px, 5cqi, 34px);
  }
}

.next-well__body {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.cell--next-kpi {
  background: linear-gradient(135deg, #2563eb 0%, #60a5fa 100%);
  border: none;
  color: #fff;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: clamp(4px, 1.5cqi, 10px);
  min-height: clamp(60px, 14cqi, 92px);

  &.cell--kpi-positive {
    background: linear-gradient(135deg, #2563eb 0%, #60a5fa 100%);
  }

  &.cell--kpi-negative {
    background: linear-gradient(135deg, #2563eb 0%, #60a5fa 100%);
  }
}

.cell--hole-size {
  background: linear-gradient(135deg, #2563eb 0%, #60a5fa 100%);
  border: none;
  color: #fff;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: clamp(6px, 1.8cqi, 12px);
  min-height: clamp(60px, 14cqi, 92px);
}

.hole-size__icon {
  flex-shrink: 0;
  width: clamp(28px, 8cqi, 50px);
  height: clamp(28px, 8cqi, 50px);
  border-radius: clamp(3px, 1.5cqi, 10px);
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: clamp(16px, 4.5cqi, 30px);
    height: clamp(16px, 4.5cqi, 30px);
  }
}

.hole-size__body {
  display: flex;
  flex-direction: column;
  min-width: 0;

  .cell__label-light {
    white-space: normal;
    line-height: 1.2;
  }
}

.hole-size__value {
  font-size: clamp(18px, 5.4cqi, 34px);
  font-weight: 900;
  color: #fff;
  line-height: 1.1;
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

// ── Text helpers ───────────────────────────────────────────────────────────────

.cell__label {
  font-size: clamp(14px, 4.1cqi, 23px);
  font-weight: 900;
  color: rgba(255, 255, 255, 0.92);
  letter-spacing: 0;
  margin-bottom: clamp(2px, 0.6cqi, 6px);
  line-height: 1.35;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cell__label--dark {
  color: rgba(255, 255, 255, 0.92);
  font-size: clamp(14px, 4.1cqi, 23px);
  font-weight: 900;
  letter-spacing: 0;
  line-height: 1.35;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cell__label-light {
  font-size: clamp(14px, 4.1cqi, 23px);
  font-weight: 900;
  color: rgba(255, 255, 255, 0.9);
  letter-spacing: 0;
  margin-bottom: clamp(1px, 0.5cqi, 4px);
  line-height: 1.35;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cell__name {
  font-size: clamp(21px, 6.2cqi, 38px);
  font-weight: 900;
  color: #fff;
  line-height: 1.25;
  margin-bottom: clamp(2px, 0.5cqi, 4px);
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cell__sub {
  font-size: clamp(15px, 4.3cqi, 25px);
  font-weight: 900;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

// ── Aquifer cell ───────────────────────────────────────────────────────────────
.aquifer-drop {
  width: clamp(34px, 8cqi, 54px);
  height: clamp(34px, 8cqi, 54px);
  flex-shrink: 0;
}

.aquifer-content {
  display: flex;
  align-items: center;
  gap: clamp(6px, 1.5cqi, 12px);
  min-width: 0;
}

.aquifer-logo {
  width: clamp(28px, 7cqi, 48px);
  height: auto;
  flex-shrink: 0;
}

.aquifer-name {
  font-size: clamp(18px, 5.2cqi, 32px);
  font-weight: 900;
  color: #fff;
  line-height: 1.35;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
  flex: 1;
}

// ── Status cell ────────────────────────────────────────────────────────────────
.status-left {
  display: flex;
  flex-direction: column;
  gap: clamp(2px, 0.8cqi, 5px);
  min-width: 0;
}

.status-value {
  font-size: clamp(20px, 5.2cqi, 32px);
  font-weight: 900;
  color: #fff;
  line-height: 1.35;
  white-space: nowrap;
}

.status-gear {
  width: clamp(36px, 9cqi, 56px);
  height: clamp(36px, 9cqi, 56px);
  border-radius: 50%;
  //background: linear-gradient(135deg, #0ea5e9, #2563eb);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  //box-shadow: 0 4px 10px rgba(14, 165, 233, 0.3);

  svg {
    width: clamp(20px, 5cqi, 34px);
    height: clamp(20px, 5cqi, 34px);
  }
}

// ── Days cell ──────────────────────────────────────────────────────────────────
.days-cal {
  width: clamp(28px, 8cqi, 50px);
  height: clamp(28px, 8cqi, 50px);
  border-radius: clamp(3px, 1.5cqi, 10px);
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg {
    width: clamp(16px, 4.5cqi, 30px);
    height: clamp(16px, 4.5cqi, 30px);
  }
}

.days-value {
  font-size: clamp(18px, 5.6cqi, 34px);
  font-weight: 900;
  color: #fff;
  line-height: 1.1;
  margin-top: 2px;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

// ── Gauge internals ────────────────────────────────────────────────────────────
.gauge {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(3px, 1cqi, 7px);
}

.gauge__label {
  font-size: clamp(15px, 3.8cqi, 21px);
  font-weight: 900;
  color: #475569;
  text-align: center;
  line-height: 1.35;
  letter-spacing: 0;
  white-space: nowrap;
}

.gauge__ring {
  width: clamp(54px, 13cqi, 78px);
  height: clamp(54px, 13cqi, 78px);
  border-radius: 50%;
  border: clamp(2px, 0.6cqi, 3px) solid #0ea5e9;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(24px, 5.8cqi, 36px);
  font-weight: 900;
  color: #1e3a8a;
  box-shadow: inset 0 0 0 4px rgba(14, 165, 233, 0.1),
              0 0 0 1px rgba(14, 165, 233, 0.15);
  background: #fff;
}

// ── BI cell ────────────────────────────────────────────────────────────────────
.bi-num {
  font-size: clamp(22px, 7cqi, 42px);
  font-weight: 900;
  color: #fff;
  line-height: 1.08;
}

.bi-label {
  font-size: clamp(13px, 3.6cqi, 20px);
  font-weight: 900;
  color: rgba(255, 255, 255, 0.9);
  letter-spacing: 0;
}

.bi-well {
  font-size: clamp(16px, 4.4cqi, 26px);
  font-weight: 900;
  color: #fff;
  margin-top: 2px;
  line-height: 1.4;
  word-break: break-word;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

// ── Feet cell ──────────────────────────────────────────────────────────────────
.feet-left {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.feet-value {
  font-size: clamp(24px, 8cqi, 48px);
  font-weight: 900;
  color: #fff;
  line-height: 1.05;
  margin-bottom: 2px;
  white-space: nowrap;
}

.feet-icon {
  flex-shrink: 0;

  svg {
    width: clamp(32px, 9cqi, 58px);
    height: clamp(32px, 9cqi, 58px);
    opacity: 0.85;
  }
}

// ── Depth cell ─────────────────────────────────────────────────────────────────
.depth-labels {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: clamp(4px, 1cqi, 8px);
  flex-shrink: 0;
  min-width: 0;
}

.depth-value {
  font-size: clamp(24px, 7.2cqi, 42px);
  font-weight: 900;
  color: #fff;
  letter-spacing: 0;
  line-height: 1.05;
  width: 100%;
  min-width: max-content;
  overflow: visible;
  text-overflow: clip;
  white-space: nowrap;
}

.next-kpi__icon {
  width: clamp(28px, 8cqi, 50px);
  height: clamp(28px, 8cqi, 50px);
  border-radius: clamp(3px, 1.5cqi, 10px);
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg {
    width: clamp(16px, 4.5cqi, 30px);
    height: clamp(16px, 4.5cqi, 30px);
  }
}

.next-kpi__content {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.next-kpi__days {
  font-size: clamp(22px, 5.4cqi, 34px);
  font-weight: 900;
  color: #fff;
  line-height: 1.1;
  margin-top: 2px;
  white-space: nowrap;
}

.next-kpi__days--positive {
  color: #bbf7d0;
}

.next-kpi__days--negative {
  color: #fecaca;
}

.next-kpi__stats {
  display: flex;
  align-items: center;
  gap: clamp(8px, 1.8cqi, 14px);
  margin-top: clamp(3px, 0.8cqi, 6px);
  flex-wrap: wrap;
}

.next-kpi__stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.next-kpi__stat-label {
  font-size: clamp(13px, 3.6cqi, 20px);
  font-weight: 900;
  color: rgba(255, 255, 255, 0.78);
  letter-spacing: 0;
  white-space: nowrap;
}

.next-kpi__stat-value {
  font-size: clamp(17px, 5cqi, 30px);
  font-weight: 900;
  color: #fff;
  line-height: 1.15;
  white-space: nowrap;
}

// ── Previous / Next well text ─────────────────────────────────────────────────
.well-name-val {
  font-size: clamp(20px, 5.6cqi, 34px);
  font-weight: 900;
  color: #fff;
  margin-top: 4px;
  line-height: 1.35;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  word-break: break-word;
}

// ── ROP cell ───────────────────────────────────────────────────────────────────
.cell--rop {
  background: linear-gradient(135deg, #2563eb 0%, #60a5fa 100%);
  border: none;
  color: #fff;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.rop-value {
  font-size: clamp(22px, 7cqi, 42px);
  font-weight: 900;
  color: #fff;
  line-height: 1.2;
  white-space: nowrap;
}

.feet-icon mat-icon {
  font-size: clamp(32px, 9cqi, 58px);
  width: clamp(32px, 9cqi, 58px);
  height: clamp(32px, 9cqi, 58px);
  color: #fff;
  opacity: 0.85;
}

// ── Operation summary & Next 24 Hr (full-width) ───────────────────────────────
.cell--op-summary {
  grid-column: 1 / -1;
  background: var(--bg-card, #fff);
  min-height: clamp(72px, 17cqi, 116px);
  gap: clamp(3px, 1cqi, 7px);
}

.cell--next24 {
  grid-column: 1 / -1;
  background: var(--bg-surface, #f1f5f9);
  min-height: clamp(72px, 17cqi, 116px);
  gap: clamp(3px, 1cqi, 7px);
  border: 1px solid var(--border);
}

.op-header {
  display: flex;
  align-items: center;
  gap: clamp(4px, 1.2cqi, 7px);

  svg {
    width: clamp(18px, 4cqi, 28px);
    height: clamp(18px, 4cqi, 28px);
    flex-shrink: 0;
    color: #0ea5e9;
  }
}

.op-header__label {
  font-size: clamp(16px, 4.2cqi, 24px);
  font-weight: 900;
  color: #334155;
  letter-spacing: 0;
  white-space: nowrap;
}

.op-text {
  font-size: clamp(17px, 4.2cqi, 24px);
  font-weight: 800;
  color: var(--text-primary, #1e293b);
  line-height: 1.6;
  word-break: break-word;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
}

// Full text, no truncation — scrolls internally once it exceeds max-height
.op-text--expandable {
  display: block;
  -webkit-line-clamp: unset;
  line-clamp: unset;
  -webkit-box-orient: unset;
  text-overflow: unset;
  max-height: clamp(120px, 26cqi, 260px);
  overflow-y: auto;
}

```

---

## `src/app/features/presentation/picked-formation-tops/picked-formation-tops.component.scss`

```scss
.formation-card {
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(30, 58, 138, 0.12);
  border: 1px solid var(--border);

  &__header {
    background: #1e3a8a;
    color: #ffffff;
    font-size: clamp(22px, 2.2vw, 30px);
    font-weight: 900;
    text-align: center;
    padding: 16px 18px;
    letter-spacing: 0;
    line-height: 1.15;
  }
}

.formation-grid {
  width: 100%;

  :deep(.ag-root-wrapper) { border: none; }
  :deep(.ag-header) { border-bottom: 2px solid #1e3a8a; }
  :deep(.ag-header-cell-label) {
    align-items: center;
    justify-content: center;
  }
  :deep(.ag-header-cell-text) {
    font-size: 18px;
    font-weight: 900;
    line-height: 1.2;
    white-space: normal;
    text-align: center;
  }
  :deep(.ag-cell) {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 19px;
    font-weight: 900;
    line-height: 1.2;
    color: #0f172a;
  }
  :deep(.no-rows) { color: var(--text-secondary); font-size: 19px; font-weight: 900; padding: 24px; text-align: center; }
}

```

---

## `src/app/features/presentation/picked-formation-tops/picked-formation-tops.component.ts`

```ts
import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridOptions, themeQuartz } from 'ag-grid-community';

import { PresentationStore } from '../store/presentation.store';
import { FormationInfoViewModel } from '@models/active-wwell/active-wwell-view.model';

@Component({
  selector: 'app-picked-formation-tops',
  standalone: true,
  imports: [AgGridAngular],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './picked-formation-tops.component.html',
  styleUrl: './picked-formation-tops.component.scss',
})
export class PickedFormationTopsComponent {
  protected readonly store = inject(PresentationStore);

  private readonly blankIfInvalid = ({ value }: { value: unknown }) =>
    value !== null && value !== undefined && value !== '' && isFinite(Number(value))
      ? String(value)
      : '';

  readonly theme = themeQuartz.withParams({
    accentColor: '#2563eb',
    backgroundColor: '#ffffff',
    foregroundColor: '#1e3a8a',
    headerBackgroundColor: '#2563eb',
    headerTextColor: '#ffffff',
    headerFontSize: 18,
    headerFontWeight: 900,
    rowHoverColor: '#eff6ff',
    oddRowBackgroundColor: '#eff6ff',
    borderColor: 'transparent',
    borderRadius: 0,
    fontSize: 18,
    rowHeight: 52,
    headerHeight: 54,
    spacing: 3,
    fontFamily: 'inherit',
    cellHorizontalPaddingScale: 1.5,
  });

  readonly columnDefs: ColDef<FormationInfoViewModel>[] = [
    { headerName: 'Formation', field: 'formation', tooltipField: 'formation', flex: 1.2, minWidth: 96 },
    { headerName: 'Prognosed', field: 'prognosed', tooltipField: 'prognosed', flex: 1, minWidth: 104, valueFormatter: this.blankIfInvalid },
    {
      headerName: 'Actual Depth (ft)', field: 'actualDepth', tooltipField: 'actualDepth', flex: 1.2, minWidth: 128,
      valueFormatter: this.blankIfInvalid,
    },
  ];

  readonly gridOptions: GridOptions<FormationInfoViewModel> = {
    animateRows: true,
    suppressMovableColumns: true,
    suppressCellFocus: true,
    domLayout: 'autoHeight',
    tooltipShowDelay: 300,
    defaultColDef: { sortable: true, resizable: true, suppressHeaderMenuButton: true },
    overlayNoRowsTemplate: '<span class="no-rows">No formation tops available.</span>',
  };
}

```

---

## `src/app/features/presentation/store/presentation.store.ts`

```ts
import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { pipe, switchMap, tap } from 'rxjs';

import { IWellData } from '@models/well-design/well-data.model';
import { validateWellData } from '../../../shared/utils/well-data.validator';
import { WellLogsIndicators } from '@models/well-design/well-logs-indicators.model';
import { WellboreAnimConfig, WellboreDiagramData } from '@models/well-design/wellbore-diagram.model';
import {
    CasingInfoViewModel,
    DatabaseInfoViewModel,
    FormationInfoViewModel,
    MiscWellData,
    OffsetWaterWells,
    OperationSummaryViewModel,
    PickedFormationTops,
    WellHeaderViewModel,
    WellTestResult,
    WwellTestViewModel,
} from '@models/active-wwell/active-wwell-view.model';
import { WellName } from '@models/well-design/well-name.model';
import { DailyOperationService } from '@services/daily-operation.service';
import { NotificationService } from '@shared/components/notification/notification.service';
import { formatDateForInput, parseDateFromInput } from 'src/app/shared/utils/date.util';
import {
    selectAllFormationTops,
    selectCasingInfoViewModel,
    selectDatabaseInfoViewModel,
    selectDiagramData,
    selectDisplayDepth,
    selectFormationInfoViewModel,
    selectHasNextPage,
    selectHasPrevPage,
    selectMiscWellData,
    selectOffsetWells,
    selectOperationSummaryViewModel,
    selectPageIndexForEpANum,
    selectPagedWellNames,
    selectPickedFormations,
    selectTotalDepth,
    selectTotalPages,
    selectWaterWellTestResultsFromData,
    selectWellHeaderViewModel,
    selectWellLogsIndicators,
    selectWellLogsRemarks,
    WellLogsRemarks,
    selectWellNamesFromList,
    selectWellTestResults,
    selectWwellTestViewModel,
} from 'src/app/core/store/shared/well-data.selectors';
import { normalizeEpANum } from 'src/app/core/store/shared/well-data.state';
import { initialPresentationState, PresentationState } from './presentation.state';

export const PresentationStore = signalStore(
    withState<PresentationState>(initialPresentationState),

    withComputed(({ wellList, wellData, selectedEpANum, selectedDate, listLoading, detailLoading, error, wellNamesPage }) => {
        const wellNames = computed((): WellName[] => selectWellNamesFromList(wellList()));

        return {
            wellNames,
            pagedWellNames: computed((): WellName[] => selectPagedWellNames(wellNames(), wellNamesPage())),
            hasPrevPage: computed(() => selectHasPrevPage(wellNamesPage())),
            hasNextPage: computed(() => selectHasNextPage(wellNames(), wellNamesPage())),
            hasPrevWell: computed(() => {
                const selectedIndex = wellNames().findIndex(w => w.epANum === selectedEpANum());
                return selectedIndex > 0;
            }),
            hasNextWell: computed(() => {
                const names = wellNames();
                const selectedIndex = names.findIndex(w => w.epANum === selectedEpANum());
                return selectedIndex !== -1 && selectedIndex < names.length - 1;
            }),
            totalPages: computed(() => selectTotalPages(wellNames())),
            isDetailsLoading: computed(() => detailLoading() && wellList().length > 0),
            isInitialLoading: computed(() => listLoading() && wellList().length === 0),
            isLoaded: computed(() => selectedEpANum() !== null && wellData() !== null),
            isLoading: computed(() => listLoading() || detailLoading()),
            hasError: computed(() => error() !== null),
            errorMessage: computed(() => error() ?? ''),
            selectedWell: computed((): IWellData | null => wellData()),
            miscWellData: computed((): MiscWellData | null => selectMiscWellData(wellData())),
            diagramData: computed((): WellboreDiagramData | null => selectDiagramData(wellData())),
            pickedFormations: computed((): PickedFormationTops[] => selectPickedFormations(wellData())),
            offsetWells: computed((): OffsetWaterWells[] => selectOffsetWells(wellData())),
            wellTestResults: computed((): WellTestResult[] => selectWellTestResults(wellData())),
            wellsLogsIndicators: computed((): WellLogsIndicators | null => selectWellLogsIndicators(wellData())),
            wellsLogsRemarks: computed((): WellLogsRemarks | null => selectWellLogsRemarks(wellData())),
            waterWelltestResult: computed(() => selectWaterWellTestResultsFromData(wellData() ? [wellData()!] : [])),
            wellHeaderData: computed((): WellHeaderViewModel | null =>
                selectWellHeaderViewModel(wellData(), selectedEpANum()),
            ),
            databaseInfo: computed((): DatabaseInfoViewModel | null =>
                selectDatabaseInfoViewModel(wellData(), selectedDate()),
            ),
            operationSummary: computed((): OperationSummaryViewModel | null =>
                selectOperationSummaryViewModel(wellData()),
            ),
            formationInfo: computed((): FormationInfoViewModel | null =>
                selectFormationInfoViewModel(wellData()),
            ),
            casingInfo: computed((): CasingInfoViewModel | null =>
                selectCasingInfoViewModel(wellData()),
            ),
            hasActualWellTest: computed((): boolean => (wellData()?.EXAD_GWD_WELL_TESTS?.length ?? 0) > 0),
            wwellTest: computed((): WwellTestViewModel | null =>
                selectWwellTestViewModel(wellData()),
            ),
            totalDepth: computed((): number => selectTotalDepth(wellData())),
            displayDepth: computed((): number => selectDisplayDepth(wellData())),
            allFormationTops: computed((): FormationInfoViewModel[] => selectAllFormationTops(wellData())),
        };
    }),

    withMethods((
        store,
        svc = inject(DailyOperationService),
        notify = inject(NotificationService),
    ) => {
        const loadDetail = rxMethod<{ date: string; epANum: number }>(
            pipe(
                tap(() => patchState(store, { detailLoading: true, error: null })),
                switchMap(({ date, epANum }) =>
                    svc.getWellDetail(date, epANum).pipe(
                        tapResponse({
                            next: (wellData: IWellData) => {
                                validateWellData(wellData, String(store.selectedEpANum() ?? ''));
                                patchState(store, {
                                    wellData,
                                    detailLoading: false,
                                    animationTrigger: store.animationTrigger() + 1,
                                });
                            },
                            error: (err: Error) => {
                                patchState(store, {
                                    detailLoading: false,
                                    error: err.message ?? 'Failed to load well detail',
                                });
                            },
                        }),
                    ),
                ),
            ),
        );

        const loadListAndAutoSelect = rxMethod<{ date: string; epANumOverride: number | null }>(
            pipe(
            tap(({ date }) => patchState(store, {
                listLoading: true,
                error: null,
                selectedDate: parseDateFromInput(date),
                // Keep wellData and selectedEpANum alive so components stay stable during load
                })),
                switchMap(({ date, epANumOverride }) =>
                    svc.getWellList(date).pipe(
                        tapResponse({
                            next: (wellList) => {
                                const names = selectWellNamesFromList(wellList);

                                if (!wellList.length) {
                                    patchState(store, { wellList: [], listLoading: false, selectedEpANum: null, wellData: null });
                                    notify.info('Data is not available for the given date');
                                    return;
                                }

                                // Honour the requested epANum when it exists in the new list.
                                // Without this, the async arrival of the list always overwrote
                                // selectedEpANum with firstEntry, discarding the URL's well param.
                                const firstEntry = names[0];
                                const targetEpANum = (epANumOverride !== null && names.some(w => w.epANum === epANumOverride))
                                    ? epANumOverride
                                    : firstEntry?.epANum ?? null;
                                if (targetEpANum === null) {
                                    patchState(store, {
                                        wellList: [],
                                        listLoading: false,
                                        selectedEpANum: null,
                                        wellData: null,
                                        error: 'No valid wells were returned for the selected date',
                                    });
                                    return;
                                }
                                const page = selectPageIndexForEpANum(names, targetEpANum, 0);

                                patchState(store, {
                                    wellList,
                                    listLoading: false,
                                    selectedEpANum: targetEpANum,
                                    wellNamesPage: page,
                                });
                                loadDetail({ date, epANum: targetEpANum });
                            },
                            error: (err: Error) => {
                                patchState(store, {
                                    listLoading: false,
                                    error: err.message ?? 'Failed to load well list',
                                });
                            },
                        }),
                    ),
                ),
            ),
        );

        const selectWellAtOffset = (offset: -1 | 1): void => {
            const names = selectWellNamesFromList(store.wellList());
            const currentIndex = names.findIndex(w => w.epANum === store.selectedEpANum());
            if (currentIndex === -1) return;

            const target = names[currentIndex + offset];
            if (!target) return;

            patchState(store, {
                selectedEpANum: target.epANum,
                wellNamesPage: selectPageIndexForEpANum(names, target.epANum, store.wellNamesPage()),
            });
            loadDetail({ date: formatDateForInput(store.selectedDate()), epANum: target.epANum });
        };

        return {
            initialize(date?: string, epANumOverride?: number): void {
                loadListAndAutoSelect({
                    date: date ?? formatDateForInput(store.selectedDate()),
                    epANumOverride: epANumOverride ?? null,
                });
            },

            selectWell(params: { epANum: number; date?: string }): void {
                const epANum = normalizeEpANum(params.epANum);
                if (epANum === null) return;

                const date = params.date ?? formatDateForInput(store.selectedDate());
                const names = selectWellNamesFromList(store.wellList());
                const page = selectPageIndexForEpANum(names, epANum, store.wellNamesPage());

                patchState(store, { selectedEpANum: epANum, wellNamesPage: page });
                loadDetail({ date, epANum });
            },

            setDate(date: string, options?: { autoSelectFirst?: boolean }): void {
                // Preserve the active well across date changes so the same well stays
                // selected if it exists in the new date's list; falls back to first if not.
                const epANumOverride = options?.autoSelectFirst ? null : store.selectedEpANum();
                loadListAndAutoSelect({ date, epANumOverride });
            },

            nextPage(): void {
                const names = selectWellNamesFromList(store.wellList());
                const maxPage = Math.max(0, selectTotalPages(names) - 1);
                const next = Math.min(store.wellNamesPage() + 1, maxPage);
                const firstOnPage = selectPagedWellNames(names, next)[0];
                patchState(store, {
                    wellNamesPage: next,
                    ...(firstOnPage ? { selectedEpANum: firstOnPage.epANum } : {}),
                });
                if (firstOnPage) {
                    loadDetail({ date: formatDateForInput(store.selectedDate()), epANum: firstOnPage.epANum });
                }
            },

            prevPage(): void {
                const names = selectWellNamesFromList(store.wellList());
                const prev = Math.max(0, store.wellNamesPage() - 1);
                const firstOnPage = selectPagedWellNames(names, prev)[0];
                patchState(store, {
                    wellNamesPage: prev,
                    ...(firstOnPage ? { selectedEpANum: firstOnPage.epANum } : {}),
                });
                if (firstOnPage) {
                    loadDetail({ date: formatDateForInput(store.selectedDate()), epANum: firstOnPage.epANum });
                }
            },

            nextWell(): void {
                selectWellAtOffset(1);
            },

            prevWell(): void {
                selectWellAtOffset(-1);
            },

            setUiError(message: string | null): void {
                patchState(store, { error: message });
            },

            loadWaterWellTestResults(): void { /* data comes from wellData */ },

            setAnimConfig(config: WellboreAnimConfig): void {
                patchState(store, { animConfig: config });
            },
        };
    }),
);

```

---

## `src/app/features/presentation/well-bore-view/renderers/casing.renderer.ts`

```ts
import { easeCubicInOut } from 'd3-ease';
import 'd3-transition';

import { ANIM, DiagramLayout } from '@models/well-design/wellbore-diagram.model';
import { ICasingIR } from '@shared/models/wwell/casing-ir.model';
import { IDrlgCsg } from '@shared/models/wwell/drlg-csg.model';
import {
  buildArrowHeadRight,
  buildCasingPath,
  buildGravelPackUPath,
  casingGradientId,
  computeCasingHalfWidth,
  openHoleHalfWidth,
} from '@shared/utils/wellbore-math.util';
import { animateLabel } from './animation.helpers';
import { getCasingTier, resolveCompletionTopDepth } from './wellbore-depth.helpers';
import { resolveLiners, renderLiners } from './liner.renderer';
import { DefsSel, DepthScale, GSel, ResolvedAnimation } from './wellbore-renderer.types';

export interface RenderCasingElementsOptions {
  readonly rootG: GSel;
  readonly defsEl: DefsSel;
  readonly layout: DiagramLayout;
  readonly casings: ICasingIR[];
  readonly drlgCasings: IDrlgCsg[];
  readonly centerX: number;
  readonly scale: DepthScale;
  readonly casingsStart: number;
  readonly linersStart: number;
  readonly gravelStart: number;
  readonly labelsStart: number;
  readonly openHoleHalfWidthPx: number;
  readonly animation: ResolvedAnimation;
}

export function renderCasingElements(options: RenderCasingElementsOptions): void {
  const { casings, drlgCasings, layout, rootG, defsEl, centerX, scale, linersStart, labelsStart, animation } = options;
  const liners = resolveLiners(casings, drlgCasings, layout);
  const lastCasingBotDepth = resolveLastCasingBotDepth(casings, drlgCasings);

  renderCasings(options);
  renderLiners({ rootG, defsEl, layout, liners, centerX, scale, linersStart, labelsStart, animation, lastCasingBotDepth });
  renderCasingLabels(options);
}

function resolveLastCasingBotDepth(casings: ICasingIR[], drlgCasings: IDrlgCsg[]): number {
  // Find the deepest non-liner casing shoe — that is the 13 3/8" (or innermost casing) shoe
  if (casings.length === 0) {
    // drlgCasings only: wCsgBotDpth is the parent casing shoe; pick the shallowest
    // non-zero value that represents the innermost casing (smallest wCsgBotDpth among actual casing records)
    const casingOnly = drlgCasings.filter(d => !d.wLnrOdSz && d.wCsgBotDpth > 0);
    if (casingOnly.length > 0) {
      return Math.max(...casingOnly.map(d => d.wCsgBotDpth));
    }
    // fallback: deepest wCsgBotDpth across all records
    return Math.max(...drlgCasings.map(d => d.wCsgBotDpth).filter(v => v > 0), 0);
  }

  const nonLiners = casings.filter(c => c.csgType !== 'Liner');
  if (nonLiners.length === 0) return 0;

  // Pick the non-liner casing with the deepest shoe (largest depth value)
  const deepest = nonLiners.reduce((max, c) => c.csgDepth > max.csgDepth ? c : max, nonLiners[0]);
  const actual = drlgCasings.find(d => d.wCsgOdSz === deepest.csgSize);
  return (actual?.wCsgBotDpth ?? 0) > 0 ? actual!.wCsgBotDpth : deepest.csgDepth;
}

function renderCasings({
  rootG,
  defsEl,
  layout,
  casings,
  drlgCasings,
  centerX,
  scale,
  casingsStart,
  gravelStart,
  openHoleHalfWidthPx,
}: RenderCasingElementsOptions): void {
  if (casings.length === 0) {
    renderCasingsFromActual({ rootG, defsEl, layout, drlgCasings, centerX, scale, casingsStart });
    return;
  }

  const { baseHalfWidth, halfWidthIncrement, shoeCurveOffset } = layout;
  const completionTopPx = scale(resolveCompletionTopDepth(casings, drlgCasings));

  casings.forEach((csg, i) => {
    if (csg.csgType === 'Liner') return;
    const tier = getCasingTier(csg, casings);
    const hw = computeCasingHalfWidth(tier, baseHalfWidth, halfWidthIncrement);
    const isConductor = csg.csgType.toLowerCase() === 'conductor';
    const isGP = csg.csgType === 'Gravel Pack';
    const actualCsg = drlgCasings.find(d => d.wCsgOdSz === csg.csgSize) ?? null;
    const hasActual = actualCsg !== null && actualCsg.wCsgBotDpth > 0;
    const displayDepth = hasActual ? actualCsg!.wCsgBotDpth : csg.csgDepth;
    const bottomPx = scale(displayDepth);
    const clipId = `dyn-casing-clip-${i}`;
    const animOrder = casings.length - 1 - i;
    const delay = animOrder * ANIM.CASING_STAGGER;
    const gpInnerHW = computeCasingHalfWidth(0, layout.baseHalfWidth, layout.halfWidthIncrement);
    const gpLsHW = Math.min(gpInnerHW, openHoleHalfWidthPx) - layout.linerScreenInset;
    const gpMaxOuter = openHoleHalfWidthPx - layout.gpScreenGap;
    const gpAnnulusWidth = Math.max(0, (gpMaxOuter - gpLsHW) * layout.gpFillRatio);
    const gpOuterEdge = gpLsHW + gpAnnulusWidth;
    const gpAnnulusCenter = gpLsHW + gpAnnulusWidth / 2;
    const clipRadius = isGP ? gpOuterEdge : openHoleHalfWidth(hw) + 20;

    const clipRect = defsEl
      .append('clipPath')
      .attr('class', 'dyn-clip')
      .attr('id', clipId)
      .append('rect')
      .attr('x', centerX - clipRadius - (isGP ? 0 : 15))
      .attr('y', isGP ? completionTopPx : -5)
      .attr('width', clipRadius * 2 + (isGP ? 0 : 30))
      .attr('height', 0);

    if (isGP) {
      const gravelBottomPx = scale(csg.csgDepth);
      rootG.append('path')
        .attr('class', 'gravelHole')
        .attr('d', buildGravelPackUPath(centerX, gpAnnulusCenter, completionTopPx, gravelBottomPx))
        .attr('stroke', 'url(#gravelpattern)')
        .attr('stroke-width', String(gpAnnulusWidth))
        .style('fill', 'none')
        .attr('clip-path', `url(#${clipId})`);
      clipRect.transition()
        .delay(gravelStart)
        .duration(ANIM.GRAVEL_DURATION)
        .ease(easeCubicInOut)
        .attr('height', gravelBottomPx - completionTopPx);
      return;
    }

    const casingD = buildCasingPath(centerX, hw, 0, bottomPx, shoeCurveOffset);

    if (hasActual) {
      rootG.append('path')
        .attr('class', 'casing')
        .attr('d', casingD)
        .attr('clip-path', `url(#${clipId})`)
        .attr('fill', 'url(#actualCasingGradient)')
        .attr('stroke', '#000000')
        .attr('stroke-width', '5')
        .style('opacity', 0.78);
    } else {
      const plannedFillGrad = isConductor
        ? 'url(#mainGradient)'
        : `url(#${casingGradientId(csg.csgType)})`;
      rootG.append('path')
        .attr('class', 'casing')
        .attr('d', casingD)
        .attr('clip-path', `url(#${clipId})`)
        .attr('fill', plannedFillGrad)
        .attr('stroke', '#000000')
        .attr('stroke-width', '5')
        .style('opacity', isConductor ? 0.75 : 0.40);
    }

    clipRect.transition()
      .delay(casingsStart + delay)
      .duration(ANIM.CASING_DURATION)
      .ease(easeCubicInOut)
      .attr('height', bottomPx + shoeCurveOffset + 20);
  });
}

function uniqueCasingsByOd(drlgCasings: IDrlgCsg[]): IDrlgCsg[] {
  const map = new Map<string, IDrlgCsg>();
  for (const d of drlgCasings) {
    if (d.wCsgBotDpth <= 0) continue;
    const existing = map.get(d.wCsgOdSz);
    if (!existing || d.wCsgBotDpth > existing.wCsgBotDpth) {
      map.set(d.wCsgOdSz, d);
    }
  }
  return [...map.values()].sort((a, b) => b.wCsgBotDpth - a.wCsgBotDpth);
}

function renderCasingsFromActual({
  rootG,
  defsEl,
  layout,
  drlgCasings,
  centerX,
  scale,
  casingsStart,
}: Pick<RenderCasingElementsOptions, 'rootG' | 'defsEl' | 'layout' | 'drlgCasings' | 'centerX' | 'scale' | 'casingsStart'>): void {
  const { baseHalfWidth, halfWidthIncrement, shoeCurveOffset } = layout;
  const unique = uniqueCasingsByOd(drlgCasings);

  unique.forEach((actual, i) => {
    const hw = computeCasingHalfWidth(i, baseHalfWidth, halfWidthIncrement);
    const animOrder = unique.length - 1 - i;
    const delay = animOrder * ANIM.CASING_STAGGER;
    const bottomPx = scale(actual.wCsgBotDpth);
    const clipId = `dyn-casing-clip-actual-${i}`;
    const clipRadius = openHoleHalfWidth(hw) + 20;
    const clipRect = defsEl.append('clipPath')
      .attr('class', 'dyn-clip').attr('id', clipId).append('rect')
      .attr('x', centerX - clipRadius - 15).attr('y', -5)
      .attr('width', clipRadius * 2 + 30).attr('height', 0);

    rootG.append('path')
      .attr('class', 'casing')
      .attr('d', buildCasingPath(centerX, hw, 0, bottomPx, shoeCurveOffset))
      .attr('clip-path', `url(#${clipId})`)
      .attr('fill', 'url(#actualCasingGradient)')
      .attr('stroke', '#000000')
      .attr('stroke-width', '5')
      .style('opacity', 0.78);

    clipRect.transition()
      .delay(casingsStart + delay).duration(ANIM.CASING_DURATION).ease(easeCubicInOut)
      .attr('height', bottomPx + shoeCurveOffset + 20);
  });
}

function renderCasingLabels({
  rootG,
  layout,
  casings,
  drlgCasings,
  centerX,
  scale,
  labelsStart,
  openHoleHalfWidthPx,
  animation,
}: RenderCasingElementsOptions): void {
  if (casings.length === 0) {
    renderCasingLabelsFromActual({ rootG, layout, drlgCasings, centerX, scale, labelsStart, animation });
    return;
  }

  const { baseHalfWidth, halfWidthIncrement, linerScreenInset, gpScreenGap, gpFillRatio } = layout;
  const gpLabelInnerHW = computeCasingHalfWidth(0, baseHalfWidth, halfWidthIncrement);
  const gpLabelLsHW = Math.min(gpLabelInnerHW, openHoleHalfWidthPx) - linerScreenInset;
  const gpLabelMaxOuter = openHoleHalfWidthPx - gpScreenGap;
  const gpLabelAnnulus = Math.max(0, (gpLabelMaxOuter - gpLabelLsHW) * gpFillRatio);
  const gpLabelOuterEdge = gpLabelLsHW + gpLabelAnnulus;

  const sortedShoeDepths = casings
    .filter(c => c.csgType !== 'Liner' && c.csgType !== 'Gravel Pack')
    .map(c => {
      const act = drlgCasings.find(d => d.wCsgOdSz === c.csgSize) ?? null;
      return (act !== null && act.wCsgBotDpth > 0) ? act.wCsgBotDpth : c.csgDepth;
    })
    .sort((a, b) => a - b);

  casings.forEach((csg) => {
    if (csg.csgType === 'Liner') return;
    const tier = getCasingTier(csg, casings);
    const hw = computeCasingHalfWidth(tier, baseHalfWidth, halfWidthIncrement);
    const actualCsg = drlgCasings.find(d => d.wCsgOdSz === csg.csgSize) ?? null;
    const hasActual = actualCsg !== null && actualCsg.wCsgBotDpth > 0;
    const displayDepth = hasActual ? actualCsg!.wCsgBotDpth : csg.csgDepth;
    const displaySize = hasActual ? actualCsg!.wCsgOdSz : csg.csgSize;
    const shoePx = scale(displayDepth);
    const labelYPx = csg.csgType === 'Gravel Pack' ? scale(csg.csgDepth) : shoePx;
    const rEdge = csg.csgType === 'Gravel Pack'
      ? centerX + gpLabelOuterEdge
      : centerX + hw;
    const lEnd = rEdge + 26;
    const labelX = lEnd + 8;
    const lg = rootG.append('g').attr('class', 'casing-label');

    lg.append('line')
      .attr('class', 'casing-label__line')
      .attr('x1', rEdge).attr('x2', lEnd)
      .attr('y1', labelYPx).attr('y2', labelYPx);
    lg.append('path')
      .attr('class', 'casing-label__arrow')
      .attr('d', buildArrowHeadRight(lEnd, labelYPx, 6));

    if (csg.csgType === 'Gravel Pack') {
      lg.append('text')
        .attr('class', 'casing-label__primary')
        .attr('x', labelX).attr('y', labelYPx + 4)
        .text(csg.csgRemarks || 'Gravel Pack');
    } else {
      const primaryEl = lg.append('text')
        .attr('class', 'casing-label__primary')
        .attr('x', labelX).attr('y', shoePx + 4);
      if (hasActual) {
        primaryEl
          .attr('fill', '#22c55e')
          .text(`${displaySize}" ${csg.csgType} @ ${displayDepth.toLocaleString()} *`);
        lg.append('text')
          .attr('class', 'casing-label__secondary')
          .attr('x', labelX).attr('y', shoePx + 24)
          .text(`est: ${csg.csgSize}" @ ${csg.csgDepth.toLocaleString()} ft`);
      } else {
        primaryEl.text(`${csg.csgSize}" ${csg.csgType} @ ${csg.csgDepth.toLocaleString()}`);
        if (csg.csgRemarks) {
          lg.append('text')
            .attr('class', 'casing-label__secondary')
            .attr('x', labelX).attr('y', shoePx + 24)
            .text(`(${csg.csgRemarks})`);
        }
      }

      const innerDelay = labelsStart + (animation.lineStyle === 'draw' ? animation.lineDur : 0);
      const rank = sortedShoeDepths.indexOf(displayDepth);
      const innerMidY = rank > 0 ? (scale(sortedShoeDepths[rank - 1]) + shoePx) / 2 : shoePx;
      rootG.append('text')
        .attr('class', 'casing-size-inner')
        .attr('x', centerX).attr('y', innerMidY)
        .attr('text-anchor', 'middle')
        .style('opacity', 0)
        .attr('fill', hasActual ? '#0f2d1a' : '')
        .style('font-weight', hasActual ? '800' : 'normal')
        .text(`${displaySize}"`)
        .transition().delay(innerDelay).duration(animation.fadeDur).ease(easeCubicInOut)
        .style('opacity', 1);
    }

    animateLabel(lg, labelsStart, animation);
  });
}

function renderCasingLabelsFromActual({
  rootG,
  layout,
  drlgCasings,
  centerX,
  scale,
  labelsStart,
  animation,
}: Pick<RenderCasingElementsOptions, 'rootG' | 'layout' | 'drlgCasings' | 'centerX' | 'scale' | 'labelsStart' | 'animation'>): void {
  const { baseHalfWidth, halfWidthIncrement } = layout;
  const unique = uniqueCasingsByOd(drlgCasings);

  unique.forEach((actual, i) => {
    const hw = computeCasingHalfWidth(i, baseHalfWidth, halfWidthIncrement);
    const shoePx = scale(actual.wCsgBotDpth);
    const prevActual = unique[i + 1];
    const innerMidY = prevActual ? (scale(prevActual.wCsgBotDpth) + shoePx) / 2 : shoePx;
    const rEdge = centerX + hw;
    const lEnd = rEdge + 26;
    const labelX = lEnd + 8;
    const lg = rootG.append('g').attr('class', 'casing-label');

    lg.append('line').attr('class', 'casing-label__line')
      .attr('x1', rEdge).attr('x2', lEnd).attr('y1', shoePx).attr('y2', shoePx);
    lg.append('path').attr('class', 'casing-label__arrow')
      .attr('d', buildArrowHeadRight(lEnd, shoePx, 6));
    lg.append('text').attr('class', 'casing-label__primary')
      .attr('x', labelX).attr('y', shoePx + 4)
      .text(`${actual.wCsgOdSz}" Casing @ ${actual.wCsgBotDpth.toLocaleString()}`);

    rootG.append('text').attr('class', 'casing-size-inner')
      .attr('x', centerX).attr('y', innerMidY).attr('text-anchor', 'middle')
      .style('opacity', 0).text(`${actual.wCsgOdSz}"`)
      .transition().delay(labelsStart + (animation.lineStyle === 'draw' ? animation.lineDur : 0))
      .duration(animation.fadeDur).ease(easeCubicInOut).style('opacity', 1);

    animateLabel(lg, labelsStart, animation);
  });
}

```

---

## `src/app/features/presentation/well-bore-view/renderers/completion.renderer.ts`

```ts
import { easeCubicInOut } from 'd3-ease';
import 'd3-transition';

import { ANIM, DiagramLayout, WellboreDiagramData } from '@models/well-design/wellbore-diagram.model';
import {
  buildArrowHeadLeft,
  buildArrowHeadRight,
  buildGravelPackUPath,
  buildOpenHolePath,
  buildScreenHanger,
  computeCasingHalfWidth,
} from '@shared/utils/wellbore-math.util';
import { animateLabel } from './animation.helpers';
import {
  resolveCompletionBottomDepth,
  resolveCompletionBottomPx,
  resolveCompletionTopDepth,
  resolveCompletionTopPx,
  resolveShoeDepth,
  resolveOhHalfWidth,
  shouldRenderGravelPack,
  shouldRenderLinerScreen,
  shouldRenderOpenHole,
  shouldRenderPrePerforatedLiner,
} from './wellbore-depth.helpers';
import { DefsSel, DepthScale, GSel, ResolvedAnimation } from './wellbore-renderer.types';

export interface RenderCompletionElementsOptions {
  readonly rootG: GSel;
  readonly defsEl: DefsSel;
  readonly layout: DiagramLayout;
  readonly data: WellboreDiagramData;
  readonly centerX: number;
  readonly scale: DepthScale;
  readonly ohStart: number;
  readonly ohLabelStart: number;
  readonly hangerStart: number;
  readonly animation: ResolvedAnimation;
}

export function renderCompletionElements(options: RenderCompletionElementsOptions): void {
  renderOpenHoleAndScreen(options);
  renderGravelPackDesign(options);
  renderPrePerforatedLiner(options);
}

function renderOpenHoleAndScreen({
  rootG,
  defsEl,
  layout,
  data,
  centerX,
  scale,
  ohStart,
  ohLabelStart,
  animation,
}: RenderCompletionElementsOptions): void {
  if (!data.casings.length) return;

  const { wellDesign } = data;
  const shouldDrawOH = shouldRenderOpenHole(wellDesign);
  // skip the old liner-screen path when drlg liners are present — liner.renderer handles those
  const hasDrlgLiners = data.drlgCasings.some(d => d.wLnrOdSz && (d.wLnrBotDepth ?? 0) > 0);
  const shouldDrawLS = !hasDrlgLiners && shouldRenderLinerScreen(wellDesign);
  if (!shouldDrawOH && !shouldDrawLS) return;

  const { baseHalfWidth, halfWidthIncrement, linerScreenInset, gpScreenGap } = layout;
  const innerHW = computeCasingHalfWidth(0, baseHalfWidth, halfWidthIncrement);
  const ohHW = resolveOhHalfWidth(data, layout);
  const screenHW = Math.min(innerHW, ohHW) - linerScreenInset;
  const liner = data.casings.find(c => c.csgType === 'Liner');
  const gpCasing = data.casings.find(c => c.csgType === 'Gravel Pack');
  const shoePx = resolveCompletionTopPx(data.casings, data.drlgCasings, scale);
  const completionBottomDepth = resolveCompletionBottomDepth(data);
  const completionBottomPx = scale(completionBottomDepth);
  const hasGP = shouldRenderGravelPack(wellDesign) || !!gpCasing;
  const gpBottomPx = gpCasing ? Math.min(scale(gpCasing.csgDepth), completionBottomPx) : completionBottomPx;
  const screenBottomPx = wellDesign
    ? (shouldDrawLS && hasGP ? gpBottomPx - gpScreenGap : completionBottomPx)
    : (liner ? scale(liner.csgDepth) : completionBottomPx - 15);
  const clipHW = shouldDrawOH ? ohHW : screenHW;
  const clipId = 'dyn-oh-clip';
  const clipRect = defsEl.append('clipPath').attr('class', 'dyn-clip').attr('id', clipId).append('rect')
    .attr('x', centerX - clipHW - 15).attr('y', shoePx - 5).attr('width', clipHW * 2 + 30).attr('height', 0);

  if (shouldDrawOH) {
    rootG.append('path').attr('class', 'open-hole')
      .attr('d', buildOpenHolePath(centerX, ohHW, shoePx, completionBottomPx))
      .attr('clip-path', `url(#${clipId})`);
  }

  if (shouldDrawLS) {
    rootG.append('path').attr('class', 'liner-screen')
      .attr('d', buildOpenHolePath(centerX, screenHW, shoePx, screenBottomPx))
      .attr('clip-path', `url(#${clipId})`);
  }

  clipRect.transition().delay(ohStart).duration(ANIM.OH_DURATION).ease(easeCubicInOut).attr('height', completionBottomPx - shoePx + 5);

  if (shouldDrawOH) {
    const ohLabel = wellDesign?.ohRemarks ?? '8 1/2" Open Hole';
    const ohLY = shoePx + (completionBottomPx - shoePx) * 0.2;
    const ohLG = rootG.append('g').attr('class', 'open-hole-label');
    const ohLineX1 = centerX - ohHW;
    const ohLineX2 = centerX - ohHW - 33;

    ohLG.append('line')
      .attr('class', 'oh-label-line')
      .attr('x1', ohLineX1).attr('x2', ohLineX2).attr('y1', ohLY).attr('y2', ohLY);
    ohLG.append('path')
      .attr('class', 'oh-label-arrow')
      .attr('d', buildArrowHeadLeft(ohLineX2, ohLY, 6));
    ohLG.append('text')
      .attr('class', 'open-hole-text')
      .attr('x', ohLineX2 - 6).attr('y', ohLY + 4).attr('text-anchor', 'end').text(ohLabel);

    animateLabel(ohLG, ohLabelStart, animation);
  }

  if (shouldDrawLS) {
    const shoeDepth = resolveCompletionTopDepth(data.casings, data.drlgCasings);
    const fallbackFt = liner ? liner.csgDepth - shoeDepth : completionBottomDepth - shoeDepth;
    const screenLabel = wellDesign?.lsRemarks ?? (liner?.csgRemarks ?? `+/- ${fallbackFt.toLocaleString()} ft of Screen`);
    const scrDelay = ohLabelStart + ANIM.OVERLAY_FADE + ANIM.SEQ_GAP;
    const scrLG = rootG.append('g').attr('class', 'screen-label');
    const scrX1 = centerX + screenHW;
    const scrX2 = centerX + screenHW + 33;

    scrLG.append('line')
      .attr('class', 'screen-label-line')
      .attr('x1', scrX1).attr('x2', scrX2).attr('y1', screenBottomPx).attr('y2', screenBottomPx);
    scrLG.append('path')
      .attr('d', buildArrowHeadRight(scrX2, screenBottomPx, 6));
    scrLG.append('text')
      .attr('class', 'screen-label-text')
      .attr('x', scrX2 + 6).attr('y', screenBottomPx + 4).text(screenLabel);

    animateLabel(scrLG, scrDelay, animation);
  }
}

function renderGravelPackDesign({
  rootG,
  defsEl,
  layout,
  data,
  centerX,
  scale,
  ohStart,
  ohLabelStart,
  animation,
}: RenderCompletionElementsOptions): void {
  const wellDesign = data.wellDesign;
  if (!wellDesign || !shouldRenderGravelPack(wellDesign) || !data.casings.length) return;

  const { baseHalfWidth, halfWidthIncrement, linerScreenInset, gpScreenGap, gpFillRatio } = layout;
  const innerHW = computeCasingHalfWidth(0, baseHalfWidth, halfWidthIncrement);
  const ohHW = resolveOhHalfWidth(data, layout);
  const lsHW = Math.min(innerHW, ohHW) - linerScreenInset;
  const gpMaxOuter = ohHW - gpScreenGap;
  const annulusWidth = Math.max(0, (gpMaxOuter - lsHW) * gpFillRatio);
  const gpOuterEdge = lsHW + annulusWidth;
  const annulusCenter = lsHW + annulusWidth / 2;
  const startDepthPx = resolveCompletionTopPx(data.casings, data.drlgCasings, scale);
  const completionBottomPx = resolveCompletionBottomPx(data, scale);

  const clipId = 'dyn-gp-design-clip';
  const clipRect = defsEl.append('clipPath').attr('class', 'dyn-clip').attr('id', clipId).append('rect')
    .attr('x', centerX - gpOuterEdge).attr('y', startDepthPx)
    .attr('width', gpOuterEdge * 2).attr('height', 0);

  rootG.append('path')
    .attr('class', 'gravelHole')
    .attr('d', buildGravelPackUPath(centerX, annulusCenter, startDepthPx, completionBottomPx))
    .attr('stroke', 'url(#gravelpattern)')
    .attr('stroke-width', String(annulusWidth))
    .style('fill', 'none')
    .attr('clip-path', `url(#${clipId})`);

  clipRect.transition()
    .delay(ohStart)
    .duration(ANIM.GRAVEL_DURATION)
    .ease(easeCubicInOut)
    .attr('height', completionBottomPx - startDepthPx);

  const labelY = startDepthPx + (completionBottomPx - startDepthPx) * 0.5;
  const rEdge = centerX + gpOuterEdge;
  const lEnd = rEdge + 26;
  const lg = rootG.append('g').attr('class', 'gp-design-label');

  lg.append('line')
    .attr('class', 'screen-label-line')
    .attr('x1', rEdge).attr('x2', lEnd).attr('y1', labelY).attr('y2', labelY);
  lg.append('path').attr('d', buildArrowHeadRight(lEnd, labelY, 6));
  lg.append('text')
    .attr('class', 'screen-label-text')
    .attr('x', lEnd + 6).attr('y', labelY + 4).text(wellDesign.gpRemarks);

  animateLabel(lg, ohLabelStart, animation);
}

function renderPrePerforatedLiner({
  rootG,
  defsEl,
  layout,
  data,
  centerX,
  scale,
  ohStart,
  ohLabelStart,
  animation,
}: RenderCompletionElementsOptions): void {
  const wellDesign = data.wellDesign;
  if (!wellDesign || !shouldRenderPrePerforatedLiner(wellDesign)) return;

  const { openHoleHwMargin } = layout;
  const ohHW = resolveOhHalfWidth(data, layout);
  const perforationGap = Math.max(12, Math.min(20, openHoleHwMargin * 0.65));
  const prePerfHW = Math.max(10, ohHW - perforationGap);
  const topPx = resolveCompletionTopPx(data.casings, data.drlgCasings, scale);
  const completionBottomPx = resolveCompletionBottomPx(data, scale);
  const perfTopPx = Math.min(topPx + perforationGap, completionBottomPx);
  const perfBottomPx = Math.max(perfTopPx, completionBottomPx - perforationGap);

  const clipId = 'dyn-perf-clip';
  const clipRect = defsEl.append('clipPath').attr('class', 'dyn-clip').attr('id', clipId).append('rect')
    .attr('x', centerX - prePerfHW - 6).attr('y', perfTopPx - 5)
    .attr('width', (prePerfHW + 6) * 2).attr('height', 0);

  const perfGroup = rootG.append('g')
    .attr('class', 'perf-wall-group')
    .attr('clip-path', `url(#${clipId})`);
  const perfLeftX = centerX - prePerfHW;
  const perfRightX = centerX + prePerfHW;
  const leftWallD = `M${perfLeftX},${perfTopPx} L${perfLeftX},${perfBottomPx}`;
  const bottomWallD = `M${perfLeftX},${perfBottomPx} L${perfRightX},${perfBottomPx}`;
  const rightWallD = `M${perfRightX},${perfTopPx} L${perfRightX},${perfBottomPx}`;

  perfGroup.append('path')
    .attr('class', 'perf-wall')
    .attr('d', leftWallD);
  perfGroup.append('path')
    .attr('class', 'perf-wall')
    .attr('d', bottomWallD);
  perfGroup.append('path')
    .attr('class', 'perf-wall')
    .attr('d', rightWallD);

  clipRect.transition()
    .delay(ohStart)
    .duration(ANIM.OH_DURATION)
    .ease(easeCubicInOut)
    .attr('height', perfBottomPx - perfTopPx + 10);

  if (!wellDesign.perforatedRemarks) return;

  const labelY = perfTopPx + (perfBottomPx - perfTopPx) * 0.7;
  const lEdge = centerX - prePerfHW;
  const lEnd = lEdge - 26;
  const perfDelay = ohLabelStart + ANIM.OVERLAY_FADE + ANIM.SEQ_GAP;
  const lg = rootG.append('g').attr('class', 'perf-label');

  lg.append('line')
    .attr('class', 'oh-label-line')
    .attr('x1', lEdge).attr('x2', lEnd).attr('y1', labelY).attr('y2', labelY);
  lg.append('path')
    .attr('class', 'oh-label-arrow')
    .attr('d', buildArrowHeadLeft(lEnd, labelY, 6));
  lg.append('text')
    .attr('class', 'open-hole-text')
    .attr('x', lEnd - 4).attr('y', labelY + 4).attr('text-anchor', 'end').text(wellDesign.perforatedRemarks);

  animateLabel(lg, perfDelay, animation);
}

export function renderScreenHanger({
  rootG,
  layout,
  data,
  centerX,
  scale,
  hangerStart,
}: RenderCompletionElementsOptions): void {
  if (!data.casings.length) return;
  // when drlg liners are present, liner.renderer draws its own hangers
  const hasDrlgLiners = data.drlgCasings.some(d => d.wLnrOdSz && (d.wLnrBotDepth ?? 0) > 0);
  if (hasDrlgLiners) return;
  const hasLiner = data.casings.some(c => c.csgType === 'Liner');
  const hasLinerScreen = shouldRenderLinerScreen(data.wellDesign);
  if (!hasLiner && !hasLinerScreen) return;

  const { baseHalfWidth, halfWidthIncrement, linerScreenInset } = layout;
  const innerHW = computeCasingHalfWidth(0, baseHalfWidth, halfWidthIncrement);
  const ohHW = resolveOhHalfWidth(data, layout);
  const screenHW = Math.min(innerHW, ohHW) - linerScreenInset;
  const hangerG = rootG.append('g').attr('class', 'screen-hangers').style('opacity', 0);

  const addHanger = (yPx: number, hw: number): void => {
    const { left, right } = buildScreenHanger(centerX, yPx, hw);
    hangerG.append('path').attr('class', 'screen-hanger').attr('stroke', '#000000').attr('stroke-width', '1.5').attr('fill', '#000000').attr('d', left);
    hangerG.append('path').attr('class', 'screen-hanger').attr('stroke', '#000000').attr('stroke-width', '1.5').attr('fill', '#000000').attr('d', right);
  };

  if (hasLiner) {
    addHanger(scale(resolveShoeDepth(data.casings, data.drlgCasings)), innerHW);
  }

  if (hasLinerScreen) {
    addHanger(scale(resolveCompletionTopDepth(data.casings, data.drlgCasings)), screenHW);
  }

  hangerG.transition().delay(hangerStart).duration(ANIM.HANGER_DURATION).ease(easeCubicInOut).style('opacity', 1);
}

```

---

## `src/app/features/presentation/well-bore-view/renderers/defs.renderer.ts`

```ts
import { DefsSel } from './wellbore-renderer.types';

interface GradientStop {
  readonly offset: string;
  readonly color: string;
}

export function renderStaticDefs(defs: DefsSel): void {
  addLinearGradient(defs, 'mainGradient', [
    { offset: '0%', color: '#1a2130' },
    { offset: '18%', color: '#4a5568' },
    { offset: '38%', color: '#a0aec0' },
    { offset: '50%', color: '#e2e8f0' },
    { offset: '62%', color: '#a0aec0' },
    { offset: '82%', color: '#4a5568' },
    { offset: '100%', color: '#1a2130' },
  ]);
  addLinearGradient(defs, 'conductorGradient', [
   { offset: '0%', color: '#1a2130' },
    { offset: '18%', color: '#4a5568' },
    { offset: '38%', color: '#a0aec0' },
    { offset: '50%', color: '#e2e8f0' },
    { offset: '62%', color: '#a0aec0' },
    { offset: '82%', color: '#4a5568' },
    { offset: '100%', color: '#1a2130' },
  ]);
  addLinearGradient(defs, 'linerGradient', [
    { offset: '0%', color: '#7b8fa8' },
    { offset: '18%', color: '#a8bcd0' },
    { offset: '38%', color: '#cdd9e5' },
    { offset: '50%', color: '#eef3f8' },
    { offset: '62%', color: '#cdd9e5' },
    { offset: '82%', color: '#a8bcd0' },
    { offset: '100%', color: '#7b8fa8' },
  ]);
  addLinearGradient(defs, 'actualCasingGradient', [
    { offset: '0%', color: '#0d3b1f' },
    { offset: '18%', color: '#15803d' },
    { offset: '38%', color: '#22c55e' },
    { offset: '50%', color: '#6ee7a0' },
    { offset: '62%', color: '#22c55e' },
    { offset: '82%', color: '#15803d' },
    { offset: '100%', color: '#0d3b1f' },
  ]);
  addLinearGradient(defs, 'actualLinerGradient', [
    { offset: '0%', color: '#0d3b1f' },
    { offset: '18%', color: '#166534' },
    { offset: '38%', color: '#16a34a' },
    { offset: '50%', color: '#4ade80' },
    { offset: '62%', color: '#16a34a' },
    { offset: '82%', color: '#166534' },
    { offset: '100%', color: '#0d3b1f' },
  ]);

  const grid = defs.append('pattern')
    .attr('id', 'gridPattern')
    .attr('patternUnits', 'userSpaceOnUse')
    .attr('width', 9).attr('height', 9);
  grid.append('rect')
    .attr('width', 9).attr('height', 9)
    .attr('fill', '#f0f0f0');
  // horizontal wire centered in tile row
  grid.append('line')
    .attr('x1', 0).attr('y1', 4.5)
    .attr('x2', 9).attr('y2', 4.5)
    .attr('stroke', '#111111')
    .attr('stroke-width', 1.8);
  // vertical wire centered in tile column
  grid.append('line')
    .attr('x1', 4.5).attr('y1', 0)
    .attr('x2', 4.5).attr('y2', 9)
    .attr('stroke', '#111111')
    .attr('stroke-width', 1.8);
  // intersection dot to simulate wire weave crossing
  grid.append('circle')
    .attr('cx', 4.5).attr('cy', 4.5).attr('r', 1.4)
    .attr('fill', '#000000');

  const gravelPattern = defs.append('pattern')
    .attr('id', 'gravelpattern')
    .attr('patternUnits', 'userSpaceOnUse')
    .attr('width', 8)
    .attr('height', 4);

  gravelPattern.append('rect')
    .attr('x', 0).attr('y', 0)
    .attr('width', 4).attr('height', 2)
    .attr('fill', '#000').attr('opacity', '1');

  gravelPattern.append('rect')
    .attr('x', 4).attr('y', 2)
    .attr('width', 4).attr('height', 2)
    .attr('fill', '#000').attr('opacity', '1');

  const dashedPattern = defs.append('pattern')
    .attr('id', 'dashed')
    .attr('patternUnits', 'userSpaceOnUse')
    .attr('width', 5).attr('height', 5);

  dashedPattern.append('image')
    .attr('href', "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScxMCcgaGVpZ2h0PScxMCc+CiAgPHJlY3Qgd2lkdGg9JzEwJyBoZWlnaHQ9JzEwJyBmaWxsPSd3aGl0ZScgLz4KICA8Y2lyY2xlIGN4PScyLjUnIGN5PScyLjUnIHI9JzIuNScgZmlsbD0nYmxhY2snLz4KPC9zdmc+");

  // radial gradient for liner top-cap inner ellipse — simulates depth looking down a hollow tube
  const linerCapGrad = defs.append('radialGradient')
    .attr('id', 'linerCapDepthGradient')
    .attr('cx', '50%').attr('cy', '50%')
    .attr('r', '50%')
    .attr('gradientUnits', 'objectBoundingBox');
  linerCapGrad.append('stop').attr('offset', '0%').attr('stop-color', '#052e16');
  linerCapGrad.append('stop').attr('offset', '45%').attr('stop-color', '#15803d');
  linerCapGrad.append('stop').attr('offset', '85%').attr('stop-color', '#4ade80');
  linerCapGrad.append('stop').attr('offset', '100%').attr('stop-color', '#166534');

  addMarker(defs, 'arrowBlack', 'var(--text-secondary)');
  addMarker(defs, 'arrowBlue', '#3CC3FF');
}

function addLinearGradient(defs: DefsSel, id: string, stops: GradientStop[]): void {
  const gradient = defs.append('linearGradient').attr('id', id);
  stops.forEach(({ offset, color }) =>
    gradient.append('stop').attr('offset', offset).attr('stop-color', color),
  );
}

function addMarker(defs: DefsSel, id: string, fill: string): void {
  defs.append('marker')
    .attr('id', id)
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 5).attr('refY', 0)
    .attr('markerWidth', 4).attr('markerHeight', 4)
    .attr('orient', 'auto')
    .append('path')
    .attr('d', 'M0,-5L10,0L0,5')
    .attr('fill', fill);
}

```

---

## `src/app/features/presentation/well-bore-view/renderers/geo-tops.renderer.ts`

```ts
import { Selection } from 'd3-selection';
import { ScaleLinear } from 'd3-scale';
import { easeBackOut, easeCubicOut } from 'd3-ease';
import 'd3-transition';

import { FormationInfoViewModel } from '@models/active-wwell/active-wwell-view.model';
import { ANIM, DiagramLayout } from '@models/well-design/wellbore-diagram.model';
import { ITopsIR } from '@shared/models/wwell/tops-ir.model';

type GSel = Selection<SVGGElement, unknown, null, undefined>;
type DepthScale = ScaleLinear<number, number>;
type LineSel = Selection<SVGLineElement, unknown, null, undefined>;
type RectSel = Selection<SVGRectElement, unknown, null, undefined>;
type TextSel = Selection<SVGTextElement, unknown, null, undefined>;

export interface RenderGeoTopsOptions {
  readonly rootG: GSel;
  readonly layout: DiagramLayout;
  readonly tops: ITopsIR[];
  readonly geoLineX: number;
  readonly scale: DepthScale;
  readonly targetAquifer: string | null;
  readonly formationTops?: FormationInfoViewModel[];
}

export function renderGeoTops({
  rootG,
  layout,
  tops,
  geoLineX,
  scale,
  targetAquifer,
  formationTops = [],
}: RenderGeoTopsOptions): void {
  const actualMap = new Map(
    formationTops
      .filter(f => {
        const n = Number(f.actualDepth);
        return f.actualDepth !== null && f.actualDepth !== undefined &&
          f.actualDepth !== '' && isFinite(n) && n > 0;
      })
      .map(f => [f.formation, Number(f.actualDepth)]),
  );

  const remarksMap = new Map(
    formationTops
      .filter(f => f.remarks?.trim())
      .map(f => [f.formation, f.remarks!.trim()]),
  );

  const sorted = [...tops].sort((a, b) => a.planTvdDepth - b.planTvdDepth);
  const hoverLayer = rootG.append('g').attr('class', 'geo-hover-targets');
  const tooltipLayer = rootG.append('g')
    .attr('class', 'geo-remark-tooltip')
    .style('opacity', 0)
    .style('pointer-events', 'none');

  const hideTooltip = (): void => {
    tooltipLayer.interrupt().transition().duration(120).style('opacity', 0);
  };

  const showTooltip = (
    yPx: number,
    formation: string,
    depth: number,
    remark: string,
    hasActual: boolean,
    isTarget: boolean,
  ): void => {
    const tooltipW = 260;
    const lineHeight = 15;
    const lines = wrapGeoRemark(remark, 32, 3);
    const tooltipH = 54 + lines.length * lineHeight;
    const tooltipX = geoLineX + 48;
    const tooltipY = Math.max(4, Math.min(yPx - tooltipH / 2, layout.drawingHeight - tooltipH - 4));
    const rowAnchorX = geoLineX + 18;
    const connectorY = Math.max(tooltipY + 22, Math.min(yPx, tooltipY + tooltipH - 18));
    const accent = hasActual ? '#16a34a' : '#2563eb';
    const mutedAccent = hasActual ? 'rgba(22,163,74,0.2)' : 'rgba(37,99,235,0.18)';

    tooltipLayer.selectAll('*').remove();
    tooltipLayer.raise();

    tooltipLayer.append('path')
      .attr('d', `M${rowAnchorX},${yPx} H${tooltipX - 14} Q${tooltipX - 7},${yPx} ${tooltipX - 7},${connectorY} H${tooltipX}`)
      .attr('stroke', accent)
      .attr('stroke-width', 1.6)
      .attr('stroke-linecap', 'round')
      .attr('stroke-linejoin', 'round')
      .attr('opacity', 0.76)
      .attr('fill', 'none');

    tooltipLayer.append('circle')
      .attr('cx', rowAnchorX)
      .attr('cy', yPx)
      .attr('r', 3.2)
      .attr('fill', '#ffffff')
      .attr('stroke', accent)
      .attr('stroke-width', 1.6);

    tooltipLayer.append('rect')
      .attr('x', tooltipX)
      .attr('y', tooltipY)
      .attr('width', tooltipW)
      .attr('height', tooltipH)
      .attr('rx', 10)
      .attr('fill', '#ffffff')
      .attr('stroke', accent)
      .attr('stroke-width', 1.4)
      .attr('filter', 'drop-shadow(0 8px 14px rgba(15,23,42,0.18))');

    tooltipLayer.append('rect')
      .attr('x', tooltipX)
      .attr('y', tooltipY)
      .attr('width', 5)
      .attr('height', tooltipH)
      .attr('rx', 2)
      .attr('fill', accent);

    tooltipLayer.append('rect')
      .attr('x', tooltipX + 14)
      .attr('y', tooltipY + 12)
      .attr('width', hasActual ? 62 : 70)
      .attr('height', 22)
      .attr('rx', 11)
      .attr('fill', mutedAccent);

    tooltipLayer.append('text')
      .attr('x', tooltipX + (hasActual ? 45 : 49))
      .attr('y', tooltipY + 27)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10')
      .attr('font-family', 'DM Sans, sans-serif')
      .attr('font-weight', '900')
      .attr('fill', accent)
      .text(hasActual ? 'ACTUAL' : isTarget ? 'TARGET' : 'PLANNED');

    tooltipLayer.append('text')
      .attr('x', tooltipX + 90)
      .attr('y', tooltipY + 27)
      .attr('font-size', '15')
      .attr('font-family', 'DM Sans, sans-serif')
      .attr('font-weight', '900')
      .attr('fill', '#0f172a')
      .text(formation);

    tooltipLayer.append('text')
      .attr('x', tooltipX + tooltipW - 16)
      .attr('y', tooltipY + 27)
      .attr('text-anchor', 'end')
      .attr('font-size', '12')
      .attr('font-family', 'DM Sans, sans-serif')
      .attr('font-weight', '800')
      .attr('fill', '#64748b')
      .text(`${depth.toLocaleString()} ft`);

    tooltipLayer.append('line')
      .attr('x1', tooltipX + 14)
      .attr('x2', tooltipX + tooltipW - 14)
      .attr('y1', tooltipY + 43)
      .attr('y2', tooltipY + 43)
      .attr('stroke', '#e2e8f0');

    lines.forEach((line, lineIdx) => {
      tooltipLayer.append('text')
        .attr('x', tooltipX + 16)
        .attr('y', tooltipY + 63 + lineIdx * lineHeight)
        .attr('font-size', '12')
        .attr('font-family', 'DM Sans, sans-serif')
        .attr('font-weight', '600')
        .attr('fill', lineIdx === lines.length - 1 && remark.length > lines.join(' ').length ? '#64748b' : '#334155')
        .text(line);
    });

    tooltipLayer.interrupt().style('opacity', 0).transition().duration(120).style('opacity', 1);
  };

  const addHoverTarget = (
    yPx: number,
    formation: string,
    depth: number,
    remark: string | undefined,
    hasActual: boolean,
    isTarget: boolean,
  ): void => {
    const tooltipRemark = remark?.trim() ?? '';

    hoverLayer.append('rect')
      .attr('class', 'geo-hover-row')
      .attr('x', geoLineX - 88)
      .attr('y', yPx - 15)
      .attr('width', 130)
      .attr('height', 30)
      .attr('rx', 5)
      .attr('fill', 'transparent')
      .style('pointer-events', 'all')
      .style('cursor', 'help')
      .on('mouseenter', () => showTooltip(yPx, formation, depth, tooltipRemark, hasActual, isTarget))
      .on('mouseleave', hideTooltip);
  };

  sorted.forEach((top, idx) => {
    const isTarget = !!targetAquifer && top.stLongCd === targetAquifer;
    const actualDepth = actualMap.get(top.stLongCd);
    const hasActual = actualDepth !== undefined;
    const depth = hasActual ? actualDepth! : top.planTvdDepth;
    const yPx = scale(depth);
    const remark = remarksMap.get(top.stLongCd);

    const g = rootG.append('g')
      .attr('class', isTarget ? 'geo-top geo-top--target' : 'geo-top')
      .attr('transform', `translate(0,${yPx})`)
      .style('opacity', 0);

    if (isTarget) {
      const band = g.append('rect')
        .attr('class', 'geo-target-band')
        .attr('x', geoLineX)
        .attr('width', 0)
        .attr('height', 25)
        .attr('y', -14)
        .attr('rx', 3) as RectSel;

      animateGeoBand(band, geoLineX, ANIM.GEO_DELAY + idx * ANIM.GEO_STAGGER);
    }

    const tick = g.append('line')
      .attr('class', 'geo-tick')
      .attr('x1', geoLineX).attr('x2', geoLineX)
      .attr('y1', 0).attr('y2', 0) as LineSel;

    const depthText = g.append('text')
      .attr('class', 'geo-depth')
      .attr('x', geoLineX)
      .attr('dy', '0.35em')
      .style('opacity', 0)
      .text(hasActual ? actualDepth!.toLocaleString() : top.planTvdDepth.toLocaleString()) as TextSel;

    const codeText = g.append('text')
      .attr('class', hasActual ? 'geo-code geo-code--actual' : 'geo-code')
      .attr('x', geoLineX + 7)
      .attr('dy', '0.35em')
      .style('opacity', 0)
      .style('pointer-events', 'none')
      .text(top.stLongCd) as TextSel;

    addHoverTarget(yPx, top.stLongCd, depth, remark, hasActual, isTarget);
    animateGeoRow(g, tick, depthText, codeText, geoLineX, ANIM.GEO_DELAY + idx * ANIM.GEO_STAGGER);
  });

  const drlgOnlyTops = formationTops.filter(f => f.isDrlgOnly);
  drlgOnlyTops.forEach((top, idx) => {
    const actualDepth = Number(top.actualDepth);
    if (!isFinite(actualDepth) || actualDepth <= 0) return;
    const yPx = scale(actualDepth);

    const g = rootG.append('g')
      .attr('class', 'geo-top geo-top--drlg-only')
      .attr('transform', `translate(0,${yPx})`)
      .style('opacity', 0);

    const tick = g.append('line')
      .attr('class', 'geo-tick')
      .attr('x1', geoLineX).attr('x2', geoLineX)
      .attr('y1', 0).attr('y2', 0)
      .attr('stroke', '#22c55e') as LineSel;

    const depthText = g.append('text')
      .attr('class', 'geo-depth')
      .attr('x', geoLineX)
      .attr('dy', '0.35em')
      .style('opacity', 0)
      .text(actualDepth.toLocaleString()) as TextSel;

    const codeText = g.append('text')
      .attr('class', 'geo-code geo-code--actual')
      .attr('x', geoLineX + 7)
      .attr('dy', '0.35em')
      .attr('fill', '#22c55e')
      .style('opacity', 0)
      .style('pointer-events', 'none')
      .text(top.formation) as TextSel;

    addHoverTarget(yPx, top.formation, actualDepth, top.remarks?.trim(), true, false);
    animateGeoRow(
      g,
      tick,
      depthText,
      codeText,
      geoLineX,
      ANIM.GEO_DELAY + (sorted.length + idx) * ANIM.GEO_STAGGER,
    );
  });

  hoverLayer.raise();
  tooltipLayer.raise();
}

function animateGeoBand(band: RectSel, geoLineX: number, delay: number): void {
  band.transition()
    .delay(delay)
    .duration(360)
    .ease(easeCubicOut)
    .attr('x', geoLineX - 75)
    .attr('width', 150);
}

function animateGeoRow(
  group: GSel,
  tick: LineSel,
  depthText: TextSel,
  codeText: TextSel,
  geoLineX: number,
  delay: number,
): void {
  group.transition()
    .delay(delay)
    .duration(220)
    .ease(easeCubicOut)
    .style('opacity', 1);

  tick.transition()
    .delay(delay)
    .duration(300)
    .ease(easeBackOut.overshoot(1.35))
    .attr('x1', geoLineX - 14)
    .attr('x2', geoLineX + 14);

  depthText.transition()
    .delay(delay + 120)
    .duration(280)
    .ease(easeCubicOut)
    .attr('x', geoLineX - 5)
    .style('opacity', 1);

  codeText.transition()
    .delay(delay + 160)
    .duration(300)
    .ease(easeCubicOut)
    .attr('x', geoLineX + 18)
    .style('opacity', 1);
}

function wrapGeoRemark(value: string, maxLineLength: number, maxLines: number): string[] {
  const words = value.trim().split(/\s+/);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;

    if (next.length <= maxLineLength) {
      current = next;
      continue;
    }

    if (current) lines.push(current);
    current = word;

    if (lines.length === maxLines) break;
  }

  if (current && lines.length < maxLines) lines.push(current);

  const rendered = lines.join(' ');
  if (value.length > rendered.length && lines.length > 0) {
    lines[lines.length - 1] = `${lines[lines.length - 1].replace(/\.+$/, '')}...`;
  }

  return lines;
}

```

---

## `src/app/features/presentation/well-bore-view/renderers/liner.renderer.ts`

```ts
import { easeCubicInOut } from 'd3-ease';
import 'd3-transition';

import { ANIM, DiagramLayout } from '@models/well-design/wellbore-diagram.model';
import { ICasingIR } from '@shared/models/wwell/casing-ir.model';
import { IDrlgCsg } from '@shared/models/wwell/drlg-csg.model';
import {
  buildArrowHeadRight,
  buildCasingPath,
  buildScreenHanger,
  openHoleHalfWidth,
} from '@shared/utils/wellbore-math.util';
import { animateLabel } from './animation.helpers';
import { DefsSel, DepthScale, GSel, ResolvedAnimation } from './wellbore-renderer.types';

export interface LinerEntry {
  readonly odSz: string;
  readonly topDepth: number;
  readonly botDepth: number;
  readonly halfWidth: number;
  readonly isScreen: boolean;
  readonly hasActual: boolean;
}

export interface RenderLinersOptions {
  readonly rootG: GSel;
  readonly defsEl: DefsSel;
  readonly layout: DiagramLayout;
  readonly liners: LinerEntry[];
  readonly centerX: number;
  readonly scale: DepthScale;
  readonly linersStart: number;
  readonly labelsStart: number;
  readonly animation: ResolvedAnimation;
  readonly lastCasingBotDepth: number;
}

export function resolveLiners(
  casings: ICasingIR[],
  drlgCasings: IDrlgCsg[],
  layout: DiagramLayout,
): LinerEntry[] {
  return casings.length > 0
    ? linersFromIR(casings, drlgCasings, layout)
    : linersFromDrlg(drlgCasings, layout);
}

const LINER_HW_DECREMENT = 14;
const LINER_WALL_COLOR = '#000000';
const SCREEN_BLANK_RATIO = 0.27;

function assignHalfWidths(baseHalfWidth: number, count: number): number[] {
  return Array.from({ length: count }, (_, i) =>
    Math.max(22, baseHalfWidth - (i + 1) * LINER_HW_DECREMENT)
  );
}

/**
 * Extracts liner entries from drlgCasings when no ICasingIR data is available.
 * Deduplicates by wLnrOdSz, sorts shallowest-first (widest hw).
 * The deepest liner is marked isScreen=true only when multiple liners exist.
 */
export function linersFromDrlg(drlgCasings: IDrlgCsg[], layout: DiagramLayout): LinerEntry[] {
  const dedupMap = new Map<string, { odSz: string; topDepth: number; botDepth: number }>();
  for (const d of drlgCasings) {
    if (!d.wLnrOdSz || (d.wLnrBotDepth ?? 0) <= 0) continue;
    const existing = dedupMap.get(d.wLnrOdSz);
    if (!existing || d.wLnrBotDepth! > existing.botDepth) {
      dedupMap.set(d.wLnrOdSz, {
        odSz: d.wLnrOdSz,
        topDepth: d.wLnrTopDepth ?? d.wCsgBotDpth,
        botDepth: d.wLnrBotDepth!,
      });
    }
  }

  const sorted = [...dedupMap.values()].sort((a, b) => a.botDepth - b.botDepth);
  const widths = assignHalfWidths(layout.baseHalfWidth, sorted.length);

  return sorted.map((liner, i) => ({
    ...liner,
    halfWidth: widths[i],
    isScreen: sorted.length > 1 && i === sorted.length - 1,
    hasActual: true,
  }));
}

/**
 * Extracts liner entries from ICasingIR + drlgCasings for actual depth override.
 * Includes extra drlgCasings liners not represented in ICasingIR.
 * The deepest liner is marked isScreen=true only when multiple liners exist.
 */
export function linersFromIR(
  casings: ICasingIR[],
  drlgCasings: IDrlgCsg[],
  layout: DiagramLayout,
): LinerEntry[] {
  const irLiners = casings.filter(c => c.csgType === 'Liner');
  if (irLiners.length === 0) return [];

  const matchedOdSizes = new Set<string>();

  const irEntries = irLiners.map(csg => {
    const actual = drlgCasings.find(d => d.wLnrOdSz === csg.csgSize) ?? null;
    const hasActualBot = (actual?.wLnrBotDepth ?? 0) > 0;
    const hasActualTop = (actual?.wLnrTopDepth ?? 0) > 0;
    if (actual?.wLnrOdSz) matchedOdSizes.add(actual.wLnrOdSz);
    return {
      odSz: actual?.wLnrOdSz ?? csg.csgSize,
      topDepth: hasActualTop ? actual!.wLnrTopDepth! : (actual?.wCsgBotDpth ?? 0),
      botDepth: hasActualBot ? actual!.wLnrBotDepth! : csg.csgDepth,
      hasActual: hasActualBot,
    };
  });

  const extraEntries = drlgCasings
    .filter(d => d.wLnrOdSz != null && (d.wLnrBotDepth ?? 0) > 0 && !matchedOdSizes.has(d.wLnrOdSz!))
    .map(d => ({
      odSz: d.wLnrOdSz!,
      topDepth: d.wLnrTopDepth ?? d.wCsgBotDpth,
      botDepth: d.wLnrBotDepth!,
      hasActual: true,
    }));

  const allLiners = [...irEntries, ...extraEntries].sort((a, b) => a.botDepth - b.botDepth);
  const widths = assignHalfWidths(layout.baseHalfWidth, allLiners.length);

  return allLiners.map((liner, i) => ({
    ...liner,
    halfWidth: widths[i],
    isScreen: allLiners.length > 1 && i === allLiners.length - 1,
  }));
}

export function renderLiners(options: RenderLinersOptions): void {
  if (options.liners.length === 0) return;
  renderLinerShapes(options);
  renderLinerLabels(options);
}

function renderLinerShapes({
  rootG,
  defsEl,
  layout,
  liners,
  centerX,
  scale,
  linersStart,
  lastCasingBotDepth,
}: RenderLinersOptions): void {
  const { shoeCurveOffset } = layout;

  liners.forEach((liner, i) => {
    const topPx = scale(liner.topDepth);
    const botPx = scale(liner.botDepth);
    const clipId = `dyn-liner-clip-${i}`;
    const clipRadius = openHoleHalfWidth(liner.halfWidth) + 20;
    const delay = (liners.length - 1 - i) * ANIM.CASING_STAGGER;
    const thisLinerStart = linersStart + delay;
    const casingPath = buildCasingPath(centerX, liner.halfWidth, topPx, botPx, shoeCurveOffset);

    const fill = liner.hasActual ? 'url(#actualCasingGradient)' : 'url(#linerGradient)';
    const stroke = LINER_WALL_COLOR;
    const opacity = liner.hasActual ? 0.78 : 0.55;

    const hangerHW = liner.halfWidth;
    const hangerY = (i === 0 ? scale(lastCasingBotDepth) : scale(liners[i - 1].botDepth)) + 4;
    const { left: lh, right: rh } = buildScreenHanger(centerX, hangerY, hangerHW, 14, 26);
    rootG.append('path')
      .attr('class', 'liner-hanger')
      .attr('d', `${lh} ${rh}`)
      .attr('fill', '#000000')
      .attr('fill-opacity', '1')
      .attr('stroke', 'none')
      .style('opacity', 0)
      .transition()
      .delay(thisLinerStart)
      .duration(Math.round(ANIM.CASING_DURATION / 3))
      .ease(easeCubicInOut)
      .style('opacity', 1);

    const clipRect = defsEl.append('clipPath')
      .attr('class', 'dyn-clip')
      .attr('id', clipId)
      .append('rect')
      .attr('x', centerX - clipRadius - 15)
      .attr('y', topPx - 5)
      .attr('width', clipRadius * 2 + 30)
      .attr('height', 0);

    clipRect.transition()
      .delay(thisLinerStart)
      .duration(ANIM.CASING_DURATION)
      .ease(easeCubicInOut)
      .attr('height', botPx - topPx + shoeCurveOffset + 20);

    rootG.append('path')
      .attr('class', liner.isScreen ? 'liner liner--screen' : 'liner')
      .attr('d', casingPath)
      .attr('clip-path', `url(#${clipId})`)
      .attr('fill', fill)
      .attr('stroke', stroke)
      .attr('stroke-width', '5')
      .style('opacity', opacity);

    if (liner.isScreen) {
      const screenStartPx = topPx + (botPx - topPx) * SCREEN_BLANK_RATIO;
      rootG.append('rect')
        .attr('class', 'liner liner--screen-grid')
        .attr('x', centerX - liner.halfWidth + 3)
        .attr('y', screenStartPx)
        .attr('width', liner.halfWidth * 2 - 6)
        .attr('height', botPx - screenStartPx)
        .attr('clip-path', `url(#${clipId})`)
        .attr('fill', 'url(#gridPattern)')
        .attr('fill-opacity', 0.92)
        .attr('stroke', 'none');
    }
  });
}

function renderLinerLabels({
  rootG,
  liners,
  centerX,
  scale,
  labelsStart,
  animation,
}: RenderLinersOptions): void {
  const innerDelay = labelsStart + (animation.lineStyle === 'draw' ? animation.lineDur : 0);

  liners.forEach((liner) => {
    const topPx = scale(liner.topDepth);
    const botPx = scale(liner.botDepth);
    const midY = topPx + (botPx - topPx) * 0.5;
    const rEdge = centerX + liner.halfWidth;
    const lEnd = rEdge + 26;
    const labelX = lEnd + 8;
    const screenTag = liner.isScreen ? ' (Screen)' : '';
    const actualStar = liner.hasActual ? ' *' : '';

    const lg = rootG.append('g').attr('class', 'casing-label');
    lg.append('line').attr('class', 'casing-label__line')
      .attr('x1', rEdge).attr('x2', lEnd).attr('y1', midY).attr('y2', midY);
    lg.append('path').attr('class', 'casing-label__arrow')
      .attr('d', buildArrowHeadRight(lEnd, midY, 6));
    lg.append('text').attr('class', 'casing-label__primary')
      .attr('fill', liner.hasActual ? '#22c55e' : '')
      .attr('x', labelX).attr('y', midY + 4)
      .text(`${liner.odSz}" Liner @ ${liner.botDepth.toLocaleString()}${screenTag}${actualStar}`);

    animateLabel(lg, labelsStart, animation);

    rootG.append('text').attr('class', 'casing-size-inner')
      .attr('x', centerX).attr('y', midY)
      .attr('text-anchor', 'middle')
      .style('opacity', 0)
      .attr('fill', liner.hasActual ? '#0f2d1a' : '')
      .style('font-weight', liner.hasActual ? '800' : 'normal')
      .text(`${liner.odSz}"`)
      .transition().delay(innerDelay).duration(animation.fadeDur).ease(easeCubicInOut)
      .style('opacity', 1);

    if (liner.topDepth > 0) {
      const rEdge = centerX + liner.halfWidth;
      const tolEnd = rEdge + 56;
      const tolLg = rootG.append('g').attr('class', 'casing-label');
      tolLg.append('line').attr('class', 'casing-label__line')
        .attr('x1', rEdge).attr('x2', tolEnd).attr('y1', topPx).attr('y2', topPx);
      tolLg.append('path').attr('class', 'casing-label__arrow')
        .attr('d', buildArrowHeadRight(tolEnd, topPx, 6));
      tolLg.append('text').attr('class', 'casing-label__primary')
        .attr('text-anchor', 'start')
        .attr('x', tolEnd + 8).attr('y', topPx + 4)
        .text(`TOL @ ${liner.topDepth.toLocaleString()}`);
      animateLabel(tolLg, labelsStart, animation);
    }
  });
}

```

---

## `src/app/features/presentation/well-bore-view/renderers/not-drilled-zone.renderer.ts`

```ts
import 'd3-transition';

import { ANIM, WellboreDiagramData } from '@models/well-design/wellbore-diagram.model';
import { DepthScale, GSel } from './wellbore-renderer.types';

export interface RenderNotDrilledZoneOptions {
  readonly rootG: GSel;
  readonly data: WellboreDiagramData;
  readonly centerX: number;
  readonly scale: DepthScale;
  readonly start: number;
  readonly openHoleHalfWidth: number;
}

export function renderNotDrilledZone({
  rootG,
  data,
  centerX,
  scale,
  start,
  openHoleHalfWidth,
}: RenderNotDrilledZoneOptions): void {
  const estTargetDepth = data.totalDepth;
  const currentDepth = data.currentDepth;
  const undrilledFt = estTargetDepth - currentDepth;

  if (currentDepth <= 0 || undrilledFt <= 1) return;

  const topPx = scale(currentDepth);
  const bottomPx = scale(estTargetDepth);
  const height = bottomPx - topPx;
  const width = openHoleHalfWidth * 2 + 160;
  const lx = centerX - openHoleHalfWidth - 80;

  const ndg = rootG.append('g')
    .attr('class', 'not-drilled-zone')
    .style('opacity', 0);

  const ttipG = rootG.append('g')
    .attr('class', 'not-drilled-tooltip')
    .style('opacity', 0)
    .style('pointer-events', 'none');

  const ttipX = centerX + openHoleHalfWidth + 14;
  const ttipY = topPx + height * 0.4;
  ttipG.append('rect')
    .attr('x', ttipX).attr('y', ttipY - 36)
    .attr('width', 320).attr('height', 82)
    .attr('rx', 8)
    .attr('fill', '#1e293b')
    .attr('fill-opacity', 0.82)
    .attr('stroke', 'rgba(239,68,68,0.55)')
    .attr('stroke-width', 1.5);
  ttipG.append('text')
    .attr('x', ttipX + 16).attr('y', ttipY - 6)
    .attr('font-size', '20').attr('font-family', 'DM Sans, sans-serif')
    .attr('font-weight', '900').attr('fill', 'rgba(239,100,68,1)')
    .attr('letter-spacing', '0')
    .text('NOT DRILLED');
  ttipG.append('text')
    .attr('x', ttipX + 16).attr('y', ttipY + 24)
    .attr('font-size', '18').attr('font-family', 'DM Sans, sans-serif')
    .attr('font-weight', '800').attr('fill', '#cbd5e1')
    .text(`Remaining: ${undrilledFt.toLocaleString()} ft`);

  ndg.append('rect')
    .attr('x', lx)
    .attr('y', topPx)
    .attr('width', width)
    .attr('height', height)
    .attr('fill', 'rgba(239, 68, 68, 0.12)')
    .attr('stroke', 'rgba(239, 68, 68, 0.3)')
    .attr('stroke-width', 1)
    .attr('stroke-dasharray', '8,4')
    .style('cursor', 'help')
    .on('mouseenter', () => ttipG.transition().duration(100).style('opacity', 1))
    .on('mouseleave', () => ttipG.transition().duration(100).style('opacity', 0));

  ndg.transition()
    .delay(start)
    .duration(ANIM.OVERLAY_FADE)
    .style('opacity', 1);
}

```

---

## `src/app/features/presentation/well-bore-view/renderers/static-chrome.renderer.ts`

```ts
import { DiagramLayout } from '@models/well-design/wellbore-diagram.model';
import { GSel } from './wellbore-renderer.types';

export interface RenderStaticChromeOptions {
  readonly rootG: GSel;
  readonly layout: DiagramLayout;
  readonly geoLineX: number;
  readonly centerX: number;
}

export function renderStaticChrome({
  rootG,
  layout,
  geoLineX,
  centerX,
}: RenderStaticChromeOptions): void {
  rootG.append('line')
    .attr('class', 'ground-line')
    .attr('x1', geoLineX + 200).attr('x2', centerX + 300)
    .attr('y1', -3).attr('y2', -3);

  rootG.append('text')
    .attr('class', 'ground-label')
    .attr('x', centerX).attr('y', -12)
    .attr('text-anchor', 'middle')
    .text('Ground Level');

  rootG.append('line')
    .attr('class', 'geo-axis')
    .attr('x1', geoLineX).attr('x2', geoLineX)
    .attr('y1', 0).attr('y2', layout.drawingHeight);

  rootG.append('text')
    .attr('class', 'column-label')
    .attr('x', geoLineX).attr('y', -30)
    .attr('text-anchor', 'middle')
    .call((text) => {
      text.append('tspan').attr('x', geoLineX).attr('dy', 0).text('Geologic');
      text.append('tspan').attr('x', geoLineX).attr('dy', 19).text('Horizons (ft bgl)');
    });
}

```

---

## `src/app/features/presentation/well-bore-view/renderers/wellbore-depth.helpers.ts`

```ts
import { DiagramLayout, WellboreDiagramData } from '@models/well-design/wellbore-diagram.model';
import { ICasingIR } from '@shared/models/wwell/casing-ir.model';
import { IDrlgCsg } from '@shared/models/wwell/drlg-csg.model';
import { IWellDesign } from '@shared/models/wwell/well-design.model';
import { computeCasingHalfWidth, parseInchSize } from '@shared/utils/wellbore-math.util';
import { resolveLiners } from './liner.renderer';
import { DepthScale } from './wellbore-renderer.types';

const OVERRUN_COMPLETION_LENGTH_FT = 1200;

export function resolveShoeDepth(casings: ICasingIR[], drlgCasings: IDrlgCsg[]): number {
  const irNonLiner = casings.filter(c => c.csgType !== 'Liner' && c.csgType !== 'Gravel Pack');
  const deepest = irNonLiner[0];
  if (!deepest) return drlgCasings[0]?.wCsgBotDpth ?? 0;

  const actual = drlgCasings.find(d => d.wCsgOdSz === deepest.csgSize) ?? null;
  return (actual !== null && actual.wCsgBotDpth > 0 ? actual.wCsgBotDpth : null) ?? deepest.csgDepth;
}

export function resolveLinerTopDepth(casings: ICasingIR[], drlgCasings: IDrlgCsg[]): number {
  const liner = casings.find(c => c.csgType === 'Liner');
  if (liner) {
    const actualLnr = drlgCasings.find(d => d.wLnrOdSz === liner.csgSize) ?? null;
    const topDepth = (actualLnr?.wLnrTopDepth ?? 0) > 0 ? (actualLnr?.wLnrTopDepth ?? null) : null;
    if (topDepth !== null) return topDepth;
  }
  return resolveShoeDepth(casings, drlgCasings);
}

export function resolveCompletionTopDepth(casings: ICasingIR[], drlgCasings: IDrlgCsg[]): number {
  const liner = casings.find(c => c.csgType === 'Liner');
  if (liner) {
    const actualLnr = drlgCasings.find(d => d.wLnrOdSz === liner.csgSize) ?? null;
    const actualDepth = (actualLnr?.wLnrBotDepth ?? 0) > 0 ? actualLnr?.wLnrBotDepth ?? null : null;
    return actualDepth ?? liner.csgDepth;
  }

  return resolveShoeDepth(casings, drlgCasings);
}

export function resolveCompletionTopPx(
  casings: ICasingIR[],
  drlgCasings: IDrlgCsg[],
  scale: DepthScale,
): number {
  return scale(resolveCompletionTopDepth(casings, drlgCasings));
}

export function resolveCompletionBottomDepth(data: WellboreDiagramData): number {
  const completionTopDepth = resolveCompletionTopDepth(data.casings, data.drlgCasings);
  const plannedTargetDepth = data.prewap?.estTargetDepth ?? 0;
  const isCurrentDepthBeyondTarget = plannedTargetDepth > 0 && data.currentDepth > plannedTargetDepth;

  const naturalBottom = isCurrentDepthBeyondTarget
    ? Math.max(completionTopDepth, Math.min(data.totalDepth, completionTopDepth + OVERRUN_COMPLETION_LENGTH_FT))
    : data.totalDepth;

  return Math.min(naturalBottom, data.displayDepth);
}

export function resolveCompletionBottomPx(data: WellboreDiagramData, scale: DepthScale): number {
  return scale(resolveCompletionBottomDepth(data));
}

function isFlagYes(flg: string | null | undefined): boolean {
  return (flg ?? '').trim().toUpperCase() === 'Y';
}

function hasText(value: string | null | undefined): boolean {
  return !!value?.trim();
}

export function shouldRenderOpenHole(wellDesign: IWellDesign | null | undefined): boolean {
  if (!isFlagYes(wellDesign?.ohFlg)) return false;
  return parseInchSize(wellDesign?.ohRemarks) !== null;
}

export function shouldRenderGravelPack(wellDesign: IWellDesign | null | undefined): boolean {
  if (!isFlagYes(wellDesign?.gpFlg)) return false;
  return hasText(wellDesign?.gpRemarks);
}

export function shouldRenderLinerScreen(wellDesign: IWellDesign | null | undefined): boolean {
  if (!isFlagYes(wellDesign?.lsFlg)) return false;
  return hasText(wellDesign?.lsRemarks);
}

export function shouldRenderPrePerforatedLiner(wellDesign: IWellDesign | null | undefined): boolean {
  if (!isFlagYes(wellDesign?.perforatedFlg)) return false;
  return hasText(wellDesign?.perforatedRemarks);
}

export function resolveOhHalfWidth(data: WellboreDiagramData, layout: DiagramLayout): number {
  const { baseHalfWidth, halfWidthIncrement, openHoleHwMargin } = layout;
  const innerHW = computeCasingHalfWidth(0, baseHalfWidth, halfWidthIncrement);

  if (!isFlagYes(data.wellDesign?.ohFlg)) return innerHW + openHoleHwMargin;

  const ohDiameter = parseInchSize(data.wellDesign?.ohRemarks);

  // When liners exist, scale OH relative to the last liner so the
  // physical size difference (e.g. 8.5" OH vs 7" liner) is preserved visually.
  const liners = resolveLiners(data.casings, data.drlgCasings, layout);
  const lastLiner = liners.length > 0 ? liners[liners.length - 1] : null;

  if (lastLiner !== null && ohDiameter !== null) {
    const linerOD = parseInchSize(lastLiner.odSz);
    if (linerOD !== null && linerOD > 0) {
      return lastLiner.halfWidth * (ohDiameter / linerOD);
    }
  }

  // No liners: scale relative to innermost structural casing
  const structuralCasings = data.casings.filter(
    c => c.csgType !== 'Liner' && c.csgType !== 'Gravel Pack',
  );
  const innermostOD = parseInchSize(structuralCasings[0]?.csgSize ?? null);

  if (ohDiameter !== null && innermostOD !== null && innermostOD > 0 && ohDiameter < innermostOD) {
    return innerHW * (ohDiameter / innermostOD);
  }

  return innerHW + openHoleHwMargin;
}

export function getCasingTier(csg: ICasingIR, casings: ICasingIR[]): number {
  const structuralCasings = casings.filter(item => item.csgType !== 'Gravel Pack');
  const idx = structuralCasings.indexOf(csg);
  return idx === -1 ? 0 : idx;
}

```

---

## `src/app/features/presentation/well-bore-view/well-bore-view.component.ts`

```ts
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  effect,
  input,
  viewChild,
} from '@angular/core';
import { select } from 'd3-selection';
import 'd3-transition';

import { ANIM, computeOverlayDelay, DEFAULT_ANIM_CONFIG, DIAGRAM_LAYOUT, WellboreAnimConfig, WellboreDiagramData } from '@models/well-design/wellbore-diagram.model';
import { resolveLiners } from './renderers/liner.renderer';
import { FormationInfoViewModel } from '@models/active-wwell/active-wwell-view.model';
import { resolveAnimation } from './renderers/animation.helpers';
import { renderCasingElements } from './renderers/casing.renderer';
import { renderCompletionElements, renderScreenHanger } from './renderers/completion.renderer';
import { renderStaticDefs } from './renderers/defs.renderer';
import { renderDrillArrow } from './renderers/drill-arrow.renderer';
import { renderGeoTops } from './renderers/geo-tops.renderer';
import { renderNotDrilledZone } from './renderers/not-drilled-zone.renderer';
import { renderPump, renderTotalDepthLabel } from './renderers/pump-and-depth.renderer';
import { renderStaticChrome } from './renderers/static-chrome.renderer';
import { renderWaterLevel } from './renderers/water-level.renderer';
import { resolveCompletionBottomDepth, resolveOhHalfWidth } from './renderers/wellbore-depth.helpers';
import { DefsSel, GSel, SvgSel } from './renderers/wellbore-renderer.types';
import { createDepthScale } from '@shared/utils/wellbore-math.util';

@Component({
  selector: 'app-well-bore-view',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './wellbore-view.component.html',
  styleUrl: './wellbore-view.component.scss',
})

export class WellBoreViewComponent {
  readonly diagramData = input.required<WellboreDiagramData | null>();
  readonly animTrigger = input.required<number>();
  readonly animConfig = input<WellboreAnimConfig>(DEFAULT_ANIM_CONFIG);
  readonly formationTops = input<FormationInfoViewModel[]>([]);

  private readonly svgRef = viewChild<ElementRef<SVGSVGElement>>('wellboreSvg');

  private readonly layout = DIAGRAM_LAYOUT;
  private rootG!: GSel;
  private defsEl!: DefsSel;


  constructor() {
    effect(() => {
      const svgEl = this.svgRef();
      const data = this.diagramData();

      if (!svgEl?.nativeElement || !data) return;

      // Bootstrap once; redraw on every data/trigger change.
      if (!this.rootG) {
        this.bootstrapSvg(svgEl.nativeElement);
      }

      if (this.rootG) {
        this.redraw(data);
      }
    });
  }

  private bootstrapSvg(element: SVGSVGElement): void {
    const { wellboreViewWidth, svgHeight, marginTop } = this.layout;
    const svg = select(element) as SvgSel;

    svg.attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${wellboreViewWidth} ${svgHeight}`)
      .attr('preserveAspectRatio', 'none');

    this.defsEl = svg.append('defs') as DefsSel;
    renderStaticDefs(this.defsEl);

    this.rootG = svg.append('g')
      .attr('class', 'wellbore-root')
      .attr('transform', `translate(0,${marginTop})`) as GSel;
  }

  private redraw(data: WellboreDiagramData): void {
    if (!this.rootG) return;

    this.rootG.interrupt();

    if (!this.rootG.selectAll('*').empty()) {
      this.rootG.transition().duration(120).style('opacity', 0)
        .end()
        .then(() => this.buildDiagram(data))
        .catch(() => { /* superseded by a subsequent redraw */ });
      return;
    }

    this.buildDiagram(data);
  }

  private buildDiagram(data: WellboreDiagramData): void {
    this.rootG.selectAll('*').remove();
    this.defsEl.selectAll('.dyn-clip').remove();
    this.rootG.style('opacity', 1);

    const { drawingHeight, geoLineX, casingCenterX } = this.layout;
    const displayDepth = Math.max(data.totalDepth, data.displayDepth);
    const scale = createDepthScale(displayDepth, drawingHeight);
    const targetAquifer = data.hydrogeology?.estTargetAquifier ?? null;

    // ── Build a strict sequential timeline ─────────────────────────────────
    const structuralCasings = data.casings.filter(
      c => c.csgType !== 'Liner' && c.csgType !== 'Gravel Pack'
    );
    const liners = resolveLiners(data.casings, data.drlgCasings, this.layout);

    const t_casingsStart = 0;
    const t_casingsDone = computeOverlayDelay(structuralCasings.length);
    const t_linersStart = t_casingsDone + ANIM.SEQ_GAP;
    const t_linersDone = t_linersStart + (liners.length > 0 ? computeOverlayDelay(liners.length) : 0);
    const t_ohStart = t_linersDone + ANIM.SEQ_GAP;
    const t_ohDone = t_ohStart + ANIM.OH_DURATION;
    const t_gravelStart = t_ohDone + ANIM.SEQ_GAP;
    const t_gravelDone = t_gravelStart + ANIM.GRAVEL_DURATION;
    const t_hangerStart = t_gravelDone + ANIM.SEQ_GAP;
    const t_drillStart = 0;
    const t_labelsStart = t_linersDone + ANIM.SEQ_GAP;
    const t_ohLabelStart = t_ohDone + ANIM.SEQ_GAP;
    const t_waterStart = t_ohLabelStart + ANIM.OVERLAY_FADE + ANIM.SEQ_GAP;
    const t_notDrilledStart = t_linersDone + ANIM.SEQ_GAP;
    const t_tdLabelStart = t_notDrilledStart + ANIM.OVERLAY_FADE + ANIM.SEQ_GAP;

    // ── Draw ───────────────────────────────────────────────────────────────
    const ohHW = resolveOhHalfWidth(data, this.layout);

    renderStaticChrome({
      rootG: this.rootG,
      layout: this.layout,
      geoLineX,
      centerX: casingCenterX,
    });
    renderGeoTops({
      rootG: this.rootG,
      layout: this.layout,
      tops: data.geologicTops,
      geoLineX,
      scale,
      targetAquifer,
      formationTops: this.formationTops(),
    });
    renderCompletionElements({
      rootG: this.rootG,
      defsEl: this.defsEl,
      layout: this.layout,
      data,
      centerX: casingCenterX,
      scale,
      ohStart: t_ohStart,
      ohLabelStart: t_ohLabelStart,
      hangerStart: t_hangerStart,
      animation: resolveAnimation(this.animConfig()),
    });
    renderCasingElements({
      rootG: this.rootG,
      defsEl: this.defsEl,
      layout: this.layout,
      casings: data.casings,
      drlgCasings: data.drlgCasings,
      centerX: casingCenterX,
      scale,
      casingsStart: t_casingsStart,
      linersStart: t_linersStart,
      gravelStart: t_gravelStart,
      labelsStart: t_labelsStart,
      openHoleHalfWidthPx: ohHW,
      animation: resolveAnimation(this.animConfig()),
    });
    renderScreenHanger({
      rootG: this.rootG,
      defsEl: this.defsEl,
      layout: this.layout,
      data,
      centerX: casingCenterX,
      scale,
      ohStart: t_ohStart,
      ohLabelStart: t_ohLabelStart,
      hangerStart: t_hangerStart,
      animation: resolveAnimation(this.animConfig()),
    });
    renderWaterLevel({
      rootG: this.rootG,
      defsEl: this.defsEl,
      layout: this.layout,
      data,
      centerX: casingCenterX,
      scale,
      waterStart: t_waterStart,
      animation: resolveAnimation(this.animConfig()),
    });
    renderDrillArrow({
      rootG: this.rootG,
      defsEl: this.defsEl,
      layout: this.layout,
      data,
      scale,
      drillStart: t_drillStart,
      casingsDoneAt: t_casingsDone,
    });

    renderNotDrilledZone({
      rootG: this.rootG,
      data,
      centerX: casingCenterX,
      scale,
      start: t_notDrilledStart,
      openHoleHalfWidth: ohHW,
    });
    renderTotalDepthLabel({
      rootG: this.rootG,
      data,
      centerX: casingCenterX,
      yPx: scale(this.resolveDepthLabelAnchor(data)),
      start: t_tdLabelStart,
      animation: resolveAnimation(this.animConfig()),
    });
    renderPump({
      rootG: this.rootG,
      data,
      centerX: casingCenterX,
      scale,
      start: t_labelsStart,
      animation: resolveAnimation(this.animConfig()),
    });
  }

  private resolveDepthLabelAnchor(data: WellboreDiagramData): number {
    const plannedTargetDepth = data.prewap?.estTargetDepth ?? 0;
    if (plannedTargetDepth > 0 && data.currentDepth > plannedTargetDepth) {
      return resolveCompletionBottomDepth(data);
    }

    // When current depth ≈ target depth (or the casing shoe sits close to total depth),
    // resolveCompletionBottomDepth() extends the completion section past totalDepth to
    // keep it visible — anchor below that extended section so the label doesn't overlap it.
    return Math.max(data.totalDepth, resolveCompletionBottomDepth(data));
  }
}

```

---

## `src/app/features/presentation/well-bore-view/wellbore-view.component.scss`

```scss
:host {
  display: block;
  flex: 1;
  overflow-x: auto;
  overflow-y: hidden;
}

.wellbore-svg {
  display: block;
  background: transparent;
}



:host ::ng-deep {

  // ── Pump symbol ────────────────────────────────────────────────────────────
  .pump-leader {
    stroke: var(--text-muted, #94a3b8);
    stroke-width: 1;
    opacity: 0.75;
  }

  .pump-leader-arrow { fill: var(--text-muted, #94a3b8); }

  .pump-label {
    
    font-size: 20px;
    font-weight: 900;
    fill: #1e293b;
  }


  .ground-line   { stroke: #b94a12; stroke-width: 3; stroke-linecap: round; opacity: 0.9; }
  .ground-label  { font-family: 'DM Sans', sans-serif; font-size: 17px; font-weight: 900; fill: #b94a12; text-transform: uppercase; opacity: 0.9; }
  .geo-axis      { stroke: #000; stroke-width: 2.2; opacity: 1; }
  .column-label  { font-family: 'DM Sans', sans-serif; font-size: 17px; fill: var(--accent); font-weight: 900; opacity: 1; }
  .geo-tick      { stroke: #000; stroke-width: 2.2; opacity: 1; }
  .geo-depth     { font-size: 19px; font-weight: 900;  text-anchor: end; }
  .geo-code         { font-family: 'DM Sans', sans-serif; font-size: 19px; font-weight: 900; fill: var(--text-primary); letter-spacing: 0; }
  .geo-code--actual { fill: #16a34a; }

  .geo-depth,
  .geo-code {
    pointer-events: none;
    user-select: none;
  }

  .geo-hover-row {
    transition: fill 0.12s ease;

    &:hover { fill: rgba(37, 99, 235, 0.06); }
  }

  .geo-remark-tooltip {
    text { user-select: none; }
  }

  .geo-target-band  { fill: rgb(35 135 232 / 60%);  }
  .geo-tick--target { stroke: #d97706; stroke-width: 3; }
  .geo-depth--target{ font-size: 18px; font-weight: 900; fill: #d97706; text-anchor: end; }
  .geo-code--target { font-size: 19px; font-weight: 900; fill: #d97706; }

  .casing            { stroke-linecap: round; }
  .casing-label__line   { stroke: var(--text-muted); stroke-width: 1.6; opacity: 0.85; }
  .casing-label__arrow  { fill: var(--text-muted); opacity: 0.85; }
  .casing-label__primary {
     font-size: 20px; font-weight: 900;
     
  }
  .casing-label__secondary {
    font-size: 16px;
    font-weight: 900;
     font-style: italic;
  }
  .casing-size-inner {
    font-size: 23px; font-weight: 900;
    opacity: 0.86;
  }

  .water-line  { stroke: #0ea5e9; stroke-width: 2.4; stroke-dasharray: 7,4; opacity: 0.9; }
  .water-arrow { fill: #0ea5e9; stroke: #0ea5e9; opacity: 0.8; }
  .water-label {  font-size: 20px;  font-weight: 900; fill: #0ea5e9;}

  .water-level-tooltip {
    text { user-select: none; }
  }

  .open-hole        { stroke: #000; stroke-width: 3.4; fill: none; stroke-dasharray: 5,3; opacity: 1; }
  .oh-label-line    { stroke: var(--text-muted); stroke-width: 1.6; opacity: 0.8; }
  .oh-label-arrow   { fill: var(--text-muted); opacity: 0.8; }
  .open-hole-text   { font-family: 'DM Sans', sans-serif; font-size: 19px; font-weight: 900;  }

  .liner-screen     { stroke: var(--text-secondary); stroke-width: 1.8; fill: url(#gridPattern); opacity: 0.72; }
  .screen-hanger    { opacity: 0.78; }
  .screen-label-line{ stroke: var(--text-muted); stroke-width: 1.6; opacity: 0.8; }
  .screen-label-text{ font-family: 'DM Sans', sans-serif; font-size: 19px; font-weight: 900;  }

  .gravelHole { opacity: 1; }

  .perf-wall { stroke: #000; stroke-width: 3; fill: none; stroke-dasharray: 5,9; opacity: 1; }
  .perf-tick { stroke: #000; stroke-width: 2; fill: none; opacity: 1; }
  .perf-shoe { stroke: #000; stroke-width: 2.5; fill: none; opacity: 1; }

  .depth-arrow-group {
    .mud-circ-seg {
      cursor: crosshair;
      rect { transition: filter 0.15s; }
      &:hover rect:first-child { filter: brightness(1.35) saturate(1.2); }
    }
  }

  .depth-arrow-head {
    fill: var(--accent);
    filter: drop-shadow(0 0 4px var(--accent));
  }

  .depth-arrow-head-g circle {
    filter: blur(2px);
  }

  .circ-tooltip {
    pointer-events: none;
    filter: drop-shadow(0 3px 6px rgba(0,0,0,0.5));
  }

  .total-depth-main {
    font-family: 'DM Sans', sans-serif; font-size: 20px; font-weight: 900;
    fill: var(--accent); letter-spacing: 0; opacity: 0.95;
  }

  .total-depth-main--current {
    fill: #16a34a;
    font-size: 22px;
    font-weight: 950;
    opacity: 1;
  }

}

```

---

## `src/app/features/presentation/well-name-chips/well-name-chips.component.html`

```html
<div class="well-chips-shell">
  <div class="well-chips-container">
    <!-- Date picker section — positioned on the left -->
    <div class="date-picker-section">
      <label class="date-picker-label" for="well-date-input">Date:</label>
      <div class="date-input-wrapper">
        <input
          id="well-date-input"
          type="text"
          class="date-picker-input"
          [value]="selectedDateString()"
          placeholder="YYYY-MM-DD"
          maxlength="10"
          (focus)="$any($event.target).select()"
          (input)="onDateAutoFormat($event)"
          (blur)="onDateTextCommit($any($event.target).value)"
          (keydown.enter)="onDateTextCommit($any($event.target).value); $any($event.target).blur()"
          aria-label="Select date for well data"
        />
        <button type="button" class="date-cal-btn" (click)="openNativePicker()" aria-label="Open calendar picker">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2"/>
            <path d="M16 2v4M8 2v4M3 10h18"/>
          </svg>
        </button>
        <input
          #nativeDateInput
          type="date"
          class="date-native-hidden"
          [value]="selectedDateString()"
          [max]="maxDateString"
          (change)="onDateInputChange($any($event.target).value)"
          tabindex="-1"
          aria-hidden="true"
        />
      </div>
    </div>

    <!-- Well name chips and navigation — centered -->
    <div class="chip-strip" role="list" aria-label="Available wells">
      <span class="chip-strip__label">Active Wells</span>

      @if (store.hasPrevPage()) {
        <button
          type="button"
          class="chip chip--nav chip--page-nav"
          aria-label="Previous wells page"
          title="Previous wells page"
          (click)="onPrevPageClick($event)"
        >
          <mat-icon aria-hidden="true">keyboard_double_arrow_left</mat-icon>
        </button>
      }

      @if (store.hasPrevWell()) {
        <button
          type="button"
          class="chip chip--nav chip--well-nav"
          aria-label="Previous well"
          title="Previous well"
          (click)="onPrevWellClick($event)"
        >
          <mat-icon aria-hidden="true">chevron_left</mat-icon>
        </button>
      }

      @for (well of store.pagedWellNames(); track well.epANum) {
        <button
          type="button"
          class="chip"
          role="listitem"
          [ngClass]="{ 'chip--active': well.epANum === store.selectedEpANum() }"
          [attr.aria-pressed]="well.epANum === store.selectedEpANum()"
          (click)="onWellChipClick(well.epANum)"
        >
          <span class="chip__dot"></span>
          <span class="chip__text">{{ well.wellName }}</span>
        </button>
      }

      @if (store.hasNextWell()) {
        <button
          type="button"
          class="chip chip--nav chip--well-nav"
          aria-label="Next well"
          title="Next well"
          (click)="onNextWellClick($event)"
        >
          <mat-icon aria-hidden="true">chevron_right</mat-icon>
        </button>
      }

      @if (store.hasNextPage()) {
        <button
          type="button"
          class="chip chip--nav chip--page-nav"
          aria-label="Next wells page"
          title="Next wells page"
          (click)="onNextPageClick($event)"
        >
          <mat-icon aria-hidden="true">keyboard_double_arrow_right</mat-icon>
        </button>
      }

      <span class="chip-strip__page-indicator">{{ pageLabel() }}</span>
    </div>

    <!-- Right controls — wells overview + fullscreen -->
    <div class="fullscreen-toggle-section">
      <button
        type="button"
        class="fullscreen-toggle wells-overview-btn"
        (click)="toggleWellsOverview.emit()"
        title="All Wells Overview"
        aria-label="Open All Wells Overview"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3"/>
          <path d="M3 13h18"/>
          <path d="M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
        </svg>
      </button>

      <button type="button" class="fullscreen-toggle" (click)="toggleFullscreen.emit()"
        [title]="isFullscreen() ? 'Exit full screen' : 'Enter full screen'"
        [attr.aria-label]="isFullscreen() ? 'Exit full screen' : 'Enter full screen'">
        @if (!isFullscreen()) {
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M8 3H5a2 2 0 0 0-2 2v3"/>
            <path d="M21 8V5a2 2 0 0 0-2-2h-3"/>
            <path d="M3 16v3a2 2 0 0 0 2 2h3"/>
            <path d="M16 21h3a2 2 0 0 0 2-2v-3"/>
          </svg>
        } @else {
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M8 3v3a2 2 0 0 1-2 2H3"/>
            <path d="M21 8h-3a2 2 0 0 1-2-2V3"/>
            <path d="M3 16h3a2 2 0 0 1 2 2v3"/>
            <path d="M16 21v-3a2 2 0 0 1 2-2h3"/>
          </svg>
        }
      </button>
    </div>
  </div>

  <div class="well-loading-slot" [class.well-loading-slot--active]="loaderVisible()">
    <mat-progress-bar mode="indeterminate" class="well-loading-bar" />
  </div>
</div>

```

---

## `src/app/features/presentation/well-name-chips/well-name-chips.component.scss`

```scss
.well-chips-shell {
  display: flex;
  flex-direction: column;
}

// ── Well chips container with date picker ────────────────────────────────────
.well-chips-container {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  gap: 24px;
  padding: 14px 24px;
  background: linear-gradient(180deg, #fbfdff 0%, #f5f9ff 100%);
  backdrop-filter: var(--glass-blur);
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  margin: 1.5em 0 1em;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.12);
}

// ── Date picker section — left side ──────────────────────────────────────────
.date-picker-section {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  justify-self: start;
  min-width: 0;
}

.date-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.date-cal-btn {
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: var(--text-secondary);
  padding: 0;
  transition: color 0.18s ease, background 0.18s ease;

  svg {
    width: 15px;
    height: 15px;
  }

  &:hover {
    color: var(--accent);
    background: var(--accent-muted);
  }
}

.date-native-hidden {
  position: absolute;
  right: 0;
  top: 0;
  width: 32px;
  height: 100%;
  opacity: 0;
  pointer-events: none;
  border: none;
  background: transparent;
  padding: 0;
  margin: 0;
  -webkit-appearance: none;
  appearance: none;
}

.date-picker-label {
  font-size: 13px;
  font-weight: 800;
  color: var(--text-primary);
  white-space: nowrap;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.date-picker-input {
  padding: 8px 36px 8px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius-inner);
  background: #ffffff;
  color: var(--text-primary);
  font-family: inherit;
  font-size: 15px;
  font-weight: 700;
  cursor: text;
  transition: border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
  min-width: 138px;
  width: 138px;
  box-sizing: border-box;

  &:hover {
    border-color: var(--accent-hover);
    background: var(--accent-muted);
    box-shadow: var(--shadow-sm);
  }

  &:focus {
    outline: none;
    border-color: var(--accent);
    background: #fff;
    box-shadow: 0 0 0 3px var(--accent-muted);
  }
}

// ── Chip strip — centered relative to the toolbar/card ───────────────────────
.chip-strip {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px;
  grid-column: 2;
  justify-self: center;
  min-width: 0;
  max-width: min(100%, 900px);
  background: transparent;
  backdrop-filter: none;
  border: none;
  border-radius: 0;
  margin: 0;
  box-shadow: none;
  padding: 0;

  &__label {
    font-size: 13px; font-weight: 800;
    letter-spacing: 0.08em; text-transform: uppercase;
    color: var(--text-primary); margin-right: 12px; flex-shrink: 0;
  }
  &__page-indicator {
    font-size: 13px; font-weight: 700;
    color: var(--text-secondary); opacity: 1;
    margin-left: 8px; flex-shrink: 0;
  }
}

// ── Right controls — wells overview + fullscreen ─────────────────────────────
.fullscreen-toggle-section {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  flex-shrink: 0;
  justify-self: end;
  grid-column: 3;
}

.fullscreen-toggle {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: 1.5px solid var(--border);
  background: var(--bg-surface);
  color: var(--text-primary);
  cursor: pointer;
  transition: border-color 0.18s, background 0.18s, color 0.18s, box-shadow 0.18s, transform 0.18s;

  svg {
    width: 15px;
    height: 15px;
    flex-shrink: 0;
  }

  &:hover {
    border-color: var(--accent);
    color: var(--accent);
    background: var(--accent-muted);
    transform: scale(1.05);
  }
}

.wells-overview-btn--active {
  border-color: var(--accent) !important;
  background: var(--accent-muted, rgba(14, 165, 233, 0.08)) !important;
  color: var(--accent) !important;
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.15) !important;
}

@media (max-width: 1100px) {
  .well-chips-container {
    grid-template-columns: 1fr;
    justify-items: center;
  }

  .date-picker-section,
  .chip-strip,
  .fullscreen-toggle-section {
    grid-column: auto;
    justify-self: center;
  }
}

// ── Chip button styles ───────────────────────────────────────────────────────
.chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: var(--radius-inner);
  border: 1px solid var(--border);
  background: #ffffff;
  color: var(--text-primary);
  font-family: inherit;
  font-size: 14px; font-weight: 700;
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
  position: relative;
  overflow: hidden;
  appearance: none;
  -webkit-appearance: none;
  outline: none;
  -webkit-tap-highlight-color: transparent;
  isolation: isolate;

  &::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; bottom: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.1), transparent);
    opacity: 0;
    transition: opacity 0.2s;
    z-index: 0;
  }

  &:hover {
    border-color: var(--accent);
    color: var(--text-primary);
    background: rgba(14, 165, 233, 0.1);
    box-shadow: var(--shadow-sm);
    &::before { opacity: 1; }
  }

  &--active {
    background: linear-gradient(180deg, #f0fdf4 0%, #dcfce7 100%);
    border-color: #22c55e;
    color: var(--text-primary);
    font-weight: 800;
    box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.14), 0 10px 20px rgba(34, 197, 94, 0.12);

    .chip__dot {
      background: #16a34a;
      box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.28);
    }

    .chip__text {
      color: var(--text-primary);
    }
  }

  &--nav {
    width: 34px;
    height: 34px;
    min-width: 34px;
    padding: 0;
    justify-content: center;
    color: var(--accent);
    font-weight: 800;
    gap: 0;

    mat-icon {
      width: 20px;
      height: 20px;
      font-size: 20px;
      line-height: 20px;
      position: relative;
      z-index: 1;
    }
  }

  &--page-nav {
    color: var(--text-primary);
  }

  &--well-nav {
    color: var(--accent);
  }

  &.chip--nav:hover,
  &.chip--nav:focus {
    background: #ffffff;
    color: var(--accent);
    border-color: var(--border);
    box-shadow: none;

    &::before { opacity: 0; }
  }

  &:focus-visible {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.16);
  }

  &__dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: rgba(14, 165, 233, 0.35); flex-shrink: 0;
    transition: background-color 0.2s ease, box-shadow 0.2s ease;
    position: relative;
    z-index: 1;
  }

  &__text {
    position: relative;
    z-index: 1;
    color: inherit;
    line-height: 1.3;
  }
}

.well-loading-slot {
  height: 4px;
  margin-top: 6px;
  opacity: 0;
  transition: opacity 0.22s ease;
  pointer-events: none;

  &--active {
    opacity: 1;
  }
}

.well-loading-bar {
  height: 4px;
  --mdc-linear-progress-track-height: 4px;
  --mdc-linear-progress-active-indicator-height: 4px;
  --mdc-linear-progress-track-color: rgba(14, 165, 233, 0.14);
  --mdc-linear-progress-active-indicator-color: transparent;
}

:host ::ng-deep .well-loading-bar .mdc-linear-progress__bar-inner {
  border-top: none !important;
  height: 4px;
  background: linear-gradient(to right, #3b82f6, #22c55e);
}

```

---

## `src/app/features/presentation/well-name-chips/well-name-chips.component.spec.ts`

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WellNameChipsComponent } from './well-name-chips.component';
import { PresentationStore } from '../store/presentation.store';
import { NotificationService } from '@shared/components/notification/notification.service';

const presentationStoreMock = {
  wellNames: jest.fn(() => []),
  pagedWellNames: jest.fn(() => []),
  wellNamesPage: jest.fn(() => 0),
  totalPages: jest.fn(() => 1),
  hasPrevPage: jest.fn(() => false),
  hasNextPage: jest.fn(() => false),
  hasPrevWell: jest.fn(() => false),
  hasNextWell: jest.fn(() => false),
  selectedWell: jest.fn(() => null),
  selectedEpANum: jest.fn(() => null),
  selectedDate: jest.fn(() => ''),
  isLoaded: jest.fn(() => false),
  isLoading: jest.fn(() => false),
  isDetailsLoading: jest.fn(() => false),
  loadWellList: jest.fn(),
  selectWell: jest.fn(),
  setDate: jest.fn(),
  nextPage: jest.fn(),
  prevPage: jest.fn(),
  nextWell: jest.fn(),
  prevWell: jest.fn(),
};

const notificationServiceMock = {
  show: jest.fn(),
  error: jest.fn(),
  notifications: jest.fn(() => []),
  dismiss: jest.fn(),
};

describe('WellNameChipsComponent', () => {
  let component: WellNameChipsComponent;
  let fixture: ComponentFixture<WellNameChipsComponent>;

  beforeEach(async () => {
    jest.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [WellNameChipsComponent],
      providers: [
        { provide: PresentationStore, useValue: presentationStoreMock },
        { provide: NotificationService, useValue: notificationServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WellNameChipsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should move to the next well from the single-arrow control', () => {
    const event = new Event('click');
    jest.spyOn(event, 'preventDefault');

    (component as unknown as { onNextWellClick(event: Event): void }).onNextWellClick(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(presentationStoreMock.nextWell).toHaveBeenCalled();
  });

  it('should move to the previous well from the single-arrow control', () => {
    const event = new Event('click');
    jest.spyOn(event, 'preventDefault');

    (component as unknown as { onPrevWellClick(event: Event): void }).onPrevWellClick(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(presentationStoreMock.prevWell).toHaveBeenCalled();
  });
});

```

---

## `src/app/features/presentation/well-name-chips/well-name-chips.component.ts`

```ts
import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, ViewChild, computed, effect, inject, input, output, Signal, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { PresentationStore } from '../store/presentation.store';
import { NotificationService } from '@shared/components/notification/notification.service';
import { blockFutureDigits, clampDateDigits, formatDateForInput, getTodayAtMidnight, parseDateFromInput, validateDateInput } from 'src/app/shared/utils/date.util';

@Component({
  selector: 'app-well-name-chips',
  standalone: true,
  imports: [NgClass, FormsModule, MatIconModule, MatProgressBarModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './well-name-chips.component.html',
  styleUrl:    './well-name-chips.component.scss',
})
export class WellNameChipsComponent {
  @ViewChild('nativeDateInput') private nativeDateInput?: ElementRef<HTMLInputElement>;

  protected readonly store = inject(PresentationStore);
  private readonly destroyRef = inject(DestroyRef);
  private readonly notify = inject(NotificationService);
  protected readonly maxDateString = formatDateForInput(getTodayAtMidnight());
  protected readonly loaderVisible = signal(false);

  readonly isFullscreen = input(false);
  readonly toggleFullscreen = output<void>();
  readonly toggleWellsOverview = output<void>();

  private loaderTimer: ReturnType<typeof setTimeout> | null = null;
  private loaderShownAt = 0;

  protected readonly pageLabel = computed(() =>
    `${this.store.wellNamesPage() + 1} / ${this.store.totalPages()}`
  );

  protected readonly selectedDate: Signal<Date> = computed(() => {
    const d = this.store.selectedDate();
    return d instanceof Date ? d : new Date(d);
  });

  protected readonly selectedDateString = computed(() =>
    formatDateForInput(this.selectedDate())
  );

  constructor() {
    effect(() => {
      const isLoading = this.store.isDetailsLoading();

      if (isLoading) {
        this.clearLoaderTimer();
        this.loaderShownAt = Date.now();
        this.loaderVisible.set(true);
        return;
      }

      if (!this.loaderVisible()) {
        return;
      }

      const elapsed = Date.now() - this.loaderShownAt;
      const remaining = Math.max(0, 360 - elapsed);

      this.clearLoaderTimer();
      this.loaderTimer = setTimeout(() => {
        this.loaderVisible.set(false);
        this.loaderTimer = null;
      }, remaining);
    });

    this.destroyRef.onDestroy(() => this.clearLoaderTimer());
  }

  /**
   * Called when a well name chip is clicked.
   * Loads well data for the selected well and current date.
   */
  protected onWellChipClick(epANum: number): void {
    this.store.selectWell({
      epANum,
      date: this.selectedDateString(),
    });
  }

  protected onDateInputChange(value: string): void {
    this.commitDate(value);
  }

  protected onDateAutoFormat(event: Event): void {
    const input = event.target as HTMLInputElement;
    const selStart = input.selectionStart ?? 0;
    const rawVal = input.value;

    const rawDigits = rawVal.replace(/\D/g, '').slice(0, 8);
    const endsWithHyphen = rawVal.trimEnd().endsWith('-');

    const paddedDigits = (endsWithHyphen && rawDigits.length === 5)
      ? rawDigits.slice(0, 4) + '0' + rawDigits[4]
      : rawDigits;

    const { digits, isFuture } = blockFutureDigits(clampDateDigits(paddedDigits));

    if (isFuture) {
      this.notify.error('Future dates are not allowed');
    }

    let formatted = digits;
    if (digits.length >= 5) formatted = digits.slice(0, 4) + '-' + digits.slice(4);
    if (digits.length >= 7) formatted = digits.slice(0, 4) + '-' + digits.slice(4, 6) + '-' + digits.slice(6);

    const trailingHyphen = endsWithHyphen && !isFuture && (digits.length === 4 || digits.length === 6);
    if (trailingHyphen) formatted += '-';

    const oldDashes = (rawVal.slice(0, selStart).match(/-/g) ?? []).length;
    const newDashes = (formatted.slice(0, selStart).match(/-/g) ?? []).length;
    const newCursor = trailingHyphen
      ? formatted.length
      : Math.min(selStart + (newDashes - oldDashes), formatted.length);

    input.value = formatted;
    input.setSelectionRange(newCursor, newCursor);

    if (digits.length === 8) {
      this.commitDate(formatted);
    }
  }

  protected onDateTextCommit(value: string): void {
    this.commitDate(value);
  }

  protected openNativePicker(): void {
    this.nativeDateInput?.nativeElement.showPicker?.();
  }

  private commitDate(value: string): void {
    let digits = clampDateDigits(value.trim().replace(/\D/g, '').slice(0, 8));

    if (digits.length < 6) return;

    if (digits.length === 6) digits += '01';
    else if (digits.length === 7) digits = digits.slice(0, 6) + '0' + digits[6];

    const normalized = `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;

    const error = validateDateInput(normalized);
    if (error === 'invalid') { this.notify.error('Invalid date — use YYYY-MM-DD format'); return; }
    if (error === 'future')  { this.notify.error('Future dates are not allowed'); return; }

    const newStr = formatDateForInput(parseDateFromInput(normalized));
    if (newStr !== this.selectedDateString()) {
      this.store.setDate(newStr);
    }
  }

  protected onNextPageClick(event: Event): void {
    event.preventDefault();
    this.store.nextPage();
  }

  protected onPrevPageClick(event: Event): void {
    event.preventDefault();
    this.store.prevPage();
  }

  protected onNextWellClick(event: Event): void {
    event.preventDefault();
    this.store.nextWell();
  }

  protected onPrevWellClick(event: Event): void {
    event.preventDefault();
    this.store.prevWell();
  }

  private clearLoaderTimer(): void {
    if (this.loaderTimer !== null) {
      clearTimeout(this.loaderTimer);
      this.loaderTimer = null;
    }
  }
}

```

---


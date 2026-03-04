import { computed, inject } from '@angular/core';
import {
    patchState,
    signalStore,
    withComputed,
    withMethods,
    withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { map, pipe, switchMap, tap } from 'rxjs';
import { MorningReport } from '../models/well-name.model';
import { IWellData } from 'src/app/shared/models/wwell/wwell-data.model';
import { WellboreDiagramData } from '../models/wellbore-diagram.model';
import { WellDataService } from '../services/well-data.service';
import { sortCasingsByDepthDesc } from 'src/app/shared/utils/wellbore-math.util';
import { MoriningReportService } from '../services/morning-report-service';
import { WellName } from '../models/well-name.model';
import { IFormationTops } from 'src/app/shared/models/wwell/formation-tops.model';
import { WellLogsIndicators } from 'src/app/shared/models/wwell/well-logs-indicators.model';


export interface MiscWellData {
    wellName: string;
    wellType: string;
    targetedAquifer: string;
    currentStatus: string;
    daysSinceSpud: number;
    targetDays: number;
    biNum: string;
    waterWell: string;
    footage: number;
    previousWell: string;
    currentDepth: number;
    nextWell: string;
    feetDrilledToday: number;
    targetDesc: string;
    supportingWell: string;
}

export interface PickedFormationTops {
    formation: string;
    depth: number;
    remarks: string;
}

export interface OffsetWaterWells {
    wellName: string;
    aquifer: string;
    tds: number;
    rpm: number;
    h2s: number;
    distance: number;
    productivity: number;
    rate: number;
}

const PAGE_SIZE = 5;

interface WellState {
    readonly wellNames: WellName[];
    readonly selectedEpANum: number | null;
    readonly wellDetails: IWellData | null;
    readonly loading: boolean;
    readonly error: string | null;
    readonly animationTrigger: number;
    readonly wellNamesPage: number;
}

const initialState: WellState = {
    wellNames: [],
    selectedEpANum: null,
    wellDetails: null,
    loading: false,
    error: null,
    animationTrigger: 0,
    wellNamesPage: 0,
};

const FALLBACK_STR = 'N/A';

function mapToMiscWellData(d: IWellData | null): MiscWellData | null {
    if (!d) return null;
    const rigActivity = d.RIG_ACTIVITY?.[0];
    const drlgOpStatus = d.DRLG_OP_STATUS?.[0];

    return {
        wellName: rigActivity?.wellName ?? d.WELL_MASTER?.[0]?.well ?? FALLBACK_STR,
        targetDesc: rigActivity?.welltype ?? rigActivity?.drlgPlanWellDesc ?? FALLBACK_STR,
        targetedAquifer: d.EXAD_GWD_IR_HYDROGEOLOGY?.[0]?.estTargetAquifier ?? FALLBACK_STR,
        currentStatus: drlgOpStatus?.nxt24HrPlanRmk ?? drlgOpStatus?.wOpRmk ?? FALLBACK_STR,
        daysSinceSpud: drlgOpStatus?.spuddays ?? 0,
        targetDays: d.NEW_TARGET_DAYS?.[0]?.targetDays ?? rigActivity?.wDrlgTrgtDay ?? 0,
        biNum: rigActivity?.biNum ?? FALLBACK_STR,
        supportingWell: rigActivity?.waterWell ?? FALLBACK_STR,
        feetDrilledToday: d.DRLG_FD_TDAY?.[0]?.footage ?? drlgOpStatus?.footage ?? 0,
        previousWell: FALLBACK_STR,
        currentDepth: drlgOpStatus?.wPrsntDpth ?? 0,
        nextWell: d.NEXT_2_WELL_ACTIVITY?.[0]?.nextWellActivity ?? FALLBACK_STR,

        wellType: '',

        waterWell: '',
        footage: 0,

    };
}

export const WellStore = signalStore(
    { providedIn: 'root' },
    withState<WellState>(initialState),

    withComputed(({ wellDetails, wellNames, wellNamesPage }) => ({

        uniqueWellNames: computed(() => {
            const seen = new Set<string>();
            return wellNames().filter((w) => {
                if (seen.has(w.wellName)) return false;
                seen.add(w.wellName);
                return true;
            });
        }),

        isLoaded: computed(() => wellDetails() !== null),

        totalDepth: computed(
            () => wellDetails()?.EXAD_RCD_PREWAP?.[0]?.estTargetDepth ?? 4000,
        ),

        /** Total number of pages given PAGE_SIZE */
        totalPages: computed(() => {
            const seen = new Set<string>();
            const unique = wellNames().filter((w) => {
                if (seen.has(w.wellName)) return false;
                seen.add(w.wellName);
                return true;
            });
            return Math.ceil(unique.length / PAGE_SIZE);
        }),

        /** The 5 well names visible on the current page */
        pagedWellNames: computed(() => {
            const seen = new Set<string>();
            const unique = wellNames().filter((w) => {
                if (seen.has(w.wellName)) return false;
                seen.add(w.wellName);
                return true;
            });
            const start = wellNamesPage() * PAGE_SIZE;
            return unique.slice(start, start + PAGE_SIZE);
        }),

        hasPrevPage: computed(() => wellNamesPage() > 0),

        hasNextPage: computed(() => {
            const seen = new Set<string>();
            const unique = wellNames().filter((w) => {
                if (seen.has(w.wellName)) return false;
                seen.add(w.wellName);
                return true;
            });
            return (wellNamesPage() + 1) * PAGE_SIZE < unique.length;
        }),

        diagramData: computed((): WellboreDiagramData | null => {
            const d = wellDetails();
            if (!d) return null;
            return {
                wellName: d.WELL_MASTER?.[0]?.well ?? '',
                totalDepth: d.EXAD_RCD_PREWAP?.[0]?.estTargetDepth ?? 4000,
                casings: sortCasingsByDepthDesc(d.EXAD_GWD_IR_CASING ?? []),
                geologicTops: [...(d.EXAD_GWD_IR_TOPS ?? [])].sort(
                    (a, b) => a.planTvdDepth - b.planTvdDepth,
                ),
                hydrogeology: d.EXAD_GWD_IR_HYDROGEOLOGY?.[0] ?? null,
                prewap: d.EXAD_RCD_PREWAP?.[0] ?? null,
                rigActivity: d.RIG_ACTIVITY?.[0] ?? null,
                currentDepth:
                    d.DRLG_OP_STATUS?.[0]?.wPrsntDpth ??
                    d.EXAD_RCD_PREWAP?.[0]?.estTargetDepth ??
                    0,
            };
        }),

        miscWellData: computed(() => mapToMiscWellData(wellDetails())),

        pickedFormations: computed((): PickedFormationTops[] => {
            return (wellDetails()?.DRLG_FM_TOPS ?? []).map((fm: IFormationTops) => ({
                formation: fm.stLongCd ?? '',
                depth: fm.wStDmrkDpth ?? 0,
                remarks: fm.wStDmrkRmk ?? ''
            }));
        }),

        offsetWells: computed((): OffsetWaterWells[] => {
            const d = wellDetails();
            if (!d) return [];

            const offsetData = d.EXAD_GWD_IR_WATER ?? [];
            const testOutcomes = d.WATER_WELL_TEST_OUTCOME ?? [];
            return offsetData.map((ow) => {
                const test = testOutcomes.find(t => t.wellName === ow.offsetWaterWell);
                return {
                    wellName: ow.offsetWaterWell,
                    aquifer: ow.aquifer || test?.aquifer || 'WASI',
                    tds: test?.tds ?? 0,
                    rpm: ow?.rpm ?? 0,
                    h2s: ow.h2s,
                    distance: ow.distance ?? 0,
                    productivity: d.EXAD_GWD_IR_HYDROGEOLOGY?.[0]?.estProductivity ?? 2.1,
                    rate: test?.flowRate ?? ow.flowRate ?? 930
                };
            });
        }),

        wellsLogsIndicators: computed<WellLogsIndicators | null>(() => {
            const d = wellDetails();
            if (!d) return null;

            const header = d.EXAD_GWD_IR_HEADER?.[0];
            return {
                rcc: !!header?.dtRemarks,          // corrected property name
                mudLog: !!header?.mudRemarks,      // corrected property name
                logging: !!header?.loggingRemarks // corrected typo
            };
        }),

    })),

    withMethods((store, wellDataService = inject(WellDataService), morningReportService = inject(MoriningReportService)) => {
        const selectWell = rxMethod<number>(
            pipe(
                tap((epANum) =>
                    patchState(store, {
                        selectedEpANum: epANum,
                        loading: true,
                        error: null,
                    }),
                ),
                switchMap((epANum) =>
                    wellDataService.getWellDetails(epANum).pipe(
                        tapResponse({
                            next: (wellDetails) =>
                                patchState(store, {
                                    wellDetails,
                                    loading: false,
                                    animationTrigger: store.animationTrigger() + 1,
                                }),
                            error: (err: Error) =>
                                patchState(store, {
                                    error: err.message ?? 'Failed to load well details',
                                    loading: false,
                                }),
                        }),
                    ),
                ),
            ),
        );

        const loadWellNames = rxMethod<void>(
            pipe(
                tap(() => patchState(store, { loading: true, error: null })),
                switchMap(() =>
                    morningReportService.getMorningReport().pipe(
                        map((reports: MorningReport[]) =>
                            reports.map((report) => ({
                                wellName: report.wGnrName,
                                epANum: Number(report.epANum)
                            }))
                        ),
                        tapResponse({
                            next: (wellNames) => {
                                patchState(store, { wellNames, loading: false });
                                if (wellNames.length > 0 && !store.selectedEpANum()) {
                                    selectWell(wellNames[0].epANum);
                                }
                            },
                            error: (err: Error) =>
                                patchState(store, {
                                    error: err.message ?? 'Failed to load well names',
                                    loading: false,
                                }),
                        }),
                    ),
                ),
            ),
        );
        return {
            selectWell,
            loadWellNames,
            nextPage(): void {
                const nextPageIndex = store.wellNamesPage() + 1;
                patchState(store, { wellNamesPage: nextPageIndex });
                // Auto-select first well on the new page
                const seen = new Set<string>();
                const unique = store.wellNames().filter((w) => {
                    if (seen.has(w.wellName)) return false;
                    seen.add(w.wellName);
                    return true;
                });
                const firstOnPage = unique[nextPageIndex * PAGE_SIZE];
                if (firstOnPage) selectWell(firstOnPage.epANum);
            },
            prevPage(): void {
                const prevPageIndex = Math.max(0, store.wellNamesPage() - 1);
                patchState(store, { wellNamesPage: prevPageIndex });
                // Auto-select first well on the new page
                const seen = new Set<string>();
                const unique = store.wellNames().filter((w) => {
                    if (seen.has(w.wellName)) return false;
                    seen.add(w.wellName);
                    return true;
                });
                const firstOnPage = unique[prevPageIndex * PAGE_SIZE];
                if (firstOnPage) selectWell(firstOnPage.epANum);
            },
        };
    }),
);

======

<div class="chip-strip" role="list" aria-label="Available wells">
  <span class="chip-strip__label">Wells</span>

  <!-- Prev arrow — sits flush before the first chip -->
  @if (hasPrevPage()) {
    <button
      class="chip chip--nav"
      aria-label="Previous wells"
      (click)="prevPage.emit()"
    >
      ‹
    </button>
  }

  @for (well of wells(); track trackByEpANum($index, well)) {
    <button
      class="chip"
      role="listitem"
      [ngClass]="{ 'chip--active': well.epANum === selectedEpANum() }"
      [attr.aria-pressed]="well.epANum === selectedEpANum()"
      (click)="chipSelected.emit(well.epANum)"
    >
      <span class="chip__dot"></span>
      {{ well.wellName }}
    </button>
  }

  <!-- Next arrow — sits flush after the last chip -->
  @if (hasNextPage()) {
    <button
      class="chip chip--nav"
      aria-label="Next wells"
      (click)="nextPage.emit()"
    >
      ›
    </button>
  }

  <span class="chip-strip__page-indicator">
    {{ pageLabel() }}
  </span>
</div>
=======
$chip-bg:            #ffffff; /* White by default */
$chip-border:        #cbd5e1;
$chip-text:          #334155; /* Dark text */
$chip-active-bg:     #87ceeb; /* Sky blue when selected */
$chip-active-border: #38bdf8;
$strip-bg:           #ffffff; /* Removed black background */
$accent:             #0ea5e9;

.chip-strip {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
  padding: 10px 20px;
  background: $strip-bg;
  border-bottom: 1px solid #e2e8f0;
 border: 1px solid #0000002e;
    margin-bottom: 1em;
    border-radius: 8px;
    margin-top: 2em;

  &__label {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1.2px;
    text-transform: uppercase;
    color: #64748b;
    margin-right: 4px;
    flex-shrink: 0;
  }

  &__page-indicator {
    font-size: 10px;
    font-weight: 700;
    color: #94a3b8;
    letter-spacing: 0.5px;
    margin-left: 6px;
    flex-shrink: 0;
  }
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 14px 5px 10px;
  border-radius: 20px;
  border: 1.5px solid $chip-border;
  background: $chip-bg;
  color: $chip-text;
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.4px;
  cursor: pointer;
  outline: none;
  transition:
    background 0.18s ease,
    border-color 0.18s ease,
    color 0.18s ease,
    box-shadow 0.18s ease,
    transform 0.12s ease;

  &:hover {
    background: #f8fafc;
    border-color: $accent;
    color: #0f172a;
    transform: translateY(-1px);
  }

  &:focus-visible {
    box-shadow: 0 0 0 3px rgba($accent, 0.4);
  }

  &:active {
    transform: translateY(0);
  }

  &--active {
    background: $chip-active-bg;
    border-color: $chip-active-border;
    color: #0f172a; /* Dark text for contrast against sky blue */
    box-shadow: 0 2px 10px rgba(135, 206, 235, 0.55);

    .chip__dot {
      background: #ffffff;
      box-shadow: 0 0 5px #ffffff;
    }
  }

  &--nav {
    min-width: 28px;
    padding: 5px 10px;
    font-size: 16px;
    font-weight: 700;
    color: #0369a1;
    border-color: #bae6fd;
    background: #f0f9ff;
    line-height: 1;

    &:hover {
      background: #e0f2fe;
      border-color: #38bdf8;
      color: #0284c7;
      transform: translateY(-1px);
    }
  }

  &__dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #94a3b8;
    flex-shrink: 0;
    transition: background 0.2s, box-shadow 0.2s;
  }
}
=====
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { NgClass } from '@angular/common';
import { WellName } from 'src/app/core/models/well-name.model';


@Component({
  selector: 'app-well-name-chips',
  standalone: true,
  imports: [NgClass],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './well-name-chips.component.html',
  styleUrl: './well-name-chips.component.scss',
})
export class WellNameChipsComponent {
  readonly wells          = input.required<WellName[]>();
  readonly selectedEpANum = input<number | null>(null);
  readonly hasPrevPage    = input<boolean>(false);
  readonly hasNextPage    = input<boolean>(false);
  readonly currentPage    = input<number>(0);
  readonly totalPages     = input<number>(1);

  readonly chipSelected = output<number>();
  readonly prevPage     = output<void>();
  readonly nextPage     = output<void>();

  protected readonly pageLabel = computed(
    () => `${this.currentPage() + 1} / ${this.totalPages()}`
  );

  protected trackByEpANum(_: number, w: WellName): number {
    return w.epANum;
  }
}
======
<div class="presentation">
  <!-- Header -->
  <header class="presentation__header mb-1">
    <!-- <div class="header__brand">
      <span class="header__icon">⛽</span>
      <h1 class="header__title">Well Design Viewer</h1>
    </div> -->

    <!-- @if (store.loading()) {
      <div class="header__loading" role="status" aria-live="polite">
        <span class="spinner"></span>
        <span>Loading…</span>
      </div>
    } -->
  </header>

  <!-- Well Name Chips — paginated (5 per page) -->
  <app-well-name-chips
    [wells]="store.pagedWellNames()"
    [selectedEpANum]="store.selectedEpANum()"
    [hasPrevPage]="store.hasPrevPage()"
    [hasNextPage]="store.hasNextPage()"
    [currentPage]="store.wellNamesPage()"
    [totalPages]="store.totalPages()"
    (chipSelected)="onWellSelected($event)"
    (prevPage)="onPrevPage()"
    (nextPage)="onNextPage()"
  />

  <!-- Error Banner -->
  @if (store.error()) {
    <div class="error-banner" role="alert">
      <span>⚠</span> {{ store.error() }}
    </div>
  }

  <!-- Diagram Area -->
  <main class="presentation__diagram">
    <div class="w-1/3">
      <app-misc-pres-well-data
        [data]="store.miscWellData()"
      ></app-misc-pres-well-data>
      <br />

      <app-picked-formation-tops
        [tops]="store.pickedFormations()"
      ></app-picked-formation-tops>
    </div>

    @if (!store.isLoaded() && !store.loading()) {
      <div class="empty-state">
        <div class="empty-state__icon">🛢</div>
        <p class="empty-state__text">
          Select a well above to render the wellbore diagram
        </p>
      </div>
    }
    <div class="w-2/3 ml-4 well-svg-div">
      @if (store.isLoaded()) {
        <div class="diagram-scroll">
          <app-depth-scale
            [totalDepth]="store.totalDepth()"
            [animTrigger]="store.animationTrigger()"
          />
          <app-well-bore-view
            [diagramData]="store.diagramData()"
            [animTrigger]="store.animationTrigger()"
          />
        </div>
      }
      <app-wwells-logs-indicators></app-wwells-logs-indicators> 
    </div>

    <aside class="presentation__sidebar presentation__sidebar--right">
      <app-active-wwell-map></app-active-wwell-map>
      <app-offset-wwells [wells]="store.offsetWells()"></app-offset-wwells>
    </aside>
  </main>
</div>
====
$bg-app:     #f1f5f9; 
$border:     #e2e8f0;
$accent:     #0ea5e9;
$danger:     #ef4444;

:host {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background: $bg-app;
}

.presentation {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;

  &__body {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: row; /* Aligns Sidebar and Diagram side-by-side */
    gap: 20px;
    padding: 20px;
  }

  &__sidebar {
    width: 360px; /* Fixed width for the data cards */
    min-width: 360px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    overflow-y: auto;
    padding-right: 4px; /* Space for scrollbar if needed */

        margin-left: 2em;
  }

  &__diagram {
    flex: 1;
    display: flex;
    align-items: stretch;
    justify-content: flex-start;
    overflow: hidden;
  }
}

.diagram-scroll {
  display: flex;
  align-items: stretch; 
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08), 0 1px 4px rgba(0, 0, 0, 0.04);
  overflow: hidden; 
  height: 94%;
  width: 100%;
  max-width: 1100px;
  border: 1px solid #00000052;
}

/* Utilities */
.loading-bar {
  height: 3px;
  background: $accent;
  width: 100%;
  animation: loading-sweep 1.5s infinite linear;
}

@keyframes loading-sweep {
  0% { transform: scaleX(0); transform-origin: left; }
  50% { transform: scaleX(1); transform-origin: left; }
  50.1% { transform: scaleX(1); transform-origin: right; }
  100% { transform: scaleX(0); transform-origin: right; }
}

.error-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 20px;
  background: rgba($danger, 0.12);
  border-bottom: 1px solid rgba($danger, 0.4);
  color: $danger;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  gap: 16px;
  color: #94a3b8;
  
  &__icon { font-size: 52px; opacity: 0.3; }
}

/* ── Well chips pagination nav ─────────────────────────────────── */
.well-chips-nav {
  display: flex;
  align-items: center;
  gap: 0;

  &__chips {
    flex: 1;
  }
}

.well-chips-nav__indicator {
  text-align: center;
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.nav-btn {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 68px;
  height: 34px;
  padding: 0 14px;
  border-radius: 8px;
  border: 1.5px solid #cbd5e1;
  background: #ffffff;
  color: #334155;
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.3px;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, color 0.15s, transform 0.1s;

  &:hover:not(:disabled) {
    background: #f0f9ff;
    border-color: #38bdf8;
    color: #0369a1;
    transform: translateY(-1px);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }

  &--prev { margin-right: 8px; }
  &--next { margin-left:  8px; }
}
/* ─────────────────────────────────────────────────────────────── */
====
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';

import { WellBoreViewComponent } from './well-bore-view/wellbore-view.component';
import { WellStore } from 'src/app/core/store/well.store';
import { DepthScaleComponent } from "./depth-scale/depth-scale.component";
import { WellNameChipsComponent } from "./well-name-chips/well-name-chips.component";
import { MiscPresWellDataComponent } from "./misc-pres-well-data/misc-pres-well-data.component";
import { PickedFormationTopsComponent } from "./picked-formation-tops/picked-formation-tops.component";
import { ActiveWwellMapComponent } from "./active-wwell-map/active-wwell-map.component";
import { OffsetWwellsComponent } from './offset-wwells/offset-wwells.component';
import { WwellsLogsIndicatorsComponent } from './wwells-logs-indicators/wwells-logs-indicators.component';



@Component({
  selector: 'app-persentation',
  imports: [ WellBoreViewComponent, DepthScaleComponent, WellNameChipsComponent, MiscPresWellDataComponent, PickedFormationTopsComponent, ActiveWwellMapComponent, OffsetWwellsComponent, WwellsLogsIndicatorsComponent],
  templateUrl: './persentation.component.html',
  styleUrl: './persentation.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PersentationComponent implements OnInit {

  protected readonly store = inject(WellStore);

  ngOnInit(): void {
    this.store.loadWellNames();
  }

  protected onWellSelected(epANum: number): void {
    this.store.selectWell(epANum);
  }

  protected onNextPage(): void {
    this.store.nextPage();
  }

  protected onPrevPage(): void {
    this.store.prevPage();
  }

}

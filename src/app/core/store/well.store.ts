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
import { pipe, switchMap, tap, map, catchError } from 'rxjs';

import { WellName, MorningReport } from '../models/well-name.model';
import { WellDetails } from '../models/well-details.model';
import { WellboreDiagramData } from '../models/wellbore-diagram.model';
import { WellDataService } from '../services/well-data.service';
import { sortCasingsByDepthDesc } from '../../shared/utils/wellbore-math.util';

export interface MiscWellData {
  wellName: string;
  targetDesc: string;
  targetedAquifer: string;
  currentStatus: string;
  daysSinceSpud: number;
  targetDays: number;
  biNum: string;
  supportingWell: string;
  feetDrilledToday: number;
  previousWell: string;
  currentDepth: number;
  nextWell: string;
}

export interface PickedFormationData {
  formation: string;
  depth: number;
  remarks: string;
}

interface WellState {
  readonly wellNames: WellName[];
  readonly selectedEpANum: number | null;
  readonly wellDetails: WellDetails | null;
  readonly loading: boolean;
  readonly error: string | null;
  readonly animationTrigger: number;
}

const initialState: WellState = {
  wellNames: [],
  selectedEpANum: null,
  wellDetails: null,
  loading: false,
  error: null,
  animationTrigger: 0,
};

// --- CONSTANTS ---
const DEFAULT_TOTAL_DEPTH = 4000;
const FALLBACK_STR = 'N/A';

// --- PURE MAPPING FUNCTIONS ---
// Extracted to keep the store clean and make mappings highly testable
function mapToDiagramData(d: WellDetails | null): WellboreDiagramData | null {
  if (!d) return null;
  
  return {
    wellName: d.WELL_MASTER?.[0]?.well ?? '',
    totalDepth: d.EXAD_RCD_PREWAP?.[0]?.estTargetDepth ?? DEFAULT_TOTAL_DEPTH,
    casings: sortCasingsByDepthDesc(d.EXAD_GWD_IR_CASING ?? []),
    geologicTops: [...(d.EXAD_GWD_IR_TOPS ?? [])].sort((a, b) => a.planTvdDepth - b.planTvdDepth),
    hydrogeology: d.EXAD_GWD_IR_HYDROGEOLOGY?.[0] ?? null,
    prewap: d.EXAD_RCD_PREWAP?.[0] ?? null,
    rigActivity: d.RIG_ACTIVITY?.[0] ?? null,
    currentDepth: d.DRLG_OP_STATUS?.[0]?.wPrsntDpth ?? d.EXAD_RCD_PREWAP?.[0]?.estTargetDepth ?? 0,
  };
}

function mapToMiscWellData(d: WellDetails | null): MiscWellData | null {
  if (!d) return null;
  
  // Cache deeply nested arrays to prevent multiple lookups
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
  };
}

export const WellStore = signalStore(
  { providedIn: 'root' },
  withState<WellState>(initialState),

  withComputed(({ wellDetails, wellNames }) => ({
    
    uniqueWellNames: computed(() => {
      const seen = new Set<string>();
      return wellNames().filter((w) => {
        if (seen.has(w.wellName)) return false;
        seen.add(w.wellName);
        return true;
      });
    }),

    isLoaded: computed(() => wellDetails() !== null),

    totalDepth: computed(() => wellDetails()?.EXAD_RCD_PREWAP?.[0]?.estTargetDepth ?? DEFAULT_TOTAL_DEPTH),

    diagramData: computed(() => mapToDiagramData(wellDetails())),

    miscWellData: computed(() => mapToMiscWellData(wellDetails())),

    pickedFormations: computed((): PickedFormationData[] => {
      return (wellDetails()?.DRLG_FM_TOPS ?? []).map((t) => ({
        formation: t.stLongCd,
        depth: t.wStDmrkDpth,
        remarks: t.wStDmrkRmk,
      }));
    }),
    
  })),

  withMethods((store) => {
    // 3. Inject dependencies inside the scope block, not as method arguments
    const wellDataService = inject(WellDataService);

    const selectWell = rxMethod<number>(
      pipe(
        tap((epANum) =>
          patchState(store, { selectedEpANum: epANum, loading: true, error: null })
        ),
        switchMap((epANum) =>
          wellDataService.getWellDetails(epANum).pipe(
            tapResponse({
              next: (wellDetails) => 
                // 2. Use updater function since animationTrigger depends on its previous state
                patchState(store, (state) => ({ 
                  wellDetails, 
                  loading: false, 
                  animationTrigger: state.animationTrigger + 1 
                })),
              error: (err: Error) => 
                patchState(store, { error: err.message ?? 'Failed to load well details', loading: false })
            })
          )
        )
      )
    );

    const loadWellNames = rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() =>
          wellDataService.getMorningReport().pipe(
            map((reports: MorningReport[]) => reports.map((report) => ({ wellName: report.wGnrName, epANum: Number(report.epANum) }))),
            catchError((err) => {
              console.warn('API /morning-report failed. Falling back to static JSON.', err);
              return wellDataService.getWellNames(); 
            }),
            tapResponse({
              next: (mappedWellNames: WellName[]) => {
                patchState(store, { wellNames: mappedWellNames, loading: false });
                if (mappedWellNames.length > 0 && !store.selectedEpANum()) {
                  selectWell(mappedWellNames[0].epANum);
                }
              },
              error: (err: Error) => patchState(store, { error: err.message ?? 'Failed to load well names', loading: false })
            })
          )
        )
      )
    );

    return { selectWell, loadWellNames };
  })
);
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
import { pipe, switchMap, tap } from 'rxjs';

import { WellName } from '../models/well-name.model';
import { WellDetails } from '../models/well-details.model';
import { WellboreDiagramData } from '../models/wellbore-diagram.model';
import { WellDataService } from '../services/well-data.service';
import { sortCasingsByDepthDesc } from '../../shared/utils/wellbore-math.util';

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

    totalDepth: computed(
      () => wellDetails()?.EXAD_RCD_PREWAP?.[0]?.estTargetDepth ?? 4000,
    ),

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
  })),

  withMethods((store, wellDataService = inject(WellDataService)) => ({

    loadWellNames: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() =>
          wellDataService.getWellNames().pipe(
            tapResponse({
              next: (wellNames) =>
                patchState(store, { wellNames, loading: false }),
              error: (err: Error) =>
                patchState(store, {
                  error: err.message ?? 'Failed to load well names',
                  loading: false,
                }),
            }),
          ),
        ),
      ),
    ),

    selectWell: rxMethod<number>(
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
    ),
  })),
);

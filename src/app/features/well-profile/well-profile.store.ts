import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { EMPTY, pipe, switchMap, tap } from 'rxjs';
import { IntegratedRequirement } from '@models/wwell-planning/integrated-requirement.model';
import { WwellIrService } from '../wwell-planning/wwell-ir/wwell-ir.service';
import { mergeIrDetailBlocksIntoIntegratedRequirement } from '../wwell-planning/wwell-ir/wwell-ir-form/wwell-ir-detail-response.mapper';
import { ProfileMode, buildProfile } from './well-profile.data';
import { formationAtDepth, stringsAtDepth } from './well-profile.geometry';

export const WellProfileStore = signalStore(
  withState({ mode: 'transparent' as ProfileMode, depth: 0, selectedId: '', opacity: 25, exploded: false, spread: 0,
    casingFill: '#b8bec6', linerFill: '#969fa9', irs: [] as IntegratedRequirement[], record: null as IntegratedRequirement | null,
    irSeq: null as number | null, listLoading: false, detailLoading: false, listError: '', detailError: '' }),
  withComputed(s => ({ profile: computed(() => buildProfile(s.record())) })),
  withComputed(s => ({
    strings: computed(() => s.profile().strings), formations: computed(() => s.profile().formations), totalDepth: computed(() => s.profile().totalDepth),
    selected: computed(() => s.profile().strings.find(d => d.id === s.selectedId()) ?? null),
    shellOpacity: computed(() => s.mode() === 'solid' ? .45 : s.mode() === 'xray' ? .04 : s.opacity()/100),
    reading: computed(() => {
      const p = s.profile(), active = stringsAtDepth(p.strings, s.depth()), formation = formationAtDepth(p.formations, s.depth());
      return `${formation?.stLongCd ?? 'Formation not specified'} · ${active.length ? active.map(d => `${d.csgSize}″ ${d.csgType.toLowerCase()}`).join(' + ') : s.depth() === p.totalDepth ? 'Total depth' : p.openHole && s.depth() >= p.openHole.top ? 'Open hole' : 'No casing specified at this depth'}`;
    }),
    coverage: computed(() => {
      const selected = s.profile().strings.find(d => d.id === s.selectedId());
      return selected ? s.profile().formations.map(f => ({ name: f.stLongCd,
        length: Math.max(0, Math.min(selected.csgDepth, f.bottom)-Math.max(selected.top, f.planTvdDepth)), total: selected.csgDepth-selected.top,
      })).filter(f => f.length > 0) : [];
    }),
  })),
  withMethods((s, service = inject(WwellIrService)) => ({
    loadIrs: rxMethod<void>(pipe(tap(() => patchState(s, { listLoading: true, listError: '' })), switchMap(() => service.getIrs().pipe(tapResponse({
      next: irs => patchState(s, { irs, listLoading: false }), error: () => patchState(s, { listLoading: false, listError: 'Unable to load integrated requirements. Please retry.' }),
    }))))),
    loadIr: rxMethod<number>(pipe(tap(irSeq => patchState(s, { irSeq, record: null, detailLoading: true, detailError: '', selectedId: '', depth: 0, exploded: false, spread: 0 })), switchMap(irSeq => {
      const summary = s.irs().find(ir => ir.irSeq === irSeq);
      if (!summary) { patchState(s, { detailLoading: false, detailError: 'This IR is not available in the list.' }); return EMPTY; }
      return service.getIrDetailBlocks(irSeq).pipe(tapResponse({
        next: blocks => {
          const record = mergeIrDetailBlocksIntoIntegratedRequirement(summary, blocks);
          patchState(s, { record, detailLoading: false, selectedId: buildProfile(record).strings[0]?.id ?? '' });
        }, error: () => patchState(s, { detailLoading: false, detailError: 'Unable to load this IR. Please retry.' }),
      }));
    }))),
    setMode(mode: ProfileMode) { patchState(s, { mode }); },
    setOpacity(opacity: number) { patchState(s, { opacity: Math.max(10, Math.min(70, opacity)) }); },
    setDepth(depth: number) { if (Number.isFinite(depth)) patchState(s, { depth: Math.max(0, Math.min(s.totalDepth(), depth)) }); },
    select(selectedId: string) { if (s.strings().some(d => d.id === selectedId)) patchState(s, { selectedId }); },
    setFill(kind: 'casingFill' | 'linerFill', value: string) { if (/^#[0-9a-f]{6}$/i.test(value)) patchState(s, { [kind]: value }); },
    toggleExploded() { patchState(s, { exploded: !s.exploded(), mode: s.mode() === 'profile' ? 'solid' : s.mode() }); },
    setSpread(spread: number) { patchState(s, { spread: Math.max(0, Math.min(1, spread)) }); },
  })),
);

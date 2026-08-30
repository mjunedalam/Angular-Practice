import { IntegratedRequirement, IntegratedRequirementRequestReference } from '@models/wwell-planning/integrated-requirement.model';
import { IrEligibleWell } from './wwell-ir-payload.model';

/**
 * Single source of truth for resolving a "Link to Request" selection (the raw prewap_seq id
 * stored as `linkedRequestId`) to Water Well Name / Coordinates / Surface Elevation — none of
 * which exad_gwd_ir_header has a column for (see docs/ir/EXAD_GWD_IR_HEADER.md; only prewap_seq
 * itself is persisted). Every consumer that needs those three fields — the editor's live
 * auto-populate-on-select and the store's read-time hydration below — goes through these same
 * functions instead of keeping its own copy of the lookup/formatting logic.
 *
 * Deliberately never cached across reads: `hydrateIrsRequestReference` is meant to be called
 * fresh on every read (see WwellIrStore.hydratedIrs), re-deriving these fields from whatever GET
 * /wells/eligible-for-ir most recently returned — including right after a browser reload, where
 * no client-side "just saved this" echo survives. It does build a short-lived prewap_seq → well
 * index for the duration of one such pass (see indexEligibleWellsByPrewapSeq below), so resolving
 * every IR's linked well is an O(1) lookup instead of a full re-scan of `wells` per IR.
 */

/** Indexes `wells` by prewap_seq (as a string, matching `linkedRequestId`'s own type) once, so
 *  resolving many IRs' linked wells (see hydrateIrsRequestReference below) is a single map build
 *  plus O(1) `.get()`s instead of a linear `.find()` scan of the whole array repeated per IR. */
function indexEligibleWellsByPrewapSeq(wells: readonly IrEligibleWell[]): ReadonlyMap<string, IrEligibleWell> {
  return new Map(wells.map(well => [String(well.prewapSeq), well]));
}

export function findLinkedWell(linkedRequestId: string | null, wells: readonly IrEligibleWell[]): IrEligibleWell | undefined {
  console.log('[IR:link] findLinkedWell — searching', { linkedRequestId, wellsLoaded: wells.length });
  if (!linkedRequestId) {
    console.log('[IR:link] findLinkedWell — no linkedRequestId, skipping');
    return undefined;
  }
  const match = indexEligibleWellsByPrewapSeq(wells).get(linkedRequestId);
  console.log(match ? '[IR:link] findLinkedWell — match found' : '[IR:link] findLinkedWell — NO match found', match ?? { linkedRequestId });
  return match;
}

export function linkedWellHasElevation(well: IrEligibleWell): boolean {
  const has = well.surfaceElevation != null;
  console.log('[IR:link] linkedWellHasElevation', { prewapSeq: well.prewapSeq, surfaceElevation: well.surfaceElevation, has });
  return has;
}

export function linkedWellHasCoordinates(well: IrEligibleWell): boolean {
  const has = well.surfaceNorth != null && well.surfaceEast != null;
  console.log('[IR:link] linkedWellHasCoordinates', { prewapSeq: well.prewapSeq, surfaceNorth: well.surfaceNorth, surfaceEast: well.surfaceEast, has });
  return has;
}

export function formatLinkedWellCoordinates(well: IrEligibleWell): string {
  const formatted = `${well.surfaceNorth}°N, ${well.surfaceEast}°E`;
  console.log('[IR:link] formatLinkedWellCoordinates', { prewapSeq: well.prewapSeq, formatted });
  return formatted;
}

/** Overrides `reference`'s Well Name/Surface Elevation/Coordinates with whatever `well` actually
 *  supplies — BI Number/Supporting Business/Target Aquifer/Target Depth have no source on an
 *  eligible-well record (exad_rcd_prewap doesn't carry them) and are left untouched. Falls back
 *  to `reference`'s own value for elevation/coordinates specifically when the well doesn't have
 *  that one field, rather than blanking it. */
export function hydrateRequestReferenceFromLinkedWell(
  reference: IntegratedRequirementRequestReference,
  well: IrEligibleWell,
): IntegratedRequirementRequestReference {
  console.log('[IR:link] hydrateRequestReferenceFromLinkedWell — before', { reference, well });
  const hydrated = {
    ...reference,
    wellName: well.wellName,
    surfaceElevationFtAsl: linkedWellHasElevation(well) ? (well.surfaceElevation as number) : reference.surfaceElevationFtAsl,
    coordinates: linkedWellHasCoordinates(well) ? formatLinkedWellCoordinates(well) : reference.coordinates,
  };
  console.log('[IR:link] hydrateRequestReferenceFromLinkedWell — after', hydrated);
  return hydrated;
}

/** No-op when `ir` has no `linkedRequestId`, or the linked well isn't (or isn't yet) in
 *  `wellsBySeq` — callers should always be prepared for it to be empty (e.g. GET
 *  /wells/eligible-for-ir hasn't resolved yet), in which case this just returns `ir` unchanged
 *  rather than blanking it. Takes the pre-built prewap_seq index (see
 *  indexEligibleWellsByPrewapSeq above) rather than the raw `wells` array so a caller hydrating
 *  many IRs at once (hydrateIrsRequestReference below) builds that index exactly once, not once
 *  per IR. */
function hydrateIrRequestReferenceFromIndex(
  ir: IntegratedRequirement,
  wellsBySeq: ReadonlyMap<string, IrEligibleWell>,
): IntegratedRequirement {
  console.log('[IR:link] hydrateIrRequestReference — IR', { irId: ir.id, linkedRequestId: ir.requestReference.linkedRequestId });
  const linkedRequestId = ir.requestReference.linkedRequestId;
  const well = linkedRequestId ? wellsBySeq.get(linkedRequestId) : undefined;
  if (!well) {
    console.log('[IR:link] hydrateIrRequestReference — no linked well, returning IR unchanged', { irId: ir.id });
    return ir;
  }
  const hydratedIr = { ...ir, requestReference: hydrateRequestReferenceFromLinkedWell(ir.requestReference, well) };
  console.log('[IR:link] hydrateIrRequestReference — IR hydrated', { irId: ir.id, requestReference: hydratedIr.requestReference });
  return hydratedIr;
}

export function hydrateIrsRequestReference(
  irs: readonly IntegratedRequirement[],
  wells: readonly IrEligibleWell[],
): readonly IntegratedRequirement[] {
  console.log('[IR:link] hydrateIrsRequestReference — start', { irsCount: irs.length, wellsCount: wells.length });
  if (!wells.length) {
    console.log('[IR:link] hydrateIrsRequestReference — no linked wells loaded yet, skipping hydration');
    return irs;
  }
  // Built once for the whole pass — every IR below does an O(1) `.get()` by its own prewap_seq
  // instead of each re-scanning the full `wells` array (see indexEligibleWellsByPrewapSeq).
  const wellsBySeq = indexEligibleWellsByPrewapSeq(wells);
  return irs.map(ir => hydrateIrRequestReferenceFromIndex(ir, wellsBySeq));
}

import { IntegratedRequirementRequestReference } from '@models/wwell-planning/integrated-requirement.model';
import { formatUtmCoordinates, parseUtmZone } from '../wwell-ir-coordinates.util';
import { IrEligibleWell } from './wwell-ir-payload.model';

/**
 * Resolves a "Link to Request" selection (the raw prewap_seq id) to Water Well Name / Coordinates
 * / Surface Elevation while the user is actively picking a NEW link in the editor — see
 * wwell-ir-editor.component.ts's `applyLinkedRequestWell`. `wells` here is always
 * store.linkedRequestWells() (GET /wells/eligible-for-ir), which is the right source at this
 * exact moment: before the IR is saved, no exad_gwd_ir_header row references this prewap_seq yet,
 * so the well genuinely is still "eligible" and present in that list.
 *
 * NOT used to hydrate an already-saved IR's Request Reference — get_ir_wells_prc's own
 * eligibility filter (NOT EXISTS ... exad_gwd_ir_header) permanently excludes a well the instant
 * any IR is saved against its prewap_seq, so this lookup can never resolve a persisted record's
 * own link again. That case is handled by the new exad_rcd_prewap block get_ir_data_prc returns
 * (a live join on the header's own prewap_seq) — see wwell-ir-detail-response.mapper.ts.
 */

export function findLinkedWell(linkedRequestId: string | null, wells: readonly IrEligibleWell[]): IrEligibleWell | undefined {
  if (!linkedRequestId) return undefined;
  return wells.find(candidate => String(candidate.prewapSeq) === linkedRequestId);
}

export function linkedWellHasElevation(well: IrEligibleWell): boolean {
  return well.surfaceElevation != null;
}

/** Also requires a readable UTM zone — `surfaceNorth`/`surfaceEast` are real UTM northing/easting
 *  meters (see wwell-ir-coordinates.util.ts), not usable on their own without knowing which zone
 *  they're measured against. */
export function linkedWellHasCoordinates(well: IrEligibleWell): boolean {
  return well.surfaceNorth != null && well.surfaceEast != null && parseUtmZone(well.utmZone) !== null;
}

export function linkedWellHasTargetDepth(well: IrEligibleWell): boolean {
  return well.targetDepth != null;
}

export function linkedWellHasTargetAquifer(well: IrEligibleWell): boolean {
  return well.targetAquifer != null;
}

export function linkedWellHasSupportingBusiness(well: IrEligibleWell): boolean {
  return well.supportings != null;
}

/** `surfaceNorth`/`surfaceEast` are UTM meters (`exad_rcd_prewap.surfacen`/`surfacee`), not
 *  decimal-degree latitude/longitude — this used to just slap "°N"/"°E" straight onto them as if
 *  they were degrees. Shown as the raw survey values they are (Northing/Easting/Zone), not
 *  converted to anything else. Only called after `linkedWellHasCoordinates` confirms a readable
 *  zone, but falls back to empty rather than a bogus string if that invariant is ever violated. */
export function formatLinkedWellCoordinates(well: IrEligibleWell): string {
  if (well.surfaceNorth == null || well.surfaceEast == null) return '';
  return formatUtmCoordinates(well.surfaceNorth, well.surfaceEast, well.utmZone) ?? '';
}

/** Overrides `reference`'s Well Name/Surface Elevation/Coordinates/Target Depth/Target
 *  Aquifer/Supporting Business with whatever `well` actually supplies — BI Number still has no
 *  source on an eligible-well record (exad_rcd_prewap doesn't carry it) and is left untouched.
 *  Falls back to `reference`'s own value for every other overridden field specifically when the
 *  well doesn't have that one field, rather than blanking it. Target Depth is read-only in the
 *  UI (see the field's schema entry, wwell-ir-form.schema.ts) precisely because this is its only
 *  real source — exad_gwd_ir_header has nowhere to save a manually-typed value anyway. */
export function hydrateRequestReferenceFromLinkedWell(
  reference: IntegratedRequirementRequestReference,
  well: IrEligibleWell,
): IntegratedRequirementRequestReference {
  return {
    ...reference,
    wellName: well.wellName,
    surfaceElevationFtAsl: linkedWellHasElevation(well) ? (well.surfaceElevation as number) : reference.surfaceElevationFtAsl,
    coordinates: linkedWellHasCoordinates(well) ? formatLinkedWellCoordinates(well) : reference.coordinates,
    targetDepthFt: linkedWellHasTargetDepth(well) ? (well.targetDepth as number) : reference.targetDepthFt,
    targetAquifer: linkedWellHasTargetAquifer(well) ? (well.targetAquifer as string) : reference.targetAquifer,
    supportingBusiness: linkedWellHasSupportingBusiness(well) ? (well.supportings as string) : reference.supportingBusiness,
  };
}

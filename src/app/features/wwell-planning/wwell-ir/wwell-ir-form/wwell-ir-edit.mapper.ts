import { IntegratedRequirement } from '@models/wwell-planning/integrated-requirement.model';
import {
  WwellIrFormRawValue,
  WwellIrRawCasingRow,
  WwellIrRawFormationTop,
  WwellIrRawGeologist,
  WwellIrRawHydrology,
  WwellIrRawOffsetWell,
  WwellIrRawProgramMain,
  WwellIrRawReference,
  WwellIrRawRemarks,
} from './wwell-ir-form.types';

export interface WwellIrEditFormPatch {
  readonly reference: { readonly main: WwellIrRawReference };
  readonly programDetails: {
    readonly main: WwellIrRawProgramMain;
    readonly developmentTesting: IntegratedRequirement['programDetails']['developmentTesting'];
  };
  readonly contacts: { readonly geologist: WwellIrRawGeologist; readonly remarks: WwellIrRawRemarks };
  readonly hydrogeology: { readonly main: WwellIrRawHydrology };
}

/**
 * Inverse of mapIrFormValueToSubmission (wwell-ir-form.mapper.ts) — rebuilds the editor's simple
 * (non-repeatable) field values from an already-saved IntegratedRequirement. Repeatable rows
 * (formationTops/casing/offsetWells) aren't included here since patching a FormArray also needs
 * to grow it first — see populateRepeatableSection in wwell-ir-editor.component.ts, which uses
 * the row builders below instead.
 */
export function mapIntegratedRequirementToFormPatch(ir: IntegratedRequirement): WwellIrEditFormPatch {
  return {
    reference: {
      main: {
        linkedRequestId: ir.requestReference.linkedRequestId ?? '',
        letterNumber: ir.requestReference.letterNumber ?? '',
        client: ir.requestReference.client,
        supportingBusiness: ir.requestReference.supportingBusiness,
        wellName: ir.requestReference.wellName,
        targetAquifer: ir.requestReference.targetAquifer,
        // A brand-new draft is created with a blank form submitted through the required-number
        // fallback in mapIrFormValueToSubmission (targetDepthFt ?? 0), so a freshly-created record
        // comes back with 0 here rather than a true "not yet entered" value — redisplay it as
        // empty rather than a misleading pre-filled "0".
        targetDepthFt: ir.requestReference.targetDepthFt || null,
        surfaceElevationFtAsl: ir.requestReference.surfaceElevationFtAsl,
        coordinates: ir.requestReference.coordinates,
      },
    },
    programDetails: {
      main: {
        completion: ir.programDetails.completion,
        openHoleSizeIn: ir.programDetails.openHoleSizeIn ?? '',
        acidization: ir.programDetails.acidization,
        transmission: ir.programDetails.transmission,
      },
      developmentTesting: { ...ir.programDetails.developmentTesting },
    },
    contacts: {
      geologist: {
        geologistPrimary: ir.contacts.geologistPrimary,
        geologistSecondary: ir.contacts.geologistSecondary ?? '',
      },
      remarks: { offsetWellsRemarks: ir.offsetWellsRemarks ?? '' },
    },
    hydrogeology: {
      main: {
        testType: ir.testProgram.testType,
        aquifer: ir.hydrogeology.aquifer,
        siwhpPsi: ir.testProgram.siwhpPsi ?? null,
        estimatedTdsPpm: ir.hydrogeology.estimatedTdsPpm,
        estimatedRateGpm: ir.testProgram.estimatedRateGpm,
        h2sPpm: ir.hydrogeology.h2sPpm,
        estimatedWaterLevelFt: ir.testProgram.estimatedWaterLevelFt,
        estimatedPumpDepthFt: ir.hydrogeology.estimatedPumpDepthFt,
      },
    },
  };
}

export function formationTopRowPatch(row: IntegratedRequirement['formationTops'][number]): WwellIrRawFormationTop {
  return {
    name: row.name,
    depthFt: row.depthFt,
    subSeaFtAsl: row.subSeaFtAsl ?? null,
    description: row.description ?? '',
  };
}

export function casingRowPatch(row: IntegratedRequirement['casing'][number]): WwellIrRawCasingRow {
  return {
    type: row.type,
    sizeIn: row.sizeIn,
    depthFtBgl: row.depthFtBgl,
    tolFtBgl: row.tolFtBgl,
    remarks: row.remarks ?? '',
  };
}

export function offsetWellRowPatch(row: IntegratedRequirement['offsetWells'][number]): WwellIrRawOffsetWell {
  return {
    wellName: row.wellName,
    distanceKm: row.distanceKm ?? null,
    location: row.location ?? '',
    aquifer: row.aquifer ?? '',
    totalDepthFt: row.totalDepthFt ?? null,
    testDurationMin: row.testDurationMin ?? null,
    rateGpm: row.rateGpm ?? null,
    rpm: row.rpm ?? null,
    swlFt: row.swlFt ?? null,
    pwlFt: row.pwlFt ?? null,
    drawdownFt: row.drawdownFt ?? null,
    specificCapacity: row.specificCapacity ?? null,
    tdsPpm: row.tdsPpm ?? null,
    h2sPpm: row.h2sPpm ?? null,
  };
}

/**
 * Full inverse of mapIrFormValueToSubmission — unlike mapIntegratedRequirementToFormPatch above
 * (simple fields only, for patching an already-built section FormGroup), this rebuilds a complete
 * WwellIrFormRawValue standalone, repeatable rows included. Used by the IR editor's per-section
 * inline edit (wwell-ir-editor.component.ts): saving one section's edits still needs to resubmit
 * every *other* section's current (untouched) values alongside it, since
 * buildWwellIrBulkSavePayload/mapIrFormValueToSubmission both take the form's full raw value, not
 * a partial patch. Attachments have no such round-trip (a File can't be rebuilt from a saved
 * name), so that slot is always empty here — callers pass the final attachment name list to
 * WwellIrStore.createIr directly instead.
 */
export function mapIntegratedRequirementToRawFormValue(ir: IntegratedRequirement): WwellIrFormRawValue {
  const patch = mapIntegratedRequirementToFormPatch(ir);
  return {
    reference: { main: patch.reference.main },
    subsurface: {
      formationTops: ir.formationTops.map(formationTopRowPatch),
      casing: ir.casing.map(casingRowPatch),
    },
    programDetails: patch.programDetails,
    contacts: {
      geologist: patch.contacts.geologist,
      offsetWells: ir.offsetWells.map(offsetWellRowPatch),
      remarks: patch.contacts.remarks,
    },
    hydrogeology: patch.hydrogeology,
    attachments: { locationMap: { file: [] }, initiationRequest: { file: [] } },
  };
}

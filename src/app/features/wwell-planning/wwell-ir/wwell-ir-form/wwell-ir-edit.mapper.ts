import { IntegratedRequirement } from '@models/wwell-planning/integrated-requirement.model';
import {
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
 * Inverse of mapIrFormValueToSubmission (wwell-ir-form.mapper.ts) — rebuilds the wizard's simple
 * (non-repeatable) field values from an already-saved IntegratedRequirement, for the edit flow.
 * Repeatable rows (formationTops/casing/offsetWells) aren't included here since patching a
 * FormArray also needs to grow it first — see populateRepeatableSection in
 * wwell-ir-new-page.component.ts, which uses the row builders below instead.
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
        targetDepthFt: ir.requestReference.targetDepthFt,
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

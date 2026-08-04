import {
  CreateIntegratedRequirementPayload,
  IntegratedRequirementStatus,
  IntegratedRequirementTestType,
} from '@models/wwell-planning/wwell-planning.model';
import { WwellIrFormRawValue } from './wwell-ir-form.types';

export interface MappedIrSubmission {
  readonly payload: CreateIntegratedRequirementPayload;
  readonly files: readonly File[];
}

/** Bridges the schema-shaped raw form value to the domain payload — the two are deliberately not the same shape. */
export function mapIrFormValueToSubmission(
  raw: WwellIrFormRawValue,
  status: Extract<IntegratedRequirementStatus, 'draft' | 'in-progress'>,
): MappedIrSubmission {
  const payload: CreateIntegratedRequirementPayload = {
    status,
    requestReference: {
      linkedRequestId: raw.reference.main.linkedRequestId || null,
      client: raw.reference.main.client,
      supportingBusiness: raw.reference.main.supportingBusiness,
      wellName: raw.reference.main.wellName,
      targetAquifer: raw.reference.main.targetAquifer,
      targetDepthFt: raw.reference.main.targetDepthFt ?? 0,
      surfaceElevationFtAsl: raw.reference.main.surfaceElevationFtAsl,
      coordinates: raw.reference.main.coordinates,
    },
    formationTops: raw.subsurface.formationTops.map(row => ({ name: row.name, depthFt: row.depthFt ?? 0 })),
    casing: raw.subsurface.casing.map(row => ({
      type: row.type,
      sizeIn: row.sizeIn,
      depthFtBgl: row.depthFtBgl ?? 0,
      remarks: row.remarks || null,
    })),
    programDetails: {
      completion: raw.programDetails.main.completion,
      acidization: raw.programDetails.main.acidization,
      transmission: raw.programDetails.main.transmission,
      developmentTesting: { ...raw.programDetails.developmentTesting },
    },
    contacts: {
      geologistPrimary: raw.contacts.geologist.geologistPrimary,
      geologistSecondary: raw.contacts.geologist.geologistSecondary || null,
    },
    offsetWells: raw.contacts.offsetWells.map(row => ({ wellName: row.wellName })),
    offsetWellsRemarks: raw.contacts.remarks.offsetWellsRemarks || null,
    hydrogeology: { ...raw.hydrogeology.estimated },
    testProgram: {
      testType: raw.hydrogeology.testProgram.testType as IntegratedRequirementTestType,
      estimatedRateGpm: raw.hydrogeology.testProgram.estimatedRateGpm,
      estimatedWaterLevelFt: raw.hydrogeology.testProgram.estimatedWaterLevelFt,
    },
  };

  const files = [...raw.attachments.files.locationMap, ...raw.attachments.files.initiationRequest];

  return { payload, files };
}

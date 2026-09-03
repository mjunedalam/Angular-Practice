import {
  CreateIntegratedRequirementPayload,
  IntegratedRequirementStatus,
  IntegratedRequirementTestType,
} from '@models/wwell-planning/integrated-requirement.model';
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
      letterNumber: raw.reference.main.letterNumber || null,
      client: raw.reference.main.client,
      supportingBusiness: raw.reference.main.supportingBusiness,
      wellName: raw.reference.main.wellName,
      targetAquifer: raw.reference.main.targetAquifer,
      targetDepthFt: raw.reference.main.targetDepthFt ?? 0,
      surfaceElevationFtAsl: raw.reference.main.surfaceElevationFtAsl,
      coordinates: raw.reference.main.coordinates,
    },
    formationTops: raw.subsurface.formationTops.map(row => ({
      name: row.name,
      depthFt: row.depthFt ?? 0,
      subSeaFtAsl: row.subSeaFtAsl,
      remarks: row.remarks || null,
    })),
    casing: raw.subsurface.casing.map(row => ({
      type: row.type,
      sizeIn: row.sizeIn,
      depthFtBgl: row.depthFtBgl ?? 0,
      tolFtBgl: row.tolFtBgl,
      remarks: row.remarks || null,
    })),
    programDetails: {
      completion: raw.programDetails.main.completion,
      openHoleSizeIn: raw.programDetails.main.openHoleSizeIn || null,
      acidization: raw.programDetails.main.acidization,
      transmission: raw.programDetails.main.transmission,
      developmentTesting: { ...raw.programDetails.developmentTesting },
    },
    contacts: {
      geologistPrimary: raw.contacts.geologist.geologistPrimary,
      geologistSecondary: raw.contacts.geologist.geologistSecondary || null,
    },
    offsetWells: raw.contacts.offsetWells.map(row => ({
      epANum: row.epANum ?? 0,
      distanceKm: row.distanceKm,
      location: row.location || null,
      aquifer: row.aquifer || null,
      totalDepthFt: row.totalDepthFt,
      testDurationMin: row.testDurationMin,
      rateGpm: row.rateGpm,
      rpm: row.rpm,
      swlFt: row.swlFt,
      pwlFt: row.pwlFt,
      drawdownFt: row.drawdownFt,
      specificCapacity: row.specificCapacity,
      tdsPpm: row.tdsPpm,
      h2sPpm: row.h2sPpm,
    })),
    offsetWellsRemarks: raw.contacts.remarks.offsetWellsRemarks || null,
    hydrogeology: {
      aquifer: raw.hydrogeology.main.aquifer,
      estimatedTdsPpm: raw.hydrogeology.main.estimatedTdsPpm,
      h2sPpm: raw.hydrogeology.main.h2sPpm,
      estimatedPumpDepthFt: raw.hydrogeology.main.estimatedPumpDepthFt,
    },
    testProgram: {
      testType: raw.hydrogeology.main.testType as IntegratedRequirementTestType,
      estimatedRateGpm: raw.hydrogeology.main.estimatedRateGpm,
      estimatedWaterLevelFt: raw.hydrogeology.main.estimatedWaterLevelFt,
      siwhpPsi: raw.hydrogeology.main.siwhpPsi,
    },
  };

  const files = [...raw.attachments.locationMap.file, ...raw.attachments.initiationRequest.file];

  return { payload, files };
}

import { IntegratedRequirement } from '@models/wwell-planning/wwell-planning.model';

export interface KvRow {
  readonly icon: string;
  readonly label: string;
  readonly value: string;
}

const EMPTY_VALUE = '—';

function fmtNum(value: number | null | undefined, unit?: string): string {
  if (value === null || value === undefined) return EMPTY_VALUE;
  return unit ? `${value} ${unit}` : `${value}`;
}

function fmtStr(value: string | null | undefined): string {
  return value ? value : EMPTY_VALUE;
}

export function buildGeneralInfoRows(ir: IntegratedRequirement): readonly KvRow[] {
  const r = ir.requestReference;
  return [
    { icon: 'tag', label: 'ID#', value: ir.code },
    { icon: 'description', label: 'Letter#', value: fmtStr(r.linkedRequestId) },
    { icon: 'water_drop', label: 'Water Well Name', value: r.wellName },
    { icon: 'business', label: 'Client', value: r.client },
    { icon: 'my_location', label: 'Coordinates', value: r.coordinates },
    { icon: 'apartment', label: 'Supporting Business', value: r.supportingBusiness },
    { icon: 'terrain', label: 'Surface Elevation', value: `${fmtNum(r.surfaceElevationFtAsl)} ft ASL` },
    { icon: 'layers', label: 'Target Aquifer', value: r.targetAquifer },
    { icon: 'south', label: 'Target Depth', value: fmtNum(r.targetDepthFt, 'ft') },
    { icon: 'update', label: 'Last Updated', value: ir.updatedDate },
  ];
}

export function buildProgramDetailsRows(ir: IntegratedRequirement): readonly KvRow[] {
  const p = ir.programDetails;
  return [
    { icon: 'construction', label: 'Completion', value: p.completion },
    { icon: 'assignment', label: 'Logging', value: fmtStr(p.developmentTesting.logging) },
    { icon: 'science', label: 'Acidization', value: fmtStr(p.acidization) },
    { icon: 'biotech', label: 'Mud Logging', value: fmtStr(p.developmentTesting.mudLogging) },
    { icon: 'cell_tower', label: 'Transmission', value: fmtStr(p.transmission) },
    { icon: 'colorize', label: 'Sampling', value: fmtStr(p.developmentTesting.sampling) },
    { icon: 'water', label: 'Flow Test', value: fmtStr(p.developmentTesting.flowTest) },
  ];
}

export function buildHydrogeologyRows(ir: IntegratedRequirement): readonly KvRow[] {
  return [
    { icon: 'layers', label: 'Aquifer', value: ir.hydrogeology.aquifer },
    { icon: 'assignment', label: 'Test Type', value: ir.testProgram.testType === 'pump-test' ? 'Pump Test' : 'Flow Test' },
    { icon: 'opacity', label: 'Estimated TDS', value: fmtNum(ir.hydrogeology.estimatedTdsPpm, 'ppm') },
    { icon: 'speed', label: 'Estimated Rate', value: fmtNum(ir.testProgram.estimatedRateGpm, 'GPM') },
    { icon: 'warning', label: 'H2S', value: fmtNum(ir.hydrogeology.h2sPpm, 'ppm') },
    { icon: 'waves', label: 'Estimated Water Level', value: fmtNum(ir.testProgram.estimatedWaterLevelFt, 'ft') },
    { icon: 'south', label: 'Estimated Pump Depth', value: fmtNum(ir.hydrogeology.estimatedPumpDepthFt, 'ft') },
  ];
}

export function buildGeologistContactRows(ir: IntegratedRequirement): readonly KvRow[] {
  const c = ir.contacts;
  return [
    { icon: 'person', label: 'Primary', value: c.geologistPrimary },
    { icon: 'person_outline', label: 'Secondary', value: fmtStr(c.geologistSecondary) },
  ];
}


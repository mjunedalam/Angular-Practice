import { IntegratedRequirement } from '@models/wwell-planning/integrated-requirement.model';

/** Flags a value that's actually meaningful, not just informational — e.g. a nonzero H2S
 *  reading should read as amber/danger regardless of which section it sits in. Omitted (or
 *  `'default'`) renders as a plain field. */
export type RowTone = 'default' | 'warning' | 'danger' | 'success';

export interface KvRow {
  readonly label: string;
  readonly value: string;
  readonly tone?: RowTone;
  /** Renders `value` as a small pill instead of plain text — for fields whose value is one of
   *  a fixed set of options (a completion type, a test type, ...), where a badge reads faster
   *  than inline text at a glance. */
  readonly badge?: boolean;
}

export const EMPTY_VALUE = '—';

export function fmtNum(value: number | null | undefined, unit?: string): string {
  if (value === null || value === undefined) return EMPTY_VALUE;
  return unit ? `${value} ${unit}` : `${value}`;
}

export function fmtStr(value: string | null | undefined): string {
  return value ? value : EMPTY_VALUE;
}

/** Mirrors the IR wizard's "Request Reference" step (wwell-ir-form.schema.ts) field-for-field,
 *  so the detail page's sections line up 1:1 with the stepper the data was captured through. */
export function buildRequestReferenceRows(ir: IntegratedRequirement): readonly KvRow[] {
  const r = ir.requestReference;
  return [
    { label: 'Link to Request', value: fmtStr(r.linkedRequestId) },
    { label: 'Letter Number', value: fmtStr(r.letterNumber) },
    { label: 'BI Number', value: r.client },
    { label: 'Supporting Business', value: r.supportingBusiness },
    { label: 'Water Well Name', value: r.wellName },
    { label: 'Target Aquifer', value: r.targetAquifer, badge: true },
    { label: 'Target Depth', value: fmtNum(r.targetDepthFt, 'ft') },
    { label: 'Surface Elevation', value: `${fmtNum(r.surfaceElevationFtAsl)} ft ASL` },
    { label: 'Coordinates', value: r.coordinates },
  ];
}

/** Mirrors the wizard's "Program Details" step — both its main fields and the nested
 *  Development/Testing subsection. `openHoleSizeIn` only ever means something when the
 *  completion type is 'Open Hole' (see the field's `visibleWhen` gate in the schema), so it's
 *  only included then rather than showing a dangling "—" the rest of the time. */
export function buildProgramDetailsRows(ir: IntegratedRequirement): readonly KvRow[] {
  const p = ir.programDetails;
  const rows: KvRow[] = [{ label: 'Completion', value: p.completion, badge: true }];

  if (p.completion === 'Open Hole') {
    rows.push({ label: 'Open Hole Size', value: fmtStr(p.openHoleSizeIn) });
  }

  rows.push(
    { label: 'Acidization', value: fmtStr(p.acidization), badge: true },
    { label: 'Transmission', value: fmtStr(p.transmission), badge: true },
    { label: 'Logging', value: fmtStr(p.developmentTesting.logging), badge: true },
    { label: 'Mud Logging', value: fmtStr(p.developmentTesting.mudLogging), badge: true },
    { label: 'Sampling', value: fmtStr(p.developmentTesting.sampling), badge: true },
    { label: 'Flow Test', value: fmtStr(p.developmentTesting.flowTest), badge: true },
  );
  return rows;
}

/** Mirrors the wizard's "Estimated Hydrology" step, including its test-type-conditional
 *  fields (SIWHP for a flow test; water level + pump depth for a pump test) — see the
 *  matching `visibleWhen` gates on `siwhpPsi`/`estimatedWaterLevelFt`/`estimatedPumpDepthFt`
 *  in wwell-ir-form.schema.ts. Any nonzero H2S gets `tone: 'warning'` — a toxic-gas reading is
 *  worth flagging on sight, not just listed at the same visual weight as TDS/rate. */
export function buildHydrogeologyRows(ir: IntegratedRequirement): readonly KvRow[] {
  const isFlowTest = ir.testProgram.testType === 'flow-test';
  const h2sPpm = ir.hydrogeology.h2sPpm;
  const rows: KvRow[] = [
    { label: 'Aquifer', value: ir.hydrogeology.aquifer, badge: true },
    { label: 'Test Type', value: isFlowTest ? 'Flow Test' : 'Pump Test', badge: true },
    { label: 'Estimated TDS', value: fmtNum(ir.hydrogeology.estimatedTdsPpm, 'ppm') },
    { label: 'Estimated Rate', value: fmtNum(ir.testProgram.estimatedRateGpm, 'GPM') },
    {
      label: 'H2S',
      value: fmtNum(h2sPpm, 'ppm'),
      tone: h2sPpm ? 'warning' : 'default',
    },
  ];

  if (isFlowTest) {
    rows.push({ label: 'SIWHP', value: fmtNum(ir.testProgram.siwhpPsi, 'psi') });
  } else {
    rows.push(
      { label: 'Estimated Water Level', value: fmtNum(ir.testProgram.estimatedWaterLevelFt, 'ft') },
      { label: 'Estimated Pump Depth', value: fmtNum(ir.hydrogeology.estimatedPumpDepthFt, 'ft') },
    );
  }
  return rows;
}

export function buildGeologistContactRows(ir: IntegratedRequirement): readonly KvRow[] {
  const c = ir.contacts;
  return [
    { label: 'Primary', value: c.geologistPrimary },
    { label: 'Secondary', value: fmtStr(c.geologistSecondary) },
  ];
}

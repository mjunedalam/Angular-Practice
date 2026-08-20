import { IntegratedRequirement } from '@models/wwell-planning/integrated-requirement.model';
import { EMPTY_VALUE, fmtNum, fmtStr, KvRow } from './wwell-ir-detail-rows.util';

/** Field groupings for the printable "Letter" tab — same underlying `IntegratedRequirement`
 *  data as the Details/Well Design tabs, but split and labeled to match the official GWD
 *  integrated-requirements letter format instead of the wizard's own step names. */
export function buildLetterWellLocationRows(ir: IntegratedRequirement): readonly KvRow[] {
  const r = ir.requestReference;
  return [
    { label: 'Coordinates', value: r.coordinates },
    { label: 'Surface Elevation', value: `${fmtNum(r.surfaceElevationFtAsl)} ft ASL` },
    { label: 'Target Aquifer', value: r.targetAquifer, badge: true },
  ];
}

/** `completion`/`logging`/`mudLogging`/`acidization` here; the remaining
 *  `programDetails`/`developmentTesting` fields (`transmission`/`sampling`/`flowTest`) go under
 *  "Production & Testing" below — together the two sections cover every field once. */
export function buildLetterDrillingProgramRows(ir: IntegratedRequirement): readonly KvRow[] {
  const p = ir.programDetails;
  return [
    { label: 'Completion Strategy', value: p.completion },
    { label: 'Logging Program', value: fmtStr(p.developmentTesting.logging) },
    { label: 'Mud Logging', value: fmtStr(p.developmentTesting.mudLogging) },
    { label: 'Acidization', value: fmtStr(p.acidization) },
  ];
}

export function buildLetterProductionTestingRows(ir: IntegratedRequirement): readonly KvRow[] {
  const p = ir.programDetails;
  return [
    { label: 'Transmission Method', value: fmtStr(p.transmission) },
    { label: 'Sampling Program', value: fmtStr(p.developmentTesting.sampling) },
    { label: 'Flow Test Type', value: fmtStr(p.developmentTesting.flowTest) },
  ];
}

/** The letter's closing signature block — "Prepared by" is always the primary geologist on
 *  record; "Approved by" only names a real approver once the IR has actually cleared the chain
 *  (mirrors `ApprovalChainStep.status` rather than assuming the last chain entry is meaningful
 *  before then). */
export function letterApprovedByName(ir: IntegratedRequirement): string {
  if (ir.status !== 'approved') return 'Pending Approval';
  const lastApproved = [...ir.chain].reverse().find(step => step.status === 'approved');
  return lastApproved?.name ?? EMPTY_VALUE;
}

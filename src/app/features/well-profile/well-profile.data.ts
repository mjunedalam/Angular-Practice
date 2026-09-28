import { ICasingIR } from '@shared/models/wwell/casing-ir.model';
import { ITopsIR } from '@shared/models/wwell/tops-ir.model';

/** Drawing metadata supplements the existing IR fields; no assumed liner overlap. */
export interface ProfileString extends ICasingIR {
  readonly id: string;
  readonly top: number;
  readonly topInferred?: boolean;
}
export type ProfileFormation = Pick<ITopsIR, 'stLongCd' | 'planTvdDepth'> & { readonly bottom: number };
export type ProfileMode = 'solid' | 'transparent' | 'xray' | 'profile';
export const REFERENCE_DEPTH = 3800;
export const REFERENCE_STRINGS: ProfileString[] = [
  { id: 'conductor', csgType: 'Conductor', csgSize: '30', top: 0, csgDepth: 120 },
  { id: 'surface', csgType: 'Surface', csgSize: '24', top: 0, csgDepth: 400 },
  { id: 'intermediate', csgType: 'Intermediate', csgSize: '18', top: 0, csgDepth: 1500 },
  { id: 'production', csgType: 'Production', csgSize: '13', top: 0, csgDepth: 2000 },
  { id: 'liner', csgType: 'Liner', csgSize: '9', top: 2000, csgDepth: 3300 },
];
export const REFERENCE_FORMATIONS: ProfileFormation[] = [
  { stLongCd: 'Above DMM', planTvdDepth: 0, bottom: 120 },
  { stLongCd: 'DMM', planTvdDepth: 120, bottom: 480 },
  { stLongCd: 'RUS', planTvdDepth: 480, bottom: 760 },
  { stLongCd: 'UMER', planTvdDepth: 760, bottom: 1450 },
  { stLongCd: 'ARUM', planTvdDepth: 1450, bottom: 2150 },
  { stLongCd: 'WASI', planTvdDepth: 2150, bottom: 3800 },
];

import { IntegratedRequirement } from '@models/wwell-planning/integrated-requirement.model';
import { parseInchSize } from '@shared/utils/wellbore-math.util';
import { deriveCompletionElementFlags } from '../wwell-planning/wwell-ir/wwell-ir-form/wwell-ir-wellbore-diagram.mapper';

/** Uses the existing IR schematic convention for missing TOL, explicitly marked as inferred. */
export function buildProfile(ir: IntegratedRequirement | null) {
  const warnings: string[] = [];
  const strings: ProfileString[] = [];
  let chainTop = Math.max(0, ...(ir?.casing ?? []).filter(row => !/liner/i.test(row.type) && Number.isFinite(row.depthFtBgl)).map(row => row.depthFtBgl));
  const ordered = (ir?.casing ?? []).map((row,index) => ({row,index})).sort((a,b) => a.row.depthFtBgl-b.row.depthFtBgl);
  for (const {index, row} of ordered) {
    const liner = /liner/i.test(row.type);
    const topInferred = liner && row.tolFtBgl === null;
    const top = liner ? row.tolFtBgl ?? (chainTop > 0 ? chainTop : null) : 0;
    const diameter = parseInchSize(row.sizeIn);
    if (top == null || !Number.isFinite(top) || top < 0 || !Number.isFinite(row.depthFtBgl) || row.depthFtBgl <= top || !diameter || diameter <= 0) {
      warnings.push(`${row.sizeIn}″ ${row.type}: incomplete or invalid diameter/depth${liner ? ' / liner top' : ''}; omitted from diagram.`);
      continue;
    }
    if (topInferred) warnings.push(`${row.sizeIn}″ liner: attached schematically at ${top} ft, the preceding shoe; actual TOL is not recorded.`);
    if (liner) chainTop = row.depthFtBgl;
    strings.push({ topInferred, id: `string-${index}`, csgType: row.type, csgSize: row.sizeIn, csgDepth: row.depthFtBgl, csgRemarks: row.remarks, top });
  }
  strings.sort((a, b) => (parseInchSize(b.csgSize) ?? 0) - (parseInchSize(a.csgSize) ?? 0));
  const target = ir?.requestReference.targetDepthFt ?? 0;
  const totalDepth = Math.max(Number.isFinite(target) ? target : 0, ...strings.map(s => s.csgDepth), 0);
  const tops = (ir?.formationTops ?? []).filter(f => Number.isFinite(f.depthFt) && f.depthFt >= 0 && f.depthFt < totalDepth).slice().sort((a,b) => a.depthFt-b.depthFt);
  const formations: ProfileFormation[] = tops.map((f,i) => ({ stLongCd: f.name, planTvdDepth: f.depthFt, bottom: tops[i+1]?.depthFt ?? totalDepth }));
  if (tops[0]?.depthFt > 0) formations.unshift({ stLongCd: 'Above '+tops[0].name, planTvdDepth: 0, bottom: tops[0].depthFt });
  const validLevel = (n: number | null | undefined): number | null => n != null && Number.isFinite(n) && n >= 0 && n <= totalDepth ? n : null;
  const pump = ir?.testProgram.testType === 'pump-test' ? validLevel(ir.hydrogeology.estimatedPumpDepthFt) : null;
  const water = validLevel(ir?.testProgram.estimatedWaterLevelFt);
  const flags = ir ? ir.programDetails.wellDesignFlags ?? deriveCompletionElementFlags(ir.programDetails.completion, ir.programDetails.openHoleSizeIn) : null;
  // The IR stores completion choices, not separate screen/gravel intervals. Only open-hole
  // below the deepest structural casing has a defined extent; don't invent screen lengths.
  const shoe = Math.max(0, ...strings.filter(s => !/liner/i.test(s.csgType)).map(s => s.csgDepth));
  const openHole = flags?.ohFlg === 'Y' && shoe > 0 && totalDepth > shoe ? { top: shoe, bottom: totalDepth } : null;
  return { strings, formations, totalDepth, pump, water, openHole, warnings,
    completion: ir?.programDetails.completion || 'Not specified',
    completionNote: flags?.gpFlg === 'Y' || flags?.lsFlg === 'Y' || flags?.perforatedFlg === 'Y' ? 'Screen / gravel / perforation intervals are not specified in this IR; shown in completion details only.' : null,
  };
}

import { IntegratedRequirement } from '@models/wwell-planning/integrated-requirement.model';

export type WwellIrTimelineStepStatus = 'completed' | 'pending';

/** Per-rail-group completion status for the Timeline view (see WWELL_IR_SECTION_RAIL) — a group
 *  counts as "completed" once it holds any meaningful data, so the timeline can tell work already
 *  captured apart from sections still waiting on input. `groupKey` matches a top-level
 *  WwellIrRailGroup.key; anything else falls back to 'pending'. */
export function wwellIrTimelineStepStatus(ir: IntegratedRequirement, groupKey: string): WwellIrTimelineStepStatus {
  switch (groupKey) {
    case 'wellbore':
      return ir.requestReference.wellName?.trim() ? 'completed' : 'pending';

    case 'general': {
      const { completion, acidization, transmission, openHoleSizeIn, developmentTesting } = ir.programDetails;
      const developmentFilled = Object.values(developmentTesting).some(value => value?.trim());
      const geologistFilled = !!ir.contacts.geologistPrimary?.trim();
      return completion || acidization || transmission || openHoleSizeIn || developmentFilled || geologistFilled
        ? 'completed'
        : 'pending';
    }

    case 'horizons':
      return ir.formationTops.length > 0 ? 'completed' : 'pending';

    case 'casing':
      return ir.casing.length > 0 ? 'completed' : 'pending';

    case 'hydrogeology': {
      const { aquifer, estimatedTdsPpm, h2sPpm, estimatedPumpDepthFt } = ir.hydrogeology;
      return aquifer?.trim() || estimatedTdsPpm != null || h2sPpm != null || estimatedPumpDepthFt != null
        ? 'completed'
        : 'pending';
    }

    case 'areaWaterWells':
      return ir.offsetWells.length > 0 || !!ir.offsetWellsRemarks?.trim() ? 'completed' : 'pending';

    case 'attachments':
      return ir.attachmentNames.length > 0 ? 'completed' : 'pending';

    default:
      return 'pending';
  }
}

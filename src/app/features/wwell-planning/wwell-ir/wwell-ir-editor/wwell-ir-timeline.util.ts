import { WWELL_IR_ATTACHMENT_SLOTS } from '../wwell-ir-attachments.config';
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
      const { completionType, completion, acidization, transmission, openHoleSizeIn, developmentTesting } = ir.programDetails;
      const developmentFilled = Object.values(developmentTesting).some(value => value?.trim());
      const geologistFilled = !!ir.contacts.geologistPrimary?.trim();
      return completionType || completion || acidization || transmission || openHoleSizeIn || developmentFilled || geologistFilled
        ? 'completed'
        : 'pending';
    }

    case 'horizons':
      return ir.formationTops.length > 0 || !!ir.topsRemarks?.trim() ? 'completed' : 'pending';

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

    // The required slots are required by the form schema (see wwell-ir-form.schema.ts), so the step is
    // complete only once each one holds at least one file.
    case 'attachments':
      return WWELL_IR_ATTACHMENT_SLOTS.filter(({ required }) => required).every(({ slot }) => ir.attachments.some(attachment => attachment.slot === slot))
        ? 'completed'
        : 'pending';

    default:
      return 'pending';
  }
}

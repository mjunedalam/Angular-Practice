/** IR SECTIONS nav tree — labels/grouping adapted from the legacy GWD reference view, mapped onto
 *  WWELL_IR_FORM_SCHEMA's actual sections. A group renders as a single clickable leaf when it's
 *  backed by exactly one schema section, or as a static header over 2+ clickable children when a
 *  step splits across multiple sections — never a synthetic one-child submenu. */

export interface WwellIrRailLeaf {
  readonly key: string;
  readonly number: string;
  readonly label: string;
  readonly stepKey: string;
  readonly sectionKey: string;
}

export interface WwellIrRailGroup {
  readonly key: string;
  readonly number: string;
  readonly label: string;
  /** Material icon ligature name shown on the group row — chosen per topic (e.g. "layers" for
   *  Horizons, "plumbing" for Casing) instead of a generic folder/description pair. */
  readonly icon: string;
  /** Set when this group has no children — the group itself is the single clickable leaf. */
  readonly leaf?: WwellIrRailLeaf;
  /** Set when this group splits across 2+ schema sections. */
  readonly children?: readonly WwellIrRailLeaf[];
}

export const WWELL_IR_SECTION_RAIL: readonly WwellIrRailGroup[] = [
  {
    key: 'wellbore',
    number: '1.0',
    label: 'Wellbore Details',
    icon: 'engineering',
    leaf: { key: 'wellbore', number: '1.0', label: 'Wellbore Details', stepKey: 'reference', sectionKey: 'main' },
  },
  {
    key: 'general',
    number: '2.0',
    label: 'General',
    icon: 'tune',
    children: [
      { key: 'programMain', number: '2.1', label: 'Program Details', stepKey: 'programDetails', sectionKey: 'main' },
      {
        key: 'programDev',
        number: '2.2',
        label: 'Development & Testing',
        stepKey: 'programDetails',
        sectionKey: 'developmentTesting',
      },
      { key: 'geologist', number: '2.3', label: 'Geologist Contact', stepKey: 'contacts', sectionKey: 'geologist' },
    ],
  },
  {
    key: 'horizons',
    number: '3.0',
    label: 'Horizons',
    icon: 'layers',
    leaf: { key: 'horizons', number: '3.0', label: 'Horizons', stepKey: 'subsurface', sectionKey: 'formationTops' },
  },
  {
    key: 'casing',
    number: '4.0',
    label: 'Casing',
    icon: 'plumbing',
    leaf: { key: 'casing', number: '4.0', label: 'Casing', stepKey: 'subsurface', sectionKey: 'casing' },
  },
  {
    key: 'hydrogeology',
    number: '5.0',
    label: 'Hydrogeology',
    icon: 'water_drop',
    leaf: { key: 'hydrogeology', number: '5.0', label: 'Hydrogeology', stepKey: 'hydrogeology', sectionKey: 'main' },
  },
  {
    key: 'areaWaterWells',
    number: '6.0',
    label: 'Area Water Wells',
    icon: 'location_on',
    children: [
      { key: 'offsetWells', number: '6.1', label: 'Area Water Wells', stepKey: 'contacts', sectionKey: 'offsetWells' },
      { key: 'offsetRemarks', number: '6.2', label: 'Remarks', stepKey: 'contacts', sectionKey: 'remarks' },
    ],
  },
  {
    key: 'attachments',
    number: '7.0',
    label: 'Attachments',
    icon: 'attach_file',
    // Both upload slots save into one flat `attachmentNames` list on the domain record (see
    // IntegratedRequirement) — there's no persisted way to tell which name came from which slot,
    // so view/edit treats them as a single section rather than two rail entries with no real
    // distinction once saved. `sectionKey` picks one schema section arbitrarily; the editor's
    // Attachments view/edit doesn't use it directly (see attachmentsEdit in wwell-ir-editor.component.ts).
    leaf: { key: 'attachments', number: '7.0', label: 'Attachments', stepKey: 'attachments', sectionKey: 'locationMap' },
  },
];

/** Flattened, in document order — index-aligned with the `#sectionEl` anchors rendered in
 *  wwell-ir-editor.component.html, so `SectionRailController`'s scroll-spy index and a nav row's
 *  click-to-scroll index both mean the same thing. */
export function wwellIrRailLeaves(groups: readonly WwellIrRailGroup[]): readonly WwellIrRailLeaf[] {
  return groups.flatMap(group => group.children ?? (group.leaf ? [group.leaf] : []));
}

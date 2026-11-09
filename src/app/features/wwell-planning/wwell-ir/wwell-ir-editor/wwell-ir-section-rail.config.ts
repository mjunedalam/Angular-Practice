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
    label: 'Water Well Details',
    icon: 'engineering',
    leaf: { key: 'wellbore', number: '1.0', label: 'Water Well Details', stepKey: 'reference', sectionKey: 'main' },
  },
  {
    key: 'general',
    number: '2.0',
    label: 'General',
    icon: 'tune',
    children: [
      { key: 'programMain', number: '2.1', label: 'Program Details', stepKey: 'programDetails', sectionKey: 'main' },
      { key: 'geologist', number: '2.2', label: 'Geologist Contact', stepKey: 'contacts', sectionKey: 'geologist' },
    ],
  },
  {
    key: 'horizons',
    number: '3.0',
    label: 'Horizons',
    icon: 'layers',
    children: [
      { key: 'horizons', number: '3.1', label: 'Horizons', stepKey: 'subsurface', sectionKey: 'formationTops' },
      { key: 'horizonsRemarks', number: '3.2', label: 'Remarks', stepKey: 'subsurface', sectionKey: 'remarks' },
    ],
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
    // Each slot is a real file stored server-side under its own slot directory (agwa-planning's
    // IrAttachmentStorageService), so which document is which now survives a save — which is what
    // finally makes these two distinct rail entries rather than one merged list. Both are appended
    // to the letter PDF as trailing pages, in this order.
    children: [
      { key: 'locationMap', number: '7.1', label: 'Location Map', stepKey: 'attachments', sectionKey: 'locationMap' },
      {
        key: 'initiationRequest',
        number: '7.2',
        label: 'Initiation Request',
        stepKey: 'attachments',
        sectionKey: 'initiationRequest',
      },
      {
        key: 'wlda',
        number: '7.3',
        label: 'WLDA',
        stepKey: 'attachments',
        sectionKey: 'wlda',
      },
    ],
  },
];

/** Flattened, in document order — index-aligned with the `#sectionEl` anchors rendered in
 *  wwell-ir-editor.component.html, so `SectionRailController`'s scroll-spy index and a nav row's
 *  click-to-scroll index both mean the same thing. */
export function wwellIrRailLeaves(groups: readonly WwellIrRailGroup[]): readonly WwellIrRailLeaf[] {
  return groups.flatMap(group => group.children ?? (group.leaf ? [group.leaf] : []));
}

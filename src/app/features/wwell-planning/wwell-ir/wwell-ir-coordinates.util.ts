/** One piece of a well's surface location, ready to print: "Northing", "3043496.7774". No unit
 *  conversion happens anywhere in here — `exad_rcd_prewap.surfacen`/`surfacee` are real UTM
 *  northing/easting meters in production and `sv_utm_zn` is the zone they were measured in; this
 *  app shows all three exactly as the source gives them rather than computing lat/long from them
 *  (see docs/work.md's "coordinates are UTM, not degrees" entries for why that was tried and
 *  reverted — the user wants the raw survey values, not a derived one). */
export interface UtmAxis {
  readonly label: string;
  readonly value: string;
  readonly icon: string;
}

const NUMBER = String.raw`(-?\d+(?:\.\d+)?)`;
// The "m" is optional so IRs saved before the unit was dropped still split into Northing/Easting/Zone.
const UTM_TEXT = new RegExp(String.raw`^\s*Northing\s+${NUMBER}\s*(?:m\b)?\s*,\s*Easting\s+${NUMBER}\s*(?:m\b)?\s*,\s*Zone\s+(\d{1,2})\s*$`, 'i');

/** Reads a UTM zone field as it actually arrives — a bare number (`38`, what `sv_utm_zn` holds —
 *  Saudi Arabia has no need for a hemisphere letter, every well this app has ever seen is Northern
 *  Hemisphere) or a string that might carry one anyway (`"38N"`, matching `IrEligibleWell.utmZone`'s
 *  declared type). Only the leading digits are read either way. */
export function parseUtmZone(zone: string | number | null | undefined): number | null {
  if (zone === null || zone === undefined) return null;
  const match = /^\s*(\d{1,2})/.exec(String(zone));
  if (!match) return null;
  const zoneNumber = Number(match[1]);
  return zoneNumber >= 1 && zoneNumber <= 60 ? zoneNumber : null;
}

/** Composes the one "coordinates" string this app threads everywhere (the model's single
 *  `requestReference.coordinates` field), straight from the raw survey values — no rounding beyond
 *  what the source numbers already carry. `null` when the zone can't be read, since a northing/
 *  easting pair means nothing without knowing which zone they're measured in. */
export function formatUtmCoordinates(northing: number, easting: number, zone: string | number | null | undefined): string | null {
  const zoneNumber = parseUtmZone(zone);
  if (zoneNumber === null) return null;
  return `Northing ${northing}, Easting ${easting}, Zone ${zoneNumber}`;
}

/** Splits that composed string back into Northing / Easting / UTM Zone for display. Text that
 *  doesn't match (an older record saved before this format, or hand-typed free text) is kept whole
 *  as a single "Coordinates" entry rather than dropped or guessed at. */
export function toUtmAxes(text: string): readonly UtmAxis[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  const match = UTM_TEXT.exec(trimmed);
  if (!match) {
    return [{ label: 'Coordinates', value: trimmed, icon: 'location_on' }];
  }

  return [
    { label: 'Northing', value: match[1], icon: 'swap_vert' },
    { label: 'Easting', value: match[2], icon: 'swap_horiz' },
    { label: 'UTM Zone', value: match[3], icon: 'public' },
  ];
}

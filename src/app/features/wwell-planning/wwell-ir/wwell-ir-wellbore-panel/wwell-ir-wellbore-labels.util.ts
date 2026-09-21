/** A label the well profile would like to print beside a depth on its strip. */
export interface LabelCandidate {
  readonly key: string;
  /** Where the depth sits on the strip, in px from its left edge. */
  readonly xPx: number;
  /** Fullest text first; the next is tried when the one before it does not fit. */
  readonly texts: readonly string[];
  /** `center`: over its depth. `start`: beside it, to the right (to the left when that runs off the strip). */
  readonly anchor: 'center' | 'start';
}

export interface PlacedLabel {
  readonly key: string;
  readonly text: string;
  readonly leftPx: number;
}

/** Glyph width of the mono face the labels are set in, as a share of its font size. */
const MONO_GLYPH_EM = 0.6;
/** The strip's label font size, in px (`--wbp-fs-micro`, 0.75rem at the 16px root). */
const LABEL_FONT_PX = 12;
/** Air kept between two labels, and between a label and a pin line. */
const LABEL_GAP_PX = 5;
/** How far a `start` label stands off its pin: clear of the icon that hangs from it (the pump's is 19px wide). */
const PIN_OFFSET_PX = 14;

const widthOf = (text: string): number => Math.ceil(text.length * MONO_GLYPH_EM * LABEL_FONT_PX);

interface Box {
  readonly left: number;
  readonly right: number;
}

const overlaps = (a: Box, b: Box): boolean => a.left < b.right + LABEL_GAP_PX && b.left < a.right + LABEL_GAP_PX;

function boxFor(candidate: LabelCandidate, text: string, stripWidthPx: number): Box {
  const width = widthOf(text);
  if (candidate.anchor === 'center') {
    const left = Math.min(Math.max(candidate.xPx - width / 2, 0), Math.max(stripWidthPx - width, 0));
    return { left, right: left + width };
  }
  const right = candidate.xPx + PIN_OFFSET_PX + width;
  const left = right <= stripWidthPx ? candidate.xPx + PIN_OFFSET_PX : candidate.xPx - PIN_OFFSET_PX - width;
  return { left, right: left + width };
}

/**
 * Places labels along a strip of `stripWidthPx`, in the order given (earlier ones win a clash): each
 * takes its fullest text that fits, and is left out when none does — the figure it names is always in
 * a table too, so a missing label costs nothing the panel does not print elsewhere.
 *
 * `obstaclesPx` are the x positions of lines a label must not cross (the pins), except its own.
 * Measured, not guessed: the strip is a few hundred px in the sidebar and over a thousand in Expand,
 * so what fits is decided at the width it is actually drawn at.
 */
export function placeLabels(candidates: readonly LabelCandidate[], stripWidthPx: number, obstaclesPx: readonly number[] = []): PlacedLabel[] {
  if (stripWidthPx <= 0) return [];
  const placed: PlacedLabel[] = [];
  const taken: Box[] = [];

  for (const candidate of candidates) {
    for (const text of candidate.texts) {
      const box = boxFor(candidate, text, stripWidthPx);
      const isInside = box.left >= 0 && box.right <= stripWidthPx;
      const crossesPin = obstaclesPx.some(x => x !== candidate.xPx && x > box.left - LABEL_GAP_PX && x < box.right + LABEL_GAP_PX);
      if (!isInside || crossesPin || taken.some(other => overlaps(box, other))) continue;
      taken.push(box);
      placed.push({ key: candidate.key, text, leftPx: box.left });
      break;
    }
  }
  return placed;
}

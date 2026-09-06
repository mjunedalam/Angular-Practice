/**
 * Captures the already-rendered wellbore diagram (the `app-wwell-ir-depth-scale` +
 * `app-well-bore-view` SVGs shown in the Letter tab's "Well Bore Diagram" section) as a single PNG,
 * base64-encoded, so it can ride along in the "Download PDF" request body — the backend has no
 * drawing logic of its own for the diagram anymore, it just embeds whatever PNG it's given (see
 * IrLetterService.sanitizeWellboreImage in agwa-planning).
 *
 * Both SVGs use `width:100%;height:100%` with a `viewBox` for on-screen responsive sizing, so a raw
 * clone can't be rasterized directly — a percentage width doesn't resolve to a pixel size once
 * detached from layout. They're also Angular components with their own scoped `.scss` stylesheets
 * (view-encapsulated CSS classes for colors/strokes/fonts), which a standalone serialized SVG
 * document can't see — only the inline attributes D3 itself sets survive a plain clone. Both
 * problems are solved the same way: walk the live (already-styled) element tree and its clone in
 * parallel, and inline each element's actual `getComputedStyle()` presentation properties directly
 * as a `style` attribute before serializing — the standard technique for exporting a live,
 * class-styled SVG as a standalone image.
 */

const INLINE_STYLE_PROPERTIES = [
  'fill',
  'stroke',
  'stroke-width',
  'stroke-dasharray',
  'stroke-dashoffset',
  'stroke-linecap',
  'stroke-linejoin',
  'opacity',
  'fill-opacity',
  'stroke-opacity',
  'font-family',
  'font-size',
  'font-weight',
  'font-style',
  'text-anchor',
  'dominant-baseline',
  'letter-spacing',
  'visibility',
  'display',
] as const;

/** Renders each SVG at this multiple of its intrinsic viewBox size for a crisp embed in the PDF
 *  (which itself renders the image at up to ~420px wide — see irLetter.html's `.wellbore-diagram
 *  img` — but a Letter-size PDF page prints at a much higher effective DPI than a 96dpi screen, so
 *  a plain 1:1 capture looked soft once embedded). */
const SNAPSHOT_SCALE = 3;

function inlineComputedStyles(source: Element, clone: Element): void {
  const computed = window.getComputedStyle(source);
  const declarations = INLINE_STYLE_PROPERTIES.map(prop => `${prop}:${computed.getPropertyValue(prop)}`).join(';');
  clone.setAttribute('style', declarations);

  const sourceChildren = Array.from(source.children);
  const cloneChildren = Array.from(clone.children);
  sourceChildren.forEach((sourceChild, index) => {
    const cloneChild = cloneChildren[index];
    if (cloneChild) {
      inlineComputedStyles(sourceChild, cloneChild);
    }
  });
}

function rasterizeSvg(svgEl: SVGSVGElement, pixelWidth: number, pixelHeight: number): Promise<HTMLImageElement> {
  const clone = svgEl.cloneNode(true) as SVGSVGElement;
  inlineComputedStyles(svgEl, clone);
  clone.setAttribute('width', String(pixelWidth));
  clone.setAttribute('height', String(pixelHeight));

  const svgString = new XMLSerializer().serializeToString(clone);
  const svgDataUrl = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgString)))}`;

  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Failed to rasterize wellbore diagram SVG'));
    image.src = svgDataUrl;
  });
}

/**
 * Composes every `<svg>` inside `containerEl` (in DOM order — depth-scale first, then the main
 * wellbore view, matching `.letter__diagram-row`'s flex layout) side by side onto one canvas, and
 * returns it as a bare base64 PNG string (no `data:image/png;base64,` prefix — the backend adds
 * that itself when building the `<img src>` attribute). Returns `null` if the container has no SVG
 * content to capture (e.g. `hasWellboreData()` was false, or something failed to rasterize) —
 * callers should treat that as "send no image" rather than an error, since the diagram is an
 * enhancement to the letter, not something its generation depends on.
 *
 * Known limitation, accepted rather than chased: both diagrams run a one-time D3 entrance
 * animation on mount. A capture taken within that first ~1-2s (immediately after switching to the
 * Letter tab) could catch a mid-animation frame. Forcing every renderer to a "skip to end" state
 * would mean touching every file under `well-bore-view/renderers/` — out of proportion to this
 * feature; in practice a user reads the letter before clicking "Download PDF", by which point the
 * animation has already settled on its own.
 */
export async function captureWellboreSnapshot(containerEl: HTMLElement): Promise<string | null> {
  // Only the two top-level diagram roots (depth-scale, well-bore-view) — the wellbore renderer
  // draws several small icons (e.g. the pump glyph) as nested `<svg>` elements positioned inside
  // the main diagram's coordinate space, which `querySelectorAll('svg')` alone would also match
  // and wrongly treat as a third, separate diagram panel to lay out side by side.
  const svgs = Array.from(containerEl.querySelectorAll('svg')).filter(svg => !svg.parentElement?.closest('svg'));
  if (svgs.length === 0) {
    return null;
  }

  const dims = svgs.map(svg => {
    const viewBox = svg.viewBox.baseVal;
    const width = viewBox && viewBox.width > 0 ? viewBox.width : svg.clientWidth;
    const height = viewBox && viewBox.height > 0 ? viewBox.height : svg.clientHeight;
    return { width, height };
  });

  const totalWidth = dims.reduce((sum, d) => sum + d.width, 0);
  const maxHeight = Math.max(...dims.map(d => d.height));
  if (totalWidth <= 0 || maxHeight <= 0) {
    return null;
  }

  const canvas = document.createElement('canvas');
  canvas.width = totalWidth * SNAPSHOT_SCALE;
  canvas.height = maxHeight * SNAPSHOT_SCALE;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return null;
  }

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let xOffset = 0;
  for (let i = 0; i < svgs.length; i++) {
    const { width, height } = dims[i];
    const image = await rasterizeSvg(svgs[i], width * SNAPSHOT_SCALE, height * SNAPSHOT_SCALE);
    ctx.drawImage(image, xOffset * SNAPSHOT_SCALE, 0, width * SNAPSHOT_SCALE, height * SNAPSHOT_SCALE);
    xOffset += width;
  }

  const pngDataUrl = canvas.toDataURL('image/png');
  return pngDataUrl.substring(pngDataUrl.indexOf(',') + 1);
}

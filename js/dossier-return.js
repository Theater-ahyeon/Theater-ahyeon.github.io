/**
 * Pure geometry for returning the existing detail art to its catalogue card.
 * All inputs are untransformed, viewport-relative CSS-pixel rectangles:
 *   {dialog, art, source: {left, top, width, height}, viewport: {width, height}}
 * `source` should be the card's image/visual bounds, not its caption or border.
 *
 * Returns null when the measured route cannot make a legible, safe return.
 * Otherwise returns numbers only, ready for the owner to stringify:
 *   {scale, translateX, translateY, origin: {x, y},
 *    clip: {top, right, bottom, left}}
 *
 * Apply origin in pixels as the DIALOG's transform-origin. The final transform
 * is `translate(translateX px, translateY px) scale(scale)` in that order.
 * Starting from the identity transform, this maps the full art's center onto
 * the full source's center. Uniform contain scaling preserves the art's aspect
 * ratio; a differently shaped source can have unused space at its edges.
 *
 * `clip` is a CSS inset in the dialog's original border-box coordinates. It
 * retains exactly art ∩ dialog, excluding detail text and surrounding chrome.
 * Interpolate from inset(0) to this inset alongside the transform. The viewport
 * is used for eligibility only, not to distort or recenter a partially cropped
 * image. The full original art and source bounds always determine the mapping.
 *
 * Eligibility: both source ∩ viewport and art ∩ dialog ∩ viewport must retain
 * at least half their original rectangle's area and at least 24px in each axis.
 * Dimensions/coordinates/edges must be finite and within ±1,000,000px, dimensions
 * positive, and the exact contain scale in [1/64, 8]. Unsafe scales are rejected,
 * never clamped. These limits intentionally choose the owner's normal dismissal
 * over a barely visible target, microscopic image, or extreme zoom.
 *
 * The owner retains animation, scroll eligibility, image readiness, interruption,
 * reduced-motion, resize, dialog lifecycle and focus responsibilities. This
 * module does not read the DOM, create overlays, mutate inputs, or schedule work.
 */

const MAX_GEOMETRY = 1_000_000;
const MIN_VISIBLE_SPAN = 24;
const MIN_VISIBLE_FRACTION = 0.5;
const MIN_SCALE = 1 / 64;
const MAX_SCALE = 8;

const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const bounded = value => Number.isFinite(value) && Math.abs(value) <= MAX_GEOMETRY;

function rectangle(value) {
  if (!record(value) || !['left', 'top', 'width', 'height'].every(key => bounded(value[key])) ||
      value.width <= 0 || value.height <= 0) return null;
  const right = value.left + value.width;
  const bottom = value.top + value.height;
  if (!bounded(right) || !bounded(bottom)) return null;
  return {left: value.left, top: value.top, width: value.width, height: value.height, right, bottom};
}

function intersection(...rectangles) {
  const left = Math.max(...rectangles.map(rect => rect.left));
  const top = Math.max(...rectangles.map(rect => rect.top));
  const right = Math.min(...rectangles.map(rect => rect.right));
  const bottom = Math.min(...rectangles.map(rect => rect.bottom));
  if (right <= left || bottom <= top) return null;
  return {left, top, right, bottom, width: right - left, height: bottom - top};
}

function adequatelyVisible(visible, full) {
  return visible !== null && visible.width >= MIN_VISIBLE_SPAN && visible.height >= MIN_VISIBLE_SPAN &&
    (visible.width / full.width) * (visible.height / full.height) >= MIN_VISIBLE_FRACTION;
}

export function planDossierReturn(input) {
  if (!record(input)) return null;
  const dialog = rectangle(input.dialog);
  const art = rectangle(input.art);
  const source = rectangle(input.source);
  const viewport = input.viewport;
  if (!dialog || !art || !source || !record(viewport) ||
      !bounded(viewport.width) || !bounded(viewport.height) ||
      viewport.width <= 0 || viewport.height <= 0) return null;
  const screen = {left: 0, top: 0, right: viewport.width, bottom: viewport.height};
  const retainedArt = intersection(art, dialog);
  if (!adequatelyVisible(intersection(source, screen), source) ||
      !adequatelyVisible(intersection(art, dialog, screen), art)) return null;

  const scale = Math.min(source.width / art.width, source.height / art.height);
  if (!Number.isFinite(scale) || scale < MIN_SCALE || scale > MAX_SCALE) return null;
  const artCenterX = art.left + art.width / 2;
  const artCenterY = art.top + art.height / 2;

  return {
    scale,
    translateX: source.left + source.width / 2 - artCenterX,
    translateY: source.top + source.height / 2 - artCenterY,
    origin: {x: artCenterX - dialog.left, y: artCenterY - dialog.top},
    clip: {
      top: retainedArt.top - dialog.top,
      right: dialog.right - retainedArt.right,
      bottom: dialog.bottom - retainedArt.bottom,
      left: retainedArt.left - dialog.left
    }
  };
}

/**
 * Painted image bounds for object-fit: contain and centered object-position.
 * `box` is the image's viewport-relative CONTENT box, excluding border/padding;
 * `size` is its loaded natural {width, height}. Returns {left, top, width, height}
 * in CSS pixels, or null for invalid/unsafe geometry. The same finite positive
 * dimensions and ±1,000,000 bounds apply; visibility and return-scale eligibility
 * remain exclusively with planDossierReturn. This does not handle cover, custom
 * object-position, CSS transforms, or infer whether an image has loaded.
 *
 * Use the painted rectangle as planDossierReturn's `art` when the detail image
 * is contained, so letterboxing is excluded from the returned picture's clip
 * and scale. If the source picture is also contained, measure it the same way.
 */
export function containedImageRect(box, size) {
  const bounds = rectangle(box);
  if (!bounds || !record(size) || !bounded(size.width) || !bounded(size.height) ||
      size.width <= 0 || size.height <= 0) return null;
  const scale = Math.min(bounds.width / size.width, bounds.height / size.height);
  if (!Number.isFinite(scale) || scale <= 0) return null;
  const width = size.width * scale;
  const height = size.height * scale;
  const result = {
    left: bounds.left + (bounds.width - width) / 2,
    top: bounds.top + (bounds.height - height) / 2,
    width,
    height
  };
  return rectangle(result) ? result : null;
}

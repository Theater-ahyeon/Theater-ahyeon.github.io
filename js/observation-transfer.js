/**
 * Studies' contact plate, with no route, image, or animation lifecycle of its own.
 *
 * Owner integration:
 * 1. Insert observationTransfer() once inside .cinema-stage, after .cinema-commit.
 *    Load observation-transfer.css after scene-cinema.css.
 * 2. At the existing route commit, render Studies, restore scroll, then call
 *    dockObservationTransfer(veil, main). It performs two bounded geometry reads
 *    and writes only its own variables/class on the veil. A false return means
 *    no visible destination: the contact plate retires on its normal timeline.
 * 3. Call clearObservationTransfer(veil) whenever navigation is cancelled or
 *    completed, including motion settlement. Removing .active also cancels all
 *    helper animation. Clear before the owner's existing restart layout flush.
 * 4. On the owner's existing resize, refreshObservationTransfer(veil, main)
 *    retargets an active dock without restarting its CSS score. Losing the
 *    destination retires this helper for the remainder of the current route.
 *
 * No listeners, timers, image cloning, image readiness ownership, or WAAPI.
 * The original .study-art, its img, Canvas, labels, and source remain untouched.
 */

const dockProperties = Object.freeze([
  '--field-dock-x', '--field-dock-y', '--field-dock-width', '--field-dock-height',
  '--field-image-x', '--field-image-y', '--field-image-width', '--field-image-height'
]);

/** Pure, fixed, inert markup. A single background is exposed through six windows. */
export function observationTransfer() {
  return `<div class="observation-transfer" aria-hidden="true"><div class="field-datum"><b>03</b><i></i><b>观测</b></div><div class="field-frame"><div class="field-exposure"><div class="field-picture"></div><i class="field-shutter field-shutter-x field-shutter-first"></i><i class="field-shutter field-shutter-x field-shutter-second"></i><i class="field-shutter field-shutter-y"></i></div><div class="field-structure"><i class="field-rule field-rule-x field-rule-first"></i><i class="field-rule field-rule-x field-rule-second"></i><i class="field-rule field-rule-y"></i></div><div class="field-register"><i></i><i></i><i></i><i></i></div></div></div>`;
}

/** Idempotent settlement. Does not touch .active, route state, or other variables. */
export function clearObservationTransfer(veil) {
  if (!veil) return;
  veil.classList?.remove('field-docking');
  veil.classList?.remove('field-retired');
  for (const property of dockProperties) veil.style?.removeProperty(property);
}

const usableRectangle = rectangle => rectangle &&
  ['left', 'top', 'width', 'height'].every(key => Number.isFinite(rectangle[key])) &&
  rectangle.width > 0 && rectangle.height > 0;

/**
 * Dock onto the visible intersection, retaining full-art image coordinates.
 * Cropping the bottom of an offscreen art must not cover-fit the entire image
 * into that short visible strip. Negative image offsets preserve top/left crops.
 */
function measureObservationDock(veil, destinationRoot) {
  if (!veil?.classList?.contains('active') || veil.dataset?.to !== 'studies' ||
      !veil.querySelector?.('.observation-transfer')) return false;
  const art = destinationRoot?.querySelector?.('.study-art');
  if (!art || art.isConnected === false || veil.isConnected === false) return false;
  const stage = veil.getBoundingClientRect();
  const target = art.getBoundingClientRect();
  if (!usableRectangle(stage) || !usableRectangle(target)) return false;

  // The fixed veil normally already is the usable viewport. Intersect it with
  // the layout viewport as well so short landscape / clipped host layouts are
  // safe. Zero or unavailable fixture dimensions leave the veil authoritative.
  const viewport = veil.ownerDocument?.documentElement;
  const viewportWidth = viewport?.clientWidth > 0 ? viewport.clientWidth : Infinity;
  const viewportHeight = viewport?.clientHeight > 0 ? viewport.clientHeight : Infinity;
  const left = Math.max(stage.left, target.left, 0);
  const top = Math.max(stage.top, target.top, 0);
  const right = Math.min(stage.left + stage.width, target.left + target.width, viewportWidth);
  const bottom = Math.min(stage.top + stage.height, target.top + target.height, viewportHeight);
  if (right - left < 1 || bottom - top < 1) return false;

  const values = [
    left - stage.left, top - stage.top, right - left, bottom - top,
    target.left - left, target.top - top, target.width, target.height
  ];
  if (!values.every(Number.isFinite)) return false;
  return values;
}

function writeObservationDock(veil, values) {
  values.forEach((value, index) => veil.style.setProperty(dockProperties[index], `${value}px`));
}

/** Start the measured dock once, at the owner's existing route commit. */
export function dockObservationTransfer(veil, destinationRoot) {
  clearObservationTransfer(veil);
  const values = measureObservationDock(veil, destinationRoot);
  if (!values) return false;
  writeObservationDock(veil, values);
  veil.classList.add('field-docking');
  return true;
}

/**
 * Refresh only the existing destination, leaving animation names and triggers
 * intact. A lost destination must not reset the frame to its preflight box.
 * Retirement is terminal until clear/start, so another resize cannot replay it.
 */
export function refreshObservationTransfer(veil, destinationRoot) {
  if (!veil?.classList?.contains('field-docking') || veil.classList.contains('field-retired')) return false;
  const values = measureObservationDock(veil, destinationRoot);
  if (!values) {
    veil.classList.add('field-retired');
    return false;
  }
  writeObservationDock(veil, values);
  return true;
}

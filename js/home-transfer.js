/**
 * Home's same-image aperture. The route owner supplies every lifecycle beat.
 *
 * Integration (load home-transfer.css after scene-cinema.css and styles.css):
 * - Insert homeTransfer() once inside .cinema-stage, beside .cinema-commit.
 * - When rendering Home for this route, add .aperture-owned to .hero-artwork
 *   BEFORE choreography / image readiness callbacks / measurement. Keep that
 *   class for this scene's lifetime and skip heroImage() for it, even after the
 *   bridge ends. The CSS disables the old figure AND image entrances without
 *   removing the figure's normal pointer transform or the original credit.
 * - At the existing 420 ms commit, render, restore scroll, then call
 *   dockHomeTransfer(veil, main). A true result owns only the target image's
 *   temporary visibility. A false result retires the aperture under the opaque
 *   commit; the normal image/readiness owner remains responsible for content.
 * - Use refreshHomeTransfer(veil, main) from existing resize/geometry updates.
 *   It changes endpoints without restarting the score. A replaced, detached,
 *   invalid or wholly offscreen target retires the bridge and releases its
 *   exact image. Retirement is terminal until clear / a new explicit dock.
 * - At 1120 ms, or cancellation/motion settlement, remove .active and call
 *   clearHomeTransfer(veil, main) in the SAME synchronous cleanup. Do not fade
 *   the entire veil: the aperture stays fully exposed until this atomic swap.
 *   Clear before the existing layout flush used to start another navigation.
 *
 * 420 ms preflight + 650 ms dock = 1070 ms. The last 50 ms holds the exact
 * landing. The original image is never visible behind a differently sized
 * copy. No listeners, timers, readiness callbacks, network, or WAAPI are owned
 * here. Source eligibility, image loading, focus and route state stay external.
 */

const geometryProperties = Object.freeze([
  '--home-dock-x', '--home-dock-y', '--home-dock-width', '--home-dock-height'
]);
const appearanceProperties = Object.freeze({
  '--home-mask-image': ['maskImage', 'mask-image', 'webkitMaskImage'],
  '--home-mask-composite': ['maskComposite', 'mask-composite'],
  '--home-mask-size': ['maskSize', 'mask-size'],
  '--home-mask-position': ['maskPosition', 'mask-position'],
  '--home-mask-repeat': ['maskRepeat', 'mask-repeat'],
  '--home-image-position': ['objectPosition', 'object-position'],
  '--home-image-filter': ['filter', 'filter']
});
const heldByVeil = new WeakMap();
const ownersByImage = new WeakMap();
const holdClass = 'home-image-held';
const finite = value => Number.isFinite(value) && Math.abs(value) <= 1_000_000;

/** Pure, fixed and inert. Exactly one unchanged source is painted by the CSS. */
export function homeTransfer() {
  return '<div class="home-transfer" aria-hidden="true"><div class="home-datum"><b>01</b><i></i></div><div class="home-frame"><div class="home-exposure"><div class="home-picture"></div></div><div class="home-register"><i></i><i></i><i></i><i></i></div></div></div>';
}

function claimImage(veil, image) {
  let ownership = ownersByImage.get(image);
  if (!ownership) {
    ownership = {owners:new Set(), alreadyHeld:image.classList.contains(holdClass)};
    ownersByImage.set(image, ownership);
    if (!ownership.alreadyHeld) image.classList.add(holdClass);
  }
  ownership.owners.add(veil);
  heldByVeil.set(veil, image);
}

function releaseImage(veil) {
  const image = heldByVeil.get(veil);
  if (!image) return;
  heldByVeil.delete(veil);
  const ownership = ownersByImage.get(image);
  if (!ownership) return;
  ownership.owners.delete(veil);
  if (!ownership.owners.size) {
    if (!ownership.alreadyHeld) image.classList.remove(holdClass);
    ownersByImage.delete(image);
  }
}

/**
 * Idempotent, exact-owner cleanup. main is accepted for the shared owner API,
 * but never searched: a newer scene must not be touched by stale cleanup.
 * The stable .aperture-owned class and every original inline style survive.
 */
export function clearHomeTransfer(veil, _main) {
  if (!veil) return;
  releaseImage(veil);
  veil.classList?.remove('home-docking');
  veil.classList?.remove('home-retired');
  for (const property of [...geometryProperties, ...Object.keys(appearanceProperties)]) {
    veil.style?.removeProperty(property);
  }
}

const homeFlight = veil => Boolean(veil?.classList?.contains('active') &&
  veil.dataset?.to === 'home' && veil.isConnected !== false &&
  veil.querySelector?.('.home-transfer'));

function rectangle(value) {
  if (!value || !['left', 'top', 'width', 'height'].every(key => finite(value[key])) ||
      value.width <= 0 || value.height <= 0) return false;
  return finite(value.left + value.width) && finite(value.top + value.height);
}

function appearance(image, veil) {
  const view = image.ownerDocument?.defaultView || veil.ownerDocument?.defaultView;
  const computed = view?.getComputedStyle?.(image);
  if (computed?.objectFit && computed.objectFit !== 'contain') return null;
  const values = {};
  for (const [property, [camel, dashed, prefixed]] of Object.entries(appearanceProperties)) {
    const value = computed?.[camel] || computed?.getPropertyValue?.(dashed) ||
      (prefixed && computed?.[prefixed]);
    if (typeof value === 'string' && value.trim()) values[property] = value;
  }
  return values;
}

/**
 * The viewport intersection determines eligibility only. Store the FULL img
 * rectangle, including negative origins and its offscreen extent. The stage
 * clips it naturally; fitting the source into an intersection would recenter
 * its faces and red anchors, or distort a short visible mobile strip.
 */
function measureHomeDock(veil, main, expectedImage) {
  if (!homeFlight(veil)) return null;
  const image = main?.querySelector?.('.hero-artwork>img');
  const figure = image?.parentElement;
  if (!image?.classList || image.isConnected === false || figure?.isConnected === false ||
      !figure?.classList?.contains('aperture-owned') ||
      (expectedImage && image !== expectedImage) ||
      image.dataset?.imageState === 'error' || figure.dataset?.imageState === 'error') return null;
  const stage = veil.getBoundingClientRect();
  const target = image.getBoundingClientRect();
  if (!rectangle(stage) || !rectangle(target)) return null;
  const viewport = veil.ownerDocument?.documentElement;
  const width = viewport?.clientWidth > 0 ? viewport.clientWidth : Infinity;
  const height = viewport?.clientHeight > 0 ? viewport.clientHeight : Infinity;
  const left = Math.max(stage.left, target.left, 0);
  const top = Math.max(stage.top, target.top, 0);
  const right = Math.min(stage.left + stage.width, target.left + target.width, width);
  const bottom = Math.min(stage.top + stage.height, target.top + target.height, height);
  if (right - left < 1 || bottom - top < 1) return null;
  const geometry = [target.left - stage.left, target.top - stage.top, target.width, target.height];
  if (!geometry.every(finite)) return null;
  const looks = appearance(image, veil);
  return looks ? {image, geometry, looks} : null;
}

function writeDock(veil, measured) {
  measured.geometry.forEach((value, index) => veil.style.setProperty(geometryProperties[index], `${value}px`));
  for (const [property, value] of Object.entries(measured.looks)) veil.style.setProperty(property, value);
}

function retire(veil) {
  veil.classList.add('home-retired');
  releaseImage(veil);
  return false;
}

/** Start once at commit. Repeating a live dock retargets without replaying it. */
export function dockHomeTransfer(veil, main) {
  if (!veil) return false;
  if (veil.classList?.contains('home-docking')) return refreshHomeTransfer(veil, main);
  clearHomeTransfer(veil, main);
  if (!homeFlight(veil)) return false;
  const measured = measureHomeDock(veil, main);
  if (!measured) return retire(veil);
  writeDock(veil, measured);
  claimImage(veil, measured.image);
  veil.classList.add('home-docking');
  return true;
}

/** Retarget only this exact image, with no class churn or animation restart. */
export function refreshHomeTransfer(veil, main) {
  if (!veil?.classList?.contains('home-docking') || veil.classList.contains('home-retired')) return false;
  const image = heldByVeil.get(veil);
  if (!image) return retire(veil);
  const measured = measureHomeDock(veil, main, image);
  if (!measured) return retire(veil);
  writeDock(veil, measured);
  return true;
}

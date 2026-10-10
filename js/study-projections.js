/**
 * Image-local reconstructions for the existing study-art frame.
 *
 * Contract:
 * - Insert studyImageProjection(s) immediately after .study-art > img, before
 *   .study-geometric. The image, art number/caption, frame, and source dock stay.
 * - Only after that actual image is decoded/ready, add .projection-enter to
 *   .study-art (preferred), or to #study-panel. CSS also requires the art's
 *   data-image-state="ready"; pending/error images never acquire a projection.
 * - With a projection present, the owner should skip its old image-mask WAAPI
 *   animation. This layer owns only its own image planes, never the real img.
 * - Removing .projection-enter cancels to the original picture immediately.
 *   Remove it during settlement/replacement; do not retain it across motion-off
 *   or reduced-motion changes and inadvertently restart on re-enablement.
 * - Existing readiness checks, ghost bridge/fade, visibility and disposal stay
 *   with the owner. No listeners, image watchers, timers, or DOM writes here.
 *
 * All moving pictures are CSS backgrounds of the same original environment
 * asset used by studyPanel(s). Arbitrary IDs/URLs/text are never interpolated.
 */

const escapeAttribute = value => String(value).replace(/[&<>"']/g, character => ({
  '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
}[character]));

const themes = Object.freeze({
  tide: Object.freeze({image:'./assets/observatory.webp', duration:1380}),
  axis: Object.freeze({image:'./assets/observatory.webp', duration:1480}),
  light: Object.freeze({image:'./assets/gold-chamber.webp', duration:1440})
});
const pixels = '<span class="projection-pixels"></span>';

function tidePlanes() {
  // Full-frame backgrounds behind adjacent clips preserve one image coordinate
  // system. These are not independently cover-cropped narrow image elements.
  const rows = [
    [0,14,-25,43,1.8,60], [14,29,19,28.5,-1.1,20],
    [29,43,-33,14,1.3,90], [43,57,24,0,-.7,0],
    [57,72,-20,-14.5,1.2,45], [72,86,31,-29,-1.5,75],
    [86,100,-27,-43,.8,30]
  ];
  return `<span class="projection-current-strips">${rows.map(([top,bottom,x,y,turn,lag]) =>
    `<span class="projection-current-strip" style="--strip-top:${top}%;--strip-bottom:${100-bottom}%;--strip-x:${x}%;--strip-y:${y}%;--strip-turn:${turn}deg;--projection-lag:${lag}ms">${pixels}</span>`
  ).join('')}</span><span class="projection-current-dividers">${rows.slice(1).map(([top],index) =>
    `<i class="projection-current-divider" style="--divider-top:${top}%;--divider-origin:${index%2?'0%':'100%'};--projection-lag:${index*12}ms"></i>`
  ).join('')}</span>`;
}

function axisPlanes() {
  // Finished pointed apertures match the existing SVG: x=23%, y=6%, w=54%,
  // h=87%; the shared lower pivot is (50%,93%), with four -36/-12/12/36 ribs.
  const ribs = [
    [2,19,-25,-36,-35,55], [27,44,-8,-12,-19,0],
    [56,73,8,12,19,35], [81,98,25,36,35,85]
  ];
  return `<span class="projection-axis-aperture">${pixels}</span><span class="projection-axis-ribs">${ribs.map(([left,right,x,angle,yaw,lag]) =>
    `<span class="projection-axis-plane" style="--rib-left:${left}%;--rib-right:${right}%;--rib-x:${x}%;--rib-angle:${angle}deg;--rib-yaw:${yaw}deg;--projection-lag:${lag}ms">${pixels}</span>`
  ).join('')}</span>`;
}

function lightPlanes() {
  return `<span class="projection-light-aperture">${pixels}</span><span class="projection-reflection projection-reflection-left">${pixels}</span><span class="projection-reflection projection-reflection-right">${pixels}</span><span class="projection-curtain projection-curtain-left"></span><span class="projection-curtain projection-curtain-right"></span>`;
}

/** Pure, noninteractive, aria-hidden markup; unsupported studies return empty. */
export function studyImageProjection(s) {
  const id = s && typeof s === 'object' && typeof s.id === 'string' ? s.id : '';
  if (!Object.hasOwn(themes, id)) return '';
  const theme = themes[id];
  const construction = id === 'tide' ? tidePlanes() : id === 'axis' ? axisPlanes() : lightPlanes();
  const imageStyle = `--projection-image:url("${theme.image}");--projection-duration:${theme.duration}ms`;
  return `<span class="study-projection projection-${escapeAttribute(id)}" aria-hidden="true" data-projection-duration="${theme.duration}" style="${escapeAttribute(imageStyle)}"><span class="projection-performance"><span class="projection-field"></span>${construction}</span></span>`;
}

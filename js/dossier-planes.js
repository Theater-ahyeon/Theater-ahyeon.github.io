/**
 * Image-local, decorative catalogue planes. These helpers only return markup:
 * they do not install listeners, schedule work, or animate the source image.
 *
 * Insert projectDossierPlanes(p) after the existing art in .project-visual and
 * before .project-view/.project-no. Insert detailDossierPlanes(p) after the art
 * in .detail-art. Keep the real title, image, provenance, and button unchanged.
 *
 * An owner adds .dossier-enter to the card/dialog when its entrance begins.
 * Optional --dossier-delay on that owner delays the entire single-play suite.
 * Remove the class to settle/cancel; new DOM or a deliberate class restart is
 * needed to replay. The static state never covers the actual image.
 */

const escapeText = value => String(value ?? '').replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[character]));

/** No protocols other than HTTP(S), no CSS escapes, and no control characters. */
function imageURL(value) {
  if (typeof value !== 'string') return '';
  const raw = value.trim();
  if (!raw || /[\u0000-\u001f\u007f\\]/.test(raw)) return '';
  try {
    const parsed = new URL(raw, 'https://portfolio.invalid/');
    if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password) return '';
    // Preserve local paths. Encode every CSS string delimiter before escaping
    // the resulting HTML attribute; caller data can never finish url("...").
    return raw.replace(/[\s"'()<>`{};]/gu, character => encodeURIComponent(character)
      .replace(/[!'()*]/g, delimiter => `%${delimiter.charCodeAt(0).toString(16).toUpperCase()}`));
  } catch {
    return '';
  }
}

function shapeFor(project) {
  if ((project.artKind || project.id) === 'dialogue') return 'dialogue';
  if ((project.artKind || project.id) === 'archive') return 'archive';
  return imageURL(project.image) ? 'showreel' : 'graphic';
}

const uiPlane = `<span class="dossier-ui-plane"><span class="dossier-ui-top"><i></i><i></i><i></i></span><span class="dossier-ui-side"><i></i><i></i><i></i></span><span class="dossier-ui-context"><i></i><i></i><i></i><b>↳</b></span><span class="dossier-ui-answer"><i></i><i></i></span></span>`;

function media(kind) {
  return `<span class="dossier-plane-media">${kind === 'dialogue' || kind === 'graphic' ? uiPlane : ''}</span>`;
}

function planes(input, surface) {
  const project = input && typeof input === 'object' ? input : {};
  const kind = shapeFor(project);
  const no = escapeText(project.no || '—');
  const title = escapeText(project.title || 'PROJECT');
  const category = escapeText(project.category || 'PERSONAL EXPERIMENT');
  const source = imageURL(project.image) || (kind === 'archive' ? imageURL(project.artImage) || './assets/observatory.webp' : '');
  const imageStyle = source ? ` style="--dossier-image:url(&quot;${escapeText(source)}&quot;)"` : '';
  const classification = kind === 'dialogue' ? 'CONTEXT / INTERFACE' : kind === 'archive' ? 'SPACE / COMPOSITION' : kind === 'showreel' ? 'PROJECT / DIAGRAM' : 'FORM / EXPERIMENT';
  return `<span class="dossier-planes dossier-${surface} dossier-${kind}" aria-hidden="true"${imageStyle}>
    <span class="dossier-performance">
      <span class="dossier-field"></span>
      <span class="dossier-floor"><i></i></span>
      <span class="dossier-horizon"><i></i><i></i><i></i></span>
      <span class="dossier-catalogue-index"><b>${no}</b><span>SELECTED<br>EXPERIMENT</span></span>
      <span class="dossier-principal">${media(kind)}<i class="dossier-plane-rule"></i></span>
      <span class="dossier-crop dossier-crop-a">${media(kind)}<span>${no} / A</span></span>
      <span class="dossier-crop dossier-crop-b">${media(kind)}<span>${no} / B</span></span>
      <span class="dossier-side-cut dossier-side-cut-a"></span>
      <span class="dossier-side-cut dossier-side-cut-b"></span>
      <span class="dossier-stage-meta"><span>${category}</span><i></i><b>${no}</b></span>
      <span class="dossier-stage-baseline"><span>${classification}</span><span>PERSONAL ARCHIVE</span></span>
      <span class="dossier-stage-word">${title}</span>
    </span>
    <span class="dossier-register"><i></i><i></i><i></i><i></i></span>
    <span class="dossier-edge-type">${title}</span>
    <span class="dossier-index-strip"><i></i><span>${classification}</span><b>${no}</b></span>
    <span class="dossier-focus-line"></span>
  </span>`;
}

/** Decorative layer for the existing project-visual button. */
export function projectDossierPlanes(project) {
  return planes(project, 'card');
}

/** Decorative layer for the existing detail-art region. */
export function detailDossierPlanes(project) {
  return planes(project, 'detail');
}

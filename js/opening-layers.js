/**
 * Decorative opening composition. The caller owns playback, Skip, and focus.
 * Insert once at the start of #intro; load opening-layers.css after styles.css.
 * Score: 0–0.85s scan, 0.55–2.45s dossiers, 2.35–4.40s title,
 * then the existing .leaving lifecycle opens the aperture over 650ms.
 * Timings are original interface choreography, not measurements of source PVs.
 */
export function openingLayers(name='theater',projectList=[]) {
  const escapeText=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const brand=escapeText(name);
  const imageProject=projectList.find(p=>p.image||p.artImage);
  const repoProject=projectList.find(p=>p.showcase);
  const dialogueProjects=projectList.filter(p=>p.artKind==='dialogue').slice(0,2);
  const windows = [
    [repoProject?'repository':imageProject?'showreel':'arch', '01', repoProject?.title||imageProject?.title||'SPATIAL RECORD',repoProject?'GITHUB / README':imageProject?.category||'ENVIRONMENT STUDY'],
    [dialogueProjects.length?'dialogue':'geometry', '02', dialogueProjects.map(p=>p.title).join(' / ')||'INTERACTION', dialogueProjects.some(p=>p.showcase)?'README / PROJECTS':dialogueProjects.length?'INTERACTION STUDIES':'GEOMETRY STUDY'],
    ['sea', '03', 'PUBLIC WORKS', 'CODE + INTERACTION'],
    ['observatory', '04', 'ORBIT', 'ENVIRONMENT STUDY'],
    ['letterform', '05', 'LETTERFORM', 'TYPE STUDY'],
    ['geometry', '06', 'STRUCTURE', 'GEOMETRY STUDY'],
    ['light', '07', 'SURFACE / LIGHT', 'MATERIAL STUDY'],
    ['horizon', '08', 'HORIZON LINE', 'SPATIAL STUDY']
  ];
  const focalIndex=windows.find(([crop])=>crop==='observatory')[1];
  const windowCount=String(windows.length).padStart(2,'0');
  return `<div class="opening-layers" aria-hidden="true">
    <div class="opening-field"></div>
    <div class="opening-register opening-content">
      <span class="opening-register-label">${brand} / PERSONAL ARCHIVE</span>
      <span class="opening-register-index">SEQUENCE 00 <i></i> VISUAL + INTERACTION</span>
      <span class="opening-margin-note">COMPOSITION / MOVEMENT / SPACE</span>
      <span class="opening-folio">00<span>OPENING<br>FRAME</span></span>
    </div>
    <div class="opening-scan opening-content">
      <i class="opening-scan-line opening-scan-line-x"></i>
      <i class="opening-scan-line opening-scan-line-y"></i>
      <i class="opening-scan-bracket opening-scan-bracket-a"></i>
      <i class="opening-scan-bracket opening-scan-bracket-b"></i>
      <span class="opening-scan-readout">[ 00 / 08 ]<br>IMAGE FIELD</span>
      <i class="opening-acid-rule"></i>
    </div>
    <div class="opening-dossiers opening-content">
      <div class="opening-dossier-heading"><span>INDEXED FRAGMENTS</span><span>01 — 08 / VISUAL STUDIES</span></div>
      <div class="opening-dossier-grid">${windows.map(([crop,index,label,caption],i)=>`
        <div class="opening-window opening-window-${crop}" style="--opening-i:${i}">
          <div class="opening-window-image">${crop==='repository'?`<div class="opening-repository-text"><small>README.md</small><b>${escapeText(repoProject.title)}</b>${repoProject.showcase.lines.map(l=>`<span>${escapeText(l)}</span>`).join('')}</div>`:crop==='showreel'&&imageProject?`<img src="${escapeText(imageProject.image||imageProject.artImage)}" alt="">`:crop==='letterform'?`<b class="opening-window-type">${brand}</b>`:crop==='dialogue'?(dialogueProjects.some(p=>p.showcase)?`<div class="opening-repository-text"><small>README / PROJECTS</small>${dialogueProjects.map(p=>`<b>${escapeText(p.title)}</b><span>${escapeText(p.showcase?.lines?.[0]||p.subtitle)}</span>`).join('')}</div>`:'<b class="opening-mini-dialogue"><i></i><i></i><i></i><em>↳</em></b>'):''}</div><i class="opening-window-invert"></i>
          <span class="opening-window-index">${index}<i>+</i></span>
          <span class="opening-window-caption">${escapeText(label)}<small>${escapeText(caption)}</small></span>
        </div>`).join('')}
      </div>
      <div class="opening-dossier-baseline"><span>FIELD RECORD / ${brand}</span><span>VISUAL ARCHIVE</span></div>
    </div>
    <div class="opening-fixed-mark opening-content"><i></i><span>00</span></div>
    <div class="opening-title-plane opening-content"><i></i></div>
    <div class="opening-overprint opening-content">VISUAL<br><span>ARCHIVE</span></div>
    <div class="opening-image-plane opening-content">
      <div class="opening-image-crop"></div>
      <i class="opening-image-rule"></i>
      <span class="opening-image-number">${focalIndex} / ${windowCount}</span>
      <span class="opening-image-credit">ORBIT / ORIGINAL ENVIRONMENT</span>
    </div>
    <div class="opening-title-cut opening-title-cut-a opening-content"></div>
    <div class="opening-title-cut opening-title-cut-b opening-content"></div>
    <div class="opening-title-details opening-content"><span>构想 · 画面 · 交互</span><span>AN INDEPENDENT<br>VISUAL RECORD</span><i></i></div>
    <div class="opening-aperture opening-aperture-a"><i></i></div>
    <div class="opening-aperture opening-aperture-b"><span>${brand} / 01</span></div>
  </div>`;
}

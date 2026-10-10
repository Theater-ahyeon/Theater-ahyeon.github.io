import {homeTransfer,dockHomeTransfer,refreshHomeTransfer,clearHomeTransfer} from './home-transfer.js?v=21.6-public3';
import {planDossierReturn,containedImageRect} from './dossier-return.js?v=21.6-public3';
import {observationTransfer,dockObservationTransfer,refreshObservationTransfer,clearObservationTransfer} from './observation-transfer.js?v=21.6-public3';
import {mountNavigationCinema} from './navigation-cinema.js?v=21.6-public3';
import {openingLayers} from './opening-layers.js?v=21.6-public3';
import {monitorImage} from './media.js?v=21.6-public3';
import {profile, chapters, projects, studies} from './data.js?v=21.6-public3';
import {home,works,studiesView,about,projectDetail,studyPanel,studySource} from './components.js?v=21.6-public3';
import {AmbientField} from './motion.js?v=21.6-public3';
import {Choreography} from './choreography.js?v=21.6-public3';
const main=document.querySelector('#main'),intro=document.querySelector('#intro'),dialog=document.querySelector('#detail-dialog'),shell=document.querySelector('.app-shell');
intro.insertAdjacentHTML?.('afterbegin',openingLayers(profile.name));
document.querySelector('.transition-veil').insertAdjacentHTML?.('afterbegin',observationTransfer()+homeTransfer());
const media=window.matchMedia('(prefers-reduced-motion: reduce)');
let storedMotion;try{storedMotion=localStorage.getItem('theater-motion')}catch{}
let motionPreference=['auto','on','off'].includes(storedMotion)?storedMotion:'auto',initialized=false;
const motionDisabled=()=>motionPreference==='off'||(motionPreference==='auto'&&media.matches);
const reduced=()=>!initialized||motionDisabled();
document.documentElement.dataset.motionPreference=motionPreference;
const TIMING=Object.freeze({routeCommit:420,routeEnd:1120,routeCover:980,routeStagger:26,studyCommit:160,detailClose:360,introHold:4400,introExit:650});
for(const [key,value] of Object.entries({routeEnd:TIMING.routeEnd,routeCover:TIMING.routeCover,routeStagger:TIMING.routeStagger,detailClose:TIMING.detailClose}))document.documentElement.style.setProperty('--'+key.replace(/[A-Z]/g,c=>'-'+c.toLowerCase()),value+'ms');
// Lifecycle time follows visible animation time, including the intro exit aperture.
const visibleTimers=new Set();
function armVisibleTimer(timer){
  timer.started=performance.now();timer.id=setTimeout(()=>{visibleTimers.delete(timer);timer.id=null;timer.run();},timer.remaining);
}
function afterVisible(run,delay){
  const timer={run,remaining:delay,started:0,id:null};visibleTimers.add(timer);
  if(!document.hidden)armVisibleTimer(timer);return timer;
}
function clearVisibleTimer(timer){if(!timer)return;clearTimeout(timer.id);visibleTimers.delete(timer);timer.id=null;}
function syncVisibleTimers(){
  const now=performance.now();
  for(const timer of visibleTimers){
    if(document.hidden){if(timer.id!==null){timer.remaining=Math.max(0,timer.remaining-(now-timer.started));clearTimeout(timer.id);timer.id=null;}}
    else if(timer.id===null)armVisibleTimer(timer);
  }
}
mountNavigationCinema();
const choreography=new Choreography(reduced);choreography.onVisibility=()=>{syncVisibleTimers();if(document.hidden&&dialog.classList.contains('dialog-closing'))closeDialog(true);};
const renderers={home,works,studies:studiesView,about};
const route=()=>Object.keys(chapters).includes(location.hash.slice(1))?location.hash.slice(1):'home';
let active='home',ambient=null,transitionTimer=null,wipeTimer=null,navigationVersion=0;
choreography.onFocusReveal=()=>{if(route()===active)cancelNavigation();};
let introTimer=null,introLeave=null,originalOverflow=null,introReturnFocus=null;
let lastFocus=null,dialogCloseTimer=null,dialogVersion=0,restoreDialogFocus=true;
let studyTimer=null,studyVersion=0,currentStudy='tide',pendingStudy=null;
let pointerFrame=null;
let releaseSceneImages=()=>{},releaseStudyImage=()=>{},releaseDetailImages=()=>{},releaseStandby=()=>{};
function bindImages(root){
  const releases=[...root.querySelectorAll('img')].filter(image=>!image.closest('.study-art')).map(image=>monitorImage(image,{onReady:()=>{if(image.closest('.hero-artwork')){if(!image.parentElement?.classList.contains('aperture-owned'))choreography.heroImage(image);}else choreography.assetReveal(image);}}));
  return ()=>releases.forEach(release=>release());
}
function bindStudyImage(panel,id){
  releaseStudyImage();const image=panel?.querySelector('.study-art>img');if(!image)return;
  releaseStudyImage=monitorImage(image,{onReady:()=>{if(panel.isConnected&&panel.querySelector('.study-art>img')===image&&currentStudy===id)choreography.studyImage(panel,id);}});
}
function unlockIntroScroll(){if(originalOverflow!==null){document.body.style.overflow=originalOverflow;originalOverflow=null;}}
function cancelNavigation(){clearHomeTransfer(document.querySelector('.transition-veil'),main);clearObservationTransfer(document.querySelector('.transition-veil'));main.classList.remove('route-arriving');clearVisibleTimer(transitionTimer);clearVisibleTimer(wipeTimer);navigationVersion++;choreography.cancelDeparture();document.querySelector('.transition-veil').classList.remove('active');choreography.moveRail(document.querySelector('.chapter-link.active'));}
function setReplayLabel(label){const button=document.querySelector('#replay-intro');button.setAttribute('aria-label',label==='重播'?'重播开场':'进入交互视图');const text=button.querySelector(':scope > span:last-child');if(text)text.textContent=label;const icon=button.querySelector('.replay-icon');if(icon)icon.textContent=label==='重播'?'↻':'↳';}
// Keep a late module from replacing content someone is already reading.
const standbyNotice=document.createElement('aside'),standbyStatus=document.createElement('span'),standbyEntry=document.createElement('button');
standbyNotice.id='bootstrap-ready';standbyNotice.className='bootstrap-ready';standbyNotice.hidden=true;standbyNotice.setAttribute('aria-label','交互视图已就绪');
standbyStatus.textContent='交互已就绪';standbyEntry.id='activate-app';standbyEntry.type='button';
standbyNotice.append(standbyStatus,standbyEntry);document.body.append(standbyNotice);
standbyEntry.addEventListener('click',()=>activateApp(true));
function isReadingFallback(){
  const focused=document.activeElement;
  return (document.body.dataset.bootInteracted==='true'&&(window.scrollY||0)>48)||Boolean(focused&&focused!==main&&main.contains(focused)&&focused.matches('a[href],button,input,select,textarea,[contenteditable="true"],[role="button"],[role="link"]'));
}
function preserveStaticReading(){
  releaseStandby();const focused=document.activeElement,top=window.scrollY||0,left=window.scrollX||0,hash=location.hash;let frame=0,cancelled=false;
  const cancel=()=>releaseStandby();
  const restore=()=>{frame=requestAnimationFrame(()=>{frame=0;if(cancelled||initialized||location.hash!==hash)return;const current=document.activeElement;if(focused?.isConnected&&(current===document.body||current===focused))focused.focus({preventScroll:true});window.scrollTo({top,left,behavior:'instant'});releaseStandby();});};
  releaseStandby=()=>{cancelled=true;cancelAnimationFrame(frame);window.removeEventListener('load',restore);for(const type of ['pointerdown','keydown','wheel','touchstart','focusin'])document.removeEventListener(type,cancel);for(const type of ['hashchange','popstate'])window.removeEventListener(type,cancel);};
  for(const type of ['pointerdown','keydown','wheel','touchstart','focusin'])document.addEventListener(type,cancel,{once:true,passive:true});
  for(const type of ['hashchange','popstate'])window.addEventListener(type,cancel,{once:true});
  if(document.readyState==='complete')restore();else window.addEventListener('load',restore,{once:true});
}
function showStandby(){
  if(document.body.dataset.appState!=='standby')preserveStaticReading();
  intro.hidden=true;shell.inert=false;document.body.dataset.appState='standby';document.body.classList.add('motion-off');
  standbyNotice.hidden=false;standbyEntry.textContent=motionDisabled()?'进入交互版':'进入动效版';
  const replay=document.querySelector('#replay-intro');replay.disabled=false;replay.title='';setReplayLabel('进入交互');
  const control=document.querySelector('#motion-toggle');control.disabled=true;control.setAttribute('aria-pressed','false');document.querySelector('#motion-label').textContent='静态视图';
  const system=document.querySelector('#motion-system');if(system){system.disabled=true;system.setAttribute('aria-pressed',String(motionPreference==='auto'));}
  const status=document.querySelector('#boot-status');if(status)status.textContent='交互已就绪。可以继续阅读，或选择“进入交互”切换。';
}
function activateApp(focus=false,target=route()){
  if(initialized)return;releaseStandby();initialized=true;standbyNotice.hidden=true;document.body.dataset.appReady='true';document.body.dataset.appState='interactive';
  render(Object.hasOwn(renderers,target)?target:route(),focus);if(!focus)window.scrollTo({top:0,behavior:'instant'});applyMotion();
}
function setMotionPreference(value){
  motionPreference=value;document.documentElement.dataset.motionPreference=value;
  try{localStorage.setItem('theater-motion',value)}catch{}
  applyMotion();
}
function applyMotion(){
  if(!initialized){showStandby();return;}
  const off=reduced();document.body.classList.toggle('motion-off',off);ambient?.sync();
  const control=document.querySelector('#motion-toggle');control.setAttribute('aria-pressed',String(!off));control.disabled=false;
  const systemReduced=motionPreference==='auto'&&media.matches;
  document.querySelector('#motion-label').textContent=systemReduced?'仍然开启动画':off?'动效暂停':'动效开启';
  control.setAttribute('aria-label',systemReduced?'系统已减少动态效果，仍然开启动画':off?'开启动画，当前已手动暂停':motionPreference==='auto'?'暂停动画，当前跟随系统':'暂停动画，当前已手动开启');
  const system=document.querySelector('#motion-system');if(system){system.disabled=false;system.setAttribute('aria-pressed',String(motionPreference==='auto'));system.title=motionPreference==='auto'?'当前跟随系统动态效果设置':'恢复跟随系统动态效果设置';}
  setReplayLabel('重播');const replay=document.querySelector('#replay-intro');replay.disabled=off;replay.title=off?'请先开启动画，再重播开场':'';
  if(off){choreography.settle();if(pendingStudy)selectStudy(pendingStudy.id);if(!intro.hidden)closeIntro();if(dialog.classList.contains('dialog-closing'))closeDialog(true);cancelNavigation();if(route()!==active)render(route(),true);}
}
function render(key,focus=false,homeArrival=false){
  closeDialog(true,false);clearTimeout(studyTimer);studyVersion++;currentStudy='tide';pendingStudy=null;
  releaseSceneImages();releaseStudyImage();ambient?.destroy();active=key;document.body.dataset.scene=key;main.innerHTML=renderers[key]();document.title=chapters[key].title;
  document.querySelector('#breadcrumb').textContent=chapters[key].label;document.querySelector('.statusbar').dataset.motion=key;
  const index=Object.keys(chapters).indexOf(key)+1;document.querySelector('.portrait-id').textContent=`T / 0${index}`;document.querySelector('#status-label').textContent=`0${index} / ${chapters[key].en}`;
  document.querySelectorAll('[data-route]').forEach(a=>{const selected=a.dataset.route===key;a.classList.toggle('active',selected);if(selected)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
  const canvas=main.querySelector('canvas');ambient=canvas?new AmbientField(canvas,key,reduced):null;
  if(homeArrival)main.querySelector('.hero-artwork')?.classList.add('aperture-owned');
  choreography.scene(main,key);releaseSceneImages=bindImages(main);if(key==='studies')bindStudyImage(main.querySelector('#study-panel'),'tide');
  if(focus){main.focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});}
}
function navigate(key){
  cancelNavigation();closeDialog(true,false);
  if(key===active){choreography.moveRail(document.querySelector('.chapter-link.active'));return;}
  if(reduced()){render(key,true);return;}
  choreography.depart(main,active);
  const version=navigationVersion,veil=document.querySelector('.transition-veil');void veil.offsetWidth;
  document.querySelector('#transition-label').textContent=chapters[key].en;
  const chapterNumber=String(Object.keys(chapters).indexOf(key)+1).padStart(2,'0');
  document.querySelector('#transition-number').textContent=chapterNumber;document.querySelector('#transition-index').textContent=chapterNumber+' — '+chapters[key].label;veil.dataset.to=key;veil.classList.add('active');
  choreography.moveRail(document.querySelector(`[data-route="${key}"]`));
  transitionTimer=afterVisible(()=>{if(version!==navigationVersion)return;render(key,true,key==='home');if(key==='home')dockHomeTransfer(veil,main);if(key==='studies')dockObservationTransfer(veil,main);if(key==='works'){main.dataset.cinema=key;main.classList.add('route-arriving');}},TIMING.routeCommit);
  wipeTimer=afterVisible(()=>{if(version===navigationVersion){veil.classList.remove('active');clearHomeTransfer(veil,main);clearObservationTransfer(veil);main.classList.remove('route-arriving');}},TIMING.routeEnd);
}
function finishIntro(){document.querySelector('.skip-link').inert=false;intro.hidden=true;intro.classList.remove('leaving');shell.inert=false;unlockIntroScroll();const target=introReturnFocus?.isConnected&&!introReturnFocus.disabled&&!introReturnFocus.hidden?introReturnFocus:main;target.focus({preventScroll:true});introReturnFocus=null;}
function closeIntro(){
  if(intro.hidden||(intro.classList.contains('leaving')&&!reduced()))return;clearVisibleTimer(introTimer);clearVisibleTimer(introLeave);cancelNavigation();shell.inert=false;
  if(reduced()){finishIntro();return;}
  intro.classList.add('leaving');render(route());introLeave=afterVisible(finishIntro,TIMING.introExit);
}
function playIntro(){
  if(reduced())return;
  cancelNavigation();closeDialog(true,false);clearVisibleTimer(introTimer);clearVisibleTimer(introLeave);
  introReturnFocus=document.activeElement?.id==='replay-intro'?document.activeElement:main;
  intro.hidden=false;intro.classList.remove('leaving');shell.inert=true;document.querySelector('.skip-link').inert=true;
  if(originalOverflow===null)originalOverflow=document.body.style.overflow;document.body.style.overflow='hidden';
  const introParts=intro.querySelectorAll('*');
  for(const el of introParts)el.style.animation='none';
  void intro.offsetWidth; // One layout flush restarts the whole opening on one beat.
  for(const el of introParts)el.style.animation='';
  document.querySelector('#skip-intro').focus();introTimer=afterVisible(closeIntro,TIMING.introHold);
}
function openProject(project,trigger){
  clearTimeout(dialogCloseTimer);dialogVersion++;dialog.classList.remove('dialog-closing','dialog-returning');lastFocus=trigger;restoreDialogFocus=true;
  releaseDetailImages();for(const animation of dialog.getAnimations({subtree:true}))animation.cancel();document.querySelector('#dialog-content').innerHTML=projectDetail(project);if(!dialog.open)dialog.showModal();
  choreography.detail(dialog,trigger);releaseDetailImages=bindImages(dialog);document.querySelector('.dialog-close').focus({preventScroll:true});
}
function closeDialog(immediate=false,restore=true){
  if(!dialog.open)return;
  if(dialog.classList.contains('dialog-closing')&&!immediate)return;
  releaseDetailImages();for(const animation of dialog.getAnimations({subtree:true}))animation.cancel();
  restoreDialogFocus=restore;clearTimeout(dialogCloseTimer);const version=++dialogVersion;
  if(immediate||reduced()||document.hidden){dialog.classList.remove('dialog-closing','dialog-returning');dialog.close();return;}
  const art=dialog.querySelector('.detail-art'),source=lastFocus?.closest('.project-card')?.querySelector('.project-visual');
  const ready=el=>el&&[el,...el.querySelectorAll('.asset-stage')].every(stage=>!['pending','error'].includes(stage.dataset.imageState));
  const image=art?.querySelector(':scope > img'),artBox=art?.getBoundingClientRect();
  const mediaBox=image?.complete&&image.naturalWidth&&getComputedStyle(image).objectFit==='contain'?containedImageRect(image.getBoundingClientRect(),{width:image.naturalWidth,height:image.naturalHeight}):null;
  const plan=dialog.scrollTop<4&&source?.isConnected&&ready(source)&&ready(art)?planDossierReturn({dialog:dialog.getBoundingClientRect(),art:mediaBox||artBox,source:source.getBoundingClientRect(),viewport:{width:innerWidth,height:innerHeight}}):null;
  dialog.classList.remove('dossier-enter');dialog.classList.add('dialog-closing');
  if(plan)choreography.returnDetail(dialog,plan,TIMING.detailClose);
  dialogCloseTimer=setTimeout(()=>{if(version!==dialogVersion)return;dialog.classList.remove('dialog-closing','dialog-returning');dialog.close();},TIMING.detailClose);
}
function snapshotStudyImage(panel){
  const stage=panel.querySelector('.study-art'),current=panel.querySelector('.study-art>img');
  // Retain the last presented image, not a loaded-but-still-decoding hidden replacement.
  const previous=stage?.dataset.imageState==='ready'&&current?.naturalWidth?current:panel.querySelector('.study-image-ghost>img');
  if(!previous?.naturalWidth)return null;
  const clone=previous.cloneNode(true),style=getComputedStyle(previous);
  Object.assign(clone.style,{opacity:style.opacity,filter:style.filter,objectFit:style.objectFit,objectPosition:style.objectPosition});
  clone.alt='';clone.removeAttribute('data-image-state');return clone;
}
function updateStudySource(selected){
  const source=document.querySelector('#study-source-content');
  const focusIndex=[...source.querySelectorAll('a')].indexOf(document.activeElement);
  source.innerHTML=studySource(selected);
  if(focusIndex>=0){const links=source.querySelectorAll('a');links[Math.min(focusIndex,links.length-1)]?.focus({preventScroll:true});}
}
function selectStudy(id,focus=false){
  const selected=studies.find(x=>x.id===id),panel=document.querySelector('#study-panel');if(!selected||!panel)return;
  clearTimeout(studyTimer);const version=++studyVersion;panel.classList.remove('study-switching');
  document.querySelectorAll('[data-study]').forEach(t=>{const yes=t.dataset.study===id;t.setAttribute('aria-selected',String(yes));t.tabIndex=yes?0:-1;if(yes&&focus)t.focus();});
  if(id===currentStudy){pendingStudy=null;panel.setAttribute('aria-busy','false');return;}pendingStudy=selected;
  const swap=()=>{
    if(version!==studyVersion||!panel.isConnected)return;
    const ghostImage=snapshotStudyImage(panel);releaseStudyImage();
    for(const animation of panel.getAnimations({subtree:true}))animation.cancel();
    panel.innerHTML=studyPanel(selected);panel.setAttribute('aria-labelledby',`tab-${id}`);panel.setAttribute('aria-busy','false');panel.classList.remove('study-switching');currentStudy=id;pendingStudy=null;
    if(ghostImage){const ghost=document.createElement('div');ghost.className='study-image-ghost';ghost.setAttribute('aria-hidden','true');ghost.append(ghostImage);panel.querySelector('.study-art').prepend(ghost);}
    document.querySelector('#study-anchor-number').textContent=selected.no;document.querySelector('#study-anchor-title').textContent=`参考：${selected.anchor||selected.credit}`;
    updateStudySource(selected);
    const dock=document.querySelector('.study-source-dock');dock.classList.remove('source-tick');void dock.offsetWidth;dock.classList.add('source-tick');
    choreography.study(panel,id,true);bindStudyImage(panel,id);
  };
  if(reduced()){swap();return;}
  panel.setAttribute('aria-busy','true');panel.dataset.nextTheme=id;void panel.offsetWidth;panel.classList.add('study-switching');studyTimer=setTimeout(swap,TIMING.studyCommit);
}
document.querySelector('.skip-link').addEventListener('click',e=>{e.preventDefault();main.focus();main.scrollIntoView({behavior:'instant'});});
document.querySelector('#skip-intro').addEventListener('click',closeIntro);
document.querySelector('#replay-intro').addEventListener('click',()=>{if(!initialized){activateApp(true);return;}playIntro();});
document.querySelector('#motion-toggle').addEventListener('click',()=>{if(initialized)setMotionPreference(motionDisabled()?'on':'off');});
document.querySelector('#motion-system')?.addEventListener('click',()=>{if(initialized)setMotionPreference('auto');});
media.addEventListener('change',()=>{if(motionPreference==='auto')applyMotion();});
window.addEventListener('hashchange',()=>{if(initialized)navigate(route());});
window.addEventListener('resize',()=>{if(dialog.classList.contains('dialog-closing'))closeDialog(true);choreography.moveRail(document.querySelector('.chapter-link.active'));choreography.aimProfileFocal(main);const veil=document.querySelector('.transition-veil');if(veil.classList.contains('field-docking'))refreshObservationTransfer(veil,main);if(veil.classList.contains('home-docking'))refreshHomeTransfer(veil,main);},{passive:true});
window.addEventListener('scroll',()=>{const veil=document.querySelector('.transition-veil');if(veil.classList.contains('home-docking'))refreshHomeTransfer(veil,main);if(veil.classList.contains('field-docking'))refreshObservationTransfer(veil,main);if(main.querySelector('.profile-enter'))choreography.aimProfileFocal(main);},{passive:true});
document.addEventListener('click',e=>{
  const link=e.target.closest('a[href]'),href=link?.getAttribute('href'),key=href?.startsWith('#')?href.slice(1):null;
  // Keep native modified clicks and external/new-tab links untouched. Commit the
  // requested chapter before hydration so reduced mode cannot restore a stale hash.
  if(!initialized&&key&&Object.hasOwn(renderers,key)&&!e.defaultPrevented&&(!e.button||e.button===0)&&!e.altKey&&!e.ctrlKey&&!e.metaKey&&!e.shiftKey&&!link.hasAttribute('download')&&(!link.getAttribute('target')||link.getAttribute('target')==='_self')){
    e.preventDefault();if(location.hash!==href)history.pushState(null,'',href);activateApp(true,key);return;
  }
  const trigger=e.target.closest('[data-project]');if(trigger){const p=projects.find(x=>x.id===trigger.dataset.project);if(p)openProject(p,trigger);}const tab=e.target.closest('[data-study]');if(tab)selectStudy(tab.dataset.study);});
document.addEventListener('keydown',e=>{
  if(e.key==='Tab'&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!intro.hidden){e.preventDefault();document.querySelector('#skip-intro').focus();return;}
  const tab=e.target.closest('[data-study]');if(tab&&!e.altKey&&!e.ctrlKey&&!e.metaKey&&['ArrowRight','ArrowLeft','Home','End'].includes(e.key)){e.preventDefault();let i=studies.findIndex(x=>x.id===tab.dataset.study);if(e.key==='Home')i=0;else if(e.key==='End')i=studies.length-1;else i=(i+(e.key==='ArrowRight'?1:-1)+studies.length)%studies.length;selectStudy(studies[i].id,true);}
  if(e.key==='Escape'&&!intro.hidden){e.preventDefault();closeIntro();}
});
document.querySelector('.dialog-close').addEventListener('click',()=>closeDialog());
dialog.addEventListener('cancel',e=>{e.preventDefault();closeDialog();});
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeDialog();}});
dialog.addEventListener('close',()=>{releaseDetailImages();for(const animation of dialog.getAnimations({subtree:true}))animation.cancel();clearTimeout(dialogCloseTimer);dialog.classList.remove('dialog-closing','dialog-returning');if(restoreDialogFocus&&lastFocus?.isConnected)lastFocus.focus({preventScroll:true});lastFocus=null;});
main.addEventListener('pointermove',e=>{if(reduced()||e.pointerType==='touch')return;cancelAnimationFrame(pointerFrame);pointerFrame=requestAnimationFrame(()=>{const r=main.getBoundingClientRect();main.style.setProperty('--px',((e.clientX-r.left)/r.width-.5).toFixed(3));main.style.setProperty('--py',((e.clientY-r.top)/r.height-.5).toFixed(3));const veil=document.querySelector('.transition-veil');if(veil.classList.contains('home-docking'))refreshHomeTransfer(veil,main);});},{passive:true});
main.addEventListener('pointerleave',()=>{cancelAnimationFrame(pointerFrame);main.style.setProperty('--px','0');main.style.setProperty('--py','0');const veil=document.querySelector('.transition-veil');if(veil.classList.contains('home-docking'))refreshHomeTransfer(veil,main);});
monitorImage(document.querySelector('.side-portrait img'));
let seen=false;try{seen=sessionStorage.getItem('theater-intro-seen')==='yes';sessionStorage.setItem('theater-intro-seen','yes')}catch{}
const lateBoot=Date.now()-Number(document.body.dataset.bootStarted||Date.now())>1800;
if(isReadingFallback()){showStandby();}
else{activateApp();if(reduced()||seen||lateBoot||document.body.dataset.bootInteracted==='true'){intro.hidden=true;shell.inert=false;}else{playIntro();}}

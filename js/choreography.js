/** Component-level motion. Every entrance resolves to readable, stable DOM. */
export class Choreography {
  constructor(isReduced) {
    this.isReduced=isReduced;this.animations=new Set();this.observers=[];this.pausedByVisibility=new Set();this.departures=[];
    document.body.classList.add('motion-enhanced');
    document.addEventListener('visibilitychange',()=>this.visibility());
    this.pointerTarget=null;this.pointerFrame=0;this.pressTimers=new WeakMap();
    document.addEventListener('pointermove',e=>this.pointer(e),{passive:true});
    document.addEventListener('pointerdown',e=>this.press(e));
    document.addEventListener('pointerup',()=>this.release());
    document.addEventListener('pointercancel',()=>this.release());
    window.addEventListener('blur',()=>{this.resetPointer();this.cancelPress();});
    document.addEventListener('focusin',e=>{if(e.target.matches(':focus-visible'))this.revealFocused(e.target);const el=e.target.closest('button,a');if(el&&!this.isReduced()&&el.matches(':focus-visible'))this.animate(el,[{filter:'brightness(1)'},{filter:'brightness(1.24)'},{filter:'brightness(1)'}],{duration:430});});
    this.prepareSignature(document.querySelector('.intro-type strong'));
    this.railObserver=new ResizeObserver(()=>this.moveRail(document.querySelector('.chapter-link.active')));this.railObserver.observe(document.querySelector('.chapter-nav'));
    document.documentElement.addEventListener('pointerleave',()=>this.resetPointer());
    this.footerPending=false;this.footerObserver=new IntersectionObserver(entries=>{const r=document.querySelector('.statusbar').getBoundingClientRect();if(entries.some(e=>e.isIntersecting)&&this.footerPending&&r.top<innerHeight&&r.bottom>0)this.footerPulse();},{threshold:.2});this.footerObserver.observe(document.querySelector('.statusbar'));this.visibility();
  }
  animate(el,keyframes,options={}) {
    if(!el||!el.isConnected||this.isReduced())return null;
    const a=el.animate(keyframes,{duration:800,easing:'cubic-bezier(.22,1,.36,1)',fill:'both',...options});
    this.animations.add(a);
    if(document.hidden){a.pause();this.pausedByVisibility.add(a);}
    a.finished.then(()=>{this.animations.delete(a);this.pausedByVisibility.delete(a);if(el.isConnected)a.cancel();},()=>{this.animations.delete(a);this.pausedByVisibility.delete(a);});
    return a;
  }
  visibility(){
    document.body.classList.toggle('page-hidden',document.hidden);
    if(document.hidden){this.resetPointer();this.cancelPress();for(const a of this.animations){if(a.playState==='running'){a.pause();this.pausedByVisibility.add(a);}}}
    else {for(const a of this.pausedByVisibility){if(!this.isReduced()&&a.playState==='paused')a.play();}this.pausedByVisibility.clear();}
    this.onVisibility?.();
  }
  settle(){
    this.resetPointer();this.footerPending=false;document.querySelectorAll('.sidebar.kinetic-change,.statusbar.kinetic-change').forEach(el=>el.classList.remove('kinetic-change'));
    for(const observer of this.observers)observer.disconnect();this.observers=[];
    for(const a of this.animations)a.cancel();this.animations.clear();this.pausedByVisibility.clear();this.departures=[];document.querySelectorAll('.study-image-ghost').forEach(e=>{const state=e.closest('.study-art')?.dataset.imageState;if(state!=='pending'&&state!=='error')e.remove();});
    document.querySelectorAll('[data-motion-pending]').forEach(e=>{e.style.opacity='';e.removeAttribute('data-motion-pending');});
    this.cancelPress();document.querySelectorAll('.dossier-enter').forEach(el=>el.classList.remove('dossier-enter'));document.querySelectorAll('.projection-enter').forEach(el=>el.classList.remove('projection-enter'));document.querySelectorAll('.profile-enter').forEach(el=>el.classList.remove('profile-enter'));
  }
  resetScene(){this.settle();cancelAnimationFrame(this.pointerFrame);this.pointerTarget=null;}
  cancelDeparture(){for(const a of this.departures)a?.cancel();this.departures=[];}
  depart(root,key){
    this.cancelDeparture();if(this.isReduced())return;
    const selectors={home:'.hero-artwork,.hero-title,.hero-caption,.hero-bottom',works:'.project-visual,.project-info',studies:'.study-art,.study-content',about:'.about-name,.about-intro,.about-field'};
    [...root.querySelectorAll(selectors[key]||'.page-title')].slice(0,5).forEach((el,i)=>{const a=this.animate(el,[{opacity:1,translate:'0 0',rotate:'0deg'},{opacity:.55,translate:`${-28-i*5}px ${i%2?-12:8}px`,rotate:key==='works'?'-2deg':'0deg'}],{duration:320,delay:i*18,easing:'cubic-bezier(.55,0,.8,.4)'});if(a)this.departures.push(a);});
  }
  prepareSignature(el){if(!el||el.dataset.split)return;el.dataset.split='true';const label=el.textContent.trim();el.setAttribute('aria-label',label);el.innerHTML=[...label].map((c,i)=>`<span aria-hidden="true" style="--letter:${i}">${c===' '?'&nbsp;':c}</span>`).join('');}
  splitTitle(el){
    if(!el||el.dataset.motionSplit)return;el.dataset.motionSplit='true';el.setAttribute('aria-label',el.textContent.replace(/\s+/g,' ').trim());
    const walk=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);const nodes=[];while(walk.nextNode())nodes.push(walk.currentNode);
    let count=0;
    for(const node of nodes){if(!node.textContent.trim()||node.parentElement.closest('.title-dot'))continue;const frag=document.createDocumentFragment();for(const ch of node.textContent){const span=document.createElement('span');span.className='kinetic-letter';span.setAttribute('aria-hidden','true');span.textContent=ch;span.style.setProperty('--letter',count++);frag.append(span);}node.replaceWith(frag);}
    el.querySelectorAll('.title-line').forEach(line=>line.setAttribute('aria-hidden','true'));
  }
  scene(root,key){
    this.resetScene();if(!root)return;
    const title=root.querySelector('.hero-title');this.splitTitle(title);
    if(this.isReduced()){this.moveRail(document.querySelector('.chapter-link.active'));return;}
    const blocks=[...root.querySelectorAll('.reveal')];
    let firstDelivery=true;
    const observer=new IntersectionObserver(entries=>{const openingBatch=firstDelivery;firstDelivery=false;let localOrder=0;for(const entry of entries){if(!entry.isIntersecting||!entry.target.isConnected||!entry.target.hasAttribute('data-motion-pending'))continue;const el=entry.target;observer.unobserve(el);el.style.opacity='';el.removeAttribute('data-motion-pending');this.reveal(el,key,openingBatch?null:Math.min(localOrder++*62,186));}}, {threshold:.08,rootMargin:'0px 0px -12px 0px'});
    for(const el of blocks){el.dataset.motionPending='true';el.style.opacity='0';observer.observe(el);}this.observers.push(observer);
    root.querySelectorAll('.page-title-main i').forEach((el,i)=>this.animate(el,[{translate:'0 60%',rotate:'-5deg',opacity:0},{translate:'0 0',rotate:'0deg',opacity:1}],{duration:720,delay:120+i*70}));
    root.querySelectorAll('.kinetic-letter').forEach((el,i)=>this.animate(el,[{transform:'translateY(115%) rotateX(-70deg)',opacity:0},{transform:'translateY(0) rotateX(0)',opacity:1}],{duration:1050,delay:180+i*55}));

    const landscape=root.querySelector('.hero-landscape,.about-landscape');if(landscape)this.animate(landscape,[{scale:'1.08',filter:'brightness(.45)'},{scale:'1',filter:'brightness(1)'}],{duration:2300});
    root.querySelectorAll('.hero-orbits i').forEach((el,i)=>{const resting=getComputedStyle(el).transform;this.animate(el,[{transform:`rotate(${60+i*22}deg) scale(.28)`,opacity:0},{transform:resting==='none'?'none':resting,opacity:1}],{duration:1900+i*130,delay:200+i*90});});
    if(key==='about'){root.querySelector('.scene-about')?.classList.add('profile-enter');this.aimProfileFocal(root);}
    if(key==='studies')this.study(root.querySelector('#study-panel'),'tide',true);
    this.chrome(key);
  }
  aimProfileFocal(root){
    const stage=root?.querySelector('.scene-about'),focal=root?.querySelector('.about-focal-mark'),star=root?.querySelector('.about-name>span'),lines=root?.querySelector('.about-connectors');
    if(!stage||!focal||!star)return;
    const layoutPoint=el=>{let x=0,y=0;for(let node=el;node;node=node.offsetParent){x+=node.offsetLeft||0;y+=node.offsetTop||0;}return{x,y};};
    const origin=layoutPoint(stage),point=layoutPoint(star),box={width:stage.offsetWidth,height:stage.offsetHeight},sx=point.x+star.offsetWidth/2-origin.x,sy=point.y+star.offsetHeight/2-origin.y;
    focal.style.setProperty('--focal-x',(sx-box.width/2)+'px');focal.style.setProperty('--focal-y',(sy-box.height/2)+'px');
    const diameter=star.offsetWidth||28;focal.style.setProperty('--focal-scale-x',String(diameter/(focal.offsetWidth||72)));focal.style.setProperty('--focal-scale-y',String(diameter/(focal.offsetHeight||104)));

    if(!lines)return;lines.setAttribute('viewBox',`0 0 ${box.width} ${box.height}`);
    const fields=[...root.querySelectorAll('.about-field')];
    lines.querySelectorAll('path').forEach((path,i)=>{const field=fields[i];if(!field)return;const r=layoutPoint(field),tx=r.x-origin.x-12,ty=r.y-origin.y+20;
      const elbow=innerWidth>980?Math.max(sx+20,tx-32):18;
      const y=innerWidth>980?sy:sy+46;
      path.setAttribute('d',`M ${sx} ${sy} L ${sx} ${y} H ${elbow} V ${ty} H ${tx}`);path.style.setProperty('--line',i);
    });
  }
  revealFocused(target){const block=target.closest('.reveal');if(!block)return;this.onFocusReveal?.();document.querySelector('#main').classList.remove('route-arriving');block.classList.remove('dossier-enter');for(const observer of this.observers)observer.unobserve(block);for(const a of block.getAnimations({subtree:true}))a.cancel();block.style.opacity='';block.removeAttribute('data-motion-pending');}
  reveal(el,key,localDelay=null){
    const order=localDelay??(Math.min(Number(el.style.getPropertyValue('--i')||0)*62,430)+(key==='about'?380:0));
    if(el.classList.contains('project-card')){
      el.style.setProperty('--dossier-delay',order+'ms');el.classList.add('dossier-enter');
      this.animate(el,[{opacity:.2},{opacity:1}],{duration:650,delay:order});
      // Dialogue and Archive own their actual child geometry and image depth.
      const plane=el.querySelector('.project-visual>img');
      this.animate(plane,[{opacity:.15,transform:'perspective(1400px) translate3d(75px,40px,-100px) rotateY(-13deg)',clipPath:'inset(0 0 0 100%)'},{opacity:1,transform:'perspective(1400px) translate3d(0,0,0) rotateY(0)',clipPath:'inset(0)'}],{duration:1250,delay:order});
      el.querySelectorAll('.project-info>*').forEach((item,i)=>this.animate(item,item.matches('h2')?[{opacity:.2},{opacity:1}]:[{opacity:0,transform:'translateY(24px)',clipPath:'inset(0 0 100% 0)'},{opacity:1,transform:'none',clipPath:'inset(0)'}],{duration:780,delay:order+300+i*90}));
    } else if(el.classList.contains('about-name')){
      // One owner for the signature: observer-triggered, never stacked with scene().
      this.animate(el,[{opacity:0,clipPath:'inset(0 100% 0 0)',transform:'translateX(-22px) skewX(-7deg)'},{opacity:1,clipPath:'inset(0)',transform:'none'}],{duration:850,delay:order+180});
    } else if(el.classList.contains('about-field')){
      this.animate(el,[{opacity:0,clipPath:'inset(0 100% 0 0)',transform:'translateX(-24px)'},{opacity:1,clipPath:'inset(0)',transform:'none'}],{duration:1000,delay:order});
    }else{
      this.animate(el,[{opacity:0,transform:'translateY(34px)',clipPath:'inset(0 0 100% 0)'},{opacity:1,transform:'none',clipPath:'inset(0)'}],{duration:900,delay:order});
    }
  }
  chrome(key){
    const sidebar=document.querySelector('.sidebar');sidebar.classList.remove('kinetic-change');void sidebar.offsetWidth;sidebar.classList.add('kinetic-change');
    const index=document.querySelector('.chapter-link.active');this.moveRail(index);
    this.animate(document.querySelector('.portrait-id'),[{opacity:0,transform:'translateY(-15px)'},{opacity:1,transform:'translateY(0)'}],{duration:550});
    this.animate(document.querySelector('.side-portrait img'),[{filter:'grayscale(1) brightness(.4)',clipPath:'polygon(0 0,100% 0,100% 10%,0 10%)'},{filter:'grayscale(.1) brightness(1)',clipPath:'polygon(0 0,100% 0,100% 100%,0 100%)'}],{duration:950});
    const bar=document.querySelector('.statusbar');bar.dataset.motion=key;this.footerPending=true;const bounds=bar.getBoundingClientRect();if(bounds.top<innerHeight&&bounds.bottom>0)this.footerPulse();
    this.animate(document.querySelector('#breadcrumb'),[{opacity:0,translate:'0 12px'},{opacity:1,translate:'0 0'}],{duration:630});
  }
  footerPulse(){
    this.footerPending=false;if(this.isReduced())return;const bar=document.querySelector('.statusbar');bar.classList.remove('kinetic-change');void bar.offsetWidth;bar.classList.add('kinetic-change');
    [document.querySelector('#status-label'),document.querySelector('.footer-sign')].forEach((el,i)=>this.animate(el,[{opacity:0,translate:'0 12px'},{opacity:1,translate:'0 0'}],{duration:630,delay:i*85}));
  }
  moveRail(link){
    const nav=document.querySelector('.chapter-nav'),rail=document.querySelector('.nav-traveller');if(!nav||!rail||!link)return;
    const r=link.getBoundingClientRect(),n=nav.getBoundingClientRect();rail.style.setProperty('--rail-x',`${r.left-n.left}px`);rail.style.setProperty('--rail-y',`${r.top-n.top}px`);rail.style.width=`${r.width}px`;rail.style.height=`${r.height}px`;
  }
  study(panel,id,deferImage=false){
    if(!panel||this.isReduced())return;panel.dataset.studyTheme=id;
    const art=panel.querySelector('.study-art'),image=art?.querySelector(':scope > img'),content=panel.querySelector('.study-content');this.splitTitle(content?.querySelector('h2'));
    content?.querySelectorAll('h2 .kinetic-letter').forEach((el,i)=>this.animate(el,[{translate:'0 85%',rotate:'-6deg',opacity:0},{translate:'0 0',rotate:'0deg',opacity:1}],{duration:550,delay:65+i*30}));
    if(!deferImage)this.studyImage(panel,id);
    content?.querySelectorAll(':scope > *').forEach((el,i)=>this.animate(el,[{opacity:0,translate:`${i?18:0}px ${i?0:12}px`,clipPath:'inset(0 0 100% 0)'},{opacity:1,translate:'0 0',clipPath:'inset(0)'}],{duration:650,delay:40+i*55}));
    panel.querySelectorAll('.study-geometric i').forEach((el,i)=>{
      if(id==='axis')this.animate(el,[{opacity:0,scale:'1 .25'},{opacity:1,scale:'1 1'}],{duration:900,delay:[180,0,80,260][i]||0});
      else this.animate(el,[{opacity:.1,scale:'.65',rotate:`${i*14+25}deg`},{opacity:1,scale:'1',rotate:'0deg'}],{duration:880,delay:i*65});
    });
    panel.querySelectorAll('.axial-rib path').forEach((el,i)=>this.animate(el,[{strokeDashoffset:'1'},{strokeDashoffset:'0'}],{duration:1050,delay:Math.floor(i/2)*85,easing:'cubic-bezier(.4,0,.2,1)'}));
    panel.querySelectorAll('.study-art-no,.study-art-label').forEach((el,i)=>this.animate(el,[{opacity:0,translate:'0 14px'},{opacity:1,translate:'0 0'}],{duration:500,delay:150+i*50}));
  }
  heroImage(image){
    this.animate(image,[
      {offset:0,opacity:0,clipPath:'polygon(0 38%,100% 34%,100% 34%,100% 61%,100% 61%,0 65%,0 65%,0 38%)',transform:'translateX(-8%) scale(1.12)'},
      {offset:.23,opacity:1,clipPath:'polygon(0 38%,100% 34%,100% 34%,100% 61%,100% 61%,0 65%,0 65%,0 38%)',transform:'translateX(0) scale(1.06)'},
      {offset:.52,opacity:1,clipPath:'polygon(28% 5%,74% 5%,84% 17%,84% 83%,74% 95%,28% 95%,18% 83%,18% 17%)',transform:'translateX(0) scale(1.025)'},
      {offset:1,opacity:1,clipPath:'polygon(0 0,100% 0,100% 0,100% 100%,100% 100%,0 100%,0 100%,0 0)',transform:'translateX(0) scale(1)'}
    ],{duration:1650,delay:100});
  }
  // Archive owns its image from readiness through observer entry; no pre-entry fade.
  assetReveal(image){if(!image||this.isReduced()||image.closest('.archive-art')||image.getAnimations().some(a=>a.playState==='running'||a.playState==='paused'))return;const opacity=getComputedStyle(image).opacity;this.animate(image,[{opacity:0},{opacity}],{duration:420});}
  studyImage(panel,id){
    if(!panel?.isConnected)return;
    const image=panel.querySelector('.study-art>img');
    if(this.isReduced()){panel.querySelectorAll('.study-image-ghost').forEach(e=>e.remove());return;}
    const masks={tide:['polygon(0 50%,100% 46%,100% 54%,0 58%)','polygon(0 0,100% 0,100% 100%,0 100%)'],axis:['polygon(50% 0,50% 0,50% 100%,50% 100%)','polygon(0 0,100% 0,100% 100%,0 100%)'],light:['polygon(0 100%,0 100%,100% 100%,100% 100%)','polygon(0 0,100% 0,100% 100%,0 100%)']};
    const art=panel.querySelector('.study-art');
    if(art?.querySelector('.study-projection'))art.classList.add('projection-enter');
    else this.animate(image,[{clipPath:masks[id][0],scale:'1.045'},{clipPath:masks[id][1],scale:'1'}],{duration:720});
    const ghost=panel.querySelector('.study-image-ghost');if(ghost){const fade=this.animate(ghost,[{opacity:1},{opacity:0}],{duration:390,delay:260});fade?.finished.then(()=>ghost.remove(),()=>ghost.remove());}
  }
  detail(dialog,trigger){
    if(this.isReduced())return;dialog.classList.add('dossier-enter');dialog.style.setProperty('--dossier-delay','120ms');
    const r=trigger?.getBoundingClientRect();dialog.style.setProperty('--detail-origin',r?`${(r.x+r.width/2)/innerWidth*100}% ${(r.y+r.height/2)/innerHeight*100}%`:'50% 50%');
    this.animate(dialog,[{opacity:0,transform:'translateY(50px) scale(.9)',clipPath:'inset(42% 0 42% 0)'},{opacity:1,transform:'none',clipPath:'inset(0)'}],{duration:700});
    this.animate(dialog.querySelector('.detail-art'),[{clipPath:'polygon(0 0,100% 0,0 100%,0 100%)'},{clipPath:'polygon(0 0,100% 0,100% 100%,0 100%)'}],{duration:700,delay:100});
    dialog.querySelectorAll('.detail-body>*').forEach((el,i)=>this.animate(el,[{opacity:0,transform:'translateX(38px)',clipPath:'inset(0 100% 0 0)'},{opacity:1,transform:'none',clipPath:'inset(0)'}],{duration:820,delay:240+i*85}));
  }
  /** Return the real media plane to its catalogue position; no image clone or new timer. */
  returnDetail(dialog,plan,duration){
    if(this.isReduced()||!dialog?.open||!plan)return false;
    dialog.classList.add('dialog-returning');
    const origin=`${plan.origin.x}px ${plan.origin.y}px`,c=plan.clip;
    const aperture=`inset(${c.top}px ${c.right}px ${c.bottom}px ${c.left}px)`;
    const destination=`translate(${plan.translateX}px,${plan.translateY}px) scale(${plan.scale})`;
    this.animate(dialog,[
      {offset:0,opacity:1,transform:'none',transformOrigin:origin,clipPath:'inset(0)'},
      {offset:.22,opacity:1,transform:'none',transformOrigin:origin,clipPath:aperture},
      {offset:.88,opacity:.96,transform:destination,transformOrigin:origin,clipPath:aperture},
      {offset:1,opacity:0,transform:destination,transformOrigin:origin,clipPath:aperture}
    ],{duration,easing:'cubic-bezier(.45,0,.2,1)'});
    for(const el of dialog.querySelectorAll('.detail-body,.dialog-close'))this.animate(el,[{opacity:1,translate:'0 0'},{opacity:0,translate:'28px 0'}],{duration:Math.min(110,duration*.3),easing:'ease-in'});
    return true;
  }
  resetPointer(){cancelAnimationFrame(this.pointerFrame);if(this.pointerTarget){this.pointerTarget.style.setProperty('--local-x','0');this.pointerTarget.style.setProperty('--local-y','0');}this.pointerTarget=null;}
  pointer(e){
    cancelAnimationFrame(this.pointerFrame);if(this.isReduced()||e.pointerType==='touch'){this.resetPointer();return;}
    const el=e.target.closest('.project-visual,.study-art,.cut-button');
    if(this.pointerTarget&&this.pointerTarget!==el){this.pointerTarget.style.setProperty('--local-x','0');this.pointerTarget.style.setProperty('--local-y','0');}
    this.pointerTarget=el;if(!el)return;cancelAnimationFrame(this.pointerFrame);
    this.pointerFrame=requestAnimationFrame(()=>{const r=el.getBoundingClientRect();el.style.setProperty('--local-x',((e.clientX-r.left)/r.width-.5).toFixed(3));el.style.setProperty('--local-y',((e.clientY-r.top)/r.height-.5).toFixed(3));});
  }
  press(e){
    const el=e.target.closest('button,a');if(!el||this.isReduced())return;this.release();clearTimeout(this.pressTimers.get(el));this.pressed=el;const r=el.getBoundingClientRect();el.style.setProperty('--press-x',`${e.clientX-r.left}px`);el.style.setProperty('--press-y',`${e.clientY-r.top}px`);el.classList.add('is-pressed');
  }
  cancelPress(){
    document.querySelectorAll('.is-pressed').forEach(el=>{clearTimeout(this.pressTimers.get(el));this.pressTimers.delete(el);el.classList.remove('is-pressed');});this.pressed=null;
  }
  release(){if(this.pressed){const el=this.pressed;clearTimeout(this.pressTimers.get(el));this.pressTimers.set(el,setTimeout(()=>{if(this.pressed!==el)el.classList.remove('is-pressed');this.pressTimers.delete(el);},130));this.pressed=null;}}
}

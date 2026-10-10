/** One sparse Canvas layer. No rendering or RAF loop while paused/hidden. */
export class AmbientField {
  constructor(canvas,mode,isPaused){
    this.canvas=canvas;this.ctx=canvas.getContext('2d');this.mode=mode;this.isPaused=isPaused;
    this.width=0;this.height=0;this.last=0;this.previous=0;this.elapsed=0;this.frame=0;this.destroyed=false;
    this.particles=Array.from({length:mode==='about'?32:45},(_,i)=>({x:(i*.61803398875)%1,y:(i*.38196601)%1,r:.45+(i%4)*.25,s:.000006+(i%5)*.000001,phase:i*.7}));
    this.resize=()=>{const r=canvas.getBoundingClientRect();this.width=r.width;this.height=r.height;const dpr=Math.min(window.devicePixelRatio||1,1.5);canvas.width=r.width*dpr;canvas.height=r.height*dpr;this.ctx?.setTransform(dpr,0,0,dpr,0,0);};
    this.observer=new ResizeObserver(this.resize);this.observer.observe(canvas);this.resize();this.tick=this.tick.bind(this);this.visibility=()=>this.sync();document.addEventListener('visibilitychange',this.visibility);this.sync();
  }
  sync(){
    if(this.destroyed)return;
    if(document.hidden||this.isPaused()){cancelAnimationFrame(this.frame);this.frame=0;this.previous=0;return;}
    if(!this.frame){this.previous=0;this.frame=requestAnimationFrame(this.tick);}
  }
  tick(stamp){
    this.frame=0;if(this.destroyed||!this.ctx||document.hidden||this.isPaused())return;
    const dt=this.previous?Math.min(stamp-this.previous,64):0;this.previous=stamp;this.elapsed+=dt;
    if(stamp-this.last>32){this.last=stamp;this.draw(this.elapsed);}
    this.frame=requestAnimationFrame(this.tick);
  }
  draw(t){
    const c=this.ctx,w=this.width,h=this.height;c.clearRect(0,0,w,h);const gold=this.mode==='about';
    for(const p of this.particles){const y=(p.y-t*p.s+100)%1,x=p.x+Math.sin(t*.00011+p.phase)*.035;c.fillStyle=gold?'rgba(221,190,119,.45)':'rgba(174,207,218,.45)';c.beginPath();c.arc(x*w,y*h,p.r,0,Math.PI*2);c.fill();}
    if(this.mode==='home'){c.save();c.translate(w*.79,h*.41);c.rotate(t*.000008);c.strokeStyle='rgba(187,207,210,.13)';c.lineWidth=.6;const r=Math.min(w,h)*.32;for(let i=0;i<58;i++){const a=i*Math.PI*2/58;c.beginPath();c.moveTo(Math.cos(a)*r,Math.sin(a)*r);c.lineTo(Math.cos(a)*(r+(i%5===0?9:3)),Math.sin(a)*(r+(i%5===0?9:3)));c.stroke();}c.restore();}
  }
  destroy(){this.destroyed=true;cancelAnimationFrame(this.frame);this.frame=0;this.observer.disconnect();document.removeEventListener('visibilitychange',this.visibility);}
}

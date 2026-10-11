import {mountSoundtrack} from './soundtrack.js?v=21.10-public7';
mountSoundtrack(document);
const panel=document.querySelector('#audio-panel');
if(panel){
 panel.addEventListener('keydown',event=>{if(event.key==='Escape'&&panel.open){panel.open=false;panel.querySelector('summary')?.focus();event.preventDefault();}});
 document.addEventListener('pointerdown',event=>{if(panel.open&&!panel.contains(event.target))panel.open=false;});
}

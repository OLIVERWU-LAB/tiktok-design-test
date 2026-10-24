const root=document.querySelector('[data-effect-previews]');
if(root){
 const motion=matchMedia('(prefers-reduced-motion: reduce)');
 const cards=[...root.querySelectorAll('[data-preview-style]')].map(el=>({
  el,visible:false,scene:null,readyPromise:null,failed:false,last:0,accumulator:0,
  paused:motion.matches,scrubbing:false,pendingSeek:false,seekFrame:0,seekVersion:0,target:0,
  canvas:el.querySelector('canvas'),toggle:el.querySelector('[data-preview-toggle]'),
  progress:el.querySelector('[data-preview-progress]'),label:el.querySelector('img').alt,
 }));
 let frame=0,library;
 const module=()=>library??=import('./effect-preview/scene.bc979767495e.mjs');
 const active=c=>c.visible&&c.scene&&!c.failed&&!c.paused&&!c.scrubbing&&!c.pendingSeek;
 const runnable=()=>!document.hidden&&cards.some(active);
 function schedule(){if(!frame&&runnable())frame=requestAnimationFrame(tick);}
 function stop(){if(frame)cancelAnimationFrame(frame);frame=0;for(const c of cards)c.last=0;}
 function resize(c){
  const pixels=Math.max(1,Math.round(c.canvas.getBoundingClientRect().width*Math.min(devicePixelRatio||1,1.35))),height=Math.max(1,Math.round(pixels*.75));
  if(c.canvas.width!==pixels||c.canvas.height!==height){c.canvas.width=pixels;c.canvas.height=height;}
 }
 function sync(c){
  c.el.classList.toggle('is-paused',c.paused);c.toggle.setAttribute('aria-pressed',String(c.paused));
  const label=(c.paused?'播放':'暂停')+c.label;
  if(c.toggle.getAttribute('aria-label')!==label)c.toggle.setAttribute('aria-label',label);
  if(c.scene&&!c.scrubbing&&!c.pendingSeek){
   const value=Math.round(c.scene.age/c.scene.duration*1000);if(+c.progress.value!==value)c.progress.value=String(value);
   const fill=(value/10)+'%';if(c.progress.style.getPropertyValue('--preview-progress')!==fill)c.progress.style.setProperty('--preview-progress',fill);
   const percent=Math.round(value/10)+'%';if(c.progress.getAttribute('aria-valuetext')!==percent)c.progress.setAttribute('aria-valuetext',percent);
  }
 }
 function draw(c){
  resize(c);const g=c.canvas.getContext('2d');g.setTransform(c.canvas.width/960,0,0,c.canvas.height/720,0,0);c.scene.draw(g);
  c.el.classList.add('has-animation');sync(c);
 }
 function load(c,force=false){
  if(c.scene)return Promise.resolve(c.scene);
  if(c.readyPromise)return c.readyPromise;
  if(c.failed||(!force&&(c.paused||!c.visible)))return Promise.resolve(null);
  c.el.setAttribute('aria-busy','true');
  c.readyPromise=(async()=>{
   try{
    const {PreviewScene}=await module(),scene=new PreviewScene(c.el.dataset.previewStyle,{mode:c.el.dataset.previewMode,pattern:c.el.dataset.previewPattern||null});
    await scene.prepare();
    for(let i=0;i<(scene.mode==='rain'?20:60);i++)scene.update(1/60);
    c.scene=scene;c.accumulator=0;draw(c);return scene;
   }catch{
    c.scene=null;c.failed=true;c.el.querySelector('[data-preview-retry]').hidden=false;return null;
   }finally{c.readyPromise=null;c.el.removeAttribute('aria-busy');schedule();}
  })();
  return c.readyPromise;
 }
 function tick(time){
  frame=0;if(!runnable())return;
  for(const c of cards){
   if(!active(c)){c.last=0;continue;}
   if(!c.last){c.last=time;continue;}
   if(time-c.last<1000/30-.5)continue;
   const elapsed=Math.min(.08,(time-c.last)/1000);c.last=time;c.accumulator+=elapsed;
   while(c.accumulator>=1/60){c.scene.update(1/60);c.accumulator-=1/60;}
   draw(c);
  }
  schedule();
 }
 function setPause(c,value){
  c.paused=value;c.last=0;sync(c);
  if(!value)load(c,true);
  if(runnable())schedule();else stop();
 }
 async function commitSeek(c){
  const version=c.seekVersion,target=c.target,scene=await load(c,true);
  if(version!==c.seekVersion)return;
  if(scene){scene.seek(target*scene.duration);c.accumulator=0;draw(c);}
  c.pendingSeek=false;c.last=0;sync(c);schedule();
 }
 function requestSeek(c){
  c.target=Math.max(0,Math.min(1,+c.progress.value/1000));c.seekVersion++;c.pendingSeek=true;
  c.progress.style.setProperty('--preview-progress',(c.target*100)+'%');
  if(!c.seekFrame)c.seekFrame=requestAnimationFrame(()=>{c.seekFrame=0;commitSeek(c);});
 }
 function beginScrub(c){c.scrubbing=true;c.last=0;}
 function finishScrub(c){c.scrubbing=false;c.last=0;if(!c.pendingSeek)sync(c);schedule();}
 const visibility=new IntersectionObserver(entries=>{
  for(const entry of entries){const c=cards.find(c=>c.el===entry.target);c.visible=entry.isIntersecting;c.last=0;if(c.visible)load(c);}
  if(runnable())schedule();else stop();
 },{threshold:.05});
 const sizes=new ResizeObserver(entries=>{for(const entry of entries){const c=cards.find(c=>c.canvas===entry.target);if(c?.scene)draw(c);}});
 for(const c of cards){
  c.toggle.addEventListener('click',()=>setPause(c,!c.paused));
  c.progress.addEventListener('pointerdown',()=>beginScrub(c));
  c.progress.addEventListener('input',()=>{beginScrub(c);requestSeek(c);});
  for(const event of ['change','pointerup','pointercancel','blur'])c.progress.addEventListener(event,()=>finishScrub(c));
  c.el.querySelector('[data-preview-retry]').addEventListener('click',()=>{c.failed=false;c.el.querySelector('[data-preview-retry]').hidden=true;load(c,true);});
  visibility.observe(c.el);sizes.observe(c.canvas);sync(c);
 }
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else schedule();});
 motion.addEventListener('change',e=>{for(const c of cards)setPause(c,e.matches);});
 addEventListener('pagehide',stop);
 addEventListener('pageshow',()=>{if(!document.hidden){for(const c of cards)load(c);schedule();}});
}

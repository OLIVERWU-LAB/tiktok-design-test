import {StickerWorld} from './effects.11517e9b3b41.mjs';
import {RefinedCinemaRenderer} from './cinema-refined-renderer.af98e30cac2e.mjs';
import {GiftRenderer} from './gift-renderer.1d30ec3e84f5.mjs';
import {drawFlatFireworks,drawFlatLaunch} from './flat-fireworks.4b713f4ff2c1.mjs';
import {drawLineRain,drawFlatRain} from './rain-style.b33917715d69.mjs';
import {planLiveFirework,fireworkLaunchBusy,fireworkLaunchGap} from './firework-playback.c0aa763aa4fb.mjs';
import {drawWaterSurface} from './water-renderer.d4d29be89ee2.mjs';
import {drawPreviewPerson,previewPersonGeometry,preparePreviewPerson} from './person.ba6542c8bf9b.mjs';

export const PREVIEW_SIZE=576;
export const PREVIEW_WIDTH=960;
export function seededRandom(seed){return()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);}
let sharedGiftRenderer;

// Same launch placement, continuous cadence, particle factories and drawing code as the final Demo. No camera,
// recognition, audio, WebGL context or full-screen renderer is instantiated.
export class PreviewScene{
 constructor(style,{mode='fireworks',pattern=null}={}){
  this.style=style;this.mode=mode;this.pattern=pattern;this.age=0;
  this.seed={cinema:321,gift:79,flat:86}[style];
  this.zoom=1;
  this.anchorY=PREVIEW_SIZE*(style==='gift'?.27:.28);
  this.person=previewPersonGeometry(this.zoom,PREVIEW_WIDTH*.5,this.anchorY);
  this.background={particles:[]};this.foreground={particles:[]};
  this.renderer=style==='cinema'?new RefinedCinemaRenderer():style==='gift'?(sharedGiftRenderer??=new GiftRenderer()):null;
  this.reset(mode);
 }
 async prepare(){const [,gift]=await Promise.all([preparePreviewPerson(),this.style==='gift'?this.renderer.load('random'):true]);if(!gift)throw new Error('Gift preview unavailable');}
 get duration(){return this.mode==='rain'?8:18;}
 reset(mode=this.mode){
  this.mode=mode;this.age=0;this.elapsed=0;this.launchIndex=0;this.nextLaunchAt=.1;this.timingRandom=seededRandom(this.seed+123);
  this.zoom=1;
  this.person=previewPersonGeometry(this.zoom,PREVIEW_WIDTH*.5,this.anchorY);
  // Recreate simulation state, keeping decoded images and drawing caches.
  // A cleared world retains timing/history fields, which would shift a seek.
  this.world=new StickerWorld(seededRandom(this.seed));
  this.world.limit=650;this.world.setStyle(this.style);
  this.world.setEffect(mode==='rain'?'smile':'laugh');
  this.world.viewport={width:PREVIEW_WIDTH,height:PREVIEW_SIZE};
  this.world.head=this.person.head;
  this.world.pattern=this.pattern||(this.style==='cinema'?'cinema-refined':this.style==='gift'?'gift-twinkle':'auto');
 }
 seek(time){
  const target=Math.max(0,Math.min(this.duration-1/120,time));this.reset();
  for(let t=0;t<target-1e-8;){const dt=Math.min(1/60,target-t);this.update(dt);t+=dt;}
 }
 update(dt){
  this.elapsed+=dt;this.age=(this.age+dt)%this.duration;
  if(this.mode==='rain')this.world.rain(dt,PREVIEW_WIDTH,PREVIEW_SIZE,.38);
  else if(this.elapsed>=this.nextLaunchAt&&!fireworkLaunchBusy(this.world)){
   const layout=planLiveFirework(this.world,PREVIEW_WIDTH,PREVIEW_SIZE,this.world.head,this.launchIndex,this.timingRandom);
   if(layout&&this.world.launch(layout.x,layout.y,PREVIEW_WIDTH,PREVIEW_SIZE,layout.scale,layout)){
    this.launchIndex++;this.nextLaunchAt=this.elapsed+fireworkLaunchGap(this.style,this.timingRandom)/1000;
   }else this.nextLaunchAt=this.elapsed+.16;
  }
  this.world.update(dt,PREVIEW_WIDTH,PREVIEW_SIZE,this.person);
  // Audio events have no consumer in a silent preview; never retain a queue.
  this.world.events.length=0;
 }
 draw(g){
  const world=this.world;
  g.save();g.globalAlpha=1;g.globalCompositeOperation='source-over';
  g.fillStyle='#000000';g.fillRect(0,0,PREVIEW_WIDTH,PREVIEW_SIZE);
  if(this.style==='flat'){
   this.background.particles.length=0;this.foreground.particles.length=0;
   for(const p of world.particles)(p.backgroundOnly?this.background:this.foreground).particles.push(p);
   g.save();this.applyZoom(g);drawFlatFireworks(g,this.background);g.restore();
  }
  drawPreviewPerson(g);
  this.applyZoom(g);
  if(this.style==='flat'){
   for(const r of world.rockets)drawFlatLaunch(g,r);
   drawFlatFireworks(g,this.foreground);
   if(this.mode==='rain')for(const p of world.particles)if(p.type==='drop')drawFlatRain(g,p);
  }else if(this.style==='gift'){
   this.renderer.draw(g,world);this.renderer.launches(g,world,PREVIEW_WIDTH,PREVIEW_SIZE);
  }else{
   this.renderer.draw(g,world);this.renderer.launches(g,world,PREVIEW_WIDTH,PREVIEW_SIZE);
   if(this.mode==='rain')for(const p of world.particles)if(p.type==='drop')drawLineRain(g,p,'cinema');
  }
  if(this.mode==='rain')drawWaterSurface(g,world.water,PREVIEW_WIDTH,PREVIEW_SIZE,this.style==='cinema');
  g.restore();
 }
 applyZoom(g){const cx=PREVIEW_WIDTH*.5,cy=this.anchorY;g.translate(cx,cy);g.scale(this.zoom,this.zoom);g.translate(-cx,-cy);}
}

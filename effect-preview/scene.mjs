import {StickerWorld} from './effects.mjs';
import {RefinedCinemaRenderer} from './cinema-refined-renderer.mjs';
import {GiftRenderer} from './gift-renderer.mjs';
import {ACTIVE_FLAT_PATTERNS,drawFlatFireworks,drawFlatLaunch} from './flat-fireworks.mjs';
import {drawLineRain,drawFlatRain} from './rain-style.mjs';
import {drawWaterSurface} from './water-renderer.mjs';

export const PREVIEW_SIZE=720;
export const PREVIEW_WIDTH=960;
export function seededRandom(seed){return()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);}
let sharedGiftRenderer;

// Same particle factories and drawing code as the final Demo. No camera,
// recognition, audio, WebGL context or full-screen renderer is instantiated.
export class PreviewScene{
 constructor(style,{mode='fireworks',pattern=null}={}){
  this.style=style;this.cycle=0;this.mode=mode;this.pattern=pattern;this.age=0;
  this.seed={cinema:321,gift:79,flat:86}[style];
  this.renderer=style==='cinema'?new RefinedCinemaRenderer():style==='gift'?(sharedGiftRenderer??=new GiftRenderer()):null;
  this.reset(mode);
 }
 async prepare(){if(this.style==='gift'&&!await this.renderer.load('random'))throw new Error('Gift preview unavailable');}
 get duration(){return this.mode==='rain'?8:this.style==='cinema'?4.6:3.6;}
 reset(mode=this.mode){
  this.mode=mode;this.age=0;this.launched=false;
  // Recreate simulation state, keeping decoded images and drawing caches.
  // A cleared world retains timing/history fields, which would shift a seek.
  this.world=new StickerWorld(seededRandom(this.seed));
  this.world.limit=650;this.world.setStyle(this.style);
  this.world.setEffect(mode==='rain'?'smile':'laugh');
  this.world.viewport={width:PREVIEW_WIDTH,height:PREVIEW_SIZE};
  this.world.pattern=this.pattern||(this.style==='cinema'?'cinema-refined':this.style==='gift'?'gift-twinkle':ACTIVE_FLAT_PATTERNS[this.cycle%ACTIVE_FLAT_PATTERNS.length]);
 }
 seek(time){
  const target=Math.max(0,Math.min(this.duration-1/120,time));this.reset();
  for(let t=0;t<target-1e-8;){const dt=Math.min(1/60,target-t);this.update(dt);t+=dt;}
 }
 update(dt){
  this.age+=dt;
  if(this.mode==='rain'){this.world.rain(dt,PREVIEW_WIDTH,PREVIEW_SIZE,.38);this.age%=this.duration;}
  else{
   if(!this.launched&&this.age>=.1){
    const scale=this.style==='flat'?.68:this.style==='gift'?.86:1.12;
    this.world.launch(PREVIEW_WIDTH*.5,PREVIEW_SIZE*(this.style==='cinema'?.42:this.style==='flat'?.40:.34),PREVIEW_WIDTH,PREVIEW_SIZE,scale);
    this.launched=true;
   }
   if(this.age>this.duration){this.cycle++;this.reset();}
  }
  this.world.update(dt,PREVIEW_WIDTH,PREVIEW_SIZE,null);
  // Audio events have no consumer in a silent preview; never retain a queue.
  this.world.events.length=0;
 }
 draw(g){
  const world=this.world;
  g.save();g.globalAlpha=1;g.globalCompositeOperation='source-over';
  g.fillStyle='#0b0c10';g.fillRect(0,0,PREVIEW_WIDTH,PREVIEW_SIZE);
  if(this.mode==='fireworks'&&this.style!=='cinema'){
   const zoom=this.style==='gift'?1.40:1.35,cx=PREVIEW_WIDTH*.5,cy=PREVIEW_SIZE*(this.style==='gift'?.34:.40);
   g.translate(cx,cy);g.scale(zoom,zoom);g.translate(-cx,-cy);
  }
  if(this.style==='flat'){
   for(const r of world.rockets)drawFlatLaunch(g,r);
   drawFlatFireworks(g,world);
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
}

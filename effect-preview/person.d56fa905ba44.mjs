import {collide} from './core.mjs';

// One procedural bust, shared by every card. The collision polygon samples the
// very same Bezier outline used for drawing; no image or recognition is needed.
const curves=[
 [523,354,549,384,549,428],[549,459,535,486,515,502],
 [515,510,515,518,515,526],[515,539,533,544,558,552],
 [625,568,658,613,670,678],[673,699,676,720,678,740],
 [546,740,414,740,282,740],[284,720,287,699,290,678],
 [302,613,335,568,402,552],[427,544,445,539,445,526],
 [445,518,445,510,445,502],[425,486,411,459,411,428],
 [411,384,437,354,480,354],
];
const outline=[{x:480,y:354}];
for(const c of curves){const a=outline.at(-1);for(let i=1;i<=6;i++){const t=i/6,u=1-t;outline.push({x:u*u*u*a.x+3*u*u*t*c[0]+3*u*t*t*c[2]+t*t*t*c[4],y:u*u*u*a.y+3*u*u*t*c[1]+3*u*t*t*c[3]+t*t*t*c[5]});}}
let image;
export function drawPreviewPerson(g){
 if(!image){
  image=typeof OffscreenCanvas!=='undefined'?new OffscreenCanvas(960,720):Object.assign(document.createElement('canvas'),{width:960,height:720});
  const c=image.getContext('2d'),fill=c.createLinearGradient(390,354,590,730);
  fill.addColorStop(0,'#535b68');fill.addColorStop(.45,'#363d49');fill.addColorStop(1,'#202630');
  c.beginPath();c.moveTo(480,354);for(const p of curves)c.bezierCurveTo(...p);c.closePath();c.fillStyle=fill;c.fill();
  c.strokeStyle='#a2adbd48';c.lineWidth=1.5;c.stroke();
 }
 g.save();g.globalAlpha=1;g.globalCompositeOperation='source-over';g.drawImage(image,0,0);g.restore();
}
export function previewPersonGeometry(zoom=1,cx=480,cy=288){
 const project=p=>({x:cx+(p.x-cx)/zoom,y:cy+(p.y-cy)/zoom}),polygon=outline.map(project);
 const bounds={left:Math.min(...polygon.map(p=>p.x)),right:Math.max(...polygon.map(p=>p.x)),top:Math.min(...polygon.map(p=>p.y)),bottom:Math.max(...polygon.map(p=>p.y))};
 const a=project({x:419,y:362}),b=project({x:541,y:494});
 return{polygon,head:{left:a.x,right:b.x,top:a.y,bottom:b.y},collide(p,old){
  if(Math.max(p.x,old.x)<bounds.left||Math.min(p.x,old.x)>bounds.right||Math.max(p.y,old.y)<bounds.top||Math.min(p.y,old.y)>bounds.bottom)return false;
  const hit=collide(p,old,polygon);if(hit)p.hitRegion='body';return hit;
 }};
}

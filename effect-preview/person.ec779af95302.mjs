import {collide} from './core.mjs';

// User-provided Subtract.svg; preserve its path and even-odd cutouts.
// The collision boundary is sampled from the same SVG and upper-body crop.
const outline=[[467.712,236.03],[475.607,236.173],[482.067,237.874],[488.838,240.783],[495.723,244.641],[502.524,249.194],[515.086,259.357],[524.946,269.219],[528.02,273.975],[529.948,279.667],[530.93,286.035],[531.169,292.816],[528.713,318.853],[534.9,322.716],[534.908,333.845],[533.4,341.955],[531.738,345.45],[529.29,348.88],[521.491,356.456],[521.431,371.303],[520.31,376.879],[517.556,385.524],[519.668,392.7],[522.96,398.899],[527.375,404.439],[532.855,409.641],[537.787,413.196],[610.412,450.667],[623.482,458.733],[628.637,464.313],[632.923,472.671],[638.752,489.183],[645.59,515.954],[662.85,573.876],[671.914,608.0],[288.733,608.0],[297.517,579.602],[309.548,522.515],[315.306,499.931],[322.252,480.363],[326.774,471.161],[332.2,462.594],[338.275,456.032],[344.774,451.64],[363.442,444.424],[410.208,419.184],[423.244,409.486],[427.704,404.675],[432.13,398.323],[433.302,394.857],[433.157,392.276],[429.397,373.881],[428.096,361.557],[426.356,356.613],[420.232,349.312],[418.952,346.553],[415.817,332.11],[415.07,326.05],[419.27,321.445],[414.539,286.815],[414.601,280.185],[415.757,274.247],[418.192,268.79],[422.09,263.605],[427.637,258.482],[436.163,252.348],[443.106,246.011],[446.335,244.079],[467.712,236.03]].map(([x,y])=>({x,y}));
let image,promise;
export function preparePreviewPerson(){
 if(image)return Promise.resolve();if(promise)return promise;
 promise=(async()=>{
  const response=await fetch(new URL('./assets/person-user.17ec2b0e89e3.svg',import.meta.url));if(!response.ok)throw new Error('Person silhouette unavailable');
  const svg=await response.text(),data=svg.match(/<path\b[^>]*\bd="([^"]+)"/);if(!data)throw new Error('Invalid person silhouette');
  const path=new Path2D(data[1]),canvas=typeof OffscreenCanvas!=='undefined'?new OffscreenCanvas(960,576):Object.assign(document.createElement('canvas'),{width:960,height:576}),g=canvas.getContext('2d');
  g.translate(277.2,236);g.scale(1.2,1.2);g.fillStyle='#444444';g.fill(path,'evenodd');image=canvas;
 })().catch(error=>{promise=null;throw error;});return promise;
}
export function drawPreviewPerson(g){
 if(!image)return;g.save();g.globalAlpha=1;g.globalCompositeOperation='source-over';g.drawImage(image,0,0);g.restore();
}
export function previewPersonGeometry(zoom=1,cx=480,cy=161.28){
 const project=p=>({x:cx+(p.x-cx)/zoom,y:cy+(p.y-cy)/zoom}),polygon=outline.map(project);
 const bounds={left:Math.min(...polygon.map(p=>p.x)),right:Math.max(...polygon.map(p=>p.x)),top:Math.min(...polygon.map(p=>p.y)),bottom:Math.max(...polygon.map(p=>p.y))};
 const a=project({x:411,y:238}),b=project({x:533,y:383});
 return{exactOutline:true,polygon,head:{left:a.x,right:b.x,top:a.y,bottom:b.y},collide(p,old){
  if(Math.max(p.x,old.x)<bounds.left||Math.min(p.x,old.x)>bounds.right||Math.max(p.y,old.y)<bounds.top||Math.min(p.y,old.y)>bounds.bottom)return false;
  const hit=collide(p,old,polygon);if(hit)p.hitRegion=p.y<392?'head':'body';return hit;
 }};
}

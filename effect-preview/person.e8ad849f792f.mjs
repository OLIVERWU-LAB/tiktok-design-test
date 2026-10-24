import {collide} from './core.mjs';

// User-provided Subtract.svg; preserve its path and even-odd cutouts.
// The collision boundary is sampled from the same SVG and upper-body crop.
const outline=[[467.712,204.03],[475.607,204.173],[482.067,205.874],[488.838,208.783],[495.723,212.641],[502.524,217.194],[515.086,227.357],[524.946,237.219],[528.02,241.975],[529.948,247.667],[530.93,254.035],[531.169,260.816],[528.713,286.853],[534.9,290.716],[534.908,301.845],[533.4,309.955],[531.738,313.45],[529.29,316.88],[521.491,324.456],[521.431,339.303],[520.31,344.879],[517.556,353.524],[519.668,360.7],[522.96,366.899],[527.375,372.439],[532.855,377.641],[537.787,381.196],[610.412,418.667],[623.482,426.733],[628.637,432.313],[632.923,440.671],[638.752,457.183],[645.59,483.954],[662.85,541.876],[671.914,576.0],[288.733,576.0],[297.517,547.602],[309.548,490.515],[315.306,467.931],[322.252,448.363],[326.774,439.161],[332.2,430.594],[338.275,424.032],[344.774,419.64],[363.442,412.424],[410.208,387.184],[423.244,377.486],[427.704,372.675],[432.13,366.323],[433.302,362.857],[433.157,360.276],[429.397,341.881],[428.096,329.557],[426.356,324.613],[420.232,317.312],[418.952,314.553],[415.817,300.11],[415.07,294.05],[419.27,289.445],[414.539,254.815],[414.601,248.185],[415.757,242.247],[418.192,236.79],[422.09,231.605],[427.637,226.482],[436.163,220.348],[443.106,214.011],[446.335,212.079],[467.712,204.03]].map(([x,y])=>({x,y}));
let image,promise;
export function preparePreviewPerson(){
 if(image)return Promise.resolve();if(promise)return promise;
 promise=(async()=>{
  const response=await fetch(new URL('./assets/person-user.17ec2b0e89e3.svg',import.meta.url));if(!response.ok)throw new Error('Person silhouette unavailable');
  const svg=await response.text(),data=svg.match(/<path\b[^>]*\bd="([^"]+)"/);if(!data)throw new Error('Invalid person silhouette');
  const path=new Path2D(data[1]),canvas=typeof OffscreenCanvas!=='undefined'?new OffscreenCanvas(960,576):Object.assign(document.createElement('canvas'),{width:960,height:576}),g=canvas.getContext('2d');
  g.translate(277.2,204);g.scale(1.2,1.2);g.fillStyle='#444444';g.fill(path,'evenodd');image=canvas;
 })().catch(error=>{promise=null;throw error;});return promise;
}
export function drawPreviewPerson(g){
 if(!image)return;g.save();g.globalAlpha=1;g.globalCompositeOperation='source-over';g.drawImage(image,0,0);g.restore();
}
export function previewPersonGeometry(zoom=1,cx=480,cy=161.28){
 const project=p=>({x:cx+(p.x-cx)/zoom,y:cy+(p.y-cy)/zoom}),polygon=outline.map(project);
 const bounds={left:Math.min(...polygon.map(p=>p.x)),right:Math.max(...polygon.map(p=>p.x)),top:Math.min(...polygon.map(p=>p.y)),bottom:Math.max(...polygon.map(p=>p.y))};
 const a=project({x:411,y:206}),b=project({x:533,y:351});
 return{exactOutline:true,polygon,head:{left:a.x,right:b.x,top:a.y,bottom:b.y},collide(p,old){
  if(Math.max(p.x,old.x)<bounds.left||Math.min(p.x,old.x)>bounds.right||Math.max(p.y,old.y)<bounds.top||Math.min(p.y,old.y)>bounds.bottom)return false;
  const hit=collide(p,old,polygon);if(hit)p.hitRegion=p.y<360?'head':'body';return hit;
 }};
}

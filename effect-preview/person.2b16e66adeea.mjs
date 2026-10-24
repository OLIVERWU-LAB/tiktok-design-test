import {collide} from './core.mjs';

// CC0 photo-traced silhouette by pitr. See ASSET_SOURCES.md.
// The collision boundary is sampled from the same SVG and upper-body crop.
const outline=[[484.61,300.01],[463.65,303.43],[457.62,306.31],[457.49,308.71],[451.69,309.38],[431.44,328.56],[428.77,334.75],[422.81,338.85],[426.93,339.6],[422.87,357.31],[424.79,358.1],[424.58,361.05],[423.6,365.06],[417.89,367.23],[419.65,368.72],[417.08,371.04],[417.08,374.62],[420.15,377.65],[421.34,383.85],[423.89,384.05],[423.33,389.16],[425.13,389.21],[427.19,397.07],[433.13,400.15],[437.91,410.78],[440.61,431.2],[429.14,433.8],[427.47,440.87],[424.99,443.37],[427.06,445.32],[413.27,457.27],[411.57,459.68],[412.87,460.98],[389.51,463.9],[377.13,467.45],[359.8,473.56],[341.02,485.3],[338.59,490.7],[328.08,500.38],[313.71,527.75],[303.27,583.33],[302.3,626.45],[300.36,634.88],[302.19,639.9],[308.54,639.62],[306.35,666.45],[309.13,670.66],[308.58,681.47],[312.48,710.06],[318.02,720.0],[595.77,720.0],[598.57,713.47],[601.28,701.96],[601.95,686.33],[617.8,634.59],[614.94,602.68],[618.4,593.17],[613.71,591.59],[614.82,582.56],[610.69,561.89],[610.51,540.64],[607.01,518.14],[602.36,510.8],[604.59,510.65],[604.35,509.17],[597.6,503.53],[587.22,496.81],[562.86,490.35],[564.82,488.95],[555.22,483.72],[537.3,477.61],[524.51,462.83],[521.97,450.54],[527.67,432.47],[523.14,428.23],[526.87,422.46],[529.14,425.88],[530.69,420.62],[527.96,418.71],[538.26,403.95],[541.15,385.3],[543.09,382.75],[540.68,381.23],[542.81,367.9],[541.62,344.82],[530.58,322.64],[513.71,308.12],[498.56,301.71],[484.61,300.01]].map(([x,y])=>({x,y}));
let image,promise;
export function preparePreviewPerson(){
 if(image)return Promise.resolve();if(promise)return promise;
 promise=(async()=>{
  const response=await fetch(new URL('./assets/person-standing.aa9f24b61e71.svg',import.meta.url));if(!response.ok)throw new Error('Person silhouette unavailable');
  const svg=await response.text(),data=svg.match(/<path\b[^>]*\bd="([^"]+)"/);if(!data)throw new Error('Invalid person silhouette');
  const path=new Path2D(data[1]),canvas=typeof OffscreenCanvas!=='undefined'?new OffscreenCanvas(960,720):Object.assign(document.createElement('canvas'),{width:960,height:720}),g=canvas.getContext('2d');
  g.translate(238.5,300);g.scale(2.3,2.3);const fill=g.createLinearGradient(70,0,115,190);
  fill.addColorStop(0,'#747e8d');fill.addColorStop(.45,'#525c6a');fill.addColorStop(1,'#303946');
  g.fillStyle=fill;g.fill(path);g.strokeStyle='#bfc9d52a';g.lineWidth=.4;g.stroke(path);image=canvas;
 })().catch(error=>{promise=null;throw error;});return promise;
}
export function drawPreviewPerson(g){
 if(!image)return;g.save();g.globalAlpha=1;g.globalCompositeOperation='source-over';g.drawImage(image,0,0);g.restore();
}
export function previewPersonGeometry(zoom=1,cx=480,cy=201.6){
 const project=p=>({x:cx+(p.x-cx)/zoom,y:cy+(p.y-cy)/zoom}),polygon=outline.map(project);
 const bounds={left:Math.min(...polygon.map(p=>p.x)),right:Math.max(...polygon.map(p=>p.x)),top:Math.min(...polygon.map(p=>p.y)),bottom:Math.max(...polygon.map(p=>p.y))};
 const a=project({x:426,y:304}),b=project({x:540,y:441});
 return{polygon,head:{left:a.x,right:b.x,top:a.y,bottom:b.y},collide(p,old){
  if(Math.max(p.x,old.x)<bounds.left||Math.min(p.x,old.x)>bounds.right||Math.max(p.y,old.y)<bounds.top||Math.min(p.y,old.y)>bounds.bottom)return false;
  const hit=collide(p,old,polygon);if(hit)p.hitRegion='body';return hit;
 }};
}

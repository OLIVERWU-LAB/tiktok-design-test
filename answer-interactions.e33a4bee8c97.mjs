const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));

// Keep the enlarged thumbnail out of the current row and its text column.
export function hoverImagePlacement(image,row,viewport){
 const inset=16,gap=12,padding=8;
 const factor=Math.min(2,(viewport.width-inset*2-padding*2)/image.width,(viewport.height-inset*2-padding*2)/image.height);
 const width=image.width*factor+padding*2,height=image.height*factor+padding*2;
 const above=row.top-gap-height,below=row.bottom+gap;
 return {width,height,left:clamp((image.left+image.right-width)/2,inset,Math.max(inset,viewport.width-width-inset)),
  top:clamp(above>=inset?above:below+height<=viewport.height-inset?below:above,inset,Math.max(inset,viewport.height-height-inset))};
}

// The collapsed thumbnail opens its score card. Only an already open card
// passes the click through to the existing full-image dialog handler.
export function handleRankMediaClick(event,row,expand){
 if(!event.target.closest('[data-enlarge]'))return false;
 if(row.dataset.expanded!=='true'){
  event.preventDefault();event.stopPropagation();expand(row,true);
 }
 return true;
}

export function installAnswerInteractions({document,window,root}){
 const popup=document.createElement('div'),image=document.createElement('img');
 popup.className='rank-hover-preview';popup.hidden=true;popup.setAttribute('aria-hidden','true');image.decoding='async';popup.append(image);document.body.append(popup);
 const finePointer=window.matchMedia('(hover: hover) and (pointer: fine)');let owner=null;
 function hideImagePreview(){popup.hidden=true;owner=null;}
 function showImagePreview(button){
  const row=button.closest('.ranking'),thumbnail=button.querySelector('img');
  if(!row||row.open||row.dataset.expanded==='true'||!thumbnail)return hideImagePreview();
  const bounds=button.getBoundingClientRect();if(!bounds.width||!bounds.height)return;
  const layout=hoverImagePlacement(bounds,row.getBoundingClientRect(),{width:window.innerWidth,height:window.innerHeight});
  const source=thumbnail.currentSrc||thumbnail.src;
  if(image.src!==source)image.src=source;image.alt=thumbnail.alt;
  for(const field of ['width','height','left','top'])popup.style[field]=layout[field]+'px';
  owner=button;popup.hidden=false;
 }
 root.addEventListener('pointerover',event=>{
  if(!finePointer.matches||event.pointerType==='touch')return;
  const button=event.target.closest('.rank-media');
  if(button&&(!event.relatedTarget||!button.contains(event.relatedTarget)))showImagePreview(button);
 });
 root.addEventListener('pointerout',event=>{
  if(owner&&owner.contains(event.target)&&(!event.relatedTarget||!owner.contains(event.relatedTarget)))hideImagePreview();
 });
 root.addEventListener('focusin',event=>{
  const button=event.target.closest('.rank-media');
  if(button&&button.matches(':focus-visible'))showImagePreview(button);
 });
 root.addEventListener('focusout',hideImagePreview);
 root.addEventListener('pointerdown',hideImagePreview);
 root.addEventListener('click',hideImagePreview);
 window.addEventListener('scroll',hideImagePreview,{passive:true});
 window.addEventListener('resize',hideImagePreview);
 window.addEventListener('blur',hideImagePreview);
 window.addEventListener('keydown',event=>{if(event.key==='Escape')hideImagePreview();});
 finePointer.addEventListener('change',hideImagePreview);

 return {hideImagePreview};
}

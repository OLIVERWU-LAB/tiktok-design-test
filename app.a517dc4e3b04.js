import {installAnswerInteractions,handleRankMediaClick} from './answer-interactions.e33a4bee8c97.mjs';
const $=s=>document.querySelector(s);
const fields=['composition','light','content','structure','oiliness'];
const labels={composition:'构图',light:'光影色彩关系',content:'内容意味与艺术表达',structure:'结构错误',oiliness:'画面质感缺陷'};
const anchors={
 composition:['空间与透视组织严重失效，画面无法使用。','主体难以识别，物件关系混乱。','布局随意、基本可读，缺乏明确的构图经营。','组织合理、阅读舒服，优于随手拍摄。','专业、准确，形式成熟但新意有限。','物件关系形成叙事，服务主旨，并带来新颖的视觉组织。'],
 light:['光色关系严重失去逻辑，破坏物件与空间的可读性。','过饱和或光感油腻，明显妨碍观看。','色彩与照明基本正常，没有明确亮点。','色彩协调、光线自然，有一定摄影完成度。','光影逻辑合理、材质可信，达到成熟专业水准。','质感出色，或艺术化光色控制鲜明、完整且有说服力。'],
 content:['表达完全失效，无法建立可读的画面意图。','意图不明，难以判断主体与画面要表达什么。','内容日常、意味有限；或装饰压过商业主体，使表达变弱。','意图清楚且一致，具备氛围、情绪或常见创意。','氛围、情绪或情境传达鲜明，或创意有趣、能吸引观看。','叙事充分、意味深刻，艺术表达引人思考。'],
 structure:['未见明确结构错误。','仔细检查才可发现的微小连接异常。','局部关系略不合理，但未破坏主体结构。','明确的局部结构错误，例如多指或错误连接。','大面积穿模、畸形或不合理姿态，主体结构明显受损。','整体结构崩坏，主体形体已难以辨认。'],
 oiliness:['未见可观察的质感缺陷。','仔细检查才可发现轻微涂抹或糊化。','局部存在可见的塑料感、涂抹或脏斑。','较大区域受到影响，但整体仍可阅读。','破碎色块、油腻或杂乱纹理破坏整体光感层次。','严重且广泛的质感缺陷，整体画面接近不可用。']
};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=n=>Number(n).toFixed(1), penalty=f=>f==='structure'||f==='oiliness';
const definitions={composition:'布局与空间组织；物件之间的关系是否服务于主旨。',light:'色彩协调、光影逻辑与材质塑造，以及艺术化控制。',content:'主体与意图清晰，具有叙事、情绪或艺术表达。',structure:'人体或物体畸形、错误连接、穿模与透视崩坏。',oiliness:'塑料感、涂抹糊化、脏斑与破碎纹理。'};
let rows=[];
function score(r){return Math.round((2+(r.composition+r.light+r.content-r.structure-r.oiliness)/10)*10)/10}
function points(n,negative=false){return `${n?(negative?'− ':'+ '):''}${fmt(n/10)}`}
function stars(n,extra=''){return `<span class="stars ${extra}" role="img" aria-label="${n} 星"><span class="stars-base" aria-hidden="true">★★★★★</span><span class="stars-fill" style="width:${n*20}%" aria-hidden="true">★★★★★</span></span>`}
const nodeNames={composition:'构图',light:'光影色彩',content:'内容意味',structure:'结构错误',oiliness:'质感缺陷'};
const nodeHints={composition:'布局与空间关系',light:'色彩与光影逻辑',content:'叙事与艺术表达',structure:'人体与物体结构',oiliness:'表面与纹理质量'};
const levels={
 composition:['空间崩坏，无法使用','主体难辨，关系混乱','日常随意，缺少经营','布局合理，阅读清楚','专业成熟，新意有限','关系有叙事，构图新颖'],
 light:['光色失去逻辑','过饱和，光感油腻','基本正常，没有亮点','自然协调，完成度好','质感可信，光影专业','质感出色，艺术控制强'],
 content:['表达完全失效','意图难辨','内容平淡或主体模糊','意图清楚，有基本氛围','情绪鲜明或创意有趣','叙事深刻，引人思考'],
 structure:['未见结构错误','细看才见微小异常','局部关系不合理','多指或明确连接错误','大面积穿模与畸形','整体崩坏，难以辨认'],
 oiliness:['未见质感缺陷','细看才见轻微涂抹','局部缺陷可见','较大区域受到影响','油腻破碎，层次受损','整体严重失真']
};
function rich(text){return esc(text).replace(/【(.*?)】/g,'<strong>$1</strong>')}
function plain(text){return String(text??'').replace(/[【】]/g,'')}
$('#criteria-map').innerHTML=fields.map(f=>`<section class="node-row ${penalty(f)?'negative':''}" aria-labelledby="node-title-${f}"><div class="major-node"><h4 id="node-title-${f}">${nodeNames[f]}</h4><p>${nodeHints[f]}</p><div class="node-rating"><div class="node-score-line"><div class="node-number">${penalty(f)?'−':'+'} 1.0</div><span class="node-limit">${penalty(f)?'最多扣除':'满分'}</span></div>${stars(5,'node-stars')}</div></div><div class="minor-branch"><div class="levels-caption">档位：</div><div class="minor-nodes">${[5,4,3,2,1,0].map(n=>`<div class="minor-node"><div class="level-value"><strong>${penalty(f)&&n?'− ':''}${fmt(n/5)}</strong>${stars(n,'level-stars')}</div><p>${levels[f][n]}</p></div>`).join('')}</div></div></section>`).join('');
const tree=$('.score-tree'),root=$('.baseline-node'),wireSvg=$('.score-wires');
let wireFrame=0;
function drawWires(){wireFrame=0;const majors=[...tree.querySelectorAll('.major-node')],narrow=innerWidth<=1050,stacked=innerWidth<=900;if(!majors.length)return;
 const t=tree.getBoundingClientRect();
 const box=n=>{const b=n.getBoundingClientRect();return {left:b.left-t.left,right:b.right-t.left,top:b.top-t.top,bottom:b.bottom-t.top,width:b.width,height:b.height,cy:b.top-t.top+b.height/2}};
 if(!narrow){const middle=box(majors[2]);root.style.top=`${middle.cy-root.getBoundingClientRect().height/2}px`}else root.style.top='';
 const r=box(root),m=majors.map(box),bus=m[0].left-(narrow?12:16),radius=7;
 const sourceX=narrow?r.left:r.right,sourceY=narrow?r.cy:m[2].cy;
 let rootPaths;
 if(!narrow){
  const top=m[0].cy,bottom=m[m.length-1].cy;
  rootPaths=[`M ${m[0].left} ${top} H ${bus+radius} Q ${bus} ${top} ${bus} ${top+radius} V ${bottom-radius} Q ${bus} ${bottom} ${bus+radius} ${bottom} H ${m[m.length-1].left}`,
   `M ${sourceX} ${sourceY} H ${m[2].left}`,
   ...[1,3].map(i=>`M ${bus} ${m[i].cy} H ${m[i].left}`)];
 }else{
  rootPaths=[`M ${sourceX} ${sourceY} H ${bus+radius} Q ${bus} ${sourceY} ${bus} ${sourceY+radius} V ${m[m.length-1].cy-radius} Q ${bus} ${m[m.length-1].cy} ${bus+radius} ${m[m.length-1].cy} H ${m[m.length-1].left}`,
   ...m.slice(0,-1).map(b=>`M ${bus} ${b.cy} H ${b.left}`)];
 }
 const rightPaths=majors.map(n=>{const a=box(n),c=box(n.parentElement.querySelector('.levels-caption'));return stacked?`M ${a.left+a.width/2} ${a.bottom} V ${c.top-4}`:`M ${a.right} ${c.top+9} H ${c.left-7}`});
 const render=paths=>paths.map(d=>`<path d="${d}"/>`).join('');
 wireSvg.setAttribute('viewBox',`0 0 ${t.width} ${tree.getBoundingClientRect().height}`);wireSvg.querySelector('.root-wires').innerHTML=render(rootPaths);wireSvg.querySelector('.level-wires').innerHTML=render(rightPaths);
}
function scheduleWires(){if(!wireFrame)wireFrame=requestAnimationFrame(drawWires)}
const wireObserver=new ResizeObserver(scheduleWires);wireObserver.observe(tree);wireObserver.observe(root);document.fonts.ready.then(scheduleWires);addEventListener('resize',scheduleWires);scheduleWires();
function standard(r,f){const n=r[f]/2;if(Number.isInteger(n))return anchors[f][n];const low=Math.floor(n),high=Math.ceil(n);return `介于「${anchors[f][low]}」与「${anchors[f][high]}」之间。`}
function metric(r,f){return `<button class="metric ${penalty(f)?'negative':''}" data-standard="${f}" data-image="${r.imageId}" aria-label="${labels[f]} ${points(r[f],penalty(f))}：查看对应标准"><span class="metric-name">${labels[f]}</span><span class="metric-value"><strong>${points(r[f],penalty(f))}</strong>${stars(r[f]/2)}</span></button>`}
function evidence(r,k,label){return `<div class="evidence-block"><span class="evidence-label">${label}</span><p>${rich(r[k])}</p></div>`}
function ranking(r,i){return `<details class="ranking" id="image-${r.imageId}" data-image="${r.imageId}"><summary aria-expanded="false" aria-controls="detail-${r.imageId}"><span class="rank-num">${String(i+1).padStart(2,'0')}</span><button class="rank-media" data-enlarge="${r.imageId}" aria-label="展开${esc(r.title)}的评分依据"><img class="rank-image" src="assets/images/${r.imageId}.svg" alt="${esc(r.title)}" loading="lazy"><span class="image-enlarge-overlay" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 3H3v5M16 3h5v5M3 16v5h5M21 16v5h-5"/><path d="m8 8-5-5m13 5 5-5M8 16l-5 5m13-5 5 5"/></svg></span></button><div class="rank-info"><h4>${esc(r.title)}</h4><p>${esc(r.summary||plain(r.strengths))}</p></div><div class="rank-score"><strong>${fmt(score(r))}<small>/ 5</small></strong><span class="expand-label"><span>展开评分依据</span><i class="chevron" aria-hidden="true"></i></span></div></summary><div class="rank-detail" id="detail-${r.imageId}"><div class="metrics">${fields.map(f=>metric(r,f)).join('')}</div>${evidence(r,'strengths','主要优点')}${evidence(r,'issues','主要问题')}</div></details>`}
function picks(){const render=(r,i,bottom=false)=>`<article class="pick"><button class="pick-image" data-jump="${r.imageId}" aria-label="查看${esc(r.title)}的评分依据"><img src="assets/images/${r.imageId}.svg" alt="${esc(r.title)}" loading="lazy">${bottom?'':`<span class="pick-rank-tag">TOP ${i+1}</span>`}<span class="pick-action">评分依据 ↘</span></button><div class="pick-meta"><h4>${esc(r.title)}</h4><strong>${fmt(score(r))}</strong></div><p>${esc(r.selectionReason||r.summary)}</p></article>`;$('#top-picks').innerHTML=rows.slice(0,3).map((r,i)=>render(r,i)).join('');$('#bottom-picks').innerHTML=rows.slice(-3).reverse().map((r,i)=>render(r,i,true)).join('')}
const tip=document.createElement('div');tip.id='score-standard-tooltip';tip.className='score-tooltip';tip.setAttribute('role','tooltip');tip.hidden=true;document.body.append(tip);let tipOwner=null;
function hideTip(){tip.hidden=true;if(tipOwner)tipOwner.removeAttribute('aria-describedby');tipOwner=null}
function showTip(button){const r=rows.find(r=>r.imageId===button.dataset.image),f=button.dataset.standard;if(!r)return;hideTip();tipOwner=button;button.setAttribute('aria-describedby',tip.id);tip.innerHTML=`<strong>${labels[f]} <span>${points(r[f],penalty(f))}</span></strong><p>${esc(standard(r,f))}</p>`;tip.classList.toggle('negative',penalty(f));tip.hidden=false;const b=button.getBoundingClientRect(),w=tip.getBoundingClientRect().width,h=tip.getBoundingClientRect().height;tip.style.left=`${Math.max(16,Math.min(innerWidth-w-16,b.left))}px`;tip.style.top=`${b.top>h+20?b.top-h-10:b.bottom+10}px`}
$('#rankings').addEventListener('pointerover',e=>{const b=e.target.closest('.metric[data-standard]');if(b&&(!e.relatedTarget||!b.contains(e.relatedTarget)))showTip(b)});
$('#rankings').addEventListener('pointerout',e=>{const b=e.target.closest('.metric[data-standard]');if(b&&(!e.relatedTarget||!b.contains(e.relatedTarget)))hideTip()});
$('#rankings').addEventListener('focusin',e=>{const b=e.target.closest('.metric[data-standard]');if(b)showTip(b)});
$('#rankings').addEventListener('focusout',hideTip);

addEventListener('scroll',hideTip,{passive:true});addEventListener('resize',hideTip);addEventListener('keydown',e=>{if(e.key==='Escape')hideTip()});
const answerInteractions=installAnswerInteractions({document,window,root:$('#rankings')});
const animations=new WeakMap();
function expand(row,open){
 answerInteractions.hideImagePreview();
 const summary=row.querySelector('summary'),detail=row.querySelector('.rank-detail');
 const start=row.getBoundingClientRect().height,startWidth=row.querySelector('.rank-media').getBoundingClientRect().width;
 const startOpacity=row.open?Number(getComputedStyle(detail).opacity):0;
 const previous=animations.get(row);if(previous)for(const a of previous){a.onfinish=null;a.cancel()}
 row.style.height='';row.dataset.expanded=String(open);row.open=true;
 summary.setAttribute('aria-expanded',open);summary.querySelector('.expand-label>span').textContent=open?'收起评分依据':'展开评分依据';
 const media=row.querySelector('.rank-media'),title=media.querySelector('img').alt;media.setAttribute('aria-label',open?'放大查看'+title:'展开'+title+'的评分依据');
 const endWidth=row.querySelector('.rank-media').getBoundingClientRect().width;
 const end=open?row.getBoundingClientRect().height:summary.getBoundingClientRect().height;
 hideTip();
 if(matchMedia('(prefers-reduced-motion: reduce)').matches){row.open=open;row.style.overflow='';return}
 row.style.overflow='hidden';
 const timing={duration:380,easing:'cubic-bezier(.22,.61,.36,1)',fill:'both'};
 const main=row.animate([{height:`${start}px`},{height:`${end}px`}],timing);
 const resize=row.animate([{'--thumb':`${startWidth}px`},{'--thumb':`${endWidth}px`}],timing);
 const fade=detail.animate([{opacity:startOpacity},{opacity:open?1:0}],timing);
 const running=[main,resize,fade];animations.set(row,running);
 main.onfinish=()=>{row.open=open;row.style.height='';row.style.overflow='';for(const a of running)a.cancel();animations.delete(row)};
}
$('#rankings').addEventListener('click',e=>{
 const row=e.target.closest('.ranking');if(!row)return;
 if(handleRankMediaClick(e,row,expand))return;
 const selection=window.getSelection();if(selection&&!selection.isCollapsed)return;
 const summary=e.target.closest('summary');
 if(summary||row.dataset.expanded==='true'){e.preventDefault();expand(row,row.dataset.expanded!=='true')}
});
document.addEventListener('click',e=>{const jump=e.target.closest('[data-jump]');if(jump){const row=$(`#image-${jump.dataset.jump}`);expand(row,true);row.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});return}const b=e.target.closest('[data-enlarge]');if(b){const r=rows.find(r=>r.imageId===b.dataset.enlarge);$('#image-dialog img').src=`assets/images/${r.imageId}.svg`;$('#image-dialog img').alt=r.title;$('#image-dialog p').textContent=r.title;$('#image-dialog').showModal()}});
$('#image-dialog').addEventListener('click',e=>{if(e.target===$('#image-dialog'))$('#image-dialog').close()});
$('#copy-contract')?.addEventListener('click',async()=>{try{await navigator.clipboard.writeText($('#contract').textContent);$('#copy-contract').textContent='已复制';setTimeout(()=>$('#copy-contract').textContent='复制 ↗',1600)}catch{$('#copy-contract').textContent='请选中文字复制'}});
// Cross a chapter boundary with one gesture; retain native scrolling within long answers.
let boundaryGestureUntil=0;
addEventListener('wheel',e=>{
 if(e.ctrlKey||e.defaultPrevented||Math.abs(e.deltaX)>Math.abs(e.deltaY))return;
 const now=performance.now();
 if(now<boundaryGestureUntil){e.preventDefault();return}
 if(e.deltaY<=6)return;
 const chapters=[$('#home'),...document.querySelectorAll('.part-section')];
 const inset=innerWidth<=650?106:0;
 for(let i=0;i<chapters.length-1;i++){
  const current=chapters[i].getBoundingClientRect(),next=chapters[i+1].getBoundingClientRect();
  if(current.top<=inset+8&&next.top>inset+8&&next.top<=innerHeight+2){
   e.preventDefault();boundaryGestureUntil=now+650;
   chapters[i+1].scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});break;
  }
 }
},{passive:false});
let ticking=false,activePart=null,navigationTarget=null,navigationTimer;
function activate(id){if(id===activePart)return;activePart=id;document.querySelectorAll('.question-card').forEach(a=>{const current=a.dataset.part===id;a.classList.toggle('active',current);if(current)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current')});$('#reading-progress').textContent=id?`0${id.slice(-1)} / 03`:'00 / 03'}
function updateSection(){ticking=false;if(navigationTarget)return;const threshold=innerWidth<=650?150:Math.min(innerHeight*.28,220);let id='';for(const section of document.querySelectorAll('.part-section'))if(section.getBoundingClientRect().top<=threshold)id=section.id;activate(id)}
addEventListener('scroll',()=>{if(navigationTarget){clearTimeout(navigationTimer);navigationTimer=setTimeout(()=>{navigationTarget=null;updateSection()},160)}if(!ticking){ticking=true;requestAnimationFrame(updateSection)}},{passive:true});
addEventListener('resize',updateSection);document.querySelectorAll('.question-card').forEach(a=>a.addEventListener('click',()=>{navigationTarget=a.dataset.part;activate(navigationTarget);clearTimeout(navigationTimer);navigationTimer=setTimeout(()=>{navigationTarget=null;updateSection()},1400)}));
updateSection();
try{const source=await(await fetch('ratings.json')).json();rows=source.ratings.sort((a,b)=>score(b)-score(a)||a.rank-b.rank);$('#rankings').innerHTML=rows.map(ranking).join('');picks();updateSection()}catch(e){$('#rankings').innerHTML='<p class="caption">评分数据未能载入，请刷新重试。</p>';console.error(e)}

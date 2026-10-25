(() => {
'use strict';
const $=s=>document.querySelector(s),ns='http://www.w3.org/2000/svg';
const board=$('#pa-board'),viewport=$('#pa-viewport'),world=$('#pa-world'),svg=$('#pa-wires');if(!board)return;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const W=7300,H=2800,NW=480;
const countries=[['JP','日本'],['FR','法国'],['BR','巴西'],['ID','印度尼西亚'],['US','美国'],['SA','沙特阿拉伯'],['GB','英国'],['DE','德国'],['IT','意大利'],['ES','西班牙'],['CA','加拿大'],['MX','墨西哥'],['AR','阿根廷'],['CL','智利'],['CO','哥伦比亚'],['PE','秘鲁'],['PT','葡萄牙'],['NL','荷兰'],['BE','比利时'],['SE','瑞典'],['NO','挪威'],['DK','丹麦'],['FI','芬兰'],['PL','波兰'],['CZ','捷克'],['AT','奥地利'],['CH','瑞士'],['GR','希腊'],['TR','土耳其'],['AE','阿联酋'],['EG','埃及'],['MA','摩洛哥'],['ZA','南非'],['NG','尼日利亚'],['KE','肯尼亚'],['IN','印度'],['PK','巴基斯坦'],['BD','孟加拉国'],['TH','泰国'],['VN','越南'],['MY','马来西亚'],['PH','菲律宾'],['SG','新加坡'],['KR','韩国'],['AU','澳大利亚'],['NZ','新西兰'],['UA','乌克兰'],['RO','罗马尼亚'],['HU','匈牙利'],['IE','爱尔兰']].map(([id,name])=>({id,name}));
const fields=(...rows)=>`<dl class="pa-node-io">${rows.map(([k,v])=>`<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>`;
function socket(key,label,code='',side='left',output=false,caption='',condition=''){return `<div class="pa-socket-row ${output?'is-output':'is-input'}" data-pa-socket="${key}" data-side="${side}"><span class="pa-socket-caption">${caption||(output?'输出':'输入')}</span><div>${condition?`<span class="pa-branch-condition">${condition}</span>`:''}<strong>${label}</strong>${code?`<code>${code}</code>`:''}</div></div>`;}
const inp=(k,l,c='')=>socket(k,l,c,'left'),out=(k,l,c='')=>socket(k,l,c,'right',true);
const scenario=(kind,title,content)=>`<section class="pa-scenario" data-pa-scenario="${kind}"><h5>${title}</h5>${content}</section>`;
const branch=(key,caption,condition,content)=>socket(key,content,'','right',true,caption,condition);
const decision=(label,content)=>`<section class="pa-decision" aria-label="${label}"><h5><span>输出</span><small>${label} · 二选一</small></h5>${content}</section>`;
const thumbnail=(key,label)=>`<figure class="pa-output-preview"><img src="assets/workflow/${key}.${key==='texture'?'jpg':'png'}" width="1672" height="941" alt="${label}输出示意" loading="lazy" draggable="false"><figcaption>输出示意</figcaption></figure>`;
const group={x:3252,y:70,w:1932,h:1300};
const nodes={
 input:{x:72,y:180,type:'input',title:'母版与目标地区',body:`<label class="pa-field">母版 / 创意描述<textarea id="pa-brief">共享礼盒母版，以地区纹样与配色制作系列礼物。</textarea></label><div class="pa-country-head"><span>目标地区 · <b data-pa-region-count>50</b> / 50</span><button type="button" id="pa-select-all">全选</button><button type="button" id="pa-select-none">清空</button></div><div class="pa-country-list">${countries.map(r=>`<label><span>${r.name}</span><input type="checkbox" name="pa-country" value="${r.id}" checked></label>`).join('')}</div><label class="pa-field">每地区资产项数<input id="pa-assets-count" type="number" min="1" max="20" value="3"></label><label class="pa-field">交付约束<select id="pa-route"><option value="3d">实时 3D</option><option value="video">视频动效</option></select></label>`,outputs:out('batch','母版、地区与资产清单')},
 demand:{x:708,y:180,type:'agent',title:'需求解析',inputs:inp('batch','母版、目标地区与交付要求'),body:fields(['任务','每地区整理一份需求说明，拆成资产清单，明确各项的外观、动作和交付规格；每项资产分配独立编号。']),outputs:out('briefs','分地区需求说明与资产清单')},
 culture:{x:1344,y:180,type:'agent',title:'文化合规',inputs:inp('briefs','地区需求说明与资产清单'),body:fields(['任务','查证有来源的文化规则，明确禁用元素、可用替代与素材要求。同地区复用已确认的规则；资料冲突先交人工确认。']),outputs:out('packet','资产需求与文化约束')},
 queue:{x:2616,y:180,type:'control',title:'执行队列与调度',inputs:inp('plan','JSON 调用计划','plan.json'),body:`<div class="pa-fields"><label class="pa-field">同时制作数<input id="pa-concurrency" type="number" min="1" value="4"></label></div>`+fields(['任务','按步骤依赖与同时制作数调度工具；调用结束后回写该资产的实际费用。']),outputs:out('dispatch','按制作顺序调用工具')},
 plan:{x:1980,y:180,type:'agent',title:'生成编排与修正',body:scenario('initial','首次生成',inp('task','资产需求、文化约束与可用工具')+fields(['编排','为当前资产编写提示词，安排制作步骤、工具参数和先后依赖；视频路线同时安排镜头与时长。']))+`<div class="pa-scenario-or" aria-hidden="true">或</div>`+scenario('repair','审核退回 · 重试时',inp('repair','对应资产与版本的审核问题报告')+fields(['修正','根据问题位置和审核依据，改写对应提示词或参数；重做受影响步骤，复用其余合格产物。'])),outputs:`<div class="pa-shared-output">${out('plan','JSON 调用计划','plan.json')}</div>`},
 mesh:{x:3324,y:220,type:'tool',route:'3d',title:'模型',inputs:inp('plan','模型提示词与已有底模'),body:fields(['任务','复用或生成几何模型。']),outputs:out('mesh','几何模型')+thumbnail('mesh','模型')},
 texture:{x:3960,y:220,type:'tool',route:'3d',title:'材质',inputs:inp('mesh','几何模型与材质要求'),body:fields(['任务','依模型 UV 适配贴图，检查模型与纹理是否匹配。']),outputs:out('material','带材质的模型')+thumbnail('texture','材质')},
 motion:{x:4596,y:220,type:'tool',route:'3d',title:'动作与渲染',inputs:inp('material','带材质的模型与动作要求'),body:fields(['任务','刚体使用变换，角色按需绑定；制作动作与检查预览，保留源文件。']),outputs:out('candidate','3D 成品与源文件')+thumbnail('motion','动作与渲染')},
 image:{x:3324,y:820,type:'tool',route:'video',title:'图片',inputs:inp('plan','图像提示词与授权参考'),body:fields(['任务','生成主体参考图，统一后续镜头的外观。']),outputs:out('image','主体参考图')+thumbnail('image','图片')},
 frames:{x:3960,y:820,type:'tool',route:'video',title:'分镜与关键帧',inputs:inp('image','主体参考图与镜头安排'),body:fields(['任务','按镜头生成关键帧，确定首尾画面与时长。']),outputs:out('frames','分镜与关键帧')+thumbnail('frames','分镜与关键帧')},
 video:{x:4596,y:820,type:'tool',route:'video',title:'视频与合成',inputs:inp('frames','分镜、关键帧与动作提示词'),body:fields(['任务','生成片段并合成，处理透明通道与输出规格。']),outputs:out('candidate','视频成品与源文件')+thumbnail('video','视频与合成')},
 review:{x:5376,y:520,type:'agent',title:'产物质量合规审核',inputs:inp('3d','3D 成品与源文件')+inp('video','视频成品与源文件'),body:fields(['任务','独立对照需求说明、文化约束和规格检测结果，检查实际产物的结构、画面与动作；报告标明问题位置、证据及资产版本。']),outputs:decision('按审核结果',branch('pass','通过','质量、文化合规与交付规格均通过','成品与通过记录 → 打包整理')+branch('fail','拦截','质量、结构或文化合规不达标','问题报告与资产版本'))},
 runtime:{x:6012,y:1420,type:'control',title:'重试与熔断控制',inputs:inp('report','当前资产的不通过报告'),body:fields(['任务','结算当前资产的重试次数与实际费用，并累计本批次同地区因文化合规熔断的资产数量。'])+`<div class="pa-fields"><label class="pa-field">单资产重试上限<input id="pa-retry-limit" type="number" min="0" value="3"></label><label class="pa-field">单资产预算（元）<input id="pa-budget" type="number" min="0.01" step="0.01" value="100"></label><label class="pa-field">单地区文化合规熔断资产上限<input id="pa-region-halt-limit" type="number" min="1" step="1" value="3"></label></div>`,outputs:decision('按控制判定',branch('retry','重试','单资产次数与费用均未达上限，且地区未熔断','审核问题报告')+branch('halt','触发断路器','单资产次数、费用或单地区熔断资产数达到上限','保存审核问题报告记录，交异常人工复核'))},

 human:{x:6648,y:790,type:'human',title:'设计师',inputs:inp('package','已审核并整理的完整成品包'),body:fields(['任务','验收成品、预览和审核记录。'])},
 exception:{x:6648,y:2340,type:'human',title:'异常人工复核',inputs:inp('halt','审核问题报告记录、历史产物与费用'),body:fields(['任务','设计师与本地化负责人接管处理，自动化在此停止。'])},
 delivery:{x:6012,y:640,type:'control',title:'打包整理',inputs:inp('pass','审核通过的成品与记录'),body:fields(['任务','汇总成品、源文件、预览与清单，检查文件是否完整。']),outputs:out('package','完整成品包与清单')}
};
const edges=[];const edge=(id,from,to,label='',alert=false,route=null)=>edges.push({id,from,to,label,alert,route});
edge('input-demand',['input','right','batch'],['demand','left','batch']);
edge('demand-culture',['demand','right','briefs'],['culture','left','briefs']);
edge('culture-plan',['culture','right','packet'],['plan','left','task']);
edge('plan-queue',['plan','right','plan'],['queue','left','plan']);
edge('queue-mesh',['queue','right','dispatch'],['mesh','left','plan'],'',false,'3d');
edge('mesh-texture',['mesh','right','mesh'],['texture','left','mesh'],'',false,'3d');
edge('texture-motion',['texture','right','material'],['motion','left','material'],'',false,'3d');
edge('3d-review',['motion','right','candidate'],['review','left','3d'],'候选成品',false,'3d');
edge('queue-image',['queue','right','dispatch'],['image','left','plan'],'',false,'video');
edge('image-frames',['image','right','image'],['frames','left','image'],'',false,'video');
edge('frames-video',['frames','right','frames'],['video','left','frames'],'',false,'video');
edge('video-review',['video','right','candidate'],['review','left','video'],'候选成品',false,'video');
edge('review-error',['review','right','fail'],['runtime','left','report'],'不通过',true);
edge('retry',['runtime','right','retry'],['plan','left','repair'],'',true);
edge('halt',['runtime','right','halt'],['exception','left','halt'],'触发断路器',true);
edge('review-package',['review','right','pass'],['delivery','left','pass']);
edge('package-human',['delivery','right','package'],['human','left','package']);
const normals={right:[1,0],left:[-1,0],top:[0,-1],bottom:[0,1]};
function socketAnchor(row,side){const caption=row.querySelector('.pa-socket-caption');return {y:caption.offsetTop+caption.offsetHeight/2};}
function rowTitleY(row,node){let y=socketAnchor(row,row.dataset.side).y,el=row;while(el&&el!==node){y+=el.offsetTop||0;el=el.offsetParent;if(el)y+=el.clientTop||0;}return y;}
function point(spec){const[id,side,key]=spec,n=nodes[id],row=n.el.querySelector(`[data-pa-socket="${key}"]`);if(!row)throw Error(`Missing socket ${id}/${key}`);return [n.x+(side==='right'?NW:0),n.y+rowTitleY(row,n.el)];}

function segments(e){const a=point(e.from),b=point(e.to),u=normals[e.from[1]],v=normals[e.to[1]],d=Math.hypot(b[0]-a[0],b[1]-a[1])*.25;return [[a,[a[0]+u[0]*d,a[1]+u[1]*d],[b[0]+v[0]*d,b[1]+v[1]*d],b]];}
function curve(e){return segments(e).map(s=>`M${s[0].join(' ')} C${s.slice(1).flat().join(' ')}`).join('');}
function make(tag,attrs={}){const el=document.createElementNS(ns,tag);for(const[k,v]of Object.entries(attrs))el.setAttribute(k,String(v));return el;}
let state={scale:1,x:0,y:0},fitMode=true,drag=null,visible=false;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
world.style.setProperty('--pa-node-width',NW+'px');world.style.width=W+'px';world.style.height=H+'px';svg.setAttribute('width',W);svg.setAttribute('height',H);
const groupEl=document.createElement('section');groupEl.className='pa-tool-group';groupEl.dataset.flowGroup='tools';groupEl.style.cssText=`left:${group.x}px;top:${group.y}px;width:${group.w}px;height:${group.h}px`;groupEl.innerHTML=`<header><span>模型工具层</span></header><div class="pa-lane-label threeD" data-lane-label="3d">3D 路线 <b>已启用</b></div><div class="pa-lane-label video" data-lane-label="video">视频路线 <b>未启用</b></div>`;world.insertBefore(groupEl,svg);
const flowColors={normal:'#63e295',retry:'#e8ef3d',exception:'#fa5b5f'};
const nodeAccents=Object.fromEntries(Object.keys(nodes).map(id=>[id,['runtime','exception'].includes(id)?flowColors.exception:flowColors.normal]));
for(const[id,n]of Object.entries(nodes)){
 const el=document.createElement('article');el.className='pa-flow-node '+n.type;el.dataset.flowNode=id;if(n.route)el.dataset.route=n.route;el.style.cssText=`left:${n.x}px;top:${n.y}px;--node-accent:${nodeAccents[id]||'#bfc4ca'}`;
 el.innerHTML=`${n.type==='agent'?'<div class="pa-node-halo" aria-hidden="true"></div>':''}<header class="pa-card-head">${roleIcon(n.type)}<h4>${n.title}${n.type==='agent'?' Agent':n.type==='control'?'程序':''}</h4></header><div class="pa-card-body">${n.inputs?`<div class="pa-inputs">${n.inputs}</div>`:''}<div class="pa-node-content">${n.body}</div>${n.outputs?`<div class="pa-outputs">${n.outputs}</div>`:''}</div>`;
 for(const field of el.querySelectorAll('.pa-field')){const label=document.createElement('span');label.className='pa-field-label';for(const child of [...field.childNodes])if(child.nodeType===3){label.append(child);}field.prepend(label);if(field.querySelector('textarea'))field.classList.add('pa-field-long');}
 $('#pa-nodes').append(el);n.el=el;n.h=el.offsetHeight;
}
const roleGradients={control:[['#E84A0C',0],['#E84A0C',100]],tool:[['#2B2E34',0],['#2B2E34',100]],human:[['#0A8A55',0],['#0A8A55',100]],agent:[['#1F45E6',0],['#1F45E6',100]]};
function updateFrameFill(n){
 const target=n.headerOnly?n.el.querySelector('.pa-card-head'):n.el,stops=roleGradients[n.type],width=target.offsetWidth||NW,height=n.headerOnly?target.offsetHeight:n.h,key=width+'x'+height;if(!stops||n.fillKey===key)return;n.fillKey=key;const endY=n.type==='agent'?height:height*.5;
 const markup=`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><defs><linearGradient id="fill" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${width}" y2="${endY}">${stops.map(([color,offset])=>`<stop offset="${offset}%" stop-color="${color}"/>`).join('')}</linearGradient></defs><rect width="${width}" height="${height}" fill="url(#fill)"/></svg>`;
 target.style.backgroundImage=`url("data:image/svg+xml,${encodeURIComponent(markup)}")`;
}
const detailSurfaces=[];
for(const el of document.querySelectorAll('.pa-agent-grid>article,.pa-safety-node')){
 const type=el.dataset.safetyType||'agent';
 let head=el.querySelector('header');
 if(head){head.className='pa-card-head';head.querySelector('span')?.remove();}
 else{head=document.createElement('header');head.className='pa-card-head';head.append(el.querySelector('h4'));el.prepend(head);}
 head.insertAdjacentHTML('afterbegin',roleIcon(type));
 for(const label of el.querySelectorAll('.pa-safety-role,.pa-safety-state'))label.remove();
 const body=document.createElement('div');body.className='pa-card-body';for(const child of [...el.children])if(child!==head)body.append(child);el.append(body);
 el.classList.add('pa-detail-surface',type);if(type==='agent')head.insertAdjacentHTML('afterbegin','<div class="pa-node-halo" aria-hidden="true"></div>');
 const n={el,type,h:0,headerOnly:true};detailSurfaces.push(n);new ResizeObserver(()=>{n.h=el.offsetHeight;updateFrameFill(n);}).observe(el);
}
function measureDetails(){for(const n of detailSurfaces){n.h=n.el.offsetHeight;updateFrameFill(n);}}
document.fonts.ready.then(measureDetails);measureDetails();
const defaultPositions=Object.fromEntries(Object.entries(nodes).map(([id,n])=>[id,{x:n.x,y:n.y}]));const defaultGroup={...group};
const defs=svg.querySelector('defs');
function wireColor(e){return e.id==='retry'?flowColors.retry:e.alert?flowColors.exception:flowColors.normal;}
function lighten(hex){const v=hex.slice(1).match(/../g).map(x=>Math.round(parseInt(x,16)*.6+255*.4));return '#'+v.map(x=>x.toString(16).padStart(2,'0')).join('');}
const ports=new Set();for(const e of edges){
 e.color=wireColor(e);const d=curve(e),g=make('g'),path=make('path',{id:'pa-path-'+e.id,d,class:'pa-wire'+(e.alert?' alert':'')}),casing=make('path',{d,class:'pa-wire-casing'});g.append(casing,path);$('#pa-edge-paths').append(g);e.group=g;e.paths=[casing,path];
 for(const spec of[e.from,e.to]){const key=spec.join('/');if(ports.has(key))continue;ports.add(key);createPort(nodes[spec[0]],spec[2],spec[1],e.color);}
 const gradient=make('linearGradient',{id:'pa-pulse-'+e.id,gradientUnits:'userSpaceOnUse'});for(const[offset,opacity]of[[0,0],[.15,.12],[.32,.55],[.5,1],[.68,.55],[.85,.12],[1,0]])gradient.append(make('stop',{offset:offset*100+'%','stop-color':offset===.5?lighten(e.color):e.color,'stop-opacity':opacity}));defs.append(gradient);e.gradient=gradient;e.span=130;
 for(const[width,opacity]of[[8,.18],[3.4,1]]){const pulse=make('path',{d,class:'pa-cable-pulse',fill:'none',stroke:`url(#pa-pulse-${e.id})`,'stroke-width':width,'stroke-opacity':opacity,'stroke-dasharray':`${e.span} 15000`,'stroke-linecap':'round'});g.append(pulse);e.paths.push(pulse);}
 e.length=path.getTotalLength();paintPulse(e,-e.span);if(e.label){const label=make('text',{class:'pa-flow-label'+(e.alert?' alert':'')});label.textContent=e.label;$('#pa-edge-labels').append(label);e.labelEl=label;updateLabel(e);}
}
// Dots stay inside the content row; cable anchors remain on the outer frame.
function createPort(node,key,side,color){const row=node.el.querySelector(`[data-pa-socket="${key}"]`),port=document.createElement('i');port.className='pa-port';port.dataset.socketFor=key;port.dataset.socketSide=side;port.style.setProperty('--socket-color',color);port.setAttribute('aria-hidden','true');row.style.setProperty('--socket-color',color);port.style.left=side==='right'?'calc(100% - 14px)':'14px';port.style.top=socketAnchor(row,side).y+'px';row.append(port);return port;}
for(const[id,n]of Object.entries(nodes))for(const row of n.el.querySelectorAll('[data-pa-socket]'))if(!n.el.querySelector(`.pa-port[data-socket-for="${row.dataset.paSocket}"]`))createPort(n,row.dataset.paSocket,row.dataset.side,nodeAccents[id]);
function paintPulse(e,pos){
 const length=e.length,from=Math.max(0,Math.min(length,pos)),to=Math.max(0,Math.min(length,pos+e.span)),a=e.paths[1].getPointAtLength(from),b=e.paths[1].getPointAtLength(to);let dx=b.x-a.x,dy=b.y-a.y;
 if(Math.hypot(dx,dy)<.1){for(const p of e.paths.slice(2))p.style.strokeOpacity='0';return;}
 for(const p of e.paths.slice(2))p.style.strokeOpacity='';const fraction=(to-from)/e.span,ux=dx/fraction,uy=dy/fraction,startFraction=(from-pos)/e.span;
 e.gradient.setAttribute('x1',a.x-ux*startFraction);e.gradient.setAttribute('y1',a.y-uy*startFraction);e.gradient.setAttribute('x2',a.x+ux*(1-startFraction));e.gradient.setAttribute('y2',a.y+uy*(1-startFraction));for(const p of e.paths.slice(2))p.style.strokeDashoffset=String(-pos);
}
function updateLabel(e){if(!e.labelEl)return;const q=e.paths[1].getPointAtLength(e.length*.5);e.labelEl.setAttribute('x',q.x);e.labelEl.setAttribute('y',q.y-20);}
function updateCables(id){for(const e of edges){if(id&&e.from[0]!==id&&e.to[0]!==id)continue;const d=curve(e);for(const p of e.paths)p.setAttribute('d',d);e.length=e.paths[1].getTotalLength();updateLabel(e);}}
function measure(){for(const n of Object.values(nodes)){n.h=n.el.offsetHeight;updateFrameFill(n);for(const port of n.el.querySelectorAll('.pa-port')){const row=port.parentElement;port.style.top=socketAnchor(row,port.dataset.socketSide).y+'px';}}updateCables();}

function roleIcon(type){const shapes=type==='agent'?'<rect x="11" y="1" width="2" height="5" rx="1"/><circle cx="12" cy="2" r="2"/><path fill-rule="evenodd" d="M7 5h10a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a4 4 0 0 1 4-4zm1 5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm8 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM8 16v2h8v-2z"/><rect x="0" y="10" width="2" height="6" rx="1"/><rect x="22" y="10" width="2" height="6" rx="1"/>':(type==='human'||type==='input')?'<circle cx="12" cy="7" r="4.5"/><path d="M3 21v-2.5C3 14.9 7 13 12 13s9 1.9 9 5.5V21z"/>':type==='control'?'<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2" opacity=".6"/><rect x="3" y="14" width="7" height="7" rx="2" opacity=".6"/><rect x="14" y="14" width="7" height="7" rx="2"/>':'<path d="m12 2 9 5v10l-9 5-9-5V7zm0 2.5L5.6 8 12 11.5 18.4 8z" fill-rule="evenodd"/>';return `<svg class="pa-role-icon" viewBox="0 0 24 24" aria-hidden="true">${shapes}</svg>`;}
let lastPaint=0;function animateCables(time){requestAnimationFrame(animateCables);if(time-lastPaint<32||!visible||document.hidden||reduced.matches||drag||zoomBusy)return;lastPaint=time;for(const[i,e]of edges.entries()){if(e.route&&e.route!==$('#pa-route').value)continue;paintPulse(e,((time*.34+i*173)%(e.length+e.span*2))-e.span);}}requestAnimationFrame(animateCables);
function setText(selector,value){for(const el of document.querySelectorAll(selector))el.textContent=value;}
function routeStyles(){const route=$('#pa-route').value;for(const n of Object.values(nodes))if(n.route)n.el.classList.toggle('pa-inactive',n.route!==route);for(const e of edges){const inactive=e.route&&e.route!==route;e.group.classList.toggle('pa-inactive',!!inactive);e.labelEl?.classList.toggle('pa-inactive',!!inactive);}for(const key of ['3d','video']){nodes.review.el.querySelector(`[data-pa-socket="${key}"]`).classList.toggle('pa-inactive',key!==route);}for(const el of document.querySelectorAll('[data-lane-label]')){const active=el.dataset.laneLabel===route;el.classList.toggle('is-active',active);el.querySelector('b').textContent=active?'已启用':'未启用';}}
const limitPairs=[['pa-retry-limit','pa-safety-retry-limit'],['pa-budget','pa-safety-budget'],['pa-region-halt-limit','pa-safety-region-halt-limit']];
function syncConfig(event){
 const source=event?.target,pair=source&&limitPairs.find(ids=>ids.includes(source.id));
 if(pair&&source.validity.valid){for(const id of pair){const input=document.getElementById(id);if(input!==source)input.value=source.value;}}
 else if(!source){for(const[main,detail]of limitPairs)document.getElementById(detail).value=document.getElementById(main).value;}
 const regionLimit=document.getElementById('pa-region-halt-limit');if(regionLimit.validity.valid&&regionLimit.value!=='')setText('[data-pa-region-halt-limit]',regionLimit.value);
 const selected=countries.filter(r=>$(`input[name="pa-country"][value="${r.id}"]`).checked).length;
 setText('[data-pa-region-count]',selected);
 routeStyles();measure();
}
let openSelect=null;
function createSelect(select){
 const originalField=select.closest('.pa-field'),label=document.createElement('div');label.className=originalField.className;while(originalField.firstChild)label.append(originalField.firstChild);originalField.replaceWith(label);const name=label.querySelector('.pa-field-label').textContent.trim(),wrap=document.createElement('div'),trigger=document.createElement('button'),menu=document.createElement('div');wrap.className='pa-select';trigger.type='button';trigger.className='pa-select-trigger';trigger.setAttribute('role','combobox');trigger.setAttribute('aria-label',name);trigger.setAttribute('aria-haspopup','listbox');trigger.setAttribute('aria-expanded','false');trigger.setAttribute('aria-controls',select.id+'-options');menu.id=select.id+'-options';menu.className='pa-select-menu';menu.setAttribute('role','listbox');menu.setAttribute('aria-label',name);menu.hidden=true;
 const entries=[...select.options].map(option=>{const item=document.createElement('button');item.type='button';item.setAttribute('role','option');item.setAttribute('aria-selected',String(option.value===select.value));item.dataset.value=option.value;item.textContent=option.textContent;item.tabIndex=-1;menu.append(item);return item;});
 function sync(){trigger.textContent=select.options[select.selectedIndex]?.textContent||select.querySelector(`option[value="${select.value}"]`)?.textContent||'';for(const item of entries)item.setAttribute('aria-selected',String(item.dataset.value===select.value));}
 function close(focus=false){menu.hidden=true;trigger.setAttribute('aria-expanded','false');label.closest('[data-flow-node]').classList.remove('pa-select-open');if(openSelect?.menu===menu)openSelect=null;if(focus)trigger.focus();}
 function open(){openSelect?.close();menu.hidden=false;trigger.setAttribute('aria-expanded','true');label.closest('[data-flow-node]').classList.add('pa-select-open');openSelect={menu,close};(entries.find(item=>item.dataset.value===select.value)||entries[0]).focus();}
 trigger.onclick=()=>menu.hidden?open():close();trigger.onkeydown=e=>{if(['ArrowDown','ArrowUp'].includes(e.key)){e.preventDefault();open();}};
 menu.onkeydown=e=>{const index=entries.indexOf(document.activeElement);if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close(true);}else if(['ArrowDown','ArrowUp','Home','End'].includes(e.key)){e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?entries.length-1:(index+(e.key==='ArrowDown'?1:-1)+entries.length)%entries.length;entries[next].focus();}else if(e.key==='Tab')close();};
 for(const item of entries)item.onclick=()=>{select.value=item.dataset.value;sync();close(true);select.dispatchEvent(new Event('change',{bubbles:true}));};
 select.hidden=true;select.tabIndex=-1;select.setAttribute('aria-hidden','true');select.after(wrap);wrap.append(trigger,menu);select.addEventListener('change',sync);sync();
}
createSelect($('#pa-route'));document.addEventListener('pointerdown',e=>{if(openSelect&&!e.target.closest('.pa-select'))openSelect.close();});
for(const el of board.querySelectorAll('input,select'))el.addEventListener('change',syncConfig);
for(const pair of limitPairs)for(const id of pair)document.getElementById(id).addEventListener('input',syncConfig);
$('#pa-select-all').onclick=()=>{for(const el of board.querySelectorAll('[name="pa-country"]'))el.checked=true;syncConfig();};$('#pa-select-none').onclick=()=>{for(const el of board.querySelectorAll('[name="pa-country"]'))el.checked=false;syncConfig();};
let paintFrame=0,zoomBusy=false,zoomTimer;
function applyTransform(){world.style.transform=`translate(${state.x}px,${state.y}px) scale(${state.scale})`;$('#pa-zoom-level').textContent=Math.round(state.scale*100)+'%';}
function transform(){if(paintFrame)return;paintFrame=requestAnimationFrame(()=>{paintFrame=0;applyTransform();});}
function contentBounds(){
 const xs=[group.x,group.x+group.w],ys=[group.y,group.y+group.h];
 for(const n of Object.values(nodes)){xs.push(n.x,n.x+NW);ys.push(n.y,n.y+n.h);}
 const value=(p,t)=>{const u=1-t;return u*u*u*p[0]+3*u*u*t*p[1]+3*u*t*t*p[2]+t*t*t*p[3];};
 for(const e of edges)for(const points of segments(e))for(const axis of [0,1]){const p=points.map(v=>v[axis]),a=-p[0]+3*p[1]-3*p[2]+p[3],b=2*(p[0]-2*p[1]+p[2]),c=p[1]-p[0],roots=[];if(Math.abs(a)<1e-8){if(Math.abs(b)>1e-8)roots.push(-c/b);}else{const disc=b*b-4*a*c;if(disc>=0)roots.push((-b+Math.sqrt(disc))/(2*a),(-b-Math.sqrt(disc))/(2*a));}const values=[p[0],p[3],...roots.filter(t=>t>0&&t<1).map(t=>value(p,t))];(axis?ys:xs).push(...values);}
 return {left:Math.min(...xs)-40,right:Math.max(...xs)+40,top:Math.min(...ys)-40,bottom:Math.max(...ys)+40};
}
function fit(){const w=viewport.clientWidth,h=viewport.clientHeight,b=contentBounds(),bw=b.right-b.left,bh=b.bottom-b.top;state.scale=Math.max(.02,Math.min(1.15,(w-48)/bw,(h-48)/bh));state.x=(w-bw*state.scale)/2-b.left*state.scale;state.y=(h-bh*state.scale)/2-b.top*state.scale;transform();}
function view(){board.classList.contains("is-expanded")?fit():focusStart();}
// Inline view opens on the readable main chain (input → plan); the full graph stays one click away.
function focusStart(){const w=viewport.clientWidth,h=viewport.clientHeight,ids=['input','demand','culture','plan'],left=nodes.input.x-60,right=nodes.plan.x+NW+60,top=Math.min(...ids.map(id=>nodes[id].y))-60,bottom=Math.max(...ids.map(id=>nodes[id].y+nodes[id].h))+60;state.scale=Math.max(.06,Math.min(.6,w/(right-left),h/(bottom-top)));state.x=(w-(right-left)*state.scale)/2-left*state.scale;state.y=Math.max(12,(h-(bottom-top)*state.scale)/2)-top*state.scale;transform();}

function zoom(factor,px,py){zoomBusy=true;clearTimeout(zoomTimer);zoomTimer=setTimeout(()=>zoomBusy=false,160);fitMode=false;const cx=px??viewport.clientWidth/2,cy=py??viewport.clientHeight/2,wx=(cx-state.x)/state.scale,wy=(cy-state.y)/state.scale;state.scale=Math.max(.04,Math.min(1.8,state.scale*factor));state.x=cx-wx*state.scale;state.y=cy-wy*state.scale;transform();}
function syncMotion(){world.classList.toggle('pa-static',!visible||document.hidden||reduced.matches);}
$('#pa-reset').onclick=()=>{Object.assign(group,defaultGroup);groupEl.style.left=group.x+'px';groupEl.style.top=group.y+'px';for(const[id,n]of Object.entries(nodes)){Object.assign(n,defaultPositions[id]);n.el.style.left=n.x+'px';n.el.style.top=n.y+'px';updateCables(id);}fitMode=true;view();};
$('#pa-zoom-in').onclick=()=>zoom(1.25);$('#pa-zoom-out').onclick=()=>zoom(.8);;
viewport.addEventListener('pointerdown',e=>{
 if(e.target.closest('input,select,textarea,button,label,.pa-select')||e.button!==0)return;e.preventDefault();const card=e.target.closest('[data-flow-node]'),id=card?.dataset.flowNode,isGroup=!card&&e.target.closest('[data-flow-group]');
 drag={id,group:!!isGroup,x:e.clientX,y:e.clientY,sx:id?nodes[id].x:isGroup?group.x:state.x,sy:id?nodes[id].y:isGroup?group.y:state.y,children:isGroup?Object.fromEntries(Object.entries(nodes).filter(([,n])=>n.route).map(([k,n])=>[k,{x:n.x,y:n.y}])):null};viewport.setPointerCapture(e.pointerId);viewport.classList.add('pa-panning');if(card)card.classList.add('pa-dragging');
});
viewport.addEventListener('pointermove',e=>{
 if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
 if(drag.id){const n=nodes[drag.id];n.x=Math.max(10,Math.min(W-NW-10,drag.sx+dx/state.scale));n.y=Math.max(10,Math.min(H-n.h-10,drag.sy+dy/state.scale));n.el.style.left=n.x+'px';n.el.style.top=n.y+'px';updateCables(drag.id);}
 else if(drag.group){const gx=Math.max(10,Math.min(W-group.w-10,drag.sx+dx/state.scale)),gy=Math.max(10,Math.min(H-group.h-10,drag.sy+dy/state.scale));group.x=gx;group.y=gy;groupEl.style.left=gx+'px';groupEl.style.top=gy+'px';for(const[id,pos]of Object.entries(drag.children)){const n=nodes[id];n.x=pos.x+gx-drag.sx;n.y=pos.y+gy-drag.sy;n.el.style.left=n.x+'px';n.el.style.top=n.y+'px';}updateCables();}
 else{fitMode=false;state.x=drag.sx+dx;state.y=drag.sy+dy;transform();}
});
for(const event of ['pointerup','pointercancel','lostpointercapture'])viewport.addEventListener(event,()=>{if(drag?.id)nodes[drag.id].el.classList.remove('pa-dragging');drag=null;viewport.classList.remove('pa-panning');});
viewport.addEventListener('wheel',e=>{if(board.classList.contains('is-expanded'))e.stopPropagation();if(drag)return;if(e.target.closest('input,select,textarea,.pa-select'))return;if(!board.classList.contains('is-expanded')&&!e.ctrlKey&&!e.metaKey)return;e.preventDefault();const r=viewport.getBoundingClientRect();zoom(Math.exp(-Math.max(-120,Math.min(120,e.deltaY))*.003),e.clientX-r.left,e.clientY-r.top);},{passive:false});
viewport.addEventListener('keydown',e=>{if(e.target!==viewport)return;if(e.key==='+'||e.key==='='){e.preventDefault();zoom(1.25);}else if(e.key==='-'){e.preventDefault();zoom(.8);}else if(e.key==='0'){e.preventDefault();fitMode=true;view();}});
let returnFocus=null,previousOverflow='',savedView=null,placeholder=null;let modalSwitch=false;
const backdrop=document.createElement('button');backdrop.className='pa-modal-backdrop';backdrop.type='button';backdrop.setAttribute('aria-label','关闭工作流大图');backdrop.tabIndex=-1;backdrop.hidden=true;document.body.append(backdrop);
function setExpanded(open){
 if(open===board.classList.contains('is-expanded'))return;
 openSelect?.close();modalSwitch=true;
 const expand=$('#pa-expand');
 if(open){
  savedView={...state,fitMode};returnFocus=document.activeElement;previousOverflow=document.body.style.overflow;
  placeholder=document.createElement('div');placeholder.className='pa-board-placeholder';placeholder.style.height=board.offsetHeight+'px';board.before(placeholder);
  document.body.append(board);board.classList.add('is-expanded');document.body.style.overflow='hidden';document.documentElement.classList.add('pa-modal-open');
  board.setAttribute('role','dialog');board.setAttribute('aria-modal','true');board.setAttribute('aria-label','完整工作流');fitMode=true;measure();fit();applyTransform();
 }else{
  board.classList.remove('is-expanded');placeholder.replaceWith(board);placeholder=null;document.body.style.overflow=previousOverflow;document.documentElement.classList.remove('pa-modal-open');
  board.removeAttribute('role');board.removeAttribute('aria-modal');board.removeAttribute('aria-label');
  if(savedView){fitMode=savedView.fitMode;state={scale:savedView.scale,x:savedView.x,y:savedView.y};}measure();if(fitMode)view();applyTransform();
 }
 backdrop.hidden=!open;expand.setAttribute('aria-label',open?'收起工作流画布':'放大工作流画布');expand.setAttribute('aria-expanded',String(open));expand.querySelector('path').setAttribute('d',open?'M3 8h5V3M21 8h-5V3M3 16h5v5M21 16h-5v5':'M8 3H3v5M16 3h5v5M3 16v5h5M21 16v5h-5');
 if(open)expand.focus({preventScroll:true});else returnFocus?.focus({preventScroll:true});
 visible=open||visible;syncMotion();modalSwitch=false;
}
$('#pa-expand').onclick=()=>setExpanded(!board.classList.contains('is-expanded'));$('#pa-board-hint').onclick=()=>setExpanded(true);backdrop.onclick=()=>setExpanded(false);backdrop.addEventListener('wheel',e=>{e.preventDefault();e.stopPropagation();},{passive:false});
document.addEventListener('keydown',e=>{if(!board.classList.contains('is-expanded'))return;if(e.key==='Escape'){e.preventDefault();setExpanded(false);}else if(e.key==='Tab'){const list=[...board.querySelectorAll('button,input,select,textarea,[tabindex="0"]')].filter(el=>!el.disabled&&!el.closest('[hidden]')&&el.tabIndex!==-1),first=list[0],last=list.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});
let lastViewportWidth=-1,lastViewportHeight=-1;new ResizeObserver(()=>{if(modalSwitch)return;const w=viewport.clientWidth,h=viewport.clientHeight;if(w===lastViewportWidth&&h===lastViewportHeight)return;lastViewportWidth=w;lastViewportHeight=h;measure();if(fitMode)view();}).observe(viewport);new IntersectionObserver(([entry])=>{visible=board.classList.contains('is-expanded')||entry.isIntersecting;syncMotion();},{threshold:0}).observe(board);document.addEventListener('visibilitychange',syncMotion);reduced.addEventListener('change',syncMotion);view();syncMotion();
syncConfig();document.fonts.ready.then(()=>{measure();if(fitMode)view();});
// The insurance answer is a separate reading diagram; main-workbench geometry stays unchanged.
const safetyCanvas=$('.pa-safety-canvas');
if(safetyCanvas){
 const safetySvg=safetyCanvas.querySelector('svg'),safetyPorts=make('svg',{class:'pa-safety-ports','aria-hidden':'true'}),safetyNodes=Object.fromEntries([...safetyCanvas.querySelectorAll('[data-safety-node]')].map(n=>[n.dataset.safetyNode,n]));
 safetyCanvas.append(safetyPorts);
 const safetyLinks=[
  ['plan','bottom',.5,'tools','top',.5,'normal'],
  ['tools','bottom',.5,'review','top',.5,'normal'],
  ['review','left',.5,'control','right',.5,'exception',{main:'不通过',kind:'alert',doc:['输出',''],at:'h'}],
  ['review','bottom',.5,'package','top',.5,'normal',{main:'通过',kind:'pass',at:'right'}],
  ['control','top',.5,'plan','left',.5,'retry',{main:'重试',kind:'retry',doc:['','交回修正'],at:'left'}],
  ['control','bottom',.5,'human','top',.5,'exception',{main:'触发断路器',kind:'breaker',doc:['','交人工复核'],at:'left'}],
  ['package','bottom',.5,'designer','top',.5,'normal']
 ];
 function drawSafety(){
  const rect=safetyCanvas.getBoundingClientRect(),pos=(id,side,t)=>{const r=safetyNodes[id].getBoundingClientRect();return side==='left'||side==='right'?[r[side]-rect.left,r.top-rect.top+r.height*t]:[r.left-rect.left+r.width*t,r[side]-rect.top];},pieces=[],ports=[];
  for(const svg of[safetySvg,safetyPorts])svg.setAttribute('viewBox',`0 0 ${rect.width} ${rect.height}`);
  const definitions=make('defs'),arrow=make('marker',{id:'pa-safety-arrow',markerWidth:9,markerHeight:9,viewBox:'0 0 10 10',refX:9,refY:5,orient:'auto',markerUnits:'userSpaceOnUse'});
  arrow.append(make('path',{d:'M1 1 L9 5 L1 9 Z',fill:'#858585'}));definitions.append(arrow);pieces.push(definitions);
  const labels=[];
  for(const[a,side,t,b,end,u,signal,label]of safetyLinks){
   const start=pos(a,side,t),finish=pos(b,end,u),m=normals[end],returning=a==='control'&&b==='plan';
   // This reading diagram uses straight runs; the return has one rounded right angle.
   const pathData=returning?`M${start.join(' ')} V${finish[1]+14} Q${start[0]} ${finish[1]} ${start[0]+14} ${finish[1]} H${finish[0]}`:`M${start.join(' ')} L${finish.join(' ')}`;
   pieces.push(make('path',{'data-from':a,'data-to':b,class:'pa-safety-wire'+(returning?' is-return':''),d:pathData}));
   // Keep the arrow upstream of the input dot, so neither covers the other.
   pieces.push(make('path',{class:'pa-safety-arrow',d:`M${finish[0]+m[0]*28} ${finish[1]+m[1]*28} L${finish[0]+m[0]*14} ${finish[1]+m[1]*14}`,'marker-end':'url(#pa-safety-arrow)'}));
   for(const[p,id,portSide]of[[start,a,side],[finish,b,end]])ports.push(make('circle',{'data-node':id,'data-side':portSide,cx:p[0],cy:p[1],r:4,fill:flowColors[signal],stroke:'#fff','stroke-width':1.6}));
   if(label)labels.push({label,start,finish,returning});
  }
  safetySvg.replaceChildren(...pieces);safetyPorts.replaceChildren(...ports);
  const figure=safetyCanvas.closest('.pa-safety-flow');
  // A label line is a pill: text measured in place, then a rounded plate slid underneath.
  const pill=(x,y,anchor,str,cls,icon)=>{const g=make('g',{class:'pa-pill '+cls}),plate=make('rect',{rx:10}),txt=make('text',{x,y,'text-anchor':anchor,'dominant-baseline':'central'});txt.textContent=str;g.append(plate,txt);safetySvg.append(g);
   const iw=icon?15:0;if(icon&&anchor==='middle')txt.setAttribute('x',x+iw/2);if(icon&&anchor==='start')txt.setAttribute('x',x+iw);
   const b=txt.getBBox(),px=icon?8:9,left=b.x-iw-px,width=b.width+iw+px*2,height=b.height+7;plate.setAttribute('x',left);plate.setAttribute('y',y-height/2);plate.setAttribute('width',width);plate.setAttribute('height',height);plate.setAttribute('ry',height/2);
   if(icon){const d=make('g',{class:'pa-doc-glyph',transform:`translate(${b.x-iw} ${y-6})`});d.append(make('path',{d:'M0.5 0.5h6l3 3v8.5h-9z'}),make('path',{d:'M6.5 0.5v3h3M2.5 6h5M2.5 8.5h5'}));g.append(d);}
   return {x:left,y,w:width,h:height};};
  // Report chip is one component (icon + 审核问题报告); verbs around it stay plain text.
  const plainText=(g,x,str)=>{const t=make('text',{x,y:0,'dominant-baseline':'central',class:'pa-row-text'});t.textContent=str;g.append(t);return t.getBBox().width;};
  const reportChip=(g,x)=>{const c=make('g',{class:'pa-pill is-report'}),plate=make('rect'),t=make('text',{x:x+23,y:0,'dominant-baseline':'central'});t.textContent='审核问题报告';c.append(plate,t);g.append(c);const b=t.getBBox(),w=b.width+31,h=b.height+7;plate.setAttribute('x',x);plate.setAttribute('y',-h/2);plate.setAttribute('width',w);plate.setAttribute('height',h);plate.setAttribute('rx',h/2);const d=make('g',{class:'pa-doc-glyph',transform:`translate(${x+8} -6)`});d.append(make('path',{d:'M0.5 0.5h6l3 3v8.5h-9z'}),make('path',{d:'M6.5 0.5v3h3M2.5 6h5M2.5 8.5h5'}));c.append(d);return w;};
  const docRow=(x,y,anchor,pre,post)=>{const g=make('g',{class:'pa-doc-row'});safetySvg.append(g);let cx=0;if(pre)cx+=plainText(g,cx,pre)+5;cx+=reportChip(g,cx);if(post){cx+=5;cx+=plainText(g,cx,post);}const ox=anchor==='end'?x-cx:anchor==='middle'?x-cx/2:x;g.setAttribute('transform',`translate(${ox} ${y})`);};
  for(const{label:l,start,finish,returning}of labels){
   let x,y1,y2,anchor;
   if(l.at==='h'){x=(start[0]+finish[0])/2;anchor='middle';y1=start[1]-15;y2=start[1]+17;}
   else{const top=Math.min(start[1],finish[1]),bot=Math.max(start[1],finish[1]),mid=returning?(start[1]+finish[1])/2:(top+bot)/2;x=l.at==='left'?start[0]-14:start[0]+14;anchor=l.at==='left'?'end':'start';y1=mid;y2=mid;}
   const main=pill(x,y1,anchor,l.main,'is-'+(l.kind||'plain'),false);
   if(l.doc){if(l.at==='h')docRow(x,y2,anchor,l.doc[0],l.doc[1]);else docRow(start[0]+14,y2,'start',l.doc[0],l.doc[1]);}
   if(l.lead&&figure){
    // One continuous overlay path: left out of the breaker pill, down the outer gutter, then into the trigger panel.
    const fr=figure.getBoundingClientRect(),c=safetyNodes.control.getBoundingClientRect(),panel=document.getElementById('pa-triggers'),pb=panel?panel.getBoundingClientRect().top:rect.bottom+40,ox=rect.left-fr.left,oy=rect.top-fr.top,gx=Math.round(c.left-fr.left-22)+.5,yy=Math.round(oy+main.y)+.5,x0=ox+main.x,yEnd=pb-fr.top,yBend=Math.round(rect.bottom-fr.top+(pb-rect.bottom)/2)+.5,xEnd=30.5;
    let ov=figure.querySelector(':scope>.pa-lead-overlay');if(!ov){ov=make('svg',{class:'pa-lead-overlay','aria-hidden':'true'});figure.append(ov);}
    ov.setAttribute('width',fr.width);ov.setAttribute('height',yEnd+6);ov.setAttribute('viewBox',`0 0 ${fr.width} ${yEnd+6}`);
    ov.replaceChildren(make('path',{class:'pa-safety-lead',d:`M${x0} ${yy} H${gx} V${yBend} H${xEnd} V${yEnd}`}),make('circle',{cx:xEnd,cy:yEnd,r:4,fill:'#e5262b'}));figure.classList.add('has-lead');}
  }
 }
 let safetyFrame=0;const scheduleSafety=()=>{if(!safetyFrame)safetyFrame=requestAnimationFrame(()=>{safetyFrame=0;drawSafety();});};const safetyObserver=new ResizeObserver(scheduleSafety);safetyObserver.observe(safetyCanvas,{box:'border-box'});for(const node of Object.values(safetyNodes))safetyObserver.observe(node,{box:'border-box'});document.fonts.ready.then(scheduleSafety);drawSafety();
}
$('#pa-prompt-display').textContent=window.ANSWER.prompt;
function jsonMarkup(value){
 // Show each tool call on separate lines so the target model and its parameters are readable.
 const first=['task_id','asset_version','policy_version','route','status','reason','steps'],keys=[...first,...Object.keys(value).filter(key=>!first.includes(key))];
 const stepMarkup=step=>{
  const rows=[`"id": ${JSON.stringify(step.id)}, "tool": ${JSON.stringify(step.tool)}`,`"model_ref": ${JSON.stringify(step.model_ref)}`,`"depends_on": ${JSON.stringify(step.depends_on)}, "inputs": ${JSON.stringify(step.inputs)}`,`"prompt": ${JSON.stringify(step.prompt)}`,`"negative_terms": ${JSON.stringify(step.negative_terms)}`,`"settings": ${JSON.stringify(step.settings)}`];
  return '    {\n'+rows.map(row=>'      '+row).join(',\n')+'\n    }';
 };
 const lines=keys.map(key=>key==='steps'?`  "steps": [\n${value.steps.map(stepMarkup).join(',\n')}\n  ]`:`  "${key}": ${JSON.stringify(value[key])}`),raw='{\n'+lines.join(',\n')+'\n}';
 return esc(raw).replace(/(&quot;(?:[^&]|&(?!quot;))*?&quot;)(\s*:)?|\bnull\b/g,(m,string,key)=>string?`<span class="${key?'pa-json-key':'pa-json-string'}">${string}</span>${key||''}`:'<span class="pa-json-null">null</span>');
}
const exampleTabs=[
 ['threeD','正常 · 3D','规则已确认，按 3D 路线编排三步调用：Tripo 建模与材质，已注册的 Blender 脚本完成动作和渲染。'],
 ['normal','正常 · 视频','同一资产走视频路线：主体参考图 → 首尾关键帧 → 视频生成与合成。路线由需求说明决定，Agent 只在固定步骤里填参数。'],
 ['religious','违规 · 替代','审核发现材质中出现禁用宗教标记：用文化约束中已批准的替代元素重做材质，复用已通过的几何模型，status 为 substituted。'],
 ['review','违规 · 转人工','禁用元素是礼物的核心、没有已批准的替代：不编排任何步骤，steps 为空，交人工确认。'],
 ['stop','熔断 · 停止','程序触发断路器后不再交回报告重试：Agent 返回 stop，不得自行换编号或清零版本。']
];
const tabsEl=$('#pa-example-tabs');
function showExample(key){const tab=exampleTabs.find(t=>t[0]===key);$('#pa-example-display').innerHTML=jsonMarkup(window.ANSWER.examples[key]);$('#pa-example-caption').textContent=tab[2];for(const b of tabsEl.children){const on=b.dataset.key===key;b.setAttribute('aria-selected',String(on));b.tabIndex=on?0:-1;}}
for(const[key,label]of exampleTabs){const b=document.createElement('button');b.type='button';b.role='tab';b.dataset.key=key;b.textContent=label;b.className=key==='threeD'||key==='normal'?'is-ok':key==='stop'?'is-stop':'is-warn';b.onclick=()=>showExample(key);tabsEl.append(b);}
tabsEl.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();const list=[...tabsEl.children],i=list.indexOf(document.activeElement),next=list[(i+(e.key==='ArrowRight'?1:-1)+list.length)%list.length];next.focus();next.click();});
showExample('threeD');
const reportEl=$('#pa-report-display');
if(reportEl){const raw=JSON.stringify(window.ANSWER.review,null,2);reportEl.innerHTML=esc(raw).replace(/(&quot;(?:[^&]|&(?!quot;))*?&quot;)(\s*:)?/g,(m,s,k)=>`<span class="${k?'pa-json-key':'pa-json-string'}">${s}</span>${k||''}`).replace(/(<span class="pa-json-string">&quot;)(GEO_SELF_INTERSECT|fail)(&quot;<\/span>)/g,'<span class="pa-json-flag">$1$2$3</span>');}
})();

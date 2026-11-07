export function moveItem(items,from,to){
 if(!Number.isInteger(from)||!Number.isInteger(to)||from<0||to<0||from>=items.length||to>=items.length||from===to)return false;
 const [item]=items.splice(from,1);items.splice(to,0,item);return true;
}

export function gridTarget(rects,x,y){
 let closest=-1,best=Infinity,centerDistance=Infinity;
 rects.forEach((r,i)=>{
  const dx=Math.max(r.left-x,0,x-r.right),dy=Math.max(r.top-y,0,y-r.bottom),distance=dx*dx+dy*dy;
  const center=(x-(r.left+r.right)/2)**2+(y-(r.top+r.bottom)/2)**2;
  if(distance<best||(distance===best&&center<centerDistance)){closest=i;best=distance;centerDistance=center}
 });return closest;
}

// Pointer capture handles mouse, touch and pen without making editable fields draggable.
export function attachReorderHandle(handle,row,index,{list,canMove,onMove,label,onActivate}){
 let drag,lastTap,ignoreActivationUntil=0;
 const clearMarks=()=>list.querySelectorAll('.drop-before,.drop-after').forEach(el=>el.classList.remove('drop-before','drop-after'));
 function mark(){
  clearMarks();drag.target=null;
  const bounds=list.getBoundingClientRect(),{x,y}=drag;
  if(x<bounds.left||x>bounds.right||y<Math.max(0,bounds.top-12)||y>Math.min(innerHeight,bounds.bottom+12))return;
  const rows=[...list.querySelectorAll('.media-row')];
  if(list.classList.contains('is-gallery')){
   drag.target=gridTarget(rows.map(el=>el.getBoundingClientRect()),x,y);
   if(drag.target!==index&&drag.target>=0)rows[drag.target].classList.add(drag.target<index?'drop-before':'drop-after');
   return;
  }
  let insertion=rows.findIndex(el=>y<el.getBoundingClientRect().top+el.getBoundingClientRect().height/2);
  if(insertion<0)insertion=rows.length;
  const target=insertion>index?insertion-1:insertion;
  drag.target=target;
  if(target===index)return;
  if(insertion===rows.length)rows.at(-1)?.classList.add('drop-after');else rows[insertion]?.classList.add('drop-before');
 }
 function tick(){
  if(!drag?.active)return;
  const bounds=list.getBoundingClientRect();
  if(drag.x>=bounds.left&&drag.x<=bounds.right){
   const amount=drag.y<70?-Math.ceil((70-drag.y)/5):drag.y>innerHeight-70?Math.ceil((drag.y-innerHeight+70)/5):0;
   if(amount){window.scrollBy(0,Math.max(-20,Math.min(20,amount)));mark()}
  }
  drag.animation=requestAnimationFrame(tick);
 }
 function finish(commit){
  if(!drag)return;
  const {target,active,pointerId,animation,ghost}=drag;drag=null;
  if(active){lastTap=null;ignoreActivationUntil=performance.now()+500}
  cancelAnimationFrame(animation);clearMarks();row.classList.remove('is-dragging');ghost?.remove();document.body.classList.remove('playlist-dragging');
  document.removeEventListener('keydown',cancelKey);handle.removeEventListener('pointermove',move);handle.removeEventListener('pointerup',up);handle.removeEventListener('pointercancel',cancel);handle.removeEventListener('lostpointercapture',cancel);
  try{handle.releasePointerCapture(pointerId)}catch{}
  if(commit&&active&&target!==null&&canMove())onMove(index,target);
 }
 function cancelKey(event){if(event.key==='Escape'){event.preventDefault();finish(false)}}
 function cancel(){finish(false)}
 function up(event){
  const tap=drag&&!drag.active;finish(true);
  if(tap&&onActivate&&event.pointerType!=='mouse'){
   const now=performance.now();
   if(lastTap&&now-lastTap.time<450&&Math.hypot(event.clientX-lastTap.x,event.clientY-lastTap.y)<24){lastTap=null;if(canMove())onActivate()}
   else lastTap={time:now,x:event.clientX,y:event.clientY};
  }
 }
 function move(event){
  if(!drag||event.pointerId!==drag.pointerId)return;
  drag.x=event.clientX;drag.y=event.clientY;
  if(!drag.active&&Math.hypot(drag.x-drag.startX,drag.y-drag.startY)>6){
   drag.active=true;row.classList.add('is-dragging');document.body.classList.add('playlist-dragging');
   drag.ghost=document.createElement('div');drag.ghost.className='drag-label';drag.ghost.textContent=label;drag.ghost.setAttribute('aria-hidden','true');
   const picture=row.querySelector('.gallery-thumb img');
   if(list.classList.contains('is-gallery')&&picture){drag.ghost.classList.add('drag-image');drag.ghost.textContent='';const copy=picture.cloneNode();copy.draggable=false;const caption=document.createElement('span');caption.textContent=label;drag.ghost.append(copy,caption)}
   document.body.append(drag.ghost);tick();
  }
  if(drag.active){event.preventDefault();const ghost=drag.ghost.getBoundingClientRect();drag.ghost.style.left=`${Math.max(8,Math.min(drag.x+14,innerWidth-ghost.width-8))}px`;drag.ghost.style.top=`${Math.max(8,Math.min(drag.y+14,innerHeight-ghost.height-8))}px`;mark()}
 }
 handle.addEventListener('pointerdown',event=>{
  if(drag||!event.isPrimary||event.button!==0||!canMove())return;
  event.preventDefault();handle.focus({preventScroll:true});
  drag={pointerId:event.pointerId,startX:event.clientX,startY:event.clientY,x:event.clientX,y:event.clientY,target:null,active:false};
  handle.addEventListener('pointermove',move);handle.addEventListener('pointerup',up);handle.addEventListener('pointercancel',cancel);handle.addEventListener('lostpointercapture',cancel);document.addEventListener('keydown',cancelKey);
  try{handle.setPointerCapture(event.pointerId)}catch{}
 });
 handle.addEventListener('dblclick',event=>{if(onActivate&&canMove()&&performance.now()>=ignoreActivationUntil){event.preventDefault();onActivate()}});
 handle.addEventListener('keydown',event=>{
  if(drag||!canMove())return;
  if(onActivate&&['Enter',' '].includes(event.key)){event.preventDefault();onActivate();return}
  const to=event.key==='ArrowUp'?index-1:event.key==='ArrowDown'?index+1:null;
  if(to!==null){event.preventDefault();onMove(index,to)}
 });
}

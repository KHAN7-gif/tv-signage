import {driveImage,driveVideo} from './media-links.js?v=portrait-2';

// Drive preview iframes cannot guarantee silence. Use a muted native video instead.
export function createPortraitPlayer(panel){
 let generation=0,timer,dispose=()=>{};
 function placeholder(title,detail){
  const box=document.createElement('div');box.className='placeholder';
  const label=document.createElement('span');label.textContent=title;
  const note=document.createElement('small');note.textContent=detail;box.append(label,note);panel.replaceChildren(box);
 }
 return function play(items){
  const session=++generation;clearTimeout(timer);dispose();dispose=()=>{};
  if(!items.length){placeholder('9:16','Tambah imej atau video di panel admin');return}
  let index=0,attempt=0;
  function next(){
   clearTimeout(timer);dispose();dispose=()=>{};
   if(session!==generation)return;
   const request=++attempt,item=items[index++%items.length];
   const active=()=>session===generation&&request===attempt;
   placeholder('9:16',item.type==='video'?'Memuatkan video…':'Memuatkan imej…');
   const schedule=ms=>{clearTimeout(timer);timer=setTimeout(()=>{if(active())next()},ms)};
   const fail=()=>{if(!active())return;dispose();placeholder('Media tidak dapat dibuka','Semak akses Google Drive dan benarkan muat turun. Video mestilah MP4 yang boleh dimainkan pada TV.');schedule(items.length>1?3000:30000)};
   if(item.type==='video'){
    const video=document.createElement('video');
    video.muted=true;video.defaultMuted=true;video.setAttribute('muted','');
    video.autoplay=true;video.playsInline=true;video.controls=false;video.preload='auto';
    video.setAttribute('aria-label','Video Google Drive tanpa audio');
    const silence=()=>{if(!video.muted)video.muted=true};
    video.addEventListener('volumechange',silence);
    video.onplaying=()=>{if(!active())return;silence();panel.replaceChildren(video);schedule(Number.isFinite(video.duration)?Math.max(1000,(video.duration-video.currentTime+5)*1000):300000)};
    video.onended=()=>{if(active())next()};video.onerror=fail;
    video.onwaiting=()=>{if(active())schedule(30000)};
    dispose=()=>{video.onplaying=video.onended=video.onerror=video.onwaiting=null;video.removeEventListener('volumechange',silence);video.pause();video.removeAttribute('src');video.load()};
    schedule(30000);video.src=driveVideo(item.url);
    const pending=video.play();pending?.catch(fail);
   }else{
    const img=document.createElement('img');img.alt='Imej paparan menegak';img.referrerPolicy='no-referrer';
    img.onload=()=>{if(!active())return;panel.replaceChildren(img);schedule(item.duration*1000)};
    img.onerror=fail;dispose=()=>{img.onload=img.onerror=null;img.removeAttribute('src')};
    schedule(15000);img.src=driveImage(item.url);
   }
  }
  next();
 };
}

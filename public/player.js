import {readConfig} from './github.js';
import {youtubeEmbed,driveImage,validateConfig} from './media-links.js?v=playlist-1';
const $=id=>document.getElementById(id);
const embedded=new URLSearchParams(location.search).get('embed')==='1';
if(embedded)document.body.classList.add('embedded');
let current={videos:null,images:null,ticker:null},video,imageTimer,imageGeneration=0;
function placeholder(id,title,detail,error=false){const panel=document.createElement('div');panel.className='placeholder'+(error?' error':'');const label=document.createElement('span');label.textContent=title;const note=document.createElement('small');note.textContent=detail;panel.append(label,note);$(id).replaceChildren(panel)}
function playImages(images){
 clearTimeout(imageTimer);const generation=++imageGeneration;let index=0,attempt=0;
 if(!images.length){placeholder('portrait','9:16','Tambah imej di panel admin');return}
 placeholder('portrait','9:16','Memuatkan imej…');
 function next(){
  clearTimeout(imageTimer);const request=++attempt,item=images[index++%images.length];const img=document.createElement('img');img.alt='Imej paparan menegak';img.referrerPolicy='no-referrer';
  const active=()=>generation===imageGeneration&&request===attempt;
  img.onload=()=>{if(!active())return;clearTimeout(imageTimer);$('portrait').replaceChildren(img);imageTimer=setTimeout(next,item.duration*1000)};
  img.onerror=()=>{if(!active())return;clearTimeout(imageTimer);if(!$('portrait').querySelector('img'))placeholder('portrait','Imej tidak dapat dibuka','Semak pautan dan akses “Anyone with the link” di Google Drive.',true);imageTimer=setTimeout(next,images.length>1?3000:30000)};
  imageTimer=setTimeout(()=>{if(active())next()},15000);img.src=driveImage(item.url);
 }
 next();
}
function apply(config){
 if(JSON.stringify(current.videos)!==JSON.stringify(config.videos)){
  if(config.videos.length){const urls=config.videos.map(item=>item.url);video=document.createElement('iframe');video.title='Senarai video YouTube';video.allow='autoplay; encrypted-media; fullscreen; picture-in-picture';video.allowFullscreen=true;video.referrerPolicy='strict-origin-when-cross-origin';video.src=youtubeEmbed(urls[0],location.origin,urls);$('landscape').replaceChildren(video)}
  else{video=null;placeholder('landscape','16:9','Tambah video di panel admin')}
 }
 if(JSON.stringify(current.images)!==JSON.stringify(config.images))playImages(config.images);
 if(current.ticker!==config.ticker)$('ticker').textContent=config.ticker;
 current=config;
}
let syncing=false;
async function sync(){if(syncing)return;syncing=true;try{apply(validateConfig(await readConfig()));$('status').textContent=''}catch(error){$('status').textContent='Tetapan tidak dapat dimuatkan. Mencuba semula.'}finally{syncing=false}}
$('start').onclick=async()=>{try{await document.documentElement.requestFullscreen()}catch{}video?.contentWindow?.postMessage(JSON.stringify({event:'command',func:'playVideo',args:[]}), 'https://www.youtube-nocookie.com');try{await navigator.wakeLock?.request('screen')}catch{}};
window.addEventListener('message',event=>{if(event.origin!=='https://www.youtube-nocookie.com'||event.source!==video?.contentWindow)return;let message;try{message=typeof event.data==='string'?JSON.parse(event.data):event.data}catch{return}if(message?.event==='onError')$('status').textContent='Video ini tidak boleh dimainkan. Semak pautan dan kebenaran embedding YouTube.'});
let controlsTimer;function reveal(){document.body.classList.add('controls-visible');clearTimeout(controlsTimer);controlsTimer=setTimeout(()=>document.body.classList.remove('controls-visible'),2500)}
for(const event of ['pointermove','pointerdown','keydown'])document.addEventListener(event,reveal);
reveal();sync();setInterval(sync,15000);

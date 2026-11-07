import {readConfig} from './github.js';
import {youtubeEmbed,driveImage,validateConfig} from './media-links.js';
const $=id=>document.getElementById(id);
const embedded=new URLSearchParams(location.search).get('embed')==='1';
if(embedded)document.body.classList.add('embedded');
let current={youtubeUrl:null,driveImageUrl:null,ticker:null};let video;
function placeholder(id,title,detail,error=false){const panel=document.createElement('div');panel.className='placeholder'+(error?' error':'');const label=document.createElement('span');label.textContent=title;const note=document.createElement('small');note.textContent=detail;panel.append(label,note);$(id).replaceChildren(panel)}
function apply(config){
 if(current.youtubeUrl!==config.youtubeUrl){
  if(config.youtubeUrl){video=document.createElement('iframe');video.title='Video YouTube';video.allow='autoplay; encrypted-media; fullscreen; picture-in-picture';video.allowFullscreen=true;video.referrerPolicy='strict-origin-when-cross-origin';video.src=youtubeEmbed(config.youtubeUrl,location.origin);$('landscape').replaceChildren(video)}
  else{video=null;placeholder('landscape','16:9','Tetapkan video di panel admin')}
 }
 if(current.driveImageUrl!==config.driveImageUrl){
  if(config.driveImageUrl){const img=document.createElement('img');img.alt='Imej paparan menegak';img.referrerPolicy='no-referrer';img.onerror=()=>placeholder('portrait','Imej tidak dapat dibuka','Semak pautan dan akses “Anyone with the link” di Google Drive.',true);img.src=driveImage(config.driveImageUrl);$('portrait').replaceChildren(img)}
  else placeholder('portrait','9:16','Tetapkan imej di panel admin');
 }
 if(current.ticker!==config.ticker)$('ticker').textContent=config.ticker;
 current=config;
}
let syncing=false;
async function sync(){if(syncing)return;syncing=true;try{apply(validateConfig(await readConfig()));$('status').textContent=''}catch(error){$('status').textContent='Tetapan tidak dapat dimuatkan. Mencuba semula.'}finally{syncing=false}}
$('start').onclick=async()=>{try{await document.documentElement.requestFullscreen()}catch{}video?.contentWindow?.postMessage(JSON.stringify({event:'command',func:'playVideo',args:[]}), 'https://www.youtube-nocookie.com');try{await navigator.wakeLock?.request('screen')}catch{}};
// Origin checks ensure only the configured YouTube frame can send player events.
window.addEventListener('message',event=>{if(event.origin!=='https://www.youtube-nocookie.com'||event.source!==video?.contentWindow)return;let message;try{message=typeof event.data==='string'?JSON.parse(event.data):event.data}catch{return}if(message?.event==='onError')$('status').textContent='Video ini tidak boleh dimainkan. Pilih video YouTube yang membenarkan embedding.'});
let controlsTimer;function reveal(){document.body.classList.add('controls-visible');clearTimeout(controlsTimer);controlsTimer=setTimeout(()=>document.body.classList.remove('controls-visible'),2500)}
for(const event of ['pointermove','pointerdown','keydown'])document.addEventListener(event,reveal);
reveal();sync();setInterval(sync,15000);

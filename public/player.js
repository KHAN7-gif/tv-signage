import {readConfig} from './github.js';
import {youtubeEmbed,validateConfig} from './media-links.js?v=portrait-2';
import {createPortraitPlayer} from './portrait-player.js?v=portrait-2';
const $=id=>document.getElementById(id);
const embedded=new URLSearchParams(location.search).get('embed')==='1';
if(embedded)document.body.classList.add('embedded');
let current={videos:null,images:null,ticker:null},video;
function placeholder(id,title,detail,error=false){const panel=document.createElement('div');panel.className='placeholder'+(error?' error':'');const label=document.createElement('span');label.textContent=title;const note=document.createElement('small');note.textContent=detail;panel.append(label,note);$(id).replaceChildren(panel)}
const playImages=createPortraitPlayer($('portrait'));
function apply(config){
 if(JSON.stringify(current.videos)!==JSON.stringify(config.videos)){
  if(config.videos.length){const urls=config.videos.map(item=>item.url);video=document.createElement('iframe');video.title='Senarai video YouTube';video.allow='autoplay; encrypted-media; fullscreen; picture-in-picture';video.allowFullscreen=true;video.referrerPolicy='strict-origin-when-cross-origin';video.src=youtubeEmbed(urls[0],location.origin,urls,embedded);$('landscape').replaceChildren(video)}
  else{video=null;placeholder('landscape','16:9','Tambah video di panel admin')}
 }
 if(JSON.stringify(current.images)!==JSON.stringify(config.images))playImages(config.images);
 if(current.ticker!==config.ticker)$('ticker').textContent=config.ticker;
 current=config;
}
let syncing=false;
async function sync(){if(syncing)return;syncing=true;try{apply(validateConfig(await readConfig()));$('status').textContent=''}catch(error){$('status').textContent='Tetapan tidak dapat dimuatkan. Mencuba semula.'}finally{syncing=false}}
function enableAudio(){
 if(embedded)return;
 for(const [func,args] of [['unMute',[]],['setVolume',[100]],['playVideo',[]]])video?.contentWindow?.postMessage(JSON.stringify({event:'command',func,args}), 'https://www.youtube-nocookie.com');
}
$('audio').onclick=enableAudio;
$('start').onclick=async()=>{enableAudio();try{await document.documentElement.requestFullscreen()}catch{}try{await navigator.wakeLock?.request('screen')}catch{}};
window.addEventListener('message',event=>{if(event.origin!=='https://www.youtube-nocookie.com'||event.source!==video?.contentWindow)return;let message;try{message=typeof event.data==='string'?JSON.parse(event.data):event.data}catch{return}if(message?.event==='onError')$('status').textContent='Video ini tidak boleh dimainkan. Semak pautan dan kebenaran embedding YouTube.'});
let controlsTimer;function reveal(){document.body.classList.add('controls-visible');clearTimeout(controlsTimer);controlsTimer=setTimeout(()=>document.body.classList.remove('controls-visible'),2500)}
for(const event of ['pointermove','pointerdown','keydown'])document.addEventListener(event,reveal);
reveal();sync();setInterval(sync,15000);

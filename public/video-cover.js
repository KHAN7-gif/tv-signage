import {youtubeId} from './media-links.js?v=covers-2';

// Use the player's actual video and playlist position, never an estimated duration.
export function playingVideo(videos,videoId,index,playlist){
 if(!videoId)return null;
 const ids=videos.map(item=>youtubeId(item.url));
 const matches=offset=>Array.isArray(playlist)&&playlist.length===ids.length-offset&&playlist.every((id,i)=>id===ids[i+offset]);
 const offset=matches(0)?0:matches(1)?1:null;
 if(offset!==null&&Number.isInteger(index)&&index>=0&&ids[index+offset]===videoId)return videos[index+offset];
 return videos.find((item,i)=>ids[i]===videoId)||null;
}
export function videoLabel(item){return item?.isNew?'NEW':item?.comingSoon?'COMING SOON':''}
let apiPromise,sequence=0;
function youtubeApi(){
 if(window.YT?.Player)return Promise.resolve(window.YT);
 if(apiPromise)return apiPromise;
 apiPromise=new Promise((resolve,reject)=>{
  const script=document.createElement('script');script.src='https://www.youtube.com/iframe_api';
  const previous=window.onYouTubeIframeAPIReady;
  const fail=()=>{clearTimeout(timer);script.remove();window.onYouTubeIframeAPIReady=previous;apiPromise=null;reject(Error('YouTube API unavailable'))};
  const timer=setTimeout(fail,15000);
  window.onYouTubeIframeAPIReady=()=>{clearTimeout(timer);window.onYouTubeIframeAPIReady=previous;resolve(window.YT);if(typeof previous==='function')previous()};
  script.onerror=fail;document.head.append(script);
 });
 return apiPromise;
}
export function createVideoCover(frame,panel){
 let videos=[],player,starting=false,disposed=false,timer,request=0,activeKey='';
 const box=document.createElement('aside');box.className='video-cover';box.hidden=true;box.setAttribute('aria-label','Cover video semasa');panel.append(box);
 function hide(){box.hidden=true;activeKey='';request++;box.replaceChildren()}
 function currentItem(){
  if(!player)return null;
  try{
   if(![1,2,5].includes(player.getPlayerState()))return null;
   const id=typeof player.getVideoUrl==='function'?youtubeId(player.getVideoUrl()):player.getVideoData()?.video_id;
   return playingVideo(videos,id,player.getPlaylistIndex(),player.getPlaylist());
  }catch{return null}
 }
 function sync(){
  if(disposed)return;
  const item=currentItem();
  if(!item){hide();return}
  const url=item.coverUrl||'',badge=videoLabel(item);
  if(!url&&!badge){hide();return}
  const key=JSON.stringify([url,badge]);if(activeKey===key)return;
  hide();activeKey=key;const version=++request;
  if(badge){const label=document.createElement('span');label.className='video-badge '+(badge==='NEW'?'new-release':'coming-soon');label.textContent=badge;box.append(label);box.hidden=false}
  if(!url)return;
  const image=document.createElement('img');image.alt='Cover game untuk video semasa';image.referrerPolicy='no-referrer';
  image.onload=()=>{
   const active=currentItem();
   if(disposed||version!==request||active?.coverUrl!==url||videoLabel(active)!==badge)return;
   const art=document.createElement('div');art.className='video-cover-art';art.append(image);box.append(art);box.hidden=false;
  };
  image.onerror=()=>{if(version===request)box.hidden=!badge};image.src=url;
 }
 async function start(){
  if(starting||player||disposed||!videos.some(item=>item.coverUrl||item.comingSoon||item.isNew))return;
  starting=true;
  try{
   const YT=await youtubeApi();if(disposed)return;
   frame.id=`youtube-cover-player-${++sequence}`;
   player=new YT.Player(frame.id,{events:{
    onReady:event=>{if(disposed)return;player=event.target;sync();timer=setInterval(sync,1000)},
    onStateChange:()=>sync(),onError:()=>hide()
   }});
  }catch{hide()}finally{starting=false}
 }
 return {
  update(items){videos=items;sync();start()},
  destroy(){disposed=true;clearInterval(timer);hide();box.remove();try{player?.destroy()}catch{}}
 };
}

export function youtubeId(value) {
 if(!value)return '';
 let url;try{url=new URL(value)}catch{throw Error('Pautan YouTube tidak sah.')}
 if(url.protocol!=='https:')throw Error('Gunakan pautan YouTube HTTPS.');
 const host=url.hostname.toLowerCase();let id;
 if(host==='youtu.be')id=url.pathname.split('/')[1];
 else if(['youtube.com','www.youtube.com','m.youtube.com','youtube-nocookie.com','www.youtube-nocookie.com'].includes(host)){
  id=url.pathname==='/watch'?url.searchParams.get('v'):/^\/(embed|shorts|live)\/([^/]+)/.exec(url.pathname)?.[2];
 }
 if(!id||! /^[\w-]{11}$/.test(id))throw Error('Gunakan pautan video YouTube, bukan channel atau playlist.');
 return id;
}
export function youtubeEmbed(value,origin,playlist=[value],muted=false) {
 const id=youtubeId(value);if(!id)return '';
 const url=new URL(`https://www.youtube-nocookie.com/embed/${id}`);
 for(const [key,val]of Object.entries({autoplay:'1',mute:muted?'1':'0',loop:'1',playlist:(playlist.length>1?playlist.slice(1):playlist).map(youtubeId).join(','),playsinline:'1',rel:'0',controls:'1',enablejsapi:'1',origin}))url.searchParams.set(key,val);
 return url.href;
}
export function driveImage(value) {
 if(!value)return '';
 let url;try{url=new URL(value)}catch{throw Error('Pautan Google Drive tidak sah.')}
 if(url.protocol!=='https:'||url.hostname!=='drive.google.com')throw Error('Gunakan pautan fail imej Google Drive HTTPS.');
 const id=/^\/file\/d\/([\w-]+)/.exec(url.pathname)?.[1]||url.searchParams.get('id');
 if(!id||! /^[\w-]{10,}$/.test(id)||url.pathname.includes('/folders/'))throw Error('Gunakan pautan satu fail imej, bukan folder Google Drive.');
 return `https://drive.google.com/thumbnail?id=${encodeURIComponent(id)}&sz=w1600`;
}
export function validateConfig(value) {
 if(!value||typeof value.ticker!=='string'||value.ticker.length>2000)throw Error('Tetapan paparan tidak sah.');
 const videos=Array.isArray(value.videos)?value.videos:typeof value.youtubeUrl==='string'?(value.youtubeUrl.trim()?[{url:value.youtubeUrl}]:[]):null;
 const images=Array.isArray(value.images)?value.images:typeof value.driveImageUrl==='string'?(value.driveImageUrl.trim()?[{url:value.driveImageUrl,duration:10}]:[]):null;
 if(!videos||!images||videos.length>100||images.length>100)throw Error('Maksimum 100 pautan bagi setiap senarai video atau imej.');
 if(value.festival!==undefined&&!['off','deepavali'].includes(value.festival))throw Error('Mod perayaan tidak sah.');
 return {
  ...(value.festival!==undefined?{festival:value.festival}:{}),
  videos:videos.map((item,i)=>{
   if(typeof item?.url!=='string'||!item.url.trim())throw Error(`Isi pautan Video ${i+1} atau padam baris tersebut.`);
   const url=item.url.trim();youtubeId(url);return {url};
  }),
  images:images.map((item,i)=>{
   if(typeof item?.url!=='string'||!item.url.trim())throw Error(`Isi pautan Imej ${i+1} atau padam baris tersebut.`);
   const url=item.url.trim();driveImage(url);const duration=item.duration??10;
   if(!Number.isInteger(duration)||duration<3||duration>300)throw Error(`Durasi Imej ${i+1} mestilah 3 hingga 300 saat.`);
   return {url,duration};
  }),
  ticker:value.ticker.trim()
 };
}

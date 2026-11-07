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
export function youtubeEmbed(value,origin) {
 const id=youtubeId(value);if(!id)return '';
 const url=new URL(`https://www.youtube-nocookie.com/embed/${id}`);
 for(const [key,val]of Object.entries({autoplay:'1',mute:'1',loop:'1',playlist:id,playsinline:'1',rel:'0',controls:'1',enablejsapi:'1',origin}))url.searchParams.set(key,val);
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
 if(!value||typeof value.youtubeUrl!=='string'||typeof value.driveImageUrl!=='string'||typeof value.ticker!=='string'||value.ticker.length>2000)throw Error('Tetapan paparan tidak sah.');
 const clean={youtubeUrl:value.youtubeUrl.trim(),driveImageUrl:value.driveImageUrl.trim(),ticker:value.ticker.trim()};
 youtubeId(clean.youtubeUrl);driveImage(clean.driveImageUrl);return clean;
}

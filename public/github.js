export const repository = 'KHAN7-gif/tv-signage';
const branch = 'main';
const base = `https://api.github.com/repos/${repository}/contents/`;
export const raw = `https://raw.githubusercontent.com/${repository}/${branch}/public/`;
export async function readConfig() {
 const response = await fetch(`${raw}config.json`, {cache:'no-store'});
 if (!response.ok) throw Error('Konfigurasi GitHub belum tersedia pada branch main.');
 return response.json();
}
async function request(path, token, options={}) {
 const response = await fetch(base+path, {...options,headers:{Accept:'application/vnd.github+json',Authorization:`Bearer ${token}`,'Content-Type':'application/json',...options.headers}});
 const data = await response.json();
 if (!response.ok) throw Error(response.status===409||response.status===422?'Fail berubah atau konflik. Muat semula sebelum menyimpan.':`GitHub: ${data.message || response.status}`);
 return data;
}
function encode(text) { const bytes = new TextEncoder().encode(text); let binary=''; for(let i=0;i<bytes.length;i+=32768)binary+=String.fromCharCode(...bytes.subarray(i,i+32768));return btoa(binary); }
export async function configVersion(token) {
 const file=await request('public/config.json?ref=main',token);
 const bytes=Uint8Array.from(atob(file.content.replace(/\s/g,'')),c=>c.charCodeAt(0));
 return {sha:file.sha,config:JSON.parse(new TextDecoder().decode(bytes))};
}
export async function saveConfig(config,token,sha) {
 if (!sha) throw Error('Sambungkan GitHub dahulu.');
 const result = await request('public/config.json',token,{method:'PUT',body:JSON.stringify({message:'Update TV signage playlist',branch,sha,content:encode(JSON.stringify(config,null,2)+'\n')})});
 return result.content.sha;
}
export async function uploadMedia(file,token) {
 if(file.size>20*1024*1024)throw Error('Maksimum 20 MB setiap fail untuk storan GitHub.');
 const ext={'image/jpeg':'jpg','image/png':'png','image/webp':'webp','video/mp4':'mp4','video/webm':'webm'}[file.type];
 if(!ext)throw Error('Format media tidak disokong.');
 const name=`${crypto.randomUUID()}.${ext}`;
 const bytes=new Uint8Array(await file.arrayBuffer());let binary='';for(let i=0;i<bytes.length;i+=32768)binary+=String.fromCharCode(...bytes.subarray(i,i+32768));
 await request(`public/media/${name}`,token,{method:'PUT',body:JSON.stringify({message:`Add signage media ${name}`,branch,content:btoa(binary)})});
 return {url:`${raw}media/${name}`,type:file.type.startsWith('video/')?'video':'image'};
}

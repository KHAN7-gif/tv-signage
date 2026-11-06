// Explicit demo mode: all data stays in this browser and never calls the cloud API.
export const isDemo = new URLSearchParams(location.search).get('demo') === '1';
const initial = () => ({landscape:[{url:'./assets/landscape.svg',type:'image',name:'Ruang untuk cerita anda'}],portrait:[{url:'./assets/portrait.svg',type:'image',name:'Sentiasa terkini'}],ticker:'Selamat datang • Ini ialah pratonton UI • Urus playlist anda dari iPhone',duration:10});
let database;
function db(){return database ||= new Promise((resolve,reject)=>{const request=indexedDB.open('signage-ui-demo',1);request.onupgradeneeded=()=>request.result.createObjectStore('data');request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(Error('Storan pelayar tidak tersedia.'))})}
async function access(mode,operation){const database=await db();return new Promise((resolve,reject)=>{const tx=database.transaction('data',mode);const request=operation(tx.objectStore('data'));tx.oncomplete=()=>resolve(request.result);tx.onerror=()=>reject(Error('Storan pelayar penuh atau tidak tersedia.'));tx.onabort=()=>reject(Error('Tidak dapat menyimpan media.'))})}
export async function readDemo(){return await access('readonly',store=>store.get('config')) || initial()}
export async function saveDemo(config){await access('readwrite',store=>store.put(config,'config'))}
export async function uploadDemo(file){const id=crypto.randomUUID();await access('readwrite',store=>store.put(file,id));return {url:`demo:${id}`,type:file.type.startsWith('video/')?'video':'image'}}
const urls=new Map();
export async function mediaSource(url){if(!url.startsWith('demo:'))return url;if(urls.has(url))return urls.get(url);const file=await access('readonly',store=>store.get(url.slice(5)));if(!file)throw Error('Media demo tidak ditemui.');const source=URL.createObjectURL(file);urls.set(url,source);return source}
window.addEventListener('pagehide',()=>{for(const url of urls.values())URL.revokeObjectURL(url);urls.clear()});

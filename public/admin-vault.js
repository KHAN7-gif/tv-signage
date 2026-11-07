// Password-based local credential vault. Only encrypted token material is persisted.
export const vaultKey='maida-signage:KHAN7-gif/tv-signage:admin-vault:v1';
const iterations=600000;
const encoder=new TextEncoder();
const aad=encoder.encode('maida-signage:KHAN7-gif/tv-signage:v1');
function cryptoApi(){if(!globalThis.crypto?.subtle)throw Error('Pelayar ini memerlukan HTTPS dan sokongan Web Crypto. Buka panel dalam Safari atau Chrome terkini.');return globalThis.crypto}
function base64(bytes){let text='';for(const b of bytes)text+=String.fromCharCode(b);return btoa(text)}
function bytes(text){if(typeof text!=='string'||text.length>8192)throw Error('Invalid vault');return Uint8Array.from(atob(text),c=>c.charCodeAt(0))}
async function key(password,salt,usage){
 const api=cryptoApi();const material=await api.subtle.importKey('raw',encoder.encode(password),'PBKDF2',false,['deriveKey']);
 return api.subtle.deriveKey({name:'PBKDF2',salt,iterations,hash:'SHA-256'},material,{name:'AES-GCM',length:256},false,[usage]);
}
export async function encryptToken(token,password){
 if(typeof password!=='string'||password.length<10)throw Error('Kata laluan mesti sekurang-kurangnya 10 aksara.');
 if(typeof token!=='string'||!token.trim()||token.length>2048)throw Error('Masukkan token GitHub untuk persediaan pertama.');
 const api=cryptoApi(),salt=api.getRandomValues(new Uint8Array(16)),iv=api.getRandomValues(new Uint8Array(12));
 const cipher=await api.subtle.encrypt({name:'AES-GCM',iv,additionalData:aad},await key(password,salt,'encrypt'),encoder.encode(token.trim()));
 return {version:1,iterations,salt:base64(salt),iv:base64(iv),ciphertext:base64(new Uint8Array(cipher))};
}
export async function decryptToken(record,password){
 cryptoApi();
 let salt,iv,cipher;
 try{
  if(record?.version!==1||record.iterations!==iterations)throw Error();
  salt=bytes(record.salt);iv=bytes(record.iv);cipher=bytes(record.ciphertext);
  if(salt.length!==16||iv.length!==12||cipher.length<17||cipher.length>4096)throw Error();
 }catch{throw Error('Akses tersimpan rosak. Gunakan Tetapkan semula akses untuk membuat persediaan semula.');}
 try{
  const plain=await crypto.subtle.decrypt({name:'AES-GCM',iv,additionalData:aad},await key(password,salt,'decrypt'),cipher);
  return new TextDecoder('utf-8',{fatal:true}).decode(plain);
 }catch{throw Error('Kata laluan tidak tepat atau akses tersimpan telah berubah.');}
}
export function hasStoredAccess(){return localStorage.getItem(vaultKey)!==null}
export function readStoredAccess(){try{return JSON.parse(localStorage.getItem(vaultKey))}catch{throw Error('Akses tersimpan rosak. Gunakan Tetapkan semula akses.')}}
export function storeAccess(record){try{localStorage.setItem(vaultKey,JSON.stringify(record))}catch{throw Error('Akses tidak dapat disimpan. Benarkan storan pelayar dan cuba semula.')}}
export function forgetAccess(){localStorage.removeItem(vaultKey)}
